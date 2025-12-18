// Generated from spec/api.md
// POST /api/posts/{id}/comments - Submit Comment
// GET /api/posts/{id}/comments - List Approved Comments

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, badRequest, notFound } from '@/lib/auth'
import { supabase } from '@/lib/db/supabase'
import {
  validateCommentContent,
  validateParentCommentId,
} from '@/lib/comments/validation'

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
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('id, status')
    .eq('id', postId)
    .single()

  if (postError || !post) {
    return notFound('Post not found')
  }

  if (post.status !== 'published') {
    return notFound('Post not found')
  }

  // Step 6: Verify parent comment if provided
  if (parent_comment_id) {
    const { data: parentComment, error: parentError } = await supabase
      .from('comments')
      .select('id, status')
      .eq('id', parent_comment_id)
      .eq('post_id', postId)
      .single()

    if (parentError || !parentComment) {
      return notFound('Parent comment not found')
    }

    if (parentComment.status !== 'approved') {
      return notFound('Parent comment not found')
    }
  }

  // Step 7: Create comment with status=pending
  const { data: comment, error: createError } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: userId,
      content: (content as string).trim(),
      status: 'pending',
      parent_comment_id: (typeof parent_comment_id === 'string' ? parent_comment_id : null) || null,
    })
    .select('id, post_id, author_id, content, status, parent_comment_id, created_at, approved_at')
    .single()

  if (createError || !comment) {
    console.error('Comment creation error:', createError)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }

  // Fetch author details for response
  const { data: author, error: authorError } = await supabase
    .from('users')
    .select('id, email')
    .eq('id', userId)
    .single()

  if (authorError || !author) {
    console.error('Author fetch error:', authorError)
    return NextResponse.json(
      { error: 'Failed to fetch author details' },
      { status: 500 }
    )
  }

  // Return 201 Created with comment details
  return NextResponse.json(
    {
      id: comment.id,
      post_id: comment.post_id,
      author: {
        id: author.id,
        email: author.email,
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
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('id, status')
    .eq('id', postId)
    .single()

  if (postError || !post) {
    return notFound('Post not found')
  }

  if (post.status !== 'published') {
    return notFound('Post not found')
  }

  // Step 3: Fetch approved top-level comments (paginated)
  // SORTING BEHAVIOR: The 'sort' parameter affects only top-level comments.
  // Nested replies are always ordered oldest-first (created_at ASC) for consistency.
  const offset = (page - 1) * limit

  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select(
      'id, post_id, author_id, content, status, parent_comment_id, created_at, users!author_id (id, email)'
    )
    .eq('post_id', postId)
    .eq('status', 'approved')
    .is('parent_comment_id', null)
    .order('created_at', { ascending: sort === 'oldest' })
    .range(offset, offset + limit - 1)

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
      const { data: replies, error: repliesError } = await supabase
        .from('comments')
        .select(
          'id, author_id, content, created_at, users!author_id (id, email)'
        )
        .eq('post_id', postId)
        .eq('parent_comment_id', comment.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: true })

      if (repliesError) {
        console.error('Replies fetch error:', repliesError)
        // PARTIAL FAILURE HANDLING: Return top-level comment with empty replies
        // Rationale: Top-level comments are primary content; replies are secondary.
        // A failure to fetch replies should not prevent showing the main comment.
        // Client can retry fetching replies separately if needed.
        return {
          id: comment.id,
          post_id: comment.post_id,
          author: {
            id: comment.users?.[0]?.id || '',
            email: comment.users?.[0]?.email || '',
          },
          content: comment.content,
          status: comment.status,
          parent_comment_id: comment.parent_comment_id,
          created_at: comment.created_at,
          replies: [],
        }
      }

      return {
        id: comment.id,
        post_id: comment.post_id,
        author: {
          id: comment.users?.[0]?.id || '',
          email: comment.users?.[0]?.email || '',
        },
        content: comment.content,
        status: comment.status,
        parent_comment_id: comment.parent_comment_id,
        created_at: comment.created_at,
        replies:
          (replies || []).map((reply: ReplyData) => ({
            id: reply.id,
            author: {
              id: reply.users?.[0]?.id || '',
              email: reply.users?.[0]?.email || '',
            },
            content: reply.content,
            created_at: reply.created_at,
          })) || [],
      }
    })
  )

  // Step 5: Get total count for pagination
  const { count: totalCount, error: countError } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId)
    .eq('status', 'approved')
    .is('parent_comment_id', null)

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
