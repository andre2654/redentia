<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-6 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6"
    >
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-receipt-text" class="text-secondary size-6" />
        <h2 class="text-xl font-bold text-white">Calcular Imposto de Renda</h2>
      </div>

      <!-- Tipo de Operação -->
      <div class="flex flex-col gap-3">
        <p class="text-sm font-semibold text-white">Tipo de operação:</p>
        <UButtonGroup orientation="horizontal" variant="soft">
          <UButton
            color="neutral"
            :variant="operationType === 'swing' ? 'soft' : 'link'"
            label="Swing Trade"
            @click="operationType = 'swing'"
          />
          <UButton
            color="neutral"
            :variant="operationType === 'day' ? 'soft' : 'link'"
            label="Day Trade"
            @click="operationType = 'day'"
          />
        </UButtonGroup>
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
        color="secondary"
        size="xl"
        block
        icon="i-lucide-calculator"
        @click="calculate"
      >
        Calcular IR
      </UButton>
    </div>

    <div v-if="results" class="flex flex-col gap-6 rounded-[30px] p-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-file-text" class="text-secondary size-6" />
        <h3 class="text-xl font-bold text-white">Resultado do Cálculo</h3>
      </div>

      <!-- IR Devido -->
      <div
        class="rounded-xl border p-6"
        :class="{
          'border-green-500/50 bg-green-500/10': results.taxDue === 0,
          'border-yellow-500/50 bg-yellow-500/10': results.taxDue > 0,
        }"
      >
        <p class="mb-2 text-sm text-gray-400">Imposto de Renda Devido:</p>
        <p class="text-5xl font-bold" :class="results.taxDue === 0 ? 'text-green-400' : 'text-yellow-400'">
          {{ formatCurrency(results.taxDue) }}
        </p>
        <p class="mt-2 text-sm text-gray-300">{{ results.message }}</p>
      </div>

      <!-- Detalhamento -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">Total de Vendas</p>
          <p class="text-xl font-bold text-white">
            {{ formatCurrency(form.totalSales) }}
          </p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">
            {{ form.profitLoss >= 0 ? 'Lucro' : 'Prejuízo' }}
          </p>
          <p
            class="text-xl font-bold"
            :class="form.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'"
          >
            {{ formatCurrency(Math.abs(form.profitLoss)) }}
          </p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">Alíquota</p>
          <p class="text-xl font-bold text-white">
            {{ results.taxRate }}%
          </p>
        </div>
      </div>

      <!-- DARF -->
      <div v-if="results.taxDue > 0" class="rounded-xl border border-secondary/30 bg-secondary/10 p-6">
        <h4 class="mb-4 text-lg font-bold text-white">Informações do DARF</h4>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <p class="mb-1 text-sm text-gray-400">Código DARF</p>
            <p class="text-2xl font-bold text-secondary">{{ results.darfCode }}</p>
          </div>
          <div>
            <p class="mb-1 text-sm text-gray-400">Vencimento</p>
            <p class="text-2xl font-bold text-white">{{ results.dueDate }}</p>
          </div>
          <div>
            <p class="mb-1 text-sm text-gray-400">Valor a Pagar</p>
            <p class="text-2xl font-bold text-secondary">
              {{ formatCurrency(results.taxDue) }}
            </p>
          </div>
          <div>
            <p class="mb-1 text-sm text-gray-400">Período de Apuração</p>
            <p class="text-lg font-semibold text-white">{{ formatMonth(form.month) }}</p>
          </div>
        </div>
        <div class="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
          <p class="text-sm text-gray-300">
            <strong>Como pagar:</strong> Acesse o site da Receita Federal ou seu banco, gere o DARF com o código {{ results.darfCode }}, preencha o valor de {{ formatCurrency(results.taxDue) }} e efetue o pagamento até {{ results.dueDate }}.
          </p>
        </div>
      </div>

      <!-- Compensação de Prejuízos -->
      <div v-if="operationType === 'swing' && results.compensatedLoss > 0" class="rounded-xl border border-blue-500/30 bg-blue-500/10 p-5">
        <h4 class="mb-3 font-semibold text-blue-200">Compensação de Prejuízos</h4>
        <div class="space-y-2 text-sm text-blue-100">
          <p>Prejuízo acumulado compensado: <strong>{{ formatCurrency(results.compensatedLoss) }}</strong></p>
          <p>Novo saldo de prejuízo: <strong>{{ formatCurrency(results.newAccumulatedLoss) }}</strong></p>
        </div>
      </div>

      <!-- Isenção -->
      <div v-if="operationType === 'swing' && results.exempt" class="rounded-xl border border-green-500/30 bg-green-500/10 p-5">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-check-circle" class="text-green-400 size-6 mt-0.5" />
          <div>
            <h4 class="mb-2 font-semibold text-green-200">Isento de IR</h4>
            <p class="text-sm text-green-100">
              Vendas totais abaixo de R$ 20.000 no mês. Você está isento de pagar imposto sobre este lucro, mas ainda precisa declarar no IRPF anual.
            </p>
          </div>
        </div>
      </div>

      <!-- Histórico -->
      <div class="rounded-xl border border-white/10 bg-white/5 p-5">
        <h4 class="mb-4 font-semibold text-white">Como Funciona o IR sobre Ações</h4>
        <div class="space-y-3 text-sm text-gray-300">
          <div class="flex items-start gap-2">
            <UIcon name="i-lucide-info" class="text-secondary size-4 mt-0.5 shrink-0" />
            <div>
              <p class="font-semibold text-white mb-1">Swing Trade (acima de 20k/mês)</p>
              <p>Alíquota de 15% sobre o lucro. Isenção para vendas até R$ 20.000/mês. Prejuízos podem ser compensados nos meses seguintes.</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <UIcon name="i-lucide-info" class="text-secondary size-4 mt-0.5 shrink-0" />
            <div>
              <p class="font-semibold text-white mb-1">Day Trade</p>
              <p>Alíquota de 20% sobre o lucro, sem isenção. Todo lucro é tributado, independente do valor de vendas.</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <UIcon name="i-lucide-calendar" class="text-secondary size-4 mt-0.5 shrink-0" />
            <div>
              <p class="font-semibold text-white mb-1">Vencimento</p>
              <p>DARF deve ser pago até o último dia útil do mês seguinte ao das operações.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Aviso -->
      <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
        <strong>Atenção:</strong> O não pagamento do IR resulta em multa de 0.33% por dia (até 20%) + juros Selic. Declare todas as operações no IRPF anual, mesmo as isentas.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const operationType = ref<'swing' | 'day'>('swing')

const form = ref({
  month: '',
  totalSales: 0,
  profitLoss: 0,
  accumulatedLoss: 0,
})

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
