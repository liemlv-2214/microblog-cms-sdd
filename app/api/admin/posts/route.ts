// Generated from spec/api.md
// GET /api/admin/posts - List All Posts (Admin Only)

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, forbidden } from '@/lib/auth'
import { listAllPostsForAdmin } from '@/lib/posts/persistence'

interface PostResponse {
  id: string
  title: string
  status: 'draft' | 'published' | 'archived'
  author: {
    id: string
    email: string
  }
  created_at: string
  published_at: string | null
}

interface ApiResponse {
  data: PostResponse[]
}

/**
 * GET /api/admin/posts - List All Posts (Admin Only)
 *
 * Returns all posts regardless of status (draft and published).
 * For admin post management only.
 * Requires authentication (admin role only).
 *
 * Spec: spec/api.md
 */
export async function GET(request: NextRequest) {
  // 1. AUTHENTICATE & AUTHORIZE
  const auth = await requireAuth(request)
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error.message },
      { status: auth.error.status }
    )
  }

  // 2. VERIFY ROLE (admin only)
  if (auth.user.role !== 'admin') {
    return forbidden('Only admins can access this endpoint')
  }

  // 3. FETCH ALL POSTS (via persistence layer)
  const { data: posts, error } = await listAllPostsForAdmin()

  if (error) {
    console.error('Failed to fetch posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }

  // 4. TRANSFORM RESPONSE
  // - Map posts to response format
  // - Extract author from nested users relation
  const response: ApiResponse = {
    data: (posts || []).map((post: any) => ({
      id: post.id,
      title: post.title,
      status: post.status,
      author: {
        id: (Array.isArray(post.users) ? post.users[0] : post.users)?.id,
        email: (Array.isArray(post.users) ? post.users[0] : post.users)?.email,
      },
      created_at: post.created_at,
      published_at: post.published_at || null,
    })),
  }

  return NextResponse.json(response, { status: 200 })
}
