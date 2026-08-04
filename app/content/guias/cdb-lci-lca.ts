/**
 * Guia: CDB, LCI e LCA (a renda fixa privada, emitida por banco).
 * Estrutura e densidade espelham tesouro-direto-para-iniciantes.ts e
 * reserva-de-emergencia.ts: hero (dek) + seções h2 com blocos ricos
 * (p/stats/steps/checks) + CTA + FAQ + related.
 *
 * Escopo deliberado: a tag 'Renda fixa' só tinha títulos PÚBLICOS (Tesouro
 * Direto) e o colchão (reserva de emergência). Este guia cobre a outra metade
 * da classe, o título bancário, e fica dentro dela. NÃO invade:
 *  - 'Tesouro Direto para iniciantes', dono dos títulos públicos e da
 *    marcação a mercado (aqui o Tesouro entra só como régua de comparação);
 *  - 'Reserva de emergência', dono do dimensionamento do colchão (aqui só se
 *    diz qual papel serve ou não serve para ele, com link);
 *  - 'Como declarar investimentos no IR', dono da declaração anual (aqui só a
 *    tributação na fonte, como regra geral, com link para declarar);
 *  - 'Como montar uma carteira de investimentos', dono da alocação.
 *
 * Conteúdo HONESTO: nenhuma taxa, nenhum percentual do CDI, nenhum nome de
 * banco emissor, nenhuma rentabilidade e nenhum valor do teto do FGC. O limite
 * do FGC aparece sempre como "limite vigente por CPF e por instituição", no
 * mesmo padrão de reserva-de-emergencia.ts. As alíquotas da tabela regressiva
 * entram como regra geral com a ressalva de confirmar a vigente, no padrão do
 * guia de IR e do guia de ETFs. Números nos stat cards são estruturais.
 *
 * HTML dos blocos é local e confiável: só <strong> e <a href> internos.
 * Todas as rotas linkadas existem (glossário, tesouro, calculadoras, guias
 * irmãos, metodologia).
 */
import type { GuideDoc } from '~/types/guias'

