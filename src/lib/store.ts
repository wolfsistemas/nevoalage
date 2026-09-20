import { uid } from './utils'
import { DEFAULT_CONFIG } from './engine/slab'
import { supabase, resolveLoginEmail } from './supabase'
import type {
  Client,
  CutAlgorithm,
  Delivery,
  HeightCm,
  Product,
  Quote,
  QuoteStatus,
  RoomCalc,
  Tenant,
  TenantConfig,
  UserSession,
} from './engine/types'

const KEY = 'nevoalaje.v1'

export interface AppState {
  session: UserSession | null
  isSuperAdmin: boolean
  tenants: Tenant[]
  clients: Client[]
  products: Product[]
  quotes: Quote[]
  deliveries: Delivery[]
  config: TenantConfig
  algorithm: CutAlgorithm
  company: {
    nome: string
    cnpj: string
    telefone: string
    cidade: string
    logoText: string
  }
}

const seedProducts: Product[] = [
  { id: 'p1', descricao: 'Treliça TG8 12m', unidade: 'barra', custoUnitario: 68, tipo: 'material' },
  { id: 'p2', descricao: 'Treliça TG12 12m', unidade: 'barra', custoUnitario: 92, tipo: 'material' },
  { id: 'p3', descricao: 'Treliça TG16 12m', unidade: 'barra', custoUnitario: 105, tipo: 'material' },
  { id: 'p4', descricao: 'EPS H8 placa 50x100', unidade: 'placa', custoUnitario: 11.9, tipo: 'material' },
  { id: 'p5', descricao: 'EPS H12 placa 50x100', unidade: 'placa', custoUnitario: 13.5, tipo: 'material' },
  { id: 'p6', descricao: 'Lajota Cerâmica', unidade: 'un', custoUnitario: 1.7, tipo: 'material' },
  { id: 'p7', descricao: 'Cimento CP II 50kg', unidade: 'saco', custoUnitario: 37, tipo: 'material' },
  { id: 'p8', descricao: 'Areia Grossa', unidade: 'm³', custoUnitario: 200, tipo: 'material' },
  { id: 'p9', descricao: 'Brita 0', unidade: 'm³', custoUnitario: 200, tipo: 'material' },
  { id: 'p10', descricao: 'Vergalhão CA-60 6mm', unidade: 'barra', custoUnitario: 25, tipo: 'material' },
  { id: 'p11', descricao: 'Disco de Corte', unidade: 'un', custoUnitario: 10, tipo: 'material' },
  { id: 'p12', descricao: 'ART', unidade: 'un', custoUnitario: 28, tipo: 'servico' },
  { id: 'p13', descricao: 'Plotagem de Projeto', unidade: 'un', custoUnitario: 10, tipo: 'servico' },
  { id: 'p14', descricao: 'Viagem de Entrega', unidade: 'un', custoUnitario: 50, tipo: 'frete' },
  { id: 'p15', descricao: 'Diária de Ajudante', unidade: 'm²', custoUnitario: 4.5, tipo: 'servico' },
  { id: 'p16', descricao: 'Comissão', unidade: 'm²', custoUnitario: 1, tipo: 'servico' },
  { id: 'p17', descricao: 'Laudo Técnico', unidade: 'un', custoUnitario: 300, tipo: 'servico' },
  { id: 'p18', descricao: 'Frete Isopor', unidade: 'un', custoUnitario: 80, tipo: 'frete' },
  { id: 'p19', descricao: 'Frete Lajota', unidade: 'un', custoUnitario: 50, tipo: 'frete' },
]

function emptyCompany() {
  return { nome: 'NevoaLaje', cnpj: '', telefone: '', cidade: '', logoText: 'NL' }
}

function seed(): AppState {
  return {
    session: null,
    isSuperAdmin: false,
    algorithm: 'DP',
    config: { ...DEFAULT_CONFIG, precosM2: { ...DEFAULT_CONFIG.precosM2 } },
    company: emptyCompany(),
    tenants: [],
    clients: [],
    products: seedProducts,
    quotes: [],
    deliveries: [],
  }
}

