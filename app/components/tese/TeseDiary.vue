<script setup lang="ts">
// "Diário da tese" (v2, dono 2026-08-12): a seção vira TEASER — card compacto
// do estudo mais recente (badges, headline e resumo cortado em 3 linhas) e
// linhas dos estudos anteriores. Clicar em qualquer um abre o MESMO NuDayModal
// da Home/"O dia no mercado" com o estudo inteiro em blocos rotulados: "O
// estudo" (resumo completo), as decisões (Convicção/Composição/Vigilância, na
// cor da categoria) e as fontes consultadas. Nada de trocar o card no lugar —
// o modal é a leitura, a página é o gancho.
//
// PAYWALL (dono 2026-07-14): pro ANÔNIMO o diário entra embaçado e sem clique
// (pointer-events none) — o título fica nítido pra dar o gancho, o miolo fica
// atrás do cadastro. Logado vê tudo e abre o modal.
import type { NuDayBlock } from '~/types/market'
import type { TeseDecisionVariant, TeseDiaryVM, TeseStudyVM } from '~/types/tese'

const props = defineProps<{ diary: TeseDiaryVM }>()

const { isAuthenticated } = useAuthState()

const ROWS_VISIBLE = 3

const selectedId = ref<TeseStudyVM['id']>(props.diary.studies[0]!.id)
const expanded = ref(false)
const open = ref(false)

const latest = computed<TeseStudyVM>(() => props.diary.studies[0]!)
const selected = computed<TeseStudyVM>(
  () => props.diary.studies.find((s) => s.id === selectedId.value) ?? latest.value,
)
const rows = computed(() => props.diary.studies.slice(1))
const visibleRows = computed(() => (expanded.value ? rows.value : rows.value.slice(0, ROWS_VISIBLE)))
const showMore = computed(() => !expanded.value && !!props.diary.moreLabel && rows.value.length > 0)

function openStudy(id: TeseStudyVM['id']) {
  selectedId.value = id
  open.value = true
}

// ————— conteúdo do modal (contrato NuDayBlock do NuDayModal) —————

const DECISION_COLOR: Record<TeseDecisionVariant, string> = {
  green: 'var(--nu-green-text)',
  blue: 'var(--nu-blue-text)',
  red: 'var(--nu-red-text)',
  neutral: 'var(--nu-gray)',
}

const modalTitle = computed(() =>
  selected.value.isToday ? 'O estudo do dia' : `Estudo de ${selected.value.rowDate}`,
)

const modalDateLine = computed(() => {
  const c = selected.value.conv
  const conv = !c
    ? 'Revalidação automática da IA'
    : c.changed
      ? `Convicção ${c.from} → ${c.to}`
      : `Convicção mantida em ${c.to}`
  return `${selected.value.dateBadge} · ${conv}`
})

const modalBlocks = computed<NuDayBlock[]>(() => {
  const s = selected.value
  const blocks: NuDayBlock[] = []
  if (s.summary) blocks.push({ label: 'O estudo', color: 'var(--nu-blue-text)', html: briefingHtml(s.summary) })
  for (const d of s.decisions) {
    blocks.push({ label: d.tag, color: DECISION_COLOR[d.variant] ?? 'var(--nu-gray)', html: briefingHtml(d.txt) })
  }
  if (s.sources.length) {
    const html = s.sources
      .map((f) => {
        const title = f.url
          ? `<a href="${escapeHtml(f.url)}" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;text-underline-offset:3px">${escapeHtml(f.title)}</a>`
          : escapeHtml(f.title)
        return f.meta ? `${title} · ${escapeHtml(f.meta)}` : title
      })
      .join('<br>')
    blocks.push({ label: 'Fontes consultadas', color: 'var(--nu-gray)', html })
  }
  return blocks
})
</script>

