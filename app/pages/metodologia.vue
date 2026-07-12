<script setup lang="ts">
// /metodologia — Metodologia e fontes de dados (portada VERBATIM de
// Frontend/app/pages/metodologia.vue). Placeholders resolvidos:
// brand.name = "Redentia", brand.email = suporte@redentia.com.br, brand.url =
// origin da request. Path e SEO preservados de propósito (mesma URL /metodologia).
//
// MESMO padrão do gabarito legal (institucional/privacy): o conteúdo é uma árvore
// tipada; LegalHero renderiza a banda creme e o MetodologiaDoc (página-local, sob
// legal/metodologia/) renderiza a coluna de artigo — igual ao shared LegalDoc, mas
// com suporte à TABELA de atualização (§5) e ao BOX de disclaimer (§7), que o
// contrato genérico não cobre. Prosa toda pelo shared LegalBlocks. Header/ticker/
// footer vêm do layout default. Acentos já íntegros na fonte, preservados.
import type { LegalBlock } from '~/types/legal'
import MetodologiaDoc from '~/components/legal/metodologia/MetodologiaDoc.vue'

interface MetTable { kind: 'table'; head: string[]; rows: string[][] }
type MetBlock = LegalBlock | MetTable
interface MetSection { id: string; title: string; callout?: boolean; blocks: MetBlock[] }

// lede: o parágrafo-subtítulo do hero antigo (abre o documento).
const intro: LegalBlock[] = [
  { kind: 'p', text: 'Esta página explica como o conteúdo da Redentia é produzido, quais fontes públicas alimentam as calculadoras e os rankings, quais fórmulas estão por trás de cada simulação e em que situações cada modelo deixa de funcionar bem. O objetivo é deixar visível tudo que sustenta o que você lê aqui, para que você possa replicar, contestar ou aprofundar qualquer cálculo.' },
]

