// ============================================================
// Automation presets — the source of truth for the admin wizard.
//
// Each preset is a recipe: given the admin's answers to a handful of
// params (top_n, side, schedule_time...), `buildConfig()` produces the
// JSONB that /api/admin/social-automations actually stores. The wizard
// in pages/admin/social/automations.vue consumes this file to render
// step 2 (preset-specific params) and step 3 (caption chips, schedule).
//
// Adding a new preset:
//   1. Declare it here with params + contextSources + buildConfig.
//   2. Make sure every `contextSources[].type` has a matching PHP
//      Source class registered in ChipCatalog.php.
//   3. Done — the UI picks it up automatically on the next reload.
// ============================================================

export type AutomationType = 'scheduled_post' | 'ticker_auto_reply' | 'profile_auto_comment'

export interface PresetParamSchema {
  key: string
  label: string
  kind: 'number' | 'select' | 'text'
  min?: number
  max?: number
  step?: number
  defaultValue: number | string
  options?: Array<{ value: string | number; label: string }>
  help?: string
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
  params: PresetParamSchema[]
  defaultCaption: string
  defaultSchedule: { cron: string; humanized: string } | null
  // Builders — pure functions of (paramValues). Keep them deterministic
  // so the JSON generated at save-time matches what the UI previews.
  buildMedia: (params: Record<string, string | number>) => MediaSpec[]
  buildContextSources: (params: Record<string, string | number>) => ContextSourceRef[]
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
  params: [
    {
      key: 'top_n',
      label: 'Quantidade de ativos',
      kind: 'number',
      min: 3, max: 10, step: 1,
      defaultValue: 6,
      help: 'Aparecem como slots #1 a #N no ranking e nos chips.',
    },
    {
      key: 'min_volume',
      label: 'Volume mínimo (BRL)',
      kind: 'select',
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
    ? '🔥 Maiores altas da B3 hoje · {rank.leader.ticker} liderou com +{rank.leader.change} · {date.today}'
    : '🔻 Maiores baixas da B3 hoje · {rank.leader.ticker} caiu {rank.leader.change} · {date.today}',
  defaultSchedule: { cron: '0 21 * * 1-5', humanized: 'Dias úteis às 18:00 BRT' },
  buildMedia: () => [
    {
      kind: 'image',
      source: `https://creative.redentia.com.br/ranking/${side}`,
      width: 1080,
      height: 1080,
      waitFor: 4000,
    },
  ],
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
    ? 'Animação 1080×1080 mostrando os top N da semana correndo em base 100. Usa os últimos Y anos de histórico.'
    : 'Animação 1080×1080 mostrando os piores N da semana correndo em base 100. Usa os últimos Y anos de histórico.',
  icon: side === 'best' ? 'i-lucide-flame' : 'i-lucide-snowflake',
  type: 'scheduled_post',
  tone: side === 'best' ? 'positive' : 'negative',
  params: [
    {
      key: 'limit',
      label: 'Quantidade de ativos na corrida',
      kind: 'number',
      min: 2, max: 5, step: 1,
      defaultValue: 5,
    },
    {
      key: 'years',
      label: 'Janela (anos)',
      kind: 'select',
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
      min: 5, max: 20, step: 1,
      defaultValue: 10,
    },
  ],
  defaultCaption: side === 'best'
    ? '🚀 Os melhores da semana na B3 · {series.leader.ticker} liderou com {series.leader.change} · {date.short}'
    : '🥶 Os piores da semana na B3 · {series.leader.ticker} afundou {series.leader.change} · {date.short}',
  defaultSchedule: side === 'best'
    ? { cron: '0 21 * * 5', humanized: 'Toda sexta às 18:00 BRT' }
    : { cron: '0 10 * * 1', humanized: 'Toda segunda às 07:00 BRT' },
  buildMedia: (p) => {
    const auto = side === 'best' ? 'best-week' : 'worst-week'
    const q = new URLSearchParams({
      auto: `${auto}-${p.limit}`,
      years: String(p.years),
      duration: String(Number(p.duration) * 1000),
    })
    return [
      {
        kind: 'video',
        source: `https://creative.redentia.com.br/growth-race?${q}`,
        width: 1080,
        height: 1080,
        durationMs: Number(p.duration) * 1000,
        fps: 10,
        warmupMs: 2500,
        holdMs: 2500,
      },
    ]
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
  params: [
    {
      key: 'per_side',
      label: 'Ativos por lado (altas/baixas)',
      kind: 'number',
      min: 5, max: 20, step: 1,
      defaultValue: 10,
    },
    {
      key: 'min_volume',
      label: 'Volume mínimo (BRL)',
      kind: 'select',
      defaultValue: 10_000_000,
      options: [
        { value: 1_000_000, label: 'R$ 1M' },
        { value: 5_000_000, label: 'R$ 5M' },
        { value: 10_000_000, label: 'R$ 10M' },
        { value: 50_000_000, label: 'R$ 50M' },
      ],
    },
  ],
  defaultCaption: 'Raio-X da semana na B3 · {week.leader.ticker} liderou as altas com {week.leader.change} · {date.short}',
  defaultSchedule: { cron: '0 12 * * 6', humanized: 'Sábado às 09:00 BRT' },
  buildMedia: (p) => {
    const q = new URLSearchParams({
      per_side: String(p.per_side),
      min_volume: String(p.min_volume),
    })
    return [
      {
        kind: 'image',
        source: `https://creative.redentia.com.br/treemap-weekly?${q}`,
        width: 1080,
        height: 1080,
        waitFor: 5000,
      },
    ]
  },
  buildContextSources: (p) => [
    { type: 'weekly-movers', params: { side: 'best', limit: Number(p.per_side), min_volume: Number(p.min_volume) } },
  ],
}

// ------------------------------------------------------------
// Preset #4 — Custom (escape hatch into the raw JSON editor)
// ------------------------------------------------------------
const customPost: AutomationPreset = {
  id: 'custom',
  label: 'Post customizado (avançado)',
  description: 'Editor JSON cru — use quando o preset que você precisa ainda não existe.',
  icon: 'i-lucide-code-2',
  type: 'scheduled_post',
  tone: 'neutral',
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
  customPost,
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
  return {
    preset: preset.id,
    preset_params: params,
    integrations,
    context_sources: preset.buildContextSources(params),
    content: {
      type: preset.buildMedia(params).length > 0 ? 'image' : 'text',
      value: caption,
      media: preset.buildMedia(params),
    },
    delay_minutes: delayMinutes ?? null,
  }
}
