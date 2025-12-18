// Generated from spec/api.md
// PATCH /api/comments/{id}/moderate - Moderate Comment

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, hasRole, forbidden } from '@/lib/auth'

/**
 * Authentication: Required (admin, or editor for own posts)
 * Approves, rejects, or marks comment as spam
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const commentId = params.id

  // Authenticate request
  const auth = await requireAuth(request)
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error.message },
      { status: auth.error.status }
    )
  }

  // Only admins can moderate any comments
  // Editors can only moderate comments on their own posts
  if (!hasRole(auth.user, ['admin'])) {
    // For editors, additional check needed: verify they own the post
    if (!hasRole(auth.user, ['editor'])) {
      return forbidden('Only admins and editors can moderate comments')
    }
    // TODO: Verify comment belongs to post authored by this user
  }

  // TODO: Parse request body (status, rejection_reason)
  // TODO: Validate status is one of: approved, rejected, spam
  // TODO: Validate comment exists and is pending
  // TODO: Update comment status
  // TODO: Set approved_at, approved_by_id if approving
  // TODO: Set rejection_reason if rejecting
  // TODO: Notify comment author (if applicable)
  
  return NextResponse.json(
    { error: 'Not Implemented' },
    { status: 501 }
  )
}
