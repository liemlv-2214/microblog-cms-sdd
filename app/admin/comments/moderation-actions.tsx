// DEV ONLY – Admin moderation

'use client'

import { useState } from 'react'

interface ModerationActionsProps {
  commentId: string
}

export default function ModerationActions({ commentId }: ModerationActionsProps) {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function moderate(newStatus: 'approved' | 'rejected' | 'spam') {
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/admin/comments/${commentId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_JWT || 'demo-token-for-testing'}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        throw new Error(`Failed to moderate comment: ${res.status}`)
      }

      setStatus(newStatus)
      setMessage({ type: 'success', text: `Comment marked as ${newStatus}` })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (status) {
    return (
      <div style={{ color: '#155724', fontWeight: 'bold' }}>
        ✓ Marked as {status}
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <button
          onClick={() => moderate('approved')}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          Approve
        </button>
        <button
          onClick={() => moderate('rejected')}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          Reject
        </button>
        <button
          onClick={() => moderate('spam')}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          Spam
        </button>
      </div>

      {message && (
        <p
          style={{
            margin: '0.5rem 0 0 0',
            fontSize: '0.9rem',
            color: message.type === 'success' ? '#155724' : '#721c24',
          }}
        >
          {message.text}
        </p>
      )}
    </div>
  )
}
