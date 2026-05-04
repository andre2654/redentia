<script setup lang="ts">
/**
 * Conteudo editorial do ativo (description, tese, peers, historico, FAQ).
 * Renderizado abaixo da fold em /asset/{ticker} pra escalar de ~1.000
 * pra ~3.500 palavras unicas por ticker. Resolve o problema de
 * "Cópia sem canônica" / "Rastreada mas não indexada" reportado no
 * Google Search Console — pages com conteudo quase identico entre
 * ativos eram desclassificadas.
 *
 * Dados vem de GET /api/assets/{ticker}/editorial. Quando ticker nao
 * tem editorial ainda (404), o componente nao monta — fallback fica
 * com o conteudo legado da page (FAQ generica + commentaries).
 */

interface FaqItem {
  question: string
  answer: string
}

interface Editorial {
  ticker: string
  description: string | null
  thesis_pros: string | null
  thesis_cons: string | null
  peers_comparison: string | null
  history_summary: string | null
  faq_extended: FaqItem[] | null
}

const props = defineProps<{
  editorial: Editorial
  tickerUpper: string
  assetName: string
}>()

const brand = useBrand()

// Quebra texto em paragrafos por \n\n. Texto puro, zero risco de XSS.
function paragraphs(raw: string | null): string[] {
  if (!raw) return []
  return raw
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

const sections = computed(() => [
  {
    key: 'description',
    eyebrow: 'Sobre a empresa',
    heading: `Quem é ${props.assetName}`,
    body: paragraphs(props.editorial.description),
  },
  {
    key: 'thesis_pros',
    eyebrow: 'Tese de investimento',
    heading: `Por que considerar ${props.tickerUpper}`,
    body: paragraphs(props.editorial.thesis_pros),
  },
  {
    key: 'thesis_cons',
    eyebrow: 'Riscos',
    heading: `O que pode dar errado em ${props.tickerUpper}`,
    body: paragraphs(props.editorial.thesis_cons),
  },
  {
    key: 'peers_comparison',
    eyebrow: 'Comparação',
    heading: `Como ${props.tickerUpper} se compara`,
    body: paragraphs(props.editorial.peers_comparison),
  },
  {
    key: 'history_summary',
    eyebrow: 'Histórico',
    heading: `A trajetória de ${props.assetName}`,
    body: paragraphs(props.editorial.history_summary),
  },
].filter((s) => s.body.length > 0))

const faqs = computed(() => props.editorial.faq_extended ?? [])
</script>

<template>
  <article class="asset-editorial mt-16 flex flex-col gap-16">
    <section
      v-for="section in sections"
      :key="section.key"
      class="flex flex-col gap-5 border-t pt-12"
      :style="{ borderColor: brand.colors.border }"
    >
      <header class="flex flex-col gap-2">
        <span
          class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
          :style="{ color: brand.colors.primary }"
        >{{ section.eyebrow }}</span>
        <h2
          class="font-light"
          :style="{
            color: brand.colors.text,
            fontSize: 'clamp(24px, 3.2vw, 34px)',
            lineHeight: 1.15,
            letterSpacing: '-0.4px',
          }"
        >{{ section.heading }}</h2>
      </header>

      <div class="flex flex-col gap-4">
        <p
          v-for="(p, idx) in section.body"
          :key="idx"
          class="text-[15.5px] leading-[1.65]"
          :style="{ color: `color-mix(in srgb, ${brand.colors.text} 78%, transparent)` }"
        >{{ p }}</p>
      </div>
    </section>

    <section
      v-if="faqs.length"
      class="flex flex-col gap-5 border-t pt-12"
      :style="{ borderColor: brand.colors.border }"
    >
      <header class="flex flex-col gap-2">
        <span
          class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
          :style="{ color: brand.colors.primary }"
        >Perguntas frequentes</span>
        <h2
          class="font-light"
          :style="{
            color: brand.colors.text,
            fontSize: 'clamp(24px, 3.2vw, 34px)',
            lineHeight: 1.15,
            letterSpacing: '-0.4px',
          }"
        >Dúvidas sobre {{ tickerUpper }}</h2>
      </header>

      <div class="flex flex-col">
        <details
          v-for="(faq, idx) in faqs"
          :key="idx"
          class="group border-t py-5 first:border-t-0"
          :style="{ borderColor: brand.colors.border }"
        >
          <summary
            class="flex cursor-pointer items-center justify-between gap-4 text-base font-medium leading-snug transition-colors hover:opacity-80"
            :style="{ color: brand.colors.text }"
          >
            <span>{{ faq.question }}</span>
            <UIcon
              name="i-lucide-plus"
              class="size-4 shrink-0 transition-transform group-open:rotate-45"
              :style="{ color: brand.colors.primary }"
            />
          </summary>
          <p
            class="mt-4 text-[15px] leading-[1.65]"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 78%, transparent)` }"
          >{{ faq.answer }}</p>
        </details>
      </div>
    </section>
  </article>
</template>

<style scoped>
.asset-editorial summary::-webkit-details-marker {
  display: none;
}
.asset-editorial summary {
  list-style: none;
}
</style>
