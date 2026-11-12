<script setup lang="ts">
// O palco da régua do mercado (12/11/2026, o dono: "enquanto não abriu, ela pode
// ficar mudando para uma linha mostrando quanto tempo falta para abrir a bolsa…
// vá trocando para algumas barras, tipo 1 minuto cada… depois que ela se formar
// mostra os textos do lado esquerdo e direito e depois de 15s some para a barra
// preencher toda a largura"). Uma cena por vez, trocando a cada ~60 s; a barra
// das ações (NuReguaBolsa) é a cena principal. Quais cenas, quanto falta e a
// frase do fechamento saem de funções puras (utils/reguaDaBolsa.ts e
// utils/pregao.ts, com teste):
//  - antes das 10h de um dia de pregão: a contagem e a barra do último pregão;
//  - aberta: só a barra, ao vivo (o ciclo roda uma vez e ela fica larga);
//  - depois do fechamento: a frase do fechamento e a barra de hoje;
//  - fim de semana e feriado: a barra do último pregão e a contagem.
// A barra, a cada entrada: se forma (a cascata), os textos dos lados aparecem e,
// 15 s depois, somem enquanto ela cresce até a coluna (NuReguaBolsa, `fase`).
// A troca: o que sai desce e some, o que entra sobe 6px e aparece
// (--nu-dur-lenta, --nu-ease-troca). Pausa com o mouse sobre a régua, com o
// foco dentro dela e com a aba escondida. O foco que entra traz a barra (o Tab
// da régua é sempre o da barra). Nada é anunciado na troca: o rótulo estável é
// o aria-label da barra, e a contagem é aria-live="off". Movimento reduzido:
// nada se mexe sozinho: a régua fica na primeira cena do momento (antes da
// abertura, a contagem; depois do fechamento, a frase; no fim de semana, a
// barra), e a barra fica parada com os textos dos lados, sem cascata e sem
// crescer. É também o jeito de parar a troca automática (WCAG 2.2.2) para
// quem pediu menos movimento; para os outros, ela pausa com o mouse, o foco
// e a aba escondida.
import type { MercadoDoTopo } from '~/utils/topo'
import type { DadoDaRegua } from '~/composables/useReguaDaBolsa'
import { DURACAO_DA_CENA, TEXTOS_DA_BARRA, cenasDaRegua, contagemDaRegua, fechamentoDaRegua, type CenaDaRegua } from '~/utils/reguaDaBolsa'
import { agoraEmSP, janelaDaAbertura } from '~/utils/pregao'

const props = defineProps<{
  bolsa: DadoDaRegua
  /** o dia do pregão do dado (ibov.data; o dev pode trocar) */
  data: string | null
  mercado: MercadoDoTopo
  agora: Date
  /** só no dev (?regua-cena=): a cena parada */
  cenaFixa?: CenaDaRegua | null
  /** só no dev (?regua-agora=, ?regua-estado=): o relógio parado */
  congelado?: boolean
}>()

/** a cascata leva ~0,8 s antes dos 15 s dos textos (--nu-dur-lenta + --nu-dur-media) */
const FORMAR_MS = 800

/* ————— o relógio: anda de segundo em segundo com a contagem em cena ————— */
const tique = ref<Date | null>(null)
const relogio = computed(() => (!props.congelado && tique.value && tique.value > props.agora ? tique.value : props.agora))
const hoje = computed(() => agoraEmSP(relogio.value).iso)
const janela = computed(() => janelaDaAbertura(relogio.value))
const contagem = computed(() => (janela.value ? contagemDaRegua(janela.value, relogio.value.getTime(), hoje.value) : null))
const fechamento = computed(() => {
  const ib = props.bolsa.ibov
  return fechamentoDaRegua({ ...props.bolsa, ibov: ib ? { pct: ib.pct, data: props.data ?? ib.data } : null }, hoje.value)
})
const cenas = computed<CenaDaRegua[]>(() => {
  const f = props.cenaFixa
  if (f === 'contagem' && contagem.value) return ['contagem']
  if (f === 'fechamento' && fechamento.value) return ['fechamento']
  if (f) return ['barra']
  return cenasDaRegua(props.mercado.estado, { contagem: !!contagem.value, fechamento: !!fechamento.value })
})

