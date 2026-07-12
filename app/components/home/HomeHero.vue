<script setup lang="ts">
// Hero da Home logada (design Redentia Home Nu.dc.html): saudação por hora em
// azul, patrimônio em tipografia gigante com toggle-olho de privacidade,
// badge do dia (verde/vermelho) e dateLine, CTAs pill.
// ESTADOS (Diretriz nº1): 'patrimonio' = números reais · 'connect' = o hero
// VIRA o convite de conexão — mesma tipografia gigante, CTA 'Conectar
// carteira' protagonista (o design manda na estética, o conteúdo adapta).
import type { HomeHeroVM } from '~/types/home'

const props = defineProps<{ hero: HomeHeroVM }>()
const { hidden, toggle } = useHiddenValues()

const patrimonio = computed(() =>
  props.hero.patrimonio ? (hidden.value ? 'R$ ••••••' : props.hero.patrimonio) : null)
const hojeTxt = computed(() =>
  props.hero.hojeTxt ? (hidden.value ? '+R$ •• hoje' : props.hero.hojeTxt) : null)

// Fit-text do patrimônio (UX do dono 2026-07-11): o número SEMPRE ocupa uma
// linha só, no maior tamanho que couber ao lado do olho — o clamp() do CSS é o
// teto, daqui só encolhe (nunca estica além do design). Reage a resize e ao
// toggle da máscara (texto muda de largura).
const valueEl = ref<HTMLElement | null>(null)
function fitValue() {
  const el = valueEl.value
  if (!el) return
  el.style.fontSize = ''
  const base = parseFloat(getComputedStyle(el).fontSize)
  if (el.scrollWidth > el.clientWidth) {
    el.style.fontSize = `${Math.max(30, Math.floor(base * (el.clientWidth / el.scrollWidth) * 0.985))}px`
  }
}
let ro: ResizeObserver | null = null
onMounted(() => {
  fitValue()
  ro = new ResizeObserver(fitValue)
  if (valueEl.value) ro.observe(valueEl.value)
})
onBeforeUnmount(() => { ro?.disconnect() })
watch(patrimonio, () => nextTick(fitValue))
</script>

<template>
  <section class="hhr">
    <div class="hhr__greeting">{{ hero.greeting }}</div>

    <template v-if="hero.state === 'patrimonio'">
      <div class="hhr__row">
        <h1 ref="valueEl" class="hhr__value hhr__value--fit">{{ patrimonio }}</h1>
        <button
          type="button" class="hhr__eye"
          :aria-label="hidden ? 'Mostrar valores' : 'Esconder valores'"
          :aria-pressed="hidden"
          @click="toggle"
        >
          <svg v-if="!hidden" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          <svg v-else width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M1 1l22 22" /></svg>
        </button>
      </div>
      <div class="hhr__meta">
        <span v-if="hojeTxt" class="hhr__badge" :class="`hhr__badge--${hero.hojeDir}`">
          <svg width="11" height="11" viewBox="0 0 10 10" :class="{ 'hhr__tri--down': hero.hojeDir === 'down' }"><path d="M5 1.5l3.5 6H1.5z" fill="currentColor" /></svg>
          {{ hojeTxt }}
        </span>
        <span class="hhr__date">{{ hero.dateLine }}</span>
      </div>
      <div class="hhr__ctas">
        <NuxtLink to="/busca" class="hhr__cta">Perguntar à Redentia AI</NuxtLink>
        <NuxtLink to="/carteira" class="hhr__cta-outline">Ver carteira</NuxtLink>
      </div>
    </template>

    <template v-else>
      <h1 class="hhr__value hhr__value--connect">Conecte<br>sua carteira.</h1>
      <div class="hhr__meta">
        <span class="hhr__date">{{ hero.dateLine }}</span>
      </div>
      <div class="hhr__connect-sub">
        Traga suas posições pelo Open Finance — leitura automática regulada pelo
        Banco Central, sem acesso a movimentações. Seu patrimônio aparece aqui.
      </div>
      <div class="hhr__ctas">
        <NuxtLink to="/carteira" class="hhr__cta">Conectar carteira</NuxtLink>
        <NuxtLink to="/mercado" class="hhr__cta-outline">Explorar o mercado</NuxtLink>
      </div>
    </template>
  </section>
</template>

<style scoped>
.hhr {
  background: var(--nu-cream);
  padding: clamp(64px, 9vw, 120px) clamp(22px, 5.5vw, 80px) clamp(60px, 7vw, 92px);
  animation: nu-fade .5s ease both;
}
.hhr__greeting { color: var(--nu-blue); font-size: clamp(17px, 1.6vw, 21px); font-weight: 800; letter-spacing: -.2px; }
.hhr__row { display: flex; align-items: flex-end; gap: 22px; margin-top: 16px; }
.hhr__value {
  margin: 0; color: var(--nu-ink); font-size: clamp(54px, 8.5vw, 106px);
  font-weight: 800; letter-spacing: -0.045em; line-height: 0.98;
  font-variant-numeric: tabular-nums;
}
/* variante fit: 1 linha sempre; o JS encolhe a fonte até caber ao lado do olho */
.hhr__value--fit { flex: 0 1 auto; min-width: 0; white-space: nowrap; overflow: hidden; }
.hhr__value--connect { margin-top: 16px; }
.hhr__eye {
  width: 48px; height: 48px; margin-bottom: 8px; border-radius: 50%;
  background: transparent; border: 2px solid rgba(10, 10, 12, 0.16);
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  flex-shrink: 0; transition: background .2s, border-color .2s;
}
.hhr__eye:hover { background: var(--nu-white); border-color: var(--nu-ink-30); }
.hhr__meta { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-top: 26px; }
.hhr__badge {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 15.5px; font-weight: 800; padding: 9px 18px;
  border-radius: var(--nu-r-pill); font-variant-numeric: tabular-nums;
}
.hhr__badge--up { background: var(--nu-green-bg); color: var(--nu-green-2); }
.hhr__badge--down { background: var(--nu-red-tint); color: var(--nu-red-2); }
.hhr__tri--down { transform: rotate(180deg); }
.hhr__date { color: var(--nu-gray); font-size: 15.5px; font-weight: 600; }
.hhr__connect-sub {
  color: var(--nu-gray-2); font-size: clamp(16px, 1.7vw, 19px); font-weight: 600;
  line-height: 1.55; margin-top: 18px; max-width: 640px;
}
.hhr__ctas { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 44px; }
.hhr__cta {
  display: inline-flex; align-items: center; gap: 10px; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 17px 30px; font-size: 17px; font-weight: 700;
  transition: background .2s, transform .15s;
}
.hhr__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); transform: translateY(-2px); }
.hhr__cta-outline {
  display: inline-flex; align-items: center; gap: 10px; background: transparent; color: var(--nu-blue);
  border: 2px solid var(--nu-blue); border-radius: var(--nu-r-pill); padding: 15px 28px;
  font-size: 17px; font-weight: 700; transition: background .2s;
}
.hhr__cta-outline:hover { background: var(--nu-blue-tint-2); color: var(--nu-blue); }
</style>
