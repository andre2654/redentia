<script setup lang="ts">
// /calculadora/juros-compostos/[scenario] — landing pages long-tail (PR10).
// Porte verbatim dos 4 cenários da página antiga
// (Frontend/app/pages/calculadora/juros-compostos/[scenario].vue): h1,
// answer-first, blocos educacionais, FAQ e related — mesma ordem de tags.
// Visual Nu (hero creme + calculadora do design pré-preenchida via seed,
// sem redirect de query como no app antigo). Path antigo mantido (URL equity).

interface ScenarioFaq { q: string; a: string }
interface ScenarioBadge { label: string; color?: string }
interface ScenarioBlock { h3: string; paragraphs: string[] }
interface ScenarioConfig {
  h1: string
  title: string
  metaDescription: string
  answerFirst: string
  preview: string
  badges: ScenarioBadge[]
  inputs: { initial: number; monthly: number; rate: number; years: number }
  eduH2: string
  eduBlocks: ScenarioBlock[]
  faq: ScenarioFaq[]
  related: string[]
}

const baseBadges: ScenarioBadge[] = [
  { label: '100% gratuito', color: 'var(--nu-green)' },
  { label: 'Cálculo instantâneo' },
  { label: 'Gráfico mês a mês' },
  { label: 'Link compartilhável' },
]

