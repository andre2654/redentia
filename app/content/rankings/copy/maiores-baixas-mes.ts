/**
 * Copy do /ranking/maiores-baixas-mes — portada VERBATIM da página dedicada
 * da Redentia antiga (Frontend/app/pages/ranking/maiores-baixas-mes.vue),
 * na MESMA ordem de tags. Única alteração permitida: " — " → vírgula.
 * Links re-mapeados: /ranking (hub) → /rankings · demais mantidos.
 * NOTA de flattening (limites do modelo RankingCopy):
 * h3 usa a variante { h3 } e a lista "Como usar este ranking" a variante
 * { ul }; tabela de setores, cards comparativos e glossário <dl> viraram
 * parágrafos "Título: texto" (texto das células/itens verbatim).
 * CrossLink 'Calendário de Dividendos' REMOVIDO: /dividendos/calendario
 * não existe no Nu.
 */
import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst:
    'As ações que mais caíram no mês podem representar 2 cenários: oportunidade (mercado exagerou na queda, fundamentos intactos = compra com desconto) ou armadilha de valor (queda reflete deterioração real dos fundamentos = continuará caindo). Este ranking lista as 50 maiores quedas dos últimos 30 dias. Sempre investigue O PORQUÊ da queda antes de comprar.',

  educationalSections: [
    {
      h2: 'Oportunidade ou armadilha?',
      paragraphs: [
        'Ativos em baixa podem representar entradas a preços descontados, mas também podem estar refletindo deterioração de fundamentos. Antes de qualquer decisão, analise o motivo da queda: é setorial, macroeconômico ou específico da empresa?',
        { h3: 'Como usar este ranking' },
        {
          ul: [
            'Identifique setores com quedas generalizadas (pressão macro)',
            'Pesquise notícias recentes sobre cada ativo',
            'Compare a queda com pares do mesmo setor',
            'Verifique se a tese de longo prazo continua intacta',
          ],
        },
      ],
    },
    {
      h2: 'Setores Mais Resilientes em Momentos de Stress',
      paragraphs: [
        'Em ciclos de queda do Ibovespa, nem todos os setores caem na mesma intensidade. Setores defensivos (consumo básico, energia regulada, saneamento) tendem a cair menos por terem demanda inelástica e fluxo de caixa mais previsível. Já setores cíclicos (commodities, varejo discricionário, tech) sofrem mais em recessão. A tabela abaixo mostra padrões clássicos de comportamento setorial em quedas na B3.',
        'Defensivas: Caem menos (demanda inelástica). Tickers exemplo: ABEV3, NTCO3, EGIE3.',
        'Saneamento: Resiliente (regulado, demanda estável). Tickers exemplo: SBSP3.',
        'Bancos: Caem com aumento de inadimplência. Tickers exemplo: ITUB4, BBDC4, BBAS3.',
        'Commodities: Voláteis (sensíveis a ciclo global). Tickers exemplo: VALE3, PETR4.',
        'Varejo discricionário: Caem mais em recessão (consumo cai). Tickers exemplo: MGLU3, AMER3.',
        'Tech: Volátil, sensível a juros (duration alta). Tickers exemplo: TOTS3, LWSA3.',
      ],
    },
    {
      h2: 'Oportunidades de Compra vs Armadilhas de Valor (Value Traps)',
      paragraphs: [
        'Distinguir uma oportunidade real de uma armadilha de valor (value trap) é a habilidade mais importante do investidor de longo prazo. Os dois cenários parecem iguais na superfície (ação caiu, P/L baixo), mas o desfecho é diametralmente oposto: oportunidade vira retorno, armadilha vira prejuízo permanente.',
        'Oportunidade: Empresa boa, queda exagerada por evento de curto prazo (notícia ruim, crise setorial passageira, ciclo macro adverso). Sinais: P/L baixo versus histórico, fundamentos intactos (receita estável ou crescente, margens preservadas), gestão competente, vantagem competitiva preservada. Estratégia: comprar gradualmente em níveis técnicos (preço médio), com horizonte de 2-5 anos.',
        'Value Trap (Armadilha de Valor): Queda reflete deterioração real e estrutural (perda de market share, problema regulatório, mudança de hábito do consumidor, disrupção tecnológica). Sinais: receita caindo de forma consistente, margem comprimida, dívida crescente, payout caindo, gestão sem credibilidade. Estratégia: evitar mesmo que o P/L pareça atrativo. P/L baixo é sintoma, não solução.',
      ],
    },
    {
      h2: 'Stop Loss, Suporte e Resistência: Análise Técnica em Quedas',
      paragraphs: [
        'Análise técnica não é sinal de compra ou venda isolado, mas ferramenta complementar de gestão de risco. Em ações caindo, ela ajuda a identificar zonas de entrada com risco controlado e a definir pontos de saída em caso de erro.',
        'Suporte: preço onde a ação encontra demanda (compradores aparecem). Em tendências de queda, o rompimento de um suporte importante costuma acelerar a queda.',
        'Resistência: preço onde a ação encontra oferta (vendedores aparecem). Em recuperações, a quebra de uma resistência confirma reversão de tendência.',
        'Stop loss: ordem automática de venda para limitar perdas. Geralmente posicionada 5-10% abaixo do preço de entrada, ajustada conforme volatilidade do ativo (ATR).',
        'Em ações em queda, identificar suporte ajuda a achar entrada de baixo risco (perto do suporte, com stop logo abaixo).',
      ],
    },
    {
      h2: 'Comparativo com Ibovespa',
      paragraphs: [
        'Comparar a queda de uma ação com o movimento do Ibovespa permite distinguir queda específica do ativo de queda macro do mercado todo. Quando o Ibov cai 5% e uma ação cai 15%, há problema específico (não é apenas beta de mercado), pode ser resultado fraco, mudança regulatória negativa, perda de cliente importante. Quando o Ibov cai 5% e a ação cai 6%, a ação está apenas acompanhando o índice, provavelmente sem catalisador próprio.',
        'Use o ranking para distinguir queda específica de queda macro. Se múltiplas ações do mesmo setor caem juntas, é setorial. Se apenas uma cai isoladamente, há catalisador específico que merece investigação antes de qualquer decisão.',
      ],
    },
    {
      h2: 'Glossário Rápido',
      paragraphs: [
        'Value Trap (armadilha de valor): Ação que parece barata pelo múltiplo (P/L baixo), mas continua caindo porque os fundamentos estão se deteriorando.',
        'Stop Loss: Ordem automática de venda para limitar perdas, geralmente posicionada 5-10% abaixo do preço de entrada.',
        'Suporte / Resistência: Suporte é zona onde aparecem compradores (preço para de cair); resistência é onde aparecem vendedores (preço para de subir).',
        'Correção de mercado: Queda entre 10% e 20% no índice principal (Ibovespa). Acontece historicamente 1-2 vezes por ano e é considerada parte normal do ciclo.',
        'Bear Market: Queda acima de 20% no índice principal a partir do topo recente, caracterizando ciclo de baixa prolongado (meses ou anos).',
        'Drawdown: Diferença entre o pico anterior e o vale atual de um ativo ou carteira. Mede a maior queda já enfrentada.',
        'Catalisador negativo: Evento específico que derruba o preço: resultado abaixo do esperado, processo judicial, perda de contrato importante, mudança regulatória.',
      ],
    },
  ],

  crossLinks: [
    {
      title: 'Maiores Altas do Mês',
      desc: 'As 50 ações e FIIs com maior alta nos últimos 30 dias.',
      href: '/ranking/maiores-altas-mes',
    },
    {
      title: 'Maiores Dividend Yields',
      desc: 'Ações e FIIs com maior DY dos últimos 12 meses.',
      href: '/ranking/maiores-dividend-yield',
    },
    // 'Calendário de Dividendos' (/dividendos/calendario) REMOVIDO:
    // a página não existe no Nu (re-add quando existir).
    {
      title: 'Todos os Rankings',
      desc: 'Lista completa de rankings da Redentia.',
      href: '/rankings',
    },
  ],

  faqItems: [
    {
      q: 'O que é uma armadilha de valor (value trap)?',
      a: 'É uma ação que parece barata pelo múltiplo (P/L baixo, dividend yield alto), mas continua caindo porque os fundamentos estão se deteriorando estruturalmente. O investidor entra atraído pelo "preço barato", mas o preço continua caindo porque a empresa está perdendo valor de verdade. Comum em setores em disrupção ou empresas com problemas de gestão.',
    },
    {
      q: 'Como diferenciar oportunidade de armadilha de valor?',
      a: 'Oportunidade tem fundamentos intactos (receita estável ou crescente, margens preservadas, gestão competente) e queda causada por evento de curto prazo (notícia ruim, ciclo macro). Armadilha tem deterioração real (receita caindo de forma consistente, margens comprimidas, perda de market share, dívida crescente). Olhe os 4-8 últimos trimestres antes de decidir.',
    },
    {
      q: 'Devo comprar a ação que mais caiu?',
      a: 'Só após investigar profundamente o porquê da queda. Se for evento curto e fundamentos intactos, sim, é oportunidade. Se for deterioração estrutural, não, é armadilha. Comprar simplesmente porque caiu (estratégia "catch a falling knife") é receita de prejuízo. Use o ranking como filtro inicial, não como sinal de compra.',
    },
    {
      q: 'O que é stop loss e como definir?',
      a: 'Stop loss é uma ordem automática que vende a ação se ela cair além de um limite predefinido (ex: 10% abaixo do preço de compra). Limita o prejuízo em caso de erro de tese ou movimento adverso. O nível ideal depende da volatilidade do ativo (use ATR), do horizonte de investimento e do tamanho da posição na carteira.',
    },
    {
      q: 'Quando o mercado entra em correção?',
      a: 'Queda entre 10% e 20% no Ibovespa caracteriza correção de mercado. Acima de 20% a partir do topo recente, é classificado como bear market (mercado urso). Historicamente, correções de 10%+ acontecem 1-2 vezes por ano e fazem parte do ciclo normal. Bear markets acontecem a cada 5-7 anos em média no Brasil.',
    },
  ],
}

export default copy
