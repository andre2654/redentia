<script setup lang="ts">
// Seção "TICKER faz parte de N teses" (design Acoes Nu): eyebrow azul, H2 com
// contagem real, link 'Explorar todas' com círculo azul 44px (hover gap 12→16)
// e grid auto-fit de NuThesisRowCard. A seção inteira some quando o ticker não
// aparece em nenhuma tese.
import type { AcaoThesisRowVM } from '~/types/acao'

const props = defineProps<{ ticker: string; theses: AcaoThesisRowVM[] }>()

const heading = computed(() =>
  props.theses.length === 1
    ? `${props.ticker} faz parte de 1 tese.`
    : `${props.ticker} faz parte de ${props.theses.length} teses.`,
)
</script>

<template>
  <section v-if="theses.length" class="ats">
    <div class="ats__head">
      <div>
        <div class="ats__eyebrow">Teses Redentia</div>
        <h2 class="ats__title">{{ heading }}</h2>
      </div>
      <NuxtLink to="/teses" class="ats__all">
        <span class="ats__all-label">Explorar todas</span>
        <span class="ats__all-circle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </span>
      </NuxtLink>
    </div>
    <div class="ats__grid">
      <NuThesisRowCard v-for="t in theses" :key="t.slug" :t="t" />
    </div>
  </section>
</template>

<style scoped>
.ats {
  background: var(--nu-cream);
  padding: clamp(48px, 6vw, 84px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.ats__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.ats__eyebrow { color: var(--nu-blue); font-size: clamp(16px, 1.5vw, 19px); font-weight: 800; }
.ats__title {
  margin: 12px 0 0; color: var(--nu-ink); font-size: clamp(30px, 3.6vw, 48px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.04;
}
.ats__all { display: inline-flex; align-items: center; gap: 12px; flex-shrink: 0; transition: gap .2s; }
.ats__all:hover { gap: 16px; }
.ats__all-label { color: var(--nu-ink); font-size: 16px; font-weight: 800; }
.ats__all-circle {
  width: 44px; height: 44px; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
}
.ats__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(420px, 100%), 1fr));
  gap: 16px; margin-top: 32px;
}
</style>
