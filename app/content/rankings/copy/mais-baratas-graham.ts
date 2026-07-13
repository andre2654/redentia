import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst:
    'Preço Graham é a fórmula clássica de Benjamin Graham para valor intrínseco: √(22,5 × LPA × VPA), onde LPA é o lucro por ação e VPA é o valor patrimonial por ação dos últimos 12 meses. Ações cotadas abaixo do preço Graham têm margem de segurança implícita (estratégia value investing). Este ranking lista as 50 ações com maior desconto sobre o preço Graham na B3, atualizado diariamente.',
  educationalSections: [
    {
      h2: 'O que é a Fórmula de Graham?',
      paragraphs: [
        'A Fórmula de Graham, criada por Benjamin Graham (mentor de Warren Buffett) em "O Investidor Inteligente", calcula o preço justo de uma ação como a raiz quadrada de 22,5 multiplicado pelo LPA (lucro por ação) e pelo VPA (valor patrimonial por ação). O número 22,5 vem do produto entre P/L máximo de 15 e P/VPA máximo de 1,5 que Graham considerava aceitáveis.',
        'O resultado é um preço teórico que serve de referência. Se a ação negocia abaixo desse preço, está descontada (oportunidade de value). Se acima, está cara em relação aos fundamentos. O upside calculado mostra quanto a ação precisaria subir pra atingir o preço Graham.',
      ],
    },
    {
      h2: 'Como interpretar o ranking',
      paragraphs: [
        'As ações no topo do ranking são as que estão negociando com maior desconto em relação ao preço Graham, ou seja, aparentemente baratas. Quanto maior o upside teórico, maior a margem de segurança no investimento (conceito central de Graham).',
        'Como ponto de partida pra value investing, o ranking é útil. A próxima etapa é entender por que a ação está descontada: a empresa está fora do radar do mercado (oportunidade) ou tem problemas reais que justificam o desconto (armadilha)? Use a calculadora de preço teto pra rodar a sua própria análise com dados atualizados.',
      ],
    },
    {
      h2: 'Limitações da Fórmula de Graham',
      paragraphs: [
        'A fórmula original de Graham foi pensada pra ações industriais americanas dos anos 1970, com setores estáveis e crescimento moderado. Empresas de tecnologia, growth e setores com lucro irregular (commodities, mineração, cíclicas) podem dar resultados estranhos. Use esse ranking como triagem inicial, não como decisão final.',
        'Outra limitação importante: ações podem ficar baratas por meses ou anos, isso é o famoso value trap. Sempre cruze com qualidade dos fundamentos (ROE alto, margem estável, baixo endividamento) e contexto setorial. Empresa em setor em declínio pode estar barata por motivo justo.',
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
      title: 'Calculadora de Dividend Yield',
      desc: 'Simule o DY real de qualquer ação ou FII.',
      href: '/calculadora/dividend-yield',
    },
    {
      title: 'Outros rankings',
      desc: 'Veja todos os rankings disponíveis na Redentia.',
      href: '/rankings',
    },
  ],
  faqItems: [
    {
      q: 'Como funciona a Fórmula de Graham na prática?',
      a: 'Pegue o LPA (lucro por ação dos últimos 12 meses) e o VPA (valor patrimonial por ação) da empresa. Multiplique os dois, multiplique por 22,5 e tire a raiz quadrada. O resultado é o preço justo. Exemplo: empresa com LPA de R$ 4 e VPA de R$ 25 tem preço Graham igual a raiz de (22,5 × 4 × 25) = raiz de 2.250 = R$ 47,43.',
    },
    {
      q: 'Quem foi Benjamin Graham?',
      a: 'Benjamin Graham (1894-1976) é considerado o pai do value investing. Foi professor de Warren Buffett na Columbia Business School e autor dos clássicos "Security Analysis" (1934) e "O Investidor Inteligente" (1949). Sua fórmula busca identificar ações negociadas abaixo do valor intrínseco com margem de segurança.',
    },
    {
      q: 'Posso usar a fórmula pra FIIs ou ETFs?',
      a: 'Não diretamente. A fórmula assume LPA e VPA tradicionais de empresas operacionais, métricas que FIIs e ETFs não calculam da mesma forma. Pra FIIs, use o P/VP (preço sobre valor patrimonial) e dividend yield. Pra ETFs, foque em taxa de administração e composição da carteira.',
    },
    {
      q: 'Qual a diferença entre Graham e Bazin?',
      a: 'Graham busca preço justo a partir de lucro e patrimônio (LPA e VPA). Bazin foca em renda passiva: divide o dividendo anual por uma taxa de retorno desejada (geralmente 6%). São abordagens complementares, Graham para empresas em geral, Bazin específicamente para investidores de dividendos.',
    },
  ],
}

export default copy
