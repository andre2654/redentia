/**
 * Guia: Calculadora de dividendos (Grupo D do KIT de guias Nu).
 * Estrutura e qualidade espelham o exemplar como-investir-em-acoes.ts:
 * hero + seções h2 com blocos ricos (p/stats/steps/checks) + CTA + FAQ + related.
 *
 * Conteúdo HONESTO e principiológico: nenhum dividend yield, preço, cotação ou
 * "quanto rende" apresentado como fato de mercado. Todos os números em exemplos
 * (R$ 100 mil, DY de 8%, R$ 8 mil/ano) são ILUSTRATIVOS e sinalizados como tais,
 * servindo só para mostrar a mecânica da conta. Tickers citados existem apenas
 * para linkar a calculadora/ativo real. Os stat cards são estruturais
 * (quantos modos, quantas variáveis), não promessas de rendimento.
 *
 * HTML dos blocos é local e confiável: só <strong> e <a href> internos.
 */
import type { GuideDoc } from '~/types/guias'

export const CALCULADORA_DE_DIVIDENDOS_GUIDE: GuideDoc = {
  slug: 'calculadora-de-dividendos',
  tag: 'Dividendos',
  title: 'Calculadora de dividendos',
  dek: 'O que é dividend yield, como transformar um aporte em renda passiva estimada e como usar a calculadora da Redentia para simular sem chute.',
  description:
    'Calculadora de dividendos: entenda o dividend yield (DY), calcule quanto investir para atingir sua meta de renda passiva e simule o DY real de qualquer ação ou FII com a calculadora da Redentia. Guia claro, sem promessa de rendimento.',
  summary:
    'Quanto preciso investir para receber uma renda de dividendos? Entenda o dividend yield, veja a conta que liga aporte a renda passiva e aprenda a simular na calculadora da Redentia, sem chute e sem promessa.',
  minutes: 7,
  author: 'Equipe Redentia',
  datePublished: '2026-07-13',
  dateModified: '2026-07-13',
  updatedLine: 'Atualizado em 13 jul 2026 · 7 min de leitura',
  updatedShort: 'atualizado em jul 2026',
  sections: [
    {
      id: 'sec-1',
      title: 'A conta que liga aporte a renda',
      blocks: [
        {
          kind: 'p',
          html: 'A resposta curta: a renda anual de dividendos é o <strong>valor investido multiplicado pelo dividend yield</strong> da carteira. Se você aporta um valor e ele rende, digamos, 8% ao ano em proventos (número ilustrativo), a renda estimada é 8% desse valor. Inverter a conta responde a pergunta que todo mundo faz: quanto preciso ter investido para receber a renda que eu quero. É isso que uma calculadora de dividendos faz por você.',
        },
        {
          kind: 'p',
          html: 'Dividendos são a fração do lucro que uma empresa distribui aos sócios, em dinheiro, direto na sua conta. É a renda que pinga sem você vender nada. Para saber o que esperar de um aporte, você só precisa de duas peças: <strong>quanto investe</strong> e o <strong>dividend yield</strong> do que comprou. O resto é aritmética, e a calculadora resolve.',
        },
        {
          kind: 'stats',
          items: [
            { value: '2', label: 'variáveis: aporte e dividend yield' },
            { value: '3', label: 'modos de cálculo na calculadora' },
            { value: '0', label: 'promessa: tudo é estimativa' },
          ],
        },
      ],
    },
    {
      id: 'sec-2',
      title: 'O que é dividend yield (DY)',
      blocks: [
        {
          kind: 'p',
          html: 'Dividend yield, ou DY, é <strong>quanto uma ação ou FII paga em proventos em relação ao preço dela</strong>. A conta é simples: proventos pagos por cota no ano, divididos pelo preço da cota, vezes 100 para virar porcentagem. Um DY de 6% significa que, para cada R$ 100 investidos naquele papel, você recebeu R$ 6 em dividendos ao longo do ano (exemplo ilustrativo).',
        },
        {
          kind: 'p',
          html: 'O DY é uma <strong>fotografia, não uma garantia</strong>. Ele olha para trás: mede o que foi pago nos últimos doze meses sobre o preço de hoje. Nada obriga a empresa a repetir o valor no ano seguinte, e um DY muito alto às vezes é sinal de que o preço caiu por um problema real, não de que o papel é generoso. Por isso o número sozinho não decide nada, ele é o começo da análise.',
        },
        {
          kind: 'p',
          html: 'Existe ainda o <strong>yield on cost</strong>, que é o DY calculado sobre o preço que <strong>você</strong> pagou, não sobre o preço atual. Quem comprou barato há anos e viu os proventos crescerem costuma ter um yield on cost bem acima do DY que aparece na tela hoje. A <a href="/calculadora/dividend-yield">calculadora de dividendos da Redentia</a> tem um modo dedicado a essa conta.',
        },
      ],
    },
    {
      id: 'sec-3',
      title: 'Quanto investir para viver de renda',
      blocks: [
        {
          kind: 'p',
          html: 'Essa é a pergunta que trouxe você aqui, e a conta é direta: <strong>renda anual desejada dividida pelo dividend yield</strong> dá o patrimônio necessário. Para uma renda mensal, multiplique a mensal por doze antes de dividir. A calculadora faz isso em tempo real conforme você mexe nos números.',
        },
        {
          kind: 'p',
          html: 'Um exemplo <strong>ilustrativo</strong>, só para mostrar a mecânica: se você quer R$ 2.000 por mês (R$ 24.000 por ano) e assume um DY médio de carteira de 8% ao ano, precisaria de R$ 300.000 investidos (24.000 ÷ 0,08). Baixe a meta ou o yield e o número muda na hora. Nenhum desses valores é uma recomendação nem uma projeção de mercado: são apenas as engrenagens da conta.',
        },
        {
          kind: 'p',
          html: 'Repare no que a fórmula revela: <strong>yield alto reduz o patrimônio necessário, mas quase nunca vem de graça</strong>. Buscar o maior DY possível costuma significar mais risco ou menos crescimento. Um plano realista equilibra o yield de hoje com a chance de a empresa aumentar os proventos amanhã, o que empurra seu yield on cost para cima ano após ano.',
        },
      ],
    },
    {
      id: 'sec-4',
      title: 'Como usar a calculadora da Redentia',
      blocks: [
        {
          kind: 'p',
          html: 'A <a href="/calculadora/dividend-yield">calculadora de dividend yield</a> tem três modos, cada um respondendo a uma pergunta diferente. O caminho é o mesmo em todos: você preenche, e o resultado aparece na hora, sem botão de calcular.',
        },
        {
          kind: 'steps',
          items: [
            '<strong>Modo simples: qual o DY de um papel?</strong> Informe o preço da cota e quanto ela paga de proventos no ano. A calculadora devolve o dividend yield em porcentagem. É o ponto de partida para comparar papéis.',
            '<strong>Modo yield on cost: quanto rende sobre o que paguei?</strong> Informe o preço que você pagou, o preço atual e os proventos. Você vê o yield sobre o seu custo, que é o que de fato importa para quem já é sócio.',
            '<strong>Modo projeção: e daqui a alguns anos?</strong> A partir de lucro por ação, payout e crescimento estimado, a calculadora projeta como o rendimento pode evoluir. Tudo é cenário, não previsão: mude uma premissa e o resultado acompanha.',
            '<strong>Já sabe o ticker?</strong> Abra a calculadora com um ativo, por exemplo a de <a href="/asset/PETR4">PETR4</a>, e ela hidrata preço e proventos reais do papel para você partir de dados de verdade em vez de chute.',
          ],
        },
        {
          kind: 'p',
          html: 'Para dimensionar o aporte e ver o patrimônio crescer com reinvestimento, combine a calculadora de dividendos com as demais <a href="/calculadoras">calculadoras da Redentia</a>, como a de juros compostos. Meta e prazo viram número, e o número vira plano.',
        },
      ],
    },
    {
      id: 'sec-5',
      title: 'Onde a conta engana (e como não cair)',
      blocks: [
        {
          kind: 'p',
          html: 'A calculadora é honesta com os números que você dá a ela. O erro mora nas premissas. Antes de confiar num resultado, passe-o por estes filtros:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>O DY de hoje não é o de amanhã.</strong> Você está projetando o futuro com o retrovisor. Use uma média de anos, não o pico de um ano isolado, e desconfie de yields altos demais.',
            '<strong>Dividendo não é obrigação.</strong> Empresa em dificuldade corta ou suspende proventos. Renda por dividendos depende de o lucro continuar existindo.',
            '<strong>Preço oscila, e isso mexe no yield.</strong> Um DY que sobe porque o preço despencou não é boa notícia. Olhe o motivo, não só o número.',
            '<strong>Existe Imposto de Renda no meio do caminho.</strong> Regras de tributação de proventos mudam conforme o tipo de ativo e a legislação vigente. A conta bruta da calculadora não é a renda líquida.',
            '<strong>Concentrar em poucos pagadores é frágil.</strong> Uma renda que depende de dois ou três papéis some junto se um deles cortar dividendo. Diversifique os pagadores.',
          ],
        },
        {
          kind: 'p',
          html: 'Nada disso torna a calculadora inútil, ao contrário. Ela existe para você testar cenários e enxergar o risco antes de aportar, não para prometer um número que o mercado vai cumprir.',
        },
      ],
    },
    {
      id: 'sec-6',
      title: 'Onde encontrar bons pagadores',
      blocks: [
        {
          kind: 'p',
          html: 'A calculadora responde "quanto rende", mas não escolhe o papel por você. Para achar candidatos, use o <a href="/ranking/maiores-dividend-yield">ranking dos maiores dividend yields da B3</a>: ele lista ações e FIIs ordenados por DY, com os indicadores que ajudam a separar um pagador consistente de uma armadilha de yield.',
        },
        {
          kind: 'p',
          html: 'O fluxo saudável é este: filtre candidatos no ranking, abra a página de cada ativo para entender o negócio e o histórico de proventos, e só então leve o papel para a <a href="/calculadora/dividend-yield">calculadora</a> e simule sua renda. Ranking sem análise vira caça ao maior número; calculadora sem escolha vira conta no vazio. Os dois juntos viram plano.',
        },
        {
          kind: 'p',
          html: 'Quem quer proventos caindo o ano inteiro monta o que se chama de escada de dividendos, distribuindo pagadores por diferentes meses. O guia de <a href="/guias/acoes-fiis-dividendos-todo-mes">dividendos todo mês</a> mostra como organizar isso, e a calculadora dimensiona quanto cada degrau precisa.',
        },
      ],
    },
  ],
  cta: {
    title: 'Simule sua renda de dividendos',
    subtitle: 'Calcule o DY real de qualquer ação ou FII e quanto investir para sua meta · grátis',
    to: '/calculadora/dividend-yield',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'Como calcular o dividend yield de uma ação?',
      a: 'Divida os proventos pagos por cota no ano pelo preço atual da cota e multiplique por 100. Por exemplo, R$ 6 de proventos sobre um preço de R$ 100 dá um DY de 6% (valores ilustrativos). O modo simples da calculadora de dividendos da Redentia faz essa conta para você a partir do preço e dos proventos.',
    },
    {
      q: 'Quanto preciso investir para viver de dividendos?',
      a: 'Divida a renda anual que você quer pelo dividend yield esperado da carteira. Para uma renda mensal, multiplique por doze antes de dividir. Como o DY varia e não é garantido, trate o resultado como estimativa, não como meta certa. A calculadora ajuda a testar diferentes cenários de aporte e yield.',
    },
    {
      q: 'Qual a diferença entre dividend yield e yield on cost?',
      a: 'O dividend yield usa o preço atual da cota; o yield on cost usa o preço que você pagou quando comprou. Quem comprou barato e viu os proventos crescerem costuma ter um yield on cost maior que o DY exibido hoje. A calculadora da Redentia tem um modo específico para essa conta.',
    },
    {
      q: 'Um dividend yield alto é sempre bom?',
      a: 'Nem sempre. Um DY muito alto pode vir de uma queda forte no preço da ação por causa de um problema real, e não de uma distribuição generosa e sustentável. Antes de decidir, olhe o histórico de proventos, o lucro da empresa e o motivo do yield estar alto, não só o número.',
    },
    {
      q: 'A calculadora garante o rendimento que ela mostra?',
      a: 'Não. A calculadora é aritmética sobre as premissas que você informa: ela mostra quanto renderia se o dividend yield se mantivesse. Dividendos dependem do lucro futuro da empresa, que pode cair, e não há garantia. Use a ferramenta para simular cenários e enxergar risco, não como promessa de renda.',
    },
  ],
  related: ['Dividendos todo mês', 'Melhores FIIs 2026', 'Como investir em ações'],
}
