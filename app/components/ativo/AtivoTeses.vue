<script setup lang="ts">
// As teses em que o ativo entra, nas direções do /asset: o mesmo texto do
// NuThesisRowCard (título, convicção, papel do ativo) numa linha com a capa
// pequena, e o "Explorar todas" para /teses.
// Robustez (11/11/2026): a convicção é o NuSelo azul; a capa que não carregou
// vira o corte da marca no carvão (não um retângulo preto vazio); o "Ver a
// tese" ganha a seta que anda quando a linha acende; o "Explorar todas" é o
// NuLinkSeta; as linhas entram em cascata (v-revelar) e o hover usa os tokens.
import type { AcaoThesisRowVM } from '~/types/acao'

defineProps<{ theses: AcaoThesisRowVM[] }>()
const falhou = ref<Record<string, boolean>>({})
</script>

<template>
  <div class="ats2">
    <ul v-revelar="{ alvo: 'filhos' }" class="ats2__lista">
      <li v-for="t in theses" :key="t.slug">
        <NuxtLink v-contexto-chat="{ id: `tese:${t.slug}`, tipo: 'tese', rotulo: rotuloCurto(t.title) }" :to="`/tese/${t.slug}`" class="ats2__item">
          <span class="ats2__capa">
            <img v-if="t.image && !falhou[t.slug]" :src="t.image" :alt="t.title" loading="lazy" width="96" height="64" @error="falhou[t.slug] = true">
            <MarcaCorte v-else :largura="30" cor="var(--nu-blue-on-dark)" class="ats2__capa-corte" />
          </span>
          <span class="ats2__corpo">
            <span class="ats2__topo">
              <span class="ats2__nome">{{ t.title }}</span>
              <NuSelo v-if="t.conviction != null" tom="azul" tamanho="p">Convicção {{ t.conviction }}</NuSelo>
            </span>
            <span class="ats2__papel">
              <template v-if="t.roleStrong">Papel do ativo: <strong>{{ t.roleStrong }}</strong>{{ t.roleRest }}</template>
              <template v-else>{{ t.roleRest }}</template>
            </span>
            <span class="ats2__ver">Ver a tese<svg class="ats2__seta" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg></span>
          </span>
        </NuxtLink>
      </li>
    </ul>
    <p class="ats2__todas"><NuLinkSeta to="/teses" tom="tinta">Explorar todas</NuLinkSeta></p>
  </div>
</template>

<style scoped>
.ats2__lista { list-style: none; margin: 0; padding: 0; }
.ats2 { position: relative; isolation: isolate; }
.ats2__item { position: relative; display: flex; gap: 16px; align-items: flex-start; padding: 16px 0; border-top: 1px solid var(--nu-line-2); color: inherit; -webkit-tap-highlight-color: transparent; }
/* o hover: o cartão branco que vaza um pouco da coluna e quase não faz sombra */
.ats2__item::before { content: ''; position: absolute; inset: 4px -12px; z-index: -1; border-radius: var(--nu-r-tile); background: var(--nu-white); box-shadow: var(--nu-shadow-branco); opacity: 0; transform: scale(.985); transition: opacity var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--nu-ease-saida); }
.ats2__item:hover::before, .ats2__item:focus-visible::before { opacity: 1; transform: none; }
.ats2__item:focus-visible { outline: none; }
.ats2__item:focus-visible::before { box-shadow: 0 0 0 3px var(--nu-blue), var(--nu-shadow-branco); }
.ats2__item:active::before { transform: scale(.99); }
.ats2__capa img { transition: transform var(--nu-dur-lenta) var(--nu-ease-saida); }
.ats2__item:hover .ats2__capa img { transform: scale(1.06); }
.ats2__capa { flex-shrink: 0; display: grid; place-items: center; width: 96px; height: 64px; border-radius: var(--nu-r-chip); overflow: hidden; background: var(--nu-ink); }
.ats2__capa img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ats2__corpo { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.ats2__topo { display: flex; align-items: center; gap: 8px 12px; flex-wrap: wrap; }
.ats2__nome { color: var(--nu-ink); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); transition: color var(--nu-dur-media) var(--nu-ease-cor); }
.ats2__item:hover .ats2__nome { color: var(--nu-blue-text); }
.ats2__papel { color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.5; }
.ats2__papel strong { color: var(--nu-ink); font-weight: var(--nu-w-medio); }
.ats2__ver { display: inline-flex; align-items: center; gap: 6px; margin-top: 4px; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.ats2__seta { flex: none; transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.ats2__item:hover .ats2__seta { transform: translateX(3px); }
.ats2__todas { margin: 16px 0 0; font-size: var(--nu-fs-md); }
@media (prefers-reduced-motion: reduce) { .ats2__capa img, .ats2__item::before, .ats2__seta, .ats2__nome { transition: none; } .ats2__item:hover .ats2__capa img, .ats2__item:hover .ats2__seta { transform: none; } }
@media (max-width: 520px) { .ats2__capa { width: 64px; height: 48px; } }
</style>