const scenarios: Record<string, ScenarioConfig> = {
  '500-reais-por-mes': {
    h1: 'Quanto Rende R$ 500 por Mês em Juros Compostos?',
    title: 'Quanto Rende R$ 500 por Mês em 20 Anos?',
    metaDescription: 'Investindo R$ 500/mês a 10,5% a.a. você acumula R$ 410 mil em 20 anos e R$ 1,12 milhão em 30 anos. Calcule grátis.',
    answerFirst:
      'Investindo R$ 500 por mês a 10,5% ao ano (média histórica do CDI), você acumula aproximadamente R$ 410 mil em 20 anos, sendo R$ 120 mil de aportes e R$ 290 mil só de juros. Em 30 anos, sobe para R$ 1,12 milhão. A fórmula é M = P × [((1+i)ⁿ - 1) / i], onde P é o aporte, i a taxa mensal e n os meses. Esta página simula exatamente esse cenário com gráfico mês a mês.',
    preview: 'R$ 500/mês a 10,5% rende R$ 410 mil em 20 anos.',
    badges: baseBadges,
    inputs: { initial: 0, monthly: 500, rate: 10.5, years: 20 },
    eduH2: 'Investir R$ 500 por mês: análise completa',
    eduBlocks: [
      {
        h3: 'Por que R$ 500 por mês é o aporte mais simulado do Brasil',
        paragraphs: [
          'R$ 500/mês é o ponto de equilíbrio onde alguém com salário entre R$ 3 mil e R$ 6 mil consegue investir sem comprometer o orçamento. Equivale a 10-15% da renda, faixa recomendada pela regra 50/30/20 de finanças pessoais. Por isso é o cenário mais procurado em buscas como "quanto rende 500 reais por mês" ou "investir 500 reais".',
          'A 10,5% ao ano (próximo da Selic atual e do CDI), o resultado em prazos diferentes mostra o efeito exponencial dos juros compostos: R$ 38 mil em 5 anos, R$ 102 mil em 10 anos, R$ 410 mil em 20 anos e R$ 1,12 milhão em 30 anos. Note como triplicar o tempo (de 10 para 30 anos) multiplica o resultado por mais de 10x.',
        ],
      },
      {
        h3: 'Onde investir R$ 500 por mês com 10,5% líquido',
        paragraphs: [
          'Para alcançar essa rentabilidade média, considere uma carteira diversificada: 50% em Tesouro Selic ou CDB de bancos médios (rende ~CDI), 25% em Tesouro IPCA+ (proteção de longo prazo), 15% em fundos imobiliários (FIIs) e 10% em ações de dividendos. Aportes automáticos via débito programado garantem disciplina e aproveitam o efeito custo médio.',
          'Lembre que R$ 500/mês investidos durante 30 anos dá R$ 180 mil em aportes, mas R$ 1,12 milhão de patrimônio. O que faz a diferença não é o valor do aporte, é o tempo. Quem começa aos 25 e investe R$ 500/mês até os 65 acumula 3x mais que quem começa aos 35 com o mesmo aporte.',
        ],
      },
    ],
    faq: [
      { q: 'Quanto rende R$ 500 por mês em 5 anos?', a: 'A 10,5% ao ano, R$ 500/mês durante 5 anos viram aproximadamente R$ 38.700, sendo R$ 30 mil de aportes e R$ 8.700 de juros. Em 5 anos os juros compostos ainda são modestos (multiplicador 1,29x), o efeito acelera depois dos 10 anos.' },
      { q: 'Quanto rende R$ 500 por mês em 10 anos?', a: 'A 10,5% ao ano, R$ 500/mês durante 10 anos rendem R$ 102 mil, sendo R$ 60 mil em aportes e R$ 42 mil em juros. Aqui já se vê o efeito bola de neve, os juros equivalem a 70% dos aportes.' },
      { q: 'Quanto rende R$ 500 por mês em 20 anos?', a: 'A 10,5% ao ano, R$ 500/mês durante 20 anos rendem aproximadamente R$ 410 mil. Os juros (R$ 290 mil) já superam os aportes (R$ 120 mil) em mais de 2x, o que é a marca do efeito composto bem desenvolvido.' },
      { q: 'Quanto rende R$ 500 por mês em 30 anos?', a: 'A 10,5% ao ano, R$ 500/mês durante 30 anos rendem aproximadamente R$ 1,12 milhão. Os aportes totais são R$ 180 mil, ou seja, mais de R$ 940 mil vieram só de juros sobre juros, exemplo perfeito do crescimento exponencial.' },
      { q: 'É melhor R$ 500/mês ou R$ 6 mil de uma vez por ano?', a: 'Mensal rende mais. Embora o total anual seja igual, R$ 500/mês começa rendendo desde janeiro, enquanto R$ 6 mil em dezembro perde 11 meses de juros. Em 20 anos a 10,5% a.a., a diferença chega a 5-7% no patrimônio final.' },
    ],
    related: ['1000-reais-por-mes', 'aposentar-com-1-milhao', '100-mil-em-5-anos'],
  },

  '1000-reais-por-mes': {
    h1: 'Quanto Rende R$ 1.000 por Mês em Juros Compostos?',
    title: 'Quanto Rende R$ 1.000 por Mês em 20 Anos?',
    metaDescription: 'Investindo R$ 1.000/mês a 10,5% a.a. você acumula R$ 820 mil em 20 anos e R$ 2,24 milhões em 30 anos. Calcule grátis.',
    answerFirst:
      'Investindo R$ 1.000 por mês a 10,5% ao ano, você acumula aproximadamente R$ 820 mil em 20 anos, sendo R$ 240 mil de aportes e R$ 580 mil só de juros. Em 30 anos, sobe para R$ 2,24 milhões, suficiente para uma renda passiva de R$ 9 mil/mês pela regra dos 4%. A fórmula é M = P × [((1+i)ⁿ - 1) / i], com P = aporte, i = taxa mensal, n = meses. Simulação completa abaixo com gráfico interativo.',
    preview: 'R$ 1.000/mês a 10,5% rende R$ 820 mil em 20 anos.',
    badges: baseBadges,
    inputs: { initial: 0, monthly: 1000, rate: 10.5, years: 20 },
    eduH2: 'Investir R$ 1.000 por mês: o caminho da independência financeira',
    eduBlocks: [
      {
        h3: 'R$ 1.000 por mês: o aporte que muda o jogo',
        paragraphs: [
          'R$ 1.000/mês é o aporte que separa "investir por hábito" de "construir patrimônio relevante". Para quem ganha entre R$ 5 mil e R$ 10 mil, equivale a 10-20% da renda, dentro da faixa recomendada pela regra 50/30/20. Em 20 anos a 10,5% a.a., R$ 1.000/mês entrega R$ 820 mil, suficiente para complementar aposentadoria com R$ 3.300/mês de renda passiva pela regra dos 4%.',
          'O salto entre R$ 500 e R$ 1.000/mês é mais que o dobro no resultado final, é exatamente o dobro porque o cálculo é linear no aporte. Mas o impacto psicológico é maior: dobra a velocidade até qualquer meta, divide pela metade o tempo até R$ 1 milhão.',
        ],
      },
      {
        h3: 'Como organizar a carteira para R$ 1.000/mês',
        paragraphs: [
          'Com R$ 1.000/mês cabe diversificação real, sem comprar fração ridícula de cada classe. Sugestão: R$ 400 em Tesouro IPCA+ ou CDB acima de 110% CDI, R$ 300 em FIIs (HGLG11, KNRI11, MXRF11 cobrem logística, lajes corporativas e papel), R$ 200 em ações pagadoras de dividendos (TAEE11, ITSA4) ou ETF dividendos (DIVO11) e R$ 100 em ETF amplo (BOVA11 ou IVVB11) para exposição internacional.',
          'Se você reinvestir todos os dividendos e proventos (em vez de gastar), o retorno efetivo sobe para 11-12% a.a. e o patrimônio em 20 anos chega a R$ 950 mil. Pequenas decisões de gestão fazem diferença gigante no longo prazo, e o reinvestimento é a mais barata e poderosa delas.',
        ],
      },
    ],
    faq: [
      { q: 'Quanto rende R$ 1.000 por mês em 10 anos?', a: 'A 10,5% ao ano, R$ 1.000/mês durante 10 anos rendem aproximadamente R$ 205 mil, sendo R$ 120 mil em aportes e R$ 85 mil em juros. Já é um valor que dá entrada em imóvel ou compõe reserva substancial.' },
      { q: 'Quanto rende R$ 1.000 por mês em 20 anos?', a: 'A 10,5% ao ano, R$ 1.000/mês durante 20 anos rendem aproximadamente R$ 820 mil. Os juros sozinhos (R$ 580 mil) representam 71% do patrimônio final, demonstração clara do efeito composto.' },
      { q: 'R$ 1.000 por mês dá pra aposentar?', a: 'Em 30 anos a 10,5% a.a., R$ 1.000/mês acumula R$ 2,24 milhões. Pela regra dos 4%, isso gera R$ 7.500/mês de renda passiva, equivalente a aposentadoria classe média confortável. Combinado com INSS, vira R$ 9-12 mil/mês.' },
      { q: 'Em quantos anos R$ 1.000 por mês vira R$ 1 milhão?', a: 'A 10,5% ao ano, R$ 1.000/mês atinge R$ 1 milhão em aproximadamente 22 anos. Aumentando a taxa para 12% a.a. (carteira mais agressiva), cai para 20 anos. Aumentando o aporte para R$ 1.300/mês a 10,5%, atinge em 20 anos.' },
      { q: 'É melhor R$ 1.000/mês ou R$ 12 mil no fim do ano?', a: 'Mensal sempre rende mais. R$ 1.000 em janeiro tem 11 meses a mais de juros que R$ 12 mil em dezembro. Em 20 anos, a diferença chega a 6-8% (cerca de R$ 50-65 mil) só pela ordem dos aportes, com mesmo total investido.' },
    ],
    related: ['500-reais-por-mes', 'aposentar-com-1-milhao', 'dobrar-dinheiro-regra-72'],
  },

  'aposentar-com-1-milhao': {
    h1: 'Como Juntar R$ 1 Milhão Investindo por Mês',
    title: 'Como Juntar R$ 1 Milhão Investindo Mensalmente',
    metaDescription: 'Para juntar R$ 1 milhão em 20 anos a 10,5% a.a. invista R$ 1.300/mês. Em 30 anos cai para R$ 450/mês. Simule grátis.',
    answerFirst:
      'Para acumular R$ 1 milhão em 20 anos a 10,5% ao ano, você precisa investir R$ 1.300 por mês. Em 30 anos, o aporte cai para R$ 450/mês, diferença gigante por causa do efeito composto. Em 10 anos, exige R$ 4.825/mês. Esta página simula exatamente o cenário de 20 anos, mas você pode ajustar o prazo direto na calculadora abaixo. Cada década adicionada divide o aporte exigido em quase 50%.',
    preview: 'R$ 1 milhão em 20 anos exige R$ 1.300/mês a 10,5%.',
    badges: baseBadges,
    inputs: { initial: 0, monthly: 1300, rate: 10.5, years: 20 },
    eduH2: 'Construir R$ 1 milhão: aporte vs prazo',
    eduBlocks: [
      {
        h3: 'O efeito do prazo na meta de R$ 1 milhão',
        paragraphs: [
          'R$ 1 milhão é a meta psicológica mais comum no Brasil porque marca o limiar entre "investidor amador" e "patrimônio relevante". O insight crítico: quanto mais cedo você começar, menor o aporte. Em 10 anos, exige R$ 4.825/mês. Em 15 anos, R$ 2.404/mês. Em 20 anos, R$ 1.300/mês. Em 25 anos, R$ 745/mês. Em 30 anos, apenas R$ 450/mês. Cada década reduz o aporte em ~50%.',
          'Esse comportamento exponencial vem dos juros compostos. Quanto mais tempo o dinheiro fica investido, mais os juros geram juros, e menor é a parte do patrimônio que precisa vir do seu bolso. No cenário de 30 anos, dos R$ 1 milhão acumulados, R$ 162 mil são aportes (16%) e R$ 838 mil são juros (84%).',
        ],
      },
      {
        h3: 'Estratégia prática para R$ 1.300 por mês',
        paragraphs: [
          'Com aporte de R$ 1.300/mês, dá para montar carteira realmente diversificada. Sugestão de alocação: R$ 500 em renda fixa (Tesouro IPCA+, CDB de bancos médios), R$ 400 em FIIs com 5-7 papéis para diversificar setor, R$ 300 em ações de dividendos ou ETF DIVO11, R$ 100 em ETF internacional (IVVB11 ou WRLD11). Aportes automáticos via débito programado eliminam a fricção mental.',
          'Aumente o aporte sempre que receber promoção ou aumento. Se sua renda subir 10%, sobe o aporte 10% também, mantém padrão de vida estável e antecipa a meta em anos. Quem nunca aumenta o aporte abre mão do principal acelerador da independência financeira.',
        ],
      },
    ],
    faq: [
      { q: 'Quanto preciso investir por mês para juntar R$ 1 milhão em 10 anos?', a: 'Em 10 anos a 10,5% a.a., você precisa investir aproximadamente R$ 4.825 por mês. Total de aportes: R$ 579 mil. Total de juros: R$ 421 mil. É um aporte alto, viável apenas para quem ganha R$ 18-25 mil/mês ou usa renda extra (sócio em negócio, side hustles).' },
      { q: 'Quanto preciso investir por mês para juntar R$ 1 milhão em 20 anos?', a: 'Em 20 anos a 10,5% a.a., R$ 1.300/mês é suficiente. Total de aportes: R$ 312 mil. Total de juros: R$ 688 mil. Os juros já representam 69% do patrimônio final, comprovando o poder do tempo.' },
      { q: 'Quanto preciso investir por mês para juntar R$ 1 milhão em 30 anos?', a: 'Em 30 anos a 10,5% a.a., apenas R$ 450/mês. Total de aportes: R$ 162 mil. Total de juros: R$ 838 mil. Praticamente todo o patrimônio vem de juros sobre juros, é o cenário mais "barato" matematicamente, exige só começar cedo.' },
      { q: 'Tem como juntar R$ 1 milhão em 5 anos?', a: 'Tem, mas exige aporte alto: aproximadamente R$ 12.880/mês a 10,5% a.a. ou R$ 11.500/mês a 12% a.a. Geralmente só viável com herança, venda de empresa, bônus extraordinário ou casal de alta renda combinando esforço. Para a maioria, esticar o prazo é mais realista.' },
      { q: 'R$ 1 milhão dá pra viver de renda hoje?', a: 'Pela regra dos 4%, R$ 1 milhão gera R$ 3.333/mês de renda passiva sustentável. Equivale a aposentadoria modesta (Lean FIRE no Brasil). Para Fat FIRE com R$ 10 mil/mês, você precisa de R$ 3 milhões. R$ 1 milhão é ótimo complemento ao INSS, não substituto integral da renda atual.' },
    ],
    related: ['1000-reais-por-mes', '500-reais-por-mes', '100-mil-em-5-anos'],
  },

  '100-mil-em-5-anos': {
    h1: 'Como Juntar R$ 100 Mil em 5 Anos?',
    title: 'Como Juntar R$ 100 Mil em 5 Anos Investindo',
    metaDescription: 'Para juntar R$ 100 mil em 5 anos a 10,5% a.a. invista R$ 1.280/mês. Ideal para entrada de imóvel ou meta de curto prazo.',
    answerFirst:
      'Para juntar R$ 100 mil em 5 anos a 10,5% ao ano, você precisa investir aproximadamente R$ 1.280 por mês. Total de aportes: R$ 76.800. Total de juros: R$ 23.200. Em metas de curto prazo (até 5 anos), os juros têm peso menor (23% do patrimônio final) e o que mais importa é a disciplina nos aportes. Esta calculadora simula exatamente esse cenário, ideal para entrada de imóvel, troca de carro ou meta intermediária definida.',
    preview: 'R$ 100 mil em 5 anos exige R$ 1.280/mês a 10,5%.',
    badges: baseBadges,
    inputs: { initial: 0, monthly: 1280, rate: 10.5, years: 5 },
    eduH2: 'R$ 100 mil em 5 anos: estratégia de curto prazo',
    eduBlocks: [
      {
        h3: 'Curto prazo exige menos juros, mais disciplina',
        paragraphs: [
          'Em prazos de 3 a 5 anos, o efeito dos juros compostos ainda é discreto. Para R$ 100 mil em 5 anos, dos R$ 100 mil finais apenas R$ 23 mil vêm de juros, o restante (R$ 77 mil) é aporte direto. Por isso a chave em metas curtas é proteger o principal e manter a regularidade dos aportes, não buscar retorno alto com risco.',
          'A taxa de 10,5% a.a. usada nesta simulação é conservadora e bate com Tesouro Selic, CDBs com liquidez diária ou Tesouro Prefixado de prazo equivalente. Não use renda variável (ações, FIIs) para metas de até 3 anos, a volatilidade pode te entregar o pior preço justo na hora de sacar.',
        ],
      },
      {
        h3: 'Onde investir para R$ 100 mil em 5 anos',
        paragraphs: [
          'Estratégia conservadora (recomendada): 60% em Tesouro Selic ou CDB pós-fixado de banco com FGC, 30% em Tesouro IPCA+ 2029 (proteção de inflação no prazo), 10% em CDB prefixado de 110% CDI para travar uma parte da rentabilidade. Resultado esperado: 10-11% a.a. líquido após IR de 15% (alíquota mínima após 2 anos).',
          'Se quiser acelerar e aceita risco moderado, troque parte da renda fixa por LCI/LCA isentas de IR ou um pouco de FIIs de logística (HGLG11, BTLG11) para 5-10% da carteira. Mas mantenha pelo menos 70% em renda fixa, prazo curto não perdoa erros.',
        ],
      },
    ],
    faq: [
      { q: 'Quanto preciso poupar por mês para juntar R$ 100 mil em 3 anos?', a: 'Em 3 anos a 10,5% a.a., você precisa aportar aproximadamente R$ 2.400/mês. Total de aportes: R$ 86.400. Total de juros: R$ 13.600. Prazo curto demais para juros compostos render bastante, esforço mensal alto.' },
      { q: 'Quanto preciso poupar por mês para juntar R$ 100 mil em 5 anos?', a: 'Em 5 anos a 10,5% a.a., aproximadamente R$ 1.280/mês. Total de aportes: R$ 76.800. Total de juros: R$ 23.200. Equilíbrio razoável entre aporte e tempo.' },
      { q: 'Quanto preciso poupar por mês para juntar R$ 100 mil em 10 anos?', a: 'Em 10 anos a 10,5% a.a., apenas R$ 482/mês. Total de aportes: R$ 57.840. Total de juros: R$ 42.160. Esticar o prazo de 5 para 10 anos divide o aporte exigido em ~63%.' },
      { q: 'Qual o melhor investimento para juntar R$ 100 mil em 5 anos?', a: 'Carteira conservadora com 70%+ renda fixa: Tesouro Selic, CDBs pós-fixados de bancos médios com FGC, LCI/LCA isentas de IR. Evite ações e FIIs concentrados, volatilidade não compensa em prazo tão curto. Tesouro IPCA+ 2029 também serve para travar inflação.' },
      { q: 'Vale a pena financiar imóvel se eu ainda não tenho R$ 100 mil de entrada?', a: 'Depende do prazo. Se você precisa do imóvel em 1-2 anos, financiar e pagar juros bancários é caro mas necessário. Se aceita esperar 4-5 anos, juntar R$ 100 mil de entrada e financiar 80% reduz juros totais em R$ 100-300 mil dependendo do valor do imóvel. Geralmente compensa esperar.' },
    ],
    related: ['500-reais-por-mes', '1000-reais-por-mes', 'aposentar-com-1-milhao'],
  },

  'dobrar-dinheiro-regra-72': {
    h1: 'Em Quantos Anos Meu Dinheiro Dobra? (Regra de 72)',
    title: 'Regra de 72: Em Quantos Anos Meu Dinheiro Dobra?',
    metaDescription: 'Pela Regra de 72, divida 72 pela taxa anual para saber em quantos anos seu dinheiro dobra. A 10% rende em 7,2 anos. Calcule grátis.',
    answerFirst:
      'A Regra de 72 é o atalho matemático para descobrir em quantos anos seu dinheiro dobra: divida 72 pela taxa de juros anual. A 6% a.a. dobra em 12 anos. A 10% a.a. dobra em 7,2 anos. A 12% a.a. dobra em 6 anos. A 15% a.a. dobra em 4,8 anos. Esta calculadora simula R$ 10 mil parados (sem aporte) a 10% a.a. por 8 anos, mostrando que o valor inicial mais que dobra para R$ 21,4 mil. Aproximação precisa para taxas entre 6% e 15%.',
    preview: 'A 10% a.a. seu dinheiro dobra em 7,2 anos.',
    badges: baseBadges,
    inputs: { initial: 10000, monthly: 0, rate: 10, years: 8 },
    eduH2: 'Regra de 72: o atalho mental dos juros compostos',
    eduBlocks: [
      {
        h3: 'Como surgiu e por que funciona',
        paragraphs: [
          'A Regra de 72 vem do logaritmo natural de 2 (≈0,693). A fórmula exata para dobrar capital é ln(2) ÷ ln(1+i), o que dá 7,27 anos a 10% a.a. A simplificação 72÷10 = 7,2 está apenas 1% errada e cabe no cálculo de cabeça. É um dos truques mentais mais úteis em finanças pessoais, atribuído a Luca Pacioli (1494) e popularizado por Albert Einstein.',
          'A regra funciona porque os juros compostos crescem em progressão geométrica. Cada período aplica a taxa sobre o saldo anterior, então dobrar o capital exige um número fixo de períodos para qualquer taxa, e esse número é aproximadamente 72÷taxa. Funciona muito bem entre 6% e 15%; fora dessa faixa, use 70 (taxas baixas) ou 76 (taxas altas) para mais precisão.',
        ],
      },
      {
        h3: 'Aplicações práticas no Brasil',
        paragraphs: [
          'Tesouro Selic com Selic em 12% a.a.: seu dinheiro dobra a cada 6 anos. R$ 50 mil viram R$ 100 mil em 6 anos, R$ 200 mil em 12, R$ 400 mil em 18, R$ 800 mil em 24, R$ 1,6 milhão em 30 anos. Essa progressão é a essência da independência financeira no Brasil.',
          'A regra também serve como termômetro de inflação. Se a inflação acumula 6% a.a., seu poder de compra cai pela metade em 12 anos. Por isso renda fixa que paga apenas inflação + 0,5% (poupança em Selic baixa) destrói patrimônio no longo prazo. Sempre busque retorno real (acima da inflação) de pelo menos 4-5% a.a.',
        ],
      },
    ],
    faq: [
      { q: 'Em quantos anos meu dinheiro dobra a 6% ao ano?', a: 'Pela Regra de 72: 72 ÷ 6 = 12 anos. R$ 100 mil viram R$ 200 mil em 12 anos, R$ 400 mil em 24 anos, R$ 800 mil em 36 anos. A 6% a.a. é o piso defensável em renda fixa, abaixo disso você está perdendo da inflação a maior parte do tempo.' },
      { q: 'Em quantos anos meu dinheiro dobra a 10% ao ano?', a: 'Pela Regra de 72: 72 ÷ 10 = 7,2 anos. R$ 10 mil viram R$ 20 mil em 7,2 anos, R$ 40 mil em 14,4 anos, R$ 80 mil em 21,6 anos. Taxa próxima ao CDI histórico brasileiro, base do planejamento de longo prazo.' },
      { q: 'Em quantos anos meu dinheiro dobra a 12% ao ano?', a: 'Pela Regra de 72: 72 ÷ 12 = 6 anos. R$ 50 mil viram R$ 100 mil em 6 anos, R$ 200 mil em 12 anos, R$ 400 mil em 18 anos. Taxa atingível com CDB 110% CDI ou Selic alta, ótimo cenário para acumulação.' },
      { q: 'A Regra de 72 funciona com inflação?', a: 'Sim, e é poderosa. Inflação de 4,5% a.a. faz seu poder de compra cair pela metade em 16 anos (72÷4,5). Por isso retorno nominal de 8% com inflação de 4,5% representa retorno real de apenas ~3,3%, e dobra o patrimônio real em 22 anos, não 9. Sempre raciocine em retorno real para metas de longo prazo.' },
      { q: 'Existe Regra de 144 para triplicar dinheiro?', a: 'Quase. Para triplicar (×3), use a Regra de ~115. A 10% a.a., 115÷10 = 11,5 anos para triplicar. A 12% a.a., 9,6 anos. Existe também a Regra de 144 para quadruplicar (×4), mas o uso prático é menor, na maioria dos planejamentos a Regra de 72 cobre as necessidades.' },
    ],
    related: ['500-reais-por-mes', '1000-reais-por-mes', 'aposentar-com-1-milhao'],
  },
}

