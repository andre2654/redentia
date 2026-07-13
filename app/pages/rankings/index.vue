<script setup lang="ts">
// /rankings — hub dos 22 rankings (PLANO-RANKINGS.md). Hero Nu + card
// destaque Redentia Score (top 5 REAL, SSR) + grid agrupado por tema.
// Filtro por pills reativo a ?classe= (acoes|fiis|bdrs|renda-fixa) — o link
// do header chega filtrado. Preview top-3 dos cards hidrata LAZY no client
// (IntersectionObserver; nada de 22 fetches no SSR — backend cacheia 15 min).
import type { RankingClasse, RankingMeta, RankingRowApi } from '~/types/rankings'
import { RANKINGS, RANKING_TEMAS } from '~/content/rankings/registry'

const route = useRoute()
const router = useRouter()

const ALL = Object.values(RANKINGS)

// ————— filtro por classe (?classe=) —————
const CLASSE_LABELS: Record<string, RankingClasse | null> = {
  'Todos': null,
  'Ações': 'acoes',
  'FIIs': 'fiis',
  'BDRs': 'bdrs',
  'Renda fixa': 'renda-fixa',
}
const pillItems = Object.keys(CLASSE_LABELS)

const activeClasse = computed<RankingClasse | null>(() => {
  const q = String(route.query.classe ?? '')
  return (['acoes', 'fiis', 'bdrs', 'renda-fixa'] as const).includes(q as RankingClasse)
    ? (q as RankingClasse)
    : null
})
const activePill = computed(
  () => pillItems.find((l) => CLASSE_LABELS[l] === activeClasse.value) ?? 'Todos',
)
function setPill(label: string) {
  const classe = CLASSE_LABELS[label]
  const query = { ...route.query }
  if (classe) query.classe = classe
  else delete query.classe
  router.replace({ query })
}

const CHIP_LABEL: Record<RankingClasse, string> = {
  'acoes': 'Ações',
  'fiis': 'FIIs',
  'bdrs': 'BDRs',
  'renda-fixa': 'Renda fixa',
}

/** grupos por tema, já filtrados pela classe ativa (tema some se esvaziar). */
const grupos = computed(() =>
  RANKING_TEMAS
    .map((tema) => ({
      tema,
      items: ALL.filter(
        (m) => m.tema === tema && (!activeClasse.value || m.classe.includes(activeClasse.value)),
      ),
    }))
    .filter((g) => g.items.length > 0),
)

// ————— destaque: Redentia Score top 5 REAL (SSR) —————
const { data: scoreTop } = await useAsyncData(
  'rankings-hub-score-top5',
  async () => {
    try {
      const resp = await fetchRanking('redentia-score', { limit: 5 })
      return resp.data ?? []
    } catch {
      return [] // degrade honesto: destaque some, hub continua
    }
  },
  { default: () => [] as RankingRowApi[] },
)

function scoreOf(row: RankingRowApi): string {
  return RANKING_COLUMNS.score.format(row)
}

// ————— preview top-3 lazy (IntersectionObserver no client) —————
const previews = reactive<Record<string, { ticker: string; value: string }[]>>({})
const loadedSlugs = new Set<string>()

async function loadPreview(slug: string) {
  if (loadedSlugs.has(slug)) return
  loadedSlugs.add(slug)
  const meta = RANKINGS[slug]
  if (!meta) return
  try {
    if (meta.endpoint === 'tesouro') {
      const rows = await fetchTesouroRanking()
      previews[slug] = rows.slice(0, 3).map((r) => ({ ticker: r.name, value: r.rate }))
      return
    }
    const resp = await fetchRanking(meta.endpoint, {
      limit: 3,
      side: meta.extraParams?.side as 'top' | 'bottom' | undefined,
      days: meta.extraParams?.days ? Number(meta.extraParams.days) : undefined,
    })
    const col = RANKING_COLUMNS[meta.primaryMetric]
    previews[slug] = (resp.data ?? []).slice(0, 3).map((row) => ({
      ticker: rankingTicker(row),
      value: col.format(row),
    }))
  } catch {
    // preview é enriquecimento — falhou, o card fica só com a copy estática
  }
}

let observer: IntersectionObserver | null = null
function observeCards() {
  observer?.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const slug = (e.target as HTMLElement).dataset.slug
        if (slug) loadPreview(slug)
        observer?.unobserve(e.target)
      }
    },
    { rootMargin: '200px' },
  )
  document.querySelectorAll<HTMLElement>('[data-slug]').forEach((el) => observer?.observe(el))
}
onMounted(() => nextTick(observeCards))
watch(grupos, () => nextTick(observeCards))
onBeforeUnmount(() => observer?.disconnect())

