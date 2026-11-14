<script setup lang="ts">
// O resumo factual do /asset, recolhido (03/11/2026). O dono achou o bloco
// "muito texto" e pediu "só uma barra ocupando toda a largura escrito Resumo e
// podendo apertar para ver mais detalhes (e fazer o texto surgir com o mesmo
// efeito do chat)". Depois, no preview: a barra é o próprio título ("PETR4 em
// resumo", com o chevron à direita), sem outro gatilho, sem o aviso de
// recomendação neste bloco; e uma faixa de ponta a ponta da tela, colada no
// céu de cima, com o texto nas margens do conteúdo do céu. Dentro, as frases
// curtas com o número em negrito, os indicadores numa lista, os proventos por
// ano numa <dl> e as fontes juntas no fim, com a data uma vez.
//
// SEO: <details> nativo, fechado. O texto inteiro está no HTML do servidor
// (o Google indexa texto dentro de <details>; o que ele perde é conteúdo que
// só chega por JS no clique, por isso nada de v-if nem busca ao abrir).
// O miolo vem pronto de utils/assetResumo.ts (resumoHtml, tudo escapado), o
// mesmo no servidor e no cliente. Na PRIMEIRA abertura, e só no cliente, cada
// palavra é embrulhada por utils/revelar-palavras.ts e sai do desfoque como nas
// respostas do chat (a keyframe nu-palavra está em base.css). Terminada a fila,
// o miolo volta ao HTML puro: fechar e abrir de novo mostra o texto direto.
// Movimento reduzido: texto direto sempre.
// Os `paragrafos` (o texto corrido) seguem para o chat, por AtivoNoite.
// Robustez (11/11/2026): o "+" é o NuMais da base (gira 45° sozinho com o
// <details>, fica cobalto sob o ponteiro, como em todo acordeão do site); onde o
// navegador sabe animar o <details> (::details-content), a altura abre e fecha
// em 520ms na curva de troca, e as palavras surgem por cima.
import { resumoHtml, type AcaoResumoVM } from '~/utils/assetResumo'
import { agendarPalavras, contarPalavras, envolverPalavras } from '~/utils/revelar-palavras'

const props = defineProps<{ ticker: string; resumo: AcaoResumoVM }>()

const DURACAO = 520 // a mesma do CSS (.rp) e de revelar-palavras
const base = computed(() => resumoHtml(props.resumo.fatos))
const revelando = ref<string | null>(null)
const miolo = computed(() => revelando.value ?? base.value)

let jaAbriu = false
let fim: ReturnType<typeof setTimeout> | undefined
function parar() {
  clearTimeout(fim)
  revelando.value = null
}

// o clique chega antes de o <details> abrir: o embrulho entra no DOM antes do
// primeiro quadro aberto, sem o texto piscar inteiro (Enter e espaço também são clique)
function aoClicar(e: MouseEvent) {
  const d = (e.currentTarget as HTMLElement).parentElement as HTMLDetailsElement | null
  if (!d || d.open || jaAbriu) return
  jaAbriu = true
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const agora = performance.now()
  const agenda = agendarPalavras([], contarPalavras(base.value), agora)
  revelando.value = envolverPalavras(base.value, agenda, agora)
  fim = setTimeout(parar, (agenda.length ? agenda[agenda.length - 1]! - agora : 0) + DURACAO + 60)
}
// aberto por outro caminho (a busca da página, por exemplo): texto direto;
// fechado no meio da fila: na próxima, texto direto
function aoAlternar(e: Event) {
  if ((e.currentTarget as HTMLDetailsElement).open) jaAbriu = true
  else parar()
}
watch(() => props.ticker, () => { jaAbriu = false; parar() })
onBeforeUnmount(() => clearTimeout(fim))
</script>

<template>
  <div class="ars2">
    <details v-if="base" :key="ticker" class="ars2__mais" @toggle="aoAlternar">
      <summary class="ars2__sum" @click="aoClicar">
        <h2 class="ars2__h2">{{ resumo.fatos.titulo }}</h2>
        <NuMais :tamanho="36" class="ars2__chev" />
      </summary>
      <!-- eslint-disable-next-line vue/no-v-html — resumoHtml escapa tudo antes -->
      <div class="ars2__corpo" v-html="miolo" />
    </details>
  </div>
</template>

<style scoped>
/* Aportou (11/11/2026): a faixa branca de ponta a ponta virou um cartão creme
   na coluna do topo (não existe faixa branca na marca), no padrão do FAQ: a
   pergunta em 700 e o "+" num círculo carvão que gira 45 graus ao abrir. */
