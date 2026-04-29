<!--
  /wallet/raio-x — deep portfolio diagnosis driven by the
  AI-generated snapshot saved by chat-service (Phase 4).

  Behavior:
    - On mount, fetches `GET /api/portfolio/analysis` via
      `useWalletDataService().getPortfolioAnalysis()`.
    - If null (404 / never analyzed): renders the "primeiro raio-x"
      empty state with a CTA to /help?intent=analyze-portfolio.
    - If a snapshot exists: renders the full surface (gauge + 9
      dimensions, per-asset thesis table, stress test, macro
      sensitivity, strengths/risks/recommendations, DE/PARA).
    - Sticky "Reanalisar" CTA top-right links back to the chat
      with `?intent=reanalyze-portfolio`. The `generated_at`
      timestamp sits next to it so the user knows how fresh the
      data is.

  Live data (current prices, dividend forecast, benchmarks) still
  flow through `usePortfolioScore.analyzePortfolio()` below the
  fold so the page never shows stale market numbers — the AI
  snapshot is for diagnostic narrative, not real-time quotes.
-->
<template>
  <NuxtLayout title="Raio-X da carteira">
    <div :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }">
      <!-- Loading skeleton -->
      <div v-if="loading" class="flex items-center justify-center py-32">
        <UIcon name="i-lucide-loader-2" class="size-8 motion-safe:animate-spin" :style="{ color: brand.colors.primary }" />
      </div>

      <!-- Empty state: never analyzed -->
      <div v-else-if="!analysis" class="mx-auto flex max-w-3xl flex-col items-center gap-8 px-6 py-20 text-center">
        <span
          class="font-mono-tab text-[11px] font-medium uppercase"
          :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
        >Raio-X · Análise profunda</span>
        <h1
          class="font-light"
          :style="{
            color: brand.colors.text,
            fontSize: 'clamp(32px, 5vw, 44px)',
            lineHeight: 1.05,
            letterSpacing: '-1.2px',
          }"
        >Cadê seu raio-x?</h1>
        <p
          class="max-w-md"
          :style="{
            fontSize: '17px',
            lineHeight: 1.55,
            color: `color-mix(in srgb, ${brand.colors.text} 72%, transparent)`,
          }"
        >Pra montar a análise profunda da sua carteira, eu preciso rodar o pipeline de IA primeiro. Demora cerca de 30 segundos.</p>

        <div class="flex flex-wrap items-center justify-center gap-3">
          <NuxtLink
            to="/help?intent=analyze-portfolio"
            class="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-[14px] font-medium"
            :style="{
              backgroundColor: brand.colors.primary,
              color: brand.colors.background,
              boxShadow: `0 12px 24px -10px color-mix(in srgb, ${brand.colors.primary} 70%, transparent), 0 4px 10px -6px rgba(0,0,0,0.10)`,
            }"
          >
            <UIcon name="i-lucide-sparkles" class="size-4" />
            Rodar análise
            <UIcon name="i-lucide-arrow-up-right" class="size-3.5 opacity-80" />
          </NuxtLink>
          <a
            href="#preview-sections"
            class="inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-[14px] font-medium"
            :style="{
              borderColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)`,
              color: brand.colors.text,
            }"
          >
            <UIcon name="i-lucide-list" class="size-4" />
            O que vai aparecer
          </a>
        </div>

        <section
          id="preview-sections"
          class="mt-6 grid w-full grid-cols-1 gap-4 md:grid-cols-3"
        >
          <article
            v-for="card in previewSections"
            :key="card.title"
            class="flex flex-col gap-3 rounded-xl border p-5 text-left"
            :style="cardStyle"
          >
            <span
              class="flex size-9 items-center justify-center rounded-lg"
              :style="{ backgroundColor: `color-mix(in srgb, ${card.tint} 14%, transparent)` }"
            >
              <UIcon :name="card.icon" class="size-5" :style="{ color: card.tint }" />
            </span>
            <span
              class="font-mono-tab text-[10.5px] font-medium uppercase"
              :style="{ letterSpacing: '0.18em', color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
            >Seção</span>
            <h3 class="text-[16px] font-medium" :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }">{{ card.title }}</h3>
            <p class="text-[13px]" :style="{ lineHeight: 1.55, color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)` }">{{ card.body }}</p>
          </article>
        </section>
      </div>

      <!-- Populated raio-x -->
      <div v-else class="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12">
        <!-- Header + sticky reanalisar CTA -->
        <header class="flex flex-wrap items-start justify-between gap-4">
          <div class="flex flex-col gap-1">
            <span
              class="font-mono-tab text-[11px] font-medium uppercase"
              :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
            >Raio-X · Análise da carteira</span>
            <h1
              class="font-light"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(32px, 4.5vw, 48px)',
                lineHeight: 1.05,
                letterSpacing: '-1px',
              }"
            >Diagnóstico profundo, com dados reais.</h1>
          </div>
          <div class="flex flex-col items-end gap-1.5">
            <NuxtLink
              to="/help?intent=reanalyze-portfolio"
              class="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[12.5px] font-medium transition-[background-color]"
              :style="{
                borderColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)`,
                color: brand.colors.text,
                backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
              }"
            >
              <UIcon name="i-lucide-refresh-cw" class="size-3.5" />
              Reanalisar
            </NuxtLink>
            <span
              v-if="generatedLabel"
              class="font-mono-tab text-[10.5px]"
              :style="{ letterSpacing: '0.06em', color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
            >{{ generatedLabel }}</span>
          </div>
        </header>

        <!-- Hero: score gauge + 9 dimensions -->
        <section class="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
          <article
            class="relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border p-8"
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

            <svg viewBox="0 0 200 120" class="relative h-32 w-full max-w-xs">
              <defs>
                <linearGradient id="raio-x-gauge" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" :stop-color="brand.colors.negative" />
                  <stop offset="50%" :stop-color="brand.colors.warning || '#f59e0b'" />
                  <stop offset="100%" :stop-color="brand.colors.positive" />
                </linearGradient>
              </defs>
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                :stroke="`color-mix(in srgb, ${brand.colors.text} 8%, transparent)`"
                stroke-width="14"
                stroke-linecap="round"
              />
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#raio-x-gauge)"
                stroke-width="14"
                stroke-linecap="round"
                stroke-dasharray="251.33"
                :stroke-dashoffset="(1 - clampedScore / 100) * 251.33"
              />
            </svg>

            <div class="relative flex flex-col items-center gap-1">
              <div class="flex items-baseline gap-1">
                <span
                  class="font-mono-tab text-[60px] font-light leading-none tabular-nums"
                  :style="{ color: brand.colors.text, letterSpacing: '-0.04em' }"
                >{{ clampedScore }}</span>
                <span class="text-[14px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }">/100</span>
              </div>
              <span
                class="rounded-md px-2 py-0.5 font-mono-tab text-[10.5px] font-medium uppercase"
                :style="{
                  letterSpacing: '0.18em',
                  backgroundColor: `color-mix(in srgb, ${bandColor} 14%, transparent)`,
                  color: bandColor,
                }"
              >{{ bandLabel }}</span>
            </div>

            <p
              v-if="analysis.summary_md"
              class="relative mt-2 max-w-xs text-center text-[12.5px]"
              :style="{ color: `color-mix(in srgb, ${brand.colors.text} 70%, transparent)`, lineHeight: 1.55 }"
            >{{ analysis.summary_md }}</p>
          </article>

          <article class="flex flex-col gap-4 rounded-2xl border p-6" :style="cardStyle">
            <SectionHeading
              :brand="brand"
              eyebrow="9 dimensões"
              title="Como cada eixo da sua carteira está pontuando"
              size="md"
            />
            <ul v-if="analysis.dimensions?.length" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <li v-for="d in analysis.dimensions" :key="d.key" class="flex flex-col gap-1.5">
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
                    :style="{ width: Math.max(0, Math.min(100, d.value)) + '%', backgroundColor: dimensionColor(d.value) }"
                  />
                </div>
                <span
                  v-if="d.note"
                  class="text-[10.5px]"
                  :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)`, lineHeight: 1.4 }"
                >{{ d.note }}</span>
              </li>
            </ul>
            <p v-else class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">Sem dimensões registradas neste snapshot.</p>
          </article>
        </section>

        <!-- Per-asset thesis -->
        <section v-if="analysis.thesis_per_asset?.length" class="flex flex-col gap-5">
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
                    v-for="t in analysis.thesis_per_asset"
                    :key="t.ticker"
                    :style="{ borderBottom: `1px solid color-mix(in srgb, ${brand.colors.border} 25%, transparent)` }"
                  >
                    <td class="td">
                      <div class="flex items-center gap-2.5">
                        <span
                          class="flex size-7 shrink-0 items-center justify-center rounded-md font-mono-tab text-[10px] font-medium"
                          :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 18%, transparent)`, color: brand.colors.primary }"
                        >{{ t.ticker.slice(0, 4) }}</span>
                        <div class="flex flex-col leading-tight">
                          <span class="font-mono-tab text-[12.5px] font-medium" :style="{ color: brand.colors.text }">{{ t.ticker }}</span>
                          <span
                            v-if="t.metrics?.name"
                            class="text-[10.5px]"
                            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
                          >{{ t.metrics.name }}</span>
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
                    <td class="td td-num">{{ t.metrics?.pl ?? '—' }}</td>
                    <td class="td td-num">{{ t.metrics?.pvp ?? '—' }}</td>
                    <td class="td td-num">{{ t.metrics?.roe != null ? `${t.metrics.roe}%` : '—' }}</td>
                    <td
                      class="td td-num"
                      :style="{ color: (t.metrics?.var12m ?? 0) >= 0 ? brand.colors.positive : brand.colors.negative }"
                    >{{ t.metrics?.var12m != null ? formatPctSigned(t.metrics.var12m) : '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <!-- Stress test -->
        <section v-if="analysis.stress_scenarios?.length" class="flex flex-col gap-5">
          <SectionHeading
            :brand="brand"
            eyebrow="Stress test"
            title="Como sua carteira reage em cenários adversos"
          />
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article
              v-for="s in analysis.stress_scenarios"
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
              >{{ formatPctSigned(s.change_pct) }}</div>
              <p class="text-[11.5px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ s.note }}</p>
            </article>
          </div>
        </section>

        <!-- Live performance vs benchmarks (kept from usePortfolioScore) -->
        <section v-if="liveBenchmarks.length" class="flex flex-col gap-5">
          <SectionHeading
            :brand="brand"
            eyebrow="Performance · 12 meses"
            title="Sua carteira contra os benchmarks (live)"
            lead="Os números acima vêm da análise da IA. Estes aqui são puxados direto dos preços de mercado."
          />
          <article class="flex flex-col gap-4 rounded-xl border p-6" :style="cardStyle">
            <div class="grid grid-cols-1 gap-3 md:grid-cols-5">
              <div
                v-for="b in liveBenchmarks"
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
                <span
                  class="font-mono-tab text-[10px] font-medium uppercase"
                  :style="{ letterSpacing: '0.16em', color: brand.colors.primary }"
                >{{ b.label }}</span>
                <div
                  class="font-mono-tab text-[20px] font-light tabular-nums"
                  :style="{
                    color: b.return_12m_pct >= 0 ? brand.colors.positive : brand.colors.negative,
                    letterSpacing: '-0.3px',
                  }"
                >{{ formatPctSigned(b.return_12m_pct) }}</div>
              </div>
            </div>
          </article>
        </section>

        <!-- Macro sensitivity -->
        <section v-if="analysis.macro_factors?.length" class="flex flex-col gap-5">
          <SectionHeading
            :brand="brand"
            eyebrow="Sensibilidade macro"
            title="Como sua carteira reage a fatores externos"
          />
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <article
              v-for="m in analysis.macro_factors"
              :key="m.label"
              class="flex flex-col gap-2 rounded-xl border p-5"
              :style="cardStyle"
            >
              <div class="flex items-center gap-2">
                <UIcon :name="macroIcon(m.label)" class="size-4" :style="{ color: brand.colors.primary }" />
                <span class="text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ m.label }}</span>
              </div>
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
              <p class="text-[11.5px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ m.note }}</p>
            </article>
          </div>
        </section>

        <!-- Strengths / Risks / Recommendations -->
        <section
          v-if="analysis.strengths?.length || analysis.risks?.length || analysis.recommendations?.length"
          class="flex flex-col gap-5"
        >
          <SectionHeading
            :brand="brand"
            eyebrow="Diagnóstico"
            title="Pontos fortes, riscos e o caminho à frente"
          />
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <article class="flex flex-col gap-3 rounded-xl border p-5" :style="strengthCardStyle">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-circle-check" class="size-4" :style="{ color: brand.colors.positive }" />
                <span
                  class="font-mono-tab text-[10.5px] font-medium uppercase"
                  :style="{ letterSpacing: '0.18em', color: brand.colors.positive }"
                >Pontos fortes ({{ analysis.strengths?.length || 0 }})</span>
              </div>
              <ul v-if="analysis.strengths?.length" class="flex flex-col gap-3">
                <li v-for="s in analysis.strengths" :key="s.title" class="flex flex-col gap-0.5">
                  <span class="text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ s.title }}</span>
                  <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ s.body }}</span>
                </li>
              </ul>
              <p v-else class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">Nada destacado neste snapshot.</p>
            </article>

            <article class="flex flex-col gap-3 rounded-xl border p-5" :style="warnCardStyle">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-alert-triangle" class="size-4" :style="{ color: warnColor }" />
                <span
                  class="font-mono-tab text-[10.5px] font-medium uppercase"
                  :style="{ letterSpacing: '0.18em', color: warnColor }"
                >Riscos ({{ analysis.risks?.length || 0 }})</span>
              </div>
              <ul v-if="analysis.risks?.length" class="flex flex-col gap-3">
                <li v-for="r in analysis.risks" :key="r.title" class="flex flex-col gap-0.5">
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
              <p v-else class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">Sem riscos detectados.</p>
            </article>

            <article class="flex flex-col gap-3 rounded-xl border p-5" :style="cardStyle">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-sparkles" class="size-4" :style="{ color: brand.colors.primary }" />
                <span
                  class="font-mono-tab text-[10.5px] font-medium uppercase"
                  :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
                >Próximos passos</span>
              </div>
              <ul v-if="analysis.recommendations?.length" class="flex flex-col gap-3">
                <li v-for="r in analysis.recommendations" :key="r.title" class="flex flex-col gap-0.5">
                  <span class="text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ r.title }}</span>
                  <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ r.body }}</span>
                </li>
              </ul>
              <p v-else class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">Sem recomendações novas.</p>
              <NuxtLink
                to="/help?intent=portfolio-review"
                class="mt-2 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium"
                :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
              >
                <UIcon name="i-lucide-sparkles" class="size-3.5" />
                Discutir no chat
              </NuxtLink>
            </article>
          </div>
        </section>

        <!-- DE/PARA suggestions -->
        <section v-if="analysis.alternatives?.length" class="flex flex-col gap-5">
          <SectionHeading
            :brand="brand"
            eyebrow="Considerações"
            title="Alternativas que melhorariam o equilíbrio"
            lead="Sugestões geradas pela IA com base na sua tese atual. São pontos de partida pra discussão, não recomendações de compra."
          />
          <article class="overflow-hidden rounded-xl border" :style="cardStyle">
            <ul>
              <li
                v-for="(alt, i) in analysis.alternatives"
                :key="`${alt.from}-${alt.to}-${i}`"
                class="grid items-center gap-4 px-5 py-4 md:grid-cols-[1fr_auto_1fr_auto]"
                :style="{ borderBottom: i < analysis.alternatives.length - 1 ? `1px solid color-mix(in srgb, ${brand.colors.border} 25%, transparent)` : 'none' }"
              >
                <div class="flex items-center gap-2.5">
                  <span class="font-mono-tab text-[10px] font-medium uppercase" :style="{ letterSpacing: '0.16em', color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }">DE</span>
                  <span class="font-mono-tab text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ alt.from }}</span>
                </div>
                <UIcon name="i-lucide-arrow-right" class="size-4" :style="{ color: brand.colors.primary }" />
                <div class="flex items-center gap-2.5">
                  <span class="font-mono-tab text-[10px] font-medium uppercase" :style="{ letterSpacing: '0.16em', color: brand.colors.primary }">PARA</span>
                  <span class="font-mono-tab text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ alt.to }}</span>
                </div>
                <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ alt.reason }}</span>
              </li>
            </ul>
          </article>
        </section>

        <!-- Footer back-link -->
        <footer class="flex items-center justify-between gap-4 pt-4">
          <NuxtLink
            to="/wallet"
            class="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-[13px] font-medium"
            :style="{
              borderColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)`,
              color: brand.colors.text,
            }"
          >
            <UIcon name="i-lucide-arrow-left" class="size-4" />
            Voltar para a carteira
          </NuxtLink>
          <span
            v-if="analysis.tier_used"
            class="font-mono-tab text-[10.5px] uppercase"
            :style="{ letterSpacing: '0.16em', color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
          >Análise · Redentia {{ analysis.tier_used === 'max' ? 'MAX' : 'Basic' }}</span>
        </footer>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { PortfolioAnalysis } from '~/services/walletData'
