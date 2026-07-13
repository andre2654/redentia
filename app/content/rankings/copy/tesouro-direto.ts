/**
 * Ranking NOVO (derivado de GET /tesouro), sem página equivalente na
 * Redentia antiga. Copy ORIGINAL escrita na voz Redentia: curta, honesta,
 * sem números inventados. Taxas, preços e vencimentos vêm da tabela viva.
 */
import type { RankingCopy } from '~/types/rankings'

const copy: RankingCopy = {
  answerFirst:
    'Este ranking ordena os títulos públicos à venda no Tesouro Direto pela taxa de compra do dia. A taxa é o rendimento que você contrata no momento da compra: no Tesouro Prefixado ela é o retorno total ao ano, no Tesouro IPCA+ é o ganho real acima da inflação, e no Tesouro Selic é um pequeno adicional sobre a taxa básica de juros. Os dados são do Tesouro Direto, atualizados diariamente.',
  educationalSections: [
    {
      h2: 'Como funciona a taxa do Tesouro Direto',
      paragraphs: [
        'A taxa exibida na tabela é a taxa de compra: o rendimento anual que você trava ao comprar o título hoje. Se você carregar o título até o vencimento, recebe exatamente esse rendimento, não importa o que aconteça com os juros no caminho. É por isso que a taxa de compra é o número mais importante na hora de comparar títulos, mais do que o preço unitário.',
        'Taxa maior nem sempre significa melhor negócio. Títulos mais longos costumam pagar taxas mais altas justamente porque embutem mais incerteza e oscilam mais de preço antes do vencimento. O jeito honesto de usar este ranking é comparar títulos do mesmo tipo e de prazos parecidos, e escolher o vencimento que combina com o seu objetivo, não apenas o número mais alto da lista.',
      ],
    },
    {
      h2: 'IPCA+, Selic ou Prefixado: qual a diferença',
      paragraphs: [
        'O Tesouro IPCA+ paga a inflação medida pelo IPCA mais uma taxa fixa. Isso garante ganho real: seja qual for a inflação até o vencimento, seu dinheiro termina valendo mais do que começou. É o título clássico para objetivos longos, como aposentadoria ou a faculdade dos filhos.',
        'O Tesouro Prefixado paga uma taxa fixa conhecida na compra. Você sabe no dia da compra exatamente quanto vai resgatar no vencimento, mas se a inflação subir muito nesse período o ganho real encolhe. Ele tende a fazer sentido quando você acredita que os juros vão cair dali em diante.',
        'O Tesouro Selic acompanha a taxa básica de juros dia a dia. É o título que menos oscila de preço, e por isso é o mais usado como reserva de emergência: você pode vender a qualquer momento sem grandes surpresas no valor.',
      ],
    },
    {
      h2: 'Marcação a mercado: por que o preço oscila antes do vencimento',
      paragraphs: [
        'Todos os títulos do Tesouro Direto são reprecificados diariamente, o que o mercado chama de marcação a mercado. Quando os juros futuros sobem, o preço dos títulos prefixados e IPCA+ cai; quando os juros caem, o preço sobe. Quanto mais longe o vencimento, maior essa oscilação.',
        'Isso só afeta quem vende antes do vencimento. Levando o título até o fim, você recebe exatamente a taxa contratada na compra, com garantia do Tesouro Nacional. A exceção prática é o Tesouro Selic: como ele acompanha a taxa básica, o preço oscila muito pouco mesmo em prazos longos.',
      ],
    },
  ],
  crossLinks: [
    {
      title: 'Calculadora de Juros Compostos',
      desc: 'Simule quanto seu dinheiro rende ao longo do tempo com aportes mensais.',
      href: '/calculadora/juros-compostos',
    },
    {
      title: 'Calculadora de Aposentadoria',
      desc: 'Descubra quanto investir por mês para viver de renda no futuro.',
      href: '/calculadora/aposentadoria',
    },
    {
      title: 'Outros rankings',
      desc: 'Veja todos os rankings disponíveis na Redentia.',
      href: '/rankings',
    },
  ],
  faqItems: [
    {
      q: 'Qual título do Tesouro Direto rende mais?',
      a: 'Depende do cenário e do prazo, e a taxa mais alta do ranking não é automaticamente a melhor escolha. O Tesouro Prefixado tende a ganhar quando os juros caem depois da compra, o Tesouro IPCA+ protege quando a inflação sobe, e o Tesouro Selic acompanha a taxa básica com pouquíssima oscilação. O rendimento contratado só é garantido para quem carrega o título até o vencimento.',
    },
    {
      q: 'Posso perder dinheiro no Tesouro Direto?',
      a: 'Levando o título até o vencimento, não: você recebe a taxa contratada na compra, com garantia do Tesouro Nacional. O risco aparece na venda antecipada. Pela marcação a mercado, títulos prefixados e IPCA+ podem valer menos do que você pagou se os juros subirem depois da compra, principalmente nos vencimentos longos. O Tesouro Selic é o que menos sofre esse efeito.',
    },
    {
      q: 'Qual a diferença entre taxa de compra e taxa de venda?',
      a: 'A taxa de compra é o rendimento que você contrata ao comprar o título hoje, e é ela que este ranking usa para ordenar a tabela. A taxa de venda é usada para calcular quanto o Tesouro paga se você vender o título antes do vencimento. As duas mudam ao longo do dia conforme o mercado de juros se movimenta.',
    },
    {
      q: 'Como funciona o imposto de renda no Tesouro Direto?',
      a: 'O rendimento segue a tabela regressiva de renda fixa: 22,5% para aplicações de até 180 dias, 20% de 181 a 360 dias, 17,5% de 361 a 720 dias e 15% acima de 720 dias. O imposto é retido na fonte no resgate, na venda ou no pagamento de juros semestrais. Resgates em menos de 30 dias também pagam IOF sobre o rendimento.',
    },
  ],
}

export default copy
