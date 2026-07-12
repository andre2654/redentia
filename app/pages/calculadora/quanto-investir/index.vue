<script setup lang="ts">
// /calculadora/quanto-investir — calculadora de aporte mensal (PR10, fase 2).
// Contrato de UX: docs/redentia-nu/designs/Redentia Calculadoras Nu.dc.html
// (kit da fase 1: sliders + número-herói + gráfico + steps + fórmula + FAQ).
// Contrato de SEO (regra nº1): TODO o texto da página antiga
// (Frontend/app/pages/calculadora/quanto-investir.vue) verbatim, na MESMA
// ordem de tags (h1 → h2/h3/h4 → p → li → tabelas → FAQ). Muda o visual.
// Path antigo mantido (/calculadora/quanto-investir) — preserva URL equity.

const route = useRoute()

// deep-links ?goal=&years=&wealth=(alias atual)&rate=&inflation= — porte do
// applyQueryParams do MonthlyInvestment.vue antigo (cenários populares
// carregam a simulação preenchida).
function parseNumberParam(value: unknown): number | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.trim() === '') return null
  const num = Number(raw.replace(',', '.'))
  return Number.isFinite(num) ? num : null
}

const seed = computed(() => {
  const q = route.query
  const goal = parseNumberParam(q.goal)
  const years = parseNumberParam(q.years)
  const wealth = parseNumberParam(q.wealth ?? q.atual)
  const rate = parseNumberParam(q.rate)
  const inflation = parseNumberParam(q.inflation)
  if (goal === null && years === null && wealth === null && rate === null && inflation === null) return undefined
  return {
    goal: goal ?? undefined,
    years: years ?? undefined,
    wealth: wealth ?? undefined,
    rate: rate ?? undefined,
    inflation: inflation ?? undefined,
  }
})

