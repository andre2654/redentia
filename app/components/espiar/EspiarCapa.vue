<script setup lang="ts">
// A capa do maximizar (12/11/2026, o dono: "a animação de quando abro um ativo
// é sensacional, mas demora muito para abrir gráficos e etc., temos que mostrar
// um loading, algo assim"). O cartão da janelinha cresce até esta capa
// (EspiarAtivo cuida do crescer e da navegação), e a capa já é o topo do
// /asset (TopoBolsa) enquanto a página carrega:
//  - o nome, o código, a bolsa e o preço no lugar e no tamanho do topo, com o
//    que a janelinha já sabe; o que ela não sabe (a linha do H1, a variação do
//    dia, as ações) é esqueleto do tamanho final;
//  - o cartão carvão com a faixa da marca ("PETR4 EM 12 MESES"), o período e a
//    variação de 12 meses da legenda, e a linha de 12 meses da janelinha
//    (vm.linha.serie) na mesma conta e no mesmo lugar do gráfico da página
//    (caminhosDoGrafico, a área de dentro recuada como no AtivoGrafico),
//    no traço de luz dele, se desenhando da esquerda para a direita
//    (stroke-dashoffset, --nu-dur-entrada, --nu-ease-saida); enquanto a
//    página não chega, um brilho corre devagar pela linha, como o esqueleto.
//    O IBOV, que a janelinha não tem, é esqueleto na legenda;
//  - uma linha fina cobalto no alto, logo abaixo do topo e da régua: o
//    progresso da navegação (useLoadingIndicator), que completa quando a página
//    chega. A barra do Nuxt no alto da tela fica escondida enquanto isso.
// A troca (sumir): cada bloco da capa confere o lugar do bloco da página
// (.tbo__id, .tbo__preco-linha, .tbo__acoes, .tbo__palco) e, se não bate (o
// H1 em duas linhas, a página que estava rolada), assenta nele enquanto a capa
// se desfaz; a página não refaz a entrada desses blocos (capaDoMaximizar).
// As medidas são as do TopoBolsa: mudou lá, muda aqui (o teste confere).
// Inerte e aria-hidden: a página é quem fala. Movimento reduzido: o maximizar
// nem abre a capa; se abrir, a linha vem pronta, sem brilho, e a barra não anda.
import type { SeriesPoint } from '~/types/acao'
import { caminhosDoGrafico, marcasDePreco } from '~/utils/ativoDirecoes'
import { PERIODOS_DO_GRAFICO } from '~/composables/useAtivoDirecao'

export interface DadosDaCapa {
  ticker: string
  nome: string
  /** 'B3' ou 'EUA' (a etiqueta de contorno ao lado do código) */
  bolsa: string
  /** 'R$ 45,36' */
  preco: string | null
  linha: { serie: SeriesPoint[]; variacao: string | null; dir: 'up' | 'down' | null } | null
}

const props = defineProps<{
  dados: DadosDaCapa
  /** onde o topo fixo do site acaba agora (a capa cobre daqui para baixo) */
  topo: number
  /** onde o conteúdo da página nova vai começar (ela abre no alto) */
  conteudo: number
}>()

const raiz = ref<HTMLElement | null>(null)
const plot = ref<HTMLElement | null>(null)
const uid = useId()

/* ——— o progresso: o da navegação, e completo quando a página chega ——— */
const { progress } = useLoadingIndicator()
const chegou = ref(false)
const barra = computed(() => (chegou.value ? 100 : Math.max(4, progress.value)))

/* ——— o preço: a moeda pequena e elevada + o número, como o topo ——— */
const partes = computed(() => {
  const p = props.dados.preco
  if (!p) return null
  const m = p.match(/^([A-Z]{0,2}\$)\s*(.+)$/)
  return m ? { moeda: m[1]!, numero: m[2]! } : { moeda: '', numero: p }
})

