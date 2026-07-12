<script setup lang="ts">
// /calculadora/preco-teto — PR10 fase 2.
// Contrato de UX: docs/redentia-nu/designs/Redentia Calculadoras Nu.dc.html
// (kit app/components/calc/*: sliders + preset chips + número-herói + FAQ).
// Contrato de SEO (regra nº1): TODO o texto da página antiga
// (Frontend/app/pages/calculadora/preco-teto.vue) verbatim, na MESMA ordem
// de tags (h1 → h2/h3/h4 → p → li → FAQ). Muda o visual, não o conteúdo.
// Matemática: porte EXATO de Frontend/app/components/calculator/FairPrice.vue
// (calculateFairPrice: Graham √(22.5×LPA×VPA), Bazin div/0.06, LPA×P/L,
// VPA×1.5, consenso pela média dos válidos, thresholds 0.8/1.0 e ±20%).
// Path antigo mantido (/calculadora/preco-teto) — preserva URL equity,
// inclusive os deep-links ?ticker= das ações populares.
import type { NuFaqItem } from '~/types/market'

const route = useRoute()

// Freshness signal — bump CONTENT_VERSION quando reformular o conteudo
// (novas FAQs, mudanca em metodologia, ano novo). Google usa
// dateModified como sinal de relevancia, manter mensal evita pagina
// "envelhecer" no indice.
const CONTENT_VERSION = '2026-06-08'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})
const lastUpdatedISO = lastUpdated.toISOString().slice(0, 10)

/* ————— calculadora (matemática EXATA da página antiga) ————— */

// Fundamentos ilustrativos dos 2 exemplos do próprio texto SEO — seeds
// INSTANTÂNEOS dos deep-links ?ticker= e fallback offline. Qualquer ticker
// (esses 2 inclusive) é hidratado com dados REAIS do backend logo em seguida
// (seedFromBackend) — paridade com a página antiga, que preenchia via
// getTickerFundamentus + dividendos 12m + P/L médio do setor.
const EXAMPLES: Record<string, { price: number; lpa: number; vpa: number; dividend: number; pl: number }> = {
  ITUB4: { price: 28, lpa: 3.5, vpa: 18, dividend: 1.8, pl: 10 },
  PETR4: { price: 38, lpa: 8, vpa: 35, dividend: 5, pl: 6 },
}

// defaults = exemplo ITUB4 (o mesmo do lead do hero)
const price = ref(28)
const lpa = ref(3.5)
const vpa = ref(18)
const dividend = ref(1.8)
const sectorPL = ref(10)

const queryTicker = computed(() => {
  const raw = route.query.ticker
  const t = (Array.isArray(raw) ? raw[0] : raw) ?? ''
  return String(t).trim().toUpperCase()
})
const activeTicker = computed(() => queryTicker.value || 'ITUB4')

function seedExample(t: string) {
  const ex = EXAMPLES[t]
  if (!ex) return
  price.value = ex.price
  lpa.value = ex.lpa
  vpa.value = ex.vpa
  dividend.value = ex.dividend
  sectorPL.value = ex.pl
}

const round2 = (n: number) => Math.round(n * 100) / 100

// Cadeia de P/L setorial portada do FairPrice.vue antigo: média do setor
// (aggregates.avg_trailing_pe, senão média dos trailing_pe 0<pe<100) →
// P/L próprio se 0<pe<60 → 12. Lista de setores cacheada no módulo.
let sectorsCache: { slug: string; name: string }[] | null = null
async function fetchSectorPE(sectorName: string): Promise<number | null> {
  try {
    if (!sectorsCache) {
      const resp = await $fetch<any>('/api/backend/sectors')
      sectorsCache = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : []
    }
    const target = sectorName.toLowerCase().trim()
    const found = (sectorsCache ?? []).find((s) => s.name?.toLowerCase() === target || s.slug === target)
    if (!found) return null
    const resp = await $fetch<any>(`/api/backend/sectors/${found.slug}/tickers?limit=200`)
    const avg = Number(resp?.aggregates?.avg_trailing_pe)
    if (Number.isFinite(avg) && avg > 0) return avg
    const list = Array.isArray(resp?.data) ? resp.data : []
    const pes = list.map((t: any) => Number(t?.trailing_pe)).filter((n: number) => Number.isFinite(n) && n > 0 && n < 100)
    return pes.length ? pes.reduce((a: number, b: number) => a + b, 0) / pes.length : null
  } catch { return null }
}

// Hidrata os sliders com dados REAIS de QUALQUER ticker (client-side; o SSR
// serve o seed estático e a página nunca depende do backend pra renderizar).
// Semântica idêntica à antiga: LPA/VPA dos fundamentos, dividendo = soma dos
// proventos pagos nos últimos 365d (fallback DY×preço), preço da rota
// canônica /tickers/{t}. Falhou qualquer coisa → seeds/sliders ficam como estão.
async function seedFromBackend(t: string) {
  if (!/^[A-Z]{4}\d{1,2}$/.test(t)) return
  try {
    const [overview, quote, dividends] = await Promise.all([
      $fetch<any>(`/api/backend/fundamentals/${t}/overview`),
      $fetch<any>(`/api/backend/tickers/${t}`).catch(() => null),
      $fetch<any>(`/api/backend/dividends/${t}`).catch(() => null),
    ])
    const stats = overview?.data?.key_statistics ?? {}
    const valuation = overview?.data?.scrape_extras?.valuation ?? {}

    const px = Number(quote?.data?.market_price) || Number(valuation.price) || 0
    const eps = Number(stats.trailing_eps) || Number(valuation.earnings_per_share) || 0
    const bvps = Number(stats.book_value) || Number(valuation.book_value_per_share) || 0
    const dyPct = Number(stats.dividend_yield) || Number(valuation.dividend_yield) || 0

    let annualDividend = 0
    const divList = Array.isArray(dividends?.data) ? dividends.data : []
    const oneYearMs = 365 * 24 * 60 * 60 * 1000
    for (const d of divList) {
      const pd = d?.payment_date ? new Date(d.payment_date).getTime() : NaN
      if (Number.isFinite(pd) && Date.now() - pd <= oneYearMs) annualDividend += parseFloat(d?.rate) || 0
    }
    if (!annualDividend && dyPct && px) annualDividend = (dyPct / 100) * px

    const ownPE = Number(stats.forward_pe) || Number(valuation.price_to_earnings) || 0
    let sectorPE = quote?.data?.sector ? await fetchSectorPE(String(quote.data.sector)) : null
    if (!sectorPE && ownPE > 0 && ownPE < 60) sectorPE = ownPE
    if (!sectorPE) sectorPE = 12

    if (px > 0) price.value = round2(px)
    if (eps > 0) lpa.value = round2(eps)
    if (bvps > 0) vpa.value = round2(bvps)
    if (annualDividend > 0) dividend.value = round2(annualDividend)
    sectorPL.value = round2(sectorPE)
  } catch { /* degrade elegante: mantém seed estático */ }
}

