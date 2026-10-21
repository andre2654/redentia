<script setup lang="ts">
// Seção interativa da calculadora de dividend yield (saiu da página em
// 21/10/2026). Dono: "tem algumas que têm MUITA configuração, isso afasta
// usuário". Cada um dos cinco modos virou uma frase com os campos dele
// (CalcFraseCampo), no cartão CalcConta, com a escolha do modo em cima: o
// "Salvar esta conta" fica à vista (antes esta calculadora não salvava) e a
// folha de cadastro sobe uma vez depois de mexer (useConviteDaConta).
// Matemática = porte EXATO de Frontend/app/components/calculator/DividendYield.vue
// (3 modos: simples, on cost, projeção) + os modos de renda de 20/08/2026.
// Os comentários das contas vieram da página junto com elas.
import { brl } from '~/components/calc/compound-math'

const props = defineProps<{ sectionId?: string }>()

const route = useRoute()

// ====================================================================
// Estado da calculadora — defaults = exemplos canônicos do conteúdo
// (ação a R$ 25 pagando R$ 1,50/ano; on cost comprou a R$ 20, vale R$ 30;
// projeção LPA 3 / payout 50 / crescimento 10 — placeholders da antiga).
// Os modos 'income' e 'target' (20/08/2026) respondem em reais: o porquê está
// no cabeçalho de pages/calculadora/dividend-yield.vue.
// ====================================================================
type Mode = 'simple' | 'onCost' | 'projection' | 'income' | 'target'
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
// Renda mensal (income): patrimônio + DY médio + aporte → R$/mês
const iPatrimonio = ref(100000)
const iDy = ref(8)
const iAporte = ref(1000)
const iAnos = ref(10)
// Quanto preciso (target): renda desejada + DY médio → patrimônio necessário
const tRenda = ref(5000)
const tDy = ref(8)
const tAporte = ref(1000)
const tInicial = ref(50000)

// ====================================================================
// Deep-link via query params — porte do applyQueryParams antigo.
// ?ticker= hidrata dados REAIS do backend (preço canônico /tickers/{t},
// dividendos 12m de /dividends/{t}, LPA do overview — mesma paridade do
// preco-teto); os params numéricos + ?mode= seguem funcionando e a
// inferência de modo é idêntica. Reativo — sem ?auto (calcula sempre).
//   ?price= ?dividend=       Modo Simples (price também na Projeção)
//   ?purchase= ?current= ?div=   Modo On Cost
//   ?lpa= ?payout= ?growth=      Modo Projeção
//   ?mode=simple|onCost|projection
//   ?modo=0…4                    o mesmo, em número (o link das contas salvas)
// ====================================================================
const MODOS: Mode[] = ['simple', 'onCost', 'projection', 'income', 'target']

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
  const patrimonio = parseNumberParam(q.patrimonio)
  const dy = parseNumberParam(q.dy)
  const aporte = parseNumberParam(q.aporte)
  const anos = parseNumberParam(q.anos)
  const renda = parseNumberParam(q.renda)
  const inicial = parseNumberParam(q.inicial)
  const modo = parseNumberParam(q.modo)
  const m = parseStringParam(q.mode) ?? (modo !== null ? MODOS[modo] ?? null : null)

  // Modo: prioriza ?mode= explícito; senão infere pelos params presentes
  // (mesma regra da página antiga; 'income' e 'target' entram na inferência
  // pelos params exclusivos de cada um — ?renda= só existe no target).
  if (m === 'simple' || m === 'onCost' || m === 'projection' || m === 'income' || m === 'target') {
    mode.value = m
  } else if (renda !== null) {
    mode.value = 'target'
  } else if (patrimonio !== null) {
    mode.value = 'income'
  } else if (purchase !== null || current !== null || div !== null) {
    mode.value = 'onCost'
  } else if (lpa !== null || payout !== null || growth !== null) {
    mode.value = 'projection'
  }

  if (patrimonio !== null) iPatrimonio.value = patrimonio
  if (renda !== null) tRenda.value = renda
  if (inicial !== null) tInicial.value = inicial
  // ?dy= e ?aporte= servem aos dois modos de renda — aplica nos dois pra o
  // deep-link funcionar independente de qual modo o ?mode= escolher.
  if (dy !== null) { iDy.value = dy; tDy.value = dy }
  if (aporte !== null) { iAporte.value = aporte; tAporte.value = aporte }
  if (anos !== null) iAnos.value = anos

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

  // ?ticker= → dados reais (client-side; se houver QUALQUER param numérico
  // explícito, ele manda e o backend não sobrescreve)
  const anyNumeric = [price, dividend, purchase, current, div, lpa, payout, growth, patrimonio, dy, aporte, anos, renda, inicial].some((v) => v !== null)
  const ticker = parseStringParam(q.ticker)?.toUpperCase()
  if (!ticker) tickerDaConta.value = null
  if (import.meta.client && ticker && !anyNumeric) seedFromBackend(ticker)
}

// Tetos dos campos são reativos: dado real acima do teto default expande o
// range (senão mexer no campo depois da hidratação "engoliria" o valor).
const priceMax = ref(200)
const divMax = ref(25)
const lpaMax = ref(30)
function expandMax(target: Ref<number>, value: number) {
  if (value > target.value * 0.8) target.value = Math.ceil((value * 1.5) / 10) * 10
}

