<script setup lang="ts">
// PROTÓTIPO /simulacao — "quem sangra, quem segura", v3 (gap de
// auditabilidade, 25/08): cada card agora ABRE — accordion com a conta
// linha a linha (fator · carga × choque = contribuição), beta, carrego
// líquido e a nota de RF. "Peso × sensibilidade" deixa de ser dito e
// passa a ser mostrado. Um aberto por vez.
import type { SimPositionImpact } from './simMock'

const props = defineProps<{ positions: SimPositionImpact[]; active: boolean }>()

const maxAbs = computed(() => Math.max(8, ...props.positions.map((p) => Math.abs(p.shockPct))))
const sorted = computed(() => [...props.positions].sort((a, b) => a.shockPct - b.shockPct))
/** efeito do choque na carteira inteira: Σ peso × impacto */
const total = computed(() => props.positions.reduce((acc, p) => acc + p.weight * p.shockPct, 0))
const isFlat = computed(() => props.positions.every((p) => p.shockPct === 0))

const openTicker = ref<string | null>(null)
function toggle(t: string) {
  openTicker.value = openTicker.value === t ? null : t
}

function dir(p: number): 'down' | 'up' | 'flat' {
  return p < 0 ? 'down' : p > 0 ? 'up' : 'flat'
}
const fmtPct = (v: number) => `${v > 0 ? '+' : ''}${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
const fmtNum = (v: number, dec = 2) => v.toLocaleString('pt-BR', { maximumFractionDigits: dec })

const FACTOR_LABEL: Record<string, string> = {
  dolar: 'dólar', internacional: 'internacional', domestico: 'doméstico',
  juros: 'juros', imobiliario: 'imobiliário', mercado: 'mercado (IBOV)',
  tech: 'tech', defensivo: 'defensivo', petroleo: 'petróleo',
  commodity: 'commodities', estatal: 'estatal',
}
/** choque do fator recuperado da contribuição (contribution = choque × carga) */
function factorShockOf(line: { load: number; contributionPct: number }): number {
  return line.load ? Math.round((line.contributionPct / line.load) * 10) / 10 : 0
}
/** nota de clamp: o motor manda o valor PRE-clamp (saturated/shockPctRaw);
 * o fallback reconstruido das linhas so vale pro mock, que nao manda */
function clampNote(p: SimPositionImpact): string | null {
  if (p.saturated && typeof p.shockPctRaw === 'number') {
    return `no limite do modelo linear: a soma dava ${fmtPct(p.shockPctRaw)}, exibida ${fmtPct(p.shockPct)}`
  }
  const raw = p.factors.reduce((s, l) => s + l.contributionPct, 0)
  return Math.abs(raw - p.shockPct) > 0.6 ? `soma bruta ${fmtPct(Math.round(raw * 10) / 10)}, limitada a ${fmtPct(p.shockPct)}` : null
}
/** o choque se espalha no tempo (E4)? só mostra quando a trajetória difere
 * do degrau — ano 1 ≈ total significa choque imediato, sem linha extra */
function timelineNote(p: SimPositionImpact): string | null {
  const tl = p.impactByYear
  if (!tl || tl.length < 3 || p.shockPct === 0) return null
  const y1 = tl[0]!
  if (Math.abs(y1 - p.shockPct) < Math.max(1, Math.abs(p.shockPct) * 0.15)) return null
  const peak = tl.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a), 0)
  const yPeak = tl.findIndex((v) => v === peak) + 1
  return `como o choque chega: ano 1 ${fmtPct(y1)} → ano ${yPeak} ${fmtPct(peak)} → ano ${tl.length} ${fmtPct(tl.at(-1)!)}`
}

/** "janela ~26 anos · 6.137 pregões vs IBOV" — só quando o motor mandou */
function betaMeta(p: SimPositionImpact): string | null {
  if (!p.betaWindowDays) return null
  const anos = Math.round(p.betaWindowDays / 365)
  const pares = p.betaPairs ? ` · ${p.betaPairs.toLocaleString('pt-BR')} pregões` : ''
  return `janela ~${anos} anos vs IBOV${pares}`
}
</script>

<template>
  <div v-contexto-chat="{ id: 'sim:posicoes', tipo: 'grafico', rotulo: 'Impacto por posição' }" class="spi">
    <!-- o número-herói do bloco: quanto o cenário tira (ou põe) da carteira -->
    <div class="spi__hero" :class="{ 'spi__hero--in': active }">
      <template v-if="!isFlat">
        <span class="spi__hero-label">Efeito do cenário na carteira, no vale</span>
        <span class="spi__hero-value" :class="total < 0 ? 'spi__val--down' : 'spi__val--up'">{{ fmtPct(total) }}</span>
      </template>
      <template v-else>
        <span class="spi__hero-label">Cenário base, sem mudanças</span>
        <span class="spi__hero-value spi__val--flat">as posições seguem o mercado</span>
      </template>
    </div>

    <div class="spi__list">
      <div
        v-for="(p, i) in sorted" :key="p.ticker"
        class="spi__card" :class="{ 'spi__card--in': active, 'spi__card--open': openTicker === p.ticker }"
        :style="{ '--d': `${i * 60}ms` }"
      >
        <button
          type="button" class="spi__row"
          :aria-expanded="openTicker === p.ticker" :aria-controls="`spi-detail-${p.ticker}`"
          @click="toggle(p.ticker)"
        >
          <span class="spi__pill">{{ p.ticker }}</span>
          <span class="spi__who">
            <b class="spi__name">{{ p.name }}</b>
            <em class="spi__weight">{{ Math.round(p.weight * 100) }}% da carteira</em>
          </span>
          <span class="spi__track">
            <i
              class="spi__fill" :class="[`spi__fill--${dir(p.shockPct)}`, { 'spi__fill--on': active }]"
              :style="{ width: `${(Math.abs(p.shockPct) / maxAbs) * 100}%`, transitionDelay: `${120 + i * 60}ms` }"
            />
          </span>
          <span class="spi__pct" :class="`spi__val--${dir(p.shockPct)}`">{{ p.shockPct === 0 ? '—' : fmtPct(p.shockPct) }}</span>
          <span class="spi__chev" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
          </span>
        </button>

        <!-- a FICHA: a conta aberta, linha a linha -->
        <div v-if="openTicker === p.ticker" :id="`spi-detail-${p.ticker}`" class="spi__detail">
          <div class="spi__meta">
            <span v-if="p.klass === 'Renda fixa' || p.klass === 'RF'">renda fixa · beta <b>0</b></span>
            <span v-else>beta <b>{{ fmtNum(p.beta) }}</b> · {{ betaMeta(p) ?? 'ilustrativo (mock)' }}</span>
            <span v-if="p.carryComponents">
              carrego base <b>{{ fmtNum(p.carryPct, 1) }}% a.a.</b>
              = CDI médio {{ fmtNum(p.carryComponents.cdiMeanPct, 1) }}% + β·ERP {{ fmtNum(p.carryComponents.betaErpPp, 1) }} p.p., bruto: é o que o motor compõe
            </span>
            <span v-else>carrego líquido <b>{{ fmtNum(p.carryPct, 1) }}% a.a.</b> neste cenário</span>
            <span :class="{ 'spi__meta--free': p.tax === 'isento' }">{{ p.taxLabel }}</span>
          </div>
          <p v-if="timelineNote(p)" class="spi__timeline">{{ timelineNote(p) }}</p>
          <p v-if="typeof p.betaStress === 'number'" class="spi__stress">
            Nos 10% piores dias do índice desde 2001, este papel se moveu com β ≈ <b>{{ fmtNum(p.betaStress) }}</b>. Em estresse o acoplamento muda; a conta acima usa o β da janela cheia.
          </p>
          <p v-if="p.betaSuspect" class="spi__suspect">β fora da faixa típica desta classe. Confira a liquidez do papel antes de apresentar.</p>
          <template v-if="p.factors.length">
            <div v-for="l in p.factors" :key="l.name" class="spi__line">
              <span class="spi__line-name">{{ FACTOR_LABEL[l.name] ?? l.name }}</span>
              <span class="spi__line-math">carga {{ fmtNum(l.load) }} × {{ fmtPct(factorShockOf(l)) }}</span>
              <span class="spi__line-val" :class="`spi__val--${dir(l.contributionPct)}`">{{ fmtPct(l.contributionPct) }}</span>
            </div>
            <div class="spi__line spi__line--sum">
              <span class="spi__line-name">soma no cenário</span>
              <span class="spi__line-math">{{ clampNote(p) ?? 'peso × sensibilidade, por regra aberta' }}</span>
              <span class="spi__line-val" :class="`spi__val--${dir(p.shockPct)}`">{{ fmtPct(p.shockPct) }}</span>
            </div>
          </template>
          <p v-else class="spi__none">Sem exposição aos fatores deste cenário: o efeito desta posição está no carrego.</p>
          <p v-if="p.rfNote" class="spi__rfnote">{{ p.rfNote }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* stat de abertura: o rótulo em caixa alta e o número-herói em 800 */
.spi__hero {
  display: flex; align-items: baseline; gap: 10px 18px; flex-wrap: wrap;
  margin-bottom: 28px;
  opacity: 0; transform: translateY(10px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.spi__hero--in { opacity: 1; transform: none; }
.spi__hero-label { color: var(--nu-ink); font-size: 13.5px; font-weight: var(--nu-w-medio); letter-spacing: 0.16em; text-transform: uppercase; }
.spi__hero-value { font-size: clamp(46px, 5.2vw, 68px); font-weight: var(--nu-w-display); letter-spacing: -0.035em; line-height: 1; font-variant-numeric: tabular-nums; }
.spi__val--down { color: var(--nu-red-text); }
.spi__val--up { color: var(--nu-green-text); }
.spi__val--flat { color: var(--nu-gray-3); }
.spi__hero-value.spi__val--flat { font-size: var(--nu-fs-h3); letter-spacing: -0.025em; line-height: 1.05; }

/* a lista "em claro": linha creme da página sobre a faixa, raio 16; abre em
   acordeão. A entrada é em cascata (60ms); ao passar o ponteiro, sobe 2px. */
.spi__list { display: flex; flex-direction: column; gap: 10px; }
.spi__card {
  background: var(--nu-page); border-radius: var(--nu-r-tile); box-shadow: var(--nu-shadow-quente);
  opacity: 0;
  transition: transform 0.25s var(--nu-ease-saida), box-shadow 0.25s var(--nu-ease-saida);
}
.spi__card--in { opacity: 1; animation: nu-fade 0.5s ease backwards; animation-delay: var(--d, 0ms); }
.spi__card:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.spi__card--open, .spi__card--open:hover { transform: none; box-shadow: var(--nu-shadow-quente); }
.spi__row {
  width: 100%; min-height: 64px; border: none; background: transparent; font-family: inherit; color: inherit;
  display: grid; grid-template-columns: 96px minmax(180px, 0.9fr) 2fr 92px 36px;
  gap: 18px; align-items: center; text-align: left;
  padding: 12px 14px 12px 20px; cursor: pointer; border-radius: var(--nu-r-tile);
}
/* o "+" do acordeão da marca: círculo carvão que gira ao abrir */
.spi__chev {
  width: 36px; height: 36px; border-radius: 50%; background: var(--nu-cream-2); color: var(--nu-ink);
  display: inline-flex; align-items: center; justify-content: center;
  transition: transform 0.25s var(--nu-ease-saida), background 0.2s, color 0.2s;
}
.spi__row:hover .spi__chev { background: var(--nu-line-2); }
.spi__card--open .spi__chev { transform: rotate(180deg); background: var(--nu-ink); color: var(--nu-white); }

/* o selo do ticker: carvão, letra branca 800, raio 8 */
.spi__pill {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 7px 0; border-radius: var(--nu-r-tag);
  background: var(--nu-ink); color: var(--nu-white);
  font-size: 13.5px; font-weight: var(--nu-w-forte); letter-spacing: 0.04em;
}

.spi__who { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.spi__name { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.spi__weight { color: var(--nu-gray); font-size: 13.5px; font-weight: 500; font-style: normal; font-variant-numeric: tabular-nums; }

/* a barra cresce da esquerda em 0,6s (só transform) */
.spi__track { position: relative; height: 12px; border-radius: 999px; background: var(--nu-line-2); overflow: hidden; }
.spi__fill {
  position: absolute; left: 0; top: 0; bottom: 0; border-radius: 999px;
  transform: scaleX(0); transform-origin: left center;
  transition: transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.spi__fill--on { transform: scaleX(1); }
.spi__fill--down { background: var(--nu-red); }
.spi__fill--up { background: var(--nu-green); }
.spi__fill--flat { background: var(--nu-sand); }

.spi__pct { text-align: right; font-size: var(--nu-fs-xl); font-weight: var(--nu-w-forte); letter-spacing: -0.02em; font-variant-numeric: tabular-nums; white-space: nowrap; }

/* a ficha */
.spi__detail { padding: 0 20px 18px; animation: nu-fade 0.3s ease both; }
.spi__meta {
  display: flex; gap: 8px 22px; flex-wrap: wrap;
  padding: 14px 0 10px; border-top: 1px solid var(--nu-line);
  color: var(--nu-gray-3); font-size: 13.5px; font-weight: 500;
}
.spi__meta b { color: var(--nu-ink); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; }
.spi__meta--free { color: var(--nu-green-text); font-weight: var(--nu-w-forte); }
.spi__line {
  display: grid; grid-template-columns: minmax(120px, 0.8fr) 1.6fr 78px;
  gap: 14px; align-items: baseline; padding: 6px 0;
}
.spi__line-name { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.spi__line-math { color: var(--nu-gray); font-size: 13.5px; font-weight: 500; font-variant-numeric: tabular-nums; }
.spi__line-val { text-align: right; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }
.spi__line--sum { border-top: 1.5px dashed var(--nu-line); margin-top: 4px; padding-top: 10px; }
.spi__none { margin: 4px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 500; }
.spi__timeline { margin: 8px 0 0; color: var(--nu-blue-text); font-size: 13.5px; font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }
.spi__stress { margin: 8px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 500; line-height: 1.45; }
.spi__stress b { color: var(--nu-ink); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; }
/* o selo "atenção" */
.spi__suspect { display: inline-block; margin: 8px 0 0; padding: 5px 10px; border-radius: var(--nu-r-tag); background: var(--nu-amber-bg); color: var(--nu-amber-text); font-size: 13.5px; font-weight: var(--nu-w-medio); }
.spi__rfnote { margin: 8px 0 0; color: var(--nu-gray-3); font-size: 13.5px; font-weight: var(--nu-w-medio); }

@media (max-width: 760px) {
  .spi__row { grid-template-columns: 84px 1fr auto 36px; padding: 12px 12px 12px 14px; gap: 10px 12px; }
  .spi__track { grid-column: 1 / -1; order: 5; }
  .spi__pct { font-size: var(--nu-fs-lg); }
  .spi__detail { padding: 0 14px 15px; }
  .spi__line { grid-template-columns: 1fr 78px; }
  .spi__line-math { grid-column: 1 / -1; order: 3; }
}
</style>
