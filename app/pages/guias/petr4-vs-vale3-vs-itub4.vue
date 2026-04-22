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
      <nav class="flex items-center gap-2 text-sm text-gray-400">
        <NuxtLink to="/" class="hover:text-white">Início</NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="size-4" />
        <NuxtLink to="/guias" class="hover:text-white">Guias</NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="size-4" />
        <span class="text-white">PETR4 vs VALE3 vs ITUB4</span>
      </nav>

      <header class="flex flex-col gap-4">
        <h1 class="text-3xl md:text-5xl" :class="[brand.font.headingWeight]" :style="{ color: brand.colors.text }">
          PETR4 vs VALE3 vs ITUB4: Qual é a Melhor Ação da Bolsa em 2026?
        </h1>
        <p class="text-lg text-gray-400">
          As três maiores ações do Ibovespa têm perfis completamente diferentes. Comparamos dividendos, P/L, histórico de 5 anos e riscos pra você descobrir qual combina com seu objetivo.
        </p>
        <p class="text-sm text-gray-500">Atualizado em {{ lastUpdatedText }} · Leitura de 9 minutos</p>
      </header>

      <section class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">Resumo rápido: cada uma para um perfil</h2>
        <ul class="list-disc space-y-1 pl-6 text-gray-300">
          <li><strong>PETR4:</strong> dividendos altíssimos (&gt;10% DY) mas risco político elevado. Pra quem prioriza renda no curto prazo e aceita volatilidade.</li>
          <li><strong>VALE3:</strong> ciclo de commodities. Paga bem quando minério está em alta, sofre com a China. Pra quem acompanha o cenário macro global.</li>
          <li><strong>ITUB4:</strong> previsibilidade + crescimento consistente. Menor DY (~6%) mas o mais estável dos três. Pra quem quer dormir tranquilo.</li>
        </ul>

        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">Comparação lado a lado</h2>
        <div class="not-prose overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead class="bg-white/10">
              <tr>
                <th class="border border-white/20 px-4 py-2 text-left">Indicador</th>
                <th class="border border-white/20 px-4 py-2 text-left">PETR4</th>
                <th class="border border-white/20 px-4 py-2 text-left">VALE3</th>
                <th class="border border-white/20 px-4 py-2 text-left">ITUB4</th>
              </tr>
            </thead>
            <tbody class="text-gray-300">
              <tr>
                <td class="border border-white/20 px-4 py-2 font-semibold">Setor</td>
                <td class="border border-white/20 px-4 py-2">Petróleo &amp; Gás</td>
                <td class="border border-white/20 px-4 py-2">Mineração</td>
                <td class="border border-white/20 px-4 py-2">Bancos</td>
              </tr>
              <tr class="bg-white/5">
                <td class="border border-white/20 px-4 py-2 font-semibold">Dividend Yield médio (5 anos)</td>
                <td class="border border-white/20 px-4 py-2" :style="{ color: brand.colors.primary }">11,8%</td>
                <td class="border border-white/20 px-4 py-2">8,3%</td>
                <td class="border border-white/20 px-4 py-2">5,9%</td>
              </tr>
              <tr>
                <td class="border border-white/20 px-4 py-2 font-semibold">P/L histórico</td>
                <td class="border border-white/20 px-4 py-2">4,2</td>
                <td class="border border-white/20 px-4 py-2">6,8</td>
                <td class="border border-white/20 px-4 py-2">8,5</td>
              </tr>
              <tr class="bg-white/5">
                <td class="border border-white/20 px-4 py-2 font-semibold">ROE</td>
                <td class="border border-white/20 px-4 py-2">22%</td>
                <td class="border border-white/20 px-4 py-2">28%</td>
                <td class="border border-white/20 px-4 py-2" :style="{ color: brand.colors.primary }">19% (recorrente)</td>
              </tr>
              <tr>
                <td class="border border-white/20 px-4 py-2 font-semibold">Volatilidade (anual)</td>
                <td class="border border-white/20 px-4 py-2">38%</td>
                <td class="border border-white/20 px-4 py-2">32%</td>
                <td class="border border-white/20 px-4 py-2" :style="{ color: brand.colors.primary }">22%</td>
              </tr>
              <tr class="bg-white/5">
                <td class="border border-white/20 px-4 py-2 font-semibold">Risco principal</td>
                <td class="border border-white/20 px-4 py-2">Intervenção política</td>
                <td class="border border-white/20 px-4 py-2">Preço do minério</td>
                <td class="border border-white/20 px-4 py-2">Inadimplência</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">PETR4 — a máquina de dividendos volátil</h2>
        <p class="leading-relaxed text-gray-300">
          A Petrobras paga os maiores dividendos da B3 quando o petróleo está acima de US$ 70. Em 2022 pagou mais de 30% de DY. Mas o preço da ação é refém da política: cada troca de presidente da estatal mexe com a cotação em 5-10% no mesmo dia.
        </p>
        <p class="leading-relaxed text-gray-300">
          <strong>Quando investir:</strong> se você aceita volatilidade alta e quer renda máxima no curto prazo. Evite comprar em anos eleitorais.
        </p>
        <p class="leading-relaxed text-gray-300">
          Veja a página completa com dados ao vivo: <NuxtLink to="/asset/petr4" class="underline" :style="{ color: brand.colors.primary }">PETR4 — análise completa</NuxtLink>.
        </p>

        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">VALE3 — a aposta na China</h2>
        <p class="leading-relaxed text-gray-300">
          A Vale é a segunda maior mineradora de minério de ferro do mundo. Seus resultados sobem e descem com a demanda chinesa por aço. Se você acredita em retomada da construção na China, VALE3 é o play direto. Se acredita em estagnação, é o curto direto.
        </p>
        <p class="leading-relaxed text-gray-300">
          <strong>Quando investir:</strong> quando o minério de ferro está abaixo de US$ 90/tonelada e há sinais de estímulo fiscal na China.
        </p>
        <p class="leading-relaxed text-gray-300">
          Veja: <NuxtLink to="/asset/vale3" class="underline" :style="{ color: brand.colors.primary }">VALE3 — análise completa</NuxtLink>.
        </p>

        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">ITUB4 — o clássico do buy-and-hold</h2>
        <p class="leading-relaxed text-gray-300">
          O Itaú é um dos bancos mais lucrativos do mundo em ROE. Dividendos menores que PETR4 mas mais previsíveis. Se você quer uma ação pra segurar 20 anos sem mexer, é a escolha óbvia entre os três.
        </p>
        <p class="leading-relaxed text-gray-300">
          <strong>Quando investir:</strong> sempre. Aporte mensal em ITUB4 historicamente bate renda fixa.
        </p>
        <p class="leading-relaxed text-gray-300">
          Veja: <NuxtLink to="/asset/itub4" class="underline" :style="{ color: brand.colors.primary }">ITUB4 — análise completa</NuxtLink>.
        </p>

        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">Qual teria rendido mais em 10 anos?</h2>
        <p class="leading-relaxed text-gray-300">
          Considerando preço + dividendos reinvestidos, de 2016 a 2026:
        </p>
        <ul class="list-disc space-y-1 pl-6 text-gray-300">
          <li><strong>PETR4:</strong> R$ 10.000 viraram ~R$ 38.400 (CAGR de 14,4%)</li>
          <li><strong>VALE3:</strong> R$ 10.000 viraram ~R$ 31.200 (CAGR de 12,1%)</li>
          <li><strong>ITUB4:</strong> R$ 10.000 viraram ~R$ 27.800 (CAGR de 10,8%)</li>
        </ul>
        <p class="leading-relaxed text-gray-300">
          <strong>Observação importante:</strong> PETR4 entregou mais em absoluto mas com drawdowns de até 50% no caminho. ITUB4 chegou em menos absoluto mas o maior drawdown foi de 25%. Se você tem baixa tolerância a perdas de curto prazo, ITUB4 é o único dos três que não vai te tirar o sono.
        </p>

        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">E se em vez de escolher uma, eu comprar as três?</h2>
        <p class="leading-relaxed text-gray-300">
          Diversificar entre setores (energia, commodities e bancos) reduz risco específico. Uma alocação 33/33/33 teria entregue ~12% a.a. nos últimos 10 anos com volatilidade de 24% — menor que qualquer das três individualmente.
        </p>
        <p class="leading-relaxed text-gray-300">
          Pra simular quanto isso rende no longo prazo, use nossa <NuxtLink to="/calculadora/juros-compostos" class="underline" :style="{ color: brand.colors.primary }">calculadora de juros compostos</NuxtLink>.
        </p>

        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">A resposta final</h2>
        <p class="leading-relaxed text-gray-300">
          Não existe "melhor ação" em abstrato — existe a melhor pra cada objetivo:
        </p>
        <ul class="list-disc space-y-1 pl-6 text-gray-300">
          <li>Quer <strong>renda máxima agora</strong>? PETR4.</li>
          <li>Quer apostar no <strong>ciclo global</strong>? VALE3.</li>
          <li>Quer <strong>comprar e esquecer</strong>? ITUB4.</li>
          <li>Não tem certeza? Pegue as três em pesos iguais.</li>
        </ul>
      </section>

      <div class="rounded-3xl border p-8 text-center" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
        <h2 class="mb-3 text-2xl md:text-3xl" :class="[brand.font.headingWeight]" :style="{ color: brand.colors.text }">
          Quer comparar outras ações?
        </h2>
        <p class="mx-auto mb-5 max-w-xl text-gray-400">
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
