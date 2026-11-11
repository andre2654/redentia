<script setup lang="ts">
// Hero de artigo em creme: breadcrumb (hover azul), H1 fluido, dek e byline
// (avatar azul com a marca + autor + linha de atualização). Valores exatos do
// design (Redentia Guia Open Finance.dc.html). Genérico pra qualquer página
// editorial Nu (guia hoje; tese amanhã).
// APORTOU (11/11/2026): senta no creme da página; a assinatura do artigo é o
// ícone da marca (MarcaIcone) no lugar do losango da Redentia.
// ROBUSTEZ (11/11/2026): a coluna do site (--nu-coluna); a trilha com o
// separador em desenho (não em letra) e o sublinhado que aparece sob o
// ponteiro; o título no tracking de exibição; a entrada em token (520ms na
// curva de saída) e o ritmo de 8px entre trilha, título, linha fina e assinatura.
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
          <svg v-if="i > 0" class="nah__sep" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
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
  padding: clamp(48px, 7vw, 88px) var(--nu-coluna) clamp(40px, 5.6vw, 72px);
  animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both;
}
.nah__inner { max-width: 920px; }
.nah__crumbs {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
}
.nah__sep { flex: none; width: 14px; height: 14px; color: var(--nu-sand); }
.nah__crumb {
  display: inline-flex; align-items: center; min-height: 32px;
  text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: transparent;
  transition: color var(--nu-dur-media) var(--nu-ease-cor), text-decoration-color var(--nu-dur-media) var(--nu-ease-cor);
}
.nah__crumb:hover { color: var(--nu-blue-text); text-decoration-color: currentColor; }
.nah__crumb:active { opacity: .72; }
.nah__title {
  margin: 16px 0 0; color: var(--nu-ink);
  font-size: clamp(36px, 5vw, 68px); font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-display); line-height: 1.02; text-wrap: balance;
}
.nah__dek {
  color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-texto);
  line-height: 1.45; margin-top: 20px; max-width: 760px; text-wrap: pretty;
}
.nah__byline { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 32px; }
.nah__author { display: block; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.nah__meta { display: block; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-texto); margin-top: 2px; font-variant-numeric: tabular-nums; }
@media (prefers-reduced-motion: reduce) { .nah { animation: none; } .nah__crumb { transition: none; } }
</style>
