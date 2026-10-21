<script setup lang="ts">
// Seção interativa da calculadora de juros compostos. Desde 21/10/2026 os
// quatro sliders viraram uma frase ("Começo com R$ 1.000, guardo R$ 500 por
// mês por 20 anos, rendendo 11% a.a."), no cartão CalcConta, com o "Salvar
// esta conta" à vista e a folha de cadastro subindo uma vez depois de mexer
// (useConviteDaConta). Sem premissas escondidas: a conta inteira está na
// frase. Matemática EXATA do design/página antiga (compound-math.ts).
// Reativa, sem botão de calcular. `seed` pré-preenche (cenários e deep-links
// ?initial=&monthly=…).
import { brl, compoundProjection } from './compound-math'

const props = defineProps<{
  seed?: { initial?: number; monthly?: number; rate?: number; years?: number }
  eyebrow?: string
  bg?: 'white' | 'cream'
  sectionId?: string
}>()

const CAMINHO = '/calculadora/juros-compostos'

// defaults exatos do design (state = { ji:1000, jm:500, jt:11, jp:20 })
const ji = ref(1000)
const jm = ref(500)
const jt = ref(11)
const jp = ref(20)

watch(
  () => props.seed,
  (s) => {
    if (!s) return
    if (Number.isFinite(s.initial)) ji.value = s.initial as number
    if (Number.isFinite(s.monthly)) jm.value = s.monthly as number
    if (Number.isFinite(s.rate)) jt.value = s.rate as number
    if (Number.isFinite(s.years)) jp.value = Math.max(1, Math.min(40, Math.round(s.years as number)))
  },
  { immediate: true, deep: true },
)

const proj = computed(() => compoundProjection({ ji: ji.value, jm: jm.value, jt: jt.value, jp: jp.value }))

const jtTxt = computed(() => String(jt.value).replace('.', ',') + '% a.a.')
const jpTxt = computed(() => jp.value + (jp.value === 1 ? ' ano' : ' anos'))

// presets exatos do design, agora atalhos do campo do rendimento
const ratePresets = [
  { label: 'Poupança 6,17%', value: 6.17 },
  { label: 'CDI 10,75%', value: 10.75 },
  { label: 'IPCA+ 11,48%', value: 11.48 },
  { label: 'Ações 14%', value: 14 },
]
const inicialAtalho = [0, 1000, 10000, 50000].map((v) => ({ label: brl(v), value: v }))
const mensalAtalho = [200, 500, 1000, 2000].map((v) => ({ label: brl(v), value: v }))
const prazoAtalho = [5, 10, 20, 30].map((v) => ({ label: `${v} anos`, value: v }))

const legenda = computed(() => `Daqui a ${jpTxt.value}, você terá`)
const selo = computed(() => `${brl(proj.value.juros)} só de juros`)
const explicacao = computed(
  () =>
    `Você guarda ${brl(proj.value.aportado)}. Os juros respondem por ${proj.value.pctJ.toFixed(0)}% do total, ${proj.value.razao.toFixed(1).replace('.', ',')}× o que você aportou: é o efeito dos juros compostos no prazo longo.`,
)

// ——— salvar, compartilhar e reabrir ———
// params no MESMO vocabulário do deep-link (?initial=&monthly=&rate=&years=)
// — salvar/reabrir e o redirect pós-login reusam a hidratação que já existe.
const simParams = computed<Record<string, number>>(() => ({
  initial: ji.value, monthly: jm.value, rate: jt.value, years: jp.value,
}))
const simLabel = computed(() => {
  const parts = []
  if (ji.value > 0) parts.push(`${brl(ji.value)} inicial`)
  parts.push(`${brl(jm.value)}/mês`, jpTxt.value, jtTxt.value)
  return parts.join(' · ')
})
const simResult = computed<Record<string, number>>(() => ({
  total: Math.round(proj.value.total),
  aportado: Math.round(proj.value.aportado),
  juros: Math.round(proj.value.juros),
}))
const link = computed(() => `${CAMINHO}?${Object.entries(simParams.value).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`)
const folhaConta = computed(() => ({ gesto: 'simulacao' as const, inicial: ji.value, mensal: jm.value, taxa: jt.value, anos: jp.value }))
function applySim(p: Record<string, number>) {
  if (Number.isFinite(p.initial)) ji.value = p.initial!
  if (Number.isFinite(p.monthly)) jm.value = p.monthly!
  if (Number.isFinite(p.rate)) jt.value = p.rate!
  if (Number.isFinite(p.years)) jp.value = Math.max(1, Math.min(40, Math.round(p.years!)))
}

