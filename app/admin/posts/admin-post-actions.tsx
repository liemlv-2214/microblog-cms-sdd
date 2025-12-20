'use client'

import { useState } from 'react'

interface AdminPostActionsProps {
  postId: string
}

export default function AdminPostActions({ postId }: AdminPostActionsProps) {
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handlePublish = async () => {
    setPublishing(true)
    setMessage(null)

    try {
      const jwt = process.env.NEXT_PUBLIC_ADMIN_JWT
      if (!jwt) {
        throw new Error('Admin JWT not configured')
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/posts/${postId}/publish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to publish (${response.status})`)
      }

      setMessage({
        type: 'success',
        text: 'Post published successfully. Refreshing...',
      })

      // Refresh page after short delay
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'An error occurred',
      })
    } finally {
      setPublishing(false)
    }
  }

  const handleReject = () => {
    alert('Reject not implemented in v1')
  }

  return (
    <div>
      {message && (
        <div style={{
          padding: '0.5rem',
          marginBottom: '0.5rem',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          borderRadius: '4px',
          fontSize: '0.85rem',
        }}>
          {message.text}
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handlePublish}
          disabled={publishing}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: publishing ? 'not-allowed' : 'pointer',
            opacity: publishing ? 0.6 : 1,
          }}
        >
          {publishing ? 'Publishing...' : 'Publish'}
        </button>
        <button
          onClick={handleReject}
          disabled={publishing}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: publishing ? 'not-allowed' : 'pointer',
            opacity: publishing ? 0.6 : 1,
          }}
        >
          Reject
        </button>
      </div>
    </div>
  )
}
