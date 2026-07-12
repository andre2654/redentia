/**
 * Helpers de formatação compartilhados entre domínios (extraídos no PR3 —
 * useMercado e useAcao tinham cópias idênticas de relTime/localISODate).
 * Auto-importados (app/utils é dir padrão do Nuxt).
 */

export const MONTHS_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const
export const MONTH_LONG_PT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'] as const

const nf2pct = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** '+1,89%' / '-0,42%' — formato padrão de variação dos designs (2 casas). */
export function pctFmt(n: number): string {
  return `${n > 0 ? '+' : ''}${nf2pct.format(n)}%`
}

/** direção semântica (0 conta como alta — padrão dos designs). */
export function dirOf(n: number): 'up' | 'down' {
  return n < 0 ? 'down' : 'up'
}

/**
 * 'YYYY-MM-DD' de hoje em São Paulo (produto BR-only: SSR e client no MESMO
 * fuso — sem mismatch de hidratação). Extraído do useHome no PR8.
 */
export function spISODate(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
}

export function localISODate(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 'hoje, 08:30' · 'ontem' · '04/07' (formato das linhas de notícia do /mercado e /acao). */
export function relTime(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const today = localISODate()
  const yesterday = localISODate(new Date(Date.now() - 86_400_000))
  const day = localISODate(d)
  if (day === today) return `hoje, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  if (day === yesterday) return 'ontem'
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * 'há 32 min' · 'há 2 h' · 'hoje, 09:40' · 'ontem' · '10 jul' — a escala do
 * feed editorial do /noticias (o design usa 'há 1 h'/'há 2 h' pro fresquíssimo
 * e 'hoje, HH:MM' pro resto do dia; corte em 3h espelha o mock).
 */
export function relTimeFeed(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const now = new Date()
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60_000)
  const day = localISODate(d)
  if (day === localISODate(now) && diffMin >= 0) {
    if (diffMin < 60) return `há ${Math.max(diffMin, 1)} min`
    if (diffMin < 180) return `há ${Math.round(diffMin / 60)} h`
    return `hoje, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  if (day === localISODate(new Date(now.getTime() - 86_400_000))) return 'ontem'
  return `${d.getDate()} ${MONTHS_PT[d.getMonth()]}`
}

/** 'money_times' → 'Money Times' (o design mostra o veículo por extenso). */
export function sourcePretty(s: string): string {
  return s.replace(/_/g, ' ').replace(/(^|\s)\S/g, (c) => c.toUpperCase())
}

/**
 * CDI do GET /macro/snapshot vem em % AO DIA (label '% a.d.', SGS 12 do BCB —
 * verificado em prod 2026-07-11: value 0.052531). Anualiza compondo 252
 * pregões; se um dia o backend passar a mandar % a.a., o label muda e o valor
 * passa direto. Usado no ticker global e na legenda CDI da Home (PR7).
 */
export function cdiAnnualPct(cdi: { value: number | null; label?: string | null } | null | undefined): number | null {
  if (cdi?.value == null || !Number.isFinite(cdi.value)) return null
  if ((cdi.label ?? '').includes('a.d')) return ((1 + cdi.value / 100) ** 252 - 1) * 100
  return cdi.value
}

/**
 * 'agora' · 'há 12 min' · 'há 2 h' · 'há 3 d' — escala das conversas do chat
 * do /busca (PR9; porta a rel() do mock Redentia Busca Nu.dc.html).
 */
export function relAgo(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const mn = Math.round(Math.max(0, Date.now() - d.getTime()) / 60_000)
  if (mn < 1) return 'agora'
  if (mn < 60) return `há ${mn} min`
  const h = Math.round(mn / 60)
  if (h < 24) return `há ${h} h`
  return `há ${Math.round(h / 24)} d`
}

/** Escapa texto vindo da API antes de virar HTML (parágrafos usam v-html). */
export function escapeHtml(s: string): string {
  // aspas TAMBÉM: conteúdo escapado entra em atributos (href de link do chat)
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Parágrafo do briefing (API → HTML seguro): escapa e converte a convenção
 * {mark}…{/mark} do loop atlas-daily-briefing em <strong> (a ênfase editorial
 * do design). Tokens órfãos são removidos — nunca vaza "{mark}" literal.
 * (Extraído do useMercado no PR7 — a Home logada renderiza o mesmo briefing.)
 */
export function briefingHtml(s: string): string {
  return escapeHtml(s)
    .replace(/\{mark\}([\s\S]*?)\{\/mark\}/g, '<strong>$1</strong>')
    .replace(/\{\/?mark\}/g, '')
}
