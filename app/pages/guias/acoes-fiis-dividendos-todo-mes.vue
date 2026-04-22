<script setup lang="ts">
const brand = useBrand()

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const lastUpdatedISO = new Date('2026-04-20').toISOString()
const lastUpdatedText = '20 de abril de 2026'

usePageSeo({
  title: `15 Ações e FIIs que Pagam Dividendos Todo Mês | ${brand.name}`,
  description:
    'Lista curada de 15 ativos da B3 que pagam dividendos mensalmente: 10 FIIs de alta liquidez e 5 ações recorrentes. DY, ticker e calendário de pagamento.',
  path: '/guias/acoes-fiis-dividendos-todo-mes',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Guias', path: '/guias' },
    { name: 'Dividendos Todo Mês', path: '/guias/acoes-fiis-dividendos-todo-mes' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: '15 Ações e FIIs que Pagam Dividendos Todo Mês em 2026',
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

// Lista curada dos FIIs mais líquidos com histórico de pagamento mensal
const fiisMensal = [
  { ticker: 'MXRF11', nome: 'Maxi Renda', dy: '11,2%', tipo: 'Papel', segmento: 'Híbrido' },
  { ticker: 'HGLG11', nome: 'CSHG Logística', dy: '8,7%', tipo: 'Tijolo', segmento: 'Logística' },
  { ticker: 'KNRI11', nome: 'Kinea Renda Imobiliária', dy: '8,3%', tipo: 'Tijolo', segmento: 'Híbrido' },
  { ticker: 'HGRU11', nome: 'CSHG Renda Urbana', dy: '9,1%', tipo: 'Tijolo', segmento: 'Renda Urbana' },
  { ticker: 'IRDM11', nome: 'Iridium Recebíveis', dy: '12,4%', tipo: 'Papel', segmento: 'CRI' },
  { ticker: 'XPML11', nome: 'XP Malls', dy: '8,9%', tipo: 'Tijolo', segmento: 'Shoppings' },
  { ticker: 'HCTR11', nome: 'Hectare CE', dy: '13,8%', tipo: 'Papel', segmento: 'CRI' },
  { ticker: 'VISC11', nome: 'Vinci Shopping Centers', dy: '9,2%', tipo: 'Tijolo', segmento: 'Shoppings' },
  { ticker: 'BCFF11', nome: 'BTG Fundo de Fundos', dy: '10,1%', tipo: 'FoF', segmento: 'Fundo de Fundos' },
  { ticker: 'RECT11', nome: 'REC Recebíveis', dy: '12,8%', tipo: 'Papel', segmento: 'CRI' },
]

const acoesRecorrentes = [
  { ticker: 'TAEE11', nome: 'Taesa', dy: '10,8%', freq: 'Semestral (ex-juros mensal)', setor: 'Elétrica' },
  { ticker: 'BBSE3', nome: 'BB Seguridade', dy: '8,2%', freq: 'Semestral', setor: 'Seguros' },
  { ticker: 'ITSA4', nome: 'Itaúsa', dy: '7,1%', freq: 'Trimestral', setor: 'Holding (Itaú)' },
  { ticker: 'BBAS3', nome: 'Banco do Brasil', dy: '9,4%', freq: 'Trimestral', setor: 'Banco' },
  { ticker: 'VIVT3', nome: 'Vivo/Telefônica', dy: '8,0%', freq: 'Semestral', setor: 'Telecom' },
]
</script>

<template>
  <NuxtLayout name="static" title="Dividendos Todo Mês">
    <article class="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12 md:py-16">
      <nav class="flex items-center gap-2 text-sm text-gray-400">
        <NuxtLink to="/" class="hover:text-white">Início</NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="size-4" />
        <NuxtLink to="/guias" class="hover:text-white">Guias</NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="size-4" />
        <span class="text-white">Dividendos Mensais</span>
      </nav>

      <header class="flex flex-col gap-4">
        <h1 class="text-3xl md:text-5xl" :class="[brand.font.headingWeight]" :style="{ color: brand.colors.text }">
          15 Ações e FIIs que Pagam Dividendos Todo Mês em 2026
        </h1>
        <p class="text-lg text-gray-400">
          A fórmula preferida de quem vive de renda passiva: pingos mensais na conta sem precisar vender ativo. Selecionamos 10 FIIs e 5 ações com histórico consistente de pagamento.
        </p>
        <p class="text-sm text-gray-500">Atualizado em {{ lastUpdatedText }} · Leitura de 10 minutos</p>
      </header>

      <section class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">Por que buscar dividendos mensais?</h2>
        <p class="leading-relaxed text-gray-300">
          Do ponto de vista puramente financeiro, receber R$ 1.200 uma vez por ano ou R$ 100 por mês dá no mesmo — o retorno total é idêntico. Mas do ponto de vista comportamental e prático, a diferença é enorme:
        </p>
        <ul class="list-disc space-y-2 pl-6 text-gray-300">
          <li><strong>Orçamento previsível:</strong> você sabe quanto entra todo mês e planeja gastos recorrentes (aluguel, contas) em cima disso.</li>
          <li><strong>Efeito psicológico da consistência:</strong> ver o dinheiro cair toda vez reforça o hábito de investir e reduz a tentação de vender em queda.</li>
          <li><strong>Reinvestimento ágil:</strong> se você reinveste os dividendos, ter aportes mensais faz o DCA (Dollar Cost Averaging) natural.</li>
          <li><strong>Renda passiva para aposentadoria:</strong> na vida FIRE, bater as despesas mensais com dividendos mensais é o objetivo final.</li>
        </ul>

        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">10 FIIs que pagam dividendos todo mês</h2>
        <p class="leading-relaxed text-gray-300">
          FIIs (Fundos Imobiliários) são a forma mais direta de receber dividendos mensais no Brasil — por lei, eles distribuem no mínimo 95% do lucro caixa semestralmente, mas a maioria opta pela distribuição mensal.
        </p>
        <div class="not-prose overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead class="bg-white/10">
              <tr>
                <th class="border border-white/20 px-4 py-2 text-left">Ticker</th>
                <th class="border border-white/20 px-4 py-2 text-left">Nome</th>
                <th class="border border-white/20 px-4 py-2 text-left">Tipo</th>
                <th class="border border-white/20 px-4 py-2 text-left">Segmento</th>
                <th class="border border-white/20 px-4 py-2 text-left">DY médio</th>
              </tr>
            </thead>
            <tbody class="text-gray-300">
              <tr v-for="(f, i) in fiisMensal" :key="f.ticker" :class="i % 2 === 0 ? '' : 'bg-white/5'">
                <td class="border border-white/20 px-4 py-2 font-semibold">
                  <NuxtLink :to="`/asset/${f.ticker.toLowerCase()}`" class="underline" :style="{ color: brand.colors.primary }">
                    {{ f.ticker }}
                  </NuxtLink>
                </td>
                <td class="border border-white/20 px-4 py-2">{{ f.nome }}</td>
                <td class="border border-white/20 px-4 py-2">{{ f.tipo }}</td>
                <td class="border border-white/20 px-4 py-2">{{ f.segmento }}</td>
                <td class="border border-white/20 px-4 py-2" :style="{ color: brand.colors.primary }">{{ f.dy }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="leading-relaxed text-gray-300">
          <strong>Atenção:</strong> DYs muito altos (&gt;13%) em FIIs de papel frequentemente vêm de subordinações e CRIs com risco embutido. Sempre investigue o relatório gerencial antes de concentrar posição.
        </p>

        <h3 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Como montar uma carteira 100% de FIIs mensais</h3>
        <p class="leading-relaxed text-gray-300">
          Divisão sugerida para R$ 10.000:
        </p>
        <ul class="list-disc space-y-1 pl-6 text-gray-300">
          <li><strong>30% em FIIs de tijolo</strong> (HGLG11, KNRI11, HGRU11) — renda previsível e valorização do imóvel</li>
          <li><strong>30% em FIIs de papel</strong> (MXRF11, IRDM11) — maior DY, mais sensível à Selic</li>
          <li><strong>20% em FIIs de shoppings</strong> (XPML11, VISC11) — pra pegar retomada do consumo</li>
          <li><strong>20% em FoF</strong> (BCFF11) — diversificação automática</li>
        </ul>

        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">5 ações que pagam quase todo mês</h2>
        <p class="leading-relaxed text-gray-300">
          Ações não são obrigadas a pagar dividendos — e quase nenhuma paga mensalmente. Mas algumas têm histórico tão consistente de trimestres e Juros sobre Capital Próprio (JCP) alternados que o investidor acaba recebendo algo quase todo mês.
        </p>
        <div class="not-prose overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead class="bg-white/10">
              <tr>
                <th class="border border-white/20 px-4 py-2 text-left">Ticker</th>
                <th class="border border-white/20 px-4 py-2 text-left">Nome</th>
                <th class="border border-white/20 px-4 py-2 text-left">Setor</th>
                <th class="border border-white/20 px-4 py-2 text-left">Frequência</th>
                <th class="border border-white/20 px-4 py-2 text-left">DY</th>
              </tr>
            </thead>
            <tbody class="text-gray-300">
              <tr v-for="(a, i) in acoesRecorrentes" :key="a.ticker" :class="i % 2 === 0 ? '' : 'bg-white/5'">
                <td class="border border-white/20 px-4 py-2 font-semibold">
                  <NuxtLink :to="`/asset/${a.ticker.toLowerCase()}`" class="underline" :style="{ color: brand.colors.primary }">
                    {{ a.ticker }}
                  </NuxtLink>
                </td>
                <td class="border border-white/20 px-4 py-2">{{ a.nome }}</td>
                <td class="border border-white/20 px-4 py-2">{{ a.setor }}</td>
                <td class="border border-white/20 px-4 py-2">{{ a.freq }}</td>
                <td class="border border-white/20 px-4 py-2" :style="{ color: brand.colors.primary }">{{ a.dy }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">Quanto investir pra receber R$ 1.000/mês?</h2>
        <p class="leading-relaxed text-gray-300">
          Considerando um DY médio da carteira de <strong>10% ao ano</strong>, pra receber R$ 1.000/mês (R$ 12.000/ano) você precisa de um patrimônio de <strong>R$ 120.000</strong> investido em dividendos.
        </p>
        <ul class="list-disc space-y-1 pl-6 text-gray-300">
          <li><strong>R$ 100/mês</strong> de dividendos → R$ 12.000 investidos</li>
          <li><strong>R$ 500/mês</strong> → R$ 60.000 investidos</li>
          <li><strong>R$ 1.000/mês</strong> → R$ 120.000 investidos</li>
          <li><strong>R$ 5.000/mês</strong> → R$ 600.000 investidos</li>
          <li><strong>R$ 10.000/mês</strong> (viver de dividendos) → R$ 1,2 milhão</li>
        </ul>
        <p class="leading-relaxed text-gray-300">
          Use nossa <NuxtLink to="/calculadora/dividend-yield" class="underline" :style="{ color: brand.colors.primary }">calculadora de dividend yield</NuxtLink> pra ajustar com a DY da sua carteira real, ou a <NuxtLink to="/calculadora/juros-compostos" class="underline" :style="{ color: brand.colors.primary }">calculadora de juros compostos</NuxtLink> pra projetar em quanto tempo você chega lá com aportes mensais.
        </p>

        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">Perguntas frequentes</h2>
        <h3 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Os dividendos de FIIs são isentos de IR?</h3>
        <p class="leading-relaxed text-gray-300">
          Sim. Os rendimentos mensais distribuídos por FIIs são <strong>100% isentos de imposto de renda</strong> para pessoa física, desde que o FII tenha mais de 100 cotistas e o investidor não tenha mais de 10% do fundo. Já o ganho de capital na venda das cotas tem 20% de IR.
        </p>
        <h3 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Dividendos de ações também são isentos?</h3>
        <p class="leading-relaxed text-gray-300">
          Hoje sim — a CF/88 e a Lei 9.249/95 isentam dividendos de IR pra pessoa física. Mas há propostas de tributação no Congresso, vale acompanhar.
        </p>
        <h3 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Qual a diferença entre DY e MDI?</h3>
        <p class="leading-relaxed text-gray-300">
          <strong>DY (Dividend Yield)</strong> = dividendos pagos nos últimos 12 meses ÷ preço atual. <strong>MDI (Média Mensal de Dividendos)</strong> = valor médio pago por mês em R$. Pra FIIs mensais, MDI é o número mais útil pra planejar seu fluxo de renda.
        </p>

        <h2 class="text-2xl font-bold" :style="{ color: brand.colors.text }">Calendário de dividendos em tempo real</h2>
        <p class="leading-relaxed text-gray-300">
          Quer saber exatamente quando cada ativo paga? Nosso <NuxtLink to="/dividendos/calendario" class="underline" :style="{ color: brand.colors.primary }">calendário de dividendos</NuxtLink> mostra data-com, data-ex e data de pagamento de cada ação e FII da B3.
        </p>
      </section>

      <div class="rounded-3xl border p-8 text-center" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
        <h2 class="mb-3 text-2xl md:text-3xl" :class="[brand.font.headingWeight]" :style="{ color: brand.colors.text }">
          Pronto pra montar sua carteira de dividendos?
        </h2>
        <p class="mx-auto mb-5 max-w-xl text-gray-400">
          Explore todos os FIIs e ações pagadoras da B3 com DY atualizado em tempo real, filtros por segmento e histórico de 5 anos.
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <UButton to="/fiis" size="lg" color="primary">Explorar FIIs</UButton>
          <UButton to="/ranking/maiores-dividend-yield" size="lg" variant="outline" color="neutral">Top DY</UButton>
        </div>
      </div>
    </article>
  </NuxtLayout>
</template>
