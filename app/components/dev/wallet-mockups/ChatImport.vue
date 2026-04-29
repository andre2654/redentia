<!--
  Chat import flow mockup.

  Shows the conversation that happens when the user lands at
  `/help?intent=import-portfolio`. The flow:
    1. AI greets and offers two paths (já tenho XLSX / preciso baixar)
    2. If "preciso baixar" → step-by-step CEI guide with screenshots
    3. User uploads file → AI confirms parse + categories
    4. AI auto-runs analysis tools, presents inline insight cards
    5. CTA to view full dashboard
-->
<template>
  <div class="flex flex-col gap-6 px-6 py-8">
    <!-- Top header bar mimicking the chat -->
    <header class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span
          class="font-mono-tab text-[10.5px] font-medium uppercase"
          :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
        >Chat · Importar carteira</span>
        <span
          class="rounded-md px-1.5 py-0.5 font-mono-tab text-[10px] font-medium"
          :style="{
            backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
            color: brand.colors.primary,
          }"
        >MAX</span>
      </div>
      <button
        type="button"
        class="rounded-md p-1 text-[14px]"
        :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }"
      >
        <UIcon name="i-lucide-x" class="size-4" />
      </button>
    </header>

    <!-- Chat thread -->
    <article
      class="flex flex-col gap-6 overflow-hidden rounded-2xl border p-6"
      :style="{
        backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 50%, ${brand.colors.background})`,
        borderColor: `color-mix(in srgb, ${brand.colors.border} 45%, transparent)`,
      }"
    >
      <!-- ============ Turn 1: AI greets ============ -->
      <ChatTurn :brand="brand" sender="ai">
        <p :style="bodyStyle">
          Vamos importar sua carteira em <span :style="strongStyle">menos de 1 minuto</span>. Eu aceito a planilha que o CEI/B3 gera direto, com as 5 abas (Ações, FIIs, ETFs, Tesouro, Empréstimos).
        </p>
        <p :style="bodyStyle" class="mt-2">Você já tem a planilha?</p>

        <!-- Inline form: 2 buttons -->
        <div class="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          <button
            type="button"
            class="flex items-start gap-3 rounded-xl border p-4 text-left"
            :style="optionCardStyle"
          >
            <span class="flex size-9 shrink-0 items-center justify-center rounded-lg" :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.positive} 14%, transparent)` }">
              <UIcon name="i-lucide-file-spreadsheet" class="size-5" :style="{ color: brand.colors.positive }" />
            </span>
            <div class="flex flex-col gap-0.5">
              <span class="text-[14px] font-medium" :style="{ color: brand.colors.text }">Sim, já tenho</span>
              <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)`, lineHeight: 1.45 }">Anexar agora</span>
            </div>
          </button>
          <button
            type="button"
            class="flex items-start gap-3 rounded-xl border p-4 text-left"
            :style="optionCardStyle"
          >
            <span class="flex size-9 shrink-0 items-center justify-center rounded-lg" :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)` }">
              <UIcon name="i-lucide-help-circle" class="size-5" :style="{ color: brand.colors.primary }" />
            </span>
            <div class="flex flex-col gap-0.5">
              <span class="text-[14px] font-medium" :style="{ color: brand.colors.text }">Preciso baixar primeiro</span>
              <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)`, lineHeight: 1.45 }">Te mostro o passo a passo</span>
            </div>
          </button>
        </div>
      </ChatTurn>

      <!-- ============ Turn 2: User picks "preciso baixar" ============ -->
      <ChatTurn :brand="brand" sender="user">
        <p :style="bodyStyle">Preciso baixar primeiro</p>
      </ChatTurn>

      <!-- ============ Turn 3: AI step-by-step ============ -->
      <ChatTurn :brand="brand" sender="ai">
        <p :style="bodyStyle">É rápido. Em 4 cliques você baixa a planilha do próprio CEI:</p>
        <ol class="mt-3 flex flex-col gap-2.5">
          <li
            v-for="(step, i) in cei_steps"
            :key="step.title"
            class="flex gap-3"
          >
            <span
              class="flex size-7 shrink-0 items-center justify-center rounded-full font-mono-tab text-[12px] font-medium tabular-nums"
              :style="{
                backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
                color: brand.colors.primary,
              }"
            >{{ i + 1 }}</span>
            <div class="flex flex-col gap-0.5 pt-1">
              <span class="text-[13.5px] font-medium" :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }">{{ step.title }}</span>
              <span class="text-[12.5px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }" v-html="step.body"></span>
            </div>
          </li>
        </ol>

        <!-- Direct link card -->
        <a
          href="#"
          class="mt-4 flex items-center gap-3 rounded-xl border p-3"
          :style="linkCardStyle"
        >
          <UIcon name="i-lucide-external-link" class="size-4" :style="{ color: brand.colors.primary }" />
          <div class="flex flex-1 flex-col leading-tight">
            <span class="text-[13px] font-medium" :style="{ color: brand.colors.text }">Abrir o CEI agora</span>
            <span class="font-mono-tab text-[10.5px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }">investidor.b3.com.br/minha-carteira</span>
          </div>
          <UIcon name="i-lucide-arrow-up-right" class="size-4" :style="{ color: brand.colors.primary }" />
        </a>

        <p class="mt-3" :style="bodyStyle">
          Quando baixar, anexa aqui usando o ícone de anexo, ou simplesmente arrasta e solta o arquivo. Eu cuido do resto.
        </p>
      </ChatTurn>

      <!-- ============ Turn 4: User uploads file ============ -->
      <ChatTurn :brand="brand" sender="user">
        <div
          class="flex items-center gap-3 rounded-xl border p-3"
          :style="attachmentCardStyle"
        >
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-lg"
            :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.positive} 14%, transparent)` }"
          >
            <UIcon name="i-lucide-file-spreadsheet" class="size-5" :style="{ color: brand.colors.positive }" />
          </span>
          <div class="flex flex-col leading-tight">
            <span class="text-[13px] font-medium" :style="{ color: brand.colors.text }">posicao-2026-04-29-12-06-54.xlsx</span>
            <span class="font-mono-tab text-[10.5px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }">12,1 KB · 5 abas</span>
          </div>
        </div>
      </ChatTurn>

      <!-- ============ Turn 5: AI confirms parse + auto-research starts ============ -->
      <ChatTurn :brand="brand" sender="ai">
        <p :style="bodyStyle">Importei tua carteira. Resumo do que recebi:</p>

        <!-- Inline asset breakdown -->
        <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <div
            v-for="row in importBreakdown"
            :key="row.label"
            class="flex flex-col gap-1 rounded-lg border px-3 py-2.5"
            :style="breakdownCardStyle"
          >
            <span class="font-mono-tab text-[9.5px] font-medium uppercase" :style="{ letterSpacing: '0.16em', color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }">{{ row.label }}</span>
            <span class="font-mono-tab text-[18px] font-light tabular-nums" :style="{ color: brand.colors.text, letterSpacing: '-0.02em' }">{{ row.count }}</span>
          </div>
        </div>

        <p :style="bodyStyle" class="mt-3">
          Patrimônio atualizado: <span :style="strongStyle">R$ 487.230,42</span> · 30 ativos. Tô puxando preço atual e fundamentos pra montar o raio-x.
        </p>

        <!-- Tool spinners -->
        <div class="mt-3 flex flex-col gap-1.5 rounded-xl border p-3" :style="researchCardStyle">
          <div
            v-for="t in researchTools"
            :key="t.label"
            class="flex items-center gap-2 text-[12px]"
          >
            <UIcon
              :name="t.done ? 'i-lucide-check-circle-2' : 'i-lucide-loader'"
              class="size-3.5"
              :class="t.done ? '' : 'animate-spin'"
              :style="{ color: t.done ? brand.colors.positive : `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
            />
            <span :style="{ color: t.done ? brand.colors.text : `color-mix(in srgb, ${brand.colors.text} 65%, transparent)` }">{{ t.label }}</span>
            <span class="ml-auto font-mono-tab text-[10.5px] tabular-nums" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }">{{ t.detail }}</span>
          </div>
        </div>
      </ChatTurn>

      <!-- ============ Turn 6: AI inline insight cards ============ -->
      <ChatTurn :brand="brand" sender="ai">
        <p :style="bodyStyle">Pronto. Aqui está o que eu vejo na sua carteira:</p>

        <!-- Score + 3 quick cards -->
        <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="rounded-xl border p-4" :style="scoreCardStyle">
            <span class="font-mono-tab text-[10.5px] font-medium uppercase" :style="{ letterSpacing: '0.18em', color: brand.colors.primary }">Score de saúde</span>
            <div class="mt-1 flex items-baseline gap-2">
              <span class="font-mono-tab text-[36px] font-light tabular-nums leading-none" :style="{ color: brand.colors.text, letterSpacing: '-0.04em' }">76</span>
              <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }">/100</span>
            </div>
            <span class="mt-1 inline-block font-mono-tab text-[10.5px] font-medium uppercase" :style="{ letterSpacing: '0.16em', color: brand.colors.positive }">Boa</span>
          </div>
          <div class="rounded-xl border p-4" :style="scoreCardStyle">
            <span class="font-mono-tab text-[10.5px] font-medium uppercase" :style="{ letterSpacing: '0.18em', color: brand.colors.primary }">Renda projetada · 12m</span>
            <div class="mt-1 flex items-baseline gap-2">
              <span class="font-mono-tab text-[24px] font-light tabular-nums leading-none" :style="{ color: brand.colors.text, letterSpacing: '-0.02em' }">R$ 28.420</span>
            </div>
            <span class="mt-1 inline-block text-[11px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">DY médio 7,4% (vs CDI 10,65%)</span>
          </div>
        </div>

        <!-- 3 strengths quick view -->
        <div class="mt-4 flex flex-col gap-2.5">
          <div
            v-for="s in topStrengths"
            :key="s.title"
            class="flex items-start gap-3"
          >
            <UIcon name="i-lucide-check-circle-2" class="mt-0.5 size-4 shrink-0" :style="{ color: brand.colors.positive }" />
            <div class="flex flex-col gap-0.5">
              <span class="text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ s.title }}</span>
              <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ s.body }}</span>
            </div>
          </div>
        </div>

        <!-- 2 risks quick view -->
        <div class="mt-3 flex flex-col gap-2.5">
          <div
            v-for="r in topRisks"
            :key="r.title"
            class="flex items-start gap-3"
          >
            <UIcon name="i-lucide-alert-triangle" class="mt-0.5 size-4 shrink-0" :style="{ color: brand.colors.warning || '#f59e0b' }" />
            <div class="flex flex-col gap-0.5">
              <span class="text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ r.title }}</span>
              <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ r.body }}</span>
            </div>
          </div>
        </div>

        <!-- CTA buttons -->
        <div class="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium"
            :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
          >
            <UIcon name="i-lucide-radar" class="size-4" />
            Ver raio-x completo
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-medium"
            :style="{ borderColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)`, color: brand.colors.text }"
          >
            <UIcon name="i-lucide-wallet" class="size-4" />
            Abrir carteira
          </button>
        </div>

        <!-- Followup suggestions -->
        <div class="mt-4 flex flex-wrap gap-2">
          <button
            v-for="f in followups"
            :key="f"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px]"
            :style="{
              borderColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)`,
              color: brand.colors.text,
            }"
          >
            <UIcon name="i-lucide-message-circle" class="size-3" :style="{ color: brand.colors.primary }" />
            {{ f }}
          </button>
        </div>
      </ChatTurn>
    </article>
  </div>
</template>

<script setup lang="ts">
import ChatTurn from './ChatTurn.vue'

const brand = useBrand()

const bodyStyle = computed(() => ({
  fontSize: '14.5px',
  lineHeight: 1.55,
  color: `color-mix(in srgb, ${brand.colors.text} 80%, transparent)`,
}))
const strongStyle = computed(() => ({
  fontWeight: 500,
  color: brand.colors.text,
}))
const optionCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.background} 50%, transparent)`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))
const linkCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 6%, ${brand.colors.surface})`,
  borderColor: `color-mix(in srgb, ${brand.colors.primary} 25%, transparent)`,
}))
const attachmentCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 60%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))
const breakdownCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.background} 50%, transparent)`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
}))
const researchCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.background} 60%, transparent)`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
}))
const scoreCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 60%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.primary} 20%, transparent)`,
}))

