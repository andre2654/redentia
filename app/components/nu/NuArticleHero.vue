<script setup lang="ts">
// Hero de artigo em creme: breadcrumb (hover azul), H1 fluido, dek e byline
// (avatar azul com a marca + autor + linha de atualização). Valores exatos do
// design (Redentia Guia Open Finance.dc.html). Genérico pra qualquer página
// editorial Nu (guia hoje; tese amanhã).
// APORTOU (11/11/2026): senta no creme da página; a assinatura do artigo é o
// ícone da marca (MarcaIcone) no lugar do losango da Redentia.
defineProps<{
  breadcrumbs: { label: string; to: string }[]
  title: string
  dek: string
  author: string
  metaLine: string
}>()
</script>

<template>
  <div class="nah">
    <div class="nah__inner">
      <div class="nah__crumbs">
        <template v-for="(b, i) in breadcrumbs" :key="b.label">
          <span v-if="i > 0">›</span>
          <NuxtLink :to="b.to" class="nah__crumb">{{ b.label }}</NuxtLink>
        </template>
      </div>
      <h1 class="nah__title">{{ title }}</h1>
      <div class="nah__dek">{{ dek }}</div>
      <div class="nah__byline">
        <MarcaIcone :tamanho="44" />
        <span>
          <span class="nah__author">{{ author }}</span>
          <span class="nah__meta">{{ metaLine }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nah {
  background: var(--nu-page);
  padding: clamp(48px, 7vw, 88px) max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(44px, 6vw, 72px);
  animation: nu-fade .5s ease both;
}
.nah__inner { max-width: 920px; }
.nah__crumbs {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600;
}
.nah__crumb { transition: color .2s; }
.nah__crumb:hover { color: var(--nu-blue-text); }
.nah__title {
  margin: 20px 0 0; color: var(--nu-ink);
  font-size: clamp(36px, 5vw, 68px); font-weight: 800;
  letter-spacing: -0.035em; line-height: 1.02;
}
.nah__dek {
  color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500;
  line-height: 1.45; margin-top: 22px; max-width: 760px;
}
.nah__byline { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 28px; }
.nah__author { display: block; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; }
.nah__meta { display: block; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; margin-top: 1px; }
</style>
