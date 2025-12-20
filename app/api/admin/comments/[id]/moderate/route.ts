// C3.7 – Moderate Comment (Admin/Editor)
// Specification: spec/api.md / spec/flows/admin-moderate-comments.md

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, hasRole, forbidden, badRequest, notFound, conflict } from '@/lib/auth'
import {
  getCommentById,
  getPostForOwnershipCheck,
  moderateComment,
  formatApprovedComment,
  formatRejectedComment,
} from '@/lib/comments/persistence'

/**
 * PATCH /api/admin/comments/{id}/moderate
 *
 * Moderate a pending comment (approve, reject, or mark as spam)
 *
 * Authentication: REQUIRED
 * Allowed roles: admin, or editor (for comments on own posts)
 *
 * Request body:
 * {
 *   "status": "approved" | "rejected" | "spam"
 * }
 *
 * Response (200 OK):
 * Approved:
 * {
 *   "id": "uuid",
 *   "status": "approved",
 *   "approved_at": "ISO-8601"
 * }
 *
 * Rejected/Spam:
 * {
 *   "id": "uuid",
 *   "status": "rejected" | "spam"
 * }
 *
 * Errors:
 * - 400 Bad Request: Invalid status value
 * - 401 Unauthorized: Missing or invalid token
 * - 403 Forbidden: User is not admin or not editor of post
 * - 404 Not Found: Comment not found
 * - 409 Conflict: Comment already moderated (status ≠ pending)
 * - 500 Internal Server Error: Database error
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

  // Step 3: Fetch comment by ID (via persistence layer)
  const { data: comment, error: commentError } = await getCommentById(commentId)

  if (commentError || !comment) {
    return notFound('Comment not found')
  }

  // Step 4: Check comment status is pending (can only moderate pending comments)
  if (comment.status !== 'pending') {
    return conflict('Comment already moderated')
  }

  // Step 5: Fetch post to check ownership (via persistence layer)
  const { data: post, error: postError } = await getPostForOwnershipCheck(
    comment.post_id
  )

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

  // Step 7: Update comment status (via persistence layer)
  const { data: updatedComment, error: updateError } = await moderateComment(
    commentId,
    status as 'approved' | 'rejected' | 'spam'
  )

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
    return NextResponse.json(formatApprovedComment(updatedComment))
  }

  // For rejected or spam: return minimal response
  return NextResponse.json(formatRejectedComment(updatedComment))
}
