<script setup lang="ts">
// /guias, direção 2 (protótipo de 02/11/2026): "As trilhas". Os guias viram
// caminhos de leitura em ordem ("Comece por aqui", "Viver de dividendos"...),
// cada um uma linha de passos numerados. O único desenho da página é essa
// linha: o passo que você já abriu neste navegador fica preenchido (o
// progresso mora só no localStorage, sem conta e sem backend). Embaixo, todos
// os guias de A a Z, para o que ainda não entrou numa trilha: guia novo da
// rotina aparece ali sozinho. No celular a trilha desce na vertical.
import type { BibliotecaGuias, GuiaItemVM } from '~/utils/guiasHub'

const props = defineProps<{ biblioteca: BibliotecaGuias }>()
const b = computed(() => props.biblioteca)

const contexto = (g: GuiaItemVM) => ({ id: `guia:${g.to}`, tipo: 'secao', rotulo: rotuloCurto(g.titulo) })
const aZ = computed(() => [...b.value.itens].sort((x, y) => x.titulo.localeCompare(y.titulo, 'pt-BR')))

// o progresso: só depois do mount (o SSR e a 1ª pintura saem sem nada aberto)
const abertos = ref<string[]>([])
onMounted(() => { abertos.value = guiasLerAbertos() })
const abriu = (g: GuiaItemVM) => { abertos.value = guiasMarcarAberto(g.chave) }
const feito = (g: GuiaItemVM) => abertos.value.includes(g.chave)
const quantos = (itens: GuiaItemVM[]) => itens.filter(feito).length
</script>

<template>
  <div class="gtr">
    <header class="gtr__topo">
      <p class="gtr__produto">Guias</p>
      <h1 class="gtr__titulo">Guias para investir melhor.</h1>
      <p class="gtr__dek">Comece por onde fizer sentido para você e siga na ordem, um guia de cada vez.</p>
      <p class="gtr__conta">{{ b.trilhas.length }} trilhas · {{ b.itens.length }} guias</p>
    </header>

    <section v-for="(t, ti) in b.trilhas" :key="t.id" class="gtr__trilha" :aria-labelledby="`gtr-${t.id}`">
      <div class="gtr__cab">
        <div class="gtr__cab-txt">
          <p class="gtr__num">Trilha {{ ti + 1 }}</p>
          <h2 :id="`gtr-${t.id}`" class="gtr__nome">{{ t.titulo }}</h2>
          <p class="gtr__linha">{{ t.linha }}</p>
        </div>
        <p class="gtr__meta">
          <span>{{ t.itens.length }} guias · {{ t.minutos }} min de leitura</span>
          <!-- espaço guardado: o progresso entra depois do mount sem empurrar nada -->
          <span class="gtr__prog" aria-live="polite">
            <template v-if="quantos(t.itens)">{{ quantos(t.itens) === t.itens.length ? 'Trilha lida' : `Você abriu ${quantos(t.itens)} de ${t.itens.length}` }}</template>
          </span>
        </p>
      </div>

      <ol class="gtr__passos" :style="{ '--n': t.itens.length }">
        <li v-for="(g, i) in t.itens" :key="g.chave" class="gtr__passo" :class="{ 'gtr__passo--feito': feito(g), 'gtr__passo--fim': i === t.itens.length - 1 }">
          <span class="gtr__marco" aria-hidden="true">
            <span class="gtr__bola">
              <svg v-if="feito(g)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              <template v-else>{{ i + 1 }}</template>
            </span>
            <span class="gtr__fio" />
          </span>
          <NuxtLink v-contexto-chat="contexto(g)" :to="g.to" class="gtr__cartao" @click="abriu(g)">
            <span class="gtr__cartao-t">{{ g.titulo }}</span>
            <span class="gtr__cartao-l">{{ g.linha }}</span>
            <span class="gtr__cartao-pe">
              <span>{{ g.minutos }} min</span>
              <span v-if="feito(g)" class="gtr__cartao-feito">Aberto</span>
            </span>
          </NuxtLink>
        </li>
      </ol>
    </section>

    <section class="gtr__todos" aria-labelledby="gtr-todos">
      <h2 id="gtr-todos" class="gtr__todos-t">Todos os guias, de A a Z.</h2>
      <ul class="gtr__az">
        <li v-for="g in aZ" :key="g.chave">
          <NuxtLink v-contexto-chat="contexto(g)" :to="g.to" class="gtr__az-i" @click="abriu(g)">
            <span class="gtr__az-t">{{ g.titulo }}</span>
            <span class="gtr__az-m">{{ g.temaRotulo }} · {{ g.minutos }} min</span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.gtr { --g: clamp(22px, 5.5vw, 80px); background: var(--nu-white); animation: nu-fade .5s ease both; }

.gtr__topo { padding: clamp(40px, 5.2vw, 80px) var(--g) clamp(16px, 2vw, 24px); }
.gtr__produto { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; }
.gtr__titulo { margin: 12px 0 0; color: var(--nu-ink); font-size: clamp(38px, 5vw, 72px); font-weight: 500; letter-spacing: -0.05em; line-height: 1.02; text-wrap: balance; max-width: 18ch; }
.gtr__dek { margin: 16px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; max-width: 52ch; }
.gtr__conta { margin: 20px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }

