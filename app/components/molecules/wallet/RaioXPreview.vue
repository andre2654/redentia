<!--
  RaioXPreview — 3-column teaser for the deeper /wallet/raio-x surface.

  Now reads from two sources:
    1. The saved AI analysis (`analysis` prop) — preferred when present.
    2. Fallback `strengths`/`risks`/`recommendations` arrays computed
       client-side by `usePortfolioScore`.

  When `analysis` is supplied we slice top-3 strengths/risks and top-2
  recommendations directly from the snapshot. The "Última análise: DD MMM"
  line under the CTA helps the user see how fresh the read is.
-->
<template>
  <section class="flex flex-col gap-5">
    <div class="flex flex-wrap items-baseline justify-between gap-3">
      <SectionHeading
        :brand="brand"
        eyebrow="Raio-X · Análise da carteira"
        title="O que está saudável e o que precisa de atenção"
      />
      <div class="flex flex-col items-end gap-1">
        <NuxtLink
          to="/wallet/raio-x"
          class="inline-flex items-center gap-1.5 font-mono-tab text-[11px] font-medium uppercase"
          :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
        >Ver raio-x completo
          <UIcon name="i-lucide-arrow-right" class="size-3" />
        </NuxtLink>
        <span
          v-if="lastAnalysisLabel"
          class="font-mono-tab text-[10px]"
          :style="{ letterSpacing: '0.06em', color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
        >{{ lastAnalysisLabel }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <article class="flex flex-col gap-3 rounded-xl border p-5" :style="strengthCardStyle">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-circle-check" class="size-4" :style="{ color: brand.colors.positive }" />
          <span class="mock-eyebrow !text-[10.5px]" :style="{ color: brand.colors.positive }">Pontos fortes</span>
        </div>
        <ul v-if="effectiveStrengths.length" class="flex flex-col gap-3">
          <li v-for="s in effectiveStrengths.slice(0, 3)" :key="s.title" class="flex flex-col gap-0.5">
            <span class="text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ s.title }}</span>
            <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ s.body }}</span>
          </li>
        </ul>
        <p v-else class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">Análise em curso.</p>
      </article>

      <article class="flex flex-col gap-3 rounded-xl border p-5" :style="warnCardStyle">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-alert-triangle" class="size-4" :style="{ color: warnColor }" />
          <span class="mock-eyebrow !text-[10.5px]" :style="{ color: warnColor }">Riscos</span>
        </div>
        <ul v-if="effectiveRisks.length" class="flex flex-col gap-3">
          <li v-for="r in effectiveRisks.slice(0, 3)" :key="r.title" class="flex flex-col gap-0.5">
            <span class="text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ r.title }}</span>
            <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ r.body }}</span>
          </li>
        </ul>
        <p v-else class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">Sem riscos detectados.</p>
      </article>

      <article class="flex flex-col gap-3 rounded-xl border p-5" :style="cardStyle">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-sparkles" class="size-4" :style="{ color: brand.colors.primary }" />
          <span class="mock-eyebrow !text-[10.5px]" :style="{ color: brand.colors.primary }">Recomendações</span>
        </div>
        <ul v-if="effectiveRecommendations.length" class="flex flex-col gap-3">
          <li v-for="r in effectiveRecommendations.slice(0, 2)" :key="r.title" class="flex flex-col gap-0.5">
            <span class="text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ r.title }}</span>
            <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ r.body }}</span>
          </li>
        </ul>
        <p v-else class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">Aguardando análise.</p>
        <NuxtLink
          :to="analysis ? '/help?intent=reanalyze-portfolio' : '/help?intent=analyze-portfolio'"
          class="mt-1 inline-flex items-center gap-1 self-start font-mono-tab text-[11px] font-medium uppercase"
          :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
        >{{ analysis ? 'Reanalisar no chat' : 'Rodar análise' }}
          <UIcon name="i-lucide-arrow-up-right" class="size-3" />
        </NuxtLink>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PortfolioAnalysis } from '~/services/walletData'

interface BulletItem {
  title: string
  body: string
}
interface Props {
  strengths: BulletItem[]
  risks: BulletItem[]
  recommendations: BulletItem[]
  /**
   * Saved AI analysis snapshot. When present, takes precedence over
   * the client-side `strengths`/`risks`/`recommendations` props.
   */
  analysis?: PortfolioAnalysis | null
}
const props = withDefaults(defineProps<Props>(), {
  analysis: null,
})

const brand = useBrand()

const warnColor = computed(() => (brand.colors as { warning?: string }).warning || '#f59e0b')

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))
const strengthCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.positive} 5%, ${brand.colors.surface})`,
  borderColor: `color-mix(in srgb, ${brand.colors.positive} 22%, transparent)`,
}))
const warnCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${warnColor.value} 5%, ${brand.colors.surface})`,
  borderColor: `color-mix(in srgb, ${warnColor.value} 22%, transparent)`,
}))

// Prefer the snapshot when supplied; fall back to live-computed props.
const effectiveStrengths = computed<BulletItem[]>(() =>
  props.analysis?.strengths?.length
    ? props.analysis.strengths.map((s) => ({ title: s.title, body: s.body }))
    : props.strengths,
)
const effectiveRisks = computed<BulletItem[]>(() =>
  props.analysis?.risks?.length
    ? props.analysis.risks.map((r) => ({ title: r.title, body: r.body }))
    : props.risks,
)
const effectiveRecommendations = computed<BulletItem[]>(() =>
  props.analysis?.recommendations?.length
    ? props.analysis.recommendations.map((r) => ({ title: r.title, body: r.body }))
    : props.recommendations,
)

const lastAnalysisLabel = computed(() => {
  const iso = props.analysis?.generated_at
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
    return `Última análise: ${date}`
  } catch {
    return ''
  }
})
</script>

<style scoped>
.mock-eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}
</style>
