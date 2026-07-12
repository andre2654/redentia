<script setup lang="ts">
// /calculadora/aposentadoria — calculadora do PR10 (fase 2).
// Contrato de UX: docs/redentia-nu/designs/Redentia Calculadoras Nu.dc.html
// (sliders + número-herói + gráfico + steps + fórmula + FAQ accordion).
// Contrato de SEO (regra nº1): TODO o texto da página antiga
// (Frontend/app/pages/calculadora/aposentadoria.vue) verbatim, na MESMA
// ordem de tags (h1 → h2/h3/h4 → p → li → tabela → FAQ). Muda o visual.
// Path antigo mantido (/calculadora/aposentadoria) — preserva URL equity.
import type { RetirementSeed } from '~/components/calculadoras/aposentadoria/CalcRetirementSection.vue'

const route = useRoute()

// deep-links ?age=&retire=&life=&income=&wealth=&monthly=&rate=&withdrawal=
// &inflation=&inss= (comportamento portado do Retirement.vue antigo —
// cenários populares carregam a simulação preenchida)
function parseNumberParam(value: unknown): number | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.trim() === '') return null
  const num = Number(raw.replace(',', '.'))
  return Number.isFinite(num) ? num : null
}

const seed = computed<RetirementSeed | undefined>(() => {
  const q = route.query
  const parsed = {
    age: parseNumberParam(q.age),
    retire: parseNumberParam(q.retire),
    life: parseNumberParam(q.life),
    income: parseNumberParam(q.income),
    wealth: parseNumberParam(q.wealth ?? q.atual),
    monthly: parseNumberParam(q.monthly),
    rate: parseNumberParam(q.rate),
    withdrawal: parseNumberParam(q.withdrawal),
    inflation: parseNumberParam(q.inflation),
    inss: parseNumberParam(q.inss),
  }
  if (Object.values(parsed).every((v) => v === null)) return undefined
  return Object.fromEntries(
    Object.entries(parsed).filter(([, v]) => v !== null),
  ) as RetirementSeed
})

// Data de atualização dinâmica (sinal de frescor — portado da página antiga).
const CONTENT_VERSION = '2026-05-01'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
const lastUpdatedISO = lastUpdated.toISOString().slice(0, 10)

// Cenários populares — long-tail SEO via deep-links (texto/URLs verbatim).
const popularScenarios = [
  { label: 'Aposentar com R$ 5.000/mês', sub: 'Padrão classe média', to: '/calculadora/aposentadoria?age=35&retire=65&income=5000&monthly=1500&rate=10' },
  { label: 'Aposentar com R$ 10.000/mês', sub: 'Renda confortável', to: '/calculadora/aposentadoria?age=35&retire=65&income=10000&monthly=3000&rate=10' },
  { label: 'Aposentar aos 50 anos', sub: 'FIRE antecipado', to: '/calculadora/aposentadoria?age=30&retire=50&income=6000&monthly=4000&rate=11' },
  { label: 'Lean FIRE, R$ 3.000/mês', sub: 'Vida frugal', to: '/calculadora/aposentadoria?age=30&retire=50&income=3000&monthly=2500&rate=11' },
  { label: 'Fat FIRE, R$ 20.000/mês', sub: 'Alto padrão', to: '/calculadora/aposentadoria?age=30&retire=45&income=20000&monthly=12000&rate=12' },
  { label: 'Renda passiva FIIs R$ 8.000/mês', sub: 'Foco em dividendos', to: '/calculadora/aposentadoria?age=35&retire=60&income=8000&monthly=2500&rate=10' },
  { label: 'Aposentar em 20 anos a partir dos 30', sub: 'Plano agressivo', to: '/calculadora/aposentadoria?age=30&retire=50&income=8000&monthly=5000&rate=11' },
  { label: 'Aposentar em 15 anos com aporte agressivo', sub: 'FIRE agressivo', to: '/calculadora/aposentadoria?age=35&retire=50&income=10000&monthly=8000&rate=12' },
  { label: 'Complementar INSS R$ 3.000', sub: 'Foco no extra', to: '/calculadora/aposentadoria?age=40&retire=65&income=8000&monthly=1200&rate=10&inss=3000' },
  { label: 'FIRE aos 45 com R$ 5k aporte', sub: 'Quem ganha bem', to: '/calculadora/aposentadoria?age=30&retire=45&income=8000&monthly=5000&rate=12' },
  { label: 'Aposentar em 10 anos (Fat FIRE)', sub: 'Curto prazo extremo', to: '/calculadora/aposentadoria?age=40&retire=50&income=15000&monthly=15000&rate=12' },
  { label: 'Calcular meta com 4% de saque seguro', sub: 'Regra dos 4%', to: '/calculadora/aposentadoria?age=35&retire=60&income=6000&monthly=2000&rate=10&withdrawal=4' },
  { label: 'Aposentar com previdência privada (PGBL)', sub: 'Aporte com benefício fiscal', to: '/calculadora/aposentadoria?age=35&retire=60&income=8000&monthly=2000&rate=10' },
]

const pillarCards = [
  { title: '1. Tempo de Acumulação', body: 'O fator mais poderoso. Cada década adicional de investimento dobra ou triplica o patrimônio final por conta dos juros compostos. Quem começa aos 25 acumula 3x mais que quem começa aos 35.' },
  { title: '2. Taxa de Aporte', body: 'O percentual da renda investido define a velocidade. 10% leva a aposentadoria padrão aos 65, 25% leva a Regular FIRE aos 55, 50%+ leva a aposentadoria antecipada agressiva (Lean ou Fat FIRE).' },
  { title: '3. Retorno dos Investimentos', body: 'Trocar 8% por 12% a.a. (acréscimo de 4 pontos) reduz o tempo até a meta em ~35%. Carteira diversificada com rebalanceamento anual entrega historicamente 10-12% líquidos no Brasil.' },
  { title: '4. Custo de Vida na Aposentadoria', body: 'Subestimar o custo de vida pós-aposentadoria é o erro mais comum. Lazer, saúde, viagens e gastos médicos crescem com a idade. Use 70-90% da renda atual como base, não 50%.' },
]

