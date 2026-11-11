<script setup lang="ts">
// /setor/[slug] — detalhe de um setor da B3 (SEO programático). O slug é o
// ptSlug pt-BR (imobiliario, financeiro, …); validado contra o registry
// (404 fora dele). Resolve pro apiSlug inglês na chamada da API.
//
// Anatomia (espelha o /ranking/[slug]): topo em duas colunas (h1 + lead | os
// aggregates reais no cartão carvão) →
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
// o sujeito dos cartões que vão ao chat ("P/L PETR4"): useSobreDoContexto
proverSobreDoContexto(entry.name)

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

// o cartão carvão do topo: o número do dia (a variação média, quando existe) em
// destaque e os demais agregados embaixo. São os mesmos cartões de antes.
const statHeroi = computed(() => statCards.value.find((c) => c.tone) ?? statCards.value[0] ?? null)
const statDemais = computed(() => statCards.value.filter((c) => c !== statHeroi.value))

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
      a: `Hoje o setor ${name} reúne ${nStr} papéis listados na B3, entre ações e, quando é o caso, fundos. A Aportou atualiza essa contagem diariamente a partir dos dados do pregão.`,
    },
    {
      q: `Como interpretar o valor de mercado somado de um setor?`,
      a: `É a soma do valor de mercado das empresas do setor que têm esse dado disponível. Serve para dimensionar o peso do setor na bolsa, mas não representa a soma de todos os papéis, já que fundos e algumas empresas não têm valor de mercado divulgado.`,
    },
    {
      q: `Qual a diferença entre setor e ranking na Aportou?`,
      a: `O setor agrupa os ativos pela atividade econômica (o que a empresa faz). O ranking ordena ativos por um critério de qualidade ou preço, como dividend yield, Graham ou o Aportou Score. Você usa o setor para entender o mapa da bolsa e o ranking para comparar empresas dentro dele.`,
    },
    {
      q: `Com que frequência os dados do setor são atualizados?`,
      a: `Cotação e variação refletem o fechamento do pregão e são atualizados diariamente. Valor de mercado e a composição do setor acompanham a mesma rotina de atualização da Aportou.`,
    },
  ]
  return items
})