// cenário clicado na própria página → scrolla até a calculadora (porte do
// scrollToCalc do componente antigo)
watch(
  () => route.query,
  () => {
    if (import.meta.client) {
      nextTick(() => document.getElementById('aporte')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  },
  { deep: true },
)

// Data de atualização dinâmica (sinal de frescor — portado da página antiga).
const CONTENT_VERSION = '2026-05-01'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
const lastUpdatedISO = lastUpdated.toISOString().slice(0, 10)

// Cenários populares — long-tail SEO via deep-links (texto/URLs verbatim).
const popularScenarios = [
  { label: 'R$ 100 mil em 5 anos', sub: 'Curto prazo, meta concreta', to: '/calculadora/quanto-investir?goal=100000&years=5&rate=10' },
  { label: 'R$ 500 mil em 10 anos', sub: 'Cenário clássico', to: '/calculadora/quanto-investir?goal=500000&years=10&rate=10' },
  { label: 'R$ 1 milhão em 15 anos', sub: 'Médio prazo agressivo', to: '/calculadora/quanto-investir?goal=1000000&years=15&rate=10' },
  { label: 'R$ 1 milhão em 20 anos', sub: 'Plano consistente', to: '/calculadora/quanto-investir?goal=1000000&years=20&rate=10' },
  { label: 'R$ 2 milhões em 20 anos', sub: 'Patrimônio expressivo', to: '/calculadora/quanto-investir?goal=2000000&years=20&rate=10' },
  { label: 'Aposentadoria R$ 800 mil 25 anos', sub: 'Complemento INSS', to: '/calculadora/quanto-investir?goal=800000&years=25&rate=10' },
  { label: 'Liberdade R$ 3 milhões 30 anos', sub: 'FIRE clássico', to: '/calculadora/quanto-investir?goal=3000000&years=30&rate=11' },
  { label: 'Entrada imóvel R$ 100 mil 3 anos', sub: 'Sonho da casa própria', to: '/calculadora/quanto-investir?goal=100000&years=3&rate=12' },
  { label: 'Carro R$ 80 mil 4 anos', sub: 'Sem financiamento', to: '/calculadora/quanto-investir?goal=80000&years=4&rate=12' },
  { label: 'Faculdade filhos R$ 200 mil 15 anos', sub: 'Educação dos filhos', to: '/calculadora/quanto-investir?goal=200000&years=15&rate=10' },
  { label: 'Casamento R$ 50 mil 2 anos', sub: 'Curto prazo', to: '/calculadora/quanto-investir?goal=50000&years=2&rate=12' },
  { label: 'Reserva R$ 30 mil 1 ano', sub: 'Emergência líquida', to: '/calculadora/quanto-investir?goal=30000&years=1&rate=12' },
  { label: 'Aposentar aos 60 com R$ 1M', sub: 'Aposentadoria tranquila', to: '/calculadora/quanto-investir?goal=1000000&years=30&rate=10' },
  { label: 'Educação dos filhos R$ 200k em 15 anos', sub: 'Faculdade dos filhos', to: '/calculadora/quanto-investir?goal=200000&years=15&rate=10' },
]

const whyCards = [
  { title: 'Meta tangível, não abstrata', body: 'Saber "preciso de R$ 1.288/mês para ter R$ 100k em 5 anos" cria um número concreto pra defender no orçamento. Meta sem aporte definido vira intenção esquecida.' },
  { title: 'Comparação de cenários', body: 'Esticar o prazo em 5 anos pode reduzir o aporte mensal pela metade. Trocar a taxa de 8% para 12% também. Ver o trade-off lado a lado evita decisões cegas.' },
  { title: 'Sanidade financeira', body: 'Se o aporte calculado é maior que sua renda inteira, você sabe na hora que precisa estender prazo, reduzir meta ou aumentar renda. Reality check em 30 segundos.' },
  { title: 'Aproveita seu patrimônio atual', body: 'Já tem R$ 50 mil parado? Eles entram no cálculo e reduzem o aporte mensal exigido. A calculadora compõe juros sobre o que você já tem mais os novos aportes.' },
]

const reserveItems = [
  { strong: 'Quanto:', text: ' 6 a 12 meses de despesas mensais. Se você gasta R$ 4.000/mês, a reserva ideal fica entre R$ 24.000 e R$ 48.000.' },
  { strong: 'Onde:', text: ' Tesouro Selic 2030 (zero risco de crédito, liquidez diária), CDB de banco grande com liquidez diária (~CDI, com cobertura do FGC até R$ 250 mil) ou conta remunerada (Nubank, Inter, C6 Bank rendendo ~100% do CDI).' },
  { strong: 'Por quê:', text: ' em uma emergência, vender ações ou FIIs em queda transforma perda contábil em perda real. Reserva líquida elimina esse risco.' },
  { strong: 'Exemplo prático:', text: ' família com R$ 4.000 de gasto mensal precisa de R$ 24.000 a R$ 48.000 em renda fixa de liquidez diária antes de começar a alocar em renda variável.' },
]

const profileCards = [
  { title: 'Conservador', body: '100% renda fixa pura. Tesouro Selic 2030 (rentabilidade ~Selic, liquidez diária), CDB de bancões com liquidez diária (~CDI), LCI/LCA (isentas de IR, prazo médio 90-720 dias).', note: 'Risco baixo, retorno esperado 10-13% a.a.' },
  { title: 'Moderado', body: '60% renda fixa (Tesouro IPCA+ 2035, CDBs longos, fundos DI) + 30% FIIs (HGLG11, KNCR11) + 10% ações blue chip (ITUB4, ITSA4).', note: 'Risco médio, retorno esperado 10-12% a.a.' },
  { title: 'Arrojado', body: '70% renda variável (ações, FIIs e ETFs como BOVA11) + 30% renda fixa para a reserva e oportunidades. Foco em horizonte de 10+ anos.', note: 'Risco alto, retorno histórico 12-15% a.a. com volatilidade.' },
]

const cdbTesouroRows = [
  ['Risco', 'Tesouro Nacional (menor risco do Brasil)', 'Banco emissor + FGC até R$ 250k por CPF/instituição'],
  ['Rentabilidade', 'Selic, IPCA+, Prefixado', 'Geralmente CDI (90-120%)'],
  ['Imposto de Renda', '22,5% até 180 dias, regressiva até 15% após 720 dias', 'Mesma tabela regressiva (22,5% a 15%)'],
  ['Liquidez', 'Diária no Tesouro Selic, demais via venda no mercado secundário', 'Variável (alguns têm liquidez diária, outros vencimento fixo)'],
  ['Aporte mínimo', 'A partir de R$ 30', 'Geralmente R$ 100 ou mais'],
]

const goalTermRows = [
  ['R$ 100 mil', 'R$ 1.288', 'R$ 482', 'R$ 240', 'R$ 132'],
  ['R$ 500 mil', 'R$ 6.440', 'R$ 2.412', 'R$ 1.202', 'R$ 661'],
  ['R$ 1 milhão', 'R$ 12.880', 'R$ 4.825', 'R$ 2.404', 'R$ 1.321'],
  ['R$ 2 milhões', 'R$ 25.760', 'R$ 9.650', 'R$ 4.808', 'R$ 2.642'],
]

const incomeRows = [
  ['Mínimo viável', '10%', 'R$ 500', 'R$ 379 mil'],
  ['Recomendado (50/30/20)', '20%', 'R$ 1.000', 'R$ 758 mil'],
  ['Acelerado', '30%', 'R$ 1.500', 'R$ 1,1 milhão'],
  ['FIRE agressivo', '50%+', 'R$ 2.500+', 'R$ 1,9 milhão+'],
]

const howToSteps = [
  { title: 'Defina sua Meta Financeira', html: 'Quanto você quer ter ao final do prazo. Pode ser R$ 100 mil pra entrada de imóvel, R$ 1 milhão pra independência ou qualquer valor que faça sentido pro seu projeto de vida.' },
  { title: 'Defina o Prazo em Anos', html: 'Em quanto tempo você quer atingir a meta. Lembre que esticar o prazo reduz drasticamente o aporte exigido por causa do efeito exponencial dos juros compostos.' },
  { title: 'Escolha a Taxa de Retorno', html: 'Use uma taxa realista. Renda fixa: 10-13% a.a. Carteira diversificada: 10-12% a.a. Bolsa pura: 12-15% a.a. (com volatilidade). Para metas de curto prazo, prefira taxas conservadoras.' },
  { title: 'Veja o Aporte Necessário', html: 'A calculadora retorna o valor exato que você precisa investir todo mês, mais a tabela de sensibilidade por taxa e os cenários alternativos (aumentar ou reduzir aporte, esticar prazo).' },
  { title: 'Ajuste o Plano', html: 'Se o aporte não couber no orçamento, estenda o prazo, reduza a meta ou busque investimentos com maior retorno. Reaplique até encontrar a combinação realista.' },
]

const ageRows = [
  ['20-25 anos', 'R$ 200 a R$ 500/mês', '10-15%', 'Reserva de emergência + começar Tesouro'],
  ['26-35 anos', 'R$ 500 a R$ 1.500/mês', '15-25%', 'R$ 100k a R$ 300k em 10 anos'],
  ['36-45 anos', 'R$ 1.500 a R$ 3.000/mês', '20-30%', 'R$ 500k a R$ 1M em 15 anos'],
  ['46-55 anos', 'R$ 3.000 a R$ 5.000/mês', '25-35%', 'R$ 1M a R$ 2M até a aposentadoria'],
  ['56+ anos', 'Maximize', 'Migra pra renda fixa segura', 'Preservação + renda'],
]

const tipCards = [
  { title: '1. Automatize o Aporte', body: 'Configure transferência automática no dia do salário. Investir o que sobra raramente funciona, investir antes de gastar funciona quase sempre.' },
  { title: '2. Aumente o Aporte com Aumento de Renda', body: 'Sempre que ganhar 10% a mais de salário, aumente o aporte em 10%. Mantém seu padrão de vida estável e acelera a meta sem esforço.' },
  { title: '3. Direcione o 13º e Bônus', body: '13º, PLR, restituição de IR, herança, todo dinheiro extra que entra fora do salário deve ir direto pra meta. Em 10 anos, isso reduz o aporte mensal em 15-25%.' },
  { title: '4. Acompanhe Mês a Mês', body: 'Compare patrimônio real com a projeção a cada 6 meses. Se ficou abaixo, ajuste antes de virar bola de neve. Se ficou acima, ótimo, mas não relaxe nos aportes.' },
  { title: '5. Não Se Sabote', body: 'Saque de meta de longo prazo pra cobrir gasto de curto prazo é o erro mais comum. Tenha reserva de emergência separada da meta para não tocar nos investimentos de longo prazo.' },
  { title: '6. Revise a Meta a Cada 2 Anos', body: 'Inflação, mudanças de vida e novos objetivos exigem revisão periódica. R$ 1 milhão hoje não é a mesma coisa que R$ 1 milhão daqui a 15 anos.' },
]

const relatedRankings = [
  { to: '/ranking/maiores-valor-mercado', title: 'Blue chips por valor de mercado', sub: 'Maiores empresas listadas na B3' },
  { to: '/ranking/buy-and-hold', title: 'Carteira Buy and Hold', sub: 'Score Redent pra horizonte longo' },
]

// FAQs verbatim da página antiga (15). O FAQPage JSON-LD é emitido pelo
// NuFaqAccordion — fonte única, mesmo padrão do app antigo.
const faqItems = [
  { q: 'Quanto da minha renda devo investir por mês?', a: 'Regra 50/30/20: 50% necessidades, 30% desejos, 20% investimentos. Mínimo defensável é 10% da renda. Ideal é 20-30% para classe média construir patrimônio relevante. Quem busca FIRE (independência financeira antecipada) precisa chegar a 50-70% da renda. Se ganha R$ 5.000: investir R$ 500 (mínimo) a R$ 1.500 (ideal). Aumente o percentual conforme sua renda cresce.' },
  { q: 'E se eu não conseguir investir o valor calculado pela calculadora?', a: 'Você tem 4 opções práticas: 1) Estender o prazo (mais tempo reduz drasticamente o aporte por causa dos juros compostos), 2) Reduzir a meta para algo mais realista, 3) Buscar investimentos com maior retorno (e mais risco), 4) Aumentar a renda com side hustles ou negociação salarial. Comece com o que conseguir, é melhor investir R$ 300/mês por 15 anos do que esperar "ter condições" pra investir R$ 1.000. O tempo perdido não volta.' },
  { q: 'Como o patrimônio atual influencia o aporte necessário?', a: 'O patrimônio que você já tem entra na fórmula como valor presente (PV) e é multiplicado pelos juros compostos durante o prazo. Quanto mais alto, menor o aporte mensal exigido. Exemplo: R$ 1 milhão em 20 anos a 10% a.a. exige R$ 1.321/mês começando do zero. Com R$ 50 mil já investidos, cai para R$ 853/mês. Com R$ 100 mil, cai para R$ 386/mês. Por isso quem começa cedo e nunca para tem vantagem desproporcional.' },
  { q: 'Qual a diferença entre meta nominal e meta ajustada pela inflação?', a: 'Meta nominal é o valor absoluto de R$ no futuro (ex: "quero R$ 1 milhão em 2046"). Meta ajustada pela inflação é o equivalente do poder de compra de hoje (ex: "quero conseguir comprar hoje o que R$ 1 milhão compra agora"). Para metas de longo prazo (20+ anos), sempre pense em ajustar pela inflação, R$ 1 milhão em 30 anos pode comprar o equivalente a R$ 300 mil hoje, dependendo da inflação acumulada.' },
  { q: 'Posso aumentar o aporte ao longo do tempo?', a: 'Sim, e é altamente recomendado. A calculadora padrão assume aporte fixo, mas a vida real envolve aumento de renda. Aumentar o aporte em 5% ao ano (acompanhando inflação + crescimento salarial) reduz o esforço inicial e ainda garante a meta. Estratégia prática: aumente o aporte na mesma proporção do seu aumento salarial. Se ganhou 10% a mais, invista 10% a mais.' },
  { q: 'Devo investir o 13º salário e bônus na meta?', a: 'Sim, sempre que possível. Aportes extras esporádicos (13º, PLR, restituição de IR, presentes) têm efeito desproporcional porque ficam aplicados o resto do prazo, ganhando juros compostos sobre tudo. Direcionar o 13º inteiro pra meta durante 20 anos pode reduzir o aporte mensal em 15-25%. Trate dinheiro extra como acelerador, não como diversão.' },
  { q: 'Qual taxa de retorno usar no cálculo?', a: 'Depende do produto e prazo: Tesouro Selic e CDBs líquidos pagam ~CDI (12-13% a.a. em 2026). Tesouro IPCA+ paga IPCA + 6% a.a. (~10-12% nominal). Carteira diversificada (60% renda variável + 40% renda fixa) tende a 10-12% a.a. no longo prazo. Bolsa pura entrega 12-15% historicamente, mas com volatilidade alta. Para metas de curto prazo (até 3 anos), use 10% a.a. conservador. Para longo prazo (10+ anos) com renda variável, 11-12% a.a. é razoável.' },
  { q: 'Como esticar o prazo afeta o aporte mensal?', a: 'O efeito é exponencial e gigante. Para juntar R$ 1 milhão a 10% a.a.: em 10 anos o aporte é R$ 4.825/mês, em 15 anos cai pra R$ 2.404/mês (50% menos), em 20 anos cai pra R$ 1.321/mês (73% menos), em 30 anos cai pra R$ 442/mês (91% menos). Cada década adicional reduz o aporte em ~50%. Se você tem flexibilidade no prazo, esticar é o caminho mais barato pra qualquer meta.' },
  { q: 'Vale a pena começar com aporte pequeno?', a: 'Sim, sempre. Os primeiros R$ 100 ou R$ 200/mês criam o hábito, que é o mais importante. Em 5 anos você terá R$ 7.000-15.000 acumulados, o que já parece patrimônio de verdade e cria disciplina pra aumentar o aporte com tempo. Quem espera "ter condições" pra investir valor "que vale a pena" geralmente nunca começa. Aporte pequeno feito hoje supera aporte grande feito daqui a 5 anos.' },
  { q: 'Como a inflação corrói o valor da minha meta no futuro?', a: 'Com inflação de 4-5% a.a. (média histórica brasileira), R$ 1 milhão daqui a 20 anos vale aproximadamente R$ 380 mil em poder de compra de hoje. Em 30 anos, vale ~R$ 230 mil. Por isso, para metas de longo prazo, mire em valor inflado: se você quer "viver com R$ 5 mil/mês de hoje" daqui a 25 anos, precisa de R$ 12-15 mil/mês nominais, o que muda o tamanho da meta total.' },
  { q: 'Como compartilhar uma simulação específica desta calculadora?', a: 'Basta copiar a URL com os parâmetros: https://redentia.com.br/calculadora/quanto-investir?goal=1000000&years=20&rate=10 já abre a calculadora preenchida e calcula automaticamente. Útil pra mandar para o cônjuge, planejador financeiro ou salvar a meta nos favoritos do navegador.' },
  { q: 'Quanto investir aos 30 anos?', a: 'Aos 30 anos, o ideal é investir 20-25% da renda mensal. Quem ganha R$ 5.000 deveria aportar R$ 1.000-1.250/mês. A 10% a.a. ao longo de 30 anos, isso vira R$ 2,3-2,9 milhões. Antes de investir, garanta reserva de emergência (6-12 meses de despesas) em Tesouro Selic ou CDB com liquidez diária.' },
  { q: 'Qual a diferença entre renda fixa e renda variável?', a: 'Renda fixa tem rentabilidade contratada (Tesouro, CDB, LCI/LCA, fundos DI). O retorno é previsível, baixo risco, ideal pra reserva e curto prazo. Renda variável (ações, FIIs, ETFs) tem retorno incerto, maior risco, maior potencial. Carteira balanceada combina ambos: % de renda fixa = idade (30 anos = 30% RF, 60 anos = 60% RF) é uma regra clássica.' },
  { q: 'Onde investir o aporte mensal?', a: 'Depende do perfil. Conservador: 100% renda fixa (Tesouro Selic, CDB liquidez diária, LCI/LCA). Moderado: 60% renda fixa + 30% FIIs + 10% ações. Arrojado: 70% renda variável + 30% renda fixa. Para todos: comece com a reserva de emergência em Tesouro Selic, depois alocação por perfil.' },
  { q: 'Posso usar a mesma carteira a vida toda?', a: 'Não. A regra geral é diminuir gradualmente a renda variável conforme se aproxima dos objetivos. Aos 25-35 anos, 70-80% renda variável. 35-50 anos, 50-60% renda variável. 50+ anos, 30-40% renda variável. Próximo do uso (1-2 anos), migre tudo pra renda fixa segura pra evitar perdas em crises.' },
]

usePageSeo({
  title: 'Calculadora: Quanto Investir por Mês 2026 - Grátis',
  description:
    'Descubra quanto investir por mês para juntar R$ 100 mil, R$ 500 mil ou R$ 1 milhão. Tesouro Direto, CDB, LCI/LCA por perfil. Grátis, sem cadastro.',
  path: '/calculadora/quanto-investir',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadoras' },
    { name: 'Quanto Investir', path: '/calculadora/quanto-investir' },
  ],
  structuredData: [
    {
      '@type': 'WebApplication',
      name: 'Calculadora de Aporte Mensal Redentia',
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Planejamento financeiro',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      dateModified: lastUpdatedISO,
      description:
        'Calculadora gratuita que descobre o aporte mensal necessário pra atingir uma meta financeira em determinado prazo. Considera patrimônio inicial, taxa de retorno, ajuste pela inflação e cenários alternativos (esticar prazo, alterar aporte). Deep-link compartilhável com inputs pré-preenchidos.',
      featureList: [
        'Cálculo reverso de aporte mensal por meta financeira',
        'Considera patrimônio inicial e ajuste pela inflação',
        'Tabela de sensibilidade por taxa de retorno',
        'Cenários alternativos (aumentar 20%, reduzir 20%, esticar prazo)',
        'Composição patrimônio: aportes vs juros compostos',
        'Suporta metas de R$ 30 mil a R$ 10 milhões',
        'Deep-link compartilhável com inputs pré-preenchidos',
        'Cenários populares 1 clique (R$ 500 mil em 10 anos, R$ 1 milhão em 20 anos, etc.)',
        'Cálculo de viabilidade em tempo real',
        'Pt-BR com formatação brasileira',
      ],
      about: [
        { '@type': 'Organization', name: 'Banco Central do Brasil', url: 'https://www.bcb.gov.br' },
        { '@type': 'Organization', name: 'B3', url: 'https://www.b3.com.br' },
        { '@type': 'Organization', name: 'IBGE', url: 'https://www.ibge.gov.br' },
        { '@type': 'Organization', name: 'CVM', url: 'https://www.gov.br/cvm' },
        { '@type': 'Organization', name: 'Receita Federal', url: 'https://www.gov.br/receitafederal' },
      ],
    },
    // FAQPage é emitido pelo NuFaqAccordion — fonte única.
  ],
})
</script>

<template>
  <div>
    <!-- ============ Hero (texto antigo verbatim, visual Nu) ============ -->
    <section class="qi__hero">
      <div class="qi__status">
        <NuxtLink to="/calculadoras" class="qi__back">← Todas as calculadoras</NuxtLink>
        <span aria-hidden>·</span>
        <span>Atualizado {{ lastUpdatedText }}</span>
      </div>
      <p class="qi__eyebrow">Calculadora · Quanto Investir por Mês</p>
      <h1 class="qi__h1">
        Quanto Investir por Mês para Sua
        <em class="qi__italic">Meta.</em>
      </h1>
      <p class="qi__lead">
        Esta calculadora descobre quanto você precisa investir por mês para atingir uma meta financeira específica. Usa a fórmula do <strong>valor presente</strong> de uma série de pagamentos, considerando taxa de juros e prazo. Exemplo: pra juntar R$ 500.000 em 10 anos a 10% ao ano, aporta cerca de R$ 2.412 por mês, totalizando R$ 289.440 investidos e R$ 210.560 em juros.
      </p>
      <ul class="qi__chips">
        <li><span class="qi__chip-dot qi__chip-dot--positive" /> 100% gratuito</li>
        <li><span class="qi__chip-dot" /> Cálculo instantâneo</li>
        <li><span class="qi__chip-dot" /> Cálculo reverso por meta</li>
        <li><span class="qi__chip-dot" /> Link compartilhável</li>
      </ul>
    </section>

    <!-- ============ Calculadora interativa (design) ============ -->
    <QuantoInvestirCalc :seed="seed" section-id="aporte">
      <template #title>Aporte mensal.</template>
    </QuantoInvestirCalc>

    <!-- ============ Cenários populares (deep-links, texto verbatim) ============ -->
    <section class="qi__band qi__band--cream">
      <h2 class="qi__h2">Cenários populares de meta financeira</h2>
      <p class="qi__p qi__p--dek">
        Veja na hora o aporte mensal necessário para cada meta, basta clicar e a simulação carrega já preenchida.
      </p>
      <div class="qi__scenarios">
        <NuxtLink v-for="s in popularScenarios" :key="s.label + s.sub" :to="s.to" class="qi__scenario">
          <span class="qi__scenario-label">{{ s.label }}</span>
          <span class="qi__scenario-sub">{{ s.sub }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- ============ Conteúdo educacional (texto verbatim) ============ -->
    <section class="qi__band qi__band--white">
      <h2 class="qi__h2">Simulador de Aporte Mensal grátis e online</h2>
      <h2 class="qi__h2 qi__mt">Como Calcular Quanto Investir por Mês</h2>
      <p class="qi__p">
        A maioria das calculadoras te pergunta "quanto você vai investir" e mostra "quanto vai ter". Esta faz o caminho inverso: você define sua meta (R$ 500 mil, R$ 1 milhão, entrada de imóvel) e o prazo, e a calculadora descobre exatamente quanto precisa aportar todo mês para chegar lá.
      </p>
      <p class="qi__p">
        O cálculo usa a fórmula de anuidade dos juros compostos invertida, considerando seu patrimônio atual, a taxa de retorno esperada e, opcionalmente, o ajuste dos aportes pela inflação para preservar o poder de compra ao longo do tempo.
      </p>

      <h3 class="qi__h3">Por que Calcular Quanto Investir Faz Diferença</h3>
      <div class="qi__cards qi__cards--two">
        <div v-for="c in whyCards" :key="c.title" class="qi__card">
          <h4 class="qi__h4 qi__h4--accent">{{ c.title }}</h4>
          <p class="qi__card-p">{{ c.body }}</p>
        </div>
      </div>

      <h2 class="qi__h2 qi__mt">Educação Financeira Aplicada</h2>
      <p class="qi__p">
        Educação financeira é o ponto de partida do planejamento financeiro pessoal. Antes de saber quanto investir, é preciso entender 3 coisas: orçamento (regra 50/30/20 ou método dos 4 envelopes), reserva de emergência (6-12 meses de despesas em renda fixa líquida) e perfil de risco (conservador, moderado, arrojado). Sem esses três alicerces, qualquer aporte vira aposta. Com eles, o aporte vira plano e a meta vira rotina.
      </p>

      <h2 class="qi__h2 qi__mt">Reserva de Emergência: Antes de Tudo</h2>
      <p class="qi__p">
        Antes de aportar em metas de longo prazo, monte a reserva de emergência. Ela é o colchão financeiro que protege seu plano de imprevistos (desemprego, problema de saúde, conserto urgente) e impede que você venda investimentos de longo prazo em momentos ruins, cristalizando perdas.
      </p>
      <ul class="qi__list">
        <li v-for="it in reserveItems" :key="it.strong"><strong>{{ it.strong }}</strong>{{ it.text }}</li>
      </ul>

      <h2 class="qi__h2 qi__mt">Onde Investir o Aporte Mensal</h2>
      <p class="qi__p">
        Calcular o aporte é metade do trabalho. A outra metade é decidir onde alocar o dinheiro todo mês. A escolha depende do seu perfil de risco e do horizonte da meta. Veja a sugestão de carteira por perfil:
      </p>
      <div class="qi__cards qi__cards--three">
        <div v-for="c in profileCards" :key="c.title" class="qi__card">
          <h4 class="qi__h4 qi__h4--accent">{{ c.title }}</h4>
          <p class="qi__card-p">{{ c.body }}</p>
          <p class="qi__card-note">{{ c.note }}</p>
        </div>
      </div>

      <h2 class="qi__h2 qi__mt">Comparar CDB e Tesouro Direto</h2>
      <p class="qi__p">
        As duas alternativas mais usadas pra renda fixa no Brasil são Tesouro Direto (títulos do governo) e CDB (Certificado de Depósito Bancário emitido por bancos). Veja as diferenças que importam pra sua decisão:
      </p>
      <div class="qi__table-wrap">
        <table class="qi__table">
          <thead>
            <tr><th>Critério</th><th>Tesouro Direto</th><th>CDB</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in cdbTesouroRows" :key="r[0]">
              <td>{{ r[0] }}</td><td>{{ r[1] }}</td><td>{{ r[2] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="qi__small">
        Conclusão prática: pra reserva de emergência, Tesouro Selic costuma ser a opção mais simples e barata. Pra prazos mais longos, CDB de bancões médios pode pagar 110-120% do CDI, batendo o Tesouro Selic mesmo descontando o IR. Diversificar entre os dois faz sentido em carteiras maiores, e LCI/LCA podem complementar pra aportes específicos por serem isentas de IR pra pessoa física.
      </p>

      <h2 class="qi__h2 qi__mt">Fórmula do Aporte Mensal Necessário</h2>
      <p class="qi__p">
        A matemática por trás do cálculo é a fórmula de anuidade dos juros compostos invertida para isolar o aporte (PMT):
      </p>
      <div class="qi__formula-wrap">
        <CalcFormulaCard
          :terms="[
            { sym: 'PMT', desc: 'Aporte mensal necessário' },
            { sym: 'FV', desc: 'Valor futuro (sua meta)' },
            { sym: 'PV', desc: 'Valor presente (patrimônio atual)' },
            { sym: 'i', desc: 'Taxa mensal de retorno (taxa anual ÷ 12)' },
            { sym: 'n', desc: 'Número de meses (anos × 12)' },
          ]"
        >PMT = (FV − PV × (1 + i)ⁿ) ÷ [((1 + i)ⁿ − 1) ÷ i]</CalcFormulaCard>
      </div>

      <h2 class="qi__h2 qi__mt">Tabela de Aporte Mensal por Meta e Prazo (Taxa 10% a.a.)</h2>
      <p class="qi__p">
        A referência rápida para metas comuns considerando 10% a.a. de retorno (próximo da média histórica do CDI somado a uma fatia de bolsa):
      </p>
      <div class="qi__table-wrap">
        <table class="qi__table">
          <thead>
            <tr><th>Meta</th><th>5 anos</th><th>10 anos</th><th>15 anos</th><th>20 anos</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in goalTermRows" :key="r[0]">
              <td>{{ r[0] }}</td><td class="qi__td--accent">{{ r[1] }}</td><td>{{ r[2] }}</td><td>{{ r[3] }}</td><td>{{ r[4] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="qi__small">
        Note como dobrar o prazo reduz o aporte em mais de 50%. Esticar de 10 para 20 anos para a meta de R$ 500 mil reduz o aporte de R$ 2.412 para R$ 661, uma economia de quase R$ 1.800/mês.
      </p>

      <h2 class="qi__h2 qi__mt">Quanto Investir para Cada Tipo de Meta</h2>

      <h3 class="qi__h3">Reserva de Emergência</h3>
      <p class="qi__p">
        Meta: 3 a 12 meses de despesas. Para alguém com R$ 5 mil de gasto mensal, a reserva ideal é R$ 30 mil a R$ 60 mil. Por ser dinheiro de curto prazo, a calculadora costuma indicar aportes mais agressivos (R$ 800 a R$ 1.500/mês) em horizonte de 1 a 2 anos, em CDB de liquidez diária ou Tesouro Selic.
      </p>

      <h3 class="qi__h3">Entrada de Imóvel</h3>
      <p class="qi__p">
        Meta típica: R$ 80 mil a R$ 200 mil em 3 a 5 anos. A 10% a.a., R$ 100 mil em 3 anos exigem cerca de R$ 2.400/mês. Em 5 anos, cai para R$ 1.288/mês. Se você não tem pressa, esticar o prazo em 2 anos quase dobra o tempo até a chave, mas reduz drasticamente o sacrifício mensal.
      </p>

      <h3 class="qi__h3">Independência Financeira</h3>
      <p class="qi__p">
        Meta: 25× a despesa anual (regra dos 4%). Para uma pessoa que gasta R$ 8 mil/mês (R$ 96 mil/ano), o número mágico é R$ 2,4 milhões. Em 25 anos com 10% a.a., isso exige R$ 1.819/mês de aporte. Em 30 anos, cai para R$ 1.063/mês. Cada década adicionada divide o esforço quase pela metade.
      </p>

      <h3 class="qi__h3">Aposentadoria com R$ 800 mil</h3>
      <p class="qi__p">
        Meta clássica de classe média brasileira: aposentar com R$ 800 mil para complementar INSS. Em 25 anos, demanda R$ 606/mês a 10% a.a. Em 20 anos, R$ 1.058/mês. Use a <NuxtLink to="/calculadora/aposentadoria" class="qi__link qi__link--accent">calculadora de aposentadoria</NuxtLink> pra incluir INSS, expectativa de vida e regra dos 4% com mais detalhe.
      </p>

      <h2 class="qi__h2 qi__mt">Quanto da Renda Devo Investir?</h2>
      <div class="qi__table-wrap">
        <table class="qi__table">
          <thead>
            <tr><th>Perfil</th><th>% da renda</th><th>Renda R$ 5 mil</th><th>Patrimônio em 20 anos</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in incomeRows" :key="r[0]">
              <td>{{ r[0] }}</td><td>{{ r[1] }}</td><td>{{ r[2] }}</td><td class="qi__td--accent">{{ r[3] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ============ Como usar (steps 01-05 do design, texto verbatim) ============ -->
    <section class="qi__band qi__band--cream">
      <h2 class="qi__h2 qi__h2--center">Como Usar a Calculadora de Aporte Mensal</h2>
      <div class="qi__steps"><CalcSteps :steps="howToSteps" /></div>
    </section>

    <!-- ============ Quanto investir por idade (texto verbatim) ============ -->
    <section class="qi__band qi__band--white">
      <h2 class="qi__h2">Quanto Investir por Idade</h2>
      <p class="qi__p">
        O aporte ideal varia ao longo da vida. Quanto antes começar, menor o esforço mensal exigido pra alcançar metas relevantes. Veja a referência por faixa etária:
      </p>
      <div class="qi__table-wrap">
        <table class="qi__table">
          <thead>
            <tr><th>Idade</th><th>Aporte Sugerido</th><th>% da Renda</th><th>Meta Realista</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in ageRows" :key="r[0]">
              <td>{{ r[0] }}</td><td class="qi__td--accent">{{ r[1] }}</td><td>{{ r[2] }}</td><td>{{ r[3] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="qi__small">
        O princípio é simples: quem começa cedo precisa investir menos por mês porque os juros compostos trabalham por mais tempo. Dos 20 aos 35 anos o foco é construir hábito e reserva. Dos 35 aos 55 é a década de maior acúmulo, quando renda profissional costuma estar no pico. Acima dos 56, prioridade muda pra preservação do patrimônio e geração de renda recorrente, reduzindo gradualmente a renda variável.
      </p>
    </section>

    <!-- ============ FAQ (design 2 colunas, 15 perguntas verbatim) ============ -->
    <section class="qi__band qi__band--cream">
      <div class="qi__faq">
        <div class="qi__faq-left">
          <h2 class="qi__h2">Perguntas Frequentes sobre Aporte Mensal</h2>
          <NuxtLink to="/busca" class="qi__pill">Perguntar à Redentia AI</NuxtLink>
        </div>
        <div class="qi__faq-right">
          <NuFaqAccordion :items="faqItems" />
        </div>
      </div>
    </section>

    <!-- ============ Dicas (texto verbatim) ============ -->
    <section class="qi__band qi__band--white">
      <h2 class="qi__h2">Dicas para Cumprir o Aporte Mensal Calculado</h2>
      <div class="qi__cards qi__cards--two">
        <div v-for="c in tipCards" :key="c.title" class="qi__card">
          <h4 class="qi__h4 qi__h4--accent">{{ c.title }}</h4>
          <p class="qi__card-p">{{ c.body }}</p>
        </div>
      </div>
    </section>

    <!-- ============ Rankings + outras calculadoras + E-E-A-T + CTA ============ -->
    <section class="qi__band qi__band--cream">
      <h2 class="qi__h2">Rankings Relacionados</h2>
      <p class="qi__p qi__p--dek">
        Explore listas atualizadas diariamente com os melhores ativos da B3 para complementar sua análise.
      </p>
      <div class="qi__cards qi__cards--two qi__cards--links">
        <NuxtLink v-for="r in relatedRankings" :key="r.to" :to="r.to" class="qi__card qi__card--link">
          <h3 class="qi__h3 qi__h3--card">{{ r.title }}</h3>
          <p class="qi__card-p">{{ r.sub }}</p>
        </NuxtLink>
      </div>

      <h2 class="qi__h2 qi__mt">Outras Calculadoras</h2>
      <div class="qi__cards qi__cards--two qi__cards--links">
        <NuxtLink to="/calculadora/juros-compostos" class="qi__card qi__card--link">
          <h3 class="qi__h3 qi__h3--card">Juros Compostos</h3>
          <p class="qi__card-p">Simule quanto vai ter no futuro</p>
        </NuxtLink>
        <NuxtLink to="/calculadora/aposentadoria" class="qi__card qi__card--link">
          <h3 class="qi__h3 qi__h3--card">Aposentadoria</h3>
          <p class="qi__card-p">Planeje sua aposentadoria com regra dos 4%</p>
        </NuxtLink>
      </div>

      <aside class="qi__eeat">
        <p class="qi__p">
          Metodologia revisada pela equipe de análise da Redentia
        </p>
        <p class="qi__p">
          Cálculos baseados na fórmula de anuidade dos juros compostos invertida (PMT = (FV − PV(1+i)ⁿ) ÷ [((1+i)ⁿ − 1)÷i]) e em médias históricas do mercado brasileiro (CDI, Ibovespa, IPCA). Resultados assumem aportes mensais constantes e capitalização mensal dos rendimentos.
        </p>
        <p class="qi__small">
          Fontes: <a href="https://www.bcb.gov.br" target="_blank" rel="noopener nofollow" class="qi__link">Banco Central do Brasil</a>,
          <a href="https://www.b3.com.br" target="_blank" rel="noopener nofollow" class="qi__link">B3 (Brasil, Bolsa, Balcão)</a>,
          <a href="https://www.ibge.gov.br" target="_blank" rel="noopener nofollow" class="qi__link">IBGE</a>.
        </p>
      </aside>

      <div class="qi__cta">
        <h2 class="qi__cta-title">Acompanhe suas metas na Redentia</h2>
        <p class="qi__cta-sub">Monitore o progresso das suas metas financeiras com gráficos e análises em tempo real.</p>
        <div class="qi__cta-actions">
          <NuxtLink to="/login" class="qi__pill qi__pill--light">Criar conta grátis</NuxtLink>
          <NuxtLink to="/calculadoras" class="qi__pill qi__pill--outline">Ver mais calculadoras</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ——— hero ——— */
.qi__hero {
  background: var(--nu-cream);
  padding: clamp(48px, 6.5vw, 88px) clamp(22px, 5.5vw, 80px) clamp(40px, 5vw, 64px);
  animation: nu-fade .5s ease both;
}
.qi__status {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  color: var(--nu-gray); font-size: 13.5px; font-weight: 600; margin-bottom: 22px;
}
.qi__back { color: var(--nu-blue); font-weight: 800; }
.qi__back:hover { color: var(--nu-blue-hover); }
.qi__eyebrow { margin: 0; color: var(--nu-blue); font-size: clamp(16px, 1.5vw, 19px); font-weight: 800; }
.qi__h1 {
  margin: 12px 0 0; color: var(--nu-ink);
  font-size: clamp(34px, 4.6vw, 64px); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1.04; max-width: 1080px;
}
.qi__italic { font-style: italic; }
.qi__lead {
  color: var(--nu-gray-2); font-size: clamp(16px, 1.7vw, 19px); font-weight: 500;
  line-height: 1.6; margin: 20px 0 0; max-width: 780px;
}
.qi__lead strong { color: var(--nu-ink); font-weight: 800; }
.qi__chips { list-style: none; display: flex; gap: 10px; flex-wrap: wrap; margin: 26px 0 0; padding: 0; }
.qi__chips li {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--nu-white); border-radius: var(--nu-r-pill);
  padding: 9px 15px; color: var(--nu-ink); font-size: 13.5px; font-weight: 700;
}
.qi__chip-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--nu-blue); flex-shrink: 0; }
.qi__chip-dot--positive { background: var(--nu-green); }

/* ——— bandas ——— */
.qi__band { padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.qi__band--white { background: var(--nu-white); }
.qi__band--cream { background: var(--nu-cream); }
.qi__mt { margin-top: clamp(44px, 6vw, 72px); }

/* ——— tipografia do conteúdo ——— */
.qi__h2 {
  margin: 0; color: var(--nu-ink);
  font-size: clamp(28px, 3.4vw, 44px); font-weight: 800;
  letter-spacing: -0.035em; line-height: 1.08; max-width: 900px;
}
.qi__h2--center { text-align: center; max-width: none; font-size: clamp(32px, 4vw, 54px); letter-spacing: -0.04em; line-height: 1.06; }
.qi__h3 { margin: clamp(28px, 4vw, 44px) 0 0; color: var(--nu-ink); font-size: clamp(20px, 2.2vw, 26px); font-weight: 800; letter-spacing: -.3px; }
.qi__h3--card { margin: 0; font-size: 18px; }
.qi__h4 { margin: 0 0 8px; color: var(--nu-ink); font-size: 16.5px; font-weight: 800; letter-spacing: -.2px; }
.qi__h4--accent { color: var(--nu-blue); }
.qi__p {
  margin: 14px 0 0; color: var(--nu-gray-3); font-size: 16.5px; font-weight: 500;
  line-height: 1.65; max-width: 840px;
}
.qi__p--dek { color: var(--nu-gray-2); }
.qi__small { margin: 12px 0 0; color: var(--nu-gray); font-size: 14px; font-weight: 500; line-height: 1.6; max-width: 840px; }
.qi__link { text-decoration: underline; }
.qi__link:hover { color: var(--nu-blue); }
.qi__link--accent { color: var(--nu-blue); font-weight: 700; }
.qi__link--accent:hover { color: var(--nu-blue-hover); }
.qi__list {
  margin: 16px 0 0; padding-left: 20px; color: var(--nu-gray-3);
  font-size: 15px; font-weight: 500; line-height: 1.7; max-width: 840px;
}
.qi__list li { margin-top: 8px; }
.qi__list strong { color: var(--nu-ink); font-weight: 800; }

/* ——— cenários populares ——— */
.qi__scenarios {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px; margin-top: clamp(24px, 3.5vw, 36px);
}
.qi__scenario {
  background: var(--nu-white); border-radius: var(--nu-r-tile); padding: 16px 18px;
  display: flex; flex-direction: column; gap: 3px;
  transition: transform .18s, box-shadow .2s;
}
.qi__scenario:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.qi__scenario-label { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; letter-spacing: -.1px; }
.qi__scenario-sub { color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }

/* ——— cards educacionais ——— */
.qi__cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px; margin-top: clamp(20px, 3vw, 28px);
}
.qi__cards--two { grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr)); }
.qi__cards--three { grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); }
.qi__card { background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 24px; }
.qi__band--cream .qi__card { background: var(--nu-white); }
.qi__card--link { display: flex; flex-direction: column; gap: 6px; transition: transform .18s, box-shadow .2s; }
.qi__card--link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.qi__card-p { margin: 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }
.qi__card .qi__card-p { margin-top: 6px; }
.qi__card-note { margin: 10px 0 0; color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }

/* ——— fórmula ——— */
.qi__formula-wrap { max-width: 720px; margin-top: clamp(18px, 2.5vw, 26px); }

/* ——— tabelas ——— */
.qi__table-wrap {
  overflow-x: auto; background: var(--nu-cream);
  border-radius: var(--nu-r-panel); margin-top: clamp(20px, 3vw, 28px);
  max-width: 980px;
}
.qi__band--cream .qi__table-wrap { background: var(--nu-white); }
.qi__table { width: 100%; border-collapse: collapse; min-width: 560px; }
.qi__table th {
  text-align: left; padding: 14px 18px;
  color: var(--nu-gray); font-size: 12px; font-weight: 800;
  letter-spacing: .8px; text-transform: uppercase;
  border-bottom: 1.5px solid var(--nu-cream-line-2); white-space: nowrap;
}
.qi__table td {
  padding: 13px 18px; color: var(--nu-gray-3); font-size: 14.5px; font-weight: 600;
  border-bottom: 1.5px solid var(--nu-cream-line-2); font-variant-numeric: tabular-nums;
}
.qi__table tbody tr:last-child td { border-bottom: none; }
.qi__td--accent { color: var(--nu-blue); font-weight: 800; }

/* ——— steps ——— */
.qi__steps { margin-top: clamp(30px, 4vw, 48px); }

/* ——— FAQ 2 colunas (design) ——— */
.qi__faq { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.qi__faq-left { flex: 1 1 300px; min-width: min(280px, 100%); }
.qi__faq-right { flex: 1.6 1 480px; min-width: min(340px, 100%); }
.qi__faq-left .qi__h2 { font-size: clamp(32px, 4vw, 52px); letter-spacing: -0.04em; line-height: 1.06; }
.qi__faq-right :deep(.nfa__item) { background: var(--nu-white); }

/* ——— pills / E-E-A-T / CTA ——— */
.qi__pill {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.qi__pill:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.qi__eeat {
  background: var(--nu-white); border-radius: var(--nu-r-card-lg);
  padding: clamp(24px, 3vw, 36px); margin-top: clamp(44px, 6vw, 72px); max-width: 980px;
}
.qi__eeat .qi__p:first-child { margin-top: 0; font-weight: 700; color: var(--nu-ink); font-size: 15.5px; }
.qi__eeat .qi__p { font-size: 14.5px; }
.qi__cta {
  background: var(--nu-blue); border-radius: var(--nu-r-card-lg);
  padding: clamp(34px, 5vw, 60px); text-align: center; margin-top: clamp(44px, 6vw, 72px);
}
.qi__cta-title { margin: 0; color: var(--nu-white); font-size: clamp(26px, 3.4vw, 44px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.qi__cta-sub { margin: 14px auto 0; color: var(--nu-white-75); font-size: 16px; font-weight: 500; line-height: 1.6; max-width: 560px; }
.qi__cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 26px; }
.qi__cta .qi__pill { margin-top: 0; }
.qi__pill--light { background: var(--nu-cream); color: var(--nu-blue); }
.qi__pill--light:hover { background: var(--nu-white); color: var(--nu-blue-hover); }
.qi__pill--outline { background: transparent; border: 2px solid var(--nu-white-35); color: var(--nu-white); }
.qi__pill--outline:hover { background: var(--nu-white-14); color: var(--nu-white); }
</style>
