<template>
  <NuxtLayout name="static" title="Como Investir em Ações para Iniciantes">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-trending-up" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl font-bold md:text-4xl">
            Como Investir em Ações para Iniciantes
          </h1>
        </div>
        <p class="text-base text-gray-400 md:text-lg">
          Guia completo e passo a passo para você começar a investir na bolsa de valores brasileira. Aprenda desde o básico até estratégias práticas.
        </p>
      </div>

      <!-- Conteúdo Educacional -->
      <div class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold">O que são Ações?</h2>
        <p class="leading-relaxed text-gray-300">
          Ações são pequenas partes (frações) de uma empresa listada na bolsa de valores. Quando você compra uma ação, você se torna sócio da empresa e passa a ter direito a uma parcela dos lucros (dividendos) e pode se beneficiar da valorização da empresa ao longo do tempo.
        </p>

        <h3 class="text-xl font-semibold">Por que Investir em Ações?</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Potencial de Retorno
            </h4>
            <p class="text-sm text-gray-300">
              Historicamente, ações oferecem os maiores retornos no longo prazo, superando inflação e renda fixa.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Renda Passiva
            </h4>
            <p class="text-sm text-gray-300">
              Receba dividendos regularmente sem precisar vender suas ações. Empresas boas pagadoras distribuem lucros aos acionistas.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Proteção Contra Inflação
            </h4>
            <p class="text-sm text-gray-300">
              Empresas reajustam preços com a inflação, protegendo seu patrimônio do aumento do custo de vida.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Participação nos Lucros
            </h4>
            <p class="text-sm text-gray-300">
              Como sócio, você se beneficia do crescimento e sucesso da empresa através da valorização das ações.
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Passo a Passo: Como Começar</h2>
        
        <h3 class="text-xl font-semibold">1. Escolha uma Corretora</h3>
        <p class="leading-relaxed text-gray-300">
          Para investir em ações, você precisa abrir conta em uma corretora de valores autorizada pela CVM (Comissão de Valores Mobiliários). As principais opções no Brasil são:
        </p>
        <ul class="list-disc space-y-2 pl-6 text-gray-300">
          <li>XP Investimentos</li>
          <li>Rico (XP)</li>
          <li>Inter Invest</li>
          <li>BTG Pactual</li>
          <li>Clear (XP)</li>
          <li>Nubank (Nu Invest)</li>
        </ul>
        <p class="leading-relaxed text-gray-300">
          <strong>Dica:</strong> Compare taxas de corretagem, custódia e qualidade da plataforma antes de escolher.
        </p>

        <h3 class="text-xl font-semibold">2. Transfira Dinheiro para a Corretora</h3>
        <p class="leading-relaxed text-gray-300">
          Após abrir a conta, transfira o valor que deseja investir através de TED ou PIX. O dinheiro ficará disponível para negociação geralmente no mesmo dia (PIX) ou em 1 dia útil (TED).
        </p>

        <h3 class="text-xl font-semibold">3. Estude as Empresas</h3>
        <p class="leading-relaxed text-gray-300">
          Antes de comprar ações, pesquise sobre as empresas. Analise indicadores fundamentalistas importantes:
        </p>
        <ul class="list-disc space-y-2 pl-6 text-gray-300">
          <li>
            <strong>P/L (Preço sobre Lucro):</strong> Indica quantos anos levaria para recuperar seu investimento. Geralmente, P/L entre 10-20 é razoável.
          </li>
          <li>
            <strong>ROE (Return on Equity):</strong> Mostra a rentabilidade sobre o patrimônio. Busque empresas com ROE acima de 15%.
          </li>
          <li>
            <strong>Dividend Yield:</strong> Percentual de dividendos pagos. Acima de 4% ao ano é considerado bom.
          </li>
          <li>
            <strong>Dívida Líquida/EBITDA:</strong> Avalia o endividamento. Idealmente abaixo de 2x.
          </li>
        </ul>

        <h3 class="text-xl font-semibold">4. Faça sua Primeira Compra</h3>
        <p class="leading-relaxed text-gray-300">
          No aplicativo ou site da corretora, busque pelo código da ação (ticker) que deseja comprar. Por exemplo:
        </p>
        <div class="flex flex-wrap gap-2">
          <AtomsTickerEmbed ticker="PETR4" />
          <AtomsTickerEmbed ticker="VALE3" />
          <AtomsTickerEmbed ticker="ITUB4" />
          <AtomsTickerEmbed ticker="BBDC4" />
        </div>
        <p class="leading-relaxed text-gray-300">
          <strong>Importante:</strong> Comece com valores pequenos (R$ 100-500) para aprender. Você pode comprar ações no mercado fracionário (menos de 100 ações).
        </p>

        <h3 class="text-xl font-semibold">5. Diversifique seu Portfólio</h3>
        <p class="leading-relaxed text-gray-300">
          Não coloque todo seu dinheiro em uma única empresa. Uma carteira bem diversificada deve ter:
        </p>
        <ul class="list-disc space-y-2 pl-6 text-gray-300">
          <li>Entre 5 a 15 empresas diferentes</li>
          <li>Ações de setores variados (bancos, varejo, energia, etc.)</li>
          <li>Mix entre empresas grandes (blue chips) e médias</li>
        </ul>

        <h2 class="text-2xl font-bold">Quanto Investir?</h2>
        <p class="leading-relaxed text-gray-300">
          Não existe um valor mínimo obrigatório, mas algumas recomendações práticas:
        </p>
        <div class="space-y-3">
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Para Iniciantes</h4>
            <p class="text-sm text-gray-400">
              R$ 100 a R$ 500 por mês - Para aprender e ganhar experiência
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Nível Intermediário</h4>
            <p class="text-sm text-gray-400">
              R$ 500 a R$ 2.000 por mês - Para construir patrimônio
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Avançado</h4>
            <p class="text-sm text-gray-400">
              Acima de R$ 2.000 por mês - Para acelerar crescimento
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Erros Comuns de Iniciantes</h2>
        <div
          class="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5"
        >
          <ul class="list-disc space-y-2 pl-6 text-gray-300">
            <li>
              <strong>Não diversificar:</strong> Colocar todo dinheiro em poucas ações aumenta muito o risco
            </li>
            <li>
              <strong>Vender no pânico:</strong> Vender quando o mercado cai por medo de perder mais
            </li>
            <li>
              <strong>Seguir dicas de "gurus":</strong> Tomar decisões baseadas em promessas de ganhos rápidos
            </li>
            <li>
              <strong>Não estudar:</strong> Comprar ações sem entender a empresa
            </li>
            <li>
              <strong>Investir dinheiro de emergência:</strong> Usar dinheiro que pode precisar em breve
            </li>
            <li>
              <strong>Esperar timing perfeito:</strong> Tentar acertar o melhor momento para comprar
            </li>
          </ul>
        </div>

        <h2 class="text-2xl font-bold">Estratégias para Iniciantes</h2>
        
        <h3 class="text-xl font-semibold">Buy and Hold</h3>
        <p class="leading-relaxed text-gray-300">
          Compre ações de empresas sólidas e mantenha por anos. Esta é a estratégia preferida de Warren Buffett e a mais recomendada para quem está começando.
        </p>

        <h3 class="text-xl font-semibold">Aportes Mensais</h3>
        <p class="leading-relaxed text-gray-300">
          Invista todos os meses um valor fixo, independente da cotação. Isso reduz o impacto da volatilidade através do "preço médio".
        </p>

        <h3 class="text-xl font-semibold">Reinvestimento de Dividendos</h3>
        <p class="leading-relaxed text-gray-300">
          Use os dividendos recebidos para comprar mais ações. Com o tempo, isso gera efeito de "bola de neve" (juros compostos).
        </p>

        <h2 class="text-2xl font-bold">Impostos sobre Ações</h2>
        <p class="leading-relaxed text-gray-300">
          É importante entender a tributação:
        </p>
        <ul class="list-disc space-y-2 pl-6 text-gray-300">
          <li>
            <strong>Vendas até R$ 20.000/mês:</strong> Isentas de imposto
          </li>
          <li>
            <strong>Vendas acima de R$ 20.000/mês:</strong> 15% sobre o lucro (você mesmo declara e paga via DARF)
          </li>
          <li>
            <strong>Dividendos:</strong> Isentos de imposto de renda
          </li>
          <li>
            <strong>Day trade:</strong> 20% sobre o lucro (sempre tributado)
          </li>
        </ul>
      </div>

      <!-- CTA para Ferramentas -->
      <MoleculesCtaSection
        title="Comece a Investir com a Redentia"
        description="Use nossas ferramentas para encontrar as melhores ações e acompanhar seus investimentos"
        :buttons="[
          { label: 'Ver Todas as Ações', to: '/acoes', icon: 'i-lucide-trending-up', variant: 'primary' },
          { label: 'Buscar Ações', to: '/search?group=stocks', icon: 'i-lucide-search', variant: 'outline' },
          { label: 'Glossário', to: '/glossario', icon: 'i-lucide-book-open', variant: 'ghost' },
        ]"
      />

      <!-- FAQ Section para SEO -->
      <div class="space-y-4">
        <h2 class="text-2xl font-bold">Perguntas Frequentes</h2>
        <div class="space-y-4">
          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Quanto dinheiro preciso para começar a investir em ações?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Você pode começar com menos de R$ 100. No mercado fracionário, é possível comprar qualquer quantidade de ações, mesmo que custe R$ 10 ou R$ 20. O importante é começar e ir aumentando gradualmente conforme aprende.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Qual a melhor corretora para iniciantes?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Para iniciantes, corretoras com plataforma intuitiva e conteúdo educacional são ideais. XP, Rico, Inter e Nubank (Nu Invest) são boas opções. Compare taxas de corretagem (muitas são zero) e escolha a que melhor se adapta ao seu perfil.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              É seguro investir em ações?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Ações têm risco de volatilidade e perdas no curto prazo. No entanto, no longo prazo (10+ anos) e com diversificação, historicamente oferecem bons retornos. Nunca invista dinheiro que você precisa no curto prazo ou sua reserva de emergência.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Quando vou receber dividendos?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Os dividendos são pagos conforme a política de cada empresa. Algumas pagam mensalmente, outras trimestralmente ou semestralmente. O importante é estar com as ações na "data com" para ter direito ao recebimento.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Quantas ações devo ter na minha carteira?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Para iniciantes, começar com 5-8 ações já oferece boa diversificação. Conforme o patrimônio cresce, você pode aumentar para 10-15 ações. Mais que 20 ações pode dificultar o acompanhamento.
            </p>
          </details>
        </div>
      </div>

      <!-- Navegação para Outros Guias -->
      <div class="border-t border-white/10 pt-8">
        <h3 class="mb-4 text-xl font-semibold">Continue Aprendendo</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink
            to="/guias/melhores-fiis-para-investir-em-2026"
            class="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-secondary/30"
          >
            <UIcon name="i-lucide-building-2" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="font-semibold group-hover:text-secondary">Melhores FIIs 2026</h4>
              <p class="text-xs text-gray-400">Fundos imobiliários recomendados</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>

          <NuxtLink
            to="/guias/calculadora-de-dividendos"
            class="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-secondary/30"
          >
            <UIcon name="i-lucide-coins" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="font-semibold group-hover:text-secondary">Calculadora de Dividendos</h4>
              <p class="text-xs text-gray-400">Calcule sua renda passiva</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title:
    'Como Investir em Ações para Iniciantes: Guia Completo 2026 | Redentia',
  description:
    'Aprenda passo a passo como começar a investir em ações. Guia completo desde abertura de conta até estratégias práticas. Indicadores, erros comuns e dicas para iniciantes.',
  path: '/guias/como-investir-em-acoes-para-iniciantes',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Como Investir em Ações para Iniciantes: Guia Completo',
      description:
        'Guia passo a passo completo para iniciantes começarem a investir na bolsa de valores brasileira',
      author: {
        '@type': 'Organization',
        name: 'Redentia',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Redentia',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.redentia.com.br/512x512.png',
        },
      },
      datePublished: '2026-01-04',
      dateModified: '2026-01-04',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Quanto dinheiro preciso para começar a investir em ações?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Você pode começar com menos de R$ 100. No mercado fracionário, é possível comprar qualquer quantidade de ações.',
          },
        },
        {
          '@type': 'Question',
          name: 'Qual a melhor corretora para iniciantes?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Para iniciantes, corretoras com plataforma intuitiva como XP, Rico, Inter e Nubank são boas opções.',
          },
        },
        {
          '@type': 'Question',
          name: 'É seguro investir em ações?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ações têm risco de volatilidade no curto prazo, mas no longo prazo (10+ anos) com diversificação, historicamente oferecem bons retornos.',
          },
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.redentia.com.br',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Guias',
          item: 'https://www.redentia.com.br/guias',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Como Investir em Ações',
          item: 'https://www.redentia.com.br/guias/como-investir-em-acoes-para-iniciantes',
        },
      ],
    },
  ],
})
</script>