.ars2 { --ars2-m: clamp(20px, 2.4vw, 28px); max-width: 1240px; margin: 0 auto; interpolate-size: allow-keywords; }
.ars2__mais { border-radius: var(--nu-r-panel); background: var(--nu-card); box-shadow: var(--nu-shadow-quente); overflow: hidden; }
.ars2__sum {
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  min-height: 72px; padding: 16px var(--ars2-m); cursor: pointer; list-style: none;
  color: var(--nu-ink); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-medio); line-height: 1.3;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), box-shadow var(--nu-dur-media) var(--nu-ease-cor);
}
.ars2__sum::-webkit-details-marker { display: none; }
.ars2__h2 { margin: 0; font: inherit; color: inherit; letter-spacing: var(--nu-ls-titulo); transition: color var(--nu-dur-media) var(--nu-ease-cor); }
.ars2__sum:hover { background: var(--nu-band); }
.ars2__sum:active { background: var(--nu-cream-2); transition-duration: var(--nu-dur-rapida); }
.ars2__sum:hover .ars2__h2 { color: var(--nu-blue-text); }
/* sob o ponteiro o "+" fica cobalto, como no NuAcordeao */
.ars2__sum:hover .ars2__chev { background: var(--nu-blue); }
.ars2__sum:focus-visible { outline-offset: -3px; border-radius: var(--nu-r-panel); }
.ars2__mais[open] .ars2__sum { box-shadow: inset 0 -1px 0 var(--nu-line-2); }
/* a altura anima onde o navegador sabe (o conteúdo segue inteiro no HTML do servidor) */
@supports selector(::details-content) {
  .ars2__mais::details-content {
    block-size: 0; overflow-y: clip;
    transition: block-size var(--nu-dur-lenta) var(--nu-ease-troca), content-visibility var(--nu-dur-lenta) allow-discrete;
  }
  .ars2__mais[open]::details-content { block-size: auto; }
}

/* dentro: a largura toda, nas mesmas margens da barra */
.ars2__corpo { padding: 20px var(--ars2-m) 26px; }
.ars2__corpo :deep(.ars2__frase) { margin: 0 0 8px; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); line-height: 1.6; font-variant-numeric: tabular-nums; }
.ars2__corpo :deep(b) { color: var(--nu-ink); font-weight: var(--nu-w-medio); white-space: nowrap; }
/* a lista corre em fileiras na largura toda (uma coluna no celular): segue lista simples */
.ars2__corpo :deep(.ars2__ind) { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0 40px; margin: 18px 0 0; padding: 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); line-height: 1.75; font-variant-numeric: tabular-nums; }
.ars2__corpo :deep(.ars2__ind li) { margin-left: 18px; }
.ars2__corpo :deep(.ars2__ind li::marker) { color: var(--nu-gray); }
.ars2__corpo :deep(.ars2__nota) { margin: 6px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); line-height: 1.5; }
.ars2__corpo :deep(.ars2__prov) { margin-top: 20px; }
.ars2__corpo :deep(.ars2__anos) { display: flex; flex-wrap: wrap; margin: 12px 0 0; border-top: 1px solid var(--nu-line-2); border-bottom: 1px solid var(--nu-line-2); font-variant-numeric: tabular-nums; }
.ars2__corpo :deep(.ars2__ano) { display: flex; flex-direction: column; gap: 2px; padding: 10px 18px 10px 0; margin-right: 18px; }
.ars2__corpo :deep(.ars2__ano dt) { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); }
.ars2__corpo :deep(.ars2__ano dd) { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); }
.ars2__corpo :deep(.ars2__ano--atual dt) { color: var(--nu-blue-text); }
.ars2__corpo :deep(.ars2__ano--doze) { padding-left: 18px; border-left: 1px solid var(--nu-line-2); }
.ars2__corpo :deep(.ars2__fontes) { margin: 20px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.55; }

/* a palavra surgindo do desfoque, como no chat (ChatMensagem) */
.ars2__corpo :deep(.rp) { display: inline-block; animation: nu-palavra var(--nu-dur-lenta) var(--nu-ease-saida) backwards; }
.ars2__corpo :deep(.rp--ja) { animation: none; }

@media (max-width: 560px) {
  .ars2__corpo :deep(.ars2__ano) { padding-right: 12px; margin-right: 12px; }
  /* no celular, os 12 meses viram a última fileira, com o fio em cima */
  .ars2__corpo :deep(.ars2__ano--doze) { flex-basis: 100%; margin-right: 0; padding-left: 0; border-left: 0; border-top: 1px solid var(--nu-line-2); }
}
@media (prefers-reduced-motion: reduce) {
  .ars2__sum, .ars2__h2 { transition: none; }
  .ars2__mais::details-content { transition: none; }
  .ars2__corpo :deep(.rp) { animation: none; }
}
</style>