// ————— SEO —————
usePageSeo({
  title: 'Rankings da B3 2026: Top Ações, FIIs, BDRs e Tesouro',
  description:
    'Todos os rankings da bolsa brasileira em um lugar: dividend yield, valor de mercado, Graham, Bazin, ROE, crescimento, Redentia Score e Tesouro Direto. Atualizados diariamente.',
  path: '/rankings',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Rankings', path: '/rankings' },
  ],
  structuredData: [
    {
      '@type': 'ItemList',
      name: 'Rankings da B3 - Redentia',
      numberOfItems: ALL.length,
      itemListElement: ALL.map((m, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: m.title,
        url: `/ranking/${m.slug}`,
      })),
    },
  ],
})

function cardTypes(meta: RankingMeta): string[] {
  return meta.classe.map((c) => CHIP_LABEL[c])
}
</script>

<template>
  <div>
    <!-- ============ Hero ============ -->
    <NuPageHero
      size="lg" eyebrow="Ferramentas"
      subtitle="A B3 inteira ranqueada do maior pro menor: dividendos, tamanho, valuation, crescimento e o Redentia Score. Atualizado diariamente após o pregão."
    >
      <template #title>Rankings da B3.</template>
      <NuFilterPills :items="pillItems" :model-value="activePill" @update:model-value="setPill" />
    </NuPageHero>

    <!-- ============ Destaque: Redentia Score top 5 (SSR real) ============ -->
    <section v-if="scoreTop.length" class="rkh__spot-wrap">
      <NuxtLink to="/ranking/redentia-score" class="rkh__spot">
        <div class="rkh__spot-left">
          <span class="rkh__spot-eyebrow">Exclusivo Redentia</span>
          <h2 class="rkh__spot-title">Redentia Score.</h2>
          <p class="rkh__spot-sub">
            A nota de 0 a 100 que cruza 15 rankings fundamentalistas de uma vez.
            Quem aparece bem em vários, sobe. Quem só brilha em um, não.
          </p>
          <span class="rkh__spot-cta">Ver o ranking completo</span>
        </div>
        <ol class="rkh__spot-list">
          <li v-for="(row, i) in scoreTop" :key="rankingTicker(row)" class="rkh__spot-row">
            <span class="rkh__spot-pos">{{ i + 1 }}</span>
            <span class="rkh__spot-ticker">{{ rankingTicker(row) }}</span>
            <span class="rkh__spot-name">{{ rankingName(row) }}</span>
            <span class="rkh__spot-score">{{ scoreOf(row) }}</span>
          </li>
        </ol>
      </NuxtLink>
    </section>

    <!-- ============ Grid dos 22, agrupado por tema ============ -->
    <section class="rkh__grid-wrap">
      <div v-for="g in grupos" :key="g.tema" class="rkh__group">
        <h2 class="rkh__group-title">{{ g.tema }}</h2>
        <div class="rkh__grid">
          <NuxtLink
            v-for="m in g.items" :key="m.slug" :to="`/ranking/${m.slug}`"
            class="rkh__card" :data-slug="m.slug"
          >
            <div class="rkh__card-chips">
              <span v-for="t in cardTypes(m)" :key="t" class="rkh__card-chip">{{ t }}</span>
            </div>
            <h3 class="rkh__card-title">{{ m.title }}</h3>
            <p class="rkh__card-desc">{{ m.metaDescription }}</p>
            <ol v-if="previews[m.slug]?.length" class="rkh__card-preview">
              <li v-for="(p, i) in previews[m.slug]" :key="p.ticker" class="rkh__card-preview-row">
                <span class="rkh__card-preview-pos">{{ i + 1 }}</span>
                <span class="rkh__card-preview-ticker">{{ p.ticker }}</span>
                <span class="rkh__card-preview-value">{{ p.value }}</span>
              </li>
            </ol>
            <span class="rkh__card-cta">Ver ranking</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============ CTA final full-bleed (direção André 2026-07-13:
         "faça desse card uma seção, ocupando a tela inteira e mais impactante"
         — padrão NuCtaPhoto, o mesmo da CTA final do /mercado) ============ -->
    <NuCtaPhoto
      :primary="{ label: 'Criar conta grátis', to: '/login' }"
      :secondary="{ label: 'Ver como funciona', to: '/como-funciona' }"
    >
      <template #title>Acompanhe os rankings<br>na sua carteira</template>
      <template #subtitle>Crie sua conta grátis e veja como os seus ativos aparecem em cada ranking, com dados atualizados diariamente.</template>
    </NuCtaPhoto>
  </div>
</template>

