import type { MixResult, Product, RoomCalc, RoomInput, TenantConfig } from './types'
import { buildCutPlan } from './cutting'
import type { CutAlgorithm, CostLine } from './types'

export const DEFAULT_CONFIG: TenantConfig = {
  interEixoEps: 0.5,
  interEixoLajota: 0.43,
  barraTrelica: 12,
  barraVergalhao: 12,
  capeamentoEspessura: 0.02,
  capeamentoLargura: 0.12,
  volumePorTraco: 0.1152,
  metrosLinearesPorTraco: 48,
  cimentoPorTraco: 1.5,
  latasAreiaPorTraco: 6.5,
  latasBritaPorTraco: 5,
  lataLitros: 0.018,
  vergalhaoMinimo: 3.4,
  lajotasPorM2: 13,
  precosM2: {
    eps_h8: 92,
    eps_h12: 108,
    eps_h16: 124,
    eps_h20: 142,
    lajota_ceramica_h8: 86,
    lajota_ceramica_h12: 98,
    lajota_ceramica_h16: 112,
    lajota_ceramica_h20: 128,
  },
}

export function calcularComodo(input: RoomInput, config: TenantConfig = DEFAULT_CONFIG): RoomCalc | null {
  const vm = Number(input.vaoMenor) || 0
  const vM = Number(input.vaoMaior) || 0
  const lv = Number(input.larguraViga) || 0
  if (vm <= 0 || vM <= 0) return null
  const acrescimo = lv / 100
  const tamVigota = vm + acrescimo
  const interEixo = input.tipo === 'EPS' ? config.interEixoEps : config.interEixoLajota
  const qtdVigotas = Math.ceil(vM / interEixo)
  const epsLinear = input.tipo === 'EPS' ? (qtdVigotas - 1) * vm : 0
  const area = vm * vM
  const key = `${input.tipo === 'EPS' ? 'eps' : 'lajota_ceramica'}_h${input.altura}`
  const precoM2 = config.precosM2[key] ?? 0
  return {
    ...input,
    qtdVigotas,
    tamVigota: parseFloat(tamVigota.toFixed(3)),
    epsLinear: parseFloat(epsLinear.toFixed(3)),
    area: parseFloat(area.toFixed(3)),
    precoM2,
    valorEstimado: parseFloat((area * precoM2).toFixed(2)),
  }
}

export function flattenVigotas(comodos: RoomCalc[]) {
  const tamanhos: number[] = []
  comodos.forEach((c) => {
    for (let i = 0; i < c.qtdVigotas; i++) tamanhos.push(c.tamVigota)
  })
  return tamanhos
}

export function calcularTraco(metrosLineares: number, config: TenantConfig = DEFAULT_CONFIG): MixResult {
  const secao = config.capeamentoLargura * config.capeamentoEspessura
  const volumeConcreto = metrosLineares * secao
  const numTracos = Math.ceil(volumeConcreto / config.volumePorTraco)
  const areiaM3 = numTracos * (config.latasAreiaPorTraco * config.lataLitros)
  const britaM3 = numTracos * (config.latasBritaPorTraco * config.lataLitros)
  return {
    volumeConcreto: parseFloat(volumeConcreto.toFixed(4)),
    numTracos,
    sacosCimento: Math.ceil(numTracos * config.cimentoPorTraco),
    areiaM3: parseFloat(areiaM3.toFixed(3)),
    britaM3: parseFloat(britaM3.toFixed(3)),
    latasAreia: Math.round(areiaM3 / config.lataLitros),
    latasBrita: Math.round(britaM3 / config.lataLitros),
    metrosLineares: parseFloat(metrosLineares.toFixed(3)),
  }
}

function findCost(produtos: Product[], nome: string, fallback: number) {
  const p = produtos.find((x) => x.descricao === nome)
  return p ? Number(p.custoUnitario) : fallback
}

