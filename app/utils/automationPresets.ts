// ============================================================
// Automation presets — the source of truth for the admin wizard.
//
// Each preset is a recipe: given the admin's answers to a handful of
// params (top_n, side, image_title, caption…), `buildAutomationConfig`
// produces the JSONB that /api/admin/social-automations actually stores.
// The wizard in pages/admin/social/automations.vue consumes this file
// to render step 2 (preset-specific params) and step 3 (caption + schedule).
//
// Adding a new preset:
//   1. Declare it here with params + contextSources + buildMedia.
//   2. Make sure every `contextSources[].type` has a matching PHP
//      Source class registered in ChipCatalog.php.
//   3. Done — the UI picks it up automatically on the next reload.
//
// Params are organized into groups for the UI: `content` (what shows up
// on the image/video) vs `data` (filters, ranges). The wizard renders
// each group as its own section.
// ============================================================

export type AutomationType = 'scheduled_post' | 'ticker_auto_reply' | 'profile_auto_comment'

export type ParamGroup = 'content' | 'data'

export interface PresetParamSchema {
  key: string
  label: string
  kind: 'number' | 'select' | 'text'
  group: ParamGroup
  min?: number
  max?: number
  step?: number
  defaultValue: number | string
  options?: Array<{ value: string | number; label: string }>
  help?: string
  placeholder?: string
  supportsChips?: boolean // text fields where {chip.path} is useful (image title/label)
}

export interface ContextSourceRef {
  type: string // must match a PHP Source::id()
  params: Record<string, unknown>
}

export interface MediaSpec {
  kind: 'image' | 'video'
  source: string // URL (creative.redentia.com.br/... or internal)
  width?: number
  height?: number
  waitFor?: number
  durationMs?: number
  fps?: number
  warmupMs?: number
  holdMs?: number
}

export interface AutomationPreset {
  id: string // slug, also used as the `config.preset` field for round-tripping
  label: string
  description: string
  icon: string // lucide icon name
  type: AutomationType
  tone: 'positive' | 'negative' | 'neutral'
  hasMedia: boolean // false for text-only posts; drives UI hiding of image fields/preview
  params: PresetParamSchema[]
  defaultCaption: string
  defaultSchedule: { cron: string; humanized: string } | null
  // Pure functions of params. Must be deterministic so the preview URL
  // the UI shows matches what the backend renders at run-time.
  buildMedia: (params: Record<string, string | number>) => MediaSpec[]
  buildContextSources: (params: Record<string, string | number>) => ContextSourceRef[]
}

// ------------------------------------------------------------
// Helper: build a creative URL with query params, dropping blanks.
// Keeps the URL short and readable when the admin leaves defaults.
// ------------------------------------------------------------
function urlWithParams(base: string, params: Record<string, string | number | undefined | null>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue
    const str = String(v).trim()
    if (str === '') continue
    q.set(k, str)
  }
  const qs = q.toString()
  return qs ? `${base}?${qs}` : base
}

