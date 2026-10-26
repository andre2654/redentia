<script setup lang="ts">
// O recado do André (dono, 26/10/2026, segunda depois do 2º turno, com o EWZ
// caindo forte antes da abertura): "pra tranquilizar as pessoas". Um bilhete,
// não um anúncio:
//  - só para quem está logado (quem tem carteira ou segue papel é quem sente o
//    dia vermelho) e só na home, na carteira, nas notícias, nas teses, na conta
//    e nos ativos. Fora das calculadoras, dos guias e da preço teto: quem chega
//    pelo Google não vê diálogo cobrindo a página (o Google penaliza, e o
//    NuMcpPromo saiu em 15/10 por isso);
//  - abre uma vez por pessoa (fechou, não volta) e some sozinho depois de
//    RECADO.ate;
//  - não abre por cima de outro diálogo (onboarding, folha de cadastro);
//  - `?recado=1` abre sempre, para conferir em produção sem conta;
//  - a faixa do topo (NuRecadoFaixa) abre esta mesma janela no clique, para
//    qualquer pessoa e em qualquer página onde a faixa aparece.
// O topo é a serra do rodapé (NuFooterCordilheira) em miniatura: o Ibovespa
// mês a mês desde 1995, com 2008 e 2020 marcados. Horizonte longo é o que
// segura a mão no dia vermelho (pesquisa de microinterações, 19/10/2026), e o
// dado é o real (content/ibov-mensal.ts). O fecho vem escrito à mão (Caveat,
// carregada só quando o bilhete vai abrir) e assinado com a foto do André.
// Sem recomendação: o texto não diz para vender, segurar nem comprar.
import { IBOV_MENSAL, IBOV_MENSAL_INICIO } from '~/content/ibov-mensal'
import { RECADO, RECADO_LETRA, eventoRecado, recadoNoAr } from '~/composables/useRecado'

const VISTO = `nu:recado:${RECADO.id}`

const { isAuthenticated } = useAuthState()
const route = useRoute()

const { aberto } = useRecado()
const cardRef = ref<HTMLElement | null>(null)
const tituloId = useId()
useModalA11y(cardRef, aberto)
let espera: ReturnType<typeof setTimeout> | undefined

function rotaDoRecado(p: string): boolean {
  return ['/', '/carteira', '/noticias', '/teses', '/conta'].includes(p) || p.startsWith('/asset/')
}
function ler(chave: string): string | null {
  try { return localStorage.getItem(chave) }
  catch { return null }
}
function gravar(chave: string, valor: string) {
  try { localStorage.setItem(chave, valor) }
  catch { /* modo privado: vale só nesta visita */ }
}
// A letra de mão só desce para quem vai ver o bilhete; se demorar, o bilhete
// abre com a reserva (cursiva do sistema) e troca quando ela chegar.
async function carregarLetra() {
  if (!document.getElementById('nu-recado-letra')) {
    const l = document.createElement('link')
    l.id = 'nu-recado-letra'
    l.rel = 'stylesheet'
    l.href = RECADO_LETRA
    document.head.appendChild(l)
  }
  try {
    await Promise.race([
      document.fonts.load('700 34px Caveat'),
      new Promise((r) => setTimeout(r, 900)),
    ])
  }
  catch { /* sem a API de fontes: segue com a reserva */ }
}

async function abrir(forcado: boolean) {
  if (!forcado && document.querySelector('[aria-modal="true"]')) return
  await carregarLetra()
  aberto.value = true
  gravar(VISTO, String(Date.now()))
  eventoRecado('recado_aberto', { forcado: String(forcado) })
}

function fechar(como: string) {
  if (!aberto.value) return
  aberto.value = false
  eventoRecado('recado_fechado', { como })
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') fechar('esc')
}

watch(aberto, (v) => {
  if (import.meta.server) return
  document.documentElement.style.overflow = v ? 'hidden' : ''
  if (v) {
    gravar(VISTO, String(Date.now()))
    document.addEventListener('keydown', onKey)
    nextTick(() => cardRef.value?.focus())
  }
  else {
    document.removeEventListener('keydown', onKey)
  }
})

