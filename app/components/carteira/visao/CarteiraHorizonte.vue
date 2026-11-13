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
//  - o futuro é uma tela (canvas) do tamanho do desenho, redesenhada quando a
//    janela muda: os caminhos do motor, as faixas de 8 e de 5 em cada 10 e o
//    mais provável tracejado. Em repouso cabem os 2.000; com o horizonte
//    aberto, os primeiros da ordem de nascimento (quantosCaminhosCabem), mais
//    fortes, para o leque pesar o mesmo;
//  - A ABERTURA (14/11; o dono: "quando abrir a carteira quero ver as linhas
//    sendo formadas, primeiro 1, depois outra e assim por diante, começando
//    lento e indo mais rápido até 2k"): toda vez que a carteira abre, os
//    caminhos nascem um a um em ordem aleatória, de hoje para a beira, com o
//    contador "futuros testados" no lugar do convite; o total dobra a cada
//    mesmo intervalo (nascidosEm), então a primeira linha se desenha sozinha e
//    no fim entram centenas por quadro. Só depois do último chegam as faixas, o
//    mais provável e o convite. O ponteiro que entra no futuro no meio da
//    abertura a termina na hora;
//  - a leitura do futuro (14/11; o dono, com o hover do leque grande na mão:
//    "no zoom seria legal ter uma visão tipo essa"): no mês sob o ponteiro
//    acendem os três caminhos REAIS que ali estão no p90, no p50 e no p10
//    (caminhosDoMes, a regra do leque da seção dos 5 anos), em verde, branco
//    e rosa, e o resto do leque apaga um pouco; ao lado da mira, o valor de
//    cada um ("se for bem", "o mais provável", "se for mal") e, no alto, o
//    mês. Sem os caminhos, os três valores são os quantis do motor;
//  - em repouso, o convite: o mais provável no fim do horizonte e o botão
//    "Arraste para o futuro", que também abre e fecha o horizonte no clique e
//    no teclado (aí as setas andam mês a mês e Esc volta).
// Quem hospeda acompanha (o evento `horizonte`, com o ano até onde a janela
// vai): o topo troca o rótulo "Você em 12 meses" e tira a legenda do passado.
// O zoom segue o ponteiro com um amortecimento curto (entra e sai sem tranco);
// o toque fica onde o dedo soltou e sai com um toque fora. Sem o futuro (o
// motor carregando, fora do ar, a carteira sem o que simular, o mock do dev), a
// peça é só o gráfico de antes, na largura toda; quando o futuro chega, ele
// entra abrindo espaço (o estado muda na hora; por ~0,8 s a caixa do passado
// anda em transição de CSS, que não depende dos quadros do script) e então os
// caminhos nascem. O R$ segue o olho da visita (`mascarado`): escondido, a
// leitura fica só em %. Movimento reduzido: sem amortecimento, sem entrada e
// sem a abertura (o leque aparece pronto).
import type { SeriesPoint } from '~/types/acao'
import type { FuturoDadosApi } from '~/types/assinatura'
import { afastarRotulos, anoDoFim, brlDoLeque, caminhosDoMes, mesDoLeque, rgbDaCor, type CaminhosDoLeque } from '~/utils/futuro'
import {
  NASCER_EM_MS, alfaDosCaminhos, caixaNoDominio, daquiAQuanto, desenhadoEm, dominioDoHorizonte, futuroAVista, mesSobOPonteiro, mesesDoPassado, nascidosEm,
  ondeFicaHoje, ondeFicaOMes, quantisNoMes, quantosCaminhosCabem, zoomDoPonteiro,
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
  /** os caminhos do motor (o leque); sem eles, só as faixas */
  caminhos?: CaminhosDoLeque | null
  /** o olho da visita fechado: o R$ some, o % fica */
  mascarado?: boolean
}>(), { futuro: null, caminhos: null, mascarado: false })
/** com o futuro à vista, até que ano a janela vai ('2029'); null em repouso. Só muda quando o ano muda, não a cada quadro. */
const emit = defineEmits<{ horizonte: [ate: string | null] }>()

