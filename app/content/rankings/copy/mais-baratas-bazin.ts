import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst:
    'O preço teto de Bazin é a fórmula de Décio Bazin baseada em dividendos: dividendos dos últimos 12 meses ÷ 0,06, com yield de 6% na régua clássica. Este ranking lista as 50 ações com maior margem entre a cotação e esse preço teto na B3.',
  educationalSections: [
    {
      h2: 'O que é a Fórmula de Bazin?',
      paragraphs: [
        'A Fórmula de Bazin, criada por Décio Bazin no clássico "Faça Fortuna com Ações, Antes que Seja Tarde", calcula o preço teto de uma ação como o dividendo médio dos últimos 5 anos dividido por 6 por cento (a taxa mínima de retorno em dividendos que ele considerava razoável).',
        'A lógica é direta: se a régua pede pelo menos 6 por cento ao ano em dividendos sobre o capital, basta dividir o dividendo pago por 0,06 pra saber o preço teto dessa conta. Empresa que paga R$ 3 ao ano em dividendos chega a R$ 50 (3 dividido por 0,06).',
      ],
    },
    {
      h2: 'Como interpretar o ranking',
      paragraphs: [
        'As ações no topo do ranking são as que têm maior margem entre a cotação e o preço teto de Bazin. A margem descreve a distância até a fórmula. Ela assume que os dividendos se mantêm no patamar usado na conta.',
        'Bazin usa o dividendo como insumo. Bancos (ITUB4, BBAS3, BBDC4), seguradoras (BBSE3) e utilities (TAEE11, TRPL4) costumam aparecer com frequência por terem fluxo de caixa estável e payout alto. A presença na lista descreve a fórmula, não uma indicação de compra.',
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
      desc: 'Calcule o preço teto de uma ação pelas fórmulas de Graham e Bazin.',
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
      desc: 'Veja todos os rankings disponíveis na Aportou.',
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
      a: 'A distância grande entre a cotação e o preço teto pede a leitura do porquê. Possíveis razões: o dividendo alto pode ser cortado, há risco regulatório, ou a governança pesa. A fórmula não identifica sozinha o motivo. A calculadora de preço teto refaz a conta.',
    },
  ],
}

export default copy
