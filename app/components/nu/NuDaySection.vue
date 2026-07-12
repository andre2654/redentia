<script setup lang="ts">
// Seção-gatilho "O dia no mercado." (designs v2). UMA implementação, DOIS usos:
// /mercado (banda azul) e Home logada (banda navy) — só o bg da banda muda,
// via `tone`. Todo o resto (h2 + subtítulo + 4 cards de destaque + botão "Ler o
// resumo do dia") é idêntico. O botão abre o NuDayModal (também compartilhado).
//
// Componente de apresentação: recebe `metaLine` (subtítulo da banda e linha de
// data do modal) e os 4 `topics` já montados (utils/dayBrief distribui o corpo
// real do briefing nos 4 rótulos, com fallback de mock do design). Só gerencia
// o estado aberto/fechado do modal e devolve o foco ao gatilho ao fechar.
import type { NuDayTopic } from '~/types/market'

const props = defineProps<{
  tone: 'mercado' | 'home'
  metaLine: string
  topics: NuDayTopic[]
}>()

const open = ref(false)
const triggerRef = ref<HTMLButtonElement | null>(null)

// Projeção topics → blocos do modal (label + cor + parágrafo).
const blocks = computed(() => props.topics.map((t) => ({ label: t.label, color: t.labelColor, html: t.modalHtml })))

function openModal() { open.value = true }
function closeModal() {
  open.value = false
  nextTick(() => triggerRef.value?.focus())
}
</script>

<template>
  <section class="nds" :class="`nds--${tone}`">
    <div class="nds__head">
      <h2 class="nds__title">O dia no mercado.</h2>
      <div class="nds__sub">{{ metaLine }}</div>
    </div>

    <div class="nds__grid">
      <div v-for="(t, i) in topics" :key="i" class="nds__card">
        <span class="nds__icon">
          <svg v-if="t.icon === 'trend'" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M17 7h4v4" /></svg>
          <svg v-else-if="t.icon === 'bars'" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L3 8.5h18z" /><path d="M4 21h16" /><path d="M6 21v-9" /><path d="M10 21v-9" /><path d="M14 21v-9" /><path d="M18 21v-9" /></svg>
          <svg v-else-if="t.icon === 'flame'" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3.6 4.6 5.5 7.5 5.5 10.4A5.5 5.5 0 0 1 6.5 13.4C6.5 10.5 8.4 7.6 12 3z" /></svg>
          <svg v-else width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M15.4 8.6l-2 4.8-4.8 2 2-4.8z" /></svg>
        </span>
        <div class="nds__body" :class="{ 'nds__body--stat': t.stat }">
          <div v-if="t.stat" class="nds__stat">{{ t.stat }}</div>
          <div v-else-if="t.cardTitle" class="nds__card-title">{{ t.cardTitle }}</div>
          <p class="nds__blurb">{{ t.cardBlurb }}</p>
        </div>
      </div>
    </div>

    <div class="nds__cta">
      <button ref="triggerRef" type="button" class="nds__btn" aria-haspopup="dialog" :aria-expanded="open" @click="openModal">
        Ler o resumo do dia<span class="nds__btn-arrow">→</span>
      </button>
    </div>

    <NuDayModal
      :open="open"
      eyebrow="Resumo do dia · Atlas"
      title="O dia no mercado"
      :date-line="metaLine"
      :blocks="blocks"
      @close="closeModal"
    />
  </section>
</template>

<style scoped>
.nds { padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.nds--mercado { background: var(--nu-blue); }
.nds--home { background: var(--nu-navy); }

.nds__head { text-align: center; max-width: 760px; margin: 0 auto; }
.nds__title { margin: 0; color: var(--nu-cream-text); font-size: clamp(40px, 4.8vw, 56px); font-weight: 800; letter-spacing: -0.04em; line-height: 0.98; }
.nds__sub { margin-top: 16px; color: var(--nu-cream-text-72); font-size: 15px; font-weight: 700; letter-spacing: 0.2px; }

.nds__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 18px; margin-top: clamp(40px, 4.5vw, 52px); }
.nds__card { background: var(--nu-day-card-navy); border-radius: var(--nu-r-card-lg); padding: 34px 30px 32px; min-height: 300px; display: flex; flex-direction: column; }
.nds__icon { color: var(--nu-cream-text); height: 34px; }
.nds__icon svg { display: block; }
.nds__body { margin-top: 38px; }
.nds__stat { color: var(--nu-white); font-size: clamp(38px, 3.4vw, 44px); font-weight: 800; letter-spacing: -0.045em; line-height: 0.95; font-variant-numeric: tabular-nums; }
.nds__card-title { color: var(--nu-white); font-size: clamp(26px, 2.5vw, 30px); font-weight: 800; letter-spacing: -0.025em; line-height: 1.04; }
.nds__blurb { margin: 14px 0 0; color: var(--nu-white-75); font-size: 16.5px; font-weight: 600; line-height: 1.5; text-wrap: pretty; }
.nds__body--stat .nds__blurb { margin-top: 16px; }

.nds__cta { display: flex; justify-content: center; margin-top: clamp(36px, 4vw, 44px); }
.nds__btn {
  display: inline-flex; align-items: center; gap: 11px; background: var(--nu-cream); color: var(--nu-day-btn-ink);
  border: none; border-radius: var(--nu-r-pill); padding: 18px 32px; font-size: 17px; font-weight: 800;
  letter-spacing: -0.01em; cursor: pointer; transition: transform .15s ease, background .15s ease;
}
.nds__btn:hover { background: var(--nu-white); transform: translateY(-1px); }
.nds__btn-arrow { font-size: 19px; line-height: 1; }
</style>
