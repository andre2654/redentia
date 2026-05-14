<template>
  <CalcUiShell
    :back-to="backTo"
    :back-label="backLabel"
    :last-updated="lastUpdated"
  >
    <template #hero>
      <slot name="hero">
        <p class="calc-eyebrow">Calculadora · Imposto de Renda</p>
        <h1 class="calc-title">Calculadora de IR sobre Ações</h1>
        <p class="calc-lead">Calcule o imposto devido em operações na B3 (swing/day trade) com DARF e compensação de prejuízos.</p>
      </slot>
    </template>

    <template #form>
      <p class="cui-section-label">{{ results ? 'Ajustar simulação' : 'Configure sua simulação' }}</p>
      <CalcUiField label="Tipo de operação">
        <CalcUiSegmented
          v-model="operationType"
          :options="[
            { value: 'swing', label: 'Swing Trade' },
            { value: 'day', label: 'Day Trade' },
          ]"
          aria-label="Tipo de operação"
        />
      </CalcUiField>

      <div class="grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2">
        <CalcUiField label="Mês de Referência" type="month" v-model="form.month" />
        <CalcUiField label="Total de Vendas no Mês (R$)" type="currency" v-model="form.totalSales" placeholder="50.000,00" />
        <CalcUiField label="Lucro ou Prejuízo (R$)" type="currency" v-model="form.profitLoss" placeholder="5.000,00" />
        <CalcUiField v-if="operationType === 'swing'" label="Prejuízos Acumulados (R$)" type="currency" v-model="form.accumulatedLoss" placeholder="0,00" />
      </div>

      <CalcUiButton label="Calcular IR" icon="i-lucide-sparkles" @click="calculate" />
    </template>

    <template #result>
      <CalcUiResultMega
        v-if="results"
        eyebrow="Imposto de renda devido"
        :value="formatCurrency(results.taxDue)"
        :mega-color="results.taxDue === 0 ? 'positive' : 'primary'"
        :kpis="[
          { label: 'Total de vendas', value: formatCurrency(form.totalSales), color: 'heading' },
          { label: form.profitLoss >= 0 ? 'Lucro' : 'Prejuízo', value: formatCurrency(Math.abs(form.profitLoss)), color: form.profitLoss >= 0 ? 'positive' : 'negative' },
          { label: 'Alíquota', value: `${results.taxRate}%`, color: 'heading' },
        ]"
      >
        <template #caption>{{ results.message }}</template>
      </CalcUiResultMega>
      <div v-else class="cui-result-empty">
        <p class="cui-result-eyebrow">IR devido</p>
        <p class="cui-empty-text">Preencha os dados ao lado e clique em "Calcular IR".</p>
      </div>
    </template>

    <template #chart>
      <div v-if="results" class="flex flex-col gap-4">

      <div v-if="results.taxDue > 0" class="cui-subcard">
        <h4 class="cui-subcard-title">Informações do DARF</h4>
        <div class="cui-subcard-grid cui-subcard-grid--2">
          <CalcUiKpiBox label="Código DARF" :value="results.darfCode" color="primary" />
          <CalcUiKpiBox label="Vencimento" :value="results.dueDate" color="heading" />
          <CalcUiKpiBox label="Valor a Pagar" :value="formatCurrency(results.taxDue)" color="primary" />
          <CalcUiKpiBox label="Período de Apuração" :value="formatMonth(form.month)" color="heading" />
        </div>
        <div class="cui-callout">
          <strong>Como pagar:</strong> Acesse o site da Receita Federal ou seu banco, gere o DARF com o código {{ results.darfCode }}, preencha o valor de {{ formatCurrency(results.taxDue) }} e efetue o pagamento até {{ results.dueDate }}.
        </div>
      </div>

      <div v-if="operationType === 'swing' && results.compensatedLoss > 0" class="cui-subcard">
        <h4 class="cui-subcard-title">Compensação de Prejuízos</h4>
        <p class="cui-subcard-desc">
          Prejuízo acumulado compensado: <strong style="color: var(--text-heading); font-weight: 500">{{ formatCurrency(results.compensatedLoss) }}</strong>
        </p>
        <p class="cui-subcard-desc">
          Novo saldo de prejuízo: <strong style="color: var(--text-heading); font-weight: 500">{{ formatCurrency(results.newAccumulatedLoss) }}</strong>
        </p>
      </div>

      <div v-if="operationType === 'swing' && results.exempt" class="cui-result-status cui-result-status--positive">
        <UIcon name="i-lucide-check-circle" class="cui-result-status-icon" />
        <div>
          <h4 class="cui-result-status-title">Isento de IR</h4>
          <p class="cui-result-status-msg">Vendas totais abaixo de R$ 20.000 no mês. Você está isento de pagar imposto sobre este lucro, mas ainda precisa declarar no IRPF anual.</p>
        </div>
      </div>

      <div class="cui-subcard">
        <h4 class="cui-subcard-title">Como funciona o IR sobre ações</h4>
        <div class="cui-info-list">
          <div class="cui-info-item">
            <UIcon name="i-lucide-info" class="cui-info-icon" />
            <div>
              <p class="cui-info-title">Swing Trade (acima de 20k/mês)</p>
              <p class="cui-info-text">Alíquota de 15% sobre o lucro. Isenção para vendas até R$ 20.000/mês. Prejuízos podem ser compensados nos meses seguintes.</p>
            </div>
          </div>
          <div class="cui-info-item">
            <UIcon name="i-lucide-info" class="cui-info-icon" />
            <div>
              <p class="cui-info-title">Day Trade</p>
              <p class="cui-info-text">Alíquota de 20% sobre o lucro, sem isenção. Todo lucro é tributado, independente do valor de vendas.</p>
            </div>
          </div>
          <div class="cui-info-item">
            <UIcon name="i-lucide-calendar" class="cui-info-icon" />
            <div>
              <p class="cui-info-title">Vencimento</p>
              <p class="cui-info-text">DARF deve ser pago até o último dia útil do mês seguinte ao das operações.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="cui-callout cui-callout--warning">
        <strong>Atenção:</strong> O não pagamento do IR resulta em multa de 0,33% por dia (até 20%) + juros Selic. Declare todas as operações no IRPF anual, mesmo as isentas.
      </div>
      </div>
      <div v-else class="cui-result-empty">
        <p class="cui-chart-label">Detalhes adicionais</p>
        <p class="cui-empty-text">DARF, compensação e tabela de regras aparecem após o cálculo.</p>
      </div>
    </template>
  </CalcUiShell>