// ------------------------------------------------------------
// Preset #1 — Daily ranking (top or bottom)
// ------------------------------------------------------------
const dailyRanking = (side: 'top' | 'bottom'): AutomationPreset => ({
  id: side === 'top' ? 'daily-ranking-top' : 'daily-ranking-bottom',
  label: side === 'top' ? 'Ranking diário · Altas' : 'Ranking diário · Baixas',
  description: side === 'top'
    ? 'Carrossel com as maiores altas da B3 no fechamento. Puxa top N por volume, posta às 18h BRT.'
    : 'Carrossel com as maiores baixas da B3 no fechamento. Puxa bottom N por volume, posta às 18h BRT.',
  icon: side === 'top' ? 'i-lucide-trending-up' : 'i-lucide-trending-down',
  type: 'scheduled_post',
  tone: side === 'top' ? 'positive' : 'negative',
  hasMedia: true,
  params: [
    {
      key: 'image_title',
      label: 'Título da imagem',
      kind: 'text',
      group: 'content',
      defaultValue: side === 'top' ? 'Maiores Altas' : 'Maiores Baixas',
      supportsChips: true,
      placeholder: 'Ex: Maiores Altas de {date.weekday}',
      help: 'Headline que aparece no creative. Suporta variáveis ({date.today}, etc).',
    },
    {
      key: 'image_label',
      label: 'Legenda da imagem (data)',
      kind: 'text',
      group: 'content',
      defaultValue: '',
      supportsChips: true,
      placeholder: '{date.today} (padrão: data de hoje)',
      help: 'Chip da data abaixo do título. Deixe vazio pra auto-preencher com hoje.',
    },
    {
      key: 'top_n',
      label: 'Quantidade de ativos',
      kind: 'number',
      group: 'data',
      min: 3, max: 10, step: 1,
      defaultValue: 6,
      help: 'Aparecem como slots #1 a #N na imagem e nos chips da caption.',
    },
    {
      key: 'min_volume',
      label: 'Volume mínimo (BRL)',
      kind: 'select',
      group: 'data',
      defaultValue: 1_000_000,
      options: [
        { value: 500_000, label: 'R$ 500 mil' },
        { value: 1_000_000, label: 'R$ 1 milhão' },
        { value: 5_000_000, label: 'R$ 5 milhões' },
        { value: 10_000_000, label: 'R$ 10 milhões' },
      ],
      help: 'Filtra micro-caps de baixa liquidez pra não hijackarem o ranking.',
    },
  ],
  defaultCaption: side === 'top'
    ? '🔥 Maiores altas da B3 hoje ({date.today})\n\n{rank.leader.ticker} liderou com +{rank.leader.change}, seguido de {rank.2.ticker} ({rank.2.change}) e {rank.3.ticker} ({rank.3.change}).\n\n📊 Dados ao vivo em redentia.com.br'
    : '🔻 Maiores baixas da B3 hoje ({date.today})\n\n{rank.leader.ticker} caiu {rank.leader.change}, seguido de {rank.2.ticker} ({rank.2.change}) e {rank.3.ticker} ({rank.3.change}).\n\n📊 Dados ao vivo em redentia.com.br',
  defaultSchedule: { cron: '0 21 * * 1-5', humanized: 'Dias úteis às 18:00 BRT' },
  buildMedia: (p) => {
    const src = urlWithParams(`https://creative.redentia.com.br/ranking/${side}`, {
      limit: p.top_n,
      volume: p.min_volume,
      title: p.image_title,
      label: p.image_label,
    })
    return [{ kind: 'image', source: src, width: 1080, height: 1080, waitFor: 4000 }]
  },
  buildContextSources: (p) => [
    {
      type: 'ranking',
      params: {
        side,
        limit: Number(p.top_n),
        min_volume: Number(p.min_volume),
      },
    },
  ],
})

