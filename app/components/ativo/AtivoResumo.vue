<script setup lang="ts">
// O resumo factual do /asset, para ler (03/11/2026). Era uma parede de quatro
// parágrafos com "Fonte:" no meio de cada frase e a data três vezes; agora são
// frases curtas com o número em destaque, os indicadores numa lista, os
// proventos por ano numa fileira de números e as fontes juntas no fim, com a
// data uma vez. O texto vem pronto de utils/assetResumo.ts (montarResumoAtivo →
// `fatos`), com os mesmos números, fontes e datas dos `paragrafos` (que seguem
// para o chat). Tudo no HTML do servidor: é o trecho citável da página.
import type { AcaoResumoVM } from '~/utils/assetResumo'

defineProps<{ ticker: string; resumo: AcaoResumoVM }>()
</script>

<template>
  <div class="ars2">
    <h2 class="ars2__h2">{{ resumo.fatos.titulo }}</h2>
    <p v-if="resumo.fatos.fontes" class="ars2__dek">Os fatos de hoje sobre {{ ticker }}, em frases curtas, com a fonte de cada número no fim.</p>
    <p v-for="(f, i) in resumo.fatos.frases" :key="i" class="ars2__frase">
      <template v-for="(p, j) in f" :key="j"><b v-if="p.n">{{ p.t }}</b><template v-else>{{ p.t }}</template></template>
    </p>

    <template v-if="resumo.fatos.indicadores.length">
      <dl class="ars2__ind">
        <div v-for="x in resumo.fatos.indicadores" :key="x.rotulo" class="ars2__ind-i">
          <dt>{{ x.rotulo }}</dt>
          <dd>{{ x.valor }}</dd>
        </div>
      </dl>
      <p v-if="resumo.fatos.indicadoresNota" class="ars2__nota">{{ resumo.fatos.indicadoresNota }}</p>
    </template>

    <div v-if="resumo.fatos.proventos" class="ars2__prov">
      <p v-for="(f, i) in resumo.fatos.proventos.frases" :key="i" class="ars2__frase">
        <template v-for="(p, j) in f" :key="j"><b v-if="p.n">{{ p.t }}</b><template v-else>{{ p.t }}</template></template>
      </p>
      <template v-if="resumo.fatos.proventos.anos.length">
        <ol class="ars2__anos">
          <li v-for="x in resumo.fatos.proventos.anos" :key="x.rotulo" class="ars2__ano" :class="{ 'ars2__ano--atual': x.corrente }">
            <span class="ars2__ano-r">{{ x.rotulo }}</span>
            <span class="ars2__ano-v">{{ x.valor }}</span>
          </li>
        </ol>
        <p class="ars2__nota">{{ resumo.fatos.proventos.legenda }}</p>
      </template>
    </div>

    <p v-if="resumo.fatos.fontes" class="ars2__fontes">{{ resumo.fatos.fontes }}</p>
    <p class="ars2__aviso">{{ resumo.aviso }}</p>
  </div>
</template>

<style scoped>
.ars2 { max-width: 68ch; }
.ars2__h2 { margin: 0 0 14px; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 500; letter-spacing: -0.03em; line-height: 1.15; }
.ars2__dek { margin: -6px 0 16px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.ars2__frase { margin: 0 0 8px; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6; font-variant-numeric: tabular-nums; }
.ars2__frase b { color: var(--nu-ink); font-weight: 700; white-space: nowrap; }
.ars2__ind { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0 24px; margin: 22px 0 0; }
.ars2__ind-i { display: flex; flex-direction: column-reverse; gap: 2px; padding: 12px 0; border-top: 1px solid var(--nu-cream-line); }
.ars2__ind-i dt { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.ars2__ind-i dd { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 600; letter-spacing: -0.01em; font-variant-numeric: tabular-nums; }
.ars2__nota { margin: 8px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.5; }
.ars2__prov { margin-top: 26px; }
.ars2__anos { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0; border-top: 1px solid var(--nu-cream-line); border-bottom: 1px solid var(--nu-cream-line); }
.ars2__ano { display: flex; flex-direction: column; gap: 2px; padding: 10px 18px 10px 0; margin-right: 18px; font-variant-numeric: tabular-nums; }
.ars2__ano-r { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; }
.ars2__ano-v { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 600; }
.ars2__ano--atual .ars2__ano-r { color: var(--nu-blue-text); }
.ars2__fontes { margin: 24px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.ars2__aviso { margin: 8px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; }
@media (max-width: 560px) {
  .ars2__frase { font-size: var(--nu-fs-md); }
  .ars2__ind { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 16px; }
  .ars2__ano { padding-right: 12px; margin-right: 12px; }
}
</style>
