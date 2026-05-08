<template>
  <NuxtLayout name="api-portal">
    <div
      class="wl2-root relative min-h-screen overflow-hidden"
      :style="rootStyle"
    >
      <!-- ============================================================
           THIN HEADER, just brand + single CTA
           ============================================================ -->
      <header
        class="sticky top-0 z-40 border-b backdrop-blur-xl"
        :style="{ borderColor: `${C.border}80`, backgroundColor: `${C.background}D0` }"
      >
        <div class="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-6 md:px-10">
          <NuxtLink to="/whitelabel2" class="flex items-center gap-3">
            <BrandLogo variant="icon" class="size-6" />
            <span class="font-mono-tab text-[11px] uppercase tracking-[0.18em]" :style="{ color: C.text }">
              REDENTIA<span :style="{ color: C.primary }">.WHITELABEL</span>
            </span>
          </NuxtLink>
          <div class="flex-1" />
          <a
            href="#pricing"
            class="hidden text-[12px] transition-opacity hover:opacity-70 md:inline-flex"
            :style="{ color: C.textMuted }"
          >
            Investimento
          </a>
          <button
            class="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-medium transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5"
            :style="{
              backgroundColor: C.primary,
              color: C.background,
            }"
            @click="openLeadModal()"
          >
            Falar com o time
          </button>
        </div>
      </header>

      <!-- ============================================================
           HERO, compact one-screen
           ============================================================ -->
      <section class="relative overflow-hidden">
        <div class="pointer-events-none absolute inset-0">
          <div
            class="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full blur-3xl opacity-15"
            :style="{ background: `radial-gradient(ellipse at center, ${C.primary}, transparent 65%)` }"
          />
        </div>

        <div class="relative mx-auto flex max-w-3xl flex-col items-center px-6 pb-12 pt-16 text-center md:px-10 md:pb-16 md:pt-24">
          <!-- Pill -->
          <div class="mb-6 inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5" :style="{ borderColor: `${C.primary}40`, backgroundColor: `${C.primary}08` }">
            <span class="relative flex size-1.5">
              <span class="absolute inline-flex size-1.5 motion-safe:animate-ping rounded-full opacity-75" :style="{ backgroundColor: C.primary }" />
              <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: C.primary }" />
            </span>
            <span class="text-[11px] font-medium uppercase tracking-[0.2em]" :style="{ color: C.primary }">
              Plataforma + Redação
            </span>
          </div>

          <h1
            class="mb-5 leading-[0.92] tracking-tighter"
            :style="{
              color: C.text,
              fontFamily: F.display,
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            }"
          >
            Em vez de te contar,<br />
            <span class="italic" :style="{ color: C.primary }">deixa a gente te mostrar.</span>
          </h1>

          <p class="mb-8 max-w-lg text-[15px] leading-[1.55] md:text-[16px]" :style="{ color: `${C.text}B0` }">
            Tudo abaixo é o produto real, rodando agora, com a sua paleta. É isso que vai pra sua marca em até 7 dias.
          </p>

          <div class="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em]" :style="{ color: C.textMuted }">
            <span>Role pra ver</span>
            <span class="motion-safe:animate-bounce">↓</span>
          </div>
        </div>
      </section>

      <!-- ============================================================
           SHOWROOM, the whole product tour
           ============================================================ -->
      <section class="relative">
        <div
          class="rd2-tools mx-auto max-w-6xl px-6 md:px-10"
          :style="brandVars"
        >
          <div
            v-for="(shelf, idx) in shelves"
            :key="shelf.key"
            class="border-t py-16 md:py-24 first:border-t-0 first:pt-12 md:first:pt-20"
            :style="{ borderColor: `${C.border}60` }"
          >
            <!-- Shelf label -->
            <div class="mb-8 grid items-end gap-6 md:mb-10 md:grid-cols-12 md:gap-10">
              <div class="md:col-span-7">
                <div class="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em]" :style="{ color: C.primary, fontFamily: F.mono }">
                  <span class="tabular-nums">{{ String(idx + 1).padStart(2, '0') }}</span>
                  <span class="h-px w-6" :style="{ backgroundColor: C.border }" />
                  <span
                    class="rounded-full border px-2 py-0.5"
                    :style="{ borderColor: `${C.primary}50`, color: C.primary }"
                  >
                    {{ shelf.product }}
                  </span>
                  <span :style="{ color: C.textMuted }">·</span>
                  <span :style="{ color: C.textMuted }">{{ shelf.kicker }}</span>
                </div>
                <h2
                  class="mt-4 leading-[0.95] tracking-tight"
                  :style="{
                    color: C.text,
                    fontFamily: F.display,
                    fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                  }"
                >
                  {{ shelf.title }}
                </h2>
              </div>
              <div class="md:col-span-5">
                <p class="text-[14px] leading-relaxed" :style="{ color: `${C.text}B0` }">
                  {{ shelf.description }}
                </p>
                <div class="mt-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted, fontFamily: F.mono }">
                  <UIcon name="i-lucide-circle-check" class="size-3.5" :style="{ color: C.primary }" />
                  {{ shelf.spec }}
                </div>
              </div>
            </div>

            <!-- Live component frame -->
            <div
              class="relative overflow-hidden rounded-2xl border"
              :style="{ borderColor: C.border, backgroundColor: C.background }"
            >
              <!-- Component slot, dispatched by key -->
              <div v-if="shelf.key === 'tickers'">
                <AtomsTickerCarousel
                  big
                  no-control
                  :items="sampleTickers"
                  :fade-color="C.background"
                  class="py-4"
                />
              </div>
              <div v-else-if="shelf.key === 'search'" class="p-6 md:p-8">
                <MoleculesQuickSearch />
              </div>
              <div v-else-if="shelf.key === 'tesouro'" class="px-2 md:px-0">
                <MoleculesTesouroSection />
              </div>
              <div v-else-if="shelf.key === 'news'" class="px-2 md:px-0">
                <MoleculesNewsSection />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           TENANTS STRIP, slim proof line
           ============================================================ -->
      <section class="relative border-t" :style="{ borderColor: `${C.border}60` }">
        <div class="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
          <div class="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div class="text-[11px] uppercase tracking-[0.22em]" :style="{ color: C.primary }">
                , Cinco marcas, mesma infra
              </div>
              <p class="mt-2 text-[14px]" :style="{ color: `${C.text}A0` }">
                A mesma plataforma, vestindo identidades radicalmente diferentes. Você é o próximo slot.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-x-7 gap-y-2">
              <span
                v-for="t in tenants"
                :key="t.slug"
                class="text-[18px] leading-none tracking-tight"
                :style="{
                  color: t.accent,
                  fontFamily: t.font,
                  fontWeight: t.weight,
                  fontStyle: t.italic ? 'italic' : 'normal',
                  opacity: 0.6,
                }"
              >
                {{ t.name }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           PRICING, simplified single grid
           ============================================================ -->
      <section
        id="pricing"
        class="relative border-t"
        :style="{ borderColor: C.border, backgroundColor: C.surfaceLight }"
      >
        <div class="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div class="mb-12 max-w-2xl">
            <div class="text-[11px] uppercase tracking-[0.22em]" :style="{ color: C.primary, fontFamily: F.mono }">
              , Investimento
            </div>
            <h2
              class="mt-3 leading-[0.95] tracking-tight"
              :style="{
                color: C.text,
                fontFamily: F.display,
                fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
              }"
            >
              Pegue um.<br />
              <span class="italic" :style="{ color: C.primary }">Pegue os dois com 15% off.</span>
            </h2>
            <p class="mt-5 text-[14px] leading-relaxed" :style="{ color: C.textMuted }">
              Mensal, sem fidelidade. Setup, deploy, suporte e atualizações inclusos.
            </p>
          </div>

          <div
            class="grid overflow-hidden rounded-2xl border md:grid-cols-3"
            :style="{ borderColor: C.border }"
          >
            <div
              v-for="plan in plans"
              :key="plan.slug"
              class="relative flex flex-col gap-5 border-b p-7 md:border-b-0 md:border-r md:p-9 last:border-b-0 last:border-r-0"
              :style="{
                borderColor: C.border,
                backgroundColor: plan.popular ? `${C.primary}08` : 'transparent',
              }"
            >
              <div
                v-if="plan.popular"
                class="absolute inset-x-0 top-0 h-0.5"
                :style="{ backgroundColor: C.primary }"
              />

              <div class="flex items-center gap-3">
                <span
                  class="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] tabular-nums"
                  :style="{ borderColor: `${C.primary}50`, color: C.primary, fontFamily: F.mono }"
                >
                  {{ plan.tag }}
                </span>
                <h3 class="text-[15px] font-medium" :style="{ color: C.text }">
                  {{ plan.name }}
                </h3>
                <span
                  v-if="plan.popular"
                  class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  :style="{ backgroundColor: `${C.primary}20`, color: C.primary }"
                >
                  Combo
                </span>
              </div>

              <p class="text-[13px] leading-relaxed" :style="{ color: C.textMuted }">
                {{ plan.description }}
              </p>

              <div class="flex items-baseline gap-1">
                <span
                  class="tabular-nums leading-none tracking-tight"
                  :style="{
                    color: C.text,
                    fontFamily: F.display,
                    fontSize: 'clamp(2.5rem, 4.5vw, 3.5rem)',
                  }"
                >
                  {{ plan.price }}
                </span>
                <span class="text-[12px]" :style="{ color: C.textMuted }">
                  /{{ plan.priceUnit }}
                </span>
              </div>
              <p v-if="plan.priceNote" class="text-[12px]" :style="{ color: C.textMuted }">
                {{ plan.priceNote }}
              </p>

              <ul class="flex flex-col gap-2 border-t pt-5 text-[13px]" :style="{ borderColor: `${C.border}80` }">
                <li v-for="feat in plan.features" :key="feat" class="flex items-start gap-2" :style="{ color: `${C.text}D0` }">
                  <UIcon name="i-lucide-check" class="mt-0.5 size-3.5 shrink-0" :style="{ color: C.primary }" />
                  <span>{{ feat }}</span>
                </li>
              </ul>

              <button
                class="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:opacity-90"
                :style="{
                  backgroundColor: plan.popular ? C.primary : 'transparent',
                  color: plan.popular ? C.background : C.text,
                  border: plan.popular ? 'none' : `1px solid ${C.border}`,
                }"
                @click="openLeadModal(plan.slug)"
              >
                {{ plan.cta }} →
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           FINAL CTA, full bleed editorial
           ============================================================ -->
      <section class="relative overflow-hidden border-t" :style="{ borderColor: C.border }">
        <div class="pointer-events-none absolute inset-0">
          <div
            class="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-25"
            :style="{ background: `radial-gradient(circle, ${C.primary}, transparent 60%)` }"
          />
        </div>
        <div class="relative mx-auto max-w-3xl px-6 py-24 text-center md:px-10 md:py-28">
          <h2
            class="leading-[0.92] tracking-tight"
            :style="{
              color: C.text,
              fontFamily: F.display,
              fontSize: 'clamp(2.25rem, 5.5vw, 4.5rem)',
            }"
          >
            Você viu o produto.<br />
            <span class="italic" :style="{ color: C.primary }">Agora vamos colocar a sua marca nele.</span>
          </h2>
          <p class="mx-auto mt-6 max-w-lg text-[15px]" :style="{ color: `${C.text}B0` }">
            Primeira call em 24h, protótipo em 72h, produção em 7 dias. Sem proposta de 40 páginas.
          </p>
          <div class="mt-9">
            <button
              class="group inline-flex items-center gap-3 rounded-full px-8 py-4 text-[14px] font-semibold transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5"
              :style="{
                backgroundColor: C.primary,
                color: C.background,
                boxShadow: `0 18px 50px -16px ${C.primary}A0`,
              }"
              @click="openLeadModal()"
            >
              Falar com o time
              <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
          <p class="mt-12 text-[12px] tracking-wider" :style="{ color: C.textMuted }">
            whitelabel@redentia.com.br
          </p>
        </div>
      </section>
    </div>

    <MoleculesLeadCaptureModal
      v-model:open="leadModalOpen"
      source="whitelabel"
      :plan="leadModalPlan"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
