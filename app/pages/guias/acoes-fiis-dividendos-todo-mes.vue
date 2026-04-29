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
          15 Ações e FIIs que Pagam Dividendos Todo Mês em 2026
        </h1>
        <p class="text-lg">
          A fórmula preferida de quem vive de renda passiva: pingos mensais na conta sem precisar vender ativo. Selecionamos 10 FIIs e 5 ações com histórico consistente de pagamento.
        </p>
        <p class="text-sm" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 60%, transparent)' }">Atualizado em {{ lastUpdatedText }} · Leitura de 10 minutos</p>
      </header>

      <section class="flex flex-col gap-8">
        <h2>Por que buscar dividendos mensais?</h2>
        <p>
          Do ponto de vista puramente financeiro, receber R$ 1.200 uma vez por ano ou R$ 100 por mês dá no mesmo, o retorno total é idêntico. Mas do ponto de vista comportamental e prático, a diferença é enorme:
        </p>
        <ul>
          <li><strong>Orçamento previsível:</strong> você sabe quanto entra todo mês e planeja gastos recorrentes (aluguel, contas) em cima disso.</li>
          <li><strong>Efeito psicológico da consistência:</strong> ver o dinheiro cair toda vez reforça o hábito de investir e reduz a tentação de vender em queda.</li>
          <li><strong>Reinvestimento ágil:</strong> se você reinveste os dividendos, ter aportes mensais faz o DCA (Dollar Cost Averaging) natural.</li>
          <li><strong>Renda passiva para aposentadoria:</strong> na vida FIRE, bater as despesas mensais com dividendos mensais é o objetivo final.</li>
        </ul>

        <h2>10 FIIs que pagam dividendos todo mês</h2>
        <p>
          FIIs (Fundos Imobiliários) são a forma mais direta de receber dividendos mensais no Brasil, por lei, eles distribuem no mínimo 95% do lucro caixa semestralmente, mas a maioria opta pela distribuição mensal.
        </p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Ticker</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Nome</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Tipo</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Segmento</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">DY médio</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(f, i) in fiisMensal" :key="f.ticker" :style="i % 2 === 0 ? {} : { backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">
                  <NuxtLink :to="`/asset/${f.ticker.toLowerCase()}`">
                    <strong>{{ f.ticker }}</strong>
                  </NuxtLink>
                </td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">{{ f.nome }}</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">{{ f.tipo }}</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">{{ f.segmento }}</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', color: brand.colors.primary }">{{ f.dy }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>Atenção:</strong> DYs muito altos (&gt;13%) em FIIs de papel frequentemente vêm de subordinações e CRIs com risco embutido. Sempre investigue o relatório gerencial antes de concentrar posição.
        </p>

        <h3>Como montar uma carteira 100% de FIIs mensais</h3>
        <p>
          Divisão sugerida para R$ 10.000:
        </p>
        <ul>
          <li><strong>30% em FIIs de tijolo</strong> (HGLG11, KNRI11, HGRU11), renda previsível e valorização do imóvel</li>
          <li><strong>30% em FIIs de papel</strong> (MXRF11, IRDM11), maior DY, mais sensível à Selic</li>
          <li><strong>20% em FIIs de shoppings</strong> (XPML11, VISC11), pra pegar retomada do consumo</li>
          <li><strong>20% em FoF</strong> (BCFF11), diversificação automática</li>
        </ul>

        <h2>5 ações que pagam quase todo mês</h2>
        <p>
          Ações não são obrigadas a pagar dividendos, e quase nenhuma paga mensalmente. Mas algumas têm histórico tão consistente de trimestres e Juros sobre Capital Próprio (JCP) alternados que o investidor acaba recebendo algo quase todo mês.
        </p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Ticker</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Nome</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Setor</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Frequência</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">DY</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(a, i) in acoesRecorrentes" :key="a.ticker" :style="i % 2 === 0 ? {} : { backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">
                  <NuxtLink :to="`/asset/${a.ticker.toLowerCase()}`">
                    <strong>{{ a.ticker }}</strong>
                  </NuxtLink>
                </td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">{{ a.nome }}</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">{{ a.setor }}</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">{{ a.freq }}</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', color: brand.colors.primary }">{{ a.dy }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Quanto investir pra receber R$ 1.000/mês?</h2>
        <p>
          Considerando um DY médio da carteira de <strong>10% ao ano</strong>, pra receber R$ 1.000/mês (R$ 12.000/ano) você precisa de um patrimônio de <strong>R$ 120.000</strong> investido em dividendos.
        </p>
        <ul>
          <li><strong>R$ 100/mês</strong> de dividendos → R$ 12.000 investidos</li>
          <li><strong>R$ 500/mês</strong> → R$ 60.000 investidos</li>
          <li><strong>R$ 1.000/mês</strong> → R$ 120.000 investidos</li>
          <li><strong>R$ 5.000/mês</strong> → R$ 600.000 investidos</li>
          <li><strong>R$ 10.000/mês</strong> (viver de dividendos) → R$ 1,2 milhão</li>
        </ul>
        <p>
          Use nossa <NuxtLink to="/calculadora/dividend-yield">calculadora de dividend yield</NuxtLink> pra ajustar com a DY da sua carteira real, ou a <NuxtLink to="/calculadora/juros-compostos">calculadora de juros compostos</NuxtLink> pra projetar em quanto tempo você chega lá com aportes mensais.
        </p>

        <h2>Perguntas frequentes</h2>
        <h3>Os dividendos de FIIs são isentos de IR?</h3>
        <p>
          Sim. Os rendimentos mensais distribuídos por FIIs são <strong>100% isentos de imposto de renda</strong> para pessoa física, desde que o FII tenha mais de 100 cotistas e o investidor não tenha mais de 10% do fundo. Já o ganho de capital na venda das cotas tem 20% de IR.
        </p>
        <h3>Dividendos de ações também são isentos?</h3>
        <p>
          Hoje sim, a CF/88 e a Lei 9.249/95 isentam dividendos de IR pra pessoa física. Mas há propostas de tributação no Congresso, vale acompanhar.
        </p>
        <h3>Qual a diferença entre DY e MDI?</h3>
        <p>
          <strong>DY (Dividend Yield)</strong> = dividendos pagos nos últimos 12 meses ÷ preço atual. <strong>MDI (Média Mensal de Dividendos)</strong> = valor médio pago por mês em R$. Pra FIIs mensais, MDI é o número mais útil pra planejar seu fluxo de renda.
        </p>

        <h2>Calendário de dividendos em tempo real</h2>
        <p>
          Quer saber exatamente quando cada ativo paga? Nosso <NuxtLink to="/dividendos/calendario">calendário de dividendos</NuxtLink> mostra data-com, data-ex e data de pagamento de cada ação e FII da B3.
        </p>
      </section>

      <div class="rounded-3xl border p-8 text-center" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
        <h2 class="mb-3" :style="{ color: brand.colors.text }">
          Pronto pra montar sua carteira de dividendos?
        </h2>
        <p class="mx-auto mb-5 max-w-xl" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 60%, transparent)' }">
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
