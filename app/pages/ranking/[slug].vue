<script setup lang="ts">
// /ranking/[slug] — detalhe dos 22 rankings (PLANO-RANKINGS.md). Slugs
// ANTIGOS preservados verbatim (equity de SEO + conserta os 20 links das
// calculadoras) + tesouro-direto novo.
//
// Ordem EXATA de seções da Redentia antiga (contrato de SEO):
//   hero (h1 + lead + chips) → RankLeader (#1) → toolbar (contador + tabs)
//   → RankTable (limit=50, SSR no HTML) → answer-first → seções h2
//   educacionais (anatomias CalcBand/CalcSplit alternando, como as
//   calculadoras) → Ferramentas relacionadas → FAQ (NuFaqAccordion white +
//   pill IA) → CTA.
//
// Copy vazia (stub TODO(port)) → as seções educacionais somem graciosamente;
// a página continua servindo hero + tabela (o degrade é parte do contrato).
// ?type= deep-linkável ("já vir buscado"); backend fora → estado honesto.
import type { RankingCopy, RankingParagraph } from '~/types/rankings'
import { RANKINGS } from '~/content/rankings/registry'

// type guards da união RankingParagraph (string | h3 | ul | link-prefixado)
const isH3 = (p: RankingParagraph): p is { h3: string } => typeof p === 'object' && 'h3' in p
const isUl = (p: RankingParagraph): p is { ul: string[] } => typeof p === 'object' && 'ul' in p
const isLinked = (p: RankingParagraph): p is { linkText: string; href: string; text: string } =>
  typeof p === 'object' && 'href' in p

const route = useRoute()
const slug = String(route.params.slug ?? '')
const meta = RANKINGS[slug]
if (!meta) {
  throw createError({ statusCode: 404, statusMessage: 'Ranking não encontrado', fatal: true })
}

// ————— copy (lazy-import por slug: 1 chunk por ranking, SSR-safe) —————
const EMPTY_COPY: RankingCopy = { answerFirst: '', educationalSections: [], crossLinks: [], faqItems: [] }
const copyLoaders = import.meta.glob<{ default: RankingCopy }>('../../content/rankings/copy/*.ts')
const loader = copyLoaders[`../../content/rankings/copy/${slug}.ts`]
const copy: RankingCopy = loader ? (await loader()).default : EMPTY_COPY

// ————— dados (SSR, reativo a ?type=) —————
const {
  rows, tesouroRows, count, pending, unavailable, empty,
  leader, tesouroLeader, activeType, setType, isTesouro,
} = useRanking(meta)

const isScore = slug === 'redentia-score'
const primaryLabel = computed(() => {
  if (meta.primaryMetric === 'change' && meta.changeLabel) return `Variação ${meta.changeLabel}`
  return RANKING_COLUMNS[meta.primaryMetric].label
})

