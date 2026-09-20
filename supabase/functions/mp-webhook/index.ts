const TOKEN = Deno.env.get('MP_ACCESS_TOKEN') || ''
const SECRET = Deno.env.get('MP_WEBHOOK_SECRET') || ''

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
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
  const hex = await hmacHex(SECRET, manifest)
  return hex === expected
}

async function mpGet(path: string) {
  const res = await fetch(`https://api.mercadopago.com${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' },
  })
  return res.json()
}

Deno.serve(async (req) => {
  if (req.method === 'GET') {
    return Response.json({ ok: true, service: 'nevoalaje-mp-webhook' })
  }
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
  if (TOKEN && dataId && type === 'payment') {
    try {
      await mpGet(`/v1/payments/${dataId}`)
    } catch {
      /* ignore lookup errors; MP retries on 5xx, not 200 */
    }
  }
  if (TOKEN && dataId && (type === 'subscription_preapproval' || type === 'preapproval')) {
    try {
      await mpGet(`/preapproval/${dataId}`)
    } catch {
      /* ignore */
    }
  }
  return Response.json({ ok: true })
})