let memory: AppState | null = null
const listeners = new Set<() => void>()

function load(): AppState {
  if (memory) return memory
  memory = seed()
  return memory
}

function persist() {
  if (!memory) return
  memory = JSON.parse(JSON.stringify(memory)) as AppState
  try {
    localStorage.setItem(KEY, JSON.stringify({ sessionHint: memory.session?.email }))
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn())
}

function tenantId() {
  return load().session?.tenantId || ''
}

function num(v: unknown, fallback = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function mapConfig(row: Record<string, unknown> | null): TenantConfig {
  if (!row) return { ...DEFAULT_CONFIG, precosM2: { ...DEFAULT_CONFIG.precosM2 } }
  const precos = (row.precos_m2 as TenantConfig['precosM2']) || DEFAULT_CONFIG.precosM2
  return {
    interEixoEps: num(row.inter_eixo_eps, DEFAULT_CONFIG.interEixoEps),
    interEixoLajota: num(row.inter_eixo_lajota, DEFAULT_CONFIG.interEixoLajota),
    barraTrelica: num(row.barra_trelica, DEFAULT_CONFIG.barraTrelica),
    barraVergalhao: num(row.barra_vergalhao, DEFAULT_CONFIG.barraVergalhao),
    capeamentoEspessura: num(row.capeamento_espessura, DEFAULT_CONFIG.capeamentoEspessura),
    capeamentoLargura: num(row.capeamento_largura, DEFAULT_CONFIG.capeamentoLargura),
    volumePorTraco: num(row.volume_por_traco, DEFAULT_CONFIG.volumePorTraco),
    metrosLinearesPorTraco: num(row.metros_lineares_por_traco, DEFAULT_CONFIG.metrosLinearesPorTraco),
    cimentoPorTraco: num(row.cimento_por_traco, DEFAULT_CONFIG.cimentoPorTraco),
    latasAreiaPorTraco: num(row.latas_areia_por_traco, DEFAULT_CONFIG.latasAreiaPorTraco),
    latasBritaPorTraco: num(row.latas_brita_por_traco, DEFAULT_CONFIG.latasBritaPorTraco),
    lataLitros: num(row.lata_litros, DEFAULT_CONFIG.lataLitros),
    vergalhaoMinimo: num(row.vergalhao_minimo, DEFAULT_CONFIG.vergalhaoMinimo),
    lajotasPorM2: num(row.lajotas_por_m2, DEFAULT_CONFIG.lajotasPorM2),
    precosM2: { ...DEFAULT_CONFIG.precosM2, ...precos },
  }
}

function mapRoom(r: Record<string, unknown>): RoomCalc {
  return {
    nome: String(r.nome),
    vaoMenor: num(r.vao_menor),
    vaoMaior: num(r.vao_maior),
    tipo: r.tipo === 'LAJOTA_CERAMICA' ? 'LAJOTA_CERAMICA' : 'EPS',
    altura: num(r.altura, 12) as HeightCm,
    larguraViga: num(r.largura_viga),
    qtdVigotas: num(r.qtd_vigotas),
    tamVigota: num(r.tamanho_vigota),
    epsLinear: num(r.metragem_eps),
    area: num(r.area),
    precoM2: num(r.preco_m2),
    valorEstimado: num(r.valor_estimado),
  }
}

function configRow(cfg: TenantConfig, tid: string, alg: CutAlgorithm) {
  return {
    tenant_id: tid,
    inter_eixo_eps: cfg.interEixoEps,
    inter_eixo_lajota: cfg.interEixoLajota,
    barra_trelica: cfg.barraTrelica,
    barra_vergalhao: cfg.barraVergalhao,
    capeamento_espessura: cfg.capeamentoEspessura,
    capeamento_largura: cfg.capeamentoLargura,
    volume_por_traco: cfg.volumePorTraco,
    metros_lineares_por_traco: cfg.metrosLinearesPorTraco,
    cimento_por_traco: cfg.cimentoPorTraco,
    latas_areia_por_traco: cfg.latasAreiaPorTraco,
    latas_brita_por_traco: cfg.latasBritaPorTraco,
    lata_litros: cfg.lataLitros,
    vergalhao_minimo: cfg.vergalhaoMinimo,
    lajotas_por_m2: cfg.lajotasPorM2,
    precos_m2: cfg.precosM2,
    algoritmo_padrao: alg,
  }
}

async function loadTenants(): Promise<Tenant[]> {
  const { data, error } = await supabase.from('tenants').select('*').order('created_at')
  if (error || !data) return []
  const tenants: Tenant[] = []
  for (const t of data) {
    const [{ count: usuarios }, { count: orcamentos }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('tenant_id', t.id),
      supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('tenant_id', t.id),
    ])
    tenants.push({
      id: t.id,
      nome: t.nome,
      slug: t.slug,
      plano: t.plano,
      status: t.status,
      cidade: t.cidade || '',
      createdAt: String(t.created_at).slice(0, 10),
      usuarios: usuarios || 0,
      orcamentos: orcamentos || 0,
    })
  }
  return tenants
}

