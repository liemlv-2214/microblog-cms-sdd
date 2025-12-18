// Generated from spec/api.md
// POST /api/posts/{id}/comments - Submit Comment
// GET /api/posts/{id}/comments - List Approved Comments

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'

/**
 * POST - Submit Comment
 * Authentication: Required (viewer, editor, admin)
 * Creates a new comment in pending state
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = params.id

  // Authenticate request
  const auth = await requireAuth(request)
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error.message },
      { status: auth.error.status }
    )
  }

  // All authenticated roles can submit comments
  // (viewer, editor, admin)

  // TODO: Parse request body (content, parent_comment_id)
  // TODO: Validate comment content (1-5000 chars, not empty)
  // TODO: Validate post exists and is published
  // TODO: Check for spam/duplicate submission
  // TODO: Create comment record with status=pending
  
  return NextResponse.json(
    { error: 'Not Implemented' },
    { status: 501 }
  )
}

/**
 * GET - List Approved Comments
 * Authentication: Optional (public)
 * Returns paginated list of approved comments
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = params.id

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
