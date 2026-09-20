/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_PUBLIC_URL?: string
  readonly VITE_MP_PUBLIC_KEY?: string
  readonly VITE_MP_CHECKOUT_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
