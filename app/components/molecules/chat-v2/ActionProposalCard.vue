<script setup lang="ts">
/**
 * ActionProposalCard — pílula confirmável inline emitida pelo evento SSE
 * `action.propose`. O agent NÃO executa a ação (set_watch, define_goal,
 * simulate_scenario, etc.) — apenas oferece o cartãozinho com:
 *
 *   - estado colapsado: pílula compacta com ícone do tipo + label + chevron
 *   - estado expandido: rationale + args resumidos + botões Confirmar / Pular
 *   - estado confirmado/pulado: chip seco que mostra o desfecho (não-clicável)
 *
 * O clique em "Confirmar" emite `confirm` (o page envia `✓ Confirmado:
 * chame <kind> com <args JSON>` ao agent). O clique em "Pular" emite
 * `skip` (envia `✗ Pulei a proposta #<id>`).
 */
import { computed, ref } from 'vue'
import type { ChatProposalData, ChatProposalKind } from '~/composables/useChatStream'

const props = defineProps<{
  proposal: ChatProposalData
}>()

const emit = defineEmits<{
  (e: 'confirm', proposal: ChatProposalData): void
  (e: 'skip', proposal: ChatProposalData): void
}>()

const expanded = ref(false)

const isPending = computed(() => props.proposal.state === 'pending')
const isConfirmed = computed(() => props.proposal.state === 'confirmed')
const isSkipped = computed(() => props.proposal.state === 'skipped')

// ---- Per-kind affordances --------------------------------------
type Affordance = {
  icon: string
  cta: string
  finePrint: string
}

const affordanceByKind: Record<ChatProposalKind, Affordance> = {
  set_watch: {
    icon: 'i-heroicons-bell-alert-20-solid',
    cta: 'Ativar Watchlist',
    finePrint: 'Recebe notificação no sino quando a condição disparar.',
  },
  define_goal: {
    icon: 'i-heroicons-flag-20-solid',
    cta: 'Definir meta',
    finePrint: 'A meta vira âncora das próximas conversas.',
  },
  register_decision: {
    icon: 'i-heroicons-clipboard-document-check-20-solid',
    cta: 'Registrar decisão',
    finePrint: 'Decisão entra no diário com tese + invalidador + revisita.',
  },
  simulate_scenario: {
    icon: 'i-heroicons-chart-bar-20-solid',
    cta: 'Simular cenário',
    finePrint: 'Mostra o impacto na meta lado a lado.',
  },
  generate_spreadsheet: {
    icon: 'i-heroicons-table-cells-20-solid',
    cta: 'Gerar planilha',
    finePrint: 'Arquivo .xlsx pronto pra download em segundos.',
  },
  save_memory: {
    icon: 'i-heroicons-bookmark-20-solid',
    cta: 'Salvar na memória',
    finePrint: 'Fica disponível em todas as conversas futuras.',
  },
}

const affordance = computed<Affordance>(
  () => affordanceByKind[props.proposal.kind] ?? affordanceByKind.save_memory,
)

