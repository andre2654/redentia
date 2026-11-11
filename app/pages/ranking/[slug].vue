<script setup lang="ts">
// /ranking/[slug] — detalhe dos 22 rankings (PLANO-RANKINGS.md). Slugs
// ANTIGOS preservados verbatim (equity de SEO + conserta os 20 links das
// calculadoras) + tesouro-direto novo.
//
// Ordem EXATA de seções da Redentia antiga (contrato de SEO):
//   topo em duas colunas (h1 + lead + chips | RankLeader, o nº 1, no cartão
//   carvão) → toolbar (contador + tabs)
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

// o sujeito das linhas que vão ao chat ("3º PETR4 · Maiores DY")
proverSobreDoContexto(() => meta?.title)
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
  leader, tesouroLeader, activeType, setType, isTesouro, columns,
} = useRanking(meta)

const isScore = slug === 'redentia-score'
// o cartão do nº 1 senta à direita do topo; sem líder (carregando, fora do ar) o topo é uma coluna só
const temLider = computed(() => (isTesouro ? !!tesouroLeader.value : !!leader.value))
const primaryLabel = computed(() => {
  if (meta.primaryMetric === 'change' && meta.changeLabel) return `Variação ${meta.changeLabel}`
  return RANKING_COLUMNS[meta.primaryMetric].label
})

// ————— SEO —————
// FAQPage JSON-LD é emitido pelo NuFaqAccordion (fonte única — não duplicar).
// ItemList: top 10 → /asset/<t> (só equity; tesouro não tem página de ativo).
// Vive num useHead REATIVO próprio: o usePageSeo serializa structuredData no
// setup, ANTES das rows resolverem — o computed garante o ItemList no SSR.
const rankingOrigin = useSiteOrigin()
const dataDate = computed(() => rankingDataDate(rows.value))
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
      // Sinal de frescor: o pregão do preço mais recente ENTRE AS LINHAS
      // exibidas (price_date da API). Era `new Date()`, que dizia "hoje" até
      // com o preço parado (congelamento de 28/08 a 17/09/2026). Sem data, a
      // propriedade não sai.
      ...(dataDate.value ? { dateModified: dataDate.value } : {}),
      itemListElement: top.map((row, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: `${rankingTicker(row)}${rankingName(row) ? ` - ${rankingName(row)}` : ''}`,
        // URL ABSOLUTA: era relativa ("/asset/PETR4"). schema.org espera URL
        // resolvível, e o Google não garante resolução de caminho relativo em
        // JSON-LD — na prática os 10 itens de cada um dos 22 rankings viravam
        // referência morta. Maiúscula porque o canônico do ativo é maiúsculo
        // (asset/[ticker].vue:42 faz 301 de caixa).
        url: `${rankingOrigin}/asset/${rankingTicker(row).toUpperCase()}`,
      })),
    }),
  }]
})
useHead({ script: itemListScript })

usePageSeo({
  title: meta.metaTitle,
  description: meta.metaDescription,
  path: `/ranking/${slug}`,
  dateModified: dataDate,
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Rankings', path: '/rankings' },
    { name: meta.title, path: `/ranking/${slug}` },
  ],
  structuredData: [
    {
      '@type': 'WebApplication',
      name: `${meta.title} - ${MARCA.nome}`,
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Ranking de ativos',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      description: meta.metaDescription,
    },
  ],
})
</script>

