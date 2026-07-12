<script setup lang="ts">
// /calculadora/aposentadoria/[scenario] — landing pages long-tail (PR10).
// Porte verbatim dos 4 cenários da página antiga
// (Frontend/app/pages/calculadora/aposentadoria/[scenario].vue): h1,
// answer-first, blocos educacionais, FAQ e related — mesma ordem de tags.
// Visual Nu (hero creme + calculadora do design pré-preenchida via seed,
// sem redirect de query como no app antigo). Path antigo mantido (URL equity).

interface ScenarioFaq { q: string; a: string }
interface ScenarioBadge { label: string; color?: string }
interface ScenarioBlock { h3: string; paragraphs: string[] }
interface ScenarioConfig {
  h1: string
  title: string
  metaDescription: string
  answerFirst: string
  preview: string
  badges: ScenarioBadge[]
  inputs: {
    age: number
    retire: number
    income: number
    wealth: number
    monthly: number
    rate?: number
  }
  eduH2: string
  eduBlocks: ScenarioBlock[]
  faq: ScenarioFaq[]
  related: string[]
}

const baseBadges: ScenarioBadge[] = [
  { label: '100% gratuito', color: 'var(--nu-green)' },
  { label: 'Cálculo instantâneo' },
  { label: 'Regra dos 4% e FIRE' },
  { label: 'Link compartilhável' },
]

