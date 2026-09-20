import { useMemo, useState } from 'react'
import { Button, Card, Field, Input, Select } from '@/components/ui'
import { store } from '@/lib/store'
import { useStore } from '@/lib/useStore'
import { buildCutPlan } from '@/lib/engine/cutting'
import { flattenVigotas } from '@/lib/engine/slab'
import { formatDate } from '@/lib/utils'
import { printDelivery } from '@/lib/pdf'
import { todayISO } from '@/lib/utils'

export default function Deliveries() {
  const s = useStore()
  const quotes = s.quotes.filter((q) => q.status === 'APROVADO' || q.status === 'PRODUCAO' || q.status === 'ENTREGUE')
  const [qid, setQid] = useState(quotes[0]?.id || s.quotes[0]?.id || '')
  const quote = s.quotes.find((q) => q.id === qid)
  const plan = useMemo(() => {
    if (!quote) return null
    return buildCutPlan(s.algorithm, flattenVigotas(quote.comodos), s.config.barraTrelica)
  }, [quote, s.algorithm, s.config.barraTrelica])
  const entregas = s.deliveries.filter((d) => d.quoteId === qid)
  const entregue: Record<string, number> = {}
  entregas.forEach((e) => e.vigotas.forEach((v) => {
    const k = v.tamanho.toFixed(2)
    entregue[k] = (entregue[k] || 0) + v.qtd
  }))
  const [qtds, setQtds] = useState<Record<string, number>>({})
  const [data, setData] = useState(todayISO())
  const [obs, setObs] = useState('')

  async function registrar() {
    if (!quote || !plan) return
    const vigotas = plan.pecas
      .map((p) => ({ tamanho: p.tamanho, qtd: Number(qtds[p.tamanho.toFixed(2)] ?? Math.max(p.qtd - (entregue[p.tamanho.toFixed(2)] || 0), 0)) }))
      .filter((v) => v.qtd > 0)
    if (!vigotas.length) return alert('Informe ao menos uma peça.')
    await store.addDelivery({ quoteId: quote.id, data, vigotas, observacao: obs })
    setObs('')
    setQtds({})
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-4xl text-white">Entregas</h1>
        <p className="text-mist">Romaneio por tamanho, viagem parcial e conferência na obra.</p>
      </div>
      <Field label="Orçamento">
        <Select value={qid} onChange={(e) => setQid(e.target.value)}>
          {s.quotes.map((q) => (
            <option key={q.id} value={q.id}>#{q.numero} — {q.clienteNome}</option>
          ))}
        </Select>
      </Field>
      {plan && quote && (
        <>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink text-left text-xs uppercase text-mist">
                <tr><th className="p-3">Tamanho</th><th className="p-3">Total</th><th className="p-3">Entregue</th><th className="p-3">Pendente</th></tr>
              </thead>
              <tbody>
                {plan.pecas.map((p) => {
                  const k = p.tamanho.toFixed(2)
                  const e = entregue[k] || 0
                  return (
                    <tr key={k} className="border-t border-white/5">
                      <td className="p-3 font-mono">{k} m</td>
                      <td className="p-3">{p.qtd}</td>
                      <td className="p-3 text-ok">{e}</td>
                      <td className="p-3 text-gold">{p.qtd - e}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
          <Card className="space-y-3 p-5">
            <h2 className="font-bold text-white">Registrar viagem</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Data"><Input type="date" value={data} onChange={(e) => setData(e.target.value)} /></Field>
              <Field label="Obs"><Input value={obs} onChange={(e) => setObs(e.target.value)} /></Field>
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              {plan.pecas.map((p) => {
                const k = p.tamanho.toFixed(2)
                const pend = Math.max(p.qtd - (entregue[k] || 0), 0)
                return (
                  <Field key={k} label={`${k} m (pend. ${pend})`}>
                    <Input type="number" min={0} defaultValue={pend} onChange={(e) => setQtds({ ...qtds, [k]: Number(e.target.value) })} />
                  </Field>
                )
              })}
            </div>
            <Button onClick={registrar}>Salvar entrega</Button>
          </Card>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink text-left text-xs uppercase text-mist">
                <tr><th className="p-3">Data</th><th className="p-3">Peças</th><th className="p-3"></th></tr>
              </thead>
              <tbody>
                {entregas.map((d) => (
                  <tr key={d.id} className="border-t border-white/5">
                    <td className="p-3">{formatDate(d.data)}</td>
                    <td className="p-3 text-mist">{d.vigotas.map((v) => `${v.qtd}x ${v.tamanho.toFixed(2)}m`).join(', ')}</td>
                    <td className="p-3"><button className="text-xs text-gold" onClick={() => printDelivery(quote, d)}>PDF</button></td>
                  </tr>
                ))}
                {!entregas.length && <tr><td colSpan={3} className="p-6 text-center text-mist">Nenhuma viagem ainda.</td></tr>}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}
