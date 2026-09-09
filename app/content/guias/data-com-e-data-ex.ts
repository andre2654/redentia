/**
 * Guia: Data com e data ex (tag Dividendos).
 *
 * LACUNA QUE ELE FECHA. O site recebe demanda constante pela MECÂNICA do
 * calendário do provento e não tinha superfície nenhuma que a explicasse (o
 * glossário tem 80 verbetes e não traz "data com" nem "data ex"). Medido no
 * Search Console, 90 dias encerrados em 06/09/2026, propriedade de domínio:
 * "paga dividendos" 864 impressões e 1 clique; "quando" (quando a X paga) 345
 * impressões e ZERO clique; "data com" 293 impressões e 1 clique; "calendário"
 * 79 impressões. Posição média entre 9 e 11: o site aparece e não converte.
 * Dentro do bloco há intenção conceitual vestida de ticker ("ambev paga
 * dividendos quantas vezes por ano", "abev3 paga dividendos mensais").
 *
 * ESCOPO DELIBERADO, o que ele NÃO invade:
 *   - /dividendos/{ticker}: a página programática fica com o termo de TICKER
 *     ("data com vale3 2026"). Este guia não cita data, ticker nem valor de
 *     provento, e manda para a busca quando a pergunta for sobre um papel.
 *     Mesma cessão do precedente da Calculadora de Dividendos.
 *   - imposto-sobre-dividendos: a TRIBUTAÇÃO (limite mensal, efeito degrau,
 *     alíquota de JCP, regime do FII). Aqui só se diz que o nome do provento
 *     muda o que chega líquido, e aponta para lá.
 *   - acoes-fiis-dividendos-todo-mes: a ESTRATÉGIA de escada de proventos;
 *     calculadora-de-dividendos: a conta de aporte para uma META;
 *     melhores-fiis-2026: escolha de fundo, segmentos e indicadores de FII.
 *
 * CONTEÚDO HONESTO: nenhuma cotação, dividend yield, rentabilidade, média
 * setorial ou ticker rotulado de caro ou barato. Os únicos números são
 * ESTRUTURAIS e de fonte primária, conferidos em 09/09/2026: as 4 datas de um
 * provento; o prazo de 60 dias e "dentro do exercício social" da Lei 6.404/76,
 * art. 205, §3º (texto lido no Planalto, com a ressalva "salvo deliberação em
 * contrário da assembleia-geral" que o próprio parágrafo traz); os 95% do lucro
 * caixa em balanço semestral de 30/06 e 31/12 da Lei 9.779/99, art. 10,
 * parágrafo único (idem); e o ciclo D+2 da B3, com a ressalva de que a migração
 * para D+1 está anunciada e ainda não vigora. A regra de direito ao provento
 * (fixado no fechamento da data com, por data de negociação, preservado se o
 * ativo for vendido na data ex) foi conferida contra o glossário da B3 e o
 * Investidor10; fonte secundária que dizia o contrário sobre a venda na data ex
 * foi descartada.
 *
 * HTML dos blocos é local e confiável: só <strong> e <a href> internos.
 */
import type { GuideDoc } from '~/types/guias'

