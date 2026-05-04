<!--
  MoleculesPortfolioQuiz — multi-step onboarding quiz pra /raio-x.

  Replaces "digite seu ticker" como acao primaria do hero. Estrategia
  Acorns/Wealthfront/Betterment: 5 perguntas progressivas + tela de review
  com possibilidade de editar/customizar a carteira gerada.

  POR QUE EXISTE:
  Pre-quiz, o /raio-x tinha 1.1% LPV → Lead. Pessoa que vinha do anuncio
  caia numa pagina de selecao livre ("digite tickers") sem saber tickers.
  Bench multi-step: 13.85% conversion vs 4.53% single-page (3x lift).

  COMO FUNCIONA:
  - 5 perguntas sequenciais (single-select avanca automatico, multi-select
    tem botao "Continuar"). Cada pergunta tem barra de progresso visivel
    + label "Pergunta X de 5" pra criar sensacao de "perto do fim".
  - Apos P5: tela de REVIEW com 2 caminhos visiveis:
      a) "Analisar essa carteira (recomendado)" → usa template do perfil
      b) "Tenho minha carteira" → abre editor inline (chips + busca)
    Editor e SIMPLES: lista chips selecionados + sugestoes do perfil +
    input pra digitar ticker custom + voltar pra sugestao.
  - Apos confirmar, mostra animacao "analisando..." de 1.8s
  - Emite @submit com PortfolioInput[] (template ou custom)

  GERACAO DE CARTEIRA:
  4 templates (iniciante / conservador / moderado / arrojado), escolhidos
  via `inferPersona()` que pondera horizon, concern e patrimony. Templates
  usam tickers que ja existem no resolveTicker do composable, entao a
  analise sai com fundamentals reais.

  COMPATIBILIDADE:
  - Funciona standalone (sem props obrigatorias)
  - Emite tickers no formato PortfolioInput[] esperado pelo onPickerSubmit
  - Reusa pixel firing existente (Lead dispara quando page re-renderiza
    com hasTickers=true)
-->
<script setup lang="ts">
import { SUGGESTED_TICKERS, resolveTicker } from '~/composables/usePortfolioScore'
import type { PortfolioInput } from '~/composables/usePortfolioScore'

interface Emits {
  (e: 'submit', tickers: PortfolioInput[]): void
  (e: 'fallback'): void  // user clicou "ja tenho carteira pronta"
}
const emit = defineEmits<Emits>()

const brand = useBrand()
const { track } = useMetaPixel()

// ============ STATE ============
// Steps:
//   1-5: perguntas
//   'review': preview da carteira sugerida + botao pra customizar
//   'edit': editor inline (chips + busca) — quem ja tem carteira propria
//   'loading': "analisando" antes de emit
type Step = 1 | 2 | 3 | 4 | 5 | 'review' | 'edit' | 'loading'

const currentStep = ref<Step>(1)

interface Answers {
  invest: '' | 'sim' | 'comecando' | 'nao'
  holdings: string[]   // multi-select: 'acoes' | 'fii' | 'tesouro' | 'intl' | 'naosei'
  patrimony: '' | 'ate-50k' | '50-200k' | '200k-1m' | 'mais-1m'
  concern: '' | 'queda' | 'inflacao' | 'incerto' | 'risco'
  horizon: '' | 'curto' | 'medio' | 'longo' | 'naosei'
}

// Lista mutavel de tickers que o user esta editando.
// No step 'edit', cada toggle/add/remove muda essa lista. No submit final
// (botao "Gerar Raio-X" do edit), emitimos com base nessa lista. Se o user
// vai pelo caminho "Analisar essa carteira", emitimos o template do perfil
// e ignoramos esse array.
const customTickers = ref<string[]>([])
const customInput = ref('')          // texto sendo digitado no input do edit
const customError = ref('')          // erro de validacao do input


const answers = reactive<Answers>({
  invest: '',
  holdings: [],
  patrimony: '',
  concern: '',
  horizon: '',
})

// Barra de progresso: enquanto nas perguntas, mostra fracao das 5;
// nos steps 'review' e 'edit', mostra 100% (ja terminou as perguntas).
const progressPct = computed(() => {
  if (typeof currentStep.value === 'number') {
    return Math.min(100, ((currentStep.value - 1) / 5) * 100 + 10)
  }
  return 100
})

const canProceed = computed(() => {
  if (currentStep.value === 1) return !!answers.invest
  if (currentStep.value === 2) return answers.holdings.length > 0
  if (currentStep.value === 3) return !!answers.patrimony
  if (currentStep.value === 4) return !!answers.concern
  if (currentStep.value === 5) return !!answers.horizon
  return false
})

// No step 'edit', o submit so habilita se user tem >= 2 tickers (carteira
// de 1 ativo nao da analise rica). 2 e o minimo razoavel pra Raio-X.
const canSubmitCustom = computed(() => customTickers.value.length >= 2)

// ============ QUESTION DATA ============
// Visual: emoji + label. Emoji da escala humana imediata na decisao
// (mais rapido que ler 4-5 palavras). Mantemos texto curto.

const HOLDINGS_OPTIONS = [
  { id: 'acoes', emoji: '📈', label: 'Ações brasileiras' },
  { id: 'fii', emoji: '🏢', label: 'Fundos imobiliários (FIIs)' },
  { id: 'tesouro', emoji: '💵', label: 'Tesouro Direto' },
  { id: 'intl', emoji: '🌍', label: 'BDRs ou ETFs internacionais' },
  { id: 'naosei', emoji: '🤷', label: 'Não sei direito' },
] as const

const PATRIMONY_OPTIONS = [
  { id: 'ate-50k', label: 'Até R$ 50 mil', sub: 'Começando ou organizando' },
  { id: '50-200k', label: 'R$ 50 mil – R$ 200 mil', sub: 'Em construção' },
  { id: '200k-1m', label: 'R$ 200 mil – R$ 1 milhão', sub: 'Patrimônio sólido' },
  { id: 'mais-1m', label: 'Mais de R$ 1 milhão', sub: 'Investidor consolidado' },
] as const