// remount por cenário (key = fullPath): SEO, FAQPage e seed sempre frescos
// mesmo em navegação client-side entre cenários irmãos.
definePageMeta({ key: (route) => route.fullPath })

const route = useRoute()
const slug = String(route.params.scenario || '')
const scenario = scenarios[slug]
if (!scenario) {
  throw createError({ statusCode: 404, statusMessage: 'Cenário não encontrado' })
}

const relatedScenarios = scenario.related
  .map((rel) => {
    const item = scenarios[rel]
    return item ? { slug: rel, h1: item.h1, preview: item.preview } : null
  })
  .filter((x): x is { slug: string; h1: string; preview: string } => !!x)

const seed = {
  initial: scenario.inputs.initial,
  monthly: scenario.inputs.monthly,
  rate: scenario.inputs.rate,
  years: scenario.inputs.years,
}

// Data de atualização dinâmica (sinal de frescor pro Google — portado).
const CONTENT_VERSION = '2026-05-01'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
const lastUpdatedISO = lastUpdated.toISOString()

usePageSeo({
  title: scenario.title,
  description: scenario.metaDescription,
  path: route.path,
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadoras' },
    { name: 'Juros Compostos', path: '/calculadora/juros-compostos' },
    { name: scenario.h1, path: route.path },
  ],
  structuredData: [
    {
      '@type': 'WebApplication',
      name: `${scenario.title} - Redentia`,
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Calculadora financeira',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      dateModified: lastUpdatedISO,
      description: scenario.metaDescription,
    },
    // FAQPage é emitido pelo NuFaqAccordion — fonte única.
  ],
})

