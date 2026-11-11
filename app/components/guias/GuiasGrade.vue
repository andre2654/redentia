<script setup lang="ts">
// /guias: "A grade com busca" (03/11/2026), a direção que o dono escolheu
// entre três ("pode manter o 3"). A mesma linguagem da /teses. Uma barra que gruda embaixo da régua do mercado com a
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
      <NuEyebrow como="p">Guias</NuEyebrow>
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
            <span><span class="ggr__tema">{{ g.temaRotulo }}</span><span class="ggr__ponto" aria-hidden="true">·</span>{{ g.minutos }} min de leitura</span>
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
/* A grade na personalidade da Aportou (11/11/2026): creme da página, título em
   800, eyebrow com o corte, cartões creme com a sombra quente, selos de raio 8
   e fios de 1,5px. A estrutura (barra que gruda, busca, temas, grade) é a mesma. */
.ggr { --g: clamp(20px, 5.5vw, 80px); background: var(--nu-page); padding-bottom: clamp(56px, 7vw, 104px); animation: nu-fade .5s ease both; }

.ggr__topo { padding: clamp(40px, 5.2vw, 80px) var(--g) clamp(24px, 3vw, 40px); }
.ggr__titulo { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-hero); font-weight: 800; letter-spacing: -0.035em; line-height: .98; text-wrap: balance; max-width: 16ch; }
.ggr__dek { margin: 18px 0 0; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500; line-height: 1.45; max-width: 52ch; }

/* ——— a barra que gruda (a mesma da /teses) ——— */
.ggr__barra {
  position: sticky; top: calc(var(--nuh-h, 72px) + 39px); z-index: 30;
  background: color-mix(in srgb, var(--nu-page) 90%, transparent);
  -webkit-backdrop-filter: saturate(1.4) blur(14px); backdrop-filter: saturate(1.4) blur(14px);
  border-top: 1.5px solid var(--nu-line-2); border-bottom: 1.5px solid var(--nu-line-2);
  transition: top .32s cubic-bezier(.2, .8, .2, 1);
}
.ggr__barra-in { display: flex; align-items: center; gap: 12px; padding: 10px var(--g); }
.ggr__busca {
  position: relative; display: flex; align-items: center; flex: 0 1 300px; min-width: 200px; height: 44px; padding: 0 12px 0 16px; gap: 9px;
  border-radius: var(--nu-r-pill); background: var(--nu-white); color: var(--nu-gray);
  box-shadow: inset 0 0 0 1.5px var(--nu-borda-campo); transition: box-shadow .2s;
}
.ggr__busca:focus-within { box-shadow: inset 0 0 0 1.5px var(--nu-blue), 0 0 0 3px var(--nu-blue-tint); }
.ggr__busca > svg { width: 16px; height: 16px; flex-shrink: 0; }
.ggr__busca input {
  flex: 1; min-width: 0; height: 100%; border: 0; background: transparent; outline: none; color: var(--nu-ink);
  font: inherit; font-size: var(--nu-fs-sm); font-weight: 600;
}
.ggr__busca input::placeholder { color: var(--nu-gray); font-weight: 500; }
.ggr__busca input::-webkit-search-cancel-button { display: none; }
.ggr__busca-x { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; margin-right: -4px; border: 0; border-radius: 50%; background: var(--nu-cream-2); color: var(--nu-ink); cursor: pointer; transition: background .2s; }
.ggr__busca-x:hover { background: var(--nu-line); }
.ggr__busca-x svg { width: 12px; height: 12px; }
.ggr__chips {
  /* os temas rolam de lado até a borda da tela: o chip cortado na borda diz que tem mais */
  display: flex; align-items: center; gap: 8px; flex: 1 1 auto; min-width: 0; overflow-x: auto; scrollbar-width: none;
  margin-right: calc(-1 * var(--g)); padding: 3px var(--g) 3px 3px;
}
.ggr__chips::-webkit-scrollbar { display: none; }
.ggr__chip {
  display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; min-height: 44px; padding: 0 17px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-cream-2); color: var(--nu-ink); font: inherit; font-size: 14.5px; font-weight: 600; white-space: nowrap;
  cursor: pointer; transition: background .2s, color .2s, transform .15s cubic-bezier(.2, .8, .2, 1);
}
.ggr__chip:hover { background: var(--nu-line); }
.ggr__chip:active { transform: scale(.98); }
.ggr__chip--on, .ggr__chip--on:hover { background: var(--nu-ink); color: var(--nu-white); }
.ggr__chip-n { color: var(--nu-gray); font-weight: 700; font-variant-numeric: tabular-nums; }
.ggr__chip--on .ggr__chip-n { color: var(--nu-on-dark-2); }
.ggr__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.ggr__conta { margin: 0; padding: 22px var(--g) 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }

