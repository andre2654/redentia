<script setup lang="ts">
// O horizonte da carteira (13/11/2026; o dono, com o esboço do app na mão: "nos
// gráficos da carteira tem já conectada a previsão da carteira, daí se eu dar
// drag vai dando zoom à medida que vou indo para a direita, traga isso para o
// site também, achei muito foda"). O gráfico do topo da /carteira (a
// rentabilidade contra o CDI, o AtivoGrafico de sempre) ganha, à direita de
// hoje, o leque do motor: os 2.000 caminhos de GET /me/carteira/futuro. Levar
// o ponteiro ou o dedo para a direita afasta o fim da janela até o horizonte
// (5 anos), e o passado encolhe para o tamanho que ele tem nessa escala.
//
// A conta mora em utils/horizonteDaCarteira.ts (com teste): um eixo de tempo
// só, linear; o valor no índice do próprio gráfico; o domínio vertical do que
// está à vista. Aqui fica o desenho:
//  - o passado É o AtivoGrafico, sem mudança: ele mora numa caixa que esta peça
//    estreita e achata (o SVG dele escala), então a mira, a medida e o teclado
//    do passado seguem como eram;
//  - o futuro é um SVG desenhado uma vez (as faixas de 8 e de 5 em cada 10
//    caminhos, uma amostra de caminhos e o mais provável tracejado) dentro de
//    uma janela que corta em hoje e na beira; a peça só muda a caixa dele;
//  - a leitura do futuro (o mês sob o ponteiro: o mais provável e a faixa de 8
//    em cada 10) usa o cartãozinho da dica do gráfico;
//  - em repouso, o convite: o mais provável no fim do horizonte e o botão
//    "Arraste para o futuro", que também abre e fecha o horizonte no clique e
//    no teclado (aí as setas andam mês a mês e Esc volta).
// O zoom segue o ponteiro com um amortecimento curto (entra e sai sem tranco);
// o toque fica onde o dedo soltou e sai com um toque fora. Sem o futuro (o
// motor carregando, fora do ar, a carteira sem o que simular, o mock do dev), a
// peça é só o gráfico de antes, na largura toda; quando o futuro chega, ele
// entra abrindo espaço (o estado muda na hora; por ~0,8 s a caixa do passado
// e a janela andam em transição de CSS, que não depende dos quadros do script). O R$ segue o olho da visita (`mascarado`): escondido,
// a leitura fica só em %. Movimento reduzido: sem amortecimento e sem entrada.
import type { SeriesPoint } from '~/types/acao'
import type { FuturoDadosApi } from '~/types/assinatura'
import { anoDoFim, brlDoLeque, mesDoLeque, type CaminhosDoLeque } from '~/utils/futuro'
import {
  caixaNoDominio, daquiAQuanto, dominioDoHorizonte, futuroAVista, mesSobOPonteiro, mesesDoPassado, ondeFicaHoje, ondeFicaOMes, quantisNoMes,
  zoomDoPonteiro, PASSADO_EM_REPOUSO,
} from '~/utils/horizonteDaCarteira'

const props = withDefaults(defineProps<{
  /** a rentabilidade da carteira, índice com base 100 no começo do período */
  linha: SeriesPoint[]
  /** o CDI no mesmo período */
  comparada: SeriesPoint[]
  /** '+17,13%', o rótulo do ponto de hoje */
  atual: string
  /** o título do gráfico, para o leitor de tela */
  rotulo: string
  /** a resposta do motor; null enquanto não há futuro para mostrar */
  futuro?: FuturoDadosApi | null
  /** os caminhos do motor (a textura do leque); sem eles, só as faixas */
  caminhos?: CaminhosDoLeque | null
  /** o olho da visita fechado: o R$ some, o % fica */
  mascarado?: boolean
}>(), { futuro: null, caminhos: null, mascarado: false })

