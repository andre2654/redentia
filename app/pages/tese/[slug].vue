<script setup lang="ts">
// /tese/[slug] — página de tese de investimento (PR5). Contrato de UX:
// docs/redentia-nu/designs/Redentia Tese.dc.html. O layout default já
// renderiza NuHeader + NuMarketTicker + NuFooter; aqui vive o miolo na ordem
// do design: hero (navy, imagem) → editorial (creme) → números (navy, chart
// vs IBOV) → relatório completo (branco, duas colunas no padrão dos guias, SÓ
// quando a tese tem o campo `report`) → avaliação por ativo (branco) →
// drivers (azul) → diário (creme).
//
// SEO: SSR-first (detail + performance + convicção buscados no servidor via
// useAsyncData — editorial completo no HTML da 1ª resposta), canonical
// minúsculo com 301 do uppercase, JSON-LD Article + BreadcrumbList.
// routeRules '/tese/**' já cacheia 300s+swr no nuxt.config.

// Slugs reais são kebab-case minúsculo (reindustrializacao-eua…). Fora do
// formato → 404 antes de qualquer fetch; uppercase → 301 pro canonical.
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,80}$/

definePageMeta({
  middleware: [
    (to) => {
      const raw = String(to.params.slug ?? '')
      const lower = raw.toLowerCase()
      if (!SLUG_RE.test(lower)) {
        return abortNavigation(createError({ statusCode: 404, statusMessage: 'Tese não encontrada' }))
      }
      // Canonical minúsculo: /tese/Reindustrializacao-EUA → 301 /tese/reindustrializacao-eua
      if (raw !== lower) {
        return navigateTo(`/tese/${lower}`, { redirectCode: 301, replace: true })
      }
    },
  ],
})

const slug = String(useRoute().params.slug ?? '').toLowerCase()

const { data, error } = await useTese(slug)

if (error.value || !data.value) {
  const status = (error.value as { statusCode?: number } | null)?.statusCode
  throw createError({
    statusCode: status === 404 ? 404 : 503,
    statusMessage: status === 404 ? 'Tese não encontrada' : 'Dados temporariamente indisponíveis',
    fatal: true,
  })
}

const tese = computed(() => data.value!)

const pageUrl = useRequestURL()
const origin = `${pageUrl.protocol}//${pageUrl.host}`
const ogImage = tese.value.seo.image ? `${origin}${tese.value.seo.image}` : undefined

// Article (página editorial): headline + datas REAIS das revalidações
// (datePublished = estudo mais antigo, dateModified = revalidação mais
// recente) + autor Organization Redentia. Image/publisher/mainEntityOfPage
// ganham defaults no usePageSeo.
const structuredData: Record<string, unknown>[] = [
  {
    '@type': 'Article',
    headline: tese.value.seo.title,
    description: tese.value.seo.description,
    ...(tese.value.seo.datePublished ? { datePublished: tese.value.seo.datePublished } : {}),
    ...(tese.value.seo.dateModified ? { dateModified: tese.value.seo.dateModified } : {}),
    // wordCount só quando a tese TEM o relatório completo (o campo mede o
    // artigo longo, não os blocos vivos da página).
    ...(tese.value.seo.wordCount ? { wordCount: tese.value.seo.wordCount } : {}),
    author: { '@type': 'Organization', name: 'Redentia', url: origin },
  },
]

usePageSeo({
  title: tese.value.seo.title,
  description: tese.value.seo.description,
  path: `/tese/${slug}`,
  image: ogImage,
  structuredData,
  breadcrumbs: [
    { name: 'Teses', path: '/teses' },
    { name: tese.value.title, path: `/tese/${slug}` },
  ],
})
</script>

<template>
  <div>
    <TeseHero :hero="tese.hero" :slug="slug" />

    <TeseEditorial v-if="tese.editorial" :editorial="tese.editorial" />

    <TeseNumbers v-if="tese.numbers" :numbers="tese.numbers" />

    <!-- Avaliação por ativo LOGO DEPOIS dos números (direção do dono
         2026-07-14): quem chega quer ver quais ativos compõem a tese. Pro
         ANÔNIMO, os cards além dos 2 primeiros são embaçados e um card de
         gate força o login (o resto da tese fica atrás do cadastro). -->
    <TeseEvalGrid
      v-if="tese.evalSection"
      :eval-section="tese.evalSection"
      :studies-count="tese.studiesCount"
    />

    <!-- O relatório completo (campo `report`, nullable): o documento de
         fundação da tese, em duas colunas no padrão dos guias (índice sticky à
         esquerda com scrollspy + artigo longo à direita). Só existe quando a
         tese tem o campo `report`. -->
    <TeseReport v-if="tese.report" :report="tese.report" />

    <TeseDrivers v-if="tese.drivers" :drivers="tese.drivers" />

    <TeseDiary v-if="tese.diary && tese.diary.studies.length" :diary="tese.diary" />
  </div>
</template>
