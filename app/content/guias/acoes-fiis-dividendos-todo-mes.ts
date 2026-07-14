/**
 * Guia: Dividendos todo mês (Grupo B do KIT de guias Nu).
 * Slug de SEO antigo da Redentia (acoes-fiis-dividendos-todo-mes), título de
 * hub "Dividendos todo mês". Estrutura espelha o exemplar como-investir-em-acoes.ts:
 * hero (dek) + seções h2 com blocos ricos (p/stats/steps/checks) + CTA + FAQ + related.
 *
 * Conteúdo HONESTO e principiológico: nenhum dividend yield, cotação, valor de
 * provento ou ticker apresentado como fato de mercado. Tickers citados servem
 * só para linkar a página real do ativo. A isenção de IR sobre rendimento de
 * FII é regra pública, não dado de mercado. Metas de renda (ex.: R$ 1.000/mês)
 * são ilustrativas do raciocínio, não promessa nem número real de carteira.
 *
 * HTML dos blocos é local e confiável: só <strong> e <a href> internos.
 */
import type { GuideDoc } from '~/types/guias'

export const ACOES_FIIS_DIVIDENDOS_TODO_MES_GUIDE: GuideDoc = {
  slug: 'acoes-fiis-dividendos-todo-mes',
  tag: 'Dividendos',
  title: 'Dividendos todo mês',
  dek: 'Como montar uma escada de proventos que pinga renda o ano inteiro, combinando FIIs e ações que pagam em meses diferentes.',
  description:
    'Dividendos todo mês: como montar uma escada de proventos com FIIs e ações que pagam em meses diferentes, o que é dividend yield, isenção de IR dos FIIs e quanto investir para uma meta de renda passiva. Guia da Redentia.',
  summary:
    'Receber dividendos todo mês não é sorte, é montagem. Veja como combinar FIIs e ações que pagam em meses diferentes numa escada de proventos, o que olhar no dividend yield e como transformar meta de renda em plano.',
  minutes: 11,
  author: 'Equipe Redentia',
  datePublished: '2026-07-13',
  dateModified: '2026-07-13',
  updatedLine: 'Atualizado em 13 jul 2026 · 11 min de leitura',
  updatedShort: 'atualizado em jul 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'Renda todo mês, do jeito certo',
      blocks: [
        {
          kind: 'p',
          html: 'A resposta curta: você não compra um ativo mágico que paga todo mês, você <strong>monta uma escada de proventos</strong>. A ideia é combinar ativos que pagam em meses diferentes, de forma que, no conjunto, sempre caia dinheiro na sua conta, todo mês do ano.',
        },
        {
          kind: 'p',
          html: 'A maioria dos fundos imobiliários paga rendimento mensalmente, então eles são a base natural dessa renda. As ações que distribuem dividendos costumam pagar em intervalos mais espaçados, algumas poucas vezes ao ano, e servem para reforçar os meses e adicionar potencial de valorização. Juntar os dois é o que dá uma renda estável sem depender de um único pagador.',
        },
        {
          kind: 'stats',
          items: [
            { value: '12', label: 'meses cobertos por uma escada bem montada' },
            { value: '2', label: 'motores de renda: FIIs mensais e ações' },
            { value: '0', label: 'IR sobre o rendimento de FIIs para pessoa física' },
          ],
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'De onde vem o dividendo',
      blocks: [
        {
          kind: 'p',
          html: 'Antes de montar a escada, vale entender as duas fontes de provento, porque elas se comportam de formas diferentes.',
        },
        {
          kind: 'p',
          html: '<strong>Fundos imobiliários (FIIs).</strong> Uma cota de FII é uma fatia de um fundo que investe em imóveis, como galpões e shoppings, ou em títulos ligados ao setor. Por lei, os FIIs distribuem a maior parte do resultado aos cotistas, e a maioria faz isso todos os meses. Esse rendimento mensal é a espinha dorsal de quem busca renda recorrente.',
        },
        {
          kind: 'p',
          html: '<strong>Ações que pagam dividendos.</strong> Empresas lucrativas distribuem parte do lucro aos sócios, em dinheiro. O calendário é mais irregular: costumam pagar em datas específicas ao longo do ano, não todo mês. O ganho aqui é duplo, a renda que pinga e a valorização da empresa ao longo do tempo. Para entender a mecânica de virar sócio, veja o guia de <a href="/guias/como-investir-em-acoes">como investir em ações</a>.',
        },
        {
          kind: 'p',
          html: 'Cada empresa e cada fundo tem uma página com o histórico de proventos e a leitura da Redentia. Antes de incluir um ativo na escada, abra a análise de dividendos dele, a de <a href="/dividendos/PETR4">PETR4</a> mostra o nível de informação que você deveria querer sobre qualquer pagador.',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'Como montar a escada de proventos',
      blocks: [
        {
          kind: 'p',
          html: 'Escada de proventos é o nome da estratégia de escolher ativos cujos pagamentos se encaixam para cobrir o calendário inteiro. Montá-la é um processo, não um palpite:',
        },
        {
          kind: 'steps',
          items: [
            '<strong>Comece pela base mensal.</strong> Selecione fundos imobiliários de segmentos diferentes (tijolo, papel, logística) que pagam rendimento todo mês. A diversificação de segmento reduz o risco de um setor específico derrubar a renda.',
            '<strong>Mapeie os meses de pagamento das ações.</strong> Cada empresa tem seu calendário de proventos. Escolha pagadoras cujas datas caiam em meses onde você quer reforço, complementando o que os FIIs já cobrem.',
            '<strong>Encaixe as peças no calendário.</strong> O objetivo é que, somando FIIs e ações, todo mês tenha pagamento. Onde faltar, um novo FII ou uma ação com data naquele mês fecha o buraco.',
            '<strong>Reinvista os proventos no começo.</strong> Enquanto você está construindo, use a renda recebida para comprar mais cotas e ações. É o juro composto trabalhando: a escada cresce sozinha e a renda futura aumenta.',
            '<strong>Revise a tese, não o preço.</strong> De tempos em tempos, confira se os pagadores continuam saudáveis. Corte quem deteriorou os fundamentos, não quem só oscilou de preço.',
          ],
        },
        {
          kind: 'p',
          html: 'Para achar candidatos, o <a href="/ranking/maiores-dividend-yield">ranking de maiores dividend yield da Redentia</a> lista pagadores comparáveis lado a lado, e a página de cada ativo mostra o histórico completo antes de você decidir.',
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'Dividend yield: o número, e a armadilha',
      blocks: [
        {
          kind: 'p',
          html: 'O dividend yield (DY) é o indicador central da renda: ele mede quanto um ativo pagou em proventos nos últimos 12 meses em relação ao preço da cota ou da ação. Um DY de 8% significa que, para cada R$ 100 investidos, o ativo distribuiu R$ 8 no período. É a régua para comparar pagadores.',
        },
        {
          kind: 'p',
          html: 'A armadilha é olhar só o DY. Um yield altíssimo pode ser um sinal de perigo, e não de oportunidade, quando vem de um preço que despencou por um problema real na empresa ou no fundo. Dividendo do passado não é promessa de dividendo do futuro. Antes de se encantar com o número, passe o ativo por estes filtros:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>O pagamento é sustentável?</strong> A empresa ou o fundo gera resultado suficiente para manter aquele nível de distribuição, ou está pagando além do que ganha?',
            '<strong>O histórico é consistente?</strong> Um pagador que distribui de forma estável há anos vale mais que um yield alto de um único período.',
            '<strong>O preço caiu por um motivo grave?</strong> Um DY que subiu porque o ativo despencou pode ser armadilha. Investigue a causa da queda antes de comprar.',
            '<strong>Você está diversificando os pagadores?</strong> Renda concentrada em poucos ativos é frágil. Espalhar entre fundos e empresas protege a escada.',
          ],
        },
        {
          kind: 'p',
          html: 'Para simular quanto uma carteira renderia por mês a partir do yield e do valor aplicado, use a <a href="/calculadora/dividend-yield">calculadora de dividend yield da Redentia</a>. Ela transforma o indicador abstrato em reais na sua conta.',
        },
      ],
    },
    {
      id: 'sec-5',
      title: 'A isenção de IR dos FIIs',
      blocks: [
        {
          kind: 'p',
          html: 'Aqui está uma das maiores vantagens da renda com fundos imobiliários: para o investidor pessoa física, o <strong>rendimento mensal distribuído pelos FIIs é isento de imposto de renda</strong>, desde que respeitadas as condições da regra (como o fundo ter suas cotas negociadas em bolsa e o investidor não ter uma participação relevante demais no fundo). Na prática, para o pequeno investidor, o rendimento cai limpo na conta.',
        },
        {
          kind: 'p',
          html: 'Atenção a dois pontos que confundem: a isenção é sobre o rendimento distribuído, não sobre o <strong>ganho de capital</strong>. Se você vender uma cota por mais do que pagou, o lucro dessa venda é tributado. E a isenção do rendimento de FII não se estende automaticamente aos dividendos de ações, que têm regras próprias.',
        },
        {
          kind: 'p',
          html: 'Mesmo isentos, os FIIs e os rendimentos recebidos precisam ser informados na declaração anual do Imposto de Renda. Isento não é o mesmo que invisível para a Receita. O passo a passo completo está no guia de <strong>como declarar investimentos no IR</strong>, logo abaixo.',
        },
      ],
    },
    {
      id: 'sec-6',
      title: 'Quanto investir para uma meta de renda',
      blocks: [
        {
          kind: 'p',
          html: 'A pergunta que todo mundo faz é quanto preciso para viver de renda. A conta parte de dois números: a meta de renda mensal e o dividend yield médio da carteira. Quanto maior o yield, menos patrimônio a meta exige, mas correr atrás de yield alto demais reintroduz o risco da armadilha da seção anterior.',
        },
        {
          kind: 'p',
          html: 'Um exemplo apenas ilustrativo do raciocínio: para uma meta hipotética de R$ 1.000 por mês, o patrimônio necessário depende diretamente do yield que você conseguir de forma sustentável. Yields mais realistas exigem mais patrimônio; yields mais altos exigem menos, mas com mais risco. Não trate nenhum número como garantia, trate como ponto de partida do plano.',
        },
        {
          kind: 'p',
          html: 'O caminho honesto é o oposto de um atalho: aportes regulares, reinvestimento dos proventos e paciência para o juro composto agir. Rode a sua meta na <a href="/calculadora/dividend-yield">calculadora de dividend yield</a> e nas <a href="/calculadoras">calculadoras da Redentia</a> para ver quanto aportar por mês e em quanto tempo a escada sustenta a renda que você quer.',
        },
      ],
    },
    {
      id: 'sec-7',
      title: 'Os erros que furam a escada',
      blocks: [
        {
          kind: 'p',
          html: 'A maioria dos problemas de quem busca renda não vem do ativo errado, vem da estratégia errada. Fuja destes:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Perseguir o maior dividend yield da lista.</strong> Yield altíssimo costuma ser preço em queda por um problema real. Sustentabilidade do pagamento vale mais que o número da vez.',
            '<strong>Concentrar a renda em poucos ativos.</strong> Se dois ou três pagadores cortam o provento, a escada desaba. Diversifique pagadores e segmentos.',
            '<strong>Gastar os proventos cedo demais.</strong> Na fase de construção, reinvestir é o que faz a renda futura crescer. Consumir cedo trava o juro composto.',
            '<strong>Confundir dividendo do passado com garantia.</strong> Distribuição pode cair quando o resultado cai. Acompanhe os fundamentos, não só o histórico de pagamento.',
            '<strong>Ignorar a declaração por causa da isenção.</strong> FIIs isentos ainda entram no IR. Deixar de declarar por achar que isento é invisível gera dor de cabeça com a Receita.',
          ],
        },
      ],
    },
  ],
  cta: {
    title: 'Encontre pagadores para a sua escada',
    subtitle: 'Compare dividend yield e histórico de proventos · grátis para começar',
    to: '/ranking/maiores-dividend-yield',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'Existe um investimento que paga dividendos todo mês?',
      a: 'A maioria dos fundos imobiliários paga rendimento mensalmente, então um único FII pode pagar todo mês. Mas o mais seguro é montar uma escada de proventos, combinando vários FIIs e ações que pagam em meses e datas diferentes, para não depender de um único pagador e cobrir o calendário inteiro.',
    },
    {
      q: 'Como montar uma carteira que paga dividendos todo mês?',
      a: 'Comece pela base de FIIs de segmentos diferentes, que pagam mensalmente. Depois, mapeie os meses de pagamento de ações boas pagadoras e encaixe-as onde quer reforço. O objetivo é que, somando tudo, todo mês tenha pagamento. Diversifique pagadores e reinvista os proventos na fase de construção.',
    },
    {
      q: 'O que é dividend yield?',
      a: 'É o indicador que mede quanto um ativo pagou em proventos nos últimos 12 meses em relação ao seu preço. Um DY de 8% significa R$ 8 distribuídos para cada R$ 100 investidos no período. Serve para comparar pagadores, mas yield muito alto pode ser armadilha de preço em queda, então avalie a sustentabilidade do pagamento.',
    },
    {
      q: 'Preciso pagar imposto de renda sobre dividendos de FII?',
      a: 'Para o investidor pessoa física, o rendimento mensal distribuído pelos FIIs é isento de imposto de renda, respeitadas as condições da regra. A isenção vale para o rendimento, não para o ganho na venda das cotas, que é tributado. E mesmo isentos, os FIIs precisam ser informados na declaração anual.',
    },
    {
      q: 'Quanto preciso investir para viver de dividendos?',
      a: 'Depende da sua meta de renda mensal e do dividend yield sustentável da carteira: quanto maior o yield, menos patrimônio a meta exige, mas com mais risco. Não há número mágico. Rode a sua meta na calculadora de dividend yield da Redentia para ver quanto aportar por mês e em quanto tempo a escada sustenta a renda.',
    },
    {
      q: 'Vale mais a pena dividendos de ações ou de FIIs?',
      a: 'Os dois se complementam. FIIs costumam pagar rendimento mensal e, para pessoa física, com isenção de IR, sendo a base da renda recorrente. Ações pagam de forma mais espaçada, mas somam potencial de valorização. Uma escada bem montada usa os dois para estabilizar a renda ao longo do ano.',
    },
  ],
  related: ['Melhores FIIs 2026', 'Calculadora de dividendos', 'Como declarar investimentos no IR'],
}
