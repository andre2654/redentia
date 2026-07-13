import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst: '',
  educationalSections: [
    {
      h2: 'O que esse ranking mostra?',
      paragraphs: [
        'Lista os 50 tickers (ações e FIIs) com maior número de menções em notícias do mercado financeiro brasileiro nos últimos 30 dias. Cada matéria que cita o ticker (release de balanço, fato relevante, análise de casa de research, comentário de mercado) entra na contagem. É o termômetro mais direto de atenção do investidor e da imprensa.',
        'Empresas no topo costumam estar passando por algo relevante: divulgação de resultado, fusão ou aquisição, mudança de gestão, mudança regulatória que afeta o setor, ou simplesmente forte oscilação de preço que chama atenção da mídia. Acompanhar esse ranking ajuda a captar narrativas de mercado em tempo real.',
      ],
    },
    {
      h2: 'Por que prestar atenção em menções?',
      paragraphs: [
        'Atenção da mídia muitas vezes precede ou acompanha movimento de preço. Empresa que de repente aparece em todas as manchetes financeiras tende a ter maior volatilidade nos dias seguintes (boa notícia ou má notícia). Pra investidor ativo, isso é oportunidade de identificar catalisadores antes do mercado precificar completamente.',
        'Buzz alto também sinaliza upcoming catalysts: vésperas de resultado trimestral, reuniões com analistas, conferências de investidores, mudanças regulatórias em discussão. Combinar buzz com fundamentos sólidos pode ajudar a posicionar antes de movimento esperado.',
      ],
    },
    {
      h2: 'Riscos do hype trading',
      paragraphs: [
        'Cuidado com o efeito manada. Ticker que aparece em todas as manchetes pode atrair fluxo especulativo de curto prazo (FOMO), causando overshoot do preço acima do valor fundamentado. Comprar pelo buzz isolado é estratégia perigosa, pode ser entrada no topo de movimento de curto prazo.',
        'Outro risco: notícia ruim também conta como menção. Empresa pode estar nos holofotes por escândalo de governança, problema regulatório ou fraude descoberta. Sempre leia o tipo de notícia antes de associar buzz a oportunidade. Use este ranking como ponto de partida pra investigação, nunca como decisão direta.',
      ],
    },
  ],
  crossLinks: [
    {
      title: 'Pergunte ao assistente',
      desc: 'Use a IA da Redentia pra resumir o que está acontecendo com qualquer ticker.',
      // re-mapeado: /help (chat da Redentia antiga) → /busca (IA do Nu)
      href: '/busca',
    },
    {
      title: 'Simulador de Ações',
      desc: 'Projete retorno total de uma carteira ao longo do tempo.',
      href: '/calculadora/acoes',
    },
    {
      title: 'Maiores Altas (30 dias)',
      desc: 'Cruze atenção com performance recente pra identificar movimentos.',
      href: '/ranking/maiores-altas-mes',
    },
    {
      title: 'Outros rankings',
      desc: 'Veja todos os rankings disponíveis na Redentia.',
      href: '/rankings',
    },
  ],
  faqItems: [
    {
      q: 'Como o número de menções é calculado?',
      a: 'A Redentia coleta diariamente notícias de portais financeiros brasileiros (InfoMoney, Money Times, Valor, Brazil Journal, Suno, etc.) e conta quantas matérias citam cada ticker nos últimos 30 dias. Quanto mais menções, maior a posição no ranking. Atualizado diariamente.',
    },
    {
      q: 'Por que algumas ações pequenas aparecem entre as mais mencionadas?',
      a: 'Notícia específica pode catapultar uma small cap pro topo: descoberta de fraude, fusão anunciada, novo contrato relevante, mudança de controle. Isso costuma ser pontual (poucos dias) e some quando o assunto perde calor. Acompanhar o ranking ao longo das semanas mostra quem é buzz duradouro vs ruído passageiro.',
    },
    {
      q: 'Buzz alto significa que devo comprar?',
      a: 'Não automaticamente. Buzz é informação sobre atenção, não sobre qualidade ou preço justo. Use o ranking pra descobrir o que está movimentando o mercado, depois investigue a tese fundamental antes de qualquer decisão. Comprar só pelo hype é estratégia de curto prazo com alta volatilidade.',
    },
    {
      q: 'Qual é a diferença entre menções positivas e negativas?',
      a: 'O ranking conta TODAS as menções, sem distinguir tom. Empresa em escândalo pode dominar manchetes (menções negativas) tanto quanto empresa em alta de fato relevante (menções positivas). Sempre leia as matérias do topo do ranking pra entender o contexto antes de tirar conclusão.',
    },
    {
      q: 'Como combinar buzz com fundamentos?',
      a: 'Estratégia comum: filtrar tickers do ranking de buzz que TAMBÉM aparecem em rankings de qualidade (Buy and Hold, ROE alto, lucro consistente). Buzz alto + fundamentos sólidos = catalisador potencial pra valorização. Buzz alto + fundamentos fracos = especulação ou problema real, evitar.',
    },
  ],
}

export default copy
