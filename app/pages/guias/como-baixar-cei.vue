<template>
  <NuxtLayout :name="layoutName" title="Como baixar a planilha da sua carteira no CEI">
    <section class="flex flex-col gap-12 px-6 py-10">
      <!-- ============ Lead + primary CTA ============ -->
      <NuxtLink
        v-if="layoutName === 'static'"
        to="/guias"
        class="flex items-center gap-1 text-xs transition hover:opacity-80"
        :style="{ color: brand.colors.textMuted }"
      >
        <UIcon name="i-lucide-chevron-left" class="size-3" />
        Todos os guias
      </NuxtLink>

      <header class="flex max-w-3xl flex-col gap-3">
        <span
          class="font-mono-tab text-[11px] font-medium uppercase"
          :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
        >Guia · Importação de carteira</span>
        <p
          class="max-w-2xl"
          :style="{
            fontSize: '17.5px',
            lineHeight: 1.55,
            color: `color-mix(in srgb, ${brand.colors.text} 72%, transparent)`,
          }"
        >Em 4 cliques o próprio site da B3 gera o arquivo certo, com todos os teus ativos: ações, FIIs, ETFs, Tesouro Direto e contratos de aluguel. Depois é só anexar aqui na Redentia que a IA processa tudo.</p>
        <div class="mt-2 flex flex-wrap items-center gap-3">
          <NuxtLink
            to="/help?intent=import-portfolio"
            class="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13.5px] font-medium"
            :style="{
              backgroundColor: brand.colors.primary,
              color: brand.colors.background,
              boxShadow: `0 8px 18px -10px color-mix(in srgb, ${brand.colors.primary} 60%, transparent)`,
            }"
          >
            <UIcon name="i-lucide-sparkles" class="size-4" />
            Já tenho a planilha, anexar agora
          </NuxtLink>
          <a
            :href="cei_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13.5px] font-medium"
            :style="{
              borderColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)`,
              color: brand.colors.text,
            }"
          >
            <UIcon name="i-lucide-external-link" class="size-3.5" />
            Abrir o CEI
          </a>
        </div>
      </header>

      <!-- ============ Step-by-step ============ -->
      <section class="flex flex-col gap-6">
        <SectionHeading
          :brand="brand"
          eyebrow="Passo a passo"
          title="4 cliques pra ter o arquivo na sua máquina"
        />

        <ol class="flex flex-col gap-4">
          <li
            v-for="(step, i) in steps"
            :key="step.title"
            class="flex flex-col gap-3 rounded-xl border p-6 md:flex-row md:gap-6"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
              borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
            }"
          >
            <div class="flex shrink-0 items-start gap-3 md:w-[180px] md:flex-col md:items-start">
              <span
                class="flex size-9 shrink-0 items-center justify-center rounded-full font-mono-tab text-[14px] font-medium tabular-nums"
                :style="{
                  backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
                  color: brand.colors.primary,
                }"
              >{{ i + 1 }}</span>
              <span
                class="font-mono-tab text-[10.5px] font-medium uppercase"
                :style="{
                  letterSpacing: '0.18em',
                  color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
                }"
              >Passo {{ String(i + 1).padStart(2, '0') }}</span>
            </div>
            <div class="flex flex-1 flex-col gap-2">
              <h3
                class="text-[18px] font-medium"
                :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }"
              >{{ step.title }}</h3>
              <p
                class="text-[14.5px]"
                :style="{
                  lineHeight: 1.55,
                  color: `color-mix(in srgb, ${brand.colors.text} 72%, transparent)`,
                }"
                v-html="step.body"
              ></p>
              <a
                v-if="step.link"
                :href="step.link.href"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-1 inline-flex items-center gap-1.5 self-start font-mono-tab text-[12px] font-medium"
                :style="{ color: brand.colors.primary }"
              >
                {{ step.link.label }}
                <UIcon name="i-lucide-arrow-up-right" class="size-3" />
              </a>
            </div>
          </li>
        </ol>
      </section>

      <!-- ============ What's inside the file ============ -->
      <section class="flex flex-col gap-6">
        <SectionHeading
          :brand="brand"
          eyebrow="O que vem na planilha"
          title="As 5 abas que o CEI gera"
          lead="Cada aba representa um tipo de ativo. A Redentia lê todas e separa cada classe automaticamente, mesmo se algumas estiverem vazias."
        />
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="sheet in sheets"
            :key="sheet.title"
            class="flex flex-col gap-2 rounded-xl border p-5"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 50%, ${brand.colors.background})`,
              borderColor: `color-mix(in srgb, ${brand.colors.border} 45%, transparent)`,
            }"
          >
            <span
              class="flex size-9 items-center justify-center rounded-lg"
              :style="{ backgroundColor: `color-mix(in srgb, ${sheet.tint} 14%, transparent)` }"
            >
              <UIcon :name="sheet.icon" class="size-5" :style="{ color: sheet.tint }" />
            </span>
            <span
              class="font-mono-tab text-[10.5px] font-medium uppercase"
              :style="{
                letterSpacing: '0.18em',
                color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
              }"
            >Aba "{{ sheet.tab_name }}"</span>
            <h3
              class="text-[15px] font-medium"
              :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }"
            >{{ sheet.title }}</h3>
            <p
              class="text-[13px]"
              :style="{
                lineHeight: 1.55,
                color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`,
              }"
            >{{ sheet.body }}</p>
          </article>
        </div>
      </section>

      <!-- ============ Troubleshooting ============ -->
      <section class="flex flex-col gap-6">
        <SectionHeading
          :brand="brand"
          eyebrow="Se algo não funcionar"
          title="Problemas comuns"
        />
        <div class="flex flex-col gap-3">
          <details
            v-for="qa in faq"
            :key="qa.q"
            class="group rounded-xl border p-5"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 50%, ${brand.colors.background})`,
              borderColor: `color-mix(in srgb, ${brand.colors.border} 45%, transparent)`,
            }"
          >
            <summary
              class="flex cursor-pointer list-none items-center justify-between gap-3 text-[14.5px] font-medium"
              :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }"
            >
              {{ qa.q }}
              <UIcon
                name="i-lucide-chevron-down"
                class="size-4 shrink-0 transition-transform group-open:rotate-180"
                :style="{ color: brand.colors.primary }"
              />
            </summary>
            <p
              class="mt-3 text-[13.5px]"
              :style="{
                lineHeight: 1.6,
                color: `color-mix(in srgb, ${brand.colors.text} 72%, transparent)`,
              }"
              v-html="qa.a"
            ></p>
          </details>
        </div>
      </section>

      <!-- ============ Privacy note ============ -->
      <section
        class="flex flex-col gap-2 rounded-xl border p-6"
        :style="{
          backgroundColor: `color-mix(in srgb, ${brand.colors.positive} 5%, ${brand.colors.surface})`,
          borderColor: `color-mix(in srgb, ${brand.colors.positive} 22%, transparent)`,
        }"
      >
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-shield-check"
            class="size-5"
            :style="{ color: brand.colors.positive }"
          />
          <span
            class="font-mono-tab text-[11px] font-medium uppercase"
            :style="{ letterSpacing: '0.18em', color: brand.colors.positive }"
          >Privacidade</span>
        </div>
        <h3
          class="text-[18px] font-medium"
          :style="{ color: brand.colors.text, letterSpacing: '-0.01em' }"
        >Seus dados ficam só com você</h3>
        <p
          class="text-[14px]"
          :style="{
            lineHeight: 1.55,
            color: `color-mix(in srgb, ${brand.colors.text} 75%, transparent)`,
          }"
        >A planilha é processada exclusivamente pra montar sua carteira na Redentia. Não vendemos os dados, não compartilhamos com terceiros, não fazemos análise para fins comerciais. A conexão é criptografada (TLS) tanto na subida quanto na ida pra IA, e nenhuma corretora ou instituição financeira tem acesso a esse arquivo via Redentia.</p>
      </section>

      <!-- ============ Bottom CTA ============ -->
      <MoleculesCtaSection
        title="Pronto pra importar?"
        description="Anexa a planilha no chat e a IA monta seu raio-x em 30 segundos."
        :buttons="[
          { label: 'Anexar no chat', to: '/help?intent=import-portfolio', icon: 'i-lucide-sparkles', variant: 'primary' },
          { label: 'Ver minha carteira', to: '/wallet', icon: 'i-lucide-wallet', variant: 'outline' },
        ]"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const brand = useBrand()