const cei_steps = [
  { title: 'Acesse a área Posição', body: 'Vai pra <a href="#" class="text-[color:var(--brand-primary)] underline">investidor.b3.com.br/minha-carteira/investimentos/posicao</a>. Login com CPF, senha e código do 6 dígitos do app B3.' },
  { title: 'Clique em "Baixar em Excel"', body: 'O botão fica no canto superior direito. Eles geram um arquivo .xlsx com 5 abas (Ações, Empréstimos, ETFs, FIIs, Tesouro).' },
  { title: 'Abra essa conversa de novo', body: 'Quando o download terminar, volta aqui.' },
  { title: 'Anexa o arquivo ou arrasta', body: 'Eu reconheço a estrutura do CEI e separa cada classe automaticamente.' },
] as const

const importBreakdown = [
  { label: 'Ações', count: 13 },
  { label: 'FIIs', count: 8 },
  { label: 'ETFs', count: 2 },
  { label: 'Empréstimos', count: 4 },
  { label: 'Tesouro', count: 3 },
] as const

const researchTools = [
  { label: 'Cotação atual de cada ativo', detail: 'Brapi · 30/30', done: true },
  { label: 'Histórico de dividendos · 12m', detail: 'StatusInvest · 21/30', done: true },
  { label: 'Fundamentos (P/L, P/VP, ROE)', detail: 'TradingView · 14/30', done: false },
  { label: 'Cenário macro (Selic, IPCA, USD)', detail: 'BCB · ok', done: true },
  { label: 'Score de carteira (9 dimensões)', detail: 'Calculando…', done: false },
]

const topStrengths = [
  { title: 'Renda passiva consistente', body: 'DY médio 7,4% bate CDI (10,65%) com isenção de IR em FIIs e dividendos. Projeção R$ 28k em 12m.' },
  { title: 'Diversificação setorial sólida', body: '8 setores representados, nenhum acima de 30%. Bancos + Seguros somam 27% (saudável).' },
  { title: 'Reserva ancorada em IPCA+', body: 'R$ 90k em Tesouro IPCA+ 2032/40/50 protege contra inflação sem volatilidade.' },
] as const

const topRisks = [
  { title: 'Exposição cambial mínima', body: 'Apenas 1,8% em GOLD11 contra desvalorização do real. Considerar IVVB11 ou BDRs pra hedge.' },
  { title: 'FIIs de papel underperforming', body: 'CPTS11, GARE11, HFOF11 acumulam -8%. Risco de juros altos pressionando valuations.' },
] as const

const followups = [
  'Como diminuir minha exposição a bancos?',
  'Quais BDRs combinam com minha carteira?',
  'Definir meta de aposentadoria',
] as const
</script>
