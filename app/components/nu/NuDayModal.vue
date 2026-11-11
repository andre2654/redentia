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
// APORTOU (11/11/2026): o eyebrow da marca (o corte + caixa alta), fio de 1,5px,
// fechar num círculo de 44px e a entrada/saída do contrato: o fundo surge
// (nu-surgir .2s), o cartão sobe (nu-subir .32s) e, ao fechar, o inverso em .18s.
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
useModalA11y(cardRef, toRef(props, 'open')) // trap de Tab + restauração de foco
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
    <Transition name="ndm-sai">
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
            <NuEyebrow como="div">{{ eyebrow }}</NuEyebrow>
            <h4 :id="titleId" class="ndm__title">{{ title }}</h4>
            <div class="ndm__date">{{ dateLine }}</div>
          </div>
          <button type="button" class="ndm__close" aria-label="Fechar" @click="emit('close')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
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
    </Transition>
  </Teleport>
</template>

<style scoped>
.ndm {
  position: fixed; inset: 0; z-index: 9999;
  background: var(--nu-day-backdrop);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 32px;
  animation: nu-surgir .2s ease both;
}
.ndm__card {
  width: min(680px, 92vw); max-height: 86vh; overflow: auto;
  background: var(--nu-day-card); border-radius: var(--nu-r-card-lg);
  padding: 44px 46px 42px; box-shadow: var(--nu-shadow-day-modal);
  animation: nu-subir .32s var(--nu-ease-saida) both;
}
/* fechar: o inverso, em .18s */
/* (a animação de entrada segura opacity e transform com fill both: sai antes) */
.ndm-sai-leave-active { animation: none; transition: opacity .18s ease; }
.ndm-sai-leave-active .ndm__card { animation: none; transition: transform .18s ease; }
.ndm-sai-leave-to { opacity: 0; }
.ndm-sai-leave-to .ndm__card { transform: translateY(12px) scale(.985); }
.ndm__card:focus { outline: none; }
.ndm__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.ndm__title { margin: 14px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); letter-spacing: -0.025em; line-height: 1.05; }
.ndm__date { margin-top: 8px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; }
.ndm__close {
  flex: 0 0 auto; width: 44px; height: 44px; border-radius: 50%; border: none;
  background: var(--nu-day-close); color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte);
  cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .2s;
}
.ndm__close:hover { background: var(--nu-day-close-hover); }
.ndm__divider { height: 1.5px; background: var(--nu-line); margin: 26px 0; }
.ndm__blocks { display: flex; flex-direction: column; gap: 22px; }
.ndm__label { font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); letter-spacing: 0.16em; text-transform: uppercase; }
.ndm__p {
  margin: 8px 0 0; color: var(--nu-day-body); font-size: var(--nu-fs-lg); font-weight: 500;
  line-height: 1.62; text-wrap: pretty;
}
.ndm__foot { display: flex; justify-content: flex-end; margin-top: 30px; }
.ndm__done {
  background: var(--nu-ink); color: var(--nu-white); border: none; border-radius: var(--nu-r-pill);
  min-height: 48px; padding: 0 26px; font-family: inherit; font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); cursor: pointer;
  transition: background .2s, transform .15s var(--nu-ease-saida);
}
.ndm__done:hover { background: var(--nu-ink-hover); }
.ndm__done:active { transform: scale(.98); }

@media (max-width: 760px) {
  .ndm { padding: 18px; }
  .ndm__card { padding: 30px 24px 28px; }
}
</style>
