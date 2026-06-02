<!--
  /ranking/redentia-score — flagship metric page.

  Diferencia-se das demais paginas de ranking ([slug].vue) por:
    - Hero com gradient amber + score gauge visual
    - Methodology card transparente (3 passos + formula)
    - Tabela custom NAO usa MoleculesRankingTable (RankingTable nao
      conhece os fields redentia_score / ranking_count / ranking_breakdown)
    - Cada linha tem score 0-10 em destaque (28px, amber, mini progress)
    - "Ver breakdown" expansivel com chips ranking + posicao
    - Pesquisa explicativa "Por que combinar 15 rankings"

  Schemas: WebApplication + FAQPage + ItemList. Sem aggregateRating,
  HowTo ou Article.
-->
<template>
  <NuxtLayout name="default" title="Redentia Score">
    <section class="flex flex-col gap-10 px-6 py-8 md:py-12">
      <!-- ============ Back link ============ -->
      <NuxtLink
        to="/ranking"
        class="inline-flex w-fit items-center gap-1 text-xs transition hover:opacity-80"
        :style="{ color: 'var(--brand-text-muted)' }"
      >
        <UIcon name="i-lucide-chevron-left" class="size-3" />
        Todos os rankings
      </NuxtLink>

      <!-- ============ Hero (gradient amber treatment) ============ -->
      <header
        class="relative overflow-hidden rounded-[14px] border px-6 py-10 md:px-12 md:py-16"
        :style="{
          borderColor: 'color-mix(in srgb, var(--brand-primary) 35%, var(--brand-border))',
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 14%, var(--brand-background)) 0%, color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background)) 100%)',
        }"
      >
        <!-- Decorative ambient glow -->
        <div
          class="pointer-events-none absolute -right-32 -top-32 size-[420px] rounded-full opacity-60 blur-3xl"
          :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 22%, transparent)' }"
        />
        <div
          class="pointer-events-none absolute -bottom-20 -left-20 size-[320px] rounded-full opacity-40 blur-3xl"
          :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 22%, transparent)' }"
        />

        <div class="relative flex flex-col gap-6">
          <span
            class="font-mono-tab w-fit rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
            :style="{
              color: 'var(--brand-primary)',
              borderColor: 'color-mix(in srgb, var(--brand-primary) 40%, transparent)',
              backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
            }"
          >Exclusivo Redentia</span>

          <h1
            class="font-light"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(36px, 6vw, 64px)',
              lineHeight: 1.02,
              letterSpacing: '-1.4px',
            }"
          >Redentia Score</h1>

          <p
            class="max-w-3xl"
            :style="{
              color: 'color-mix(in srgb, var(--brand-text) 78%, transparent)',
              fontSize: 'clamp(16px, 1.6vw, 19px)',
              lineHeight: 1.55,
            }"
          >O score 0 a 10 que mede a qualidade fundamentalista de cada ação da B3 cruzando 15 rankings simultaneamente. Quem aparece bem em vários rankings tem score alto. Quem só aparece em um, tem score baixo.</p>

          <!-- 0 → 10 visual scale -->
          <div class="flex flex-col gap-2 pt-2">
            <div class="flex items-center justify-between max-w-md text-[10px] font-medium uppercase tracking-[0.14em]"
              :style="{ color: 'color-mix(in srgb, var(--brand-text) 55%, transparent)' }"
            >
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
            <div
              class="relative h-2.5 max-w-md overflow-hidden rounded-full"
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-text) 8%, transparent)' }"
            >
              <div
                class="absolute inset-y-0 left-0 right-0 rounded-full"
                :style="{
                  background: 'linear-gradient(90deg, color-mix(in srgb, var(--brand-primary) 40%, transparent) 0%, var(--brand-primary) 50%, var(--brand-secondary) 100%)',
                }"
              />
            </div>
          </div>

          <!-- Trust badges -->
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
            <span
              v-for="(badge, idx) in heroBadges"
              :key="badge.text"
              class="flex items-center gap-1.5 text-xs"
              :style="{ color: 'color-mix(in srgb, var(--brand-text) 70%, transparent)' }"
            >
              <UIcon
                :name="badge.icon"
                class="size-4"
                :style="{ color: 'var(--brand-primary)' }"
              />
              {{ badge.text }}
              <span v-if="idx < heroBadges.length - 1" class="ml-2 hidden md:inline opacity-50">·</span>
            </span>
          </div>
        </div>
      </header>

      <!-- ============ Methodology card ============ -->
      <section class="flex flex-col gap-5">
        <div class="flex flex-col gap-1">
          <span
            class="font-mono-tab text-[10px] font-medium uppercase tracking-[0.16em]"
            :style="{ color: 'var(--brand-primary)' }"
          >Transparência total</span>
          <h2
            class="font-light"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(24px, 3vw, 32px)',
              lineHeight: 1.1,
              letterSpacing: '-0.6px',
            }"
          >Como o score é calculado</h2>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <article
            v-for="(step, idx) in methodologySteps"
            :key="step.title"
            class="flex flex-col gap-3 rounded-[14px] border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 60%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 60%, transparent)',
            }"
          >
            <div class="flex items-center gap-3">
              <span
                class="flex size-9 items-center justify-center rounded-full font-mono-tab text-base font-semibold tabular-nums"
                :style="{
                  backgroundColor: 'color-mix(in srgb, var(--brand-primary) 14%, transparent)',
                  color: 'var(--brand-primary)',
                }"
              >{{ idx + 1 }}</span>
              <h3
                class="text-sm font-medium"
                :style="{ color: 'var(--brand-text)' }"
              >{{ step.title }}</h3>
            </div>
            <p
              class="text-sm leading-relaxed"
              :style="{ color: 'color-mix(in srgb, var(--brand-text) 70%, transparent)' }"
            >{{ step.body }}</p>
          </article>
        </div>

        <!-- Formula callout -->
        <div
          class="flex flex-col gap-2 rounded-[14px] border-l-4 p-5 md:flex-row md:items-center md:justify-between md:gap-6"
          :style="{
            backgroundColor: 'color-mix(in srgb, var(--brand-primary) 7%, var(--brand-surface))',
            borderLeftColor: 'var(--brand-primary)',
          }"
        >
          <div class="flex flex-col gap-1">
            <span
              class="font-mono-tab text-[10px] font-medium uppercase tracking-[0.16em]"
              :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }"
            >Fórmula</span>
            <code
              class="font-mono-tab text-sm md:text-base"
              :style="{ color: 'var(--brand-text)' }"
            >score = Σ((51 − posição) ÷ 50) ÷ 15 × 10</code>
          </div>
          <p
            class="text-xs md:max-w-xs md:text-right"
            :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }"
          >Cap em 10. Top 1 vale 1.0 ponto, top 50 vale 0.02. Sem pesos diferentes entre rankings.</p>
        </div>
      </section>

      <!-- ============ Type filter tabs ============ -->
      <div class="flex items-center justify-between gap-3">
        <AtomsSegmented
          v-model="activeType"
          :options="tabs"
          aria-label="Filtrar tipo de ativo"
        />
        <span
          class="hidden text-xs md:inline"
          :style="{ color: 'var(--brand-text-muted)' }"
        >Top 50 ativos</span>
      </div>

      <!-- ============ Custom score table ============ -->
      <div
        class="overflow-hidden rounded-[14px] border"
        :style="{
          borderColor: 'var(--brand-border)',
          backgroundColor: 'var(--brand-surface)',
        }"
      >
        <!-- Header desktop only -->
        <div
          class="hidden items-center gap-4 border-b px-5 py-3 text-[10px] font-medium uppercase tracking-[0.12em] md:flex"
          :style="{
            borderColor: 'var(--brand-border)',
            color: 'var(--brand-text-muted)',
          }"
        >
          <div class="w-8 text-right">#</div>
          <div class="flex-1">Ativo</div>
          <div class="w-40 text-right">Redentia Score</div>
          <div class="w-32 text-right">Aparece em</div>
          <div class="w-28 text-right">Breakdown</div>
        </div>

        <!-- Loading -->
        <div v-if="pending" class="flex items-center justify-center px-5 py-20">
          <UIcon
            name="i-lucide-loader"
            class="size-6 motion-safe:animate-spin"
            :style="{ color: 'var(--brand-primary)' }"
          />
        </div>

        <!-- Empty -->
        <div
          v-else-if="!rows?.length"
          class="flex items-center justify-center px-5 py-20 text-sm"
          :style="{ color: 'var(--brand-text-muted)' }"
        >Sem dados disponíveis no momento.</div>

        <!-- Rows -->
        <ol v-else class="flex flex-col">
          <li
            v-for="(row, idx) in rows"
            :key="row.ticker"
            class="border-b last:border-b-0"
            :style="{ borderColor: 'var(--brand-border)' }"
          >
            <!-- Main row (clickable summary, NOT a NuxtLink so the
                 breakdown toggle button doesn't bubble to a navigation) -->
            <div class="flex flex-col">
              <div
                class="flex items-center gap-3 px-5 py-4 transition-colors md:gap-4"
                :class="{ 'rs-row--top3': idx < 3 }"
              >
                <!-- Rank badge -->
                <div
                  class="flex w-8 shrink-0 items-center justify-end font-mono-tab text-xs font-semibold tabular-nums"
                  :style="{
                    color: idx < 3 ? 'var(--brand-primary)' : 'var(--brand-text-muted)',
                  }"
                >
                  <span
                    v-if="idx < 3"
                    class="flex size-6 items-center justify-center rounded-full"
                    :style="{
                      backgroundColor: 'color-mix(in srgb, var(--brand-primary) 18%, transparent)',
                    }"
                  >{{ idx + 1 }}</span>
                  <span v-else>{{ idx + 1 }}</span>
                </div>

                <!-- Logo + ticker + name -->
                <NuxtLink
                  :to="`/asset/${row.ticker.toLowerCase()}`"
                  class="flex min-w-0 flex-1 items-center gap-3 transition-opacity hover:opacity-80"
                >
                  <div
                    class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border"
                    :style="{
                      borderColor: 'var(--brand-border)',
                      backgroundColor: 'var(--brand-background)',
                    }"
                  >
                    <img
                      v-if="row.logo"
                      :src="row.logo"
                      :alt="row.name || row.ticker"
                      class="size-full object-cover"
                      loading="lazy"
                      @error="($event.target as HTMLImageElement).style.display='none'"
                    >
                    <span
                      v-else
                      class="text-[10px] font-bold"
                      :style="{ color: 'var(--brand-text-muted)' }"
                    >{{ row.ticker.slice(0, 2) }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div
                      class="truncate text-sm font-semibold"
                      :style="{ color: 'var(--brand-text)' }"
                    >{{ row.ticker }}</div>
                    <div
                      class="truncate text-[11px]"
                      :style="{ color: 'var(--brand-text-muted)' }"
                    >{{ row.name || '-' }}</div>
                  </div>
                </NuxtLink>

                <!-- Big score gauge -->
                <div class="flex w-32 shrink-0 flex-col items-end gap-1.5 md:w-40">
                  <span
                    class="font-mono-tab font-light tabular-nums"
                    :style="{
                      color: 'var(--brand-primary)',
                      fontSize: '28px',
                      lineHeight: 1,
                      letterSpacing: '-0.5px',
                    }"
                  >{{ formatScore(row.redentia_score) }}<span
                    class="text-sm font-medium opacity-50"
                  >/10</span></span>
                  <div
                    class="h-1.5 w-full max-w-[120px] overflow-hidden rounded-full"
                    :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-border) 60%, transparent)' }"
                  >
                    <div
                      class="h-full transition-all"
                      :style="{
                        width: `${Math.max(0, Math.min(100, Number(row.redentia_score || 0) * 10))}%`,
                        background: 'linear-gradient(90deg, color-mix(in srgb, var(--brand-primary) 60%, transparent) 0%, var(--brand-primary) 100%)',
                      }"
                    />
                  </div>
                </div>

                <!-- Ranking count badge -->
                <div
                  class="hidden w-32 shrink-0 items-center justify-end md:flex"
                >
                  <span
                    class="rounded-full border px-2.5 py-1 font-mono-tab text-[11px] font-medium tabular-nums"
                    :style="{
                      color: 'var(--brand-text)',
                      borderColor: 'color-mix(in srgb, var(--brand-border) 70%, transparent)',
                      backgroundColor: 'color-mix(in srgb, var(--brand-text) 4%, transparent)',
                    }"
                  >{{ row.ranking_count || 0 }}/15</span>
                </div>

                <!-- Toggle button -->
                <button
                  type="button"
                  class="flex w-28 shrink-0 items-center justify-end gap-1 text-xs font-medium transition hover:opacity-80"
                  :style="{ color: 'var(--brand-primary)' }"
                  @click="toggleBreakdown(row.ticker)"
                >
                  <span class="hidden md:inline">{{ expandedTicker === row.ticker ? 'Ocultar' : 'Ver detalhe' }}</span>
                  <UIcon
                    name="i-lucide-chevron-down"
                    class="size-4 transition-transform"
                    :class="{ 'rotate-180': expandedTicker === row.ticker }"
                  />
                </button>
              </div>

              <!-- Mobile-only: ranking count line -->
              <div
                class="-mt-2 flex items-center justify-between gap-3 px-5 pb-3 text-xs md:hidden"
                :style="{ color: 'var(--brand-text-muted)' }"
              >
                <span>Aparece em {{ row.ranking_count || 0 }} de 15 rankings</span>
              </div>

              <!-- Expanded breakdown -->
              <div
                v-if="expandedTicker === row.ticker"
                class="border-t px-5 pb-5 pt-4"
                :style="{
                  borderColor: 'var(--brand-border)',
                  backgroundColor: 'color-mix(in srgb, var(--brand-primary) 4%, transparent)',
                }"
              >
                <div class="flex flex-col gap-3">
                  <span
                    class="text-[11px] font-medium uppercase tracking-[0.12em]"
                    :style="{ color: 'var(--brand-text-muted)' }"
                  >Posições nos rankings que compõem o score</span>
                  <div class="flex flex-wrap gap-2">
                    <NuxtLink
                      v-for="(position, slug) in row.ranking_breakdown || {}"
                      :key="slug"
                      :to="RANKINGS_MAP[slug]?.url || '/ranking'"
                      class="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition hover:opacity-80"
                      :style="{
                        backgroundColor: 'var(--brand-surface)',
                        borderColor: 'color-mix(in srgb, var(--brand-border) 70%, transparent)',
                        color: 'var(--brand-text)',
                      }"
                    >
                      <span>{{ RANKINGS_MAP[slug]?.title || slug }}</span>
                      <span
                        class="font-mono-tab font-semibold tabular-nums"
                        :style="{ color: 'var(--brand-primary)' }"
                      >#{{ position }}</span>
                    </NuxtLink>
                  </div>
                  <p
                    v-if="!Object.keys(row.ranking_breakdown || {}).length"
                    class="text-xs"
                    :style="{ color: 'var(--brand-text-muted)' }"
                  >Sem detalhes disponíveis para este ativo.</p>
                </div>
              </div>
            </div>
          </li>
        </ol>
      </div>

      <!-- ============ Educational sections ============ -->
      <article
        class="mt-4 flex flex-col gap-6 border-t pt-8"
        :style="{ borderColor: 'var(--brand-border)' }"
      >
        <template v-for="(section, idx) in educationalSections" :key="`section-${idx}`">
          <h2
            class="font-light"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(22px, 2.5vw, 26px)',
              lineHeight: 1.2,
              letterSpacing: '-0.4px',
            }"
          >{{ section.h2 }}</h2>
          <p
            v-for="(para, pIdx) in section.paragraphs"
            :key="`p-${idx}-${pIdx}`"
            class="leading-relaxed"
            :style="{ color: 'var(--brand-text-muted)' }"
          >{{ para }}</p>
        </template>
      </article>

      <!-- ============ FAQ ============ -->
      <section class="flex max-w-4xl flex-col gap-4">
        <h2
          class="font-light"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(22px, 2.5vw, 26px)',
            lineHeight: 1.2,
            letterSpacing: '-0.4px',
          }"
        >Perguntas Frequentes</h2>

        <div class="flex flex-col gap-3">
          <details
            v-for="faq in faqItems"
            :key="faq.q"
            class="group rounded-xl border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <summary
              class="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-medium"
              :style="{ color: 'var(--brand-text)' }"
            >
              {{ faq.q }}
              <UIcon
                name="i-lucide-chevron-down"
                class="size-5 transition-transform group-open:rotate-180"
              />
            </summary>
            <p
              class="mt-3 text-sm leading-relaxed"
              :style="{ color: 'var(--brand-text-muted)' }"
            >{{ faq.a }}</p>
          </details>
        </div>
      </section>

      <!-- ============ CTA ============ -->
      <MoleculesCtaSection
        title="Acompanhe o Redentia Score na sua carteira"
        :description="`Cadastre-se na ${brand.name} e veja o score atualizado dos ativos que você acompanha, com indicadores fundamentalistas, alertas e breakdown completo dos 15 rankings.`"
        :buttons="[
          { label: 'Criar conta grátis', to: '/auth/register', icon: 'i-lucide-arrow-right', variant: 'primary' },
          { label: 'Ver outros rankings', to: '/ranking', variant: 'outline' },
        ]"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