export const CDB_LCI_LCA_GUIDE: GuideDoc = {
  slug: 'cdb-lci-lca',
  tag: 'Renda fixa',
  title: 'CDB, LCI e LCA: como escolher a renda fixa do banco',
  dek: 'As três siglas dividem a mesma mecânica e mudam em três pontos que decidem tudo: quem garante, quanto o imposto leva e quando o dinheiro volta.',
  description:
    'CDB, LCI e LCA explicados sem jargão: como o título bancário funciona, a diferença entre pós-fixado, prefixado e IPCA+, o que o FGC cobre, por que a isenção de LCI e LCA nem sempre vence e como comparar duas ofertas pelo retorno líquido. Guia claro e honesto da Redentia.',
  summary:
    'A renda fixa do banco não é uma coisa só. Entenda o que você compra em um CDB, o que muda em LCI e LCA, até onde vai a garantia do FGC e o roteiro para comparar ofertas sem se deixar levar pela taxa da vitrine.',
  minutes: 10,
  author: 'Equipe Redentia',
  datePublished: '2026-08-04',
  dateModified: '2026-08-04',
  updatedLine: 'Atualizado em 4 ago 2026 · 10 min de leitura',
  updatedShort: 'atualizado em ago 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'O que você compra quando compra um CDB',
      blocks: [
        {
          kind: 'p',
          html: 'Investir em renda fixa é sempre a mesma operação: <strong>você empresta dinheiro a alguém e combina como será remunerado</strong>. No Tesouro Direto, quem toma emprestado é o governo. No <a href="/glossario/cdb">CDB</a>, na <a href="/glossario/lci-lca">LCI e na LCA</a>, quem toma emprestado é um banco.',
        },
        {
          kind: 'p',
          html: 'O CDB, Certificado de Depósito Bancário, é o formato mais direto: o banco capta com você e usa esse dinheiro na própria operação de crédito. LCI e LCA são letras de crédito com lastro em carteiras específicas, imobiliária no caso da LCI e do agronegócio no caso da LCA. Da sua cadeira, os três funcionam igual: você entrega um valor, o papel tem uma forma de remuneração e uma data, e o banco devolve com juros.',
        },
        {
          kind: 'stats',
          items: [
            { value: '3', label: 'siglas que compartilham a mesma mecânica: CDB, LCI e LCA' },
            { value: '3', label: 'formas de remuneração: pós-fixada, prefixada e híbrida' },
            { value: '4', label: 'variáveis que decidem a escolha: indexador, prazo, liquidez e emissor' },
          ],
        },
        {
          kind: 'p',
          html: 'A diferença que importa em relação ao título público é o <strong>emissor</strong>. Título do Tesouro é dívida do governo federal, e o guia de <a href="/guias/tesouro-direto-para-iniciantes">Tesouro Direto para iniciantes</a> cobre essa família inteira. Título bancário é dívida de uma instituição privada, com risco de crédito próprio e uma rede de proteção específica, o FGC, que é o assunto da terceira seção deste guia.',
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'Pós-fixado, prefixado e IPCA+: o que muda no seu bolso',
      blocks: [
        {
          kind: 'p',
          html: 'Antes de olhar qualquer taxa, identifique a forma de remuneração. Ela define o que o papel protege e o que ele deixa exposto, e é a decisão de maior consequência da renda fixa.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Pós-fixado.</strong> Costuma render um percentual do <a href="/glossario/cdi">CDI</a>, a taxa que acompanha de perto a <a href="/glossario/selic">Selic</a>. Você não sabe hoje quanto vai receber no fim, mas sabe que vai acompanhar o juro do país. É o formato mais previsível no dia a dia, porque o valor não oscila contra você enquanto o título corre.',
            '<strong>Prefixado.</strong> A taxa é fechada no momento da aplicação e não muda até o vencimento. Você troca a incerteza por uma certeza, e o risco vira o custo de oportunidade: se o juro do país subir depois, você fica preso a uma taxa que virou baixa.',
            '<strong>Híbrido, o IPCA+.</strong> Paga a variação da <a href="/glossario/inflacao">inflação</a> medida pelo <a href="/glossario/ipca">IPCA</a> mais uma taxa fixa por cima. É o único formato que garante ganho acima da inflação se levado até o fim, e por isso é o que faz sentido para objetivos distantes.',
            '<strong>A escolha é do prazo, não da manchete.</strong> Dinheiro que pode ser chamado a qualquer momento pede pós-fixado. Objetivo com data marcada aceita prefixado. Objetivo de muitos anos combina com IPCA+.',
          ],
        },
        {
          kind: 'p',
          html: 'Há um detalhe que separa o papel bancário do público. No título público, o resgate antes do vencimento acontece pela recompra diária do Tesouro, a preço de mercado. No CDB, na LCI e na LCA, sair antes do prazo só é possível se o próprio emissor recomprar o papel, e nesse caso as condições são as que ele oferecer, ou pelo mercado secundário, com deságio. <strong>A promessa da taxa da vitrine vale para quem chega até o vencimento.</strong>',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'FGC: a garantia que muda a conversa (e o que ela não cobre)',
      blocks: [
        {
          kind: 'p',
          html: 'O Fundo Garantidor de Créditos é um fundo privado mantido pelas próprias instituições financeiras para devolver o dinheiro do investidor quando um banco quebra. É ele que explica por que uma instituição pequena consegue oferecer condições melhores que uma grande e ainda assim atrair dinheiro.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>O que entra.</strong> CDB, LCI, LCA, poupança, letras de câmbio e depósitos em conta estão entre os produtos cobertos, até o <strong>limite vigente por CPF e por instituição</strong>, com um teto global válido por um período de anos. Os valores são definidos em regulamento e podem mudar, então confirme os que estão em vigor.',
            '<strong>O que não entra.</strong> Ações, fundos imobiliários, ETFs, debêntures, <a href="/glossario/cri">CRI e CRA</a> e cotas de fundos de investimento não têm cobertura do FGC. Papel com lastro parecido não significa proteção parecida.',
            '<strong>O limite é por conglomerado, não por título.</strong> Ter três CDBs do mesmo banco não triplica a garantia. Bancos do mesmo grupo costumam contar como um só emissor para efeito de cobertura.',
            '<strong>O pagamento não é instantâneo.</strong> Existe um processo, com prazo, entre a liquidação da instituição e o dinheiro na sua conta. A garantia protege o valor, não a data em que você precisaria dele.',
          ],
        },
        {
          kind: 'p',
          html: 'A leitura prática é simples: o prêmio pago pelo banco menor é o preço do risco de crédito dele, e o FGC é o que torna esse risco aceitável <strong>enquanto você fica dentro do limite</strong>. Passou do limite em um mesmo emissor, o excedente deixa de ser renda fixa garantida e vira crédito privado puro. Por isso a divisão entre instituições é a forma mais barata de melhorar a relação entre risco e retorno nessa classe.',
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'Imposto e custos: por que LCI e LCA parecem melhores do que são',
      blocks: [
        {
          kind: 'p',
          html: 'As regras a seguir são o desenho geral que vigora há anos, mas tributação muda por lei. Trate como referência e confirme o que vale no momento da sua aplicação, principalmente no caso das letras isentas, que voltam ao debate legislativo com frequência.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>CDB tem imposto de renda sobre o rendimento</strong>, retido na fonte no resgate ou no vencimento, pela tabela regressiva: a alíquota de referência começa em 22,5% para prazos curtos e cai até 15% depois de dois anos. Não incide sobre o valor investido, só sobre o que ele rendeu.',
            '<strong>IOF nos primeiros 30 dias.</strong> Resgate feito no primeiro mês sofre uma cobrança adicional que consome boa parte do rendimento do período. Na prática, título de renda fixa não é lugar para dinheiro de trinta dias.',
            '<strong>LCI e LCA são isentas de imposto de renda para pessoa física</strong>, e é daí que vem a fama de renderem mais. A isenção é real, mas o emissor sabe dela e a embute na taxa que oferece.',
            '<strong>Taxa aparente não é o que você recebe.</strong> Não há custódia ou administração cobradas à parte nesses papéis; o custo está dentro da taxa. A comparação honesta é sempre entre valores líquidos, depois do imposto, no prazo em que você pretende ficar.',
          ],
        },
        {
          kind: 'p',
          html: 'É por isso que a pergunta "isento rende mais?" não tem resposta fixa. Uma LCI isenta com taxa menor pode perder de um CDB tributado com taxa maior, e o inverso também acontece; o ponto de virada depende do prazo, porque a alíquota do CDB cai com o tempo. Faça a conta nos dois casos com o prazo real que você tem em mente. As <a href="/calculadoras">calculadoras da Redentia</a> ajudam a projetar o valor final, e o guia de <a href="/guias/como-declarar-investimentos-no-ir">como declarar investimentos no IR</a> cobre o que aparece na declaração anual, inclusive os papéis isentos, que também são declarados.',
        },
      ],
    },
    {
      id: 'sec-5',
      title: 'Liquidez, carência e vencimento: o prazo não é detalhe',
      blocks: [
        {
          kind: 'p',
          html: 'Duas ofertas com a mesma remuneração podem ser produtos completamente diferentes por causa do prazo. Três palavras aparecem na descrição do papel e são frequentemente confundidas:',
        },
        {
          kind: 'checks',
          items: [
            '<strong><a href="/glossario/liquidez">Liquidez</a> diária.</strong> Você pode pedir o resgate a qualquer dia útil e o dinheiro volta no mesmo dia ou no seguinte. Existe em parte dos CDBs pós-fixados, e é o que permite usar o papel como reserva.',
            '<strong>Carência.</strong> Período inicial em que o resgate simplesmente não é permitido, mesmo que o vencimento seja distante. LCI e LCA têm prazo mínimo definido em regulação, o que costuma tirá-las da conversa quando o dinheiro precisa estar acessível.',
            '<strong>Vencimento.</strong> A data em que o banco devolve o principal com os juros combinados. É o único momento em que a taxa contratada se realiza integralmente.',
            '<strong>Resgate antecipado não é direito garantido.</strong> Quando existe, depende de o emissor recomprar ou de encontrar comprador no secundário, quase sempre com perda. Planeje para levar até o fim e trate a saída antecipada como exceção.',
          ],
        },
        {
          kind: 'p',
          html: 'A regra de bolso é casar o vencimento com a data do objetivo. Dinheiro de emergência não aceita carência de nenhum tamanho, e o guia de <a href="/guias/reserva-de-emergencia">reserva de emergência</a> detalha por que liquidez vem antes de rendimento nesse bolso específico. Já o dinheiro com data definida, a entrada do apartamento, a viagem do ano que vem, o carro, pode aceitar um papel travado se a data bater.',
        },
      ],
    },
    {
      id: 'sec-6',
      title: 'Como comparar duas ofertas sem se enganar',
      blocks: [
        {
          kind: 'p',
          html: 'A vitrine da corretora ou do banco mostra a taxa em destaque e o resto em letra pequena, o que inverte a ordem de importância. Um roteiro fixo resolve:',
        },
        {
          kind: 'steps',
          items: [
            'Identifique a forma de remuneração antes de olhar o número. Comparar um prefixado com um pós-fixado pela taxa aparente não produz informação, são apostas diferentes.',
            'Veja quem é o emissor e some o que você já tem naquele mesmo conglomerado. Se a nova aplicação ultrapassa o limite vigente do FGC, o excedente muda de categoria de risco.',
            'Leia a liquidez real: existe carência, qual é o vencimento e o que acontece se você precisar sair antes.',
            'Traga tudo para valor líquido, depois do imposto, no prazo que você pretende ficar. É o único terreno em que papel isento e papel tributado se comparam.',
            'Compare com a alternativa pública de prazo parecido. O prêmio do título bancário precisa pagar o risco de crédito e a menor flexibilidade de saída; se o ganho for marginal, o título público entrega mais tranquilidade pelo mesmo dinheiro.',
            'Anote o vencimento no calendário. Título que vence sem instrução deixa de render e o valor fica parado na conta, o que já custou muito rendimento a muita gente.',
          ],
        },
        {
          kind: 'p',
          html: 'Três armadilhas aparecem com frequência. A primeira é <strong>escolher pela taxa mais alta da lista</strong>, que quase sempre pertence ao papel de prazo mais longo ou ao emissor de risco maior. A segunda é <strong>tratar isenção como sinônimo de vantagem</strong>, sem fazer a conta líquida. A terceira é <strong>concentrar tudo em um emissor</strong> porque a oferta dele é a melhor, ignorando que a garantia tem teto.',
        },
      ],
    },
    {
      id: 'sec-7',
      title: 'O lugar da renda fixa do banco na carteira',
      blocks: [
        {
          kind: 'p',
          html: 'Título bancário resolve bem uma parte específica do patrimônio: o dinheiro que precisa de previsibilidade e prazo conhecido. Ele não é substituto de renda variável nem concorrente dela, é a perna que dá estabilidade para você conseguir manter a outra perna investida quando o mercado balança.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Serve.</strong> Objetivos com data, dinheiro de curto e médio prazo, a fatia conservadora da carteira e, no caso do CDB com liquidez diária e cobertura do FGC, também a reserva de emergência.',
            '<strong>Não serve.</strong> Dinheiro que pode ser chamado amanhã e está em papel com carência, e crescimento de patrimônio no horizonte de décadas, em que a inflação corrói o retorno de quem fica só em juros.',
            '<strong>Cuidado com o excesso.</strong> Segurança em demasia tem custo silencioso: o patrimônio inteiro em renda fixa raramente vence a inflação de forma relevante no longo prazo depois do imposto.',
            '<strong>Revise no vencimento.</strong> Cada vencimento é uma decisão nova, não uma renovação automática. O cenário de juros na data de aplicar não é o mesmo da data de reinvestir.',
          ],
        },
        {
          kind: 'p',
          html: 'Quanto colocar em cada classe é decisão de alocação, e o guia de <a href="/guias/como-montar-carteira-de-investimentos">como montar uma carteira de investimentos</a> trata disso por objetivo e prazo. Se os seus papéis estão espalhados por vários bancos e corretoras e você não sabe quanto tem em cada emissor, o <a href="/guias/open-finance">Open Finance</a> resolve o inventário antes da decisão, o que é justamente o que o limite do FGC exige que você saiba.',
        },
        {
          kind: 'p',
          html: 'Para quem quer entender cada termo isolado, o <a href="/glossario">glossário</a> destrincha as siglas desta página, e a <a href="/metodologia">metodologia</a> explica como a Redentia calcula e apresenta os dados das páginas de investimento.',
        },
      ],
    },
  ],
  cta: {
    title: 'Compare a renda fixa pública antes de fechar com o banco',
    subtitle: 'Títulos do Tesouro Direto por indexador e vencimento · grátis para consultar',
    to: '/tesouro',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'O que é CDB e como ele funciona?',
      a: 'CDB é a sigla de Certificado de Depósito Bancário. Ao comprar um, você empresta dinheiro ao banco por um prazo combinado e recebe juros por isso. A remuneração pode ser pós-fixada, atrelada ao CDI, prefixada, com taxa fechada na aplicação, ou híbrida, com IPCA mais uma taxa fixa. No vencimento, o banco devolve o valor aplicado com os juros, já com o imposto de renda retido na fonte.',
    },
    {
      q: 'CDB, LCI ou LCA: qual rende mais?',
      a: 'Não existe resposta fixa. LCI e LCA são isentas de imposto de renda para pessoa física e o CDB é tributado, mas os emissores sabem disso e costumam oferecer taxas menores nas letras. A comparação só faz sentido em valor líquido, depois do imposto, no prazo em que você pretende ficar. Como a alíquota do CDB cai com o tempo, o vencedor muda conforme o prazo, o que torna a conta obrigatória caso a caso.',
    },
    {
      q: 'CDB é seguro? O que o FGC cobre?',
      a: 'O risco principal é o banco emissor quebrar. Para isso existe o FGC, que cobre CDB, LCI, LCA, poupança e alguns outros produtos até um limite vigente por CPF e por instituição, com um teto global por período de anos. Ações, fundos, ETFs, debêntures, CRI e CRA não têm essa cobertura. O limite vale por conglomerado, não por título, e o pagamento tem um processo com prazo, então a garantia protege o valor e não a data em que você precisaria dele.',
    },
    {
      q: 'Qual a diferença entre CDB e Tesouro Direto?',
      a: 'Muda o emissor e a forma de sair antes do prazo. No Tesouro, quem deve é o governo federal e existe recompra diária a preço de mercado. No CDB, quem deve é um banco, com risco de crédito próprio coberto pelo FGC dentro do limite, e a saída antecipada depende do emissor recomprar ou do mercado secundário. Por carregar mais risco de crédito e menos flexibilidade, o título bancário precisa oferecer um prêmio sobre o público para valer a pena.',
    },
    {
      q: 'Preciso pagar imposto sobre CDB, LCI e LCA?',
      a: 'Como regra geral, o CDB tem imposto de renda retido na fonte sobre o rendimento, pela tabela regressiva, com alíquota de referência que começa em 22,5% para prazos curtos e chega a 15% após dois anos, além de IOF nos primeiros 30 dias. LCI e LCA são isentas de imposto de renda para pessoa física. Regras tributárias mudam por lei, então confirme as vigentes antes de aplicar. Mesmo os papéis isentos entram na declaração anual.',
    },
    {
      q: 'Posso resgatar um CDB antes do vencimento?',
      a: 'Depende do papel. Alguns CDBs pós-fixados têm liquidez diária e permitem resgate a qualquer dia útil. Outros têm carência ou só devolvem o combinado no vencimento. Quando existe saída antecipada em um papel sem liquidez diária, ela ocorre por recompra do emissor nas condições que ele oferecer, ou pelo mercado secundário com deságio. LCI e LCA têm prazo mínimo definido em regulação, o que as torna inadequadas para dinheiro que pode ser chamado a qualquer momento.',
    },
    {
      q: 'CDB de banco pequeno vale a pena?',
      a: 'Pode valer, desde que a aplicação caiba no limite do FGC somada ao que você já tem no mesmo conglomerado. A taxa maior oferecida por uma instituição menor é o preço do risco de crédito dela, e a garantia é o que torna esse risco aceitável dentro do teto. Acima do limite, o excedente deixa de contar com a proteção e passa a ser exposição direta àquele emissor, o que exige uma análise bem diferente.',
    },
  ],
  related: [
    'Tesouro Direto para iniciantes',
    'Reserva de emergência: quanto guardar e onde investir',
    'Como montar uma carteira de investimentos',
  ],
}