const scenarios: Record<string, ScenarioConfig> = {
  'aposentar-com-5000-mes': {
    h1: 'Quanto Preciso Investir Pra Aposentar Com R$ 5.000 por Mês?',
    title: 'Quanto Preciso Pra Aposentar Com R$ 5.000/mês?',
    metaDescription: 'Para R$ 5.000/mês na aposentadoria você precisa de R$ 1,5 milhão pela regra dos 4%. Aporte de R$ 1.500/mês começando aos 30. Calcule.',
    answerFirst:
      'Para ter R$ 5.000 por mês na aposentadoria via regra dos 4%, você precisa acumular R$ 1,5 milhão (5.000 × 12 ÷ 0,04). Começando aos 30 anos com aporte de R$ 1.500/mês a 10% a.a., você atinge essa meta aos 56 anos. Aumentando o aporte para R$ 2.500/mês, antecipa para 51 anos. R$ 5.000/mês é considerado padrão de classe média confortável no Brasil, equivale a 2x o salário mínimo de aposentadoria do INSS.',
    preview: 'R$ 5.000/mês exige R$ 1,5 milhão acumulados.',
    badges: baseBadges,
    inputs: { age: 30, retire: 60, income: 5000, wealth: 0, monthly: 1500, rate: 10 },
    eduH2: 'Aposentar com R$ 5.000/mês: o plano detalhado',
    eduBlocks: [
      {
        h3: 'Por que R$ 5.000/mês é a meta mais buscada',
        paragraphs: [
          'R$ 5.000/mês é o ponto onde uma família consegue manter padrão classe média confortável: aluguel ou financiamento (R$ 1.800), supermercado e contas básicas (R$ 1.500), transporte e lazer (R$ 800), saúde e imprevistos (R$ 900). É também o cenário mais buscado pela população entre 30 e 50 anos por representar continuidade do padrão de vida atual, sem grandes sacrifícios.',
          'Pela regra dos 4% (Safe Withdrawal Rate do Trinity Study), R$ 5.000/mês exige patrimônio acumulado de R$ 1,5 milhão (5.000 × 12 ÷ 0,04). Esse valor permite saques anuais de R$ 60 mil corrigidos pela inflação com 95%+ de probabilidade do dinheiro durar 30+ anos.',
        ],
      },
      {
        h3: 'Quanto e por quanto tempo aportar',
        paragraphs: [
          'A 10% a.a., os aportes mensais variam por horizonte: 30 anos = R$ 745/mês, 25 anos = R$ 1.135/mês, 20 anos = R$ 1.973/mês, 15 anos = R$ 3.601/mês, 10 anos = R$ 7.221/mês. Note como esticar o prazo em 5 anos quase divide o aporte pela metade. Quem começa aos 30 com 30 anos de prazo tem vantagem desproporcional sobre quem começa aos 40.',
          'Vale considerar o INSS no plano. Para quem contribui pelo teto durante 35+ anos, o INSS pode pagar R$ 4-7 mil/mês na aposentadoria por idade ou tempo de contribuição. Nesse caso, R$ 5.000/mês adicionais via patrimônio próprio podem virar R$ 9-12 mil/mês totais, padrão de vida bem confortável.',
        ],
      },
    ],
    faq: [
      {
        q: 'Quanto tempo leva pra juntar R$ 1,5 milhão investindo R$ 1.500/mês?',
        a: 'A 10% a.a., R$ 1.500/mês acumula R$ 1,5 milhão em aproximadamente 26 anos. A 11% a.a. cai para 24 anos. A 12% a.a. cai para 22 anos. A 8% a.a. sobe para 31 anos. Cada ponto percentual a mais reduz o tempo em ~1,5-2 anos, vale buscar carteira diversificada com retorno acima de 10%.',
      },
      {
        q: 'Posso descontar o INSS desses R$ 5.000?',
        a: 'Sim, e é recomendado. Se você espera receber R$ 2.500 do INSS, precisa apenas de R$ 2.500 de renda passiva via patrimônio. Isso reduz a meta de R$ 1,5 milhão para R$ 750 mil (R$ 2.500 × 300). Aporte mensal exigido cai pela metade: R$ 750/mês em 25 anos a 10% a.a.',
      },
      {
        q: 'Onde investir pra ter retorno de 10% a.a. no longo prazo?',
        a: 'Carteira diversificada brasileira: 40% Tesouro IPCA+ (proteção de longo prazo), 20% FIIs (HGLG11, KNRI11, MXRF11 cobrem logística, lajes e papel), 30% ações de dividendos (TAEE11, ITSA4, BBSE3) ou ETF DIVO11, 10% ETF internacional (IVVB11). Histórico mostra retorno médio 10-12% a.a. no longo prazo (15+ anos).',
      },
      {
        q: 'E se eu já tenho R$ 200 mil acumulados?',
        a: 'Excelente, isso reduz drasticamente o aporte exigido. R$ 200 mil aplicados a 10% a.a. viram R$ 2,2 milhões em 24 anos sem novos aportes. Combinado com aporte de R$ 1.000/mês, você atinge R$ 1,5 milhão em apenas 18 anos, antecipando a aposentadoria em 8 anos.',
      },
      {
        q: 'R$ 5.000/mês é o suficiente pra viver bem?',
        a: 'Depende do padrão e localização. Em cidades médias do interior, R$ 5 mil/mês mantém padrão classe média alta. Em São Paulo, Rio ou Brasília, é o piso de classe média sem luxos. Considere também despesas médicas que sobem com a idade (plano de saúde de R$ 800 aos 35 vira R$ 3.500 aos 65). Vale calcular com R$ 7-8 mil/mês para folga.',
      },
    ],
    related: ['aposentar-com-10000-mes', 'regra-dos-4-por-cento', 'aposentadoria-fire-aos-45'],
  },

  'aposentar-com-10000-mes': {
    h1: 'Como Aposentar Com R$ 10.000 por Mês?',
    title: 'Como Aposentar Com R$ 10.000 por Mês?',
    metaDescription: 'Para R$ 10.000/mês na aposentadoria você precisa de R$ 3 milhões pela regra dos 4%. Aporte de R$ 3.000/mês em 35 anos. Calcule grátis.',
    answerFirst:
      'Para ter R$ 10.000 por mês na aposentadoria via regra dos 4%, você precisa acumular R$ 3 milhões (10.000 × 12 ÷ 0,04). Começando aos 30 anos com aporte de R$ 3.000/mês a 10% ao ano, você atinge essa meta aos 65. Aumentando o aporte para R$ 4.500/mês, antecipa para 60 anos. R$ 10.000/mês representa Regular FIRE no contexto brasileiro, padrão de classe média alta com folga para viagens, saúde privada e qualidade de vida sem sustos.',
    preview: 'R$ 10.000/mês exige R$ 3 milhões acumulados.',
    badges: baseBadges,
    inputs: { age: 30, retire: 65, income: 10000, wealth: 0, monthly: 3000, rate: 10 },
    eduH2: 'Aposentar com R$ 10.000/mês: o caminho do Regular FIRE',
    eduBlocks: [
      {
        h3: 'R$ 10.000/mês: o padrão classe média alta',
        paragraphs: [
          'R$ 10.000/mês cobre padrão classe média alta em qualquer região do Brasil: financiamento ou aluguel folgado (R$ 3.500), alimentação confortável (R$ 2.000), plano de saúde família (R$ 1.500), transporte e lazer (R$ 1.500), reserva e imprevistos (R$ 1.500). Permite viagens internacionais anuais e qualidade de vida sem grandes restrições.',
          'É o ponto onde a aposentadoria deixa de ser sobre "sobreviver" e passa a ser sobre "viver bem". Pela regra dos 4%, exige R$ 3 milhões de patrimônio acumulado, valor desafiador mas absolutamente viável para quem começa cedo e mantém disciplina por décadas. É a meta clássica do movimento Regular FIRE no Brasil.',
        ],
      },
      {
        h3: 'Aportes por horizonte e estratégia de carteira',
        paragraphs: [
          'A 10% a.a., os aportes mensais para R$ 3 milhões: 35 anos = R$ 1.367/mês, 30 anos = R$ 2.270/mês, 25 anos = R$ 3.823/mês, 20 anos = R$ 6.622/mês. Quem começa cedo paga aporte da ordem de R$ 1.500/mês. Quem começa tarde precisa de R$ 6 mil+/mês, viável apenas para alta renda ou casal investindo em conjunto.',
          'Carteira recomendada para 25-35 anos de horizonte: 60% renda variável (40% bolsa Brasil + 20% internacional via IVVB11/WRLD11), 30% Tesouro IPCA+ longo prazo, 10% FIIs ou Reits internacionais. Rebalanceamento anual mantém a alocação alvo. À medida que a aposentadoria se aproxima, migrar gradualmente para 40% renda fixa nos últimos 10 anos protege contra crises na hora errada.',
        ],
      },
    ],
    faq: [
      {
        q: 'Quanto tempo pra juntar R$ 3 milhões investindo R$ 3.000/mês?',
        a: 'A 10% a.a., R$ 3.000/mês acumula R$ 3 milhões em aproximadamente 27 anos. A 11% a.a. cai para 25 anos. A 12% a.a. cai para 23 anos. Quem começa aos 30 atinge entre 53 e 57 anos, dependendo da carteira escolhida.',
      },
      {
        q: 'Vale a pena descontar INSS pra ter os R$ 10.000?',
        a: 'Sim, totalmente. INSS no teto paga até R$ 7.500/mês. Se você se aposenta pelo teto, precisa de apenas R$ 2.500/mês adicionais via patrimônio próprio, o que reduz a meta de R$ 3 milhões para R$ 750 mil. Aporte cai de R$ 2.270 para R$ 568/mês em 30 anos. INSS é o maior multiplicador do plano de aposentadoria.',
      },
      {
        q: 'É realista aposentar com R$ 10.000/mês começando aos 35?',
        a: 'Sim, mas exige aporte mais alto. Em 30 anos a 10% a.a. (até os 65), R$ 2.270/mês. Em 25 anos (até os 60), R$ 3.823/mês. Em 20 anos (até os 55), R$ 6.622/mês. A maioria dos brasileiros consegue atingir R$ 10 mil/mês de renda passiva entre 60 e 65 anos.',
      },
      {
        q: 'Devo focar em ações pagadoras de dividendos?',
        a: 'Para fase de fruição, sim. Ações de dividendos consistentes (TAEE11, BBSE3, ITSA4, EGIE3) e FIIs entregam renda mensal sem precisar vender ativos. Para acumulação ainda vale ETF amplo (BOVA11, IVVB11) por simplicidade e custo. Migre para foco em renda nos últimos 5-10 anos antes de parar de trabalhar.',
      },
      {
        q: 'R$ 10.000/mês precisa ser corrigido pela inflação?',
        a: 'Sim, sempre. R$ 10.000 hoje vale R$ 30.000 nominais em 25 anos com inflação de 4,5% a.a. A meta real é manter o poder de compra de R$ 10 mil de hoje, não receber R$ 10 mil nominais. Por isso a regra dos 4% considera saques crescentes anualmente para acompanhar a inflação.',
      },
    ],
    related: ['aposentar-com-5000-mes', 'regra-dos-4-por-cento', 'aposentadoria-fire-aos-45'],
  },

  'regra-dos-4-por-cento': {
    h1: 'Regra dos 4%: Quanto Você Precisa Pra Se Aposentar?',
    title: 'Regra dos 4%: Quanto Acumular Pra Aposentadoria?',
    metaDescription: 'Pela regra dos 4% (Safe Withdrawal Rate), você precisa acumular 25x sua despesa anual. Para R$ 8.000/mês, R$ 2,4 milhões. Calcule.',
    answerFirst:
      'A regra dos 4% (Safe Withdrawal Rate) determina quanto você pode sacar do patrimônio sem que ele acabe em 30+ anos. Fórmula: patrimônio = despesa anual × 25 (ou despesa mensal × 300). Para R$ 8.000/mês de renda você precisa de R$ 2,4 milhões. Para R$ 5.000/mês, R$ 1,5 milhão. Para R$ 12.000/mês, R$ 3,6 milhões. Vem do Trinity Study (1998), que provou estatisticamente que 4% é o saque seguro com 95%+ de chance do dinheiro durar décadas.',
    preview: 'Despesa mensal × 300 = patrimônio necessário.',
    badges: baseBadges,
    inputs: { age: 35, retire: 60, income: 8000, wealth: 0, monthly: 2500, rate: 10 },
    eduH2: 'Como funciona a regra dos 4%',
    eduBlocks: [
      {
        h3: 'A origem do 4% e por que ainda funciona',
        paragraphs: [
          'A regra dos 4% vem do Trinity Study (Trinity University, 1998), que analisou todas as janelas de 30 anos do mercado americano de 1925 a 1995. A conclusão: sacar 4% do patrimônio inicial no primeiro ano, depois corrigir esse saque pela inflação anualmente, mantém o dinheiro em mais de 95% dos cenários históricos. Funciona com carteira balanceada de 50-75% ações e 25-50% renda fixa.',
          'No Brasil a regra é até mais segura por causa da taxa real de juros mais alta. CDB e Tesouro pagam IPCA+5-6%, contra cerca de IPCA+2% nos EUA. Estudos brasileiros mostram que SWR de 4-5% é confortável aqui, com folga para enfrentar crises e correções de mercado sem precisar reduzir saques.',
        ],
      },
      {
        h3: 'Variações e ajustes à regra',
        paragraphs: [
          'Conservadores usam 3-3,5% (multiplicar despesa anual por 28-33), acumulam mais e quase garantem que o patrimônio dura 50+ anos. Agressivos usam 5% (multiplicar por 20), acumulam menos mas precisam estar dispostos a reduzir saques se o mercado piorar nos primeiros 10 anos. A maioria dos planejadores recomenda 3,5-4% como meio-termo seguro.',
          'A regra também precisa de flexibilidade real. Se o mercado cai 30% no primeiro ano de aposentadoria, sacar os 4% nominais sobre o saldo reduzido equivale a sacar 5,7% do patrimônio inicial, pressão alta. Usar regra de bandas dinâmicas (Guyton-Klinger) ou simplesmente reduzir saques em ano ruim e aumentar em ano bom dá mais durabilidade ao patrimônio.',
        ],
      },
    ],
    faq: [
      {
        q: 'Como calcular o patrimônio necessário usando a regra dos 4%?',
        a: 'Multiplique sua despesa mensal por 300 (ou anual por 25). Para R$ 5.000/mês, R$ 1,5 milhão. R$ 8.000/mês, R$ 2,4 milhões. R$ 10.000/mês, R$ 3 milhões. R$ 15.000/mês, R$ 4,5 milhões. R$ 20.000/mês (Fat FIRE), R$ 6 milhões. Sempre use o valor real de despesa, não o salário atual.',
      },
      {
        q: 'A regra dos 4% funciona pro Brasil?',
        a: 'Sim, e é até mais conservadora aqui. A taxa real de juros brasileira (~6% acima da inflação) é 3x maior que a americana. Carteira balanceada local rende mais retorno real, então 4% de saque cobre menos do crescimento esperado. Estudos locais sugerem que SWR de 4,5-5% é seguro no longo prazo brasileiro.',
      },
      {
        q: 'Devo usar 3%, 4% ou 5% no meu plano?',
        a: 'Depende do perfil. 3-3,5% para máxima segurança e horizonte de 50+ anos (FIRE jovem aos 30-35). 4% é o padrão para quem aposenta entre 50 e 65 anos (Trinity Study original). 5% para quem prioriza acumular menos e aceita reduzir saques em ciclos ruins de mercado. Para a maioria, 4% é o equilíbrio ideal.',
      },
      {
        q: 'A regra dos 4% considera inflação?',
        a: 'Sim. A regra original determina sacar 4% do patrimônio inicial no primeiro ano e depois corrigir o saque anual pela inflação real. Exemplo: R$ 60 mil sacados no ano 1, com inflação de 5% você saca R$ 63 mil no ano 2, e assim por diante. O patrimônio investido continua crescendo (compensa em parte os saques).',
      },
      {
        q: 'E se eu sacar mais que 4% por mês?',
        a: 'Aumenta o risco do dinheiro acabar antes de 30 anos. Sacar 5% reduz a probabilidade de sucesso de 95% para ~85%. Sacar 6% reduz para ~70%. Sacar 7%+ é estatisticamente arriscado, dinheiro tende a acabar em 20-25 anos no pior cenário. Por isso 4% é o número canônico, equilibra rentabilidade do patrimônio e durabilidade.',
      },
    ],
    related: ['aposentar-com-5000-mes', 'aposentar-com-10000-mes', 'aposentadoria-fire-aos-45'],
  },

  'aposentadoria-fire-aos-45': {
    h1: 'FIRE no Brasil: Como Aposentar Aos 45 Anos',
    title: 'FIRE no Brasil: Como Aposentar Aos 45?',
    metaDescription: 'Aposentar aos 45 anos exige poupar 50-70% da renda por 20 anos. Aporte de R$ 4.500/mês a 12% acumula R$ 4 milhões. Simule grátis.',
    answerFirst:
      'Aposentar aos 45 anos no Brasil (FIRE, Financial Independence Retire Early) exige disciplina extrema: poupar 50-70% da renda durante 20 anos investindo a 11-12% a.a. Começando aos 25 com aporte de R$ 4.500/mês a 12%, você acumula aproximadamente R$ 4 milhões aos 45, suficiente para Lean ou Regular FIRE pela regra dos 4%. Esta calculadora simula exatamente esse cenário com todos os ajustes (inflação, fase de fruição, expectativa de vida).',
    preview: 'FIRE aos 45 = poupar 50-70% por 20 anos.',
    badges: baseBadges,
    inputs: { age: 25, retire: 45, income: 4000, wealth: 0, monthly: 4500, rate: 12 },
    eduH2: 'Movimento FIRE no Brasil: viabilidade e estratégia',
    eduBlocks: [
      {
        h3: 'Os 3 sabores do FIRE: Lean, Regular e Fat',
        paragraphs: [
          'Lean FIRE: aposentadoria com renda mínima sustentável (R$ 3-4 mil/mês), patrimônio R$ 900 mil a R$ 1,2 milhão. Vida frugal, prioriza tempo livre sobre conforto material. Atingível em 15-18 anos com poupança agressiva (60-70% da renda) e renda razoável.',
          'Regular FIRE: padrão classe média confortável (R$ 6-10 mil/mês), patrimônio R$ 1,8 a 3 milhões. Maioria dos adeptos brasileiros mira aqui. Exige 18-22 anos de acumulação com poupança de 50-60% da renda. Fat FIRE: alto padrão (R$ 20 mil+/mês), patrimônio R$ 6 milhões+. Viável apenas para alta renda na fase ativa ou empreendedor com saída relevante.',
        ],
      },
      {
        h3: 'A matemática brutal do FIRE aos 45',
        paragraphs: [
          'A variável mais poderosa do FIRE é a taxa de poupança, não o retorno do investimento. Quem poupa 10% da renda leva ~50 anos para acumular 25x as despesas. Quem poupa 25%, leva ~32 anos. Quem poupa 50%, leva ~17 anos. Quem poupa 75%, leva apenas 7 anos. A relação não é linear, é exponencial.',
          'No Brasil, FIRE aos 45 começando aos 25 exige aporte de aproximadamente R$ 4.500/mês a 12% a.a. Para quem ganha R$ 9-12 mil/mês, isso representa 40-50% da renda investida. Combinado com renda extra (side hustles, freelas, sócio em negócio), é absolutamente viável. Comunidade brasileira FIRE ativa em fóruns como Reddit /r/farialimabets e /r/investimentos.',
        ],
      },
    ],
    faq: [
      {
        q: 'É realmente possível se aposentar aos 45 no Brasil?',
        a: 'Sim, mas exige condições específicas: começar cedo (idealmente 22-25 anos), poupar 50-70% da renda, ter renda suficiente (geralmente R$ 8 mil+/mês na fase ativa), investir bem (carteira diversificada com 11-12% a.a.) e manter vida relativamente frugal mesmo após FIRE. Comunidade FIRE brasileira tem casos comprovados.',
      },
      {
        q: 'Quanto preciso ter pra fazer FIRE aos 45 com R$ 4.000/mês?',
        a: 'Pela regra dos 4%, R$ 4.000/mês exige R$ 1,2 milhão acumulados (Lean FIRE). Começando aos 25 com aporte de R$ 1.700/mês a 12% a.a., você atinge essa meta aos 45. Para mais folga (R$ 6 mil/mês = Regular FIRE light), precisa de R$ 1,8 milhão, exige aporte de R$ 2.500/mês.',
      },
      {
        q: 'Como ter retorno de 12% a.a. consistente?',
        a: 'Carteira agressiva diversificada: 60% renda variável (40% bolsa Brasil via BOVA11/IBOV + 20% internacional via IVVB11), 25% FIIs (HGLG11, KNRI11, MXRF11), 15% renda fixa (Tesouro IPCA+ longo prazo). Histórico mostra retorno médio 11-13% a.a. em janelas de 15+ anos. Volatilidade anual alta mas média estabiliza no longo prazo.',
      },
      {
        q: 'Vale a pena sacrificar a juventude pra aposentar aos 45?',
        a: 'Depende dos seus valores. FIRE clássico não é "viver miseravelmente pra parar de trabalhar"; é trocar consumo de status (carro caro, casa grande, viagens de luxo) por liberdade de tempo no futuro. Versão moderna (Coast FIRE, Barista FIRE) prega equilíbrio: trabalhar menos e/ou em algo prazeroso após atingir a base patrimonial.',
      },
      {
        q: 'O que faço depois de FIRE aos 45?',
        a: 'A maioria dos FIRE brasileiros não para totalmente. Continuam trabalhando em projetos próprios, consultorias, ensino, voluntariado, ou empreendendo sem pressão financeira. FIRE é mais sobre "opcionalidade do trabalho" do que "parar de trabalhar para sempre". Renda passiva permite escolher o que fazer e quando, sem depender do salário.',
      },
    ],
    related: ['aposentar-com-5000-mes', 'aposentar-com-10000-mes', 'regra-dos-4-por-cento'],
  },
}