const sections: MetSection[] = [
  {
    id: 'principios',
    title: '1. Princípios editoriais',
    blocks: [
      { kind: 'p', text: 'A Redentia produz conteúdo sob quatro princípios não-negociáveis. Eles existem porque YMYL (Your Money Your Life), conteúdo financeiro que pode afetar dinheiro, saúde ou bem-estar do leitor, exige um padrão editorial mais alto que conteúdo de entretenimento.' },
      { kind: 'subsection', title: 'Independência editorial', blocks: [
        { kind: 'p', text: 'Calculadoras, rankings e análises não são patrocinados. Quando há link de afiliado (ex: corretora parceira em um guia), ele é declarado de forma visível na própria página com o aviso "link patrocinado". Nenhum cálculo é alterado para favorecer um produto.' },
      ] },
      { kind: 'subsection', title: 'Fontes verificáveis', blocks: [
        { kind: 'p', text: 'Todo dado citado em texto editorial vem de fonte primária pública (B3, Banco Central, CVM, IBGE, ANBIMA, Receita Federal). Quando o número é uma média histórica ou estimativa, isso é dito no próprio parágrafo, com janela temporal e provedor.' },
      ] },
      { kind: 'subsection', title: 'Atualização periódica', blocks: [
        { kind: 'p', text: 'Páginas educacionais são revisadas em ciclo trimestral, ou imediatamente quando ocorre evento relevante (mudança da Selic, alteração de tributação, nova instrução CVM). O campo "Última atualização" no topo de cada página é a fonte da verdade sobre quando o conteúdo foi conferido.' },
      ] },
      { kind: 'subsection', title: 'Fact-checking interno', blocks: [
        { kind: 'p', text: 'Cada conteúdo publicado passa por dois pares de olhos: redação e revisão de cálculo. Em peças que envolvem tributação, simulação previdenciária ou qualquer número que afete uma decisão financeira do leitor, exigimos checagem cruzada com a fonte oficial citada.' },
      ] },
    ],
  },
  {
    id: 'fontes',
    title: '2. Fontes de dados',
    blocks: [
      { kind: 'p', text: 'Toda informação numérica exibida nas páginas da Redentia pode ser rastreada até uma das seis fontes abaixo. Não usamos dados de terceiros sem origem rastreável, e quando consumimos um agregador (StatusInvest, ComDinheiro, etc), explicitamos que o dado de base também vem destas fontes oficiais.' },
      { kind: 'subsection', title: 'B3 (Brasil, Bolsa, Balcão)', blocks: [
        { kind: 'p', text: 'Cotações de ações, FIIs, ETFs e BDRs (preço, volume, ticker), composição de índices (Ibovespa, IFIX, IBrX, Small Cap Index), eventos corporativos (dividendos, JCP, splits, grupamentos, bonificações), composição setorial e dados fundamentalistas reportados pelas companhias listadas. Frequência: dados de pregão em tempo real (com até 15 min de defasagem para feed gratuito), eventos diários, fundamentalistas trimestrais.' },
      ] },
      { kind: 'subsection', title: 'Banco Central do Brasil (BCB)', blocks: [
        { kind: 'p', text: 'Taxa Selic Meta e Selic Over (overnight), CDI (Certificado de Depósito Interbancário), índices monetários (TR, TJLP, TLP), expectativas Focus (relatório semanal), boletim Focus (consenso de mercado para Selic, IPCA, PIB, câmbio), séries temporais via SGS (Sistema Gerenciador de Séries Temporais). Frequência: Selic atualizada a cada reunião do Copom (ciclo de ~45 dias), CDI diário, Focus semanal.' },
      ] },
      { kind: 'subsection', title: 'CVM (Comissão de Valores Mobiliários)', blocks: [
        { kind: 'p', text: 'Regulação de fundos de investimento, FIIs, ofertas públicas, demonstrações financeiras padronizadas (DFP, ITR), comunicados a mercado, fato relevante, instruções normativas (CVM 555 para fundos abertos, CVM 472 para FIIs). Usamos a CVM como fonte de regras de tributação de fundos e dos prospectos exigidos por instrução. Frequência: instruções publicadas conforme calendário regulatório, dados de fundos diariamente.' },
      ] },
      { kind: 'subsection', title: 'Receita Federal do Brasil', blocks: [
        { kind: 'p', text: 'Tabelas vigentes do IRPF, alíquotas de IR sobre ganho de capital em renda variável (15% swing trade, 20% day trade), códigos DARF (6015 para swing trade, 8523 para day trade), regras de isenção (vendas mensais até R$ 20.000 em ações, dividendos isentos), tributação regressiva de renda fixa (22,5% até 180d, 20% até 360d, 17,5% até 720d, 15% acima), instruções de declaração anual.' },
      ] },
      { kind: 'subsection', title: 'IBGE (Instituto Brasileiro de Geografia e Estatística)', blocks: [
        { kind: 'p', text: 'IPCA (Índice Nacional de Preços ao Consumidor Amplo), IPCA-15, INPC, INCC e demais índices de inflação oficiais, PIB trimestral, indicadores demográficos, séries históricas via Sidra. Em qualquer simulação que considera inflação, IPCA é a referência usada. Para projeções futuras, usamos a meta de inflação (3% com banda de 1,5pp) ou o consenso Focus.' },
      ] },
      { kind: 'subsection', title: 'ANBIMA (Associação Brasileira das Entidades dos Mercados Financeiro e de Capitais)', blocks: [
        { kind: 'p', text: 'Autorregulação do mercado de fundos, classificação ANBIMA de fundos (renda fixa, multimercado, ações, cambial, previdência), índices de renda fixa (IMA-B, IMA-S, IRF-M, IDA), curvas de juros futuras, rentabilidade média de tesouro direto, certificações profissionais (CPA-10, CPA-20, CEA, CGA). Frequência: índices ANBIMA atualizados diariamente, classificação revisada por instrução.' },
      ] },
      { kind: 'p', text: 'Em adição, consumimos APIs públicas e parceiras (Brapi para preços B3 com latência reduzida, scraper proprietário do StatusInvest para fundamentalistas) para reduzir o tempo entre publicação oficial e exibição na plataforma. Toda transformação aplicada (cálculo de DY, P/L, P/VP) parte de dados originados nas fontes acima.' },
    ],
  },
  {
    id: 'calculadoras',
    title: '3. Metodologia das calculadoras',
    blocks: [
      { kind: 'p', text: 'As calculadoras da Redentia são determinísticas: dado o mesmo input, sempre retornam o mesmo output. Não há randomização, não há "machine learning sugerindo número diferente". Abaixo, a fórmula central de cada uma e os pressupostos adotados por padrão.' },
      { kind: 'subsection', title: 'Juros compostos', blocks: [
        { kind: 'p', text: [
          { text: 'Fórmula: ' },
          { text: 'M = C × (1 + i)ⁿ + P × [((1 + i)ⁿ − 1) ÷ i]', bold: true },
          { text: ', onde M é o montante final, C o capital inicial, i a taxa por período, n o número de períodos e P o aporte mensal. Capitalização mensal por padrão (taxa anual convertida para mensal pela fórmula equivalente i_m = (1 + i_a)^(1/12) − 1). Por padrão, não desconta IR nem inflação, ambos disponíveis como toggle. Aporte feito no início do período (antecipado).' },
        ] },
      ] },
      { kind: 'subsection', title: 'Preço teto', blocks: [
        { kind: 'p', text: [
          { text: 'Quatro metodologias exibidas em paralelo: ' },
          { text: 'Graham', bold: true },
          { text: ' (PT = √(22,5 × LPA × VPA), válido para LPA e VPA positivos), ' },
          { text: 'Bazin', bold: true },
          { text: ' (PT = Dividendo médio anual ÷ 0,06, equivalente a exigir DY mínimo de 6% a.a.), ' },
          { text: 'P/L setorial', bold: true },
          { text: ' (PT = LPA × P/L mediano do setor), ' },
          { text: 'VPA × 1,5', bold: true },
          { text: ' (apenas para bancos e financeiras, onde patrimônio é a métrica natural). LPA, VPA e dividendos vêm dos últimos 12 meses publicados na DFP/ITR.' },
        ] },
      ] },
      { kind: 'subsection', title: 'Dividend yield', blocks: [
        { kind: 'p', text: [
          { text: 'DY = (Dividendos anuais por ação ÷ Preço da ação) × 100', bold: true },
          { text: ', expresso em percentual. DY de mercado usa preço atual; DY on cost (yield sobre custo) usa o preço médio de aquisição informado pelo usuário. Considera proventos pagos nos últimos 12 meses (TTM, trailing twelve months), incluindo dividendos e JCP líquido (15% IR já descontado, conforme regra atual).' },
        ] },
      ] },
      { kind: 'subsection', title: 'IR sobre ações', blocks: [
        { kind: 'p', text: [
          { text: 'Alíquotas vigentes da Receita Federal: ' },
          { text: '15% de IR sobre swing trade', bold: true },
          { text: ' (vendas em pregão diferente da compra), ' },
          { text: '20% sobre day trade', bold: true },
          { text: ' (compra e venda no mesmo pregão), isenção para vendas mensais somadas até R$ 20.000 em ações comuns (não vale para day trade, FIIs, ETFs ou BDRs). Códigos DARF: ' },
          { text: '6015', bold: true },
          { text: ' para swing trade, ' },
          { text: '8523', bold: true },
          { text: ' para day trade. Compensação de prejuízo permitida na mesma modalidade, sem prazo de validade.' },
        ] },
      ] },
      { kind: 'subsection', title: 'Aposentadoria', blocks: [
        { kind: 'p', text: [
          { text: 'Baseada na ' },
          { text: 'regra dos 4%', bold: true },
          { text: ' (Trinity Study, Cooley/Hubbard/Walz, 1998), que sugere que uma carteira balanceada permite saque anual de 4% do patrimônio inicial corrigido por inflação, com alta probabilidade de durar 30 anos. INSS é opcional (usuário define se quer somar contribuição estimada do RGPS). Inflação ajustável (padrão IPCA esperado de 4% a.a.). A regra dos 4% é referencial, não garantia, taxas de retorno historicamente oscilaram entre 6% e 10% reais ao ano em carteiras 60/40.' },
        ] },
      ] },
      { kind: 'subsection', title: 'Quanto investir', blocks: [
        { kind: 'p', text: [
          { text: 'Cálculo do aporte mensal necessário pra atingir uma meta financeira em prazo definido, partindo do ' },
          { text: 'valor presente de uma série uniforme antecipada', bold: true },
          { text: ': P = (M − C × (1 + i)ⁿ) ÷ [((1 + i)ⁿ − 1) ÷ i]. Permite informar capital inicial, meta nominal ou ajustada por inflação, e taxa esperada. Não considera impostos automaticamente, recomendamos descontar 15-22,5% no caso de meta com retorno via renda fixa.' },
        ] },
      ] },
      { kind: 'subsection', title: 'Planejamento patrimonial', blocks: [
        { kind: 'p', text: [
          { text: 'Backtesting com séries históricas reais da B3 desde 2010, considerando reinvestimento de dividendos e JCP. Otimização por estratégia escolhida pelo usuário: ' },
          { text: 'rentabilidade', bold: true },
          { text: ' (maximiza retorno esperado, aceitando volatilidade) ou ' },
          { text: 'segurança', bold: true },
          { text: ' (minimiza desvio padrão, aceitando retorno menor). Não é recomendação de carteira, é simulação retroativa, performance passada não garante resultado futuro, especialmente em janelas curtas.' },
        ] },
      ] },
      { kind: 'subsection', title: 'Simulador de ações', blocks: [
        { kind: 'p', text: [
          { text: 'Backtest real ticker a ticker com dados B3 históricos. Considera ' },
          { text: 'dividendos e JCP reinvestidos', bold: true },
          { text: ' na data ex-, ajusta para splits, grupamentos e bonificações via fator de ajuste. Resultado mostra retorno total (capital + proventos), retorno anualizado (CAGR) e drawdown máximo da janela. Não inclui custos de corretagem nem emolumentos da B3 (aproximadamente 0,03% por operação), valores brutos antes de qualquer custo transacional.' },
        ] },
      ] },
    ],
  },
  {
    id: 'limitacoes',
    title: '4. Limitações conhecidas',
    blocks: [
      { kind: 'p', text: 'Toda calculadora opera sob pressupostos. Listamos abaixo o que cada uma não faz, para que você consiga calibrar o resultado mentalmente.' },
      { kind: 'subsection', title: 'Não modelamos impostos automaticamente, exceto onde dito', blocks: [
        { kind: 'p', text: 'Calculadoras de juros compostos, quanto investir e aposentadoria mostram montante bruto. Para chegar ao líquido em renda fixa, desconte a alíquota regressiva (15% após 720 dias). Em ações, considere 15% sobre ganho de capital se vendas mensais ultrapassarem R$ 20.000.' },
      ] },
      { kind: 'subsection', title: 'Não consideramos taxas de corretagem, emolumentos B3 e custódia', blocks: [
        { kind: 'p', text: 'Hoje a maioria das corretoras oferece corretagem zero em ações e FIIs, mas emolumentos da B3 (~0,03% por trade) e ISS sobre corretagem (variável) ainda incidem. Para volume significativo, descontar ~0,05% por operação dá uma boa aproximação.' },
      ] },
      { kind: 'subsection', title: 'Rentabilidades passadas não garantem futuras', blocks: [
        { kind: 'p', text: 'Backtests do simulador de ações e do planejamento patrimonial mostram o que aconteceu com aquela carteira na janela escolhida. Mudanças regulatórias, ciclos de juros, eventos macro e o próprio fato de o ativo ter performado bem alteram a probabilidade futura. Use o backtest como sanity check, não como projeção.' },
      ] },
      { kind: 'subsection', title: 'Preço teto Graham e Bazin assumem pressupostos não testados', blocks: [
        { kind: 'p', text: 'A fórmula de Graham foi desenhada nos EUA dos anos 1940 e mistura crescimento (LPA) com patrimônio (VPA) sem ajuste setorial. Bazin exige DY mínimo de 6% a.a., uma régua arbitrária. Use como ponto de partida, não como resposta única. Setores cíclicos (commodities, montadoras) e high-growth (tecnologia) podem precisar de modelagem alternativa (DCF, múltiplos prospectivos).' },
      ] },
      { kind: 'subsection', title: 'Regra dos 4% pode ser conservadora ou otimista', blocks: [
        { kind: 'p', text: 'O estudo Trinity foi calibrado em mercado americano com janela 1926-1995. No Brasil, com Selic alta histórica, taxa segura de saque pode ser maior; em janelas pós-Plano Real (1994-2026) com volatilidade alta, pode ser menor. Ajuste para sua realidade.' },
      ] },
      { kind: 'subsection', title: 'Dividend yield TTM olha pra trás, não pra frente', blocks: [
        { kind: 'p', text: 'DY TTM (últimos 12 meses) é descritivo. Empresas que pagaram dividendo extraordinário recente exibem DY inflado que não se repetirá. Empresas em ciclo de investimento podem reduzir payout temporariamente. Sempre conferir o histórico de payout antes de decidir.' },
      ] },
    ],
  },
  {
    id: 'atualizacao',
    title: '5. Atualização de dados',
    blocks: [
      { kind: 'p', text: 'A camada de dados que alimenta cotações, fundamentalistas e calendários roda em microsserviços dedicados (news-scraper, fundamentals-scraper, chat-service), com cron jobs específicos por tipo de dado.' },
      { kind: 'table',
        head: ['Tipo de dado', 'Frequência', 'Origem'],
        rows: [
          ['Cotações intraday durante pregão', 'Cron 10 a 30 min', 'Brapi (B3)'],
          ['Cotações de fechamento', 'Diária após pregão', 'B3 oficial via API'],
          ['Fundamentalistas (P/L, P/VP, ROE, margens)', 'Diária', 'Scraper StatusInvest, base em DFP/ITR'],
          ['Calendário de dividendos', 'Diária', 'B3 (avisos a acionistas)'],
          ['Selic, CDI, IPCA', 'Diária (CDI), por reunião Copom (Selic), mensal (IPCA)', 'BCB SGS, IBGE Sidra'],
          ['Tesouro Direto', 'Diária (preços), mensal (rentabilidade ANBIMA)', 'Tesouro Nacional, ANBIMA'],
          ['Notícias e fato relevante', 'Cron 5 min', 'Feeds RSS oficiais (CVM, B3, releases corporativos)'],
        ],
      },
      { kind: 'p', text: 'Quando a janela do pregão fecha (após 18h em horário de Brasília), o preço exibido é o de fechamento e permanece até a abertura do pregão seguinte. Em finais de semana e feriados, todos os ativos B3 mostram o último fechamento conhecido.' },
    ],
  },
  {
    id: 'correcoes',
    title: '6. Como reportar erro',
    blocks: [
      { kind: 'p', text: [
        { text: 'Se você identificou divergência entre um número exibido e a fonte oficial, ou um erro de fórmula, ou um conteúdo que precisa ser atualizado, escreva para ' },
        { text: 'suporte@redentia.com.br', href: 'mailto:suporte@redentia.com.br' },
        { text: ' com o link da página, o trecho em questão e a fonte que sustenta a correção. Resposta em até 5 dias úteis. Quando a correção for aplicada, atualizamos o campo "Última atualização" da página afetada.' },
      ] },
    ],
  },
  {
    id: 'disclaimer',
    title: '7. Disclaimer educacional',
    callout: true,
    blocks: [
      { kind: 'p', text: [
        { text: 'Todo o conteúdo da Redentia é exclusivamente ' },
        { text: 'educacional e informativo', bold: true },
        { text: '. Não constitui recomendação de compra, venda ou manutenção de qualquer ativo, nem aconselhamento personalizado de investimento. Calculadoras, simuladores e análises servem para apoiar o seu processo de decisão, mas não substituem a avaliação do seu perfil, objetivos e tolerância a risco por um profissional certificado.' },
      ] },
      { kind: 'p', text: [
        { text: 'Antes de tomar qualquer decisão financeira relevante, consulte um ' },
        { text: 'profissional certificado', bold: true },
        { text: ': assessor de investimentos credenciado pela CVM (AAI), planejador financeiro (CFP, certificado pela Planejar), gestor de carteiras (CGA, certificado pela ANBIMA), ou consultor de valores mobiliários autorizado pela CVM. A Redentia não é corretora, distribuidora, gestora ou agente autônomo, e não recebe ordens de compra ou venda.' },
      ] },
    ],
  },
]

