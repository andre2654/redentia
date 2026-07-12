<script setup lang="ts">
// /calculadora/juros-compostos — calculadora exemplar do PR10.
// Contrato de UX: docs/redentia-nu/designs/Redentia Calculadoras Nu.dc.html
// (sliders + número-herói + gráfico + steps + fórmula + FAQ accordion).
// Contrato de SEO (regra nº1): TODO o texto da página antiga
// (Frontend/app/pages/calculadora/juros-compostos.vue) verbatim, na MESMA
// ordem de tags (h1 → h2/h3/h4 → p → li → tabelas → FAQ). Muda o visual.
// Path antigo mantido (/calculadora/<slug>) — preserva URL equity.

const route = useRoute()

// deep-links ?initial=&monthly=&rate=&years= (comportamento portado do
// Compound.vue antigo — cenários populares carregam a simulação preenchida)
function parseNumberParam(value: unknown): number | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.trim() === '') return null
  const num = Number(raw.replace(',', '.'))
  return Number.isFinite(num) ? num : null
}

const seed = computed(() => {
  const q = route.query
  const initial = parseNumberParam(q.initial)
  const monthly = parseNumberParam(q.monthly)
  const rate = parseNumberParam(q.rate)
  const years = parseNumberParam(q.years)
  const months = parseNumberParam(q.months)
  if (initial === null && monthly === null && rate === null && years === null && months === null) return undefined
  return {
    initial: initial ?? undefined,
    monthly: monthly ?? undefined,
    rate: rate ?? undefined,
    years: years ?? (months !== null ? months / 12 : undefined),
  }
})

// Data de atualização dinâmica (sinal de frescor — portado da página antiga).
const CONTENT_VERSION = '2026-05-01'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
const lastUpdatedISO = lastUpdated.toISOString()

// Cenários populares — long-tail SEO via deep-links (texto/URLs verbatim).
const popularScenarios = [
  { label: 'R$ 100/mês por 30 anos', sub: 'Começando do zero', to: '/calculadora/juros-compostos?initial=0&monthly=100&rate=10.5&years=30' },
  { label: 'R$ 500/mês por 20 anos', sub: 'Cenário clássico', to: '/calculadora/juros-compostos?initial=0&monthly=500&rate=10.5&years=20' },
  { label: 'R$ 1.000/mês por 10 anos', sub: 'Médio prazo', to: '/calculadora/juros-compostos?initial=0&monthly=1000&rate=10.5&years=10' },
  { label: 'R$ 2.000/mês por 15 anos', sub: 'Acelerado', to: '/calculadora/juros-compostos?initial=0&monthly=2000&rate=10.5&years=15' },
  { label: 'R$ 10.000 inicial + R$ 500/mês', sub: 'Com capital inicial', to: '/calculadora/juros-compostos?initial=10000&monthly=500&rate=10.5&years=20' },
  { label: 'R$ 50.000 inicial sem aporte', sub: 'Renda passiva', to: '/calculadora/juros-compostos?initial=50000&monthly=0&rate=10.5&years=20' },
  { label: 'Aposentadoria, R$ 1.000/mês 35 anos', sub: 'Começando aos 30', to: '/calculadora/juros-compostos?initial=0&monthly=1000&rate=10.5&years=35' },
  { label: '1 milhão em 20 anos', sub: 'Quanto investir por mês', to: '/calculadora/juros-compostos?initial=0&monthly=1300&rate=10.5&years=20' },
  { label: 'Tesouro Selic, R$ 500/mês', sub: 'Taxa ~12% a.a.', to: '/calculadora/juros-compostos?initial=0&monthly=500&rate=12&years=20' },
  { label: 'Reserva de emergência', sub: 'R$ 300/mês por 2 anos', to: '/calculadora/juros-compostos?initial=0&monthly=300&rate=12&years=2' },
  { label: 'CDB 110% CDI, R$ 1.000/mês', sub: 'Taxa ~13% a.a.', to: '/calculadora/juros-compostos?initial=0&monthly=1000&rate=13&years=10' },
  { label: 'Bolsa B3, R$ 500/mês', sub: 'Taxa histórica ~14% a.a.', to: '/calculadora/juros-compostos?initial=0&monthly=500&rate=14&years=20' },
]

const whyCards = [
  { title: 'Efeito Bola de Neve', body: 'Quanto mais tempo seu dinheiro fica investido, maior é o efeito dos juros compostos. Os rendimentos geram novos rendimentos, criando um crescimento exponencial.' },
  { title: 'Vantagem do Tempo', body: 'Começar cedo faz toda diferença. 10 anos a mais de investimento podem dobrar ou triplicar seu patrimônio final, mesmo com aportes menores.' },
  { title: 'Aportes Regulares', body: 'Investir mensalmente acelera o crescimento. Cada novo aporte começa imediatamente a gerar juros compostos.' },
  { title: 'Proteção Contra Inflação', body: 'Com taxas de retorno acima da inflação, seu poder de compra cresce ao longo do tempo, garantindo um futuro mais confortável.' },
  { title: 'Ibovespa: ~14% a.a. histórica', body: 'O índice Ibovespa, referência da bolsa brasileira, entregou cerca de 14% a.a. nos últimos 30 anos. É um benchmark útil pra calibrar a taxa real que você usa nas simulações de longo prazo.' },
]

