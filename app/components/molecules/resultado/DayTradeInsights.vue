<!--
  MoleculesResultadoDayTradeInsights — leituras operacionais.

  Heuristicas focadas em comportamento de day-trader. Diferente das
  Leituras da Carteira (que sao sobre tese de longo prazo), aqui o
  foco e psicologico/disciplinar:
    - Tilt detectado (3+ stops seguidos)
    - Hora dreno consistente
    - Win rate desigual entre tickers
    - Drawdown excedendo R$/trade médio (sintoma de overtrading)
    - PF saudavel mantido (reforco positivo)

  Cada insight tem `tone` (positive/warning/negative) que tincta
  border + accent. Ate 4 visiveis pra nao poluir.
-->
<template>
  <div class="dt-insights">
    <div v-if="!insights.length" class="dt-insights__empty" :style="emptyStyle">
      <UIcon
        name="i-lucide-sparkles"
        class="size-5 shrink-0 mt-0.5"
        :style="{ color: 'var(--brand-primary)' }"
      />
      <div class="flex flex-col gap-1">
        <span class="dt-insights__empty-title" :style="{ color: 'var(--brand-text)' }">
          Pouca amostra pra opinar
        </span>
        <span class="dt-insights__empty-body">
          Mais sessões registradas e a leitura ganha densidade. Quando o backend de operações estiver online, esta seção vira diagnóstico psicológico em tempo real (tilt, overtrading, hora dreno).
        </span>
      </div>
    </div>

    <div v-else class="dt-insights__grid">
      <article
        v-for="(ins, idx) in insights"
        :key="idx"
        class="dt-insight"
        :style="cardStyle(ins.tone)"
      >
        <span
          class="dt-insight__accent"
          :style="{
            background: `radial-gradient(circle, color-mix(in srgb, ${toneColor(ins.tone)} 16%, transparent) 0%, transparent 70%)`,
          }"
          aria-hidden="true"
        />
        <div class="dt-insight__body">
          <div
            class="dt-insight__icon"
            :style="{
              backgroundColor: `color-mix(in srgb, ${toneColor(ins.tone)} 16%, transparent)`,
              color: toneColor(ins.tone),
              borderColor: `color-mix(in srgb, ${toneColor(ins.tone)} 30%, transparent)`,
            }"
          >
            <UIcon :name="ins.icon" class="size-4" aria-hidden="true" />
          </div>
          <div class="dt-insight__text">
            <span class="dt-insight__title" :style="{ color: 'var(--brand-text)' }">
              {{ ins.title }}
            </span>
            <span class="dt-insight__desc">{{ ins.body }}</span>
          </div>
        </div>
      </article>
    </div>

    <p v-if="insights.length" class="dt-insights__disclaimer">
      <UIcon name="i-lucide-info" class="size-3 shrink-0 mt-0.5" aria-hidden="true" />
      <span>Padrões matemáticos do período. Não constituem recomendação de operação.</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import type { DayTradeStats } from '~/composables/useDayTradeStats'

type InsightTone = 'positive' | 'warning' | 'negative' | 'neutral'

interface Insight {
  icon: string
  title: string
  body: string
  tone: InsightTone
}

const props = defineProps<{
  stats: DayTradeStats
}>()

const brand = useBrand()
const { brl } = useFormat()

