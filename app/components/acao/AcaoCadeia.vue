<script setup lang="ts">
// "De quem a Petrobras compra e para quem vende." (25/10/2026): a cadeia de
// fornecimento entre empresas listadas (GET /assets/{t}/supply-chain) como um
// grafo — fornecedores à esquerda, a empresa no centro, clientes à direita, e o
// valor de cada ligação escrito na própria linha. Cartões das pontas com as
// peças do AcaoPares (logo + ticker + linha cinza); o centro é o único navy da
// seção (um herói). Sem valor na fonte, a linha não tem etiqueta.
//
// Geometria calculada aqui, não medida no browser: cada cartão tem altura fixa
// (ROW) e o mesmo respiro (GAP), então a altura de cada ponta, o meio da
// empresa e o y de cada linha saem de conta — o SSR já entrega o desenho
// pronto, sem salto na hidratação. No celular o grafo inteiro não cabe: vira
// dois meio-grafos empilhados (compra → empresa, empresa → venda).
import type { AcaoCadeiaItemVM, AcaoCadeiaVM } from '~/types/acao'

const props = defineProps<{ cadeia: AcaoCadeiaVM; nome: string; ticker: string }>()

interface Ligacao { item: AcaoCadeiaItemVM; y: number; d: string; ex: number; ey: number }
interface Ramo { itens: Ligacao[]; top: number }

/** Cartões de uma ponta, centrados numa altura `total`, ligados ao meio dela. */
function ramo(itens: AcaoCadeiaItemVM[], total: number, row: number, gap: number, lado: 'compra' | 'vende'): Ramo {
  const alto = itens.length * row + Math.max(0, itens.length - 1) * gap
  const top = (total - alto) / 2
  const yc = total / 2
  return {
    top,
    itens: itens.map((item, i) => {
      const y = top + i * (row + gap) + row / 2
      // curva em S: sai horizontal do cartão e chega horizontal na empresa
      const d = lado === 'compra'
        ? `M0 ${y} C50 ${y} 50 ${yc} 100 ${yc}`
        : `M0 ${yc} C50 ${yc} 50 ${y} 100 ${y}`
      // A etiqueta do valor vai perto do cartão da ponta (t = 0,2 ou 0,8 da
      // curva), onde as linhas ainda estão uma linha inteira uma da outra; no
      // meio elas convergem e as etiquetas se amontoavam.
      const t = lado === 'compra' ? 0.2 : 0.8
      const [p0, p3] = lado === 'compra' ? [y, yc] : [yc, y]
      const ex = 3 * (1 - t) ** 2 * t * 50 + 3 * (1 - t) * t ** 2 * 50 + t ** 3 * 100
      const ey = ((1 - t) ** 3 + 3 * (1 - t) ** 2 * t) * p0 + (3 * (1 - t) * t ** 2 + t ** 3) * p3
      return { item, y, d, ex, ey }
    }),
  }
}

/** Nunca menor que o cartão da empresa (`min`): com uma ligação só, ele invadia o texto vizinho. */
function alturaDe(n: number, row: number, gap: number, min: number) {
  return Math.max(min, Math.max(1, n) * row + Math.max(0, n - 1) * gap)
}

// desktop: as duas pontas dividem a mesma altura, a empresa no meio
const ROW = 72
const GAP = 14
const total = computed(() => alturaDe(Math.max(props.cadeia.compraDe.length, props.cadeia.vendePara.length), ROW, GAP, 156))
const compra = computed(() => ramo(props.cadeia.compraDe, total.value, ROW, GAP, 'compra'))
const vende = computed(() => ramo(props.cadeia.vendePara, total.value, ROW, GAP, 'vende'))

// celular: cada meio-grafo tem a altura da própria ponta
const ROW_M = 64
const GAP_M = 12
const totalCompraM = computed(() => alturaDe(props.cadeia.compraDe.length, ROW_M, GAP_M, 112))
const totalVendeM = computed(() => alturaDe(props.cadeia.vendePara.length, ROW_M, GAP_M, 112))
const compraM = computed(() => ramo(props.cadeia.compraDe, totalCompraM.value, ROW_M, GAP_M, 'compra'))
const vendeM = computed(() => ramo(props.cadeia.vendePara, totalVendeM.value, ROW_M, GAP_M, 'vende'))
</script>

