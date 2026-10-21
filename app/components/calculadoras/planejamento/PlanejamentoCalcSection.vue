<script lang="ts">
import type { PlanningCarteira, PlanningStrategy } from './planning-math'

// a carteira de cada estratégia sai da B3 uma vez por visita (a meta e o
// aporte não mudam a carteira, só o resto da conta). Só no client; o que
// falhou não fica guardado, para o "Tentar de novo" pedir de novo.
const carteiras = new Map<PlanningStrategy, Promise<PlanningCarteira | null>>()
</script>

<script setup lang="ts">
// Seção interativa da calculadora de Planejamento Patrimonial. Desde
// 21/10/2026 (dono: "tem algumas que têm MUITA configuração, isso afasta
// usuário") ela é uma frase com a meta e o aporte (CalcFraseCampo) e a
// escolha da carteira embaixo, no cartão CalcConta: sai o botão "Calcular
// Planejamento", a conta aparece sozinha e muda na hora. O "Salvar esta conta"
// fica à vista (antes esta calculadora não salvava) e a folha de cadastro sobe
// uma vez depois de mexer (useConviteDaConta). A carteira sugerida e os
// cenários "E se…" ficam embaixo do cartão.
// Matemática = porte EXATO do backend antigo (planning-math.ts, dados reais
// da B3 via /api/backend): analisarCarteira lê a B3 uma vez por estratégia e
// projetarPlanejamento faz o resto, sem rede.
import { brl } from '~/components/calc/compound-math'
import {
  analisarCarteira,
  computeMonthsToGoal,
  formatTimeLabel,
  projetarPlanejamento,
} from './planning-math'

const props = defineProps<{ sectionId?: string }>()

const route = useRoute()
// os ativos da carteira levam à página deles; a renda fixa não tem página
const NuxtLink = resolveComponent('NuxtLink')

// defaults da página antiga (goalValue: 500000, monthlyContribution: 1500)
const goal = ref(500000)
const monthly = ref(1500)
const strategy = ref<PlanningStrategy>('rentabilidade')

const carteira = shallowRef<PlanningCarteira | null>(null)
const carregando = ref(false)
const erro = ref(false)

function lerCarteira(s: PlanningStrategy) {
  let pedido = carteiras.get(s)
  if (!pedido) {
    pedido = analisarCarteira('/api/backend', s).then((c) => {
      if (!c) carteiras.delete(s)
      return c
    })
    carteiras.set(s, pedido)
  }
  return pedido
}

let ultimo = 0
async function carregar() {
  if (import.meta.server) return
  const s = strategy.value
  const este = ++ultimo
  carregando.value = true
  erro.value = false
  const c = await lerCarteira(s)
  if (este !== ultimo) return
  carregando.value = false
  if (c) carteira.value = c
  else erro.value = true
}

// a conta da frase: só com a carteira da estratégia escolhida já lida
const result = computed(() => {
  const c = carteira.value
  if (!c || c.strategy !== strategy.value || goal.value <= 0 || monthly.value <= 0) return null
  return projetarPlanejamento(goal.value, monthly.value, c)
})

// ====================================================================
// Deep-link via query params — comportamento portado do Planning.vue
// antigo: ?goal= ?monthly= ?strategy= pré-preenchem (a conta aparece sozinha;
// o ?auto=1 dos links antigos não precisa de mais nada). O ?seguranca=1 é o
// link das contas salvas (os params salvos são só números). Clique num
// cenário popular re-aplica + scrolla.
// ====================================================================
function parseNumberParam(value: unknown): number | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.trim() === '') return null
  const num = Number(raw.replace(',', '.'))
  return Number.isFinite(num) ? num : null
}

function parseStrategyParam(value: unknown): PlanningStrategy | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return null
  const normalized = raw.trim().toLowerCase()
  if (normalized === 'rentabilidade' || normalized === 'seguranca') return normalized
  return null
}

function applyQueryParams() {
  const q = route.query
  const g = parseNumberParam(q.goal)
  const m = parseNumberParam(q.monthly)
  const seg = parseNumberParam(q.seguranca)
  const s = parseStrategyParam(q.strategy) ?? (seg === null ? null : seg ? 'seguranca' : 'rentabilidade')

  if (g !== null && g > 0) goal.value = g
  if (m !== null && m > 0) monthly.value = m
  if (s !== null) strategy.value = s
}

