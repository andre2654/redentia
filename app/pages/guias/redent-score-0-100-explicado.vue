<template>
  <NuxtLayout name="default" title="Redent Score 0-100: O Que Mede e Por Que Você Precisa">
    <section class="flex flex-col gap-8 px-6 py-8">
      <MoleculesPageHeader
        icon="i-lucide-gauge"
        icon-color="secondary"
        title="Redent Score 0-100: O Que Mede e Por Que Você Precisa"
        description="60,6 milhões de brasileiros investem em 2025 (ANBIMA). Apenas 17% têm perfil diversificado. O resto chuta. O Redent Score é a nota 0-100 que a Redentia calcula em 9 dimensões pra mostrar, sem opinião, se sua carteira está crítica, em atenção, boa ou excelente. Entenda exatamente o que entra na conta."
      />

      <div class="flex flex-col gap-6">
        <p class="text-lg">
          Em maio de 2026, 60,6 milhões de brasileiros declararam ter dinheiro aplicado em produtos financeiros, segundo a 9ª edição do Raio X do Investidor da ANBIMA. É 36% da população. E ainda assim, apenas 17% se enquadram no perfil "Diversifica" (quem aplica em múltiplos produtos com planejamento de longo prazo). Os outros 83% misturam tudo na poupança, em CDB do banco, em alguma ação que escutaram em podcast e em FII que viraram tema de planilha do influenciador.
        </p>

        <p>
          O problema não é falta de produto. O Brasil tem 19,4 milhões de investidores PF na B3 (até maio de 2024) e dezenas de plataformas de investimento. O problema é que ninguém sabe medir a própria carteira. Não há nota. Não há benchmark próprio. Só há a sensação de estar bem alocado, validada pelo último relatório do banco ou pelo último vídeo do YouTube.
        </p>

        <p>
          O Redent Score resolve isso. É uma nota de 0 a 100 que a Redentia calcula automaticamente em 9 dimensões, com base nos ativos reais da sua carteira, conectada via Open Finance. Não é opinião. Não é projeção. É uma medida determinística, com fórmula pública neste artigo, que devolve em segundos uma resposta objetiva pra pergunta "minha carteira está bem montada?".
        </p>

        <!-- 3 stats cards -->
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Investidores</p>
            <p class="text-3xl font-bold mb-1">60,6 mi</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Brasileiros aplicam em produtos financeiros (ANBIMA, 2025)</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Diversificam</p>
            <p class="text-3xl font-bold mb-1 text-secondary">17%</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Têm perfil "Diversifica" com planejamento de longo prazo</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <p class="text-xs uppercase tracking-wider mb-2 text-secondary">Medem</p>
            <p class="text-3xl font-bold mb-1">~0%</p>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Têm uma nota objetiva da carteira inteira em 1 número</p>
          </div>
        </div>

        <h2>Conceito: por que uma nota só, e não uma planilha</h2>

        <p>
          Harry Markowitz publicou em 1952 o paper "Portfolio Selection" no Journal of Finance e ganhou o prêmio Nobel de Economia em 1990 por uma constatação que parece óbvia hoje, mas era contraintuitiva então: o risco de uma carteira não é a média do risco dos ativos individuais. Depende de como os ativos se movem em conjunto.
        </p>

        <p>
          Significa que dois investidores podem ter 10 ações cada, com a mesma volatilidade individual, e ter níveis de risco completamente diferentes. Porque se as 10 ações de um investidor são todas do setor bancário e as do outro são distribuídas entre 7 setores, o risco real é diferente em ordem de magnitude.
        </p>

        <p>
          Markowitz formalizou isso com média-variância. William Sharpe simplificou nos anos 60 (também Nobel, em 1990) e criou o Sharpe Ratio: o retorno excedente por unidade de risco. Esses dois conceitos são a fundação acadêmica de qualquer análise séria de carteira. O Redent Score parte deles, mas operacionaliza pra investidor brasileiro real, com 9 dimensões que cobrem mais que só média-variância.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          O risco de uma carteira não é a média do risco de cada ativo. Depende de como eles se correlacionam.
        </blockquote>

        <h2>Métrica: as 9 dimensões que o Redent Score mede</h2>

        <p>
          O Redent Score é calculado em 9 dimensões independentes, com pesos diferentes. Cada uma vai de 0 a 100. A nota final é a média ponderada. Aqui está cada uma com a fórmula simplificada:
        </p>

        <h3>1. Diversificação</h3>
        <p>
          Mede quantos ativos e quantos setores cobertos. Carteira com 2 ativos: score máximo 25. Com 4-6 ativos: 70. Com 7-9 ativos: 88. Com 10+: 95. Se todos os ativos forem do mesmo setor, cap automático em 30. Não importa quantos ativos você tem se eles forem todos do setor bancário, financeiro ou de commodities.
        </p>

        <h3>2. Concentração</h3>
        <p>
          Mede o peso do maior ativo individual e do maior setor. Maior ativo abaixo de 15% da carteira: score 95. Acima de 55%: score 12. Maior setor abaixo de 25%: score 95. Acima de 70%: score 8. A média das duas pontuações dá a nota. Concentração baixa não é virtude, é assimetria. O ativo concentrado pode ser o que mais entrega ou o que mais quebra. O score só mede o risco estrutural, não a tese.
        </p>

        <h3>3. Fundamentos</h3>
        <p>
          Mede a estabilidade dos fundamentos dos ativos (ROE, P/L, margem líquida, dívida líquida sobre EBITDA, CAGR de receita e lucro nos últimos 5 anos). Cada ativo entra com status "melhorando", "estável" ou "piorando". A pontuação base é 70, ajustada por +30% do peso dos ativos melhorando e −60% do peso dos piorando. Carteira com 30% em ativos com fundamentos piorando perde 18 pontos só nessa dimensão.
        </p>

        <h3>4. Renda passiva</h3>
        <p>
          Mede o DY ponderado da carteira (dividend yield somando o peso de cada ativo). DY abaixo de 2%: score 25. Entre 4-6%: 70. Acima de 9%: 95. O score não premia DY extremo (acima de 15% costuma ser distribuição extraordinária não recorrente), mas valoriza geração consistente de renda mensal.
        </p>

        <h3>5. Proteção cambial</h3>
        <p>
          Mede a exposição a ativos internacionais (BDRs, ETFs externos, criptomoedas). Exposição abaixo de 5%: score 22 (vulnerável a desvalorização do real). Entre 10-20%: 78 (saudável). Acima de 35%: cai pra 70 ou menos (sobre-exposição). O ponto ótimo é a faixa 10-30%, que oferece hedge cambial sem perder ancoragem no real.
        </p>

        <h3>6. Liquidez</h3>
        <p>
          Mede o percentual da carteira em ativos de baixa liquidez (FIIs pequenos, debêntures privadas, ações fora do IBrX). Acima de 30% em baixa liquidez: score 30. Entre 15-30%: 55. Abaixo de 15%: 88. Liquidez baixa não é defeito em si, mas em momentos de estresse pode virar trava: você não consegue desfazer posição pelo preço razoável.
        </p>

        <h3>7. Volatilidade</h3>
        <p>
          Mede o beta ponderado da carteira (beta médio dos ativos, somando o peso de cada um). Beta abaixo de 0.5: score 88 (carteira muito estável, talvez excessivamente conservadora). Entre 0.8-1.1: 68 (em linha com o mercado). Acima de 1.4: 50. Acima de 1.8: 32. Beta alto não é ruim, é ciclo: em alta de mercado ganha mais, em queda perde mais. O score reflete o estresse esperado em cenário adverso.
        </p>

        <h3>8. Potencial de retorno</h3>
        <p>
          Mede o CAGR ponderado esperado da carteira (retorno composto anual esperado de cada ativo, ponderado por peso). Abaixo de 6% ao ano: score 30. Entre 10-14%: 75. Acima de 18%: 95. O CAGR vem de modelos fundamentalistas e históricos. Não é projeção futura, é uma estimativa razoável baseada em comportamento passado e estado atual dos fundamentos.
        </p>

        <h3>9. Resiliência macro</h3>
        <p>
          Mede a diversificação macro: quanto em renda fixa pós-fixada, quanto em IPCA, quanto em internacional. Carteira balanceada (acima de 5% RF pós, 10% internacional, 5% IPCA+) atinge 90+. Carteira 100% em ações brasileiras de um único setor cai pra 25-35. Essa é a dimensão que separa carteira que sobrevive a cenários ruins (2008, 2020, alta de juros) de carteira que apenas desaba mais devagar.
        </p>

        <h2>Cálculo: como o score se forma na prática</h2>

        <p>
          O Redent Score não é mistério. É média ponderada das 9 dimensões. Cada dimensão tem peso similar (algumas com peso ligeiramente maior, como Diversificação e Concentração, por serem estruturais). A nota final cai numa das 4 bandas:
        </p>

        <ul>
          <li><strong>0-44 · Crítica.</strong> Carteira com riscos relevantes que merecem ação imediata. Tipicamente concentração alta, sem proteção cambial, com 1-2 setores dominando.</li>
          <li><strong>45-64 · Em atenção.</strong> Carteira funcional, mas com gaps importantes. Costuma faltar diversificação macro ou ter exposição excessiva a um ativo.</li>
          <li><strong>65-81 · Boa.</strong> Carteira sólida, com pontos de melhoria identificados. Diversificação razoável, mas talvez sem hedge cambial ou com concentração média num setor.</li>
          <li><strong>82-100 · Excelente.</strong> Carteira bem balanceada, com diversificação e qualidade altas. Tipicamente cobre 4 classes (RF, ações BR, FIIs, internacional), 7+ setores, sem ativo acima de 15%.</li>
        </ul>

        <h3>Por que uma nota só, e não 9 notas separadas</h3>

        <p>
          Você pode ver as 9 notas separadas na Redentia se quiser. Mas a nota agregada é o que cria ação. "Sua carteira está 78" é fácil de internalizar. "Sua diversificação está 85, sua concentração 78, sua cambial 75, sua liquidez 88..." é nove dados que ninguém retém. O Score 0-100 vira benchmark próprio. Você sabe se a versão de hoje é melhor que a de 3 meses atrás. Pode estabelecer meta concreta ("vou subir pra 80 até dezembro").
        </p>

        <h2>Exemplo: carteira A (72) vs carteira B (41)</h2>

        <p>
          Duas carteiras com R$ 100 mil cada, 10 ativos cada. Vamos ver por que uma é 72 e outra é 41.
        </p>

        <h3>Carteira A · Score 72 (Boa)</h3>

        <ul>
          <li>30% em ações brasileiras (ITUB4, WEGE3, PETR4, VALE3, ABEV3)</li>
          <li>25% em renda fixa (Tesouro Selic 15%, Tesouro IPCA+ 10%)</li>
          <li>20% em FIIs (HGLG11, MXRF11, XPLG11)</li>
          <li>15% em internacional (IVVB11, AAPL34)</li>
          <li>10% em FII de papel (KNCR11)</li>
        </ul>

        <p>
          Dimensões: Diversificação 85 (10 ativos, 7 setores), Concentração 78 (maior ativo 10%, maior setor 30%), Renda passiva 75 (DY ponderado 6,8%), Proteção cambial 75 (15% USD), Resiliência macro 80 (mix RF/ações/FII/internacional balanceado).
        </p>

        <h3>Carteira B · Score 41 (Em atenção, beirando Crítica)</h3>

        <ul>
          <li>50% em ações de bancos (ITUB4, BBDC4, BBAS3, SANB11)</li>
          <li>35% em ações de mineração e siderurgia (VALE3, CSNA3, GGBR4)</li>
          <li>15% em CSN/Petrobras (CSNA3, PETR4, PETR3)</li>
          <li>0% em renda fixa</li>
          <li>0% em internacional</li>
        </ul>

        <p>
          Dimensões: Diversificação 30 (10 ativos, só 3 setores), Concentração 22 (maior setor 50%), Proteção cambial 22 (0% USD), Resiliência macro 35 (sem RF, sem IPCA, sem internacional). Mesma quantidade de ativos, score quase metade. Porque o score mede o que importa: estrutura, não contagem.
        </p>

        <blockquote class="border-l-4 border-secondary pl-6 py-2 my-4 italic text-lg">
          Diversificação não é contar quantos ativos você tem. É contar quantos cenários sua carteira sobrevive.
        </blockquote>

        <h2>Bandas: o que cada nota significa pra ação</h2>

        <p>
          O score não é nota de moral. É benchmark de comportamento esperado. Aqui está o que cada banda costuma indicar como próximo passo:
        </p>

        <h3>Crítica (0-44) — ação imediata</h3>
        <p>
          Carteira tipicamente concentrada em 1-2 setores ou ativos. O risco é binário: se o setor vai bem, a carteira voa; se vai mal, despenca. Próximos passos: reduzir o ativo mais concentrado pra abaixo de 15%, adicionar 1-2 ativos de setor diferente, considerar renda fixa pós (Tesouro Selic) pra absorver volatilidade.
        </p>

        <h3>Em atenção (45-64) — fortalecer</h3>
        <p>
          Carteira funcional mas com gaps. Geralmente falta proteção cambial, exposição internacional ou diversificação macro. Próximos passos: adicionar IVVB11 ou BDR (Apple, Microsoft) pra subir cambial, considerar Tesouro IPCA+ pra hedge inflação, redistribuir setores.
        </p>

        <h3>Boa (65-81) — refinar</h3>
        <p>
          Carteira já sólida. As melhorias agora são marginais: trocar 1-2 ativos com fundamentos piorando por pares mais sólidos, ajustar peso entre classes, calibrar com perfil de risco.
        </p>

        <h3>Excelente (82-100) — manter</h3>
        <p>
          Carteira bem balanceada. O risco aqui não é estrutura, é complacência. Próximo passo: revisar trimestralmente se algum ativo saiu de tese, rebalancear se alguma classe ultrapassou o teto, manter disciplina nos aportes.
        </p>

        <h2>Como o Redent Score se diferencia de outros indicadores</h2>

        <p>
          Existem dezenas de indicadores de carteira. O Sharpe Ratio mede retorno por unidade de risco. O Sortino refina Sharpe focando em downside. O Treynor mede retorno por unidade de risco sistemático. O Information Ratio compara vs benchmark. Todos são úteis pra analista profissional, mas exigem cálculo de volatilidade histórica, séries temporais e benchmark.
        </p>

        <p>
          O Redent Score é diferente em três aspectos. Primeiro, é estrutural e não histórico. Não exige série de preços. Funciona desde o primeiro dia da carteira. Segundo, cobre 9 dimensões além de retorno/risco (liquidez, cambial, macro, fundamentos, concentração). Terceiro, é interpretável: você vê exatamente o que mudaria a nota.
        </p>

        <p>
          Não substitui Sharpe. Complementa. Pra investidor PF, o Redent Score é a porta de entrada. Pra gestor profissional, é o overview antes de mergulhar nas métricas avançadas.
        </p>

        <h2>Como a Redentia calcula seu score</h2>

        <p>
          O fluxo é simples:
        </p>

        <ol>
          <li>Você conecta sua carteira via Open Finance (todos os bancos e corretoras de uma vez).</li>
          <li>A Redentia identifica cada ativo (ticker, classe, setor, fundamentos).</li>
          <li>Calcula as 9 dimensões automaticamente, com pesos da sua posição.</li>
          <li>Devolve o Redent Score 0-100, com banda, dimensões individuais, e plano sugerido pra subir a nota.</li>
        </ol>

        <p>
          Tempo total: 2 minutos. Custo: zero. Atualização: automática a cada nova posição ou mudança de mercado.
        </p>

        <h2>Perguntas Frequentes</h2>

        <h3>O Redent Score é a mesma coisa que perfil de investidor?</h3>

        <p>
          Não. Perfil de investidor (conservador, moderado, arrojado) descreve sua tolerância a risco. Redent Score descreve a qualidade estrutural da carteira real. Você pode ter perfil arrojado e carteira com score 41 (mal estruturada) ou perfil conservador e carteira com score 85 (bem montada). São eixos independentes que se cruzam.
        </p>

        <h3>O score muda todo dia?</h3>

        <p>
          As dimensões estruturais (diversificação, concentração, cambial) mudam só quando você muda a carteira. As dimensões dinâmicas (fundamentos, volatilidade, retorno esperado) podem mudar com o mercado, mas não bruscamente. Tipicamente o score oscila ±2 pontos no curto prazo. Mudanças relevantes (5+ pontos) acontecem quando você compra ou vende algo relevante.
        </p>

        <h3>Como subo meu score?</h3>

        <p>
          A Redentia mostra os 3-5 movimentos com maior impacto em pontos. Tipicamente: reduzir o ativo mais concentrado, adicionar exposição internacional, incluir renda fixa pós, trocar ativo com fundamentos piorando por par mais sólido. Cada sugestão vem com simulação de quanto o score subiria.
        </p>

        <h3>Score 100 é possível?</h3>

        <p>
          Teoricamente sim, mas raro. Exige carteira com 10+ ativos em 8+ setores, sem ativo acima de 12%, sem setor acima de 25%, com 10-20% internacional, 5-10% IPCA, 10-15% RF pós, todos os ativos com fundamentos estáveis ou melhorando, beta entre 0.8 e 1.1. Costuma sair entre 85-95 na prática.
        </p>

        <h3>O Redent Score considera renda fixa privada (CDB, debênture, LCI)?</h3>

        <p>
          Sim. CDBs entram como renda fixa pós ou pré (dependendo do indexador). Debêntures e LCIs entram como renda fixa privada, com pontuação levemente penalizada por liquidez se o título for de baixa liquidez secundária. A regra: tudo que está na sua carteira via Open Finance entra no cálculo.
        </p>

        <h2>Conclusão: a métrica que faltava pro investidor PF</h2>

        <p>
          A maioria dos investidores brasileiros tem 5 apps abertos no celular, várias instituições, dezenas de ativos. Mas nenhuma medida única da própria carteira. Sem medida, não há melhora possível. É como tentar emagrecer sem balança.
        </p>

        <p>
          O Redent Score é a balança. Calcula em 9 dimensões objetivas o que a teoria moderna de portfólio (Markowitz, Sharpe) já dizia desde os anos 50-60. Devolve uma nota 0-100 com banda clara, dimensões individuais visíveis, e plano de ação pra subir a nota. Em 2 minutos, via Open Finance.
        </p>

        <p>
          Você não precisa virar gestor de portfólio. Precisa de uma nota que te diga se você está perdendo ou ganhando o jogo.
        </p>
      </div>

      <!-- CTA Redentia -->
      <div class="rounded-2xl border p-6 md:p-8" :style="{ borderColor: 'var(--brand-secondary)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-background))' }">
        <h3 class="mb-3">Descubra o score da sua carteira em 2 minutos</h3>
        <p class="mb-5" :style="{ color: 'var(--brand-text-muted)' }">
          A {{ brand.name }} calcula o Redent Score automaticamente após a conexão via Open Finance. 9 dimensões, banda Crítica/Atenção/Boa/Excelente, plano sugerido pra subir a nota.
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
          <NuxtLink to="/guias/open-finance-carteira-espalhada" class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition hover:border-secondary/30" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }">
            <UIcon name="i-lucide-network" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Open Finance: Carteira Espalhada</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">A infraestrutura que alimenta o Score</p>
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
  title: `Redent Score 0-100: O Que Mede e Por Que Você Precisa | ${brand.name}`,
  description:
    'Apenas 17% dos brasileiros diversificam carteira (ANBIMA 2025). O Redent Score é a nota 0-100 que a Redentia calcula em 9 dimensões (Markowitz, Sharpe) pra mostrar se sua carteira está Crítica, Em Atenção, Boa ou Excelente. Fórmula pública.',
  path: '/guias/redent-score-0-100-explicado',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Redent Score 0-100: O Que Mede e Por Que Você Precisa',
      description:
        'Guia editorial sobre o Redent Score da Redentia. Explica as 9 dimensões da nota (diversificação, concentração, fundamentos, renda, cambial, liquidez, volatilidade, retorno, macro), as 4 bandas (Crítica/Atenção/Boa/Excelente) e a fundação acadêmica (Markowitz 1952, Sharpe).',
      author: { '@type': 'Organization', name: brand.name },
      publisher: {
        '@type': 'Organization',
        name: brand.name,
        logo: { '@type': 'ImageObject', url: `${brand.url}/512x512.png` },
      },
      datePublished: '2026-05-26',
      dateModified: '2026-05-26',
      articleSection: 'Guia Redentia',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'O Redent Score é a mesma coisa que perfil de investidor?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não. Perfil de investidor descreve tolerância a risco. Redent Score descreve qualidade estrutural da carteira real. Você pode ter perfil arrojado e carteira score 41 (mal estruturada) ou perfil conservador e carteira score 85.',
          },
        },
        {
          '@type': 'Question',
          name: 'O score muda todo dia?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'As dimensões estruturais mudam só quando você muda a carteira. As dinâmicas (fundamentos, volatilidade) podem mudar com o mercado. Tipicamente o score oscila ±2 pontos no curto prazo; mudanças relevantes acontecem quando há compra ou venda significativa.',
          },
        },
        {
          '@type': 'Question',
          name: 'Como subo meu score?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A Redentia mostra os 3-5 movimentos com maior impacto: reduzir ativo concentrado, adicionar exposição internacional, incluir renda fixa pós, trocar ativo com fundamentos piorando. Cada sugestão vem com simulação de quanto subiria.',
          },
        },
        {
          '@type': 'Question',
          name: 'Score 100 é possível?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Teoricamente sim, mas raro. Exige 10+ ativos em 8+ setores, sem ativo acima de 12%, sem setor acima de 25%, com 10-20% internacional, 5-10% IPCA, 10-15% RF pós, fundamentos estáveis, beta entre 0.8-1.1. Costuma sair entre 85-95 na prática.',
          },
        },
        {
          '@type': 'Question',
          name: 'O Redent Score considera renda fixa privada (CDB, debênture, LCI)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim. CDBs entram como RF pós ou pré (conforme indexador). Debêntures e LCIs entram como RF privada, com pontuação levemente penalizada por liquidez se o título for de baixa liquidez secundária. Tudo que está na carteira via Open Finance entra no cálculo.',
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
        { '@type': 'ListItem', position: 3, name: 'Redent Score 0-100', item: `${brand.url}/guias/redent-score-0-100-explicado` },
      ],
    },
  ],
})
</script>
