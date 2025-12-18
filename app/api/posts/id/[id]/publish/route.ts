// Generated from spec/api.md
// PATCH /api/posts/{id}/publish - Publish Post

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, hasRole, forbidden, badRequest, notFound, conflict } from '@/lib/auth'
import { validateContentForPublish, slugify } from '@/lib/posts/validation'
import { supabase } from '@/lib/db/supabase'

/**
 * Authentication: Required (editor for own posts, admin for any)
 * Publishes an existing draft post
 * 
 * Spec: spec/api.md - PATCH /api/posts/{id}/publish
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params

  // 1. AUTHENTICATE & AUTHORIZE
  const auth = await requireAuth(request)
  if (auth.error) {
    return NextResponse.json(
      { error: auth.error.message },
      { status: auth.error.status }
    )
  }

  // 2. VERIFY ROLE (editor, admin)
  if (!hasRole(auth.user, ['editor', 'admin'])) {
    return forbidden('Only editors and admins can publish posts')
  }

  // 3. FETCH POST
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .is('deleted_at', null)
    .single()

  if (fetchError || !post) {
    return notFound('Post not found')
  }

  // 4. CHECK POST STATUS (must be draft)
  if (post.status !== 'draft') {
    return conflict('Post is not in draft status')
  }

  // 5. VERIFY OWNERSHIP (editors can only publish own posts)
  if (auth.user.role === 'editor' && post.author_id !== auth.user.id) {
    return forbidden('Editors can only publish their own posts')
  }

  // 6. VALIDATE CONTENT LENGTH (min 100 chars)
  const contentValidation = validateContentForPublish(post.content)
  if (!contentValidation.valid) {
    return badRequest(contentValidation.error || 'Invalid content for publishing')
  }

  // 7. CHECK CATEGORIES (must have at least one)
  const { data: categories, error: categoriesError } = await supabase
    .from('post_categories')
    .select('category_id')
    .eq('post_id', postId)

  if (categoriesError || !categories || categories.length === 0) {
    return badRequest('Post must have at least one category to publish')
  }

  // 8. GENERATE FINAL SLUG WITH UNIQUENESS CHECK
  const baseSlug = slugify(post.title)
  let slug = baseSlug
  let slugAttempt = 0
  const maxAttempts = 10

  // Check for slug uniqueness (excluding current post)
  while (slugAttempt < maxAttempts) {
    const { data: existing, error: slugError } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .neq('id', postId)
      .is('deleted_at', null)
      .limit(1)

    if (slugError) {
      console.error('Error checking slug uniqueness:', slugError)
      return NextResponse.json(
        { error: 'Failed to validate slug uniqueness' },
        { status: 500 }
      )
    }

    if (!existing || existing.length === 0) {
      break // Slug is unique
    }

    slugAttempt++
    slug = `${baseSlug}-${slugAttempt}`
  }

  if (slugAttempt >= maxAttempts) {
    return conflict('Could not generate unique slug for this post')
  }

  // 9. UPDATE POST TO PUBLISHED STATE
  const now = new Date().toISOString()
  const { data: updatedPost, error: updateError } = await supabase
    .from('posts')
    .update({
      status: 'published',
      slug,
      published_at: now,
      updated_at: now,
    })
    .eq('id', postId)
    .select()
    .single()

  if (updateError || !updatedPost) {
    console.error('Failed to update post:', updateError)
    return NextResponse.json(
      { error: 'Failed to publish post' },
      { status: 500 }
    )
  }

  // 10. FETCH CATEGORIES AND TAGS FOR RESPONSE
  const { data: categoryRecords } = await supabase
    .from('post_categories')
    .select('category_id')
    .eq('post_id', postId)

  const { data: tagRecords } = await supabase
    .from('post_tags')
    .select('tag_name')
    .eq('post_id', postId)

  // 11. RETURN SUCCESS RESPONSE (200 OK)
  return NextResponse.json(
    {
      id: updatedPost.id,
      slug: updatedPost.slug,
      title: updatedPost.title,
      content: updatedPost.content,
      author_id: updatedPost.author_id,
      status: updatedPost.status,
      published_at: updatedPost.published_at,
      created_at: updatedPost.created_at,
      updated_at: updatedPost.updated_at,
      categories: categoryRecords?.map((c: { category_id: string }) => c.category_id) || [],
      tags: tagRecords?.map((t: { tag_name: string }) => t.tag_name) || [],
    },
    { status: 200 }
  )
}
