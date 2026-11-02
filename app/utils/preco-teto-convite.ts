/**
 * Convite "Acompanhar este ticker" em /calculadora/preco-teto/{TICKER}.
 *
 * Texto e eventos ficam aqui, sem Nuxt, para o node --test. O GA4 sai só pelo
 * gtag que o plugin de consentimento já instalou, e só com consentimento
 * granted fora de rota com segredo — o mesmo portão dos outros eventos.
 * Sem gtag, sem aceite ou com aceite negado, a função não chama nada.
 */
import { isSecretTokenPath } from './analytics-privacy.ts'
import { lerConsentimento, type ConsentChoice } from './consent.ts'

export const TITULO_CONVITE_PRECO_TETO = 'Acompanhar este ticker'

export const LEGAL_CONVITE_PRECO_TETO = 'Grátis, com a sua conta.'

/** Quando o formulário de e-mail da conta aparece (quem entrou pelo celular). */
export const LEGAL_EMAIL_CONVITE_PRECO_TETO = 'O código confirma este e-mail na sua conta, para o aviso do fim do pregão.'

export const EVENTO_VIEW_CONVITE_PRECO_TETO = 'preco_teto_convite_view'
export const EVENTO_SUBMIT_CONVITE_PRECO_TETO = 'preco_teto_convite_submit'

export type EventoConvitePrecoTeto = typeof EVENTO_VIEW_CONVITE_PRECO_TETO | typeof EVENTO_SUBMIT_CONVITE_PRECO_TETO

export type ResultadoConvitePrecoTeto = 'enviado' | 'recusado' | 'repetido' | 'sem-ticker'

const TICKER = /^[A-Z]{4}\d{1,2}$/

/** PETR4, TAEE11. Qualquer outra coisa não vira evento nem frase. */
export function normalizarTickerConvite(raw: string): string | null {
  const t = raw.trim().toUpperCase()
  return TICKER.test(t) ? t : null
}

/**
 * Com preço teto, o texto descreve o que o POST /watchlist com alert_price
 * faz: e-mail no fim do pregão em que o fechamento cruza esse número, e o
 * papel na lista. Sem preço, só a lista — a cotação na página inicial.
 * `alvoFormatado` já vem em reais (R$ 42,10); null é a lista sozinha.
 */
export function corpoConvitePrecoTeto(ticker: string, alvoFormatado: string | null): string {
  const t = normalizarTickerConvite(ticker)
  if (!t) return ''
  if (alvoFormatado) {
    return `Um e-mail no fim do pregão em que a cotação de ${t} cruzar o preço teto desta página (${alvoFormatado}). O papel entra na sua lista de ativos seguidos.`
  }
  return `${t} entra na sua lista de ativos seguidos. A cotação do último pregão fica na sua página inicial.`
}

export function rotuloBotaoConvitePrecoTeto(ticker: string): string {
  const t = normalizarTickerConvite(ticker)
  return t ? `Acompanhar ${t}` : ''
}

export function rotuloJaSegueConvite(ticker: string): string {
  const t = normalizarTickerConvite(ticker)
  return t ? `Você segue ${t}` : ''
}

export function confirmacaoListaConvite(ticker: string): string {
  const t = normalizarTickerConvite(ticker)
  return t ? `Você está seguindo ${t}.` : ''
}

export interface GtagConvite {
  (comando: 'event', nome: string, params: { ticker: string }): void
}

export interface AmbienteConvite {
  consentimento: ConsentChoice | null
  gtag?: GtagConvite
  caminho: string
}

export function ambienteConviteAtual(): AmbienteConvite {
  if (typeof window === 'undefined') return { consentimento: null, caminho: '' }
  const w = window as Window & { gtag?: GtagConvite }
  return {
    consentimento: lerConsentimento(),
    gtag: typeof w.gtag === 'function' ? w.gtag : undefined,
    caminho: window.location.pathname,
  }
}

/**
 * Um evento, com `ticker`. Recusa sem consentimento granted, sem gtag, em
 * rota com segredo ou com ticker inválido. Não carrega script.
 */
export function dispararEventoConvitePrecoTeto(
  nome: EventoConvitePrecoTeto,
  ticker: string,
  ambiente: AmbienteConvite = ambienteConviteAtual(),
): ResultadoConvitePrecoTeto {
  const t = normalizarTickerConvite(ticker)
  if (!t) return 'sem-ticker'
  if (ambiente.consentimento !== 'granted') return 'recusado'
  if (isSecretTokenPath(ambiente.caminho)) return 'recusado'
  if (typeof ambiente.gtag !== 'function') return 'recusado'
  try {
    ambiente.gtag('event', nome, { ticker: t })
  }
  catch {
    return 'recusado'
  }
  return 'enviado'
}

const vistos = new Set<string>()

/** Uma view por ticker neste documento. Sem envio, o ticker não fica marcado. */
export function viewConviteNoConjunto(
  ticker: string,
  jaVistos: Set<string>,
  ambiente: AmbienteConvite,
): ResultadoConvitePrecoTeto {
  const t = normalizarTickerConvite(ticker)
  if (!t) return 'sem-ticker'
  if (jaVistos.has(t)) return 'repetido'
  const r = dispararEventoConvitePrecoTeto(EVENTO_VIEW_CONVITE_PRECO_TETO, t, ambiente)
  if (r === 'enviado') jaVistos.add(t)
  return r
}

export function viewConviteSeCouber(
  ticker: string,
  ambiente: AmbienteConvite = ambienteConviteAtual(),
): ResultadoConvitePrecoTeto {
  return viewConviteNoConjunto(ticker, vistos, ambiente)
}

/** Só o teste zera o conjunto do módulo. A página não chama. */
export function limparViewsDoConvitePrecoTeto(): void {
  vistos.clear()
}
