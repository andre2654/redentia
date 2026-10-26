/**
 * Guia: Como calcular preço teto.
 *
 * Consultas informacionais ("como calcular preço teto", "preço teto fórmula",
 * "preço teto bazin como calcular") chegam na calculadora em posição ~2–3 com
 * CTR baixo. Esta página é o destino da intenção de instrução. A calculadora
 * continua dona da intenção de ferramenta.
 *
 * Números do exemplo fechado são ILUSTRATIVOS e fechados na mão (a conta
 * inteira dá inteiro: Bazin e Graham em R$ 45,00). O bloco preco-teto-vivo
 * repete as mesmas fórmulas com PETR4, no servidor, pela mesma carga das
 * páginas /calculadora/preco-teto/{TICKER}. Se o dado falhar, o bloco some
 * e o exemplo ilustrativo permanece.
 *
 * Linguagem de régua, nunca de ordem. HTML local: só <strong> e <a href>.
 */
import type { GuideDoc } from '~/types/guias'

export const COMO_CALCULAR_PRECO_TETO_GUIDE: GuideDoc = {
  slug: 'como-calcular-preco-teto',
  tag: 'Análise',
  title: 'Como calcular preço teto: fórmulas passo a passo',
  dek: 'O que é preço teto, a fórmula de Bazin, Graham, P/L setorial, valor patrimonial e projetivo, e um exemplo numérico com a conta inteira. Não é recomendação de compra ou venda.',
  description:
    'Como calcular preço teto: fórmulas de Bazin, Graham, P/L setorial, valor patrimonial e projetivo, com exemplo numérico passo a passo. Não é recomendação.',
  summary:
    'Cinco fórmulas de preço teto, o que cada uma pede de insumo, um exemplo em que a conta fecha, e onde o número deixa de dizer qualquer coisa.',
  minutes: 13,
  author: 'Equipe Redentia',
  datePublished: '2026-10-26',
  dateModified: '2026-10-26',
  updatedLine: 'Atualizado em 26 out 2026 · 13 min de leitura',
  updatedShort: 'atualizado em out 2026',
  howTo: {
    name: 'Como calcular o preço teto de uma ação',
    description:
      'Passo a passo para calcular o preço teto por Bazin, Graham, P/L setorial, valor patrimonial e projetivo, com um exemplo numérico ilustrativo. Não é recomendação de compra ou venda.',
    steps: [
      {
        name: 'Reúna os insumos dos últimos 12 meses',
        text: 'Separe o dividendo por ação, o LPA, o VPA e, para o P/L setorial, o P/L médio do setor. Sem o insumo, aquele método não produz número.',
      },
      {
        name: 'Calcule o preço teto de Bazin',
        text: 'Divida o dividendo por ação dos últimos 12 meses por 0,06. No exemplo ilustrativo, R$ 2,70 dividido por 0,06 dá R$ 45,00.',
      },
      {
        name: 'Calcule a fórmula de Graham',
        text: 'Tire a raiz quadrada de 22,5 vezes o LPA vezes o VPA. No exemplo, 22,5 vezes 6 vezes 15 é 2.025, e a raiz é R$ 45,00. Com LPA ou VPA que não seja positivo, a fórmula não se aplica.',
      },
      {
        name: 'Calcule o preço teto por P/L setorial',
        text: 'Multiplique o LPA pelo P/L médio do setor, não pelo P/L do próprio papel. No exemplo, 6 vezes 8 dá R$ 48,00. Sem média publicada para o setor, o método fica indisponível.',
      },
      {
        name: 'Calcule o preço teto pelo valor patrimonial',
        text: 'Multiplique o VPA por 1,5. No exemplo, 15 vezes 1,5 dá R$ 22,50.',
      },
      {
        name: 'Calcule o projetivo só com uma premissa explícita',
        text: 'A fórmula é dividendo vezes (1 mais o crescimento), dividido por 0,06. Crescimento zero devolve o número de Bazin. No exemplo, uma premissa ilustrativa de 10% leva o teto a R$ 49,50. O crescimento não é um dado publicado.',
      },
      {
        name: 'Compare cada teto com a cotação',
        text: 'Cotação abaixo do teto é distância em relação àquela régua. Cotação acima significa que o preço passou da régua. A distância descreve a conta. Não é ordem de compra ou venda.',
      },
    ],
  },
  sections: [
    {
      id: 'sec-o-que-e',
      title: 'O que é preço teto',
      blocks: [
        {
          kind: 'p',
          html: 'Preço teto é o valor máximo que a régua de um método aceita para uma ação ou para uma cota, a partir de números publicados. A conta mais usada no Brasil é a de Décio Bazin: <strong>dividendo por ação dos últimos 12 meses dividido por 0,06</strong>. As outras quatro réguas da <a href="/calculadora/preco-teto">calculadora de preço teto</a> são a fórmula de Graham, o P/L setorial, o valor patrimonial e o projetivo. <strong>Nada nesta página é recomendação de compra ou venda.</strong>',
        },
        {
          kind: 'p',
          html: 'O número responde a uma pergunta estreita: dado este critério, até onde a cotação pode ir antes de passar da régua. Não responde se a empresa é boa, se o dividendo se repete, nem para onde o preço vai. Preço-alvo é outra coisa: é uma estimativa de cotação futura. Preço teto é um filtro de preço de hoje.',
        },
        {
          kind: 'stats',
          items: [
            { value: '5', label: 'réguas: Bazin, Graham, P/L, VPA e projetivo' },
            { value: '6%', label: 'o yield da conta clássica de Bazin' },
            { value: '22,5', label: 'a constante da fórmula de Graham' },
          ],
        },
      ],
    },
    {
      id: 'sec-passo-a-passo',
      title: 'Como calcular, em sete passos',
      blocks: [
        {
          kind: 'p',
          html: 'O exemplo que atravessa os passos usa números redondos, escolhidos para a conta fechar. Está marcado como ilustrativo em cada fórmula. Não é cotação, lucro nem dividendo de nenhum papel.',
        },
        {
          kind: 'steps',
          items: [
            '<strong>Reúna os insumos dos últimos 12 meses.</strong> Dividendo por ação, <a href="/glossario/lpa">LPA</a>, <a href="/glossario/vpa">VPA</a> e, para o P/L setorial, o P/L médio do setor. Sem o insumo, aquele método não produz número.',
            '<strong>Bazin.</strong> Divida o dividendo por 0,06. No exemplo ilustrativo, R$ 2,70 ÷ 0,06 = R$ 45,00.',
            '<strong>Graham.</strong> Raiz de 22,5 × LPA × VPA. No exemplo, 22,5 × 6 × 15 = 2.025, e a raiz é R$ 45,00. LPA ou VPA que não seja positivo: a fórmula não se aplica.',
            '<strong>P/L setorial.</strong> LPA vezes o P/L médio do setor, não o P/L do próprio papel. No exemplo, 6 × 8 = R$ 48,00. Sem média publicada, o método fica indisponível.',
            '<strong>Valor patrimonial.</strong> VPA × 1,5. No exemplo, 15 × 1,5 = R$ 22,50.',
            '<strong>Projetivo, só com premissa escrita.</strong> (dividendo × (1 + crescimento)) ÷ 0,06. Crescimento zero devolve o Bazin. Premissa ilustrativa de 10% leva o exemplo a R$ 49,50. O crescimento não é dado publicado.',
            '<strong>Compare cada teto com a cotação.</strong> Abaixo do teto há distância em relação àquela régua. Acima, a cotação passou da régua. A distância descreve a conta. Não é ordem de compra ou venda.',
          ],
        },
      ],
    },
    {
      id: 'sec-bazin',
      title: 'Fórmula de Bazin: dividendo dividido por 6%',
      blocks: [
        {
          kind: 'p',
          html: '<strong>Preço teto de Bazin = dividendo por ação dos últimos 12 meses ÷ 0,06.</strong> O 0,06 é o dividend yield mínimo de 6% ao ano que Décio Bazin descreveu em "Faça Fortuna com Ações" (1991). Não é uma constante de mercado. É o piso de rendimento que ele usava, naquele contexto de juros, para filtrar renda variável.',
        },
        {
          kind: 'p',
          html: 'A conta é o <a href="/glossario/dividend-yield">dividend yield</a> invertido. DY = dividendo ÷ preço. Isolando o preço e fixando o DY em 6%, sobra preço = dividendo ÷ 0,06. Uma ação ilustrativa que pagou R$ 2,70 por ação tem teto de R$ 45,00. Na cotação de R$ 45,00, o DY do exemplo é exatamente 6%. Abaixo de R$ 45,00, o DY do mesmo dividendo fica acima de 6%. Acima, fica abaixo.',
        },
        {
          kind: 'p',
          html: 'Luiz Barsi trabalha com a mesma divisão. Não há uma segunda equação. O que muda, nos dois autores, é o filtro anterior à conta: anos seguidos de pagamento, dívida sob controle e um negócio cujo dividendo não depende de um evento único. A fórmula sem esse filtro só mede o último ano.',
        },
        {
          kind: 'p',
          html: 'Dois ajustes mudam o número e precisam ser ditos. Dividendo extraordinário, típico de venda de ativo, infla os 12 meses e projeta um teto que o ciclo seguinte não sustenta. JCP (juros sobre capital próprio) tem retenção de 15% na fonte: dividendo de ação é isento para a pessoa física, JCP não. Usar o JCP bruto superestima o teto. O passo a passo do método, com o que a constante aguenta e onde ela falha, está na <a href="/calculadora/preco-teto/bazin">página do preço teto de Bazin</a>.',
        },
      ],
    },
    {
      id: 'sec-graham',
      title: 'Fórmula de Graham: raiz de 22,5 × LPA × VPA',
      blocks: [
        {
          kind: 'p',
          html: '<strong>Valor pela fórmula de Graham = √(22,5 × LPA × VPA).</strong> O 22,5 é 15 × 1,5. Benjamin Graham, em "O Investidor Inteligente", usava P/L máximo de 15 e P/VP máximo de 1,5 como filtro do investidor defensivo. A raiz do produto é uma forma compacta de escrever o preço em que P/L × P/VP chega a 22,5. Um múltiplo pode passar do limite se o outro compensar.',
        },
        {
          kind: 'p',
          html: 'No exemplo ilustrativo, LPA de R$ 6,00 e VPA de R$ 15,00: 22,5 × 6 × 15 = 2.025, e √2.025 = <strong>R$ 45,00</strong>. A conta pede os dois insumos positivos. Prejuízo zera a fórmula, e isso é o método se recusando a avaliar empresa sem lucro. VPA ausente ou negativo faz o mesmo.',
        },
        {
          kind: 'p',
          html: 'Graham não usava essa conta sozinha. No mesmo livro, o filtro defensivo inclui tamanho, solidez financeira, lucro estável, histórico longo de dividendos e algum crescimento de lucro por ação. A fórmula que circula isolada é a parte fácil de calcular. A página da <a href="/calculadora/preco-teto/graham">fórmula de Graham</a> detalha de onde vem o 22,5 e onde a conta quebra em empresa de intangível ou muito endividada. A fórmula ignora dívida: duas empresas com o mesmo LPA e o mesmo VPA recebem o mesmo número.',
        },
      ],
    },
    {
      id: 'sec-pl',
      title: 'P/L setorial: LPA vezes o múltiplo dos pares',
      blocks: [
        {
          kind: 'p',
          html: '<strong>Preço teto por P/L setorial = LPA × P/L médio do setor.</strong> Graham compara com um P/L fixo de 15. Bazin compara com um yield fixo de 6%. Nenhum dos dois sabe que banco, transmissora e varejo convivem com faixas de múltiplo diferentes. O P/L setorial troca a constante por um comparável. A pergunta deixa de ser "caro em absoluto" e passa a ser "caro em relação aos pares".',
        },
        {
          kind: 'p',
          html: 'No exemplo ilustrativo, LPA de R$ 6,00 e P/L médio de setor igual a 8: 6 × 8 = <strong>R$ 48,00</strong>. O P/L do próprio papel não serve de insumo. Preço ÷ LPA, multiplicado de novo pelo LPA, devolve a cotação. A conta fecha e não informa nada. Por isso, sem P/L médio publicado para o setor, o método fica indisponível e sai da média.',
        },
        {
          kind: 'p',
          html: 'O método herda o erro da referência. Se o setor inteiro está num múltiplo alto, o teto sai alto junto. Um grupo pequeno de pares diretos, com o mesmo modelo de receita, costuma informar mais do que a média de um setor amplo. A <a href="/calculadora/preco-teto/pl-setorial">página do P/L setorial</a> trata da escolha do múltiplo. O <a href="/glossario/p-l">verbete de P/L</a> explica o múltiplo em si.',
        },
      ],
    },
    {
      id: 'sec-vpa',
      title: 'Valor patrimonial: VPA vezes 1,5',
      blocks: [
        {
          kind: 'p',
          html: '<strong>Preço teto pelo valor patrimonial = VPA × 1,5.</strong> O 1,5 é o mesmo P/VP máximo do filtro de Graham, agora sozinho, sem o LPA. VPA é o patrimônio líquido dividido pelo número de ações: o que está nos livros, não o que a empresa geraria de caixa nem o que valeria numa venda.',
        },
        {
          kind: 'p',
          html: 'No exemplo ilustrativo, VPA de R$ 15,00: 15 × 1,5 = <strong>R$ 22,50</strong>. É de propósito o número mais baixo das cinco contas. Uma cotação de R$ 36,00 fica acima dessa régua e, ao mesmo tempo, abaixo de Bazin e de Graham. A divergência não é erro de aritmética. É cada método olhando um pedaço diferente do balanço.',
        },
        {
          kind: 'p',
          html: 'O VPA guarda relação mais razoável com o negócio em banco, seguradora, holding e empresa de ativo tangível. Em software, marca ou serviço, o ativo principal muitas vezes não está no balanço, e a régua declara o papel permanentemente acima do teto. P/VP abaixo de 1 também não é, por si, um desconto: pode ser estoque velho, recebível ruim ou empresa que reduz o próprio patrimônio ano após ano. Cruze com o <a href="/glossario/p-vp">P/VP</a>. A <a href="/calculadora/preco-teto/valor-patrimonial">página do valor patrimonial</a> desenvolve esses limites.',
        },
      ],
    },
    {
      id: 'sec-projetivo',
      title: 'Preço teto projetivo: Bazin sobre o dividendo que ainda não veio',
      blocks: [
        {
          kind: 'p',
          html: '<strong>Preço teto projetivo = (dividendo dos últimos 12 meses × (1 + crescimento)) ÷ 0,06.</strong> É a régua de Bazin aplicada a um dividendo estimado, em vez do dividendo já pago. Com crescimento zero, o resultado é idêntico ao Bazin. Sem estimativa, não há projeção.',
        },
        {
          kind: 'p',
          html: 'No exemplo ilustrativo, o dividendo é R$ 2,70 e a premissa de crescimento é 10% ao ano, marcada como premissa e não como dado. Dividendo projetado = 2,70 × 1,10 = R$ 2,97. Preço teto = 2,97 ÷ 0,06 = <strong>R$ 49,50</strong>. A premissa moveu R$ 4,50 em relação ao Bazin de R$ 45,00. Com yield de 6%, cada real a mais de dividendo vira cerca de R$ 16,67 de teto. Erro na premissa entra amplificado.',
        },
        {
          kind: 'p',
          html: 'O crescimento defensável vem de contrato ou de histórico, não de vontade. Reajuste indexado com data conhecida, payout mínimo escrito em estatuto, mediana de vários anos. A média é dominada por um ano excepcional. Se não houver uma frase que justifique o percentual, a conta honesta é crescimento zero, que é Bazin puro. A <a href="/calculadora/preco-teto/projetivo">página do preço teto projetivo</a> separa a premissa do dado.',
        },
      ],
    },
    {
      id: 'sec-exemplo',
      title: 'Exemplo numérico fechado',
      blocks: [
        {
          kind: 'p',
          html: '<strong>Exemplo ilustrativo, do começo ao fim.</strong> Números redondos, não são de nenhuma empresa. Cotação R$ 36,00. Dividendo em 12 meses R$ 2,70. LPA R$ 6,00. VPA R$ 15,00. P/L médio do setor, como premissa do exemplo, igual a 8. Crescimento do dividendo, também premissa, 10%.',
        },
        {
          kind: 'p',
          html: 'Bazin: 2,70 ÷ 0,06 = <strong>R$ 45,00</strong>. Graham: 22,5 × 6 × 15 = 2.025, e √2.025 = <strong>R$ 45,00</strong>. P/L setorial: 6 × 8 = <strong>R$ 48,00</strong>. Valor patrimonial: 15 × 1,5 = <strong>R$ 22,50</strong>. Projetivo: 2,70 × 1,10 = 2,97, e 2,97 ÷ 0,06 = <strong>R$ 49,50</strong>.',
        },
        {
          kind: 'p',
          html: 'A cotação ilustrativa de R$ 36,00 está 25% abaixo da régua de Bazin e de Graham ((45 − 36) ÷ 36). Está abaixo também do P/L setorial. Está acima do teto pelo valor patrimonial. O dividend yield do exemplo, na cotação de R$ 36,00, é 7,5% (2,70 ÷ 36). O P/L do próprio papel é 6 (36 ÷ 6), contra 8 do setor inventado. O P/VP é 2,4 (36 ÷ 15), acima do 1,5 da régua patrimonial.',
        },
        {
          kind: 'p',
          html: 'Ler só o método que fica abaixo da cotação, ou só o que fica acima, muda a frase e não muda o balanço. As cinco contas cabem na mesma página justamente para a divergência aparecer. <strong>Não é recomendação.</strong> O exemplo mostra a mecânica. Não diz o que fazer com papel nenhum.',
        },
      ],
    },
    {
      id: 'sec-papel-real',
      title: 'A mesma conta com os números de um papel',
      blocks: [
        {
          kind: 'p',
          html: 'O exemplo acima existe para a aritmética fechar no papel. As páginas por ticker repetem Bazin, Graham, P/L setorial e valor patrimonial com a cotação, o LPA, o VPA e o dividendo daquele papel. Quando o servidor tem o dado, o bloco abaixo faz a conta de <a href="/calculadora/preco-teto/PETR4">PETR4</a> com esses números. O projetivo continua de fora: crescimento não é dado publicado.',
        },
        { kind: 'preco-teto-vivo', ticker: 'PETR4' },
        {
          kind: 'p',
          html: 'A mesma página existe para <a href="/calculadora/preco-teto/VALE3">VALE3</a>, <a href="/calculadora/preco-teto/ITUB4">ITUB4</a>, <a href="/calculadora/preco-teto/BBAS3">BBAS3</a>, <a href="/calculadora/preco-teto/TAEE11">TAEE11</a> e <a href="/calculadora/preco-teto/HGLG11">HGLG11</a>. Cada uma mostra a conta daquele ticker. HGLG11 é fundo imobiliário: a régua que costuma ter número é a do rendimento, no formato de Bazin. Graham pede LPA e VPA de empresa, e fundo sem lucro fica de fora dessa fórmula. Nenhuma dessas páginas é recomendação de compra ou venda.',
        },
      ],
    },
    {
      id: 'sec-justo',
      title: 'Preço teto, preço justo e preço-alvo',
      blocks: [
        {
          kind: 'p',
          html: 'No uso brasileiro, preço teto e preço justo quase sempre nomeiam o mesmo número: o resultado da fórmula. A diferença, quando alguém a mantém, é de papel. <strong>Preço justo</strong>, ou valor intrínseco, é a estimativa do que a régua atribui ao papel. <strong>Preço teto</strong> é o máximo que essa régua aceita. Quem ainda desconta uma margem por cima do valor intrínseco está usando um teto menor que o justo. Nesta página e na calculadora, o número da fórmula já é o teto daquela régua.',
        },
        {
          kind: 'p',
          html: '<strong>Preço-alvo é outra conta.</strong> Alvo olha para frente: uma estimativa de onde a cotação pode estar. Teto olha para o que já foi publicado e para um critério de preço máximo. Comparar os dois como se fossem a mesma série mistura um filtro com uma previsão. Margem de segurança, no sentido de Graham, é a distância entre a cotação e a régua. Distância não é instrução.',
        },
        {
          kind: 'p',
          html: 'A <a href="/glossario/analise-fundamentalista">análise fundamentalista</a> é o quadro maior: qualidade do negócio de um lado, preço do outro. Preço teto só ocupa o segundo lado, e só com as cinco réguas daqui. O guia de <a href="/guias/como-analisar-uma-acao">como analisar uma ação</a> percorre os indicadores que a fórmula não substitui.',
        },
      ],
    },
    {
      id: 'sec-erros',
      title: 'Erros comuns na conta',
      blocks: [
        {
          kind: 'p',
          html: 'A aritmética é curta. O erro mora no insumo e na leitura. Estes são os que mais trocam o número ou o sentido dele:',
        },
        {
          kind: 'checks',
          items: [
            '<strong>Tratar o teto como previsão.</strong> O número não diz para onde a cotação vai. Diz até onde a régua chega com os dados de hoje.',
            '<strong>Colocar dividendo extraordinário no Bazin.</strong> Um pagamento que não se repete infla o teto exatamente no ano em que o evento já aconteceu.',
            '<strong>Usar JCP bruto.</strong> A retenção de 15% na fonte não existe no dividendo isento. No JCP, bruto e líquido são valores diferentes.',
            '<strong>Aplicar Graham sem lucro.</strong> LPA que não é positivo zera a fórmula. Forçar a conta com prejuízo, ou com um lucro de um trimestre atípico, fabrica um número que o método recusou.',
            '<strong>Trocar o P/L do setor pelo P/L do papel.</strong> LPA vezes o próprio P/L devolve a cotação. A conta parece certa e não compara o papel com ninguém.',
            '<strong>Mudar o 6% e continuar chamando de Bazin.</strong> Outro yield é outra régua, muitas vezes mais honesta com o juro do momento. O nome do método, porém, deixa de valer. Escreva qual yield entrou na divisão.',
            '<strong>Subir o crescimento até a conta caber.</strong> No projetivo, a premissa está no numerador de uma divisão por 0,06. Dá para justificar quase qualquer cotação. Se o papel só passa com premissa agressiva, o resultado é a premissa.',
            '<strong>Ler um método e ignorar os outros quatro.</strong> O exemplo ilustrativo fica abaixo de três réguas e acima de uma. Escolher a frase confortável não é calcular.',
          ],
        },
      ],
    },
    {
      id: 'sec-limites',
      title: 'Onde a conta não alcança',
      blocks: [
        {
          kind: 'p',
          html: 'Bazin é cego para empresa que reinveste o lucro e distribui pouco. O teto sai baixo, ou zero, e isso não descreve o negócio. Graham e valor patrimonial são cegos para intangível e para dívida. P/L setorial acompanha o setor: setor caro produz teto caro. Projetivo amplifica a premissa. Nenhum dos cinco olha governança, concessão que vence, ou um lucro que depende de um preço de commodity no pico.',
        },
        {
          kind: 'p',
          html: 'Fundo imobiliário entra melhor em Bazin do que em Graham. O rendimento é recorrente por regra de distribuição, e não existe LPA de empresa. A página de <a href="/calculadora/preco-teto/HGLG11">HGLG11</a> mostra o que a régua produz para uma cota. O guia de <a href="/guias/data-com-e-data-ex">data com e data ex</a> explica qual provento entra nos 12 meses: o que conta para o dividendo é a data-com, não o dia em que o dinheiro cai na conta.',
        },
        {
          kind: 'p',
          html: 'Juro alto muda o significado do 6% sem mudar a fórmula. A constante foi escolhida num Brasil diferente do de hoje. Quem compara o yield da ação com o da renda fixa está fazendo outra pergunta, e a fórmula de Bazin não responde essa pergunta sozinha. O teto também envelhece: saiu balanço novo, o LPA mudou, o dividendo mudou, a conta de ontem não é a de hoje.',
        },
      ],
    },
    {
      id: 'sec-calculadora',
      title: 'Como usar a calculadora',
      blocks: [
        {
          kind: 'p',
          html: 'A <a href="/calculadora/preco-teto">calculadora de preço teto</a> roda Bazin, Graham, P/L setorial e valor patrimonial com os mesmos insumos, e mostra a média dos métodos que têm número. O projetivo fica de fora dessa média de propósito: ele repete o Bazin sobre o mesmo dividendo e puxaria o consenso.',
        },
        {
          kind: 'steps',
          items: [
            '<strong>Informe o ticker</strong> ou preencha preço, dividendo, LPA, VPA e P/L do setor à mão. Com o ticker, a calculadora busca os números publicados.',
            '<strong>Leia método por método,</strong> não só a média. Média de réguas que discordam esconde a discordância, que é a parte útil.',
            '<strong>Se o P/L setorial aparecer indisponível,</strong> não há média publicada para o setor. O campo aceita um múltiplo informado por quem calcula. Sem isso, o método fica fora do consenso.',
            '<strong>Abra a página do papel</strong> quando quiser a conta já feita, com a data do pregão. Os atalhos estão na seção anterior.',
            '<strong>Pare na régua.</strong> O resultado é distância até o teto de cada método. Não diz se a pessoa deve comprar, vender ou manter o papel.',
          ],
        },
        {
          kind: 'p',
          html: 'Cada método também tem página própria, com a origem da constante e um exemplo fechado: <a href="/calculadora/preco-teto/bazin">Bazin</a>, <a href="/calculadora/preco-teto/graham">Graham</a>, <a href="/calculadora/preco-teto/pl-setorial">P/L setorial</a>, <a href="/calculadora/preco-teto/valor-patrimonial">valor patrimonial</a> e <a href="/calculadora/preco-teto/projetivo">projetivo</a>. Para o rendimento em si, separado do teto, a <a href="/calculadora/dividend-yield">calculadora de dividend yield</a> e o guia de <a href="/guias/calculadora-de-dividendos">como calcular dividendos</a> seguem outra conta.',
        },
      ],
    },
  ],
  cta: {
    title: 'Calcule o preço teto de um papel',
    subtitle: 'Bazin, Graham, P/L setorial e valor patrimonial com os números do ticker. Não é recomendação.',
    to: '/calculadora/preco-teto',
  },
  faqTitle: 'Perguntas frequentes',
  faq: [
    {
      q: 'Como calcular o preço teto de uma ação?',
      a: 'Escolha a régua e use o insumo dela. Bazin: dividendo por ação dos últimos 12 meses dividido por 0,06. Graham: raiz de 22,5 × LPA × VPA. P/L setorial: LPA vezes o P/L médio do setor. Valor patrimonial: VPA × 1,5. Projetivo: (dividendo × (1 + crescimento)) ÷ 0,06, e o crescimento é premissa. Compare cada resultado com a cotação. A distância não é recomendação de compra ou venda.',
    },
    {
      q: 'Qual é a fórmula do preço teto?',
      a: 'Não existe uma fórmula única. A mais citada no Brasil é a de Bazin, dividendo ÷ 0,06. Graham usa √(22,5 × LPA × VPA). O P/L setorial usa LPA × P/L médio do setor. O valor patrimonial usa VPA × 1,5. O projetivo repete Bazin sobre um dividendo estimado. Cada uma pede um insumo diferente e pode discordar das outras no mesmo papel.',
    },
    {
      q: 'Como calcular o preço teto pelo método de Bazin?',
      a: 'Divida o dividendo por ação dos últimos 12 meses por 0,06. Um dividendo ilustrativo de R$ 2,70 dá preço teto de R$ 45,00. O 0,06 é o yield de 6% da régua clássica. Trocar o percentual produz outra régua, que não se chama Bazin. Exclua dividendo extraordinário e, no JCP, use o valor líquido. Não é recomendação.',
    },
    {
      q: 'Qual a diferença entre preço teto e preço justo?',
      a: 'Na prática, os dois nomes recaem sobre o resultado da fórmula. Preço justo é a estimativa que a régua atribui ao papel. Preço teto é o máximo que a régua aceita. Quem desconta uma margem adicional usa um teto menor que o justo. Preço-alvo é diferente dos dois: é uma estimativa de cotação futura, não um filtro sobre o que já foi publicado.',
    },
    {
      q: 'O preço teto é recomendação de compra ou de venda?',
      a: 'Não. O preço teto diz até onde cada método chega com os números dos últimos 12 meses. Não diz se a pessoa deve comprar, vender ou manter o papel, e não prevê a cotação. Empresa, dívida, governança e a chance de o dividendo se repetir ficam fora da fórmula.',
    },
    {
      q: 'Dá para calcular preço teto de FII?',
      a: 'Pela régua de Bazin, sim: rendimento por cota dos últimos 12 meses dividido pelo yield escolhido. Fundo imobiliário distribui resultado por regra, e o formato da conta é o mesmo da ação pagadora. Graham pede LPA e VPA de empresa. Sem lucro, essa fórmula não se aplica. A página de cada FII com dado, como HGLG11, mostra o que a régua produz.',
    },
    {
      q: 'Por que os métodos dão preços teto diferentes?',
      a: 'Porque medem coisas diferentes. Bazin olha o dividendo passado. Graham combina lucro e patrimônio. O P/L setorial compara com os pares. O valor patrimonial olha só o livro. O projetivo depende de uma premissa de crescimento. No exemplo ilustrativo desta página, Bazin e Graham dão R$ 45,00, o P/L setorial dá R$ 48,00, o valor patrimonial dá R$ 22,50 e o projetivo com 10% de premissa dá R$ 49,50. A divergência é o resultado, não um defeito da conta.',
    },
  ],
  related: [
    'Como analisar uma ação: os indicadores que importam',
    'Como calcular dividendos',
    'Dividendos todo mês',
  ],
}