<template>
  <section class="acd">
    <h2 class="acd__title">De quem a {{ nome }} compra<br> e para quem vende.</h2>

    <!-- desktop e tablet: o grafo inteiro -->
    <div class="acd__grafo" :style="{ '--row': `${ROW}px`, '--gap': `${GAP}px` }">
      <span class="acd__label acd__label--compra">{{ cadeia.compraDe.length ? 'Compra de' : '' }}</span>
      <span class="acd__label acd__label--vende">{{ cadeia.vendePara.length ? 'Vende para' : '' }}</span>

      <ul class="acd__nos" :style="{ height: `${total}px`, paddingTop: `${compra.top}px` }">
        <li v-for="l in compra.itens" :key="l.item.ticker">
          <NuxtLink :to="`/asset/${l.item.ticker}`" class="acd__no">
            <NuAssetLogo :ticker="l.item.ticker" :letter="l.item.ticker.charAt(0)" tile-bg="var(--nu-tile-blue-bg)" tile-fg="var(--nu-blue-deep)" :size="36" :radius="11" />
            <span class="acd__id">
              <span class="acd__ticker">{{ l.item.ticker }}</span>
              <span class="acd__nome">{{ l.item.nome }}<template v-if="l.item.oQue"> · {{ l.item.oQue }}</template></span>
            </span>
          </NuxtLink>
        </li>
      </ul>

      <div class="acd__fio" :style="{ height: `${total}px` }" aria-hidden="true">
        <svg :viewBox="`0 0 100 ${total}`" preserveAspectRatio="none">
          <path v-for="l in compra.itens" :key="l.item.ticker" :d="l.d" />
        </svg>
        <template v-for="l in compra.itens" :key="`v-${l.item.ticker}`">
          <span v-if="l.item.valor" class="acd__valor" :style="{ top: `${l.ey}px`, left: `${l.ex}%`, transform: `translate(-${l.ex}%, -50%)` }"><b>{{ l.item.valor }}</b> <span class="acd__quando">{{ l.item.valorQuando }}</span></span>
        </template>
      </div>

      <div class="acd__centro" :style="{ height: `${total}px` }">
        <div class="acd__empresa">
          <NuAssetLogo :ticker="ticker" :letter="ticker.charAt(0)" tile-bg="var(--nu-navy-2)" tile-fg="var(--nu-white)" :size="44" :radius="13" />
          <span class="acd__empresa-ticker">{{ ticker }}</span>
          <span class="acd__empresa-nome">{{ nome }}</span>
        </div>
      </div>

      <div class="acd__fio" :style="{ height: `${total}px` }" aria-hidden="true">
        <svg :viewBox="`0 0 100 ${total}`" preserveAspectRatio="none">
          <path v-for="l in vende.itens" :key="l.item.ticker" :d="l.d" />
        </svg>
        <template v-for="l in vende.itens" :key="`v-${l.item.ticker}`">
          <span v-if="l.item.valor" class="acd__valor" :style="{ top: `${l.ey}px`, left: `${l.ex}%`, transform: `translate(-${l.ex}%, -50%)` }"><b>{{ l.item.valor }}</b> <span class="acd__quando">{{ l.item.valorQuando }}</span></span>
        </template>
      </div>

      <ul class="acd__nos" :style="{ height: `${total}px`, paddingTop: `${vende.top}px` }">
        <li v-for="l in vende.itens" :key="l.item.ticker">
          <NuxtLink :to="`/asset/${l.item.ticker}`" class="acd__no">
            <NuAssetLogo :ticker="l.item.ticker" :letter="l.item.ticker.charAt(0)" tile-bg="var(--nu-tile-blue-bg)" tile-fg="var(--nu-blue-deep)" :size="36" :radius="11" />
            <span class="acd__id">
              <span class="acd__ticker">{{ l.item.ticker }}</span>
              <span class="acd__nome">{{ l.item.nome }}<template v-if="l.item.oQue"> · {{ l.item.oQue }}</template></span>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- celular: dois meio-grafos, compra → empresa e empresa → venda -->
    <div class="acd__ramos" :style="{ '--row': `${ROW_M}px`, '--gap': `${GAP_M}px` }">
      <template v-for="r in [
        { id: 'compra', label: 'Compra de', g: compraM, total: totalCompraM },
        { id: 'vende', label: 'Vende para', g: vendeM, total: totalVendeM },
      ]" :key="r.id">
        <div v-if="r.g.itens.length" class="acd__ramo" :class="`acd__ramo--${r.id}`">
          <span class="acd__label">{{ r.label }}</span>
          <div class="acd__ramo-grid">
            <ul class="acd__nos" :style="{ height: `${r.total}px` }">
              <li v-for="l in r.g.itens" :key="l.item.ticker">
                <NuxtLink :to="`/asset/${l.item.ticker}`" class="acd__no">
                  <NuAssetLogo :ticker="l.item.ticker" :letter="l.item.ticker.charAt(0)" tile-bg="var(--nu-tile-blue-bg)" tile-fg="var(--nu-blue-deep)" :size="30" :radius="9" />
                  <span class="acd__id">
                    <span class="acd__ticker">{{ l.item.ticker }}</span>
                    <span class="acd__nome">{{ l.item.oQue ?? l.item.nome }}</span>
                  </span>
                </NuxtLink>
              </li>
            </ul>
            <div class="acd__fio" :style="{ height: `${r.total}px` }" aria-hidden="true">
              <!-- ramo('vende') já desenha a empresa em x=0: a curva serve como está -->
              <svg :viewBox="`0 0 100 ${r.total}`" preserveAspectRatio="none">
                <path v-for="l in r.g.itens" :key="l.item.ticker" :d="l.d" />
              </svg>
              <template v-for="l in r.g.itens" :key="`v-${l.item.ticker}`">
                <span v-if="l.item.valor" class="acd__valor" :style="{ top: `${l.ey}px`, left: `${l.ex}%`, transform: `translate(-${l.ex}%, -50%)` }"><b>{{ l.item.valor }}</b> <span class="acd__quando">{{ l.item.valorQuando }}</span></span>
              </template>
            </div>
            <div class="acd__centro" :style="{ height: `${r.total}px` }">
              <div class="acd__empresa">
                <NuAssetLogo :ticker="ticker" :letter="ticker.charAt(0)" tile-bg="var(--nu-navy-2)" tile-fg="var(--nu-white)" :size="32" :radius="10" />
                <span class="acd__empresa-ticker">{{ ticker }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <p v-if="cadeia.fontes" class="acd__fonte">
      Fontes: {{ cadeia.fontes }}. Valores como a empresa informou; contratos somam a vigência inteira.
    </p>
  </section>
</template>

<style scoped>
.acd {
  background: var(--nu-cream);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.acd__title {
  margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.06;
}

/* ——— grafo (desktop/tablet) ——— */
.acd__grafo {
  margin-top: 40px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(120px, .85fr) minmax(150px, 190px) minmax(120px, .85fr) minmax(0, 1fr);
  grid-template-rows: auto auto;
  row-gap: 14px;
}
.acd__label { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 700; }
.acd__label--compra { grid-column: 1; grid-row: 1; }
.acd__label--vende { grid-column: 5; grid-row: 1; }
.acd__grafo > .acd__nos, .acd__grafo > .acd__fio, .acd__grafo > .acd__centro { grid-row: 2; }

.acd__nos {
  list-style: none; margin: 0; padding: 0; box-sizing: border-box; min-width: 0;
  display: flex; flex-direction: column; gap: var(--gap);
}
.acd__no {
  height: var(--row); box-sizing: border-box;
  display: flex; align-items: center; gap: 12px;
  background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 0 16px;
  transition: transform .18s, box-shadow .2s;
}
.acd__no:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.acd__id { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.acd__ticker { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; letter-spacing: -.2px; }
.acd__nome {
  color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* as linhas: SVG esticado na largura da coluna (o traço não engrossa) */
.acd__fio { position: relative; min-width: 0; }
.acd__fio svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.acd__fio path { fill: none; stroke: var(--nu-gray); stroke-width: 1.25; vector-effect: non-scaling-stroke; opacity: .55; }
/* a posição (left/top/translate) vem do ponto da curva, no template: a âncora
   proporcional (translate de -x%) mantém a etiqueta dentro da coluna */
.acd__valor {
  position: absolute; width: max-content; box-sizing: border-box;
  padding: 4px 10px; border-radius: 999px;
  background: var(--nu-white); box-shadow: 0 0 0 1px var(--nu-navy-06);
  color: var(--nu-gray-2); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.3;
  font-variant-numeric: tabular-nums; white-space: nowrap; text-align: center;
}
.acd__valor b { color: var(--nu-ink); font-weight: 700; }

/* a empresa: o único navy da seção */
.acd__centro { display: flex; align-items: center; justify-content: center; }
.acd__empresa {
  width: 100%; box-sizing: border-box;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  background: var(--nu-navy); border-radius: var(--nu-r-panel); padding: 20px 14px;
}
.acd__empresa-ticker { margin-top: 4px; color: var(--nu-white); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -.2px; }
.acd__empresa-nome { color: var(--nu-cream); font-size: var(--nu-fs-sm); font-weight: 500; opacity: .75; text-align: center; }

/* ——— celular: dois meio-grafos ——— */
.acd__ramos { display: none; }
.acd__ramo { margin-top: 28px; display: flex; flex-direction: column; gap: 12px; }
.acd__ramo-grid { display: grid; grid-template-columns: minmax(0, 1fr) 124px 80px; }
/* na venda a empresa vem primeiro: centro | fio | cartões */
.acd__ramo--vende .acd__ramo-grid { grid-template-columns: 80px 124px minmax(0, 1fr); }
.acd__ramo--vende .acd__centro { grid-column: 1; grid-row: 1; }
.acd__ramo--vende .acd__fio { grid-column: 2; grid-row: 1; }
.acd__ramo--vende .acd__nos { grid-column: 3; grid-row: 1; }
.acd__ramos .acd__no { padding: 0 12px; gap: 10px; }
.acd__ramos .acd__ticker { font-size: var(--nu-fs-sm); }
.acd__ramos .acd__nome { font-size: var(--nu-fs-xs); }
.acd__ramos .acd__empresa { padding: 14px 8px; }
.acd__ramos .acd__empresa-ticker { font-size: var(--nu-fs-sm); }
/* no celular o fio tem ~120px: número em cima, "em 2025" embaixo */
.acd__ramos .acd__valor { padding: 4px 9px; border-radius: 12px; }
.acd__ramos .acd__valor b, .acd__ramos .acd__quando { display: block; }

.acd__fonte {
  margin: 32px 0 0; max-width: 760px;
  color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5;
}

@media (max-width: 760px) {
  .acd__grafo { display: none; }
  .acd__ramos { display: block; }
  .acd__title br { display: none; }
}
</style>
