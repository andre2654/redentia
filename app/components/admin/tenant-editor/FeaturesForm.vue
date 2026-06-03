<template>
  <div class="features-form">
    <p class="features-form__hint">
      <UIcon name="i-lucide-info" class="size-3.5" />
      Liga/desliga produtos individuais. Toggles afetam header, sidebar, mobile menu e bloqueiam acesso direto via URL.
    </p>

    <div
      v-for="cat in CATEGORIES"
      :key="cat.id"
      class="features-form__group"
    >
      <div class="features-form__group-head">
        <h3 class="features-form__group-title">
          <UIcon :name="cat.icon" class="size-3.5" />
          {{ cat.label }}
        </h3>
        <p v-if="cat.hint" class="features-form__group-hint">{{ cat.hint }}</p>
      </div>

      <!-- Master toggle (se a categoria tem) -->
      <label
        v-if="cat.master"
        class="features-form__row features-form__row--master"
        :class="{ 'features-form__row--on': isMasterOn(cat.master) }"
      >
        <input
          type="checkbox"
          :checked="isMasterOn(cat.master)"
          @change="onMasterToggle(cat, ($event.target as HTMLInputElement).checked)"
        />
        <span class="features-form__row-label">
          <strong>{{ cat.master.label }}</strong>
          <span class="features-form__row-hint">{{ cat.master.hint }}</span>
        </span>
      </label>

      <!-- Itens individuais (so renderiza se master estiver ON pra categorias que tem master) -->
      <div
        v-if="!cat.master || isMasterOn(cat.master)"
        class="features-form__grid"
      >
        <label
          v-for="def in cat.items"
          :key="def.key"
          class="features-form__row"
        >
          <input
            type="checkbox"
            :checked="!!features?.[def.key]"
            @change="onChange(def.key, ($event.target as HTMLInputElement).checked)"
          />
          <span class="features-form__row-label">
            <strong>{{ def.label }}</strong>
            <span v-if="def.hint" class="features-form__row-hint">{{ def.hint }}</span>
          </span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  features: Record<string, unknown> | undefined
}>()

const emit = defineEmits<{
  (e: 'change', path: string, value: boolean): void
}>()

interface FeatureDef { key: string; label: string; hint?: string }
interface CategoryDef {
  id: string
  label: string
  icon: string
  hint?: string
  /** Master toggle: liga/desliga categoria inteira. Quando OFF, todos `children` sao OFF. */
  master?: { key: string; label: string; hint: string; children: string[] }
  items: FeatureDef[]
}

