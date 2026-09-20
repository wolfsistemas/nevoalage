# Mercado Pago — NevoaLaje

Site: https://wolfsaas.com.br/nevoalaje

## Planos

| Plano   | Mensal (assinatura) | Anual cartão | Anual PIX |
|---------|---------------------|--------------|-----------|
| Névoa   | R$ 89               | R$ 890       | R$ 850    |
| Oficina | R$ 189              | R$ 1.890     | R$ 1.690  |
| Fábrica | R$ 349              | R$ 3.490     | R$ 2.990  |

## Front

- Public Key no Vite: `VITE_MP_PUBLIC_KEY`
- Checkout: `POST /api/mp/checkout` com `{ plan, kind, email, tenantId }`
  - `kind: monthly` → assinatura (`/preapproval`)
  - `kind: pix_yearly` → Preference PIX
- Retorno: `https://wolfsaas.com.br/nevoalaje/retorno.html` → `/#/checkout/retorno`

## Secrets (somente servidor, nunca no front)

```
MP_ACCESS_TOKEN
MP_CLIENT_ID
MP_CLIENT_SECRET
APP_PUBLIC_URL=https://wolfsaas.com.br/nevoalaje
```

Produção no Supabase: Edge Function `supabase/functions/mp-checkout`.

## Webhook

Cadastre no painel do Mercado Pago (Notificações / Webhooks):

```
https://wiczgrhnvvfeefbyyndb.supabase.co/functions/v1/mp-webhook
```

Tópicos: `payment`, `subscription_preapproval`, `subscription_authorized_payment`.

Secret: `MP_WEBHOOK_SECRET` (Edge Function / `.env` do servidor). Não vai no front.