// ————— cross-links (ferramentas relacionadas) —————
const crossLinks = computed(() => {
  const links: { title: string; desc: string; href: string }[] = [
    { title: 'Aportou Score', desc: 'A nota de 0 a 100 que cruza 15 rankings fundamentalistas de uma vez.', href: '/ranking/redentia-score' },
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
  title: tituloSetor(entry.ptSlug, entry.name),
  description: descricaoQueCabe(entry.blurb),
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

// "Perguntar à IA" abre o painel do chat aqui mesmo (11/11/2026): a pergunta
// mora no painel desde 02/11, e a /busca não é mais onde se conversa.
const painel = useChatPainel()
</script>

<template>
  <div>
    <!-- ============ Topo: o setor à esquerda, os números reais no cartão carvão à direita ============ -->
    <section class="sts__topo" :class="{ 'sts__topo--so': !statHeroi }">
      <div class="sts__topo-grade">
        <div class="sts__topo-texto">
          <p class="nu-eyebrow sts__eyebrow">
            <MarcaCorte />
            <span><NuxtLink to="/setor" class="sts__volta">Setores</NuxtLink><span aria-hidden="true"> · </span>B3</span>
          </p>
          <h1 class="sts__h1">{{ entry.name }}</h1>
          <p class="sts__lead">O setor {{ entry.name.toLowerCase() }} na B3: as empresas e fundos que compõem o segmento, com dados atualizados diariamente.</p>
        </div>
        <!-- os agregados reais (só os campos com dado) -->
        <div v-if="statHeroi" class="sts__topo-palco">
          <NuFaixaMarca rotulo="O setor em números" como="p" :altura="56" class="sts__cartao">
            <div
              v-contexto-chat="{ id: `setor:${slug}:${statHeroi.label}`, tipo: 'grafico', rotulo: rotuloCurto(`${statHeroi.label} · ${entry.name}`), texto: `${statHeroi.label} (setor ${entry.name}): ${statHeroi.value}` }"
              class="sts__heroi"
            >
              <span class="sts__heroi-v" :class="{ 'sts__heroi-v--up': statHeroi.tone === 'up', 'sts__heroi-v--down': statHeroi.tone === 'down' }">{{ statHeroi.value }}</span>
              <span class="sts__heroi-l">{{ statHeroi.label }}</span>
            </div>
            <dl v-if="statDemais.length" class="sts__stats">
              <div v-for="c in statDemais" :key="c.label" v-contexto-chat="{ id: `setor:${slug}:${c.label}`, tipo: 'grafico', rotulo: rotuloCurto(`${c.label} · ${entry.name}`), texto: `${c.label} (setor ${entry.name}): ${c.value}` }" class="sts__stat">
                <dt class="sts__stat-label">{{ c.label }}</dt>
                <dd class="sts__stat-value">{{ c.value }}</dd>
              </div>
            </dl>
          </NuFaixaMarca>
        </div>
      </div>
    </section>

    <!-- ============ Corpo (tabela) ============ -->
    <section class="sts__body">
      <header class="sts__toolbar">
        <div class="sts__toolbar-meta">
          <NuEyebrow como="p">Ativos do setor</NuEyebrow>
          <p class="sts__toolbar-count">Maiores empresas por valor de mercado</p>
        </div>
      </header>

      <!-- loading é sempre esqueleto (contrato da Aportou) -->
      <div v-if="pending" class="sts__sk" aria-busy="true" aria-label="Carregando o setor">
        <NuSkeleton v-for="i in 8" :key="i" variant="line" width="100%" height="44px" radius="chip" />
      </div>
      <div v-else-if="unavailable" class="sts__state">
        Dados indisponíveis agora. Tente de novo em alguns minutos, o conteúdo abaixo continua valendo.
      </div>
      <div v-else-if="empty" class="sts__state">
        Nenhum ativo com dados pra esse setor no momento. Veja os outros setores no <NuxtLink to="/setor" class="sts__inline-link">hub de setores</NuxtLink>.
      </div>
      <RankTable v-else :rows="rows" :columns="['change', 'marketCap']" primary="marketCap" />

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
          e o <NuxtLink to="/ranking/redentia-score" class="sts__prose-link">Aportou Score</NuxtLink>.
        </p>
      </div>
    </CalcSplit>

    <!-- ============ Ferramentas relacionadas ============ -->
    <CalcBand tone="cream" title="Continue explorando">
      <div class="sts__grid-cards">
        <NuxtLink v-for="link in crossLinks" :key="link.href" :to="link.href" class="sts__card-link">
          <h3 class="sts__card-link-title">{{ link.title }}</h3>
          <p class="sts__card-link-desc">{{ link.desc }}</p>
          <span class="sts__card-link-ir">Abrir<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg></span>
        </NuxtLink>
      </div>
    </CalcBand>

    <!-- ============ FAQ ============ -->
    <CalcSplit tone="cream" wide>
      <template #title>Perguntas frequentes sobre o setor {{ entry.name.toLowerCase() }}</template>
      <template #left>
        <NuBotaoSeta variante="azul" tamanho="m" class="sts__pill" @click="painel.abrir()">Perguntar à IA</NuBotaoSeta>
      </template>
      <NuFaqAccordion :items="faqItems" surface="white" />
    </CalcSplit>

    <!-- ============ Fecho: o painel azul da marca, com o corte de fundo ============ -->
    <MercadoFecho
      eyebrow="Sua carteira" fundo="faixa"
      :primary="{ label: 'Criar conta grátis', to: '/login' }"
      :secondary="{ label: 'Ver todos os setores', to: '/setor' }"
    >
      <template #title>Acompanhe o setor {{ entry.name.toLowerCase() }} na sua carteira</template>
      <template #subtitle>Crie sua conta grátis e veja como as empresas deste setor aparecem em cada ranking, com dados atualizados diariamente.</template>
    </MercadoFecho>
  </div>
</template>

<style scoped>
/* Aportou (11/11/2026): o corpo corre sobre o creme da página e a tabela é um
   cartão branco. 2ª rodada: o topo em duas colunas, com os números reais do
   setor no cartão carvão com a faixa da marca (como o topo do /asset). */
.sts__topo {
  background: var(--nu-page); color: var(--nu-ink);
  padding: clamp(36px, 4.6vw, 68px) max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(36px, 4.4vw, 60px);
}
.sts__topo-grade { display: grid; grid-template-columns: minmax(0, 1fr); row-gap: clamp(28px, 3.4vw, 40px); }
.sts__topo-texto { min-width: 0; animation: nu-fade .5s ease both; }
.sts__topo-palco { min-width: 0; animation: nu-fade .5s ease .1s both; }
.sts__eyebrow { margin: 0; }
.sts__volta {
  display: inline-block; padding: 14px 0; margin: -14px 0; color: inherit;
  text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1.5px; text-decoration-color: var(--nu-line);
  transition: text-decoration-color .2s ease, color .2s ease;
}
.sts__volta:hover { color: var(--nu-blue-text); text-decoration-color: currentColor; }
.sts__h1 { margin: 20px 0 0; font-size: clamp(42px, 5vw, 72px); font-weight: var(--nu-w-display); letter-spacing: -0.035em; line-height: .98; text-wrap: balance; }
.sts__lead { margin: 20px 0 0; max-width: 44ch; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500; line-height: 1.45; text-wrap: pretty; }
@media (min-width: 1080px) {
  .sts__topo-grade { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: clamp(36px, 4.4vw, 72px); align-items: center; }
  .sts__topo--so .sts__topo-grade { grid-template-columns: minmax(0, 1fr); }
}

/* ——— o cartão dos agregados ——— */
.sts__cartao { --pad: clamp(20px, 2.4vw, 32px); overflow: hidden; }
.sts__heroi { display: flex; flex-direction: column; gap: 8px; padding: clamp(22px, 2.6vw, 32px) var(--pad) clamp(20px, 2.4vw, 28px); }
.sts__heroi-v {
  color: var(--nu-white); font-size: clamp(46px, 5.2vw, 68px); font-weight: var(--nu-w-display);
  letter-spacing: -.035em; font-variant-numeric: tabular-nums; line-height: 1;
}
.sts__heroi-v--up { color: var(--nu-green-soft); }
.sts__heroi-v--down { color: var(--nu-red-soft); }
.sts__heroi-l { color: var(--nu-on-dark-2); font-size: 14.5px; font-weight: 600; }
.sts__stats {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(180px, 100%), 1fr)); gap: 18px 28px;
  margin: 0 var(--pad); padding: clamp(18px, 2vw, 24px) 0 clamp(22px, 2.6vw, 30px); border-top: 1px solid var(--nu-dark-line);
}
.sts__stat { display: flex; flex-direction: column; gap: 8px; }
.sts__stat-label { color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: var(--nu-w-medio); text-transform: uppercase; letter-spacing: .16em; }
.sts__stat-value {
  margin: 0; color: var(--nu-white); font-size: clamp(26px, 2.6vw, 34px); font-weight: var(--nu-w-forte);
  letter-spacing: -.03em; font-variant-numeric: tabular-nums; line-height: 1;
}

.sts__body {
  background: var(--nu-page);
  padding: 0 max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(64px, 7vw, 100px);
  display: flex; flex-direction: column; gap: clamp(20px, 2.5vw, 28px);
  animation: nu-fade .5s ease .15s both;
}

.sts__toolbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.sts__toolbar-meta { display: flex; flex-direction: column; gap: 8px; }
.sts__toolbar-count {
  margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: var(--nu-w-forte);
  font-variant-numeric: tabular-nums; letter-spacing: -0.025em; line-height: 1.1;
}
.sts__sk { display: flex; flex-direction: column; gap: 10px; background: var(--nu-white); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-quente); padding: clamp(18px, 2vw, 28px); }
.sts__state {
  background: var(--nu-card); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-quente);
  padding: clamp(32px, 4vw, 48px); text-align: center;
  color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500;
}
.sts__inline-link { color: var(--nu-blue-text); font-weight: var(--nu-w-medio); text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1.5px; }
.sts__answer {
  margin: clamp(8px, 1.5vw, 16px) 0 0; max-width: 76ch;
  color: var(--nu-gray-3); font-size: clamp(16px, 1.4vw, 18px); font-weight: 500; line-height: 1.6;
}

