<script setup lang="ts">
// As teses em que o ativo entra, nas direções do /asset: o mesmo texto do
// NuThesisRowCard (título, convicção, papel do ativo) numa linha com a capa
// pequena, e o "Explorar todas" para /teses.
import type { AcaoThesisRowVM } from '~/types/acao'

defineProps<{ theses: AcaoThesisRowVM[] }>()
const falhou = ref<Record<string, boolean>>({})
</script>

<template>
  <div class="ats2">
    <ul class="ats2__lista">
      <li v-for="t in theses" :key="t.slug">
        <NuxtLink v-contexto-chat="{ id: `tese:${t.slug}`, tipo: 'tese', rotulo: rotuloCurto(t.title) }" :to="`/tese/${t.slug}`" class="ats2__item">
          <span class="ats2__capa">
            <img v-if="t.image && !falhou[t.slug]" :src="t.image" :alt="t.title" loading="lazy" width="96" height="64" @error="falhou[t.slug] = true">
          </span>
          <span class="ats2__corpo">
            <span class="ats2__topo">
              <span class="ats2__nome">{{ t.title }}</span>
              <span v-if="t.conviction != null" class="ats2__conv">Convicção {{ t.conviction }}</span>
            </span>
            <span class="ats2__papel">
              <template v-if="t.roleStrong">Papel do ativo: <strong>{{ t.roleStrong }}</strong>{{ t.roleRest }}</template>
              <template v-else>{{ t.roleRest }}</template>
            </span>
            <span class="ats2__ver">Ver a tese</span>
          </span>
        </NuxtLink>
      </li>
    </ul>
    <NuxtLink to="/teses" class="ats2__todas">
      Explorar todas
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
    </NuxtLink>
  </div>
</template>

<style scoped>
.ats2__lista { list-style: none; margin: 0; padding: 0; }
.ats2__item { display: flex; gap: 16px; align-items: flex-start; padding: 14px 0; border-top: 1px solid var(--nu-cream-line); color: inherit; }
.ats2__capa { flex-shrink: 0; width: 96px; height: 64px; border-radius: var(--nu-r-chip); overflow: hidden; background: var(--nu-navy); }
.ats2__capa img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ats2__corpo { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.ats2__topo { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.ats2__nome { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 600; letter-spacing: -0.02em; transition: color .2s; }
.ats2__item:hover .ats2__nome { color: var(--nu-blue-text); }
.ats2__conv { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }
.ats2__papel { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.ats2__papel strong { color: var(--nu-ink); font-weight: 700; }
.ats2__ver { color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; }
.ats2__todas { display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; }
@media (max-width: 520px) { .ats2__capa { width: 64px; height: 48px; } }
</style>