/* ————— o que o motor mandou, pronto para desenhar ————— */
const serie = computed(() => props.futuro?.series ?? [])
const horizonte = computed(() => Math.max(0, serie.value.length - 1))
/** de onde o leque parte, em reais (a parte da carteira que o motor simula) */
const base = computed(() => serie.value[0]?.p50 ?? 0)
const passado = computed(() => mesesDoPassado(props.linha))
const hojeIndice = computed(() => props.linha[props.linha.length - 1]?.v ?? 0)
const temFuturo = computed(() => horizonte.value >= 2 && base.value > 0 && passado.value > 0 && hojeIndice.value > 0)

/* ————— o zoom: 0 em repouso, 1 com o horizonte inteiro ————— */
const z = ref(0)
/** o futuro no lugar: 0 sem ele (o gráfico de antes, na largura toda), 1 com ele */
const presenca = computed(() => (temFuturo.value ? 1 : 0))
/** o futuro entrando (ou saindo): por ~0,8 s a caixa do passado e a janela andam em transição de CSS, e o ponteiro espera */
const chegando = ref(false)
let fimDaChegada: ReturnType<typeof setTimeout> | null = null
let alvoDoZoom = 0
let quadro: number | null = null
let antes = 0
const calmo = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
/** o zoom persegue o alvo com meia-vida de ~50 ms, pelo relógio (igual a 60 e a 120 quadros por segundo) */
function andar(agora: number) {
  quadro = null
  const dt = Math.min(64, Math.max(0, agora - antes))
  antes = agora
  const dz = alvoDoZoom - z.value
  z.value = Math.abs(dz) < 0.0015 ? alvoDoZoom : z.value + dz * (1 - Math.exp(-dt / 72))
  if (z.value !== alvoDoZoom) pedirQuadro()
}
function pedirQuadro() {
  if (quadro != null || typeof requestAnimationFrame === 'undefined') return
  quadro = requestAnimationFrame(andar)
}
function mirar(novo: number) {
  alvoDoZoom = Math.min(1, Math.max(0, novo))
  if (calmo()) { z.value = alvoDoZoom; return }
  if (quadro == null) antes = performance.now()
  pedirQuadro()
}
// o futuro chega (ou some): o estado muda na hora; a transição é só o acabamento, e não roda com movimento reduzido
watch(temFuturo, () => {
  if (fimDaChegada) clearTimeout(fimDaChegada)
  if (calmo()) { chegando.value = false; return }
  chegando.value = true
  fimDaChegada = setTimeout(() => { chegando.value = false }, 800)
})

/* ————— a geometria à vista ————— */
const aVista = computed(() => futuroAVista(z.value, passado.value, horizonte.value))
/** onde fica hoje na largura do desenho: 1 sem o futuro (o gráfico de antes), a conta do horizonte com ele */
const hoje = computed(() => 1 + (ondeFicaHoje(z.value, passado.value, horizonte.value) - 1) * presenca.value)
const dominioDoPassado = computed(() => {
  const c = caminhosDoGrafico(props.linha, props.comparada, 1000, 300)
  return { lo: c.lo, hi: c.hi }
})
const dominio = computed(() => {
  const p = dominioDoPassado.value
  if (!temFuturo.value) return p
  const d = dominioDoHorizonte(p, serie.value, hojeIndice.value, base.value, aVista.value, z.value)
  return { lo: p.lo + (d.lo - p.lo) * presenca.value, hi: p.hi + (d.hi - p.hi) * presenca.value }
})
const emIndice = (v: number) => (hojeIndice.value * v) / base.value
/** onde um valor do leque (R$) cai na altura do desenho, de 0 (em cima) a 1 */
const alturaDe = (v: number) => (dominio.value.hi - emIndice(v)) / (dominio.value.hi - dominio.value.lo)
const caixaDoPassado = computed(() => caixaNoDominio(dominioDoPassado.value, dominio.value))

