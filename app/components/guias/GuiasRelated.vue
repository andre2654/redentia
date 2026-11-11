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
      <div>
        <NuEyebrow como="p">Guias</NuEyebrow>
        <h2 class="grl__title">Continue lendo.</h2>
      </div>
      <NuBotaoSeta to="/guias" variante="carvao" tamanho="m">Ver todos os guias</NuBotaoSeta>
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
  background: var(--nu-band);
  padding: clamp(64px, 7vw, 100px) max(clamp(20px, 5.5vw, 80px), calc((100% - 1240px) / 2));
  animation: nu-fade .5s ease both;
}
.grl__head {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 22px; flex-wrap: wrap;
}
.grl__title {
  margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm);
  font-weight: var(--nu-w-display); letter-spacing: -0.03em; line-height: 1.02;
}
.grl__grid {
  /* auto-fill: um cartão sozinho mantém a largura de coluna, não estica a faixa inteira */
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  gap: 18px; margin-top: 36px;
}
</style>
