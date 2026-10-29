<script setup lang="ts">
/**
 * /calculadora/preco-teto/{TICKER}. SSR com a cotação, Bazin, Graham, P/L
 * setorial, VPA e o consenso da calculadora. FAQPage sai do NuFaqAccordion.
 * BreadcrumbList sai do usePageSeo. Canonical é o path, sem query.
 */
const route = useRoute()
const ticker = String(route.params.metodo ?? '').toUpperCase()
const { data, error } = await usePrecoTetoTicker(ticker)

const renamedTo = renamedTargetOfError(error.value)
if (renamedTo) {
  await navigateTo(
    { path: `/calculadora/preco-teto/${renamedTo}`, query: { ...route.query, de: ticker } },
    { redirectCode: 301, replace: true },
  )
} else if (error.value || !data.value) {
  const err = error.value as { statusCode?: number; statusMessage?: string; data?: unknown } | null
  const status = err?.statusCode
  if (status === 410) {
    throw createError({
      statusCode: 410,
      statusMessage: err?.statusMessage || delistedMessage(ticker, null),
      data: err?.data ?? { ticker, delistedAt: null },
      fatal: true,
    })
  }
  throw createError({
    statusCode: status === 404 ? 404 : 503,
    statusMessage: status === 404 ? (err?.statusMessage || `Ativo ${ticker} não encontrado`) : 'Dados temporariamente indisponíveis',
    fatal: true,
  })
}

const view = computed(() => data.value!)

if (data.value) {
  const v = data.value
  usePageSeo({
    title: v.title,
    description: v.description,
    path: `/calculadora/preco-teto/${v.ticker}`,
    dateModified: v.dataISO,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Calculadoras', path: '/calculadoras' },
      { name: 'Preço Teto', path: '/calculadora/preco-teto' },
      { name: v.ticker, path: `/calculadora/preco-teto/${v.ticker}` },
    ],
  })
}

const brl = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)

const metodos = computed(() => {
  const v = view.value
  return [
    { nome: 'Bazin', valor: v.bazin, formula: 'Dividendo ÷ 0,06', indisponivel: false },
    { nome: 'Graham', valor: v.graham, formula: '√(22,5 × LPA × VPA)', indisponivel: false },
    { nome: 'P/L setorial', valor: v.plSetorial, formula: 'LPA × P/L do setor', indisponivel: v.sectorPLFonte === 'ausente' },
    { nome: 'Valor patrimonial', valor: v.vpaTeto, formula: 'VPA × 1,5', indisponivel: false },
  ]
})
</script>

<template>
  <div v-if="data" class="ptt">
    <section class="ptt__hero">
      <NuxtLink to="/calculadora/preco-teto" class="ptt__back">← Calculadora de preço teto</NuxtLink>
      <h1 class="ptt__h1">Preço teto {{ view.ticker }} hoje</h1>
      <p class="ptt__lead">{{ view.resposta }}</p>
      <p v-if="view.dataTexto" class="ptt__updated">Atualizado em {{ view.dataTexto }}</p>
    </section>

    <section class="ptt__nums">
      <div class="ptt__hero-num">
        <div class="ptt__kicker">Cotação</div>
        <div class="ptt__big">{{ brl(view.preco) }}</div>
        <p class="ptt__nome">{{ view.nome }}<template v-if="view.setorNome"> · {{ view.setorNome }}</template></p>
      </div>
      <div v-if="view.consenso > 0" class="ptt__hero-num">
        <div class="ptt__kicker">Consenso</div>
        <div class="ptt__big">{{ brl(view.consenso) }}</div>
        <p class="ptt__nome">Média de Bazin, Graham, P/L setorial e VPA, quando há número.</p>
      </div>
      <ul class="ptt__methods">
        <li v-for="m in metodos" :key="m.nome">
          <span class="ptt__method-name">{{ m.nome }}</span>
          <span class="ptt__method-formula">{{ m.formula }}</span>
          <span class="ptt__method-value">{{ m.valor > 0 ? brl(m.valor) : (m.indisponivel ? 'Indisponível' : 'Não se aplica') }}</span>
        </li>
      </ul>
      <p class="ptt__aviso">Não é recomendação de compra ou venda. O preço teto é uma régua sobre os números dos últimos 12 meses, não uma previsão e não uma orientação.</p>
    </section>

    <section v-if="view.tabela.length" class="ptt__table-sec">
      <h2 class="ptt__h2">Preço teto de {{ view.ticker }} para DY de 4% a 12%</h2>
      <p class="ptt__dek">Cada linha divide o dividendo de renda de 12 meses ({{ brl(view.dividendo) }} por {{ view.unidade }}) pelo yield da coluna. A linha de 6% é o método de Bazin.</p>
      <div class="ptt__scroll">
        <table class="ptt__table">
          <caption class="ptt__caption">Preço teto de {{ view.ticker }} por dividend yield desejado</caption>
          <thead>
            <tr>
              <th scope="col">Dividend yield</th>
              <th scope="col">Preço teto</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="linha in view.tabela" :key="linha.pct" :class="{ 'ptt__row--bazin': linha.bazin }">
              <th scope="row">{{ linha.pct }}%</th>
              <td>
                {{ brl(linha.teto) }}
                <span v-if="linha.bazin" class="ptt__tag">Bazin</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="ptt__passos">
      <h2 class="ptt__h2">Como o preço teto de {{ view.ticker }} é calculado</h2>
      <ol class="ptt__steps">
        <li v-for="passo in view.passos" :key="passo.titulo">
          <h3 class="ptt__h3">{{ passo.titulo }}</h3>
          <p v-for="(linha, i) in passo.linhas" :key="i">{{ linha }}</p>
        </li>
      </ol>
    </section>

    <section class="ptt__texto">
      <h2 class="ptt__h2">{{ view.nome }} ({{ view.ticker }})</h2>
      <p class="ptt__p">{{ view.paragrafo }}</p>
      <nav class="ptt__links" aria-label="Páginas deste papel">
        <NuxtLink :to="view.assetHref">Página de {{ view.ticker }}</NuxtLink>
        <NuxtLink v-if="view.dividendosHref" :to="view.dividendosHref">Dividendos de {{ view.ticker }}</NuxtLink>
        <NuxtLink v-if="view.setorHref" :to="view.setorHref">Setor {{ view.setorNome }}</NuxtLink>
        <NuxtLink to="/calculadora/preco-teto/bazin">Método de Bazin</NuxtLink>
        <NuxtLink to="/calculadora/preco-teto/graham">Fórmula de Graham</NuxtLink>
      </nav>
    </section>

    <section class="ptt__faq">
      <h2 class="ptt__h2">Perguntas frequentes</h2>
      <NuFaqAccordion :items="view.faq" surface="white" />
      <p v-if="view.dataTexto" class="ptt__updated ptt__updated--end">Atualizado em {{ view.dataTexto }}</p>
    </section>
  </div>
