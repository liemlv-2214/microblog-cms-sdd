// Generated from spec/api.md
// PATCH /api/comments/{id}/moderate - Moderate Comment

import { NextRequest, NextResponse } from 'next/server'

/**
 * Authentication: Required (admin, or editor for own posts)
 * Approves, rejects, or marks comment as spam
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const commentId = params.id

  // TODO: Implement auth guard
  // TODO: Verify user is admin or post author
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