/* ——— a linha: a conta do gráfico da página, na caixa medida ——— */
const caixa = ref({ w: 0, h: 0 })
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const moeda = computed(() => (props.dados.preco?.trim().startsWith('US$') ? 'US$' : 'R$'))
const fmtMarca = (v: number) => `${moeda.value} ${Math.abs(v) >= 100 || Number.isInteger(v) ? nf0.format(v) : nf2.format(v)}`
const desenho = computed(() => {
  const { w, h } = caixa.value
  const serie = props.dados.linha?.serie ?? []
  if (w <= 0 || h <= 0 || serie.length < 2) return null
  const c = caminhosDoGrafico(serie, [], w, h)
  if (!c.linha || !c.fim) return null
  return {
    d: c.linha,
    marcas: marcasDePreco(c.lo, c.hi).map((v) => ({ v, texto: fmtMarca(v), top: (c.y(v) / h) * 100 })),
    fim: { x: (c.fim.x / w) * 100, y: (c.fim.y / h) * 100 },
  }
})
const tomDaLegenda = computed(() => (props.dados.linha?.dir ? `esc__leg--${props.dados.linha.dir}` : ''))

function medir() {
  const r = plot.value?.getBoundingClientRect()
  if (r && r.width > 0 && r.height > 0) caixa.value = { w: r.width, h: r.height }
}
onMounted(medir)

/* ——— crescer: do cartão da janelinha até a capa ——— */
function tempos() {
  // var() não vale numa Web Animation: lê o valor calculado dos tokens
  const css = getComputedStyle(document.documentElement)
  const ms = (nome: string, padrao: number) => parseFloat(css.getPropertyValue(nome)) || padrao
  const curva = (nome: string, padrao: string) => css.getPropertyValue(nome).trim() || padrao
  return {
    rapida: ms('--nu-dur-rapida', 160), media: ms('--nu-dur-media', 280), lenta: ms('--nu-dur-lenta', 520),
    troca: curva('--nu-ease-troca', 'ease-in-out'), saida: curva('--nu-ease-saida', 'ease-out'), cor: curva('--nu-ease-cor', 'ease'),
  }
}

/** O cartão (o retângulo dele na tela) vira a capa; resolve quando ela cobre a página. */
async function crescer(de: DOMRect, raio: string): Promise<void> {
  const c = raiz.value
  if (!c) return
  const t = tempos()
  const inicio = `inset(${de.top}px ${window.innerWidth - de.right}px ${Math.max(0, window.innerHeight - de.bottom)}px ${de.left}px round ${raio})`
  const cresce = c.animate(
    [{ clipPath: inicio }, { clipPath: `inset(${props.topo}px 0px 0px 0px round 0px)` }],
    { duration: t.lenta, easing: t.troca, fill: 'forwards' },
  )
  // o branco do cartão se apaga no creme da página; o miolo sobe com fade
  c.querySelector('.esc__branco')?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: t.lenta, easing: t.cor, fill: 'forwards' })
  c.querySelector('.esc__miolo')?.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: t.lenta, delay: t.rapida, easing: t.saida, fill: 'backwards' })
  await cresce.finished.catch(() => null)
}

/** cada bloco da capa e o bloco da página que ele vira */
const PARES: [string, string][] = [['.esc__id', '.tbo__id'], ['.esc__preco-linha', '.tbo__preco-linha'], ['.esc__acoes', '.tbo__acoes'], ['.esc__palco', '.tbo__palco']]

/**
 * A página chegou (`assentar`: ela está embaixo, no lugar final): a barra
 * completa, cada bloco assenta no bloco da página se não estiver em cima dele,
 * e a capa se desfaz. Sem `assentar` (o teto, um erro), só se desfaz.
 */
async function sumir(assentar: boolean): Promise<void> {
  const c = raiz.value
  if (!c) return
  const t = tempos()
  chegou.value = true
  if (assentar) {
    for (const [meu, dela] of PARES) {
      const a = c.querySelector<HTMLElement>(meu)
      const b = document.querySelector<HTMLElement>(`main ${dela}`)
      if (!a || !b) continue
      const ra = a.getBoundingClientRect()
      const rb = b.getBoundingClientRect()
      const dx = rb.left - ra.left
      const dy = rb.top - ra.top
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue
      a.animate([{ translate: '0 0' }, { translate: `${dx}px ${dy}px` }], { duration: t.media, easing: t.troca, fill: 'forwards' })
    }
  }
  await c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: t.media, easing: t.cor, fill: 'forwards' }).finished.catch(() => null)
}