// ------------------------------------------------------------
// Preset #2 — Weekly growth race (best or worst of the week)
// ------------------------------------------------------------
const weeklyRace = (side: 'best' | 'worst'): AutomationPreset => ({
  id: side === 'best' ? 'weekly-best-race' : 'weekly-worst-race',
  label: side === 'best' ? 'Corrida semanal · Melhores' : 'Corrida semanal · Piores',
  description: side === 'best'
    ? 'Animação 1080×1080 com os top N da semana correndo em base 100 pelos últimos Y anos.'
    : 'Animação 1080×1080 com os piores N da semana correndo em base 100 pelos últimos Y anos.',
  icon: side === 'best' ? 'i-lucide-flame' : 'i-lucide-snowflake',
  type: 'scheduled_post',
  tone: side === 'best' ? 'positive' : 'negative',
  hasMedia: true,
  params: [
    {
      key: 'image_title',
      label: 'Título do vídeo',
      kind: 'text',
      group: 'content',
      defaultValue: '',
      supportsChips: true,
      placeholder: side === 'best'
        ? 'Ex: Melhores da semana · últimos 5 anos'
        : 'Ex: Piores da semana · últimos 5 anos',
      help: 'Headline no topo do vídeo. Deixe vazio pra auto-gerar baseado nos anos.',
    },
    {
      key: 'limit',
      label: 'Quantidade de ativos na corrida',
      kind: 'number',
      group: 'data',
      min: 2, max: 5, step: 1,
      defaultValue: 5,
    },
    {
      key: 'years',
      label: 'Janela (anos)',
      kind: 'select',
      group: 'data',
      defaultValue: 5,
      options: [
        { value: 1, label: '1 ano' },
        { value: 3, label: '3 anos' },
        { value: 5, label: '5 anos' },
        { value: 10, label: '10 anos' },
      ],
    },
    {
      key: 'duration',
      label: 'Duração da animação (segundos)',
      kind: 'number',
      group: 'data',
      min: 5, max: 20, step: 1,
      defaultValue: 10,
    },
  ],
  defaultCaption: side === 'best'
    ? '🚀 Os melhores da semana na B3\n\n{series.leader.ticker} liderou com {series.leader.change} nos últimos 7 dias.\nNa corrida dos últimos anos: {series.list}.\n\n📈 Dados ao vivo em redentia.com.br'
    : '🥶 Os piores da semana na B3\n\n{series.leader.ticker} afundou {series.leader.change} nos últimos 7 dias.\nRanking completo: {series.list}.\n\n📉 Dados ao vivo em redentia.com.br',
  defaultSchedule: side === 'best'
    ? { cron: '0 21 * * 5', humanized: 'Toda sexta às 18:00 BRT' }
    : { cron: '0 10 * * 1', humanized: 'Toda segunda às 07:00 BRT' },
  buildMedia: (p) => {
    const auto = side === 'best' ? 'best-week' : 'worst-week'
    const src = urlWithParams('https://creative.redentia.com.br/growth-race', {
      auto: `${auto}-${p.limit}`,
      years: p.years,
      duration: Number(p.duration) * 1000,
      title: p.image_title,
    })
    return [{
      kind: 'video',
      source: src,
      width: 1080, height: 1080,
      durationMs: Number(p.duration) * 1000,
      fps: 10, warmupMs: 2500, holdMs: 2500,
    }]
  },
  buildContextSources: (p) => [
    {
      type: 'growth-race',
      params: {
        auto: side === 'best' ? 'best-week' : 'worst-week',
        limit: Number(p.limit),
      },
    },
  ],
})

// ------------------------------------------------------------
// Preset #3 — Weekly treemap
// ------------------------------------------------------------
const weeklyTreemap: AutomationPreset = {
  id: 'weekly-treemap',
  label: 'Treemap semanal',
  description: 'Heatmap com maiores altas e baixas da semana lado a lado. Célula proporcional à variação.',
  icon: 'i-lucide-grid-2x2',
  type: 'scheduled_post',
  tone: 'neutral',
  hasMedia: true,
  params: [
    {
      key: 'image_title',
      label: 'Título da imagem',
      kind: 'text',
      group: 'content',
      defaultValue: 'Raio-X da semana',
      supportsChips: true,
      placeholder: 'Ex: Raio-X da semana',
    },
    {
      key: 'per_side',
      label: 'Ativos por lado (altas/baixas)',
      kind: 'number',
      group: 'data',
      min: 5, max: 20, step: 1,
      defaultValue: 10,
    },
    {
      key: 'min_volume',
      label: 'Volume mínimo (BRL)',
      kind: 'select',
      group: 'data',
      defaultValue: 10_000_000,
      options: [
        { value: 1_000_000, label: 'R$ 1M' },
        { value: 5_000_000, label: 'R$ 5M' },
        { value: 10_000_000, label: 'R$ 10M' },
        { value: 50_000_000, label: 'R$ 50M' },
      ],
    },
  ],
  defaultCaption: '📊 Raio-X da semana na B3\n\n↗ {week.leader.ticker} liderou as altas com {week.leader.change}\n↘ Confira quem desabou do outro lado\n\n📅 Período: {week.window.start} → {week.window.end}\n\nDados ao vivo em redentia.com.br',
  defaultSchedule: { cron: '0 12 * * 6', humanized: 'Sábado às 09:00 BRT' },
  buildMedia: (p) => {
    const src = urlWithParams('https://creative.redentia.com.br/treemap-weekly', {
      per_side: p.per_side,
      min_volume: p.min_volume,
      title: p.image_title,
    })
    return [{ kind: 'image', source: src, width: 1080, height: 1080, waitFor: 5000 }]
  },
  buildContextSources: (p) => [
    { type: 'weekly-movers', params: { side: 'best', limit: Number(p.per_side), min_volume: Number(p.min_volume) } },
  ],
}

