<template>
  <NuxtLayout name="default" title="Como Ganhar 40-60% em Renda Fixa nos Próximos 24 Meses">
    <section class="flex flex-col gap-8 px-6 py-8">
      <MoleculesPageHeader
        icon="i-lucide-trending-up"
        icon-color="secondary"
        title="Como Ganhar 40-60% em Renda Fixa nos Próximos 24 Meses"
        description="Aconteceu 4 vezes em 25 anos. A mesma janela abriu hoje. Com Selic em 14,5% e Tesouro IPCA+ 2050 pagando 6,95% real, três pilares (ciclo, mecânica, execução) montam a tese de marcação a mercado que pode entregar 40 a 60% de ganho em 24 meses."
      />

      <div class="flex flex-col gap-6">
        <p class="text-lg">
          Tesouro IPCA+ 2050 hoje paga 7% real ao ano. Em 12 meses, o papel já valorizou 28,24% via marcação a mercado. Não é especulação. É matemática de duration aplicada ao ciclo de juros brasileiro.
        </p>

        <p>
          Em outros 4 momentos da história brasileira, o Tesouro IPCA+ longo abriu acima de 7% real: 2002 (eleição Lula 1), 2015 (perda do grau de investimento), 2016 (impeachment) e novembro de 2024. Em todas, quem comprou e segurou por 24-36 meses saiu com retorno entre 30% e 80% via marcação a mercado. Cinco em cinco vezes.
        </p>

        <!-- Tabela histórica -->
        <div class="rounded-xl border overflow-hidden" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">
          <table class="w-full">
            <thead :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 12%, var(--brand-background))' }">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-bold text-secondary">Janela</th>
                <th class="px-4 py-3 text-left text-sm font-bold text-secondary">Gatilho</th>
                <th class="px-4 py-3 text-left text-sm font-bold text-secondary">Ganho Real</th>
              </tr>
            </thead>
            <tbody>
              <tr :style="{ borderTop: '1px solid color-mix(in srgb, var(--brand-border) 50%, transparent)' }">
                <td class="px-4 py-3 font-medium">2002</td>
                <td class="px-4 py-3">Eleição Lula 1</td>
                <td class="px-4 py-3">+400% em 15 anos</td>
              </tr>
              <tr :style="{ borderTop: '1px solid color-mix(in srgb, var(--brand-border) 50%, transparent)' }">
                <td class="px-4 py-3 font-medium">2015</td>
                <td class="px-4 py-3">Perda do grau de investimento</td>
                <td class="px-4 py-3">+50% em 24 meses</td>
              </tr>
              <tr :style="{ borderTop: '1px solid color-mix(in srgb, var(--brand-border) 50%, transparent)' }">
                <td class="px-4 py-3 font-medium">2016</td>
                <td class="px-4 py-3">Impeachment</td>
                <td class="px-4 py-3">+80% em 24 meses</td>
              </tr>
              <tr :style="{ borderTop: '1px solid color-mix(in srgb, var(--brand-border) 50%, transparent)' }">
                <td class="px-4 py-3 font-medium">2024</td>
                <td class="px-4 py-3">Novembro</td>
                <td class="px-4 py-3">+28% em 12 meses (em curso)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          Cada janela rendeu em média 40-60% em 24 meses. Cinco em cinco vezes.
        </blockquote>

        <h2>Capítulo 01: Ciclo — A Trajetória Já Está na Curva</h2>

        <p>
          A Selic está no pico, e o mercado já apostou na queda. Quem entende a curva de juros sabe que o gatilho do ganho está pronto. Quem ignora, perde a viagem.
        </p>

        <h3>O que o relatório Focus projeta</h3>

        <p>
          Em maio de 2026, o relatório Focus do Banco Central aponta trajetória de queda da Selic de 14,5% para aproximadamente 10% até 2029. Esse caminho está precificado na curva de juros futuros (DI) negociada na B3. O mercado opera diariamente em cima dessa projeção. Quem compra IPCA+ longo hoje compra exatamente a expectativa de que esse caminho se materialize.
        </p>

        <h3>O cálculo simples da marcação</h3>

        <p>
          Cada ponto percentual que a Selic cai movimenta o preço do Tesouro IPCA+ longo em aproximadamente 13% no preço. Se a curva projeta queda de 14,5% para 10%, isso são 4,5 pontos de corte. 4,5 vezes 13% dá aproximadamente 58,5% de ganho potencial via marcação a mercado, sem contar o juro real corrente de 6,95% que é capitalizado durante o caminho.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          A queda já está precificada na curva. Mas o ganho ainda não foi tirado da mesa.
        </blockquote>

        <h2>Capítulo 02: Mecânica — Duration É Alavanca</h2>

        <p>
          Duration e convexidade são os dois conceitos que separam quem ganha 60% do que carrega CDB no banco. Sem entender essa engenharia, a tese é apenas adivinhação.
        </p>

        <h3>O que é duration</h3>

        <p>
          Duration é a sensibilidade do preço do título à variação da taxa de juros. Quanto mais longo o vencimento, maior a duration, maior a alavanca. Um título com duration de 4 anos varia 4% no preço para cada 1pp de variação na taxa. Um título com duration de 13 anos (caso do IPCA+ 2050) varia 13% no preço para cada 1pp de variação.
        </p>

        <h3>Comparativo prático</h3>

        <ul>
          <li><strong>IPCA+ 2030 (duration ~4 anos):</strong> Para cada 1pp de queda na Selic, ganho aproximado de 4% via marcação.</li>
          <li><strong>IPCA+ 2040 (duration ~10 anos):</strong> Para cada 1pp de queda na Selic, ganho aproximado de 10% via marcação.</li>
          <li><strong>IPCA+ 2050 (duration ~13 anos):</strong> Para cada 1pp de queda na Selic, ganho aproximado de 13% via marcação.</li>
        </ul>

        <p>
          Quanto mais longo o título, maior a alavanca a favor. Maior também o risco no caminho contrário, se a Selic subir em vez de cair.
        </p>

        <h3>O que é convexidade</h3>

        <p>
          Convexidade é a curvatura da relação preço-taxa. Em prática, significa que o ganho ao corte de juros é ligeiramente maior do que a perda ao aumento equivalente. Em ciclos de queda esperada, a convexidade trabalha a favor do investidor de IPCA+ longo. É uma assimetria positiva.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          Quanto mais longo, maior a alavanca. E maior a assimetria a favor.
        </blockquote>

        <h2>Capítulo 03: Execução — Carry ou Trade</h2>

        <p>
          Duas estratégias são possíveis na janela atual. Cada uma serve um perfil diferente, e ambas aproveitam o mesmo ciclo.
        </p>

        <h3>Estratégia A: Carry to maturity</h3>

        <p>
          Compra IPCA+ 2050 a IPCA + 6,95% e carrega até o vencimento, 25 anos. Garante o ganho real composto. Vira aposentadoria indexada à inflação. Imposto de renda de 17,5% incide só sobre o ganho real composto no resgate final. Para quem quer dormir e esquecer, é a estratégia ideal.
        </p>

        <p>
          Em 25 anos, R$ 100 mil aplicados em IPCA+ 6,95% real se transformam em R$ 540 mil em poder de compra. Isso é IPCA mais 540% de ganho real, capitalizado pelos juros compostos.
        </p>

        <h3>Estratégia B: Trade de marcação a mercado</h3>

        <p>
          Compra agora, espera Selic cair para 9-10%, vende em 24-36 meses. Target: 40-60% de ganho via marcação. IR cai para 15% após 720 dias se você comprou antes de 1º de janeiro de 2026 (regra antiga). Para títulos comprados em 2026, IR é 17,5% fixo.
        </p>

        <p>
          Vantagem: ciclo de retorno curto. Risco: se a Selic não cair como esperado, o ganho pode demorar mais ou ser menor. É preciso estar disposto a esperar até 36 meses, ou em cenário pior, segurar até vencimento.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          Carry rende composto. Trade rende rápido. Os dois aproveitam o mesmo ciclo.
        </blockquote>

        <h2>Como Comprar Tesouro IPCA+ Passo a Passo</h2>

        <ol>
          <li><strong>Abra conta em uma corretora:</strong> XP, Rico, Inter, Nubank Invest, BTG, Clear, todas atendem ao Tesouro Direto sem custódia.</li>
          <li><strong>Transfira via PIX:</strong> Disponível em D+0 na corretora.</li>
          <li><strong>Acesse o Tesouro Direto pela corretora:</strong> Procure por "Tesouro IPCA+ 2050" ou similar. Confira a taxa atual (deve estar próxima a IPCA + 6,95% em maio/2026).</li>
          <li><strong>Defina o valor:</strong> Pode comprar fração do título, a partir de R$ 30. Para ter alavanca relevante, valores acima de R$ 5.000 fazem mais sentido.</li>
          <li><strong>Confirme a compra:</strong> O título entra na sua custódia D+1. Marcação a mercado começa imediatamente.</li>
          <li><strong>Monitore mensalmente:</strong> Acompanhe a evolução da curva de juros e do preço do seu papel. Quando o ganho atingir 40-50%, considere vender (estratégia trade) ou manter para o carry.</li>
        </ol>

        <h2>Perguntas Frequentes</h2>

        <h3>Tesouro IPCA+ é seguro?</h3>

        <p>
          É o investimento mais seguro disponível no Brasil. Garantia soberana do Tesouro Nacional. Se o governo brasileiro entrar em default, o sistema financeiro inteiro já terá quebrado antes.
        </p>

        <h3>O risco de marcação a mercado é grande?</h3>

        <p>
          A volatilidade no caminho existe. Em janelas de estresse, o IPCA+ longo pode cair 10-15% temporariamente. Mas o ganho médio historicamente, em 4 janelas similares à atual, foi 40-60% em 24 meses. Quem aguenta a volatilidade no caminho captura o ganho final.
        </p>

        <h3>Vale mais a pena IPCA+ ou pré-fixado em 2026?</h3>

        <p>
          IPCA+ tem proteção contra inflação imprevista, pré-fixado não tem. Para horizontes longos, IPCA+ é a escolha mais robusta. Pré-fixado faz sentido apenas se você acredita que a inflação real será menor que a projetada pela curva, o que historicamente é um trade perdedor no Brasil.
        </p>

        <h3>E se a Selic não cair como esperado?</h3>

        <p>
          Esse é o risco principal. Se o cenário fiscal piorar, ou se inflação reacelerar, a Selic pode demorar mais para cair, ou subir antes de cair. Nesse caso, a marcação fica neutra ou negativa por um tempo, e a recompensa vem mais tarde. Por isso a estratégia carry é mais robusta que trade: garante o ganho real corrente até o vencimento, independente do que aconteça no meio.
        </p>

        <h3>Posso comprar IPCA+ 2050 e vender em 12 meses?</h3>

        <p>
          Sim, sem multa. O Tesouro Direto tem recompra diária. Imposto de renda é 17,5% sobre o ganho. IOF zera após 30 dias. A liquidez é alta para títulos do Tesouro.
        </p>

        <h2>Conclusão: A Janela Está Aberta</h2>

        <p>
          Em 25 anos de histórico brasileiro, o Tesouro IPCA+ longo abriu acima de 7% real em 4 momentos. Em todos, quem comprou e segurou 24-36 meses ganhou entre 30% e 80% via marcação. Em 2024 começou a 5ª janela. Em maio de 2026, ela ainda está aberta, com IPCA+ 2050 a 6,95% real.
        </p>

        <p>
          Não é especulação. É a coincidência de Selic no pico, expectativa de queda já precificada, duration longa entregando alavanca, e convexidade trabalhando a favor. Quem entende o mecanismo entra. Quem não entende, perde a viagem. Daqui a 24 meses, se a curva se confirmar, a janela terá fechado.
        </p>
      </div>

      <!-- CTA Redentia -->
      <div class="rounded-2xl border p-6 md:p-8" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
        <h3 class="mb-3">Simule o ganho potencial em IPCA+ longo</h3>
        <p class="mb-5" :style="{ color: 'var(--brand-text-muted)' }">
          A {{ brand.name }} calcula o ganho potencial em diferentes cenários de queda da Selic, com base na curva atual e no seu horizonte. Score 0-100 da carteira e plano de migração personalizado.
        </p>
        <div class="flex flex-wrap gap-3">
          <NuxtLink to="/raio-x" class="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 font-medium text-background hover:opacity-90 transition-opacity">
            <UIcon name="i-lucide-radar" class="size-5" /> Fazer Raio X
          </NuxtLink>
          <NuxtLink to="/asset/IMA-B" class="inline-flex items-center gap-2 rounded-xl border border-secondary px-5 py-2.5 font-medium text-secondary hover:bg-secondary/10 transition-colors">
            <UIcon name="i-lucide-line-chart" class="size-5" /> Ver IMA-B
          </NuxtLink>
        </div>
      </div>

      <!-- Navegação -->
      <div class="border-t pt-8" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">
        <h3>Continue lendo</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink to="/guias/poupanca-vs-tesouro-ipca-mais-2026" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-piggy-bank" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Poupança vs Tesouro IPCA+ 2026</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">Por que o PF deixa metade na mesa</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>
          <NuxtLink to="/guias/hora-certa-de-vender-acoes" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-trending-down" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">A Hora Certa de Vender Ações</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">Buffett, mercado e psicologia</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