/* ————— o leque, desenhado uma vez num quadro de (horizonte) × 1000 ————— */
const ALTO = 1000
const AMOSTRA = 44
const leque = computed(() => {
  const s = serie.value
  if (!temFuturo.value) return null
  let lo = Infinity
  let hi = -Infinity
  for (const p of s) { lo = Math.min(lo, p.p10); hi = Math.max(hi, p.p90) }
  const y = (v: number) => (((hi - v) / (hi - lo)) * ALTO).toFixed(1)
  const ida = (q: 'p10' | 'p25' | 'p50' | 'p75' | 'p90') => s.map((p, i) => `${i},${y(p[q])}`)
  const faixa = (cima: 'p90' | 'p75', baixo: 'p10' | 'p25') => `M${ida(cima).join(' L')} L${ida(baixo).reverse().join(' L')} Z`
  // uma amostra dos caminhos, espalhada pelo ranking do fim (do pior ao melhor)
  const fios: string[] = []
  const c = props.caminhos
  if (c && c.pontos === s.length) {
    const k = Math.min(AMOSTRA, c.n)
    for (let j = 0; j < k; j++) {
      const i = Math.min(c.n - 1, Math.floor(((j + 0.5) / k) * c.n))
      let d = ''
      for (let t = 0; t < c.pontos; t++) d += `${t ? ' L' : 'M'}${t},${y(c.valores[i * c.pontos + t]!)}`
      fios.push(d)
    }
  }
  return { lo, hi, larga: faixa('p90', 'p10'), estreita: faixa('p75', 'p25'), meio: `M${ida('p50').join(' L')}`, fios }
})
const caixaDoLeque = computed(() => {
  const l = leque.value
  return l ? caixaNoDominio({ lo: emIndice(l.lo), hi: emIndice(l.hi) }, dominio.value) : { topo: 0, altura: 1 }
})

/* ————— a leitura do futuro: o mês sob o ponteiro (ou sob as setas) ————— */
const raiz = ref<HTMLElement | null>(null)
const plot = ref<HTMLElement | null>(null)
/** onde o ponteiro está na largura do desenho (0 a 1); null fora */
const ponteiro = ref<number | null>(null)
/** o mês escolhido pelas setas, com o horizonte aberto */
const mesDoTeclado = ref<number | null>(null)
/** o horizonte aberto pelo botão ou pelo teclado: o zoom fica em 1 até fechar */
const aberto = ref(false)
const mes = computed<number | null>(() => {
  if (!temFuturo.value) return null
  if (ponteiro.value != null) return mesSobOPonteiro(ponteiro.value, z.value, passado.value, horizonte.value)
  return mesDoTeclado.value
})
const pctSobreHoje = (v: number) => (v / base.value - 1) * 100
const dinheiro = (v: number) => (props.mascarado ? 'R$ ••••' : brlDoLeque(v))
const leitura = computed(() => {
  const m = mes.value
  const q = m != null ? quantisNoMes(serie.value, m) : null
  if (m == null || !q || m < 0.05) return null
  const p = pctSobreHoje(q.p50)
  return {
    x: ondeFicaOMes(m, z.value, passado.value, horizonte.value) * 100,
    y: alturaDe(q.p50) * 100,
    quando: `${mesDoLeque(props.futuro!.as_of, Math.max(1, Math.round(m)))} · ${daquiAQuanto(m)}`,
    valor: dinheiro(q.p50),
    var: pctAtivo(p),
    dir: p < 0 ? 'down' : 'up',
    faixa: props.mascarado
      ? `8 em cada 10 entre ${pctAtivo(pctSobreHoje(q.p10))} e ${pctAtivo(pctSobreHoje(q.p90))}`
      : `8 em cada 10 entre ${brlDoLeque(q.p10)} e ${brlDoLeque(q.p90)}`,
    falada: `${mesDoLeque(props.futuro!.as_of, Math.max(1, Math.round(m)))}, ${daquiAQuanto(m)}: o mais provável é ${props.mascarado ? pctAtivo(p) : `${brlDoLeque(q.p50)} (${pctAtivo(p)})`}; `
      + `8 em cada 10 caminhos ficam entre ${props.mascarado ? pctAtivo(pctSobreHoje(q.p10)) : brlDoLeque(q.p10)} e ${props.mascarado ? pctAtivo(pctSobreHoje(q.p90)) : brlDoLeque(q.p90)}, em dinheiro de hoje.`,
  }
})
/** a dica presa à mira sem sair da caixa (a mesma regra do AtivoGrafico) */
function ancora(x: number): Record<string, string> {
  if (x < 25) return { left: `${x}%`, '--cho-dica-x': '-8px' }
  if (x > 75) return { left: `${x}%`, '--cho-dica-x': 'calc(-100% + 8px)' }
  return { left: `${x}%`, '--cho-dica-x': '-50%' }
}

