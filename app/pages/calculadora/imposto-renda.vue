<script setup lang="ts">
// /calculadora/imposto-renda — calculadora de IR sobre ações do PR10 (fase 2).
// Contrato de UX: docs/redentia-nu/designs/Redentia Calculadoras Nu.dc.html
// (card creme de controles + número-herói + subcards + steps + FAQ accordion).
// Contrato de SEO (regra nº1): TODO o texto da página antiga
// (Frontend/app/pages/calculadora/imposto-renda.vue + components/calculator/
// IncomeTax.vue) verbatim, na MESMA ordem de tags (h1 → h2/h3/h4 → p → li →
// FAQ). Muda o visual. Path antigo mantido — preserva URL equity.
// Matemática EXATA do IncomeTax.vue antigo (15% swing / 20% day, isenção
// < R$ 20 mil, compensação de prejuízos, DARF 6015/8523, vencimento no
// último dia do mês seguinte).
import { brl } from '~/components/calc/compound-math'

const route = useRoute()

// ====================================================================
// Estado da calculadora — defaults espelham os placeholders da página
// antiga (vendas 50.000, lucro 5.000). Reativa (padrão Nu da fase 1),
// sem botão "Calcular IR".
// ====================================================================
const operationType = ref<'swing' | 'day'>('swing')
const month = ref(defaultMonth())
const totalSales = ref(50000)
const profitLoss = ref(5000)
const accumulatedLoss = ref(0)

// Default pro mês anterior ao corrente (mais útil pro caso de uso real,
// calcular o DARF do mês que acabou) — lógica portada do IncomeTax.vue.
function defaultMonth(): string {
  const now = new Date()
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const yyyy = prevMonth.getFullYear()
  const mm = String(prevMonth.getMonth() + 1).padStart(2, '0')
  return `${yyyy}-${mm}`
}

// ====================================================================
// Deep-link via query params — portado do IncomeTax.vue antigo. Cada
// cenário vira landing virtual indexável (?type=&sales=&profit=&loss=&month=).
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
  const type = parseStringParam(q.type)
  const sales = parseNumberParam(q.sales)
  const profit = parseNumberParam(q.profit)
  const loss = parseNumberParam(q.loss)
  const m = parseStringParam(q.month)

  if (type === 'swing' || type === 'day') operationType.value = type
  if (sales !== null) totalSales.value = sales
  if (profit !== null) profitLoss.value = profit
  if (loss !== null) accumulatedLoss.value = loss
  if (m && /^\d{4}-\d{2}$/.test(m)) month.value = m
}

applyQueryParams()

