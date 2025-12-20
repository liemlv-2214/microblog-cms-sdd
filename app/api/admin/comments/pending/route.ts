// C3.8 – List Pending Comments (Admin Moderation)
// Specification: spec/api.md / spec/flows/admin-moderate-comments.md

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, hasRole, forbidden } from '@/lib/auth'
import { listPendingComments } from '@/lib/comments/persistence'

/**
 * GET /api/admin/comments/pending
 *
 * List all comments awaiting moderation (status = "pending")
 *
 * Specification rules:
 * - Authentication: REQUIRED
 * - Allowed roles: admin only
 * - Pagination: NOT required (v1)
 * - Ordering: created_at ASC (oldest first)
 *
 * Response (200 OK):
 * [
 *   {
 *     "id": "uuid",
 *     "post_id": "uuid",
 *     "content": "string",
 *     "author": { "id": "uuid", "email": "string" },
 *     "created_at": "ISO-8601"
 *   }
 * ]
 *
 * Errors:
 * - 401 Unauthorized: Missing or invalid token
 * - 403 Forbidden: User is not admin
 * - 500 Internal Server Error: Database error
 */
export async function GET(request: NextRequest) {
  // Step 1: Authenticate request
  const auth = await requireAuth(request)
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error.message },
      { status: auth.error.status }
    )
  }

  // Step 2: Check authorization (admin only)
  if (!hasRole(auth.user, ['admin'])) {
    return forbidden('Only admins can view pending comments')
  }

  // Step 3: Fetch pending comments from persistence layer
  try {
    const { data, error } = await listPendingComments()

    if (error) {
      console.error('Database error listing pending comments:', error)
      return NextResponse.json(
        { error: 'Failed to fetch pending comments' },
        { status: 500 }
      )
    }

    // Step 4: Format response
    // Transform database records into API response format
    const formatted = (data || []).map((comment) => {
      const author = Array.isArray(comment.users) ? comment.users[0] : undefined

      return {
        id: comment.id,
        post_id: comment.post_id,
        content: comment.content,
        author: {
          id: author?.id || '',
          email: author?.email || '',
        },
        created_at: comment.created_at,
      }
    })

    return NextResponse.json(formatted, { status: 200 })
  } catch (err: any) {
    console.error('Unexpected error listing pending comments:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
