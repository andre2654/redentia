<template>
  <NuxtLayout name="default" title="Acompanhe seus Dividendos pela Redentia: Calendário de Proventos, Quanto Você Já Recebeu e Como Reinvestir">
    <section class="flex flex-col gap-8 px-6 py-8">
      <MoleculesPageHeader
        icon="i-lucide-calendar-clock"
        icon-color="secondary"
        title="Acompanhe seus Dividendos pela Redentia: Calendário de Proventos, Quanto Você Já Recebeu e Como Reinvestir"
        description="A Redentia reúne num lugar só o calendário de proventos dos seus ativos, com data-com e data de pagamento, o histórico de quanto cada ativo já te pagou e uma estimativa do yield da sua carteira. É ferramenta de organização e acompanhamento, útil na temporada de dividendos e JCP, sem recomendação e sem promessa de retorno."
      />

      <div class="flex flex-col gap-6">
        <p class="text-lg">
          A maioria dos investidores não sabe responder, de cabeça, quanto recebe de dividendo por mês. Não é falta de cuidado, é a natureza do provento: ele cai pingado, vem de vários ativos diferentes, em datas que não combinam entre si, e acaba se perdendo no meio do extrato. O resultado é que uma das partes mais importantes do retorno de longo prazo fica invisível justamente para quem deveria acompanhá-la de perto. A função de dividendos da Redentia existe para tornar essa informação visível e organizada, sem prometer nada além disso.
        </p>

        <p>
          A proposta é simples e propositalmente modesta. A Redentia junta num só lugar três coisas que normalmente vivem espalhadas: o calendário de proventos que estão por vir, o histórico do que cada ativo já te pagou e uma estimativa do yield da sua carteira com base no que você efetivamente tem. Com isso, você deixa de caçar comunicado por comunicado e passa a ver o fluxo de proventos de forma clara, o que ajuda a planejar o reinvestimento com calma em vez de no impulso.
        </p>

        <p>
          Esse tipo de organização ganha relevância agora, na temporada forte de proventos de 2026. A Petrobras, por exemplo, aprovou R$ 9 bilhões em juros sobre capital próprio referentes a 2026, com data-base em 1º de junho e pagamento parcelado em agosto e setembro (Petrobras, mai/2026). Quando vários proventos chegam em janelas próximas, ver tudo num calendário único faz diferença para não deixar dinheiro parado nem decidir no susto. Vale o lembrete de sempre: acompanhar provento é organização e educação, não recomendação, e nada aqui promete retorno.
        </p>

        <!-- 3 stats cards -->
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border p-5" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">JCP da Petrobras</p>
            <p class="text-3xl font-bold mb-1 text-secondary">R$ 9 bi</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">JCP aprovado referente a 2026, pago em ago e set (Petrobras, mai/2026)</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Datas que importam</p>
            <p class="text-3xl font-bold mb-1">2</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Data-com (direito ao provento) e data de pagamento (quando cai)</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Tipos de provento</p>
            <p class="text-3xl font-bold mb-1">3</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Dividendo, JCP e rendimento de fundo imobiliário</p>
          </div>
        </div>

        <h2>O problema: o dividendo cai pingado e some no extrato</h2>

        <p>
          O provento tem uma característica que dificulta o acompanhamento: ele é fragmentado por natureza. Uma carteira com dez ativos pode receber pagamentos em dez datas diferentes ao longo do mês, cada um com um valor pequeno, cada um com uma regra própria. No extrato da corretora, esses lançamentos aparecem misturados a aportes, vendas, taxas e tarifas. Para descobrir quanto entrou de dividendo no mês, o investidor precisaria filtrar e somar tudo na mão, e quase ninguém faz isso com regularidade.
        </p>

        <p>
          Há ainda a confusão entre os tipos de provento. Dividendo, juros sobre capital próprio e rendimento de fundo imobiliário são pagos de formas diferentes e têm tratamentos distintos. Sem uma visão organizada, fica difícil saber quanto do que você recebeu veio de cada fonte. Essa opacidade tem um custo silencioso: quando você não enxerga o fluxo de proventos, tende a subestimar essa parte do retorno e a tomar decisões de reinvestimento sem base, simplesmente deixando o dinheiro parado na conta.
        </p>

        <p>
          A organização saudável funciona ao contrário. Em vez de descobrir o provento depois que ele cai, você acompanha o calendário com antecedência, sabe quanto cada ativo costuma pagar e decide com calma o que fazer com o dinheiro que está por vir. É essa inversão, da reação para o planejamento, que a função de dividendos da Redentia tenta viabilizar.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          Dividendo que você não enxerga é retorno que você não planeja. Organizar o calendário é o primeiro passo para reinvestir com intenção.
        </blockquote>

        <h2>O calendário: data-com e data de pagamento num lugar só</h2>

        <p>
          Todo provento tem duas datas que importam, e confundi-las é um erro comum. A data-com é o último dia em que você precisa ter o ativo em carteira para ter direito ao provento. Quem compra a partir do dia seguinte, a chamada data-ex, não recebe aquele pagamento específico. A data de pagamento é quando o valor efetivamente cai na sua conta, normalmente algumas semanas ou meses depois. A Redentia organiza as duas num calendário só, para que você saiba tanto o prazo do direito quanto a expectativa de recebimento.
        </p>

        <p>
          O calendário também separa o tipo de cada provento. Dividendos são distribuídos a partir do lucro já tributado da empresa e chegam livres de imposto de renda para o investidor pessoa física. Juros sobre capital próprio, ou JCP, são uma forma alternativa de remuneração, com retenção de imposto na fonte. Rendimentos de fundos imobiliários seguem regras próprias e costumam ser mensais. Ver o tipo de cada pagamento ajuda a entender o que esperar de cada ativo, sem que isso seja recomendação de compra.
        </p>

        <h3>Acompanhar a data não é recomendação</h3>
        <p>
          Vale reforçar um limite: o calendário é uma ferramenta de organização, não uma estratégia de captura de dividendos nem uma sugestão de quando comprar ou vender. Comprar um ativo apenas para receber o próximo provento e vender em seguida raramente faz sentido, porque o preço tende a cair na data-ex em valor próximo ao do provento. A Redentia mostra as datas para você se organizar e planejar, não para induzir nenhuma operação de curto prazo.
        </p>

        <h2>Quanto recebi: o histórico e o yield da sua carteira</h2>

        <p>
          Além de olhar para a frente, a Redentia olha para trás. A função de histórico soma quanto cada ativo já te pagou ao longo do tempo, de modo que você consegue ver, ativo por ativo, qual parte da sua carteira tem efetivamente gerado renda. Esse retrato é útil para entender o comportamento dos seus investimentos sem depender da memória nem de planilhas manuais que quase sempre ficam desatualizadas.
        </p>

        <p>
          A partir desse histórico e da sua posição atual, a plataforma estima o yield da sua carteira, ou seja, quanto os proventos representam em relação ao valor investido. É importante ler esse número pelo que ele é: uma estimativa baseada no passado e na composição atual da carteira, não uma previsão do que você vai receber adiante. Empresas mudam de política de dividendos, fundos ajustam distribuições e o cenário macro muda, então yield histórico é um indicador de contexto, não uma promessa.
        </p>

        <h3>Dividendo e JCP separados</h3>
        <p>
          O histórico também distingue quanto veio de dividendo e quanto veio de JCP. Essa separação importa porque os dois têm tratamento tributário diferente: o dividendo chega líquido para a pessoa física, enquanto o JCP sofre retenção de imposto na fonte. Ter essa visão ajuda a entender o valor que de fato entrou na sua conta, sem confundir o anúncio bruto da empresa com o líquido que você recebeu.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          O yield da carteira é um retrato do passado, não uma promessa de futuro. Ele serve para entender o que você tem, não para garantir o que virá.
        </blockquote>

        <h2>Reinvestir: decidir com calma onde entra o provento</h2>

        <p>
          Receber o provento é só metade da história. A outra metade é decidir o que fazer com ele, e é aí que a organização faz mais diferença. Quando você vê no calendário que vários pagamentos estão por vir, consegue planejar com antecedência onde reinvestir, em vez de descobrir o dinheiro na conta e tomar uma decisão apressada ou simplesmente deixá-lo rendendo nada. Esse planejamento é especialmente relevante na temporada forte de proventos.
        </p>

        <p>
          Um exemplo concreto do momento: a Petrobras aprovou R$ 9 bilhões em juros sobre capital próprio referentes a 2026, com data-base em 1º de junho de 2026 e pagamento dividido em duas parcelas, em agosto e setembro (Petrobras, mai/2026). Para quem tem o ativo, isso significa um fluxo de caixa previsível chegando em datas conhecidas. Ver esse pagamento no calendário, ao lado dos outros proventos da carteira, permite planejar o destino do dinheiro antes que ele caia, sem improviso.
        </p>

        <p>
          A Redentia não recomenda onde reinvestir nem promete que o reinvestimento vai render mais. O que ela oferece é a visibilidade necessária para que essa decisão seja sua, tomada com calma e com base na sua própria carteira e nos seus objetivos. Reinvestir proventos de forma consciente é uma escolha de planejamento, e o papel da ferramenta é apenas reduzir o atrito e a desorganização que costumam atrapalhar essa escolha.
        </p>

        <h2>Limites e o que não esperar</h2>

        <p>
          É importante ser honesto sobre o que a função de dividendos não faz. Ela não prevê quanto você vai receber no futuro, não recomenda ativos por causa do dividendo e não promete retorno de nenhuma natureza. O calendário mostra datas, o histórico mostra o que já foi pago e o yield é uma estimativa baseada no passado e na composição atual da carteira. Política de dividendos muda, JCP depende de decisão da empresa e fundos imobiliários ajustam distribuições, então nada do que aparece ali deve ser lido como garantia. É uma ferramenta de organização, acompanhamento e educação, e não substitui o aconselhamento de um profissional para decisões que exijam orientação personalizada.
        </p>

        <h2>Perguntas Frequentes</h2>

        <h3>Qual a diferença entre data-com e data de pagamento?</h3>
        <p>
          A data-com é o último dia em que você precisa ter o ativo em carteira para ter direito ao provento. A data de pagamento é quando o valor efetivamente cai na sua conta, normalmente algumas semanas ou meses depois. A Redentia organiza as duas num calendário só, para você acompanhar tanto o prazo do direito quanto a expectativa de recebimento.
        </p>

        <h3>O yield que a Redentia mostra é uma promessa de quanto vou receber?</h3>
        <p>
          Não. O yield da carteira é uma estimativa baseada no histórico de proventos e na sua composição atual. Ele serve para entender o que a sua carteira tem gerado, não para prever o futuro. Empresas mudam a política de dividendos e o cenário muda, então o número é um indicador de contexto, não uma promessa de retorno.
        </p>

        <h3>Qual a diferença entre dividendo e JCP?</h3>
        <p>
          O dividendo é pago a partir do lucro já tributado da empresa e chega livre de imposto de renda para a pessoa física. O JCP, juros sobre capital próprio, é uma forma alternativa de remuneração que sofre retenção de imposto na fonte. A Redentia separa quanto veio de cada um no seu histórico, para você entender o valor líquido que de fato entrou.
        </p>

        <h3>Acompanhar o calendário significa que devo comprar o ativo antes da data-com?</h3>
        <p>
          Não. O calendário é uma ferramenta de organização, não uma sugestão de operação. Comprar só para receber o próximo provento e vender em seguida raramente faz sentido, porque o preço tende a cair na data-ex em valor próximo ao do provento. A Redentia mostra as datas para você se planejar, sem recomendar nenhuma compra ou venda.
        </p>

        <h3>Por que isso é mais útil agora?</h3>
        <p>
          Porque 2026 tem uma temporada forte de proventos. A Petrobras, por exemplo, aprovou R$ 9 bilhões em JCP referentes a 2026, com pagamento em agosto e setembro (Petrobras, mai/2026). Quando vários proventos chegam em janelas próximas, ver tudo num calendário único ajuda a planejar o reinvestimento com calma, sem deixar dinheiro parado nem decidir no impulso.
        </p>
      </div>

      <!-- CTA Redentia -->
      <div class="rounded-2xl border p-6 md:p-8" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
        <h3 class="mb-3">Acompanhe seus dividendos num lugar só</h3>
        <p class="mb-5" :style="{ color: 'var(--brand-text-muted)' }">
          A {{ brand.name }} reúne o calendário de proventos, o histórico de quanto cada ativo já te pagou e o yield estimado da sua carteira, para você planejar o reinvestimento com calma. Ferramenta de organização e acompanhamento, sem promessa de retorno.
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
          <NuxtLink to="/guias/calculadora-de-dividendos" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-calculator" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Calculadora de Dividendos</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">Simule a renda passiva da sua carteira</p>
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
  title: `Acompanhe seus Dividendos pela Redentia: Calendário de Proventos, Histórico e Yield | ${brand.name}`,
  description:
    'A Redentia reúne num lugar só o calendário de proventos com data-com e data de pagamento, o histórico de quanto cada ativo já te pagou e uma estimativa do yield da sua carteira. Útil na temporada de dividendos e JCP de 2026, é ferramenta de organização e acompanhamento, sem recomendação e sem promessa de retorno.',
  path: '/guias/dividendos',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Acompanhe seus Dividendos pela Redentia: Calendário de Proventos, Quanto Você Já Recebeu e Como Reinvestir',
      description:
        'Guia sobre a função de dividendos da Redentia. Explica o calendário de proventos com data-com e data de pagamento, o histórico de quanto cada ativo já pagou, a estimativa de yield da carteira e como planejar o reinvestimento, com foco em organização e acompanhamento, sem recomendação e sem promessa de retorno.',
      author: { '@type': 'Organization', name: brand.name },
      publisher: {
        '@type': 'Organization',
        name: brand.name,
        logo: { '@type': 'ImageObject', url: `${brand.url}/512x512.png` },
      },
      datePublished: '2026-06-16',
      dateModified: '2026-06-16',
      articleSection: 'Guia Redentia',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Qual a diferença entre data-com e data de pagamento?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A data-com é o último dia em que você precisa ter o ativo em carteira para ter direito ao provento. A data de pagamento é quando o valor efetivamente cai na sua conta, normalmente algumas semanas ou meses depois. A Redentia organiza as duas num calendário só, para você acompanhar tanto o prazo do direito quanto a expectativa de recebimento.',
          },
        },
        {
          '@type': 'Question',
          name: 'O yield que a Redentia mostra é uma promessa de quanto vou receber?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. O yield da carteira é uma estimativa baseada no histórico de proventos e na sua composição atual. Ele serve para entender o que a sua carteira tem gerado, não para prever o futuro. Empresas mudam a política de dividendos e o cenário muda, então o número é um indicador de contexto, não uma promessa de retorno.',
          },
        },
        {
          '@type': 'Question',
          name: 'Qual a diferença entre dividendo e JCP?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'O dividendo é pago a partir do lucro já tributado da empresa e chega livre de imposto de renda para a pessoa física. O JCP, juros sobre capital próprio, é uma forma alternativa de remuneração que sofre retenção de imposto na fonte. A Redentia separa quanto veio de cada um no seu histórico, para você entender o valor líquido que de fato entrou.',
          },
        },
        {
          '@type': 'Question',
          name: 'Acompanhar o calendário significa que devo comprar o ativo antes da data-com?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. O calendário é uma ferramenta de organização, não uma sugestão de operação. Comprar só para receber o próximo provento e vender em seguida raramente faz sentido, porque o preço tende a cair na data-ex em valor próximo ao do provento. A Redentia mostra as datas para você se planejar, sem recomendar nenhuma compra ou venda.',
          },
        },
        {
          '@type': 'Question',
          name: 'Por que acompanhar dividendos é mais útil agora?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Porque 2026 tem uma temporada forte de proventos. A Petrobras, por exemplo, aprovou R$ 9 bilhões em JCP referentes a 2026, com pagamento em agosto e setembro (Petrobras, mai/2026). Quando vários proventos chegam em janelas próximas, ver tudo num calendário único ajuda a planejar o reinvestimento com calma, sem deixar dinheiro parado nem decidir no impulso.',
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
        { '@type': 'ListItem', position: 3, name: 'Dividendos', item: `${brand.url}/guias/dividendos` },
      ],
    },
  ],
})
</script>
