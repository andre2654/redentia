<script setup lang="ts">
// Uma linha de "O que está na tese" (11/11/2026, docs/aportou/tese.md): o ativo
// como um <details> em cartão creme, no lugar do cartão-muro de antes.
//  - Fechada: a etiqueta carvão do código + o nome; o papel em cinza; à direita
//    o selo do papel ("Núcleo") e o "Revisto em 10/11" (a data tirada do
//    `status`); embaixo a frase do status SEM o prefixo, em até 2 linhas; e o
//    "+" no círculo carvão, que gira ao abrir.
//  - Aberta: "Por que está na tese" (o `rationale`: os 2 primeiros períodos à
//    vista, o resto em "Ler tudo") e "O que tem de acontecer" (o `catalyst`
//    repartido: o gatilho e a linha do tempo das revisões, da mais nova para a
//    mais velha, com os marcadores em caixa alta virando selos; as 3 mais novas
//    à vista, o resto em "Ver as N anteriores"). No pé, "Ver <TICKER>" e
//    "Perguntar à IA sobre <TICKER>".
// Todo o texto fica no HTML do servidor: <details> fechado não esconde do
// buscador. Repartir é função pura (utils/teseTexto); aqui só se desenha.
import type { RevisaoDoCatalyst } from '~/utils/teseTexto'
import { dataBr, dataCurta } from '~/utils/teseTexto'

export interface TeseLinhaVM {
  ticker: string
  name: string
  role: string
  /** o papel/decisão: 'Núcleo', 'Acompanhar', 'Em risco' */
  selo: string | null
  seloTom: 'verde' | 'azul' | 'vermelho' | 'neutro'
  /** 'AAAA-MM-DD' da última revalidação do status */
  data: string | null
  /** a frase do status, sem o prefixo */
  frase: string
  porque: { inicio: string; resto: string }
  gatilho: { inicio: string; resto: string }
  /** da mais nova para a mais velha */
  revisoes: RevisaoDoCatalyst[]
  /** a avaliação do estudo mais recente (studies[0].assets), quando há */
  ultima: { rotulo: string; decisao: string; tom: 'verde' | 'azul' | 'vermelho' | 'neutro'; avaliacao: string; porque: string } | null
  /** /asset/<TICKER> quando o código é da B3 */
  href: string | null
}

const props = defineProps<{ linha: TeseLinhaVM; indice: number; contexto: Record<string, unknown> | null }>()
const emit = defineEmits<{ perguntar: [] }>()

const A_VISTA = 3
const recentes = computed(() => props.linha.revisoes.slice(0, A_VISTA))
const anteriores = computed(() => props.linha.revisoes.slice(A_VISTA))
const temCorpo = computed(() => !!(props.linha.porque.inicio || props.linha.gatilho.inicio || props.linha.revisoes.length || props.linha.ultima))
const temAcontecer = computed(() => !!(props.linha.gatilho.inicio || props.linha.revisoes.length))
</script>