<template>
  <div>
    <!-- ============ Topo: o ranking à esquerda, o nº 1 no cartão carvão à direita ============ -->
    <section class="rks__topo" :class="{ 'rks__topo--so': !temLider }">
      <div class="rks__topo-grade">
        <div class="rks__topo-texto">
          <p class="nu-eyebrow rks__eyebrow">
            <MarcaCorte />
            <span><NuxtLink to="/rankings" class="rks__volta">Rankings</NuxtLink><span aria-hidden="true"> · </span>{{ meta.tema }}</span>
          </p>
          <h1 class="rks__h1">{{ meta.h1 }}</h1>
          <p class="rks__lead">{{ meta.lead }}</p>
          <div v-if="meta.chips.length" class="rks__chips">
            <span v-for="c in meta.chips" :key="c" class="rks__chip">{{ c }}</span>
          </div>
        </div>
        <div v-if="temLider" class="rks__topo-palco">
          <RankLeader
            v-if="!isTesouro && leader"
            :row="leader" :primary-metric="meta.primaryMetric" :metric-label="primaryLabel" :podio="rows.slice(1, 3)"
          />
          <!-- líder do tesouro: o título de maior taxa, no mesmo cartão -->
          <NuFaixaMarca v-else-if="isTesouro && tesouroLeader" rotulo="Maior taxa de hoje" como="p" :altura="56" class="rks__tleader">
            <NuxtLink :to="`/tesouro/${tesouroLeader.slug}`" class="rks__tleader-main">
              <span class="rks__tleader-who">
                <span class="rks__tleader-name">{{ tesouroLeader.name }}</span>
                <span class="rks__tleader-sub">{{ tesouroLeader.indexer }}</span>
              </span>
              <span class="rks__tleader-metric">
                <span class="rks__tleader-rate">{{ tesouroLeader.rate }}</span>
                <span class="rks__tleader-label">Taxa de compra</span>
              </span>
            </NuxtLink>
          </NuFaixaMarca>
        </div>
      </div>
    </section>

    <!-- ============ Toolbar + tabela ============ -->
    <section class="rks__body">
      <header class="rks__toolbar">
        <div class="rks__toolbar-meta">
          <NuEyebrow como="p">Lista completa</NuEyebrow>
          <p class="rks__toolbar-count">{{ count }} {{ isTesouro ? 'títulos' : 'ativos' }} no ranking</p>
        </div>
        <!-- 1 tipo declarado = "Todos" e a tab seriam a mesma lista -->
        <RankTypeTabs
          v-if="meta.types.length > 1"
          :types="meta.types" :model-value="activeType"
          @update:model-value="setType"
        />
      </header>

      <!-- loading é sempre esqueleto (contrato da Aportou): a altura das linhas da tabela -->
      <div v-if="pending" class="rks__sk" aria-busy="true" aria-label="Carregando o ranking">
        <NuSkeleton v-for="i in 8" :key="i" variant="line" width="100%" height="44px" radius="chip" />
      </div>
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
        v-else :rows="rows" :columns="columns" :change-label="meta.changeLabel"
        :breakdown="isScore" :primary="meta.primaryMetric"
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
          <span class="rks__card-link-ir">Abrir<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg></span>
        </NuxtLink>
      </div>
    </CalcBand>

    <!-- ============ FAQ (anatomia das calculadoras: split creme + cards brancos + pill IA) ============ -->
    <CalcSplit v-if="copy.faqItems.length" tone="cream" wide>
      <template #title>{{ copy.faqTitle || 'Perguntas Frequentes' }}</template>
      <template #left>
        <NuBotaoSeta to="/busca" variante="azul" tamanho="m" class="rks__pill">Perguntar à IA</NuBotaoSeta>
      </template>
      <NuFaqAccordion :items="copy.faqItems" surface="white" />
    </CalcSplit>

    <!-- ============ Fecho: o painel azul da marca, com o corte de fundo ============ -->
    <!-- o nome próprio (Aportou Score) não vai para a caixa baixa -->
    <MercadoFecho
      eyebrow="Sua carteira"
      :primary="{ label: 'Criar conta grátis', to: '/login' }"
      :secondary="{ label: 'Ver outros rankings', to: '/rankings' }"
    >
      <template #title>Acompanhe {{ isScore ? `o ${meta.title}` : meta.title.toLowerCase() }} na sua carteira</template>
      <template #subtitle>Cadastre-se na Aportou e receba análises automáticas sobre os ativos que você acompanha, com dados atualizados diariamente.</template>
    </MercadoFecho>
  </div>
</template>

