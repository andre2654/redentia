<!--
  MoleculesRaioXAssetDeepDive — "ANÁLISE POR ATIVO — Cada ativo, sob a lupa"

  USADO EM:
  /raio-x apos os AI insights (parte do flow nao-auth)

  RENDERIZA:
  Card por ativo da composition com fundamentals + tese + status.
  Reusa visualmente o estilo do PortfolioDiagnosis original mas com
  visual mais polido e estrutura simplificada.

  PROPS:
  report: PortfolioReport — fonte de composition[]
-->
<script setup lang="ts">
import type { PortfolioReport } from '~/composables/usePortfolioScore'

const props = defineProps<{
  report: PortfolioReport
}>()

const brand = useBrand()

// Helpers de formatacao
function formatPercent(v: number, decimals = 1): string {
  if (!Number.isFinite(v)) return '—'
  return `${v.toFixed(decimals)}%`
}

function thesisStatusColor(status?: string): string {
  switch (status) {
    case 'forte': return brand.colors.positive
    case 'fraca':
    case 'em-risco': return brand.colors.negative
    case 'neutra':
    default: return brand.colors.primary
  }
}

function thesisStatusLabel(status?: string): string {
  switch (status) {
    case 'forte': return 'Tese forte'
    case 'fraca': return 'Tese fraca'
    case 'em-risco': return 'Em risco'
    case 'neutra': return 'Neutra'
    default: return 'Avaliando'
  }
}

function categoryLabel(category?: string): string {
  switch (category) {
    case 'acoes-br': return 'Ação BR'
    case 'fii-tijolo': return 'FII tijolo'
    case 'fii-papel': return 'FII papel'
    case 'etf-br': return 'ETF BR'
    case 'etf-intl': return 'ETF internacional'
    case 'bdr': return 'BDR'
    case 'cripto': return 'Cripto'
    case 'renda-fixa-pos': return 'Renda fixa pós'
    case 'renda-fixa-pre': return 'Renda fixa pré'
    case 'renda-fixa-ipca': return 'Renda fixa IPCA'
    default: return 'Ativo'
  }
}

const composition = computed(() => props.report.composition || [])

// Tease pattern: mostra os 3 primeiros ativos completos, o restante
// fica blureado pra reforcar "tem mais conteudo se cadastrar". Numero
// de cards visiveis e fixo (3) — abaixo disso comeca o blur.
const VISIBLE_COUNT = 3

const visibleAssets = computed(() => composition.value.slice(0, VISIBLE_COUNT))
const lockedAssets = computed(() => composition.value.slice(VISIBLE_COUNT))
const hasLocked = computed(() => lockedAssets.value.length > 0)
</script>