const swrItems = [
  { strong: '3,5%:', rest: ' mais conservador, indicado pra FIRE longo (40+ anos de retirada). Multiplique a despesa anual por ~285.' },
  { strong: '4%:', rest: ' regra clássica do Trinity Study, calibrada pra horizonte de 30 anos. Multiplique por 300.' },
  { strong: '4,5% a 5%:', rest: ' indicado pra horizontes de 20 a 25 anos. Multiplique por 240 a 267.' },
  { strong: '5% a 6% (Brasil):', rest: ' alguns autores defendem essa faixa porque a taxa real brasileira é historicamente maior que a americana (Selic real costuma ficar acima do treasury real). Use com cautela e revise a cada 3 a 5 anos.' },
]

const fireCards = [
  { title: 'Lean FIRE', body: 'Aposentar com o mínimo necessário, estilo de vida frugal. Renda alvo: R$ 3-4 mil/mês. Patrimônio: R$ 900 mil a R$ 1,2 milhão. Ideal pra quem prioriza tempo livre sobre conforto material.' },
  { title: 'Regular FIRE', body: 'Manter padrão de vida classe média confortável. Renda alvo: R$ 6-10 mil/mês. Patrimônio: R$ 1,8 a 3 milhões. Maioria dos adeptos brasileiros mira nesse cenário.' },
  { title: 'Fat FIRE', body: 'Aposentar com alto padrão de vida e folga ampla. Renda alvo: R$ 20 mil+/mês. Patrimônio: R$ 6 milhões+. Exige renda alta na fase ativa ou negócio próprio bem-sucedido.' },
]

const wealthRows = [
  ['R$ 3.000', 'R$ 36.000', 'R$ 900.000', 'R$ 681/mês'],
  ['R$ 5.000', 'R$ 60.000', 'R$ 1.500.000', 'R$ 1.135/mês'],
  ['R$ 8.000', 'R$ 96.000', 'R$ 2.400.000', 'R$ 1.819/mês'],
  ['R$ 10.000', 'R$ 120.000', 'R$ 3.000.000', 'R$ 2.270/mês'],
  ['R$ 15.000', 'R$ 180.000', 'R$ 4.500.000', 'R$ 3.405/mês'],
  ['R$ 20.000', 'R$ 240.000', 'R$ 6.000.000', 'R$ 4.540/mês'],
]

const realScenarios = [
  {
    h3: 'Cenário 1: Aposentadoria Padrão aos 65',
    profile: [
      '35 anos hoje, aposentadoria aos 65 (30 anos de acumulação)',
      'Renda desejada: R$ 8.000/mês (já considerando INSS de R$ 2.500)',
      'Aporte mensal: R$ 1.800',
      'Retorno: 10% a.a.',
    ],
    result: 'Patrimônio projetado: R$ 4,07 milhões. Patrimônio necessário (regra dos 4%): R$ 1,65 milhão. Plano viável com folga.',
  },
  {
    h3: 'Cenário 2: Lean FIRE aos 50',
    profile: [
      '30 anos hoje, aposentadoria aos 50 (20 anos)',
      'Renda desejada: R$ 4.000/mês (estilo de vida frugal)',
      'Aporte mensal: R$ 3.000 (50% da renda)',
      'Retorno: 11% a.a.',
    ],
    result: 'Patrimônio projetado: R$ 2,52 milhões. Patrimônio necessário: R$ 1,2 milhão. Aposentadoria antecipada viável.',
  },
  {
    h3: 'Cenário 3: Fat FIRE aos 45',
    profile: [
      '30 anos hoje, aposentadoria aos 45 (15 anos)',
      'Renda desejada: R$ 20.000/mês (alto padrão)',
      'Aporte mensal: R$ 12.000 (renda alta + side hustles)',
      'Retorno: 12% a.a.',
    ],
    result: 'Patrimônio projetado: R$ 5,49 milhões. Patrimônio necessário: R$ 6 milhões. Quase lá, precisa esticar 2 anos ou aumentar aporte em 15%.',
  },
]

const howToSteps = [
  { title: 'Defina sua Idade Atual e Idade de Aposentadoria', html: 'A diferença entre as duas é o tempo de acumulação. Aposentadoria padrão no Brasil é 65 (homem) e 62 (mulher). FIRE costuma ser 45-55. Quanto mais cedo, mais ambicioso o plano.' },
  { title: 'Defina a Renda Mensal Desejada', html: 'Quanto você quer receber por mês depois de aposentado, em valor de hoje. A calculadora ajusta pela inflação. Pense em 70-90% da sua renda atual como referência.' },
  { title: 'Calcule o Patrimônio Necessário', html: 'A calculadora aplica a regra dos 4% (ou a taxa que você definir) sobre a renda anual ajustada pela inflação. O resultado é o patrimônio total que você precisa ter ao se aposentar.' },
  { title: 'Verifique a Viabilidade do Plano', html: 'Com seu aporte mensal e retorno esperado, a calculadora projeta o patrimônio que você terá ao se aposentar e compara com o necessário. Se for menor, mostra o gap e os cenários alternativos.' },
  { title: 'Ajuste o Aporte Mensal', html: 'Se o plano não for viável, aumente o aporte, estenda o tempo até aposentar ou reduza a renda desejada. A calculadora mostra cenários (trabalhar mais 3 anos, aumentar aporte 20%, reduzir renda 20%) pra ajudar na decisão.' },
]

