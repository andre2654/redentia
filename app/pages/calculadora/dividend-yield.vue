<script setup lang="ts">
// /calculadora/dividend-yield — PR10 fase 2.
// Contrato de UX: docs/redentia-nu/designs/Redentia Calculadoras Nu.dc.html
// (card creme de controles + sliders/chips, número-herói, gráfico, steps,
// fórmula, FAQ accordion) — mesma estrutura da referência juros-compostos.
// Contrato de SEO (regra nº1): TODO o texto da página antiga
// (Frontend/app/pages/calculadora/dividend-yield.vue) verbatim, na MESMA
// ordem de tags (h1 → h2/h3/h4 → p → li → tabela → FAQ). Muda o visual.
// Matemática = porte EXATO de Frontend/app/components/calculator/DividendYield.vue
// (3 modos: simples, on cost, projeção). Path antigo preservado.

const route = useRoute()

// ====================================================================
// Estado da calculadora — defaults = exemplos canônicos do conteúdo
// (ação a R$ 25 pagando R$ 1,50/ano; on cost comprou a R$ 20, vale R$ 30;
// projeção LPA 3 / payout 50 / crescimento 10 — placeholders da antiga).
// ====================================================================
type Mode = 'simple' | 'onCost' | 'projection'
const mode = ref<Mode>('simple')

// Simples
const sPrice = ref(25)
const sDiv = ref(1.5)
// On Cost
const ocPurchase = ref(20)
const ocCurrent = ref(30)
const ocDiv = ref(1.5)
// Projeção
const pPrice = ref(25)
const pLpa = ref(3)
const pPayout = ref(50)
const pGrowth = ref(10)

// ====================================================================
// Deep-link via query params — porte do applyQueryParams antigo.
// ?ticker= era pré-seleção da lista de ativos (API do app antigo, não
// portada); os params numéricos + ?mode= seguem funcionando e a
// inferência de modo é idêntica. Reativo — sem ?auto (calcula sempre).
//   ?price= ?dividend=       Modo Simples (price também na Projeção)
//   ?purchase= ?current= ?div=   Modo On Cost
//   ?lpa= ?payout= ?growth=      Modo Projeção
//   ?mode=simple|onCost|projection
// ====================================================================
function parseNumberParam(value: unknown): number | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.trim() === '') return null
  const num = Number(raw.replace(',', '.'))
  return Number.isFinite(num) ? num : null
}
function parseStringParam(value: unknown): string | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.trim() === '') return null
  return raw.trim()
}

function applyQueryParams() {
  const q = route.query
  const price = parseNumberParam(q.price)
  const dividend = parseNumberParam(q.dividend)
  const purchase = parseNumberParam(q.purchase)
  const current = parseNumberParam(q.current)
  const div = parseNumberParam(q.div)
  const lpa = parseNumberParam(q.lpa)
  const payout = parseNumberParam(q.payout)
  const growth = parseNumberParam(q.growth)
  const m = parseStringParam(q.mode)

  // Modo: prioriza ?mode= explícito; senão infere pelos params presentes
  // (mesma regra da página antiga).
  if (m === 'simple' || m === 'onCost' || m === 'projection') {
    mode.value = m
  } else if (purchase !== null || current !== null || div !== null) {
    mode.value = 'onCost'
  } else if (lpa !== null || payout !== null || growth !== null) {
    mode.value = 'projection'
  }

  if (price !== null) {
    sPrice.value = price
    pPrice.value = price
  }
  if (dividend !== null) sDiv.value = dividend
  if (purchase !== null) ocPurchase.value = purchase
  if (current !== null) ocCurrent.value = current
  if (div !== null) ocDiv.value = div
  if (lpa !== null) pLpa.value = lpa
  if (payout !== null) pPayout.value = payout
  if (growth !== null) pGrowth.value = growth
}
applyQueryParams()