function scrollToCalc() {
  if (typeof window === 'undefined') return
  nextTick(() => {
    document.getElementById(props.sectionId ?? 'planejamento')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  })
}

onMounted(() => {
  applyQueryParams()
  void carregar()
})
watch(strategy, () => void carregar())

watch(
  () => route.query,
  () => {
    applyQueryParams()
    scrollToCalc()
  },
  { deep: true },
)

/* ——— a frase (21/10/2026) ——— */
const CAMINHO = '/calculadora/planejamento'
const metaAtalho = [
  { label: 'R$ 150 mil', value: 150000 },
  { label: 'R$ 500 mil', value: 500000 },
  { label: 'R$ 1 milhão', value: 1000000 },
  { label: 'R$ 2 milhões', value: 2000000 },
]
const aporteAtalho = [500, 1500, 3000, 5000].map((v) => ({ label: brl(v), value: v }))
const strategyOptions: { value: PlanningStrategy; label: string }[] = [
  { value: 'rentabilidade', label: 'Rentabilidade' },
  { value: 'seguranca', label: 'Segurança' },
]
const dicaDaCarteira = computed(() => (strategy.value === 'rentabilidade'
  ? 'Ações de alta performance de três setores: PRIO3, VALE3 e WEGE3.'
  : 'Setores defensivos, FIIs consolidados e renda fixa: TAEE11, ITUB4, HGLG11 e VISC11.'))

const pct1 = (v: number) => (v * 100).toFixed(1).replace('.', ',') + '%'
const pct2 = (v: number) => (v * 100).toFixed(2).replace('.', ',') + '%'
// "14 anos" grande e "e 3 meses" menor, colado
function tempoPartido(meses: number): { valor: string; unidade: string } {
  const anos = Math.floor(meses / 12)
  const resto = meses % 12
  if (anos <= 0) return { valor: formatTimeLabel(meses), unidade: '' }
  return { valor: `${anos} ${anos === 1 ? 'ano' : 'anos'}`, unidade: resto > 0 ? ` e ${resto} ${resto === 1 ? 'mês' : 'meses'}` : '' }
}
const numero = computed(() => {
  const r = result.value
  if (!r) return null
  return {
    legenda: 'Você chega lá em',
    ...tempoPartido(r.monthsToGoal),
    selo: `Em ${r.targetDateLabel}`,
    explica: `Guardando ${brl(monthly.value)} por mês numa carteira que rendeu em média ${pct2(r.monthlyReturnRate)} ao mês nos últimos 5 anos, você põe ${brl(r.totalInvestedUntilGoal)} e a carteira faz os outros ${brl(r.estimatedProfit)}.`,
  }
})

const ese = computed(() => {
  const r = result.value
  if (!r) return []
  const tempo = (aporte: number) => formatTimeLabel(computeMonthsToGoal(goal.value, aporte, r.monthlyReturnRate))
  return [
    { texto: `Guardar ${brl(monthly.value * 1.2)}/mês`, valor: tempo(monthly.value * 1.2) },
    { texto: `Guardar ${brl(monthly.value * 2)}/mês`, valor: tempo(monthly.value * 2) },
    { texto: `Nos últimos ${r.historicalYears} anos`, valor: `${brlCurto(r.historicalInvested)} viraram ${brlCurto(r.historicalFinalValue)}` },
  ]
})

/* ——— salvar, compartilhar e reabrir ——— */
// os params salvos são só números: a carteira vai como seguranca=0/1
const simParams = computed<Record<string, number>>(() => ({
  goal: goal.value,
  monthly: monthly.value,
  seguranca: strategy.value === 'seguranca' ? 1 : 0,
}))
const simLabel = computed(() => `${brlCurto(goal.value)} guardando ${brl(monthly.value)}/mês · ${strategy.value === 'seguranca' ? 'maior segurança' : 'maior rentabilidade'}`)
const simResult = computed<Record<string, number> | undefined>(() => (result.value
  ? { total: result.value.monthsToGoal, final: Math.round(result.value.estimatedFinalValue) }
  : undefined))