onMounted(() => {
  const forcado = route.query.recado === '1'
  const pode = forcado || (
    isAuthenticated.value
    && recadoNoAr()
    && rotaDoRecado(route.path)
    && !ler(VISTO)
  )
  if (pode) espera = setTimeout(() => abrir(forcado), 900)
})

onBeforeUnmount(() => {
  clearTimeout(espera)
  if (import.meta.server) return
  document.removeEventListener('keydown', onKey)
  document.documentElement.style.overflow = ''
})

// ——— a serra: o Ibovespa mês a mês, em escala log (senão 1995 vira chão) ———
const VW = 560
const VH = 150
// a crista começa abaixo da legenda e do ✕: o cume de hoje não some atrás do botão
const TOPO = 60
const BASE = 142
const n = IBOV_MENSAL.length
const logs = IBOV_MENSAL.map((v) => Math.log(v))
const lo = Math.min(...logs)
const hi = Math.max(...logs)
const xDe = (i: number) => 8 + (i / (n - 1)) * (VW - 22)
const yDe = (l: number, topo = TOPO, base = BASE) => topo + (1 - (l - lo) / (hi - lo)) * (base - topo)
function suave(arr: number[], janela: number) {
  const r = Math.floor(janela / 2)
  return arr.map((_, i) => {
    let s = 0
    let k = 0
    for (let j = Math.max(0, i - r); j <= Math.min(arr.length - 1, i + r); j++) { s += arr[j]!; k++ }
    return s / k
  })
}
function crista(serie: number[], topo: number, base: number) {
  return serie.map((l, i) => `${i ? 'L' : 'M'}${xDe(i).toFixed(1)},${yDe(l, topo, base).toFixed(1)}`).join('')
}
const cristaFrente = crista(logs, TOPO, BASE)
const corpoFrente = `${cristaFrente}L${VW},${yDe(logs.at(-1)!).toFixed(1)}L${VW},${VH}L0,${VH}L0,${yDe(logs[0]!).toFixed(1)}Z`
const cristaFundo = crista(suave(logs, 9), TOPO - 18, BASE - 22)
const corpoFundo = `${cristaFundo}L${VW},${VH}L0,${VH}Z`

// os dois vales que todo mundo lembra: o fundo de cada crise, achado no dado
const [ANO_INICIO] = IBOV_MENSAL_INICIO.split('-').map(Number) as [number]
function fundoEntre(de: string, ate: string) {
  const idx = (s: string) => { const [a, m] = s.split('-').map(Number) as [number, number]; return (a - ANO_INICIO) * 12 + (m - 1) }
  let melhor = idx(de)
  for (let i = idx(de); i <= Math.min(idx(ate), n - 1); i++) if (IBOV_MENSAL[i]! < IBOV_MENSAL[melhor]!) melhor = i
  return { x: xDe(melhor), y: yDe(logs[melhor]!) }
}
const VALES = [
  { rotulo: '2008', ...fundoEntre('2008-06', '2009-03') },
  { rotulo: '2020', ...fundoEntre('2020-01', '2020-06') },
]
const hoje = { x: xDe(n - 1), y: yDe(logs.at(-1)!) }
</script>

