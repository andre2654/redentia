<script setup lang="ts">
/**
 * ActionProposalChip — pílula INLINE confirmável.
 *
 * Visualmente espelhada no TickerChip (default density): mesma altura,
 * mesmo padding, mesma família de cores via `useBrand`, mesmo
 * `top: -1px` pra alinhar na baseline da prose. A diferença é que
 * o leading não é um logo circular de ativo, é um ícone temático
 * (sino pra watchlist, bandeira pra meta, etc.).
 *
 * Click → UPopover com descrição + Confirmar / Pular. Após o clique,
 * vira chip estático "Ativada" / "Pulado".
 */
import { computed } from 'vue'
import type { ChatProposalData, ChatProposalKind } from '~/composables/useChatStream'

const props = defineProps<{
  proposal: ChatProposalData
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'skip'): void
}>()

const brand = useBrand()

type Affordance = {
  icon: string
  cta: string
  finePrint: string
}

const affordanceByKind: Record<ChatProposalKind, Affordance> = {
  set_watch: {
    icon: 'i-heroicons-bell-alert-20-solid',
    cta: 'Ativar Watchlist',
    finePrint: 'Aviso no sino quando a condição disparar.',
  },
  define_goal: {
    icon: 'i-heroicons-flag-20-solid',
    cta: 'Definir meta',
    finePrint: 'Vira âncora das próximas conversas.',
  },
  register_decision: {
    icon: 'i-heroicons-clipboard-document-check-20-solid',
    cta: 'Registrar decisão',
    finePrint: 'Entra no diário com tese + invalidador.',
  },
  simulate_scenario: {
    icon: 'i-heroicons-chart-bar-20-solid',
    cta: 'Simular cenário',
    finePrint: 'Mostra o impacto na meta.',
  },
  generate_spreadsheet: {
    icon: 'i-heroicons-table-cells-20-solid',
    cta: 'Gerar planilha',
    finePrint: 'Arquivo .xlsx pronto pra download.',
  },
  save_memory: {
    icon: 'i-heroicons-bookmark-20-solid',
    cta: 'Salvar na memória',
    finePrint: 'Disponível em todas as conversas futuras.',
  },
}

const isPending = computed(() => props.proposal.state === 'pending')
const isConfirmed = computed(() => props.proposal.state === 'confirmed')
const aff = computed<Affordance>(
  () => affordanceByKind[props.proposal.kind] ?? affordanceByKind.save_memory,
)

// Brand-aware inline styles. Mais destaque que o ticker-chip: tint
// primário no bg + borda primária visível, mas mantendo as mesmas
// dimensões/padding/altura do TickerChip default.
const chipStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 10%, ${brand.colors.surface})`,
  border: `1px solid color-mix(in srgb, ${brand.colors.primary} 35%, transparent)`,
  color: brand.colors.text,
  textDecoration: 'none',
}))

const confirmedStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.positive ?? brand.colors.primary} 14%, transparent)`,
  border: `1px solid color-mix(in srgb, ${brand.colors.positive ?? brand.colors.primary} 35%, transparent)`,
  color: brand.colors.positive ?? brand.colors.primary,
}))

const skippedStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 60%, transparent)`,
  border: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
  color: brand.colors.textMuted,
  opacity: 0.85,
}))

// Mini-circle wrapper around the icon — mesma forma/tamanho do logo
// do TickerChip (20px), pra igualar a altura total do chip e dar
// destaque visual (a "marca" da proposta).
const iconBadgeStyle = computed(() => ({
  width: '20px',
  height: '20px',
  backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 22%, transparent)`,
  boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${brand.colors.primary} 30%, transparent)`,
}))

const iconBadgeStaticStyle = computed(() => ({
  width: '20px',
  height: '20px',
  backgroundColor: `color-mix(in srgb, currentColor 18%, transparent)`,
}))

const iconColor = computed(() => brand.colors.primary)

// ---- Args summary (popover) -----------------------------------
function formatArgsSummary(
  args: Record<string, unknown>,
): Array<{ label: string; value: string }> {
  const out: Array<{ label: string; value: string }> = []
  if (typeof args.ticker === 'string') {
    out.push({ label: 'Ticker', value: args.ticker.toUpperCase() })
  }
  if (Array.isArray(args.conditions)) {
    const conds = (args.conditions as Array<Record<string, unknown>>)
      .map((c) => formatCondition(c))
      .filter(Boolean) as string[]
    if (conds.length > 0) out.push({ label: 'Gatilho', value: conds.join(' · ') })
  }
  if (typeof args.label === 'string') out.push({ label: 'Apelido', value: args.label })
  if (typeof args.note === 'string') out.push({ label: 'Nota', value: args.note })
  if (typeof args.targetAmount === 'number') {
    out.push({
      label: 'Meta',
      value: `R$ ${args.targetAmount.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
    })
  }
  if (typeof args.deadline === 'string') out.push({ label: 'Prazo', value: args.deadline })
  return out
}

