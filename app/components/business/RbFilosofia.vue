<script setup lang="ts">
/**
 * "Como a gente pensa" — a filosofia em uma frase e três camadas.
 *
 * É a seção "We invest in decades, not quarters" da Decade (Protect, Prepare,
 * Prosper), adaptada: a Decade promete o que faz com o dinheiro do cliente; a
 * Redentia não toca no dinheiro de ninguém, então a promessa é sobre o DADO que
 * chega ao assessor. Cada camada é verdade hoje:
 *  ler       toda resposta do MCP leva asOf e source; a notícia leva a data e
 *            a leitura editorial da casa
 *  testar    simulate_scenario: 2.000 caminhos, premissas abertas, resultado em
 *            reais de hoje, disclaimer de que não é previsão
 *  explicar  o `why` por posição no cenário e a leitura da notícia
 * Vocabulário: nunca "previsão" nem "calibrado" para cenário.
 */
const CAMADAS = [
  {
    n: '01',
    t: 'Ler',
    d: 'Notícia, fato relevante e balanço chegam com data, fonte e o que muda para quem tem o ativo. Cada número diz de onde veio.',
  },
  {
    n: '02',
    t: 'Testar',
    d: 'Cenário é faixa, não palpite: 2.000 caminhos com premissas abertas, em reais de hoje. Nada de previsão nem promessa de retorno.',
  },
  {
    n: '03',
    t: 'Explicar',
    d: 'Cada resposta diz por quê, em português de mesa, para o assessor contar ao cliente com as próprias palavras.',
  },
]
</script>

<template>
  <section id="filosofia" class="rbfl">
    <div class="rbfl__head">
      <NuSectionHeading eyebrow="Como a gente pensa">
        Dado com fonte.<br>Cenário com premissa.<br>Decisão sua.
      </NuSectionHeading>
    </div>

    <ol class="rbfl__camadas">
      <li v-for="c in CAMADAS" :key="c.n" class="rbfl__camada">
        <span class="rbfl__n">{{ c.n }}</span>
        <h3 class="rbfl__t">{{ c.t }}</h3>
        <p class="rbfl__d">{{ c.d }}</p>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.rbfl {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 24px);
  background: var(--nu-white);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
}
.rbfl__head { max-width: 1180px; margin-inline: auto; }

.rbfl__camadas {
  margin: clamp(40px, 5vw, 64px) auto 0; padding: 0; list-style: none; max-width: 1180px;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(24px, 3vw, 48px);
}
/* Fio em cima de cada camada, como a régua de documento do resto da página:
   três colunas que leem como três páginas de um mesmo método. */
.rbfl__camada { padding-top: 20px; border-top: 1px solid var(--nu-ink); }
.rbfl__n { color: var(--nu-blue-deep); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.rbfl__t {
  margin: 10px 0 0; color: var(--nu-ink);
  font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1;
}
.rbfl__d { margin: 12px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6; max-width: 36ch; }

@media (max-width: 760px) {
  .rbfl__camadas { grid-template-columns: 1fr; }
}
</style>
