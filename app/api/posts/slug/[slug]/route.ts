// Generated from spec/api.md
// GET /api/posts/{slug} - Get Post Detail

import { NextRequest, NextResponse } from 'next/server'
import { notFound } from '@/lib/auth'
import { getPublishedPostBySlug, formatPostResponse } from '@/lib/posts/persistence'

/**
 * GET /api/posts/{slug} - Get Post Detail
 * Authentication: Optional (public)
 * Returns full details of a published post by slug
 * 
 * Spec: spec/api.md - GET /api/posts/{slug}
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // 1. FETCH POST BY SLUG (via persistence layer)
  const { data: post, error: fetchError } = await getPublishedPostBySlug(slug)

  if (fetchError || !post) {
    return notFound('Post not found')
  }

  // 2. CHECK POST STATUS (must be published) - already filtered by persistence layer
  if (post.status !== 'published') {
    return notFound('Post not found')
  }

  // 3. TRANSFORM RESPONSE
  const formatted = formatPostResponse(post) as Record<string, unknown>
  formatted.comment_count = 0 // TODO: Fetch comment count

  // 4. RETURN SUCCESS RESPONSE (200 OK)
  return NextResponse.json(formatted, { status: 200 })
}
