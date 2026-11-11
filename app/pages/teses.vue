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
// o chat saiu da /busca (02/11/2026): o botão do FAQ abre o painel do chat
const painel = useChatPainel()

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
          <NuEyebrow como="p">Perguntas</NuEyebrow>
          <h2 class="tsf__title">Ficou com alguma<br>dúvida?</h2>
          <div class="tsf__copy">Respostas para as principais dúvidas sobre teses de investimento na Aportou.</div>
          <NuBotaoSeta variante="carvao" tamanho="m" class="tsf__cta" @click="painel.abrir()">Perguntar à IA</NuBotaoSeta>
        </div>
        <div class="tsf__right">
          <NuFaqAccordion :items="TESES_FAQS" :default-open="-1" surface="white" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ——— FAQ (Aportou: a faixa quente, o eyebrow, o H2 em 800, a pílula com a seta) ——— */
.tsf { background: var(--nu-band); padding: clamp(64px, 7vw, 100px) max(clamp(20px, 5.5vw, 80px), calc((100% - 1240px) / 2)); animation: nu-fade .5s ease both; }
.tsf__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; max-width: 1240px; margin: 0 auto; }
.tsf__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.tsf__title {
  margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1.02;
}
.tsf__copy { color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500; line-height: 1.45; margin-top: 20px; max-width: 420px; }
.tsf__cta { margin-top: 28px; }
.tsf__right { flex: 1.6 1 480px; min-width: min(340px, 100%); }
</style>
