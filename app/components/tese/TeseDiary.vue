<script setup lang="ts">
// "Diário da tese" (design): card branco grande do estudo selecionado
// (badges de data + convicção com seta, headline, resumo, grid de decision
// cards com tag colorida por categoria, fontes em 2 colunas e assinatura do
// Atlas) + linhas clicáveis de estudos anteriores (trocam o card) e botão
// 'Ver os N estudos anteriores' que expande a lista (paginação client-side,
// V1 — os estudos já vêm inteiros no detail).
//
// PAYWALL (dono 2026-07-14): pro ANÔNIMO o diário (card do estudo + linhas dos
// estudos anteriores) entra embaçado — o título 'Diário da tese' fica nítido
// pra dar o gancho, o miolo fica atrás do cadastro (o gate da avaliação por
// ativo é a chamada). Logado vê tudo. Texto continua no HTML (blur só visual).
import type { TeseDiaryVM, TeseStudyVM } from '~/types/tese'

const props = defineProps<{ diary: TeseDiaryVM }>()

const { isAuthenticated } = useAuthState()

const ROWS_VISIBLE = 3

const selectedId = ref<TeseStudyVM['id']>(props.diary.studies[0]!.id)
const expanded = ref(false)

const selected = computed<TeseStudyVM>(
  () => props.diary.studies.find((s) => s.id === selectedId.value) ?? props.diary.studies[0]!,
)
const rows = computed(() => props.diary.studies.slice(1))
const visibleRows = computed(() => (expanded.value ? rows.value : rows.value.slice(0, ROWS_VISIBLE)))
const showMore = computed(() => !expanded.value && !!props.diary.moreLabel && rows.value.length > 0)
</script>

<template>
  <section class="tdi">
    <div class="tdi__head">
      <NuSectionHeading>Diário da tese.</NuSectionHeading>
      <span class="tdi__meta">{{ diary.metaLine }}</span>
    </div>

    <article class="tdi__card" :class="{ 'tdi__locked': !isAuthenticated }" :aria-hidden="!isAuthenticated || undefined">
      <div class="tdi__badges">
        <NuBadge variant="black" size="card">{{ selected.dateBadge }}</NuBadge>
        <NuBadge v-if="selected.conv && selected.conv.changed" variant="green" size="card">
          Convicção {{ selected.conv.from }}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
          {{ selected.conv.to }}
        </NuBadge>
        <NuBadge v-else-if="selected.conv" variant="neutral" size="card">Convicção {{ selected.conv.to }}</NuBadge>
      </div>
      <h3 class="tdi__title">{{ selected.title }}</h3>
      <p v-if="selected.summary" class="tdi__summary">{{ selected.summary }}</p>

      <div v-if="selected.decisions.length" class="tdi__decisions">
        <div v-for="dec in selected.decisions" :key="dec.tag" class="tdi__decision">
          <NuBadge :variant="dec.variant" size="label">{{ dec.tag }}</NuBadge>
          <div class="tdi__decision-txt">{{ dec.txt }}</div>
        </div>
      </div>

      <div v-if="selected.sources.length" class="tdi__sources">
        <div class="tdi__sources-lbl">Fontes consultadas</div>
        <div class="tdi__sources-grid">
          <!-- fonte sem url (seed) vira <span> — mesmo visual, sem cursor
               pointer, sem hover azul e sem o ícone de link externo -->
          <component
            :is="f.url ? 'a' : 'span'"
            v-for="f in selected.sources" :key="f.title"
            v-bind="f.url ? { href: f.url, target: '_blank', rel: 'noopener noreferrer' } : {}"
            class="tdi__source" :class="{ 'tdi__source--plain': !f.url }"
          >
            <span class="tdi__source-body">
              <span class="tdi__source-title">{{ f.title }}</span>
              <span class="tdi__source-meta">{{ f.meta }}</span>
            </span>
            <svg v-if="f.url" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="tdi__source-icon"><path d="M7 17L17 7M8 7h9v9" /></svg>
          </component>
        </div>
      </div>

      <div class="tdi__sig">
        <span class="tdi__sig-tile"><img src="/logo-branca.svg" alt="Redentia" class="tdi__sig-logo"></span>
        <span class="tdi__sig-txt">Estudo gerado pela IA na revalidação diária da tese.</span>
      </div>
    </article>

    <div v-if="rows.length" class="tdi__rows" :class="{ 'tdi__locked': !isAuthenticated }" :aria-hidden="!isAuthenticated || undefined">
      <button v-for="s in visibleRows" :key="s.id" type="button" class="tdi__row" @click="selectedId = s.id">
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
  </section>
