<script setup lang="ts">
// Seção "Invista com Teses." (design Mercado Nu v2): FAIXA de painéis-imagem
// expansíveis. O painel selecionado cresce (flex-grow 8) e mostra o overlay
// completo (pill de categoria glass + badge de perf + título com palavra
// destacada); os demais viram tiras de 82px com o rótulo da categoria na
// vertical. Rodapé: descrição + CTA da tese atual à esquerda; controles à
// direita (prev / dots / play-pause com anel de progresso / next).
//
// Substitui o MercadoTeses vertical. Porta a mecânica do anel do MercadoTeses
// (RING=131.95, timer de 50ms) — MAS a cadência da faixa é 8000ms/slide
// (_tProg += 50/8000, valor exato do design v2). Dados: useNuTheses (os mesmos
// de antes — só muda a apresentação). Capa quebrada/ausente degrada pro navy
// do painel (bg já é navy + scrim), sem ícone de imagem partida.
const { theses } = useNuTheses()

const idx = ref(0)
const paused = ref(false)
const ringRef = ref<SVGCircleElement | null>(null)
const failed = ref<Record<string, boolean>>({})

const RING = 131.95
let progress = 0
let timer: ReturnType<typeof setInterval> | null = null

const count = computed(() => theses.value.length)
const current = computed(() => theses.value[idx.value] ?? theses.value[0]!)

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

// geometria do painel (valores exatos do design: flex-grow 8/1, min-width por
// estado, transição .8s). O selecionado expande; o resto vira tira.
function panelStyle(i: number) {
  const sel = i === idx.value
  return {
    flexGrow: sel ? 8 : 1,
    minWidth: sel ? 'min(260px, 78vw)' : '82px',
  }
}

