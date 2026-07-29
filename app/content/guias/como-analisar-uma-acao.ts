/**
 * Guia: Como analisar uma ação (guia fundacional da tag 'Análise').
 * Estrutura e qualidade espelham reserva-de-emergencia.ts e
 * como-montar-carteira-de-investimentos.ts: hero (dek) + seções h2 com blocos
 * ricos (p/stats/steps/checks) + CTA + FAQ + related.
 *
 * Escopo deliberado: aprofunda o que o guia "Como investir em ações" só
 * tangencia na seção "Como escolher uma ação sem chutar". Aqui o assunto é a
 * leitura dos indicadores em si, não o passo a passo da primeira compra.
 *
 * Conteúdo HONESTO: nenhum indicador aparece com valor numérico de mercado,
 * nenhuma média setorial, nenhum ticker apresentado como barato ou caro,
 * nenhuma rentabilidade. Os únicos números do texto são definições
 * matemáticas do próprio indicador (ex.: P/L de 10 = dez anos de lucro atual)
 * e números estruturais nos stat cards. Faixas de "bom" ou "ruim" são
 * apresentadas como convenção de mercado com o contexto que as invalida.
 *
 * HTML dos blocos é local e confiável: só <strong> e <a href> internos.
 * Todas as rotas linkadas existem (glossário, rankings, calculadora,
 * metodologia, guias irmãos).
 */
import type { GuideDoc } from '~/types/guias'

