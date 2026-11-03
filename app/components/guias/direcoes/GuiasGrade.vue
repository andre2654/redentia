<script setup lang="ts">
// /guias, direção 3 (protótipo de 02/11/2026): "A grade com busca", a mesma
// linguagem da /teses. Uma barra que gruda embaixo da régua do mercado com a
// busca (título, linha, tema e os títulos das seções) e os temas com a
// contagem; embaixo, cartões ricos: tema e tempo, o título, uma linha e o
// começo do sumário do guia. No celular vira um feed vertical e os temas rolam
// de lado. Filtro e busca agem só no cliente: o SSR sai com todos os guias.
import type { BibliotecaGuias, GuiaItemVM, GuiaTemaId } from '~/utils/guiasHub'

const props = defineProps<{ biblioteca: BibliotecaGuias }>()
const b = computed(() => props.biblioteca)

const tema = ref<GuiaTemaId | 'todos'>('todos')
const termo = ref('')
const porTema = computed(() => (tema.value === 'todos' ? b.value.itens : b.value.itens.filter((g) => g.tema === tema.value)))
// o mais novo abre a grade; o resto segue a ordem do registry
const ordenados = computed(() => {
  const d = b.value.destaque
  const l = porTema.value
  return d && l.includes(d) ? [d, ...l.filter((g) => g !== d)] : l
})
const visiveis = computed(() => guiasBuscar(ordenados.value, termo.value))
const total = computed(() => b.value.itens.length)
function limpar() { tema.value = 'todos'; termo.value = '' }

const contexto = (g: GuiaItemVM) => ({ id: `guia:${g.to}`, tipo: 'secao', rotulo: rotuloCurto(g.titulo) })
const SUMARIO = 3
</script>

<template>
  <div class="ggr">
    <header class="ggr__topo">
      <p class="ggr__produto">Guias</p>
      <h1 class="ggr__titulo">Guias para investir melhor.</h1>
      <p class="ggr__dek">Do primeiro aporte à carteira que paga suas contas, em português claro.</p>
    </header>

    <div class="ggr__barra">
      <div class="ggr__barra-in">
        <label class="ggr__busca">
          <span class="ggr__sr">Buscar nos guias</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input v-model="termo" type="search" placeholder="Buscar nos guias" autocomplete="off" enterkeyhint="search">
          <button v-if="termo" type="button" class="ggr__busca-x" aria-label="Limpar a busca" @click="termo = ''">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </label>
        <div class="ggr__chips" role="group" aria-label="Filtrar por tema">
          <button type="button" class="ggr__chip" :class="{ 'ggr__chip--on': tema === 'todos' }" :aria-pressed="tema === 'todos'" @click="tema = 'todos'">Todos<span class="ggr__chip-n">{{ total }}</span></button>
          <button
            v-for="t in b.temas" :key="t.id" type="button" class="ggr__chip" :class="{ 'ggr__chip--on': tema === t.id }"
            :aria-pressed="tema === t.id" @click="tema = t.id"
          >{{ t.rotulo }}<span class="ggr__chip-n">{{ t.itens.length }}</span></button>
        </div>
      </div>
    </div>

    <p class="ggr__conta" aria-live="polite">
      {{ visiveis.length === total ? `${total} guias` : `${visiveis.length} de ${total} guias` }}<span v-if="b.atualizadoEm" class="ggr__conta-rev"> · revistos até {{ b.atualizadoEm }}</span>
    </p>

    <ul v-if="visiveis.length" class="ggr__grade">
      <li v-for="g in visiveis" :key="g.chave">
        <NuxtLink v-contexto-chat="contexto(g)" :to="g.to" class="ggr__cartao">
          <span class="ggr__sobre">
            <span>{{ g.temaRotulo }}<span class="ggr__ponto" aria-hidden="true">·</span>{{ g.minutos }} min de leitura</span>
            <span v-if="g === b.destaque" class="ggr__novo">Mais novo</span>
          </span>
          <span class="ggr__nome">{{ g.titulo }}</span>
          <span class="ggr__frase">{{ g.linha }}</span>
          <span v-if="g.secoes.length" class="ggr__sumario">
            <span v-for="(s, i) in g.secoes.slice(0, SUMARIO)" :key="s" class="ggr__sumario-i"><span class="ggr__sumario-n">{{ i + 1 }}</span><span class="ggr__sumario-s">{{ s }}</span></span>
          </span>
          <span class="ggr__pe">
            <span>{{ g.secoes.length }} seções<template v-if="g.mesAno"> · {{ g.mesAno }}</template></span>
            <span class="ggr__seta" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
          </span>
        </NuxtLink>
      </li>
    </ul>
    <div v-else class="ggr__vazio">
      <p>Nenhum guia com “{{ termo }}”{{ tema !== 'todos' ? ' neste tema' : '' }}. Tente outra palavra.</p>
      <button type="button" class="ggr__limpar" @click="limpar">Ver todos os guias</button>
    </div>
  </div>
