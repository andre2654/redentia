<!--
  Raio-X Completo mockup — deep portfolio diagnosis surface.

  This is the MUCH richer version of the public /raio-x page. While
  the public surface uses synthetic asset data (mocked CAGR, beta,
  fundamentals), this version is grounded in the user's REAL imported
  positions + live data fetched by chat-service tools.

  Sections (top → bottom):
    1. Score gauge (big, hero) + 9 dimensions
    2. Allocation deep-dive (class, sector, geography)
    3. Per-asset thesis (table with thesis status + variation)
    4. Stress test (4 scenarios)
    5. Benchmark comparison (line chart vs CDI/IBOV/IFIX/SP500)
    6. Macro exposure (Selic, IPCA, USD, commodities)
    7. Strengths / Risks / Recommendations (3-column)
    8. Alternative assets (DE/PARA suggestions)
-->
<template>
  <div class="flex flex-col gap-12 px-6 py-8">
    <!-- ============ Hero: Score gauge + dimensions ============ -->
    <section class="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
      <!-- Big score gauge -->
      <article
        class="relative overflow-hidden flex flex-col items-center justify-center gap-3 rounded-2xl border p-8"
        :style="{
          backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 60%, ${brand.colors.background})`,
          borderColor: `color-mix(in srgb, ${brand.colors.primary} 22%, transparent)`,
          boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${brand.colors.primary} 10%, transparent), 0 24px 60px -32px color-mix(in srgb, ${brand.colors.primary} 22%, transparent)`,
        }"
      >
        <div
          class="pointer-events-none absolute inset-0"
          :style="{
            backgroundImage: `radial-gradient(ellipse 60% 80% at 50% 0%, color-mix(in srgb, ${brand.colors.primary} 14%, transparent) 0%, transparent 60%)`,
          }"
        />
        <span
          class="relative font-mono-tab text-[11px] font-medium uppercase"
          :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
        >Score Redentia</span>

        <!-- Gauge SVG -->
        <svg viewBox="0 0 200 120" class="relative h-32 w-full max-w-xs">
          <defs>
            <linearGradient id="gauge" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" :stop-color="brand.colors.negative" />
              <stop offset="50%" :stop-color="brand.colors.warning || '#f59e0b'" />
              <stop offset="100%" :stop-color="brand.colors.positive" />
            </linearGradient>
          </defs>
          <!-- Background arc -->
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            :stroke="`color-mix(in srgb, ${brand.colors.text} 8%, transparent)`"
            stroke-width="14"
            stroke-linecap="round"
          />
          <!-- Filled arc (score=76 → ~76% of half-circle = stroke-dasharray pattern) -->
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gauge)"
            stroke-width="14"
            stroke-linecap="round"
            stroke-dasharray="251.33"
            :stroke-dashoffset="(1 - 76 / 100) * 251.33"
          />
        </svg>

        <div class="relative flex flex-col items-center gap-1">
          <div class="flex items-baseline gap-1">
            <span
              class="font-mono-tab text-[60px] font-light tabular-nums leading-none"
              :style="{ color: brand.colors.text, letterSpacing: '-0.04em' }"
            >76</span>
            <span class="text-[14px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }">/100</span>
          </div>
          <span
            class="rounded-md px-2 py-0.5 font-mono-tab text-[10.5px] font-medium uppercase"
            :style="{
              letterSpacing: '0.18em',
              backgroundColor: `color-mix(in srgb, ${brand.colors.positive} 14%, transparent)`,
              color: brand.colors.positive,
            }"
          >Boa</span>
        </div>

        <p
          class="relative mt-2 max-w-xs text-center text-[12.5px]"
          :style="{
            color: `color-mix(in srgb, ${brand.colors.text} 70%, transparent)`,
            lineHeight: 1.55,
          }"
        >Sua carteira tem fundamentos sólidos pra renda passiva. Os principais pontos de melhoria são exposição cambial e concentração em FIIs de papel.</p>
      </article>

      <!-- 9 dimensions -->
      <article class="flex flex-col gap-4 rounded-2xl border p-6" :style="cardStyle">
        <SectionHeading
          :brand="brand"
          eyebrow="9 dimensões"
          title="Como cada eixo da sua carteira está pontuando"
          size="md"
        />
        <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <li
            v-for="d in SCORE_DIMENSIONS"
            :key="d.key"
            class="flex flex-col gap-1.5"
          >
            <div class="flex items-baseline justify-between gap-2">
              <span class="text-[12.5px]" :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }">{{ d.label }}</span>
              <span
                class="font-mono-tab text-[12.5px] tabular-nums"
                :style="{ color: dimensionColor(d.value) }"
              >{{ d.value }}</span>
            </div>
            <div
              class="h-1 w-full overflow-hidden rounded-full"
              :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 7%, transparent)` }"
            >
              <div
                class="h-full rounded-full"
                :style="{ width: d.value + '%', backgroundColor: dimensionColor(d.value) }"
              />
            </div>
            <span class="text-[10.5px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)`, lineHeight: 1.4 }">{{ d.note }}</span>
          </li>
        </ul>
      </article>
    </section>

    <!-- ============ Per-asset thesis ============ -->
    <section class="flex flex-col gap-5">
      <SectionHeading
        :brand="brand"
        eyebrow="Tese por ativo"
        title="Como cada posição se mantém à luz dos fundamentos"
      />
      <article class="overflow-hidden rounded-xl border" :style="cardStyle">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr :style="{ borderBottom: `1px solid color-mix(in srgb, ${brand.colors.border} 40%, transparent)` }">
                <th class="th">Ativo</th>
                <th class="th">Tese</th>
                <th class="th">Status</th>
                <th class="th th-num">P/L</th>
                <th class="th th-num">P/VP</th>
                <th class="th th-num">ROE</th>
                <th class="th th-num">Variação 12m</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="t in thesisRows"
                :key="t.ticker"
                :style="{ borderBottom: `1px solid color-mix(in srgb, ${brand.colors.border} 25%, transparent)` }"
              >
                <td class="td">
                  <div class="flex items-center gap-2.5">
                    <span class="flex size-7 shrink-0 items-center justify-center rounded-md font-mono-tab text-[10px] font-medium" :style="{ backgroundColor: `color-mix(in srgb, ${t.tint} 18%, transparent)`, color: t.tint }">{{ t.ticker.slice(0, 4) }}</span>
                    <div class="flex flex-col leading-tight">
                      <span class="font-mono-tab text-[12.5px] font-medium" :style="{ color: brand.colors.text }">{{ t.ticker }}</span>
                      <span class="text-[10.5px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }">{{ t.name }}</span>
                    </div>
                  </div>
                </td>
                <td class="td">
                  <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 70%, transparent)`, lineHeight: 1.5 }">{{ t.thesis }}</span>
                </td>
                <td class="td">
                  <span
                    class="rounded-md px-2 py-0.5 font-mono-tab text-[10px] font-medium uppercase"
                    :style="{
                      letterSpacing: '0.14em',
                      backgroundColor: `color-mix(in srgb, ${thesisStatusColor(t.status)} 14%, transparent)`,
                      color: thesisStatusColor(t.status),
                    }"
                  >{{ thesisStatusLabel(t.status) }}</span>
                </td>
                <td class="td td-num">{{ t.pl ?? '—' }}</td>
                <td class="td td-num">{{ t.pvp ?? '—' }}</td>
                <td class="td td-num">{{ t.roe ? t.roe + '%' : '—' }}</td>
                <td class="td td-num" :style="{ color: t.var12m >= 0 ? brand.colors.positive : brand.colors.negative }">{{ formatPct(t.var12m) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>

    <!-- ============ Stress test ============ -->
    <section class="flex flex-col gap-5">
      <SectionHeading
        :brand="brand"
        eyebrow="Stress test"
        title="Como sua carteira reage em 4 cenários adversos"
      />
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="s in STRESS_SCENARIOS"
          :key="s.name"
          class="flex flex-col gap-2 rounded-xl border p-5"
          :style="cardStyle"
        >
          <span class="font-mono-tab text-[10.5px] font-medium uppercase" :style="{ letterSpacing: '0.16em', color: brand.colors.primary }">Cenário</span>
          <h3 class="text-[15px] font-medium" :style="{ color: brand.colors.text }">{{ s.name }}</h3>
          <div
            class="font-mono-tab text-[24px] font-light tabular-nums"
            :style="{
              color: s.change_pct >= 0 ? brand.colors.positive : brand.colors.negative,
              letterSpacing: '-0.4px',
            }"
          >{{ formatPct(s.change_pct) }}</div>
          <p class="text-[11.5px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ s.note }}</p>
        </article>
      </div>
    </section>

    <!-- ============ Benchmark comparison ============ -->
    <section class="flex flex-col gap-5">
      <SectionHeading
        :brand="brand"
        eyebrow="Performance · 12 meses"
        title="Sua carteira contra os benchmarks"
      />
      <article class="flex flex-col gap-4 rounded-xl border p-6" :style="cardStyle">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div
            v-for="b in BENCHMARKS"
            :key="b.label"
            class="flex flex-col gap-1.5 rounded-lg p-3"
            :style="{
              border: b.label === 'Sua carteira'
                ? `1px solid color-mix(in srgb, ${brand.colors.primary} 30%, transparent)`
                : `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
              backgroundColor: b.label === 'Sua carteira'
                ? `color-mix(in srgb, ${brand.colors.primary} 6%, transparent)`
                : 'transparent',
            }"
          >
            <span class="font-mono-tab text-[10px] font-medium uppercase" :style="{ letterSpacing: '0.16em', color: b.color }">{{ b.label }}</span>
            <div
              class="font-mono-tab text-[20px] font-light tabular-nums"
              :style="{
                color: b.return_12m_pct >= 0 ? brand.colors.positive : brand.colors.negative,
                letterSpacing: '-0.3px',
              }"
            >{{ formatPct(b.return_12m_pct) }}</div>
          </div>
        </div>

        <!-- Faux line chart -->
        <svg viewBox="0 0 600 180" class="h-44 w-full">
          <g v-for="b in BENCHMARKS" :key="b.label">
            <path
              :d="b.label === 'Sua carteira'
                ? 'M0,160 L50,150 L100,140 L150,120 L200,125 L250,110 L300,95 L350,90 L400,75 L450,70 L500,55 L550,50 L600,42'
                : b.label === 'CDI'
                  ? 'M0,160 L50,156 L100,152 L150,148 L200,144 L250,140 L300,136 L350,132 L400,128 L450,124 L500,120 L550,115 L600,110'
                  : b.label === 'IBOV'
                    ? 'M0,160 L50,155 L100,162 L150,150 L200,140 L250,135 L300,130 L350,125 L400,118 L450,128 L500,114 L550,118 L600,108'
                    : b.label === 'IFIX'
                      ? 'M0,160 L50,162 L100,158 L150,165 L200,168 L250,164 L300,170 L350,172 L400,168 L450,170 L500,174 L550,172 L600,178'
                      : 'M0,160 L50,148 L100,138 L150,128 L200,118 L250,108 L300,95 L350,82 L400,68 L450,55 L500,42 L550,30 L600,18'"
              :stroke="b.color"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              :stroke-dasharray="b.label === 'Sua carteira' ? 'none' : '3 3'"
              opacity="0.85"
            />
          </g>
        </svg>
      </article>
    </section>

    <!-- ============ Macro exposure ============ -->
    <section class="flex flex-col gap-5">
      <SectionHeading
        :brand="brand"
        eyebrow="Sensibilidade macro"
        title="Como sua carteira reage a fatores externos"
      />
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="m in macroFactors"
          :key="m.label"
          class="flex flex-col gap-2 rounded-xl border p-5"
          :style="cardStyle"
        >
          <div class="flex items-center gap-2">
            <UIcon :name="m.icon" class="size-4" :style="{ color: m.tint }" />
            <span class="text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ m.label }}</span>
          </div>
          <div class="flex items-baseline gap-2">
            <span
              class="font-mono-tab text-[10.5px] font-medium uppercase"
              :style="{
                letterSpacing: '0.16em',
                color: m.sensitivity === 'baixa'
                  ? brand.colors.positive
                  : m.sensitivity === 'média'
                    ? brand.colors.warning || '#f59e0b'
                    : brand.colors.negative,
              }"
            >Sensibilidade {{ m.sensitivity }}</span>
          </div>
          <p class="text-[11.5px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ m.note }}</p>
        </article>
      </div>
    </section>

    <!-- ============ Strengths + Risks + Recommendations ============ -->
    <section class="flex flex-col gap-5">
      <SectionHeading
        :brand="brand"
        eyebrow="Diagnóstico"
        title="Pontos fortes, riscos e o caminho à frente"
      />
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article class="flex flex-col gap-3 rounded-xl border p-5" :style="strengthCardStyle">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-circle-check" class="size-4" :style="{ color: brand.colors.positive }" />
            <span class="font-mono-tab text-[10.5px] font-medium uppercase" :style="{ letterSpacing: '0.18em', color: brand.colors.positive }">Pontos fortes ({{ STRENGTHS.length }})</span>
          </div>
          <ul class="flex flex-col gap-3">
            <li v-for="s in STRENGTHS" :key="s.title" class="flex flex-col gap-0.5">
              <span class="text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ s.title }}</span>
              <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ s.body }}</span>
            </li>
          </ul>
        </article>

        <article class="flex flex-col gap-3 rounded-xl border p-5" :style="warnCardStyle">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-alert-triangle" class="size-4" :style="{ color: brand.colors.warning || '#f59e0b' }" />
            <span class="font-mono-tab text-[10.5px] font-medium uppercase" :style="{ letterSpacing: '0.18em', color: brand.colors.warning || '#f59e0b' }">Riscos ({{ RISKS.length }})</span>
          </div>
          <ul class="flex flex-col gap-3">
            <li v-for="r in RISKS" :key="r.title" class="flex flex-col gap-0.5">
              <div class="flex items-center gap-2">
                <span class="text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ r.title }}</span>
                <span
                  class="rounded px-1.5 py-0.5 font-mono-tab text-[9px] font-medium uppercase"
                  :style="{
                    letterSpacing: '0.14em',
                    backgroundColor: `color-mix(in srgb, ${severityColor(r.severity)} 14%, transparent)`,
                    color: severityColor(r.severity),
                  }"
                >{{ r.severity }}</span>
              </div>
              <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ r.body }}</span>
            </li>
          </ul>
        </article>

        <article class="flex flex-col gap-3 rounded-xl border p-5" :style="cardStyle">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-sparkles" class="size-4" :style="{ color: brand.colors.primary }" />
            <span class="font-mono-tab text-[10.5px] font-medium uppercase" :style="{ letterSpacing: '0.18em', color: brand.colors.primary }">Próximos passos</span>
          </div>
          <ul class="flex flex-col gap-3">
            <li v-for="r in RECOMMENDATIONS" :key="r.title" class="flex flex-col gap-0.5">
              <span class="text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ r.title }}</span>
              <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ r.body }}</span>
            </li>
          </ul>
          <button
            type="button"
            class="mt-2 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium"
            :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
          >
            <UIcon name="i-lucide-sparkles" class="size-3.5" />
            Discutir no chat
          </button>
        </article>
      </div>
    </section>

    <!-- ============ DE/PARA suggestions ============ -->
    <section class="flex flex-col gap-5">
      <SectionHeading
        :brand="brand"
        eyebrow="Considerações"
        title="Alternativas que melhorariam o equilíbrio"
        lead="Sugestões automatizadas com base na sua tese atual. São pontos de partida pra discussão, não recomendações de compra."
      />
      <article class="overflow-hidden rounded-xl border" :style="cardStyle">
        <ul>
          <li
            v-for="(alt, i) in alternatives"
            :key="alt.from + alt.to"
            class="grid items-center gap-4 px-5 py-4 md:grid-cols-[1fr_auto_1fr_auto]"
            :style="{ borderBottom: i < alternatives.length - 1 ? `1px solid color-mix(in srgb, ${brand.colors.border} 25%, transparent)` : 'none' }"
          >
            <div class="flex items-center gap-2.5">
              <span class="font-mono-tab text-[10px] font-medium uppercase" :style="{ letterSpacing: '0.16em', color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }">DE</span>
              <span class="font-mono-tab text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ alt.from }}</span>
              <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">{{ alt.fromName }}</span>
            </div>
            <UIcon name="i-lucide-arrow-right" class="size-4" :style="{ color: brand.colors.primary }" />
            <div class="flex items-center gap-2.5">
              <span class="font-mono-tab text-[10px] font-medium uppercase" :style="{ letterSpacing: '0.16em', color: brand.colors.primary }">PARA</span>
              <span class="font-mono-tab text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ alt.to }}</span>
              <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">{{ alt.toName }}</span>
            </div>
            <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ alt.reason }}</span>
          </li>
        </ul>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  SCORE_DIMENSIONS,
  STRESS_SCENARIOS,
  BENCHMARKS,
  STRENGTHS,
  RISKS,
  RECOMMENDATIONS,
  formatPct,
} from './MockData'