// Cenário clicado na própria página: re-aplica params e leva o usuário
// pra calculadora (mesmo comportamento da página antiga).
watch(
  () => route.query,
  () => {
    applyQueryParams()
    if (typeof window !== 'undefined') {
      nextTick(() => document.getElementById('ir')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  },
  { deep: true },
)

// ====================================================================
// Matemática — porte EXATO do calculate() do IncomeTax.vue antigo.
// ====================================================================
interface Results {
  taxDue: number
  taxRate: number
  message: string
  darfCode: string
  dueDate: string
  exempt: boolean
  compensatedLoss: number
  newAccumulatedLoss: number
}

const results = computed<Results>(() => {
  const sales = totalSales.value
  const profit = profitLoss.value
  const accLoss = operationType.value === 'swing' ? accumulatedLoss.value : 0

  let taxDue = 0
  let taxRate = 0
  let message = ''
  let exempt = false
  let compensatedLoss = 0
  let newAccumulatedLoss = accLoss

  if (operationType.value === 'swing') {
    taxRate = 15

    // Verifica isenção (vendas < 20k)
    if (sales < 20000) {
      exempt = true
      message = 'Isento de IR - vendas abaixo de R$ 20.000 no mês'
    } else if (profit <= 0) {
      // Prejuízo - acumula para compensação futura
      newAccumulatedLoss += Math.abs(profit)
      message = 'Prejuízo no mês - não há IR a pagar. Prejuízo pode ser compensado nos próximos meses.'
    } else {
      // Lucro - calcula IR com compensação de prejuízos
      let taxableProfit = profit

      if (accLoss > 0) {
        const toCompensate = Math.min(accLoss, profit)
        compensatedLoss = toCompensate
        taxableProfit -= toCompensate
        newAccumulatedLoss = accLoss - toCompensate
      }

      taxDue = taxableProfit * 0.15
      message = taxDue > 0
        ? 'IR devido sobre o lucro do mês'
        : 'Lucro totalmente compensado por prejuízos acumulados'
    }
  } else {
    // Day Trade
    taxRate = 20

    if (profit <= 0) {
      message = 'Prejuízo no mês - não há IR a pagar'
    } else {
      taxDue = profit * 0.20
      message = 'IR devido sobre o lucro de day trade'
    }
  }

  return {
    taxDue,
    taxRate,
    message,
    darfCode: operationType.value === 'swing' ? '6015' : '8523',
    dueDate: month.value ? calculateDueDate(month.value) : '—',
    exempt,
    compensatedLoss,
    newAccumulatedLoss,
  }
})

// Vencimento (último dia útil do mês seguinte) — porte exato.
function calculateDueDate(monthStr: string): string {
  const [year, m] = monthStr.split('-').map(Number)
  const nextMonth = m === 12 ? 1 : (m as number) + 1
  const nextYear = m === 12 ? (year as number) + 1 : (year as number)
  const lastDay = new Date(nextYear, nextMonth, 0)
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(lastDay)
}

function formatMonth(monthStr: string): string {
  if (!monthStr) return '—'
  const [year, m] = monthStr.split('-')
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  return `${months[parseInt(m as string) - 1]}/${year}`
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

// textos dos sliders (formatação compacta do design)
const salesTxt = computed(() => brl(totalSales.value))
const profitTxt = computed(() => (profitLoss.value < 0 ? '−' + brl(Math.abs(profitLoss.value)) : brl(profitLoss.value)))
const accLossTxt = computed(() => brl(accumulatedLoss.value))

const salesPresets = [
  { label: 'R$ 15 mil', value: 15000 },
  { label: 'R$ 20 mil', value: 20000 },
  { label: 'R$ 25 mil', value: 25000 },
  { label: 'R$ 50 mil', value: 50000 },
]

// Data de atualização dinâmica (sinal de frescor — portado da página antiga).
const CONTENT_VERSION = '2026-05-01'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
const lastUpdatedISO = lastUpdated.toISOString()

// Cenários populares — long-tail SEO via deep-links (texto/URLs verbatim).
const popularScenarios = [
  { label: 'Lucro R$ 2.000 swing trade', sub: 'Vendas R$ 25 mil, IR 15%', to: '/calculadora/imposto-renda?type=swing&sales=25000&profit=2000' },
  { label: 'Lucro R$ 5.000 day trade', sub: 'Sem isenção, IR 20%', to: '/calculadora/imposto-renda?type=day&sales=80000&profit=5000' },
  { label: 'Vendas R$ 15.000 (isento)', sub: 'Lucro de R$ 3 mil, sem IR', to: '/calculadora/imposto-renda?type=swing&sales=15000&profit=3000' },
  { label: 'Vendas R$ 25.000 swing', sub: 'Lucro R$ 3 mil, paga IR', to: '/calculadora/imposto-renda?type=swing&sales=25000&profit=3000' },
  { label: 'Compensar prejuízo R$ 1.000', sub: 'Reduz IR no mês seguinte', to: '/calculadora/imposto-renda?type=swing&sales=30000&profit=2000&loss=1000' },
  { label: 'Day trade lucro R$ 10.000', sub: 'IR de R$ 2.000 (20%)', to: '/calculadora/imposto-renda?type=day&sales=120000&profit=10000' },
  { label: 'Swing R$ 50 mil em vendas', sub: 'Lucro R$ 8 mil tributado', to: '/calculadora/imposto-renda?type=swing&sales=50000&profit=8000' },
  { label: 'Prejuízo no mês', sub: 'Acumula pra compensar', to: '/calculadora/imposto-renda?type=swing&sales=30000&profit=-2000' },
  { label: 'Day trade prejuízo R$ 1.500', sub: 'Acumula em gaveta day', to: '/calculadora/imposto-renda?type=day&sales=40000&profit=-1500' },
  { label: 'Isenção exata R$ 20 mil', sub: 'Acima disso, IR sobre tudo', to: '/calculadora/imposto-renda?type=swing&sales=20000&profit=2000' },
]

// Regras principais (texto verbatim dos 2 cards)
const ruleCards = [
  {
    title: 'Swing Trade (Normal)',
    negative: false,
    items: [
      'Alíquota: <strong>15%</strong> sobre o lucro',
      'Isenção: Vendas até <strong>R$ 20.000/mês</strong>',
      'Código DARF: <strong>6015</strong>',
      'Pode compensar prejuízos',
      'Dividendos são isentos',
    ],
  },
  {
    title: 'Day Trade',
    negative: false,
    items: [
      'Alíquota: <strong>20%</strong> sobre o lucro',
      '<strong>Sem isenção</strong> (qualquer valor)',
      'Código DARF: <strong>8523</strong>',
      '1% retido na fonte (crédito no IR)',
      'Mais complexo de controlar',
    ],
  },
]

// Passo a passo do DARF (5 steps verbatim → CalcSteps 01-05)
const darfSteps = [
  { title: 'Separe Swing Trade e Day Trade', html: 'São tributações diferentes (15% e 20%) e gavetas separadas de prejuízos. Calcule cada modalidade isoladamente. A calculadora tem um botão pra trocar entre os dois.' },
  { title: 'Calcule o Lucro do Mês', html: 'Some todas as vendas e subtraia os custos de compra. Inclua corretagem, emolumentos B3 e taxas, eles abatem o lucro tributável.' },
  { title: 'Verifique a Isenção (R$ 20 mil)', html: 'No swing trade, se as vendas totais do mês forem até R$ 20 mil, o lucro é isento de IR. Atenção: a isenção é sobre VENDAS, não sobre lucro. Day trade não tem essa regra.' },
  { title: 'Compense Prejuízos Acumulados', html: 'Se você teve prejuízo em meses anteriores (na mesma modalidade), pode abater do lucro atual antes de calcular o IR. Prejuízo não tem prazo de validade.' },
  { title: 'Gere e Pague o DARF até o Vencimento', html: 'Acesse o Sicalc Web da Receita Federal ou seu banco. Use código 6015 (swing) ou 8523 (day trade). Vencimento é o último dia útil do mês seguinte ao das operações.' },
]

// Erros que caem na malha fina / erros comuns (cards vermelhos verbatim)
const avoidCards = [
  { title: 'Não Controlar as Operações', body: 'Use planilha ou software. Não dá para confiar apenas na memória ou esperar a corretora fazer tudo.' },
  { title: 'Esquecer de Pagar o DARF', body: 'Multa de 0,33% ao dia. Configure lembretes, último dia útil do mês seguinte.' },
  { title: 'Não Declarar Operações Isentas', body: 'Mesmo isento, você DEVE declarar no IRPF anual. Omissão gera malha fina.' },
  { title: 'Misturar Swing e Day Trade', body: 'São tratados separadamente. Prejuízo de um não compensa lucro do outro.' },
]

const relatedRankings = [
  { to: '/ranking/maiores-dividend-yield', title: 'Dividendos isentos de IR', sub: 'Maiores DY pra renda passiva sem IR' },
  { to: '/ranking/maiores-altas-mes', title: 'Maiores altas (planejar venda)', sub: 'Top performers nos últimos 30 dias' },
]

// FAQs verbatim da página antiga (15). O FAQPage JSON-LD é emitido pelo
// NuFaqAccordion — fonte única, mesmo padrão do app antigo.
const faqItems = [
  { q: 'O que acontece se eu não pagar o IR sobre ações?', a: 'Multa de 0,33% por dia de atraso (até o teto de 20%) somada aos juros Selic, mais cair na malha fina do IRPF anual. Em casos graves de omissão dolosa, configura crime contra a ordem tributária (Lei 8.137/90) com pena de 2 a 5 anos de reclusão. Se você esqueceu, pague o DARF em atraso o quanto antes, a multa é menor que sonegar.' },
  { q: 'Como funciona a isenção de R$ 20.000 em vendas?', a: 'Para swing trade, se o total de vendas de ações no mês for até R$ 20.000, o lucro fica isento de IR. Atenção: é sobre VENDAS brutas, não lucro. Se vendeu R$ 19 mil e lucrou R$ 5 mil, está isento. Se vendeu R$ 21 mil e lucrou só R$ 100, paga 15% de IR sobre os R$ 100. Vale por mês fiscal e por modalidade. Day trade NÃO tem essa isenção. Importante: a isenção não vale para FIIs nem ETFs.' },
  { q: 'Posso compensar prejuízos de meses anteriores?', a: 'Sim, e indefinidamente. Prejuízos no swing trade compensam lucros futuros do swing trade (gaveta separada). Prejuízos do day trade compensam lucros do day trade. Não cruzam: prejuízo de swing não abate lucro de day trade. Exemplo: prejuízo de R$ 3 mil em janeiro, lucro de R$ 5 mil em fevereiro = IR de 15% sobre apenas R$ 2 mil = R$ 300. Mantenha controle rigoroso, a Receita exige histórico.' },
  { q: 'Tenho que declarar operações isentas no IRPF?', a: 'Sim, mesmo operações isentas (vendas abaixo de R$ 20 mil) precisam constar no IRPF anual. Você declara: 1) saldo de ações em 31/12 (ficha "Bens e Direitos"); 2) operações realizadas no ano (ficha "Renda Variável"); 3) dividendos recebidos (ficha "Rendimentos Isentos"); 4) prejuízos acumulados (ficha "Prejuízos Acumulados"). A Receita cruza com a declaração das corretoras (e-Financeira), omissão é detectada e cai na malha fina.' },
  { q: 'Corretagem e taxas podem ser deduzidas do lucro?', a: 'Sim. Corretagem, emolumentos B3, taxa de custódia, ISS sobre corretagem e qualquer custo direto da operação são deduzidos do lucro tributável. Mantenha as notas de corretagem organizadas por mês. Exemplo: vendeu por R$ 10.000, comprou por R$ 8.000, pagou R$ 100 em custos totais. Lucro tributável = R$ 10.000 menos R$ 8.000 menos R$ 100, dá R$ 1.900. IR de 15% = R$ 285.' },
  { q: 'Qual a diferença entre swing trade e day trade pra fins de IR?', a: 'Day trade é a operação aberta e fechada no MESMO PREGÃO (mesmo dia, mesma corretora, mesmo ativo). Tudo o mais é swing trade, mesmo que você feche no dia seguinte. Swing: 15% de IR + isenção de R$ 20 mil/mês em vendas + DARF 6015. Day: 20% de IR + sem isenção + DARF 8523 + 1% retido na fonte como antecipação (você abate no DARF). São apurados separadamente, prejuízos não cruzam entre si.' },
  { q: 'Quando vence o DARF de IR sobre ações?', a: 'Último dia útil do mês seguinte ao das operações. Operações de janeiro = DARF vence em 28 de fevereiro (ou último dia útil). Operações de novembro = DARF vence em 31 de dezembro. Se o último dia cair em sábado/domingo/feriado, vai pro próximo dia útil. Atenção em dezembro, se o último dia útil cair antes de 31, conte com isso. Pague antes via Sicalc Web ou no internet banking, sem stress.' },
  { q: 'Como gerar o DARF na prática?', a: 'Três caminhos: 1) Sicalc Web da Receita Federal (gov.br/receitafederal), você preenche código (6015 ou 8523), valor, mês de competência e gera o boleto; 2) app do seu banco (Itaú, Bradesco, Nubank, etc), vá em "Pagar > Tributos" e siga; 3) gerador automático em corretoras (XP, Rico, NuInvest) que já calculam pra você. Use a calculadora desta página pra confirmar o valor antes.' },
  { q: 'IR de FIIs é diferente de IR de ações?', a: 'Sim. FIIs têm dividendos isentos de IR (igual ações), mas o ganho de capital tem alíquota de 20% (não 15%) e SEM isenção dos R$ 20 mil. Toda venda de FII com lucro paga IR de 20% sobre o ganho. Código DARF é 6015 também (mesmo de swing trade de ações), mas a alíquota é diferente. Prejuízos de FII compensam só lucros de FII, não cruzam com ações.' },
  { q: 'IR sobre dividendos: tenho que pagar?', a: 'Atualmente não. Dividendos de ações e FIIs são isentos de IR pra pessoa física no Brasil, é um dos atrativos da bolsa brasileira. Atenção: JCP (Juros sobre Capital Próprio) tem 15% retido na fonte, mas ainda compensa porque a empresa abate como despesa dedutível e paga menos IR corporativo (você recebe líquido, sem mais imposto a recolher). Reformas tributárias podem mudar a regra, sempre cheque a legislação vigente.' },
  { q: 'O que acontece se eu vender ações no exterior?', a: 'Outras regras. Ganho de capital em ações estrangeiras (incluindo BDRs sem regime de fundos) tem alíquota progressiva de 15% a 22,5% conforme o lucro acumulado anual. BDRs negociados na B3 seguem regras de ações brasileiras (15% + isenção). REITs americanos têm dividendos com retenção na fonte de 30% (parte recuperável via tratado), e ganho de capital tributado pela tabela progressiva. Esta calculadora é focada em ações da B3, para o exterior consulte um contador.' },
  { q: 'Como declarar dividendos no IRPF?', a: 'Dividendos são rendimentos isentos. Declare em "Rendimentos Isentos e Não Tributáveis" linha 9 (lucros e dividendos recebidos). JCP entra em "Rendimentos Sujeitos à Tributação Exclusiva" linha 6. Some os valores recebidos durante o ano por empresa, com CNPJ do pagador. Os informes de rendimentos das corretoras já trazem essa separação.' },
  { q: 'FIIs têm IR sobre os dividendos?', a: 'Não. Dividendos mensais de FIIs negociados em bolsa são ISENTOS de IR pra pessoa física, desde que o FII tenha 50+ cotistas e o investidor não detenha mais de 10% das cotas. O ganho de capital na venda da cota tem 20% de IR (sem isenção R$ 20k que vale só pra ações). DARF código 6015.' },
  { q: 'Como funciona o IR sobre criptomoedas no Brasil?', a: 'Vendas até R$ 35.000/mês são isentas. Acima, alíquota progressiva: 15% até R$ 5M, 17,5% até R$ 10M, 20% até R$ 30M, 22,5% acima. DARF código 4600, vence no último dia útil do mês seguinte. Saldo acima de R$ 5.000 em 31/12 deve constar em Bens e Direitos (código 81 BTC, 82 ETH, 89 outras).' },
  { q: 'Como funciona a tributação de dividendos a partir de 2026?', a: 'O PL 1.087/2025 propõe 10% retidos na fonte sobre dividendos pagos a PF acima de R$ 50.000 por mês. Investidores menores não seriam afetados. O PL foi aprovado na Câmara em 2025 e segue em discussão no Senado em 2026. Se aprovado, a vigência mais provável é 2027. FIIs continuam isentos no texto atual.' },
]

usePageSeo({
  title: 'Calculadora de IR sobre Ações 2026 - Day e Swing',
  description:
    'Calcule IR sobre swing trade e day trade. DARF 6015 e 8523, isenção R$ 20k, declaração IRPF, FIIs, criptomoedas, PL dividendos 2026. Grátis.',
  path: '/calculadora/imposto-renda',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadoras' },
    { name: 'Imposto de Renda', path: '/calculadora/imposto-renda' },
  ],
  structuredData: [
    {
      '@type': 'WebApplication',
      name: 'Calculadora de IR sobre Ações Redentia',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      dateModified: lastUpdatedISO,
      description:
        'Calculadora gratuita de IR sobre ações com geração de informações para DARF, compensação de prejuízos acumulados, verificação de isenção de R$ 20 mil/mês em swing trade e cálculo automático do vencimento.',
      featureList: [
        'Cálculo de IR para swing trade (alíquota 15%)',
        'Cálculo de IR para day trade (alíquota 20%)',
        'Verificação automática da isenção de R$ 20 mil/mês',
        'Compensação de prejuízos acumulados em swing trade',
        'Geração de informações para DARF (códigos 6015 e 8523)',
        'Cálculo do vencimento do DARF (último dia útil do mês seguinte)',
        'Cenários populares pré-preenchidos via URL (deep-link)',
        'Cobertura das regras vigentes da Receita Federal',
        'Sem cadastro, sem propaganda, gratuito',
      ],
    },
    // FAQPage schema é emitido pelo <NuFaqAccordion> via useHead — fonte única.
  ],
})
</script>

<template>
  <div>
    <!-- ============ Hero (texto antigo verbatim, visual Nu) ============ -->
    <section class="ir__hero">
      <div class="ir__status">
        <NuxtLink to="/calculadoras" class="ir__back">← Todas as calculadoras</NuxtLink>
        <span aria-hidden>·</span>
        <span>Atualizado {{ lastUpdatedText }}</span>
      </div>
      <p class="ir__eyebrow">Calculadora · IR sobre Ações</p>
      <h1 class="ir__h1">
        Calculadora de IR 2026: Day Trade, Swing Trade e
        <em class="ir__italic">DARF.</em>
      </h1>
      <p class="ir__lead">
        O IR sobre ações no Brasil é <strong>15%</strong> (swing trade) ou <strong>20%</strong> (day trade) sobre o lucro mensal. Vendas até R$ 20.000/mês em swing trade são isentas. Exemplo: vendeu R$ 25.000 com R$ 3.000 de lucro? Paga 15% × R$ 3.000 = R$ 450 via DARF código 6015 até o último dia útil do mês seguinte.
      </p>
      <ul class="ir__chips">
        <li><span class="ir__chip-dot ir__chip-dot--positive" /> 100% gratuito</li>
        <li><span class="ir__chip-dot" /> Cálculo instantâneo</li>
        <li><span class="ir__chip-dot" /> DARF pronto (6015 / 8523)</li>
        <li><span class="ir__chip-dot" /> Compensa prejuízos</li>
      </ul>
    </section>

    <!-- ============ Calculadora interativa (design Nu, matemática antiga) ============ -->
    <CalcShell section-id="ir" eyebrow="Calculadora">
      <template #title>IR sobre ações.</template>
      <template #controls>
        <div class="ir__field-label">Tipo de operação</div>
        <div class="ir__segmented" role="group" aria-label="Tipo de operação">
          <button
            type="button"
            class="ir__seg-btn"
            :class="{ 'ir__seg-btn--active': operationType === 'swing' }"
            @click="operationType = 'swing'"
          >Swing Trade</button>
          <button
            type="button"
            class="ir__seg-btn"
            :class="{ 'ir__seg-btn--active': operationType === 'day' }"
            @click="operationType = 'day'"
          >Day Trade</button>
        </div>

        <div class="ir__gap">
          <label class="ir__field-label" for="ir-month">Mês de Referência</label>
          <input id="ir-month" v-model="month" type="month" class="ir__month">
        </div>

        <div class="ir__gap">
          <CalcSliderField v-model="totalSales" label="Total de Vendas no Mês" :min="0" :max="200000" :step="500" :value-text="salesTxt" :presets="salesPresets" />
        </div>
        <div class="ir__gap">
          <CalcSliderField v-model="profitLoss" label="Lucro ou Prejuízo" :min="-20000" :max="50000" :step="250" :value-text="profitTxt" />
        </div>
        <div v-if="operationType === 'swing'" class="ir__gap">
          <CalcSliderField v-model="accumulatedLoss" label="Prejuízos Acumulados" :min="0" :max="30000" :step="250" :value-text="accLossTxt" />
        </div>
      </template>
      <template #result>
        <div :class="{ 'ir__result--zero': results.taxDue === 0 }">
          <!-- eyebrow da página antiga (CalcUiResultMega) — texto preservado -->
          <p class="ir__result-eyebrow">Imposto de renda devido</p>
          <CalcResultPanel
            :caption="results.message"
            :value="formatCurrency(results.taxDue)"
            :items="[
              { dot: 'var(--nu-navy)', label: 'Total de vendas', value: formatCurrency(totalSales) },
              { dot: profitLoss >= 0 ? 'var(--nu-green)' : 'var(--nu-red)', label: profitLoss >= 0 ? 'Lucro' : 'Prejuízo', value: formatCurrency(Math.abs(profitLoss)) },
              { dot: 'var(--nu-blue)', label: 'Alíquota', value: `${results.taxRate}%`, accent: true },
            ]"
          >
            <div v-if="results.taxDue > 0" class="ir__subcard">
              <h4 class="ir__subcard-title">Informações do DARF</h4>
              <div class="ir__kpis">
                <div class="ir__kpi">
                  <span class="ir__kpi-label">Código DARF</span>
                  <span class="ir__kpi-value ir__kpi-value--accent">{{ results.darfCode }}</span>
                </div>
                <div class="ir__kpi">
                  <span class="ir__kpi-label">Vencimento</span>
                  <span class="ir__kpi-value">{{ results.dueDate }}</span>
                </div>
                <div class="ir__kpi">
                  <span class="ir__kpi-label">Valor a Pagar</span>
                  <span class="ir__kpi-value ir__kpi-value--accent">{{ formatCurrency(results.taxDue) }}</span>
                </div>
                <div class="ir__kpi">
                  <span class="ir__kpi-label">Período de Apuração</span>
                  <span class="ir__kpi-value">{{ formatMonth(month) }}</span>
                </div>
              </div>
              <p class="ir__callout">
                <strong>Como pagar:</strong> Acesse o site da Receita Federal ou seu banco, gere o DARF com o código {{ results.darfCode }}, preencha o valor de {{ formatCurrency(results.taxDue) }} e efetue o pagamento até {{ results.dueDate }}.
              </p>
            </div>

            <div v-if="operationType === 'swing' && results.compensatedLoss > 0" class="ir__subcard">
              <h4 class="ir__subcard-title">Compensação de Prejuízos</h4>
              <p class="ir__subcard-desc">
                Prejuízo acumulado compensado: <strong>{{ formatCurrency(results.compensatedLoss) }}</strong>
              </p>
              <p class="ir__subcard-desc">
                Novo saldo de prejuízo: <strong>{{ formatCurrency(results.newAccumulatedLoss) }}</strong>
              </p>
            </div>

            <div v-if="operationType === 'swing' && results.exempt" class="ir__exempt">
              <h4 class="ir__exempt-title">Isento de IR</h4>
              <p class="ir__exempt-msg">Vendas totais abaixo de R$ 20.000 no mês. Você está isento de pagar imposto sobre este lucro, mas ainda precisa declarar no IRPF anual.</p>
            </div>

            <div class="ir__subcard">
              <h4 class="ir__subcard-title">Como funciona o IR sobre ações</h4>
              <div class="ir__info">
                <div class="ir__info-item">
                  <p class="ir__info-title">Swing Trade (acima de 20k/mês)</p>
                  <p class="ir__info-text">Alíquota de 15% sobre o lucro. Isenção para vendas até R$ 20.000/mês. Prejuízos podem ser compensados nos meses seguintes.</p>
                </div>
                <div class="ir__info-item">
                  <p class="ir__info-title">Day Trade</p>
                  <p class="ir__info-text">Alíquota de 20% sobre o lucro, sem isenção. Todo lucro é tributado, independente do valor de vendas.</p>
                </div>
                <div class="ir__info-item">
                  <p class="ir__info-title">Vencimento</p>
                  <p class="ir__info-text">DARF deve ser pago até o último dia útil do mês seguinte ao das operações.</p>
                </div>
              </div>
            </div>

            <p class="ir__callout ir__callout--warning">
              <strong>Atenção:</strong> O não pagamento do IR resulta em multa de 0,33% por dia (até 20%) + juros Selic. Declare todas as operações no IRPF anual, mesmo as isentas.
            </p>
          </CalcResultPanel>
        </div>
      </template>
    </CalcShell>

    <!-- ============ Cenários populares (deep-links, texto verbatim) ============ -->
    <section class="ir__band ir__band--cream">
      <h2 class="ir__h2">Cenários populares de IR sobre ações</h2>
      <p class="ir__p ir__p--dek">
        Clique em um cenário típico do investidor brasileiro e a calculadora carrega já preenchida com vendas, lucro e tipo de operação.
      </p>
      <div class="ir__scenarios">
        <NuxtLink v-for="s in popularScenarios" :key="s.label" :to="s.to" class="ir__scenario">
          <span class="ir__scenario-label">{{ s.label }}</span>
          <span class="ir__scenario-sub">{{ s.sub }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- ============ Conteúdo educacional (texto verbatim) ============ -->
    <section class="ir__band ir__band--white">
      <h2 class="ir__h2">Simulador de IR sobre ações grátis e online</h2>
      <p class="ir__p">
        Use a calculadora acima para simular o imposto de renda devido em swing trade e day trade em segundos. Ideal pra apurar o DARF do mês antes do vencimento.
      </p>

      <h2 class="ir__h2 ir__mt">Como Funciona o IR sobre Ações no Brasil</h2>
      <p class="ir__p">
        No Brasil, o Imposto de Renda sobre operações com ações segue regras específicas que todo investidor precisa conhecer. O não pagamento resulta em multas pesadas e problemas com a Receita Federal.
      </p>

      <h3 class="ir__h3">Regras Principais</h3>
      <div class="ir__cards ir__cards--two">
        <div v-for="c in ruleCards" :key="c.title" class="ir__card">
          <h4 class="ir__h4 ir__h4--accent">{{ c.title }}</h4>
          <ul class="ir__list">
            <!-- eslint-disable-next-line vue/no-v-html — conteúdo local confiável (strong) -->
            <li v-for="(it, i) in c.items" :key="i" v-html="it" />
          </ul>
        </div>
      </div>

      <h2 class="ir__h2 ir__mt">Tributação de Dividendos: Mudanças com a Nova Lei (PL 1.087/2025)</h2>
      <p class="ir__p">
        A grande dúvida do investidor brasileiro em 2026 é a tributação de dividendos. Vale a pena entender o que vale hoje e o que pode mudar nos próximos anos pra organizar a estratégia da carteira.
      </p>
      <h3 class="ir__h3">Status Atual (vigente em 2026)</h3>
      <p class="ir__p">
        Dividendos de ações e FIIs continuam isentos de IR para pessoa física. JCP (Juros sobre Capital Próprio) tem 15% retidos na fonte, antes do crédito cair na conta. Essa estrutura está em vigor desde 1996 (Lei 9.249/1995) e é um dos atrativos históricos da bolsa brasileira para o investidor pessoa física.
      </p>
      <h3 class="ir__h3">O que o PL 1.087/2025 Propõe</h3>
      <p class="ir__p">
        O Projeto de Lei 1.087/2025 propõe a retenção de 10% na fonte sobre dividendos pagos a pessoa física acima de R$ 50.000 por mês. Investidores que recebem menos do que esse limite mensal por empresa pagadora não seriam afetados na prática. O investidor médio brasileiro, que recebe poucos milhares de reais em dividendos por mês, não entra na regra.
      </p>
      <h3 class="ir__h3">Status Legislativo</h3>
      <p class="ir__p">
        O PL foi aprovado na Câmara dos Deputados em 2025 e segue em apreciação no Senado em 2026. Se aprovado e sancionado neste ano, a vigência mais provável é janeiro de 2027 (pelo princípio da anterioridade nonagesimal e anual aplicável a tributos federais sobre a renda).
      </p>
      <h3 class="ir__h3">Estratégia Possível</h3>
      <p class="ir__p">
        FIIs continuam isentos no texto atual do PL. Concentrar parte da carteira em FIIs que pagam dividendos mensais e em empresas com bom payout via JCP (que já tem retenção, mas a empresa abate como despesa dedutível e paga menos IR corporativo) pode mitigar o impacto futuro caso a regra entre em vigor. Importante: o cenário ainda está em construção e qualquer decisão tributária deve ser revisada conforme a tramitação avança.
      </p>
      <p class="ir__small">
        Aviso: a situação está em evolução. Acompanhe a tramitação no Senado e a sanção presidencial antes de tomar decisões definitivas. Esta calculadora trabalha com as regras vigentes em 2026.
      </p>
    </section>

    <!-- ============ Passo a passo do DARF (steps 01-05 do design, texto verbatim) ============ -->
    <section class="ir__band ir__band--cream">
      <h2 class="ir__h2 ir__h2--center">Passo a Passo para Pagar o DARF</h2>
      <div class="ir__steps"><CalcSteps :steps="darfSteps" /></div>
    </section>

    <!-- ============ Declaração IRPF + FIIs + Cripto (texto verbatim) ============ -->
    <section class="ir__band ir__band--white">
      <h2 class="ir__h2">Como Declarar Suas Ações no IRPF 2026</h2>
      <p class="ir__p">
        Pagar o DARF mensal não substitui a declaração anual no IRPF. A Receita Federal exige a declaração completa de operações em renda variável, mesmo as isentas, e cruza a informação com a e-Financeira das corretoras. Veja o que precisa ser feito:
      </p>
      <h3 class="ir__h3">Quando Você é Obrigado a Declarar</h3>
      <ul class="ir__list ir__list--loose">
        <li>Vendas totais em ações superiores a R$ 40.000 no ano (mesmo que isentas mensalmente).</li>
        <li>Qualquer operação com IR devido (swing trade tributado ou day trade).</li>
        <li>Recebimento de dividendos acima de R$ 200/mês ou demais critérios gerais do IRPF.</li>
        <li>Saldo de ativos em renda variável superior a R$ 1.000 em 31/12.</li>
      </ul>
      <h3 class="ir__h3">Onde Declarar Cada Item</h3>
      <ul class="ir__list ir__list--loose">
        <li><strong>Bens e Direitos (código 31):</strong> ações ordinárias e preferenciais detidas em 31/12.</li>
        <li><strong>Bens e Direitos (código 73):</strong> cotas de FIIs em 31/12.</li>
        <li><strong>Rendimentos Isentos e Não Tributáveis (linha 9):</strong> dividendos recebidos.</li>
        <li><strong>Rendimentos Sujeitos à Tributação Exclusiva (linha 6):</strong> JCP (Juros sobre Capital Próprio).</li>
        <li><strong>Renda Variável (anexo):</strong> operações sujeitas a IR (lucros, prejuízos, IR pago via DARF, IR retido na fonte).</li>
      </ul>
      <h3 class="ir__h3">Ferramentas Oficiais</h3>
      <ul class="ir__list ir__list--loose">
        <li><strong>GCAP:</strong> programa da Receita Federal pra calcular ganho de capital fora da bolsa, gera arquivo que importa direto no IRPF.</li>
        <li><strong>Sicalc Web:</strong> ferramenta oficial para gerar DARF mensal (códigos 6015 e 8523).</li>
        <li><strong>Programa IRPF:</strong> baixe o programa do ano-base 2026 no site da Receita Federal pra preencher e transmitir a declaração.</li>
      </ul>
      <h3 class="ir__h3">Erros Comuns que Caem na Malha Fina</h3>
      <ul class="ir__list ir__list--loose">
        <li>Esquecer de declarar saldo de ações ou FIIs em 31/12 (mesmo se já constava em ano anterior).</li>
        <li>Não somar custos de aquisição (corretagem, emolumentos), inflando o lucro tributado.</li>
        <li>Misturar gavetas de prejuízo (swing trade, day trade, FIIs e criptomoedas têm controles separados).</li>
        <li>Omitir dividendos sob a justificativa de serem isentos. Isenção exige declaração mesmo assim.</li>
        <li>Declarar valor de mercado em vez de custo de aquisição em Bens e Direitos (a regra é custo de aquisição).</li>
      </ul>

      <h2 class="ir__h2 ir__mt">IR sobre FIIs (Fundos Imobiliários)</h2>
      <p class="ir__p">
        Fundos Imobiliários têm regime tributário próprio, diferente das ações. Saber a regra evita pagar imposto a mais ou a menos.
      </p>
      <h3 class="ir__h3">Dividendos Mensais</h3>
      <p class="ir__p">
        Os rendimentos mensais distribuídos pelos FIIs são ISENTOS de IR para pessoa física. Para a isenção valer, o FII precisa atender três condições: cota negociada em bolsa (ou mercado de balcão organizado), ter pelo menos 50 cotistas e o investidor não pode deter mais de 10% do total de cotas.
      </p>
      <h3 class="ir__h3">Ganho de Capital na Venda</h3>
      <p class="ir__p">
        A alíquota é de 20% sobre o lucro da venda da cota (compra menos venda menos custos). NÃO existe a isenção dos R$ 20 mil/mês que vale para ações. Toda venda de FII com lucro paga IR de 20%, mesmo se a venda total do mês for pequena.
      </p>
      <h3 class="ir__h3">Compensação de Prejuízo</h3>
      <p class="ir__p">
        Prejuízo em FII compensa apenas lucro futuro de FII (gaveta separada de ações, ETFs e criptos). A compensação é indefinida no tempo.
      </p>
      <h3 class="ir__h3">Exemplo Prático</h3>
      <p class="ir__p">
        Você comprou 100 cotas de HGLG11 a R$ 150 (custo R$ 15.000) e vendeu por R$ 160 (R$ 16.000). Lucro bruto R$ 1.000. IR devido: 20% × R$ 1.000 = R$ 200. Pague via DARF código 6015 até o último dia útil do mês seguinte. Declare em Bens e Direitos (código 73), Renda Variável e Rendimentos Isentos (dividendos recebidos no ano).
      </p>

      <h2 class="ir__h2 ir__mt">IR sobre Criptomoedas</h2>
      <p class="ir__p">
        Bitcoin, Ethereum e demais criptomoedas têm regime próprio definido pela IN RFB 1.888/2019 e atualizações. Confunde porque parece ações, mas as regras divergem em pontos importantes.
      </p>
      <h3 class="ir__h3">Faixa de Isenção Mensal</h3>
      <p class="ir__p">
        Vendas de criptomoedas até R$ 35.000 por mês (somando todos os ativos) são ISENTAS de IR. Acima desse limite, todo o lucro é tributado.
      </p>
      <h3 class="ir__h3">Alíquotas Progressivas</h3>
      <ul class="ir__list ir__list--loose">
        <li>15% sobre lucro até R$ 5 milhões.</li>
        <li>17,5% sobre lucro entre R$ 5 milhões e R$ 10 milhões.</li>
        <li>20% sobre lucro entre R$ 10 milhões e R$ 30 milhões.</li>
        <li>22,5% sobre lucro acima de R$ 30 milhões.</li>
      </ul>
      <h3 class="ir__h3">DARF e Vencimento</h3>
      <p class="ir__p">
        Use o código DARF 4600. Vencimento é o último dia útil do mês seguinte ao da operação tributável. Não dá pra compensar prejuízo de criptomoedas com lucro de ações nem com FIIs (cada um em sua própria gaveta).
      </p>
      <h3 class="ir__h3">Declaração no IRPF</h3>
      <p class="ir__p">
        Quem teve saldo superior a R$ 5.000 em criptomoedas em 31/12 deve declarar em Bens e Direitos com os códigos: 81 (Bitcoin), 82 (Ethereum) e 89 (demais criptoativos). As corretoras Mercado Bitcoin, Binance, Foxbit e demais geram relatórios anuais de movimentação que ajudam a preencher os campos. Quem opera há mais tempo precisa também observar a obrigação acessória mensal da IN 1.888 quando movimenta acima de R$ 30 mil em uma única exchange.
      </p>
    </section>

    <!-- ============ FAQ (design 2 colunas, 15 perguntas verbatim) ============ -->
    <section class="ir__band ir__band--cream">
      <div class="ir__faq">
        <div class="ir__faq-left">
          <h2 class="ir__h2">Perguntas Frequentes sobre IR de Ações</h2>
          <NuxtLink to="/busca" class="ir__pill">Perguntar à Redentia AI</NuxtLink>
        </div>
        <div class="ir__faq-right">
          <NuFaqAccordion :items="faqItems" />
        </div>
      </div>
    </section>

    <!-- ============ Evite estes erros (texto verbatim) ============ -->
    <section class="ir__band ir__band--white">
      <h2 class="ir__h2">Evite Estes Erros</h2>
      <div class="ir__cards ir__cards--two">
        <div v-for="c in avoidCards" :key="c.title" class="ir__card ir__card--danger">
          <h4 class="ir__h4 ir__h4--negative">{{ c.title }}</h4>
          <p class="ir__card-p">{{ c.body }}</p>
        </div>
      </div>
    </section>

    <!-- ============ Rankings + outras ferramentas + E-E-A-T + CTA ============ -->
    <section class="ir__band ir__band--cream">
      <h2 class="ir__h2">Rankings Relacionados</h2>
      <p class="ir__p ir__p--dek">
        Explore listas atualizadas diariamente com os melhores ativos da B3 para complementar sua análise.
      </p>
      <div class="ir__cards ir__cards--two ir__cards--links">
        <NuxtLink v-for="r in relatedRankings" :key="r.to" :to="r.to" class="ir__card ir__card--link">
          <h3 class="ir__h3 ir__h3--card">{{ r.title }}</h3>
          <p class="ir__card-p">{{ r.sub }}</p>
        </NuxtLink>
      </div>

      <h2 class="ir__h2 ir__mt">Outras Ferramentas</h2>
      <div class="ir__cards ir__cards--two ir__cards--links">
        <NuxtLink to="/calculadora/acoes" class="ir__card ir__card--link">
          <h3 class="ir__h3 ir__h3--card">Simulador de Ações</h3>
          <p class="ir__card-p">Simule investimentos em ações</p>
        </NuxtLink>
        <NuxtLink to="/calculadora/preco-teto" class="ir__card ir__card--link">
          <h3 class="ir__h3 ir__h3--card">Preço Teto</h3>
          <p class="ir__card-p">Descubra se ação está barata</p>
        </NuxtLink>
      </div>

      <aside class="ir__eeat">
        <p class="ir__p">Conteúdo revisado pela equipe de análise da Redentia</p>
        <p class="ir__p">
          Cálculos baseados nas regras vigentes da Receita Federal do Brasil para tributação de ganhos em renda variável (Lei 11.033/2004 e IN RFB 1.585/2015): swing trade com alíquota de 15% e isenção de R$ 20 mil/mês em vendas, day trade com alíquota de 20% sem isenção, vencimento do DARF no último dia útil do mês subsequente.
        </p>
        <p class="ir__small">
          Fontes: <a href="https://www.gov.br/receitafederal" target="_blank" rel="noopener nofollow" class="ir__link">Receita Federal do Brasil</a>,
          <a href="https://www.b3.com.br" target="_blank" rel="noopener nofollow" class="ir__link">B3 (Brasil, Bolsa, Balcão)</a>,
          <a href="https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11033.htm" target="_blank" rel="noopener nofollow" class="ir__link">Lei 11.033/2004</a>.
        </p>
      </aside>

      <div class="ir__cta">
        <h2 class="ir__cta-title">Controle seus investimentos na Redentia</h2>
        <p class="ir__cta-sub">Acompanhe sua carteira, receba alertas e tenha relatórios prontos para o IR.</p>
        <div class="ir__cta-actions">
          <NuxtLink to="/login" class="ir__pill ir__pill--light">Criar conta grátis</NuxtLink>
          <NuxtLink to="/calculadoras" class="ir__pill ir__pill--outline">Ver mais calculadoras</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ——— hero ——— */
.ir__hero {
  background: var(--nu-cream);
  padding: clamp(48px, 6.5vw, 88px) clamp(22px, 5.5vw, 80px) clamp(40px, 5vw, 64px);
  animation: nu-fade .5s ease both;
}
.ir__status {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  color: var(--nu-gray); font-size: 13.5px; font-weight: 600; margin-bottom: 22px;
}
.ir__back { color: var(--nu-blue); font-weight: 800; }
.ir__back:hover { color: var(--nu-blue-hover); }
.ir__eyebrow { margin: 0; color: var(--nu-blue); font-size: clamp(16px, 1.5vw, 19px); font-weight: 800; }
.ir__h1 {
  margin: 12px 0 0; color: var(--nu-ink);
  font-size: clamp(34px, 4.6vw, 64px); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1.04; max-width: 1080px;
}
.ir__italic { font-style: italic; }
.ir__lead {
  color: var(--nu-gray-2); font-size: clamp(16px, 1.7vw, 19px); font-weight: 500;
  line-height: 1.6; margin: 20px 0 0; max-width: 780px;
}
.ir__lead strong { color: var(--nu-ink); font-weight: 800; }
.ir__chips { list-style: none; display: flex; gap: 10px; flex-wrap: wrap; margin: 26px 0 0; padding: 0; }
.ir__chips li {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--nu-white); border-radius: var(--nu-r-pill);
  padding: 9px 15px; color: var(--nu-ink); font-size: 13.5px; font-weight: 700;
}
.ir__chip-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--nu-blue); flex-shrink: 0; }
.ir__chip-dot--positive { background: var(--nu-green); }