const insights = computed<Insight[]>(() => {
  const out: Insight[] = []
  const s = props.stats

  // Sample minimo pra opinar: 5 trades.
  if (s.count < 5) return out

  // ============ Tilt: 3+ stops seguidos ============
  if (s.currentStreak <= -3) {
    const abs = Math.abs(s.currentStreak)
    out.push({
      icon: 'i-lucide-alert-triangle',
      title: `${abs} stops seguidos no fim da janela`,
      body: 'Sequência de perdas pode indicar tilt ou regime de mercado contra você. Considere fazer pausa, revisar setup ou reduzir tamanho até a curva voltar a subir.',
      tone: 'negative',
    })
  } else if (s.longestLossStreak >= 4) {
    out.push({
      icon: 'i-lucide-trending-down',
      title: `Maior sequência negativa: ${s.longestLossStreak} stops`,
      body: 'Sessões com runs longos de perdas tendem a comprometer o resultado mesmo quando o win rate global é saudável. Vale revisar critério de entrada nesses momentos.',
      tone: 'warning',
    })
  }

  // ============ Hot/Cold zones — hora dreno consistente ============
  const eligible = s.hourBuckets.filter((b) => b.count >= 2)
  if (eligible.length >= 2) {
    const sorted = [...eligible].sort((a, b) => a.winRate - b.winRate)
    const worst = sorted[0]
    if (worst.winRate < 0.4 && worst.count >= 3) {
      const period = worst.hour < 12 ? 'manhã' : worst.hour < 14 ? 'almoço' : 'tarde'
      out.push({
        icon: 'i-lucide-snowflake',
        title: `${worst.hour}h é sua hora dreno`,
        body: `Win rate de ${Math.round(worst.winRate * 100)}% em ${worst.count} operações no horário de ${period}. Considere pausar ou reduzir frequência nesse intervalo.`,
        tone: 'warning',
      })
    }
    const best = sorted[sorted.length - 1]
    if (best.winRate >= 0.65 && best.count >= 3 && best.hour !== worst.hour) {
      out.push({
        icon: 'i-lucide-flame',
        title: `${best.hour}h é seu horário ouro`,
        body: `Win rate de ${Math.round(best.winRate * 100)}% em ${best.count} operações. Padrão consistente, vale concentrar volume nessa janela.`,
        tone: 'positive',
      })
    }
  }

  // ============ Drawdown vs avg — overtrading ============
  if (s.maxDrawdown > 0 && s.avgPerTrade !== 0) {
    const ratio = s.maxDrawdown / Math.abs(s.avgPerTrade)
    if (ratio > 8) {
      out.push({
        icon: 'i-lucide-activity',
        title: 'Drawdown alto vs ganho médio',
        body: `Pior pico-vale (${brl(s.maxDrawdown)}) é ${ratio.toFixed(0)}× o ganho médio por trade. Sintoma de overtrading: stop sobe os trades vencedores.`,
        tone: 'warning',
      })
    }
  }

  // ============ R:R desfavoravel ============
  if (s.wins >= 3 && s.losses >= 3) {
    const rr = Math.abs(s.avgWin / s.avgLoss)
    if (s.winRate >= 0.55 && rr < 0.8) {
      out.push({
        icon: 'i-lucide-target',
        title: 'Acerta muito mas ganha pouco',
        body: `Win rate ${Math.round(s.winRate * 100)}% mas R:R ${rr.toFixed(2).replace('.', ',')}:1. Você corta vencedores cedo demais ou deixa perdedores correr. Revisar saídas.`,
        tone: 'warning',
      })
    } else if (rr >= 2 && s.winRate <= 0.5) {
      out.push({
        icon: 'i-lucide-trophy',
        title: 'R:R assimétrico te sustenta',
        body: `Win rate de ${Math.round(s.winRate * 100)}% mas R:R ${rr.toFixed(2).replace('.', ',')}:1. Estilo "deixar correr" funciona, mantenha disciplina nos stops.`,
        tone: 'positive',
      })
    }
  }

  // ============ Profit factor saudavel (fallback positivo) ============
  if (
    out.length === 0 &&
    Number.isFinite(s.profitFactor) &&
    s.profitFactor >= 1.5 &&
    s.count >= 8
  ) {
    out.push({
      icon: 'i-lucide-check-circle',
      title: `Profit factor de ${s.profitFactor.toFixed(2).replace('.', ',')}`,
      body: 'Sustentável em qualquer style. Continue rastreando consistência, a métrica mais confiável é estabilidade ao longo do tempo, não o número absoluto.',
      tone: 'positive',
    })
  }

  return out.slice(0, 4)
})

function toneColor(tone: InsightTone): string {
  switch (tone) {
    case 'positive': return 'var(--brand-positive)'
    case 'warning': return 'var(--brand-primary)'
    case 'negative': return 'var(--brand-negative)'
    case 'neutral': return 'var(--brand-text)'
  }
}

function cardStyle(tone: InsightTone) {
  return {
    backgroundColor: 'var(--brand-surface)',
    borderColor: `color-mix(in srgb, ${toneColor(tone)} 28%, transparent)`,
  }
}

const emptyStyle = computed(() => ({
  backgroundColor: 'var(--brand-surface)',
  borderColor: `color-mix(in srgb, var(--brand-border) 55%, transparent)`,
}))
</script>

<style scoped>
.dt-insights {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
}

.dt-insights__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 10px;
}

.dt-insight {
  position: relative;
  overflow: hidden;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid;
  transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;
}

.dt-insight:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px -16px color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

.dt-insight__accent {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 180px;
  height: 180px;
  border-radius: 999px;
  pointer-events: none;
}

.dt-insight__body {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  position: relative;
}

.dt-insight__icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid;
  flex-shrink: 0;
}

.dt-insight__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.dt-insight__title {
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: -0.005em;
  line-height: 1.35;
}

.dt-insight__desc {
  font-size: 11.5px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}

.dt-insights__empty {
  position: relative;
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.dt-insights__empty-title {
  font-size: 13px;
  font-weight: 700;
}

.dt-insights__empty-body {
  font-size: 11.5px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

.dt-insights__disclaimer {
  display: inline-flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 10.5px;
  letter-spacing: 0.02em;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .dt-insight,
  .dt-insight:hover {
    transition: none;
    transform: none;
  }
}
</style>