const brand = useBrand()

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: `Como Ganhar 40-60% em Renda Fixa nos Próximos 24 Meses | ${brand.name}`,
  description:
    'Aconteceu 4 vezes em 25 anos. A janela abriu hoje. Com Selic em 14,5% e IPCA+ 2050 pagando 6,95% real, a tese de marcação a mercado pode entregar 40-60% em 24 meses. Os 3 pilares: ciclo, mecânica, execução.',
  path: '/guias/como-ganhar-40-60-renda-fixa-2026',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Como Ganhar 40-60% em Renda Fixa nos Próximos 24 Meses',
      description:
        'Análise editorial sobre a janela de marcação a mercado em Tesouro IPCA+ longo em 2026, com base nas 4 janelas históricas similares.',
      author: { '@type': 'Organization', name: brand.name },
      publisher: {
        '@type': 'Organization',
        name: brand.name,
        logo: { '@type': 'ImageObject', url: `${brand.url}/512x512.png` },
      },
      datePublished: '2026-05-21',
      dateModified: '2026-05-24',
      articleSection: 'Premium Memo',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Tesouro IPCA+ é seguro?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'É o investimento mais seguro disponível no Brasil. Garantia soberana do Tesouro Nacional. Se o governo brasileiro entrar em default, o sistema financeiro inteiro já terá quebrado antes.',
          },
        },
        {
          '@type': 'Question',
          name: 'O risco de marcação a mercado é grande?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A volatilidade no caminho existe. Em janelas de estresse, o IPCA+ longo pode cair 10-15% temporariamente. Mas o ganho médio em 4 janelas similares à atual foi 40-60% em 24 meses.',
          },
        },
        {
          '@type': 'Question',
          name: 'E se a Selic não cair como esperado?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Esse é o risco principal. Se cenário fiscal piorar, marcação fica neutra ou negativa por um tempo. Por isso a estratégia carry (segurar até vencimento) é mais robusta que trade: garante o ganho real corrente independente do meio do caminho.',
          },
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: brand.url },
        { '@type': 'ListItem', position: 2, name: 'Guias', item: `${brand.url}/guias` },
        { '@type': 'ListItem', position: 3, name: 'Como Ganhar 40-60% em Renda Fixa', item: `${brand.url}/guias/como-ganhar-40-60-renda-fixa-2026` },
      ],
    },
  ],
})
</script>