/* ——— controles custom (segmented + mês) no estilo do kit ——— */
.ir__field-label { display: block; color: var(--nu-gray); font-size: 14px; font-weight: 700; }
.ir__segmented {
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
  background: var(--nu-white); border-radius: var(--nu-r-pill);
  padding: 5px; margin-top: 12px;
}
.ir__seg-btn {
  border: none; cursor: pointer; background: transparent;
  border-radius: var(--nu-r-pill); padding: 10px 12px;
  color: var(--nu-gray-2); font-size: 13.5px; font-weight: 800;
  transition: all .2s;
}
.ir__seg-btn--active { background: var(--nu-ink); color: var(--nu-white); }
.ir__gap { margin-top: 26px; }
.ir__month {
  display: block; width: 100%; margin-top: 12px;
  background: var(--nu-white); border: 2px solid var(--nu-sand-border);
  border-radius: var(--nu-r-input); padding: 12px 14px;
  color: var(--nu-ink); font-family: inherit; font-size: 15px; font-weight: 700;
  font-variant-numeric: tabular-nums; outline: none; transition: border-color .2s;
}
.ir__month:focus { border-color: var(--nu-blue); }

/* ——— resultado: número-herói verde quando IR = 0 (paridade com o app antigo) ——— */
.ir__result--zero :deep(.crp__value) { color: var(--nu-green); }
.ir__result-eyebrow {
  margin: 0 0 6px; color: var(--nu-gray-2); font-size: 13px; font-weight: 700;
  letter-spacing: .8px; text-transform: uppercase;
}