// hierarquia da coleção pros crawlers (portado da página antiga)
useHead({ link: [{ rel: 'prev', href: '/calculadora/juros-compostos' }] })
</script>

<template>
  <div>
    <!-- ============ Hero do cenário (texto verbatim, visual Nu) ============ -->
    <section class="jcs__hero">
      <div class="jcs__status">
        <span class="jcs__live"><span class="jcs__live-dot" /> Simulador ao vivo</span>
        <span aria-hidden>·</span>
        <span>Atualizado {{ lastUpdatedText }}</span>
        <span aria-hidden>·</span>
        <NuxtLink to="/calculadora/juros-compostos" class="jcs__back">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Calculadora de Juros Compostos
        </NuxtLink>
      </div>
      <p class="jcs__eyebrow">Cenário · Juros Compostos</p>
      <h1 class="jcs__h1">{{ scenario.h1 }}</h1>
      <p class="jcs__lead">{{ scenario.answerFirst }}</p>
      <ul class="jcs__chips">
        <li v-for="badge in scenario.badges" :key="badge.label">
          <span class="jcs__chip-dot" :style="badge.color ? { background: badge.color } : undefined" />
          {{ badge.label }}
        </li>
      </ul>
    </section>

    <!-- ============ Calculadora pré-preenchida (design) ============ -->
    <CalcCompoundSection :seed="seed" section-id="juros">
      <template #title>Juros compostos.</template>
    </CalcCompoundSection>

    <!-- ============ Outros cenários populares (banda centrada do design) ============ -->
    <CalcBand tone="cream" title="Outros cenários populares">
      <template #dek>
        <p>Compare diferentes simulações lado a lado, basta clicar e a calculadora carrega já preenchida com os valores do cenário.</p>
      </template>
      <div class="jcs__scenarios">
        <NuxtLink
          v-for="rel in relatedScenarios"
          :key="rel.slug"
          :to="`/calculadora/juros-compostos/${rel.slug}`"
          class="jcs__scenario"
        >
          <span class="jcs__scenario-label">{{ rel.h1 }}</span>
          <span class="jcs__scenario-sub">{{ rel.preview }}</span>
        </NuxtLink>
      </div>
    </CalcBand>

    <!-- ============ Conteúdo educacional (split: título gigante + prosa, texto verbatim) ============ -->
    <CalcSplit tone="white">
      <template #title>{{ scenario.eduH2 }}</template>
      <div class="jcs__prose">
        <div v-for="block in scenario.eduBlocks" :key="block.h3">
          <h3 class="jcs__sub">{{ block.h3 }}</h3>
          <p v-for="(p, i) in block.paragraphs" :key="i">{{ p }}</p>
        </div>
      </div>
    </CalcSplit>

    <!-- ============ FAQ (anatomia EXATA do design: banda creme, cards brancos, pill IA) ============ -->
    <CalcSplit tone="cream" wide>
      <template #title>Perguntas frequentes sobre este cenário</template>
      <template #left>
        <NuxtLink to="/busca" class="jcs__pill">Perguntar à Redentia AI</NuxtLink>
      </template>
      <NuFaqAccordion :key="slug" :items="scenario.faq" surface="white" />
    </CalcSplit>

    <!-- ============ CTA (card azul do design, texto verbatim) ============ -->
    <CalcBand tone="white">
      <div class="jcs__cta">
        <h2 class="jcs__cta-title">Quer mais controle sobre seus investimentos?</h2>
        <p class="jcs__cta-sub">Cadastre-se na Redentia e acompanhe sua carteira com análises em tempo real e IA.</p>
        <div class="jcs__cta-actions">
          <NuxtLink to="/login" class="jcs__pill jcs__pill--light">Criar conta grátis</NuxtLink>
          <NuxtLink to="/calculadora/juros-compostos" class="jcs__pill jcs__pill--outline">Voltar para a calculadora</NuxtLink>
        </div>
      </div>
    </CalcBand>
  </div>