</template>

<style scoped>
.ggr { --g: clamp(22px, 5.5vw, 80px); background: var(--nu-white); padding-bottom: clamp(56px, 7vw, 104px); animation: nu-fade .5s ease both; }

.ggr__topo { padding: clamp(40px, 5.2vw, 80px) var(--g) clamp(24px, 3vw, 40px); }
.ggr__produto { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; }
.ggr__titulo { margin: 12px 0 0; color: var(--nu-ink); font-size: clamp(38px, 5vw, 72px); font-weight: 500; letter-spacing: -0.05em; line-height: 1.02; text-wrap: balance; max-width: 18ch; }
.ggr__dek { margin: 16px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; max-width: 52ch; }

/* ——— a barra que gruda (a mesma da /teses) ——— */
.ggr__barra {
  position: sticky; top: calc(var(--nuh-h, 72px) + 39px); z-index: 30;
  background: color-mix(in srgb, var(--nu-white) 90%, transparent);
  -webkit-backdrop-filter: saturate(1.4) blur(14px); backdrop-filter: saturate(1.4) blur(14px);
  border-top: 1px solid var(--nu-cream-line); border-bottom: 1px solid var(--nu-cream-line);
  transition: top .32s cubic-bezier(.2, .8, .2, 1);
}
.ggr__barra-in { display: flex; align-items: center; gap: 12px; padding: 12px var(--g); }
.ggr__busca {
  position: relative; display: flex; align-items: center; flex: 0 0 300px; height: 38px; padding: 0 12px 0 14px; gap: 9px;
  border-radius: var(--nu-r-pill); background: var(--nu-cream); color: var(--nu-gray); transition: box-shadow .2s, background .2s;
}
.ggr__busca:focus-within { background: var(--nu-white); box-shadow: inset 0 0 0 1.5px var(--nu-blue); }
.ggr__busca > svg { width: 16px; height: 16px; flex-shrink: 0; }
.ggr__busca input {
  flex: 1; min-width: 0; height: 100%; border: 0; background: transparent; outline: none; color: var(--nu-ink);
  font: inherit; font-size: var(--nu-fs-sm); font-weight: 600;
}
.ggr__busca input::placeholder { color: var(--nu-gray); font-weight: 500; }
.ggr__busca input::-webkit-search-cancel-button { display: none; }
.ggr__busca-x { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; margin-right: -4px; border: 0; border-radius: 50%; background: var(--nu-sand-2); color: var(--nu-ink); cursor: pointer; }
.ggr__busca-x svg { width: 12px; height: 12px; }
.ggr__busca-x:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.ggr__chips { display: flex; align-items: center; gap: 8px; min-width: 0; overflow-x: auto; scrollbar-width: none; }
.ggr__chips::-webkit-scrollbar { display: none; }
.ggr__chip {
  display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; height: 38px; padding: 0 16px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; white-space: nowrap;
  cursor: pointer; transition: background .2s, color .2s;
}
.ggr__chip:hover { background: var(--nu-cream-hover); box-shadow: inset 0 0 0 1px var(--nu-cream-line); }
.ggr__chip--on, .ggr__chip--on:hover { background: var(--nu-ink); color: var(--nu-white); box-shadow: none; }
.ggr__chip:focus-visible, .ggr__limpar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.ggr__chip-n { color: var(--nu-gray); font-weight: 700; font-variant-numeric: tabular-nums; }
.ggr__chip--on .ggr__chip-n { color: var(--nu-cream-text-60); }
.ggr__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.ggr__conta { margin: 0; padding: 20px var(--g) 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }

