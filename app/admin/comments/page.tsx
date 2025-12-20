// DEV ONLY – Admin moderation

import Link from 'next/link'
import ModerationActions from './moderation-actions'

interface Comment {
  id: string
  content: string
  author_email: string
  created_at: string
}

export default async function AdminCommentsPage() {
  let comments: Comment[] = []
  let error: string | null = null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/comments/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_JWT || 'demo-token-for-testing'}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch pending comments: ${res.status}`)
    }

    comments = await res.json()
  } catch (err: any) {
    error = err.message
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <Link href="/admin" style={{ color: '#3b82f6', textDecoration: 'none' }}>
          Admin Dashboard
        </Link>
        <span style={{ margin: '0 0.5rem', color: '#718096' }}>/</span>
        <span style={{ color: '#1a202c', fontWeight: '600' }}>Moderate Comments</span>
      </div>

      <h1>Admin – Moderate Comments</h1>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem' }}>
          Error: {error}
        </div>
      )}

      {comments.length === 0 ? (
        <p>No pending comments to moderate.</p>
      ) : (
        <div>
          <p>Pending comments: {comments.length}</p>
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                border: '1px solid #ddd',
                padding: '1rem',
                marginBottom: '1rem',
                borderRadius: '4px',
              }}
            >
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Author:</strong> {comment.author_email}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Date:</strong> {new Date(comment.created_at).toLocaleString()}
              </div>
              <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <strong>Content:</strong>
                <p style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{comment.content}</p>
              </div>
              <ModerationActions commentId={comment.id} />
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