/* ——— uma trilha ——— */
.gtr__trilha { padding: clamp(40px, 5vw, 72px) 0 0; }
.gtr__trilha + .gtr__trilha { margin-top: clamp(16px, 2vw, 24px); }
.gtr__cab { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 12px 32px; padding: 0 var(--g); }
.gtr__cab-txt { min-width: 0; }
.gtr__num { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }
.gtr__nome { margin: 6px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 500; letter-spacing: -0.035em; line-height: 1.1; }
.gtr__linha { margin: 8px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }
.gtr__meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }
.gtr__prog { min-height: 20px; color: var(--nu-ink); }

/* os passos: uma linha com os marcos e os cartões embaixo; o container rola de lado quando não cabe */
.gtr__passos {
  list-style: none; margin: 28px 0 0; padding: 0 var(--g) 8px;
  display: grid; grid-auto-flow: column; grid-auto-columns: minmax(232px, 1fr); gap: 0;
  overflow-x: auto; scroll-snap-type: x proximity; scroll-padding: 0 var(--g); scrollbar-width: none;
}
.gtr__passos::-webkit-scrollbar { display: none; }
.gtr__passo { display: flex; flex-direction: column; padding-right: 16px; scroll-snap-align: start; min-width: 0; }
.gtr__passo--fim { padding-right: 0; }
.gtr__marco { position: relative; display: flex; align-items: center; height: 32px; }
.gtr__bola {
  position: relative; z-index: 1; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px;
  border-radius: 50%; background: var(--nu-white); box-shadow: inset 0 0 0 1.5px var(--nu-cream-line);
  color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums;
  transition: background .3s, color .3s, box-shadow .3s;
}
.gtr__bola svg { width: 15px; height: 15px; }
/* o fio sai da bola e vai até a próxima (passa por baixo do respiro entre os cartões) */
.gtr__fio { position: absolute; left: 32px; right: -16px; top: 50%; height: 1.5px; margin-top: -0.75px; background: var(--nu-cream-line); transition: background .3s; }
.gtr__passo--fim .gtr__fio { display: none; }
.gtr__passo--feito .gtr__bola { background: var(--nu-ink); color: var(--nu-white); box-shadow: none; }
.gtr__passo--feito .gtr__fio { background: var(--nu-ink); }

.gtr__cartao {
  display: flex; flex-direction: column; flex: 1; margin-top: 16px; padding: 20px 20px 18px; border-radius: var(--nu-r-tile);
  background: var(--nu-cream); color: inherit; transition: transform .2s, background .2s;
}
.gtr__cartao:hover { transform: translateY(-2px); background: var(--nu-cream-hover); }
.gtr__cartao:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.gtr__cartao-t { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 600; letter-spacing: -0.015em; line-height: 1.28; text-wrap: balance; }
.gtr__cartao-l {
  margin-top: 8px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.gtr__cartao-pe { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; padding-top: 16px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums; }
.gtr__cartao-feito { color: var(--nu-ink); }

/* ——— de A a Z ——— */
.gtr__todos { margin-top: clamp(64px, 8vw, 112px); padding: clamp(48px, 6vw, 88px) var(--g) clamp(56px, 7vw, 104px); background: var(--nu-cream); }
.gtr__todos-t { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 500; letter-spacing: -0.035em; line-height: 1.1; }
.gtr__az { list-style: none; margin: 28px 0 0; padding: 0; columns: 3 280px; column-gap: clamp(28px, 4vw, 64px); }
.gtr__az li { break-inside: avoid; }
.gtr__az-i { display: flex; flex-direction: column; gap: 3px; padding: 13px 0; border-top: 1px solid var(--nu-cream-line); color: inherit; }
.gtr__az-t { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 600; line-height: 1.35; transition: color .2s; }
.gtr__az-m { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; font-variant-numeric: tabular-nums; }
.gtr__az-i:hover .gtr__az-t { color: var(--nu-blue-text); }
.gtr__az-i:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

/* ——— celular: a trilha desce na vertical ——— */
@media (max-width: 640px) {
  .gtr__meta { align-items: flex-start; }
  .gtr__passos { grid-auto-flow: row; grid-auto-columns: auto; overflow: visible; margin-top: 20px; padding-bottom: 0; }
  .gtr__passo { flex-direction: row; gap: 14px; padding: 0 0 12px; }
  .gtr__passo--fim { padding-bottom: 0; }
  .gtr__marco { flex-direction: column; align-items: center; height: auto; width: 32px; flex-shrink: 0; }
  .gtr__fio { left: 50%; right: auto; top: 32px; bottom: -12px; width: 1.5px; height: auto; margin: 0 0 0 -0.75px; }
  /* no celular o passo é só o título e o tempo: a trilha cabe numa olhada */
  .gtr__cartao { flex-direction: row; align-items: center; gap: 12px; margin-top: 0; padding: 14px 16px; }
  .gtr__cartao-t { flex: 1; min-width: 0; font-size: var(--nu-fs-md); }
  .gtr__cartao-l { display: none; }
  .gtr__cartao-pe { margin: 0; padding: 0; flex-direction: column; align-items: flex-end; gap: 2px; white-space: nowrap; }
  .gtr__passo { padding-bottom: 10px; }
  .gtr__fio { bottom: -10px; }
  .gtr__marco { padding-top: 8px; }
  .gtr__fio { top: 40px; }
}
@media (prefers-reduced-motion: reduce) {
  .gtr, .gtr__cartao, .gtr__bola, .gtr__fio { animation: none; transition: none; }
}
</style>
