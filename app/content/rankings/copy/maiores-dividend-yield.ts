/**
 * Copy do /ranking/maiores-dividend-yield — portada VERBATIM da página
 * dedicada da Redentia antiga (Frontend/app/pages/ranking/maiores-dividend-yield.vue),
 * na MESMA ordem de tags. Única alteração permitida: " — " → vírgula.
 * Links re-mapeados: /ranking (hub) → /rankings · /asset/<t> → /acao/<t>
 * (cards de ticker viram parágrafos { linkText, href, text } — o prefixo
 * TICKER é link pra página do ativo, concatenação verbatim).
 * NOTA de flattening (limites restantes do modelo RankingCopy):
 * h3s usam a variante { h3 }; cards comparativos, tabela de setores, passos
 * numerados e glossário <dl> seguem como parágrafos "Título: texto" (texto
 * das células/cards verbatim). CrossLink 'Calendário de Dividendos'
 * REMOVIDO: /dividendos/calendario não existe no Nu (re-add quando existir).
 */
import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst:
    'Dividend Yield (DY) é o percentual de dividendos pagos por uma ação ou FII em relação ao seu preço atual: DY = (Dividendos 12 meses ÷ Preço Atual) × 100. Considerado bom: 4-8% para ações maduras, 8-12% para FIIs. DY acima de 12% pode indicar oportunidade ou armadilha de valor (value trap), exige análise do payout, geração de caixa e sustentabilidade. Este ranking lista os 50 ativos com maior DY da B3.',

  educationalSections: [
    {
      h2: 'O que é Dividend Yield?',
      paragraphs: [
        'Dividend Yield (DY) é o indicador que mostra quanto uma empresa pagou em dividendos nos últimos 12 meses em relação ao preço atual da ação. Um DY de 10% significa que, para cada R$ 100 investidos, o acionista recebeu R$ 10 em proventos no período. É o principal termômetro de renda passiva no Brasil, usado tanto pra ações de setores maduros (bancos, energia, saneamento, transmissão, seguradoras) quanto pra fundos imobiliários, onde o fluxo de dividendos é mais estável e previsível mês a mês.',
        'A fórmula do DY considera dividendos + JCP (Juros sobre Capital Próprio) pagos nos últimos 12 meses dividido pelo preço da cota hoje. Como o numerador é histórico e o denominador é atual, o indicador sobe quando o preço cai e desce quando o preço sobe, mesmo sem mudança nos pagamentos. Por isso usar DY isolado pode enganar, sempre cruze com payout, geração de caixa, dívida líquida e consistência de pagamento dos últimos 5 anos.',
        { h3: 'Como o ranking é calculado?' },
        'O ranking considera o dividend yield nos últimos 12 meses (TTM), cruzando os dividendos pagos com o preço atual de cada ativo. Aplicamos filtros de qualidade para evitar distorções: excluímos DY acima de 50% (tipicamente erros de dados) e ativos sem histórico recente de pagamentos. Os dados vêm direto do feed oficial da B3 + filtros internos de saneamento (anti split/subscrição mal classificada).',
        { h3: 'Atenção ao "DY alto demais"' },
        'Um DY muito elevado pode indicar tanto uma oportunidade quanto uma armadilha de valor (value trap). Quando o preço da ação cai muito por problemas fundamentais, o DY histórico sobe artificialmente, mas dividendos futuros podem ser cortados. Use o ranking como ponto de partida e sempre analise o histórico de 5 anos, payout (acima de 80% pra ações é arriscado), geração de caixa operacional e endividamento.',
      ],
    },
    {
      h2: 'Melhores Ações Pagadoras de Dividendos em 2026',
      paragraphs: [
        'Lista das ações brasileiras com histórico mais consistente de pagamento de dividendos, usadas como núcleo de carteiras de renda passiva. Ordem foca em consistência (5+ anos pagando) mais do que em DY pico do momento.',
        { linkText: 'ITUB4', href: '/acao/itub4', text: ' (Itaú Unibanco): Payout consistente de 50-60%, DY histórico 5-8%. Distribui via JCP, paga em ciclos mensais e trimestrais.' },
        { linkText: 'ITSA4', href: '/acao/itsa4', text: ' (Itaúsa): Holding controladora do Itaú e outras empresas (Alpargatas, Dexco, NTS). DY 6-9%, exposição a Itaú com desconto de holding.' },
        { linkText: 'BBAS3', href: '/acao/bbas3', text: ' (Banco do Brasil): DY 8-12%, banco estatal lucrativo com payout alto. Sensível a cenário político e direcionamento de crédito.' },
        { linkText: 'BBSE3', href: '/acao/bbse3', text: ' (BB Seguridade): DY 7-9%, seguradora ligada ao BB. Payout próximo de 90%, modelo capital-light gera caixa estável.' },
        { linkText: 'BBDC4', href: '/acao/bbdc4', text: ' (Bradesco): DY 5-7%, banco privado com payout consistente. Estratégia mais conservadora que ITUB4.' },
        { linkText: 'TAEE11', href: '/acao/taee11', text: ' (Taesa): Transmissão elétrica, contratos longos indexados ao IPCA. DY 7-10%, baixa volatilidade.' },
        { linkText: 'CMIG4', href: '/acao/cmig4', text: ' (Cemig): Geração e distribuição de energia em Minas Gerais. DY variável 6-12% conforme tarifa e dívida.' },
        { linkText: 'TRPL4', href: '/acao/trpl4', text: ' (Transmissão Paulista): Transmissão de energia, fluxo previsível. DY 8-11%, perfil parecido com Taesa.' },
        { linkText: 'ABEV3', href: '/acao/abev3', text: ' (Ambev): Defensiva clássica, líder de cervejas. DY 4-6%, payout regular, geração de caixa robusta.' },
      ],
    },
    {
      h2: 'Melhores FIIs Pagadores de Dividendos Mensais',
      paragraphs: [
        'Os fundos imobiliários listados na B3 são obrigados por lei a distribuir 95% do lucro semestralmente, mas a maioria distribui mensalmente, daí o apelo pra renda passiva. Separamos por categoria.',
        { h3: 'FIIs de Tijolo (imóveis físicos)' },
        { linkText: 'HGLG11', href: '/acao/hglg11', text: ' (CGHG Logística): Galpões logísticos premium em SP, RJ e MG. Maior FII de tijolo do Brasil.' },
        { linkText: 'VISC11', href: '/acao/visc11', text: ' (Vinci Shopping Centers): Shoppings em capitais brasileiras. Receita atrelada a aluguel + percentual de vendas dos lojistas.' },
        { linkText: 'HSML11', href: '/acao/hsml11', text: ' (HSI Malls): Shopping centers em cidades médias. Maior exposição ao consumo regional.' },
        { linkText: 'GGRC11', href: '/acao/ggrc11', text: ' (GGR Covepi Renda): Logística e built-to-suit. Contratos longos atípicos com inquilinos âncora.' },
        { linkText: 'BCFF11', href: '/acao/bcff11', text: ' (BTG Pactual Fundo de Fundos): Fundo de fundos: investe em outros FIIs. Diversificação automática em uma cota só.' },
        { h3: 'FIIs de Papel (CRIs e debêntures)' },
        { linkText: 'MXRF11', href: '/acao/mxrf11', text: ' (Maxi Renda): CRIs diversificados, valor de cota baixa, FII mais popular de entry-level no Brasil.' },
        { linkText: 'KNCR11', href: '/acao/kncr11', text: ' (Kinea Rendimentos Imobiliários): CRIs corporativos high grade indexados ao CDI. Renda mensal estável.' },
        { linkText: 'KNIP11', href: '/acao/knip11', text: ' (Kinea Índices de Preços): CRIs indexados ao IPCA. Proteção contra inflação no longo prazo.' },
        { linkText: 'DIVD11', href: '/acao/divd11', text: ' (Maua Capital Recebíveis): High yield, busca CRIs com spread maior. DY tipicamente acima de 12%.' },
        { linkText: 'SNLG11', href: '/acao/snlg11', text: ' (Suno Logística): Mistura tijolo logístico + recebíveis. Estratégia híbrida de geração de caixa.' },
      ],
    },
    {
      h2: 'FIIs de Papel vs FIIs de Tijolo',
      paragraphs: [
        'As duas grandes famílias de fundos imobiliários têm dinâmicas, riscos e correlações diferentes. Misturar as duas é o primeiro passo pra diversificar uma carteira de renda passiva.',
        'FIIs de Tijolo: Investem em imóveis físicos (galpões logísticos, lajes corporativas, shoppings, hospitais, agências bancárias) e geram receita via aluguel. DY tipicamente 8-10%, valor da cota oscila com o ciclo imobiliário, vacância, reajustes contratuais (IGP-M ou IPCA) e taxa de juros longa. Bom contra inflação no longo prazo, mas mais sensível a recessão.',
        'FIIs de Papel: Investem em CRIs (Certificados de Recebíveis Imobiliários), LCIs e debêntures, recebem juros corrigidos por IPCA ou CDI. DY tipicamente 9-13%, mais correlacionado com Selic, CDI e IPCA do que com mercado imobiliário físico. Distribuem mensalmente quase como renda fixa estruturada, mas com risco de crédito do emissor do CRI.',
      ],
    },
    {
      h2: 'Dividendos vs JCP (Juros sobre Capital Próprio)',
      paragraphs: [
        'As empresas brasileiras podem remunerar acionistas de duas formas, e ambas contam pro dividend yield deste ranking.',
        'Dividendos: distribuição direta de lucro líquido. Atualmente ISENTOS de Imposto de Renda pra pessoa física no recebimento (regra desde 1996).',
        'JCP (Juros sobre Capital Próprio): remuneração que a empresa pode deduzir da base do IR corporativo (IRPJ + CSLL), gerando economia tributária. Ao acionista chega líquido com 15% de IR retido na fonte, mas como a empresa pagou menos imposto, o efeito combinado costuma ser melhor que dividendo puro.',
        'Por que bancos usam tanto JCP: Itaú, Bradesco, Santander e BB têm caixa de sobra e patrimônio líquido alto, então maximizam o JCP pra reduzir IR corporativo. Por isso aparecem todo mês com DY consistente.',
        'Tributação 2026: o PL 1.087/2025 propõe alíquota de 10% sobre dividendos recebidos acima de R$ 50 mil/mês por pessoa física. Está em discussão no Senado, vigência provável a partir de 2027 caso aprovado. Não afeta investidores de renda passiva comum, mas muda o cálculo pra grandes patrimônios.',
      ],
    },
    {
      h2: 'Setores com Maiores Dividendos na B3',
      paragraphs: [
        'Mapa rápido de onde os dividendos vivem na bolsa brasileira. Use pra montar uma carteira de renda passiva diversificada por setor, evitando concentração de risco.',
        'Bancos: DY médio 6-9%. Top tickers: ITUB4, BBAS3, BBDC4, ITSA4.',
        'Seguradoras: DY médio 7-10%. Top tickers: BBSE3, IRBR3, CXSE3.',
        'Energia (Geração): DY médio 6-10%. Top tickers: CMIG4, ELET6, EGIE3.',
        'Energia (Transmissão): DY médio 8-11%. Top tickers: TAEE11, TRPL4, ALUP11.',
        'Saneamento: DY médio 5-7%. Top tickers: SBSP3, SAPR11, CSMG3.',
        'FIIs de Tijolo: DY médio 8-10%. Top tickers: HGLG11, VISC11, GGRC11.',
        'FIIs de Papel: DY médio 9-13%. Top tickers: MXRF11, KNCR11, DIVD11.',
        'Setores cíclicos (commodities, varejo, construção) podem entregar DY pontual alto após anos bons, mas tendem a oscilar muito. Pra renda recorrente, prefira utilities (energia, saneamento, transmissão) e financeiro.',
      ],
    },
    {
      h2: 'Estratégia de Renda Passiva Mensal com Dividendos',
      paragraphs: [
        'Cinco regras práticas pra quem quer construir um fluxo previsível de dividendos sem cair em armadilha de valor.',
        '1. Diversifique por classe e setor: Combine 5-10 ações com 5-10 FIIs de setores diferentes (bancos, energia, transmissão, FIIs de tijolo, FIIs de papel). Evita concentração de risco específico.',
        '2. Foque em consistência, não em DY pico: Empresa que pagou dividendo todos os anos nos últimos 5 anos vale mais que uma com DY de 18% mas histórico errático. Veja o gráfico de proventos do ativo.',
        '3. Reinvista enquanto está acumulando: Reinvestir dividendos é o segredo do efeito composto. Só comece a "viver dos dividendos" quando o patrimônio for suficiente, antes disso reinveste tudo.',
        '4. Combine FIIs (mensais) com ações (trimestrais): FIIs distribuem todo mês, ações geralmente trimestral ou semestral. Misturar os dois alisa a curva mensal de proventos.',
        '5. Atenção ao payout: Payout acima de 80% pra ações é arriscado, sinal de que a empresa distribui quase tudo o que ganha e tem pouco caixa pra investir ou aguentar crise. Pra FIIs o payout obrigatório é 95%, então o risco é outro (vacância, calote em CRI).',
      ],
    },
    {
      h2: 'Glossário Rápido',
      paragraphs: [
        'DY (Dividend Yield): Percentual de dividendos pagos nos últimos 12 meses dividido pelo preço atual. Mostra rentabilidade em proventos.',
        'TTM (Trailing Twelve Months): Janela móvel dos últimos 12 meses. Usada pra calcular DY, lucro, receita.',
        'JCP (Juros sobre Capital Próprio): Forma de remuneração ao acionista que a empresa pode deduzir do IR corporativo. Tem 15% de IR retido na fonte.',
        'Payout: Percentual do lucro líquido distribuído como dividendo. Acima de 80% pra ações é arriscado.',
        'Value Trap: Ação com DY artificialmente alto porque o preço caiu por problemas fundamentais. Dividendos futuros podem ser cortados.',
        'Data-com / Data-ex: Data-com: último dia pra ter direito ao dividendo. Data-ex: dia em que a ação passa a ser negociada sem direito ao provento.',
        'DY on Cost: Dividend yield calculado sobre o preço médio de aquisição, não sobre preço atual. Mostra o "yield real" da sua posição.',
        'Provento: Termo guarda-chuva pra qualquer pagamento ao acionista: dividendo, JCP, bonificação ou subscrição.',
      ],
    },
  ],

  crossLinks: [
    {
      title: 'Maiores Altas do Mês',
      desc: 'Ações que mais subiram nos últimos 30 dias na B3.',
      href: '/ranking/maiores-altas-mes',
    },
    {
      title: 'Maiores Baixas do Mês',
      desc: 'Ações que mais caíram, possíveis oportunidades de entrada.',
      href: '/ranking/maiores-baixas-mes',
    },
    {
      title: 'Todos os Rankings',
      desc: 'Veja todos os rankings e filtros disponíveis.',
      href: '/rankings',
    },
  ],

  // h2 keyword-bearing da página antiga (não o genérico do template).
  faqTitle: 'Perguntas Frequentes sobre Dividend Yield',

  faqItems: [
    {
      q: 'Qual é considerado um bom Dividend Yield?',
      a: 'Para ações maduras (bancos, energia, saneamento) entre 4-8% é considerado bom. Para FIIs entre 8-12% é o padrão de mercado. DY acima de 12% pode ser oportunidade ou armadilha de valor (value trap), exige análise de payout, geração de caixa, dívida líquida e consistência histórica antes de comprar.',
    },
    {
      q: 'Quais ações pagam mais dividendos no Brasil?',
      a: 'As mais consistentes em pagamento recorrente: ITUB4 (Itaú), BBAS3 (Banco do Brasil), BBSE3 (BB Seguridade), TAEE11 (Taesa), CMIG4 (Cemig), BBDC4 (Bradesco), TRPL4 (Transmissão Paulista) e ITSA4 (Itaúsa). Bancos e utilities dominam por terem fluxo de caixa previsível e modelo capital-light.',
    },
    {
      q: 'Quais FIIs pagam dividendos mensais?',
      a: 'Praticamente todos os FIIs distribuem mensalmente, já que a lei obriga 95% do lucro semestralmente e a maioria optou por mensalizar. Os mais populares por volume e consistência: HGLG11 (galpões logísticos), MXRF11 (CRIs entry-level), KNCR11 (CRIs CDI), KNIP11 (CRIs IPCA), GGRC11 (logística built-to-suit) e VISC11 (shoppings).',
    },
    {
      q: 'Qual a diferença entre dividendos e JCP?',
      a: 'Dividendos vêm direto do lucro líquido e atualmente são isentos de IR pra pessoa física no recebimento. JCP (Juros sobre Capital Próprio) é uma forma de remuneração que a empresa pode deduzir do IR corporativo, mas tem 15% retido na fonte ao chegar no acionista. Bancos como Itaú e Bradesco usam muito JCP por economia tributária. Ambos contam para o cálculo do DY neste ranking.',
    },
    {
      q: 'Como funciona a tributação de dividendos a partir de 2026?',
      a: 'O PL 1.087/2025 propõe alíquota de 10% sobre dividendos recebidos acima de R$ 50 mil por mês por pessoa física. Está em apreciação no Senado, vigência provável a partir de 2027 caso aprovado. Para investidor de renda passiva comum (abaixo do limite mensal), continua isento. Para grandes patrimônios muda significativamente o cálculo de retorno líquido.',
    },
    {
      q: 'O que é value trap em dividendos?',
      a: 'Value trap é uma ação com DY artificialmente alto porque o preço caiu por problemas fundamentais (perda de receita, escândalo, perda de licença, alavancagem alta). O DY de 12 meses inclui dividendos passados, mas a empresa pode cortar ou suspender pagamentos no próximo ciclo. Por isso DY isolado não basta, sempre verifique consistência histórica de 5 anos, payout, geração de caixa e endividamento.',
    },
  ],
}

export default copy