// depois de mexer na conta, a folha sobe sozinha uma vez (useConviteDaConta)
const salvar = ref<{ pedir: (origem?: 'botao' | 'convite') => Promise<void> } | null>(null)
useConviteDaConta('juros-compostos', () => JSON.stringify(simParams.value), () => {
  void salvar.value?.pedir('convite')
})
</script>

<template>
  <CalcConta :section-id="sectionId ?? 'juros'" :bg="bg">
    <template #title><slot name="title">Calculadora de juros compostos</slot></template>
    <template #topo>
      <CalcSimSaves variant="history" calculator="juros-compostos" :format-value="brl" @apply="applySim" />
    </template>
    <template #frase>
      <p class="ccs__frase">
        Começo com <CalcFraseCampo
          v-model="ji" rotulo="Quanto você tem para começar" :min="0" :max="100000" :passo="500"
          :texto="brl(ji)" prefixo="R$" :atalhos="inicialAtalho"
        />, guardo <CalcFraseCampo
          v-model="jm" rotulo="Quanto você guarda por mês" :min="0" :max="10000" :passo="50"
          :texto="brl(jm)" prefixo="R$" :atalhos="mensalAtalho"
        /> por mês por <CalcFraseCampo
          v-model="jp" rotulo="Por quanto tempo" :min="1" :max="40" :passo="1"
          :texto="jpTxt" sufixo="anos" :atalhos="prazoAtalho"
        />, rendendo <CalcFraseCampo
          v-model="jt" rotulo="Rendimento por ano" :min="1" :max="20" :passo="0.25"
          :texto="jtTxt" sufixo="% a.a." :atalhos="ratePresets"
        />
      </p>
    </template>

    <template #resultado>
      <p class="ccs__legenda">{{ legenda }}</p>
      <p class="ccs__valor">{{ brl(proj.total) }}</p>
      <span class="ccs__selo">{{ selo }}</span>
      <p class="ccs__explica">{{ explicacao }}</p>
    </template>

    <template #acoes>
      <CalcSimSaves
        ref="salvar" variant="save" calculator="juros-compostos" :caminho="CAMINHO"
        :params="simParams" :label="simLabel" :result="simResult" :folha="folhaConta"
      >
        <CalcCompartilhar :link="link" titulo="A minha conta de juros compostos, na Redentia" />
      </CalcSimSaves>
    </template>

    <template #grafico>
      <CalcCurva
        :valores="proj.series"
        :secundaria="proj.aporteSeries"
        :rotulo-fim="`${brlCurto(proj.total)} em ${jpTxt}`"
        :rotulos="['hoje', `daqui a ${jpTxt}`]"
      />
      <p class="ccs__legenda-curva"><span class="ccs__traco" aria-hidden="true" /> o que você guardou</p>
    </template>
  </CalcConta>
</template>

<style scoped>
/* o "a.a." do rendimento fecha a frase: sem um segundo ponto depois dele */
.ccs__frase { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 700; letter-spacing: -0.02em; line-height: 1.55; text-wrap: pretty; }
.ccs__legenda { margin: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 500; }
.ccs__valor {
  margin: 4px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800;
  letter-spacing: -0.05em; line-height: 1; font-variant-numeric: tabular-nums;
}
.ccs__selo {
  display: inline-flex; margin-top: 16px; padding: 7px 14px; border-radius: var(--nu-r-pill);
  background: var(--nu-blue-tint); color: var(--nu-blue); font-size: var(--nu-fs-sm); font-weight: 700;
}
.ccs__explica { margin: 14px 0 0; max-width: 470px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.ccs__legenda-curva {
  display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin: 6px 0 0;
  color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500;
}
.ccs__traco { width: 22px; height: 0; border-top: 2px dashed color-mix(in srgb, var(--nu-ink) 55%, transparent); }
@media (max-width: 640px) {
  .ccs__frase { line-height: 1.7; }
}
</style>
