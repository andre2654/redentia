import type { GlossaryTerm } from '~/types/glossario'

/**
 * Grupo 1 do glossário — contém o EXEMPLAR (dividend-yield), a referência de
 * qualidade pros port agents que preenchem os grupos 2-4.
 *
 * Contrato de um GlossaryTerm (leia antes de escrever qualquer termo):
 *  - slug: HERDA o slug do glossário antigo (não invente, não renomeie — é o
 *    equity de SEO que estamos preservando).
 *  - term: nome de exibição bonito ('Dividend Yield', 'P/L', 'ROE').
 *  - letter: 1ª letra MAIÚSCULA sem acento; número/símbolo → '#'. Bate com
 *    glossaryLetter(term) do registry.
 *  - short: UMA frase, definição direta, vira a meta description.
 *  - body: parágrafos. Só <strong> e <a href="/rota-interna"> no HTML. Estrutura
 *    recomendada: (1) o que é, (2) como se lê/usa na prática, (3) exemplo
 *    ILUSTRATIVO marcado, (4) uma ressalva honesta. Cross-linke 1-2 termos e
 *    calculadoras/rankings no meio do texto (internal linking = alma da página).
 *  - related: 3-5 slugs de termos que existem no glossário.
 *  - backlink: UM CTA forte pra rota REAL da plataforma, a mais relevante pro
 *    termo. Nunca linke rota inexistente.
 *  - faq: 2-3 perguntas reais (vira FAQPage). Respostas honestas, sem número
 *    inventado como fato.
 *
 * HONESTIDADE: definição correta e neutra. Nada de "PETR4 paga 8% de DY" como
 * fato — só exemplos marcados "Exemplo ilustrativo:" com números redondos.
 */