</template>

<script setup lang="ts">
defineProps<{
  backTo?: string
  backLabel?: string
  lastUpdated?: string
}>()

const route = useRoute()
const operationType = ref<'swing' | 'day'>('swing')

const form = ref({
  month: '',
  totalSales: 0,
  profitLoss: 0,
  accumulatedLoss: 0,
})

const calcRoot = ref<HTMLElement | null>(null)

function scrollToCalc() {
  if (typeof window === 'undefined') return
  // nextTick garante que o DOM atualizou (form re-renderizou) antes de scrollar
  nextTick(() => {
    calcRoot.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  })
}

// ====================================================================
// Deep-link via query params — abilita URLs canonicas para landings
// virtuais (ex: /calculadora/imposto-renda?type=swing&sales=25000&profit=2000).
// Cada cenario vira indexavel pelo Google sem duplicar a pagina,
// capturando long-tails como "calcular IR day trade R$ 5000",
// "DARF swing trade R$ 25 mil", "IR isencao 20 mil", etc.
//
// Params suportados:
//   ?type=swing|day      tipo de operacao (Swing ou Day Trade)
//   ?sales=25000         total de vendas no mes em R$
//   ?profit=2000         lucro (positivo) ou prejuizo (negativo) em R$
//   ?loss=500            prejuizos acumulados em R$ (so swing)
//   ?month=2026-01       mes de referencia (formato AAAA-MM)
//   ?auto=1              dispara o calculo apos hidratar
// ====================================================================