watch(queryTicker, (t, old) => {
  if (t) seedExample(t)
  if (import.meta.client && t) seedFromBackend(t)
  // deep-link clicado na própria página (ações populares) → scrolla até a calc
  if (import.meta.client && old !== undefined && t !== old) {
    nextTick(() => document.getElementById('teto')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
}, { immediate: true })

interface MethodResult {
  fairPrice: number
  margin: number
  ratio: number
}

// porte exato de calculateFairPrice (FairPrice.vue) — reativo, sem botão
const results = computed(() => {
  const currentPrice = price.value
  if (!currentPrice || currentPrice <= 0) return null

  const grahamPrice = lpa.value > 0 && vpa.value > 0 ? Math.sqrt(22.5 * lpa.value * vpa.value) : 0
  const bazinPrice = dividend.value > 0 ? dividend.value / 0.06 : 0
  const plSectorPrice = lpa.value > 0 && sectorPL.value > 0 ? lpa.value * sectorPL.value : 0
  const bookValuePrice = vpa.value > 0 ? vpa.value * 1.5 : 0

  const calculateMetrics = (fairPrice: number): MethodResult => {
    const margin = fairPrice > 0 ? (fairPrice - currentPrice) / currentPrice : 0
    const ratio = fairPrice > 0 ? currentPrice / fairPrice : 0
    return { fairPrice, margin, ratio }
  }

  const validPrices = [grahamPrice, bazinPrice, plSectorPrice, bookValuePrice].filter((p) => p > 0)
  const averageFairPrice =
    validPrices.length > 0 ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length : 0
  const averageMargin =
    averageFairPrice > 0 ? (averageFairPrice - currentPrice) / currentPrice : 0

  let recommendation = 'Neutro'
  let explanation = ''
  if (averageMargin > 0.2) {
    recommendation = 'Comprar'
    explanation =
      'A ação está negociando com boa margem de segurança abaixo do preço teto médio. Pode ser uma oportunidade interessante, mas valide também endividamento, ROE e perspectivas do setor.'
  } else if (averageMargin >= 0) {
    recommendation = 'Neutro'
    explanation =
      'A ação está próxima do preço teto médio. Avalie outros fundamentos antes de decidir e considere esperar uma janela com mais margem de segurança.'
  } else {
    recommendation = 'Caro'
    explanation =
      'A ação está negociando acima do preço teto médio. Pode estar cara no momento, a menos que haja um catalisador claro de crescimento que justifique o prêmio.'
  }

  return {
    graham: calculateMetrics(grahamPrice),
    bazin: calculateMetrics(bazinPrice),
    plSector: calculateMetrics(plSectorPrice),
    bookValue: calculateMetrics(bookValuePrice),
    consensus: { averageFairPrice, averageMargin, recommendation, explanation },
  }
})

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) value = 0
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

// porte exato dos thresholds de status (0.8 barato / 1.0 justo / acima caro)
function getStatusText(ratio: number): string {
  if (!ratio) return 'Sem dado'
  if (ratio <= 0.8) return 'Barato'
  if (ratio <= 1.0) return 'Justo'
  return 'Caro'
}

function getMethodStatus(ratio: number): string {
  if (!ratio) return ''
  if (ratio <= 0.8) return 'pt__method--positive'
  if (ratio <= 1.0) return 'pt__method--neutral'
  return 'pt__method--negative'
}

const methods = computed(() => {
  const r = results.value
  if (!r) return []
  return [
    { key: 'graham', title: 'Fórmula de Graham', formula: '√(22.5 × LPA × VPA)', res: r.graham },
    { key: 'bazin', title: 'Método Bazin', formula: 'Dividendo ÷ 0.06 (DY mín 6%)', res: r.bazin },
    { key: 'plSector', title: 'P/L Setorial', formula: 'LPA × P/L Médio do Setor', res: r.plSector },
    { key: 'bookValue', title: 'Valor Patrimonial', formula: 'VPA × 1.5 (margem Graham)', res: r.bookValue },
  ]
})

// comparação visual — mesmas cores semânticas da antiga (Graham=positivo,
// Bazin/PL=primário, VPA=negativo) e mesma fórmula de largura capped 100%
const visualMethods = computed(() => {
  const r = results.value
  if (!r) return []
  return [
    { key: 'graham', label: 'Graham', fairPrice: r.graham.fairPrice, color: 'var(--nu-green)' },
    { key: 'bazin', label: 'Bazin', fairPrice: r.bazin.fairPrice, color: 'var(--nu-blue)' },
    { key: 'plSector', label: 'P/L Setorial', fairPrice: r.plSector.fairPrice, color: 'var(--nu-blue)' },
    { key: 'bookValue', label: 'Valor Patrimonial', fairPrice: r.bookValue.fairPrice, color: 'var(--nu-red)' },
  ]
})

function barWidth(fairPrice: number): string {
  return `${Math.min(100, (fairPrice / Math.max(price.value, 0.01)) * 100).toFixed(1)}%`
}

const recoClass = computed(() => {
  const rec = results.value?.consensus.recommendation
  if (rec === 'Comprar') return 'pt__reco--positive'
  if (rec === 'Caro') return 'pt__reco--negative'
  return 'pt__reco--neutral'
})

/* ————— textos dos sliders + presets ————— */
const priceTxt = computed(() => formatCurrency(price.value))
const lpaTxt = computed(() => formatCurrency(lpa.value))
const vpaTxt = computed(() => formatCurrency(vpa.value))
const dividendTxt = computed(() => formatCurrency(dividend.value))
const sectorPLTxt = computed(() => sectorPL.value.toLocaleString('pt-BR'))

// P/Ls típicos citados no próprio conteúdo (bancos 8-12, varejo 12-18,
// tecnologia 20-30, petróleo do exemplo PETR4)
const plPresets = [
  { label: 'Petróleo 6', value: 6 },
  { label: 'Bancos 10', value: 10 },
  { label: 'Varejo 15', value: 15 },
  { label: 'Tecnologia 25', value: 25 },
]

/* ————— dados de conteúdo (texto verbatim da página antiga) ————— */

const popularTickers = [
  { ticker: 'PETR4', name: 'Petrobras' },
  { ticker: 'ITUB4', name: 'Itaú Unibanco' },
  { ticker: 'VALE3', name: 'Vale' },
  { ticker: 'BBAS3', name: 'Banco do Brasil' },
  { ticker: 'BBDC4', name: 'Bradesco' },
  { ticker: 'BBSE3', name: 'BB Seguridade' },
  { ticker: 'WEGE3', name: 'WEG' },
  { ticker: 'ITSA4', name: 'Itaúsa' },
  { ticker: 'B3SA3', name: 'B3' },
  { ticker: 'MGLU3', name: 'Magazine Luiza' },
  { ticker: 'ABEV3', name: 'Ambev' },
  { ticker: 'SUZB3', name: 'Suzano' },
  { ticker: 'RENT3', name: 'Localiza' },
]

const indicatorItems = [
  { strong: 'P/L (Preço/Lucro):', text: ' quantos anos de lucro o preço atual representa. Bancos 8-12, varejo 12-18, tecnologia 20-30.' },
  { strong: 'P/VP (Preço/Valor Patrimonial):', text: ' quantas vezes o patrimônio líquido o preço representa. Abaixo de 1,5 é o limite Graham; abaixo de 1,0 indica desconto sobre o valor contábil.' },
  { strong: 'ROE (Retorno sobre Patrimônio):', text: ' quanto a empresa gera de lucro para cada R$ 1 de patrimônio. Bom: acima de 15% ao ano; excelente: acima de 20%.' },
  { strong: 'ROIC (Retorno sobre Capital Investido):', text: ' mede eficiência operacional descontando dívida. ROIC acima do custo de capital (~12% no Brasil) significa que a empresa cria valor.' },
  { strong: 'Dívida Líquida/EBITDA:', text: ' quantos anos de geração de caixa para quitar a dívida. Saudável: abaixo de 3x; alerta: acima de 4x.' },
  { strong: 'Margem Líquida:', text: ' percentual do faturamento que vira lucro. Varia por setor: bancos 25-35%, varejo 2-6%, software 15-30%.' },
  { strong: 'Payout:', text: ' percentual do lucro distribuído em dividendos. Sustentável: 40-60% para empresas tradicionais; FIIs distribuem 95%+ por lei.' },
  { strong: 'Dividend Yield (DY):', text: ' dividendos anuais sobre o preço atual. Bazin exige no mínimo 6% para considerar a ação atrativa.' },
]

const exampleItub = {
  data: ['Preço atual: R$ 28,00', 'LPA: R$ 3,50', 'VPA: R$ 18,00', 'Dividendo anual: R$ 1,80', 'P/L médio setor bancário: 10'],
  boxes: [
    { label: 'Graham', value: '√(22.5 × 3.50 × 18) = R$ 35,55' },
    { label: 'Bazin', value: '1.80 ÷ 0.06 = R$ 30,00' },
    { label: 'P/L Setorial', value: '3.50 × 10 = R$ 35,00' },
    { label: 'Valor Patrimonial', value: '18 × 1.5 = R$ 27,00' },
  ],
  resultMain: 'Preço Teto Médio: R$ 31,89',
  resultSub: 'Preço atual (R$ 28,00) está 12% abaixo do teto médio. Boa margem de segurança!',
}

const examplePetr = {
  data: ['Preço atual: R$ 38,00', 'LPA: R$ 8,00', 'VPA: R$ 35,00', 'Dividendo anual: R$ 5,00', 'P/L médio setor petróleo: 6'],
  boxes: [
    { label: 'Graham', value: '√(22.5 × 8 × 35) = R$ 79,37' },
    { label: 'Bazin', value: '5 ÷ 0.06 = R$ 83,33' },
    { label: 'P/L Setorial', value: '8 × 6 = R$ 48,00' },
    { label: 'Valor Patrimonial', value: '35 × 1.5 = R$ 52,50' },
  ],
  resultMain: 'Preço Teto Médio: R$ 65,80',
  resultSub: 'Preço atual (R$ 38,00) está 42% abaixo do teto médio. Excelente oportunidade segundo as métricas!',
}

const howToSteps = [
  { title: 'Reúna os Dados da Ação', html: 'Use a própria página do ativo aqui na Redentia ou o site de RI da empresa. Você precisa de: LPA, VPA, dividendos dos últimos 12 meses e P/L médio do setor.' },
  { title: 'Preencha os Campos', html: 'Insira ticker, preço atual e os indicadores. Use valores dos últimos 12 meses (TTM - Trailing Twelve Months) para maior precisão.' },
  { title: 'Analise as 4 Metodologias', html: 'Cada método tem seus pontos fortes. Graham é conservador, Bazin foca dividendos, P/L setorial contextualiza, e VPA é bom para empresas com ativos.' },
  { title: 'Veja o Consenso', html: 'A média das metodologias fornece uma visão balanceada. Se a maioria indicar "Barato", a ação pode estar em bom momento de compra.' },
  { title: 'Analise Outros Fundamentos', html: 'Preço teto é um filtro, não a decisão final. Avalie também: endividamento, ROE, crescimento de receita, perspectivas do setor e qualidade da gestão.' },
]

const limitCards = [
  { title: 'Empresas de Crescimento (Growth)', body: 'Empresas como Magazine Luiza, Mercado Livre, que crescem rápido mas têm lucro baixo ou prejuízo, não funcionam bem com essas fórmulas. Prefira análise de múltiplos de receita ou fluxo de caixa descontado.' },
  { title: 'Empresas com Prejuízo', body: 'Se o LPA é negativo, as fórmulas não funcionam. A empresa pode estar em reestruturação ou em setor cíclico no momento ruim.' },
  { title: 'Setores Muito Cíclicos', body: 'Commodities (mineração, siderurgia) têm lucros que variam muito. Use LPA médio de vários anos ou análise de ciclos.' },
  { title: 'Empresas com Dívida Altíssima', body: 'Se a empresa está super endividada, o valor patrimonial pode estar inflado. Verifique Dívida Líquida / EBITDA antes.' },
]

const tipCards = [
  { title: '1. Use Como Filtro Inicial', body: 'Calcule o preço teto de 10-20 ações que você gosta. Descarte as que estão muito acima do teto. Foque análise profunda nas que estão abaixo.' },
  { title: '2. Combine com Outros Indicadores', body: 'Não use apenas preço teto. Veja também: ROE > 15%, Dívida/EBITDA < 3, Crescimento de receita > 5% a.a., Payout sustentável.' },
  { title: '3. Exija Margem de Segurança', body: 'Nunca compre no preço teto ou acima. Espere pelo menos 20% de margem. Em momentos de crise, você pode conseguir 40-50% de desconto.' },
  { title: '4. Reavalie Periodicamente', body: 'Fundamentos mudam. Uma ação que estava barata pode ficar cara se o lucro cair. Recalcule após cada balanço trimestral.' },
  { title: '5. Entenda o "Por Quê"', body: 'Se uma ação está 50% abaixo do preço teto, investigue o porquê. Pode ser oportunidade ou problema real que o mercado já precificou.' },
  { title: '6. Seja Paciente', body: 'Value investing exige paciência. Pode levar meses ou anos para o mercado reconhecer o valor. Não espere ganhos rápidos.' },
]

// Rankings relacionados — listas atualizadas que ampliam a analise do
// preco teto (Graham, Bazin, upside potencial).
const relatedRankings = [
  { to: '/ranking/mais-baratas-graham', title: 'Ações mais baratas pelo Graham', sub: 'Maior desconto em relação ao preço justo de Graham' },
  { to: '/ranking/mais-baratas-bazin', title: 'Ações mais baratas pelo Bazin', sub: 'Top desconto pelo método de Décio Bazin' },
  { to: '/ranking/maior-potencial-upside', title: 'Maior potencial de upside', sub: 'Consenso de analistas vs preço atual' },
]

// FAQs verbatim da página antiga (11). O FAQPage JSON-LD é emitido pelo
// NuFaqAccordion — fonte única, mesmo padrão do app antigo.
const faqItems: NuFaqItem[] = [
  { q: 'O que é preço teto e por que calcular?', a: 'Preço teto é o valor máximo que um investidor deveria pagar por uma ação considerando seus fundamentos e uma margem de segurança. É a referência central da análise fundamentalista: se a ação estiver negociando abaixo do preço teto, pode estar barata; se estiver acima, pode estar cara.' },
  { q: 'Qual a diferença entre preço teto e preço justo?', a: 'São praticamente sinônimos. "Preço teto" enfatiza o limite máximo aceitável de compra (com margem de segurança); "preço justo" enfatiza o valor intrínseco da empresa pelos fundamentos. As 4 metodologias (Graham, Bazin, P/L Setorial, VPA) calculam o preço justo, e por convenção esse valor é tratado como o preço teto, ou seja, o limite acima do qual a ação fica cara.' },
  { q: 'Qual a melhor metodologia: Graham ou Bazin?', a: 'Depende do perfil. Bazin é ideal para quem busca renda passiva com dividendos e exige DY mínimo de 6% ao ano. Graham é mais conservador e equilibra lucro e patrimônio líquido, sendo ideal para empresas maduras e rentáveis. Na prática, use as duas e compare com P/L setorial e VPA para ter uma visão completa.' },
  { q: 'Se a ação está abaixo do preço teto, é garantia de boa compra?', a: 'Não. O preço teto é um filtro inicial, não uma garantia. A ação pode estar barata porque o mercado antecipa problemas: queda de lucro, concorrência, setor em declínio ou mudança regulatória. Sempre investigue o porquê antes de comprar, para evitar caírem uma "value trap" (armadilha de valor).' },
  { q: 'Como calcular a margem de segurança?', a: 'Margem de Segurança = (Preço Teto − Preço Atual) ÷ Preço Teto × 100. Se o teto é R$ 40 e a ação está R$ 30, a margem é de 25%. Benjamin Graham sugeria no mínimo 20% a 30% de margem para investir com segurança. Quanto maior a margem, menor o risco de erro de análise.' },
  { q: 'A calculadora serve para FIIs (Fundos Imobiliários)?', a: 'Parcialmente. Para FIIs use principalmente o Método Bazin (Dividendo ÷ Yield mínimo) e a análise de P/VP. Um bom FII costuma ter P/VP abaixo de 1,0, DY acima de 8% e vacância baixa. A fórmula de Graham não se aplica bem porque FIIs não têm "lucro" tradicional.' },
  { q: 'E para empresas de crescimento como Magazine Luiza?', a: 'As fórmulas tradicionais de preço teto não capturam bem growth stocks. Empresas que reinvestem todo o lucro têm LPA baixo ou negativo, mas podem ter um futuro excelente. Para essas, prefira múltiplos de receita (P/S ou EV/Sales), fluxo de caixa descontado (DCF) ou comparação com pares de mercado.' },
  { q: 'Com que frequência devo recalcular o preço teto?', a: 'Recalcule trimestralmente, após cada balanço da empresa. LPA, VPA e dividendos mudam a cada trimestre. Se você acompanha a empresa de perto, revise a cada 3 meses. Para investidores de longo prazo, uma vez por ano pode bastar, desde que não haja eventos materiais no meio do caminho.' },
  { q: 'De onde vêm os dados da calculadora?', a: 'A Redentia utiliza dados públicos da B3 (Bolsa brasileira), Comissão de Valores Mobiliários (CVM) e demonstrações financeiras oficiais das empresas, atualizados automaticamente após cada pregão e divulgação de balanço.' },
  { q: 'Vale usar preço teto para small caps?', a: 'Sim, com cautela. Small caps tendem a ter P/L mais alto porque o mercado paga pelo crescimento futuro. Use P/L setorial ajustado para small caps (15-20), exija margem de segurança maior (30-40%) e diversifique, já que esses papéis têm volatilidade e risco de liquidez maiores.' },
  { q: 'O que fazer se as 4 metodologias derem resultados muito diferentes?', a: 'É normal. Cada método olha a empresa por um ângulo. Se Graham, Bazin, P/L e VPA divergem bastante, dê mais peso ao método que faz mais sentido para aquela empresa: bancos tendem a responder bem a VPA e P/L, pagadoras de dividendos ao Bazin, industriais a Graham. Use a média ponderada como consenso.' },
]

usePageSeo({
  title: 'Calculadora de Preço Teto 2026 - Grátis',
  description:
    'Calcule o preço teto e preço justo de qualquer ação da B3 por Graham, Bazin, P/L e VPA em 1 clique. Veja margem de segurança e veredito. Grátis.',
  path: '/calculadora/preco-teto',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadoras' },
    { name: 'Preço Teto', path: '/calculadora/preco-teto' },
  ],
  structuredData: [
    {
      '@type': 'WebApplication',
      name: 'Calculadora de Preço Teto Redentia',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      dateModified: lastUpdatedISO,
      description:
        'Calculadora gratuita de preço teto para ações da B3. Calcula Graham, Bazin, P/L setorial e valor patrimonial automaticamente a partir do ticker.',
      featureList: [
        'Cálculo automático a partir do ticker',
        'Fórmula de Benjamin Graham',
        'Método Décio Bazin',
        'P/L Setorial',
        'Valor Patrimonial (VPA x 1.5)',
        'Margem de segurança por metodologia',
        'Consenso e recomendação de compra',
        'Comparação visual entre métodos',
      ],
      about: [
        { '@type': 'Organization', name: 'B3', url: 'https://www.b3.com.br' },
        { '@type': 'Organization', name: 'CVM', url: 'https://www.gov.br/cvm' },
        { '@type': 'Person', name: 'Benjamin Graham' },
      ],
    },
    // FAQPage schema é emitido pelo <NuFaqAccordion> via useHead — fonte unica.
  ],
})
</script>

