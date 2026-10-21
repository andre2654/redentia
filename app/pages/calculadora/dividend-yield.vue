<script setup lang="ts">
// /calculadora/dividend-yield — PR10 fase 2.
// Contrato de UX: docs/redentia-nu/designs/Redentia Calculadoras Nu.dc.html
// (card creme de controles + sliders/chips, número-herói, gráfico, steps,
// fórmula, FAQ accordion) — mesma estrutura da referência juros-compostos.
// Contrato de SEO (regra nº1): TODO o texto da página antiga
// (Frontend/app/pages/calculadora/dividend-yield.vue) verbatim, na MESMA
// ordem de tags (h1 → h2/h3/h4 → p → li → tabela → FAQ). Muda o visual.
// Matemática = porte EXATO de Frontend/app/components/calculator/DividendYield.vue
// (3 modos: simples, on cost, projeção), na CalcDividendYieldSection. Path antigo preservado.

// A calculadora (estado, deep-links ?mode=&price=…&ticker=, as contas e os
// textos da análise) mora em components/calculadoras/dividend-yield/
// CalcDividendYieldSection.vue desde 21/10/2026, na frase.
//
// MODOS 'income' e 'target' (20/08/2026): o title desta página já é
// "Calculadora de Dividendos 2026: quanto você recebe por mês" desde a
// consolidação de canibalização de 03/08 — mas o número-herói era um
// PERCENTUAL nos três modos. A consulta que o title promete é de renda em
// reais, e a página respondia com uma métrica. Medida do Search Console
// (92 dias até 03/08) que justifica os dois modos novos:
//   simulador de dividendos          2.124 impr, pos 5,71
//   calculadora de dividendos mensais  413 impr, pos 6,48
//   simulador de dividendos mensais     61 impr, pos 5,23
//   calculadora de dividendos reinvestidos 93 impr, pos 2,69
// e o inverso ("quanto preciso pra viver de dividendos") é a página que
// investimentos.com.br ranqueia e a Redentia não tinha.
// Deliberadamente NÃO se criou /calculadora/dividendos: esta URL já carrega
// 2.527 impressões a 3,17% de CTR e o 03/08 consolidou o cluster aqui.
// URL nova re-dividiria o sinal que aquele commit acabou de juntar.
// CORREÇÃO (23/09/2026): as quatro linhas acima são da dimensão CONSULTA, sem
// página. Cruzadas com a página, essas impressões e posições eram da
// /calculadora/acoes; esta aqui aparecia na posição ~45. Os modos de renda
// ficam (respondem em reais, que é o que a pessoa pergunta), mas o cluster
// "calculadora/simulador de dividendos" é da acoes (bloco DONO DO CLUSTER lá).

// Data de atualização dinâmica (sinal de frescor — portado da página antiga).
const CONTENT_VERSION = '2026-10-20'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
const lastUpdatedISO = lastUpdated.toISOString()

// Cenários populares — long-tail SEO via deep-links (texto/URLs verbatim).
const popularScenarios = [
  // Cenários de RENDA primeiro: são a intenção que o title da página promete
  // ("quanto você recebe por mês") e as consultas de maior volume do cluster.
  { label: 'Quanto rende R$ 100 mil em dividendos', sub: 'Carteira mista a 8% de DY', to: '/calculadora/dividend-yield?mode=income&patrimonio=100000&dy=8&aporte=1000&anos=10' },
  { label: 'Quanto preciso pra viver de dividendos', sub: 'Meta de R$ 5.000 por mês', to: '/calculadora/dividend-yield?mode=target&renda=5000&dy=8&inicial=50000&aporte=1000' },
  { label: 'Quanto rende R$ 1 milhão em dividendos', sub: 'Renda mensal a 8% de DY', to: '/calculadora/dividend-yield?mode=income&patrimonio=1000000&dy=8&aporte=0&anos=10' },
  { label: 'Renda de R$ 10 mil por mês', sub: 'Patrimônio necessário e prazo', to: '/calculadora/dividend-yield?mode=target&renda=10000&dy=8&inicial=100000&aporte=3000' },
  { label: 'Dividendos mensais com FIIs', sub: 'R$ 100 mil a 10% de DY', to: '/calculadora/dividend-yield?mode=income&patrimonio=100000&dy=10&aporte=1000&anos=10' },
  { label: 'Primeira renda: R$ 1.000 por mês', sub: 'Começando do zero', to: '/calculadora/dividend-yield?mode=target&renda=1000&dy=8&inicial=0&aporte=1000' },
  { label: 'Dividendos reinvestidos por 20 anos', sub: 'R$ 50 mil + R$ 1.000/mês', to: '/calculadora/dividend-yield?mode=income&patrimonio=50000&dy=8&aporte=1000&anos=20' },
  { label: 'Aposentar com R$ 15 mil de dividendos', sub: 'Meta de longo prazo', to: '/calculadora/dividend-yield?mode=target&renda=15000&dy=8&inicial=200000&aporte=5000' },
  { label: 'DY de ITUB4', sub: 'Banco Itaú', to: '/calculadora/dividend-yield?ticker=ITUB4' },
  { label: 'DY de PETR4', sub: 'Petrobras', to: '/calculadora/dividend-yield?ticker=PETR4' },
  { label: 'DY de BBAS3', sub: 'Banco do Brasil', to: '/calculadora/dividend-yield?ticker=BBAS3' },
  { label: 'DY de TAEE11', sub: 'Taesa, transmissão', to: '/calculadora/dividend-yield?ticker=TAEE11' },
  { label: 'DY de KLBN11', sub: 'Klabin, papel & celulose', to: '/calculadora/dividend-yield?ticker=KLBN11' },
  { label: 'DY de ALOS3', sub: 'Allos, shoppings', to: '/calculadora/dividend-yield?ticker=ALOS3' },
  { label: 'DY de VALE3', sub: 'Vale, mineradora', to: '/calculadora/dividend-yield?ticker=VALE3' },
  { label: 'DY de BBDC4', sub: 'Bradesco', to: '/calculadora/dividend-yield?ticker=BBDC4' },
  { label: 'DY de CMIG4', sub: 'Cemig, energia', to: '/calculadora/dividend-yield?ticker=CMIG4' },
  { label: 'DY de TRPL4', sub: 'ISA Cteep, transmissão', to: '/calculadora/dividend-yield?ticker=TRPL4' },
  { label: 'DY de BRSR6', sub: 'Banrisul', to: '/calculadora/dividend-yield?ticker=BRSR6' },
  { label: 'DY on cost, comprou a R$ 20, vale R$ 30', sub: 'Exemplo clássico', to: '/calculadora/dividend-yield?purchase=20&current=30&div=1.50' },
  { label: 'DY de HGLG11', sub: 'CSHG Logística (FII tijolo)', to: '/calculadora/dividend-yield?ticker=HGLG11' },
  { label: 'DY de KNCR11', sub: 'Kinea Rendimentos (FII papel)', to: '/calculadora/dividend-yield?ticker=KNCR11' },
  { label: 'DY de SNLG11', sub: 'Suno Logística (FII high-yield)', to: '/calculadora/dividend-yield?ticker=SNLG11' },
  { label: 'DY de GGRC11', sub: 'GGR Covepi (FII logística)', to: '/calculadora/dividend-yield?ticker=GGRC11' },
  { label: 'DY de DIVD11', sub: 'Maxi Renda (FII alto yield)', to: '/calculadora/dividend-yield?ticker=DIVD11' },
]

