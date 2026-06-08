<template>
  <NuxtLayout name="default" title="Raio-X da Carteira: Descubra os Riscos Escondidos em 2 Minutos">
    <section class="flex flex-col gap-8 px-6 py-8">
      <MoleculesPageHeader
        icon="i-lucide-radar"
        icon-color="secondary"
        title="Raio-X da Carteira: Descubra os Riscos Escondidos em 2 Minutos"
        description="O risco de uma carteira não está no extrato, está na estrutura. Concentração demais num ativo, ações que caem na mesma hora, patrimônio inteiro no Brasil e taxa que corrói o retorno no silêncio. O Raio-X da Redentia conecta sua carteira via Open Finance, lê cada ativo real e mede as 4 frentes de risco. No fim, um Redent Score de 0 a 100. É um diagnóstico de risco, não uma promessa de retorno."
      />

      <div class="flex flex-col gap-6">
        <p class="text-lg">
          A maioria dos investidores brasileiros sabe quanto tem aplicado. Quase ninguém sabe como esse dinheiro está estruturado. Os investimentos das pessoas físicas no Brasil chegaram a R$ 8,5 trilhões em 2025, alta de 15,5% sobre o ano anterior, segundo a ANBIMA. Mas volume não é o mesmo que estrutura. Você pode ter muito dinheiro alocado de um jeito frágil e nem perceber.
        </p>

        <p>
          O problema é que os riscos mais relevantes de uma carteira não aparecem em nenhum extrato. O extrato mostra saldo, mostra rentabilidade, mostra quanto cada posição vale hoje. Não mostra que três das suas ações sobem e descem juntas porque são do mesmo setor. Não mostra que 90% do seu patrimônio está exposto a um único país. Não mostra quanto a taxa de um fundo está comendo do seu retorno ao longo dos anos. Esses são os riscos escondidos, e o Raio-X existe pra trazê-los à superfície.
        </p>

        <p>
          O Raio-X da carteira é o fluxo de diagnóstico da Redentia. Você conecta sua carteira via Open Finance, a plataforma lê cada ativo real e roda uma análise determinística em 4 frentes de risco. O resultado é traduzido num Redent Score de 0 a 100, com banda clara: Crítica, Em atenção, Boa ou Excelente. Tudo em cerca de 2 minutos. Não é opinião, não é projeção de quanto você vai ganhar, é uma fotografia objetiva de onde estão os pontos frágeis.
        </p>

        <!-- 3 stats cards -->
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Patrimônio PF</p>
            <p class="text-3xl font-bold mb-1">R$ 8,5 tri</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Investido por pessoas físicas no Brasil em 2025 (ANBIMA)</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Fora do país</p>
            <p class="text-3xl font-bold mb-1 text-secondary">~2%</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Do patrimônio da PF brasileira está fora do Brasil (ANBIMA, 2025)</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Open Finance</p>
            <p class="text-3xl font-bold mb-1">154 mi</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Consentimentos ativos no Open Finance brasileiro (BCB, fev/2026)</p>
          </div>
        </div>

        <h2>O problema: o risco que não aparece no extrato</h2>

        <p>
          Imagine duas carteiras de R$ 100 mil, cada uma com 10 ativos. No extrato, parecem igualmente diversificadas: dez posições, valores parecidos, rentabilidade na média do mercado. Mas uma pode ser sólida e a outra pode estar à beira do risco crítico. A diferença não está na quantidade de ativos, está na estrutura por trás deles.
        </p>

        <p>
          Harry Markowitz provou isso em 1952, no paper "Portfolio Selection", trabalho que lhe rendeu o Nobel de Economia em 1990. A constatação central: o risco de uma carteira não é a média do risco de cada ativo, depende de como os ativos se movem em conjunto. Dez ações de bancos têm um risco estrutural completamente diferente de dez ações distribuídas em sete setores, mesmo que cada ação individual tenha volatilidade parecida.
        </p>

        <p>
          O investidor comum não tem como fazer essa conta de cabeça. Concentração por setor, correlação entre ativos, distribuição geográfica e custo de taxa são variáveis que o olho humano não enxerga olhando o app do banco. É exatamente esse o vazio que o Raio-X preenche: ele mede o que a intuição não alcança.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          O risco de uma carteira não é a média do risco de cada ativo. Depende de como eles se correlacionam.
        </blockquote>

        <h2>Como funciona: conecta, a IA lê tudo</h2>

        <p>
          O Raio-X começa pela conexão via Open Finance. O Open Finance é a infraestrutura regulada pelo Banco Central que permite, com seu consentimento, compartilhar dados financeiros entre instituições de forma segura. Em fevereiro de 2026, o sistema brasileiro completou cinco anos e já reúne mais de 154 milhões de consentimentos ativos e mais de 100 milhões de clientes conectados, segundo o Banco Central. O Brasil opera um dos maiores ecossistemas de Open Finance do mundo.
        </p>

        <p>
          Na prática, você autoriza uma vez, dentro do app do banco original, quais instituições compartilham dados e por quanto tempo. A partir daí, a Redentia consegue ler sua carteira real, todos os bancos e corretoras de uma vez, sem você digitar nenhum ticker nem montar planilha. A leitura é por ativo: a plataforma identifica cada posição, sua classe, seu setor e seus fundamentos.
        </p>

        <p>
          Com a carteira lida, a análise roda automaticamente. É um cálculo determinístico, ou seja, a mesma carteira sempre gera o mesmo diagnóstico, sem palpite e sem viés de quem está analisando. O tempo total, da conexão ao Score, fica em torno de 2 minutos. E você pode revogar o consentimento a qualquer momento, dentro do próprio app do banco, sob proteção da LGPD.
        </p>

        <h2>O que o Raio-X revela: os 4 riscos escondidos</h2>

        <p>
          O diagnóstico se concentra em quatro frentes de risco que raramente são medidas em conjunto. Cada uma responde a uma pergunta que o extrato não responde.
        </p>

        <h3>1. Concentração</h3>
        <p>
          Mede o peso do maior ativo individual e do maior setor dentro da carteira. Um único ativo representando 40% do patrimônio é um risco binário: se a tese der certo, a carteira voa; se der errado, despenca. O mesmo vale para setor. Ter dez ações parece diversificado, mas se sete delas são bancos, a carteira inteira reage como se fosse um único setor. Concentração baixa não é virtude por si só, é redução de assimetria. O Raio-X mostra exatamente onde sua carteira está concentrada, sem julgar a tese, só medindo o risco estrutural.
        </p>

        <h3>2. Correlação</h3>
        <p>
          Mede quais ativos tendem a cair ao mesmo tempo. Esse é o risco mais invisível de todos, porque não tem como vê-lo no extrato. Duas empresas de setores diferentes podem, na prática, se mover juntas porque dependem da mesma variável, como o preço de uma commodity, o nível da Selic ou o câmbio. Quando metade da carteira sobe e desce em bloco, a diversificação é só aparente. O Raio-X identifica esses agrupamentos para mostrar se a carteira realmente protege em cenários adversos ou apenas parece protegida.
        </p>

        <h3>3. Geografia</h3>
        <p>
          Mede a exposição internacional da carteira. O investidor brasileiro tem forte viés doméstico, o chamado home bias: apenas cerca de 2% do patrimônio da pessoa física está fora do país, segundo a ANBIMA em 2025. Isso significa que quase todo o patrimônio fica exposto ao risco de um único país, uma única moeda e uma bolsa concentrada em poucos setores. Distribuição geográfica não é sobre buscar mais retorno, é sobre não depender de um cenário só. O Raio-X mostra o quanto sua carteira está ancorada exclusivamente no Brasil.
        </p>

        <h3>4. Taxa</h3>
        <p>
          Mede o custo que corrói o retorno no silêncio. Taxas de administração, performance e custos embutidos não aparecem como uma linha de despesa no extrato, mas reduzem o resultado de forma composta ao longo dos anos. Uma diferença de 1% ao ano em taxa, capitalizada por uma década, faz uma diferença relevante no patrimônio final. O Raio-X traz esse custo à superfície para que ele entre na conta da decisão, em vez de ficar escondido.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          Diversificação não é contar quantos ativos você tem. É contar quantos cenários sua carteira sobrevive.
        </blockquote>

        <h2>O Score: quatro riscos viram uma nota só</h2>

        <p>
          Quatro frentes de risco geram muitos dados. Concentração em 32%, correlação alta entre cinco ativos, 1,8% no exterior, taxa média de 1,4% ao ano. Cada número isolado é difícil de internalizar. Por isso o Raio-X traduz tudo num único Redent Score de 0 a 100, que cai numa banda clara e acionável.
        </p>

        <ul>
          <li><strong>0 a 44 · Crítica.</strong> A carteira tem riscos estruturais relevantes que merecem ação imediata. Tipicamente concentração alta, sem distribuição geográfica, com um ou dois setores dominando.</li>
          <li><strong>45 a 64 · Em atenção.</strong> Carteira funcional, mas com gaps importantes a fechar. Costuma faltar exposição internacional ou ter peso excessivo num ativo.</li>
          <li><strong>65 a 81 · Boa.</strong> Carteira sólida, com pontos de refinamento identificados. Diversificação razoável, talvez sem hedge cambial completo.</li>
          <li><strong>82 a 100 · Excelente.</strong> Carteira bem balanceada, com diversificação e qualidade altas. O foco passa a ser manter disciplina nos aportes e revisar periodicamente.</li>
        </ul>

        <p>
          A grande vantagem da nota única é que ela vira um benchmark próprio. Você sabe se a carteira de hoje está mais sólida que a de três meses atrás. Pode estabelecer uma meta concreta, como subir de 58 para 70 até o fim do ano. É a diferença entre ter a sensação de estar bem alocado e ter uma medida objetiva disso. Importante: o Score mede a estrutura de risco da carteira, não promete retorno futuro e não é recomendação de compra ou venda.
        </p>

        <h2>Raio-X e Redent Score: qual a diferença</h2>

        <p>
          O Raio-X é o fluxo de diagnóstico, o processo que conecta, lê e analisa a carteira nas quatro frentes de risco. O Redent Score é o resultado desse processo, a nota 0 a 100 que resume tudo. Em outras palavras, o Raio-X é a radiografia e o Score é o laudo. Você faz o Raio-X uma vez, e a partir dele recebe o Score, as dimensões individuais e as sugestões de ação.
        </p>

        <p>
          O fluxo completo é direto: você conecta a carteira via Open Finance, a Redentia identifica cada ativo, calcula as frentes de risco automaticamente e devolve o Redent Score com banda, detalhamento por frente e os movimentos com maior impacto na nota. Tempo total em torno de 2 minutos, custo zero, atualização automática a cada nova posição ou mudança de mercado.
        </p>

        <h2>Perguntas Frequentes</h2>

        <h3>O Raio-X é seguro? Vocês têm acesso ao meu dinheiro?</h3>
        <p>
          A conexão é feita via Open Finance, infraestrutura regulada pelo Banco Central, com seu consentimento explícito dentro do app do banco original. O Raio-X lê dados para análise, não movimenta nem transfere dinheiro. Você define quais instituições compartilham, por quanto tempo, e pode revogar o consentimento a qualquer momento, sob proteção da LGPD.
        </p>

        <h3>Quanto tempo leva e quanto custa?</h3>
        <p>
          O fluxo completo, da conexão ao Redent Score, leva em torno de 2 minutos. O diagnóstico é gratuito.
        </p>

        <h3>O Raio-X promete dizer quanto vou ganhar?</h3>
        <p>
          Não. O Raio-X é um diagnóstico de risco, não uma projeção de retorno. Ele mede a estrutura da carteira nas frentes de concentração, correlação, geografia e taxa, e traduz isso num Redent Score. Ele não promete ganho nem recomenda comprar ou vender ativos específicos.
        </p>

        <h3>Por que medir correlação e geografia se eu já tenho vários ativos?</h3>
        <p>
          Porque quantidade de ativos não é o mesmo que diversificação real. Vários ativos do mesmo setor ou que dependem da mesma variável se movem juntos, então o risco se comporta como se fosse um único ativo. E ter quase tudo no Brasil deixa o patrimônio exposto a um único país e a uma única moeda. Correlação e geografia capturam esse risco que a simples contagem de ativos ignora.
        </p>

        <h3>Preciso reorganizar a carteira antes de fazer o Raio-X?</h3>
        <p>
          Não. O objetivo é justamente o contrário: o Raio-X analisa sua carteira exatamente como ela está hoje, para mostrar onde estão os pontos frágeis. A partir do diagnóstico, você decide com clareza o que vale ajustar.
        </p>
      </div>

      <!-- CTA Redentia -->
      <div class="rounded-2xl border p-6 md:p-8" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
        <h3 class="mb-3">Faça o Raio-X da sua carteira em 2 minutos</h3>
        <p class="mb-5" :style="{ color: 'var(--brand-text-muted)' }">
          A {{ brand.name }} conecta sua carteira via Open Finance, mede os 4 riscos escondidos e devolve o Redent Score 0-100 da sua alocação real. Diagnóstico de risco, sem promessa de retorno.
        </p>
        <div class="flex flex-wrap gap-3">
          <NuxtLink to="/raio-x" class="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 font-medium text-background hover:opacity-90 transition-opacity">
            <UIcon name="i-lucide-radar" class="size-5" /> Fazer Raio X
          </NuxtLink>
          <NuxtLink to="/calculadora" class="inline-flex items-center gap-2 rounded-xl border border-secondary px-5 py-2.5 font-medium text-secondary hover:bg-secondary/10 transition-colors">
            <UIcon name="i-lucide-calculator" class="size-5" /> Calculadoras
          </NuxtLink>
        </div>
      </div>

      <!-- Navegação -->
      <div class="border-t pt-8" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">
        <h3>Continue lendo</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink to="/guias/redent-score-0-100-explicado" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-gauge" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Redent Score 0-100 Explicado</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">As 9 dimensões por trás da nota</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>
          <NuxtLink to="/guias/open-finance-carteira-espalhada" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-network" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Open Finance: Carteira Espalhada</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">A infraestrutura que alimenta o Raio-X</p>
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
  title: `Raio-X da Carteira: Descubra os Riscos Escondidos em 2 Minutos | ${brand.name}`,
  description:
    'O risco de uma carteira está na estrutura, não no extrato. O Raio-X da Redentia conecta sua carteira via Open Finance e mede 4 riscos escondidos (concentração, correlação, geografia e taxa), traduzindo tudo num Redent Score 0-100 em 2 minutos. Diagnóstico de risco, não promessa de retorno.',
  path: '/guias/raio-x-carteira',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Raio-X da Carteira: Descubra os Riscos Escondidos em 2 Minutos',
      description:
        'Guia sobre o fluxo de diagnóstico Raio-X da Redentia. Explica como o Open Finance permite ler a carteira real, as 4 frentes de risco medidas (concentração, correlação, geografia, taxa) e como o resultado vira um Redent Score 0-100 com bandas Crítica, Em Atenção, Boa e Excelente.',
      author: { '@type': 'Organization', name: brand.name },
      publisher: {
        '@type': 'Organization',
        name: brand.name,
        logo: { '@type': 'ImageObject', url: `${brand.url}/512x512.png` },
      },
      datePublished: '2026-06-08',
      dateModified: '2026-06-08',
      articleSection: 'Guia Redentia',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'O Raio-X é seguro? Vocês têm acesso ao meu dinheiro?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A conexão é via Open Finance, regulado pelo Banco Central, com consentimento explícito dentro do app do banco original. O Raio-X lê dados para análise, não movimenta nem transfere dinheiro. Você define quais instituições compartilham e por quanto tempo, e pode revogar a qualquer momento sob proteção da LGPD.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quanto tempo leva e quanto custa o Raio-X?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'O fluxo completo, da conexão via Open Finance ao Redent Score, leva em torno de 2 minutos. O diagnóstico é gratuito.',
          },
        },
        {
          '@type': 'Question',
          name: 'O Raio-X promete dizer quanto vou ganhar?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. O Raio-X é um diagnóstico de risco, não projeção de retorno. Mede a estrutura da carteira nas frentes de concentração, correlação, geografia e taxa, e traduz num Redent Score. Não promete ganho nem recomenda comprar ou vender ativos.',
          },
        },
        {
          '@type': 'Question',
          name: 'Por que medir correlação e geografia se eu já tenho vários ativos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Porque quantidade de ativos não é diversificação real. Vários ativos do mesmo setor ou que dependem da mesma variável se movem juntos, então o risco se comporta como um único ativo. E ter quase tudo no Brasil deixa o patrimônio exposto a um único país. Correlação e geografia capturam esse risco que a contagem de ativos ignora.',
          },
        },
        {
          '@type': 'Question',
          name: 'Preciso reorganizar a carteira antes de fazer o Raio-X?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. O Raio-X analisa sua carteira exatamente como ela está hoje, para mostrar onde estão os pontos frágeis. A partir do diagnóstico, você decide com clareza o que vale ajustar.',
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
        { '@type': 'ListItem', position: 3, name: 'Raio-X da Carteira', item: `${brand.url}/guias/raio-x-carteira` },
      ],
    },
  ],
})
</script>
