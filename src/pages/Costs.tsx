import { useMemo, useState } from 'react'
import { Button, Card, Field, Input, Select } from '@/components/ui'
import { useStore } from '@/lib/useStore'
import { detalharCustos, precoVenda } from '@/lib/engine/slab'
import { money } from '@/lib/utils'
import { printCosts } from '@/lib/pdf'

export default function Costs() {
  const s = useStore()
  const [qid, setQid] = useState(s.quotes[0]?.id || '')
  const [margem, setMargem] = useState(40)
  const [frete, setFrete] = useState(6)
  const quote = s.quotes.find((q) => q.id === qid)
  const det = useMemo(() => {
    if (!quote) return null
    return detalharCustos(quote.comodos, s.products, s.algorithm, s.config)
  }, [quote, s.products, s.algorithm, s.config])
  const venda = det ? precoVenda(det.custoTotal, margem, frete) : 0

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl text-white">Custos e traço</h1>
          <p className="text-mist">Mesmo traço da fábrica: 0,1152 m³ por traço, 1,5 saco, 6,5 latas de areia, 5 de brita.</p>
        </div>
        {quote && det && <Button onClick={() => printCosts(quote, det.linhas, det.mix, det.custoTotal, venda)}>PDF custos</Button>}
      </div>
      <Field label="Orçamento">
        <Select value={qid} onChange={(e) => setQid(e.target.value)}>
          {s.quotes.map((q) => (
            <option key={q.id} value={q.id}>#{q.numero} — {q.clienteNome}</option>
          ))}
        </Select>
      </Field>
      {det && (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <Card className="p-4"><div className="text-xs text-mist">Traços</div><div className="text-2xl font-bold">{det.mix.numTracos}</div></Card>
            <Card className="p-4"><div className="text-xs text-mist">Cimento</div><div className="text-2xl font-bold">{det.mix.sacosCimento} sc</div></Card>
            <Card className="p-4"><div className="text-xs text-mist">Areia / Brita</div><div className="text-lg font-bold">{det.mix.areiaM3} / {det.mix.britaM3} m³</div></Card>
            <Card className="p-4"><div className="text-xs text-mist">Lineares</div><div className="text-2xl font-bold">{det.mix.metrosLineares.toFixed(1)} m</div></Card>
          </div>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink text-left text-xs uppercase text-mist">
                <tr><th className="p-3">Item</th><th className="p-3">Qtd</th><th className="p-3">Composição</th><th className="p-3 text-right">Unit.</th><th className="p-3 text-right">Total</th></tr>
              </thead>
              <tbody>
                {det.linhas.map((l) => (
                  <tr key={l.desc} className="border-t border-white/5">
                    <td className="p-3 text-white">{l.desc}</td>
                    <td className="p-3">{l.qtd}</td>
                    <td className="p-3 text-xs text-mist">{l.composicao}</td>
                    <td className="p-3 text-right">{money(l.unitario)}</td>
                    <td className="p-3 text-right">{money(l.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card className="grid gap-4 p-5 md:grid-cols-4">
            <div><div className="text-xs text-mist">Custo</div><div className="text-2xl font-bold">{money(det.custoTotal)}</div></div>
            <Field label="Margem %"><Input type="number" value={margem} onChange={(e) => setMargem(Number(e.target.value))} /></Field>
            <Field label="Frete %"><Input type="number" value={frete} onChange={(e) => setFrete(Number(e.target.value))} /></Field>
            <div>
              <div className="text-xs text-mist">Venda sugerida</div>
              <div className="text-2xl font-bold text-gold">{money(venda)}</div>
              <div className="text-xs text-mist">{money(venda / Math.max(det.areaTotal, 0.01))} / m²</div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