defineExpose({ crescer, sumir })

/* ——— os esqueletos do que a janelinha não sabe: as ações (o rótulo de cada uma, em linhas) ——— */
const ACOES = [[36], [62, 46], [70], [58]]
</script>

<template>
  <div ref="raiz" class="esc" :style="{ '--capa-topo': `${topo}px`, '--capa-conteudo': `${conteudo}px` }" aria-hidden="true" inert>
    <div class="esc__branco" />
    <!-- o progresso da página: logo abaixo do topo e da régua -->
    <div class="esc__progresso"><i :style="{ transform: `scaleX(${barra / 100})` }" /></div>

    <div class="esc__miolo">
      <div class="esc__grade">
        <div class="esc__id">
          <p class="esc__empresa">
            <span v-if="dados.nome" class="esc__nome">{{ dados.nome }}</span>
            <NuSelo tom="carvao">{{ dados.ticker }}</NuSelo>
            <NuSelo tom="contorno">{{ dados.bolsa }}</NuSelo>
          </p>
          <p class="esc__h1"><NuSkeleton variant="line" inline width="min(320px, 72%)" height=".82em" radius="pill" /></p>
        </div>

        <div class="esc__preco-linha">
          <p v-if="partes" class="esc__preco" :class="{ 'esc__preco--longo': partes.numero.length > 8 }">
            <span v-if="partes.moeda" class="esc__moeda">{{ partes.moeda }}</span><TopoPreco :valor="partes.numero" />
          </p>
          <NuSkeleton v-else variant="block" radius="tile" class="esc__preco-sk" />
          <p class="esc__dia">
            <NuSkeleton variant="block" width="200px" height="36px" radius="chip" />
            <span class="esc__meta"><NuSkeleton variant="line" inline width="268px" height=".7em" radius="pill" /></span>
          </p>
        </div>

        <div class="esc__acoes">
          <span v-for="(linhas, i) in ACOES" :key="i" class="esc__acao">
            <NuSkeleton variant="circle" width="44px" height="44px" />
            <span class="esc__acao-r"><span v-for="(w, k) in linhas" :key="k" class="esc__acao-l"><NuSkeleton variant="line" :width="`${w}%`" height="8px" radius="pill" /></span></span>
          </span>
        </div>

        <!-- sem série a página não tem o cartão do gráfico (o v-if="series" do TopoBolsa): a capa também não -->
        <div v-if="dados.linha" class="esc__palco">
          <NuFaixaMarca :rotulo="`${dados.ticker} em 12 meses`" :altura="56" como="p" class="esc__cartao">
            <template #acoes>
              <NuTrilho :opcoes="PERIODOS_DO_GRAFICO" model-value="12mo" tom="escuro" tamanho="p" rotulo="Período do gráfico" />
            </template>
            <p class="esc__legenda">
              <span v-if="dados.linha?.variacao" class="esc__leg esc__leg--1">
                <b :class="tomDaLegenda">{{ dados.linha.variacao }}</b>
                <span class="esc__leg-r"><i class="esc__traco" />{{ dados.ticker }}</span>
              </span>
              <!-- o IBOV, que a janelinha não tem: o esqueleto na caixa exata do item (o texto invisível dá a altura; no celular a legenda quebra e o gráfico não pula) -->
              <span class="esc__leg esc__leg--sk"><b>+0,00%</b><span class="esc__leg-r"><i class="esc__traco" />IBOV</span><NuSkeleton variant="line" tone="navy" height="20px" radius="pill" class="esc__leg-esqueleto" /></span>
            </p>
            <div class="esc__grafico">
              <template v-if="desenho">
                <span v-for="m in desenho.marcas" :key="m.v" class="esc__marca" :style="{ top: `${m.top}%` }"><span class="esc__marca-t">{{ m.texto }}</span></span>
              </template>
              <div ref="plot" class="esc__plot">
                <template v-if="desenho">
                  <svg class="esc__svg" :viewBox.attr="`0 0 ${caixa.w} ${caixa.h}`" preserveAspectRatio="none">
                    <defs>
                      <linearGradient :id="`${uid}-luz`" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" class="esc__luz-a" />
                        <stop offset=".7" class="esc__luz-b" />
                        <stop offset="1" class="esc__luz-c" />
                      </linearGradient>
                    </defs>
                    <path :d="desenho.d" class="esc__halo" pathLength="1" />
                    <path :d="desenho.d" class="esc__linha" :stroke="`url(#${uid}-luz)`" pathLength="1" />
                  </svg>
                  <!-- o brilho que corre pela linha enquanto a página não chega -->
                  <div class="esc__brilho">
                    <svg class="esc__svg" :viewBox.attr="`0 0 ${caixa.w} ${caixa.h}`" preserveAspectRatio="none">
                      <path :d="desenho.d" class="esc__brilho-halo" />
                      <path :d="desenho.d" class="esc__brilho-linha" />
                    </svg>
                  </div>
                  <span class="esc__fim" :style="{ left: `${desenho.fim.x}%`, top: `${desenho.fim.y}%` }" />
                  <span v-if="dados.preco" class="esc__hoje" :class="{ 'esc__hoje--baixo': desenho.fim.y < 22 }" :style="{ top: `${desenho.fim.y}%` }">
                    <span class="esc__hoje-r">{{ dados.ticker }} hoje</span>
                    <span class="esc__hoje-v">{{ dados.preco }}</span>
                  </span>
                </template>
              </div>
            </div>
            <NuTrilho :opcoes="PERIODOS_DO_GRAFICO" model-value="12mo" tom="escuro" largo rotulo="Período do gráfico" class="esc__periodo" />
            <p class="esc__uso">Passe o cursor para ler um dia; arraste para medir entre dois.</p>
          </NuFaixaMarca>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ——— a capa: o creme do topo do /asset, por cima de tudo abaixo do topo fixo ——— */
