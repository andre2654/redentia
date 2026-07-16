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

/**
 * Partes de uma data no fuso de SP — usar em TODO rótulo de hora que roda no
 * SSR. O Nitro da Vercel roda em UTC; getHours()/localISODate() no servidor
 * davam +3h ('hoje, 09:50' às 06:50 de SP = hora no futuro pro leitor BR) e a
 * virada hoje/ontem caía às 21h. Intl com timeZone resolve no cliente e no
 * servidor igual (sem mismatch de hidratação). { ymd, hm, dm }.
 */
function spParts(d: Date): { ymd: string; hm: string; dm: string; day: number; monthIdx: number } {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(d).map((x) => [x.type, x.value]),
  ) as Record<string, string>
  const hour = p.hour === '24' ? '00' : p.hour
  return {
    ymd: `${p.year}-${p.month}-${p.day}`,
    hm: `${hour}:${p.minute}`,
    dm: `${p.day}/${p.month}`,
    day: Number(p.day),
    monthIdx: Number(p.month) - 1,
  }
}

/** 'hoje, 08:30' · 'ontem' · '04/07' (formato das linhas de notícia do /mercado e /asset). */
export function relTime(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const today = spParts(new Date()).ymd
  const yesterday = spParts(new Date(Date.now() - 86_400_000)).ymd
  const cur = spParts(d)
  if (cur.ymd === today) return `hoje, ${cur.hm}`
  if (cur.ymd === yesterday) return 'ontem'
  return cur.dm
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
  const cur = spParts(d)
  if (cur.ymd === spParts(now).ymd && diffMin >= 0) {
    if (diffMin < 60) return `há ${Math.max(diffMin, 1)} min`
    if (diffMin < 180) return `há ${Math.round(diffMin / 60)} h`
    return `hoje, ${cur.hm}`
  }
  if (cur.ymd === spParts(new Date(now.getTime() - 86_400_000)).ymd) return 'ontem'
  return `${cur.day} ${MONTHS_PT[cur.monthIdx]}`
}

/**
 * Capa de tese otimizada: as capas viviam como PNG de 2-2,6MB (11,6MB total,
 * 79% do public/) e eram o LCP das páginas SEO /tese/*. Agora servimos WebP
 * (~80-140KB, -95%). O backend ainda devolve o path `.png` (repo separado);
 * este helper reescreve `/teses/X.png` → `/teses/X.webp` no ponto de render.
 * Só toca capas de tese: qualquer outro path (webp já, imagem de notícia, URL
 * externa, null) passa direto. Se uma capa nova do backend não tiver .webp, o
 * @error dos cards cai no placeholder on-brand (degrade, não img quebrada).
 */
export function teseCover(url: string | null | undefined): string | null {
  if (!url) return null
  return /^\/teses\/[a-z0-9-]+\.png$/i.test(url) ? url.replace(/\.png$/i, '.webp') : url
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
