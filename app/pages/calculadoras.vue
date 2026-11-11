<script setup lang="ts">
// /calculadoras — hub das calculadoras (PR10). Contrato de UX:
// docs/redentia-nu/designs/Redentia Calculadoras Nu.dc.html (hero creme com
// eyebrow + H1 gigante + grid de cards-CTA). Contrato de SEO (regra nº1):
// TODO o texto do hub antigo (Frontend/app/pages/calculadora/index.vue)
// portado verbatim, na mesma ordem de tags (p lead → 8 cards com h2+p →
// h2 "Por que usar" + 4 h3/p → h2 "Qual calculadora usar" + 3 h3+li →
// h2 "Boas práticas" + 4 h3/p → CTA). Muda o visual, não o conteúdo.
//
// DECISÃO DE ARQUITETURA: as calculadoras individuais MANTÊM o path antigo
// /calculadora/<slug> (preserva URL equity pra migração de domínio); só o hub
// muda de /calculadora pra /calculadoras, com redirect 301 no nuxt.config.
//
// APORTOU (11/11/2026): mesma página, mesmo texto, mesma ordem. Muda a cara:
// o eyebrow com o corte, o cartão do quadro Home (ícone cobalto de traço,
// título 24px em 800, a chamada em azul com a seta que anda), o destaque no
// painel azul com o corte gigante, e as faixas em creme (sem faixa branca).
// O rótulo de cada cartão ("Simulação", "Valuation"…) e a chamada ("Usar
// calculadora"…) ficam: são texto de âncora dos links internos.

