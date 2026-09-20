const SITE = Deno.env.get('APP_PUBLIC_URL') || 'https://wolfsaas.com.br/nevoalaje'
const TOKEN = Deno.env.get('MP_ACCESS_TOKEN') || ''

const PLANS: Record<string, { id: string; name: string; monthly: number; yearlyPix: number }> = {
  nevoa: { id: 'nevoa', name: 'Névoa', monthly: 89, yearlyPix: 850 },
  oficina: { id: 'oficina', name: 'Oficina', monthly: 189, yearlyPix: 1690 },
  fabrica: { id: 'fabrica', name: 'Fábrica', monthly: 349, yearlyPix: 2990 },
}

async function mp(path: string, body: unknown) {
  const res = await fetch(`https://api.mercadopago.com${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || json.error || `Mercado Pago ${res.status}`)
  return json
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    })
  }
  if (req.method !== 'POST') return new Response('method', { status: 405 })
  try {
    const payload = await req.json()
    const p = PLANS[payload.plan]
    if (!p) throw new Error('Plano inválido')
    const payer = String(payload.email || '').trim().toLowerCase()
    if (!payer.includes('@')) throw new Error('Informe um e-mail válido')
    const kind = payload.kind === 'pix_yearly' ? 'pix_yearly' : 'monthly'
    const back = `${SITE}/retorno.html`
    const ref = `${payload.tenantId || 'lead'}:${p.id}:${kind}`
    let out
    if (kind === 'pix_yearly') {
      out = await mp('/checkout/preferences', {
        items: [{ title: `NevoaLaje ${p.name} — anual PIX`, quantity: 1, currency_id: 'BRL', unit_price: p.yearlyPix }],
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
      })
    } else {
      out = await mp('/preapproval', {
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
    }
    return Response.json(
      { init_point: out.init_point || out.sandbox_init_point, id: out.id, kind },
      { headers: { 'Access-Control-Allow-Origin': '*' } },
    )
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Falha no checkout' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } })
  }
})