/* ——— subcards do resultado (DARF, compensação, como funciona) ——— */
.ir__subcard {
  background: var(--nu-cream); border-radius: var(--nu-r-panel);
  padding: 22px 24px; margin-top: 22px;
}
.ir__subcard-title { margin: 0; color: var(--nu-ink); font-size: 16.5px; font-weight: 800; letter-spacing: -.2px; }
.ir__subcard-desc { margin: 10px 0 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }
.ir__subcard-desc strong { color: var(--nu-ink); font-weight: 800; font-variant-numeric: tabular-nums; }
.ir__kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 16px; }
.ir__kpi {
  background: var(--nu-white); border-radius: var(--nu-r-tile);
  padding: 14px 16px; display: flex; flex-direction: column; gap: 4px;
}
.ir__kpi-label { color: var(--nu-gray); font-size: 11.5px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; }
.ir__kpi-value { color: var(--nu-ink); font-size: 18px; font-weight: 800; font-variant-numeric: tabular-nums; letter-spacing: -.2px; }
.ir__kpi-value--accent { color: var(--nu-blue); }
.ir__callout {
  background: var(--nu-blue-tint); border-radius: var(--nu-r-input);
  padding: 14px 16px; margin: 16px 0 0;
  color: var(--nu-gray-3); font-size: 14px; font-weight: 500; line-height: 1.6;
}
.ir__callout strong { color: var(--nu-ink); font-weight: 800; }
.ir__callout--warning { background: var(--nu-amber-bg); margin-top: 22px; }
.ir__callout--warning strong { color: var(--nu-amber-text); }
.ir__exempt {
  background: var(--nu-green-tint); border-radius: var(--nu-r-panel);
  padding: 22px 24px; margin-top: 22px;
}
.ir__exempt-title { margin: 0; color: var(--nu-green-2); font-size: 16.5px; font-weight: 800; }
.ir__exempt-msg { margin: 8px 0 0; color: var(--nu-gray-3); font-size: 14.5px; font-weight: 500; line-height: 1.6; }
.ir__info { display: flex; flex-direction: column; gap: 14px; margin-top: 14px; }
.ir__info-title { margin: 0; color: var(--nu-ink); font-size: 14.5px; font-weight: 800; }
.ir__info-text { margin: 3px 0 0; color: var(--nu-gray-2); font-size: 14px; font-weight: 500; line-height: 1.6; }