const previdenciaCards = [
  { title: 'PGBL (Plano Gerador de Benefício Livre)', body: 'Os aportes são dedutíveis da base de cálculo do IR, até 12% da renda bruta tributável anual. No resgate, a tributação incide sobre o TOTAL acumulado (principal + rendimentos). Indicado pra quem declara o IR no modelo COMPLETO e quer reduzir o imposto da fase ativa. Ganho fiscal forte na entrada, custo no resgate.' },
  { title: 'VGBL (Vida Gerador de Benefício Livre)', body: 'Os aportes NÃO são dedutíveis. Em compensação, a tributação no resgate incide só sobre os RENDIMENTOS, não sobre o principal. Indicado pra quem declara IR no modelo SIMPLIFICADO ou já estourou o limite de 12% do PGBL. Também é a escolha pra planejamento sucessório, valores não entram em inventário e pagam ITCMD reduzido.' },
]

const tipCards = [
  { title: '1. Aumente a Taxa de Poupança', body: 'A variável mais poderosa do FIRE é a taxa de poupança. Cada 5% a mais reduz o tempo até a meta em 2-3 anos. Vale mais que perseguir retorno extra com risco alto.' },
  { title: '2. Reduza Custos Recorrentes', body: 'Cortar R$ 500/mês de gasto recorrente equivale a aumentar R$ 500 de aporte. Em 20 anos a 10% a.a., são R$ 380 mil a mais no patrimônio.' },
  { title: '3. Diversifique a Carteira', body: 'Carteira balanceada (Tesouro IPCA+, FIIs, ações dividendos, ETFs) entrega 10-12% a.a. com volatilidade administrável. Renda fixa pura é segura demais pra metas longas.' },
  { title: '4. Use Previdência Privada com Cuidado', body: 'PGBL e VGBL fazem sentido pra quem aproveita dedução do IR ou perfil agressivo de longo prazo. Mas sempre compare taxa de administração, plano com taxa >1% a.a. quase nunca vale.' },
  { title: '5. Não Subestime a Saúde', body: 'Plano de saúde de R$ 800/mês aos 35 vira R$ 3.500/mês aos 65. Calcule isso na renda desejada da aposentadoria, gastos médicos crescem exponencialmente com a idade.' },
  { title: '6. Revise o Plano Anualmente', body: 'Aumento salarial, mudança de objetivo, novo filho, herança, crise econômica, todos exigem ajuste no plano. Recalcule pelo menos uma vez por ano e em todo evento de vida relevante.' },
]

// Rankings relacionados — pontes pra carteiras de renda passiva e
// dividendos, alvo natural de quem planeja aposentadoria (verbatim).
const relatedRankings = [
  { to: '/ranking/maiores-dividend-yield', title: 'Maiores pagadores de dividendos', sub: 'Top 50 ações e FIIs por DY na B3' },
  { to: '/ranking/buy-and-hold', title: 'Carteira Buy and Hold', sub: 'Score Redent pra horizonte longo' },
]

