<script setup lang="ts">
// /rankings — hub dos 22 rankings (PLANO-RANKINGS.md). Hero Nu + card
// destaque Redentia Score (top 5 REAL, SSR) + grid agrupado por tema.
// Filtro por pills reativo a ?classe= (acoes|fiis|bdrs|renda-fixa) — o link
// do header chega filtrado. Preview top-3 dos cards hidrata LAZY no client
// (IntersectionObserver; nada de 22 fetches no SSR — backend cacheia 15 min).
// 2ª rodada da Aportou (11/11/2026): o filtro é o trilho das páginas de mercado,
// as linhas (destaque e prévias) ganham o logo do ativo, os cartões entram em
// cascata e o fecho é o painel azul com o corte (MercadoFecho).
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
const opcoesDoTrilho = pillItems.map((l) => ({ valor: l, rotulo: l }))

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
      // o mesmo pedido e a mesma seleção de linhas do /ranking/redentia-score
      const meta = RANKINGS['redentia-score']
      if (!meta) return []
      const resp = await fetchRanking('redentia-score', rankingFetchParams(meta, 'todos'))
      return rankingTable(resp.data ?? [], meta.columns, meta.primaryMetric, 5).rows
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
// Robustez (11/11/2026): enquanto a prévia não chega, o cartão mostra o
// esqueleto das três linhas (no servidor também), e ela entra no lugar dele
// sem a grade pular. Falhou, ou veio sem número: o esqueleto sai e o cartão
// fica só com a copy, como antes.
const semPrevia = reactive<Record<string, true>>({})
const esperandoPrevia = (slug: string) => !previews[slug] && !semPrevia[slug]

