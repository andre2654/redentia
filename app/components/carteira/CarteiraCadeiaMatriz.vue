<script setup lang="ts">
// O desenho da "Na cadeia" (CarteiraCadeia), escolhido pelo dono entre
// três: a matriz "quem vende para quem". Cada linha é quem vende; cada coluna, quem compra. As suas empresas
// vêm primeiro (em cima e à esquerda) e o quadrante delas fica aceso: ali
// está a ligação "dentro da carteira". As de fora vêm depois, mais apagadas.
// A célula acesa é um ponto: cheio quando a empresa informou um valor, só o
// aro quando a ligação existe sem número; azul quando as duas pontas são
// suas. Passar o mouse acende a linha e a coluna e abre a dica em cima da
// célula (o que circula, o valor e quem informou); clicar abre as provas. O
// cartão de baixo saiu em 05/11 (o dono: "pode tirar isso").
// import explícito: há outros fraseDaCarteira nos utils (carteira-agora,
// homeAgora) e o auto-import pegaria o errado
import { fraseDaCarteira, valorEmLinha, type CadeiaDaCarteira, type EmpresaDaCarteiraCadeia, type LigacaoDaCadeia } from '~/utils/cadeiaDaCarteira'

const props = defineProps<{
  vm: CadeiaDaCarteira
  ligadas: EmpresaDaCarteiraCadeia[]
  tickerDe: Record<string, string>
  foco: string | null
  modo: 'parado' | 'esperando' | 'revelando'
}>()
const emit = defineEmits<{ foco: [id: string | null]; abrir: [id: string] }>()

type Ponta = { raiz: string; ticker: string; nome: string; minha: boolean }
const pontas = computed<Ponta[]>(() => [
  ...props.ligadas.map((e) => ({ raiz: e.raiz, ticker: e.ticker, nome: e.nome, minha: true })),
  ...props.vm.externas.map((x) => ({ raiz: x.raiz, ticker: x.ticker, nome: x.nome, minha: false })),
])
const nMinhas = computed(() => props.ligadas.length)
const nFora = computed(() => pontas.value.length - nMinhas.value)
// um respiro de 10px entre as suas e as de fora, nas linhas e nas colunas
const trilhas = computed(() => `var(--rot) repeat(${nMinhas.value}, var(--cel))${nFora.value ? ` var(--sep) repeat(${nFora.value}, var(--cel))` : ''}`)
const trilhasL = computed(() => `auto repeat(${nMinhas.value}, var(--cel))${nFora.value ? ` var(--sep) repeat(${nFora.value}, var(--cel))` : ''}`)
/** a coluna (ou linha) da grade de um índice: pula o respiro */
const pos = (k: number) => (k < nMinhas.value ? k + 2 : k + 3)
const celula = computed(() => {
  const m = new Map<string, LigacaoDaCadeia>()
  for (const l of [...props.vm.internas, ...props.vm.externas.flatMap((x) => x.ligacoes)]) m.set(l.id, l)
  return m
})
const lig = (v: Ponta, c: Ponta) => celula.value.get(`${v.raiz}>${c.raiz}`) ?? null

const mouse = ref<{ v: string; c: string } | null>(null)
const focoL = computed(() => (props.foco ? celula.value.get(props.foco) ?? null : null))
const linhaOn = (p: Ponta) => (mouse.value ? mouse.value.v === p.raiz : focoL.value?.vende === p.raiz)
const colunaOn = (p: Ponta) => (mouse.value ? mouse.value.c === p.raiz : focoL.value?.compra === p.raiz)

/* ——— a dica: em cima da célula (embaixo, perto do topo), presa na largura ——— */
const raiz = ref<HTMLElement | null>(null)
const minhas = computed(() => props.ligadas.map((e) => e.raiz))
const dica = ref<{ frase: string; valor: string; x: number; y: number; embaixo: boolean } | null>(null)
function abrirDica(el: HTMLElement, l: LigacaoDaCadeia) {
  const r = raiz.value
  if (!r) return
  const a = el.getBoundingClientRect()
  const b = r.getBoundingClientRect()
  const meia = Math.min(150, b.width / 2)
  const embaixo = a.top - b.top < 110
  dica.value = {
    frase: fraseDaCarteira(l, props.vm.nomes, minhas.value),
    valor: valorEmLinha(l, props.vm.nomes),
    x: Math.min(Math.max(a.left + a.width / 2 - b.left, meia), b.width - meia),
    y: embaixo ? a.bottom - b.top + 8 : a.top - b.top - 8,
    embaixo,
  }
}
function sair() {
  mouse.value = null
  dica.value = null
}