/* ————— o que o motor mandou, pronto para desenhar ————— */
const serie = computed(() => props.futuro?.series ?? [])
const horizonte = computed(() => Math.max(0, serie.value.length - 1))
/** de onde o leque parte, em reais (a parte da carteira que o motor simula) */
const base = computed(() => serie.value[0]?.p50 ?? 0)
const passado = computed(() => mesesDoPassado(props.linha))
const hojeIndice = computed(() => props.linha[props.linha.length - 1]?.v ?? 0)
const temFuturo = computed(() => horizonte.value >= 2 && base.value > 0 && passado.value > 0 && hojeIndice.value > 0)
/** os caminhos, quando batem com a série do motor */
const fios = computed(() => (temFuturo.value && props.caminhos && props.caminhos.pontos === serie.value.length ? props.caminhos : null))

/* ————— o zoom: 0 em repouso, 1 com o horizonte inteiro ————— */
const z = ref(0)
/** o futuro no lugar: 0 sem ele (o gráfico de antes, na largura toda), 1 com ele */
const presenca = computed(() => (temFuturo.value ? 1 : 0))
/** o futuro entrando (ou saindo): por ~0,8 s a caixa do passado anda em transição de CSS, e o ponteiro espera */
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
  return temFuturo.value ? dominioDoHorizonte(p, serie.value, hojeIndice.value, base.value, aVista.value, z.value) : p
})
const emIndice = (v: number) => (hojeIndice.value * v) / base.value
/** onde um valor do leque (R$) cai na altura do desenho, de 0 (em cima) a 1 */
const alturaDe = (v: number) => (dominio.value.hi - emIndice(v)) / (dominio.value.hi - dominio.value.lo)
const caixaDoPassado = computed(() => caixaNoDominio(dominioDoPassado.value, dominio.value))

/* ————— a abertura: os caminhos nascendo ————— */
/** quantos caminhos já nasceram na abertura; null fora dela (o leque pronto) */
const contados = ref<number | null>(null)
/** as faixas e o mais provável: 0 durante a abertura, 1 depois (entram em ~0,5 s) */
const resultado = ref(1)
/** a ordem em que os caminhos nascem (aleatória, uma por montagem); com o horizonte aberto, os primeiros dela são a amostra */
let ordem: Uint32Array | null = null
let comecouEm = 0
let abertura: number | null = null
let fimDaAbertura: ReturnType<typeof setTimeout> | null = null
let esperaDaAbertura: ReturnType<typeof setTimeout> | null = null
const nfContador = new Intl.NumberFormat('pt-BR')
function embaralhar(n: number): Uint32Array {
  const o = new Uint32Array(n)
  for (let i = 0; i < n; i++) o[i] = i
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = o[i]!
    o[i] = o[j]!
    o[j] = t
  }
  return o
}
function pararAbertura() {
  if (abertura != null) cancelAnimationFrame(abertura)
  abertura = null
  if (fimDaAbertura) clearTimeout(fimDaAbertura)
  if (esperaDaAbertura) clearTimeout(esperaDaAbertura)
  fimDaAbertura = esperaDaAbertura = null
}
/** o leque pronto: todos nascidos, as faixas e o mais provável à vista */
function terminarAbertura(suave = false) {
  pararAbertura()
  const estava = contados.value != null
  contados.value = null
  if (!suave || !estava || calmo() || typeof requestAnimationFrame === 'undefined') {
    resultado.value = 1
    desenhar()
    return
  }
  // as faixas e o mais provável chegam em ~0,5 s
  const t0 = performance.now()
  const sobe = (agora: number) => {
    resultado.value = Math.min(1, (agora - t0) / 520)
    desenhar()
    abertura = resultado.value < 1 ? requestAnimationFrame(sobe) : null
  }
  abertura = requestAnimationFrame(sobe)
  // se os quadros não rodam (a aba escondida), o relógio fecha a conta
  fimDaAbertura = setTimeout(() => terminarAbertura(), 900)
}
function abrirOLeque() {
  pararAbertura()
  const c = fios.value
  if (!c || calmo() || typeof requestAnimationFrame === 'undefined') { terminarAbertura(); return }
  if (!ordem || ordem.length !== c.n) ordem = embaralhar(c.n)
  comecouEm = 0
  contados.value = 0
  resultado.value = 0
  desenhar()
  // espera o gráfico abrir espaço (a chegada) e então nasce o primeiro
  esperaDaAbertura = setTimeout(() => {
    comecouEm = performance.now()
    const passo = (agora: number) => {
      const t = agora - comecouEm
      if (t >= NASCER_EM_MS) { terminarAbertura(true); return }
      contados.value = Math.floor(nascidosEm(t, c.n))
      desenhar(t)
      abertura = requestAnimationFrame(passo)
    }
    abertura = requestAnimationFrame(passo)
    // se os quadros não rodam (a aba escondida), o relógio fecha a conta
    fimDaAbertura = setTimeout(() => terminarAbertura(), NASCER_EM_MS + 1500)
  }, chegando.value ? 820 : 120)
}

