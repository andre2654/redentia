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
      <NuLinkSeta :to="`/calculadora/preco-teto/${view.ticker}`">Preço teto de {{ view.ticker }}</NuLinkSeta>
      <NuLinkSeta to="/calculadora/preco-teto">Calculadora</NuLinkSeta>
      <NuLinkSeta to="/calculadora/preco-teto/bazin">Bazin</NuLinkSeta>
      <NuLinkSeta to="/calculadora/preco-teto/graham">Graham</NuLinkSeta>
    </p>
  </div>
</template>

<style scoped>
/* Robustez (11/11/2026): os quatro atalhos são o NuLinkSeta (a ação secundária); tudo em token. */
.gpt {
  margin-top: 28px;
  background: var(--nu-band);
  border-radius: var(--nu-r-card);
  box-shadow: var(--nu-shadow-quente);
  padding: clamp(22px, 2.8vw, 32px);
}
.gpt__head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
.gpt__kicker {
  color: var(--nu-ink); font-size: var(--nu-fs-marca); font-weight: var(--nu-w-medio);
  letter-spacing: var(--nu-ls-caixa); text-transform: uppercase;
}
.gpt__asof { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-texto); font-variant-numeric: tabular-nums; }
.gpt__h3 {
  margin: 14px 0 0; color: var(--nu-ink); font-size: clamp(22px, 2.4vw, 28px);
  font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.1;
}
.gpt__lead {
  margin: 12px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md);
  font-weight: var(--nu-w-texto); line-height: 1.6;
}
.gpt__steps { margin: 20px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; }
.gpt__steps li { margin: 0; padding: 16px 0; border-top: 1px solid var(--nu-line); }
.gpt__h4 { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte); }
.gpt__steps p {
  margin: 6px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md);
  font-weight: var(--nu-w-texto); line-height: 1.55; font-variant-numeric: tabular-nums;
}
.gpt__note {
  margin: 16px 0 0; color: var(--nu-gray); font-size: 13.5px;
  font-weight: var(--nu-w-texto); line-height: 1.55;
}
.gpt__links { display: flex; flex-wrap: wrap; gap: 4px 24px; margin: 20px 0 0; font-size: var(--nu-fs-md); }
</style>
