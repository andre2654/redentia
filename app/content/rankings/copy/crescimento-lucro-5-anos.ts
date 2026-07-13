import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst: '',
  educationalSections: [
    {
      h2: 'O que esse ranking mostra?',
      paragraphs: [
        'Lista as 50 empresas da B3 com maior CAGR (taxa anual composta de crescimento) do lucro líquido nos últimos 5 anos. O cálculo usa o lucro líquido de cada balanço anual oficial, suavizando picos pontuais e mostrando ritmo estrutural de criação de valor pros acionistas.',
        'É um dos rankings mais relevantes pra investidor de longo prazo. Empresa que cresce lucro 15 por cento ao ano por uma década tende a multiplicar valor de mercado, mesmo sem expansão de múltiplo. CAGR de lucro acima de receita indica ganho de eficiência operacional (margem subindo), sinal poderoso de qualidade.',
      ],
    },
    {
      h2: 'Como interpretar',
      paragraphs: [
        'CAGR de lucro entre 10-15 por cento: bom, próximo da média de empresas saudáveis. CAGR entre 15-25 por cento: muito bom, sinal de empresa em ciclo virtuoso (receita crescendo + margem expandindo + alavancagem operacional). CAGR acima de 25 por cento: excepcional, geralmente envolve recuperação de base baixa ou setor em forte expansão.',
        'Cruze sempre com o CAGR de receita. Lucro crescendo mais que receita significa margem subindo (excelente). Lucro crescendo menos que receita significa margem comprimindo (cuidado). Empresa que dobra lucro com receita estagnada está apenas otimizando custos, ganho não sustentável no infinito.',
      ],
    },
    {
      h2: 'Limitações',
      paragraphs: [
        'CAGR de lucro pode ser distorcido por base baixa ou negativa. Empresa que saiu do prejuízo pra lucro grande tem CAGR matemático imenso ou indefinido. Sempre olhe os números absolutos junto com o CAGR pra contextualizar. Recuperação não é o mesmo que crescimento estrutural.',
        'Itens não recorrentes (venda de ativos, créditos fiscais) inflam o lucro de um ano específico e podem distorcer o CAGR. Olhe o lucro recorrente quando disponível, ou faça a média de 3 anos pra suavizar eventos pontuais. Combine este ranking com o de Maiores Receitas pra validar consistência.',
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
      title: 'Simulador de Ações',
      desc: 'Projete retorno total de uma carteira ao longo do tempo.',
      href: '/calculadora/acoes',
    },
    {
      title: 'Maiores Lucros',
      desc: 'Ranking pelo lucro líquido absoluto dos últimos 12 meses.',
      href: '/ranking/maiores-lucros',
    },
    {
      title: 'Outros rankings',
      desc: 'Veja todos os rankings disponíveis na Redentia.',
      href: '/rankings',
    },
  ],
  faqItems: [
    {
      q: 'Por que CAGR de lucro é mais difícil de manter alto que CAGR de receita?',
      a: 'Lucro depende de margem, e margem tem teto natural (concorrência, custo de matéria prima, salários, impostos). Empresa pode crescer receita em 20 por cento por décadas, mas crescer lucro em 20 por cento por décadas exige expansão contínua de margem, raríssimo. Por isso CAGR de lucro alto sustentado por anos é forte sinal de qualidade.',
    },
    {
      q: 'CAGR de lucro pode ser maior que CAGR de receita?',
      a: 'Sim, e é o cenário mais desejável. Significa que a empresa está ganhando alavancagem operacional, ou seja, custos crescem menos que receita e a margem se expande. Tipicamente acontece em empresas escaláveis (software, marketplaces) ou em fase de maturação onde custos fixos diluem.',
    },
    {
      q: 'O que faz uma empresa crescer lucro consistentemente?',
      a: 'Combinação de fatores: vantagem competitiva (marca, custo, switching cost), expansão de market share, eficiência operacional (margem subindo), alocação inteligente de capital (recompras, dividendos, aquisições com sinergia), gestão experiente. Empresas com CAGR alto sustentado tem pelo menos 3-4 desses pilares.',
    },
    {
      q: 'Como diferenciar CAGR de qualidade vs CAGR de base baixa?',
      a: 'CAGR de qualidade vem de receita crescente E margem estável ou expandindo. CAGR de base baixa vem de recuperação após um ano ruim (prejuízo, queda de margem). Olhe sempre o lucro absoluto ano a ano. Empresa que saiu de R$ 100 milhões pra R$ 1 bilhão tem CAGR aparentemente lindo, mas pode ser apenas normalização.',
    },
    {
      q: 'Vale a pena comprar empresa com CAGR de lucro acima de 30 por cento?',
      a: 'Geralmente sim, MAS com cuidado. Esse ritmo é raríssimo de manter por mais de 3-5 anos. Antes de comprar, investigue: o crescimento é real (não contábil), o setor é estruturalmente crescente, o múltiplo já não está precificando isso. Empresa caríssima com CAGR alto pode ainda subir, mas a margem de segurança é baixa.',
    },
  ],
}

export default copy
