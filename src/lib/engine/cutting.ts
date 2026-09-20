import type { BarPattern, CutAlgorithm, CutPlan } from './types'

function round3(n: number) {
  return parseFloat(n.toFixed(3))
}

function finishBars(barras: { cortes: number[] }[], comprimentoBarra: number): BarPattern[] {
  const result = barras.map((barra) => {
    const usado = barra.cortes.reduce((s, c) => s + c, 0)
    return {
      cortes: [...barra.cortes].sort((a, b) => b - a),
      usado: round3(usado),
      sobra: round3(comprimentoBarra - usado),
    }
  })
  result.sort((a, b) => a.sobra - b.sobra)
  return result
}

export function binPackingFFD(tamanhos: number[], comprimentoBarra = 12): BarPattern[] {
  const sorted = [...tamanhos].sort((a, b) => b - a)
  const barras: { cortes: number[] }[] = []
  for (const tam of sorted) {
    let alocado = false
    for (const barra of barras) {
      const usado = barra.cortes.reduce((s, c) => s + c, 0)
      if (usado + tam <= comprimentoBarra + 0.001) {
        barra.cortes.push(tam)
        alocado = true
        break
      }
    }
    if (!alocado) barras.push({ cortes: [tam] })
  }
  return finishBars(barras, comprimentoBarra)
}

export function binPackingBFD(tamanhos: number[], comprimentoBarra = 12): BarPattern[] {
  const sorted = [...tamanhos].sort((a, b) => b - a)
  const barras: { cortes: number[] }[] = []
  for (const tam of sorted) {
    let bestIdx = -1
    let bestSobra = Infinity
    for (let i = 0; i < barras.length; i++) {
      const usado = barras[i].cortes.reduce((s, c) => s + c, 0)
      const sobraAtual = comprimentoBarra - usado
      if (sobraAtual >= tam - 0.001) {
        const novaSobra = sobraAtual - tam
        if (novaSobra < bestSobra) {
          bestSobra = novaSobra
          bestIdx = i
        }
      }
    }
    if (bestIdx !== -1) barras[bestIdx].cortes.push(tam)
    else barras.push({ cortes: [tam] })
  }
  return finishBars(barras, comprimentoBarra)
}

export function binPackingRBF(tamanhos: number[], comprimentoBarra = 12, iteracoes = 120): BarPattern[] {
  if (tamanhos.length === 0) return []
  let melhorBarras: BarPattern[] | null = null
  let melhorSobraTotal = Infinity
  let melhorNumBarras = Infinity
  for (let iter = 0; iter < iteracoes; iter++) {
    const copia = [...tamanhos]
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copia[i], copia[j]] = [copia[j], copia[i]]
    }
    const barras = binPackingBFD(copia, comprimentoBarra)
    const sobraTotal = barras.reduce((s, b) => s + b.sobra, 0)
    const numBarras = barras.length
    if (numBarras < melhorNumBarras || (numBarras === melhorNumBarras && sobraTotal < melhorSobraTotal)) {
      melhorBarras = barras
      melhorSobraTotal = sobraTotal
      melhorNumBarras = numBarras
    }
  }
  return (melhorBarras ?? []).sort((a, b) => a.sobra - b.sobra)
}

