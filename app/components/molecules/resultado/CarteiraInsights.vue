<!--
  MoleculesResultadoCarteiraInsights — insights derivados (heuristicos
  por enquanto, IA real chega depois junto com endpoint de results
  agregados na Fase 3).

  Renderiza ate 4 insights, cada um com icone + titulo + body + acao
  opcional. Insights sao computados a partir do stats prop:

   1. Win rate alto vs PF baixo (ou vice-versa) — sinal de R:R ruim
   2. Concentracao em 1 ticker (>40% do P&L) — risco
   3. Day trade em vermelho mes a mes — alerta
   4. Hold positivo dominante — parabens

  Quando nao ha base pra opinar (poucos trades), mostra placeholder
  "Mais dados vao destravar insights melhores".
-->
<template>
  <div class="flex flex-col gap-3">
    <div v-if="!insights.length" class="insight-empty" :style="emptyStyle">
      <div class="flex items-start gap-3">
        <UIcon
          name="i-lucide-sparkles"
          class="size-5 shrink-0 mt-0.5"
          :style="{ color: 'var(--brand-primary)' }"
        />
        <div class="flex flex-col gap-1">
          <span class="text-[14px] font-medium" :style="{ color: 'var(--brand-text)' }">
            Pouco volume pra opinar
          </span>
          <span class="text-[12.5px] leading-relaxed" :style="{ color: `color-mix(in srgb, var(--brand-text) 60%, transparent)` }">
            Mais operações registradas e a leitura ganha densidade. Quando o backend de operações estiver online, esta seção vira um diagnóstico personalizado da sua semana.
          </span>
        </div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2">
      <article
        v-for="(ins, idx) in insights"
        :key="idx"
        class="insight-card"
        :style="insightCardStyle(ins.tone)"
      >
        <span
          class="insight-card__accent"
          :style="{ background: `radial-gradient(circle, color-mix(in srgb, ${toneColor(ins.tone)} 14%, transparent) 0%, transparent 70%)` }"
          aria-hidden="true"
        />
        <div class="flex items-start gap-3 relative">
          <div
            class="insight-icon shrink-0"
            :style="{
              backgroundColor: `color-mix(in srgb, ${toneColor(ins.tone)} 16%, transparent)`,
              color: toneColor(ins.tone),
              borderColor: `color-mix(in srgb, ${toneColor(ins.tone)} 28%, transparent)`,
            }"
          >
            <UIcon :name="ins.icon" class="size-4" aria-hidden="true" />
          </div>
          <div class="flex flex-col gap-1.5 min-w-0">
            <span
              class="text-[13.5px] font-medium"
              :style="{ color: 'var(--brand-text)', letterSpacing: '-0.005em' }"
            >{{ ins.title }}</span>
            <span
              class="text-[12.5px] leading-relaxed"
              :style="{ color: `color-mix(in srgb, var(--brand-text) 70%, transparent)` }"
            >{{ ins.body }}</span>
          </div>
        </div>
      </article>
    </div>

    <p
      class="mt-1 inline-flex items-start gap-1.5 text-[11px] leading-snug"
      :style="{ color: `color-mix(in srgb, var(--brand-text) 45%, transparent)` }"
    >
      <UIcon name="i-lucide-info" class="size-3 shrink-0 mt-0.5" aria-hidden="true" />
      <span>Leituras automatizadas baseadas em padrões matemáticos do período. Não constituem recomendação de investimento.</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import type { ResultadoStats } from '~/composables/useResultadoStats'

type InsightTone = 'positive' | 'warning' | 'neutral' | 'negative'

interface Insight {
  icon: string
  title: string
  body: string
  tone: InsightTone
}

const props = defineProps<{
  stats: ResultadoStats
}>()

const brand = useBrand()
const { brl } = useFormat()

