<script setup lang="ts">
// A cadeia de fornecimento do /asset: "O razão" (03/11/2026, a escolha do dono
// entre três direções; substitui o mapa com as linhas e o nó navy, o antigo
// AcaoCadeia). Dados de GET /assets/{t}/supply-chain (useAcao). Uma linha por empresa,
// com a empresa no meio: à esquerda o que a empresa da página COMPRA dela, à
// direita o que VENDE para ela. Quem está nas duas pontas (a Vibra na PETR4)
// enche as duas células da mesma linha, sem cartão repetido. Valor que a fonte
// não deu fica calado; a fonte e o ano ficam embaixo, em cinza. O "restante"
// vira duas frases no pé: o que a conta explica é uma fração, e a frase diz
// qual. Passar o mouse acende a linha e as setas que chegam e saem do centro;
// clicar no valor (ou em "provas") abre os documentos (AcaoCadeiaDetalhe).
// No celular a linha vira um bloco: a empresa em cima e as duas relações embaixo.
import AcaoCadeiaDetalhe from '~/components/acao/AcaoCadeiaDetalhe.vue'

import type { AcaoCadeiaVM } from '~/types/acao'

// os props por extenso: o compilador do Vue não resolve tipo importado sem o TypeScript instalado
const props = defineProps<{ cadeia: AcaoCadeiaVM; nome: string; ticker: string; tom?: 'branco' | 'creme' }>()
const { empresas, cobertura, resto, aberto, ativo, titulo, contexto, fontes } = useCadeiaLeitura(() => props)
</script>

<template>
  <section v-contexto-chat="contexto" class="crz" :class="`crz--${tom ?? 'creme'}`">
    <header class="crz__cab">
      <NuEyebrow como="p" class="crz__tipo">Cadeia</NuEyebrow>
      <h2 class="crz__h2">{{ titulo }}</h2>
      <p class="crz__dek">Empresas listadas que aparecem nos documentos da {{ nome }} ou nos delas como fornecedoras ou clientes.</p>
    </header>

    <div class="crz__tabela" role="table" :aria-label="titulo">
      <div class="crz__linha crz__linha--cab" role="row">
        <span role="columnheader">A {{ nome }} compra</span>
        <span role="columnheader">Empresa</span>
        <span role="columnheader">A {{ nome }} vende</span>
      </div>
      <div
        v-for="e in empresas" :key="e.ticker" role="row" class="crz__linha"
        :class="{ 'crz__linha--on': ativo === e.ticker, 'crz__linha--recua': ativo && ativo !== e.ticker }"
        @mouseenter="ativo = e.ticker" @mouseleave="ativo = null"
      >
        <div role="cell" class="crz__rel crz__rel--compra">
          <template v-if="e.compra">
            <span class="crz__oque">{{ e.compra.oQue ?? 'fornecedora' }}</span>
            <button v-if="valorDaLigacao(e.compra)" type="button" class="crz__valor" @click="aberto = e.compra.detalhe">{{ valorDaLigacao(e.compra) }}</button>
            <span class="crz__fonte">{{ fonteDaLigacao(e.compra) }}<template v-if="!valorDaLigacao(e.compra)"> · <button type="button" class="crz__provas" @click="aberto = e.compra.detalhe">provas</button></template></span>
          </template>
          <span v-else class="crz__vazio" aria-hidden="true" />
        </div>
        <div role="cell" class="crz__empresa">
          <svg class="crz__seta crz__seta--entra" :class="{ 'crz__seta--some': !e.compra }" width="22" height="10" viewBox="0 0 22 10" aria-hidden="true"><path d="M21 5H3M7 1L3 5l4 4" /></svg>
          <NuxtLink :to="`/asset/${e.ticker}`" class="crz__quem">
            <NuAssetLogo :ticker="e.ticker" :letter="e.ticker.charAt(0)" tile-bg="var(--nu-tile-blue-bg)" tile-fg="var(--nu-blue-deep)" :size="30" :radius="9" />
            <span class="crz__id">
              <span class="crz__ticker">{{ e.ticker }}</span>
              <span class="crz__nome">{{ e.nome }}</span>
            </span>
          </NuxtLink>
          <svg class="crz__seta crz__seta--sai" :class="{ 'crz__seta--some': !e.venda }" width="22" height="10" viewBox="0 0 22 10" aria-hidden="true"><path d="M21 5H3M7 1L3 5l4 4" /></svg>
          <span v-if="e.papel === 'ambas'" class="crz__ambas">fornecedora e cliente</span>
        </div>
        <div role="cell" class="crz__rel crz__rel--venda">
          <template v-if="e.venda">
            <span class="crz__oque">{{ e.venda.oQue ?? 'cliente' }}</span>
            <button v-if="valorDaLigacao(e.venda)" type="button" class="crz__valor" @click="aberto = e.venda.detalhe">{{ valorDaLigacao(e.venda) }}</button>
            <span class="crz__fonte">{{ fonteDaLigacao(e.venda) }}<template v-if="!valorDaLigacao(e.venda)"> · <button type="button" class="crz__provas" @click="aberto = e.venda.detalhe">provas</button></template></span>
          </template>
          <span v-else class="crz__vazio" aria-hidden="true" />
        </div>
      </div>
    </div>

    <div v-if="cobertura.length" class="crz__conta">
      <p class="crz__conta-r">O que a conta explica</p>
      <p v-for="(f, i) in cobertura" :key="i" class="crz__conta-f">{{ f }}</p>
      <p class="crz__conta-l">
        <button v-if="resto.clientes && cadeia.cobertura?.receita" type="button" class="crz__provas" @click="aberto = resto.clientes">Ver a conta das vendas</button>
        <button v-if="resto.custo && cadeia.cobertura?.custo" type="button" class="crz__provas" @click="aberto = resto.custo">Ver a conta do custo</button>
      </p>
    </div>
    <p v-if="fontes" class="crz__fontes">{{ fontes }}</p>
    <AcaoCadeiaDetalhe :detalhe="aberto" @close="aberto = null" />
  </section>
