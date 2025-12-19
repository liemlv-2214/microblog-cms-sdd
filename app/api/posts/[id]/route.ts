import { NextRequest, NextResponse } from 'next/server'
import { notFound } from '@/lib/auth'
import { getPublishedPostById, formatPostResponse } from '@/lib/posts/persistence'

/**
 * GET /api/posts/{id} - Get Post Detail
 * Authentication: Optional (public)
 * Returns full details of a published post by id
 * 
 * Spec: spec/api.md - GET /api/posts/{id}
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params

  // 1. FETCH POST BY ID (via persistence layer)
  const { data: post, error: fetchError } = await getPublishedPostById(postId)

  if (fetchError || !post) {
    return notFound('Post not found')
  }

  // 2. CHECK POST STATUS (already filtered by persistence layer)
  if (post.status !== 'published') {
    return notFound('Post not found')
  }

  // 3. TRANSFORM RESPONSE
  const formatted = formatPostResponse(post) as Record<string, unknown>
  formatted.comment_count = 0 // TODO: Fetch comment count

  // 4. RETURN SUCCESS RESPONSE (200 OK)
  return NextResponse.json(formatted, { status: 200 })
}