// remount por cenário (key = fullPath): SEO, FAQPage e seed sempre frescos
// mesmo em navegação client-side entre cenários irmãos.
definePageMeta({ key: (route) => route.fullPath })

const route = useRoute()
const slug = String(route.params.scenario || '')
const scenario = scenarios[slug]
if (!scenario) {
  throw createError({ statusCode: 404, statusMessage: 'Cenário não encontrado' })
}

const relatedScenarios = scenario.related
  .map((rel) => {
    const item = scenarios[rel]
    return item ? { slug: rel, h1: item.h1, preview: item.preview } : null
  })
  .filter((x): x is { slug: string; h1: string; preview: string } => !!x)

// blocos educacionais em bandas split alternadas (1º junto do eduH2)
const [firstEduBlock, ...restEduBlocks] = scenario.eduBlocks

const seed = {
  age: scenario.inputs.age,
  retire: scenario.inputs.retire,
  income: scenario.inputs.income,
  wealth: scenario.inputs.wealth,
  monthly: scenario.inputs.monthly,
  rate: scenario.inputs.rate,
}

// Data de atualização dinâmica (sinal de frescor pro Google — portado).
const CONTENT_VERSION = '2026-05-01'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
const lastUpdatedISO = lastUpdated.toISOString()

usePageSeo({
  title: scenario.title,
  description: scenario.metaDescription,
  path: route.path,
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadoras' },
    { name: 'Aposentadoria', path: '/calculadora/aposentadoria' },
    { name: scenario.h1, path: route.path },
  ],
  structuredData: [
    {
      '@type': 'WebApplication',
      name: `${scenario.title} - Redentia`,
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Planejamento de aposentadoria',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      dateModified: lastUpdatedISO,
      description: scenario.metaDescription,
    },
    // FAQPage é emitido pelo NuFaqAccordion — fonte única.
  ],
})