<template>
  <details v-contexto-chat="contexto" class="tal" :style="{ '--i': indice }">
    <summary class="tal__cab">
      <span class="tal__id">
        <NuAssetLogo :ticker="linha.ticker" :letter="linha.ticker.charAt(0) || '?'" tile-bg="var(--nu-cream-2)" tile-fg="var(--nu-ink)" :size="44" :radius="14" />
        <span class="tal__quem">
          <span class="tal__nomes">
            <span class="tal__ticker">{{ linha.ticker }}</span>
            <h3 class="tal__nome">{{ linha.name }}</h3>
          </span>
          <span v-if="linha.role" class="tal__papel">{{ linha.role }}</span>
        </span>
      </span>
      <span v-if="linha.selo || linha.data" class="tal__selos">
        <TeseSelo v-if="linha.selo" :tom="linha.seloTom">{{ linha.selo }}</TeseSelo>
        <TeseSelo v-if="linha.data" tom="contorno">Revisto em {{ dataCurta(linha.data) }}</TeseSelo>
      </span>
      <TeseMais class="tal__mais" />
      <span v-if="linha.frase" class="tal__frase">{{ linha.frase }}</span>
    </summary>

    <div v-if="temCorpo" class="tal__corpo">
      <div class="tal__col">
        <section v-if="linha.ultima" class="tal__bloco tal__bloco--ultima">
          <h4 class="tal__rotulo">{{ linha.ultima.rotulo }}</h4>
          <p class="tal__ultima">
            <TeseSelo v-if="linha.ultima.decisao" :tom="linha.ultima.tom">{{ linha.ultima.decisao }}</TeseSelo>
            <b>{{ linha.ultima.avaliacao }}</b>
          </p>
          <p v-if="linha.ultima.porque" class="tal__p">{{ linha.ultima.porque }}</p>
        </section>

        <section v-if="linha.porque.inicio" class="tal__bloco">
          <h4 class="tal__rotulo">Por que está na tese</h4>
          <p class="tal__p">{{ linha.porque.inicio }}</p>
          <details v-if="linha.porque.resto" class="tal__ler">
            <summary class="tal__ler-b">Ler tudo</summary>
            <p class="tal__p">{{ linha.porque.resto }}</p>
          </details>
        </section>
      </div>

      <div v-if="temAcontecer" class="tal__col">
        <section class="tal__bloco">
          <h4 class="tal__rotulo">O que tem de acontecer</h4>
          <template v-if="linha.gatilho.inicio">
            <p class="tal__sub">O gatilho</p>
            <p class="tal__p"><TeseTrechos :texto="linha.gatilho.inicio" /></p>
            <details v-if="linha.gatilho.resto" class="tal__ler">
              <summary class="tal__ler-b">Ler tudo</summary>
              <p class="tal__p"><TeseTrechos :texto="linha.gatilho.resto" /></p>
            </details>
          </template>

          <template v-if="linha.revisoes.length">
            <p class="tal__sub tal__sub--tempo">As revisões</p>
            <ol class="tal__tempo">
              <li v-for="(r, i) in recentes" :key="`r${i}`" class="tal__rev">
                <time v-if="r.data" class="tal__rev-d" :datetime="r.data">{{ dataBr(r.data) }}</time>
                <p class="tal__rev-t"><TeseTrechos :texto="r.texto" /></p>
              </li>
            </ol>
            <details v-if="anteriores.length" class="tal__antes">
              <summary class="tal__antes-b">
                <span class="tal__antes-f">{{ anteriores.length === 1 ? 'Ver a anterior' : `Ver as ${anteriores.length} anteriores` }}</span>
                <span class="tal__antes-a">Recolher as anteriores</span>
                <TeseMais :tamanho="28" />
              </summary>
              <ol class="tal__tempo tal__tempo--antes">
                <li v-for="(r, i) in anteriores" :key="`a${i}`" class="tal__rev">
                  <time v-if="r.data" class="tal__rev-d" :datetime="r.data">{{ dataBr(r.data) }}</time>
                  <p class="tal__rev-t"><TeseTrechos :texto="r.texto" /></p>
                </li>
              </ol>
            </details>
          </template>
        </section>
      </div>

      <p class="tal__pe">
        <NuxtLink v-if="linha.href" :to="linha.href" class="tal__ver">
          Ver {{ linha.ticker.toUpperCase() }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </NuxtLink>
        <button type="button" class="tal__ia" @click="emit('perguntar')">
          <MarcaCorte :largura="18" />Perguntar à IA sobre {{ linha.ticker.toUpperCase() }}
        </button>
      </p>
    </div>
  </details>
</template>

<style scoped>
.tal {
  background: var(--nu-card); border-radius: var(--nu-r-panel); box-shadow: var(--nu-shadow-quente);
  transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s cubic-bezier(.2, .8, .2, 1);
  animation: nu-fade .5s ease both; animation-delay: calc(var(--i, 0) * 60ms);
  interpolate-size: allow-keywords;
}
.tal:not([open]):hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }

