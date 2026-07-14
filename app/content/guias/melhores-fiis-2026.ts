/**
 * Guia: Melhores FIIs 2026 (Grupo A do KIT de guias Nu).
 *
 * Conteúdo HONESTO e principiológico: NENHUM ticker, cotação, dividend yield,
 * P/VP ou vacância apresentado como fato de mercado. O guia ensina o CRITÉRIO
 * de escolha, não entrega uma lista de fundos. Números nos stat cards são
 * estruturais (quantos tipos de FII, quantos indicadores), não financeiros.
 * Faixas citadas (ex.: "cotas na casa de dezenas a poucas centenas de reais")
 * são ilustrativas e sinalizadas, nunca cotação de um fundo específico.
 *
 * HTML dos blocos é local e confiável: só <strong> e <a href> internos.
 */
import type { GuideDoc } from '~/types/guias'

export const MELHORES_FIIS_2026_GUIDE: GuideDoc = {
  slug: 'melhores-fiis-2026',
  tag: 'FIIs',
  title: 'Melhores FIIs 2026',
  dek: 'O melhor FII não é o que mais rende no mês, é o que você entende. Veja os três tipos de fundo, os indicadores que importam e como escolher sem cair na armadilha do dividend yield alto.',
  description:
    'Melhores FIIs de 2026: como escolher fundos imobiliários por segmento (tijolo, papel, fundos de fundos), indicadores que importam (DY, P/VP, vacância, liquidez) e os erros que derrubam iniciantes. Guia claro da Redentia, sem indicar ticker.',
  summary:
    'Não existe lista mágica dos melhores FIIs: existe o fundo certo para o seu objetivo. Entenda os três segmentos, os indicadores que separam um bom fundo de uma armadilha e como montar renda mensal sem chutar.',
  minutes: 10,
  author: 'Equipe Redentia',
  datePublished: '2026-07-13',
  dateModified: '2026-07-13',
  updatedLine: 'Atualizado em 13 jul 2026 · 10 min de leitura',
  updatedShort: 'atualizado em jul 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'O melhor FII não sai de uma lista',
      blocks: [
        {
          kind: 'p',
          html: 'A resposta honesta: não existe um ranking fixo dos "melhores FIIs de 2026" que sirva para todo mundo. O melhor fundo imobiliário para quem quer renda mensal estável é diferente do melhor para quem aceita mais risco em troca de valorização. Este guia não entrega uma lista de tickers, ele entrega o <strong>critério</strong> para você montar a sua, e saber por que cada fundo entrou.',
        },
        {
          kind: 'p',
          html: 'Um FII (Fundo de Investimento Imobiliário) é um condomínio de investidores que junta dinheiro para investir em imóveis ou em títulos ligados ao setor imobiliário. Você compra cotas, negociadas na bolsa como uma ação, e passa a ter direito a uma fatia dos aluguéis e juros que o fundo recebe, distribuídos, na maioria dos casos, todo mês.',
        },
        {
          kind: 'stats',
          items: [
            { value: '3', label: 'tipos de FII: tijolo, papel e fundos de fundos' },
            { value: '4', label: 'indicadores que realmente importam' },
            { value: '0', label: 'ticker recomendado por palpite' },
          ],
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'Como um FII coloca dinheiro na sua conta',
      blocks: [
        {
          kind: 'p',
          html: 'A lógica do FII é simples: o fundo é dono de algo que gera renda, e repassa essa renda para os cotistas. Um fundo de tijolo aluga galpões ou lajes e distribui os aluguéis; um fundo de papel recebe os juros de títulos de crédito imobiliário e distribui esses juros. Você recebe proporcional ao número de cotas que tem.',
        },
        {
          kind: 'p',
          html: 'Por lei, o FII precisa distribuir a maior parte do resultado que apura, o que explica por que ele costuma pagar rendimento com frequência mensal. Para o investidor pessoa física, esse rendimento distribuído hoje é <strong>isento de Imposto de Renda</strong>, desde que cumpridas as condições da regra (voltamos a isso na última seção). É essa combinação, renda recorrente e isenta, que faz do FII um dos caminhos preferidos de quem busca <a href="/rankings">renda passiva</a>.',
        },
        {
          kind: 'p',
          html: 'A cota, por outro lado, oscila de preço na bolsa como qualquer ativo negociado. Você pode receber renda todo mês e, ainda assim, ver a cota subir ou cair. Entender que são duas coisas diferentes, o rendimento distribuído e o preço da cota, evita metade dos sustos de quem está começando.',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'Os três tipos de FII (e para que serve cada um)',
      blocks: [
        {
          kind: 'p',
          html: 'Antes de olhar qualquer indicador, você precisa saber que tipo de fundo está avaliando. Misturar tijolo com papel sem perceber é um erro comum, porque eles reagem de formas opostas a juros e inflação.',
        },
        {
          kind: 'p',
          html: '<strong>1. FIIs de tijolo.</strong> São donos de imóveis físicos: galpões de logística, lajes corporativas, shoppings, hospitais. A renda vem do aluguel desses imóveis. Tendem a valorizar quando a economia aquece e sofrem quando a vacância sobe. É o FII mais "concreto", você consegue apontar o prédio.',
        },
        {
          kind: 'p',
          html: '<strong>2. FIIs de papel.</strong> Não têm imóvel: investem em títulos de dívida do setor, como CRIs (Certificados de Recebíveis Imobiliários). A renda vem dos juros desses papéis, muitas vezes atrelados à inflação ou ao CDI. Costumam entregar renda mais previsível, mas o risco migra para a qualidade do crédito, ou seja, se quem deve vai pagar.',
        },
        {
          kind: 'p',
          html: '<strong>3. Fundos de fundos (FOFs).</strong> Compram cotas de outros FIIs. Em uma tacada, você fica diversificado entre dezenas de fundos e segmentos, com um gestor decidindo a alocação. A contrapartida é uma camada extra de taxa e o fato de você delegar a escolha. Bom para quem quer começar diversificado sem montar carteira sozinho.',
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'Os quatro indicadores que importam',
      blocks: [
        {
          kind: 'p',
          html: 'Um bom FII não é o que mostra o número mais bonito em uma métrica isolada, é o que equilibra as quatro. Leia sempre em conjunto:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Dividend yield (DY).</strong> Quanto o fundo distribuiu em relação ao preço da cota. Útil, mas traiçoeiro: um DY altíssimo às vezes é sinal de que a cota caiu de preço por um problema real, ou de um pagamento extraordinário que não se repete. DY alto não é convite, é uma pergunta a investigar.',
            '<strong>P/VP (preço sobre valor patrimonial).</strong> Compara o preço da cota com o valor dos ativos do fundo. Abaixo de 1 sugere que o mercado paga menos do que o patrimônio vale; acima, que paga um prêmio. Nunca isolado: um desconto pode refletir um risco que o mercado enxergou antes de você.',
            '<strong>Vacância.</strong> Só para fundos de tijolo. É a fatia dos imóveis desocupada, sem gerar aluguel. Vacância subindo derruba a renda futura, mesmo que o rendimento de hoje ainda pareça bom.',
            '<strong>Liquidez.</strong> O volume negociado por dia. Um fundo pouco negociado é difícil de vender sem derrubar o preço. Liquidez baixa transforma um bom fundo em uma armadilha na hora de sair.',
          ],
        },
        {
          kind: 'p',
          html: 'Cada um desses indicadores vira uma coluna comparável nos <a href="/rankings">rankings da Redentia</a>, para você olhar um fundo ao lado dos pares do mesmo segmento, que é a única comparação que faz sentido.',
        },
      ],
    },
    {
      id: 'sec-5',
      title: 'Como escolher um bom FII sem chutar',
      blocks: [
        {
          kind: 'p',
          html: 'Transforme os indicadores em um roteiro. Antes de comprar qualquer cota, passe o fundo por estes filtros:',
        },
        {
          kind: 'steps',
          items: [
            '<strong>Defina seu objetivo primeiro.</strong> Renda mensal estável puxa para papel e tijolos maduros; potencial de valorização aceita fundos em desenvolvimento. Sem objetivo, todo DY parece bom.',
            '<strong>Identifique o segmento.</strong> Logística, lajes, shoppings, papel, FOF. Cada um responde diferente a juros e inflação, e comparar fundos de segmentos distintos leva a conclusões erradas.',
            '<strong>Leia o relatório gerencial.</strong> É onde o gestor conta a vacância, os contratos, os inquilinos e os riscos. Comprar sem ler isso é comprar no escuro.',
            '<strong>Cheque a liquidez.</strong> Confirme que o fundo é negociado o bastante para você entrar e sair sem prejuízo no preço.',
            '<strong>Diversifique entre segmentos.</strong> Espalhar entre tijolo, papel e até um FOF reduz o risco de um único setor imobiliário derrubar sua renda.',
          ],
        },
        {
          kind: 'p',
          html: 'Muitas cotas custam na faixa de dezenas a poucas centenas de reais (valor ilustrativo, varia por fundo e por dia), o que permite montar uma carteira diversificada com aportes pequenos e regulares. A ideia não é acertar o "melhor FII do ano", é ter uma carteira que você entende e consegue explicar.',
        },
      ],
    },
    {
      id: 'sec-6',
      title: 'Os erros que derrubam quem começa em FIIs',
      blocks: [
        {
          kind: 'p',
          html: 'A maioria das decepções com FIIs não vem do mercado, vem de comportamento. Fuja destes:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Comprar só pelo dividend yield mais alto.</strong> O maior DY da lista costuma esconder o maior problema. Renda alta demais é um alerta, não um atalho.',
            '<strong>Ignorar a liquidez.</strong> Um fundo minúsculo pode render bem no papel e ser quase impossível de vender por um preço justo depois.',
            '<strong>Concentrar em um único segmento.</strong> Só lajes corporativas, ou só shoppings, deixa sua renda refém de um setor. Diversifique.',
            '<strong>Confundir rendimento com valorização.</strong> Receber renda todo mês não impede a cota de cair. Olhe o retorno total, não só o pingado.',
            '<strong>Seguir dica de grupo.</strong> Comprar um FII porque alguém postou o ticker é deixar a decisão nas mãos de quem não responde pelo seu dinheiro.',
          ],
        },
      ],
    },
    {
      id: 'sec-7',
      title: 'FIIs e o Imposto de Renda',
      blocks: [
        {
          kind: 'p',
          html: 'A parte que atrai muita gente: o <strong>rendimento mensal distribuído</strong> pelo FII para a pessoa física é, em regra, isento de Imposto de Renda, desde que cumpridas as condições da legislação (entre elas o fundo ter cotas negociadas em bolsa e o investidor não ser dono de fatia relevante do fundo). É a renda que cai na conta sem desconto na fonte do IR.',
        },
        {
          kind: 'p',
          html: 'A isenção, porém, vale para a distribuição, não para o <strong>ganho na venda das cotas</strong>. Se você vende uma cota por mais do que pagou, esse lucro é tributado, sem o limite de isenção que existe para ações. E a posse das cotas e os rendimentos recebidos precisam ser informados na declaração anual, mesmo isentos. Trate isso como parte do processo desde a primeira compra: o passo a passo completo está no guia de <strong>como declarar investimentos no IR</strong>, logo abaixo.',
        },
      ],
    },
  ],
  cta: {
    title: 'Compare FIIs por segmento e indicador',
    subtitle: 'DY, P/VP, vacância e liquidez lado a lado · grátis para começar',
    to: '/rankings',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'Qual é o melhor FII para 2026?',
      a: 'Não existe um único melhor FII: depende do seu objetivo. Para renda estável, fundos de papel e de tijolo maduros costumam ser o caminho; para diversificar de uma vez, um fundo de fundos. O critério certo é escolher por segmento, indicadores e liquidez, comparando com os pares, não seguir uma lista pronta de tickers.',
    },
    {
      q: 'FII paga dividendo todo mês?',
      a: 'A maioria dos FIIs distribui rendimento com frequência mensal, porque a lei obriga a distribuir a maior parte do resultado apurado. Ainda assim, a periodicidade e o valor variam por fundo e podem mudar, então não é uma garantia fixa.',
    },
    {
      q: 'Preciso pagar imposto sobre FII?',
      a: 'O rendimento mensal distribuído à pessoa física é, em regra, isento de Imposto de Renda, cumpridas as condições da lei. Já o lucro na venda das cotas é tributado, sem o limite de isenção das ações. A posse e os rendimentos entram na declaração anual, mesmo isentos.',
    },
    {
      q: 'Qual a diferença entre FII de tijolo e FII de papel?',
      a: 'FII de tijolo é dono de imóveis físicos e vive de aluguel, valorizando quando a economia aquece. FII de papel investe em títulos de crédito imobiliário e vive de juros, com renda mais previsível, mas exposto à qualidade do crédito. Muita gente combina os dois para equilibrar a carteira.',
    },
    {
      q: 'Quanto preciso para começar a investir em FIIs?',
      a: 'É possível começar com pouco: muitas cotas custam na faixa de dezenas a poucas centenas de reais, o que permite montar uma carteira diversificada com aportes pequenos e regulares. Como sempre, garanta antes uma reserva de emergência em renda fixa de liquidez diária.',
    },
    {
      q: 'FII é mais seguro que ação?',
      a: 'FII e ação são ativos de renda variável e ambos oscilam. FIIs de tijolo e papel costumam ter renda mais recorrente, o que dá sensação de estabilidade, mas a cota cai como qualquer outra em momentos de estresse. Segurança vem de diversificação, prazo longo e escolha por fundamento, não do rótulo.',
    },
  ],
  related: ['Dividendos todo mês', 'Como investir em ações', 'Small caps: guia completo'],
}