// Média de DY por tipo de ativo (tabela verbatim).
const dyTableRows = [
  ['Ações Blue Chips', '4-8%', 'Bancos, energia, saneamento'],
  ['Ações Growth', '0-3%', 'Reinvestem lucro no crescimento'],
  ['FIIs Tijolo', '8-12%', 'Logística, lajes corporativas, shoppings'],
  ['FIIs Papel', '9-13%', 'CRIs, debêntures'],
  ['Small Caps', '2-6%', 'Foco em crescimento, DY menor'],
  ['ETFs de Dividendos', '6-9%', 'DIVO11, BOVA11 (parcial), FIND11, ETFs internacionais (MSTY com cuidado)'],
]

// Tributação hoje (lista verbatim, com strong via v-html local confiável).
const taxTodayItems = [
  '<strong>Dividendos de ações:</strong> isentos de IR pra pessoa física, sem limite de valor.',
  '<strong>JCP (Juros sobre Capital Próprio):</strong> 15% retidos na fonte, mas a empresa abate como despesa e paga menos IR corporativo, então no agregado costuma valer mais.',
  '<strong>FIIs (Fundos Imobiliários):</strong> dividendos isentos pra pessoa física desde que o FII tenha 50+ cotistas, seja listado em bolsa e o investidor possua menos de 10% das cotas.',
  '<strong>Ganho de capital (vender mais caro do que comprou):</strong> 15% sobre o lucro acima de R$ 20.000/mês de vendas (ações). 20% pra FIIs, sem isenção.',
]

const plChangesItems = [
  'Alíquota efetiva (atual proposta: 10%; pode subir até 15% no Senado).',
  'Faixa de isenção (atual proposta: R$ 50.000/mês; pode cair pra R$ 20.000 ou subir pra R$ 100.000).',
  'Vigência (provável 2027 se aprovado em 2026; o texto exige noventena + anualidade).',
  'Isenção pra FIIs e empresas tributadas pelo Simples Nacional permanece pelo texto atual, mas pode ser revisada em emendas.',
]

const fiiItems = [
  '<strong>FIIs de tijolo:</strong> investem em imóveis físicos (logística, lajes corporativas, shoppings, hospitais). DY típico 8-10%, valor da cota oscila com o ciclo imobiliário.',
  '<strong>FIIs de papel:</strong> investem em CRIs (Certificados de Recebíveis Imobiliários) e debêntures, recebem juros. DY típico 9-13%, mais correlacionado com Selic e CDI.',
]

// Como usar — steps 01-05 (títulos h4 + texto verbatim).
const howToSteps = [
  { title: 'Escolha o Ativo (ou Insira Valores Manualmente)', html: 'Busque por ticker (PETR4, ITUB4, TAEE11) na lista. A calculadora também aceita valores manuais, útil pra ações fora da B3 ou simulações hipotéticas.' },
  { title: 'Veja o DY Atual', html: 'Modo Simples mostra o DY anual com base no preço atual e dividendos dos últimos 12 meses. É o número que você vê em rankings de "melhores pagadoras de dividendos".' },
  { title: 'Calcule o DY On Cost', html: 'Modo On Cost compara o DY atual com o DY no seu preço de compra original. Mostra o "verdadeiro" retorno do investimento, separando dividendos de ganho de capital.' },
  { title: 'Projete o DY Futuro', html: 'Modo Projeção usa LPA, payout ratio e crescimento estimado do lucro pra prever o DY em 1 e 3 anos. Útil pra avaliar se a ação ainda compensa em horizonte longo.' },
  { title: 'Compare com a Média do Setor', html: 'Use a tabela de DY típico por categoria (blue chips, FIIs, growth) pra contextualizar o resultado. DY de 12% num blue chip pode ser sinal de risco, num FII de papel é normal.' },
]

