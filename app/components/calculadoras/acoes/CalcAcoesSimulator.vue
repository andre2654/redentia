<script lang="ts">
import { cleanChart, cleanDividends } from './stock-math'

/** O histórico de um ativo: os preços e os proventos, como a matemática pede. */
interface Historico {
  precos: ReturnType<typeof cleanChart>
  proventos: ReturnType<typeof cleanDividends>
}

// o histórico de cada ativo sai da B3 uma vez por visita: o valor, o aporte, o
// período e o reinvestimento não mudam o que se lê, só a conta. Só no client;
// o que falhou não fica guardado, para tentar de novo.
const historicos = new Map<string, Promise<Historico | null>>()
const AO_BACKEND = { timeout: 15_000, headers: { Accept: 'application/json' } }

function lerHistorico(ticker: string): Promise<Historico | null> {
  let pedido = historicos.get(ticker)
  if (!pedido) {
    pedido = Promise.all([
      $fetch<unknown>(`/api/backend/tickers/${ticker}/prices?mode=full`, AO_BACKEND),
      // sem proventos → segue sem reinvestimento (comportamento antigo)
      $fetch<unknown>(`/api/backend/dividends/${ticker}`, AO_BACKEND).catch(() => null),
    ])
      .then(([precos, proventos]) => ({ precos: cleanChart(precos), proventos: proventos ? cleanDividends(proventos) : [] }))
      .catch(() => null)
      .then((h) => {
        if (!h) historicos.delete(ticker)
        return h
      })
    historicos.set(ticker, pedido)
  }
  return pedido
}
</script>

<script setup lang="ts">
// Seção interativa do simulador de ações (/calculadora/acoes). Desde
// 21/10/2026 (dono: "tem algumas que têm MUITA configuração, isso afasta
// usuário") é uma frase: "Se eu tivesse investido [R$ 10.000] em [ITUB4] há
// [2 anos], guardando [R$ 500] por mês e [reinvestindo] os proventos." Sai o
// botão "Calcular Histórico": o histórico real de cada ativo é lido uma vez e a
// conta muda na hora, no cartão CalcConta, com o "Salvar esta conta" à vista
// (antes este simulador não salvava) e a folha de cadastro subindo uma vez
// depois de mexer (useConviteDaConta). Começa em ITUB4, o primeiro cenário da
// página, para a conta já aparecer pronta.
// Comportamento portado do Calculator/Stock.vue antigo: busca multi-ativo
// (STOCK/FUND/REIT/ETF via GET /tickers-full), aporte inicial/mensal/período,
// reinvestimento de proventos, deep-links ?initial=&monthly=&years=&reinvest=
// &tickers= (e o fragmento #tickers= de /asset e /dividendos).
// Matemática EXATA em ./stock-math (porte do server antigo).
import { brl } from '~/components/calc/compound-math'
import { mergeChartData, simulateStock, type StockSimulation } from './stock-math'

interface AssetItem {
  id: string
  label: string
  suffix?: string
}

const route = useRoute()

/* ——— a conta (defaults da página antiga; o ativo é o primeiro cenário) ——— */
const initialInvestment = ref(10000)
const monthlyInvestment = ref(500)
const periodYears = ref(2)
const reinvestDividends = ref(true)
const ATIVO_INICIAL = 'ITUB4'
const portfolioAssets = ref<AssetItem[]>([{ id: ATIVO_INICIAL, label: ATIVO_INICIAL }])

/* ——— lista de ativos da busca (client-only; mesma fonte /tickers-full do app antigo) ——— */
const { data: assetsData, pending: assetsLoading } = useAsyncData(
  'calc-acoes-tickers-full',
  () => $fetch<unknown>('/api/backend/tickers-full', { headers: { Accept: 'application/json' } }),
  { server: false },
)

function unwrapArray(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload
  const p = payload as { data?: unknown } | null
  if (p && Array.isArray(p.data)) return p.data as Record<string, unknown>[]
  return []
}