function parseNumberParam(value: unknown): number | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.trim() === '') return null
  const normalized = raw.replace(',', '.')
  const num = Number(normalized)
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
  const month = parseStringParam(q.month)
  const auto = parseStringParam(q.auto)

  if (type === 'swing' || type === 'day') operationType.value = type
  if (sales !== null) form.value.totalSales = sales
  if (profit !== null) form.value.profitLoss = profit
  if (loss !== null) form.value.accumulatedLoss = loss
  if (month && /^\d{4}-\d{2}$/.test(month)) form.value.month = month

  const hasInputs = sales !== null || profit !== null

  // Se chegou via deep-link com inputs mas sem month, default pro mes
  // anterior ao corrente (mais util pro caso de uso real, calcular o
  // DARF do mes que acabou). Pula essa logica se o usuario abriu sem
  // params, pra nao esconder o campo vazio na primeira visita.
  if (!form.value.month && hasInputs) {
    const now = new Date()
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const yyyy = prevMonth.getFullYear()
    const mm = String(prevMonth.getMonth() + 1).padStart(2, '0')
    form.value.month = `${yyyy}-${mm}`
  }

  const hasMonth = !!form.value.month
  const shouldAutoCalc =
    (hasMonth && hasInputs) || auto === '1' || auto === 'true'

  if (shouldAutoCalc && hasMonth) {
    nextTick(() => calculate())
  }
}

onMounted(() => {
  applyQueryParams()
})

// Re-apply when query changes (user clicked a scenario chip on the same page)
// In this path, ALSO scroll to the calculator so the user sees the result.
// {immediate: false} (default) garante que o scroll do mount inicial não dispare.
watch(
  () => route.query,
  () => {
    applyQueryParams()
    scrollToCalc()
  },
  { deep: true },
)

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

const results = ref<Results | null>(null)

function calculate() {
  const { totalSales, profitLoss, accumulatedLoss } = form.value

  if (!form.value.month) {
    alert('Selecione o mês de referência')
    return
  }

  let taxDue = 0
  let taxRate = 0
  let message = ''
  let exempt = false
  let compensatedLoss = 0
  let newAccumulatedLoss = accumulatedLoss

  if (operationType.value === 'swing') {
    taxRate = 15

    // Verifica isenção (vendas < 20k)
    if (totalSales < 20000) {
      exempt = true
      message = 'Isento de IR - vendas abaixo de R$ 20.000 no mês'
    } else if (profitLoss <= 0) {
      // Prejuízo - acumula para compensação futura
      newAccumulatedLoss += Math.abs(profitLoss)
      message = 'Prejuízo no mês - não há IR a pagar. Prejuízo pode ser compensado nos próximos meses.'
    } else {
      // Lucro - calcula IR com compensação de prejuízos
      let taxableProfit = profitLoss

      if (accumulatedLoss > 0) {
        const toCompensate = Math.min(accumulatedLoss, profitLoss)
        compensatedLoss = toCompensate
        taxableProfit -= toCompensate
        newAccumulatedLoss = accumulatedLoss - toCompensate
      }

      taxDue = taxableProfit * 0.15
      message = taxDue > 0
        ? 'IR devido sobre o lucro do mês'
        : 'Lucro totalmente compensado por prejuízos acumulados'
    }
  } else {
    // Day Trade
    taxRate = 20

    if (profitLoss <= 0) {
      message = 'Prejuízo no mês - não há IR a pagar'
    } else {
      taxDue = profitLoss * 0.20
      message = 'IR devido sobre o lucro de day trade'
    }
  }

  // Calcular vencimento (último dia útil do mês seguinte)
  const dueDate = calculateDueDate(form.value.month)

  results.value = {
    taxDue,
    taxRate,
    message,
    darfCode: operationType.value === 'swing' ? '6015' : '8523',
    dueDate,
    exempt,
    compensatedLoss,
    newAccumulatedLoss,
  }
}

function calculateDueDate(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number)
  // Próximo mês
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  // Último dia do próximo mês
  const lastDay = new Date(nextYear, nextMonth, 0)

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(lastDay)
}

function formatMonth(monthStr: string): string {
  if (!monthStr) return ''
  const [year, month] = monthStr.split('-')
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]
  return `${months[parseInt(month) - 1]}/${year}`
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
</script>
