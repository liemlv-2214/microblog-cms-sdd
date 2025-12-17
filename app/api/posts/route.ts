// Generated from spec/api.md
// POST /api/posts - Create Post (Draft)

import { NextRequest, NextResponse } from 'next/server'

/**
 * Authentication: Required (editor, admin)
 * Creates a new post in draft state
 */
export async function POST(request: NextRequest) {
  // TODO: Implement auth guard
  // TODO: Validate user role (editor, admin)
  // TODO: Validate request body
  // TODO: Create post record in database
  
  return NextResponse.json(
    { error: 'Not Implemented' },
    { status: 501 }
  )
}