const leadModalOpen = ref(false)
const leadModalPlan = ref<string | undefined>(undefined)

function openLeadModal(plan?: string) {
  leadModalPlan.value = plan
  leadModalOpen.value = true
}

const C = {
  primary: '#F5A623',
  background: '#0A0B0E',
  surface: '#14161C',
  surfaceLight: '#0F1116',
  border: '#2A2E39',
  text: '#E8EAED',
  textMuted: '#8B92A7',
}

const F = {
  body: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  display: "'Instrument Serif', 'Times New Roman', serif",
  mono: "'JetBrains Mono', monospace",
}

// CSS-var override scope so embedded brand-driven components inherit the
// dark amber palette regardless of the active tenant.
const brandVars = {
  '--brand-primary': C.primary,
  '--brand-text': C.text,
  '--brand-text-muted': C.textMuted,
  '--brand-surface': C.surface,
  '--brand-surface-hover': C.surfaceLight,
  '--brand-border': C.border,
  '--brand-background': C.background,
  '--text-heading': C.text,
  '--text-body': C.textMuted,
  '--text-muted': C.textMuted,
  '--bg-elevated': C.surface,
  '--bg-base': C.background,
  '--border-default': C.border,
  '--border-subtle': `${C.border}80`,
  '--text-on-primary': C.background,
}

