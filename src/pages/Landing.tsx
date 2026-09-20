import { Link } from 'react-router-dom'
import { ArrowRight, Boxes, Check, Layers3, Printer, Ruler, Truck, Wallet } from 'lucide-react'
import { PLANS } from '@/lib/plans'
import { money } from '@/lib/utils'
import { Button } from '@/components/ui'

const features = [
  { icon: Ruler, title: 'Lançamento de cômodos', text: 'Vão menor, vão maior, enchimento EPS ou lajota, altura H8–H20 e acréscimo de viga.' },
  { icon: Layers3, title: 'Corte de treliça', text: 'FFD, BFD, DP e RBF do chão de fábrica, mais MFFD e melhor automático.' },
  { icon: Boxes, title: 'Peças individuais', text: 'Cada corte vira vigota. Lista por tamanho para produção e conferência.' },
  { icon: Wallet, title: 'Traço e custo', text: 'Cimento, areia, brita, ART, laudo, comissão e preço de venda com margem.' },
  { icon: Truck, title: 'Entrega parcial', text: 'Romaneio por viagem, pendências por tamanho e assinatura na obra.' },
  { icon: Printer, title: 'PDF e WhatsApp', text: 'Orçamento, plano de corte, peças, custos e romaneio — imprimir ou enviar.' },
]

export default function Landing() {
  return (
    <div className="grid-fog relative min-h-screen overflow-hidden">
      <div className="noise absolute inset-0" />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold font-serif text-xl text-ink">N</div>
          <div>
            <div className="text-sm font-extrabold tracking-[0.2em] text-fog">NEVOALAJE</div>
            <div className="text-[11px] text-mist">Laje pré-moldada, do cômodo à entrega</div>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-mist md:flex">
          <a href="#produto">Produto</a>
          <a href="#planos">Planos</a>
          <Link to="/login">Entrar</Link>
        </nav>
        <Link to="/login">
          <Button>Entrar no sistema</Button>
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-10 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-gold">SaaS para fábrica de laje</p>
          <h1 className="font-serif text-5xl leading-[1.05] text-white md:text-6xl">
            Corte certo.
            <br />
            <span className="italic text-gold-2">Obra no prazo.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-mist">
            Sistema feito para quem fabrica laje pré-moldada. Lança cômodos, gera o plano de corte da treliça, lista as peças, calcula o traço e controla a entrega — do jeito que a oficina já usa no dia a dia.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login">
              <Button className="px-6 py-3">
                Abrir demonstração <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#planos">
              <Button variant="line">Ver planos</Button>
            </a>
          </div>
          <p className="mt-4 text-xs text-mist">Demo: usuario <b className="text-fog">demo</b> · senha <b className="text-fog">123456</b></p>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-gold/10 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-ink-2 p-5">
            <div className="mb-4 flex items-center justify-between text-xs text-mist">
              <span>Plano de corte · #1042 João Batista</span>
              <span className="text-ok">perda 4,8%</span>
            </div>
            <div className="space-y-3">
              {[
                { q: '4x', cuts: ['4.32', '4.32', '3.22'] },
                { q: '3x', cuts: ['5.15', '3.80', '2.90'] },
                { q: '2x', cuts: ['4.32', '3.22', '2.90', '1.50'] },
              ].map((row) => (
                <div key={row.q} className="flex items-center gap-3 rounded-xl bg-ink p-3">
                  <div className="w-10 text-center font-bold text-gold">{row.q}</div>
                  <div className="flex flex-1 gap-1">
                    {row.cuts.map((c) => (
                      <div key={c} className="flex-1 rounded-md bg-gold/20 py-3 text-center text-[11px] font-bold text-gold-2">
                        {c} m
                      </div>
                    ))}
                    <div className="w-8 rounded-md bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-ink p-3"><div className="text-mist">Barras</div><div className="text-lg font-bold text-white">9</div></div>
              <div className="rounded-xl bg-ink p-3"><div className="text-mist">Peças</div><div className="text-lg font-bold text-white">29</div></div>
              <div className="rounded-xl bg-ink p-3"><div className="text-mist">m²</div><div className="text-lg font-bold text-white">43,8</div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="produto" className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-serif text-4xl text-white">Tudo o que a fábrica precisa</h2>
        <p className="mt-3 max-w-2xl text-mist">Do lançamento do cômodo até o romaneio assinado na obra. A lógica de corte e o traço vieram do uso real em pré-moldados.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-ink-2/70 p-5">
              <f.icon className="mb-3 h-5 w-5 text-gold" />
              <h3 className="font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-mist">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="planos" className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-serif text-4xl text-white">Planos mensais e anuais</h2>
        <p className="mt-3 text-mist">Assinatura no Mercado Pago. Plano anual com desconto via PIX.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.id} className={`rounded-3xl border p-6 ${p.highlight ? 'border-gold bg-gold/10' : 'border-white/10 bg-ink-2/80'}`}>
              {p.highlight && <div className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">Mais usado</div>}
              <h3 className="font-serif text-3xl text-white">{p.name}</h3>
              <p className="mt-1 text-sm text-mist">{p.tagline}</p>
              <div className="mt-5">
                <div className="text-3xl font-extrabold text-white">{money(p.monthly)}<span className="text-sm font-medium text-mist">/mês</span></div>
                <div className="text-sm text-mist">Anual cartão {money(p.yearly)} · PIX {money(p.yearlyPix)}</div>
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-fog"><Check className="mt-0.5 h-4 w-4 text-gold" />{f}</li>
                ))}
              </ul>
              <Link to={`/login?plan=${p.id}`} className="mt-6 block">
                <Button className="w-full" variant={p.highlight ? 'gold' : 'ink'}>Começar {p.name}</Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-10 text-center text-xs text-mist">
        NevoaLaje · multi-tenant · GitHub Pages + Supabase · Mercado Pago
      </footer>
    </div>
  )
}
