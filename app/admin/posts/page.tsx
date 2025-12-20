import Link from 'next/link'
import AdminPostList from './admin-post-list'

export default function AdminPostsPage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <Link href="/admin" style={{ color: '#3b82f6', textDecoration: 'none' }}>
          Admin Dashboard
        </Link>
        <span style={{ margin: '0 0.5rem', color: '#718096' }}>/</span>
        <span style={{ color: '#1a202c', fontWeight: '600' }}>Manage Posts</span>
      </div>

      <h1>Admin – Manage Posts</h1>
      <AdminPostList />
    </main>
  )
}
