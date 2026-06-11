<template>
  <NuxtLayout name="default" title="Pergunte pra Redent.IA: o Copiloto de IA que Lê o Mercado e Responde a Sua Carteira">
    <section class="flex flex-col gap-8 px-6 py-8">
      <MoleculesPageHeader
        icon="i-lucide-message-circle-question"
        icon-color="secondary"
        title="Pergunte pra Redent.IA: o Copiloto de IA que Lê o Mercado e Responde a Sua Carteira"
        description="A Redent.IA é o assistente de inteligência artificial da Redentia. Você pergunta em linguagem natural, do jeito que a dúvida nasce, e ela responde cruzando a sua carteira real lida via Open Finance, as notícias de mercado e as calculadoras da plataforma. É um copiloto de educação e diagnóstico, não uma dica que promete retorno."
      />

      <div class="flex flex-col gap-6">
        <p class="text-lg">
          O investidor brasileiro convive com um tipo de dúvida que não cabe num gráfico nem numa tabela de cotações. O dólar subindo me afeta? Vale a pena Tesouro IPCA+ agora? Minha carteira está concentrada demais? Essa notícia muda alguma coisa pra mim? São perguntas concretas, do dia a dia, e quase nunca têm onde ser respondidas em linguagem normal, olhando pra situação real de quem pergunta.
        </p>

        <p>
          A Redent.IA existe pra preencher esse vazio. É o assistente de IA da Redentia, disponível na página /help da plataforma, que recebe a sua pergunta escrita do jeito que você falaria com alguém e devolve uma resposta com contexto. Não é um chatbot genérico que repete o que está na internet, e também não é um robô de recomendação que manda comprar ou vender. É um copiloto: ele te ajuda a entender a sua própria situação para que você decida com mais clareza.
        </p>

        <p>
          A diferença está em três coisas que a Redent.IA cruza e que você dificilmente junta sozinho: a sua carteira real, lida via Open Finance, as notícias e o contexto de mercado atualizados, e as calculadoras da plataforma. Em vez de responder pela média do mercado, ela responde olhando pra sua realidade. E faz isso sem prometer retorno, sem garantir ganho e sem dizer qual ativo comprar.
        </p>

        <!-- 3 stats cards -->
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Open Finance</p>
            <p class="text-3xl font-bold mb-1">100 mi+</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Clientes conectados ao Open Finance no Brasil (BCB, fev/2026)</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Camadas de contexto</p>
            <p class="text-3xl font-bold mb-1 text-secondary">3</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Carteira real, notícias de mercado e calculadoras na mesma resposta</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Formato</p>
            <p class="text-3xl font-bold mb-1">Linguagem natural</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Você pergunta do seu jeito, a resposta vem com o porquê</p>
          </div>
        </div>

        <h2>O problema: dúvidas que não cabem num gráfico</h2>

        <p>
          A maioria das ferramentas financeiras é boa em mostrar dado e ruim em responder pergunta. O app do banco mostra saldo. A corretora mostra cotação. O portal de notícias mostra manchete. Mas nenhum deles responde a pergunta que realmente importa pra você naquele momento, porque essa pergunta depende de duas coisas que essas ferramentas não conhecem ao mesmo tempo: o que está acontecendo no mercado e como você está posicionado.
        </p>

        <p>
          Pense numa pergunta como "o dólar subindo me afeta?". A resposta honesta é: depende. Depende de quanto da sua carteira está em ativos atrelados ao dólar, de quanto está em exportadoras, de quanto está em renda fixa pós-fixada. Um gráfico do dólar não responde isso. Uma manchete sobre o câmbio também não. Só responde quem olha a sua carteira real e cruza com o cenário. É exatamente esse cruzamento que ninguém faz por você, e que a Redent.IA faz.
        </p>

        <p>
          O mesmo vale para "vale a pena Tesouro IPCA+ agora?" ou "minha carteira está concentrada?". São perguntas que exigem juntar contexto de mercado, regras de produto e a sua situação específica. O investidor comum não tem tempo nem ferramentas pra fazer essa conta de cabeça, e acaba decidindo no escuro ou pela opinião de quem aparecer primeiro no feed.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          A pergunta certa quase nunca tem resposta num gráfico. Tem resposta no cruzamento entre o mercado e a sua carteira.
        </blockquote>

        <h2>O que é: um copiloto, não uma dica</h2>

        <p>
          A Redent.IA é um assistente de inteligência artificial enquadrado como copiloto. Essa palavra é importante. Um copiloto não pilota o avião por você, ele te dá informação, alerta sobre riscos e te ajuda a navegar. Aplicado a investimentos, isso significa que a Redent.IA explica, contextualiza e diagnostica, mas a decisão continua sendo sua. Ela não emite recomendação de compra ou venda de ativos específicos e não promete que você vai ganhar dinheiro.
        </p>

        <p>
          Esse enquadramento não é detalhe de marketing, é uma postura de responsabilidade. Conteúdo financeiro que promete retorno costuma ser o sinal mais claro de que algo está errado. A Redent.IA foca em educação e diagnóstico: ajuda você a entender por que algo acontece, o que aquilo significa pra sua carteira e quais perguntas você ainda precisa se fazer. O objetivo é deixar você mais bem informado, não decidir no seu lugar.
        </p>

        <p>
          Na prática, você acessa a Redent.IA na página /help, escreve a pergunta como se estivesse conversando, e ela responde em texto, com o raciocínio à mostra. Quando faz sentido, ela traz dados, faz cálculos ou aponta para uma análise mais detalhada dentro da plataforma. E tudo isso sem jargão desnecessário, no nível de quem pergunta.
        </p>

        <h2>O que faz: conecta o que estava solto</h2>

        <p>
          O que diferencia a Redent.IA de um assistente genérico é o acesso a contexto que importa. Ela combina três camadas numa única resposta.
        </p>

        <h3>1. Sua carteira real, via Open Finance</h3>
        <p>
          Com o seu consentimento, a Redentia lê sua carteira via Open Finance, a infraestrutura regulada pelo Banco Central que permite compartilhar dados financeiros de forma segura entre instituições. Em fevereiro de 2026, o sistema brasileiro reunia mais de 100 milhões de clientes conectados, segundo o Banco Central. Isso significa que a Redent.IA pode responder olhando pros seus ativos de verdade, e não pra uma carteira hipotética. A autorização é dada uma vez, dentro do app do banco original, e pode ser revogada a qualquer momento sob proteção da LGPD.
        </p>

        <h3>2. Notícias e contexto de mercado</h3>
        <p>
          A Redent.IA tem acesso a notícias e ao contexto de mercado atualizados, então uma pergunta como "o que essa notícia muda pra mim?" pode ser respondida cruzando o que saiu com o que você tem. Não é só repetir a manchete, é traduzir o impacto pra sua situação, quando ele existe, e dizer com transparência quando não há impacto relevante.
        </p>

        <h3>3. Calculadoras e ferramentas da plataforma</h3>
        <p>
          Quando a pergunta exige conta, a Redent.IA usa as ferramentas da própria Redentia: calculadora de dividendos, simulações de Tesouro Direto, cenários de renda fixa e variável, entre outras. Em vez de você abrir cinco abas e montar planilha, a resposta já vem com o cálculo feito e a fonte explícita. E como ela guarda memória do que você já perguntou, a conversa evolui em vez de recomeçar do zero a cada pergunta.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          Responder bem não é saber tudo sobre o mercado. É saber o mercado e a sua carteira ao mesmo tempo.
        </blockquote>

        <h2>Exemplos: perguntas que ela já responde</h2>

        <p>
          A melhor forma de entender a Redent.IA é ver o tipo de pergunta que ela trata. Todas em linguagem natural, do jeito que a dúvida aparece na cabeça do investidor.
        </p>

        <ul>
          <li><strong>"O dólar subindo me afeta?"</strong> Ela olha quanto da sua carteira tem exposição cambial, direta ou indireta, e explica o efeito provável, sem prever o futuro do câmbio.</li>
          <li><strong>"Vale a pena Tesouro IPCA+ agora?"</strong> Ela contextualiza como funciona o título, o cenário de juros e inflação, e o que considerar na decisão, sem dizer que você deve comprar.</li>
          <li><strong>"Minha carteira está concentrada?"</strong> Ela lê suas posições reais e mostra o peso do maior ativo e do maior setor, traduzindo concentração em risco estrutural.</li>
          <li><strong>"O que essa notícia muda pra mim?"</strong> Ela cruza a notícia com os seus ativos e diz se há impacto relevante, em vez de generalizar.</li>
        </ul>

        <p>
          Em todos os casos, a resposta vem com o porquê, não só o quê. O objetivo é que você saia da conversa entendendo melhor a sua situação, não apenas com uma ordem para executar. É essa transparência de raciocínio que separa um copiloto de uma dica.
        </p>

        <h2>Privacidade e limites</h2>

        <p>
          A leitura da carteira acontece via Open Finance, com consentimento explícito e revogável, dentro do padrão regulado pelo Banco Central e sob proteção da LGPD. A Redent.IA lê dados para análise, não movimenta nem transfere dinheiro. E há limites claros e propositais: ela não recomenda ativos específicos, não promete retorno e não substitui um assessor ou planejador para decisões que exigem aconselhamento personalizado. Ela informa, contextualiza e diagnostica para que a sua decisão seja mais consciente.
        </p>

        <h2>Perguntas Frequentes</h2>

        <h3>A Redent.IA recomenda o que comprar?</h3>
        <p>
          Não. A Redent.IA é um copiloto de educação e diagnóstico. Ela explica, contextualiza e analisa a sua situação, mas não emite recomendação de compra ou venda de ativos específicos e não promete retorno. A decisão é sempre sua.
        </p>

        <h3>Como ela conhece a minha carteira?</h3>
        <p>
          Com o seu consentimento, a Redentia lê sua carteira via Open Finance, a infraestrutura regulada pelo Banco Central. A autorização é dada uma vez dentro do app do banco original e pode ser revogada a qualquer momento, sob proteção da LGPD. A Redent.IA lê dados para análise, não movimenta dinheiro.
        </p>

        <h3>Preciso saber termos técnicos para perguntar?</h3>
        <p>
          Não. A ideia é justamente o contrário. Você pergunta em linguagem natural, do jeito que a dúvida aparece, como "o dólar subindo me afeta?" ou "minha carteira está concentrada?". A resposta vem no nível de quem pergunta, com o porquê explicado.
        </p>

        <h3>Ela acerta o que vai acontecer no mercado?</h3>
        <p>
          Não. A Redent.IA não prevê o futuro do câmbio, dos juros ou das ações, e não promete ganho. Ela contextualiza o cenário atual e o efeito provável sobre a sua carteira, deixando claro o que é fato, o que é cenário e o que é incerteza.
        </p>

        <h3>Onde eu acesso a Redent.IA?</h3>
        <p>
          Na página /help da Redentia. Você conecta sua carteira via Open Finance, escreve a pergunta e recebe a resposta em texto, com o raciocínio à mostra. O acesso ao diagnóstico é gratuito.
        </p>
      </div>

      <!-- CTA Redentia -->
      <div class="rounded-2xl border p-6 md:p-8" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
        <h3 class="mb-3">Pergunte pra Redent.IA o que te trava</h3>
        <p class="mb-5" :style="{ color: 'var(--brand-text-muted)' }">
          A {{ brand.name }} conecta sua carteira via Open Finance e responde suas dúvidas em linguagem natural, cruzando seus dados reais, notícias de mercado e calculadoras. Educação e diagnóstico, sem promessa de retorno.
        </p>
        <div class="flex flex-wrap gap-3">
          <NuxtLink to="/help" class="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 font-medium text-background hover:opacity-90 transition-opacity">
            <UIcon name="i-lucide-message-circle-question" class="size-5" /> Perguntar pra Redent.IA
          </NuxtLink>
          <NuxtLink to="/raio-x" class="inline-flex items-center gap-2 rounded-xl border border-secondary px-5 py-2.5 font-medium text-secondary hover:bg-secondary/10 transition-colors">
            <UIcon name="i-lucide-radar" class="size-5" /> Fazer Raio X
          </NuxtLink>
        </div>
      </div>

      <!-- Navegação -->
      <div class="border-t pt-8" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">
        <h3>Continue lendo</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink to="/guias/raio-x-carteira" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-radar" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Raio-X da Carteira em 2 Minutos</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">O diagnóstico que alimenta as respostas</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>
          <NuxtLink to="/guias/open-finance-carteira-espalhada" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-network" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Open Finance: Carteira Espalhada</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">A infraestrutura que conecta seus dados</p>
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
  title: `Pergunte pra Redent.IA: o Copiloto de IA da sua Carteira | ${brand.name}`,
  description:
    'A Redent.IA é o assistente de IA da Redentia. Você pergunta em linguagem natural ("o dólar subindo me afeta?", "vale a pena Tesouro IPCA+ agora?", "minha carteira está concentrada?") e ela responde cruzando sua carteira real via Open Finance, notícias de mercado e calculadoras. Copiloto de educação e diagnóstico, sem promessa de retorno.',
  path: '/guias/pergunte-redentia',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Pergunte pra Redent.IA: o Copiloto de IA que Lê o Mercado e Responde a Sua Carteira',
      description:
        'Guia sobre a Redent.IA, o assistente de inteligência artificial da Redentia disponível em /help. Explica como o copiloto responde dúvidas em linguagem natural cruzando a carteira real lida via Open Finance, notícias de mercado e calculadoras, com foco em educação e diagnóstico e sem promessa de retorno.',
      author: { '@type': 'Organization', name: brand.name },
      publisher: {
        '@type': 'Organization',
        name: brand.name,
        logo: { '@type': 'ImageObject', url: `${brand.url}/512x512.png` },
      },
      datePublished: '2026-06-09',
      dateModified: '2026-06-09',
      articleSection: 'Guia Redentia',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'A Redent.IA recomenda o que comprar?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. A Redent.IA é um copiloto de educação e diagnóstico. Ela explica, contextualiza e analisa a sua situação, mas não emite recomendação de compra ou venda de ativos específicos e não promete retorno. A decisão é sempre sua.',
          },
        },
        {
          '@type': 'Question',
          name: 'Como a Redent.IA conhece a minha carteira?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Com o seu consentimento, a Redentia lê sua carteira via Open Finance, a infraestrutura regulada pelo Banco Central. A autorização é dada uma vez dentro do app do banco original e pode ser revogada a qualquer momento, sob proteção da LGPD. A Redent.IA lê dados para análise, não movimenta dinheiro.',
          },
        },
        {
          '@type': 'Question',
          name: 'Preciso saber termos técnicos para perguntar?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. Você pergunta em linguagem natural, do jeito que a dúvida aparece, como "o dólar subindo me afeta?" ou "minha carteira está concentrada?". A resposta vem no nível de quem pergunta, com o porquê explicado.',
          },
        },
        {
          '@type': 'Question',
          name: 'A Redent.IA acerta o que vai acontecer no mercado?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. A Redent.IA não prevê o futuro do câmbio, dos juros ou das ações, e não promete ganho. Ela contextualiza o cenário atual e o efeito provável sobre a sua carteira, deixando claro o que é fato, o que é cenário e o que é incerteza.',
          },
        },
        {
          '@type': 'Question',
          name: 'Onde eu acesso a Redent.IA?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Na página /help da Redentia. Você conecta sua carteira via Open Finance, escreve a pergunta e recebe a resposta em texto, com o raciocínio à mostra. O acesso ao diagnóstico é gratuito.',
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
        { '@type': 'ListItem', position: 3, name: 'Pergunte pra Redent.IA', item: `${brand.url}/guias/pergunte-redentia` },
      ],
    },
  ],
})
</script>
