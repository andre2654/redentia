<script setup lang="ts">
// Seção editorial "A tese" (design): fundo creme, 2 colunas com flex-wrap —
// esquerda eyebrow azul + h2, direita prosa clamp(17-19.5px)/1.75 com span de
// destaque (bg azul .16, w800, box-decoration-break clone), strong em ink e
// links inline pra teses relacionadas. HTML dos parágrafos vem JÁ ESCAPADO
// do composable ({mark} → .tse-hi).
import type { TeseEditorialVM } from '~/types/tese'

defineProps<{ editorial: TeseEditorialVM }>()
</script>

<template>
  <section class="ted">
    <div class="ted__cols">
      <div class="ted__left">
        <NuEyebrow como="div">A tese</NuEyebrow>
        <h2 class="ted__title">{{ editorial.heading }}</h2>
      </div>
      <div class="ted__right">
        <!-- eslint-disable-next-line vue/no-v-html — HTML escapado no composable -->
        <p v-for="(p, i) in editorial.paragraphsHtml" :key="i" class="ted__p" v-html="p" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.ted {
  background: var(--nu-page);
  padding: clamp(64px, 7vw, 100px) max(clamp(20px, 5.5vw, 80px), calc((100% - 1240px) / 2));
  animation: nu-fade .5s ease both;
}
.ted__cols { display: flex; gap: clamp(28px, 5vw, 80px); flex-wrap: wrap; }
.ted__left { flex: 0 1 300px; min-width: min(260px, 100%); }
.ted__title {
  margin: 18px 0 0; color: var(--nu-ink);
  font-size: var(--nu-fs-h2-sm); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.04;
}
.ted__right { flex: 1.6 1 480px; min-width: min(320px, 100%); max-width: 860px; }
.ted__p {
  margin: 0; color: var(--nu-gray-3);
  font-size: clamp(17px, 1.6vw, 19px); font-weight: 500; line-height: 1.6;
}
.ted__p + .ted__p { margin-top: 20px; }
.ted__p :deep(.tse-hi) {
  background: var(--nu-blue-bg); color: var(--nu-ink); font-weight: 800; border-radius: 4px;
  padding: 1px 6px; -webkit-box-decoration-break: clone; box-decoration-break: clone;
}
.ted__p :deep(strong) { font-weight: 800; color: var(--nu-ink); }
.ted__p :deep(a) {
  color: var(--nu-blue-text); font-weight: 700;
  border-bottom: 1.5px solid var(--nu-blue-30); transition: border-color .2s;
}
.ted__p :deep(a:hover) { border-bottom-color: var(--nu-blue); }
</style>