export function binPackingDP(tamanhos: number[], comprimentoBarra = 12, precisao = 100): BarPattern[] {
  if (tamanhos.length === 0) return []
  const escala = precisao
  const C = Math.round(comprimentoBarra * escala)
  const itens = tamanhos.map((t) => Math.round(t * escala))
  const contagem = new Map<number, number>()
  itens.forEach((t) => contagem.set(t, (contagem.get(t) || 0) + 1))

  function knapsackBounded(disponivel: Map<number, number>) {
    const todosItens: number[] = []
    for (const [tam, qtd] of disponivel) {
      for (let q = 0; q < qtd; q++) todosItens.push(tam)
    }
    const MAX_ITENS = 60
    const itensUsados = todosItens.slice(0, MAX_ITENS)
    const m = itensUsados.length
    const dp = new Int32Array(C + 1)
    const escolha = Array.from({ length: m }, () => new Uint8Array(C + 1))
    for (let i = 0; i < m; i++) {
      const tam = itensUsados[i]
      for (let c = C; c >= tam; c--) {
        if (dp[c - tam] + tam > dp[c]) {
          dp[c] = dp[c - tam] + tam
          escolha[i][c] = 1
        }
      }
    }
    const pecasEscolhidas: number[] = []
    let c = C
    for (let i = m - 1; i >= 0; i--) {
      if (escolha[i][c]) {
        pecasEscolhidas.push(itensUsados[i])
        c -= itensUsados[i]
      }
    }
    return {
      usado: dp[C] > 0 ? dp[C] : dp.reduce((mx, v) => Math.max(mx, v), 0),
      pecas: pecasEscolhidas,
    }
  }

  const barras: BarPattern[] = []
  const disponivel = new Map(contagem)
  let totalRestante = itens.length
  while (totalRestante > 0) {
    const resultado = knapsackBounded(disponivel)
    if (resultado.pecas.length === 0) {
      for (const [tam, qtd] of disponivel) {
        if (qtd > 0) {
          resultado.pecas = [tam]
          resultado.usado = tam
          break
        }
      }
    }
    const contLocal = new Map<number, number>()
    resultado.pecas.forEach((p) => contLocal.set(p, (contLocal.get(p) || 0) + 1))
    for (const [tam, qtdUsada] of contLocal) {
      disponivel.set(tam, (disponivel.get(tam) || 0) - qtdUsada)
      if ((disponivel.get(tam) || 0) <= 0) disponivel.delete(tam)
      totalRestante -= qtdUsada
    }
    const usadoReal = round3(resultado.usado / escala)
    barras.push({
      cortes: resultado.pecas.map((p) => round3(p / escala)).sort((a, b) => b - a),
      usado: usadoReal,
      sobra: round3(comprimentoBarra - usadoReal),
    })
  }
  barras.sort((a, b) => a.sobra - b.sobra)
  return barras
}

export function binPackingMFFD(tamanhos: number[], comprimentoBarra = 12): BarPattern[] {
  if (tamanhos.length === 0) return []
  const large = tamanhos.filter((t) => t > comprimentoBarra / 2).sort((a, b) => b - a)
  const medium = tamanhos.filter((t) => t > comprimentoBarra / 3 && t <= comprimentoBarra / 2).sort((a, b) => b - a)
  const small = tamanhos.filter((t) => t <= comprimentoBarra / 3).sort((a, b) => b - a)

  const barras: { cortes: number[] }[] = []
  for (const tam of large) barras.push({ cortes: [tam] })

  for (const tam of medium) {
    let bestIdx = -1
    let bestSobra = Infinity
    for (let i = 0; i < barras.length; i++) {
      const usado = barras[i].cortes.reduce((s, c) => s + c, 0)
      const sobra = comprimentoBarra - usado
      if (sobra >= tam - 0.001 && sobra - tam < bestSobra) {
        bestSobra = sobra - tam
        bestIdx = i
      }
    }
    if (bestIdx !== -1) barras[bestIdx].cortes.push(tam)
    else barras.push({ cortes: [tam] })
  }

  const restantes = [...small]
  for (const tam of restantes) {
    let bestIdx = -1
    let bestSobra = Infinity
    for (let i = 0; i < barras.length; i++) {
      const usado = barras[i].cortes.reduce((s, c) => s + c, 0)
      const sobra = comprimentoBarra - usado
      if (sobra >= tam - 0.001 && sobra - tam < bestSobra) {
        bestSobra = sobra - tam
        bestIdx = i
      }
    }
    if (bestIdx !== -1) barras[bestIdx].cortes.push(tam)
    else barras.push({ cortes: [tam] })
  }

  return finishBars(barras, comprimentoBarra)
}

function scorePlan(plan: BarPattern[]) {
  const barras = plan.length
  const sobra = plan.reduce((s, b) => s + b.sobra, 0)
  return barras * 1000 + sobra
}

