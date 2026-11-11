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
      name: `Setores da B3 - ${MARCA.nome}`,
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
      <!-- os cartões entram em cascata ao rolar (o que nasce na tela fica parado) -->
      <div v-revelar="{ alvo: 'filhos', passo: 60 }" class="sth__grid">
        <NuxtLink
          v-for="s in cards" :key="s.ptSlug" :to="`/setor/${s.ptSlug}`"
          class="sth__card"
        >
          <div class="sth__card-top">
            <h2 class="sth__card-title">{{ s.name }}</h2>
            <NuSelo v-if="s.count != null" tom="carvao">
              {{ nf0.format(s.count) }} {{ s.count === 1 ? 'empresa' : 'empresas' }}
            </NuSelo>
          </div>
          <p class="sth__card-desc">{{ s.blurb }}</p>
          <span class="sth__card-cta"><span class="sth__cta-txt">Ver setor</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg></span>
        </NuxtLink>
      </div>
    </section>

    <!-- ============ Fecho: o painel azul da marca, com o corte de fundo ============ -->
    <MercadoFecho
      eyebrow="Sua carteira"
      :primary="{ label: 'Criar conta grátis', to: '/login' }"
      :secondary="{ label: 'Ver os rankings', to: '/rankings' }"
    >
      <template #title>Descubra os melhores ativos de cada setor</template>
      <template #subtitle>Crie sua conta grátis e acompanhe as empresas de cada setor da B3 na sua carteira, com dados atualizados diariamente.</template>
    </MercadoFecho>
  </div>
</template>

<style scoped>
/* Aportou: a grade corre sobre o creme da página; cada setor é um cartão creme
   com a sombra quente, que sobe 2px ao passar o ponteiro.
   Robustez (11/11/2026): a contagem no NuSelo carvão, o "Ver setor →" com o
   desenho do NuLinkSeta (o cartão já é o link), a entrada ao rolar
   (v-revelar), o apertar que afunda e o movimento e a cor por token. */
.sth__grid-wrap {
  background: var(--nu-page);
  padding: 16px var(--nu-coluna) 16px;
}
.sth__grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  gap: 16px;
}
.sth__card {
  display: flex; flex-direction: column; gap: 12px;
  background: var(--nu-card); border-radius: var(--nu-r-panel); padding: 24px; box-shadow: var(--nu-shadow-quente);
  -webkit-tap-highlight-color: transparent;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
.sth__card:active { transform: scale(.995); transition-duration: var(--nu-dur-rapida); }
.sth__card:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.sth__card-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.sth__card-title { margin: 0; color: var(--nu-ink); font-size: clamp(20px, 1.8vw, 24px); font-weight: var(--nu-w-forte); letter-spacing: -0.025em; line-height: 1.1; transition: color var(--nu-dur-rapida) var(--nu-ease-cor); }
.sth__card-desc {
  margin: 0; color: var(--nu-gray-3); font-size: 14.5px; font-weight: var(--nu-w-texto); line-height: 1.5;
}
.sth__card-cta {
  display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 4px;
  color: var(--nu-blue-text); font-size: 14.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
}
.sth__cta-txt {
  text-decoration-line: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: transparent;
  transition: text-decoration-color var(--nu-dur-media) var(--nu-ease-cor);
}
.sth__card-cta svg { width: 16px; height: 16px; flex: none; transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
@media (hover: hover) {
  .sth__card:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
  .sth__card:hover .sth__card-title { color: var(--nu-blue-text); }
  .sth__card:hover .sth__cta-txt { text-decoration-color: currentColor; }
  .sth__card:hover .sth__card-cta svg { transform: translateX(3px); }
}
@media (prefers-reduced-motion: reduce) {
  .sth__card:hover, .sth__card:active, .sth__card:hover .sth__card-cta svg { transform: none; }
}
</style>
