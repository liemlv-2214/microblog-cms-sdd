// Generated from spec/api.md
// POST /api/posts - Create Post (Draft)

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, hasRole, forbidden, badRequest } from '@/lib/auth'
import {
  validateTitle,
  validateContent,
  validateOptionalCategories,
  validateTagIds,
  slugify,
} from '@/lib/posts/validation'
import {
  createDraftPost,
  linkCategoriesToPost,
  linkTagsToPost,
  listPublishedPosts,
  countPublishedPosts,
  formatPostResponse,
} from '@/lib/posts/persistence'
import { supabase } from '@/lib/db/supabase'

interface CreatePostRequest {
  title: unknown
  content: unknown
  category_ids: unknown
  tag_ids?: unknown
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
  const categoriesValidation = validateOptionalCategories(body.category_ids)
  if (!categoriesValidation.valid) {
    return badRequest(
      categoriesValidation.error || 'Invalid category_ids'
    )
  }

  // 6b. VALIDATE CATEGORY IDS EXIST (if provided)
  let categoryIds: string[] = []
  if (
    body.category_ids &&
    Array.isArray(body.category_ids) &&
    body.category_ids.length > 0
  ) {
    categoryIds = body.category_ids as string[]
    const { data: existingCategories, error: catError } = await supabase
      .from('categories')
      .select('id')
      .in('id', categoryIds)

    if (catError || !existingCategories || existingCategories.length !== categoryIds.length) {
      return badRequest('One or more category_ids reference non-existent categories')
    }
  }

  // 7. VALIDATE TAGS (optional)
  const tagsValidation = validateTagIds(body.tag_ids)
  if (!tagsValidation.valid) {
    return badRequest(tagsValidation.error || 'Invalid tag_ids')
  }

  // 7b. VALIDATE TAG IDS EXIST (if provided)
  let tagIds: string[] = []
  if (
    body.tag_ids &&
    Array.isArray(body.tag_ids) &&
    body.tag_ids.length > 0
  ) {
    tagIds = body.tag_ids as string[]
    const { data: existingTags, error: tagError } = await supabase
      .from('tags')
      .select('id')
      .in('id', tagIds)

    if (tagError || !existingTags || existingTags.length !== tagIds.length) {
      return badRequest('One or more tag_ids reference non-existent tags')
    }
  }

  // 8. GENERATE SLUG
  // Note: Slug is generated from title but NOT checked for uniqueness at draft stage.
  // Slug uniqueness is enforced when publishing (C3.2).
  // This allows users to save drafts with the same title without conflicts.
  const slug = slugify(body.title as string)

  // 9. CREATE POST IN DATABASE (via persistence layer)
  const { data: post, error: createError } = await createDraftPost({
    title: body.title as string,
    content: body.content as string,
    slug,
    author_id: auth.user.id,
  })

  if (createError || !post) {
    console.error('Failed to create post:', createError)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }

  // 10. INSERT CATEGORY RELATIONSHIPS (only if provided)
  // Categories are optional at draft stage; they will be validated when publishing
  if (categoryIds.length > 0) {
    const { error: categoryError } = await linkCategoriesToPost(post.id, categoryIds)

    if (categoryError) {
      console.error('Failed to link categories:', categoryError)
      // Continue anyway, post was created successfully
    }
  }

  // 11. INSERT TAG RELATIONSHIPS (if provided)
  if (tagIds.length > 0) {
    const { error: tagError } = await linkTagsToPost(post.id, tagIds)

    if (tagError) {
      console.error('Failed to link tags:', tagError)
      // Continue anyway, post was created successfully
    }
  }

  // 12. RETURN SUCCESS RESPONSE (201 Created)
  const formatted = formatPostResponse(post, false) as Record<string, unknown>
  formatted.category_ids = categoryIds
  formatted.tag_ids = tagIds

  return NextResponse.json(formatted, { status: 201 })
}

/**
 * GET /api/posts - List Published Posts
 * Public endpoint (no authentication required)
 * Returns paginated, filterable list of published posts
 * 
 * Spec: spec/api.md - GET /api/posts
 */
export async function GET(request: NextRequest) {
  // 1. PARSE QUERY PARAMETERS
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const categorySlug = searchParams.get('category')
  const tagName = searchParams.get('tag')
  const searchQuery = searchParams.get('search')
  const sort = searchParams.get('sort') || 'newest'

  // 2. VALIDATE QUERY PARAMETERS
  if (isNaN(page) || page < 1) {
    return badRequest('Page must be a positive integer')
  }

  if (isNaN(limit) || limit < 1 || limit > 50) {
    return badRequest('Limit must be between 1 and 50')
  }

  if (sort !== 'newest' && sort !== 'oldest') {
    return badRequest('Sort must be "newest" or "oldest"')
  }

  // 3. FETCH PUBLISHED POSTS FROM PERSISTENCE LAYER
  const sortOrder: 'asc' | 'desc' = sort === 'oldest' ? 'asc' : 'desc'
  const offset = (page - 1) * limit

  const { data: posts, error: queryError } = await listPublishedPosts(
    offset,
    limit,
    sortOrder
  )

  if (queryError) {
    console.error('Failed to fetch posts:', queryError)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }

  // 4. FILTER BY CATEGORY (client-side after fetch, as Supabase filter is complex)
  let filteredPosts = posts || []
  
  if (categorySlug) {
    filteredPosts = filteredPosts.filter((post: any) =>
      post.post_categories?.some((pc: any) => pc.categories?.slug === categorySlug)
    )
  }

  // 5. FILTER BY TAG (client-side after fetch)
  if (tagName) {
    filteredPosts = filteredPosts.filter((post: any) =>
      post.post_tags?.some((pt: any) => pt.tags?.slug?.toLowerCase() === tagName.toLowerCase())
    )
  }

  // 6. APPLY SEARCH FILTER (client-side after fetch)
  if (searchQuery) {
    filteredPosts = filteredPosts.filter((post: any) =>
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // 7. GET TOTAL COUNT FOR PAGINATION
  const { count, error: countError } = await countPublishedPosts()

  if (countError) {
    console.error('Failed to count posts:', countError)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }

  // 8. TRANSFORM RESPONSE
  const transformedPosts = filteredPosts.map((post: any) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    author: {
      id: (Array.isArray(post.users) ? post.users[0] : post.users)?.id,
      email: (Array.isArray(post.users) ? post.users[0] : post.users)?.email,
    },
    status: post.status,
    published_at: post.published_at,
    comment_count: 0, // TODO: Fetch comment count when C3.5/C3.6 ready
    category_ids: post.post_categories?.map((pc: any) => pc.category_id) || [],
    tag_ids: post.post_tags?.map((pt: any) => pt.tag_id) || [],
  }))

  // 9. RETURN RESPONSE WITH PAGINATION
  const totalPages = Math.ceil((count || 0) / limit)

  return NextResponse.json(
    {
      data: transformedPosts,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: totalPages,
      },
    },
    { status: 200 }
  )
}