const relatedRankings = [
  { to: '/ranking/maiores-dividend-yield', title: 'Maiores DY da B3', sub: 'Top 50 ações e FIIs por dividend yield' },
  { to: '/ranking/buy-and-hold', title: 'Buy and Hold (score 10)', sub: 'Carteira otimizada pra longo prazo' },
  { to: '/ranking/mais-baratas-bazin', title: 'Mais baratas pelo Bazin', sub: 'Desconto pelo método de Décio Bazin' },
]

// FAQs verbatim da página antiga (12). O FAQPage JSON-LD é emitido pelo
// NuFaqAccordion — fonte única, mesmo padrão do app antigo.
const faqItems = [
  // As 3 primeiras cobrem a intenção de RENDA (a que o title promete). Ficam
  // no topo porque o NuFaqAccordion abre a primeira por padrão e o Google
  // costuma puxar as primeiras entradas do FAQPage pro rich result.
  { q: 'Quanto rende R$ 100 mil em dividendos por mês?', a: 'Depende do dividend yield médio da carteira. A conta é Renda mensal = (Patrimônio × DY) ÷ 12. Com R$ 100.000 numa carteira a 8% de DY ao ano, são cerca de R$ 667 por mês. A 6%, R$ 500 por mês. A 10% (perfil mais carregado em FIIs), R$ 833 por mês. Esses números são ilustrativos: o DY de uma carteira real oscila conforme o payout das empresas e o preço das cotas, e dividendo não é contratual. Use o modo Renda mensal da calculadora acima pra rodar com o seu patrimônio e o seu yield.' },
  { q: 'Quanto preciso investir pra viver de dividendos?', a: 'Divida a renda anual desejada pelo dividend yield médio esperado: Patrimônio = (Renda mensal × 12) ÷ DY. Pra R$ 5.000 por mês a 8% de DY, são R$ 750.000. A 6%, R$ 1 milhão. A 10%, R$ 600.000. Duas ressalvas importantes: reserve uma margem de 15-20% acima do número, porque corte de payout numa pagadora derruba a renda sem aviso; e diversifique em 10-15 pagadoras pra reduzir o risco de depender de uma só. O modo Quanto preciso da calculadora mostra também em quanto tempo você chega lá com o seu aporte mensal.' },
  { q: 'A projeção considera a valorização das ações?', a: 'Não, e isso é proposital. A projeção aplica apenas o reinvestimento dos dividendos, usando a taxa mensal equivalente ao DY anual sobre o patrimônio acumulado mais os aportes. O preço da cota entra como constante. Projetar valorização transformaria a simulação em promessa de rendimento, e preço de ação não é previsível. O resultado é conservador de propósito: uma carteira de boas pagadoras tende a somar valorização a esse número no mundo real, mas também pode sofrer cortes de dividendo que a conta não antecipa.' },
  { q: 'Qual é um bom Dividend Yield?', a: 'Para ações: 4-8% é considerado bom no Brasil. Menos de 3% é baixo (típico de empresas growth). Acima de 10% levanta suspeitas, pode ser ação em forte queda ou dividendo extraordinário não recorrente. Para FIIs: 8-12% é a média histórica. FIIs de papel pagam mais (9-13%) que FIIs de tijolo (8-12%). Acima de 13% num FII, investigue se é sustentável (vacância alta, distribuição de receita não recorrente).' },
  { q: 'DY alto é sempre melhor?', a: 'Não. DY muito alto pode indicar três armadilhas: 1) Preço da ação caiu muito por algum problema na empresa (DY virou alto matematicamente, mas o ativo está em crise); 2) Dividendo extraordinário pontual que não vai se repetir (venda de ativo, distribuição de reserva); 3) Payout insustentável, empresa distribui mais do que deveria e vai cortar dividendo no próximo ciclo. Sempre verifique payout ratio, lucro recorrente e dívida líquida antes de comprar por DY alto.' },
  { q: 'O que é Payout Ratio e qual o ideal?', a: 'Payout é a porcentagem do lucro líquido que a empresa distribui em dividendos. Payout = (Dividendos ÷ Lucro Líquido) × 100. Para ações: 40-60% é o ideal (a empresa equilibra dividendos com reinvestimento no negócio). Para FIIs: 95% ou mais é obrigatório por lei (Lei 8.668/93). Payout acima de 80% em ação tradicional é um sinal de alerta, qualquer queda no lucro força um corte do dividendo.' },
  { q: 'Como projetar o Dividend Yield futuro?', a: 'Use a fórmula: DY Futuro = (LPA × Payout × (1 + Crescimento)^n) ÷ Preço Atual. Exemplo: ação a R$ 25, LPA de R$ 3, payout 50%, crescimento de 10% a.a. DY ano 1 = (3 × 1,1 × 0,5) ÷ 25 = 6,6%. DY ano 3 = (3 × 1,1³ × 0,5) ÷ 25 = 8%. DY ano 5 = (3 × 1,1⁵ × 0,5) ÷ 25 = 9,67%. Com crescimento consistente, o DY on cost dispara, é a "máquina de juros" do Bazin.' },
  { q: 'Dividendos têm imposto de renda no Brasil?', a: 'Atualmente, dividendos de ações e FIIs são isentos de IR para pessoa física, é um dos grandes atrativos do mercado brasileiro. Atenção a duas exceções: 1) JCP (Juros sobre Capital Próprio) tem 15% de IR retido na fonte, mas ainda compensa porque a empresa abate como despesa e paga menos IR corporativo; 2) ganho de capital (vender mais caro do que comprou) tem IR de 15% sobre o lucro acima de R$ 20 mil/mês de vendas. Reformas tributárias podem mudar isso, sempre verifique a legislação vigente.' },
  { q: 'Como ficará a tributação de dividendos a partir de 2026?', a: 'O PL 1.087/2025 propõe taxar dividendos pagos a pessoa física acima de R$ 50.000 por mês a 10% retidos na fonte. Investidores que recebem menos não seriam afetados. O PL foi aprovado na Câmara em 2025 e está sendo discutido no Senado. Se aprovado, a vigência mais provável é 2027. FIIs e dividendos pagos por empresas tributadas pelo Simples Nacional ficariam isentos pelo texto atual.' },
  { q: 'Qual a diferença entre FIIs de tijolo e FIIs de papel?', a: 'FIIs de tijolo investem em imóveis físicos (logística, lajes corporativas, shoppings, hospitais) e geram receita via aluguel. DY típico 8-10%, valor da cota oscila com o ciclo imobiliário. FIIs de papel investem em CRIs (Certificados de Recebíveis Imobiliários) e debêntures, recebem juros. DY típico 9-13%, mais correlacionado com Selic e CDI. Uma carteira diversificada costuma ter ambos.' },
  { q: 'Qual a diferença entre DY atual e DY on cost?', a: 'DY atual usa o preço de mercado de hoje. DY on cost usa o seu preço de compra. Exemplo: comprou ITUB4 a R$ 18 quando pagava R$ 1,20/ano. Hoje vale R$ 30 e paga R$ 1,80/ano. DY atual = 1,80÷30 = 6%. DY on cost = 1,80÷18 = 10%. O DY on cost é o seu retorno real e tende a crescer ao longo dos anos enquanto a empresa elevar dividendos. É a métrica que importa pra investidor de longo prazo.' },
  { q: 'DY de FII e DY de ação são comparáveis?', a: 'Em parte. Ambos calculam dividendos sobre preço, mas são instrumentos diferentes. FIIs distribuem aluguéis ou juros recebidos (pago mensalmente, payout ~95%). Ações distribuem parte do lucro corporativo (frequência variável, payout 30-60% típico). FII de papel se compara mais com renda fixa indexada (CDI, IPCA+), enquanto FII de tijolo se compara com aluguel real. Ações de blue chip pagadoras (Itaú, Cemig, Taesa) competem mais com FIIs no perfil de renda passiva. Use sempre DY líquido (após custos) e considere volatilidade.' },
  { q: 'Quantas ações de dividendos preciso pra viver de renda?', a: 'Depende do gasto mensal e DY médio da carteira. Fórmula: Patrimônio = (Gasto Anual ÷ DY líquido). Exemplo: gasto de R$ 8.000/mês = R$ 96.000/ano. Carteira com DY médio de 8% líquido = R$ 1,2 milhão de patrimônio. Se for DY 6% = R$ 1,6 milhão. Se for 10% = R$ 960 mil. Reserve uma margem de segurança (15-20%) pra inflação e cortes pontuais de dividendo. Diversifique em pelo menos 10-15 pagadoras pra reduzir risco específico.' },
  { q: 'Como o crescimento dos dividendos impacta o DY on cost no longo prazo?', a: 'É o multiplicador silencioso. Empresas que aumentam o dividendo todo ano em ~8-10% (ex: Taesa, Itaú histórico) dobram o pagamento a cada 7-9 anos. Comprou ITUB4 a R$ 18 em 2010 com DY 6% (R$ 1,08). Em 2024 paga ~R$ 2,80, DY on cost de 15,5%. Em 20 anos vira 25%+. Por isso o segredo é comprar boas empresas no preço certo e segurar décadas, não capturar DY pontual de 12% que não cresce.' },
  { q: 'Posso usar essa calculadora para qualquer ativo?', a: 'Sim, a fórmula DY = Dividendos ÷ Preço funciona pra qualquer ativo gerador de renda: ações brasileiras, FIIs, ETFs (cuidado com reinvestimento automático), BDRs (cota de empresa estrangeira), até REITs americanos. Para ETFs de dividendos (DIVO11, BOVA11), considere o yield distribuído líquido. Para investimentos no exterior, lembre da tributação local + tratado de bitributação. A calculadora cobre o caso brasileiro padrão; para outros mercados, ajuste o input manualmente.' },
]

