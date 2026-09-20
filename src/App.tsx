import { useEffect, useState, type ReactNode } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import AppShell from './pages/AppShell'
import Dashboard from './pages/Dashboard'
import Quotes from './pages/Quotes'
import QuoteEditor from './pages/QuoteEditor'
import Cut from './pages/Cut'
import Pieces from './pages/Pieces'
import Costs from './pages/Costs'
import Deliveries from './pages/Deliveries'
import Clients from './pages/Clients'
import Settings from './pages/Settings'
import SuperAdmin from './pages/SuperAdmin'
import { useStore } from './lib/useStore'
import { store } from './lib/store'

function Guard({ children, superadmin }: { children: ReactNode; superadmin?: boolean }) {
  const s = useStore()
  if (!s.session) return <Navigate to="/login" replace />
  if (superadmin && !s.isSuperAdmin) return <Navigate to="/app" replace />
  if (!superadmin && s.isSuperAdmin) return <Navigate to="/super" replace />
  return children
}

export default function App() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    store.init().finally(() => setReady(true))
  }, [])
  if (!ready) {
    return (
      <div className="grid h-screen place-items-center bg-ink text-mist">
        Conectando ao Supabase…
      </div>
    )
  }
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/super"
          element={
            <Guard superadmin>
              <SuperAdmin />
            </Guard>
          }
        />
        <Route
          path="/app"
          element={
            <Guard>
              <AppShell />
            </Guard>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="orcamentos" element={<Quotes />} />
          <Route path="orcamentos/novo" element={<QuoteEditor />} />
          <Route path="orcamentos/:id" element={<QuoteEditor />} />
          <Route path="corte" element={<Cut />} />
          <Route path="pecas" element={<Pieces />} />
          <Route path="custos" element={<Costs />} />
          <Route path="entregas" element={<Deliveries />} />
          <Route path="clientes" element={<Clients />} />
          <Route path="config" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
