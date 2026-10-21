<script setup lang="ts">
// Calculadora de aporte mensal (quanto-investir): cálculo REVERSO por meta.
// Desde 21/10/2026 (dono: "tem algumas que têm MUITA configuração, isso afasta
// usuário") ela é uma frase com os quatro campos (CalcFraseCampo), no cartão
// CalcConta, como a aposentadoria: o "Salvar esta conta" à vista (antes esta
// calculadora não salvava) e a folha de cadastro subindo uma vez depois de
// mexer (useConviteDaConta). Os cenários "E se…" ficam embaixo do cartão.
// Saiu o "Ajustar aportes pela inflação": existia no form antigo, mas NUNCA
// entrou no cálculo. O ?inflation= dos links antigos segue aceito e, como
// antes, não muda a conta.
// A MATEMÁTICA é a do app antigo (Frontend/app/components/calculator/
// MonthlyInvestment.vue): PMT = (FV − PV(1+i)ⁿ) ÷ [((1+i)ⁿ − 1) ÷ i] com
// i = taxa anual/12 (mesma convenção do antigo — NÃO taxa equivalente).
// `seed` pré-preenche (deep-links ?goal=&years=&wealth=&rate= e cenários [scenario]).
import { brl } from '~/components/calc/compound-math'

const props = defineProps<{
  seed?: { goal?: number; years?: number; wealth?: number; rate?: number; inflation?: number }
  eyebrow?: string
  bg?: 'white' | 'cream'
  sectionId?: string
}>()

// defaults exatos do form antigo
const goal = ref(500000)
const years = ref(10)
const wealth = ref(50000)
const rate = ref(10)

watch(
  () => props.seed,
  (s) => {
    if (!s) return
    if (Number.isFinite(s.goal)) goal.value = s.goal as number
    if (Number.isFinite(s.years)) years.value = Math.max(1, Math.min(50, Math.round(s.years as number)))
    if (Number.isFinite(s.wealth)) wealth.value = s.wealth as number
    if (Number.isFinite(s.rate)) rate.value = s.rate as number
  },
  { immediate: true, deep: true },
)

// —— matemática (porte exato do MonthlyInvestment.vue antigo) ——
function pmtFor(goalV: number, yearsV: number, wealthV: number, rateV: number): number {
  const months = yearsV * 12
  const monthlyRate = rateV / 100 / 12
  const futureValueCurrent = wealthV * Math.pow(1 + monthlyRate, months)
  const remaining = goalV - futureValueCurrent
  return remaining / ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
}

function simulateWithContribution(pmt: number): number {
  const months = years.value * 12
  const monthlyRate = rate.value / 100 / 12
  const futureValueCurrent = wealth.value * Math.pow(1 + monthlyRate, months)
  const futureValueContributions = pmt * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
  return futureValueCurrent + futureValueContributions
}

function calculateForRate(r: number): number {
  const months = years.value * 12
  const monthlyRate = r / 100 / 12
  const futureValueCurrent = wealth.value * Math.pow(1 + monthlyRate, months)
  const remaining = goal.value - futureValueCurrent
  if (remaining <= 0) return 0
  return remaining / ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
}

// mesma validação do calculate() antigo (era um alert; aqui vira estado)
const invalid = computed(() => !goal.value || !years.value || goal.value <= wealth.value)

const res = computed(() => {
  const monthlyContribution = pmtFor(goal.value, years.value, wealth.value, rate.value)
  const months = years.value * 12
  const totalInvested = wealth.value + monthlyContribution * months
  const totalInterest = goal.value - totalInvested
  const contributionPercent = (totalInvested / goal.value) * 100
  const interestPercent = (totalInterest / goal.value) * 100

  // projeção ano a ano com o PMT calculado (mesma capitalização do cálculo)
  const monthlyRate = rate.value / 100 / 12
  const series: number[] = []
  const investedSeries: number[] = []
  for (let k = 0; k <= years.value; k++) {
    const m = k * 12
    const f = Math.pow(1 + monthlyRate, m)
    series.push(wealth.value * f + monthlyContribution * ((f - 1) / monthlyRate))
    investedSeries.push(wealth.value + monthlyContribution * m)
  }

  return {
    monthlyContribution,
    totalInvested,
    totalInterest,
    contributionPercent,
    interestPercent,
    scenarios: {
      increase20: simulateWithContribution(monthlyContribution * 1.2),
      reduce20: simulateWithContribution(monthlyContribution * 0.8),
      extend2Years: pmtFor(goal.value, years.value + 2, wealth.value, rate.value),
    },
    series,
    investedSeries,
  }
})

