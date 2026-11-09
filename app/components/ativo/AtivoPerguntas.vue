<script setup lang="ts">
// As perguntas frequentes do ativo no /asset, no idioma do FAQ da /teses
// (03/11/2026, o pedido do dono): à esquerda o título grande, uma frase cinza
// e o botão-pílula que abre o painel do chat com o ativo anexado; à direita a
// pilha de cartões brancos, com o "+" que gira ao abrir. A faixa creme é do
// AtivoNoite (a seção #perguntas fecha a alternância sempre em creme).
// SEO, sem mudança:
//  - em <details>: todas as respostas estão no HTML do servidor (a regra do
//    NuFaqAccordion: nunca v-if);
//  - o título grande da esquerda É o H2 de hoje, com o mesmo texto ("Perguntas
//    frequentes sobre PETR4"); no FAQ do resumo, o H2 `faqTitulo` e um H3 por
//    pergunta, como antes;
//  - o JSON-LD FAQPage sai IGUAL: com FAQ no editorial, um FAQPage com ela (o
//    que o NuFaqAccordion emitia); sem, um FAQPage com a do resumo factual (o
//    que o AcaoResumo emitia).
// Com os dois blocos, cada um é uma linha de duas colunas; a frase e o botão
// ficam só na primeira (a segunda é a continuação).
import type { AcaoEditorialVM } from '~/types/acao'
import type { AcaoResumoVM } from '~/utils/assetResumo'

const props = defineProps<{ ticker: string; editorial: AcaoEditorialVM | null; resumo: AcaoResumoVM | null }>()
const emit = defineEmits<{ perguntar: [] }>()
const sobre = useSobreDoContexto()
const doEditorial = computed(() => props.editorial?.faq ?? [])
const doResumo = computed(() => props.resumo?.faq ?? [])
if (props.editorial?.faq.length) useFaqSchema(props.editorial.faq)
else if (props.resumo?.faq.length) useFaqSchema(props.resumo.faq)
</script>

<template>
  <div class="apg">
    <div v-if="doEditorial.length" v-contexto-chat="{ id: `faq:${ticker}`, tipo: 'secao', rotulo: `Perguntas sobre ${ticker}` }" class="apg__linha">
      <div class="apg__esq">
        <h2 class="apg__h2">Perguntas frequentes sobre {{ ticker }}</h2>
        <p class="apg__frase">Respostas sobre {{ ticker }}, com os números do último pregão.</p>
        <button type="button" class="apg__cta" @click="emit('perguntar')">Perguntar à Redentia AI</button>
      </div>
      <div class="apg__dir">
        <details v-for="f in doEditorial" :key="f.q" class="apg__item">
          <summary class="apg__q"><span class="apg__q-t">{{ f.q }}</span><svg viewBox="0 0 24 24" class="apg__mais" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></summary>
          <p class="apg__a">{{ f.a }}</p>
        </details>
      </div>
    </div>
    <div v-if="doResumo.length" class="apg__linha">
      <div class="apg__esq">
        <h2 class="apg__h2">{{ resumo!.faqTitulo }}</h2>
        <template v-if="!doEditorial.length">
          <p class="apg__frase">Respostas sobre {{ ticker }}, com os números do último pregão.</p>
          <button type="button" class="apg__cta" @click="emit('perguntar')">Perguntar à Redentia AI</button>
        </template>
      </div>
      <div class="apg__dir">
        <details
          v-for="f in doResumo" :key="f.q"
          v-contexto-chat="{ id: `pergunta:${sobre}:${f.q}`, tipo: 'secao', rotulo: rotuloCurto(f.q), texto: `${f.q}\n${f.a}` }"
          class="apg__item"
        >
          <summary class="apg__q"><h3 class="apg__h3">{{ f.q }}</h3><svg viewBox="0 0 24 24" class="apg__mais" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></summary>
          <p class="apg__a">{{ f.a }}</p>
        </details>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* as medidas do FAQ da /teses (.tsf) e dos cartões do NuFaqAccordion branco */
.apg { --mola: cubic-bezier(.34, 1.56, .64, 1); }
.apg__linha { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.apg__linha + .apg__linha { margin-top: clamp(48px, 6vw, 80px); }
.apg__esq { flex: 1 1 300px; min-width: min(280px, 100%); }
.apg__dir { flex: 1.6 1 480px; min-width: min(340px, 100%); display: flex; flex-direction: column; gap: 14px; }
.apg__h2 { margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px); font-weight: 500; letter-spacing: -0.045em; line-height: 1.02; text-wrap: balance; }
.apg__frase { margin: 22px 0 0; max-width: 420px; color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6; }
.apg__cta {
  display: inline-flex; align-items: center; height: 44px; padding: 0 22px; margin-top: 28px; border: 0; cursor: pointer;
  border-radius: var(--nu-r-pill); background: transparent; box-shadow: inset 0 0 0 1px var(--nu-ink-16);
  font: inherit; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700;
  transition: background .2s ease, box-shadow .2s ease, transform .45s var(--mola);
}
.apg__cta:hover { background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-ink-30); transform: translateY(-1px); }
.apg__cta:active { transform: scale(.97); }
.apg__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

/* os cartões: brancos, raio 18, 26×28; hover com elevação leve, anel e sombra navy */
.apg__item {
  border-radius: 18px; background: var(--nu-white);
  transition: transform .45s var(--mola), box-shadow .22s ease;
}
.apg__item:hover { transform: translateY(-2px); box-shadow: 0 0 0 1px var(--nu-navy-06), var(--nu-shadow-card); }
.apg__q {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding: 26px 28px; border-radius: 18px;
  cursor: pointer; list-style: none; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -.2px; line-height: 1.35;
}
.apg__q::-webkit-details-marker { display: none; }
.apg__q:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.apg__q-t, .apg__h3 { margin: 0; font: inherit; color: inherit; transition: color .2s ease; }
.apg__q:hover .apg__q-t, .apg__q:hover .apg__h3 { color: var(--nu-blue-text); }
.apg__mais {
  flex-shrink: 0; width: 21px; height: 21px; margin-top: 3px;
  fill: none; stroke: var(--nu-ink); stroke-width: 2.3; stroke-linecap: round;
  transition: transform .45s var(--mola);
}
.apg__item[open] .apg__mais { transform: rotate(45deg); }
.apg__a { margin: -10px 0 0; padding: 0 28px 26px; color: var(--nu-ink-75); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.7; }
.apg__item[open] .apg__a { animation: nu-fade .3s ease both; }
@media (max-width: 640px) {
  .apg__q { padding: 22px 22px; }
  .apg__a { padding: 0 22px 22px; }
}
@media (prefers-reduced-motion: reduce) {
  .apg__cta, .apg__item, .apg__mais, .apg__q-t, .apg__h3 { transition: none; }
  .apg__cta:hover, .apg__cta:active, .apg__item:hover { transform: none; }
  .apg__item[open] .apg__a { animation: none; }
}
</style>