<template>
  <section class="tdi">
    <div class="tdi__head">
      <NuSectionHeading>Diário da tese.</NuSectionHeading>
      <span class="tdi__meta">{{ diary.metaLine }}</span>
    </div>

    <article
      class="tdi__card"
      :class="{ 'tdi__locked': !isAuthenticated }"
      :aria-hidden="!isAuthenticated || undefined"
      @click="openStudy(latest.id)"
    >
      <div class="tdi__badges">
        <NuBadge variant="black" size="card">{{ latest.dateBadge }}</NuBadge>
        <NuBadge v-if="latest.conv && latest.conv.changed" variant="green" size="card">
          Convicção {{ latest.conv.from }}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
          {{ latest.conv.to }}
        </NuBadge>
        <NuBadge v-else-if="latest.conv" variant="neutral" size="card">Convicção {{ latest.conv.to }}</NuBadge>
      </div>
      <h3 class="tdi__title">{{ latest.title }}</h3>
      <p v-if="latest.summary" class="tdi__summary">{{ latest.summary }}</p>

      <div class="tdi__foot">
        <NuBotaoSeta variante="carvao" tamanho="m" @click.stop="openStudy(latest.id)">Ler o estudo completo</NuBotaoSeta>
        <div class="tdi__sig">
          <MarcaCorte :largura="22" />
          <span class="tdi__sig-txt">Estudo gerado pela IA na revalidação diária da tese.</span>
        </div>
      </div>
    </article>

    <div v-if="rows.length" class="tdi__rows" :class="{ 'tdi__locked': !isAuthenticated }" :aria-hidden="!isAuthenticated || undefined">
      <button v-for="s in visibleRows" :key="s.id" type="button" class="tdi__row" @click="openStudy(s.id)">
        <span class="tdi__row-date">{{ s.rowDate }}</span>
        <span class="tdi__row-title">{{ s.title }}</span>
        <NuBadge v-if="s.conv" :variant="s.conv.changed ? 'green' : 'neutral'" size="row">
          {{ s.conv.changed ? `${s.conv.from} → ${s.conv.to}` : s.conv.to }}
        </NuBadge>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="tdi__row-chevron"><path d="M9 6l6 6-6 6" /></svg>
      </button>
      <div v-if="showMore" class="tdi__more">
        <button type="button" class="tdi__more-btn" @click="expanded = true">{{ diary.moreLabel }}</button>
      </div>
    </div>

    <NuDayModal
      :open="open"
      eyebrow="Diário da tese · Aportou"
      :title="modalTitle"
      :date-line="modalDateLine"
      :blocks="modalBlocks"
      @close="open = false"
    />
  </section>
</template>

<style scoped>
.tdi {
  background: var(--nu-page);
  padding: clamp(64px, 7vw, 100px) max(clamp(20px, 5.5vw, 80px), calc((100% - 1240px) / 2));
  animation: nu-fade .5s ease both;
}
.tdi__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.tdi__meta { color: var(--nu-gray); font-size: 14.5px; font-weight: 600; }

.tdi__card {
  background: var(--nu-card); border-radius: var(--nu-r-card); padding: clamp(24px, 3vw, 40px); margin-top: 40px; box-shadow: var(--nu-shadow-quente);
  cursor: pointer; transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s cubic-bezier(.2, .8, .2, 1);
}
.tdi__card:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
/* embaçado (anônimo): diário tease não-interativo, atrás do cadastro */
.tdi__locked { filter: blur(7px); opacity: .55; pointer-events: none; user-select: none; }
.tdi__badges { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.tdi__title {
  margin: 20px 0 0; color: var(--nu-ink);
  font-size: var(--nu-fs-h3); font-weight: 800;
  letter-spacing: -0.025em; line-height: 1.05; max-width: 920px;
}
.tdi__summary {
  margin: 16px 0 0; color: var(--nu-gray-3); font-size: clamp(16px, 1.4vw, 18px); font-weight: 500;
  line-height: 1.5; max-width: 920px;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}

.tdi__foot { display: flex; align-items: center; justify-content: space-between; gap: 18px; flex-wrap: wrap; margin-top: 26px; }
.tdi__sig { display: flex; align-items: center; gap: 10px; }
.tdi__sig-txt { color: var(--nu-gray); font-size: 13.5px; font-weight: 600; }

.tdi__rows { margin-top: 16px; }
.tdi__row {
  width: 100%; text-align: left; border: none; font-family: inherit;
  display: flex; align-items: center; gap: 16px;
  background: var(--nu-white); border-radius: var(--nu-r-tile); min-height: 64px; padding: 16px 24px; margin-bottom: 10px; box-shadow: var(--nu-shadow-quente);
  cursor: pointer; transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s cubic-bezier(.2, .8, .2, 1);
}
.tdi__row:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.tdi__row:hover .tdi__row-title { color: var(--nu-blue-text); }
.tdi__row:hover .tdi__row-chevron { stroke: var(--nu-blue); transform: translateX(3px); }
.tdi__row-date {
  color: var(--nu-gray); font-size: 13.5px; font-weight: 700; width: 56px; flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.tdi__row-title {
  flex: 1; min-width: 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700;
  line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color .2s ease;
}
.tdi__row-chevron { flex-shrink: 0; stroke: var(--nu-sand); transition: transform .2s ease, stroke .2s ease; }
.tdi__more { text-align: center; margin-top: 20px; }
.tdi__more-btn {
  display: inline-flex; align-items: center; border: none; font-family: inherit;
  background: var(--nu-cream-2); color: var(--nu-ink); font-size: 14.5px; font-weight: 700;
  min-height: 44px; padding: 0 22px; border-radius: var(--nu-r-pill); cursor: pointer; transition: background .2s, transform .15s cubic-bezier(.2, .8, .2, 1);
}
.tdi__more-btn:hover { background: var(--nu-line-2); }
.tdi__more-btn:active { transform: scale(.98); }
@media (prefers-reduced-motion: reduce) {
  .tdi__card, .tdi__row, .tdi__row-chevron, .tdi__more-btn { transition: none; }
  .tdi__card:hover, .tdi__row:hover, .tdi__row:hover .tdi__row-chevron, .tdi__more-btn:active { transform: none; }
}

@media (max-width: 700px) {
  .tdi__foot { flex-direction: column; align-items: flex-start; }
}
</style>