// Cenário clicado na própria página → re-aplica e mostra a calculadora.
watch(
  () => route.query,
  () => {
    applyQueryParams()
    if (typeof window !== 'undefined') {
      nextTick(() => document.getElementById('dy')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  },
  { deep: true },
)

// ====================================================================
// Matemática — porte EXATO do calculate() antigo.
// ====================================================================
const simple = computed(() => {
  const dy = (sDiv.value / sPrice.value) * 100
  return { dy }
})
const onCost = computed(() => {
  const dyOnCost = (ocDiv.value / ocPurchase.value) * 100
  const dyCurrent = (ocDiv.value / ocCurrent.value) * 100
  const appreciation = ((ocCurrent.value - ocPurchase.value) / ocPurchase.value) * 100
  const totalReturn = dyOnCost + appreciation
  return { dyOnCost, dyCurrent, appreciation, totalReturn }
})
const projection = computed(() => {
  const currentDividend = pLpa.value * (pPayout.value / 100)
  const currentDY = (currentDividend / pPrice.value) * 100
  const lpa1y = pLpa.value * (1 + pGrowth.value / 100)
  const dividend1y = lpa1y * (pPayout.value / 100)
  const projectedDY1y = (dividend1y / pPrice.value) * 100
  const lpa3y = pLpa.value * Math.pow(1 + pGrowth.value / 100, 3)
  const dividend3y = lpa3y * (pPayout.value / 100)
  const projectedDY3y = (dividend3y / pPrice.value) * 100
  return { currentDY, projectedDY1y, projectedDY3y }
})

// Série da projeção pro gráfico (mesma fórmula generalizada por ano:
// DYₙ = LPA×(1+g)ⁿ×payout ÷ preço — n=1 e n=3 batem com os KPIs).
const PROJ_YEARS = 6
const projSeries = computed(() => {
  const out: number[] = []
  for (let n = 0; n <= PROJ_YEARS; n++) {
    const lpaN = pLpa.value * Math.pow(1 + pGrowth.value / 100, n)
    out.push(((lpaN * (pPayout.value / 100)) / pPrice.value) * 100)
  }
  return out
})
const projXLabels = computed<[string, string, string]>(() => ['hoje', `+${PROJ_YEARS / 2} anos`, `+${PROJ_YEARS} anos`])

// ——— formatação (pt-BR, tabular no CSS) ———
function money(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}
function pct(v: number): string {
  return v.toFixed(2).replace('.', ',') + '%'
}
function pctSigned(v: number): string {
  return (v >= 0 ? '+' : '') + v.toFixed(1).replace('.', ',') + '%'
}

// DY do número-herói por modo (mesmo results.dy da página antiga).
const heroDy = computed(() => {
  if (mode.value === 'simple') return simple.value.dy
  if (mode.value === 'onCost') return onCost.value.dyOnCost
  return projection.value.currentDY
})

const resultCaption = computed(() => {
  if (mode.value === 'simple') return `Com base no preço de ${money(sPrice.value)}, o DY anual é de`
  if (mode.value === 'onCost') return 'Seu retorno anual real considerando seu preço de compra'
  return `Baseado em crescimento de ${String(pGrowth.value).replace('.', ',')}% a.a. do lucro, o DY atual é de`
})

const resultLabel = computed(() => {
  if (mode.value === 'simple') return 'Dividend Yield Atual'
  if (mode.value === 'onCost') return 'Dividend Yield On Cost'
  return 'Projeção de Dividend Yield'
})

const legendItems = computed(() => {
  if (mode.value === 'simple') {
    return [
      { label: 'Preço da ação', value: money(sPrice.value) },
      { label: 'Dividendos anuais', value: money(sDiv.value) },
      { label: 'Dividendos mensais', value: money(sDiv.value / 12), accent: true },
    ]
  }
  if (mode.value === 'onCost') {
    return [
      { dot: 'var(--nu-blue)', label: 'DY no preço de compra', value: pct(onCost.value.dyOnCost), accent: true },
      { dot: 'var(--nu-navy)', label: 'DY no preço atual', value: pct(onCost.value.dyCurrent) },
      { label: 'Valorização', value: pctSigned(onCost.value.appreciation) },
      { label: 'Ganho total anual (DY + valorização)', value: pct(onCost.value.totalReturn), accent: true },
    ]
  }
  return [
    { dot: 'var(--nu-navy)', label: 'DY atual', value: pct(projection.value.currentDY) },
    { dot: 'var(--nu-blue)', label: 'DY projetado (1 ano)', value: pct(projection.value.projectedDY1y), accent: true },
    { label: 'DY projetado (3 anos)', value: pct(projection.value.projectedDY3y) },
  ]
})

// Análise automática — textos verbatim da calculadora antiga.
const analysisText = computed(() => {
  const dy = heroDy.value
  if (dy < 3) return 'DY abaixo de 3% é considerado baixo. Pode indicar empresa de crescimento ou ação cara.'
  if (dy < 6) return 'DY entre 3-6% é considerado bom para ações. Equilibra dividendos e crescimento.'
  if (dy < 10) return 'DY entre 6-10% é excelente! Típico de boas pagadoras de dividendos ou FIIs.'
  return 'DY muito alto (>10%) pode indicar: ação em queda, dividendo extraordinário ou risco elevado. Investigue!'
})

const modeOptions = [
  { value: 'simple' as Mode, label: 'Cálculo Simples' },
  { value: 'onCost' as Mode, label: 'DY On Cost' },
  { value: 'projection' as Mode, label: 'Projeção' },
]

const payoutPresets = [
  { label: 'Ações 40%', value: 40 },
  { label: 'Ações 60%', value: 60 },
  { label: 'FIIs 95%', value: 95 },
]
const growthPresets = [
  { label: '0%', value: 0 },
  { label: '5%', value: 5 },
  { label: '10%', value: 10 },
  { label: '15%', value: 15 },
]

// Data de atualização dinâmica (sinal de frescor — portado da página antiga).
const CONTENT_VERSION = '2026-05-01'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
const lastUpdatedISO = lastUpdated.toISOString()

// Cenários populares — long-tail SEO via deep-links (texto/URLs verbatim).
const popularScenarios = [
  { label: 'DY de ITUB4', sub: 'Banco Itaú', to: '/calculadora/dividend-yield?ticker=ITUB4' },
  { label: 'DY de PETR4', sub: 'Petrobras', to: '/calculadora/dividend-yield?ticker=PETR4' },
  { label: 'DY de BBAS3', sub: 'Banco do Brasil', to: '/calculadora/dividend-yield?ticker=BBAS3' },
  { label: 'DY de TAEE11', sub: 'Taesa, transmissão', to: '/calculadora/dividend-yield?ticker=TAEE11' },
  { label: 'DY de KLBN11', sub: 'Klabin, papel & celulose', to: '/calculadora/dividend-yield?ticker=KLBN11' },
  { label: 'DY de ALOS3', sub: 'Allos, shoppings', to: '/calculadora/dividend-yield?ticker=ALOS3' },
  { label: 'DY de VALE3', sub: 'Vale, mineradora', to: '/calculadora/dividend-yield?ticker=VALE3' },
  { label: 'DY de BBDC4', sub: 'Bradesco', to: '/calculadora/dividend-yield?ticker=BBDC4' },
  { label: 'DY de CMIG4', sub: 'Cemig, energia', to: '/calculadora/dividend-yield?ticker=CMIG4' },
  { label: 'DY de TRPL4', sub: 'ISA Cteep, transmissão', to: '/calculadora/dividend-yield?ticker=TRPL4' },
  { label: 'DY de BRSR6', sub: 'Banrisul', to: '/calculadora/dividend-yield?ticker=BRSR6' },
  { label: 'DY on cost, comprou a R$ 20, vale R$ 30', sub: 'Exemplo clássico', to: '/calculadora/dividend-yield?purchase=20&current=30&div=1.50' },
  { label: 'DY de HGLG11', sub: 'CSHG Logística (FII tijolo)', to: '/calculadora/dividend-yield?ticker=HGLG11' },
  { label: 'DY de KNCR11', sub: 'Kinea Rendimentos (FII papel)', to: '/calculadora/dividend-yield?ticker=KNCR11' },
  { label: 'DY de SNLG11', sub: 'Suno Logística (FII high-yield)', to: '/calculadora/dividend-yield?ticker=SNLG11' },
  { label: 'DY de GGRC11', sub: 'GGR Covepi (FII logística)', to: '/calculadora/dividend-yield?ticker=GGRC11' },
  { label: 'DY de DIVD11', sub: 'Maxi Renda (FII alto yield)', to: '/calculadora/dividend-yield?ticker=DIVD11' },
]

// Média de DY por tipo de ativo (tabela verbatim).
const dyTableRows = [
  ['Ações Blue Chips', '4-8%', 'Bancos, energia, saneamento'],
  ['Ações Growth', '0-3%', 'Reinvestem lucro no crescimento'],
  ['FIIs Tijolo', '8-12%', 'Logística, lajes corporativas, shoppings'],
  ['FIIs Papel', '9-13%', 'CRIs, debêntures'],
  ['Small Caps', '2-6%', 'Foco em crescimento, DY menor'],
  ['ETFs de Dividendos', '6-9%', 'DIVO11, BOVA11 (parcial), FIND11, ETFs internacionais (MSTY com cuidado)'],
]

// Tributação hoje (lista verbatim, com strong via v-html local confiável).
const taxTodayItems = [
  '<strong>Dividendos de ações:</strong> isentos de IR pra pessoa física, sem limite de valor.',
  '<strong>JCP (Juros sobre Capital Próprio):</strong> 15% retidos na fonte, mas a empresa abate como despesa e paga menos IR corporativo, então no agregado costuma valer mais.',
  '<strong>FIIs (Fundos Imobiliários):</strong> dividendos isentos pra pessoa física desde que o FII tenha 50+ cotistas, seja listado em bolsa e o investidor possua menos de 10% das cotas.',
  '<strong>Ganho de capital (vender mais caro do que comprou):</strong> 15% sobre o lucro acima de R$ 20.000/mês de vendas (ações). 20% pra FIIs, sem isenção.',
]

const plChangesItems = [
  'Alíquota efetiva (atual proposta: 10%; pode subir até 15% no Senado).',
  'Faixa de isenção (atual proposta: R$ 50.000/mês; pode cair pra R$ 20.000 ou subir pra R$ 100.000).',
  'Vigência (provável 2027 se aprovado em 2026; o texto exige noventena + anualidade).',
  'Isenção pra FIIs e empresas tributadas pelo Simples Nacional permanece pelo texto atual, mas pode ser revisada em emendas.',
]

const fiiItems = [
  '<strong>FIIs de tijolo:</strong> investem em imóveis físicos (logística, lajes corporativas, shoppings, hospitais). DY típico 8-10%, valor da cota oscila com o ciclo imobiliário.',
  '<strong>FIIs de papel:</strong> investem em CRIs (Certificados de Recebíveis Imobiliários) e debêntures, recebem juros. DY típico 9-13%, mais correlacionado com Selic e CDI.',
]

// Como usar — steps 01-05 (títulos h4 + texto verbatim).
const howToSteps = [
  { title: 'Escolha o Ativo (ou Insira Valores Manualmente)', html: 'Busque por ticker (PETR4, ITUB4, TAEE11) na lista. A calculadora também aceita valores manuais, útil pra ações fora da B3 ou simulações hipotéticas.' },
  { title: 'Veja o DY Atual', html: 'Modo Simples mostra o DY anual com base no preço atual e dividendos dos últimos 12 meses. É o número que você vê em rankings de "melhores pagadoras de dividendos".' },
  { title: 'Calcule o DY On Cost', html: 'Modo On Cost compara o DY atual com o DY no seu preço de compra original. Mostra o "verdadeiro" retorno do investimento, separando dividendos de ganho de capital.' },
  { title: 'Projete o DY Futuro', html: 'Modo Projeção usa LPA, payout ratio e crescimento estimado do lucro pra prever o DY em 1 e 3 anos. Útil pra avaliar se a ação ainda compensa em horizonte longo.' },
  { title: 'Compare com a Média do Setor', html: 'Use a tabela de DY típico por categoria (blue chips, FIIs, growth) pra contextualizar o resultado. DY de 12% num blue chip pode ser sinal de risco, num FII de papel é normal.' },
]

const relatedRankings = [
  { to: '/ranking/maiores-dividend-yield', title: 'Maiores DY da B3', sub: 'Top 50 ações e FIIs por dividend yield' },
  { to: '/ranking/buy-and-hold', title: 'Buy and Hold (score 10)', sub: 'Carteira otimizada pra longo prazo' },
  { to: '/ranking/mais-baratas-bazin', title: 'Mais baratas pelo Bazin', sub: 'Desconto pelo método de Décio Bazin' },
]

// FAQs verbatim da página antiga (12). O FAQPage JSON-LD é emitido pelo
// NuFaqAccordion — fonte única, mesmo padrão do app antigo.
const faqItems = [
  { q: 'Qual é um bom Dividend Yield?', a: 'Para ações: 4-8% é considerado bom no Brasil. Menos de 3% é baixo (típico de empresas growth). Acima de 10% levanta suspeitas, pode ser ação em forte queda ou dividendo extraordinário não recorrente. Para FIIs: 8-12% é a média histórica. FIIs de papel pagam mais (9-13%) que FIIs de tijolo (8-12%). Acima de 13% num FII, investigue se é sustentável (vacância alta, distribuição de receita não recorrente).' },
  { q: 'DY alto é sempre melhor?', a: 'Não. DY muito alto pode indicar três armadilhas: 1) Preço da ação caiu muito por algum problema na empresa (DY virou alto matematicamente, mas o ativo está em crise); 2) Dividendo extraordinário pontual que não vai se repetir (venda de ativo, distribuição de reserva); 3) Payout insustentável, empresa distribui mais do que deveria e vai cortar dividendo no próximo ciclo. Sempre verifique payout ratio, lucro recorrente e dívida líquida antes de comprar por DY alto.' },
  { q: 'O que é Payout Ratio e qual o ideal?', a: 'Payout é a porcentagem do lucro líquido que a empresa distribui em dividendos. Payout = (Dividendos ÷ Lucro Líquido) × 100. Para ações: 40-60% é o ideal (a empresa equilibra dividendos com reinvestimento no negócio). Para FIIs: 95% ou mais é obrigatório por lei (Lei 8.668/93). Payout acima de 80% em ação tradicional é um sinal de alerta, qualquer queda no lucro força um corte do dividendo.' },
  { q: 'Como projetar o Dividend Yield futuro?', a: 'Use a fórmula: DY Futuro = (LPA × Payout × (1 + Crescimento)^n) ÷ Preço Atual. Exemplo: ação a R$ 25, LPA de R$ 3, payout 50%, crescimento de 10% a.a. DY ano 1 = (3 × 1,1 × 0,5) ÷ 25 = 6,6%. DY ano 3 = (3 × 1,1³ × 0,5) ÷ 25 = 8%. DY ano 5 = (3 × 1,1⁵ × 0,5) ÷ 25 = 9,67%. Com crescimento consistente, o DY on cost dispara, é a "máquina de juros" do Bazin.' },
  { q: 'Dividendos têm imposto de renda no Brasil?', a: 'Atualmente, dividendos de ações e FIIs são isentos de IR para pessoa física, é um dos grandes atrativos do mercado brasileiro. Atenção a duas exceções: 1) JCP (Juros sobre Capital Próprio) tem 15% de IR retido na fonte, mas ainda compensa porque a empresa abate como despesa e paga menos IR corporativo; 2) ganho de capital (vender mais caro do que comprou) tem IR de 15% sobre o lucro acima de R$ 20 mil/mês de vendas. Reformas tributárias podem mudar isso, sempre verifique a legislação vigente.' },
  { q: 'Como ficará a tributação de dividendos a partir de 2026?', a: 'O PL 1.087/2025 propõe taxar dividendos pagos a pessoa física acima de R$ 50.000 por mês a 10% retidos na fonte. Investidores que recebem menos não seriam afetados. O PL foi aprovado na Câmara em 2025 e está sendo discutido no Senado. Se aprovado, a vigência mais provável é 2027. FIIs e dividendos pagos por empresas tributadas pelo Simples Nacional ficariam isentos pelo texto atual.' },
  { q: 'Qual a diferença entre FIIs de tijolo e FIIs de papel?', a: 'FIIs de tijolo investem em imóveis físicos (logística, lajes corporativas, shoppings, hospitais) e geram receita via aluguel. DY típico 8-10%, valor da cota oscila com o ciclo imobiliário. FIIs de papel investem em CRIs (Certificados de Recebíveis Imobiliários) e debêntures, recebem juros. DY típico 9-13%, mais correlacionado com Selic e CDI. Uma carteira diversificada costuma ter ambos.' },
  { q: 'Qual a diferença entre DY atual e DY on cost?', a: 'DY atual usa o preço de mercado de hoje. DY on cost usa o seu preço de compra. Exemplo: comprou ITUB4 a R$ 18 quando pagava R$ 1,20/ano. Hoje vale R$ 30 e paga R$ 1,80/ano. DY atual = 1,80÷30 = 6%. DY on cost = 1,80÷18 = 10%. O DY on cost é o seu retorno real e tende a crescer ao longo dos anos enquanto a empresa elevar dividendos. É a métrica que importa pra investidor de longo prazo.' },
  { q: 'DY de FII e DY de ação são comparáveis?', a: 'Em parte. Ambos calculam dividendos sobre preço, mas são instrumentos diferentes. FIIs distribuem aluguéis ou juros recebidos (pago mensalmente, payout ~95%). Ações distribuem parte do lucro corporativo (frequência variável, payout 30-60% típico). FII de papel se compara mais com renda fixa indexada (CDI, IPCA+), enquanto FII de tijolo se compara com aluguel real. Ações de blue chip pagadoras (Itaú, Cemig, Taesa) competem mais com FIIs no perfil de renda passiva. Use sempre DY líquido (após custos) e considere volatilidade.' },
  { q: 'Quantas ações de dividendos preciso pra viver de renda?', a: 'Depende do gasto mensal e DY médio da carteira. Fórmula: Patrimônio = (Gasto Anual ÷ DY líquido). Exemplo: gasto de R$ 8.000/mês = R$ 96.000/ano. Carteira com DY médio de 8% líquido = R$ 1,2 milhão de patrimônio. Se for DY 6% = R$ 1,6 milhão. Se for 10% = R$ 960 mil. Reserve uma margem de segurança (15-20%) pra inflação e cortes pontuais de dividendo. Diversifique em pelo menos 10-15 pagadoras pra reduzir risco específico.' },
  { q: 'Como o crescimento dos dividendos impacta o DY on cost no longo prazo?', a: 'É o multiplicador silencioso. Empresas que aumentam o dividendo todo ano em ~8-10% (ex: Taesa, Itaú histórico) dobram o pagamento a cada 7-9 anos. Comprou ITUB4 a R$ 18 em 2010 com DY 6% (R$ 1,08). Em 2024 paga ~R$ 2,80, DY on cost de 15,5%. Em 20 anos vira 25%+. Por isso o segredo é comprar boas empresas no preço certo e segurar décadas, não capturar DY pontual de 12% que não cresce.' },
  { q: 'Posso usar essa calculadora para qualquer ativo?', a: 'Sim, a fórmula DY = Dividendos ÷ Preço funciona pra qualquer ativo gerador de renda: ações brasileiras, FIIs, ETFs (cuidado com reinvestimento automático), BDRs (cota de empresa estrangeira), até REITs americanos. Para ETFs de dividendos (DIVO11, BOVA11), considere o yield distribuído líquido. Para investimentos no exterior, lembre da tributação local + tratado de bitributação. A calculadora cobre o caso brasileiro padrão; para outros mercados, ajuste o input manualmente.' },
]

usePageSeo({
  title: 'Calculadora de Dividend Yield 2026 - Grátis',
  description:
    'Calcule DY atual, projetado e on cost de qualquer ação ou FII da B3. FIIs com dividendos mensais, tributação 2026, melhores pagadores. Grátis.',
  path: '/calculadora/dividend-yield',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadoras' },
    { name: 'Dividend Yield', path: '/calculadora/dividend-yield' },
  ],
  structuredData: [
    {
      '@type': 'WebApplication',
      name: 'Calculadora de Dividend Yield Redentia',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      dateModified: lastUpdatedISO,
      description:
        'Calculadora gratuita de dividend yield com 3 modos de cálculo: simples (DY atual), on cost (sobre o preço de compra) e projeção (DY futuro com LPA, payout e crescimento). Cobre ações e FIIs da B3 com pré-seleção via URL.',
      featureList: [
        'Cálculo de DY atual em tempo real',
        'DY on cost (rentabilidade sobre o preço de compra)',
        'Projeção de DY em 1 e 3 anos via LPA + payout + crescimento',
        'Busca de tickers da B3 (ações e FIIs)',
        'Análise automática (DY baixo / bom / excelente / suspeito)',
        'Cálculo de dividendos mensais e ganho total anual',
        'Cenários populares pré-preenchidos via URL (deep-link)',
        'Compatível com BDRs, ETFs e REITs (input manual)',
        'Sem cadastro, sem propaganda, gratuito',
      ],
    },
    // FAQPage schema é emitido pelo NuFaqAccordion via useHead — fonte única.
  ],
})
</script>

<template>
  <div>
    <!-- ============ Hero (texto antigo verbatim, visual Nu) ============ -->
    <section class="dy__hero">
      <div class="dy__status">
        <NuxtLink to="/calculadoras" class="dy__back">← Todas as calculadoras</NuxtLink>
        <span aria-hidden>·</span>
        <span>Atualizado {{ lastUpdatedText }}</span>
      </div>
      <p class="dy__eyebrow">Calculadora · Dividend Yield</p>
      <h1 class="dy__h1">
        DY Atual, Projetado e On Cost de Ações e
        <em class="dy__italic">FIIs.</em>
      </h1>
      <p class="dy__lead">
        Dividend Yield (DY) é o percentual de dividendos pagos em relação ao preço da ação: <strong>DY = (Dividendos Anuais ÷ Preço) × 100</strong>. Exemplo: ITUB4 a R$ 28,00 com R$ 1,80 anual tem DY de 6,4%. Considerado bom: 4-8% para ações, 8-12% para FIIs. Esta calculadora mostra DY atual, projetado e on cost (no seu preço de compra).
      </p>
      <ul class="dy__chips">
        <li><span class="dy__chip-dot dy__chip-dot--positive" /> 100% gratuito</li>
        <li><span class="dy__chip-dot" /> Cálculo instantâneo</li>
        <li><span class="dy__chip-dot" /> Ações e FIIs</li>
        <li><span class="dy__chip-dot" /> DY on cost + projeção</li>
      </ul>
    </section>

    <!-- ============ Calculadora interativa (design) ============ -->
    <CalcShell eyebrow="Calculadora" section-id="dy">
      <template #title>Dividend yield.</template>
      <template #controls>
        <div class="dy__modes" role="group" aria-label="Modo de cálculo">
          <button
            v-for="opt in modeOptions"
            :key="opt.value"
            type="button"
            class="dy__mode"
            :class="{ 'dy__mode--active': mode === opt.value }"
            :aria-pressed="mode === opt.value"
            @click="mode = opt.value"
          >{{ opt.label }}</button>
        </div>

        <template v-if="mode === 'simple'">
          <CalcSliderField v-model="sPrice" label="Preço da ação" :min="1" :max="200" :step="0.5" :value-text="money(sPrice)" />
          <div class="dy__gap">
            <CalcSliderField v-model="sDiv" label="Dividendos anuais" :min="0" :max="25" :step="0.05" :value-text="money(sDiv)" />
          </div>
        </template>

        <template v-else-if="mode === 'onCost'">
          <CalcSliderField v-model="ocPurchase" label="Preço de compra" :min="1" :max="200" :step="0.5" :value-text="money(ocPurchase)" />
          <div class="dy__gap">
            <CalcSliderField v-model="ocCurrent" label="Preço atual" :min="1" :max="200" :step="0.5" :value-text="money(ocCurrent)" />
          </div>
          <div class="dy__gap">
            <CalcSliderField v-model="ocDiv" label="Dividendos anuais atuais" :min="0" :max="25" :step="0.05" :value-text="money(ocDiv)" />
          </div>
        </template>

        <template v-else>
          <CalcSliderField v-model="pPrice" label="Preço da ação" :min="1" :max="200" :step="0.5" :value-text="money(pPrice)" />
          <div class="dy__gap">
            <CalcSliderField v-model="pLpa" label="Lucro por ação (LPA)" :min="0" :max="30" :step="0.1" :value-text="money(pLpa)" />
          </div>
          <div class="dy__gap">
            <CalcSliderField v-model="pPayout" label="Payout ratio" :min="0" :max="100" :step="1" :value-text="pPayout + '%'" :presets="payoutPresets" />
          </div>
          <div class="dy__gap">
            <CalcSliderField v-model="pGrowth" label="Crescimento do lucro" :min="-50" :max="100" :step="1" :value-text="pGrowth + '% a.a.'" :presets="growthPresets" />
          </div>
        </template>
      </template>
      <template #result>
        <CalcResultPanel :caption="resultCaption" :value="pct(heroDy)" :items="legendItems">
          <div class="dy__result-label">{{ resultLabel }}</div>
          <div v-if="mode === 'projection'" class="dy__chart">
            <CalcAreaChart :values="projSeries" :x-labels="projXLabels" :format-y="(v: number) => v.toFixed(1).replace('.', ',') + '%'" />
          </div>
          <div class="dy__insight">{{ analysisText }}</div>
          <div class="dy__insight dy__insight--tip">
            <strong>Dica:</strong> Dividend Yield alto não é sempre bom. Verifique se os dividendos são sustentáveis analisando o Payout Ratio (ideal 40-60% para ações, 95%+ para FIIs).
          </div>
        </CalcResultPanel>
      </template>
    </CalcShell>

    <!-- ============ Cenários populares (deep-links, texto verbatim) ============ -->
    <section class="dy__band dy__band--cream">
      <h2 class="dy__h2">Cenários populares de dividend yield</h2>
      <p class="dy__p dy__p--dek">
        Veja na hora o DY dos ativos mais buscados e os cenários on cost mais comuns. Basta clicar e a calculadora carrega já preenchida.
      </p>
      <div class="dy__scenarios">
        <NuxtLink v-for="s in popularScenarios" :key="s.label" :to="s.to" class="dy__scenario">
          <span class="dy__scenario-label">{{ s.label }}</span>
          <span class="dy__scenario-sub">{{ s.sub }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- ============ Conteúdo educacional (texto verbatim) ============ -->
    <section class="dy__band dy__band--white">
      <h2 class="dy__h2">Simulador de dividend yield grátis e online</h2>
      <p class="dy__p">
        Use a calculadora acima para simular o DY de qualquer ação ou FII da B3 em segundos. Ideal pra comparar pagadoras antes de montar a carteira de renda passiva.
      </p>

      <h2 class="dy__h2 dy__mt">O que é Dividend Yield?</h2>
      <p class="dy__p">
        Dividend Yield (DY) é um indicador que mostra quanto uma empresa paga em dividendos em relação ao preço da ação. É expresso em porcentagem anual e é fundamental para quem investe buscando renda passiva.
      </p>

      <div class="dy__formula-wrap">
        <CalcFormulaCard>Dividend Yield = (Dividendos Anuais ÷ Preço da Ação) × 100</CalcFormulaCard>
        <div class="dy__formula-example">
          <p class="dy__p dy__p--center"><strong>Exemplo:</strong> Ação custa R$ 25 e paga R$ 1,50/ano em dividendos</p>
          <p class="dy__p dy__p--center dy__p--accent">DY = (1,50 ÷ 25) × 100 = 6% ao ano</p>
        </div>
      </div>

      <h3 class="dy__h3">DY On Cost, O Verdadeiro Retorno</h3>
      <p class="dy__p">
        DY on cost é o dividend yield calculado sobre o seu preço de compra, não o preço atual. Se você comprou uma ação por R$ 20 e ela vale R$ 30 hoje, mas continua pagando R$ 1,50 de dividendo, seu DY on cost é 7,5% (1,50÷20), não 5% (1,50÷30).
      </p>
      <p class="dy__p">
        Este é o conceito mais importante para investidores de dividendos. Com o tempo, conforme os dividendos crescem e você mantém seu preço de compra baixo, seu DY on cost pode chegar a 10%, 15% ou até 20% ao ano, é a chamada "máquina de juros" defendida por Décio Bazin e Luiz Barsi.
      </p>

      <h2 class="dy__h2 dy__mt">Média de DY por Tipo de Ativo</h2>
      <div class="dy__table-wrap">
        <table class="dy__table">
          <thead>
            <tr><th>Tipo de Ativo</th><th>DY Típico</th><th>Observações</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in dyTableRows" :key="r[0]">
              <td>{{ r[0] }}</td><td class="dy__td--accent">{{ r[1] }}</td><td>{{ r[2] }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="dy__h2 dy__mt">Tributação de Dividendos no Brasil (Lei e Mudanças 2026)</h2>
      <p class="dy__p">
        A tributação de dividendos no Brasil sempre foi um diferencial competitivo: dividendos pagos por empresas listadas a pessoa física são isentos de Imposto de Renda. Essa regra está em discussão no Congresso desde 2025 e pode mudar nos próximos anos. Entender o cenário atual e o que está em tramitação ajuda você a planejar a carteira de dividendos sem ser pego de surpresa.
      </p>

      <h3 class="dy__h3">Como funciona hoje (até 2025 / 2026)</h3>
      <div class="dy__card dy__card--wide">
        <ul class="dy__list">
          <!-- conteúdo local confiável (strong) — eslint-disable-next-line vue/no-v-html -->
          <li v-for="(item, i) in taxTodayItems" :key="i" v-html="item" />
        </ul>
      </div>

      <h3 class="dy__h3">O que pode mudar (PL 1.087/2025)</h3>
      <p class="dy__p">
        O Projeto de Lei 1.087/2025 propõe taxar dividendos pagos a pessoa física acima de R$ 50.000 por mês a 10% retidos na fonte. Pra investidor médio (R$ 5.000 a R$ 10.000/mês de dividendos), a probabilidade de ser afetado é baixa. O PL foi aprovado na Câmara em 2025 e está em apreciação no Senado em 2026. Caso aprovado sem grandes alterações, a vigência mais provável é 2027.
      </p>
      <div class="dy__card dy__card--wide">
        <h4 class="dy__h4 dy__h4--accent">O que pode mudar no texto final</h4>
        <ul class="dy__list">
          <li v-for="(item, i) in plChangesItems" :key="i">{{ item }}</li>
        </ul>
      </div>
      <p class="dy__p">
        Recomendação prática: planeje como se fosse implementar pra não ser pego de surpresa. Concentre parte da carteira em FIIs (isenção mantida), monitore o trâmite no Congresso e tenha em mente que mudanças tributárias do gênero costumam ser graduais (alíquota crescente, faixa de isenção, transição plurianual).
      </p>

      <h3 class="dy__h3">FIIs com Dividendos Mensais</h3>
      <p class="dy__p">
        FIIs (Fundos de Investimento Imobiliário) são o veículo preferido de quem busca dividendos mensais e isenção de IR no Brasil. Por lei, distribuem 95% ou mais do lucro do fundo, geralmente todo mês (até o dia 25). Existem dois grandes blocos com perfis distintos.
      </p>
      <div class="dy__card dy__card--wide">
        <ul class="dy__list">
          <!-- conteúdo local confiável (strong) — eslint-disable-next-line vue/no-v-html -->
          <li v-for="(item, i) in fiiItems" :key="i" v-html="item" />
        </ul>
        <p class="dy__card-p dy__card-p--mt">
          Exemplos com track record consistente: HGLG11 (logística), KNCR11 (papel), MXRF11 (papel), VISC11 (shoppings), HSML11 (shoppings), GGRC11 (logística), DIVD11 (paga DY+ alto), SNLG11 (papel high-yield). Uma carteira diversificada de renda passiva costuma combinar tijolo (proteção real e estabilidade) com papel (yield maior e menor exposição ao ciclo imobiliário).
        </p>
      </div>
    </section>

    <!-- ============ Como usar (steps 01-05 do design, texto verbatim) ============ -->
    <section class="dy__band dy__band--cream">
      <h2 class="dy__h2 dy__h2--center">Como Usar a Calculadora de Dividend Yield</h2>
      <div class="dy__steps"><CalcSteps :steps="howToSteps" /></div>
    </section>

    <!-- ============ FAQ (design 2 colunas, 12 perguntas verbatim) ============ -->
    <section class="dy__band dy__band--white">
      <div class="dy__faq">
        <div class="dy__faq-left">
          <h2 class="dy__h2">Perguntas Frequentes sobre Dividend Yield</h2>
          <NuxtLink to="/busca" class="dy__pill">Perguntar à Redentia AI</NuxtLink>
        </div>
        <div class="dy__faq-right">
          <NuFaqAccordion :items="faqItems" />
        </div>
      </div>
    </section>

    <!-- ============ Rankings + outras ferramentas + E-E-A-T + CTA ============ -->
    <section class="dy__band dy__band--cream">
      <h2 class="dy__h2">Rankings Relacionados</h2>
      <p class="dy__p dy__p--dek">
        Explore listas atualizadas diariamente com os melhores ativos da B3 para complementar sua análise.
      </p>
      <div class="dy__cards dy__cards--links">
        <NuxtLink v-for="r in relatedRankings" :key="r.to" :to="r.to" class="dy__card dy__card--link">
          <h3 class="dy__h3 dy__h3--card">{{ r.title }}</h3>
          <p class="dy__card-p">{{ r.sub }}</p>
        </NuxtLink>
      </div>

      <h2 class="dy__h2 dy__mt">Outras Ferramentas</h2>
      <div class="dy__cards dy__cards--links">
        <NuxtLink to="/calculadora/planejamento" class="dy__card dy__card--link">
          <h3 class="dy__h3 dy__h3--card">Planejamento Patrimonial</h3>
          <p class="dy__card-p">Carteira com foco em dividendos</p>
        </NuxtLink>
        <NuxtLink to="/calculadora/preco-teto" class="dy__card dy__card--link">
          <h3 class="dy__h3 dy__h3--card">Preço Teto</h3>
          <p class="dy__card-p">Veja se a ação está barata</p>
        </NuxtLink>
      </div>

      <aside class="dy__eeat">
        <p class="dy__p">Metodologia revisada pela equipe de análise da Redentia</p>
        <p class="dy__p">
          Cálculos baseados nas fórmulas clássicas de avaliação por dividendos (DY = Dividendos ÷ Preço, DY on cost = Dividendos ÷ Preço de Compra) e referenciam a metodologia de Décio Bazin e Luiz Barsi para análise de pagadoras de dividendos no mercado brasileiro. Os tickers exibidos vêm da B3 em tempo real via API oficial.
        </p>
        <p class="dy__small">
          Fontes: <a href="https://www.b3.com.br" target="_blank" rel="noopener nofollow" class="dy__link">B3 (Brasil, Bolsa, Balcão)</a>,
          <a href="https://www.cvm.gov.br" target="_blank" rel="noopener nofollow" class="dy__link">CVM</a>,
          <a href="https://www.bcb.gov.br" target="_blank" rel="noopener nofollow" class="dy__link">Banco Central do Brasil</a>.
        </p>
      </aside>

      <div class="dy__cta">
        <h2 class="dy__cta-title">Encontre as melhores pagadoras de dividendos</h2>
        <p class="dy__cta-sub">Compare dividend yield de todas as ações e FIIs da B3 em tempo real.</p>
        <div class="dy__cta-actions">
          <NuxtLink to="/ranking/maiores-dividend-yield" class="dy__pill dy__pill--light">Ver ranking de dividendos</NuxtLink>
          <NuxtLink to="/login" class="dy__pill dy__pill--outline">Criar conta grátis</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ——— hero ——— */
.dy__hero {
  background: var(--nu-cream);
  padding: clamp(48px, 6.5vw, 88px) clamp(22px, 5.5vw, 80px) clamp(40px, 5vw, 64px);
  animation: nu-fade .5s ease both;
}
.dy__status {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  color: var(--nu-gray); font-size: 13.5px; font-weight: 600; margin-bottom: 22px;
}
.dy__back { color: var(--nu-blue); font-weight: 800; }
.dy__back:hover { color: var(--nu-blue-hover); }
.dy__eyebrow { margin: 0; color: var(--nu-blue); font-size: clamp(16px, 1.5vw, 19px); font-weight: 800; }
.dy__h1 {
  margin: 12px 0 0; color: var(--nu-ink);
  font-size: clamp(34px, 4.6vw, 64px); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1.04; max-width: 1080px;
}
.dy__italic { font-style: italic; }
.dy__lead {
  color: var(--nu-gray-2); font-size: clamp(16px, 1.7vw, 19px); font-weight: 500;
  line-height: 1.6; margin: 20px 0 0; max-width: 780px;
}
.dy__lead strong { color: var(--nu-ink); font-weight: 800; }
.dy__chips { list-style: none; display: flex; gap: 10px; flex-wrap: wrap; margin: 26px 0 0; padding: 0; }
.dy__chips li {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--nu-white); border-radius: var(--nu-r-pill);
  padding: 9px 15px; color: var(--nu-ink); font-size: 13.5px; font-weight: 700;
}
.dy__chip-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--nu-blue); flex-shrink: 0; }
.dy__chip-dot--positive { background: var(--nu-green); }

