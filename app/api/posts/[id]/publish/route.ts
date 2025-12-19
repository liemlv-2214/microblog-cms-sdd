// Generated from spec/api.md
// PATCH /api/posts/{id}/publish - Publish Post

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, hasRole, forbidden, badRequest, notFound, conflict } from '@/lib/auth'
import { validateContentForPublish, slugify } from '@/lib/posts/validation'
import { supabase } from '@/lib/db/supabase'
import {
  getPostById,
  getPostBySlug,
  publishPost,
  formatPostResponse,
} from '@/lib/posts/persistence'

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

  // 3. FETCH POST (via persistence layer)
  const { data: post, error: fetchError } = await getPostById(postId)

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

  // 7. CHECK CATEGORIES (must have at least one) - Fetch category_ids
  const { data: categories, error: categoriesError } = await supabase
    .from('post_categories')
    .select('category_id')
    .eq('post_id', postId)

  if (categoriesError || !categories || categories.length === 0) {
    return badRequest('Post must have at least one category to publish')
  }

  // Extract category_ids from relationships
  const categoryIds = categories.map((c: any) => c.category_id)

  // 8. GENERATE FINAL SLUG WITH UNIQUENESS CHECK
  const baseSlug = slugify(post.title)
  let slug = baseSlug
  let slugAttempt = 0
  const maxAttempts = 10

  // Check for slug uniqueness (excluding current post)
  while (slugAttempt < maxAttempts) {
    const { data: existing, error: slugError } = await getPostBySlug(slug)

    // getPostBySlug uses .single() which returns error if not found (PGRST116)
    if (slugError) {
      // PGRST116 = not found; slug is unique
      if (slugError.code === 'PGRST116') {
        break
      }
      
      // Unknown error
      if (slugAttempt === 0) {
        console.error('Error checking slug uniqueness:', slugError)
        return NextResponse.json(
          { error: 'Failed to validate slug uniqueness' },
          { status: 500 }
        )
      }
      
      break
    }

    // Slug exists; check if it's the current post
    if (existing && existing.id === postId) {
      // Same post, slug is available (was draft, now publishing)
      break
    }

    // Slug belongs to different post; try next variant
    slugAttempt++
    slug = `${baseSlug}-${slugAttempt}`
  }

  if (slugAttempt >= maxAttempts) {
    return conflict('Could not generate unique slug for this post')
  }

  // 9. UPDATE POST TO PUBLISHED STATE (via persistence layer)
  const { data: updatedPost, error: updateError } = await publishPost(postId, slug)

  if (updateError || !updatedPost) {
    console.error('Failed to publish post:', updateError)
    return NextResponse.json(
      { error: 'Failed to publish post' },
      { status: 500 }
    )
  }

  // 10. FORMAT AND RETURN SUCCESS RESPONSE (200 OK)
  const formatted = formatPostResponse(updatedPost, false) as Record<string, unknown>
  formatted.category_ids = categoryIds
  
  // Fetch tag_ids from persistence
  const { data: tagRecords } = await supabase
    .from('post_tags')
    .select('tag_id')
    .eq('post_id', postId)

  formatted.tag_ids = tagRecords?.map((t: any) => t.tag_id) || []

  return NextResponse.json(formatted, { status: 200 })
}