const CONCERN_OPTIONS = [
  { id: 'queda', emoji: '📉', label: 'Bolsa cair forte' },
  { id: 'inflacao', emoji: '🔥', label: 'Inflação corroer meu dinheiro' },
  { id: 'incerto', emoji: '🔍', label: 'Não saber se a carteira está bem' },
  { id: 'risco', emoji: '⚠️', label: 'Risco escondido sem perceber' },
] as const

const HORIZON_OPTIONS = [
  { id: 'curto', label: 'Menos de 2 anos', sub: 'Curto prazo' },
  { id: 'medio', label: '2 a 10 anos', sub: 'Médio prazo' },
  { id: 'longo', label: 'Aposentadoria (10+ anos)', sub: 'Longo prazo' },
  { id: 'naosei', label: 'Ainda não sei', sub: 'Sem horizonte definido' },
] as const

// ============ NAVIGATION ============

function goNext() {
  if (!canProceed.value) return

  // Track progressao no Meta Pixel pra medir abandonment por step.
  // Custom event (nao bate em standard event), so pra analytics interno.
  track('CustomizeProduct', {
    content_name: 'Quiz Step',
    content_category: 'portfolio_quiz',
    step: currentStep.value,
    currency: 'BRL',
    value: 0,
  })

  if (typeof currentStep.value === 'number' && currentStep.value < 5) {
    currentStep.value = (currentStep.value + 1) as Step
  }
  else if (currentStep.value === 5) {
    // P5 terminou — vai pra tela de REVIEW (preview da carteira gerada).
    // Pre-popula customTickers com os tickers do template, pra caso o
    // user clique "tenho minha carteira" os chips ja apareçam preenchidos.
    const generated = generatePortfolio()
    customTickers.value = generated.map(t => t.ticker)
    currentStep.value = 'review'
  }
}

function goBack() {
  // Voltar funciona dentro das perguntas (1-5) e do edit (volta pra review).
  if (typeof currentStep.value === 'number' && currentStep.value > 1) {
    currentStep.value = (currentStep.value - 1) as Step
  }
  else if (currentStep.value === 'edit') {
    currentStep.value = 'review'
  }
  else if (currentStep.value === 'review') {
    // Voltar de review pra P5 — permite pessoa mudar a ultima resposta.
    currentStep.value = 5
  }
}

// ============ REVIEW / EDIT FLOW ============

function acceptSuggested() {
  // Caminho 1: aceitar carteira sugerida do perfil → loading + emit template
  track('CustomizeProduct', {
    content_name: 'Quiz Accept Suggested',
    content_category: 'portfolio_quiz',
    currency: 'BRL',
    value: 0,
  })
  currentStep.value = 'loading'
  setTimeout(() => {
    emit('submit', generatePortfolio())
  }, 1800)
}

function goToEdit() {
  // Caminho 2: customizar — abre editor inline.
  // customTickers ja foi pre-populado em goNext() quando saiu de P5,
  // entao o user ve a sugestao e edita a partir dela.
  track('CustomizeProduct', {
    content_name: 'Quiz Open Editor',
    content_category: 'portfolio_quiz',
    currency: 'BRL',
    value: 0,
  })
  currentStep.value = 'edit'
}

// Lista de chips sugeridos pro editor.
// Combina tickers do template do perfil + SUGGESTED_TICKERS do composable,
// removendo duplicados. Os do template aparecem PRIMEIRO (ordem importa
// pq sao mais relevantes pro perfil declarado).
const editSuggestions = computed(() => {
  const persona = inferPersona()
  const fromTemplate = TEMPLATES[persona].map(t => t.ticker)
  const combined = [...fromTemplate]
  for (const t of SUGGESTED_TICKERS) {
    if (!combined.includes(t)) combined.push(t)
  }
  // Tesouro nao entra nos chips (longo, dificil de displayar) — fica no input.
  return combined.filter(t => !t.startsWith('TESOURO'))
})

function isCustomSelected(ticker: string): boolean {
  return customTickers.value.includes(ticker)
}

function toggleCustomTicker(ticker: string) {
  const idx = customTickers.value.indexOf(ticker)
  if (idx >= 0) customTickers.value.splice(idx, 1)
  else customTickers.value.push(ticker)
  customError.value = ''
}

function addCustomTicker() {
  const raw = customInput.value.trim().toUpperCase().replace(/\s+/g, ' ')
  if (!raw) return

  // Pode vir varios separados por virgula/espaco/ponto-virgula
  const parts = raw.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean)
  let added = 0
  let invalid: string[] = []

  for (const p of parts) {
    // Aceita ticker B3 (PETR4, MXRF11, etc) e Tesouro com nome
    const meta = resolveTicker(p)
    if (meta) {
      if (!customTickers.value.includes(meta.ticker)) {
        customTickers.value.push(meta.ticker)
        added++
      }
    }
    else {
      // Aceita tickers desconhecidos tambem (composable usa fallback)
      // mas alerta visual pro user.
      if (/^[A-Z0-9]{4,6}$/.test(p)) {
        if (!customTickers.value.includes(p)) {
          customTickers.value.push(p)
          added++
        }
      }
      else {
        invalid.push(p)
      }
    }
  }

  if (invalid.length > 0 && added === 0) {
    customError.value = `Não reconheci: ${invalid.join(', ')}. Tente PETR4, ITUB4...`
  }
  else {
    customError.value = ''
    customInput.value = ''
  }
}

function removeCustomTicker(ticker: string) {
  const idx = customTickers.value.indexOf(ticker)
  if (idx >= 0) customTickers.value.splice(idx, 1)
}

