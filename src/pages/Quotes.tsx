import { Link } from 'react-router-dom'
import { Badge, Button, Card } from '@/components/ui'
import { useStore } from '@/lib/useStore'
import { formatDate, money } from '@/lib/utils'
import { printQuote, whatsappQuote } from '@/lib/pdf'
import type { QuoteStatus } from '@/lib/engine/types'

const tone: Record<QuoteStatus, 'warn' | 'ok' | 'gold' | 'fog' | 'bad'> = {
  ABERTO: 'warn',
  APROVADO: 'ok',
  PRODUCAO: 'gold',
  ENTREGUE: 'fog',
  CANCELADO: 'bad',
}

export default function Quotes() {
  const s = useStore()
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl text-white">Orçamentos</h1>
          <p className="text-mist">Lançamento de cômodos, valor por m² e status até a entrega.</p>
        </div>
        <Link to="/app/orcamentos/novo">
          <Button>Novo orçamento</Button>
        </Link>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink text-left text-xs uppercase tracking-wide text-mist">
              <tr>
                <th className="p-3">Nº</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Cômodos</th>
                <th className="p-3">Área</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Status</th>
                <th className="p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {s.quotes.map((q) => {
                const client = s.clients.find((c) => c.nome === q.clienteNome)
                return (
                  <tr key={q.id} className="border-t border-white/5">
                    <td className="p-3 font-mono text-gold">#{q.numero}</td>
                    <td className="p-3">
                      <div className="font-medium text-white">{q.clienteNome}</div>
                      <div className="text-xs text-mist">{formatDate(q.createdAt)}</div>
                    </td>
                    <td className="p-3 text-mist">{q.comodos.map((c) => c.nome).join(', ')}</td>
                    <td className="p-3">{q.areaTotal.toFixed(2)} m²</td>
                    <td className="p-3 font-bold text-ok">{money(q.valorTotal)}</td>
                    <td className="p-3">
                      <Badge tone={tone[q.status]}>{q.status}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/app/orcamentos/${q.id}`} className="text-xs text-gold">
                          Abrir
                        </Link>
                        <button className="text-xs text-mist" onClick={() => printQuote(q, s.company)}>
                          PDF
                        </button>
                        <button className="text-xs text-mist" onClick={() => whatsappQuote(q, client?.telefone || '')}>
                          WhatsApp
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
