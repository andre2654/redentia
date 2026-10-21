<script setup lang="ts">
// A cordilheira do rodapé (dono, 20/10: "deixar meu footer mais foda", com
// rodapés ilustrados de referência). A paisagem nasce do mercado: a serra da
// frente é o Ibovespa de verdade, fechamento de cada mês desde jan/1995, em
// escala log (senão 1995 vira chão e 2026 um paredão); as duas de trás são a
// mesma série em outras escalas (esticada para a esquerda e menos suavizada),
// serras ao longe na névoa, cada uma com perfil próprio.
// Duotone de gravura: céu do navy ao azul da casa; a serra da frente cor de
// gelo, com curvas de nível (ecos da própria crista) e traço azul que adensa para
// baixo, então os recordes ficam nevados; mar escuro com ondas gravadas na base,
// onde assenta a linha do copyright. Grão de impressão.
// O cume da direita é o mês mais recente; passar o mouse mostra mês e pontos.
// A cena corta pela esquerda (xMaxYMax slice): no celular aparece a década mais
// recente, e o cume de hoje nunca sai da tela.
// Movimento: as serras sobem em camadas e a crista da frente se desenha da
// esquerda para a direita ao entrar na tela (nada com movimento reduzido).
import { IBOV_MENSAL, IBOV_MENSAL_INICIO } from '~/content/ibov-mensal'

const VW = 1600
const VH = 560
const MAR = 478 // linha d'água: as serras saem do mar
// a crista termina antes da borda: o cume de hoje fica inteiro, com respiro
const X_FIM = 1582
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const n = IBOV_MENSAL.length
const logs = IBOV_MENSAL.map((v) => Math.log(v))
const lo = Math.min(...logs)
const hi = Math.max(...logs)
const xDe = (i: number) => (i / (n - 1)) * X_FIM

