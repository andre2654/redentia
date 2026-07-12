<script setup lang="ts">
// Hero da Home logada (design Redentia Home Nu.dc.html): saudação por hora em
// azul, patrimônio em tipografia gigante com toggle-olho de privacidade,
// badge do dia (verde/vermelho) e dateLine, CTAs pill.
// ESTADOS (Diretriz nº1): 'patrimonio' = números reais · 'connect' = o hero
// VIRA o convite de conexão — mesma tipografia gigante, CTA 'Conectar
// carteira' protagonista (o design manda na estética, o conteúdo adapta).
import type { HomeHeroVM } from '~/types/home'

const props = defineProps<{ hero: HomeHeroVM }>()
const { hidden } = useHiddenValues()

const patrimonio = computed(() =>
  props.hero.patrimonio ? (hidden.value ? 'R$ ••••••' : props.hero.patrimonio) : null)
const hojeTxt = computed(() =>
  props.hero.hojeTxt ? (hidden.value ? '+R$ •• hoje' : props.hero.hojeTxt) : null)

// Fit-text do patrimônio — padrão compartilhado (useFitText, extraído no PR8;
// o hero da /carteira usa o mesmo).
const { el: valueEl } = useFitText(patrimonio)
</script>

<template>
  <section class="hhr">
    <div class="hhr__greeting">{{ hero.greeting }}</div>

    <template v-if="hero.state === 'patrimonio'">
      <div class="hhr__row">
        <h1 ref="valueEl" class="hhr__value hhr__value--fit">{{ patrimonio }}</h1>
        <NuEyeButton class="hhr__eye" />
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
.hhr__eye { margin-bottom: 8px; }
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
