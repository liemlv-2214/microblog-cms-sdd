// Comment validation utilities
// Validates comment content and parent references

/**
 * Validate comment content
 * @param content - Comment content to validate
 * @returns { valid: boolean, error?: string }
 */
export function validateCommentContent(content: unknown): {
  valid: boolean
  error?: string
} {
  if (!content) {
    return { valid: false, error: 'Comment content is required' }
  }

  if (typeof content !== 'string') {
    return { valid: false, error: 'Comment content must be a string' }
  }

  if (content.trim().length === 0) {
    return { valid: false, error: 'Comment content cannot be empty' }
  }

  if (content.length > 5000) {
    return {
      valid: false,
      error: 'Comment content must be 5000 characters or less',
    }
  }

  return { valid: true }
}

/**
 * Validate parent comment ID format (UUID)
 * @param parentId - Parent comment ID to validate
 * @returns { valid: boolean, error?: string }
 */
export function validateParentCommentId(parentId: unknown): {
  valid: boolean
  error?: string
} {
  if (!parentId) {
    return { valid: true } // Parent ID is optional
  }

  if (typeof parentId !== 'string') {
    return { valid: false, error: 'Parent comment ID must be a string' }
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(parentId)) {
    return { valid: false, error: 'Invalid parent comment ID format' }
  }

  return { valid: true }
}
