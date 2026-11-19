<script setup lang="ts">
// /dividendos/agenda/{mês-ano} — pagamentos daquele mês, agrupados pela data
// de pagamento. Slug inválido é 404 antes do fetch. Mês sem lista publicável
// também é 404. Feed fora ou cortado é 503, para não indexar uma lista pela metade.
import { parseMesAgenda, pathDoMes, type PaginaMes } from '~/utils/agendaDividendos'

const route = useRoute()
const raw = String(route.params.mes ?? '')
const alvo = parseMesAgenda(raw)
if (!alvo) {
  throw createError({ statusCode: 404, statusMessage: 'Mês não encontrado', fatal: true })
}
if (raw !== alvo.slug) {
  await navigateTo(
    { path: pathDoMes(alvo.slug), query: route.query, hash: route.hash },
    { redirectCode: 301, replace: true },
  )
}

const { data, error } = await useAsyncData(
  `agenda-dividendos:${alvo.slug}`,
  () => $fetch<PaginaMes>(`/api/dividendos/agenda/${alvo.slug}`),
)

if (error.value || !data.value) {
  const err = error.value as { statusCode?: number, status?: number } | null
  const status = err?.statusCode ?? err?.status
  throw createError({
    statusCode: status === 404 ? 404 : 503,
    statusMessage: status === 404 ? 'Sem agenda para este mês' : 'Dados temporariamente indisponíveis',
    fatal: true,
  })
}

const pagina = computed(() => data.value!)
proverSobreDoContexto(pagina.value.titulo)

usePageSeo({
  title: pagina.value.titulo,
  description: pagina.value.description,
  path: pagina.value.path,
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Agenda de dividendos', path: '/dividendos/agenda' },
    { name: `${pagina.value.nomeTitulo} ${pagina.value.ano}`, path: pagina.value.path },
  ],
})
</script>

<template>
  <div>
    <section class="agd__topo">
      <NuEyebrow como="p">Proventos da B3</NuEyebrow>
      <h1 class="agd__h1">{{ pagina.titulo }}</h1>
      <p class="agd__lead">{{ pagina.lead }}</p>
      <p class="agd__nota">{{ pagina.nota }}</p>
      <nav v-if="pagina.outros.length" class="agd__nav" aria-label="Outros meses">
        <NuxtLink to="/dividendos/agenda">Todos os meses</NuxtLink>
        <NuxtLink v-for="mes in pagina.outros" :key="mes.slug" :to="mes.path">{{ mes.rotulo }}</NuxtLink>
      </nav>
    </section>

    <CalcBand tone="cream" title="Pagamentos do mês.">
      <template #dek>
        <p>Agrupados pela data de pagamento. O valor é o do aviso, por ação, cota ou BDR.</p>
      </template>
      <AgendaLista :dias="pagina.dias" :contagens="pagina.contagens" />
      <p class="agd__fonte">{{ pagina.fonte }}</p>
    </CalcBand>

    <CalcSplit tone="white" wide>
      <template #title>Dúvidas sobre a agenda de {{ pagina.nome }} de {{ pagina.ano }}.</template>
      <NuFaqAccordion :items="pagina.faq" />
    </CalcSplit>

    <CalcBand tone="cream" title="Siga a partir daqui.">
      <div v-revelar="{ alvo: 'filhos' }" class="agd__cards">
        <NuxtLink to="/dividendos/agenda" class="agd__card">
          <h3 class="agd__card-titulo">Agenda de dividendos</h3>
          <p class="agd__card-p">Os outros meses que já têm pagamentos anunciados na base.</p>
          <span class="agd__ir">Abrir<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg></span>
        </NuxtLink>
        <NuxtLink to="/ranking/maiores-dividend-yield" class="agd__card">
          <h3 class="agd__card-titulo">Maiores dividend yields</h3>
          <p class="agd__card-p">Quem mais pagou nos últimos 12 meses. Não é o calendário deste mês.</p>
          <span class="agd__ir">Abrir<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg></span>
        </NuxtLink>
        <NuxtLink to="/guias/data-com-e-data-ex" class="agd__card">
          <h3 class="agd__card-titulo">Data com e data ex</h3>
          <p class="agd__card-p">Até quando comprar para receber, e por que o preço cai na data ex.</p>
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
  margin: 16px 0 0; max-width: 22ch; font-size: clamp(36px, 4.6vw, 64px); font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-display); line-height: .98; text-wrap: balance;
}
.agd__lead { margin: 20px 0 0; max-width: 54ch; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.45; text-wrap: pretty; }
.agd__nota { margin: 16px 0 0; max-width: 58ch; color: var(--nu-gray); font-size: 14px; line-height: 1.5; }
.agd__nav { display: flex; flex-wrap: wrap; gap: 8px 14px; margin-top: 22px; max-width: 720px; }
.agd__nav a { color: var(--nu-blue-text); font-size: 14px; font-weight: var(--nu-w-medio); text-decoration: underline; text-underline-offset: .15em; }
.agd__nav a:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; border-radius: 4px; }

.agd__fonte { max-width: 1080px; margin: 18px auto 0; color: var(--nu-gray); font-size: 13px; line-height: 1.5; }

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
.agd__ir { display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 12px; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.agd__ir svg { transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.agd__card:hover .agd__ir svg { transform: translateX(3px); }

@media (max-width: 760px) {
  .agd__h1 { max-width: none; }
  .agd__card { padding: 18px; }
}
@media (prefers-reduced-motion: reduce) {
  .agd__card, .agd__ir svg { transition: none; }
  .agd__card:hover, .agd__card:hover .agd__ir svg { transform: none; }
}
</style>