/* ——— prosa educacional (família das calculadoras/rankings) ——— */
.sts__prose p {
  margin: 0 0 16px; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6;
}
.sts__prose p:last-child { margin-bottom: 0; }
.sts__prose-link { color: var(--nu-blue-text); font-weight: var(--nu-w-medio); text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1.5px; }

/* ——— ferramentas relacionadas ——— */
.sts__grid-cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 16px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 980px; margin-left: auto; margin-right: auto;
}
.sts__card-link {
  background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 26px; box-shadow: var(--nu-shadow-branco);
  display: flex; flex-direction: column; gap: 6px;
  transition: transform .25s var(--nu-ease-saida), box-shadow .25s var(--nu-ease-saida);
}
.sts__card-link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.sts__card-link-title { margin: 0; color: var(--nu-ink); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-forte); letter-spacing: -0.02em; transition: color .2s ease; }
.sts__card-link:hover .sts__card-link-title { color: var(--nu-blue-text); }
.sts__card-link-desc { margin: 0; color: var(--nu-gray-3); font-size: 14.5px; font-weight: 500; line-height: 1.5; }

.sts__card-link-ir { display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 10px; color: var(--nu-blue-text); font-size: 14.5px; font-weight: var(--nu-w-medio); }
.sts__card-link-ir svg { transition: transform .2s ease; }
.sts__card-link:hover .sts__card-link-ir svg { transform: translateX(3px); }

/* ——— a pílula da IA no FAQ ——— */
.sts__pill { margin-top: 28px; }
@media (prefers-reduced-motion: reduce) { .sts__card-link, .sts__card-link-ir svg { transition: none; } .sts__card-link:hover, .sts__card-link:hover .sts__card-link-ir svg { transform: none; } }
</style>
