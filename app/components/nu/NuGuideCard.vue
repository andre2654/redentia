<script setup lang="ts">
// Card do carrossel de blog/guias: gradient azul ciclado (3 variantes),
// tag, título e pill outline 'Leia aqui'. Valores exatos do design.
import type { NuGuideCardItem } from '~/types/market'

defineProps<{ card: NuGuideCardItem }>()
</script>

<template>
  <NuxtLink :to="card.href" class="ngc" :class="`ngc--${card.variant}`">
    <span class="ngc__content">
      <span class="ngc__tag">{{ card.tag }}</span>
      <span class="ngc__title">{{ card.title }}</span>
      <span class="ngc__pill">
        Leia aqui<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9" /></svg>
      </span>
    </span>
  </NuxtLink>
</template>

<style scoped>
.ngc {
  position: relative; display: flex; flex-direction: column; justify-content: flex-end;
  flex: 0 0 auto; width: min(360px, 78vw); min-height: 450px; border-radius: 10px;
  padding: 26px; scroll-snap-align: start; overflow: hidden;
}
.ngc--1 { background: linear-gradient(200deg, var(--nu-blue-soft) 0%, var(--nu-grad-blue-1) 32%, var(--nu-navy-2) 82%); }
.ngc--2 { background: linear-gradient(165deg, var(--nu-blue) 0%, var(--nu-blue-deep) 45%, var(--nu-navy) 100%); }
.ngc--3 { background: linear-gradient(205deg, var(--nu-grad-blue-2) 0%, var(--nu-blue-deep) 55%, var(--nu-navy) 95%); }
.ngc__content { position: relative; z-index: 1; display: block; }
.ngc__tag { display: block; color: var(--nu-white-90); font-size: 15px; font-weight: 700; }
.ngc__title {
  display: block; color: var(--nu-white); font-size: clamp(21px, 1.8vw, 25px);
  font-weight: 800; letter-spacing: -.3px; line-height: 1.22; margin-top: 10px;
}
.ngc__pill {
  display: inline-flex; align-items: center; gap: 8px; border: 1.5px solid var(--nu-white-85);
  color: var(--nu-white); border-radius: var(--nu-r-pill); padding: 11px 20px;
  font-size: 14.5px; font-weight: 700; margin-top: 20px;
}
</style>
