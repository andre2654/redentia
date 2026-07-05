<template>
  <NuxtLayout name="default" title="Alertas e Watchlist pela Redentia: Acompanhe os Ativos sem Ficar Grudado na Tela">
    <section class="flex flex-col gap-8 px-6 py-8">
      <MoleculesPageHeader
        icon="i-lucide-bell-ring"
        icon-color="secondary"
        title="Alertas e Watchlist pela Redentia: Acompanhe os Ativos sem Ficar Grudado na Tela"
        description="A Watchlist é a sua lista de acompanhamento, onde você reúne numa tela só os ativos que estuda ou já tem. Os Alertas avisam quando uma condição que você definiu acontece: preço-alvo, variação no dia, anúncio de dividendo ou vencimento de Tesouro. É ferramenta de organização e acompanhamento, não recomendação, e não promete retorno."
      />

      <div class="flex flex-col gap-6">
        <p class="text-lg">
          Acompanhar o mercado virou sinônimo de abrir o app dez vezes por dia pra checar cotação. Esse hábito não é cuidado, é ansiedade, e costuma piorar a decisão em vez de melhorar. Quem fica vigiando a tela tende a reagir a cada oscilação de curto prazo, justamente quando o silêncio seria mais útil. A Watchlist e os Alertas da Redentia existem pra inverter essa lógica: em vez de você caçar a informação, a informação chega até você no momento que importa.
        </p>

        <p>
          A ideia é simples e propositalmente modesta. Você monta uma lista dos ativos que acompanha e define gatilhos de aviso para eles. A partir daí, a plataforma observa por você e dispara uma notificação quando a condição que você escolheu acontece. Você não precisa estar na tela, não precisa lembrar de checar e não precisa transformar o acompanhamento numa rotina de vigilância. É organização, não palpite.
        </p>

        <p>
          Esse tipo de ferramenta ganha relevância num momento de mercado mais nervoso. Em 2026, a Selic está em 14,50% ao ano (Copom, abr/2026), num cenário de inflação acelerando e tensão geopolítica no exterior. Volatilidade alta cansa quem fica grudado na cotação e aumenta o risco de decisão no impulso. O alerta troca a vigília constante por um aviso pontual, deixando você acompanhar com mais calma.
        </p>

        <!-- 3 stats cards -->
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Selic atual</p>
            <p class="text-3xl font-bold mb-1">14,50%</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Taxa básica ao ano em cenário volátil (Copom, abr/2026)</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Tipos de gatilho</p>
            <p class="text-3xl font-bold mb-1 text-secondary">4</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Preço-alvo, variação %, dividendo e vencimento de Tesouro</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Base de investidores</p>
            <p class="text-3xl font-bold mb-1">5,5 mi</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Investidores em renda variável na B3 (B3, início/2026)</p>
          </div>
        </div>

        <h2>O problema: acompanhar virou checar cotação o dia todo</h2>

        <p>
          A maioria das ferramentas financeiras é boa em mostrar dado e ruim em respeitar o seu tempo. O app do banco mostra saldo, a corretora mostra cotação em tempo real, o portal de notícias mostra manchete. O resultado é um convite implícito a olhar tudo o tempo todo, com medo de perder alguma coisa. Esse comportamento tem nome no mercado: o investidor que monitora demais tende a operar demais, e operar demais costuma corroer o resultado de longo prazo.
        </p>

        <p>
          O problema se agrava em fases voláteis. Quando o preço oscila bastante num único dia, cada abertura do app traz um número diferente, e a tentação de reagir a cada movimento cresce. Você acaba decidindo no impulso, vendendo na baixa ou comprando na euforia, exatamente o oposto do que um plano de longo prazo recomendaria. A causa raiz não é falta de informação, é excesso de exposição à informação no momento errado.
        </p>

        <p>
          O acompanhamento saudável funciona ao contrário. Você define com antecedência, e com a cabeça fria, em que condições faz sentido olhar de novo. Enquanto essas condições não acontecem, você não precisa fazer nada. Quando acontecem, você é avisado. É essa inversão que a Watchlist e os Alertas tentam viabilizar.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          Acompanhar não é checar a cada minuto. É decidir com calma o que merece a sua atenção e deixar o resto em silêncio.
        </blockquote>

        <h2>A Watchlist: uma lista dos ativos que importam</h2>

        <p>
          A Watchlist é a sua lista de acompanhamento. Você escolhe os ativos que quer seguir, ações, fundos imobiliários e títulos do Tesouro, e eles ficam reunidos numa tela só. É uma forma de separar o que realmente interessa pra você do ruído do mercado inteiro. Adicionar um ativo à lista não tem nada a ver com compra: é só dizer "isso aqui eu quero ver de perto".
        </p>

        <p>
          Na prática, a watchlist costuma reunir três grupos de ativos. Primeiro, os que você estuda e ainda não comprou, para observar o comportamento antes de qualquer decisão. Segundo, os títulos do Tesouro que você pensa em incluir na carteira, para comparar taxa e prazo ao longo do tempo. Terceiro, os ativos que você já tem, agrupados ali para olhar todos juntos sem precisar caçar posição por posição.
        </p>

        <h3>Acompanhar não é recomendação</h3>
        <p>
          Vale reforçar um limite importante: a watchlist é uma ferramenta de organização, não uma lista de sugestões da Redentia. O que entra ali é escolha sua. A plataforma não recomenda ativos específicos, não promete retorno e não transforma a sua lista numa ordem de compra. Ela apenas organiza a informação dos ativos que você decidiu acompanhar, para que você os veja de forma clara e centralizada.
        </p>

        <h2>Os Alertas: o app avisa, você não fica vigiando</h2>

        <p>
          Um alerta é um aviso que dispara quando uma condição que você definiu acontece. Você escolhe o gatilho com antecedência e a Redentia observa por você. Quando a condição se cumpre, chega uma notificação. Enquanto ela não se cumpre, você não precisa fazer nada nem abrir o app. É essa a troca: vigília constante por aviso pontual.
        </p>

        <h3>Preço-alvo</h3>
        <p>
          Você marca um valor para um ativo e o alerta dispara quando ele chega nesse preço. Serve para quem está esperando um ponto de entrada ou apenas quer ser avisado de um movimento relevante, sem precisar checar a cotação várias vezes ao dia. O alerta não diz se você deve comprar ou vender, ele só avisa que o número que você definiu foi atingido.
        </p>

        <h3>Variação percentual</h3>
        <p>
          Em vez de um valor fixo, você define uma variação no dia, uma alta ou queda em porcentagem. O alerta dispara quando o ativo se move além desse limite. É útil em dias agitados, quando um movimento forte pode merecer a sua atenção, sem que você precise acompanhar todas as oscilações menores que não mudam nada.
        </p>

        <h3>Dividendos e proventos</h3>
        <p>
          Para quem acompanha renda de ações e fundos imobiliários, o alerta de dividendo avisa quando um provento é anunciado. Assim você fica por dentro dos pagamentos dos ativos que segue sem precisar caçar comunicado por comunicado. É informação útil para organizar o fluxo de proventos, não uma promessa de quanto você vai receber.
        </p>

        <h3>Vencimento de Tesouro</h3>
        <p>
          Títulos do Tesouro Direto têm data de vencimento, e perder essa data de vista é mais comum do que parece. O alerta de vencimento avisa quando a data se aproxima, ajudando você a planejar o reinvestimento ou o uso do dinheiro com antecedência. É um lembrete de calendário, simples e prático, para que o vencimento não te pegue de surpresa.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          O melhor acompanhamento é aquele que você define uma vez, com calma, e que depois trabalha sozinho enquanto você vive a sua vida.
        </blockquote>

        <h2>Quando usar: útil quando o mercado fica nervoso</h2>

        <p>
          Watchlist e Alertas são úteis o tempo todo, mas brilham especialmente em fases de volatilidade. Em 2026, o Brasil convive com juros altos, a Selic está em 14,50% ao ano (Copom, abr/2026), inflação acelerando e tensão geopolítica no exterior. Esse pano de fundo faz o preço dos ativos oscilar mais, e oscilação maior aumenta a tentação de reagir a cada movimento.
        </p>

        <p>
          É justamente nesse cenário que o acompanhamento organizado mais ajuda. Em vez de abrir o app por impulso e tomar decisões no calor do momento, você define antes em que condições vale a pena olhar de novo. O alerta vira um filtro: ele separa o ruído diário do que de fato corresponde ao que você considera relevante. Você acompanha o mercado sem deixar que ele dite o seu humor.
        </p>

        <p>
          A base de investidores brasileiros cresceu e amadureceu nos últimos anos. A B3 reúne cerca de 5,5 milhões de investidores em renda variável (B3, início/2026), muitos deles ainda construindo o hábito de acompanhar a carteira sem se deixar levar pela ansiedade do dia a dia. Ferramentas de organização como watchlist e alertas existem para apoiar esse amadurecimento, transformando o acompanhamento em algo planejado em vez de reativo.
        </p>

        <h2>Limites e o que não esperar</h2>

        <p>
          É importante ser honesto sobre o que essas ferramentas não fazem. Um alerta não prevê o futuro do preço, não diz se você deve comprar ou vender e não promete retorno. Ele apenas avisa que uma condição definida por você aconteceu. A watchlist não é uma carteira recomendada nem uma lista de dicas, é a sua própria seleção de ativos para acompanhar. E nenhuma das duas substitui um plano de investimentos ou o acompanhamento de um profissional para decisões que exigem aconselhamento personalizado. São ferramentas de organização e atenção, nada além disso.
        </p>

        <h2>Perguntas Frequentes</h2>

        <h3>Adicionar um ativo à watchlist significa que eu comprei?</h3>
        <p>
          Não. A watchlist é apenas a sua lista de acompanhamento. Adicionar um ativo significa que você quer vê-lo de perto, não que você o comprou nem que a Redentia está recomendando que você compre. É uma ferramenta de organização, sem qualquer ordem ou sugestão de compra.
        </p>

        <h3>Quais tipos de alerta a Redentia oferece?</h3>
        <p>
          Você pode criar alertas de preço-alvo (quando o ativo chega num valor que você marcou), de variação percentual no dia (uma alta ou queda que você define), de dividendo (quando um provento é anunciado) e de vencimento de Tesouro (para não perder a data). Em todos os casos, o gatilho é definido por você e o aviso chega quando a condição acontece.
        </p>

        <h3>O alerta me diz o que comprar ou vender?</h3>
        <p>
          Não. O alerta só avisa que a condição que você definiu aconteceu, por exemplo, que o ativo chegou no preço marcado. Ele não emite recomendação de compra ou venda, não prevê o que vai acontecer e não promete retorno. A decisão é sempre sua.
        </p>

        <h3>Por que isso é mais útil num momento volátil?</h3>
        <p>
          Em fases de juros altos e tensão geopolítica, como o cenário de 2026 com a Selic em 14,50% ao ano (Copom, abr/2026), o preço oscila mais e ficar checando o app cansa e aumenta o risco de decisão no impulso. O alerta troca a vigília constante por um aviso pontual, ajudando você a acompanhar com mais calma.
        </p>

        <h3>Preciso ficar com o app aberto para receber os avisos?</h3>
        <p>
          Não. A ideia é justamente o contrário. Você define o gatilho uma vez e a Redentia observa por você. O aviso chega quando a condição acontece, para que você não precise abrir o app o tempo todo nem ficar grudado na tela.
        </p>
      </div>

      <!-- CTA Redentia -->
      <div class="rounded-2xl border p-6 md:p-8" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
        <h3 class="mb-3">Monte sua watchlist e crie seus alertas</h3>
        <p class="mb-5" :style="{ color: 'var(--brand-text-muted)' }">
          A {{ brand.name }} deixa você reunir os ativos que acompanha numa lista só e ser avisado quando o preço-alvo, a variação, um dividendo ou um vencimento de Tesouro acontece. Ferramenta de organização e acompanhamento, sem promessa de retorno.
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
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">O copiloto que responde sobre a sua carteira</p>
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
  title: `Alertas e Watchlist pela Redentia: Acompanhe sem Ficar Grudado na Tela | ${brand.name}`,
  description:
    'A Watchlist da Redentia reúne os ativos que você acompanha numa lista só, e os Alertas avisam quando uma condição que você definiu acontece: preço-alvo, variação no dia, dividendo anunciado ou vencimento de Tesouro. Ferramenta de organização e acompanhamento, útil em mercado volátil, sem recomendação e sem promessa de retorno.',
  path: '/guias/alertas-watchlist',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Alertas e Watchlist pela Redentia: Acompanhe os Ativos sem Ficar Grudado na Tela',
      description:
        'Guia sobre a Watchlist e os Alertas da Redentia. Explica como montar uma lista de acompanhamento de ações, fundos imobiliários e títulos do Tesouro e como criar alertas de preço-alvo, variação percentual, dividendos e vencimento de Tesouro, com foco em organização e acompanhamento, sem recomendação e sem promessa de retorno.',
      author: { '@type': 'Organization', name: brand.name },
      publisher: {
        '@type': 'Organization',
        name: brand.name,
        logo: { '@type': 'ImageObject', url: `${brand.url}/512x512.png` },
      },
      datePublished: '2026-06-11',
      dateModified: '2026-06-11',
      articleSection: 'Guia Redentia',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Adicionar um ativo à watchlist significa que eu comprei?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. A watchlist é apenas a sua lista de acompanhamento. Adicionar um ativo significa que você quer vê-lo de perto, não que você o comprou nem que a Redentia está recomendando que você compre. É uma ferramenta de organização, sem qualquer ordem ou sugestão de compra.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quais tipos de alerta a Redentia oferece?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Você pode criar alertas de preço-alvo (quando o ativo chega num valor que você marcou), de variação percentual no dia (uma alta ou queda que você define), de dividendo (quando um provento é anunciado) e de vencimento de Tesouro (para não perder a data). Em todos os casos, o gatilho é definido por você e o aviso chega quando a condição acontece.',
          },
        },
        {
          '@type': 'Question',
          name: 'O alerta me diz o que comprar ou vender?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. O alerta só avisa que a condição que você definiu aconteceu, por exemplo, que o ativo chegou no preço marcado. Ele não emite recomendação de compra ou venda, não prevê o que vai acontecer e não promete retorno. A decisão é sempre sua.',
          },
        },
        {
          '@type': 'Question',
          name: 'Por que isso é mais útil num momento volátil?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Em fases de juros altos e tensão geopolítica, como o cenário de 2026 com a Selic em 14,50% ao ano (Copom, abr/2026), o preço oscila mais e ficar checando o app cansa e aumenta o risco de decisão no impulso. O alerta troca a vigília constante por um aviso pontual, ajudando você a acompanhar com mais calma.',
          },
        },
        {
          '@type': 'Question',
          name: 'Preciso ficar com o app aberto para receber os avisos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. Você define o gatilho uma vez e a Redentia observa por você. O aviso chega quando a condição acontece, para que você não precise abrir o app o tempo todo nem ficar grudado na tela.',
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
        { '@type': 'ListItem', position: 3, name: 'Alertas e Watchlist', item: `${brand.url}/guias/alertas-watchlist` },
      ],
    },
  ],
})
</script>
