import { Link, useSearchParams } from 'react-router-dom'
import { Button, Card } from '@/components/ui'
import { SITE_HOST_PATH, SITE_URL } from '@/lib/site'

export default function CheckoutReturn() {
  const [params] = useSearchParams()
  const status = (params.get('status') || params.get('collection_status') || '').toLowerCase()
  const ok = status === 'approved' || status === 'authorized'
  const pending = status === 'pending' || status === 'in_process'
  return (
    <div className="grid-fog relative flex min-h-screen items-center justify-center p-4">
      <Card className="relative z-10 w-full max-w-md p-8 text-center">
        <h1 className="font-serif text-3xl text-white">{ok ? 'Pagamento confirmado' : pending ? 'Pagamento em análise' : 'Retorno do Mercado Pago'}</h1>
        <p className="mt-3 text-sm text-mist">
          {ok
            ? 'Sua assinatura NevoaLaje foi registrada. Entre no sistema para usar a fábrica.'
            : pending
              ? 'O PIX ainda pode estar aguardando compensação. Você recebe a confirmação no e-mail do Mercado Pago.'
              : 'Se o pagamento não concluiu, tente novamente pelo checkout.'}
        </p>
        <a href={SITE_URL} className="mt-2 block text-xs text-gold">{SITE_HOST_PATH}</a>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/login"><Button>Entrar</Button></Link>
          <Link to="/checkout"><Button variant="line">Outro plano</Button></Link>
        </div>
      </Card>
    </div>
  )
}