// ====================================================================
// /ranking/redentia-score — flagship metric standalone page.
// Não passa pelo dispatch table do [slug].vue porque os fields
// `redentia_score`, `ranking_count` e `ranking_breakdown` exigem
// renderização customizada que o RankingTable.vue não cobre.
// ====================================================================

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const brand = useBrand()
const service = useAssetsService()

// ----- Type filter ---------------------------------------------------

// AtomsSegmented exige value string|number, entao usamos 'all' como
// sentinel para "sem filtro" e convertemos pra null antes de chamar o
// service (que espera null pra retornar todos os tipos).
type TickerFilter = 'all' | 'STOCK' | 'REIT' | 'ETF'

const activeType = ref<TickerFilter>('all')

const tabs: Array<{ label: string; value: TickerFilter }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Ações', value: 'STOCK' },
  { label: 'FIIs', value: 'REIT' },
  { label: 'ETFs', value: 'ETF' },
]

// ----- Data ----------------------------------------------------------

interface RedentiaScoreRow {
  ticker: string
  name: string | null
  logo: string | null
  market_price?: number | string | null
  redentia_score: number
  ranking_count: number
  ranking_breakdown: Record<string, number>
}

const { data: rows, pending } = await useAsyncData<RedentiaScoreRow[]>(
  () => `redentia-score-${activeType.value}`,
  async () => (await service.getRedentiaScore(activeType.value === 'all' ? null : activeType.value, 50)) as RedentiaScoreRow[],
  { watch: [activeType], default: () => [] as RedentiaScoreRow[] },
)

