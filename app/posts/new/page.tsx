import CreatePostForm from './create-post-form'

export default function CreatePostPage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Create Post</h1>
      <CreatePostForm />
    </main>
  )
}
