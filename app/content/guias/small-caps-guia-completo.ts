/**
 * Guia: Small caps, guia completo (Grupo A do KIT de guias Nu).
 *
 * Conteúdo HONESTO e principiológico: NENHUM ticker, cotação, valor de mercado
 * ou retorno apresentado como fato de mercado. O guia ensina o QUE são small
 * caps, os RISCOS reais e COMO avaliá-las por fundamento, sem apontar empresa.
 * Números nos stat cards são estruturais (quantos filtros, faixa de alocação
 * sugerida como princípio de bolso), não previsão de mercado. Qualquer faixa de
 * valor de mercado é ilustrativa e sinalizada, nunca corte oficial fixo.
 *
 * HTML dos blocos é local e confiável: só <strong> e <a href> internos.
 */
import type { GuideDoc } from '~/types/guias'

export const SMALL_CAPS_GUIA_COMPLETO_GUIDE: GuideDoc = {
  slug: 'small-caps-guia-completo',
  tag: 'Ações',
  title: 'Small caps: guia completo',
  dek: 'Empresas menores oferecem o maior potencial de crescimento e o maior risco da bolsa. Entenda o que são small caps, onde mora o perigo e como avaliar uma sem se iludir com a promessa de multiplicar.',
  description:
    'Small caps: guia completo sobre ações de empresas menores. O que são, por que atraem, os riscos reais (liquidez, volatilidade, informação) e como avaliar por fundamento. Guia claro e honesto da Redentia, sem indicar ticker.',
  summary:
    'Small caps são a promessa de multiplicar e a chance de perder pesado, no mesmo papel. Entenda o que são, os riscos que ninguém conta no grupo de dica e como avaliar uma empresa menor sem apostar às cegas.',
  minutes: 9,
  author: 'Equipe Redentia',
  datePublished: '2026-07-13',
  dateModified: '2026-07-13',
  updatedLine: 'Atualizado em 13 jul 2026 · 9 min de leitura',
  updatedShort: 'atualizado em jul 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'O que são small caps',
      blocks: [
        {
          kind: 'p',
          html: 'A resposta curta: small caps são ações de empresas de menor valor de mercado, as pequenas da bolsa. Não é uma categoria de "empresa ruim", é uma questão de tamanho: companhias menores, muitas vezes mais jovens ou em setores de nicho, que ainda têm bastante espaço para crescer. Justamente por isso, oferecem o maior potencial de valorização e, no mesmo pacote, <strong>o maior risco</strong> da renda variável.',
        },
        {
          kind: 'p',
          html: 'O oposto delas são as blue chips, as gigantes conhecidas, com anos de histórico e negociação intensa. Não existe um corte oficial e fixo que separe uma da outra: a classificação de "small" varia conforme o critério de cada análise (faixa ilustrativa, muda com o mercado). O que importa não é o rótulo, é entender por que o tamanho menor muda tanto o jogo, que é o assunto deste guia.',
        },
        {
          kind: 'stats',
          items: [
            { value: '5', label: 'filtros de fundamento antes de comprar' },
            { value: '3', label: 'riscos que definem uma small cap' },
            { value: '0', label: 'promessa de multiplicar por palpite' },
          ],
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'Por que small caps atraem tanta gente',
      blocks: [
        {
          kind: 'p',
          html: 'O apelo é matemático. É mais fácil uma empresa pequena dobrar de tamanho do que uma gigante. Uma companhia que fatura pouco tem mais avenidas de crescimento pela frente, e quando o mercado percebe esse crescimento, a valorização da ação pode ser expressiva. Boa parte das grandes histórias de retorno da bolsa começou com empresas que eram small caps.',
        },
        {
          kind: 'p',
          html: 'Há também um argumento de ineficiência: empresas menores são menos acompanhadas por analistas e por grandes investidores. Isso significa que, em tese, sobra mais espaço para o investidor atento encontrar uma boa empresa antes da multidão. É o terreno onde a análise por fundamento rende mais, porque há menos gente olhando.',
        },
        {
          kind: 'p',
          html: 'O problema é confundir esse potencial com garantia. Para cada small cap que multiplicou, várias estagnaram ou quebraram. O potencial de alta é real, mas ele vem grudado a um conjunto de riscos que a próxima seção detalha, e ignorá-los é a forma mais rápida de transformar a promessa em prejuízo.',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'Os três riscos que definem uma small cap',
      blocks: [
        {
          kind: 'p',
          html: 'Antes de sonhar com o retorno, entenda o que você está assumindo. Small caps carregam três riscos que as grandes empresas atenuam:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Liquidez baixa.</strong> Poucas negociações por dia. Você pode ter dificuldade de vender sem derrubar o próprio preço, e um vendedor grande consegue mexer com a cotação sozinho. Entrar é fácil; sair na hora errada, caro.',
            '<strong>Volatilidade alta.</strong> Com menos gente negociando, o preço balança muito mais. Oscilações fortes em poucos dias são normais aqui, e exigem estômago e prazo longo para não vender no pânico.',
            '<strong>Menos informação e mais fragilidade.</strong> Empresas menores têm menos cobertura de analistas, menos histórico e, muitas vezes, dependência de poucos clientes, produtos ou de um endividamento que pesa quando os juros sobem. Um tropeço isolado afeta mais uma pequena do que uma gigante.',
          ],
        },
        {
          kind: 'p',
          html: 'Nenhum desses riscos torna small cap um mau investimento. Eles apenas explicam por que ela não pode ser tratada como uma blue chip, e por que o tamanho da posição na carteira precisa respeitar esse perfil.',
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'Como avaliar uma small cap sem se iludir',
      blocks: [
        {
          kind: 'p',
          html: 'A empolgação com a "próxima que vai multiplicar" é justamente o que faz o investidor pular a análise. Em empresa pequena, o fundamento importa mais, não menos. Passe cada candidata por estes filtros:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Você entende como ela ganha dinheiro?</strong> Em nichos pouco cobertos, entender o negócio é sua maior vantagem. Se não consegue explicar o modelo, não comprou uma empresa, comprou uma esperança.',
            '<strong>Ela já dá lucro, ou só promete dar?</strong> Muita small cap vive de história futura. Prefira empresas que já geram caixa a teses que dependem de tudo dar certo lá na frente.',
            '<strong>A dívida está sob controle?</strong> Endividamento alto derruba empresa pequena com facilidade quando o crédito encarece. Compare o endividamento com o de pares do mesmo setor.',
            '<strong>Qual é a liquidez da ação?</strong> Confira o volume negociado. Baixa liquidez significa que você pode ficar preso na hora de vender.',
            '<strong>Quem manda na empresa está alinhado?</strong> Em empresas menores, a qualidade e a honestidade dos controladores pesam muito. Governança fraca é risco que não aparece no gráfico.',
          ],
        },
        {
          kind: 'p',
          html: 'Cada um desses filtros vira uma coluna comparável nos <a href="/rankings">rankings da Redentia</a>, e a leitura completa por empresa vive na página do ativo. Se você não faria essa lição de casa, a small cap não é para você, e tudo bem.',
        },
      ],
    },
    {
      id: 'sec-5',
      title: 'Quanto alocar em small caps',
      blocks: [
        {
          kind: 'p',
          html: 'Small cap é tempero, não é o prato principal. O erro clássico do iniciante é colocar a maior parte da carteira nas pequenas, atrás do retorno explosivo, e ficar exposto demais ao risco que elas carregam. O papel delas é adicionar potencial de crescimento a uma base já sólida, não substituir essa base.',
        },
        {
          kind: 'p',
          html: 'Como princípio de bolso, elas costumam ocupar uma fatia menor da carteira de renda variável, dimensionada ao seu apetite a risco e sempre diversificada entre várias empresas (uma small cap só concentra risco demais). Isso é orientação geral, não fórmula: o percentual certo depende do seu perfil, do seu prazo e do tamanho da sua reserva de emergência.',
        },
        {
          kind: 'p',
          html: 'E a ordem importa: antes de qualquer small cap vêm a <strong>reserva de emergência</strong> em renda fixa de liquidez diária e uma base de empresas mais sólidas. Para dimensionar aportes e enxergar quanto uma fatia pequena rende no longo prazo, use as <a href="/calculadoras">calculadoras da Redentia</a>. Aportes regulares e diversificação vencem, no tempo, a caça à próxima multiplicadora.',
        },
      ],
    },
    {
      id: 'sec-6',
      title: 'Os erros que quebram quem aposta em small caps',
      blocks: [
        {
          kind: 'p',
          html: 'Os prejuízos com small caps quase sempre vêm dos mesmos deslizes de comportamento. Fuja destes:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Comprar pela promessa, sem olhar o fundamento.</strong> "Essa vai multiplicar" não é análise. Sem lucro, dívida e negócio compreendidos, é aposta.',
            '<strong>Concentrar a carteira em uma pequena.</strong> A volatilidade que empolga na alta destrói na queda. Diversifique entre empresas e setores.',
            '<strong>Ignorar a liquidez.</strong> Descobrir que não consegue vender por um preço justo é o susto mais comum com small caps pouco negociadas.',
            '<strong>Seguir dica de grupo ou influenciador.</strong> Empresas pouco cobertas são o terreno favorito de esquemas de inflar e despejar (pump and dump). Se a dica veio pronta, desconfie.',
            '<strong>Vender no pânico.</strong> Oscilações fortes fazem parte do jogo. Vender só porque caiu, sem a tese ter mudado, trava o prejuízo.',
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
          html: 'Small caps são ações, então seguem exatamente as mesmas regras tributárias de qualquer papel. Em geral, há isenção sobre o lucro em vendas de ações até um certo limite de vendas por mês, e o que passa disso é tributado; a posse das ações e os dividendos recebidos precisam ser informados na declaração anual, mesmo quando não há imposto a pagar.',
        },
        {
          kind: 'p',
          html: 'A alta rotatividade que muita gente pratica com small caps, comprando e vendendo com frequência, pode fazer as vendas mensais ultrapassarem o limite de isenção mais rápido do que se imagina. Trate o imposto como parte do processo desde a primeira operação: o passo a passo completo está no guia de <strong>como declarar investimentos no IR</strong>, logo abaixo.',
        },
      ],
    },
  ],
  cta: {
    title: 'Avalie empresas por fundamento, do porte que for',
    subtitle: 'Lucro, dívida, liquidez e valuation lado a lado · grátis para começar',
    to: '/rankings',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'O que são small caps?',
      a: 'São ações de empresas de menor valor de mercado, as pequenas da bolsa. Costumam ser mais jovens ou de setores de nicho, com mais espaço para crescer, o que traz maior potencial de valorização e também maior risco. Não há um corte oficial fixo que separe small caps de empresas maiores; a classificação varia conforme o critério.',
    },
    {
      q: 'Small caps são um bom investimento?',
      a: 'Podem ser, para quem entende e aceita o risco. Elas oferecem o maior potencial de crescimento da bolsa, mas junto vêm liquidez baixa, volatilidade alta e menos informação. Fazem sentido como uma fatia menor de uma carteira diversificada, escolhidas por fundamento, nunca como aposta única atrás de multiplicar.',
    },
    {
      q: 'Quanto da carteira devo colocar em small caps?',
      a: 'Como princípio geral, uma fatia menor da parte de renda variável, dimensionada ao seu apetite a risco e sempre diversificada entre várias empresas. Não existe percentual fixo: depende do seu perfil, do seu prazo e de já ter reserva de emergência e uma base mais sólida antes.',
    },
    {
      q: 'Qual a diferença entre small cap e blue chip?',
      a: 'Blue chips são as grandes empresas, com longo histórico e negociação intensa, mais estáveis e previsíveis. Small caps são as pequenas, com mais potencial de crescimento, porém mais voláteis e menos líquidas. Muita gente combina as duas: base em empresas sólidas e um tempero de small caps.',
    },
    {
      q: 'Por que small caps caem tanto?',
      a: 'Com menos gente negociando, o preço balança muito mais, e um único vendedor grande consegue mexer com a cotação. Somam-se a isso a menor cobertura de análise e a fragilidade de empresas que dependem de poucos clientes ou de dívida alta. Volatilidade forte é característica do porte, não anomalia.',
    },
    {
      q: 'Preciso declarar small caps no Imposto de Renda?',
      a: 'Sim, valem as mesmas regras das ações: a posse e os dividendos entram na declaração anual, mesmo sem imposto a pagar, e o lucro em vendas pode ser tributado acima do limite mensal de isenção. Quem opera com frequência ultrapassa esse limite mais rápido. O guia de como declarar investimentos no IR traz o passo a passo.',
    },
  ],
  related: ['Como investir em ações', 'Melhores FIIs 2026', 'Como declarar investimentos no IR'],
}
