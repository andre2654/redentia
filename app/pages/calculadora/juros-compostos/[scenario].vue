<template>
  <NuxtLayout :name="layoutName" :title="scenario.h1">
    <article class="calc-v5">
      <div class="calc-atmo calc-atmo-top" aria-hidden="true" />
      <div class="calc-atmo calc-atmo-bottom" aria-hidden="true" />

      <div class="calc-status">
        <span class="flex items-center gap-2">
          <span class="relative flex size-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span class="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          Simulador ao vivo
        </span>
        <span aria-hidden>·</span>
        <span>Atualizado {{ lastUpdatedText }}</span>
        <span aria-hidden>·</span>
        <NuxtLink to="/calculadora/juros-compostos" class="calc-back">← Calculadora de Juros Compostos</NuxtLink>
      </div>

      <header class="calc-hero">
        <p class="calc-eyebrow">Cenário · Juros Compostos</p>
        <h1 class="calc-title">{{ scenario.h1 }}</h1>
        <p class="calc-lead">{{ scenario.answerFirst }}</p>
        <ul class="calc-chips">
          <li
            v-for="badge in scenario.badges"
            :key="badge.label"
          >
            <span class="dot" :style="badge.color ? { background: badge.color } : undefined" />
            {{ badge.label }}
          </li>
        </ul>
      </header>
    </article>

    <section class="calc-aux flex flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8">
      <!-- Calculadora pre-preenchida via query params (redirect on mount) -->
      <CalculatorCompound />

      <!-- Outros cenários populares (cross-link siblings) -->
      <div
        class="flex flex-col gap-3 rounded-[30px] border p-6"
        :style="{
          backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
          borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
        }"
      >
        <h2>Outros cenários populares</h2>
        <p class="text-sm">
          Compare diferentes simulações lado a lado, basta clicar e a calculadora carrega já preenchida com os valores do cenário.
        </p>
        <div class="grid grid-cols-1 gap-2 md:grid-cols-3">
          <NuxtLink
            v-for="rel in relatedScenarios"
            :key="rel.slug"
            :to="`/calculadora/juros-compostos/${rel.slug}`"
            class="group flex min-h-[44px] items-center gap-3 rounded-md border px-3 py-3 transition hover:border-secondary/40 hover:bg-secondary/10 sm:flex-col sm:items-start sm:gap-0.5 sm:rounded-xl"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <span class="flex items-center gap-1.5 text-sm font-medium">
              <UIcon name="i-lucide-arrow-right" class="size-4 text-secondary" />
              {{ rel.h1 }}
            </span>
            <span class="text-[11px] line-clamp-2" :style="{ color: 'var(--brand-text-muted)' }">
              {{ rel.preview }}
            </span>
          </NuxtLink>
        </div>
      </div>

      <!-- Conteúdo Educacional Focado no Cenário -->
      <div class="max-w-none flex flex-col gap-4">
        <h2>{{ scenario.eduH2 }}</h2>
        <div
          v-for="block in scenario.eduBlocks"
          :key="block.h3"
          class="flex flex-col gap-2"
        >
          <h3>{{ block.h3 }}</h3>
          <p
            v-for="(p, i) in block.paragraphs"
            :key="i"
            class="leading-relaxed"
          >
            {{ p }}
          </p>
        </div>
      </div>

      <!-- FAQ específico do cenário -->
      <div class="flex flex-col gap-3">
        <h2>Perguntas frequentes sobre este cenário</h2>
        <div class="space-y-3">
          <details
            v-for="item in scenario.faq"
            :key="item.q"
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <summary class="cursor-pointer list-none flex items-center justify-between">
              {{ item.q }}
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              {{ item.a }}
            </p>
          </details>
        </div>
      </div>

      <!-- CTA -->
      <MoleculesCtaSection
        title="Quer mais controle sobre seus investimentos?"
        :description="`Cadastre-se na ${brand.name} e acompanhe sua carteira com análises em tempo real e IA.`"
        :buttons="[
          { label: 'Criar conta grátis', to: '/auth/register', icon: 'i-lucide-arrow-right', variant: 'primary' },
          { label: 'Voltar para a calculadora', to: '/calculadora/juros-compostos', variant: 'outline' },
        ]"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