// hierarquia da coleção pros crawlers (portado da página antiga)
useHead({ link: [{ rel: 'prev', href: '/calculadora/aposentadoria' }] })
</script>

<template>
  <div>
    <!-- ============ Hero do cenário (texto verbatim, visual Nu) ============ -->
    <section class="aps__hero">
      <div class="aps__status">
        <span class="aps__live"><span class="aps__live-dot" /> Simulador ao vivo</span>
        <span aria-hidden>·</span>
        <span>Atualizado {{ lastUpdatedText }}</span>
        <span aria-hidden>·</span>
        <NuxtLink to="/calculadora/aposentadoria" class="aps__back">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Calculadora de Aposentadoria
        </NuxtLink>
      </div>
      <p class="aps__eyebrow">Cenário · Aposentadoria</p>
      <h1 class="aps__h1">{{ scenario.h1 }}</h1>
      <p class="aps__lead">{{ scenario.answerFirst }}</p>
      <ul class="aps__chips">
        <li v-for="badge in scenario.badges" :key="badge.label">
          <span class="aps__chip-dot" :style="badge.color ? { background: badge.color } : undefined" />
          {{ badge.label }}
        </li>
      </ul>
    </section>

    <!-- ============ Calculadora pré-preenchida (design) ============ -->
    <CalcRetirementSection :seed="seed" section-id="aposentadoria">
      <template #title>Aposentadoria.</template>
    </CalcRetirementSection>

    <!-- ============ Outros cenários populares (cross-link, grid de cards-link) ============ -->
    <CalcBand tone="cream" title="Outros cenários populares">
      <template #dek>
        <p>Compare planos de aposentadoria diferentes, basta clicar e a calculadora carrega já preenchida.</p>
      </template>
      <div class="aps__grid-cards">
        <NuxtLink
          v-for="rel in relatedScenarios"
          :key="rel.slug"
          :to="`/calculadora/aposentadoria/${rel.slug}`"
          class="aps__rel-card"
        >
          <span class="aps__rel-title">{{ rel.h1 }}</span>
          <span class="aps__rel-sub">{{ rel.preview }}</span>
        </NuxtLink>
      </div>
    </CalcBand>

    <!-- ============ Conteúdo educacional do cenário (verbatim, bandas split alternando) ============ -->
    <CalcSplit tone="white">
      <template #title>{{ scenario.eduH2 }}</template>
      <template v-if="firstEduBlock">
        <h3 class="aps__sub">{{ firstEduBlock.h3 }}</h3>
        <div class="aps__prose">
          <p v-for="(p, i) in firstEduBlock.paragraphs" :key="i">{{ p }}</p>
        </div>
      </template>
    </CalcSplit>

    <CalcSplit
      v-for="(block, i) in restEduBlocks"
      :key="block.h3"
      :tone="i % 2 === 0 ? 'white' : 'cream'"
      title-tag="h3"
      size="sm"
    >
      <template #title>{{ block.h3 }}</template>
      <div class="aps__prose">
        <p v-for="(p, j) in block.paragraphs" :key="j">{{ p }}</p>
      </div>
    </CalcSplit>

    <!-- ============ FAQ (anatomia EXATA do design: banda creme, cards brancos, pill IA) ============ -->
    <CalcSplit tone="cream" wide>
      <template #title>Perguntas frequentes sobre este cenário</template>
      <template #left>
        <NuxtLink to="/busca" class="aps__pill">Perguntar à Redentia AI</NuxtLink>
      </template>
      <NuFaqAccordion :key="slug" :items="scenario.faq" surface="white" />
    </CalcSplit>

    <!-- ============ CTA (texto verbatim) ============ -->
    <CalcBand tone="white">
      <div class="aps__cta">
        <h2 class="aps__cta-title">Acompanhe seu plano de aposentadoria</h2>
        <p class="aps__cta-sub">Cadastre-se na Redentia e monitore o progresso rumo à independência financeira em tempo real.</p>
        <div class="aps__cta-actions">
          <NuxtLink to="/login" class="aps__pill aps__pill--light">Criar conta grátis</NuxtLink>
          <NuxtLink to="/calculadora/aposentadoria" class="aps__pill aps__pill--outline">Voltar para a calculadora</NuxtLink>
        </div>
      </div>
    </CalcBand>
  </div>
