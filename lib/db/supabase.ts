// Supabase client initialization
// Provides typed database access for the app
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Create Supabase client
 * Uses anon key for client-side operations with RLS policies
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Database types (minimal, expand as needed)
 */
export interface Post {
  id: string
  title: string
  slug: string
  content: string
  author_id: string
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  is_active: boolean
}

export interface Tag {
  id: string
  name: string
  slug: string
}