const calculators = [
  {
    to: '/calculadora/juros-compostos',
    icon: ['M3 20c5 0 9-3 11-8s4-8 7-8', 'M3 20h18'],
    featured: true,
    eyebrow: 'Simulação',
    title: 'Juros Compostos',
    body: 'Simule rendimento de investimentos ao longo do tempo. Inclui aportes mensais e gráfico de evolução.',
    cta: 'Usar calculadora',
  },
  {
    to: '/calculadora/aposentadoria',
    icon: ['M6 3h12M6 21h12', 'M7.5 3c0 5 4.5 6 4.5 9s-4.5 4-4.5 9', 'M16.5 3c0 5-4.5 6-4.5 9s4.5 4 4.5 9'],
    eyebrow: 'Long-term',
    title: 'Aposentadoria',
    body: 'Calcule quanto investir pra se aposentar. Considera INSS, inflação, expectativa de vida e a regra dos 4%.',
    cta: 'Planejar aposentadoria',
  },
  {
    to: '/calculadora/quanto-investir',
    icon: ['M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17z', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M12 12v.01'],
    eyebrow: 'Aporte',
    title: 'Quanto Investir',
    body: 'Descubra quanto investir mensalmente pra atingir uma meta financeira. Aportes precisos, sem chute.',
    cta: 'Calcular aportes',
  },
  {
    to: '/calculadora/planejamento',
    icon: ['M5 21V4', 'M5 4h12l-2.5 4 2.5 4H5'],
    eyebrow: 'Estratégia',
    title: 'Planejamento Patrimonial',
    body: 'Calcule quanto tempo e quanto investir pra atingir metas. Estratégias com dados reais da B3.',
    cta: 'Começar planejamento',
  },
  {
    to: '/calculadora/acoes',
    icon: ['M3 17l5.5-5.5 4 3.5L20 7.5', 'M15 7h5.5v5.5', 'M3 21h18'],
    eyebrow: 'Backtest',
    // nome da ferramenta = title/H1 dela (bloco DONO DO CLUSTER em calculadora/acoes.vue)
    title: 'Simulador de Ações e Dividendos',
    body: 'Quanto teria ganho investindo em ações específicas? Análise com dados históricos reais e dividendos reinvestidos.',
    cta: 'Usar simulador',
  },
  {
    to: '/calculadora/preco-teto',
    icon: ['M4 20V10M10 20V4M16 20v-7M21 20H3', 'M14 7h7'],
    eyebrow: 'Valuation',
    title: 'Preço Teto',
    body: 'Calcule o preço justo de ações usando Graham, Bazin, P/L setorial e valor patrimonial. Saiba se está barata ou cara.',
    cta: 'Usar calculadora',
  },
  {
    to: '/calculadora/imposto-renda',
    icon: ['M6 3h12v18l-3-2-3 2-3-2-3 2z', 'M14.5 9l-5 6', 'M9.5 9.5v.01M14.5 14.5v.01'],
    eyebrow: 'Tributação',
    title: 'Imposto de Renda',
    body: 'Calcule IR sobre day trade e swing trade. Gera DARF automático, compensa prejuízos e fica em dia com a Receita.',
    cta: 'Calcular IR',
  },
  {
    to: '/calculadora/dividend-yield',
    icon: ['M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17z', 'M12 7v10M14.5 9.2c-.6-.8-1.5-1.2-2.5-1.2-1.4 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-1.9-.4-2.5-1.2'],
    eyebrow: 'Renda passiva',
    title: 'Dividend Yield',
    body: 'Calcule DY atual, projetado e histórico de ações e FIIs. Compare ativos e ache os melhores pagadores.',
    cta: 'Calcular DY',
  },
]

const reasons = [
  { title: '100% gratuito', body: 'Todas as ferramentas livres, sem limite de uso ou cadastro pra abrir.' },
  { title: 'Dados reais', body: 'Histórico real da B3, com dividendos e proventos por ticker.' },
  { title: 'Gráficos vivos', body: 'Evolução do patrimônio em gráficos detalhados pra você ver o que aconteceu.' },
  { title: 'Privacidade', body: 'Suas simulações ficam locais. Não compartilhamos seus dados.' },
]

const guides = [
  {
    title: 'Juros Compostos',
    points: [
      'Simular investimentos de longo prazo',
      'Entender o impacto de aportes mensais',
      'Comparar diferentes taxas de retorno',
      'Planejar renda fixa ou fundos',
    ],
  },
  {
    title: 'Simulador de Ações',
    points: [
      'Ver quanto teria ganho em ações específicas',
      'Analisar reinvestimento de dividendos',
      'Comparar desempenho entre ativos',
      'Montar carteira de ações ou FIIs',
    ],
  },
  {
    title: 'Planejamento Patrimonial',
    points: [
      'Tem uma meta financeira específica',
      'Quer saber quanto tempo até bater o objetivo',
      'Precisa de carteira recomendada com dados reais',
      'Decidir entre estratégia agressiva ou conservadora',
    ],
  },
]

const tips = [
  {
    title: 'Seja realista nas taxas',
    body: 'O mercado brasileiro renda historicamente entre 10% e 15% ao ano em ações, mas com volatilidade alta. Use 8-10% pra projeções conservadoras.',
  },
  {
    title: 'Considere a inflação',
    body: 'A inflação corrói poder de compra. Sempre olhe retornos reais (acima da inflação), não nominais.',
  },
  {
    title: 'Diversifique sempre',
    body: 'Use o simulador pra testar diferentes combinações de ativos. Carteira variada reduz risco sem matar retorno.',
  },
  {
    title: 'Revise periodicamente',
    body: 'Refaça suas simulações de 6 em 6 meses. Os parâmetros mudam (selic, inflação, sua renda) e a estratégia precisa acompanhar.',
  },
]

usePageSeo({
  title: 'Calculadoras Financeiras: Juros, Ações e IR',
  description:
    'Calculadoras gratuitas: simule juros compostos, analise investimentos em ações e planeje seu patrimônio. Ferramentas com dados reais da B3.',
  path: '/calculadoras',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadoras' },
  ],
  structuredData: [
    {
      '@type': 'CollectionPage',
      name: 'Calculadoras Financeiras Gratuitas',
      description:
        'Conjunto de calculadoras financeiras para simular investimentos, analisar ações e planejar patrimônio.',
      about: {
        '@type': 'FinancialProduct',
        name: 'Ferramentas de Investimento',
        description: 'Calculadoras para planejamento financeiro e análise de investimentos',
      },
    },
  ],
})
</script>

