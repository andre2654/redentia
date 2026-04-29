<!--
  Wallet redesign mockups showcase.

  Goal: 4 mockups demonstrating the proposed flow before implementation:
    1. Empty State — first-time visit, no positions yet
    2. Chat Import Flow — full chat conversation when user imports via /help
    3. Wallet Dashboard — populated state (real data from B3 CEI export)
    4. Raio-X Completo — deep portfolio diagnosis surface

  Open at /dev/wallet-mockups to compare. ← → keys to navigate.
-->
<template>
  <div
    class="min-h-screen w-full"
    :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
  >
    <!-- Page header with tabs -->
    <header class="sticky top-0 z-30 backdrop-blur-xl">
      <div
        class="border-b"
        :style="{
          backgroundColor: `color-mix(in srgb, ${brand.colors.background} 88%, transparent)`,
          borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
        }"
      >
        <div class="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-6 py-4">
          <div class="flex items-center gap-3">
            <BrandLogo variant="icon" class="h-7 w-auto" />
            <div class="flex flex-col leading-tight">
              <span
                class="font-mono-tab text-[10.5px] font-medium uppercase"
                :style="{
                  letterSpacing: '0.18em',
                  color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
                }"
              >Wallet redesign · Mockups</span>
              <span
                class="text-[15px] font-medium"
                :style="{ color: brand.colors.text, letterSpacing: '-0.01em' }"
              >Carteira + Chat + Raio-X · proposta de fluxo</span>
            </div>
          </div>
          <span
            class="rounded-md px-2 py-1 font-mono-tab text-[11px] font-medium"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
              color: brand.colors.primary,
            }"
          >{{ active }} / {{ mockups.length }}</span>
        </div>

        <!-- Tab switcher -->
        <nav class="mx-auto flex max-w-[1280px] items-stretch gap-0 px-6">
          <button
            v-for="(m, i) in mockups"
            :key="m.id"
            type="button"
            class="mockup-tab flex flex-1 flex-col items-start gap-0.5 border-b-2 px-4 py-3 text-left transition-[color,border-color]"
            :style="{
              borderColor: active === i + 1 ? brand.colors.primary : 'transparent',
              color:
                active === i + 1
                  ? brand.colors.text
                  : `color-mix(in srgb, ${brand.colors.text} 55%, transparent)`,
            }"
            @click="active = i + 1"
          >
            <span
              class="font-mono-tab text-[10px] font-medium uppercase"
              :style="{ letterSpacing: '0.2em', opacity: active === i + 1 ? 0.9 : 0.6 }"
            >0{{ i + 1 }} · {{ m.kind }}</span>
            <span class="text-[13px] font-medium" :style="{ letterSpacing: '-0.005em' }">
              {{ m.name }}
            </span>
          </button>
        </nav>
      </div>
    </header>

    <!-- Concept band -->
    <div class="mx-auto max-w-[1280px] px-6 py-6">
      <div
        class="mb-6 rounded-xl border p-5"
        :style="{
          backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 50%, ${brand.colors.background})`,
          borderColor: `color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
        }"
      >
        <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            class="font-mono-tab text-[10.5px] font-medium uppercase"
            :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
          >Conceito</span>
          <h2
            class="text-[20px] font-medium"
            :style="{ color: brand.colors.text, letterSpacing: '-0.015em' }"
          >{{ currentMockup.name }}</h2>
          <span
            class="text-[14px]"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)` }"
          >— {{ currentMockup.tagline }}</span>
        </div>
        <p
          class="mt-3 max-w-3xl text-[14px]"
          :style="{
            lineHeight: 1.6,
            color: `color-mix(in srgb, ${brand.colors.text} 75%, transparent)`,
          }"
        >{{ currentMockup.description }}</p>
        <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
          <span
            v-for="d in currentMockup.deliverables"
            :key="d"
            class="inline-flex items-center gap-1.5"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }"
          >
            <UIcon name="i-lucide-check" class="size-3" :style="{ color: brand.colors.positive }" />
            {{ d }}
          </span>
        </div>
      </div>

      <!-- Mockup viewport -->
      <div
        class="overflow-hidden rounded-2xl border shadow-2xl"
        :style="{
          borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
          boxShadow: `0 30px 60px -30px color-mix(in srgb, ${brand.colors.primary} 22%, transparent), 0 18px 36px -18px rgba(0,0,0,0.18)`,
        }"
      >
        <div
          class="flex items-center gap-2 border-b px-4 py-2.5"
          :style="{
            backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 35%, ${brand.colors.background})`,
            borderColor: `color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
          }"
        >
          <div class="flex gap-1.5">
            <span class="size-2.5 rounded-full" style="background:#ff5f57"></span>
            <span class="size-2.5 rounded-full" style="background:#febc2e"></span>
            <span class="size-2.5 rounded-full" style="background:#28c840"></span>
          </div>
          <div class="flex-1" />
          <span
            class="font-mono-tab text-[11px]"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
          >app.redentia.com.br{{ currentMockup.fakeUrl }}</span>
          <div class="flex-1" />
        </div>

        <div :style="{ backgroundColor: brand.colors.background }">
          <DevWalletMockupsEmptyState v-if="active === 1" />
          <DevWalletMockupsChatImport v-if="active === 2" />
          <DevWalletMockupsDashboard v-if="active === 3" />
          <DevWalletMockupsRaioXCompleto v-if="active === 4" />
        </div>
      </div>

      <!-- Architecture summary -->
      <div
        class="mt-8 rounded-xl border p-5"
        :style="{
          backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 30%, ${brand.colors.background})`,
          borderColor: `color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
        }"
      >
        <span
          class="font-mono-tab text-[10.5px] font-medium uppercase"
          :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
        >Arquitetura proposta</span>
        <h3
          class="mt-1 text-[18px] font-medium"
          :style="{ color: brand.colors.text, letterSpacing: '-0.015em' }"
        >Fluxo end-to-end (chat → backend → wallet)</h3>
        <ol class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <li
            v-for="(step, i) in flowSteps"
            :key="step.title"
            class="flex flex-col gap-2 rounded-xl border p-4"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.background} 60%, transparent)`,
              borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
            }"
          >
            <span
              class="flex size-7 items-center justify-center rounded-md font-mono-tab text-[12px] font-medium tabular-nums"
              :style="{
                backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
                color: brand.colors.primary,
              }"
            >0{{ i + 1 }}</span>
            <h4
              class="text-[14px] font-medium"
              :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }"
            >{{ step.title }}</h4>
            <p
              class="text-[12px]"
              :style="{
                lineHeight: 1.5,
                color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`,
              }"
            >{{ step.body }}</p>
            <span
              class="font-mono-tab text-[10px] font-medium uppercase"
              :style="{
                letterSpacing: '0.18em',
                color: step.where === 'frontend'
                  ? '#a78bfa'
                  : step.where === 'chat-service'
                    ? brand.colors.primary
                    : brand.colors.positive,
              }"
            >{{ step.where }}</span>
          </li>
        </ol>
      </div>

      <p
        class="mt-6 text-center text-[12px]"
        :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
      >
        Use ← → ou Tab pra alternar mockups. Quando aprovar, eu implemento na ordem: backend schema → chat-service parser + tools → frontend wallet.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const brand = useBrand()
const active = ref(1)

const mockups = [
  {
    id: 'empty',
    kind: 'Empty state',
    name: 'Primeira visita',
    tagline: 'Sem ativos importados ainda',
    description:
      'Quando o usuário entra em /wallet pela primeira vez (ou apaga a carteira), vê esta tela. Único caminho de import: pelo chat. O upload XLSX direto na página foi removido — força o fluxo conversacional, onde a IA pode guiar quem não tem a planilha.',
    deliverables: [
      'CTA primário "Importar via chat"',
      'Link secundário com guia CEI',
      'Preview do que vai aparecer pós-import',
    ],
    fakeUrl: '/wallet',
  },
  {
    id: 'chat',
    kind: 'Chat import flow',
    name: 'Import pelo chat',
    tagline: 'Conversa que substitui o upload',
    description:
      'Conversa completa quando o usuário clica em "Importar via chat" e cai em /help?intent=import-portfolio. A IA pergunta se já tem a planilha, mostra passo a passo do CEI se necessário, recebe o arquivo, parseia 5 abas, confirma o resumo, dispara auto-research em paralelo e apresenta insights inline com CTAs.',
    deliverables: [
      'Persona com diretiva específica de import',
      'Parser B3 CEI (5 abas, escrito no chat-service)',
      'Auto-save em memory + Laravel + SSE event',
      'Tool spinners visíveis durante research',
    ],
    fakeUrl: '/help?intent=import-portfolio',
  },
  {
    id: 'dashboard',
    kind: 'Wallet dashboard',
    name: 'Carteira populada',
    tagline: 'Tudo que importa em uma tela',
    description:
      'Estado normal pós-import. Hero com patrimônio total + variação + CTAs. Métricas (4 cards). Alocação por classe/setor/geografia. Tabela de posições com filtros e mini-barras de peso. Metas + watchlist (vindas da chat memory). Calendário de proventos próximos 60 dias. Raio-X preview (3 strengths/risks/recs). Próximos eventos.',
    deliverables: [
      'Patrimônio + 4 KPIs com sparklines',
      'Donut + setores + heatmap geográfico',
      'Tabela de posições com tags BTC',
      'Goals + watchlist sincronizados com chat',
      'Calendário de proventos com cards diários',
    ],
    fakeUrl: '/wallet',
  },
  {
    id: 'raio-x',
    kind: 'Raio-X completo',
    name: 'Análise profunda',
    tagline: 'O raio-x atual em esteróides',
    description:
      'Surface separada com diagnóstico profundo: score 0-100 com gauge + 9 dimensões; tese por ativo (status: saudável/em risco/pressionada/quebrada); stress test em 4 cenários; comparação com benchmarks (CDI/IBOV/IFIX/SP500); sensibilidade macro; pontos fortes/riscos/recomendações; sugestões DE/PARA. Reusa PortfolioDiagnosis + usePortfolioScore que já existem.',
    deliverables: [
      'Score gauge + 9 dimensões',
      'Tese status por ativo',
      'Stress test (4 cenários)',
      'Macro sensitivity (Selic, IPCA, USD, commodities)',
      'Sugestões DE/PARA acionáveis',
    ],
    fakeUrl: '/wallet/raio-x',
  },
] as const

const currentMockup = computed(() => mockups[active.value - 1])

const flowSteps = [
  {
    title: 'User clica em "Importar"',
    body: '/wallet redireciona pra /help?intent=import-portfolio. Persona ativa modo guiado de import.',
    where: 'frontend',
  },
  {
    title: 'Chat parseia o XLSX',
    body: 'Novo parser B3 CEI lê 5 abas (Ações, Empréstimos, ETF, Fundo, Tesouro), normaliza pra schema unificado.',
    where: 'chat-service',
  },
  {
    title: 'Auto-save em 3 lugares',
    body: 'memory (carteira_atual_composicao + carteira_atual) + Laravel (POST /api/portfolio/upload estendido) + emite SSE portfolio.imported.',
    where: 'chat-service + backend',
  },
  {
    title: 'Wallet refresca via SSE',
    body: 'Frontend ouve portfolio.imported, refaz fetch de /api/portfolio + getComposition, popula dashboard.',
    where: 'frontend',
  },
] as const

// Keyboard navigation
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight' && active.value < mockups.length) active.value += 1
  if (e.key === 'ArrowLeft' && active.value > 1) active.value -= 1
}
onMounted(() => {
  if (!import.meta.client) return
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  if (!import.meta.client) return
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.mockup-tab:hover {
  color: var(--brand-text) !important;
}
</style>