/* ————— o convite e as pontas do eixo ————— */
const fim = computed(() => {
  const f = props.futuro
  const q = quantisNoMes(serie.value, horizonte.value)
  if (!f || !q) return null
  const p = pctSobreHoje(q.p50)
  return {
    ano: anoDoFim(f.as_of, f.horizon_years),
    valor: props.mascarado ? pctAtivo(p) : brlDoLeque(q.p50),
    x: ondeFicaOMes(horizonte.value, z.value, passado.value, horizonte.value) * 100,
    y: alturaDe(q.p50) * 100,
  }
})
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const inicioDoEixo = computed(() => {
  const t = props.linha[0]?.t ?? ''
  return /^\d{4}-\d{2}/.test(t) ? `${MESES[Number(t.slice(5, 7)) - 1]}/${t.slice(0, 4)}` : ''
})
const fimDoEixo = computed(() => (props.futuro ? mesDoLeque(props.futuro.as_of, Math.max(1, Math.round(aVista.value))) : ''))
const noFuturo = computed(() => z.value > 0.02)

/* ————— o ponteiro: o mouse passa, o dedo arrasta ————— */
let medindo = false
let dedo: number | null = null
function fracao(e: PointerEvent): number {
  const r = plot.value?.getBoundingClientRect()
  return r && r.width > 0 ? (e.clientX - r.left) / r.width : 0
}
function seguir(e: PointerEvent) {
  const u = Math.min(1, Math.max(0, fracao(e)))
  mesDoTeclado.value = null
  if (aberto.value) { ponteiro.value = u; return }
  const pede = zoomDoPonteiro(u)
  // sobre o passado, com o horizonte fechado, a leitura é do gráfico de sempre
  ponteiro.value = pede > 0 || z.value > 0.002 ? u : null
  mirar(pede)
}
function aoApertar(e: PointerEvent) {
  if (!temFuturo.value || chegando.value) return
  if (e.pointerType === 'mouse') {
    // o botão apertado sobre o passado é a medida do AtivoGrafico: o horizonte não mexe até soltar
    medindo = !!(e.target as HTMLElement | null)?.closest('.cho__passado') && z.value < 0.002
    return
  }
  dedo = e.pointerId
  seguir(e)
}
function aoMover(e: PointerEvent) {
  if (!temFuturo.value || chegando.value || medindo) return
  if (e.pointerType !== 'mouse' && e.pointerId !== dedo) return
  seguir(e)
}
function aoSoltar(e: PointerEvent) {
  medindo = false
  if (e.pointerId === dedo) dedo = null // no toque, o horizonte fica onde o dedo soltou; sai com um toque fora
}
function recolher() {
  ponteiro.value = null
  mesDoTeclado.value = null
  if (!aberto.value) mirar(0)
}
function aoSair(e: PointerEvent) {
  if (e.pointerType === 'mouse' && !medindo) recolher()
}
function aoCancelar(e: PointerEvent) {
  // a página tomou o gesto (a rolagem vertical): nada fica preso
  if (e.pointerId === dedo) dedo = null
  medindo = false
  recolher()
}
function toqueFora(e: PointerEvent) {
  if (e.pointerType === 'mouse' || !raiz.value || raiz.value.contains(e.target as Node)) return
  if (aberto.value) return
  recolher()
}

/* ————— o botão e o teclado ————— */
const janela = ref<HTMLElement | null>(null)
function alternar() {
  aberto.value = !aberto.value
  ponteiro.value = null
  mesDoTeclado.value = aberto.value ? horizonte.value : null
  mirar(aberto.value ? 1 : 0)
  if (aberto.value) void nextTick(() => janela.value?.focus({ preventScroll: true }))
}
function aoTeclar(e: KeyboardEvent) {
  if (!aberto.value) return
  if (e.key === 'Escape') { e.preventDefault(); alternar(); return }
  let m = mesDoTeclado.value ?? horizonte.value
  const passo = e.shiftKey ? 12 : 1
  switch (e.key) {
    case 'ArrowRight': case 'ArrowUp': m += passo; break
    case 'ArrowLeft': case 'ArrowDown': m -= passo; break
    case 'Home': m = 1; break
    case 'End': m = horizonte.value; break
    default: return
  }
  e.preventDefault()
  ponteiro.value = null
  mesDoTeclado.value = Math.min(horizonte.value, Math.max(1, m))
}