<template>
  <Teleport to="body">
    <div v-if="aberto" class="rec" @click="fechar('fundo')">
      <div
        ref="cardRef"
        class="rec__card"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="tituloId"
        tabindex="-1"
        @click.stop
      >
        <div class="rec__serra" aria-hidden="true">
          <svg :viewBox="`0 0 ${VW} ${VH}`" preserveAspectRatio="xMidYMax slice" class="rec__svg">
            <defs>
              <linearGradient id="rec-gelo" x1="0" :y1="TOPO" x2="0" :y2="VH" gradientUnits="userSpaceOnUse">
                <stop offset="0" class="rec__s-neve" />
                <stop offset="1" class="rec__s-base" />
              </linearGradient>
            </defs>
            <path :d="corpoFundo" class="rec__fundo" />
            <path :d="corpoFrente" fill="url(#rec-gelo)" />
            <path :d="cristaFrente" class="rec__crista" pathLength="1" />
            <g v-for="v in VALES" :key="v.rotulo" class="rec__vale">
              <line :x1="v.x" :y1="v.y + 5" :x2="v.x" :y2="v.y + 16" />
              <text :x="v.x" :y="v.y + 28" text-anchor="middle">{{ v.rotulo }}</text>
            </g>
            <circle :cx="hoje.x" :cy="hoje.y" r="3.5" class="rec__hoje" />
          </svg>
          <span class="rec__legenda">Ibovespa, mês a mês, desde 1995</span>
        </div>
        <button type="button" class="rec__x" aria-label="Fechar" @click="fechar('x')">✕</button>

        <div class="rec__corpo">
          <div class="rec__de">
            <img src="/img/recado/andre.jpg" alt="" width="44" height="44" class="rec__foto">
            <div class="rec__de-txt">
              <span class="rec__de-nome">Um recado do André</span>
              <span class="rec__de-data">{{ RECADO.escritoEm }}</span>
            </div>
          </div>

          <h2 :id="tituloId" class="rec__titulo">Dia vermelho não é fim de jogo.</h2>
          <p class="rec__p">
            O mercado está reagindo à eleição, e a tela pode ficar vermelha por alguns dias.
            Antes de decidir qualquer coisa, veja em reais quanto a queda mexeu na sua carteira, e por quê.
          </p>
          <p class="rec__nota">
            <svg class="rec__nota-i" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.5" /><path d="M10 9v5M10 6.2v.1" /></svg>
            <span>Se o pregão parar, não é defeito: é o <b>circuit breaker</b>, a pausa de 30 minutos que a B3 faz quando o Ibovespa cai 10%.</span>
          </p>

          <p class="rec__mao">A vida segue.<br>A bolsa também.</p>
          <p class="rec__assina"><span class="rec__assina-nome">André</span>, da Redentia</p>

          <div class="rec__acoes">
            <NuxtLink to="/carteira" class="rec__cta" @click="fechar('carteira')">Ver minha carteira</NuxtLink>
            <button type="button" class="rec__ok" @click="fechar('entendi')">Entendi</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.rec {
  position: fixed; inset: 0; z-index: 9999;
  background: var(--nu-day-backdrop);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  animation: rec-fade .2s ease;
}
.rec__card {
  position: relative;
  width: min(540px, 100%); max-height: calc(100vh - 48px); overflow: auto;
  background: var(--nu-day-card); border-radius: var(--nu-r-card-lg);
  box-shadow: var(--nu-shadow-day-modal);
  animation: rec-sobe .32s cubic-bezier(.2, .8, .2, 1);
}
.rec__card:focus { outline: none; }

/* a serra: o mesmo céu do rodapé, do navy ao azul da casa */
.rec__serra {
  position: relative; height: 150px; overflow: hidden;
  background: linear-gradient(180deg, var(--nu-navy) 0%, color-mix(in srgb, var(--nu-blue-deep) 55%, var(--nu-navy)) 60%, var(--nu-blue-deep) 100%);
}
.rec__svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.rec__fundo { fill: color-mix(in srgb, var(--nu-blue-deep) 50%, var(--nu-navy)); }
.rec__s-neve { stop-color: var(--nu-cream); }
.rec__s-base { stop-color: color-mix(in srgb, var(--nu-cream) 62%, var(--nu-blue-deep)); }
.rec__crista {
  fill: none; stroke: var(--nu-white); stroke-width: 1.4; stroke-linejoin: round; opacity: .9;
  stroke-dasharray: 1; stroke-dashoffset: 0;
  animation: rec-desenha 1.4s .25s cubic-bezier(.3, .7, .2, 1) both;
}
.rec__vale line { stroke: var(--nu-navy); stroke-width: 1; opacity: .55; }
.rec__vale text {
  fill: var(--nu-navy); font-size: 11px; font-weight: 800; letter-spacing: .04em;
  font-variant-numeric: tabular-nums; opacity: .72;
}
.rec__hoje { fill: var(--nu-white); stroke: var(--nu-blue); stroke-width: 2; }
.rec__legenda {
  position: absolute; left: 22px; top: 18px;
  color: var(--nu-cream-text-78); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .02em;
}
.rec__x {
  position: absolute; top: 14px; right: 14px; z-index: 1;
  width: 36px; height: 36px; border-radius: 50%; border: none;
  background: var(--nu-cream-text-12); color: var(--nu-cream-text);
  font-size: var(--nu-fs-sm); font-weight: 800; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: background .2s;
}
.rec__x:hover { background: var(--nu-white-30); }
.rec__x:focus-visible, .rec__cta:focus-visible, .rec__ok:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }

