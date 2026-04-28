<!--
  TrustedBy v2 — adaptado a linguagem editorial moderna do hero v3.

  - Background: mesh gradient amber/rose suave (helper .quiet-mesh--soft)
  - Header: eyebrow + headline mista sans + serif italic + lead manifesto
  - Grid: 6 cards quiet com personalidade colorida (icon tile rotacionando
    accent: amber/positive/primary/rose), descricao curta sob o titulo
  - Footnote: caption sutil mantida (3 dots: dados oficiais, LGPD, gratis)
-->
<template>
  <section class="quiet-section relative overflow-hidden">
    <!-- Mesh gradient suave (ecoa o hero sem dominar a section) -->
    <div class="quiet-mesh quiet-mesh--soft" aria-hidden="true" />

    <div class="relative mx-auto max-w-6xl px-6">
      <!-- Header editorial: eyebrow + headline mista + lead manifesto -->
      <header class="mb-12 max-w-2xl md:mb-16">
        <p class="eyebrow mb-5">Recursos</p>
        <h2 class="headline-editorial mb-5 text-[36px] sm:text-[44px] md:text-[56px]">
          <span class="headline-editorial-sans">Tudo no mesmo</span>
          <em class="headline-editorial-serif" :style="{ color: 'var(--brand-primary)' }">lugar</em><span class="headline-editorial-sans" :style="{ color: 'var(--brand-primary)' }">.</span>
        </h2>
        <p class="text-[16px] leading-relaxed md:text-[18px]" :style="{ color: 'var(--text-body)' }">
          Cotações em tempo real, análises com IA, calculadoras e carteira consolidada. {{ brand.trustBar.text }}.
        </p>
      </header>

      <!-- Feature grid 3-col com cards quiet. Cada card tem accent rotativo
           (amber, positive, rose, primary) pra dar personalidade colorida
           sem virar arco-iris. -->
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="(feat, idx) in features"
          :key="feat.title"
          class="quiet-card group relative overflow-hidden p-6"
        >
          <!-- Glow interno discreto no accent do card, ativa no hover -->
          <div
            class="pointer-events-none absolute -right-12 -top-12 h-[160px] w-[160px] rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            :style="{ background: `radial-gradient(circle, ${feat.accent}, transparent 70%)`, filter: 'blur(40px)' }"
            aria-hidden="true"
          />

          <!-- Icon tile com accent do card -->
          <div
            class="relative mb-5 flex size-11 items-center justify-center rounded-md transition-transform duration-300 group-hover:-translate-y-0.5"
            :style="{
              backgroundColor: `color-mix(in srgb, ${feat.accent} 16%, transparent)`,
              color: feat.accent,
            }"
            aria-hidden="true"
          >
            <UIcon :name="feat.icon" class="size-5" />
          </div>

          <h3 class="relative mb-2 text-[18px] font-medium leading-tight" :style="{ color: 'var(--text-heading)' }">
            {{ feat.title }}
          </h3>
          <p class="relative text-[14px] leading-relaxed" :style="{ color: 'var(--text-body)' }">
            {{ feat.desc }}
          </p>

          <!-- Mini KPI no rodape do card (quando disponivel) -->
          <p
            v-if="feat.kpi"
            class="relative mt-4 inline-flex items-center gap-1.5 text-[12px] font-medium tabular-nums"
            :style="{ color: feat.accent }"
          >
            <span class="size-1 rounded-full" :style="{ backgroundColor: feat.accent }" aria-hidden="true" />
            {{ feat.kpi }}
          </p>
        </li>
      </ul>

      <!-- Footnote sutil: 3 selos de confianca -->
      <p
        v-if="footnoteParts.length"
        class="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px]"
        :style="{ color: 'var(--text-muted)' }"
      >
        <template v-for="(part, i) in footnoteParts" :key="part">
          <span v-if="i > 0" :style="{ color: 'var(--border-default)' }">·</span>
          <span>{{ part }}</span>
        </template>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
const brand = useBrand()

// ----------------------------------------------------------------
// Features: enriquecemos os pilares vindos do brand.trustBar.partners
// com descricoes curtas e KPIs. O array atomico do brand vira nomes;
// aqui adicionamos a "voz editorial" que da contexto.
// Se brand.trustBar.partners mudar de tamanho, defaults preenchem
// o que faltar mantendo grid coerente.
// ----------------------------------------------------------------
const accentPalette = computed(() => [
  'var(--brand-primary)',
  'var(--brand-positive)',
  '#F96BEE',
  'var(--brand-primary)',
  'var(--brand-positive)',
  '#F96BEE',
])

const featureMeta = [
  {
    icon: 'i-lucide-layers',
    desc: 'Ações, FIIs, ETFs, BDRs, criptomoedas e títulos públicos cobertos com profundidade.',
    kpi: 'B3 + cripto',
  },
  {
    icon: 'i-lucide-activity',
    desc: 'Cotações da B3 atualizadas em segundos, sem delay artificial nem cache rancoroso.',
    kpi: 'Latência < 1s',
  },
  {
    icon: 'i-lucide-sparkles',
    desc: 'Pergunte qualquer coisa sobre o mercado e receba resposta com fontes e contexto.',
    kpi: 'IA com citações',
  },
  {
    icon: 'i-lucide-calculator',
    desc: 'Juros compostos, dividend yield, FIRE, IR, preço teto. Tudo num só lugar.',
    kpi: '12+ ferramentas',
  },
  {
    icon: 'i-lucide-wallet',
    desc: 'Acompanhe sua carteira em tempo real e descubra reequilíbrios necessários.',
    kpi: 'Multi-corretora',
  },
  {
    icon: 'i-lucide-bell',
    desc: 'Defina alertas por preço, dividendo ou variação e receba notificação na hora.',
    kpi: 'Push + e-mail',
  },
] as const

type Feature = {
  title: string
  desc: string
  icon: string
  kpi?: string
  accent: string
}

const features = computed<Feature[]>(() => {
  const palette = accentPalette.value
  const partners = brand.trustBar.partners ?? []
  return partners.slice(0, 6).map((title, i) => {
    const meta = featureMeta[i] ?? featureMeta[i % featureMeta.length]
    return {
      title,
      desc: meta.desc,
      icon: meta.icon,
      kpi: meta.kpi,
      accent: palette[i % palette.length],
    }
  })
})

const footnoteParts = computed(() =>
  (brand.trustBar.footnote || '').split(/\s*·\s*/).filter(Boolean)
)
</script>