// ----- Source rankings map (slug → human title + url) ----------------
// Espelha os 15 rankings que o backend usa pra calcular o score.

const RANKINGS_MAP: Record<string, { title: string; url: string }> = {
  'market-cap': { title: 'Maior Valor de Mercado', url: '/ranking/maiores-valor-mercado' },
  'dividend-yield': { title: 'Maior Dividend Yield', url: '/ranking/maiores-dividend-yield' },
  'graham-discount': { title: 'Mais Barata (Graham)', url: '/ranking/mais-baratas-graham' },
  'bazin-discount': { title: 'Mais Barata (Bazin)', url: '/ranking/mais-baratas-bazin' },
  'net-margin': { title: 'Maior Margem Líquida', url: '/ranking/maiores-margem-liquida' },
  'buy-and-hold': { title: 'Buy and Hold', url: '/ranking/buy-and-hold' },
  'revenue': { title: 'Maior Receita', url: '/ranking/maiores-receitas' },
  'net-income': { title: 'Maior Lucro', url: '/ranking/maiores-lucros' },
  'roe': { title: 'Maior ROE', url: '/ranking/maiores-roe' },
  'low-pe': { title: 'Menor P/L', url: '/ranking/menores-pl' },
  'cash': { title: 'Maior Caixa', url: '/ranking/maiores-caixa' },
  'revenue-growth': { title: 'Crescimento de Receita 5y', url: '/ranking/crescimento-receita-5-anos' },
  'net-income-growth': { title: 'Crescimento de Lucro 5y', url: '/ranking/crescimento-lucro-5-anos' },
  'upside': { title: 'Maior Upside', url: '/ranking/maior-potencial-upside' },
  'never-loss': { title: 'Nunca Teve Prejuízo', url: '/ranking/nunca-tiveram-prejuizo' },
}

