<script setup lang="ts">
// Seção interativa da calculadora de aposentadoria. Desde 21/10/2026 (dono:
// "tem algumas que têm MUITA configuração, isso afasta usuário") os dez
// controles viraram uma frase com quatro campos (CalcFraseCampo) e seis
// premissas fechadas (CalcPremissas), no cartão CalcConta, com o "Salvar esta
// conta" à vista e a folha de cadastro subindo uma vez depois de mexer
// (useConviteDaConta). Os cenários "E se…" ficam embaixo do cartão.
// A MATEMÁTICA é porte EXATO de Frontend/app/components/calculator/
// Retirement.vue (acumulação mês a mês com returnRate/12, renda ajustada pela
// inflação mensal, patrimônio necessário = renda líquida anual ÷ taxa de
// fruição, duração do patrimônio via log e 3 cenários alternativos). Aqui a
// simulação é reativa (sem botão), no padrão do design Nu; `seed` pré-preenche
// (deep-links ?age=&retire=&income=… e cenários long-tail).
import { brl } from '~/components/calc/compound-math'

export interface RetirementSeed {
  age?: number
  retire?: number
  life?: number
  income?: number
  wealth?: number
  monthly?: number
  rate?: number
  withdrawal?: number
  inflation?: number
  inss?: number
}

const props = defineProps<{
  seed?: RetirementSeed
  eyebrow?: string
  bg?: 'white' | 'cream'
  sectionId?: string
}>()

// defaults exatos do Retirement.vue antigo
const currentAge = ref(35)
const retirementAge = ref(60)
const lifeExpectancy = ref(85)
const monthlyIncome = ref(5000)
const currentWealth = ref(50000)
const monthlyContribution = ref(2000)
const returnRate = ref(10)
const withdrawalRate = ref(6)
const inflation = ref(4)
const inss = ref(0)

watch(
  () => props.seed,
  (s) => {
    if (!s) return
    if (Number.isFinite(s.age)) currentAge.value = s.age as number
    if (Number.isFinite(s.retire)) retirementAge.value = s.retire as number
    if (Number.isFinite(s.life)) lifeExpectancy.value = s.life as number
    if (Number.isFinite(s.income)) monthlyIncome.value = s.income as number
    if (Number.isFinite(s.wealth)) currentWealth.value = s.wealth as number
    if (Number.isFinite(s.monthly)) monthlyContribution.value = s.monthly as number
    if (Number.isFinite(s.rate)) returnRate.value = s.rate as number
    if (Number.isFinite(s.withdrawal)) withdrawalRate.value = s.withdrawal as number
    if (Number.isFinite(s.inflation)) inflation.value = s.inflation as number
    if (Number.isFinite(s.inss)) inss.value = s.inss as number
  },
  { immediate: true, deep: true },
)

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

// presets do design (mesmos do kit de juros compostos)
const ratePresets = [
  { label: 'Poupança 6,17%', value: 6.17 },
  { label: 'CDI 10,75%', value: 10.75 },
  { label: 'IPCA+ 11,48%', value: 11.48 },
  { label: 'Ações 14%', value: 14 },
]

interface Results {
  viable: boolean
  message: string
  yearsToRetirement: number
  projectedWealth: number
  requiredWealth: number
  totalInvested: number
  adjustedIncome: number
  wealthDuration: number
  series: number[]
  investedSeries: number[]
  scenarios: {
    work3More: number
    increase20Percent: number
    reduce20Percent: number
  }
}

// porte exato de calculateScenario() do Retirement.vue antigo
function calculateScenario(years: number, contribution: number): number {
  const monthlyReturn = returnRate.value / 100 / 12
  const months = years * 12
  const pmt = contribution || monthlyContribution.value
  let wealth = currentWealth.value
  for (let month = 0; month < months; month++) {
    wealth = wealth * (1 + monthlyReturn) + pmt
  }
  return wealth
}

