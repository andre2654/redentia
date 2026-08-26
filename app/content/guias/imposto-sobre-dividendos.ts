/**
 * Guia: Imposto sobre dividendos (tag Dividendos).
 *
 * LACUNA QUE ELE FECHA. Três guias do site declaram explicitamente que não
 * respondem esta pergunta e mandam o leitor "confirmar a regra vigente":
 *   - como-declarar-investimentos-no-ir.ts: "A tributação dos dividendos é um
 *     ponto que vem sendo discutido e alterado".
 *   - calculadora-de-dividendos.ts: "Regras de tributação de proventos mudam
 *     conforme o tipo de ativo e a legislação vigente".
 *   - acoes-fiis-dividendos-todo-mes.ts: "a isenção do rendimento de FII não se
 *     estende automaticamente aos dividendos de ações, que têm regras próprias".
 * Nenhum guia respondia. Este responde.
 *
 * ESCOPO DELIBERADO, o que ele NÃO invade:
 *   - como-declarar-investimentos-no-ir: o passo a passo da DECLARAÇÃO (fichas,
 *     DARF, informe, malha fina). Aqui se explica como o provento é tributado na
 *     ORIGEM, não como preencher o programa da Receita.
 *   - acoes-fiis-dividendos-todo-mes: a ESTRATÉGIA de escada de proventos. Aqui
 *     não se monta carteira nem se escolhe pagador.
 *   - calculadora-de-dividendos: a conta de quanto aportar para uma META de
 *     renda. Aqui não há projeção de patrimônio.
 * Canibalização checada: /calculadora/dividend-yield mantém o termo de
 * ferramenta e /dividendos/{ticker} mantém o termo de ticker. Este guia fica com
 * a intenção informacional ("quem paga imposto sobre dividendos e quanto"), que
 * nenhuma superfície do site cobria.
 *
 * CONTEÚDO HONESTO: nenhuma cotação, dividend yield, rentabilidade, média
 * setorial ou ticker rotulado de caro ou barato. Os números aqui são ALÍQUOTAS E
 * LIMITES LEGAIS, apresentados como regra geral e sempre com a ressalva de
 * conferir a legislação vigente, porque regra tributária muda por lei. Os
 * números dos stat cards são estruturais (limites e alíquotas), não de mercado.
 *
 * HTML dos blocos é local e confiável: só <strong> e <a href> internos.
 */
import type { GuideDoc } from '~/types/guias'

