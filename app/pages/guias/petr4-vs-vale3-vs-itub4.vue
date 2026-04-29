<script setup lang="ts">
const brand = useBrand()

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const lastUpdatedISO = new Date('2026-04-20').toISOString()
const lastUpdatedText = '20 de abril de 2026'

usePageSeo({
  title: `PETR4 vs VALE3 vs ITUB4: Qual é a Melhor? | ${brand.name}`,
  description:
    'Comparação direta das 3 maiores ações da B3 em 2026: Petrobras, Vale e Itaú. Dividendos, P/L, histórico e qual combina com seu perfil de investidor.',
  path: '/guias/petr4-vs-vale3-vs-itub4',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Guias', path: '/guias' },
    { name: 'PETR4 vs VALE3 vs ITUB4', path: '/guias/petr4-vs-vale3-vs-itub4' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'PETR4 vs VALE3 vs ITUB4 em 2026: Qual é a Melhor Ação?',
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
  <NuxtLayout name="static" title="PETR4 vs VALE3 vs ITUB4">
    <article class="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12 md:py-16">
      <NuxtLink
        to="/guias"
        class="flex items-center gap-1 text-xs transition hover:opacity-80"
        :style="{ color: brand.colors.textMuted }"
      >
        <UIcon name="i-lucide-chevron-left" class="size-3" />
        Todos os guias
      </NuxtLink>

      <header class="flex flex-col gap-4">
        <h1 class="text-3xl md:text-5xl" :class="[brand.font.headingWeight]" :style="{ color: brand.colors.text }">
          PETR4 vs VALE3 vs ITUB4: Qual é a Melhor Ação da Bolsa em 2026?
        </h1>
        <p class="text-lg">
          As três maiores ações do Ibovespa têm perfis completamente diferentes. Comparamos dividendos, P/L, histórico de 5 anos e riscos pra você descobrir qual combina com seu objetivo.
        </p>
        <p class="text-sm" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 60%, transparent)' }">Atualizado em {{ lastUpdatedText }} · Leitura de 9 minutos</p>
      </header>

      <section class="flex flex-col gap-8">
        <h2>Resumo rápido: cada uma para um perfil</h2>
        <ul>
          <li><strong>PETR4:</strong> dividendos altíssimos (&gt;10% DY) mas risco político elevado. Pra quem prioriza renda no curto prazo e aceita volatilidade.</li>
          <li><strong>VALE3:</strong> ciclo de commodities. Paga bem quando minério está em alta, sofre com a China. Pra quem acompanha o cenário macro global.</li>
          <li><strong>ITUB4:</strong> previsibilidade + crescimento consistente. Menor DY (~6%) mas o mais estável dos três. Pra quem quer dormir tranquilo.</li>
        </ul>

        <h2>Comparação lado a lado</h2>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Indicador</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">PETR4</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">VALE3</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">ITUB4</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }"><strong>Setor</strong></td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Petróleo &amp; Gás</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Mineração</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Bancos</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }"><strong>Dividend Yield médio (5 anos)</strong></td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', color: brand.colors.primary }">11,8%</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">8,3%</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">5,9%</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }"><strong>P/L histórico</strong></td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">4,2</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">6,8</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">8,5</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }"><strong>ROE</strong></td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">22%</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">28%</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', color: brand.colors.primary }">19% (recorrente)</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }"><strong>Volatilidade (anual)</strong></td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">38%</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">32%</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', color: brand.colors.primary }">22%</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }"><strong>Risco principal</strong></td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Intervenção política</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Preço do minério</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Inadimplência</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>PETR4, a máquina de dividendos volátil</h2>
        <p>
          A Petrobras paga os maiores dividendos da B3 quando o petróleo está acima de US$ 70. Em 2022 pagou mais de 30% de DY. Mas o preço da ação é refém da política: cada troca de presidente da estatal mexe com a cotação em 5-10% no mesmo dia.
        </p>
        <p>
          <strong>Quando investir:</strong> se você aceita volatilidade alta e quer renda máxima no curto prazo. Evite comprar em anos eleitorais.
        </p>
        <p>
          Veja a página completa com dados ao vivo: <NuxtLink to="/asset/petr4">PETR4, análise completa</NuxtLink>.
        </p>

        <h2>VALE3, a aposta na China</h2>
        <p>
          A Vale é a segunda maior mineradora de minério de ferro do mundo. Seus resultados sobem e descem com a demanda chinesa por aço. Se você acredita em retomada da construção na China, VALE3 é o play direto. Se acredita em estagnação, é o curto direto.
        </p>
        <p>
          <strong>Quando investir:</strong> quando o minério de ferro está abaixo de US$ 90/tonelada e há sinais de estímulo fiscal na China.
        </p>
        <p>
          Veja: <NuxtLink to="/asset/vale3">VALE3, análise completa</NuxtLink>.
        </p>

        <h2>ITUB4, o clássico do buy-and-hold</h2>
        <p>
          O Itaú é um dos bancos mais lucrativos do mundo em ROE. Dividendos menores que PETR4 mas mais previsíveis. Se você quer uma ação pra segurar 20 anos sem mexer, é a escolha óbvia entre os três.
        </p>
        <p>
          <strong>Quando investir:</strong> sempre. Aporte mensal em ITUB4 historicamente bate renda fixa.
        </p>
        <p>
          Veja: <NuxtLink to="/asset/itub4">ITUB4, análise completa</NuxtLink>.
        </p>

        <h2>Qual teria rendido mais em 10 anos?</h2>
        <p>
          Considerando preço + dividendos reinvestidos, de 2016 a 2026:
        </p>
        <ul>
          <li><strong>PETR4:</strong> R$ 10.000 viraram ~R$ 38.400 (CAGR de 14,4%)</li>
          <li><strong>VALE3:</strong> R$ 10.000 viraram ~R$ 31.200 (CAGR de 12,1%)</li>
          <li><strong>ITUB4:</strong> R$ 10.000 viraram ~R$ 27.800 (CAGR de 10,8%)</li>
        </ul>
        <p>
          <strong>Observação importante:</strong> PETR4 entregou mais em absoluto mas com drawdowns de até 50% no caminho. ITUB4 chegou em menos absoluto mas o maior drawdown foi de 25%. Se você tem baixa tolerância a perdas de curto prazo, ITUB4 é o único dos três que não vai te tirar o sono.
        </p>

        <h2>E se em vez de escolher uma, eu comprar as três?</h2>
        <p>
          Diversificar entre setores (energia, commodities e bancos) reduz risco específico. Uma alocação 33/33/33 teria entregue ~12% a.a. nos últimos 10 anos com volatilidade de 24%, menor que qualquer das três individualmente.
        </p>
        <p>
          Pra simular quanto isso rende no longo prazo, use nossa <NuxtLink to="/calculadora/juros-compostos">calculadora de juros compostos</NuxtLink>.
        </p>

        <h2>A resposta final</h2>
        <p>
          Não existe "melhor ação" em abstrato, existe a melhor pra cada objetivo:
        </p>
        <ul>
          <li>Quer <strong>renda máxima agora</strong>? PETR4.</li>
          <li>Quer apostar no <strong>ciclo global</strong>? VALE3.</li>
          <li>Quer <strong>comprar e esquecer</strong>? ITUB4.</li>
          <li>Não tem certeza? Pegue as três em pesos iguais.</li>
        </ul>
      </section>

      <div class="rounded-3xl border p-8 text-center" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
        <h2 class="mb-3" :style="{ color: brand.colors.text }">
          Quer comparar outras ações?
        </h2>
        <p class="mx-auto mb-5 max-w-xl" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 60%, transparent)' }">
          Use nossa plataforma gratuita pra comparar qualquer ação da B3 lado a lado: dividendos, indicadores, histórico de 20 anos.
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <UButton to="/acoes" size="lg" color="primary">Explorar ações</UButton>
          <UButton to="/ranking/maiores-dividend-yield" size="lg" variant="outline" color="neutral">Top dividendos</UButton>
        </div>
      </div>
    </article>
  </NuxtLayout>
</template>
