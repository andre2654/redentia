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
      name: 'Tesouro Direto hoje - Redentia',
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Taxas do Tesouro Direto',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
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
        <p class="tsh__toolbar-eyebrow">Lista completa</p>
        <p class="tsh__toolbar-count">{{ count }} {{ count === 1 ? 'título' : 'títulos' }} · ordenados por vencimento</p>
      </header>

      <div v-if="pending" class="tsh__state">Carregando as taxas…</div>
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

    <!-- ============ CTA ============ -->
    <CalcBand tone="white" tight>
      <div class="tsh__cta">
        <h2 class="tsh__cta-title">Acompanhe a renda fixa na sua carteira</h2>
        <p class="tsh__cta-sub">Cadastre-se na Redentia e veja seus títulos, ações e FIIs em um lugar só, com análises automáticas e dados atualizados diariamente.</p>
        <div class="tsh__cta-actions">
          <NuxtLink to="/login" class="tsh__pill tsh__pill--light">Criar conta grátis</NuxtLink>
          <NuxtLink to="/rankings" class="tsh__pill tsh__pill--outline">Ver rankings</NuxtLink>
        </div>
      </div>
    </CalcBand>
  </div>
</template>

<style scoped>
/* ——— corpo (toolbar + tabela) sobre creme, mesma família do /ranking ——— */
.tsh__body {
  background: var(--nu-cream);
  padding: 0 clamp(22px, 5.5vw, 80px) clamp(56px, 7vw, 90px);
  display: flex; flex-direction: column; gap: clamp(20px, 2.5vw, 28px);
  animation: nu-fade .5s ease both;
}
.tsh__toolbar { display: flex; flex-direction: column; gap: 3px; }
.tsh__toolbar-eyebrow {
  margin: 0; color: var(--nu-blue); font-size: 12px; font-weight: 800;
  text-transform: uppercase; letter-spacing: .14em;
}
.tsh__toolbar-count {
  margin: 0; color: var(--nu-ink); font-size: 16px; font-weight: 700;
  font-variant-numeric: tabular-nums; letter-spacing: -.1px;
}
.tsh__state {
  background: var(--nu-white); border-radius: var(--nu-r-card-lg);
  padding: clamp(32px, 4vw, 48px); text-align: center;
  color: var(--nu-gray-2); font-size: 15.5px; font-weight: 600;
}
.tsh__answer {
  margin: clamp(8px, 1.5vw, 16px) auto 0; max-width: 68ch; text-align: center;
  color: var(--nu-gray-2); font-size: 15px; font-weight: 500; line-height: 1.7;
}

/* ——— prosa educacional (mesma família das calculadoras/rankings) ——— */
.tsh__prose p {
  margin: 0 0 16px; color: var(--nu-gray-3); font-size: 17px; font-weight: 500; line-height: 1.7;
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
  background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 26px;
  display: flex; flex-direction: column; gap: 6px;
  transition: transform .18s, box-shadow .2s;
}
.tsh__card-link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.tsh__card-link-title { margin: 0; color: var(--nu-ink); font-size: 18px; font-weight: 800; letter-spacing: -.2px; }
.tsh__card-link-desc { margin: 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }

/* ——— pills / CTA (mesma família dos rankings) ——— */
.tsh__pill {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  transition: background .2s;
}
.tsh__pill:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.tsh__cta {
  background: var(--nu-blue); border-radius: var(--nu-r-card-lg);
  padding: clamp(34px, 5vw, 60px); text-align: center;
  max-width: 1080px; margin: 0 auto;
}
.tsh__cta-title { margin: 0; color: var(--nu-white); font-size: clamp(26px, 3.4vw, 44px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.tsh__cta-sub { margin: 14px auto 0; color: var(--nu-white-75); font-size: 16px; font-weight: 500; line-height: 1.6; max-width: 560px; }
.tsh__cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 26px; }
.tsh__pill--light { background: var(--nu-cream); color: var(--nu-blue); }
.tsh__pill--light:hover { background: var(--nu-white); color: var(--nu-blue-hover); }
.tsh__pill--outline { background: transparent; border: 2px solid var(--nu-white-35); color: var(--nu-white); }
.tsh__pill--outline:hover { background: var(--nu-white-14); color: var(--nu-white); }
</style>
