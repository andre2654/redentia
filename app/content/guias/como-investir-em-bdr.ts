/**
 * Guia: BDRs, o que são e como investir (rodada semanal de 2026-08-12).
 *
 * Lacuna real, medida no Search Console (export de 03/08/2026, 92 dias):
 * o cluster de BDR e empresa estrangeira soma 49 consultas, 2.348 impressões
 * e 2 cliques (CTR 0,09%). Nenhum dos 15 guias do registry trata de BDR e o
 * glossário não tem o verbete, então esta é a única superfície de texto do
 * site para a classe. Dentro do cluster, a sub-intenção mais forte é
 * "BDR paga dividendo" (~147 impressões somando as variações por código,
 * todas com zero clique), e por isso ela ganhou seção inteira em vez de
 * virar uma linha do FAQ.
 *
 * Escopo deliberado: o certificado como veículo. NÃO invade "ETFs, o que são
 * e como investir" (fundo de índice, taxa, aderência, incluindo o ETF de
 * índice internacional, que aqui só aparece na comparação de decisão), nem
 * "Como investir em ações" (abertura de conta e primeira ordem), nem "Como
 * declarar investimentos no IR" (apuração e declaração anual), nem "Como
 * analisar uma ação" (leitura de indicadores).
 *
 * Conteúdo HONESTO: nenhum código de BDR citado, nenhuma cotação, nenhuma
 * paridade de um programa específico, nenhum dividend yield, nenhuma taxa de
 * custódia numérica, nenhuma retenção estrangeira com alíquota. Os únicos
 * números do texto são estruturais (níveis de programa, quantidade de
 * verificações) ou alíquota de IR apresentada como regra geral com ressalva
 * de confirmar a vigente, no mesmo padrão dos guias de ETF e de IR.
 *
 * HTML dos blocos é local e confiável: só <strong> e <a href> internos.
 * Rotas linkadas conferidas contra app/pages e os registries de glossário,
 * rankings e guias.
 */
import type { GuideDoc } from '~/types/guias'

