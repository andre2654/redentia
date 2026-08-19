/**
 * Guia: Tesouro Renda+ e Educa+ (rodada semanal de 2026-08-19).
 *
 * Lacuna real, medida no Search Console (export de 03/08/2026, 92 dias):
 * as páginas /tesouro/tesouro-renda-aposentadoria-extra-* somam 4.954
 * impressões e 4 cliques, e as /tesouro/tesouro-educa-* somam 1.864
 * impressões e 2 cliques. São ~6.800 impressões com CTR de 0,09% em posição
 * média entre 8 e 12, ou seja, o Google já mostra as páginas de título e
 * ninguém entra. O motivo é que o site não tem UMA linha explicando o que
 * são esses títulos: a busca por "renda+", "educa+" e "conversão" no
 * app/content inteiro não retorna nada, e o guia de Tesouro Direto trata
 * apenas dos três títulos clássicos ("Os três tipos de título").
 *
 * A sub-intenção mais forte do cluster é DURATION, e não rentabilidade:
 * as variações de '"tesouro renda+ aposentadoria extra 2045" duration'
 * somam 549 impressões e zero clique. Por isso duration ganhou seção
 * inteira, escrita como mecanismo (por que o preço balança mais), não como
 * número.
 *
 * Escopo deliberado: os dois títulos que pagam em parcelas mensais. NÃO
 * invade "Tesouro Direto para iniciantes" (IPCA+, Selic e Prefixado, a
 * primeira compra e a introdução à marcação a mercado, que aqui aparece só
 * aplicada ao caso extremo), nem "Reserva de emergência: quanto guardar e
 * onde investir" (o colchão de curto prazo, que aqui entra apenas como
 * contraste), nem "Como montar uma carteira de investimentos" (alocação e
 * rebalanceamento), nem as páginas /tesouro/[slug] (taxa e preço de cada
 * título). O termo "calculadora" fica com /calculadora/aposentadoria.
 *
 * Conteúdo HONESTO: nenhuma taxa contratada, nenhuma rentabilidade, nenhum
 * preço de título, nenhum vencimento específico apresentado como
 * recomendação, nenhum valor de parcela e nenhum percentual de taxa de
 * custódia (as fontes consultadas divergem entre si nas faixas, e faixa de
 * taxa numérica apodrece). Os números do texto são estruturais (240 e 60
 * parcelas, 20 e 5 anos, carência de 60 dias, limite de 6 salários mínimos)
 * ou a tabela regressiva de IR, apresentada como regra geral com ressalva
 * de conferir a vigente, no mesmo padrão dos guias de Tesouro e de IR.
 *
 * HTML dos blocos é local e confiável: só <strong> e <a href> internos.
 * Rotas linkadas conferidas contra app/pages e os registries de glossário e
 * de guias.
 */
import type { GuideDoc } from '~/types/guias'