// ----- UI state ------------------------------------------------------

const expandedTicker = ref<string | null>(null)
function toggleBreakdown(ticker: string) {
  expandedTicker.value = expandedTicker.value === ticker ? null : ticker
}

// ----- Score formatter -----------------------------------------------

function formatScore(v: unknown): string {
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(n)) return '-'
  return n.toFixed(2).replace('.', ',')
}

// ----- Hero badges ---------------------------------------------------

const heroBadges = [
  { icon: 'i-lucide-layers', text: '15 rankings combinados' },
  { icon: 'i-lucide-refresh-cw', text: 'Atualizado diariamente' },
  { icon: 'i-lucide-cpu', text: 'Algoritmo proprietário' },
  { icon: 'i-lucide-trophy', text: 'Top 50 ativos' },
]

// ----- Methodology ---------------------------------------------------

const methodologySteps = [
  {
    title: 'Coleta',
    body: 'Coletamos os Top 50 de cada um dos 15 rankings positivos da B3: dividend yield, valor de mercado, ROE, Graham, Bazin, crescimento de receita e lucro, e mais.',
  },
  {
    title: 'Pontuação',
    body: 'Cada aparição vale pontos pela posição: posição #1 = 1.0 ponto, #2 = 0.98, #50 = 0.02. Top 1 sempre vale mais que somar várias posições baixas.',
  },
  {
    title: 'Cálculo',
    body: 'Score = soma dos pontos ÷ 15 × 10, com cap em 10. Quem aparece em vários rankings simultaneamente acumula score alto. Quem só aparece em um, fica baixo.',
  },
]

