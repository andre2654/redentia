import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst:
    'O preço teto de Graham é a fórmula clássica de Benjamin Graham: √(22,5 × LPA × VPA), onde LPA é o lucro por ação e VPA é o valor patrimonial por ação dos últimos 12 meses. Este ranking lista as 50 ações com maior margem entre a cotação e esse preço teto na B3, atualizado diariamente.',
  educationalSections: [
    {
      h2: 'O que é a Fórmula de Graham?',
      paragraphs: [
        'A Fórmula de Graham, criada por Benjamin Graham (mentor de Warren Buffett) em "O Investidor Inteligente", calcula o preço teto de uma ação como a raiz quadrada de 22,5 multiplicado pelo LPA (lucro por ação) e pelo VPA (valor patrimonial por ação). O número 22,5 vem do produto entre P/L máximo de 15 e P/VPA máximo de 1,5 que Graham considerava aceitáveis.',
        'O resultado é um preço teórico que serve de referência. A diferença entre a cotação e esse preço teto é o que o ranking ordena. A fórmula descreve a conta. Ela não diz se a pessoa deve comprar ou vender.',
      ],
    },
    {
      h2: 'Como interpretar o ranking',
      paragraphs: [
        'As ações no topo do ranking são as que têm maior margem entre a cotação e o preço teto de Graham. A margem descreve a distância até a fórmula, não um veredito sobre o papel.',
        'O ranking é um ponto de partida para ler a fórmula. A etapa seguinte é entender o que está nos números: a empresa pode estar fora do radar ou ter um problema que a fórmula não captura. A calculadora de preço teto refaz a mesma conta com os dados da página.',
      ],
    },
    {
      h2: 'Limitações da Fórmula de Graham',
      paragraphs: [
        'A fórmula original de Graham foi pensada pra ações industriais americanas dos anos 1970, com setores estáveis e crescimento moderado. Empresas de tecnologia, growth e setores com lucro irregular (commodities, mineração, cíclicas) podem dar resultados estranhos. Use esse ranking como triagem inicial, não como decisão final.',
        'Outra limitação: a cotação pode ficar abaixo do preço teto por meses ou anos. Isso é o chamado value trap. Cruze com a qualidade dos fundamentos (ROE, margem, endividamento) e com o setor. Empresa em setor em declínio pode ficar abaixo da fórmula por um motivo que está no balanço.',
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
      title: 'Simulador de Ações',
      desc: 'Projete retorno total de uma carteira ao longo do tempo.',
      href: '/calculadora/acoes',
    },
    {
      title: 'Calculadora de Dividend Yield',
      desc: 'Simule o DY real de qualquer ação ou FII.',
      href: '/calculadora/dividend-yield',
    },
    {
      title: 'Outros rankings',
      desc: 'Veja todos os rankings disponíveis na Aportou.',
      href: '/rankings',
    },
  ],
  faqItems: [
    {
      q: 'Como funciona a Fórmula de Graham na prática?',
      a: 'Pegue o LPA (lucro por ação dos últimos 12 meses) e o VPA (valor patrimonial por ação) da empresa. Multiplique os dois, multiplique por 22,5 e tire a raiz quadrada. O resultado é o preço teto de Graham. Exemplo: empresa com LPA de R$ 4 e VPA de R$ 25 tem preço Graham igual a raiz de (22,5 × 4 × 25) = raiz de 2.250 = R$ 47,43.',
    },
    {
      q: 'Quem foi Benjamin Graham?',
      a: 'Benjamin Graham (1894-1976) é considerado o pai do value investing. Foi professor de Warren Buffett na Columbia Business School e autor dos clássicos "Security Analysis" (1934) e "O Investidor Inteligente" (1949). A fórmula dele compara lucro e patrimônio com a cotação e descreve a distância até esse teto.',
    },
    {
      q: 'Posso usar a fórmula pra FIIs ou ETFs?',
      a: 'Não diretamente. A fórmula assume LPA e VPA tradicionais de empresas operacionais, métricas que FIIs e ETFs não calculam da mesma forma. Pra FIIs, use o P/VP (preço sobre valor patrimonial) e dividend yield. Pra ETFs, foque em taxa de administração e composição da carteira.',
    },
    {
      q: 'Qual a diferença entre Graham e Bazin?',
      a: 'Graham parte de lucro e patrimônio (LPA e VPA) e chega ao preço teto de Graham. Bazin parte do dividendo: divide o dividendo anual por uma taxa de 6%. São fórmulas diferentes. Nenhuma das duas é recomendação de investimento.',
    },
  ],
}

export default copy
