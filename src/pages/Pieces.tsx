import { useMemo, useState } from 'react'
import { Button, Card, Field, Select } from '@/components/ui'
import { useStore } from '@/lib/useStore'
import { buildCutPlan } from '@/lib/engine/cutting'
import { flattenVigotas } from '@/lib/engine/slab'
import { printPieces } from '@/lib/pdf'

export default function Pieces() {
  const s = useStore()
  const [qid, setQid] = useState(s.quotes[0]?.id || '')
  const quote = s.quotes.find((q) => q.id === qid)
  const plan = useMemo(() => {
    if (!quote) return null
    return buildCutPlan(s.algorithm, flattenVigotas(quote.comodos), s.config.barraTrelica)
  }, [quote, s.algorithm, s.config.barraTrelica])

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl text-white">Peças individuais</h1>
          <p className="text-mist">Cada corte do plano vira uma vigota. Lista para produção.</p>
        </div>
        {quote && plan && <Button onClick={() => printPieces(quote, plan.pecas)}>PDF da lista</Button>}
      </div>
      <Field label="Orçamento">
        <Select value={qid} onChange={(e) => setQid(e.target.value)}>
          {s.quotes.map((q) => (
            <option key={q.id} value={q.id}>#{q.numero} — {q.clienteNome}</option>
          ))}
        </Select>
      </Field>
      {quote && (
        <Card className="p-5">
          <h2 className="mb-3 font-bold text-white">Por cômodo (lançamento)</h2>
          <div className="grid gap-2 md:grid-cols-2">
            {quote.comodos.map((c) => (
              <div key={c.nome} className="rounded-xl bg-ink p-3 text-sm">
                <b className="text-white">{c.nome}</b>
                <div className="text-mist">{c.qtdVigotas} vigotas de {c.tamVigota.toFixed(2)} m · {c.area.toFixed(2)} m²</div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {plan && (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink text-left text-xs uppercase text-mist">
              <tr><th className="p-3">Tamanho real do corte</th><th className="p-3">Quantidade</th><th className="p-3">Metros</th></tr>
            </thead>
            <tbody>
              {plan.pecas.map((p) => (
                <tr key={p.tamanho} className="border-t border-white/5">
                  <td className="p-3 font-mono text-gold-2">{p.tamanho.toFixed(2)} m</td>
                  <td className="p-3">{p.qtd}</td>
                  <td className="p-3">{(p.qtd * p.tamanho).toFixed(2)} m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
