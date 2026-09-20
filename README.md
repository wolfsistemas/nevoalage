# NevoaLaje

SaaS para fábricas de laje pré-moldada: lançamento de cômodos, plano de corte de treliça, peças individuais, traço, custos, entrega e PDF.

Stack: React + Vite + TypeScript + Tailwind. Multi-tenant no Supabase. Front no GitHub Pages (HashRouter).

## Demo local

```bash
npm install
npm run dev
```

- Fábrica: `demo` / `123456`
- Super admin (mesmo login): `superadmin` / `nevoa2026`

## Lógica de corte (do RV Blocos)

Portada de `laje-core.js` / `laje.js`:

- FFD, BFD, RBF, DP (padrão da fábrica)
- Traço: volume 0,1152 m³, 1,5 saco de cimento, 6,5 latas de areia, 5 de brita, 48 m lineares por traço
- Vergalhão CA-60 a partir de 3,40 m

Opções novas:

- MFFD (Modified First Fit Decreasing)
- BEST (roda todos e escolhe menos barras + menos sobra)

## Planos

| Plano   | Mensal | Anual PIX |
|---------|--------|-----------|
| Névoa   | R$ 89  | R$ 850    |
| Oficina | R$ 189 | R$ 1.690  |
| Fábrica | R$ 349 | R$ 2.990  |

Mensal: assinatura Mercado Pago. Anual: PIX.

Schema SQL em `supabase/schema.sql`. Integração MP em `supabase/mercadopago.md`.