// Root style: brand vars + explicit dark palette so the api-portal layout's
// brand-driven background (which can be light on tenants like norte-capital)
// doesn't bleed through.
const rootStyle = {
  ...brandVars,
  backgroundColor: C.background,
  color: C.text,
  fontFamily: F.body,
}

// The product tour. Each shelf shows ONE real component. The order is
// deliberate, alternates Plataforma <-> Redação so the visitor sees both
// products without having to read paragraphs about them.
const shelves = [
  {
    key: 'tickers',
    product: 'PLATAFORMA',
    kicker: 'Cotações ao vivo',
    title: 'O carrossel de tickers que abre todas as páginas.',
    description: 'Logos, variação intraday e preço em tempo real. Roda no topo de cada página da sua plataforma. Os ativos abaixo são reais, com dados de exemplo pra demo.',
    spec: '12 tickers exemplo · sua plataforma roda 100+ por padrão',
  },
  {
    key: 'search',
    product: 'PLATAFORMA',
    kicker: 'Busca instantânea',
    title: 'Encontra qualquer ativo em milissegundos.',
    description: 'Digite um ticker (PETR4, VALE3, ITUB4) ou o nome de uma empresa. A busca rola em todo lugar onde o usuário precisar de cotação ou ficha do ativo.',
    spec: 'Real, ao vivo · clique e veja',
  },
  {
    key: 'news',
    product: 'REDAÇÃO',
    kicker: 'Notícias agregadas + originais',
    title: 'O feed da redação, alimentado por 15 fontes.',
    description: 'Notícias deduplicadas, com dedup de URL e tagging por ticker. O mesmo feed que serve a sua plataforma e que pode ser plugado por API/RSS no seu domínio.',
    spec: 'Atualiza a cada 10 minutos · 7 fontes, 100+ tickers',
  },
  {
    key: 'tesouro',
    product: 'PLATAFORMA',
    kicker: 'Renda fixa do Tesouro',
    title: 'Tabela do Tesouro Direto, sempre fresca.',
    description: 'Pré-fixados, IPCA+, Selic e IGP-M com vencimento, taxa e preço. Puxados da API oficial. Cada linha leva o usuário pra ficha completa.',
    spec: 'Real · API oficial do Tesouro Direto',
  },
]