// ----- Educational content ------------------------------------------

const educationalSections = [
  {
    h2: 'Por que combinar 15 rankings?',
    paragraphs: [
      'Uma boa empresa raramente lidera em uma única dimensão. Petrobras tem dividend yield alto, mas também aparece bem em valor de mercado e em receita. Itaú combina ROE elevado com crescimento de lucro consistente. Aparecer em vários rankings simultaneamente é o sinal mais robusto de solidez fundamental ampla, mais difícil de produzir com sorte ou manipulação contábil pontual.',
      'Quando você olha só um indicador, fica vulnerável a vieses isolados. Empresa com dividend yield estratosférico pode estar pagando dividendo extraordinário num ano ruim, mascarando deterioração operacional. Empresa com ROE altíssimo pode estar muito alavancada, com retorno cosmético sustentado por dívida. O score combina 15 ângulos justamente pra suavizar essas distorções e te entregar uma classificação mais confiável.',
    ],
  },
  {
    h2: 'Limitações',
    paragraphs: [
      'Score alto não garante retorno futuro. O Redentia Score é uma foto do passado e do presente, não uma previsão. Ele te diz quais empresas hoje têm o conjunto mais sólido de indicadores fundamentalistas, não quais vão subir nos próximos 12 meses. Mercado oscila por motivos que números fundamentalistas não capturam: macro, fluxo, narrativa, timing de ciclo.',
      'Algumas dimensões ficam intencionalmente de fora. Notícias, momentum de preço e variação de curto prazo não entram no cálculo porque são ruidosas e podem distorcer o ranking. Uma ação que subiu 80% em um mês merece atenção, mas isso é movimento, não qualidade fundamentalista. O score foca no balanço, no resultado e na consistência histórica, deixando o curto prazo pra outras páginas dedicadas.',
    ],
  },
  {
    h2: 'Como usar o score',
    paragraphs: [
      'Use o Redentia Score como filtro inicial pra estudo. Pegue as 10-20 ações com score mais alto e leia o demonstrativo, entenda o setor, veja o histórico de dividendos e a tese de longo prazo. Score alto é sinal pra investigar mais fundo, nunca pra comprar no automático sem entender o negócio. Combine sempre com sua análise pessoal e seu objetivo de carteira.',
      'Revisite o ranking trimestralmente, alinhado com a divulgação de balanços. Empresas que estavam no top 10 podem cair para o top 30 quando margem comprime ou crescimento desacelera. O movimento entre faixas é informação relevante: queda persistente sugere deterioração estrutural, queda pontual após resultado fraco pode ser oportunidade. O ranking se atualiza diariamente conforme os dados de balanço e cotação.',
    ],
  },
]

