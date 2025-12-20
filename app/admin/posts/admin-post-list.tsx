import AdminPostActions from './admin-post-actions'

interface Post {
  id: string
  title: string
  slug?: string
  status: 'draft' | 'published' | 'archived'
  author?: {
    id: string
    email: string
  }
  created_at: string
  published_at?: string | null
}

interface ApiResponse {
  data: Post[]
}

export default async function AdminPostList() {
  let posts: Post[] = []
  let error: string | null = null

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const adminJwt = process.env.NEXT_PUBLIC_ADMIN_JWT

    if (!adminJwt) {
      throw new Error('Admin JWT not configured')
    }

    const response = await fetch(`${baseUrl}/api/admin/posts`, {
      headers: {
        'Authorization': `Bearer ${adminJwt}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`)
    }

    const data: ApiResponse = await response.json()
    posts = data.data || []
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load posts'
  }

  if (error) {
    return (
      <div style={{
        padding: '1rem',
        marginTop: '1rem',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: '4px',
        border: '1px solid #f5c6cb',
      }}>
        <strong>Error:</strong> {error}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <p style={{ marginTop: '1rem', color: '#666' }}>No posts found.</p>
    )
  }

  return (
    <div style={{ marginTop: '2rem', overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        border: '1px solid #ddd',
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Title</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Status</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Author</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Created At</th>
            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Published At</th>
            <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '1rem' }}>
                <a href={`/posts/${post.id}`} style={{ color: '#007bff', textDecoration: 'none' }}>
                  {post.title}
                </a>
              </td>
              <td style={{ padding: '1rem' }}>
                {post.status === 'draft' ? (
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: '#ffc107',
                    color: '#000',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                  }}>
                    DRAFT
                  </span>
                ) : post.status === 'published' ? (
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                  }}>
                    PUBLISHED
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: '#6c757d',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                  }}>
                    ARCHIVED
                  </span>
                )}
              </td>
              <td style={{ padding: '1rem' }}>
                {post.author?.email || 'Unknown'}
              </td>
              <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#666' }}>
                {new Date(post.created_at).toLocaleDateString()} {new Date(post.created_at).toLocaleTimeString()}
              </td>
              <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#666' }}>
                {post.published_at ? (
                  <>
                    {new Date(post.published_at).toLocaleDateString()} {new Date(post.published_at).toLocaleTimeString()}
                  </>
                ) : (
                  '—'
                )}
              </td>
              <td style={{ padding: '1rem', textAlign: 'center' }}>
                {post.status === 'draft' && (
                  <AdminPostActions postId={post.id} />
                )}
                {post.status !== 'draft' && (
                  <span style={{ color: '#999', fontSize: '0.9rem' }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