onMounted(() => {
  // 8000ms por slide (design v2) — o MercadoTeses antigo usava 5000ms.
  timer = setInterval(() => {
    if (paused.value) return
    progress += 50 / 8000
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
  <!-- âncora #teses: destino do link 'Explorar teses' da Home -->
  <section id="teses" class="tstz">
    <div class="tstz__eyebrow">Teses Redentia</div>
    <h2 class="tstz__title">Invista com Teses.</h2>
    <div class="tstz__dek">
      Carteiras temáticas com pesquisa profunda, estudadas e revalidadas <strong>todos os dias</strong> por IA, com convicção que sobe e desce conforme os fatos.
    </div>

    <div class="tstz__wrap">
      <div class="tstz__strip">
        <button
          v-for="(t, i) in theses" :key="t.slug" type="button"
          class="tstz__panel" :class="i === idx ? 'tstz__panel--on' : 'tstz__panel--off'"
          :style="panelStyle(i)" :aria-pressed="i === idx"
          :aria-label="`Tese: ${t.leftTitle}`" @click="go(i)"
        >
          <img
            v-if="t.image && !failed[t.slug]" :src="t.image" :alt="t.cat"
            class="tstz__img" loading="lazy" @error="failed[t.slug] = true"
          >
          <span class="tstz__scrim" />
          <span class="tstz__vlabel">{{ t.cat }}</span>
          <span class="tstz__overlay">
            <span class="tstz__over-top">
              <span class="tstz__cat">{{ t.cat }}</span>
              <span v-if="t.perf" class="tstz__perf">
                <svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1.5l3.5 6H1.5z" fill="currentColor" /></svg>{{ t.perf }}
              </span>
            </span>
            <span class="tstz__over-bottom">
              <span class="tstz__perf-label">{{ t.perfLabel }}</span>
              <!-- span de destaque SÓ com palavra marcada — a API real não marca
                   (titleHi vazio) e span vazio com padding vira caixinha azul -->
              <span class="tstz__panel-title">{{ t.titlePre }}<span v-if="t.titleHi" class="tstz__hi">{{ t.titleHi }}</span>{{ t.titlePost }}</span>
            </span>
          </span>
        </button>
      </div>

      <div class="tstz__foot">
        <div class="tstz__foot-left">
          <div :key="idx" class="tstz__foot-anim">
            <div class="tstz__desc">{{ current.leftDesc }}</div>
            <NuxtLink :to="current.ctaHref" class="tstz__cta">
              {{ current.cta }}<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
            </NuxtLink>
          </div>
        </div>

        <div class="tstz__ctrls">
          <button type="button" class="tstz__arrow" aria-label="Tese anterior" @click="prev">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--nu-ink)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div class="tstz__dots">
            <button
              v-for="(t, i) in theses" :key="t.slug" type="button"
              class="tstz__dot" :class="{ 'tstz__dot--active': i === idx }"
              :aria-label="`Ir para a tese ${i + 1}`" @click="go(i)"
            />
          </div>
          <button type="button" class="tstz__play" :aria-label="paused ? 'Retomar' : 'Pausar'" @click="togglePause">
            <svg width="48" height="48" viewBox="0 0 48 48" class="tstz__ring">
              <circle cx="24" cy="24" r="21" fill="none" stroke="var(--nu-ink-16)" stroke-width="3" />
              <circle ref="ringRef" cx="24" cy="24" r="21" fill="none" stroke="var(--nu-blue)" stroke-width="3" stroke-linecap="round" stroke-dasharray="131.95" stroke-dashoffset="131.95" transform="rotate(-90 24 24)" />
            </svg>
            <svg v-if="!paused" width="14" height="14" viewBox="0 0 24 24" fill="var(--nu-white)"><rect x="6" y="4.5" width="4" height="15" rx="1.4" /><rect x="14" y="4.5" width="4" height="15" rx="1.4" /></svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="var(--nu-white)"><path d="M7 4.8v14.4c0 .9 1 1.5 1.8 1L20 13a1.2 1.2 0 0 0 0-2L8.8 3.8c-.8-.5-1.8.1-1.8 1z" /></svg>
          </button>
          <button type="button" class="tstz__arrow" aria-label="Próxima tese" @click="next">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--nu-ink)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tstz { background: var(--nu-white); padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.tstz__eyebrow { color: var(--nu-blue); font-size: clamp(16px, 1.5vw, 19px); font-weight: 800; }
.tstz__title { margin: 12px 0 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02; }
.tstz__dek { color: var(--nu-gray); font-size: clamp(16px, 1.7vw, 20px); font-weight: 600; line-height: 1.55; margin-top: 20px; max-width: 620px; }
.tstz__dek strong { color: var(--nu-ink); font-weight: 800; }

.tstz__wrap { margin-top: 44px; }
.tstz__strip { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 2px; }

.tstz__panel {
  position: relative; height: clamp(360px, 52vh, 560px); border-radius: var(--nu-r-card);
  overflow: hidden; cursor: pointer; background: var(--nu-navy); border: none; padding: 0;
  flex-shrink: 1; flex-basis: 0; text-align: left;
  transition: flex-grow .8s cubic-bezier(.55, 0, .25, 1), min-width .8s cubic-bezier(.55, 0, .25, 1);
}
.tstz__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.tstz__scrim { position: absolute; inset: 0; background: var(--nu-tese-strip-scrim); pointer-events: none; }

/* rótulo vertical da categoria (só painel FECHADO) */
.tstz__vlabel {
  position: absolute; bottom: 22px; left: 50%; transform: translateX(-50%) rotate(180deg);
  writing-mode: vertical-rl; color: var(--nu-white); font-size: 13px; font-weight: 800;
  letter-spacing: 2px; text-transform: uppercase; white-space: nowrap; pointer-events: none;
  opacity: 1; transition: opacity .3s;
}
.tstz__panel--on .tstz__vlabel { opacity: 0; }

/* overlay completo (só painel ABERTO) */
.tstz__overlay {
  position: absolute; inset: 0; padding: clamp(22px, 2.4vw, 30px); display: flex;
  flex-direction: column; pointer-events: none; opacity: 0; transition: opacity .5s;
}
.tstz__panel--on .tstz__overlay { opacity: 1; transition: opacity .5s .12s; }
.tstz__over-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.tstz__cat {
  display: inline-flex; align-items: center; background: var(--nu-white-18);
  backdrop-filter: blur(8px); color: var(--nu-white); font-size: 12px; font-weight: 800;
  letter-spacing: 1.6px; text-transform: uppercase; padding: 8px 15px;
  border-radius: var(--nu-r-pill); white-space: nowrap;
}
.tstz__perf {
  display: inline-flex; align-items: center; gap: 7px; background: var(--nu-green-soft);
  color: var(--nu-navy); font-size: 14px; font-weight: 800; padding: 6px 14px;
  border-radius: var(--nu-r-pill); font-variant-numeric: tabular-nums; white-space: nowrap;
}
.tstz__over-bottom { margin-top: auto; }
.tstz__perf-label { color: var(--nu-white-72); font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
.tstz__panel-title {
  display: block; color: var(--nu-white); font-size: clamp(26px, 2.6vw, 40px); font-weight: 800;
  line-height: 1.08; letter-spacing: -.5px; margin-top: 10px; max-width: 640px;
}
.tstz__hi { background: var(--nu-blue); padding: 1px 10px; -webkit-box-decoration-break: clone; box-decoration-break: clone; }

/* rodapé: descrição + CTA à esquerda, controles à direita */
.tstz__foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 28px; flex-wrap: wrap; margin-top: 30px; }
.tstz__foot-left { flex: 1 1 460px; min-width: min(320px, 100%); }
.tstz__foot-anim { animation: nu-fade .5s ease both; }
.tstz__desc { color: var(--nu-gray-2); font-size: clamp(17px, 1.75vw, 21px); font-weight: 500; line-height: 1.55; max-width: 660px; }
.tstz__cta {
  display: inline-flex; align-items: center; gap: 10px; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 30px; font-size: 16px; font-weight: 800;
  margin-top: 22px; transition: background .2s, transform .15s;
}
.tstz__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); transform: translateY(-2px); }

.tstz__ctrls { display: flex; align-items: center; gap: 13px; flex-shrink: 0; }
.tstz__arrow {
  width: 44px; height: 44px; border-radius: 50%; background: var(--nu-cream-5); border: none;
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s;
}
.tstz__arrow:hover { background: var(--nu-cream-5-hover); }
.tstz__dots { display: flex; align-items: center; gap: 9px; }
.tstz__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--nu-sand-3); border: none; padding: 0; cursor: pointer; transition: all .2s; }
.tstz__dot--active { width: 9px; height: 9px; background: var(--nu-ink); }
.tstz__play {
  position: relative; width: 48px; height: 48px; border-radius: 50%; background: var(--nu-ink);
  border: none; display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.tstz__ring { position: absolute; inset: 0; pointer-events: none; }

/* Mobile (padrão app: 760; o design v2 colapsava em 680): a faixa vira 1
   painel por vez — os fechados somem, o aberto ocupa 100%; o rodapé centraliza
   e os controles ganham a largura toda. */
@media (max-width: 760px) {
  .tstz__panel--off { display: none !important; }
  .tstz__panel--on { min-width: 100% !important; flex-grow: 1 !important; }
  .tstz__foot { justify-content: center; }
  .tstz__foot-left { flex-basis: 100%; }
  .tstz__ctrls { width: 100%; justify-content: center; }
}
</style>