// ----- FAQ -----------------------------------------------------------

const faqItems = [
  {
    q: 'O que significa um score alto?',
    a: 'Score acima de 6 já é considerado muito bom. Indica que a empresa aparece bem posicionada em pelo menos 8-10 dos 15 rankings simultaneamente, sinal de solidez fundamentalista ampla. Score acima de 8 é raro e geralmente envolve blue chips com balanço forte, dividendos consistentes e crescimento. Score baixo (abaixo de 2) significa que a ação só aparece em um ou dois rankings, faltando consistência multi-dimensional.',
  },
  {
    q: 'Por que algumas ações grandes têm score baixo?',
    a: 'Tamanho não basta. Uma empresa pode ter market cap de R$ 100 bilhões e ainda assim ter ROE pífio, margem comprimida, crescimento estagnado e dividend yield baixo. Nesse caso, ela aparece bem no ranking de valor de mercado, mas falha nos outros 14, e o score reflete isso. Empresas com balanço grande mas resultado fraco operam como pesos mortos no índice e o score expõe essa diferença.',
  },
  {
    q: 'O que fazer com uma ação score 8+?',
    a: 'Investigar antes de comprar. Score 8+ é gatilho pra estudo aprofundado, não recomendação de compra. Leia o release de resultados mais recente, entenda o setor, veja se a tese sustenta os indicadores ou se eles estão inflados por algum evento pontual (venda de ativo, ganho não recorrente). Score alto te diz onde olhar primeiro, mas a decisão de alocação depende do seu perfil, prazo e do preço atual da ação.',
  },
  {
    q: 'Os 15 rankings têm pesos iguais?',
    a: 'Sim. Todos os 15 rankings entram com peso igual no cálculo. Apareceu em #1 do dividend yield vale o mesmo que aparecer em #1 do ROE ou #1 do market cap. Essa decisão é deliberada: pesos diferentes seriam julgamento subjetivo e quebrariam a transparência do método. O que diferencia o impacto é a posição dentro de cada ranking, não qual ranking é.',
  },
  {
    q: 'Como o score muda ao longo do tempo?',
    a: 'O score se recalcula diariamente usando os dados mais recentes de cotação, balanço e indicadores. Cotação muda todo dia útil, então market cap, P/L, dividend yield e upside oscilam. Balanço muda trimestralmente, atualizando ROE, margem, receita, lucro e crescimento. Empresas costumam manter score relativamente estável (oscilando dentro de uma faixa de ±0.5 ponto), com mudanças bruscas após resultados muito fora do esperado.',
  },
]

// ----- SEO -----------------------------------------------------------

usePageSeo({
  title: 'Redentia Score 2026: Score 0-10 para Ações da B3 | Redentia',
  description:
    'Score proprietário 0 a 10 que mede a qualidade fundamentalista de ações da B3 cruzando 15 rankings: dividend yield, ROE, Graham, Bazin, crescimento, e mais.',
  path: '/ranking/redentia-score',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Rankings', path: '/ranking' },
    { name: 'Redentia Score', path: '/ranking/redentia-score' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Redentia Score',
      url: 'https://www.redentia.com.br/ranking/redentia-score',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      description:
        'Score 0-10 que combina 15 rankings fundamentalistas para classificar ações da B3 por qualidade.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Redentia Score Top 10',
      numberOfItems: 10,
      itemListElement: (rows.value || []).slice(0, 10).map((r, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${r.ticker}, Score ${formatScore(r.redentia_score)}`,
        url: `https://www.redentia.com.br/asset/${r.ticker.toLowerCase()}`,
      })),
    },
  ],
})
</script>

<style scoped>
.rs-row--top3 {
  background-color: color-mix(in srgb, var(--brand-primary) 4%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .motion-safe\:animate-spin {
    animation: none;
  }
}
</style>