<style scoped>
/* Aportou (11/11/2026): o corpo corre sobre o creme da página, a tabela e o
   líder são cartões brancos, os selos têm raio 8 e a chamada final é o painel
   de gradiente cobalto com o corte gigante. O conteúdo é o de antes. */
/* 2ª rodada: o topo em duas colunas (o ranking e o nº 1 no cartão carvão com
   a faixa da marca), como o topo do /asset e da tese. */
.rks__topo {
  background: var(--nu-page); color: var(--nu-ink);
  padding: clamp(36px, 4.6vw, 68px) max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(36px, 4.4vw, 60px);
}
.rks__topo-grade { display: grid; grid-template-columns: minmax(0, 1fr); row-gap: clamp(28px, 3.4vw, 40px); }
.rks__topo-texto { min-width: 0; animation: nu-fade .5s ease both; }
.rks__topo-palco { min-width: 0; animation: nu-fade .5s ease .1s both; }
.rks__eyebrow { margin: 0; }
.rks__volta {
  display: inline-block; padding: 14px 0; margin: -14px 0; color: inherit;
  text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1.5px; text-decoration-color: var(--nu-line);
  transition: text-decoration-color .2s ease, color .2s ease;
}
.rks__volta:hover { color: var(--nu-blue-text); text-decoration-color: currentColor; }
.rks__h1 { margin: 20px 0 0; font-size: clamp(40px, 4.8vw, 68px); font-weight: 800; letter-spacing: -0.035em; line-height: .98; text-wrap: balance; }
.rks__lead { margin: 20px 0 0; max-width: 62ch; color: var(--nu-gray-3); font-size: clamp(17px, 1.4vw, 19px); font-weight: 500; line-height: 1.5; text-wrap: pretty; }
.rks__chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 24px; }
.rks__chip {
  display: inline-flex; align-items: center; min-height: 30px; background: var(--nu-cream-2); color: var(--nu-ink); border-radius: var(--nu-r-tag);
  padding: 0 11px; font-size: 13.5px; font-weight: 700;
}
@media (min-width: 1080px) {
  .rks__topo-grade { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: clamp(36px, 4.4vw, 72px); align-items: center; }
  .rks__topo--so .rks__topo-grade { grid-template-columns: minmax(0, 1fr); }
  .rks__topo--so .rks__h1 { max-width: 18ch; }
}

/* ——— corpo (toolbar + tabela) ——— */
.rks__body {
  background: var(--nu-page);
  padding: 0 max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(64px, 7vw, 100px);
  display: flex; flex-direction: column; gap: clamp(20px, 2.5vw, 28px);
  animation: nu-fade .5s ease .15s both;
}
.rks__toolbar {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 16px; flex-wrap: wrap;
}
.rks__toolbar-meta { display: flex; flex-direction: column; gap: 8px; }
.rks__toolbar-count {
  margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 800;
  font-variant-numeric: tabular-nums; letter-spacing: -0.025em; line-height: 1.1;
}
.rks__sk { display: flex; flex-direction: column; gap: 10px; background: var(--nu-white); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-quente); padding: clamp(18px, 2vw, 28px); }
.rks__state {
  background: var(--nu-card); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-quente);
  padding: clamp(32px, 4vw, 48px); text-align: center;
  color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500;
}
.rks__answer {
  margin: clamp(8px, 1.5vw, 16px) 0 0; max-width: 76ch;
  color: var(--nu-gray-3); font-size: clamp(16px, 1.4vw, 18px); font-weight: 500; line-height: 1.6;
}