const horizonRows = [
  ['5 anos', 'R$ 30.000', 'R$ 38.753', 'R$ 8.753', '1,29×'],
  ['10 anos', 'R$ 60.000', 'R$ 102.422', 'R$ 42.422', '1,71×'],
  ['20 anos', 'R$ 120.000', 'R$ 379.684', 'R$ 259.684', '3,16×'],
  ['30 anos', 'R$ 180.000', 'R$ 1.130.244', 'R$ 950.244', '6,28×'],
]

const simpleVsCompoundRows = [
  ['Cálculo', 'Apenas sobre o capital inicial', 'Sobre capital + rendimentos'],
  ['Crescimento', 'Linear', 'Exponencial'],
  ['Exemplo (R$ 1.000 a 10% a.a. por 10 anos)', 'R$ 2.000', 'R$ 2.594'],
  ['Uso comum', 'Empréstimos de curto prazo', 'Investimentos de longo prazo'],
]

const poupancaRows = [
  ['Poupança', '6,5% a.a.', '6,5% (isenta)', 'R$ 244.000', 'base'],
  ['Tesouro Selic', '12% a.a.', '10,2% (15% IR)', 'R$ 410.000', '+R$ 166.000'],
  ['CDB 110% CDI', '13,2% a.a.', '11,2% (15% IR)', 'R$ 460.000', '+R$ 216.000'],
  ['LCI/LCA 95% CDI', '11,4% a.a.', '11,4% (isenta)', 'R$ 472.000', '+R$ 228.000'],
]

const howToSteps = [
  { title: 'Defina o Valor Inicial', html: 'Insira quanto você tem disponível para investir hoje. Pode ser zero se você ainda não tem capital inicial.' },
  { title: 'Configure os Aportes Mensais', html: 'Defina quanto você consegue investir por mês. Mesmo valores pequenos fazem grande diferença no longo prazo.' },
  { title: 'Escolha a Taxa de Juros', html: 'Use uma taxa realista. Para renda fixa, considere 10-13% a.a. Para ações, o histórico é de 12-15% a.a., mas com mais volatilidade.' },
  { title: 'Defina o Período', html: 'Quanto mais tempo, maior o efeito dos juros compostos. Pense no longo prazo: 10, 20 ou 30 anos.' },
  { title: 'Analise os Resultados', html: 'Veja o montante final, total de juros ganhos e um gráfico mostrando a evolução do seu patrimônio mês a mês.' },
]

const productCards = [
  { title: 'Tesouro Selic 2030', body: 'Liquidez diária, rende próximo da Selic, ideal pra reserva de emergência e capital que você pode precisar a qualquer momento. IR regressivo de 22,5% a 15% conforme o tempo.' },
  { title: 'Tesouro IPCA+ 2035', body: 'Protege da inflação, juros reais ~6% acima do IPCA. Ideal pra metas de longo prazo (aposentadoria, faculdade dos filhos). Marcação a mercado pode oscilar antes do vencimento.' },
  { title: 'CDB com liquidez diária', body: 'Costuma render 90-100% do CDI em bancos grandes. Conta com a proteção do FGC até R$ 250 mil por CPF e por instituição. Bom substituto pro Tesouro Selic em alguns cenários.' },
  { title: 'LCI/LCA', body: 'Costumam render 90-100% do CDI e são isentas de IR pra pessoa física. Carência de 90 dias a 3 anos, então só servem pra capital que você não vai mexer nesse prazo. Também cobertas pelo FGC.' },
]

const tipCards = [
  { title: '1. Comece Agora', body: 'O melhor momento para começar a investir foi há 10 anos. O segundo melhor momento é agora. Mesmo com valores pequenos, comece hoje.' },
  { title: '2. Seja Consistente', body: 'Aportes mensais regulares, mesmo que pequenos, têm impacto maior que investimentos irregulares de valores maiores.' },
  { title: '3. Reinvista os Rendimentos', body: 'Nunca retire os rendimentos. Deixe-os reinvestidos para maximizar o efeito dos juros compostos.' },
  { title: '4. Aumente os Aportes', body: 'Sempre que receber um aumento ou bônus, aumente proporcionalmente seus aportes mensais.' },
  { title: '5. Escolha Bons Investimentos', body: 'Busque investimentos com boa rentabilidade, baixas taxas de administração e adequados ao seu perfil de risco.' },
  { title: '6. Tenha Paciência', body: 'Os juros compostos são poderosos, mas precisam de tempo. Pense em décadas, não em meses.' },
]

const relatedRankings = [
  { to: '/ranking/maiores-dividend-yield', title: 'Onde aplicar buscando dividendos', sub: 'Top 50 ações e FIIs por DY na B3' },
  { to: '/ranking/maiores-receitas', title: 'Maiores empresas da B3', sub: 'Receita TTM ranqueada do maior pro menor' },
]