function submitCustomPortfolio() {
  if (!canSubmitCustom.value) return

  track('CustomizeProduct', {
    content_name: 'Quiz Submit Custom',
    content_category: 'portfolio_quiz',
    custom_count: customTickers.value.length,
    currency: 'BRL',
    value: 0,
  })

  currentStep.value = 'loading'
  // Sem pesos: composable distribui igualmente. Manter consistente com
  // o flow do picker (que tambem nao passa pesos pela URL).
  const tickers: PortfolioInput[] = customTickers.value.map(ticker => ({ ticker }))
  setTimeout(() => emit('submit', tickers), 1800)
}

// Single-select handlers — avancam automatico (UX Acorns/Wealthfront).
function selectInvest(v: Answers['invest']) {
  answers.invest = v
  goNext()
}
function selectPatrimony(v: Answers['patrimony']) {
  answers.patrimony = v
  goNext()
}
function selectConcern(v: Answers['concern']) {
  answers.concern = v
  goNext()
}
function selectHorizon(v: Answers['horizon']) {
  answers.horizon = v
  goNext()
}

// Multi-select handler — toggle, NAO avanca automatico (espera "Continuar").
function toggleHolding(id: string) {
  const idx = answers.holdings.indexOf(id)
  if (idx >= 0) {
    answers.holdings.splice(idx, 1)
  }
  else {
    // Se selecionou "naosei", limpa as outras (semantica exclusiva).
    if (id === 'naosei') {
      answers.holdings.splice(0, answers.holdings.length, 'naosei')
      return
    }
    // Se selecionou outra mas tinha "naosei", remove o naosei.
    const naoseiIdx = answers.holdings.indexOf('naosei')
    if (naoseiIdx >= 0) answers.holdings.splice(naoseiIdx, 1)
    answers.holdings.push(id)
  }
}

// ============ PERSONA INFERENCE ============
// Score de risco simples ponderado. Mais negativo = mais conservador,
// mais positivo = mais arrojado. Iniciante e bypass se P1 indica.

type Persona = 'iniciante' | 'conservador' | 'moderado' | 'arrojado'

function inferPersona(): Persona {
  // Bypass: quem nao investe ou ta comecando entra como iniciante,
  // independente do resto das respostas (carteira mais simples,
  // didatica, com renda fixa pesada).
  if (answers.invest === 'nao') return 'iniciante'

  let riskScore = 0

  // Concern: quanto teme, menos risco quer
  if (answers.concern === 'queda') riskScore -= 2
  else if (answers.concern === 'incerto') riskScore -= 1
  else if (answers.concern === 'risco') riskScore -= 1
  else if (answers.concern === 'inflacao') riskScore += 1  // teme inflacao → tolera bolsa

  // Horizon: prazo longo permite mais risco
  if (answers.horizon === 'curto') riskScore -= 2
  else if (answers.horizon === 'longo') riskScore += 2
  else if (answers.horizon === 'naosei') riskScore -= 1

  // Patrimony: mais patrimonio → tolera mais risco
  if (answers.patrimony === 'mais-1m') riskScore += 1
  else if (answers.patrimony === 'ate-50k') riskScore -= 1

  // "Comecando" tem viés conservador (perfil mais cauteloso por padrao)
  if (answers.invest === 'comecando') riskScore -= 1

  if (riskScore <= -2) return 'conservador'
  if (riskScore >= 2) return 'arrojado'
  return 'moderado'
}

// ============ PORTFOLIO TEMPLATES ============
// Tickers escolhidos pra existir no resolveTicker() do composable.
// Pesos somam ~100 (composable normaliza, mas mantemos legivel).

const TEMPLATES: Record<Persona, PortfolioInput[]> = {
  iniciante: [
    { ticker: 'TESOURO SELIC', weight: 35 },
    { ticker: 'MXRF11', weight: 20 },
    { ticker: 'IVVB11', weight: 20 },
    { ticker: 'BBDC4', weight: 15 },
    { ticker: 'ITSA4', weight: 10 },
  ],
  conservador: [
    { ticker: 'TESOURO SELIC', weight: 25 },
    { ticker: 'TESOURO IPCA', weight: 20 },
    { ticker: 'MXRF11', weight: 15 },
    { ticker: 'HGLG11', weight: 10 },
    { ticker: 'IVVB11', weight: 10 },
    { ticker: 'BBDC4', weight: 10 },
    { ticker: 'ITSA4', weight: 10 },
  ],
  moderado: [
    { ticker: 'PETR4', weight: 15 },
    { ticker: 'ITUB4', weight: 13 },
    { ticker: 'WEGE3', weight: 10 },
    { ticker: 'MXRF11', weight: 12 },
    { ticker: 'HGLG11', weight: 10 },
    { ticker: 'IVVB11', weight: 14 },
    { ticker: 'TESOURO IPCA', weight: 14 },
    { ticker: 'BBAS3', weight: 12 },
  ],
  arrojado: [
    { ticker: 'PETR4', weight: 14 },
    { ticker: 'VALE3', weight: 12 },
    { ticker: 'WEGE3', weight: 12 },
    { ticker: 'ITUB4', weight: 10 },
    { ticker: 'IVVB11', weight: 16 },
    { ticker: 'KNRI11', weight: 8 },
    { ticker: 'EGIE3', weight: 8 },
    { ticker: 'PRIO3', weight: 10 },
    { ticker: 'BBSE3', weight: 10 },
  ],
}