export function runAlgorithm(alg: CutAlgorithm, tamanhos: number[], comprimentoBarra = 12): BarPattern[] {
  switch (alg) {
    case 'BFD':
      return binPackingBFD(tamanhos, comprimentoBarra)
    case 'RBF':
      return binPackingRBF(tamanhos, comprimentoBarra)
    case 'DP':
      return binPackingDP(tamanhos, comprimentoBarra)
    case 'MFFD':
      return binPackingMFFD(tamanhos, comprimentoBarra)
    case 'BEST': {
      const candidates: { alg: CutAlgorithm; barras: BarPattern[] }[] = [
        { alg: 'DP', barras: binPackingDP(tamanhos, comprimentoBarra) },
        { alg: 'BFD', barras: binPackingBFD(tamanhos, comprimentoBarra) },
        { alg: 'MFFD', barras: binPackingMFFD(tamanhos, comprimentoBarra) },
        { alg: 'FFD', barras: binPackingFFD(tamanhos, comprimentoBarra) },
        { alg: 'RBF', barras: binPackingRBF(tamanhos, comprimentoBarra, 80) },
      ]
      candidates.sort((a, b) => scorePlan(a.barras) - scorePlan(b.barras))
      return candidates[0].barras
    }
    default:
      return binPackingFFD(tamanhos, comprimentoBarra)
  }
}

export function buildCutPlan(alg: CutAlgorithm, tamanhos: number[], comprimentoBarra = 12): CutPlan {
  const barras = runAlgorithm(alg, tamanhos, comprimentoBarra)
  const totalSobra = round3(barras.reduce((s, b) => s + b.sobra, 0))
  const pecasMap = new Map<string, { tamanho: number; qtd: number }>()
  barras.forEach((barra) => {
    barra.cortes.forEach((corte) => {
      const key = corte.toFixed(2)
      const cur = pecasMap.get(key)
      if (cur) cur.qtd += 1
      else pecasMap.set(key, { tamanho: corte, qtd: 1 })
    })
  })
  const pecas = [...pecasMap.values()].sort((a, b) => b.tamanho - a.tamanho)
  return {
    algoritmo: alg,
    comprimentoBarra,
    barras,
    totalBarras: barras.length,
    totalSobra,
    perdaPerc: barras.length ? (totalSobra / (barras.length * comprimentoBarra)) * 100 : 0,
    pecas,
  }
}

export function groupIdenticalBars(barras: BarPattern[]) {
  const map = new Map<string, { cortes: number[]; qtd: number; sobra: number }>()
  barras.forEach((b) => {
    const key = JSON.stringify(b.cortes)
    const cur = map.get(key)
    if (cur) cur.qtd += 1
    else map.set(key, { cortes: b.cortes, qtd: 1, sobra: b.sobra })
  })
  return [...map.values()].sort((a, b) => b.qtd - a.qtd)
}

export const ALGORITHM_META: Record<CutAlgorithm, { label: string; hint: string; origem: string }> = {
  DP: {
    label: 'DP (prática RV)',
    hint: 'Programação dinâmica — o algoritmo do dia a dia da fábrica.',
    origem: 'RV Blocos',
  },
  BFD: {
    label: 'BFD',
    hint: 'Best Fit Decreasing — encaixa no melhor resto disponível.',
    origem: 'RV Blocos',
  },
  FFD: {
    label: 'FFD',
    hint: 'First Fit Decreasing — rápido e previsível.',
    origem: 'RV Blocos',
  },
  RBF: {
    label: 'RBF',
    hint: 'Randomized Best Fit — tenta várias ordens e fica com a melhor.',
    origem: 'RV Blocos',
  },
  MFFD: {
    label: 'MFFD (novo)',
    hint: 'Modified FFD — agrupa peças grandes, médias e pequenas. Costuma reduzir barra extra.',
    origem: 'Opção nova',
  },
  BEST: {
    label: 'Melhor automático',
    hint: 'Roda DP, BFD, MFFD, FFD e RBF e escolhe o plano com menos barras e menos sobra.',
    origem: 'NevoaLaje',
  },
}
