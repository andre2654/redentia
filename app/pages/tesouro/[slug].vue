<template>
  <div
    class="min-h-screen"
    :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
  >
    <!-- Terminal status line -->
    <div
      class="border-b"
      :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
    >
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <span class="font-mono-tab text-[10px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
          [TESOURO.TITLE]
        </span>
        <span class="font-mono-tab text-[10px] uppercase tracking-[0.14em]" :style="{ color: brand.colors.textMuted }">
          &gt; TÍTULO PÚBLICO · RENDA FIXA
        </span>
      </div>
    </div>

    <main class="mx-auto max-w-6xl px-6 py-8">
      <!-- Hero -->
      <section class="flex flex-col gap-3 border-b pb-8" :style="{ borderColor: brand.colors.border }">
        <div class="flex items-center gap-3">
          <span
            class="font-mono-tab text-[10px] uppercase tracking-[0.22em] px-2 py-0.5"
            :style="{
              color: indexerColor,
              border: `1px solid ${indexerColor}40`,
            }"
          >
            {{ indexerLabel }}
          </span>
          <span class="font-mono-tab text-[11px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">
            VENC · {{ formatMaturityLong(data?.maturity_date) }}
          </span>
        </div>

        <h1 class="text-3xl font-bold leading-tight md:text-4xl" :style="{ color: brand.colors.text }">
          {{ data?.name ?? slug }}
        </h1>

        <div class="flex flex-wrap items-center gap-6 pt-2">
          <div class="flex flex-col">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
              TAXA BRUTA
            </span>
            <span class="font-mono-tab text-3xl font-bold tabular-nums md:text-4xl" :style="{ color: brand.colors.primary }">
              {{ data?.rate ? `${data.rate}%` : '—' }}
            </span>
          </div>
          <div v-if="data?.maturity_date" class="flex flex-col">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
              PRAZO RESTANTE
            </span>
            <span class="font-mono-tab text-2xl font-bold tabular-nums" :style="{ color: brand.colors.text }">
              {{ yearsToMaturity }}
            </span>
          </div>
          <div v-if="data?.reference_rate !== null" class="flex flex-col">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
              {{ data?.reference_rate_label?.toUpperCase() ?? 'TAXA REFERÊNCIA' }}
            </span>
            <span class="font-mono-tab text-2xl font-bold tabular-nums" :style="{ color: brand.colors.text }">
              {{ data?.reference_rate?.toFixed(2) }}%
            </span>
          </div>
        </div>
      </section>

      <!-- Price register -->
      <section class="py-8">
        <header class="mb-4 flex flex-col gap-1">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
            [PRICES.TODAY]
          </span>
          <h2 class="text-lg font-semibold md:text-xl" :style="{ color: brand.colors.text }">
            Preços do Tesouro Nacional
          </h2>
          <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
            &gt; REFERÊNCIA · {{ refreshedLabel }}
          </p>
        </header>

        <div
          class="grid grid-cols-1 gap-px border md:grid-cols-2"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
        >
          <div class="flex flex-col gap-2 px-6 py-5" :style="{ backgroundColor: brand.colors.surface }">
            <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
              [01]
            </span>
            <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
              COMPRA
            </span>
            <span class="font-mono-tab text-3xl font-bold tabular-nums" :style="{ color: brand.colors.positive }">
              {{ formatMoney(data?.price_buy) }}
            </span>
          </div>
          <div class="flex flex-col gap-2 px-6 py-5" :style="{ backgroundColor: brand.colors.surface }">
            <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
              [02]
            </span>
            <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
              VENDA
            </span>
            <span class="font-mono-tab text-3xl font-bold tabular-nums" :style="{ color: brand.colors.text }">
              {{ formatMoney(data?.price_sell) }}
            </span>
          </div>
        </div>
      </section>

      <!-- Interpretation -->
      <section v-if="interpretations.length" class="border-t py-8" :style="{ borderColor: brand.colors.border }">
        <header class="mb-4 flex items-center gap-2">
          <IconAi class="h-3 w-3" :style="{ fill: brand.colors.primary }" />
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
            [AI.INTERPRETATION]
          </span>
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
            &gt; LEITURA DO TÍTULO
          </span>
        </header>
        <div class="flex flex-col gap-px border" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }">
          <div
            v-for="(line, idx) in interpretations"
            :key="idx"
            class="flex items-start gap-3 px-5 py-3"
            :style="{ backgroundColor: brand.colors.surface }"
          >
            <span
              class="font-mono-tab text-[9px] uppercase tracking-[0.18em] shrink-0 mt-[3px]"
              :style="{ color: brand.colors.primary }"
            >
              [{{ String(idx + 1).padStart(2, '0') }}]
            </span>
            <p class="text-sm leading-relaxed" :style="{ color: brand.colors.text }" v-html="line" />
          </div>
        </div>
      </section>

      <!-- Back link -->
      <div class="mt-8 flex items-center justify-between border-t pt-6" :style="{ borderColor: brand.colors.border }">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 font-mono-tab text-[11px] uppercase tracking-[0.18em] transition-opacity hover:opacity-75"
          :style="{ color: brand.colors.textMuted }"
        >
          <UIcon name="i-lucide-arrow-left" class="h-3 w-3" />
          VOLTAR À HOME
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { indexerBadge, useTesouroService } from '~/services/tesouro'