/* ——— calculadora: modos + resultado ——— */
.dy__modes { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 26px; }
.dy__mode {
  padding: 9px 15px;
  border-radius: var(--nu-r-pill);
  font-size: 12.5px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
  border: 2px solid var(--nu-sand-border);
  background: var(--nu-white);
  color: var(--nu-gray-2);
  transition: all .2s;
}
.dy__mode--active {
  border-color: var(--nu-ink);
  background: var(--nu-ink);
  color: var(--nu-white);
}
.dy__gap { margin-top: 26px; }
.dy__result-label {
  margin-top: 16px; color: var(--nu-blue);
  font-size: 13px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase;
}
.dy__chart { margin-top: 30px; }
.dy__insight {
  background: var(--nu-cream);
  border-radius: 18px;
  padding: 18px 22px;
  margin-top: 26px;
  color: var(--nu-gray-2);
  font-size: 15.5px;
  font-weight: 500;
  line-height: 1.6;
}
.dy__insight--tip { background: var(--nu-blue-tint); margin-top: 14px; }
.dy__insight strong { color: var(--nu-ink); font-weight: 800; }

/* ——— bandas ——— */
.dy__band { padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.dy__band--white { background: var(--nu-white); }
.dy__band--cream { background: var(--nu-cream); }
.dy__mt { margin-top: clamp(44px, 6vw, 72px); }

/* ——— tipografia do conteúdo ——— */
.dy__h2 {
  margin: 0; color: var(--nu-ink);
  font-size: clamp(28px, 3.4vw, 44px); font-weight: 800;
  letter-spacing: -0.035em; line-height: 1.08; max-width: 900px;
}
.dy__h2--center { text-align: center; max-width: none; font-size: clamp(32px, 4vw, 54px); letter-spacing: -0.04em; line-height: 1.06; }
.dy__h3 { margin: clamp(28px, 4vw, 44px) 0 0; color: var(--nu-ink); font-size: clamp(20px, 2.2vw, 26px); font-weight: 800; letter-spacing: -.3px; }
.dy__h3--card { margin: 0; font-size: 18px; }
.dy__h4 { margin: 0 0 8px; color: var(--nu-ink); font-size: 16.5px; font-weight: 800; letter-spacing: -.2px; }
.dy__h4--accent { color: var(--nu-blue); }
.dy__p {
  margin: 14px 0 0; color: var(--nu-gray-3); font-size: 16.5px; font-weight: 500;
  line-height: 1.65; max-width: 840px;
}
.dy__p--dek { color: var(--nu-gray-2); }
.dy__p--center { text-align: center; max-width: none; }
.dy__p--accent { color: var(--nu-blue); font-weight: 700; margin-top: 4px; font-variant-numeric: tabular-nums; }
.dy__p strong { color: var(--nu-ink); font-weight: 800; }
.dy__small { margin: 12px 0 0; color: var(--nu-gray); font-size: 14px; font-weight: 500; line-height: 1.6; max-width: 840px; }
.dy__link { text-decoration: underline; }
.dy__link:hover { color: var(--nu-blue); }

/* ——— cenários populares ——— */
.dy__scenarios {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px; margin-top: clamp(24px, 3.5vw, 36px);
}
.dy__scenario {
  background: var(--nu-white); border-radius: var(--nu-r-tile); padding: 16px 18px;
  display: flex; flex-direction: column; gap: 3px;
  transition: transform .18s, box-shadow .2s;
}
.dy__scenario:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.dy__scenario-label { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; letter-spacing: -.1px; }
.dy__scenario-sub { color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }

/* ——— cards educacionais ——— */
.dy__cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr));
  gap: 16px; margin-top: clamp(20px, 3vw, 28px);
}
.dy__card { background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 24px; }
.dy__band--cream .dy__card { background: var(--nu-white); }
.dy__card--wide { max-width: 720px; margin-top: clamp(20px, 3vw, 28px); }
.dy__card--link { display: flex; flex-direction: column; gap: 6px; transition: transform .18s, box-shadow .2s; }
.dy__card--link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.dy__card-p { margin: 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }
.dy__card-p--mt { margin-top: 12px; }
.dy__list { margin: 8px 0 0; padding-left: 18px; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.7; }
.dy__list li + li { margin-top: 8px; }
.dy__list :deep(strong) { color: var(--nu-ink); font-weight: 800; }