// ====================================================================
// Path-based long-tail landing pages — /calculadora/juros-compostos/[scenario].
// Cada slug é um canonical próprio que o Google indexa como página
// independente. Diferente das query strings (que colapsam pro canonical
// da rota mãe), o path-based gera um documento separado por cenário,
// rankeando para queries específicas tipo "quanto rende R$ 500 por
// mês" ou "como juntar R$ 1 milhão investindo".
// ====================================================================

interface ScenarioFaq {
  q: string
  a: string
}

interface ScenarioBadge {
  label: string
  icon: string
  color?: string
}

interface ScenarioBlock {
  h3: string
  paragraphs: string[]
}

interface ScenarioConfig {
  h1: string
  title: string
  metaDescription: string
  answerFirst: string
  preview: string
  badges: ScenarioBadge[]
  inputs: { initial: number; monthly: number; rate: number; years: number }
  eduH2: string
  eduBlocks: ScenarioBlock[]
  faq: ScenarioFaq[]
  related: string[]
}

const baseBadges: ScenarioBadge[] = [
  { label: '100% gratuito', icon: 'i-lucide-check-circle', color: 'var(--brand-positive)' },
  { label: 'Cálculo instantâneo', icon: 'i-lucide-zap' },
  { label: 'Gráfico mês a mês', icon: 'i-lucide-bar-chart-3' },
  { label: 'Link compartilhável', icon: 'i-lucide-share-2' },
]

