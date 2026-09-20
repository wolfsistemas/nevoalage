import { useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, Card, Field, Input } from '@/components/ui'
import { PLANS, type PlanId } from '@/lib/plans'
import { startCheckout, type CheckoutKind } from '@/lib/mp'
import { SITE_HOST_PATH, SITE_URL } from '@/lib/site'
import { money } from '@/lib/utils'
import { useStore } from '@/lib/useStore'

export default function Checkout() {
  const [params] = useSearchParams()
  const s = useStore()
  const initial = (params.get('plan') || 'oficina') as PlanId
  const [planId, setPlanId] = useState<PlanId>(PLANS.some((p) => p.id === initial) ? initial : 'oficina')
  const [kind, setKind] = useState<CheckoutKind>(params.get('kind') === 'pix_yearly' ? 'pix_yearly' : 'monthly')
  const [email, setEmail] = useState(s.session?.email && !s.session.email.includes('nevoalaje.com') ? s.session.email : '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const plan = useMemo(() => PLANS.find((p) => p.id === planId) || PLANS[1], [planId])
  const price = kind === 'monthly' ? plan.monthly : plan.yearlyPix

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await startCheckout({
        plan: plan.id,
        kind,
        email,
        tenantId: s.session?.tenantId,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no checkout')
      setLoading(false)
    }
  }

  return (
    <div className="grid-fog relative flex min-h-screen items-center justify-center p-4">
      <div className="noise absolute inset-0" />
      <Card className="relative z-10 w-full max-w-lg overflow-hidden">
        <div className="bg-ink px-8 py-7 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gold font-serif text-2xl text-ink">N</div>
          <h1 className="text-lg font-extrabold tracking-[0.2em]">ASSINATURA NEVOALAJE</h1>
          <a href={SITE_URL} className="mt-1 block text-sm text-gold">{SITE_HOST_PATH}</a>
        </div>
        <form onSubmit={submit} className="space-y-4 p-8">
          {error && <div className="rounded-xl border border-bad/40 bg-bad/10 p-3 text-center text-sm text-bad">{error}</div>}
          <Field label="Plano">
            <div className="grid grid-cols-3 gap-2">
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlanId(p.id)}
                  className={`rounded-xl border px-2 py-3 text-sm ${planId === p.id ? 'border-gold bg-gold/15 text-white' : 'border-white/10 text-mist'}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Cobrança">
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setKind('monthly')} className={`rounded-xl border px-3 py-3 text-sm ${kind === 'monthly' ? 'border-gold bg-gold/15 text-white' : 'border-white/10 text-mist'}`}>
                Mensal cartão
                <div className="mt-1 font-bold text-gold">{money(plan.monthly)}</div>
              </button>
              <button type="button" onClick={() => setKind('pix_yearly')} className={`rounded-xl border px-3 py-3 text-sm ${kind === 'pix_yearly' ? 'border-gold bg-gold/15 text-white' : 'border-white/10 text-mist'}`}>
                Anual PIX
                <div className="mt-1 font-bold text-gold">{money(plan.yearlyPix)}</div>
              </button>
            </div>
          </Field>
          <Field label="E-mail do pagador (Mercado Pago)">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
          </Field>
          <p className="text-sm text-mist">
            {kind === 'monthly' ? 'Assinatura recorrente no cartão.' : 'Pagamento único via PIX, 12 meses.'} Total agora: <b className="text-fog">{money(price)}</b>
          </p>
          <Button className="w-full py-3" type="submit" disabled={loading}>
            {loading ? 'Abrindo Mercado Pago…' : 'Pagar no Mercado Pago'}
          </Button>
          <Link to="/" className="block text-center text-xs text-gold">Voltar</Link>
        </form>
      </Card>
    </div>
  )
}
