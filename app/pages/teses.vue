<script setup lang="ts">
// /teses — o hub das teses de investimento. Desde 02/11/2026 é "A grade"
// (TesesGrade), escolhida pelo dono entre três direções ("gostei da 3, pode
// manter nela"): cartões ricos com filtros que grudam embaixo da régua do
// mercado e o FAQ no fim. Os carrosséis, o banner da Redentia AI e as
// vantagens saíram.
//
// SEO: a lista de /theses vem no SSR (useTesesPage), então o HTML da 1ª
// resposta já leva as 10 teses com link para /tese/{slug}; a convicção dia a
// dia (/api/teses-painel) só enriquece depois do mount. O FAQ emite o FAQPage
// (NuFaqAccordion). Um H1 só, o da grade.
const { cards, favoritos, loading, dataDate } = await useTesesPage()

usePageSeo({
  title: 'Teses de investimento',
  description: 'Cada tese é uma leitura do mundo transformada em ações: estudada a fundo em centenas de fontes, montada como carteira e revalidada por IA quando os fatos mudam.',
  path: '/teses',
  dateModified: dataDate, // estudo mais recente entre as teses (não o calendário)
  breadcrumbs: [{ name: 'Teses', path: '/teses' }],
})
</script>

<template>
  <div>
    <TesesGrade :cards="cards" :favoritos="favoritos" :carregando="loading" />

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
/* ——— FAQ ——— */
.tsf { background: var(--nu-cream); padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.tsf__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.tsf__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.tsf__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 500; letter-spacing: -0.045em; line-height: 1.02;
}
.tsf__copy { color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6; margin-top: 22px; max-width: 420px; }
.tsf__cta {
  display: inline-flex; align-items: center; height: 44px; padding: 0 22px; margin-top: 28px;
  border-radius: var(--nu-r-pill); box-shadow: inset 0 0 0 1px var(--nu-ink-16);
  color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; transition: background .2s, box-shadow .2s;
}
.tsf__cta:hover { background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-ink-30); color: var(--nu-ink); }
.tsf__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.tsf__right { flex: 1.6 1 480px; min-width: min(340px, 100%); }
</style>