const scenarios: Record<string, ScenarioConfig> = {
  '500-reais-por-mes': {
    h1: 'Quanto Rende R$ 500 por Mês em Juros Compostos?',
    title: 'Quanto Rende R$ 500 por Mês em 20 Anos?',
    metaDescription: 'Investindo R$ 500/mês a 10,5% a.a. você acumula R$ 410 mil em 20 anos e R$ 1,12 milhão em 30 anos. Calcule grátis.',
    answerFirst:
      'Investindo R$ 500 por mês a 10,5% ao ano (média histórica do CDI), você acumula aproximadamente R$ 410 mil em 20 anos, sendo R$ 120 mil de aportes e R$ 290 mil só de juros. Em 30 anos, sobe para R$ 1,12 milhão. A fórmula é M = P × [((1+i)ⁿ - 1) / i], onde P é o aporte, i a taxa mensal e n os meses. Esta página simula exatamente esse cenário com gráfico mês a mês.',
    preview: 'R$ 500/mês a 10,5% rende R$ 410 mil em 20 anos.',
    badges: baseBadges,
    inputs: { initial: 0, monthly: 500, rate: 10.5, years: 20 },
    eduH2: 'Investir R$ 500 por mês: análise completa',
    eduBlocks: [
      {
        h3: 'Por que R$ 500 por mês é o aporte mais simulado do Brasil',
        paragraphs: [
          'R$ 500/mês é o ponto de equilíbrio onde alguém com salário entre R$ 3 mil e R$ 6 mil consegue investir sem comprometer o orçamento. Equivale a 10-15% da renda, faixa recomendada pela regra 50/30/20 de finanças pessoais. Por isso é o cenário mais procurado em buscas como "quanto rende 500 reais por mês" ou "investir 500 reais".',
          'A 10,5% ao ano (próximo da Selic atual e do CDI), o resultado em prazos diferentes mostra o efeito exponencial dos juros compostos: R$ 38 mil em 5 anos, R$ 102 mil em 10 anos, R$ 410 mil em 20 anos e R$ 1,12 milhão em 30 anos. Note como triplicar o tempo (de 10 para 30 anos) multiplica o resultado por mais de 10x.',
        ],
      },
      {
        h3: 'Onde investir R$ 500 por mês com 10,5% líquido',
        paragraphs: [
          'Para alcançar essa rentabilidade média, considere uma carteira diversificada: 50% em Tesouro Selic ou CDB de bancos médios (rende ~CDI), 25% em Tesouro IPCA+ (proteção de longo prazo), 15% em fundos imobiliários (FIIs) e 10% em ações de dividendos. Aportes automáticos via débito programado garantem disciplina e aproveitam o efeito custo médio.',
          'Lembre que R$ 500/mês investidos durante 30 anos dá R$ 180 mil em aportes, mas R$ 1,12 milhão de patrimônio. O que faz a diferença não é o valor do aporte, é o tempo. Quem começa aos 25 e investe R$ 500/mês até os 65 acumula 3x mais que quem começa aos 35 com o mesmo aporte.',
        ],
      },
    ],
    faq: [
      {
        q: 'Quanto rende R$ 500 por mês em 5 anos?',
        a: 'A 10,5% ao ano, R$ 500/mês durante 5 anos viram aproximadamente R$ 38.700, sendo R$ 30 mil de aportes e R$ 8.700 de juros. Em 5 anos os juros compostos ainda são modestos (multiplicador 1,29x), o efeito acelera depois dos 10 anos.',
      },
      {
        q: 'Quanto rende R$ 500 por mês em 10 anos?',
        a: 'A 10,5% ao ano, R$ 500/mês durante 10 anos rendem R$ 102 mil, sendo R$ 60 mil em aportes e R$ 42 mil em juros. Aqui já se vê o efeito bola de neve, os juros equivalem a 70% dos aportes.',
      },
      {
        q: 'Quanto rende R$ 500 por mês em 20 anos?',
        a: 'A 10,5% ao ano, R$ 500/mês durante 20 anos rendem aproximadamente R$ 410 mil. Os juros (R$ 290 mil) já superam os aportes (R$ 120 mil) em mais de 2x, o que é a marca do efeito composto bem desenvolvido.',
      },
      {
        q: 'Quanto rende R$ 500 por mês em 30 anos?',
        a: 'A 10,5% ao ano, R$ 500/mês durante 30 anos rendem aproximadamente R$ 1,12 milhão. Os aportes totais são R$ 180 mil, ou seja, mais de R$ 940 mil vieram só de juros sobre juros, exemplo perfeito do crescimento exponencial.',
      },
      {
        q: 'É melhor R$ 500/mês ou R$ 6 mil de uma vez por ano?',
        a: 'Mensal rende mais. Embora o total anual seja igual, R$ 500/mês começa rendendo desde janeiro, enquanto R$ 6 mil em dezembro perde 11 meses de juros. Em 20 anos a 10,5% a.a., a diferença chega a 5-7% no patrimônio final.',
      },
    ],
    related: ['1000-reais-por-mes', 'aposentar-com-1-milhao', '100-mil-em-5-anos'],
  },

  '1000-reais-por-mes': {
    h1: 'Quanto Rende R$ 1.000 por Mês em Juros Compostos?',
    title: 'Quanto Rende R$ 1.000 por Mês em 20 Anos?',
    metaDescription: 'Investindo R$ 1.000/mês a 10,5% a.a. você acumula R$ 820 mil em 20 anos e R$ 2,24 milhões em 30 anos. Calcule grátis.',
    answerFirst:
      'Investindo R$ 1.000 por mês a 10,5% ao ano, você acumula aproximadamente R$ 820 mil em 20 anos, sendo R$ 240 mil de aportes e R$ 580 mil só de juros. Em 30 anos, sobe para R$ 2,24 milhões, suficiente para uma renda passiva de R$ 9 mil/mês pela regra dos 4%. A fórmula é M = P × [((1+i)ⁿ - 1) / i], com P = aporte, i = taxa mensal, n = meses. Simulação completa abaixo com gráfico interativo.',
    preview: 'R$ 1.000/mês a 10,5% rende R$ 820 mil em 20 anos.',
    badges: baseBadges,
    inputs: { initial: 0, monthly: 1000, rate: 10.5, years: 20 },
    eduH2: 'Investir R$ 1.000 por mês: o caminho da independência financeira',
    eduBlocks: [
      {
        h3: 'R$ 1.000 por mês: o aporte que muda o jogo',
        paragraphs: [
          'R$ 1.000/mês é o aporte que separa "investir por hábito" de "construir patrimônio relevante". Para quem ganha entre R$ 5 mil e R$ 10 mil, equivale a 10-20% da renda, dentro da faixa recomendada pela regra 50/30/20. Em 20 anos a 10,5% a.a., R$ 1.000/mês entrega R$ 820 mil, suficiente para complementar aposentadoria com R$ 3.300/mês de renda passiva pela regra dos 4%.',
          'O salto entre R$ 500 e R$ 1.000/mês é mais que o dobro no resultado final, é exatamente o dobro porque o cálculo é linear no aporte. Mas o impacto psicológico é maior: dobra a velocidade até qualquer meta, divide pela metade o tempo até R$ 1 milhão.',
        ],
      },
      {
        h3: 'Como organizar a carteira para R$ 1.000/mês',
        paragraphs: [
          'Com R$ 1.000/mês cabe diversificação real, sem comprar fração ridícula de cada classe. Sugestão: R$ 400 em Tesouro IPCA+ ou CDB acima de 110% CDI, R$ 300 em FIIs (HGLG11, KNRI11, MXRF11 cobrem logística, lajes corporativas e papel), R$ 200 em ações pagadoras de dividendos (TAEE11, ITSA4) ou ETF dividendos (DIVO11) e R$ 100 em ETF amplo (BOVA11 ou IVVB11) para exposição internacional.',
          'Se você reinvestir todos os dividendos e proventos (em vez de gastar), o retorno efetivo sobe para 11-12% a.a. e o patrimônio em 20 anos chega a R$ 950 mil. Pequenas decisões de gestão fazem diferença gigante no longo prazo, e o reinvestimento é a mais barata e poderosa delas.',
        ],
      },
    ],
    faq: [
      {
        q: 'Quanto rende R$ 1.000 por mês em 10 anos?',
        a: 'A 10,5% ao ano, R$ 1.000/mês durante 10 anos rendem aproximadamente R$ 205 mil, sendo R$ 120 mil em aportes e R$ 85 mil em juros. Já é um valor que dá entrada em imóvel ou compõe reserva substancial.',
      },
      {
        q: 'Quanto rende R$ 1.000 por mês em 20 anos?',
        a: 'A 10,5% ao ano, R$ 1.000/mês durante 20 anos rendem aproximadamente R$ 820 mil. Os juros sozinhos (R$ 580 mil) representam 71% do patrimônio final, demonstração clara do efeito composto.',
      },
      {
        q: 'R$ 1.000 por mês dá pra aposentar?',
        a: 'Em 30 anos a 10,5% a.a., R$ 1.000/mês acumula R$ 2,24 milhões. Pela regra dos 4%, isso gera R$ 7.500/mês de renda passiva, equivalente a aposentadoria classe média confortável. Combinado com INSS, vira R$ 9-12 mil/mês.',
      },
      {
        q: 'Em quantos anos R$ 1.000 por mês vira R$ 1 milhão?',
        a: 'A 10,5% ao ano, R$ 1.000/mês atinge R$ 1 milhão em aproximadamente 22 anos. Aumentando a taxa para 12% a.a. (carteira mais agressiva), cai para 20 anos. Aumentando o aporte para R$ 1.300/mês a 10,5%, atinge em 20 anos.',
      },
      {
        q: 'É melhor R$ 1.000/mês ou R$ 12 mil no fim do ano?',
        a: 'Mensal sempre rende mais. R$ 1.000 em janeiro tem 11 meses a mais de juros que R$ 12 mil em dezembro. Em 20 anos, a diferença chega a 6-8% (cerca de R$ 50-65 mil) só pela ordem dos aportes, com mesmo total investido.',
      },
    ],
    related: ['500-reais-por-mes', 'aposentar-com-1-milhao', 'dobrar-dinheiro-regra-72'],
  },

  'aposentar-com-1-milhao': {
    h1: 'Como Juntar R$ 1 Milhão Investindo por Mês',
    title: 'Como Juntar R$ 1 Milhão Investindo Mensalmente',
    metaDescription: 'Para juntar R$ 1 milhão em 20 anos a 10,5% a.a. invista R$ 1.300/mês. Em 30 anos cai para R$ 450/mês. Simule grátis.',
    answerFirst:
      'Para acumular R$ 1 milhão em 20 anos a 10,5% ao ano, você precisa investir R$ 1.300 por mês. Em 30 anos, o aporte cai para R$ 450/mês, diferença gigante por causa do efeito composto. Em 10 anos, exige R$ 4.825/mês. Esta página simula exatamente o cenário de 20 anos, mas você pode ajustar o prazo direto na calculadora abaixo. Cada década adicionada divide o aporte exigido em quase 50%.',
    preview: 'R$ 1 milhão em 20 anos exige R$ 1.300/mês a 10,5%.',
    badges: baseBadges,
    inputs: { initial: 0, monthly: 1300, rate: 10.5, years: 20 },
    eduH2: 'Construir R$ 1 milhão: aporte vs prazo',
    eduBlocks: [
      {
        h3: 'O efeito do prazo na meta de R$ 1 milhão',
        paragraphs: [
          'R$ 1 milhão é a meta psicológica mais comum no Brasil porque marca o limiar entre "investidor amador" e "patrimônio relevante". O insight crítico: quanto mais cedo você começar, menor o aporte. Em 10 anos, exige R$ 4.825/mês. Em 15 anos, R$ 2.404/mês. Em 20 anos, R$ 1.300/mês. Em 25 anos, R$ 745/mês. Em 30 anos, apenas R$ 450/mês. Cada década reduz o aporte em ~50%.',
          'Esse comportamento exponencial vem dos juros compostos. Quanto mais tempo o dinheiro fica investido, mais os juros geram juros, e menor é a parte do patrimônio que precisa vir do seu bolso. No cenário de 30 anos, dos R$ 1 milhão acumulados, R$ 162 mil são aportes (16%) e R$ 838 mil são juros (84%).',
        ],
      },
      {
        h3: 'Estratégia prática para R$ 1.300 por mês',
        paragraphs: [
          'Com aporte de R$ 1.300/mês, dá para montar carteira realmente diversificada. Sugestão de alocação: R$ 500 em renda fixa (Tesouro IPCA+, CDB de bancos médios), R$ 400 em FIIs com 5-7 papéis para diversificar setor, R$ 300 em ações de dividendos ou ETF DIVO11, R$ 100 em ETF internacional (IVVB11 ou WRLD11). Aportes automáticos via débito programado eliminam a fricção mental.',
          'Aumente o aporte sempre que receber promoção ou aumento. Se sua renda subir 10%, sobe o aporte 10% também, mantém padrão de vida estável e antecipa a meta em anos. Quem nunca aumenta o aporte abre mão do principal acelerador da independência financeira.',
        ],
      },
    ],
    faq: [
      {
        q: 'Quanto preciso investir por mês para juntar R$ 1 milhão em 10 anos?',
        a: 'Em 10 anos a 10,5% a.a., você precisa investir aproximadamente R$ 4.825 por mês. Total de aportes: R$ 579 mil. Total de juros: R$ 421 mil. É um aporte alto, viável apenas para quem ganha R$ 18-25 mil/mês ou usa renda extra (sócio em negócio, side hustles).',
      },
      {
        q: 'Quanto preciso investir por mês para juntar R$ 1 milhão em 20 anos?',
        a: 'Em 20 anos a 10,5% a.a., R$ 1.300/mês é suficiente. Total de aportes: R$ 312 mil. Total de juros: R$ 688 mil. Os juros já representam 69% do patrimônio final, comprovando o poder do tempo.',
      },
      {
        q: 'Quanto preciso investir por mês para juntar R$ 1 milhão em 30 anos?',
        a: 'Em 30 anos a 10,5% a.a., apenas R$ 450/mês. Total de aportes: R$ 162 mil. Total de juros: R$ 838 mil. Praticamente todo o patrimônio vem de juros sobre juros, é o cenário mais "barato" matematicamente, exige só começar cedo.',
      },
      {
        q: 'Tem como juntar R$ 1 milhão em 5 anos?',
        a: 'Tem, mas exige aporte alto: aproximadamente R$ 12.880/mês a 10,5% a.a. ou R$ 11.500/mês a 12% a.a. Geralmente só viável com herança, venda de empresa, bônus extraordinário ou casal de alta renda combinando esforço. Para a maioria, esticar o prazo é mais realista.',
      },
      {
        q: 'R$ 1 milhão dá pra viver de renda hoje?',
        a: 'Pela regra dos 4%, R$ 1 milhão gera R$ 3.333/mês de renda passiva sustentável. Equivale a aposentadoria modesta (Lean FIRE no Brasil). Para Fat FIRE com R$ 10 mil/mês, você precisa de R$ 3 milhões. R$ 1 milhão é ótimo complemento ao INSS, não substituto integral da renda atual.',
      },
    ],
    related: ['1000-reais-por-mes', '500-reais-por-mes', '100-mil-em-5-anos'],
  },

  '100-mil-em-5-anos': {
    h1: 'Como Juntar R$ 100 Mil em 5 Anos?',
    title: 'Como Juntar R$ 100 Mil em 5 Anos Investindo',
    metaDescription: 'Para juntar R$ 100 mil em 5 anos a 10,5% a.a. invista R$ 1.280/mês. Ideal para entrada de imóvel ou meta de curto prazo.',
    answerFirst:
      'Para juntar R$ 100 mil em 5 anos a 10,5% ao ano, você precisa investir aproximadamente R$ 1.280 por mês. Total de aportes: R$ 76.800. Total de juros: R$ 23.200. Em metas de curto prazo (até 5 anos), os juros têm peso menor (23% do patrimônio final) e o que mais importa é a disciplina nos aportes. Esta calculadora simula exatamente esse cenário, ideal para entrada de imóvel, troca de carro ou meta intermediária definida.',
    preview: 'R$ 100 mil em 5 anos exige R$ 1.280/mês a 10,5%.',
    badges: baseBadges,
    inputs: { initial: 0, monthly: 1280, rate: 10.5, years: 5 },
    eduH2: 'R$ 100 mil em 5 anos: estratégia de curto prazo',
    eduBlocks: [
      {
        h3: 'Curto prazo exige menos juros, mais disciplina',
        paragraphs: [
          'Em prazos de 3 a 5 anos, o efeito dos juros compostos ainda é discreto. Para R$ 100 mil em 5 anos, dos R$ 100 mil finais apenas R$ 23 mil vêm de juros, o restante (R$ 77 mil) é aporte direto. Por isso a chave em metas curtas é proteger o principal e manter a regularidade dos aportes, não buscar retorno alto com risco.',
          'A taxa de 10,5% a.a. usada nesta simulação é conservadora e bate com Tesouro Selic, CDBs com liquidez diária ou Tesouro Prefixado de prazo equivalente. Não use renda variável (ações, FIIs) para metas de até 3 anos, a volatilidade pode te entregar o pior preço justo na hora de sacar.',
        ],
      },
      {
        h3: 'Onde investir para R$ 100 mil em 5 anos',
        paragraphs: [
          'Estratégia conservadora (recomendada): 60% em Tesouro Selic ou CDB pós-fixado de banco com FGC, 30% em Tesouro IPCA+ 2029 (proteção de inflação no prazo), 10% em CDB prefixado de 110% CDI para travar uma parte da rentabilidade. Resultado esperado: 10-11% a.a. líquido após IR de 15% (alíquota mínima após 2 anos).',
          'Se quiser acelerar e aceita risco moderado, troque parte da renda fixa por LCI/LCA isentas de IR ou um pouco de FIIs de logística (HGLG11, BTLG11) para 5-10% da carteira. Mas mantenha pelo menos 70% em renda fixa, prazo curto não perdoa erros.',
        ],
      },
    ],
    faq: [
      {
        q: 'Quanto preciso poupar por mês para juntar R$ 100 mil em 3 anos?',
        a: 'Em 3 anos a 10,5% a.a., você precisa aportar aproximadamente R$ 2.400/mês. Total de aportes: R$ 86.400. Total de juros: R$ 13.600. Prazo curto demais para juros compostos render bastante, esforço mensal alto.',
      },
      {
        q: 'Quanto preciso poupar por mês para juntar R$ 100 mil em 5 anos?',
        a: 'Em 5 anos a 10,5% a.a., aproximadamente R$ 1.280/mês. Total de aportes: R$ 76.800. Total de juros: R$ 23.200. Equilíbrio razoável entre aporte e tempo.',
      },
      {
        q: 'Quanto preciso poupar por mês para juntar R$ 100 mil em 10 anos?',
        a: 'Em 10 anos a 10,5% a.a., apenas R$ 482/mês. Total de aportes: R$ 57.840. Total de juros: R$ 42.160. Esticar o prazo de 5 para 10 anos divide o aporte exigido em ~63%.',
      },
      {
        q: 'Qual o melhor investimento para juntar R$ 100 mil em 5 anos?',
        a: 'Carteira conservadora com 70%+ renda fixa: Tesouro Selic, CDBs pós-fixados de bancos médios com FGC, LCI/LCA isentas de IR. Evite ações e FIIs concentrados, volatilidade não compensa em prazo tão curto. Tesouro IPCA+ 2029 também serve para travar inflação.',
      },
      {
        q: 'Vale a pena financiar imóvel se eu ainda não tenho R$ 100 mil de entrada?',
        a: 'Depende do prazo. Se você precisa do imóvel em 1-2 anos, financiar e pagar juros bancários é caro mas necessário. Se aceita esperar 4-5 anos, juntar R$ 100 mil de entrada e financiar 80% reduz juros totais em R$ 100-300 mil dependendo do valor do imóvel. Geralmente compensa esperar.',
      },
    ],
    related: ['500-reais-por-mes', '1000-reais-por-mes', 'aposentar-com-1-milhao'],
  },

  'dobrar-dinheiro-regra-72': {
    h1: 'Em Quantos Anos Meu Dinheiro Dobra? (Regra de 72)',
    title: 'Regra de 72: Em Quantos Anos Meu Dinheiro Dobra?',
    metaDescription: 'Pela Regra de 72, divida 72 pela taxa anual para saber em quantos anos seu dinheiro dobra. A 10% rende em 7,2 anos. Calcule grátis.',
    answerFirst:
      'A Regra de 72 é o atalho matemático para descobrir em quantos anos seu dinheiro dobra: divida 72 pela taxa de juros anual. A 6% a.a. dobra em 12 anos. A 10% a.a. dobra em 7,2 anos. A 12% a.a. dobra em 6 anos. A 15% a.a. dobra em 4,8 anos. Esta calculadora simula R$ 10 mil parados (sem aporte) a 10% a.a. por 8 anos, mostrando que o valor inicial mais que dobra para R$ 21,4 mil. Aproximação precisa para taxas entre 6% e 15%.',
    preview: 'A 10% a.a. seu dinheiro dobra em 7,2 anos.',
    badges: baseBadges,
    inputs: { initial: 10000, monthly: 0, rate: 10, years: 8 },
    eduH2: 'Regra de 72: o atalho mental dos juros compostos',
    eduBlocks: [
      {
        h3: 'Como surgiu e por que funciona',
        paragraphs: [
          'A Regra de 72 vem do logaritmo natural de 2 (≈0,693). A fórmula exata para dobrar capital é ln(2) ÷ ln(1+i), o que dá 7,27 anos a 10% a.a. A simplificação 72÷10 = 7,2 está apenas 1% errada e cabe no cálculo de cabeça. É um dos truques mentais mais úteis em finanças pessoais, atribuído a Luca Pacioli (1494) e popularizado por Albert Einstein.',
          'A regra funciona porque os juros compostos crescem em progressão geométrica. Cada período aplica a taxa sobre o saldo anterior, então dobrar o capital exige um número fixo de períodos para qualquer taxa, e esse número é aproximadamente 72÷taxa. Funciona muito bem entre 6% e 15%; fora dessa faixa, use 70 (taxas baixas) ou 76 (taxas altas) para mais precisão.',
        ],
      },
      {
        h3: 'Aplicações práticas no Brasil',
        paragraphs: [
          'Tesouro Selic com Selic em 12% a.a.: seu dinheiro dobra a cada 6 anos. R$ 50 mil viram R$ 100 mil em 6 anos, R$ 200 mil em 12, R$ 400 mil em 18, R$ 800 mil em 24, R$ 1,6 milhão em 30 anos. Essa progressão é a essência da independência financeira no Brasil.',
          'A regra também serve como termômetro de inflação. Se a inflação acumula 6% a.a., seu poder de compra cai pela metade em 12 anos. Por isso renda fixa que paga apenas inflação + 0,5% (poupança em Selic baixa) destrói patrimônio no longo prazo. Sempre busque retorno real (acima da inflação) de pelo menos 4-5% a.a.',
        ],
      },
    ],
    faq: [
      {
        q: 'Em quantos anos meu dinheiro dobra a 6% ao ano?',
        a: 'Pela Regra de 72: 72 ÷ 6 = 12 anos. R$ 100 mil viram R$ 200 mil em 12 anos, R$ 400 mil em 24 anos, R$ 800 mil em 36 anos. A 6% a.a. é o piso defensável em renda fixa, abaixo disso você está perdendo da inflação a maior parte do tempo.',
      },
      {
        q: 'Em quantos anos meu dinheiro dobra a 10% ao ano?',
        a: 'Pela Regra de 72: 72 ÷ 10 = 7,2 anos. R$ 10 mil viram R$ 20 mil em 7,2 anos, R$ 40 mil em 14,4 anos, R$ 80 mil em 21,6 anos. Taxa próxima ao CDI histórico brasileiro, base do planejamento de longo prazo.',
      },
      {
        q: 'Em quantos anos meu dinheiro dobra a 12% ao ano?',
        a: 'Pela Regra de 72: 72 ÷ 12 = 6 anos. R$ 50 mil viram R$ 100 mil em 6 anos, R$ 200 mil em 12 anos, R$ 400 mil em 18 anos. Taxa atingível com CDB 110% CDI ou Selic alta, ótimo cenário para acumulação.',
      },
      {
        q: 'A Regra de 72 funciona com inflação?',
        a: 'Sim, e é poderosa. Inflação de 4,5% a.a. faz seu poder de compra cair pela metade em 16 anos (72÷4,5). Por isso retorno nominal de 8% com inflação de 4,5% representa retorno real de apenas ~3,3%, e dobra o patrimônio real em 22 anos, não 9. Sempre raciocine em retorno real para metas de longo prazo.',
      },
      {
        q: 'Existe Regra de 144 para triplicar dinheiro?',
        a: 'Quase. Para triplicar (×3), use a Regra de ~115. A 10% a.a., 115÷10 = 11,5 anos para triplicar. A 12% a.a., 9,6 anos. Existe também a Regra de 144 para quadruplicar (×4), mas o uso prático é menor, na maioria dos planejamentos a Regra de 72 cobre as necessidades.',
      },
    ],
    related: ['500-reais-por-mes', '1000-reais-por-mes', 'aposentar-com-1-milhao'],
  },
}