// FAQs verbatim da página antiga (13). O FAQPage JSON-LD é emitido pelo
// NuFaqAccordion — fonte única, mesmo padrão do app antigo.
const faqItems = [
  { q: 'Qual a diferença entre juros simples e compostos?', a: 'Juros simples incidem apenas sobre o capital inicial, resultando em crescimento linear. Juros compostos incidem sobre o capital + rendimentos acumulados, gerando crescimento exponencial. Exemplo: R$ 1.000 a 10% a.a. por 10 anos rende R$ 2.000 com juros simples, mas R$ 2.594 com compostos. Em prazos longos a diferença é gigante.' },
  { q: 'Qual é uma taxa de retorno realista para investimentos no Brasil?', a: 'Depende do produto: Tesouro Selic e CDBs de bancões pagam ~CDI (12-13% a.a. em 2026). Tesouro IPCA+ paga IPCA + 6% a.a. (~10-12% nominal). FIIs costumam render 8-12% a.a. em dividendos + valorização. Bolsa B3 historicamente entrega 12-15% a.a., mas com forte volatilidade. Carteira diversificada (60% renda variável + 40% renda fixa) tende a 10-12% a.a. no longo prazo.' },
  { q: 'É melhor investir tudo no início ou fazer aportes mensais?', a: 'Se você tem um valor grande disponível, investir tudo no início geralmente rende mais porque o dinheiro fica mais tempo aplicado. Aportes mensais têm vantagens: reduzem risco de timing (você compra em diferentes momentos), facilitam disciplina financeira e permitem começar mesmo sem muito capital. O ideal é combinar: investir o que tem disponível + manter aportes regulares automáticos.' },
  { q: 'Quanto tempo leva para dobrar meu dinheiro? (Regra de 72)', a: 'Use a Regra de 72: divida 72 pela taxa de juros anual para saber em quantos anos seu dinheiro dobra. A 6% a.a. = 12 anos (72÷6). A 10% a.a. = 7,2 anos (72÷10). A 12% a.a. = 6 anos (72÷12). A 15% a.a. = 4,8 anos (72÷15). É uma aproximação muito precisa para taxas entre 6% e 15%.' },
  { q: 'Poupança ou Tesouro Selic: qual rende mais?', a: 'Tesouro Selic SEMPRE rende mais que poupança. Em 2026, com Selic em 12%, poupança rende 6,5% a.a. (70% da Selic + TR), Tesouro Selic rende ~12% a.a. (descontado 15% IR após 2 anos = 10,2% líquido). Em 20 anos com R$ 500/mês, a diferença passa de R$ 165 mil. A única vantagem da poupança é simplicidade extrema. Pra qualquer valor acima de R$ 100, Tesouro Selic é estritamente melhor.' },
  { q: 'LCI e LCA valem a pena com juros compostos?', a: 'Sim, especialmente pra investidor com IR alto. LCI/LCA são isentas, então 95% CDI rende como ~11,4% a.a. líquido. Comparado a CDB de 110% CDI (rende ~11,2% a.a. líquido após 15% IR), LCI/LCA empata ou ganha. Desvantagem: prazo de carência de 90 dias a 3 anos. Use pra capital que você não vai precisar nesse prazo.' },
  { q: 'Como funciona a Regra de 72?', a: 'A Regra de 72 estima em quanto tempo seu dinheiro dobra: divida 72 pela taxa anual. A 6% a.a. = 12 anos. A 10% a.a. = 7,2 anos. A 12% a.a. = 6 anos. A 15% = 4,8 anos. É uma aproximação muito boa pra taxas entre 6% e 15%. Tripla? Use Regra de 114. Quadruplicar? Regra de 144.' },
  { q: 'Os impostos afetam os juros compostos? Quanto?', a: 'Sim, e bastante. Renda fixa tem IR regressivo: 22,5% (até 180 dias) → 20% → 17,5% → 15% (após 720 dias). Ações têm 15% sobre ganho de capital se vendas mensais > R$ 20 mil; dividendos isentos. FIIs têm dividendos isentos e 20% sobre ganho de capital. LCI/LCA são isentos. Idealmente simule com retornos líquidos: subtraia ~15-20% nas projeções de longo prazo.' },
  { q: 'Devo considerar a inflação no cálculo dos juros compostos?', a: 'Absolutamente. Se você rende 10% mas a inflação foi 5%, seu retorno real é cerca de 5% (poder de compra). Para metas de longo prazo (aposentadoria, educação dos filhos), pense sempre em taxas reais (acima da inflação). No Brasil, inflação histórica média gira em 4-6% a.a. Busque retornos que entreguem pelo menos 5-8% acima da inflação após impostos.' },
  { q: 'Posso usar essa calculadora para qualquer tipo de investimento?', a: 'Sim, mas com escopos diferentes: para renda fixa (Tesouro, CDB, LCI/LCA) o resultado é bem preciso, já que a taxa é contratada. Para ações e FIIs, use médias históricas, mas lembre que o retorno real flutua, alguns anos sobem 30%, outros caem 20%. Para análise de ações específicas com dados reais use o nosso simulador de ações.' },
  { q: 'Qual o impacto de aumentar o aporte mensal em 20%?', a: 'Bem maior do que parece. Investindo R$ 500/mês a 10% a.a. por 20 anos: R$ 380 mil. Aumentando 20% para R$ 600/mês: R$ 458 mil. Diferença de R$ 78 mil. Em 30 anos a diferença passa de R$ 200 mil. Pequenos aumentos consistentes em aportes mensais valem mais do que grandes aportes esporádicos.' },
  { q: 'Com que frequência devo revisar meus investimentos?', a: 'Revise a estratégia geral a cada 6-12 meses ou em mudanças significativas (aumento de renda, novo objetivo, evento de mercado). Evite mexer em investimentos de longo prazo com frequência, isso quebra o efeito dos juros compostos e pode disparar IR. Mantenha a disciplina: aporte automático mensal + revisão semestral é o suficiente.' },
  { q: 'Qual a importância de começar a investir cedo?', a: 'Decisiva. R$ 300/mês a 10% a.a.: começando aos 25 até os 65 (40 anos) = R$ 1,9 milhão. Aos 35 até 65 (30 anos) = R$ 679 mil. Aos 45 até 65 (20 anos) = R$ 229 mil. Cada década perdida custa ~3x o valor final. Mesmo R$ 50/mês começando aos 20 supera R$ 500/mês começando aos 40, em montante final.' },
  { q: 'Como compartilhar uma simulação específica?', a: 'Basta copiar a URL com os parâmetros: https://redentia.com.br/calculadora/juros-compostos?initial=10000&monthly=500&rate=10.5&years=20 já abre a calculadora preenchida e calcula automaticamente. Útil pra mandar para o cônjuge, planejador financeiro ou salvar a meta nos favoritos.' },
]