/* ——— bandas ——— */
.ir__band { padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.ir__band--white { background: var(--nu-white); }
.ir__band--cream { background: var(--nu-cream); }
.ir__mt { margin-top: clamp(44px, 6vw, 72px); }

/* ——— tipografia do conteúdo ——— */
.ir__h2 {
  margin: 0; color: var(--nu-ink);
  font-size: clamp(28px, 3.4vw, 44px); font-weight: 800;
  letter-spacing: -0.035em; line-height: 1.08; max-width: 900px;
}
.ir__h2--center { text-align: center; max-width: none; font-size: clamp(32px, 4vw, 54px); letter-spacing: -0.04em; line-height: 1.06; }
.ir__h3 { margin: clamp(28px, 4vw, 44px) 0 0; color: var(--nu-ink); font-size: clamp(20px, 2.2vw, 26px); font-weight: 800; letter-spacing: -.3px; }
.ir__h3--card { margin: 0; font-size: 18px; }
.ir__h4 { margin: 0 0 8px; color: var(--nu-ink); font-size: 16.5px; font-weight: 800; letter-spacing: -.2px; }
.ir__h4--accent { color: var(--nu-blue); }
.ir__h4--negative { color: var(--nu-red); }
.ir__p {
  margin: 14px 0 0; color: var(--nu-gray-3); font-size: 16.5px; font-weight: 500;
  line-height: 1.65; max-width: 840px;
}
.ir__p--dek { color: var(--nu-gray-2); }
.ir__small { margin: 12px 0 0; color: var(--nu-gray); font-size: 14px; font-weight: 500; line-height: 1.6; max-width: 840px; }
.ir__link { text-decoration: underline; }
.ir__link:hover { color: var(--nu-blue); }

/* ——— cenários populares ——— */
.ir__scenarios {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px; margin-top: clamp(24px, 3.5vw, 36px);
}
.ir__scenario {
  background: var(--nu-white); border-radius: var(--nu-r-tile); padding: 16px 18px;
  display: flex; flex-direction: column; gap: 3px;
  transition: transform .18s, box-shadow .2s;
}
.ir__scenario:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.ir__scenario-label { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; letter-spacing: -.1px; }
.ir__scenario-sub { color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }

/* ——— cards educacionais ——— */
.ir__cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px; margin-top: clamp(20px, 3vw, 28px);
}
.ir__cards--two { grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr)); }
.ir__card { background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 24px; }
.ir__band--cream .ir__card { background: var(--nu-white); }
.ir__card--danger { background: var(--nu-red-tint); }
.ir__card--link { display: flex; flex-direction: column; gap: 6px; transition: transform .18s, box-shadow .2s; }
.ir__card--link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.ir__card-p { margin: 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }
.ir__card .ir__card-p { margin-top: 6px; }
.ir__list { margin: 8px 0 0; padding-left: 18px; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.7; }
.ir__list :deep(strong), .ir__list strong { color: var(--nu-ink); font-weight: 800; }
.ir__list--loose { margin-top: 14px; max-width: 840px; font-size: 15.5px; color: var(--nu-gray-3); }

