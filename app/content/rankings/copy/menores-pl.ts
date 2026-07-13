import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst: '',
  educationalSections: [
    {
      h2: 'O que é P/L (Preço sobre Lucro)?',
      paragraphs: [
        'P/L é a razão entre o preço atual da ação e o lucro por ação (LPA) dos últimos 12 meses. Indica quantos anos de lucro atual o investidor está pagando pra comprar a ação. P/L de 8 significa que se a empresa mantiver o lucro atual, em 8 anos o lucro acumulado iguala o investimento.',
        'É um dos indicadores mais usados em valuation por sua simplicidade. P/L baixo pode indicar oportunidade (ação descontada) ou armadilha (lucro temporariamente alto que vai cair). P/L alto pode ser empresa cara ou empresa com crescimento esperado (a famosa "P/L pago pelo crescimento").',
      ],
    },
    {
      h2: 'Como interpretar o ranking',
      paragraphs: [
        'P/L típico do Ibovespa fica entre 8-15. Abaixo de 8 indica desconto significativo, mas geralmente tem motivo (problemas setoriais, ciclo de baixa, governança). Acima de 20 indica empresa com expectativa de crescimento ou setor "premium" (tecnologia, varejo de luxo). Cada setor tem sua média histórica, sempre vale conferir.',
        'Petrobras com P/L de 4 em ciclo de petróleo alto é caso clássico: lucro recorde no momento, mas mercado precifica que o ciclo vai virar. Quando o petróleo cai, o lucro despenca e o P/L sobe abruptamente. Por isso P/L de empresa cíclica precisa ser olhado com horizonte longo, não snapshot.',
      ],
    },
    {
      h2: 'Atenção ao value trap',
      paragraphs: [
        'Value trap é uma ação com P/L baixo porque o lucro vai cair (não porque a ação está descontada). Sinais de alerta: setor em declínio estrutural, perda de market share, dívida crescente, queda de margem trimestre a trimestre, fuga de talentos, mudança regulatória.',
        'Antes de comprar pelo P/L baixo, faça as perguntas: por que está barato, esse lucro é sustentável, qual o histórico de pagamento de dividendos, qual a qualidade do management. P/L baixo isolado é gatilho pra investigação, não pra compra automática. Use a calculadora de preço teto pra cruzar com Graham e Bazin.',
      ],
    },
  ],
  crossLinks: [
    { title: 'Calculadora de Preço Teto', desc: 'Calcule o preço justo de uma ação por Graham e Bazin.', href: '/calculadora/preco-teto' },
    { title: 'Calculadora de Dividend Yield', desc: 'Simule o DY real de qualquer ação ou FII.', href: '/calculadora/dividend-yield' },
    { title: 'Simulador de Ações', desc: 'Projete retorno total de uma carteira ao longo do tempo.', href: '/calculadora/acoes' },
    { title: 'Outros rankings', desc: 'Veja todos os rankings disponíveis na Redentia.', href: '/rankings' },
  ],
  faqItems: [
    {
      q: 'Qual P/L é considerado bom?',
      a: 'Depende do setor. P/L abaixo da média do setor pode ser sinal de oportunidade. No agregado da bolsa brasileira, P/L histórico médio fica em torno de 10-13. P/L abaixo de 8 merece investigação extra (oportunidade real ou armadilha). P/L acima de 20 sinaliza expectativa de crescimento que pode ou não se concretizar.',
    },
    {
      q: 'Por que bancos têm P/L tão baixo?',
      a: 'Bancos costumam ter P/L entre 5-10 no Brasil por uma combinação de fatores: lucro alto sobre capital, dividendo alto (mercado prefere recomprar com dividendos vs preço), alavancagem natural do negócio aumenta percepção de risco, e ciclo macro brasileiro sempre traz incerteza sobre inadimplência futura.',
    },
    {
      q: 'P/L negativo o que significa?',
      a: 'Quando a empresa teve prejuízo nos últimos 12 meses, o P/L matemático fica negativo. Nesses casos, o indicador perde utilidade. Pra empresas em prejuízo, use outros indicadores: P/Receita (price to sales), P/EBITDA, ou simplesmente projete cenários de retorno à lucratividade.',
    },
    {
      q: 'P/L 12 meses ou P/L projetado?',
      a: 'P/L 12 meses (TTM) é o histórico real, mais confiável. P/L projetado (forward) usa estimativa de analistas pro próximo ano, mais útil pra empresas em crescimento mas sujeito a erros de projeção. Use TTM como base e forward como complemento, nunca substituindo o histórico.',
    },
  ],
}

export default copy
