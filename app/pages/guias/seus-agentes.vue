<template>
  <NuxtLayout name="default" title="Seus Agentes de Investimento na Redent.IA: a IA que Lê o Mercado, Checa sua Carteira e Acha o Risco Escondido Enquanto Você Decide">
    <section class="flex flex-col gap-8 px-6 py-8">
      <MoleculesPageHeader
        icon="i-lucide-bot"
        icon-color="secondary"
        title="Seus Agentes de Investimento na Redent.IA: a IA que Lê o Mercado, Checa sua Carteira e Acha o Risco Escondido Enquanto Você Decide"
        description="Na Redent.IA você não investe mais sozinho. Os agentes de IA fazem o trabalho pesado por você: leem o mercado 24 horas, checam a composição da sua carteira, acham o risco escondido, calculam a sua meta e monitoram tudo. Eles fazem o trabalho operacional, mas quem decide o que comprar, vender ou manter continua sendo você. É ferramenta de organização, leitura e educação, sem recomendação e sem promessa de retorno."
      />

      <div class="flex flex-col gap-6">
        <p class="text-lg">
          Acompanhar o mercado dá trabalho. A notícia chega o dia inteiro, a carteira costuma estar espalhada em vários apps e o risco que mais importa, o que está escondido na concentração ou na correlação dos ativos, quase nunca aparece de forma clara. O resultado é que o investidor pessoa física gasta tempo demais juntando informação e energia de menos no que realmente conta: decidir com calma. Os agentes da Redent.IA existem para inverter essa equação. Eles assumem o trabalho operacional de ler, checar e calcular, e devolvem a você o que sobra de mais valioso, a decisão consciente.
        </p>

        <p>
          A frase que resume a proposta é simples: você não investe mais sozinho, os agentes de IA da Redent.IA fazem o trabalho pesado por você. É importante ler isso pelo que ele é. Não se trata de um robô que investe sozinho e te deixa rico, nem de delegar a decisão para uma máquina. Trata-se de delegar a parte braçal e repetitiva, ler comunicado, conferir composição, somar números, monitorar mudanças, para que você chegue à decisão com mais informação e menos ruído. O piloto continua sendo você. Os agentes são o copiloto.
        </p>

        <p>
          O exemplo mais recente é o melhor: ontem, 17 de junho de 2026, o Copom cortou a Selic para 14,25% ao ano, uma surpresa, já que o mercado estava dividido entre corte e manutenção (Banco Central, 17/jun/2026). Enquanto a notícia se espalhava e analistas corriam para interpretar, os agentes já tinham lido o comunicado e cruzado o conteúdo com a sua carteira. A leitura é deles, feita em segundo plano e em tempo real. A decisão sobre o que fazer com essa informação continua sendo sua.
        </p>

        <!-- 3 stats cards -->
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border p-5" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Selic após o Copom</p>
            <p class="text-3xl font-bold mb-1 text-secondary">14,25%</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Taxa após o corte do Copom (Banco Central, 17/jun/2026)</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Quando trabalham</p>
            <p class="text-3xl font-bold mb-1">24/7</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Os agentes acompanham o mercado o tempo todo, você decide quando agir</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Quem decide</p>
            <p class="text-3xl font-bold mb-1">Você</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Os agentes fazem o trabalho operacional, a decisão continua sendo sua</p>
          </div>
        </div>

        <h2>O problema: acompanhar o mercado sozinho consome tempo e ainda esconde risco</h2>

        <p>
          O investidor moderno tem mais acesso a informação do que nunca, e isso virou um problema próprio. Notícia de macroeconomia, balanço de empresa, decisão de juros, movimento de câmbio: tudo chega ao mesmo tempo, em vários canais, sem hierarquia. Filtrar o que importa para a sua carteira específica é um trabalho cansativo, e a maioria das pessoas não tem tempo nem disposição para fazê-lo todos os dias. O efeito colateral é decidir no susto, reagindo à manchete em vez de à própria estratégia.
        </p>

        <p>
          Há ainda a questão da carteira fragmentada. Conta em um banco, ações em uma corretora, fundos em outra, Tesouro em uma terceira. Sem uma visão consolidada, é difícil enxergar a alocação real, e quase impossível identificar o risco escondido. Concentração excessiva em um único ativo, correlação alta entre posições que parecem diferentes, baixa liquidez num pedaço relevante do patrimônio: são problemas que não aparecem quando você olha cada conta isoladamente. Eles só ficam visíveis quando alguém, ou algo, junta tudo e analisa o conjunto.
        </p>

        <p>
          É exatamente esse trabalho de juntar, ler e analisar que toma tempo e energia. E é exatamente esse trabalho que os agentes da Redent.IA assumem, para que a sua atenção fique livre para a parte que só você pode fazer: decidir.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          Você não investe mais sozinho. Os agentes fazem o trabalho pesado, ler, checar e calcular, e devolvem a você o que importa: a decisão.
        </blockquote>

        <h2>Os agentes: copiloto, não piloto automático</h2>

        <p>
          A maneira mais honesta de descrever os agentes da Redent.IA é como um copiloto, não um piloto automático. Cada agente cuida de uma tarefa específica que, feita à mão, tomaria horas do seu dia. Um acompanha notícia e contexto macroeconômico. Outro confere a composição e a concentração da carteira. Outro estima o risco, olhando correlação e liquidez. Outro calcula a meta e monitora se algo mudou. Eles trabalham em segundo plano, de forma contínua, e te entregam o resultado pronto para que você não precise montar esse quebra-cabeça sozinho.
        </p>

        <p>
          O limite é claro e proposital. Os agentes não compram, não vendem e não prometem retorno. Eles não dizem o que você deve fazer com o seu dinheiro. O papel deles é reduzir o atrito da informação e ampliar a sua capacidade de decidir bem, não substituir a sua decisão. Essa distinção importa porque é o que separa uma ferramenta de educação e organização de uma promessa irresponsável. A Redent.IA fica claramente do lado da ferramenta.
        </p>

        <h3>Diferente de pedir uma resposta pontual</h3>
        <p>
          Vale separar duas coisas que andam juntas na plataforma. Quando você pergunta algo à Redent.IA, em linguagem natural, e recebe uma explicação, isso é o assistente reativo: você puxa a informação. Os agentes são o lado proativo: eles trabalham mesmo quando você não está olhando, lendo o mercado, conferindo a carteira e monitorando mudanças, e te avisam quando algo merece a sua atenção. Os dois se complementam, mas o foco aqui é o time de agentes que faz o trabalho de fundo por você.
        </p>

        <h2>O que os agentes fazem por você</h2>

        <p>
          Na prática, o trabalho dos agentes se divide em quatro frentes que cobrem o ciclo de acompanhamento de uma carteira. A primeira é leitura de mercado: eles acompanham notícia e macroeconomia o tempo todo e resumem o que de fato importa, separando o ruído do que pode afetar a sua alocação. A segunda é a checagem da carteira: conferem a composição e a concentração por ativo, mostrando se você está mais exposto a um setor ou a um papel do que imaginava.
        </p>

        <p>
          A terceira frente é encontrar o risco escondido. Os agentes olham para além da lista de ativos e analisam correlação, ou seja, posições que tendem a cair juntas mesmo parecendo diferentes, e liquidez, identificando pedaços do patrimônio que seriam difíceis de vender rápido sem perda. A quarta frente é cálculo e monitoramento: eles calculam o caminho até a sua meta sob as premissas que você definir e acompanham se algo muda, te avisando quando uma mudança merece um novo olhar. Em todas as frentes, o que entra é informação processada, e o que sai é a sua decisão.
        </p>

        <h3>Ler o comunicado antes do mercado reagir</h3>
        <p>
          O corte da Selic de ontem ilustra bem o valor de ter os agentes trabalhando. O Copom reduziu a taxa para 14,25% ao ano, contrariando parte do mercado que esperava manutenção (Banco Central, 17/jun/2026). Uma decisão de juros muda o cenário para renda fixa, para ações e para a relação entre as duas, mas o impacto concreto depende da carteira de cada um. Enquanto a notícia ainda circulava, os agentes já tinham lido o comunicado e cruzado o conteúdo com a sua alocação real, deixando a leitura pronta para quando você quisesse decidir. Eles não decidiram nada por você. Eles tiraram o trabalho de leitura do seu caminho.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          Enquanto o mercado corria atrás da notícia do corte de juros, os agentes já tinham lido o comunicado e cruzado com a sua carteira. A leitura é deles, a decisão é sua.
        </blockquote>

        <h2>Você decide: por que o controle continua com o investidor</h2>

        <p>
          O ponto central, que vale repetir, é que a decisão nunca sai das suas mãos. Os agentes leem, checam, acham e calculam, mas quem escolhe comprar, vender, rebalancear ou simplesmente não fazer nada é você. Esse desenho é intencional. Delegar a decisão a uma máquina seria perigoso e irresponsável, além de tirar de você o aprendizado que vem de decidir com base em informação organizada. Delegar o trabalho operacional, ao contrário, é libertador: você ganha tempo, reduz o estresse de acompanhar tudo e chega à decisão com mais clareza.
        </p>

        <p>
          Esse é também o enquadramento correto do ponto de vista de responsabilidade. A Redent.IA não dá recomendação personalizada de investimento nem promete retorno de nenhuma natureza. O que ela oferece é leitura, organização e educação, ferramentas para que a sua decisão seja melhor informada. Quando a decisão envolve orientação personalizada, o caminho continua sendo procurar um profissional habilitado. Os agentes são um apoio à sua autonomia, não um substituto dela.
        </p>

        <h2>Limites e o que não esperar</h2>

        <p>
          É importante ser honesto sobre o que os agentes não fazem. Eles não investem sozinhos por você, não escolhem ativos, não executam ordens e não garantem ganho. Não existe robô que enriquece ninguém automaticamente, e qualquer promessa nesse sentido deve acender um alerta. O que os agentes fazem é concreto e modesto: leem o mercado, checam a sua carteira, apontam o risco escondido, calculam a sua meta e monitoram mudanças, sempre devolvendo a decisão para você. É ferramenta de organização, leitura e educação, não recomendação e não promessa de retorno.
        </p>

        <h2>Perguntas Frequentes</h2>

        <h3>Os agentes investem sozinhos por mim?</h3>
        <p>
          Não. Os agentes da Redent.IA fazem o trabalho operacional, ler o mercado, checar a carteira, achar o risco escondido, calcular a meta e monitorar mudanças, mas não compram, não vendem e não executam nenhuma ordem. A decisão de comprar, vender ou manter continua sendo inteiramente sua. É um copiloto, não um piloto automático.
        </p>

        <h3>Qual a diferença entre os agentes e perguntar algo para a Redent.IA?</h3>
        <p>
          Perguntar à Redent.IA é o lado reativo: você puxa uma resposta em linguagem natural. Os agentes são o lado proativo: trabalham em segundo plano mesmo quando você não está olhando, acompanhando o mercado e a sua carteira, e te avisam quando algo merece atenção. Os dois se complementam, mas os agentes fazem o trabalho de fundo por você.
        </p>

        <h3>O que os agentes fazem exatamente?</h3>
        <p>
          Eles leem notícia e macroeconomia o tempo todo e resumem o que importa, checam a composição e a concentração da sua carteira, acham o risco escondido como correlação e baixa liquidez, calculam o caminho até a sua meta sob as suas premissas e monitoram mudanças, avisando quando algo se altera. Em todas as frentes, eles processam informação para que você decida melhor.
        </p>

        <h3>Os agentes prometem que vou ganhar dinheiro?</h3>
        <p>
          Não. A Redent.IA não promete retorno de nenhuma natureza e não dá recomendação personalizada de investimento. Os agentes são ferramenta de leitura, organização e educação, feitos para reduzir o trabalho de acompanhar o mercado e ampliar a sua capacidade de decidir, não para garantir ganho.
        </p>

        <h3>Por que isso é mais útil agora?</h3>
        <p>
          Porque o cenário está mudando rápido. Ontem, 17 de junho de 2026, o Copom cortou a Selic para 14,25% ao ano, surpreendendo parte do mercado que esperava manutenção (Banco Central, 17/jun/2026). Em momentos assim, ter agentes que já leram o comunicado e cruzaram com a sua carteira economiza tempo e ajuda você a decidir com calma, em vez de reagir no susto à manchete.
        </p>
      </div>

      <!-- CTA Redentia -->
      <div class="rounded-2xl border p-6 md:p-8" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
        <h3 class="mb-3">Coloque os agentes da Redent.IA pra trabalhar por você</h3>
        <p class="mb-5" :style="{ color: 'var(--brand-text-muted)' }">
          A {{ brand.name }} conecta sua carteira via Open Finance regulado e deixa os agentes lerem o mercado, checarem a composição e o risco e calcularem a sua meta. O trabalho operacional é da IA, a decisão é sua. Ferramenta de leitura, organização e educação, sem promessa de retorno.
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
          <NuxtLink to="/guias/pergunte-redentia" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-message-circle-question" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Pergunte pra Redent.IA</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">O copiloto que responde suas dúvidas em linguagem natural</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>
          <NuxtLink to="/guias/alertas-watchlist" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-bell-ring" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Alertas e Watchlist</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">Acompanhe os ativos sem ficar grudado na tela</p>
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
  title: `Seus Agentes de Investimento na Redent.IA: a IA que Lê o Mercado e Acha o Risco Enquanto Você Decide | ${brand.name}`,
  description:
    'Na Redent.IA você não investe mais sozinho. Os agentes de IA fazem o trabalho pesado por você: leem o mercado 24 horas, checam a composição da carteira, acham o risco escondido, calculam a meta e monitoram tudo. Quem decide o que comprar, vender ou manter continua sendo você. Ferramenta de leitura, organização e educação, sem recomendação e sem promessa de retorno.',
  path: '/guias/seus-agentes',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Seus Agentes de Investimento na Redent.IA: a IA que Lê o Mercado, Checa sua Carteira e Acha o Risco Escondido Enquanto Você Decide',
      description:
        'Guia sobre os agentes de IA da Redent.IA. Explica o que são, o que fazem por você, ler o mercado, checar a carteira, achar o risco escondido, calcular a meta e monitorar, e por que a decisão continua sendo do investidor. Foco em leitura, organização e educação, sem recomendação e sem promessa de retorno.',
      author: { '@type': 'Organization', name: brand.name },
      publisher: {
        '@type': 'Organization',
        name: brand.name,
        logo: { '@type': 'ImageObject', url: `${brand.url}/512x512.png` },
      },
      datePublished: '2026-06-18',
      dateModified: '2026-06-18',
      articleSection: 'Guia Redentia',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Os agentes da Redent.IA investem sozinhos por mim?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. Os agentes da Redent.IA fazem o trabalho operacional, ler o mercado, checar a carteira, achar o risco escondido, calcular a meta e monitorar mudanças, mas não compram, não vendem e não executam nenhuma ordem. A decisão de comprar, vender ou manter continua sendo inteiramente sua. É um copiloto, não um piloto automático.',
          },
        },
        {
          '@type': 'Question',
          name: 'Qual a diferença entre os agentes e perguntar algo para a Redent.IA?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Perguntar à Redent.IA é o lado reativo: você puxa uma resposta em linguagem natural. Os agentes são o lado proativo: trabalham em segundo plano mesmo quando você não está olhando, acompanhando o mercado e a sua carteira, e te avisam quando algo merece atenção. Os dois se complementam, mas os agentes fazem o trabalho de fundo por você.',
          },
        },
        {
          '@type': 'Question',
          name: 'O que os agentes fazem exatamente?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Eles leem notícia e macroeconomia o tempo todo e resumem o que importa, checam a composição e a concentração da sua carteira, acham o risco escondido como correlação e baixa liquidez, calculam o caminho até a sua meta sob as suas premissas e monitoram mudanças, avisando quando algo se altera. Em todas as frentes, eles processam informação para que você decida melhor.',
          },
        },
        {
          '@type': 'Question',
          name: 'Os agentes prometem que vou ganhar dinheiro?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. A Redent.IA não promete retorno de nenhuma natureza e não dá recomendação personalizada de investimento. Os agentes são ferramenta de leitura, organização e educação, feitos para reduzir o trabalho de acompanhar o mercado e ampliar a sua capacidade de decidir, não para garantir ganho.',
          },
        },
        {
          '@type': 'Question',
          name: 'Por que ter os agentes é mais útil agora?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Porque o cenário está mudando rápido. Em 17 de junho de 2026 o Copom cortou a Selic para 14,25% ao ano, surpreendendo parte do mercado que esperava manutenção (Banco Central, 17/jun/2026). Em momentos assim, ter agentes que já leram o comunicado e cruzaram com a sua carteira economiza tempo e ajuda você a decidir com calma, em vez de reagir no susto à manchete.',
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
        { '@type': 'ListItem', position: 3, name: 'Seus Agentes', item: `${brand.url}/guias/seus-agentes` },
      ],
    },
  ],
})
</script>