/* ——— fórmula ——— */
.dy__formula-wrap { max-width: 720px; margin-top: clamp(18px, 2.5vw, 26px); }
.dy__formula-example { margin-top: 14px; }

/* ——— tabelas ——— */
.dy__table-wrap {
  overflow-x: auto; background: var(--nu-cream);
  border-radius: var(--nu-r-panel); margin-top: clamp(20px, 3vw, 28px);
  max-width: 980px;
}
.dy__table { width: 100%; border-collapse: collapse; min-width: 560px; }
.dy__table th {
  text-align: left; padding: 14px 18px;
  color: var(--nu-gray); font-size: 12px; font-weight: 800;
  letter-spacing: .8px; text-transform: uppercase;
  border-bottom: 1.5px solid var(--nu-cream-line-2); white-space: nowrap;
}
.dy__table td {
  padding: 13px 18px; color: var(--nu-gray-3); font-size: 14.5px; font-weight: 600;
  border-bottom: 1.5px solid var(--nu-cream-line-2); font-variant-numeric: tabular-nums;
}
.dy__table tbody tr:last-child td { border-bottom: none; }
.dy__td--accent { color: var(--nu-blue); font-weight: 800; }

/* ——— steps ——— */
.dy__steps { margin-top: clamp(30px, 4vw, 48px); }

