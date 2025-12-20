import AdminPostList from './admin-post-list'

export default function AdminPostsPage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Admin – Manage Posts</h1>
      <AdminPostList />
    </main>
  )
}
