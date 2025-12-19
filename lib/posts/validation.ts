// String utilities for post slugification
// Converts post titles to URL-friendly slugs

/**
 * Convert title to URL-friendly slug
 * @param title - Post title
 * @returns Slugified title
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and hyphens)
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Validate post title
 * @param title - Post title to validate
 * @returns { valid: boolean, error?: string }
 */
export function validateTitle(title: unknown): {
  valid: boolean
  error?: string
} {
  if (!title) {
    return { valid: false, error: 'Title is required' }
  }

  if (typeof title !== 'string') {
    return { valid: false, error: 'Title must be a string' }
  }

  if (title.length < 5) {
    return { valid: false, error: 'Title must be at least 5 characters' }
  }

  if (title.length > 200) {
    return { valid: false, error: 'Title must be at most 200 characters' }
  }

  return { valid: true }
}

/**
 * Validate post content
 * @param content - Post content to validate
 * @returns { valid: boolean, error?: string }
 */
export function validateContent(content: unknown): {
  valid: boolean
  error?: string
} {
  if (!content) {
    return { valid: false, error: 'Content is required' }
  }

  if (typeof content !== 'string') {
    return { valid: false, error: 'Content must be a string' }
  }

  if (content.trim().length === 0) {
    return { valid: false, error: 'Content cannot be empty' }
  }

  return { valid: true }
}

/**
 * Validate categories array (optional for drafts, will be required at publish)
 * @param categories - Array of category UUIDs
 * @returns { valid: boolean, error?: string }
 */
export function validateOptionalCategories(categories: unknown): {
  valid: boolean
  error?: string
} {
  // Categories are optional at draft stage per spec/api.md
  // They will be enforced when publishing (C3.2)
  if (!categories) {
    return { valid: true } // Explicitly allow missing categories
  }

  if (!Array.isArray(categories)) {
    return { valid: false, error: 'Categories must be an array' }
  }

  // Empty array is valid for drafts
  if (categories.length === 0) {
    return { valid: true }
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  for (const cat of categories) {
    if (!uuidRegex.test(String(cat))) {
      return { valid: false, error: 'Invalid category UUID format' }
    }
  }

  return { valid: true }
}

/**
 * Validate tag_ids array (UUIDs)
 * @param tagIds - Array of tag UUIDs
 * @returns { valid: boolean, error?: string }
 */
export function validateTagIds(tagIds: unknown): {
  valid: boolean
  error?: string
} {
  if (!tagIds) {
    return { valid: true } // Tags are optional
  }

  if (!Array.isArray(tagIds)) {
    return { valid: false, error: 'tag_ids must be an array' }
  }

  if (tagIds.length === 0) {
    return { valid: true } // Empty array is valid
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  for (const id of tagIds) {
    if (!uuidRegex.test(String(id))) {
      return { valid: false, error: 'Invalid tag UUID format' }
    }
  }

  return { valid: true }
}

/**
 * @deprecated Use validateTagIds instead
 */
export function validateTags(tags: unknown): {
  valid: boolean
  error?: string
} {
  return { valid: true } // Legacy function, no longer used
}

/**
 * Validate post content length for publishing
 * Content must be at least 100 characters
 * @param content - Post content to validate
 * @returns { valid: boolean, error?: string }
 */
export function validateContentForPublish(content: unknown): {
  valid: boolean
  error?: string
} {
  if (!content) {
    return { valid: false, error: 'Content is required' }
  }

  if (typeof content !== 'string') {
    return { valid: false, error: 'Content must be a string' }
  }

  if (content.trim().length < 100) {
    return {
      valid: false,
      error: 'Content must be at least 100 characters for publishing',
    }
  }

  return { valid: true }
}