/* ——— líder do tesouro: o mesmo cartão carvão ——— */
.rks__tleader { overflow: hidden; }
.rks__tleader-main {
  display: flex; align-items: flex-end; justify-content: space-between; gap: 20px 28px; flex-wrap: wrap;
  padding: clamp(22px, 2.6vw, 32px) clamp(20px, 2.4vw, 32px) clamp(24px, 2.8vw, 34px); color: var(--nu-white);
}
.rks__tleader-who { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.rks__tleader-name { color: var(--nu-white); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.025em; line-height: 1.05; transition: color .2s ease; }
.rks__tleader-main:hover .rks__tleader-name { color: var(--nu-blue-soft); }
.rks__tleader-sub { color: var(--nu-on-dark-2); font-size: 14.5px; font-weight: 600; }
.rks__tleader-metric { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; margin-left: auto; }
.rks__tleader-rate {
  color: var(--nu-white); font-size: clamp(40px, 4.6vw, 60px); font-weight: 800;
  letter-spacing: -.035em; line-height: 1; font-variant-numeric: tabular-nums;
}
.rks__tleader-label { color: var(--nu-on-dark-2); font-size: 14.5px; font-weight: 600; }
@media (max-width: 560px) { .rks__tleader-metric { align-items: flex-start; margin-left: 0; } }

/* ——— prosa educacional (mesma família das calculadoras) ——— */
.rks__prose p {
  margin: 0 0 16px; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6;
}
.rks__prose p:last-child { margin-bottom: 0; }
.rks__h3 {
  margin: 28px 0 12px; color: var(--nu-ink);
  font-size: clamp(20px, 1.8vw, 24px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.15;
}
.rks__prose .rks__h3:first-child { margin-top: 0; }
.rks__ul { margin: 0 0 16px; padding-left: 22px; }
.rks__ul li {
  margin: 0 0 8px; color: var(--nu-gray-3);
  font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6;
}
.rks__ul li::marker { color: var(--nu-blue); }
.rks__prose-link { color: var(--nu-blue-text); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1.5px; }
.rks__prose--band { max-width: 780px; margin: clamp(24px, 3vw, 40px) auto 0; }

/* ——— metodologia (score): os passos numerados da marca ——— */
.rks__steps {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: 16px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 1080px; margin-left: auto; margin-right: auto;
}
.rks__step { background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 24px; box-shadow: var(--nu-shadow-branco); border-top: 3px solid var(--nu-ink); }
.rks__step-title { margin: 0 0 8px; color: var(--nu-ink); font-size: clamp(18px, 1.5vw, 21px); font-weight: 800; letter-spacing: -0.02em; }
.rks__step-body { margin: 0; color: var(--nu-gray-3); font-size: 14.5px; font-weight: 500; line-height: 1.5; }
.rks__formula { margin: 24px auto 0; max-width: 680px; text-align: center; }
.rks__formula code {
  display: inline-block; background: var(--nu-ink); border-radius: var(--nu-r-input);
  padding: 14px 20px; color: var(--nu-white); font-family: inherit; font-size: var(--nu-fs-md); font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* ——— ferramentas relacionadas ——— */
.rks__grid-cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 16px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 980px; margin-left: auto; margin-right: auto;
}
.rks__card-link {
  background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 26px; box-shadow: var(--nu-shadow-branco);
  display: flex; flex-direction: column; gap: 6px;
  transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s cubic-bezier(.2, .8, .2, 1);
}
.rks__card-link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.rks__card-link-title { margin: 0; color: var(--nu-ink); font-size: clamp(18px, 1.5vw, 21px); font-weight: 800; letter-spacing: -0.02em; transition: color .2s ease; }
.rks__card-link:hover .rks__card-link-title { color: var(--nu-blue-text); }
.rks__card-link-desc { margin: 0; color: var(--nu-gray-3); font-size: 14.5px; font-weight: 500; line-height: 1.5; }

.rks__card-link-ir { display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 10px; color: var(--nu-blue-text); font-size: 14.5px; font-weight: 700; }
.rks__card-link-ir svg { transition: transform .2s ease; }
.rks__card-link:hover .rks__card-link-ir svg { transform: translateX(3px); }

/* ——— pílula da IA no FAQ (o fecho é o MercadoFecho) ——— */
.rks__pill { margin-top: 28px; }
@media (prefers-reduced-motion: reduce) { .rks__card-link, .rks__card-link-ir svg { transition: none; } .rks__card-link:hover, .rks__card-link:hover .rks__card-link-ir svg { transform: none; } }
</style>
