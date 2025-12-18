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
  const userId = auth.user.sub

  // Step 2: Parse request body
  let body: { content?: unknown; parent_comment_id?: unknown }
  try {
    body = await request.json()
  } catch {
    return badRequest('Invalid request body')
  }

  const { content, parent_comment_id } = body

  // Step 3: Validate comment content
  const contentValidation = validateCommentContent(content)
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
      content: content.toString().trim(),
      status: 'pending',
      parent_comment_id: parent_comment_id || null,
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
 * Returns paginated list of approved comments
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params

  // Authentication is optional (public endpoint)
  // TODO: Parse query parameters (page, limit, sort)
  // TODO: Query approved comments for post
  // TODO: Include single-level nested replies
  // TODO: Return paginated results
  
  return NextResponse.json(
    { error: 'Not Implemented' },
    { status: 501 }
  )
}
