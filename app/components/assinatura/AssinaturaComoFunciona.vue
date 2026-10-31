<script setup lang="ts">
// "Como funciona o teste." (31/10/2026): os três momentos do teste com cartão,
// com a data real da primeira cobrança (hoje + 3 dias, por extenso), e o botão
// de novo no fim — quem leu até aqui não precisa subir.
import { DIAS_GRATIS, PRECO_MENSAL, dataDaPrimeiraCobranca } from '~/utils/assinatura'

const primeira = dataDaPrimeiraCobranca()
const passos = [
  { quando: 'Hoje', t: 'Tudo liberado', d: `Você cadastra o cartão no pagamento seguro da Stripe. Nada é cobrado por ${DIAS_GRATIS} dias.` },
  { quando: primeira.charAt(0).toUpperCase() + primeira.slice(1), t: 'A primeira cobrança', d: `${PRECO_MENSAL}, e depois uma vez por mês, no mesmo dia.` },
  { quando: 'Quando quiser', t: 'Cancele sem falar com ninguém', d: 'Em Configurações, Gerenciar assinatura. Cancelou nos 3 dias, não paga nada.' },
]
</script>

<template>
  <section class="acf" aria-labelledby="acf-titulo">
    <h2 id="acf-titulo" class="acf__titulo">Como funciona <br>o teste.</h2>
    <ol class="acf__passos">
      <li v-for="(p, i) in passos" :key="p.t" class="acf__passo">
        <span class="acf__marca" aria-hidden="true">{{ i + 1 }}</span>
        <span class="acf__quando">{{ p.quando }}</span>
        <span class="acf__t">{{ p.t }}</span>
        <span class="acf__d">{{ p.d }}</span>
      </li>
    </ol>
    <div class="acf__fim">
      <AssinaturaBotao />
      <span class="acf__fim-txt">{{ DIAS_GRATIS }} dias grátis na primeira assinatura, depois {{ PRECO_MENSAL }} por mês.</span>
    </div>
  </section>
</template>

<style scoped>
.acf { background: var(--nu-cream); padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px); }
.acf__titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02; }
.acf__passos {
  list-style: none; margin: clamp(32px, 4vw, 52px) 0 0; padding: 0;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr)); gap: clamp(14px, 1.6vw, 20px);
  counter-reset: passo;
}
.acf__passo {
  position: relative; background: var(--nu-white); border-radius: var(--nu-r-card);
  padding: clamp(22px, 2.6vw, 30px); display: flex; flex-direction: column; gap: 6px;
}
.acf__marca {
  width: 34px; height: 34px; border-radius: 50%; margin-bottom: 12px;
  background: var(--nu-blue); color: var(--nu-white);
  display: inline-flex; align-items: center; justify-content: center; font-size: var(--nu-fs-sm); font-weight: 800;
}
.acf__quando { color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 800; }
.acf__t { color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.015em; }
.acf__d { color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
.acf__fim { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; margin-top: clamp(28px, 4vw, 44px); }
.acf__fim-txt { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }

@media (max-width: 760px) {
  .acf__titulo br { display: none; }
}
</style>
