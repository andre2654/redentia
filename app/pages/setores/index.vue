<script setup lang="ts">
// /setores — segmentos do cadastro de ativos com pelo menos cinco empresas.
// A classificação é industry_category (17/11/2026). Sem número solto: a
// contagem do cartão vale com a data dita no texto.
import { SETORES_LISTA, SETORES_LISTA_DATA_PT, TITULO_HUB_SETORES, descricaoHubSetores } from '~/utils/setoresLista'

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const origin = useSiteOrigin()

usePageSeo({
  title: TITULO_HUB_SETORES,
  description: descricaoHubSetores(),
  path: '/setores',
  dateModified: '2026-11-17',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Segmentos', path: '/setores' },
  ],
  structuredData: [
    {
      '@type': 'ItemList',
      name: 'Segmentos da B3 no cadastro de ativos',
      numberOfItems: SETORES_LISTA.length,
      itemListElement: SETORES_LISTA.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: s.nome,
        url: `${origin}/setores/${s.slug}`,
      })),
    },
  ],
})
</script>

<template>
  <div class="szh">
    <NuPageHero
      size="lg"
      eyebrow="Segmentos"
      :subtitle="`Classificação do cadastro de ativos em ${SETORES_LISTA_DATA_PT}. Entra segmento com pelo menos cinco empresas, uma classe por empresa. A lista não é recomendação.`"
    >
      <template #title>Segmentos da B3.</template>
    </NuPageHero>

    <section class="szh__grade-wrap">
      <p class="szh__fonte">
        Contagens do cadastro de {{ SETORES_LISTA_DATA_PT }} (campo industry_category). O setor amplo continua em
        <NuxtLink to="/setor">/setor</NuxtLink>.
      </p>
      <div v-revelar="{ alvo: 'filhos', passo: 60 }" class="szh__grade">
        <NuxtLink v-for="s in SETORES_LISTA" :key="s.slug" :to="`/setores/${s.slug}`" class="szh__card">
          <div class="szh__card-top">
            <h2 class="szh__card-title">{{ s.nome }}</h2>
            <NuSelo tom="carvao">{{ nf0.format(s.empresas.length) }} ativos</NuSelo>
          </div>
          <p v-if="s.setorAmplo" class="szh__card-desc">Dentro de {{ s.setorAmplo.nome.toLowerCase() }}.</p>
          <span class="szh__card-cta"><span class="szh__cta-txt">Ver segmento</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg></span>
        </NuxtLink>
      </div>
    </section>

    <MercadoFecho
      eyebrow="Cadastro"
      :primary="{ label: 'Ver os setores amplos', to: '/setor' }"
      :secondary="{ label: 'Ver os rankings', to: '/rankings' }"
    >
      <template #title>Cada ativo tem a própria página</template>
      <template #subtitle>A cotação, os dividendos e o quanto rende ficam no código. Esta lista só agrupa o cadastro.</template>
    </MercadoFecho>
  </div>
</template>

<style scoped>
.szh__grade-wrap {
  background: var(--nu-page);
  padding: 8px var(--nu-coluna) 16px;
}
.szh__fonte {
  margin: 0 0 16px;
  max-width: 68ch;
  color: var(--nu-gray-3);
  font-size: 15px;
  line-height: 1.5;
}
.szh__fonte a {
  color: var(--nu-blue-text);
  font-weight: var(--nu-w-medio);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.szh__grade {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: 16px;
}
.szh__card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  background: var(--nu-card);
  border-radius: var(--nu-r-panel);
  padding: 24px;
  box-shadow: var(--nu-shadow-quente);
  -webkit-tap-highlight-color: transparent;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
.szh__card:active { transform: scale(.995); transition-duration: var(--nu-dur-rapida); }
.szh__card:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.szh__card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.szh__card-title {
  margin: 0;
  min-width: 0;
  color: var(--nu-ink);
  font-size: clamp(20px, 1.8vw, 24px);
  font-weight: var(--nu-w-forte);
  letter-spacing: -0.025em;
  line-height: 1.15;
  text-wrap: balance;
}
.szh__card-desc { margin: 0; color: var(--nu-gray-3); font-size: 14.5px; line-height: 1.5; }
.szh__card-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  padding-top: 4px;
  color: var(--nu-blue-text);
  font-size: 14.5px;
  font-weight: var(--nu-w-medio);
}
.szh__card-cta svg { width: 16px; height: 16px; flex: none; }
@media (hover: hover) {
  .szh__card:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
  .szh__card:hover .szh__card-title { color: var(--nu-blue-text); }
}
@media (prefers-reduced-motion: reduce) {
  .szh__card:hover, .szh__card:active { transform: none; }
}
</style>
