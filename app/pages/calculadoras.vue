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

const calculators = [
  {
    to: '/calculadora/juros-compostos',
    featured: true,
    eyebrow: 'Simulação',
    title: 'Juros Compostos',
    body: 'Simule rendimento de investimentos ao longo do tempo. Inclui aportes mensais e gráfico de evolução.',
    cta: 'Usar calculadora',
  },
  {
    to: '/calculadora/aposentadoria',
    eyebrow: 'Long-term',
    title: 'Aposentadoria',
    body: 'Calcule quanto investir pra se aposentar. Considera INSS, inflação, expectativa de vida e a regra dos 4%.',
    cta: 'Planejar aposentadoria',
  },
  {
    to: '/calculadora/quanto-investir',
    eyebrow: 'Aporte',
    title: 'Quanto Investir',
    body: 'Descubra quanto investir mensalmente pra atingir uma meta financeira. Aportes precisos, sem chute.',
    cta: 'Calcular aportes',
  },
  {
    to: '/calculadora/planejamento',
    eyebrow: 'Estratégia',
    title: 'Planejamento Patrimonial',
    body: 'Calcule quanto tempo e quanto investir pra atingir metas. Estratégias com dados reais da B3.',
    cta: 'Começar planejamento',
  },
  {
    to: '/calculadora/acoes',
    eyebrow: 'Backtest',
    title: 'Investimento em Ações',
    body: 'Quanto teria ganho investindo em ações específicas? Análise com dados históricos reais e dividendos reinvestidos.',
    cta: 'Usar simulador',
  },
  {
    to: '/calculadora/preco-teto',
    eyebrow: 'Valuation',
    title: 'Preço Teto',
    body: 'Calcule o preço justo de ações usando Graham, Bazin, P/L setorial e valor patrimonial. Saiba se está barata ou cara.',
    cta: 'Usar calculadora',
  },
  {
    to: '/calculadora/imposto-renda',
    eyebrow: 'Tributação',
    title: 'Imposto de Renda',
    body: 'Calcule IR sobre day trade e swing trade. Gera DARF automático, compensa prejuízos e fica em dia com a Receita.',
    cta: 'Calcular IR',
  },
  {
    to: '/calculadora/dividend-yield',
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
      <div class="chb__eyebrow">Ferramentas gratuitas</div>
      <h1 class="chb__h1">Calculadoras<br>de investidor.</h1>
      <p class="chb__sub">Simule investimentos, analise histórico real de ações e planeje seu patrimônio. Decisões com dados da B3, sem misticismo.</p>
      <div class="chb__grid">
        <NuxtLink
          v-for="c in calculators"
          :key="c.to"
          :to="c.to"
          class="chb__card"
          :class="{ 'chb__card--blue': c.featured }"
        >
          <span v-if="c.featured" class="chb__badge">{{ c.eyebrow }}</span>
          <span v-else class="chb__card-eyebrow">{{ c.eyebrow }}</span>
          <h2 class="chb__card-title">{{ c.title }}</h2>
          <p class="chb__card-body">{{ c.body }}</p>
          <span class="chb__card-foot">
            <span class="chb__card-cta">{{ c.cta }}</span>
            <span class="chb__circle">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </span>
          </span>
        </NuxtLink>
      </div>
    </section>

    <!-- Por que usar (texto antigo verbatim) -->
    <section class="chb__band chb__band--white">
      <NuSectionHeading eyebrow="Por que usar">O que separa essas calculadoras das genéricas</NuSectionHeading>
      <div class="chb__reasons">
        <article v-for="r in reasons" :key="r.title" class="chb__reason">
          <h3 class="chb__h3">{{ r.title }}</h3>
          <p class="chb__p">{{ r.body }}</p>
        </article>
      </div>
    </section>

    <!-- Qual calculadora usar (texto antigo verbatim) -->
    <section class="chb__band chb__band--cream">
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
            <li v-for="point in g.points" :key="point"><span class="chb__dot" /><span>{{ point }}</span></li>
          </ul>
        </article>
      </div>
    </section>

    <!-- Boas práticas (texto antigo verbatim) -->
    <section class="chb__band chb__band--white">
      <NuSectionHeading eyebrow="Boas práticas">Como tirar mais dessas ferramentas</NuSectionHeading>
      <div class="chb__tips">
        <article v-for="tip in tips" :key="tip.title" class="chb__tip">
          <span class="chb__tip-tag">Dica</span>
          <h3 class="chb__h3">{{ tip.title }}</h3>
          <p class="chb__p">{{ tip.body }}</p>
        </article>
      </div>
    </section>

    <!-- CTA final (texto antigo verbatim) -->
    <section class="chb__band chb__band--cream">
      <div class="chb__cta">
        <h2 class="chb__cta-title">Pronto pra começar a investir?</h2>
        <p class="chb__cta-sub">Cadastre-se na Redentia pra ter análises com IA, acompanhamento de carteira e mais.</p>
        <div class="chb__cta-actions">
          <NuxtLink to="/login" class="chb__pill chb__pill--light">Criar conta grátis</NuxtLink>
          <NuxtLink to="/" class="chb__pill chb__pill--outline">Conhecer a plataforma</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ——— hero (valores exatos do design) ——— */
.chb__hero {
  background: var(--nu-cream);
  padding: clamp(56px, 8vw, 104px) clamp(22px, 5.5vw, 80px) clamp(52px, 7vw, 84px);
  animation: nu-fade .5s ease both;
}
.chb__eyebrow { color: var(--nu-blue); font-size: clamp(17px, 1.6vw, 21px); font-weight: 800; letter-spacing: -.2px; }
.chb__h1 {
  margin: 14px 0 0; color: var(--nu-ink);
  font-size: clamp(46px, 6.5vw, 88px); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1.0;
}
.chb__sub {
  color: var(--nu-gray); font-size: clamp(17px, 1.8vw, 21px); font-weight: 600;
  line-height: 1.55; margin: 22px 0 0; max-width: 600px;
}
.chb__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px; margin-top: 48px;
}
.chb__card {
  background: var(--nu-white); border-radius: var(--nu-r-card-lg); padding: 30px;
  display: flex; flex-direction: column; min-height: 250px;
  transition: background .2s, transform .18s;
}
.chb__card:hover { transform: translateY(-3px); }
.chb__card--blue { background: var(--nu-blue); }
.chb__card--blue:hover { background: var(--nu-blue-hover); }
.chb__badge {
  display: inline-flex; align-self: flex-start; align-items: center;
  background: var(--nu-white-18); color: var(--nu-white);
  font-size: 11.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
  padding: 6px 13px; border-radius: var(--nu-r-pill);
}
.chb__card-eyebrow {
  color: var(--nu-blue); font-size: 12px; font-weight: 800;
  letter-spacing: 1.2px; text-transform: uppercase;
}
.chb__card-title {
  margin: 22px 0 0; color: var(--nu-ink); font-size: 24px; font-weight: 800; letter-spacing: -.3px;
}
.chb__card--blue .chb__card-title { color: var(--nu-white); }
.chb__card-body {
  margin: 10px 0 0; color: var(--nu-gray); font-size: 15.5px; font-weight: 500;
  line-height: 1.55; padding-bottom: 20px;
}
.chb__card--blue .chb__card-body { color: var(--nu-white-75); }
.chb__card-foot { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.chb__card-cta { color: var(--nu-blue); font-size: 13.5px; font-weight: 800; }
.chb__card--blue .chb__card-cta { color: var(--nu-white); }
.chb__circle {
  width: 46px; height: 46px; flex-shrink: 0; border-radius: 50%;
  background: var(--nu-blue); color: var(--nu-white);
  display: flex; align-items: center; justify-content: center;
}
.chb__card--blue .chb__circle { background: var(--nu-cream); color: var(--nu-blue); }

/* ——— bandas de conteúdo ——— */
.chb__band { padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.chb__band--white { background: var(--nu-white); }
.chb__band--cream { background: var(--nu-cream); }
.chb__h3 { margin: 0; color: var(--nu-ink); font-size: 17px; font-weight: 800; letter-spacing: -.2px; }
.chb__p { margin: 8px 0 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }

.chb__reasons {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 16px; margin-top: clamp(28px, 4vw, 44px);
}
.chb__reason { background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 24px; }

.chb__guides { display: flex; flex-direction: column; gap: 14px; margin-top: clamp(28px, 4vw, 44px); }
.chb__guide {
  background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 26px 28px;
  display: flex; gap: clamp(18px, 3vw, 44px); flex-wrap: wrap;
}
.chb__guide-head { flex: 0 0 260px; min-width: min(240px, 100%); }
.chb__use-se {
  display: block; color: var(--nu-blue); font-size: 11.5px; font-weight: 800;
  letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 6px;
}
.chb__points { list-style: none; margin: 0; padding: 0; flex: 1 1 280px; display: flex; flex-direction: column; gap: 8px; }
.chb__points li {
  display: flex; align-items: flex-start; gap: 10px;
  color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.55;
}
.chb__dot { width: 5px; height: 5px; border-radius: 50%; background: var(--nu-blue); flex-shrink: 0; margin-top: 8px; }

.chb__tips {
  /* 230px = mesmo mínimo do grid "Por que usar" — as 4 dicas cabem numa
     linha no desktop (280px deixava a 4ª órfã numa 2ª linha). */
  display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 16px; margin-top: clamp(28px, 4vw, 44px);
}
.chb__tip { background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 24px; }
.chb__tip-tag {
  display: block; color: var(--nu-gray); font-size: 11px; font-weight: 800;
  letter-spacing: 1.4px; text-transform: uppercase; margin-bottom: 8px;
}

/* ——— CTA ——— */
.chb__cta {
  background: var(--nu-blue); border-radius: var(--nu-r-card-lg);
  padding: clamp(34px, 5vw, 60px); text-align: center;
}
.chb__cta-title {
  margin: 0; color: var(--nu-white); font-size: clamp(26px, 3.4vw, 44px);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1.1;
}
.chb__cta-sub { margin: 14px auto 0; color: var(--nu-white-75); font-size: 16px; font-weight: 500; line-height: 1.6; max-width: 560px; }
.chb__cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 26px; }
.chb__pill {
  display: inline-flex; align-items: center; border-radius: var(--nu-r-pill);
  padding: 14px 26px; font-size: 15.5px; font-weight: 700; transition: background .2s, color .2s;
}
.chb__pill--light { background: var(--nu-cream); color: var(--nu-blue); }
.chb__pill--light:hover { background: var(--nu-white); color: var(--nu-blue-hover); }
.chb__pill--outline { border: 2px solid var(--nu-white-35); color: var(--nu-white); }
.chb__pill--outline:hover { background: var(--nu-white-14); color: var(--nu-white); }
</style>