// ------------------------------------------------------------
// Preset #4 — Text-only post (no image, pure caption)
//   Used as the escape hatch: any existing automation without a
//   recognized preset loads into this one so the admin can still
//   edit caption + schedule + integrations without touching JSON.
// ------------------------------------------------------------
const textOnlyPost: AutomationPreset = {
  id: 'text-only',
  label: 'Post só texto',
  description: 'Publicação puramente textual — sem imagem nem vídeo. Útil pra anúncios, novidades ou citações.',
  icon: 'i-lucide-message-square',
  type: 'scheduled_post',
  tone: 'neutral',
  hasMedia: false,
  params: [],
  defaultCaption: '',
  defaultSchedule: null,
  buildMedia: () => [],
  buildContextSources: () => [],
}

// ------------------------------------------------------------
// Registry
// ------------------------------------------------------------
export const AUTOMATION_PRESETS: AutomationPreset[] = [
  dailyRanking('top'),
  dailyRanking('bottom'),
  weeklyRace('best'),
  weeklyRace('worst'),
  weeklyTreemap,
  textOnlyPost,
]

export function findPreset(id: string | null | undefined): AutomationPreset | null {
  if (!id) return null
  return AUTOMATION_PRESETS.find(p => p.id === id) ?? null
}

/**
 * Builds the full `config` JSONB stored in social_automations.config.
 * The shape matches what RunSocialAutomation::runScheduledPost expects
 * plus a `preset` marker + `context_sources` for TextRenderer.
 */
export function buildAutomationConfig(opts: {
  preset: AutomationPreset
  params: Record<string, string | number>
  integrations: string[]
  caption: string
  delayMinutes?: number | null
}): Record<string, unknown> {
  const { preset, params, integrations, caption, delayMinutes } = opts
  const media = preset.buildMedia(params)
  return {
    preset: preset.id,
    preset_params: params,
    integrations,
    context_sources: preset.buildContextSources(params),
    content: {
      type: media.length > 0 ? 'image' : 'text',
      value: caption,
      media,
    },
    delay_minutes: delayMinutes ?? null,
  }
}

/**
 * Groups preset params by their group label. Returns only non-empty
 * groups so the UI can skip rendering a heading when there's nothing
 * in that category.
 */
export function groupPresetParams(preset: AutomationPreset): Array<{ group: ParamGroup; label: string; params: PresetParamSchema[] }> {
  const buckets: Record<ParamGroup, PresetParamSchema[]> = { content: [], data: [] }
  for (const p of preset.params) {
    buckets[p.group].push(p)
  }
  const groups: Array<{ group: ParamGroup; label: string; params: PresetParamSchema[] }> = []
  if (buckets.content.length > 0) groups.push({ group: 'content', label: 'Conteúdo da imagem', params: buckets.content })
  if (buckets.data.length > 0) groups.push({ group: 'data', label: 'Dados e filtros', params: buckets.data })
  return groups
}