<template>
  <div>
    <!-- ============ Hero (texto antigo verbatim, visual Nu) ============ -->
    <section class="pt__hero">
      <div class="pt__status">
        <NuxtLink to="/calculadoras" class="pt__back">← Todas as calculadoras</NuxtLink>
        <span aria-hidden>·</span>
        <span>Atualizado {{ lastUpdatedText }}</span>
      </div>
      <p class="pt__eyebrow">Calculadora · Preço Teto e Preço Justo</p>
      <h1 class="pt__h1">
        Calculadora de Preço Teto e Preço Justo:
        <em class="pt__italic">Graham, Bazin, P/L e VPA.</em>
      </h1>
      <p class="pt__lead">
        O preço teto é o valor máximo que vale pagar por uma ação considerando seus fundamentos. Calcula-se por <strong>Graham</strong> (√(22.5×LPA×VPA)), <strong>Bazin</strong> (Dividendo÷0,06), <strong>P/L</strong> setorial ou <strong>VPA</strong>×1,5. Exemplo: ITUB4 com LPA R$ 3,50 e VPA R$ 18,00 tem preço teto Graham de R$ 35,55, ou seja, vale a compra abaixo desse valor.
      </p>
      <ul class="pt__chips">
        <li><span class="pt__chip-dot pt__chip-dot--positive" /> 100% gratuito</li>
        <li><span class="pt__chip-dot" /> Cálculo instantâneo</li>
        <li><span class="pt__chip-dot" /> Dados oficiais da B3</li>
        <li><span class="pt__chip-dot" /> Graham · Bazin · P/L · VPA</li>
      </ul>
    </section>

    <!-- ============ Calculadora interativa (design/kit) ============ -->
    <CalcShell section-id="teto" eyebrow="Calculadora">
      <template #title>Preço teto.</template>
      <template #controls>
        <div class="pt__examples">
          <span class="pt__examples-label">Exemplos</span>
          <button
            v-for="(ex, t) in EXAMPLES"
            :key="t"
            type="button"
            class="pt__chip-btn"
            :class="{ 'pt__chip-btn--active': activeTicker === t && price === ex.price && lpa === ex.lpa }"
            @click="seedExample(String(t))"
          >{{ t }}</button>
        </div>
        <div class="pt__gap">
          <CalcSliderField v-model="price" label="Preço Atual (R$)" :min="1" :max="150" :step="0.5" :value-text="priceTxt" />
        </div>
        <div class="pt__gap">
          <CalcSliderField v-model="lpa" label="Lucro por Ação - LPA (R$)" :min="0" :max="20" :step="0.1" :value-text="lpaTxt" />
        </div>
        <div class="pt__gap">
          <CalcSliderField v-model="vpa" label="Valor Patrimonial - VPA (R$)" :min="0" :max="60" :step="0.5" :value-text="vpaTxt" />
        </div>
        <div class="pt__gap">
          <CalcSliderField v-model="dividend" label="Dividendo Anual (R$)" :min="0" :max="10" :step="0.1" :value-text="dividendTxt" />
        </div>
        <div class="pt__gap">
          <CalcSliderField v-model="sectorPL" label="P/L Médio do Setor" :min="1" :max="30" :step="0.5" :value-text="sectorPLTxt" :presets="plPresets" />
        </div>
        <p class="pt__controls-note">Valores ilustrativos, ajuste com os fundamentos reais da ação (LPA, VPA e dividendos dos últimos 12 meses).</p>
      </template>
      <template #result>
        <CalcResultPanel
          v-if="results"
          caption="Pelas 4 metodologias, com os fundamentos ao lado, o preço teto médio é"
          :value="formatCurrency(results.consensus.averageFairPrice)"
          :items="[
            { dot: 'var(--nu-ink)', label: 'Preço atual', value: formatCurrency(price) },
            { dot: 'var(--nu-blue)', label: 'Margem de segurança', value: `${(results.consensus.averageMargin * 100).toFixed(1)}%`, accent: true },
          ]"
        >
          <div class="pt__reco" :class="recoClass">
            <span class="pt__reco-label">Recomendação consensual</span>
            <span class="pt__reco-value">{{ results.consensus.recommendation }}</span>
          </div>
          <p class="pt__reco-explain">{{ results.consensus.explanation }}</p>

          <div class="pt__methods">
            <div v-for="m in methods" :key="m.key" class="pt__method" :class="getMethodStatus(m.res.ratio)">
              <div class="pt__method-head">
                <span class="pt__method-title">{{ m.title }}</span>
                <span class="pt__method-badge">{{ getStatusText(m.res.ratio) }}</span>
              </div>
              <p class="pt__method-value">{{ formatCurrency(m.res.fairPrice) }}</p>
              <p class="pt__method-margin">Margem: {{ (m.res.margin * 100).toFixed(1) }}%</p>
              <p class="pt__method-formula">{{ m.formula }}</p>
            </div>
          </div>

          <div class="pt__bars">
            <div class="pt__bar-row">
              <span class="pt__bar-label">Preço atual</span>
              <span class="pt__bar-value">{{ formatCurrency(price) }}</span>
            </div>
            <div class="pt__bar-track"><span class="pt__bar-fill" :style="{ width: '100%', background: 'var(--nu-ink)' }" /></div>
            <template v-for="m in visualMethods" :key="m.key">
              <div class="pt__bar-row">
                <span class="pt__bar-label">{{ m.label }}</span>
                <span class="pt__bar-value">{{ formatCurrency(m.fairPrice) }}</span>
              </div>
              <div class="pt__bar-track"><span class="pt__bar-fill" :style="{ width: barWidth(m.fairPrice), background: m.color }" /></div>
            </template>
          </div>

          <NuxtLink :to="`/acao/${activeTicker.toLowerCase()}`" class="pt__asset-link">
            Ver análise completa de {{ activeTicker }} →
          </NuxtLink>

          <div class="pt__insight">
            <strong>Fonte dos dados:</strong> preço e fundamentos calculados com dados públicos da B3, fechamento do último pregão. O preço teto é uma referência, não uma garantia. Analise sempre os fundamentos da empresa, perspectivas futuras e seu perfil de risco antes de investir.
          </div>
        </CalcResultPanel>
      </template>
    </CalcShell>

    <!-- ============ Ações populares (deep-links verbatim) ============ -->
    <section class="pt__band pt__band--cream">
      <h2 class="pt__h2">Ações populares para calcular preço teto</h2>
      <p class="pt__p pt__p--dek">
        Acesse o cálculo pronto das ações mais buscadas da Bolsa brasileira.
      </p>
      <div class="pt__tickers">
        <NuxtLink
          v-for="t in popularTickers"
          :key="t.ticker"
          :to="`/calculadora/preco-teto?ticker=${t.ticker}`"
          class="pt__ticker"
        >
          <span class="pt__ticker-code">{{ t.ticker }}</span>
          <span class="pt__ticker-name">{{ t.name }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- ============ Conteúdo educacional (texto verbatim) ============ -->
    <section class="pt__band pt__band--white">
      <h2 class="pt__h2">Simulador de preço teto grátis e online</h2>
      <p class="pt__p">
        Use a calculadora acima para simular o preço teto de qualquer ação da B3 em segundos. Ideal pra quem busca uma referência rápida antes de comprar.
      </p>

      <h2 class="pt__h2 pt__mt">O que é Preço Teto?</h2>
      <p class="pt__p">
        O preço teto é o valor máximo que você deveria pagar por uma ação, considerando seus fundamentos e uma margem de segurança. É um conceito fundamental da análise fundamentalista, popularizado por Benjamin Graham (o "pai do value investing") e adaptado por investidores brasileiros como Décio Bazin.
      </p>
      <p class="pt__p">
        Diferente de apenas olhar o preço atual da ação, o preço teto considera indicadores como lucro, patrimônio, dividendos e múltiplos do setor para determinar um valor justo. Se a ação estiver abaixo do preço teto, pode ser uma boa oportunidade de compra. Se estiver acima, pode estar cara.
      </p>

      <h2 class="pt__h2 pt__mt">Metodologias de Cálculo</h2>

      <h3 class="pt__h3">1. Fórmula de Benjamin Graham</h3>
      <div class="pt__formula-wrap">
        <CalcFormulaCard
          :terms="[
            { sym: 'LPA', desc: 'Lucro por Ação (últimos 12 meses)' },
            { sym: 'VPA', desc: 'Valor Patrimonial por Ação' },
            { sym: '22.5', desc: 'Constante de Graham (P/L 15 × P/VP 1.5)' },
          ]"
        >Preço Teto = √(22.5 × LPA × VPA)</CalcFormulaCard>
      </div>
      <p class="pt__p">
        Graham defendia que empresas deveriam ser compradas com P/L máximo de 15 e P/VP máximo de 1.5. A fórmula combina esses dois critérios em um único número. É ideal para empresas maduras e lucrativas.
      </p>

      <h3 class="pt__h3">2. Método Bazin (Dividendos)</h3>
      <div class="pt__formula-wrap">
        <CalcFormulaCard
          :terms="[
            { sym: 'Dividendo Anual', desc: 'Soma dos dividendos por ação nos últimos 12 meses' },
            { sym: '0.06 (6%)', desc: 'Dividend Yield mínimo aceitável segundo Bazin' },
          ]"
        >Preço Teto = Dividendo Anual ÷ 0.06</CalcFormulaCard>
      </div>
      <p class="pt__p">
        Décio Bazin focava em dividendos consistentes. Segundo ele, uma ação só vale a pena se pagar pelo menos 6% de dividend yield. O método é excelente para quem busca renda passiva e empresas consolidadas que distribuem lucros regularmente.
      </p>

      <h3 class="pt__h3">3. P/L Setorial</h3>
      <div class="pt__formula-wrap">
        <CalcFormulaCard
          :terms="[
            { sym: 'P/L Médio', desc: 'Média do Price/Earnings ratio das empresas do mesmo setor' },
          ]"
        >Preço Teto = LPA × P/L Médio do Setor</CalcFormulaCard>
      </div>
      <p class="pt__p">
        Cada setor tem um P/L considerado "normal". Bancos costumam ter P/L de 8-12, enquanto tecnologia pode ter 20-30. Comparar com o setor evita julgar uma empresa por padrões inadequados.
      </p>

      <h3 class="pt__h3">4. Valor Patrimonial (Graham Modificado)</h3>
      <div class="pt__formula-wrap">
        <CalcFormulaCard
          :terms="[
            { sym: 'VPA', desc: 'Patrimônio Líquido ÷ Número de Ações' },
            { sym: '1.5', desc: 'Margem máxima sobre valor contábil (Graham)' },
          ]"
        >Preço Teto = VPA × 1.5</CalcFormulaCard>
      </div>
      <p class="pt__p">
        Graham sugeria não pagar mais que 1.5x o valor patrimonial. Útil para empresas com muitos ativos tangíveis (bancos, seguradoras, indústrias). Menos efetivo para empresas de serviço ou tecnologia.
      </p>

      <h2 class="pt__h2 pt__mt">Indicadores de análise fundamentalista</h2>
      <p class="pt__p">
        O preço teto é apenas uma parte da análise fundamentalista. Antes de comprar, cruze o resultado com os principais indicadores de qualidade da empresa. Eles dizem se o desconto é real ou se a ação está barata por um motivo legítimo.
      </p>
      <div class="pt__card pt__card--wide">
        <ul class="pt__ind-list">
          <li v-for="it in indicatorItems" :key="it.strong"><strong>{{ it.strong }}</strong>{{ it.text }}</li>
        </ul>
      </div>

      <h2 class="pt__h2 pt__mt">Exemplos Práticos</h2>

      <h3 class="pt__h3">Exemplo 1: Itaú Unibanco (ITUB4)</h3>
      <div class="pt__card pt__card--example">
        <h4 class="pt__h4">Dados (valores ilustrativos):</h4>
        <ul class="pt__list">
          <li v-for="d in exampleItub.data" :key="d">{{ d }}</li>
        </ul>
        <div class="pt__ex-grid">
          <div v-for="b in exampleItub.boxes" :key="b.label" class="pt__ex-box">
            <p class="pt__ex-label">{{ b.label }}</p>
            <p class="pt__ex-value">{{ b.value }}</p>
          </div>
        </div>
        <div class="pt__result-box">
          <p class="pt__result-main">{{ exampleItub.resultMain }}</p>
          <p class="pt__result-sub">{{ exampleItub.resultSub }}</p>
        </div>
      </div>

      <h3 class="pt__h3">Exemplo 2: Petrobras (PETR4)</h3>
      <div class="pt__card pt__card--example">
        <h4 class="pt__h4">Dados (valores ilustrativos):</h4>
        <ul class="pt__list">
          <li v-for="d in examplePetr.data" :key="d">{{ d }}</li>
        </ul>
        <div class="pt__ex-grid">
          <div v-for="b in examplePetr.boxes" :key="b.label" class="pt__ex-box">
            <p class="pt__ex-label">{{ b.label }}</p>
            <p class="pt__ex-value">{{ b.value }}</p>
          </div>
        </div>
        <div class="pt__result-box pt__result-box--positive">
          <p class="pt__result-main pt__result-main--positive">{{ examplePetr.resultMain }}</p>
          <p class="pt__result-sub">{{ examplePetr.resultSub }}</p>
        </div>
      </div>
    </section>

    <!-- ============ Como usar (steps 01-05 do design, texto verbatim) ============ -->
    <section class="pt__band pt__band--cream">
      <h2 class="pt__h2 pt__h2--center">Como Usar a Calculadora</h2>
      <div class="pt__steps"><CalcSteps :steps="howToSteps" /></div>
    </section>

    <!-- ============ Value vs Growth + Limitações (texto verbatim) ============ -->
    <section class="pt__band pt__band--white">
      <h2 class="pt__h2">Value Investing vs Growth Investing</h2>
      <p class="pt__p">
        A calculadora de preço teto é uma ferramenta clássica do value investing, escola que busca empresas negociadas abaixo do valor intrínseco. Antes de aplicar as fórmulas, vale entender se o ativo analisado faz sentido pra essa filosofia ou se ele pertence ao outro lado, growth investing.
      </p>
      <div class="pt__cards pt__cards--two">
        <div class="pt__card">
          <h4 class="pt__h4 pt__h4--accent">Value Investing</h4>
          <p class="pt__card-p">
            Foco em preço teto, fórmulas Graham e Bazin, dividendos consistentes, ROE alto, P/L baixo e margem de segurança. O investidor procura empresas maduras pagando bom dividendo, com lucro previsível e múltiplos esticados pra baixo. Resultado costuma vir devagar, com renda recorrente.
          </p>
          <p class="pt__card-small">Exemplos clássicos na B3: ITUB4, BBAS3, TAEE11.</p>
        </div>
        <div class="pt__card">
          <h4 class="pt__h4 pt__h4--accent">Growth Investing</h4>
          <p class="pt__card-p">
            Foco em receita crescente, reinvestimento de lucros e expansão de margem futura. P/L alto é tolerado quando justificado por crescimento de dois dígitos por vários anos. As fórmulas tradicionais subestimam essas empresas porque o lucro presente é pequeno comparado ao potencial. Para essas, prefira múltiplos de receita (P/S, EV/Sales) ou fluxo de caixa descontado (DCF).
          </p>
          <p class="pt__card-small">Exemplos: WEGE3, MGLU3 (em fase forte), Stone, Magalu nos anos bons.</p>
        </div>
      </div>

      <h2 class="pt__h2 pt__mt">Limitações e Quando NÃO Usar</h2>
      <div class="pt__cards pt__cards--two">
        <div v-for="c in limitCards" :key="c.title" class="pt__card pt__card--negative">
          <h4 class="pt__h4 pt__h4--negative">{{ c.title }}</h4>
          <p class="pt__card-p">{{ c.body }}</p>
        </div>
      </div>
    </section>

    <!-- ============ FAQ (design 2 colunas, 11 perguntas verbatim) ============ -->
    <section class="pt__band pt__band--cream">
      <div class="pt__faq">
        <div class="pt__faq-left">
          <h2 class="pt__h2">Perguntas Frequentes</h2>
          <NuxtLink to="/busca" class="pt__pill">Perguntar à Redentia AI</NuxtLink>
        </div>
        <div class="pt__faq-right">
          <NuFaqAccordion :items="faqItems" />
        </div>
      </div>
    </section>

    <!-- ============ Dicas (texto verbatim) ============ -->
    <section class="pt__band pt__band--white">
      <h2 class="pt__h2">Dicas para Investir com Preço Teto</h2>
      <div class="pt__cards pt__cards--two">
        <div v-for="c in tipCards" :key="c.title" class="pt__card pt__card--cream">
          <h4 class="pt__h4 pt__h4--accent">{{ c.title }}</h4>
          <p class="pt__card-p">{{ c.body }}</p>
        </div>
      </div>
    </section>

    <!-- ============ Rankings + outras ferramentas + CTA ============ -->
    <section class="pt__band pt__band--cream">
      <h2 class="pt__h2">Rankings Relacionados</h2>
      <p class="pt__p pt__p--dek">
        Explore listas atualizadas diariamente com os melhores ativos da B3 para complementar sua análise.
      </p>
      <div class="pt__cards pt__cards--three pt__cards--links">
        <NuxtLink v-for="r in relatedRankings" :key="r.to" :to="r.to" class="pt__card pt__card--link">
          <h3 class="pt__h3 pt__h3--card">{{ r.title }}</h3>
          <p class="pt__card-p">{{ r.sub }}</p>
        </NuxtLink>
      </div>

      <h2 class="pt__h2 pt__mt">Outras Ferramentas</h2>
      <div class="pt__cards pt__cards--two pt__cards--links">
        <NuxtLink to="/calculadora/dividend-yield" class="pt__card pt__card--link">
          <h3 class="pt__h3 pt__h3--card">Calculadora de Dividend Yield</h3>
          <p class="pt__card-p">Calcule DY atual e projetado</p>
        </NuxtLink>
        <NuxtLink to="/calculadora/acoes" class="pt__card pt__card--link">
          <h3 class="pt__h3 pt__h3--card">Simulador de Ações</h3>
          <p class="pt__card-p">Histórico real de investimentos</p>
        </NuxtLink>
      </div>

      <div class="pt__cta">
        <h2 class="pt__cta-title">Analise Ações na Redentia</h2>
        <p class="pt__cta-sub">Acesse dados fundamentalistas em tempo real, compare indicadores e receba análises com IA.</p>
        <div class="pt__cta-actions">
          <NuxtLink to="/login" class="pt__pill pt__pill--light">Criar conta grátis</NuxtLink>
          <NuxtLink to="/mercado" class="pt__pill pt__pill--outline">Ver ações</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ——— hero ——— */
