# Mercado Pago — NevoaLaje

## Planos

| Plano   | Mensal (assinatura) | Anual cartão | Anual PIX |
|---------|---------------------|--------------|-----------|
| Névoa   | R$ 89               | R$ 890       | R$ 850    |
| Oficina | R$ 189              | R$ 1.890     | R$ 1.690  |
| Fábrica | R$ 349              | R$ 3.490     | R$ 2.990  |

## Mensal — Assinaturas (preapproval)

1. Crie 3 planos em `/preapproval_plan` com `auto_recurring.frequency = 1` e `frequency_type = months`.
2. No checkout, crie `/preapproval` com `preapproval_plan_id`, `payer_email` e `back_url` da GH Pages.
3. Webhook `subscription_preapproval` atualiza `tenants.status` e `tenants.plano`.

## Anual — PIX avulso

1. Preference ou Payments API com `payment_methods.default_payment_method_id = pix`.
2. `external_reference = tenant_id:plan:yearly`.
3. Webhook `payment` com status `approved` estende `trial_ends_at` / marca `ativo` por 12 meses.

## Secrets (Supabase Edge Functions, nunca no front)

```
MP_ACCESS_TOKEN
MP_WEBHOOK_SECRET
APP_PUBLIC_URL
```

O front no GitHub Pages só redireciona para o init_point retornado pela Edge Function.
