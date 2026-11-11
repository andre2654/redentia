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
// cartão, perguntas em 700 separadas por fios de 1,5px (--nu-line), o "+" num
// círculo carvão de 36px que gira 45° ao abrir, e a resposta abre com a altura
// animada (grid-rows 0fr → 1fr) e fade. As respostas continuam TODAS no HTML do
// servidor (a fechada fica com altura 0 e `inert`, não some do DOM).
// Nas telas de escritório (.marca-redentia) o visual de antes fica igual: os
// cartões creme, o "+" solto e a resposta entrando com nu-fade, sem animar a
// altura. `surface="white"` só muda algo lá (no creme da Aportou não há cartão).
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
    <div v-for="(f, i) in items" :key="f.q" class="nfa__item" :class="{ 'nfa__item--open': open === i }">
      <button type="button" class="nfa__q" :aria-expanded="open === i" @click="toggle(i)">
        <span class="nfa__q-text">{{ f.q }}</span>
        <!-- tamanho via CSS (.nfa__icon), não :width/:height — binding dinâmico
             de width em <svg> vira DOM prop na hidratação e SVGSVGElement.width
             é getter-only (warn em toda página que usa o accordion) -->
        <span class="nfa__mais" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" class="nfa__icon"><path d="M12 5v14M5 12h14" /></svg>
        </span>
      </button>
      <!-- A resposta NUNCA sai do DOM: TODAS precisam existir no HTML SSR
           (paridade SEO com as páginas antigas, que serviam tudo via <details>;
           regra nº1 do PR10). Fechada, fica com altura 0 e inert. A animação
           vive na classe --open pra replayar a cada abertura. -->
      <div class="nfa__dobra" :inert="open !== i || undefined">
        <div class="nfa__dobra-dentro">
          <div class="nfa__a" :class="{ 'nfa__a--open': open === i }">{{ f.a }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nfa { display: flex; flex-direction: column; border-top: 1px solid var(--nu-line); }
.nfa__item { border-bottom: 1px solid var(--nu-line); }
.nfa__q {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  width: 100%; min-height: 44px; padding: 18px 0; background: transparent; border: none; cursor: pointer; text-align: left;
  font-family: inherit; color: var(--nu-ink);
}
.nfa__q-text { color: var(--nu-ink); font-size: clamp(19px, 1.7vw, 22px); font-weight: var(--nu-w-medio); letter-spacing: -0.01em; line-height: 1.25; transition: color .2s; }
.nfa__q:hover .nfa__q-text { color: var(--nu-blue-text); }
.nfa__mais {
  flex: none; width: 36px; height: 36px; border-radius: 50%; background: var(--nu-ink); color: var(--nu-white);
  display: flex; align-items: center; justify-content: center;
  transition: transform .3s var(--nu-ease-saida), background .2s;
}
.nfa__q:hover .nfa__mais { background: var(--nu-blue); }
.nfa__item--open .nfa__mais { transform: rotate(45deg); }
.nfa__icon { display: block; width: 16px; height: 16px; stroke-width: 2.6; }
/* a altura anima de 0 ao conteúdo (grid 0fr → 1fr) */
.nfa__dobra { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .32s var(--nu-ease-saida); }
.nfa__item--open .nfa__dobra { grid-template-rows: 1fr; }
.nfa__dobra-dentro { min-height: 0; overflow: hidden; }
.nfa__a {
  color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6;
  padding: 0 52px 22px 0; opacity: 0; transition: opacity .2s;
}
.nfa__a--open { opacity: 1; transition: opacity .3s .08s; }

/* variante compact (o FAQ do guia): pergunta um passo menor */
.nfa--compact .nfa__q { padding: 16px 0; }
.nfa--compact .nfa__q-text { font-size: var(--nu-fs-lg); }
.nfa--compact .nfa__a { padding-bottom: 20px; }
@media (max-width: 560px) { .nfa__a { padding-right: 0; } }
@media (prefers-reduced-motion: reduce) { .nfa__dobra, .nfa__mais, .nfa__a { transition: none; } }

/* ——— Redentia For Business: o FAQ de antes (cartões creme, "+" solto) ——— */
.marca-redentia .nfa { gap: 14px; border-top: 0; }
.marca-redentia .nfa__item { background: var(--nu-cream); border-radius: 18px; padding: 26px 28px; border-bottom: 0; }
.marca-redentia .nfa__q { align-items: flex-start; gap: 20px; min-height: 0; padding: 0; }
.marca-redentia .nfa__q-text, .marca-redentia .nfa__q:hover .nfa__q-text { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-forte); letter-spacing: -.2px; line-height: 1.35; }
.marca-redentia .nfa__mais, .marca-redentia .nfa__q:hover .nfa__mais {
  width: 21px; height: 21px; margin-top: 3px; border-radius: 0; background: transparent; color: var(--nu-ink);
  transition: transform .25s;
}
.marca-redentia .nfa__icon { width: 21px; height: 21px; stroke-width: 2.3; }
.marca-redentia .nfa__dobra { transition: none; }
.marca-redentia .nfa__a { color: var(--nu-ink-75); line-height: 1.7; padding: 16px 0 0; opacity: 1; transition: none; }
.marca-redentia .nfa__a--open { animation: nu-fade .3s ease both; }
.marca-redentia .nfa--white .nfa__item { background: var(--nu-white); }
.marca-redentia .nfa--compact { gap: 12px; }
.marca-redentia .nfa--compact .nfa__item { padding: 22px 24px; }
.marca-redentia .nfa--compact .nfa__q { gap: 18px; }
.marca-redentia .nfa--compact .nfa__mais, .marca-redentia .nfa--compact .nfa__icon { width: 19px; height: 19px; }
.marca-redentia .nfa--compact .nfa__mais { margin-top: 2px; }
.marca-redentia .nfa--compact .nfa__a { padding-top: 14px; }
</style>
