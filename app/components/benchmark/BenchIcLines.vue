<script setup lang="ts">
// Previsão de futuro em formação (dono, 20/10: "placar parcial diário, em
// formação, sem posições e sem notas por ação, atualizando a cada fechamento").
// Painel navy como o da Carteira: uma linha por IA, cada uma com a sua cor
// (--nu-serie-*), o IC de Spearman de −1 a +1 a cada pregão, o zero marcado
// como acaso. O eixo já tem os 21 pregões até a nota oficial: as linhas andam
// para a direita a cada fechamento e a régua do fim diz quando a nota vale.
// Sem posição: as pílulas de baixo vão em ordem alfabética, e o número de cada
// IA só aparece no cursor. Passar o mouse numa pílula realça a linha dela.
// Movimento: as linhas se revelam da esquerda ao entrar na tela.
const props = defineProps<{
  labels: string[]
  series: { id: string; name: string; values: (number | null)[] }[]
  /** pregões até a nota oficial: o eixo vai do "Início" ao último deles */
  horizonte: number
  /** rótulo da régua do fim, ex.: "17/11" */
  fim?: string | null
}>()

const { el, revealClass } = useReveal(0.2)
const H = 320
const PAD = 16
const CORES = Array.from({ length: 10 }, (_, k) => `var(--nu-serie-${k + 1})`)
const cor = (id: string) => CORES[Math.max(0, props.series.findIndex((s) => s.id === id)) % CORES.length]!
const X = (i: number) => (i / Math.max(1, props.horizonte)) * 1000
const Y = (v: number) => PAD + ((1 - v) / 2) * (H - 2 * PAD)
const pct = (y: number) => `${((y / H) * 100).toFixed(2)}%`
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmt = (v: number) => (Math.abs(v) < 0.005 ? '0,00' : `${v > 0 ? '+' : '−'}${nf2.format(Math.abs(v))}`)
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
// rótulos da grade, na calha à esquerda: o zero se chama "acaso"
const grade = (g: number) => (g === 0 ? 'acaso' : `${g > 0 ? '+' : '−'}${nf1.format(Math.abs(g))}`)

