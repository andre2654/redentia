/**
 * Guia: Como montar uma carteira de investimentos (guia fundacional).
 * Estrutura e qualidade espelham o exemplar tesouro-direto-para-iniciantes.ts:
 * hero (dek) + seções h2 com blocos ricos (p/stats/steps/checks) + CTA + FAQ + related.
 *
 * Conteúdo HONESTO e principiológico: nenhuma cotação, dividend yield, ticker,
 * taxa ou rentabilidade apresentada como fato de mercado. Os percentuais de
 * alocação citados são SEMPRE enquadrados como faixas ilustrativas de um
 * raciocínio, nunca como recomendação ou promessa. Números nos stat cards são
 * estruturais (quantidade de classes, de perguntas, de passos), não financeiros.
 *
 * HTML dos blocos é local e confiável: só <strong> e <a href> internos.
 */
import type { GuideDoc } from '~/types/guias'

export const COMO_MONTAR_CARTEIRA_DE_INVESTIMENTOS_GUIDE: GuideDoc = {
  slug: 'como-montar-carteira-de-investimentos',
  tag: 'Guia Redentia',
  title: 'Como montar uma carteira de investimentos',
  dek: 'A lógica por trás de uma carteira que dorme tranquila: alocação por objetivo, diversificação de verdade e rebalanceamento, sem chute e sem fórmula mágica.',
  description:
    'Como montar uma carteira de investimentos do zero: entenda alocação por objetivo, as classes de ativos, o que é diversificação de verdade, como definir percentuais pelo seu perfil e por que rebalancear. Guia claro e honesto da Redentia.',
  summary:
    'Uma carteira não é uma coleção de palpites, é um plano. Veja como alocar por objetivo, diversificar sem exagero, escolher percentuais pelo seu perfil e manter tudo no rumo com rebalanceamento.',
  minutes: 10,
  author: 'Equipe Redentia',
  datePublished: '2026-07-15',
  dateModified: '2026-07-15',
  updatedLine: 'Atualizado em 15 jul 2026 · 10 min de leitura',
  updatedShort: 'atualizado em jul 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'O que é uma carteira (e por que não é só juntar ativos)',
      blocks: [
        {
          kind: 'p',
          html: 'Carteira de investimentos é o conjunto de tudo o que você tem aplicado, pensado como um time, não como jogadores soltos. A diferença entre investir e ter uma carteira é a mesma que separa comprar ingredientes de cozinhar uma receita: o valor está na combinação, não em cada item isolado.',
        },
        {
          kind: 'p',
          html: 'O erro clássico do iniciante é comprar por impulso, uma ação porque um amigo indicou, um fundo porque apareceu no feed, um título porque o app sugeriu, e acabar com uma pilha de aplicações sem nenhuma lógica entre elas. Uma carteira de verdade nasce de uma pergunta anterior à compra: <strong>para que serve esse dinheiro e quando vou precisar dele</strong>. Responder isso primeiro é o que transforma palpites soltos em um plano.',
        },
        {
          kind: 'stats',
          items: [
            { value: '3', label: 'objetivos por prazo que organizam qualquer carteira' },
            { value: '4', label: 'grandes classes de ativos para combinar' },
            { value: '1', label: 'plano por trás de cada compra' },
          ],
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'Aloque por objetivo, não por moda',
      blocks: [
        {
          kind: 'p',
          html: 'Antes de escolher qualquer ativo, separe o seu dinheiro por objetivo e prazo. A maioria das decisões difíceis some quando cada real já sabe para que serve. Uma divisão que funciona para quase todo mundo:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Curto prazo e emergências.</strong> Dinheiro que você pode precisar a qualquer momento não corre risco. Ele mora em aplicações de liquidez diária e baixa oscilação, e a reserva de emergência vem antes de qualquer sonho de longo prazo.',
            '<strong>Médio prazo (objetivos de 1 a 5 anos).</strong> A viagem, a entrada do imóvel, a troca de carro. Aqui cabe previsibilidade: renda fixa que vence perto da data em que você vai usar o dinheiro.',
            '<strong>Longo prazo (aposentadoria e patrimônio).</strong> Dinheiro que fica anos parado pode aceitar mais oscilação em troca de crescimento: ações, fundos imobiliários e proteção contra a inflação.',
          ],
        },
        {
          kind: 'p',
          html: 'Essa separação resolve o dilema que paralisa iniciantes, "renda fixa ou renda variável". A resposta honesta é: as duas, para objetivos diferentes. Cada prazo pede um tipo de risco, e é o objetivo que manda no ativo, nunca o contrário. Para transformar cada objetivo em um número de aporte, as <a href="/calculadoras">calculadoras da Redentia</a> ajudam a chegar no valor mensal.',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'As classes de ativos e o papel de cada uma',
      blocks: [
        {
          kind: 'p',
          html: 'Cada classe de ativo cumpre uma função na carteira. Você não escolhe por qual rende mais no papel, escolhe pelo trabalho que ela faz no conjunto:',
        },
        {
          kind: 'p',
          html: '<strong>Renda fixa (segurança e previsibilidade).</strong> Tesouro Direto, CDBs e títulos parecidos são a base estável da carteira. Seguram a reserva, os objetivos de médio prazo e reduzem o balanço geral. É o alicerce, e o guia de <a href="/guias/tesouro-direto-para-iniciantes">Tesouro Direto para iniciantes</a> mostra como escolher o título certo para cada prazo.',
        },
        {
          kind: 'p',
          html: '<strong>Ações (crescimento de longo prazo).</strong> Comprar ações é virar sócio de empresas. É a classe que historicamente carrega o crescimento do patrimônio no longo prazo, em troca de oscilar mais pelo caminho. Se você está começando por aqui, o guia de <a href="/guias/como-investir-em-acoes">como investir em ações</a> cobre da conta à primeira compra.',
        },
        {
          kind: 'p',
          html: '<strong>Fundos imobiliários (renda e diversificação).</strong> Os FIIs permitem investir em imóveis e receber distribuições mensais de aluguéis, com muito menos capital do que comprar um imóvel físico. Somam uma fonte de renda com comportamento diferente das ações.',
        },
        {
          kind: 'p',
          html: '<strong>Ativos de maior risco (uma fatia pequena).</strong> Cripto e apostas mais agressivas podem entrar, mas em dose controlada e só depois que a base está de pé. O guia de <a href="/guias/bitcoin-na-carteira">quanto alocar em Bitcoin</a> trata justamente do limite saudável por perfil. A regra geral: quanto maior o risco de um ativo, menor a fatia dele na carteira.',
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'Diversificação de verdade (não é ter muitos ativos)',
      blocks: [
        {
          kind: 'p',
          html: 'Diversificar não é comprar de tudo um pouco. É não colocar todos os ovos na mesma cesta, mas de um jeito inteligente: espalhar entre coisas que <strong>não sobem e caem juntas</strong>. Ter vinte ações do mesmo setor não é diversificar, é concentrar com passos extras.',
        },
        {
          kind: 'p',
          html: 'A boa diversificação acontece em camadas: entre classes (renda fixa, ações, FIIs), dentro de cada classe (setores e empresas diferentes) e, quando possível, entre regiões. O objetivo não é anular o risco, é evitar que um único evento derrube a carteira inteira. Quando uma parte sofre, outra segura o tombo.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Concentração é o risco que mais dói.</strong> Uma fatia grande demais em um único ativo transforma o problema dele no seu problema. Nenhuma posição deveria ser capaz de arruinar o plano sozinha.',
            '<strong>Diversificar demais também tem custo.</strong> Espalhar em dezenas de ativos que você não acompanha vira uma coleção que ninguém entende. Poucas posições bem escolhidas superam muitas no automático.',
            '<strong>Correlação importa mais que quantidade.</strong> Dois ativos que reagem igual à mesma notícia contam quase como um só. A pergunta certa não é "quantos ativos tenho", é "eles se comportam de formas diferentes".',
          ],
        },
        {
          kind: 'p',
          html: 'Para enxergar setores e comparar empresas sem depender de achismo, os <a href="/rankings">rankings da Redentia</a> organizam o mercado por critério, e o <a href="/ranking/redentia-score">Redentia Score</a> resume a avaliação de cada ação em uma nota de 0 a 100.',
        },
      ],
    },
    {
      id: 'sec-5',
      title: 'Quanto colocar em cada coisa',
      blocks: [
        {
          kind: 'p',
          html: 'Aqui vem a pergunta de um milhão de reais, e a resposta honesta é: <strong>não existe percentual mágico</strong>. A alocação certa depende do seu prazo, do seu objetivo e de quanto de oscilação você aguenta sem perder o sono. Percentual não é fórmula pronta, é consequência dessas respostas.',
        },
        {
          kind: 'p',
          html: 'Um jeito clássico de raciocinar (é um ponto de partida para pensar, não uma recomendação): quanto mais longo o horizonte e maior a sua tolerância a oscilação, maior a fatia em renda variável; quanto mais curto o prazo e menor a tolerância, mais peso em renda fixa. Um perfil conservador tende a manter a maior parte na base estável e uma fatia menor em ações e FIIs; um perfil arrojado inverte esse equilíbrio. O número exato é seu, e muda com a fase da vida.',
        },
        {
          kind: 'p',
          html: 'Antes de decidir os percentuais, responda com sinceridade:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Qual o prazo desse dinheiro?</strong> Quanto mais longe a data de usar, mais oscilação a carteira pode aceitar em troca de crescimento.',
            '<strong>Quanto de queda você suporta sem vender no susto?</strong> Se uma baixa de mercado te faria abandonar o plano, sua fatia de risco está alta demais para o seu estômago.',
            '<strong>Você já tem reserva de emergência montada?</strong> Sem o colchão de curto prazo, qualquer imprevisto obriga a resgatar um ativo de longo prazo na pior hora.',
            '<strong>Depende desse dinheiro para viver agora?</strong> Renda que você já usa pede mais previsibilidade e menos exposição a solavancos.',
          ],
        },
        {
          kind: 'p',
          html: 'A definição de perfil não é rótulo de teste rápido, é o resultado dessas respostas somadas ao seu momento. E vale revisar: quem tinha 20 anos até a aposentadoria pensa diferente de quem tem 3.',
        },
      ],
    },
    {
      id: 'sec-6',
      title: 'Rebalanceamento: manter a carteira no rumo',
      blocks: [
        {
          kind: 'p',
          html: 'Montar a carteira é o começo. Com o tempo, as partes crescem em ritmos diferentes e a alocação sai do lugar sozinha: se as ações sobem muito, elas passam a pesar mais do que você planejou, e a carteira fica mais arriscada do que você decidiu. Rebalancear é trazer os pesos de volta ao alvo.',
        },
        {
          kind: 'p',
          html: 'Na prática, rebalancear costuma significar aportar mais na classe que ficou para trás, em vez de vender a que subiu, o que evita impostos e mantém o plano no lugar. É um movimento tão simples quanto disciplinado: você reduz o que inchou e reforça o que encolheu, o oposto de correr atrás do que já subiu.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Revise em intervalos fixos, não a cada notícia.</strong> Uma ou duas vezes por ano costuma bastar. Olhar a carteira todo dia gera decisões emocionais, não melhores resultados.',
            '<strong>Use os aportes novos para corrigir os pesos.</strong> Direcionar o dinheiro que entra para a classe defasada reequilibra sem precisar vender nada.',
            '<strong>Rebalancear é vender caro e comprar barato no automático.</strong> A mecânica te obriga a realizar parte do que subiu e reforçar o que ficou para trás, disciplina que a emoção sozinha não entrega.',
          ],
        },
        {
          kind: 'p',
          html: 'Para acompanhar como sua carteira está distribuída e onde ela se desviou do plano, a Redentia usa o <a href="/metodologia">Redentia Score</a> e os rankings como raio-x, de forma que rebalancear deixa de ser chute e vira leitura.',
        },
      ],
    },
    {
      id: 'sec-7',
      title: 'Os erros que destroem uma carteira',
      blocks: [
        {
          kind: 'p',
          html: 'A maioria dos estragos em uma carteira não vem do ativo errado, vem de comportamento errado. Fuja destes:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Investir sem reserva de emergência.</strong> É o erro que mais custa caro. Sem colchão, o primeiro imprevisto obriga a vender o longo prazo no pior momento.',
            '<strong>Concentrar demais em uma única aposta.</strong> Uma posição grande demais transforma o azar de um ativo no naufrágio da carteira toda.',
            '<strong>Perseguir o que já subiu.</strong> Comprar no topo do hype e vender no fundo do pânico é o caminho mais rápido para perder dinheiro com consistência.',
            '<strong>Mexer na carteira a cada manchete.</strong> Girar posições ao sabor da notícia gera custo e ansiedade, raramente retorno. Plano bom é chato de propósito.',
            '<strong>Não ter um plano por escrito.</strong> Sem objetivo e alocação definidos, cada decisão vira improviso. A carteira sem plano é a que mais sofre nas quedas.',
          ],
        },
        {
          kind: 'p',
          html: 'A boa notícia: nenhum desses erros exige gênio para ser evitado, só método. Defina os objetivos, aloque por prazo, diversifique com cabeça, rebalanceie de vez em quando e deixe o tempo trabalhar. Uma carteira sólida é construída com decisões repetidas e simples, não com o palpite perfeito.',
        },
      ],
    },
  ],
  cta: {
    title: 'Descubra a nota das ações da sua carteira',
    subtitle: 'O Redentia Score avalia cada ação de 0 a 100 · grátis para começar',
    to: '/ranking/redentia-score',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'Como montar uma carteira de investimentos do zero?',
      a: 'Comece pelo objetivo, não pelo ativo. Separe o dinheiro por prazo (curto, médio e longo), monte primeiro a reserva de emergência, escolha as classes de ativos que servem a cada objetivo e defina quanto colocar em cada uma pelo seu perfil. Diversifique entre coisas que não sobem e caem juntas e revise a alocação de tempos em tempos.',
    },
    {
      q: 'Qual a melhor alocação de carteira para iniciantes?',
      a: 'Não existe uma única alocação ideal, ela depende do seu prazo, do seu objetivo e de quanto de oscilação você aguenta. Como ponto de partida para pensar, quanto mais longo o horizonte e maior a tolerância a risco, maior a fatia em renda variável; quanto mais curto o prazo, mais peso em renda fixa. E, para qualquer perfil, a reserva de emergência vem antes de tudo.',
    },
    {
      q: 'O que é diversificação de investimentos?',
      a: 'É distribuir o dinheiro entre ativos que não reagem da mesma forma aos mesmos eventos, para que uma parte segure o tombo quando outra sofre. Diversificar de verdade não é ter muitos ativos, é ter ativos com comportamentos diferentes, entre classes, setores e, quando possível, regiões. O que importa é a baixa correlação, não a quantidade.',
    },
    {
      q: 'Quantos ativos devo ter na carteira?',
      a: 'Não há número mágico. Poucas posições bem escolhidas e acompanhadas superam dezenas no automático que ninguém entende. O risco de concentração (fatia grande demais em um ativo) é real, mas espalhar em ativos demais também tem custo e vira uma coleção confusa. Prefira uma quantidade que você consiga entender e revisar.',
    },
    {
      q: 'Com que frequência devo rebalancear a carteira?',
      a: 'Uma ou duas vezes por ano costuma ser suficiente. Rebalancear com intervalos fixos, e não a cada notícia, evita decisões emocionais. Na maioria dos casos dá para reequilibrar apenas direcionando os aportes novos para a classe que ficou abaixo do alvo, sem precisar vender nada e sem gerar imposto.',
    },
    {
      q: 'Preciso de muito dinheiro para diversificar?',
      a: 'Não. É possível começar uma carteira diversificada com poucas dezenas de reais, comprando frações de títulos do Tesouro e cotas de fundos ou ações. Diversificação é uma questão de estratégia e disciplina de aportes, não de capital inicial alto. O importante é o método, não o tamanho do primeiro depósito.',
    },
  ],
  related: ['Como investir em ações', 'Tesouro Direto para iniciantes', 'Bitcoin na carteira: quanto alocar?'],
}
