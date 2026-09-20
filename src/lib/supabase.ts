import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://wiczgrhnvvfeefbyyndb.supabase.co'
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpY3pncmhudnZmZWVmYnl5bmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MTE0MzUsImV4cCI6MjEwNTQ4NzQzNX0.CbHa4sKyjZmBJvCV48MbrV38H7IpxVSA6XI-uJCG4-M'

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export const supabaseConfigured = true

export function resolveLoginEmail(raw: string) {
  const u = raw.trim().toLowerCase()
  if (u === 'superadmin') return 'superadmin@nevoalaje.com'
  if (u === 'demo' || u === 'oficina') return 'oficina@nevoalaje.com'
  return u
}
