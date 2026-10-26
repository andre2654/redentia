<script setup lang="ts">
/**
 * /calculadora/preco-teto/{slug}
 *
 * Dois tipos de página no mesmo segmento, porque o Nuxt só aceita um
 * parâmetro dinâmico aqui:
 *  - método (bazin, graham, pl-setorial, valor-patrimonial, projetivo)
 *  - ticker de ação ou FII (PETR4, TAEE11, HGLG11)
 *
 * Ticker minúsculo 301 para o canônico maiúsculo, igual a /asset. Símbolo
 * que não é método nem ticker B3 404a antes de qualquer fetch. Ticker sem
 * LPA e sem dividendo 404a no loader, com status HTTP de verdade.
 */
import { PRECO_TETO_METODO_SLUGS } from '~/content/calculadoras/preco-teto-metodos'
import { symbolShape } from '~/utils/tickerClass'

definePageMeta({
  middleware: [
    (to) => {
      const raw = String(to.params.metodo ?? '')
      if (PRECO_TETO_METODO_SLUGS.includes(raw)) return
      const upper = raw.toUpperCase()
      if (symbolShape(upper) !== 'b3') {
        return abortNavigation(createError({ statusCode: 404, statusMessage: 'Página não encontrada' }))
      }
      if (raw !== upper) {
        return navigateTo(
          { path: `/calculadora/preco-teto/${upper}`, query: to.query, hash: to.hash },
          { redirectCode: 301, replace: true },
        )
      }
    },
  ],
})

const route = useRoute()
const raw = computed(() => String(route.params.metodo ?? ''))
const metodoSlug = computed(() => (PRECO_TETO_METODO_SLUGS.includes(raw.value) ? raw.value : null))
</script>

<template>
  <CalcPrecoTetoMetodo v-if="metodoSlug" :key="metodoSlug" :slug="metodoSlug" />
  <CalcPrecoTetoTicker v-else :key="raw" />
</template>