</template>

<style scoped>
.ptt__hero, .ptt__nums, .ptt__table-sec, .ptt__passos, .ptt__texto, .ptt__faq {
  padding: clamp(48px, 6vw, 88px) clamp(22px, 5.5vw, 80px);
}
.ptt__hero, .ptt__table-sec, .ptt__texto { background: var(--nu-cream); }
.ptt__nums, .ptt__passos, .ptt__faq { background: var(--nu-white); }

.ptt__back { color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; }
.ptt__h1 {
  margin: 18px 0 0; color: var(--nu-ink); font-size: clamp(34px, 4.6vw, 58px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.04; max-width: 18ch;
}
.ptt__lead, .ptt__p, .ptt__dek {
  margin: 22px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-lg);
  font-weight: 500; line-height: 1.6; max-width: 68ch;
}
.ptt__dek { margin-top: 14px; font-size: var(--nu-fs-md); }
.ptt__updated { margin: 18px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700; }
.ptt__updated--end { margin-top: 28px; }

.ptt__hero-num { display: inline-block; margin-right: clamp(28px, 4vw, 56px); vertical-align: top; }
.ptt__kicker { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.ptt__big {
  margin-top: 6px; color: var(--nu-ink); font-size: clamp(40px, 5vw, 64px); font-weight: 800;
  letter-spacing: -0.04em; line-height: 1; font-variant-numeric: tabular-nums;
}
.ptt__nome { margin: 10px 0 0; max-width: 36ch; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; }

.ptt__methods {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px; margin: 36px 0 0; padding: 0; list-style: none;
}
.ptt__methods li {
  display: flex; flex-direction: column; gap: 6px; padding: 18px 18px 16px;
  background: var(--nu-cream); border-radius: 16px;
}
.ptt__method-name { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; }
.ptt__method-formula { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.ptt__method-value { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; font-variant-numeric: tabular-nums; }
.ptt__aviso {
  margin: 22px 0 0; max-width: 68ch; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.5;
}

.ptt__h2 {
  margin: 0; color: var(--nu-ink); font-size: clamp(26px, 3vw, 36px);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1.12; max-width: 22ch;
}
.ptt__scroll { margin-top: 22px; overflow-x: auto; }
.ptt__table { width: 100%; max-width: 520px; border-collapse: collapse; background: var(--nu-white); border-radius: 16px; }
.ptt__caption { caption-side: bottom; padding-top: 10px; text-align: left; color: var(--nu-gray); font-size: var(--nu-fs-sm); }
.ptt__table th, .ptt__table td {
  padding: 12px 16px; text-align: left; font-variant-numeric: tabular-nums;
  border-bottom: 1px solid var(--nu-cream); color: var(--nu-ink); font-size: var(--nu-fs-md);
}
.ptt__table thead th { font-weight: 800; font-size: var(--nu-fs-sm); color: var(--nu-gray); }
.ptt__table tbody th { font-weight: 700; }
.ptt__row--bazin { background: var(--nu-blue-tint, #eaf1ff); }
.ptt__tag {
  margin-left: 8px; padding: 2px 8px; border-radius: 999px; background: var(--nu-blue); color: white;
  font-size: 12px; font-weight: 800; vertical-align: 1px;
}

.ptt__steps { margin: 26px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 22px; max-width: 68ch; }
.ptt__h3 { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; }
.ptt__steps p { margin: 8px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6; }
.ptt__faq .ptt__h2 { margin-bottom: 24px; }

.ptt__links { display: flex; flex-wrap: wrap; gap: 10px 18px; margin-top: 22px; }
.ptt__links a { color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 800; }
</style>
