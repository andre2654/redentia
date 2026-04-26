/**
 * useToolFamilies — single source of truth for grouping tool calls
 * into the Manus-style action cards that render inline beneath the
 * assistant's text.
 *
 * Each family carries:
 *   - `id`           internal slug used as map key
 *   - `label`        human label, shown in the ActionGroup header in
 *                     plural form ("Verificando dividendos")
 *   - `verb`         label-as-action for the ThinkingIndicator pill
 *                     ("Verificando dividendos…")
 *   - `icon`         lucide icon used in the row chevron column
 *   - `inline`       when false, the tool gets its OWN inline surface
 *                     (DecisionCard, ScenarioCard, etc.) and is NOT
 *                     bundled into an ActionGroup. We still need the
 *                     mapping so the ThinkingIndicator can describe
 *                     "Registrando decisão…" while it runs.
 */

export interface ToolFamily {
  id: string
  label: string
  verb: string
  icon: string
  inline: boolean
}

const FAMILIES: Record<string, ToolFamily> = {
  asset: {
    id: 'asset',
    label: 'Consultando ativos',
    verb: 'Consultando ativos',
    icon: 'i-lucide-search',
    inline: true,
  },
  dividend: {
    id: 'dividend',
    label: 'Verificando dividendos',
    verb: 'Verificando dividendos',
    icon: 'i-lucide-coins',
    inline: true,
  },
  news: {
    id: 'news',
    label: 'Buscando notícias',
    verb: 'Buscando notícias',
    icon: 'i-lucide-newspaper',
    inline: true,
  },
  web: {
    id: 'web',
    label: 'Pesquisando na web',
    verb: 'Pesquisando na web',
    icon: 'i-lucide-globe',
    inline: true,
  },
  calc: {
    id: 'calc',
    label: 'Calculando',
    verb: 'Calculando',
    icon: 'i-lucide-calculator',
    inline: true,
  },
  tesouro: {
    id: 'tesouro',
    label: 'Tesouro Direto',
    verb: 'Consultando Tesouro',
    icon: 'i-lucide-landmark',
    inline: true,
  },
  memory: {
    id: 'memory',
    label: 'Memória',
    verb: 'Consultando memória',
    icon: 'i-lucide-brain',
    inline: true,
  },
  macro: {
    id: 'macro',
    label: 'Macroeconomia',
    verb: 'Lendo macroeconomia',
    icon: 'i-lucide-trending-up',
    inline: true,
  },
  validation: {
    id: 'validation',
    label: 'Validando dados',
    verb: 'Validando dados',
    icon: 'i-lucide-shield-check',
    inline: true,
  },
  portfolio: {
    id: 'portfolio',
    label: 'Análise de carteira',
    verb: 'Analisando carteira',
    icon: 'i-lucide-pie-chart',
    inline: true,
  },
  watch: {
    id: 'watch',
    label: 'Watchlist',
    verb: 'Atualizando watchlist',
    icon: 'i-lucide-eye',
    inline: true,
  },

  // ---- "inline:false" — these tools have their own dedicated visual
  // surface (DecisionCard, ScenarioCard, GoalBadge, InlineForm,
  // ArtifactCard, PreExecuteCard). The ThinkingIndicator can still
  // describe them while running, but ActionGroupList filters them
  // out so they don't double-render.
  goal: {
    id: 'goal',
    label: 'Meta',
    verb: 'Trabalhando na meta',
    icon: 'i-lucide-target',
    inline: false,
  },
  decision: {
    id: 'decision',
    label: 'Decisão',
    verb: 'Registrando decisão',
    icon: 'i-lucide-check-square',
    inline: false,
  },
  scenario: {
    id: 'scenario',
    label: 'Simulação',
    verb: 'Simulando cenário',
    icon: 'i-lucide-flask-conical',
    inline: false,
  },
  preexec: {
    id: 'preexec',
    label: 'Pré-execução',
    verb: 'Preparando execução',
    icon: 'i-lucide-shield-check',
    inline: false,
  },
  form: {
    id: 'form',
    label: 'Formulário',
    verb: 'Montando formulário',
    icon: 'i-lucide-form-input',
    inline: false,
  },
  spreadsheet: {
    id: 'spreadsheet',
    label: 'Planilha',
    verb: 'Gerando planilha',
    icon: 'i-lucide-file-spreadsheet',
    inline: false,
  },
}

const TOOL_TO_FAMILY: Record<string, string> = {
  // assets
  view_asset: 'asset',
  historical_prices: 'asset',
  compare_assets: 'asset',
  technical_analysis: 'asset',

  // dividends
  dividend_history: 'dividend',
  dividend_calendar: 'dividend',

  // news + web
  search_news: 'news',
  market_news: 'news',
  news_summary: 'news',
  web_search: 'web',

  // calculators
  calculate_compound_interest: 'calc',
  calculate_planning: 'calc',
  calculate_stock_return: 'calc',
  calculate_tesouro_return: 'calc',
  calculate_taxa_equivalente: 'calc',
  calculate_rentabilidade_real: 'calc',

  // tesouro
  list_tesouros: 'tesouro',

  // memory
  save_memory: 'memory',
  list_memories: 'memory',
  forget_memory: 'memory',

  // macro / validation
  macro_snapshot: 'macro',
  verify_asset_composition: 'validation',
  validate_goal: 'validation',

  // portfolio math
  portfolio_expected_return: 'portfolio',

  // watchlist (chat-side + legacy)
  set_watch: 'watch',
  remove_watch: 'watch',
  list_watches: 'watch',
  add_to_watchlist: 'watch',
  view_watchlist: 'watch',
  set_price_alert: 'watch',

  // dedicated surfaces
  define_goal: 'goal',
  recalculate_goal: 'goal',
  register_decision: 'decision',
  simulate_scenario: 'scenario',
  start_pre_execution_check: 'preexec',
  confirm_execution: 'preexec',
  ask_form: 'form',
  generate_spreadsheet: 'spreadsheet',
}

const FALLBACK_FAMILY: ToolFamily = {
  id: 'other',
  label: 'Outras tools',
  verb: 'Executando',
  icon: 'i-lucide-circle-dashed',
  inline: true,
}

export function useToolFamilies() {
  function familyForTool(name: string | null | undefined): ToolFamily {
    if (!name) return FALLBACK_FAMILY
    const familyId = TOOL_TO_FAMILY[name]
    if (!familyId) return FALLBACK_FAMILY
    return FAMILIES[familyId] ?? FALLBACK_FAMILY
  }

  function isInlineFamily(name: string | null | undefined): boolean {
    return familyForTool(name).inline
  }

  return { familyForTool, isInlineFamily }
}
