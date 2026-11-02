/**
 * A regra pura do chat em painel (02/11/2026): sugestões por página, onde a
 * barra aparece, o contexto que vai junto da pergunta e os deep-links. Sem
 * Vue, para o `node --test`.
 *
 * O contexto vai ao chat-service como `attachments` de texto (o mesmo campo dos
 * arquivos do composer do app; ver chat-service src/routes/chat.stream.ts e
 * src/lib/attachments.ts). O servidor dobra o texto dentro da mensagem que o
 * modelo lê, guarda só a prosa da pessoa em `content` e o nome de cada anexo
 * em `meta.attachments`: é com esse nome que a conversa reaberta redesenha os
 * chips. Por isso o `name` é o rótulo do chip.
 */
import type { ContextoDoChat } from '../composables/useChatPainel'

/** O chat-service aceita até 5 anexos por turno (AttachmentSchema.max(5)). */
export const MAX_CONTEXTOS = 5
/** Teto do texto de um pedaço: o bastante para o dado, pouco para o custo. */
export const MAX_TEXTO_CONTEXTO = 1200

const TICKER_RE = /^[A-Z0-9]{3,8}$/

/** O ticker de uma rota /asset/X ou /dividendos/X (maiúsculo), ou null. */
export function tickerDaRota(path: string): string | null {
  const m = path.match(/^\/(?:asset|dividendos|quanto-rende)\/([^/?#]+)/i)
  if (!m) return null
  const t = decodeURIComponent(m[1]!).toUpperCase()
  return TICKER_RE.test(t) ? t : null
}

/**
 * Sugestões da barra e do painel vazio. Perguntas que a pessoa faria de
 * verdade, nunca "compre/venda": o "vale a pena" vira o que pesar antes.
 */
export function sugestoesDaRota(path: string): string[] {
  const t = tickerDaRota(path)
  if (t && path.toLowerCase().startsWith('/dividendos/')) {
    return [`Quanto a ${t} paga de proventos?`, `Os proventos da ${t} são recorrentes?`, `Por que a ${t} mexeu hoje?`]
  }
  if (t) {
    return [`Por que a ${t} mexeu hoje?`, `Quanto a ${t} paga de proventos?`, `O que pesar antes de investir na ${t}?`]
  }
  if (path === '/carteira' || path.startsWith('/carteira/')) {
    return ['Como foi a minha carteira hoje?', 'O que mais pesa na minha carteira?', 'Quanto recebo de proventos por mês?']
  }
  if (path.startsWith('/tese')) {
    return ['Como funcionam as teses da Redentia?', 'Quais teses estão rendendo mais?', 'O que mexeu com a bolsa hoje?']
  }
  if (path.startsWith('/noticias')) {
    return ['O que mexeu com a bolsa hoje?', 'Qual notícia pesa mais na minha carteira?', 'Como está o dólar hoje?']
  }
  if (path.startsWith('/tesouro')) {
    return ['Tesouro Selic ou CDB: qual a diferença?', 'Quanto rende o Tesouro IPCA+ hoje?', 'Como funciona a marcação a mercado?']
  }
  return ['Faça um raio-X da PETR4', 'O que pesar antes de investir na VALE3?', 'Quais ações pagam mais proventos?', 'Como está a minha carteira?']
}

/**
 * Onde a barra flutuante aparece. Some no login, no quiz da assinatura, na
 * /busca (a página já é a pergunta) e enquanto o painel está aberto (o painel
 * tem o próprio campo).
 */
export function barraVisivel(path: string, painelAberto: boolean): boolean {
  if (painelAberto) return false
  const p = path.replace(/\/+$/, '') || '/'
  if (p === '/login' || p === '/assinar' || p.startsWith('/assinar/')) return false
  if (p === '/busca') return false
  if (p.startsWith('/business') || p.startsWith('/cliente')) return false
  return true
}

/** `routeContext` do chat-service: o ativo da página vira o foco do turno. */
export function routeContextDaRota(path: string): { type: 'asset' | 'tesouro' | 'home'; ticker?: string } | null {
  const t = tickerDaRota(path)
  if (t) return { type: 'asset', ticker: t }
  if (path.startsWith('/tesouro')) return { type: 'tesouro' }
  if (path === '/' || path === '') return { type: 'home' }
  return null
}

/** O texto visível de um pedaço da página, compacto: sem espaço sobrando, com teto. */
export function textoCompacto(bruto: string, max = MAX_TEXTO_CONTEXTO): string {
  const t = String(bruto ?? '')
    .replace(/[ \t ]+/g, ' ')
    .split('\n').map((l) => l.trim()).filter(Boolean).join('\n')
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t
}

/** Um link para /asset/X sem marcação própria vira o contexto do ativo. */
export function contextoDoLinkDeAtivo(href: string, textoVisivel: string, rota?: string): ContextoDoChat | null {
  let path = href
  try { path = new URL(href, 'https://x.invalid').pathname } catch { /* href relativo cru */ }
  const m = path.match(/^\/asset\/([^/?#]+)/i)
  if (!m) return null
  const t = decodeURIComponent(m[1]!).toUpperCase()
  if (!TICKER_RE.test(t)) return null
  const texto = textoCompacto(textoVisivel, 400)
  return { id: `ativo:${t}`, tipo: 'ativo', rotulo: t, texto: texto ? `${t}: ${texto}` : t, rota }
}

const TIPO_LEGIVEL: Record<string, string> = {
  ativo: 'Ativo', grafico: 'Gráfico', proventos: 'Proventos', carteira: 'Carteira',
  posicao: 'Posição', tese: 'Tese', noticia: 'Notícia', bolsa: 'Bolsa',
}

/**
 * Os contextos como `attachments` de texto do /stream. `name` é o rótulo do
 * chip (é ele que volta em meta.attachments); o conteúdo diz de onde veio.
 */
export function anexosDoTurno(contextos: ContextoDoChat[]) {
  return contextos.slice(0, MAX_CONTEXTOS).map((c) => {
    const content = [
      `${TIPO_LEGIVEL[c.tipo] ?? 'Trecho'} que a pessoa mostrou na página${c.rota ? ` ${c.rota}` : ''}:`,
      textoCompacto(c.texto) || c.rotulo,
    ].join('\n')
    return {
      name: c.rotulo.slice(0, 200),
      mime: 'text/plain',
      size: new TextEncoder().encode(content).length,
      kind: 'text' as const,
      content,
    }
  })
}

/**
 * O que a URL pede ao painel. `?pergunta=` abre e envia em qualquer página;
 * `?chat=1` só abre. Na /busca o `?chat=1&q=` é contrato da própria página
 * (useAporteChat, atalhos da carteira) e fica com ela.
 */
export function pedidoDaQuery(path: string, query: Record<string, unknown>): { abrir: boolean; pergunta: string | null } {
  const s = (v: unknown) => (typeof v === 'string' ? v : Array.isArray(v) && typeof v[0] === 'string' ? v[0] : '')
  const pergunta = s(query.pergunta).trim()
  if (pergunta) return { abrir: true, pergunta: pergunta.slice(0, 2000) }
  if (s(query.chat) === '1' && !path.startsWith('/busca')) return { abrir: true, pergunta: null }
  return { abrir: false, pergunta: null }
}

/** A query sem os parâmetros do painel (o refresh não reenvia a pergunta). */
export function querySemPedido(query: Record<string, unknown>): Record<string, unknown> {
  const { pergunta: _p, chat: _c, ...resto } = query
  return resto
}

/** O sanitizeRedirect (utils/auth.ts) recusa volta maior que isto. */
const MAX_REDIRECT = 256

/**
 * O login de quem não entrou: volta para a MESMA página com a pergunta em
 * `?pergunta=`, que reabre o painel e envia depois do login. Pergunta longa
 * demais para o redirect volta sem ela (`naUrl: false`): quem chama guarda a
 * pergunta no sessionStorage.
 */
export function loginComPergunta(path: string, query: Record<string, unknown>, pergunta: string): { url: string; naUrl: boolean } {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(querySemPedido(query))) {
    if (typeof v === 'string') params.set(k, v)
  }
  const base = params.toString() ? `${path}?${params.toString()}` : path
  params.set('pergunta', pergunta)
  const comPergunta = `${path}?${params.toString()}`
  const naUrl = comPergunta.length <= MAX_REDIRECT
  const volta = naUrl ? comPergunta : base.length <= MAX_REDIRECT ? base : path
  return { url: `/login?redirect=${encodeURIComponent(volta)}`, naUrl }
}

/** O rótulo do chip, curto: "Por que a Vale caiu…". */
export function rotuloCurto(s: string, max = 34): string {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim()
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t
}

/** Linhas "rótulo: valor" de um NuStatList, uma por linha. */
export function textoDeLinhas(rows: Array<{ l: string; v: string }>): string {
  return rows.filter((r) => r.l && r.v).map((r) => `${r.l}: ${r.v}`).join('\n')
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const pct = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'exceptZero' })
const dataBr = (iso: string) => (/^\d{4}-\d{2}-\d{2}/.test(iso) ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : iso)

/**
 * O gráfico em palavras, só com os pontos que ele desenha: início, fim, a
 * variação no período, a mínima e a máxima, e o IBOV no mesmo período.
 */
export function textoDoGrafico(
  ticker: string,
  periodo: string,
  pontos: Array<{ t: string; v: number }>,
  ibov: Array<{ t: string; v: number }> = [],
): string {
  if (pontos.length < 2) return `${ticker} em ${periodo}: sem pontos suficientes no gráfico.`
  const a = pontos[0]!, z = pontos[pontos.length - 1]!
  let min = a, max = a
  for (const p of pontos) { if (p.v < min.v) min = p; if (p.v > max.v) max = p }
  const linhas = [
    `${ticker} em ${periodo}: de ${brl.format(a.v)} (${dataBr(a.t)}) a ${brl.format(z.v)} (${dataBr(z.t)})${a.v ? `, ${pct.format(((z.v - a.v) / a.v) * 100)}%` : ''}.`,
    `Mínima ${brl.format(min.v)} (${dataBr(min.t)}); máxima ${brl.format(max.v)} (${dataBr(max.t)}).`,
  ]
  if (ibov.length >= 2 && ibov[0]!.v) {
    linhas.push(`IBOV no mesmo período: ${pct.format(((ibov[ibov.length - 1]!.v - ibov[0]!.v) / ibov[0]!.v) * 100)}%.`)
  }
  return linhas.join('\n')
}
