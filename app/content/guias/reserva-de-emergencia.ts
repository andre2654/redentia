/**
 * Guia: Reserva de emergência (guia fundacional de renda fixa).
 * Estrutura e qualidade espelham como-montar-carteira-de-investimentos.ts:
 * hero (dek) + seções h2 com blocos ricos (p/stats/steps/checks) + CTA + FAQ + related.
 *
 * Conteúdo HONESTO: nenhuma cotação, taxa, dividend yield, ticker ou
 * rentabilidade apresentada como fato de mercado. Referências a CDI, Selic e
 * FGC são conceituais (o que é e como funciona), nunca com número. O intervalo
 * de "3 a 6 meses" é apresentado como regra prática de mercado, não como
 * recomendação personalizada. Números nos stat cards são estruturais.
 *
 * HTML dos blocos é local e confiável: só <strong> e <a href> internos.
 */
import type { GuideDoc } from '~/types/guias'

export const RESERVA_DE_EMERGENCIA_GUIDE: GuideDoc = {
  slug: 'reserva-de-emergencia',
  tag: 'Renda fixa',
  title: 'Reserva de emergência: quanto guardar e onde investir',
  dek: 'O colchão que sustenta todo o resto da carteira: quanto ele precisa ter, onde ele deve morar e por que rendimento é o critério menos importante aqui.',
  description:
    'Reserva de emergência: quanto guardar, onde investir com liquidez diária e segurança, quais aplicações servem (e quais não servem), como montar aos poucos e quando é certo usar. Guia claro e honesto da Redentia.',
  summary:
    'Antes de qualquer investimento, vem o colchão. Veja como calcular o tamanho da sua reserva, onde deixar o dinheiro sem abrir mão de resgate rápido e por que buscar rendimento aqui costuma sair caro.',
  minutes: 8,
  author: 'Equipe Redentia',
  datePublished: '2026-07-22',
  dateModified: '2026-07-22',
  updatedLine: 'Atualizado em 22 jul 2026 · 8 min de leitura',
  updatedShort: 'atualizado em jul 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'O que é reserva de emergência (e por que ela vem antes de tudo)',
      blocks: [
        {
          kind: 'p',
          html: 'Reserva de emergência é o dinheiro guardado para imprevistos: perder o emprego, um problema de saúde, o carro que quebra, a reforma que não podia esperar. Ela não existe para render, existe para <strong>estar disponível no dia em que a vida cobra</strong>.',
        },
        {
          kind: 'p',
          html: 'É o primeiro passo de qualquer plano financeiro, e não por conservadorismo: sem colchão, o primeiro imprevisto te obriga a vender um investimento de longo prazo no pior momento possível, geralmente quando o mercado está em baixa. A reserva não protege só o seu bolso, protege o resto da sua carteira de decisões tomadas no susto.',
        },
        {
          kind: 'stats',
          items: [
            { value: '1º', label: 'passo de qualquer plano, antes de investir em risco' },
            { value: '3 a 6', label: 'meses de custo de vida como regra prática de tamanho' },
            { value: 'D+0', label: 'liquidez ideal: dinheiro que volta no mesmo dia' },
          ],
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'Quanto guardar: a conta é do seu custo, não da sua renda',
      blocks: [
        {
          kind: 'p',
          html: 'O erro mais comum é calcular a reserva sobre o salário. O número que importa é <strong>quanto você gasta por mês para viver</strong>, não quanto você ganha. Duas pessoas com a mesma renda podem precisar de reservas muito diferentes.',
        },
        {
          kind: 'steps',
          items: [
            'Some os seus gastos essenciais de um mês: moradia, alimentação, transporte, contas de casa, saúde, educação e as parcelas que não param se a renda parar.',
            'Multiplique esse custo mensal pelo número de meses que você quer cobrir. A regra prática mais usada no mercado é de 3 a 6 meses.',
            'Ajuste o multiplicador ao seu tipo de renda e à sua realidade: quanto mais instável a entrada de dinheiro, maior a reserva precisa ser.',
            'Escreva o valor final e trate como meta. Reserva sem número definido vira intenção, não plano.',
          ],
        },
        {
          kind: 'p',
          html: 'Sobre o multiplicador: quem tem carteira assinada, estabilidade e poucos dependentes costuma ficar confortável na faixa mais baixa. Quem é autônomo, PJ, empreendedor, tem renda sazonal ou sustenta outras pessoas tende a precisar da faixa mais alta, às vezes acima dela. O critério não é medo, é <strong>quanto tempo você levaria para recompor a renda</strong> se ela sumisse amanhã.',
        },
        {
          kind: 'p',
          html: 'Para transformar essa meta em um aporte mensal realista, as <a href="/calculadoras">calculadoras da Redentia</a> ajudam a chegar no valor que cabe no seu orçamento e no prazo para fechar a conta.',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'Onde investir: os três critérios que mandam',
      blocks: [
        {
          kind: 'p',
          html: 'A escolha da aplicação da reserva se resolve com três perguntas, sempre nesta ordem. Rendimento é a última delas, e de propósito:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Liquidez.</strong> O dinheiro precisa voltar rápido, de preferência no mesmo dia do pedido. Emergência não espera prazo de resgate nem janela de vencimento.',
            '<strong>Segurança e baixa oscilação.</strong> O valor não pode balançar. Se a aplicação pode estar valendo menos justo no dia em que você precisa sacar, ela não serve como reserva, por melhor que seja o histórico.',
            '<strong>Rendimento.</strong> Importa, mas é o critério de desempate. Trocar liquidez ou segurança por um pouco mais de retorno descaracteriza a função da reserva.',
          ],
        },
        {
          kind: 'p',
          html: 'Na prática, isso aponta para aplicações de renda fixa pós-fixadas com resgate diário: o Tesouro Selic, títulos bancários com liquidez diária e cobertura do FGC dentro do limite vigente por CPF e instituição, e fundos simples de baixíssimo risco atrelados ao CDI. O que essas opções têm em comum é acompanhar a taxa básica de juros sem oscilar contra você no caminho.',
        },
        {
          kind: 'p',
          html: 'O guia de <a href="/guias/tesouro-direto-para-iniciantes">Tesouro Direto para iniciantes</a> explica por que o título pós-fixado é o único da família que não sofre marcação a mercado relevante no resgate antecipado, e a página de <a href="/tesouro">títulos do Tesouro</a> mostra os papéis disponíveis hoje.',
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'Onde a reserva não deve morar',
      blocks: [
        {
          kind: 'p',
          html: 'Tão importante quanto saber onde colocar é saber o que descartar. Nenhuma das opções abaixo é ruim por natureza, elas apenas não cumprem o papel de reserva:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Ações e fundos imobiliários.</strong> Podem estar em queda exatamente no mês em que você precisa do dinheiro. Reserva não combina com oscilação.',
            '<strong>Cripto.</strong> Alta volatilidade é o oposto da função aqui, mesmo para quem acredita no ativo no longo prazo.',
            '<strong>Renda fixa com carência ou vencimento longo.</strong> CDBs travados até o vencimento, LCIs e LCAs com carência e prefixados só entregam o combinado se você segurar. Emergência não segura.',
            '<strong>Poupança.</strong> Tem liquidez, mas a regra de rendimento por aniversário faz com que sacar antes da data mensal jogue fora o ganho do período. Existem opções com a mesma segurança e menos amarras.',
            '<strong>Dinheiro parado na conta corrente.</strong> É o mais líquido de todos e o único que garante perder para a inflação todo mês.',
          ],
        },
        {
          kind: 'p',
          html: 'Se você já tem parte do patrimônio espalhado por várias instituições e não sabe onde está o quê, o <a href="/guias/open-finance">Open Finance</a> resolve o inventário: você conecta as contas e enxerga tudo em um lugar antes de decidir o que é reserva e o que é investimento.',
        },
      ],
    },
    {
      id: 'sec-5',
      title: 'Como montar quando o orçamento é apertado',
      blocks: [
        {
          kind: 'p',
          html: 'Reserva de seis meses assusta quem está começando, e o susto costuma virar paralisia. A saída é tratar o número final como destino, não como pedágio de entrada.',
        },
        {
          kind: 'steps',
          items: [
            'Comece por um mês de custo de vida. Essa primeira faixa já tira você da zona em que qualquer imprevisto vira dívida no cartão.',
            'Automatize um aporte fixo no dia do recebimento, antes de qualquer gasto. Guardar o que sobra quase nunca funciona.',
            'Direcione dinheiro fora do ciclo (13º, férias, bônus, restituição) inteiro para a reserva até fechar a meta.',
            'Só depois de completar a reserva, comece a alocar aportes em renda variável e objetivos de longo prazo.',
          ],
        },
        {
          kind: 'p',
          html: 'Quem tem dívida cara, como rotativo do cartão e cheque especial, tem uma ordem diferente: monte uma reserva mínima para não gerar dívida nova e ataque o juro alto em paralelo. Nenhuma aplicação conservadora rende o que essas dívidas cobram, então quitar é a melhor aplicação disponível.',
        },
        {
          kind: 'p',
          html: 'Com a reserva de pé, o próximo passo é decidir o destino do dinheiro que sobra. O guia de <a href="/guias/como-montar-carteira-de-investimentos">como montar uma carteira de investimentos</a> mostra como alocar por objetivo e prazo, e o de <a href="/guias/como-investir-em-acoes">como investir em ações</a> cobre a parte de renda variável.',
        },
      ],
    },
    {
      id: 'sec-6',
      title: 'Quando usar (e como repor depois)',
      blocks: [
        {
          kind: 'p',
          html: 'Reserva parada é reserva funcionando. Ela não precisa render bem nem crescer, precisa estar lá. Mas ela também não é intocável: guardar por anos e nunca usar em uma emergência real é confundir disciplina com paralisia.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Use quando for imprevisto e urgente.</strong> Perda de renda, saúde, um bem essencial que quebrou. Nesses casos, usar a reserva é o plano dando certo, não uma falha.',
            '<strong>Não use para o que dá para planejar.</strong> Viagem, troca de carro, festa e sonhos com data marcada são objetivos de médio prazo e pedem uma reserva própria, separada.',
            '<strong>Não use para aproveitar oportunidade de mercado.</strong> Queda de bolsa não é emergência. Sacar o colchão para comprar na baixa deixa você sem colchão exatamente na fase mais instável.',
            '<strong>Reponha assim que a poeira baixar.</strong> Volte a aportar até restaurar o valor original, e revise a meta se seu custo de vida mudou desde o cálculo.',
          ],
        },
        {
          kind: 'p',
          html: 'Vale ainda revisar o tamanho da reserva uma vez por ano, ou sempre que a vida mudar de patamar: mudança de emprego, filho, novo aluguel, nova dívida. Custo de vida sobe em silêncio, e uma reserva calculada há três anos costuma cobrir menos meses do que você imagina.',
        },
        {
          kind: 'p',
          html: 'Para acompanhar onde cada parte do seu dinheiro está e se a reserva continua do tamanho certo, a <a href="/carteira">carteira da Redentia</a> reúne as suas posições em uma visão só.',
        },
      ],
    },
  ],
  cta: {
    title: 'Veja quanto guardar por mês para fechar a sua reserva',
    subtitle: 'Calculadoras gratuitas da Redentia · sem cadastro para simular',
    to: '/calculadoras',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'Quanto devo ter na reserva de emergência?',
      a: 'A conta é feita sobre o seu custo de vida mensal, não sobre a sua renda. A regra prática mais usada é de 3 a 6 meses de gastos essenciais. Quem tem renda estável e poucos dependentes costuma ficar bem na faixa mais baixa; quem é autônomo, PJ ou tem renda sazonal tende a precisar da faixa mais alta ou acima dela.',
    },
    {
      q: 'Onde investir a reserva de emergência?',
      a: 'Em aplicações de renda fixa pós-fixadas com liquidez diária e baixa oscilação, como Tesouro Selic, títulos bancários com resgate diário e cobertura do FGC dentro do limite vigente, ou fundos simples atrelados ao CDI. A ordem dos critérios é liquidez, segurança e só então rendimento.',
    },
    {
      q: 'Poupança serve para reserva de emergência?',
      a: 'Serve no sentido de que tem liquidez e segurança, mas costuma ser uma escolha ruim: o rendimento só é creditado na data de aniversário do depósito, então resgatar antes desse dia faz você perder o ganho do período inteiro. Existem alternativas com a mesma facilidade de resgate e sem essa amarra.',
    },
    {
      q: 'Posso deixar a reserva em CDB ou LCI?',
      a: 'Depende das condições do papel. CDB com liquidez diária e cobertura do FGC pode cumprir o papel. Já títulos com carência, vencimento longo ou prefixados não servem como reserva, porque só entregam o combinado se você segurar até o fim, e emergência não espera. LCIs e LCAs costumam ter carência, o que as tira da lista.',
    },
    {
      q: 'Devo montar a reserva antes de investir em ações?',
      a: 'Sim. Sem o colchão, o primeiro imprevisto obriga a vender investimentos de longo prazo no momento errado, muitas vezes no prejuízo. A reserva protege a carteira de decisões tomadas sob pressão, e por isso vem antes de qualquer alocação em renda variável.',
    },
    {
      q: 'Posso usar a reserva para aproveitar uma queda da bolsa?',
      a: 'Não é recomendado. Queda de mercado não é emergência, e usar o colchão para comprar na baixa deixa você sem proteção justamente no período de maior instabilidade. Oportunidade de mercado se financia com aporte novo ou com a parte da carteira destinada a risco, nunca com a reserva.',
    },
  ],
  related: ['Tesouro Direto para iniciantes', 'Como montar uma carteira de investimentos', 'Como investir em ações'],
}
