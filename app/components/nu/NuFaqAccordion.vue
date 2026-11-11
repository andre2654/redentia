<script setup lang="ts">
// Accordion de FAQ single-open (inicia com o 1º aberto; clicar no aberto
// fecha; defaultOpen=-1 = tudo fechado). Ícone '+' rotaciona 45° e a resposta
// entra com nu-fade .3s — comportamento e valores exatos do design. Emite o
// JSON-LD FAQPage (useFaqSchema), pra qualquer tela que use o componente;
// `:schema="false"` desliga, para quem divide um FAQ em vários accordions e
// emite um bloco só (o RbFaq, um accordion por aba).
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
// Nas telas de escritório (.marca-redentia) o visual de antes fica igual: os
// cartões creme, o "+" solto e a resposta entrando com nu-fade, sem animar a
// altura (o bloco do fim veste o NuAcordeao por dentro, com :deep).
// `surface="white"` só muda algo lá (no creme da Aportou não há cartão).
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

/* ——— Redentia For Business: o FAQ de antes (cartões creme, "+" solto) ——— */
.marca-redentia .nfa { gap: 14px; border-top: 0; }
.marca-redentia .nfa__item { background: var(--nu-cream); border-radius: 18px; padding: 26px 28px; border-bottom: 0; }
.marca-redentia .nfa__item :deep(.nac__cab) { position: static; align-items: flex-start; gap: 20px; min-height: 0; padding: 0; border-radius: 0; }
/* o foco de antes: o anel global no botão inteiro */
.marca-redentia .nfa__item :deep(.nac__cab:focus-visible) { outline: 3px solid var(--nu-blue); outline-offset: 2px; }
.marca-redentia .nfa__item :deep(.nac__cab:focus-visible::after) { content: none; }
.marca-redentia .nfa__q-text { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-forte); letter-spacing: -.2px; line-height: 1.35; }
.marca-redentia .nfa__item :deep(.nmx) { width: 21px; height: 21px; margin-top: 3px; border-radius: 0; background: transparent; color: var(--nu-ink); }
/* sem o círculo, sem o cobalto do hover e sem afundar: o "+" solto de antes */
.marca-redentia .nfa__item :deep(.nac__cab:hover .nmx), .marca-redentia .nfa__item :deep(.nac__cab:active .nmx) { background: transparent; transform: none; }
.marca-redentia .nfa__item :deep(.nmx__x) { width: 21px; height: 21px; stroke-width: 2.3; transition: transform .25s; }
.marca-redentia .nfa__item :deep(.nac__dobra) { opacity: 1; transition: none; }
.marca-redentia .nfa__item :deep(.nac__corpo) { padding-bottom: 0; }
.marca-redentia .nfa__a { color: var(--nu-ink-75); line-height: 1.7; padding: 16px 0 0; }
.marca-redentia .nfa__a--open { animation: nu-fade .3s ease both; }
.marca-redentia .nfa--white .nfa__item { background: var(--nu-white); }
.marca-redentia .nfa--compact { gap: 12px; }
.marca-redentia .nfa--compact .nfa__item { padding: 22px 24px; }
.marca-redentia .nfa--compact .nfa__item :deep(.nac__cab) { gap: 18px; }
.marca-redentia .nfa--compact .nfa__item :deep(.nmx), .marca-redentia .nfa--compact .nfa__item :deep(.nmx__x) { width: 19px; height: 19px; }
.marca-redentia .nfa--compact .nfa__item :deep(.nmx) { margin-top: 2px; }
.marca-redentia .nfa--compact .nfa__a { padding-top: 14px; }
</style>