const link = computed(() => `${CAMINHO}?goal=${goal.value}&monthly=${monthly.value}&strategy=${strategy.value}`)
const folhaConta = computed(() => {
  const r = result.value
  if (!r) return undefined
  return {
    gesto: 'conta' as const,
    rotulo: `Meta de ${brlCurto(goal.value)}, guardando ${brl(monthly.value)}/mês`,
    valor: formatTimeLabel(r.monthsToGoal),
    selo: `Em ${r.targetDateLabel}`,
    serie: r.chartData.map((p) => p.value),
    meta: goal.value,
    rotuloMeta: `a meta, ${brlCurto(goal.value)}`,
    rotulos: ['hoje', r.targetDateLabel] as [string, string],
    pergunta: `“E se eu guardar ${brl(monthly.value * 1.5)} por mês?”`,
  }
})
function aplicar(p: Record<string, number>) {
  if (Number.isFinite(p.goal)) goal.value = p.goal!
  if (Number.isFinite(p.monthly)) monthly.value = p.monthly!
  if (Number.isFinite(p.seguranca)) strategy.value = p.seguranca ? 'seguranca' : 'rentabilidade'
}

// depois de mexer na conta, a folha sobe sozinha uma vez (useConviteDaConta)
const salvar = ref<{ pedir: (origem?: 'botao' | 'convite') => Promise<void> } | null>(null)
useConviteDaConta('planejamento', () => JSON.stringify(simParams.value), () => {
  if (result.value) void salvar.value?.pedir('convite')
})
</script>

<template>
  <CalcConta :section-id="sectionId ?? 'planejamento'">
    <template #title><slot name="title">Planejamento patrimonial</slot></template>
    <template #topo>
      <CalcSimSaves variant="history" calculator="planejamento" :format-value="formatTimeLabel" @apply="aplicar" />
    </template>
    <template #frase>
      <CalcFrase>
        Minha meta é <CalcFraseCampo
          v-model="goal" rotulo="A sua meta" :min="50000" :max="3000000" :passo="10000"
          :texto="brl(goal)" prefixo="R$" :atalhos="metaAtalho"
        /> e consigo guardar <CalcFraseCampo
          v-model="monthly" rotulo="Quanto você guarda por mês" :min="100" :max="10000" :passo="50"
          :texto="brl(monthly)" prefixo="R$" :atalhos="aporteAtalho"
        /> por mês.
      </CalcFrase>
      <div class="pcs__carteira-escolha">
        <CalcEscolha v-model="strategy" rotulo="Prioridade" mostrar-rotulo :opcoes="strategyOptions" />
        <p class="pcs__dica">{{ dicaDaCarteira }}</p>
      </div>
    </template>

    <template #resultado>
      <CalcNumero v-if="numero" v-bind="numero" />
      <div v-else-if="erro" class="pcs__erro" role="alert">
        <p class="pcs__erro-texto">Não deu para ler os dados da B3 agora.</p>
        <button type="button" class="pcs__de-novo" @click="carregar">Tentar de novo</button>
      </div>
      <div v-else class="pcs__lendo" aria-busy="true">
        <p class="pcs__lendo-legenda">Você chega lá em</p>
        <span class="pcs__esqueleto" aria-hidden="true" />
        <p class="pcs__lendo-texto"><span class="pcs__pulso" aria-hidden="true" /> Lendo 5 anos de preços e dividendos da B3…</p>
      </div>
    </template>

    <template #acoes>
      <CalcSimSaves
        ref="salvar" variant="save" calculator="planejamento" :caminho="CAMINHO"
        :params="simParams" :label="simLabel" :result="simResult" :folha="folhaConta"
      >
        <CalcCompartilhar :link="link" titulo="O meu planejamento, na Redentia" />
      </CalcSimSaves>
    </template>

    <template #grafico>
      <CalcCurva
        v-if="result"
        :valores="result.chartData.map((p) => p.value)"
        :meta="goal"
        :rotulo-meta="`a meta, ${brlCurto(goal)}`"
        :rotulos="['hoje', result.targetDateLabel]"
      />
    </template>

    <template #depois>
      <CalcEse
        :itens="ese"
        aviso="Recomendação baseada em dados históricos. Rentabilidades passadas não garantem resultados futuros. Ajuste sempre sua carteira conforme o seu perfil de risco."
      >
        <!-- a carteira sugerida: o que esta calculadora tem de próprio -->
        <div v-if="result" class="pcs__carteira">
          <h3 class="pcs__carteira-titulo">Carteira sugerida</h3>
          <p class="pcs__carteira-desc">Distribuição baseada no desempenho histórico e nos critérios da estratégia escolhida, com os dividendos reinvestidos.</p>
          <ul class="pcs__ativos">
            <li v-for="a in result.recommendedAssets" :key="`${a.ticker}-${a.category}`">
              <component
                :is="a.ticker === 'Renda Fixa' ? 'div' : NuxtLink"
                :to="a.ticker === 'Renda Fixa' ? undefined : `/asset/${a.ticker}`"
                class="pcs__ativo"
              >
                <span class="pcs__ativo-cat">{{ a.category }}</span>
                <span class="pcs__ativo-ticker">{{ a.ticker }}</span>
                <span class="pcs__ativo-peso">{{ (a.weight * 100).toFixed(0) }}%</span>
                <span class="pcs__ativo-ret" :class="a.totalReturn >= 0 ? 'pcs__ativo-ret--alta' : 'pcs__ativo-ret--queda'">
                  {{ a.totalReturn >= 0 ? '+' : '' }}{{ pct1(a.totalReturn) }} em {{ result.historicalYears }} anos · {{ pct1(a.cagr) }} a.a.
                </span>
              </component>
            </li>
          </ul>
        </div>
      </CalcEse>
    </template>
  </CalcConta>
