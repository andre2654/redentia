<script setup lang="ts">
// Demo cinematográfica do hero /mcp (direção do dono 2026-07-17): um "filme"
// em loop no lado direito do hero — o cursor entra, clica no Claude num
// mini-dock, a janela de chat abre, a pergunta sobre a carteira é digitada,
// enviada, o Claude CHAMA a Redentia (chip de tool com pulso + glow mint) e a
// resposta streama com dados reais. Mesma disciplina do NuMarketReading:
// SSR renderiza o frame inicial sem timers, a animação nasce no onMounted e
// morre no unmount; prefers-reduced-motion mostra a cena final estática.
//
// Conteúdo/estilo do chat = o mockup do NuMcpPromo (contrato visual do MCP):
// card creme, header Claude + badge, bolha do usuário, chip mono
// `redentia · get_portfolio`, resposta com números em destaque.

type Phase = 'dock' | 'to-icon' | 'click' | 'open' | 'typing' | 'to-send' | 'send' | 'tool' | 'answer' | 'hold'

const QUESTION = 'Como está a minha carteira hoje?'
// resposta em segmentos: streama em blocos, como um LLM de verdade
const ANSWER_PARTS = [
  'Você tem R$ 84.732, alta de +0,91% hoje. ',
  'O maior peso é PETR4 (18%), ',
  'que se aproxima do seu preço-teto de R$ 42.',
]

const phase = ref<Phase>('dock')
const typed = ref('')
const answerN = ref(0) // quantos segmentos da resposta já entraram

const windowOpen = computed(() => !['dock', 'to-icon', 'click'].includes(phase.value))
const sent = computed(() => ['send', 'tool', 'answer', 'hold'].includes(phase.value))
const toolVisible = computed(() => ['tool', 'answer', 'hold'].includes(phase.value))
const toolDone = computed(() => ['answer', 'hold'].includes(phase.value))
// cursor participa até o clique de enviar; depois sai de cena (foco no chat)
const cursorGone = computed(() => ['tool', 'answer', 'hold'].includes(phase.value))

let timers: ReturnType<typeof setTimeout>[] = []
let typer: ReturnType<typeof setInterval> | null = null
function later(ms: number, fn: () => void) {
  timers.push(setTimeout(fn, ms))
}
function clearAll() {
  timers.forEach(clearTimeout)
  timers = []
  if (typer) { clearInterval(typer); typer = null }
}

function play() {
  clearAll()
  phase.value = 'dock'
  typed.value = ''
  answerN.value = 0

  later(700, () => { phase.value = 'to-icon' })
  later(1800, () => { phase.value = 'click' })
  later(2200, () => { phase.value = 'open' })
  later(3000, () => {
    phase.value = 'typing'
    let i = 0
    typer = setInterval(() => {
      i++
      typed.value = QUESTION.slice(0, i)
      if (i >= QUESTION.length && typer) { clearInterval(typer); typer = null }
    }, 46)
  })
  const afterTyping = 3000 + QUESTION.length * 46 + 400
  later(afterTyping, () => { phase.value = 'to-send' })
  later(afterTyping + 900, () => { phase.value = 'send' })
  later(afterTyping + 1500, () => { phase.value = 'tool' })
  later(afterTyping + 3400, () => {
    phase.value = 'answer'
    answerN.value = 1
    later(500, () => { answerN.value = 2 })
    later(1000, () => { answerN.value = 3 })
  })
  later(afterTyping + 5100, () => { phase.value = 'hold' })
  later(afterTyping + 8600, play) // reinicia o filme
}

onMounted(() => {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    // cena final estática: conversa completa, sem cursor nem loop
    phase.value = 'hold'
    typed.value = ''
    answerN.value = ANSWER_PARTS.length
    return
  }
  play()
})
onBeforeUnmount(clearAll)
</script>