function entrar(ev: Event, v: Ponta, c: Ponta) {
  mouse.value = { v: v.raiz, c: c.raiz }
  const l = lig(v, c)
  if (!l) return
  emit('foco', l.id)
  abrirDica(ev.currentTarget as HTMLElement, l)
}
function tamanho(l: LigacaoDaCadeia): number {
  const v = l.valor
  if (!v) return 15
  if (v.tipo === 'anual') return 19
  if (v.tipo === 'contratado') return 16
  return 15
}
const titulo = (v: Ponta, c: Ponta, l: LigacaoDaCadeia | null) =>
  l ? `${v.nome} vende ${l.oQue ? `${l.oQue} ` : ''}para ${c.nome}${l.valor ? `: ${l.valor.texto} ${l.valor.quando}` : ''}` : `${v.nome} não vende para ${c.nome} (nenhuma ligação verificada)`
</script>

<template>
  <div ref="raiz" class="ccm" :class="`ccm--${modo}`" :style="{ '--n': pontas.length }">
    <div class="ccm__rolo" @scroll.passive="dica = null">
      <div
        class="ccm__grade" role="grid" :aria-label="`Quem vende para quem: ${vm.frase}`"
        :style="{ gridTemplateColumns: trilhas, gridTemplateRows: trilhasL }"
        @pointerleave="sair"
      >
        <!-- o canto: como ler -->
        <div class="ccm__canto" role="presentation">
          <span class="ccm__eixo ccm__eixo--c">compra →</span>
          <span class="ccm__eixo ccm__eixo--v">vende ↓</span>
        </div>
        <div
          v-for="(c, j) in pontas" :key="`c-${c.raiz}`" role="columnheader"
          class="ccm__col" :class="{ 'ccm__col--fora': !c.minha, 'ccm__col--on': colunaOn(c) }"
          :title="c.nome" :style="{ gridColumn: pos(j), gridRow: 1 }"
        >
          <NuAssetLogo :ticker="c.ticker" :letter="c.ticker.charAt(0)" :tile-bg="c.minha ? 'var(--nu-tile-blue-bg)' : 'var(--nu-cream)'" :tile-fg="c.minha ? 'var(--nu-blue-deep)' : 'var(--nu-gray)'" :size="26" :radius="7" />
          <span class="ccm__col-tk">{{ c.ticker }}</span>
        </div>

        <template v-for="(v, i) in pontas" :key="`l-${v.raiz}`">
          <div role="rowheader" class="ccm__rot" :class="{ 'ccm__rot--fora': !v.minha, 'ccm__rot--on': linhaOn(v) }" :style="{ gridColumn: 1, gridRow: pos(i) }">
            <NuAssetLogo :ticker="v.ticker" :letter="v.ticker.charAt(0)" :tile-bg="v.minha ? 'var(--nu-tile-blue-bg)' : 'var(--nu-cream)'" :tile-fg="v.minha ? 'var(--nu-blue-deep)' : 'var(--nu-gray)'" :size="26" :radius="7" />
            <span class="ccm__rot-txt">
              <span class="ccm__rot-tk">{{ v.ticker }}</span>
              <span class="ccm__rot-nome">{{ v.nome }}</span>
            </span>
          </div>
          <template v-for="(c, j) in pontas" :key="`x-${v.raiz}-${c.raiz}`">
            <button
              v-if="lig(v, c)" type="button" role="gridcell"
              class="ccm__cel ccm__cel--acesa"
              :class="{
                'ccm__cel--dentro': v.minha && c.minha,
                'ccm__cel--cruz': linhaOn(v) || colunaOn(c),
                'ccm__cel--on': foco === lig(v, c)!.id,
              }"
              :style="{ '--d': i + j, gridColumn: pos(j), gridRow: pos(i) }"
              :aria-label="titulo(v, c, lig(v, c))"
              @pointerenter="entrar($event, v, c)" @focus="entrar($event, v, c)" @blur="dica = null" @click="emit('abrir', lig(v, c)!.id)"
            >
              <span
                class="ccm__ponto" :class="{ 'ccm__ponto--int': v.minha && c.minha, 'ccm__ponto--sem': !lig(v, c)!.valor }"
                :style="{ '--s': `${tamanho(lig(v, c)!)}px` }" aria-hidden="true"
              />
            </button>
            <div
              v-else role="gridcell"
              class="ccm__cel"
              :class="{
                'ccm__cel--dentro': v.minha && c.minha, 'ccm__cel--diag': v.raiz === c.raiz,
                'ccm__cel--cruz': linhaOn(v) || colunaOn(c),
              }"
              :style="{ '--d': i + j, gridColumn: pos(j), gridRow: pos(i) }"
              :aria-label="v.raiz === c.raiz ? undefined : titulo(v, c, null)"
              @pointerenter="mouse = { v: v.raiz, c: c.raiz }; dica = null"
            />
          </template>
        </template>
      </div>
    </div>

    <div
      v-if="dica" class="ccm__dica" :class="{ 'ccm__dica--embaixo': dica.embaixo }"
      :style="{ left: `${dica.x}px`, top: `${dica.y}px` }" aria-hidden="true"
    >
      <p class="ccm__dica-frase">{{ dica.frase }}</p>
      <p class="ccm__dica-valor">{{ dica.valor }}</p>
      <p class="ccm__dica-acao">Clique para ver as provas</p>
    </div>

    <p class="ccm__legenda" aria-hidden="true">
      <span class="ccm__leg"><span class="ccm__leg-p ccm__leg-p--int" />entre as suas</span>
      <span class="ccm__leg"><span class="ccm__leg-p" />com empresas de fora</span>
      <span class="ccm__leg"><span class="ccm__leg-p ccm__leg-p--sem" />sem valor informado</span>
      <span class="ccm__leg"><span class="ccm__leg-q" />o quadrante da sua carteira</span>
    </p>
  </div>
