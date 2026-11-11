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
//
// Robustez (11/11/2026):
//  - A linha é um <details> (e não o NuAcordeao) porque o cabeçalho dela é
//    rico (logo, código, nome em h3, papel, selos, frase): a abertura segue a
//    regra do acordeão da base, 520ms em --nu-ease-troca na altura e na
//    opacidade. Fechada, sobe 2px e ganha --nu-shadow-card sob o ponteiro;
//    apertada, afunda; no teclado, o anel de 3px abraça o cartão inteiro.
//  - "Ler tudo" é o NuLinkSeta: o resto do período continua na MESMA frase (o
//    texto já está no HTML, escondido até o clique) e o foco vai para ele.
//  - "Ver as N anteriores" é o NuAcordeao da base.
//  - A linha do tempo das revisões: ponto de 9px centrado num fio de 1px, o
//    fio liga um ponto ao outro com a mesma folga em cima e embaixo; a mais
//    nova em cobalto com o halo.
//  - "Ver <TICKER>" e "Perguntar à IA sobre <TICKER>" são o NuLinkSeta (o da
//    IA leva o corte na frente, como no topo da tese).
//  - A última avaliação deixou de ser caixa dentro do cartão: é um bloco com
//    o fio embaixo, como os outros.
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
const rotuloAnteriores = computed(() => (anteriores.value.length === 1 ? 'Ver a anterior' : `Ver as ${anteriores.value.length} anteriores`))

// "Ler tudo": o resto aparece na mesma frase e recebe o foco (o link some)
const lido = reactive({ porque: false, gatilho: false })
const restoPorque = ref<HTMLElement | null>(null)
const restoGatilho = ref<HTMLElement | null>(null)
function lerTudo(qual: 'porque' | 'gatilho') {
  lido[qual] = true
  void nextTick(() => (qual === 'porque' ? restoPorque : restoGatilho).value?.focus({ preventScroll: true }))
}
const verAnteriores = ref(false)
const idBase = useId()
</script>

<template>
  <details v-contexto-chat="contexto" class="tal">
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
        <NuSelo v-if="linha.selo" :tom="linha.seloTom">{{ linha.selo }}</NuSelo>
        <NuSelo v-if="linha.data" tom="contorno">Revisto em {{ dataCurta(linha.data) }}</NuSelo>
      </span>
      <NuMais class="tal__mais" :tamanho="36" />
      <span v-if="linha.frase" class="tal__frase">{{ linha.frase }}</span>
    </summary>

    <div v-if="temCorpo" class="tal__corpo">
      <div class="tal__col">
        <section v-if="linha.ultima" class="tal__bloco tal__bloco--ultima">
          <h4 class="tal__rotulo">{{ linha.ultima.rotulo }}</h4>
          <p class="tal__ultima">
            <NuSelo v-if="linha.ultima.decisao" :tom="linha.ultima.tom">{{ linha.ultima.decisao }}</NuSelo>
            <b>{{ linha.ultima.avaliacao }}</b>
          </p>
          <p v-if="linha.ultima.porque" class="tal__p">{{ linha.ultima.porque }}</p>
        </section>

        <section v-if="linha.porque.inicio" class="tal__bloco">
          <h4 class="tal__rotulo">Por que está na tese</h4>
          <p class="tal__p">
            {{ linha.porque.inicio }}<span
              v-if="linha.porque.resto" v-show="lido.porque" :id="`${idBase}-porque`" ref="restoPorque"
              class="tal__resto" tabindex="-1"
            >{{ ` ${linha.porque.resto}` }}</span>
          </p>
          <NuLinkSeta
            v-if="linha.porque.resto && !lido.porque" class="tal__ler" tom="tinta"
            :aria-expanded="false" :aria-controls="`${idBase}-porque`" @click="lerTudo('porque')"
          >Ler tudo</NuLinkSeta>
        </section>
      </div>

      <div v-if="temAcontecer" class="tal__col">
        <section class="tal__bloco">
          <h4 class="tal__rotulo">O que tem de acontecer</h4>
          <template v-if="linha.gatilho.inicio">
            <p class="tal__sub">O gatilho</p>
            <p class="tal__p">
              <TeseTrechos :texto="linha.gatilho.inicio" /><span
                v-if="linha.gatilho.resto" v-show="lido.gatilho" :id="`${idBase}-gatilho`" ref="restoGatilho"
                class="tal__resto" tabindex="-1"
              >{{ ' ' }}<TeseTrechos :texto="linha.gatilho.resto" /></span>
            </p>
            <NuLinkSeta
              v-if="linha.gatilho.resto && !lido.gatilho" class="tal__ler" tom="tinta"
              :aria-expanded="false" :aria-controls="`${idBase}-gatilho`" @click="lerTudo('gatilho')"
            >Ler tudo</NuLinkSeta>
          </template>

          <template v-if="linha.revisoes.length">
            <p class="tal__sub tal__sub--tempo">As revisões</p>
            <ol class="tal__tempo">
              <li v-for="(r, i) in recentes" :key="`r${i}`" class="tal__rev">
                <time v-if="r.data" class="tal__rev-d" :datetime="r.data">{{ dataBr(r.data) }}</time>
                <p class="tal__rev-t"><TeseTrechos :texto="r.texto" /></p>
              </li>
            </ol>
            <NuAcordeao v-if="anteriores.length" v-model:aberto="verAnteriores" class="tal__antes" :tamanho-mais="28">
              <template #titulo><span class="tal__antes-t">{{ verAnteriores ? 'Recolher as anteriores' : rotuloAnteriores }}</span></template>
              <ol class="tal__tempo tal__tempo--antes">
                <li v-for="(r, i) in anteriores" :key="`a${i}`" class="tal__rev">
                  <time v-if="r.data" class="tal__rev-d" :datetime="r.data">{{ dataBr(r.data) }}</time>
                  <p class="tal__rev-t"><TeseTrechos :texto="r.texto" /></p>
                </li>
              </ol>
            </NuAcordeao>
          </template>
        </section>
      </div>

      <p class="tal__pe">
        <NuLinkSeta v-if="linha.href" :to="linha.href" class="tal__ver">Ver {{ linha.ticker.toUpperCase() }}</NuLinkSeta>
        <NuLinkSeta tom="tinta" class="tal__ia" @click="emit('perguntar')"><MarcaCorte :largura="18" class="tal__ia-corte" />Perguntar à IA sobre {{ linha.ticker.toUpperCase() }}</NuLinkSeta>
      </p>
    </div>
  </details>