// média móvel centrada (as serras de trás)
function suave(arr: number[], janela: number) {
  const r = Math.floor(janela / 2)
  return arr.map((_, i) => {
    let s = 0
    let k = 0
    for (let j = Math.max(0, i - r); j <= Math.min(arr.length - 1, i + r); j++) { s += arr[j]!; k++ }
    return s / k
  })
}
// estica: as serras de trás abrem para a esquerda a partir do cume (perfis próprios)
function camada(serie: number[], topo: number, base: number, estica = 1) {
  const ys = serie.map((l) => topo + (1 - (l - lo) / (hi - lo)) * (base - topo))
  const x = (i: number) => X_FIM - (X_FIM - xDe(i)) * estica
  const crista = ys.map((y, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y.toFixed(1)}`).join('') + `L${VW},${ys.at(-1)!.toFixed(1)}`
  return { ys, crista, corpo: `${crista}L${VW},${MAR + 2}L${x(0).toFixed(1)},${MAR + 2}Z` }
}
const longe = camada(suave(logs, 7), 112, 392, 1.45)
const meio = camada(suave(logs, 3), 160, 432, 1.18)
const frente = camada(logs, 205, 466)
// curvas de nível: a crista da frente repetida para baixo, cada vez mais fraca
const NIVEIS = Array.from({ length: 9 }, (_, k) => ({ dy: 16 + k * 15, o: 0.42 - k * 0.04 }))

// ondas gravadas no mar: traços curtos em fileiras, mais longos perto da costa
const ONDAS = (() => {
  const out: { x: number; y: number; w: number; o: number }[] = []
  let semente = 7
  const rnd = () => { semente = (semente * 9301 + 49297) % 233280; return semente / 233280 }
  for (let f = 0; f < 9; f++) {
    const y = MAR + 8 + f * 9 + f * f * 0.4
    for (let x = rnd() * 80; x < VW; x += 90 + rnd() * 180) {
      out.push({ x, y, w: 14 + rnd() * (48 - f * 4), o: 0.34 - f * 0.032 })
    }
  }
  return out
})()

const [anoIni, mesIni] = IBOV_MENSAL_INICIO.split('-').map(Number) as [number, number]
const mesDe = (i: number) => {
  const m = mesIni - 1 + i
  return `${MESES[m % 12]}/${String((anoIni + Math.floor(m / 12)) % 100).padStart(2, '0')}`
}
const pontos = (v: number) => v.toLocaleString('pt-BR')
const ultimo = { x: xDe(n - 1), y: frente.ys[n - 1]!, rotulo: mesDe(n - 1), valor: pontos(IBOV_MENSAL[n - 1]!) }

const { el, revealClass } = useReveal(0.15)

// cursor: do pixel para o mês, com a mesma conta do slice (escala = a maior das duas)
const cena = ref<HTMLElement | null>(null)
const marca = ref<{ left: number; top: number; rotulo: string; valor: string; virar: boolean } | null>(null)
function mover(e: PointerEvent) {
  if (e.pointerType === 'touch' || !cena.value) return
  const r = cena.value.getBoundingClientRect()
  const s = Math.max(r.width / VW, r.height / VH)
  const vx = VW - (r.right - e.clientX) / s
  if (vx < 0 || vx > X_FIM + 20) { marca.value = null; return }
  const i = Math.max(0, Math.min(n - 1, Math.round((vx / X_FIM) * (n - 1))))
  const left = r.width - (VW - xDe(i)) * s
  marca.value = {
    left, top: r.height - (VH - frente.ys[i]!) * s,
    rotulo: mesDe(i), valor: pontos(IBOV_MENSAL[i]!), virar: left > r.width - 200,
  }
}
</script>

<template>
  <div ref="el" class="nfc" :class="revealClass">
    <!-- o céu: no desktop, por cima do canto esquerdo (as serras de 1995 são baixas);
         no celular o recorte mostra os picos recentes e o céu vai para cima da cena -->
    <div class="nfc__ceu"><slot name="ceu" /></div>
    <div ref="cena" class="nfc__cena" @pointermove="mover" @pointerleave="marca = null">
      <svg :viewBox="`0 0 ${VW} ${VH}`" preserveAspectRatio="xMaxYMax slice" class="nfc__svg" aria-hidden="true">
        <defs>
          <!-- traço de gravura: linhas finas em diagonal -->
          <pattern id="nfc-gravura" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
            <line x1="0" y1="0" x2="0" y2="6" class="nfc__gravura" />
          </pattern>
          <pattern id="nfc-gravura-cruz" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
            <line x1="0" y1="0" x2="0" y2="6" class="nfc__gravura" />
          </pattern>
          <!-- o traço adensa para baixo: o alto das serras fica limpo, nevado -->
          <linearGradient id="nfc-fade" x1="0" y1="205" x2="0" y2="478" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#fff" stop-opacity="0" />
            <stop offset=".35" stop-color="#fff" stop-opacity=".55" />
            <stop offset="1" stop-color="#fff" stop-opacity="1" />
          </linearGradient>
          <linearGradient id="nfc-fade-baixo" x1="0" y1="330" x2="0" y2="478" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#fff" stop-opacity="0" />
            <stop offset="1" stop-color="#fff" stop-opacity="1" />
          </linearGradient>
          <mask id="nfc-mascara" maskUnits="userSpaceOnUse" x="0" y="0" :width="VW" :height="VH">
            <rect x="0" y="0" :width="VW" :height="VH" fill="url(#nfc-fade)" />
          </mask>
          <mask id="nfc-mascara-baixo" maskUnits="userSpaceOnUse" x="0" y="0" :width="VW" :height="VH">
            <rect x="0" y="0" :width="VW" :height="VH" fill="url(#nfc-fade-baixo)" />
          </mask>
          <linearGradient id="nfc-gelo" x1="0" y1="205" x2="0" :y2="MAR" gradientUnits="userSpaceOnUse">
            <stop offset="0" class="nfc__s-neve" />
            <stop offset=".5" class="nfc__s-gelo" />
            <stop offset="1" class="nfc__s-base" />
          </linearGradient>
          <linearGradient id="nfc-mar" x1="0" :y1="MAR" x2="0" :y2="VH" gradientUnits="userSpaceOnUse">
            <stop offset="0" class="nfc__s-mar-a" />
            <stop offset="1" class="nfc__s-mar-b" />
          </linearGradient>
        </defs>

        <g class="nfc__camada nfc__camada--longe">
          <path :d="longe.corpo" class="nfc__longe" />
        </g>
        <g class="nfc__camada nfc__camada--meio">
          <path :d="meio.corpo" class="nfc__meio" />
          <path :d="meio.corpo" fill="url(#nfc-gravura)" mask="url(#nfc-mascara)" class="nfc__textura-meio" />
          <path :d="meio.crista" class="nfc__crista-meio" />
        </g>
        <g class="nfc__camada nfc__camada--frente">
          <path :d="frente.corpo" fill="url(#nfc-gelo)" />
          <clipPath id="nfc-corpo"><path :d="frente.corpo" /></clipPath>
          <g clip-path="url(#nfc-corpo)">
            <path v-for="c in NIVEIS" :key="c.dy" :d="frente.crista" :transform="`translate(0 ${c.dy})`" class="nfc__nivel" :style="{ opacity: c.o }" />
          </g>
          <path :d="frente.corpo" fill="url(#nfc-gravura)" mask="url(#nfc-mascara)" class="nfc__textura" />
          <path :d="frente.crista" class="nfc__crista" pathLength="1" />
        </g>
        <g class="nfc__camada nfc__camada--mar">
          <rect x="0" :y="MAR" :width="VW" :height="VH - MAR" fill="url(#nfc-mar)" />
          <line x1="0" :y1="MAR" :x2="VW" :y2="MAR" class="nfc__costa" />
          <line v-for="(o, k) in ONDAS" :key="k" :x1="o.x" :y1="o.y" :x2="o.x + o.w" :y2="o.y" class="nfc__onda" :style="{ opacity: o.o }" />
        </g>
      </svg>
      <div class="nfc__grao" aria-hidden="true" />

      <!-- o cume de agora -->
      <div class="nfc__hoje" :style="{ '--x': ultimo.x, '--y': ultimo.y }" aria-hidden="true">
        <span class="nfc__hoje-ponto" />
        <span class="nfc__hoje-rot">{{ ultimo.rotulo }} · {{ ultimo.valor }}</span>
      </div>

      <div v-if="marca" class="nfc__marca" :class="{ 'nfc__marca--virar': marca.virar }" :style="{ left: `${marca.left}px`, top: `${marca.top}px` }" aria-hidden="true">
        <span class="nfc__marca-ponto" />
        <span class="nfc__marca-rot"><b>{{ marca.rotulo }}</b> {{ marca.valor }} pts</span>
      </div>

      <slot />
    </div>
    <p class="nfc__legenda" title="Fechamento de cada mês do Ibovespa, de jan/1995 a out/2026, em escala logarítmica.">A cordilheira é o Ibovespa, mês a mês desde 1995.</p>
    <!-- a base: no desktop por cima do mar; em tela estreita o mar é fino demais e ela vai para baixo da cena -->
    <div class="nfc__base"><slot name="base" /></div>
  </div>
</template>

<style scoped>
.nfc { position: relative; }
.nfc__cena {
  position: relative; height: clamp(320px, 40vw, 600px); container-type: size; cursor: crosshair;
  /* céu: do navy do rodapé ao azul da casa no horizonte */
  background: linear-gradient(180deg, var(--nu-navy) 0%, color-mix(in srgb, var(--nu-blue-deep) 55%, var(--nu-navy)) 55%, var(--nu-blue-deep) 100%);
}
.nfc__svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }

/* perspectiva do ar: quanto mais longe, mais clara e mais perto da cor do céu */
.nfc__longe { fill: color-mix(in srgb, var(--nu-blue-deep) 48%, var(--nu-navy)); }
.nfc__meio { fill: color-mix(in srgb, var(--nu-cream) 16%, var(--nu-blue-deep)); }
.nfc__crista-meio { fill: none; stroke: var(--nu-cream); stroke-width: 1; opacity: .4; }
.nfc__s-neve { stop-color: var(--nu-cream); }
.nfc__s-gelo { stop-color: color-mix(in srgb, var(--nu-cream) 82%, var(--nu-blue-deep)); }
.nfc__s-base { stop-color: color-mix(in srgb, var(--nu-cream) 55%, var(--nu-blue-deep)); }
.nfc__nivel { fill: none; stroke: var(--nu-blue-deep); stroke-width: 1.1; stroke-linejoin: round; }
.nfc__gravura { stroke: var(--nu-blue-deep); stroke-width: 1.15; }
.nfc__textura-meio { opacity: .35; }
.nfc__textura { opacity: .5; }
.nfc__textura--cruz { opacity: .3; }
.nfc__crista { fill: none; stroke: color-mix(in srgb, var(--nu-navy) 70%, var(--nu-blue-deep)); stroke-width: 1.6; stroke-linejoin: round; }
.nfc__s-mar-a { stop-color: color-mix(in srgb, var(--nu-blue-deep) 70%, var(--nu-navy)); }
.nfc__s-mar-b { stop-color: var(--nu-navy); }
.nfc__costa { stroke: var(--nu-cream); stroke-width: 1.2; opacity: .55; }
.nfc__onda { stroke: var(--nu-cream); stroke-width: 1.2; stroke-linecap: round; }

/* grão de impressão por cima de tudo */
.nfc__grao {
  position: absolute; inset: 0; pointer-events: none; opacity: .45; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
}

/* posição de um ponto do viewBox na tela, com a mesma escala do slice */
.nfc__cena { --s: max(calc(100cqw / 1600), calc(100cqh / 560)); }
.nfc__hoje {
  position: absolute; pointer-events: none;
  right: calc((1600 - var(--x)) * var(--s)); bottom: calc((560 - var(--y)) * var(--s));
}
.nfc__hoje-ponto {
  position: absolute; left: 100%; top: 100%; width: 12px; height: 12px; border-radius: 50%; transform: translate(-50%, -50%);
  background: var(--nu-blue); border: 2px solid var(--nu-cream); box-shadow: 0 0 0 5px var(--nu-cream-text-22), 0 0 18px var(--nu-cream);
}
.nfc__hoje-rot {
  position: absolute; right: -6px; bottom: 14px; white-space: nowrap; border-radius: var(--nu-r-pill); padding: 4px 10px;
  background: var(--nu-cream); color: var(--nu-navy); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums;
  box-shadow: var(--nu-shadow-chart-pill);
}
.nfc__marca { position: absolute; width: 0; height: 0; pointer-events: none; z-index: 2; }
.nfc__marca::before { content: ''; position: absolute; left: -0.5px; top: 0; width: 1px; height: 100vh; background: color-mix(in srgb, var(--nu-navy) 40%, transparent); }
.nfc__marca-ponto {
  position: absolute; width: 10px; height: 10px; border-radius: 50%; transform: translate(-50%, -50%);
  background: var(--nu-navy); border: 2px solid var(--nu-cream);
}
.nfc__marca-rot {
  position: absolute; left: 10px; bottom: 10px; white-space: nowrap; border-radius: var(--nu-r-pill); padding: 3px 9px;
  background: var(--nu-navy); color: var(--nu-cream-text-78); font-size: var(--nu-fs-xs); font-weight: 500; font-variant-numeric: tabular-nums;
}
.nfc__marca-rot b { color: var(--nu-cream); font-weight: 800; margin-right: 4px; }
.nfc__marca--virar .nfc__marca-rot { left: auto; right: 10px; }
.nfc__ceu { position: absolute; top: 0; left: 0; z-index: 1; width: min(56%, 820px); pointer-events: none; }
.nfc__base { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; }
.nfc__ceu > :deep(*) { pointer-events: auto; }
.nfc__legenda { position: absolute; top: 4px; right: var(--nfc-pad, 0px); z-index: 1; margin: 0; max-width: 30%; text-align: right; color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 500; }

/* entrada: as serras sobem em camadas e a crista da frente se desenha */
.nfc__camada { transform-box: view-box; }
.is-pending .nfc__camada { opacity: 0; transform: translateY(26px); }
.is-in .nfc__camada { animation: nfc-sobe 1.3s cubic-bezier(.22, 1, .36, 1) backwards; }
.is-in .nfc__camada--meio { animation-delay: .12s; }
.is-in .nfc__camada--frente { animation-delay: .24s; }
.is-in .nfc__camada--mar { animation: none; }
.is-pending .nfc__camada--mar { opacity: 1; transform: none; }
@keyframes nfc-sobe { from { opacity: 0; transform: translateY(26px); } }
.nfc__crista { stroke-dasharray: 1; }
.is-pending .nfc__crista { stroke-dashoffset: 1; }
.is-in .nfc__crista { animation: nfc-crista 2.6s cubic-bezier(.45, .05, .2, 1) .35s backwards; }
@keyframes nfc-crista { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
.is-pending .nfc__hoje { opacity: 0; }
.is-in .nfc__hoje { animation: nfc-hoje .6s ease 2.7s backwards; }
@keyframes nfc-hoje { from { opacity: 0; transform: translateY(6px); } }
.is-in .nfc__hoje-ponto { animation: nfc-pulso 2.8s ease-in-out 3.3s infinite; }
@keyframes nfc-pulso { 50% { box-shadow: 0 0 0 9px transparent, 0 0 26px var(--nu-cream); } }

@media (max-width: 900px) {
  .nfc__ceu { position: static; width: auto; }
  .nfc__base { position: static; }
  .nfc__legenda { position: static; max-width: none; text-align: left; margin: 0; padding: 12px var(--nfc-pad, 0px) 0; }
}
</style>