export const TESOURO_RENDA_MAIS_EDUCA_MAIS_GUIDE: GuideDoc = {
  slug: 'tesouro-renda-mais-educa-mais',
  tag: 'Renda fixa',
  title: 'Tesouro Renda+ e Educa+: os títulos que pagam renda mensal',
  dek: 'O Tesouro que não devolve tudo de uma vez, e sim em parcelas. Como funcionam as duas fases, por que esses títulos balançam mais que qualquer outro e quando a isenção de custódia vale.',
  description:
    'O que são o Tesouro Renda+ e o Tesouro Educa+, como funcionam a fase de acumulação e a data de conversão, quantas parcelas mensais cada um paga, por que a duration longa faz o preço oscilar tanto, como funciona a carência e a venda antecipada, e a isenção da taxa de custódia para quem carrega até o fim. Guia claro e honesto da Redentia.',
  summary:
    'Os dois títulos mais incompreendidos do Tesouro Direto não pagam um valor único no vencimento: pagam uma renda mensal por anos. Entenda a data de conversão, por que o preço na tela oscila mais que o de qualquer outro título público e o que você perde ao vender antes da hora.',
  minutes: 10,
  author: 'Equipe Redentia',
  datePublished: '2026-08-19',
  dateModified: '2026-08-19',
  updatedLine: 'Atualizado em 19 ago 2026 · 10 min de leitura',
  updatedShort: 'atualizado em ago 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'O Tesouro que paga em parcelas',
      blocks: [
        {
          kind: 'p',
          html: 'Quase tudo que você já leu sobre <a href="/glossario/tesouro-direto">Tesouro Direto</a> descreve o mesmo desenho: você compra o título, espera o vencimento e recebe <strong>um valor único, de uma vez só</strong>. O Tesouro Renda+ e o Tesouro Educa+ quebram esse desenho. Eles não devolvem o dinheiro em uma data, devolvem <strong>em parcelas mensais ao longo de anos</strong>, e é essa diferença que explica todo o resto do comportamento deles.',
        },
        {
          kind: 'p',
          html: 'Os dois nasceram para um problema específico. O investidor sabia acumular no <a href="/glossario/tesouro-ipca">Tesouro IPCA+</a>, mas na data de vencimento recebia um valor grande de uma vez e ficava sem saber o que fazer com ele. Renda+ e Educa+ resolvem exatamente essa etapa final: em vez de entregar o bolo, entregam a fatia mensal já corrigida pela <a href="/glossario/inflacao">inflação</a>.',
        },
        {
          kind: 'stats',
          items: [
            { value: '2', label: 'fases em cada título: acumulação e conversão' },
            { value: '240', label: 'parcelas mensais do Renda+, ou 20 anos de renda' },
            { value: '60', label: 'parcelas mensais do Educa+, ou 5 anos de renda' },
          ],
        },
        {
          kind: 'p',
          html: 'Nome oficial e apelido convivem, o que confunde na hora de procurar. O Renda+ aparece nas plataformas como <strong>Tesouro Renda+ Aposentadoria Extra</strong>, seguido do ano em que a renda começa a ser paga. O Educa+ aparece como <strong>Tesouro Educa+</strong> com o ano correspondente. Em ambos os casos, <strong>o ano no nome não é o vencimento no sentido tradicional</strong>: é o ano em que os pagamentos começam. Confundir esses dois conceitos é o erro de leitura mais comum, e ele tem consequência prática, como você vai ver adiante.',
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'Como o Renda+ funciona por dentro',
      blocks: [
        {
          kind: 'p',
          html: 'O título tem duas vidas separadas, com regras diferentes em cada uma. Entender onde termina a primeira e começa a segunda resolve a maioria das dúvidas:',
        },
        {
          kind: 'steps',
          items: [
            '<strong>Fase de acumulação.</strong> É o período entre a sua compra e a data de conversão. Nesse trecho o título se comporta como um IPCA+ de prazo longo: rende a inflação do período mais uma taxa fixa contratada na compra, e você não recebe nada no caminho. Pode continuar aportando ao longo dos anos, comprando mais frações do mesmo título.',
            '<strong>Data de conversão.</strong> É a virada, e não o fim. A partir dela o título para de acumular e começa a pagar. É esse ano que aparece no nome do papel.',
            '<strong>Fase de conversão.</strong> A partir da data de conversão você recebe 240 parcelas mensais, o equivalente a 20 anos de renda, todas corrigidas pelo <a href="/glossario/ipca">IPCA</a>. O poder de compra da parcela é o que fica protegido, e não o valor nominal dela.',
          ],
        },
        {
          kind: 'p',
          html: 'A consequência de prazo é o que mais surpreende. Se você compra hoje um título cuja conversão começa daqui a vinte anos, <strong>o dinheiro do último pagamento só sai daqui a quarenta</strong>: vinte anos acumulando mais vinte anos recebendo. Não existe outro produto na prateleira do Tesouro com esse horizonte, e é por isso que ele se comporta de um jeito que assusta quem espera um título público comum.',
        },
        {
          kind: 'p',
          html: 'Um detalhe que evita frustração no cadastro: <strong>a renda não é um valor que você escolhe e contrata</strong>. Você escolhe o ano de conversão e vai comprando frações ao longo do tempo. Quanto mais frações acumuladas, maior a parcela mensal futura. As plataformas mostram uma projeção do valor mensal, e essa projeção sobe ou desce conforme você aporta e conforme a taxa contratada em cada compra, porque cada aporte entra com a taxa do dia.',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'Educa+: o mesmo motor, outro prazo',
      blocks: [
        {
          kind: 'p',
          html: 'O Educa+ usa a mesma mecânica de duas fases, mas calibrada para um objetivo bem mais curto e datado: <strong>pagar uma graduação</strong>. Em vez de 240 parcelas, ele paga 60, o equivalente a 5 anos, que é aproximadamente a duração de um curso superior. Os pagamentos começam em janeiro do ano de conversão escolhido, o que casa com o início do ano letivo.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>A correção é a mesma.</strong> O rendimento é o IPCA do período mais uma taxa fixa contratada na compra, exatamente como no Renda+. Isso importa aqui mais do que em qualquer outro lugar, porque mensalidade de faculdade é uma despesa que historicamente sobe, e um valor nominal fixo guardado por quinze anos chegaria pequeno demais.',
            '<strong>O ano no nome é o ano em que a renda começa.</strong> Escolhe-se o ano em que o filho entra na faculdade, não o ano em que se para de aportar. Errar isso por um ano significa receber a primeira parcela um ano depois da matrícula.',
            '<strong>A titularidade é de quem compra.</strong> O título fica na conta do investidor, não em uma conta do beneficiário. Não existe travamento de uso: o dinheiro chega como qualquer outra renda e pode ser gasto com qualquer coisa. A destinação para educação é o desenho do produto, não uma amarra jurídica.',
            '<strong>O prazo curto de pagamento muda o cálculo.</strong> Cinco anos de renda concentram muito mais valor por parcela que vinte anos com o mesmo montante acumulado. Educa+ e Renda+ não são substitutos: são o mesmo motor regulado para horizontes diferentes.',
          ],
        },
        {
          kind: 'p',
          html: 'Uma decisão que aparece cedo e não tem resposta única: aportar em um Educa+ com conversão distante ou usar um <a href="/guias/tesouro-direto-para-iniciantes">Tesouro IPCA+ tradicional</a> de vencimento parecido. O IPCA+ entrega tudo de uma vez e dá liberdade total de uso; o Educa+ entrega parcelado e resolve a disciplina de não gastar o bolo antes da hora. A diferença é comportamental antes de ser financeira.',
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'Duration: por que esses títulos oscilam tanto',
      blocks: [
        {
          kind: 'p',
          html: 'Esta é a pergunta mais buscada sobre o Renda+, e ela tem uma resposta que raramente aparece escrita com clareza. Duration é, em português direto, <strong>o prazo médio em que o dinheiro efetivamente volta para você</strong>, ponderando cada pagamento pelo momento em que ele acontece. Quanto maior a duration, mais o preço do título na tela reage a qualquer mudança nos juros da economia.',
        },
        {
          kind: 'p',
          html: 'Em um título tradicional que paga tudo no vencimento, a duration é próxima do prazo até o vencimento. No Renda+ ela é <strong>muito maior do que a distância até a data de conversão</strong>, porque o dinheiro não volta na conversão: volta espalhado ao longo dos vinte anos seguintes. Somando a acumulação e a distribuição, você tem o instrumento de maior duration da prateleira do Tesouro Direto.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Duration alta significa preço sensível.</strong> Quando os juros futuros sobem, o preço de um título prefixado ou indexado à inflação cai na tela. Quanto maior a duration, mais forte é essa queda para a mesma variação de juros. O mecanismo é o mesmo da <strong>marcação a mercado</strong> explicada no guia de <a href="/guias/tesouro-direto-para-iniciantes">Tesouro Direto para iniciantes</a>, levado ao extremo.',
            '<strong>Ver a posição negativa é normal, não é defeito.</strong> Um Renda+ comprado em um momento de juros baixos pode passar anos aparecendo com valor abaixo do aportado. Isso não altera em nada a renda mensal que você vai receber a partir da conversão, desde que você carregue o título.',
            '<strong>A oscilação corta para os dois lados.</strong> Quando os juros caem, o mesmo mecanismo faz o preço subir muito mais que o de um título curto. Quem olha a tela em um ano bom conclui coisas erradas pelo mesmo motivo que quem olha em um ano ruim.',
            '<strong>Duration não é risco de calote.</strong> São coisas diferentes. O risco de crédito continua sendo o do Tesouro Nacional, o mais baixo disponível no país. O que a duration mede é oscilação de preço no caminho, e ela só vira perda de verdade se você vender antes.',
          ],
        },
        {
          kind: 'p',
          html: 'A conclusão prática é dura e vale dizer sem rodeio: <strong>o Renda+ é o pior título público possível para quem pode precisar do dinheiro antes</strong>, e é justamente o desenho certo para quem não vai precisar. A mesma característica que torna o preço instável no meio do caminho é a que garante a renda longa e corrigida lá na frente. Para dinheiro que pode ser chamado a qualquer momento, o lugar é o <a href="/glossario/tesouro-selic">Tesouro Selic</a>, como trata o guia de <a href="/guias/reserva-de-emergencia">reserva de emergência</a>.',
        },
      ],
    },
    {
      id: 'sec-5',
      title: 'Carência, venda antecipada e o que você perde',
      blocks: [
        {
          kind: 'p',
          html: 'A <a href="/glossario/liquidez">liquidez</a> desses títulos tem uma regra própria que não existe nos títulos clássicos, e ela pega gente desprevenida no primeiro mês:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Existe carência de 60 dias.</strong> Cada compra fica travada por 60 dias antes de poder ser vendida. A trava vale por operação, então aportes antigos que já cumpriram o prazo não ficam presos por causa de um aporte novo. Nos títulos tradicionais do Tesouro essa carência não existe.',
            '<strong>Passada a carência, o Tesouro recompra.</strong> Você não depende de encontrar comprador no mercado: existe recompra pelo Tesouro Nacional nos dias úteis. O que não existe é garantia de preço.',
            '<strong>Vender antes é realizar o preço do dia.</strong> Como a duration é altíssima, a diferença entre o valor aportado e o valor de venda pode ser grande em qualquer direção. É aqui que a oscilação deixa de ser um número na tela e vira dinheiro.',
            '<strong>Vender antes também custa a isenção.</strong> A vantagem de custo desses títulos está condicionada a carregá-los até o fim, como detalhado na próxima seção. Saída antecipada devolve o título ao regime de cobrança comum.',
          ],
        },
        {
          kind: 'p',
          html: 'Vale registrar o que acontece depois da conversão, porque quase ninguém pergunta antes de comprar: <strong>a fase de recebimento não obriga você a ficar parado</strong>. É possível vender as parcelas ainda não pagas, sujeitas ao preço do dia, se a sua vida mudar. Renda+ e Educa+ são desenhados para serem carregados, não são prisões contratuais.',
        },
        {
          kind: 'p',
          html: 'A regra de decisão que sobra de tudo isso é simples de enunciar e difícil de seguir: <strong>só entre com dinheiro que você tem certeza de não precisar antes da data de conversão</strong>. Se existe qualquer chance de resgate no meio, o dinheiro está na classe errada, e o guia de <a href="/guias/cdb-lci-lca">CDB, LCI e LCA</a> e o de <a href="/guias/reserva-de-emergencia">reserva de emergência</a> cobrem as alternativas de prazo curto e médio.',
        },
      ],
    },
    {
      id: 'sec-6',
      title: 'Custos e imposto: a isenção que premia quem carrega',
      blocks: [
        {
          kind: 'p',
          html: 'O incentivo econômico desses títulos está concentrado em uma regra de custo, e ela é a razão de existir do produto. As regras abaixo são o desenho geral vigente desde o lançamento, mas tributação e tabelas mudam por lei: trate como referência e confirme a regra do exercício atual antes de calcular o seu.',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Carregar até o fim isenta a taxa de custódia.</strong> Quem mantém o título até o vencimento não paga a taxa de custódia da bolsa sobre a renda recebida. Essa isenção não existe em nenhum outro título do Tesouro Direto, e é o principal argumento de custo do produto.',
            '<strong>A isenção tem teto em salários mínimos.</strong> Ela vale até o equivalente a 6 salários mínimos de renda mensal recebida. O que passar desse limite volta a ser cobrado, apenas sobre o excedente. Para a esmagadora maioria dos investidores pessoa física, o teto nunca é alcançado.',
            '<strong>Sair antes derruba a isenção.</strong> Venda antecipada devolve o título ao regime comum de taxa de custódia, cobrada por período de permanência. É o segundo custo da pressa, somado ao preço do dia.',
            '<strong>O Imposto de Renda segue a tabela regressiva.</strong> Como regra geral, a alíquota vai de 22,5% para prazos curtos até 15% para prazos acima de dois anos, e incide apenas sobre o rendimento, nunca sobre o valor aportado. Em um título carregado por décadas, a alíquota aplicável é sempre a menor da tabela.',
            '<strong>O imposto é retido em cada parcela.</strong> Durante a fase de conversão, o IR é descontado no recebimento, sobre a parte da parcela que corresponde a rendimento. Você não precisa apurar nem emitir guia, mas precisa lançar os valores na declaração anual, como trata o guia de <a href="/guias/como-declarar-investimentos-no-ir">como declarar investimentos no IR</a>.',
          ],
        },
        {
          kind: 'p',
          html: 'Some as duas pontas e o desenho fica evidente. <strong>O produto foi construído para punir a saída e premiar a permanência</strong>, e faz isso com três mecanismos ao mesmo tempo: carência inicial, oscilação de preço amplificada pela duration e isenção de custódia condicionada. Nada disso é armadilha escondida, é o instrumento fazendo aquilo para que foi desenhado.',
        },
      ],
    },
    {
      id: 'sec-7',
      title: 'Para quem faz sentido, e para quem não faz',
      blocks: [
        {
          kind: 'p',
          html: 'Vale ser explícito nos dois sentidos, porque a frustração com esses títulos quase sempre nasce de comprar o produto certo para o objetivo errado:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Faz sentido para o horizonte que você não vai tocar.</strong> Complemento de aposentadoria daqui a décadas, ou a faculdade de uma criança pequena. Quanto mais distante e mais datado o objetivo, melhor o encaixe.',
            '<strong>Faz sentido para quem quer disciplina embutida.</strong> Receber parcelado resolve um problema real que o IPCA+ tradicional não resolve: gastar de uma vez o valor que levou vinte anos para juntar.',
            '<strong>Não faz sentido para reserva de emergência.</strong> Carência, duration alta e isenção condicionada são exatamente o oposto do que uma reserva precisa. Esse dinheiro tem lugar próprio.',
            '<strong>Não faz sentido para quem acompanha o preço todo dia.</strong> Se ver a posição negativa por meses vai te fazer vender, a duration vai transformar uma característica do produto em prejuízo realizado.',
            '<strong>Não substitui uma carteira.</strong> Renda futura corrigida pela inflação é uma peça, não a estrutura inteira. Como ela convive com as outras classes é assunto do guia de <a href="/guias/como-montar-carteira-de-investimentos">como montar uma carteira de investimentos</a>.',
          ],
        },
        {
          kind: 'p',
          html: 'Uma última confusão de nome que vale desfazer, porque os três aparecem lado a lado na mesma tela: <strong>Tesouro Reserva não é a mesma família</strong>. Ele é um título indexado à <a href="/glossario/selic">Selic</a>, pensado para liquidez, e não paga renda em parcelas. Renda+ e Educa+ são os dois únicos títulos com fase de conversão. Se o objetivo é ter o dinheiro disponível, o caminho é a família Selic, não estes.',
        },
        {
          kind: 'p',
          html: 'Para seguir daqui: a página de <a href="/tesouro">títulos do Tesouro</a> lista o que está disponível hoje com prazo e característica de cada papel, as <a href="/calculadoras">calculadoras da Redentia</a> transformam objetivo em aporte mensal, o <a href="/glossario">glossário</a> destrincha os termos citados, a <a href="/metodologia">metodologia</a> explica como a Redentia calcula os indicadores das páginas de ativo e a <a href="/carteira">carteira</a> reúne suas posições em um lugar só.',
        },
      ],
    },
  ],
  cta: {
    title: 'Veja os títulos do Tesouro disponíveis hoje',
    subtitle: 'Redentia · prazo, característica e objetivo de cada título público, em uma página',
    to: '/tesouro',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'O que é o Tesouro Renda+ e como ele funciona?',
      a: 'É um título público de duas fases. Na fase de acumulação ele rende a inflação medida pelo IPCA mais uma taxa fixa contratada na compra, sem pagar nada no caminho. A partir da data de conversão, que é o ano que aparece no nome do título, ele paga 240 parcelas mensais, o equivalente a 20 anos de renda, todas corrigidas pela inflação. Diferente dos títulos tradicionais, ele não devolve um valor único no vencimento.',
    },
    {
      q: 'Qual a diferença entre Tesouro Renda+ e Tesouro Educa+?',
      a: 'A mecânica é idêntica e o prazo de pagamento é o que muda. O Renda+ paga 240 parcelas mensais, ou 20 anos, e foi desenhado como complemento de aposentadoria. O Educa+ paga 60 parcelas, ou 5 anos, aproximadamente a duração de um curso superior, com os pagamentos começando em janeiro do ano de conversão escolhido. Os dois rendem IPCA mais uma taxa fixa e têm a mesma regra de carência, custódia e imposto.',
    },
    {
      q: 'O que é a data de conversão?',
      a: 'É a data em que o título deixa de acumular e começa a pagar as parcelas mensais. É ela que aparece no nome do papel, e não o vencimento. O vencimento de verdade acontece bem depois: no Renda+, vinte anos após a conversão, quando cai a última das 240 parcelas. Confundir as duas datas é o erro de leitura mais comum desses títulos.',
    },
    {
      q: 'Por que o Tesouro Renda+ tem duration tão alta?',
      a: 'Duration é o prazo médio em que o dinheiro efetivamente volta para o investidor, ponderando cada pagamento pelo momento em que ocorre. No Renda+ o dinheiro não volta na data de conversão: volta espalhado pelos vinte anos seguintes, somados ao período de acumulação. Isso resulta na maior duration da prateleira do Tesouro Direto, e é por isso que o preço na tela reage com força a qualquer mudança nos juros da economia. A oscilação só vira perda se você vender antes.',
    },
    {
      q: 'Posso resgatar o Tesouro Renda+ antes da data de conversão?',
      a: 'Pode, respeitada a carência de 60 dias que se aplica a cada compra. Passado esse prazo, o Tesouro Nacional recompra o título nos dias úteis, mas pelo preço do dia. Como a duration é muito alta, a diferença em relação ao valor aportado pode ser grande nos dois sentidos. Vender antes também faz perder a isenção da taxa de custódia, que depende de carregar o título até o fim.',
    },
    {
      q: 'O Tesouro Renda+ e o Educa+ pagam taxa de custódia?',
      a: 'Quem carrega o título até o vencimento não paga taxa de custódia sobre a renda recebida, uma isenção que não existe em nenhum outro título do Tesouro Direto. Ela vale até o equivalente a 6 salários mínimos de renda mensal, e o que exceder esse limite volta a ser cobrado apenas sobre o excedente. Em caso de venda antecipada, o título retorna ao regime comum de cobrança por período de permanência.',
    },
    {
      q: 'Como funciona o Imposto de Renda nesses títulos?',
      a: 'Como regra geral, vale a tabela regressiva da renda fixa, com alíquota de 22,5% para prazos curtos caindo até 15% acima de dois anos, incidindo apenas sobre o rendimento. Em títulos carregados por décadas, a alíquota aplicável é sempre a menor. Durante a fase de conversão o imposto é retido em cada parcela, sobre a parte que corresponde a rendimento, sem necessidade de apurar ou emitir guia. Os valores ainda precisam ser informados na declaração anual, e regras tributárias mudam por lei, então confirme as vigentes.',
    },
  ],
  related: ['Tesouro Direto para iniciantes', 'Reserva de emergência: quanto guardar e onde investir', 'Como montar uma carteira de investimentos'],
}