// CANIBALIZAÇÃO, DESFEITA em 23/09/2026. Em 03/08 esta página assumiu
// "Calculadora de Dividendos" (e o H1 seguiu em 20/08) pra tomar o termo do
// guia /guias/calculadora-de-dividendos, com critério de reversão escrito
// antes: passar de 2.527 pra mais de 6.000 impressões/trimestre em 8 semanas.
// Não passou: 3.694 no trimestre até 20/09, de 0 a 4 cliques por semana, e
// posição 45–59 em "calculadora de dividendos". O diagnóstico de 03/08 olhou
// a página errada: por consulta × página, quem tinha o termo na posição ~6 até
// o cutover era a /calculadora/acoes, não o guia (que ficava em ~40). A
// dona do cluster agora é ela (bloco DONO DO CLUSTER em
// pages/calculadora/acoes.vue) e esta página volta pro termo dela, dividend
// yield. O title volta ao de antes de 03/08, como o critério mandava. O guia
// NÃO volta a "Calculadora de dividendos": seria o terceiro candidato ao
// mesmo termo; fica "Como calcular dividendos", intenção de artigo.
usePageSeo({
  title: 'Calculadora de Dividend Yield 2026 - Grátis',
  description:
    'Calcule o dividend yield atual, on cost e projetado de qualquer ação ou FII da B3, e quanto a carteira paga por mês em reais. Tributação 2026. Grátis.',
  path: '/calculadora/dividend-yield',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadoras' },
    { name: 'Dividend Yield', path: '/calculadora/dividend-yield' },
  ],
  structuredData: [
    {
      '@type': 'WebApplication',
      name: 'Calculadora de Dividend Yield Redentia',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      dateModified: lastUpdatedISO,
      description:
        'Calculadora gratuita de dividend yield com 5 modos: renda mensal em reais, patrimônio necessário pra viver de dividendos, DY simples, DY on cost e projeção de DY. Cobre ações e FIIs da B3 com pré-seleção via URL.',
      featureList: [
        'Renda mensal de dividendos em reais a partir do patrimônio e do DY',
        'Patrimônio necessário pra viver de dividendos (conta inversa)',
        'Projeção de renda com dividendos reinvestidos e aporte mensal',
        'DY atual com preço e dividendos reais do ticker (deep-link)',
        'DY on cost (rentabilidade sobre o preço de compra)',
        'Projeção de DY em 1 e 3 anos via LPA + payout + crescimento',
        'Análise automática (DY baixo / bom / excelente / suspeito)',
        'Cenários populares pré-preenchidos via URL (deep-link)',
        'Compatível com BDRs, ETFs e REITs (input manual)',
        // Era "Sem cadastro, sem propaganda, gratuito". featureList é a lista de
        // FUNCIONALIDADES do dado estruturado, não slot de argumento de venda:
        // ausência de cadastro não é feature, e ocupava uma das 9 vagas que o
        // Google lê pra entender o que a ferramenta faz.
        'Dividend yield atual, on cost e projetado',
      ],
    },
    // FAQPage schema é emitido pelo NuFaqAccordion via useHead — fonte única.
  ],
})
</script>

