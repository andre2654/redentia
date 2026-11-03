<script setup lang="ts">
// Cadeia, direção 3: "O que se sabe" (?cadeia=3, 03/11/2026). Começa pela
// honestidade: dois números grandes dizem quanto das vendas e do custo do ano
// as ligações com valor explicam (3,2% e menos de 0,1% na PETR4), cada um com
// uma barra fina e a frase. Depois, as empresas em fichas pequenas, uma por
// empresa, com o papel (fornece · compra · as duas), o que circula, o valor
// quando a fonte deu e a fonte com o ano. Passar o mouse levanta a ficha e
// escreve a relação inteira no pé dela; clicar no valor abre as provas.
import AcaoCadeiaDetalhe from '~/components/acao/AcaoCadeiaDetalhe.vue'
import type { EmpresaDaCadeia } from '~/utils/cadeiaLeitura'

import type { AcaoCadeiaVM } from '~/types/acao'

// os props por extenso: o compilador do Vue não resolve tipo importado sem o TypeScript instalado
const props = defineProps<{ cadeia: AcaoCadeiaVM; nome: string; ticker: string; tom?: 'branco' | 'creme' }>()
const { empresas, cobertura, resto, aberto, ativo, titulo, contexto, fontes } = useCadeiaLeitura(() => props)
const cob = computed(() => props.cadeia.cobertura ?? null)
const papel = (e: EmpresaDaCadeia) => (e.papel === 'ambas' ? 'Fornece e compra' : e.papel === 'fornecedora' ? `Fornece à ${props.nome}` : `Compra da ${props.nome}`)
const relacoes = (e: EmpresaDaCadeia) => [e.compra, e.venda].filter((x): x is NonNullable<typeof x> => !!x)
</script>

<template>
  <section v-contexto-chat="contexto" class="ccs" :class="`ccs--${tom ?? 'creme'}`">
    <header class="ccs__cab">
      <p class="ccs__tipo">Cadeia</p>
      <h2 class="ccs__h2">{{ titulo }}</h2>
      <p class="ccs__dek">O que os documentos dizem sobre as empresas listadas dos dois lados, e quanto disso tem valor.</p>
    </header>

    <div v-if="cob" class="ccs__cob">
      <div v-if="cob.receita" class="ccs__fig">
        <p class="ccs__fig-n">{{ cob.receita.pct }}</p>
        <p class="ccs__fig-r">das vendas de {{ cob.ano }} têm cliente listado com valor</p>
        <span class="ccs__trilho" aria-hidden="true"><span class="ccs__fill" :style="{ width: `${Math.max(0.6, cob.receita.pctN)}%` }" /></span>
        <p class="ccs__fig-f">{{ cobertura[0] }}</p>
        <button v-if="resto.clientes && cob.receita.pctN > 0" type="button" class="ccs__link" @click="aberto = resto.clientes">Ver a conta</button>
      </div>
      <div v-if="cob.custo" class="ccs__fig">
        <p class="ccs__fig-n">{{ cob.custo.pct }}</p>
        <p class="ccs__fig-r">do custo de {{ cob.ano }} tem fornecedor listado com valor</p>
        <span class="ccs__trilho" aria-hidden="true"><span class="ccs__fill" :style="{ width: `${Math.max(0.6, cob.custo.pctN)}%` }" /></span>
        <p class="ccs__fig-f">{{ cobertura[cob.receita ? 1 : 0] }}</p>
        <button v-if="resto.custo && cob.custo.pctN > 0" type="button" class="ccs__link" @click="aberto = resto.custo">Ver a conta</button>
      </div>
    </div>

    <ul class="ccs__fichas" @mouseleave="ativo = null">
      <li
        v-for="e in empresas" :key="e.ticker" class="ccs__ficha"
        :class="[`ccs__ficha--${e.papel}`, { 'ccs__ficha--on': ativo === e.ticker }]"
        @mouseenter="ativo = e.ticker" @focusin="ativo = e.ticker"
      >
        <span class="ccs__papel">{{ papel(e) }}</span>
        <NuxtLink :to="`/asset/${e.ticker}`" class="ccs__quem">
          <NuAssetLogo :ticker="e.ticker" :letter="e.ticker.charAt(0)" tile-bg="var(--nu-tile-blue-bg)" tile-fg="var(--nu-blue-deep)" :size="26" :radius="8" />
          <span class="ccs__ticker">{{ e.ticker }}</span>
          <span class="ccs__nome">{{ e.nome }}</span>
        </NuxtLink>
        <dl class="ccs__rels">
          <div v-for="r in relacoes(e)" :key="r.detalhe.titulo" class="ccs__rel">
            <dt>{{ r === e.compra ? 'Fornece' : 'Compra' }}<template v-if="r.oQue">: {{ r.oQue }}</template></dt>
            <dd>
              <button v-if="valorDaLigacao(r)" type="button" class="ccs__valor" @click="aberto = r.detalhe">{{ valorDaLigacao(r) }}</button>
              <span class="ccs__fonte">{{ fonteDaLigacao(r) }}</span>
            </dd>
          </div>
        </dl>
        <p v-if="ativo === e.ticker" class="ccs__frase" aria-hidden="true">{{ relacoes(e).map(relacaoDaLigacao).join(' · ') }}</p>
      </li>
    </ul>

    <p v-if="fontes" class="ccs__fontes">{{ fontes }}</p>
    <AcaoCadeiaDetalhe :detalhe="aberto" @close="aberto = null" />
  </section>