// porte exato de calculate() do Retirement.vue antigo (reativo, sem botão)
const results = computed<Results | null>(() => {
  if (retirementAge.value <= currentAge.value) return null

  const yearsToRetirement = retirementAge.value - currentAge.value
  const monthsToRetirement = yearsToRetirement * 12
  const monthlyReturn = returnRate.value / 100 / 12
  const monthlyInflation = inflation.value / 100 / 12

  let wealth = currentWealth.value
  let totalInvested = currentWealth.value
  const series: number[] = [wealth]
  const investedSeries: number[] = [totalInvested]

  for (let month = 0; month < monthsToRetirement; month++) {
    wealth = wealth * (1 + monthlyReturn) + monthlyContribution.value
    totalInvested += monthlyContribution.value
    if ((month + 1) % 12 === 0) {
      series.push(wealth)
      investedSeries.push(totalInvested)
    }
  }

  const adjustedIncome = monthlyIncome.value * Math.pow(1 + monthlyInflation, monthsToRetirement)
  const netIncome = adjustedIncome - inss.value
  const requiredWealth = (netIncome * 12) / (withdrawalRate.value / 100)

  const viable = wealth >= requiredWealth
  const gap = requiredWealth - wealth
  const gapPercent = (gap / requiredWealth) * 100

  let message = ''
  if (viable) {
    message = `Seu patrimônio projetado supera o necessário em ${formatCurrency(wealth - requiredWealth)}`
  } else if (gapPercent <= 20) {
    message = `Falta ${formatCurrency(gap)} (${gapPercent.toFixed(1)}%). Pequenos ajustes podem viabilizar.`
  } else {
    message = `Gap significativo de ${formatCurrency(gap)} (${gapPercent.toFixed(1)}%). Considere aumentar aportes ou estender prazo.`
  }

  // Duração: meses que o patrimônio dura na fase de fruição
  const monthlyWithdrawal = adjustedIncome - inss.value
  const fruitionMonths = wealth > 0 && monthlyWithdrawal > 0
    ? Math.floor(Math.log(1 - (wealth * (withdrawalRate.value / 100 / 12)) / -monthlyWithdrawal) / Math.log(1 + withdrawalRate.value / 100 / 12))
    : 0
  const wealthDuration = Math.min(Math.floor(fruitionMonths / 12), lifeExpectancy.value - retirementAge.value)

  return {
    viable,
    message,
    yearsToRetirement,
    projectedWealth: wealth,
    requiredWealth,
    totalInvested,
    adjustedIncome,
    wealthDuration,
    series,
    investedSeries,
    scenarios: {
      work3More: calculateScenario(retirementAge.value + 3 - currentAge.value, monthlyContribution.value),
      increase20Percent: calculateScenario(yearsToRetirement, monthlyContribution.value * 1.2),
      reduce20Percent: (monthlyIncome.value * 0.8 * 12) / (withdrawalRate.value / 100),
    },
  }
})


/* ——— a frase (21/10/2026) ———
   As quatro respostas que mudam a conta ficam na frase; o resto vai para as
   premissas, já preenchido. Nada muda na matemática acima. */
const CAMINHO = '/calculadora/aposentadoria'
const PADRAO = { life: 85, wealth: 50000, rate: 10, withdrawal: 6, inflation: 4, inss: 0 }
const idadesAtalho = [55, 60, 62, 65].map((v) => ({ label: String(v), value: v }))
const rendaAtalho = [3000, 5000, 10000, 20000].map((v) => ({ label: brl(v), value: v }))
const aporteAtalho = [500, 1000, 2000, 5000].map((v) => ({ label: brl(v), value: v }))
const pct = (v: number) => `${String(v).replace('.', ',')}%`

const sobra = computed(() => (results.value ? results.value.projectedWealth - results.value.requiredWealth : 0))
const selo = computed(() => {
  const r = results.value
  if (!r) return ''
  if (r.viable) return `✓ ${formatCurrency(sobra.value)} acima do que você precisa`
  const falta = r.requiredWealth - r.projectedWealth
  return `Faltam ${formatCurrency(falta)} (${String(((falta / r.requiredWealth) * 100).toFixed(1)).replace('.', ',')}%)`
})
const explicacao = computed(() => {
  const r = results.value
  if (!r) return ''
  const hoje = formatCurrency(monthlyIncome.value)
  if (inss.value > 0) {
    return `Para completar os ${formatCurrency(r.adjustedIncome)} por mês (os ${hoje} de hoje, corrigidos pela inflação) com o INSS de ${formatCurrency(inss.value)}, você precisa de ${formatCurrency(r.requiredWealth)}.`
  }
  return `Para tirar ${formatCurrency(r.adjustedIncome)} por mês (os ${hoje} de hoje, corrigidos pela inflação), você precisa de ${formatCurrency(r.requiredWealth)}.`
})
const resumoPremissas = computed(() => [
  `retorno de ${pct(returnRate.value)} a.a. até lá e ${pct(withdrawalRate.value)} depois`,
  `inflação de ${pct(inflation.value)}`,
  `patrimônio de hoje ${brlCurto(currentWealth.value)}`,
  `vida até ${lifeExpectancy.value}`,
  `INSS ${brl(inss.value)}`,
].join(' · '))
function restaurar() {
  lifeExpectancy.value = PADRAO.life
  currentWealth.value = PADRAO.wealth
  returnRate.value = PADRAO.rate
  withdrawalRate.value = PADRAO.withdrawal
  inflation.value = PADRAO.inflation
  inss.value = PADRAO.inss
}

