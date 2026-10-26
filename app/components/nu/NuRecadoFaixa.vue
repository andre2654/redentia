<script setup lang="ts">
// A faixa do recado do André (dono, 26/10/2026, sobre a janela NuRecado:
// "ficou lindo, pode manter e coloque de banner também, algo assim"). O mesmo
// céu e a mesma serra do Ibovespa da janela, numa faixa fina abaixo da barra
// de cotações, com o fecho escrito à mão e um botão que abre a janela.
//  - para todo mundo, logado ou não: é o banner pequeno que o Google aceita no
//    lugar do diálogo que cobre a página;
//  - fora da preço teto (veto do dono, 15/10), do login, do /business e das
//    páginas do cliente do escritório;
//  - sai no HTML do servidor enquanto o recado está no ar (sem empurrar a
//    página depois); no cliente, some para quem fechou e quando o prazo passa.
import { IBOV_MENSAL } from '~/content/ibov-mensal'
import { RECADO, RECADO_LETRA, eventoRecado, recadoNoAr } from '~/composables/useRecado'

const FECHOU = `nu:recado-faixa:${RECADO.id}`
const route = useRoute()
const { aberto } = useRecado()

const noAr = ref(recadoNoAr())
const fechada = ref(false)
const foraDaPagina = computed(() => {
  const p = route.path
  return p === '/calculadora/preco-teto' || p === '/login' || p.startsWith('/business') || p.startsWith('/cliente')
})
const visivel = computed(() => noAr.value && !fechada.value && !foraDaPagina.value)

useHead(() => ({
  link: visivel.value ? [{ key: 'nu-recado-letra', id: 'nu-recado-letra', rel: 'stylesheet', href: RECADO_LETRA }] : [],
}))

onMounted(() => {
  noAr.value = recadoNoAr()
  try { fechada.value = !!localStorage.getItem(FECHOU) }
  catch { /* modo privado: a faixa fica */ }
})

function ler() {
  aberto.value = true
  eventoRecado('recado_faixa_clique')
}

function fechar() {
  fechada.value = true
  try { localStorage.setItem(FECHOU, String(Date.now())) }
  catch { /* modo privado: some só nesta visita */ }
  eventoRecado('recado_faixa_fechada')
}

// a serra ao fundo: o Ibovespa mês a mês desde 1995, em escala log, esticado na largura
const VW = 1200
const VH = 64
const logs = IBOV_MENSAL.map((v) => Math.log(v))
const lo = Math.min(...logs)
const hi = Math.max(...logs)
const serra = logs
  .map((l, i) => `${i ? 'L' : 'M'}${((i / (logs.length - 1)) * VW).toFixed(1)},${(18 + (1 - (l - lo) / (hi - lo)) * 40).toFixed(1)}`)
  .join('') + `L${VW},${VH}L0,${VH}Z`
</script>

<template>
  <div v-if="visivel" class="rfx" role="region" aria-label="Recado do André">
    <svg class="rfx__serra" :viewBox="`0 0 ${VW} ${VH}`" preserveAspectRatio="none" aria-hidden="true">
      <path :d="serra" />
    </svg>
    <div class="rfx__in">
      <img src="/img/recado/andre.jpg" alt="" width="30" height="30" class="rfx__foto">
      <p class="rfx__mao">A vida segue. A bolsa também.</p>
      <p class="rfx__txt">Dia vermelho não é fim de jogo.</p>
      <button type="button" class="rfx__ler" @click="ler">Ler o recado do André <span aria-hidden="true">›</span></button>
    </div>
    <button type="button" class="rfx__x" aria-label="Fechar o recado" @click="fechar">✕</button>
  </div>
</template>

<style scoped>
.rfx {
  position: relative; overflow: hidden;
  background: linear-gradient(90deg, var(--nu-navy) 0%, color-mix(in srgb, var(--nu-blue-deep) 55%, var(--nu-navy)) 62%, var(--nu-blue-deep) 100%);
  padding: 11px calc(clamp(22px, 5.5vw, 80px) + 40px) 11px clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.rfx__serra { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.rfx__serra path { fill: var(--nu-cream-text-10); }
.rfx__in { position: relative; display: flex; align-items: center; flex-wrap: wrap; gap: 8px 14px; }
.rfx__foto { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; flex: none; box-shadow: 0 0 0 2px var(--nu-cream-text-50); }
.rfx__mao {
  margin: 0; color: var(--nu-cream-text);
  font-family: 'Caveat', 'Bradley Hand', 'Segoe Print', cursive;
  font-size: var(--nu-fs-2xl); font-weight: 700; line-height: 1; white-space: nowrap;
}
.rfx__txt { margin: 0; color: var(--nu-cream-text-78); font-size: var(--nu-fs-sm); font-weight: 700; }
.rfx__ler {
  border: none; cursor: pointer; white-space: nowrap;
  background: var(--nu-cream-text-12); color: var(--nu-cream-text);
  border-radius: var(--nu-r-pill); padding: 7px 14px;
  font-size: var(--nu-fs-sm); font-weight: 800; transition: background .2s;
}
.rfx__ler:hover { background: var(--nu-white-30); }
.rfx__x {
  position: absolute; top: 50%; right: clamp(22px, 5.5vw, 80px); transform: translateY(-50%);
  width: 30px; height: 30px; border-radius: 50%; border: none; cursor: pointer;
  background: transparent; color: var(--nu-cream-text-78);
  font-size: var(--nu-fs-sm); font-weight: 800;
  display: flex; align-items: center; justify-content: center; transition: background .2s;
}
.rfx__x:hover { background: var(--nu-cream-text-12); }
.rfx__ler:focus-visible, .rfx__x:focus-visible { outline: 2px solid var(--nu-cream-text); outline-offset: 2px; }

@media (max-width: 760px) {
  .rfx__txt { display: none; }
  .rfx__mao { font-size: var(--nu-fs-xl); }
}
@media (prefers-reduced-motion: reduce) {
  .rfx { animation: none; }
}
</style>
