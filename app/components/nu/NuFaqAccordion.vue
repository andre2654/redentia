<script setup lang="ts">
// Accordion de FAQ single-open (inicia com o 1º aberto; clicar no aberto
// fecha; defaultOpen=-1 = tudo fechado). Ícone '+' rotaciona 45° e a resposta
// entra com nu-fade .3s — comportamento e valores exatos do design. Emite o
// JSON-LD FAQPage (useFaqSchema), pra qualquer tela que use o componente;
// `:schema="false"` desliga, para quem divide um FAQ em vários accordions e
// emite um bloco só, ou para quem não quer um FAQPage a mais (a /assinar).
// variant="compact" (PR4): escala do FAQ do guia (Redentia Guia
// Open Finance.dc.html) — cards 22x24, pergunta 17px, ícone 19, gap 12.
//
// APORTOU (11/11/2026): no site de investidor o FAQ é o do quadro Home: sem
// cartão, perguntas em 600 separadas por fios de 1px (--nu-line), o "+" num
// círculo carvão de 36px que gira 45° ao abrir, e a resposta abre com a altura
// animada (grid-rows 0fr → 1fr) e fade. As respostas continuam TODAS no HTML do
// servidor (a fechada fica com altura 0 e `inert`, não some do DOM).
// ROBUSTEZ (11/11/2026): cada pergunta é um NuAcordeao (a peça da base), com o
// "+" do NuMais; a API, o single-open e o JSON-LD são os de antes.
// `surface="white"` (os cartões brancos de antes) não muda nada no creme da
// Aportou, que não tem cartão; fica a classe para quem já passa a prop. O
// visual antigo das telas de escritório saiu com o B2B (12/11/2026).
import type { NuFaqItem } from '~/types/market'

const props = withDefaults(
  defineProps<{
    items: NuFaqItem[]
    defaultOpen?: number
    variant?: 'compact'
    /** 'white' = cards brancos (banda creme, design das calculadoras) */
    surface?: 'white'
    /** false = não emite o JSON-LD; quem chama emite um só (useFaqSchema) */
    schema?: boolean
  }>(),
  { defaultOpen: 0, variant: undefined, surface: undefined, schema: true },
)

const open = ref(props.defaultOpen)
function toggle(i: number) {
  open.value = open.value === i ? -1 : i
}

if (props.schema) useFaqSchema(props.items)
</script>

<template>
  <div class="nfa" :class="{ 'nfa--compact': variant === 'compact', 'nfa--white': surface === 'white' }">
    <!-- A resposta NUNCA sai do DOM: TODAS precisam existir no HTML SSR
         (paridade SEO com as páginas antigas, que serviam tudo via <details>;
         regra nº1 do PR10). Fechada, fica com altura 0 e inert (NuAcordeao). -->
    <NuAcordeao
      v-for="(f, i) in items" :key="f.q" class="nfa__item" :class="{ 'nfa__item--open': open === i }"
      :aberto="open === i" fio :tamanho-mais="36" @update:aberto="toggle(i)"
    >
      <template #titulo><span class="nfa__q-text">{{ f.q }}</span></template>
      <div class="nfa__a" :class="{ 'nfa__a--open': open === i }">{{ f.a }}</div>
    </NuAcordeao>
  </div>
</template>

<style scoped>
.nfa { display: flex; flex-direction: column; border-top: 1px solid var(--nu-line); }
.nfa__q-text { display: block; font-size: clamp(19px, 1.7vw, 22px); font-weight: var(--nu-w-medio); letter-spacing: -0.01em; line-height: 1.25; }
.nfa__a { padding-right: 52px; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); line-height: 1.6; }

/* variante compact (o FAQ do guia): pergunta um passo menor */
.nfa--compact :deep(.nac__cab) { padding: 16px 0; }
.nfa--compact .nfa__q-text { font-size: var(--nu-fs-lg); }
.nfa--compact :deep(.nac__corpo) { padding-bottom: 20px; }
@media (max-width: 560px) { .nfa__a { padding-right: 0; } }
</style>
