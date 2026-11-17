<script setup lang="ts">
/**
 * /ranking/acoes-baratas — hub indexável das listas em que "barata" é a
 * cotação abaixo da fórmula (Graham, Bazin) ou P/VP baixo. A lista compacta
 * reusa useRanking e RankTable. Sem número da API, a lista não aparece.
 */
import { RANKINGS } from '~/content/rankings/registry'
import {
  ACOES_BARATAS_DESCRIPTION,
  ACOES_BARATAS_FAQ,
  ACOES_BARATAS_H1,
  ACOES_BARATAS_INTRO,
  ACOES_BARATAS_LINKS,
  ACOES_BARATAS_NOTA,
  ACOES_BARATAS_PATH,
  ACOES_BARATAS_TITLE,
} from '~/content/seo/acoes-baratas'
import { topoDaLista } from '~/utils/topoDaLista'

const grahamMeta = RANKINGS['mais-baratas-graham']!
const bazinMeta = RANKINGS['mais-baratas-bazin']!
// Bindings de topo: ref dentro de objeto comum não desempacota no template.
const { rows: grahamRows, columns: grahamColumns } = useRanking(grahamMeta)
const { rows: bazinRows, columns: bazinColumns } = useRanking(bazinMeta)
const topoGraham = computed(() => topoDaLista(grahamRows.value, grahamColumns.value))
const topoBazin = computed(() => topoDaLista(bazinRows.value, bazinColumns.value))

usePageSeo({
  title: ACOES_BARATAS_TITLE,
  description: ACOES_BARATAS_DESCRIPTION,
  path: ACOES_BARATAS_PATH,
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Rankings', path: '/rankings' },
    { name: 'Ações baratas', path: ACOES_BARATAS_PATH },
  ],
})
</script>

<template>
  <div>
    <NuPageHero eyebrow="Rankings" :subtitle="ACOES_BARATAS_INTRO">
      <template #title>{{ ACOES_BARATAS_H1 }}</template>
    </NuPageHero>

    <section class="abh">
      <p class="abh__nota" role="note">{{ ACOES_BARATAS_NOTA }}</p>

      <h2 class="abh__h2">As listas</h2>
      <ul class="abh__links">
        <li v-for="link in ACOES_BARATAS_LINKS" :key="link.to">
          <NuxtLink :to="link.to" class="abh__link nu-cartao nu-cartao--vivo">
            <span class="abh__link-title">{{ link.title }}</span>
            <span class="abh__link-sub">{{ link.sub }}</span>
          </NuxtLink>
        </li>
      </ul>

      <div v-if="topoGraham" class="abh__lista">
        <h2 class="abh__h2">Topo da lista de Graham</h2>
        <p class="abh__dek">As cinco primeiras linhas da lista de Graham, com os números que a API já devolve. A lista inteira está na página do ranking.</p>
        <RankTable :rows="topoGraham.rows" :columns="topoGraham.columns" :primary="grahamMeta.primaryMetric" />
        <p class="abh__mais"><NuxtLink to="/ranking/mais-baratas-graham">Ver a lista de Graham</NuxtLink></p>
      </div>

      <div v-if="topoBazin" class="abh__lista">
        <h2 class="abh__h2">Topo da lista de Bazin</h2>
        <p class="abh__dek">As cinco primeiras linhas da lista de Bazin, com os números que a API já devolve. A lista inteira está na página do ranking.</p>
        <RankTable :rows="topoBazin.rows" :columns="topoBazin.columns" :primary="bazinMeta.primaryMetric" />
        <p class="abh__mais"><NuxtLink to="/ranking/mais-baratas-bazin">Ver a lista de Bazin</NuxtLink></p>
      </div>
    </section>

    <section class="abh abh--faq">
      <h2 class="abh__h2">Perguntas frequentes</h2>
      <NuFaqAccordion :items="[...ACOES_BARATAS_FAQ]" />
    </section>
  </div>
</template>

<style scoped>
.abh {
  background: var(--nu-page);
  padding: 0 var(--nu-coluna) clamp(48px, 6vw, 80px);
}
.abh--faq { padding-top: clamp(8px, 2vw, 24px); }
.abh__nota {
  margin: 0 0 28px;
  max-width: 68ch;
  color: var(--nu-ink);
  font-size: var(--nu-fs-md);
  font-weight: var(--nu-w-medio);
  line-height: 1.5;
}
.abh__h2 {
  margin: 0;
  color: var(--nu-ink);
  font-size: var(--nu-fs-h3);
  font-weight: var(--nu-w-display);
  letter-spacing: -0.025em;
  line-height: 1.05;
}
.abh__dek {
  margin: 12px 0 20px;
  max-width: 68ch;
  color: var(--nu-gray);
  font-size: var(--nu-fs-md);
  line-height: 1.5;
}
.abh__links {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: 16px;
  margin: 16px 0 40px;
  padding: 0;
  list-style: none;
}
.abh__link {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px;
  color: inherit;
  text-decoration: none;
}
.abh__link-title {
  color: var(--nu-ink);
  font-size: clamp(18px, 1.5vw, 22px);
  font-weight: var(--nu-w-forte);
  letter-spacing: var(--nu-ls-titulo);
  line-height: 1.2;
}
.abh__link-sub {
  color: var(--nu-gray-3);
  font-size: 14.5px;
  font-weight: var(--nu-w-texto);
  line-height: 1.5;
}
.abh__lista { margin-top: 8px; }
.abh__lista + .abh__lista { margin-top: 40px; }
.abh__mais { margin: 16px 0 0; }
.abh__mais a {
  color: var(--nu-blue-text);
  font-size: var(--nu-fs-md);
  font-weight: var(--nu-w-medio);
}
</style>
