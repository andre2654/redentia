<script setup lang="ts">
// /imposto-de-renda/{TICKER} — como declarar o papel no IR, para os 50
// tickers mais líquidos de PRECO_TETO_FICHA. Fora da lista: 404.
// O texto legal reusa a calculadora, /quanto-rende e /dividendos.
// O tipo de Bens e Direitos cita o manual da Receita, sem código numérico.

const TICKER_RE = /^[A-Z][A-Z0-9]{3}\d{1,2}$/

definePageMeta({
  middleware: [
    (to) => {
      const raw = String(to.params.ticker ?? '')
      const upper = raw.toUpperCase()
      if (!TICKER_RE.test(upper) || !tickerNaListaImpostoRenda(upper)) {
        return abortNavigation(createError({ statusCode: 404, statusMessage: 'Ativo não encontrado' }))
      }
      if (raw !== upper) {
        return navigateTo({ path: `/imposto-de-renda/${upper}`, query: to.query, hash: to.hash }, { redirectCode: 301, replace: true })
      }
    },
  ],
})

const route = useRoute()
const ticker = String(route.params.ticker ?? '').toUpperCase()
proverSobreDoContexto(ticker)
const { data, error } = await useImpostoRendaTicker(ticker)

const renamedTo = renamedTargetOfError(error.value)
if (renamedTo) {
  const pagina = renamedRotaOfError(error.value) === 'asset' ? 'asset' : 'imposto-de-renda'
  await navigateTo(
    { path: `/${pagina}/${renamedTo}`, query: { ...route.query, de: ticker } },
    { redirectCode: 301, replace: true },
  )
} else if (error.value || !data.value) {
  const err = error.value as { statusCode?: number, statusMessage?: string, data?: unknown } | null
  const status = err?.statusCode
  if (status === 410) {
    throw createError({
      statusCode: 410,
      statusMessage: err?.statusMessage || delistedMessage(ticker, null),
      data: err?.data ?? { ticker, delistedAt: null },
      fatal: true,
    })
  }
  throw createError({
    statusCode: status === 404 ? 404 : 503,
    statusMessage: status === 404 ? `Ativo ${ticker} não encontrado` : 'Dados temporariamente indisponíveis',
    fatal: true,
  })
}

const pacote = computed(() => data.value!)
const ir = computed(() => pacote.value.pagina)
const resto = computed(() => ir.value.secoes.filter((s) => s.id !== 'bens'))
const bens = computed(() => ir.value.secoes.find((s) => s.id === 'bens') ?? null)
const faqTone = computed<'cream' | 'white'>(() => (resto.value.length % 2 === 0 ? 'white' : 'cream'))
const linksTone = computed<'cream' | 'white'>(() => (faqTone.value === 'cream' ? 'white' : 'cream'))

if (data.value) {
  usePageSeo({
    title: ir.value.seo.title,
    description: ir.value.seo.description,
    path: `/imposto-de-renda/${ticker}`,
    dateModified: pacote.value.dataDate,
    breadcrumbs: [
      { name: 'Início', path: '/' },
      { name: ticker, path: `/asset/${ticker}` },
      { name: 'Imposto de Renda', path: `/imposto-de-renda/${ticker}` },
    ],
  })
}
</script>