</template>

<style scoped>
.pcs__carteira-escolha { margin-top: 18px; }
.pcs__dica { margin: 10px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; line-height: 1.5; }

/* enquanto a carteira sai da B3 (~2 s) */
.pcs__lendo-legenda { margin: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 500; }
.pcs__esqueleto {
  display: block; width: min(320px, 80%); height: 56px; margin-top: 8px; border-radius: 16px;
  background: linear-gradient(90deg, var(--nu-cream) 0%, var(--nu-cream-2) 50%, var(--nu-cream) 100%);
  background-size: 200% 100%; animation: pcs-brilha 1.4s ease-in-out infinite;
}
.pcs__lendo-texto { display: flex; align-items: center; gap: 8px; margin: 18px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.pcs__pulso { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-blue); animation: pcs-pulsa 1.2s ease-in-out infinite; }
@keyframes pcs-brilha { from { background-position: 100% 0; } to { background-position: -100% 0; } }
@keyframes pcs-pulsa { 50% { opacity: .3; } }
@media (prefers-reduced-motion: reduce) {
  .pcs__esqueleto, .pcs__pulso { animation: none; }
}

.pcs__erro-texto { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; }
.pcs__de-novo {
  margin-top: 14px; padding: 10px 18px; border-radius: var(--nu-r-pill); border: 1.5px solid var(--nu-ink);
  background: var(--nu-white); color: var(--nu-ink); font-family: inherit; font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer;
}
.pcs__de-novo:hover { background: var(--nu-ink); color: var(--nu-white); }

/* a carteira sugerida, embaixo das cápsulas */
.pcs__carteira { max-width: 1080px; margin: clamp(28px, 3.4vw, 40px) auto 0; }
.pcs__carteira-titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em; text-align: center; }
.pcs__carteira-desc { margin: 6px auto 0; max-width: 560px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; text-align: center; }
.pcs__ativos {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(190px, 100%), 1fr)); gap: 10px;
  margin: 20px 0 0; padding: 0; list-style: none;
}
.pcs__ativo {
  display: grid; grid-template-columns: 1fr auto; grid-template-areas: "cat peso" "ticker peso" "ret ret";
  row-gap: 2px; column-gap: 12px; height: 100%; padding: 16px 18px; border-radius: 20px;
  background: var(--nu-white); color: inherit; transition: box-shadow .2s ease;
}
a.pcs__ativo:hover { box-shadow: 0 0 0 1.5px var(--nu-blue); }
.pcs__ativo-cat { grid-area: cat; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .6px; text-transform: uppercase; }
.pcs__ativo-ticker { grid-area: ticker; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.02em; }
.pcs__ativo-peso { grid-area: peso; align-self: center; color: var(--nu-blue); font-size: var(--nu-fs-xl); font-weight: 800; font-variant-numeric: tabular-nums; }
.pcs__ativo-ret { grid-area: ret; margin-top: 8px; font-size: var(--nu-fs-dense); font-weight: 700; font-variant-numeric: tabular-nums; }
.pcs__ativo-ret--alta { color: var(--nu-green); }
.pcs__ativo-ret--queda { color: var(--nu-red); }
</style>