/* ————— a cena e a fase da barra ————— */
const indice = ref(0)
const cena = computed<CenaDaRegua>(() => cenas.value[Math.min(indice.value, cenas.value.length - 1)] ?? 'barra')
const fase = ref<'textos' | 'larga'>('textos')
const ciclo = ref(0)
const reduzido = ref(false)

// as pausas: o mouse sobre a régua, o foco dentro dela, a aba escondida
const sobre = ref(false)
const dentro = ref(false)
const escondida = ref(false)
const pausado = computed(() => sobre.value || dentro.value || escondida.value)

// um temporizador só, que guarda o que faltava quando pausa
let t: ReturnType<typeof setTimeout> | null = null
let passo: (() => void) | null = null
let resta = 0
let vence = 0
function limpar() {
  if (t) clearTimeout(t)
  t = null
  passo = null
}
function correr() {
  if (!passo || t) return
  vence = Date.now() + resta
  t = setTimeout(() => {
    t = null
    const f = passo
    passo = null
    f?.()
  }, resta)
}
function agendar(ms: number, fn: () => void) {
  limpar()
  passo = fn
  resta = ms
  if (!pausado.value) correr()
}
watch(pausado, (p) => {
  if (!p) { correr(); return }
  if (t) { clearTimeout(t); t = null; resta = Math.max(0, vence - Date.now()) }
})

/* a cena que sai continua no lugar enquanto some (sobe e desfoca); a barra
   que sai guarda a fase que tinha (não encolhe nem perde os textos no meio da saída) */
const saindo = ref<CenaDaRegua | null>(null)
let tSaida: ReturnType<typeof setTimeout> | null = null
const SAIDA_MS = 600

function entrar(i: number) {
  const antes = cena.value
  indice.value = i
  if (montado && antes !== cena.value) {
    saindo.value = antes
    if (tSaida) clearTimeout(tSaida)
    tSaida = setTimeout(() => { saindo.value = null }, SAIDA_MS)
  }
  const lista = cenas.value
  const troca = lista.length > 1
  // movimento reduzido: a cena fica, sem troca e sem a barra crescer
  if (reduzido.value) {
    if (lista[i] === 'barra') { ciclo.value++; fase.value = 'textos' }
    limpar()
    return
  }
  if (lista[i] === 'barra') {
    ciclo.value++
    fase.value = 'textos'
    agendar(FORMAR_MS + TEXTOS_DA_BARRA, () => {
      fase.value = 'larga'
      if (cenas.value.length > 1) agendar(DURACAO_DA_CENA - FORMAR_MS - TEXTOS_DA_BARRA, proxima)
    })
    return
  }
  if (troca) agendar(DURACAO_DA_CENA, proxima)
  else limpar()
}
function proxima() {
  entrar((indice.value + 1) % Math.max(1, cenas.value.length))
}

let montado = false
// o momento mudou (abriu, fechou, o fechamento de hoje chegou): a cena que segue valendo fica, a lista recomeça dela
watch(() => cenas.value.join(','), () => {
  if (!montado) return
  const atual = cena.value
  const i = cenas.value.indexOf(atual)
  entrar(i < 0 ? 0 : i)
})

/* ————— o foco e o mouse ————— */
const raiz = ref<HTMLElement | null>(null)
function aoFocar() {
  dentro.value = true
  // o Tab da régua é o da barra: o foco que entra fora da cena dela traz a barra
  if (cena.value !== 'barra') {
    const i = cenas.value.indexOf('barra')
    if (i >= 0) entrar(i)
  }
}
function aoDesfocar(e: FocusEvent) {
  const para = e.relatedTarget as Node | null
  if (!para || !raiz.value?.contains(para)) dentro.value = false
}