usePageSeo({
  title: 'Calculadora de Juros Compostos 2026 - Grátis',
  description:
    'Calcule juros compostos com aportes mensais. Poupança vs Tesouro Selic vs CDB, regra de 72, simulação 5 a 30 anos. Gráfico interativo. Grátis.',
  path: '/calculadora/juros-compostos',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadoras' },
    { name: 'Juros Compostos', path: '/calculadora/juros-compostos' },
  ],
  structuredData: [
    {
      '@type': 'WebApplication',
      name: 'Calculadora de Juros Compostos Redentia',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      dateModified: lastUpdatedISO,
      description:
        'Calculadora gratuita de juros compostos com aportes mensais. Mostra evolução patrimonial em gráfico interativo, tabela comparativa por horizonte (5, 10, 20, 30 anos), comparação simples vs compostos e cenários populares pré-preenchidos via URL.',
      featureList: [
        'Cálculo de juros compostos com aportes mensais',
        'Simulação de 1 a 40 anos',
        'Gráfico de evolução patrimonial mês a mês',
        'Comparação de cenários com taxas distintas',
        'Regra de 72 integrada',
        'Tabela de rendimento por horizonte temporal',
        'Deep-link compartilhável com inputs pré-preenchidos',
        'Cenários populares 1 clique (R$ 100, R$ 500, R$ 1.000/mês)',
        // era 'Suporta capitalização ao ano e ao mês' na antiga — a calculadora
        // Nu só tem taxa anual (design); claim de JSON-LD precisa ser verdadeiro.
        'Conversão automática da taxa anual em capitalização mensal',
      ],
      about: [
        { '@type': 'Organization', name: 'Banco Central do Brasil', url: 'https://www.bcb.gov.br' },
        { '@type': 'Organization', name: 'B3', url: 'https://www.b3.com.br' },
        { '@type': 'Thing', name: 'Juros compostos' },
        { '@type': 'Thing', name: 'Regra de 72' },
      ],
    },
  ],
})
</script>

