<script setup lang="ts">
// O passo a passo da assinatura (31/10/2026, pedido do dono: "criar um
// onboarding na hora do pagamento"). Três passos, sempre os mesmos, para a
// pessoa saber onde está e o que falta:
//   1. Sua conta: o e-mail e o código;
//   2. 3 dias grátis: o cartão no Checkout da Stripe, nada cobrado agora;
//   3. Seu banco: o Open Finance, e a carteira aparece com os 2.000 cenários.
// Aparece no /assinar e no paywall (passo 1 ou 2, conforme o login), no /login
// que veio do /assinar (passo 1) e na volta do Checkout (passo 3).
// `passo` é o passo de AGORA; os anteriores saem como feitos.
import { DIAS_GRATIS } from '~/utils/assinatura'

const props = withDefaults(defineProps<{
  passo: 1 | 2 | 3
  /** quem já assinou antes não tem o teste: o passo 2 vira "Cartão" */
  primeiraAssinatura?: boolean
  compacto?: boolean
  /** no fundo azul-marinho */
  escuro?: boolean
}>(), { primeiraAssinatura: true, compacto: false, escuro: false })

const passos = computed(() => [
  { n: 1, t: 'Sua conta', d: 'Seu e-mail e um código. Sem senha.' },
  {
    n: 2,
    t: props.primeiraAssinatura ? `${DIAS_GRATIS} dias grátis` : 'Cartão',
    d: props.primeiraAssinatura ? 'O cartão na Stripe. Nada é cobrado agora.' : 'O cartão na Stripe, com a cobrança mensal.',
  },
  { n: 3, t: 'Seu banco', d: 'Pelo Open Finance. A carteira chega com os 2.000 cenários.' },
])
const estado = (n: number) => (n < props.passo ? 'feito' : n === props.passo ? 'agora' : 'depois')
</script>

<template>
  <ol class="ajr" :class="{ 'ajr--compacto': compacto, 'ajr--escuro': escuro }" :aria-label="`Passo ${passo} de 3`">
    <li
      v-for="p in passos" :key="p.n"
      class="ajr__passo" :class="`ajr__passo--${estado(p.n)}`"
      :aria-current="estado(p.n) === 'agora' ? 'step' : undefined"
    >
      <span class="ajr__marca" aria-hidden="true">
        <svg v-if="estado(p.n) === 'feito'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7" /></svg>
        <template v-else>{{ p.n }}</template>
      </span>
      <span class="ajr__texto">
        <span class="ajr__t">{{ p.t }}<span v-if="estado(p.n) === 'feito'" class="ajr__sr"> (feito)</span></span>
        <span v-if="!compacto" class="ajr__d">{{ p.d }}</span>
      </span>
    </li>
  </ol>
</template>

<style scoped>
.ajr { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.ajr__passo {
  display: flex; align-items: flex-start; gap: 12px; min-width: 0;
  padding: 14px 16px; border-radius: var(--nu-r-tile);
  background: var(--nu-white); box-shadow: var(--nu-shadow-quente);
}
.ajr__marca {
  width: 26px; height: 26px; flex-shrink: 0; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: var(--nu-fs-sm); font-weight: 800; font-variant-numeric: tabular-nums;
  background: var(--nu-cream-2); color: var(--nu-gray-3);
}
.ajr__texto { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.ajr__t { color: var(--nu-ink); font-size: 15px; font-weight: 800; }
.ajr__d { color: var(--nu-gray-2); font-size: 13.5px; font-weight: 500; line-height: 1.45; }
.ajr__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* agora: o passo da vez em azul; feito: o check verde; depois: quieto */
.ajr__passo--agora { box-shadow: 0 0 0 2px var(--nu-blue), var(--nu-shadow-quente); }
.ajr__passo--agora .ajr__marca { background: var(--nu-blue); color: var(--nu-white); }
.ajr__passo--feito .ajr__marca { background: var(--nu-green); color: var(--nu-white); }
.ajr__passo--feito .ajr__t { color: var(--nu-gray-2); }
.ajr__passo--depois { background: transparent; box-shadow: inset 0 0 0 1.5px var(--nu-line); }
.ajr__passo--depois .ajr__t { color: var(--nu-gray-2); }

/* compacto (embaixo do botão, no login): só os títulos, cada passo do tamanho
   do nome dele e numa linha só; se não couber, a fila quebra inteira */
.ajr--compacto { display: flex; flex-wrap: wrap; gap: 6px; }
.ajr--compacto .ajr__passo { align-items: center; gap: 8px; padding: 8px 14px 8px 8px; }
.ajr--compacto .ajr__marca { width: 22px; height: 22px; font-size: var(--nu-fs-xs); }
.ajr--compacto .ajr__t { white-space: nowrap; }

/* no azul-marinho: o passo da vez acende, os outros ficam no contorno */
.ajr--escuro .ajr__passo { background: var(--nu-navy-2); box-shadow: none; }
.ajr--escuro .ajr__marca { background: var(--nu-cream-text-12); color: var(--nu-cream-text-70); }
.ajr--escuro .ajr__t { color: var(--nu-cream-text); }
.ajr--escuro .ajr__d { color: var(--nu-cream-text-55); }
.ajr--escuro .ajr__passo--agora { box-shadow: 0 0 0 2px var(--nu-blue-soft); }
.ajr--escuro .ajr__passo--agora .ajr__marca { background: var(--nu-blue); color: var(--nu-white); }
.ajr--escuro .ajr__passo--feito .ajr__marca { background: var(--nu-green); color: var(--nu-white); }
.ajr--escuro .ajr__passo--feito .ajr__t, .ajr--escuro .ajr__passo--depois .ajr__t { color: var(--nu-cream-text-70); }
.ajr--escuro .ajr__passo--depois { background: transparent; box-shadow: inset 0 0 0 1.5px var(--nu-cream-text-12); }

@media (max-width: 760px) {
  .ajr:not(.ajr--compacto) { grid-template-columns: minmax(0, 1fr); gap: 8px; }
}
</style>