/* ——— steps ——— */
.ir__steps { margin-top: clamp(30px, 4vw, 48px); }

/* ——— FAQ 2 colunas (design) ——— */
.ir__faq { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.ir__faq-left { flex: 1 1 300px; min-width: min(280px, 100%); }
.ir__faq-right { flex: 1.6 1 480px; min-width: min(340px, 100%); }
.ir__faq-left .ir__h2 { font-size: clamp(32px, 4vw, 52px); letter-spacing: -0.04em; line-height: 1.06; }
.ir__faq-right :deep(.nfa__item) { background: var(--nu-white); }

/* ——— pills / E-E-A-T / CTA ——— */
.ir__pill {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.ir__pill:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.ir__eeat {
  background: var(--nu-white); border-radius: var(--nu-r-card-lg);
  padding: clamp(24px, 3vw, 36px); margin-top: clamp(44px, 6vw, 72px); max-width: 980px;
}
.ir__eeat .ir__p:first-child { margin-top: 0; font-weight: 700; color: var(--nu-ink); font-size: 15.5px; }
.ir__eeat .ir__p { font-size: 14.5px; }
.ir__cta {
  background: var(--nu-blue); border-radius: var(--nu-r-card-lg);
  padding: clamp(34px, 5vw, 60px); text-align: center; margin-top: clamp(44px, 6vw, 72px);
}
.ir__cta-title { margin: 0; color: var(--nu-white); font-size: clamp(26px, 3.4vw, 44px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.ir__cta-sub { margin: 14px auto 0; color: var(--nu-white-75); font-size: 16px; font-weight: 500; line-height: 1.6; max-width: 560px; }
.ir__cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 26px; }
.ir__cta .ir__pill { margin-top: 0; }
.ir__pill--light { background: var(--nu-cream); color: var(--nu-blue); }
.ir__pill--light:hover { background: var(--nu-white); color: var(--nu-blue-hover); }
.ir__pill--outline { background: transparent; border: 2px solid var(--nu-white-35); color: var(--nu-white); }
.ir__pill--outline:hover { background: var(--nu-white-14); color: var(--nu-white); }
</style>
