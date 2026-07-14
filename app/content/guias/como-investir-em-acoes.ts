/**
 * Guia: Como investir em ações (exemplar do KIT de guias Nu).
 * Estrutura e qualidade espelham o gabarito open-finance.ts: hero + seções h2
 * com blocos ricos (p/stats/steps/checks) + CTA + FAQ + related.
 *
 * Conteúdo HONESTO e principiológico: nenhum preço, cotação, dividend yield ou
 * ticker apresentado como fato de mercado. Tickers citados (ex.: PETR4) servem
 * só para linkar a página real do ativo. Números nos stat cards são estruturais
 * (quantos passos, quantas ações mínimas), não financeiros.
 *
 * HTML dos blocos é local e confiável: só <strong> e <a href> internos.
 */
import type { GuideDoc } from '~/types/guias'

export const COMO_INVESTIR_EM_ACOES_GUIDE: GuideDoc = {
  slug: 'como-investir-em-acoes',
  tag: 'Ações',
  title: 'Como investir em ações',
  dek: 'Da abertura de conta à primeira compra, com passo a passo, critérios de escolha sem chute e os erros que travam quem está começando.',
  description:
    'Como investir em ações do zero: abrir conta na corretora, escolher uma ação por fundamento, enviar a primeira ordem, quanto começar e o que declarar no Imposto de Renda. Guia claro da Redentia, sem palpite.',
  summary:
    'Investir em ações não é sorte nem palpite. Veja o caminho completo, da conta à primeira ordem, como escolher uma ação por fundamento e os erros que quebram iniciantes.',
  minutes: 8,
  author: 'Equipe Redentia',
  datePublished: '2026-07-13',
  dateModified: '2026-07-13',
  updatedLine: 'Atualizado em 13 jul 2026 · 8 min de leitura',
  updatedShort: 'atualizado em jul 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'Investir em ações, do zero',
      blocks: [
        {
          kind: 'p',
          html: 'A resposta curta: você abre conta em uma corretora, transfere o dinheiro, escolhe uma ação com base no negócio por trás dela e envia uma ordem de compra. O sistema faz o resto. O difícil não é a mecânica, que leva minutos, é <strong>decidir o que comprar sem chutar</strong>, e esse é o foco deste guia.',
        },
        {
          kind: 'p',
          html: 'Comprar uma ação é virar sócio de uma empresa. Você passa a ter direito a uma fração dos lucros dela, seja pela valorização do preço ao longo do tempo, seja pelos <strong>dividendos</strong> que ela distribui. Não é uma aposta em um número que sobe e desce: é participação em um negócio real.',
        },
        {
          kind: 'stats',
          items: [
            { value: '5', label: 'passos da conta à primeira ordem' },
            { value: '1', label: 'ação já é suficiente pra começar' },
            { value: '0', label: 'palpite: decisão por fundamento' },
          ],
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'O que você ganha com uma ação',
      blocks: [
        {
          kind: 'p',
          html: 'Uma ação remunera o investidor por dois caminhos, e vale entender os dois antes de comprar qualquer papel.',
        },
        {
          kind: 'p',
          html: '<strong>1. Valorização.</strong> Se a empresa cresce e gera mais valor, o mercado tende a pagar mais pela ação com o tempo. Você lucra ao vender por um preço maior do que pagou. É o motor de longo prazo, e o que mais oscila no curto prazo.',
        },
        {
          kind: 'p',
          html: '<strong>2. Dividendos.</strong> Empresas lucrativas costumam distribuir parte do lucro aos sócios, em dinheiro, direto na sua conta. É a renda que pinga sem você vender nada. Quem monta carteira pensando em <a href="/dividendos">renda passiva</a> olha primeiro para a consistência desses pagamentos, não só para o preço da tela.',
        },
        {
          kind: 'p',
          html: 'Cada empresa tem uma página com histórico, indicadores e a leitura da IA da Redentia. Antes de comprar, abra o ativo e leia: a de <a href="/asset/PETR4">PETR4</a> serve de modelo do nível de informação que você deveria querer sobre qualquer papel.',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'Passo a passo até a primeira compra',
      blocks: [
        {
          kind: 'p',
          html: 'O caminho é o mesmo em qualquer corretora regulada. Do cadastro à ordem executada, são cinco passos:',
        },
        {
          kind: 'steps',
          items: [
            '<strong>Abra conta em uma corretora.</strong> Basta CPF e alguns dados. Prefira instituições reguladas pelo Banco Central e pela CVM; a maioria não cobra taxa de manutenção e a abertura é 100% digital.',
            '<strong>Transfira o dinheiro.</strong> Um Pix ou TED da sua conta para a corretora deixa o saldo disponível para investir. Só mova o que você não vai precisar no curto prazo.',
            '<strong>Escolha a ação por fundamento.</strong> Este é o passo que separa investir de apostar. Use os <a href="/rankings">rankings da Redentia</a> para comparar empresas por lucro, dívida e valuation, e abra a página de cada ativo antes de decidir.',
            '<strong>Envie a ordem de compra.</strong> No home broker, digite o código da ação (o ticker), a quantidade e o preço. Ordem a mercado executa no preço atual; ordem limitada só executa no preço que você definir.',
            '<strong>Acompanhe, sem vigiar a tela.</strong> Registrada a compra, a ação aparece na sua carteira. Reveja a tese de tempos em tempos, não o preço a cada minuto.',
          ],
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'Como escolher uma ação sem chutar',
      blocks: [
        {
          kind: 'p',
          html: 'Preço na tela não diz se uma ação está cara ou barata, nem se a empresa é boa. Antes de comprar, passe cada candidata por estes cinco filtros:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Você entende o negócio?</strong> Se não sabe como a empresa ganha dinheiro, não sabe o que está comprando. Comece por setores que você compreende.',
            '<strong>A empresa dá lucro de forma consistente?</strong> Um histórico de lucros ao longo de vários anos vale mais que um trimestre isolado forte.',
            '<strong>A dívida está sob controle?</strong> Empresa muito endividada fica frágil quando os juros sobem. Compare o endividamento com o de outras do mesmo setor.',
            '<strong>O preço faz sentido?</strong> Indicadores de valuation ajudam a comparar quanto você paga pelo lucro da empresa. Caro ou barato só existe em relação aos pares.',
            '<strong>Você está diversificando?</strong> Uma ação só é o começo. Espalhar entre empresas e setores reduz o risco de um erro isolado derrubar a carteira inteira.',
          ],
        },
        {
          kind: 'p',
          html: 'Cada um desses filtros vira uma coluna comparável nos <a href="/rankings">rankings</a>, e a leitura completa por empresa vive na página do ativo. A ideia não é decorar fórmula, é nunca comprar algo que você não conseguiria explicar para outra pessoa.',
        },
      ],
    },
    {
      id: 'sec-5',
      title: 'Quanto começar (e o que vem antes)',
      blocks: [
        {
          kind: 'p',
          html: 'Não existe valor mínimo mágico: dá para comprar uma única ação, e muitas custam poucas dezenas de reais. Começar pequeno é o certo enquanto você aprende a operar e a acompanhar uma tese.',
        },
        {
          kind: 'p',
          html: 'Antes da primeira ação, porém, duas coisas vêm na frente. Primeiro, uma <strong>reserva de emergência</strong>, dinheiro para imprevistos que você não quer ser obrigado a resgatar vendendo ações no pior momento. Essa reserva mora em renda fixa de liquidez diária, não na bolsa: veja o <a href="/tesouro">Tesouro Direto</a> para entender onde guardá-la. Segundo, ter clareza do seu objetivo e do prazo, porque ação é ferramenta de longo prazo.',
        },
        {
          kind: 'p',
          html: 'Para transformar objetivo em número (quanto aportar por mês, quanto isso vira em alguns anos), use as <a href="/calculadoras">calculadoras da Redentia</a>. Um plano de aportes regulares vence, no longo prazo, a tentativa de acertar o momento exato de comprar.',
        },
      ],
    },
    {
      id: 'sec-6',
      title: 'Os erros que quebram iniciantes',
      blocks: [
        {
          kind: 'p',
          html: 'A maioria dos prejuízos de quem começa não vem de escolher a ação errada, vem de comportamento. Fuja destes:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Colocar tudo em uma ação só.</strong> Concentração amplia tanto o ganho quanto a perda. No começo, ela costuma cobrar caro.',
            '<strong>Seguir dica de grupo ou influenciador.</strong> Comprar porque alguém mandou é apostar com o dinheiro dos outros decidindo por você.',
            '<strong>Confundir investir com day trade.</strong> Comprar e vender no mesmo dia é outra atividade, de altíssimo risco, e a estatística dos que ganham consistentemente é pequena.',
            '<strong>Investir sem reserva de emergência.</strong> Sem colchão, qualquer imprevisto obriga a vender ação na baixa.',
            '<strong>Vender no pânico.</strong> Quedas fazem parte. Vender só porque o preço caiu, sem a tese ter mudado, transforma oscilação em prejuízo real.',
          ],
        },
      ],
    },
    {
      id: 'sec-7',
      title: 'E o Imposto de Renda?',
      blocks: [
        {
          kind: 'p',
          html: 'Investir em ações cria obrigações com a Receita, e vale saber disso desde a primeira compra. Em regra, há isenção sobre o lucro em vendas de ações até um certo limite mensal, e o que passa disso é tributado; dividendos e a posse das ações também precisam ser informados na declaração anual, mesmo quando não há imposto a pagar.',
        },
        {
          kind: 'p',
          html: 'As regras têm detalhes que mudam conforme o tipo de operação, então trate isso como parte do processo, não como surpresa de abril. O passo a passo completo está no guia de <strong>como declarar investimentos no IR</strong>, logo abaixo.',
        },
      ],
    },
  ],
  cta: {
    title: 'Descubra ações por fundamento',
    subtitle: 'Compare empresas por lucro, dívida e valuation · grátis para começar',
    to: '/rankings',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'Quanto dinheiro preciso para começar a investir em ações?',
      a: 'Não há um mínimo alto: é possível comprar uma única ação, e muitas custam poucas dezenas de reais. Comece pequeno enquanto aprende. Antes disso, garanta uma reserva de emergência em renda fixa de liquidez diária.',
    },
    {
      q: 'Investir em ações é seguro?',
      a: 'Ações oscilam e podem cair no curto prazo, então não são adequadas para dinheiro que você vai precisar em breve. O risco se controla com diversificação, prazo longo e escolha por fundamento, nunca por palpite. A corretagem em si, em instituição regulada pela CVM, é segura; o risco é o de mercado.',
    },
    {
      q: 'Posso perder mais do que investi em ações?',
      a: 'Na compra de ações à vista, não: o máximo que você perde é o valor investido, caso a ação vá a zero. Perder mais do que se aplicou só ocorre em operações alavancadas, como certos derivativos, que não são o caminho de quem está começando.',
    },
    {
      q: 'Qual a diferença entre ação e fundo imobiliário?',
      a: 'Ação é participação em uma empresa; fundo imobiliário (FII) é uma cota de um fundo que investe em imóveis ou títulos do setor e costuma distribuir rendimento mensal. Muita gente combina os dois na carteira. Veja o guia de FIIs para entender quando cada um faz sentido.',
    },
    {
      q: 'Preciso declarar ações no Imposto de Renda?',
      a: 'Sim. A posse das ações e os dividendos recebidos entram na declaração anual, mesmo sem imposto a pagar, e o lucro em vendas pode ser tributado acima de certos limites. O guia de como declarar investimentos no IR traz o passo a passo.',
    },
  ],
  related: ['Melhores FIIs 2026', 'Tesouro Direto para iniciantes', 'Como declarar investimentos no IR'],
}
