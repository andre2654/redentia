<script setup lang="ts">
// /tesouro — hub do Tesouro Direto (70 títulos). Anatomia na linguagem Nu:
// hero (NuPageHero + NuFilterPills por indexador, reativo a ?indexer=) →
// toolbar (contador) → TesouroTable (linha → /tesouro/{slug}) → answer-first
// → split educacional curto → ferramentas relacionadas → CTA.
//
// SEO indexável: SSR-first (a tabela completa sai no HTML da 1ª resposta),
// canonical /tesouro, BreadcrumbList + ItemList (top 10 → /tesouro/{slug}).
// Degrade honesto: backend fora → estado "indisponível agora" e o conteúdo
// educacional continua servido (o SEO não morre com o backend).
// routeRules '/tesouro' já cacheia 600s+swr no nuxt.config.
import type { TesouroIndexerFilter } from '~/types/tesouro'

const { rows, count, pending, unavailable, empty, activeIndexer, setIndexer } = useTesouroHub()
const { isAuthenticated } = useAuthState() // CTA final só pra visitante deslogado

/* pills ↔ ?indexer= (labels humanas, URL na língua da API) */
const FILTERS = Object.entries(TESOURO_FILTER_LABELS) as [TesouroIndexerFilter, string][]
const pillItems = FILTERS.map(([, label]) => label)
const activePill = computed(() => TESOURO_FILTER_LABELS[activeIndexer.value])
function onPill(label: string) {
  const found = FILTERS.find(([, l]) => l === label)
  if (found) setIndexer(found[0])
}

/* ————— SEO ————— */
// ItemList reativo (mesmo padrão do /ranking/[slug]: usePageSeo serializa no
// setup, antes das rows resolverem — o computed garante o ItemList no SSR).
const itemListScript = computed(() => {
  const top = rows.value.slice(0, 10)
  if (!top.length) return []
  return [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Tesouro Direto - títulos disponíveis',
      numberOfItems: top.length,
      itemListElement: top.map((row, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: row.name,
        url: `/tesouro/${row.slug}`,
      })),
    }),
  }]
})
useHead({ script: itemListScript })

usePageSeo({
  title: 'Tesouro Direto hoje: taxas de todos os títulos',
  description:
    'Taxas e preços de todos os títulos do Tesouro Direto hoje: Tesouro IPCA+, Prefixado, Selic e Renda+. Vencimento, preço de compra e histórico de cada título, atualizados diariamente.',
  path: '/tesouro',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Tesouro Direto', path: '/tesouro' },
  ],
  structuredData: [
    {
      '@type': 'WebApplication',
      name: `Tesouro Direto hoje - ${MARCA.nome}`,
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Taxas do Tesouro Direto',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      description: 'Todas as taxas do Tesouro Direto em uma tabela, com filtro por indexador e página de detalhe por título.',
    },
  ],
})
</script>

