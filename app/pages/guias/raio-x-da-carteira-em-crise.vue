<template>
  <NuxtLayout name="default" title="Raio X da Carteira em Crise: Estrutura, Correlação e Liquidez">
    <section class="flex flex-col gap-8 px-6 py-8">
      <MoleculesPageHeader
        icon="i-lucide-shield-alert"
        icon-color="secondary"
        title="O Que Realmente Protege Sua Carteira em Uma Crise?"
        description="Diversificação não é proteção. Em 2020, ativos que pareciam descorrelacionados se moveram juntos. Em 2008, em 1998 e em 1987 também. Os 3 vetores estruturais que separam uma carteira que absorve choque da que apenas desaba mais devagar: estrutura, correlação e liquidez."
      />

      <div class="flex flex-col gap-6">
        <p class="text-lg">
          Em março de 2020, na semana mais aguda do choque da pandemia, a correlação semanal entre o Ibovespa e o S&P 500 atingiu 0,91. Em janeiro do mesmo ano, era 0,32. Em poucas semanas, ativos que pareciam vivos em mercados diferentes se moveram como um só.
        </p>

        <p>
          O mesmo padrão se repetiu em 2008. Em 1998. Em 1987. Cada vez que o estresse global cresce, a correlação real entre classes de ativos converge para 1, justamente no momento em que o investidor mais precisaria que ela fosse baixa.
        </p>

        <p>
          Este guia destrincha o que realmente protege uma carteira em crise, com base em três vetores estruturais que existem antes do nome de qualquer ativo: estrutura, correlação e liquidez.
        </p>

        <!-- 3 pilares cards -->
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Pilar 01</p>
            <p class="text-xl font-bold mb-2">Estrutura</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Como a carteira responde quando juros, inflação, ciclo, dólar e geopolítica mudam de direção.</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Pilar 02</p>
            <p class="text-xl font-bold mb-2">Correlação</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Quantos ativos diferentes você tem não importa, se todos respondem ao mesmo choque na mesma hora.</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Pilar 03</p>
            <p class="text-xl font-bold mb-2">Liquidez</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Patrimônio investido só vale o que você consegue vender no pior dia. O resto é teoria.</p>
          </div>
        </div>

        <h2>O Diagnóstico: A Falsa Proteção Parece Diversificada</h2>

        <p>
          O erro mais comum não está na falta de ativos. Está na repetição silenciosa do mesmo risco em formatos diferentes.
        </p>

        <p>
          Muitos portfólios parecem equilibrados na superfície. Têm ações, fundos multimercado, exposição internacional via BDRs ou ETFs globais, e caixa em renda fixa. Quando o mercado entra em estresse, boa parte dessas posições responde ao mesmo driver macro. Juros sobem nos Estados Unidos, o dólar sobe no Brasil, os fundos multimercado long-short fecham posições, as ações da B3 caem, os FIIs caem, e o BDR de S&P 500 que deveria proteger também cai porque o índice americano também derreteu.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          Diversificação visual não é proteção estrutural.
        </blockquote>

        <p>
          Ter nomes diferentes na carteira não garante comportamentos diferentes sob pressão. Em muitos casos, o investidor apenas espalhou a mesma fragilidade em formatos distintos. Proteção real nasce da combinação entre estrutura, correlação e liquidez. É isso que define se a carteira absorve o choque, ou se apenas desaba de forma mais lenta.
        </p>

        <h2>Capítulo 01: Estrutura — A Camada Que Ninguém Vê</h2>

        <p>
          Toda carteira tem três camadas. Estrutura, comportamento e narrativa. Quase todo investidor só olha a última.
        </p>

        <p>
          A narrativa é o que você conta para si mesmo sobre por que comprou aquela ação. "Vale é uma boa empresa, paga dividendos, exporta commodity, o mundo precisa de minério." O comportamento é o que a ação faz quando o cenário muda. A estrutura é o esqueleto silencioso que define como cada classe de ativos responde a juros, inflação, ciclo, dólar e geopolítica.
        </p>

        <h3>O exemplo clássico do single driver</h3>

        <p>
          Sessenta por cento da carteira em ações brasileiras pode parecer diversificado. São 8 a 10 nomes diferentes, setores variados, large e mid caps. Mas se 80% dessas ações dependem de preço de commodity (Vale, Petrobras, JBS, Suzano, Klabin), sua carteira tem um único driver de fato: o preço de minério, petróleo, soja e celulose.
        </p>

        <p>
          Quando o ciclo de commodity vira, todas caem juntas. A diversificação por ticker era ilusão. A estrutura era monocromática.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          A pergunta certa não é quantos ativos você tem. É quantos drivers você tem.
        </blockquote>

        <h2>Capítulo 02: Correlação — Quando 12 Ativos Viram Um</h2>

        <p>
          Em pânico, ativos que pareciam distintos se movem juntos. A correlação real só aparece no estresse.
        </p>

        <p>
          Em março de 2020, a correlação entre Ibovespa e S&P 500 atingiu 0,91 em janelas semanais. Em janeiro do mesmo ano, era 0,32. O mesmo padrão se repetiu em 2008, 1998 e 1987. A correlação não é estática, é regime-dependente. Ela colapsa para próximo de 1 justamente quando você precisaria que ela fosse baixa, ou seja, no exato momento da venda forçada.
        </p>

        <h3>Por que correlações sobem em crise</h3>

        <p>
          Quando o estresse é alto, decisões deixam de ser sobre fundamentos individuais e passam a ser sobre liquidez. Fundos precisam vender o que conseguem vender, não o que querem vender. Margem é chamada e ativos líquidos viram caixa primeiro. Investidores institucionais reduzem risco em bloco. O resultado: tudo cai junto, independente da tese individual.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          A correlação real só aparece no estresse. Em mercado calmo, ela é coincidência de direção, não diversificação verdadeira.
        </blockquote>

        <h3>Como medir correlação de verdade</h3>

        <ul>
          <li><strong>Janela de cálculo:</strong> 5 anos diários ou 10 anos semanais. Períodos mais curtos pegam regime único.</li>
          <li><strong>Inclua janelas de estresse:</strong> 2008, 2015, 2020. Correlação fora de estresse tem pouco valor preditivo.</li>
          <li><strong>Olhe correlação cruzada por classe:</strong> ações BR vs S&P, renda fixa longa vs ações, BDRs vs Ibovespa, ouro vs USD.</li>
        </ul>

        <h2>Capítulo 03: Liquidez — A Prova Final</h2>

        <p>
          Patrimônio investido só vale o que você consegue vender no pior dia. Tudo o resto é teoria.
        </p>

        <p>
          Em momentos de estresse extremo, ativos de baixa liquidez podem cair 30, 40, 50% não pela mudança de fundamento, mas pela falta de comprador. FIIs de menor liquidez na B3 já caíram 25% em uma semana em 2020 com volume mínimo de negociação. Debêntures privadas, fundos fechados, COE estruturado, fundos de previdência com carência: tudo isso tem liquidez aparente em mercado calmo, e nenhuma liquidez quando o mercado precisa de venda.
        </p>

        <h3>Hierarquia de liquidez na carteira brasileira</h3>

        <ol>
          <li><strong>Liquidez imediata (D+0 ou D+1):</strong> Tesouro Selic, fundos DI grandes, dinheiro em conta corrente.</li>
          <li><strong>Liquidez alta (D+1 a D+30):</strong> Ações líquidas da B3, ETFs de Ibov, IPCA+ líquido, CDB de liquidez diária em banco grande.</li>
          <li><strong>Liquidez média (D+30 a D+90):</strong> FIIs líquidos, BDRs, IPCA+ longo com marcação a mercado, LCI/LCA com carência de 90 dias.</li>
          <li><strong>Liquidez baixa (D+90+):</strong> FIIs pequenos, debêntures, fundos fechados, COE.</li>
          <li><strong>Sem liquidez prática:</strong> Imóveis físicos, participação em empresas, previdência com carência longa.</li>
        </ol>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          Liquidez é a prova final da estrutura. Tudo o resto é teoria.
        </blockquote>

        <h2>O Raio X Prático: Como Fazer Você Mesmo</h2>

        <p>
          Para diagnosticar a estrutura real da carteira hoje, três passos práticos.
        </p>

        <h3>1. Mapeie os drivers, não os tickers</h3>

        <p>
          Liste cada posição da carteira e identifique o driver dominante. Vale, Petrobras, JBS, Suzano, Klabin: driver commodity. Itaú, Bradesco, BB: driver bancário brasileiro. KNRI11, MXRF11, HGLG11: driver imobiliário comercial brasileiro. IVVB11, BDRs: driver bolsa americana. Some os percentuais por driver. Onde está sua concentração real?
        </p>

        <h3>2. Calcule correlação cruzada em janela de crise</h3>

        <p>
          Use uma plataforma de análise para rodar correlação entre suas principais posições em janelas que incluam 2020 e 2015. Se a correlação média da carteira é acima de 0,7 nessas janelas, você tem uma carteira que se move como um único ativo nos momentos que mais importam.
        </p>

        <h3>3. Classifique cada posição por liquidez no pior dia</h3>

        <p>
          Para cada ativo, pergunte: se eu precisasse vender 100% dessa posição na próxima semana, com o mercado em estresse, conseguiria sem desconto maior que 10%? Se a resposta for não para mais de 30% da carteira, você tem um problema de liquidez não diagnosticado.
        </p>

        <h2>Perguntas Frequentes</h2>

        <h3>Diversificar com mais ações resolve o problema?</h3>

        <p>
          Não diretamente. Adicionar 5 ações novas se elas têm o mesmo driver das atuais não muda a estrutura. O que resolve é adicionar drivers diferentes (renda fixa longa, ouro, dólar, geografia internacional não-correlacionada com Brasil) e calibrar liquidez por horizonte.
        </p>

        <h3>BDRs e ETFs internacionais protegem em crise?</h3>

        <p>
          Parcialmente. Em crises locais brasileiras (2015 perda do grau, 2018 caminhoneiros, 2020 política fiscal), BDRs ajudam porque o S&P pode estar subindo enquanto o Ibov cai. Em crises globais (2008, 2020 pandemia), o efeito desaparece, porque tudo cai junto.
        </p>

        <h3>Quanto da carteira deveria estar em ouro ou caixa?</h3>

        <p>
          Não há resposta única. Mas estudos clássicos de portfólio (Bridgewater All Weather, por exemplo) sugerem 7,5% a 15% em ouro e equivalentes, e 10% a 20% em caixa de alta liquidez para uma carteira diversificada por regime econômico.
        </p>

        <h3>Renda fixa longa é proteção em crise?</h3>

        <p>
          Em crises deflacionárias (queda de demanda, recessão sem inflação), sim. Em crises inflacionárias (estagflação tipo 1970s), não. Em crises fiscais locais como Brasil 2015, a renda fixa longa pode cair tanto quanto ações no curto prazo, embora tenda a recuperar mais rápido.
        </p>

        <h2>Conclusão: O Raio X Existe Antes do Choque</h2>

        <p>
          A maior parte dos investidores brasileiros só descobre a estrutura real da carteira quando o estresse já chegou. É tarde. Em pânico, decisões viram reativas, vendas são forçadas, e a correlação cruzada acaba sendo descoberta no pior momento possível.
        </p>

        <p>
          Estrutura, correlação e liquidez são vetores que existem antes do choque e que podem ser medidos e ajustados em mercado calmo. Quem faz o raio x da carteira hoje constrói uma posição que absorve o próximo choque sem ter que decidir nada no meio dele. Quem não faz, descobre tudo no momento errado.
        </p>
      </div>

      <!-- CTA Redentia -->
      <div class="rounded-2xl border p-6 md:p-8" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
        <h3 class="mb-3">Faça o Raio X da sua carteira em 2 minutos</h3>
        <p class="mb-5" :style="{ color: 'var(--brand-text-muted)' }">
          A {{ brand.name }} mapeia automaticamente os drivers reais, calcula correlação em janelas de estresse e classifica liquidez de cada posição. Score 0-100 e plano de rebalanceamento personalizado.
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
          <NuxtLink to="/guias/calculadora-de-dividendos" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-coins" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Calculadora de Dividendos</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">Renda passiva mensal por meta</p>
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
  title: `Raio X da Carteira em Crise: Estrutura, Correlação e Liquidez | ${brand.name}`,
  description:
    'O que realmente protege sua carteira em uma crise? Não é diversificação genérica. Em março de 2020, a correlação Ibov-S&P 500 chegou a 0,91. Os 3 vetores estruturais que separam carteiras que absorvem choque das que apenas desabam mais devagar.',
  path: '/guias/raio-x-da-carteira-em-crise',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Raio X da Carteira em Crise: Estrutura, Correlação e Liquidez',
      description:
        'Análise editorial sobre como proteger uma carteira em crise através dos três vetores estruturais: estrutura, correlação e liquidez.',
      author: { '@type': 'Organization', name: brand.name },
      publisher: {
        '@type': 'Organization',
        name: brand.name,
        logo: { '@type': 'ImageObject', url: `${brand.url}/512x512.png` },
      },
      datePublished: '2026-05-20',
      dateModified: '2026-05-24',
      articleSection: 'Premium Memo',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Diversificar com mais ações resolve o problema de correlação?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não diretamente. Adicionar 5 ações novas se elas têm o mesmo driver das atuais não muda a estrutura. O que resolve é adicionar drivers diferentes (renda fixa longa, ouro, dólar, geografia internacional) e calibrar liquidez por horizonte.',
          },
        },
        {
          '@type': 'Question',
          name: 'BDRs e ETFs internacionais protegem em crise?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Parcialmente. Em crises locais brasileiras, BDRs ajudam porque o S&P pode estar subindo enquanto o Ibov cai. Em crises globais como 2008 e 2020, o efeito desaparece, porque tudo cai junto.',
          },
        },
        {
          '@type': 'Question',
          name: 'Renda fixa longa é proteção em crise?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Em crises deflacionárias (recessão sem inflação), sim. Em crises inflacionárias tipo estagflação 1970s, não. Em crises fiscais locais, a renda fixa longa pode cair tanto quanto ações no curto prazo.',
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
        { '@type': 'ListItem', position: 3, name: 'Raio X da Carteira em Crise', item: `${brand.url}/guias/raio-x-da-carteira-em-crise` },
      ],
    },
  ],
})
</script>
