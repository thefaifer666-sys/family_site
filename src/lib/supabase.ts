import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_KEY as string

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_KEY in .env.local')
}

export const supabase = createClient(url, key)

export const PHOTO_BUCKET = 'family-photos'

export type SuggestionRow = {
  id: string
  name: string
  category: string
  text: string
  likes: number
  created_at: string
}

export type ReplyRow = {
  id: string
  suggestion_id: string
  name: string
  text: string
  created_at: string
}

export type PhotoRow = {
  id: string
  storage_path: string
  caption: string
  uploaded_by: string
  created_at: string
}
