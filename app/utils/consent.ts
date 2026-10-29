/**
 * Consentimento de análise e anúncio, antes dos scripts que identificam
 * a pessoa ou gravam cookie de rastreio.
 *
 * A escolha fica em dois lugares com o mesmo valor (`<versão>.granted` ou
 * `<versão>.denied`):
 *  - cookie first-party `redentia_consent` (o SSR lê, para não emitir o
 *    iframe noscript do GTM sem aceite);
 *  - localStorage, para a escolha sobreviver se o cookie não gravar.
 *
 * Versão da política no valor: se CONSENT_POLICY_VERSION mudar, a escolha
 * antiga deixa de valer e o aviso volta. Sem aceite, os plugins não injetam
 * GA4, GTM, Clarity nem a Insight Tag. O Vercel Web Analytics fica de fora
 * deste portão: não grava cookie, não identifica a pessoa e mede audiência
 * de forma anônima e agregada, com base no legítimo interesse (LGPD,
 * art. 7º, IX). Continua bloqueado em rota com token secreto na URL.
 *
 * Consent Mode do Google não entra: com o consentimento negado o gtag.js
 * ainda seria baixado de googletagmanager.com, e o requisito é sem aceite,
 * sem script.
 */
import { isSecretTokenPath } from './analytics-privacy.ts'
import { isPaidLanding } from './paid-landing.ts'

export const CONSENT_POLICY_VERSION = '1'
export const CONSENT_COOKIE = 'redentia_consent'
export const CONSENT_STORAGE_KEY = 'redentia_consent'
/** 1 ano. A troca da versão da política pede a escolha de novo antes disso. */
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365

export type ConsentChoice = 'granted' | 'denied'

export function serializarConsentimento(escolha: ConsentChoice, versao = CONSENT_POLICY_VERSION): string {
  return `${versao}.${escolha}`
}

/** null = sem escolha válida para esta versão (o aviso deve aparecer). */
export function interpretarConsentimento(raw: string | null | undefined, versao = CONSENT_POLICY_VERSION): ConsentChoice | null {
  if (!raw) return null
  let valor = raw.trim()
  if (valor.startsWith('"') && valor.endsWith('"')) {
    try { valor = JSON.parse(valor) as string }
    catch { valor = valor.slice(1, -1) }
  }
  const i = valor.indexOf('.')
  if (i < 0) return null
  const v = valor.slice(0, i)
  const escolha = valor.slice(i + 1)
  if (v !== versao) return null
  if (escolha === 'granted' || escolha === 'denied') return escolha
  return null
}

export function valorDoCookie(header: string | null | undefined, name: string): string | null {
  if (!header) return null
  for (const part of header.split(';')) {
    const t = part.trim()
    const eq = t.indexOf('=')
    if (eq < 0) continue
    if (t.slice(0, eq) !== name) continue
    const cru = t.slice(eq + 1)
    try { return decodeURIComponent(cru) }
    catch { return cru }
  }
  return null
}

export function consentimentoNoCookie(header: string | null | undefined): ConsentChoice | null {
  return interpretarConsentimento(valorDoCookie(header, CONSENT_COOKIE))
}

/** Cookie, e se não houver, localStorage. Só no browser. */
export function lerConsentimento(): ConsentChoice | null {
  if (typeof document === 'undefined') return null
  const doCookie = consentimentoNoCookie(document.cookie)
  if (doCookie) return doCookie
  try {
    return interpretarConsentimento(localStorage.getItem(CONSENT_STORAGE_KEY))
  }
  catch {
    return null
  }
}

export function escreverCookieDeConsentimento(valor: string): void {
  if (typeof document === 'undefined') return
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(valor)}; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${secure}`
}

const COOKIE_DE_RASTREIO = /^(?:_ga|_gid|_gat|_gcl_|_clck|_clsk|CLID|MUID|MR|SM|ANONCHK|SRM_B|li_|lidc|bcookie|bscookie|UserMatchHistory|AnalyticsSyncHistory|lms_ads|lms_analytics)/

/** Apaga cookies conhecidos de GA, Clarity e LinkedIn ao recusar. Não mexe na sessão nem no cookie de consentimento. */
export function apagarCookiesDeRastreio(): void {
  if (typeof document === 'undefined') return
  const nomes = document.cookie.split(';').map(s => s.trim().split('=')[0] ?? '').filter(n => n && COOKIE_DE_RASTREIO.test(n))
  const host = location.hostname
  const partes = host.split('.')
  const dominios = ['', host, `.${host}`]
  if (partes.length >= 2) dominios.push(`.${partes.slice(-2).join('.')}`)
  for (const nome of nomes) {
    for (const dominio of dominios) {
      const d = dominio ? `; Domain=${dominio}` : ''
      document.cookie = `${nome}=; Path=/; Max-Age=0${d}`
    }
  }
}

type Ouvinte = () => void
const ouvintes = new Set<Ouvinte>()

export function aoAceitar(fn: Ouvinte): void {
  if (import.meta.server) return
  ouvintes.add(fn)
}

export function avisarAceite(): void {
  if (import.meta.server) return
  for (const fn of ouvintes) {
    try { fn() }
    catch { /* um rastreador não pode impedir os outros */ }
  }
}

/**
 * Roda `executar` só com consentimento granted e fora de rota com segredo.
 * Se a escolha já existe, dispara agora; senão, quando a pessoa aceitar.
 *
 * `pagoNaHora`: visita paga não espera o ocioso (o GTM e a Insight Tag).
 * `ocioso: false`: entra assim que o consentimento existe, sem esperar o idle.
 */
export function agendarComConsentimento(executar: () => void, opts?: { pagoNaHora?: boolean, ocioso?: boolean }): void {
  if (import.meta.server) return
  const ocioso = opts?.ocioso !== false

  const executarSePuder = () => {
    if (lerConsentimento() !== 'granted') return
    if (isSecretTokenPath(window.location.pathname)) return
    executar()
  }

  const disparar = () => {
    if (lerConsentimento() !== 'granted') return
    if (isSecretTokenPath(window.location.pathname)) return
    if (opts?.pagoNaHora && isPaidLanding(window.location.search)) {
      executarSePuder()
      return
    }
    if (!ocioso) {
      executarSePuder()
      return
    }
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(executarSePuder, { timeout: 4000 })
    }
    else {
      setTimeout(executarSePuder, 500)
    }
  }

  if (lerConsentimento() === 'granted') disparar()
  aoAceitar(disparar)
}
