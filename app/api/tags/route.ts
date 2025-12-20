// Generated from spec/api.md
// GET /api/tags - List Tags

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db/supabase'

interface TagResponse {
  id: string
  name: string
  slug: string
}

/**
 * GET /api/tags - List Tags
 *
 * Returns a list of all available tags.
 * Public endpoint (no authentication required).
 * Required for Create Post UI (E5) to display available tags for selection.
 *
 * Spec: spec/api.md
 */
export async function GET(request: NextRequest) {
  // FETCH ALL TAGS
  // - Query database for all available tags
  // - Order by name alphabetically
  // - Return only id, name, slug fields

  const { data: tags, error } = await supabase
    .from('tags')
    .select('id, name, slug')
    .order('name', { ascending: true })

  if (error) {
    console.error('Failed to fetch tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }

  // TRANSFORM & RETURN RESPONSE
  // - Format tags as array
  // - Return 200 with tag list
  const response: TagResponse[] = (tags || []).map((tag: any) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
  }))

  return NextResponse.json(response, { status: 200 })
}