/* ——— a grade ——— */
.ggr__grade {
  list-style: none; margin: 16px 0 0; padding: 0 var(--g);
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(310px, 100%), 1fr)); gap: clamp(16px, 1.8vw, 24px);
}
.ggr__grade > li { animation: nu-fade .5s ease both; }
.ggr__grade > li:nth-child(2) { animation-delay: .06s; }
.ggr__grade > li:nth-child(3) { animation-delay: .12s; }
.ggr__grade > li:nth-child(4) { animation-delay: .18s; }
.ggr__cartao {
  display: flex; flex-direction: column; height: 100%; padding: 24px 24px 20px; border-radius: var(--nu-r-card);
  background: var(--nu-card); box-shadow: var(--nu-shadow-quente); color: inherit;
  transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s cubic-bezier(.2, .8, .2, 1);
}
.ggr__cartao:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-quente), var(--nu-shadow-card); }
.ggr__sobre { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 28px; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 600; font-variant-numeric: tabular-nums; }
.ggr__tema { color: var(--nu-ink); font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; }
.ggr__ponto { margin: 0 8px; color: var(--nu-sand); }
.ggr__novo { display: inline-flex; align-items: center; height: 28px; padding: 0 10px; border-radius: var(--nu-r-tag); background: var(--nu-blue-bg); color: var(--nu-blue-text); font-size: 13.5px; font-weight: 700; white-space: nowrap; }
.ggr__nome { margin-top: 14px; color: var(--nu-ink); font-size: clamp(22px, 1.9vw, 26px); font-weight: 800; letter-spacing: -0.025em; line-height: 1.1; text-wrap: balance; }
.ggr__frase { margin-top: 10px; color: var(--nu-gray-3); font-size: 15.5px; font-weight: 500; line-height: 1.5; }
.ggr__sumario { display: flex; flex-direction: column; margin-top: 18px; padding: 4px 16px; border-radius: var(--nu-r-tile); background: var(--nu-page); }
.ggr__sumario-i {
  display: flex; gap: 12px; padding: 10px 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.4;
}
.ggr__sumario-s { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ggr__sumario-i + .ggr__sumario-i { border-top: 1.5px solid var(--nu-line-2); }
.ggr__sumario-n { flex-shrink: 0; width: 12px; color: var(--nu-blue-text); font-weight: 800; font-variant-numeric: tabular-nums; }
.ggr__pe {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: auto; padding-top: 18px;
  color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums;
}
.ggr__seta { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; background: var(--nu-ink); color: var(--nu-white); transition: background .2s; }
.ggr__seta svg { width: 16px; height: 16px; transition: transform .25s cubic-bezier(.2, .8, .2, 1); }
.ggr__cartao:hover .ggr__seta { background: var(--nu-blue); }
.ggr__cartao:hover .ggr__seta svg { transform: translateX(3px); }

.ggr__vazio { padding: 40px var(--g) 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; }
.ggr__vazio p { margin: 0; }
.ggr__limpar {
  margin-top: 16px; min-height: 48px; padding: 0 22px; border: 0; border-radius: var(--nu-r-pill); background: var(--nu-ink); color: var(--nu-white);
  font: inherit; font-size: var(--nu-fs-md); font-weight: 700; cursor: pointer; transition: background .2s, transform .15s cubic-bezier(.2, .8, .2, 1);
}
.ggr__limpar:hover { background: var(--nu-ink-hover); }
.ggr__limpar:active { transform: scale(.98); }

@media (max-width: 640px) { .ggr__barra { top: calc(var(--nuh-h, 52px) + 29px); } }
@media (max-width: 900px) {
  .ggr__barra-in { flex-direction: column; align-items: stretch; gap: 8px; padding: 10px 0; }
  .ggr__busca { flex: 0 0 auto; margin: 0 var(--g); }
  .ggr__chips { margin-right: 0; padding: 3px var(--g); }
}
@media (max-width: 560px) {
  .ggr__conta-rev { display: none; }
  /* no celular o cartão é tema, título e uma linha: o sumário fica no guia */
  .ggr__sumario { display: none; }
  .ggr__cartao { padding: 22px 20px 18px; }
  .ggr__tema { letter-spacing: 0.1em; }
  .ggr__sobre { align-items: flex-start; }
}
@media (prefers-reduced-motion: reduce) {
  .ggr, .ggr__grade > li, .ggr__cartao, .ggr__barra, .ggr__seta svg { animation: none; transition: none; }
}
</style>