/* ————— a contagem anda de segundo em segundo enquanto está em cena ————— */
let tTique: ReturnType<typeof setInterval> | null = null
watch(() => cena.value === 'contagem' && !props.congelado, (anda) => {
  if (tTique) { clearInterval(tTique); tTique = null }
  if (anda && import.meta.client) {
    tique.value = new Date()
    tTique = setInterval(() => { tique.value = new Date() }, 1000)
  }
})

function visibilidade() { escondida.value = document.visibilityState !== 'visible' }
onMounted(() => {
  reduzido.value = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  visibilidade()
  document.addEventListener('visibilitychange', visibilidade)
  montado = true
  entrar(0)
})
onBeforeUnmount(() => {
  limpar()
  if (tSaida) clearTimeout(tSaida)
  if (tTique) clearInterval(tTique)
  document.removeEventListener('visibilitychange', visibilidade)
})
</script>

<template>
  <div ref="raiz" class="nrp" @pointerenter="sobre = true" @pointerleave="sobre = false" @focusin="aoFocar" @focusout="aoDesfocar">
    <!-- a barra: sempre no HTML do cliente e sempre focável (o rótulo estável da régua é o dela) -->
    <div class="nrp__cena nrp__cena--barra" :class="{ 'nrp__cena--ativa': cena === 'barra', 'nrp__cena--saindo': saindo === 'barra' }">
      <NuReguaBolsa
        :acoes="bolsa.acoes" :data="data" :mercado="mercado" :agora="relogio"
        :fase="cena === 'barra' || saindo === 'barra' ? fase : 'oculta'" :ciclo="ciclo" :acender="!reduzido"
      />
    </div>

    <!-- a contagem: quanto falta para abrir e a linha que enche do último fechamento até a abertura -->
    <div
      v-if="contagem && cenas.includes('contagem')" class="nrp__cena nrp__contagem" :class="{ 'nrp__cena--ativa': cena === 'contagem', 'nrp__cena--saindo': saindo === 'contagem' }"
      :aria-hidden="cena !== 'contagem' || undefined"
    >
      <span class="nrp__ponto" aria-hidden="true" />
      <span class="nrp__texto" aria-live="off"><span class="nrp__t-longo">{{ contagem.longo }}</span><span class="nrp__t-curto">{{ contagem.curto }}</span></span>
      <span v-if="contagem.progresso != null" class="nrp__linha" aria-hidden="true">
        <i class="nrp__cheia" :style="{ transform: `scaleX(${contagem.progresso.toFixed(4)})` }" />
        <span class="nrp__ponta" :style="{ transform: `translateX(${(contagem.progresso * 100).toFixed(2)}%)` }"><i /></span>
      </span>
      <span v-else class="nrp__vao" />
      <span class="nrp__hora">{{ contagem.hora }}</span>
    </div>

    <!-- o fechamento: os fatos do dia, só os que o dado traz -->
    <div
      v-if="fechamento && cenas.includes('fechamento')" class="nrp__cena nrp__fechamento" :class="{ 'nrp__cena--ativa': cena === 'fechamento', 'nrp__cena--saindo': saindo === 'fechamento' }"
      :aria-hidden="cena !== 'fechamento' || undefined"
    >
      <span class="nrp__ponto" aria-hidden="true" />
      <span class="nrp__texto">
        <span class="nrp__t-longo">{{ fechamento.antes }} <b class="nrp__pct" :class="`nrp__pct--${fechamento.tom}`">{{ fechamento.pct }}</b>{{ fechamento.conta }}<span class="nrp__fato">{{ fechamento.fato }}</span></span>
        <span class="nrp__t-curto">{{ fechamento.curto }} <b class="nrp__pct" :class="`nrp__pct--${fechamento.tom}`">{{ fechamento.pct }}</b></span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.nrp {
  position: relative; flex: 1 1 auto; min-width: 0; height: 100%; display: grid;
  animation: nu-surgir var(--nu-dur-media) var(--nu-ease-cor) both;
}
/* as cenas no mesmo lugar, como um letreiro que rola (dono, 12/11/2026: "mais
   suave"): as duas andam para cima; a que entra vem de 8px abaixo e firma
   (--nu-dur-entrada na curva que chega), a que sai sobe 8px, desfoca e some
   mais depressa (--nu-dur-lenta), e as duas se cruzam no meio, sem vazio */