</template>

<style scoped>
/* ——— hero ——— */
.jcs__hero {
  background: var(--nu-cream);
  padding: clamp(48px, 6.5vw, 88px) clamp(22px, 5.5vw, 80px) clamp(40px, 5vw, 64px);
  animation: nu-fade .5s ease both;
}
.jcs__status {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  color: var(--nu-gray); font-size: 13.5px; font-weight: 600; margin-bottom: 22px;
}
.jcs__live { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-ink); font-weight: 700; }
.jcs__live-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-green); flex-shrink: 0; }
.jcs__back {
  display: inline-flex; align-items: center; gap: 9px;
  background: var(--nu-white); color: var(--nu-ink);
  border-radius: var(--nu-r-pill); padding: 11px 20px;
  font-size: 14.5px; font-weight: 700;
  transition: transform .18s, box-shadow .2s;
}
.jcs__back:hover { transform: translateY(-1px); box-shadow: var(--nu-shadow-card); color: var(--nu-ink); }
.jcs__eyebrow { margin: 0; color: var(--nu-blue); font-size: clamp(16px, 1.5vw, 19px); font-weight: 800; }
.jcs__h1 {
  margin: 12px 0 0; color: var(--nu-ink);
  font-size: clamp(34px, 4.6vw, 64px); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1.04; max-width: 1080px;
}
.jcs__lead {
  color: var(--nu-gray-2); font-size: clamp(16px, 1.7vw, 19px); font-weight: 500;
  line-height: 1.6; margin: 20px 0 0; max-width: 840px;
}
.jcs__chips { list-style: none; display: flex; gap: 10px; flex-wrap: wrap; margin: 26px 0 0; padding: 0; }
.jcs__chips li {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--nu-white); border-radius: var(--nu-r-pill);
  padding: 9px 15px; color: var(--nu-ink); font-size: 13.5px; font-weight: 700;
}
.jcs__chip-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--nu-blue); flex-shrink: 0; }