export const COMO_INVESTIR_EM_BDR_GUIDE: GuideDoc = {
  slug: 'como-investir-em-bdr',
  tag: 'Ações',
  title: 'BDRs: o que são e como investir',
  dek: 'O certificado que traz a empresa estrangeira para a B3, o que ele entrega de verdade e as três diferenças que pegam o investidor de surpresa.',
  description:
    'O que é um BDR, como funciona o certificado de depósito de empresa estrangeira negociado na B3, quais tipos existem, se BDR paga dividendo, como o imposto de renda muda em relação às ações brasileiras e o que conferir antes da primeira compra. Guia claro e honesto da Redentia.',
  summary:
    'Comprar empresa de fora sem abrir conta no exterior, em reais e pelo home broker de sempre. Entenda o que você está comprando de fato, por que o dividendo chega diferente e onde o imposto do BDR não é o imposto da ação.',
  minutes: 10,
  author: 'Equipe Redentia',
  datePublished: '2026-08-12',
  dateModified: '2026-08-12',
  updatedLine: 'Atualizado em 12 ago 2026 · 10 min de leitura',
  updatedShort: 'atualizado em ago 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'O que é um BDR, sem jargão',
      blocks: [
        {
          kind: 'p',
          html: 'BDR é a sigla de Brazilian Depositary Receipt, ou certificado de depósito brasileiro. É um papel negociado na <a href="/glossario/b3">B3</a>, em reais, que <strong>representa uma ação de uma empresa estrangeira guardada fora do país</strong>. Você compra pelo <a href="/glossario/home-broker">home broker</a> da sua corretora brasileira, como compraria qualquer ação daqui, e passa a ter exposição econômica a uma companhia que nunca esteve listada na bolsa brasileira.',
        },
        {
          kind: 'p',
          html: 'A distinção que resolve metade das confusões é esta: <strong>você não está comprando a ação lá fora, está comprando um certificado lastreado nela</strong>. Existe uma instituição depositária brasileira que mantém as ações originais custodiadas no mercado de origem e emite, aqui, os certificados correspondentes. O preço do BDR acompanha a ação lá fora, mas o que está no seu nome é o certificado, e é essa natureza jurídica que explica as regras de dividendo, de imposto e de direito de voto que aparecem mais adiante.',
        },
        {
          kind: 'stats',
          items: [
            { value: '2', label: 'variáveis mexem no preço: a ação lá fora e o câmbio' },
            { value: '3', label: 'níveis de programa patrocinado, com regras diferentes' },
            { value: '0', label: 'conta no exterior necessária para comprar' },
          ],
        },
        {
          kind: 'p',
          html: 'Vale registrar uma mudança de acesso que ainda gera dúvida. Até 2020, os BDRs mais comuns só podiam ser comprados por investidor qualificado. A regra caiu, e hoje o investidor pessoa física em geral pode negociá-los normalmente. Se você leu algo em contrário em conteúdo antigo, era verdade na época e deixou de ser.',
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'Como o BDR funciona por dentro',
      blocks: [
        {
          kind: 'p',
          html: 'Quatro peças explicam praticamente todo o comportamento do papel, inclusive os movimentos que parecem inexplicáveis quando você compara com o gráfico da ação lá fora:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>O lastro.</strong> Para cada certificado emitido aqui existe ação equivalente bloqueada no mercado de origem, sob <a href="/glossario/custodia">custódia</a>. Não é um contrato que aposta no preço, nem um espelho sintético: existe papel de verdade do outro lado.',
            '<strong>A paridade.</strong> Um BDR não vale necessariamente uma ação. O programa define quantos certificados equivalem a quantas ações, e essa razão existe para deixar o preço unitário em uma faixa confortável de negociação. Por isso comparar o preço do BDR com o preço da ação lá fora, um a um, quase sempre dá diferença.',
            '<strong>O câmbio embutido.</strong> O papel é cotado em reais, mas o ativo por trás vive em outra moeda. O preço aqui reflete a ação lá fora convertida. Na prática, você carrega dois riscos ao mesmo tempo, o da empresa e o da moeda, e eles podem se somar ou se cancelar em qualquer direção.',
            '<strong>A instituição depositária.</strong> É ela que emite os certificados, recebe os proventos no exterior, converte e repassa, e comunica eventos societários. Boa parte do que diferencia um BDR de uma ação brasileira acontece nessa passagem intermediária.',
          ],
        },
        {
          kind: 'p',
          html: 'Um detalhe operacional que assusta quem não conhece: <strong>a paridade pode mudar</strong>. O programa pode fazer um ajuste que altera quantos certificados representam a ação original, e a quantidade de papéis na sua conta muda junto, na proporção correspondente. Não é perda nem ganho, é a mesma fatia expressa em outro número de certificados. Confira o comunicado antes de concluir que sumiu papel da carteira.',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'Os tipos de BDR e o que muda em cada um',
      blocks: [
        {
          kind: 'p',
          html: 'A palavra BDR cobre estruturas bem diferentes, e a diferença principal é se a empresa estrangeira participa do programa ou não:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>BDR não patrocinado.</strong> A instituição depositária cria o programa por conta própria, sem envolvimento da companhia. É a maioria do que se negocia na B3. A empresa não tem obrigação com o investidor brasileiro, e a informação que chega até você é a que ela publica no mercado de origem, no idioma de origem.',
            '<strong>BDR patrocinado Nível I.</strong> A companhia participa do programa, mas sem registro completo aqui. A negociação e a divulgação seguem regras mais leves que as de uma empresa listada na B3.',
            '<strong>BDR patrocinado Nível II.</strong> A empresa se registra e passa a cumprir exigências de divulgação no Brasil, o que aproxima a experiência da de uma companhia listada aqui.',
            '<strong>BDR patrocinado Nível III.</strong> Além do registro, envolve oferta pública de distribuição no mercado brasileiro, ou seja, captação de recursos aqui, como acontece em um <a href="/glossario/ipo">IPO</a>.',
            '<strong>BDR de ETF.</strong> Existe também o certificado lastreado em cotas de fundo de índice estrangeiro, em vez de em ações de uma empresa. O veículo é o mesmo, o conteúdo é uma cesta inteira. Como o formato do fundo tem lógica própria, ele está detalhado no guia de <a href="/guias/como-investir-em-etf">ETFs</a>.',
          ],
        },
        {
          kind: 'p',
          html: 'A consequência prática do nível não é o risco de mercado, que continua sendo o da empresa lá fora, e sim <strong>a qualidade e a língua da informação que chega até você</strong>. Em um programa não patrocinado, acompanhar resultado significa ler o material publicado no mercado de origem, com calendário e formato diferentes dos que você conhece da B3.',
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'BDR paga dividendo?',
      blocks: [
        {
          kind: 'p',
          html: 'Paga, quando a empresa lá fora paga, e essa é a resposta curta. A resposta útil é <strong>por que o valor que cai na sua conta quase nunca bate com a conta que você fez</strong>. Três etapas explicam a diferença, e nenhuma delas é erro da corretora:',
        },
        {
          kind: 'steps',
          items: [
            'A empresa distribui o provento na moeda e no calendário do país de origem. Quem recebe primeiro é a instituição depositária, que é a titular das ações custodiadas, e não você.',
            'Há retenção de imposto no país de origem antes do repasse, com regra e alíquota que variam conforme o país da companhia e o acordo aplicável. O que segue viagem já é um valor líquido, menor que o anunciado.',
            'O valor é convertido para reais e distribuído entre os detentores dos certificados, na proporção da paridade do programa. Só então chega à sua conta, com o atraso natural de todo esse trajeto.',
          ],
        },
        {
          kind: 'p',
          html: 'Some as três etapas e você entende as reclamações mais comuns: o dinheiro demora mais do que o dividendo de uma empresa brasileira, o valor por papel não corresponde ao anunciado lá fora, e a data de crédito não é a data do anúncio. Nada disso é irregularidade, é o custo de ter um intermediário e uma moeda no meio do caminho.',
        },
        {
          kind: 'p',
          html: 'Duas diferenças de fundo em relação ao que você conhece da bolsa brasileira. Primeira: <strong>não existe juros sobre capital próprio</strong> em BDR, porque JCP é figura da legislação societária e tributária brasileira, e a empresa por trás não está sujeita a ela. Segunda, e mais importante: <strong>o dividendo de BDR não recebe o tratamento do dividendo de ação brasileira</strong>. Provento vindo do exterior tem regra própria de tributação e de declaração no Brasil, diferente da isenção que o investidor associa ao dividendo daqui. Como isso muda por lei e por país de origem, confirme a regra vigente antes de assumir qualquer coisa, e trate o guia de <a href="/guias/como-declarar-investimentos-no-ir">como declarar investimentos no IR</a> como o ponto de partida da apuração.',
        },
        {
          kind: 'p',
          html: 'Consequência para quem investe pensando em renda: <strong>BDR é um veículo ruim para montar renda mensal previsível</strong>. Muitas empresas estrangeiras distribuem pouco ou nada, preferindo reinvestir o lucro, o calendário é trimestral ou anual, e o valor final depende do câmbio do dia da conversão. Se o objetivo é proventos recorrentes, o caminho está nos <a href="/glossario/dividendos">dividendos</a> de empresas e fundos brasileiros, não aqui.',
        },
      ],
    },
    {
      id: 'sec-5',
      title: 'Imposto e custos: onde o BDR não é ação',
      blocks: [
        {
          kind: 'p',
          html: 'Este é o ponto que mais custa dinheiro por desconhecimento, e ele é desfavorável ao BDR. As regras abaixo são o desenho geral vigente há anos, mas tributação muda por lei: trate como referência e confirme a regra do exercício atual antes de calcular o seu.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>A isenção mensal das ações não vale para BDR.</strong> Na venda de ações brasileiras no mercado à vista existe um limite mensal de vendas dentro do qual o lucro fica isento, historicamente na casa dos R$ 20 mil por mês. Em BDR essa isenção não se aplica: havendo lucro na venda, há imposto, qualquer que seja o valor negociado.',
            '<strong>O recolhimento é seu.</strong> Vendeu com lucro no mês, você apura e paga por DARF até o último dia útil do mês seguinte. A alíquota de referência em operações normais é de 15% sobre o ganho, e day trade segue regra própria e mais pesada.',
            '<strong>Ganho de capital e provento são apurações separadas.</strong> O lucro da venda do certificado segue a lógica de renda variável; o dividendo repassado segue a lógica de rendimento vindo do exterior. São duas contas diferentes, com prazos diferentes, e misturá-las é a origem clássica da malha fina.',
            '<strong>Prejuízo compensa dentro da mesma categoria.</strong> Perda em renda variável abate lucro futuro de renda variável, não abate o rendimento de proventos e não migra para outras cestas de tributação.',
            '<strong>Custos de negociação continuam existindo.</strong> Corretagem, emolumentos da bolsa e a diferença entre a melhor oferta de compra e a de venda. Programas de BDR podem ainda ter taxa própria da instituição depositária, descontada do provento ou cobrada à parte, e ela consta no material do programa.',
          ],
        },
        {
          kind: 'p',
          html: 'Nada disso torna o BDR ruim, torna o BDR <strong>diferente da ação que você tem ao lado dele na mesma tela</strong>. O erro caro é aplicar automaticamente ao certificado a intuição construída com ações brasileiras, principalmente a de que venda pequena com lucro não gera imposto.',
        },
      ],
    },
    {
      id: 'sec-6',
      title: 'BDR, ETF de índice estrangeiro ou conta no exterior?',
      blocks: [
        {
          kind: 'p',
          html: 'Os três caminhos levam a exposição internacional, e a escolha depende menos de qual é melhor e mais do que você quer resolver. As diferenças que realmente decidem:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>BDR serve para escolher a empresa.</strong> É o único dos três que permite ter uma companhia estrangeira específica, pelo home broker de sempre, em reais. Se a sua tese é sobre um negócio, e não sobre um mercado, é este o veículo.',
            '<strong>ETF de índice internacional serve para comprar o mercado.</strong> Uma ordem entrega a cesta inteira, com <a href="/glossario/diversificacao">diversificação</a> imediata e sem a necessidade de acertar qual empresa vence. A mecânica de taxa, aderência e <a href="/glossario/liquidez">liquidez</a> está no guia de <a href="/guias/como-investir-em-etf">ETFs</a>.',
            '<strong>Conta no exterior serve para quem quer o ativo original.</strong> Dá acesso ao papel de verdade e ao universo completo de ativos, com o custo de abrir e manter a conta, remeter recursos e lidar com uma apuração de imposto própria. É mais estrutura, para quem tem volume ou intenção de longo prazo lá fora.',
            '<strong>Nos três, o câmbio está presente.</strong> Ele não some por o preço aparecer em reais. No BDR e no ETF de índice estrangeiro ele vem embutido no preço, e é isso que faz o papel subir em dia de dólar forte mesmo com a ação parada lá fora.',
          ],
        },
        {
          kind: 'p',
          html: 'Antes de decidir, uma verificação que evita frustração: <strong>confira a liquidez do papel específico</strong>. O universo de BDRs na B3 é grande, e uma parte relevante dele negocia pouco. Volume baixo e diferença larga entre compra e venda transformam a entrada e a saída em custo real, mesmo quando a empresa lá fora é enorme e negocia bilhões por dia no mercado de origem. Use ordem limitada e consulte o papel na <a href="/busca">busca</a> antes de mandar a ordem.',
        },
      ],
    },
    {
      id: 'sec-7',
      title: 'O que o BDR não resolve',
      blocks: [
        {
          kind: 'p',
          html: 'Vale ser explícito sobre os limites, porque é onde nasce a frustração de quem comprou esperando outra coisa:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Não é ação, e isso tem efeitos.</strong> Direito de voto em geral não acompanha o certificado, e quando acompanha depende do programa. Você tem a exposição econômica, não necessariamente os direitos de sócio.',
            '<strong>Comprar empresa de fora não é diversificar sozinho.</strong> Várias companhias estrangeiras do mesmo setor continuam sendo o mesmo setor. Diversificação de verdade envolve classes e mercados diferentes, e é disso que trata o guia de <a href="/guias/como-montar-carteira-de-investimentos">como montar uma carteira de investimentos</a>.',
            '<strong>Câmbio não é proteção garantida.</strong> A exposição à moeda ajuda quando o real se desvaloriza e atrapalha no caminho contrário. Tratar BDR como reserva cambial ignora que o preço também carrega o risco da empresa, que pode cair mais do que o câmbio sobe.',
            '<strong>Analisar continua sendo trabalho.</strong> A empresa lá fora publica balanço em outro idioma, outro padrão contábil e outro calendário. O método de leitura do guia de <a href="/guias/como-analisar-uma-acao">como analisar uma ação</a> vale, mas a fonte é mais difícil de acompanhar.',
            '<strong>Não substitui reserva nem objetivo de curto prazo.</strong> Dinheiro que você pode precisar em meses não pertence a um ativo que oscila por dois motivos ao mesmo tempo. Esse dinheiro tem lugar próprio, tratado no guia de <a href="/guias/reserva-de-emergencia">reserva de emergência</a>.',
          ],
        },
        {
          kind: 'p',
          html: 'Com os limites claros, o BDR volta a ser o que ele tem de melhor: o caminho mais curto entre o seu home broker e uma empresa que não está listada aqui, sem abrir conta fora e sem remeter dinheiro. Para se aprofundar, o <a href="/glossario">glossário</a> destrincha os termos citados, a <a href="/metodologia">metodologia</a> explica como a Redentia calcula os indicadores das páginas de ativo, a <a href="/carteira">carteira</a> reúne suas posições em um lugar só, e o guia de <a href="/guias/como-investir-em-acoes">como investir em ações</a> cobre a abertura de conta e a primeira ordem, que é exatamente o mesmo caminho usado para comprar um BDR.',
        },
      ],
    },
  ],
  cta: {
    title: 'Consulte qualquer BDR pelo código na B3',
    subtitle: 'Busca da Redentia · fundamentos, proventos e indicadores de ações, FIIs e BDRs',
    to: '/busca',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'O que é um BDR e como ele funciona?',
      a: 'BDR é um certificado negociado na B3, em reais, que representa ações de uma empresa estrangeira mantidas em custódia fora do país. Uma instituição depositária guarda as ações originais no mercado de origem e emite aqui os certificados correspondentes. Você compra pelo home broker como compraria uma ação brasileira, mas o que fica no seu nome é o certificado, e não a ação lá fora.',
    },
    {
      q: 'BDR paga dividendo?',
      a: 'Paga quando a empresa estrangeira distribui, mas o caminho é mais longo. O provento é pago primeiro à instituição depositária, sofre retenção de imposto no país de origem, é convertido para reais e só então repassado na proporção da paridade do programa. Por isso o valor que chega é menor que o anunciado lá fora e demora mais que um dividendo de empresa brasileira. Não existe juros sobre capital próprio em BDR, porque o JCP é figura da legislação brasileira.',
    },
    {
      q: 'Qual a diferença entre BDR e ação?',
      a: 'Comprando ação você é sócio direto da companhia. Comprando BDR você tem um certificado lastreado em ações guardadas no exterior, com exposição econômica à empresa mas em geral sem direito de voto. A negociação é idêntica no home broker, e as diferenças que pesam são a paridade, o câmbio embutido no preço e a tributação, que não segue as regras aplicadas às ações brasileiras.',
    },
    {
      q: 'Como é tributado o BDR no Brasil?',
      a: 'Como regra geral, o lucro na venda de BDR é tributado sem a isenção mensal que existe nas vendas de ações brasileiras, com alíquota de referência de 15% em operações normais e recolhimento por DARF feito pelo próprio investidor até o último dia útil do mês seguinte. Os proventos repassados seguem a lógica de rendimento vindo do exterior, que é uma apuração separada. Regras tributárias mudam por lei, então confirme as vigentes no exercício atual.',
    },
    {
      q: 'Preciso ser investidor qualificado para comprar BDR?',
      a: 'Não. Até 2020 havia restrição que limitava boa parte dos BDRs a investidor qualificado, mas a regra caiu e hoje o investidor pessoa física em geral pode negociá-los normalmente pelo home broker de uma corretora brasileira. Conteúdo publicado antes dessa mudança ainda circula afirmando o contrário.',
    },
    {
      q: 'Qual a diferença entre BDR patrocinado e não patrocinado?',
      a: 'No patrocinado a própria empresa estrangeira participa do programa, e os níveis I, II e III representam graus crescentes de registro e divulgação no Brasil, com o Nível III envolvendo oferta pública aqui. No não patrocinado, que é a maior parte do que se negocia na B3, o programa é criado pela instituição depositária sem envolvimento da companhia, que não tem obrigação de informação com o investidor brasileiro. O risco de mercado é o mesmo em ambos: muda a qualidade e o idioma da informação que chega até você.',
    },
    {
      q: 'Vale a pena investir em BDR ou é melhor um ETF internacional?',
      a: 'Depende do que você quer resolver. BDR é o veículo para escolher uma empresa estrangeira específica; ETF de índice internacional entrega um mercado inteiro em uma ordem, com diversificação imediata e sem depender de acertar a companhia certa. Os dois carregam o efeito do câmbio, porque o ativo por trás vive em outra moeda. Em qualquer um dos dois, confira a liquidez do papel antes de comprar, já que parte relevante dos BDRs negocia pouco na B3.',
    },
  ],
  related: ['ETFs: o que são e como investir', 'Como montar uma carteira de investimentos', 'Como declarar investimentos no IR'],
}