async function loadTenantData(tid: string) {
  const [tenantRes, cfgRes, clientsRes, productsRes, quotesRes, roomsRes, delivRes] = await Promise.all([
    supabase.from('tenants').select('*').eq('id', tid).maybeSingle(),
    supabase.from('tenant_config').select('*').eq('tenant_id', tid).maybeSingle(),
    supabase.from('clients').select('*').eq('tenant_id', tid).order('nome'),
    supabase.from('products').select('*').eq('tenant_id', tid).order('descricao'),
    supabase.from('quotes').select('*').eq('tenant_id', tid).order('numero', { ascending: false }),
    supabase.from('quote_rooms').select('*').eq('tenant_id', tid),
    supabase.from('deliveries').select('*').eq('tenant_id', tid).order('data', { ascending: false }),
  ])

  const tenant = tenantRes.data
  const cfg = mapConfig(cfgRes.data as Record<string, unknown> | null)
  const alg = ((cfgRes.data?.algoritmo_padrao as CutAlgorithm) || 'DP') as CutAlgorithm
  const roomsByQuote = new Map<string, RoomCalc[]>()
  for (const r of roomsRes.data || []) {
    const list = roomsByQuote.get(r.quote_id) || []
    list.push(mapRoom(r as Record<string, unknown>))
    roomsByQuote.set(r.quote_id, list)
  }

  const quotes: Quote[] = (quotesRes.data || []).map((q) => ({
    id: q.id,
    numero: num(q.numero),
    clienteId: q.client_id || '',
    clienteNome: q.cliente_nome,
    status: q.status as QuoteStatus,
    comodos: roomsByQuote.get(q.id) || [],
    areaTotal: num(q.area_total),
    valorTotal: num(q.valor_total),
    algoritmo: (q.algoritmo || alg) as CutAlgorithm,
    observacao: q.observacao || '',
    createdAt: q.created_at,
    updatedAt: q.updated_at,
  }))

  return {
    config: cfg,
    algorithm: alg,
    company: {
      nome: tenant?.nome || 'NevoaLaje',
      cnpj: tenant?.cnpj || '',
      telefone: tenant?.telefone || '',
      cidade: tenant?.cidade || '',
      logoText: tenant?.logo_text || 'NL',
    },
    clients: (clientsRes.data || []).map((c) => ({
      id: c.id,
      nome: c.nome,
      telefone: c.telefone || '',
      email: c.email || '',
      endereco: c.endereco || '',
      documento: c.documento || '',
    })) as Client[],
    products: (productsRes.data || []).map((p) => ({
      id: p.id,
      descricao: p.descricao,
      unidade: p.unidade,
      custoUnitario: num(p.custo_unitario),
      tipo: (p.tipo || 'material') as Product['tipo'],
    })),
    quotes,
    deliveries: (delivRes.data || []).map((d) => ({
      id: d.id,
      quoteId: d.quote_id,
      data: d.data,
      vigotas: d.vigotas || [],
      observacao: d.observacao || '',
    })) as Delivery[],
  }
}

