<script setup lang="ts">
// /dividendos/agenda — hub da agenda. Lista os meses cuja janela de avisos
// da B3 cobre o mês inteiro e tem ao menos um pagamento. Novembro e dezembro
// de 2026 entram por aí quando a base responde; se os dois feeds caem, os
// dois links seguem no hub e a página do mês é que responde 503.
import { PATH_HUB, type HubAgenda } from '~/utils/agendaDividendos'

const { data, error } = await useAsyncData(
  'agenda-dividendos',
  () => $fetch<HubAgenda>('/api/dividendos/agenda'),
)

if (error.value || !data.value) {
  throw createError({
    statusCode: 503,
    statusMessage: 'Dados temporariamente indisponíveis',
    fatal: true,
  })
}

const hub = computed(() => data.value!)
proverSobreDoContexto(hub.value.titulo)

usePageSeo({
  title: hub.value.titulo,
  description: hub.value.description,
  path: PATH_HUB,
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Agenda de dividendos', path: PATH_HUB },
  ],
})
</script>

<template>
  <div>
    <section class="agd__topo">
      <NuEyebrow como="p">Proventos da B3</NuEyebrow>
      <h1 class="agd__h1">{{ hub.titulo }}</h1>
      <p class="agd__lead">{{ hub.lead }}</p>
      <p class="agd__nota">{{ hub.nota }}</p>
    </section>

    <CalcBand tone="cream" title="Meses com pagamento anunciado.">
      <template #dek>
        <p>{{ hub.fonte }}</p>
      </template>
      <p v-if="hub.indisponivel" class="agd__aviso">A contagem por mês não carregou agora. Os links de novembro e dezembro de 2026 continuam aqui.</p>
      <div v-revelar="{ alvo: 'filhos' }" class="agd__meses">
        <NuxtLink v-for="mes in hub.meses" :key="mes.slug" :to="mes.path" class="agd__mes">
          <h3 class="agd__mes-titulo">{{ mes.rotulo }}</h3>
          <p v-if="mes.total != null" class="agd__mes-p">{{ mes.total }} {{ mes.total === 1 ? 'pagamento' : 'pagamentos' }}<template v-if="mes.fiis"> · {{ mes.fiis }} {{ mes.fiis === 1 ? 'FII' : 'FIIs' }}</template></p>
          <p v-else class="agd__mes-p">Abre a lista do mês</p>
          <span class="agd__ir">Ver a agenda<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg></span>
        </NuxtLink>
      </div>
    </CalcBand>

    <CalcSplit tone="white" wide>
      <template #title>Dúvidas sobre a agenda de dividendos.</template>
      <NuFaqAccordion :items="hub.faq" />
    </CalcSplit>

    <CalcBand tone="cream" title="Siga a partir daqui.">
      <div v-revelar="{ alvo: 'filhos' }" class="agd__cards">
        <NuxtLink to="/ranking/maiores-dividend-yield" class="agd__card">
          <h3 class="agd__card-titulo">Maiores dividend yields</h3>
          <p class="agd__card-p">O ranking de 12 meses. A agenda é o calendário do mês, outra conta.</p>
          <span class="agd__ir">Abrir<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg></span>
        </NuxtLink>
        <NuxtLink to="/fiis" class="agd__card">
          <h3 class="agd__card-titulo">Rankings de FIIs</h3>
          <p class="agd__card-p">Dividend yield e P/VP dos fundos. Não é a lista de pagamentos do mês.</p>
          <span class="agd__ir">Abrir<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg></span>
        </NuxtLink>
        <NuxtLink to="/jcp" class="agd__card">
          <h3 class="agd__card-titulo">Juros sobre capital próprio</h3>
          <p class="agd__card-p">O que é JCP, a diferença para o dividendo e a retenção de 17,5% desde 2026.</p>
          <span class="agd__ir">Abrir<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg></span>
        </NuxtLink>
        <NuxtLink to="/guias/data-com-e-data-ex" class="agd__card">
          <h3 class="agd__card-titulo">Data com e data ex</h3>
          <p class="agd__card-p">O que cada data decide, e por que vender na data ex não tira o provento.</p>
          <span class="agd__ir">Abrir<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg></span>
        </NuxtLink>
      </div>
    </CalcBand>
  </div>
</template>

<style scoped>
.agd__topo {
  background: var(--nu-page); color: var(--nu-ink);
  padding: clamp(40px, 4.6vw, 72px) var(--nu-coluna) clamp(28px, 4vw, 48px);
}
.agd__h1 {
  margin: 16px 0 0; max-width: 16ch; font-size: clamp(40px, 4.8vw, 68px); font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-display); line-height: .98; text-wrap: balance;
}
.agd__lead { margin: 20px 0 0; max-width: 52ch; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.45; text-wrap: pretty; }
.agd__nota { margin: 16px 0 0; max-width: 58ch; color: var(--nu-gray); font-size: 14px; line-height: 1.5; }

.agd__aviso { max-width: 680px; margin: 20px auto 0; text-align: center; color: var(--nu-gray-3); font-size: var(--nu-fs-md); line-height: 1.5; }
.agd__meses {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr));
  gap: 16px; max-width: 1080px; margin: clamp(28px, 4vw, 40px) auto 0;
}
.agd__mes {
  display: flex; flex-direction: column; gap: 8px; min-width: 0;
  background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 22px;
  box-shadow: var(--nu-shadow-branco); text-decoration: none; color: inherit;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
.agd__mes:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.agd__mes:active { transform: scale(.995); }
.agd__mes:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.agd__mes-titulo { margin: 0; color: var(--nu-ink); font-size: clamp(20px, 2vw, 26px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.15; }
.agd__mes:hover .agd__mes-titulo { color: var(--nu-blue-text); }
.agd__mes-p { margin: 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); line-height: 1.45; }
.agd__ir { display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 12px; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.agd__mes:hover .agd__ir svg, .agd__card:hover .agd__ir svg { transform: translateX(3px); }
.agd__ir svg { transition: transform var(--nu-dur-media) var(--nu-ease-saida); }

.agd__cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
  gap: 16px; max-width: 1080px; margin: clamp(28px, 4vw, 40px) auto 0;
}
.agd__card {
  display: flex; flex-direction: column; gap: 8px; min-width: 0;
  background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 22px;
  box-shadow: var(--nu-shadow-branco); text-decoration: none; color: inherit;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
.agd__card:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.agd__card:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.agd__card-titulo { margin: 0; color: var(--nu-ink); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); }
.agd__card:hover .agd__card-titulo { color: var(--nu-blue-text); }
.agd__card-p { margin: 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); line-height: 1.5; }

@media (max-width: 760px) {
  .agd__h1 { max-width: none; }
  .agd__mes, .agd__card { padding: 18px; }
}
@media (prefers-reduced-motion: reduce) {
  .agd__mes, .agd__card, .agd__ir svg { transition: none; }
  .agd__mes:hover, .agd__card:hover, .agd__mes:hover .agd__ir svg, .agd__card:hover .agd__ir svg { transform: none; }
}
</style>
