// Comments Persistence Layer
// Handles all database operations for comments CRUD

import { supabase } from '../db/supabase'

/**
 * Type definitions for comment operations
 */
export interface CommentCreationData {
  post_id: string
  author_id: string
  content: string
  parent_comment_id?: string | null
}

export interface CommentModerationData {
  status: 'approved' | 'rejected' | 'spam'
}

// ============================================================================
// SUBMIT COMMENT (C3.5)
// ============================================================================
// SCOPE: Pure persistence operations. Comment validation (content length, format) and
// authorization are handled by route handler. These functions support validation by
// providing read-only access to post/comment state.
// TRANSACTIONS: TODO - createPendingComment should eventually ensure post exists and is
// published via database-level constraints or transaction in v2.

/**
 * Verify post exists and is published
 * AUTHORIZATION SUPPORT: Route uses this to validate post exists before creating comment.
 * RESPONSIBILITY: Database read only. Returns post status for validation.
 */
export async function getPublishedPost(postId: string) {
  return supabase
    .from('posts')
    .select('id, status')
    .eq('id', postId)
    .single()
}

/**
 * Verify parent comment exists and is approved
 * AUTHORIZATION SUPPORT: Route uses this to validate parent comment (for replies) exists
 * and is approved before allowing a reply comment to be created.
 * RESPONSIBILITY: Database read only. Returns comment status for validation.
 */
export async function getApprovedComment(commentId: string, postId: string) {
  return supabase
    .from('comments')
    .select('id, status')
    .eq('id', commentId)
    .eq('post_id', postId)
    .single()
}

/**
 * Create new comment in pending state
 * RESPONSIBILITY: Database insert only. Does NOT validate:
 *   - Post exists or is published (checked by route via getPublishedPost)
 *   - Parent comment exists/approved (checked by route via getApprovedComment)
 *   - Content length (route validates before calling)
 *   - No duplicate submissions (route handles; persistence is idempotent)
 */
export async function createPendingComment(data: CommentCreationData) {
  return supabase
    .from('comments')
    .insert({
      post_id: data.post_id,
      author_id: data.author_id,
      content: data.content,
      status: 'pending',
      parent_comment_id: data.parent_comment_id || null,
    })
    .select(
      'id, post_id, author_id, content, status, parent_comment_id, created_at, approved_at, users!author_id (id, email)'
    )
    .single()
}

// ============================================================================
// LIST APPROVED COMMENTS (C3.6)
// ============================================================================
// SCOPE: Pure persistence operations. Pagination validation and sorting are enforced
// by route handler. These functions provide data access for public comment listings.
// TRANSACTIONS: Not needed; reads are non-critical and queries are stateless.

/**
 * Get total count of approved top-level comments for a post
 * RESPONSIBILITY: Database count only. Supports pagination metadata calculation in route.
 */
export async function countApprovedTopLevelComments(postId: string) {
  return supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId)
    .eq('status', 'approved')
    .is('parent_comment_id', null)
}

/**
 * List approved top-level comments with pagination
 * RESPONSIBILITY: Database query only. Fetches approved comments and author details.
 * SORTING: sortOrder parameter directly controls database ordering. Route validates values.
 * NOTE: Route handler pairs replies via separate getApprovedReplies() calls (N+1 pattern).
 */
export async function listApprovedTopLevelComments(
  postId: string,
  offset: number,
  limit: number,
  sortOrder: 'asc' | 'desc'
) {
  return supabase
    .from('comments')
    .select(
      'id, post_id, author_id, content, status, parent_comment_id, created_at, users!author_id (id, email)'
    )
    .eq('post_id', postId)
    .eq('status', 'approved')
    .is('parent_comment_id', null)
    .order('created_at', { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1)
}

/**
 * Get approved replies for a parent comment
 * RESPONSIBILITY: Database query only. Called once per parent comment by route (N+1 pattern).
 * INVARIANT: Replies always ordered oldest-first (created_at ASC) per spec, regardless
 * of parent comment sort order. This maintains chronological reply order for readability.
 */
export async function getApprovedReplies(postId: string, parentCommentId: string) {
  return supabase
    .from('comments')
    .select(
      'id, author_id, content, created_at, users!author_id (id, email)'
    )
    .eq('post_id', postId)
    .eq('parent_comment_id', parentCommentId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true })
}

// ============================================================================
// LIST PENDING COMMENTS (C3.8)
// ============================================================================
// SCOPE: Pure persistence operations supporting admin moderation workflow.
// Authorization (admin-only) is enforced by route handler.
// TRANSACTIONS: Not needed; reads are non-critical and queries are stateless.

/**
 * List all pending comments ordered by creation date (oldest first)
 * RESPONSIBILITY: Database query only. Fetches all pending comments with author details.
 * AUTHORIZATION SUPPORT: Route validates admin role before calling this function.
 * BEHAVIOR: No pagination (v1 requirement). Returns all pending comments ordered ASC.
 */
