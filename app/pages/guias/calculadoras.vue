<template>
  <NuxtLayout name="default" title="Calculadoras e Simuladores da Redentia: Planeje Juros Compostos, Metas e Aposentadoria">
    <section class="flex flex-col gap-8 px-6 py-8">
      <MoleculesPageHeader
        icon="i-lucide-calculator"
        icon-color="secondary"
        title="Calculadoras e Simuladores da Redentia: Planeje Juros Compostos, Metas e Aposentadoria"
        description="As calculadoras da Redentia fazem a projeção pra você, sempre com as suas premissas. São o simulador de juros compostos, o simulador de meta, o simulador de aposentadoria e o comparador de aplicações. Os números são cenário, não promessa: é ferramenta de planejamento e educação, não recomendação, e não promete retorno."
      />

      <div class="flex flex-col gap-6">
        <p class="text-lg">
          Quanto um aporte mensal vira daqui a 20 anos? Quanto você precisa guardar por mês pra chegar num valor? Quanto um patrimônio pode pagar de renda quando você parar de trabalhar? São perguntas simples de fazer e difíceis de responder de cabeça, porque três variáveis, aporte, prazo e taxa, se combinam de um jeito que cresce de forma não linear. As Calculadoras e Simuladores da Redentia existem pra resolver essa conta pra você, sempre a partir das premissas que você escolher.
        </p>

        <p>
          O ponto central, que vale repetir antes de qualquer número, é que toda projeção é um cenário, não uma promessa. Você define o aporte, o prazo e a taxa que quer testar, e a calculadora mostra o resultado matemático daquela hipótese. Mudou a taxa, mudou o resultado. Por isso essas ferramentas servem pra planejar e entender, não pra garantir quanto você vai ter. A Redentia não recomenda produto, não prevê o mercado e não promete retorno.
        </p>

        <p>
          Essa distinção fica mais óbvia num momento como o de 2026. A Selic está em 14,50% ao ano (Copom, abr/2026) e o IPCA acumula 4,72% em 12 meses (IBGE, mai/2026). São números que mudam o tempo todo, reunião após reunião do Copom, mês após mês de inflação. Qualquer simulação de longo prazo que assuma uma taxa fixa está, na prática, fazendo uma aposta sobre o futuro. Os simuladores deixam você testar várias hipóteses justamente pra você ver o quanto o resultado depende delas.
        </p>

        <!-- 3 stats cards -->
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Selic atual</p>
            <p class="text-3xl font-bold mb-1">14,50%</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Taxa básica ao ano, premissa que muda a cada Copom (Copom, abr/2026)</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Simuladores</p>
            <p class="text-3xl font-bold mb-1 text-secondary">4</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Juros compostos, meta, aposentadoria e comparador de aplicações</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">IPCA em 12 meses</p>
            <p class="text-3xl font-bold mb-1">4,72%</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Inflação acumulada, outra premissa que muda todo mês (IBGE, mai/2026)</p>
          </div>
        </div>

        <h2>Por que simular: a conta de cabeça engana</h2>

        <p>
          O cérebro humano é péssimo em intuir crescimento exponencial. Quando você imagina um aporte rendendo ao longo de décadas, a tendência é projetar uma reta, somar mentalmente parcelas iguais. Mas juro sobre juro não é uma reta, é uma curva que sobe devagar no início e acelera no fim. Essa diferença entre o que você imagina e o que a matemática produz é justamente o que faz as pessoas subestimarem o efeito do tempo ou superestimarem o resultado de uma taxa otimista.
        </p>

        <p>
          A solução não é confiar na intuição, é fazer a conta. Uma calculadora não tem viés: ela aplica a fórmula com os números que você der e mostra o cenário daquela hipótese. Isso transforma uma sensação vaga em algo concreto que você pode olhar, ajustar e comparar. Quando você muda o aporte de 300 para 500 reais, ou o prazo de 10 para 20 anos, vê na hora como cada decisão pesa, sem precisar acreditar em ninguém.
        </p>

        <p>
          E é importante separar o que a ferramenta faz do que ela não faz. Ela calcula o resultado de uma premissa, não escolhe a premissa por você nem garante que ela vai se confirmar. A taxa que você digita é uma hipótese sua. O simulador é honesto sobre isso: ele projeta o cenário, deixa claro que é projeção e não promete que o mercado vai entregar aquele número.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          Uma calculadora não adivinha o futuro. Ela mostra, com clareza, o que acontece se a sua premissa se confirmar, pra você decidir com a conta na mão em vez do achismo.
        </blockquote>

        <h2>Simulador de juros compostos: o tempo faz o trabalho pesado</h2>

        <p>
          O simulador de juros compostos é o mais básico e, talvez, o mais revelador. Você informa um valor inicial, um aporte mensal, um prazo em anos e uma taxa anual que queira testar. A partir daí ele projeta a evolução do montante mês a mês, aplicando rendimento sobre o saldo que já inclui os rendimentos anteriores. É o famoso juro sobre juro, o mecanismo que faz o dinheiro crescer de forma acelerada quando recebe tempo.
        </p>

        <p>
          O detalhe mais útil dessa ferramenta é separar, no resultado, quanto do montante final veio dos seus aportes e quanto veio do rendimento. No começo, quase tudo é aporte. Conforme os anos passam, a fatia de rendimento cresce até, em prazos longos, superar o que você efetivamente colocou. Ver essa virada deixa concreto por que começar cedo e manter constância importa tanto, não por promessa, mas por aritmética.
        </p>

        <h3>O que você ajusta</h3>
        <p>
          Você controla quatro variáveis: valor inicial, aporte mensal, prazo e taxa anual. A taxa é uma premissa sua, não uma garantia da Redentia. Testar diferentes taxas, uma conservadora e uma otimista, é uma boa prática, porque mostra o intervalo de resultados possíveis em vez de apostar tudo num único número. O simulador não diz qual taxa é a certa, ele apenas calcula o cenário de cada uma.
        </p>

        <h2>Simulador de meta: comece pelo objetivo, não pelo produto</h2>

        <p>
          A maioria das pessoas começa errado, escolhendo um produto antes de saber pra quê. O simulador de meta inverte essa ordem. Você parte do objetivo, um valor que quer juntar e um prazo, e a ferramenta calcula o caminho ao contrário: quanto você precisa aportar por mês, sob a taxa que assumiu, pra chegar lá. Em vez de perguntar quanto rende, você pergunta quanto precisa guardar.
        </p>

        <p>
          A calculadora trabalha nos dois sentidos. Você pode fixar a meta e o prazo pra descobrir o aporte mensal necessário, ou fixar o aporte que cabe no seu orçamento pra ver em quanto tempo a meta chega. Os dois modos respondem perguntas reais de planejamento: "quanto preciso guardar pra dar entrada num imóvel em cinco anos?" ou "se eu conseguir 500 reais por mês, quando junto isso?". É a meta que define o plano, não o produto da moda.
        </p>

        <h3>Planejamento, não recomendação</h3>
        <p>
          Vale o mesmo limite das outras ferramentas: o simulador de meta calcula um caminho matemático, não recomenda onde investir nem garante a taxa. Ele assume a premissa que você definir e mostra o aporte ou o prazo correspondente. A escolha de como buscar aquele retorno, e o risco envolvido, continua sendo sua. A Redentia organiza a conta, não substitui a sua decisão nem promete o resultado.
        </p>

        <h2>Simulador de aposentadoria: quanto rende todo mês lá na frente</h2>

        <p>
          Pensar em aposentadoria envolve uma conta a mais. Não basta saber quanto patrimônio você vai acumular, é preciso estimar quanto esse patrimônio pode pagar por mês quando você parar de aportar e começar a usar. O simulador de aposentadoria, ou de renda passiva, faz exatamente isso: a partir de um patrimônio e de uma taxa de retorno assumida, projeta a renda mensal possível, sob as premissas que você definir.
        </p>

        <p>
          É aqui que a importância da premissa fica mais evidente. Uma renda projetada com base numa taxa real otimista parece confortável; a mesma renda recalculada com uma taxa conservadora pode ser bem menor. Por isso o simulador serve pra testar cenários, não pra cravar um número. Com a Selic em 14,50% ao ano (Copom, abr/2026) e o IPCA em 4,72% em 12 meses (IBGE, mai/2026), o juro real de hoje é diferente do de cinco anos atrás, e provavelmente do de daqui a cinco. A ferramenta deixa você ver como a renda muda conforme a hipótese.
        </p>

        <h3>O comparador de aplicações</h3>
        <p>
          Complementando o trio, o comparador mostra quanto rende cada aplicação sob a mesma taxa e o mesmo prazo, pra você enxergar lado a lado em vez de comparar de cabeça. Ele padroniza as premissas pra que a comparação seja justa, sem favorecer um produto. Como sempre, é uma ferramenta de educação: mostra a aritmética de cada cenário, não recomenda qual escolher nem promete que aquele rendimento vai se repetir.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          O melhor planejamento não é o que assume o cenário mais otimista. É o que testa vários cenários e ainda funciona quando a premissa frustra.
        </blockquote>

        <h2>Limites e o que não esperar</h2>

        <p>
          É importante ser honesto sobre o que as calculadoras não fazem. Elas não preveem o futuro, não escolhem investimentos por você e não prometem retorno. Toda projeção é o resultado matemático de uma premissa que você definiu, e premissas como taxa de juros e inflação mudam o tempo todo. Os simuladores também não consideram, sozinhos, impostos, inflação futura desconhecida ou imprevistos da vida, então o número final é uma referência de planejamento, não uma garantia. Para decisões que exigem aconselhamento personalizado, nada substitui um profissional. As calculadoras são ferramentas de planejamento e educação, e é exatamente nesse papel que elas ajudam.
        </p>

        <h2>Perguntas Frequentes</h2>

        <h3>Os números das calculadoras são uma promessa de retorno?</h3>
        <p>
          Não. Todo resultado é uma projeção baseada nas premissas que você definir, como aporte, prazo e taxa. Se a taxa que você assumiu não se confirmar, o resultado real será diferente. As calculadoras são ferramentas de planejamento e educação, não recomendação, e não prometem nenhum retorno.
        </p>

        <h3>Qual taxa eu devo usar nos simuladores?</h3>
        <p>
          A taxa é uma premissa sua, e a Redentia não indica qual usar. Uma boa prática é testar mais de um cenário, um conservador e um otimista, pra ver o intervalo de resultados possíveis. Como referência de contexto, a Selic está em 14,50% ao ano (Copom, abr/2026) e o IPCA acumula 4,72% em 12 meses (IBGE, mai/2026), mas esses números mudam o tempo todo.
        </p>

        <h3>Qual a diferença entre o simulador de juros compostos e o de meta?</h3>
        <p>
          O de juros compostos parte do aporte e do prazo pra projetar quanto você teria no final. O de meta parte do valor que você quer juntar e calcula o caminho ao contrário: quanto aportar por mês, ou em quanto tempo a meta chega. Um responde "quanto isso vira", o outro responde "quanto preciso guardar".
        </p>

        <h3>O simulador de aposentadoria diz com quanto eu posso me aposentar?</h3>
        <p>
          Ele estima quanto um patrimônio pode pagar por mês de renda passiva sob a taxa que você assumir, e funciona como referência de planejamento. Como qualquer projeção, o resultado depende da premissa e não é garantido. Ele ajuda você a entender a relação entre patrimônio, taxa e renda, sem prometer um valor.
        </p>

        <h3>As calculadoras recomendam onde investir?</h3>
        <p>
          Não. Elas calculam o resultado matemático das premissas que você definir e, no caso do comparador, mostram a aritmética de cada aplicação lado a lado. A escolha de onde investir, e o risco envolvido, continua sendo sua. A Redentia organiza a conta, não substitui a sua decisão nem faz recomendação de produto.
        </p>
      </div>

      <!-- CTA Redentia -->
      <div class="rounded-2xl border p-6 md:p-8" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
        <h3 class="mb-3">Simule seus planos na Redentia</h3>
        <p class="mb-5" :style="{ color: 'var(--brand-text-muted)' }">
          A {{ brand.name }} reúne o simulador de juros compostos, o simulador de meta, o simulador de aposentadoria e o comparador de aplicações, sempre com as suas premissas. Os números são cenário, não promessa: ferramenta de planejamento e educação, sem promessa de retorno.
        </p>
        <div class="flex flex-wrap gap-3">
          <NuxtLink to="/raio-x" class="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 font-medium text-background hover:opacity-90 transition-opacity">
            <UIcon name="i-lucide-radar" class="size-5" /> Fazer Raio X
          </NuxtLink>
          <NuxtLink to="/help" class="inline-flex items-center gap-2 rounded-xl border border-secondary px-5 py-2.5 font-medium text-secondary hover:bg-secondary/10 transition-colors">
            <UIcon name="i-lucide-message-circle-question" class="size-5" /> Perguntar pra Redent.IA
          </NuxtLink>
        </div>
      </div>

      <!-- Navegação -->
      <div class="border-t pt-8" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">
        <h3>Continue lendo</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink to="/guias/alertas-watchlist" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-bell-ring" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Alertas e Watchlist</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">Acompanhe os ativos sem ficar grudado na tela</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>
          <NuxtLink to="/guias/tesouro-redentia" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-landmark" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Tesouro Direto pela Redentia</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">Compare Selic, IPCA+ e Prefixado por vencimento</p>
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
  title: `Calculadoras e Simuladores da Redentia: Juros Compostos, Metas e Aposentadoria | ${brand.name}`,
  description:
    'As calculadoras da Redentia projetam juros compostos, metas, aposentadoria e quanto rende cada aplicação, sempre com as suas premissas. Os números são cenário, não promessa: ferramenta de planejamento e educação, não recomendação, e sem promessa de retorno.',
  path: '/guias/calculadoras',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Calculadoras e Simuladores da Redentia: Planeje Juros Compostos, Metas e Aposentadoria',
      description:
        'Guia sobre as calculadoras e simuladores da Redentia: simulador de juros compostos, simulador de meta, simulador de aposentadoria e comparador de aplicações. Explica como cada ferramenta projeta cenários a partir das premissas do usuário, com foco em planejamento e educação, sem recomendação e sem promessa de retorno.',
      author: { '@type': 'Organization', name: brand.name },
      publisher: {
        '@type': 'Organization',
        name: brand.name,
        logo: { '@type': 'ImageObject', url: `${brand.url}/512x512.png` },
      },
      datePublished: '2026-06-14',
      dateModified: '2026-06-14',
      articleSection: 'Guia Redentia',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Os números das calculadoras são uma promessa de retorno?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. Todo resultado é uma projeção baseada nas premissas que você definir, como aporte, prazo e taxa. Se a taxa que você assumiu não se confirmar, o resultado real será diferente. As calculadoras são ferramentas de planejamento e educação, não recomendação, e não prometem nenhum retorno.',
          },
        },
        {
          '@type': 'Question',
          name: 'Qual taxa eu devo usar nos simuladores?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A taxa é uma premissa sua, e a Redentia não indica qual usar. Uma boa prática é testar mais de um cenário, um conservador e um otimista, pra ver o intervalo de resultados possíveis. Como referência de contexto, a Selic está em 14,50% ao ano (Copom, abr/2026) e o IPCA acumula 4,72% em 12 meses (IBGE, mai/2026), mas esses números mudam o tempo todo.',
          },
        },
        {
          '@type': 'Question',
          name: 'Qual a diferença entre o simulador de juros compostos e o de meta?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'O de juros compostos parte do aporte e do prazo pra projetar quanto você teria no final. O de meta parte do valor que você quer juntar e calcula o caminho ao contrário: quanto aportar por mês, ou em quanto tempo a meta chega. Um responde quanto isso vira, o outro responde quanto preciso guardar.',
          },
        },
        {
          '@type': 'Question',
          name: 'O simulador de aposentadoria diz com quanto eu posso me aposentar?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ele estima quanto um patrimônio pode pagar por mês de renda passiva sob a taxa que você assumir, e funciona como referência de planejamento. Como qualquer projeção, o resultado depende da premissa e não é garantido. Ele ajuda você a entender a relação entre patrimônio, taxa e renda, sem prometer um valor.',
          },
        },
        {
          '@type': 'Question',
          name: 'As calculadoras recomendam onde investir?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. Elas calculam o resultado matemático das premissas que você definir e, no caso do comparador, mostram a aritmética de cada aplicação lado a lado. A escolha de onde investir, e o risco envolvido, continua sendo sua. A Redentia organiza a conta, não substitui a sua decisão nem faz recomendação de produto.',
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
        { '@type': 'ListItem', position: 3, name: 'Calculadoras e Simuladores', item: `${brand.url}/guias/calculadoras` },
      ],
    },
  ],
})
</script>