// FAQs verbatim da página antiga (14). O FAQPage JSON-LD é emitido pelo
// NuFaqAccordion — fonte única, mesmo padrão do app antigo.
const faqItems = [
  { q: 'Quanto preciso acumular para me aposentar?', a: 'Use a regra dos 4%: multiplique sua despesa mensal desejada por 300. Para R$ 5.000/mês, você precisa de R$ 1,5 milhão. Para R$ 10.000/mês, R$ 3 milhões. Para R$ 20.000/mês (Fat FIRE), R$ 6 milhões. Ajuste pelo INSS que vai receber e considere a inflação acumulada até a aposentadoria, pode ser que R$ 5.000 daqui a 25 anos exija renda nominal de R$ 12.000 pra preservar o poder de compra.' },
  { q: 'É possível se aposentar aos 40 ou 45 anos no Brasil (FIRE)?', a: 'Sim, mas exige disciplina extrema e algumas condições. Você precisa: 1) Poupar 50-70% da renda durante 15-20 anos, 2) Começar cedo (idealmente aos 22-25 anos), 3) Ter renda alta ou múltiplas fontes (side hustles, freelas), 4) Investir bem (carteira diversificada com 11-12% a.a.), 5) Viver de forma frugal e estabelecer um padrão sustentável pro resto da vida. É desafiador mas comprovadamente viável, há comunidade FIRE crescente no Brasil.' },
  { q: 'Devo contar com o INSS no planejamento da aposentadoria?', a: 'Depende muito da sua idade. Se você tem 45+ anos e contribui regularmente há 20+ anos, pode contar com INSS como complemento confiável (R$ 1.500-7.500 dependendo do salário de contribuição). Se tem 25-40 anos, seja conservador, o sistema previdenciário brasileiro pode mudar muito até você se aposentar (idade mínima, fator previdenciário, alíquotas). Trate o INSS como bônus de R$ 1.000-3.000/mês, não como pilar do seu plano.' },
  { q: 'O que é a regra dos 4% (Safe Withdrawal Rate)?', a: 'A regra dos 4% diz que você pode sacar 4% do seu patrimônio inicial por ano, corrigido pela inflação, com altíssima probabilidade (95%+) do dinheiro durar 30+ anos. Vem do Trinity Study (1998), que analisou dados históricos do mercado americano. Quem é mais conservador usa 3,5% (multiplicar despesa anual por ~285). Quem aceita mais risco de erosão usa 5% (multiplicar por 240). No Brasil, com taxa real de juros mais alta, a regra é até mais segura.' },
  { q: 'Qual a taxa de retirada segura no Brasil?', a: 'A regra clássica é 4% (Trinity Study, EUA). No Brasil, com Selic real historicamente maior, autores defendem 5% a 6% pra horizonte de 25 a 30 anos. Pra FIRE longo (40+ anos de retirada), use 3,5% pra ter mais segurança. Importante: 4% é sobre o saldo INICIAL, ajustado por inflação a cada ano, não recalculado sobre o saldo do ano corrente. Reavalie a SWR a cada 3 a 5 anos conforme o ambiente macro mudar.' },
  { q: 'PGBL ou VGBL para aposentadoria?', a: 'PGBL se você declara o IR completo, pode deduzir até 12% da renda bruta tributável (benefício fiscal forte na fase de aporte). VGBL se você declara simplificada OU quer planejamento sucessório (não entra em inventário, paga ITCMD reduzido). PGBL tributa sobre o TOTAL resgatado, VGBL só sobre os rendimentos. Tabela regressiva (10 anos = 10% de IR final) compensa muito a longo prazo. Em ambos, fuja de planos com taxa de administração acima de 1% ao ano.' },
  { q: 'Qual a diferença entre Lean FIRE, Regular FIRE e Fat FIRE?', a: 'Lean FIRE: aposentar com renda mínima e estilo frugal (R$ 3-4 mil/mês, patrimônio R$ 900 mil a R$ 1,2 milhão). Regular FIRE: padrão médio de classe média (R$ 6-10 mil/mês, R$ 1,8 a 3 milhões de patrimônio). Fat FIRE: alto padrão de vida com folga (R$ 20 mil+/mês, R$ 6 milhões+ de patrimônio). A escolha depende do seu padrão atual, expectativas e quanto sacrifício você aceita na fase de acumulação.' },
  { q: 'Como a inflação afeta o planejamento de aposentadoria?', a: 'A inflação corrói brutalmente o poder de compra ao longo de 20-30 anos. Com inflação anual de 4,5% (média histórica brasileira), R$ 5.000 hoje viram R$ 16.500 em 25 anos só pra manter o mesmo padrão. Por isso a calculadora ajusta a renda desejada pela inflação até a aposentadoria, e em fase de fruição calcula o saque crescente nominal pra preservar o real. Sempre pense em renda real, não nominal.' },
  { q: 'Por que retorno na acumulação é diferente do retorno na fruição?', a: 'Na acumulação você pode ter carteira mais agressiva (60% renda variável, 40% renda fixa) com retorno esperado de 10-12% a.a., porque tem 20-30 anos pra absorver volatilidade. Na fruição (já aposentado), prioridade é preservação de capital e renda estável, então a carteira fica mais conservadora (30% renda variável, 70% renda fixa) com retorno menor (5-8% a.a.). A calculadora separa as duas fases pra projetar com mais realismo.' },
  { q: 'Vale a pena ter previdência privada (PGBL/VGBL)?', a: 'Em casos específicos: PGBL faz sentido pra quem declara IR no modelo completo e quer reduzir base tributária no presente (até 12% da renda bruta). VGBL é melhor pra quem usa modelo simplificado ou já estourou o limite do PGBL. Em ambos, fuja de planos com taxa de administração acima de 1% a.a., a maioria entrega rendimento pior que Tesouro Direto comprado direto. Compare sempre o líquido após taxa.' },
  { q: 'Quanto preciso poupar por mês pra aposentar com R$ 5.000/mês?', a: 'Depende do prazo: Em 30 anos a 10% a.a. (do zero), você precisa aportar R$ 745/mês. Em 25 anos, R$ 1.135/mês. Em 20 anos, R$ 1.973/mês. Em 15 anos, R$ 3.601/mês. Em 10 anos, R$ 7.221/mês. Note como cada década adicional reduz o aporte em 40-50%. Quem começa cedo tem vantagem desproporcional sobre quem começa tarde.' },
  { q: 'É melhor focar em acumular ou em renda passiva imediata (FIIs)?', a: 'Depende do seu prazo e perfil. Quem tem 20+ anos pra aposentar deve focar em acumulação total (juros compostos sobre o patrimônio inteiro). Quem está perto da aposentadoria ou já aposentado deve gradualmente migrar pra ativos pagadores de renda (FIIs, ações dividendos, Tesouro IPCA+). Estratégia híbrida: 70% acumulação durante 20-30 anos, depois rebalanceia pra 50-50 nos últimos 5 anos antes de parar de trabalhar.' },
  { q: 'O que faço se a calculadora mostrar que meu plano não é viável?', a: 'Você tem 5 alavancas: 1) Aumentar aporte mensal (revisão do orçamento, side hustle), 2) Estender prazo até aposentar (trabalhar 3-5 anos a mais reduz drasticamente o aporte exigido), 3) Reduzir renda desejada (Fat FIRE para Regular, Regular para Lean), 4) Buscar maior retorno (carteira mais agressiva, com mais risco), 5) Aumentar a renda atual (promoção, mudança de carreira, empreendedorismo). A calculadora mostra os 3 cenários alternativos pra ajudar a escolher.' },
  { q: 'Como compartilhar uma simulação específica de aposentadoria?', a: 'Basta copiar a URL com os parâmetros: https://redentia.com.br/calculadora/aposentadoria?age=30&retire=55&income=8000&monthly=4000&rate=11 já abre a calculadora preenchida e calcula automaticamente. Útil pra mandar para o cônjuge, planejador financeiro ou salvar diferentes cenários (otimista, realista, pessimista) nos favoritos.' },
]

