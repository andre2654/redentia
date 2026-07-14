/**
 * Guia: Bitcoin na carteira: quanto alocar? (Grupo C do KIT de guias Nu).
 * Estrutura e qualidade espelham o exemplar como-investir-em-acoes.ts:
 * hero + seções h2 com blocos ricos (p/stats/steps/checks) + CTA + FAQ + related.
 *
 * Conteúdo HONESTO e principiológico: nenhum preço, cotação, preço-alvo ou
 * retorno de bitcoin apresentado como fato. As faixas de alocação (%) são
 * ILUSTRATIVAS e sinalizadas como referência educacional de perfil de risco,
 * nunca recomendação personalizada. Números nos stat cards são estruturais
 * ou faixas ilustrativas explicitamente marcadas.
 *
 * HTML dos blocos é local e confiável: só <strong> e <a href> internos.
 */
import type { GuideDoc } from '~/types/guias'

export const BITCOIN_NA_CARTEIRA_GUIDE: GuideDoc = {
  slug: 'bitcoin-na-carteira',
  tag: 'Cripto',
  title: 'Bitcoin na carteira: quanto alocar?',
  dek: 'A pergunta certa não é se bitcoin sobe, é quanto dele cabe na sua carteira sem tirar seu sono. Faixas por perfil, a tese de reserva e o que a volatilidade cobra.',
  description:
    'Quanto alocar em bitcoin na carteira: faixas ilustrativas por perfil de risco, a tese de reserva de valor, como lidar com a volatilidade, custódia segura e o que declarar no Imposto de Renda. Guia principiológico da Redentia, sem preço-alvo.',
  summary:
    'Bitcoin não é aposta de tudo ou nada. Veja as faixas de alocação por perfil, a tese por trás do ativo, o que a volatilidade cobra de quem entra e como não errar na custódia.',
  minutes: 6,
  author: 'Equipe Redentia',
  datePublished: '2026-07-13',
  dateModified: '2026-07-13',
  updatedLine: 'Atualizado em 13 jul 2026 · 6 min de leitura',
  updatedShort: 'atualizado em jul 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'Quanto de bitcoin faz sentido',
      blocks: [
        {
          kind: 'p',
          html: 'A resposta curta e honesta: <strong>uma fatia pequena da carteira</strong>, do tamanho de um dinheiro que você aguentaria ver cair pela metade sem mudar de vida. Bitcoin pode ter espaço em uma carteira, mas como tempero, não como prato principal. Quem coloca a maior parte do patrimônio em cripto está apostando, não investindo.',
        },
        {
          kind: 'p',
          html: 'A pergunta certa não é <strong>se</strong> o bitcoin vai subir, porque ninguém sabe, e este guia não dá preço-alvo. A pergunta é quanto dele cabe na sua carteira sem tirar seu sono, e essa resposta depende do seu perfil de risco, não de uma previsão de mercado.',
        },
        {
          kind: 'stats',
          items: [
            { value: 'até 5%', label: 'faixa ilustrativa, perfil conservador' },
            { value: 'até 10%', label: 'faixa ilustrativa, perfil arrojado' },
            { value: '0', label: 'antes da reserva de emergência montada' },
          ],
        },
        {
          kind: 'p',
          html: 'Esses percentuais são <strong>faixas ilustrativas de referência</strong>, não uma recomendação para o seu caso. Servem para você calibrar a ordem de grandeza: cripto costuma aparecer como parcela minoritária da carteira, e o número exato depende do seu prazo, do seu estômago e do resto do que você já tem investido.',
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'A tese: por que existe na carteira',
      blocks: [
        {
          kind: 'p',
          html: 'Antes de decidir quanto, vale entender por que alguém colocaria bitcoin numa carteira. A tese não é "vai valorizar", é estrutural:',
        },
        {
          kind: 'p',
          html: '<strong>1. Escassez programada.</strong> O bitcoin tem uma quantidade máxima fixada em código: nunca existirão mais do que 21 milhões de unidades. Diferente de moeda emitida por governo, ninguém pode aumentar a oferta por decreto. É essa escassez, e não uma promessa de rendimento, que sustenta a tese de reserva de valor.',
        },
        {
          kind: 'p',
          html: '<strong>2. Descorrelação parcial.</strong> Por não depender de um governo ou de uma empresa específica, o bitcoin às vezes se move de forma diferente de ações e renda fixa. Numa carteira, um ativo que nem sempre anda junto com os outros pode reduzir o risco do conjunto, desde que em dose pequena.',
        },
        {
          kind: 'p',
          html: '<strong>3. Opcionalidade.</strong> É uma aposta assimétrica: a perda máxima é o que você colocou, mas a tese de longo prazo é aberta. Por isso a lógica de alocar pouco, o suficiente para participar do cenário otimista sem se arruinar no pessimista.',
        },
        {
          kind: 'p',
          html: 'Essa mesma lógica de <strong>não depender de um único ativo</strong> vale para o resto da carteira. Se você ainda está montando a base, comece pelo <a href="/guias/como-investir-em-acoes">guia de ações</a> e pelo <a href="/tesouro">Tesouro Direto</a>, cripto vem depois, não antes.',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'Quanto alocar por perfil',
      blocks: [
        {
          kind: 'p',
          html: 'Não existe percentual universal. O que existe é uma faixa que combina com o quanto de oscilação você aguenta sem vender no pânico. Use as referências ilustrativas abaixo como ponto de partida, não como regra:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Conservador.</strong> Prioriza dormir tranquilo. Se cripto entrar, entra em dose homeopática, algo como uma fatia de um dígito baixo da carteira, ou simplesmente zero. Não há nada de errado em não ter bitcoin.',
            '<strong>Moderado.</strong> Aceita alguma oscilação em troca de participar da tese. Uma fatia pequena, ainda minoritária, que não desequilibre a carteira se despencar.',
            '<strong>Arrojado.</strong> Tolera volatilidade alta e tem horizonte longo. Pode ir a uma fração de dois dígitos, mas ainda assim uma minoria clara do patrimônio, nunca a maior posição.',
          ],
        },
        {
          kind: 'p',
          html: 'A régua que vale para todos os perfis: <strong>a queda máxima possível não pode quebrar o seu plano</strong>. Se uma queda forte do bitcoin te obrigaria a mudar objetivos de vida, adiar uma compra importante ou vender outros ativos, a sua fatia está grande demais. Diminua até o ponto em que a oscilação vira ruído, não tragédia.',
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'A volatilidade que ninguém te avisa',
      blocks: [
        {
          kind: 'p',
          html: 'Bitcoin oscila muito mais que ações. Isso não é defeito nem sinal de que algo está errado, é a natureza do ativo, e é o preço de entrada da tese. Quem aloca precisa entrar sabendo o que vem:',
        },
        {
          kind: 'p',
          html: 'Quedas profundas fazem parte da história do ativo, e recuperações levam tempo, às vezes anos. Você vai ver o valor da sua posição cair de forma que assustaria qualquer investidor de ações, e depois subir com a mesma intensidade. <strong>A volatilidade só vira prejuízo de verdade quando ela te faz vender na baixa.</strong>',
        },
        {
          kind: 'p',
          html: 'Duas defesas contra o pânico: alocar pouco (uma fatia pequena oscilando não desequilibra o conjunto) e <strong>aportar aos poucos</strong>, em vez de tudo de uma vez. Comprar em parcelas regulares dilui o preço de entrada e tira de você a tarefa impossível de acertar o fundo. As <a href="/calculadoras">calculadoras da Redentia</a> ajudam a transformar isso num plano de aportes.',
        },
      ],
    },
    {
      id: 'sec-5',
      title: 'Como comprar e guardar com segurança',
      blocks: [
        {
          kind: 'p',
          html: 'A mecânica é simples; a segurança é o que separa quem investe de quem perde tudo por descuido. O caminho básico:',
        },
        {
          kind: 'steps',
          items: [
            '<strong>Use uma corretora de cripto regulada.</strong> Prefira plataformas sérias, com histórico e transparência. É por ali que você converte reais em bitcoin, com Pix ou transferência.',
            '<strong>Compre em parcelas, não de uma vez.</strong> Aportes regulares diluem o preço médio e evitam a armadilha de entrar tudo num topo.',
            '<strong>Entenda a custódia.</strong> Deixar na corretora é prático, mas você depende da segurança dela. Carteiras próprias (self-custody) te dão controle total, e também toda a responsabilidade: se perder a chave de acesso, ninguém recupera.',
            '<strong>Proteja suas chaves e senhas.</strong> Ative dois fatores, desconfie de qualquer um que peça sua chave privada e nunca clique em links de suposto suporte. Golpe de cripto é irreversível.',
            '<strong>Anote tudo para o Imposto de Renda.</strong> Guarde datas, valores e quantidades de cada compra e venda desde a primeira operação. Isso vira obrigação na declaração, como você vê na próxima seção.',
          ],
        },
        {
          kind: 'p',
          html: 'A regra de ouro da segurança em cripto: <strong>ninguém legítimo jamais vai te pedir sua chave privada ou sua senha</strong>. Toda mensagem que promete dobrar seu bitcoin ou resolver um "problema urgente" na sua conta é golpe.',
        },
      ],
    },
    {
      id: 'sec-6',
      title: 'E o Imposto de Renda?',
      blocks: [
        {
          kind: 'p',
          html: 'Ter e negociar cripto cria obrigações com a Receita, e vale saber disso desde a primeira compra. Em regra, há uma faixa de vendas mensais até certo limite em que o lucro fica isento, e acima disso o ganho é tributado; além disso, a posse dos ativos precisa ser informada na declaração anual, mesmo sem imposto a pagar.',
        },
        {
          kind: 'p',
          html: 'As regras de cripto vêm mudando com frequência, então confira sempre o que vale no ano vigente e trate isso como parte do processo, não como surpresa. O passo a passo completo, com os limites e como declarar, está no guia de <a href="/guias/como-declarar-investimentos-no-ir">como declarar investimentos no IR</a>.',
        },
      ],
    },
  ],
  cta: {
    title: 'Monte uma carteira que dorme tranquila',
    subtitle: 'Planeje seus aportes e o peso de cada ativo · grátis para começar',
    to: '/calculadoras',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'Qual o percentual ideal de bitcoin na carteira?',
      a: 'Não existe percentual universal. Como referência ilustrativa, cripto costuma aparecer como parcela minoritária da carteira, algo em uma faixa pequena para perfis conservadores e um pouco maior para arrojados. A régua real é: a queda máxima possível não pode quebrar o seu plano. Se te obrigaria a mudar objetivos de vida, está grande demais.',
    },
    {
      q: 'Bitcoin é seguro para investir?',
      a: 'Bitcoin oscila muito mais que ações e pode ter quedas profundas e prolongadas, então não é adequado para dinheiro que você vai precisar em breve nem para a maior parte do patrimônio. O risco se controla com dose pequena, aportes graduais e horizonte longo. A segurança operacional depende de você: use plataformas reguladas e nunca compartilhe suas chaves.',
    },
    {
      q: 'Preciso ter reserva de emergência antes de comprar bitcoin?',
      a: 'Sim. A reserva de emergência, em renda fixa de liquidez diária, vem sempre antes de qualquer ativo volátil. Sem esse colchão, um imprevisto pode te obrigar a vender bitcoin no pior momento. Cripto é a última camada da carteira, não a primeira.',
    },
    {
      q: 'Preciso declarar bitcoin no Imposto de Renda?',
      a: 'Sim. A posse dos criptoativos entra na declaração anual mesmo sem imposto a pagar, e o lucro nas vendas pode ser tributado acima de certos limites mensais. As regras de cripto mudam com frequência, então confirme o ano vigente. O guia de como declarar investimentos no IR traz o passo a passo.',
    },
    {
      q: 'É melhor comprar bitcoin de uma vez ou aos poucos?',
      a: 'Comprar em parcelas regulares dilui o preço médio de entrada e evita a armadilha de aplicar tudo num topo. Como ninguém acerta o fundo de forma consistente, aportar aos poucos costuma ser a decisão mais tranquila, principalmente num ativo tão volátil.',
    },
  ],
  related: ['Como investir em ações', 'Tesouro Direto para iniciantes', 'Como declarar investimentos no IR'],
}
