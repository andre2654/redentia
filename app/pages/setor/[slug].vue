<script setup lang="ts">
// /setor/[slug] — detalhe de um setor da B3 (SEO programático). O slug é o
// ptSlug pt-BR (imobiliario, financeiro, …); validado contra o registry
// (404 fora dele). Resolve pro apiSlug inglês na chamada da API.
//
// Anatomia (espelha o /ranking/[slug]): hero → faixa de aggregates reais →
// tabela de ativos (RankTable, colunas honestas) → answer-first → seção
// educacional → ferramentas relacionadas → FAQ → CTA.
//
// Honestidade de dado (verificado ao vivo): o endpoint de setor só preenche
// cotação/variação/valor de mercado — P/L, DY, ROE, score voltam null aqui.
// Por isso a tabela mostra só Cotação/Variação/Valor de mercado e a faixa de
// aggregates omite os campos nulos (DY médio e P/L médio somem).
import { SETORES, SETORES_BY_PT } from '~/content/setores'
import type { NuFaqItem } from '~/types/market'
import type { RankingRowApi } from '~/types/rankings'

const route = useRoute()
const slug = String(route.params.slug ?? '')
const entry = SETORES_BY_PT[slug]
if (!entry) {
  throw createError({ statusCode: 404, statusMessage: 'Setor não encontrado', fatal: true })
}

const { rows, aggregates, sectorName, pending, unavailable, empty } = useSectorDetail(entry)

// ————— formatters da faixa de aggregates —————
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
function fmtChange(n: number): string {
  return `${n > 0 ? '+' : ''}${nf1.format(n)}%`
}

/** cards da faixa, só os que têm dado (regra Nu: campo null some). */
const statCards = computed(() => {
  const a = aggregates.value
  const cards: { label: string; value: string; tone?: 'up' | 'down' }[] = []
  if (a.companies != null) {
    cards.push({ label: 'Empresas no setor', value: nf0.format(a.companies) })
  }
  if (a.totalMarketCap != null) {
    cards.push({ label: 'Valor de mercado somado', value: fmtCompactBrl(a.totalMarketCap) })
  }
  if (a.avgChange != null) {
    cards.push({
      label: 'Variação média hoje',
      value: fmtChange(a.avgChange),
      tone: a.avgChange < 0 ? 'down' : 'up',
    })
  }
  if (a.avgDividendYield != null) {
    cards.push({ label: 'DY médio', value: `${nf1.format(a.avgDividendYield)}%` })
  }
  if (a.avgTrailingPe != null) {
    cards.push({ label: 'P/L médio', value: nf1.format(a.avgTrailingPe) })
  }
  return cards
})

// ————— answer-first (curto, otimizado pra citação) —————
const answerFirst = computed(() => {
  const a = aggregates.value
  const n = a.companies != null ? `${nf0.format(a.companies)} ` : ''
  return `O setor ${entry!.name.toLowerCase()} reúne ${n}empresas e fundos listados na B3. ${entry!.blurb}`
})

// ————— maior empresa do setor (cross-link dinâmico) —————
const topAsset = computed<RankingRowApi | null>(() => rows.value[0] ?? null)

// ————— FAQ (JSON-LD FAQPage emitido pelo NuFaqAccordion) —————
const faqItems = computed<NuFaqItem[]>(() => {
  const a = aggregates.value
  const name = entry!.name.toLowerCase()
  const nStr = a.companies != null ? nf0.format(a.companies) : 'dezenas de'
  const items: NuFaqItem[] = [
    {
      q: `Quantas empresas fazem parte do setor ${name} na B3?`,
      a: `Hoje o setor ${name} reúne ${nStr} papéis listados na B3, entre ações e, quando é o caso, fundos. A Redentia atualiza essa contagem diariamente a partir dos dados do pregão.`,
    },
    {
      q: `Como interpretar o valor de mercado somado de um setor?`,
      a: `É a soma do valor de mercado das empresas do setor que têm esse dado disponível. Serve para dimensionar o peso do setor na bolsa, mas não representa a soma de todos os papéis, já que fundos e algumas empresas não têm valor de mercado divulgado.`,
    },
    {
      q: `Qual a diferença entre setor e ranking na Redentia?`,
      a: `O setor agrupa os ativos pela atividade econômica (o que a empresa faz). O ranking ordena ativos por um critério de qualidade ou preço, como dividend yield, Graham ou o Redentia Score. Você usa o setor para entender o mapa da bolsa e o ranking para comparar empresas dentro dele.`,
    },
    {
      q: `Com que frequência os dados do setor são atualizados?`,
      a: `Cotação e variação refletem o fechamento do pregão e são atualizados diariamente. Valor de mercado e a composição do setor acompanham a mesma rotina de atualização da Redentia.`,
    },
  ]
  return items
})