<template>
  <div>
    <!-- ============ Hero (h1 + lead + filtro por indexador) ============ -->
    <NuPageHero
      eyebrow="Renda fixa"
      subtitle="As taxas e os preços de todos os títulos públicos, atualizados diariamente com os dados do Tesouro Nacional. Clique em um título pra ver o histórico completo."
    >
      <template #title>Tesouro Direto<br>hoje.</template>
      <NuFilterPills :items="pillItems" :model-value="activePill" @update:model-value="onPill" />
    </NuPageHero>

    <!-- ============ Toolbar + tabela ============ -->
    <section class="tsh__body">
      <header class="tsh__toolbar">
        <NuEyebrow como="p">Lista completa</NuEyebrow>
        <p class="tsh__toolbar-count">{{ count }} {{ count === 1 ? 'título' : 'títulos' }} · ordenados por vencimento</p>
      </header>

      <!-- loading é sempre esqueleto (contrato da Aportou) -->
      <div v-if="pending" class="tsh__sk" aria-busy="true" aria-label="Carregando as taxas">
        <NuSkeleton v-for="i in 8" :key="i" variant="line" width="100%" height="44px" radius="chip" />
      </div>
      <div v-else-if="unavailable" class="tsh__state">
        Taxas indisponíveis agora. Tente de novo em alguns minutos, o conteúdo abaixo continua valendo.
      </div>
      <div v-else-if="empty" class="tsh__state">
        Nenhum título nesse filtro no momento. Veja a lista completa em "Todos".
      </div>
      <TesouroTable v-else :rows="rows" />

      <p class="tsh__answer">
        O Tesouro Direto é o programa de venda de títulos públicos pra pessoas físicas. Cada título tem uma taxa
        própria: os indexados ao IPCA pagam a inflação mais um juro real, os prefixados travam uma taxa nominal
        conhecida na compra e os atrelados à Selic acompanham a taxa básica de juros. A tabela acima mostra a taxa,
        o vencimento e o preço de compra de cada título disponível hoje.
      </p>
    </section>

    <!-- ============ Educacional curto ============ -->
    <CalcSplit tone="white">
      <template #title>Como ler as taxas do Tesouro Direto</template>
      <div class="tsh__prose">
        <p>
          <strong>Tesouro IPCA+</strong> rende a inflação oficial mais um juro real fixo (ex.: IPCA + 8,43% ao ano).
          É a taxa que protege o poder de compra: quem leva até o vencimento ganha acima da inflação, aconteça o que
          acontecer com ela.
        </p>
        <p>
          <strong>Tesouro Prefixado</strong> trava uma taxa nominal na compra: você sabe hoje exatamente quanto
          resgata no vencimento. Rende mais que os pós-fixados quando os juros caem, e menos quando sobem.
        </p>
        <p>
          <strong>Tesouro Selic</strong> acompanha a taxa básica de juros dia a dia. É o título que menos oscila
          antes do vencimento, por isso costuma ser usado como reserva de liquidez e de emergência.
        </p>
        <p>
          Antes do vencimento, o preço de qualquer título prefixado ou IPCA+ oscila com a marcação a mercado. A taxa
          da tabela é garantida pra quem carrega o título até a data de vencimento.
        </p>
      </div>
    </CalcSplit>

    <!-- ============ Ferramentas relacionadas ============ -->
    <CalcBand tone="cream" title="Ferramentas relacionadas">
      <div class="tsh__grid-cards">
        <NuxtLink to="/ranking/tesouro-direto" class="tsh__card-link">
          <h3 class="tsh__card-link-title">Ranking do Tesouro Direto</h3>
          <p class="tsh__card-link-desc">Os títulos ordenados pela maior taxa de hoje, em uma lista só.</p>
        </NuxtLink>
        <NuxtLink to="/calculadora/juros-compostos" class="tsh__card-link">
          <h3 class="tsh__card-link-title">Calculadora de juros compostos</h3>
          <p class="tsh__card-link-desc">Simule quanto rende um aporte mensal na taxa do título que você escolher.</p>
        </NuxtLink>
      </div>
    </CalcBand>

    <!-- ============ CTA final full-bleed (só deslogado — mesmo padrão dos
         outros CTAs da Aportou: NuCtaPhoto) ============ -->
    <NuCtaPhoto
      v-if="!isAuthenticated"
      :primary="{ label: 'Criar conta grátis', to: '/login' }"
      :secondary="{ label: 'Ver rankings', to: '/rankings' }"
    >
      <template #title>Acompanhe a renda fixa<br>na sua carteira</template>
      <template #subtitle>Cadastre-se e veja renda fixa, ações e FIIs em uma carteira só, com análises automáticas e dados atualizados diariamente.</template>
    </NuCtaPhoto>
  </div>
</template>

<style scoped>
/* Aportou (11/11/2026): o corpo corre sobre o creme da página, a tabela é um
   cartão branco; mesma família do /ranking. O conteúdo é o de antes. */
.tsh__body {
  background: var(--nu-page);
  padding: 0 clamp(22px, 5.5vw, 80px) clamp(64px, 7vw, 100px);
  display: flex; flex-direction: column; gap: clamp(20px, 2.5vw, 28px);
  animation: nu-fade .5s ease both;
}
.tsh__toolbar { display: flex; flex-direction: column; gap: 8px; }
.tsh__toolbar-count {
  margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 800;
  font-variant-numeric: tabular-nums; letter-spacing: -0.025em; line-height: 1.1;
}
.tsh__sk { display: flex; flex-direction: column; gap: 10px; background: var(--nu-white); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-quente); padding: clamp(18px, 2vw, 28px); }
.tsh__state {
  background: var(--nu-card); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-quente);
  padding: clamp(32px, 4vw, 48px); text-align: center;
  color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500;
}
.tsh__answer {
  margin: clamp(8px, 1.5vw, 16px) 0 0; max-width: 76ch;
  color: var(--nu-gray-3); font-size: clamp(16px, 1.4vw, 18px); font-weight: 500; line-height: 1.6;
}

/* ——— prosa educacional (mesma família das calculadoras/rankings) ——— */
.tsh__prose p {
  margin: 0 0 16px; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6;
}
.tsh__prose p:last-child { margin-bottom: 0; }
.tsh__prose strong { color: var(--nu-ink); font-weight: 800; }

/* ——— ferramentas relacionadas ——— */
.tsh__grid-cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 16px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 980px; margin-left: auto; margin-right: auto;
}
.tsh__card-link {
  background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 26px; box-shadow: var(--nu-shadow-branco);
  display: flex; flex-direction: column; gap: 6px;
  transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s cubic-bezier(.2, .8, .2, 1);
}
.tsh__card-link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.tsh__card-link-title { margin: 0; color: var(--nu-ink); font-size: clamp(18px, 1.5vw, 21px); font-weight: 800; letter-spacing: -0.02em; transition: color .2s ease; }
.tsh__card-link:hover .tsh__card-link-title { color: var(--nu-blue-text); }
.tsh__card-link-desc { margin: 0; color: var(--nu-gray-3); font-size: 14.5px; font-weight: 500; line-height: 1.5; }
@media (prefers-reduced-motion: reduce) { .tsh__card-link { transition: none; } .tsh__card-link:hover { transform: none; } }

/* (CTA final = NuCtaPhoto full-bleed, estilos no componente) */
</style>