onMounted(() => document.addEventListener('pointerdown', toqueFora, { passive: true }))
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', toqueFora)
  if (quadro != null) cancelAnimationFrame(quadro)
  if (fimDaChegada) clearTimeout(fimDaChegada)
})
// o período troca (ou o futuro some): tudo volta ao repouso
watch(() => [props.linha, temFuturo.value], () => {
  aberto.value = false
  ponteiro.value = null
  mesDoTeclado.value = null
  alvoDoZoom = 0
  z.value = 0
})

const vars = computed(() => ({
  '--a': hoje.value.toFixed(5),
  '--pres': String(presenca.value),
  '--pt': caixaDoPassado.value.topo.toFixed(5),
  '--ph': caixaDoPassado.value.altura.toFixed(5),
  '--lt': caixaDoLeque.value.topo.toFixed(5),
  '--lh': caixaDoLeque.value.altura.toFixed(5),
  '--lw': (aVista.value > 0 ? horizonte.value / aVista.value : 1).toFixed(5),
}))
</script>

<template>
  <div
    ref="raiz" class="cho" :class="{ 'cho--futuro': temFuturo, 'cho--chegando': chegando, 'cho--zoom': noFuturo, 'cho--lendo': !!leitura, 'cho--aberto': aberto }" :style="vars"
    @pointerdown="aoApertar" @pointermove="aoMover" @pointerup="aoSoltar" @pointercancel="aoCancelar" @pointerleave="aoSair"
  >
    <div class="cho__palco">
      <!-- o futuro: a janela corta em hoje e na beira; o leque, desenhado uma vez, só muda de caixa -->
      <div
        v-if="leque" ref="janela" class="cho__janela" :tabindex="aberto ? 0 : -1" :role="aberto ? 'group' : undefined"
        :aria-label="aberto ? 'O futuro da carteira, mês a mês. Setas movem a leitura; Esc volta para hoje.' : undefined" :aria-hidden="aberto ? undefined : true"
        @keydown="aoTeclar"
      >
        <svg class="cho__leque" :viewBox="`0 0 ${horizonte} 1000`" preserveAspectRatio="none" focusable="false" aria-hidden="true">
          <path :d="leque.larga" class="cho__faixa" />
          <path :d="leque.estreita" class="cho__faixa cho__faixa--dentro" />
          <path v-for="(d, i) in leque.fios" :key="i" :d="d" class="cho__fio" />
          <path :d="leque.meio" class="cho__meio" />
        </svg>
      </div>

      <!-- o passado: o gráfico de sempre, numa caixa que estreita e achata -->
      <div class="cho__passado">
        <AtivoGrafico :ativo="linha" :ibov="comparada" ticker="Você" rotulo-hoje="Você no período" :atual="atual" unidade="%" comparacao="CDI" tom="luz" :rotulo="rotulo" />
      </div>

      <div v-if="leque" ref="plot" class="cho__plot" aria-hidden="true">
        <span class="cho__hoje" :style="{ left: `${hoje * 100}%` }"><b>hoje</b></span>
        <span v-if="fim && fim.x <= 100.5" class="cho__fim" :style="{ left: `${fim.x}%`, top: `${fim.y}%` }" />
        <template v-if="leitura">
          <span class="cho__mira" :style="{ left: `${leitura.x}%` }" />
          <span class="cho__ponto" :style="{ left: `${leitura.x}%`, top: `${leitura.y}%` }" />
          <span class="cho__dica" :style="ancora(leitura.x)">
            <span class="cho__dica-d">{{ leitura.quando }}</span>
            <span class="cho__dica-l"><span class="cho__dica-p">{{ leitura.valor }}</span><span class="cho__dica-v" :class="`cho__dica-v--${leitura.dir}`">{{ leitura.var }}</span></span>
            <span class="cho__dica-i">{{ leitura.faixa }}</span>
          </span>
        </template>
      </div>
      <!-- sem o futuro, o desenho ainda precisa da medida do plot (o ponteiro lê por ela) -->
      <div v-else ref="plot" class="cho__plot" aria-hidden="true" />

    </div>

    <!-- o convite: o mais provável no fim do horizonte e o botão que abre e fecha (no celular, embaixo do eixo) -->
    <div v-if="leque && fim" class="cho__convite">
      <p class="cho__convite-t"><span>mais provável em {{ fim.ano }}</span><b>{{ fim.valor }}</b></p>
      <button type="button" class="cho__botao" :aria-pressed="aberto" @click="alternar">
        <template v-if="aberto">Voltar para hoje</template>
        <template v-else>Arraste para o futuro</template>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </button>
    </div>

    <!-- as pontas do eixo e, entre elas, o que o número do futuro é (o aviso do motor) -->
    <p v-if="leque" class="cho__eixo" aria-hidden="true">
      <span>{{ inicioDoEixo }}</span>
      <span class="cho__eixo-nota">{{ futuro?.disclaimer }}</span>
      <span>{{ fimDoEixo }}</span>
    </p>
    <span class="nu-sr" aria-live="polite">{{ leitura?.falada ?? '' }}</span>
  </div>
