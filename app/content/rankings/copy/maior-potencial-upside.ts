import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst: '',
  educationalSections: [
    {
      h2: 'O que é o Upside Teórico?',
      paragraphs: [
        'Upside é a diferença percentual entre o preço atual de uma ação e o preço justo calculado por uma metodologia (Graham, Bazin, DCF, múltiplos). Um upside de 50 por cento significa que a ação precisaria subir 50 por cento pra atingir o preço considerado justo pelos modelos.',
        'É a tradução numérica do conceito de "margem de segurança" cunhado por Benjamin Graham. Quanto maior o upside, maior o desconto e maior o potencial de retorno se a ação convergir pro preço justo. É uma forma estruturada de comparar oportunidades em diferentes setores e tamanhos.',
      ],
    },
    {
      h2: 'Como interpretar o ranking',
      paragraphs: [
        'Upside acima de 30 por cento começa a ser interessante. Acima de 50 por cento sinaliza desconto significativo (vale investigação). Acima de 100 por cento é raro fora de momentos de crise extrema ou empresas com problemas reais (cuidado).',
        'Os números mostrados aqui são teóricos, baseados em fórmulas tradicionais. O mercado pode estar "errado" e dar oportunidade real de comprar barato, ou pode estar precificando algo que as fórmulas não capturam (perda de competitividade, mudança regulatória, problema setorial). Sempre faça leitura crítica dos números.',
      ],
    },
    {
      h2: 'Limitações',
      paragraphs: [
        'Upside calculado por Graham assume LPA e VPA estáveis no longo prazo. Empresas em prejuízo, em transição ou em setores cíclicos podem ter upside enganoso (lucro caiu temporariamente, vai voltar). Sempre cruze com tendência de lucro dos últimos 5 anos.',
        'Convergência ao preço justo pode levar muitos anos, ou nunca acontecer se o mercado estiver corretamente precificando deterioração. Use o upside como triagem, não como garantia. A combinação ideal é upside alto + qualidade dos fundamentos (ROE alto, margem estável, payout sustentável).',
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
      q: 'Como o upside é calculado?',
      a: 'Combinamos as fórmulas de Graham (raiz de 22,5 × LPA × VPA) e Bazin (dividendo anual ÷ 6 por cento) pra estimar preço justo. Upside é a diferença percentual entre preço justo médio e preço atual. Quanto maior, mais "barata" a ação parece pelas metodologias clássicas de value.',
    },
    {
      q: 'Upside alto sempre é boa oportunidade?',
      a: 'Não. Upside alto pode indicar desconto real (oportunidade) ou problema fundamental que as fórmulas não capturam (armadilha). Antes de comprar, investigue o motivo do desconto: setor, governança, perda de market share, virada de ciclo. Use o ranking como filtro inicial, não como decisão automática.',
    },
    {
      q: 'Quanto tempo leva pro upside se concretizar?',
      a: 'Não há regra fixa. Em alguns casos, o mercado reprecifica em meses (após release positivo, mudança de gestão). Em outros, leva anos (mudança de ciclo macro, recuperação setorial). Pesquisas mostram que estratégias de value tem horizonte natural de 3-5 anos pra dar resultado significativo.',
    },
    {
      q: 'Como combinar este ranking com os outros?',
      a: 'Cruze o ranking de upside com o de Buy and Hold (qualidade) e Maiores ROEs. Empresas que aparecem com upside alto E qualidade alta são as melhores oportunidades estatisticamente. Empresas com upside alto MAS qualidade baixa devem ser tratadas como apostas, não como investimento de longo prazo.',
    },
  ],
}

export default copy