<template>
  <section v-if="composition.length > 0" class="rx-deep">
    <header class="rx-deep__header">
      <p class="eyebrow">ANÁLISE POR ATIVO</p>
      <h2 class="rx-deep__title">
        Cada ativo, sob a lupa.
      </h2>
    </header>

    <ul class="rx-deep__grid">
      <li
        v-for="asset in visibleAssets"
        :key="asset.ticker"
        class="rx-deep__card"
      >
        <header class="rx-deep__card-head">
          <div class="rx-deep__ticker-block">
            <span class="rx-deep__ticker">{{ asset.ticker }}</span>
            <span class="rx-deep__category">{{ categoryLabel(asset.category) }}</span>
          </div>
          <span
            class="rx-deep__thesis"
            :style="{
              color: thesisStatusColor(asset.thesisStatus),
              background: `color-mix(in srgb, ${thesisStatusColor(asset.thesisStatus)} 14%, transparent)`,
              borderColor: `color-mix(in srgb, ${thesisStatusColor(asset.thesisStatus)} 30%, transparent)`,
            }"
          >
            {{ thesisStatusLabel(asset.thesisStatus) }}
          </span>
        </header>

        <p class="rx-deep__name">{{ asset.name }}</p>

        <ul class="rx-deep__metrics">
          <li v-if="asset.fundamentals?.pl !== undefined">
            <span>P/L</span>
            <strong>{{ asset.fundamentals.pl.toFixed(1) }}</strong>
          </li>
          <li v-if="asset.fundamentals?.pvp !== undefined">
            <span>P/VP</span>
            <strong>{{ asset.fundamentals.pvp.toFixed(2) }}</strong>
          </li>
          <li v-if="asset.fundamentals?.roe !== undefined">
            <span>ROE</span>
            <strong
              :style="{
                color: asset.fundamentals.roe < 0
                  ? brand.colors.negative
                  : asset.fundamentals.roe > 15
                    ? brand.colors.positive
                    : 'var(--text-heading)'
              }"
            >{{ formatPercent(asset.fundamentals.roe) }}</strong>
          </li>
          <li v-if="asset.dy > 0">
            <span>DY</span>
            <strong
              :style="{
                color: asset.dy > 8 ? brand.colors.positive : 'var(--text-heading)'
              }"
            >{{ formatPercent(asset.dy) }}</strong>
          </li>
          <li v-if="asset.fundamentals?.netDebtEbitda !== undefined">
            <span>Dív/EBITDA</span>
            <strong
              :style="{
                color: asset.fundamentals.netDebtEbitda > 3
                  ? brand.colors.negative
                  : asset.fundamentals.netDebtEbitda < 1
                    ? brand.colors.positive
                    : 'var(--text-heading)'
              }"
            >{{ asset.fundamentals.netDebtEbitda.toFixed(1) }}</strong>
          </li>
          <li v-if="asset.fundamentals?.payout !== undefined">
            <span>Payout</span>
            <strong>{{ formatPercent(asset.fundamentals.payout, 0) }}</strong>
          </li>
          <li v-if="asset.fundamentals?.vacancia !== undefined">
            <span>Vacância</span>
            <strong
              :style="{
                color: asset.fundamentals.vacancia > 8 ? brand.colors.negative : 'var(--text-heading)'
              }"
            >{{ formatPercent(asset.fundamentals.vacancia) }}</strong>
          </li>
          <li v-if="asset.fundamentals?.pVpa !== undefined">
            <span>P/VPA</span>
            <strong>{{ asset.fundamentals.pVpa.toFixed(2) }}</strong>
          </li>
          <li v-if="asset.fundamentals?.earningsCagr5y !== undefined">
            <span>CAGR 5Y</span>
            <strong
              :style="{
                color: asset.fundamentals.earningsCagr5y < 0
                  ? brand.colors.negative
                  : asset.fundamentals.earningsCagr5y > 15
                    ? brand.colors.positive
                    : 'var(--text-heading)'
              }"
            >{{ asset.fundamentals.earningsCagr5y > 0 ? '+' : '' }}{{ formatPercent(asset.fundamentals.earningsCagr5y) }}</strong>
          </li>
          <li v-if="typeof asset.beta === 'number'">
            <span>Beta</span>
            <strong>{{ asset.beta.toFixed(2) }}</strong>
          </li>
          <li>
            <span>Peso</span>
            <strong :style="{ color: brand.colors.primary }">
              {{ formatPercent(asset.weight * 100, 0) }}
            </strong>
          </li>
        </ul>

        <p v-if="asset.thesisNote" class="rx-deep__note">
          {{ asset.thesisNote }}
        </p>
      </li>
    </ul>

    <!-- ============ ATIVOS BLURADOS (cadeado) ============
         Mostra os ativos restantes com blur + overlay com cadeado.
         Pessoa nao consegue ler os dados — efeito "tem mais aqui se
         cadastrar". Visual em 2 linhas pra economizar espaco. -->
    <div v-if="hasLocked" class="rx-deep__locked-wrap">
      <ul class="rx-deep__grid rx-deep__grid--locked" aria-hidden="true">
        <li
          v-for="asset in lockedAssets"
          :key="`locked-${asset.ticker}`"
          class="rx-deep__card"
        >
          <header class="rx-deep__card-head">
            <div class="rx-deep__ticker-block">
              <span class="rx-deep__ticker">{{ asset.ticker }}</span>
              <span class="rx-deep__category">{{ categoryLabel(asset.category) }}</span>
            </div>
            <span
              class="rx-deep__thesis"
              :style="{
                color: brand.colors.primary,
                background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
                borderColor: `color-mix(in srgb, ${brand.colors.primary} 30%, transparent)`,
              }"
            >Avaliando</span>
          </header>
          <p class="rx-deep__name">●●●●●●●●●●● ●●●●●●●●●● S.A.</p>
          <ul class="rx-deep__metrics">
            <li><span>P/L</span><strong>●●.●</strong></li>
            <li><span>P/VP</span><strong>●.●●</strong></li>
            <li><span>ROE</span><strong>●●.●%</strong></li>
            <li><span>DY</span><strong>●.●%</strong></li>
          </ul>
        </li>
      </ul>

      <div class="rx-deep__locked-overlay">
        <div class="rx-deep__locked-badge">
          <UIcon name="i-lucide-lock-keyhole" class="size-4" aria-hidden="true" />
          <span>+{{ lockedAssets.length }} {{ lockedAssets.length === 1 ? 'ativo analisado' : 'ativos analisados' }}</span>
        </div>
        <p class="rx-deep__locked-text">
          Cadastra pra ver a análise completa de cada ativo
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rx-deep {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 48px 0;
}

