// Generated from spec/api.md
// POST /api/posts - Create Post (Draft)

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, hasRole, forbidden, badRequest } from '@/lib/auth'
import {
  validateTitle,
  validateContent,
  validateOptionalCategories,
  validateTags,
  slugify,
} from '@/lib/posts/validation'
import { supabase } from '@/lib/db/supabase'

interface CreatePostRequest {
  title: unknown
  content: unknown
  categories: unknown
  tags?: unknown
}

/**
 * Authentication: Required (editor, admin)
 * Creates a new post in draft state
 * 
 * Spec: spec/api.md - POST /api/posts
 */
export async function POST(request: NextRequest) {
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
    return forbidden('Only editors and admins can create posts')
  }

  // 3. PARSE REQUEST BODY
  let body: CreatePostRequest
  try {
    body = await request.json()
  } catch {
    return badRequest('Invalid JSON in request body')
  }

  // 4. VALIDATE TITLE
  const titleValidation = validateTitle(body.title)
  if (!titleValidation.valid) {
    return badRequest(titleValidation.error || 'Invalid title')
  }

  // 5. VALIDATE CONTENT
  const contentValidation = validateContent(body.content)
  if (!contentValidation.valid) {
    return badRequest(contentValidation.error || 'Invalid content')
  }

  // 6. VALIDATE CATEGORIES (optional for drafts per spec/api.md)
  const categoriesValidation = validateOptionalCategories(body.categories)
  if (!categoriesValidation.valid) {
    return badRequest(
      categoriesValidation.error || 'Invalid categories'
    )
  }

  // 7. VALIDATE TAGS (optional)
  const tagsValidation = validateTags(body.tags)
  if (!tagsValidation.valid) {
    return badRequest(tagsValidation.error || 'Invalid tags')
  }

  // 8. GENERATE SLUG
  // Note: Slug is generated from title but NOT checked for uniqueness at draft stage.
  // Slug uniqueness is enforced when publishing (C3.2).
  // This allows users to save drafts with the same title without conflicts.
  const slug = slugify(body.title as string)

  // 9. CREATE POST IN DATABASE
  const { data: post, error: createError } = await supabase
    .from('posts')
    .insert({
      title: body.title,
      content: body.content,
      slug,
      author_id: auth.user.id,
      status: 'draft',
      published_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (createError || !post) {
    console.error('Failed to create post:', createError)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }

  // 10. INSERT CATEGORY RELATIONSHIPS (only if provided)
  // Categories are optional at draft stage; they will be validated when publishing
  if (
    body.categories &&
    Array.isArray(body.categories) &&
    body.categories.length > 0
  ) {
    const categoryRecords = (body.categories as string[]).map(
      (categoryId) => ({
        post_id: post.id,
        category_id: categoryId,
        created_at: new Date().toISOString(),
      })
    )

    const { error: categoryError } = await supabase
      .from('post_categories')
      .insert(categoryRecords)

    if (categoryError) {
      console.error('Failed to link categories:', categoryError)
      // Continue anyway, post was created successfully
    }
  }

  // 11. INSERT TAG RELATIONSHIPS (if provided)
  if (body.tags && Array.isArray(body.tags) && body.tags.length > 0) {
    const tags = body.tags as string[]
    
    // TODO: Handle tag auto-creation if tags don't exist
    // For now, assume tags are already in the system
    const tagRecords = tags.map((tagName) => ({
      post_id: post.id,
      tag_name: tagName,
      created_at: new Date().toISOString(),
    }))

    const { error: tagError } = await supabase
      .from('post_tags')
      .insert(tagRecords)

    if (tagError) {
      console.error('Failed to link tags:', tagError)
      // Continue anyway, post was created successfully
    }
  }

  // 12. RETURN SUCCESS RESPONSE (201 Created)
  return NextResponse.json(
    {
      id: post.id,
      slug: post.slug,
      title: post.title,
      content: post.content,
      author_id: post.author_id,
      status: post.status,
      published_at: post.published_at,
      created_at: post.created_at,
      updated_at: post.updated_at,
      categories: body.categories,
      tags: body.tags || [],
    },
    { status: 201 }
  )
}
