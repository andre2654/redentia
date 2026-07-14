/**
 * Guia: Como declarar investimentos no IR (Grupo C do KIT de guias Nu).
 * Estrutura e qualidade espelham o exemplar como-investir-em-acoes.ts:
 * hero + seções h2 com blocos ricos (p/stats/steps/checks) + CTA + FAQ + related.
 *
 * Conteúdo HONESTO: regras GERAIS de tributação brasileira, sinalizadas como
 * sujeitas a mudança por ano/legislação. Os limites citados (isenção mensal de
 * ações, faixa de vendas de cripto) são regras legais de referência, não dados
 * de mercado inventados, e vêm sempre com o aviso de confirmar o ano vigente.
 * Nenhuma cotação, preço ou retorno é apresentado como fato. Nada de números de
 * DARF/códigos específicos afirmados como certeza: descritos de forma funcional.
 *
 * HTML dos blocos é local e confiável: só <strong> e <a href> internos.
 */
import type { GuideDoc } from '~/types/guias'

export const COMO_DECLARAR_INVESTIMENTOS_NO_IR_GUIDE: GuideDoc = {
  slug: 'como-declarar-investimentos-no-ir',
  tag: 'Guia Redentia',
  title: 'Como declarar investimentos no IR',
  dek: 'Ações, FIIs e cripto na declaração, sem juridiquês: o que é isento, o que paga imposto, quando cai a DARF e o passo a passo para não cair na malha fina.',
  description:
    'Como declarar investimentos no Imposto de Renda: ações, FIIs e cripto na declaração anual, a isenção mensal em vendas de ações, quando gerar DARF, o passo a passo e os erros que levam à malha fina. Guia claro da Redentia, com regras gerais que você confirma no ano vigente.',
  summary:
    'Declarar investimentos assusta mais do que devia. Veja o que é isento, o que paga imposto, quando a DARF é sua responsabilidade e o passo a passo de ações, FIIs e cripto na declaração, sem juridiquês.',
  minutes: 15,
  author: 'Equipe Redentia',
  datePublished: '2026-07-13',
  dateModified: '2026-07-13',
  updatedLine: 'Atualizado em 13 jul 2026 · 15 min de leitura',
  updatedShort: 'atualizado em jul 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'O que muda quando você investe',
      blocks: [
        {
          kind: 'p',
          html: 'A resposta curta: investir cria duas obrigações distintas com a Receita, e confundir as duas é o que gera medo à toa. A primeira é <strong>declarar o que você tem</strong>, a posse dos ativos, na declaração anual, uma vez por ano. A segunda é <strong>pagar imposto sobre o lucro</strong> quando ele existe e passa dos limites de isenção, o que às vezes é mensal, às vezes é retido na fonte.',
        },
        {
          kind: 'p',
          html: 'Ter ativo não é o mesmo que dever imposto. Você declara todas as suas posições, mesmo as isentas e mesmo quando não há nada a pagar, porque a declaração é uma fotografia do seu patrimônio. O imposto só entra quando há lucro tributável. Este guia separa uma coisa da outra, por tipo de ativo.',
        },
        {
          kind: 'stats',
          items: [
            { value: '2', label: 'obrigações distintas: declarar e apurar' },
            { value: '1x', label: 'declaração anual do patrimônio' },
            { value: 'DARF', label: 'imposto de renda variável é você quem apura' },
          ],
        },
        {
          kind: 'p',
          html: '<strong>Aviso importante:</strong> as regras abaixo são gerais e mudam conforme o ano e a legislação. Limites, alíquotas e prazos são revisados com frequência, então confirme sempre o que vale no exercício vigente e, em caso de dúvida sobre o seu caso, consulte um contador. Este é um guia educativo, não uma orientação tributária personalizada.',
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'Ações na declaração',
      blocks: [
        {
          kind: 'p',
          html: 'Ações têm duas frentes: o <strong>ganho na venda</strong> (que pode gerar imposto) e a <strong>posse das ações e os dividendos</strong> (que você informa, com ou sem imposto).',
        },
        {
          kind: 'p',
          html: '<strong>Ganho de capital com regra de isenção.</strong> Como referência geral, há isenção sobre o lucro em vendas de ações no mercado à vista quando o total vendido no mês fica dentro de um limite (historicamente na casa dos R$ 20 mil por mês, confirme o valor vigente). Vendeu acima desse limite no mês? O lucro passa a ser tributado. Operações de compra e venda no mesmo dia, o day trade, seguem regra própria e mais pesada, sem essa isenção.',
        },
        {
          kind: 'p',
          html: '<strong>Dividendos e posse.</strong> Os dividendos recebidos e a quantidade de ações que você mantém no fim do ano entram na declaração anual, mesmo quando não há imposto a pagar sobre eles. A tributação dos dividendos é um ponto que vem sendo discutido e alterado, então esse é outro item a confirmar no ano vigente.',
        },
        {
          kind: 'p',
          html: 'Antes de investir e depois de vender, guarde as notas de corretagem: elas trazem preço, quantidade e data de cada operação, que é o que você precisa para apurar o ganho. Se ainda está começando, o <a href="/guias/como-investir-em-acoes">guia de como investir em ações</a> mostra o ciclo completo, da compra à declaração.',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'FIIs na declaração',
      blocks: [
        {
          kind: 'p',
          html: 'Fundos imobiliários têm uma lógica tributária diferente das ações, e a confusão mais comum é achar que a regra é a mesma. Não é.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>O rendimento mensal costuma ser isento</strong> de Imposto de Renda para pessoa física, desde que o fundo cumpra as condições legais (fundo negociado em bolsa, com número mínimo de cotistas e sem concentração excessiva). Ainda assim, esse rendimento isento precisa ser informado na declaração.',
            '<strong>O ganho na venda das cotas é tributado</strong>, e aqui não vale a isenção mensal das ações. O lucro ao vender cota de FII costuma ser tributado independentemente do valor, com alíquota própria, o que exige apuração e DARF quando há lucro.',
            '<strong>A posse das cotas entra na declaração anual</strong>, com a quantidade e o valor de custo, como qualquer outro ativo, mesmo que você não tenha vendido nada no ano.',
          ],
        },
        {
          kind: 'p',
          html: 'A parte que mais surpreende: você pode receber rendimento isento o ano inteiro e mesmo assim ter imposto a pagar se vendeu cotas com lucro. São eventos separados. Se FIIs são novidade para você, vale entender o produto antes da tributação, no guia de <a href="/guias/melhores-fiis-2026">FIIs</a>, e olhar a página de cada fundo pelos <a href="/rankings">rankings</a>.',
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'Cripto na declaração',
      blocks: [
        {
          kind: 'p',
          html: 'Cripto é a área que mais muda de regra, então trate tudo aqui como referência geral a confirmar no ano vigente. O princípio, porém, é estável: <strong>você declara o que tem e apura imposto sobre o lucro das vendas</strong>.',
        },
        {
          kind: 'p',
          html: '<strong>Faixa de isenção nas vendas.</strong> Historicamente, há uma faixa de vendas mensais até certo limite (por muito tempo na casa dos R$ 35 mil por mês, somando todas as vendas de cripto) dentro da qual o lucro fica isento; acima disso, o ganho é tributado por alíquotas de ganho de capital. Esse limite e essas alíquotas vêm sendo objeto de mudanças legislativas, então não tome o número como fixo: confirme a regra do exercício atual.',
        },
        {
          kind: 'p',
          html: '<strong>Posse e movimentação.</strong> Independentemente de vender, a posse de criptoativos entra na declaração anual quando ultrapassa os limites de valor exigidos. E há regras específicas de informação de operações, que podem diferir entre corretora nacional e plataforma no exterior, outra razão para guardar o histórico completo desde a primeira compra.',
        },
        {
          kind: 'p',
          html: 'Se você está começando em cripto agora, o <a href="/guias/bitcoin-na-carteira">guia de bitcoin na carteira</a> cobre quanto alocar e como guardar com segurança, e reforça o mesmo ponto: anote data, valor e quantidade de cada operação. Sem esse registro, apurar o imposto vira um pesadelo.',
        },
      ],
    },
    {
      id: 'sec-5',
      title: 'Como funciona a DARF',
      blocks: [
        {
          kind: 'p',
          html: 'A DARF é o que mais confunde iniciante, porque é uma responsabilidade sua, não da corretora. Em renda variável (ações, FIIs e cripto acima dos limites), <strong>é você quem apura o imposto mês a mês e paga por conta própria</strong>, sem esperar a declaração anual.',
        },
        {
          kind: 'steps',
          items: [
            '<strong>Apure mês a mês.</strong> Ao fim de cada mês, some seus lucros e prejuízos naquele tipo de operação. Se houve lucro tributável no mês, há imposto a recolher; se houve prejuízo, não há imposto, e o prejuízo pode ser usado para abater lucros futuros do mesmo tipo.',
            '<strong>Calcule o imposto devido.</strong> Aplique a alíquota que vale para aquele tipo de operação sobre o lucro do mês. Cada categoria (ações, day trade, FIIs, cripto) tem sua própria regra e alíquota, então não misture.',
            '<strong>Gere a DARF.</strong> A guia de pagamento é emitida com o código próprio do tipo de rendimento e o valor apurado. É um documento por competência (o mês em que você teve o lucro).',
            '<strong>Pague no prazo.</strong> Em geral, o vencimento é no último dia útil do mês seguinte ao da venda. Pagar em atraso gera multa e juros, então marque no calendário todo mês em que houve lucro.',
            '<strong>Leve os totais para a declaração anual.</strong> Os valores apurados e pagos ao longo do ano são consolidados na declaração, que fecha a fotografia do exercício.',
          ],
        },
        {
          kind: 'p',
          html: 'A parte esquecida com mais frequência: o <strong>prejuízo não some</strong>. Registrado corretamente, ele reduz o imposto de meses lucrativos seguintes na mesma categoria. Não controlar isso é pagar mais imposto do que o devido.',
        },
      ],
    },
    {
      id: 'sec-6',
      title: 'Passo a passo da declaração anual',
      blocks: [
        {
          kind: 'p',
          html: 'A declaração anual reúne tudo num só lugar. Feita com organização, ela é chata, não difícil. O roteiro geral:',
        },
        {
          kind: 'steps',
          items: [
            '<strong>Junte os informes.</strong> Cada corretora e banco disponibiliza um informe de rendimentos anual, com posições, proventos e impostos retidos. Baixe todos antes de começar.',
            '<strong>Informe os bens e direitos.</strong> Ações, cotas de FII e criptoativos entram como bens, com quantidade e valor de custo (o quanto você pagou), na ficha correspondente a cada tipo.',
            '<strong>Lance os rendimentos.</strong> Dividendos, rendimentos de FII e demais proventos vão na ficha certa, isentos ou tributáveis conforme o caso. O informe indica onde cada valor se encaixa.',
            '<strong>Consolide a renda variável.</strong> Os lucros, prejuízos e as DARFs pagas ao longo do ano são informados mês a mês na ficha de renda variável.',
            '<strong>Revise antes de enviar.</strong> Confira se os saldos batem com os informes e se nada ficou de fora. Divergência entre o que você declara e o que a corretora reportou é o gatilho clássico da malha fina.',
          ],
        },
        {
          kind: 'p',
          html: 'A melhor forma de fazer a declaração fácil é não deixar tudo para abril: mantenha uma planilha de operações ao longo do ano. As <a href="/calculadoras">calculadoras da Redentia</a> ajudam a acompanhar aportes e resultados, e a ter esses números na mão quando a declaração chegar.',
        },
      ],
    },
    {
      id: 'sec-7',
      title: 'Os erros que levam à malha fina',
      blocks: [
        {
          kind: 'p',
          html: 'A malha fina raramente vem de sonegação deliberada; quase sempre vem de descuido. Fuja destes:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Não declarar ativos por serem isentos.</strong> Isento de imposto não é isento de declaração. A posse tem que constar mesmo sem nada a pagar.',
            '<strong>Esquecer a DARF mensal.</strong> Vendeu acima do limite com lucro e não recolheu no mês? O imposto atrasa, acumula multa e juros e sinaliza inconsistência.',
            '<strong>Ignorar o prejuízo acumulado.</strong> Não registrar prejuízos passados faz você pagar imposto que poderia ter sido abatido de lucros seguintes.',
            '<strong>Divergir dos informes.</strong> Valores que não batem com o que a corretora reportou à Receita quase sempre param na malha. Confira antes de enviar.',
            '<strong>Perder o histórico de custo.</strong> Sem saber quanto pagou em cada compra, você não consegue apurar o lucro correto, principalmente em cripto e em compras parceladas ao longo dos anos.',
          ],
        },
        {
          kind: 'p',
          html: 'A regra que resume tudo: <strong>organização ao longo do ano vence a correria de abril</strong>. Anote cada operação quando ela acontece e a declaração deixa de ser um evento temido. Em situações mais complexas, o custo de um contador costuma ser menor que o de um erro na malha fina.',
        },
      ],
    },
  ],
  cta: {
    title: 'Tenha seus investimentos organizados o ano inteiro',
    subtitle: 'Acompanhe aportes, proventos e resultados num só lugar · grátis para começar',
    to: '/calculadoras',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'Preciso declarar mesmo se não tive lucro?',
      a: 'Sim. Declarar a posse dos ativos e informar prejuízo é diferente de pagar imposto. Você informa todas as suas posições, mesmo isentas e mesmo sem lucro, porque a declaração é uma fotografia do seu patrimônio. Prejuízo, aliás, vale a pena declarar: registrado, ele abate impostos de lucros futuros na mesma categoria.',
    },
    {
      q: 'Qual o limite de isenção para vender ações sem pagar imposto?',
      a: 'Como regra geral, há isenção sobre o lucro em vendas de ações no mercado à vista quando o total vendido no mês fica dentro de um limite, historicamente na casa dos R$ 20 mil por mês. Acima disso, o lucro é tributado, e day trade não tem essa isenção. Esse valor pode mudar por ano, então confirme o limite vigente.',
    },
    {
      q: 'FIIs pagam imposto de renda?',
      a: 'O rendimento mensal de FIIs costuma ser isento para pessoa física quando o fundo cumpre as condições legais, mas ainda precisa ser informado na declaração. Já o ganho na venda das cotas é tributado, sem a isenção mensal das ações, e exige apuração e DARF quando há lucro. São eventos separados.',
    },
    {
      q: 'Como funciona o imposto sobre bitcoin e cripto?',
      a: 'Em regra, há uma faixa de vendas mensais até certo limite (por muito tempo na casa dos R$ 35 mil por mês, somando todas as vendas) dentro da qual o lucro é isento; acima disso, o ganho é tributado. A posse também é declarada acima de certos valores. As regras de cripto mudam com frequência, então confirme o que vale no ano vigente.',
    },
    {
      q: 'O que é a DARF e quem emite?',
      a: 'A DARF é a guia com que você paga, por conta própria, o imposto sobre o lucro em renda variável, mês a mês. A corretora não faz isso por você: você apura o lucro do mês, calcula o imposto, gera a guia e paga, em geral, até o último dia útil do mês seguinte à venda.',
    },
    {
      q: 'Preciso de um contador para declarar investimentos?',
      a: 'Para carteiras simples, com poucos ativos e sem vendas frequentes, dá para declarar por conta própria com organização. Conforme cresce o volume de operações, day trade, muita cripto ou situações específicas, o custo de um contador costuma ser menor que o de um erro na malha fina. Este guia é educativo, não substitui orientação profissional.',
    },
  ],
  related: ['Como investir em ações', 'Melhores FIIs 2026', 'Bitcoin na carteira: quanto alocar?'],
}
