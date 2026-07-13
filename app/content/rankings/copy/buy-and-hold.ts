import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst:
    'Buy and Hold Score é um indicador proprietário de 0 a 10 que combina ROE consistente, dividend yield, baixo endividamento e regularidade de pagamentos de dividendos. Score acima de 7 indica empresa com fundamentos sólidos pra estratégia de longo prazo (5+ anos), filosofia popularizada por Warren Buffett. Empresas com score alto tendem a entregar retorno composto consistente. Este ranking lista as 50 ações com melhor score Buy & Hold da B3.',
  educationalSections: [
    {
      h2: 'O que é a estratégia Buy and Hold?',
      paragraphs: [
        'Buy and hold é a filosofia de comprar boas ações e mantê-las por longos períodos (5, 10 ou mais anos), independente das oscilações de curto prazo. A ideia, popularizada por Warren Buffett e Charlie Munger, é que empresas com fundamentos sólidos tendem a se valorizar no longo prazo, e tentar acertar o timing do mercado é improdutivo pra maioria dos investidores.',
        'O score combina quatro pilares: ROE consistente (mostra qualidade do negócio), dividend yield (renda passiva), endividamento controlado (resiliência em crises) e regularidade de pagamentos (previsibilidade). Quanto maior o score, mais a empresa se encaixa no perfil clássico de buy and hold.',
      ],
    },
    {
      h2: 'Como interpretar o score',
      paragraphs: [
        'Score 8-10: Top tier. Empresa com ROE consistentemente acima de 15 por cento, dividendos pagos por 5+ anos, dívida líquida controlada (geralmente abaixo de 2x EBITDA). Candidatas naturais a virar core position de carteira de longo prazo.',
        'Score 5-7: Boa qualidade com algum ponto de atenção. Pode ser ROE mais baixo, dividendos menos consistentes ou endividamento maior. Vale entrar mas com peso menor na carteira. Score abaixo de 5: empresa não atende os critérios mínimos do filtro buy and hold, melhor evitar pra essa estratégia específica (pode ser uma boa empresa pra outra estratégia, como growth ou turnaround).',
      ],
    },
    {
      h2: 'Limitações',
      paragraphs: [
        'Score é uma simplificação. Empresas com score alto podem cair (qualquer ativo cai), e empresas com score baixo podem virar histórias incríveis (turnarounds, crescimento explosivo de small caps). O score serve pra triagem, não pra decisão final. Sempre faça análise individual.',
        'Buy and hold também não é estratégia única. Em setores cíclicos (commodities, construção), comprar e segurar pode dar muito errado se você entrar no topo do ciclo. Pra esses casos, vale combinar com indicadores de timing (preço Graham, preço Bazin) pra escolher melhor o momento de entrada.',
      ],
    },
  ],
  crossLinks: [
    {
      title: 'Calculadora de Dividend Yield',
      desc: 'Simule o DY real de qualquer ação ou FII.',
      href: '/calculadora/dividend-yield',
    },
    {
      title: 'Calculadora de Preço Teto',
      desc: 'Calcule o preço justo de uma ação por Graham e Bazin.',
      href: '/calculadora/preco-teto',
    },
    {
      title: 'Simulador de Ações',
      desc: 'Projete retorno total de uma carteira ao longo do tempo.',
      href: '/calculadora/acoes',
    },
    {
      title: 'Outros rankings',
      desc: 'Veja todos os rankings disponíveis na Redentia.',
      href: '/rankings',
    },
  ],
  faqItems: [
    {
      q: 'Quanto tempo é considerado buy and hold?',
      a: 'A literatura clássica fala em 5 anos no mínimo, idealmente 10+ anos. Warren Buffett fala em "para sempre" como horizonte mental, ainda que vendas eventuais aconteçam. O importante é entrar com a tese de longo prazo e não mexer na posição por motivo de oscilação de curto prazo (notícia, ruído, queda mensal).',
    },
    {
      q: 'Posso fazer buy and hold com FIIs?',
      a: 'Sim, e funciona muito bem. FIIs com gestão sólida, contratos longos e baixa vacância tendem a entregar fluxo de dividendos previsível por décadas. HGLG11, KNCR11, MXRF11 são exemplos comuns em carteiras de buy and hold em FIIs. Aplica os mesmos critérios: yield consistente, baixo endividamento, gestão experiente.',
    },
    {
      q: 'O que fazer quando uma ação buy and hold cai 30 por cento?',
      a: 'Primeiro, separe queda de mercado (efeito Ibovespa, macro) de queda específica (problema da empresa). Se a tese original continua válida (ROE alto, dividendos consistentes, sem mudança estrutural), aproveitar pra aumentar a posição faz sentido. Se a tese mudou (perdeu vantagem competitiva, problemas governança), reavaliar venda.',
    },
    {
      q: 'Como rebalancear uma carteira de buy and hold?',
      a: 'Reavalie no mínimo 1 vez por ano, idealmente 2 vezes (fim do segundo trimestre e fim de ano). Cheque se cada ativo ainda está dentro da tese original e ajuste o peso conforme a alocação alvo. Evite rebalancear por movimento de preço de curto prazo, foque em fundamentos.',
    },
  ],
}

export default copy
