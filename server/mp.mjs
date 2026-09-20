import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
if (existsSync(resolve(ROOT, '.env'))) {
  for (const line of readFileSync(resolve(ROOT, '.env'), 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#') || !t.includes('=')) continue
    const i = t.indexOf('=')
    const k = t.slice(0, i).trim()
    const v = t.slice(i + 1).trim()
    if (!process.env[k]) process.env[k] = v
  }
}

const SITE = process.env.VITE_PUBLIC_URL || 'https://wolfsaas.com.br/nevoalaje'
const TOKEN = process.env.MP_ACCESS_TOKEN || ''

export const MP_PLANS = {
  nevoa: { id: 'nevoa', name: 'Névoa', monthly: 89, yearlyPix: 850 },
  oficina: { id: 'oficina', name: 'Oficina', monthly: 189, yearlyPix: 1690 },
  fabrica: { id: 'fabrica', name: 'Fábrica', monthly: 349, yearlyPix: 2990 },
}

async function mp(path, body, method = 'POST') {
  const res = await fetch(`https://api.mercadopago.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = json.message || json.error || `Mercado Pago ${res.status}`
    const err = new Error(msg)
    err.detail = json
    throw err
  }
  return json
}

export async function createCheckout({ plan, kind, email, tenantId }) {
  if (!TOKEN) throw new Error('MP_ACCESS_TOKEN não configurado no servidor')
  const p = MP_PLANS[plan]
  if (!p) throw new Error('Plano inválido')
  const payer = String(email || '').trim().toLowerCase()
  if (!payer.includes('@')) throw new Error('Informe um e-mail válido')
  const back = `${SITE}/retorno.html`
  const ref = `${tenantId || 'lead'}:${p.id}:${kind}`

  if (kind === 'pix_yearly') {
    const pref = await mp('/checkout/preferences', {
      items: [
        {
          title: `NevoaLaje ${p.name} — anual PIX`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: p.yearlyPix,
        },
      ],
      payer: { email: payer },
      payment_methods: {
        excluded_payment_types: [{ id: 'credit_card' }, { id: 'debit_card' }, { id: 'ticket' }, { id: 'atm' }],
        default_payment_method_id: 'pix',
        installments: 1,
      },
      back_urls: { success: back, failure: back, pending: back },
      auto_return: 'approved',
      external_reference: ref,
      statement_descriptor: 'NEVOALAJE',
      metadata: { product: 'nevoalaje', plan: p.id, kind },
    })
    return { init_point: pref.init_point || pref.sandbox_init_point, id: pref.id, kind }
  }

  const sub = await mp('/preapproval', {
    reason: `NevoaLaje ${p.name} mensal`,
    external_reference: ref,
    payer_email: payer,
    back_url: back,
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: p.monthly,
      currency_id: 'BRL',
    },
    status: 'pending',
  })
  return { init_point: sub.init_point || sub.sandbox_init_point, id: sub.id, kind: 'monthly' }
}

function json(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.end(JSON.stringify(body))
}

export async function handleMpRequest(req, res) {
  const url = new URL(req.url || '/', 'http://localhost')
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    res.end()
    return true
  }
  if (url.pathname === '/api/mp/health' && req.method === 'GET') {
    json(res, 200, { ok: true, configured: Boolean(TOKEN), site: SITE })
    return true
  }
  if (url.pathname === '/api/mp/webhook' && (req.method === 'POST' || req.method === 'GET')) {
    if (req.method === 'GET') {
      json(res, 200, { ok: true, service: 'nevoalaje-mp-webhook' })
      return true
    }
    const chunks = []
    for await (const c of req) chunks.push(c)
    json(res, 200, { ok: true })
    return true
  }
  if (url.pathname === '/api/mp/checkout' && req.method === 'POST') {
    const chunks = []
    for await (const c of req) chunks.push(c)
    let payload = {}
    try {
      payload = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
    } catch {
      json(res, 400, { error: 'JSON inválido' })
      return true
    }
    try {
      const out = await createCheckout(payload)
      json(res, 200, out)
    } catch (e) {
      json(res, 400, { error: e.message || 'Falha no checkout' })
    }
    return true
  }
  return false
}

if (process.argv[1] && process.argv[1].endsWith('mp.mjs') && !process.env.MP_AS_MODULE) {
  const port = Number(process.env.MP_PORT || 3001)
  createServer(async (req, res) => {
    const handled = await handleMpRequest(req, res)
    if (!handled) json(res, 404, { error: 'not found' })
  }).listen(port, '127.0.0.1')
}