/* ——— FAQ 2 colunas (design) ——— */
.dy__faq { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.dy__faq-left { flex: 1 1 300px; min-width: min(280px, 100%); }
.dy__faq-right { flex: 1.6 1 480px; min-width: min(340px, 100%); }
.dy__faq-left .dy__h2 { font-size: clamp(32px, 4vw, 52px); letter-spacing: -0.04em; line-height: 1.06; }

/* ——— pills / E-E-A-T / CTA ——— */
.dy__pill {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.dy__pill:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.dy__eeat {
  background: var(--nu-white); border-radius: var(--nu-r-card-lg);
  padding: clamp(24px, 3vw, 36px); margin-top: clamp(44px, 6vw, 72px); max-width: 980px;
}
.dy__eeat .dy__p:first-child { margin-top: 0; font-weight: 700; color: var(--nu-ink); font-size: 15.5px; }
.dy__eeat .dy__p { font-size: 14.5px; }
.dy__cta {
  background: var(--nu-blue); border-radius: var(--nu-r-card-lg);
  padding: clamp(34px, 5vw, 60px); text-align: center; margin-top: clamp(44px, 6vw, 72px);
}
.dy__cta-title { margin: 0; color: var(--nu-white); font-size: clamp(26px, 3.4vw, 44px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.dy__cta-sub { margin: 14px auto 0; color: var(--nu-white-75); font-size: 16px; font-weight: 500; line-height: 1.6; max-width: 560px; }
.dy__cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 26px; }
.dy__cta .dy__pill { margin-top: 0; }
.dy__pill--light { background: var(--nu-cream); color: var(--nu-blue); }
.dy__pill--light:hover { background: var(--nu-white); color: var(--nu-blue-hover); }
.dy__pill--outline { background: transparent; border: 2px solid var(--nu-white-35); color: var(--nu-white); }
.dy__pill--outline:hover { background: var(--nu-white-14); color: var(--nu-white); }
</style>
