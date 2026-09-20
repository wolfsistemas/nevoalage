import { money, meters, formatDate } from './utils'
import { groupIdenticalBars } from './engine/cutting'
import type { CutPlan, Quote, Delivery, CostLine, MixResult } from './engine/types'

function openPrint(title: string, inner: string) {
  const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1100')
  if (!w) return
  w.document.write(`<!doctype html><html><head><title>${title}</title>
    <style>
      body{font-family:Manrope,Segoe UI,Arial,sans-serif;color:#111;padding:16px;font-size:12px}
      h1{font-size:18px;margin:0} h2{font-size:13px;margin:12px 0 6px;color:#7a5a12}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      th,td{border:1px solid #222;padding:6px;text-align:left}
      th{background:#f1efe6}
      .head{display:flex;justify-content:space-between;border-bottom:2px solid #c9a227;padding-bottom:8px;margin-bottom:10px}
      .muted{color:#555;font-size:11px}
      .box{display:inline-block;margin-left:6px}
      @media print { button{display:none} }
    </style></head><body>
    ${inner}
     <p class="muted" style="margin-top:18px">Gerado pelo NevoaLaje · wolfsaas.com.br/nevoalaje · ${new Date().toLocaleString('pt-BR')}</p>
    <button onclick="window.print()">Imprimir / salvar PDF</button>
    </body></html>`)
  w.document.close()
  setTimeout(() => w.print(), 250)
}

export function printQuote(quote: Quote, company: { nome: string; telefone: string; cidade: string }) {
  const rows = quote.comodos
    .map(
      (c) => `<tr>
        <td>${c.nome}</td><td>${meters(c.vaoMenor)}</td><td>${meters(c.vaoMaior)}</td>
        <td>${c.tipo === 'EPS' ? 'EPS' : 'Lajota'}</td><td>H${c.altura}</td>
        <td>${c.qtdVigotas}</td><td>${meters(c.tamVigota)}</td>
        <td>${c.area.toFixed(2)} m²</td><td>${money(c.valorEstimado)}</td>
      </tr>`,
    )
    .join('')
  openPrint(`Orçamento ${quote.numero}`, `
    <div class="head">
      <div><h1>NevoaLaje</h1><div class="muted">${company.nome} · ${company.cidade} · ${company.telefone}</div></div>
      <div style="text-align:right"><strong>ORÇAMENTO #${quote.numero}</strong><br>
      Cliente: ${quote.clienteNome}<br>Data: ${formatDate(quote.createdAt)}</div>
    </div>
    <table>
      <thead><tr><th>Cômodo</th><th>Vão menor</th><th>Vão maior</th><th>Enchimento</th><th>H</th><th>Vigotas</th><th>Tam.</th><th>Área</th><th>Valor</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p><strong>Área total:</strong> ${quote.areaTotal.toFixed(2)} m² &nbsp; <strong>Total:</strong> ${money(quote.valorTotal)}</p>
    ${quote.observacao ? `<p>Obs.: ${quote.observacao}</p>` : ''}
    <p class="muted">Validade 15 dias. Preços sujeitos a confirmação de visita técnica.</p>
  `)
}

export function printCut(quote: Quote, plan: CutPlan) {
  const grupos = groupIdenticalBars(plan.barras)
  const rows = grupos
    .map(
      (g) => `<tr>
        <td style="text-align:center;font-weight:700">${g.qtd}x</td>
        <td>${g.cortes.map((c) => `${c.toFixed(2)} m <span class="box">☐</span>`).join(' &nbsp;|&nbsp; ')}</td>
        <td>${g.sobra.toFixed(2)} m</td>
      </tr>`,
    )
    .join('')
  openPrint(`Corte ${quote.numero}`, `
    <div class="head">
      <div><h1>Plano de corte de treliça</h1><div class="muted">NevoaLaje · ${plan.algoritmo} · barra ${plan.comprimentoBarra.toFixed(2)} m</div></div>
      <div style="text-align:right"><strong>#${quote.numero}</strong><br>${quote.clienteNome}</div>
    </div>
    <p><strong>${plan.totalBarras} barras</strong> · sobra ${plan.totalSobra.toFixed(2)} m (${plan.perdaPerc.toFixed(1)}%) · ${plan.pecas.reduce((s, p) => s + p.qtd, 0)} cortes</p>
    <table>
      <thead><tr><th>Qtd</th><th>Cortes (marque ☐ ao concluir)</th><th>Sobra</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p>Conferido por: ______________________ &nbsp; Data: ___/___/______</p>
  `)
}

