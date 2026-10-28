/**
 * Pedido de reunião da /business: validação, atribuição da sessão e o JSON
 * do POST /api/backend/business/leads.
 *
 * Sem Vue e sem Nuxt de propósito: o `node --test` cobre as regras, e o
 * nuxt.config importa daqui o interruptor da prévia (um build de produção
 * não pode ligá-la, nem com a env pública).
 *
 * A rota ainda não existe no Laravel. Quem chama só pode mostrar "recebido"
 * depois de um 2xx de verdade, ou na prévia (`?demo=1` fora de produção).
 */
import { isSecretTokenPath } from './analytics-privacy.ts'

export const EMAIL_RELACIONAMENTO = 'relacionamento@redentia.com.br'

export const CONSENT_VERSION = '2026-10-28'
export const CONSENT_LINK_LABEL = 'Política de Privacidade'
/** A frase termina em "Li a ", e o link entra no meio, fora do <label>. */
export const CONSENT_BEFORE = 'Autorizo a Redentia a usar estes dados para entrar em contato comigo sobre o Redentia For Business. Li a '
export const CONSENT_TEXT = `${CONSENT_BEFORE}${CONSENT_LINK_LABEL}.`

export const CHAVE_ATRIBUICAO = 'nu:business-atribuicao'

export const CAMPOS_CLIQUE = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'li_fat_id',
  'gclid',
] as const

export type CampoClique = (typeof CAMPOS_CLIQUE)[number]

const MAX_CLIQUE = 200
const MAX_LANDING = 1000
const MAX_REFERRER = 500

export const TIPOS_DE_CASA = [
  { value: 'assessoria_aai', label: 'Assessoria ou escritório AAI' },
  { value: 'multi_family_office', label: 'Multi family office' },
  { value: 'family_office', label: 'Family office' },
  { value: 'gestora', label: 'Gestora' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'outro', label: 'Outro' },
] as const

export const TAMANHOS_DE_MESA = [
  { value: 'ate_5', label: 'Até 5' },
  { value: '6_15', label: '6 a 15' },
  { value: '16_40', label: '16 a 40' },
  { value: 'mais_40', label: 'Mais de 40' },
] as const

export type TipoDeCasa = (typeof TIPOS_DE_CASA)[number]['value']
export type TamanhoDeMesa = (typeof TAMANHOS_DE_MESA)[number]['value']

const TIPOS = new Set<string>(TIPOS_DE_CASA.map(t => t.value))
const TAMANHOS = new Set<string>(TAMANHOS_DE_MESA.map(t => t.value))

/**
 * Domínios de caixa pessoal. Aviso no formulário, sem bloquear: mesa pequena
 * às vezes só tem Gmail, e perder o pedido por isso é pior do que receber
 * um e-mail pessoal.
 */
export const DOMINIOS_PESSOAIS = [
  'gmail.com',
  'googlemail.com',
  'hotmail.com',
  'hotmail.com.br',
  'outlook.com',
  'outlook.com.br',
  'live.com',
  'live.com.br',
  'msn.com',
  'yahoo.com',
  'yahoo.com.br',
  'ymail.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'bol.com.br',
  'uol.com.br',
  'terra.com.br',
  'ig.com.br',
  'globo.com',
  'globomail.com',
  'proton.me',
  'protonmail.com',
  'pm.me',
] as const

const PESSOAIS = new Set<string>(DOMINIOS_PESSOAIS)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export interface AtribuicaoBusiness {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  li_fat_id: string | null
  gclid: string | null
  landing_page: string
  referrer: string | null
}

export interface LeadFormulario {
  name: string
  email: string
  phone: string
  company: string
  firmType: string
  teamSize: string
  message: string
  consent: boolean
  website: string
}

export interface ErrosLead {
  name?: string
  email?: string
  phone?: string
  company?: string
  firmType?: string
  teamSize?: string
  message?: string
  consent?: string
}

export interface BusinessLeadPayload {
  name: string
  email: string
  phone: string | null
  company: string
  firm_type: TipoDeCasa
  team_size: TamanhoDeMesa
  message: string | null
  consent: true
  consent_text: string
  consent_version: string
  website: string
  attribution: AtribuicaoBusiness
}

export interface ArmazemSessao {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function limparTexto(v: string, max: number): string | null {
  const t = v.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!t) return null
  return t.slice(0, max)
}

export function emailValido(email: string): boolean {
  const e = email.trim()
  if (e.length > 180 || /\s/.test(e)) return false
  return EMAIL_RE.test(e)
}

export function emailPessoal(email: string): boolean {
  const e = email.trim().toLowerCase()
  if (!emailValido(e)) return false
  const dominio = e.split('@')[1] ?? ''
  return PESSOAIS.has(dominio)
}

export function rotuloTipo(v: string): string {
  return TIPOS_DE_CASA.find(t => t.value === v)?.label ?? v
}

export function rotuloTamanho(v: string): string {
  return TAMANHOS_DE_MESA.find(t => t.value === v)?.label ?? v
}

export function temErro(e: ErrosLead): boolean {
  return Object.values(e).some(Boolean)
}

