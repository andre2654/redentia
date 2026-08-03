/**
 * Guia: ETFs, o que são e como investir (rodada semanal de 2026-08-03).
 *
 * Lacuna real do registry: nenhum dos 14 guias existentes trata de ETF. O
 * glossário tem o verbete /glossario/etf (definição curta); aqui é o long-form
 * que o verbete não cabe, e o guia linka pra ele em vez de repetir a definição.
 *
 * Escopo deliberado: fundo de índice como veículo. NÃO invade "Como investir
 * em ações" (abertura de conta e primeira ordem), "Como montar uma carteira"
 * (alocação) nem "Como analisar uma ação" (indicadores).
 *
 * Conteúdo HONESTO: nenhum ticker de ETF citado, nenhuma taxa de administração
 * numérica, nenhuma rentabilidade, nenhum patrimônio de fundo, nenhum ranking
 * de "melhores ETFs". Os únicos números do texto são estruturais (quantidade de
 * decisões, prazos de referência) ou alíquotas de IR apresentadas como regra
 * geral com a ressalva de confirmar a vigente, no mesmo padrão do guia de IR.
 *
 * HTML dos blocos é local e confiável: só <strong> e <a href> internos.
 * Rotas linkadas conferidas contra app/pages e os registries de glossário,
 * rankings e guias.
 */
import type { GuideDoc } from '~/types/guias'