</template>

<style scoped>
/* a matriz mora num cartão creme (a seção é a faixa quente); o cobalto marca o que é da carteira */
.ccm { --ccm-az: var(--nu-blue); padding: clamp(14px, 2vw, 28px) clamp(10px, 2vw, 28px) clamp(16px, 2vw, 24px); border-radius: var(--nu-r-card); background: var(--nu-page); box-shadow: var(--nu-shadow-quente); --cel: 52px; --rot: 168px; --sep: 10px; --ease: cubic-bezier(.2, .8, .2, 1); --mola: cubic-bezier(.34, 1.56, .64, 1); max-width: 1080px; margin: 0 auto; position: relative; }
.ccm__rolo { display: flex; justify-content: center; }
.ccm__grade {
  display: grid;
  position: relative;
}
.ccm__canto { position: relative; grid-row: 1; grid-column: 1; min-height: 58px; }
.ccm__eixo { position: absolute; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; white-space: nowrap; }
.ccm__eixo--c { right: 10px; top: 6px; }
.ccm__eixo--v { left: 4px; bottom: 6px; }

.ccm__col { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 5px; padding-bottom: 8px; transition: opacity .25s, transform .3s var(--mola); }
.ccm__col-tk { color: var(--nu-ink); font-size: 10px; font-weight: 800; letter-spacing: .01em; }
.ccm__col--fora, .ccm__rot--fora { opacity: .62; }
.ccm__col--fora .ccm__col-tk, .ccm__rot--fora .ccm__rot-tk { color: var(--nu-gray); }
.ccm__col--on, .ccm__rot--on { opacity: 1; }
.ccm__col--on { transform: translateY(-2px); }

.ccm__rot { display: flex; align-items: center; gap: 10px; min-width: 0; padding-right: 12px; transition: opacity .25s, transform .3s var(--mola); }
.ccm__rot--on { transform: translateX(2px); }
.ccm__rot-txt { display: flex; flex-direction: column; min-width: 0; }
.ccm__rot-tk { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 800; }
.ccm__rot-nome { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.ccm__cel {
  position: relative; display: grid; place-items: center; padding: 0; border: 0; background: none; font: inherit;
  border-radius: 10px; transition: background .2s ease;
}
.ccm__cel::after { content: ''; width: 3px; height: 3px; border-radius: 50%; background: var(--nu-cream-line); }
.ccm__cel--acesa::after, .ccm__cel--diag::after { display: none; }
.ccm__cel--diag { background: repeating-linear-gradient(135deg, transparent 0 5px, var(--nu-cream-2) 5px 6px); }
/* o quadrante das suas: a luz da carteira */
.ccm__cel--dentro:not(.ccm__cel--diag) { background: color-mix(in srgb, var(--ccm-az) 6%, transparent); }
.ccm__cel--cruz { background: var(--nu-cream-2); }
.ccm__cel--dentro.ccm__cel--cruz:not(.ccm__cel--diag) { background: color-mix(in srgb, var(--ccm-az) 11%, transparent); }
.ccm__cel--acesa { cursor: pointer; }
.ccm__cel--acesa:focus-visible { outline-offset: -3px; }

.ccm__ponto {
  width: var(--s); height: var(--s); border-radius: 50%;
  background: color-mix(in srgb, var(--nu-navy) 55%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--nu-navy) 8%, transparent);
  transition: transform .45s var(--mola), box-shadow .25s ease;
}
.ccm__ponto--int { background: var(--ccm-az); box-shadow: 0 0 0 5px color-mix(in srgb, var(--ccm-az) 16%, transparent), 0 0 18px color-mix(in srgb, var(--ccm-az) 55%, transparent); }
.ccm__ponto--sem { background: var(--nu-white); border: 2px solid color-mix(in srgb, var(--nu-navy) 55%, transparent); }
.ccm__ponto--int.ccm__ponto--sem { border-color: var(--ccm-az); background: color-mix(in srgb, var(--ccm-az) 14%, var(--nu-white)); }
.ccm__cel--acesa:hover .ccm__ponto, .ccm__cel--on .ccm__ponto { transform: scale(1.25); }

