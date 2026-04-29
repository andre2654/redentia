<script setup lang="ts">
const brand = useBrand()

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const CONTENT_VERSION = '2026-04-20'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', {
  day: '2-digit', month: 'long', year: 'numeric',
})
const lastUpdatedISO = lastUpdated.toISOString()

usePageSeo({
  title: `Quanto Rende R$ 500/Mês na Bolsa em 30 Anos? | ${brand.name}`,
  description:
    'Simulação real: quanto R$ 500 por mês rendem em 5, 10, 20 e 30 anos. Três cenários (conservador, moderado, arrojado) com juros compostos e dividendos.',
  path: '/guias/quanto-rende-500-por-mes-na-bolsa',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Guias', path: '/guias' },
    { name: 'Quanto Rende R$ 500/mês', path: '/guias/quanto-rende-500-por-mes-na-bolsa' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Quanto Rende R$ 500 Por Mês na Bolsa em 5, 10, 20 e 30 Anos',
      description: 'Simulação com juros compostos e dividendos reinvestidos.',
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
  <NuxtLayout name="static" title="Quanto Rende R$ 500 Por Mês na Bolsa">
    <article class="static-content mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12 md:py-16">
      <NuxtLink
        to="/guias"
        class="flex items-center gap-1 text-xs transition hover:opacity-80"
        :style="{ color: brand.colors.textMuted }"
      >
        <UIcon name="i-lucide-chevron-left" class="size-3" />
        Todos os guias
      </NuxtLink>

      <header class="flex flex-col gap-4">
        <h1 class="md:text-5xl">
          Quanto Rende R$ 500 Por Mês na Bolsa em 5, 10, 20 e 30 Anos?
        </h1>
        <p class="text-lg">
          A resposta depende de três variáveis: tempo, taxa de retorno e disciplina. Rodamos 3 cenários realistas pra você ver o impacto concreto dos juros compostos no seu patrimônio.
        </p>
        <p class="text-sm">Atualizado em {{ lastUpdatedText }} · Leitura de 7 minutos</p>
      </header>

      <section class="flex flex-col gap-6 max-w-none">
        <h2>A resposta curta</h2>
        <p class="leading-relaxed">
          Investindo <strong>R$ 500 por mês</strong> a <strong>10% ao ano</strong> (média histórica próxima do CDI + prêmio de risco da bolsa), você acumula:
        </p>
        <ul class="list-disc space-y-1 pl-6">
          <li><strong>5 anos:</strong> R$ 38.753 (investido R$ 30.000)</li>
          <li><strong>10 anos:</strong> R$ 102.422 (investido R$ 60.000)</li>
          <li><strong>20 anos:</strong> R$ 379.684 (investido R$ 120.000)</li>
          <li><strong>30 anos:</strong> <span :style="{ color: brand.colors.primary }">R$ 1.130.244</span> (investido R$ 180.000)</li>
        </ul>
        <p class="leading-relaxed">
          Em 30 anos, seu patrimônio é <strong>6,3× maior</strong> que o total investido. Esse é o efeito exponencial dos juros compostos, que cresce cada vez mais rápido no final.
        </p>

        <h2>Os 3 cenários detalhados</h2>
        <h3>Cenário Conservador (8% a.a.)</h3>
        <p class="leading-relaxed">
          Carteira com 70% renda fixa (Tesouro Direto, CDB) + 30% ações. Rentabilidade próxima do CDI nos últimos 10 anos.
        </p>
        <div class="not-prose overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 70%, ' + brand.colors.background + ')' }">
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">Prazo</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">Investido</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">Montante</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">Juros</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">5 anos</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 30.000</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)', color: brand.colors.primary }">R$ 36.832</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 6.832</td></tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">10 anos</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 60.000</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)', color: brand.colors.primary }">R$ 91.472</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 31.472</td></tr>
              <tr><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">20 anos</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 120.000</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)', color: brand.colors.primary }">R$ 294.510</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 174.510</td></tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">30 anos</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 180.000</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)', color: brand.colors.primary }">R$ 745.179</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 565.179</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Cenário Moderado (10% a.a.)</h3>
        <p class="leading-relaxed">
          Carteira balanceada: 50% renda fixa, 30% ações boas pagadoras de dividendos, 20% FIIs. Representa bem o histórico do Ibovespa + CDI nos últimos 20 anos.
        </p>
        <div class="not-prose overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 70%, ' + brand.colors.background + ')' }">
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">Prazo</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">Investido</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">Montante</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">Juros</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">5 anos</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 30.000</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)', color: brand.colors.primary }">R$ 38.753</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 8.753</td></tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">10 anos</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 60.000</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)', color: brand.colors.primary }">R$ 102.422</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 42.422</td></tr>
              <tr><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">20 anos</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 120.000</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)', color: brand.colors.primary }">R$ 379.684</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 259.684</td></tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">30 anos</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 180.000</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)', color: brand.colors.primary }">R$ 1.130.244</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 950.244</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Cenário Arrojado (13% a.a.)</h3>
        <p class="leading-relaxed">
          Carteira 80% ações (small caps, growth) + 20% FIIs. Retorno próximo ao histórico de longo prazo do Ibovespa em janelas de 30+ anos, com volatilidade alta no curto prazo.
        </p>
        <div class="not-prose overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 70%, ' + brand.colors.background + ')' }">
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">Prazo</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">Investido</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">Montante</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">Juros</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">5 anos</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 30.000</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)', color: brand.colors.primary }">R$ 41.316</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 11.316</td></tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">10 anos</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 60.000</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)', color: brand.colors.primary }">R$ 118.022</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 58.022</td></tr>
              <tr><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">20 anos</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 120.000</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)', color: brand.colors.primary }">R$ 501.801</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 381.801</td></tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">30 anos</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 180.000</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)', color: brand.colors.primary }">R$ 1.777.619</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 60%, transparent)' }">R$ 1.597.619</td></tr>
            </tbody>
          </table>
        </div>

        <h2>E se eu investir R$ 100, R$ 1.000 ou R$ 2.000?</h2>
        <p class="leading-relaxed">
          A regra é proporcional: se R$ 500/mês viram R$ 1,13 milhão em 30 anos (10% a.a.), então:
        </p>
        <ul class="list-disc space-y-1 pl-6">
          <li><strong>R$ 100/mês</strong> → R$ 226 mil em 30 anos</li>
          <li><strong>R$ 500/mês</strong> → R$ 1,13 milhão em 30 anos</li>
          <li><strong>R$ 1.000/mês</strong> → R$ 2,26 milhões em 30 anos</li>
          <li><strong>R$ 2.000/mês</strong> → R$ 4,52 milhões em 30 anos</li>
        </ul>
        <p class="leading-relaxed">
          Quer simular com seus próprios valores? Use nossa <NuxtLink to="/calculadora/juros-compostos" class="underline" :style="{ color: brand.colors.primary }">calculadora de juros compostos</NuxtLink>, você ajusta aporte, taxa e prazo, vê o gráfico de evolução do patrimônio mês a mês e compara cenários.
        </p>

        <h2>Os 3 erros mais comuns de quem começa</h2>
        <h3>1. Achar que começar com pouco não faz diferença</h3>
        <p class="leading-relaxed">
          R$ 100/mês começando aos 25 anos vira R$ 226 mil aos 55. A maioria nunca começa porque "é pouco", e perde a parte mais valiosa da equação: <strong>o tempo</strong>.
        </p>
        <h3>2. Tentar "acertar o mercado" em vez de aportar consistente</h3>
        <p class="leading-relaxed">
          Market timing raramente funciona. Aportes regulares (DCA, Dollar Cost Averaging) com disciplina batem 90% dos "especialistas" que tentam comprar na baixa.
        </p>
        <h3>3. Não reinvestir os dividendos</h3>
        <p class="leading-relaxed">
          Retirar os dividendos quebra o efeito bola de neve. Se reinvestidos, os dividendos são responsáveis por <strong>40% do retorno total</strong> em janelas de 30 anos.
        </p>

        <h2>Em que investir esses R$ 500?</h2>
        <p class="leading-relaxed">
          Para uma carteira <strong>moderada</strong> (cenário de 10% a.a.), uma divisão realista seria:
        </p>
        <ul class="list-disc space-y-1 pl-6">
          <li><strong>R$ 200</strong> em Tesouro IPCA+ 2035 (proteção contra inflação)</li>
          <li><strong>R$ 150</strong> em ações pagadoras de dividendos, veja nosso <NuxtLink to="/ranking/maiores-dividend-yield" class="underline" :style="{ color: brand.colors.primary }">ranking de maiores DY</NuxtLink></li>
          <li><strong>R$ 100</strong> em FIIs, veja os <NuxtLink to="/fiis" class="underline" :style="{ color: brand.colors.primary }">melhores fundos imobiliários</NuxtLink></li>
          <li><strong>R$ 50</strong> em ETFs de bolsa global (BOVA11, IVVB11) pra diversificar geograficamente</li>
        </ul>
        <p class="leading-relaxed">
          Se você nunca investiu, comece pelo nosso <NuxtLink to="/guias/como-investir-em-acoes-para-iniciantes" class="underline" :style="{ color: brand.colors.primary }">guia de como investir para iniciantes</NuxtLink>.
        </p>
      </section>

      <div class="rounded-3xl border p-8 text-center" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
        <h2 class="mb-3 md:text-3xl">
          Quer simular seu próprio cenário?
        </h2>
        <p class="mx-auto mb-5 max-w-xl">
          Ajuste aporte, taxa e prazo na nossa calculadora gratuita e veja o gráfico de evolução patrimonial mês a mês.
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <UButton to="/calculadora/juros-compostos" size="lg" color="primary">Abrir calculadora</UButton>
          <UButton to="/guias" size="lg" variant="outline" color="neutral">Ver mais guias</UButton>
        </div>
      </div>
    </article>
  </NuxtLayout>
</template>
