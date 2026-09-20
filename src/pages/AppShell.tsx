import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Boxes,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Printer,
  Scissors,
  Settings,
  Truck,
  Users,
  Wallet,
} from 'lucide-react'
import { store } from '@/lib/store'
import { useStore } from '@/lib/useStore'
import { SITE_HOST_PATH, SITE_URL } from '@/lib/site'
import { cn } from '@/lib/utils'

const items = [
  { to: '/app', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/app/orcamentos', label: 'Orçamentos', icon: FileSpreadsheet },
  { to: '/app/corte', label: 'Corte', icon: Scissors },
  { to: '/app/pecas', label: 'Peças', icon: Boxes },
  { to: '/app/custos', label: 'Custos / traço', icon: Wallet },
  { to: '/app/entregas', label: 'Entregas', icon: Truck },
  { to: '/app/clientes', label: 'Clientes', icon: Users },
  { to: '/app/config', label: 'Fábrica', icon: Settings },
]

export default function AppShell() {
  const nav = useNavigate()
  const s = useStore()
  async function logout() {
    await store.logout()
    nav('/login')
  }
  return (
    <div className="flex min-h-screen bg-ink text-fog">
      <aside className="no-print hidden w-64 shrink-0 flex-col border-r border-white/10 bg-ink-2 md:flex">
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gold font-serif text-lg text-ink">N</div>
          <div>
            <a href={SITE_URL} className="text-xs font-extrabold tracking-[0.2em]">NEVOALAJE</a>
            <div className="text-[11px] text-gold">{SITE_HOST_PATH}</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm',
                  isActive ? 'bg-gold/15 text-gold-2' : 'text-mist hover:bg-white/5 hover:text-fog',
                )
              }
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="m-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-mist hover:bg-white/5">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-8">
          <div className="text-sm text-mist">
            {s.session?.nome} · plano <span className="text-gold">Oficina</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-mist">
            <Printer className="h-4 w-4" /> PDFs prontos para a oficina
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
        <nav className="no-print grid grid-cols-5 border-t border-white/10 bg-ink-2 md:hidden">
          {items.slice(0, 5).map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => cn('flex flex-col items-center py-2 text-[10px]', isActive ? 'text-gold' : 'text-mist')}>
              <it.icon className="h-4 w-4" />
              {it.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
