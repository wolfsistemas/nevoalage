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
- Checkout: `POST <checkout-url>` com `{ plan, kind, email, tenantId }`
  - `kind: monthly` → assinatura (`/preapproval`)
  - `kind: pix_yearly` → Preference PIX
- URL de checkout:
  - local: `/api/mp/checkout` (middleware do Vite, `server/mp.mjs`)
  - produção: `https://wiczgrhnvvfeefbyyndb.supabase.co/functions/v1/mp-checkout`
  - override: `VITE_MP_CHECKOUT_URL`
- Retorno: `https://wolfsaas.com.br/nevoalaje/retorno.html` → `/#/checkout/retorno`

## Edge Functions publicadas (projeto wiczgrhnvvfeefbyyndb)

| Função | URL | verify_jwt |
|--------|-----|-----------|
| mp-checkout | `https://wiczgrhnvvfeefbyyndb.supabase.co/functions/v1/mp-checkout` | false |
| mp-webhook | `https://wiczgrhnvvfeefbyyndb.supabase.co/functions/v1/mp-webhook` | false |

Secrets do projeto: `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `APP_PUBLIC_URL`.
`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são injetados automaticamente.

O `mp-webhook` valida a assinatura `x-signature` (HMAC SHA-256) e, em pagamento
aprovado, liga o tenant (`status = ativo`, `plano`, `trial_ends_at` +12 meses no
PIX) e grava em `payments`.

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
