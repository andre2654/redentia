/**
 * Atribuição de primeira página da aba, para o header dos pedidos que criam
 * conta. Contrato do backend (redentia-api#16): o Laravel pode ignorar o
 * header; o login segue do mesmo jeito.
 *
 * Só sessionStorage, no browser. Sem cookie, sem dado pessoal: o caminho de
 * entrada (sem query), os utm_* que passam na régua e o hostname do referrer
 * quando ele é de outro site. Campo inválido sai fora. A página seguinte da
 * mesma aba não cobre a primeira.
 */
import { isSecretTokenPath } from './analytics-privacy.ts'

export const CHAVE_ATRIBUICAO_ENTRADA = 'nu:atribuicao-entrada'
export const HEADER_ATRIBUICAO = 'X-Redentia-Attribution'
export const MAX_BYTES_ATRIBUICAO = 2048

/** Pedidos públicos que criam conta. O cadastro por senha não tem tela aqui. */
export const CAMINHOS_QUE_CRIAM_CONTA = [
  '/auth/magic-pin/verify',
  '/auth/magic-link/verify',
  '/auth/google',
  '/auth/register',
] as const

export const CAMPOS_UTM = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const

export type CampoUtm = (typeof CAMPOS_UTM)[number]

const ORDEM_ATRIBUICAO = [
  'entry_path',
  ...CAMPOS_UTM,
  'referrer_host',
] as const

export type CampoAtribuicao = (typeof ORDEM_ATRIBUICAO)[number]

export interface AtribuicaoEntrada {
  entry_path?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  referrer_host?: string
}

export const METODOS_AUTH = ['magic_pin', 'magic_link', 'google', 'password'] as const
export type MetodoAuth = (typeof METODOS_AUTH)[number]