export function detalharCustos(
  comodos: RoomCalc[],
  produtos: Product[],
  algoritmo: CutAlgorithm,
  config: TenantConfig = DEFAULT_CONFIG,
) {
  const tamanhos = flattenVigotas(comodos)
  const metrosLineares = tamanhos.reduce((a, b) => a + b, 0)
  const plan = buildCutPlan(algoritmo, tamanhos, config.barraTrelica)
  const mix = calcularTraco(metrosLineares, config)
  const tipos = new Set(comodos.map((c) => c.tipo))
  const alturas = comodos.map((c) => c.altura)
  const alturaModa = alturas.sort((a, b) => b - a)[0] || 8
  const totalArea = comodos.reduce((s, c) => s + c.area, 0)
  const totalEps = comodos.filter((c) => c.tipo === 'EPS').reduce((s, c) => s + c.epsLinear, 0)

  const linhas: CostLine[] = []
  let custoTotal = 0
  const add = (desc: string, qtd: string, composicao: string, unitario: number, total: number) => {
    linhas.push({ desc, qtd, composicao, unitario, total })
    custoTotal += total
  }

  const trelicaNome = `Treliça TG${alturaModa} 12m`
  const custoTrelica = findCost(produtos, trelicaNome, alturaModa <= 8 ? 68 : alturaModa <= 12 ? 92 : 105)
  add('Treliça', `${plan.totalBarras} barras`, `${metrosLineares.toFixed(2)} m lineares`, custoTrelica, plan.totalBarras * custoTrelica)

  if (tipos.has('EPS')) {
    const placas = Math.ceil(totalEps)
    const custo = findCost(produtos, `EPS H${alturaModa} placa 50x100`, 11.9)
    add('EPS (isopor)', `${placas} placas`, `${totalEps.toFixed(2)} m lineares`, custo, placas * custo)
    const frete = findCost(produtos, 'Frete Isopor', 0)
    if (frete > 0) add('Frete do isopor', '1 un', '', frete, frete)
  }
  if (tipos.has('LAJOTA_CERAMICA')) {
    const pecas = Math.ceil(totalArea * config.lajotasPorM2)
    const custo = findCost(produtos, 'Lajota Cerâmica', 1.7)
    add('Lajota', `${pecas} peças`, `${config.lajotasPorM2} un/m²`, custo, pecas * custo)
    add('Frete da lajota', '1 un', '', findCost(produtos, 'Frete Lajota', 50), findCost(produtos, 'Frete Lajota', 50))
  }

  add('Cimento', `${mix.sacosCimento} sacos`, `${mix.numTracos} traços`, findCost(produtos, 'Cimento CP II 50kg', 37), mix.sacosCimento * findCost(produtos, 'Cimento CP II 50kg', 37))
  add('Areia Grossa', `${mix.areiaM3.toFixed(3)} m³`, `${mix.latasAreia} latas (18 L)`, findCost(produtos, 'Areia Grossa', 200), mix.areiaM3 * findCost(produtos, 'Areia Grossa', 200))
  add('Brita 0', `${mix.britaM3.toFixed(3)} m³`, `${mix.latasBrita} latas (18 L)`, findCost(produtos, 'Brita 0', 200), mix.britaM3 * findCost(produtos, 'Brita 0', 200))

  const vergTams = tamanhos.filter((t) => t >= config.vergalhaoMinimo)
  if (vergTams.length) {
    const vergPlan = buildCutPlan('DP', vergTams, config.barraVergalhao)
    const custoBarra = findCost(produtos, 'Vergalhão CA-60 6mm', 25)
    add('Vergalhão CA-60 6mm', `${vergPlan.totalBarras} barras 12m`, `${vergTams.length} peças ≥ ${config.vergalhaoMinimo.toFixed(2)} m`, custoBarra, vergPlan.totalBarras * custoBarra)
  }

  add('Disco de Corte', '1 un', '', findCost(produtos, 'Disco de Corte', 10), findCost(produtos, 'Disco de Corte', 10))
  add('ART', '1 un', '', findCost(produtos, 'ART', 28), findCost(produtos, 'ART', 28))
  add('Plotagem', '1 un', '', findCost(produtos, 'Plotagem de Projeto', 10), findCost(produtos, 'Plotagem de Projeto', 10))
  add('Viagem', '1 un', '', findCost(produtos, 'Viagem de Entrega', 50), findCost(produtos, 'Viagem de Entrega', 50))
  const ajudante = findCost(produtos, 'Diária de Ajudante', 4.5)
  add('Diária Ajudante', `${totalArea.toFixed(2)} m²`, '', ajudante, totalArea * ajudante)
  const comissao = findCost(produtos, 'Comissão', 1)
  add('Comissão', `${totalArea.toFixed(2)} m²`, '', comissao, totalArea * comissao)
  if (tipos.has('EPS')) {
    const laudo = findCost(produtos, 'Laudo Técnico', 300)
    if (laudo > 0) add('Laudo Técnico', '1 un', '', laudo, laudo)
  }

  return { linhas, custoTotal, areaTotal: totalArea, plan, mix, metrosLineares }
}

export function precoVenda(custoTotal: number, margemPerc: number, fretePerc: number) {
  let valor = custoTotal * (1 + margemPerc / 100)
  if (fretePerc > 0) valor *= 1 + fretePerc / 100
  return valor
}