usePageSeo({
  title: 'Calculadora de Aposentadoria 2026 - Grátis',
  description:
    'Calcule quanto investir para se aposentar com R$ 5.000, R$ 10.000 ou R$ 20.000/mês. PGBL, VGBL, regra dos 4%, FIRE, INSS. Grátis.',
  path: '/calculadora/aposentadoria',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadoras' },
    { name: 'Aposentadoria', path: '/calculadora/aposentadoria' },
  ],
  structuredData: [
    {
      '@type': 'WebApplication',
      name: 'Calculadora de Aposentadoria Redentia',
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Planejamento de aposentadoria',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      dateModified: lastUpdatedISO,
      description:
        'Calculadora gratuita de aposentadoria com regra dos 4% (Safe Withdrawal Rate), considerando idade, expectativa de vida, INSS, ajuste pela inflação e duas fases (acumulação e fruição). Projeta viabilidade do plano, duração do patrimônio e cenários FIRE (Lean, Regular, Fat). Deep-link compartilhável.',
      featureList: [
        'Cálculo do patrimônio necessário com regra dos 4%',
        'Suporte a Lean FIRE, Regular FIRE e Fat FIRE',
        'Considera INSS, expectativa de vida e ajuste pela inflação',
        'Duas fases de retorno: acumulação e fruição',
        'Cenários alternativos (trabalhar 3 anos a mais, aumentar aporte 20%, reduzir renda 20%)',
        'Cálculo de duração do patrimônio na aposentadoria',
        'Análise de viabilidade em tempo real',
        'Deep-link compartilhável com inputs pré-preenchidos',
        'Cenários populares 1 clique (Aposentar aos 50, Fat FIRE, Lean FIRE)',
        'Pt-BR com formatação brasileira e contexto local',
      ],
      about: [
        { '@type': 'Organization', name: 'Banco Central do Brasil', url: 'https://www.bcb.gov.br' },
        { '@type': 'Organization', name: 'B3', url: 'https://www.b3.com.br' },
        { '@type': 'Organization', name: 'IBGE', url: 'https://www.ibge.gov.br' },
        { '@type': 'Organization', name: 'CVM', url: 'https://www.gov.br/cvm' },
        { '@type': 'Organization', name: 'Receita Federal', url: 'https://www.gov.br/receitafederal' },
      ],
    },
    // FAQPage schema é emitido pelo NuFaqAccordion — fonte única.
  ],
})
</script>