<template>
  <div>
    <!-- ============ Hero compacto (direção André: botão + h1 + 1 linha) ============ -->
    <CalcHero desc="Simule quanto seu dinheiro vira com aportes mensais e tempo.">
      Calculadora de Juros Compostos 2026: Simulador com Aportes
      <em>Mensais.</em>
    </CalcHero>

    <!-- ============ Calculadora interativa (design) ============ -->
    <CalcCompoundSection :seed="seed" section-id="juros">
      <template #title>Juros compostos.</template>
    </CalcCompoundSection>

    <!-- eyebrow antigo + chips + atualizado (saíram do hero, texto preservado) -->
    <CalcMetaStrip
      label="Calculadora · Juros Compostos"
      :chips="['100% gratuito', 'Cálculo instantâneo', 'Gráfico mês a mês', 'Link compartilhável']"
      :updated="lastUpdatedText"
    />

    <!-- ============ Cenários populares (deep-links, texto verbatim) ============ -->
    <CalcBand tone="cream" title="Cenários populares de investimento">
      <template #dek>
        <p>Veja na hora o resultado dos cenários mais buscados, basta clicar e a simulação carrega já preenchida.</p>
      </template>
      <div class="jc__scenarios">
        <NuxtLink v-for="s in popularScenarios" :key="s.label" :to="s.to" class="jc__scenario">
          <span class="jc__scenario-label">{{ s.label }}</span>
          <span class="jc__scenario-sub">{{ s.sub }}</span>
        </NuxtLink>
      </div>
    </CalcBand>

    <!-- ============ Conteúdo educacional (texto verbatim, bandas do design) ============ -->
    <CalcSplit tone="white">
      <template #title>Simulador de juros compostos grátis e online</template>
      <div class="jc__prose">
        <!-- 1º parágrafo = lead de SEO que saiu do hero compacto (verbatim) -->
        <p>Juros compostos são os juros sobre juros, calculados pela fórmula <strong>M = C×(1+i)ⁿ</strong>. Exemplo: R$ 500 investidos por mês a 10,5% ao ano durante 20 anos viram R$ 410.000, sendo R$ 290.000 só de juros. Quanto maior o prazo, mais o rendimento cresce de forma exponencial.</p>
        <p>Use a calculadora acima para simular o rendimento de qualquer aporte com juros compostos em segundos. Ideal pra planejar aposentadoria, metas e reserva de longo prazo.</p>
      </div>
    </CalcSplit>

    <CalcSplit tone="cream">
      <template #title>O que são Juros Compostos?</template>
      <div class="jc__prose">
        <p>Juros compostos são os "juros sobre juros", ou seja, quando você ganha retorno não apenas sobre o capital inicial, mas também sobre os rendimentos acumulados. É o conceito mais poderoso das finanças pessoais e o segredo para construir riqueza a longo prazo.</p>
        <p>Albert Einstein teria dito que "os juros compostos são a força mais poderosa do universo". E de fato, quando você entende como funcionam, percebe o impacto transformador que podem ter no seu patrimônio.</p>
      </div>
    </CalcSplit>

    <CalcBand tone="white" title-tag="h3" title="Por que Investir com Juros Compostos?">
      <div class="jc__tiles">
        <div v-for="c in whyCards" :key="c.title" class="jc__tile">
          <h4 class="jc__h4 jc__h4--accent">{{ c.title }}</h4>
          <p class="jc__card-p">{{ c.body }}</p>
        </div>
      </div>
    </CalcBand>

    <CalcSplit tone="white">
      <template #title>Como Calcular Juros Compostos: Fórmula Completa</template>
      <template #left>
        <h3 class="jc__sub">Fórmula Matemática</h3>
        <p class="jc__sub-p">A fórmula básica dos juros compostos é:</p>
      </template>
      <CalcFormulaCard
        :terms="[
          { sym: 'M', desc: 'Montante final (valor futuro)' },
          { sym: 'C', desc: 'Capital inicial' },
          { sym: 'i', desc: 'Taxa de juros por período' },
          { sym: 'n', desc: 'Número de períodos' },
        ]"
      >M = C × (1 + i)ⁿ</CalcFormulaCard>
    </CalcSplit>

    <CalcSplit tone="cream" title-tag="h3" size="sm">
      <template #title>Com Aportes Mensais</template>
      <template #dek>
        <p>Quando você faz aportes regulares, a fórmula se torna um pouco mais complexa:</p>
      </template>
      <CalcFormulaCard
        tone="white"
        :terms="[
          { sym: 'P', desc: 'Valor do aporte mensal' },
        ]"
      >M = C × (1 + i)ⁿ + P × [((1 + i)ⁿ - 1) / i]</CalcFormulaCard>
      <p class="jc__small">Os demais valores seguem a mesma definição</p>
    </CalcSplit>

    <CalcBand tone="white" title="Quanto Rende R$ 500 por Mês em Juros Compostos? (5, 10, 20 e 30 anos)">
      <template #dek>
        <p>A melhor forma de entender o poder dos juros compostos é ver o que acontece com o mesmo aporte em horizontes diferentes. Na tabela abaixo, simulamos R$ 500 investidos por mês a 10% ao ano (taxa próxima da média histórica da bolsa brasileira):</p>
      </template>
      <div class="jc__band-body">
        <CalcTableCard
          tone="cream"
          :columns="['Prazo', 'Total Investido', 'Montante Final', 'Juros Acumulados', 'Multiplicador']"
          :rows="horizonRows"
          :accent-col="2"
          note="Observe o salto entre 20 e 30 anos: dobrar o tempo triplica o resultado. Esse é o efeito exponencial dos juros compostos, ele não é linear, cresce cada vez mais rápido no final."
        />
      </div>
    </CalcBand>

    <CalcBand tone="cream" title="Exemplos Práticos de Juros Compostos">
      <div class="jc__ex-grid">
        <div>
          <h3 class="jc__ex-title">Exemplo 1: Investimento Inicial sem Aportes</h3>
          <div class="jc__ex-card">
            <h4 class="jc__h4">Cenário</h4>
            <ul class="jc__list">
              <li>Investimento inicial: R$ 10.000</li>
              <li>Taxa de juros: 10% ao ano</li>
              <li>Período: 20 anos</li>
              <li>Sem aportes mensais</li>
            </ul>
            <div class="jc__result-box">
              <p class="jc__result-main">Resultado: R$ 67.275,00</p>
              <p class="jc__result-sub">Ganho de R$ 57.275 (572% de rentabilidade)</p>
            </div>
          </div>
        </div>
        <div>
          <h3 class="jc__ex-title">Exemplo 2: Com Aportes Mensais</h3>
          <div class="jc__ex-card">
            <h4 class="jc__h4">Cenário</h4>
            <ul class="jc__list">
              <li>Investimento inicial: R$ 10.000</li>
              <li>Aporte mensal: R$ 500</li>
              <li>Taxa de juros: 10% ao ano</li>
              <li>Período: 20 anos</li>
            </ul>
            <div class="jc__result-box">
              <p class="jc__result-main">Resultado: R$ 450.192,00</p>
              <p class="jc__result-sub">Total investido: R$ 130.000 | Ganho: R$ 320.192</p>
            </div>
          </div>
        </div>
      </div>

      <h3 class="jc__ex-title jc__ex-title--center">Exemplo 3: Começando Cedo</h3>
      <div class="jc__ex-grid">
        <div class="jc__ex-card">
          <h4 class="jc__h4 jc__h4--accent">João - Começou aos 25 anos</h4>
          <ul class="jc__list">
            <li>Aporte mensal: R$ 500</li>
            <li>Até os 65 anos (40 anos)</li>
            <li>Taxa: 10% ao ano</li>
          </ul>
          <div class="jc__result-box">
            <p class="jc__result-main">R$ 3.162.039,00</p>
            <p class="jc__result-sub">Investido: R$ 240.000</p>
          </div>
        </div>
        <div class="jc__ex-card">
          <h4 class="jc__h4 jc__h4--negative">Maria - Começou aos 35 anos</h4>
          <ul class="jc__list">
            <li>Aporte mensal: R$ 500</li>
            <li>Até os 65 anos (30 anos)</li>
            <li>Taxa: 10% ao ano</li>
          </ul>
          <div class="jc__result-box jc__result-box--negative">
            <p class="jc__result-main">R$ 1.130.244,00</p>
            <p class="jc__result-sub">Investido: R$ 180.000</p>
          </div>
        </div>
      </div>
      <p class="jc__ex-note">João investiu apenas R$ 60.000 a mais, mas terminou com R$ 2 milhões a mais que Maria! Isso é o poder de começar cedo.</p>
    </CalcBand>

    <CalcBand tone="white" title="Juros Simples vs Juros Compostos">
      <div class="jc__band-body">
        <CalcTableCard
          tone="cream"
          :columns="['Característica', 'Juros Simples', 'Juros Compostos']"
          :rows="simpleVsCompoundRows"
          :accent-col="2"
        />
      </div>
    </CalcBand>

    <CalcBand tone="white" title="Poupança vs Juros Compostos: Por Que a Poupança é o Pior Investimento">
      <template #dek>
        <p>A poupança rende 70% da Selic + TR (quando Selic está acima ou igual a 8,5%) ou 0,5% ao mês + TR (quando Selic abaixo de 8,5%). Em 2026 com Selic em 12%, poupança rende cerca de 6,5% a.a. Já o Tesouro Selic, considerado o investimento mais seguro do Brasil, rende próximo da Selic integral, ou seja, ~12% a.a. Mesmo após o IR, ainda ganha de longe da poupança.</p>
      </template>
      <div class="jc__band-body">
        <CalcTableCard
          tone="cream"
          :columns="['Investimento', 'Taxa Bruta', 'Após IR', 'Total em 20 anos', 'Diferença vs Poupança']"
          :rows="poupancaRows"
          :accent-col="3"
          note="Cenário: aporte de R$ 500/mês durante 20 anos. A poupança não acompanha a inflação na maioria dos cenários. Mesmo com a isenção de IR, perde pra Tesouro Selic e CDB com folga."
        />
      </div>
    </CalcBand>

    <!-- ============ Como usar (anatomia EXATA do design: banda creme + card branco de steps) ============ -->
    <CalcBand tone="cream" title="Como Usar a Calculadora de Juros Compostos">
      <div class="jc__band-body"><CalcSteps :steps="howToSteps" /></div>
    </CalcBand>

    <!-- ============ Onde aplicar (split: título à esquerda, tiles à direita) ============ -->
    <CalcSplit tone="white">
      <template #title>Tesouro Direto, CDB, LCI e LCA: Onde Aplicar Juros Compostos</template>
      <template #dek>
        <p>Os juros compostos só funcionam de verdade quando você aplica em produtos com retorno consistente. Os 4 mais usados no Brasil hoje:</p>
      </template>
      <div class="jc__tiles jc__tiles--two">
        <div v-for="c in productCards" :key="c.title" class="jc__tile">
          <h4 class="jc__h4 jc__h4--accent">{{ c.title }}</h4>
          <p class="jc__card-p">{{ c.body }}</p>
        </div>
      </div>
    </CalcSplit>

    <!-- ============ FAQ (anatomia EXATA do design: banda creme, cards brancos, pill IA) ============ -->
    <CalcSplit tone="cream" wide>
      <template #title>Perguntas Frequentes sobre Juros Compostos</template>
      <template #left>
        <NuxtLink to="/busca" class="jc__pill">Perguntar à Redentia AI</NuxtLink>
      </template>
      <NuFaqAccordion :items="faqItems" surface="white" />
    </CalcSplit>

    <!-- ============ Dicas (texto verbatim) ============ -->
    <CalcBand tone="white" title="Dicas para Maximizar Seus Juros Compostos">
      <div class="jc__tiles">
        <div v-for="c in tipCards" :key="c.title" class="jc__tile">
          <h4 class="jc__h4 jc__h4--accent">{{ c.title }}</h4>
          <p class="jc__card-p">{{ c.body }}</p>
        </div>
      </div>
    </CalcBand>

    <!-- ============ Rankings + outras calculadoras + E-E-A-T + CTA ============ -->
    <CalcBand tone="cream" title="Rankings Relacionados">
      <template #dek>
        <p>Explore listas atualizadas diariamente com os melhores ativos da B3 para complementar sua análise.</p>
      </template>
      <div class="jc__grid-cards">
        <NuxtLink v-for="r in relatedRankings" :key="r.to" :to="r.to" class="jc__card-link">
          <h3 class="jc__card-link-title">{{ r.title }}</h3>
          <p class="jc__card-p">{{ r.sub }}</p>
        </NuxtLink>
      </div>
    </CalcBand>

    <CalcBand tone="cream" title="Outras Calculadoras">
      <div class="jc__grid-cards">
        <NuxtLink to="/calculadora/acoes" class="jc__card-link">
          <h3 class="jc__card-link-title">Simulador de Ações</h3>
          <p class="jc__card-p">Analise investimentos em ações reais da B3</p>
        </NuxtLink>
        <NuxtLink to="/calculadora/planejamento" class="jc__card-link">
          <h3 class="jc__card-link-title">Planejamento Patrimonial</h3>
          <p class="jc__card-p">Calcule quanto investir para suas metas</p>
        </NuxtLink>
      </div>

      <aside class="jc__eeat">
        <p class="jc__eeat-title">Metodologia revisada pela equipe de análise da Redentia</p>
        <p class="jc__eeat-p">
          Cálculos baseados nas fórmulas oficiais de matemática financeira (M = C × (1 + i)ⁿ) e em médias históricas do mercado brasileiro (CDI, Ibovespa, IPCA). As simulações assumem juros capitalizados mensalmente e reinvestimento integral dos rendimentos.
        </p>
        <p class="jc__eeat-small">
          Fontes: <a href="https://www.bcb.gov.br" target="_blank" rel="noopener nofollow" class="jc__link">Banco Central do Brasil</a>,
          <a href="https://www.b3.com.br" target="_blank" rel="noopener nofollow" class="jc__link">B3 (Brasil, Bolsa, Balcão)</a>,
          <a href="https://www.ibge.gov.br" target="_blank" rel="noopener nofollow" class="jc__link">IBGE</a>.
        </p>
      </aside>

      <div class="jc__cta">
        <h2 class="jc__cta-title">Quer acompanhar seus investimentos reais?</h2>
        <p class="jc__cta-sub">Cadastre-se na Redentia e monitore sua carteira com análises em tempo real e IA.</p>
        <div class="jc__cta-actions">
          <NuxtLink to="/login" class="jc__pill jc__pill--light">Criar conta grátis</NuxtLink>
          <NuxtLink to="/guias" class="jc__pill jc__pill--outline">Ver mais guias</NuxtLink>
        </div>
      </div>
    </CalcBand>
  </div>
