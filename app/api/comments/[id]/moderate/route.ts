// Generated from spec/api.md
// PATCH /api/comments/{id}/moderate - Moderate Comment

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, hasRole, forbidden, badRequest, notFound, conflict } from '@/lib/auth'
import { supabase } from '@/lib/db/supabase'

/**
 * PATCH - Moderate Comment
 * Authentication: Required (admin or editor for own posts)
 * Approves, rejects, or marks comment as spam
 *
 * Step-by-step flow:
 * 1. Authenticate user
 * 2. Parse and validate request body (status)
 * 3. Fetch comment and check it exists
 * 4. Check comment status is pending (409 if already moderated)
 * 5. Fetch post to verify permissions
 * 6. Check authorization (admin or comment author's editor)
 * 7. Update comment status with approved_at if approved
 * 8. Return updated comment
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: commentId } = await params

  // Step 1: Authenticate request
  const auth = await requireAuth(request)
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error.message },
      { status: auth.error.status }
    )
  }

  // Step 2: Parse and validate request body
  let body: { status?: unknown }
  try {
    body = await request.json()
  } catch {
    return badRequest('Invalid request body')
  }

  const { status } = body

  // Validate status is one of the allowed values
  if (!status || typeof status !== 'string') {
    return badRequest('Status is required')
  }

  const validStatuses = ['approved', 'rejected', 'spam']
  if (!validStatuses.includes(status)) {
    return badRequest(
      `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    )
  }

  // Step 3: Fetch comment by ID
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .select('id, post_id, author_id, content, status, created_at')
    .eq('id', commentId)
    .single()

  if (commentError || !comment) {
    return notFound('Comment not found')
  }

  // Step 4: Check comment status is pending (can only moderate pending comments)
  if (comment.status !== 'pending') {
    return conflict('Comment already moderated')
  }

  // Step 5: Fetch post to check ownership and get author info
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('id, author_id')
    .eq('id', comment.post_id)
    .single()

  if (postError || !post) {
    console.error('Post fetch error:', postError)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }

  // Step 6: Check authorization
  // Admin can moderate any comment, Editor can only moderate comments on their own posts
  const isAdmin = hasRole(auth.user, ['admin'])
  const isEditor = hasRole(auth.user, ['editor'])

  if (!isAdmin && !isEditor) {
    return forbidden('Only admins and editors can moderate comments')
  }

  // If editor, verify they own the post
  if (isEditor && !isAdmin) {
    if (post.author_id !== auth.user.id) {
      return forbidden(
        'Editors can only moderate comments on their own posts'
      )
    }
  }

  // Step 7: Update comment status
  const updateData: Record<string, unknown> = { status }

  // Set approved_at timestamp when approving
  if (status === 'approved') {
    updateData.approved_at = new Date().toISOString()
  }

  const { data: updatedComment, error: updateError } = await supabase
    .from('comments')
    .update(updateData)
    .eq('id', commentId)
    .select(
      'id, post_id, author_id, content, status, created_at, approved_at, users!author_id (id, email)'
    )
    .single()

  if (updateError || !updatedComment) {
    console.error('Comment update error:', updateError)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }

  // Step 8: Return 200 OK with moderation result
  // Response format varies based on status
  if (status === 'approved') {
    return NextResponse.json({
      id: updatedComment.id,
      post_id: updatedComment.post_id,
      author: {
        id: (updatedComment.users as any)?.[0]?.id || '',
        email: (updatedComment.users as any)?.[0]?.email || '',
      },
      content: updatedComment.content,
      status: updatedComment.status,
      created_at: updatedComment.created_at,
      approved_at: updatedComment.approved_at,
    })
  }

  // For rejected or spam: return minimal response
  return NextResponse.json({
    id: updatedComment.id,
    post_id: updatedComment.post_id,
    content: updatedComment.content,
    status: updatedComment.status,
  })
}