</template>

<style scoped>
.cho {
  /* os recuos do desenho são os do gráfico (o host os define em --agr-esq e --agr-dir) */
  --cho-esq: var(--agr-esq, 0px); --cho-dir: var(--agr-dir, 0px);
  --cho-largura: calc(100% - var(--cho-esq) - var(--cho-dir));
  --cho-hoje: calc(var(--cho-esq) + var(--cho-largura) * var(--a, 1));
  position: absolute; inset: 0; display: flex; flex-direction: column; touch-action: pan-y; user-select: none; -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.cho__palco { position: relative; flex: 1 1 auto; min-height: 0; }

/* ——— o passado ——— */
.cho__passado {
  position: absolute; left: 0; top: calc(var(--pt, 0) * 100%); height: calc(var(--ph, 1) * 100%);
  /* sem o futuro, a caixa é a largura toda e o ponto de hoje guarda o recuo da direita; com ele, hoje é a beira da caixa */
  width: calc(var(--cho-hoje) + var(--cho-dir) * (1 - var(--pres, 0)));
  --agr-dir: calc(var(--cho-dir) * (1 - var(--pres, 0)));
}
/* o futuro chegando: a caixa do passado estreita e a janela aparece, em transição (o zoom, depois, anda quadro a quadro, sem ela) */
.cho--chegando .cho__passado { transition: width var(--nu-dur-entrada) var(--nu-ease-saida), top var(--nu-dur-entrada) var(--nu-ease-saida), height var(--nu-dur-entrada) var(--nu-ease-saida); }
.cho--chegando .cho__passado :deep(.agr__plot) { transition: right var(--nu-dur-entrada) var(--nu-ease-saida); }
.cho--chegando .cho__janela { transition: left var(--nu-dur-entrada) var(--nu-ease-saida), opacity var(--nu-dur-entrada) var(--nu-ease-cor); }
.cho--chegando .cho__plot, .cho--chegando .cho__eixo { transition: opacity var(--nu-dur-entrada) var(--nu-ease-cor); }
/* com o horizonte aberto, o passado é contexto: as marcas, o rótulo de hoje e a leitura dele saem */
.cho__passado :deep(.agr__marca), .cho__passado :deep(.agr__hoje) { transition: opacity var(--nu-dur-media) var(--nu-ease-cor); }
.cho--zoom .cho__passado :deep(.agr__marca), .cho--zoom .cho__passado :deep(.agr__hoje),
.cho--zoom .cho__passado :deep(.agr__mira), .cho--zoom .cho__passado :deep(.agr__ponto), .cho--zoom .cho__passado :deep(.agr__dica) { opacity: 0; }
.cho--zoom .cho__passado :deep(.agr) { cursor: default; }

/* ——— o futuro ——— */
.cho__janela {
  position: absolute; top: 0; bottom: 0; left: var(--cho-hoje); right: var(--cho-dir); overflow: hidden; opacity: var(--pres, 0); outline: none;
  /* em repouso o leque passa do teto: ele some na beira de cima, sem corte seco */
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, var(--nu-ink) 12%); mask-image: linear-gradient(to bottom, transparent 0, var(--nu-ink) 12%);
}
.cho__janela:focus-visible { box-shadow: inset 0 0 0 3px var(--nu-blue-on-dark); border-radius: 6px; }
.cho__leque { position: absolute; left: 0; top: calc(var(--lt, 0) * 100%); width: calc(var(--lw, 1) * 100%); height: calc(var(--lh, 1) * 100%); overflow: visible; }
.cho__faixa { fill: color-mix(in srgb, var(--nu-blue-on-dark) 13%, transparent); }
.cho__faixa--dentro { fill: color-mix(in srgb, var(--nu-blue-on-dark) 16%, transparent); }
.cho__fio { fill: none; stroke: color-mix(in srgb, var(--nu-blue-soft) 22%, transparent); stroke-width: 1; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.cho__meio { fill: none; stroke: var(--nu-blue-on-dark); stroke-width: 2; stroke-dasharray: 5 5; stroke-linecap: round; vector-effect: non-scaling-stroke; }

/* ——— por cima: hoje, o fim, a leitura ——— */
.cho__plot { position: absolute; top: 0; bottom: 0; left: var(--cho-esq); right: var(--cho-dir); pointer-events: none; opacity: var(--pres, 0); }
.cho__hoje { position: absolute; top: 0; bottom: 0; width: 1px; transform: translateX(-.5px); background: var(--nu-cream-text-14); }
.cho__hoje b {
  position: absolute; top: 2px; left: 8px; color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto);
  transition: opacity var(--nu-dur-media) var(--nu-ease-cor);
}
.cho__fim {
  position: absolute; width: 11px; height: 11px; border-radius: 50%; transform: translate(-50%, -50%);
  background: var(--nu-blue-on-dark); box-shadow: 0 0 0 5px color-mix(in srgb, var(--nu-blue-on-dark) 22%, transparent);
}
.cho__mira { position: absolute; top: 0; bottom: 0; width: 1px; transform: translateX(-.5px); background: var(--nu-cream-text-45); }
.cho__ponto {
  position: absolute; width: 11px; height: 11px; border-radius: 50%; transform: translate(-50%, -50%);
  background: var(--nu-white); box-shadow: 0 0 0 3px var(--nu-blue-on-dark), 0 0 0 7px var(--nu-blue-28);
}
/* a dica: o mesmo cartãozinho do gráfico (AtivoGrafico, .agr__dica) */
.cho__dica {
  position: absolute; top: 0; transform: translate(var(--cho-dica-x, -50%), calc(-100% - 12px)); z-index: 2;
  display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 12px; border-radius: var(--nu-r-chip); white-space: nowrap;
  background: var(--nu-navy-2); color: var(--nu-cream-text); font-variant-numeric: tabular-nums;
  box-shadow: 0 0 0 1px var(--nu-cream-text-12), var(--nu-shadow-float);
}
.cho__dica-d, .cho__dica-i { color: var(--nu-cream-text-60); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); }
.cho__dica-l { display: flex; align-items: baseline; gap: 8px; }
.cho__dica-p { font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-titulo); }
.cho__dica-v { font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.cho__dica-v--up { color: var(--nu-green-soft); }
.cho__dica-v--down { color: var(--nu-red-soft); }

/* ——— o convite ——— */
.cho__convite {
  position: absolute; top: 0; right: var(--cho-dir); display: flex; flex-direction: column; align-items: flex-end; gap: 8px;
  opacity: var(--pres, 0); transition: opacity var(--nu-dur-media) var(--nu-ease-cor);
}
.cho__convite-t {
  display: flex; flex-direction: column; align-items: flex-end; gap: 2px; margin: 0; padding: 8px 12px; border-radius: var(--nu-r-chip);
  background: color-mix(in srgb, var(--nu-navy-2) 82%, transparent); box-shadow: 0 0 0 1px var(--nu-cream-text-12);
  font-variant-numeric: tabular-nums; white-space: nowrap; transition: opacity var(--nu-dur-media) var(--nu-ease-cor);
}
.cho__convite-t span { color: var(--nu-cream-text-60); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); }
.cho__convite-t b { color: var(--nu-white); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-titulo); }
/* lendo o futuro, a dica já diz o número: o cartão do convite sai da frente */
.cho--lendo .cho__convite-t { opacity: 0; }
.cho__botao {
  display: inline-flex; align-items: center; gap: 6px; flex: none; min-height: 32px; padding: 0 12px; border: 0; border-radius: var(--nu-r-pill); cursor: pointer; white-space: nowrap;
  background: color-mix(in srgb, var(--nu-navy-2) 82%, transparent); color: var(--nu-blue-on-blue-2); font: inherit; font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--nu-blue-on-dark) 55%, transparent);
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor), opacity var(--nu-dur-media) var(--nu-ease-cor);
}
.cho__botao:hover { background: color-mix(in srgb, var(--nu-blue-on-dark) 30%, var(--nu-navy-2)); color: var(--nu-white); }
.cho__botao:focus-visible { outline: 3px solid var(--nu-blue-on-dark); outline-offset: 2px; }
.cho__botao svg { transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.cho__botao:hover svg { transform: translateX(3px); }
.cho--aberto .cho__botao svg { transform: rotate(180deg); }
/* com o ponteiro já no futuro, o convite de arrastar cumpriu o papel (o de voltar, com o horizonte aberto, fica) */
.cho--zoom:not(.cho--aberto) .cho__botao { opacity: 0; pointer-events: none; }

/* ——— as pontas do eixo ——— */
.cho__eixo {
  flex: none; display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin: 8px 0 0; padding: 0 var(--cho-dir) 0 var(--cho-esq);
  color: var(--nu-cream-text-50); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); font-variant-numeric: tabular-nums;
  white-space: nowrap; opacity: var(--pres, 0);
}
/* o que o número do futuro é: o aviso do motor, sempre à vista junto do convite (a seção dos 5 anos conta o teste inteiro) */
.cho__eixo-nota { min-width: 0; overflow: hidden; text-overflow: ellipsis; }