<template>
  <div class="mhd" aria-hidden="true">
    <!-- mini-dock: o "desktop" onde o Claude é acessado -->
    <div class="mhd__dock" :class="{ 'mhd__dock--away': windowOpen }">
      <span class="mhd__tile"><img src="/icons/logo-chatgpt.webp" alt="" width="30" height="30"></span>
      <span class="mhd__tile mhd__tile--claude" :class="{ 'mhd__tile--pressed': phase === 'click' }">
        <img src="/icons/logo-claude.webp" alt="" width="30" height="30">
        <span class="mhd__ring" :class="{ 'mhd__ring--on': phase === 'click' }" />
      </span>
      <span class="mhd__tile"><img src="/icons/logo-cursor.webp" alt="" width="30" height="30"></span>
    </div>

    <!-- janela de chat (abre com o clique) -->
    <div class="mhd__win" :class="{ 'mhd__win--open': windowOpen }">
      <div class="mhd__bar">
        <span class="mhd__dots"><i /><i /><i /></span>
        <span class="mhd__app-id">
          <img src="/icons/logo-claude.webp" alt="" width="18" height="18">
          Claude
        </span>
        <span class="mhd__model">Sonnet</span>
      </div>

      <div class="mhd__thread">
        <!-- bolha do usuário (entra no send) -->
        <div class="mhd__user" :class="{ 'mhd__user--in': sent }">{{ QUESTION }}</div>

        <!-- chamada da Redentia: o momento do filme -->
        <div v-if="toolVisible" class="mhd__toolrow">
          <span class="mhd__tool" :class="{ 'mhd__tool--live': !toolDone }">
            <svg class="mhd__diamond" width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2l10 10-10 10L2 12z" fill="currentColor" /></svg>
            redentia · get_portfolio
            <span v-if="!toolDone" class="mhd__tool-dots"><i /><i /><i /></span>
            <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-11" /></svg>
          </span>
        </div>

        <!-- resposta streamada -->
        <p v-if="answerN > 0" class="mhd__answer">
          <template v-if="answerN >= 1">Você tem <strong>R$ 84.732</strong>, alta de <em>+0,91%</em> hoje. </template>
          <template v-if="answerN >= 2">O maior peso é <strong>PETR4 (18%)</strong>, </template>
          <template v-if="answerN >= 3">que se aproxima do seu preço-teto de R$ 42.</template>
          <span v-if="answerN < 3" class="mhd__caret" />
        </p>
      </div>

      <!-- input com digitação -->
      <div class="mhd__input">
        <span class="mhd__input-text">
          {{ sent ? '' : typed }}<span v-if="phase === 'typing'" class="mhd__caret" />
          <span v-if="!typed && !sent" class="mhd__placeholder">Pergunte qualquer coisa…</span>
        </span>
        <span class="mhd__send" :class="{ 'mhd__send--pressed': phase === 'send' }">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
        </span>
      </div>
    </div>

    <!-- cursor do "filme" -->
    <svg
      class="mhd__cursor" :class="[`mhd__cursor--${phase}`, { 'mhd__cursor--gone': cursorGone }]"
      width="22" height="22" viewBox="0 0 24 24" fill="none"
    >
      <path d="M5 3l14 8-6.5 1.5L9 19z" fill="#0A0A0C" stroke="#fff" stroke-width="1.6" stroke-linejoin="round" />
    </svg>
  </div>
</template>

<style scoped>
.mhd { position: relative; width: min(480px, 100%); height: clamp(340px, 38vw, 392px); }

/* ——— dock ——— */
.mhd__dock {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
  display: flex; gap: 14px; transition: opacity .45s ease, transform .45s ease;
}
.mhd__dock--away { opacity: 0; transform: translate(-50%, -50%) scale(.9); pointer-events: none; }
.mhd__tile {
  position: relative; width: 58px; height: 58px; border-radius: 16px; background: var(--nu-white);
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--nu-shadow-card); transition: transform .18s ease;
}
.mhd__tile img { width: 30px; height: 30px; object-fit: contain; }
.mhd__tile--claude { transform: scale(1.06); }
.mhd__tile--pressed { transform: scale(.94); }
.mhd__ring {
  position: absolute; inset: -5px; border-radius: 20px; border: 2px solid var(--nu-blue);
  opacity: 0; transition: opacity .15s ease;
}
.mhd__ring--on { opacity: 1; }

/* ——— janela ——— */
.mhd__win {
  position: absolute; inset: 0;
  background: var(--nu-white); border-radius: var(--nu-r-card);
  box-shadow: var(--nu-shadow-card);
  display: flex; flex-direction: column; overflow: hidden;
  opacity: 0; transform: scale(.94) translateY(10px);
  transition: opacity .5s ease, transform .55s cubic-bezier(.34, 1.3, .5, 1);
  pointer-events: none;
}
.mhd__win--open { opacity: 1; transform: scale(1) translateY(0); }

.mhd__bar {
  display: flex; align-items: center; gap: 10px;
  padding: 13px 16px; border-bottom: 1.5px solid var(--nu-cream-2);
}
.mhd__dots { display: flex; gap: 5px; }
.mhd__dots i { width: 9px; height: 9px; border-radius: 50%; background: var(--nu-cream-2); }
.mhd__app-id { display: inline-flex; align-items: center; gap: 7px; color: var(--nu-ink); font-size: 13.5px; font-weight: 800; }
.mhd__app-id img { border-radius: 4px; }
.mhd__model { margin-left: auto; background: var(--nu-cream); color: var(--nu-gray); font-size: 11px; font-weight: 800; padding: 4px 9px; border-radius: 999px; }