export const DATA_COM_E_DATA_EX_GUIDE: GuideDoc = {
  slug: 'data-com-e-data-ex',
  tag: 'Dividendos',
  title: 'Data com e data ex: quando o dividendo passa a ser seu',
  dek: 'O provento não é de quem tem a ação no dia do pagamento, é de quem tinha no fechamento da data com. Entenda as quatro datas, por que o preço cai no dia seguinte e por que isso não é prejuízo.',
  description:
    'Data com e data ex explicadas: as quatro datas de um provento, até quando comprar para receber, por que a ação cai na data ex, quanto tempo até o dinheiro cair na conta e quantas vezes por ano cada ativo paga. Guia claro e honesto da Redentia.',
  summary:
    'Quem compra no dia do pagamento não recebe nada. O direito ao provento é decidido semanas antes, no fechamento da data com, e a queda no preço do dia seguinte assusta quem não sabe que ela é aritmética, não notícia ruim.',
  minutes: 10,
  author: 'Equipe Redentia',
  datePublished: '2026-09-09',
  dateModified: '2026-09-09',
  updatedLine: 'Atualizado em 9 set 2026 · 10 min de leitura',
  updatedShort: 'atualizado em set 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'As quatro datas de um provento',
      blocks: [
        {
          kind: 'p',
          html: 'A pergunta mais comum de quem começa a investir pensando em renda é "quando cai o dinheiro?". A resposta é menos importante do que parece, porque a data que decide se você <strong>tem direito</strong> ao <a href="/glossario/proventos">provento</a> não é a data do pagamento. É outra, bem anterior, e quem descobre isso depois costuma descobrir do jeito caro.',
        },
        {
          kind: 'p',
          html: 'Todo provento anunciado no Brasil, seja <a href="/glossario/dividendos">dividendo</a> de ação, <a href="/glossario/jscp">juros sobre capital próprio</a> ou rendimento de <a href="/glossario/fii">fundo imobiliário</a>, percorre a mesma sequência de quatro datas. Elas aparecem juntas no comunicado, e confundir uma com a outra é o erro de calendário mais frequente da bolsa.',
        },
        {
          kind: 'steps',
          items: [
            '<strong>Data do anúncio.</strong> O dia em que a companhia ou o gestor divulga o fato relevante ou o aviso aos acionistas informando que vai distribuir. É aqui que as outras três datas são definidas e publicadas.',
            '<strong>Data com.</strong> O último pregão em que comprar o ativo ainda dá direito ao provento anunciado. Quem está posicionado no fechamento desse dia recebe.',
            '<strong>Data ex.</strong> O pregão seguinte à data com. A partir dele o ativo passa a ser negociado <strong>sem</strong> o direito àquele provento, e quem comprar nesse dia não recebe.',
            '<strong>Data de pagamento.</strong> O dia em que o valor efetivamente cai na conta da corretora. Pode ser dias, semanas ou meses depois da data com, e não muda em nada quem tem direito.',
          ],
        },
        {
          kind: 'stats',
          items: [
            { value: '4', label: 'datas em todo anúncio de provento' },
            { value: '1', label: 'delas decide se você recebe: a data com' },
            { value: '0', label: 'relação entre data de pagamento e direito' },
          ],
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'Data com e data ex: o único dia que decide',
      blocks: [
        {
          kind: 'p',
          html: 'A regra cabe em uma frase: <strong>o direito ao provento é congelado no fechamento do pregão da data com</strong>. Quem tinha o ativo em custódia naquele instante entra na lista de quem recebe, e a lista não muda depois.',
        },
        {
          kind: 'p',
          html: 'Isso produz duas consequências que parecem contraintuitivas e são as duas verdadeiras. A primeira: <strong>comprar no próprio dia da data com dá direito ao provento</strong>. Não é preciso ter o ativo há semanas, nem há um dia. Basta comprar durante aquele pregão e carregar até o fechamento.',
        },
        {
          kind: 'p',
          html: 'A segunda: <strong>vender na data ex não faz você perder o provento</strong>. Se você estava posicionado no fechamento da data com, o direito já é seu. Pode vender na abertura do dia seguinte que o dinheiro cai na sua conta na data de pagamento, mesmo que a essa altura o ativo já não esteja mais na sua carteira.',
        },
        {
          kind: 'p',
          html: 'Vale uma nota técnica que confunde muita gente. A <a href="/glossario/b3">B3</a> liquida operações de renda variável em D+2, ou seja, a troca de titularidade se completa dois dias úteis depois do negócio. Mas o direito ao provento é apurado pela <strong>data da negociação</strong>, não pela data da liquidação. Por isso comprar na data com funciona, mesmo que a liquidação daquela compra só ocorra depois da data ex. A B3 tem projeto anunciado de encurtar esse ciclo para D+1, ainda não vigente, e a mudança não altera o critério de direito, que continua sendo o pregão da data com.',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'Por que o preço cai na data ex (e por que não é prejuízo)',
      blocks: [
        {
          kind: 'p',
          html: 'Na abertura da data ex, o ativo costuma aparecer mais barato. Quem não sabe o motivo abre o home broker, vê vermelho e acha que aconteceu alguma coisa ruim com a empresa. Não aconteceu nada. É aritmética.',
        },
        {
          kind: 'p',
          html: 'Até o fechamento da data com, o preço embutia duas coisas: o valor do negócio e o direito a receber aquele provento específico. Na data ex o segundo componente sai, porque quem compra ali não leva mais o provento junto. O preço de referência é ajustado para baixo na proporção do valor distribuído. O mercado então negocia normalmente a partir daí, e o fechamento do dia pode ficar acima ou abaixo desse ponto de partida por qualquer motivo, como em qualquer outro pregão.',
        },
        {
          kind: 'p',
          html: 'Para quem já era dono, a conta fecha: o que saiu do preço da cota ou da ação vai chegar como dinheiro na data de pagamento. O patrimônio não encolheu, ele mudou de forma. Quem ignora isso comete dois erros de leitura. O primeiro é achar que perdeu dinheiro em um dia que apenas transferiu valor de uma coluna para outra.',
        },
        {
          kind: 'p',
          html: 'O segundo é mais caro e aparece em quem acompanha desempenho: comparar o preço de antes com o de depois da data ex e concluir que o ativo caiu. Para medir retorno de verdade é preciso <strong>somar o provento de volta</strong>, porque a queda do dia ex foi você recebendo, não você perdendo. Esse cuidado importa especialmente em <a href="/guias/melhores-fiis-2026">fundos imobiliários</a>, que distribuem com frequência alta e portanto acumulam muitos desses degraus ao longo do ano.',
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'Quanto tempo até o dinheiro cair na conta',
      blocks: [
        {
          kind: 'p',
          html: 'Aqui a resposta honesta é: depende, e o intervalo é maior do que a maioria imagina. Não existe prazo padrão de mercado entre a data com e a data de pagamento. Existe um limite legal, e ele é largo.',
        },
        {
          kind: 'p',
          html: 'A Lei das Sociedades por Ações determina que o dividendo seja pago, <strong>salvo deliberação em contrário da assembleia-geral</strong>, no prazo de 60 dias da data em que for declarado e, em qualquer caso, dentro do exercício social. Repare nas duas válvulas de escape: a assembleia pode decidir outro prazo, e o limite de fundo é o fim do exercício. É exatamente por isso que uma companhia consegue anunciar em um mês, fixar a data com logo em seguida e só pagar meses depois, às vezes no ano seguinte, sem descumprir nada.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>O direito não expira enquanto você espera.</strong> Entre a data com e o pagamento você pode vender o ativo inteiro. O crédito continua programado para o seu CPF.',
            '<strong>O valor anunciado é bruto.</strong> O que cai na conta pode vir com retenção na fonte dependendo do tipo de provento, e é isso que separa dividendo de JCP na prática. O tema é do <a href="/guias/imposto-sobre-dividendos">guia de imposto sobre dividendos</a>.',
            '<strong>A data de pagamento pode mudar.</strong> Ela é definida em ato societário e pode ser alterada por outro ato societário. A data com, uma vez transcorrida, não muda mais.',
            '<strong>Anúncio não é garantia de valor final.</strong> Até a aprovação em assembleia, um valor proposto ainda pode ser ajustado. Acompanhe os comunicados da companhia, não só a primeira manchete.',
          ],
        },
      ],
    },
    {
      id: 'sec-5',
      title: 'Quantas vezes por ano cada ativo paga',
      blocks: [
        {
          kind: 'p',
          html: 'Esta é a pergunta por trás de metade das buscas do tipo "empresa X paga dividendos mensais". A resposta curta: <strong>ação brasileira quase nunca paga todo mês, e fundo imobiliário quase sempre paga</strong>. Os dois casos têm explicação estrutural, e nenhuma delas é uma promessa.',
        },
        {
          kind: 'p',
          html: '<strong>Ações.</strong> A frequência é decisão da companhia, dentro do que o estatuto e a lei permitem. Existe distribuição anual, semestral, trimestral e, em alguns casos, mensal ou intercalar. O que costuma ser obrigatório é o dividendo mínimo previsto em estatuto sobre o lucro do exercício, não a periodicidade com que ele é fatiado. Uma empresa que pagou quatro vezes no ano passado não deve nada a você este ano se não houver lucro para distribuir.',
        },
        {
          kind: 'p',
          html: '<strong>Fundos imobiliários.</strong> Aqui existe uma amarra legal, e ela é a razão da fama de renda mensal. Para manter o tratamento tributário do regime, o fundo precisa distribuir no mínimo 95% dos lucros apurados pelo regime de caixa, com base em balanço ou balancete semestral encerrado em 30 de junho e 31 de dezembro de cada ano. Ou seja: a lei obriga o acerto de contas <strong>duas vezes por ano</strong>. Pagar todo mês é convenção de mercado adotada pela maioria dos fundos, não obrigação legal, e o valor mensal pode variar ou ser suspenso.',
        },
        {
          kind: 'p',
          html: '<strong>ETFs.</strong> Muitos <a href="/glossario/etf">fundos de índice</a> brasileiros não distribuem: reinvestem os proventos recebidos dentro do próprio fundo, e o retorno aparece na cota em vez de cair na conta. Existem ETFs com política de distribuição, mas ela precisa ser verificada no regulamento de cada um, e o assunto está no <a href="/guias/como-investir-em-etf">guia de ETFs</a>.',
        },
      ],
    },
    {
      id: 'sec-6',
      title: 'Quatro nomes de provento, quatro calendários',
      blocks: [
        {
          kind: 'p',
          html: 'O comunicado nem sempre diz "dividendo". Cada tipo de provento tem lógica própria de anúncio, e tratar todos como a mesma coisa distorce a leitura do calendário e do valor.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Dividendo.</strong> Parcela do lucro distribuída aos acionistas. É o caso clássico das quatro datas descritas aqui, e o valor anunciado por ação é o que serve de referência para o ajuste da data ex.',
            '<strong>Juros sobre capital próprio.</strong> Distribuição com natureza contábil diferente, que existe porque é dedutível para a empresa. Segue as mesmas quatro datas, mas sofre retenção na fonte, então o valor anunciado e o valor creditado não coincidem. Comparar o anúncio de JCP com o de dividendo sem considerar isso superestima o primeiro.',
            '<strong>Rendimento de FII.</strong> Distribuição periódica do resultado de caixa do fundo. A data com costuma ser fixada em regra do regulamento, o que dá a esses fundos um calendário mais previsível que o de ações, ainda que o valor não seja.',
            '<strong>Amortização de cotas.</strong> Aparece em fundos e não é renda: é devolução de parte do capital investido. Cai na conta como qualquer provento, mas reduz o valor patrimonial da cota e tem efeito próprio no custo de aquisição. Ler amortização como se fosse rendimento infla o retorno que você acha que teve.',
          ],
        },
        {
          kind: 'p',
          html: 'Dois eventos vizinhos completam a confusão e não são provento nenhum: <a href="/glossario/bonificacao">bonificação</a> entrega novas ações em vez de dinheiro, e <a href="/glossario/desdobramento">desdobramento</a> apenas divide as ações existentes em mais unidades. Ambos também têm data com e ajustam o preço, mas nenhum dos dois deposita reais na sua conta.',
        },
      ],
    },
    {
      id: 'sec-7',
      title: 'Onde achar a data com, e os erros que custam dinheiro',
      blocks: [
        {
          kind: 'p',
          html: 'A fonte primária é sempre a companhia ou o gestor: o fato relevante, o aviso aos acionistas ou o comunicado ao mercado, publicados na área de relações com investidores e no sistema da CVM. Portais financeiros e a página do ativo agregam essa informação e servem para consultar rápido, mas em caso de divergência o documento oficial é que vale. Na Redentia, o histórico de proventos com os valores e as datas de cada pagamento fica na página de dividendos de cada ativo, alcançável pela <a href="/busca">busca por ticker</a>, e as divulgações recentes aparecem nas <a href="/noticias">notícias</a>.',
        },
        {
          kind: 'p',
          html: 'Com o calendário entendido, os erros clássicos ficam evidentes:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Comprar depois da data com esperando receber.</strong> É o erro literal da pergunta "comprei ontem, recebo?". Se ontem já era a data ex, não.',
            '<strong>Vender antes do fechamento da data com.</strong> Sair no meio do pregão da data com custa o provento inteiro. O que conta é a posição no fechamento.',
            '<strong>Comprar só para pegar o provento.</strong> A queda da data ex devolve ao preço, em média, o que o provento paga. Comprar na véspera e vender depois não é lucro garantido, é uma aposta na variação do dia, com custos e imposto sobre ganho de capital pelo caminho.',
            '<strong>Ler queda da data ex como notícia ruim.</strong> Vale para o seu próprio acompanhamento e para qualquer ranking ou gráfico que não some os proventos de volta.',
            '<strong>Confundir anúncio com pagamento.</strong> Um provento anunciado em dezembro pode ser creditado no ano seguinte, e é a data de aprovação, não a do crédito, que costuma definir o tratamento aplicável.',
          ],
        },
        {
          kind: 'p',
          html: 'Nada disso ajuda a escolher <strong>o que</strong> comprar, e não deveria. Calendário é execução, não tese. Para decidir se a empresa merece o seu dinheiro, o caminho é o guia de <a href="/guias/como-analisar-uma-acao">como analisar uma ação</a>; para transformar proventos em renda ao longo do ano, o de <a href="/guias/acoes-fiis-dividendos-todo-mes">dividendos todo mês</a>; e para dimensionar quanto seria preciso aportar, a <a href="/guias/calculadora-de-dividendos">calculadora de dividendos</a>.',
        },
      ],
    },
  ],
  cta: {
    title: 'Veja o histórico de proventos de qualquer ativo da B3',
    subtitle: 'Busque o ticker e abra a página de dividendos, com valor e datas de cada pagamento',
    to: '/busca',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'O que é data com e o que é data ex?',
      a: 'Data com é o último pregão em que ter o ativo dá direito ao provento anunciado. Data ex é o pregão seguinte, a partir do qual o ativo passa a ser negociado sem esse direito. Quem estava posicionado no fechamento da data com recebe, e quem comprar na data ex não recebe aquele provento.',
    },
    {
      q: 'Se eu comprar a ação no próprio dia da data com, eu recebo o dividendo?',
      a: 'Sim. Basta comprar durante o pregão da data com e continuar com o ativo no fechamento. Não existe prazo mínimo de permanência antes disso. Vale notar que o direito é apurado pela data da negociação, e não pela data da liquidação, que na B3 ocorre em D+2 para renda variável.',
    },
    {
      q: 'Se eu vender na data ex, perco o dividendo?',
      a: 'Não. O direito é congelado no fechamento da data com, e vender no dia seguinte ou em qualquer dia depois não o desfaz. O valor será creditado na data de pagamento mesmo que o ativo já não esteja mais na sua carteira.',
    },
    {
      q: 'Por que a ação cai no dia em que fica ex?',
      a: 'Porque o preço deixa de embutir o direito ao provento que estava anunciado. O preço de referência é ajustado para baixo na proporção do valor distribuído, e a partir daí o ativo negocia normalmente. Para quem já era dono não há perda: o valor que saiu do preço chega como dinheiro na data de pagamento. Por isso comparações de desempenho precisam somar os proventos de volta.',
    },
    {
      q: 'Quanto tempo depois da data com o dinheiro cai na conta?',
      a: 'Não há prazo padrão. A regra geral da Lei das S.A. é que o dividendo seja pago em até 60 dias da declaração e, em qualquer caso, dentro do exercício social, salvo deliberação em contrário da assembleia-geral. Essa ressalva é o que permite pagamentos meses depois do anúncio. A data exata sempre consta do comunicado da companhia.',
    },
    {
      q: 'Existe ação que paga dividendos todo mês?',
      a: 'É raro no Brasil. A frequência é decisão da companhia dentro do estatuto e da lei, e o padrão vai de anual a trimestral, com casos intercalares. O que costuma ser obrigatório é o dividendo mínimo sobre o lucro do exercício, não a periodicidade. Renda mensal recorrente é característica típica de fundos imobiliários, não de ações.',
    },
    {
      q: 'Por que fundo imobiliário paga todo mês?',
      a: 'Por convenção de mercado, não por obrigação de periodicidade. A lei exige que o fundo distribua no mínimo 95% dos lucros apurados pelo regime de caixa, com base em balanço ou balancete semestral encerrado em 30 de junho e 31 de dezembro. A obrigação é semestral; a maioria dos fundos antecipa em parcelas mensais, que podem variar de valor ou ser suspensas.',
    },
  ],
  related: ['Imposto sobre dividendos: quem paga, quanto e o que mudou', 'Dividendos todo mês', 'Melhores FIIs 2026'],
}