export function validarLead(f: LeadFormulario): ErrosLead {
  const erros: ErrosLead = {}
  const nome = f.name.trim()
  if (nome.length < 2 || nome.length > 120) erros.name = 'Escreva seu nome.'

  const email = f.email.trim()
  if (!emailValido(email)) erros.email = 'Este e-mail não parece válido.'

  const phone = f.phone.trim()
  if (phone) {
    const digitos = phone.replace(/\D/g, '').length
    if (digitos < 8 || phone.length > 40) erros.phone = 'Confira o telefone. Se não quiser deixar, apague o campo.'
  }

  const company = f.company.trim()
  if (company.length < 2 || company.length > 160) erros.company = 'Escreva o escritório ou a empresa.'

  if (!TIPOS.has(f.firmType)) erros.firmType = 'Escolha o tipo de casa.'
  if (!TAMANHOS.has(f.teamSize)) erros.teamSize = 'Escolha o tamanho aproximado.'

  if (f.message.trim().length > 2000) erros.message = 'A mensagem passou de 2.000 caracteres.'

  if (f.consent !== true) erros.consent = 'Marque a autorização para a gente poder responder.'

  return erros
}

export function atribuicaoVazia(landing = '/business'): AtribuicaoBusiness {
  return {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    li_fat_id: null,
    gclid: null,
    landing_page: landing,
    referrer: null,
  }
}

function lerClique(search: string): Pick<AtribuicaoBusiness, CampoClique> {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const out = atribuicaoVazia()
  for (const k of CAMPOS_CLIQUE) out[k] = limparTexto(q.get(k) ?? '', MAX_CLIQUE)
  return out
}

/** Tira `demo` da URL gravada: é interruptor da prévia, não campanha. */
function searchSemDemo(search: string): string {
  const bruto = search.startsWith('?') ? search.slice(1) : search
  if (!bruto) return ''
  const partes = bruto.split('&').filter((p) => {
    const nome = (p.split('=')[0] ?? '').replace(/\+/g, ' ')
    let dec = nome
    try { dec = decodeURIComponent(nome) }
    catch { /* mantém cru */ }
    return dec.toLowerCase() !== 'demo'
  })
  return partes.length ? `?${partes.join('&')}` : ''
}

export function paginaDeEntrada(pathname: string, search: string): string {
  if (isSecretTokenPath(pathname)) return pathname.replace(/\/[^/]+\/?$/, '/:token').slice(0, MAX_LANDING)
  return `${pathname}${searchSemDemo(search)}`.slice(0, MAX_LANDING)
}

export function referrerSeguro(referrer: string): string | null {
  const t = limparTexto(referrer, MAX_REFERRER)
  if (!t) return null
  try {
    const u = new URL(t, 'https://www.redentia.com.br')
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    if (isSecretTokenPath(u.pathname)) return null
  }
  catch {
    return null
  }
  return t
}

export function montarAtribuicao(loc: { pathname: string, search: string }, referrer: string): AtribuicaoBusiness {
  return {
    ...lerClique(loc.search),
    landing_page: paginaDeEntrada(loc.pathname, loc.search),
    referrer: referrerSeguro(referrer),
  }
}

function normalizarAtribuicao(raw: unknown): AtribuicaoBusiness | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  if (typeof o.landing_page !== 'string' || !o.landing_page) return null
  const base = atribuicaoVazia(limparTexto(o.landing_page, MAX_LANDING) ?? '/business')
  for (const k of CAMPOS_CLIQUE) {
    base[k] = typeof o[k] === 'string' ? limparTexto(o[k] as string, MAX_CLIQUE) : null
  }
  base.referrer = typeof o.referrer === 'string' ? referrerSeguro(o.referrer) : null
  return base
}

export function lerAtribuicao(store: ArmazemSessao): AtribuicaoBusiness | null {
  let raw: string | null
  try {
    raw = store.getItem(CHAVE_ATRIBUICAO)
  }
  catch {
    return null
  }
  if (!raw) return null
  try {
    return normalizarAtribuicao(JSON.parse(raw))
  }
  catch {
    return null
  }
}

/**
 * First-touch da sessão: a primeira página grava, e uma página seguinte
 * com outro anúncio não cobre. Sem isso, o clique em Entrar (que põe os
 * UTMs de novo na URL) viraria a origem.
 */
export function capturarAtribuicao(
  store: ArmazemSessao,
  loc: { pathname: string, search: string },
  referrer: string,
): AtribuicaoBusiness {
  const ja = lerAtribuicao(store)
  if (ja) return ja
  const nova = montarAtribuicao(loc, referrer)
  try {
    store.setItem(CHAVE_ATRIBUICAO, JSON.stringify(nova))
  }
  catch {
    // modo privado ou cota: o pedido ainda leva o objeto desta chamada
  }
  return nova
}

/** Query só com os identificadores de clique, para o link de Entrar. */
export function destinoComAtribuicao(path: string, a: AtribuicaoBusiness | null): string {
  if (!a) return path
  const q = new URLSearchParams()
  for (const k of CAMPOS_CLIQUE) {
    const v = a[k]
    if (v) q.set(k, v)
  }
  const s = q.toString()
  return s ? `${path}?${s}` : path
}

