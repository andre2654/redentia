<script setup lang="ts">
// As outras empresas do setor nas direções do /asset (os mesmos pares e o
// mesmo link de setor do AcaoPares).
// Robustez (11/11/2026): os pares entram em cascata (v-revelar); o cartão que
// acende é o branco (sombra branca) com o foco de 3px; a seta chega no hover; o
// "Ver o setor … completo" é o NuLinkSeta; tudo nos tokens.
import type { AcaoParesVM } from '~/types/acao'

const props = withDefaults(defineProps<{ pares: AcaoParesVM; colunas?: 2 | 3 }>(), { colunas: 3 })
const setor = computed(() => props.pares.setor.nome.toLowerCase())
</script>

<template>
  <div v-contexto-chat="{ id: `pares:${pares.setor.nome}`, tipo: 'secao', rotulo: rotuloCurto(`Setor ${pares.setor.nome}`) }" class="apa">
    <ul v-revelar="{ alvo: 'filhos' }" class="apa__grade" :class="`apa__grade--${colunas}`">
      <li v-for="p in pares.itens" :key="p.ticker">
        <NuxtLink :to="`/asset/${p.ticker}`" class="apa__par">
          <NuAssetLogo :ticker="p.ticker" :letter="p.ticker.charAt(0)" tile-bg="var(--nu-tile-blue-bg)" tile-fg="var(--nu-blue-deep)" :size="34" :radius="10" />
          <span class="apa__id">
            <span class="apa__t">{{ p.ticker }}</span>
            <span class="apa__n">{{ p.nome }}</span>
          </span>
          <svg class="apa__seta" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg>
        </NuxtLink>
      </li>
    </ul>
    <p class="apa__setor"><NuLinkSeta :to="pares.setor.href" tom="tinta">Ver o setor {{ setor }} completo</NuLinkSeta></p>
  </div>
</template>

<style scoped>
.apa__grade { list-style: none; margin: 0; padding: 0; display: grid; gap: 0 24px; }
.apa__grade--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.apa__grade--2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
@media (max-width: 760px) { .apa__grade--3 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 480px) { .apa__grade--3, .apa__grade--2 { grid-template-columns: minmax(0, 1fr); } }
.apa { position: relative; isolation: isolate; }
.apa__par { position: relative; display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 12px 0; border-top: 1px solid var(--nu-line-2); color: inherit; -webkit-tap-highlight-color: transparent; }
.apa__par::before {
  content: ''; position: absolute; inset: 4px -12px; z-index: -1; border-radius: var(--nu-r-tile); background: var(--nu-white);
  box-shadow: var(--nu-shadow-branco); opacity: 0; transform: scale(.985);
  transition: opacity var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--nu-ease-saida);
}
.apa__par:hover::before, .apa__par:focus-visible::before { opacity: 1; transform: none; }
.apa__par:focus-visible { outline: none; }
.apa__par:focus-visible::before { box-shadow: 0 0 0 3px var(--nu-blue), var(--nu-shadow-branco); }
.apa__par:active::before { transform: scale(.99); }
.apa__par > :first-child { transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.apa__par:hover > :first-child { transform: translateY(-2px); }
.apa__id { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.apa__t { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte); letter-spacing: 0.02em; transition: color var(--nu-dur-media) var(--nu-ease-cor); }
.apa__par:hover .apa__t { color: var(--nu-blue-text); }
.apa__n { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
/* a seta chega quando o par acende (diz "abre o ativo") */
.apa__seta { flex: none; margin-right: 4px; color: var(--nu-blue-text); opacity: 0; transform: translateX(-6px); transition: opacity var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--nu-ease-saida); }
.apa__par:hover .apa__seta, .apa__par:focus-visible .apa__seta { opacity: 1; transform: none; }
.apa__setor { margin: 16px 0 0; font-size: var(--nu-fs-md); }
@media (prefers-reduced-motion: reduce) { .apa__par::before, .apa__par > :first-child, .apa__seta, .apa__t { transition: none; } }
</style>
