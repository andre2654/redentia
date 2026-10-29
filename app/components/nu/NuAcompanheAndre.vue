<script setup lang="ts">
// Linha discreta "Acompanhe o André no X e no Threads".
// Fica no fluxo da página (sem fixed, sticky ou absolute): o convite da
// newsletter e o aviso de cookies continuam donos dos cantos.
// Markup estático no SSR. Os hrefs saem de utils/acompanhe-andre.ts.
import { urlAcompanhe, type LugarAcompanhe } from '~/utils/acompanhe-andre'

const props = withDefaults(defineProps<{
  lugar: LugarAcompanhe
  /** claro: texto navy em fundo claro. escuro: texto creme no rodapé navy. */
  tom?: 'claro' | 'escuro'
}>(), { tom: 'claro' })

const hrefX = urlAcompanhe('x', props.lugar)
const hrefThreads = urlAcompanhe('threads', props.lugar)
</script>

<template>
  <p
    class="aa"
    :class="[`aa--${lugar}`, { 'aa--escuro': tom === 'escuro' }]"
    :data-lugar="lugar"
  >
    <span>Acompanhe o André no</span>
    <a
      class="aa__link"
      :href="hrefX"
      target="_blank"
      rel="noopener me"
      aria-label="André Saraiva no X"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M14.23 10.16 22.14 1h-1.87l-6.86 7.95L7.7 1H1.5l8.3 12.06L1.5 23h1.87l7.26-8.41L15.8 23h6.2l-7.77-12.84Zm-2.57 2.98-.84-1.2L4.56 2.8h2.88l5.4 7.72.84 1.2 7.02 10.04h-2.88l-5.76-8.62Z" />
      </svg>
      <span>X</span>
    </a>
    <span>e no</span>
    <a
      class="aa__link"
      :href="hrefThreads"
      target="_blank"
      rel="noopener me"
      aria-label="André Saraiva no Threads"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" />
        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span>Threads</span>
    </a>
  </p>
</template>

<style scoped>
/* Fluxo normal. Sem position e sem z-index: não cobre convite nem cookies. */
.aa {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35em 0.4em;
  margin: 0;
  max-width: 100%;
  font-family: var(--nu-font);
  font-size: var(--nu-fs-sm);
  font-weight: 500;
  line-height: 1.45;
  color: var(--nu-navy);
}
.aa--calculadora {
  justify-content: center;
  background: var(--nu-cream);
  padding: 0 clamp(22px, 5.5vw, 80px) 18px;
}
.aa--asset {
  background: var(--nu-white);
  padding: 0 clamp(22px, 5.5vw, 80px) 18px;
}
.aa--rodape {
  margin-top: 22px;
  align-self: stretch;
}
.aa--escuro { color: var(--nu-cream-text); }

.aa__link {
  display: inline-flex;
  align-items: center;
  gap: 0.28em;
  color: var(--nu-blue);
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
.aa--escuro .aa__link { color: var(--nu-blue); }
.aa__link:hover { color: var(--nu-blue-hover); }
.aa--escuro .aa__link:hover { color: var(--nu-cream-text); }
.aa__link:focus-visible {
  outline: 2px solid var(--nu-blue);
  outline-offset: 3px;
  border-radius: 2px;
}
.aa--escuro .aa__link:focus-visible { outline-color: var(--nu-blue-soft); }
.aa__link svg { display: block; flex: none; }
</style>