// o ticker que veio do ?ticker= e hidratou a conta: a frase do modo simples diz o nome dele
const tickerDaConta = ref<string | null>(null)

// Hidrata os campos com dados REAIS de qualquer ticker (padrão
// seed→real→degrade; paridade com a pré-seleção via API da página antiga).
// Preço da rota canônica /tickers/{t}; dividendo = soma dos proventos pagos
// nos últimos 365d (fallback DY×preço); LPA e payout derivados do overview.
async function seedFromBackend(t: string) {
  if (!/^[A-Z]{4}\d{1,2}$/.test(t)) return
  try {
    const [quote, dividends, overview] = await Promise.all([
      $fetch<any>(`/api/backend/tickers/${t}`),
      $fetch<any>(`/api/backend/dividends/${t}`).catch(() => null),
      $fetch<any>(`/api/backend/fundamentals/${t}/overview`).catch(() => null),
    ])
    const round2 = (n: number) => Math.round(n * 100) / 100
    const stats = overview?.data?.key_statistics ?? {}
    const valuation = overview?.data?.scrape_extras?.valuation ?? {}
    const px = Number(quote?.data?.market_price) || Number(valuation.price) || 0
    const dyPct = Number(stats.dividend_yield) || Number(valuation.dividend_yield) || 0
    const eps = Number(stats.trailing_eps) || Number(valuation.earnings_per_share) || 0

    let annualDividend = 0
    const divList = Array.isArray(dividends?.data) ? dividends.data : []
    const oneYearMs = 365 * 24 * 60 * 60 * 1000
    for (const d of divList) {
      const pd = d?.payment_date ? new Date(d.payment_date).getTime() : NaN
      if (Number.isFinite(pd) && Date.now() - pd <= oneYearMs) annualDividend += parseFloat(d?.rate) || 0
    }
    if (!annualDividend && dyPct && px) annualDividend = (dyPct / 100) * px

    if (px > 0) {
      expandMax(priceMax, px)
      sPrice.value = round2(px)
      pPrice.value = round2(px)
      ocCurrent.value = round2(px)
    }
    if (annualDividend > 0) {
      expandMax(divMax, annualDividend)
      sDiv.value = round2(annualDividend)
      ocDiv.value = round2(annualDividend)
    }
    if (eps > 0) {
      expandMax(lpaMax, eps)
      pLpa.value = round2(eps)
      // payout observado = dividendo 12m ÷ LPA (clamp no range do campo)
      if (annualDividend > 0) pPayout.value = Math.max(1, Math.min(100, Math.round((annualDividend / eps) * 100)))
    }
    if (px > 0) tickerDaConta.value = t
  } catch { /* degrade elegante: os campos ficam como estão */ }
}
applyQueryParams()