/* ——— cenários relacionados (grid de tiles do exemplar: jc__scenarios) ——— */
.jcs__scenarios {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px; margin-top: clamp(24px, 3.5vw, 36px);
}
.jcs__scenario {
  background: var(--nu-white); border-radius: var(--nu-r-tile); padding: 16px 18px;
  display: flex; flex-direction: column; gap: 3px;
  transition: transform .18s, box-shadow .2s;
}
.jcs__scenario:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.jcs__scenario-label { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; letter-spacing: -.1px; }
.jcs__scenario-sub { color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }

/* ——— prosa da coluna direita (bandas split do design: jc__prose) ——— */
.jcs__prose p {
  margin: 0 0 16px; color: var(--nu-gray-3); font-size: 17px; font-weight: 500;
  line-height: 1.7;
}
.jcs__prose p:last-child { margin-bottom: 0; }

/* ——— sub-heading dentro da prosa (exemplar: jc__sub) ——— */
.jcs__sub { margin: clamp(24px, 3vw, 34px) 0 0; color: var(--nu-ink); font-size: 20px; font-weight: 800; letter-spacing: -.3px; }
.jcs__sub + p { margin-top: 10px; }
.jcs__prose > div:first-child .jcs__sub { margin-top: 0; }

/* ——— pills / CTA (exemplar: jc__pill / jc__cta) ——— */
.jcs__pill {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.jcs__pill:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.jcs__cta {
  background: var(--nu-blue); border-radius: var(--nu-r-card-lg);
  padding: clamp(34px, 5vw, 60px); text-align: center;
  max-width: 1080px; margin-left: auto; margin-right: auto;
}
.jcs__cta-title { margin: 0; color: var(--nu-white); font-size: clamp(26px, 3.4vw, 44px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.jcs__cta-sub { margin: 14px auto 0; color: var(--nu-white-75); font-size: 16px; font-weight: 500; line-height: 1.6; max-width: 560px; }
.jcs__cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 26px; }
.jcs__cta .jcs__pill { margin-top: 0; }
.jcs__pill--light { background: var(--nu-cream); color: var(--nu-blue); }
.jcs__pill--light:hover { background: var(--nu-white); color: var(--nu-blue-hover); }
.jcs__pill--outline { background: transparent; border: 2px solid var(--nu-white-35); color: var(--nu-white); }
.jcs__pill--outline:hover { background: var(--nu-white-14); color: var(--nu-white); }
</style>