function formatCondition(c: Record<string, unknown>): string | null {
  const kind = c.kind as string
  if (kind === 'price_drop_pct') return `Queda de ${c.pct}% em ${c.window ?? '7d'}`
  if (kind === 'price_rise_pct') return `Alta de ${c.pct}% em ${c.window ?? '7d'}`
  if (kind === 'price_below') return `Abaixo de R$ ${c.value}`
  if (kind === 'price_above') return `Acima de R$ ${c.value}`
  if (kind === 'dy_above') {
    const v = Number(c.value) * 100
    return `DY > ${v.toFixed(1)}%`
  }
  if (kind === 'pe_below') return `P/L < ${c.value}`
  if (kind === 'news_material') return `Notícia material`
  return null
}

const argsSummary = computed(() => formatArgsSummary(props.proposal.args))

function onConfirm() {
  if (!isPending.value) return
  emit('confirm')
}

function onSkip() {
  if (!isPending.value) return
  emit('skip')
}
</script>

<template>
  <UPopover v-if="isPending" mode="click">
    <button
      type="button"
      class="proposal-chip proposal-chip--accent group inline-flex shrink-0 items-center align-middle leading-none transition-[background-color,box-shadow,border-color]"
      :style="chipStyle"
    >
      <span
        class="proposal-chip-badge inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full"
        :style="iconBadgeStyle"
        aria-hidden="true"
      >
        <UIcon :name="aff.icon" class="proposal-chip-icon" :style="{ color: iconColor }" />
      </span>
      <span class="proposal-chip-label font-semibold" :style="{ color: 'var(--brand-text)' }">
        {{ aff.cta }}
      </span>
    </button>

    <template #content>
      <div class="p-3 max-w-[280px] space-y-2">
        <p class="text-[13px] font-medium leading-snug text-default">
          {{ proposal.label }}
        </p>
        <p
          v-if="proposal.description"
          class="text-[12px] leading-relaxed text-toned"
        >
          {{ proposal.description }}
        </p>
        <dl
          v-if="argsSummary.length > 0"
          class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px]"
        >
          <template v-for="row in argsSummary" :key="row.label">
            <dt class="text-muted">{{ row.label }}</dt>
            <dd class="text-default font-medium">{{ row.value }}</dd>
          </template>
        </dl>
        <p class="text-[11px] text-muted leading-snug">{{ aff.finePrint }}</p>
        <div class="flex items-center gap-2 pt-1">
          <UButton color="primary" size="xs" :icon="aff.icon" @click="onConfirm">
            Confirmar
          </UButton>
          <UButton color="neutral" variant="ghost" size="xs" @click="onSkip">
            Pular
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>

  <span
    v-else
    class="proposal-chip proposal-chip--static inline-flex shrink-0 items-center align-middle leading-none"
    :style="isConfirmed ? confirmedStyle : skippedStyle"
  >
    <span
      class="proposal-chip-badge inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      :style="iconBadgeStaticStyle"
      aria-hidden="true"
    >
      <UIcon
        :name="isConfirmed ? 'i-heroicons-check-circle-20-solid' : 'i-heroicons-x-mark-20-solid'"
        class="proposal-chip-icon"
      />
    </span>
    <span class="proposal-chip-label font-semibold">
      {{ isConfirmed ? 'Ativada' : 'Pulado' }}
    </span>
  </span>
</template>

<style scoped>
/* Espelha o ticker-chip default density: mesma altura, mesmo padding,
   mesmo gap, mesmo font-size. O badge circular do ícone (20px) fica
   flush à esquerda igual a logo do TickerChip — daí o padding-left
   é só 2px. */
.proposal-chip {
  border-radius: 9999px;
  white-space: nowrap;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  padding: 2px 10px 2px 2px;
  gap: 6px;
  font-size: 12px;
  cursor: pointer;
  background: transparent;
  position: relative;
  top: -1px;
}

.proposal-chip--static {
  cursor: default;
}

.proposal-chip-label {
  font-size: 12px;
}

/* Ícone dentro do badge circular — tamanho parecido com a inicial da
   logo do TickerChip (~13px num círculo de 20px). */
.proposal-chip-icon {
  width: 13px;
  height: 13px;
  flex: none;
}

.proposal-chip--accent:hover {
  background-color: color-mix(in srgb, var(--brand-primary, #f5a300) 18%, transparent) !important;
  border-color: color-mix(in srgb, var(--brand-primary, #f5a300) 55%, transparent) !important;
  box-shadow: 0 1px 0 0 color-mix(in srgb, var(--brand-primary, #f5a300) 25%, transparent),
    0 0 0 3px color-mix(in srgb, var(--brand-primary, #f5a300) 12%, transparent);
}

.proposal-chip:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
}
</style>