.mhd__thread { flex: 1; padding: 18px 16px 8px; display: flex; flex-direction: column; gap: 12px; }
.mhd__user {
  align-self: flex-end; max-width: 85%;
  background: var(--nu-cream); color: var(--nu-ink);
  font-size: 13.5px; font-weight: 700; line-height: 1.45;
  padding: 10px 14px; border-radius: 14px 14px 4px 14px;
  opacity: 0; transform: translateY(6px);
  transition: opacity .3s ease, transform .35s cubic-bezier(.34, 1.4, .6, 1);
}
.mhd__user--in { opacity: 1; transform: translateY(0); }

/* chip da tool call: o pulso mint é o "chamando a Redentia" */
.mhd__toolrow { display: flex; }
.mhd__tool {
  display: inline-flex; align-items: center; gap: 7px;
  background: var(--nu-tile-blue-bg, rgba(47, 107, 255, .1)); color: var(--nu-blue);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px; font-weight: 700; padding: 7px 12px; border-radius: 10px;
  animation: mhd-pop .35s cubic-bezier(.34, 1.4, .6, 1) both;
}
.mhd__tool--live { box-shadow: 0 0 0 0 rgba(143, 240, 181, .65); animation: mhd-pop .35s cubic-bezier(.34, 1.4, .6, 1) both, mhd-pulse 1.1s ease-out .3s infinite; }
.mhd__diamond { color: var(--nu-blue); }
.mhd__tool-dots { display: inline-flex; gap: 3px; }
.mhd__tool-dots i { width: 4px; height: 4px; border-radius: 50%; background: currentColor; animation: mhd-blink 1s ease-in-out infinite; }
.mhd__tool-dots i:nth-child(2) { animation-delay: .18s; }
.mhd__tool-dots i:nth-child(3) { animation-delay: .36s; }

.mhd__answer { margin: 0; color: var(--nu-ink); font-size: 13.5px; font-weight: 600; line-height: 1.55; max-width: 95%; }
.mhd__answer strong { font-weight: 800; }
.mhd__answer em { color: var(--nu-green-2); font-style: normal; font-weight: 800; }

.mhd__input {
  display: flex; align-items: center; gap: 10px; margin: 10px 14px 14px;
  background: var(--nu-cream); border-radius: 999px; padding: 11px 8px 11px 16px; min-height: 42px;
}
.mhd__input-text { flex: 1; color: var(--nu-ink); font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; }
.mhd__placeholder { color: var(--nu-gray); font-weight: 500; }
.mhd__send {
  width: 30px; height: 30px; flex-shrink: 0; border-radius: 50%;
  background: var(--nu-blue); color: #fff; display: flex; align-items: center; justify-content: center;
  transition: transform .15s ease;
}
.mhd__send--pressed { transform: scale(.85); }

.mhd__caret { display: inline-block; width: 2px; height: 1em; background: var(--nu-blue); vertical-align: text-bottom; margin-left: 1px; animation: mhd-blink .8s step-end infinite; }

/* ——— cursor: coreografia por fase (posições em % do card) ——— */
.mhd__cursor {
  position: absolute; z-index: 3; left: 82%; top: 88%;
  transition: left .95s cubic-bezier(.45, 0, .2, 1), top .95s cubic-bezier(.45, 0, .2, 1), transform .16s ease, opacity .4s ease;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, .3));
}
.mhd__cursor--to-icon, .mhd__cursor--click { left: 51%; top: 52%; }
.mhd__cursor--click { transform: scale(.82); }
.mhd__cursor--open, .mhd__cursor--typing { left: 40%; top: 78%; }
.mhd__cursor--to-send, .mhd__cursor--send { left: 91%; top: 87%; }
.mhd__cursor--send { transform: scale(.82); }
.mhd__cursor--gone { opacity: 0; }

@keyframes mhd-pop { from { opacity: 0; transform: translateY(6px) scale(.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes mhd-pulse { from { box-shadow: 0 0 0 0 rgba(143, 240, 181, .65); } to { box-shadow: 0 0 0 14px rgba(143, 240, 181, 0); } }
@keyframes mhd-blink { 0%, 100% { opacity: 1; } 50% { opacity: .2; } }
</style>