const CATEGORIES: CategoryDef[] = [
  {
    id: 'rankings',
    label: 'Rankings',
    icon: 'i-lucide-trophy',
    hint: 'Listagens de melhores ações, FIIs, dividendos.',
    master: {
      key: 'showRankings',
      label: 'Habilitar Rankings',
      hint: 'Liga seção /ranking, links no header, sidebar e mobile menu. Desligar esconde tudo de rankings.',
      children: ['showDividendYieldRanking', 'showMonthlyMoversRanking'],
    },
    items: [
      { key: 'showDividendYieldRanking', label: 'DY ranking', hint: 'Maiores dividend yield' },
      { key: 'showMonthlyMoversRanking', label: 'Monthly movers', hint: 'Maiores altas/baixas do mês' },
    ],
  },
  {
    id: 'calculators',
    label: 'Calculadoras',
    icon: 'i-lucide-calculator',
    hint: 'Juros compostos, dividend yield, preço teto, IR, aposentadoria.',
    master: {
      key: 'showCalculators',
      label: 'Habilitar Calculadoras',
      hint: 'Liga rota /calculadora + sub-páginas, link no header e sidebar.',
      children: [],
    },
    items: [],
  },
  {
    id: 'content',
    label: 'Conteúdo educacional',
    icon: 'i-lucide-book-open',
    items: [
      { key: 'showGuides', label: 'Guias', hint: 'Página /guias' },
      { key: 'showGlossary', label: 'Glossário', hint: 'Página /glossario' },
      { key: 'showMarketCommentaries', label: 'AI commentaries', hint: 'Comentários no /asset' },
    ],
  },
  {
    id: 'ai',
    label: 'IA + análise',
    icon: 'i-lucide-sparkles',
    items: [
      { key: 'showAIAdvisor', label: 'AI Advisor', hint: 'Chat /help' },
      { key: 'showSectorComparatives', label: 'Comparativos de setor' },
    ],
  },
  {
    id: 'dividends',
    label: 'Dividendos',
    icon: 'i-lucide-coins',
    items: [
      { key: 'showDividends', label: 'Dividendos (cards + indicadores)' },
      { key: 'showDividendCalendar', label: 'Calendário de dividendos' },
    ],
  },
  {
    id: 'app',
    label: 'App / PWA',
    icon: 'i-lucide-smartphone',
    hint: 'Habilita pagina /download + icones App Store / Google Play no footer.',
    master: {
      key: 'showApp',
      label: 'Habilitar app PWA',
      hint: 'Liga rota /download (instrucao de instalacao) + icones App Store / Google Play no footer. Tudo num toggle so.',
      // Children sao os flags legacy — quando admin liga o master,
      // ambos sao setados true. Quando desliga, ambos viram false.
      children: ['showAppStoreLinks', 'showDownloadPage'],
    },
    items: [],
  },
  {
    id: 'brand',
    label: 'Marca / branding',
    icon: 'i-lucide-image',
    items: [
      { key: 'showFounderPhoto', label: 'Foto do founder', hint: 'Hero/about' },
      { key: 'showEcosystemLinks', label: 'Ecosystem links', hint: 'Outros produtos do tenant' },
    ],
  },
]

/**
 * Master toggle ON quando: o flag master e true OU qualquer dos
 * children granulares e true. Backward-compat com configs antigas
 * que so tem os granulares.
 */
function isMasterOn(master: { key: string; children: string[] }): boolean {
  const f = props.features ?? {}
  if (f[master.key] === true) return true
  if (master.children.some((c) => f[c] === true)) return true
  // Default-on: pra calculadoras/guias, undefined vira true
  if (f[master.key] === undefined && master.children.length === 0) return true
  return false
}

function onMasterToggle(cat: CategoryDef, enabled: boolean) {
  if (!cat.master) return
  // Master flag flip
  emit('change', `features.${cat.master.key}`, enabled)
  // Quando desliga, propaga off pros children granulares (pra evitar
  // confusao "master=off mas granular=on"). Quando liga, deixa cada
  // granular como o admin escolher (default false, depois liga
  // individuais).
  if (!enabled) {
    for (const childKey of cat.master.children) {
      emit('change', `features.${childKey}`, false)
    }
  } else if (cat.master.children.length > 0) {
    // Liga TODOS os granulares por default quando admin liga master
    // (assim master=on visualmente mostra rankings ativos)
    for (const childKey of cat.master.children) {
      emit('change', `features.${childKey}`, true)
    }
  }
}

function onChange(key: string, value: boolean) {
  emit('change', `features.${key}`, value)
}
</script>

<style scoped>
.features-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.features-form__hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

.features-form__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}
.features-form__group:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}
.features-form__group-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.features-form__group-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--brand-text);
}
.features-form__group-hint {
  margin: 0;
  font-size: 11.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.features-form__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px;
  margin-top: 4px;
}

.features-form__row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 8px 10px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.features-form__row:hover {
  border-color: color-mix(in srgb, var(--brand-text) 18%, transparent);
}
.features-form__row input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--brand-primary);
  cursor: pointer;
  margin-top: 2px;
}
.features-form__row-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  color: var(--brand-text);
}
.features-form__row-hint {
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

/* Master toggle row — destaque visual pra diferenciar dos granulares */
.features-form__row--master {
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
}
.features-form__row--master.features-form__row--on {
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 28%, transparent);
}
</style>
