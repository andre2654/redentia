<template>
  <NuxtLayout name="default" title="Tesouro Direto pela Redentia: Entenda, Compare e Acompanhe Selic, IPCA+ e Prefixado">
    <section class="flex flex-col gap-8 px-6 py-8">
      <MoleculesPageHeader
        icon="i-lucide-landmark"
        icon-color="secondary"
        title="Tesouro Direto pela Redentia: Entenda, Compare e Acompanhe Selic, IPCA+ e Prefixado"
        description="A Redentia ajuda o investidor a entender, comparar e acompanhar os títulos do Tesouro Direto. Mostra a taxa atual de cada vencimento, simula quanto rende, explica a marcação a mercado e liga cada título a um objetivo, reserva, aposentadoria ou meta com data. É uma ferramenta de comparação e educação, não uma recomendação, e não promete retorno."
      />

      <div class="flex flex-col gap-6">
        <p class="text-lg">
          O Tesouro Direto é a porta de entrada da renda fixa para a maior parte dos brasileiros. Em abril de 2026 o programa já passava de 35,3 milhões de investidores cadastrados, com um estoque de cerca de R$ 242 bilhões em títulos públicos, segundo o Tesouro Nacional. A facilidade de começar com pouco, porém, esconde uma decisão que muita gente toma no escuro: qual título comprar. Selic, IPCA+ ou Prefixado não são versões melhores ou piores do mesmo produto, são lógicas diferentes, e cada uma combina com um objetivo e um prazo.
        </p>

        <p>
          A Redentia entra exatamente nessa decisão. Em vez de listar produto solto, a plataforma mostra a taxa atual de cada vencimento, simula quanto cada título renderia para um aporte e um prazo, explica o que é marcação a mercado e conecta o título ao objetivo de quem está investindo. O enquadramento é claro e proposital: é comparação e educação, não recomendação. A Redentia não diz qual título você deve comprar e não promete retorno.
        </p>

        <!-- 3 stats cards -->
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Tesouro IPCA+</p>
            <p class="text-3xl font-bold mb-1">~8% a.a.</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Juro real acima da inflação em alguns vencimentos (Tesouro Direto, jun/2026)</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Prefixado</p>
            <p class="text-3xl font-bold mb-1 text-secondary">~14% a.a.</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Taxa travada em alguns vencimentos no momento da compra (Tesouro Direto, jun/2026)</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Adoção</p>
            <p class="text-3xl font-bold mb-1">35,3 mi</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Investidores cadastrados no Tesouro Direto (Tesouro Nacional, abr/2026)</p>
          </div>
        </div>

        <h2>Por que escolher o título certo importa</h2>

        <p>
          A maior parte das ferramentas mostra a lista de títulos disponíveis e a taxa de cada um, e para por aí. O problema é que a taxa, sozinha, não responde a pergunta que importa: esse título serve para o que eu quero fazer com esse dinheiro? Um Prefixado de 14% ao ano parece sempre melhor que um Selic que segue a taxa básica, até você precisar do dinheiro antes do vencimento e descobrir que o valor que vai receber não é o que estava na tela. A escolha errada não costuma destruir patrimônio, mas frequentemente entrega frustração e decisões precipitadas.
        </p>

        <p>
          O investidor que entende a lógica de cada família de título decide com mais tranquilidade. Sabe que existe um trade-off entre travar uma taxa alta e manter liquidez, entre proteger o poder de compra contra a inflação e ter previsibilidade nominal. A Redentia organiza essa comparação num lugar só, com a taxa atualizada de cada vencimento, para que a decisão seja consciente e não pela manchete do dia.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          Não existe o melhor título do Tesouro. Existe o que combina com o seu objetivo e com o seu prazo.
        </blockquote>

        <h2>Os três tipos, três lógicas diferentes</h2>

        <p>
          O Tesouro Direto se organiza em três grandes famílias, cada uma com um mecanismo de remuneração próprio. Entender a lógica de cada uma é mais útil do que decorar a taxa do dia.
        </p>

        <h3>1. Tesouro Selic, pós-fixado e líquido</h3>
        <p>
          O Tesouro Selic acompanha a taxa básica de juros da economia. Como o preço dele oscila pouco no caminho, é o título com menor risco de marcação a mercado, e por isso costuma ser associado à reserva de emergência e a objetivos de curto prazo. Ele tem liquidez diária: você pode resgatar a qualquer momento sem sustos relevantes de preço. Em troca dessa estabilidade, a rentabilidade fica colada na Selic, ou seja, sobe quando os juros sobem e cai quando os juros caem.
        </p>

        <h3>2. Tesouro IPCA+, proteção contra a inflação</h3>
        <p>
          O Tesouro IPCA+ paga a variação da inflação medida pelo IPCA mais uma taxa de juro real definida na compra. Em junho de 2026, alguns vencimentos ofereciam juro real perto de 8% ao ano acima da inflação, segundo dados do Tesouro Direto. Por garantir poder de compra ao longo de prazos longos, costuma ser associado a objetivos como aposentadoria. Existe ainda a linha RendA+, voltada justamente para complementar a aposentadoria com pagamentos mensais. A contrapartida é que, no meio do caminho, esse título oscila bastante de preço.
        </p>

        <h3>3. Tesouro Prefixado, taxa travada</h3>
        <p>
          O Tesouro Prefixado define uma taxa fixa no momento da compra. Em junho de 2026, alguns vencimentos chegavam a oferecer mais de 14% ao ano, segundo o Tesouro Direto. A grande vantagem é a previsibilidade nominal: se você levar o título até o vencimento, sabe exatamente quanto vai receber. Por isso ele tende a combinar com metas que têm data fechada. O risco é o mesmo dos demais: vender antes do prazo significa aceitar o preço de mercado do dia, que pode ser maior ou menor do que o contratado.
        </p>

        <p>
          Um detalhe que vale repetir: a taxa de todos os títulos muda todo dia útil, conforme as condições de mercado. A Redentia mostra a taxa atual de cada vencimento para que a comparação seja feita com o número de hoje, não com um valor desatualizado.
        </p>

        <h2>Marcação a mercado, o que assusta quem não conhece</h2>

        <p>
          Marcação a mercado é o nome do mecanismo que faz o valor do seu título oscilar todos os dias antes do vencimento. É a fonte da maior parte dos sustos de quem investe no Tesouro Direto e acha que renda fixa significa valor parado. Não significa.
        </p>

        <p>
          A intuição é a seguinte: quando os juros de mercado sobem, os títulos antigos, que pagam taxas mais baixas, ficam menos atraentes, e o preço deles cai para quem quiser vender naquele momento. Quando os juros caem, acontece o contrário. Esse efeito é mais forte nos títulos de prazo longo, como o IPCA+ 2045, e quase imperceptível no Tesouro Selic. O ponto central é que essa oscilação só importa se você vender antes do vencimento. Quem segura o título até o final recebe exatamente o retorno contratado na compra, IPCA mais o juro real, ou a taxa prefixada, conforme o caso.
        </p>

        <p>
          A Redentia mostra essa oscilação de forma transparente, justamente para que ela não vire motivo de pânico. Ver o preço subir e descer faz parte de carregar um título longo, e entender o porquê é o que separa a decisão consciente da venda no susto. Vale lembrar que isso é descrição de como o mecanismo funciona, não previsão sobre para onde os juros vão.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          O preço oscila no caminho. O retorno contratado só é honrado no vencimento.
        </blockquote>

        <h2>Qual título usar para cada objetivo</h2>

        <p>
          A pergunta certa não é qual título rende mais, e sim qual título combina com o que você quer fazer. A Redentia liga objetivo e título para tornar a comparação concreta. Os exemplos abaixo são pontos de partida para comparar, não recomendações.
        </p>

        <ul>
          <li><strong>Reserva de emergência:</strong> o Tesouro Selic costuma ser o ponto de partida natural, pela liquidez diária e pela baixa oscilação de preço. É o dinheiro que precisa estar disponível a qualquer momento.</li>
          <li><strong>Aposentadoria e prazos longos:</strong> o Tesouro IPCA+ e a linha RendA+ entram na conversa por protegerem o poder de compra ao longo de décadas. O foco é manter o valor real, não acertar o melhor momento.</li>
          <li><strong>Meta com data fechada:</strong> um Prefixado com vencimento próximo da data da meta dá previsibilidade nominal, desde que você carregue o título até o fim.</li>
          <li><strong>A decisão é sua:</strong> a Redentia explica o trade-off de cada escolha, mas quem decide é você. Nada aqui garante retorno.</li>
        </ul>

        <p>
          Para cada um desses caminhos, a plataforma simula quanto o título renderia dado um aporte e um prazo, usando a taxa atual, e mostra lado a lado as alternativas. O objetivo é que você compare com clareza, entendendo o que está abrindo mão em cada escolha.
        </p>

        <h2>Limites e responsabilidade</h2>

        <p>
          A Redentia é uma ferramenta de comparação e educação sobre o Tesouro Direto. Ela mostra taxas, simula cenários e explica como cada título funciona, mas não emite recomendação de compra de um título específico e não promete retorno. As taxas citadas mudam todos os dias úteis e foram registradas em junho de 2026, conforme o Tesouro Direto, servindo de referência de patamar, não de garantia. Simulações usam premissas explícitas e não preveem o futuro dos juros ou da inflação. A decisão final é sempre do investidor.
        </p>

        <h2>Perguntas Frequentes</h2>

        <h3>Qual é o melhor título do Tesouro Direto?</h3>
        <p>
          Não existe um melhor título de forma absoluta. Selic, IPCA+ e Prefixado têm lógicas diferentes e cada um combina com um objetivo e um prazo. O Tesouro Selic costuma ser associado à reserva de emergência, o IPCA+ a prazos longos como aposentadoria e o Prefixado a metas com data fechada. A Redentia ajuda a comparar, mas não recomenda um título específico nem promete retorno.
        </p>

        <h3>O que é marcação a mercado no Tesouro Direto?</h3>
        <p>
          É o mecanismo que faz o preço do título oscilar todos os dias antes do vencimento, conforme os juros de mercado. Quando os juros sobem, o preço de quem vende antes tende a cair, e o contrário acontece quando os juros caem. Essa oscilação só importa se você vender antes do prazo. Quem carrega o título até o vencimento recebe o retorno contratado na compra.
        </p>

        <h3>Posso perder dinheiro no Tesouro Direto?</h3>
        <p>
          Se você vender um título antes do vencimento, pode receber um valor menor do que pagou, por causa da marcação a mercado, especialmente em títulos longos. Se carregar até o vencimento, recebe o retorno contratado. O Tesouro Selic é o que menos oscila no caminho. Entender esse mecanismo é o que evita vender no susto. Nada nesta página garante retorno.
        </p>

        <h3>As taxas mostradas pela Redentia são fixas?</h3>
        <p>
          Não. A taxa de cada título muda todos os dias úteis conforme as condições de mercado. A Redentia mostra a taxa atual de cada vencimento para que a comparação seja feita com o número de hoje. As taxas citadas nesta página foram registradas em junho de 2026, segundo o Tesouro Direto, e servem de referência de patamar.
        </p>

        <h3>A Redentia recomenda qual título comprar?</h3>
        <p>
          Não. A Redentia é uma ferramenta de comparação e educação. Ela mostra a taxa de cada vencimento, simula quanto renderia e liga o título ao objetivo, mas não emite recomendação de compra de um título específico e não promete retorno. A decisão é sempre do investidor.
        </p>
      </div>

      <!-- CTA Redentia -->
      <div class="rounded-2xl border p-6 md:p-8" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
        <h3 class="mb-3">Compare os títulos do Tesouro na Redentia</h3>
        <p class="mb-5" :style="{ color: 'var(--brand-text-muted)' }">
          A {{ brand.name }} mostra a taxa atual de cada vencimento, simula quanto rende e explica a marcação a mercado, ligando cada título ao seu objetivo. Ferramenta de comparação e educação, sem promessa de retorno.
        </p>
        <div class="flex flex-wrap gap-3">
          <NuxtLink to="/tesouro-direto" class="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 font-medium text-background hover:opacity-90 transition-opacity">
            <UIcon name="i-lucide-landmark" class="size-5" /> Comparar títulos do Tesouro
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
          <NuxtLink to="/guias/poupanca-vs-tesouro-ipca-mais-2026" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-piggy-bank" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Poupança vs Tesouro IPCA+ em 2026</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">A comparação que muda a reserva</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>
          <NuxtLink to="/guias/pergunte-redentia" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-message-circle-question" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Pergunte pra Redent.IA</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">Tire dúvidas sobre Tesouro em linguagem natural</p>
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
  title: `Tesouro Direto pela Redentia: Compare Selic, IPCA+ e Prefixado | ${brand.name}`,
  description:
    'Entenda, compare e acompanhe os títulos do Tesouro Direto pela Redentia. Veja a taxa atual de cada vencimento, simule quanto rende, entenda a marcação a mercado e descubra qual título combina com reserva, aposentadoria ou meta. Tesouro IPCA+ perto de 8% ao ano e Prefixado acima de 14% ao ano em alguns vencimentos (Tesouro Direto, jun/2026). Ferramenta de comparação e educação, sem promessa de retorno.',
  path: '/guias/tesouro-redentia',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Tesouro Direto pela Redentia: Entenda, Compare e Acompanhe Selic, IPCA+ e Prefixado',
      description:
        'Guia sobre como a Redentia ajuda o investidor a entender, comparar e acompanhar os títulos do Tesouro Direto. Mostra a taxa atual de cada vencimento, simula quanto rende, explica a marcação a mercado e liga cada título a um objetivo. Ferramenta de comparação e educação, sem recomendação e sem promessa de retorno.',
      author: { '@type': 'Organization', name: brand.name },
      publisher: {
        '@type': 'Organization',
        name: brand.name,
        logo: { '@type': 'ImageObject', url: `${brand.url}/512x512.png` },
      },
      datePublished: '2026-06-10',
      dateModified: '2026-06-10',
      articleSection: 'Guia Redentia',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Qual é o melhor título do Tesouro Direto?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não existe um melhor título de forma absoluta. Selic, IPCA+ e Prefixado têm lógicas diferentes e cada um combina com um objetivo e um prazo. O Tesouro Selic costuma ser associado à reserva de emergência, o IPCA+ a prazos longos como aposentadoria e o Prefixado a metas com data fechada. A Redentia ajuda a comparar, mas não recomenda um título específico nem promete retorno.',
          },
        },
        {
          '@type': 'Question',
          name: 'O que é marcação a mercado no Tesouro Direto?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'É o mecanismo que faz o preço do título oscilar todos os dias antes do vencimento, conforme os juros de mercado. Quando os juros sobem, o preço de quem vende antes tende a cair, e o contrário acontece quando os juros caem. Essa oscilação só importa se você vender antes do prazo. Quem carrega o título até o vencimento recebe o retorno contratado na compra.',
          },
        },
        {
          '@type': 'Question',
          name: 'Posso perder dinheiro no Tesouro Direto?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Se você vender um título antes do vencimento, pode receber um valor menor do que pagou, por causa da marcação a mercado, especialmente em títulos longos. Se carregar até o vencimento, recebe o retorno contratado. O Tesouro Selic é o que menos oscila no caminho. Entender esse mecanismo é o que evita vender no susto.',
          },
        },
        {
          '@type': 'Question',
          name: 'As taxas mostradas pela Redentia são fixas?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. A taxa de cada título muda todos os dias úteis conforme as condições de mercado. A Redentia mostra a taxa atual de cada vencimento para que a comparação seja feita com o número de hoje. As taxas citadas nesta página foram registradas em junho de 2026, segundo o Tesouro Direto, e servem de referência de patamar.',
          },
        },
        {
          '@type': 'Question',
          name: 'A Redentia recomenda qual título comprar?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. A Redentia é uma ferramenta de comparação e educação. Ela mostra a taxa de cada vencimento, simula quanto renderia e liga o título ao objetivo, mas não emite recomendação de compra de um título específico e não promete retorno. A decisão é sempre do investidor.',
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
        { '@type': 'ListItem', position: 3, name: 'Tesouro Direto pela Redentia', item: `${brand.url}/guias/tesouro-redentia` },
      ],
    },
  ],
})
</script>