const normalizedAssets = computed<AssetItem[]>(() => {
  return unwrapArray(assetsData.value)
    .filter((a) => {
      // página antiga filtrava STOCK|FUND; no runtime atual do /tickers-full
      // FIIs vêm como REIT (sem ele, HGLG11/KNCR11 não resolvem) e ETFs como
      // ETF (cenários BOVA11/SMAL11 já existiam na página antiga). A lista vive
      // em utils/simulador.ts porque /asset e /dividendos só linkam pra cá os
      // tipos que ela cobre.
      return SIMULADOR_TYPES.has(String(a.type ?? '').toUpperCase())
    })
    .map((a) => {
      const ticker = (a.ticker || a.stock) as string | undefined
      if (!ticker) return null
      return { id: ticker, label: ticker, suffix: a.name as string | undefined }
    })
    .filter((a): a is AssetItem => Boolean(a))
    .sort((a, b) => a.label.localeCompare(b.label))
})
// os ativos escolhidos ganham o nome quando a lista chega (o do link vem só com o ticker)
watch(normalizedAssets, (lista) => {
  const porId = new Map(lista.map((a) => [a.id, a]))
  if (portfolioAssets.value.some((a) => !a.suffix && porId.get(a.id)?.suffix)) {
    portfolioAssets.value = portfolioAssets.value.map((a) => (a.suffix ? a : { ...a, suffix: porId.get(a.id)?.suffix }))
  }
})
const SUGERIDOS = ['ITUB4', 'PETR4', 'VALE3', 'WEGE3', 'BBAS3', 'TAEE11', 'HGLG11', 'BOVA11']

/* ——— deep-links (?initial=&monthly=&years=&reinvest=&tickers=) ——— */
function parseNumberParam(value: unknown): number | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.trim() === '') return null
  const num = Number(raw.replace(',', '.'))
  return Number.isFinite(num) ? num : null
}

function parseBoolParam(value: unknown): boolean | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return null
  const normalized = raw.trim().toLowerCase()
  if (normalized === '1' || normalized === 'true' || normalized === 'sim') return true
  if (normalized === '0' || normalized === 'false' || normalized === 'nao') return false
  return null
}

function parseTickersParam(value: unknown): string[] {
  if (value === undefined || value === null) return []
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return []
  return [...new Set(raw
    .split(',')
    .map((t) => t.trim().toUpperCase())
    .filter((t) => /^[A-Z0-9]{4,7}$/.test(t)))].slice(0, 10)
}