export const COMO_ANALISAR_UMA_ACAO_GUIDE: GuideDoc = {
  slug: 'como-analisar-uma-acao',
  tag: 'Análise',
  title: 'Como analisar uma ação: os indicadores que importam',
  dek: 'O que olhar antes de comprar, em que ordem e por que nenhum indicador sozinho responde se a ação vale a pena.',
  description:
    'Como analisar uma ação na prática: o que significam P/L, P/VP, ROE, ROIC, margens, endividamento e dividend yield, em que ordem ler cada um e os erros que fazem um indicador barato parecer oportunidade. Guia claro e honesto da Redentia.',
  summary:
    'Preço na tela não diz se a ação está cara. Veja o que cada indicador mede de verdade, como comparar empresas sem se enganar e o roteiro de análise que separa uma ação descontada de uma armadilha de valor.',
  minutes: 11,
  author: 'Equipe Redentia',
  datePublished: '2026-07-29',
  dateModified: '2026-07-29',
  updatedLine: 'Atualizado em 29 jul 2026 · 11 min de leitura',
  updatedShort: 'atualizado em jul 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'Por que o preço da tela não responde nada',
      blocks: [
        {
          kind: 'p',
          html: 'Uma ação que custa poucos reais não é barata, e uma que custa centenas não é cara. O preço isolado só diz quanto custa uma fração da empresa, e essa fração depende de quantas ações existem. <strong>Caro e barato são relações, nunca valores absolutos</strong>: preço comparado com lucro, com patrimônio, com geração de caixa.',
        },
        {
          kind: 'p',
          html: 'Analisar uma ação é responder duas perguntas separadas, e confundi-las é o erro mais caro do investidor iniciante. A primeira é <strong>a empresa é boa?</strong>, que se responde com rentabilidade, margens, dívida e histórico. A segunda é <strong>o preço faz sentido?</strong>, que se responde com múltiplos de valuation. Empresa excelente comprada em qualquer preço vira investimento medíocre, e empresa ruim não fica boa por estar descontada.',
        },
        {
          kind: 'stats',
          items: [
            { value: '2', label: 'perguntas independentes: a empresa é boa e o preço faz sentido' },
            { value: '4', label: 'famílias de indicadores: preço, rentabilidade, dívida e proventos' },
            { value: '5 anos', label: 'histórico mínimo para separar consistência de trimestre sortudo' },
          ],
        },
        {
          kind: 'p',
          html: 'O que este guia faz é traduzir cada indicador para linguagem de negócio antes de virar fórmula. Se você prefere começar pelo básico de como comprar, o guia de <a href="/guias/como-investir-em-acoes">como investir em ações</a> cobre a abertura de conta e a primeira ordem.',
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'As quatro famílias de indicadores',
      blocks: [
        {
          kind: 'p',
          html: 'Existem dezenas de indicadores publicados sobre cada empresa listada, e a maioria mede variações da mesma coisa. Para não se perder, agrupe tudo em quatro famílias e leia sempre nesta ordem:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Rentabilidade.</strong> A empresa transforma capital em lucro de forma eficiente? É a família que responde se o negócio é bom. Aqui moram ROE, ROIC e as margens.',
            '<strong>Endividamento e solidez.</strong> A empresa aguenta um ano ruim? Dívida sob controle é o que separa uma queda temporária de uma crise permanente.',
            '<strong>Valuation.</strong> Quanto você paga pelo que a empresa entrega? P/L, P/VP e EV/EBITDA vivem aqui. Só faz sentido olhar depois das duas primeiras famílias.',
            '<strong>Proventos.</strong> Quanto da geração de caixa volta para o acionista e se isso é sustentável. Dividend yield e payout, sempre lidos juntos.',
          ],
        },
        {
          kind: 'p',
          html: 'A ordem importa. Quem começa pelo valuation encontra sempre as empresas mais problemáticas do mercado, porque múltiplo baixo costuma ser preço de um risco que o mercado já enxergou. Começar pela qualidade do negócio e só então perguntar o preço evita metade das armadilhas.',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'Rentabilidade: a empresa sabe usar o dinheiro?',
      blocks: [
        {
          kind: 'p',
          html: 'Rentabilidade mede quanto de lucro a empresa gera para cada real que ela tem ou que ela usa. É a família mais próxima da pergunta "esse negócio é bom", e a que menos varia com o humor do mercado.',
        },
        {
          kind: 'checks',
          items: [
            '<strong><a href="/glossario/roe">ROE</a> (retorno sobre patrimônio líquido).</strong> Lucro dividido pelo capital dos sócios. Responde quanto a empresa devolve por real de patrimônio. ROE alto sustentado por muitos anos costuma indicar vantagem competitiva real, mas ele também sobe artificialmente quando a empresa se endivida muito, porque dívida encolhe o patrimônio sem encolher o lucro. Por isso ROE nunca se lê sozinho.',
            '<strong><a href="/glossario/roic">ROIC</a> (retorno sobre o capital investido).</strong> Corrige justamente esse ponto: considera capital próprio e de terceiros. Comparar ROE e ROIC lado a lado mostra quanto da rentabilidade vem de operação e quanto vem de alavancagem.',
            '<strong><a href="/glossario/margem-liquida">Margem líquida</a> e margem operacional.</strong> Quanto de cada real de receita sobra como lucro. Margem alta indica poder de preço ou eficiência; margem apertada significa que qualquer solavanco de custo derruba o resultado.',
            '<strong>Consistência.</strong> Mais importante que o número deste ano é a série dele. Uma empresa com rentabilidade estável ao longo de um ciclo inteiro de juros diz mais do que uma que teve um ano excepcional.',
          ],
        },
        {
          kind: 'p',
          html: 'Rentabilidade só se compara dentro do mesmo setor. Banco, varejo, mineradora e empresa de energia operam com estruturas de capital tão diferentes que confrontar o ROE de um com o de outro não produz informação. Os <a href="/rankings">rankings da Redentia</a> permitem essa leitura relativa, incluindo o de <a href="/ranking/maiores-roe">maiores ROE</a> da bolsa.',
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'Endividamento: a empresa aguenta um ano ruim?',
      blocks: [
        {
          kind: 'p',
          html: 'Dívida não é defeito. Empresa que cresce quase sempre usa capital de terceiros, e negócios de infraestrutura são construídos assim por natureza. O que interessa não é o tamanho da dívida, é <strong>a capacidade de pagá-la com o caixa que a operação gera</strong>.',
        },
        {
          kind: 'checks',
          items: [
            '<strong><a href="/glossario/divida-liquida-ebitda">Dívida líquida sobre EBITDA</a>.</strong> Quantos anos de geração operacional de caixa seriam necessários para zerar a dívida. É o indicador mais direto de folga financeira, e o que os próprios contratos de dívida costumam usar como gatilho.',
            '<strong>Cobertura de juros.</strong> Quanto do resultado operacional é consumido só para pagar juros. Quando essa conta aperta, a empresa vira refém do ciclo de juros e não do próprio plano.',
            '<strong><a href="/glossario/liquidez-corrente">Liquidez corrente</a>.</strong> Se o que a empresa tem a receber no curto prazo cobre o que ela tem a pagar no curto prazo. É o teste de fôlego imediato.',
            '<strong>Perfil da dívida.</strong> Dívida longa, em moeda local e a taxa conhecida é um problema muito menor que dívida curta, em moeda estrangeira ou pós-fixada. Dois balanços com o mesmo endividamento podem ter riscos completamente diferentes.',
          ],
        },
        {
          kind: 'p',
          html: 'A pergunta prática é sempre a mesma: se a receita caísse por um ano inteiro, essa empresa atravessaria sem precisar vender ativo, cortar investimento ou emitir novas ações? Empresa que precisa emitir ações no fundo do ciclo dilui quem ficou, e essa diluição não aparece em nenhum múltiplo de preço.',
        },
      ],
    },
    {
      id: 'sec-5',
      title: 'Valuation: quanto você está pagando',
      blocks: [
        {
          kind: 'p',
          html: 'Só depois de entender o negócio faz sentido perguntar o preço. Múltiplo de valuation é sempre a mesma ideia: dividir o quanto o mercado cobra pela empresa por alguma medida do que ela entrega.',
        },
        {
          kind: 'checks',
          items: [
            '<strong><a href="/glossario/p-l">P/L</a> (preço sobre lucro).</strong> Quantos anos de lucro atual seriam necessários para pagar o preço da ação. Um P/L de 10 significa dez anos de lucro no ritmo de hoje. P/L alto embute expectativa de crescimento; P/L baixo embute desconfiança do mercado. O indicador não distingue as duas coisas, quem distingue é você.',
            '<strong><a href="/glossario/p-vp">P/VP</a> (preço sobre valor patrimonial).</strong> Quanto o mercado cobra por real de patrimônio contábil. Faz mais sentido em bancos e seguradoras, onde o balanço é o próprio negócio, e quase nenhum em empresas cujo valor está em marca, software ou contrato, coisas que o balanço mal registra.',
            '<strong><a href="/glossario/ev-ebitda">EV/EBITDA</a>.</strong> Compara o valor da empresa incluindo dívida com a geração operacional de caixa. É o múltiplo preferido para comparar empresas com estruturas de capital diferentes, porque não se deixa distorcer por quem tem muita ou pouca dívida.',
            '<strong>Múltiplos são relativos.</strong> Não existe número universalmente bom. O mesmo múltiplo pode ser caro em um setor cíclico e barato em um setor previsível. A comparação válida é contra os pares do setor e contra o próprio histórico da empresa.',
          ],
        },
        {
          kind: 'p',
          html: 'Métodos clássicos como a fórmula de Graham e o preço teto de Bazin nada mais são do que atalhos para transformar múltiplos em um preço de referência. Eles ajudam a colocar disciplina no processo, desde que sejam tratados como termômetro e não como veredito. A <a href="/calculadora/preco-teto">calculadora de preço teto</a> faz essa conta, e os rankings de <a href="/ranking/mais-baratas-graham">mais baratas por Graham</a> e <a href="/ranking/menores-pl">menores P/L</a> mostram quem aparece no topo dessas listas hoje.',
        },
      ],
    },
    {
      id: 'sec-6',
      title: 'Proventos: quanto volta para o seu bolso',
      blocks: [
        {
          kind: 'p',
          html: 'Para quem investe pensando em renda, os indicadores de provento são o destino final da análise. Mas são também os mais fáceis de ler errado, porque o mais famoso deles é uma fração com preço no denominador.',
        },
        {
          kind: 'checks',
          items: [
            '<strong><a href="/glossario/dividend-yield">Dividend yield</a>.</strong> Proventos distribuídos divididos pelo preço da ação. Como o preço está embaixo, o yield sobe quando a ação cai. Um yield muito acima dos pares merece a pergunta antes da comemoração: a empresa distribuiu mais ou a ação despencou?',
            '<strong><a href="/glossario/payout">Payout</a>.</strong> Que fatia do lucro virou provento. Payout muito alto e sustentado por anos costuma significar que sobra pouco para reinvestir, e às vezes que a empresa está distribuindo mais do que ganha, o que não se sustenta.',
            '<strong>Extraordinários.</strong> Venda de ativo, mudança de política ou distribuição pontual inflam o yield de um ano e desaparecem no seguinte. Olhar a série de vários anos evita tomar evento isolado por padrão.',
            '<strong>Origem do dinheiro.</strong> Provento pago com geração de caixa operacional é diferente de provento pago com dívida nova ou com venda de patrimônio. O primeiro é resultado, o segundo é adiantamento.',
          ],
        },
        {
          kind: 'p',
          html: 'O histórico de proventos por empresa fica na página de <a href="/dividendos/PETR4">dividendos de cada ativo</a>, e o guia de <a href="/guias/acoes-fiis-dividendos-todo-mes">dividendos todo mês</a> mostra como transformar essa leitura em uma escada de recebimentos ao longo do ano.',
        },
      ],
    },
    {
      id: 'sec-7',
      title: 'O roteiro na prática (e os erros que ele evita)',
      blocks: [
        {
          kind: 'p',
          html: 'Análise não é decorar fórmula, é seguir sempre a mesma sequência para que a sua opinião não mude conforme o humor do dia. Um roteiro simples resolve:',
        },
        {
          kind: 'steps',
          items: [
            'Entenda como a empresa ganha dinheiro. Se você não consegue explicar o negócio em duas frases, pare aqui. Nenhum indicador conserta a falta desse passo.',
            'Olhe rentabilidade e margens em série de vários anos, não no trimestre. Você está procurando padrão, não pico.',
            'Cheque o endividamento e o perfil da dívida. Esse é o passo que elimina candidatas antes que o preço tente te convencer.',
            'Só então compare os múltiplos de valuation, sempre contra os pares do setor e contra o histórico da própria empresa.',
            'Se o objetivo for renda, leia dividend yield e payout juntos e confira a origem do dinheiro distribuído.',
            'Escreva a tese em poucas linhas: o que precisa acontecer para dar certo e o que a invalidaria. Sem isso, qualquer queda vira motivo para vender e qualquer alta vira motivo para comprar mais.',
          ],
        },
        {
          kind: 'p',
          html: 'Três erros aparecem repetidamente, e todos são evitados pelo roteiro. O primeiro é a <strong>armadilha de valor</strong>: comprar porque o múltiplo é baixo sem investigar por que ele é baixo. O segundo é <strong>comparar setores diferentes</strong>, o que sempre faz um deles parecer barato por motivos puramente estruturais. O terceiro é <strong>confundir empresa boa com investimento bom</strong>, ignorando que o preço pago define o retorno tanto quanto a qualidade do negócio.',
        },
        {
          kind: 'p',
          html: 'Vale lembrar o limite dessa caixa de ferramentas. Todo indicador olha para trás, para números já publicados, enquanto o preço da ação olha para frente. Análise fundamentalista não prevê cotação e não deve ser usada para acertar o timing, ela serve para você saber o que está comprando e a que custo. O <a href="/glossario">glossário</a> destrincha cada termo, a <a href="/metodologia">metodologia</a> explica como a Redentia calcula os indicadores das páginas de ativo e as <a href="/teses">teses</a> mostram esse raciocínio aplicado do começo ao fim.',
        },
        {
          kind: 'p',
          html: 'Com a leitura afiada, o passo seguinte é decidir o peso de cada posição. O guia de <a href="/guias/como-montar-carteira-de-investimentos">como montar uma carteira de investimentos</a> cobre alocação e rebalanceamento, e o de <a href="/guias/small-caps-guia-completo">small caps</a> mostra como esses mesmos indicadores mudam de leitura em empresas menores.',
        },
      ],
    },
  ],
  cta: {
    title: 'Compare os indicadores de todas as ações da B3',
    subtitle: 'Rankings da Redentia · empresas ordenadas por P/L, ROE e dividend yield',
    to: '/rankings',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'Quais indicadores olhar antes de comprar uma ação?',
      a: 'Comece pela rentabilidade (ROE, ROIC e margens) para saber se o negócio é bom, siga para o endividamento (dívida líquida sobre EBITDA e perfil da dívida) para saber se ele aguenta um ano ruim e só então olhe os múltiplos de valuation (P/L, P/VP, EV/EBITDA) para saber se o preço faz sentido. Se o objetivo for renda, acrescente dividend yield e payout, sempre lidos juntos.',
    },
    {
      q: 'O que é P/L e qual é um bom P/L?',
      a: 'P/L é o preço da ação dividido pelo lucro por ação, ou seja, quantos anos de lucro no ritmo atual seriam necessários para pagar o preço pago. Não existe um número universalmente bom: P/L alto pode refletir expectativa de crescimento e P/L baixo pode refletir risco que o mercado já enxergou. A comparação só produz informação contra empresas do mesmo setor e contra o histórico da própria empresa.',
    },
    {
      q: 'Qual a diferença entre ROE e ROIC?',
      a: 'ROE mede o lucro sobre o patrimônio dos sócios, enquanto ROIC mede o retorno sobre todo o capital investido no negócio, próprio e de terceiros. A diferença importa porque endividamento eleva o ROE sem melhorar a operação. Quando o ROE é muito maior que o ROIC, boa parte da rentabilidade vem de alavancagem, não de eficiência.',
    },
    {
      q: 'P/VP abaixo de 1 significa que a ação está barata?',
      a: 'Não necessariamente. P/VP abaixo de 1 significa que o mercado está pagando menos que o valor contábil do patrimônio, o que pode indicar desconto ou pode indicar que o mercado não acredita que aquele patrimônio gere retorno. Além disso, o indicador é pouco informativo em empresas cujo valor está em marca, tecnologia ou contratos, ativos que o balanço registra mal.',
    },
    {
      q: 'O que é armadilha de valor?',
      a: 'É a ação que parece barata pelos múltiplos e continua barata, ou fica mais barata ainda, porque o desconto refletia um problema real: perda de mercado, dívida pesada, setor em declínio ou lucro que não se repete. O jeito de evitar é sempre investigar a causa do múltiplo baixo antes de tratá-lo como oportunidade.',
    },
    {
      q: 'Análise fundamentalista ou análise técnica?',
      a: 'São perguntas diferentes. A fundamentalista avalia o negócio e o preço pago por ele, com horizonte de anos. A técnica estuda o comportamento do preço e do volume, com horizonte de dias ou semanas. Para quem investe com foco no longo prazo, a fundamentalista é a base da decisão, e nenhuma das duas prevê cotação futura.',
    },
    {
      q: 'Quanto tempo de histórico devo analisar?',
      a: 'Uma regra prática é olhar pelo menos cinco anos, o suficiente para atravessar mudanças de ciclo econômico e de juros. Trimestre isolado é ruído: qualquer empresa tem um período excepcionalmente bom ou ruim. O que você procura na série longa é consistência, não o melhor número.',
    },
  ],
  related: ['Como investir em ações', 'Small caps: guia completo', 'Como montar uma carteira de investimentos'],
}