<template>
  <div>
    <!-- ============ Topo e conta na primeira tela (dono, 21/10/2026: "inspirado na Apple") ============ -->
    <!-- H1 alinhado ao title: os dois dizem "Calculadora de Dividend Yield"
         desde 23/09 (o bloco CANIBALIZAÇÃO acima conta por quê), por isso este
         h1 segue com o nome da calculadora, sem virar pergunta como os outros.
         "Calculadora de dividendos" é o termo da /calculadora/acoes. -->
    <CalcTopo desc="Escolha a conta e mude os números na frase. Em reais ou em percentual, de qualquer ação ou FII.">
      Calculadora de dividend yield de ações e FIIs
    </CalcTopo>

    <!-- ============ Calculadora na frase ============ -->
    <CalcDividendYieldSection section-id="dy" />

    <!-- eyebrow antigo + chips + atualizado (saíram do hero, texto preservado) -->
    <CalcMetaStrip
      label="Calculadora · Dividend Yield"
      :chips="['100% gratuito', 'Renda mensal em reais', 'Ações e FIIs', 'DY on cost + projeção']"
      :updated="lastUpdatedText"
    />

    <!-- a seção de CTA logo depois da conta e das tags (dono, 21/10/2026) -->
    <CalcFaixaCta
      compacta
      titulo="Veja como essa conta se adapta à sua vida."
      texto="Com a conta grátis da Redentia, você guarda as suas contas, conecta a carteira e vê tudo com os seus números de verdade."
      :primario="{ label: 'Criar conta grátis', to: '/login' }"
      :secundario="{ label: 'Ver mais calculadoras', to: '/calculadoras' }"
    />

    <!-- ============ Cenários populares (deep-links, texto verbatim) ============ -->
    <CalcBand tone="cream" title="Cenários populares de dividend yield">
      <template #dek>
        <p>Veja na hora o DY dos ativos mais buscados e os cenários on cost mais comuns. Basta clicar e a calculadora carrega já preenchida.</p>
      </template>
      <div class="dy__scenarios">
        <NuxtLink v-for="s in popularScenarios" :key="s.label" :to="s.to" class="dy__scenario">
          <span class="dy__scenario-label">{{ s.label }}</span>
          <span class="dy__scenario-sub">{{ s.sub }}</span>
        </NuxtLink>
      </div>
    </CalcBand>

    <!-- ============ Conteúdo educacional (texto verbatim, bandas do design) ============ -->
    <CalcSplit tone="white">
      <template #title>Simulador de dividend yield grátis e online</template>
      <div class="dy__prose">
        <!-- 1º parágrafo = lead de SEO que saiu do hero compacto (verbatim) -->
        <p>Dividend Yield (DY) é o percentual de dividendos pagos em relação ao preço da ação: <strong>DY = (Dividendos Anuais ÷ Preço) × 100</strong>. Exemplo: ITUB4 a R$ 28,00 com R$ 1,80 anual tem DY de 6,4%. Considerado bom: 4-8% para ações, 8-12% para FIIs. Esta calculadora mostra DY atual, projetado e on cost (no seu preço de compra).</p>
        <p>Use a calculadora acima para simular o DY de qualquer ação ou FII da B3 em segundos. Ideal pra comparar pagadoras antes de montar a carteira de renda passiva.</p>
      </div>
    </CalcSplit>

    <!-- ============ Modos de renda: a conta em reais (SEO do cluster
         "calculadora de dividendos mensais" / "quanto preciso pra viver de
         dividendos") ============ -->
    <CalcSplit tone="cream">
      <template #title>Quanto você recebe de dividendos por mês</template>
      <template #dek>
        <p>O dividend yield responde em percentual, mas a pergunta de quem investe pra renda é em reais: quanto cai na conta todo mês. Os modos <strong>Renda mensal</strong> e <strong>Quanto preciso</strong> da calculadora fazem as duas pontas dessa conta.</p>
      </template>
      <div class="dy__formula-block">
        <CalcFormulaCard
          tone="white"
          :terms="[
            { sym: 'Patrimônio', desc: 'total investido em ações e FIIs pagadores' },
            { sym: 'DY médio', desc: 'dividend yield ponderado da carteira, ao ano' },
          ]"
        >Renda mensal = (Patrimônio × DY) ÷ 12</CalcFormulaCard>
        <div class="dy__formula-example">
          <p><strong>Exemplo ilustrativo:</strong> R$ 100.000 numa carteira com DY médio de 8% ao ano</p>
          <p class="dy__formula-accent">Renda = (100.000 × 0,08) ÷ 12 = R$ 666,67 por mês</p>
        </div>
      </div>
      <div class="dy__prose dy__prose--mt">
        <p>A conta inversa é a que responde "quanto preciso pra viver de dividendos": divida a renda anual que você quer pelo DY médio esperado. Pra R$ 5.000 por mês (R$ 60.000 por ano) a 8% de DY, o patrimônio necessário é de R$ 750.000. A 6%, sobe pra R$ 1 milhão. A 10%, cai pra R$ 600.000. O yield que você assume muda a meta em centenas de milhares de reais, e é por isso que ele é um slider e não um número fixo.</p>
      </div>
    </CalcSplit>

    <CalcSplit tone="white" title-tag="h3" size="sm">
      <template #title>Dividendos reinvestidos: como a projeção é feita</template>
      <div class="dy__prose">
        <p>Quando você reinveste os dividendos, cada pagamento compra mais cotas, que passam a pagar dividendos também. A projeção da calculadora aplica a taxa mensal equivalente ao DY anual, <strong>(1 + DY)<sup>1/12</sup> − 1</strong>, sobre o patrimônio acumulado mais os aportes do período.</p>
        <p>Uma escolha deliberada: a projeção considera <strong>apenas o reinvestimento dos dividendos</strong>. A valorização da cota não entra na conta. Projetar valorização transformaria a simulação em promessa de rendimento, e o preço de uma ação não é previsível. O número que sai é conservador de propósito: no mundo real, uma carteira de boas pagadoras tende a somar valorização a esse resultado, mas também pode ter cortes de dividendo que a conta não antecipa.</p>
        <p>Duas coisas que a calculadora não desconta e você deve considerar: JCP tem 15% de imposto retido na fonte (dividendos e rendimentos de FII são isentos pra pessoa física hoje), e o DY médio de uma carteira real oscila ano a ano conforme o payout das empresas.</p>
      </div>
    </CalcSplit>

    <CalcSplit tone="cream">
      <template #title>O que é Dividend Yield?</template>
      <div class="dy__prose">
        <p>Dividend Yield (DY) é um indicador que mostra quanto uma empresa paga em dividendos em relação ao preço da ação. É expresso em porcentagem anual e é fundamental para quem investe buscando renda passiva.</p>
      </div>
      <div class="dy__formula-block">
        <CalcFormulaCard tone="white">Dividend Yield = (Dividendos Anuais ÷ Preço da Ação) × 100</CalcFormulaCard>
        <div class="dy__formula-example">
          <p><strong>Exemplo:</strong> Ação custa R$ 25 e paga R$ 1,50/ano em dividendos</p>
          <p class="dy__formula-accent">DY = (1,50 ÷ 25) × 100 = 6% ao ano</p>
        </div>
      </div>
    </CalcSplit>

    <CalcSplit tone="white" title-tag="h3" size="sm">
      <template #title>DY On Cost, O Verdadeiro Retorno</template>
      <div class="dy__prose">
        <p>DY on cost é o dividend yield calculado sobre o seu preço de compra, não o preço atual. Se você comprou uma ação por R$ 20 e ela vale R$ 30 hoje, mas continua pagando R$ 1,50 de dividendo, seu DY on cost é 7,5% (1,50÷20), não 5% (1,50÷30).</p>
        <p>Este é o conceito mais importante para investidores de dividendos. Com o tempo, conforme os dividendos crescem e você mantém seu preço de compra baixo, seu DY on cost pode chegar a 10%, 15% ou até 20% ao ano, é a chamada "máquina de juros" defendida por Décio Bazin e Luiz Barsi.</p>
      </div>
    </CalcSplit>

    <CalcBand tone="cream" title="Média de DY por Tipo de Ativo">
      <div class="dy__band-body">
        <CalcTableCard
          :columns="['Tipo de Ativo', 'DY Típico', 'Observações']"
          :rows="dyTableRows"
          :accent-col="1"
        />
      </div>
    </CalcBand>

    <CalcSplit tone="white">
      <template #title>Tributação de Dividendos no Brasil (Lei e Mudanças 2026)</template>
      <template #dek>
        <p>A tributação de dividendos no Brasil sempre foi um diferencial competitivo: dividendos pagos por empresas listadas a pessoa física são isentos de Imposto de Renda. Essa regra está em discussão no Congresso desde 2025 e pode mudar nos próximos anos. Entender o cenário atual e o que está em tramitação ajuda você a planejar a carteira de dividendos sem ser pego de surpresa.</p>
      </template>
      <template #left>
        <h3 class="dy__sub">Como funciona hoje (até 2025 / 2026)</h3>
      </template>
      <div class="dy__tile">
        <ul class="dy__list">
          <!-- conteúdo local confiável (strong) — eslint-disable-next-line vue/no-v-html -->
          <li v-for="(item, i) in taxTodayItems" :key="i" v-html="item" />
        </ul>
      </div>
    </CalcSplit>

    <CalcSplit tone="cream" title-tag="h3" size="sm">
      <template #title>O que pode mudar (PL 1.087/2025)</template>
      <template #dek>
        <p>O Projeto de Lei 1.087/2025 propõe taxar dividendos pagos a pessoa física acima de R$ 50.000 por mês a 10% retidos na fonte. Pra investidor médio (R$ 5.000 a R$ 10.000/mês de dividendos), a probabilidade de ser afetado é baixa. O PL foi aprovado na Câmara em 2025 e está em apreciação no Senado em 2026. Caso aprovado sem grandes alterações, a vigência mais provável é 2027.</p>
      </template>
      <div class="dy__tile">
        <h4 class="dy__h4 dy__h4--accent">O que pode mudar no texto final</h4>
        <ul class="dy__list">
          <li v-for="(item, i) in plChangesItems" :key="i">{{ item }}</li>
        </ul>
      </div>
      <div class="dy__prose dy__prose--mt">
        <p>Recomendação prática: planeje como se fosse implementar pra não ser pego de surpresa. Concentre parte da carteira em FIIs (isenção mantida), monitore o trâmite no Congresso e tenha em mente que mudanças tributárias do gênero costumam ser graduais (alíquota crescente, faixa de isenção, transição plurianual).</p>
      </div>
    </CalcSplit>

    <CalcSplit tone="white" title-tag="h3" size="sm">
      <template #title>FIIs com Dividendos Mensais</template>
      <template #dek>
        <p>FIIs (Fundos de Investimento Imobiliário) são o veículo preferido de quem busca dividendos mensais e isenção de IR no Brasil. Por lei, distribuem 95% ou mais do lucro do fundo, geralmente todo mês (até o dia 25). Existem dois grandes blocos com perfis distintos.</p>
      </template>
      <div class="dy__tile">
        <ul class="dy__list">
          <!-- conteúdo local confiável (strong) — eslint-disable-next-line vue/no-v-html -->
          <li v-for="(item, i) in fiiItems" :key="i" v-html="item" />
        </ul>
        <p class="dy__card-p dy__card-p--mt">
          Exemplos com track record consistente: HGLG11 (logística), KNCR11 (papel), MXRF11 (papel), VISC11 (shoppings), HSML11 (shoppings), GGRC11 (logística), DIVD11 (paga DY+ alto), SNLG11 (papel high-yield). Uma carteira diversificada de renda passiva costuma combinar tijolo (proteção real e estabilidade) com papel (yield maior e menor exposição ao ciclo imobiliário).
        </p>
      </div>
    </CalcSplit>

    <!-- ============ Como usar (anatomia EXATA do design: banda creme + card branco de steps) ============ -->
    <CalcBand tone="cream" title="Como Usar a Calculadora de Dividend Yield">
      <div class="dy__band-body"><CalcSteps :steps="howToSteps" /></div>
    </CalcBand>

    <!-- ============ FAQ (anatomia EXATA do design: banda creme, cards brancos, pill IA) ============ -->
    <CalcSplit tone="cream" wide>
      <template #title>Perguntas Frequentes sobre Dividend Yield</template>
      <template #left>
        <NuxtLink to="/busca" class="dy__pill">Perguntar à Redentia AI</NuxtLink>
      </template>
      <NuFaqAccordion :items="faqItems" surface="white" />
    </CalcSplit>

    <!-- ============ Termos do glossário (link interno — ver o cabeçalho de
         CalcGlossaryLinks.vue pro número que motivou) ============ -->
    <CalcBand tone="white" title="Termos usados neste cálculo">
      <template #dek>
        <p>O que cada conceito da calculadora significa, explicado em uma página só.</p>
      </template>
      <div class="dy__band-body">
        <CalcGlossaryLinks :slugs="['dividend-yield', 'proventos', 'payout', 'jscp', 'fii', 'fundos-tijolo', 'fundos-papel', 'come-cotas']" />
      </div>
    </CalcBand>

    <!-- ============ Rankings + outras ferramentas + E-E-A-T + CTA ============ -->
    <CalcBand tone="cream" title="Rankings Relacionados">
      <template #dek>
        <p>Explore listas atualizadas diariamente com os melhores ativos da B3 para complementar sua análise.</p>
      </template>
      <div class="dy__grid-cards">
        <NuxtLink v-for="r in relatedRankings" :key="r.to" :to="r.to" class="dy__card-link">
          <h3 class="dy__card-link-title">{{ r.title }}</h3>
          <p class="dy__card-p">{{ r.sub }}</p>
        </NuxtLink>
      </div>
    </CalcBand>

    <CalcBand tone="white" title="Outras Ferramentas">
      <div class="dy__grid-cards">
        <!-- A dona de "calculadora/simulador de dividendos" (bloco DONO DO
             CLUSTER em pages/calculadora/acoes.vue), com a âncora dela. -->
        <NuxtLink to="/calculadora/acoes" class="dy__card-link">
          <h3 class="dy__card-link-title">Simulador de Dividendos</h3>
          <p class="dy__card-p">Quanto uma ação teria rendido com dividendos reinvestidos</p>
        </NuxtLink>
        <NuxtLink to="/calculadora/planejamento" class="dy__card-link">
          <h3 class="dy__card-link-title">Planejamento Patrimonial</h3>
          <p class="dy__card-p">Carteira com foco em dividendos</p>
        </NuxtLink>
        <NuxtLink to="/calculadora/preco-teto" class="dy__card-link">
          <h3 class="dy__card-link-title">Preço Teto</h3>
          <p class="dy__card-p">Veja se a ação está barata</p>
        </NuxtLink>
      </div>

      <aside class="dy__eeat">
        <p class="dy__eeat-title">Metodologia revisada pela equipe de análise da Redentia</p>
        <p class="dy__eeat-p">
          Cálculos baseados nas fórmulas clássicas de avaliação por dividendos (DY = Dividendos ÷ Preço, DY on cost = Dividendos ÷ Preço de Compra) e referenciam a metodologia de Décio Bazin e Luiz Barsi para análise de pagadoras de dividendos no mercado brasileiro. Os tickers exibidos vêm da B3 em tempo real via API oficial.
        </p>
        <p class="dy__eeat-small">
          Fontes: <a href="https://www.b3.com.br" target="_blank" rel="noopener nofollow" class="dy__link">B3 (Brasil, Bolsa, Balcão)</a>,
          <a href="https://www.cvm.gov.br" target="_blank" rel="noopener nofollow" class="dy__link">CVM</a>,
          <a href="https://www.bcb.gov.br" target="_blank" rel="noopener nofollow" class="dy__link">Banco Central do Brasil</a>.
        </p>
      </aside>
    </CalcBand>

    <!-- a faixa azul de ponta a ponta, fora da última faixa de texto (dono, 21/10/2026) -->
    <CalcFaixaCta
      titulo="Encontre as melhores pagadoras de dividendos"
      texto="Compare dividend yield de todas as ações e FIIs da B3 em tempo real."
      :primario="{ label: 'Ver ranking de dividendos', to: '/ranking/maiores-dividend-yield' }"
      :secundario="{ label: 'Criar conta grátis', to: '/login' }"
    />
  </div>
