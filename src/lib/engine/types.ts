export type FillType = 'EPS' | 'LAJOTA_CERAMICA'
export type HeightCm = 8 | 12 | 16 | 20
export type QuoteStatus = 'ABERTO' | 'APROVADO' | 'PRODUCAO' | 'ENTREGUE' | 'CANCELADO'
export type CutAlgorithm = 'FFD' | 'BFD' | 'RBF' | 'DP' | 'MFFD' | 'BEST'

export interface TenantConfig {
  interEixoEps: number
  interEixoLajota: number
  barraTrelica: number
  barraVergalhao: number
  capeamentoEspessura: number
  capeamentoLargura: number
  volumePorTraco: number
  metrosLinearesPorTraco: number
  cimentoPorTraco: number
  latasAreiaPorTraco: number
  latasBritaPorTraco: number
  lataLitros: number
  vergalhaoMinimo: number
  lajotasPorM2: number
  precosM2: Record<string, number>
}

export interface RoomInput {
  nome: string
  vaoMenor: number
  vaoMaior: number
  tipo: FillType
  altura: HeightCm
  larguraViga: number
}

export interface RoomCalc extends RoomInput {
  qtdVigotas: number
  tamVigota: number
  epsLinear: number
  area: number
  precoM2: number
  valorEstimado: number
}

export interface BarPattern {
  cortes: number[]
  usado: number
  sobra: number
}

export interface CutPlan {
  algoritmo: CutAlgorithm
  comprimentoBarra: number
  barras: BarPattern[]
  totalBarras: number
  totalSobra: number
  perdaPerc: number
  pecas: { tamanho: number; qtd: number }[]
}

export interface MixResult {
  volumeConcreto: number
  numTracos: number
  sacosCimento: number
  areiaM3: number
  britaM3: number
  latasAreia: number
  latasBrita: number
  metrosLineares: number
}

export interface CostLine {
  desc: string
  qtd: string
  composicao: string
  unitario: number
  total: number
}

export interface Product {
  id: string
  descricao: string
  unidade: string
  custoUnitario: number
  tipo: 'material' | 'servico' | 'frete'
}

export interface Client {
  id: string
  nome: string
  telefone: string
  email: string
  endereco: string
  documento: string
}

export interface Quote {
  id: string
  numero: number
  clienteId: string
  clienteNome: string
  status: QuoteStatus
  comodos: RoomCalc[]
  areaTotal: number
  valorTotal: number
  algoritmo: CutAlgorithm
  observacao: string
  createdAt: string
  updatedAt: string
}

export interface Delivery {
  id: string
  quoteId: string
  data: string
  vigotas: { tamanho: number; qtd: number }[]
  observacao: string
}

export interface Tenant {
  id: string
  nome: string
  slug: string
  plano: 'nevoa' | 'oficina' | 'fabrica' | 'trial'
  status: 'ativo' | 'trial' | 'inadimplente' | 'cancelado'
  cidade: string
  createdAt: string
  usuarios: number
  orcamentos: number
}

export interface UserSession {
  id: string
  nome: string
  email: string
  role: 'owner' | 'operador' | 'superadmin'
  tenantId: string
}
