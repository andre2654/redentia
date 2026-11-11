<script setup lang="ts">
// /tese/[slug] — página de tese de investimento. O layout default já renderiza
// o topo, a faixa e o rodapé; aqui vive o miolo.
//
// 11/11/2026: a tela foi REPENSADA (docs/aportou/tese.md). A página tinha
// ~14.000px porque despejava os textos enormes da API dentro de cartões. Agora
// cada seção responde uma pergunta, na ordem:
//   1. TeseTopo    — qual é a ideia e como ela vai (creme, duas colunas, o
//                    gráfico de desempenho na faixa da marca);
//   2. TeseIdeia   — a ideia em 1 minuto (a frase da tese e os três vereditos);
//   3. TeseAtivos  — o que está na tese (uma LISTA de linhas que abrem);
//   4. TeseDiary   — o que mudou (o diário em linha do tempo);
//   5. TeseRiscos  — o que pode dar errado;
//   6. TeseReport  — o relatório completo, recolhido (SÓ quando a tese tem o
//                    campo `report` e a pessoa entrou);
//   7. TeseFecho   — acompanhar / criar conta, e o aviso.
// Nada de dado novo nem de regra nova: as contas, o seguir, o gate do
// visitante e o SEO são os de antes. O que é longo fica em <details>: todo o
// texto continua no HTML do servidor.
//
// SEO: SSR-first (detail + performance + convicção buscados no servidor via
// useAsyncData — editorial completo no HTML da 1ª resposta), canonical
// minúsculo com 301 do uppercase, JSON-LD Article + BreadcrumbList.
// routeRules '/tese/**' já cacheia 300s+swr no nuxt.config.
import type { TeseVerdictVM } from '~/types/tese'

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
// o sujeito dos cartões que vão ao chat ("P/L PETR4"): useSobreDoContexto
proverSobreDoContexto(() => data.value?.title)

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

// Paywall (dono 2026-07-14): pro ANÔNIMO o relatório completo NÃO é renderizado
// (o convite da lista de ativos é a parede) e os vereditos e o diário entram
// embaçados. useAuthState resolve o login no servidor (cookie) → o SSR do
// anônimo já vem sem o relatório, e o do logado vem completo.
const { isAuthenticated } = useAuthState()

// Seguir tese: persiste em /thesis-favorites (cross-device) via useThesisFollow;
// anônimo → login com redirect. Uma instância só para a página (o topo, os
// riscos e o fecho mostram o mesmo estado).
const { following, pending, toggle: acompanhar } = useThesisFollow(() => slug)

// "Perguntar à IA": abre o painel do chat com a tese anexada, sem pergunta
const painel = useChatPainel()
function perguntar() {
  const t = tese.value
  painel.abrir(undefined, [{
    id: `tese:${slug}`, tipo: 'tese', rotulo: rotuloCurto(`Tese · ${t.title}`),
    texto: [`Tese ${t.title}: ${t.hero.subtitle}`, t.hero.convBadge, t.hero.sinceBadge, t.hero.ativosBadge].filter(Boolean).join('\n'),
    rota: `/tese/${slug}`,
  }])
}

// os três vereditos (título e corpo separados); no seed do design, que não os
// traz, saem dos bullets de sempre
const verdicts = computed<TeseVerdictVM[]>(() => {
  const t = tese.value
  if (t.verdicts?.length) return t.verdicts
  const d = t.drivers
  if (!d) return []
  return [
    ...d.favor.map((body) => ({ kind: 'favor', title: '', body })),
    ...d.sinal.map((body) => ({ kind: 'sinal', title: '', body })),
    ...(d.risco ? [{ kind: 'risco', title: d.risco.title, body: d.risco.body }] : []),
  ]
})
const risco = computed(() => verdicts.value.find((v) => v.kind === 'risco') ?? null)
// os riscos do relatório são de quem entrou (o visitante não recebe o relatório)
const riscosDoRelatorio = computed(() => (isAuthenticated.value ? tese.value.report?.risksHtml ?? [] : []))

const temIdeia = computed(() => !!tese.value.editorial || verdicts.value.length > 0)
const temAtivos = computed(() => !!(tese.value.ativos?.length || tese.value.evalSection?.cards.length))
const temDiario = computed(() => !!tese.value.diary?.studies.length)
const temRiscos = computed(() => riscosDoRelatorio.value.length > 0 || !!risco.value)
const temRelatorio = computed(() => !!tese.value.report && isAuthenticated.value)

// a régua de seções, abaixo do topo: só o que a página tem (e só com duas ou mais)
useSectionRail(() => {
  const secoes = [
    ...(temIdeia.value ? [{ id: 'ideia', label: 'A ideia' }] : []),
    ...(temAtivos.value ? [{ id: 'ativos', label: 'Ativos' }] : []),
    ...(temDiario.value ? [{ id: 'mudou', label: 'O que mudou' }] : []),
    ...(temRiscos.value ? [{ id: 'riscos', label: 'Riscos' }] : []),
    ...(temRelatorio.value ? [{ id: 'relatorio', label: 'Relatório' }] : []),
  ]
  return secoes.length > 1 ? secoes : []
}, { pageLabel: 'Nesta tese' })

// um convite só: quando o cartão "Tese completa" do visitante (o da lista de
// ativos, que aparece com mais de 2 ativos) é a última coisa antes do fecho, o
// painel azul não repete o pedido logo embaixo
const totalDeAtivos = computed(() => tese.value.ativos?.length || tese.value.evalSection?.cards.length || 0)
const painelNoFecho = computed(() => isAuthenticated.value || !(totalDeAtivos.value > 2 && !temDiario.value && !temRiscos.value))

const origin = useSiteOrigin()
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
    author: { '@type': 'Organization', name: MARCA.nome, url: origin },
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
    <TeseTopo
      :hero="tese.hero" :numbers="tese.numbers" :slug="slug" :launch-label="tese.launchLabel ?? null"
      :following="following" :pending="pending" @acompanhar="acompanhar" @perguntar="perguntar"
    />

    <TeseIdeia v-if="temIdeia" :editorial="tese.editorial" :verdicts="verdicts" :trancado="!isAuthenticated" />

    <!-- Os ativos logo depois da ideia (direção do dono 2026-07-14): quem chega
         quer ver o que compõe a tese. Pro ANÔNIMO, só os 2 primeiros abrem; os
         3 seguintes aparecem trancados e o convite pede o cadastro. -->
    <TeseAtivos
      v-if="temAtivos"
      :ativos="tese.ativos ?? []"
      :cards="tese.evalSection?.cards ?? []"
      :ultimo-estudo="tese.diary?.studies[0] ?? null"
      :meta-line="tese.evalSection?.metaLine ?? null"
      :studies-count="tese.studiesCount"
      :has-report="!!tese.report"
    />

    <TeseDiary v-if="temDiario" :diary="tese.diary!" />

    <TeseRiscos
      v-if="temRiscos"
      :risks-html="riscosDoRelatorio" :risco="risco" :monitoring="tese.monitoring ?? null" :trancado="!isAuthenticated"
      :following="following" :pending="pending" @acompanhar="acompanhar"
    />

    <!-- O relatório completo (campo `report`, nullable), recolhido. Só existe
         quando a tese tem o campo — e, no PAYWALL, só pro logado: o anônimo
         não recebe o relatório (fica atrás do cadastro). -->
    <TeseReport v-if="temRelatorio" :report="tese.report!" />

    <TeseFecho :following="following" :pending="pending" :visitante="!isAuthenticated" :painel="painelNoFecho" @acompanhar="acompanhar" />
  </div>
</template>
