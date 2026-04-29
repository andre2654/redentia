<script setup lang="ts">
const brand = useBrand()

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const lastUpdatedISO = new Date('2026-04-20').toISOString()
const lastUpdatedText = '20 de abril de 2026'

usePageSeo({
  title: `Quantos Anos Faltam Pra Você Se Aposentar? FIRE Brasil | ${brand.name}`,
  description:
    'Movimento FIRE no Brasil: quanto acumular, regra dos 4%, Lean/Coast/Barista/Fat FIRE e como calcular a idade da sua independência financeira em minutos.',
  path: '/guias/fire-independencia-financeira-calculadora',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Guias', path: '/guias' },
    { name: 'FIRE no Brasil', path: '/guias/fire-independencia-financeira-calculadora' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Quantos Anos Faltam Pra Você Se Aposentar? Guia FIRE Brasil 2026',
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
  <NuxtLayout name="static" title="FIRE Brasil">
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
          Quantos Anos Faltam Pra Você Se Aposentar?
        </h1>
        <p class="text-lg">
          O movimento FIRE (Financial Independence, Retire Early) diz que dá pra largar o trabalho décadas antes dos 65. A matemática é simples, a disciplina não. Vamos aos números.
        </p>
        <p class="text-sm" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 60%, transparent)' }">Atualizado em {{ lastUpdatedText }} · Leitura de 11 minutos</p>
      </header>

      <section class="flex flex-col gap-8">
        <h2>A fórmula que mudou tudo: regra dos 4%</h2>
        <p>
          Em 1994, o estudo Trinity analisou 70 anos da bolsa americana e chegou à conclusão: se você acumular <strong>25× seus gastos anuais</strong>, pode sacar 4% ao ano dessa carteira pro resto da vida sem esgotá-la, mesmo ajustando por inflação.
        </p>
        <p>
          Em números:
        </p>
        <ul>
          <li>Gasta R$ 3.000/mês → precisa de <strong>R$ 900.000</strong> (3k × 12 × 25)</li>
          <li>Gasta R$ 5.000/mês → precisa de <strong>R$ 1,5 milhão</strong></li>
          <li>Gasta R$ 10.000/mês → precisa de <strong>R$ 3 milhões</strong></li>
          <li>Gasta R$ 20.000/mês → precisa de <strong>R$ 6 milhões</strong></li>
        </ul>
        <p>
          <strong>Importante pro Brasil:</strong> a regra original considera renda variável + renda fixa em mercados desenvolvidos. No Brasil, com DY médio de 8-10% em ações/FIIs, a "regra dos 4%" pode ser mais folgada, alguns usam 5% por aqui. Mas começar com 4% é o conservador seguro.
        </p>

        <h2>Os 4 estágios do FIRE</h2>
        <h3>1. Lean FIRE, austero</h3>
        <p>
          Você acumula o necessário pra cobrir gastos mínimos (R$ 3-4k/mês no Brasil). Alvo: R$ 900k a R$ 1,2 milhão. Vida simples, possivelmente fora de capitais, moradia própria quitada.
        </p>
        <h3>2. Coast FIRE, em trajetória</h3>
        <p>
          Você já tem o suficiente guardado em investimentos pra, <strong>sem novos aportes</strong>, chegar ao FIRE "normal" até os 65. Ainda trabalha, mas pode relaxar a pressão de poupar.
        </p>
        <p>
          <strong>Exemplo:</strong> aos 35, se você tem R$ 400k investidos a 10% a.a., em 30 anos (sem novos aportes) isso vira R$ 7 milhões nos 65. Se seus gastos na aposentadoria forem R$ 20k/mês, você já está em Coast FIRE.
        </p>
        <h3>3. Barista FIRE, meio termo</h3>
        <p>
          Você acumulou o suficiente pra cobrir boa parte dos gastos, mas trabalha part-time ou em algo que ama pra fechar a conta. Ideal pra quem não quer parar de trabalhar por completo, mas rejeita o grind corporativo.
        </p>
        <h3>4. Fat FIRE, abundante</h3>
        <p>
          Viver com o mesmo padrão de hoje (ou melhor). Se você gasta R$ 15k/mês, precisa de R$ 4,5 milhões. É o estágio mais distante, mas também o que não exige você mudar de vida.
        </p>

        <h2>Quanto tempo pra chegar lá?</h2>
        <p>
          A resposta mais poderosa do FIRE está em <strong>uma única tabela</strong>: quanto tempo leva pra ficar independente em função da sua <strong>taxa de poupança</strong> (quanto % da renda você investe).
        </p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Taxa de poupança</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Anos até FIRE</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">10%</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">51 anos</td></tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">20%</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">37 anos</td></tr>
              <tr><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">30%</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">28 anos</td></tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">40%</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">22 anos</td></tr>
              <tr><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', color: brand.colors.primary }">50%</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', color: brand.colors.primary }">17 anos</td></tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">60%</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">13 anos</td></tr>
              <tr><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">70%</td><td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">9 anos</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Cálculo assume retorno real (pós-inflação) de 5% a.a. e saque de 4% na aposentadoria. Quanto mais agressivos os aportes, menor é o tempo, mas o ganho <strong>marginal</strong> decai: ir de 40% pra 50% economiza 5 anos; ir de 60% pra 70% economiza 4 anos.
        </p>

        <h2>FIRE funciona no Brasil?</h2>
        <p>
          Sim, com adaptações. Pontos importantes:
        </p>
        <ul>
          <li><strong>Taxa livre de risco alta:</strong> CDI de 10-13% no Brasil facilita muito vs os 4-5% americanos. Nossa versão do FIRE é mais rápida.</li>
          <li><strong>Inflação maior:</strong> use sempre retornos <strong>reais</strong> (descontada a inflação). Tesouro IPCA+ entrega ~6% real, que já é FIRE-friendly.</li>
          <li><strong>Dividendos isentos:</strong> enquanto for mantida a isenção atual, carteira de dividendos é ainda mais eficiente pra FIRE que a americana.</li>
          <li><strong>Custo de vida regional:</strong> R$ 3.500/mês dá conforto em cidade média do interior, não em São Paulo capital. Geoarbitragem (morar fora do centrão) acelera muito.</li>
        </ul>

        <h2>Um exemplo concreto: família R$ 12k/mês</h2>
        <p>
          Casal que ganha R$ 12k/mês líquidos, gasta R$ 7k, investe R$ 5k (taxa de poupança de ~42%).
        </p>
        <ul>
          <li><strong>Meta FIRE:</strong> R$ 7.000 × 12 × 25 = R$ 2,1 milhões</li>
          <li><strong>Aporte mensal:</strong> R$ 5.000</li>
          <li><strong>Retorno real:</strong> 5% a.a.</li>
          <li><strong>Tempo até a meta:</strong> ~20 anos</li>
          <li><strong>Se aumentarem aporte pra R$ 7k:</strong> 16 anos</li>
          <li><strong>Se reduzirem gastos pra R$ 5k:</strong> 17 anos</li>
        </ul>
        <p>
          <strong>Insight:</strong> reduzir gastos é mais poderoso que aumentar aporte, porque ataca os dois lados da equação (mais aporte + menos necessidade).
        </p>

        <h2>Calcule sua idade de independência financeira</h2>
        <p>
          Nossa <NuxtLink to="/calculadora/aposentadoria">calculadora de aposentadoria</NuxtLink> aplica a regra dos 4% e te mostra:
        </p>
        <ul>
          <li>Quanto você precisa acumular</li>
          <li>Quantos anos faltam com o aporte atual</li>
          <li>Cenários se você aumentar o aporte ou reduzir gastos</li>
          <li>Gráfico mês a mês da evolução do patrimônio</li>
        </ul>

        <h2>Os 3 erros fatais do FIRE</h2>
        <h3>1. Esquecer a saúde mental da jornada</h3>
        <p>
          Viver 20 anos com 40% da renda investida sem ajuste é insustentável. FIRE funciona melhor com metas intermediárias (Coast em 10 anos, Barista em 15, Fat em 25). Comemore cada estágio.
        </p>
        <h3>2. Não diversificar internacionalmente</h3>
        <p>
          Brasil é 3% do PIB global. Se tudo dá errado aqui (como aconteceu em 2002, 2015), sua independência financeira derrete. Ter 20-30% em ações internacionais (via BDR, IVVB11, ETFs) reduz drasticamente esse risco.
        </p>
        <h3>3. Subestimar despesas na "aposentadoria"</h3>
        <p>
          Plano de saúde privado custa R$ 1.500-3.000/mês por pessoa aos 60+. Dentista, remédios e cuidadores pesam no fim. Sempre deixe 20% de margem além dos gastos atuais na projeção FIRE.
        </p>
      </section>

      <div class="rounded-3xl border p-8 text-center" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
        <h2 class="mb-3" :style="{ color: brand.colors.text }">
          Em quantos anos VOCÊ se aposenta?
        </h2>
        <p class="mx-auto mb-5 max-w-xl" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 60%, transparent)' }">
          Use a calculadora de aposentadoria da Redentia pra descobrir em minutos quanto você precisa acumular e quando chega a independência.
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <UButton to="/calculadora/aposentadoria" size="lg" color="primary">Calcular minha idade FIRE</UButton>
          <UButton to="/calculadora/juros-compostos" size="lg" variant="outline" color="neutral">Calculadora juros compostos</UButton>
        </div>
      </div>
    </article>
  </NuxtLayout>
</template>