<template>
  <div>
    <!-- ============ Hero compacto (direção André: botão + h1 + 1 linha) ============ -->
    <CalcHero desc="Descubra quanto investir por mês pra se aposentar do seu jeito.">
      Calculadora de Aposentadoria 2026: Quanto Preciso para me
      <em>Aposentar?</em>
    </CalcHero>

    <!-- ============ Calculadora interativa (design) ============ -->
    <CalcRetirementSection :seed="seed" section-id="aposentadoria">
      <template #title>Aposentadoria.</template>
    </CalcRetirementSection>

    <!-- eyebrow antigo + chips + atualizado (saíram do hero, texto preservado) -->
    <CalcMetaStrip
      label="Calculadora · Aposentadoria"
      :chips="['100% gratuito', 'Cálculo instantâneo', 'Regra dos 4% e FIRE', 'Link compartilhável']"
      :updated="lastUpdatedText"
    />

    <!-- ============ Cenários populares (deep-links, texto verbatim) ============ -->
    <CalcBand tone="cream" title="Cenários populares de aposentadoria">
      <template #dek>
        <p>Veja na hora o patrimônio necessário e o aporte mensal pra cada cenário, basta clicar e a simulação carrega já preenchida.</p>
      </template>
      <div class="ap__scenarios">
        <NuxtLink v-for="s in popularScenarios" :key="s.label" :to="s.to" class="ap__scenario">
          <span class="ap__scenario-label">{{ s.label }}</span>
          <span class="ap__scenario-sub">{{ s.sub }}</span>
        </NuxtLink>
      </div>
    </CalcBand>

    <!-- ============ Conteúdo educacional (texto verbatim, bandas do design) ============ -->
    <CalcSplit tone="white">
      <template #title>Simulador de Aposentadoria grátis e online</template>
      <div class="ap__prose">
        <!-- 1º parágrafo = lead de SEO que saiu do hero compacto (verbatim) -->
        <p>Esta calculadora estima quanto você precisa investir hoje pra se aposentar com a renda mensal desejada. Aplica a <strong>regra dos 4%</strong> (saque seguro): patrimônio = renda mensal × 12 ÷ 0,04. Exemplo: pra ter R$ 5.000 por mês na aposentadoria, você precisa de R$ 1,5 milhão investidos. Considera INSS, inflação, idade atual e expectativa de vida.</p>
      </div>
    </CalcSplit>

    <CalcSplit tone="cream">
      <template #title>Como Planejar sua Aposentadoria no Brasil</template>
      <div class="ap__prose">
        <p>Aposentadoria não acontece por acaso, é resultado de planejamento, disciplina e juros compostos trabalhando por décadas. Quanto mais cedo você começar a planejar, mais confortável será sua aposentadoria e menor será o aporte mensal exigido.</p>
        <p>Esta calculadora considera todas as variáveis críticas: idade atual e desejada de aposentadoria, expectativa de vida, renda mensal desejada, patrimônio atual, aporte mensal, retorno esperado na fase de acumulação e na fase de fruição, inflação anual e estimativa de INSS. O resultado é o cenário completo: viabilidade, patrimônio projetado vs necessário, e duração do patrimônio na aposentadoria.</p>
      </div>
    </CalcSplit>

    <CalcBand tone="white" title-tag="h3" title="Os 3 Pilares do Planejamento de Aposentadoria">
      <div class="ap__tiles">
        <div v-for="c in pillarCards" :key="c.title" class="ap__tile">
          <h4 class="ap__h4 ap__h4--accent">{{ c.title }}</h4>
          <p class="ap__card-p">{{ c.body }}</p>
        </div>
      </div>
    </CalcBand>

    <CalcSplit tone="cream">
      <template #title>Reserva de Emergência: Pré-requisito da Aposentadoria</template>
      <div class="ap__prose">
        <p>Antes de pensar em FIRE, regra dos 4% ou previdência privada, monte uma reserva de emergência. Ela é o que evita você sacar seus investimentos de longo prazo em momentos ruins (perda de emprego, problema de saúde, despesa inesperada) e quebrar o efeito dos juros compostos.</p>
        <p>A reserva ideal cobre 6 a 12 meses de despesas, alocada em renda fixa de alta liquidez (Tesouro Selic, CDB com liquidez diária de bancão grande). Vem ANTES dos investimentos de longo prazo porque é seguro de carreira e tranquilidade emocional, não rentabilidade.</p>
      </div>
      <div class="ap__tile ap__tile--push">
        <h4 class="ap__h4">Tabela rápida de referência</h4>
        <ul class="ap__list">
          <li>Renda mensal R$ 5.000, reserva R$ 30.000 a R$ 60.000.</li>
          <li>Renda mensal R$ 10.000, reserva R$ 60.000 a R$ 120.000.</li>
          <li>Renda mensal R$ 20.000, reserva R$ 120.000 a R$ 240.000.</li>
        </ul>
        <p class="ap__card-small">
          Quem é CLT estável: 6 meses. Autônomo, freelancer ou empresário: 9 a 12 meses. Casal com 2 rendas estáveis: pode usar 4 a 6.
        </p>
      </div>
    </CalcSplit>

    <!-- split de fórmula em banda branca = CalcFormulaCard creme (default, pin do design) -->
    <CalcSplit tone="white">
      <template #title>A Regra dos 4% (Safe Withdrawal Rate)</template>
      <template #dek>
        <p>A regra dos 4%, derivada do Trinity Study (1998), é o pilar matemático da aposentadoria moderna. Ela diz que você pode sacar 4% do seu patrimônio inicial por ano (corrigido pela inflação) com altíssima probabilidade de não acabar o dinheiro em 30 anos. No Brasil, com taxas reais mais altas, a regra é até mais confortável.</p>
      </template>
      <CalcFormulaCard>Patrimônio necessário = Renda mensal desejada × 12 ÷ 0.04 (ou × 300)</CalcFormulaCard>
      <div class="ap__examples">
        <p><strong>Exemplo 1:</strong> Para R$ 5.000/mês, preciso de R$ 1,5 milhão (R$ 5.000 × 300)</p>
        <p><strong>Exemplo 2:</strong> Para R$ 10.000/mês, preciso de R$ 3 milhões</p>
        <p><strong>Exemplo 3:</strong> Para R$ 20.000/mês (Fat FIRE), preciso de R$ 6 milhões</p>
        <p><strong>Variação:</strong> Quem usa 3,5% (mais conservador) precisa multiplicar por 343. Quem usa 5% (mais agressivo) multiplica por 240.</p>
      </div>
    </CalcSplit>

    <CalcSplit tone="cream">
      <template #title>Taxa de Retirada Segura (SWR) e Regra dos 4%</template>
      <template #dek>
        <p>A Safe Withdrawal Rate (SWR) é o percentual que você pode sacar do patrimônio por ano sem o risco de acabar o dinheiro durante a aposentadoria. A regra dos 4% nasceu do Trinity Study de 1998, que rodou simulações com dados históricos do mercado americano de 1925 a 1995 e concluiu que 4% real (ajustado pela inflação) por 30 anos tem altíssima taxa de sucesso.</p>
      </template>
      <div class="ap__tile">
        <h4 class="ap__h4 ap__h4--accent">Variações da SWR</h4>
        <ul class="ap__list">
          <li v-for="item in swrItems" :key="item.strong"><strong>{{ item.strong }}</strong>{{ item.rest }}</li>
        </ul>
        <p class="ap__card-small">
          Importante: a SWR é aplicada sobre o saldo INICIAL e ajustada pela inflação a cada ano, não recalculada sobre o saldo do ano corrente.
        </p>
      </div>
    </CalcSplit>

    <CalcSplit tone="white">
      <template #title>Movimento FIRE: Aposentadoria Antecipada no Brasil</template>
      <template #dek>
        <p>FIRE (Financial Independence, Retire Early) é um movimento global que prega independência financeira e aposentadoria antecipada através de poupança agressiva (50-70% da renda) e investimentos disciplinados. No Brasil, com Selic alta e ferramentas como Tesouro Direto, FIRE é matematicamente viável.</p>
      </template>
      <div class="ap__tiles ap__tiles--two">
        <div v-for="c in fireCards" :key="c.title" class="ap__tile">
          <h4 class="ap__h4 ap__h4--accent">{{ c.title }}</h4>
          <p class="ap__card-p">{{ c.body }}</p>
        </div>
      </div>
    </CalcSplit>

    <CalcBand tone="cream" title="Quanto Preciso Acumular para Cada Renda na Aposentadoria">
      <template #dek>
        <p>Tabela de referência rápida usando a regra dos 4%, sem considerar INSS e sem ajuste pela inflação. Para projeções com inflação, use a calculadora acima.</p>
      </template>
      <div class="ap__band-body">
        <CalcTableCard
          tone="white"
          :columns="['Renda mensal', 'Renda anual', 'Patrimônio (4%)', 'Aporte 25 anos (10% a.a.)']"
          :rows="wealthRows"
          :accent-col="2"
          note="Note como o Lean FIRE (R$ 3-5 mil/mês) é viável com aporte de R$ 700-1.200/mês durante 25 anos. Já o Fat FIRE (R$ 20 mil/mês) exige R$ 4.500/mês de aporte, geralmente só viável com renda alta."
        />
      </div>
    </CalcBand>

    <CalcBand tone="white" title="Cenários Reais de Aposentadoria">
      <div class="ap__ex-grid">
        <div v-for="sc in realScenarios" :key="sc.h3">
          <h3 class="ap__ex-title">{{ sc.h3 }}</h3>
          <div class="ap__ex-card">
            <h4 class="ap__h4">Perfil</h4>
            <ul class="ap__list">
              <li v-for="(item, i) in sc.profile" :key="i">{{ item }}</li>
            </ul>
            <div class="ap__result-box">
              <p class="ap__result-main">{{ sc.result }}</p>
            </div>
          </div>
        </div>
      </div>
    </CalcBand>

    <!-- ============ Como usar (anatomia EXATA do design: banda creme + card branco de steps) ============ -->
    <CalcBand tone="cream" title="Como Usar a Calculadora de Aposentadoria">
      <div class="ap__band-body"><CalcSteps :steps="howToSteps" /></div>
    </CalcBand>

    <!-- ============ Previdência privada (split: título à esquerda, tiles à direita) ============ -->
    <CalcSplit tone="white">
      <template #title>Previdência Privada (PGBL e VGBL) vs Investimentos Diretos</template>
      <template #dek>
        <p>Previdência privada complementa o INSS e funciona como veículo automatizado de aposentadoria, com débito mensal e benefício fiscal. PGBL e VGBL são os dois principais formatos no Brasil, cada um indicado pra um perfil específico de declaração de Imposto de Renda. Saber qual escolher (e se vale escolher algum) muda bastante o resultado de longo prazo.</p>
      </template>
      <div class="ap__tiles ap__tiles--two">
        <div v-for="c in previdenciaCards" :key="c.title" class="ap__tile">
          <h4 class="ap__h4 ap__h4--accent">{{ c.title }}</h4>
          <p class="ap__card-p">{{ c.body }}</p>
        </div>
      </div>
      <div class="ap__prose ap__prose--push">
        <p>Investir direto em Tesouro IPCA+, FIIs e ações tem custos menores e flexibilidade maior, mas exige disciplina pra manter os aportes. Previdência privada é boa pra quem quer débito automático e benefício fiscal, mas só vale a pena com taxa de administração abaixo de 1% ao ano e fundo com bom histórico.</p>
      </div>
    </CalcSplit>

    <!-- ============ FAQ (anatomia EXATA do design: banda creme, cards brancos, pill IA) ============ -->
    <CalcSplit tone="cream" wide>
      <template #title>Perguntas Frequentes sobre Aposentadoria</template>
      <template #left>
        <NuxtLink to="/busca" class="ap__pill">Perguntar à Redentia AI</NuxtLink>
      </template>
      <NuFaqAccordion :items="faqItems" surface="white" />
    </CalcSplit>

    <!-- ============ Dicas (texto verbatim) ============ -->
    <CalcBand tone="white" title="Dicas para Acelerar sua Aposentadoria">
      <div class="ap__tiles">
        <div v-for="c in tipCards" :key="c.title" class="ap__tile">
          <h4 class="ap__h4 ap__h4--accent">{{ c.title }}</h4>
          <p class="ap__card-p">{{ c.body }}</p>
        </div>
      </div>
    </CalcBand>

    <!-- ============ Rankings + outras calculadoras + E-E-A-T + CTA ============ -->
    <CalcBand tone="cream" title="Rankings Relacionados">
      <template #dek>
        <p>Explore listas atualizadas diariamente com os melhores ativos da B3 para complementar sua análise.</p>
      </template>
      <div class="ap__grid-cards">
        <NuxtLink v-for="r in relatedRankings" :key="r.to" :to="r.to" class="ap__card-link">
          <h3 class="ap__card-link-title">{{ r.title }}</h3>
          <p class="ap__card-p">{{ r.sub }}</p>
        </NuxtLink>
      </div>
    </CalcBand>

    <CalcBand tone="cream" title="Outras Calculadoras">
      <div class="ap__grid-cards">
        <NuxtLink to="/calculadora/quanto-investir" class="ap__card-link">
          <h3 class="ap__card-link-title">Quanto Investir por Mês</h3>
          <p class="ap__card-p">Calcule o aporte para suas metas</p>
        </NuxtLink>
        <NuxtLink to="/calculadora/juros-compostos" class="ap__card-link">
          <h3 class="ap__card-link-title">Juros Compostos</h3>
          <p class="ap__card-p">Simule a evolução do patrimônio</p>
        </NuxtLink>
      </div>

      <aside class="ap__eeat">
        <p class="ap__eeat-title">Metodologia revisada pela equipe de análise da Redentia</p>
        <p class="ap__eeat-p">
          Cálculos baseados na regra dos 4% do Trinity Study (1998), na fórmula de anuidade dos juros compostos e em médias históricas do mercado brasileiro (CDI, Ibovespa, IPCA, INPC, INSS). Projeções consideram capitalização mensal, ajuste pela inflação anual e duas fases (acumulação e fruição) com retornos distintos.
        </p>
        <p class="ap__eeat-small">
          Fontes: <a href="https://www.bcb.gov.br" target="_blank" rel="noopener nofollow" class="ap__link">Banco Central do Brasil</a>,
          <a href="https://www.gov.br/inss" target="_blank" rel="noopener nofollow" class="ap__link">INSS</a>,
          <a href="https://www.ibge.gov.br" target="_blank" rel="noopener nofollow" class="ap__link">IBGE</a>,
          <a href="https://www.b3.com.br" target="_blank" rel="noopener nofollow" class="ap__link">B3</a>.
        </p>
      </aside>

      <div class="ap__cta">
        <h2 class="ap__cta-title">Acompanhe seus investimentos pra aposentadoria</h2>
        <p class="ap__cta-sub">Monitore seu progresso rumo à independência financeira na Redentia com análises em tempo real e IA.</p>
        <div class="ap__cta-actions">
          <NuxtLink to="/login" class="ap__pill ap__pill--light">Criar conta grátis</NuxtLink>
          <NuxtLink to="/calculadoras" class="ap__pill ap__pill--outline">Ver mais calculadoras</NuxtLink>
        </div>
      </div>
    </CalcBand>
  </div>