function generatePortfolio(): PortfolioInput[] {
  const persona = inferPersona()
  let portfolio = [...TEMPLATES[persona]]

  // Refinamentos baseados em P2 (holdings declaradas) — adapta o template
  // pra refletir o que a pessoa disse ter. Mantem template-base como
  // espinha dorsal, ajusta nas margens.

  const declared = new Set(answers.holdings)

  // Se NAO declarou intl, tira IVVB11 (re-distribui peso pra Tesouro)
  if (!declared.has('intl') && !declared.has('naosei')) {
    const intlIdx = portfolio.findIndex(p => p.ticker === 'IVVB11')
    if (intlIdx >= 0) {
      const w = portfolio[intlIdx]!.weight ?? 0
      portfolio.splice(intlIdx, 1)
      const tesouro = portfolio.find(p => p.ticker.startsWith('TESOURO'))
      if (tesouro) tesouro.weight = (tesouro.weight ?? 0) + w
    }
  }

  // Se NAO declarou FII, tira FIIs (re-distribui pra acoes ou tesouro)
  if (!declared.has('fii') && !declared.has('naosei')) {
    const fiis = portfolio.filter(p => /11$/.test(p.ticker) && p.ticker !== 'IVVB11')
    fiis.forEach((f) => {
      const idx = portfolio.indexOf(f)
      const w = f.weight ?? 0
      portfolio.splice(idx, 1)
      const tesouro = portfolio.find(p => p.ticker.startsWith('TESOURO'))
      if (tesouro) tesouro.weight = (tesouro.weight ?? 0) + w
    })
  }

  // Se NAO declarou acoes brasileiras, deixa template (sao a base de tudo);
  // refinar mais que isso ja vira sobre-engenharia pra o MVP.

  return portfolio
}

// ============ MOUNT ============

onMounted(() => {
  // Tracking de inicio de quiz (custom event)
  track('CustomizeProduct', {
    content_name: 'Quiz Started',
    content_category: 'portfolio_quiz',
    currency: 'BRL',
    value: 0,
  })
})

function onFallback() {
  emit('fallback')
}
</script>

