'use client'

import { useState } from 'react'

interface CommentFormProps {
  postId: string
}

export default function CommentForm({ postId }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!content.trim()) {
      setError('Comment content is required')
      return
    }

    // DEV ONLY – Auth token for submitting comments
    // In production, use real auth/session
    const token = process.env.NEXT_PUBLIC_USER_JWT
    if (!token) {
      setError('Authentication required to submit comments (DEV mode)')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit comment')
      }

      setContent('')
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1rem' }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          style={{ width: '100%', padding: '0.5rem' }}
          placeholder="Write your comment..."
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Comment submitted for moderation.</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Comment'}
      </button>
    </form>
  )
}
