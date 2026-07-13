import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst: '',
  educationalSections: [
    {
      h2: 'O que é Receita Líquida?',
      paragraphs: [
        'Receita líquida (ou receita operacional líquida) é o total que a empresa faturou no período, descontados impostos sobre vendas (ICMS, PIS, Cofins) e devoluções. É a primeira linha do DRE (Demonstração de Resultados) e o ponto de partida pra calcular qualquer margem ou indicador operacional.',
        'No ranking usamos receita TTM (trailing twelve months), ou seja, dos últimos 12 meses fechados. Isso evita distorção de sazonalidade (varejo concentrado no quarto trimestre, agronegócio na safra) e dá uma visão atualizada do tamanho operacional da empresa.',
      ],
    },
    {
      h2: 'Como interpretar o ranking',
      paragraphs: [
        'O ranking mostra escala operacional, não rentabilidade. Petrobras lidera por refinar e vender milhões de barris de petróleo diariamente, JBS e Marfrig por dominarem o mercado global de proteína animal. Receita alta é vantagem competitiva (escala, poder de barganha com fornecedores, custos diluídos), mas não garante lucro proporcional.',
        'Cruze esse ranking com margem líquida (outra página de ranking) pra ver quem realmente converte receita em valor. JBS pode faturar mais que Itaú, mas o Itaú dá muito mais lucro por real faturado. As duas leituras são complementares.',
      ],
    },
    {
      h2: 'Limitações',
      paragraphs: [
        'Receita pode crescer sem criar valor. Empresa que cresce vendas via descontos agressivos ou aquisições sem sinergia destrói margem e ROE. Sempre olhe a evolução da receita JUNTO com margem e geração de caixa, não isolada.',
        'Setores muito alavancados (commodities, energia) tem receita altamente correlacionada com preço de mercado da commodity. Petrobras com Brent a 100 dólares por barril fatura muito; com Brent a 50, a receita despenca. Não confunda crescimento estrutural com sorte de ciclo.',
      ],
    },
  ],
  crossLinks: [
    { title: 'Simulador de Ações', desc: 'Projete retorno total de uma carteira ao longo do tempo.', href: '/calculadora/acoes' },
    { title: 'Calculadora de Preço Teto', desc: 'Calcule o preço justo de uma ação por Graham e Bazin.', href: '/calculadora/preco-teto' },
    { title: 'Calculadora de Dividend Yield', desc: 'Simule o DY real de qualquer ação ou FII.', href: '/calculadora/dividend-yield' },
    { title: 'Outros rankings', desc: 'Veja todos os rankings disponíveis na Redentia.', href: '/rankings' },
  ],
  faqItems: [
    {
      q: 'Qual a empresa com maior receita do Brasil?',
      a: 'Tipicamente a Petrobras, que fatura entre R$ 500 bilhões e R$ 800 bilhões por ano dependendo do preço do petróleo. Vale, JBS, Marfrig e Ambev também aparecem entre as primeiras, com receitas anuais entre R$ 100 bilhões e R$ 300 bilhões.',
    },
    {
      q: 'Receita bruta ou receita líquida, qual usar?',
      a: 'Sempre receita líquida pra análise de empresas. Receita bruta inclui impostos sobre vendas, que não pertencem à empresa (são repassados ao governo). Receita líquida é o que efetivamente entra no caixa operacional. Todos os indicadores de margem são calculados sobre receita líquida.',
    },
    {
      q: 'Como avaliar crescimento de receita?',
      a: 'Compare CAGR (taxa composta) de 5 anos versus inflação e crescimento do setor. Crescer 8 por cento em ano com IPCA de 5 por cento é crescimento real de 3 por cento (modesto). Mas crescer 15 por cento em setor que cresce 4 por cento é forte ganho de market share. Contexto setorial é tudo.',
    },
    {
      q: 'Por que algumas empresas pagam dividendo alto sem ter receita gigante?',
      a: 'Porque receita não é lucro. Bolsas (B3SA3), seguradoras (BBSE3), holdings com participações relevantes podem ter receita modesta mas margem altíssima e payout próximo de 100 por cento. O que importa pra dividendo é lucro distribuível, não tamanho do faturamento.',
    },
  ],
}

export default copy