import type { UnifiedPosition } from '~/services/portfolio'
import { analyzePortfolio, type PortfolioReport } from '~/composables/usePortfolioScore'

definePageMeta({ layout: 'default' })

usePageSeo({
  title: 'Raio-X da carteira',
  description: 'Diagnóstico profundo da sua carteira: score, dimensões, stress test, alternativas.',
  path: '/wallet/raio-x',
  robots: 'noindex,nofollow',
})

const brand = useBrand()
const wallet = useWalletDataService()

const loading = ref(true)
const analysis = ref<PortfolioAnalysis | null>(null)
const positions = ref<UnifiedPosition[]>([])

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))
const strengthCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.positive} 5%, ${brand.colors.surface})`,
  borderColor: `color-mix(in srgb, ${brand.colors.positive} 22%, transparent)`,
}))
const warnColor = computed(() => (brand.colors as { warning?: string }).warning || '#f59e0b')
const warnCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${warnColor.value} 5%, ${brand.colors.surface})`,
  borderColor: `color-mix(in srgb, ${warnColor.value} 22%, transparent)`,
}))

const previewSections = [
  {
    title: 'Score 0-100 + 9 dimensões',
    body: 'Diversificação, qualidade, renda, hedge cambial, volatilidade, macro. Cada eixo com explicação curta.',
    icon: 'i-lucide-radar',
    tint: '#fbbf24',
  },
  {
    title: 'Tese por ativo',
    body: 'Cada posição classificada como saudável, em risco, pressionada ou quebrada, com fundamentos chave.',
    icon: 'i-lucide-target',
    tint: '#a78bfa',
  },
  {
    title: 'Stress, macro e DE/PARA',
    body: 'Como a carteira reage em cenários adversos, sensibilidade a Selic/IPCA/USD e alternativas de troca.',
    icon: 'i-lucide-shield-check',
    tint: '#34d399',
  },
] as const

