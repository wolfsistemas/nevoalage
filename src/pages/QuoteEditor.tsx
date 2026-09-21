import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, Field, Input, Select } from '@/components/ui'
import { store } from '@/lib/store'
import { useStore } from '@/lib/useStore'
import { money } from '@/lib/utils'
import { calcularComodo } from '@/lib/engine/slab'
import { printQuote, whatsappQuote } from '@/lib/pdf'
import type { FillType, HeightCm, RoomCalc } from '@/lib/engine/types'

const emptyForm = {
  nome: '',
  vaoMenor: '',
  vaoMaior: '',
  tipo: 'EPS' as FillType,
  altura: 12 as HeightCm,
  larguraViga: '12',
}

export default function QuoteEditor() {
  const { id } = useParams()
  const nav = useNavigate()
  const s = useStore()
  const existing = s.quotes.find((q) => q.id === id)
  const [clienteNome, setClienteNome] = useState(existing?.clienteNome || '')
  const [obs, setObs] = useState(existing?.observacao || '')
  const [comodos, setComodos] = useState<RoomCalc[]>(existing?.comodos || [])
  const [form, setForm] = useState(emptyForm)
  const [editIdx, setEditIdx] = useState<number | null>(null)

  const preview = useMemo(
    () =>
      calcularComodo(
        {
          nome: form.nome || 'Cômodo',
          vaoMenor: Number(form.vaoMenor),
          vaoMaior: Number(form.vaoMaior),
          tipo: form.tipo,
          altura: form.altura,
          larguraViga: Number(form.larguraViga),
        },
        s.config,
      ),
    [form, s.config],
  )

  function addRoom() {
    if (!form.nome.trim()) return alert('Informe o nome do cômodo.')
    if (!preview) return alert('Informe vão menor e vão maior.')
    const room = { ...preview, nome: form.nome.trim() }
    if (editIdx !== null) {
      const next = [...comodos]
      next[editIdx] = room
      setComodos(next)
      setEditIdx(null)
    } else setComodos([...comodos, room])
    setForm(emptyForm)
  }

  async function save() {
    if (!clienteNome.trim()) return alert('Informe o cliente.')
    if (!comodos.length) return alert('Adicione pelo menos 1 cômodo.')
    try {
      const saved = await store.saveQuote({ id: existing?.id, clienteNome, comodos, observacao: obs })
      nav(`/app/orcamentos/${existing?.id || saved}`)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao salvar orçamento')
    }
  }

  const area = comodos.reduce((n, c) => n + c.area, 0)
  const valor = comodos.reduce((n, c) => n + c.valorEstimado, 0)
  const client = s.clients.find((c) => c.nome === clienteNome)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl text-white">{existing ? `Orçamento #${existing.numero}` : 'Novo orçamento'}</h1>
          <p className="text-mist">Lançamento dos cômodos com cálculo de vigota, EPS e m².</p>
        </div>
        <div className="flex gap-2">
          {existing && (
            <>
              <Button variant="ink" onClick={() => printQuote({ ...existing, comodos, clienteNome, areaTotal: area, valorTotal: valor, observacao: obs }, s.company)}>
                PDF
              </Button>
              <Button variant="ghost" onClick={() => whatsappQuote({ ...existing, comodos, clienteNome, areaTotal: area, valorTotal: valor }, client?.telefone || '')}>
                WhatsApp
              </Button>
            </>
          )}
          <Button onClick={save}>Salvar</Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <Card className="p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Cliente">
              <Input list="clientes" value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} placeholder="Nome do cliente" />
              <datalist id="clientes">
                {s.clients.map((c) => (
                  <option key={c.id} value={c.nome} />
                ))}
              </datalist>
            </Field>
            <Field label="Observação">
              <Input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Prazo, visita, etc." />
            </Field>
          </div>
          {existing && (
            <div className="mt-3 flex flex-wrap gap-2">
              {(['ABERTO', 'APROVADO', 'PRODUCAO', 'ENTREGUE', 'CANCELADO'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => void store.setQuoteStatus(existing.id, st)}
                  className={`rounded-full px-3 py-1 text-xs ${existing.status === st ? 'bg-gold text-ink' : 'bg-white/5 text-mist'}`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-widest text-mist">Totais</div>
          <div className="mt-2 text-3xl font-extrabold text-white">{money(valor)}</div>
          <div className="text-sm text-mist">{area.toFixed(2)} m² · {comodos.reduce((n, c) => n + c.qtdVigotas, 0)} vigotas</div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 font-bold text-white">{editIdx !== null ? 'Editar cômodo' : 'Adicionar cômodo'}</h2>
        <div className="grid gap-3 md:grid-cols-6">
          <Field label="Nome">
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Sala" />
          </Field>
          <Field label="Vão menor (m)">
            <Input type="number" step="0.01" value={form.vaoMenor} onChange={(e) => setForm({ ...form, vaoMenor: e.target.value })} />
          </Field>
          <Field label="Vão maior (m)">
            <Input type="number" step="0.01" value={form.vaoMaior} onChange={(e) => setForm({ ...form, vaoMaior: e.target.value })} />
          </Field>
          <Field label="Enchimento">
            <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as FillType })}>
              <option value="EPS">Isopor (EPS)</option>
              <option value="LAJOTA_CERAMICA">Lajota cerâmica</option>
            </Select>
          </Field>
          <Field label="Altura">
            <Select value={form.altura} onChange={(e) => setForm({ ...form, altura: Number(e.target.value) as HeightCm })}>
              {[8, 12, 16, 20].map((h) => (
                <option key={h} value={h}>H{h}</option>
              ))}
            </Select>
          </Field>
          <Field label="Viga (cm)">
            <Input type="number" value={form.larguraViga} onChange={(e) => setForm({ ...form, larguraViga: e.target.value })} />
          </Field>
        </div>
        {preview && (
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-5">
            <div className="rounded-xl bg-ink p-3"><div className="text-xs text-mist">Vigotas</div><b>{preview.qtdVigotas}</b></div>
            <div className="rounded-xl bg-ink p-3"><div className="text-xs text-mist">Tamanho</div><b>{preview.tamVigota.toFixed(2)} m</b></div>
            <div className="rounded-xl bg-ink p-3"><div className="text-xs text-mist">EPS</div><b>{preview.tipo === 'EPS' ? `${preview.epsLinear.toFixed(2)} m` : '—'}</b></div>
            <div className="rounded-xl bg-ink p-3"><div className="text-xs text-mist">Área</div><b>{preview.area.toFixed(2)} m²</b></div>
            <div className="rounded-xl bg-ink p-3"><div className="text-xs text-mist">Valor</div><b>{money(preview.valorEstimado)}</b></div>
          </div>
        )}
        <Button className="mt-4" onClick={addRoom}>{editIdx !== null ? 'Atualizar cômodo' : 'Incluir cômodo'}</Button>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink text-left text-xs uppercase text-mist">
            <tr>
              <th className="p-3">Cômodo</th>
              <th className="p-3">Vãos</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Vigotas</th>
              <th className="p-3">Área</th>
              <th className="p-3">Valor</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {comodos.map((c, i) => (
              <tr key={i} className="border-t border-white/5">
                <td className="p-3 font-medium text-white">{c.nome}</td>
                <td className="p-3">{c.vaoMenor.toFixed(2)} × {c.vaoMaior.toFixed(2)}</td>
                <td className="p-3"><Badge tone="gold">{c.tipo === 'EPS' ? `EPS H${c.altura}` : `Lajota H${c.altura}`}</Badge></td>
                <td className="p-3">{c.qtdVigotas} × {c.tamVigota.toFixed(2)} m</td>
                <td className="p-3">{c.area.toFixed(2)} m²</td>
                <td className="p-3">{money(c.valorEstimado)}</td>
                <td className="p-3 text-right">
                  <button className="mr-2 text-xs text-gold" onClick={() => {
                    setEditIdx(i)
                    setForm({
                      nome: c.nome,
                      vaoMenor: String(c.vaoMenor),
                      vaoMaior: String(c.vaoMaior),
                      tipo: c.tipo,
                      altura: c.altura,
                      larguraViga: String(c.larguraViga),
                    })
                  }}>editar</button>
                  <button className="text-xs text-bad" onClick={() => setComodos(comodos.filter((_, x) => x !== i))}>remover</button>
                </td>
              </tr>
            ))}
            {!comodos.length && (
              <tr><td colSpan={7} className="p-6 text-center text-mist">Nenhum cômodo ainda.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