.nrp__cena {
  grid-area: 1 / 1; min-width: 0; display: flex; align-items: center;
  transition: opacity var(--nu-dur-entrada) var(--nu-ease-cor), transform var(--nu-dur-entrada) var(--nu-ease-saida), filter var(--nu-dur-entrada) var(--nu-ease-cor);
}
.nrp__cena:not(.nrp__cena--ativa) { opacity: 0; transform: translateY(8px); filter: blur(3px); pointer-events: none; }
.nrp__cena--saindo:not(.nrp__cena--ativa) { transform: translateY(-8px); transition-duration: var(--nu-dur-lenta); }
/* as cenas de texto saem também do Tab e do leitor (a da barra não: o foco dela traz a cena de volta) */
.nrp__contagem:not(.nrp__cena--ativa), .nrp__fechamento:not(.nrp__cena--ativa) {
  visibility: hidden;
  transition: opacity var(--nu-dur-lenta) var(--nu-ease-cor), transform var(--nu-dur-lenta) var(--nu-ease-saida), filter var(--nu-dur-lenta) var(--nu-ease-cor), visibility 0s var(--nu-dur-lenta);
}

/* o ponto do estado (o mesmo do "Abre às 10h") e o texto */
.nrp__ponto { flex: none; width: 7px; height: 7px; margin-right: 8px; border-radius: 50%; background: var(--nu-sand); }
.nrp__texto {
  flex: none; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
  white-space: nowrap; font-variant-numeric: tabular-nums;
}
.nrp__t-curto { display: none; }
.nrp__fechamento .nrp__texto { font-weight: var(--nu-w-texto); }
.nrp__fechamento .nrp__t-longo { color: var(--nu-gray-2); }
.nrp__pct { font-weight: var(--nu-w-medio); }
.nrp__pct--up { color: var(--nu-green-text); }
.nrp__pct--down { color: var(--nu-red-text); }
.nrp__pct--flat { color: var(--nu-ink); }

/* a linha que enche do último fechamento até a abertura, com o ponto que anda na ponta */
.nrp__linha { position: relative; flex: 1 1 auto; min-width: 40px; height: 4px; margin: 0 16px; border-radius: var(--nu-r-pill); background: var(--nu-line-2); }
.nrp__cheia { position: absolute; inset: 0; border-radius: inherit; background: var(--nu-blue); transform-origin: left center; }
.nrp__ponta { position: absolute; inset: 0; pointer-events: none; }
.nrp__ponta i {
  position: absolute; left: 0; top: 50%; width: 10px; height: 10px; margin: -5px 0 0 -5px; border-radius: 50%;
  background: var(--nu-blue); box-shadow: 0 0 0 2px var(--nu-page);
}
.nrp__vao { flex: 1 1 auto; }
.nrp__hora { flex: none; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }

@media (max-width: 1023px) {
  .nrp__fato { display: none; }
  .nrp__linha { margin: 0 12px; }
}
@media (max-width: 640px) {
  .nrp__texto { font-size: var(--nu-fs-xs); }
  .nrp__t-longo { display: none; }
  .nrp__t-curto { display: inline; }
  .nrp__ponto { margin-right: 6px; }
  .nrp__linha { margin: 0 10px; height: 3px; }
  .nrp__ponta i { width: 8px; height: 8px; margin: -4px 0 0 -4px; }
}
@media (prefers-reduced-motion: reduce) {
  .nrp { animation: none; }
  .nrp__cena, .nrp__contagem:not(.nrp__cena--ativa), .nrp__fechamento:not(.nrp__cena--ativa) { transition: none; }
  .nrp__cena:not(.nrp__cena--ativa), .nrp__cena--saindo:not(.nrp__cena--ativa) { transform: none; filter: none; }
}
</style>
