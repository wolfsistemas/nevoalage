import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Field, Input } from '@/components/ui'
import { store } from '@/lib/store'
import { SITE_HOST_PATH, SITE_URL } from '@/lib/site'

export default function Login() {
  const nav = useNavigate()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await store.login(user, pass)
    setLoading(false)
    if (!res.ok) {
      setError(res.error || 'Falha no login')
      return
    }
    nav(res.superadmin ? '/super' : '/app')
  }

  return (
    <div className="grid-fog relative flex min-h-screen items-center justify-center p-4">
      <div className="noise absolute inset-0" />
      <Card className="relative z-10 w-full max-w-md overflow-hidden">
        <div className="bg-ink px-8 py-8 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gold font-serif text-3xl text-ink">N</div>
          <h1 className="text-xl font-extrabold tracking-[0.25em]">NEVOALAJE</h1>
          <a href={SITE_URL} className="mt-1 block text-sm text-gold">{SITE_HOST_PATH}</a>
        </div>
        <form onSubmit={submit} className="space-y-4 p-8">
          {error && <div className="rounded-xl border border-bad/40 bg-bad/10 p-3 text-center text-sm text-bad">{error}</div>}
          <Field label="Usuário / e-mail">
            <Input value={user} onChange={(e) => setUser(e.target.value)} placeholder="demo ou superadmin" autoFocus />
          </Field>
          <Field label="Senha">
            <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••" />
          </Field>
          <Button className="w-full py-3" type="submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
          <p className="text-center text-xs text-mist">
            Fábrica: <b className="text-fog">demo / 123456</b>
            <br />
            Super admin no mesmo login: <b className="text-fog">superadmin / nevoa2026</b>
          </p>
          <Link to="/" className="block text-center text-xs text-gold">Voltar à landing</Link>
        </form>
      </Card>
    </div>
  )
}
