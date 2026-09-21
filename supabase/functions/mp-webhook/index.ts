const SITE = Deno.env.get('APP_PUBLIC_URL') || 'https://wolfsaas.com.br/nevoalaje'
const TOKEN = Deno.env.get('MP_ACCESS_TOKEN') || ''
const SECRET = Deno.env.get('MP_WEBHOOK_SECRET') || ''
const SB_URL = Deno.env.get('SUPABASE_URL') || ''
const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

function bytesToHex(buf: ArrayBuffer) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function hmacHex(secret: string, payload: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return bytesToHex(sig)
}

function parseSignature(header: string | null) {
  const out: Record<string, string> = {}
  for (const part of (header || '').split(',')) {
    const [k, v] = part.split('=').map((s) => s.trim())
    if (k && v) out[k] = v
  }
  return out
}

async function validSignature(req: Request, dataId: string) {
  if (!SECRET) return true
  const sig = parseSignature(req.headers.get('x-signature'))
  const requestId = req.headers.get('x-request-id') || ''
  const ts = sig.ts || ''
  const expected = sig.v1 || ''
  if (!ts || !expected) return false
  const hex = await hmacHex(SECRET, `id:${dataId};request-id:${requestId};ts:${ts};`)
  return hex === expected
}

async function mpGet(path: string) {
  const res = await fetch(`https://api.mercadopago.com${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`MP ${res.status}`)
  return res.json()
}

async function rest(path: string, method: string, body: unknown) {
  if (!SB_URL || !SERVICE) return false
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return res.ok
}

async function activate(ref: string, status: string, mpId: string, amount: number, raw: unknown) {
  const [tenantId, plan, kind] = String(ref || '').split(':')
  if (!tenantId || tenantId === 'lead' || !plan) return
  const paid = status === 'approved' || status === 'authorized'
  if (!paid) return
  const patch: Record<string, unknown> = { status: 'ativo', plano: plan }
  if (kind === 'monthly') patch.mp_preapproval_id = String(mpId)
  if (kind === 'pix_yearly') {
    const d = new Date()
    d.setMonth(d.getMonth() + 12)
    patch.trial_ends_at = d.toISOString()
  }
  await rest(`tenants?id=eq.${tenantId}`, 'PATCH', patch)
  await rest('payments', 'POST', {
    tenant_id: tenantId,
    kind: kind === 'monthly' ? 'subscription' : 'pix_yearly',
    plan,
    mp_id: String(mpId),
    status,
    amount: Number(amount) || null,
    raw,
  })
}

Deno.serve(async (req) => {
  if (req.method === 'GET') return Response.json({ ok: true, service: 'nevoalaje-mp-webhook', site: SITE })
  if (req.method !== 'POST') return new Response('method', { status: 405 })

  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }
  const data = (body.data || {}) as Record<string, unknown>
  const dataId = String(data.id || body.id || '')
  if (!(await validSignature(req, dataId))) {
    return Response.json({ error: 'invalid signature' }, { status: 401 })
  }

  const type = String(body.type || body.topic || '')
  try {
    if (TOKEN && dataId && type === 'payment') {
      const pay = await mpGet(`/v1/payments/${dataId}`)
      await activate(String(pay.external_reference || ''), String(pay.status || ''), dataId, Number(pay.transaction_amount), pay)
    } else if (TOKEN && dataId && (type === 'subscription_preapproval' || type === 'preapproval')) {
      const pre = await mpGet(`/preapproval/${dataId}`)
      await activate(String(pre.external_reference || ''), String(pre.status || ''), dataId, Number(pre.auto_recurring?.transaction_amount), pre)
    } else if (TOKEN && dataId && type === 'subscription_authorized_payment') {
      const inv = await mpGet(`/authorized_payments/${dataId}`)
      await activate(String(inv.external_reference || ''), String(inv.status || ''), dataId, Number(inv.transaction_amount), inv)
    }
  } catch {
    // MP retries automatically; never 5xx on our own errors
  }
  return Response.json({ ok: true })
})