const authStore = useAuthStore()

// Auth-aware layout: logado mostra sidebar (default); visitante usa
// static (SEO-friendly com hero centralizado do layout).
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'static',
)

usePageSeo({
  title: 'Como baixar sua carteira no CEI da B3 (passo a passo) | Redentia',
  description:
    'Guia rápido pra exportar a planilha XLSX da sua carteira direto do site da B3 (CEI). Em 4 cliques você tem o arquivo pronto pra anexar na Redentia e gerar o raio-x da carteira.',
  path: '/guias/como-baixar-cei',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Guias', path: '/guias' },
    { name: 'Como baixar do CEI', path: '/guias/como-baixar-cei' },
  ],
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Como baixar a planilha da carteira no CEI',
    description:
      'Passo a passo para exportar XLSX da sua carteira no portal de investidor da B3 (CEI).',
    step: [
      { '@type': 'HowToStep', name: 'Acessar o CEI', text: 'Entre em https://www.investidor.b3.com.br/minha-carteira/investimentos/posicao com seu CPF e senha.' },
      { '@type': 'HowToStep', name: 'Aprovar 2FA', text: 'Confirme o acesso pelo app B3 ou via código de 6 dígitos.' },
      { '@type': 'HowToStep', name: 'Clicar em Baixar em Excel', text: 'No canto superior direito da tela de Posição, clique em "Baixar em Excel".' },
      { '@type': 'HowToStep', name: 'Anexar na Redentia', text: 'Abra o chat da Redentia em /help e arraste o arquivo XLSX baixado.' },
    ],
  },
})