const route = useRoute()
const router = useRouter()
const slug = computed(() => String(route.params.scenario || ''))
const scenario = computed<ScenarioConfig>(() => {
  const found = scenarios[slug.value]
  if (!found) {
    throw createError({ statusCode: 404, statusMessage: 'Cenário não encontrado' })
  }
  return found
})

const relatedScenarios = computed(() =>
  scenario.value.related
    .map((slugRel) => {
      const item = scenarios[slugRel]
      if (!item) return null
      return { slug: slugRel, h1: item.h1, preview: item.preview }
    })
    .filter((x): x is { slug: string; h1: string; preview: string } => !!x),
)

const brand = useBrand()
const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated',
)

// Pre-fill calculator: redirect once with query params so Compound.vue
// reads them on mount via parseNumberParam. Using `replace` to avoid
// dirty history. The path stays the same so canonical points to the
// path-based URL (/calculadora/juros-compostos/[scenario]).
onMounted(() => {
  if (process.client && !route.query.monthly && !route.query._seeded) {
    router.replace({
      path: route.path,
      query: {
        initial: String(scenario.value.inputs.initial),
        monthly: String(scenario.value.inputs.monthly),
        rate: String(scenario.value.inputs.rate),
        years: String(scenario.value.inputs.years),
        _seeded: '1',
      },
    })
  }
})

// Data de atualização dinâmica para sinal de frescor pro Google.
const CONTENT_VERSION = '2026-05-01'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})
const lastUpdatedISO = lastUpdated.toISOString()

const pageTitle = computed(() => `${scenario.value.title} | ${brand.name}`)
const pageDescription = computed(() => scenario.value.metaDescription)

usePageSeo({
  title: pageTitle,
  description: pageDescription,
  path: route.path,
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadora' },
    { name: 'Juros Compostos', path: '/calculadora/juros-compostos' },
    { name: scenario.value.h1, path: route.path },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `${scenario.value.title} - ${brand.name}`,
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Calculadora financeira',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      dateModified: lastUpdatedISO,
      description: scenario.value.metaDescription,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: scenario.value.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ],
})

// Indica relação com a página mãe via rel=prev (não obrigatório, mas
// ajuda crawlers entender hierarquia em coleções de cenários).
useHead({
  link: [
    { rel: 'prev', href: '/calculadora/juros-compostos' },
  ],
})

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})
</script>