export interface ArmazemAtribuicao {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface LocalDeEntrada {
  pathname: string
  search: string
  hostname: string
}

/** Barra inicial única, segmentos [A-Za-z0-9._~-] ou %HH, sem query nem fragmento. */
const CAMINHO_DE_ENTRADA = /^\/$|^\/(?:(?:[A-Za-z0-9._~-]|%[0-9A-Fa-f]{2})+\/)*(?:[A-Za-z0-9._~-]|%[0-9A-Fa-f]{2})+$/
/** Começa em alfanumérico; o resto aceita espaço . _ + ~ - */
const UTM = /^[A-Za-z0-9][A-Za-z0-9 ._+~-]{0,99}$/
const ROTULO_HOST = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

export function caminhoCriaConta(path: string): boolean {
  const semQuery = (path.split('?')[0] ?? '').split('#')[0] ?? ''
  return (CAMINHOS_QUE_CRIAM_CONTA as readonly string[]).includes(semQuery)
}

export function validarCaminhoDeEntrada(path: string): string | null {
  if (path.length === 0 || path.length > 255) return null
  if (path.includes('?') || path.includes('#')) return null
  if (isSecretTokenPath(path)) return null
  if (!CAMINHO_DE_ENTRADA.test(path)) return null
  return path
}

export function validarUtm(valor: string): string | null {
  if (!UTM.test(valor)) return null
  return valor
}

/** Hostname em minúsculas, no máximo 253, rótulos no formato DNS. */
export function validarHostDeReferrer(host: string): string | null {
  const h = host.toLowerCase()
  if (h.length === 0 || h.length > 253) return null
  if (h.startsWith('.') || h.endsWith('.') || h.includes('..')) return null
  const rotulos = h.split('.')
  for (const rotulo of rotulos) {
    if (rotulo.length > 63 || !ROTULO_HOST.test(rotulo)) return null
  }
  return h
}

/** Hostname do referrer só quando o site é outro. URL inteira não entra. */
export function hostDoReferrerExterno(referrer: string, hostnameAtual: string): string | null {
  if (!referrer) return null
  let host = ''
  try {
    const u = new URL(referrer)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    host = u.hostname
  }
  catch {
    return null
  }
  if (!host) return null
  if (host.toLowerCase() === hostnameAtual.toLowerCase()) return null
  return validarHostDeReferrer(host)
}

export function montarAtribuicaoDeEntrada(loc: LocalDeEntrada, referrer: string): AtribuicaoEntrada {
  const out: AtribuicaoEntrada = {}
  const caminho = validarCaminhoDeEntrada(loc.pathname)
  if (caminho) out.entry_path = caminho
  const params = new URLSearchParams(loc.search)
  for (const campo of CAMPOS_UTM) {
    const bruto = params.get(campo)
    if (bruto == null) continue
    const valor = validarUtm(bruto)
    if (valor) out[campo] = valor
  }
  const host = hostDoReferrerExterno(referrer, loc.hostname)
  if (host) out.referrer_host = host
  return out
}

/** Descarta campo desconhecido ou inválido. Storage adulterado não viaja. */
export function atribuicaoValida(raw: unknown): AtribuicaoEntrada {
  if (!raw || typeof raw !== 'object') return {}
  const o = raw as Record<string, unknown>
  const out: AtribuicaoEntrada = {}
  if (typeof o.entry_path === 'string') {
    const caminho = validarCaminhoDeEntrada(o.entry_path)
    if (caminho) out.entry_path = caminho
  }
  for (const campo of CAMPOS_UTM) {
    const bruto = o[campo]
    if (typeof bruto !== 'string') continue
    const valor = validarUtm(bruto)
    if (valor) out[campo] = valor
  }
  if (typeof o.referrer_host === 'string') {
    const host = validarHostDeReferrer(o.referrer_host)
    if (host) out.referrer_host = host
  }
  return out
}

function lerGuardado(store: ArmazemAtribuicao): unknown {
  let raw: string | null
  try {
    raw = store.getItem(CHAVE_ATRIBUICAO_ENTRADA)
  }
  catch {
    return undefined
  }
  if (raw == null) return undefined
  try {
    return JSON.parse(raw)
  }
  catch {
    return {}
  }
}

/**
 * Primeira página da aba grava. Se o storage já tem a chave, devolve o que
 * está lá (revalidado) e não cobre com a página de agora.
 */
export function capturarAtribuicaoDeSessao(
  store: ArmazemAtribuicao,
  loc: LocalDeEntrada,
  referrer: string,
): AtribuicaoEntrada {
  const guardado = lerGuardado(store)
  if (guardado !== undefined) return atribuicaoValida(guardado)
  const nova = montarAtribuicaoDeEntrada(loc, referrer)
  try {
    store.setItem(CHAVE_ATRIBUICAO_ENTRADA, JSON.stringify(nova))
  }
  catch {
    // modo privado ou cota: os pedidos seguintes saem sem origem
  }
  return nova
}

export function lerAtribuicaoDeSessao(store: ArmazemAtribuicao): AtribuicaoEntrada {
  const guardado = lerGuardado(store)
  if (guardado === undefined) return {}
  return atribuicaoValida(guardado)
}

/** JSON do header, ou null. Nunca passa de maxBytes, e nunca é `{}`. */
export function jsonLimitado(
  campos: Partial<Record<CampoAtribuicao, string>>,
  maxBytes = MAX_BYTES_ATRIBUICAO,
): string | null {
  const chaves = ORDEM_ATRIBUICAO.filter((k) => {
    const v = campos[k]
    return typeof v === 'string' && v.length > 0 && !/[\r\n]/.test(v)
  })
  while (chaves.length > 0) {
    const obj: Record<string, string> = {}
    for (const k of chaves) obj[k] = campos[k] as string
    const json = JSON.stringify(obj)
    if (new TextEncoder().encode(json).length <= maxBytes) return json
    chaves.pop()
  }
  return null
}

export function jsonDaAtribuicao(a: AtribuicaoEntrada | null | undefined): string | null {
  return jsonLimitado(atribuicaoValida(a))
}

export function cabecalhosDeAtribuicao(store: ArmazemAtribuicao): Record<string, string> {
  const json = jsonDaAtribuicao(lerAtribuicaoDeSessao(store))
  if (!json) return {}
  return { [HEADER_ATRIBUICAO]: json }
}

/** No servidor, ou sem storage, o pedido sai sem o header. */
export function cabecalhosAtribuicaoDaSessao(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    return cabecalhosDeAtribuicao(window.sessionStorage)
  }
  catch {
    return {}
  }
}

export function nomeEventoAuth(contaNova: boolean): 'sign_up' | 'login' {
  return contaNova ? 'sign_up' : 'login'
}

/**
 * GA4 só pelo gtag que o plugin de consentimento já instalou. Sem gtag
 * (sem aceite, ou id vazio) a chamada não existe e nenhum script é carregado.
 */
export function dispararEventoAuth(metodo: MetodoAuth, contaNova: boolean): void {
  if (typeof window === 'undefined') return
  try {
    ;(window as { gtag?: (comando: string, nome: string, params: { method: MetodoAuth }) => void }).gtag?.('event', nomeEventoAuth(contaNova), { method: metodo })
  }
  catch {
    // a medição não desfaz a conta que já abriu
  }
}