// ————— SEO —————
// FAQPage JSON-LD é emitido pelo NuFaqAccordion (fonte única — não duplicar).
// ItemList: top 10 → /acao/<t> (só equity; tesouro não tem página de ativo).
// Vive num useHead REATIVO próprio: o usePageSeo serializa structuredData no
// setup, ANTES das rows resolverem — o computed garante o ItemList no SSR.
const itemListScript = computed(() => {
  const top = rows.value.slice(0, 10)
  if (!top.length) return []
  return [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${meta.title} - Top 10`,
      // baixas (side=bottom) emitiam Ascending na antiga — paridade JSON-LD.
      itemListOrder: meta.extraParams?.side === 'bottom'
        ? 'https://schema.org/ItemListOrderAscending'
        : 'https://schema.org/ItemListOrderDescending',
      numberOfItems: top.length,
      itemListElement: top.map((row, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: `${rankingTicker(row)}${rankingName(row) ? ` - ${rankingName(row)}` : ''}`,
        url: `/acao/${rankingTicker(row).toLowerCase()}`,
      })),
    }),
  }]
})
useHead({ script: itemListScript })

usePageSeo({
  title: meta.metaTitle,
  description: meta.metaDescription,
  path: `/ranking/${slug}`,
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Rankings', path: '/rankings' },
    { name: meta.title, path: `/ranking/${slug}` },
  ],
  structuredData: [
    {
      '@type': 'WebApplication',
      name: `${meta.title} - Redentia`,
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Ranking de ativos',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      description: meta.metaDescription,
    },
  ],
})
</script>

<template>
  <div>
    <!-- ============ Hero (h1 + lead + chips) ============ -->
    <NuPageHero eyebrow="Ranking" :subtitle="meta.lead">
      <template #title>{{ meta.h1 }}</template>
      <div class="rks__chips">
        <span v-for="c in meta.chips" :key="c" class="rks__chip">{{ c }}</span>
      </div>
    </NuPageHero>

    <!-- ============ Leader + toolbar + tabela ============ -->
    <section class="rks__body">
      <RankLeader
        v-if="!isTesouro && leader"
        :row="leader" :primary-metric="meta.primaryMetric" :metric-label="primaryLabel"
      />
      <!-- líder do tesouro: card simples com o título de maior taxa -->
      <div v-else-if="isTesouro && tesouroLeader" class="rks__tleader">
        <span class="rks__tleader-crown">Maior taxa de hoje</span>
        <div class="rks__tleader-main">
          <div class="rks__tleader-who">
            <span class="rks__tleader-name">{{ tesouroLeader.name }}</span>
            <span class="rks__tleader-sub">{{ tesouroLeader.indexer }}</span>
          </div>
          <div class="rks__tleader-metric">
            <span class="rks__tleader-rate">{{ tesouroLeader.rate }}</span>
            <span class="rks__tleader-label">Taxa de compra</span>
          </div>
        </div>
      </div>

      <header class="rks__toolbar">
        <div class="rks__toolbar-meta">
          <p class="rks__toolbar-eyebrow">Lista completa</p>
          <p class="rks__toolbar-count">{{ count }} {{ isTesouro ? 'títulos' : 'ativos' }} no ranking</p>
        </div>
        <RankTypeTabs
          v-if="meta.types.length"
          :types="meta.types" :model-value="activeType"
          @update:model-value="setType"
        />
      </header>

      <div v-if="pending" class="rks__state">Carregando o ranking…</div>
      <!-- backend fora (ou tesouro sem nenhum indexador vivo — o fetch
           parcial engole erro, então vazio ≈ indisponível lá) -->
      <div v-else-if="unavailable || (isTesouro && empty)" class="rks__state">
        Dados indisponíveis agora. Tente de novo em alguns minutos, o conteúdo abaixo continua valendo.
      </div>
      <!-- vazio legítimo (ex.: filtro ?type= sem dado) — estado que não muda
           sozinho, copy honesta em vez de 'tente de novo' -->
      <div v-else-if="empty" class="rks__state">
        Nenhum ativo com dados pra esse filtro no momento. Veja a lista completa em "Todos".
      </div>
      <RankTesouroTable v-else-if="isTesouro" :rows="tesouroRows" />
      <RankTable
        v-else :rows="rows" :columns="meta.columns" :change-label="meta.changeLabel"
        :breakdown="isScore"
      />

      <!-- ============ Answer-first (abaixo da tabela, centralizado) ============ -->
      <p v-if="copy.answerFirst" class="rks__answer">{{ copy.answerFirst }}</p>
    </section>

    <!-- ============ Metodologia (extra do redentia-score) ============ -->
    <CalcBand
      v-if="isScore && copy.methodologySteps?.length"
      tone="cream" kicker="Transparência total" title="Como o score é calculado"
    >
      <template v-if="copy.methodologyIntro?.length" #dek>
        <p v-for="(p, i) in copy.methodologyIntro" :key="i">{{ p }}</p>
      </template>
      <div class="rks__steps">
        <div v-for="s in copy.methodologySteps" :key="s.title" class="rks__step">
          <h3 class="rks__step-title">{{ s.title }}</h3>
          <p class="rks__step-body">{{ s.body }}</p>
        </div>
      </div>
      <p v-if="copy.methodologyFormula" class="rks__formula">
        <code>{{ copy.methodologyFormula }}</code>
      </p>
    </CalcBand>

    <!-- ============ Seções educacionais (CalcSplit/CalcBand alternando) ============ -->
    <template v-for="(section, idx) in copy.educationalSections" :key="section.h2">
      <CalcSplit v-if="idx % 2 === 0" :tone="idx % 4 === 0 ? 'white' : 'cream'">
        <template #title>{{ section.h2 }}</template>
        <div class="rks__prose">
          <template v-for="(para, pIdx) in section.paragraphs" :key="pIdx">
            <h3 v-if="isH3(para)" class="rks__h3">{{ para.h3 }}</h3>
            <ul v-else-if="isUl(para)" class="rks__ul">
              <li v-for="item in para.ul" :key="item">{{ item }}</li>
            </ul>
            <p v-else-if="isLinked(para)"><NuxtLink :to="para.href" class="rks__prose-link">{{ para.linkText }}</NuxtLink>{{ para.text }}</p>
            <p v-else>{{ para }}</p>
          </template>
        </div>
      </CalcSplit>
      <CalcBand v-else :tone="idx % 4 === 1 ? 'cream' : 'white'" :title="section.h2">
        <div class="rks__prose rks__prose--band">
          <template v-for="(para, pIdx) in section.paragraphs" :key="pIdx">
            <h3 v-if="isH3(para)" class="rks__h3">{{ para.h3 }}</h3>
            <ul v-else-if="isUl(para)" class="rks__ul">
              <li v-for="item in para.ul" :key="item">{{ item }}</li>
            </ul>
            <p v-else-if="isLinked(para)"><NuxtLink :to="para.href" class="rks__prose-link">{{ para.linkText }}</NuxtLink>{{ para.text }}</p>
            <p v-else>{{ para }}</p>
          </template>
        </div>
      </CalcBand>
    </template>

    <!-- ============ Ferramentas relacionadas ============ -->
    <CalcBand v-if="copy.crossLinks.length" tone="cream" title="Ferramentas relacionadas">
      <div class="rks__grid-cards">
        <NuxtLink v-for="link in copy.crossLinks" :key="link.href" :to="link.href" class="rks__card-link">
          <h3 class="rks__card-link-title">{{ link.title }}</h3>
          <p class="rks__card-link-desc">{{ link.desc }}</p>
        </NuxtLink>
      </div>
    </CalcBand>

    <!-- ============ FAQ (anatomia das calculadoras: split creme + cards brancos + pill IA) ============ -->
    <CalcSplit v-if="copy.faqItems.length" tone="cream" wide>
      <template #title>{{ copy.faqTitle || 'Perguntas Frequentes' }}</template>
      <template #left>
        <NuxtLink to="/busca" class="rks__pill">Perguntar à Redentia AI</NuxtLink>
      </template>
      <NuFaqAccordion :items="copy.faqItems" surface="white" />
    </CalcSplit>

    <!-- ============ CTA ============ -->
    <CalcBand tone="white" tight>
      <div class="rks__cta">
        <h2 class="rks__cta-title">Acompanhe {{ meta.title.toLowerCase() }} na sua carteira</h2>
        <p class="rks__cta-sub">Cadastre-se na Redentia e receba análises automáticas sobre os ativos que você acompanha, com dados atualizados diariamente.</p>
        <div class="rks__cta-actions">
          <NuxtLink to="/login" class="rks__pill rks__pill--light">Criar conta grátis</NuxtLink>
          <NuxtLink to="/rankings" class="rks__pill rks__pill--outline">Ver outros rankings</NuxtLink>
        </div>
      </div>
    </CalcBand>
  </div>
</template>

<style scoped>
/* ——— hero chips ——— */
.rks__chips { display: flex; gap: 8px; flex-wrap: wrap; }
.rks__chip {
  background: var(--nu-white); color: var(--nu-gray-2); border-radius: var(--nu-r-pill);
  padding: 8px 16px; font-size: 13.5px; font-weight: 700;
}

/* ——— corpo (leader + toolbar + tabela) sobre creme ——— */
.rks__body {
  background: var(--nu-cream);
  padding: 0 clamp(22px, 5.5vw, 80px) clamp(56px, 7vw, 90px);
  display: flex; flex-direction: column; gap: clamp(20px, 2.5vw, 28px);
  animation: nu-fade .5s ease both;
}
.rks__toolbar {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 16px; flex-wrap: wrap;
}
.rks__toolbar-meta { display: flex; flex-direction: column; gap: 3px; }
.rks__toolbar-eyebrow {
  margin: 0; color: var(--nu-blue); font-size: 12px; font-weight: 800;
  text-transform: uppercase; letter-spacing: .14em;
}
.rks__toolbar-count {
  margin: 0; color: var(--nu-ink); font-size: 16px; font-weight: 700;
  font-variant-numeric: tabular-nums; letter-spacing: -.1px;
}
.rks__state {
  background: var(--nu-white); border-radius: var(--nu-r-card-lg);
  padding: clamp(32px, 4vw, 48px); text-align: center;
  color: var(--nu-gray-2); font-size: 15.5px; font-weight: 600;
}
.rks__answer {
  margin: clamp(8px, 1.5vw, 16px) auto 0; max-width: 68ch; text-align: center;
  color: var(--nu-gray-2); font-size: 15px; font-weight: 500; line-height: 1.7;
}

/* ——— líder do tesouro ——— */
.rks__tleader { background: var(--nu-white); border-radius: var(--nu-r-card-lg); padding: clamp(24px, 3vw, 36px); }
.rks__tleader-crown {
  display: inline-flex; background: var(--nu-blue-tint); color: var(--nu-blue);
  border-radius: var(--nu-r-pill); padding: 6px 14px;
  font-size: 12.5px; font-weight: 800; letter-spacing: .2px; text-transform: uppercase;
}
.rks__tleader-main {
  display: flex; align-items: center; justify-content: space-between;
  gap: 24px; flex-wrap: wrap; margin-top: 20px;
}
.rks__tleader-who { display: flex; flex-direction: column; gap: 2px; }
.rks__tleader-name { color: var(--nu-ink); font-size: clamp(20px, 2.2vw, 26px); font-weight: 800; letter-spacing: -.3px; }
.rks__tleader-sub { color: var(--nu-gray); font-size: 13.5px; font-weight: 700; }
.rks__tleader-metric { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.rks__tleader-rate {
  color: var(--nu-blue); font-size: clamp(32px, 4vw, 48px); font-weight: 800;
  letter-spacing: -.03em; line-height: 1; font-variant-numeric: tabular-nums;
}
.rks__tleader-label { color: var(--nu-gray); font-size: 13.5px; font-weight: 700; }

/* ——— prosa educacional (mesma família das calculadoras) ——— */
.rks__prose p {
  margin: 0 0 16px; color: var(--nu-gray-3); font-size: 17px; font-weight: 500; line-height: 1.7;
}
.rks__prose p:last-child { margin-bottom: 0; }
.rks__h3 {
  margin: 26px 0 12px; color: var(--nu-ink);
  font-size: 20px; font-weight: 800; letter-spacing: -.3px;
}
.rks__prose .rks__h3:first-child { margin-top: 0; }
.rks__ul { margin: 0 0 16px; padding-left: 22px; }
.rks__ul li {
  margin: 0 0 8px; color: var(--nu-gray-3);
  font-size: 17px; font-weight: 500; line-height: 1.7;
}
.rks__prose-link { color: var(--nu-blue); font-weight: 800; }
.rks__prose-link:hover { text-decoration: underline; }
.rks__prose--band { max-width: 780px; margin: clamp(24px, 3vw, 40px) auto 0; }

/* ——— metodologia (score) ——— */
.rks__steps {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: 16px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 1080px; margin-left: auto; margin-right: auto;
}
.rks__step { background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 24px; }
.rks__step-title { margin: 0 0 8px; color: var(--nu-blue); font-size: 16.5px; font-weight: 800; letter-spacing: -.2px; }
.rks__step-body { margin: 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }
.rks__formula { margin: 24px auto 0; max-width: 680px; text-align: center; }
.rks__formula code {
  display: inline-block; background: var(--nu-white); border-radius: var(--nu-r-input);
  padding: 14px 20px; color: var(--nu-ink); font-size: 15px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* ——— ferramentas relacionadas ——— */
.rks__grid-cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 16px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 980px; margin-left: auto; margin-right: auto;
}
.rks__card-link {
  background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 26px;
  display: flex; flex-direction: column; gap: 6px;
  transition: transform .18s, box-shadow .2s;
}
.rks__card-link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.rks__card-link-title { margin: 0; color: var(--nu-ink); font-size: 18px; font-weight: 800; letter-spacing: -.2px; }
.rks__card-link-desc { margin: 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }

/* ——— pills / CTA (mesma família das calculadoras) ——— */
.rks__pill {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.rks__pill:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.rks__cta {
  background: var(--nu-blue); border-radius: var(--nu-r-card-lg);
  padding: clamp(34px, 5vw, 60px); text-align: center;
  max-width: 1080px; margin: 0 auto;
}
.rks__cta-title { margin: 0; color: var(--nu-white); font-size: clamp(26px, 3.4vw, 44px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.rks__cta-sub { margin: 14px auto 0; color: var(--nu-white-75); font-size: 16px; font-weight: 500; line-height: 1.6; max-width: 560px; }
.rks__cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 26px; }
.rks__cta .rks__pill { margin-top: 0; }
.rks__pill--light { background: var(--nu-cream); color: var(--nu-blue); }
.rks__pill--light:hover { background: var(--nu-white); color: var(--nu-blue-hover); }
.rks__pill--outline { background: transparent; border: 2px solid var(--nu-white-35); color: var(--nu-white); }
.rks__pill--outline:hover { background: var(--nu-white-14); color: var(--nu-white); }
</style>
