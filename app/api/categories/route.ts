// Generated from spec/api.md
// GET /api/categories - List Categories

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db/supabase'

interface CategoryResponse {
  id: string
  name: string
  slug: string
}

/**
 * GET /api/categories - List Categories
 *
 * Returns a list of all active categories.
 * Public endpoint (no authentication required).
 * Required for Create Post UI (E5) to display available categories for selection.
 *
 * Spec: spec/api.md
 */
export async function GET(request: NextRequest) {
  // FETCH ACTIVE CATEGORIES
  // - Query database for all active categories (is_active = true)
  // - Order by name alphabetically
  // - Return only id, name, slug fields

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }

  // TRANSFORM & RETURN RESPONSE
  // - Format categories as array
  // - Return 200 with category list
  const response: CategoryResponse[] = (categories || []).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
  }))

  return NextResponse.json(response, { status: 200 })
}
