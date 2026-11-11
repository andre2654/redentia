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

// ROBUSTEZ (11/11/2026): os temas são o NuTrilho da base (escolher um entre
// poucos, com a contagem; a escolhida desliza e o trilho rola de lado no
// celular), o tema e o "Mais novo" são NuSelo, e a troca de filtro anima: os
// cartões que ficam deslizam até o lugar novo (FLIP do TransitionGroup, em
// --nu-dur-lenta --nu-ease-troca), os que saem saem na hora (a resposta vem
// antes de 100ms) e os que chegam sobem num fade. A primeira fileira chega com a
// página, em cascata; depois do primeiro filtro a cascata não roda de novo. A
// barra gruda logo abaixo da régua pela altura que ela publica (--nut-h): sem
// régua, sem vão.
const mexeu = ref(false)
watch([tema, termo], () => { mexeu.value = true })
const opcoesTema = computed(() => [
  { valor: 'todos' as const, rotulo: 'Todos', contagem: total.value },
  ...b.value.temas.map((t) => ({ valor: t.id, rotulo: t.rotulo, contagem: t.itens.length })),
])
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
        <NuTrilho v-model="tema" :opcoes="opcoesTema" tamanho="p" rotulo="Filtrar por tema" class="ggr__temas" />
      </div>
    </div>

    <p class="ggr__conta" aria-live="polite">
      {{ visiveis.length === total ? `${total} guias` : `${visiveis.length} de ${total} guias` }}<span v-if="b.atualizadoEm" class="ggr__conta-rev"> · revistos até {{ b.atualizadoEm }}</span>
    </p>

    <TransitionGroup v-if="visiveis.length" tag="ul" name="ggr-cartao" class="ggr__grade" :class="{ 'ggr__grade--mexeu': mexeu }">
      <li v-for="g in visiveis" :key="g.chave">
        <NuxtLink v-contexto-chat="contexto(g)" :to="g.to" class="ggr__cartao">
          <span class="ggr__sobre">
            <span class="ggr__sobre-e"><NuSelo>{{ g.temaRotulo }}</NuSelo><span class="ggr__tempo">{{ g.minutos }} min<span class="ggr__tempo-l"> de leitura</span></span></span>
            <NuSelo v-if="g === b.destaque" tom="azul">Mais novo</NuSelo>
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
    </TransitionGroup>
    <div v-else class="ggr__vazio">
      <p>Nenhum guia com “{{ termo }}”{{ tema !== 'todos' ? ' neste tema' : '' }}. Tente outra palavra.</p>
      <p class="ggr__limpar"><NuLinkSeta @click="limpar">Ver todos os guias</NuLinkSeta></p>
    </div>
  </div>
</template>

<style scoped>
/* A grade na personalidade da Aportou (11/11/2026): creme da página, título em
   800, eyebrow com o corte, cartões creme com a sombra quente, selos de raio 8
   e fios de 1,5px. A estrutura (barra que gruda, busca, temas, grade) é a mesma.
   Robustez (11/11/2026): a coluna do site (--nu-coluna), tudo em token. */
.ggr { --g: var(--nu-coluna); background: var(--nu-page); padding-bottom: clamp(72px, 8vw, 128px); }

.ggr__topo { padding: clamp(40px, 5.2vw, 80px) var(--g) clamp(24px, 3vw, 40px); animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both; }
.ggr__titulo { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-hero); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: .98; text-wrap: balance; max-width: 16ch; }
.ggr__dek { margin: 18px 0 0; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-texto); line-height: 1.45; max-width: 52ch; }

/* ——— a barra que gruda logo abaixo da régua (a altura que ela publica; sem régua, sem vão) ——— */
.ggr__barra {
  position: sticky; top: calc(var(--nuh-h, 72px) + var(--nut-h, 40px) - 1px); z-index: 30;
  background: color-mix(in srgb, var(--nu-page) 90%, transparent);
  -webkit-backdrop-filter: saturate(1.4) blur(14px); backdrop-filter: saturate(1.4) blur(14px);
  border-top: 1px solid var(--nu-line-2); border-bottom: 1px solid var(--nu-line-2);
  transition: top .32s var(--nu-ease-saida);
}
.ggr__barra-in { display: flex; align-items: center; gap: 12px; padding: 10px var(--g); }
.ggr__busca {
  /* a busca cede primeiro (até 200px): em 1440 os temas cabem todos na coluna */
  position: relative; display: flex; align-items: center; flex: 0 1000 300px; min-width: 200px; height: 44px; padding: 0 12px 0 16px; gap: 9px;
  border-radius: var(--nu-r-pill); background: var(--nu-white); color: var(--nu-gray);
  box-shadow: inset 0 0 0 1.5px var(--nu-borda-campo);
  transition: box-shadow var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor);
}
.ggr__busca:hover { box-shadow: inset 0 0 0 1.5px var(--nu-gray); }
.ggr__busca:focus-within { color: var(--nu-ink); box-shadow: inset 0 0 0 1.5px var(--nu-blue), 0 0 0 3px var(--nu-blue-tint); }
.ggr__busca > svg { width: 16px; height: 16px; flex-shrink: 0; }
.ggr__busca input {
  flex: 1; min-width: 0; height: 100%; border: 0; background: transparent; outline: none; color: var(--nu-ink);
  font: inherit; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio);
}
.ggr__busca input::placeholder { color: var(--nu-gray); font-weight: var(--nu-w-texto); }
.ggr__busca input::-webkit-search-cancel-button { display: none; }
.ggr__busca-x {
  position: relative; display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; margin-right: -4px;
  border: 0; border-radius: 50%; background: var(--nu-cream-2); color: var(--nu-ink); cursor: pointer;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
  animation: nu-surgir var(--nu-dur-media) var(--nu-ease-cor) both;
}
/* o desenho tem 28px; o toque, 44px */
.ggr__busca-x::before { content: ''; position: absolute; inset: -8px; }
.ggr__busca-x:hover { background: var(--nu-line); }
.ggr__busca-x:active { transform: scale(.9); }
.ggr__busca-x svg { width: 12px; height: 12px; }
/* os temas (NuTrilho): ocupam o resto da linha e rolam por dentro quando não cabem */
.ggr__temas { flex: 0 1 auto; min-width: 0; }
.ggr__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.ggr__conta { margin: 0; padding: 24px var(--g) 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); font-variant-numeric: tabular-nums; }