/* ——— a frase (21/10/2026) ———
   Os quatro campos ficam na frase; nada muda na matemática acima. */
const CAMINHO = '/calculadora/quanto-investir'
const pct = (v: number) => `${String(v).replace('.', ',')}%`
const anos = (n: number) => `${n} ${n === 1 ? 'ano' : 'anos'}`
const metaAtalho = [
  { label: 'R$ 100 mil', value: 100000 },
  { label: 'R$ 500 mil', value: 500000 },
  { label: 'R$ 1 milhão', value: 1000000 },
  { label: 'R$ 2 milhões', value: 2000000 },
]
const prazoAtalho = [5, 10, 15, 20].map((v) => ({ label: `${v} anos`, value: v }))
const patrimonioAtalho = [0, 10000, 50000, 100000].map((v) => ({ label: brl(v), value: v }))
// os mesmos atalhos de rendimento das outras calculadoras na frase
const ratePresets = [
  { label: 'Poupança 6,17%', value: 6.17 },
  { label: 'CDI 10,75%', value: 10.75 },
  { label: 'IPCA+ 11,48%', value: 11.48 },
  { label: 'Ações 14%', value: 14 },
]

// o que já tem, rendendo, passa da meta sem guardar nada: o PMT antigo saía negativo
const semAporte = computed(() => !invalid.value && res.value.monthlyContribution <= 0)
const soOQueTem = computed(() => wealth.value * Math.pow(1 + rate.value / 100 / 12, years.value * 12))
const curva = computed(() => {
  if (!semAporte.value) return { valores: res.value.series, aportes: res.value.investedSeries }
  const i = rate.value / 100 / 12
  const valores = Array.from({ length: years.value + 1 }, (_, k) => wealth.value * Math.pow(1 + i, k * 12))
  return { valores, aportes: valores.map(() => wealth.value) }
})

const numero = computed(() => {
  if (invalid.value) {
    return {
      legenda: 'Hoje você já tem',
      valor: brl(wealth.value),
      unidade: '',
      selo: '✓ Já passa da meta',
      tom: 'ok' as const,
      explica: `Os ${brl(wealth.value)} de hoje já cobrem os ${brl(goal.value)}. Aumente a meta para ver quanto guardar por mês.`,
    }
  }
  if (semAporte.value) {
    return {
      legenda: `Daqui a ${anos(years.value)}, só o que você já tem vira`,
      valor: brl(soOQueTem.value),
      unidade: '',
      selo: '✓ Chega lá sem guardar nada por mês',
      tom: 'ok' as const,
      explica: `Os ${brl(wealth.value)} de hoje, rendendo ${pct(rate.value)} a.a., passam dos ${brl(goal.value)} da meta.`,
    }
  }
  const r = res.value
  const deHoje = wealth.value > 0 ? `os ${brl(wealth.value)} de hoje e ${brl(r.monthlyContribution)} por mês` : `${brl(r.monthlyContribution)} por mês`
  return {
    legenda: 'Você precisa guardar',
    valor: brl(r.monthlyContribution),
    unidade: '/mês',
    selo: `${r.interestPercent.toFixed(0)}% da meta vem dos juros`,
    tom: 'azul' as const,
    explica: `Em ${anos(years.value)}, você põe ${brl(r.totalInvested)} do seu bolso: ${deHoje}. Os juros compostos fazem os outros ${brl(r.totalInterest)}.`,
  }
})

const ese = computed(() => {
  if (invalid.value || semAporte.value) return []
  const r = res.value
  const itens = [{ texto: `Em ${anos(years.value + 2)}`, valor: `${brl(r.scenarios.extend2Years)}/mês` }]
  if (rate.value + 2 <= 30) itens.push({ texto: `Rendendo ${pct(rate.value + 2)} a.a.`, valor: `${brl(calculateForRate(rate.value + 2))}/mês` })
  itens.push(
    { texto: `Guardar ${brl(r.monthlyContribution * 1.2)}/mês`, valor: `chega a ${brlCurto(r.scenarios.increase20)}` },
    { texto: `Guardar ${brl(r.monthlyContribution * 0.8)}/mês`, valor: `chega a ${brlCurto(r.scenarios.reduce20)}` },
  )
  return itens
})