/* ——— a grade ——— */
.ggr__grade {
  list-style: none; margin: 16px 0 0; padding: 0 var(--g);
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(310px, 100%), 1fr)); gap: clamp(16px, 1.8vw, 24px);
}
.ggr__cartao {
  display: flex; flex-direction: column; height: 100%; padding: 22px 22px 18px; border-radius: var(--nu-r-card);
  background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-cream-line); color: inherit;
  transition: transform .2s, box-shadow .2s;
}
.ggr__cartao:hover { transform: translateY(-2px); box-shadow: inset 0 0 0 1px var(--nu-cream-line), var(--nu-shadow-card); }
.ggr__cartao:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
.ggr__sobre { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 26px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums; }
.ggr__ponto { margin: 0 7px; color: var(--nu-sand); }
.ggr__novo { display: inline-flex; align-items: center; height: 26px; padding: 0 11px; border-radius: var(--nu-r-pill); background: var(--nu-blue-bg, var(--nu-cream)); color: var(--nu-blue-text); font-size: var(--nu-fs-xs); font-weight: 700; }
.ggr__nome { margin-top: 12px; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 600; letter-spacing: -0.03em; line-height: 1.18; text-wrap: balance; }
.ggr__frase { margin-top: 8px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.ggr__sumario { display: flex; flex-direction: column; margin-top: 18px; padding: 4px 14px; border-radius: var(--nu-r-tile); background: var(--nu-cream); }
.ggr__sumario-i {
  display: flex; gap: 10px; padding: 9px 0; color: var(--nu-ink); font-size: var(--nu-fs-dense); font-weight: 500; line-height: 1.4;
}
.ggr__sumario-s { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ggr__sumario-i + .ggr__sumario-i { border-top: 1px solid var(--nu-cream-line); }
.ggr__sumario-n { flex-shrink: 0; width: 12px; color: var(--nu-sand); font-weight: 700; font-variant-numeric: tabular-nums; }
.ggr__pe {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: auto; padding-top: 18px;
  color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums;
}
.ggr__seta { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background: var(--nu-cream); color: var(--nu-ink); transition: background .2s, color .2s; }
.ggr__seta svg { width: 14px; height: 14px; }
.ggr__cartao:hover .ggr__seta { background: var(--nu-ink); color: var(--nu-white); }

.ggr__vazio { padding: 40px var(--g) 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; }
.ggr__vazio p { margin: 0; }
.ggr__limpar {
  margin-top: 16px; height: 44px; padding: 0 20px; border: 0; border-radius: var(--nu-r-pill); background: var(--nu-ink); color: var(--nu-white);
  font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer;
}

@media (max-width: 1100px) { .ggr__busca { flex-basis: 240px; } }
@media (max-width: 640px) { .ggr__barra { top: calc(var(--nuh-h, 52px) + 29px); } }
@media (max-width: 900px) {
  .ggr__barra-in { flex-direction: column; align-items: stretch; gap: 10px; padding: 10px 0; }
  .ggr__busca { flex: 0 0 auto; margin: 0 var(--g); }
  .ggr__chips { padding: 0 var(--g); }
  .ggr__chip { height: 34px; padding: 0 14px; }
  .ggr__nome { font-size: var(--nu-fs-xl); }
}
@media (max-width: 560px) {
  .ggr__conta-rev { display: none; }
  .ggr__sumario-i:nth-child(n + 3) { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ggr, .ggr__cartao, .ggr__barra { animation: none; transition: none; }
}
</style>