export function montarPayload(f: LeadFormulario, atribuicao: AtribuicaoBusiness | null): BusinessLeadPayload {
  const phone = limparTexto(f.phone, 40)
  const message = limparTexto(f.message, 2000)
  return {
    name: f.name.trim(),
    email: f.email.trim().toLowerCase(),
    phone,
    company: f.company.trim(),
    firm_type: f.firmType as TipoDeCasa,
    team_size: f.teamSize as TamanhoDeMesa,
    message,
    consent: true,
    consent_text: CONSENT_TEXT,
    consent_version: CONSENT_VERSION,
    website: f.website.trim(),
    attribution: atribuicao ?? atribuicaoVazia(),
  }
}

function cortar(s: string, n: number): string {
  if (s.length <= n) return s
  return `${s.slice(0, n - 1)}…`
}

/** O mailto de quando o POST não volta 2xx. O endereço é o de relacionamento. */
export function mailtoDoPedido(f: LeadFormulario): string {
  const assunto = 'Redentia For Business: 1 hora com a mesa'
  const linhas = [
    'Olá! Queremos marcar 1 hora com a Redentia.',
    '',
    `Nome: ${f.name.trim()}`,
    `E-mail: ${f.email.trim()}`,
    f.phone.trim() ? `Telefone: ${f.phone.trim()}` : null,
    `Escritório: ${f.company.trim()}`,
    `Tipo de casa: ${rotuloTipo(f.firmType)}`,
    `Tamanho: ${rotuloTamanho(f.teamSize)}`,
    f.message.trim() ? '' : null,
    f.message.trim() ? cortar(f.message.trim(), 800) : null,
    '',
    'O que ajuda mandar junto (nada é obrigatório):',
    '1. Os ativos que a mesa acompanha:',
    '2. Uma carteira-modelo em pesos, sem nome de cliente:',
  ].filter((l): l is string => l !== null)
  return `mailto:${EMAIL_RELACIONAMENTO}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(linhas.join('\n'))}`
}

export function falhaDoEnvio(status: number | null): { antes: string, depois: string } {
  if (status === 429) {
    return { antes: 'Muitas tentativas agora. Espere um instante, ou escreva para ', depois: '.' }
  }
  return {
    antes: 'Não conseguimos registrar o pedido. Nada foi enviado. Escreva para ',
    depois: ' com o que você preencheu.',
  }
}

export function statusDoErro(e: unknown): number | null {
  if (!e || typeof e !== 'object') return null
  const o = e as { statusCode?: unknown, status?: unknown, response?: { status?: unknown } }
  const n = o.statusCode ?? o.status ?? o.response?.status
  return typeof n === 'number' ? n : null
}

/** $fetch só resolve em 2xx. Qualquer outra coisa é falha, inclusive 3xx. */
export function envioAceito(status: number): boolean {
  return status >= 200 && status < 300
}

export interface EventoBusinessLead {
  tipo_casa: string
  utm_source: string
}

export function eventoBusinessLead(tipoCasa: string, utmSource: string | null): EventoBusinessLead {
  const origem = utmSource?.trim()
  return {
    tipo_casa: tipoCasa,
    utm_source: origem ? origem : '(none)',
  }
}

export function dispararEventoBusinessLead(tipoCasa: string, utmSource: string | null): void {
  if (typeof window === 'undefined') return
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
  if (typeof gtag !== 'function') return
  try {
    gtag('event', 'business_lead', eventoBusinessLead(tipoCasa, utmSource))
  }
  catch {
    // medição não desfaz um 2xx que já aconteceu
  }
}

/**
 * Interruptor de BUILD. Produção da Vercel é false antes de qualquer outra
 * env, então NUXT_PUBLIC_BUSINESS_LEAD_DEMO não liga a prévia no ar.
 * Preview da Vercel liga. `nuxt dev` (NODE_ENV diferente de production) liga.
 * Um `nuxt build` local, sem VERCEL_ENV=preview, fica desligado.
 */
export function businessLeadDemoLigadoNoBuild(env: {
  VERCEL_ENV?: string
  NODE_ENV?: string
  NUXT_PUBLIC_BUSINESS_LEAD_DEMO?: string
} = {}): boolean {
  if (env.VERCEL_ENV === 'production') return false
  if (env.VERCEL_ENV === 'preview') return true
  if (env.NUXT_PUBLIC_BUSINESS_LEAD_DEMO === 'true') return true
  return env.NODE_ENV !== 'production'
}

declare const __REDENTIA_BUSINESS_LEAD_DEMO__: boolean | undefined

/** Valor gravado no bundle. No `node --test` o identificador não existe e dá false. */
export function demoDeLeadDisponivel(): boolean {
  return typeof __REDENTIA_BUSINESS_LEAD_DEMO__ !== 'undefined' && __REDENTIA_BUSINESS_LEAD_DEMO__ === true
}
