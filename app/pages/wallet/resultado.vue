<!--
  /wallet/resultado — pagina de resultado da carteira.

  Dois modos com vocabulario visual distinto, mesmo dataset por baixo:
    - 'carteira' (default) — calmo, editorial, foco em janela mensal/anual
    - 'day-trade' (toggle)  — denso, terminal, foco em janela intraday

  Persistencia do modo: localStorage por user + query param ?mode=.
  Toggle vive no canto superior direito da pagina (header local), nao no
  sidebar. Detalhes em ~/composables/useResultMode.

  Dados: por enquanto vem de useMockTrades (deterministico, ~80 trades
  gerados em memoria). Substituido pelo backend Pluggy + tabela
  portfolio_trades quando a Fase 3 do plano estiver pronta.

  Layout: usa o `default` layout (sidebar + header da plataforma).
  Auth-guarded pelo middleware/auth.global. Paywall pelo
  middleware/requires-subscription.global (cobre /wallet/**).
-->
<template>
  <NuxtLayout title="Resultado">
    <div :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }">
      <!-- Padding 0 sempre no content. Cards e secoes ja tem padding
           proprio; container externo nao deve adicionar margem. -->
      <div class="flex flex-col gap-8">
        <!-- ============ HEADER LOCAL ============
             Toggle de modo a direita; nao duplicamos titulo/eyebrow
             porque os componentes Carteira/DayTrade ja trazem seus
             proprios heros. Esse header carrega APENAS o controle de
             modo + um eyebrow leve indicando que estamos na sub-pagina
             "Resultado" da carteira (link de retorno opcional). -->
        <header class="flex flex-wrap items-center justify-between gap-3">
          <NuxtLink
            to="/wallet"
            class="resultado-back inline-flex items-center gap-2 text-[12.5px]"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
          >
            <UIcon name="i-lucide-arrow-left" class="size-3.5" />
            <span>Voltar para a carteira</span>
          </NuxtLink>

          <MoleculesResultadoModeToggle :mode="mode" @update:mode="setMode" />
        </header>

        <!-- ============ MODO CARTEIRA ============ -->
        <Transition name="resultado-mode" mode="out-in">
          <MoleculesResultadoCarteira
            v-if="mode === 'carteira'"
            key="carteira"
            :trades="trades"
          />

          <!-- ============ MODO DAY TRADE (placeholder Fase 2) ============ -->
          <MoleculesResultadoDayTrade
            v-else
            key="day-trade"
            :trades="trades"
          />
        </Transition>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
// Paywall via middleware/requires-subscription.global.ts (cobre /wallet/**)

usePageSeo({
  title: 'Resultado da carteira',
  description: 'Resultado consolidado: P&L, trades fechados, performance vs benchmarks.',
  path: '/wallet/resultado',
  robots: 'noindex,nofollow',
})

const brand = useBrand()
const { mode, setMode, hydrate } = useResultMode()
const { trades } = useMockTrades()

onMounted(() => {
  hydrate()
})
</script>

<style scoped>
.resultado-back {
  transition: color 160ms ease;
}
.resultado-back:hover {
  color: var(--brand-primary) !important;
}
.resultado-back:hover :deep(.iconify),
.resultado-back:hover svg {
  transform: translateX(-2px);
  transition: transform 160ms ease;
}

/* Transicao sutil entre modos. Fade rapido + slight slide. Respeita
   prefers-reduced-motion via @media abaixo. */
.resultado-mode-enter-active,
.resultado-mode-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}
.resultado-mode-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.resultado-mode-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .resultado-mode-enter-active,
  .resultado-mode-leave-active {
    transition: opacity 120ms;
  }
  .resultado-mode-enter-from,
  .resultado-mode-leave-to {
    transform: none;
  }
}
</style>
