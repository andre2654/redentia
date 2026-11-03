<script setup lang="ts">
// As perguntas frequentes do ativo nas direções do /asset, em <details>: todas
// as respostas estão no HTML do servidor (a regra do NuFaqAccordion: nunca
// v-if). O JSON-LD FAQPage sai IGUAL ao da página de hoje:
//  - com FAQ no editorial, um FAQPage com ela (o que o NuFaqAccordion emitia);
//  - sem, um FAQPage com a do resumo factual (o que o AcaoResumo emitia).
// O FAQ do resumo mantém os títulos de hoje: H2 e um H3 por pergunta.
import type { AcaoEditorialVM } from '~/types/acao'
import type { AcaoResumoVM } from '~/utils/assetResumo'

const props = defineProps<{ ticker: string; editorial: AcaoEditorialVM | null; resumo: AcaoResumoVM | null }>()
const sobre = useSobreDoContexto()
const doEditorial = computed(() => props.editorial?.faq ?? [])
const doResumo = computed(() => props.resumo?.faq ?? [])
if (props.editorial?.faq.length) useFaqSchema(props.editorial.faq)
else if (props.resumo?.faq.length) useFaqSchema(props.resumo.faq)
</script>

<template>
  <div class="apg">
    <div v-if="doEditorial.length" v-contexto-chat="{ id: `faq:${ticker}`, tipo: 'secao', rotulo: `Perguntas sobre ${ticker}` }" class="apg__bloco">
      <h2 class="apg__h2">Perguntas frequentes sobre {{ ticker }}</h2>
      <details v-for="(f, i) in doEditorial" :key="f.q" class="apg__item" :open="i === 0">
        <summary class="apg__q"><span>{{ f.q }}</span><span class="apg__mais" aria-hidden="true" /></summary>
        <p class="apg__a">{{ f.a }}</p>
      </details>
    </div>
    <div v-if="doResumo.length" class="apg__bloco">
      <h2 class="apg__h2">{{ resumo!.faqTitulo }}</h2>
      <details
        v-for="(f, i) in doResumo" :key="f.q"
        v-contexto-chat="{ id: `pergunta:${sobre}:${f.q}`, tipo: 'secao', rotulo: rotuloCurto(f.q), texto: `${f.q}\n${f.a}` }"
        class="apg__item" :open="i === 0"
      >
        <summary class="apg__q"><h3 class="apg__h3">{{ f.q }}</h3><span class="apg__mais" aria-hidden="true" /></summary>
        <p class="apg__a">{{ f.a }}</p>
      </details>
    </div>
  </div>
</template>

<style scoped>
.apg__bloco + .apg__bloco { margin-top: 40px; }
.apg__h2 { margin: 0 0 12px; color: var(--nu-ink); font-size: var(--a-h2, var(--nu-fs-h2-sm)); font-weight: var(--a-h2-peso, 500); letter-spacing: -0.04em; line-height: 1.08; text-wrap: balance; }
.apg__item { position: relative; isolation: isolate; border-top: 1px solid var(--nu-cream-line); }
.apg__item::before { content: ''; position: absolute; inset: 2px -14px; z-index: -1; border-radius: 14px; background: var(--nu-ink-04); opacity: 0; transition: opacity .2s ease; }
.apg__item:hover::before { opacity: 1; }
.apg__item:last-child { border-bottom: 1px solid var(--nu-cream-line); }
.apg__q { display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 56px; padding: 14px 0; cursor: pointer; list-style: none; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 600; line-height: 1.35; }
.apg__q::-webkit-details-marker { display: none; }
.apg__q:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 6px; }
.apg__h3 { margin: 0; font: inherit; color: inherit; }
.apg__mais { position: relative; flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: var(--nu-cream); transition: transform .25s ease, background .2s; }
.apg__mais::before, .apg__mais::after { content: ''; position: absolute; left: 50%; top: 50%; width: 11px; height: 1.8px; border-radius: 1px; background: var(--nu-ink); transform: translate(-50%, -50%); }
.apg__mais::after { transform: translate(-50%, -50%) rotate(90deg); }
.apg__item[open] .apg__mais { transform: rotate(45deg); background: var(--nu-sand-2); }
.apg__q:hover .apg__mais { background: var(--nu-ink); }
.apg__q:hover .apg__mais::before, .apg__q:hover .apg__mais::after { background: var(--nu-white); }
.apg__q { transition: color .2s ease; }
.apg__q:hover { color: var(--nu-blue-text); }
.apg__a { margin: 0; padding: 0 44px 18px 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.65; }
.apg__mais { transition: transform .45s cubic-bezier(.34, 1.56, .64, 1), background .2s ease; }
.apg__mais::before, .apg__mais::after { transition: background .2s ease; }
@media (prefers-reduced-motion: reduce) { .apg__mais, .apg__item::before, .apg__q { transition: none; } }
</style>
