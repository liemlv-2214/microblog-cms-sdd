// Admin Dashboard
// Central hub for admin management features

'use client'

import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '0.5rem' }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: '1rem', color: '#718096' }}>
            Manage posts, moderate comments, and oversee your microblog
          </p>
        </div>

        {/* Management Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Manage Posts Card */}
          <Link href="/admin/posts" style={{ textDecoration: 'none' }}>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid #e2e8f0',
                height: '100%',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)'
                el.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                el.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📚</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '0.5rem' }}>
                Manage Posts
              </h2>
              <p style={{ color: '#718096', marginBottom: '1rem' }}>
                View, publish, and manage all posts (draft, published, archived)
              </p>
              <div style={{ display: 'flex', alignItems: 'center', color: '#3b82f6', fontWeight: '600' }}>
                Go to Posts <span style={{ marginLeft: '0.5rem' }}>→</span>
              </div>
            </div>
          </Link>

          {/* Moderate Comments Card */}
          <Link href="/admin/comments" style={{ textDecoration: 'none' }}>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid #e2e8f0',
                height: '100%',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)'
                el.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                el.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '0.5rem' }}>
                Moderate Comments
              </h2>
              <p style={{ color: '#718096', marginBottom: '1rem' }}>
                Review and moderate pending comments (approve, reject, or mark as spam)
              </p>
              <div style={{ display: 'flex', alignItems: 'center', color: '#3b82f6', fontWeight: '600' }}>
                Go to Comments <span style={{ marginLeft: '0.5rem' }}>→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer Info */}
        <div
          style={{
            marginTop: '3rem',
            padding: '1.5rem',
            backgroundColor: '#eff6ff',
            borderLeft: '4px solid #3b82f6',
            borderRadius: '4px',
          }}
        >
          <p style={{ color: '#1e40af', fontSize: '0.875rem' }}>
            <strong>Tip:</strong> You can also navigate directly to any section using the URL. Admin dashboard will always show you the latest statistics.
          </p>
        </div>
      </div>
    </main>
  )
}