// último ponto com dado (o eixo vai além dele, até o horizonte)
const ultimo = computed(() => props.labels.length - 1)
const path = (vals: (number | null)[]) => {
  let d = ''
  vals.forEach((v, i) => {
    if (v == null) return
    d += `${d ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`
  })
  return d
}
// rótulo do último pregão, embaixo da ponta das linhas (sem colar no "Início")
const fimEixo = computed(() => `max(${(X(ultimo.value) / 10).toFixed(2)}%, 72px)`)
const linhas = computed(() => props.series.map((s) => ({ ...s, cor: cor(s.id), d: path(s.values), fimV: s.values[ultimo.value] ?? null })))
const fichas = computed(() => [...linhas.value].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')))
const GRADE = [1, 0.5, 0, -0.5, -1]

const realce = ref<string | null>(null)
const hov = ref(-1)
function onMove(e: PointerEvent) {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const i = Math.round(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * props.horizonte)
  hov.value = Math.min(i, ultimo.value)
}
const tip = computed(() => {
  const i = hov.value
  if (i < 1) return null
  const left = `${(X(i) / 10).toFixed(2)}%`
  return {
    left,
    data: props.labels[i],
    linhas: linhas.value
      .map((l) => ({ id: l.id, name: l.name, cor: l.cor, v: l.values[i] ?? null }))
      .filter((l): l is typeof l & { v: number } => l.v != null)
      .sort((a, b) => b.v - a.v)
      .map((l) => ({ ...l, txt: fmt(l.v), top: pct(Y(l.v)) })),
  }
})
const resumo = computed(() => `IC de Spearman de cada IA, ${props.labels.length - 1} de ${props.horizonte} pregões: `
  + linhas.value.filter((l) => l.fimV != null).map((l) => `${l.name} ${fmt(l.fimV!)}`).join(', '))
</script>

<template>
  <div ref="el" class="bic" :class="revealClass">
    <div class="bic__plot" role="img" :aria-label="resumo" @pointerdown="onMove" @pointermove="onMove" @pointerleave="hov = -1">
      <template v-for="g in GRADE" :key="g">
        <div class="bic__grid" :class="{ 'bic__grid--zero': g === 0 }" :style="{ top: pct(Y(g)) }" />
        <div class="bic__gridlbl" :class="{ 'bic__gridlbl--zero': g === 0 }" :style="{ top: pct(Y(g)) }">{{ grade(g) }}</div>
      </template>
      <!-- o que falta até a nota oficial -->
      <div class="bic__falta" :style="{ left: `${(X(ultimo) / 10).toFixed(2)}%` }" aria-hidden="true" />
      <div class="bic__fim" aria-hidden="true"><span>{{ fim ? `Nota oficial · ${fim}` : 'Nota oficial' }}</span></div>
      <svg viewBox="0 0 1000 320" preserveAspectRatio="none" class="bic__svg" aria-hidden="true">
        <defs>
          <clipPath id="bic-clip"><rect class="bic__clip" x="0" y="0" width="1000" height="320" /></clipPath>
        </defs>
        <g clip-path="url(#bic-clip)">
          <path
            v-for="l in linhas" :key="l.id" :d="l.d" fill="none" class="bic__linha"
            :class="{ 'bic__linha--apaga': realce && realce !== l.id, 'bic__linha--realce': realce === l.id }"
            :style="{ stroke: l.cor, '--c': l.cor }"
            stroke-width="2.4" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"
          />
        </g>
      </svg>
      <span
        v-for="l in linhas.filter((x) => x.fimV != null)" :key="`p-${l.id}`" class="bic__ponta"
        :class="{ 'bic__ponta--apaga': realce && realce !== l.id }"
        :style="{ left: `${(X(ultimo) / 10).toFixed(2)}%`, top: pct(Y(l.fimV!)), '--c': l.cor }" aria-hidden="true"
      />
      <template v-if="tip">
        <div class="bic__cross" :style="{ left: tip.left }" />
        <div v-for="l in tip.linhas" :key="`d-${l.id}`" class="bic__dot" :style="{ left: tip.left, top: l.top, '--c': l.cor }" />
        <div class="bic__tip" :style="{ left: `clamp(0px, calc(${tip.left} - 115px), calc(100% - 230px))` }">
          <div class="bic__tip-data">{{ tip.data }}</div>
          <ol class="bic__tip-lista">
            <li v-for="l in tip.linhas" :key="l.id" :style="{ '--c': l.cor }"><i /><span>{{ l.name }}</span><b>{{ l.txt }}</b></li>
          </ol>
        </div>
      </template>
    </div>
    <div class="bic__eixo" aria-hidden="true">
      <span>{{ labels[0] }}</span>
      <span class="bic__eixo-hoje" :style="{ left: fimEixo }">{{ labels[ultimo] }}</span>
      <span>{{ horizonte }}º pregão</span>
    </div>
    <ul class="bic__fichas" aria-label="Modelos no gráfico">
      <li
        v-for="l in fichas" :key="l.id" class="bic__ficha" :class="{ 'bic__ficha--on': realce === l.id }" :style="{ '--c': l.cor }"
        @pointerenter="realce = l.id" @pointerleave="realce = null"
      ><i />{{ l.name }}</li>
    </ul>
  </div>
</template>

<style scoped>
.bic { background: var(--nu-navy); border-radius: var(--nu-r-panel); padding: clamp(20px, 2.6vw, 32px); container-type: inline-size; }
/* a grade tem calha própria à esquerda: o rótulo não atropela o começo das linhas */
.bic { --calha: 52px; }
.bic__plot { position: relative; height: clamp(240px, 30vw, 340px); margin: 8px 0 0 var(--calha); cursor: crosshair; touch-action: pan-y; }
.bic__svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.bic__grid { position: absolute; left: 0; right: 0; height: 1px; background: var(--nu-cream-text-08); }
.bic__grid--zero { background: var(--nu-cream-text-30); }
.bic__gridlbl {
  position: absolute; left: calc(-1 * var(--calha)); width: calc(var(--calha) - 10px); text-align: right; transform: translateY(-50%);
  color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 500; font-variant-numeric: tabular-nums;
}
.bic__gridlbl--zero { color: var(--nu-cream-text-78); font-weight: 700; }
/* o trecho que ainda não aconteceu: um véu leve até a régua da nota oficial */
.bic__falta {
  position: absolute; top: 0; bottom: 0; right: 0;
  background: repeating-linear-gradient(135deg, var(--nu-cream-text-08) 0 1px, transparent 1px 9px);
  opacity: .5; pointer-events: none;
}
.bic__fim { position: absolute; top: 0; bottom: 0; right: 0; width: 0; border-left: 1px dashed var(--nu-cream-text-45); pointer-events: none; }
.bic__fim span {
  position: absolute; top: -2px; right: 8px; white-space: nowrap; border-radius: var(--nu-r-pill); padding: 3px 9px;
  background: var(--nu-navy-2); color: var(--nu-cream-text); font-size: var(--nu-fs-xs); font-weight: 700;
}
.bic__linha { transition: opacity .25s ease, stroke-width .25s ease; }
.bic__linha--apaga { opacity: .15; }
.bic__linha--realce { stroke-width: 3.6; filter: drop-shadow(0 0 6px var(--c)); }
.bic__ponta {
  position: absolute; width: 9px; height: 9px; border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none;
  background: var(--c); box-shadow: 0 0 0 3px var(--nu-navy), 0 0 10px var(--c); transition: opacity .25s ease;
}
.bic__ponta--apaga { opacity: .15; }
.bic__cross { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--nu-cream-text-30); pointer-events: none; }
.bic__dot {
  position: absolute; width: 10px; height: 10px; border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none;
  border: 2px solid var(--c); background: var(--nu-navy); box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 25%, transparent);
}
.bic__tip {
  position: absolute; top: 4px; z-index: 3; width: 230px; pointer-events: none;
  background: var(--nu-cream); border-radius: var(--nu-r-tile); padding: 10px 14px; box-shadow: var(--nu-shadow-chart-tip);
}
.bic__tip-data { color: var(--nu-navy-55); font-size: var(--nu-fs-xs); font-weight: 700; text-transform: uppercase; letter-spacing: .4px; }
.bic__tip-lista { list-style: none; margin: 6px 0 0; padding: 0; display: grid; gap: 4px; }
.bic__tip-lista li { display: flex; align-items: center; gap: 8px; color: var(--nu-navy); font-size: var(--nu-fs-sm); font-weight: 500; }
.bic__tip-lista i { width: 8px; height: 8px; border-radius: 50%; background: var(--c); flex-shrink: 0; }
.bic__tip-lista span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bic__tip-lista b { margin-left: auto; font-weight: 800; font-variant-numeric: tabular-nums; }
.bic__eixo {
  position: relative; display: flex; justify-content: space-between; gap: 12px; margin: 10px 0 0 var(--calha);
  color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 500;
}
.bic__eixo-hoje { position: absolute; top: 0; transform: translateX(-50%); color: var(--nu-cream-text); font-weight: 700; white-space: nowrap; }
.bic__fichas { list-style: none; margin: 18px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.bic__ficha {
  display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: var(--nu-r-pill); cursor: default;
  border: 1px solid color-mix(in srgb, var(--c) 40%, transparent); color: var(--nu-cream-text-78);
  font-size: var(--nu-fs-sm); font-weight: 700; transition: background .2s ease, color .2s ease, border-color .2s ease;
}
.bic__ficha i { width: 8px; height: 8px; border-radius: 50%; background: var(--c); box-shadow: 0 0 8px var(--c); }
.bic__ficha--on { color: var(--nu-cream-text); background: color-mix(in srgb, var(--c) 14%, transparent); border-color: var(--c); }

/* entrada: as linhas se revelam da esquerda */
.bic__clip { transform-box: fill-box; transform-origin: left; }
.is-pending .bic__clip { transform: scaleX(0); }
.is-in .bic__clip { transform: scaleX(1); transition: transform 1.1s cubic-bezier(.45, .05, .2, 1); }
.is-pending .bic__ponta { opacity: 0; }
.is-in .bic__ponta { animation: bic-ponta .4s ease .9s backwards; }
@keyframes bic-ponta { from { opacity: 0; } }

@container (max-width: 560px) {
  .bic { --calha: 44px; }
  .bic__ficha { padding: 5px 10px; font-size: var(--nu-fs-xs); }
  .bic__fim span { right: 4px; }
}
</style>
