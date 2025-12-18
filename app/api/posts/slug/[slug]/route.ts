// Generated from spec/api.md
// GET /api/posts/{slug} - Get Post Detail
// GET /api/posts - List Published Posts

import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/posts/{slug} - Get Post Detail
 * Authentication: Optional (public)
 * Returns full details of a published post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Authentication is optional (public endpoint)
  // TODO: Query post by slug
  // TODO: Verify post status is published
  // TODO: Return post details with author and categories
  
  return NextResponse.json(
    { error: 'Not Implemented' },
    { status: 501 }
  )
}

/**
 * GET /api/posts - List Published Posts
 * Authentication: Optional (public)
 * Returns paginated list of published posts
 * Query params: page, limit, category, tag, search, sort
 */
export async function GET_LIST(
  request: NextRequest
) {
  // Authentication is optional (public endpoint)
  // TODO: Parse query parameters (page, limit, category, tag, search, sort)
  // TODO: Query published posts with filters
  // TODO: Return paginated results
  
  return NextResponse.json(
    { error: 'Not Implemented' },
    { status: 501 }
  )
}
