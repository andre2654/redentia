/**
 * Registry META dos 22 rankings (PLANO-RANKINGS.md). SÓ meta — a copy
 * educacional vive em ./copy/<slug>.ts (1 arquivo por ranking, port paralelo).
 *
 * h1/lead/chips/metaTitle/metaDescription = VERBATIM das páginas antigas
 * (Frontend/app/pages/ranking/*) — contrato de SEO, não reescrever.
 * Exceções documentadas: redentia-score adaptado da escala 0-10 pra /100
 * (decisão PR2 — mesma régua do /acao) e tesouro-direto (ranking novo).
 *
 * Endpoints validados ao vivo (19 GET /rankings/* + derivação /tesouro):
 * mapeamento tirado do service antigo (Frontend/app/services/assets.ts).
 */
import type { RankingMeta } from '~/types/rankings'

const TODOS: RankingMeta['types'] = ['acoes', 'fiis', 'bdrs']
const SO_ACOES: RankingMeta['types'] = ['acoes']

export const RANKINGS: Record<string, RankingMeta> = {

  // ============================================================
  // Qualidade e consistência
  // ============================================================
  'redentia-score': {
    slug: 'redentia-score',
    title: 'Redentia Score',
    endpoint: 'redentia-score',
    // metaTitle/lead ADAPTADOS da antiga SÓ na escala (0-10 → 0-100,
    // decisão PR2); resto verbatim, sem trocas lexicais.
    metaTitle: 'Redentia Score 2026: Score 0-100 para Ações da B3',
    metaDescription:
      'Score proprietário 0 a 100 que mede a qualidade fundamentalista de ações da B3 cruzando 15 rankings: dividend yield, ROE, Graham, Bazin, crescimento, e mais.',
    h1: 'Redentia Score',
    lead:
      'O score 0 a 100 que mede a qualidade fundamentalista de cada ação da B3 cruzando 15 rankings simultaneamente. Quem aparece bem em vários rankings tem score alto. Quem só aparece em um, tem score baixo.',
    chips: ['15 rankings combinados', 'Atualizado diariamente', 'Algoritmo proprietário', 'Top 50 ativos'],
    columns: ['score', 'rankingCount', 'dy', 'marketCap'],
    primaryMetric: 'score',
    // DIVERGÊNCIA DELIBERADA vs a antiga (que expunha Todos/Ações/FIIs/ETFs):
    // /rankings/redentia-score?type=REIT e ?type=ETF retornam {data:[]} ao
    // vivo (verificado 2026-07-13) — regra 5 do plano: tab só onde dado existe.
    types: SO_ACOES,
    classe: ['acoes'],
    tema: 'Qualidade e consistência',
  },

  'buy-and-hold': {
    slug: 'buy-and-hold',
    title: 'Buy and Hold (Score)',
    endpoint: 'buy-and-hold',
    metaTitle: 'Melhores Ações Buy and Hold 2026 | Score 0-10',
    metaDescription:
      'Score de 0 a 10 que combina ROE, dividend yield, dívida e consistência de lucros. Top 50 ações para estratégia de longo prazo na bolsa brasileira.',
    h1: 'Melhores Ações para Buy and Hold',
    lead:
      'Score proprietário de 0 a 10 que combina ROE consistente, dividend yield, baixo endividamento e regularidade de pagamentos. Pensado para o investidor de longo prazo que segue a filosofia buy and hold.',
    chips: ['Atualizado diariamente', 'Dados B3', 'Top 50', 'Score 0-10'],
    columns: ['buyHoldScore', 'dy', 'roe', 'marketCap'],
    primaryMetric: 'buyHoldScore',
    types: SO_ACOES,
    classe: ['acoes'],
    tema: 'Qualidade e consistência',
  },

  'maiores-roe': {
    slug: 'maiores-roe',
    title: 'Maiores ROEs',
    endpoint: 'top-roe',
    metaTitle: 'Maiores ROEs da Bolsa Brasileira 2026',
    metaDescription:
      'Top 50 ações com maior ROE (Return on Equity) da B3. Mostra quanto a empresa lucra sobre o capital próprio. Indicador chave de qualidade.',
    h1: 'Maiores ROEs da Bolsa Brasileira',
    lead:
      'As 50 empresas com maior retorno sobre patrimônio líquido (ROE) na B3. Indicador favorito de Buffett pra identificar negócios de alta qualidade. Atualizado com últimos balanços.',
    chips: ['Atualizado diariamente', 'Dados B3', 'Top 50', 'Qualidade'],
    columns: ['roe', 'netMargin', 'dy', 'marketCap'],
    primaryMetric: 'roe',
    types: SO_ACOES,
    classe: ['acoes'],
    tema: 'Qualidade e consistência',
  },

  'maiores-margem-liquida': {
    slug: 'maiores-margem-liquida',
    title: 'Maiores Margem Líquida',
    endpoint: 'top-net-margin',
    metaTitle: 'Maiores Margens Líquidas da B3 2026',
    metaDescription:
      'Top 50 empresas brasileiras com maior margem líquida (lucro ÷ receita). Mostra eficiência operacional e poder de geração de caixa por real vendido.',
    h1: 'Maiores Margens Líquidas da Bolsa',
    lead:
      'As 50 empresas listadas na B3 que mais convertem receita em lucro líquido, indicador chave de eficiência operacional e poder de precificação. Atualizado com últimos balanços.',
    chips: ['Atualizado diariamente', 'Dados B3', 'Top 50', 'Eficiência'],
    columns: ['netMargin', 'revenue', 'netIncome', 'marketCap'],
    primaryMetric: 'netMargin',
    types: SO_ACOES,
    classe: ['acoes'],
    tema: 'Qualidade e consistência',
  },

  'nunca-tiveram-prejuizo': {
    slug: 'nunca-tiveram-prejuizo',
    title: 'Nunca Tiveram Prejuízo',
    endpoint: 'never-loss',
    metaTitle: 'Empresas Nunca Tiveram Prejuízo B3',
    metaDescription:
      'Empresas da B3 que mantiveram lucro líquido positivo todos os anos nos últimos 5+ anos. Ativos resilientes ao ciclo econômico. Top 50.',
    h1: 'Empresas que Nunca Tiveram Prejuízo (Últimos 5+ Anos)',
    lead:
      'Ativos resilientes ao ciclo econômico que mantiveram lucro positivo em todos os balanços anuais dos últimos 5 anos ou mais.',
    chips: ['Resiliência', 'Dados B3', '5+ anos seguidos', 'Top 50'],
    columns: ['netIncome', 'roe', 'marketCap', 'dy'],
    primaryMetric: 'netIncome',
    types: SO_ACOES,
    classe: ['acoes'],
    tema: 'Qualidade e consistência',
  },

  // ============================================================
  // Renda e dividendos
  // ============================================================
  'maiores-dividend-yield': {
    slug: 'maiores-dividend-yield',
    title: 'Maiores Dividend Yields',
    endpoint: 'top-dividend-yield',
    reitMinCapZero: true,
    metaTitle: 'Maiores Dividend Yields da Bolsa 2026',
    metaDescription:
      'Top 50 ações e FIIs com maiores Dividend Yields da B3. Bancos, seguradoras, transmissão, FIIs de tijolo e papel. Renda passiva mensal. Atualizado diário.',
    h1: 'Maiores Dividend Yields',
    lead:
      'As 50 ações e fundos imobiliários (FIIs) com maiores dividend yields da bolsa brasileira (B3) nos últimos 12 meses (TTM). Inclui dividendos pagos por bancos (BBSE3, ITUB4, BBDC4, BBAS3), seguradoras, energia, saneamento, FIIs de tijolo (HGLG11) e FIIs de papel (MXRF11, KNIP11, KNCR11). Ranking atualizado diariamente após pregão, baseado em dados oficiais. Considera dividendos + JCP (Juros sobre Capital Próprio).',
    chips: ['Top 50 atualizado diário', 'Dados oficiais B3', 'Dividendos + JCP', 'Anti value trap'],
    columns: ['dy', 'pe', 'change', 'marketCap'],
    primaryMetric: 'dy',
    types: TODOS,
    classe: ['acoes', 'fiis', 'bdrs'],
    tema: 'Renda e dividendos',
  },

  // ============================================================
  // Valuation e preço justo
  // ============================================================
  'mais-baratas-graham': {
    slug: 'mais-baratas-graham',
    title: 'Mais Baratas (Graham)',
    endpoint: 'graham-discount',
    metaTitle: 'Ações Mais Baratas pela Fórmula de Graham 2026',
    metaDescription:
      'Top 50 ações com maior desconto pela Fórmula de Graham (raiz de 22.5 × LPA × VPA). Estratégia value clássica de Benjamin Graham aplicada à B3.',
    h1: 'Ações Mais Baratas pela Fórmula de Graham',
    lead:
      'As 50 ações brasileiras com maior desconto em relação ao preço justo calculado pela Fórmula de Graham, raiz quadrada de 22,5 vezes o LPA vezes o VPA. Estratégia clássica de value investing de Benjamin Graham.',
    chips: ['Atualizado diariamente', 'Dados B3', 'Top 50', 'Fórmula Graham'],
    columns: ['grahamPrice', 'upsidePct', 'change', 'marketCap'],
    primaryMetric: 'upsidePct',
    types: SO_ACOES,
    classe: ['acoes'],
    tema: 'Valuation e preço justo',
  },

  'mais-baratas-bazin': {
    slug: 'mais-baratas-bazin',
    title: 'Mais Baratas (Bazin)',
    endpoint: 'bazin-discount',
    metaTitle: 'Ações Mais Baratas pela Fórmula de Bazin 2026',
    metaDescription:
      'Top 50 ações descontadas pela Fórmula de Bazin (dividendo anual ÷ 6%). Estratégia de Décio Bazin para investidor de renda passiva e dividendos.',
    h1: 'Ações Mais Baratas pela Fórmula de Bazin',
    lead:
      'As 50 ações brasileiras com maior desconto pela Fórmula de Bazin, dividendo médio anual dividido por 6 por cento. Foco em quem busca renda passiva por dividendos consistentes.',
    chips: ['Atualizado diariamente', 'Dados B3', 'Top 50', 'Fórmula Bazin'],
    columns: ['bazinPrice', 'upsidePct', 'dy', 'marketCap'],
    primaryMetric: 'upsidePct',
    types: SO_ACOES,
    classe: ['acoes'],
    tema: 'Valuation e preço justo',
  },

  'menores-pl': {
    slug: 'menores-pl',
    title: 'Menores P/Ls',
    endpoint: 'low-pe',
    metaTitle: 'Menores P/Ls da Bolsa Brasileira 2026',
    metaDescription:
      'Top 50 ações com menor P/L (preço sobre lucro) da B3. Empresas potencialmente baratas em relação ao lucro. Atenção: P/L baixo pode ser value trap.',
    h1: 'Menores P/Ls da Bolsa Brasileira',
    lead:
      'As 50 ações da B3 com menor P/L (preço sobre lucro), indicador clássico de quanto o mercado paga pra cada real de lucro da empresa. Pode revelar oportunidades de value, mas também armadilhas.',
    chips: ['Atualizado diariamente', 'Dados B3', 'Top 50', 'Value trap?'],
    columns: ['pe', 'dy', 'marketCap', 'change'],
    primaryMetric: 'pe',
    types: SO_ACOES,
    classe: ['acoes'],
    tema: 'Valuation e preço justo',
  },

  'maior-potencial-upside': {
    slug: 'maior-potencial-upside',
    title: 'Maior Potencial de Upside',
    endpoint: 'upside-potential',
    metaTitle: 'Maior Potencial de Upside da Bolsa B3 2026',
    metaDescription:
      'Top 50 ações com maior upside em relação ao preço justo. Combina Fórmula de Graham e Bazin pra mostrar maiores oportunidades de valorização teórica.',
    h1: 'Maior Potencial de Upside',
    lead:
      'As 50 ações com maior potencial de valorização teórica em relação ao preço justo, combinando Fórmulas de Graham e Bazin. Lista as oportunidades de maior margem de segurança no momento.',
    chips: ['Atualizado diariamente', 'Dados B3', 'Top 50', 'Margem de segurança'],
    columns: ['upsidePct', 'grahamPrice', 'bazinPrice', 'marketCap'],
    primaryMetric: 'upsidePct',
    types: SO_ACOES,
    classe: ['acoes'],
    tema: 'Valuation e preço justo',
  },

  // ============================================================
  // Tamanho e resultado
  // ============================================================
  'maiores-valor-mercado': {
    slug: 'maiores-valor-mercado',
    title: 'Maiores Valor de Mercado',
    endpoint: 'top-market-cap',
    metaTitle: 'Maiores Valor de Mercado da B3 2026',
    metaDescription:
      'Top 50 maiores empresas por valor de mercado da bolsa brasileira: Petrobras, Vale, Itaú, Ambev, Bradesco. Atualizado diariamente com cotação e indicadores.',
    h1: 'Maiores Empresas por Valor de Mercado',
    lead:
      'As 50 maiores empresas listadas na B3 ordenadas por capitalização de mercado, com Petrobras, Vale, Itaú, Bradesco e blue chips brasileiras. Atualizado diariamente após pregão.',
    chips: ['Atualizado diariamente', 'Dados B3', 'Top 50', 'Blue chips'],
    columns: ['marketCap', 'change', 'dy', 'pe'],
    primaryMetric: 'marketCap',
    types: TODOS,
    classe: ['acoes', 'fiis', 'bdrs'],
    tema: 'Tamanho e resultado',
  },

  'maiores-receitas': {
    slug: 'maiores-receitas',
    title: 'Maiores Receitas',
    endpoint: 'top-revenue',
    metaTitle: 'Maiores Receitas da Bolsa Brasileira 2026',
    metaDescription:
      'Top 50 empresas com maior receita anual da B3, Petrobras, Vale, JBS, Marfrig, Ambev. Faturamento líquido dos últimos 12 meses, ranking atualizado.',
    h1: 'Maiores Receitas da Bolsa Brasileira',
    lead:
      'As 50 empresas listadas na B3 com maior faturamento dos últimos 12 meses. Petrobras, Vale, JBS, Marfrig, Ambev, dominam por escala e cobertura de mercado. Atualizado com últimos balanços.',
    chips: ['Atualizado diariamente', 'Dados B3', 'Top 50', 'TTM'],
    columns: ['revenue', 'netIncome', 'marketCap', 'change'],
    primaryMetric: 'revenue',
    types: SO_ACOES,
    classe: ['acoes'],
    tema: 'Tamanho e resultado',
  },

  'maiores-lucros': {
    slug: 'maiores-lucros',
    title: 'Maiores Lucros',
    endpoint: 'top-net-income',
    metaTitle: 'Maiores Lucros da Bolsa Brasileira 2026',
    metaDescription:
      'Top 50 empresas com maior lucro líquido anual da B3. Petrobras, Itaú, Vale, Bradesco, BB. Lucro líquido TTM atualizado com últimos balanços oficiais.',
    h1: 'Maiores Lucros da Bolsa Brasileira',
    lead:
      'As 50 empresas com maior lucro líquido nos últimos 12 meses na B3. Petrobras, Itaú, Vale, Bradesco e Banco do Brasil costumam liderar pela combinação de escala e margem. Atualizado com balanços recentes.',
    chips: ['Atualizado diariamente', 'Dados B3', 'Top 50', 'TTM'],
    columns: ['netIncome', 'revenue', 'netMargin', 'marketCap'],
    primaryMetric: 'netIncome',
    types: SO_ACOES,
    classe: ['acoes'],
    tema: 'Tamanho e resultado',
  },

  'maiores-caixa': {
    slug: 'maiores-caixa',
    title: 'Maiores Caixa',
    endpoint: 'top-cash',
    metaTitle: 'Maiores Posições de Caixa da Bolsa B3 2026',
    metaDescription:
      'Top 50 empresas com maior caixa disponível na B3. Saúde financeira, capacidade de aquisições, dividendos extraordinários e resiliência em crises.',
    h1: 'Maiores Posições de Caixa da Bolsa',
    lead:
      'As 50 empresas listadas na B3 com maior posição de caixa e equivalentes. Indica saúde financeira, capacidade de aquisições, dividendos extraordinários e resistência a crises.',
    chips: ['Atualizado diariamente', 'Dados B3', 'Top 50', 'Resiliência'],
    columns: ['cash', 'marketCap', 'dy', 'change'],
    primaryMetric: 'cash',
    types: SO_ACOES,
    classe: ['acoes'],
    tema: 'Tamanho e resultado',
  },

  // ============================================================
  // Crescimento
  // ============================================================
  'crescimento-receita-5-anos': {
    slug: 'crescimento-receita-5-anos',
    title: 'Crescimento Receita (5 anos)',
    endpoint: 'revenue-growth-5y',
    metaTitle: 'Maior Crescimento de Receita 5 Anos B3',
    metaDescription:
      'Empresas da B3 que mais cresceram em receita nos últimos 5 anos. CAGR calculado a partir de balanços anuais oficiais. Top 50 atualizados.',
    h1: 'Empresas com Maior Crescimento de Receita em 5 Anos',
    lead:
      'CAGR de receita líquida calculado a partir dos balanços anuais oficiais das empresas listadas na B3.',
    chips: ['CAGR 5 anos', 'Dados B3', 'Atualizado diariamente', 'Top crescimento'],
    columns: ['revenueGrowth5y', 'marketCap', 'change', 'pe'],
    primaryMetric: 'revenueGrowth5y',
    types: SO_ACOES,
    classe: ['acoes'],
    tema: 'Crescimento',
  },

  'crescimento-lucro-5-anos': {
    slug: 'crescimento-lucro-5-anos',
    title: 'Crescimento Lucro (5 anos)',
    endpoint: 'net-income-growth-5y',
    metaTitle: 'Maior Crescimento de Lucro 5 Anos B3',
    metaDescription:
      'Empresas que mais cresceram em lucro líquido nos últimos 5 anos na B3. Ranking pelo CAGR calculado de balanços anuais. Top 50 atualizados.',
    h1: 'Empresas com Maior Crescimento de Lucro em 5 Anos',
    lead:
      'Pelo lucro líquido, ranking calculado por CAGR (taxa de crescimento anual composta) dos últimos 5 balanços.',
    chips: ['CAGR 5 anos', 'Dados B3', 'Atualizado diariamente', 'Lucro líquido'],
    columns: ['netIncomeGrowth5y', 'marketCap', 'change', 'roe'],
    primaryMetric: 'netIncomeGrowth5y',
    types: SO_ACOES,
    classe: ['acoes'],
    tema: 'Crescimento',
  },

  // ============================================================
  // Momentum e mercado
  // ============================================================
  'maiores-altas-mes': {
    slug: 'maiores-altas-mes',
    title: 'Maiores Altas (30 dias)',
    endpoint: 'monthly-change',
    extraParams: { side: 'top' },
    metaTitle: 'Maiores Altas do Mês na Bolsa Brasileira',
    metaDescription:
      'Ranking das 50 ações e FIIs que mais subiram nos últimos 30 dias na B3. Top gainers, momentum, comparativo com Ibovespa. Atualizado diário.',
    h1: 'Maiores Altas do Mês: Ações que Mais Subiram na Bolsa B3 2026',
    lead:
      'As 50 ações e FIIs que mais subiram nos últimos 30 dias na B3 (Bolsa, Brasil, Balcão), com performance comparada ao Ibovespa e desempenho setorial. Top gainers da semana e do mês incluem ações de bancos, FIIs de logística e papel, blue chips brasileiras como VALE3, ITUB4, ABEV3, B3SA3 e fundos imobiliários como HGLG11, XPML11, KNIP11. Atualizado diariamente após pregão.',
    chips: ['Atualizado diário', 'Variação 30 dias', 'Dados oficiais B3', 'Comparativo Ibov'],
    columns: ['change', 'marketCap'],
    primaryMetric: 'change',
    changeLabel: '30d',
    types: TODOS,
    classe: ['acoes', 'fiis', 'bdrs'],
    tema: 'Momentum e mercado',
  },

  'maiores-baixas-mes': {
    slug: 'maiores-baixas-mes',
    title: 'Maiores Baixas (30 dias)',
    endpoint: 'monthly-change',
    extraParams: { side: 'bottom' },
    metaTitle: 'Maiores Baixas do Mês na Bolsa Brasileira',
    metaDescription:
      'Ranking das 50 ações e FIIs que mais caíram nos últimos 30 dias na B3. Oportunidades de compra ou value traps? Análise + comparativo Ibov.',
    h1: 'Maiores Baixas do Mês: Ações que Mais Caíram na Bolsa B3 2026',
    lead:
      'As 50 ações e FIIs que mais caíram nos últimos 30 dias na B3, ordenadas por queda percentual. Lista pode revelar oportunidades de compra (ações baratas, value plays) OU armadilhas de valor (value traps). Inclui blue chips em correção (VALE3, BBDC4, ITUB4, ABEV3), FIIs em desconto (HGLG11, MXRF11, KNIP11) e ativos com problemas específicos. Atualizado diariamente após pregão.',
    chips: ['Atualizado diário', 'Variação 30 dias', 'Dados oficiais B3', 'Oportunidade ou armadilha'],
    columns: ['change', 'marketCap'],
    primaryMetric: 'change',
    changeLabel: '30d',
    types: TODOS,
    classe: ['acoes', 'fiis', 'bdrs'],
    tema: 'Momentum e mercado',
  },

  'maiores-altas-12-meses': {
    slug: 'maiores-altas-12-meses',
    title: 'Maiores Altas (12 meses)',
    endpoint: 'yearly-change',
    extraParams: { side: 'top' },
    metaTitle: 'Maiores Altas em 12 Meses da Bolsa B3 2026',
    metaDescription:
      'Top 50 ações que mais subiram nos últimos 12 meses na B3. Performance anualizada, ações em momentum e oportunidades de continuação de alta.',
    h1: 'Maiores Altas em 12 Meses',
    lead:
      'As 50 ações e FIIs que mais subiram nos últimos 12 meses na B3. Indica quem está em momentum forte e pode entregar continuação ou virar. Atualizado diariamente após pregão.',
    chips: ['Atualizado diariamente', 'Dados B3', 'Top 50', 'Momentum'],
    columns: ['change', 'marketCap', 'dy', 'pe'],
    primaryMetric: 'change',
    changeLabel: '12m',
    types: TODOS,
    classe: ['acoes', 'fiis', 'bdrs'],
    tema: 'Momentum e mercado',
  },

  'maiores-baixas-12-meses': {
    slug: 'maiores-baixas-12-meses',
    title: 'Maiores Baixas (12 meses)',
    endpoint: 'yearly-change',
    extraParams: { side: 'bottom' },
    metaTitle: 'Maiores Baixas em 12 Meses da Bolsa B3 2026',
    metaDescription:
      'Top 50 ações que mais caíram nos últimos 12 meses na B3. Possíveis oportunidades de turnaround, mas exige análise fundamentalista cuidadosa antes.',
    h1: 'Maiores Baixas em 12 Meses',
    lead:
      'As 50 ações e FIIs que mais caíram nos últimos 12 meses na B3. Pode revelar oportunidades de turnaround ou armadilhas de valor. Atualizado diariamente após pregão.',
    chips: ['Atualizado diariamente', 'Dados B3', 'Top 50', 'Turnaround?'],
    columns: ['change', 'marketCap', 'dy', 'pe'],
    primaryMetric: 'change',
    changeLabel: '12m',
    types: TODOS,
    classe: ['acoes', 'fiis', 'bdrs'],
    tema: 'Momentum e mercado',
  },

  'mais-aparece-noticias': {
    slug: 'mais-aparece-noticias',
    title: 'Mais Aparece em Notícias',
    endpoint: 'news-mentions',
    extraParams: { days: '30' },
    metaTitle: 'Tickers Mais Citados em Notícias B3',
    metaDescription:
      'Ações e FIIs mais mencionados em notícias do mercado financeiro brasileiro nos últimos 30 dias. Termômetro de atenção do investidor.',
    h1: 'Tickers Mais Mencionados em Notícias (Últimos 30 Dias)',
    lead:
      'Termômetro de atenção do mercado: ações e FIIs com mais menções em portais de notícias financeiras nos últimos 30 dias.',
    chips: ['Notícias 30 dias', 'Múltiplos portais', 'Atualizado diariamente', 'Buzz do mercado'],
    columns: ['mentionCount', 'change', 'marketCap', 'dy'],
    primaryMetric: 'mentionCount',
    types: TODOS,
    classe: ['acoes', 'fiis', 'bdrs'],
    tema: 'Momentum e mercado',
  },

  // ============================================================
  // Renda fixa (novo — deriva de GET /tesouro, sem tabs)
  // ============================================================
  'tesouro-direto': {
    slug: 'tesouro-direto',
    title: 'Tesouro Direto',
    endpoint: 'tesouro',
    metaTitle: 'Ranking do Tesouro Direto 2026: Melhores Taxas de Hoje',
    metaDescription:
      'Títulos do Tesouro Direto ordenados pelas melhores taxas de hoje: Tesouro IPCA+, Prefixado e Selic. Taxa, vencimento e preço atualizados diariamente.',
    h1: 'Ranking do Tesouro Direto: Melhores Taxas de Hoje',
    // Proveniência honesta: taxas/preços vivos vêm de scrape do StatusInvest
    // (fundamentals-scraper → tesouro_direto_si), não de feed oficial direto —
    // por isso 'dados do Tesouro Direto', sem claim de 'oficiais'.
    lead:
      'Os títulos públicos do Tesouro Direto ordenados pela taxa de compra do dia: Tesouro IPCA+, Tesouro Prefixado e Tesouro Selic, com vencimento e preço unitário. Atualizado diariamente com os dados do Tesouro Direto.',
    chips: ['Atualizado diariamente', 'Tesouro Direto', 'IPCA+ · Prefixado · Selic', 'Taxa de compra'],
    columns: [],
    primaryMetric: 'change',
    types: [],
    classe: ['renda-fixa'],
    tema: 'Renda fixa',
  },
}

/** Ordem dos temas no hub (grid agrupado). */
export const RANKING_TEMAS = [
  'Qualidade e consistência',
  'Renda e dividendos',
  'Valuation e preço justo',
  'Tamanho e resultado',
  'Crescimento',
  'Momentum e mercado',
  'Renda fixa',
] as const

export const RANKING_SLUGS = Object.keys(RANKINGS)