const brand = useBrand()

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))
const strengthCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.positive} 5%, ${brand.colors.surface})`,
  borderColor: `color-mix(in srgb, ${brand.colors.positive} 22%, transparent)`,
}))
const warnCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.warning || '#f59e0b'} 5%, ${brand.colors.surface})`,
  borderColor: `color-mix(in srgb, ${brand.colors.warning || '#f59e0b'} 22%, transparent)`,
}))

function dimensionColor(value: number): string {
  if (value >= 75) return brand.colors.positive
  if (value >= 50) return brand.colors.warning || '#f59e0b'
  return brand.colors.negative
}
function severityColor(s: 'low' | 'medium' | 'high'): string {
  return s === 'high' ? brand.colors.negative
       : s === 'medium' ? (brand.colors.warning || '#f59e0b')
       : brand.colors.primary
}

const thesisRows = [
  { ticker: 'BBSE3', name: 'BB Seguridade', thesis: 'Líder em corretagem com payout >85%. ROE consistente acima de 25%.', status: 'maintained' as const, pl: '7,8', pvp: '2,1', roe: 28, var12m: 19.85, tint: '#facc15' },
  { ticker: 'ITSA4', name: 'Itaúsa', thesis: 'Holding com Itaú + diversificação. Desconto holding em torno de 18%.', status: 'maintained' as const, pl: '6,4', pvp: '0,9', roe: 17, var12m: 25.3, tint: '#f97316' },
  { ticker: 'PETR4', name: 'Petrobras', thesis: 'Caixa abundante + DY pesado. Preço do petróleo + governo são variáveis-chave.', status: 'at-risk' as const, pl: '4,5', pvp: '1,2', roe: 28, var12m: 23.4, tint: '#fbbf24' },
  { ticker: 'CPTS11', name: 'Capitânia Securities', thesis: 'FII de papel CRI alto-grade. Pressão de juros cíclica, mas yield 11,8%.', status: 'weakened' as const, pl: null, pvp: '0,84', roe: null, var12m: -7.67, tint: '#60a5fa' },
  { ticker: 'GARE11', name: 'Guardian RE', thesis: 'Híbrido tijolo+CRI. Vacância controlada, mas cota descontada.', status: 'weakened' as const, pl: null, pvp: '0,82', roe: null, var12m: -9.04, tint: '#34d399' },
  { ticker: 'FLRY3', name: 'Fleury', thesis: 'Diagnóstico em consolidação. Margens pressionadas pós-fusão Hermes.', status: 'broken' as const, pl: '14,5', pvp: '1,8', roe: 11, var12m: -12.53, tint: '#a78bfa' },
] as const