async function hydrateFromUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const email = (user.email || '').toLowerCase()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  const { data: adminRow } = await supabase.from('platform_admins').select('email').eq('email', email).maybeSingle()
  const isSuperAdmin = Boolean(adminRow) || email === 'superadmin@nevoalaje.com'

  const s = seed()
  s.isSuperAdmin = isSuperAdmin
  s.session = {
    id: user.id,
    nome: profile?.nome || String(user.user_metadata?.nome || email),
    email,
    role: isSuperAdmin ? 'superadmin' : profile?.role === 'owner' ? 'owner' : 'operador',
    tenantId: profile?.tenant_id || 'platform',
  }

  if (isSuperAdmin) {
    s.tenants = await loadTenants()
  }
  if (profile?.tenant_id) {
    const data = await loadTenantData(profile.tenant_id)
    Object.assign(s, data)
    s.tenants = isSuperAdmin ? s.tenants : []
  }

  memory = s
  persist()
}

export const store = {
  get: load,
  subscribe(fn: () => void) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  async init() {
    const { data } = await supabase.auth.getSession()
    if (data.session?.user) await hydrateFromUser(data.session.user)
    else {
      memory = seed()
      persist()
    }
  },
  reset() {
    memory = seed()
    persist()
  },
  async login(user: string, pass: string): Promise<{ ok: boolean; error?: string; superadmin?: boolean }> {
    const email = resolveLoginEmail(user)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error || !data.user) return { ok: false, error: error?.message || 'Usuário ou senha inválidos.' }
    await hydrateFromUser(data.user)
    return { ok: true, superadmin: load().isSuperAdmin }
  },
  async logout() {
    await supabase.auth.signOut()
    memory = seed()
    persist()
  },
  async setAlgorithm(alg: CutAlgorithm) {
    const s = load()
    s.algorithm = alg
    persist()
    const tid = tenantId()
    if (!tid || tid === 'platform') return
    await supabase.from('tenant_config').upsert(configRow(s.config, tid, alg), { onConflict: 'tenant_id' })
  },
  async saveConfig(cfg: TenantConfig) {
    const s = load()
    s.config = cfg
    persist()
    const tid = tenantId()
    if (!tid || tid === 'platform') return
    await supabase.from('tenant_config').upsert(configRow(cfg, tid, s.algorithm), { onConflict: 'tenant_id' })
  },
  async saveQuote(payload: { clienteNome: string; clienteId?: string; comodos: RoomCalc[]; observacao?: string; id?: string }) {
    const s = load()
    const tid = tenantId()
    const areaTotal = parseFloat(payload.comodos.reduce((n, c) => n + c.area, 0).toFixed(3))
    const valorTotal = parseFloat(payload.comodos.reduce((n, c) => n + c.valorEstimado, 0).toFixed(2))
    if (!tid || tid === 'platform') {
      const id = payload.id || uid('q')
      return id
    }
    let quoteId = payload.id
    if (quoteId) {
      await supabase
        .from('quotes')
        .update({
          cliente_nome: payload.clienteNome,
          client_id: payload.clienteId || null,
          valor_total: valorTotal,
          area_total: areaTotal,
          observacao: payload.observacao || '',
          algoritmo: s.algorithm,
          updated_at: new Date().toISOString(),
        })
        .eq('id', quoteId)
        .eq('tenant_id', tid)
      await supabase.from('quote_rooms').delete().eq('quote_id', quoteId)
    } else {
      const { data: last } = await supabase.from('quotes').select('numero').eq('tenant_id', tid).order('numero', { ascending: false }).limit(1)
      const numero = (last?.[0]?.numero || 1000) + 1
      const { data, error } = await supabase
        .from('quotes')
        .insert({
          tenant_id: tid,
          numero,
          client_id: payload.clienteId || null,
          cliente_nome: payload.clienteNome,
          status: 'ABERTO',
          valor_total: valorTotal,
          area_total: areaTotal,
          algoritmo: s.algorithm,
          observacao: payload.observacao || '',
        })
        .select('id')
        .single()
      if (error || !data) throw new Error(error?.message || 'Erro ao salvar orçamento')
      quoteId = data.id
    }
    if (payload.comodos.length) {
      await supabase.from('quote_rooms').insert(
        payload.comodos.map((c) => ({
          tenant_id: tid,
          quote_id: quoteId,
          nome: c.nome,
          vao_menor: c.vaoMenor,
          vao_maior: c.vaoMaior,
          tipo: c.tipo,
          altura: c.altura,
          largura_viga: c.larguraViga,
          qtd_vigotas: c.qtdVigotas,
          tamanho_vigota: c.tamVigota,
          metragem_eps: c.epsLinear,
          area: c.area,
          valor_estimado: c.valorEstimado,
          preco_m2: c.precoM2,
        })),
      )
    }
    const data = await loadTenantData(tid)
    Object.assign(load(), data)
    persist()
    return quoteId as string
  },
  async setQuoteStatus(id: string, status: QuoteStatus) {
    const q = load().quotes.find((x) => x.id === id)
    if (q) {
      q.status = status
      q.updatedAt = new Date().toISOString()
      persist()
    }
    const tid = tenantId()
    if (!tid || tid === 'platform') return
    await supabase.from('quotes').update({ status, updated_at: new Date().toISOString() }).eq('id', id).eq('tenant_id', tid)
  },
  async addClient(c: Omit<Client, 'id'>) {
    const tid = tenantId()
    if (!tid || tid === 'platform') {
      const id = uid('c')
      load().clients.unshift({ ...c, id })
      persist()
      return id
    }
    const { data, error } = await supabase
      .from('clients')
      .insert({ tenant_id: tid, ...c })
      .select('id')
      .single()
    if (error || !data) throw new Error(error?.message || 'Erro ao cadastrar cliente')
    load().clients.unshift({ ...c, id: data.id })
    persist()
    return data.id as string
  },
  async saveProduct(p: Product) {
    const tid = tenantId()
    const s = load()
    const i = s.products.findIndex((x) => x.id === p.id)
    if (i >= 0) s.products[i] = p
    else s.products.push(p)
    persist()
    if (!tid || tid === 'platform') return
    const payload = { tenant_id: tid, descricao: p.descricao, unidade: p.unidade, custo_unitario: p.custoUnitario, tipo: p.tipo }
    const looksNew = p.id.startsWith('p_') || p.id.length < 20
    if (looksNew) {
      const { data } = await supabase.from('products').insert(payload).select('id').single()
      if (data?.id) {
        const idx = load().products.findIndex((x) => x.id === p.id)
        if (idx >= 0) load().products[idx].id = data.id
        persist()
      }
    } else {
      await supabase.from('products').update(payload).eq('id', p.id).eq('tenant_id', tid)
    }
  },
  async addDelivery(d: Omit<Delivery, 'id'>) {
    const tid = tenantId()
    if (!tid || tid === 'platform') {
      const id = uid('d')
      load().deliveries.unshift({ ...d, id })
      persist()
      return id
    }
    const { data, error } = await supabase
      .from('deliveries')
      .insert({ tenant_id: tid, quote_id: d.quoteId, data: d.data, vigotas: d.vigotas, observacao: d.observacao })
      .select('id')
      .single()
    if (error || !data) throw new Error(error?.message || 'Erro ao registrar entrega')
    load().deliveries.unshift({ ...d, id: data.id })
    persist()
    return data.id as string
  },
  async setTenantStatus(id: string, status: Tenant['status']) {
    const t = load().tenants.find((x) => x.id === id)
    if (t) {
      t.status = status
      persist()
    }
    await supabase.from('tenants').update({ status }).eq('id', id)
  },
  async setTenantPlan(id: string, plano: Tenant['plano']) {
    const t = load().tenants.find((x) => x.id === id)
    if (t) {
      t.plano = plano
      persist()
    }
    await supabase.from('tenants').update({ plano }).eq('id', id)
  },
}