/* ——— salvar, compartilhar e reabrir (mesmo vocabulário do deep-link ?goal=&years=…) ——— */
const simParams = computed<Record<string, number>>(() => ({
  goal: goal.value,
  years: years.value,
  wealth: wealth.value,
  rate: rate.value,
}))
const simLabel = computed(() => `${brlCurto(goal.value)} em ${anos(years.value)} · já tenho ${brlCurto(wealth.value)} · ${pct(rate.value)} a.a.`)
const simResult = computed<Record<string, number> | undefined>(() => (invalid.value
  ? undefined
  : { total: Math.round(Math.max(0, res.value.monthlyContribution)), meta: goal.value }))
const link = computed(() => `${CAMINHO}?${Object.entries(simParams.value).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`)
const folhaConta = computed(() => (invalid.value
  ? undefined
  : {
      gesto: 'conta' as const,
      rotulo: `Meta de ${brlCurto(goal.value)} em ${anos(years.value)}`,
      valor: semAporte.value ? 'Sem aporte por mês' : `${brl(res.value.monthlyContribution)}/mês`,
      selo: semAporte.value ? '✓ O que você tem já chega lá' : `${res.value.interestPercent.toFixed(0)}% da meta vem dos juros`,
      serie: curva.value.valores,
      meta: goal.value,
      rotuloMeta: `a meta, ${brlCurto(goal.value)}`,
      rotulos: ['hoje', anos(years.value)] as [string, string],
      pergunta: `“E se eu esticar para ${anos(years.value + 2)}?”`,
    }))
function aplicar(p: Record<string, number>) {
  if (Number.isFinite(p.goal)) goal.value = p.goal!
  if (Number.isFinite(p.years)) years.value = p.years!
  if (Number.isFinite(p.wealth)) wealth.value = p.wealth!
  if (Number.isFinite(p.rate)) rate.value = p.rate!
}
const porMes = (v: number) => `${brl(v)}/mês`

// depois de mexer na conta, a folha sobe sozinha uma vez (useConviteDaConta)
const salvar = ref<{ pedir: (origem?: 'botao' | 'convite') => Promise<void> } | null>(null)
useConviteDaConta('quanto-investir', () => JSON.stringify(simParams.value), () => {
  if (!invalid.value) void salvar.value?.pedir('convite')
})
</script>

<template>
  <CalcConta :section-id="sectionId ?? 'aporte'" :bg="bg">
    <template #title><slot name="title">Quanto investir por mês</slot></template>
    <template #topo>
      <CalcSimSaves variant="history" calculator="quanto-investir" :format-value="porMes" @apply="aplicar" />
    </template>
    <template #frase>
      <CalcFrase>
        <!-- o "a.a." do rendimento fecha a frase: sem um segundo ponto depois dele -->
        Quero juntar <CalcFraseCampo
          v-model="goal" rotulo="A sua meta" :min="30000" :max="10000000" :passo="10000"
          :texto="brl(goal)" prefixo="R$" :atalhos="metaAtalho"
        /> em <CalcFraseCampo
          v-model="years" rotulo="Em quanto tempo" :min="1" :max="50" :passo="1"
          :texto="anos(years)" sufixo="anos" :atalhos="prazoAtalho"
        />. Hoje já tenho <CalcFraseCampo
          v-model="wealth" rotulo="Quanto você já tem investido" :min="0" :max="1000000" :passo="5000"
          :texto="brl(wealth)" prefixo="R$" :atalhos="patrimonioAtalho"
        />, rendendo <CalcFraseCampo
          v-model="rate" rotulo="Rendimento por ano" :min="1" :max="30" :passo="0.25"
          :texto="`${pct(rate)} a.a.`" sufixo="% a.a." :atalhos="ratePresets"
        />
      </CalcFrase>
    </template>

    <template #resultado>
      <CalcNumero v-bind="numero" />
    </template>

    <template #acoes>
      <CalcSimSaves
        ref="salvar" variant="save" calculator="quanto-investir" :caminho="CAMINHO"
        :params="simParams" :label="simLabel" :result="simResult" :folha="folhaConta"
      >
        <CalcCompartilhar :link="link" titulo="A minha meta, na Redentia" />
      </CalcSimSaves>
    </template>

    <template #grafico>
      <CalcCurva
        v-if="!invalid"
        :valores="curva.valores"
        :secundaria="curva.aportes"
        :meta="goal"
        :rotulo-meta="`a meta, ${brlCurto(goal)}`"
        :rotulos="['hoje', `daqui a ${anos(years)}`]"
        legenda-secundaria="o que você guardou"
      />
    </template>

    <template #depois>
      <CalcEse
        :itens="ese"
        aviso="A conta usa o mesmo aporte todo mês. Se você aumentar o aporte quando a renda crescer, chega antes."
      />
    </template>
  </CalcConta>
</template>