</template>

<style scoped>
.tal {
  background: var(--nu-card); border-radius: var(--nu-r-panel); box-shadow: var(--nu-shadow-quente);
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
  interpolate-size: allow-keywords;
}
/* fechada, a linha é o clique: sobe 2px sob o ponteiro e afunda ao apertar */
@media (hover: hover) {
  .tal:not([open]):hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
}
.tal:not([open]):has(> .tal__cab:active) { transform: scale(.995); transition-duration: var(--nu-dur-rapida); }
/* o anel de foco abraça o cartão inteiro, não só o cabeçalho */
.tal:has(> .tal__cab:focus-visible) { outline: 3px solid var(--nu-blue); outline-offset: 3px; }

/* ——— a linha fechada ——— */
.tal__cab {
  display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 12px 16px;
  padding: 16px clamp(16px, 2vw, 24px); cursor: pointer; list-style: none; border-radius: var(--nu-r-panel);
  -webkit-tap-highlight-color: transparent;
}
.tal__cab::-webkit-details-marker { display: none; }
.tal__cab:focus-visible { outline: none; }
.tal__id { display: flex; align-items: center; gap: 14px; min-width: 0; }
.tal__quem { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.tal__nomes { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.tal__ticker {
  display: inline-flex; align-items: center; height: 26px; padding: 0 9px; border-radius: var(--nu-r-tag);
  background: var(--nu-ink); color: var(--nu-white); font-size: 13.5px; font-weight: var(--nu-w-forte); letter-spacing: .04em; font-variant-numeric: tabular-nums;
}
.tal__nome {
  margin: 0; color: var(--nu-ink); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.2;
  transition: color var(--nu-dur-media) var(--nu-ease-cor);
}
.tal__cab:hover .tal__nome { color: var(--nu-blue-text); }
.tal__papel { color: var(--nu-gray); font-size: 14.5px; font-weight: var(--nu-w-texto); line-height: 1.35; }
.tal__selos { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
/* o "+" (NuMais) escurece sob o ponteiro e gira com o <details> aberto: sozinho, no <summary> */
.tal__frase {
  grid-column: 1 / -1; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); line-height: 1.55; max-width: 96ch;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.tal[open] > .tal__cab .tal__frase { display: block; overflow: visible; }

/* ——— a linha aberta ———
   a regra do acordeão da base: a altura e a opacidade em --nu-dur-lenta --nu-ease-troca
   (a altura onde o navegador sabe animar o ::details-content) */
.tal::details-content {
  block-size: 0; overflow: clip;
  transition: block-size var(--nu-dur-lenta) var(--nu-ease-troca), content-visibility var(--nu-dur-lenta) allow-discrete;
}
.tal[open]::details-content { block-size: auto; }
.tal[open] > .tal__corpo { animation: nu-surgir var(--nu-dur-lenta) var(--nu-ease-troca) both; }
.tal__corpo {
  display: grid; grid-template-columns: minmax(0, 1fr); gap: 32px clamp(32px, 4vw, 56px);
  margin: 0 clamp(16px, 2vw, 24px); padding: 24px 0; border-top: 1px solid var(--nu-line-2);
}
.tal__col { min-width: 0; display: flex; flex-direction: column; gap: 24px; }
.tal__rotulo { margin: 0; color: var(--nu-ink); font-size: 13px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-caixa); line-height: 1.3; text-transform: uppercase; }
.tal__sub { margin: 16px 0 0; color: var(--nu-gray); font-size: 14px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
.tal__rotulo + .tal__sub { margin-top: 12px; }
.tal__sub--tempo { margin-top: 24px; }
.tal__p { margin: 8px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.6; text-wrap: pretty; }
.tal__rotulo + .tal__p { margin-top: 12px; }
/* o resto do texto entra na mesma frase, com um fade curto */
.tal__resto { animation: nu-surgir var(--nu-dur-media) var(--nu-ease-cor) both; }
.tal__resto:focus { outline: none; }
.tal__ler { margin-top: 8px; font-size: 15px; }
/* a última avaliação: um bloco com o fio embaixo (era uma caixa dentro do cartão) */
.tal__bloco--ultima { padding-bottom: 24px; border-bottom: 1px solid var(--nu-line-2); }
.tal__ultima { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 12px 0 0; }
.tal__ultima b { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); line-height: 1.35; }

/* ——— a linha do tempo das revisões ———
   o ponto (9px) centrado no fio (1px); o fio sai 6px abaixo de um ponto e
   para 6px antes do próximo. O ponto senta no meio da linha da data. */
.tal__tempo { list-style: none; margin: 12px 0 0; padding: 0; }
.tal__rev { --tal-ponto: 9px; --tal-topo: 5px; position: relative; padding: 0 0 20px 24px; }
.tal__rev::before {
  content: ''; position: absolute; left: 0; top: var(--tal-topo); width: var(--tal-ponto); height: var(--tal-ponto); border-radius: 50%;
  background: var(--nu-card); box-shadow: inset 0 0 0 1.5px var(--nu-gray);
}
.tal__rev::after {
  content: ''; position: absolute; left: calc(var(--tal-ponto) / 2 - .5px); width: 1px;
  top: calc(var(--tal-topo) + var(--tal-ponto) + 6px); bottom: calc(6px - var(--tal-topo));
  background: var(--nu-line);
}
.tal__rev:last-child { padding-bottom: 0; }
.tal__rev:last-child::after { display: none; }
/* a mais nova: o ponto cheio em cobalto, com o halo */
.tal__tempo:not(.tal__tempo--antes) > .tal__rev:first-child::before {
  background: var(--nu-blue); box-shadow: 0 0 0 3px color-mix(in srgb, var(--nu-blue) 18%, transparent);
}
.tal__rev-d { display: block; color: var(--nu-ink); font-size: 13.5px; font-weight: var(--nu-w-medio); line-height: 19px; font-variant-numeric: tabular-nums; }
.tal__rev-t { margin: 4px 0 0; color: var(--nu-gray-3); font-size: 15px; font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.6; text-wrap: pretty; }

/* "Ver as N anteriores": o NuAcordeao da base, compacto (o "+" logo depois do
   rótulo) e com o botão recuado até o texto da linha do tempo; a lista de
   dentro fica no fio (o miolo do acordeão corta o que sai da caixa) */
.tal__antes { margin-top: 8px; }
.tal__antes :deep(.nac__cab) { width: auto; justify-content: flex-start; gap: 12px; padding: 8px 0; margin-left: 24px; }
.tal__antes-t { font-size: 15px; letter-spacing: var(--nu-ls-texto); }
.tal__antes :deep(.nac__corpo) { padding-bottom: 4px; }
.tal__tempo--antes { margin-top: 8px; }

/* ——— o pé da linha ——— */
.tal__pe {
  grid-column: 1 / -1; display: flex; align-items: center; gap: 8px 32px; flex-wrap: wrap;
  margin: 0; padding-top: 16px; border-top: 1px solid var(--nu-line-2);
}
.tal__ver, .tal__ia { font-size: 15.5px; }
/* o corte (um svg em bloco na base) entra na linha do texto */
.tal__ia .tal__ia-corte { display: inline-block; margin-right: 8px; vertical-align: -1px; }

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
  .tal, .tal__nome { transition: none; }
  .tal[open] > .tal__corpo, .tal__resto { animation: none; }
  .tal:not([open]):hover, .tal:not([open]):has(> .tal__cab:active) { transform: none; }
  .tal::details-content { transition: none; }
}
</style>
