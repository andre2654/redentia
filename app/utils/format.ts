/**
 * Helpers de formatação compartilhados entre domínios (extraídos no PR3 —
 * useMercado e useAcao tinham cópias idênticas de relTime/localISODate).
 * Auto-importados (app/utils é dir padrão do Nuxt).
 */

export const MONTHS_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const

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