function thesisStatusLabel(s: string): string {
  switch (s) {
    case 'maintained': return 'Saudável'
    case 'at-risk': return 'Em risco'
    case 'weakened': return 'Pressionada'
    case 'broken': return 'Quebrada'
    default: return s
  }
}
function thesisStatusColor(s: string): string {
  switch (s) {
    case 'maintained': return brand.colors.positive
    case 'at-risk': return brand.colors.warning || '#f59e0b'
    case 'weakened': return '#fb923c'
    case 'broken': return brand.colors.negative
    default: return brand.colors.text
  }
}

const macroFactors = [
  { label: 'Selic / juros', icon: 'i-lucide-trending-up', tint: '#fbbf24', sensitivity: 'média' as const, note: 'Bancos e seguros se beneficiam de juros altos. FIIs sofrem. Tesouro IPCA+ marca-a-mercado oscila.' },
  { label: 'Inflação (IPCA)', icon: 'i-lucide-flame', tint: '#fb923c', sensitivity: 'baixa' as const, note: 'Tesouro IPCA+ blinda 18% da carteira contra inflação. Empresas com poder de repasse (BB, Petrobras) também ajudam.' },
  { label: 'Câmbio (USD/BRL)', icon: 'i-lucide-globe', tint: '#a78bfa', sensitivity: 'alta' as const, note: 'Apenas 1,8% em GOLD11 protege contra desvalorização do real. Carteira sofreria em crise cambial.' },
  { label: 'Commodities', icon: 'i-lucide-zap', tint: '#34d399', sensitivity: 'média' as const, note: 'PETR4 + VALE3 + PRIO3 + ITSA4 (via Alpargatas) representam ~10%. Ciclo positivo ajuda.' },
] as const

const alternatives = [
  { from: 'AUPO11', fromName: 'BTG Teva ETF (10,7%)', to: 'NTNB-Curto + LCI', toName: 'Diversificação emissor', reason: 'AUPO11 sozinho representa 10,7% via um único gestor. Diversificar entre Tesouro IPCA+ curto e LCI mantém yield e reduz risco de gestor.' },
  { from: 'CPTS11', fromName: 'Capitânia (3,3%)', to: 'KNCR11', toName: 'Kinea CRI', reason: 'Mesmo perfil (CRI papel) com gestor mais consolidado e DY similar. Migração ao longo de 6 meses.' },
  { from: '0% USD', fromName: 'Zero exposição', to: 'IVVB11 (até 8%)', toName: 'iShares S&P 500', reason: 'Aporte gradual em IVVB11 traz hedge cambial + acesso ao S&P 500. 8% é o teto sugerido pra teu perfil de renda.' },
] as const
</script>

<style scoped>
.th {
  padding: 10px 16px;
  text-align: left;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.th-num {
  text-align: right;
}
.td {
  padding: 12px 16px;
  font-size: 12.5px;
  color: var(--brand-text);
}
.td-num {
  text-align: right;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
}
</style>
