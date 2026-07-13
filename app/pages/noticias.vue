<script setup lang="ts">
// /noticias — feed editorial com a leitura do Atlas (PR3). Contrato de UX:
// docs/redentia-nu/designs/Redentia Noticias Nu.dc.html. O layout default já
// renderiza NuHeader + NuMarketTicker + NuFooter; aqui vive o miolo:
// hero creme (eyebrow + H1 + tabs de filtro) → feed alternado imagem/texto →
// carregar mais.
//
// SEO: SSR-first (a 1ª leva do feed vem do servidor via useAsyncData — HTML
// indexável com notícia real), canonical /noticias, JSON-LD BreadcrumbList +
// ItemList de NewsArticle. routeRules '/noticias' já cacheia no nuxt.config.
import type { NoticiasTab } from '~/types/noticias'

const { items, filtered, tabs, tab, inCarteira, loadMore, loadingMore, exhausted, isAuthenticated } = await useNoticias()

// Empty-state: "Sua carteira" fica vazio na V1 (o cruzamento com posições é o
// PR8) — anônimo ganha CTA de login; logado, CTA de conexão da carteira.
const emptyCarteira = computed(() => tab.value === 'Sua carteira' && filtered.value.length === 0)
const emptyCat = computed(() => tab.value !== 'Sua carteira' && filtered.value.length === 0)
const showLoadMore = computed(() => !exhausted.value && filtered.value.length > 0)

function setTab(v: string) {
  tab.value = v as NoticiasTab
}

// JSON-LD ItemList com os itens REAIS da leva SSR (seed não entra — sem URL
// nem data, entrar seria poluir o índice).
const ldItems = items.value.filter((n) => n.url && n.publishedAt).slice(0, 8)
const structuredData: Record<string, unknown>[] = []
if (ldItems.length) {
  structuredData.push({
    '@type': 'ItemList',
    itemListElement: ldItems.map((n, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'NewsArticle',
        headline: n.titulo,
        url: n.url,
        datePublished: n.publishedAt,
        ...(n.image ? { image: n.image } : {}),
        publisher: { '@type': 'Organization', name: n.veiculo },
      },
    })),
  })
}

usePageSeo({
  title: 'Notícias do mercado hoje, lidas pela IA',
  description: 'As notícias que mexem com a B3, cada uma com a leitura da IA da Redentia: o que muda de verdade, para quais ativos e a direção do impacto em cada ticker. Ações, FIIs e macro, atualizado ao longo do pregão.',
  path: '/noticias',
  structuredData,
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Notícias', path: '/noticias' },
  ],
})
</script>

<template>
  <div>
    <NuPageHero
      eyebrow="Notícias"
      subtitle="Toda notícia chega com a leitura da nossa IA: o que muda de verdade, para quais ativos e para a sua carteira."
    >
      <template #title>O mercado,<br>lido pela IA.</template>
      <NuFilterPills :items="tabs" :model-value="tab" @update:model-value="setTab" />
    </NuPageHero>

    <section class="nof">
      <div v-if="filtered.length" class="nof__stack">
        <NoticiasFeedRow
          v-for="(n, i) in filtered" :key="n.id"
          :item="n" :reverse="i % 2 === 1" :na-carteira="inCarteira(n)"
        />
      </div>

      <!-- Estado vazio de "Sua carteira" (V1: cruzamento com posições é o PR8) -->
      <div v-else-if="emptyCarteira" class="nof__empty">
        <div class="nof__empty-title">As notícias da sua carteira aparecem aqui.</div>
        <div class="nof__empty-sub">
          {{ isAuthenticated
            ? 'Conecte sua corretora para filtrar o feed pelos seus ativos: só o que afeta o seu dinheiro.'
            : 'Entre na sua conta e conecte a carteira para ver só o que afeta os seus ativos.' }}
        </div>
        <NuxtLink :to="isAuthenticated ? '/' : '/login?redirect=/noticias'" class="nof__empty-cta">
          {{ isAuthenticated ? 'Conectar carteira' : 'Entrar na Redentia' }}
        </NuxtLink>
      </div>
      <div v-else-if="emptyCat" class="nof__empty">
        <div class="nof__empty-title">Nada por aqui agora.</div>
        <div class="nof__empty-sub">Nenhuma notícia nesta categoria na leva atual. Carregue mais ou volte para "Tudo".</div>
      </div>

      <div v-if="showLoadMore" class="nof__more">
        <NuLoadMore label="Carregar mais notícias" :busy="loadingMore" @more="loadMore" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.nof {
  background: var(--nu-white);
  padding: clamp(44px, 5.5vw, 72px) clamp(22px, 5.5vw, 80px) clamp(64px, 8vw, 100px);
  animation: nu-fade .5s ease both;
}
.nof__stack { display: flex; flex-direction: column; gap: clamp(52px, 6.5vw, 92px); }
.nof__more { text-align: center; margin-top: clamp(48px, 6vw, 72px); }

/* empty-state (sem spec no mock — linguagem do design: bloco creme, CTA azul) */
.nof__empty {
  background: var(--nu-cream); border-radius: 28px; text-align: center;
  padding: clamp(48px, 7vw, 88px) clamp(22px, 5vw, 64px);
}
.nof__empty-title {
  color: var(--nu-ink); font-size: clamp(22px, 2.6vw, 32px);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1.14;
}
.nof__empty-sub {
  color: var(--nu-gray); font-size: 15.5px; font-weight: 600; line-height: 1.6;
  margin: 14px auto 0; max-width: 460px;
}
.nof__empty-cta {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 14px 26px; font-size: 15.5px; font-weight: 700;
  margin-top: 26px; transition: background .2s;
}
.nof__empty-cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
</style>
