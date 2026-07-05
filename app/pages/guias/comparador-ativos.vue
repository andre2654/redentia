<template>
  <NuxtLayout name="default" title="Comparador de Ativos pela Redentia: Dois ou Mais Ativos Lado a Lado, Preço, Dividend Yield, Valuation e Risco, pra Decidir com Dado e Não com Achismo">
    <section class="flex flex-col gap-8 px-6 py-8">
      <MoleculesPageHeader
        icon="i-lucide-columns-3"
        icon-color="secondary"
        title="Comparador de Ativos pela Redentia: Dois ou Mais Ativos Lado a Lado, Preço, Dividend Yield, Valuation e Risco, pra Decidir com Dado e Não com Achismo"
        description="O comparador da Redentia coloca dois ou mais ativos na mesma tela pra você comparar o que importa: preço e histórico, dividend yield, valuation e risco, além de setor e perfil. Ajuda a decidir entre dois bancos, dois FIIs ou ação e Tesouro com dado, não com achismo. É ferramenta de comparação e educação, sem recomendação e sem promessa de retorno."
      />

      <div class="flex flex-col gap-6">
        <p class="text-lg">
          Escolher entre dois ativos parecidos é uma das decisões mais comuns, e mais mal informadas, da vida de quem investe. Dois bancos grandes, dois fundos imobiliários de tijolo, uma ação que paga dividendo contra um título do Tesouro: na hora de decidir qual entra na carteira, a maioria das pessoas se apoia no achismo, na dica de um amigo ou na opinião de quem grita mais alto nas redes. O problema não é falta de informação, é que a informação está espalhada, em formatos diferentes, e quase nunca aparece lado a lado. O comparador de ativos da Redentia existe pra resolver exatamente isso, colocar os ativos na mesma tela e deixar o dado organizar a decisão.
        </p>

        <p>
          A proposta é direta: em vez de abrir uma aba pra cada ativo e tentar lembrar de cabeça quanto cada um custa, quanto paga de provento e como está o valuation, você vê tudo numa tabela única. Cada ativo vira uma coluna, cada métrica vira uma linha, e dá pra comparar dois, três ou até oito ativos de uma vez. É importante ler isso pelo que é. O comparador não diz qual ativo comprar, não recomenda nada e não promete retorno. Ele organiza a informação pra que a sua decisão seja melhor informada. A escolha continua sendo sua.
        </p>

        <p>
          Por que isso importa agora? Porque tem muita gente comparando ativo no escuro. A B3 fechou 2024 com 5,3 milhões de CPFs investindo em renda variável, cerca de 6% a mais do que um ano antes (B3, dez/2024). São milhões de pessoas escolhendo entre ações, fundos imobiliários e ETFs parecidos, e boa parte dessa escolha ainda acontece no boca a boca. Ter preço, dividend yield, valuation e risco na mesma tela transforma uma decisão de impulso numa decisão com critério.
        </p>

        <!-- 3 stats cards -->
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border p-5" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Investidores na B3</p>
            <p class="text-3xl font-bold mb-1 text-secondary">5,3 mi</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">CPFs em renda variável ao fim de 2024 (B3, dez/2024)</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Quantos comparar</p>
            <p class="text-3xl font-bold mb-1">Até 8</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Ativos lado a lado na mesma tabela, de dois em diante</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">O que é</p>
            <p class="text-3xl font-bold mb-1">Comparar</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Ferramenta de comparação e educação, não recomendação</p>
          </div>
        </div>

        <h2>O problema: comparar ativo no achismo</h2>

        <p>
          A decisão entre dois ativos costuma ser tomada com a informação errada. Você lembra que um banco "parece mais barato", que um FII "paga bem" ou que uma ação "subiu muito esse ano", mas raramente tem os números dos dois lado a lado na hora de decidir. O resultado é uma comparação enviesada, baseada em impressões soltas e não em dado organizado. E quando a informação está espalhada, abrir cada ativo em uma aba diferente e tentar guardar os números de cabeça só piora, porque a memória é seletiva e tende a confirmar o que você já queria escolher.
        </p>

        <p>
          Há também o problema de comparar coisas que não são comparáveis. Colocar uma ação de crescimento ao lado de um título de renda fixa, ou um FII de tijolo ao lado de um FII de papel, sem entender que cada um responde a riscos diferentes, leva a conclusões erradas. Sem ver o setor, o perfil e o risco de cada ativo, é fácil achar que está comparando maçãs com maçãs quando na verdade são maçãs com laranjas. A comparação só ajuda quando ela é honesta sobre o que cada ativo é.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          Dois bancos parecem iguais até você ver o valuation e o dividend yield um do lado do outro. A comparação não decide por você, ela tira o achismo da mesa.
        </blockquote>

        <h2>Lado a lado: os números na mesma tabela</h2>

        <p>
          A primeira coisa que o comparador da Redentia faz é organizar a leitura. Em vez de telas separadas, ele monta uma tabela única em que cada ativo ocupa uma coluna e cada métrica ocupa uma linha. Assim você lê de relance: olha a linha do dividend yield e vê os dois, três ou oito ativos de uma vez, sem precisar trocar de aba nem anotar nada num papel. Esse formato simples é o que mais muda na prática, porque transforma uma comparação de memória numa comparação visual, em que as diferenças saltam aos olhos.
        </p>

        <p>
          O comparador aceita de dois em diante, até oito ativos numa única comparação. Isso cobre os casos mais comuns: comparar dois ativos diretos, como dois bancos ou dois FIIs, ou montar uma lista curta de candidatos a uma mesma posição na carteira e ver todos juntos. Ver lado a lado, vale repetir, não é indicação de compra. É um retrato organizado dos ativos no momento, pra você comparar com critério antes de decidir.
        </p>

        <h3>Por que tabela e não texto</h3>
        <p>
          Uma tabela força a comparação justa. Quando a informação está em parágrafos soltos, é fácil dar mais peso ao ativo que você já gostava e passar batido pelos números que contrariam a sua escolha. Numa tabela, cada métrica aparece para todos os ativos na mesma linha, então o que está pior fica visível ao lado do que está melhor. A estrutura em colunas e linhas é o que mantém a comparação honesta, sem favorecer um ativo por simpatia.
        </p>

        <h2>O que compara: as métricas que pesam</h2>

        <p>
          Comparar ativo é olhar muito além do preço da tela. O comparador da Redentia reúne as métricas que mais costumam pesar numa decisão de carteira. A primeira é o preço, atual e o histórico, pra você ver não só quanto cada ativo custa hoje mas como chegou até aqui. A segunda é o dividend yield, que mostra quanto cada ativo pagou de provento em relação ao preço, métrica central pra quem busca renda. A terceira é o valuation, com indicadores como P/L, preço sobre lucro, e P/VP, preço sobre valor patrimonial, que ajudam a entender se um ativo está caro ou barato em relação aos seus fundamentos.
        </p>

        <p>
          A quarta frente é o contexto: setor e perfil de cada ativo, pra não comparar coisas diferentes como se fossem iguais. Saber que um ativo é de um banco e o outro de uma empresa de energia, ou que um FII é de tijolo e o outro de papel, muda completamente a leitura dos números. Risco e volatilidade entram aqui também, porque dois ativos com o mesmo yield podem ter níveis de oscilação muito diferentes. A ideia é dar uma fotografia completa, não só o número mais bonito.
        </p>

        <h3>Indicadores explicados em uma frase</h3>
        <p>
          Pra quem está começando, vale o lembrete rápido. Dividend yield é o provento dos últimos doze meses dividido pelo preço, expresso em porcentagem. P/L, preço sobre lucro, indica quantos anos de lucro atual o mercado está pagando pelo ativo. P/VP, preço sobre valor patrimonial, compara o preço de mercado com o valor contábil. Nenhum desses indicadores, isolado, decide nada. Eles fazem sentido juntos e dentro do setor de cada ativo, e é por isso que vê-los lado a lado ajuda mais do que olhar um de cada vez.
        </p>

        <h2>Decida: com dado, não com achismo</h2>

        <p>
          O ponto central é que a comparação organiza a decisão, mas não decide por você. Quando você vê dois bancos lado a lado e percebe que um negocia a um P/L mais baixo enquanto o outro paga um dividend yield maior, a comparação não diz qual é o melhor, ela mostra que existe um trade-off entre os dois, e quem escolhe qual trade-off faz mais sentido pra sua carteira é você. Esse desenho é intencional. A Redentia não dá recomendação personalizada de investimento nem promete retorno de nenhuma natureza.
        </p>

        <p>
          Esse enquadramento importa porque é o que separa uma ferramenta de educação de uma promessa irresponsável. Comparar ativos não é prever qual vai subir, é entender as diferenças entre eles com critério. O dado do passado e os fundamentos atuais ajudam a tomar uma decisão mais consciente, mas não garantem resultado futuro. Quando a decisão envolver orientação personalizada, o caminho continua sendo procurar um profissional habilitado. O comparador é um apoio à sua autonomia, não um substituto dela.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          A B3 fechou 2024 com 5,3 milhões de CPFs em renda variável (B3, dez/2024). São milhões de pessoas escolhendo entre ativos parecidos. Comparar com dado tira o achismo da mesa.
        </blockquote>

        <h2>Limites e o que não esperar</h2>

        <p>
          É importante ser honesto sobre o que o comparador não faz. Ele não escolhe ativo por você, não recomenda compra ou venda e não garante ganho. Ver dois ativos lado a lado não é sinal de que você deve trocar um pelo outro, e o ativo com o melhor número numa métrica pode ser o pior em outra. O comparador também trabalha com dados disponíveis e indicadores conhecidos, que ajudam a entender o presente e o passado, não a prever o futuro. O que ele entrega é concreto e modesto: preço, dividend yield, valuation, setor e risco na mesma tela, pra você comparar com critério. É ferramenta de comparação e educação, não recomendação e não promessa de retorno.
        </p>

        <h2>Perguntas Frequentes</h2>

        <h3>O comparador diz qual ativo eu devo comprar?</h3>
        <p>
          Não. O comparador da Redentia coloca os ativos lado a lado e mostra preço, dividend yield, valuation, setor e risco de cada um, mas não recomenda compra nem venda. Ele organiza a informação pra que a sua decisão seja melhor informada. A escolha de comprar, vender ou manter continua sendo inteiramente sua. É ferramenta de comparação e educação, sem recomendação e sem promessa de retorno.
        </p>

        <h3>Quantos ativos dá pra comparar de uma vez?</h3>
        <p>
          De dois em diante, até oito ativos numa única comparação. Isso cobre os casos mais comuns, como comparar dois bancos ou dois FIIs diretos, e também montar uma lista curta de candidatos a uma mesma posição na carteira e ver todos juntos na mesma tabela, cada ativo numa coluna.
        </p>

        <h3>Quais métricas o comparador mostra?</h3>
        <p>
          Preço atual e variação, e o histórico de cada ativo; dividend yield, quanto cada um pagou de provento em relação ao preço; valuation, com indicadores como P/L, preço sobre lucro, e P/VP, preço sobre valor patrimonial; além de setor e perfil, pra você não acabar comparando ativos de naturezas diferentes como se fossem iguais. Risco e volatilidade também entram na leitura.
        </p>

        <h3>Posso comparar uma ação com o Tesouro Direto?</h3>
        <p>
          Sim, e é uma comparação útil, desde que feita com consciência das diferenças. Uma ação e um título do Tesouro respondem a riscos muito diferentes, então a comparação ajuda a entender o que você está abrindo mão de um lado e do outro, não a dizer qual é o melhor. O comparador mostra as diferenças com dado; a decisão sobre qual faz sentido pra sua carteira é sua.
        </p>

        <h3>O comparador prevê qual ativo vai render mais?</h3>
        <p>
          Não. A Redentia não promete retorno de nenhuma natureza e não dá recomendação personalizada. O comparador mostra dados do presente e do passado e indicadores conhecidos, que ajudam a entender as diferenças entre os ativos, não a prever o futuro. Rentabilidade passada não garante rentabilidade futura. É ferramenta de comparação, leitura e educação.
        </p>
      </div>

      <!-- CTA Redentia -->
      <div class="rounded-2xl border p-6 md:p-8" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
        <h3 class="mb-3">Compare seus ativos na {{ brand.name }}</h3>
        <p class="mb-5" :style="{ color: 'var(--brand-text-muted)' }">
          A {{ brand.name }} coloca dois ou mais ativos lado a lado e mostra preço, dividend yield, valuation, setor e risco de cada um, na mesma tela. Compare com critério antes de decidir. Ferramenta de comparação e educação, sem recomendação e sem promessa de retorno.
        </p>
        <div class="flex flex-wrap gap-3">
          <NuxtLink to="/raio-x" class="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 font-medium text-background hover:opacity-90 transition-opacity">
            <UIcon name="i-lucide-radar" class="size-5" /> Fazer Raio X
          </NuxtLink>
          <NuxtLink to="/help" class="inline-flex items-center gap-2 rounded-xl border border-secondary px-5 py-2.5 font-medium text-secondary hover:bg-secondary/10 transition-colors">
            <UIcon name="i-lucide-columns-3" class="size-5" /> Comparar pela Redent.IA
          </NuxtLink>
        </div>
      </div>

      <!-- Navegação -->
      <div class="border-t pt-8" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">
        <h3>Continue lendo</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink to="/guias/seus-agentes" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-bot" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Seus agentes na Redent.IA</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">A IA que lê o mercado e checa sua carteira enquanto você decide</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>
          <NuxtLink to="/guias/dividendos" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-calendar-clock" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Seus dividendos pela Redentia</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">Calendário de proventos, quanto você já recebeu e o yield da carteira</p>
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
  title: `Comparador de Ativos pela Redentia: Dois ou Mais Ativos Lado a Lado, Preço, Dividend Yield, Valuation e Risco | ${brand.name}`,
  description:
    'O comparador da Redentia coloca dois ou mais ativos na mesma tela pra você comparar o que importa: preço e histórico, dividend yield, valuation com P/L e P/VP, setor e risco. Ajuda a decidir entre dois bancos, dois FIIs ou ação e Tesouro com dado, não com achismo. Ferramenta de comparação e educação, sem recomendação e sem promessa de retorno.',
  path: '/guias/comparador-ativos',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Comparador de Ativos pela Redentia: Dois ou Mais Ativos Lado a Lado, Preço, Dividend Yield, Valuation e Risco, pra Decidir com Dado e Não com Achismo',
      description:
        'Guia sobre o comparador de ativos da Redentia. Explica o problema de comparar ativo no achismo, como funciona a tabela lado a lado, quais métricas pesam, preço, dividend yield, valuation, setor e risco, e por que a decisão continua sendo do investidor. Foco em comparação e educação, sem recomendação e sem promessa de retorno.',
      author: { '@type': 'Organization', name: brand.name },
      publisher: {
        '@type': 'Organization',
        name: brand.name,
        logo: { '@type': 'ImageObject', url: `${brand.url}/512x512.png` },
      },
      datePublished: '2026-06-19',
      dateModified: '2026-06-19',
      articleSection: 'Guia Redentia',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'O comparador da Redentia diz qual ativo eu devo comprar?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. O comparador da Redentia coloca os ativos lado a lado e mostra preço, dividend yield, valuation, setor e risco de cada um, mas não recomenda compra nem venda. Ele organiza a informação pra que a sua decisão seja melhor informada. A escolha de comprar, vender ou manter continua sendo inteiramente sua. É ferramenta de comparação e educação, sem recomendação e sem promessa de retorno.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quantos ativos dá pra comparar de uma vez?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'De dois em diante, até oito ativos numa única comparação. Isso cobre os casos mais comuns, como comparar dois bancos ou dois FIIs diretos, e também montar uma lista curta de candidatos a uma mesma posição na carteira e ver todos juntos na mesma tabela, cada ativo numa coluna.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quais métricas o comparador mostra?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Preço atual e variação, e o histórico de cada ativo; dividend yield, quanto cada um pagou de provento em relação ao preço; valuation, com indicadores como P/L, preço sobre lucro, e P/VP, preço sobre valor patrimonial; além de setor e perfil, pra você não acabar comparando ativos de naturezas diferentes como se fossem iguais. Risco e volatilidade também entram na leitura.',
          },
        },
        {
          '@type': 'Question',
          name: 'Posso comparar uma ação com o Tesouro Direto?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim, e é uma comparação útil, desde que feita com consciência das diferenças. Uma ação e um título do Tesouro respondem a riscos muito diferentes, então a comparação ajuda a entender o que você está abrindo mão de um lado e do outro, não a dizer qual é o melhor. O comparador mostra as diferenças com dado; a decisão sobre qual faz sentido pra sua carteira é sua.',
          },
        },
        {
          '@type': 'Question',
          name: 'O comparador prevê qual ativo vai render mais?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. A Redentia não promete retorno de nenhuma natureza e não dá recomendação personalizada. O comparador mostra dados do presente e do passado e indicadores conhecidos, que ajudam a entender as diferenças entre os ativos, não a prever o futuro. Rentabilidade passada não garante rentabilidade futura. É ferramenta de comparação, leitura e educação.',
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
        { '@type': 'ListItem', position: 3, name: 'Comparador de Ativos', item: `${brand.url}/guias/comparador-ativos` },
      ],
    },
  ],
})
</script>
