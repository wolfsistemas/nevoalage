import { useState } from 'react'
import { Button, Card, Field, Input } from '@/components/ui'
import { store } from '@/lib/store'
import { useStore } from '@/lib/useStore'

export default function Clients() {
  const s = useStore()
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', endereco: '', documento: '' })
  const [saving, setSaving] = useState(false)
  async function save() {
    if (!form.nome.trim()) return
    setSaving(true)
    try {
      await store.addClient(form)
      setForm({ nome: '', telefone: '', email: '', endereco: '', documento: '' })
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao cadastrar cliente')
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="space-y-5">
      <h1 className="font-serif text-4xl text-white">Clientes</h1>
      <Card className="grid gap-3 p-5 md:grid-cols-5">
        <Field label="Nome"><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></Field>
        <Field label="Telefone"><Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></Field>
        <Field label="E-mail"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Endereço"><Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} /></Field>
        <div className="flex items-end"><Button disabled={saving} onClick={save}>{saving ? 'Salvando…' : 'Cadastrar'}</Button></div>
      </Card>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink text-left text-xs uppercase text-mist">
            <tr><th className="p-3">Nome</th><th className="p-3">Telefone</th><th className="p-3">Endereço</th></tr>
          </thead>
          <tbody>
            {s.clients.map((c) => (
              <tr key={c.id} className="border-t border-white/5">
                <td className="p-3 text-white">{c.nome}</td>
                <td className="p-3">{c.telefone}</td>
                <td className="p-3 text-mist">{c.endereco}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
