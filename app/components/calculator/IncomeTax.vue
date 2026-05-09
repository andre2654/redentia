<template>
  <div ref="calcRoot" class="space-y-6">
    <div class="quiet-card flex flex-col gap-6 p-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-receipt-text" class="text-secondary size-6" />
        <h2 class="text-xl">Calcular Imposto de Renda</h2>
      </div>

      <!-- Tipo de Operação -->
      <div class="flex flex-col gap-3">
        <p class="text-sm font-semibold" :style="{ color: 'var(--text-heading)' }">Tipo de operação:</p>
        <AtomsSegmented
          v-model="operationType"
          :options="[
            { value: 'swing', label: 'Swing Trade' },
            { value: 'day', label: 'Day Trade' },
          ]"
          aria-label="Tipo de operação"
        />
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UFormField label="Mês de Referência" name="month">
          <UInput
            v-model="form.month"
            type="month"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Total de Vendas no Mês (R$)" name="totalSales">
          <AtomsFormCurrencyInput
            v-model="form.totalSales"
            placeholder="50000"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Lucro ou Prejuízo (R$)" name="profitLoss">
          <AtomsFormCurrencyInput
            v-model="form.profitLoss"
            placeholder="5000"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField v-if="operationType === 'swing'" label="Prejuízos Acumulados (R$)" name="accumulatedLoss">
          <AtomsFormCurrencyInput
            v-model="form.accumulatedLoss"
            placeholder="0"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>
      </div>

      <UButton
        color="primary"
        size="xl"
        block
        icon="i-lucide-calculator"
        @click="calculate"
      >
        Calcular IR
      </UButton>
    </div>

    <div v-if="results" class="quiet-card flex flex-col gap-6 p-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-file-text" class="text-secondary size-6" />
        <h3 class="text-xl">Resultado do Cálculo</h3>
      </div>

      <!-- IR Devido -->
      <div
        class="rounded-lg border p-6"
        :style="results.taxDue === 0
          ? { borderColor: 'color-mix(in srgb, var(--brand-positive) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-positive) 10%, transparent)' }
          : { borderColor: 'color-mix(in srgb, var(--brand-primary) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }"
      >
        <p class="mb-2 text-sm" :style="{ color: 'var(--text-muted)' }">Imposto de Renda Devido:</p>
        <p
          class="text-5xl font-light tabular-nums"
          :style="{ color: results.taxDue === 0 ? 'var(--brand-positive)' : 'var(--brand-primary)' }"
        >
          {{ formatCurrency(results.taxDue) }}
        </p>
        <p class="mt-2 text-sm" :style="{ color: 'var(--text-body)' }">{{ results.message }}</p>
      </div>

      <!-- Detalhamento -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          class="rounded-lg border p-4"
          :style="{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-overlay)' }"
        >
          <p class="mb-1 text-sm" :style="{ color: 'var(--text-muted)' }">Total de Vendas</p>
          <p class="text-xl tabular-nums" :style="{ color: 'var(--text-heading)' }">
            {{ formatCurrency(form.totalSales) }}
          </p>
        </div>
        <div
          class="rounded-lg border p-4"
          :style="{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-overlay)' }"
        >
          <p class="mb-1 text-sm" :style="{ color: 'var(--text-muted)' }">
            {{ form.profitLoss >= 0 ? 'Lucro' : 'Prejuízo' }}
          </p>
          <p
            class="text-xl tabular-nums"
            :style="{ color: form.profitLoss >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)' }"
          >
            {{ formatCurrency(Math.abs(form.profitLoss)) }}
          </p>
        </div>
        <div
          class="rounded-lg border p-4"
          :style="{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-overlay)' }"
        >
          <p class="mb-1 text-sm" :style="{ color: 'var(--text-muted)' }">Alíquota</p>
          <p class="text-xl tabular-nums" :style="{ color: 'var(--text-heading)' }">
            {{ results.taxRate }}%
          </p>
        </div>
      </div>

      <!-- DARF -->
      <div
        v-if="results.taxDue > 0"
        class="rounded-lg border p-6"
        :style="{ borderColor: 'color-mix(in srgb, var(--brand-secondary) 30%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 10%, transparent)' }"
      >
        <h4 class="mb-4 text-lg font-medium" :style="{ color: 'var(--text-heading)' }">Informações do DARF</h4>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="mb-1 text-sm" :style="{ color: 'var(--text-muted)' }">Código DARF</p>
            <p class="text-2xl tabular-nums text-secondary">{{ results.darfCode }}</p>
          </div>
          <div>
            <p class="mb-1 text-sm" :style="{ color: 'var(--text-muted)' }">Vencimento</p>
            <p class="text-2xl tabular-nums" :style="{ color: 'var(--text-heading)' }">{{ results.dueDate }}</p>
          </div>
          <div>
            <p class="mb-1 text-sm" :style="{ color: 'var(--text-muted)' }">Valor a Pagar</p>
            <p class="text-2xl tabular-nums text-secondary">
              {{ formatCurrency(results.taxDue) }}
            </p>
          </div>
          <div>
            <p class="mb-1 text-sm" :style="{ color: 'var(--text-muted)' }">Período de Apuração</p>
            <p class="text-lg font-medium" :style="{ color: 'var(--text-heading)' }">{{ formatMonth(form.month) }}</p>
          </div>
        </div>
        <div
          class="mt-4 rounded-md border p-4"
          :style="{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-overlay)' }"
        >
          <p class="text-sm" :style="{ color: 'var(--text-body)' }">
            <strong :style="{ color: 'var(--text-heading)' }">Como pagar:</strong> Acesse o site da Receita Federal ou seu banco, gere o DARF com o código {{ results.darfCode }}, preencha o valor de {{ formatCurrency(results.taxDue) }} e efetue o pagamento até {{ results.dueDate }}.
          </p>
        </div>
      </div>

      <!-- Compensação de Prejuízos -->
      <div
        v-if="operationType === 'swing' && results.compensatedLoss > 0"
        class="rounded-lg border p-5"
        :style="{ borderColor: 'color-mix(in srgb, var(--brand-primary) 30%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)' }"
      >
        <h4 class="mb-3 font-medium" :style="{ color: 'var(--brand-primary)' }">Compensação de Prejuízos</h4>
        <div class="space-y-2 text-sm" :style="{ color: 'var(--text-body)' }">
          <p>Prejuízo acumulado compensado: <strong :style="{ color: 'var(--text-heading)' }">{{ formatCurrency(results.compensatedLoss) }}</strong></p>
          <p>Novo saldo de prejuízo: <strong :style="{ color: 'var(--text-heading)' }">{{ formatCurrency(results.newAccumulatedLoss) }}</strong></p>
        </div>
      </div>

      <!-- Isenção -->
      <div
        v-if="operationType === 'swing' && results.exempt"
        class="rounded-lg border p-5"
        :style="{ borderColor: 'color-mix(in srgb, var(--brand-positive) 30%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-positive) 8%, transparent)' }"
      >
        <div class="flex items-start gap-3">
          <UIcon
            name="i-lucide-check-circle"
            class="size-6 mt-0.5"
            :style="{ color: 'var(--brand-positive)' }"
          />
          <div>
            <h4 class="mb-2 font-medium" :style="{ color: 'var(--brand-positive)' }">Isento de IR</h4>
            <p class="text-sm" :style="{ color: 'var(--text-body)' }">
              Vendas totais abaixo de R$ 20.000 no mês. Você está isento de pagar imposto sobre este lucro, mas ainda precisa declarar no IRPF anual.
            </p>
          </div>
        </div>
      </div>

      <!-- Histórico -->
      <div
        class="rounded-lg border p-5"
        :style="{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-overlay)' }"
      >
        <h4 class="mb-4 font-medium" :style="{ color: 'var(--text-heading)' }">Como Funciona o IR sobre Ações</h4>
        <div class="space-y-3 text-sm" :style="{ color: 'var(--text-body)' }">
          <div class="flex items-start gap-2">
            <UIcon name="i-lucide-info" class="text-secondary size-4 mt-0.5 shrink-0" />
            <div>
              <p class="font-medium mb-1" :style="{ color: 'var(--text-heading)' }">Swing Trade (acima de 20k/mês)</p>
              <p>Alíquota de 15% sobre o lucro. Isenção para vendas até R$ 20.000/mês. Prejuízos podem ser compensados nos meses seguintes.</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <UIcon name="i-lucide-info" class="text-secondary size-4 mt-0.5 shrink-0" />
            <div>
              <p class="font-medium mb-1" :style="{ color: 'var(--text-heading)' }">Day Trade</p>
              <p>Alíquota de 20% sobre o lucro, sem isenção. Todo lucro é tributado, independente do valor de vendas.</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <UIcon name="i-lucide-calendar" class="text-secondary size-4 mt-0.5 shrink-0" />
            <div>
              <p class="font-medium mb-1" :style="{ color: 'var(--text-heading)' }">Vencimento</p>
              <p>DARF deve ser pago até o último dia útil do mês seguinte ao das operações.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Aviso -->
      <div
        class="rounded-lg border p-4 text-sm"
        :style="{ borderColor: 'color-mix(in srgb, var(--brand-negative) 25%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-negative) 8%, transparent)', color: 'var(--text-body)' }"
      >
        <strong :style="{ color: 'var(--brand-negative)' }">Atenção:</strong> O não pagamento do IR resulta em multa de 0,33% por dia (até 20%) + juros Selic. Declare todas as operações no IRPF anual, mesmo as isentas.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