/* celular: o futuro em repouso tem uns 90px, e o convite não cabe nele. Ele desce para baixo do eixo, numa linha
   (o número à esquerda, o botão à direita), e o rótulo de hoje do gráfico sai (a legenda de cima já diz o número) */
@media (max-width: 640px) {
  .cho__convite {
    position: static; order: 3; flex: none; flex-direction: row; align-items: center; justify-content: space-between; gap: 8px;
    margin-top: 10px; padding: 0 var(--cho-dir) 0 var(--cho-esq);
  }
  .cho__convite-t { flex: 0 1 auto; min-width: 0; align-items: flex-start; padding: 0; background: none; box-shadow: none; white-space: normal; }
  .cho__botao { min-height: 36px; }
  .cho--lendo .cho__convite-t { opacity: 1; }
  .cho--zoom:not(.cho--aberto) .cho__botao { opacity: 1; pointer-events: auto; }
  .cho--futuro .cho__passado :deep(.agr__hoje) { display: none; }
  /* o aviso desce para uma linha própria, inteiro, entre as pontas do eixo e o convite */
  .cho__eixo { flex-wrap: wrap; row-gap: 6px; }
  .cho__eixo-nota { order: 3; flex: 1 0 100%; white-space: normal; overflow: visible; }
}
@media (prefers-reduced-motion: reduce) {
  .cho__passado, .cho__passado :deep(.agr__plot), .cho__janela, .cho__plot, .cho__eixo,
  .cho__passado :deep(.agr__marca), .cho__passado :deep(.agr__hoje), .cho__hoje b, .cho__convite, .cho__convite-t, .cho__botao, .cho__botao svg { transition: none; }
}
</style>
