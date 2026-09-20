import { useMemo, useState } from 'react'
import { Badge, Button, Card, Field, Select } from '@/components/ui'
import { store } from '@/lib/store'
import { useStore } from '@/lib/useStore'
import { ALGORITHM_META, buildCutPlan, groupIdenticalBars } from '@/lib/engine/cutting'
import { flattenVigotas } from '@/lib/engine/slab'
import { printCut } from '@/lib/pdf'
import type { CutAlgorithm } from '@/lib/engine/types'

const algs: CutAlgorithm[] = ['DP', 'BFD', 'FFD', 'RBF', 'MFFD', 'BEST']

export default function Cut() {
  const s = useStore()
  const aprovados = s.quotes.filter((q) => q.status !== 'CANCELADO')
  const [qid, setQid] = useState(aprovados[0]?.id || '')
  const quote = s.quotes.find((q) => q.id === qid)
  const plan = useMemo(() => {
    if (!quote) return null
    return buildCutPlan(s.algorithm, flattenVigotas(quote.comodos), s.config.barraTrelica)
  }, [quote, s.algorithm, s.config.barraTrelica])
  const grupos = plan ? groupIdenticalBars(plan.barras) : []

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl text-white">Plano de corte</h1>
          <p className="text-mist">Lógica portada do RV Blocos + MFFD e melhor automático.</p>
        </div>
        {quote && plan && <Button onClick={() => printCut(quote, plan)}>Imprimir / PDF</Button>}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Orçamento">
          <Select value={qid} onChange={(e) => setQid(e.target.value)}>
            {aprovados.map((q) => (
              <option key={q.id} value={q.id}>#{q.numero} — {q.clienteNome}</option>
            ))}
          </Select>
        </Field>
        <Field label="Algoritmo">
          <Select value={s.algorithm} onChange={(e) => void store.setAlgorithm(e.target.value as CutAlgorithm)}>
            {algs.map((a) => (
              <option key={a} value={a}>{ALGORITHM_META[a].label}</option>
            ))}
          </Select>
        </Field>
      </div>
      {plan && (
        <>
          <p className="text-sm text-mist">{ALGORITHM_META[s.algorithm].hint} · origem: {ALGORITHM_META[s.algorithm].origem}</p>
          <div className="grid gap-3 sm:grid-cols-4">
            <Card className="p-4"><div className="text-xs text-mist">Barras</div><div className="text-2xl font-bold text-white">{plan.totalBarras}</div></Card>
            <Card className="p-4"><div className="text-xs text-mist">Sobra</div><div className="text-2xl font-bold text-white">{plan.totalSobra.toFixed(2)} m</div></Card>
            <Card className="p-4"><div className="text-xs text-mist">Perda</div><div className="text-2xl font-bold text-gold">{plan.perdaPerc.toFixed(1)}%</div></Card>
            <Card className="p-4"><div className="text-xs text-mist">Cortes</div><div className="text-2xl font-bold text-white">{plan.pecas.reduce((n, p) => n + p.qtd, 0)}</div></Card>
          </div>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink text-left text-xs uppercase text-mist">
                <tr><th className="p-3">Qtd</th><th className="p-3">Cortes na barra de {s.config.barraTrelica.toFixed(2)} m</th><th className="p-3">Sobra</th><th className="p-3">Status</th></tr>
              </thead>
              <tbody>
                {grupos.map((g, i) => (
                  <tr key={i} className="border-t border-white/5">
                    <td className="p-3 font-bold text-gold">{g.qtd}x</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {g.cortes.map((c, j) => (
                          <span key={j} className="rounded-md bg-gold/15 px-2 py-1 font-mono text-xs text-gold-2">{c.toFixed(2)} m ☐</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">{g.sobra.toFixed(2)} m</td>
                    <td className="p-3">
                      <Badge tone={g.sobra < 0.3 ? 'ok' : g.sobra < 0.8 ? 'warn' : 'bad'}>
                        {g.sobra < 0.3 ? 'Ótimo' : g.sobra < 0.8 ? 'Atenção' : 'Desperdício'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}