.esc {
  position: fixed; inset: 0; z-index: 60; isolation: isolate; overflow: hidden; pointer-events: none;
  background: var(--nu-page); color: var(--nu-ink);
}
.esc__branco { position: absolute; inset: 0; z-index: -1; background: var(--nu-white); }

/* o progresso: 2px cobalto, logo abaixo do topo e da régua */
.esc__progresso { position: absolute; z-index: 2; top: var(--capa-topo, 0px); left: 0; right: 0; height: 2px; overflow: hidden; }
.esc__progresso i {
  display: block; height: 100%; background: var(--nu-blue); transform-origin: 0 50%;
  transition: transform var(--nu-dur-rapida) var(--nu-ease-saida);
}

/* ——— as medidas do TopoBolsa (.tbo, .tbo__grade e os blocos): a capa cai onde a página desenha ——— */
.esc__miolo { --g: clamp(20px, 4vw, 56px); padding: calc(var(--capa-conteudo, 0px) + clamp(28px, 3.4vw, 48px)) var(--g) 0; }
.esc__grade {
  max-width: 1240px; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr);
  grid-template-areas: "id" "preco" "acoes" "palco"; row-gap: clamp(20px, 2.4vw, 28px);
}
.esc__id { grid-area: id; min-width: 0; }
.esc__empresa { margin: 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.esc__nome { margin-right: 4px; font-size: clamp(24px, 2.6vw, 34px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.1; }
.esc__h1 { margin: 8px 0 0; font-size: var(--nu-fs-md); line-height: 1.4; }

.esc__preco-linha { grid-area: preco; }
.esc__preco { margin: 0; display: flex; align-items: flex-start; gap: .08em; font-size: clamp(64px, 17vw, 132px); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: .92; }
.esc__preco--longo { font-size: clamp(44px, 11.5vw, 92px); }
.esc__preco :deep(.tpr__casa) { padding: .1em .05em; margin: -.1em -.05em; }
.esc__moeda { margin-top: .16em; font-size: .36em; letter-spacing: var(--nu-ls-titulo); line-height: 1; }
.esc__preco-sk { width: min(360px, 70%); height: clamp(64px, 8vw, 112px); }
.esc__dia { display: flex; align-items: center; gap: 8px 12px; flex-wrap: wrap; min-height: 36px; margin: 16px 0 0; }
/* a data do dado vai para a linha de baixo, como na página (o selo e ela não cabem lado a lado na coluna) */
.esc__meta { flex-basis: 100%; font-size: 13.5px; }

/* as ações (TopoAcoes/TopoBotao): quatro botões de 64px, o círculo de 44 e o rótulo embaixo */
.esc__acoes { grid-area: acoes; display: flex; align-items: flex-start; gap: 14px; }
.esc__acao { display: flex; flex-direction: column; align-items: center; gap: 6px; width: 64px; }
.esc__acao-r { display: flex; flex-direction: column; align-items: center; width: 100%; font-size: var(--nu-fs-xs); line-height: 1.25; }
.esc__acao-l { display: flex; align-items: center; justify-content: center; width: 100%; height: 1.25em; }

/* o cartão do gráfico: carvão, com a faixa da marca e o período à direita dela */
.esc__palco { grid-area: palco; min-width: 0; }
.esc__cartao { --pad: clamp(18px, 2.2vw, 30px); padding-bottom: clamp(16px, 2vw, 24px); }
.esc__cartao :deep(.nfm__acoes) { padding: 6px 10px 0 0; }
.esc__legenda { display: flex; align-items: baseline; gap: 6px 28px; flex-wrap: wrap; margin: clamp(18px, 2vw, 26px) var(--pad) 0; }
.esc__leg { display: inline-flex; align-items: baseline; gap: 10px; }
.esc__leg b { color: var(--nu-white); font-size: clamp(20px, 2vw, 26px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); font-variant-numeric: tabular-nums; }
.esc__leg--1 b { font-size: clamp(38px, 4.4vw, 58px); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1; }
.esc__leg--sk { position: relative; }
.esc__leg--sk > b, .esc__leg--sk > .esc__leg-r { visibility: hidden; }
.esc__leg-esqueleto { position: absolute; left: 0; right: 0; top: 50%; translate: 0 -50%; }
.esc__leg b.esc__leg--up { color: var(--nu-green-soft); }
.esc__leg b.esc__leg--down { color: var(--nu-red-soft); }
.esc__leg-r { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
.esc__traco { width: 14px; height: 2px; border-radius: 1px; background: var(--nu-blue-on-dark); }

/* o gráfico de beira a beira; o desenho na área de dentro (as variáveis --agr-* do TopoBolsa) */
.esc__grafico { position: relative; height: clamp(220px, 23vw, 320px); margin-top: 14px; }
.esc__plot { position: absolute; top: 0; bottom: 0; left: var(--pad); right: max(var(--pad), 44px); }
.esc__svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.esc__marca { position: absolute; left: 0; right: 0; height: 0; border-top: 1px solid var(--nu-cream-text-08); }
.esc__marca-t {
  position: absolute; left: var(--pad); bottom: 4px; white-space: nowrap; color: var(--nu-cream-text-50);
  font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); font-variant-numeric: tabular-nums;
}
/* o traço de luz do AtivoGrafico (tom luz), que se desenha da esquerda para a direita */
.esc__linha, .esc__halo {
  fill: none; stroke-linejoin: round; stroke-dasharray: 1 2; stroke-dashoffset: 0;
  animation: esc-desenha var(--nu-dur-entrada) var(--nu-ease-saida) var(--nu-dur-rapida) both;
}
.esc__linha { stroke-width: 2; stroke-linecap: round; }
.esc__halo { stroke: var(--nu-blue-soft); stroke-width: 9; opacity: .22; filter: blur(5px); }
.esc__luz-a { stop-color: var(--nu-blue); stop-opacity: .35; }
.esc__luz-b { stop-color: var(--nu-blue-soft); stop-opacity: .9; }
.esc__luz-c { stop-color: var(--nu-white); stop-opacity: 1; }
@keyframes esc-desenha { from { stroke-dashoffset: 1.05; } }
/* o brilho: uma faixa de luz que corre pela linha, devagar, depois que ela
   termina de se desenhar (a máscara com o dobro da largura anda de uma beira à
   outra, como o brilho do NuSkeleton); o halo largo faz ele aparecer também
   na ponta da linha, que já é branca */
.esc__brilho {
  position: absolute; inset: -12px 0;
  -webkit-mask-image: linear-gradient(100deg, transparent 42%, var(--nu-white) 50%, transparent 58%);
  mask-image: linear-gradient(100deg, transparent 42%, var(--nu-white) 50%, transparent 58%);
  -webkit-mask-size: 200% 100%; mask-size: 200% 100%; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
  -webkit-mask-position: 118% 0; mask-position: 118% 0;
  animation: esc-brilho calc(var(--nu-dur-respiro) * 2) var(--nu-ease-cor) calc(var(--nu-dur-rapida) + var(--nu-dur-entrada)) infinite backwards;
}
.esc__brilho .esc__svg { inset: 12px 0; height: calc(100% - 24px); }
.esc__brilho-halo { fill: none; stroke: var(--nu-blue-soft); stroke-width: 12; stroke-linejoin: round; stroke-linecap: round; opacity: .55; filter: blur(6px); }
.esc__brilho-linha { fill: none; stroke: var(--nu-white); stroke-width: 2.6; stroke-linejoin: round; stroke-linecap: round; }
@keyframes esc-brilho {
  from { -webkit-mask-position: 118% 0; mask-position: 118% 0; }
  to { -webkit-mask-position: -18% 0; mask-position: -18% 0; }
}
/* o ponto de hoje e o rótulo, quando a linha chega ao fim (o AtivoGrafico, tom luz, no cartão do /asset) */
.esc__fim {
  position: absolute; width: 11px; height: 11px; border-radius: 50%; transform: translate(-50%, -50%);
  background: var(--nu-white); box-shadow: 0 0 0 6px var(--nu-blue-soft-18), 0 0 22px 4px var(--nu-blue-soft);
}
.esc__hoje {
  position: absolute; right: 0; transform: translateY(calc(-100% - 14px));
  display: flex; flex-direction: column; align-items: flex-end; gap: 2px; padding: 8px 12px; border-radius: var(--nu-r-chip);
  background: var(--nu-creme); color: var(--nu-ink); box-shadow: 0 0 0 1px var(--nu-cream-text-12);
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.esc__hoje--baixo { transform: translateY(14px); }
.esc__hoje-r { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); }
.esc__hoje-v { font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
.esc__fim, .esc__hoje { animation: esc-chega var(--nu-dur-lenta) var(--nu-ease-saida) var(--nu-dur-entrada) both; }
@keyframes esc-chega { from { opacity: 0; translate: 0 4px; } }
.esc__periodo { display: none; margin: 16px var(--pad) 0; }
.esc__uso { margin: 12px var(--pad) 0; color: var(--nu-on-dark-2); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); }
@media (hover: none) { .esc__uso { display: none; } }

/* duas colunas: o papel e o preço à esquerda, o cartão do gráfico à direita */
@media (min-width: 1080px) {
  .esc__grade {
    grid-template-columns: minmax(0, .82fr) minmax(0, 1.18fr); column-gap: clamp(36px, 4.4vw, 72px);
    grid-template-areas: "id palco" "preco palco" "acoes palco" "nums palco"; grid-template-rows: auto auto auto 1fr;
  }
  .esc__preco { font-size: clamp(84px, 8.4vw, 132px); }
  .esc__preco--longo { font-size: clamp(52px, 5.2vw, 84px); }
  .esc__grafico { height: clamp(260px, 25vw, 372px); }
}
@media (max-width: 760px) {
  .esc__cartao :deep(.nfm__acoes) { display: none; }
  .esc__periodo { display: flex; }
}
@media (prefers-reduced-motion: reduce) {
  .esc__linha, .esc__halo, .esc__fim, .esc__hoje { animation: none; }
  .esc__brilho { display: none; }
  .esc__progresso i { transition: none; }
}
</style>