export const GRUPO_1: GlossaryTerm[] = [
  {
    slug: 'dividend-yield',
    term: 'Dividend Yield',
    letter: 'D',
    short:
      'Dividend Yield (DY) é o percentual que uma ação ou FII paga em proventos nos últimos 12 meses em relação ao preço da cota, o retorno em dividendos sobre o preço.',
    body: [
      'O <strong>Dividend Yield</strong>, abreviado <strong>DY</strong>, mede quanto um ativo distribuiu em proventos no período em relação ao preço pago por ele. É o indicador central pra quem investe pensando em <a href="/glossario/dividendos">dividendos</a> e renda passiva: ele traduz a distribuição de lucros em um número comparável entre empresas e fundos de tamanhos diferentes.',
      'A conta é direta: <strong>DY = (proventos dos últimos 12 meses ÷ preço atual) × 100</strong>. Como o preço está no denominador, o DY sobe quando a cota cai e cai quando a cota sobe, mesmo sem a empresa mudar o quanto paga. Por isso o número sozinho não diz se um ativo é bom, ele diz a relação entre o que se recebe e o que se paga hoje.',
      'Na prática, o DY serve pra três coisas: comparar pagadoras do mesmo setor, estimar a renda que uma posição tende a gerar e rastrear ativos descontados. Ele costuma ser lido junto de <a href="/glossario/payout">payout</a> (quanto do lucro é distribuído) e do <a href="/glossario/p-l">P/L</a>, pra separar o yield sustentável do yield que existe só porque o preço despencou.',
      '<strong>Exemplo ilustrativo:</strong> uma ação negociada a R$ 40,00 que distribuiu R$ 3,20 em proventos nos últimos 12 meses tem DY de 8% (3,20 ÷ 40). São números redondos escolhidos só pra mostrar a fórmula, não a cotação real de nenhum ativo.',
      'Ressalva honesta: <strong>DY é histórico, olha pra trás</strong>. Um yield muito alto pode ser uma distribuição extraordinária que não se repete, ou o reflexo de uma queda forte de preço por um problema real na empresa. Antes de perseguir o maior número, vale checar a consistência dos pagamentos e a saúde do negócio no <a href="/ranking/maiores-dividend-yield">ranking de maiores dividend yields</a>.',
    ],
    related: ['dividendos', 'payout', 'jscp', 'p-l', 'fii'],
    backlink: {
      label: 'Calcular o dividend yield de qualquer ação ou FII',
      to: '/calculadora/dividend-yield',
    },
    faq: [
      {
        q: 'O que é um bom dividend yield?',
        a: 'Depende da classe de ativo e do momento dos juros. Não existe um número mágico: um DY alto pode ser ótimo ou pode ser só o efeito de uma queda de preço. O caminho honesto é comparar o DY com o histórico do próprio ativo, com os pares do mesmo setor e com o payout, pra saber se a distribuição é sustentável.',
      },
      {
        q: 'Dividend yield alto é sempre bom?',
        a: 'Não. Como o preço está no denominador da conta, uma queda forte da cota infla o DY sem a empresa pagar mais. Um yield muito acima da média do setor merece investigação: pode ser um provento extraordinário que não se repete ou um sinal de problema no negócio.',
      },
      {
        q: 'Qual a diferença entre dividend yield e dividendos?',
        a: 'Dividendos são o valor em dinheiro distribuído por ação. O dividend yield é esse valor expresso como percentual do preço, o que permite comparar ativos de preços diferentes na mesma régua.',
      },
    ],
  },
  {
    slug: 'p-l',
    term: 'P/L',
    letter: 'P',
    short:
      'P/L (Preço sobre Lucro) mostra quantos anos de lucro atual seriam necessários pra recuperar o preço pago pela ação, o múltiplo de valuation mais usado da bolsa.',
    body: [
      'O <strong>P/L</strong>, de Preço sobre Lucro, divide o preço da ação pelo <a href="/glossario/lpa">lucro por ação (LPA)</a> dos últimos 12 meses. Ele responde a uma pergunta simples: mantido o ritmo de lucro de hoje, em quantos anos a empresa devolveria, em lucro, o valor que você pagou pela ação. É o múltiplo de <a href="/glossario/analise-fundamentalista">análise fundamentalista</a> mais popular justamente por resumir preço e resultado em um número só.',
      'A conta é <strong>P/L = preço da ação ÷ LPA</strong>. Quanto menor o P/L, mais barata a ação parece em relação ao lucro que gera. Mas barato e caro aqui são sempre relativos: um P/L baixo pode indicar desconto real ou pode refletir um mercado que espera queda de lucro à frente. Por isso o P/L nunca se lê sozinho, ele se lê contra o histórico da própria empresa e contra os pares do mesmo setor.',
      '<strong>Exemplo ilustrativo:</strong> uma ação a R$ 30,00 cujo LPA foi R$ 3,00 nos últimos 12 meses tem P/L de 10 (30 ÷ 3), ou seja, dez anos de lucro ao ritmo atual. São números redondos só pra mostrar a fórmula, não a cotação real de nenhuma empresa.',
      'Ressalva honesta: <strong>P/L negativo significa prejuízo</strong> (LPA negativo), e aí o múltiplo perde sentido. Setores diferentes convivem com patamares diferentes: bancos costumam negociar a P/L mais baixo que empresas de tecnologia em crescimento, sem que um esteja certo e o outro errado. Combine sempre com <a href="/glossario/p-vp">P/VP</a>, <a href="/glossario/roe">ROE</a> e endividamento antes de concluir que algo está barato.',
    ],
    related: ['lpa', 'p-vp', 'roe', 'ev-ebit', 'dividend-yield'],
    backlink: {
      label: 'Ver o ranking das ações com menor P/L da bolsa',
      to: '/ranking/menores-pl',
    },
    faq: [
      {
        q: 'O que é um P/L bom?',
        a: 'Não existe número universal. Um P/L considerado baixo em um setor pode ser normal em outro. O caminho honesto é comparar o P/L da ação com o próprio histórico dela e com as concorrentes diretas, e entender por que o mercado paga aquele múltiplo antes de chamar de barato.',
      },
      {
        q: 'P/L baixo significa que a ação está barata?',
        a: 'Nem sempre. Um P/L baixo pode ser desconto real ou pode ser o mercado antecipando queda de lucro, mais dívida ou algum risco no negócio. É um ponto de partida pra investigar, não uma conclusão de compra.',
      },
      {
        q: 'Como se calcula o P/L?',
        a: 'Divide-se o preço da ação pelo lucro por ação (LPA) dos últimos 12 meses. Se a ação custa R$ 30 e o LPA é R$ 3, o P/L é 10.',
      },
    ],
  },
  {
    slug: 'roe',
    term: 'ROE',
    letter: 'R',
    short:
      'ROE (Return on Equity) mede quanto de lucro a empresa gera sobre o dinheiro dos acionistas, o principal indicador de qualidade e eficiência de um negócio.',
    body: [
      'O <strong>ROE</strong>, de Return on Equity ou Retorno sobre o Patrimônio Líquido, mostra quanto de lucro a empresa produz pra cada real de capital dos sócios. É um dos indicadores mais poderosos pra separar negócio bom de negócio medíocre: empresas que sustentam ROE alto por muitos anos costumam ter alguma vantagem competitiva difícil de copiar.',
      'A conta é <strong>ROE = (lucro líquido ÷ patrimônio líquido) × 100</strong>. Um ROE de 20% quer dizer que, pra cada R$ 1 de <a href="/glossario/patrimonio-liquido">patrimônio</a>, a empresa gerou R$ 0,20 de <a href="/glossario/lucro-liquido">lucro</a> no período. O que importa não é o número de um ano isolado, e sim a consistência: um ROE alto e estável ao longo de uma década vale muito mais do que um pico pontual.',
      '<strong>Exemplo ilustrativo:</strong> uma empresa com lucro líquido de R$ 100 milhões e patrimônio líquido de R$ 500 milhões tem ROE de 20% (100 ÷ 500). São valores redondos apenas pra demonstrar a fórmula.',
      'Ressalva honesta: <strong>ROE muito alto pode ser efeito de dívida, não de eficiência</strong>. Quando a empresa se financia com bastante capital de terceiros, o patrimônio no denominador encolhe e o ROE infla artificialmente. Por isso vale cruzar o ROE com o <a href="/glossario/roa">ROA</a> e o <a href="/glossario/roic">ROIC</a>, que consideram todo o capital empregado, pra saber se o retorno vem do negócio ou da alavancagem.',
    ],
    related: ['roa', 'roic', 'patrimonio-liquido', 'p-l', 'margem-liquida'],
    backlink: {
      label: 'Ver o ranking das empresas com maior ROE',
      to: '/ranking/maiores-roe',
    },
    faq: [
      {
        q: 'O que é um bom ROE?',
        a: 'Muitos investidores de longo prazo procuram empresas com ROE consistentemente acima de 15%, mas o patamar saudável varia por setor. Mais importante que o número de um ano é a consistência dele ao longo de vários exercícios e a origem: retorno operacional é melhor que retorno inflado por dívida.',
      },
      {
        q: 'Qual a diferença entre ROE e ROA?',
        a: 'O ROE mede o retorno só sobre o capital dos acionistas (patrimônio líquido). O ROA mede o retorno sobre todos os ativos, próprios e financiados. Em empresas muito endividadas o ROE tende a ser bem maior que o ROA.',
      },
      {
        q: 'ROE alto é sempre sinal de empresa boa?',
        a: 'Não necessariamente. Um ROE muito elevado pode refletir alavancagem alta em vez de eficiência real. Compare com ROA e ROIC e verifique o endividamento antes de concluir que a empresa é de qualidade.',
      },
    ],
  },
  {
    slug: 'ev-ebit',
    term: 'EV/EBIT',
    letter: 'E',
    short:
      'EV/EBIT compara o valor total da empresa (Enterprise Value) com o lucro operacional (EBIT), um múltiplo de valuation que enxerga a dívida e ignora a estrutura de capital.',
    body: [
      'O <strong>EV/EBIT</strong> relaciona o <a href="/glossario/enterprise-value">Enterprise Value</a>, o valor total da empresa somando dívida e descontando caixa, com o <a href="/glossario/ebit">EBIT</a>, o lucro operacional antes de juros e impostos. Muitos analistas o consideram mais completo que o <a href="/glossario/p-l">P/L</a>, porque leva a dívida em conta e usa o resultado da operação, que não sofre com a forma como cada empresa se financia.',
      'A conta é <strong>EV/EBIT = Enterprise Value ÷ EBIT</strong> e o resultado se lê como um múltiplo: quantos anos de lucro operacional seriam necessários pra pagar o valor total do negócio. Por neutralizar o efeito do endividamento, ele permite comparar na mesma régua uma empresa cheia de dívida com outra sem dívida nenhuma, algo que o P/L não faz bem.',
      '<strong>Exemplo ilustrativo:</strong> uma empresa com Enterprise Value de R$ 1 bilhão e EBIT de R$ 100 milhões negocia a EV/EBIT de 10x (1.000 ÷ 100). Números redondos só pra ilustrar a mecânica do múltiplo.',
      'Ressalva honesta: <strong>empresas cíclicas distorcem o múltiplo</strong>. No pico do ciclo o EBIT infla e o EV/EBIT parece baixo (falsamente barato); no fundo acontece o contrário. Negócios em crescimento acelerado também podem justificar múltiplos altos. Leia sempre contra a média histórica da própria empresa e do setor.',
    ],
    related: ['ebit', 'enterprise-value', 'ev-ebitda', 'p-l', 'ebitda'],
    backlink: {
      label: 'Explorar rankings de valuation e indicadores da bolsa',
      to: '/rankings',
    },
    faq: [
      {
        q: 'Por que usar EV/EBIT em vez de P/L?',
        a: 'O EV/EBIT considera a dívida da empresa e usa o lucro operacional, que independe da estrutura de capital. Isso torna a comparação mais justa entre empresas com níveis de endividamento diferentes, algo em que o P/L tropeça.',
      },
      {
        q: 'Qual a diferença entre EV/EBIT e EV/EBITDA?',
        a: 'O EV/EBIT usa o lucro operacional após a depreciação e amortização; o EV/EBITDA usa o resultado antes desses efeitos. O EV/EBITDA tende a ser mais generoso com empresas intensivas em capital, que têm muita depreciação.',
      },
    ],
  },
  {
    slug: 'ebitda',
    term: 'EBITDA',
    letter: 'E',
    short:
      'EBITDA é o lucro antes de juros, impostos, depreciação e amortização, uma medida da geração de caixa operacional pura do negócio.',
    body: [
      'O <strong>EBITDA</strong> (Earnings Before Interest, Taxes, Depreciation and Amortization, ou lucro antes de juros, impostos, depreciação e amortização) mostra quanto a operação de uma empresa gera de resultado antes de despesas financeiras, tributos e dos efeitos contábeis de depreciação e amortização. A ideia é isolar a eficiência do negócio em si, sem a interferência de como ele é financiado ou tributado.',
      'Parte-se do <a href="/glossario/ebit">EBIT</a> e somam-se de volta a depreciação e a amortização: <strong>EBITDA = EBIT + depreciação + amortização</strong>. Por remover esses itens, o EBITDA facilita comparar empresas de países e estruturas de capital diferentes, e é muito usado em valuation e em fusões e aquisições, além de servir de base pra múltiplos como <a href="/glossario/ev-ebitda">EV/EBITDA</a> e Dívida Líquida sobre EBITDA.',
      '<strong>Exemplo ilustrativo:</strong> uma empresa com EBIT de R$ 50 milhões, depreciação de R$ 10 milhões e amortização de R$ 5 milhões tem EBITDA de R$ 65 milhões (50 + 10 + 5). Valores redondos apenas pra mostrar a soma.',
      'Ressalva honesta: <strong>EBITDA não é fluxo de caixa</strong>. Ele ignora os investimentos que o negócio precisa fazer pra continuar rodando (Capex) e as variações de capital de giro, e pode mascarar uma dívida pesada. É uma boa lente pra eficiência operacional, mas nunca deve substituir a análise do caixa que sobra de fato.',
    ],
    related: ['ebit', 'ev-ebitda', 'divida-liquida-ebitda', 'margem-liquida', 'lucro-liquido'],
    backlink: {
      label: 'Explorar rankings de rentabilidade e margens da bolsa',
      to: '/rankings',
    },
    faq: [
      {
        q: 'EBITDA é a mesma coisa que lucro?',
        a: 'Não. O lucro líquido já desconta juros, impostos, depreciação e amortização. O EBITDA fica antes de tudo isso, medindo só a geração operacional. Uma empresa pode ter EBITDA alto e lucro líquido baixo se pagar muitos juros de dívida.',
      },
      {
        q: 'Por que o EBITDA é tão usado?',
        a: 'Porque neutraliza diferenças de financiamento, tributação e política contábil, permitindo comparar a operação de empresas distintas na mesma base. É especialmente útil em setores intensivos em capital, com muita depreciação.',
      },
      {
        q: 'Qual a limitação do EBITDA?',
        a: 'Ele não considera os investimentos necessários (Capex) nem as necessidades de capital de giro, então não equivale ao caixa que sobra. Empresas com dívida alta podem parecer saudáveis pelo EBITDA e não ser.',
      },
    ],
  },
  {
    slug: 'p-vp',
    term: 'P/VP',
    letter: 'P',
    short:
      'P/VP (Preço sobre Valor Patrimonial) compara o preço da ação com o patrimônio contábil por ação, mostrando se o mercado paga acima ou abaixo do valor de balanço.',
    body: [
      'O <strong>P/VP</strong>, de Preço sobre Valor Patrimonial, divide o preço da ação pelo <a href="/glossario/vpa">Valor Patrimonial por Ação (VPA)</a>. O VPA é o quanto cada ação representaria em patrimônio líquido se a empresa fosse avaliada só pelo balanço. O P/VP, então, diz se o mercado está pagando um prêmio ou um desconto sobre esse valor contábil.',
      'A conta é <strong>P/VP = preço da ação ÷ VPA</strong>. Abaixo de 1, a ação negocia por menos que o patrimônio contábil, o que pode ser oportunidade ou sinal de que o mercado duvida da qualidade dos ativos. Acima de 1, o mercado paga um prêmio, em geral por esperar crescimento ou por enxergar valor em ativos intangíveis, como marca e tecnologia, que o balanço não captura por inteiro.',
      '<strong>Exemplo ilustrativo:</strong> uma ação a R$ 45,00 com VPA de R$ 30,00 tem P/VP de 1,5 (45 ÷ 30), ou seja, o mercado paga 50% acima do valor patrimonial. Números redondos apenas pra ilustrar.',
      'Ressalva honesta: <strong>o P/VP funciona melhor em uns setores do que em outros</strong>. É bastante útil pra bancos, seguradoras e holdings, onde o patrimônio reflete bem o valor dos ativos. Já em tecnologia e serviços, onde o valor está em intangíveis, ele engana. Leia sempre junto do <a href="/glossario/roe">ROE</a>: patrimônio barato só compensa se render bem.',
    ],
    related: ['vpa', 'p-l', 'roe', 'patrimonio-liquido', 'valor-mercado'],
    backlink: {
      label: 'Ver o ranking das ações mais baratas pela fórmula de Graham',
      to: '/ranking/mais-baratas-graham',
    },
    faq: [
      {
        q: 'O que significa P/VP menor que 1?',
        a: 'Significa que a ação está sendo negociada por menos do que o patrimônio contábil por ação. Pode ser uma oportunidade de compra com desconto, ou um aviso de que o mercado desconfia da qualidade dos ativos ou espera prejuízos. Sozinho, não decide nada.',
      },
      {
        q: 'Para que tipo de empresa o P/VP é mais útil?',
        a: 'Para bancos, seguradoras e holdings, cujo valor está muito ligado ao patrimônio registrado no balanço. Em empresas de tecnologia e serviços, cujo valor mora em intangíveis, o P/VP perde poder de explicação.',
      },
    ],
  },
  {
    slug: 'fii',
    term: 'Fundos Imobiliários',
    letter: 'F',
    short:
      'Fundos Imobiliários (FIIs) reúnem investidores pra aplicar em imóveis e títulos do setor, com renda mensal e liquidez de bolsa, sem precisar comprar um imóvel físico.',
    body: [
      'Os <strong>Fundos de Investimento Imobiliário</strong>, os <strong>FIIs</strong>, funcionam como um condomínio de investidores que, juntos, aplicam em ativos imobiliários. Em vez de comprar um imóvel inteiro, você compra cotas negociadas na bolsa e passa a receber, proporcionalmente, a renda que esses ativos geram. É a forma mais acessível de investir em imóveis com pouca liquidez travada e gestão profissional.',
      'Há basicamente quatro famílias: <strong>fundos de tijolo</strong> (imóveis físicos como shoppings, lajes e galpões), <strong>fundos de papel</strong> (títulos do setor, como <a href="/glossario/cri">CRIs</a>), <strong>fundos de fundos</strong> (cotas de outros FIIs) e <strong>híbridos</strong>. Por regra, o FII distribui a maior parte do resultado aos cotistas periodicamente, o que dá a esses fundos a fama de pagadores de renda mensal e um <a href="/glossario/dividend-yield">dividend yield</a> acompanhado de perto pelo mercado.',
      '<strong>Exemplo ilustrativo:</strong> ao comprar 100 cotas de um FII a R$ 100 cada (R$ 10.000 investidos), o cotista recebe rendimentos proporcionais à quantidade de cotas. Um yield hipotético de 0,8% ao mês geraria R$ 80 no mês. É só uma conta de exemplo, não a distribuição real de nenhum fundo.',
      'Ressalva honesta: <strong>FII não é renda fixa</strong>. A cota oscila na bolsa e a renda depende de fatores como <a href="/glossario/vacancia">vacância</a>, inadimplência dos inquilinos e o momento do ciclo imobiliário. Antes de perseguir o maior yield, vale olhar a qualidade dos imóveis ou dos títulos, a diversificação e o histórico de pagamentos.',
    ],
    related: ['dividend-yield', 'vacancia', 'cap-rate', 'ifix', 'fundos-tijolo'],
    backlink: {
      label: 'Ver o ranking dos Fundos Imobiliários da bolsa',
      to: '/rankings?classe=fiis',
    },
    faq: [
      {
        q: 'FII paga imposto de renda?',
        a: 'Os rendimentos distribuídos pelos FIIs costumam ser isentos de imposto de renda para a pessoa física, desde que cumpridas as condições legais. Já o ganho de capital na venda das cotas é tributado. As regras podem mudar, então confirme a legislação vigente.',
      },
      {
        q: 'Qual a diferença entre fundo de tijolo e fundo de papel?',
        a: 'O fundo de tijolo investe em imóveis físicos, como shoppings, lajes corporativas e galpões, e ganha com aluguel e valorização. O fundo de papel investe em títulos do setor imobiliário, como CRIs, e ganha com os juros desses papéis.',
      },
      {
        q: 'FII é um bom investimento para renda passiva?',
        a: 'FIIs são desenhados pra distribuir renda com frequência, o que atrai quem busca renda passiva. Mas a cota varia de preço e a renda não é garantida: depende de vacância, inadimplência e do ciclo imobiliário. Diversificação e análise da carteira do fundo são essenciais.',
      },
    ],
  },
  {
    slug: 'vacancia',
    term: 'Vacância',
    letter: 'V',
    short:
      'Vacância é o percentual de área não alugada em um imóvel ou carteira de imóveis, um dos principais indicadores de saúde de Fundos Imobiliários de tijolo.',
    body: [
      'A <strong>vacância</strong> mede quanto da área de um imóvel, ou de toda a carteira de um <a href="/glossario/fii">Fundo Imobiliário</a> de tijolo, está vazia e portanto não gera receita. É um termômetro direto de saúde: espaço alugado vira aluguel, que vira distribuição ao cotista; espaço vago é custo sem retorno.',
      'A conta básica é <strong>vacância = (área não locada ÷ área locável total) × 100</strong>. Vale distinguir a <strong>vacância física</strong>, o espaço realmente sem inquilino, da <strong>vacância financeira</strong>, que também considera carências e inadimplência, períodos em que o espaço está ocupado mas não paga. As duas contam uma história parecida por caminhos diferentes.',
      '<strong>Exemplo ilustrativo:</strong> um fundo de lajes com 10.000 m² locáveis e 1.500 m² vazios tem vacância de 15% (1.500 ÷ 10.000). Números redondos apenas pra mostrar o cálculo.',
      'Ressalva honesta: <strong>nem toda vacância é ruim</strong>. Um espaço fechado pra retrofit pode voltar mais valorizado, e uma vacância pontual difere de uma tendência de alta. O que preocupa é vacância crescente e acima da média da região e do segmento, porque tende a pressionar os rendimentos pra baixo. Acompanhe a evolução nos relatórios gerenciais, não um número solto.',
    ],
    related: ['fii', 'cap-rate', 'noi', 'dividend-yield', 'fundos-tijolo'],
    backlink: {
      label: 'Comparar Fundos Imobiliários e sua ocupação',
      to: '/rankings?classe=fiis',
    },
    faq: [
      {
        q: 'Vacância alta é sempre ruim para um FII?',
        a: 'Em geral, vacância alta reduz a receita de aluguel e pressiona os rendimentos. Mas o contexto importa: vacância temporária por reforma pode ser positiva, e o que realmente pesa é a tendência. Vacância crescente e acima da média do setor é o sinal de alerta.',
      },
      {
        q: 'Qual a diferença entre vacância física e financeira?',
        a: 'A vacância física é a área literalmente sem inquilino. A vacância financeira é mais ampla: inclui espaços ocupados que não estão pagando por causa de carências ou inadimplência. A financeira costuma dar um retrato mais realista do impacto na receita.',
      },
    ],
  },
  {
    slug: 'diversificacao',
    term: 'Diversificação',
    letter: 'D',
    short:
      'Diversificação é distribuir o investimento entre ativos, setores e classes diferentes pra reduzir o impacto de um único ativo ruim na carteira.',
    body: [
      'A <strong>diversificação</strong> é o princípio de não colocar todos os ovos na mesma cesta. Ao espalhar o capital por vários ativos, setores e classes, você reduz o chamado risco específico, o risco de que um problema isolado em uma empresa ou segmento derrube a carteira inteira. É uma das poucas formas de baixar risco sem, necessariamente, abrir mão de retorno esperado.',
      'Ela acontece em camadas: entre <strong>classes</strong> (ações, <a href="/glossario/fii">FIIs</a>, renda fixa), entre <strong>setores</strong> (não concentrar tudo em bancos ou commodities), entre <strong>empresas</strong> dentro do mesmo setor e, pra quem quer, também no plano <strong>geográfico</strong> e <strong>temporal</strong>, com aportes espalhados no tempo. Cada camada ataca um tipo diferente de concentração.',
      '<strong>Exemplo ilustrativo:</strong> em vez de R$ 10.000 só em uma ação, o investidor divide em cinco posições de R$ 2.000 em ativos diferentes. Se um deles cair 20%, o impacto na carteira é de cerca de 4%, não de 20%. Conta simplificada só pra mostrar a lógica.',
      'Ressalva honesta: <strong>dá pra diversificar demais</strong>. Passar de algumas dezenas de ativos costuma trazer pouco benefício adicional de redução de risco e muita dificuldade de acompanhar cada posição, algo que os investidores chamam de diworsification. Diversificação boa é a que você consegue de fato monitorar, não a maior lista possível.',
    ],
    related: ['alocacao-carteira', 'risco', 'volatilidade', 'rebalanceamento', 'buy-and-hold'],
    backlink: {
      label: 'Descobrir ativos de qualidade por setor no Redentia Score',
      to: '/ranking/redentia-score',
    },
    faq: [
      {
        q: 'Quantos ativos são suficientes para diversificar?',
        a: 'Estudos clássicos sugerem que algumas dezenas de ativos bem escolhidos já capturam a maior parte do benefício de redução de risco específico. Acima disso o ganho é pequeno e o custo de acompanhamento cresce. O número certo depende de quanto você consegue monitorar com atenção.',
      },
      {
        q: 'Diversificar reduz o retorno?',
        a: 'Diversificar reduz o risco específico sem necessariamente reduzir o retorno esperado, por isso é considerada uma das poucas vantagens gratuitas do investimento. O excesso, porém, pode diluir os resultados e virar diworsification.',
      },
    ],
  },
  {
    slug: 'buy-and-hold',
    term: 'Buy and Hold',
    letter: 'B',
    short:
      'Buy and Hold é a estratégia de comprar ativos de qualidade e mantê-los por muitos anos, ignorando o ruído de curto prazo pra deixar os juros compostos trabalharem.',
    body: [
      'O <strong>Buy and Hold</strong>, comprar e segurar, é uma estratégia de longo prazo em que o investidor seleciona empresas de qualidade e mantém as ações por anos ou décadas, sem tentar acertar entradas e saídas conforme o mercado sobe e desce. A tese é que, no prazo longo, o crescimento dos lucros e o reinvestimento dos <a href="/glossario/dividendos">dividendos</a> importam muito mais do que a oscilação diária dos preços.',
      'Na prática, a estratégia se apoia em alguns pilares: escolher negócios sólidos com bons fundamentos, ter horizonte de vários anos, reinvestir proventos e deixar os juros compostos acumularem. Entre as vantagens estão menos custos de corretagem, diferimento de imposto (que só incide na venda) e menos desgaste emocional, já que não se opera a cada solavanco do mercado.',
      '<strong>Exemplo ilustrativo:</strong> um investidor que aporta em uma boa empresa e reinveste os dividendos por 15 anos tende a colher o efeito composto do crescimento e da renda, atravessando crises pelo caminho. É a lógica da estratégia, não a promessa de um resultado específico.',
      'Ressalva honesta: <strong>Buy and Hold não é comprar e esquecer</strong>. É preciso acompanhar os resultados e a tese: se os fundamentos se deterioram de forma estrutural, e não por um tropeço passageiro, faz sentido rever a posição. Segurar por segurar, mesmo diante de uma empresa que piorou de verdade, é teimosia, não estratégia.',
    ],
    related: ['diversificacao', 'dividendos', 'roe', 'p-l', 'blue-chips'],
    backlink: {
      label: 'Ler o guia completo de como investir em ações',
      to: '/guias/como-investir-em-acoes',
    },
    faq: [
      {
        q: 'Buy and Hold funciona no Brasil?',
        a: 'A lógica de manter boas empresas por muitos anos e reinvestir proventos vale em qualquer mercado, incluindo o brasileiro. O que muda é a exigência de seleção: em mercados mais voláteis, escolher negócios resilientes e acompanhar a tese ao longo do tempo pesa ainda mais.',
      },
      {
        q: 'Quando devo vender no Buy and Hold?',
        a: 'A regra geral é vender quando os fundamentos da empresa se deterioram de forma estrutural, quando a tese de investimento deixa de valer, ou quando você precisa do dinheiro para um objetivo importante. Oscilação de preço, sozinha, não é motivo de venda nessa estratégia.',
      },
    ],
  },
  {
    slug: 'ifix',
    term: 'IFIX',
    letter: 'I',
    short:
      'IFIX é o principal índice dos Fundos Imobiliários negociados na B3, o benchmark que resume, em um número, o desempenho médio do mercado de FIIs.',
    body: [
      'O <strong>IFIX</strong>, Índice de Fundos de Investimentos Imobiliários, é o termômetro do mercado de <a href="/glossario/fii">FIIs</a> no Brasil, criado e calculado pela <a href="/glossario/b3">B3</a>. Funciona como uma carteira teórica dos fundos mais líquidos e relevantes, ponderados por valor de mercado, e serve de referência pra medir se o setor como um todo subiu ou caiu num período.',
      'Assim como o <a href="/glossario/ibovespa">Ibovespa</a> resume a bolsa de ações, o IFIX resume a bolsa de FIIs. Se ele valorizou num intervalo, significa que, na média ponderada, os principais fundos imobiliários subiram. É por isso que ele vira <a href="/glossario/benchmark">benchmark</a> natural: dá pra comparar o desempenho da sua carteira de FIIs contra o mercado inteiro.',
      '<strong>Exemplo ilustrativo:</strong> se o índice sai de 3.000 para 3.200 pontos num mês, houve alta de cerca de 6,7% no período. O número absoluto de pontos, isolado, não diz muito; o que importa é a variação. Valores usados só pra explicar a leitura.',
      'Ressalva honesta: <strong>o IFIX padrão mede só a variação de preço das cotas</strong>, não os rendimentos distribuídos. Como FIIs pagam renda com frequência, olhar apenas o índice de preço subestima o retorno total do cotista. Pra visão completa, existe a versão total return, que reinveste os proventos.',
    ],
    related: ['fii', 'ibovespa', 'dividend-yield', 'benchmark', 'b3'],
    backlink: {
      label: 'Ver os Fundos Imobiliários que compõem o mercado',
      to: '/rankings?classe=fiis',
    },
    faq: [
      {
        q: 'O que o IFIX mede?',
        a: 'O IFIX mede o desempenho médio ponderado dos Fundos Imobiliários mais líquidos da B3. É o principal benchmark do mercado de FIIs, o equivalente ao Ibovespa para o universo das ações.',
      },
      {
        q: 'O IFIX considera os dividendos dos FIIs?',
        a: 'O IFIX tradicional mede apenas a variação de preço das cotas, sem os rendimentos. Como os FIIs distribuem renda com frequência, existe a versão total return, que reinveste os proventos e mostra o retorno completo do investidor.',
      },
    ],
  },
  {
    slug: 'ibovespa',
    term: 'Ibovespa',
    letter: 'I',
    short:
      'Ibovespa é o principal índice da bolsa brasileira (B3), o termômetro que resume o desempenho médio das ações mais negociadas do país.',
    body: [
      'O <strong>Ibovespa</strong>, Índice Bovespa, é a principal referência do mercado de ações brasileiro, calculado pela <a href="/glossario/b3">B3</a> desde 1968. Ele reúne, numa carteira teórica, as ações mais negociadas da bolsa, ponderadas pela relevância de cada uma, e representa a maior parte do volume que gira no pregão. Quando alguém fala que a bolsa subiu ou caiu, quase sempre está falando do Ibovespa.',
      'As empresas entram no índice por critérios de liquidez e presença em pregão, e o peso de cada uma acompanha seu tamanho e negociabilidade. A cada poucos meses a B3 revisa a composição, incluindo e excluindo papéis. Por concentrar as maiores companhias, o Ibovespa acaba sendo o <a href="/glossario/benchmark">benchmark</a> mais usado por fundos e investidores pra comparar desempenho.',
      '<strong>Exemplo ilustrativo:</strong> se o índice vai de 100.000 para 110.000 pontos ao longo do ano, houve valorização de 10% no período, ou seja, na média as principais ações subiram 10%. Números usados só pra mostrar como se lê a variação.',
      'Ressalva honesta: <strong>o número de pontos, sozinho, não diz se está caro ou barato</strong>. O que importa é a variação ao longo do tempo, e o índice reflete sobretudo as gigantes: uma carteira concentrada em empresas menores pode se comportar de forma bem diferente do Ibovespa.',
    ],
    related: ['b3', 'ifix', 'etf', 'benchmark', 'blue-chips'],
    backlink: {
      label: 'Ver o ranking das maiores empresas por valor de mercado',
      to: '/ranking/maiores-valor-mercado',
    },
    faq: [
      {
        q: 'O que significa o Ibovespa subir ou cair?',
        a: 'Significa que, na média ponderada, as principais ações da bolsa se valorizaram ou desvalorizaram no período. Como o índice concentra as maiores empresas, ele reflete mais o comportamento delas do que o do mercado inteiro.',
      },
      {
        q: 'Dá para investir diretamente no Ibovespa?',
        a: 'Não se compra o índice em si, mas é possível ter exposição a ele por meio de ETFs que replicam o Ibovespa, comprando com um único ativo uma cesta parecida com a do índice. Fundos e contratos futuros também usam o Ibovespa como referência.',
      },
    ],
  },
  {
    slug: 'dividendos',
    term: 'Dividendos',
    letter: 'D',
    short:
      'Dividendos são a parcela do lucro que a empresa distribui aos acionistas em dinheiro, a forma mais direta de ser remunerado por ser sócio de um negócio.',
    body: [
      'Os <strong>dividendos</strong> são a parte do lucro líquido que a empresa devolve aos acionistas em dinheiro. Ao comprar uma ação, você vira sócio e passa a ter direito a essa fatia dos resultados. A empresa decide, dentro da política dela, quanto reinveste no próprio negócio e quanto distribui, e essa proporção distribuída é medida pelo <a href="/glossario/payout">payout</a>.',
      'Dividendo é um tipo de provento, ao lado de outros como os <a href="/glossario/jscp">juros sobre capital próprio (JCP)</a> e as bonificações. Três datas organizam o pagamento: a <strong>data com</strong> (último dia pra comprar e ter direito), a <strong>data ex</strong> (quando a ação passa a negociar sem o direito) e a <strong>data de pagamento</strong> (quando o dinheiro cai na conta). O quanto isso representa sobre o preço da ação é o <a href="/glossario/dividend-yield">dividend yield</a>.',
      '<strong>Exemplo ilustrativo:</strong> quem tem 100 ações e recebe um anúncio de R$ 0,50 por ação em dividendos recebe R$ 50 (100 × 0,50) na conta da corretora. Números redondos só pra mostrar a conta.',
      'Ressalva honesta: <strong>dividendo alto não é sinônimo de boa empresa</strong>. Vale checar se a companhia sustenta esses pagamentos com lucro recorrente ou se está distribuindo além do que gera. Empresas em forte crescimento muitas vezes pagam pouco justamente porque reinvestem, e nem por isso são piores.',
    ],
    related: ['dividend-yield', 'jscp', 'proventos', 'payout', 'fii'],
    backlink: {
      label: 'Ver o ranking das maiores pagadoras de dividendos',
      to: '/ranking/maiores-dividend-yield',
    },
    faq: [
      {
        q: 'Dividendos pagam imposto de renda?',
        a: 'No Brasil, os dividendos costumam ser isentos de imposto de renda para a pessoa física, enquanto os juros sobre capital próprio (JCP) têm retenção na fonte. As regras tributárias podem mudar, então confirme a legislação vigente antes de planejar.',
      },
      {
        q: 'Qual a diferença entre dividendos e JCP?',
        a: 'Ambos remuneram o acionista, mas têm tratamento fiscal diferente. O dividendo costuma ser isento para a pessoa física; o JCP sofre retenção de imposto na fonte, ainda que costume ser dedutível para a empresa que o paga.',
      },
      {
        q: 'O que são data com e data ex?',
        a: 'A data com é o último dia para comprar a ação e ter direito ao provento anunciado. A data ex é o primeiro dia em que a ação passa a ser negociada já sem esse direito. Quem compra na data ex não recebe aquele pagamento específico.',
      },
    ],
  },
  {
    slug: 'liquidez',
    term: 'Liquidez',
    letter: 'L',
    short:
      'Liquidez é a facilidade de transformar um ativo em dinheiro rapidamente e sem perder valor, uma dimensão de risco tão importante quanto a rentabilidade.',
    body: [
      'A <strong>liquidez</strong> mede quão rápido e sem desconto você consegue vender um ativo e virar dinheiro. Um ativo de alta liquidez, como uma ação de grande empresa ou o Tesouro Selic, se vende em segundos perto do preço justo. Um de baixa liquidez, como um imóvel físico ou uma <a href="/glossario/small-caps">small cap</a> pouco negociada, pode exigir tempo ou um corte no preço pra encontrar comprador.',
      'Na bolsa, a liquidez aparece em sinais como o <strong>volume financeiro negociado</strong>, o número de negócios por dia e o spread, a distância entre a melhor oferta de compra e a de venda. Quanto mais líquido o ativo, menor o spread e menor o risco de mover o preço contra você ao entrar ou sair de uma posição grande.',
      '<strong>Exemplo ilustrativo:</strong> um papel muito líquido absorve uma ordem grande sem quase mexer no preço, enquanto um FII de nicho pode não ter comprador do outro lado, obrigando a vender com desconto. Situação genérica só pra ilustrar o conceito.',
      'Ressalva honesta: <strong>costuma haver troca entre liquidez e retorno</strong>, e a liquidez some justamente nas crises, quando você mais precisa dela. Por isso a reserva de emergência deve ficar em ativos de alta liquidez, e vale dosar o quanto da carteira você aceita deixar preso em posições difíceis de vender.',
    ],
    related: ['volatilidade', 'risco', 'valor-mercado', 'blue-chips', 'small-caps'],
    backlink: {
      label: 'Ver as maiores empresas da bolsa por valor de mercado',
      to: '/ranking/maiores-valor-mercado',
    },
    faq: [
      {
        q: 'Por que a liquidez é importante?',
        a: 'Porque determina se você consegue transformar um ativo em dinheiro quando precisa, sem sofrer um desconto grande no preço. Baixa liquidez atrapalha resgates de emergência, rebalanceamentos e pode forçar vendas ruins, especialmente em momentos de crise.',
      },
      {
        q: 'Ações mais líquidas rendem menos?',
        a: 'Existe uma tendência de troca entre liquidez e retorno: ativos menos líquidos podem oferecer um prêmio para compensar a dificuldade de venda. Mas isso não é regra fixa, e a menor liquidez também traz mais risco de execução. É preciso equilibrar.',
      },
    ],
  },
  {
    slug: 'volatilidade',
    term: 'Volatilidade',
    letter: 'V',
    short:
      'Volatilidade mede o tamanho das oscilações de preço de um ativo, uma das formas mais usadas de quantificar risco no curto prazo.',
    body: [
      'A <strong>volatilidade</strong> descreve o quanto o preço de um ativo balança ao longo do tempo. Ativos de alta volatilidade sobem e caem com força; os de baixa volatilidade variam pouco. Estatisticamente, costuma ser calculada pelo desvio padrão dos retornos, e é uma das medidas de risco mais usadas, sobretudo pra quem tem horizonte curto.',
      'Vale separar dois conceitos que muita gente confunde: <strong>volatilidade</strong> é oscilação de preço, muitas vezes temporária; <a href="/glossario/risco">risco</a> é a chance de perda permanente de capital. Uma boa empresa pode ter ação volátil e, ainda assim, ser um investimento seguro no longo prazo. O <a href="/glossario/beta">beta</a> é um primo próximo: mede a volatilidade de uma ação em relação ao mercado.',
      '<strong>Exemplo ilustrativo:</strong> uma ação que passeia entre R$ 90 e R$ 110 num mês é mais volátil que outra que fica entre R$ 98 e R$ 102 no mesmo período. Mais volátil não quer dizer pior, depende do seu prazo e do seu estômago. Números só pra ilustrar.',
      'Ressalva honesta: <strong>a volatilidade muda de cara conforme o horizonte</strong>. Pra quem investe no longo prazo e faz aportes constantes, ela pode ser aliada, permitindo comprar barato nas quedas. Pra quem opera no curto prazo, é fonte de estresse e de stop. Ajuste a dose de ativos voláteis ao seu perfil e ao tempo que pode deixar o dinheiro investido.',
    ],
    related: ['risco', 'beta', 'diversificacao', 'liquidez', 'small-caps'],
    backlink: {
      label: 'Entender risco e volatilidade no guia de small caps',
      to: '/guias/small-caps-guia-completo',
    },
    faq: [
      {
        q: 'Volatilidade é a mesma coisa que risco?',
        a: 'Não. Volatilidade é a oscilação de preço, que pode ser passageira. Risco, no sentido que mais importa ao investidor de longo prazo, é a chance de perda permanente de capital. Um ativo pode ser volátil e ainda assim sólido no longo prazo.',
      },
      {
        q: 'Alta volatilidade é ruim?',
        a: 'Depende do horizonte. Para quem investe no longo prazo e aporta com regularidade, a volatilidade pode ser oportunidade de comprar barato nas quedas. Para quem opera no curto prazo, ela é fonte de risco e estresse. O que vale é alinhar ao seu perfil.',
      },
    ],
  },
  {
    slug: 'ebit',
    term: 'EBIT',
    letter: 'E',
    short:
      'EBIT (Earnings Before Interest and Taxes) é o lucro operacional antes de juros e impostos, a medida do resultado que vem da atividade principal da empresa.',
    body: [
      'O <strong>EBIT</strong> (Earnings Before Interest and Taxes, ou lucro antes de juros e impostos) mostra quanto a empresa lucra apenas com a sua operação, antes de considerar despesas financeiras e tributos. É também chamado de lucro operacional e serve pra avaliar a eficiência do negócio em si, sem a interferência de como ele é financiado ou de qual regime tributário está sujeito.',
      'A relação com o <a href="/glossario/lucro-liquido">lucro líquido</a> é direta: partindo do lucro líquido, somam-se de volta as despesas financeiras e os impostos pra chegar ao EBIT. Por isolar a operação, ele permite comparar empresas com estruturas de dívida diferentes e é a base de múltiplos como o <a href="/glossario/ev-ebit">EV/EBIT</a>. Some depreciação e amortização e você chega ao <a href="/glossario/ebitda">EBITDA</a>.',
      '<strong>Exemplo ilustrativo:</strong> uma empresa com receita de R$ 1 milhão e custos operacionais de R$ 600 mil tem EBIT de R$ 400 mil. Depois de pagar R$ 50 mil de juros e R$ 100 mil de impostos, sobram R$ 250 mil de lucro líquido. Valores redondos só pra mostrar a cascata.',
      'Ressalva honesta: <strong>um EBIT forte não garante lucro no fim da linha</strong>. Uma empresa pode ter ótima operação e, ainda assim, entregar lucro líquido pequeno se carregar muita dívida cara. O EBIT mostra a saúde da operação; o resultado que chega ao acionista depende também da estrutura financeira.',
    ],
    related: ['ebitda', 'ev-ebit', 'lucro-liquido', 'margem-liquida', 'p-l'],
    backlink: {
      label: 'Explorar rankings de rentabilidade e valuation',
      to: '/rankings',
    },
    faq: [
      {
        q: 'Qual a diferença entre EBIT e lucro líquido?',
        a: 'O EBIT é o lucro da operação antes de juros e impostos, medindo a eficiência do negócio. O lucro líquido é o que sobra depois de descontar essas despesas financeiras e tributárias, sendo o resultado final que pertence ao acionista.',
      },
      {
        q: 'Qual a diferença entre EBIT e EBITDA?',
        a: 'O EBIT é o lucro operacional já considerando a depreciação e a amortização. O EBITDA soma esses dois itens de volta, medindo a geração de caixa operacional antes deles. Em empresas com muitos ativos e muita depreciação, a diferença entre os dois é grande.',
      },
    ],
  },
  {
    slug: 'roa',
    term: 'ROA',
    letter: 'R',
    short:
      'ROA (Return on Assets) mede quanto de lucro a empresa gera sobre o total de ativos, indicando a eficiência no uso dos recursos que ela emprega.',
    body: [
      'O <strong>ROA</strong>, de Return on Assets ou Retorno sobre os Ativos, mostra quanto de lucro a empresa produz pra cada real aplicado em ativos, sejam máquinas, imóveis, estoque ou caixa. É uma medida de eficiência: dois negócios podem lucrar o mesmo valor, mas o que faz isso com menos ativos empregados é o mais eficiente.',
      'A conta é <strong>ROA = (lucro líquido ÷ ativo total) × 100</strong>. A diferença essencial pro <a href="/glossario/roe">ROE</a> está no denominador: o ROE considera só o patrimônio dos acionistas, enquanto o ROA considera todos os ativos, próprios e financiados por dívida. Por isso o ROA costuma ser menor que o ROE em empresas alavancadas, e comparar os dois ajuda a enxergar o peso da dívida no retorno.',
      '<strong>Exemplo ilustrativo:</strong> uma empresa com lucro de R$ 50 milhões e ativo total de R$ 500 milhões tem ROA de 10% (50 ÷ 500). Cada R$ 100 em ativos gerou R$ 10 de lucro. Números redondos só pra ilustrar.',
      'Ressalva honesta: <strong>o patamar saudável de ROA varia muito por setor</strong>. Negócios intensivos em capital, como siderúrgicas e elétricas, convivem naturalmente com ROA mais baixo, porque precisam de muitos ativos pra operar. Comparar ROA entre setores diferentes leva a conclusões erradas; o justo é comparar com os pares diretos.',
    ],
    related: ['roe', 'roic', 'margem-liquida', 'lucro-liquido', 'patrimonio-liquido'],
    backlink: {
      label: 'Ver o ranking de rentabilidade das empresas por ROE',
      to: '/ranking/maiores-roe',
    },
    faq: [
      {
        q: 'Qual a diferença entre ROA e ROE?',
        a: 'O ROA mede o retorno sobre todos os ativos da empresa, próprios e financiados. O ROE mede o retorno apenas sobre o patrimônio dos acionistas. Quando a empresa usa muita dívida, o ROE tende a ficar bem acima do ROA.',
      },
      {
        q: 'O que é um bom ROA?',
        a: 'Depende fortemente do setor. Empresas intensivas em capital operam com ROA naturalmente mais baixo, enquanto negócios leves em ativos podem ter ROA alto. O correto é comparar com concorrentes diretos e olhar a consistência ao longo dos anos.',
      },
    ],
  },
  {
    slug: 'roic',
    term: 'ROIC',
    letter: 'R',
    short:
      'ROIC (Return on Invested Capital) mede o retorno sobre todo o capital investido no negócio, próprio e de terceiros, revelando se a empresa cria ou destrói valor.',
    body: [
      'O <strong>ROIC</strong>, de Return on Invested Capital ou Retorno sobre o Capital Investido, é considerado por muitos analistas o indicador de rentabilidade mais honesto, porque mede o retorno sobre todo o capital empregado no negócio, tanto o dos sócios quanto o de credores. Ele responde à pergunta que de fato importa: a empresa rende mais do que custa o capital que ela usa?',
      'A leitura chave é comparar o ROIC com o custo de capital (o WACC). Se o <strong>ROIC supera o custo de capital</strong>, a empresa cria valor a cada real investido; se fica abaixo, destrói valor mesmo dando lucro contábil. É aí que o ROIC se mostra superior ao <a href="/glossario/roe">ROE</a>, que pode ser inflado por <a href="/glossario/alavancagem">alavancagem</a>: como o ROIC considera todo o capital, ele não é maquiado pela dívida.',
      '<strong>Exemplo ilustrativo:</strong> uma empresa com lucro operacional líquido de impostos de R$ 100 milhões sobre um capital investido de R$ 500 milhões tem ROIC de 20%. Se o custo de capital dela é 10%, cada real investido está criando valor. Números redondos só pra explicar a ideia.',
      'Ressalva honesta: <strong>ROIC sozinho não basta, o comparativo é com o custo de capital</strong>. Um ROIC de 12% pode ser ótimo se o custo de capital for 8%, e ruim se for 15%. Procure empresas com ROIC alto, estável e sustentado por vantagens competitivas reais, não por um ano fora da curva.',
    ],
    related: ['roe', 'roa', 'alavancagem', 'margem-liquida', 'lucro-liquido'],
    backlink: {
      label: 'Ver o ranking das empresas mais rentáveis por ROE',
      to: '/ranking/maiores-roe',
    },
    faq: [
      {
        q: 'Por que o ROIC é considerado melhor que o ROE?',
        a: 'Porque o ROIC considera todo o capital empregado no negócio, não só o dos acionistas. Isso evita que a alavancagem infle o número, como pode acontecer com o ROE. O ROIC dá um retrato mais fiel da eficiência real da empresa em gerar retorno.',
      },
      {
        q: 'O que significa ROIC maior que o custo de capital?',
        a: 'Significa que a empresa gera, sobre o capital investido, um retorno superior ao que esse capital custa. Nesse caso, ela está criando valor. Quando o ROIC fica abaixo do custo de capital, a empresa destrói valor, ainda que apresente lucro contábil.',
      },
    ],
  },
  {
    slug: 'lpa',
    term: 'LPA',
    letter: 'L',
    short:
      'LPA (Lucro por Ação) é o lucro líquido dividido pelo número de ações, mostrando quanto de resultado cabe a cada ação e servindo de base para o P/L.',
    body: [
      'O <strong>LPA</strong>, Lucro por Ação, distribui o <a href="/glossario/lucro-liquido">lucro líquido</a> da empresa pelo total de ações em circulação. É um dos indicadores mais elementares e, ao mesmo tempo, um dos mais úteis: ele traduz o lucro total num valor por ação, o que permite comparar empresas de tamanhos diferentes e acompanhar a evolução do resultado ao longo do tempo.',
      'A conta é <strong>LPA = lucro líquido ÷ número total de ações</strong>. O LPA é também o denominador do <a href="/glossario/p-l">P/L</a> (preço dividido por LPA), então é peça central de valuation. Uma empresa que aumenta o LPA de forma consistente, ano após ano, costuma ver isso refletido no preço da ação no longo prazo, porque o mercado paga por lucro crescente.',
      '<strong>Exemplo ilustrativo:</strong> uma empresa que lucrou R$ 1 bilhão e tem 100 milhões de ações tem LPA de R$ 10 (1.000.000.000 ÷ 100.000.000). Valores redondos apenas pra demonstrar a fórmula.',
      'Ressalva honesta: <strong>eventos societários distorcem a comparação</strong>. Desdobramentos e grupamentos mudam o número de ações e, portanto, o LPA, sem que o lucro total tenha mudado. Compare sempre períodos equivalentes (trimestre contra trimestre, ano contra ano) e lembre que LPA negativo significa prejuízo no período.',
    ],
    related: ['p-l', 'lucro-liquido', 'vpa', 'dividendos', 'roe'],
    backlink: {
      label: 'Ver o ranking das ações com menor P/L',
      to: '/ranking/menores-pl',
    },
    faq: [
      {
        q: 'Para que serve o LPA?',
        a: 'O LPA mostra quanto de lucro cabe a cada ação, permitindo comparar empresas de tamanhos diferentes e acompanhar a evolução do resultado. Ele também é a base do cálculo do P/L, um dos múltiplos de valuation mais usados.',
      },
      {
        q: 'Desdobramento de ações muda o LPA?',
        a: 'Sim. Um desdobramento aumenta o número de ações sem alterar o lucro total, então o LPA por ação cai proporcionalmente. O grupamento faz o inverso. Por isso é importante comparar sempre períodos equivalentes e considerar esses eventos.',
      },
    ],
  },
  {
    slug: 'vpa',
    term: 'VPA',
    letter: 'V',
    short:
      'VPA (Valor Patrimonial por Ação) é o patrimônio líquido dividido pelo número de ações, indicando quanto cada ação vale em termos contábeis.',
    body: [
      'O <strong>VPA</strong>, Valor Patrimonial por Ação, distribui o <a href="/glossario/patrimonio-liquido">patrimônio líquido</a> da empresa pelo total de ações. Ele responde, em termos contábeis: se a empresa fosse avaliada só pelo balanço, quanto caberia a cada ação. É o valor de livro por ação, uma referência de quanto de patrimônio sustenta cada papel.',
      'A conta é <strong>VPA = patrimônio líquido ÷ número total de ações</strong>. Seu uso mais comum é como denominador do <a href="/glossario/p-vp">P/VP</a> (preço dividido por VPA), que compara o preço de mercado com esse valor contábil. Preço abaixo do VPA sinaliza que a ação negocia com desconto sobre o patrimônio; acima, que o mercado paga um prêmio, em geral por crescimento esperado ou por ativos intangíveis.',
      '<strong>Exemplo ilustrativo:</strong> uma empresa com patrimônio líquido de R$ 3 bilhões e 100 milhões de ações tem VPA de R$ 30 por ação. Números redondos só pra ilustrar.',
      'Ressalva honesta: <strong>o VPA se apoia em valores contábeis, que envelhecem</strong>. Uma marca forte, uma patente ou um software valioso muitas vezes não aparecem por inteiro no balanço, então o VPA pode subestimar o valor real de empresas ricas em intangíveis. Ele é mais representativo em bancos e holdings do que em tecnologia.',
    ],
    related: ['p-vp', 'patrimonio-liquido', 'lpa', 'valor-mercado', 'roe'],
    backlink: {
      label: 'Ver o ranking das ações mais baratas pela fórmula de Graham',
      to: '/ranking/mais-baratas-graham',
    },
    faq: [
      {
        q: 'Qual a diferença entre VPA e preço da ação?',
        a: 'O VPA é o valor patrimonial contábil por ação, tirado do balanço. O preço é quanto o mercado está disposto a pagar. A relação entre os dois é o P/VP: quando o preço fica abaixo do VPA, diz-se que a ação negocia com desconto sobre o patrimônio.',
      },
      {
        q: 'VPA alto significa ação barata?',
        a: 'Não por si só. O que importa é comparar o VPA com o preço, pelo P/VP, e considerar a qualidade dos ativos. Empresas ricas em intangíveis podem ter VPA baixo e ainda assim valer muito, porque marca e tecnologia nem sempre aparecem no balanço.',
      },
    ],
  },
]
