<script setup lang="ts">
/**
 * ActionProposalChip — pílula INLINE confirmável (replacement do
 * ActionProposalCard, que era um cartão block-level).
 *
 * Visual: `[bell] Ativar Watchlist` — pequenininho, encaixa direto na
 * prose como se fosse um TickerChip. Click abre UPopover com a
 * descrição + Confirmar / Pular. Após o clique, o chip vira um chip
 * estático "Ativada" / "Pulado" (mesmo formato, sem popover).
 *
 * Mounted dinamicamente pelo useProposalProse a cada `{{propose}}`
 * marker que o modelo escrever na prosa.
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
      class="proposal-chip inline-flex items-center gap-1 rounded-full border align-middle whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <UIcon :name="aff.icon" class="proposal-chip-icon" />
      <span class="proposal-chip-label">{{ aff.cta }}</span>
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
    class="proposal-chip proposal-chip--static inline-flex items-center gap-1 rounded-full border align-middle whitespace-nowrap"
    :class="isConfirmed ? 'proposal-chip--confirmed' : 'proposal-chip--skipped'"
  >
    <UIcon
      :name="isConfirmed ? 'i-heroicons-check-circle-20-solid' : 'i-heroicons-x-mark-20-solid'"
      class="proposal-chip-icon"
    />
    <span class="proposal-chip-label">{{ isConfirmed ? 'Ativada' : 'Pulado' }}</span>
  </span>
</template>

<style scoped>
.proposal-chip {
  font-size: 12px;
  line-height: 1;
  padding: 3px 8px 3px 6px;
  background-color: color-mix(in srgb, var(--ui-bg-elevated) 50%, transparent);
  border-color: var(--ui-border);
  color: var(--ui-text);
  transition: background-color 120ms, border-color 120ms;
  vertical-align: baseline;
}

.proposal-chip:hover:not(.proposal-chip--static) {
  background-color: color-mix(in srgb, var(--ui-bg-elevated) 90%, transparent);
  border-color: color-mix(in srgb, var(--ui-primary) 50%, var(--ui-border));
}

.proposal-chip-icon {
  width: 12px;
  height: 12px;
  color: var(--ui-primary);
  flex: none;
}

.proposal-chip-label {
  font-weight: 500;
}

.proposal-chip--confirmed {
  background-color: color-mix(in srgb, var(--ui-success) 12%, transparent);
  color: color-mix(in srgb, var(--ui-success) 80%, var(--ui-text));
  border-color: color-mix(in srgb, var(--ui-success) 35%, var(--ui-border));
}

.proposal-chip--confirmed .proposal-chip-icon {
  color: var(--ui-success);
}

.proposal-chip--skipped {
  background-color: color-mix(in srgb, var(--ui-bg-elevated) 50%, transparent);
  color: var(--ui-text-muted);
  opacity: 0.75;
}

.proposal-chip--skipped .proposal-chip-icon {
  color: var(--ui-text-muted);
}
</style>