export const IMPOSTO_SOBRE_DIVIDENDOS_GUIDE: GuideDoc = {
  slug: 'imposto-sobre-dividendos',
  tag: 'Dividendos',
  title: 'Imposto sobre dividendos: quem paga, quanto e o que mudou',
  dek: 'Por décadas o dividendo caía limpo na conta da pessoa física. Isso mudou, mas não para todo mundo: veja onde fica a linha, por que JCP segue outra regra e por que o rendimento de FII é um regime à parte.',
  description:
    'Imposto sobre dividendos no Brasil: a regra dos R$ 50 mil por mês, o efeito degrau, por que JCP é tributado diferente, o regime próprio dos FIIs e a tributação mínima das altas rendas. Guia claro e honesto da Redentia.',
  summary:
    'A isenção total dos dividendos acabou, mas o novo imposto tem um limite alto que a maioria dos investidores da B3 nunca encosta. Veja onde fica a linha, o que muda em JCP e FII e o que a regra de transição ainda protege.',
  minutes: 10,
  author: 'Equipe Redentia',
  datePublished: '2026-08-26',
  dateModified: '2026-08-26',
  updatedLine: 'Atualizado em 26 ago 2026 · 10 min de leitura',
  updatedShort: 'atualizado em ago 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'A pergunta que mudou de resposta',
      blocks: [
        {
          kind: 'p',
          html: 'Durante quase três décadas, a resposta para "quanto de imposto eu pago sobre <a href="/glossario/dividendos">dividendos</a>?" foi simples: nada. O lucro era tributado dentro da empresa e chegava isento na conta da pessoa física. Era a característica mais citada de quem investia pensando em renda.',
        },
        {
          kind: 'p',
          html: 'Essa resposta mudou. Desde 2026 existe retenção na fonte sobre lucros e dividendos pagos a pessoa física residente, mas ela só aparece <strong>acima de um limite mensal alto</strong>. O efeito prático é que o investidor de varejo típico da B3 continua recebendo dividendo sem retenção, enquanto sócio de empresa que se remunera por distribuição sente a mudança em cheio.',
        },
        {
          kind: 'p',
          html: 'Este guia explica onde exatamente fica essa linha e por que ela cai em lugares diferentes conforme o provento seja dividendo, juros sobre capital próprio ou rendimento de fundo imobiliário. Regra tributária muda por lei: trate os números abaixo como a regra geral do regime atual e <strong>confirme sempre o que está vigente</strong> antes de decidir.',
        },
        {
          kind: 'stats',
          items: [
            { value: '10%', label: 'de retenção na fonte sobre dividendos acima do limite mensal' },
            { value: 'R$ 50 mil', label: 'limite por mês, por empresa pagadora e por beneficiário' },
            { value: '17,5%', label: 'retenção sobre juros sobre capital próprio, que nunca foi isento' },
          ],
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'A regra dos R$ 50 mil: quem realmente é atingido',
      blocks: [
        {
          kind: 'p',
          html: 'A retenção de 10% incide quando <strong>uma mesma empresa</strong> paga a <strong>uma mesma pessoa física</strong> residente no Brasil mais de R$ 50 mil em lucros e dividendos <strong>dentro do mesmo mês</strong>. Os três elementos importam juntos, e é aí que quase toda confusão nasce.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Por empresa pagadora.</strong> O limite é medido por CNPJ, não pela sua carteira inteira. Receber de várias companhias diferentes no mesmo mês não soma para efeito do limite.',
            '<strong>Por beneficiário.</strong> A contagem é por CPF. Duas pessoas da mesma família com posições próprias têm cada uma o seu limite.',
            '<strong>Por mês.</strong> A janela é mensal, não anual. Se a mesma empresa fizer dois pagamentos no mesmo mês, eles se somam para verificar se o limite foi ultrapassado.',
          ],
        },
        {
          kind: 'p',
          html: 'Vale fazer a conta ao contrário para entender a escala. Para receber mais de R$ 50 mil de dividendo <strong>de uma única companhia em um único mês</strong>, é preciso uma posição concentrada de porte muito acima do que a esmagadora maioria dos investidores pessoa física carrega. Na prática, quem investe em ações pela bolsa quase nunca cruza esse limite, e quem cruza costuma ser sócio de empresa fechada recebendo distribuição de lucro, não acionista de companhia listada.',
        },
        {
          kind: 'p',
          html: 'Isso não torna o assunto irrelevante para quem investe pela B3. Torna a pergunta mais precisa: em vez de "dividendo agora paga imposto?", a pergunta certa é "eu cruzo o limite em alguma empresa da minha carteira em algum mês?". Para a maioria, a resposta é não, e o dividendo continua caindo integral.',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'O efeito degrau: por que ultrapassar o limite custa caro',
      blocks: [
        {
          kind: 'p',
          html: 'Aqui está a parte que mais surpreende, e o motivo de a regra ser chamada de degrau. Quando o pagamento do mês ultrapassa o limite, a alíquota <strong>não incide apenas sobre o excedente</strong>. Ela incide sobre o valor total distribuído naquele mês.',
        },
        {
          kind: 'p',
          html: 'É uma lógica diferente da tabela progressiva do salário, onde cada faixa é tributada na sua própria alíquota. Aqui a regra é binária: abaixo do limite, sem retenção; acima, 10% sobre tudo. Um único real a mais muda a base de cálculo inteira, e é exatamente isso que produz o degrau.',
        },
        {
          kind: 'steps',
          items: [
            'Some tudo o que a <strong>mesma empresa</strong> pagou a você em lucros e dividendos <strong>no mesmo mês</strong>.',
            'Compare esse total com o limite mensal de R$ 50 mil.',
            'Se ficou igual ou abaixo, não há retenção na fonte sobre esse pagamento.',
            'Se passou, a alíquota de 10% se aplica sobre <strong>o total do mês</strong>, e não apenas sobre a parte que excedeu.',
            'A retenção é feita pela fonte pagadora, então o valor já chega líquido na sua conta.',
          ],
        },
        {
          kind: 'p',
          html: 'A consequência prática é que, na faixa logo acima do limite, receber um pouco mais pode significar receber menos líquido do que quem ficou logo abaixo. É uma distorção conhecida do desenho da regra, e é a razão pela qual o calendário de pagamentos passou a ser um assunto relevante para quem recebe valores dessa ordem de uma mesma fonte.',
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'JCP não é dividendo, e a diferença aumentou',
      blocks: [
        {
          kind: 'p',
          html: 'Juros sobre capital próprio é uma forma alternativa de a empresa remunerar o acionista, e ele <strong>nunca foi isento</strong>. Muita gente lê "JCP" no extrato achando que é dividendo com outro nome e estranha o valor menor: a diferença é imposto retido na fonte, que já saiu antes de o dinheiro chegar.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>O dividendo</strong> sai do lucro depois do imposto da empresa e, para a pessoa física, só sofre retenção acima do limite mensal.',
            '<strong>O JCP</strong> é dedutível na apuração da empresa, o que reduz o imposto dela, e por isso sempre sofreu retenção na fonte na ponta do investidor.',
            '<strong>A alíquota do JCP subiu.</strong> A retenção passou de 15% para 17,5% a partir de 2026, e ela incide sobre o valor pago, sem o limite mensal que existe no dividendo.',
          ],
        },
        {
          kind: 'p',
          html: 'Por isso a comparação entre dois pagadores não pode parar no valor anunciado. Uma empresa que remunera via JCP entrega ao acionista um valor já tributado, enquanto outra que paga dividendo dentro do limite entrega integral. Ao ler <a href="/glossario/proventos">proventos</a> ou comparar <a href="/glossario/dividend-yield">dividend yield</a>, verifique se o número citado é bruto ou líquido, porque a diferença entre os dois regimes é real e mudou de tamanho.',
        },
        {
          kind: 'p',
          html: 'Do lado da empresa, a dedutibilidade do JCP continua sendo um incentivo relevante, então o instrumento não deve desaparecer. Para o investidor, a leitura correta é tratar dividendo e JCP como <strong>dois produtos com tributação distinta</strong>, e não como sinônimos.',
        },
      ],
    },
    {
      id: 'sec-5',
      title: 'FII: um regime separado, que não seguiu as ações',
      blocks: [
        {
          kind: 'p',
          html: 'O rendimento mensal distribuído por fundo imobiliário à pessoa física segue com <strong>isenção de imposto de renda</strong>, e essa isenção não foi absorvida pela regra dos dividendos de ações. São regimes separados, escritos em leis diferentes, e é por isso que a resposta muda conforme o ativo.',
        },
        {
          kind: 'p',
          html: 'A isenção não é automática: ela depende de condições do fundo e do cotista. Como referência geral, exige-se que as cotas sejam negociadas em bolsa, que o fundo tenha um número mínimo de cotistas e que o investidor não detenha participação relevante demais no próprio fundo. Fundo que não cumpre as condições não gera rendimento isento.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>O rendimento mensal</strong> costuma ser isento para pessoa física, respeitadas as condições do fundo.',
            '<strong>O ganho na venda da cota</strong> é tributado, e aqui não existe a faixa de isenção mensal que as ações têm nas vendas.',
            '<strong>Isento não é invisível.</strong> O rendimento isento continua obrigatório na declaração anual, como detalha o guia de <a href="/guias/como-declarar-investimentos-no-ir">como declarar investimentos no IR</a>.',
          ],
        },
        {
          kind: 'p',
          html: 'Registre também que essa isenção é alvo recorrente de propostas legislativas, e várias delas circularam sem virar lei. Como qualquer regra tributária, ela vale enquanto vigorar: se a sua decisão depende dela, confirme o texto em vigor no momento em vez de confiar em manchete. Para entender o produto antes da tributação, vale o guia de <a href="/guias/melhores-fiis-2026">FIIs</a>.',
        },
      ],
    },
    {
      id: 'sec-6',
      title: 'A tributação mínima das altas rendas',
      blocks: [
        {
          kind: 'p',
          html: 'Junto com a retenção sobre dividendos veio um segundo mecanismo, que funciona por fora dela: uma <strong>tributação mínima anual</strong> para quem tem renda total alta. A lógica declarada é garantir uma alíquota efetiva mínima para quem concentra ganhos em rendimentos isentos ou pouco tributados.',
        },
        {
          kind: 'p',
          html: 'Como regra geral do desenho atual, ela alcança quem soma mais de R$ 600 mil de rendimentos no ano-calendário, e a alíquota cresce de forma gradual dentro de uma faixa até atingir o teto de 10%. Não é uma retenção mensal: é uma apuração feita na declaração anual, que compara o que já foi pago com esse mínimo.',
        },
        {
          kind: 'stats',
          items: [
            { value: 'R$ 600 mil', label: 'renda anual total a partir da qual a apuração mínima entra' },
            { value: '10%', label: 'teto da alíquota mínima efetiva no desenho atual' },
            { value: 'anual', label: 'a apuração é na declaração, não uma retenção mês a mês' },
          ],
        },
        {
          kind: 'p',
          html: 'Para o investidor de varejo, o ponto de atenção é que essa conta olha a <strong>renda total do ano</strong>, incluindo o que é isento, e não apenas o dividendo. Quem está longe desse patamar não é afetado. Quem está perto precisa de apuração individual, porque a interação entre os dois mecanismos depende da composição da renda e foge do que um guia consegue responder no geral.',
        },
      ],
    },
    {
      id: 'sec-7',
      title: 'A regra de transição e o que ela ainda protege',
      blocks: [
        {
          kind: 'p',
          html: 'A mudança não pegou o passado. Existe uma <strong>regra de transição</strong> que preserva a isenção para lucros e dividendos cuja distribuição foi aprovada até o fim de 2025, com base em resultados apurados até aquele ano-calendário, desde que o pagamento ocorra dentro do prazo previsto em lei.',
        },
        {
          kind: 'p',
          html: 'Isso explica um fenômeno que confundiu muito investidor no início do novo regime: pagamentos feitos já em 2026 chegando sem retenção. Não era erro nem exceção pontual, era a transição operando sobre lucro aprovado antes da virada. O que define o tratamento é a <strong>origem e a data de aprovação</strong> da distribuição, não a data em que o dinheiro caiu na conta.',
        },
        {
          kind: 'p',
          html: 'Para quem investe em bolsa, a leitura útil é não tentar deduzir a regra a partir do próprio extrato. Ver um provento chegando integral não prova que a isenção geral continua valendo, e ver retenção não prova que ela acabou para todo mundo. Cada pagamento carrega o regime da sua origem, e é isso que o informe de rendimentos da fonte pagadora documenta.',
        },
        {
          kind: 'p',
          html: 'Por fim, a ressalva que vale para o guia inteiro: tributação é matéria de lei e muda. Use este texto para entender <strong>a lógica de cada regime</strong>, que é a parte estável, e confirme alíquotas e limites vigentes antes de tomar decisão. Se o objetivo é escolher pagadores, o caminho é analisar o negócio primeiro, como mostra o guia de <a href="/guias/como-analisar-uma-acao">como analisar uma ação</a>.',
        },
      ],
    },
  ],
  cta: {
    title: 'Compare quanto cada empresa distribui',
    subtitle: 'Dividend yield, payout e histórico de proventos lado a lado · grátis para começar',
    to: '/calculadora/dividend-yield',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'Dividendo paga imposto de renda no Brasil?',
      a: 'Desde 2026 existe retenção na fonte de 10% sobre lucros e dividendos, mas só quando uma mesma empresa paga a uma mesma pessoa física mais de R$ 50 mil no mesmo mês. Abaixo desse limite não há retenção, o que na prática mantém o dividendo integral para a grande maioria dos investidores pessoa física da bolsa. Confirme a regra vigente, porque legislação tributária muda.',
    },
    {
      q: 'O imposto de 10% incide só sobre o que passar de R$ 50 mil?',
      a: 'Não. Quando o pagamento do mês ultrapassa o limite, a alíquota incide sobre o valor total distribuído naquele mês, e não apenas sobre o excedente. É o chamado efeito degrau: diferente da tabela progressiva do salário, aqui um valor pouco acima do limite muda a base de cálculo inteira.',
    },
    {
      q: 'O limite de R$ 50 mil vale para a carteira toda?',
      a: 'Não. O limite é medido por empresa pagadora e por beneficiário, dentro de cada mês. Dividendos recebidos de companhias diferentes no mesmo mês não se somam para verificar o limite. Só somam os pagamentos feitos pela mesma fonte pagadora ao mesmo CPF no mesmo mês.',
    },
    {
      q: 'Qual a diferença de imposto entre dividendo e JCP?',
      a: 'Juros sobre capital próprio nunca foi isento: ele sofre retenção na fonte sobre o valor pago, sem o limite mensal que existe no dividendo, e a alíquota passou de 15% para 17,5% a partir de 2026. O dividendo só sofre retenção acima do limite mensal. Por isso o valor anunciado de um provento não é comparável direto entre os dois sem olhar o regime.',
    },
    {
      q: 'O rendimento de FII passou a ser tributado?',
      a: 'Não. O rendimento mensal distribuído por fundo imobiliário à pessoa física segue isento, respeitadas as condições legais do fundo, como cotas negociadas em bolsa e número mínimo de cotistas. É um regime separado do dos dividendos de ações. O ganho na venda das cotas continua tributado, e o rendimento isento continua obrigatório na declaração.',
    },
    {
      q: 'Por que recebi dividendo sem desconto mesmo depois da mudança?',
      a: 'Provavelmente por causa da regra de transição, que preserva a isenção de distribuições aprovadas até o fim de 2025 com base em resultados daquele período, pagas dentro do prazo previsto em lei. O que define o tratamento é a origem e a data de aprovação da distribuição, não a data em que o valor caiu na conta. Ou, simplesmente, porque o pagamento ficou abaixo do limite mensal.',
    },
    {
      q: 'O que é a tributação mínima das altas rendas?',
      a: 'É uma apuração anual que busca garantir uma alíquota efetiva mínima para quem soma renda total alta no ano, alcançando, como regra geral, quem passa de R$ 600 mil de rendimentos no ano-calendário, com alíquota crescendo até o teto de 10%. Ela olha a renda total, incluindo a isenta, e é apurada na declaração, não retida mês a mês.',
    },
  ],
  related: ['Como declarar investimentos no IR', 'Dividendos todo mês', 'Calculadora de dividendos'],
}
