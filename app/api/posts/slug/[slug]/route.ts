// Generated from spec/api.md
// GET /api/posts/{slug} - Get Post Detail

import { NextRequest, NextResponse } from 'next/server'
import { notFound } from '@/lib/auth'
import { supabase } from '@/lib/db/supabase'

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

  // 1. FETCH POST BY SLUG
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select(
      `
        id,
        title,
        slug,
        content,
        author_id,
        status,
        published_at,
        created_at,
        updated_at,
        users!author_id (id, email),
        post_categories (category_id, categories (id, name, slug)),
        post_tags (tag_name, tags (id, slug))
      `
    )
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()

  if (fetchError || !post) {
    return notFound('Post not found')
  }

  // 2. CHECK POST STATUS (must be published)
  if (post.status !== 'published') {
    return notFound('Post not found')
  }

  // 3. TRANSFORM RESPONSE
  const author = Array.isArray(post.users) ? post.users[0] : post.users
  
  const response = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    author: {
      id: author?.id,
      email: author?.email,
    },
    published_at: post.published_at,
    created_at: post.created_at,
    comment_count: 0, // TODO: Fetch comment count when C3.5/C3.6 ready
    categories: post.post_categories?.map((pc: any) => ({
      id: pc.category_id,
      name: pc.categories?.name,
      slug: pc.categories?.slug,
    })) || [],
    tags: post.post_tags?.map((pt: any) => ({
      id: pt.tags?.id,
      name: pt.tag_name,
      slug: pt.tags?.slug,
    })) || [],
  }

  // 4. RETURN SUCCESS RESPONSE (200 OK)
  return NextResponse.json(response, { status: 200 })
}
