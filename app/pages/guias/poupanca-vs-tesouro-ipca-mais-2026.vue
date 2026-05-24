<template>
  <NuxtLayout name="default" title="Poupança vs Tesouro IPCA+: Por Que Você Perde Metade do Retorno em 2026">
    <section class="flex flex-col gap-8 px-6 py-8">
      <MoleculesPageHeader
        icon="i-lucide-piggy-bank"
        icon-color="secondary"
        title="Poupança vs Tesouro IPCA+: Por Que Você Perde Metade do Retorno em 2026"
        description="A poupança finalmente parou de perder para a inflação em 2026. Mas com Selic em 14,5%, o investidor pessoa física brasileiro continua deixando metade do retorno na mesa. Entenda os 3 vetores que separam quem ganha 3,7% real de quem ganha 6,95% real ao ano."
      />

      <div class="flex flex-col gap-6">
        <p class="text-lg">
          Em maio de 2026, com a Selic em 14,5% ao ano e o IPCA acumulado em 4,39%, a caderneta de poupança rende cerca de 3,7% real ao ano. É a primeira vez em 13 anos que ela bate a inflação. Boa notícia, na superfície.
        </p>

        <p>
          O problema é o que está logo ao lado. O Tesouro IPCA+ 2050 paga IPCA mais 6,95% de juros reais. LCI e LCA isentas de imposto rendem 13% ao ano. E mesmo assim, segundo o Raio X do Investidor Brasileiro 2026 da ANBIMA, 22% dos investidores pessoas físicas seguem aplicando em poupança. O Banco Central registrou saldo de R$ 1,022 trilhão na caderneta no fim de 2025, mesmo após saque líquido de R$ 85,6 bilhões no ano.
        </p>

        <p>
          Este guia destrincha os três vetores que explicam por que o investidor PF deixa metade do retorno na mesa em 2026, mesmo com a Selic mais alta em 20 anos.
        </p>

        <!-- Comparativo de rendimentos -->
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2" :style="{ color: 'var(--brand-text-muted)' }">Poupança</p>
            <p class="text-3xl font-bold mb-1">3,7%</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Rendimento real anual em 2026 (isenta de IR)</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Tesouro IPCA+ 2050</p>
            <p class="text-3xl font-bold mb-1 text-secondary">6,95%</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Juros reais ao ano garantidos até 2050</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2" :style="{ color: 'var(--brand-text-muted)' }">LCI/LCA 90% CDI</p>
            <p class="text-3xl font-bold mb-1">13,0%</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Rendimento nominal anual (isenta de IR)</p>
          </div>
        </div>

        <h2>Capítulo 01: O Custo de Oportunidade É Silencioso e Composto</h2>

        <p>
          A diferença entre 3,7% e 6,95% real ao ano parece pequena em um único ano. Mas o juro composto trabalha em escala que destrói intuição linear.
        </p>

        <p>
          Pega o exemplo clássico. Você tem R$ 100.000 hoje e quer guardar para daqui a 10 anos sem perder poder de compra.
        </p>

        <ul>
          <li><strong>Cenário poupança:</strong> R$ 100.000 a 3,7% reais ao ano se transformam em R$ 143.836 em poder de compra ao final de 10 anos. Ganho real: R$ 43.836.</li>
          <li><strong>Cenário Tesouro IPCA+ 2050:</strong> Os mesmos R$ 100.000 a 6,95% reais ao ano se transformam em R$ 195.616 em poder de compra. Ganho real: R$ 95.616.</li>
        </ul>

        <p>
          A diferença de R$ 51.780 não é mágica. É juros do juros do erro. Em 30 anos, a poupança entrega R$ 197 mil enquanto o Tesouro IPCA+ entrega R$ 753 mil. A diferença passa a ser de quase 4x.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          Em uma década, o composto vira metade da carteira. Em três décadas, vira quase tudo.
        </blockquote>

        <h3>Por que o Tesouro IPCA+ paga tanto?</h3>

        <p>
          O Tesouro Direto IPCA+ é um título público federal emitido pelo Tesouro Nacional. O governo brasileiro paga juros altos para financiar a dívida pública. Em 2026, com a Selic em 14,5% e o mercado precificando uma trajetória de queda lenta, o título de longo prazo (vencimento 2050) trava o juro real elevado por 24 anos.
        </p>

        <p>
          O risco soberano brasileiro existe, mas é o mesmo risco que está embutido na própria moeda (real) que circula no país. Se o Tesouro Nacional quebra, a poupança quebra junto, porque os bancos não conseguem manter seus balanços em uma crise sistêmica nessa escala.
        </p>

        <h2>Capítulo 02: O Imposto Não É o Ponto. O Retorno É.</h2>

        <p>
          A maior defesa cultural da poupança no Brasil é a isenção de imposto de renda. O argumento popular diz que CDB e Tesouro Direto perdem porque "o leão come parte do ganho". Em 2026, isso passou a ser meio-verdade que esconde uma falácia.
        </p>

        <h3>O que mudou no imposto de renda em 2026</h3>

        <p>
          A partir de 1º de janeiro de 2026, a tabela regressiva do IR sobre renda fixa foi substituída por uma alíquota única de 17,5% sobre o ganho. Antes a alíquota variava de 22,5% (até 180 dias) a 15% (acima de 720 dias). Agora é 17,5% fixo, independentemente do prazo.
        </p>

        <p>
          Esse imposto incide apenas sobre o ganho, não sobre o principal. Em um CDB que rende 100% do CDI (14,40% ao ano em 2026), o rendimento líquido após IR fica em 11,88% nominal. Descontando o IPCA de 4,39%, o ganho real líquido é de aproximadamente 7,2% ao ano. Quase o dobro da poupança.
        </p>

        <h3>LCI e LCA: a vantagem fiscal que continua intocada</h3>

        <p>
          A grande questão para o investidor que valoriza isenção é que LCI (Letra de Crédito Imobiliário) e LCA (Letra de Crédito do Agronegócio) seguem isentas de imposto de renda para pessoa física em 2026. A Lei 11.033 de 2004, que estabeleceu essa isenção, segue em vigor. A Medida Provisória 1.303 chegou a propor uma alíquota de 5%, mas caducou em outubro de 2025 sem ser convertida em lei.
        </p>

        <p>
          Uma LCI que paga 90% do CDI entrega 12,96% ao ano nominal. Sem imposto. Com o mesmo Fundo Garantidor de Crédito (FGC) que protege a poupança até R$ 250 mil. Mesma simplicidade de aplicar pelo app do banco. Mas com retorno 50% maior que a caderneta.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          A isenção da poupança não é vantagem. É só uma forma de igualar a régua. O que importa é o retorno absoluto, e ele é metade.
        </blockquote>

        <h2>Capítulo 03: O Vetor Comportamental</h2>

        <p>
          Se a matemática é tão clara, por que 22% dos investidores PF brasileiros, equivalente a mais de 13 milhões de pessoas, seguem na poupança? Três fatores explicam o fenômeno.
        </p>

        <h3>Cultura e familiaridade</h3>

        <p>
          A poupança é o primeiro produto financeiro que o brasileiro conhece. Conta poupança infantil, presente de aniversário em livro de poupança, salário entrando direto na caderneta. Existe desde 1861. É o produto mais antigo do sistema financeiro brasileiro ainda em operação. Confiança é construída por tempo, não por matemática.
        </p>

        <h3>Aversão mal calibrada ao risco</h3>

        <p>
          Pesquisa da ANBIMA mostra que 89% dos brasileiros declaram priorizar segurança ao investir. O problema é que confundem segurança com simplicidade ou familiaridade. A poupança tem cobertura do FGC até R$ 250 mil por CPF por instituição. CDBs, LCIs e LCAs têm a mesma cobertura, com as mesmas regras. Tesouro Direto não tem FGC, mas tem garantia soberana, que é teoricamente superior à do FGC, porque o garantidor é o próprio governo que emite a moeda.
        </p>

        <p>
          O risco real é o oposto do que a intuição sugere. Manter dinheiro em poupança não é mais arriscado que aplicar em outros produtos de renda fixa. É menos arriscado em termos de chance de perder principal, mas substancialmente mais arriscado em termos de custo de oportunidade.
        </p>

        <h3>Inércia operacional</h3>

        <p>
          A poupança debita automaticamente do salário em muitos bancos, oferece liquidez imediata e tem interface familiar no app. Migrar para Tesouro Direto, LCI ou CDB exige abrir conta em corretora, fazer transferência via TED ou PIX, escolher o título e operar a compra. Para muitos investidores, esses passos parecem mais complexos do que realmente são. A inércia opera silenciosamente.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          A inflação parou de punir. Agora a inércia pune.
        </blockquote>

        <h2>O que fazer com Selic em 14,5% em 2026</h2>

        <p>
          A janela de Selic alta abre uma oportunidade rara para travar juros reais elevados por muitos anos. Três passos práticos para o investidor que entendeu a tese.
        </p>

        <h3>1. Mapeie sua exposição atual</h3>

        <p>
          Some todos os valores aplicados em poupança em qualquer banco que você usa. Esse é seu custo de oportunidade total. Multiplique por 3,25% (a diferença entre 6,95% do IPCA+ e 3,7% da poupança) para ver o quanto deixa de ganhar todo ano.
        </p>

        <p>
          Para R$ 50.000 em poupança, isso é R$ 1.625 por ano deixados na mesa. Em 10 anos, R$ 25 mil. Em 20 anos, R$ 80 mil, contando o juros do juros.
        </p>

        <h3>2. Escolha o veículo por horizonte e perfil</h3>

        <ul>
          <li><strong>Reserva de emergência:</strong> Tesouro Selic ou CDB de liquidez diária com 100% CDI em corretora. Rende próximo a 14,4% nominal contra os 8,3% da poupança, mantendo liquidez imediata.</li>
          <li><strong>Curto e médio prazo (6 a 36 meses):</strong> LCI ou LCA de 90% a 95% do CDI. Isentas de IR, com FGC. Rendimento líquido bate qualquer CDB tradicional para esse horizonte.</li>
          <li><strong>Longo prazo (5+ anos):</strong> Tesouro IPCA+ longo (2035, 2040, 2050). Trava juro real elevado e protege contra inflação por décadas. Ideal para metas de aposentadoria ou patrimônio para os filhos.</li>
        </ul>

        <h3>3. Use a calculadora para ver o impacto real</h3>

        <p>
          Antes de migrar, vale rodar o cálculo do quanto você terá em 5, 10 e 20 anos com cada veículo. Calcular o ganho composto torna a diferença concreta e ajuda a vencer a inércia comportamental.
        </p>

        <h2>Perguntas frequentes</h2>

        <h3>A poupança é sempre ruim?</h3>

        <p>
          Não. Em 2026, com Selic em 14,5%, a poupança ganha da inflação pela primeira vez em mais de uma década. Para reserva de emergência de curtíssimo prazo (menos de 30 dias) e para pessoas que não querem operar em corretora, ela cumpre seu papel. O problema é mantê-la como única aplicação quando alternativas com mesmo risco entregam o dobro.
        </p>

        <h3>LCI e LCA realmente têm o mesmo FGC da poupança?</h3>

        <p>
          Sim. O Fundo Garantidor de Crédito cobre até R$ 250 mil por CPF por instituição financeira para depósitos à vista, poupança, CDBs, LCIs, LCAs e outros produtos. A regra é idêntica para os quatro produtos. A única diferença é o limite global de R$ 1 milhão por CPF a cada quatro anos, aplicável a todas as instituições somadas.
        </p>

        <h3>O imposto de renda sobre Tesouro IPCA+ inviabiliza o investimento?</h3>

        <p>
          Não. A alíquota de 17,5% sobre o ganho ainda deixa o Tesouro IPCA+ 2050 com rendimento líquido muito superior ao da poupança. IPCA+ 6,95% bruto, descontado o IR, fica em aproximadamente 5,7% real líquido ao ano. Quase 55% acima da poupança.
        </p>

        <h3>Tesouro Direto pode quebrar?</h3>

        <p>
          O risco do Tesouro Nacional é considerado o risco mais baixo do sistema financeiro brasileiro. Se o governo brasileiro entrar em default, todas as outras instituições financeiras já terão quebrado antes, porque a estabilidade do sistema bancário depende da estabilidade do soberano. Na prática, comprar Tesouro Direto é o investimento mais seguro disponível para o investidor brasileiro.
        </p>

        <h3>Qual o melhor momento para sair da poupança?</h3>

        <p>
          Não existe melhor momento. Existe o momento atual. Cada dia em poupança é meio dia de retorno deixado na mesa. A migração para LCI, Tesouro Direto ou CDB de banco com bom rating pode ser feita em minutos via app de corretora. Não há razão técnica para postergar.
        </p>

        <h2>Conclusão: o vilão mudou</h2>

        <p>
          Durante 13 anos, de 2013 a 2025, a inflação foi o principal vilão da poupança. A regra de remuneração implementada em 2012, que limita o rendimento a 70% da Selic quando ela está abaixo de 8,5% ao ano, fez com que a caderneta perdesse poder de compra em quase todos os anos do período.
        </p>

        <p>
          Em 2026, com Selic alta e IPCA controlado, esse capítulo se encerra. A poupança volta a render acima da inflação. Mas isso é uma armadilha mais sutil: o investidor olha o ganho real positivo e conclui que está tudo bem. Não está.
        </p>

        <p>
          O vilão mudou. Não é mais a inflação que destrói patrimônio. É a inércia que impede o capital de capturar o melhor retorno disponível. Em 2026, com Selic em 14,5%, a diferença entre quem ganha 3,7% real e quem ganha 6,95% real é uma escolha de poucos cliques no app da corretora. E essa escolha, multiplicada por décadas, é a diferença entre uma carteira e duas carteiras.
        </p>
      </div>

      <!-- CTA Redentia -->
      <div class="rounded-2xl border p-6 md:p-8" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
        <h3 class="mb-3">Diagnostique sua carteira em 2 minutos</h3>
        <p class="mb-5" :style="{ color: 'var(--brand-text-muted)' }">
          A {{ brand.name }} analisa sua exposição em poupança, renda fixa e renda variável e mostra exatamente quanto você deixa de ganhar por mês com a alocação atual. Score 0-100 e plano personalizado.
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

      <!-- Navegação para Outros Guias -->
      <div class="border-t pt-8" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">
        <h3>Continue lendo</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink to="/guias/calculadora-de-dividendos" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-coins" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Calculadora de Dividendos</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">Renda passiva mensal por meta</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>
          <NuxtLink to="/guias/fire-independencia-financeira-calculadora" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-flame" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">FIRE: Calculadora de Independência</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">Quanto acumular pra se aposentar</p>
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
  title: `Poupança vs Tesouro IPCA+ 2026: Por Que Você Perde Metade do Retorno | ${brand.name}`,
  description:
    'Com Selic em 14,5%, a poupança finalmente ganha da inflação. Mas Tesouro IPCA+ paga 6,95% real e LCI/LCA pagam 13% isento. Entenda os 3 vetores que separam quem ganha 3,7% de quem ganha 6,95% real ao ano em 2026.',
  path: '/guias/poupanca-vs-tesouro-ipca-mais-2026',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Poupança vs Tesouro IPCA+: Por Que Você Perde Metade do Retorno em 2026',
      description:
        'Análise editorial sobre como o investidor PF brasileiro deixa metade do retorno na mesa mesmo com Selic em 14,5%, e o que fazer.',
      author: {
        '@type': 'Organization',
        name: brand.name,
      },
      publisher: {
        '@type': 'Organization',
        name: brand.name,
        logo: {
          '@type': 'ImageObject',
          url: `${brand.url}/512x512.png`,
        },
      },
      datePublished: '2026-05-24',
      dateModified: '2026-05-24',
      articleSection: 'Premium Memo',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'A poupança é sempre ruim como investimento?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. Em 2026, com Selic em 14,5%, a poupança ganha da inflação pela primeira vez em mais de uma década. Para reserva de emergência de curtíssimo prazo, ela cumpre seu papel. O problema é mantê-la como única aplicação quando alternativas com mesmo risco entregam o dobro.',
          },
        },
        {
          '@type': 'Question',
          name: 'LCI e LCA têm o mesmo FGC da poupança?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim. O Fundo Garantidor de Crédito cobre até R$ 250 mil por CPF por instituição financeira para poupança, CDBs, LCIs, LCAs e outros produtos. A regra é idêntica.',
          },
        },
        {
          '@type': 'Question',
          name: 'O imposto de renda sobre Tesouro IPCA+ inviabiliza o investimento?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. A alíquota fixa de 17,5% sobre o ganho ainda deixa o Tesouro IPCA+ 2050 com rendimento líquido de aproximadamente 5,7% real ao ano, quase 55% acima da poupança.',
          },
        },
        {
          '@type': 'Question',
          name: 'Tesouro Direto pode quebrar?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'O risco do Tesouro Nacional é o mais baixo do sistema financeiro brasileiro. Se o governo brasileiro entrar em default, todas as outras instituições financeiras já terão quebrado antes.',
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
        { '@type': 'ListItem', position: 3, name: 'Poupança vs Tesouro IPCA+ 2026', item: `${brand.url}/guias/poupanca-vs-tesouro-ipca-mais-2026` },
      ],
    },
  ],
})
</script>
