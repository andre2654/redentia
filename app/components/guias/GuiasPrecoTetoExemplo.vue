<script setup lang="ts">
/**
 * Exemplo vivo de preço teto dentro de um guia.
 *
 * Usa a MESMA carga SSR de /calculadora/preco-teto/{TICKER} (usePrecoTetoTicker
 * opcional). Os passos já vêm escritos por montarPassos, então a conta daqui
 * não tem fórmula própria. Se o dado falhar, o bloco inteiro some: o exemplo
 * ilustrativo do guia continua no HTML.
 */
const props = defineProps<{ ticker: string }>()

const data = await usePrecoTetoTickerOpcional(props.ticker.toUpperCase())
const view = computed(() => data.value)
</script>

<template>
  <div v-if="view" class="gpt">
    <div class="gpt__head">
      <span class="gpt__kicker">Números publicados, não exemplo ilustrativo</span>
      <span v-if="view.dataTexto" class="gpt__asof">Pregão de {{ view.dataTexto }}</span>
    </div>
    <h3 class="gpt__h3">{{ view.ticker }}<template v-if="view.nome">, {{ view.nome }}</template></h3>
    <p class="gpt__lead">{{ view.resposta }}</p>
    <ol class="gpt__steps">
      <li v-for="passo in view.passos" :key="passo.titulo">
        <h4 class="gpt__h4">{{ passo.titulo }}</h4>
        <p v-for="(linha, i) in passo.linhas" :key="i">{{ linha }}</p>
      </li>
    </ol>
    <p v-if="view.bazin > 0" class="gpt__note">
      O projetivo não entra nessa conta. A fórmula é (dividendo × (1 + crescimento)) ÷ 0,06.
      Com o dividendo de {{ view.ticker }} e crescimento zero, o teto é o mesmo do Bazin.
      Qualquer crescimento diferente de zero é premissa de quem calcula, não um dado publicado nesta página.
    </p>
    <p class="gpt__note">
      Não é recomendação de compra ou venda. A conta descreve a régua. Não diz o que fazer com {{ view.ticker }}.
    </p>
    <p class="gpt__links">
      <NuxtLink :to="`/calculadora/preco-teto/${view.ticker}`">Preço teto de {{ view.ticker }}</NuxtLink>
      <NuxtLink to="/calculadora/preco-teto">Calculadora</NuxtLink>
      <NuxtLink to="/calculadora/preco-teto/bazin">Bazin</NuxtLink>
      <NuxtLink to="/calculadora/preco-teto/graham">Graham</NuxtLink>
    </p>
  </div>
</template>

<style scoped>
.gpt {
  margin-top: 28px;
  background: var(--nu-cream);
  border-radius: var(--nu-r-card);
  padding: clamp(20px, 2.6vw, 28px);
}
.gpt__head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
.gpt__kicker {
  color: var(--nu-ink); font-size: var(--nu-fs-dense); font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
}
.gpt__asof { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; }
.gpt__h3 {
  margin: 14px 0 0; color: var(--nu-ink); font-size: clamp(22px, 2.4vw, 28px);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1.15;
}
.gpt__lead {
  margin: 12px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md);
  font-weight: 500; line-height: 1.6;
}
.gpt__steps { margin: 18px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 16px; }
.gpt__steps li { margin: 0; }
.gpt__h4 { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; }
.gpt__steps p {
  margin: 6px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md);
  font-weight: 500; line-height: 1.55;
}
.gpt__note {
  margin: 16px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-dense);
  font-weight: 500; line-height: 1.55;
}
.gpt__links { display: flex; flex-wrap: wrap; gap: 8px 16px; margin: 16px 0 0; }
.gpt__links a { color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; }
</style>