</template>

<style scoped>
/* ——— tipografia compartilhada ——— */
.jc__h4 { margin: 0 0 8px; color: var(--nu-ink); font-size: 16.5px; font-weight: 800; letter-spacing: -.2px; }
.jc__h4--accent { color: var(--nu-blue); }
.jc__h4--negative { color: var(--nu-red); }
.jc__small { margin: 14px 0 0; color: var(--nu-gray); font-size: 14px; font-weight: 500; line-height: 1.6; }
.jc__link { text-decoration: underline; }
.jc__link:hover { color: var(--nu-blue); }

/* ——— prosa da coluna direita (bandas split do design) ——— */
.jc__prose p {
  margin: 0 0 16px; color: var(--nu-gray-3); font-size: 17px; font-weight: 500;
  line-height: 1.7;
}
.jc__prose p:last-child { margin-bottom: 0; }
.jc__prose strong { color: var(--nu-ink); font-weight: 800; }

/* ——— sub-heading dentro da coluna esquerda do split ——— */
.jc__sub { margin: clamp(24px, 3vw, 34px) 0 0; color: var(--nu-ink); font-size: 20px; font-weight: 800; letter-spacing: -.3px; }
.jc__sub-p { margin: 10px 0 0; color: var(--nu-gray-2); font-size: 16px; font-weight: 500; line-height: 1.6; max-width: 420px; }

