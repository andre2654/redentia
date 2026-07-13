/**
 * Copy portada VERBATIM da página dedicada da Redentia antiga
 * (Frontend/app/pages/ranking/redentia-score.vue), na mesma ordem de tags.
 * ADAPTAÇÃO AUTORIZADA (decisão PR2, mesma régua do /asset): escala 0-10 → 0-100
 * em methodologySteps (Cálculo), methodologyIntro, methodologyFormula e FAQs
 * (6→60, 8→80, 2→20, 8+→80+, ±0.5 ponto→±5 pontos, cap 10→100, ×10→×100).
 * Pontos internos por posição (1.0 / 0.98 / 0.02) mantidos verbatim.
 * answerFirst vazio: a página antiga não tinha bloco answer-first (o lead do
 * hero já vive no registry). crossLinks vazio: a página antiga não tinha
 * seção "Ferramentas relacionadas" (só o CTA final, que não é copy).
 */
import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst: '',
  methodologyIntro: [
    'Cap em 100. Top 1 vale 1.0 ponto, top 50 vale 0.02. Sem pesos diferentes entre rankings.',
  ],
  methodologySteps: [
    {
      title: 'Coleta',
      body: 'Coletamos os Top 50 de cada um dos 15 rankings positivos da B3: dividend yield, valor de mercado, ROE, Graham, Bazin, crescimento de receita e lucro, e mais.',
    },
    {
      title: 'Pontuação',
      body: 'Cada aparição vale pontos pela posição: posição #1 = 1.0 ponto, #2 = 0.98, #50 = 0.02. Top 1 sempre vale mais que somar várias posições baixas.',
    },
    {
      title: 'Cálculo',
      body: 'Score = soma dos pontos ÷ 15 × 100, com cap em 100. Quem aparece em vários rankings simultaneamente acumula score alto. Quem só aparece em um, fica baixo.',
    },
  ],
  methodologyFormula: 'score = Σ((51 − posição) ÷ 50) ÷ 15 × 100',
  educationalSections: [
    {
      h2: 'Por que combinar 15 rankings?',
      paragraphs: [
        'Uma boa empresa raramente lidera em uma única dimensão. Petrobras tem dividend yield alto, mas também aparece bem em valor de mercado e em receita. Itaú combina ROE elevado com crescimento de lucro consistente. Aparecer em vários rankings simultaneamente é o sinal mais robusto de solidez fundamental ampla, mais difícil de produzir com sorte ou manipulação contábil pontual.',
        'Quando você olha só um indicador, fica vulnerável a vieses isolados. Empresa com dividend yield estratosférico pode estar pagando dividendo extraordinário num ano ruim, mascarando deterioração operacional. Empresa com ROE altíssimo pode estar muito alavancada, com retorno cosmético sustentado por dívida. O score combina 15 ângulos justamente pra suavizar essas distorções e te entregar uma classificação mais confiável.',
      ],
    },
    {
      h2: 'Limitações',
      paragraphs: [
        'Score alto não garante retorno futuro. O Redentia Score é uma foto do passado e do presente, não uma previsão. Ele te diz quais empresas hoje têm o conjunto mais sólido de indicadores fundamentalistas, não quais vão subir nos próximos 12 meses. Mercado oscila por motivos que números fundamentalistas não capturam: macro, fluxo, narrativa, timing de ciclo.',
        'Algumas dimensões ficam intencionalmente de fora. Notícias, momentum de preço e variação de curto prazo não entram no cálculo porque são ruidosas e podem distorcer o ranking. Uma ação que subiu 80% em um mês merece atenção, mas isso é movimento, não qualidade fundamentalista. O score foca no balanço, no resultado e na consistência histórica, deixando o curto prazo pra outras páginas dedicadas.',
      ],
    },
    {
      h2: 'Como usar o score',
      paragraphs: [
        'Use o Redentia Score como filtro inicial pra estudo. Pegue as 10-20 ações com score mais alto e leia o demonstrativo, entenda o setor, veja o histórico de dividendos e a tese de longo prazo. Score alto é sinal pra investigar mais fundo, nunca pra comprar no automático sem entender o negócio. Combine sempre com sua análise pessoal e seu objetivo de carteira.',
        'Revisite o ranking trimestralmente, alinhado com a divulgação de balanços. Empresas que estavam no top 10 podem cair para o top 30 quando margem comprime ou crescimento desacelera. O movimento entre faixas é informação relevante: queda persistente sugere deterioração estrutural, queda pontual após resultado fraco pode ser oportunidade. O ranking se atualiza diariamente conforme os dados de balanço e cotação.',
      ],
    },
  ],
  crossLinks: [],
  faqItems: [
    {
      q: 'O que significa um score alto?',
      a: 'Score acima de 60 já é considerado muito bom. Indica que a empresa aparece bem posicionada em pelo menos 8-10 dos 15 rankings simultaneamente, sinal de solidez fundamentalista ampla. Score acima de 80 é raro e geralmente envolve blue chips com balanço forte, dividendos consistentes e crescimento. Score baixo (abaixo de 20) significa que a ação só aparece em um ou dois rankings, faltando consistência multi-dimensional.',
    },
    {
      q: 'Por que algumas ações grandes têm score baixo?',
      a: 'Tamanho não basta. Uma empresa pode ter market cap de R$ 100 bilhões e ainda assim ter ROE pífio, margem comprimida, crescimento estagnado e dividend yield baixo. Nesse caso, ela aparece bem no ranking de valor de mercado, mas falha nos outros 14, e o score reflete isso. Empresas com balanço grande mas resultado fraco operam como pesos mortos no índice e o score expõe essa diferença.',
    },
    {
      q: 'O que fazer com uma ação score 80+?',
      a: 'Investigar antes de comprar. Score 80+ é gatilho pra estudo aprofundado, não recomendação de compra. Leia o release de resultados mais recente, entenda o setor, veja se a tese sustenta os indicadores ou se eles estão inflados por algum evento pontual (venda de ativo, ganho não recorrente). Score alto te diz onde olhar primeiro, mas a decisão de alocação depende do seu perfil, prazo e do preço atual da ação.',
    },
    {
      q: 'Os 15 rankings têm pesos iguais?',
      a: 'Sim. Todos os 15 rankings entram com peso igual no cálculo. Apareceu em #1 do dividend yield vale o mesmo que aparecer em #1 do ROE ou #1 do market cap. Essa decisão é deliberada: pesos diferentes seriam julgamento subjetivo e quebrariam a transparência do método. O que diferencia o impacto é a posição dentro de cada ranking, não qual ranking é.',
    },
    {
      q: 'Como o score muda ao longo do tempo?',
      a: 'O score se recalcula diariamente usando os dados mais recentes de cotação, balanço e indicadores. Cotação muda todo dia útil, então market cap, P/L, dividend yield e upside oscilam. Balanço muda trimestralmente, atualizando ROE, margem, receita, lucro e crescimento. Empresas costumam manter score relativamente estável (oscilando dentro de uma faixa de ±5 pontos), com mudanças bruscas após resultados muito fora do esperado.',
    },
  ],
}

export default copy
