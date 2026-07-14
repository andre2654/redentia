import type { GlossaryTerm } from '~/types/glossario'

/** Grupo 2 do glossário. Ver grupo-1 (exemplar dividend-yield) pro contrato. */
export const GRUPO_2: GlossaryTerm[] = [
  {
    slug: 'payout',
    term: 'Payout',
    letter: 'P',
    short:
      'Payout é a fatia do lucro líquido que a empresa distribui aos acionistas como proventos, o percentual do resultado que vira dividendo em vez de ser reinvestido.',
    body: [
      'O <strong>payout</strong> responde a uma pergunta simples: de cada real de lucro, quanto a empresa devolve pro acionista e quanto ela guarda pra reinvestir no próprio negócio. É a tradução numérica da política de distribuição, e o complemento natural do <a href="/glossario/dividend-yield">dividend yield</a> pra quem investe pensando em renda.',
      'A conta é direta: <strong>payout = (proventos distribuídos ÷ lucro líquido) × 100</strong>. Um payout de 30% significa que a empresa reteve 70% do lucro pra crescer; um payout de 90% mostra uma companhia madura que distribui quase tudo. Nem alto nem baixo é bom por si só, o que importa é se combina com o momento do negócio: empresa em expansão que retém faz sentido, empresa consolidada que distribui também.',
      'Na prática, o payout serve pra checar a <strong>sustentabilidade dos dividendos</strong>. Um <a href="/glossario/dividend-yield">dividend yield</a> alto sustentado por payout de 40% é bem mais confiável do que o mesmo yield bancado por payout de 110%. Ele também explica parte do yield: dá pra ler payout, <a href="/glossario/lucro-liquido">lucro líquido</a> e <a href="/glossario/jscp">JCP</a> juntos pra entender de onde vem a distribuição.',
      '<strong>Exemplo ilustrativo:</strong> uma empresa que lucrou R$ 100 milhões e distribuiu R$ 60 milhões em proventos tem payout de 60%. São números redondos só pra mostrar a fórmula, não o resultado real de nenhuma companhia.',
      'Ressalva honesta: <strong>payout acima de 100% não se sustenta no longo prazo</strong>. Quando a empresa paga mais do que lucra, está usando reservas de caixa ou dívida pra manter o dividendo, e isso costuma acabar em corte de proventos. Vale cruzar o payout com o histórico de pagamentos no <a href="/ranking/maiores-dividend-yield">ranking de maiores dividend yields</a> antes de confiar numa distribuição generosa.',
    ],
    related: ['dividendos', 'dividend-yield', 'jscp', 'lucro-liquido', 'proventos'],
    backlink: {
      label: 'Ver o ranking de maiores pagadoras de dividendos',
      to: '/ranking/maiores-dividend-yield',
    },
    faq: [
      {
        q: 'O que é um bom payout?',
        a: 'Depende do estágio da empresa. Companhias maduras costumam ter payout alto (distribuem muito porque crescem pouco), enquanto empresas em expansão retêm mais lucro pra investir. Não existe número ideal universal: o bom payout é o que a empresa consegue manter sem recorrer a dívida ou a reservas.',
      },
      {
        q: 'Payout de FII é diferente do de ação?',
        a: 'Sim. Fundos imobiliários são obrigados por lei a distribuir pelo menos 95% do resultado do semestre, então têm payout naturalmente altíssimo. Em ações, o payout é uma decisão da administração e varia muito de empresa pra empresa.',
      },
      {
        q: 'Payout maior que 100% é ruim?',
        a: 'Como sinal recorrente, sim: significa que a empresa distribuiu mais do que lucrou no período. Pode acontecer de forma pontual (um lucro fraco num trimestre, um provento extraordinário), mas se persiste é insustentável e costuma preceder um corte de dividendos.',
      },
    ],
  },
  {
    slug: 'ipo',
    term: 'IPO',
    letter: 'I',
    short:
      'IPO (Initial Public Offering) é a oferta pública inicial de ações, o momento em que uma empresa abre capital e passa a ser negociada na bolsa.',
    body: [
      'O <strong>IPO</strong>, sigla de <strong>Initial Public Offering</strong> (oferta pública inicial), é o processo pelo qual uma empresa privada vira pública: ela vende ações ao mercado pela primeira vez e passa a ser negociada na <a href="/glossario/b3">B3</a>. É a porta de entrada de uma companhia no mercado de <a href="/glossario/acoes-on-pn">ações</a>.',
      'Empresas fazem IPO por dois motivos principais: <strong>captar recursos</strong> pra financiar crescimento e permitir que fundadores e investidores antigos vendam parte da participação. O processo passa por banco coordenador, elaboração do prospecto, definição de uma faixa de preço e a oferta em si, até as ações estrearem no pregão.',
      'Pro investidor, o IPO é atraente porque oferece acesso a uma história nova, mas traz uma dificuldade real: <strong>falta histórico público pra analisar</strong>. Uma empresa que já negocia há anos tem balanços, <a href="/glossario/analise-fundamentalista">análise fundamentalista</a> e reação a crises pra estudar; uma recém-listada, não. Por isso muitos investidores preferem esperar alguns trimestres de resultados abertos antes de entrar.',
      '<strong>Exemplo ilustrativo:</strong> uma empresa que abre capital ofertando 100 milhões de ações a R$ 20 cada capta R$ 2 bilhões e estreia com um <a href="/glossario/valor-mercado">valor de mercado</a> em torno desse patamar. Os números são redondos, só pra ilustrar a mecânica de uma oferta.',
      'Ressalva honesta: <strong>o preço do IPO é definido no auge do interesse dos vendedores</strong>, com forte marketing por trás. Parte relevante das estreias entrega desempenho fraco no primeiro ano, quando o entusiasmo cede lugar aos resultados reais. Entrar num IPO é apostar antes de ter dados, o que exige mais cautela, não menos.',
    ],
    related: ['b3', 'acoes-on-pn', 'free-float', 'novo-mercado', 'valor-mercado'],
    backlink: {
      label: 'Aprender a analisar ações antes de investir',
      to: '/guias/como-investir-em-acoes',
    },
    faq: [
      {
        q: 'Vale a pena investir em IPO?',
        a: 'Pode valer, mas o risco é maior do que comprar uma empresa com histórico público. No IPO você decide com pouca informação comparável e num preço definido pelos vendedores. Muitos investidores conservadores preferem esperar alguns balanços trimestrais antes de formar posição.',
      },
      {
        q: 'Qual a diferença entre IPO e follow-on?',
        a: 'O IPO é a primeira oferta de ações de uma empresa, quando ela abre capital. O follow-on é uma oferta subsequente, feita por uma empresa que já é listada e quer captar mais recursos ou permitir que sócios vendam participação.',
      },
      {
        q: 'Como participar de um IPO?',
        a: 'Pela sua corretora, no período de reserva que antecede a estreia. Você indica quanto quer investir dentro da faixa de preço divulgada no prospecto e, se a demanda superar a oferta, pode receber um rateio menor do que pediu.',
      },
    ],
  },
  {
    slug: 'blue-chips',
    term: 'Blue Chips',
    letter: 'B',
    short:
      'Blue chips são ações de empresas grandes, consolidadas e líderes de mercado, geralmente com alta liquidez, resultados consistentes e menor volatilidade.',
    body: [
      'O termo <strong>blue chips</strong> vem do pôquer, onde as fichas azuis são as de maior valor, e no mercado designa as ações das empresas mais sólidas e estabelecidas da bolsa: líderes de setor, com alto <a href="/glossario/valor-mercado">valor de mercado</a>, histórico longo de lucros e forte <a href="/glossario/liquidez">liquidez</a>.',
      'Na prática, uma blue chip costuma reunir <strong>tamanho, previsibilidade e facilidade de negociação</strong>. Por serem muito acompanhadas por analistas e negociarem grandes volumes todo dia, tendem a ter <a href="/glossario/volatilidade">volatilidade</a> menor que empresas pequenas e a compor a maior parte do <a href="/glossario/ibovespa">Ibovespa</a>. É o oposto natural das <a href="/glossario/small-caps">small caps</a>.',
      'A contrapartida é o <strong>potencial de crescimento mais contido</strong>. Como já são gigantes bem analisadas, dificilmente multiplicam de valor rápido, e boa parte do que se sabe sobre elas já está no preço. O apelo é estabilidade e, com frequência, uma política previsível de <a href="/glossario/dividendos">dividendos</a>, não a valorização explosiva.',
      '<strong>Exemplo ilustrativo:</strong> uma empresa líder do seu setor com valor de mercado na casa das centenas de bilhões, negociando volume elevado todos os dias, se enquadra no perfil de blue chip. É uma descrição de categoria, não a indicação de nenhuma ação específica.',
      'Ressalva honesta: <strong>blue chip não é sinônimo de investimento seguro</strong>. Empresas grandes também enfrentam crises setoriais, erros de gestão e ciclos ruins, e tamanho não impede queda de preço. O rótulo indica porte e liquidez, não garantia de retorno, o que reforça a importância da <a href="/glossario/diversificacao">diversificação</a>.',
    ],
    related: ['small-caps', 'ibovespa', 'liquidez', 'valor-mercado', 'volatilidade'],
    backlink: {
      label: 'Ver as maiores empresas por valor de mercado',
      to: '/ranking/maiores-valor-mercado',
    },
    faq: [
      {
        q: 'O que caracteriza uma blue chip?',
        a: 'Alto valor de mercado, liderança no setor, boa liquidez, histórico consistente de resultados e, muitas vezes, distribuição regular de proventos. São as empresas mais consolidadas e acompanhadas da bolsa.',
      },
      {
        q: 'Blue chips são mais seguras que small caps?',
        a: 'Costumam ser menos voláteis e mais líquidas, o que reduz alguns riscos. Mas nenhuma ação é isenta de risco: empresas grandes também caem em crises e ciclos ruins. A diferença é de grau, não de garantia.',
      },
      {
        q: 'Blue chips pagam mais dividendos?',
        a: 'Muitas blue chips são empresas maduras com payout alto e proventos previsíveis, mas não é uma regra. Existem blue chips que reinvestem quase todo o lucro e pagam pouco. O melhor é olhar o dividend yield e o histórico de cada uma.',
      },
    ],
  },
  {
    slug: 'small-caps',
    term: 'Small Caps',
    letter: 'S',
    short:
      'Small caps são ações de empresas de baixo valor de mercado, com maior potencial de crescimento mas também mais risco, volatilidade e menor liquidez.',
    body: [
      'As <strong>small caps</strong> são as ações de empresas de menor <a href="/glossario/valor-mercado">valor de mercado</a> da bolsa. Não há um corte oficial, mas costuma-se chamar assim companhias abaixo de alguns bilhões de reais em capitalização, o degrau abaixo das <a href="/glossario/blue-chips">blue chips</a>.',
      'O que define a categoria não é só o tamanho, mas o perfil que vem com ele: <strong>menos cobertura de analistas, menor <a href="/glossario/liquidez">liquidez</a> e mais <a href="/glossario/volatilidade">volatilidade</a></strong>. Com menos gente acompanhando e menos negócios por dia, o preço oscila mais e pode ser difícil montar ou desmontar posições grandes sem mexer na cotação.',
      'O apelo é o <strong>potencial de crescimento</strong>. Uma empresa pequena e bem administrada tem espaço pra crescer muito mais que uma gigante já consolidada, e algumas das blue chips de hoje foram small caps no passado. Esse é o argumento clássico de quem investe cedo em histórias de crescimento, sempre com horizonte longo.',
      '<strong>Exemplo ilustrativo:</strong> uma empresa com valor de mercado de R$ 500 milhões crescendo lucro de forma consistente tem, em tese, mais espaço pra multiplicar de valor do que uma de R$ 300 bilhões, mas também mais chance de sofrer numa crise. Os números servem só pra contrastar as escalas.',
      'Ressalva honesta: <strong>maior potencial vem junto de maior risco</strong>, e small caps não são um bom ponto de partida pra iniciantes. Exigem estudo mais profundo, tolerância a oscilações fortes e, sobretudo, <a href="/glossario/diversificacao">diversificação</a>, já que a chance de uma tese individual dar errado é real.',
    ],
    related: ['blue-chips', 'valor-mercado', 'volatilidade', 'risco', 'liquidez'],
    backlink: {
      label: 'Ler o guia completo de small caps',
      to: '/guias/small-caps-guia-completo',
    },
    faq: [
      {
        q: 'O que são small caps?',
        a: 'São ações de empresas de baixo valor de mercado, com menor liquidez e cobertura de analistas, mais volatilidade de preço e, em contrapartida, maior potencial de crescimento do que as grandes companhias já consolidadas.',
      },
      {
        q: 'Small caps são boas para iniciantes?',
        a: 'Geralmente não como principal exposição. Elas exigem mais análise, estômago pra volatilidade e diversificação. Iniciantes costumam construir base com empresas mais líquidas e previsíveis antes de dedicar uma fatia menor a small caps.',
      },
      {
        q: 'Qual o valor de mercado de uma small cap?',
        a: 'Não existe um limite oficial no Brasil. Na prática, o mercado costuma chamar de small cap empresas com capitalização abaixo de alguns bilhões de reais, mas o corte varia conforme o índice ou o gestor que faz a classificação.',
      },
    ],
  },
  {
    slug: 'etf',
    term: 'ETF',
    letter: 'E',
    short:
      'ETF (Exchange Traded Fund) é um fundo de índice negociado em bolsa como se fosse uma ação, que replica o desempenho de um índice e entrega diversificação num único ativo.',
    body: [
      'Um <strong>ETF</strong>, sigla de <strong>Exchange Traded Fund</strong> (fundo negociado em bolsa), é um fundo que espelha um índice de mercado e cujas cotas são compradas e vendidas na <a href="/glossario/b3">B3</a> igual a uma ação. Comprar uma cota é comprar, de uma vez, uma cesta inteira de ativos na mesma proporção do índice.',
      'A grande vantagem é a <strong><a href="/glossario/diversificacao">diversificação</a> instantânea a baixo custo</strong>. Uma única cota de um ETF de <a href="/glossario/ibovespa">Ibovespa</a> dá exposição a dezenas de empresas ao mesmo tempo, com taxa de administração tipicamente baixa por se tratar de gestão passiva, e com a liquidez de negociar em bolsa a qualquer momento do pregão.',
      'ETFs seguem um <a href="/glossario/benchmark">benchmark</a> em vez de tentar superá-lo, e é aí que se separam da gestão ativa: o objetivo é <strong>replicar o índice, não vencê-lo</strong>. Existem ETFs de renda variável brasileira, de índices internacionais, de small caps e de renda fixa, o que permite montar uma carteira ampla com poucos tickers.',
      '<strong>Exemplo ilustrativo:</strong> com R$ 1.000 aplicados num ETF que replica um índice amplo, o investidor passa a ter exposição a todas as empresas daquele índice de uma só vez, em vez de escolher e comprar cada ação separadamente. O valor é só um exemplo da lógica, não uma recomendação.',
      'Ressalva honesta: <strong>ETF replica o índice pra cima e pra baixo</strong>. Se o mercado que ele acompanha cai, a cota cai junto, sem gestor tentando defender a carteira. Além disso, nem todo ETF distribui proventos (muitos reinvestem), então vale checar a política de cada um antes de contar com renda.',
    ],
    related: ['ibovespa', 'ifix', 'diversificacao', 'benchmark', 'come-cotas'],
    backlink: {
      label: 'Explorar rankings e comparar ativos da bolsa',
      to: '/rankings',
    },
    faq: [
      {
        q: 'Como funciona um ETF?',
        a: 'O ETF monta uma carteira que espelha um índice e emite cotas negociadas em bolsa. Ao comprar uma cota, você fica exposto a todos os ativos do índice na mesma proporção, com a praticidade de comprar e vender como uma ação.',
      },
      {
        q: 'ETF paga dividendos?',
        a: 'Depende do ETF. Alguns distribuem os proventos que recebem, outros reinvestem tudo automaticamente na própria carteira (o que aumenta o valor da cota em vez de pagar em dinheiro). É preciso checar a política de distribuição de cada fundo.',
      },
      {
        q: 'ETF é melhor que comprar ações individuais?',
        a: 'São abordagens diferentes. O ETF entrega diversificação e simplicidade a baixo custo, replicando o mercado. Escolher ações individuais dá mais controle e chance de superar o índice, mas exige análise e aceita mais risco de concentração. Muitos investidores combinam as duas.',
      },
    ],
  },
  {
    slug: 'jscp',
    term: 'Juros sobre Capital Próprio (JCP)',
    letter: 'J',
    short:
      'JCP (Juros sobre Capital Próprio) é uma forma de a empresa remunerar acionistas parecida com dividendo, mas dedutível pra companhia e tributada em 15% de IR na fonte pro investidor.',
    body: [
      'Os <strong>Juros sobre Capital Próprio</strong>, ou <strong>JCP</strong>, são uma forma de a empresa remunerar os acionistas como se pagasse juros sobre o capital que eles investiram nela. Na prática, é um tipo de <a href="/glossario/proventos">provento</a>, primo dos <a href="/glossario/dividendos">dividendos</a>, mas com regras fiscais próprias.',
      'A diferença central é tributária. O <strong>dividendo é pago do lucro já tributado e chega isento de IR</strong> pra pessoa física; o <strong>JCP é dedutível pra empresa</strong> (reduz a base de cálculo do imposto dela) mas sofre <strong>15% de IR retido na fonte</strong> pro investidor. Ou seja, o mesmo real distribuído tem eficiência fiscal diferente pros dois lados.',
      'Pra decisão da companhia, o JCP costuma ser vantajoso porque o abatimento no imposto compensa. Pro investidor, o que chega é o valor líquido dos 15%, e por isso o JCP entra na conta do <a href="/glossario/dividend-yield">dividend yield</a> e do <a href="/glossario/payout">payout</a> ao lado dos dividendos, formando o total de proventos.',
      '<strong>Exemplo ilustrativo:</strong> se a empresa decide destinar R$ 100 por lote de ações, pagando como dividendo você receberia R$ 100 isentos; pagando como JCP você receberia R$ 85 (R$ 100 menos 15% de IR na fonte), enquanto a empresa deduz os R$ 100 da base do imposto dela. Os números são redondos só pra mostrar o mecanismo.',
      'Ressalva honesta: <strong>o IR do JCP já sai retido, mas ainda precisa ser declarado</strong> no ajuste anual, na ficha de rendimentos sujeitos à tributação exclusiva. E como a legislação de tributação de proventos pode mudar, comparar dividendo e JCP sempre depende das regras vigentes no momento.',
    ],
    related: ['dividendos', 'proventos', 'dividend-yield', 'payout', 'lucro-liquido'],
    backlink: {
      label: 'Ver o ranking de maiores pagadoras de proventos',
      to: '/ranking/maiores-dividend-yield',
    },
    faq: [
      {
        q: 'Qual a diferença entre JCP e dividendos?',
        a: 'Dividendos são pagos do lucro já tributado e chegam isentos de IR pra pessoa física. JCP é dedutível pra empresa, mas sofre 15% de IR retido na fonte pro investidor. Na prática ambos são proventos, com tratamento fiscal diferente pros dois lados.',
      },
      {
        q: 'JCP paga imposto de renda?',
        a: 'Sim. Sobre o JCP incidem 15% de IR retidos na fonte no momento do pagamento. Esse valor precisa ser informado na declaração anual, na ficha de rendimentos com tributação exclusiva na fonte.',
      },
      {
        q: 'JCP conta no dividend yield?',
        a: 'Sim. O JCP é um provento e entra no cálculo do dividend yield e do payout junto com os dividendos. Ao comparar pagadoras, o mais correto é olhar o total de proventos distribuídos, somando dividendos e JCP.',
      },
    ],
  },
  {
    slug: 'tag-along',
    term: 'Tag Along',
    letter: 'T',
    short:
      'Tag along é o direito do acionista minoritário de vender suas ações nas mesmas condições oferecidas ao controlador quando há troca de controle da empresa.',
    body: [
      'O <strong>tag along</strong> é um mecanismo de <strong>proteção do acionista minoritário</strong>. Quando o controlador de uma empresa vende sua participação e alguém assume o controle, o tag along garante que os minoritários possam vender suas <a href="/glossario/acoes-on-pn">ações</a> pelas mesmas condições, ou por um percentual definido do preço pago ao controlador.',
      'O nível de proteção depende do segmento de <strong>governança</strong> em que a empresa é listada. No <a href="/glossario/novo-mercado">Novo Mercado</a>, o tag along é de 100% pras ações; em segmentos intermediários e no mercado tradicional, o percentual pode ser menor, sobretudo pras ações preferenciais. É um dos itens que o investidor checa antes de comprar.',
      'A razão de existir é evitar que o <strong>prêmio de controle fique só com quem manda</strong>. Sem tag along, o controlador poderia vender caro e deixar os minoritários presos numa empresa sob nova gestão, sem a mesma saída. Com ele, a mudança de dono estende ao pequeno investidor parte das condições do negócio.',
      '<strong>Exemplo ilustrativo:</strong> se o controlador aceita vender suas ações por R$ 50 cada e a empresa tem tag along de 100%, o minoritário pode vender as dele também por R$ 50; com tag along de 80%, receberia R$ 40. Os valores são redondos, só pra mostrar como o percentual se aplica.',
      'Ressalva honesta: <strong>tag along só é acionado numa troca de controle</strong>, evento que pode nunca acontecer na vida de um investimento. Ele é uma camada de proteção de governança, não um retorno esperado, e por isso costuma ser lido junto de outros atributos de qualidade da empresa.',
    ],
    related: ['acoes-on-pn', 'novo-mercado', 'free-float', 'b3', 'cvm'],
    backlink: {
      label: 'Ver empresas ranqueadas pelo Redentia Score',
      to: '/ranking/redentia-score',
    },
    faq: [
      {
        q: 'O que significa tag along de 100%?',
        a: 'Significa que, numa venda de controle, o acionista minoritário pode vender suas ações pelo mesmo preço por ação oferecido ao controlador. É o nível máximo de proteção e o padrão exigido no Novo Mercado.',
      },
      {
        q: 'Quando o tag along é acionado?',
        a: 'Apenas quando ocorre uma alienação de controle, ou seja, quando o controlador vende sua participação e um novo controlador assume a empresa. Fora desse evento específico, o direito não se aplica.',
      },
      {
        q: 'Ações preferenciais têm tag along?',
        a: 'Depende do segmento de listagem. No Novo Mercado só existem ações ordinárias, todas com tag along de 100%. Em outros níveis, as preferenciais podem ter tag along parcial ou nenhum, conforme o estatuto e as regras do segmento.',
      },
    ],
  },
  {
    slug: 'day-trade',
    term: 'Day Trade',
    letter: 'D',
    short:
      'Day trade é a operação de comprar e vender o mesmo ativo dentro do mesmo dia, buscando lucrar com oscilações de curtíssimo prazo, sem carregar posição pra o dia seguinte.',
    body: [
      'O <strong>day trade</strong> é a modalidade em que a posição é aberta e fechada no <strong>mesmo pregão</strong>: nada é carregado de um dia pro outro. O objetivo é capturar oscilações de curtíssimo prazo, e por isso a operação se apoia fortemente em <a href="/glossario/analise-tecnica">análise técnica</a>, gráficos de minutos e execução rápida.',
      'É importante separar o conceito: <strong>day trade é especulação de curto prazo, não investimento</strong>. Diferente do <a href="/glossario/buy-and-hold">buy and hold</a>, que aposta na valorização e nos proventos de uma empresa ao longo de anos, o day trader não está comprando participação num negócio, está tentando acertar o movimento de preço do dia.',
      'A tributação também é mais pesada e distinta. Os ganhos em day trade têm <strong>alíquota de 20% de IR</strong> (contra 15% das operações comuns de ação), com retenção de imposto na fonte a cada operação e apuração mensal, o que aumenta a complexidade e o custo da atividade.',
      '<strong>Exemplo ilustrativo:</strong> comprar uma ação às 10h e vendê-la às 15h do mesmo dia, embolsando ou perdendo a diferença de preço, é uma operação de day trade. É a descrição da mecânica, não a sugestão de fazê-la.',
      'Ressalva honesta: <strong>a maioria dos day traders perde dinheiro no longo prazo</strong>, um resultado repetido em vários estudos acadêmicos. Somando custos, impostos, <a href="/glossario/alavancagem">alavancagem</a> e o peso emocional das decisões rápidas, é uma atividade de altíssimo risco, muito distante de um plano de construção de patrimônio.',
    ],
    related: ['swing-trade', 'stop-loss', 'analise-tecnica', 'alavancagem', 'buy-and-hold'],
    backlink: {
      label: 'Aprender a investir em ações com horizonte longo',
      to: '/guias/como-investir-em-acoes',
    },
    faq: [
      {
        q: 'Day trade é investimento?',
        a: 'Não. Investimento pressupõe manter participação num ativo pela geração de valor ao longo do tempo. Day trade é especulação de curtíssimo prazo, focada em oscilações de preço do dia. São atividades com lógica, risco e tributação diferentes.',
      },
      {
        q: 'Qual o imposto do day trade?',
        a: 'Os ganhos em day trade são tributados a 20% de IR, alíquota maior que os 15% das operações comuns de ações. Há ainda retenção na fonte a cada operação e apuração mensal, o que exige controle e recolhimento próprio.',
      },
      {
        q: 'Vale a pena fazer day trade?',
        a: 'Para a grande maioria das pessoas, não. Estudos mostram que a maior parte dos day traders perde dinheiro no longo prazo, especialmente depois de custos, impostos e alavancagem. É uma atividade de risco elevado, não um caminho recomendado pra construir patrimônio.',
      },
    ],
  },
  {
    slug: 'swing-trade',
    term: 'Swing Trade',
    letter: 'S',
    short:
      'Swing trade é a estratégia de manter posições por dias ou algumas semanas pra capturar movimentos de médio prazo, num meio-termo entre o day trade e o buy and hold.',
    body: [
      'O <strong>swing trade</strong> é uma estratégia de negociação de <strong>médio prazo</strong>: as posições ficam abertas de alguns dias a poucas semanas, o tempo de capturar um "swing", uma oscilação de tendência do ativo. Fica no meio do caminho entre o <a href="/glossario/day-trade">day trade</a> (que fecha no mesmo dia) e o <a href="/glossario/buy-and-hold">buy and hold</a> (que segura por anos).',
      'Por operar em janelas maiores que o day trade, o swing trade <strong>não exige acompanhar o mercado em tempo real o dia inteiro</strong> e gera menos operações, o que reduz custos de corretagem e o desgaste emocional. Ainda assim, se apoia bastante em <a href="/glossario/analise-tecnica">análise técnica</a> pra definir pontos de entrada e saída.',
      'A gestão de risco é o coração da estratégia. Como se busca um movimento específico, o swing trader costuma trabalhar com <a href="/glossario/stop-loss">stop loss</a> e <a href="/glossario/stop-gain">stop gain</a> definidos de antemão, pra limitar a perda quando a tese não se confirma e realizar o ganho quando o alvo é atingido.',
      '<strong>Exemplo ilustrativo:</strong> comprar uma ação numa segunda-feira apostando numa tendência de alta e vendê-la duas semanas depois, quando o movimento se esgota, é uma operação típica de swing trade. Serve pra ilustrar o horizonte, não como recomendação.',
      'Ressalva honesta: <strong>swing trade continua sendo negociação ativa, não investimento de longo prazo</strong>. Depende de disciplina pra respeitar os stops, conhecimento técnico e tolerância a perdas, e não substitui uma estratégia de construção de patrimônio baseada nos fundamentos das empresas.',
    ],
    related: ['day-trade', 'buy-and-hold', 'stop-loss', 'stop-gain', 'analise-tecnica'],
    backlink: {
      label: 'Comparar com investir em ações no longo prazo',
      to: '/guias/como-investir-em-acoes',
    },
    faq: [
      {
        q: 'Qual a diferença entre swing trade e day trade?',
        a: 'No day trade, a posição é aberta e fechada no mesmo dia. No swing trade, ela é mantida por dias ou semanas pra capturar um movimento de tendência mais amplo. O swing trade gera menos operações e não exige acompanhar o mercado o tempo todo.',
      },
      {
        q: 'Swing trade é melhor que buy and hold?',
        a: 'São filosofias diferentes. O swing trade busca lucrar com oscilações de médio prazo e depende de análise técnica e disciplina. O buy and hold aposta na valorização e nos proventos ao longo de anos. Não há vencedor universal: dependem do perfil, do tempo e do conhecimento de cada investidor.',
      },
      {
        q: 'Quanto tempo dura uma operação de swing trade?',
        a: 'Em geral de poucos dias a algumas semanas. O horizonte exato varia com a estratégia e o movimento buscado, mas o traço comum é ser mais longo que o day trade e bem mais curto que uma posição de investimento de longo prazo.',
      },
    ],
  },
  {
    slug: 'stop-loss',
    term: 'Stop Loss',
    letter: 'S',
    short:
      'Stop loss é uma ordem automática de venda que dispara quando o preço cai até um nível definido, servindo pra limitar a perda máxima de uma operação.',
    body: [
      'O <strong>stop loss</strong> (literalmente "parar a perda") é uma ordem programada de venda que <strong>dispara automaticamente quando o preço cai até o nível que você definiu</strong>. É a principal ferramenta de gestão de risco de quem opera ativamente: em vez de decidir na hora, sob pressão, você define de antemão qual é a perda máxima aceitável.',
      'A lógica é <strong>tirar a emoção da decisão</strong>. Ao estabelecer o ponto de saída antes de entrar, o operador evita o erro clássico de segurar um prejuízo torcendo pela recuperação. Por isso o stop loss é peça central no <a href="/glossario/day-trade">day trade</a> e no <a href="/glossario/swing-trade">swing trade</a>, quase sempre combinado com um <a href="/glossario/stop-gain">stop gain</a> no lado do lucro.',
      'Existe também o <strong>stop móvel (trailing stop)</strong>, que acompanha o preço enquanto ele sobe: se o ativo valoriza, o nível de stop sobe junto, protegendo parte do ganho já acumulado sem limitar a alta. É uma variação bastante usada pra deixar o lucro correr mantendo a proteção.',
      '<strong>Exemplo ilustrativo:</strong> quem compra uma ação a R$ 40 e define stop loss em R$ 36 aceita uma perda máxima de 10%; se a cotação tocar R$ 36, a venda é acionada automaticamente. Os números são redondos, apenas pra mostrar o funcionamento.',
      'Ressalva honesta: <strong>o stop não garante o preço exato de saída</strong>. Em quedas bruscas ou ativos de baixa <a href="/glossario/liquidez">liquidez</a>, a ordem pode executar bem abaixo do nível definido, o chamado slippage. E um stop apertado demais é acionado por oscilação normal, tirando você da posição sem necessidade.',
    ],
    related: ['stop-gain', 'swing-trade', 'day-trade', 'volatilidade', 'liquidez'],
    backlink: {
      label: 'Entender estratégias de investimento em ações',
      to: '/guias/como-investir-em-acoes',
    },
    faq: [
      {
        q: 'Como definir o preço do stop loss?',
        a: 'O ponto depende da sua tolerância a perda e da volatilidade do ativo. Um stop muito apertado é acionado por oscilação normal; um muito largo permite perdas grandes. Muitos operadores calibram o nível levando em conta o quanto o ativo costuma oscilar e suportes técnicos do gráfico.',
      },
      {
        q: 'O stop loss sempre executa no preço definido?',
        a: 'Não necessariamente. Em quedas rápidas ou ativos pouco líquidos pode haver slippage, e a venda sai a um preço pior que o programado. O stop define o gatilho, mas a execução depende da liquidez e da velocidade do mercado naquele momento.',
      },
      {
        q: 'Qual a diferença entre stop loss e stop gain?',
        a: 'O stop loss vende automaticamente pra limitar a perda quando o preço cai. O stop gain vende pra realizar o lucro quando o preço sobe até o alvo. Usados juntos, definem de antemão o risco e o objetivo de uma operação.',
      },
    ],
  },
  {
    slug: 'stop-gain',
    term: 'Stop Gain',
    letter: 'S',
    short:
      'Stop gain é uma ordem automática de venda que dispara quando o preço sobe até um alvo definido, servindo pra realizar o lucro de uma operação sem depender de acompanhamento constante.',
    body: [
      'O <strong>stop gain</strong> (realizar o ganho) é o espelho do <a href="/glossario/stop-loss">stop loss</a>: uma ordem programada que <strong>vende automaticamente quando o preço sobe até o alvo que você definiu</strong>. Serve pra garantir o lucro planejado sem precisar ficar vigiando a tela, disparando a venda no momento em que o objetivo é atingido.',
      'O papel do stop gain é <strong>disciplinar a ganância</strong>. Assim como o medo faz segurar prejuízo, a ambição faz esperar "subir mais um pouco" até o movimento reverter. Definir o alvo antes de entrar resolve isso de forma mecânica, e por isso o stop gain aparece sempre ao lado do stop loss no <a href="/glossario/day-trade">day trade</a> e no <a href="/glossario/swing-trade">swing trade</a>.',
      'Combinar os dois define de antemão <strong>o risco e o objetivo da operação</strong>. Com stop loss embaixo e stop gain em cima, o operador delimita a perda máxima e o ganho alvo no mesmo instante em que abre a posição, e o que acontecer primeiro é executado automaticamente.',
      '<strong>Exemplo ilustrativo:</strong> quem compra a R$ 40 esperando uma alta pode fixar stop gain em R$ 48, realizando cerca de 20% de lucro assim que o preço encostar nesse nível. Os valores são redondos, só pra mostrar a mecânica.',
      'Ressalva honesta: <strong>o stop gain corta a alta que vem depois dele</strong>. Se o ativo continua subindo após a venda, você fica de fora do ganho adicional, o preço de trocar o potencial ilimitado por um lucro certo e planejado. É uma escolha de disciplina, não uma otimização de retorno.',
    ],
    related: ['stop-loss', 'swing-trade', 'day-trade', 'analise-tecnica', 'volatilidade'],
    backlink: {
      label: 'Entender estratégias de investimento em ações',
      to: '/guias/como-investir-em-acoes',
    },
    faq: [
      {
        q: 'O que é stop gain?',
        a: 'É uma ordem automática de venda que dispara quando o preço atinge um alvo de lucro definido de antemão. Permite realizar o ganho planejado sem depender de acompanhar o mercado o tempo todo.',
      },
      {
        q: 'Vale a pena usar stop gain?',
        a: 'Depende da estratégia. Ele impõe disciplina pra realizar lucro e evita a armadilha de esperar demais, mas também corta a valorização que venha depois. Faz mais sentido em operações de curto e médio prazo com alvo claro do que em investimentos de longo prazo baseados em fundamentos.',
      },
      {
        q: 'Stop gain e stop loss podem ser usados juntos?',
        a: 'Sim, e é o uso mais comum. Com os dois definidos ao abrir a posição, você delimita a perda máxima (stop loss) e o ganho alvo (stop gain) ao mesmo tempo. O que o preço tocar primeiro dispara a venda automaticamente.',
      },
    ],
  },
  {
    slug: 'benchmark',
    term: 'Benchmark',
    letter: 'B',
    short:
      'Benchmark é o índice de referência usado pra medir se um investimento teve bom desempenho, a régua que compara o retorno da sua carteira com o do mercado.',
    body: [
      'O <strong>benchmark</strong> é o <strong>índice de referência</strong> contra o qual se mede o desempenho de um investimento. Sem uma régua, um retorno isolado não diz muita coisa: o benchmark é o que permite dizer se render 12% no ano foi bom ou ruim, comparando com o que o mercado equivalente entregou no mesmo período.',
      'Cada classe de ativo tem seu benchmark natural. Renda variável costuma ser comparada ao <a href="/glossario/ibovespa">Ibovespa</a>, fundos imobiliários ao <a href="/glossario/ifix">IFIX</a>, e renda fixa ao <a href="/glossario/cdi">CDI</a> ou ao <a href="/glossario/ipca">IPCA</a>. Escolher o benchmark certo é o primeiro passo pra uma comparação justa, comparar um fundo de ações ao CDI, por exemplo, não faz sentido.',
      'O conceito também separa <strong>gestão passiva de gestão ativa</strong>. Um <a href="/glossario/etf">ETF</a> tem por objetivo replicar o benchmark; um fundo de gestão ativa cobra pra tentar superá-lo. Avaliar se esse esforço vale a pena é justamente medir, ao longo de vários anos, se o fundo consistentemente bateu seu índice de referência.',
      '<strong>Exemplo ilustrativo:</strong> um fundo de ações que rendeu 15% num ano em que o Ibovespa subiu 20% ficou abaixo do benchmark, apesar do retorno positivo, enquanto um que rendeu 10% num ano de Ibovespa a 5% superou a referência. Os números servem só pra mostrar a lógica da comparação.',
      'Ressalva honesta: <strong>bater o benchmark num único ano diz pouco</strong>. O que importa é a consistência ao longo do tempo, já que qualquer estratégia acerta em alguns períodos e erra em outros. E o benchmark precisa ser adequado à classe de ativo, ou a comparação engana em vez de informar.',
    ],
    related: ['ibovespa', 'ifix', 'cdi', 'etf', 'ipca'],
    backlink: {
      label: 'Ver empresas ranqueadas pelo Redentia Score',
      to: '/ranking/redentia-score',
    },
    faq: [
      {
        q: 'O que é benchmark em investimentos?',
        a: 'É o índice de referência usado pra avaliar o desempenho de uma carteira ou fundo. Ele funciona como uma régua: em vez de olhar o retorno isolado, você compara com o que o mercado equivalente rendeu no mesmo período.',
      },
      {
        q: 'Qual o benchmark de cada tipo de investimento?',
        a: 'Renda variável costuma usar o Ibovespa; fundos imobiliários, o IFIX; renda fixa, o CDI ou o IPCA. Escolher o benchmark adequado à classe do ativo é essencial pra que a comparação faça sentido.',
      },
      {
        q: 'Bater o benchmark é sempre bom?',
        a: 'Superar a referência num período é positivo, mas um ano isolado diz pouco. O que realmente importa é a consistência: um investimento que bate o benchmark ao longo de vários anos é bem mais convincente do que um que acertou uma vez.',
      },
    ],
  },
  {
    slug: 'liquidez-corrente',
    term: 'Liquidez Corrente',
    letter: 'L',
    short:
      'Liquidez corrente é o indicador que mede a capacidade da empresa de pagar suas dívidas de curto prazo com seus ativos de curto prazo, um retrato da saúde financeira imediata.',
    body: [
      'A <strong>liquidez corrente</strong> é um indicador de <strong>saúde financeira de curto prazo</strong>: mostra se a empresa tem ativos suficientes vencendo em até um ano pra cobrir as obrigações que vencem no mesmo período. É uma das primeiras contas da <a href="/glossario/analise-fundamentalista">análise fundamentalista</a> pra checar solvência.',
      'A fórmula é simples: <strong>liquidez corrente = ativo circulante ÷ passivo circulante</strong>. O ativo circulante reúne caixa, contas a receber e estoques; o passivo circulante, as dívidas de curto prazo. Um resultado abaixo de 1 acende alerta (há mais dívida do que ativo de curto prazo), enquanto acima de 1 indica folga pra honrar os compromissos imediatos.',
      'A leitura, porém, é <strong>relativa ao setor</strong>. Varejistas costumam operar com liquidez corrente mais baixa porque giram estoque e caixa muito rápido, ao passo que outros setores mantêm índices mais altos. Comparar a liquidez corrente com a dos pares do mesmo segmento diz muito mais do que o número solto.',
      '<strong>Exemplo ilustrativo:</strong> uma empresa com R$ 500 mil em ativos circulantes e R$ 300 mil em passivos circulantes tem liquidez corrente de 1,67, ou seja, R$ 1,67 de ativo de curto prazo pra cada R$ 1,00 de dívida de curto prazo. Os números são redondos só pra mostrar a conta.',
      'Ressalva honesta: <strong>liquidez corrente altíssima não é necessariamente virtude</strong>. Pode indicar caixa parado ou estoque encalhado gerando pouco retorno. E como inclui estoques (que nem sempre viram dinheiro rápido), muitos analistas complementam com a liquidez seca, que exclui o estoque pra ser mais conservadora.',
    ],
    related: ['analise-fundamentalista', 'divida-liquida-ebitda', 'patrimonio-liquido', 'risco', 'alavancagem'],
    backlink: {
      label: 'Explorar rankings de indicadores das empresas',
      to: '/rankings',
    },
    faq: [
      {
        q: 'O que significa liquidez corrente maior que 1?',
        a: 'Significa que a empresa tem mais ativos de curto prazo do que dívidas de curto prazo, ou seja, folga pra honrar as obrigações que vencem no próximo ano. Abaixo de 1 é um sinal de alerta sobre a capacidade de pagamento imediato.',
      },
      {
        q: 'Qual a diferença entre liquidez corrente e liquidez seca?',
        a: 'A liquidez corrente considera todo o ativo circulante, incluindo estoques. A liquidez seca exclui os estoques, por serem menos garantidos de virar dinheiro rápido, sendo uma medida mais conservadora da capacidade de pagamento de curto prazo.',
      },
      {
        q: 'Liquidez corrente alta é sempre bom?',
        a: 'Nem sempre. Um índice confortável indica solvência de curto prazo, mas valores muito altos podem sinalizar caixa ocioso ou estoque parado rendendo pouco. Como em quase tudo, o ideal é comparar com empresas do mesmo setor.',
      },
    ],
  },
  {
    slug: 'margem-liquida',
    term: 'Margem Líquida',
    letter: 'M',
    short:
      'Margem líquida é o percentual do lucro líquido sobre a receita, o quanto sobra de cada real vendido depois de todos os custos, despesas e impostos.',
    body: [
      'A <strong>margem líquida</strong> mede a <strong>eficiência final da empresa em transformar receita em lucro</strong>. Depois de descontar tudo, custos de produção, despesas operacionais, juros e impostos, ela mostra quanto de cada real faturado realmente sobra pro acionista. É o degrau mais completo da escada de margens.',
      'A conta é <strong>margem líquida = (<a href="/glossario/lucro-liquido">lucro líquido</a> ÷ receita líquida) × 100</strong>. Uma margem de 10% significa que R$ 0,10 de cada real vendido virou lucro. Ela costuma ser lida junto da <a href="/glossario/margem-bruta">margem bruta</a> pra entender onde o dinheiro se perde no caminho entre a venda e o resultado final.',
      'O valor varia enormemente por setor, então <strong>comparação só faz sentido entre pares</strong>. Software e serviços tendem a margens líquidas altas; varejo e commodities operam com margens estruturalmente baixas por natureza do negócio. Mais importante que o nível absoluto costuma ser a tendência: margem crescente indica ganho de eficiência ou de poder de precificação.',
      '<strong>Exemplo ilustrativo:</strong> uma empresa que fatura R$ 100 milhões e reporta R$ 10 milhões de lucro líquido tem margem líquida de 10%; uma varejista pode ter 3% e uma empresa de software 25%, sem que uma seja necessariamente melhor que a outra. Os números são redondos e servem só pra ilustrar as escalas.',
      'Ressalva honesta: <strong>a margem líquida pode ser distorcida por eventos não recorrentes</strong>, como venda de ativos, ganhos ou perdas financeiras e efeitos fiscais pontuais. Por isso ela é frequentemente cruzada com margens operacionais (como a margem <a href="/glossario/ebitda">EBITDA</a>) e com o <a href="/glossario/roe">ROE</a>, pra separar a lucratividade estrutural do resultado do trimestre.',
    ],
    related: ['margem-bruta', 'lucro-liquido', 'roe', 'ebitda', 'psr'],
    backlink: {
      label: 'Ver o ranking de maiores margens líquidas',
      to: '/ranking/maiores-margem-liquida',
    },
    faq: [
      {
        q: 'O que é uma boa margem líquida?',
        a: 'Depende totalmente do setor. Empresas de software podem ter margens de 20% a 40%, enquanto varejistas operam com 2% a 5% de forma saudável. O correto é comparar a margem com a dos pares do mesmo segmento e observar se ela cresce ou encolhe ao longo do tempo.',
      },
      {
        q: 'Qual a diferença entre margem líquida e margem bruta?',
        a: 'A margem bruta considera apenas os custos diretos dos produtos vendidos. A margem líquida desconta tudo: custos, despesas operacionais, juros e impostos. A diferença entre as duas mostra quanto a empresa gasta com operação, financeiro e tributos.',
      },
      {
        q: 'Margem líquida alta significa boa empresa?',
        a: 'É um bom sinal de eficiência e poder de precificação, mas não conta a história toda. Uma empresa pode ter margem alta e crescer pouco, ou margem baixa e giro altíssimo. Margem líquida é um indicador entre vários, e precisa ser lido no contexto do setor e da tendência.',
      },
    ],
  },
  {
    slug: 'margem-bruta',
    term: 'Margem Bruta',
    letter: 'M',
    short:
      'Margem bruta é o percentual do lucro bruto sobre a receita, o quanto sobra depois de descontar apenas os custos diretos de produzir ou vender, antes das demais despesas.',
    body: [
      'A <strong>margem bruta</strong> é o primeiro degrau das margens de rentabilidade: mostra <strong>quanto sobra da receita depois de pagar apenas os custos diretos</strong> dos produtos ou serviços vendidos (o CPV, custo dos produtos vendidos), antes de despesas operacionais, financeiras e impostos. É a medida da eficiência de produção e do poder de preço.',
      'A fórmula é <strong>margem bruta = (lucro bruto ÷ receita líquida) × 100</strong>, sendo o lucro bruto a receita menos o custo direto. Uma margem bruta alta indica que a empresa vende bem acima do que gasta pra produzir, seja por eficiência de custo, seja por poder de precificação, o famoso "pricing power".',
      'Ela é a <strong>base de onde saem todas as outras margens</strong>. É da margem bruta que a empresa banca marketing, pesquisa, administração e expansão, até chegar na <a href="/glossario/margem-liquida">margem líquida</a>. Uma margem bruta gorda dá fôlego pra investir e resistir a competição; uma apertada deixa pouca gordura pra queimar.',
      '<strong>Exemplo ilustrativo:</strong> uma loja que vende R$ 100 em produtos que custaram R$ 60 tem lucro bruto de R$ 40 e margem bruta de 40%. Setores de software chegam a 80% ou mais, supermercados costumam ficar bem abaixo. Os números são redondos, só pra mostrar a conta e o contraste.',
      'Ressalva honesta: <strong>margem bruta alta não garante empresa lucrativa</strong>. Uma companhia pode ter margem bruta excelente e ainda assim dar prejuízo se as despesas operacionais e financeiras consumirem tudo depois. Por isso ela é sempre lida em conjunto com as margens operacional e líquida, nunca isolada.',
    ],
    related: ['margem-liquida', 'lucro-liquido', 'ebitda', 'ebit', 'roe'],
    backlink: {
      label: 'Ver o ranking de maiores margens líquidas',
      to: '/ranking/maiores-margem-liquida',
    },
    faq: [
      {
        q: 'O que a margem bruta mede?',
        a: 'Mede quanto sobra da receita depois de descontar apenas os custos diretos de produzir ou comprar o que foi vendido, antes das demais despesas. É um indicador de eficiência de produção e de poder de precificação da empresa.',
      },
      {
        q: 'Qual a diferença entre margem bruta e margem líquida?',
        a: 'A margem bruta desconta só o custo direto dos produtos vendidos. A margem líquida desconta tudo: custos, despesas operacionais, juros e impostos. A margem bruta é o ponto de partida; a líquida é o resultado final que chega ao acionista.',
      },
      {
        q: 'Margem bruta alta é bom sinal?',
        a: 'Geralmente indica eficiência de custo ou poder de precificação, o que é positivo. Mas não basta: uma empresa com margem bruta alta pode ter prejuízo se as demais despesas forem pesadas. Ela precisa ser analisada junto das margens operacional e líquida.',
      },
    ],
  },
  {
    slug: 'valor-mercado',
    term: 'Valor de Mercado',
    letter: 'V',
    short:
      'Valor de mercado (market cap) é o valor total das ações de uma empresa, calculado multiplicando o preço da ação pelo número total de ações em circulação.',
    body: [
      'O <strong>valor de mercado</strong>, ou <strong>market cap</strong>, é <strong>quanto a empresa inteira vale segundo a bolsa</strong>. A conta é direta: preço da ação multiplicado pelo número total de ações. É o número que define, na prática, o "tamanho" de uma companhia listada e o seu peso em índices como o <a href="/glossario/ibovespa">Ibovespa</a>.',
      'É esse indicador que separa as categorias de porte: <strong><a href="/glossario/blue-chips">blue chips</a></strong> de valor de mercado altíssimo e <strong><a href="/glossario/small-caps">small caps</a></strong> de capitalização pequena estão nos extremos da mesma régua. O porte influencia liquidez, atenção de analistas e o quanto o preço já reflete o consenso do mercado.',
      'Vale separar duas coisas: <strong>valor de mercado não é o valor "real" ou contábil da empresa</strong>. Ele é a opinião do mercado sobre ela num dado momento, e pode estar otimista ou pessimista frente ao <a href="/glossario/patrimonio-liquido">patrimônio líquido</a> registrado no balanço, diferença que aparece em múltiplos como o <a href="/glossario/p-vp">P/VP</a>.',
      '<strong>Exemplo ilustrativo:</strong> uma empresa com 1 bilhão de ações negociadas a R$ 25 cada tem valor de mercado de R$ 25 bilhões. Se o preço sobe pra R$ 30, o valor de mercado vira R$ 30 bilhões, sem que nada tenha mudado no número de ações. Os valores são redondos, só pra ilustrar a fórmula.',
      'Ressalva honesta: <strong>o valor de mercado só considera as ações</strong>, não a dívida. Pra saber quanto custaria de fato comprar a empresa inteira, é preciso ir ao <a href="/glossario/enterprise-value">enterprise value</a>, que soma a dívida e subtrai o caixa. Comparar empresas só pelo market cap ignora estruturas de capital muito diferentes.',
    ],
    related: ['enterprise-value', 'blue-chips', 'small-caps', 'p-vp', 'free-float'],
    backlink: {
      label: 'Ver o ranking de maiores valores de mercado',
      to: '/ranking/maiores-valor-mercado',
    },
    faq: [
      {
        q: 'Como se calcula o valor de mercado?',
        a: 'Multiplicando o preço atual da ação pelo número total de ações da empresa. Como o preço muda todo dia, o valor de mercado também oscila continuamente, mesmo sem alteração no número de ações.',
      },
      {
        q: 'Valor de mercado é o valor real da empresa?',
        a: 'Não. É quanto o mercado acha que a empresa vale naquele momento, o que pode divergir bastante do valor contábil (patrimônio líquido) e do preço que um comprador pagaria pelo negócio inteiro. Reflete expectativa, não um valor definitivo.',
      },
      {
        q: 'Qual a diferença entre valor de mercado e enterprise value?',
        a: 'O valor de mercado considera apenas as ações. O enterprise value soma a dívida e subtrai o caixa, mostrando o custo total de adquirir a empresa. Por isso o enterprise value é mais adequado pra comparar companhias com níveis de endividamento diferentes.',
      },
    ],
  },
  {
    slug: 'enterprise-value',
    term: 'Enterprise Value',
    letter: 'E',
    short:
      'Enterprise Value (EV), ou valor da firma, é o custo total de comprar uma empresa inteira: o valor de mercado das ações mais a dívida, menos o caixa.',
    body: [
      'O <strong>Enterprise Value</strong> (EV), ou <strong>valor da firma</strong>, responde a uma pergunta mais completa que o <a href="/glossario/valor-mercado">valor de mercado</a>: <strong>quanto custaria comprar a empresa inteira</strong>, assumindo suas dívidas e ficando com seu caixa. É a medida de referência em fusões, aquisições e nos múltiplos de valuation baseados em capital total.',
      'A fórmula é <strong>EV = valor de mercado + dívida total − caixa</strong>. Soma-se a dívida porque quem compra a empresa herda suas obrigações; subtrai-se o caixa porque esse dinheiro passa a ser do comprador, abatendo o custo efetivo da aquisição. O resultado é o preço "de dono", não só o das ações.',
      'É por isso que o EV é a base dos múltiplos que <strong>comparam empresas com endividamentos diferentes</strong>, como o <a href="/glossario/ev-ebitda">EV/EBITDA</a> e o <a href="/glossario/ev-ebit">EV/EBIT</a>. Enquanto o <a href="/glossario/p-l">P/L</a> ignora a estrutura de capital, o EV a incorpora, tornando a comparação entre uma companhia muito alavancada e outra sem dívida mais justa.',
      '<strong>Exemplo ilustrativo:</strong> uma empresa avaliada em R$ 100 bilhões em ações, com R$ 20 bilhões de dívida e R$ 5 bilhões em caixa, tem EV de R$ 115 bilhões (100 + 20 − 5). Os números são redondos, apenas pra demonstrar o cálculo.',
      'Ressalva honesta: <strong>EV depende de dados de balanço que ficam defasados</strong> entre uma divulgação de resultados e outra, e a dívida pode mudar rápido. Em casos raros o EV chega a ficar negativo (caixa maior que valor de mercado mais dívida), o que pode ser oportunidade ou sinal de problema, nunca um número pra interpretar sozinho.',
    ],
    related: ['valor-mercado', 'ev-ebitda', 'ev-ebit', 'divida-liquida-ebitda', 'ebitda'],
    backlink: {
      label: 'Explorar rankings e múltiplos das empresas',
      to: '/rankings',
    },
    faq: [
      {
        q: 'O que é Enterprise Value?',
        a: 'É o valor total de uma empresa considerando não só suas ações, mas também sua dívida e seu caixa. Representa quanto custaria, na prática, comprar o negócio inteiro assumindo as dívidas e ficando com o caixa.',
      },
      {
        q: 'Por que somar dívida e subtrair caixa no EV?',
        a: 'Soma-se a dívida porque o comprador da empresa passa a ser responsável por ela. Subtrai-se o caixa porque esse dinheiro fica com o comprador, reduzindo o custo líquido da aquisição. O resultado é o preço efetivo de adquirir a companhia.',
      },
      {
        q: 'Qual a diferença entre EV e valor de mercado?',
        a: 'O valor de mercado considera apenas as ações. O Enterprise Value acrescenta a dívida e desconta o caixa, refletindo o custo total do negócio. Por isso o EV é mais adequado pra comparar empresas com diferentes níveis de endividamento, especialmente em múltiplos como o EV/EBITDA.',
      },
    ],
  },
  {
    slug: 'cap-rate',
    term: 'Cap Rate',
    letter: 'C',
    short:
      'Cap rate (taxa de capitalização) é a relação entre a renda anual de um imóvel e seu valor, indicando o retorno potencial de um investimento imobiliário ou de um FII de tijolo.',
    body: [
      'O <strong>cap rate</strong>, abreviação de capitalization rate (taxa de capitalização), mede o <strong>retorno anual de um imóvel em relação ao seu valor</strong>. É um dos indicadores centrais pra avaliar investimentos imobiliários diretos e <a href="/glossario/fundos-tijolo">fundos de tijolo</a>, funcionando como um primo do <a href="/glossario/dividend-yield">dividend yield</a> aplicado à propriedade em si.',
      'A conta é <strong>cap rate = (renda anual de aluguéis ÷ valor do imóvel) × 100</strong>, idealmente usando o <a href="/glossario/noi">NOI</a> (a renda operacional líquida) no numerador pra ficar mais preciso. Quanto maior o cap rate, maior o retorno relativo, mas, assim como no dividend yield, um número alto pode refletir mais retorno ou mais risco embutido.',
      'Na análise de <a href="/glossario/fii">FIIs</a>, o cap rate ajuda a comparar imóveis e a julgar se uma aquisição feita pelo fundo foi cara ou barata. A diferença pro dividend yield é o foco: o cap rate olha pra <strong>propriedade e sua geração de renda</strong>, enquanto o dividend yield olha pro preço da cota negociada em bolsa.',
      '<strong>Exemplo ilustrativo:</strong> um galpão logístico avaliado em R$ 50 milhões que gera R$ 4 milhões por ano de aluguel tem cap rate de 8% (4 ÷ 50). Os valores são redondos, só pra demonstrar a fórmula, não representam nenhum imóvel real.',
      'Ressalva honesta: <strong>cap rate alto não é automaticamente bom</strong>. Ele pode sinalizar imóvel em região menos valorizada, contratos frágeis, risco de <a href="/glossario/vacancia">vacância</a> ou inquilino de menor qualidade. O contexto (localização, tipo de contrato, perfil do locatário) importa tanto quanto o número.',
    ],
    related: ['fii', 'noi', 'dividend-yield', 'vacancia', 'fundos-tijolo'],
    backlink: {
      label: 'Explorar o ranking de fundos imobiliários',
      to: '/rankings?classe=fiis',
    },
    faq: [
      {
        q: 'O que é cap rate?',
        a: 'É a taxa de capitalização, a relação entre a renda anual gerada por um imóvel e o valor desse imóvel. Indica o retorno potencial do investimento imobiliário e é muito usada pra avaliar FIIs de tijolo.',
      },
      {
        q: 'Qual a diferença entre cap rate e dividend yield?',
        a: 'O cap rate mede o retorno da propriedade em relação ao valor do imóvel. O dividend yield mede o retorno em proventos em relação ao preço da cota negociada em bolsa. Um foca no ativo imobiliário; o outro, no papel do fundo.',
      },
      {
        q: 'Cap rate alto é sempre melhor?',
        a: 'Não necessariamente. Um cap rate elevado pode significar retorno atrativo, mas também pode refletir maior risco: região menos nobre, contratos curtos, risco de vacância ou inquilino frágil. É preciso avaliar o contexto, não só o número.',
      },
    ],
  },
  {
    slug: 'noi',
    term: 'NOI',
    letter: 'N',
    short:
      'NOI (Net Operating Income) é a receita operacional líquida de um imóvel: a renda de aluguéis menos as despesas operacionais, antes de impostos, financiamento e depreciação.',
    body: [
      'O <strong>NOI</strong>, sigla de <strong>Net Operating Income</strong> (receita operacional líquida), mostra <strong>quanto um imóvel realmente gera de caixa operacional</strong>. É a renda de aluguéis menos as despesas necessárias pra manter a propriedade funcionando, e é o conceito fundamental por trás da avaliação de <a href="/glossario/fundos-tijolo">fundos de tijolo</a> e imóveis de renda.',
      'A fórmula é <strong>NOI = receita de aluguéis − despesas operacionais</strong>. Entram como despesas a manutenção, seguros, IPTU e taxas de administração. Ficam de fora, propositalmente, itens que não são caixa operacional: <strong>depreciação, juros de financiamento, imposto de renda e grandes reformas (capex)</strong>. Isso isola a capacidade pura do imóvel de gerar renda.',
      'O NOI é o número que alimenta o <a href="/glossario/cap-rate">cap rate</a> e permite comparar propriedades de forma justa, independentemente de como cada uma foi financiada. Um <strong>NOI crescente</strong> é um sinal saudável: indica que o imóvel consegue reajustar aluguéis, reduzir vacância ou controlar despesas ao longo do tempo.',
      '<strong>Exemplo ilustrativo:</strong> um imóvel que recebe R$ 500 mil por ano de aluguel e tem R$ 100 mil de despesas operacionais tem NOI de R$ 400 mil. Os números são redondos, servem só pra mostrar a conta.',
      'Ressalva honesta: <strong>o NOI ignora de propósito custos reais que o dono paga</strong>, como juros de dívida e reformas grandes. Ele mede a operação do imóvel, não o resultado final do investidor. Por isso é uma peça da análise de <a href="/glossario/fii">FIIs</a>, sempre lida junto de vacância, endividamento e qualidade dos contratos.',
    ],
    related: ['cap-rate', 'fii', 'fundos-tijolo', 'vacancia', 'dividend-yield'],
    backlink: {
      label: 'Explorar o ranking de fundos imobiliários',
      to: '/rankings?classe=fiis',
    },
    faq: [
      {
        q: 'O que é NOI em fundos imobiliários?',
        a: 'NOI é a receita operacional líquida de um imóvel: a renda de aluguéis menos as despesas necessárias pra operá-lo (manutenção, seguros, IPTU, administração). Mostra quanto o imóvel gera de caixa antes de financiamento, impostos e reformas.',
      },
      {
        q: 'O que entra e o que não entra no cálculo do NOI?',
        a: 'Entram a receita de aluguéis e as despesas operacionais do imóvel. Não entram depreciação, juros de financiamento, imposto de renda e capex (reformas grandes), justamente pra medir só a geração de caixa operacional da propriedade.',
      },
      {
        q: 'Qual a relação entre NOI e cap rate?',
        a: 'O NOI é o numerador do cap rate. Dividindo o NOI pelo valor do imóvel, chega-se à taxa de capitalização, que expressa o retorno operacional anual em relação ao preço do ativo.',
      },
    ],
  },
  {
    slug: 'come-cotas',
    term: 'Come-Cotas',
    letter: 'C',
    short:
      'Come-cotas é a antecipação semestral de imposto de renda em alguns fundos de investimento, que reduz automaticamente a quantidade de cotas do investidor sem que ele precise resgatar.',
    body: [
      'O <strong>come-cotas</strong> é uma forma de <strong>antecipação semestral do imposto de renda</strong> cobrada em determinados fundos de investimento. No último dia útil de maio e de novembro, a Receita "come" uma parte das suas cotas pra adiantar o IR que incidiria sobre o rendimento, sem que você precise vender ou resgatar nada.',
      'A alíquota segue a tabela do fundo: <strong>15% pros fundos de longo prazo e 20% pros de curto prazo</strong>, aplicada sobre o rendimento acumulado no período. O mecanismo reduz o número de cotas que você tem, mas não o valor de cada cota, então o efeito é adiantar imposto, não confiscar patrimônio.',
      'O ponto prático mais importante: <strong>FIIs não sofrem come-cotas</strong>. Fundos de renda fixa, multimercado e de ações abertos costumam estar sujeitos ao mecanismo, mas os <a href="/glossario/fii">fundos imobiliários</a> ficam de fora, o que preserva melhor o efeito dos <a href="/glossario/proventos">proventos</a> compostos ao longo do tempo. É uma das vantagens estruturais dos FIIs.',
      '<strong>Exemplo ilustrativo:</strong> um investidor com R$ 10 mil num fundo de longo prazo que rendeu R$ 500 no semestre teria cerca de R$ 75 (15% de R$ 500) antecipados em come-cotas, reduzindo a quantidade de cotas nesse valor. Os números são redondos, só pra mostrar a mecânica.',
      'Ressalva honesta: <strong>o come-cotas não cria imposto novo, mas antecipa o pagamento</strong>, e isso tem custo. Adiantar o IR reduz o montante que segue rendendo no fundo, prejudicando um pouco o efeito dos juros compostos frente a produtos que só tributam no resgate. Não é perda de dinheiro, mas é perda de eficiência.',
    ],
    related: ['fii', 'tesouro-direto', 'cdb', 'proventos', 'fundos-papel'],
    backlink: {
      label: 'Explorar fundos imobiliários, isentos de come-cotas',
      to: '/rankings?classe=fiis',
    },
    faq: [
      {
        q: 'Como funciona o come-cotas?',
        a: 'Nos últimos dias úteis de maio e novembro, a Receita antecipa parte do imposto de renda de certos fundos reduzindo automaticamente o número de cotas do investidor. A alíquota é de 15% pra fundos de longo prazo e 20% pra curto prazo, sobre o rendimento do período.',
      },
      {
        q: 'FII tem come-cotas?',
        a: 'Não. Fundos imobiliários são isentos de come-cotas, ao contrário de fundos de renda fixa, multimercado e de ações abertos. Essa é uma das vantagens estruturais dos FIIs, já que preserva melhor o efeito dos rendimentos compostos.',
      },
      {
        q: 'O come-cotas faz eu perder dinheiro?',
        a: 'Não diretamente: ele antecipa um imposto que você pagaria de qualquer forma no resgate, sem reduzir o valor da cota. O custo é de eficiência, porque adiantar o IR diminui o montante que segue rendendo, enfraquecendo um pouco os juros compostos frente a produtos tributados só na saída.',
      },
    ],
  },
]
