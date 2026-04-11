<template>
  <NuxtLayout name="api-portal">
    <MoleculesDocsShell :toc="toc">
      <article class="max-w-3xl">
        <!-- Top action buttons -->
        <div class="mb-6 flex items-center gap-2">
          <button
            class="inline-flex items-center gap-2 rounded border px-3 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors hover:opacity-80"
            :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted, backgroundColor: `${brand.colors.surface}60` }"
            @click="copyMarkdown"
          >
            <UIcon name="i-lucide-copy" class="size-3" />
            {{ copied ? 'Copiado!' : 'Copiar Markdown' }}
          </button>
          <button
            class="inline-flex items-center gap-2 rounded border px-3 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors hover:opacity-80"
            :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted, backgroundColor: `${brand.colors.surface}60` }"
          >
            <UIcon name="i-lucide-external-link" class="size-3" />
            Abrir
            <UIcon name="i-lucide-chevron-down" class="size-3" />
          </button>
        </div>

        <!-- Title -->
        <h1
          class="font-display mb-6 text-4xl leading-[1.05] tracking-tight md:text-5xl"
          :style="{ color: brand.colors.text }"
        >
          Comece a usar a API da <span :style="{ color: brand.colors.primary }">Redentia</span>
        </h1>

        <!-- Callout: what is it? -->
        <div
          class="mb-8 rounded-lg border-l-4 border p-5"
          :style="{
            borderColor: brand.colors.border,
            borderLeftColor: brand.colors.primary,
            backgroundColor: `${brand.colors.primary}08`,
          }"
        >
          <div class="mb-2 flex items-center gap-2">
            <UIcon name="i-lucide-info" class="size-4" :style="{ color: brand.colors.primary }" />
            <strong :style="{ color: brand.colors.text }">O que é a Redentia API?</strong>
          </div>
          <p class="text-[14px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
            A <strong :style="{ color: brand.colors.text }">Redentia API</strong> é uma API REST completa para o mercado financeiro brasileiro. Fornecemos dados em tempo real e históricos de
            <strong :style="{ color: brand.colors.text }">ações</strong>, <strong :style="{ color: brand.colors.text }">FIIs</strong>, <strong :style="{ color: brand.colors.text }">BDRs</strong>, <strong :style="{ color: brand.colors.text }">ETFs</strong>, dividendos e indicadores fundamentalistas — obtidos direto da
            <strong :style="{ color: brand.colors.text }">B3</strong> (cotações), <strong :style="{ color: brand.colors.text }">CVM</strong> (demonstrações) e <strong :style="{ color: brand.colors.text }">BCB</strong> (SELIC, câmbio).
          </p>
        </div>

        <p class="mb-4 text-base leading-relaxed" :style="{ color: brand.colors.textMuted }">
          Bem-vindo à documentação da <strong :style="{ color: brand.colors.text }">Redentia API</strong>. Nossa API foi projetada para ser <strong :style="{ color: brand.colors.text }">simples, robusta e confiável</strong>, permitindo que você integre dados financeiros do mercado brasileiro em suas aplicações com o mínimo de esforço.
        </p>
        <p class="mb-12 text-base leading-relaxed" :style="{ color: brand.colors.textMuted }">
          Este guia vai te mostrar como fazer sua primeira requisição em minutos.
        </p>

        <!-- H2: Teste Agora -->
        <h2
          id="teste-agora"
          data-toc-heading
          class="font-display mb-5 mt-14 text-3xl tracking-tight"
          :style="{ color: brand.colors.text }"
        >
          Teste Agora — Sem Cadastro!
        </h2>
        <p class="mb-5 text-[15px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
          Para facilitar o desenvolvimento e testes, você pode experimentar nossa API <strong :style="{ color: brand.colors.text }">imediatamente</strong> com estas 4 ações brasileiras populares — <strong :style="{ color: brand.colors.text }">sem precisar de token ou cadastro</strong>:
        </p>

        <div
          class="mb-6 rounded-lg border-l-4 border p-5"
          :style="{
            borderColor: brand.colors.border,
            borderLeftColor: brand.colors.positive,
            backgroundColor: `${brand.colors.positive}08`,
          }"
        >
          <div class="mb-2 flex items-center gap-2">
            <UIcon name="i-lucide-gift" class="size-4" :style="{ color: brand.colors.positive }" />
            <strong :style="{ color: brand.colors.text }">Ações de Teste Gratuitas</strong>
          </div>
          <p class="text-[14px]" :style="{ color: brand.colors.textMuted }">
            <strong :style="{ color: brand.colors.text }">PETR4</strong> (Petrobras) · <strong :style="{ color: brand.colors.text }">MGLU3</strong> (Magazine Luiza) · <strong :style="{ color: brand.colors.text }">VALE3</strong> (Vale) · <strong :style="{ color: brand.colors.text }">ITUB4</strong> (Itaú)
          </p>
        </div>

        <AtomsCodeBlock
          label="Experimente agora mesmo!"
          :code="codeQuickstart"
          lang="bash"
        />

        <p class="mb-12 mt-6 text-[14px]" :style="{ color: brand.colors.textMuted }">
          Essas ações têm <strong :style="{ color: brand.colors.text }">acesso completo</strong> a todos os recursos da API, incluindo dados históricos, módulos avançados e dividendos!
        </p>

        <!-- H2: Primeira Requisição -->
        <h2
          id="primeira-requisicao"
          data-toc-heading
          class="font-display mb-5 mt-14 text-3xl tracking-tight"
          :style="{ color: brand.colors.text }"
        >
          Faça sua Primeira Requisição
        </h2>

        <ol class="flex flex-col gap-8">
          <li class="flex gap-6">
            <div
              class="flex size-8 shrink-0 items-center justify-center rounded-full border font-mono-tab text-[13px]"
              :style="{ borderColor: brand.colors.primary, color: brand.colors.primary }"
            >
              1
            </div>
            <div class="flex-1">
              <h3
                id="obter-chave"
                data-toc-heading
                class="mb-3 text-xl font-bold tracking-tight"
                :style="{ color: brand.colors.text }"
              >
                Obtenha sua Chave de API (Token)
              </h3>
              <p class="mb-3 text-[14px]" :style="{ color: brand.colors.textMuted }">
                <strong :style="{ color: brand.colors.text }">Para testar:</strong> Use as 4 ações gratuitas (PETR4, MGLU3, VALE3, ITUB4) sem precisar de token.
              </p>
              <p class="text-[14px]" :style="{ color: brand.colors.textMuted }">
                <strong :style="{ color: brand.colors.text }">Para produção:</strong> Crie sua conta no dashboard para gerar seu token e acessar todos os +4.000 ativos disponíveis.
              </p>
              <div
                class="mt-4 rounded-lg border-l-4 border p-4"
                :style="{
                  borderColor: brand.colors.border,
                  borderLeftColor: brand.colors.primary,
                  backgroundColor: `${brand.colors.primary}08`,
                }"
              >
                <div class="mb-1 flex items-center gap-2">
                  <UIcon name="i-lucide-key" class="size-4" :style="{ color: brand.colors.primary }" />
                  <strong class="text-[13px]" :style="{ color: brand.colors.text }">Onde encontrar seu token?</strong>
                </div>
                <p class="text-[13px]" :style="{ color: brand.colors.textMuted }">
                  Seu token estará disponível na seção "Chaves de API" do seu
                  <NuxtLink to="/api-portal/dashboard" class="underline" :style="{ color: brand.colors.primary }">Dashboard</NuxtLink>
                  após o login.
                </p>
              </div>
            </div>
          </li>

          <li class="flex gap-6">
            <div
              class="flex size-8 shrink-0 items-center justify-center rounded-full border font-mono-tab text-[13px]"
              :style="{ borderColor: brand.colors.primary, color: brand.colors.primary }"
            >
              2
            </div>
            <div class="flex-1 min-w-0">
              <h3
                id="primeira-requisicao-heading"
                data-toc-heading
                class="mb-3 text-xl font-bold tracking-tight"
                :style="{ color: brand.colors.text }"
              >
                Faça sua Primeira Requisição
              </h3>
              <p class="mb-3 text-[14px] font-semibold" :style="{ color: brand.colors.text }">
                Teste sem token (ações gratuitas):
              </p>
              <AtomsCodeBlock
                label="Terminal (cURL) — Teste Imediato"
                :code="codeTestNoToken"
                lang="bash"
              />
              <p class="mb-3 mt-5 text-[14px] font-semibold" :style="{ color: brand.colors.text }">
                Com token (todos os ativos):
              </p>
              <AtomsCodeBlock
                label="Terminal (cURL) — Produção"
                :code="codeProduction"
                lang="bash"
              />
            </div>
          </li>

          <li class="flex gap-6">
            <div
              class="flex size-8 shrink-0 items-center justify-center rounded-full border font-mono-tab text-[13px]"
              :style="{ borderColor: brand.colors.primary, color: brand.colors.primary }"
            >
              3
            </div>
            <div class="flex-1 min-w-0">
              <h3
                id="receba-dados"
                data-toc-heading
                class="mb-3 text-xl font-bold tracking-tight"
                :style="{ color: brand.colors.text }"
              >
                Receba os Dados
              </h3>
              <p class="mb-3 text-[14px]" :style="{ color: brand.colors.textMuted }">
                Pronto! Você receberá uma resposta em formato JSON, estruturada e pronta para ser utilizada.
              </p>
              <AtomsCodeBlock
                label="Resposta da API (JSON)"
                :code="codeResponse"
                lang="json"
              />
            </div>
          </li>
        </ol>

        <!-- H2: Autenticação -->
        <h2
          id="autenticacao"
          data-toc-heading
          class="font-display mb-5 mt-16 text-3xl tracking-tight"
          :style="{ color: brand.colors.text }"
        >
          Autenticação
        </h2>
        <p class="mb-5 text-[15px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
          A autenticação é feita via <strong :style="{ color: brand.colors.text }">Bearer Token</strong> no header <code :style="{ color: brand.colors.primary }">Authorization</code>. Obtenha seu token no Dashboard após se cadastrar.
        </p>
        <AtomsCodeBlock
          label="Header de autenticação"
          :code="`Authorization: Bearer SEU_TOKEN_AQUI`"
          lang="http"
        />

        <!-- H2: Principais Conceitos -->
        <h2
          id="conceitos"
          data-toc-heading
          class="font-display mb-5 mt-16 text-3xl tracking-tight"
          :style="{ color: brand.colors.text }"
        >
          Principais Conceitos
        </h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            v-for="c in concepts"
            :key="c.title"
            class="rounded-lg border p-5"
            :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.surface}40` }"
          >
            <UIcon :name="c.icon" class="mb-3 size-5" :style="{ color: brand.colors.primary }" />
            <h3 class="mb-1 text-base font-bold" :style="{ color: brand.colors.text }">
              {{ c.title }}
            </h3>
            <p class="text-[13px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
              {{ c.description }}
            </p>
          </div>
        </div>

        <!-- H2: Endpoints -->
        <h2
          id="endpoints"
          data-toc-heading
          class="font-display mb-5 mt-16 text-3xl tracking-tight"
          :style="{ color: brand.colors.text }"
        >
          Explore Nossos Endpoints
        </h2>
        <p class="mb-6 text-[15px]" :style="{ color: brand.colors.textMuted }">
          A API expõe dados de preços, fundamentos, dividendos, rankings, setores e commentaries. Clique em qualquer endpoint na barra lateral para ver exemplos, parâmetros e código pronto para colar.
        </p>
        <div class="grid gap-2">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.id"
            :to="cat.endpoints[0] ? `/api-portal/docs/${cat.endpoints[0].slug}` : '/api-portal/docs'"
            class="group flex items-center gap-4 rounded-lg border p-4 transition-all hover:-translate-y-0.5"
            :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.surface}40` }"
          >
            <UIcon :name="cat.icon" class="size-5" :style="{ color: brand.colors.primary }" />
            <div class="flex-1">
              <div class="font-bold" :style="{ color: brand.colors.text }">{{ cat.label }}</div>
              <div class="text-[12px]" :style="{ color: brand.colors.textMuted }">
                {{ cat.endpoints.length }} endpoint{{ cat.endpoints.length === 1 ? '' : 's' }}
              </div>
            </div>
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4 transition-transform group-hover:translate-x-1"
              :style="{ color: brand.colors.primary }"
            />
          </NuxtLink>
        </div>

        <!-- H2: Próximos passos -->
        <h2
          id="proximos-passos"
          data-toc-heading
          class="font-display mb-5 mt-16 text-3xl tracking-tight"
          :style="{ color: brand.colors.text }"
        >
          Próximos Passos
        </h2>
        <ul class="flex flex-col gap-3 text-[14px]" :style="{ color: brand.colors.textMuted }">
          <li class="flex items-start gap-2">
            <UIcon name="i-lucide-check-circle" class="mt-0.5 size-4 shrink-0" :style="{ color: brand.colors.primary }" />
            <span>Crie sua conta em <NuxtLink to="/api-portal/auth/register" class="underline" :style="{ color: brand.colors.primary }">/api-portal/auth/register</NuxtLink> para obter seu token.</span>
          </li>
          <li class="flex items-start gap-2">
            <UIcon name="i-lucide-check-circle" class="mt-0.5 size-4 shrink-0" :style="{ color: brand.colors.primary }" />
            <span>Navegue pelos endpoints na barra lateral para ver parâmetros e exemplos em 6 linguagens.</span>
          </li>
          <li class="flex items-start gap-2">
            <UIcon name="i-lucide-check-circle" class="mt-0.5 size-4 shrink-0" :style="{ color: brand.colors.primary }" />
            <span>Leia sobre <NuxtLink to="/api-portal#pricing" class="underline" :style="{ color: brand.colors.primary }">planos e limites</NuxtLink> para escolher a assinatura ideal.</span>
          </li>
        </ul>

        <!-- Footer nav -->
        <div
          class="mt-16 flex items-center justify-between border-t pt-8"
          :style="{ borderColor: brand.colors.border }"
        >
          <div />
          <NuxtLink
            :to="firstEndpointSlug ? `/api-portal/docs/${firstEndpointSlug}` : '/api-portal/docs'"
            class="group inline-flex items-center gap-2 rounded border px-4 py-2 font-mono-tab text-[11px] uppercase tracking-[0.15em] transition-colors"
            :style="{ borderColor: brand.colors.border, color: brand.colors.text, backgroundColor: `${brand.colors.surface}60` }"
          >
            Próximo: Listar Ativos
            <UIcon name="i-lucide-arrow-right" class="size-3 transition-transform group-hover:translate-x-1" :style="{ color: brand.colors.primary }" />
          </NuxtLink>
        </div>
      </article>
    </MoleculesDocsShell>
  </NuxtLayout>
