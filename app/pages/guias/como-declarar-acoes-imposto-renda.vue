<script setup lang="ts">
const brand = useBrand()

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const lastUpdatedISO = new Date('2026-04-20').toISOString()
const lastUpdatedText = '20 de abril de 2026'

usePageSeo({
  title: `Como Declarar Ações no IR 2026: Guia Completo | ${brand.name}`,
  description:
    'Como declarar ações, FIIs e dividendos no IR 2026: isenções, códigos da Receita, limite de R$ 20 mil, day vs swing trade e as 5 pegadinhas mais comuns.',
  path: '/guias/como-declarar-acoes-imposto-renda',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Guias', path: '/guias' },
    { name: 'Declarar Ações no IR', path: '/guias/como-declarar-acoes-imposto-renda' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Como Declarar Ações no Imposto de Renda 2026: Passo a Passo',
      datePublished: lastUpdatedISO,
      dateModified: lastUpdatedISO,
      author: { '@type': 'Organization', name: brand.name, url: brand.url },
      publisher: {
        '@type': 'Organization', name: brand.name,
        logo: { '@type': 'ImageObject', url: `${brand.url}/512x512.png` },
      },
    },
  ],
})
</script>

<template>
  <NuxtLayout name="static" title="Declarar Ações no IR 2026">
    <article class="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12 md:py-16">
      <nav class="flex items-center gap-2 text-sm text-gray-400">
        <NuxtLink to="/" class="hover:text-white">Início</NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="size-4" />
        <NuxtLink to="/guias" class="hover:text-white">Guias</NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="size-4" />
        <span class="text-white">Declarar Ações no IR</span>
      </nav>

      <header class="flex flex-col gap-4">
        <h1 class="text-3xl md:text-5xl" :class="[brand.font.headingWeight]" :style="{ color: brand.colors.text }">
          Como Declarar Ações no Imposto de Renda 2026: Guia Completo
        </h1>
        <p class="text-lg text-gray-400">
          Se você comprou, vendeu ou recebeu dividendos em 2025, a declaração 2026 te alcança. O bom é que com a calculadora certa, 90% da complexidade desaparece.
        </p>
        <p class="text-sm text-gray-500">Atualizado em {{ lastUpdatedText }} · Leitura de 12 minutos</p>
      </header>

      <section class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">O essencial em 30 segundos</h2>
        <ul class="list-disc space-y-1 pl-6 text-gray-300">
          <li>Quem tem ações <strong>precisa declarar</strong> mesmo que não tenha vendido.</li>
          <li>Vendas de até <strong>R$ 20.000/mês</strong> em ações são <strong>isentas de IR</strong> (swing trade, não day trade).</li>
          <li>Dividendos são <strong>isentos</strong> (em 2026). JCP tem 15% retido na fonte.</li>
          <li>FIIs: rendimentos mensais <strong>isentos</strong>; ganho na venda tem 20% de IR.</li>
          <li>Day trade tem 20% de IR independente do valor.</li>
        </ul>

        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">Quem é obrigado a declarar?</h2>
        <p class="leading-relaxed text-gray-300">
          Além das regras gerais (renda anual acima de R$ 30.639,90, etc.), você é obrigado a declarar IR em 2026 se em 2025:
        </p>
        <ul class="list-disc space-y-1 pl-6 text-gray-300">
          <li>Teve posse de <strong>ações, FIIs ou ETFs em 31/12/2025</strong> — independente do valor.</li>
          <li>Vendeu ações totalizando mais de <strong>R$ 40.000</strong> no ano (mesmo que isento).</li>
          <li>Teve <strong>ganho tributável</strong> em venda de ações (acima de R$ 20k/mês em swing trade).</li>
          <li>Fez <strong>qualquer operação de day trade</strong>.</li>
        </ul>

        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">Passo a passo: 5 fichas que você vai preencher</h2>
        <h3 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Ficha 1 — Bens e Direitos</h3>
        <p class="leading-relaxed text-gray-300">
          É aqui que você declara a <strong>posição das ações em 31/12/2025</strong>. Para cada ativo:
        </p>
        <ul class="list-disc space-y-1 pl-6 text-gray-300">
          <li><strong>Código:</strong> 31 (Ações) ou 72 (FIIs)</li>
          <li><strong>Discriminação:</strong> quantidade × ticker × CNPJ da empresa × corretora</li>
          <li><strong>Situação em 31/12/2024:</strong> preço médio de aquisição × quantidade no ano passado</li>
          <li><strong>Situação em 31/12/2025:</strong> preço médio de aquisição × quantidade atual</li>
        </ul>
        <p class="leading-relaxed text-gray-300">
          <strong>Atenção:</strong> o valor informado é o <strong>preço médio de aquisição</strong>, não o preço de mercado em 31/12. Se você comprou 100 ações a R$ 30 e mais 100 a R$ 40, seu preço médio é R$ 35, mesmo que a ação esteja a R$ 50 no fim do ano.
        </p>

        <h3 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Ficha 2 — Rendimentos Isentos e Não Tributáveis</h3>
        <p class="leading-relaxed text-gray-300">
          Aqui vão os dividendos e rendimentos de FIIs:
        </p>
        <ul class="list-disc space-y-1 pl-6 text-gray-300">
          <li><strong>Código 9:</strong> Dividendos de ações — somatório do ano, CNPJ da empresa pagadora</li>
          <li><strong>Código 26:</strong> Rendimentos de FIIs — somatório mensal, CNPJ do fundo</li>
          <li><strong>Código 20:</strong> Ganhos em vendas de ações até R$ 20k/mês (swing trade isento)</li>
        </ul>

        <h3 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Ficha 3 — Rendimentos Sujeitos à Tributação Exclusiva/Definitiva</h3>
        <p class="leading-relaxed text-gray-300">
          JCP (Juros sobre Capital Próprio) entram aqui:
        </p>
        <ul class="list-disc space-y-1 pl-6 text-gray-300">
          <li><strong>Código 10:</strong> JCP, valor líquido recebido (já com 15% de IR retido na fonte)</li>
        </ul>

        <h3 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Ficha 4 — Renda Variável</h3>
        <p class="leading-relaxed text-gray-300">
          Se você teve lucro em venda tributável (acima de R$ 20k/mês em swing trade, ou qualquer day trade), você precisa preencher mês a mês:
        </p>
        <ul class="list-disc space-y-1 pl-6 text-gray-300">
          <li>Lucros e prejuízos por mês em operações comuns (swing trade)</li>
          <li>Lucros e prejuízos em day trade (tributação de 20%, alíquota fixa)</li>
          <li>Lucros em FIIs (20%)</li>
          <li>IR pago por meio de DARF (código 6015)</li>
        </ul>
        <p class="leading-relaxed text-gray-300">
          <strong>Lembrete:</strong> você mesmo paga o IR via DARF <strong>no mês seguinte à venda</strong>, não na declaração. A declaração só confirma o que já foi pago.
        </p>

        <h3 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Ficha 5 — Operações Comuns</h3>
        <p class="leading-relaxed text-gray-300">
          Detalhamento mensal das operações — a parte mais trabalhosa se você operou muito. Boa notícia: várias corretoras (XP, BTG, Rico, Clear, NuInvest) exportam o relatório já no formato exigido pela Receita.
        </p>

        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">As 5 pegadinhas mais comuns</h2>
        <h3 class="text-xl font-semibold" :style="{ color: brand.colors.text }">1. Esquecer de pagar DARF no mês da venda</h3>
        <p class="leading-relaxed text-gray-300">
          Se você teve lucro tributável em julho, precisa gerar DARF até <strong>último dia útil de agosto</strong>. Atraso gera multa de 0,33% ao dia (limite 20%) + juros Selic. Muita gente descobre isso só na declaração — e aí já tem multa acumulada.
        </p>
        <h3 class="text-xl font-semibold" :style="{ color: brand.colors.text }">2. Confundir swing trade e day trade</h3>
        <p class="leading-relaxed text-gray-300">
          Day trade = comprar e vender <strong>no mesmo pregão</strong>. Qualquer outra coisa é swing trade. Day trade tem 20% de IR independente do valor; swing trade só tem IR acima de R$ 20k/mês e a alíquota é 15%.
        </p>
        <h3 class="text-xl font-semibold" :style="{ color: brand.colors.text }">3. Não compensar prejuízos</h3>
        <p class="leading-relaxed text-gray-300">
          Prejuízo em swing trade pode ser compensado com lucro de swing trade dos meses seguintes, e carrega para anos futuros. Muita gente esquece e paga IR em dobro. O mesmo vale pra FIIs (prejuízo de FII só compensa com lucro de FII).
        </p>
        <h3 class="text-xl font-semibold" :style="{ color: brand.colors.text }">4. Declarar valor de mercado em vez de preço médio</h3>
        <p class="leading-relaxed text-gray-300">
          Na ficha Bens e Direitos, o valor é <strong>preço médio × quantidade</strong>, não preço de mercado. Quem bota valor de mercado paga IR sobre "valorização" que nem realizou (bi-tributação).
        </p>
        <h3 class="text-xl font-semibold" :style="{ color: brand.colors.text }">5. Esquecer os dividendos recebidos</h3>
        <p class="leading-relaxed text-gray-300">
          Mesmo sendo isentos, dividendos <strong>precisam ser declarados</strong> na ficha Rendimentos Isentos. Receita cruza com o informe da empresa — se não bate, cai na malha.
        </p>

        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">Calculadora de IR em ações</h2>
        <p class="leading-relaxed text-gray-300">
          Quer saber quanto você vai pagar de IR antes de vender? Use nossa <NuxtLink to="/calculadora/imposto-renda" class="underline" :style="{ color: brand.colors.primary }">calculadora de IR sobre ações</NuxtLink> — ajusta por tipo de operação (swing/day), aplica isenção de R$ 20k/mês e gera o valor do DARF.
        </p>

        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">Datas importantes 2026</h2>
        <ul class="list-disc space-y-1 pl-6 text-gray-300">
          <li><strong>1º de março:</strong> início da entrega da declaração</li>
          <li><strong>31 de maio:</strong> prazo final (restitui mais cedo quem entrega primeiro)</li>
          <li><strong>Último dia útil do mês seguinte à venda:</strong> prazo pra pagar DARF (código 6015)</li>
        </ul>

        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">Preciso de contador?</h2>
        <p class="leading-relaxed text-gray-300">
          Depende do volume e da complexidade:
        </p>
        <ul class="list-disc space-y-1 pl-6 text-gray-300">
          <li><strong>Só buy &amp; hold</strong> (sem vender muito, só dividendos): dá pra fazer sozinho tranquilamente.</li>
          <li><strong>Vendeu acima de R$ 20k/mês ocasionalmente:</strong> também dá, mas use o informe da corretora como base.</li>
          <li><strong>Day trader frequente ou múltiplas corretoras:</strong> vale pagar contador especializado (R$ 500-1.500/ano).</li>
        </ul>
      </section>

      <div class="rounded-3xl border p-8 text-center" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
        <h2 class="mb-3 text-2xl md:text-3xl" :class="[brand.font.headingWeight]" :style="{ color: brand.colors.text }">
          Calcule seu IR antes de vender
        </h2>
        <p class="mx-auto mb-5 max-w-xl text-gray-400">
          Nossa calculadora de IR sobre ações aplica todas as regras (R$ 20k, day trade, FIIs) e gera o valor exato que você vai pagar de DARF.
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <UButton to="/calculadora/imposto-renda" size="lg" color="primary">Calculadora de IR</UButton>
          <UButton to="/guias" size="lg" variant="outline" color="neutral">Mais guias</UButton>
        </div>
      </div>
    </article>
  </NuxtLayout>
</template>
