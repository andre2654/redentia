<script setup lang="ts">
// Faixa "Continue lendo." do guia: header (H2 + link "Ver todos os guias" com
// hover de gap 12→16px) e grid responsivo de GuiasCard variant related.
// Valores exatos do design (Redentia Guia Open Finance.dc.html).
// ROBUSTEZ (11/11/2026): "Ver todos os guias" é a ação secundária da dobra (os
// cartões são a principal): vira o NuLinkSeta. A faixa e os cartões entram ao
// chegar (v-revelar, os cartões em cascata de 60ms); a coluna é a do site.
import type { GuideTag } from '~/types/guias'

defineProps<{ items: { title: string; tag: GuideTag; minutes: number; to: string }[] }>()
</script>

<template>
  <section class="grl">
    <div v-revelar class="grl__head">
      <div>
        <NuEyebrow como="p">Guias</NuEyebrow>
        <h2 class="grl__title">Continue lendo.</h2>
      </div>
      <p class="grl__todos"><NuLinkSeta to="/guias" tom="tinta">Ver todos os guias</NuLinkSeta></p>
    </div>
    <div v-revelar="{ alvo: 'filhos' }" class="grl__grid">
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
  padding: clamp(72px, 8vw, 128px) var(--nu-coluna);
}
.grl__head {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 22px; flex-wrap: wrap;
}
.grl__title {
  margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm);
  font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1.02;
}
.grl__todos { margin: 0; font-size: var(--nu-fs-md); }
.grl__grid {
  /* auto-fill: um cartão sozinho mantém a largura de coluna, não estica a faixa inteira */
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  gap: clamp(16px, 1.8vw, 24px); margin-top: 40px;
}
</style>