<template>
  <div v-if="data" class="ir-t">
    <NuPageHero :eyebrow="`${ir.classeRotulo} · ${ticker}`" subtitle="Ficha, rendimentos e ganho de capital, com a regra que o site já cita e os proventos que a base registra.">
      <template #title>Como declarar {{ ticker }} no IR.</template>
      <p class="ir-t__aviso">{{ ir.aviso }}</p>
    </NuPageHero>

    <CalcSplit v-if="bens" tone="white">
      <template #title>{{ bens.titulo }}</template>
      <div v-revelar class="ir-t__prose">
        <p v-for="(paragrafo, i) in bens.paragrafos" :key="`bens-${i}`">
          <template v-for="(trecho, j) in paragrafo" :key="`bens-${i}-${j}`">
            <NuxtLink v-if="trecho.href && trecho.href.startsWith('/')" :to="trecho.href">{{ trecho.texto }}</NuxtLink>
            <a v-else-if="trecho.href" :href="trecho.href" target="_blank" rel="noopener noreferrer">{{ trecho.texto }}</a>
            <template v-else>{{ trecho.texto }}</template>
          </template>
        </p>
      </div>
    </CalcSplit>

    <CalcBand tone="cream" :title="ir.proventos.titulo">
      <template #dek>
        <p v-if="ir.proventos.nota">{{ ir.proventos.nota }}</p>
      </template>
      <div v-revelar class="ir-t__tabela">
        <CalcTableCard
          v-if="ir.proventos.linhas.length"
          :columns="ir.proventos.colunas"
          :rows="ir.proventos.linhas"
          :accent-col="2"
          tone="white"
          cards-mobile
        />
        <p v-else class="ir-t__vazio">{{ ir.proventos.vazio }}</p>
      </div>
    </CalcBand>

    <CalcSplit v-for="(s, i) in resto" :key="s.id" :tone="i % 2 === 0 ? 'white' : 'cream'">
      <template #title>{{ s.titulo }}</template>
      <div v-revelar class="ir-t__prose">
        <p v-for="(paragrafo, pi) in s.paragrafos" :key="`${s.id}-${pi}`">
          <template v-for="(trecho, j) in paragrafo" :key="`${s.id}-${pi}-${j}`">
            <NuxtLink v-if="trecho.href && trecho.href.startsWith('/')" :to="trecho.href">{{ trecho.texto }}</NuxtLink>
            <a v-else-if="trecho.href" :href="trecho.href" target="_blank" rel="noopener noreferrer">{{ trecho.texto }}</a>
            <template v-else>{{ trecho.texto }}</template>
          </template>
        </p>
      </div>
    </CalcSplit>

    <CalcSplit :tone="faqTone" wide>
      <template #title>Perguntas sobre declarar {{ ticker }}.</template>
      <NuFaqAccordion :items="ir.faq" :surface="faqTone === 'cream' ? 'white' : undefined" />
    </CalcSplit>

    <CalcBand :tone="linksTone" title="Continue a leitura.">
      <div v-revelar="{ alvo: 'filhos' }" class="ir-t__links">
        <NuxtLink :to="`/dividendos/${ticker}`" class="ir-t__link" :class="{ 'ir-t__link--white': linksTone === 'cream' }">
          <h3>Dividendos de {{ ticker }}</h3>
          <p>Histórico, datas e o dividend yield na página de proventos.</p>
          <span class="ir-t__link-ir">Abrir<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg></span>
        </NuxtLink>
        <NuxtLink to="/calculadora/imposto-renda" class="ir-t__link" :class="{ 'ir-t__link--white': linksTone === 'cream' }">
          <h3>Calculadora de imposto de renda</h3>
          <p>Swing trade, day trade, isenção de R$ 20 mil e o DARF 6015.</p>
          <span class="ir-t__link-ir">Abrir<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg></span>
        </NuxtLink>
        <NuxtLink :to="`/asset/${ticker}`" class="ir-t__link" :class="{ 'ir-t__link--white': linksTone === 'cream' }">
          <h3>Página de {{ ticker }}</h3>
          <p>Cotação, fundamentos e o histórico de proventos no ativo.</p>
          <span class="ir-t__link-ir">Abrir<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg></span>
        </NuxtLink>
      </div>
      <p class="ir-t__rodape">{{ ir.aviso }}</p>
    </CalcBand>
  </div>
</template>

<style scoped>
.ir-t { min-width: 0; }
.ir-t__aviso {
  display: block; width: fit-content; max-width: 100%; margin: 0;
  padding: 10px 14px; border-radius: var(--nu-r-tag); background: var(--nu-cream-2);
  color: var(--nu-gray-3); font-size: 14px; font-weight: var(--nu-w-medio); line-height: 1.45;
}
.ir-t__prose { max-width: 72ch; margin: clamp(24px, 3vw, 36px) auto 0; min-width: 0; }
.ir-t__prose p {
  margin: 0 0 16px; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-texto);
  letter-spacing: var(--nu-ls-texto); line-height: 1.6; overflow-wrap: anywhere;
}
.ir-t__prose p:last-child { margin-bottom: 0; }
.ir-t__prose a {
  color: var(--nu-blue-text); font-weight: var(--nu-w-medio); text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1.5px;
  text-decoration-color: color-mix(in srgb, currentColor 35%, transparent);
}
.ir-t__prose a:hover { text-decoration-color: currentColor; }
.ir-t__tabela { margin-top: clamp(24px, 3vw, 36px); min-width: 0; }
.ir-t__vazio {
  max-width: 72ch; margin: 0 auto; color: var(--nu-gray-3); font-size: var(--nu-fs-lg);
  font-weight: var(--nu-w-texto); line-height: 1.6; overflow-wrap: anywhere;
}
.ir-t__links {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 16px; margin-top: clamp(28px, 3vw, 40px); max-width: 1080px; margin-left: auto; margin-right: auto;
}
.ir-t__link {
  background: var(--nu-card); border-radius: var(--nu-r-panel); padding: 24px; box-shadow: var(--nu-shadow-quente);
  display: flex; flex-direction: column; gap: 8px; min-width: 0;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
.ir-t__link--white { background: var(--nu-white); box-shadow: var(--nu-shadow-branco); }
.ir-t__link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.ir-t__link:hover h3 { color: var(--nu-blue-text); }
.ir-t__link:active { transform: scale(.995); }
.ir-t__link:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.ir-t__link h3 {
  margin: 0; color: var(--nu-ink); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-forte);
  letter-spacing: var(--nu-ls-titulo); overflow-wrap: anywhere;
}
.ir-t__link p { margin: 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.5; }
.ir-t__link-ir { display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 12px; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.ir-t__rodape {
  max-width: 72ch; margin: clamp(20px, 3vw, 28px) auto 0; color: var(--nu-gray);
  font-size: 13.5px; line-height: 1.5;
}
@media (max-width: 760px) {
  .ir-t__link { padding: 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .ir-t__link { transition: none; }
  .ir-t__link:hover, .ir-t__link:active { transform: none; }
}
</style>
