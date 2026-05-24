<template>
  <NuxtLayout name="default" title="Open Finance: Sua Carteira Ainda Está Espalhada?">
    <section class="flex flex-col gap-8 px-6 py-8">
      <MoleculesPageHeader
        icon="i-lucide-network"
        icon-color="secondary"
        title="Open Finance: Sua Carteira Ainda Está Espalhada?"
        description="O Open Finance brasileiro completou 5 anos em 2026 e tem 100 milhões de clientes conectados. Mesmo assim, a maioria dos investidores PF ainda mantém conta em um banco, investimentos em outra corretora e usa planilha pra juntar tudo. Entenda como o Open Finance resolve isso e por que a Redentia consolida sua carteira em 2 minutos."
      />

      <div class="flex flex-col gap-6">
        <p class="text-lg">
          Em maio de 2026, o Open Finance brasileiro reúne mais de 100 milhões de clientes conectados, com 154 milhões de consentimentos ativos, segundo o Banco Central. É o sistema de compartilhamento de dados financeiros mais completo do mundo, e ainda assim, 8 em cada 10 investidores pessoa física continuam consultando carteira em planilha de Excel.
        </p>

        <p>
          O problema não é tecnologia. É inércia. Cada produto financeiro mora numa instituição diferente. Conta-salário no banco, reserva de emergência em CDB de banco médio, ações e fundos imobiliários numa corretora, Tesouro Direto direto pelo site do Tesouro, dólar via outra fintech. Pra ver tudo junto, o investidor exporta CSV, abre planilha, copia, formata, descobre que a soma está errada e refaz tudo na semana seguinte.
        </p>

        <p>
          O Open Finance resolve isso. E a Redentia é uma das plataformas que faz a leitura do consentimento, consolida sua carteira em 2 minutos e devolve uma visão única do patrimônio em tempo real, com score 0-100 da sua alocação real. Este guia destrincha como funciona, por que é seguro e o que isso muda concretamente pra você.
        </p>

        <!-- 3 stats cards -->
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Clientes</p>
            <p class="text-3xl font-bold mb-1">100M+</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Contas conectadas ao Open Finance em fev/2026 (BCB)</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Consentimentos</p>
            <p class="text-3xl font-bold mb-1 text-secondary">154M</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Ativos no sistema. 143% de crescimento entre 2024 e 2025</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">APIs de investimentos</p>
            <p class="text-3xl font-bold mb-1">1,81 bi</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Chamadas em dezembro/2024 (17% do total do sistema)</p>
          </div>
        </div>

        <h2>Problema: 3 lugares diferentes, zero visão única</h2>

        <p>
          O investidor PF brasileiro médio em 2026 tem conta em 3 bancos e 2 corretoras. Aplica em CDB de banco médio, Tesouro Direto, ações da B3 e alguns fundos imobiliários. São pelo menos 5 apps abertos no celular. Em cada um, uma visão parcial do patrimônio.
        </p>

        <p>
          O resultado: ninguém vê a carteira inteira em lugar nenhum. A alocação por classe é estimada de cabeça. A correlação entre os ativos é desconhecida. A diversificação que parece existir só existe na superfície. E quando o mercado vira, as decisões são tomadas com base na planilha desatualizada da semana passada.
        </p>

        <h2>Solução: Open Finance resolve, e o Brasil lidera</h2>

        <p>
          O Open Finance brasileiro foi lançado em fevereiro de 2021 e completou 5 anos em fevereiro de 2026. É o sistema regulamentado pelo Banco Central que permite o compartilhamento de dados financeiros entre instituições participantes, sempre com consentimento explícito do cliente. O Brasil tem o modelo mais completo do mundo, à frente de Reino Unido, União Europeia e Austrália.
        </p>

        <h3>A Fase 4 mudou tudo pra investidor</h3>

        <p>
          A Fase 4 do Open Finance, implementada em setembro de 2023, ampliou o escopo do compartilhamento para incluir investimentos (CDB, Tesouro Direto, fundos e ações), seguros, previdência, câmbio e capitalização. Foi a partir dessa fase que o Open Finance deixou de ser apenas "dados bancários" e virou "dados financeiros completos".
        </p>

        <p>
          Em dezembro de 2024, as APIs de investimentos atingiram 1,81 bilhão de chamadas, representando 17% do total de chamadas do ecossistema. Um ano antes, essa participação era de apenas 1%. O crescimento foi de aproximadamente 17 vezes em 12 meses.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          O Open Finance brasileiro não é mais uma promessa. É a infraestrutura que conecta 100 milhões de pessoas.
        </blockquote>

        <h2>Como funciona: consentimento e nada mais</h2>

        <p>
          Pra usar o Open Finance numa plataforma como a Redentia, o fluxo tem 4 passos:
        </p>

        <ol>
          <li><strong>Você escolhe quais instituições compartilham.</strong> Banco X, corretora Y, fintech Z. Pode selecionar uma ou todas as que tem relacionamento.</li>
          <li><strong>Você escolhe quais dados.</strong> Saldo, extrato, investimentos, seguros. Pode marcar tudo ou só uma categoria.</li>
          <li><strong>Você escolhe por quanto tempo.</strong> Padrão são 12 meses, mas pode ajustar.</li>
          <li><strong>O consentimento é assinado dentro do app do seu banco.</strong> A Redentia nunca vê senha nem token. Só recebe os dados compartilhados via API regulada pelo Banco Central.</li>
        </ol>

        <p>
          Em qualquer momento, você pode entrar no app do seu banco e revogar o consentimento. A revogação é instantânea. A partir desse momento, a Redentia perde acesso aos dados.
        </p>

        <h2>Benefícios: 4 ganhos que nenhuma plataforma sozinha entrega</h2>

        <h3>1. Visão única do patrimônio em tempo real</h3>

        <p>
          Saldo do banco + investimentos da corretora + FIIs + Tesouro Direto + dólar em fintech. Tudo agregado numa tela só, atualizado a cada poucas horas. Sem planilha, sem CSV, sem cálculo manual.
        </p>

        <h3>2. Alocação real por classe (não a que você acha)</h3>

        <p>
          A Redentia calcula automaticamente quanto da carteira está em renda fixa, renda variável, FIIs, exterior e caixa. A maioria dos investidores acha que tem 30% em renda variável e descobre que tem 55%. Ou acha que tem 60% em renda fixa e descobre que 40% disso é poupança rendendo abaixo do mercado.
        </p>

        <h3>3. Alertas de rebalanceamento automático</h3>

        <p>
          Quando uma classe ultrapassa o teto definido pelo seu perfil (ex: ações acima de 50% da carteira), a Redentia avisa. Quando um ativo passa de 20% individual, idem. Você não precisa abrir 5 apps por semana pra descobrir que precisa rebalancear.
        </p>

        <h3>4. Comparativo entre seus produtos e o mercado</h3>

        <p>
          Seu CDB rende menos que a média do mercado? Seu fundo cobra taxa de administração acima do percentil 75? A Redentia mostra. Isso só é possível porque a plataforma vê seus produtos reais via Open Finance, não estimativas.
        </p>

        <h2>Prova: Brasil lidera adoção mundial</h2>

        <p>
          Os números do Banco Central em 2026 mostram que o Open Finance brasileiro não é experimento. É infraestrutura consolidada:
        </p>

        <ul>
          <li><strong>100 milhões+ de clientes conectados</strong> (PF e PJ somados), segundo dashboard oficial do BCB.</li>
          <li><strong>154 milhões de consentimentos ativos</strong> em fevereiro de 2026.</li>
          <li><strong>143% de crescimento</strong> de CPFs e CNPJs únicos que compartilharam dados entre 2024 e 2025.</li>
          <li><strong>45+ produtos e serviços</strong> já oferecidos no ecossistema (agregadores, iniciação de pagamentos, ofertas de crédito, gestão de investimentos).</li>
        </ul>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          Brasil lidera o Open Finance global com 100 milhões de clientes. Modelo mais completo do mundo, segundo análises internacionais.
        </blockquote>

        <h2>Segurança: BCB regula, LGPD protege</h2>

        <p>
          Open Finance opera sob 3 camadas de proteção:
        </p>

        <ol>
          <li><strong>Banco Central regula e fiscaliza.</strong> Toda instituição participante passa por homologação técnica. Quem não cumpre as normas é descredenciado.</li>
          <li><strong>LGPD (Lei Geral de Proteção de Dados) garante seu direito sobre o dado.</strong> Você é o dono do dado. O compartilhamento é só pra finalidades específicas e por tempo determinado.</li>
          <li><strong>Consentimento ativo, granular e revogável.</strong> Diferente de modelos antigos baseados em scraping ou armazenamento de senha (que apps como Guiabolso usavam antes), o Open Finance usa API oficial sem nenhum dado de credencial no caminho.</li>
        </ol>

        <p>
          Não há leak possível de senha porque a senha nunca é compartilhada. A autorização acontece dentro do próprio app do banco, via fluxo SSO regulado.
        </p>

        <h2>Como a Redentia usa Open Finance</h2>

        <p>
          A Redentia é uma das plataformas autorizadas a receber dados via Open Finance. O fluxo de uso é simples:
        </p>

        <ol>
          <li>Você cria sua conta na Redentia em 1 minuto (email + senha + perfil de investidor).</li>
          <li>Na tela de carteira, clica em "Conectar via Open Finance".</li>
          <li>Seleciona o banco/corretora que quer conectar. Você é redirecionado para o app dessa instituição.</li>
          <li>Autoriza o compartilhamento dentro do app. Em segundos, volta pra Redentia.</li>
          <li>Seus dados aparecem consolidados na carteira, com score 0-100 e plano personalizado.</li>
        </ol>

        <p>
          Tempo total: 2 minutos. Custo: zero. Risco: o mesmo de qualquer fluxo de Open Finance regulado pelo BCB.
        </p>

        <h2>Perguntas Frequentes</h2>

        <h3>Open Finance é seguro?</h3>

        <p>
          Sim, mais seguro que os modelos antigos baseados em scraping ou armazenamento de senha. O Open Finance opera via API oficial regulada pelo Banco Central. Nenhum dado de credencial passa pela plataforma agregadora. A autorização acontece dentro do app do banco original, com autenticação multifator do próprio banco.
        </p>

        <h3>Posso revogar o consentimento depois?</h3>

        <p>
          Sim, a qualquer momento, dentro do app do seu banco. A revogação é instantânea. A partir do momento da revogação, a plataforma que recebia seus dados perde acesso. Você pode também definir prazo de validade (padrão 12 meses) e renovar quando quiser.
        </p>

        <h3>A Redentia vê minha senha?</h3>

        <p>
          Não, nunca. O Open Finance foi desenhado especificamente pra que nenhuma plataforma agregadora tenha acesso a credenciais. A autenticação é feita 100% dentro do app do banco emissor, via SSO regulado.
        </p>

        <h3>Quais bancos e corretoras estão no Open Finance?</h3>

        <p>
          Todas as principais instituições do Brasil são participantes obrigatórias: Itaú, Bradesco, Banco do Brasil, Santander, Caixa, Nubank, Inter, BTG Pactual, XP, Rico, Clear, Nu Invest, Mercado Pago, PicPay, entre muitas outras. A lista completa está no site oficial openfinancebrasil.org.br.
        </p>

        <h3>O que muda na minha carteira ao conectar?</h3>

        <p>
          Tudo continua na sua instituição original. O Open Finance só dá visibilidade dos dados para plataformas que você autorizou. Suas aplicações ficam onde estavam, sob custódia das mesmas instituições. A Redentia (ou qualquer agregador) é uma camada de visualização e análise, não custódia.
        </p>

        <h2>Conclusão: a infraestrutura existe. Falta usar.</h2>

        <p>
          O Open Finance brasileiro é a infraestrutura mais completa do mundo pra compartilhamento de dados financeiros. 100 milhões de clientes já estão conectados. As APIs de investimentos cresceram 17 vezes em um ano. O Banco Central regula, a LGPD protege, e o consentimento é granular e revogável.
        </p>

        <p>
          O que falta pra você é usar. Em 2 minutos, sua carteira inteira pode estar consolidada num lugar só, com score 0-100, alocação real por classe, alertas de rebalanceamento e comparativo com mercado. A planilha de Excel pode ser arquivada definitivamente.
        </p>
      </div>

      <!-- CTA Redentia -->
      <div class="rounded-2xl border p-6 md:p-8" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
        <h3 class="mb-3">Conecte sua carteira em 2 minutos</h3>
        <p class="mb-5" :style="{ color: 'var(--brand-text-muted)' }">
          A {{ brand.name }} usa Open Finance pra consolidar sua carteira em todas as instituições. Score 0-100 da alocação real, alertas de rebalanceamento e plano personalizado em tempo real.
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
          <NuxtLink to="/guias/poupanca-vs-tesouro-ipca-mais-2026" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-piggy-bank" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Poupança vs Tesouro IPCA+ 2026</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">Por que o PF deixa metade na mesa</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>
          <NuxtLink to="/guias/raio-x-da-carteira-em-crise" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-shield-alert" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Raio X da Carteira em Crise</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">Estrutura, correlação, liquidez</p>
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
  title: `Open Finance: Sua Carteira Ainda Está Espalhada? | ${brand.name}`,
  description:
    'Open Finance brasileiro tem 100M+ clientes e 154M consentimentos ativos em 2026. Entenda como funciona, por que é seguro (BCB + LGPD) e como a Redentia consolida sua carteira em 2 minutos via API oficial.',
  path: '/guias/open-finance-carteira-espalhada',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Open Finance: Sua Carteira Ainda Está Espalhada?',
      description:
        'Guia editorial sobre Open Finance no Brasil em 2026, como funciona o consentimento, segurança regulada pelo BCB e LGPD, e como a Redentia consolida sua carteira via API oficial.',
      author: { '@type': 'Organization', name: brand.name },
      publisher: {
        '@type': 'Organization',
        name: brand.name,
        logo: { '@type': 'ImageObject', url: `${brand.url}/512x512.png` },
      },
      datePublished: '2026-05-24',
      dateModified: '2026-05-24',
      articleSection: 'Guia Redentia',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Open Finance é seguro?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim, mais seguro que modelos antigos baseados em scraping ou senha. Opera via API oficial regulada pelo Banco Central. Nenhum dado de credencial passa pela plataforma agregadora. A autenticação acontece dentro do app do banco original, com multifator.',
          },
        },
        {
          '@type': 'Question',
          name: 'Posso revogar o consentimento depois?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim, a qualquer momento, dentro do app do seu banco. A revogação é instantânea. Você pode também definir prazo de validade (padrão 12 meses) e renovar quando quiser.',
          },
        },
        {
          '@type': 'Question',
          name: 'A Redentia vê minha senha?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não, nunca. O Open Finance foi desenhado pra que nenhuma plataforma agregadora tenha acesso a credenciais. A autenticação é feita 100% dentro do app do banco emissor via SSO regulado.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quais bancos estão no Open Finance?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Todas as principais instituições do Brasil são participantes obrigatórias: Itaú, Bradesco, Banco do Brasil, Santander, Caixa, Nubank, Inter, BTG, XP, Rico, Clear, Mercado Pago, PicPay, entre outras.',
          },
        },
        {
          '@type': 'Question',
          name: 'O que muda na minha carteira ao conectar?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Nada muda na custódia. Suas aplicações continuam nas instituições originais. A Redentia (ou qualquer agregador) é só uma camada de visualização e análise, não custódia. O Open Finance dá visibilidade dos dados sem mover dinheiro.',
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
        { '@type': 'ListItem', position: 3, name: 'Open Finance: Carteira Espalhada', item: `${brand.url}/guias/open-finance-carteira-espalhada` },
      ],
    },
  ],
})
</script>