export const COMO_INVESTIR_EM_ETF_GUIDE: GuideDoc = {
  slug: 'como-investir-em-etf',
  tag: 'Ações',
  title: 'ETFs: o que são e como investir',
  dek: 'O fundo de índice que se compra como ação, o que ele resolve de verdade e o que ele não resolve.',
  description:
    'O que é um ETF, como funciona um fundo de índice negociado na B3, quais tipos existem, como comparar taxa e liquidez, como o imposto de renda muda em relação às ações e o passo a passo da primeira compra. Guia claro e honesto da Redentia.',
  summary:
    'Uma cota, uma cesta inteira de ativos. Entenda como o ETF replica um índice, onde ele ganha da escolha manual de ações, onde ele perde e o que conferir antes de comprar o primeiro.',
  minutes: 10,
  author: 'Equipe Redentia',
  datePublished: '2026-08-03',
  dateModified: '2026-08-03',
  updatedLine: 'Atualizado em 3 ago 2026 · 10 min de leitura',
  updatedShort: 'atualizado em ago 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'O que é um ETF, sem jargão',
      blocks: [
        {
          kind: 'p',
          html: 'Um <a href="/glossario/etf">ETF</a> (sigla de Exchange Traded Fund, ou fundo negociado em bolsa) é um fundo que compra uma cesta de ativos seguindo a receita de um índice, e cujas cotas são negociadas na <a href="/glossario/b3">B3</a> exatamente como uma ação. Você abre o home broker, digita o código, compra a quantidade que quiser e pronto: <strong>em uma única ordem você passa a ter uma fatia proporcional de tudo que está dentro daquele índice</strong>.',
        },
        {
          kind: 'p',
          html: 'A ideia por trás é antiga e simples. Em vez de o gestor tentar adivinhar quais ações vão subir, o fundo apenas copia a composição de um índice de referência, o <a href="/glossario/benchmark">benchmark</a>. Se o índice tem dezenas de empresas em determinados pesos, o fundo compra essas mesmas empresas nesses mesmos pesos. É o que se chama de gestão passiva, e é ela que permite cobrar uma taxa menor que a de um fundo com equipe tentando escolher os vencedores.',
        },
        {
          kind: 'stats',
          items: [
            { value: '1', label: 'ordem no home broker compra a cesta inteira do índice' },
            { value: '3', label: 'coisas para conferir antes de comprar: índice, taxa e liquidez' },
            { value: '0', label: 'decisões de escolha de ação individual que o ETF exige de você' },
          ],
        },
        {
          kind: 'p',
          html: 'Vale desfazer a confusão mais comum logo no começo. ETF não é uma ação, embora seja comprado como uma. Você não vira sócio de uma empresa, e sim cotista de um fundo que é sócio de várias. E ETF também não é o mesmo que fundo de investimento tradicional: no fundo comum você aplica e resgata com o administrador, no ETF você compra e vende de outro investidor no pregão, ao preço daquele momento.',
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'Como o ETF funciona por dentro',
      blocks: [
        {
          kind: 'p',
          html: 'Entender o mecanismo evita duas ilusões: a de que o ETF é mágico e a de que ele é arriscado por ser complicado. Ele não é nenhum dos dois. Quatro peças explicam quase tudo:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>O índice de referência.</strong> É a regra que define o que entra na carteira, com que peso e quando isso muda. Um índice amplo de mercado, um índice de <a href="/glossario/small-caps">small caps</a> e um índice setorial produzem fundos com comportamentos completamente diferentes, mesmo que os três se chamem ETF. Ler a metodologia do índice é ler o produto.',
            '<strong>A taxa de administração.</strong> Cobrada sobre o patrimônio e descontada diariamente do valor da cota, sem boleto. Ela não aparece no extrato como despesa, aparece como rendimento um pouco menor. Por isso a comparação entre dois fundos que seguem o mesmo índice quase sempre se resolve pela taxa.',
            '<strong>A aderência ao índice.</strong> Nenhum fundo replica o benchmark com exatidão perfeita: taxas, custos de negociação e o momento de recompor a carteira criam uma diferença. Um fundo bem gerido mantém essa diferença pequena e estável, e é isso que se acompanha, não o retorno isolado de um mês.',
            '<strong>A <a href="/glossario/liquidez">liquidez</a> das cotas.</strong> Volume negociado e diferença entre a melhor oferta de compra e a de venda determinam quanto você perde só de entrar e sair. Fundo pouco negociado pode custar caro na hora de vender, mesmo que a carteira dele seja excelente.',
          ],
        },
        {
          kind: 'p',
          html: 'Existe ainda um mecanismo de bastidor que segura o preço da cota colado ao valor real da carteira. Instituições autorizadas podem criar e resgatar grandes lotes de cotas entregando ou recebendo os próprios ativos do índice. Sempre que a cota descola do valor da cesta, essa operação vira arbitragem e empurra o preço de volta. Você não precisa fazer nada com isso, mas é a razão pela qual um ETF líquido raramente negocia muito longe do que ele realmente vale.',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'Os tipos de ETF e o que cada um resolve',
      blocks: [
        {
          kind: 'p',
          html: 'A palavra ETF não descreve um risco, descreve um formato. O que define o risco é o índice lá dentro. Na B3 os grupos mais comuns são estes:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Índice amplo de ações brasileiras.</strong> Seguem o <a href="/glossario/ibovespa">Ibovespa</a> ou índices equivalentes de mercado. Servem como base de renda variável para quem não quer, ou ainda não sabe, escolher empresa por empresa.',
            '<strong>Índices internacionais.</strong> Dão exposição a bolsas de fora comprando um código na B3, em reais. Trazem junto o efeito do câmbio, que às vezes ajuda e às vezes atrapalha, e que precisa ser considerado como parte do risco, não como bônus.',
            '<strong>Recortes e setores.</strong> Small caps, dividendos, sustentabilidade, setores específicos. São apostas mais concentradas, com potencial maior e oscilação maior. Não confunda um recorte estreito com diversificação só porque é um fundo.',
            '<strong>Renda fixa.</strong> Seguem índices de títulos públicos ou privados. Oscilam, porque título negociado no mercado tem marcação diária, e por isso não substituem a <a href="/guias/reserva-de-emergencia">reserva de emergência</a>, que precisa de valor previsível na hora do saque.',
            '<strong>Cripto.</strong> Acompanham índices de criptomoedas dentro da estrutura regulada da bolsa. Continuam sendo cripto para todos os efeitos de risco, com a diferença de dispensar corretora especializada e custódia própria. O guia de <a href="/guias/bitcoin-na-carteira">bitcoin na carteira</a> trata do tamanho saudável dessa fatia.',
          ],
        },
        {
          kind: 'p',
          html: 'Repare que os <a href="/glossario/fii">fundos imobiliários</a> ficam fora dessa lista por serem outra categoria, com regras próprias de distribuição e tributação, ainda que existam ETFs que seguem o <a href="/glossario/ifix">IFIX</a>. Para investir diretamente no setor, o caminho é o guia de <a href="/guias/melhores-fiis-2026">FIIs</a>.',
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'ETF ou escolher as ações você mesmo?',
      blocks: [
        {
          kind: 'p',
          html: 'A pergunta certa não é qual dos dois é melhor, é qual dos dois combina com o tempo e o interesse que você tem. As duas escolhas são defensáveis, e o erro caro é fazer uma delas pela metade.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>O ETF entrega <a href="/glossario/diversificacao">diversificação</a> imediata.</strong> Com pouco dinheiro você tem exposição a dezenas de empresas. Montar isso comprando ação por ação levaria muito mais capital e muito mais custo de corretagem.',
            '<strong>O ETF elimina o risco de escolher errado, e também a chance de escolher certo.</strong> Você recebe o desempenho do índice, com o bônus de nunca ficar de fora da empresa que subiu e o ônus de carregar as que caíram.',
            '<strong>Escolher ações exige método e tempo.</strong> Ler balanço, acompanhar resultado, revisar tese. Quem gosta disso costuma ter vantagem em nichos que o índice cobre mal. Quem não gosta tende a decidir por manchete, e aí o índice ganha com folga. O guia de <a href="/guias/como-analisar-uma-acao">como analisar uma ação</a> mostra o trabalho envolvido.',
            '<strong>Os dois convivem bem.</strong> Uma configuração comum é usar o ETF como base ampla da parte de renda variável e reservar uma fatia menor para posições escolhidas a dedo. Assim o resultado da carteira não depende de acertar uma única história.',
          ],
        },
        {
          kind: 'p',
          html: 'Uma observação sobre proventos, porque ela desmonta expectativa errada: <strong>nem todo ETF distribui dividendos</strong>. Vários reinvestem automaticamente o que recebem das empresas da carteira, o que aparece como cota mais valorizada em vez de dinheiro na conta. Isso não é defeito, mas muda tudo para quem investe pensando em renda mensal. Confira a política de distribuição do fundo antes de contar com o depósito.',
        },
      ],
    },
    {
      id: 'sec-5',
      title: 'Custos e imposto: onde o ETF difere da ação',
      blocks: [
        {
          kind: 'p',
          html: 'Aqui mora a diferença que mais pega o investidor de surpresa, e ela é a favor da ação. As regras a seguir são o desenho geral vigente há anos, mas tributação muda por lei: trate como referência e confirme a regra do exercício atual antes de calcular o seu.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>A isenção mensal das ações não vale para ETF de renda variável.</strong> Na venda de ações no mercado à vista existe um limite mensal de vendas dentro do qual o lucro fica isento (historicamente na casa dos R$ 20 mil por mês). Em ETF essa isenção não se aplica: havendo lucro, há imposto, independentemente do valor vendido.',
            '<strong>O recolhimento é seu.</strong> Vendeu com lucro no mês, você apura e paga por DARF até o último dia útil do mês seguinte, no mesmo ritual das ações acima do limite. A alíquota de referência em operações normais é de 15% sobre o ganho, e day trade segue regra própria e mais pesada.',
            '<strong>ETF de renda fixa tem tributação retida na fonte.</strong> Nesse grupo o imposto costuma ser descontado automaticamente, com alíquota que cai conforme o prazo médio da carteira do fundo. Você não emite DARF, mas também não escolhe o momento.',
            '<strong>Não há <a href="/glossario/come-cotas">come-cotas</a> nos ETFs de renda variável.</strong> A antecipação semestral de imposto que existe em vários fundos tradicionais não se aplica aqui, o que preserva o efeito de juros compostos ao longo dos anos.',
            '<strong>Custos de negociação continuam existindo.</strong> Corretagem (zero em muitas corretoras), emolumentos da bolsa e a diferença entre compra e venda. Em aportes pequenos e frequentes, esse conjunto pesa mais do que a taxa de administração.',
          ],
        },
        {
          kind: 'p',
          html: 'Nada disso torna o ETF caro, apenas diferente. O ponto prático é que quem vende ETF com lucro precisa lembrar do DARF mesmo em valores baixos, algo que o investidor de ações acostumado à isenção esquece com facilidade. O guia de <a href="/guias/como-declarar-investimentos-no-ir">como declarar investimentos no IR</a> cobre a apuração e a declaração anual em detalhe.',
        },
      ],
    },
    {
      id: 'sec-6',
      title: 'Como comprar o primeiro ETF, passo a passo',
      blocks: [
        {
          kind: 'p',
          html: 'Na mecânica, comprar ETF é idêntico a comprar ação. O que muda é o que você confere antes de digitar o código:',
        },
        {
          kind: 'steps',
          items: [
            'Defina o papel que esse fundo terá na carteira. Base ampla de renda variável, exposição ao exterior, um recorte específico. Sem essa definição, qualquer ETF parece razoável e nenhum tem função clara.',
            'Escolha o índice antes de escolher o fundo. O índice é o produto; o fundo é só o veículo que o replica. Leia o que compõe o índice e como ele é recomposto.',
            'Compare os fundos que seguem esse mesmo índice por taxa de administração, aderência e volume negociado. Entre dois iguais no papel, o mais barato e mais líquido vence.',
            'Confira a política de proventos. Distribui ou reinveste? Isso define se o fundo serve, ou não, para o seu objetivo de renda.',
            'Compre pelo home broker da sua <a href="/glossario/corretora">corretora</a> como faria com uma ação, informando o código e a quantidade de cotas. Use ordem limitada se a liquidez for baixa, para não pagar um preço pior que o pretendido.',
            'Programe os aportes e o rebalanceamento. Aporte periódico dilui o preço médio ao longo do tempo, e a revisão de pesos é o que impede que uma parte da carteira cresça sozinha até virar risco concentrado.',
          ],
        },
        {
          kind: 'p',
          html: 'Depois da compra, o acompanhamento é bem mais curto que o de uma carteira de ações escolhidas uma a uma. Você monitora se o fundo continua aderente ao índice, se a taxa mudou e se o volume negociado segue saudável. A <a href="/calculadora/juros-compostos">calculadora de juros compostos</a> ajuda a projetar o efeito dos aportes ao longo dos anos, e a página de <a href="/carteira">carteira</a> reúne suas posições em um lugar só.',
        },
      ],
    },
    {
      id: 'sec-7',
      title: 'O que o ETF não resolve',
      blocks: [
        {
          kind: 'p',
          html: 'Comprar um fundo de índice reduz o número de decisões, não o risco de mercado. Vale ser explícito sobre os limites, porque é aí que a frustração costuma nascer:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>ETF cai quando o índice cai.</strong> Não existe gestor tentando proteger a carteira em mercado ruim. A <a href="/glossario/volatilidade">volatilidade</a> é a do índice, integral, para cima e para baixo.',
            '<strong>Diversificação de veículo não é diversificação de risco.</strong> Vários ETFs do mesmo mercado continuam sendo o mesmo mercado. Diversificar de verdade envolve classes diferentes, e é disso que trata o guia de <a href="/guias/como-montar-carteira-de-investimentos">como montar uma carteira de investimentos</a>.',
            '<strong>Índice amplo carrega as empresas ruins também.</strong> Você compra o mercado inteiro, o que inclui as companhias que você jamais escolheria. Esse é o preço de não precisar escolher.',
            '<strong>Concentração escondida.</strong> Índices ponderados por valor de mercado ficam pesados nas maiores empresas. Um punhado de nomes pode explicar boa parte do movimento. O ranking de <a href="/ranking/maiores-valor-mercado">maiores valores de mercado</a> mostra quem tende a ocupar esse topo.',
            '<strong>Não substitui reserva nem objetivo de curto prazo.</strong> Dinheiro que você pode precisar em meses não pertence a nenhum fundo de renda variável, por mais diversificado que seja.',
          ],
        },
        {
          kind: 'p',
          html: 'Com esses limites claros, o ETF vira o que ele é de melhor: uma forma barata, simples e transparente de ter mercado na carteira sem depender de acertar empresas. Para se aprofundar, o <a href="/glossario">glossário</a> destrincha cada termo citado aqui, a <a href="/metodologia">metodologia</a> explica como a Redentia calcula os indicadores das páginas de ativo, e o guia de <a href="/guias/como-investir-em-acoes">como investir em ações</a> cobre a abertura de conta e a primeira ordem, que é exatamente o mesmo caminho usado para comprar uma cota de ETF.',
        },
      ],
    },
  ],
  cta: {
    title: 'Veja o que está dentro dos índices que os ETFs replicam',
    subtitle: 'Rankings da Redentia · as empresas da B3 ordenadas por tamanho, lucro e dividendos',
    to: '/rankings',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'O que é um ETF e como ele funciona?',
      a: 'ETF é um fundo que replica a composição de um índice de mercado e cujas cotas são negociadas na bolsa como se fossem ações. Ao comprar uma cota, você passa a ter exposição proporcional a todos os ativos daquele índice de uma só vez. A gestão é passiva: o objetivo é acompanhar o benchmark, não superá-lo, o que costuma permitir taxas menores que as de fundos com gestão ativa.',
    },
    {
      q: 'Qual a diferença entre ETF e ação?',
      a: 'Comprando uma ação você vira sócio de uma empresa específica. Comprando um ETF você vira cotista de um fundo que é sócio de várias empresas ao mesmo tempo. A negociação é idêntica no home broker, mas o risco é diferente: a ação depende de uma companhia, o ETF acompanha o desempenho médio do índice inteiro. A tributação também difere, porque a isenção mensal em vendas de ações não vale para ETF.',
    },
    {
      q: 'ETF paga dividendos?',
      a: 'Depende do fundo. Alguns distribuem em dinheiro os proventos que recebem das empresas da carteira, outros reinvestem automaticamente, o que aparece como valorização da cota em vez de depósito na conta. A política de distribuição está no regulamento e no material do fundo, e precisa ser conferida antes de contar com o ETF como fonte de renda mensal.',
    },
    {
      q: 'Como é tributado o ETF no Brasil?',
      a: 'Como regra geral, o lucro na venda de ETF de renda variável é tributado sem a isenção mensal que existe nas vendas de ações, com alíquota de referência de 15% em operações normais e recolhimento por DARF feito pelo próprio investidor. ETFs de renda fixa costumam ter imposto retido na fonte, com alíquota decrescente conforme o prazo médio da carteira. Regras tributárias mudam por lei, então confirme as vigentes no exercício atual.',
    },
    {
      q: 'Quanto dinheiro preciso para começar a investir em ETF?',
      a: 'Não existe valor mínimo definido por regra: você compra a quantidade de cotas que quiser, e o custo de entrada é o preço de uma cota mais os custos de negociação. É justamente por isso que o ETF costuma ser a forma mais acessível de obter diversificação ampla com pouco capital, já que montar a mesma cesta comprando ação por ação exigiria muito mais dinheiro.',
    },
    {
      q: 'ETF é mais seguro que ação?',
      a: 'É mais diversificado, o que reduz o risco de uma única empresa arruinar o resultado, mas não elimina o risco de mercado. Se o índice que o fundo replica cai, a cota cai junto, sem gestor tentando proteger a carteira. ETF de índice amplo tende a oscilar menos que uma ação isolada, e ETF setorial ou de nicho pode oscilar tanto quanto.',
    },
    {
      q: 'O que olhar antes de escolher um ETF?',
      a: 'Três coisas, nesta ordem: qual índice o fundo replica (é ele que define o risco), qual a taxa de administração (entre fundos que seguem o mesmo índice, a taxa costuma decidir) e qual a liquidez das cotas (volume negociado e diferença entre compra e venda determinam o custo de entrar e sair). Depois disso, confira a aderência histórica ao índice e a política de proventos.',
    },
  ],
  related: ['Como investir em ações', 'Como montar uma carteira de investimentos', 'Como declarar investimentos no IR'],
}