export async function listPendingComments() {
  return supabase
    .from('comments')
    .select(
      'id, post_id, author_id, content, created_at, users!author_id (id, email)'
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
}

// ============================================================================
// MODERATE COMMENT (C3.7)
// ============================================================================
// SCOPE: Pure persistence operations supporting moderation workflow.
// Authorization (admin vs editor ownership) is enforced by route handler.
// TRANSACTIONS: TODO - getCommentById -> getPostForOwnershipCheck -> moderateComment
// should be transactional in v2 to prevent race conditions during moderation.

/**
 * Get comment by ID with basic fields
 * AUTHORIZATION SUPPORT: Route uses this to fetch comment and verify it exists
 * before enforcing moderation permissions (status check, ownership check).
 * RESPONSIBILITY: Database read only. Returns comment state for validation.
 */
export async function getCommentById(commentId: string) {
  return supabase
    .from('comments')
    .select('id, post_id, author_id, content, status, created_at')
    .eq('id', commentId)
    .single()
}

/**
 * Get post for ownership verification (for editor moderation)
 * AUTHORIZATION SUPPORT: Route uses this to verify editor is the post author
 * before allowing comment moderation (admin has no restriction).
 * RESPONSIBILITY: Database read only. Returns post author_id for comparison.
 */
export async function getPostForOwnershipCheck(postId: string) {
  return supabase
    .from('posts')
    .select('id, author_id')
    .eq('id', postId)
    .single()
}

/**
 * Update comment status (approve, reject, or spam)
 * RESPONSIBILITY: Database update only. Does NOT validate:
 *   - Comment exists (checked by route via getCommentById)
 *   - Comment is pending (route validates status != pending returns 409)
 *   - User authorization (route checks admin vs editor + ownership)
 *   - Status value valid (route validates before calling)
 * BEHAVIOR: Atomically sets approved_at timestamp when status = 'approved'.
 * This is the ONLY case where approved_at is populated (business rule).
 */
export async function moderateComment(
  commentId: string,
  status: 'approved' | 'rejected' | 'spam'
) {
  const updateData: Record<string, unknown> = { status }

  // Set approved_at timestamp when approving
  if (status === 'approved') {
    updateData.approved_at = new Date().toISOString()
  }

  return supabase
    .from('comments')
    .update(updateData)
    .eq('id', commentId)
    .select(
      'id, post_id, author_id, content, status, created_at, approved_at, users!author_id (id, email)'
    )
    .single()
}

// ============================================================================
// HELPER UTILITIES
// ============================================================================
// WHY FORMAT HELPERS IN PERSISTENCE LAYER?
// Same rationale as posts persistence (see docs/STEP_C4_1_PERSISTENCE.md).
// These helpers transform database response shapes into API response shapes.
// This is STRUCTURAL formatting only - no business logic, no authorization.
// Kept in persistence layer because:
//   1. Route handlers stay focused on business logic (validation, auth, error handling)
//   2. Consistent transformation logic (single source of truth)
//   3. Database query details (relationships, joins) owned by persistence
// NOTE: Comment formatting varies by context (list vs moderation), hence multiple helpers.

/**
 * Format comment for list response (top-level with replies)
 * RESPONSIBILITY: Structural transformation only. Builds response shape from:
 *   - Comment record (id, content, status, created_at)
 *   - Author details from joined users table
 *   - Nested replies array
 * IDEMPOTENT: Pure function; same input always produces same output.
 */
export function formatCommentWithReplies(
  comment: Record<string, unknown>,
  replies: Array<Record<string, unknown>> = []
) {
  const commentUsers = comment.users as
    | Array<{ id: string; email: string }>
    | undefined
  const commentAuthor = Array.isArray(commentUsers) ? commentUsers[0] : undefined

  return {
    id: comment.id,
    post_id: comment.post_id,
    author: {
      id: commentAuthor?.id || '',
      email: commentAuthor?.email || '',
    },
    content: comment.content,
    status: comment.status,
    parent_comment_id: comment.parent_comment_id,
    created_at: comment.created_at,
    replies: replies.map((reply) => {
      const replyUsers = reply.users as
        | Array<{ id: string; email: string }>
        | undefined
      const replyAuthor = Array.isArray(replyUsers) ? replyUsers[0] : undefined

      return {
        id: reply.id,
        author: {
          id: replyAuthor?.id || '',
          email: replyAuthor?.email || '',
        },
        content: reply.content,
        created_at: reply.created_at,
      }
    }),
  }
}

/**
 * Format comment for moderation response (approved)
 * RESPONSIBILITY: Structural transformation only.
 * NOTE: Returns FULL response with author + approved_at (per spec/api.md).
 * IDEMPOTENT: Pure function; same input always produces same output.
 */
export function formatApprovedComment(comment: Record<string, unknown>) {
  const users = comment.users as Array<{ id: string; email: string }> | undefined
  const author = Array.isArray(users) ? users[0] : undefined

  return {
    id: comment.id,
    post_id: comment.post_id,
    author: {
      id: author?.id || '',
      email: author?.email || '',
    },
    content: comment.content,
    status: comment.status,
    created_at: comment.created_at,
    approved_at: comment.approved_at,
  }
}

/**
 * Format comment for moderation response (rejected/spam)
 * RESPONSIBILITY: Structural transformation only.
 * NOTE: Returns MINIMAL response (no author, no timestamps) per spec/api.md.\n * This is intentional - rejected/spam comments don't expose author details.\n * IDEMPOTENT: Pure function; same input always produces same output.
 */
export function formatRejectedComment(comment: Record<string, unknown>) {
  return {
    id: comment.id,
    post_id: comment.post_id,
    content: comment.content,
    status: comment.status,
  }
}