/* ——— salvar, compartilhar e reabrir (mesmo vocabulário do deep-link ?age=&retire=…) ——— */
const simParams = computed<Record<string, number>>(() => ({
  age: currentAge.value,
  retire: retirementAge.value,
  life: lifeExpectancy.value,
  income: monthlyIncome.value,
  wealth: currentWealth.value,
  monthly: monthlyContribution.value,
  rate: returnRate.value,
  withdrawal: withdrawalRate.value,
  inflation: inflation.value,
  inss: inss.value,
}))
const simLabel = computed(() => `Aos ${retirementAge.value} · ${brl(monthlyIncome.value)}/mês de renda · guardando ${brl(monthlyContribution.value)}/mês`)
const simResult = computed<Record<string, number> | undefined>(() => (results.value
  ? { total: Math.round(results.value.projectedWealth), necessario: Math.round(results.value.requiredWealth) }
  : undefined))
const link = computed(() => `${CAMINHO}?${Object.entries(simParams.value).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`)
const folhaConta = computed(() => (results.value
  ? {
      gesto: 'aposentadoria' as const,
      idade: currentAge.value,
      aposentaAos: retirementAge.value,
      total: Math.round(results.value.projectedWealth),
      necessario: Math.round(results.value.requiredWealth),
      serie: results.value.series,
    }
  : undefined))
function aplicar(p: Record<string, number>) {
  if (Number.isFinite(p.age)) currentAge.value = p.age!
  if (Number.isFinite(p.retire)) retirementAge.value = p.retire!
  if (Number.isFinite(p.life)) lifeExpectancy.value = p.life!
  if (Number.isFinite(p.income)) monthlyIncome.value = p.income!
  if (Number.isFinite(p.wealth)) currentWealth.value = p.wealth!
  if (Number.isFinite(p.monthly)) monthlyContribution.value = p.monthly!
  if (Number.isFinite(p.rate)) returnRate.value = p.rate!
  if (Number.isFinite(p.withdrawal)) withdrawalRate.value = p.withdrawal!
  if (Number.isFinite(p.inflation)) inflation.value = p.inflation!
  if (Number.isFinite(p.inss)) inss.value = p.inss!
}

// depois de mexer na conta, a folha sobe sozinha uma vez (useConviteDaConta)
const salvar = ref<{ pedir: (origem?: 'botao' | 'convite') => Promise<void> } | null>(null)
useConviteDaConta('aposentadoria', () => JSON.stringify(simParams.value), () => {
  if (results.value) void salvar.value?.pedir('convite')
})

// "E se…" em cápsulas pequenas (dono, 21/10/2026): a situação concreta e o resultado curto
const ese = computed(() => {
  const r = results.value
  if (!r) return []
  return [
    { texto: `Aposentar aos ${retirementAge.value + 3}`, valor: brlCurto(r.scenarios.work3More) },
    { texto: `Guardar ${brl(monthlyContribution.value * 1.2)}/mês`, valor: brlCurto(r.scenarios.increase20Percent) },
    { texto: `Viver com ${brl(monthlyIncome.value * 0.8)}/mês`, valor: `precisa de ${brlCurto(r.scenarios.reduce20Percent)}` },
    { texto: 'Sacar 4% ao ano', valor: `${brl(r.projectedWealth * 0.04 / 12)}/mês` },
  ]
})

// textos das premissas
const lifeTxt = computed(() => `${lifeExpectancy.value} anos`)
const wealthTxt = computed(() => brl(currentWealth.value))
const rateTxt = computed(() => pct(returnRate.value) + ' a.a.')
const withdrawalTxt = computed(() => pct(withdrawalRate.value) + ' a.a.')
const inflationTxt = computed(() => pct(inflation.value) + ' a.a.')
const inssTxt = computed(() => brl(inss.value) + '/mês')
</script>

