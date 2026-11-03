<script setup lang="ts">
// A banda de assinatura do rodapé (NuFooter), escolhida pelo dono em
// 02/11/2026 ("gostei do 2", entre três direções; trocou a cordilheira). O
// jeito Apple pela contenção: navy, uma luz macia, o título enorme em peso
// leve (500, o mais leve que a casa carrega) e um traço só de luz atravessando
// a banda: o Ibovespa, fechamento de cada mês desde jan/1995, em escala log
// (app/content/ibov-mensal.ts). O traço entra pela borda esquerda, vindo de
// 1995, e acaba num ponto aceso: hoje. A luz da banda nasce desse ponto. Grão
// fino por cima. Nada mais.
// Passar o mouse acende o mês e os pontos. A série é estática e para em
// 20/10/2026, e o último rótulo diz isso ("20/10/26"): não estenda a série com
// dado não confirmado (o pregão de 26/10 ainda é suspeito, ver bolsaDoDia.ts).
import { IBOV_MENSAL, IBOV_MENSAL_INICIO } from '~/content/ibov-mensal'

const VW = 1600 // o viewBox do SVG é literal (0 0 1600 300): o :viewBox vira prop do DOM e o Vue reclama
const VH = 300
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const n = IBOV_MENSAL.length
const logs = IBOV_MENSAL.map((v) => Math.log(v))
const lo = Math.min(...logs)
const hi = Math.max(...logs)
// a linha ocupa a caixa com folga em cima (o ponto de hoje tem halo)
const yDe = (l: number) => 18 + (1 - (l - lo) / (hi - lo)) * (VH - 36)
const xDe = (i: number) => (i / (n - 1)) * VW
const d = logs.map((l, i) => `${i ? 'L' : 'M'}${xDe(i).toFixed(1)},${yDe(l).toFixed(1)}`).join('')
const fim = { x: 100, y: (yDe(logs[n - 1]!) / VH) * 100 }

const [anoIni, mesIni] = IBOV_MENSAL_INICIO.split('-').map(Number) as [number, number]
const mesDe = (i: number) => {
  if (i === n - 1) return '20/10/26'
  const m = mesIni - 1 + i
  return `${MESES[m % 12]}/${String((anoIni + Math.floor(m / 12)) % 100).padStart(2, '0')}`
}

// a entrada só embeleza (03/11/2026): título, traço e ponto saem prontos do
// servidor; nada fica escondido esperando o IntersectionObserver (numa aba em
// segundo plano ou num print de página inteira ele não dispara, e a banda
// ficava vazia). `soEmbeleza` em useReveal só passa a 'in' quando a banda
// montou fora da tela e está chegando; aí a entrada roda uma vez, em Web
// Animations (em CSS ela recomeçava do zero a cada recálculo de estilo), com
// as mesmas durações e curvas de antes.
const { el, state } = useReveal(0.2, { soEmbeleza: true })
watch(state, (st) => {
  const raiz = el.value
  if (st !== 'in' || !raiz) return
  const q = (c: string) => raiz.querySelector<HTMLElement>(c)
  const lento = 'cubic-bezier(.2, .8, .2, 1)'
  q('.nrc__titulo')?.animate([{ opacity: 0, filter: 'blur(14px)', transform: 'translateY(14px)' }, { opacity: 1, filter: 'none', transform: 'none' }], { duration: 1400, easing: lento, fill: 'backwards' })
  q('.nrc__traco')?.animate([{ clipPath: 'inset(-20px 100% -20px 0)' }, { clipPath: 'inset(-20px 0 -20px 0)' }], { duration: 2600, delay: 450, easing: 'cubic-bezier(.55, .05, .25, 1)', fill: 'backwards' })
  q('.nrc__legenda')?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, delay: 2400, easing: 'ease', fill: 'backwards' })
  q('.nrc__hoje')?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, delay: 2900, easing: 'ease', fill: 'backwards' })
})

const cena = ref<HTMLElement | null>(null)
const marca = ref<{ x: number; y: number; rotulo: string; valor: string; virar: boolean } | null>(null)
function mover(e: PointerEvent) {
  if (e.pointerType === 'touch' || !cena.value) return
  const r = cena.value.getBoundingClientRect()
  const f = (e.clientX - r.left) / r.width
  if (f < 0 || f > 1) { marca.value = null; return }
  const i = Math.round(f * (n - 1))
  const x = (i / (n - 1)) * 100
  marca.value = {
    x, y: (yDe(logs[i]!) / VH) * 100, rotulo: mesDe(i), valor: IBOV_MENSAL[i]!.toLocaleString('pt-BR'), virar: x > 92,
  }
}
</script>

<template>
  <div ref="el" class="nrc">
    <div class="nrc__luz" aria-hidden="true" />
    <h2 class="nrc__titulo">Seja qual for a sua meta,<br> a Redentia tem um caminho.</h2>

    <div ref="cena" class="nrc__cena" @pointermove="mover" @pointerleave="marca = null">
      <div class="nrc__traco">
        <svg viewBox="0 0 1600 300" preserveAspectRatio="none" class="nrc__svg nrc__svg--brilho" aria-hidden="true">
          <path :d="d" class="nrc__brilho" />
        </svg>
        <svg viewBox="0 0 1600 300" preserveAspectRatio="none" class="nrc__svg" aria-hidden="true">
          <defs>
            <linearGradient id="nrc-luz" x1="0" y1="0" :x2="VW" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" class="nrc__s-0" />
              <stop offset=".55" class="nrc__s-1" />
              <stop offset="1" class="nrc__s-2" />
            </linearGradient>
          </defs>
          <path :d="d" class="nrc__linha" />
        </svg>
      </div>
      <span class="nrc__hoje" :style="{ left: `${fim.x}%`, top: `${fim.y}%` }" aria-hidden="true" />
      <div v-if="marca" class="nrc__marca" :class="{ 'nrc__marca--virar': marca.virar, 'nrc__marca--inicio': marca.x < 8 }" :style="{ left: `${marca.x}%`, top: `${marca.y}%` }" aria-hidden="true">
        <span class="nrc__marca-ponto" />
        <span class="nrc__marca-rot">{{ marca.rotulo }} · {{ marca.valor }} pts</span>
      </div>
    </div>
    <p class="nrc__legenda" title="Fechamento de cada mês do Ibovespa, de jan/1995 a 20/10/2026, em escala logarítmica.">A linha é o Ibovespa, mês a mês desde 1995.</p>

    <div class="nrc__base"><slot name="base" /></div>
    <div class="nrc__grao" aria-hidden="true" />
  </div>