// Score band → color/label mapping (uses snapshot's score_band when present).
const clampedScore = computed(() => {
  const s = analysis.value?.score ?? 0
  return Math.max(0, Math.min(100, Math.round(s)))
})
const bandLabel = computed(() => {
  const band = analysis.value?.score_band
  switch (band) {
    case 'critico': return 'Crítica'
    case 'atencao': return 'Atenção'
    case 'bom': return 'Boa'
    case 'excelente': return 'Excelente'
    default: return clampedScore.value >= 75 ? 'Boa' : clampedScore.value >= 50 ? 'Atenção' : 'Crítica'
  }
})
const bandColor = computed(() => {
  const band = analysis.value?.score_band
  if (band === 'excelente' || band === 'bom') return brand.colors.positive
  if (band === 'atencao') return warnColor.value
  if (band === 'critico') return brand.colors.negative
  // Fallback by raw score.
  if (clampedScore.value >= 75) return brand.colors.positive
  if (clampedScore.value >= 50) return warnColor.value
  return brand.colors.negative
})

const generatedLabel = computed(() => {
  const iso = analysis.value?.generated_at
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return `Análise de ${date}, ${time}`
  } catch {
    return ''
  }
})

function dimensionColor(value: number): string {
  if (value >= 75) return brand.colors.positive
  if (value >= 50) return warnColor.value
  return brand.colors.negative
}
function severityColor(s: 'low' | 'medium' | 'high'): string {
  return s === 'high' ? brand.colors.negative
       : s === 'medium' ? warnColor.value
       : brand.colors.primary
}
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
    case 'at-risk': return warnColor.value
    case 'weakened': return '#fb923c'
    case 'broken': return brand.colors.negative
    default: return brand.colors.text
  }
}
function macroIcon(label: string): string {
  const l = label.toLowerCase()
  if (l.includes('selic') || l.includes('juro')) return 'i-lucide-trending-up'
  if (l.includes('ipca') || l.includes('inflaç')) return 'i-lucide-flame'
  if (l.includes('câmb') || l.includes('cambi') || l.includes('usd') || l.includes('dólar')) return 'i-lucide-globe'
  if (l.includes('commod')) return 'i-lucide-zap'
  return 'i-lucide-activity'
}
function formatPctSigned(n: number): string {
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2).replace('.', ',')}%`
}

// Live data — current prices, dividends, benchmarks. We keep the
// score engine running in parallel so the benchmarks card below
// the AI snapshot stays fresh.
const liveReport = computed<PortfolioReport | null>(() => {
  if (!positions.value.length) return null
  const totalValue = positions.value.reduce(
    (s, p) => s + (p.current_value ?? p.quantity * (p.current_price ?? p.average_price)),
    0,
  )
  if (!totalValue) return null
  const inputs = positions.value.map((p) => {
    const v = p.current_value ?? p.quantity * (p.current_price ?? p.average_price)
    return { ticker: p.ticker, weight: v }
  })
  return analyzePortfolio(inputs, brand.colors.primary)
})

const liveBenchmarks = computed(() => {
  const r = liveReport.value
  if (!r?.benchmarks?.length) return [] as { label: string; return_12m_pct: number }[]
  return r.benchmarks.slice(0, 5).map((b) => ({
    label: b.label,
    return_12m_pct: b.expected ?? 0,
  }))
})

async function loadAnalysis() {
  loading.value = true
  try {
    const [snap, pos] = await Promise.all([
      wallet.getPortfolioAnalysis(),
      wallet.getPositions(),
    ])
    analysis.value = snap
    positions.value = pos
  } finally {
    loading.value = false
  }
}

onMounted(loadAnalysis)

// MVP: refetch on returning from the chat (no SSE wiring yet).
const route = useRoute()
watch(() => route.fullPath, async (path, prev) => {
  if (prev && prev.includes('/help') && path.startsWith('/wallet/raio-x')) {
    await loadAnalysis()
  }
})
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
