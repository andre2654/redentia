/**
 * Guia: Tesouro Direto para iniciantes (Grupo B do KIT de guias Nu).
 * Estrutura e qualidade espelham o exemplar como-investir-em-acoes.ts:
 * hero (dek) + seções h2 com blocos ricos (p/stats/steps/checks) + CTA + FAQ + related.
 *
 * Conteúdo HONESTO e principiológico: nenhuma taxa, cotação ou rentabilidade
 * apresentada como fato de mercado. As regras tributárias citadas (tabela
 * regressiva do IR, IOF nos 30 primeiros dias) são regras públicas e estáveis,
 * não dados de mercado. Números nos stat cards são estruturais (quantidade de
 * tipos de título, quantos passos), não financeiros.
 *
 * HTML dos blocos é local e confiável: só <strong> e <a href> internos.
 */
import type { GuideDoc } from '~/types/guias'

export const TESOURO_DIRETO_PARA_INICIANTES_GUIDE: GuideDoc = {
  slug: 'tesouro-direto-para-iniciantes',
  tag: 'Renda fixa',
  title: 'Tesouro Direto para iniciantes',
  dek: 'IPCA+, Selic ou Prefixado: para que serve cada título, o que é marcação a mercado e como escolher sem juridiquês.',
  description:
    'Tesouro Direto para iniciantes: entenda IPCA+, Selic e Prefixado, o que é marcação a mercado, quanto começar, imposto de renda e como escolher o título certo para cada objetivo. Guia claro da Redentia.',
  summary:
    'Tesouro Direto não é um investimento só, são três tipos de título com funções diferentes. Veja para que serve IPCA+, Selic e Prefixado, o que é marcação a mercado e como escolher sem chute.',
  minutes: 9,
  author: 'Equipe Redentia',
  datePublished: '2026-07-13',
  dateModified: '2026-07-13',
  updatedLine: 'Atualizado em 13 jul 2026 · 9 min de leitura',
  updatedShort: 'atualizado em jul 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'O que é o Tesouro Direto',
      blocks: [
        {
          kind: 'p',
          html: 'A resposta curta: no Tesouro Direto você empresta dinheiro para o governo federal e recebe de volta com juros. É a aplicação mais segura do país, porque quem paga é o Tesouro Nacional, e você acessa tudo pela sua corretora, a partir de poucas dezenas de reais.',
        },
        {
          kind: 'p',
          html: 'O ponto que trava a maioria dos iniciantes não é abrir a conta, é entender que <strong>Tesouro Direto não é um investimento só</strong>. São três famílias de título com funções diferentes: uma protege da inflação, uma acompanha os juros do dia e uma trava uma taxa fixa. Escolher o título certo para o seu objetivo é o que este guia resolve.',
        },
        {
          kind: 'stats',
          items: [
            { value: '3', label: 'tipos de título para objetivos diferentes' },
            { value: '4', label: 'passos da conta ao primeiro título' },
            { value: '0', label: 'chance de calote em título público' },
          ],
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'Os três tipos de título, sem juridiquês',
      blocks: [
        {
          kind: 'p',
          html: 'O nome do título já entrega a que ele serve. Entenda os três e você já sabe 80% do que precisa:',
        },
        {
          kind: 'p',
          html: '<strong>Tesouro IPCA+ (proteção da inflação).</strong> Rende a inflação do período (medida pelo IPCA) mais uma taxa fixa por cima. Ou seja, seu dinheiro sempre ganha da inflação, aconteça o que acontecer com os preços. É o título para objetivos de longo prazo, aposentadoria, a faculdade do filho, comprar um imóvel daqui a muitos anos, porque protege o seu poder de compra.',
        },
        {
          kind: 'p',
          html: '<strong>Tesouro Selic (reserva e curto prazo).</strong> Acompanha a taxa Selic, os juros básicos da economia. É o título que menos oscila no caminho, então é o candidato natural para a <strong>reserva de emergência</strong> e para dinheiro que você pode precisar a qualquer momento. Rende todo dia útil e você resgata quando quiser sem sustos.',
        },
        {
          kind: 'p',
          html: '<strong>Tesouro Prefixado (taxa travada).</strong> A taxa é fixa e você já sabe, na hora da compra, quanto vai receber por ano se levar até o vencimento. Serve para quem quer previsibilidade total de um valor futuro. O outro lado: se os juros subirem depois, você fica preso a uma taxa que ficou para trás.',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'Passo a passo até o primeiro título',
      blocks: [
        {
          kind: 'p',
          html: 'O caminho é o mesmo em qualquer corretora regulada. Do cadastro à compra, são quatro passos:',
        },
        {
          kind: 'steps',
          items: [
            '<strong>Abra conta em uma corretora.</strong> Só precisa de CPF e alguns dados. Prefira instituições reguladas pela CVM; a abertura é digital e a maioria não cobra taxa de corretagem no Tesouro Direto.',
            '<strong>Transfira o dinheiro.</strong> Um Pix ou TED deixa o saldo disponível. Não há valor mínimo alto: dá para comprar uma fração de título por poucas dezenas de reais.',
            '<strong>Escolha o título pelo objetivo.</strong> Reserva de emergência pede Selic; meta de longo prazo protegida da inflação pede IPCA+; um valor certo em uma data futura pede Prefixado. Compare vencimentos e taxas no <a href="/ranking/tesouro-direto">ranking de Tesouro Direto da Redentia</a> antes de decidir.',
            '<strong>Confirme a compra e acompanhe.</strong> A ordem é executada e o título aparece na sua posição. Depois disso, o combinado é deixar trabalhar até o vencimento, sem checar o preço todo dia.',
          ],
        },
        {
          kind: 'p',
          html: 'A página de cada título traz taxa, vencimento e a leitura da Redentia. Comece pela lista em <a href="/tesouro">Tesouro Direto</a> para ver os títulos disponíveis lado a lado.',
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'Marcação a mercado: por que o preço oscila',
      blocks: [
        {
          kind: 'p',
          html: 'Aqui mora a maior confusão de quem começa. Tesouro é seguro, mas o preço do título <strong>oscila no meio do caminho</strong>. Isso se chama marcação a mercado, e entender esse mecanismo evita o erro mais caro do Tesouro Direto.',
        },
        {
          kind: 'p',
          html: 'Todo dia o mercado reprecifica o seu título com base nos juros do momento. Quando os juros da economia sobem, o preço dos títulos prefixados e IPCA+ na tela cai; quando os juros caem, o preço sobe. É por isso que você pode ver a posição de um Tesouro IPCA+ ficar temporariamente negativa mesmo sabendo que ele é seguro.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Se levar até o vencimento, a taxa contratada é a que vale.</strong> A oscilação do meio do caminho não muda o combinado: você recebe a taxa que travou na compra.',
            '<strong>Se vender antes do vencimento, você realiza o preço do dia.</strong> Pode sair ganhando mais ou menos que a taxa contratada, dependendo de para onde os juros foram.',
            '<strong>Tesouro Selic quase não sofre marcação.</strong> Por acompanhar a taxa do dia, ele oscila muito pouco. É por isso que é o título da reserva: você resgata a qualquer momento sem levar prejuízo de marcação.',
          ],
        },
        {
          kind: 'p',
          html: 'A lição prática: escolha o vencimento pensando em quando vai precisar do dinheiro. Casar prazo do título com prazo do objetivo é o que transforma a marcação a mercado em detalhe irrelevante, em vez de armadilha.',
        },
      ],
    },
    {
      id: 'sec-5',
      title: 'Como escolher o título certo',
      blocks: [
        {
          kind: 'p',
          html: 'Não existe o melhor Tesouro no absoluto, existe o certo para cada objetivo. Antes de comprar, responda a estas perguntas:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Você pode precisar desse dinheiro a qualquer hora?</strong> Se sim, é reserva: vá de Tesouro Selic e não pense em marcação a mercado.',
            '<strong>É um objetivo de muitos anos que não pode perder para a inflação?</strong> Aposentadoria e metas longas pedem Tesouro IPCA+, que protege o poder de compra.',
            '<strong>Você quer saber o valor exato que vai receber em uma data?</strong> O Tesouro Prefixado trava a taxa e entrega previsibilidade, desde que você leve até o vencimento.',
            '<strong>O vencimento bate com o seu prazo?</strong> Escolha um título que vence perto de quando você vai usar o dinheiro. Isso neutraliza a oscilação do caminho.',
            '<strong>Você já tem reserva antes de mirar prazos longos?</strong> A ordem saudável é primeiro o colchão de curto prazo, depois os objetivos de longo prazo.',
          ],
        },
        {
          kind: 'p',
          html: 'Para transformar objetivo em número, quanto aportar por mês e quanto isso vira ao longo dos anos, use as <a href="/calculadoras">calculadoras da Redentia</a>. Um plano de aportes regulares no título certo vence, no longo prazo, a tentativa de adivinhar o melhor momento de comprar.',
        },
      ],
    },
    {
      id: 'sec-6',
      title: 'Imposto de renda e custos',
      blocks: [
        {
          kind: 'p',
          html: 'O Tesouro Direto tem imposto de renda sobre o rendimento, cobrado só no resgate ou no vencimento, e a alíquota cai quanto mais tempo você deixa o dinheiro aplicado. Essa é a tabela regressiva: começa em 22,5% para prazos curtos e chega a 15% depois de dois anos. Não é imposto sobre o valor investido, é sobre o lucro.',
        },
        {
          kind: 'p',
          html: 'Há também o IOF, mas só se você resgatar nos primeiros 30 dias, então na prática ele deixa de existir para qualquer aplicação com um mínimo de horizonte. E existe uma pequena taxa de custódia da B3 sobre o valor guardado, exceto para uma faixa inicial de Tesouro Selic, que é isenta. Some tudo e o Tesouro segue sendo um dos investimentos de menor custo do mercado.',
        },
        {
          kind: 'p',
          html: 'O recado prático: o imposto premia a paciência. Quanto mais longo o objetivo, menor a mordida no rendimento, o que reforça a lógica de casar o título com o prazo. Na hora da declaração anual, os títulos e os rendimentos entram no Imposto de Renda, e o passo a passo está no guia de <strong>como declarar investimentos no IR</strong>, logo abaixo.',
        },
      ],
    },
    {
      id: 'sec-7',
      title: 'Os erros que travam iniciantes',
      blocks: [
        {
          kind: 'p',
          html: 'A maioria dos tropeços no Tesouro não vem do título errado, vem de expectativa errada. Fuja destes:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Botar a reserva de emergência em IPCA+ ou Prefixado.</strong> São ótimos para o longo prazo, mas oscilam. Reserva mora no Selic, que resgata sem susto.',
            '<strong>Vender no susto quando a posição fica negativa.</strong> A oscilação é marcação a mercado. Se você casou o prazo, basta esperar o vencimento e receber a taxa contratada.',
            '<strong>Comprar um vencimento muito longo para uma meta curta.</strong> Título longo oscila mais. Escolher o vencimento pelo objetivo evita ter que vender na hora errada.',
            '<strong>Achar que Tesouro rende igual a todo momento.</strong> As taxas mudam conforme os juros da economia. Compare antes de comprar, sem esperar sempre o mesmo número.',
            '<strong>Ignorar a reserva e ir direto ao longo prazo.</strong> Sem colchão, qualquer imprevisto obriga a resgatar um IPCA+ no pior momento da marcação.',
          ],
        },
      ],
    },
  ],
  cta: {
    title: 'Compare os títulos do Tesouro Direto',
    subtitle: 'Taxas e vencimentos lado a lado, com a leitura da Redentia · grátis para começar',
    to: '/ranking/tesouro-direto',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'Qual o melhor título do Tesouro Direto para iniciantes?',
      a: 'Não existe o melhor no absoluto, existe o certo para cada objetivo. Para a reserva de emergência e o curto prazo, o Tesouro Selic é o mais indicado porque quase não oscila. Para objetivos de longo prazo protegidos da inflação, o Tesouro IPCA+. Para travar um valor futuro conhecido, o Prefixado.',
    },
    {
      q: 'Tesouro Direto pode dar prejuízo?',
      a: 'Se você levar o título até o vencimento, recebe a taxa que contratou na compra, sem prejuízo. A perda só acontece se você vender antes do vencimento em um momento ruim da marcação a mercado, quando os juros subiram. O Tesouro Selic é a exceção: quase não oscila, por isso serve para resgates a qualquer momento.',
    },
    {
      q: 'O que é marcação a mercado no Tesouro Direto?',
      a: 'É a reprecificação diária do seu título conforme os juros da economia. Quando os juros sobem, o preço de títulos prefixados e IPCA+ na tela cai; quando caem, sobe. Essa oscilação só importa se você vender antes do vencimento. Levando até o fim, vale a taxa contratada.',
    },
    {
      q: 'Quanto preciso para começar no Tesouro Direto?',
      a: 'Poucas dezenas de reais já bastam, porque é possível comprar uma fração de título. Não há valor mínimo alto, o que faz do Tesouro um bom primeiro investimento enquanto você aprende a acompanhar objetivos e prazos.',
    },
    {
      q: 'Tesouro Direto paga imposto de renda?',
      a: 'Sim, sobre o rendimento, cobrado no resgate ou no vencimento, pela tabela regressiva: de 22,5% para prazos curtos até 15% após dois anos. Há IOF apenas nos primeiros 30 dias. Quanto mais tempo aplicado, menor a alíquota, o que premia objetivos de longo prazo.',
    },
    {
      q: 'Tesouro Direto é melhor que a poupança?',
      a: 'Para a maioria dos objetivos, o Tesouro tende a render mais que a poupança e é igualmente seguro, por ser título público. O Tesouro Selic cumpre o papel de reserva com liquidez, e IPCA+ e Prefixado atendem prazos mais longos. A poupança perde em rendimento na maior parte dos cenários.',
    },
  ],
  related: ['Dividendos todo mês', 'Como investir em ações', 'Como declarar investimentos no IR'],
}