.pt__hero {
  background: var(--nu-cream);
  padding: clamp(48px, 6.5vw, 88px) clamp(22px, 5.5vw, 80px) clamp(40px, 5vw, 64px);
  animation: nu-fade .5s ease both;
}
.pt__status {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  color: var(--nu-gray); font-size: 13.5px; font-weight: 600; margin-bottom: 22px;
}
.pt__back { color: var(--nu-blue); font-weight: 800; }
.pt__back:hover { color: var(--nu-blue-hover); }
.pt__eyebrow { margin: 0; color: var(--nu-blue); font-size: clamp(16px, 1.5vw, 19px); font-weight: 800; }
.pt__h1 {
  margin: 12px 0 0; color: var(--nu-ink);
  font-size: clamp(34px, 4.6vw, 64px); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1.04; max-width: 1080px;
}
.pt__italic { font-style: italic; }
.pt__lead {
  color: var(--nu-gray-2); font-size: clamp(16px, 1.7vw, 19px); font-weight: 500;
  line-height: 1.6; margin: 20px 0 0; max-width: 780px;
}
.pt__lead strong { color: var(--nu-ink); font-weight: 800; }
.pt__chips { list-style: none; display: flex; gap: 10px; flex-wrap: wrap; margin: 26px 0 0; padding: 0; }
.pt__chips li {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--nu-white); border-radius: var(--nu-r-pill);
  padding: 9px 15px; color: var(--nu-ink); font-size: 13.5px; font-weight: 700;
}
.pt__chip-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--nu-blue); flex-shrink: 0; }
.pt__chip-dot--positive { background: var(--nu-green); }

