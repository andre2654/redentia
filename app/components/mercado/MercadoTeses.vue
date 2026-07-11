<script setup lang="ts">
// Seção "Teses Redentia": painel de texto sincronizado à esquerda + carrossel
// VERTICAL de cards à direita + coluna de controles (setas, dots, play/pause
// com anel de progresso). Porte 1:1 da lógica do design: timer de 50ms,
// RING=131.95, 5s por slide, geometria CARD=540/GAP=20/PAD=30.
// O fade alternado qfadeA/qfadeB do design existia só pra REINICIAR a animação
// a cada troca — aqui o :key no painel remonta o nó e reinicia o mesmo fade.
const { theses } = useNuTheses()

const idx = ref(0)
const paused = ref(false)
const ringRef = ref<SVGCircleElement | null>(null)

const RING = 131.95
const CARD = 540
const GAP = 20
const PAD = 30

let progress = 0
let timer: ReturnType<typeof setInterval> | null = null

const count = computed(() => theses.value.length)
const current = computed(() => theses.value[idx.value] ?? theses.value[0]!)
const colStyle = computed(() => ({
  transform: `translateY(${PAD - idx.value * (CARD + GAP)}px)`,
  transition: 'transform .7s cubic-bezier(.22,.9,.3,1)',
}))

function setRing() {
  ringRef.value?.setAttribute('stroke-dashoffset', String(RING * (1 - progress)))
}
function go(i: number) {
  progress = 0
  setRing()
  idx.value = ((i % count.value) + count.value) % count.value
}
function prev() { go(idx.value - 1) }
function next() { go(idx.value + 1) }
function togglePause() { paused.value = !paused.value }

onMounted(() => {
  timer = setInterval(() => {
    if (paused.value) return
    progress += 50 / 5000
    if (progress >= 1) {
      progress = 0
      idx.value = (idx.value + 1) % count.value
    }
    setRing()
  }, 50)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <section class="mtz">
    <NuSectionHeading eyebrow="Teses Redentia">
      Invista em ideias,<br>não em palpites.
      <template #dek>
        Carteiras temáticas com pesquisa profunda — estudadas e revalidadas <strong>todos os dias</strong> por IA, com convicção que sobe e desce conforme os fatos.
      </template>
    </NuSectionHeading>

    <div class="mtz__cols">
      <div class="mtz__left">
        <div :key="idx" class="mtz__panel">
          <h3 class="mtz__panel-title">{{ current.leftTitle }}</h3>
          <div class="mtz__panel-desc">{{ current.leftDesc }}</div>
          <NuxtLink :to="current.ctaHref" class="mtz__panel-cta">
            {{ current.cta }}<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
          </NuxtLink>
        </div>
      </div>

      <div class="mtz__right">
        <div class="mtz__viewport">
          <div class="mtz__col" :style="colStyle">
            <div v-for="t in theses" :key="t.slug" class="mtz__card-slot">
              <NuThesisCard :t="t" />
            </div>
          </div>
        </div>

        <div class="mtz__controls">
          <button type="button" class="mtz__arrow" aria-label="Tese anterior" @click="prev">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6" /></svg>
          </button>
          <div class="mtz__dots">
            <button
              v-for="(t, i) in theses" :key="t.slug" type="button"
              class="mtz__dot" :class="{ 'mtz__dot--active': i === idx }"
              :aria-label="`Ir para a tese ${i + 1}`" @click="go(i)"
            />
          </div>
          <button type="button" class="mtz__play" :aria-label="paused ? 'Retomar' : 'Pausar'" @click="togglePause">
            <svg width="48" height="48" viewBox="0 0 48 48" class="mtz__ring">
              <circle cx="24" cy="24" r="21" fill="none" stroke="var(--nu-cream-3)" stroke-width="3" />
              <circle ref="ringRef" cx="24" cy="24" r="21" fill="none" stroke="var(--nu-blue)" stroke-width="3" stroke-linecap="round" stroke-dasharray="131.95" stroke-dashoffset="131.95" transform="rotate(-90 24 24)" />
            </svg>
            <svg v-if="!paused" width="15" height="15" viewBox="0 0 24 24" fill="#0C1524"><rect x="6" y="4.5" width="4" height="15" rx="1.4" /><rect x="14" y="4.5" width="4" height="15" rx="1.4" /></svg>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="#0C1524"><path d="M7 4.8v14.4c0 .9 1 1.5 1.8 1L20 13a1.2 1.2 0 0 0 0-2L8.8 3.8c-.8-.5-1.8.1-1.8 1z" /></svg>
          </button>
          <button type="button" class="mtz__arrow" aria-label="Próxima tese" @click="next">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mtz { background: var(--nu-white); padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.mtz__cols { display: flex; gap: clamp(28px, 4vw, 64px); align-items: center; flex-wrap: wrap; margin-top: 24px; }
.mtz__left { flex: 1 1 360px; min-width: min(300px, 100%); }
.mtz__panel { animation: nu-fade-lg .5s ease both; }
.mtz__panel-title {
  margin: 0; color: var(--nu-ink); font-size: clamp(32px, 4.8vw, 106px);
  font-weight: 600; letter-spacing: -0.04em; line-height: 1.04;
}
.mtz__panel-desc {
  color: var(--nu-gray-2); font-size: clamp(16px, 1.7vw, 19px); font-weight: 500;
  line-height: 1.6; margin-top: 18px; max-width: 460px;
}
.mtz__panel-cta {
  display: inline-flex; align-items: center; gap: 10px; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 28px; font-size: 16px; font-weight: 800;
  margin-top: 30px; transition: background .2s, transform .15s;
}
.mtz__panel-cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); transform: translateY(-2px); }

.mtz__right {
  flex: 1 1 440px; min-width: min(340px, 100%);
  display: flex; align-items: center; justify-content: center; gap: clamp(14px, 2vw, 26px);
}
.mtz__viewport { height: 600px; overflow: hidden; flex: 0 1 470px; min-width: min(300px, 100%); position: relative; }
.mtz__card-slot { margin-bottom: 20px; }

.mtz__controls { display: flex; flex-direction: column; align-items: center; gap: 14px; flex-shrink: 0; }
.mtz__arrow {
  width: 44px; height: 44px; border-radius: 50%; background: var(--nu-navy); border: none;
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s;
}
.mtz__arrow:hover { background: var(--nu-navy-3); }
.mtz__dots { display: flex; flex-direction: column; align-items: center; gap: 9px; padding: 4px 0; }
.mtz__dot {
  width: 7px; height: 7px; border-radius: 50%; background: var(--nu-sand-3);
  border: none; padding: 0; cursor: pointer; transition: all .2s;
}
.mtz__dot--active { width: 9px; height: 9px; background: var(--nu-ink); }
.mtz__play {
  position: relative; width: 48px; height: 48px; border-radius: 50%; background: var(--nu-white);
  border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s;
}
.mtz__play:hover { background: var(--nu-cream); }
.mtz__ring { position: absolute; inset: 0; pointer-events: none; }

/* Mobile: o seletor sai da lateral e vira uma barra horizontal ABAIXO do
   carrossel; os chevrons (cima/baixo) giram -90° pra virar esq/dir. */
@media (max-width: 760px) {
  .mtz__right { flex-direction: column; }
  .mtz__controls { flex-direction: row; gap: 16px; margin-top: 4px; }
  .mtz__dots { flex-direction: row; padding: 0 4px; }
  .mtz__arrow svg { transform: rotate(-90deg); }
}
</style>