.rec__corpo { padding: 26px 34px 30px; }
.rec__de { display: flex; align-items: center; gap: 12px; }
.rec__foto { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; flex: none; box-shadow: 0 0 0 3px var(--nu-day-card), 0 0 0 4px var(--nu-day-divider); }
.rec__de-txt { display: flex; flex-direction: column; gap: 2px; }
.rec__de-nome { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; }
.rec__de-data { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }

.rec__titulo {
  margin: 22px 0 0; color: var(--nu-ink);
  font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.06; text-wrap: balance;
}
.rec__p {
  margin: 12px 0 0; color: var(--nu-day-body);
  font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.55; text-wrap: pretty;
}
.rec__nota {
  margin: 16px 0 0; display: flex; gap: 10px; align-items: flex-start;
  padding: 12px 14px; border-radius: 14px; background: var(--nu-cream);
  color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5;
}
.rec__nota b { font-weight: 800; color: var(--nu-ink); }
.rec__nota-i { flex: none; width: 18px; height: 18px; margin-top: 1px; fill: none; stroke: var(--nu-blue); stroke-width: 1.6; stroke-linecap: round; }

/* o fecho à mão: tinta de caneta azul, escrevendo da esquerda para a direita */
.rec__mao {
  margin: 22px 0 0; color: var(--nu-blue-deep);
  font-family: 'Caveat', 'Bradley Hand', 'Segoe Print', cursive;
  font-size: calc(var(--nu-fs-h3) + 2px); font-weight: 700; line-height: 1.02; letter-spacing: .005em;
  transform: rotate(-1.2deg); transform-origin: left center;
  animation: rec-escreve 1.5s .5s cubic-bezier(.45, .05, .35, 1) both;
}
.rec__assina { margin: 8px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.rec__assina-nome {
  font-family: 'Caveat', 'Bradley Hand', 'Segoe Print', cursive;
  color: var(--nu-blue-deep); font-size: var(--nu-fs-2xl); font-weight: 700; margin-right: 1px;
}

.rec__acoes { margin-top: 24px; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 18px; }
.rec__cta {
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-blue); color: var(--nu-white); text-decoration: none;
  border-radius: var(--nu-r-pill); padding: 13px 24px;
  font-size: var(--nu-fs-md); font-weight: 800; transition: background .2s, transform .2s;
}
.rec__cta:hover { background: var(--nu-blue-hover); transform: translateY(-1px); }
.rec__ok {
  border: none; background: none; padding: 10px 4px; cursor: pointer;
  color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 700;
}
.rec__ok:hover { color: var(--nu-ink); }

@keyframes rec-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes rec-sobe { from { opacity: 0; transform: translateY(18px) scale(.98); } to { opacity: 1; transform: none; } }
@keyframes rec-desenha { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes rec-escreve { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }

@media (prefers-reduced-motion: reduce) {
  .rec, .rec__card, .rec__crista, .rec__mao { animation: none; }
}

@media (max-width: 760px) {
  .rec { padding: 12px; align-items: flex-end; }
  .rec__card { max-height: calc(100vh - 24px); }
  .rec__serra { height: 120px; }
  .rec__corpo { padding: 22px 22px 24px; }
  .rec__p { font-size: var(--nu-fs-md); }
  .rec__cta { flex: 1 1 100%; }
  .rec__ok { flex: 1 1 100%; }
}
</style>