const insights = computed<Insight[]>(() => {
  const out: Insight[] = []
  const s = props.stats

  // Insight 1: Win rate vs Profit factor — detecta R:R ruim
  if (s.wins + s.losses >= 6) {
    if (s.winRate >= 0.6 && Number.isFinite(s.profitFactor) && s.profitFactor < 1) {
      out.push({
        icon: 'i-lucide-alert-triangle',
        title: `Win rate alto (${(s.winRate * 100).toFixed(0)}%) mas no vermelho`,
        body: 'Você acerta mais do que erra, mas perde mais quando erra do que ganha quando acerta. Revise seus stops, talvez estejam apertados demais ou os alvos curtos demais.',
        tone: 'warning',
      })
    } else if (s.winRate < 0.45 && Number.isFinite(s.profitFactor) && s.profitFactor >= 1.3) {
      out.push({
        icon: 'i-lucide-target',
        title: 'Poucos trades acertados, mas ganho assimétrico',
        body: `Win rate de ${(s.winRate * 100).toFixed(0)}% sustentado por R:R favorável. Continue cortando perdas rápido e deixando vencedores correrem.`,
        tone: 'positive',
      })
    }
  }

  // Insight 2: Concentracao por ticker
  const tickerPnL = new Map<string, number>()
  for (const t of s.trades) {
    tickerPnL.set(t.ticker, (tickerPnL.get(t.ticker) || 0) + (t.resultAmount ?? 0))
  }
  if (tickerPnL.size && Math.abs(s.totalPnL) > 100) {
    const sorted = Array.from(tickerPnL.entries()).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    const [topTicker, topPnL] = sorted[0]
    const ratio = Math.abs(topPnL) / Math.max(Math.abs(s.totalPnL), 1)
    if (ratio > 0.4) {
      out.push({
        icon: 'i-lucide-bar-chart-3',
        title: `${topTicker} dominou seu resultado (${(ratio * 100).toFixed(0)}%)`,
        body: topPnL >= 0
          ? `${brl(topPnL)} desse período veio só de ${topTicker}. Bom resultado, mas concentração desse tamanho amplifica drawdown se a próxima entrada não funcionar.`
          : `Perdeu ${brl(Math.abs(topPnL))} concentrado em ${topTicker}. Vale revisar a tese e considerar reduzir tamanho ou diversificar setor.`,
        tone: 'warning',
      })
    }
  }

  // Insight 3: Day trade em vermelho
  const dayPnL = s.byKind.day.pnl
  const dayCount = s.byKind.day.count
  if (dayCount >= 5 && dayPnL < 0) {
    out.push({
      icon: 'i-lucide-trending-down',
      title: 'Day trade no vermelho no período',
      body: `${dayCount} operações intraday acumulam ${brl(dayPnL)}. Considere reduzir frequência, revisar setup ou pausar até o sistema voltar a performar.`,
      tone: 'negative',
    })
  }

  // Insight 4: Hold positivo dominante
  const holdPnL = s.byKind.hold.pnl
  if (holdPnL > 0 && holdPnL > Math.abs(dayPnL) + Math.abs(s.byKind.swing.pnl)) {
    out.push({
      icon: 'i-lucide-landmark',
      title: 'Hold é seu maior gerador de retorno',
      body: `Posições de longo prazo somam ${brl(holdPnL)} no período. Day e swing somam menos. Vale calibrar quanto tempo dedicar a cada modalidade, seu edge parece estar no longo.`,
      tone: 'positive',
    })
  }

  // Insight 5 (cap): Profit factor saudavel sem alertas
  if (
    out.length === 0 &&
    s.wins + s.losses >= 4 &&
    Number.isFinite(s.profitFactor) &&
    s.profitFactor >= 1.5
  ) {
    out.push({
      icon: 'i-lucide-check-circle',
      title: `Profit factor de ${s.profitFactor.toFixed(2).replace('.', ',')}, sustentável`,
      body: 'Acima de 1,5 já considerado bom em qualquer style. Continue rastreando consistência mês a mês, a métrica mais confiável é a estabilidade ao longo do tempo, não o número absoluto.',
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

function insightCardStyle(tone: InsightTone) {
  return {
    backgroundColor: 'var(--brand-surface)',
    borderColor: `color-mix(in srgb, ${toneColor(tone)} 24%, transparent)`,
  }
}

const emptyStyle = computed(() => ({
  backgroundColor: 'var(--brand-surface)',
  borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
}))
</script>

<style scoped>
.insight-card {
  position: relative;
  overflow: hidden;
  padding: 16px 18px;
  border-radius: 14px;
  border: 1px solid;
  transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;
}

.insight-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px -16px color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

.insight-card__accent {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 180px;
  height: 180px;
  border-radius: 999px;
  pointer-events: none;
}

.insight-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  border: 1px solid;
}

.insight-empty {
  position: relative;
  overflow: hidden;
  padding: 18px 20px;
  border-radius: 14px;
  border: 1px solid;
}

.insight-empty::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 180px;
  height: 180px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--brand-primary) 8%, transparent) 0%,
    transparent 70%
  );
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .insight-card,
  .insight-card:hover {
    transition: none;
    transform: none;
  }
}
</style>
