// Generated from spec/api.md
// POST /api/posts/{id}/comments - Submit Comment
// GET /api/posts/{id}/comments - List Approved Comments

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, badRequest, notFound } from '@/lib/auth'
import {
  validateCommentContent,
  validateParentCommentId,
} from '@/lib/comments/validation'
import {
  getPublishedPost,
  getApprovedComment,
  createPendingComment,
  listApprovedTopLevelComments,
  countApprovedTopLevelComments,
  getApprovedReplies,
  formatCommentWithReplies,
} from '@/lib/comments/persistence'

/**
 * POST - Submit Comment
 * Authentication: Required (viewer, editor, admin)
 * Creates a new comment in pending state
 *
 * Step-by-step flow:
 * 1. Authenticate user
 * 2. Parse request body
 * 3. Validate comment content (1-5000 chars, required)
 * 4. Validate parent_comment_id format if provided
 * 5. Check post exists and is published
 * 6. Check parent comment exists and is approved (if provided)
 * 7. Create comment with status=pending
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params

  // Step 1: Authenticate request
  const auth = await requireAuth(request)
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error.message },
      { status: auth.error.status }
    )
  }

  // All authenticated roles can submit comments (viewer, editor, admin)
  const userId = auth.user.id

  // Step 2: Parse request body
  let body: { content?: unknown; parent_comment_id?: unknown }
  try {
    body = await request.json()
  } catch {
    return badRequest('Invalid request body')
  }

  const { content, parent_comment_id } = body

  // Step 3: Validate comment content
  const contentValidation = validateCommentContent(
    typeof content === 'string' ? content : undefined
  )
  if (!contentValidation.valid) {
    return badRequest(contentValidation.error || 'Invalid content')
  }

  // Step 4: Validate parent_comment_id format if provided
  const parentIdValidation = validateParentCommentId(parent_comment_id)
  if (!parentIdValidation.valid) {
    return badRequest(parentIdValidation.error || 'Invalid parent comment ID')
  }

  // Step 5: Verify post exists and is published
  const { data: post, error: postError } = await getPublishedPost(postId)

  if (postError || !post) {
    return notFound('Post not found')
  }

  if (post.status !== 'published') {
    return notFound('Post not found')
  }

  // Step 6: Verify parent comment if provided
  if (parent_comment_id) {
    const { data: parentComment, error: parentError } = await getApprovedComment(
      parent_comment_id as string,
      postId
    )

    if (parentError || !parentComment) {
      return notFound('Parent comment not found')
    }

    if (parentComment.status !== 'approved') {
      return notFound('Parent comment not found')
    }
  }

  // Step 7: Create comment with status=pending (via persistence layer)
  const { data: comment, error: createError } = await createPendingComment({
    post_id: postId,
    author_id: userId,
    content: (content as string).trim(),
    parent_comment_id: (typeof parent_comment_id === 'string' ? parent_comment_id : null) || null,
  })

  if (createError || !comment) {
    console.error('Comment creation error:', createError)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }

  // Extract author from response (joined users table)
  const commentUsers = comment.users as Array<{ id: string; email: string }> | undefined
  const author = Array.isArray(commentUsers) ? commentUsers[0] : undefined

  // Return 201 Created with comment details
  return NextResponse.json(
    {
      id: comment.id,
      post_id: comment.post_id,
      author: {
        id: author?.id || '',
        email: author?.email || '',
      },
      content: comment.content,
      status: comment.status,
      parent_comment_id: comment.parent_comment_id,
      created_at: comment.created_at,
      approved_at: comment.approved_at,
    },
    { status: 201 }
  )
}

/**
 * GET - List Approved Comments
 * Authentication: Optional (public)
 * Returns paginated list of approved comments with nested replies
 *
 * Step-by-step flow:
 * 1. Parse query parameters (page, limit, sort)
 * 2. Validate post exists and is published
 * 3. Fetch approved top-level comments (parent_comment_id IS NULL)
 * 4. For each comment, fetch approved replies
 * 5. Apply pagination and return results
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params

  // Step 1: Parse query parameters
  const url = new URL(request.url)
  const pageParam = url.searchParams.get('page')
  const limitParam = url.searchParams.get('limit')
  const sortParam = url.searchParams.get('sort')

  // Validate and set defaults
  let page = 1
  let limit = 20
  let sort: 'oldest' | 'newest' = 'oldest'

  if (pageParam) {
    const parsed = parseInt(pageParam, 10)
    if (!isNaN(parsed) && parsed > 0) {
      page = parsed
    }
  }

  if (limitParam) {
    const parsed = parseInt(limitParam, 10)
    if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
      limit = parsed
    } else if (!isNaN(parsed) && parsed > 100) {
      limit = 100 // Cap at 100
    }
  }

  if (sortParam === 'newest' || sortParam === 'oldest') {
    sort = sortParam
  }

  // Step 2: Verify post exists and is published
  const { data: post, error: postError } = await getPublishedPost(postId)

  if (postError || !post) {
    return notFound('Post not found')
  }

  if (post.status !== 'published') {
    return notFound('Post not found')
  }

  // Step 3: Fetch approved top-level comments (paginated) via persistence layer
  const offset = (page - 1) * limit

  const { data: comments, error: commentsError } = await listApprovedTopLevelComments(
    postId,
    offset,
    limit,
    sort === 'newest' ? 'desc' : 'asc'
  )

  if (commentsError) {
    console.error('Comments fetch error:', commentsError)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }

  // Step 4: For each comment, fetch approved replies
  // NOTE: N+1 Query Pattern (Intentional in v1)
  // Rationale: Replies are typically sparse (1-5 per comment in most posts).
  // Single batch query with JOINs is more complex; N+1 is acceptable for:
  //   - Low comment volume per post (typical: 5-50 comments)
  //   - Simpler code and clearer business logic
  //   - Better partial failure isolation (comment fails, replies return empty)
  // Future optimization: Implement batch loading in v2 if comment volume increases
  interface CommentData {
    id: string
    post_id: string
    author_id: string
    content: string
    status: string
    parent_comment_id: string | null
    created_at: string
    users: Array<{ id: string; email: string }>
  }

  interface ReplyData {
    id: string
    author_id: string
    content: string
    created_at: string
    users: Array<{ id: string; email: string }>
  }

  const commentsWithReplies = await Promise.all(
    (comments || []).map(async (comment: CommentData) => {
      const { data: replies, error: repliesError } = await getApprovedReplies(
        postId,
        comment.id
      )

      if (repliesError) {
        console.error('Replies fetch error:', repliesError)
        // PARTIAL FAILURE HANDLING: Return top-level comment with empty replies
        // Rationale: Top-level comments are primary content; replies are secondary.
        // A failure to fetch replies should not prevent showing the main comment.
        // Client can retry fetching replies separately if needed.
        return formatCommentWithReplies(comment as unknown as Record<string, unknown>)
      }

      const formattedReplies = (replies || []).map((reply: ReplyData) => ({
        id: reply.id,
        author: {
          id: (Array.isArray(reply.users) ? reply.users[0] : reply.users)?.id || '',
          email: (Array.isArray(reply.users) ? reply.users[0] : reply.users)?.email || '',
        },
        content: reply.content,
        created_at: reply.created_at,
      }))

      return formatCommentWithReplies(comment as unknown as Record<string, unknown>, formattedReplies)
    })
  )

  // Step 5: Get total count for pagination
  const { count: totalCount, error: countError } = await countApprovedTopLevelComments(
    postId
  )

  if (countError) {
    console.error('Count error:', countError)
    return NextResponse.json(
      { error: 'Failed to fetch comment count' },
      { status: 500 }
    )
  }

  const total = totalCount || 0
  // PAGINATION EDGE CASE: When total = 0, totalPages = 0 (not 1)
  // Rationale: Indicates 'no comments exist', not 'results span 1 page'.
  // Client should display empty state when total = 0.
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit)

  // Return 200 OK with paginated response
  return NextResponse.json({
    data: commentsWithReplies,
    pagination: {
      page,
      limit,
      total,
      total_pages: totalPages,
    },
  })
}
