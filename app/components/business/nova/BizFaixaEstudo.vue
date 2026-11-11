<script setup lang="ts">
/**
 * A faixa do estudo no topo da /business (05/11/2026, o print do dono):
 * "Wealth 2030: 10 teses sobre o futuro do wealth no Brasil. Baixar o estudo."
 * O PDF é o do dono (27 páginas, "distribuição livre"), em public/estudos/. Uma
 * linha só, que rola com a página (o topo é que gruda). No celular a frase
 * encolhe para o título e a ação.
 */
import { ESTUDO } from '~/content/business/landing'
</script>

<template>
  <div class="bfe">
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
.bfe__titulo { font-weight: var(--nu-w-medio); white-space: nowrap; }
.bfe__frase { min-width: 0; }
.bfe__acao { display: inline-flex; align-items: center; gap: 4px; font-weight: var(--nu-w-medio); white-space: nowrap; text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
.bfe__acao svg { transition: transform .25s var(--nu-ease-saida); }
.bfe__link:hover .bfe__acao svg { transform: translateX(3px); }
.bfe__link:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: -4px; }
.bfe__ponto { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; background: currentColor; opacity: .55; }
.bfe__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* lavanda clara sobre o navy do topo que vem embaixo */
.bfe__link { background: var(--nu-biz-lavanda); color: var(--nu-navy); }
.bfe__link:hover { background: var(--nu-biz-lavanda-hover); }

@media (max-width: 640px) {
  .bfe__frase { display: none; }
  .bfe__link { font-size: var(--nu-fs-xs); }
}
@media (prefers-reduced-motion: reduce) { .bfe__acao svg { transition: none; } }
</style>
