import { notFound } from 'next/navigation'
import CommentForm from './comment-form'

interface Post {
  id: string
  title: string
  content: string
  published_at: string
  author: {
    id: string
    email: string
  }
  categories: Array<{
    id: string
    name: string
    slug: string
  }>
  tags: Array<{
    id: string
    name: string
    slug: string
  }>
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/posts/${id}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      notFound()
    }

    const post: Post = await response.json()

    // Additional check for published status (should be handled by API, but verify)
    if (!post || !post.published_at) {
      notFound()
    }

    return (
      <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
        <a href="/" style={{ display: 'inline-block', marginBottom: '1.5rem', color: '#0066cc', textDecoration: 'none' }}>
          ← Back to Timeline
        </a>

        <article>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', marginTop: 0 }}>
            {post.title}
          </h1>

          <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '2rem' }}>
            <p style={{ margin: 0 }}>
              By <strong>{post.author.email}</strong> on{' '}
              {new Date(post.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div
            style={{
              lineHeight: '1.6',
              fontSize: '1rem',
              marginBottom: '2rem',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}
          >
            {post.content}
          </div>

          {(post.categories.length > 0 || post.tags.length > 0) && (
            <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem', color: '#666', fontSize: '0.9rem' }}>
              {post.categories.length > 0 && (
                <p style={{ margin: '0 0 0.5rem 0' }}>
                  <strong>Categories:</strong> {post.categories.map((cat) => cat.name).join(', ')}
                </p>
              )}
              {post.tags.length > 0 && (
                <p style={{ margin: '0 0 0.5rem 0' }}>
                  <strong>Tags:</strong> {post.tags.map((tag) => tag.name).join(', ')}
                </p>
              )}
            </div>
          )}
        </article>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Submit a Comment</h2>
          <CommentForm postId={id} />
        </div>
      </main>
    )
  } catch (error) {
    console.error('Failed to fetch post:', error)
    notFound()
  }
}