// SEO — mesmos title/description/breadcrumbs/JSON-LD da página antiga. O title vai
// BARE: app.vue sufixa "· Redentia" em todo <title> (house style Nu). A antiga era
// "Metodologia e fontes de dados | Redentia" — mesmas palavras, separador Nu.
const url = useRequestURL()
const origin = `${url.protocol}//${url.host}`

const CONTENT_VERSION = '2026-05-05'
const lastUpdatedISO = new Date(CONTENT_VERSION).toISOString()

const pageDescription =
  'Como o conteúdo da Redentia é produzido, quais fontes oficiais (B3, BCB, CVM, IBGE, ANBIMA) alimentam as calculadoras e quais limitações cada modelo tem.'

usePageSeo({
  title: 'Metodologia e fontes de dados',
  description: pageDescription,
  path: '/metodologia',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Metodologia', path: '/metodologia' },
  ],
  structuredData: [
    {
      '@type': 'Article',
      headline: 'Metodologia e fontes de dados',
      description: pageDescription,
      inLanguage: 'pt-BR',
      datePublished: lastUpdatedISO,
      dateModified: lastUpdatedISO,
      author: {
        '@type': 'Organization',
        name: 'Redentia',
        url: origin,
        logo: { '@type': 'ImageObject', url: `${origin}/logo-azul.svg` },
      },
      about: [
        { '@type': 'Organization', name: 'B3', url: 'https://www.b3.com.br' },
        { '@type': 'Organization', name: 'Banco Central do Brasil', url: 'https://www.bcb.gov.br' },
        { '@type': 'Organization', name: 'CVM', url: 'https://www.gov.br/cvm' },
        { '@type': 'Organization', name: 'Receita Federal', url: 'https://www.gov.br/receitafederal' },
        { '@type': 'Organization', name: 'IBGE', url: 'https://www.ibge.gov.br' },
        { '@type': 'Organization', name: 'ANBIMA', url: 'https://www.anbima.com.br' },
        { '@type': 'Thing', name: 'Metodologia de cálculo financeiro' },
        { '@type': 'Thing', name: 'Fontes de dados de mercado brasileiro' },
      ],
    },
  ],
})
</script>