const cei_url = 'https://www.investidor.b3.com.br/minha-carteira/investimentos/posicao'

const steps = [
  {
    title: 'Acesse o CEI',
    body: `Vai pra área <strong>Posição</strong> no portal de investidor da B3. Você precisa do seu <strong>CPF</strong> e senha de acesso ao CEI (não é a senha da corretora).`,
    link: { label: 'Abrir o CEI agora', href: cei_url },
  },
  {
    title: 'Aprove o 2FA',
    body: 'A B3 pede confirmação por 2 fatores em todo login. Você recebe um push no app oficial da B3 (recomendado) ou pode digitar um código de 6 dígitos enviado por SMS/email. Aprove ali e ele te leva direto pra tela de Posição.',
  },
  {
    title: 'Clique em "Baixar em Excel"',
    body: 'No canto superior direito da tela de Posição, tem um botão chamado <strong>"Baixar em Excel"</strong>. Clique. O arquivo <code style="background:color-mix(in srgb, var(--brand-text) 6%, transparent);padding:2px 4px;border-radius:3px;font-family:var(--font-mono, ui-monospace, monospace);font-size:12px">posicao-AAAA-MM-DD-HH-MM-SS.xlsx</code> baixa automaticamente.',
  },
  {
    title: 'Volte aqui e anexe no chat',
    body: 'Abra o chat da Redentia e arraste o arquivo (ou clique no ícone de anexo). A IA reconhece a estrutura do CEI, separa Ações / FIIs / ETFs / Tesouro / Empréstimos automaticamente e monta seu raio-x em ~30 segundos.',
    link: { label: 'Abrir o chat de import', href: '/help?intent=import-portfolio' },
  },
] as const

const sheets = [
  { tab_name: 'Acoes', title: 'Ações', body: 'Toda renda variável BR: ON, PN, units. Vem com ticker, quantidade, preço de fechamento e valor atualizado.', icon: 'i-lucide-trending-up', tint: '#fbbf24' },
  { tab_name: 'Fundo de Investimento', title: 'Fundos imobiliários (FIIs)', body: 'Cotas de FII com tipo, quantidade e valor. A Redentia trata como classe REIT separada das ações.', icon: 'i-lucide-building-2', tint: '#a78bfa' },
  { tab_name: 'ETF', title: 'ETFs', body: 'ETFs nacionais ou internacionais (BDRs de ETF). Diferenciados de ações para cálculo de alocação por classe.', icon: 'i-lucide-pie-chart', tint: '#34d399' },
  { tab_name: 'Tesouro Direto', title: 'Tesouro Direto', body: 'Títulos do Tesouro com indexador (IPCA/SELIC/Prefixado), vencimento e valor aplicado vs valor atualizado.', icon: 'i-lucide-shield', tint: '#10b981' },
  { tab_name: 'Empréstimos', title: 'Empréstimos (BTC)', body: 'Ações que estão alugadas no mercado de aluguel. A Redentia identifica e marca como "em aluguel" na sua carteira.', icon: 'i-lucide-handshake', tint: '#60a5fa' },
] as const

const faq = [
  {
    q: 'Não estou conseguindo logar no CEI',
    a: 'Se a senha falhar, vá em "Esqueceu a senha?" no próprio site. Se o 2FA não chegar, use o app oficial da B3 — o push aparece em segundos. Em último caso, ligue pra Central de Atendimento da B3 (11 2565-4000).',
  },
  {
    q: 'O botão "Baixar em Excel" não aparece pra mim',
    a: 'Geralmente é alguma extensão de navegador bloqueando JavaScript ou anti-tracking agressivo. Tente abrir em uma aba anônima ou em outro navegador (Chrome/Edge funcionam bem). Se persistir, atualize a página depois de 5 segundos.',
  },
  {
    q: 'Tenho conta em mais de uma corretora — preciso baixar de cada uma?',
    a: 'Não. O CEI é centralizado: ele já agrega todas as suas posições nas corretoras conectadas à B3. Uma única planilha cobre tudo.',
  },
  {
    q: 'O que acontece se eu importar a mesma carteira duas vezes?',
    a: 'A nova importação substitui a anterior. Não tem duplicação. Se você tem aporte mensal, recomendo importar a cada 30 dias pra manter a carteira atualizada na Redentia.',
  },
  {
    q: 'Posso editar a planilha antes de subir?',
    a: 'Pode, mas não precisa. A Redentia entende o formato original do CEI inteiro. Se você editar e quebrar a estrutura, talvez algumas posições fiquem ausentes. Se quiser remover algum ativo, o melhor é importar e depois usar o chat pra ajustar.',
  },
  {
    q: 'Meus dados ficam seguros?',
    a: 'Sim. A planilha é processada só pra montar sua carteira na Redentia. Não vendemos os dados, não compartilhamos com terceiros e a conexão é criptografada com TLS. Nenhuma corretora ou instituição financeira tem acesso ao arquivo via Redentia.',
  },
] as const
</script>
