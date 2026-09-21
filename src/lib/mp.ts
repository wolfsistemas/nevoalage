import { SITE_URL } from './site'
import { SUPABASE_URL } from './supabase'
import type { PlanId } from './plans'

export const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY || ''

const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.monkeycode-ai.live'))

export const MP_CHECKOUT_URL =
  import.meta.env.VITE_MP_CHECKOUT_URL || (isLocal ? '/api/mp/checkout' : `${SUPABASE_URL}/functions/v1/mp-checkout`)

export type CheckoutKind = 'monthly' | 'pix_yearly'

export async function startCheckout(opts: {
  plan: PlanId
  kind: CheckoutKind
  email: string
  tenantId?: string
}) {
  const res = await fetch(MP_CHECKOUT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  })
  const data = (await res.json().catch(() => ({}))) as { init_point?: string; error?: string }
  if (!res.ok || !data.init_point) throw new Error(data.error || 'Falha ao abrir o Mercado Pago')
  window.location.href = data.init_point
}

export function checkoutReturnUrl() {
  return `${SITE_URL}/#/checkout/retorno`
}