const route = useRoute()
const brand = useBrand()
const slug = String(route.params.slug)

const { getTesouro } = useTesouroService()

const { data, error } = await useAsyncData(`tesouro-${slug}`, () => getTesouro(slug))

if (error.value || !data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Título não encontrado',
    fatal: true,
  })
}

useHead(() => ({
  title: `${data.value?.name ?? slug} · Tesouro Direto | Redentia`,
  meta: [
    {
      name: 'description',
      content: data.value
        ? `Cotação, taxa e vencimento do ${data.value.name}. ${data.value.rate ?? ''}. Preço compra R$ ${data.value.price_buy?.toFixed(2) ?? '—'}.`
        : '',
    },
  ],
}))

const indexerLabel = computed(() => indexerBadge(data.value?.indexer ?? null))

const indexerColor = computed(() => {
  const b = indexerLabel.value
  if (b === 'IPCA+') return brand.colors.primary
  if (b === 'SELIC') return brand.colors.positive
  if (b === 'PRÉ') return brand.colors.text
  return brand.colors.textMuted
})

const yearsToMaturity = computed(() => {
  if (!data.value?.maturity_date) return '—'
  const mat = new Date(data.value.maturity_date)
  const now = new Date()
  const months = (mat.getFullYear() - now.getFullYear()) * 12 + (mat.getMonth() - now.getMonth())
  if (months < 0) return 'Vencido'
  if (months < 12) return `${months} meses`
  const years = Math.floor(months / 12)
  const remMonths = months % 12
  return remMonths === 0 ? `${years} anos` : `${years}a ${remMonths}m`
})

const refreshedLabel = computed(() => {
  if (!data.value?.refreshed_at) return ''
  try {
    const d = new Date(data.value.refreshed_at)
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase()
  } catch {
    return ''
  }
})

const interpretations = computed<string[]>(() => {
  const d = data.value
  if (!d) return []
  const lines: string[] = []
  const accent = (t: string) => `<strong style="color: ${brand.colors.primary}">${t}</strong>`
  const pos = (t: string) => `<strong style="color: ${brand.colors.positive}">${t}</strong>`

  const rateNum = d.rate_numeric
  const idx = indexerLabel.value

  if (idx === 'IPCA+' && rateNum !== null) {
    lines.push(
      `Este título paga ${accent('IPCA + ' + rateNum.toFixed(2) + '%')} ao ano — garante que o retorno real supere a inflação oficial do Brasil na janela até o vencimento.`,
    )
    if (rateNum >= 7) {
      lines.push(`Taxa real de ${pos(rateNum.toFixed(2) + '%')} está ${pos('acima da média histórica')} (~6%) — momento favorável pra travar retorno real alto.`)
    }
  } else if (idx === 'PRÉ' && rateNum !== null) {
    lines.push(
      `Taxa prefixada de ${accent(rateNum.toFixed(2) + '%')} ao ano — você sabe hoje exatamente quanto receberá no vencimento, mas perde se a inflação subir forte.`,
    )
  } else if (idx === 'SELIC' && rateNum !== null) {
    lines.push(
      `Rentabilidade acompanha a Selic (${d.reference_rate?.toFixed(2) ?? '—'}%) ${rateNum !== 0 ? accent(' + ' + rateNum.toFixed(2) + '%') : 'sem spread adicional'} — ideal pra reserva de emergência e investimentos de curto prazo.`,
    )
  }

  if (d.maturity_date) {
    const mat = new Date(d.maturity_date)
    const years = (mat.getFullYear() - new Date().getFullYear())
    if (years >= 20) {
      lines.push(`Vencimento ${accent('longo (' + years + ' anos)')} amplifica ganhos com marcação a mercado caso os juros caiam, mas também magnifica perdas no sentido oposto.`)
    } else if (years >= 10) {
      lines.push(`Vencimento ${accent('médio a longo (' + years + ' anos)')} balanceia travamento de taxa com sensibilidade moderada à marcação a mercado.`)
    } else if (years >= 3) {
      lines.push(`Vencimento ${accent('curto a médio (' + years + ' anos)')} — menor volatilidade de preço e boa opção pra metas de médio prazo.`)
    }
  }

  lines.push(
    `Títulos do Tesouro Direto têm ${pos('garantia do Tesouro Nacional')}, considerada a mais segura do mercado brasileiro. Rentabilidade sujeita a IR regressivo (22.5% a 15%).`,
  )

  return lines
})

function formatMoney(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(v)
}

function formatMaturityLong(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
  } catch {
    return String(iso)
  }
}
</script>