/* ——— a grade ——— */
.ggr__grade {
  list-style: none; margin: 16px 0 0; padding: 0 var(--g);
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(310px, 100%), 1fr)); gap: clamp(16px, 1.8vw, 24px);
}
/* a primeira fileira chega com a página, em cascata de 60ms (só na chegada) */
.ggr__grade:not(.ggr__grade--mexeu) > li:nth-child(-n+3) { animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both; }
.ggr__grade:not(.ggr__grade--mexeu) > li:nth-child(2) { animation-delay: var(--nu-passo-cascata); }
.ggr__grade:not(.ggr__grade--mexeu) > li:nth-child(3) { animation-delay: calc(var(--nu-passo-cascata) * 2); }
/* a troca de filtro: quem sai sai na hora, quem fica desliza até o lugar novo, quem chega sobe num fade */
.ggr-cartao-leave-active { display: none; }
.ggr-cartao-move { transition: transform var(--nu-dur-lenta) var(--nu-ease-troca); }
.ggr-cartao-enter-active { transition: opacity var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-lenta) var(--nu-ease-saida); }
.ggr-cartao-enter-from { opacity: 0; transform: translateY(8px); }
.ggr__cartao {
  display: flex; flex-direction: column; height: 100%; padding: 24px 24px 20px; border-radius: var(--nu-r-card);
  background: var(--nu-card); box-shadow: var(--nu-shadow-quente); color: inherit; -webkit-tap-highlight-color: transparent;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
@media (hover: hover) { .ggr__cartao:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); } }
.ggr__cartao:active { transform: scale(.995); transition-duration: var(--nu-dur-rapida); }
.ggr__cartao:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.ggr__sobre { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 28px; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-texto); font-variant-numeric: tabular-nums; }
.ggr__sobre-e { display: inline-flex; align-items: center; gap: 10px; min-width: 0; }
.ggr__tempo { white-space: nowrap; }
.ggr__nome { margin-top: 16px; color: var(--nu-ink); font-size: clamp(22px, 1.9vw, 26px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.12; text-wrap: balance; }
.ggr__frase { margin-top: 10px; color: var(--nu-gray-3); font-size: 15.5px; font-weight: var(--nu-w-texto); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ggr__sumario { display: flex; flex-direction: column; margin-top: 18px; padding: 4px 16px; border-radius: var(--nu-r-tile); background: var(--nu-page); }
.ggr__sumario-i {
  display: flex; gap: 12px; padding: 10px 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.4;
}
.ggr__sumario-s { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ggr__sumario-i + .ggr__sumario-i { border-top: 1px solid var(--nu-line-2); }
.ggr__sumario-n { flex-shrink: 0; width: 12px; color: var(--nu-blue-text); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }
.ggr__pe {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: auto; padding-top: 18px;
  color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); font-variant-numeric: tabular-nums;
}
.ggr__seta {
  display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%;
  background: var(--nu-ink); color: var(--nu-white);
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--nu-ease-saida);
}
.ggr__seta svg { width: 16px; height: 16px; transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.ggr__cartao:hover .ggr__seta { background: var(--nu-blue); transform: scale(1.04); }
.ggr__cartao:hover .ggr__seta svg { transform: translateX(2px); }

.ggr__vazio { padding: 40px var(--g) 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both; }
.ggr__vazio p { margin: 0; }
.ggr__vazio .ggr__limpar { margin-top: 12px; }

@media (max-width: 900px) {
  .ggr__barra-in { flex-direction: column; align-items: stretch; gap: 8px; padding: 10px var(--g); }
  .ggr__busca { flex: 0 0 auto; }
  .ggr__temas { align-self: flex-start; max-width: 100%; }
}
@media (max-width: 560px) {
  .ggr__conta-rev { display: none; }
  /* no celular o cartão é tema, título e uma linha: o sumário fica no guia */
  .ggr__sumario { display: none; }
  .ggr__cartao { padding: 22px 20px 18px; }
  .ggr__tempo-l { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ggr__topo, .ggr__grade > li, .ggr__vazio, .ggr__busca-x { animation: none; }
  .ggr__cartao, .ggr__barra, .ggr__seta, .ggr__seta svg, .ggr-cartao-move, .ggr-cartao-enter-active { transition: none; }
}
</style>