/* ————— a tela do futuro ————— */
const tela = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let largura = 0
let altura = 0
let medidor: ResizeObserver | null = null
let corDosFios: [number, number, number] = [169, 196, 255]
let corDoMeio: [number, number, number] = [91, 140, 255]
let corDoTraco: [number, number, number] = [220, 230, 255]
let corDoFundo: [number, number, number] = [17, 24, 39]
let corDoBem: [number, number, number] = [134, 239, 172]
let corDoMal: [number, number, number] = [252, 165, 165]
let corDoCreme: [number, number, number] = [246, 242, 233]
const rgba = (c: [number, number, number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`
const misturar = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t].map(Math.round) as [number, number, number]
/** os três caminhos acesos pela leitura (a tela os desenha por cima); null sem leitura ou sem os caminhos */
let acesos: { i: number; papel: Papel; abaixo: boolean }[] | null = null
function medirTela() {
  const el = tela.value
  if (!el) { ctx = null; return }
  const r = el.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  largura = r.width
  altura = r.height
  el.width = Math.max(1, Math.round(largura * dpr))
  el.height = Math.max(1, Math.round(altura * dpr))
  ctx = el.getContext('2d')
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  alturaDoDesenho.value = altura
  larguraDoDesenho.value = largura
  const estilo = getComputedStyle(el)
  corDosFios = rgbDaCor(estilo.getPropertyValue('--nu-blue-soft')) ?? corDosFios
  corDoMeio = rgbDaCor(estilo.getPropertyValue('--nu-blue-on-dark')) ?? corDoMeio
  corDoTraco = rgbDaCor(estilo.getPropertyValue('--nu-blue-on-blue-2')) ?? corDoTraco
  corDoFundo = rgbDaCor(estilo.getPropertyValue('--nu-ink')) ?? corDoFundo
  corDoBem = rgbDaCor(estilo.getPropertyValue('--nu-green-soft')) ?? corDoBem
  corDoMal = rgbDaCor(estilo.getPropertyValue('--nu-red-soft')) ?? corDoMal
  corDoCreme = rgbDaCor(estilo.getPropertyValue('--nu-cream-text')) ?? corDoCreme
  desenhar()
}
/**
 * O leque na janela de agora. `t` é o tempo da abertura (ms desde o primeiro
 * caminho); sem ele, o leque pronto.
 */
function desenhar(tempo?: number) {
  if (!ctx || largura <= 0 || altura <= 0) return
  ctx.clearRect(0, 0, largura, altura)
  if (!temFuturo.value) return
  // quem redesenha no meio da abertura (a tela que mediu o tamanho, a janela que mudou) desenha o que já nasceu,
  // e nada antes do primeiro: o leque inteiro aparecia por um instante antes de recomeçar do zero (14/11, o dono)
  const t = tempo ?? (contados.value != null ? (comecouEm ? performance.now() - comecouEm : 0) : undefined)
  const s = serie.value
  const P = passado.value
  const F = aVista.value
  if (!(F > 0)) return
  const xDe = (m: number) => largura * ((P + m) / (P + F))
  const yDe = (v: number) => altura * alturaDe(v)
  const x0 = xDe(0)
  // um mês além da beira: o último trecho sai da tela inteiro
  const ultimo = Math.min(horizonte.value, Math.ceil(F) + 1)
  ctx.save()
  ctx.beginPath()
  ctx.rect(x0, 0, largura - x0, altura)
  ctx.clip()
  ctx.lineJoin = 'round'

  // as faixas: 8 e 5 em cada 10 caminhos
  if (resultado.value > 0) {
    const faixa = (cima: 'p90' | 'p75', baixo: 'p10' | 'p25', a: number) => {
      ctx!.beginPath()
      for (let m = 0; m <= ultimo; m++) ctx!.lineTo(xDe(m), yDe(s[m]![cima]))
      for (let m = ultimo; m >= 0; m--) ctx!.lineTo(xDe(m), yDe(s[m]![baixo]))
      ctx!.closePath()
      ctx!.fillStyle = rgba(corDoMeio, a * resultado.value)
      ctx!.fill()
    }
    faixa('p90', 'p10', 0.13)
    faixa('p75', 'p25', 0.12)
  }

  // os caminhos: na abertura, os que já nasceram (o mais novo ainda se desenhando); depois, os que cabem na janela
  const c = fios.value
  if (c && ordem) {
    const nasceram = t == null ? c.n : Math.min(c.n, Math.ceil(nascidosEm(t, c.n)))
    const quantos = Math.min(nasceram, quantosCaminhosCabem(c.n, F))
    ctx.lineWidth = largura < 420 ? 0.8 : 1
    ctx.strokeStyle = rgba(corDosFios, alfaDosCaminhos(quantos) * (acesos ? 0.5 : 1))
    const P1 = c.pontos
    for (let k = 0; k < quantos; k++) {
      const o = ordem[k]! * P1
      // quanto deste caminho já se desenhou (de hoje para a beira); 1 fora da abertura
      const feito = t == null ? 1 : desenhadoEm(k, t, c.n)
      if (feito <= 0) continue
      const ate = feito >= 1 ? Infinity : x0 + (largura - x0) * feito
      ctx.beginPath()
      ctx.moveTo(x0, yDe(c.valores[o]!))
      let xa = x0
      let ya = yDe(c.valores[o]!)
      for (let m = 1; m <= ultimo; m++) {
        const x = xDe(m)
        const y = yDe(c.valores[o + m]!)
        if (x > ate) {
          // o trecho para na ponta que ainda se desenha
          const f = (ate - xa) / (x - xa)
          ctx.lineTo(ate, ya + (y - ya) * f)
          break
        }
        ctx.lineTo(x, y)
        xa = x
        ya = y
      }
      ctx.stroke()
    }
  }

  // os três caminhos da leitura, acesos: o de baixo e o de cima primeiro, o mais provável por cima
  if (c && acesos) {
    const P1 = c.pontos
    for (const r of [acesos[2]!, acesos[0]!, acesos[1]!]) {
      const o = r.i * P1
      const linha = () => {
        ctx!.beginPath()
        for (let m = 0; m <= ultimo; m++) ctx!.lineTo(xDe(m), yDe(c.valores[o + m]!))
      }
      linha()
      ctx.lineWidth = 5
      ctx.strokeStyle = rgba(corDoFundo, 0.55)
      ctx.stroke()
      linha()
      ctx.lineWidth = r.papel === 'meio' ? 2.2 : 1.8
      ctx.strokeStyle = rgba(r.papel === 'otimista' ? corDoBem : r.papel === 'meio' ? corDoCreme : r.abaixo ? corDoMal : misturar(corDoCreme, corDoMal, 0.6), 1)
      ctx.stroke()
    }
  }

  // o mais provável, tracejado: um leito escuro por baixo o separa das linhas, e o traço claro continua a linha do passado
  // (com os três caminhos acesos, ele recua: o caminho branco é quem fala)
  if (resultado.value > 0 && !acesos) {
    const meio = () => {
      ctx!.beginPath()
      for (let m = 0; m <= ultimo; m++) ctx!.lineTo(xDe(m), yDe(s[m]!.p50))
    }
    ctx.lineCap = 'round'
    meio()
    ctx.lineWidth = 5
    ctx.strokeStyle = rgba(corDoFundo, 0.5 * resultado.value)
    ctx.stroke()
    meio()
    ctx.setLineDash([6, 6])
    ctx.lineWidth = 2
    ctx.strokeStyle = rgba(corDoTraco, resultado.value)
    ctx.stroke()
    ctx.setLineDash([])
  }
  ctx.restore()
}

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
/** os três caminhos de cada mês: os reais que ali estão no p90, no p50 e no p10 (uma conta só, na primeira leitura) */
const trios = computed(() => {
  const c = fios.value
  return c ? Array.from({ length: c.pontos }, (_, t) => caminhosDoMes(c, serie.value, t)) : null
})
/** o valor de um caminho num mês fracionário */
function noCaminho(i: number, m: number): number {
  const c = fios.value!
  const a = Math.min(c.pontos - 1, Math.floor(m))
  const b = Math.min(c.pontos - 1, a + 1)
  const o = i * c.pontos
  return c.valores[o + a]! + (c.valores[o + b]! - c.valores[o + a]!) * (m - a)
}
type Papel = 'otimista' | 'meio' | 'pessimista'
const PAPEIS: { papel: Papel; nome: string; quantil: 'p90' | 'p50' | 'p10' }[] = [
  { papel: 'otimista', nome: 'se for bem', quantil: 'p90' },
  { papel: 'meio', nome: 'o mais provável', quantil: 'p50' },
  { papel: 'pessimista', nome: 'se for mal', quantil: 'p10' },
]
/** o desenho em px (a tela o mede): os três rótulos se afastam em px e ficam do lado da mira em que cabem */
const alturaDoDesenho = ref(0)
const larguraDoDesenho = ref(0)
const leitura = computed(() => {
  const m = mes.value
  const q = m != null ? quantisNoMes(serie.value, m) : null
  if (m == null || !q || m < 0.05) return null
  const p = pctSobreHoje(q.p50)
  const trio = trios.value?.[Math.min(horizonte.value, Math.max(1, Math.round(m)))] ?? null
  // os três valores: o de cada caminho aceso naquele ponto; sem os caminhos, os quantis do motor
  const tres = PAPEIS.map((r) => {
    const v = trio ? noCaminho(trio[r.papel], m) : q[r.quantil]
    return { ...r, i: trio ? trio[r.papel] : -1, v, y: alturaDe(v), texto: props.mascarado ? pctAtivo(pctSobreHoje(v)) : brlDoLeque(v), abaixo: v < base.value }
  })
  const H = alturaDoDesenho.value
  const tops = H > 0 ? afastarRotulos(tres.map((r) => r.y * H), 30, 46, H - 16) : tres.map((r) => r.y * H)
  // de que lado da mira os rótulos ficam: à esquerda, dentro do futuro, quando cabem ali; senão à direita; sem
  // lugar em nenhum, do lado maior (perto de hoje eles caíam em cima da linha do passado)
  const x = ondeFicaOMes(m, z.value, passado.value, horizonte.value)
  const W = larguraDoDesenho.value
  const cabe = W < 420 ? 96 : 210
  const esquerda = (x - hoje.value) * W
  const direita = (1 - x) * W
  return {
    x: x * 100,
    naDireita: esquerda < cabe && (direita >= cabe || direita > esquerda),
    tres: tres.map((r, k) => ({ ...r, topo: tops[k]! })),
    quando: `${mesDoLeque(props.futuro!.as_of, Math.max(1, Math.round(m)))} · ${daquiAQuanto(m)}`,
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

// a janela mudou (o zoom, o período, o tamanho) ou a leitura andou: a tela acompanha, com os três caminhos da
// leitura acesos. Durante a abertura, o próprio passo redesenha.
watch([z, dominio, hoje, mes], () => {
  const l = leitura.value
  acesos = l && l.tres[0]!.i >= 0 ? l.tres.map((r) => ({ i: r.i, papel: r.papel, abaixo: r.abaixo })) : null
  if (contados.value == null) desenhar()
}, { flush: 'post' })

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
/**
 * Quem hospeda o gráfico acompanha (14/11/2026; o dono: "quando estiver colocando no futuro altere esse
 * texto Você em 12 meses, e pode tirar esses textos para o gráfico ir ocupando mais espaço").
 */
const ateOAno = computed(() => (noFuturo.value ? (fimDoEixo.value.split('/')[1] ?? null) : null))
watch(ateOAno, (ano) => emit('horizonte', ano))

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
  // quem entra no futuro no meio da abertura não espera: o leque fica pronto
  if (pede > 0 && contados.value != null) terminarAbertura()
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
  if (contados.value != null) terminarAbertura()
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

/* ————— a vida da peça ————— */
// o futuro chega (ou some): o estado muda na hora; a transição é só o acabamento, e não roda com movimento reduzido
watch(temFuturo, (tem) => {
  if (fimDaChegada) clearTimeout(fimDaChegada)
  chegando.value = !calmo()
  if (chegando.value) fimDaChegada = setTimeout(() => { chegando.value = false }, 800)
  if (!tem) { pararAbertura(); contados.value = null; resultado.value = 1 }
})
// a tela existe (o futuro chegou, ou a peça montou já com ele): mede, e os caminhos nascem
watch(tela, (el, velha) => {
  if (velha) medidor?.unobserve(velha)
  if (!el) { ctx = null; return }
  medidor ??= new ResizeObserver(() => medirTela())
  medidor.observe(el)
  medirTela()
  abrirOLeque()
}, { flush: 'post' })
// os caminhos chegam depois da tela, ou trocam: a abertura recomeça com eles
watch(fios, (novo, velho) => { if (tela.value && novo && novo !== velho) abrirOLeque() }, { flush: 'post' })
// o período troca: tudo volta ao repouso (o leque fica como está)
watch(() => props.linha, () => {
  aberto.value = false
  ponteiro.value = null
  mesDoTeclado.value = null
  alvoDoZoom = 0
  z.value = 0
})
onMounted(() => document.addEventListener('pointerdown', toqueFora, { passive: true }))
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', toqueFora)
  if (quadro != null) cancelAnimationFrame(quadro)
  if (fimDaChegada) clearTimeout(fimDaChegada)
  pararAbertura()
  medidor?.disconnect()
})

const vars = computed(() => ({
  '--a': hoje.value.toFixed(5),
  '--pres': String(presenca.value),
  '--pt': caixaDoPassado.value.topo.toFixed(5),
  '--ph': caixaDoPassado.value.altura.toFixed(5),
}))
</script>

<template>
  <div
    ref="raiz" class="cho"
    :class="{ 'cho--futuro': temFuturo, 'cho--chegando': chegando, 'cho--zoom': noFuturo, 'cho--lendo': !!leitura, 'cho--aberto': aberto, 'cho--testando': contados != null }"
    :style="vars"
    @pointerdown="aoApertar" @pointermove="aoMover" @pointerup="aoSoltar" @pointercancel="aoCancelar" @pointerleave="aoSair"
  >
    <div class="cho__palco">
      <!-- o futuro: a tela do tamanho do desenho; o leque é redesenhado na janela de agora -->
      <canvas v-if="temFuturo" ref="tela" class="cho__tela" aria-hidden="true" />

      <!-- o passado: o gráfico de sempre, numa caixa que estreita e achata -->
      <div class="cho__passado">
        <AtivoGrafico :ativo="linha" :ibov="comparada" ticker="Você" rotulo-hoje="Você no período" :atual="atual" unidade="%" comparacao="CDI" tom="luz" :rotulo="rotulo" />
      </div>

      <!-- com o horizonte aberto, o futuro recebe o foco e as setas -->
      <div
        v-if="temFuturo" ref="janela" class="cho__janela" :tabindex="aberto ? 0 : -1" :role="aberto ? 'group' : undefined"
        :aria-label="aberto ? 'O futuro da carteira, mês a mês. Setas movem a leitura; Esc volta para hoje.' : undefined" :aria-hidden="aberto ? undefined : true"
        @keydown="aoTeclar"
      />

      <div ref="plot" class="cho__plot" aria-hidden="true">
        <template v-if="temFuturo">
          <span class="cho__hoje" :style="{ left: `${hoje * 100}%` }"><b>hoje</b></span>
          <span v-if="fim && fim.x <= 100.5" class="cho__fim" :style="{ left: `${fim.x}%`, top: `${fim.y}%` }" />
          <template v-if="leitura">
            <span class="cho__mira" :style="{ left: `${leitura.x}%` }" />
            <!-- o mês, no alto da mira -->
            <span class="cho__dica" :style="ancora(leitura.x)">{{ leitura.quando }}</span>
            <!-- os três caminhos acesos: o ponto de cada um na mira e o valor ao lado (do lado em que cabe) -->
            <template v-for="r in leitura.tres" :key="r.papel">
              <span class="cho__ponto" :class="[`cho__ponto--${r.papel}`, { 'cho__ponto--abaixo': r.abaixo }]" :style="{ left: `${leitura.x}%`, top: `${r.y * 100}%` }" />
              <span
                class="cho__rotulo" :class="[`cho__rotulo--${r.papel}`, { 'cho__rotulo--abaixo': r.abaixo, 'cho__rotulo--direita': leitura.naDireita }]"
                :style="{ left: `${leitura.x}%`, top: `${r.topo}px` }"
              ><b>{{ r.texto }}</b><span>{{ r.nome }}</span></span>
            </template>
          </template>
        </template>
      </div>
    </div>

    <!-- o convite: na abertura, o contador dos futuros testados; depois, o mais provável no fim do horizonte
         e o botão que abre e fecha (no celular, embaixo do eixo) -->
    <div v-if="temFuturo && fim" class="cho__convite">
      <p class="cho__convite-t">
        <template v-if="contados != null"><span>futuros testados</span><b aria-hidden="true">{{ nfContador.format(contados) }}</b><span class="nu-sr">Testando a carteira em {{ nfContador.format(futuro?.paths ?? 0) }} futuros.</span></template>
        <template v-else><span>mais provável em {{ fim.ano }}</span><b>{{ fim.valor }}</b></template>
      </p>
      <button type="button" class="cho__botao" :aria-pressed="aberto" @click="alternar">
        <template v-if="aberto">Voltar para hoje</template>
        <template v-else>Arraste para o futuro</template>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </button>
    </div>

    <!-- as pontas do eixo e, entre elas, o que o número do futuro é (o aviso do motor) -->
    <p v-if="temFuturo" class="cho__eixo" aria-hidden="true">
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
/* o futuro chegando: a caixa do passado estreita, em transição (o zoom, depois, anda quadro a quadro, sem ela) */
.cho--chegando .cho__passado { transition: width var(--nu-dur-entrada) var(--nu-ease-saida), top var(--nu-dur-entrada) var(--nu-ease-saida), height var(--nu-dur-entrada) var(--nu-ease-saida); }
.cho--chegando .cho__passado :deep(.agr__plot) { transition: right var(--nu-dur-entrada) var(--nu-ease-saida); }
.cho--chegando .cho__plot, .cho--chegando .cho__eixo { transition: opacity var(--nu-dur-entrada) var(--nu-ease-cor); }
/* com o horizonte aberto, o passado é contexto: as marcas, o rótulo de hoje e a leitura dele saem */
.cho__passado :deep(.agr__marca), .cho__passado :deep(.agr__hoje) { transition: opacity var(--nu-dur-media) var(--nu-ease-cor); }
.cho--zoom .cho__passado :deep(.agr__marca), .cho--zoom .cho__passado :deep(.agr__hoje),
.cho--zoom .cho__passado :deep(.agr__mira), .cho--zoom .cho__passado :deep(.agr__ponto), .cho--zoom .cho__passado :deep(.agr__dica) { opacity: 0; }
.cho--zoom .cho__passado :deep(.agr) { cursor: default; }

/* ——— o futuro ——— */
.cho__tela {
  position: absolute; top: 0; bottom: 0; left: var(--cho-esq); right: var(--cho-dir); width: var(--cho-largura); height: 100%; pointer-events: none;
  /* em repouso o leque passa do teto: ele some na beira de cima, sem corte seco */
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, var(--nu-ink) 12%); mask-image: linear-gradient(to bottom, transparent 0, var(--nu-ink) 12%);
}
.cho__janela { position: absolute; top: 0; bottom: 0; left: var(--cho-hoje); right: var(--cho-dir); outline: none; }
.cho__janela:focus-visible { box-shadow: inset 0 0 0 3px var(--nu-blue-on-dark); border-radius: 6px; }

/* ——— por cima: hoje, o fim, a leitura ——— */
.cho__plot { position: absolute; top: 0; bottom: 0; left: var(--cho-esq); right: var(--cho-dir); pointer-events: none; }
.cho__hoje { position: absolute; top: 0; bottom: 0; width: 1px; transform: translateX(-.5px); background: var(--nu-cream-text-14); }
/* a palavra fica no pé da linha: em cima moram a dica e o convite */
.cho__hoje b {
  position: absolute; bottom: 2px; left: 8px; color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto);
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
/* o mês da leitura: uma etiqueta no alto da mira (o cartãozinho da dica do gráfico, pequeno). Fica dentro do desenho:
   com o futuro à vista o gráfico sobe para o lugar da legenda, e por cima dele estão o rótulo e os períodos */
.cho__dica {
  position: absolute; top: 8px; transform: translateX(var(--cho-dica-x, -50%)); z-index: 2;
  padding: 6px 10px; border-radius: var(--nu-r-chip); white-space: nowrap;
  background: var(--nu-navy-2); color: var(--nu-cream-text-70); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto);
  font-variant-numeric: tabular-nums; box-shadow: 0 0 0 1px var(--nu-cream-text-12), var(--nu-shadow-float);
}
/* com o horizonte aberto pelo botão, "Voltar para hoje" fica no canto de cima: a etiqueta desce para baixo dele */
.cho--aberto .cho__dica { top: 46px; }
/* os três caminhos acesos: o ponto de cada um na mira, na cor dele, e o valor ao lado */
.cho__ponto {
  position: absolute; width: 11px; height: 11px; border-radius: 50%; transform: translate(-50%, -50%); z-index: 1;
  background: var(--nu-cream-text); box-shadow: 0 0 0 2.5px var(--nu-ink);
}
.cho__ponto--otimista { background: var(--nu-green-soft); }
/* o "se for mal" que segue acima de hoje é rosado, sem o rosa cheio do prejuízo; abaixo de hoje, o rosa cheio */
.cho__ponto--pessimista { background: color-mix(in srgb, var(--nu-cream-text) 40%, var(--nu-red-soft)); }
.cho__ponto--pessimista.cho__ponto--abaixo { background: var(--nu-red-soft); }
.cho__rotulo {
  position: absolute; z-index: 2; transform: translate(calc(-100% - 14px), -50%); display: inline-flex; align-items: baseline; gap: 8px;
  padding: 5px 10px; border-radius: var(--nu-r-chip); white-space: nowrap; font-variant-numeric: tabular-nums;
  background: color-mix(in srgb, var(--nu-navy-2) 92%, transparent); box-shadow: 0 0 0 1px var(--nu-cream-text-12);
}
.cho__rotulo--direita { transform: translate(14px, -50%); }
.cho__rotulo b { color: var(--nu-cream-text); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-titulo); }
.cho__rotulo span { color: var(--nu-cream-text-60); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); }
.cho__rotulo--otimista b { color: var(--nu-green-soft); }
.cho__rotulo--pessimista b { color: color-mix(in srgb, var(--nu-cream-text) 40%, var(--nu-red-soft)); }
.cho__rotulo--pessimista.cho__rotulo--abaixo b { color: var(--nu-red-soft); }

/* ——— o convite ——— */
.cho__convite { position: absolute; top: 0; right: var(--cho-dir); display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
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
/* na abertura o convite é o contador; o botão chega com o resultado */
.cho--testando .cho__botao { opacity: 0; pointer-events: none; }

/* ——— as pontas do eixo ——— */
.cho__eixo {
  flex: none; display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin: 8px 0 0; padding: 0 var(--cho-dir) 0 var(--cho-esq);
  color: var(--nu-cream-text-50); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); font-variant-numeric: tabular-nums;
  white-space: nowrap;
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
  .cho--aberto .cho__dica { top: 8px; }
  /* no celular os rótulos ficam só com o valor (a cor e a ordem dizem qual é qual) */
  .cho__rotulo { padding: 4px 8px; transform: translate(calc(-100% - 10px), -50%); }
  .cho__rotulo--direita { transform: translate(10px, -50%); }
  .cho__rotulo span { display: none; }
  .cho--futuro .cho__passado :deep(.agr__hoje) { display: none; }
  /* o aviso desce para uma linha própria, inteiro, entre as pontas do eixo e o convite */
  .cho__eixo { flex-wrap: wrap; row-gap: 6px; }
  .cho__eixo-nota { order: 3; flex: 1 0 100%; white-space: normal; overflow: visible; }
}
@media (prefers-reduced-motion: reduce) {
  .cho__passado, .cho__passado :deep(.agr__plot), .cho__plot, .cho__eixo,
  .cho__passado :deep(.agr__marca), .cho__passado :deep(.agr__hoje), .cho__convite-t, .cho__botao, .cho__botao svg { transition: none; }
}
</style>