.ccm__legenda { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 18px; margin: 18px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; }
.ccm__leg { display: inline-flex; align-items: center; gap: 7px; }
.ccm__leg-p { width: 10px; height: 10px; border-radius: 50%; background: color-mix(in srgb, var(--nu-navy) 55%, transparent); }
.ccm__leg-p--int { background: var(--ccm-az); box-shadow: 0 0 8px color-mix(in srgb, var(--ccm-az) 60%, transparent); }
.ccm__leg-p--sem { background: var(--nu-white); border: 2px solid color-mix(in srgb, var(--nu-navy) 55%, transparent); }
.ccm__leg-q { width: 14px; height: 14px; border-radius: 4px; background: color-mix(in srgb, var(--ccm-az) 10%, transparent); }

/* ——— a dica: navy, a sombra da casa ——— */
.ccm__dica {
  position: absolute; z-index: 5; transform: translate(-50%, -100%);
  width: max-content; max-width: min(300px, calc(100% - 16px)); padding: 12px 14px;
  border-radius: var(--nu-r-chip); background: var(--nu-ink); color: var(--nu-white);
  box-shadow: 0 18px 40px -16px color-mix(in srgb, var(--nu-ink) 45%, transparent);
  pointer-events: none; animation: ccm-dica .18s var(--ease) both;
}
.ccm__dica--embaixo { transform: translate(-50%, 0); }
.ccm__dica-frase { margin: 0; font-size: var(--nu-fs-sm); font-weight: 700; line-height: 1.4; }
.ccm__dica-valor { margin: 4px 0 0; font-size: var(--nu-fs-xs); font-weight: 500; opacity: .72; font-variant-numeric: tabular-nums; }
.ccm__dica-acao { margin: 6px 0 0; font-size: var(--nu-fs-xs); font-weight: 700; color: var(--nu-blue-soft); }
@keyframes ccm-dica { from { opacity: 0; } }

/* ——— a entrada: as células acendem em diagonal ——— */
.ccm--esperando .ccm__cel, .ccm--esperando .ccm__col, .ccm--esperando .ccm__rot { opacity: 0; }
.ccm--revelando .ccm__cel { animation: ccm-cel .5s var(--ease) both; animation-delay: calc(var(--d) * 32ms + 200ms); }
.ccm--revelando .ccm__ponto { animation: ccm-ponto .7s var(--mola) both; animation-delay: calc(var(--d) * 32ms + 520ms); }
.ccm--revelando .ccm__col, .ccm--revelando .ccm__rot { animation: nu-fade .45s var(--ease) both; }
@keyframes ccm-cel { from { opacity: 0; } }
@keyframes ccm-ponto { from { transform: scale(0); } }

@media (max-width: 760px) {
  .ccm { --rot: 60px; --cel: min(40px, calc((100vw - 44px - 24px - 60px - 8px) / var(--n))); }
  .ccm__col-tk { display: none; }
  .ccm__col { padding-bottom: 6px; }
  .ccm__col :deep(*) { max-width: calc(var(--cel) - 4px); }
  .ccm__rot-tk { font-size: 11px; }
  .ccm__canto { min-height: 44px; }
  .ccm__rot-nome { display: none; }
  .ccm__rot { gap: 6px; padding-right: 6px; }
  .ccm__rot :deep(.nu-asset-logo), .ccm__rot > :first-child { display: none; }
  .ccm__eixo { font-size: 10px; }
  .ccm { --sep: 5px; }
}
@media (prefers-reduced-motion: reduce) {
  .ccm--revelando .ccm__cel, .ccm--revelando .ccm__ponto, .ccm--revelando .ccm__col, .ccm--revelando .ccm__rot { animation: none; }
}
</style>