</template>

<style scoped>
/* ——— tipografia compartilhada ——— */
.ap__h4 { margin: 0 0 8px; color: var(--nu-ink); font-size: 16.5px; font-weight: 800; letter-spacing: -.2px; }
.ap__h4--accent { color: var(--nu-blue); }
.ap__link { text-decoration: underline; }
.ap__link:hover { color: var(--nu-blue); }

/* ——— prosa da coluna direita (bandas split do design) ——— */
.ap__prose p {
  margin: 0 0 16px; color: var(--nu-gray-3); font-size: 17px; font-weight: 500;
  line-height: 1.7;
}
.ap__prose p:last-child { margin-bottom: 0; }
.ap__prose strong { color: var(--nu-ink); font-weight: 800; }
.ap__prose--push { margin-top: 20px; }

/* ——— corpo de banda centrada (card 1080 do design) ——— */
.ap__band-body { margin-top: clamp(30px, 4vw, 48px); }

/* ——— cenários populares ——— */
.ap__scenarios {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px; margin-top: clamp(24px, 3.5vw, 36px);
}
.ap__scenario {
  background: var(--nu-white); border-radius: var(--nu-r-tile); padding: 16px 18px;
  display: flex; flex-direction: column; gap: 3px;
  transition: transform .18s, box-shadow .2s;
}
.ap__scenario:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.ap__scenario-label { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; letter-spacing: -.1px; }
.ap__scenario-sub { color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }

/* ——— tiles (grid de cards pequenos, mesma família do hub) ——— */
.ap__tiles {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 1080px; margin-left: auto; margin-right: auto;
}
.ap__tiles--two {
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  max-width: none; margin-top: 0;
}
.ap__tile { background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 24px; }
:global(.cbd--cream) .ap__tile { background: var(--nu-white); }
:global(.csp--cream) .ap__tile { background: var(--nu-white); }
.ap__tile--push { margin-top: 22px; }
.ap__card-p { margin: 6px 0 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }
.ap__card-small { margin: 12px 0 0; color: var(--nu-gray); font-size: 12.5px; font-weight: 600; line-height: 1.6; }
.ap__list { margin: 8px 0 0; padding-left: 18px; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.7; }
.ap__list strong { color: var(--nu-ink); font-weight: 800; }
.ap__result-box { background: var(--nu-blue-tint); border-radius: var(--nu-r-input); padding: 14px 16px; margin-top: 14px; }
.ap__result-main { margin: 0; color: var(--nu-ink); font-size: 14.5px; font-weight: 600; line-height: 1.55; font-variant-numeric: tabular-nums; }

/* ——— exemplos da fórmula (coluna direita do split) ——— */
.ap__examples { margin-top: 18px; }
.ap__examples p {
  margin: 10px 0 0; color: var(--nu-gray-3); font-size: 15px; font-weight: 500;
  line-height: 1.65;
}
.ap__examples strong { color: var(--nu-ink); font-weight: 800; }

/* ——— cenários reais (cards na banda, regra tile creme/branco) ——— */
.ap__ex-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr));
  gap: 18px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 1080px; margin-left: auto; margin-right: auto;
}
.ap__ex-title { margin: 0 0 14px; color: var(--nu-ink); font-size: 19px; font-weight: 800; letter-spacing: -.2px; }
.ap__ex-card { background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 26px; }
:global(.cbd--cream) .ap__ex-card { background: var(--nu-white); }

/* ——— cards-link (rankings / outras calculadoras) ——— */
.ap__grid-cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 16px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 980px; margin-left: auto; margin-right: auto;
}
.ap__card-link {
  background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 26px;
  display: flex; flex-direction: column; gap: 6px;
  transition: transform .18s, box-shadow .2s;
}
.ap__card-link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.ap__card-link-title { margin: 0; color: var(--nu-ink); font-size: 18px; font-weight: 800; letter-spacing: -.2px; }

/* ——— pills / E-E-A-T / CTA ——— */
.ap__pill {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.ap__pill:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.ap__eeat {
  background: var(--nu-white); border-radius: var(--nu-r-card-lg);
  padding: clamp(24px, 3vw, 36px); margin: clamp(44px, 6vw, 72px) auto 0; max-width: 980px;
}
.ap__eeat-title { margin: 0; color: var(--nu-ink); font-size: 15.5px; font-weight: 700; }
.ap__eeat-p { margin: 10px 0 0; color: var(--nu-gray-3); font-size: 14.5px; font-weight: 500; line-height: 1.65; }
.ap__eeat-small { margin: 12px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 500; line-height: 1.6; }
.ap__cta {
  background: var(--nu-blue); border-radius: var(--nu-r-card-lg);
  padding: clamp(34px, 5vw, 60px); text-align: center; margin-top: clamp(44px, 6vw, 72px);
  max-width: 1080px; margin-left: auto; margin-right: auto;
}
.ap__cta-title { margin: 0; color: var(--nu-white); font-size: clamp(26px, 3.4vw, 44px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.ap__cta-sub { margin: 14px auto 0; color: var(--nu-white-75); font-size: 16px; font-weight: 500; line-height: 1.6; max-width: 560px; }
.ap__cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 26px; }
.ap__cta .ap__pill { margin-top: 0; }
.ap__pill--light { background: var(--nu-cream); color: var(--nu-blue); }
.ap__pill--light:hover { background: var(--nu-white); color: var(--nu-blue-hover); }
.ap__pill--outline { background: transparent; border: 2px solid var(--nu-white-35); color: var(--nu-white); }
.ap__pill--outline:hover { background: var(--nu-white-14); color: var(--nu-white); }
</style>
