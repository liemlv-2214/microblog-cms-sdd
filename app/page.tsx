import { notFound } from 'next/navigation'

interface Post {
  id: string
  title: string
  published_at: string
}

interface ApiResponse {
  data: Post[]
}

export default async function TimelinePage() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/posts`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const data: ApiResponse = await response.json()
    const posts = data.data || []

    return (
      <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0 }}>Timeline</h1>
          <a href="/posts/new" style={{ 
            padding: '0.75rem 1rem', 
            backgroundColor: '#007bff', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '4px',
            fontSize: '1rem'
          }}>
            + Create Post
          </a>
        </div>

        {posts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {posts.map((post) => (
              <li key={post.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                <a href={`/posts/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>
                    {post.title}
                  </h2>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                    {new Date(post.published_at).toLocaleDateString()}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    )
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return (
      <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Timeline</h1>
        <p style={{ color: 'red' }}>Failed to load posts. Please try again later.</p>
      </main>
    )
  }
}