</template>

<style scoped>
/* ——— tipografia compartilhada (classes do exemplar jc__, mesmos valores) ——— */
.dy__h4 { margin: 0 0 8px; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; letter-spacing: -.2px; }
.dy__h4--accent { color: var(--nu-blue); }
.dy__link { text-decoration: underline; }
.dy__link:hover { color: var(--nu-blue); }

/* ——— prosa da coluna direita (bandas split do design) ——— */
.dy__prose p {
  margin: 0 0 16px; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: 500;
  line-height: 1.7;
}
.dy__prose p:last-child { margin-bottom: 0; }
.dy__prose strong { color: var(--nu-ink); font-weight: 800; }
.dy__prose--mt { margin-top: 18px; }

/* ——— sub-heading dentro da coluna esquerda do split ——— */
.dy__sub { margin: clamp(24px, 3vw, 34px) 0 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -.3px; }

/* ——— corpo de banda centrada (card 1080 do design) ——— */
.dy__band-body { margin-top: clamp(30px, 4vw, 48px); }

/* ——— cenários populares ——— */
.dy__scenarios {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px; margin-top: clamp(24px, 3.5vw, 36px);
}
.dy__scenario {
  background: var(--nu-white); border-radius: var(--nu-r-tile); padding: 16px 18px;
  display: flex; flex-direction: column; gap: 3px;
  transition: transform .18s, box-shadow .2s;
}
.dy__scenario:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.dy__scenario-label { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; letter-spacing: -.1px; }
.dy__scenario-sub { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; }