// Query manda (cenários populares e links antigos). Sem query, lê o fragmento,
// que é como /asset e /dividendos linkam: #tickers=PETR4&reinvest=1 (o porquê
// do fragmento está em utils/simulador.ts). O fragmento só existe no navegador.
function deepLinkParams(): Record<string, unknown> {
  if (Object.keys(route.query).length) return route.query
  if (import.meta.server) return {}
  const hash = route.hash.replace(/^#/, '')
  return hash.includes('=') ? Object.fromEntries(new URLSearchParams(hash)) : {}
}

function applyQueryParams() {
  const q = deepLinkParams()
  const initial = parseNumberParam(q.initial)
  const monthly = parseNumberParam(q.monthly)
  const years = parseNumberParam(q.years)
  const reinvest = parseBoolParam(q.reinvest)
  const tickers = parseTickersParam(q.tickers)

  if (initial !== null) initialInvestment.value = initial
  if (monthly !== null) monthlyInvestment.value = monthly
  if (years !== null && years > 0) periodYears.value = Math.max(1, Math.min(30, Math.round(years)))
  if (reinvest !== null) reinvestDividends.value = reinvest
  if (tickers.length) {
    const porId = new Map(normalizedAssets.value.map((a) => [a.id, a]))
    portfolioAssets.value = tickers.map((t) => porId.get(t) ?? { id: t, label: t })
  }
}
applyQueryParams()

function scrollToCalc() {
  if (typeof window === 'undefined') return
  nextTick(() => {
    document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

onMounted(() => {
  // o fragmento (#tickers=…) só chega aqui
  if (!Object.keys(route.query).length && route.hash.includes('=')) applyQueryParams()
  carregar()
  // O fragmento de parâmetros não é id de elemento: o scrollBehavior do router
  // procura #tickers=… na página, não acha e NÃO rola, então quem chega do
  // meio de um /asset abria o simulador no meio da página. Volta pro topo, onde
  // o topo compacto deixa a calculadora na primeira dobra.
  if (route.hash.includes('=')) window.scrollTo({ top: 0 })
})

watch(
  () => route.query,
  () => {
    applyQueryParams()
    scrollToCalc()
  },
  { deep: true },
)

/* ——— o histórico de cada ativo, lido uma vez ——— */
const lidos = shallowRef<Record<string, Historico | null>>({})
const lendo = new Set<string>()
function carregar() {
  if (import.meta.server) return
  for (const { id } of portfolioAssets.value) {
    if (lidos.value[id] || lendo.has(id)) continue
    lendo.add(id)
    void lerHistorico(id).then((h) => {
      lendo.delete(id)
      lidos.value = { ...lidos.value, [id]: h }
    })
  }
}
watch(() => portfolioAssets.value.map((a) => a.id).join(','), carregar)

/* ——— a conta (matemática exata portada; o aporte se divide igual entre os ativos) ——— */
function simular(ativos: AssetItem[], total: number, mensal: number, anos: number, reinvest: boolean) {
  const tickerCount = ativos.length
  const perInitial = tickerCount > 0 ? total / tickerCount : 0
  const perMonthly = tickerCount > 0 ? mensal / tickerCount : 0
  const validos: (StockSimulation & { name?: string })[] = []
  const falhos: string[] = []
  for (const a of ativos) {
    const h = lidos.value[a.id]
    const sim = h ? simulateStock(a.id, h.precos, reinvest ? h.proventos : [], perInitial, perMonthly, anos, reinvest) : null
    if (sim) validos.push({ ...sim, name: a.suffix })
    else falhos.push(a.label)
  }
  // agregado consolidado (porte do aggregatedSummary antigo)
  const totals = validos.reduce(
    (acc, r) => {
      acc.totalInvested += r.totalInvested
      acc.finalValue += r.finalValue
      acc.totalDividends += r.totalDividends
      return acc
    },
    { totalInvested: 0, finalValue: 0, totalDividends: 0 },
  )
  const totalReturn = totals.totalInvested > 0 ? ((totals.finalValue - totals.totalInvested) / totals.totalInvested) * 100 : 0
  return { validos, falhos, resumo: { ...totals, return: totalReturn, assetCount: validos.length } }
}

const calculo = computed(() => {
  const ativos = portfolioAssets.value
  if (!ativos.length) return { estado: 'vazio' as const }
  if (ativos.some((a) => !(a.id in lidos.value))) return { estado: 'lendo' as const }
  const conta = simular(ativos, Number(initialInvestment.value) || 0, Number(monthlyInvestment.value) || 0, Number(periodYears.value) || 1, reinvestDividends.value)
  if (!conta.validos.length) return { estado: 'sem-dados' as const, falhos: conta.falhos }
  return { estado: 'pronto' as const, ...conta, curva: mergeChartData(conta.validos) }
})
const pronto = computed(() => (calculo.value.estado === 'pronto' ? calculo.value : null))

/* ——— a frase (21/10/2026) ——— */
const CAMINHO = '/calculadora/acoes'
const anosTxt = (n: number) => `${n} ${n === 1 ? 'ano' : 'anos'}`
const pct = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1).replace('.', ',')}%`
const inicialAtalho = [1000, 5000, 10000, 50000].map((v) => ({ label: brl(v), value: v }))
const mensalAtalho = [0, 200, 500, 1000].map((v) => ({ label: brl(v), value: v }))
const anosAtalho = [1, 2, 5, 10].map((v) => ({ label: anosTxt(v), value: v }))
const reinvestirOpcoes = [
  { value: 'reinvestindo', label: 'reinvestindo' },
  { value: 'sacando', label: 'sacando' },
]
const reinvestir = computed({
  get: () => (reinvestDividends.value ? 'reinvestindo' : 'sacando'),
  set: (v: string) => { reinvestDividends.value = v === 'reinvestindo' },
})
const ativosTxt = computed(() => {
  const t = portfolioAssets.value.map((a) => a.label)
  if (t.length <= 1) return t[0] ?? ''
  return `${t.slice(0, -1).join(', ')} e ${t[t.length - 1]}`
})

const numero = computed(() => {
  const c = pronto.value
  if (!c) return null
  const r = c.resumo
  const divididos = r.assetCount > 1 ? ` Os aportes se dividem igualmente entre os ${r.assetCount} ativos.` : ''
  const ignorados = c.falhos.length ? ` Sem dados de ${c.falhos.join(', ')}, que ficaram de fora.` : ''
  const proventos = reinvestDividends.value
    ? (r.totalDividends > 0 ? `, e ${brl(r.totalDividends)} em proventos voltaram para a carteira` : '')
    : ''
  const semReinvestir = reinvestDividends.value ? '' : ' Sem reinvestir, os proventos não entram nesta conta.'
  return {
    legenda: 'Hoje você teria',
    valor: brl(r.finalValue),
    selo: `${pct(r.return)} sobre ${brl(r.totalInvested)} investidos`,
    tom: r.return >= 0 ? ('ok' as const) : ('falta' as const),
    explica: `Você teria posto ${brl(r.totalInvested)}${proventos}.${semReinvestir}${divididos}${ignorados}`,
  }
})

// "E se…": três contas a mais por mudança, então elas esperam a pessoa parar de arrastar
const ese = shallowRef<{ texto: string; valor: string }[]>([])
let eseRelogio: ReturnType<typeof setTimeout> | null = null
watch([pronto, initialInvestment, monthlyInvestment, periodYears, reinvestDividends], () => {
  if (import.meta.server) return
  if (eseRelogio) clearTimeout(eseRelogio)
  if (!pronto.value) {
    ese.value = []
    return
  }
  eseRelogio = setTimeout(() => {
    const ativos = portfolioAssets.value
    const total = Number(initialInvestment.value) || 0
    const mensal = Number(monthlyInvestment.value) || 0
    const anos = Number(periodYears.value) || 1
    const final = (t: number, m: number, a: number, rv: boolean) => brlCurto(simular(ativos, t, m, a, rv).resumo.finalValue)
    const maisMensal = Math.max(mensal * 2, 500)
    const maisAnos = Math.min(30, anos + 3)
    ese.value = [
      { texto: reinvestDividends.value ? 'Sem reinvestir os proventos' : 'Reinvestindo os proventos', valor: final(total, mensal, anos, !reinvestDividends.value) },
      { texto: `Guardando ${brl(maisMensal)}/mês`, valor: final(total, maisMensal, anos, reinvestDividends.value) },
      ...(maisAnos > anos ? [{ texto: `Começando há ${anosTxt(maisAnos)}`, valor: final(total, mensal, maisAnos, reinvestDividends.value) }] : []),
    ]
  }, 250)
}, { immediate: true })
onBeforeUnmount(() => { if (eseRelogio) clearTimeout(eseRelogio) })

/* ——— salvar, compartilhar e reabrir (o mesmo vocabulário do deep-link) ——— */
const simParams = computed<Record<string, number>>(() => ({
  initial: initialInvestment.value,
  monthly: monthlyInvestment.value,
  years: periodYears.value,
  reinvest: reinvestDividends.value ? 1 : 0,
}))
// os ativos vão em texto ("ITUB4,VALE3"): o backend aceita só essa chave em texto, só aqui
const simTextos = computed<Record<string, string>>(() => ({ tickers: portfolioAssets.value.map((a) => a.id).join(',') }))
const simLabel = computed(() => `${ativosTxt.value || 'Sem ativo'} · ${brl(initialInvestment.value)} + ${brl(monthlyInvestment.value)}/mês · ${anosTxt(periodYears.value)}`)
const simResult = computed<Record<string, number> | undefined>(() => (pronto.value
  ? { total: Math.round(pronto.value.resumo.finalValue), investido: Math.round(pronto.value.resumo.totalInvested) }
  : undefined))
const link = computed(() => `${CAMINHO}?initial=${initialInvestment.value}&monthly=${monthlyInvestment.value}&years=${periodYears.value}&reinvest=${reinvestDividends.value ? 1 : 0}&tickers=${encodeURIComponent(simTextos.value.tickers!)}`)
const folhaConta = computed(() => {
  const c = pronto.value
  const n = numero.value
  if (!c || !n) return undefined
  // a curva do herói não precisa de todos os pontos semanais
  const pontos = c.curva.map((p) => p.value)
  const passo = Math.max(1, Math.ceil(pontos.length / 60))
  const serie = pontos.filter((_, i) => i % passo === 0 || i === pontos.length - 1)
  return {
    gesto: 'conta' as const,
    rotulo: `${ativosTxt.value} há ${anosTxt(periodYears.value)}`,
    valor: n.valor,
    selo: n.selo,
    seloFalta: n.tom === 'falta',
    serie,
    rotulos: [c.curva[0]?.date ?? '', 'hoje'] as [string, string],
    pergunta: `“E se eu tivesse posto ${brl(Math.max(monthlyInvestment.value * 2, 500))} por mês?”`,
  }
})
function aplicar(p: Record<string, number>) {
  if (Number.isFinite(p.initial)) initialInvestment.value = p.initial!
  if (Number.isFinite(p.monthly)) monthlyInvestment.value = p.monthly!
  if (Number.isFinite(p.years)) periodYears.value = Math.max(1, Math.min(30, Math.round(p.years!)))
  if (Number.isFinite(p.reinvest)) reinvestDividends.value = Boolean(p.reinvest)
}
function aplicarTextos(t: Record<string, string>) {
  const tickers = parseTickersParam(t.tickers)
  if (!tickers.length) return
  const porId = new Map(normalizedAssets.value.map((a) => [a.id, a]))
  portfolioAssets.value = tickers.map((x) => porId.get(x) ?? { id: x, label: x })
}

// depois de mexer na conta, a folha sobe sozinha uma vez (useConviteDaConta)
const salvar = ref<{ pedir: (origem?: 'botao' | 'convite') => Promise<void> } | null>(null)
useConviteDaConta('acoes', () => JSON.stringify([simParams.value, simTextos.value]), () => {
  if (simResult.value) void salvar.value?.pedir('convite')
})
</script>

<template>
  <CalcConta section-id="simulador">
    <template #title><slot name="title">Simulador de ações</slot></template>
    <template #topo>
      <CalcSimSaves variant="history" calculator="acoes" :format-value="brl" @apply="aplicar" @apply-textos="aplicarTextos" />
    </template>
    <template #frase>
      <CalcFrase>
        Se eu tivesse investido <CalcFraseCampo
          v-model="initialInvestment" rotulo="Quanto você teria posto no começo" :min="0" :max="100000" :passo="500"
          :texto="brl(initialInvestment)" prefixo="R$" :atalhos="inicialAtalho"
        /> em <CalcFraseAtivos
          v-model="portfolioAssets" :ativos="normalizedAssets" :carregando="assetsLoading" :sugeridos="SUGERIDOS"
        /> há <CalcFraseCampo
          v-model="periodYears" rotulo="Há quanto tempo" :min="1" :max="30" :passo="1"
          :texto="anosTxt(periodYears)" sufixo="anos" :atalhos="anosAtalho"
        />, guardando <CalcFraseCampo
          v-model="monthlyInvestment" rotulo="Quanto você guardaria por mês" :min="0" :max="10000" :passo="50"
          :texto="brl(monthlyInvestment)" prefixo="R$" :atalhos="mensalAtalho"
        /> por mês e <CalcFraseOpcao v-model="reinvestir" rotulo="Os proventos" :opcoes="reinvestirOpcoes" /> os proventos.
      </CalcFrase>
    </template>

    <template #resultado>
      <CalcNumero v-if="numero" v-bind="numero" />
      <p v-else-if="calculo.estado === 'vazio'" class="cas__aviso">Escolha pelo menos um ativo na frase para ver a conta.</p>
      <div v-else-if="calculo.estado === 'sem-dados'" class="cas__erro" role="alert">
        <p class="cas__erro-texto">Não deu para ler o histórico de {{ calculo.falhos.join(', ') }} agora.</p>
        <button type="button" class="cas__de-novo" @click="carregar">Tentar de novo</button>
      </div>
      <div v-else class="cas__lendo" aria-busy="true">
        <p class="cas__lendo-legenda">Hoje você teria</p>
        <span class="cas__esqueleto" aria-hidden="true" />
        <p class="cas__lendo-texto"><span class="cas__pulso" aria-hidden="true" /> Lendo o histórico de {{ ativosTxt }} na B3…</p>
      </div>
    </template>

    <template #acoes>
      <CalcSimSaves
        ref="salvar" variant="save" calculator="acoes" :caminho="CAMINHO"
        :params="simParams" :textos="simTextos" :label="simLabel" :result="simResult" :folha="folhaConta"
      >
        <CalcCompartilhar :link="link" titulo="A minha simulação de ações, na Redentia" />
      </CalcSimSaves>
    </template>

    <template #grafico>
      <CalcCurva
        v-if="pronto && pronto.curva.length >= 2"
        :valores="pronto.curva.map((p) => p.value)"
        :rotulo-fim="brlCurto(pronto.resumo.finalValue)"
        :rotulos="[pronto.curva[0]!.date, 'hoje']"
      />
    </template>

    <template #depois>
      <CalcEse :itens="ese" aviso="Histórico real da B3. Rentabilidade passada não garante rentabilidade futura.">
        <!-- ativo por ativo: composição e proventos (com mais de um, o resultado de cada um) -->
        <div v-if="pronto" class="cas__detalhes">
          <CalcAcoesAssetResult
            v-for="result in pronto.validos"
            :key="result.ticker"
            :result="result"
            :reinvest="reinvestDividends"
            :resumido="pronto.validos.length === 1"
            branco
          />
        </div>
      </CalcEse>
    </template>
  </CalcConta>
</template>

<style scoped>
.cas__aviso { margin: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 700; }

/* enquanto o histórico sai da B3 */
.cas__lendo-legenda { margin: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 500; }
.cas__esqueleto {
  display: block; width: min(320px, 80%); height: 56px; margin-top: 8px; border-radius: 16px;
  background: linear-gradient(90deg, var(--nu-cream) 0%, var(--nu-cream-2) 50%, var(--nu-cream) 100%);
  background-size: 200% 100%; animation: cas-brilha 1.4s ease-in-out infinite;
}
.cas__lendo-texto { display: flex; align-items: center; gap: 8px; margin: 18px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.cas__pulso { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-blue); animation: cas-pulsa 1.2s ease-in-out infinite; }
@keyframes cas-brilha { from { background-position: 100% 0; } to { background-position: -100% 0; } }
@keyframes cas-pulsa { 50% { opacity: .3; } }
@media (prefers-reduced-motion: reduce) {
  .cas__esqueleto, .cas__pulso { animation: none; }
}

.cas__erro-texto { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; }
.cas__de-novo {
  margin-top: 14px; padding: 10px 18px; border-radius: var(--nu-r-pill); border: 1.5px solid var(--nu-ink);
  background: var(--nu-white); color: var(--nu-ink); font-family: inherit; font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer;
}
.cas__de-novo:hover { background: var(--nu-ink); color: var(--nu-white); }

.cas__detalhes { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(420px, 100%), 1fr)); gap: 16px; max-width: 1180px; margin: clamp(28px, 3.4vw, 40px) auto 0; }
</style>
