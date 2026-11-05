<script setup lang="ts">
/**
 * A faixa do estudo no topo da /business nova (05/11/2026, o print do dono):
 * "Wealth 2030: 10 teses sobre o futuro do wealth no Brasil. Baixar o estudo."
 * O PDF é o do dono (27 páginas, "distribuição livre"), em public/estudos/. Uma
 * linha só, que rola com a página (o topo é que gruda). No celular a frase
 * encolhe para o título e a ação.
 */
import type { BizVariacao } from '~/composables/useBizVariacao'
import { ESTUDO } from '~/content/business/landing'

defineProps<{ tema: BizVariacao }>()
</script>

<template>
  <div class="bfe" :class="`bfe--${tema}`">
    <a :href="ESTUDO.href" class="bfe__link" target="_blank" rel="noopener">
      <span class="bfe__ponto" aria-hidden="true" />
      <strong class="bfe__titulo">{{ ESTUDO.titulo }}:</strong>
      <span class="bfe__frase">{{ ESTUDO.frase }}</span>
      <span class="bfe__acao">{{ ESTUDO.acao }}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg></span>
      <span class="bfe__sr">(PDF, abre em outra aba)</span>
    </a>
  </div>
</template>

<style scoped>
.bfe { position: relative; z-index: 51; }
.bfe__link {
  display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: nowrap;
  min-height: 40px; padding: 8px 16px; font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.3; text-align: center;
  transition: background .2s ease, color .2s ease;
}
.bfe__titulo { font-weight: 700; white-space: nowrap; }
.bfe__frase { min-width: 0; }
.bfe__acao { display: inline-flex; align-items: center; gap: 4px; font-weight: 700; white-space: nowrap; text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
.bfe__acao svg { transition: transform .25s cubic-bezier(.2, .8, .2, 1); }
.bfe__link:hover .bfe__acao svg { transform: translateX(3px); }
.bfe__link:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: -4px; }
.bfe__ponto { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; background: currentColor; opacity: .55; }
.bfe__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* 1 · fiel ao print: lavanda clara sobre o navy que vem embaixo */
.bfe--1 .bfe__link { background: var(--nu-biz-lavanda); color: var(--nu-navy); }
.bfe--1 .bfe__link:hover { background: var(--nu-biz-lavanda-hover); }
/* 2 · a noite: preto, com o pontinho no brilho da barra da Redentia */
.bfe--2 .bfe__link { background: var(--nu-agora-bg); color: var(--nu-agora-sub); border-bottom: 1px solid var(--nu-agora-linha); }
.bfe--2 .bfe__titulo, .bfe--2 .bfe__acao { color: var(--nu-agora-texto); }
.bfe--2 .bfe__link:hover { color: var(--nu-agora-texto); }
.bfe--2 .bfe__ponto { opacity: 1; background: conic-gradient(var(--nu-blue), var(--nu-serie-5), var(--nu-serie-4), var(--nu-serie-2), var(--nu-blue)); }
/* 3 · meio-termo: a tinta do site sobre creme */
.bfe--3 .bfe__link { background: var(--nu-navy); color: var(--nu-cream-text-78); }
.bfe--3 .bfe__titulo, .bfe--3 .bfe__acao { color: var(--nu-cream-text); }
.bfe--3 .bfe__link:hover { color: var(--nu-cream-text); }

@media (max-width: 640px) {
  .bfe__frase { display: none; }
  .bfe__link { font-size: var(--nu-fs-xs); }
}
@media (prefers-reduced-motion: reduce) { .bfe__acao svg { transition: none; } }
</style>