/* ——— corpo de banda centrada (card 1080 do design) ——— */
.jc__band-body { margin-top: clamp(30px, 4vw, 48px); }

/* ——— cenários populares ——— */
.jc__scenarios {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px; margin-top: clamp(24px, 3.5vw, 36px);
}
.jc__scenario {
  background: var(--nu-white); border-radius: var(--nu-r-tile); padding: 16px 18px;
  display: flex; flex-direction: column; gap: 3px;
  transition: transform .18s, box-shadow .2s;
}
.jc__scenario:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.jc__scenario-label { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; letter-spacing: -.1px; }
.jc__scenario-sub { color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }

/* ——— tiles (grid de cards pequenos, mesma família do hub) ——— */
.jc__tiles {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 1080px; margin-left: auto; margin-right: auto;
}
.jc__tiles--two {
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  max-width: none; margin-top: 0;
}
.jc__tile { background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 24px; }
.cbd--cream .jc__tile { background: var(--nu-white); }
.jc__card-p { margin: 6px 0 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }
.jc__list { margin: 8px 0 0; padding-left: 18px; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.7; }
.jc__result-box { background: var(--nu-blue-tint); border-radius: var(--nu-r-input); padding: 14px 16px; margin-top: 14px; }
.jc__result-box--negative { background: var(--nu-red-tint); }
.jc__result-main { margin: 0; color: var(--nu-ink); font-size: 16px; font-weight: 800; font-variant-numeric: tabular-nums; }
.jc__result-sub { margin: 4px 0 0; color: var(--nu-gray-2); font-size: 12.5px; font-weight: 600; }