const sampleTickers = [
  { logo: 'https://cdn.brapi.dev/icons/PETR4.svg', ticker: 'PETR4', change: '+2,14%', price: 'R$ 38,72' },
  { logo: 'https://cdn.brapi.dev/icons/VALE3.svg', ticker: 'VALE3', change: '-0,87%', price: 'R$ 64,15' },
  { logo: 'https://cdn.brapi.dev/icons/ITUB4.svg', ticker: 'ITUB4', change: '+1,42%', price: 'R$ 33,21' },
  { logo: 'https://cdn.brapi.dev/icons/BBDC4.svg', ticker: 'BBDC4', change: '+0,68%', price: 'R$ 14,87' },
  { logo: 'https://cdn.brapi.dev/icons/MGLU3.svg', ticker: 'MGLU3', change: '+4,32%', price: 'R$ 12,04' },
  { logo: 'https://cdn.brapi.dev/icons/WEGE3.svg', ticker: 'WEGE3', change: '-1,12%', price: 'R$ 41,68' },
  { logo: 'https://cdn.brapi.dev/icons/B3SA3.svg', ticker: 'B3SA3', change: '+0,93%', price: 'R$ 11,52' },
  { logo: 'https://cdn.brapi.dev/icons/BBAS3.svg', ticker: 'BBAS3', change: '+1,87%', price: 'R$ 28,94' },
  { logo: 'https://cdn.brapi.dev/icons/ABEV3.svg', ticker: 'ABEV3', change: '-0,42%', price: 'R$ 13,21' },
  { logo: 'https://cdn.brapi.dev/icons/SUZB3.svg', ticker: 'SUZB3', change: '+2,68%', price: 'R$ 56,77' },
  { logo: 'https://cdn.brapi.dev/icons/HAPV3.svg', ticker: 'HAPV3', change: '-3,14%', price: 'R$ 4,82' },
  { logo: 'https://cdn.brapi.dev/icons/RAIL3.svg', ticker: 'RAIL3', change: '+1,56%', price: 'R$ 21,45' },
]