async function loadPreview(slug: string) {
  if (loadedSlugs.has(slug)) return
  loadedSlugs.add(slug)
  const meta = RANKINGS[slug]
  if (!meta) { semPrevia[slug] = true; return }
  try {
    if (meta.endpoint === 'tesouro') {
      const rows = await fetchTesouroRanking()
      previews[slug] = rows.slice(0, 3).map((r) => ({ ticker: r.name, value: r.rate }))
      return
    }
    // a prévia mostra o topo DA PÁGINA: mesmo universo declarado e a mesma
    // seleção de linhas (senão o card de maiores-lucros prévia BDR e a página,
    // Petrobras). Sem o número da métrica, a linha não vira prévia: "PETR4 —"
    // não diz nada, e o card fica só com a copy.
    const resp = await fetchRanking(meta.endpoint, rankingFetchParams(meta, 'todos'))
    const col = RANKING_COLUMNS[meta.primaryMetric]
    previews[slug] = rankingTable(resp.data ?? [], meta.columns, meta.primaryMetric, 50).rows
      .filter((row) => col.raw(row) != null)
      .slice(0, 3)
      .map((row) => ({ ticker: rankingTicker(row), value: col.format(row) }))
  } catch {
    // preview é enriquecimento — falhou, o card fica só com a copy estática
    semPrevia[slug] = true
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
    'Todos os rankings da bolsa brasileira em um lugar: dividend yield, valor de mercado, Graham, Bazin, ROE, crescimento, Aportou Score e Tesouro Direto. Atualizados diariamente.',
  path: '/rankings',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Rankings', path: '/rankings' },
  ],
  structuredData: [
    {
      '@type': 'ItemList',
      name: `Rankings da B3 - ${MARCA.nome}`,
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
      subtitle="A B3 inteira ranqueada do maior pro menor: dividendos, tamanho, valuation, crescimento e o Aportou Score. Atualizado diariamente após o pregão."
    >
      <template #title>Rankings da B3.</template>
      <NuTrilho :opcoes="opcoesDoTrilho" :model-value="activePill" rotulo="Filtrar rankings por classe" @update:model-value="setPill" />
    </NuPageHero>

    <!-- ============ Destaque: Redentia Score top 5 (SSR real) ============ -->
    <section v-if="scoreTop.length" class="rkh__spot-wrap">
      <NuxtLink v-contexto-chat="{ id: 'ranking:redentia-score', tipo: 'ranking', rotulo: 'Ranking · Aportou Score' }" to="/ranking/redentia-score" class="rkh__spot">
        <NuFaixaMarca rotulo="Exclusivo Aportou" como="span" :altura="52" class="rkh__spot-card">
          <div class="rkh__spot-in">
            <div class="rkh__spot-left">
              <h2 class="rkh__spot-title">Aportou Score.</h2>
              <p class="rkh__spot-sub">
                A nota de 0 a 100 que cruza 15 rankings fundamentalistas de uma vez.
                Quem aparece bem em vários, sobe. Quem só brilha em um, não.
              </p>
              <span class="rkh__spot-cta"><span class="rkh__cta-txt">Ver o ranking completo</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg></span>
            </div>
            <ol class="rkh__spot-list">
              <li v-for="(row, i) in scoreTop" :key="rankingTicker(row)" v-contexto-chat="{ id: `ranking:redentia-score:${rankingTicker(row)}`, tipo: 'ranking', rotulo: `${i + 1}º ${rankingTicker(row)} · Score`, texto: `${i + 1}º no Aportou Score: ${rankingTicker(row)} (${rankingName(row)}), nota ${scoreOf(row)}` }" class="rkh__spot-row">
                <span class="rkh__spot-pos">{{ i + 1 }}</span>
                <NuAssetLogo :ticker="rankingTicker(row)" :letter="rankingTicker(row).charAt(0) || '?'" tile-bg="var(--nu-dark-chip)" tile-fg="var(--nu-white)" :size="32" :radius="10" />
                <span class="rkh__spot-ticker">{{ rankingTicker(row) }}</span>
                <span class="rkh__spot-name">{{ rankingName(row) }}</span>
                <span class="rkh__spot-score">{{ scoreOf(row) }}</span>
              </li>
            </ol>
          </div>
        </NuFaixaMarca>
      </NuxtLink>
    </section>

    <!-- ============ Grid dos 22, agrupado por tema ============ -->
    <section class="rkh__grid-wrap">
      <div v-for="g in grupos" :key="g.tema" v-contexto-chat="{ id: `rankings:${g.tema}`, tipo: 'ranking', rotulo: rotuloCurto(`Rankings · ${g.tema}`) }" class="rkh__group">
        <div v-revelar class="rkh__group-head">
          <h2 class="rkh__group-title">{{ g.tema }}</h2>
          <NuSelo tom="contorno" class="rkh__group-n">{{ g.items.length }} {{ g.items.length === 1 ? 'ranking' : 'rankings' }}</NuSelo>
        </div>
        <!-- os cartões entram em cascata ao rolar (60ms de um para o outro) -->
        <div v-revelar="{ alvo: 'filhos', passo: 60 }" class="rkh__grid">
          <NuxtLink
            v-for="m in g.items" :key="m.slug" v-contexto-chat="{ id: `ranking:${m.slug}`, tipo: 'ranking', rotulo: rotuloCurto(`Ranking · ${m.title}`) }" :to="`/ranking/${m.slug}`"
            class="rkh__card" :data-slug="m.slug"
          >
            <div class="rkh__card-chips">
              <NuSelo v-for="t in cardTypes(m)" :key="t" tom="contorno" tamanho="p">{{ t }}</NuSelo>
            </div>
            <h3 class="rkh__card-title">{{ m.title }}</h3>
            <p class="rkh__card-desc">{{ m.metaDescription }}</p>
            <ol v-if="previews[m.slug]?.length" class="rkh__card-preview">
              <li v-for="(p, i) in previews[m.slug]" :key="p.ticker" class="rkh__card-preview-row">
                <span class="rkh__card-preview-pos">{{ i + 1 }}</span>
                <NuAssetLogo v-if="m.endpoint !== 'tesouro'" :ticker="p.ticker" :letter="p.ticker.charAt(0) || '?'" tile-bg="var(--nu-cream-2)" tile-fg="var(--nu-gray-3)" :size="26" :radius="8" />
                <span class="rkh__card-preview-ticker">{{ p.ticker }}</span>
                <span class="rkh__card-preview-value">{{ p.value }}</span>
              </li>
            </ol>
            <!-- a prévia chegando: as três linhas no tamanho delas -->
            <ol v-else-if="esperandoPrevia(m.slug)" class="rkh__card-preview rkh__card-preview--sk" aria-hidden="true">
              <li v-for="i in 3" :key="i" class="rkh__card-preview-row">
                <NuSkeleton variant="line" width="10px" height="12px" radius="pill" />
                <NuSkeleton v-if="m.endpoint !== 'tesouro'" variant="block" width="26px" height="26px" radius="8px" />
                <NuSkeleton class="rkh__sk-ticker" variant="line" :width="m.endpoint === 'tesouro' ? `${[150, 124, 168][i - 1]}px` : `${[52, 46, 58][i - 1]}px`" height="13px" radius="pill" />
                <NuSkeleton variant="line" :width="`${[48, 40, 44][i - 1]}px`" height="13px" radius="pill" />
              </li>
            </ol>
            <span class="rkh__card-cta"><span class="rkh__cta-txt">Ver ranking</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg></span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============ Fecho: o painel azul da marca, com o corte de fundo ============ -->
    <MercadoFecho
      eyebrow="Sua carteira"
      :primary="{ label: 'Criar conta grátis', to: '/login' }"
      :secondary="{ label: 'Ver como funciona', to: '/institucional/how-works' }"
    >
      <template #title>Acompanhe os rankings na sua carteira</template>
      <template #subtitle>Crie sua conta grátis e veja como os seus ativos aparecem em cada ranking, com dados atualizados diariamente.</template>
    </MercadoFecho>
  </div>
</template>

<style scoped>
/* Robustez (11/11/2026): a margem é a da coluna (--nu-coluna), o movimento e
   a cor por token, os selos (tipo do cartão, contagem do tema) são o NuSelo e
   os cartões entram ao rolar (v-revelar), sobem 2px no hover e afundam ao
   apertar, como o .nu-cartao--vivo. As setas falam como o NuLinkSeta. */

/* ——— destaque do score: o cartão carvão com a faixa da marca ——— */
.rkh__spot-wrap {
  background: var(--nu-page);
  padding: 0 var(--nu-coluna) clamp(32px, 3.4vw, 40px);
  /* chega 60ms depois do topo da página */
  animation: nu-fade var(--nu-dur-entrada) var(--nu-ease-saida) 60ms both;
}
.rkh__spot {
  display: block; border-radius: var(--nu-r-card); -webkit-tap-highlight-color: transparent;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida);
}
.rkh__spot:active { transform: scale(.995); transition-duration: var(--nu-dur-rapida); }
.rkh__spot:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.rkh__spot-in {
  display: flex; gap: clamp(24px, 4vw, 64px); align-items: center; flex-wrap: wrap;
  padding: clamp(24px, 3vw, 32px) clamp(24px, 4vw, 56px) clamp(32px, 3.6vw, 48px);
}
.rkh__spot-left { flex: 1 1 320px; min-width: min(280px, 100%); }
.rkh__spot-title {
  margin: 0; color: var(--nu-white);
  font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display); letter-spacing: -0.03em; line-height: 1.02;
}
.rkh__spot-sub {
  margin: 16px 0 0; color: var(--nu-on-dark); font-size: clamp(16px, 1.4vw, 18px); font-weight: var(--nu-w-texto);
  line-height: 1.5; max-width: 460px;
}
.rkh__spot-cta {
  display: inline-flex; align-items: center; gap: 6px; margin-top: 24px;
  color: var(--nu-white); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
}
.rkh__spot-cta svg { width: 16px; height: 16px; flex: none; color: var(--nu-blue-on-dark); transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.rkh__spot-list { flex: 1 1 340px; min-width: min(300px, 100%); margin: 0; padding: 0; list-style: none; }
.rkh__spot-row {
  display: flex; align-items: center; gap: 12px; min-height: 56px;
  font-variant-numeric: tabular-nums;
}
.rkh__spot-row + .rkh__spot-row { border-top: 1px solid var(--nu-dark-line); }
.rkh__spot-pos { width: 18px; color: var(--nu-on-dark-2); font-size: 13px; font-weight: var(--nu-w-texto); }
.rkh__spot-ticker { color: var(--nu-white); font-size: 15px; font-weight: var(--nu-w-forte); letter-spacing: 0.04em; }
.rkh__spot-name {
  flex: 1; min-width: 0; color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: var(--nu-w-texto);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
/* a nota não tem sinal: branca, como no cartão do nº 1 (o verde é de alta) */
.rkh__spot-score { color: var(--nu-white); font-size: 18px; font-weight: var(--nu-w-forte); }

/* o "Ver …" dentro de um cartão que já é o link: o desenho do NuLinkSeta
   (não dá para pôr um link dentro do outro) — o sublinhado e a seta andam no hover do cartão */
.rkh__cta-txt {
  text-decoration-line: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: transparent;
  transition: text-decoration-color var(--nu-dur-media) var(--nu-ease-cor);
}

/* ——— grid por tema (sobre o creme da página; os cartões são creme com a sombra quente) ——— */
.rkh__grid-wrap {
  background: var(--nu-page);
  padding: clamp(40px, 5vw, 64px) var(--nu-coluna) 16px;
}
.rkh__group + .rkh__group { margin-top: clamp(56px, 6vw, 72px); }
.rkh__group-head {
  display: flex; align-items: center; justify-content: space-between; gap: 8px 16px; flex-wrap: wrap;
  margin: 0 0 24px; padding-bottom: 16px; border-bottom: 1px solid var(--nu-line-2);
}
.rkh__group-title {
  margin: 0; color: var(--nu-ink);
  font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); letter-spacing: -0.025em; line-height: 1.05;
}
.rkh__grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  gap: 16px;
}
.rkh__card {
  display: flex; flex-direction: column; gap: 8px;
  background: var(--nu-card); border-radius: var(--nu-r-panel); padding: 24px; box-shadow: var(--nu-shadow-quente);
  -webkit-tap-highlight-color: transparent;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
.rkh__card:active { transform: scale(.995); transition-duration: var(--nu-dur-rapida); }
.rkh__card:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.rkh__card-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.rkh__card-title { margin: 8px 0 0; color: var(--nu-ink); font-size: clamp(19px, 1.6vw, 22px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.15; transition: color var(--nu-dur-rapida) var(--nu-ease-cor); }
.rkh__card-desc {
  margin: 0; color: var(--nu-gray-3); font-size: 14.5px; font-weight: var(--nu-w-texto); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.rkh__card-preview { margin: 8px 0 0; padding: 4px 0 0; list-style: none; border-top: 1px solid var(--nu-line-2); }
.rkh__card-preview-row {
  display: flex; align-items: center; gap: 10px; min-height: 40px;
  font-variant-numeric: tabular-nums;
}
.rkh__card-preview-pos { width: 16px; color: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-texto); }
.rkh__card-preview-ticker {
  flex: 1; min-width: 0; color: var(--nu-ink); font-size: 14.5px; font-weight: var(--nu-w-medio); letter-spacing: 0.02em;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.rkh__card-preview-value { color: var(--nu-ink); font-size: 14.5px; font-weight: var(--nu-w-medio); }
/* o esqueleto da prévia: as mesmas linhas, o ticker empurra o número para a direita */
/* o número da posição ocupa 16px: o traço dele tem 10, mais 6 de folga */
.rkh__card-preview--sk .rkh__card-preview-row > :first-child { flex: none; margin-right: 6px; }
.rkh__sk-ticker { margin-right: auto; }
.rkh__card-cta {
  display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 8px;
  color: var(--nu-blue-text); font-size: 14.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
}
.rkh__card-cta svg { width: 16px; height: 16px; flex: none; transition: transform var(--nu-dur-media) var(--nu-ease-saida); }

@media (hover: hover) {
  .rkh__spot:hover { transform: translateY(-2px); }
  .rkh__spot:hover .rkh__cta-txt { text-decoration-color: var(--nu-dark-chip-line); }
  .rkh__spot:hover .rkh__spot-cta svg { transform: translateX(3px); }
  .rkh__card:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
  .rkh__card:hover .rkh__card-title { color: var(--nu-blue-text); }
  .rkh__card:hover .rkh__cta-txt { text-decoration-color: currentColor; }
  .rkh__card:hover .rkh__card-cta svg { transform: translateX(3px); }
}
@media (prefers-reduced-motion: reduce) {
  .rkh__spot:hover, .rkh__spot:active, .rkh__card:hover, .rkh__card:active,
  .rkh__card:hover .rkh__card-cta svg, .rkh__spot:hover .rkh__spot-cta svg { transform: none; }
}
</style>