/* ——— a linha fechada ——— */
.tal__cab {
  display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 10px 16px;
  padding: 16px clamp(16px, 2vw, 24px); cursor: pointer; list-style: none; border-radius: var(--nu-r-panel);
}
.tal__cab::-webkit-details-marker { display: none; }
.tal__id { display: flex; align-items: center; gap: 14px; min-width: 0; }
.tal__quem { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.tal__nomes { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.tal__ticker {
  display: inline-flex; align-items: center; height: 26px; padding: 0 9px; border-radius: var(--nu-r-tag);
  background: var(--nu-ink); color: var(--nu-white); font-size: 13.5px; font-weight: 800; letter-spacing: .04em;
}
.tal__nome { margin: 0; color: var(--nu-ink); font-size: clamp(18px, 1.5vw, 21px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; transition: color .2s ease; }
.tal__cab:hover .tal__nome { color: var(--nu-blue-text); }
.tal__papel { color: var(--nu-gray); font-size: 14.5px; font-weight: 500; line-height: 1.35; }
.tal__selos { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
.tal__cab:hover .tal__mais { background: var(--nu-ink-hover); }
.tal[open] > .tal__cab .tal__mais { transform: rotate(45deg); }
.tal__frase {
  grid-column: 1 / -1; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; max-width: 96ch;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.tal[open] > .tal__cab .tal__frase { display: block; overflow: visible; }

/* ——— a linha aberta ——— */
/* a altura anima onde o navegador sabe (::details-content); nos outros, o miolo surge */
.tal::details-content { block-size: 0; overflow: clip; transition: block-size .32s cubic-bezier(.2, .8, .2, 1), content-visibility .32s allow-discrete; }
.tal[open]::details-content { block-size: auto; }
.tal[open] > .tal__corpo { animation: nu-fade .3s ease both; }
.tal__corpo {
  display: grid; grid-template-columns: minmax(0, 1fr); gap: 28px clamp(28px, 4vw, 56px);
  margin: 0 clamp(16px, 2vw, 24px); padding: 24px 0 22px; border-top: 1.5px solid var(--nu-line-2);
}
.tal__col { min-width: 0; display: flex; flex-direction: column; gap: 26px; }
.tal__rotulo { margin: 0; color: var(--nu-ink); font-size: 13.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
.tal__sub { margin: 14px 0 0; color: var(--nu-gray); font-size: 14.5px; font-weight: 700; }
.tal__sub--tempo { margin-top: 22px; }
.tal__p { margin: 8px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6; text-wrap: pretty; }
.tal__rotulo + .tal__p { margin-top: 12px; }
.tal__bloco--ultima { background: var(--nu-page); border-radius: var(--nu-r-tile); padding: 16px 18px; }
.tal__ultima { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 12px 0 0; }
.tal__ultima b { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; line-height: 1.35; }

/* "Ler tudo": o resto do texto, que entra na sequência (o botão some depois de abrir) */
.tal__ler-b {
  display: inline-flex; align-items: center; min-height: 44px; list-style: none; cursor: pointer;
  color: var(--nu-ink); font-size: 15px; font-weight: 700;
  text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1.5px; text-decoration-color: var(--nu-line);
  transition: color .2s ease, text-decoration-color .2s ease;
}
.tal__ler-b::-webkit-details-marker { display: none; }
.tal__ler-b:hover { color: var(--nu-blue-text); text-decoration-color: currentColor; }
.tal__ler[open] > .tal__ler-b { display: none; }
.tal__ler[open] > .tal__p { animation: nu-fade .3s ease both; }

/* a linha do tempo das revisões */
.tal__tempo { list-style: none; margin: 12px 0 0; padding: 0; }
.tal__rev { position: relative; padding: 0 0 18px 22px; }
.tal__rev::before {
  content: ''; position: absolute; left: 0; top: 7px; width: 9px; height: 9px; border-radius: 50%;
  background: var(--nu-card); box-shadow: inset 0 0 0 2.5px var(--nu-ink);
}
.tal__rev::after { content: ''; position: absolute; left: 3.75px; top: 20px; bottom: 0; width: 1.5px; background: var(--nu-line); }
.tal__tempo:not(.tal__tempo--antes) .tal__rev:first-child::before { background: var(--nu-blue); box-shadow: none; }
.tal__rev:last-child { padding-bottom: 4px; }
.tal__rev:last-child::after { display: none; }
.tal__rev-d { display: block; color: var(--nu-ink); font-size: 14.5px; font-weight: 800; font-variant-numeric: tabular-nums; }
.tal__rev-t { margin: 4px 0 0; color: var(--nu-gray-3); font-size: 15px; font-weight: 500; line-height: 1.6; text-wrap: pretty; }

.tal__antes { margin-top: 10px; interpolate-size: allow-keywords; }
.tal__antes::details-content { block-size: 0; overflow: clip; transition: block-size .32s cubic-bezier(.2, .8, .2, 1), content-visibility .32s allow-discrete; }
.tal__antes[open]::details-content { block-size: auto; }
.tal__antes-b {
  display: inline-flex; align-items: center; gap: 12px; min-height: 44px; padding: 0 8px 0 18px; list-style: none; cursor: pointer;
  border-radius: var(--nu-r-pill); background: var(--nu-cream-2); color: var(--nu-ink); font-size: 14.5px; font-weight: 700;
  transition: background .2s ease;
}
.tal__antes-b::-webkit-details-marker { display: none; }
.tal__antes-b:hover { background: var(--nu-line-2); }
.tal__antes-a { display: none; }
.tal__antes[open] > .tal__antes-b .tal__antes-f { display: none; }
.tal__antes[open] > .tal__antes-b .tal__antes-a { display: inline; }
.tal__antes[open] > .tal__antes-b :deep(.tma) { transform: rotate(45deg); }
.tal__antes[open] > .tal__tempo { margin-top: 18px; animation: nu-fade .3s ease both; }

/* o pé da linha */
.tal__pe {
  grid-column: 1 / -1; display: flex; align-items: center; gap: 8px 24px; flex-wrap: wrap;
  margin: 0; padding-top: 14px; border-top: 1.5px solid var(--nu-line-2);
}
.tal__ver, .tal__ia {
  display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0; border: 0; background: none;
  color: var(--nu-ink); font: inherit; font-size: 15.5px; font-weight: 700; cursor: pointer; transition: color .2s ease;
}
.tal__ver svg { transition: transform .2s ease; }
.tal__ver:hover, .tal__ia:hover { color: var(--nu-blue-text); }
.tal__ver:hover svg { transform: translateX(3px); }

@media (min-width: 980px) {
  .tal__corpo { grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); }
  .tal__corpo:not(:has(.tal__col + .tal__col)) { grid-template-columns: minmax(0, 1fr); }
  .tal__corpo:not(:has(.tal__col + .tal__col)) .tal__col { max-width: 80ch; }
}
@media (max-width: 720px) {
  .tal__cab { grid-template-columns: minmax(0, 1fr) auto; }
  .tal__selos { grid-column: 1 / -1; grid-row: 2; justify-content: flex-start; }
  .tal__mais { grid-column: 2; grid-row: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .tal, .tal[open] > .tal__corpo, .tal__ler[open] > .tal__p, .tal__antes[open] > .tal__tempo { animation: none; transition: none; }
  .tal:not([open]):hover { transform: none; }
  .tal::details-content, .tal__antes::details-content { transition: none; }
  .tal__ver svg { transition: none; }
}
</style>
