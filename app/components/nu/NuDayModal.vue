<script setup lang="ts">
// Modal "O dia no mercado" (designs v2, IGUAL no /mercado e na Home). Componente
// BURRO: recebe eyebrow/title/dateLine + os 4 blocos rotulados prontos; quem
// monta os dados é o pai (NuDaySection via utils/dayBrief). Só cuida do chrome:
// Teleport pro body, animação de entrada (qmfade no backdrop, qmrise no card),
// Escape/click-no-backdrop/botões fecham, scroll-lock e foco inicial no card.
//
// SSR-safe: mesmo padrão do menu do NuHeader (Teleport to body + v-if num estado
// que só liga no cliente após clique) — nada teleporta no SSR. Sem animação de
// saída (o design usa só keyframes de entrada; v-if desmonta direto).
import type { NuDayBlock } from '~/types/market'

const props = defineProps<{
  open: boolean
  eyebrow: string
  title: string
  dateLine: string
  blocks: NuDayBlock[]
}>()

const emit = defineEmits<{ close: [] }>()

const cardRef = ref<HTMLElement | null>(null)
const titleId = useId()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

// Trava o scroll do <html> e liga o Escape enquanto aberto (mesmo padrão de
// scroll-lock do NuHeader); foca o card na abertura pra o teclado entrar no dialog.
watch(() => props.open, (open) => {
  if (import.meta.server) return
  document.documentElement.style.overflow = open ? 'hidden' : ''
  if (open) {
    document.addEventListener('keydown', onKey)
    nextTick(() => cardRef.value?.focus())
  } else {
    document.removeEventListener('keydown', onKey)
  }
})

onBeforeUnmount(() => {
  if (import.meta.server) return
  document.removeEventListener('keydown', onKey)
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="ndm" @click="emit('close')">
      <div
        ref="cardRef"
        class="ndm__card"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        @click.stop
      >
        <div class="ndm__head">
          <div>
            <div class="ndm__eyebrow">{{ eyebrow }}</div>
            <h4 :id="titleId" class="ndm__title">{{ title }}</h4>
            <div class="ndm__date">{{ dateLine }}</div>
          </div>
          <button type="button" class="ndm__close" aria-label="Fechar" @click="emit('close')">✕</button>
        </div>

        <div class="ndm__divider" />

        <div class="ndm__blocks">
          <div v-for="(b, i) in blocks" :key="i" class="ndm__block">
            <div class="ndm__label" :style="{ color: b.color }">{{ b.label }}</div>
            <!-- eslint-disable-next-line vue/no-v-html — real escapado (briefingHtml) ou constante de design confiável -->
            <p class="ndm__p" v-html="b.html" />
          </div>
        </div>

        <div class="ndm__foot">
          <button type="button" class="ndm__done" @click="emit('close')">Fechar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ndm {
  position: fixed; inset: 0; z-index: 9999;
  background: var(--nu-day-backdrop);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 32px;
  animation: qmfade .18s ease;
}
.ndm__card {
  width: min(680px, 92vw); max-height: 86vh; overflow: auto;
  background: var(--nu-day-card); border-radius: var(--nu-r-card-lg);
  padding: 44px 46px 42px; box-shadow: var(--nu-shadow-day-modal);
  animation: qmrise .24s cubic-bezier(.2, .8, .2, 1);
}
.ndm__card:focus { outline: none; }
.ndm__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.ndm__eyebrow { color: var(--nu-blue); font-size: 12px; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase; }
.ndm__title { margin: 9px 0 0; color: var(--nu-ink); font-size: 30px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; }
.ndm__date { margin-top: 7px; color: var(--nu-gray); font-size: 14px; font-weight: 700; }
.ndm__close {
  flex: 0 0 auto; width: 40px; height: 40px; border-radius: 50%; border: none;
  background: var(--nu-day-close); color: var(--nu-ink); font-size: 16px; font-weight: 800;
  cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .2s;
}
.ndm__close:hover { background: var(--nu-day-close-hover); }
.ndm__divider { height: 1px; background: var(--nu-day-divider); margin: 26px 0; }
.ndm__blocks { display: flex; flex-direction: column; gap: 22px; }
.ndm__label { font-size: 11.5px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; }
.ndm__p {
  margin: 8px 0 0; color: var(--nu-day-body); font-size: 17px; font-weight: 500;
  line-height: 1.62; text-wrap: pretty;
}
.ndm__foot { display: flex; justify-content: flex-end; margin-top: 30px; }
.ndm__done {
  background: var(--nu-ink); color: var(--nu-white); border: none; border-radius: var(--nu-r-pill);
  padding: 13px 24px; font-size: 15px; font-weight: 800; cursor: pointer; transition: background .2s;
}
.ndm__done:hover { background: var(--nu-ink-hover); }

@keyframes qmfade { from { opacity: 0; } to { opacity: 1; } }
@keyframes qmrise { from { opacity: 0; transform: translateY(14px) scale(.98); } to { opacity: 1; transform: none; } }

@media (max-width: 760px) {
  .ndm { padding: 18px; }
  .ndm__card { padding: 30px 24px 28px; }
  .ndm__title { font-size: 26px; }
}
</style>