const tenants = [
  { slug: 'redentia', name: 'Redentia', accent: '#F5A623', font: "'Instrument Serif', serif", italic: false, weight: 400 },
  { slug: 'norte-capital', name: 'Norte Capital', accent: '#8B6F3D', font: "'Fraunces', serif", italic: true, weight: 400 },
  { slug: 'primo-rico', name: 'Primo Rico', accent: '#FF6B35', font: "'Fraunces', serif", italic: false, weight: 700 },
  { slug: 'investidor-sardinha', name: 'Investidor Sardinha', accent: '#C84B31', font: "'IBM Plex Serif', serif", italic: true, weight: 400 },
  { slug: 'me-poupe', name: 'Me Poupe!', accent: '#FACC15', font: "'Poppins', sans-serif", italic: false, weight: 900 },
]

const plans = [
  {
    slug: 'newsroom',
    tag: '02',
    name: 'Só Redação',
    description: 'Conteúdo agregado e originais com a sua marca.',
    price: 'R$ 1.800',
    priceUnit: 'mês',
    priceNote: 'Setup zero · saída por API/RSS',
    features: [
      '15 feeds, dedup, tagging por ticker',
      'Atualização a cada 10 min',
      'Suporte por email',
    ],
    cta: 'Quero a redação',
    popular: false,
  },
  {
    slug: 'combo',
    tag: '01 + 02',
    name: 'Combo Plataforma + Redação',
    description: 'Os dois produtos com 15% off no total.',
    price: 'R$ 8.900',
    priceUnit: 'mês',
    priceNote: 'Setup R$ 11.000 · deploy em 7 dias',
    features: [
      'Plataforma white-label completa',
      'Redação plugada na sua marca',
      'Editoriais + carrosseis + briefing',
      'Suporte prioritário em Slack',
    ],
    cta: 'Quero o combo',
    popular: true,
  },
  {
    slug: 'platform',
    tag: '01',
    name: 'Só Plataforma',
    description: 'Frontend, backend, dados B3, calculadoras, IA.',
    price: 'R$ 6.800',
    priceUnit: 'mês',
    priceNote: 'Setup R$ 8.000 · deploy em 7 dias',
    features: [
      'Identidade 100% custom + domínio',
      'Dados B3 + 8 calculadoras + IA',
      'Multi-usuário e push',
    ],
    cta: 'Quero a plataforma',
    popular: false,
  },
]

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: 'Whitelabel · Tour ao vivo da plataforma e da redação | Redentia',
  description:
    'Veja a plataforma white-label e a redação financeira da Redentia rodando ao vivo. Componentes reais, dados reais, mesma infra que vai pra sua marca em até 7 dias.',
  path: '/whitelabel2',
})
</script>

<style scoped>
.wl2-root {
  font-feature-settings: 'ss01', 'cv11';
}

.wl2-root a:focus-visible,
.wl2-root button:focus-visible {
  outline: 2px solid #F5A623;
  outline-offset: 4px;
  border-radius: 8px;
}
</style>