</template>

<style scoped>
/* ——— hero ——— */
.aps__hero {
  background: var(--nu-cream);
  padding: clamp(48px, 6.5vw, 88px) clamp(22px, 5.5vw, 80px) clamp(40px, 5vw, 64px);
  animation: nu-fade .5s ease both;
}
.aps__status {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  color: var(--nu-gray); font-size: 13.5px; font-weight: 600; margin-bottom: 22px;
}
.aps__live { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-ink); font-weight: 700; }
.aps__live-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-green); flex-shrink: 0; }
.aps__back {
  display: inline-flex; align-items: center; gap: 9px;
  background: var(--nu-white); color: var(--nu-ink);
  border-radius: var(--nu-r-pill); padding: 11px 20px;
  font-size: 14.5px; font-weight: 700;
  transition: transform .18s, box-shadow .2s;
}
.aps__back:hover { transform: translateY(-1px); box-shadow: var(--nu-shadow-card); color: var(--nu-ink); }
.aps__eyebrow { margin: 0; color: var(--nu-blue); font-size: clamp(16px, 1.5vw, 19px); font-weight: 800; }
.aps__h1 {
  margin: 12px 0 0; color: var(--nu-ink);
  font-size: clamp(34px, 4.6vw, 64px); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1.04; max-width: 1080px;
}
.aps__lead {
  color: var(--nu-gray-2); font-size: clamp(16px, 1.7vw, 19px); font-weight: 500;
  line-height: 1.6; margin: 20px 0 0; max-width: 840px;
}
.aps__chips { list-style: none; display: flex; gap: 10px; flex-wrap: wrap; margin: 26px 0 0; padding: 0; }
.aps__chips li {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--nu-white); border-radius: var(--nu-r-pill);
  padding: 9px 15px; color: var(--nu-ink); font-size: 13.5px; font-weight: 700;
}
.aps__chip-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--nu-blue); flex-shrink: 0; }

