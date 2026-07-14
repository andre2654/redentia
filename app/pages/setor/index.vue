<script setup lang="ts">
// /setor — hub dos setores da B3 (SEO programático). Hero Nu + grid dos 11
// setores (o bucket residual `financial` fica de fora do registry). Cada card:
// nome pt-BR + nº de empresas (GET /sectors, real) + blurb editorial, linkando
// /setor/{ptSlug}. Sem preview de topo (cada preview seria um fetch de 200
// linhas — não é barato; a regra do brief é "preview se barato").
import { SETORES, SETORES_BY_API } from '~/content/setores'

// ————— contagens reais (SSR, degrade honesto) —————
const { data: counts } = await useAsyncData(
  'setor-hub-counts',
  async () => {
    try {
      const index = await fetchSectorsIndex()
      const map: Record<string, number> = {}
      for (const s of index) {
        if (SETORES_BY_API[s.slug]) map[s.slug] = s.count
      }
      return map
    } catch {
      return {} as Record<string, number>
    }
  },
  { default: () => ({}) as Record<string, number> },
)

function countOf(apiSlug: string): number | null {
  const c = counts.value?.[apiSlug]
  return typeof c === 'number' ? c : null
}
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

// cards ordenados por nº de empresas desc quando temos as contagens; senão a
// ordem do registry (já é maior→menor pela contagem conhecida).
const cards = computed(() => {
  const withCount = SETORES.map((s) => ({ ...s, count: countOf(s.apiSlug) }))
  return withCount.sort((a, b) => (b.count ?? -1) - (a.count ?? -1))
})

// ————— SEO —————
usePageSeo({
  title: 'Setores da B3 2026: Ações e Fundos por Setor da Bolsa',
  description:
    'Todos os setores da bolsa brasileira em um lugar: imobiliário, financeiro, consumo, indústria, tecnologia, saúde, energia e mais. Empresas, valor de mercado e variação do dia por setor.',
  path: '/setor',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Setores', path: '/setor' },
  ],
  structuredData: [
    {
      '@type': 'ItemList',
      name: 'Setores da B3 - Redentia',
      numberOfItems: SETORES.length,
      itemListElement: SETORES.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: s.name,
        url: `/setor/${s.ptSlug}`,
      })),
    },
  ],
})
</script>

<template>
  <div>
    <!-- ============ Hero ============ -->
    <NuPageHero
      size="lg" eyebrow="Setores"
      subtitle="A bolsa brasileira organizada por setor: quantas empresas cada um reúne, o valor de mercado somado e como o dia fechou. Atualizado diariamente após o pregão."
    >
      <template #title>Setores da B3.</template>
    </NuPageHero>

    <!-- ============ Grid dos setores ============ -->
    <section class="sth__grid-wrap">
      <div class="sth__grid">
        <NuxtLink
          v-for="s in cards" :key="s.ptSlug" :to="`/setor/${s.ptSlug}`"
          class="sth__card"
        >
          <div class="sth__card-top">
            <h2 class="sth__card-title">{{ s.name }}</h2>
            <span v-if="s.count != null" class="sth__card-count">
              {{ nf0.format(s.count) }} {{ s.count === 1 ? 'empresa' : 'empresas' }}
            </span>
          </div>
          <p class="sth__card-desc">{{ s.blurb }}</p>
          <span class="sth__card-cta">Ver setor</span>
        </NuxtLink>
      </div>
    </section>

    <!-- ============ CTA final full-bleed (padrão NuCtaPhoto) ============ -->
    <NuCtaPhoto
      :primary="{ label: 'Criar conta grátis', to: '/login' }"
      :secondary="{ label: 'Ver os rankings', to: '/rankings' }"
    >
      <template #title>Descubra os melhores<br>ativos de cada setor</template>
      <template #subtitle>Crie sua conta grátis e acompanhe as empresas de cada setor da B3 na sua carteira, com dados atualizados diariamente.</template>
    </NuCtaPhoto>
  </div>
</template>

<style scoped>
.sth__grid-wrap {
  background: var(--nu-white);
  padding: clamp(40px, 5.5vw, 72px) clamp(22px, 5.5vw, 80px) clamp(64px, 8vw, 104px);
  animation: nu-fade .5s ease both;
}
.sth__grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  gap: 16px;
}
.sth__card {
  display: flex; flex-direction: column; gap: 10px;
  background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 26px;
  transition: transform .18s, box-shadow .2s;
}
.sth__card:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.sth__card-top { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.sth__card-title { margin: 0; color: var(--nu-ink); font-size: 21px; font-weight: 800; letter-spacing: -.3px; }
.sth__card-count {
  color: var(--nu-blue); font-size: 13px; font-weight: 800;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.sth__card-desc {
  margin: 0; color: var(--nu-gray-2); font-size: 14px; font-weight: 500; line-height: 1.6;
}
.sth__card-cta { margin-top: auto; padding-top: 6px; color: var(--nu-blue); font-size: 14px; font-weight: 800; }
</style>