</template>

<script setup lang="ts">
const brand = useBrand()
const { categories, endpoints } = useApiDocs()

const firstEndpointSlug = endpoints[0]?.slug

// Table of Contents for this page — matches the data-toc-heading
// anchors rendered in the template. Kept static (no auto-extraction)
// because the page content is hand-authored and doesn't churn.
const toc = [
  { id: 'teste-agora', text: 'Teste Agora — Sem Cadastro!', level: 2 },
  { id: 'obter-chave', text: 'Obtenha sua Chave de API', level: 3 },
  { id: 'primeira-requisicao-heading', text: 'Faça sua Primeira Requisição', level: 3 },
  { id: 'receba-dados', text: 'Receba os Dados', level: 3 },
  { id: 'autenticacao', text: 'Autenticação', level: 2 },
  { id: 'conceitos', text: 'Principais Conceitos', level: 2 },
  { id: 'endpoints', text: 'Explore Nossos Endpoints', level: 2 },
  { id: 'proximos-passos', text: 'Próximos Passos', level: 2 },
]

const concepts = [
  {
    icon: 'i-lucide-database',
    title: 'Endpoints REST',
    description: 'Todos os endpoints seguem convenções REST com verbos GET padronizados e respostas JSON consistentes.',
  },
  {
    icon: 'i-lucide-shield-check',
    title: 'Rate Limits',
    description: 'Cada plano tem limites por minuto e por mês. Respostas 429 incluem headers X-RateLimit-* para telemetry.',
  },
  {
    icon: 'i-lucide-code-2',
    title: 'Schemas Estáveis',
    description: 'Schemas versionados — mudanças breaking sempre em versões maiores (v1 → v2), nunca in-place.',
  },
  {
    icon: 'i-lucide-gauge',
    title: 'Latência Sub-50ms',
    description: 'Cache em múltiplas camadas garante respostas rápidas mesmo em picos de volume. P95 < 42ms.',
  },
]