</template>

<style scoped>
.crz { --mola: cubic-bezier(.2, .8, .2, 1); padding: clamp(64px, 7vw, 100px) clamp(20px, 5.5vw, 80px); }
/* a alternância da página do ativo na Aportou: a faixa quente e o creme da página */
.crz--creme { background: var(--nu-band); }
.crz--branco { background: var(--nu-page); }
.crz__cab { display: flex; flex-direction: column; align-items: flex-start; max-width: 1240px; margin: 0 auto; }
.crz__h2 { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.03em; line-height: 1.04; text-wrap: balance; }
.crz__dek { margin: 14px 0 0; max-width: 60ch; color: var(--nu-gray-3); font-size: clamp(16px, 1.4vw, 18px); font-weight: 500; line-height: 1.5; }

.crz__tabela { max-width: 1240px; margin: clamp(28px, 3.4vw, 44px) auto 0; }
.crz__linha {
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(240px, 300px) minmax(0, 1fr); align-items: center; gap: 0 20px;
  /* o fio reto entre as linhas; o canto redondo só na linha acesa (sem fio) */
  padding: 14px 16px; border-top: 1.5px solid var(--nu-line-2);
  transition: background .2s ease, box-shadow .2s ease, opacity .2s ease;
}
.crz__linha--cab { padding-top: 0; padding-bottom: 10px; border-top: 0; color: var(--nu-ink); font-size: 13.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
.crz__linha--cab span:first-child { text-align: right; }
.crz__linha--cab span:nth-child(2) { text-align: center; }
.crz__linha--on { border-radius: 14px; background: var(--nu-white); box-shadow: var(--nu-shadow-quente); border-top-color: transparent; }
.crz__linha--on + .crz__linha { border-top-color: transparent; }
.crz__linha--recua { opacity: .6; }

.crz__rel { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.crz__rel--compra { align-items: flex-end; text-align: right; }
.crz__oque { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; line-height: 1.35; }
.crz__valor {
  padding: 0; border: 0; background: none; font: inherit; cursor: pointer;
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; font-variant-numeric: tabular-nums;
  text-decoration: underline; text-decoration-thickness: 1.5px; text-decoration-color: var(--nu-line); text-underline-offset: 3px; transition: color .2s ease, text-decoration-color .2s ease;
}
.crz__rel--compra .crz__valor { align-self: flex-end; }
.crz__rel--venda .crz__valor { align-self: flex-start; }
.crz__valor:hover { color: var(--nu-blue-text); text-decoration-color: currentColor; }
.crz__fonte { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.crz__provas { padding: 0; border: 0; background: none; font: inherit; color: var(--nu-blue-text); font-weight: 700; cursor: pointer; }
.crz__provas:hover { color: var(--nu-blue-text); text-decoration: underline; text-underline-offset: 3px; }

.crz__empresa { position: relative; display: flex; align-items: center; justify-content: center; gap: 8px; }
.crz__quem {
  display: flex; align-items: center; gap: 10px; min-width: 0; padding: 6px 12px 6px 6px; border-radius: var(--nu-r-pill); color: inherit;
  background: var(--nu-white); box-shadow: var(--nu-shadow-quente); transition: box-shadow .25s var(--mola), transform .25s var(--mola);
}
.crz__quem:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.crz__id { display: flex; flex-direction: column; min-width: 0; }
.crz__ticker { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 800; transition: color .2s ease; }
.crz__quem:hover .crz__ticker { color: var(--nu-blue-text); }
.crz__nome { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
.crz__seta { flex-shrink: 0; fill: none; stroke: var(--nu-sand); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; transition: stroke .2s ease, transform .25s var(--mola); }
.crz__seta--some { visibility: hidden; }
.crz__linha--on .crz__seta { stroke: var(--nu-blue); }
.crz__linha--on .crz__seta--entra { transform: translateX(-2px); }
.crz__linha--on .crz__seta--sai { transform: translateX(-2px); }
.crz__ambas { position: absolute; left: 50%; bottom: -14px; transform: translateX(-50%); white-space: nowrap; color: var(--nu-blue-text); font-size: var(--nu-fs-xs); font-weight: 700; }

.crz__conta { max-width: 1240px; margin: 36px auto 0; padding-top: 20px; border-top: 1.5px solid var(--nu-line-2); }
.crz__conta-r { margin: 0 0 10px; color: var(--nu-ink); font-size: 13.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
.crz__conta-f { max-width: 76ch; margin: 0 0 8px; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6; font-variant-numeric: tabular-nums; }
.crz__conta-l { display: flex; gap: 18px; margin: 8px 0 0; font-size: var(--nu-fs-sm); }
.crz__fontes { max-width: 1240px; margin: 18px auto 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 500; line-height: 1.55; }

/* ——— celular: a empresa em cima, as duas relações embaixo ——— */
@media (max-width: 760px) {
  .crz__linha--cab { display: none; }
  .crz__linha { grid-template-columns: minmax(0, 1fr); gap: 8px; padding: 14px 10px; }
  .crz__empresa { order: -1; justify-content: flex-start; }
  .crz__seta { display: none; }
  .crz__ambas { position: static; transform: none; }
  .crz__rel--compra { align-items: flex-start; text-align: left; }
  .crz__rel--compra .crz__valor { align-self: flex-start; }
  .crz__rel::before { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
  .crz__rel--compra:has(.crz__oque)::before { content: 'Compra'; }
  .crz__rel--venda:has(.crz__oque)::before { content: 'Vende'; }
  .crz__rel:not(:has(.crz__oque)) { display: none; }
  .crz__nome { max-width: none; }
}
@media (prefers-reduced-motion: reduce) {
  .crz__linha, .crz__quem, .crz__seta, .crz__valor { transition: none; }
  .crz__quem:hover, .crz__linha--on .crz__seta--entra, .crz__linha--on .crz__seta--sai { transform: none; }
}
</style>