.rx-deep__header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.eyebrow {
  font-family: var(--brand-font);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin: 0;
}

.rx-deep__title {
  font-family: var(--brand-font);
  font-size: 28px;
  font-weight: 300;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--text-heading);
  margin: 0;
}

@media (min-width: 768px) {
  .rx-deep__title { font-size: 36px; }
}

.rx-deep__grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 768px) {
  .rx-deep__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (min-width: 1100px) {
  .rx-deep__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.rx-deep__card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 22px;
  border-radius: 14px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  transition: transform 220ms, border-color 220ms, box-shadow 220ms;
}

.rx-deep__card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--brand-primary) 28%, var(--border-subtle));
  box-shadow: 0 8px 24px -12px color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

.rx-deep__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-subtle);
}

.rx-deep__ticker-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.rx-deep__ticker {
  font-family: var(--brand-font);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
}

.rx-deep__category {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.rx-deep__thesis {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-family: var(--brand-font);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid;
  white-space: nowrap;
}

.rx-deep__name {
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-body);
  margin: 0;
}

.rx-deep__metrics {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 14px;
}

.rx-deep__metrics li {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rx-deep__metrics li span {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.rx-deep__metrics li strong {
  font-family: var(--brand-font);
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.005em;
  color: var(--text-heading);
}

.rx-deep__note {
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-muted);
  margin: 0;
  padding-top: 10px;
  border-top: 1px solid var(--border-subtle);
}

/* ============ ATIVOS BLURADOS (lock overlay) ============ */
.rx-deep__locked-wrap {
  position: relative;
  margin-top: 16px;
}

.rx-deep__grid--locked {
  filter: blur(6px) brightness(0.92);
  opacity: 0.65;
  pointer-events: none;
  user-select: none;
  /* So mostra primeira "linha" parcial — corta o resto pra reduzir altura */
  max-height: 320px;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 50%, transparent 100%);
          mask-image: linear-gradient(180deg, #000 0%, #000 50%, transparent 100%);
}

.rx-deep__locked-overlay {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 22px;
  text-align: center;
  z-index: 2;
}

.rx-deep__locked-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--bg-elevated);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent);
  font-family: var(--brand-font);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-heading);
  box-shadow: 0 6px 18px -8px color-mix(in srgb, var(--brand-primary) 35%, transparent);
}

.rx-deep__locked-badge svg,
.rx-deep__locked-badge .iconify {
  color: var(--brand-primary);
}

.rx-deep__locked-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-body);
  margin: 0;
}
</style>
