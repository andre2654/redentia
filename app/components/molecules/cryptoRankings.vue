<!--
  Crypto rankings bloco pro home do Redentia. Copia o visual dos rankings
  de ações (mesmo header terminal + `AtomsTickerListItem` pros rows + mesma
  "VIEW ALL" link), só que em 2 cards estáticos em grid em vez de UCarousel,
  já que temos só 2 dimensões relevantes (Market Cap ↓ e Altas 24h ↓).
-->
<template>
  <section v-if="items.length" class="border-b pb-10 pt-2" :style="{ borderColor: brand.colors.border }">
    <!-- Header terminal-styled — mesmo padrão visual do TesouroSection -->
    <header class="mb-6 flex flex-col gap-1 px-4 md:px-0">
      <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
        [CRYPTO.MERCADO]
      </span>
      <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
        Criptomoedas
      </h2>
      <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
        &gt; TOP MOEDAS POR VALOR DE MERCADO E VARIAÇÃO 24H · COTAÇÕES EM BRL
      </p>
    </header>

    <div class="flex w-full flex-col gap-4 md:flex-row md:gap-0">
    <!-- Top 10 by Market Cap -->
    <div
      class="flex w-full flex-col gap-2 px-2 py-4 md:flex-1"
      :class="rankingCardClass"
      :style="rankingCardStyle(brand.colors.primary)"
    >
      <div class="mb-3 flex items-center justify-between border-b pb-2" :style="{ borderColor: brand.colors.border }">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-coins" class="h-3 w-3" :style="{ color: brand.colors.primary }" />
          <div class="flex flex-col">
            <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
              [CRYPTO.TOP]
            </span>
            <h3 class="font-mono-tab text-[11px] font-semibold uppercase tracking-wider" :style="{ color: brand.colors.text }">
              CRIPTO / MARKET CAP
            </h3>
          </div>
        </div>
        <NuxtLink
          :to="{ path: '/search', query: { crypto: '1', sort: 'MCAP' } }"
          class="flex items-center gap-1 font-mono-tab text-[10px] uppercase tracking-[0.12em] transition-colors hover:opacity-80"
          :style="{ color: brand.colors.textMuted }"
        >
          VIEW ALL
          <UIcon name="i-lucide-arrow-right" class="h-3 w-3" />
        </NuxtLink>
      </div>
      <div class="flex flex-col">
        <AtomsTickerListItem
          v-for="c in byMarketCap"
          :key="'mc-' + c.ticker"
          :stock="c"
          :to="`/crypto/${c._cryptoId}`"
          class="border-b"
          :style="{ borderColor: brand.colors.border }"
        />
      </div>
    </div>

    <!-- Top 10 gainers 24h -->
    <div
      class="flex w-full flex-col gap-2 px-2 py-4 md:flex-1"
      :class="rankingCardClass"
      :style="rankingCardStyle(brand.colors.positive)"
    >
      <div class="mb-3 flex items-center justify-between border-b pb-2" :style="{ borderColor: brand.colors.border }">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-trending-up" class="h-3 w-3" :style="{ color: brand.colors.positive }" />
          <div class="flex flex-col">
            <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.positive }">
              [CRYPTO.GAINERS]
            </span>
            <h3 class="font-mono-tab text-[11px] font-semibold uppercase tracking-wider" :style="{ color: brand.colors.text }">
              CRIPTO / MAIORES ALTAS 24H
            </h3>
          </div>
        </div>
        <NuxtLink
          :to="{ path: '/search', query: { crypto: '1', sort: 'UP' } }"
          class="flex items-center gap-1 font-mono-tab text-[10px] uppercase tracking-[0.12em] transition-colors hover:opacity-80"
          :style="{ color: brand.colors.textMuted }"
        >
          VIEW ALL
          <UIcon name="i-lucide-arrow-right" class="h-3 w-3" />
        </NuxtLink>
      </div>
      <div class="flex flex-col">
        <AtomsTickerListItem
          v-for="c in byGain24h"
          :key="'g-' + c.ticker"
          :stock="c"
          :to="`/crypto/${c._cryptoId}`"
          class="border-b"
          :style="{ borderColor: brand.colors.border }"
        />
      </div>
    </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCryptoService, type CryptoAssetItem } from '~/services/crypto'

const brand = useBrand()
const { listCryptos } = useCryptoService()

const items = ref<CryptoAssetItem[]>([])

onMounted(async () => {
  try {
    items.value = await listCryptos(40)
  } catch {}
})

// Os `AtomsTickerListItem` esperam shape de stock ({ticker, name, market_price,
// change_percent, logo}). Mapeamos cripto → esse formato pra reutilizar o
// componente e manter consistência visual com o ranking de ações.
//
// `ticker` em lowercase pra que o link gerado pelo componente (/asset/<ticker>)
// seja reescrito pro /crypto/<id> via roteamento (o AtomsTickerListItem usa
// /asset/<slug>, mas pra cripto nosso slug PRECISA apontar pra /crypto/<slug>).
// Como o AtomsTickerListItem é duro nessa parte, envolvemos em um NuxtLink
// no template OU… mais simples: sobrescrever o link na linha. Pra simplificar
// agora, adaptamos o ticker pro slug do asset e deixamos o link default funcionar
// através de fallback do asset page (que não vai achar nada).
//
// Melhor plano: exportar um map e usar o ticker como slug pra /crypto/.
// Não quebra nada porque AtomsTickerListItem é só texto; se o link não
// importar (o usuário clica na área do card inteiro idealmente), ajustamos depois.
function mapCryptoToStock(c: CryptoAssetItem) {
  return {
    ticker: c.symbol,
    name: c.name,
    market_price: c.price_brl,
    change_percent: c.change_24h_pct ?? 0,
    logo: c.image,
    _cryptoId: c.id,
  }
}

const byMarketCap = computed(() =>
  [...items.value]
    .filter((c) => c.price_brl != null && c.rank != null)
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
    .slice(0, 8)
    .map(mapCryptoToStock),
)

const byGain24h = computed(() =>
  [...items.value]
    .filter((c) => c.price_brl != null && c.change_24h_pct != null)
    .sort((a, b) => (b.change_24h_pct ?? 0) - (a.change_24h_pct ?? 0))
    .slice(0, 8)
    .map(mapCryptoToStock),
)

// Replica os helpers do index.vue (não tem export compartilhado desses
// tokens, então duplicamos pra o visual casar 100% com stock rankings).
const rankingCardClass = computed(() => {
  const v = brand.homePage.rankingCard.variant
  if (v === 'card') return 'mx-2 brand-card-md border p-4'
  if (v === 'border-left') return 'mx-1 border-l-2 pl-4'
  return ''
})

function rankingCardStyle(accentColor: string) {
  const v = brand.homePage.rankingCard.variant
  if (v === 'card') return { borderColor: brand.colors.border, backgroundColor: brand.colors.surface }
  if (v === 'border-left') return { borderColor: accentColor }
  return {}
}
</script>
