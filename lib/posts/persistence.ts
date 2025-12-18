// Posts Persistence Layer
// Handles all database operations for posts CRUD

import { supabase } from '../db/supabase'

/**
 * Type definitions for post operations
 */
export interface PostCreationData {
  title: string
  content: string
  slug: string
  author_id: string
}

export interface CategoryLink {
  post_id: string
  category_id: string
}

export interface TagLink {
  post_id: string
  tag_name: string
}

export interface PostWithRelations {
  id: string
  title: string
  slug: string
  content: string
  author_id: string
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  created_at: string
  updated_at: string
  categories?: Array<{ id: string; name: string; slug: string }>
  tags?: Array<{ id: string; name: string; slug: string }>
}

// ============================================================================
// DRAFT POST CREATION (C3.1)
// ============================================================================
// SCOPE: Pure persistence operations only. Post validation and auth are handled by route.
// TRANSACTIONS: TODO - In v2, consider wrapping createDraftPost + linkCategoriesToPost +
// linkTagsToPost in a single transaction to ensure atomicity on multi-step creation failures.

/**
 * Insert new post in draft state
 * RESPONSIBILITY: Database insert only. Returns raw post record from database.
 */
export async function createDraftPost(data: PostCreationData) {
  return supabase
    .from('posts')
    .insert({
      title: data.title,
      content: data.content,
      slug: data.slug,
      author_id: data.author_id,
      status: 'draft',
      published_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
}

/**
 * Link categories to post
 * RESPONSIBILITY: Database insert only. No validation of category IDs (route responsibility).
 * IDEMPOTENT: Safe to call with empty array (returns no-op).
 * TRANSACTIONS: TODO - This should be part of parent createDraftPost transaction in v2.
 */
export async function linkCategoriesToPost(links: CategoryLink[]) {
  if (links.length === 0) {
    return { data: [], error: null }
  }
  return supabase.from('post_categories').insert(links)
}

/**
 * Link tags to post
 * RESPONSIBILITY: Database insert only. No validation of tag existence (route responsibility).
 * IDEMPOTENT: Safe to call with empty array (returns no-op).
 * TRANSACTIONS: TODO - This should be part of parent createDraftPost transaction in v2.
 */
export async function linkTagsToPost(links: TagLink[]) {
  if (links.length === 0) {
    return { data: [], error: null }
  }
  return supabase.from('post_tags').insert(links)
}

// ============================================================================
// PUBLISH POST (C3.2)
// ============================================================================
// SCOPE: Pure persistence operations. Business rules (status check, content validation,
// ownership verification, slug uniqueness) are enforced by route handler.
// TRANSACTIONS: TODO - publishPost could be wrapped in a transaction with relationship
// fetches to ensure consistent read-modify-write in v2.

/**
 * Fetch post by ID for publishing verification
 * RESPONSIBILITY: Database read only. Route validates post.status = 'draft' before publishing.
 */
export async function getPostById(postId: string) {
  return supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .is('deleted_at', null)
    .single()
}

/**
 * Check if slug exists (for uniqueness enforcement)
 * RESPONSIBILITY: Database read only. Returns minimal data (id, slug, status) for
 * route to determine if slug collision occurred during publish.
 * AUTHORIZATION: No auth checks here; route validates publish permissions before calling.
 */
export async function getPostBySlug(slug: string) {
  return supabase
    .from('posts')
    .select('id, slug, status')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()
}

/**
 * Publish draft post
 * RESPONSIBILITY: Database update only. Does NOT validate:
 *   - Current post status (must be draft) - checked by route
 *   - Post ownership (editor vs admin) - checked by route
 *   - Slug uniqueness - validated by route before calling
 *   - Content validity (>= 100 chars, has categories) - validated by route
 * IDEMPOTENCY: Not idempotent; calling twice changes published_at. Route prevents this.
 */
export async function publishPost(
  postId: string,
  slug: string
) {
  return supabase
    .from('posts')
    .update({
      status: 'published',
      slug,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)
    .select(
      'id, title, slug, content, author_id, status, published_at, created_at, updated_at'
    )
    .single()
}

// ============================================================================
// LIST PUBLISHED POSTS (C3.3)
// ============================================================================
// SCOPE: Pure persistence operations. Filtering (category, tag, search), sorting validation,
// and pagination bounds are enforced by route handler.
// TRANSACTIONS: Not needed; reads are non-critical and pagination is stateless.

/**
 * List published posts with pagination
 * Returns posts with author, categories, and tags
 * RESPONSIBILITY: Database query only. Fetches raw data including relationships.
 * NOTE: Route handler applies client-side filtering (category/tag matching).
 */
export async function listPublishedPosts(
  offset: number,
  limit: number,
  sortOrder: 'asc' | 'desc'
) {
  return supabase
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
      post_categories (
        category_id,
        categories (id, name, slug)
      ),
      post_tags (
        tag_name,
        tags (id, name, slug)
      )
      `
    )
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('published_at', { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1)
}

/**
 * Get total count of published posts
 */
export async function countPublishedPosts() {
  return supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published')
    .is('deleted_at', null)
}

// ============================================================================
// GET PUBLISHED POST BY SLUG (C3.4)
// ============================================================================
// SCOPE: Pure persistence operations. Public read; no auth checks needed.

/**
 * Fetch single published post by slug with all relationships
 * RESPONSIBILITY: Database read only. Includes author, categories, and tags.
 * NOTE: Route applies response formatting via formatPostResponse().
 */
export async function getPublishedPostBySlug(slug: string) {
  return supabase
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
      post_categories (
        category_id,
        categories (id, name, slug)
      ),
      post_tags (
        tag_name,
        tags (id, name, slug)
      )
      `
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single()
}

// ============================================================================
// HELPER UTILITIES
// ============================================================================
// WHY FORMAT HELPERS IN PERSISTENCE LAYER?
// These helpers transform database response shape into API response shape.
// This is STRUCTURAL formatting only - no business logic, no authorization.
// Kept in persistence layer because:
//   1. Route handlers stay focused on business logic (validation, auth, error handling)
//   2. Consistent transformation logic (single source of truth)
//   3. Database query details (relationships, joins) owned by persistence
//   4. Spec/api.md response contracts belong next to database schema knowledge
// Future: If transformation becomes complex, move to dedicated response layer.

/**
 * Format post response with relationships
 * Transforms raw database response into API response format
 * RESPONSIBILITY: Structural transformation only (shape/organization).
 *   - Extracts author from joined users table
 *   - Maps category/tag relationships to response format
 *   - No filtering, validation, or business logic applied
 * IDEMPOTENT: Pure function; same input always produces same output.
 */
export function formatPostResponse(
  post: Record<string, unknown>,
  includeAuthor: boolean = true
) {
  const users = post.users as Array<{ id: string; email: string }> | undefined
  const author = Array.isArray(users) ? users[0] : users

  const response: Record<string, unknown> = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    author_id: post.author_id,
    status: post.status,
    published_at: post.published_at,
    created_at: post.created_at,
    updated_at: post.updated_at,
  }

  if (includeAuthor && author) {
    response.author = {
      id: author.id,
      email: author.email,
    }
  }

  if (post.post_categories) {
    const categories = post.post_categories as Array<{
      category_id: string
      categories?: { name: string; slug: string }
    }>
    response.categories = categories.map((pc) => ({
      id: pc.category_id,
      name: pc.categories?.name,
      slug: pc.categories?.slug,
    }))
  }

  if (post.post_tags) {
    const tags = post.post_tags as Array<{
      tag_name: string
      tags?: { id: string; name: string; slug: string }
    }>
    response.tags = tags.map((pt) => ({
      id: pt.tags?.id,
      name: pt.tag_name,
      slug: pt.tags?.slug,
    }))
  }

  return response
}