</template>

<style scoped>
.ccs { --mola: cubic-bezier(.34, 1.56, .64, 1); padding: clamp(56px, 7vw, 96px) clamp(22px, 5.5vw, 80px); }
.ccs--creme { background: var(--nu-cream); --ficha: var(--nu-white); }
.ccs--branco { background: var(--nu-white); --ficha: var(--nu-cream); }
.ccs__cab { display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 720px; margin: 0 auto; }
.ccs__tipo { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; }
.ccs__h2 { margin: 10px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 500; letter-spacing: -0.045em; line-height: 1.05; text-wrap: balance; }
.ccs__dek { margin: 12px 0 0; max-width: 52ch; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; text-wrap: balance; }

.ccs__cob { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 24px 48px; max-width: 1080px; margin: clamp(28px, 3.4vw, 44px) auto 0; }
.ccs__fig { display: flex; flex-direction: column; align-items: flex-start; }
.ccs__fig-n { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 500; letter-spacing: -0.04em; line-height: 1; font-variant-numeric: tabular-nums; }
.ccs__fig-r { margin: 6px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; }
.ccs__trilho { display: block; width: 100%; height: 4px; margin-top: 14px; border-radius: var(--nu-r-pill); background: var(--nu-ink-04); box-shadow: inset 0 0 0 1px var(--nu-cream-line); overflow: hidden; }
.ccs__fill { display: block; height: 100%; border-radius: inherit; background: var(--nu-blue); }
.ccs__fig-f { margin: 12px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; font-variant-numeric: tabular-nums; }
.ccs__link { margin-top: 6px; padding: 0; border: 0; background: none; font: inherit; font-size: var(--nu-fs-sm); color: var(--nu-blue-text); font-weight: 700; cursor: pointer; }
.ccs__link:hover { color: var(--nu-blue-hover); }

.ccs__fichas { list-style: none; max-width: 1080px; margin: 36px auto 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr)); gap: 12px; align-items: start; }
.ccs__ficha {
  position: relative; display: flex; flex-direction: column; gap: 10px; padding: 14px 16px 16px; border-radius: var(--nu-r-tile);
  background: var(--ficha); box-shadow: 0 0 0 1px var(--nu-cream-line);
  transition: transform .45s var(--mola), box-shadow .22s ease;
}
.ccs__ficha--on { transform: translateY(-3px); box-shadow: 0 0 0 1px var(--nu-navy-06), var(--nu-shadow-card); }
.ccs__papel { align-self: flex-start; padding: 3px 9px; border-radius: var(--nu-r-pill); font-size: var(--nu-fs-xs); font-weight: 700; background: var(--nu-sand-2); color: var(--nu-gray-tag); transition: background .2s ease, color .2s ease; }
.ccs__ficha--ambas .ccs__papel { background: var(--nu-blue-tint); color: var(--nu-blue-text); }
.ccs__ficha--on .ccs__papel { background: var(--nu-ink); color: var(--nu-white); }
.ccs__quem { display: flex; align-items: center; gap: 8px; min-width: 0; color: inherit; }
.ccs__ticker { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; transition: color .2s ease; }
.ccs__quem:hover .ccs__ticker { color: var(--nu-blue-text); }
.ccs__nome { min-width: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ccs__rels { margin: 0; display: flex; flex-direction: column; gap: 8px; }
.ccs__rel { padding-top: 8px; border-top: 1px solid var(--nu-cream-line); }
.ccs__rel dt { color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.4; }
.ccs__rel dd { margin: 2px 0 0; display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 8px; }
.ccs__valor {
  padding: 0; border: 0; background: none; font: inherit; cursor: pointer; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums;
  text-decoration: underline; text-decoration-color: var(--nu-ink-14); text-underline-offset: 3px;
}
.ccs__valor:hover { color: var(--nu-blue-text); text-decoration-color: currentColor; }
.ccs__fonte { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
/* a relação inteira aparece por cima do pé da ficha no hover: não muda a altura */
.ccs__frase {
  position: absolute; left: 0; right: 0; top: calc(100% + 6px); z-index: 4; margin: 0; padding: 10px 12px; border-radius: var(--nu-r-chip);
  background: var(--nu-navy); color: var(--nu-cream-text); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.5;
  box-shadow: var(--nu-shadow-float); opacity: 0; pointer-events: none; transform: translateY(-4px); transition: opacity .2s ease, transform .2s ease;
}
.ccs__ficha--on .ccs__frase { opacity: 1; transform: none; animation: ccs-entra .2s ease both; }
@keyframes ccs-entra { from { opacity: 0; transform: translateY(-4px); } }
.ccs__fontes { max-width: 1080px; margin: 24px auto 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
@media (hover: none) { .ccs__frase { display: none; } }
@media (prefers-reduced-motion: reduce) {
  .ccs__ficha, .ccs__papel, .ccs__frase { transition: none; }
  .ccs__ficha--on { transform: none; }
}
</style>
