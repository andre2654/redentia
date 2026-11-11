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
        <NuEyebrow como="p">Perguntas</NuEyebrow>
        <h2 class="apg__h2">Perguntas frequentes sobre {{ ticker }}</h2>
        <p class="apg__frase">Respostas sobre {{ ticker }}, com os números do último pregão.</p>
        <NuBotaoSeta variante="carvao" tamanho="m" class="apg__cta" @click="emit('perguntar')">Perguntar à IA</NuBotaoSeta>
      </div>
      <div class="apg__dir">
        <details v-for="f in doEditorial" :key="f.q" class="apg__item">
          <summary class="apg__q"><span class="apg__q-t">{{ f.q }}</span><span class="apg__mais" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg></span></summary>
          <p class="apg__a">{{ f.a }}</p>
        </details>
      </div>
    </div>
    <div v-if="doResumo.length" class="apg__linha">
      <div class="apg__esq">
        <NuEyebrow v-if="!doEditorial.length" como="p">Perguntas</NuEyebrow>
        <h2 class="apg__h2">{{ resumo!.faqTitulo }}</h2>
        <template v-if="!doEditorial.length">
          <p class="apg__frase">Respostas sobre {{ ticker }}, com os números do último pregão.</p>
          <NuBotaoSeta variante="carvao" tamanho="m" class="apg__cta" @click="emit('perguntar')">Perguntar à IA</NuBotaoSeta>
        </template>
      </div>
      <div class="apg__dir">
        <details
          v-for="f in doResumo" :key="f.q"
          v-contexto-chat="{ id: `pergunta:${sobre}:${f.q}`, tipo: 'secao', rotulo: rotuloCurto(f.q), texto: `${f.q}\n${f.a}` }"
          class="apg__item"
        >
          <summary class="apg__q"><h3 class="apg__h3">{{ f.q }}</h3><span class="apg__mais" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg></span></summary>
          <p class="apg__a">{{ f.a }}</p>
        </details>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* O FAQ no padrão da Aportou (11/11/2026): sem cartões; cada pergunta é um
   <details> entre fios de 1,5px, a pergunta em 700 e o "+" num círculo carvão
   de 36px que gira 45 graus ao abrir. À esquerda, o eyebrow, o H2 em 800 e a
   pílula com a seta. O HTML (H2, H3, <details>, FAQPage) é o de antes. */
.apg__linha { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.apg__linha + .apg__linha { margin-top: clamp(48px, 6vw, 80px); }
.apg__esq { flex: 1 1 300px; min-width: min(280px, 100%); }
.apg__dir { flex: 1.6 1 480px; min-width: min(340px, 100%); border-bottom: 1.5px solid var(--nu-line); }
.apg__h2 { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.03em; line-height: 1.02; text-wrap: balance; }
/* o segundo bloco é a continuação: sem eyebrow, título um degrau menor */
.apg__linha + .apg__linha .apg__h2 { margin-top: 0; font-size: var(--nu-fs-h2-sm); }
.apg__frase { margin: 20px 0 0; max-width: 420px; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500; line-height: 1.45; }
.apg__cta { margin-top: 28px; }

.apg__item { border-top: 1.5px solid var(--nu-line); }
.apg__q {
  display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 76px; padding: 18px 0;
  cursor: pointer; list-style: none; color: var(--nu-ink); font-size: clamp(19px, 1.6vw, 22px); font-weight: 700; letter-spacing: -0.01em; line-height: 1.3;
}
.apg__q::-webkit-details-marker { display: none; }
.apg__q-t, .apg__h3 { margin: 0; font: inherit; color: inherit; transition: color .2s ease; }
.apg__q:hover .apg__q-t, .apg__q:hover .apg__h3 { color: var(--nu-blue-text); }
.apg__mais {
  flex-shrink: 0; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; background: var(--nu-ink);
  transition: transform .3s cubic-bezier(.2, .8, .2, 1), background .2s ease;
}
.apg__mais svg { width: 16px; height: 16px; fill: none; stroke: var(--nu-white); stroke-width: 2.6; stroke-linecap: round; }
.apg__q:hover .apg__mais { background: var(--nu-ink-hover); }
.apg__item[open] .apg__mais { transform: rotate(45deg); }
.apg__a { margin: -4px 0 0; padding: 0 56px 24px 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6; max-width: 68ch; }
.apg__item[open] .apg__a { animation: nu-fade .3s ease both; }
@media (max-width: 640px) {
  .apg__q { min-height: 68px; }
  .apg__a { padding-right: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .apg__mais, .apg__q-t, .apg__h3 { transition: none; }
  .apg__item[open] .apg__a { animation: none; }
}
</style>
