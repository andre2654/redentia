<script setup lang="ts">
// Accordion de FAQ single-open (inicia com o 1º aberto; clicar no aberto
// fecha; defaultOpen=-1 = tudo fechado). Ícone '+' rotaciona 45° e a resposta
// entra com nu-fade .3s — comportamento e valores exatos do design. Emite o
// JSON-LD FAQPage via useHead (rich snippet), pra qualquer tela que use o
// componente. variant="compact" (PR4): escala do FAQ do guia (Redentia Guia
// Open Finance.dc.html) — cards 22x24, pergunta 17px, ícone 19, gap 12.
import type { NuFaqItem } from '~/types/market'

const props = withDefaults(
  defineProps<{
    items: NuFaqItem[]
    defaultOpen?: number
    variant?: 'compact'
    /** 'white' = cards brancos (banda creme, design das calculadoras) */
    surface?: 'white'
  }>(),
  { defaultOpen: 0, variant: undefined, surface: undefined },
)

const open = ref(props.defaultOpen)
function toggle(i: number) {
  open.value = open.value === i ? -1 : i
}

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: props.items.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    }),
  }],
})
</script>

<template>
  <div class="nfa" :class="{ 'nfa--compact': variant === 'compact', 'nfa--white': surface === 'white' }">
    <div v-for="(f, i) in items" :key="f.q" class="nfa__item">
      <button type="button" class="nfa__q" :aria-expanded="open === i" @click="toggle(i)">
        <span class="nfa__q-text">{{ f.q }}</span>
        <!-- tamanho via CSS (.nfa__icon), não :width/:height — binding dinâmico
             de width em <svg> vira DOM prop na hidratação e SVGSVGElement.width
             é getter-only (warn em toda página que usa o accordion) -->
        <svg viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" stroke-width="2.3" stroke-linecap="round" class="nfa__icon" :class="{ 'nfa__icon--open': open === i }"><path d="M12 5v14M5 12h14" /></svg>
      </button>
      <!-- v-show, NÃO v-if: TODAS as respostas precisam existir no HTML SSR
           (paridade SEO com as páginas antigas, que serviam tudo via <details>;
           regra nº1 do PR10). A animação vive na classe --open pra replayar
           a cada abertura mesmo com o nó persistente. -->
      <div v-show="open === i" class="nfa__a" :class="{ 'nfa__a--open': open === i }">{{ f.a }}</div>
    </div>
  </div>
</template>

<style scoped>
.nfa { display: flex; flex-direction: column; gap: 14px; }
.nfa__item { background: var(--nu-cream); border-radius: 18px; padding: 26px 28px; }
.nfa__q {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 20px;
  width: 100%; background: transparent; border: none; padding: 0; cursor: pointer; text-align: left;
}
.nfa__q-text { color: var(--nu-ink); font-size: 19px; font-weight: 800; letter-spacing: -.2px; line-height: 1.35; }
.nfa__icon { width: 21px; height: 21px; transform: rotate(0deg); transition: transform .25s; flex-shrink: 0; margin-top: 3px; }
.nfa__icon--open { transform: rotate(45deg); }
.nfa__a {
  color: var(--nu-ink-75); font-size: 15.5px; font-weight: 500; line-height: 1.7;
  margin-top: 16px;
}
.nfa__a--open { animation: nu-fade .3s ease both; }

/* variante white: cards brancos sobre banda creme (design das calculadoras) */
.nfa--white .nfa__item { background: var(--nu-white); }

/* variante compact (valores exatos do FAQ do Guia Open Finance) */
.nfa--compact { gap: 12px; }
.nfa--compact .nfa__item { padding: 22px 24px; }
.nfa--compact .nfa__q { gap: 18px; }
.nfa--compact .nfa__q-text { font-size: 17px; }
.nfa--compact .nfa__icon { width: 19px; height: 19px; margin-top: 2px; }
.nfa--compact .nfa__a { font-size: 15px; margin-top: 14px; }
</style>