<style scoped>
/* ——— destaque score ——— */
.rkh__spot-wrap {
  background: var(--nu-cream);
  padding: 0 clamp(22px, 5.5vw, 80px) clamp(24px, 3vw, 40px);
  animation: nu-fade .5s ease both;
}
.rkh__spot {
  display: flex; gap: clamp(24px, 4vw, 64px); align-items: center; flex-wrap: wrap;
  background: var(--nu-navy); border-radius: var(--nu-r-card-lg);
  padding: clamp(28px, 4vw, 52px);
  transition: transform .18s, box-shadow .2s;
}
.rkh__spot:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-float); }
.rkh__spot-left { flex: 1 1 320px; min-width: min(280px, 100%); }
.rkh__spot-eyebrow {
  display: inline-flex; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 6px 14px;
  font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
}
.rkh__spot-title {
  margin: 16px 0 0; color: var(--nu-cream-text);
  font-size: clamp(32px, 4vw, 52px); font-weight: 800; letter-spacing: -.04em; line-height: 1.04;
}
.rkh__spot-sub {
  margin: 14px 0 0; color: var(--nu-cream-text-78); font-size: 16px; font-weight: 500;
  line-height: 1.6; max-width: 460px;
}
.rkh__spot-cta { display: inline-block; margin-top: 20px; color: var(--nu-blue-soft); font-size: 15px; font-weight: 800; }
.rkh__spot-list { flex: 1 1 340px; min-width: min(300px, 100%); margin: 0; padding: 0; list-style: none; }
.rkh__spot-row {
  display: flex; align-items: center; gap: 14px; padding: 13px 0;
  font-variant-numeric: tabular-nums;
}
.rkh__spot-row + .rkh__spot-row { border-top: 1px solid var(--nu-cream-text-12); }
.rkh__spot-pos { width: 22px; color: var(--nu-cream-text-55); font-size: 13.5px; font-weight: 800; }
.rkh__spot-ticker { color: var(--nu-cream-text); font-size: 16px; font-weight: 800; letter-spacing: -.1px; }
.rkh__spot-name {
  flex: 1; min-width: 0; color: var(--nu-cream-text-60); font-size: 13px; font-weight: 600;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.rkh__spot-score { color: var(--nu-green-soft); font-size: 16px; font-weight: 800; }

/* ——— grid por tema ——— */
.rkh__grid-wrap {
  background: var(--nu-white);
  /* bottom maior: a CTA full-bleed (NuCtaPhoto) cola logo abaixo */
  padding: clamp(48px, 6vw, 80px) clamp(22px, 5.5vw, 80px) clamp(64px, 8vw, 104px);
  animation: nu-fade .5s ease both;
}
.rkh__group + .rkh__group { margin-top: clamp(44px, 5.5vw, 72px); }
.rkh__group-title {
  margin: 0 0 clamp(18px, 2.5vw, 28px); color: var(--nu-ink);
  font-size: clamp(24px, 2.8vw, 34px); font-weight: 800; letter-spacing: -.03em;
}
.rkh__grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  gap: 16px;
}
.rkh__card {
  display: flex; flex-direction: column; gap: 10px;
  background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 24px;
  transition: transform .18s, box-shadow .2s;
}
.rkh__card:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.rkh__card-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.rkh__card-chip {
  background: var(--nu-white); color: var(--nu-gray-2); border-radius: var(--nu-r-chip);
  padding: 4px 10px; font-size: 11.5px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase;
}
.rkh__card-title { margin: 2px 0 0; color: var(--nu-ink); font-size: 19px; font-weight: 800; letter-spacing: -.2px; }
.rkh__card-desc {
  margin: 0; color: var(--nu-gray-2); font-size: 13.5px; font-weight: 500; line-height: 1.55;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.rkh__card-preview { margin: 6px 0 0; padding: 4px 0 0; list-style: none; border-top: 1px solid var(--nu-cream-line); }
.rkh__card-preview-row {
  display: flex; align-items: center; gap: 10px; padding: 7px 0;
  font-variant-numeric: tabular-nums;
}
.rkh__card-preview-pos { width: 16px; color: var(--nu-gray); font-size: 12px; font-weight: 800; }
.rkh__card-preview-ticker {
  flex: 1; min-width: 0; color: var(--nu-ink); font-size: 13.5px; font-weight: 800;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.rkh__card-preview-value { color: var(--nu-blue); font-size: 13.5px; font-weight: 800; }
.rkh__card-cta { margin-top: auto; padding-top: 6px; color: var(--nu-blue); font-size: 14px; font-weight: 800; }
/* (CTA final = NuCtaPhoto full-bleed, estilos no componente; o grid acima
   fecha com o próprio padding-bottom) */
</style>
