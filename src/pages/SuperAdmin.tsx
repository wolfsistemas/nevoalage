import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card } from '@/components/ui'
import { store } from '@/lib/store'
import { useStore } from '@/lib/useStore'
import { SITE_HOST_PATH, SITE_URL } from '@/lib/site'
import { PLANS } from '@/lib/plans'
import { money } from '@/lib/utils'
import { LogOut, Shield } from 'lucide-react'

const tone = {
  ativo: 'ok' as const,
  trial: 'gold' as const,
  inadimplente: 'bad' as const,
  cancelado: 'fog' as const,
}

export default function SuperAdmin() {
  const nav = useNavigate()
  const s = useStore()
  const mrr = s.tenants
    .filter((t) => t.status === 'ativo')
    .reduce((n, t) => n + (PLANS.find((p) => p.id === t.plano)?.monthly || 0), 0)

  async function logout() {
    await store.logout()
    nav('/login')
  }

  return (
    <div className="min-h-screen bg-ink text-fog">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gold text-ink"><Shield className="h-4 w-4" /></div>
          <div>
            <div className="text-xs font-extrabold tracking-[0.25em]">NEVOALAJE · SUPER ADMIN</div>
            <a href={SITE_URL} className="text-[11px] text-gold">{SITE_HOST_PATH}</a>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-sm text-mist hover:text-white">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </header>
      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <h1 className="font-serif text-4xl text-white">Operação da plataforma</h1>
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="p-4"><div className="text-xs text-mist">Tenants</div><div className="text-2xl font-bold">{s.tenants.length}</div></Card>
          <Card className="p-4"><div className="text-xs text-mist">Ativos</div><div className="text-2xl font-bold text-ok">{s.tenants.filter((t) => t.status === 'ativo').length}</div></Card>
          <Card className="p-4"><div className="text-xs text-mist">MRR</div><div className="text-2xl font-bold text-gold">{money(mrr)}</div></Card>
          <Card className="p-4"><div className="text-xs text-mist">Inadimplentes</div><div className="text-2xl font-bold text-bad">{s.tenants.filter((t) => t.status === 'inadimplente').length}</div></Card>
        </div>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-3 text-left text-xs uppercase text-mist">
              <tr>
                <th className="p-3">Fábrica</th>
                <th className="p-3">Plano</th>
                <th className="p-3">Status</th>
                <th className="p-3">Usuários</th>
                <th className="p-3">Orçamentos</th>
                <th className="p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {s.tenants.map((t) => (
                <tr key={t.id} className="border-t border-white/5">
                  <td className="p-3">
                    <div className="font-medium text-white">{t.nome}</div>
                    <div className="text-xs text-mist">{t.cidade} · {t.slug}</div>
                  </td>
                  <td className="p-3">
                    <select
                      className="rounded-lg bg-ink px-2 py-1 text-xs"
                      value={t.plano}
                      onChange={(e) => void store.setTenantPlan(t.id, e.target.value as (typeof t)['plano'])}
                    >
                      {PLANS.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3"><Badge tone={tone[t.status]}>{t.status}</Badge></td>
                  <td className="p-3">{t.usuarios}</td>
                  <td className="p-3">{t.orcamentos}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => void store.setTenantStatus(t.id, 'ativo')}>ativar</Button>
                      <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => void store.setTenantStatus(t.id, 'inadimplente')}>bloquear</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card className="p-5 text-sm text-mist">
          Login de super admin no mesmo formulário: usuário <b className="text-fog">superadmin</b> e senha <b className="text-fog">nevoa2026</b>.
          No Supabase isso vira um registro em <code>platform_admins</code>, isolado dos tenants.
        </Card>
      </main>
    </div>
  )
}