// ————— cross-links (ferramentas relacionadas) —————
const crossLinks = computed(() => {
  const links: { title: string; desc: string; href: string }[] = [
    { title: 'Redentia Score', desc: 'A nota de 0 a 100 que cruza 15 rankings fundamentalistas de uma vez.', href: '/ranking/redentia-score' },
    { title: 'Todos os rankings da B3', desc: 'Dividend yield, valor de mercado, Graham, Bazin, ROE e crescimento.', href: '/rankings' },
    { title: 'Ver todos os setores', desc: 'A bolsa inteira organizada por atividade econômica.', href: '/setor' },
  ]
  if (topAsset.value) {
    const t = rankingTicker(topAsset.value)
    links.unshift({
      title: `Analisar ${t}`,
      desc: `A maior empresa do setor por valor de mercado. Cotação, fundamentos e análise.`,
      href: `/asset/${t}`,
    })
  }
  return links
})

// ————— SEO —————
// ItemList: top 10 → /asset/<t>. Computed reativo pra sair no SSR (as rows
// resolvem no useAsyncData antes do render).
const itemListScript = computed(() => {
  const top = rows.value.slice(0, 10)
  if (!top.length) return []
  return [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Setor ${entry!.name} na B3 - maiores empresas`,
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: top.length,
      itemListElement: top.map((row, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: `${rankingTicker(row)}${rankingName(row) ? ` - ${rankingName(row)}` : ''}`,
        url: `/asset/${rankingTicker(row)}`,
      })),
    }),
  }]
})
useHead({ script: itemListScript })

usePageSeo({
  title: `Setor ${entry.name} na B3 2026: Empresas, Valor de Mercado e Cotações`,
  description: `${entry.blurb} Veja as empresas do setor ${entry.name.toLowerCase()} da B3 com cotação, variação do dia e valor de mercado, atualizados diariamente.`,
  path: `/setor/${entry.ptSlug}`,
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Setores', path: '/setor' },
    { name: entry.name, path: `/setor/${entry.ptSlug}` },
  ],
  structuredData: [
    {
      '@type': 'Article',
      headline: `Setor ${entry.name} na B3`,
      description: entry.blurb,
      inLanguage: 'pt-BR',
      about: { '@type': 'Thing', name: `Setor ${entry.name} da bolsa brasileira` },
    },
  ],
})
</script>

<template>
  <div>
    <!-- ============ Hero ============ -->
    <NuPageHero eyebrow="Setor" :subtitle="`O setor ${entry.name.toLowerCase()} na B3: as empresas e fundos que compõem o segmento, com dados atualizados diariamente.`">
      <template #title>{{ entry.name }}</template>
    </NuPageHero>

    <!-- ============ Corpo (aggregates + tabela) ============ -->
    <section class="sts__body">
      <!-- faixa de aggregates reais (só os campos com dado) -->
      <div v-if="statCards.length" class="sts__stats">
        <div v-for="c in statCards" :key="c.label" class="sts__stat">
          <span class="sts__stat-label">{{ c.label }}</span>
          <span
            class="sts__stat-value"
            :class="{ 'sts__stat-value--up': c.tone === 'up', 'sts__stat-value--down': c.tone === 'down' }"
          >{{ c.value }}</span>
        </div>
      </div>

      <header class="sts__toolbar">
        <div class="sts__toolbar-meta">
          <p class="sts__toolbar-eyebrow">Ativos do setor</p>
          <p class="sts__toolbar-count">Maiores empresas por valor de mercado</p>
        </div>
      </header>

      <div v-if="pending" class="sts__state">Carregando o setor…</div>
      <div v-else-if="unavailable" class="sts__state">
        Dados indisponíveis agora. Tente de novo em alguns minutos, o conteúdo abaixo continua valendo.
      </div>
      <div v-else-if="empty" class="sts__state">
        Nenhum ativo com dados pra esse setor no momento. Veja os outros setores no <NuxtLink to="/setor" class="sts__inline-link">hub de setores</NuxtLink>.
      </div>
      <RankTable v-else :rows="rows" :columns="['change', 'marketCap']" />

      <!-- answer-first -->
      <p v-if="!pending && rows.length" class="sts__answer">{{ answerFirst }}</p>
    </section>

    <!-- ============ Seção educacional ============ -->
    <CalcSplit tone="white">
      <template #title>Como ler o setor {{ entry.name.toLowerCase() }}</template>
      <div class="sts__prose">
        <p>{{ entry.blurb }}</p>
        <p>
          Ativos do mesmo setor tendem a reagir às mesmas forças: câmbio, juros, preço de commodities,
          consumo das famílias ou regulação. Olhar a bolsa por setor ajuda a entender de onde vem o
          risco e a não concentrar a carteira em empresas que sobem e caem juntas.
        </p>
        <p>
          O valor de mercado somado dá a dimensão do peso do setor na B3, e a variação média do dia
          mostra como o segmento fechou como um todo. Para comparar empresas dentro do setor por
          qualidade ou preço, use os <NuxtLink to="/rankings" class="sts__prose-link">rankings</NuxtLink>
          e o <NuxtLink to="/ranking/redentia-score" class="sts__prose-link">Redentia Score</NuxtLink>.
        </p>
      </div>
    </CalcSplit>

    <!-- ============ Ferramentas relacionadas ============ -->
    <CalcBand tone="cream" title="Continue explorando">
      <div class="sts__grid-cards">
        <NuxtLink v-for="link in crossLinks" :key="link.href" :to="link.href" class="sts__card-link">
          <h3 class="sts__card-link-title">{{ link.title }}</h3>
          <p class="sts__card-link-desc">{{ link.desc }}</p>
        </NuxtLink>
      </div>
    </CalcBand>

    <!-- ============ FAQ ============ -->
    <CalcSplit tone="cream" wide>
      <template #title>Perguntas frequentes sobre o setor {{ entry.name.toLowerCase() }}</template>
      <template #left>
        <NuxtLink to="/busca" class="sts__pill">Perguntar à Redentia AI</NuxtLink>
      </template>
      <NuFaqAccordion :items="faqItems" surface="white" />
    </CalcSplit>

    <!-- ============ CTA ============ -->
    <NuCtaPhoto
      :primary="{ label: 'Criar conta grátis', to: '/login' }"
      :secondary="{ label: 'Ver todos os setores', to: '/setor' }"
    >
      <template #title>Acompanhe o setor<br>{{ entry.name.toLowerCase() }} na sua carteira</template>
      <template #subtitle>Crie sua conta grátis e veja como as empresas deste setor aparecem em cada ranking, com dados atualizados diariamente.</template>
    </NuCtaPhoto>
  </div>
</template>

<style scoped>
/* ——— corpo sobre creme ——— */
.sts__body {
  background: var(--nu-cream);
  padding: 0 clamp(22px, 5.5vw, 80px) clamp(56px, 7vw, 90px);
  display: flex; flex-direction: column; gap: clamp(20px, 2.5vw, 28px);
  animation: nu-fade .5s ease both;
}

/* ——— faixa de aggregates ——— */
.sts__stats {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
  gap: 14px;
}
.sts__stat {
  background: var(--nu-white); border-radius: var(--nu-r-panel);
  padding: clamp(20px, 2.4vw, 28px);
  display: flex; flex-direction: column; gap: 8px;
}
.sts__stat-label {
  color: var(--nu-gray); font-size: 12.5px; font-weight: 800;
  text-transform: uppercase; letter-spacing: .08em;
}
.sts__stat-value {
  color: var(--nu-ink); font-size: clamp(24px, 3vw, 32px); font-weight: 800;
  letter-spacing: -.02em; font-variant-numeric: tabular-nums; line-height: 1;
}
.sts__stat-value--up { color: var(--nu-green); }
.sts__stat-value--down { color: var(--nu-red); }

.sts__toolbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.sts__toolbar-meta { display: flex; flex-direction: column; gap: 3px; }
.sts__toolbar-eyebrow {
  margin: 0; color: var(--nu-blue); font-size: 12px; font-weight: 800;
  text-transform: uppercase; letter-spacing: .14em;
}
.sts__toolbar-count {
  margin: 0; color: var(--nu-ink); font-size: 16px; font-weight: 700;
  font-variant-numeric: tabular-nums; letter-spacing: -.1px;
}
.sts__state {
  background: var(--nu-white); border-radius: var(--nu-r-card-lg);
  padding: clamp(32px, 4vw, 48px); text-align: center;
  color: var(--nu-gray-2); font-size: 15.5px; font-weight: 600;
}
.sts__inline-link { color: var(--nu-blue); font-weight: 800; }
.sts__inline-link:hover { text-decoration: underline; }
.sts__answer {
  margin: clamp(8px, 1.5vw, 16px) auto 0; max-width: 68ch; text-align: center;
  color: var(--nu-gray-2); font-size: 15px; font-weight: 500; line-height: 1.7;
}

/* ——— prosa educacional (família das calculadoras/rankings) ——— */
.sts__prose p {
  margin: 0 0 16px; color: var(--nu-gray-3); font-size: 17px; font-weight: 500; line-height: 1.7;
}
.sts__prose p:last-child { margin-bottom: 0; }
.sts__prose-link { color: var(--nu-blue); font-weight: 800; }
.sts__prose-link:hover { text-decoration: underline; }

/* ——— ferramentas relacionadas ——— */
.sts__grid-cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 16px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 980px; margin-left: auto; margin-right: auto;
}
.sts__card-link {
  background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 26px;
  display: flex; flex-direction: column; gap: 6px;
  transition: transform .18s, box-shadow .2s;
}
.sts__card-link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.sts__card-link-title { margin: 0; color: var(--nu-ink); font-size: 18px; font-weight: 800; letter-spacing: -.2px; }
.sts__card-link-desc { margin: 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }

/* ——— pill do FAQ ——— */
.sts__pill {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.sts__pill:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
</style>