// Code examples (literal strings so the CodeBlock component can render
// them as-is with copy support).
const codeQuickstart = `# Cotação simples — funciona sem token
curl "https://api.redentia.com.br/v1/tickers/PETR4"

# Múltiplas ações com histórico
curl "https://api.redentia.com.br/v1/tickers/PETR4,VALE3,MGLU3?range=1mo&interval=1d"

# Com dados fundamentalistas e dividendos
curl "https://api.redentia.com.br/v1/tickers/ITUB4?fundamental=true&dividends=true"`

const codeTestNoToken = `curl "https://api.redentia.com.br/v1/tickers/PETR4"`

const codeProduction = `curl --request GET \\
  --url 'https://api.redentia.com.br/v1/tickers/PETR4' \\
  --header 'Authorization: Bearer SEU_TOKEN'`

const codeResponse = `{
  "data": {
    "symbol": "PETR4",
    "name": "PETROBRAS PN",
    "currency": "BRL",
    "market_price": 49.03,
    "change_percent": 0.27,
    "volume": 56706200,
    "market_cap": 647000000000,
    "dividend_yield": 16.33,
    "pe_ratio": 6.18,
    "sector": "Energy",
    "price_at": "2026-04-11"
  }
}`

// "Copy markdown" — just dumps the page text for now; real markdown
// round-trip is a follow-up.
const copied = ref(false)
async function copyMarkdown() {
  try {
    await navigator.clipboard.writeText('# Redentia API — Comece a usar\n\nVeja https://api.redentia.com.br/api-portal/docs')
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: 'Redentia API · Documentação',
  description: 'Referência completa dos endpoints da Redentia API: preços, fundamentos, dividendos e commentaries.',
  path: '/api-portal/docs',
})
</script>