</template>

<style scoped>
.nrc {
  --g: clamp(22px, 5.5vw, 80px);
  /* as medidas de dentro seguem a largura da banda (cqw), não a da janela: com o
     painel do chat aberto a página encolhe ao lado dele e o título tem de caber */
  container-type: inline-size;
  position: relative; isolation: isolate;
  /* a banda inteira cabe na tela no fim da página (1440×900: com header, faixa e a barra da pergunta) */
  padding-top: clamp(56px, 5.5vw, 96px);
  background: var(--nu-navy);
}
/* a luz: nasce do ponto de hoje (à direita) e um véu frio desce sobre o título */
.nrc__luz {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background:
    radial-gradient(38% 44% at 94% 50%, color-mix(in srgb, var(--nu-blue) 30%, transparent) 0%, transparent 100%),
    radial-gradient(52% 34% at 50% 30%, color-mix(in srgb, var(--nu-blue-soft) 7%, transparent) 0%, transparent 100%);
}
.nrc__titulo {
  margin: 0 auto; padding: 0 var(--g); max-width: 16ch; box-sizing: content-box; text-align: center;
  font-size: clamp(40px, 6.3cqw, 104px); font-weight: 500; letter-spacing: -0.05em; line-height: 1.02;
  color: var(--nu-cream-text);
  background: linear-gradient(180deg, var(--nu-cream-text) 40%, var(--nu-cream-text-85) 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  text-wrap: balance;
}
.nrc__titulo br { display: none; }
@container (min-width: 900px) { .nrc__titulo { max-width: none; } .nrc__titulo br { display: inline; } }

/* o traço: entra pela borda esquerda (1995 vem de fora) e acaba no gutter da direita */
.nrc__cena {
  position: relative; margin: clamp(40px, 4.4cqw, 72px) var(--g) 0 0;
  height: clamp(150px, 13cqw, 220px); cursor: crosshair;
}
.nrc__traco { position: absolute; inset: 0; }
.nrc__svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: visible; }
.nrc__linha { fill: none; stroke: url(#nrc-luz); stroke-width: 1.6; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.nrc__s-0 { stop-color: var(--nu-blue-soft); stop-opacity: 0; }
.nrc__s-1 { stop-color: var(--nu-blue-soft); stop-opacity: .55; }
.nrc__s-2 { stop-color: var(--nu-cream); stop-opacity: 1; }
.nrc__svg--brilho { filter: blur(7px); opacity: .55; }
.nrc__brilho { fill: none; stroke: var(--nu-blue-soft); stroke-width: 5; vector-effect: non-scaling-stroke; }

.nrc__hoje {
  position: absolute; width: 9px; height: 9px; border-radius: 50%; transform: translate(-50%, -50%);
  background: var(--nu-cream);
  box-shadow: 0 0 0 6px var(--nu-blue-soft-18), 0 0 22px 4px var(--nu-blue-soft), 0 0 60px 18px color-mix(in srgb, var(--nu-blue) 45%, transparent);
}

.nrc__marca { position: absolute; width: 0; height: 0; pointer-events: none; }
.nrc__marca::before {
  content: ''; position: absolute; left: -0.5px; bottom: 0; width: 1px; height: 30px;
  background: linear-gradient(0deg, var(--nu-cream-text-45), transparent);
}
.nrc__marca-ponto {
  position: absolute; width: 7px; height: 7px; border-radius: 50%; transform: translate(-50%, -50%);
  background: var(--nu-cream);
}
.nrc__marca-rot {
  position: absolute; left: 0; bottom: 34px; transform: translateX(-50%); white-space: nowrap;
  text-shadow: 0 0 10px var(--nu-navy), 0 0 3px var(--nu-navy);
  color: var(--nu-cream-text-78); font-size: var(--nu-fs-xs); font-weight: 600; letter-spacing: .01em; font-variant-numeric: tabular-nums;
}
.nrc__marca--virar .nrc__marca-rot { transform: translateX(-100%); }
.nrc__marca--inicio .nrc__marca-rot { transform: none; }

.nrc__legenda {
  margin: 24px 0 0; padding: 0 var(--g); text-align: center;
  color: var(--nu-cream-text-45); font-size: var(--nu-fs-xs); font-weight: 500; letter-spacing: .01em;
}
.nrc__base { position: relative; z-index: 1; margin-top: clamp(40px, 4.4cqw, 64px); }

.nrc__grao {
  position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: .32; mix-blend-mode: overlay;
  -webkit-mask-image: linear-gradient(180deg, transparent, var(--nu-navy) 12%, var(--nu-navy) 72%, transparent);
  mask-image: linear-gradient(180deg, transparent, var(--nu-navy) 12%, var(--nu-navy) 72%, transparent);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
}
</style>