<template>
  <div>
    <!-- Hero + grid de cards (design) — lead = texto SEO do hub antigo -->
    <section class="chb__hero">
      <NuEyebrow como="div">Ferramentas gratuitas</NuEyebrow>
      <h1 class="chb__h1">Calculadoras<br>de investidor.</h1>
      <p class="chb__sub">Simule investimentos, analise histórico real de ações e planeje seu patrimônio. Decisões com dados da B3, sem misticismo.</p>
      <div class="chb__grid">
        <NuxtLink
          v-for="(c, i) in calculators"
          :key="c.to"
          :to="c.to"
          class="chb__card"
          :class="{ 'chb__card--blue': c.featured }"
          :style="{ '--i': i }"
        >
          <MarcaCorte v-if="c.featured" class="chb__card-corte nu-corte-fundo" :largura="230" cor="var(--nu-white)" />
          <span class="chb__card-top">
            <svg class="chb__card-icon" viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path v-for="d in c.icon" :key="d" :d="d" /></svg>
            <span class="chb__card-eyebrow">{{ c.eyebrow }}</span>
          </span>
          <h2 class="chb__card-title">{{ c.title }}</h2>
          <p class="chb__card-body">{{ c.body }}</p>
          <span class="chb__card-cta">
            {{ c.cta }}
            <svg class="chb__card-seta" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15" /><path d="M13.5 6.5 19 12l-5.5 5.5" /></svg>
          </span>
        </NuxtLink>
      </div>
    </section>

    <!-- Por que usar (texto antigo verbatim) -->
    <section class="chb__band chb__band--faixa">
      <NuSectionHeading eyebrow="Por que usar">O que separa essas calculadoras das genéricas</NuSectionHeading>
      <div class="chb__reasons">
        <article v-for="(r, i) in reasons" :key="r.title" class="chb__reason" :style="{ '--i': i }">
          <h3 class="chb__h3">{{ r.title }}</h3>
          <p class="chb__p">{{ r.body }}</p>
        </article>
      </div>
    </section>

    <!-- Qual calculadora usar (texto antigo verbatim) -->
    <section class="chb__band">
      <NuSectionHeading eyebrow="Guia">
        Qual calculadora usar
        <template #dek>Cada ferramenta resolve um tipo diferente de pergunta. Aqui o atalho pra acertar de primeira.</template>
      </NuSectionHeading>
      <div class="chb__guides">
        <article v-for="g in guides" :key="g.title" class="chb__guide">
          <div class="chb__guide-head">
            <span class="chb__use-se">Use se…</span>
            <h3 class="chb__h3">{{ g.title }}</h3>
          </div>
          <ul class="chb__points">
            <li v-for="point in g.points" :key="point">
              <svg class="chb__check" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              <span>{{ point }}</span>
            </li>
          </ul>
        </article>
      </div>
    </section>

    <!-- Boas práticas (texto antigo verbatim) -->
    <section class="chb__band chb__band--faixa">
      <NuSectionHeading eyebrow="Boas práticas">Como tirar mais dessas ferramentas</NuSectionHeading>
      <div class="chb__tips">
        <article v-for="(tip, i) in tips" :key="tip.title" class="chb__tip" :style="{ '--i': i }">
          <span class="chb__tip-tag">Dica</span>
          <h3 class="chb__h3">{{ tip.title }}</h3>
          <p class="chb__p">{{ tip.body }}</p>
        </article>
      </div>
    </section>

    <!-- CTA final (texto antigo verbatim, só a marca muda) -->
    <section class="chb__band">
      <div class="chb__cta">
        <MarcaCorte class="chb__cta-corte nu-corte-fundo" :largura="520" cor="var(--nu-white)" />
        <h2 class="chb__cta-title">Pronto pra começar a investir?</h2>
        <p class="chb__cta-sub">Cadastre-se na Aportou pra ter análises com IA, acompanhamento de carteira e mais.</p>
        <div class="chb__cta-actions">
          <NuBotaoSeta to="/login" variante="creme">Criar conta grátis</NuBotaoSeta>
          <NuxtLink to="/" class="chb__pill chb__pill--outline">Conhecer a plataforma</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ——— hero: creme da página, eyebrow com o corte, H1 em 800 ——— */
.chb__hero {
  background: var(--nu-page);
  padding: clamp(48px, 7vw, 92px) clamp(20px, 5.5vw, 80px) clamp(56px, 7vw, 92px);
  animation: nu-fade .5s ease both;
}
.chb__h1 {
  margin: 18px 0 0; color: var(--nu-ink);
  font-size: var(--nu-fs-hero); font-weight: 800;
  letter-spacing: -0.035em; line-height: .98;
}
.chb__sub {
  color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500;
  line-height: 1.45; margin: 22px 0 0; max-width: 600px;
}
.chb__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px; margin-top: clamp(36px, 4vw, 48px);
}
/* o cartão do quadro Home: creme de faixa, raio 26, ícone cobalto de traço */
.chb__card {
  position: relative; overflow: hidden; isolation: isolate;
  background: var(--nu-band); color: var(--nu-ink); border-radius: 26px; padding: 26px;
  display: flex; flex-direction: column; gap: 10px; min-height: 250px;
  transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s cubic-bezier(.2, .8, .2, 1);
  animation: nu-fade .5s ease both; animation-delay: calc(var(--i, 0) * 60ms);
}
.chb__card:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); color: var(--nu-ink); }
.chb__card:active { transform: scale(.99); }
.chb__card-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.chb__card-icon { flex: none; color: var(--nu-blue); }
.chb__card-eyebrow {
  color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 700;
  letter-spacing: 0.16em; text-transform: uppercase; text-align: right;
}
.chb__card-title {
  margin: 6px 0 0; color: inherit; font-size: var(--nu-fs-2xl); font-weight: 800;
  letter-spacing: -0.02em; line-height: 1.15;
}
.chb__card-body {
  margin: 0; color: var(--nu-gray-3); font-size: 16.5px; font-weight: 500; line-height: 1.5;
}
.chb__card-cta {
  margin-top: auto; padding-top: 10px; min-height: 44px;
  display: flex; align-items: center; gap: 8px;
  color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700;
}
.chb__card-seta { flex: none; transition: transform .25s cubic-bezier(.2, .8, .2, 1); }
.chb__card:hover .chb__card-seta { transform: translateX(3px); }