/* ——— tiles (cards do conteúdo; creme em banda branca, branco em banda creme) ——— */
.dy__tile { background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 24px; }
:global(.cbd--cream) .dy__tile,
:global(.csp--cream) .dy__tile { background: var(--nu-white); }
.dy__card-p { margin: 6px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.6; }
.dy__card-p--mt { margin-top: 12px; }
.dy__list { margin: 8px 0 0; padding-left: 18px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.7; }
.dy__list li + li { margin-top: 8px; }
.dy__list :deep(strong) { color: var(--nu-ink); font-weight: 800; }

/* ——— fórmula (exemplo centrado abaixo do card) ——— */
.dy__formula-block { margin-top: 22px; }
.dy__formula-example { margin-top: 14px; text-align: center; }
.dy__formula-example p { margin: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6; }
.dy__formula-example p strong { color: var(--nu-ink); font-weight: 800; }
.dy__formula-accent { color: var(--nu-blue) !important; font-weight: 700 !important; margin-top: 4px !important; font-variant-numeric: tabular-nums; }

/* ——— cards-link (rankings / outras ferramentas) ——— */
.dy__grid-cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 16px; margin-top: clamp(30px, 4vw, 48px);
  /* 1080 cabe os 3 cards (3 × 320 + gaps) numa linha só */
  max-width: 1080px; margin-left: auto; margin-right: auto;
}
.dy__card-link {
  background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 26px;
  display: flex; flex-direction: column; gap: 6px;
  transition: transform .18s, box-shadow .2s;
}
:global(.cbd--cream) .dy__card-link { background: var(--nu-white); }
.dy__card-link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.dy__card-link-title { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -.2px; }

/* ——— pills / E-E-A-T / CTA ——— */
.dy__pill {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: var(--nu-fs-md); font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.dy__pill:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.dy__eeat {
  background: var(--nu-white); border-radius: var(--nu-r-card-lg);
  padding: clamp(24px, 3vw, 36px); margin: clamp(44px, 6vw, 72px) auto 0; max-width: 980px;
}
.dy__eeat-title { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; }
.dy__eeat-p { margin: 10px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.65; }
.dy__eeat-small { margin: 12px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.6; }
</style>
