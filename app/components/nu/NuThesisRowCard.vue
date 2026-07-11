<script setup lang="ts">
// Card horizontal de tese (design Acoes Nu, seção "faz parte de N teses"):
// imagem 130px à esquerda sobre navy, título + pill 'Convicção NN' (verde
// quando ≥84 — os dois estados do design: 84 verde, 82 neutra), texto
// 'Papel do ativo: <strong>…</strong>' e link 'Ver a tese'. Hover lift -2px.
// É um componente NOVO (não uma variante do NuThesisCard vertical de 540px do
// carrossel do /mercado — geometria e conteúdo divergem demais).
import type { AcaoThesisRowVM } from '~/types/acao'

defineProps<{ t: AcaoThesisRowVM }>()

// Capa quebrada não pode vazar ícone de imagem partida — degrada pro navy.
const imgFailed = ref(false)
</script>

<template>
  <NuxtLink :to="`/tese/${t.slug}`" class="ntr">
    <span class="ntr__media">
      <img v-if="t.image && !imgFailed" :src="t.image" :alt="t.title" class="ntr__img" loading="lazy" @error="imgFailed = true">
    </span>
    <span class="ntr__body">
      <span class="ntr__top">
        <span class="ntr__title">{{ t.title }}</span>
        <span v-if="t.conviction != null" class="ntr__conv" :class="t.conviction >= 84 ? 'ntr__conv--green' : 'ntr__conv--neutral'">Convicção {{ t.conviction }}</span>
      </span>
      <span class="ntr__role">
        <template v-if="t.roleStrong">Papel do ativo: <strong class="ntr__strong">{{ t.roleStrong }}</strong>{{ t.roleRest }}</template>
        <template v-else>{{ t.roleRest }}</template>
      </span>
      <span class="ntr__link">
        Ver a tese<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
      </span>
    </span>
  </NuxtLink>
</template>

<style scoped>
.ntr {
  display: flex; align-items: stretch; background: var(--nu-white);
  border-radius: var(--nu-r-card); overflow: hidden; transition: transform .15s;
}
.ntr:hover { transform: translateY(-2px); }
.ntr__media { flex: 0 0 130px; position: relative; display: block; background: var(--nu-navy); }
.ntr__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.ntr__body { flex: 1; min-width: 0; padding: 20px 22px; display: flex; flex-direction: column; }
.ntr__top { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.ntr__title { color: var(--nu-ink); font-size: 18px; font-weight: 800; letter-spacing: -.2px; }
.ntr__conv {
  display: inline-flex; align-items: center; font-size: 11.5px; font-weight: 800;
  padding: 4px 11px; border-radius: var(--nu-r-pill); white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.ntr__conv--green { background: var(--nu-green-bg); color: var(--nu-green-2); }
.ntr__conv--neutral { background: var(--nu-sand-2); color: var(--nu-gray-2); }
.ntr__role { color: var(--nu-gray-2); font-size: 14px; font-weight: 500; line-height: 1.55; margin-top: 8px; }
.ntr__strong { font-weight: 800; color: var(--nu-ink); }
.ntr__link {
  display: inline-flex; align-items: center; gap: 7px; color: var(--nu-blue);
  font-size: 13.5px; font-weight: 800; margin-top: auto; padding-top: 14px;
}
</style>