/* ——— controles da calculadora ——— */
.pt__gap { margin-top: 26px; }
.pt__examples { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.pt__examples-label { color: var(--nu-gray); font-size: 14px; font-weight: 700; margin-right: 4px; }
/* chips no MESMO estilo visual do kit (csf__chip do CalcSliderField) */
.pt__chip-btn {
  padding: 8px 14px; border-radius: var(--nu-r-pill);
  font-size: 12.5px; font-weight: 800; white-space: nowrap; cursor: pointer;
  border: 2px solid var(--nu-sand-border); background: var(--nu-white);
  color: var(--nu-gray-2); transition: all .2s;
}
.pt__chip-btn--active { border-color: var(--nu-ink); background: var(--nu-ink); color: var(--nu-white); }
.pt__controls-note { margin: 22px 0 0; color: var(--nu-gray); font-size: 13px; font-weight: 500; line-height: 1.55; }

/* ——— resultado ——— */
.pt__reco {
  display: inline-flex; align-items: center; gap: 12px;
  border-radius: var(--nu-r-pill); padding: 10px 18px; margin-top: 24px;
}
.pt__reco--positive { background: var(--nu-green-bg); }
.pt__reco--positive .pt__reco-value { color: var(--nu-green-2); }
.pt__reco--neutral { background: var(--nu-blue-tint); }
.pt__reco--neutral .pt__reco-value { color: var(--nu-blue); }
.pt__reco--negative { background: var(--nu-red-tint); }
.pt__reco--negative .pt__reco-value { color: var(--nu-red); }
.pt__reco-label { color: var(--nu-gray-2); font-size: 13px; font-weight: 700; }
.pt__reco-value { font-size: 15px; font-weight: 800; }
.pt__reco-explain {
  margin: 14px 0 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500;
  line-height: 1.6; max-width: 640px;
}

.pt__methods {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
  gap: 12px; margin-top: 26px;
}
.pt__method { background: var(--nu-cream); border-radius: var(--nu-r-tile); padding: 18px 20px; }
.pt__method--positive { background: var(--nu-green-bg); }
.pt__method--neutral { background: var(--nu-blue-tint); }
.pt__method--negative { background: var(--nu-red-tint); }
.pt__method-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.pt__method-title { color: var(--nu-ink); font-size: 14px; font-weight: 800; letter-spacing: -.1px; }
.pt__method-badge {
  background: var(--nu-white); border-radius: var(--nu-r-pill);
  padding: 4px 10px; color: var(--nu-gray-2); font-size: 11px; font-weight: 800;
  letter-spacing: .4px; text-transform: uppercase; white-space: nowrap;
}
.pt__method-value {
  margin: 12px 0 0; color: var(--nu-ink); font-size: 24px; font-weight: 800;
  letter-spacing: -.03em; font-variant-numeric: tabular-nums;
}
.pt__method-margin { margin: 4px 0 0; color: var(--nu-gray-2); font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.pt__method-formula { margin: 10px 0 0; color: var(--nu-gray); font-size: 12px; font-weight: 700; }

.pt__bars { margin-top: 28px; max-width: 640px; }
.pt__bar-row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-top: 14px; }
.pt__bar-row:first-child { margin-top: 0; }
.pt__bar-label { color: var(--nu-gray); font-size: 13.5px; font-weight: 700; }
.pt__bar-value { color: var(--nu-ink); font-size: 14px; font-weight: 800; font-variant-numeric: tabular-nums; }
.pt__bar-track {
  height: 10px; border-radius: var(--nu-r-pill); background: var(--nu-sand-2);
  margin-top: 6px; overflow: hidden;
}
.pt__bar-fill { display: block; height: 100%; border-radius: var(--nu-r-pill); transition: width .25s ease; }

.pt__asset-link {
  display: inline-flex; margin-top: 24px;
  color: var(--nu-blue); font-size: 14.5px; font-weight: 800;
}
.pt__asset-link:hover { color: var(--nu-blue-hover); }
.pt__insight {
  background: var(--nu-cream); border-radius: 18px; padding: 18px 22px; margin-top: 20px;
  color: var(--nu-gray-2); font-size: 14px; font-weight: 500; line-height: 1.6;
}
.pt__insight strong { color: var(--nu-ink); font-weight: 800; }

/* ——— bandas ——— */
.pt__band { padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.pt__band--white { background: var(--nu-white); }
.pt__band--cream { background: var(--nu-cream); }
.pt__mt { margin-top: clamp(44px, 6vw, 72px); }

/* ——— tipografia do conteúdo ——— */
.pt__h2 {
  margin: 0; color: var(--nu-ink);
  font-size: clamp(28px, 3.4vw, 44px); font-weight: 800;
  letter-spacing: -0.035em; line-height: 1.08; max-width: 900px;
}
.pt__h2--center { text-align: center; max-width: none; font-size: clamp(32px, 4vw, 54px); letter-spacing: -0.04em; line-height: 1.06; }
.pt__h3 { margin: clamp(28px, 4vw, 44px) 0 0; color: var(--nu-ink); font-size: clamp(20px, 2.2vw, 26px); font-weight: 800; letter-spacing: -.3px; }
.pt__h3--card { margin: 0; font-size: 18px; }
.pt__h4 { margin: 0 0 8px; color: var(--nu-ink); font-size: 16.5px; font-weight: 800; letter-spacing: -.2px; }
.pt__h4--accent { color: var(--nu-blue); }
.pt__h4--negative { color: var(--nu-red); }
.pt__p {
  margin: 14px 0 0; color: var(--nu-gray-3); font-size: 16.5px; font-weight: 500;
  line-height: 1.65; max-width: 840px;
}
.pt__p--dek { color: var(--nu-gray-2); }

/* ——— ações populares ——— */
.pt__tickers {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px; margin-top: clamp(24px, 3.5vw, 36px);
}
.pt__ticker {
  background: var(--nu-white); border-radius: var(--nu-r-tile); padding: 14px 16px;
  display: flex; flex-direction: column; gap: 2px;
  transition: transform .18s, box-shadow .2s;
}
.pt__ticker:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.pt__ticker-code { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; letter-spacing: -.1px; }
.pt__ticker-name { color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }

/* ——— fórmulas ——— */
.pt__formula-wrap { max-width: 720px; margin-top: clamp(18px, 2.5vw, 26px); }
/* termos longos (Dividendo Anual, P/L Médio) — a coluna fixa de 26px do kit
   quebraria; largura automática preserva o texto verbatim sem tocar no kit */
.pt__formula-wrap :deep(.cfc__sym) { width: auto; min-width: 26px; white-space: nowrap; }

/* ——— cards educacionais ——— */
.pt__cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr));
  gap: 16px; margin-top: clamp(20px, 3vw, 28px);
}
.pt__cards--three { grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); }
.pt__card { background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 24px; }
.pt__band--cream .pt__card { background: var(--nu-white); }
.pt__card--cream { background: var(--nu-cream); }
.pt__card--negative { background: var(--nu-red-tint); }
.pt__card--wide { max-width: 840px; margin-top: clamp(20px, 3vw, 28px); }
.pt__card--example { max-width: 840px; margin-top: clamp(20px, 3vw, 28px); }
.pt__card--link { display: flex; flex-direction: column; gap: 6px; transition: transform .18s, box-shadow .2s; }
.pt__card--link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.pt__card-p { margin: 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }
.pt__card .pt__card-p { margin-top: 6px; }
.pt__card-small { margin: 10px 0 0; color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }
.pt__list { margin: 8px 0 0; padding-left: 18px; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.7; }
.pt__ind-list { margin: 0; padding-left: 18px; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.75; }
.pt__ind-list li + li { margin-top: 8px; }
.pt__ind-list strong { color: var(--nu-ink); font-weight: 800; }

