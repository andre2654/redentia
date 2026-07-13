/**
 * Copy do /ranking/maiores-altas-mes — portada VERBATIM da página dedicada
 * da Redentia antiga (Frontend/app/pages/ranking/maiores-altas-mes.vue),
 * na MESMA ordem de tags. Única alteração permitida: " — " → vírgula.
 * Links re-mapeados: /ranking (hub) → /rankings · demais mantidos.
 * NOTA de flattening (limites do modelo RankingCopy):
 * h3 usa a variante { h3 }; tabela de setores, cards comparativos, listas
 * (ul/ol) e glossário <dl> viraram parágrafos "Título: texto" (texto das
 * células/itens verbatim; passos numerados ganharam o prefixo "N." que o
 * <ol> renderizava). CrossLink 'Calendário de Dividendos' REMOVIDO:
 * /dividendos/calendario não existe no Nu.
 */
import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst:
    'As ações que mais subiram no mês geralmente refletem 3 fatores: bons resultados trimestrais, mudanças setoriais (commodities, juros, política) ou momentum técnico (entrada de fluxo institucional). Este ranking lista as 50 ações e FIIs com maior valorização nos últimos 30 dias na B3. Importante: alta recente NÃO garante alta futura, exige análise dos fundamentos antes de comprar.',

  educationalSections: [
    {
      h2: 'Como o ranking é calculado?',
      paragraphs: [
        'Comparamos o preço de fechamento atual com o preço de fechamento de aproximadamente 30 dias corridos atrás (respeitando dias úteis da B3). A variação percentual é então ordenada do maior para o menor ganho.',
        { h3: 'Por que acompanhar?' },
        'Rankings de altas ajudam a identificar momentum, setores aquecidos e ativos em tendência. Combinado com análise fundamentalista, serve como filtro inicial para novas teses de investimento ou monitoramento de posições existentes.',
      ],
    },
    {
      h2: 'Setores Mais Valorizados nos Últimos 30 Dias',
      paragraphs: [
        'Quando uma ação aparece entre as maiores altas, raramente é evento isolado. Em geral, o setor inteiro está sendo reavaliado pelo mercado por algum gatilho macro (juros, câmbio, commodities) ou setorial (regulação, demanda, ciclo). A tabela abaixo mostra padrões clássicos de comportamento setorial em ciclos de alta na B3.',
        'Commodities: Alta com ciclo de commodities (mineração, óleo). Tickers exemplo: VALE3, PETR4.',
        'Bancos: Alta com queda de inadimplência ou Selic estável. Tickers exemplo: ITUB4, BBDC4, BBAS3, B3SA3.',
        'FIIs de tijolo: Alta com queda de juros longos (NTN-B). Tickers exemplo: HGLG11, XPML11, VISC11.',
        'FIIs de papel: Alta com Selic estável ou em queda controlada. Tickers exemplo: KNIP11, MXRF11, KNCR11.',
        'Defensivas: Alta em períodos de stress macro (rotação de risco). Tickers exemplo: ABEV3, EGIE3.',
      ],
    },
    {
      h2: 'Comparativo com Ibovespa',
      paragraphs: [
        'O Ibovespa (Ibov) é o índice de referência da bolsa brasileira, composto pelas ações mais negociadas da B3. Comparar a alta de uma ação contra o Ibov é o primeiro filtro para entender se a valorização é mérito do ativo ou simplesmente carona no movimento geral do mercado.',
        'Alta acima do Ibov: outperformance. A ação subiu mais que o índice, indicando catalisador específico (resultado, fluxo, expectativa setorial).',
        'Alta acompanhando o Ibov: beta de mercado. A ação está apenas sendo arrastada pelo movimento geral, sem destaque próprio.',
        'Alta sozinha enquanto Ibov cai: catalisador específico forte. Pode ser resultado positivo, M&A, mudança regulatória favorável ou rotação setorial.',
        'Use o ranking para encontrar candidatos de momentum, mas confirme sempre com análise fundamentalista antes de qualquer entrada.',
      ],
    },
    {
      h2: 'Top Gainers vs Buy and Hold',
      paragraphs: [
        'Top Gainers (Momentum): Estratégia de curto a médio prazo focada em ativos com forte valorização recente. Aposta na continuação da tendência (3-12 meses). Exige acompanhamento ativo, gestão de risco e definição clara de stop loss. Riscos: reversão rápida, entrada tardia, custos de transação.',
        'Buy and Hold (Longo Prazo): Estratégia clássica de longo prazo, popularizada por Warren Buffett. Foco em qualidade do negócio, vantagem competitiva e preço justo. Holding period de 5+ anos. Tolera quedas de curto prazo desde que a tese fundamental esteja intacta.',
        'Não confunda valorização recente com qualidade. Algumas das maiores altas vêm de empresas em recuperação após queda forte (efeito base), enquanto outras refletem fundamentos sólidos sendo finalmente reconhecidos pelo mercado.',
      ],
    },
    {
      h2: 'Como Analisar uma Ação que Subiu Muito',
      paragraphs: [
        'Antes de entrar em uma ação que aparece no topo do ranking, siga este checklist de 5 passos para evitar entrar tarde em movimento já esticado.',
        '1. Verificar o trigger: o que causou a alta? Resultado trimestral, fusão e aquisição (M&A), nova regulação, lançamento de produto, dividendo extraordinário? Sem trigger identificável, desconfie.',
        '2. Olhar P/L atual vs setor: a ação ficou cara depois da alta? Compare o múltiplo Preço/Lucro (P/L) atual com a média do setor e com o histórico da própria empresa.',
        '3. Conferir o volume financeiro: alta com volume crescente é movimento real, com participação institucional. Alta sem volume costuma ser especulação ou manipulação de baixa liquidez.',
        '4. Analisar valor relativo: a ação subiu mais que pares do mesmo setor? Mais que o Ibovespa? Pode haver razão estrutural ou simples descolamento temporário.',
        '5. Decidir: comprar ou esperar: tendência forte com fundamentos = entrada possível em pull-back (correção). Sem fundamentos = melhor passar e procurar próxima oportunidade.',
      ],
    },
    {
      h2: 'Glossário Rápido',
      paragraphs: [
        'Top gainers: Termo em inglês usado por traders para se referir aos ativos com maior alta percentual em um período.',
        'Momentum: Tendência de continuação do movimento de preços. Ações em alta tendem a continuar subindo no curto prazo (3-12 meses).',
        'Beta: Sensibilidade de uma ação em relação ao mercado. Beta acima de 1 indica ativo mais volátil que o Ibovespa.',
        'Outperformance / Underperformance: Quando o ativo sobe acima (out) ou abaixo (under) do índice de referência (Ibovespa).',
        'Catalisador: Evento específico que move o preço da ação: resultado, fusão, regulação, dividendo extraordinário.',
        'IBOV / Ibovespa: Principal índice da bolsa brasileira (B3), composto pelas ações mais negociadas. Funciona como termômetro do mercado.',
        'Volume financeiro: Total negociado em reais. Alto volume confirma o movimento de preço, baixo volume sinaliza fragilidade técnica.',
      ],
    },
  ],

  crossLinks: [
    {
      title: 'Maiores Baixas do Mês',
      desc: 'As 50 ações e FIIs com maior queda nos últimos 30 dias.',
      href: '/ranking/maiores-baixas-mes',
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
      q: 'O que faz uma ação subir muito em 30 dias?',
      a: 'Quatro motivos principais: (1) trigger fundamental como resultado trimestral acima do esperado, (2) mudança setorial favorável (alta de commodities, queda de juros), (3) entrada de fluxo institucional comprador (estrangeiros, fundos), e (4) recuperação técnica após queda forte (efeito base). Sempre identifique o motivo antes de comprar.',
    },
    {
      q: 'O que é momentum em investimentos?',
      a: 'Momentum é a estratégia que aposta na continuação de tendências de preço. Estatisticamente comprovada em horizontes de 3 a 12 meses (estudos de Jegadeesh & Titman), funciona melhor em mercados com tendências claras. Pode reverter rápido quando o ciclo muda, exigindo gestão ativa e stop loss.',
    },
    {
      q: 'Devo comprar a ação que mais subiu no mês?',
      a: 'Não automaticamente. Verifique o trigger da alta, P/L atual versus setor, volume financeiro acompanhando o movimento, e fundamentos da empresa. Comprar simplesmente porque subiu é estratégia perdedora no longo prazo. Use o ranking como filtro, não como sinal de compra.',
    },
    {
      q: 'Como o Ibovespa influencia o ranking?',
      a: 'O Ibovespa é o benchmark da bolsa brasileira. Se uma ação subiu 10% e o Ibov subiu 8%, a ação está acompanhando o mercado (beta). Se subiu 10% com Ibov caindo 3%, há catalisador específico (alfa). Use a comparação para distinguir alta estrutural de simples carona no índice.',
    },
    {
      q: 'Top gainers e blue chips são a mesma coisa?',
      a: 'Não. Top gainers é quem subiu mais recentemente, podendo ser empresas pequenas ou de baixa liquidez. Blue chips são empresas grandes, consolidadas e com histórico longo (ITUB4, VALE3, PETR4, WEGE3, B3SA3). Blue chips podem aparecer entre top gainers em ciclos específicos, mas não é a regra.',
    },
  ],
}

export default copy