/* o destaque: o painel azul da marca, com o corte gigante no canto */
.chb__card--blue { background: var(--nu-grad-cobalto); color: var(--nu-white); }
.chb__card--blue:hover { color: var(--nu-white); }
.chb__card-corte { position: absolute; right: -28px; bottom: -64px; z-index: -1; opacity: .08; pointer-events: none; }
.chb__card--blue .chb__card-icon,
.chb__card--blue .chb__card-cta { color: var(--nu-white); }
.chb__card--blue .chb__card-eyebrow { color: var(--nu-blue-on-blue-2); }
.chb__card--blue .chb__card-body { color: var(--nu-blue-on-blue); }

/* ——— faixas de conteúdo: creme da página e creme de faixa, alternados ——— */
.chb__band { background: var(--nu-page); padding: clamp(64px, 7vw, 100px) clamp(20px, 5.5vw, 80px); }
.chb__band--faixa { background: var(--nu-band); }
.chb__h3 { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; }
.chb__p { margin: 8px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }

.chb__reasons, .chb__tips {
  /* 230px: as quatro cabem numa linha no desktop (280px deixava a 4ª órfã) */
  display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 16px; margin-top: clamp(32px, 4vw, 40px);
}
/* cartão branco dentro da faixa creme */
.chb__reason, .chb__tip {
  background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 24px;
  box-shadow: var(--nu-shadow-quente);
  animation: nu-fade .5s ease both; animation-delay: calc(var(--i, 0) * 60ms);
}
.chb__tip-tag {
  display: inline-flex; align-self: flex-start; margin-bottom: 12px; padding: 4px 9px;
  border-radius: var(--nu-r-tag); background: var(--nu-blue-bg); color: var(--nu-blue-text);
  font-size: var(--nu-fs-dense); font-weight: 700; letter-spacing: 0.04em;
}

.chb__guides { display: flex; flex-direction: column; margin-top: clamp(32px, 4vw, 40px); border-bottom: 1.5px solid var(--nu-line); }
/* linhas com fio de 1,5px, como o FAQ dos quadros */
.chb__guide {
  border-top: 1.5px solid var(--nu-line); padding: 26px 0;
  display: flex; gap: clamp(18px, 3vw, 44px); flex-wrap: wrap;
}
.chb__guide-head { flex: 0 0 300px; min-width: min(240px, 100%); }
.chb__use-se {
  display: block; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 700;
  letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 8px;
}
.chb__points { list-style: none; margin: 0; padding: 0; flex: 1 1 280px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 28px; align-content: start; }
.chb__points li {
  display: flex; align-items: flex-start; gap: 10px;
  color: var(--nu-gray-3); font-size: 15.5px; font-weight: 600; line-height: 1.4;
}
.chb__check { flex: none; margin-top: 2px; color: var(--nu-green-text); }

/* ——— CTA: o painel azul ——— */
.chb__cta {
  position: relative; overflow: hidden; isolation: isolate;
  background: var(--nu-grad-cobalto); border-radius: var(--nu-r-secao);
  padding: clamp(36px, 5vw, 64px) clamp(24px, 5vw, 64px);
}
.chb__cta-corte { position: absolute; right: -40px; bottom: -150px; z-index: -1; opacity: .08; pointer-events: none; }
.chb__cta-title {
  margin: 0; color: var(--nu-white); font-size: var(--nu-fs-h2);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1.02; max-width: 820px;
}
.chb__cta-sub { margin: 18px 0 0; color: var(--nu-blue-on-blue); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500; line-height: 1.45; max-width: 560px; }
.chb__cta-actions { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; margin-top: 30px; }
.chb__pill {
  display: inline-flex; align-items: center; min-height: 62px; border-radius: var(--nu-r-pill);
  padding: 0 28px; font-size: 19px; font-weight: 700; transition: background .2s, transform .15s cubic-bezier(.2, .8, .2, 1);
}
.chb__pill--outline { box-shadow: inset 0 0 0 1.5px var(--nu-white-60); color: var(--nu-white); }
.chb__pill--outline:hover { background: var(--nu-white-14); color: var(--nu-white); }
.chb__pill--outline:active { transform: scale(.98); }

@media (max-width: 640px) {
  .chb__card { min-height: 0; }
  .chb__points { grid-template-columns: minmax(0, 1fr); }
  .chb__cta { border-radius: var(--nu-r-card-lg); }
  .chb__cta-actions > * { flex: 1 1 100%; justify-content: space-between; }
  .chb__pill { justify-content: center; font-size: 17px; }
}
</style>