/* ——— exemplos práticos ——— */
.pt__ex-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
  gap: 12px; margin-top: 16px;
}
.pt__ex-box { background: var(--nu-white); border-radius: var(--nu-r-input); padding: 14px 16px; }
.pt__band--white .pt__ex-box { background: var(--nu-white); }
.pt__ex-label { margin: 0; color: var(--nu-gray); font-size: 12px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; }
.pt__ex-value { margin: 6px 0 0; color: var(--nu-ink); font-size: 14.5px; font-weight: 700; font-variant-numeric: tabular-nums; }
.pt__result-box { background: var(--nu-blue-tint); border-radius: var(--nu-r-input); padding: 14px 16px; margin-top: 16px; }
.pt__result-box--positive { background: var(--nu-green-tint); }
.pt__result-main { margin: 0; color: var(--nu-blue); font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; }
.pt__result-main--positive { color: var(--nu-green); }
.pt__result-sub { margin: 4px 0 0; color: var(--nu-gray-2); font-size: 12.5px; font-weight: 600; }

/* ——— steps ——— */
.pt__steps { margin-top: clamp(30px, 4vw, 48px); }

/* ——— FAQ 2 colunas (design) ——— */
.pt__faq { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.pt__faq-left { flex: 1 1 300px; min-width: min(280px, 100%); }
.pt__faq-right { flex: 1.6 1 480px; min-width: min(340px, 100%); }
.pt__faq-left .pt__h2 { font-size: clamp(32px, 4vw, 52px); letter-spacing: -0.04em; line-height: 1.06; }
.pt__faq-right :deep(.nfa__item) { background: var(--nu-white); }

/* ——— pills / CTA ——— */
.pt__pill {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.pt__pill:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.pt__cta {
  background: var(--nu-blue); border-radius: var(--nu-r-card-lg);
  padding: clamp(34px, 5vw, 60px); text-align: center; margin-top: clamp(44px, 6vw, 72px);
}
.pt__cta-title { margin: 0; color: var(--nu-white); font-size: clamp(26px, 3.4vw, 44px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.pt__cta-sub { margin: 14px auto 0; color: var(--nu-white-75); font-size: 16px; font-weight: 500; line-height: 1.6; max-width: 560px; }
.pt__cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 26px; }
.pt__cta .pt__pill { margin-top: 0; }
.pt__pill--light { background: var(--nu-cream); color: var(--nu-blue); }
.pt__pill--light:hover { background: var(--nu-white); color: var(--nu-blue-hover); }
.pt__pill--outline { background: transparent; border: 2px solid var(--nu-white-35); color: var(--nu-white); }
.pt__pill--outline:hover { background: var(--nu-white-14); color: var(--nu-white); }

/* breakpoint padrão do app */
@media (max-width: 760px) {
  .pt__methods { grid-template-columns: 1fr 1fr; }
  .pt__method-value { font-size: 20px; }
}
</style>