export function printPieces(quote: Quote, pecas: { tamanho: number; qtd: number }[]) {
  const rows = pecas.map((p) => `<tr><td>${p.tamanho.toFixed(2)} m</td><td>${p.qtd}</td><td>☐ ☐ ☐</td></tr>`).join('')
  openPrint(`Peças ${quote.numero}`, `
    <div class="head"><div><h1>Versão de peças individuais</h1><div class="muted">Lista de produção por tamanho</div></div>
    <div style="text-align:right">#${quote.numero}<br>${quote.clienteNome}</div></div>
    <table><thead><tr><th>Tamanho</th><th>Quantidade</th><th>Conferência</th></tr></thead><tbody>${rows}</tbody></table>
  `)
}

export function printCosts(quote: Quote, linhas: CostLine[], mix: MixResult, custo: number, venda: number) {
  const rows = linhas
    .map((l) => `<tr><td>${l.desc}</td><td>${l.qtd}</td><td>${l.composicao}</td><td>${money(l.unitario)}</td><td>${money(l.total)}</td></tr>`)
    .join('')
  openPrint(`Custos ${quote.numero}`, `
    <div class="head"><div><h1>Detalhamento de custos e traço</h1></div>
    <div>#${quote.numero}<br>${quote.clienteNome}</div></div>
    <p>Traço: <strong>${mix.numTracos}</strong> · cimento ${mix.sacosCimento} sc · areia ${mix.areiaM3} m³ · brita ${mix.britaM3} m³ · ${mix.metrosLineares.toFixed(2)} m lineares</p>
    <table><thead><tr><th>Item</th><th>Qtd</th><th>Composição</th><th>Unit.</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
    <p><strong>Custo:</strong> ${money(custo)} &nbsp; <strong>Venda sugerida:</strong> ${money(venda)} &nbsp; <strong>m²:</strong> ${money(venda / Math.max(quote.areaTotal, 0.01))}</p>
  `)
}

export function printDelivery(quote: Quote, d: Delivery) {
  const rows = d.vigotas
    .map((v) => `<tr><td>${v.qtd}x</td><td>${v.tamanho.toFixed(2)} m</td><td>${(v.qtd * v.tamanho).toFixed(2)} m</td><td>☐</td></tr>`)
    .join('')
  const ml = d.vigotas.reduce((s, v) => s + v.qtd * v.tamanho, 0)
  openPrint(`Entrega ${quote.numero}`, `
    <div class="head"><div><h1>Romaneio de entrega</h1><div class="muted">Pré-moldados · ${formatDate(d.data)}</div></div>
    <div>#${quote.numero}<br>${quote.clienteNome}</div></div>
    <p>${d.vigotas.reduce((s, v) => s + v.qtd, 0)} peças · ${ml.toFixed(2)} m lineares</p>
    <table><thead><tr><th>Qtd</th><th>Tamanho</th><th>Metros</th><th>OK</th></tr></thead><tbody>${rows}</tbody></table>
    ${d.observacao ? `<p>Obs.: ${d.observacao}</p>` : ''}
    <p>Recebido por: ______________________ &nbsp; Assinatura: ______________________</p>
  `)
}

export function whatsappQuote(quote: Quote, phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return
  const msg = `*ORÇAMENTO NEVOALAJE #${quote.numero}*\nCliente: ${quote.clienteNome}\nÁrea: ${quote.areaTotal.toFixed(2)} m²\nTotal: ${money(quote.valorTotal)}\n\nCômodos:\n${quote.comodos.map((c) => `• ${c.nome}: ${c.qtdVigotas} vigotas de ${c.tamVigota.toFixed(2)} m (${c.area.toFixed(2)} m²)`).join('\n')}`
  window.open(`https://wa.me/55${digits}?text=${encodeURIComponent(msg)}`, '_blank')
}
