// E3.2 – Display Approved Comments
// Server component to fetch and render approved comments on post detail page

interface CommentReply {
  id: string
  author: {
    id: string
    email: string
  }
  content: string
  created_at: string
}

interface Comment {
  id: string
  author: {
    id: string
    email: string
  }
  content: string
  created_at: string
  replies?: CommentReply[]
}

interface CommentListProps {
  postId: string
}

export default async function CommentList({ postId }: CommentListProps) {
  let comments: Comment[] = []
  let error: string | null = null

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/posts/${postId}/comments`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.status}`)
    }

    const result = await response.json()
    comments = result.data || []
  } catch (err: any) {
    error = err.message
  }

  console.log('Fetched comments:', comments)

  return (
    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Comments</h2>

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {!error && comments.length === 0 && (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No comments yet.</p>
      )}

      {!error && comments.length > 0 && (
        <div>
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                marginBottom: '2rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <strong>{comment.author.email}</strong> on{' '}
                {new Date(comment.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>

              <div
                style={{
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  marginBottom: comment.replies && comment.replies.length > 0 ? '1rem' : 0,
                }}
              >
                {comment.content}
              </div>

              {comment.replies && comment.replies.length > 0 && (
                <div
                  style={{
                    marginTop: '1rem',
                    marginLeft: '1.5rem',
                    paddingLeft: '1rem',
                    borderLeft: '2px solid #eee',
                  }}
                >
                  {comment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      style={{
                        marginBottom: '1rem',
                        fontSize: '0.95rem',
                      }}
                    >
                      <div style={{ color: '#666', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        <strong>{reply.author.email}</strong> on{' '}
                        {new Date(reply.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div
                        style={{
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word',
                        }}
                      >
                        {reply.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