<template>
  <div>
    <LegalHero eyebrow="Metodologia" title="Metodologia e fontes de dados" :updated="CONTENT_VERSION" />
    <MetodologiaDoc :intro="intro" :sections="sections" toc>
      <!-- Autoria e E-E-A-T (atribuição editorial do documento antigo) -->
      <aside class="met-author">
        <div class="met-author__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div class="met-author__body">
          <p>Conteúdo produzido e revisado pela equipe editorial da Redentia, com base em fontes públicas (B3, BCB, CVM, Receita Federal, IBGE, ANBIMA).</p>
          <p>Encontrou divergência ou erro? Reporte em <a href="mailto:contato@redentia.com.br">contato@redentia.com.br</a>.</p>
        </div>
      </aside>
    </MetodologiaDoc>
  </div>
</template>

<style scoped>
.met-author {
  display: flex; gap: 18px; align-items: flex-start;
  margin-top: clamp(40px, 5vw, 60px);
  padding: clamp(20px, 2.6vw, 28px);
  border: 1px solid var(--nu-cream-line);
  border-radius: var(--nu-r-card);
  background: var(--nu-cream);
}
.met-author__icon {
  flex-shrink: 0; width: 46px; height: 46px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 999px;
  background: var(--nu-blue-bg); color: var(--nu-blue);
}
.met-author__icon svg { width: 24px; height: 24px; }
.met-author__body p {
  margin: 0; color: var(--nu-gray-3);
  font-size: 15px; font-weight: 500; line-height: 1.6;
}
.met-author__body p + p { margin-top: 8px; }
.met-author__body a {
  color: var(--nu-blue); text-decoration: underline;
  text-underline-offset: 2px; text-decoration-thickness: 1px;
}
.met-author__body a:hover { color: var(--nu-blue-hover); }

@media (max-width: 760px) {
  .met-author { gap: 14px; }
  .met-author__icon { width: 40px; height: 40px; }
  .met-author__icon svg { width: 21px; height: 21px; }
}
</style>