/* ——— exemplos práticos (cards brancos na banda creme) ——— */
.jc__ex-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr));
  gap: 18px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 1080px; margin-left: auto; margin-right: auto;
}
.jc__ex-title { margin: 0 0 14px; color: var(--nu-ink); font-size: 19px; font-weight: 800; letter-spacing: -.2px; }
.jc__ex-title--center { text-align: center; margin: clamp(36px, 5vw, 56px) 0 0; }
.jc__ex-title--center + .jc__ex-grid { margin-top: 20px; }
.jc__ex-card { background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 26px; }
.jc__ex-note {
  margin: 22px auto 0; max-width: 680px; text-align: center;
  color: var(--nu-gray-2); font-size: 15px; font-weight: 600; line-height: 1.6;
}

/* ——— cards-link (rankings / outras calculadoras) ——— */
.jc__grid-cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 16px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 980px; margin-left: auto; margin-right: auto;
}
.jc__card-link {
  background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 26px;
  display: flex; flex-direction: column; gap: 6px;
  transition: transform .18s, box-shadow .2s;
}
.jc__card-link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.jc__card-link-title { margin: 0; color: var(--nu-ink); font-size: 18px; font-weight: 800; letter-spacing: -.2px; }

/* ——— pills / CTA ——— */
.jc__pill {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.jc__pill:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.jc__eeat {
  background: var(--nu-white); border-radius: var(--nu-r-card-lg);
  padding: clamp(24px, 3vw, 36px); margin: clamp(44px, 6vw, 72px) auto 0; max-width: 980px;
}
.jc__eeat-title { margin: 0; color: var(--nu-ink); font-size: 15.5px; font-weight: 700; }
.jc__eeat-p { margin: 10px 0 0; color: var(--nu-gray-3); font-size: 14.5px; font-weight: 500; line-height: 1.65; }
.jc__eeat-small { margin: 12px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 500; line-height: 1.6; }
.jc__cta {
  background: var(--nu-blue); border-radius: var(--nu-r-card-lg);
  padding: clamp(34px, 5vw, 60px); text-align: center; margin-top: clamp(44px, 6vw, 72px);
  max-width: 1080px; margin-left: auto; margin-right: auto;
}
.jc__cta-title { margin: 0; color: var(--nu-white); font-size: clamp(26px, 3.4vw, 44px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.jc__cta-sub { margin: 14px auto 0; color: var(--nu-white-75); font-size: 16px; font-weight: 500; line-height: 1.6; max-width: 560px; }
.jc__cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 26px; }
.jc__cta .jc__pill { margin-top: 0; }
.jc__pill--light { background: var(--nu-cream); color: var(--nu-blue); }
.jc__pill--light:hover { background: var(--nu-white); color: var(--nu-blue-hover); }
.jc__pill--outline { background: transparent; border: 2px solid var(--nu-white-35); color: var(--nu-white); }
.jc__pill--outline:hover { background: var(--nu-white-14); color: var(--nu-white); }
</style>
