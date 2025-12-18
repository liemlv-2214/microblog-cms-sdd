// Generated from spec/api.md
// POST /api/posts - Create Post (Draft)

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, hasRole, forbidden } from '@/lib/auth'

/**
 * Authentication: Required (editor, admin)
 * Creates a new post in draft state
 */
export async function POST(request: NextRequest) {
  // Authenticate request
  const auth = await requireAuth(request)
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error.message },
      { status: auth.error.status }
    )
  }

  // Verify role
  if (!hasRole(auth.user, ['editor', 'admin'])) {
    return forbidden('Only editors and admins can create posts')
  }

  // TODO: Validate request body
  // TODO: Create post record in database
  
  return NextResponse.json(
    { error: 'Not Implemented' },
    { status: 501 }
  )
}
