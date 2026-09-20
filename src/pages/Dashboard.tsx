import { Link } from 'react-router-dom'
import { Card } from '@/components/ui'
import { useStore } from '@/lib/useStore'
import { money } from '@/lib/utils'
import { flattenVigotas } from '@/lib/engine/slab'
import { buildCutPlan } from '@/lib/engine/cutting'

export default function Dashboard() {
  const s = useStore()
  const abertos = s.quotes.filter((q) => q.status === 'ABERTO').length
  const aprovados = s.quotes.filter((q) => q.status === 'APROVADO').length
  const m2 = s.quotes.reduce((n, q) => n + q.areaTotal, 0)
  const receita = s.quotes.filter((q) => q.status !== 'CANCELADO').reduce((n, q) => n + q.valorTotal, 0)
  const q = s.quotes[0]
  const plan = q ? buildCutPlan(s.algorithm, flattenVigotas(q.comodos), s.config.barraTrelica) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl text-white">Painel da fábrica</h1>
        <p className="text-mist">Orçamento, corte, peças e entrega no mesmo fluxo.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { k: 'Abertos', v: abertos },
          { k: 'Aprovados', v: aprovados },
          { k: 'm² no mês', v: m2.toFixed(1) },
          { k: 'Pipeline', v: money(receita) },
        ].map((x) => (
          <Card key={x.k} className="p-5">
            <div className="text-xs uppercase tracking-widest text-mist">{x.k}</div>
            <div className="mt-2 text-2xl font-extrabold text-white">{x.v}</div>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-bold text-white">Último corte</h2>
          {plan && q ? (
            <div className="mt-4">
              <p className="text-sm text-mist">
                #{q.numero} {q.clienteNome} · {plan.algoritmo} · {plan.totalBarras} barras · perda {plan.perdaPerc.toFixed(1)}%
              </p>
              <div className="mt-3 space-y-2">
                {plan.barras.slice(0, 4).map((b, i) => (
                  <div key={i} className="flex gap-1">
                    {b.cortes.map((c, j) => (
                      <div key={j} className="rounded bg-gold/20 px-2 py-1 text-[11px] font-bold text-gold-2">
                        {c.toFixed(2)}
                      </div>
                    ))}
                    <div className="rounded bg-white/5 px-2 py-1 text-[11px] text-mist">sobra {b.sobra.toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <Link to="/app/corte" className="mt-4 inline-block text-sm text-gold">
                Abrir plano de corte
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-mist">Nenhum orçamento ainda.</p>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="font-bold text-white">Atalhos</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              ['Novo orçamento', '/app/orcamentos/novo'],
              ['Corte', '/app/corte'],
              ['Entregas', '/app/entregas'],
              ['Custos', '/app/custos'],
            ].map(([l, t]) => (
              <Link key={t} to={t} className="rounded-xl border border-white/10 bg-ink px-3 py-3 text-sm hover:border-gold/40">
                {l}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