/* ——— prosa da coluna direita (bandas split do design) ——— */
.aps__prose p {
  margin: 0 0 16px; color: var(--nu-gray-3); font-size: 17px; font-weight: 500;
  line-height: 1.7;
}
.aps__prose p:last-child { margin-bottom: 0; }

/* ——— sub-heading dentro da coluna direita do split ——— */
.aps__sub { margin: 0 0 14px; color: var(--nu-ink); font-size: 20px; font-weight: 800; letter-spacing: -.3px; }

/* ——— cenários relacionados (grid de cards-link) ——— */
.aps__grid-cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 16px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 980px; margin-left: auto; margin-right: auto;
}
.aps__rel-card {
  background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 26px;
  display: flex; flex-direction: column; gap: 6px;
  transition: transform .18s, box-shadow .2s;
}
.aps__rel-card:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.aps__rel-title { color: var(--nu-ink); font-size: 18px; font-weight: 800; letter-spacing: -.2px; line-height: 1.3; }
.aps__rel-sub { color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }

/* ——— pills / CTA ——— */
.aps__pill {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s, color .2s;
}
.aps__pill:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.aps__cta {
  background: var(--nu-blue); border-radius: var(--nu-r-card-lg);
  padding: clamp(34px, 5vw, 60px); text-align: center;
  max-width: 1080px; margin: 0 auto;
}
.aps__cta-title { margin: 0; color: var(--nu-white); font-size: clamp(26px, 3.4vw, 44px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.aps__cta-sub { margin: 14px auto 0; color: var(--nu-white-75); font-size: 16px; font-weight: 500; line-height: 1.6; max-width: 560px; }
.aps__cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 26px; }
.aps__cta .aps__pill { margin-top: 0; }
.aps__pill--light { background: var(--nu-cream); color: var(--nu-blue); }
.aps__pill--light:hover { background: var(--nu-white); color: var(--nu-blue-hover); }
.aps__pill--outline { background: transparent; border: 2px solid var(--nu-white-35); color: var(--nu-white); }
.aps__pill--outline:hover { background: var(--nu-white-14); color: var(--nu-white); }
</style>