<template>
  <CalcConta :section-id="sectionId ?? 'aposentadoria'" :bg="bg">
    <template #title><slot name="title">Calculadora de aposentadoria</slot></template>
    <template #topo>
      <CalcSimSaves variant="history" calculator="aposentadoria" :format-value="brl" @apply="aplicar" />
    </template>
    <template #frase>
      <CalcFrase>
        Tenho <CalcFraseCampo
          v-model="currentAge" rotulo="Sua idade hoje" :min="18" :max="99" :passo="1"
          :texto="`${currentAge} anos`" sufixo="anos"
        />, quero me aposentar aos <CalcFraseCampo
          v-model="retirementAge" rotulo="Idade para se aposentar" :min="30" :max="100" :passo="1"
          :texto="String(retirementAge)" sufixo="anos" :atalhos="idadesAtalho"
        /> e viver com <CalcFraseCampo
          v-model="monthlyIncome" rotulo="Renda por mês, em valores de hoje" :min="0" :max="30000" :passo="250"
          :texto="brl(monthlyIncome)" prefixo="R$" :atalhos="rendaAtalho"
        /> por mês. Hoje guardo <CalcFraseCampo
          v-model="monthlyContribution" rotulo="Quanto você guarda por mês" :min="0" :max="20000" :passo="100"
          :texto="brl(monthlyContribution)" prefixo="R$" :atalhos="aporteAtalho"
        /> por mês.
      </CalcFrase>
    </template>

    <template #resultado>
      <CalcNumero
        v-if="results"
        :legenda="`Aos ${retirementAge} anos, você terá`"
        :valor="formatCurrency(results.projectedWealth)"
        :selo="selo"
        :tom="results.viable ? 'ok' : 'falta'"
        :explica="explicacao"
      />
      <p v-else class="crs__invalido">A idade de se aposentar precisa ser maior que a sua idade hoje.</p>
    </template>

    <template #acoes>
      <CalcSimSaves
        ref="salvar" variant="save" calculator="aposentadoria" :caminho="CAMINHO"
        :params="simParams" :label="simLabel" :result="simResult" :folha="folhaConta"
      >
        <CalcCompartilhar :link="link" titulo="A minha aposentadoria, na Redentia" />
      </CalcSimSaves>
    </template>

    <template #grafico>
      <CalcCurva
        v-if="results"
        :valores="results.series"
        :meta="results.requiredWealth"
        :rotulo-meta="`você precisa de ${brlCurto(results.requiredWealth)}`"
        :rotulo-fim="`${brlCurto(results.projectedWealth)} aos ${retirementAge}`"
        :rotulos="[`hoje, ${currentAge} anos`, `${retirementAge} anos`]"
      />
    </template>

    <template #premissas>
      <CalcPremissas :resumo="resumoPremissas" @restaurar="restaurar">
        <div class="cpr-item">
          <CalcSliderField v-model="returnRate" label="Retorno até se aposentar" :min="0" :max="30" :step="0.25" :value-text="rateTxt" :presets="ratePresets" />
        </div>
        <div class="cpr-item">
          <CalcSliderField v-model="withdrawalRate" label="Retorno depois" :min="1" :max="20" :step="0.25" :value-text="withdrawalTxt" />
          <p class="crs__dica">Depois de se aposentar. Mais conservador: é o que você saca para viver.</p>
        </div>
        <div class="cpr-item">
          <CalcSliderField v-model="inflation" label="Inflação" :min="0" :max="20" :step="0.25" :value-text="inflationTxt" />
          <p class="crs__dica">Corrige a renda que você quer até o dia de se aposentar.</p>
        </div>
        <div class="cpr-item">
          <CalcSliderField v-model="currentWealth" label="Patrimônio de hoje" :min="0" :max="1000000" :step="5000" :value-text="wealthTxt" />
        </div>
        <div class="cpr-item">
          <CalcSliderField v-model="lifeExpectancy" label="Vida até" :min="50" :max="120" :step="1" :value-text="lifeTxt" />
        </div>
        <div class="cpr-item">
          <CalcSliderField v-model="inss" label="INSS por mês" :min="0" :max="8000" :step="100" :value-text="inssTxt" />
        </div>
      </CalcPremissas>
    </template>

    <template #depois>
      <CalcEse :itens="ese" aviso="É uma projeção, não uma promessa. Revise a conta todo ano e ajuste quando a vida mudar." />
    </template>
  </CalcConta>
</template>

<style scoped>
.crs__invalido { margin: 0; color: var(--nu-red); font-size: var(--nu-fs-md); font-weight: 700; }
.crs__dica { margin: 10px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; line-height: 1.5; }
</style>