// ---- Resumo dos args (para a área expandida) -------------------
function formatArgsSummary(args: Record<string, unknown>): Array<{ label: string; value: string }> {
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
  if (typeof args.label === 'string') {
    out.push({ label: 'Apelido', value: args.label })
  }
  if (typeof args.note === 'string') {
    out.push({ label: 'Nota', value: args.note })
  }
  if (typeof args.kind === 'string' && typeof args.value === 'string') {
    out.push({ label: 'Item', value: `${args.kind}: ${args.value}` })
  }
  if (typeof args.targetAmount === 'number') {
    out.push({
      label: 'Meta',
      value: `R$ ${args.targetAmount.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
    })
  }
  if (typeof args.deadline === 'string') {
    out.push({ label: 'Prazo', value: args.deadline })
  }
  return out
}

function formatCondition(c: Record<string, unknown>): string | null {
  const kind = c.kind as string
  if (kind === 'price_drop_pct') return `Queda de ${c.pct}% em ${c.window ?? '7d'}`
  if (kind === 'price_rise_pct') return `Alta de ${c.pct}% em ${c.window ?? '7d'}`
  if (kind === 'price_below') return `Preço abaixo de R$ ${c.value}`
  if (kind === 'price_above') return `Preço acima de R$ ${c.value}`
  if (kind === 'dy_above') {
    const v = Number(c.value) * 100
    return `DY acima de ${v.toFixed(1)}%`
  }
  if (kind === 'pe_below') return `P/L abaixo de ${c.value}`
  if (kind === 'news_material') return `Notícia material${c.severity ? ` (${c.severity})` : ''}`
  return null
}

const argsSummary = computed(() => formatArgsSummary(props.proposal.args))

// ---- Handlers --------------------------------------------------
function onConfirm() {
  if (!isPending.value) return
  emit('confirm', props.proposal)
}

function onSkip() {
  if (!isPending.value) return
  emit('skip', props.proposal)
}

function toggleExpand() {
  if (!isPending.value) return
  expanded.value = !expanded.value
}
</script>

<template>
  <div class="my-3">
    <!-- Estado pendente: pílula compacta + área expansível -->
    <div
      v-if="isPending"
      class="rounded-2xl border border-default bg-elevated/50 overflow-hidden transition-colors hover:border-accented"
    >
      <button
        type="button"
        class="w-full flex items-center gap-3 px-3.5 py-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        :aria-expanded="expanded"
        @click="toggleExpand"
      >
        <span
          class="flex-none w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center"
        >
          <UIcon :name="affordance.icon" class="w-4 h-4" />
        </span>
        <span class="flex-1 min-w-0">
          <span class="block text-[11px] font-medium uppercase tracking-wide text-muted leading-none mb-0.5">
            {{ affordance.cta }}
          </span>
          <span class="block text-sm text-default font-medium truncate">
            {{ proposal.label }}
          </span>
        </span>
        <UIcon
          name="i-heroicons-chevron-down-20-solid"
          class="flex-none w-4 h-4 text-muted transition-transform"
          :class="expanded && 'rotate-180'"
        />
      </button>

      <div
        v-if="expanded"
        class="border-t border-default px-3.5 pt-3 pb-3 space-y-3 bg-default"
      >
        <p
          v-if="proposal.description"
          class="text-[13px] leading-relaxed text-toned"
        >
          {{ proposal.description }}
        </p>

        <dl
          v-if="argsSummary.length > 0"
          class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[12px]"
        >
          <template v-for="row in argsSummary" :key="row.label">
            <dt class="text-muted">{{ row.label }}</dt>
            <dd class="text-default font-medium">{{ row.value }}</dd>
          </template>
        </dl>

        <p class="text-[11px] text-muted leading-snug">{{ affordance.finePrint }}</p>

        <div class="flex items-center gap-2 pt-1">
          <UButton
            color="primary"
            size="xs"
            :icon="affordance.icon"
            @click.stop="onConfirm"
          >
            Confirmar
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            @click.stop="onSkip"
          >
            Pular
          </UButton>
        </div>
      </div>
    </div>

    <!-- Estado confirmado / pulado: chip seco, sem interação -->
    <div
      v-else
      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-default text-[12px]"
      :class="isConfirmed ? 'bg-success/10 text-success border-success/30' : 'bg-elevated/50 text-muted'"
    >
      <UIcon
        :name="isConfirmed ? 'i-heroicons-check-circle-20-solid' : 'i-heroicons-x-mark-20-solid'"
        class="w-3.5 h-3.5"
      />
      <span v-if="isConfirmed">{{ affordance.cta }} confirmada</span>
      <span v-else>Proposta pulada</span>
      <span v-if="isSkipped" class="text-muted">·</span>
      <span v-if="isSkipped" class="truncate max-w-[260px]">{{ proposal.label }}</span>
    </div>
  </div>
</template>
