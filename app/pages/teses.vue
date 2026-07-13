<script setup lang="ts">
// /teses — hub de teses de investimento. Contrato de UX:
// docs/redentia-nu/designs-v2/Redentia Teses Nu.dc.html. Header, ticker
// "Mercado agora" e footer vêm do layout default; a página implementa o miolo:
// hero → "Grandes ideias." → banner Redentia AI → "Estratégias de
// investidores." → "Melhores pesquisas." → vantagens (#explorar) → FAQ.
// Dados: useTesesPage (seed do design → /theses real → degrade).
const { ideias, pesquisas, estrategias } = useTesesPage()

usePageSeo({
  title: 'Teses de investimento',
  description: 'Cada tese é uma leitura do mundo transformada em ações: estudada a fundo em centenas de fontes, montada como carteira e revalidada por IA quando os fatos mudam.',
  path: '/teses',
  breadcrumbs: [{ name: 'Teses', path: '/teses' }],
})
</script>

<template>
  <div>
    <!-- Hero (sem eyebrow — anatomia própria do design, ≠ NuPageHero) -->
    <section class="tsh">
      <h1 class="tsh__title">Invista em ideias,<br>não em palpites.</h1>
      <p class="tsh__sub">Cada tese é uma leitura do mundo transformada em ações, estudada a fundo, montada como carteira e revalidada quando os fatos mudam.</p>
    </section>

    <TesesCarrossel
      v-if="ideias.length"
      title="Grandes ideias."
      sub="As últimas teses da Redentia"
      :cards="ideias"
      eyebrow="Ativos da tese"
      cta="Ver tese"
    />

    <TesesAiBanner />

    <TesesCarrossel
      v-if="estrategias.length"
      title="Estratégias de investidores."
      sub="Fácil de seguir, estudo de portfólios."
      :cards="estrategias"
      eyebrow="Ativos da carteira"
      cta="Ver carteira"
      surface="cream"
    />

    <TesesCarrossel
      v-if="pesquisas.length"
      title="Melhores pesquisas."
      sub="Teses que performaram melhor."
      :cards="pesquisas"
      eyebrow="Ativos da tese"
      cta="Ver pesquisa"
    />

    <TesesVantagens />

    <!-- FAQ -->
    <section class="tsf">
      <div class="tsf__cols">
        <div class="tsf__left">
          <h2 class="tsf__title">Ficou com alguma<br>dúvida?</h2>
          <div class="tsf__copy">Respostas para as principais dúvidas sobre teses de investimento na Redentia.</div>
          <NuxtLink to="/busca" class="tsf__cta">Perguntar à Redentia AI</NuxtLink>
        </div>
        <div class="tsf__right">
          <NuFaqAccordion :items="TESES_FAQS" :default-open="-1" surface="white" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ——— Hero ——— */
.tsh {
  background: var(--nu-cream);
  padding: clamp(46px, 6.5vw, 88px) clamp(22px, 5.5vw, 80px) clamp(38px, 5vw, 60px);
  animation: nu-fade .5s ease both;
}
.tsh__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(40px, 6vw, 82px);
  font-weight: 800; letter-spacing: -0.045em; line-height: 1.0;
}
.tsh__sub {
  color: var(--nu-teses-hero-sub); font-size: clamp(17px, 1.8vw, 21px);
  font-weight: 600; line-height: 1.55; margin: 22px 0 0; max-width: 640px;
}

/* ——— FAQ ——— */
.tsf { background: var(--nu-cream); padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.tsf__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.tsf__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.tsf__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.tsf__copy { color: var(--nu-gray-2); font-size: 17px; font-weight: 500; line-height: 1.6; margin-top: 22px; max-width: 420px; }
.tsf__cta {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.tsf__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.tsf__right { flex: 1.6 1 480px; min-width: min(340px, 100%); }
</style>
