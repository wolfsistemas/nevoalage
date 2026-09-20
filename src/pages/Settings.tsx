import { useState } from 'react'
import { Button, Card, Field, Input } from '@/components/ui'
import { store } from '@/lib/store'
import { useStore } from '@/lib/useStore'
import { Link } from 'react-router-dom'
import { PLANS } from '@/lib/plans'
import { money, uid } from '@/lib/utils'
import type { Product } from '@/lib/engine/types'

export default function Settings() {
  const s = useStore()
  const [cfg, setCfg] = useState(s.config)
  const [prod, setProd] = useState({ descricao: '', unidade: 'un', custoUnitario: 0, tipo: 'material' as Product['tipo'] })

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl text-white">Fábrica</h1>
      <Card className="p-5">
        <h2 className="mb-3 font-bold text-white">Medidas e traço</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <Field label="Inter-eixo EPS"><Input type="number" step="0.01" value={cfg.interEixoEps} onChange={(e) => setCfg({ ...cfg, interEixoEps: Number(e.target.value) })} /></Field>
          <Field label="Inter-eixo lajota"><Input type="number" step="0.01" value={cfg.interEixoLajota} onChange={(e) => setCfg({ ...cfg, interEixoLajota: Number(e.target.value) })} /></Field>
          <Field label="Barra treliça (m)"><Input type="number" value={cfg.barraTrelica} onChange={(e) => setCfg({ ...cfg, barraTrelica: Number(e.target.value) })} /></Field>
          <Field label="Lajotas / m²"><Input type="number" value={cfg.lajotasPorM2} onChange={(e) => setCfg({ ...cfg, lajotasPorM2: Number(e.target.value) })} /></Field>
        </div>
        <Button className="mt-4" onClick={async () => { await store.saveConfig(cfg); alert('Configuração salva.') }}>Salvar medidas</Button>
      </Card>
      <Card className="p-5">
        <h2 className="mb-3 font-bold text-white">Preço de venda m²</h2>
        <div className="grid gap-3 md:grid-cols-4">
          {Object.entries(cfg.precosM2).map(([k, v]) => (
            <Field key={k} label={k}>
              <Input type="number" value={v} onChange={(e) => setCfg({ ...cfg, precosM2: { ...cfg.precosM2, [k]: Number(e.target.value) } })} />
            </Field>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-bold text-white">Itens de custo</h2>
        </div>
        <div className="grid gap-2 border-t border-white/10 p-4 md:grid-cols-5">
          <Input placeholder="Descrição" value={prod.descricao} onChange={(e) => setProd({ ...prod, descricao: e.target.value })} />
          <Input placeholder="Un" value={prod.unidade} onChange={(e) => setProd({ ...prod, unidade: e.target.value })} />
          <Input type="number" value={prod.custoUnitario} onChange={(e) => setProd({ ...prod, custoUnitario: Number(e.target.value) })} />
          <Button onClick={async () => { if (!prod.descricao) return; await store.saveProduct({ ...prod, id: uid('p') }); setProd({ descricao: '', unidade: 'un', custoUnitario: 0, tipo: 'material' }) }}>Incluir</Button>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {s.products.map((p) => (
              <tr key={p.id} className="border-t border-white/5">
                <td className="p-3">{p.descricao}</td>
                <td className="p-3 text-mist">{p.unidade}</td>
                <td className="p-3">{money(p.custoUnitario)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card className="p-5">
        <h2 className="mb-3 font-bold text-white">Assinatura Mercado Pago</h2>
        <p className="text-sm text-mist">Mensal via cartão (recorrência). Anual via PIX com desconto.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.id} className="rounded-2xl border border-white/10 p-4">
              <div className="font-serif text-2xl">{p.name}</div>
              <div className="text-gold">{money(p.monthly)}/mês</div>
              <div className="text-xs text-mist">Anual PIX {money(p.yearlyPix)}</div>
              <Link to={`/checkout?plan=${p.id}`} className="mt-3 block">
                <Button className="w-full" variant="line">Assinar {p.name}</Button>
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
