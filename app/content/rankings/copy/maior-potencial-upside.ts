import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst: '',
  educationalSections: [
    {
      h2: 'O que é o Upside Teórico?',
      paragraphs: [
        'Upside é a diferença percentual entre o preço atual de uma ação e o preço teto calculado por uma metodologia (Graham, Bazin, DCF, múltiplos). Um upside de 50 por cento significa que a cotação precisaria subir 50 por cento pra atingir o número da fórmula.',
        'É a tradução numérica da distância até o preço teto. Quanto maior o upside, maior essa diferença. É uma forma de comparar a mesma conta em setores e tamanhos diferentes.',
      ],
    },
    {
      h2: 'Como interpretar o ranking',
      paragraphs: [
        'Upside acima de 30 por cento começa a ser interessante. Acima de 50 por cento sinaliza desconto significativo (vale investigação). Acima de 100 por cento é raro fora de momentos de crise extrema ou empresas com problemas reais (cuidado).',
        'Os números mostrados aqui são teóricos, baseados em fórmulas tradicionais. A diferença pode descrever uma distância até a fórmula ou algo que as fórmulas não capturam (perda de competitividade, mudança regulatória, problema setorial). A leitura dos números fica com quem consulta a lista.',
      ],
    },
    {
      h2: 'Limitações',
      paragraphs: [
        'Upside calculado por Graham assume LPA e VPA estáveis no longo prazo. Empresas em prejuízo, em transição ou em setores cíclicos podem ter upside enganoso (lucro caiu temporariamente, vai voltar). Sempre cruze com tendência de lucro dos últimos 5 anos.',
        'A cotação pode levar muitos anos para se aproximar do preço teto, ou nunca se aproximar se o mercado estiver precificando deterioração. Use o upside como triagem, não como garantia. A leitura cruza upside com a qualidade dos fundamentos (ROE, margem, payout).',
      ],
    },
  ],
  crossLinks: [
    { title: 'Calculadora de Preço Teto', desc: 'Calcule o preço teto de uma ação pelas fórmulas de Graham e Bazin.', href: '/calculadora/preco-teto' },
    { title: 'Calculadora de Dividend Yield', desc: 'Simule o DY real de qualquer ação ou FII.', href: '/calculadora/dividend-yield' },
    { title: 'Simulador de Ações', desc: 'Projete retorno total de uma carteira ao longo do tempo.', href: '/calculadora/acoes' },
    { title: 'Outros rankings', desc: 'Veja todos os rankings disponíveis na Aportou.', href: '/rankings' },
  ],
  faqItems: [
    {
      q: 'Como o upside é calculado?',
      a: 'Combinamos as fórmulas de Graham (raiz de 22,5 × LPA × VPA) e Bazin (dividendo anual ÷ 6 por cento) pra estimar o preço teto. Upside é a diferença percentual entre esse preço teto médio e a cotação. Quanto maior, maior a distância até a fórmula.',
    },
    {
      q: 'Upside alto sempre descreve distância até a fórmula?',
      a: 'A diferença é o que a fórmula mede. Ela pode coincidir com um problema que as fórmulas não capturam (armadilha): setor, governança, perda de market share, virada de ciclo. Use o ranking como filtro inicial, não como decisão automática.',
    },
    {
      q: 'Quanto tempo leva pro upside se concretizar?',
      a: 'Não há regra fixa. Em alguns casos, o mercado reprecifica em meses (após release positivo, mudança de gestão). Em outros, leva anos (mudança de ciclo macro, recuperação setorial). Pesquisas mostram que estratégias de value tem horizonte natural de 3-5 anos pra dar resultado significativo.',
    },
    {
      q: 'Como combinar este ranking com os outros?',
      a: 'Cruze o ranking de upside com o de Buy and Hold (qualidade) e Maiores ROEs. A lista mostra quem tem upside alto e quem também aparece nos rankings de qualidade. Upside alto com qualidade baixa descreve uma distância que a fórmula não explica sozinha.',
    },
  ],
}

export default copy