// Cenário clicado na própria página → re-aplica e mostra a calculadora.
watch(
  () => route.query,
  () => {
    applyQueryParams()
    if (typeof window !== 'undefined') {
      nextTick(() => document.getElementById(props.sectionId ?? 'dy')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
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

// ====================================================================
// Modos de RENDA (income / target) — a conta em reais.
//
// Premissa declarada na página, e o motivo dela: só o REINVESTIMENTO dos
// dividendos compõe. Preço da cota entra como constante, valorização NÃO é
// projetada. Modelar valorização aqui viraria promessa de rendimento, que é
// exatamente o que o resto do conteúdo desta página se recusa a fazer (ver
// o cabeçalho de app/content/guias/calculadora-de-dividendos.ts). O número
// que sai é conservador de propósito.
//
// Taxa mensal equivalente ao DY anual: (1+dy)^(1/12) - 1, não dy/12. A
// divisão simples superestima ~4% em 8% a.a. ao longo de 20 anos.
// ====================================================================
function monthlyRate(annualPct: number): number {
  return Math.pow(1 + annualPct / 100, 1 / 12) - 1
}

/** FV = P0(1+i)^n + PMT·((1+i)^n − 1)/i, com i=0 tratado (senão divide por zero). */
function futureValue(p0: number, pmt: number, i: number, months: number): number {
  if (months <= 0) return p0
  if (i <= 0) return p0 + pmt * months
  const g = Math.pow(1 + i, months)
  return p0 * g + pmt * ((g - 1) / i)
}

/** A renda do modo income: hoje e daqui a `anos`, com o aporte e o DY dados. */
function rendaDaCarteira(patrimonio: number, dyPct: number, aporte: number, anos: number) {
  const dy = dyPct / 100
  const rendaAnual = patrimonio * dy
  const rendaMensal = rendaAnual / 12
  const i = monthlyRate(dyPct)
  const meses = Math.round(anos * 12)
  const patrimonioFuturo = futureValue(patrimonio, aporte, i, meses)
  const rendaMensalFutura = (patrimonioFuturo * dy) / 12
  const totalAportado = patrimonio + aporte * meses
  return { rendaMensal, rendaAnual, patrimonioFuturo, rendaMensalFutura, totalAportado }
}
const income = computed(() => rendaDaCarteira(iPatrimonio.value, iDy.value, iAporte.value, iAnos.value))

/** Série da renda mensal ano a ano — mesma fórmula, n variando. */
const incomeSeries = computed(() => {
  const i = monthlyRate(iDy.value)
  const dy = iDy.value / 100
  const out: number[] = []
  for (let ano = 0; ano <= iAnos.value; ano++) {
    out.push((futureValue(iPatrimonio.value, iAporte.value, i, ano * 12) * dy) / 12)
  }
  return out
})

/** A conta do modo target: o patrimônio que paga a renda e o tempo até ele. */
function metaDeRenda(renda: number, dyPct: number, inicial: number, aporte: number) {
  const dy = dyPct / 100
  // Patrimônio necessário: renda anual desejada ÷ DY. DY 0 = meta inalcançável
  // por dividendos (Infinity), tratado na formatação.
  const patrimonioNecessario = dy > 0 ? (renda * 12) / dy : Infinity
  const i = monthlyRate(dyPct)
  const faltam = Math.max(0, patrimonioNecessario - inicial)

  // Tempo até a meta: resolve n em FV. n = ln((FV·i + PMT)/(P0·i + PMT))/ln(1+i).
  // Sem aporte e sem juros o denominador zera — devolve null e a UI diz que
  // não chega, em vez de imprimir Infinity.
  let meses: number | null = null
  if (!Number.isFinite(patrimonioNecessario)) meses = null
  else if (faltam <= 0) meses = 0
  else if (i <= 0) meses = aporte > 0 ? faltam / aporte : null
  else {
    const num = patrimonioNecessario * i + aporte
    const den = inicial * i + aporte
    meses = den > 0 && num > 0 ? Math.log(num / den) / Math.log(1 + i) : null
  }
  if (meses !== null && (!Number.isFinite(meses) || meses > 1200)) meses = null // >100 anos = não chega

  return { patrimonioNecessario, faltam, meses }
}
const target = computed(() => metaDeRenda(tRenda.value, tDy.value, tInicial.value, tAporte.value))

// ——— formatação (pt-BR, tabular no CSS) ———
function money(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}
function pct(v: number): string {
  return v.toFixed(2).replace('.', ',') + '%'
}
/** "8%", "8,25%": o percentual que a pessoa escolheu, sem zeros a mais */
const pctCampo = (v: number) => `${String(v).replace('.', ',')}%`
const anosTxt = (n: number) => `${n} ${n === 1 ? 'ano' : 'anos'}`

// DY do número-herói nos 3 modos de MÉTRICA (mesmo results.dy da página
// antiga). Nos modos de renda o herói é em reais.
const heroDy = computed(() => {
  if (mode.value === 'onCost') return onCost.value.dyOnCost
  if (mode.value === 'projection') return projection.value.currentDY
  return simple.value.dy
})

/** Meses → "8 anos e 3 meses" (arredonda pra mês inteiro). */
function anosMeses(meses: number): string {
  const t = Math.max(0, Math.round(meses))
  const a = Math.floor(t / 12)
  const m = t % 12
  if (a === 0) return `${m} ${m === 1 ? 'mês' : 'meses'}`
  if (m === 0) return `${a} ${a === 1 ? 'ano' : 'anos'}`
  return `${a} ${a === 1 ? 'ano' : 'anos'} e ${m} ${m === 1 ? 'mês' : 'meses'}`
}

// Análise automática — textos verbatim da calculadora antiga.
const analysisText = computed(() => {
  if (mode.value === 'income') {
    const r = income.value
    const mult = r.rendaMensal > 0 ? r.rendaMensalFutura / r.rendaMensal : 0
    if (iAporte.value === 0) {
      return `Sem aportes novos, só reinvestindo os dividendos, a renda mensal multiplica por ${mult.toFixed(1).replace('.', ',')}x em ${iAnos.value} anos. É o efeito da bola de neve sobre o preço de compra travado.`
    }
    return `Aportando ${money(iAporte.value)} por mês e reinvestindo tudo, a renda sai de ${money(r.rendaMensal)} para ${money(r.rendaMensalFutura)} por mês em ${iAnos.value} anos. A projeção considera só o reinvestimento dos dividendos, sem valorização da cota.`
  }
  if (mode.value === 'target') {
    const t = target.value
    if (!Number.isFinite(t.patrimonioNecessario)) return 'Com DY zero não há renda de dividendos. Ajuste o yield médio da carteira pra ver a conta.'
    if (t.meses === 0) return 'Seu patrimônio atual já cobre essa meta de renda no DY informado. Vale checar a sustentabilidade do payout das pagadoras antes de contar com ela.'
    if (t.meses === null) return `Com o aporte atual a meta não é alcançada em prazo razoável. Aumente o aporte mensal ou reveja a renda desejada.`
    return `Reserve uma margem de 15-20% acima disso: dividendo não é contratual, e corte de payout numa pagadora derruba a renda sem aviso. Diversificar em 10-15 pagadoras reduz esse risco específico.`
  }
  const dy = heroDy.value
  if (dy < 3) return 'DY abaixo de 3% é considerado baixo. Pode indicar empresa de crescimento ou ação cara.'
  if (dy < 6) return 'DY entre 3-6% é considerado bom para ações. Equilibra dividendos e crescimento.'
  if (dy < 10) return 'DY entre 6-10% é excelente! Típico de boas pagadoras de dividendos ou FIIs.'
  return 'DY muito alto (>10%) pode indicar: ação em queda, dividendo extraordinário ou risco elevado. Investigue!'
})

/* ——— a frase (21/10/2026) ——— */
const CAMINHO = '/calculadora/dividend-yield'
const modeOptions = [
  { value: 'simple' as Mode, label: 'DY simples' },
  { value: 'onCost' as Mode, label: 'DY on cost' },
  { value: 'projection' as Mode, label: 'Projeção' },
  { value: 'income' as Mode, label: 'Renda mensal' },
  { value: 'target' as Mode, label: 'Quanto preciso' },
]
const dyPresets = [
  { label: 'Ações 6%', value: 6 },
  { label: 'Mista 8%', value: 8 },
  { label: 'FIIs 10%', value: 10 },
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
const patrimonioAtalho = [10000, 50000, 100000, 500000].map((v) => ({ label: brlCurto(v), value: v }))
const aporteAtalho = [0, 500, 1000, 3000].map((v) => ({ label: brl(v), value: v }))
const rendaAtalho = [1000, 3000, 5000, 10000].map((v) => ({ label: brl(v), value: v }))
const anosAtalho = [5, 10, 20, 30].map((v) => ({ label: `${v} anos`, value: v }))

// o número, o selo e a linha que explica, pelo modo
const numero = computed(() => {
  if (mode.value === 'simple') {
    return {
      legenda: 'O dividend yield é de',
      valor: pct(simple.value.dy),
      selo: `${money(sDiv.value / 12)} por mês, por ação`,
      tom: 'azul' as const,
      explica: analysisText.value,
    }
  }
  if (mode.value === 'onCost') {
    const r = onCost.value
    const subiu = r.appreciation >= 0
    return {
      legenda: 'O seu DY on cost é de',
      valor: pct(r.dyOnCost),
      selo: `${pct(r.dyCurrent)} no preço de hoje`,
      tom: 'azul' as const,
      explica: `A ação ${subiu ? 'subiu' : 'caiu'} ${Math.abs(r.appreciation).toFixed(1).replace('.', ',')}% desde a compra. Somando a valorização ao DY on cost, o ganho é de ${pct(r.totalReturn)}.`,
    }
  }
  if (mode.value === 'projection') {
    const r = projection.value
    return {
      legenda: 'O DY de hoje é de',
      valor: pct(r.currentDY),
      selo: `${pct(r.projectedDY3y)} em 3 anos`,
      tom: 'azul' as const,
      explica: `Com o lucro crescendo ${pctCampo(pGrowth.value)} ao ano e ${pctCampo(pPayout.value)} dele em dividendos, o DY sobre o preço de hoje vai a ${pct(r.projectedDY1y)} em 1 ano e ${pct(r.projectedDY3y)} em 3.`,
    }
  }
  if (mode.value === 'income') {
    const r = income.value
    return {
      legenda: 'Você recebe por mês',
      valor: brl(r.rendaMensal),
      selo: `${brl(r.rendaMensalFutura)}/mês em ${anosTxt(iAnos.value)}`,
      tom: 'azul' as const,
      explica: analysisText.value,
    }
  }
  const t = target.value
  const chega = t.meses === 0
    ? { selo: '✓ O que você tem já paga essa renda', tom: 'ok' as const }
    : t.meses === null
      ? { selo: 'Com esse aporte, não chega', tom: 'falta' as const }
      : { selo: `Chega lá em ${anosMeses(t.meses)}`, tom: 'azul' as const }
  return {
    legenda: 'Você precisa de',
    valor: Number.isFinite(t.patrimonioNecessario) ? brl(t.patrimonioNecessario) : '—',
    ...chega,
    explica: `${t.faltam > 0 && Number.isFinite(t.faltam) ? `Faltam ${brl(t.faltam)}. ` : ''}${analysisText.value}`,
  }
})

// a régua do DY (modos simples e on cost): onde o número cai entre baixo, bom, excelente e alto
const REGUA_MAX = 15
const FAIXAS = [
  { de: 0, ate: 3, nome: 'Baixo', tom: 'baixo' },
  { de: 3, ate: 6, nome: 'Bom', tom: 'bom' },
  { de: 6, ate: 10, nome: 'Excelente', tom: 'otimo' },
  { de: 10, ate: 15, nome: 'Investigue', tom: 'alto' },
]
const naRegua = (v: number) => `${Math.max(0, Math.min(100, (v / REGUA_MAX) * 100))}%`
const faixaDe = (v: number) => (FAIXAS.find((f) => v < f.ate) ?? FAIXAS[FAIXAS.length - 1]!).tom
const marcas = computed(() => (mode.value === 'onCost'
  ? [
      { v: onCost.value.dyOnCost, rotulo: 'on cost', principal: true },
      { v: onCost.value.dyCurrent, rotulo: 'hoje', principal: false },
    ]
  : [{ v: simple.value.dy, rotulo: '', principal: true }]))

// a curva do modo target: o patrimônio ano a ano até a meta (ou 30 anos, se não chega)
const curvaDaMeta = computed(() => {
  const t = target.value
  if (!Number.isFinite(t.patrimonioNecessario)) return null
  const anos = t.meses === null ? 30 : Math.max(1, Math.min(40, Math.ceil(t.meses / 12)))
  const i = monthlyRate(tDy.value)
  return { anos, valores: Array.from({ length: anos + 1 }, (_, k) => futureValue(tInicial.value, tAporte.value, i, k * 12)) }
})

const ese = computed(() => {
  if (mode.value === 'income') {
    const futura = (dyPct: number, aporte: number, anos: number) => `${brl(rendaDaCarteira(iPatrimonio.value, dyPct, aporte, anos).rendaMensalFutura)}/mês`
    return [
      { texto: `Com DY de ${pctCampo(iDy.value + 2)}`, valor: futura(iDy.value + 2, iAporte.value, iAnos.value) },
      { texto: `Guardar ${brl(Math.max(iAporte.value * 2, 500))}/mês`, valor: futura(iDy.value, Math.max(iAporte.value * 2, 500), iAnos.value) },
      { texto: `Por ${anosTxt(iAnos.value + 10)}`, valor: futura(iDy.value, iAporte.value, iAnos.value + 10) },
    ]
  }
  if (mode.value === 'target') {
    const t = target.value
    if (!Number.isFinite(t.patrimonioNecessario) || t.meses === 0) return []
    const tempo = (aporte: number) => {
      const m = metaDeRenda(tRenda.value, tDy.value, tInicial.value, aporte).meses
      return m === null ? 'não chega' : `chega em ${anosMeses(m)}`
    }
    return [
      { texto: `Guardar ${brl(Math.max(tAporte.value * 2, 500))}/mês`, valor: tempo(Math.max(tAporte.value * 2, 500)) },
      { texto: `Com DY de ${pctCampo(tDy.value + 2)}`, valor: `precisa de ${brlCurto(metaDeRenda(tRenda.value, tDy.value + 2, tInicial.value, tAporte.value).patrimonioNecessario)}` },
      { texto: `Viver com ${brl(tRenda.value * 0.8)}/mês`, valor: `precisa de ${brlCurto(metaDeRenda(tRenda.value * 0.8, tDy.value, tInicial.value, tAporte.value).patrimonioNecessario)}` },
    ]
  }
  return []
})

/* ——— salvar, compartilhar e reabrir (o mesmo vocabulário do deep-link) ——— */
// os params salvos são só números: o modo vai como modo=0…4, e só os campos dele
const simParams = computed((): Record<string, number> => {
  const modo = MODOS.indexOf(mode.value)
  if (mode.value === 'simple') return { modo, price: sPrice.value, dividend: sDiv.value }
  if (mode.value === 'onCost') return { modo, purchase: ocPurchase.value, current: ocCurrent.value, div: ocDiv.value }
  if (mode.value === 'projection') return { modo, price: pPrice.value, lpa: pLpa.value, payout: pPayout.value, growth: pGrowth.value }
  if (mode.value === 'income') return { modo, patrimonio: iPatrimonio.value, dy: iDy.value, aporte: iAporte.value, anos: iAnos.value }
  return { modo, renda: tRenda.value, dy: tDy.value, inicial: tInicial.value, aporte: tAporte.value }
})
const simLabel = computed(() => {
  if (mode.value === 'simple') return `DY de ${pct(simple.value.dy)}${tickerDaConta.value ? ` · ${tickerDaConta.value}` : ''} · ${money(sPrice.value)} pagando ${money(sDiv.value)}/ano`
  if (mode.value === 'onCost') return `DY on cost de ${pct(onCost.value.dyOnCost)} · comprou a ${money(ocPurchase.value)}`
  if (mode.value === 'projection') return `DY de ${pct(projection.value.currentDY)} hoje, ${pct(projection.value.projectedDY3y)} em 3 anos`
  if (mode.value === 'income') return `${brlCurto(iPatrimonio.value)} a ${pctCampo(iDy.value)} de DY · ${brl(income.value.rendaMensal)}/mês`
  return `${brl(tRenda.value)}/mês de dividendos a ${pctCampo(tDy.value)} de DY`
})
const valorDoModo = computed(() => {
  if (mode.value === 'income') return income.value.rendaMensal
  if (mode.value === 'target') return target.value.patrimonioNecessario
  return heroDy.value
})
const simResult = computed<Record<string, number> | undefined>(() => (Number.isFinite(valorDoModo.value)
  ? { total: Math.round(valorDoModo.value * 100) / 100, modo: MODOS.indexOf(mode.value) }
  : undefined))
// no histórico: percentual nos modos de métrica, reais nos de renda
function formatarResultado(r: Record<string, number>): string | null {
  if (!Number.isFinite(r.total)) return null
  return (r.modo ?? 0) >= 3 ? (r.modo === 3 ? `${brl(r.total!)}/mês` : brl(r.total!)) : pct(r.total!)
}
const link = computed(() => {
  const q = Object.entries(simParams.value).filter(([k]) => k !== 'modo').map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
  return `${CAMINHO}?mode=${mode.value}&${q.join('&')}`
})
const folhaConta = computed(() => {
  const n = numero.value
  const base = { gesto: 'conta' as const, valor: n.valor, selo: n.selo, seloFalta: n.tom === 'falta' }
  if (mode.value === 'income') {
    return {
      ...base,
      rotulo: `${brlCurto(iPatrimonio.value)} a ${pctCampo(iDy.value)} de dividend yield`,
      valor: `${n.valor}/mês`,
      serie: incomeSeries.value,
      rotulos: ['hoje', anosTxt(iAnos.value)] as [string, string],
      pergunta: `“Quanto recebo se eu guardar ${brl(Math.max(iAporte.value * 2, 500))} por mês?”`,
    }
  }
  if (mode.value === 'target') {
    const c = curvaDaMeta.value
    return {
      ...base,
      rotulo: `Para receber ${brl(tRenda.value)} por mês`,
      serie: c?.valores,
      meta: Number.isFinite(target.value.patrimonioNecessario) ? target.value.patrimonioNecessario : null,
      rotuloMeta: Number.isFinite(target.value.patrimonioNecessario) ? `a meta, ${brlCurto(target.value.patrimonioNecessario)}` : undefined,
      rotulos: c ? (['hoje', anosTxt(c.anos)] as [string, string]) : undefined,
      pergunta: `“E se eu guardar ${brl(Math.max(tAporte.value * 2, 500))} por mês?”`,
    }
  }
  if (mode.value === 'projection') {
    return { ...base, rotulo: 'Dividend yield de hoje', serie: projSeries.value, rotulos: ['hoje', `${PROJ_YEARS} anos`] as [string, string], pergunta: '“E se o lucro crescer menos?”' }
  }
  if (mode.value === 'onCost') {
    return { ...base, rotulo: `Comprou a ${money(ocPurchase.value)}`, pergunta: '“Como o DY on cost cresce com o tempo?”' }
  }
  return { ...base, rotulo: tickerDaConta.value ? `Dividend yield de ${tickerDaConta.value}` : 'Dividend yield', pergunta: '“Esse dividendo é sustentável?”' }
})
function aplicar(p: Record<string, number>) {
  const m = MODOS[p.modo ?? -1]
  if (m) mode.value = m
  if (m === 'simple') {
    if (Number.isFinite(p.price)) sPrice.value = p.price!
    if (Number.isFinite(p.dividend)) sDiv.value = p.dividend!
  }
  else if (m === 'onCost') {
    if (Number.isFinite(p.purchase)) ocPurchase.value = p.purchase!
    if (Number.isFinite(p.current)) ocCurrent.value = p.current!
    if (Number.isFinite(p.div)) ocDiv.value = p.div!
  }
  else if (m === 'projection') {
    if (Number.isFinite(p.price)) pPrice.value = p.price!
    if (Number.isFinite(p.lpa)) pLpa.value = p.lpa!
    if (Number.isFinite(p.payout)) pPayout.value = p.payout!
    if (Number.isFinite(p.growth)) pGrowth.value = p.growth!
  }
  else if (m === 'income') {
    if (Number.isFinite(p.patrimonio)) iPatrimonio.value = p.patrimonio!
    if (Number.isFinite(p.dy)) iDy.value = p.dy!
    if (Number.isFinite(p.aporte)) iAporte.value = p.aporte!
    if (Number.isFinite(p.anos)) iAnos.value = p.anos!
  }
  else if (m === 'target') {
    if (Number.isFinite(p.renda)) tRenda.value = p.renda!
    if (Number.isFinite(p.dy)) tDy.value = p.dy!
    if (Number.isFinite(p.inicial)) tInicial.value = p.inicial!
    if (Number.isFinite(p.aporte)) tAporte.value = p.aporte!
  }
  for (const [v, teto] of [[sPrice.value, priceMax], [pPrice.value, priceMax], [ocPurchase.value, priceMax], [ocCurrent.value, priceMax], [sDiv.value, divMax], [ocDiv.value, divMax], [pLpa.value, lpaMax]] as const) {
    expandMax(teto, v)
  }
}

// depois de mexer na conta, a folha sobe sozinha uma vez (useConviteDaConta)
const salvar = ref<{ pedir: (origem?: 'botao' | 'convite') => Promise<void> } | null>(null)
useConviteDaConta('dividend-yield', () => JSON.stringify(simParams.value), () => {
  if (simResult.value) void salvar.value?.pedir('convite')
})
</script>

<template>
  <CalcConta :section-id="sectionId ?? 'dy'">
    <template #title><slot name="title">Calculadora de dividend yield</slot></template>
    <template #topo>
      <CalcSimSaves variant="history" calculator="dividend-yield" :format-result="formatarResultado" @apply="aplicar" />
    </template>
    <template #frase>
      <CalcEscolha v-model="mode" rotulo="O que você quer calcular" :opcoes="modeOptions" class="dys__modos" />

      <CalcFrase v-if="mode === 'simple'">
        <template v-if="tickerDaConta">
          <b class="dys__ticker">{{ tickerDaConta }}</b> está a <CalcFraseCampo
            v-model="sPrice" rotulo="Preço da ação" :min="1" :max="priceMax" :passo="0.5"
            :texto="money(sPrice)" prefixo="R$"
          /> e pagou <CalcFraseCampo
            v-model="sDiv" rotulo="Dividendos por ano" :min="0" :max="divMax" :passo="0.05"
            :texto="money(sDiv)" prefixo="R$"
          /> de dividendos nos últimos 12 meses.
        </template>
        <template v-else>
          Uma ação a <CalcFraseCampo
            v-model="sPrice" rotulo="Preço da ação" :min="1" :max="priceMax" :passo="0.5"
            :texto="money(sPrice)" prefixo="R$"
          /> paga <CalcFraseCampo
            v-model="sDiv" rotulo="Dividendos por ano" :min="0" :max="divMax" :passo="0.05"
            :texto="money(sDiv)" prefixo="R$"
          /> de dividendos por ano.
        </template>
      </CalcFrase>

      <CalcFrase v-else-if="mode === 'onCost'">
        Comprei a <CalcFraseCampo
          v-model="ocPurchase" rotulo="Preço de compra" :min="1" :max="priceMax" :passo="0.5"
          :texto="money(ocPurchase)" prefixo="R$"
        />. Hoje ela vale <CalcFraseCampo
          v-model="ocCurrent" rotulo="Preço de hoje" :min="1" :max="priceMax" :passo="0.5"
          :texto="money(ocCurrent)" prefixo="R$"
        /> e paga <CalcFraseCampo
          v-model="ocDiv" rotulo="Dividendos por ano" :min="0" :max="divMax" :passo="0.05"
          :texto="money(ocDiv)" prefixo="R$"
        /> por ano.
      </CalcFrase>

      <CalcFrase v-else-if="mode === 'projection'">
        A ação está a <CalcFraseCampo
          v-model="pPrice" rotulo="Preço da ação" :min="1" :max="priceMax" :passo="0.5"
          :texto="money(pPrice)" prefixo="R$"
        /> e lucra <CalcFraseCampo
          v-model="pLpa" rotulo="Lucro por ação (LPA)" :min="0" :max="lpaMax" :passo="0.1"
          :texto="money(pLpa)" prefixo="R$"
        /> por ação. Paga <CalcFraseCampo
          v-model="pPayout" rotulo="Payout ratio" :min="0" :max="100" :passo="1"
          :texto="pctCampo(pPayout)" sufixo="%" :atalhos="payoutPresets"
        /> do lucro, e o lucro cresce <CalcFraseCampo
          v-model="pGrowth" rotulo="Crescimento do lucro por ano" :min="-50" :max="100" :passo="1"
          :texto="pctCampo(pGrowth)" sufixo="% a.a." :atalhos="growthPresets"
        /> ao ano.
      </CalcFrase>

      <CalcFrase v-else-if="mode === 'income'">
        Tenho <CalcFraseCampo
          v-model="iPatrimonio" rotulo="Patrimônio investido" :min="0" :max="1000000" :passo="5000"
          :texto="brl(iPatrimonio)" prefixo="R$" :atalhos="patrimonioAtalho"
        /> investidos, com <CalcFraseCampo
          v-model="iDy" rotulo="Dividend yield médio da carteira" :min="0" :max="15" :passo="0.25"
          :texto="pctCampo(iDy)" sufixo="%" :atalhos="dyPresets"
        /> de dividend yield. Guardo <CalcFraseCampo
          v-model="iAporte" rotulo="Quanto você guarda por mês" :min="0" :max="10000" :passo="100"
          :texto="brl(iAporte)" prefixo="R$" :atalhos="aporteAtalho"
        /> por mês por <CalcFraseCampo
          v-model="iAnos" rotulo="Por quanto tempo" :min="1" :max="40" :passo="1"
          :texto="anosTxt(iAnos)" sufixo="anos" :atalhos="anosAtalho"
        />.
      </CalcFrase>

      <CalcFrase v-else>
        Quero receber <CalcFraseCampo
          v-model="tRenda" rotulo="Renda por mês" :min="500" :max="30000" :passo="500"
          :texto="brl(tRenda)" prefixo="R$" :atalhos="rendaAtalho"
        /> por mês de dividendos, com <CalcFraseCampo
          v-model="tDy" rotulo="Dividend yield médio da carteira" :min="0" :max="15" :passo="0.25"
          :texto="pctCampo(tDy)" sufixo="%" :atalhos="dyPresets"
        /> de dividend yield. Já tenho <CalcFraseCampo
          v-model="tInicial" rotulo="Patrimônio que você já tem" :min="0" :max="1000000" :passo="5000"
          :texto="brl(tInicial)" prefixo="R$" :atalhos="patrimonioAtalho"
        /> e guardo <CalcFraseCampo
          v-model="tAporte" rotulo="Quanto você guarda por mês" :min="0" :max="10000" :passo="100"
          :texto="brl(tAporte)" prefixo="R$" :atalhos="aporteAtalho"
        /> por mês.
      </CalcFrase>
    </template>

    <template #resultado>
      <CalcNumero v-bind="numero" />
    </template>

    <template #acoes>
      <CalcSimSaves
        ref="salvar" variant="save" calculator="dividend-yield" :caminho="CAMINHO"
        :params="simParams" :label="simLabel" :result="simResult" :folha="folhaConta"
      >
        <CalcCompartilhar :link="link" titulo="A minha conta de dividendos, na Redentia" />
      </CalcSimSaves>
    </template>

    <template #grafico>
      <!-- simples e on cost: a régua do DY -->
      <div v-if="mode === 'simple' || mode === 'onCost'" class="dys__regua" :class="{ 'dys__regua--dupla': mode === 'onCost' }" aria-hidden="true">
        <p class="dys__regua-titulo">Na régua do dividend yield</p>
        <p class="dys__regua-faixa" :class="`dys__regua-faixa--${faixaDe(heroDy)}`">{{ FAIXAS.find((f) => f.tom === faixaDe(heroDy))?.nome }}</p>
        <div class="dys__trilho">
        <div class="dys__marcas">
          <span
            v-for="m in marcas" :key="m.rotulo || 'dy'"
            class="dys__marca" :class="{ 'dys__marca--hoje': !m.principal }" :style="{ left: naRegua(m.v) }"
          >
            <span class="dys__marca-txt">{{ pct(m.v) }}<small v-if="m.rotulo"> {{ m.rotulo }}</small></span>
          </span>
        </div>
        <div class="dys__faixas">
          <span
            v-for="f in FAIXAS" :key="f.tom"
            class="dys__faixa" :class="[`dys__faixa--${f.tom}`, { 'dys__faixa--on': faixaDe(heroDy) === f.tom }]"
            :style="{ flexGrow: f.ate - f.de }"
          />
        </div>
        <div class="dys__nomes">
          <span v-for="f in FAIXAS" :key="f.tom" :style="{ flexGrow: f.ate - f.de }" :class="{ 'dys__nome--on': faixaDe(heroDy) === f.tom }">
            {{ f.nome }} <small>{{ f.de }}–{{ f.ate }}%{{ f.ate === REGUA_MAX ? '+' : '' }}</small>
          </span>
        </div>
        </div>
      </div>
      <CalcCurva
        v-else-if="mode === 'projection'"
        :valores="projSeries"
        :rotulo-fim="`${pct(projSeries[projSeries.length - 1] ?? 0)} em ${PROJ_YEARS} anos`"
        :rotulos="['hoje', `daqui a ${PROJ_YEARS} anos`]"
      />
      <CalcCurva
        v-else-if="mode === 'income'"
        :valores="incomeSeries"
        :rotulo-fim="`${brl(income.rendaMensalFutura)}/mês`"
        :rotulos="['hoje', `daqui a ${anosTxt(iAnos)}`]"
      />
      <CalcCurva
        v-else-if="curvaDaMeta"
        :valores="curvaDaMeta.valores"
        :meta="target.patrimonioNecessario"
        :rotulo-meta="`a meta, ${brlCurto(target.patrimonioNecessario)}`"
        :rotulos="['hoje', `daqui a ${anosTxt(curvaDaMeta.anos)}`]"
      />
    </template>

    <template #depois>
      <CalcEse
        :itens="ese"
        aviso="Dividend yield alto não é sempre bom. Verifique se os dividendos são sustentáveis pelo payout ratio (ideal de 40-60% para ações, 95%+ para FIIs)."
      />
    </template>
  </CalcConta>
</template>

<style scoped>
.dys__modos { margin-bottom: 18px; }
.dys__ticker { color: var(--nu-ink); font-weight: 800; }

/* a régua do DY: o nome da faixa em cima, as quatro faixas e a marca do número */
.dys__regua-titulo { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700; }
.dys__regua-faixa { margin: 2px 0 0; font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; }
.dys__regua-faixa--baixo { color: var(--nu-gray-2); }
.dys__regua-faixa--bom, .dys__regua-faixa--otimo { color: var(--nu-blue); }
.dys__regua-faixa--alto { color: var(--nu-serie-2); }
.dys__trilho { position: relative; margin-top: 14px; padding: 54px 0 4px; }
.dys__marcas { position: absolute; inset: 0; pointer-events: none; }
.dys__marca {
  position: absolute; top: 0; height: 54px; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
  transition: left .35s cubic-bezier(.22, 1, .36, 1);
}
.dys__marca::after { content: ''; width: 2px; height: 14px; margin-top: 4px; border-radius: 2px; background: var(--nu-blue); }
.dys__marca-txt {
  padding: 4px 10px; border-radius: var(--nu-r-pill); background: var(--nu-blue); color: var(--nu-white);
  font-size: var(--nu-fs-sm); font-weight: 800; white-space: nowrap; font-variant-numeric: tabular-nums;
}
.dys__marca-txt small { margin-left: 4px; font-size: var(--nu-fs-xs); font-weight: 700; opacity: .85; }
/* a do preço de hoje (on cost): embaixo da régua, em cinza; os nomes das faixas descem */
.dys__marca--hoje { top: 68px; height: auto; justify-content: flex-start; }
.dys__marca--hoje::after { display: none; }
.dys__marca--hoje::before { content: ''; width: 2px; height: 14px; margin-bottom: 4px; border-radius: 2px; background: var(--nu-gray); }
.dys__marca--hoje .dys__marca-txt { background: var(--nu-cream); color: var(--nu-gray-2); }
.dys__regua--dupla .dys__nomes { margin-top: 56px; }
.dys__faixas { display: flex; gap: 4px; height: 14px; }
.dys__faixa { border-radius: 7px; background: var(--nu-cream-2); transition: background .25s ease; }
.dys__faixa--on.dys__faixa--baixo { background: var(--nu-gray); }
.dys__faixa--on.dys__faixa--bom { background: var(--nu-blue-soft); }
.dys__faixa--on.dys__faixa--otimo { background: var(--nu-blue); }
.dys__faixa--on.dys__faixa--alto { background: var(--nu-serie-2); }
.dys__nomes { display: flex; gap: 4px; margin-top: 10px; }
.dys__nomes > span { flex-basis: 0; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 700; }
.dys__nomes small { display: block; font-size: var(--nu-fs-xs); font-weight: 500; }
.dys__nome--on { color: var(--nu-ink) !important; }
</style>
