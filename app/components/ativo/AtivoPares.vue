<script setup lang="ts">
// As outras empresas do setor nas direções do /asset (os mesmos pares e o
// mesmo link de setor do AcaoPares).
import type { AcaoParesVM } from '~/types/acao'

const props = withDefaults(defineProps<{ pares: AcaoParesVM; colunas?: 2 | 3 }>(), { colunas: 3 })
const setor = computed(() => props.pares.setor.nome.toLowerCase())
</script>

<template>
  <div v-contexto-chat="{ id: `pares:${pares.setor.nome}`, tipo: 'secao', rotulo: rotuloCurto(`Setor ${pares.setor.nome}`) }" class="apa">
    <ul class="apa__grade" :class="`apa__grade--${colunas}`">
      <li v-for="p in pares.itens" :key="p.ticker">
        <NuxtLink :to="`/asset/${p.ticker}`" class="apa__par">
          <NuAssetLogo :ticker="p.ticker" :letter="p.ticker.charAt(0)" tile-bg="var(--nu-tile-blue-bg)" tile-fg="var(--nu-blue-deep)" :size="34" :radius="10" />
          <span class="apa__id">
            <span class="apa__t">{{ p.ticker }}</span>
            <span class="apa__n">{{ p.nome }}</span>
          </span>
        </NuxtLink>
      </li>
    </ul>
    <NuxtLink :to="pares.setor.href" class="apa__setor">
      Ver o setor {{ setor }} completo
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
    </NuxtLink>
  </div>
</template>

<style scoped>
.apa__grade { list-style: none; margin: 0; padding: 0; display: grid; gap: 0 24px; }
.apa__grade--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.apa__grade--2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
@media (max-width: 760px) { .apa__grade--3 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 480px) { .apa__grade--3, .apa__grade--2 { grid-template-columns: minmax(0, 1fr); } }
.apa { position: relative; isolation: isolate; }
.apa__par { position: relative; display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid var(--nu-cream-line); color: inherit; }
.apa__par::before {
  content: ''; position: absolute; inset: 3px -12px; z-index: -1; border-radius: 14px; background: var(--nu-white);
  box-shadow: 0 0 0 1px var(--nu-navy-06), var(--nu-shadow-card); opacity: 0; transform: scale(.98);
  transition: opacity .2s ease, transform .45s cubic-bezier(.34, 1.56, .64, 1);
}
.apa__par:hover::before, .apa__par:focus-visible::before { opacity: 1; transform: none; }
.apa__par:focus-visible { outline: none; }
.apa__par > :first-child { transition: transform .45s cubic-bezier(.34, 1.56, .64, 1); }
.apa__par:hover > :first-child { transform: translateY(-2px); }
.apa__id { display: flex; flex-direction: column; min-width: 0; }
.apa__t { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; transition: color .2s; }
.apa__par:hover .apa__t { color: var(--nu-blue-text); }
.apa__n { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.apa__setor { display: inline-flex; align-items: center; gap: 8px; margin-top: 14px; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; }
.apa__setor { transition: gap .2s ease, color .2s ease; }
.apa__setor:hover { gap: 12px; color: var(--nu-blue-hover); }
@media (prefers-reduced-motion: reduce) { .apa__par::before, .apa__par > :first-child, .apa__setor { transition: none; } }
</style>
