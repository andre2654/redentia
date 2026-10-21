<script setup lang="ts">
// Herói do "Salvar a simulação" (canvas "Cadastro sem muro", 21/10/2026): a
// bola de neve dos juros compostos rola pela curva da conta da pessoa e
// cresce no caminho, enquanto o total conta mês a mês até o valor final. A
// reta tracejada é o que ela aportou. Mesma conta da calculadora
// (utils/cadastro.ts → totalJuros). Parado, fica a bola no fim e o total.
import type { ContaJuros } from '~/utils/cadastro'

const props = withDefaults(defineProps<{
  conta: ContaJuros
  /** depois do cadastro: "Conta guardada" fixo, bola parada no fim */
  guardada?: boolean
  painel?: boolean
}>(), { guardada: false, painel: false })

const curva = computed(() => curvaJuros(props.conta, 456, 120, 10))
const meses = computed(() => Math.round(props.conta.anos * 12))
const sub = computed(() => {
  const partes = []
  if (props.conta.inicial > 0) partes.push(`${brlInteiro(props.conta.inicial)} inicial`)
  partes.push(`${brlInteiro(props.conta.mensal)} por mês`, `${props.conta.anos} ${props.conta.anos === 1 ? 'ano' : 'anos'}`, `${String(props.conta.taxa).replace('.', ',')}% a.a.`)
  return partes.join(' · ')
})

// o laço: parada no início, rola de 7% a 40% do ciclo, fica no fim. Na folha
// são 9 s, em volta; no painel do login roda uma vez, nos 6 s da cena do
// NuAuthFuncoes, e para no fim.
const ciclo = props.painel ? 6000 : 9000
const p = ref(1)
let quadro = 0
let inicio = 0
function passo(agora: number) {
  const decorrido = agora - inicio
  if (props.painel && decorrido >= ciclo * 0.4) {
    p.value = 1
    return
  }
  const f = (decorrido % ciclo) / ciclo
  p.value = f < 0.07 ? 0 : f < 0.4 ? (f - 0.07) / 0.33 : 1
  quadro = requestAnimationFrame(passo)
}
onMounted(() => {
  if (props.guardada || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  inicio = performance.now()
  quadro = requestAnimationFrame(passo)
})
watch(() => props.guardada, (g) => {
  if (g) {
    cancelAnimationFrame(quadro)
    p.value = 1
  }
})
onBeforeUnmount(() => cancelAnimationFrame(quadro))

const bola = computed(() => {
  const c = curva.value
  if (!c) return null
  const [x, y] = pontoNaPolilinha(c.pontos, p.value)
  return { x, y, r: 6 + 11 * p.value }
})
const valor = computed(() => brlInteiro(totalJuros(props.conta, Math.round(meses.value * p.value))))
const aportadoTexto = computed(() => (curva.value ? `${brlInteiro(curva.value.aportado)} seus` : ''))
const id = useId()
</script>

<template>
  <div class="chs" :class="{ 'chs--painel': painel, 'chs--guardada': guardada }" aria-hidden="true">
    <div class="chs__topo">
      <div>
        <div class="chs__valor">{{ valor }}</div>
        <div class="chs__sub">{{ sub }}</div>
      </div>
      <span class="chs__selo"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>Conta guardada</span>
    </div>
    <svg v-if="curva" class="chs__grafico" viewBox="0 0 456 120">
      <defs>
        <linearGradient :id="`${id}-area`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color: var(--nu-serie-5); stop-opacity: 0.26" />
          <stop offset="1" style="stop-color: var(--nu-blue-soft); stop-opacity: 0" />
        </linearGradient>
        <radialGradient :id="`${id}-bola`" cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stop-color="#FFFFFF" />
          <stop offset="0.45" stop-color="#EEF3FF" />
          <stop offset="1" stop-color="#B9CCFF" />
        </radialGradient>
      </defs>
      <path :d="curva.area" :fill="`url(#${id}-area)`" />
      <path class="chs__reta" :d="curva.aporte" fill="none" stroke-width="1.5" stroke-dasharray="4 6" />
      <text :x="curva.fimAporte[0]" :y="curva.fimAporte[1] + 18" text-anchor="end" class="chs__aporte">{{ aportadoTexto }}</text>
      <path class="chs__curva" :d="curva.d" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <circle v-if="bola" class="chs__bola" :cx="bola.x" :cy="bola.y" :r="bola.r" :fill="`url(#${id}-bola)`" />
    </svg>
  </div>
</template>

<style scoped>
.chs { display: flex; flex-direction: column; padding: 22px 28px 14px; color: var(--nu-cream-text); }
.chs--painel { padding: 0; }
.chs__topo { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding-right: 44px; }
.chs--painel .chs__topo { padding-right: 0; }
.chs__valor { font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; font-variant-numeric: tabular-nums; }
.chs__sub { margin-top: 2px; color: var(--nu-cream-text-60); font-size: var(--nu-fs-dense); font-weight: 500; }
.chs__selo {
  flex: none; display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: var(--nu-r-pill);
  background: rgba(143, 240, 181, 0.16); color: var(--nu-green-soft); font-size: var(--nu-fs-dense); font-weight: 700;
}
.chs__grafico { display: block; width: 100%; height: auto; margin-top: 10px; overflow: visible; }
.chs__reta { stroke: var(--nu-cream-text-35); }
.chs__aporte { fill: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 700; }
.chs__curva { stroke: #C9B6FF; filter: drop-shadow(0 0 6px rgba(201, 182, 255, 0.55)); }
.chs__bola { filter: drop-shadow(0 0 10px rgba(185, 162, 255, 0.8)); }

/* o ciclo é o mesmo do rAF da bola: o selo entra quando ela chega e, na
   virada da folha, o herói apaga e volta, para a bola não saltar do fim ao
   começo. No painel roda uma vez; a cena sai pela Transition do NuAuthFuncoes
   (o esmaecer do laço venceria a opacidade dela), então lá o herói não apaga. */
.chs { --chs-ciclo: 9s; animation: chs-volta var(--chs-ciclo) ease infinite; }
.chs__selo { animation: chs-selo var(--chs-ciclo) cubic-bezier(.2, .8, .2, 1) infinite; }
.chs--painel { --chs-ciclo: 6s; }
.chs--painel .chs__selo { animation-iteration-count: 1; }
.chs--painel, .chs--guardada, .chs--guardada .chs__selo { animation: none; }
@keyframes chs-volta { 0% { opacity: 0; } 3%, 93% { opacity: 1; } 100% { opacity: 0; } }
@keyframes chs-selo { 0%, 42% { opacity: 0; transform: translateY(6px); } 48%, 100% { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .chs, .chs__selo { animation: none; }
}
</style>