</template>

<style scoped>
.tdi {
  background: var(--nu-cream);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.tdi__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.tdi__meta { color: var(--nu-gray); font-size: 16px; font-weight: 600; }

.tdi__card { background: var(--nu-white); border-radius: 28px; padding: clamp(26px, 4vw, 44px); margin-top: 40px; }
/* embaçado (anônimo): diário tease não-interativo, atrás do cadastro */
.tdi__locked { filter: blur(7px); opacity: .55; pointer-events: none; user-select: none; }
.tdi__badges { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.tdi__title {
  margin: 20px 0 0; color: var(--nu-ink);
  font-size: clamp(24px, 2.6vw, 36px); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.15; max-width: 920px;
}
.tdi__summary {
  margin: 16px 0 0; color: var(--nu-gray-2); font-size: 16.5px; font-weight: 500;
  line-height: 1.7; max-width: 920px;
}
.tdi__decisions {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 14px; margin-top: 28px;
}
.tdi__decision { background: var(--nu-cream); border-radius: 20px; padding: 22px; }
.tdi__decision-txt { color: var(--nu-gray-3); font-size: 14.5px; font-weight: 500; line-height: 1.6; margin-top: 14px; }

.tdi__sources { margin-top: 30px; }
.tdi__sources-lbl { color: var(--nu-gray); font-size: 12.5px; font-weight: 800; letter-spacing: 1.3px; text-transform: uppercase; }
.tdi__sources-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(420px, 100%), 1fr));
  gap: 0 clamp(24px, 3vw, 48px); margin-top: 8px;
}
.tdi__source {
  display: flex; align-items: center; gap: 14px; padding: 13px 0;
  border-bottom: 1.5px solid var(--nu-cream-2);
}
.tdi__source-body { flex: 1; min-width: 0; }
.tdi__source-title { display: block; color: var(--nu-ink); font-size: 14.5px; font-weight: 700; line-height: 1.4; transition: color .2s; }
.tdi__source:hover .tdi__source-title { color: var(--nu-blue); }
.tdi__source--plain { cursor: default; }
.tdi__source--plain:hover .tdi__source-title { color: var(--nu-ink); }
.tdi__source-meta { display: block; color: var(--nu-gray); font-size: 12.5px; font-weight: 600; margin-top: 3px; }
.tdi__source-icon { flex-shrink: 0; stroke: var(--nu-sand); }

.tdi__sig { display: flex; align-items: center; gap: 9px; margin-top: 24px; }
.tdi__sig-tile {
  width: 26px; height: 26px; border-radius: 8px; background: var(--nu-blue);
  display: inline-flex; align-items: center; justify-content: center;
}
.tdi__sig-logo { width: 15px; height: 15px; display: block; object-fit: contain; }
.tdi__sig-txt { color: var(--nu-gray); font-size: 13.5px; font-weight: 600; }

.tdi__rows { margin-top: 16px; }
.tdi__row {
  width: 100%; text-align: left; border: none; font-family: inherit;
  display: flex; align-items: center; gap: 16px;
  background: var(--nu-white); border-radius: 20px; padding: 20px 26px; margin-bottom: 10px;
  cursor: pointer; transition: transform .15s;
}
.tdi__row:hover { transform: translateY(-2px); }
.tdi__row-date {
  color: var(--nu-gray); font-size: 13px; font-weight: 800; width: 52px; flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.tdi__row-title {
  flex: 1; min-width: 0; color: var(--nu-ink); font-size: 15.5px; font-weight: 700;
  line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tdi__row-chevron { flex-shrink: 0; stroke: var(--nu-sand); }
.tdi__more { text-align: center; margin-top: 20px; }
.tdi__more-btn {
  display: inline-flex; align-items: center; border: none; font-family: inherit;
  background: var(--nu-sand-2); color: var(--nu-gray-2); font-size: 14px; font-weight: 800;
  padding: 11px 22px; border-radius: var(--nu-r-pill); cursor: pointer; transition: background .2s;
}
.tdi__more-btn:hover { background: var(--nu-sand-hover); }
</style>
