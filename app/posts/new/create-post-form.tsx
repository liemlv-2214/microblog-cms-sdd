'use client'

import { useState, useEffect } from 'react'

interface Category {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
}

export default function CreatePostForm() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Load categories and tags on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch(`${baseUrl}/api/categories`),
          fetch(`${baseUrl}/api/tags`),
        ])

        if (!categoriesRes.ok || !tagsRes.ok) {
          throw new Error('Failed to load categories or tags')
        }

        const categoriesData = await categoriesRes.json()
        const tagsData = await tagsRes.json()

        setCategories(categoriesData || [])
        setTags(tagsData || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load form data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const jwt = process.env.NEXT_PUBLIC_USER_JWT
      if (!jwt) {
        throw new Error('Authentication token not found')
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          category_ids: selectedCategoryIds,
          tag_ids: selectedTagIds,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to create post (${response.status})`)
      }

      setSuccess(true)
      setTitle('')
      setContent('')
      setSelectedCategoryIds([])
      setSelectedTagIds([])

      // Optionally redirect after success
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p>Loading form...</p>
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
      {error && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          border: '1px solid #f5c6cb',
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '4px',
          border: '1px solid #c3e6cb',
        }}>
          Draft post created successfully! Redirecting...
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={submitting}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
          placeholder="Enter post title"
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="content" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Content *
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={submitting}
          style={{
            width: '100%',
            minHeight: '300px',
            padding: '0.75rem',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontFamily: 'monospace',
            boxSizing: 'border-box',
          }}
          placeholder="Enter post content"
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Categories
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {categories.length === 0 ? (
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>No categories available</p>
          ) : (
            categories.map((category) => (
              <label key={category.id} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                  disabled={submitting}
                  style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                />
                {category.name}
              </label>
            ))
          )}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Tags
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tags.length === 0 ? (
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>No tags available</p>
          ) : (
            tags.map((tag) => (
              <label key={tag.id} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedTagIds.includes(tag.id)}
                  onChange={() => handleTagToggle(tag.id)}
                  disabled={submitting}
                  style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                />
                {tag.name}
              </label>
            ))
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type="submit"
          disabled={submitting || !title || !content}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: submitting || !title || !content ? 'not-allowed' : 'pointer',
            opacity: submitting || !title || !content ? 0.6 : 1,
          }}
        >
          {submitting ? 'Creating...' : 'Create Draft'}
        </button>
        <a
          href="/"
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'inline-block',
          }}
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
