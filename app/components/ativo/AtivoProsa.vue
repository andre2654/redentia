<script setup lang="ts">
// A prosa editorial do ativo nas direções do /asset: as mesmas seções do
// AcaoEditorial (Sobre, tese, riscos, pares, história), cada uma com o seu H2
// e os parágrafos em {{ }}. SEM v-html: o texto vem do banco, gerado por LLM
// (ver o aviso no AcaoEditorial). O tamanho do título vem da direção, por
// --a-h2 e --a-h2-peso (no /asset, o peso de exibição dos títulos de seção).
// Robustez (11/11/2026): cada bloco entra ao chegar perto da tela (v-revelar);
// o título → texto a 16px, um bloco → o próximo a 56px (o ritmo de 8px).
import type { AcaoEditorialVM } from '~/types/acao'

defineProps<{ ticker: string; secoes: AcaoEditorialVM['sections'] }>()
</script>

<template>
  <div class="aps">
    <article
      v-for="s in secoes" :key="s.id"
      v-revelar
      v-contexto-chat="{ id: `editorial:${ticker}:${s.id}`, tipo: 'secao', rotulo: rotuloCurto(s.heading) }"
      class="aps__bloco"
    >
      <h2 class="aps__h2">{{ s.heading }}</h2>
      <p v-for="(p, i) in paragrafosDoAtivo(s.body)" :key="i" class="aps__p">{{ p }}</p>
    </article>
  </div>
</template>

<style scoped>
.aps__bloco + .aps__bloco { margin-top: clamp(40px, 4.4vw, 56px); }
.aps__h2 { margin: 0; color: var(--nu-ink); font-size: var(--a-h2, var(--nu-fs-h3)); font-weight: var(--a-h2-peso, var(--nu-w-display)); letter-spacing: var(--nu-ls-display); line-height: 1.08; text-wrap: balance; }
.aps__p { margin: 16px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.6; }
@media (max-width: 560px) { .aps__p { font-size: var(--nu-fs-md); } }
</style>
