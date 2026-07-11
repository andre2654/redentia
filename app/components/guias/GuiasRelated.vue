<script setup lang="ts">
// Faixa "Continue lendo." do guia: header (H2 + link "Ver todos os guias" com
// hover de gap 12→16px) e grid responsivo de GuiasCard variant related.
// Valores exatos do design (Redentia Guia Open Finance.dc.html).
import type { GuideTag } from '~/types/guias'

defineProps<{ items: { title: string; tag: GuideTag; minutes: number; to: string }[] }>()
</script>

<template>
  <section class="grl">
    <div class="grl__head">
      <h2 class="grl__title">Continue lendo.</h2>
      <NuxtLink to="/guias" class="grl__all">
        <span class="grl__all-label">Ver todos os guias</span>
        <span class="grl__all-circle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </span>
      </NuxtLink>
    </div>
    <div class="grl__grid">
      <GuiasCard
        v-for="(g, i) in items" :key="g.title"
        :title="g.title" :tag="g.tag" :minutes="g.minutes" :to="g.to"
        :gradient="((i % 3) + 1) as 1 | 2 | 3" variant="related"
      />
    </div>
  </section>
</template>

<style scoped>
.grl {
  background: var(--nu-cream);
  padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.grl__head {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 22px; flex-wrap: wrap;
}
.grl__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(32px, 4vw, 52px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.04;
}
.grl__all { display: inline-flex; align-items: center; gap: 12px; flex-shrink: 0; transition: gap .2s; }
.grl__all:hover { gap: 16px; }
.grl__all-label { color: var(--nu-ink); font-size: 16px; font-weight: 800; }
.grl__all-circle {
  width: 44px; height: 44px; border-radius: 50%; background: var(--nu-blue);
  color: var(--nu-white); display: flex; align-items: center; justify-content: center;
}
.grl__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 16px; margin-top: 36px;
}
</style>
