import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst:
    'Preço Bazin é a fórmula brasileira de Décio Bazin baseada em dividendos: preço justo = dividendos dos últimos 12 meses ÷ 0,06, assumindo dividend yield mínimo aceitável de 6%. Ações cotadas abaixo do Bazin oferecem DY esperado acima de 6% no preço atual. Este ranking lista as 50 ações com maior desconto pelo método Bazin na B3, ideal para quem busca renda passiva consistente.',
  educationalSections: [
    {
      h2: 'O que é a Fórmula de Bazin?',
      paragraphs: [
        'A Fórmula de Bazin, criada por Décio Bazin no clássico "Faça Fortuna com Ações, Antes que Seja Tarde", calcula o preço justo de uma ação como o dividendo médio dos últimos 5 anos dividido por 6 por cento (a taxa mínima de retorno em dividendos que ele considerava razoável).',
        'A lógica é direta: se você quer pelo menos 6 por cento ao ano em dividendos sobre o capital investido, basta dividir o dividendo pago pelo retorno desejado pra saber o preço máximo que você pode pagar. Empresa que paga R$ 3 ao ano em dividendos vale no máximo R$ 50 (3 dividido por 0,06).',
      ],
    },
    {
      h2: 'Como interpretar o ranking',
      paragraphs: [
        'As ações no topo do ranking pagam dividendos altos em relação ao preço de mercado, sinalizando potencial atratividade pra investidor focado em renda. Quanto maior o upside calculado, mais espaço pra valorização (assumindo que os dividendos vão se manter no patamar histórico).',
        'Bazin é especialmente útil pra montar carteira de geração de renda mensal ou trimestral. Bancos (ITUB4, BBAS3, BBDC4), seguradoras (BBSE3) e utilities (TAEE11, TRPL4) costumam aparecer com frequência por terem fluxo de caixa estável e payout alto.',
      ],
    },
    {
      h2: 'Limitações da Fórmula de Bazin',
      paragraphs: [
        'A fórmula assume que os dividendos pagos no passado vão se repetir no futuro. Empresas em setores cíclicos (commodities, varejo) podem ter dividendos altíssimos em um ano e zero no seguinte. Sempre cheque a consistência do pagamento nos últimos 5 anos antes de usar Bazin como referência.',
        'Outro ponto: dividendo alto pode ser sintoma de dificuldade de investir em crescimento. Se a empresa distribui 90 por cento do lucro porque não tem onde crescer, o investidor recebe renda hoje mas perde a chance de ver o capital se multiplicar. Cruze sempre com payout ratio e CAGR de receita.',
      ],
    },
  ],
  crossLinks: [
    {
      title: 'Calculadora de Preço Teto',
      desc: 'Calcule o preço justo de uma ação por Graham e Bazin.',
      href: '/calculadora/preco-teto',
    },
    {
      title: 'Calculadora de Dividend Yield',
      desc: 'Simule o DY real de qualquer ação ou FII.',
      href: '/calculadora/dividend-yield',
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
      q: 'Quem foi Décio Bazin?',
      a: 'Décio Bazin (1933-2003) foi jornalista financeiro brasileiro e autor de "Faça Fortuna com Ações, Antes que Seja Tarde", lançado em 1992. O livro consolidou no mercado brasileiro a estratégia de investir em ações que pagam dividendos consistentes e oferece a fórmula que carrega seu nome.',
    },
    {
      q: 'Por que 6 por cento na Fórmula de Bazin?',
      a: 'Bazin escolheu 6 por cento ao ano como a taxa mínima de retorno em dividendos que justifica o risco de comprar uma ação no lugar de uma renda fixa segura. O número é discutível e algumas adaptações usam 4 por cento (mais agressivo) ou 8 por cento (mais conservador). Mantemos 6 por cento como padrão histórico do livro.',
    },
    {
      q: 'A fórmula serve para FIIs?',
      a: 'Sim, com adaptação. FIIs distribuem rendimentos mensais (não dividendos anuais), então some os pagamentos dos últimos 12 meses pra ter o equivalente. A taxa mínima também muda: pra FIIs, é razoável usar 8-10 por cento dado o risco maior. Resultado: dividendo anual dos últimos 12 meses dividido por 0,08 ou 0,10.',
    },
    {
      q: 'O que fazer quando a fórmula dá um valor muito acima do preço atual?',
      a: 'Investigue por que o mercado está pagando tão pouco. Possíveis razões: dividendo alto vai ser cortado (queda de lucro), risco regulatório (energia, bancos estatais), problemas governança. Se nada disso aparecer, pode ser uma boa oportunidade de value. Use a calculadora de preço teto pra refinar.',
    },
  ],
}

export default copy