<template>
  <div class="pq" role="region" aria-label="Quiz para gerar Raio-X da carteira">
    <!-- ============ PROGRESS BAR (visivel em todos os steps exceto loading) ============ -->
    <header v-if="currentStep !== 'loading'" class="pq__header">
      <div class="pq__progress" aria-hidden="true">
        <div
          class="pq__progress-fill"
          :style="{ width: `${progressPct}%`, background: brand.colors.primary }"
        />
      </div>
      <p class="pq__step-label">
        <template v-if="typeof currentStep === 'number'">
          Pergunta <strong>{{ currentStep }}</strong> de 5
        </template>
        <template v-else-if="currentStep === 'review'">
          <strong>Quase lá</strong> · revise sua carteira
        </template>
        <template v-else-if="currentStep === 'edit'">
          <strong>Edite</strong> sua carteira
        </template>
      </p>
    </header>

    <!-- ============ P1: invest? ============ -->
    <Transition name="pq-fade" mode="out-in">
      <div v-if="currentStep === 1" key="s1" class="pq__question">
        <h2 class="pq__title">
          Você já investe?
        </h2>
        <p class="pq__helper">
          Vamos ajustar o Raio-X pro seu momento.
        </p>
        <div class="pq__options">
          <button
            type="button"
            class="pq__option"
            :class="{ 'pq__option--active': answers.invest === 'sim' }"
            @click="selectInvest('sim')"
          >
            <span class="pq__option-emoji" aria-hidden="true">📊</span>
            <span class="pq__option-text">
              <span class="pq__option-label">Sim, tenho carteira</span>
              <span class="pq__option-sub">Quero analisar o que tenho</span>
            </span>
            <UIcon name="i-lucide-arrow-right" class="pq__option-arrow size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="pq__option"
            :class="{ 'pq__option--active': answers.invest === 'comecando' }"
            @click="selectInvest('comecando')"
          >
            <span class="pq__option-emoji" aria-hidden="true">🌱</span>
            <span class="pq__option-text">
              <span class="pq__option-label">Tô começando agora</span>
              <span class="pq__option-sub">Tenho pouca coisa, quero entender</span>
            </span>
            <UIcon name="i-lucide-arrow-right" class="pq__option-arrow size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="pq__option"
            :class="{ 'pq__option--active': answers.invest === 'nao' }"
            @click="selectInvest('nao')"
          >
            <span class="pq__option-emoji" aria-hidden="true">🤔</span>
            <span class="pq__option-text">
              <span class="pq__option-label">Não invisto ainda</span>
              <span class="pq__option-sub">Quero ver uma carteira modelo</span>
            </span>
            <UIcon name="i-lucide-arrow-right" class="pq__option-arrow size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- ============ P2: holdings (multi-select) ============ -->
      <div v-else-if="currentStep === 2" key="s2" class="pq__question">
        <h2 class="pq__title">
          Que ativos você tem ou pretende ter?
        </h2>
        <p class="pq__helper">
          Pode escolher mais de um.
        </p>
        <div class="pq__options-multi">
          <button
            v-for="opt in HOLDINGS_OPTIONS"
            :key="opt.id"
            type="button"
            class="pq__option-multi"
            :class="{ 'pq__option-multi--active': answers.holdings.includes(opt.id) }"
            :aria-pressed="answers.holdings.includes(opt.id)"
            @click="toggleHolding(opt.id)"
          >
            <span class="pq__option-emoji" aria-hidden="true">{{ opt.emoji }}</span>
            <span class="pq__option-label">{{ opt.label }}</span>
            <UIcon
              v-if="answers.holdings.includes(opt.id)"
              name="i-lucide-check"
              class="pq__option-check size-4"
              aria-hidden="true"
            />
          </button>
        </div>
        <button
          type="button"
          class="quiet-btn-primary pq__cta"
          :disabled="!canProceed"
          @click="goNext"
        >
          Continuar
          <UIcon name="i-lucide-arrow-right" class="size-4" />
        </button>
      </div>

      <!-- ============ P3: patrimony ============ -->
      <div v-else-if="currentStep === 3" key="s3" class="pq__question">
        <h2 class="pq__title">
          Faixa de patrimônio investido?
        </h2>
        <p class="pq__helper">
          Inclui carteira atual + meta de curto prazo.
        </p>
        <div class="pq__options">
          <button
            v-for="opt in PATRIMONY_OPTIONS"
            :key="opt.id"
            type="button"
            class="pq__option"
            :class="{ 'pq__option--active': answers.patrimony === opt.id }"
            @click="selectPatrimony(opt.id)"
          >
            <span class="pq__option-text">
              <span class="pq__option-label">{{ opt.label }}</span>
              <span class="pq__option-sub">{{ opt.sub }}</span>
            </span>
            <UIcon name="i-lucide-arrow-right" class="pq__option-arrow size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- ============ P4: concern ============ -->
      <div v-else-if="currentStep === 4" key="s4" class="pq__question">
        <h2 class="pq__title">
          Sua maior preocupação hoje?
        </h2>
        <p class="pq__helper">
          O Raio-X foca primeiro no que mais te incomoda.
        </p>
        <div class="pq__options">
          <button
            v-for="opt in CONCERN_OPTIONS"
            :key="opt.id"
            type="button"
            class="pq__option"
            :class="{ 'pq__option--active': answers.concern === opt.id }"
            @click="selectConcern(opt.id)"
          >
            <span class="pq__option-emoji" aria-hidden="true">{{ opt.emoji }}</span>
            <span class="pq__option-text">
              <span class="pq__option-label">{{ opt.label }}</span>
            </span>
            <UIcon name="i-lucide-arrow-right" class="pq__option-arrow size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- ============ P5: horizon ============ -->
      <div v-else-if="currentStep === 5" key="s5" class="pq__question">
        <h2 class="pq__title">
          Quanto tempo até precisar do dinheiro?
        </h2>
        <p class="pq__helper">
          Determina o equilíbrio entre liquidez e crescimento.
        </p>
        <div class="pq__options">
          <button
            v-for="opt in HORIZON_OPTIONS"
            :key="opt.id"
            type="button"
            class="pq__option"
            :class="{ 'pq__option--active': answers.horizon === opt.id }"
            @click="selectHorizon(opt.id)"
          >
            <span class="pq__option-text">
              <span class="pq__option-label">{{ opt.label }}</span>
              <span class="pq__option-sub">{{ opt.sub }}</span>
            </span>
            <UIcon name="i-lucide-arrow-right" class="pq__option-arrow size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- ============ REVIEW: preview da carteira sugerida + caminho pra editar ============ -->
      <!-- Por que existe: a P5 acabou e a IA "gerou" uma carteira. Antes de
           jogar pro loading, mostramos a sugestao com 2 caminhos claros:
             1) Aceitar a sugestao (recomendado, sunk cost mantido)
             2) "Tenho minha carteira" → abre editor inline (chips + busca)
           Isso resolve o caso de quem JA tem carteira pronta sem forcar
           a sair do quiz. Mantem o contexto e a percepcao de que "tudo
           foi por algo" — as 5 perguntas servem pra preencher os chips
           de sugestao do editor (que reflete o perfil declarado). -->
      <div v-else-if="currentStep === 'review'" key="review" class="pq__question">
        <h2 class="pq__title">
          Sua carteira <span class="pq__amber">sugerida</span> está pronta
        </h2>
        <p class="pq__helper">
          Montamos uma primeira versão pro seu perfil. Você pode usar como
          ponto de partida ou substituir pelos seus ativos reais.
        </p>

        <!-- Preview chips do template do perfil -->
        <div class="pq__preview-card">
          <div class="pq__preview-label">
            Perfil identificado: <strong>{{ {
              iniciante: 'Iniciante',
              conservador: 'Conservador',
              moderado: 'Moderado',
              arrojado: 'Arrojado',
            }[inferPersona()] }}</strong>
          </div>
          <div class="pq__preview-chips">
            <span
              v-for="t in customTickers"
              :key="t"
              class="pq__chip pq__chip--preview"
            >
              {{ t }}
            </span>
          </div>
        </div>

        <!-- 2 caminhos: aceitar sugerido OU customizar -->
        <div class="pq__review-actions">
          <button
            type="button"
            class="quiet-btn-primary pq__cta"
            @click="acceptSuggested"
          >
            <UIcon name="i-lucide-radar" class="size-4" aria-hidden="true" />
            Analisar essa carteira
          </button>
          <button
            type="button"
            class="quiet-btn-ghost pq__cta-secondary"
            @click="goToEdit"
          >
            <UIcon name="i-lucide-pencil" class="size-4" aria-hidden="true" />
            Tenho minha carteira (editar)
          </button>
        </div>
      </div>

      <!-- ============ EDIT: editor inline (chips + busca) ============ -->
      <!-- UX: quem ja tem carteira pode ADICIONAR/REMOVER chips livremente.
           Pre-populado com a sugestao do perfil pra reduzir trabalho (user
           tira o que nao quer + adiciona o que tem). Input aceita ticker
           digitado (com normalizacao + validacao via resolveTicker do
           composable). Botao "Voltar pra sugestao" volta pro review. -->
      <div v-else-if="currentStep === 'edit'" key="edit" class="pq__question">
        <h2 class="pq__title">
          Quais ativos você tem?
        </h2>
        <p class="pq__helper">
          Clique nos chips pra adicionar ou remover. Ou digite tickers
          (PETR4, ITUB4, MXRF11…). Mínimo 2 ativos.
        </p>

        <!-- Lista de selecionados (chips removíveis) -->
        <div v-if="customTickers.length > 0" class="pq__selected">
          <p class="pq__selected-label">
            Sua carteira ({{ customTickers.length }} {{ customTickers.length === 1 ? 'ativo' : 'ativos' }}):
          </p>
          <div class="pq__selected-chips">
            <span
              v-for="t in customTickers"
              :key="t"
              class="pq__chip pq__chip--selected"
            >
              {{ t }}
              <button
                type="button"
                class="pq__chip-remove"
                :aria-label="`Remover ${t}`"
                @click="removeCustomTicker(t)"
              >
                <UIcon name="i-lucide-x" class="size-3" aria-hidden="true" />
              </button>
            </span>
          </div>
        </div>

        <!-- Input livre pra digitar -->
        <div class="pq__edit-input-row">
          <input
            v-model="customInput"
            type="text"
            class="pq__edit-input"
            placeholder="Digite um ticker (ex: WEGE3) e Enter"
            inputmode="text"
            autocapitalize="characters"
            spellcheck="false"
            @keydown.enter.prevent="addCustomTicker"
            @keydown.tab.prevent="addCustomTicker"
            @keydown.,.prevent="addCustomTicker"
          >
          <button
            type="button"
            class="pq__edit-add"
            :disabled="!customInput.trim()"
            aria-label="Adicionar ticker"
            @click="addCustomTicker"
          >
            <UIcon name="i-lucide-plus" class="size-4" aria-hidden="true" />
          </button>
        </div>
        <p v-if="customError" class="pq__edit-error">
          {{ customError }}
        </p>

        <!-- Sugestoes baseadas no perfil + populares -->
        <div class="pq__suggestions">
          <p class="pq__suggestions-label">
            Sugestões pro seu perfil:
          </p>
          <div class="pq__suggestions-chips">
            <button
              v-for="t in editSuggestions.slice(0, 12)"
              :key="t"
              type="button"
              class="pq__chip pq__chip--suggestion"
              :class="{ 'pq__chip--suggestion-active': isCustomSelected(t) }"
              @click="toggleCustomTicker(t)"
            >
              <UIcon
                v-if="isCustomSelected(t)"
                name="i-lucide-check"
                class="size-3"
                aria-hidden="true"
              />
              <UIcon
                v-else
                name="i-lucide-plus"
                class="size-3"
                aria-hidden="true"
              />
              {{ t }}
            </button>
          </div>
        </div>

        <!-- Submit -->
        <button
          type="button"
          class="quiet-btn-primary pq__cta"
          :disabled="!canSubmitCustom"
          @click="submitCustomPortfolio"
        >
          <UIcon name="i-lucide-radar" class="size-4" aria-hidden="true" />
          Gerar Raio-X dessa carteira
        </button>
        <p v-if="!canSubmitCustom" class="pq__edit-hint">
          Adicione mais {{ 2 - customTickers.length }} {{ customTickers.length === 1 ? 'ativo' : 'ativos' }} pra continuar.
        </p>
      </div>

      <!-- ============ LOADING: analyzing screen ============ -->
      <!-- Loading "fake" de 1.8s. Razoes:
           1) Perceived value: pessoa SENTE que a IA esta trabalhando duro
           2) Tempo pro user respirar antes do "tcharam"
           3) Cria momento de transicao narrativa antes do resultado -->
      <div v-else-if="currentStep === 'loading'" key="loading" class="pq__loading">
        <div class="pq__loading-icon" aria-hidden="true">
          <div
            class="pq__loading-pulse"
            :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 20%, transparent)` }"
          />
          <UIcon
            name="i-lucide-radar"
            class="pq__loading-icon-svg size-12"
            :style="{ color: brand.colors.primary }"
          />
        </div>
        <p class="pq__loading-title">
          Analisando seu perfil…
        </p>
        <ul class="pq__loading-steps" aria-live="polite">
          <li class="pq__loading-step pq__loading-step--done">
            <UIcon name="i-lucide-check-circle-2" class="size-4" aria-hidden="true" />
            <span>Perfil de risco identificado</span>
          </li>
          <li class="pq__loading-step pq__loading-step--active">
            <span class="pq__loading-spinner" aria-hidden="true" />
            <span>Mapeando ativos compatíveis</span>
          </li>
          <li class="pq__loading-step">
            <span class="pq__loading-dot" aria-hidden="true" />
            <span>Calculando exposição e diversificação</span>
          </li>
        </ul>
      </div>
    </Transition>

    <!-- ============ FOOTER (back) ============ -->
    <!-- Mostra "Voltar" em qualquer step que faz sentido voltar:
           P2-P5 (volta pergunta anterior)
           review (volta pra P5)
           edit (volta pra review)
         Esconde em P1 (nao tem onde voltar) e loading (em transicao). -->
    <footer
      v-if="(typeof currentStep === 'number' && currentStep > 1) || currentStep === 'review' || currentStep === 'edit'"
      class="pq__footer"
    >
      <button
        type="button"
        class="pq__back"
        @click="goBack"
      >
        <UIcon name="i-lucide-chevron-left" class="size-4" aria-hidden="true" />
        <template v-if="currentStep === 'edit'">Voltar pra sugestão</template>
        <template v-else-if="currentStep === 'review'">Mudar última resposta</template>
        <template v-else>Voltar</template>
      </button>
    </footer>

    <!-- Escape hatch (P1): pessoa que ja TEM ticker decorado e quer pular
         o quiz inteiro pode usar o picker classico no hero. Link discreto,
         nao compete com o flow principal. -->
    <button
      v-if="currentStep === 1"
      type="button"
      class="pq__skip"
      @click="onFallback"
    >
      Já tenho a carteira pronta? <span class="pq__skip-link">Cole os tickers diretamente →</span>
    </button>
  </div>
</template>

<style scoped>
/* ============ CARD ============ */
.pq {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: var(--brand-radius-lg, 12px);
  background: var(--bg-elevated, var(--brand-bg));
  border: 1px solid var(--border-subtle, var(--brand-border));
  box-shadow: var(--shadow-card, 0 2px 8px rgb(0 0 0 / 4%));
  min-height: 380px;
  position: relative;
}

@media (min-width: 768px) {
  .pq { padding: 2rem; min-height: 420px; }
}

/* ============ HEADER (progress + label) ============ */
.pq__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.pq__progress {
  height: 4px;
  border-radius: 999px;
  background: var(--bg-soft, color-mix(in srgb, var(--brand-text) 8%, transparent));
  overflow: hidden;
}

.pq__progress-fill {
  height: 100%;
  border-radius: inherit;
  transition: width 360ms cubic-bezier(0.4, 0, 0.2, 1);
}

.pq__step-label {
  font-family: var(--brand-font);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted, color-mix(in srgb, var(--brand-text) 60%, transparent));
}

.pq__step-label strong {
  font-weight: 600;
  color: var(--text-heading, var(--brand-text));
}

/* ============ QUESTION ============ */
.pq__question {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pq__title {
  font-family: var(--brand-font);
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--text-heading, var(--brand-text));
}

@media (min-width: 768px) {
  .pq__title { font-size: 1.75rem; }
}

.pq__helper {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text-body, color-mix(in srgb, var(--brand-text) 75%, transparent));
}

/* ============ SINGLE-SELECT OPTIONS ============ */
.pq__options {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-top: 0.5rem;
}

.pq__option {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: var(--brand-radius-md, 8px);
  background: transparent;
  border: 1.5px solid var(--border-subtle, var(--brand-border));
  cursor: pointer;
  text-align: left;
  font-family: var(--brand-font);
  transition: border-color 180ms ease-out, background-color 180ms ease-out, transform 80ms ease-out;
}

.pq__option:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 4%, transparent);
}

.pq__option:active {
  transform: scale(0.99);
}

.pq__option:focus-visible {
  outline: none;
  box-shadow: var(--shadow-ring-focus, 0 0 0 3px color-mix(in srgb, var(--brand-primary) 40%, transparent));
}

.pq__option--active {
  border-color: var(--brand-primary);
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
}

.pq__option-emoji {
  font-size: 1.5rem;
  line-height: 1;
  flex-shrink: 0;
}

.pq__option-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
}

.pq__option-label {
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.3;
  color: var(--text-heading, var(--brand-text));
}

.pq__option-sub {
  font-size: 0.8125rem;
  line-height: 1.3;
  color: var(--text-muted, color-mix(in srgb, var(--brand-text) 60%, transparent));
}

.pq__option-arrow {
  color: var(--text-muted, color-mix(in srgb, var(--brand-text) 40%, transparent));
  transition: transform 180ms ease-out, color 180ms ease-out;
  flex-shrink: 0;
}

.pq__option:hover .pq__option-arrow {
  transform: translateX(2px);
  color: var(--brand-primary);
}

/* ============ MULTI-SELECT OPTIONS ============ */
.pq__options-multi {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.pq__option-multi {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: var(--brand-radius-md, 8px);
  background: transparent;
  border: 1.5px solid var(--border-subtle, var(--brand-border));
  cursor: pointer;
  text-align: left;
  font-family: var(--brand-font);
  transition: border-color 180ms ease-out, background-color 180ms ease-out;
}

.pq__option-multi:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
}

.pq__option-multi:focus-visible {
  outline: none;
  box-shadow: var(--shadow-ring-focus, 0 0 0 3px color-mix(in srgb, var(--brand-primary) 40%, transparent));
}

.pq__option-multi--active {
  border-color: var(--brand-primary);
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
}

.pq__option-multi .pq__option-label {
  flex: 1;
  font-size: 0.9375rem;
  font-weight: 500;
}

.pq__option-check {
  color: var(--brand-primary);
}

/* ============ CTA (continuar — multi-select / submit edit) ============ */
.pq__cta {
  margin-top: 0.5rem;
  width: 100%;
  justify-content: center;
}

.pq__cta:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.3);
}

@media (min-width: 768px) {
  .pq__cta {
    width: auto;
    align-self: flex-start;
    min-width: 180px;
  }
}

/* ============ REVIEW STEP ============ */
.pq__amber {
  color: var(--brand-primary);
  font-style: italic;
  font-family: 'Instrument Serif', serif;
}

.pq__preview-card {
  margin-top: 0.5rem;
  padding: 1rem;
  border-radius: var(--brand-radius-md, 8px);
  background: color-mix(in srgb, var(--brand-primary) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 18%, transparent);
}

.pq__preview-label {
  font-size: 0.8125rem;
  color: var(--text-muted, color-mix(in srgb, var(--brand-text) 65%, transparent));
  margin-bottom: 0.625rem;
}

.pq__preview-label strong {
  color: var(--text-heading, var(--brand-text));
  font-weight: 600;
}

.pq__preview-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.pq__review-actions {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-top: 1rem;
}

@media (min-width: 768px) {
  .pq__review-actions {
    flex-direction: row;
    align-items: center;
  }
}

.pq__cta-secondary {
  width: 100%;
  justify-content: center;
}

@media (min-width: 768px) {
  .pq__cta-secondary {
    width: auto;
    min-width: 200px;
  }
}

/* ============ CHIPS (compartilhado entre preview / selected / suggestion) ============ */
.pq__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  font-family: var(--brand-font);
  font-size: 0.8125rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.pq__chip--preview {
  background: var(--bg-elevated, var(--brand-bg));
  color: var(--text-heading, var(--brand-text));
  border: 1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
}

.pq__chip--selected {
  background: var(--brand-primary);
  color: #fff;
  padding: 0.25rem 0.5rem 0.25rem 0.625rem;
  gap: 0.375rem;
}

.pq__chip--suggestion {
  background: transparent;
  color: var(--text-body, var(--brand-text));
  border: 1px solid var(--border-subtle, var(--brand-border));
  cursor: pointer;
  transition: border-color 160ms ease-out, background-color 160ms ease-out, color 160ms ease-out;
  padding: 0.3125rem 0.75rem;
}

.pq__chip--suggestion:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 5%, transparent);
}

.pq__chip--suggestion:focus-visible {
  outline: none;
  box-shadow: var(--shadow-ring-focus, 0 0 0 3px color-mix(in srgb, var(--brand-primary) 35%, transparent));
}

.pq__chip--suggestion-active {
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  border-color: var(--brand-primary);
  color: var(--brand-primary);
}

.pq__chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 18%);
  border: 0;
  border-radius: 999px;
  width: 18px;
  height: 18px;
  cursor: pointer;
  color: inherit;
  transition: background-color 160ms ease-out;
}

.pq__chip-remove:hover {
  background: rgb(255 255 255 / 35%);
}

.pq__chip-remove:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgb(255 255 255 / 60%);
}

/* ============ EDIT STEP ============ */
.pq__selected {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.875rem;
  border-radius: var(--brand-radius-md, 8px);
  background: color-mix(in srgb, var(--brand-primary) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 15%, transparent);
}

.pq__selected-label {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted, color-mix(in srgb, var(--brand-text) 60%, transparent));
}

.pq__selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.pq__edit-input-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.pq__edit-input {
  flex: 1;
  padding: 0.625rem 0.875rem;
  border-radius: var(--brand-radius-md, 8px);
  border: 1.5px solid var(--border-subtle, var(--brand-border));
  background: var(--bg-elevated, var(--brand-bg));
  color: var(--text-heading, var(--brand-text));
  font-family: var(--brand-font);
  font-size: 0.9375rem;
  letter-spacing: 0.01em;
  transition: border-color 180ms ease-out, box-shadow 180ms ease-out;
  text-transform: uppercase;
}

.pq__edit-input::placeholder {
  text-transform: none;
  color: var(--text-muted, color-mix(in srgb, var(--brand-text) 45%, transparent));
}

.pq__edit-input:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: var(--shadow-ring-focus, 0 0 0 3px color-mix(in srgb, var(--brand-primary) 25%, transparent));
}

.pq__edit-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--brand-radius-md, 8px);
  background: var(--brand-primary);
  color: #fff;
  border: 0;
  cursor: pointer;
  transition: filter 180ms ease-out, transform 80ms ease-out;
  flex-shrink: 0;
}

.pq__edit-add:hover:not(:disabled) {
  filter: brightness(0.92);
}

.pq__edit-add:active:not(:disabled) {
  transform: translateY(1px);
}

.pq__edit-add:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pq__edit-add:focus-visible {
  outline: none;
  box-shadow: var(--shadow-ring-focus, 0 0 0 3px color-mix(in srgb, var(--brand-primary) 35%, transparent));
}

.pq__edit-error {
  font-size: 0.8125rem;
  color: var(--brand-negative, #dc2626);
  margin-top: -0.25rem;
}

.pq__edit-hint {
  font-size: 0.8125rem;
  color: var(--text-muted, color-mix(in srgb, var(--brand-text) 55%, transparent));
  margin-top: -0.25rem;
  text-align: center;
}

/* ============ SUGGESTIONS ============ */
.pq__suggestions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.pq__suggestions-label {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted, color-mix(in srgb, var(--brand-text) 60%, transparent));
}

.pq__suggestions-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

/* ============ FOOTER (voltar) ============ */
.pq__footer {
  display: flex;
  align-items: center;
  margin-top: auto;
  padding-top: 0.5rem;
}

.pq__back {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 0.5rem 0;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-muted, color-mix(in srgb, var(--brand-text) 60%, transparent));
  transition: color 180ms ease-out;
}

.pq__back:hover {
  color: var(--text-heading, var(--brand-text));
}

/* ============ SKIP (escape hatch — quem ja tem ticker) ============ */
.pq__skip {
  display: block;
  margin-top: 0.75rem;
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 0.5rem 0;
  font-size: 0.8125rem;
  text-align: center;
  color: var(--text-muted, color-mix(in srgb, var(--brand-text) 55%, transparent));
  transition: color 180ms ease-out;
}

.pq__skip:hover {
  color: var(--text-body, var(--brand-text));
}

.pq__skip-link {
  font-weight: 500;
  color: var(--brand-primary);
}

/* ============ LOADING STATE ============ */
.pq__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  padding: 2rem 1rem;
  text-align: center;
}

.pq__loading-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
}

.pq__loading-pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  animation: pq-pulse 1.6s ease-in-out infinite;
}

.pq__loading-icon-svg {
  position: relative;
  z-index: 1;
  animation: pq-rotate 2.4s linear infinite;
}

.pq__loading-title {
  font-family: var(--brand-font);
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--text-heading, var(--brand-text));
}

.pq__loading-steps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: flex-start;
  text-align: left;
}

.pq__loading-step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-muted, color-mix(in srgb, var(--brand-text) 50%, transparent));
}

.pq__loading-step--done {
  color: var(--brand-positive, #10b981);
}

.pq__loading-step--active {
  color: var(--text-body, var(--brand-text));
  font-weight: 500;
}

.pq__loading-spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
  border-top-color: var(--brand-primary);
  animation: pq-rotate 0.7s linear infinite;
}

.pq__loading-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  margin: 0 5px;
}

@keyframes pq-pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50%      { transform: scale(1.15); opacity: 0.3; }
}

@keyframes pq-rotate {
  to { transform: rotate(360deg); }
}

/* ============ TRANSITIONS BETWEEN STEPS ============ */
.pq-fade-enter-active,
.pq-fade-leave-active {
  transition: opacity 220ms ease-out, transform 240ms cubic-bezier(0.4, 0, 0.2, 1);
}

.pq-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.pq-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Reduced motion: respeitar */
@media (prefers-reduced-motion: reduce) {
  .pq__progress-fill,
  .pq__option,
  .pq__option-arrow,
  .pq__option-multi,
  .pq__back,
  .pq__skip,
  .pq-fade-enter-active,
  .pq-fade-leave-active {
    transition: none !important;
  }
  .pq__loading-pulse,
  .pq__loading-icon-svg,
  .pq__loading-spinner {
    animation: none !important;
  }
}
</style>
