<script setup lang="ts">
// /guias, direção 1 (protótipo de 02/11/2026): "A biblioteca". O guia mais
// novo abre a página com o próprio sumário ao lado; embaixo, todos os guias
// por tema em linhas calmas (título, uma linha, tempo de leitura e mês da
// revisão), com o índice dos temas na lateral no computador e numa barra que
// gruda no celular. Tudo vem no SSR: os links estão no HTML da 1ª resposta.
import type { BibliotecaGuias, GuiaItemVM } from '~/utils/guiasHub'

const props = defineProps<{ biblioteca: BibliotecaGuias }>()
const b = computed(() => props.biblioteca)
const destaque = computed(() => b.value.destaque)
const SUMARIO_MAX = 6

const contexto = (g: GuiaItemVM) => ({ id: `guia:${g.to}`, tipo: 'secao', rotulo: rotuloCurto(g.titulo) })
const meta = (g: GuiaItemVM) => [`${g.minutos} min`, g.mesAno].filter(Boolean).join(' · ')

// o tema à vista acende no índice (só no cliente; sem JS o índice é âncora pura):
// o último tema cujo topo já passou de 35% da tela, ou o primeiro
const ativo = ref<string>(b.value.temas[0]?.id ?? '')
let quadro = 0
function medir() {
  quadro = 0
  const linha = window.innerHeight * 0.35
  let atual = b.value.temas[0]?.id ?? ''
  for (const t of b.value.temas) {
    const el = document.getElementById(`tema-${t.id}`)
    if (el && el.getBoundingClientRect().top < linha) atual = t.id
  }
  ativo.value = atual
}
const aoRolar = () => { if (!quadro) quadro = requestAnimationFrame(medir) }
onMounted(() => { medir(); window.addEventListener('scroll', aoRolar, { passive: true }) })
// na barra do celular, o chip do tema à vista rola para dentro do quadro
const barra = ref<HTMLElement | null>(null)
watch(ativo, (id) => {
  const el = barra.value?.querySelector<HTMLElement>(`[data-tema="${id}"]`)
  const box = barra.value
  if (!el || !box || box.scrollWidth <= box.clientWidth) return
  const alvo = el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2
  box.scrollTo({ left: Math.max(0, alvo), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
})
onBeforeUnmount(() => { window.removeEventListener('scroll', aoRolar); if (quadro) cancelAnimationFrame(quadro) })
</script>

<template>
  <div class="gbi">
    <header class="gbi__topo">
      <p class="gbi__produto">Guias</p>
      <h1 class="gbi__titulo">Guias para investir melhor.</h1>
      <p class="gbi__dek">Do primeiro aporte à carteira que paga suas contas, em português claro.</p>
      <p class="gbi__conta">{{ b.itens.length }} guias em {{ b.temas.length }} temas<template v-if="b.atualizadoEm"> · revistos até {{ b.atualizadoEm }}</template></p>
    </header>

    <!-- o mais novo, com o sumário dele -->
    <section v-if="destaque" class="gbi__novo" aria-labelledby="gbi-novo">
      <NuxtLink v-contexto-chat="contexto(destaque)" :to="destaque.to" class="gbi__novo-in">
        <span class="gbi__novo-txt">
          <span class="gbi__novo-r"><span class="gbi__novo-selo">O mais novo</span>{{ destaque.temaRotulo }} · {{ destaque.minutos }} min de leitura</span>
          <span id="gbi-novo" class="gbi__novo-t">{{ destaque.titulo }}</span>
          <span v-if="destaque.resumo" class="gbi__novo-resumo">{{ destaque.resumo }}</span>
          <span class="gbi__novo-cta">Ler o guia<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
        </span>
        <span v-if="destaque.secoes.length" class="gbi__sumario">
          <span class="gbi__sumario-r">Neste guia</span>
          <span class="gbi__sumario-l">
            <span v-for="(s, i) in destaque.secoes.slice(0, SUMARIO_MAX)" :key="s" class="gbi__sumario-i">
              <span class="gbi__sumario-n">{{ String(i + 1).padStart(2, '0') }}</span>{{ s }}
            </span>
          </span>
          <span v-if="destaque.secoes.length > SUMARIO_MAX" class="gbi__sumario-mais">e mais {{ destaque.secoes.length - SUMARIO_MAX }} {{ destaque.secoes.length - SUMARIO_MAX === 1 ? 'seção' : 'seções' }}</span>
        </span>
      </NuxtLink>
    </section>

    <!-- tablet e celular: o índice dos temas gruda embaixo da régua -->
    <nav class="gbi__barra" aria-label="Temas dos guias">
      <div ref="barra" class="gbi__barra-in">
        <a v-for="t in b.temas" :key="t.id" :data-tema="t.id" :href="`#tema-${t.id}`" class="gbi__chip" :class="{ 'gbi__chip--on': ativo === t.id }">{{ t.rotulo }}<span class="gbi__chip-n">{{ t.itens.length }}</span></a>
      </div>
    </nav>

    <div class="gbi__corpo">
      <nav class="gbi__indice" aria-label="Temas">
        <p class="gbi__indice-r">Temas</p>
        <a v-for="t in b.temas" :key="t.id" :href="`#tema-${t.id}`" class="gbi__indice-i" :class="{ 'gbi__indice-i--on': ativo === t.id }" :aria-current="ativo === t.id ? 'true' : undefined">
          <span>{{ t.rotulo }}</span><span class="gbi__indice-n">{{ t.itens.length }}</span>
        </a>
      </nav>

      <div class="gbi__temas">
        <section v-for="t in b.temas" :id="`tema-${t.id}`" :key="t.id" class="gbi__tema" :aria-labelledby="`gbi-t-${t.id}`">
          <div class="gbi__tema-topo">
            <h2 :id="`gbi-t-${t.id}`" class="gbi__tema-t">{{ t.rotulo }}</h2>
            <p class="gbi__tema-l">{{ t.linha }}</p>
          </div>
          <ul class="gbi__linhas">
            <li v-for="g in t.itens" :key="g.chave">
              <NuxtLink v-contexto-chat="contexto(g)" :to="g.to" class="gbi__linha">
                <span class="gbi__linha-txt">
                  <span class="gbi__linha-t">{{ g.titulo }}</span>
                  <span class="gbi__linha-l">{{ g.linha }}</span>
                </span>
                <span class="gbi__linha-meta">{{ meta(g) }}</span>
                <svg class="gbi__linha-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
              </NuxtLink>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gbi {
  --g: clamp(22px, 5.5vw, 80px);
  /* header + régua do mercado (40 px; 30 no celular) */
  --topo: calc(var(--nuh-h, 72px) + 39px);
  background: var(--nu-white); padding-bottom: clamp(56px, 7vw, 104px); animation: nu-fade .5s ease both;
}

.gbi__topo { padding: clamp(40px, 5.2vw, 80px) var(--g) clamp(28px, 3.4vw, 48px); }
.gbi__produto { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; }
.gbi__titulo { margin: 12px 0 0; color: var(--nu-ink); font-size: clamp(38px, 5vw, 72px); font-weight: 500; letter-spacing: -0.05em; line-height: 1.02; text-wrap: balance; max-width: 18ch; }
.gbi__dek { margin: 16px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; max-width: 52ch; }
.gbi__conta { margin: 20px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }

/* ——— o mais novo ——— */
.gbi__novo { padding: 0 var(--g); }
.gbi__novo-in {
  display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: clamp(28px, 5vw, 80px);
  padding: clamp(28px, 4vw, 56px); border-radius: var(--nu-r-card); background: var(--nu-cream); color: inherit;
  transition: transform .2s, box-shadow .2s;
}
.gbi__novo-in:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.gbi__novo-in:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
.gbi__novo-txt { display: flex; flex-direction: column; min-width: 0; }
.gbi__novo-r { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; }
.gbi__novo-selo {
  display: inline-flex; align-items: center; height: 26px; padding: 0 11px; border-radius: var(--nu-r-pill);
  background: var(--nu-white); color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: 700;
}
.gbi__novo-t { display: block; margin-top: 18px; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 500; letter-spacing: -0.04em; line-height: 1.06; text-wrap: balance; }
.gbi__novo-resumo { display: block; margin-top: 16px; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6; max-width: 58ch; }
.gbi__novo-cta {
  display: inline-flex; align-items: center; gap: 10px; align-self: flex-start; height: 44px; padding: 0 20px; margin-top: 28px;
  border-radius: var(--nu-r-pill); background: var(--nu-ink); color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: 700;
}
.gbi__novo-cta svg { width: 15px; height: 15px; transition: transform .2s; }
.gbi__novo-in:hover .gbi__novo-cta svg { transform: translateX(3px); }
.gbi__sumario { display: flex; flex-direction: column; align-self: center; min-width: 0; }
.gbi__sumario-r { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; }
.gbi__sumario-l { display: flex; flex-direction: column; margin-top: 10px; }
.gbi__sumario-i {
  display: flex; gap: 14px; padding: 11px 0; border-top: 1px solid var(--nu-cream-line);
  color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45;
}
.gbi__sumario-n { flex-shrink: 0; width: 20px; color: var(--nu-sand); font-weight: 700; font-variant-numeric: tabular-nums; }
.gbi__sumario-mais { padding-top: 11px; border-top: 1px solid var(--nu-cream-line); color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }

/* ——— barra dos temas (só abaixo de 1100) ——— */
.gbi__barra {
  display: none; position: sticky; top: var(--topo); z-index: 30; margin-top: clamp(32px, 4vw, 48px);
  background: color-mix(in srgb, var(--nu-white) 90%, transparent);
  -webkit-backdrop-filter: saturate(1.4) blur(14px); backdrop-filter: saturate(1.4) blur(14px);
  border-top: 1px solid var(--nu-cream-line); border-bottom: 1px solid var(--nu-cream-line);
}
.gbi__barra-in { position: relative; display: flex; gap: 8px; padding: 10px var(--g); overflow-x: auto; scrollbar-width: none; }
.gbi__barra-in::-webkit-scrollbar { display: none; }
.gbi__chip {
  display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; height: 36px; padding: 0 14px; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 600; white-space: nowrap; transition: background .2s, color .2s;
}
.gbi__chip:hover { background: var(--nu-cream-hover); }
.gbi__chip--on, .gbi__chip--on:hover { background: var(--nu-ink); color: var(--nu-white); }
.gbi__chip-n { color: var(--nu-gray); font-weight: 700; font-variant-numeric: tabular-nums; }
.gbi__chip--on .gbi__chip-n { color: var(--nu-cream-text-60); }
.gbi__chip:focus-visible, .gbi__indice-i:focus-visible, .gbi__linha:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

/* ——— o corpo: índice + temas ——— */
.gbi__corpo {
  display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: clamp(40px, 5vw, 96px);
  padding: clamp(48px, 6vw, 88px) var(--g) 0;
}
.gbi__indice { position: sticky; top: calc(var(--topo) + 32px); align-self: start; display: flex; flex-direction: column; }
.gbi__indice-r { margin: 0 0 10px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; }
.gbi__indice-i {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; height: 40px; padding: 0 12px; margin: 0 -12px;
  border-radius: var(--nu-r-chip); color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 600; transition: background .2s, color .2s;
}
.gbi__indice-i:hover { background: var(--nu-cream); color: var(--nu-ink); }
.gbi__indice-i--on { color: var(--nu-ink); background: var(--nu-cream); }
.gbi__indice-n { color: var(--nu-gray); font-weight: 700; font-variant-numeric: tabular-nums; }

.gbi__temas { display: flex; flex-direction: column; gap: clamp(48px, 5.5vw, 80px); min-width: 0; }
.gbi__tema { scroll-margin-top: calc(var(--topo) + 32px); }
.gbi__tema-topo { display: flex; flex-direction: column; gap: 8px; padding-bottom: 20px; }
.gbi__tema-t { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 500; letter-spacing: -0.035em; line-height: 1.1; }
.gbi__tema-l { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }

.gbi__linhas { list-style: none; margin: 0; padding: 0; border-bottom: 1px solid var(--nu-cream-line); }
.gbi__linha {
  display: grid; grid-template-columns: minmax(0, 1fr) auto 16px; align-items: center; gap: 24px;
  min-height: 76px; padding: 16px 0; border-top: 1px solid var(--nu-cream-line); color: inherit;
}
.gbi__linha-txt { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.gbi__linha-t { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 600; letter-spacing: -0.015em; line-height: 1.3; transition: color .2s; }
.gbi__linha-l { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gbi__linha-meta { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; text-align: right; }
.gbi__linha-seta { width: 16px; height: 16px; color: var(--nu-sand); transition: transform .2s, color .2s; }
.gbi__linha:hover .gbi__linha-t { color: var(--nu-blue-text); }
.gbi__linha:hover .gbi__linha-seta { color: var(--nu-ink); transform: translateX(3px); }

@media (max-width: 1100px) {
  .gbi__barra { display: block; }
  .gbi__indice { display: none; }
  .gbi__corpo { grid-template-columns: minmax(0, 1fr); padding-top: clamp(36px, 5vw, 56px); }
  .gbi__tema { scroll-margin-top: calc(var(--topo) + 72px); }
}
@media (max-width: 900px) {
  .gbi__novo-in { grid-template-columns: minmax(0, 1fr); }
  .gbi__sumario { align-self: stretch; }
}
@media (max-width: 640px) {
  .gbi { --topo: calc(var(--nuh-h, 52px) + 29px); }
  .gbi__novo { padding: 0 12px; }
  .gbi__novo-in { padding: 26px 22px; border-radius: var(--nu-r-card); }
  .gbi__linha { grid-template-columns: minmax(0, 1fr) 16px; gap: 6px 16px; min-height: 0; padding: 18px 0; }
  .gbi__linha-txt { grid-column: 1; }
  .gbi__linha-meta { grid-column: 1; grid-row: 2; text-align: left; font-size: var(--nu-fs-xs); }
  .gbi__linha-seta { grid-column: 2; grid-row: 1 / 3; }
  .gbi__linha-l { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
}
@media (prefers-reduced-motion: reduce) {
  .gbi, .gbi__novo-in, .gbi__linha-seta, .gbi__novo-cta svg { animation: none; transition: none; }
}
</style>
