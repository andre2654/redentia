<script setup lang="ts">
// /teses, direção 3 (PROTÓTIPO, ?teses=3 no dev, 02/11/2026): "A grade".
// Cartões ricos numa grade com uma barra de filtros que gruda no topo: o tipo
// (o shelf da API: Grandes ideias / Estratégias), "mudou em 30 dias" (pela
// convicção dia a dia) e a ordem. Cada cartão diz a tese numa frase, os papéis,
// a convicção com o desenho dos últimos meses e a última mudança. No celular
// vira um feed vertical, com a barra rolando de lado.
//
// Sem catalisador no cartão: a lista de /theses não traz, e o campo `catalyst`
// do detalhe (~440 KB por tese) é texto que empilha vereditos antigos, não uma
// data próxima confiável. Sem "status" (Núcleo / Em risco) pelo mesmo motivo:
// ele mora por papel, só no detalhe.
import type { ThesisCardApi } from '~/types/market'
import { contextoDaTese, type TeseVitrineVM } from '~/composables/useTesesVitrine'

const props = defineProps<{ cards: ThesisCardApi[]; favoritos: string[] }>()
const { teses, estado, revisadaEm } = useTesesVitrine(toRef(props, 'cards'), toRef(props, 'favoritos'))

type Tipo = 'todas' | 'tema' | 'estrategia'
type Ordem = 'conviccao' | 'mudanca' | 'nome'
const tipo = ref<Tipo>('todas')
const recentes = ref(false)
const ordem = ref<Ordem>('conviccao')

// "mudou em 30 dias": a última mudança cai nos 30 dias antes do último ponto da série
const mudouRecente = (t: TeseVitrineVM) => {
  if (!t.mudanca || !t.serie?.length) return false
  const fim = Date.parse(`${t.serie[t.serie.length - 1]!.d}T12:00:00Z`)
  return fim - Date.parse(`${t.mudanca.data}T12:00:00Z`) <= 30 * 86_400_000
}
const contagem = computed(() => ({
  todas: teses.value.length,
  tema: teses.value.filter((t) => t.tipo === 'tema').length,
  estrategia: teses.value.filter((t) => t.tipo === 'estrategia').length,
  recentes: teses.value.filter(mudouRecente).length,
}))
const TIPOS: { id: Tipo; rotulo: string }[] = [
  { id: 'todas', rotulo: 'Todas' },
  { id: 'tema', rotulo: 'Grandes ideias' },
  { id: 'estrategia', rotulo: 'Estratégias' },
]
const ORDENS: { id: Ordem; rotulo: string }[] = [
  { id: 'conviccao', rotulo: 'Convicção' },
  { id: 'mudanca', rotulo: 'Mudou por último' },
  { id: 'nome', rotulo: 'A a Z' },
]

const visiveis = computed(() => {
  const l = teses.value.filter((t) => (tipo.value === 'todas' || t.tipo === tipo.value) && (!recentes.value || mudouRecente(t)))
  const porNome = (a: TeseVitrineVM, b: TeseVitrineVM) => a.titulo.localeCompare(b.titulo, 'pt-BR')
  if (ordem.value === 'nome') return l.sort(porNome)
  if (ordem.value === 'mudanca') return l.sort((a, b) => (b.mudanca?.data ?? '').localeCompare(a.mudanca?.data ?? '') || porNome(a, b))
  return l.sort((a, b) => (b.conviccao ?? -1) - (a.conviccao ?? -1) || porNome(a, b))
})
function limpar() { tipo.value = 'todas'; recentes.value = false }

const falhouImagem = ref<Record<string, boolean>>({})
</script>

<template>
  <div class="tgr">
    <header class="tgr__topo">
      <p class="tgr__produto">Teses de investimento</p>
      <h1 class="tgr__titulo">Ideias que a Redentia acompanha.</h1>
      <p class="tgr__dek">Cada tese é uma leitura do mundo transformada em ações, com a convicção revista a cada estudo.</p>
    </header>

    <!-- a barra que gruda -->
    <div class="tgr__barra">
      <div class="tgr__barra-in">
        <div class="tgr__chips" role="group" aria-label="Filtrar teses">
          <button
            v-for="o in TIPOS" :key="o.id" type="button" class="tgr__chip" :class="{ 'tgr__chip--on': tipo === o.id }"
            :aria-pressed="tipo === o.id" @click="tipo = o.id"
          >{{ o.rotulo }}<span class="tgr__chip-n">{{ contagem[o.id] }}</span></button>
          <span class="tgr__sep" aria-hidden="true" />
          <button
            type="button" class="tgr__chip" :class="{ 'tgr__chip--on': recentes }" :aria-pressed="recentes"
            :disabled="estado !== 'pronto'" @click="recentes = !recentes"
          >Mudou em 30 dias<span v-if="estado === 'pronto'" class="tgr__chip-n">{{ contagem.recentes }}</span></button>
        </div>
        <div class="tgr__ordem">
          <span class="tgr__ordem-r" id="tgr-ordem">Ordem</span>
          <div class="tgr__seg" role="radiogroup" aria-labelledby="tgr-ordem">
            <button
              v-for="o in ORDENS" :key="o.id" type="button" role="radio" class="tgr__seg-b" :class="{ 'tgr__seg-b--on': ordem === o.id }"
              :aria-checked="ordem === o.id" :disabled="o.id === 'mudanca' && estado !== 'pronto'" @click="ordem = o.id"
            >{{ o.rotulo }}</button>
          </div>
          <label class="tgr__select">
            <span class="tgr__sr">Ordenar por</span>
            <select v-model="ordem">
              <option v-for="o in ORDENS" :key="o.id" :value="o.id" :disabled="o.id === 'mudanca' && estado !== 'pronto'">{{ o.rotulo }}</option>
            </select>
          </label>
        </div>
      </div>
    </div>

    <div class="tgr__conta">
      <p class="tgr__conta-t" aria-live="polite">
        {{ visiveis.length === teses.length ? `${teses.length} teses` : `${visiveis.length} de ${teses.length} teses` }}<span v-if="revisadaEm" class="tgr__conta-rev"> · revisadas em {{ revisadaEm.slice(8, 10) }}/{{ revisadaEm.slice(5, 7) }}</span>
      </p>
      <!-- no celular a ordem desce para cá: a barra fica só com os filtros -->
      <label class="tgr__select tgr__select--m">
        <span class="tgr__sr">Ordenar por</span>
        <select v-model="ordem">
          <option v-for="o in ORDENS" :key="o.id" :value="o.id" :disabled="o.id === 'mudanca' && estado !== 'pronto'">{{ o.rotulo }}</option>
        </select>
      </label>
    </div>

    <ul v-if="visiveis.length" class="tgr__grade">
      <li v-for="t in visiveis" :key="t.slug">
        <NuxtLink v-contexto-chat="contextoDaTese(t)" :to="t.href" class="tgr__cartao">
          <span class="tgr__capa">
            <img v-if="t.capa && !falhouImagem[t.slug]" :src="t.capa" :alt="t.titulo" loading="lazy" class="tgr__capa-img" @error="falhouImagem[t.slug] = true">
            <span v-if="t.seguindo" class="tgr__seguindo">Seguindo</span>
          </span>
          <span class="tgr__corpo">
            <span class="tgr__tema">{{ t.tema }}<span class="tgr__ponto" aria-hidden="true">·</span>{{ t.tipo === 'estrategia' ? 'Estratégia' : 'Grande ideia' }}</span>
            <span class="tgr__nome">{{ t.titulo }}</span>
            <span class="tgr__frase">{{ t.frase }}</span>
            <TesesLogos class="tgr__logos" :tickers="t.tickers" :mais="t.mais" :tamanho="26" />
            <span class="tgr__pe">
              <span v-if="t.conviccao != null" class="tgr__conv">
                <span class="tgr__r">Convicção</span>
                <span class="tgr__conv-n">{{ t.conviccao }}</span>
              </span>
              <span class="tgr__conv-linha">
                <TesesConviccaoLinha v-if="t.serie" :serie="t.serie" :altura="30" :largura="160" />
                <NuSkeleton v-else-if="estado === 'esperando'" variant="line" width="100%" height="30px" radius="8px" />
              </span>
              <span class="tgr__mudou">
                <template v-if="t.mudancaFrase">{{ t.mudancaFrase[0]!.toUpperCase() }}{{ t.mudancaFrase.slice(1) }}</template>
                <template v-else-if="t.serie">Estável desde {{ t.serie[0]!.d.slice(8, 10) }}/{{ t.serie[0]!.d.slice(5, 7) }}</template>
                <NuSkeleton v-else-if="estado === 'esperando'" variant="line" width="160px" height="12px" />
              </span>
            </span>
          </span>
        </NuxtLink>
      </li>
    </ul>
    <div v-else class="tgr__vazio">
      <template v-if="teses.length">
        <p>Nenhuma tese com esse filtro agora.</p>
        <button type="button" class="tgr__limpar" @click="limpar">Ver todas as teses</button>
      </template>
      <p v-else>As teses não carregaram agora. Recarregue a página em alguns minutos.</p>
    </div>
  </div>
</template>

<style scoped>
.tgr { --g: clamp(22px, 5.5vw, 80px); background: var(--nu-white); padding-bottom: clamp(56px, 7vw, 104px); animation: nu-fade .5s ease both; }

.tgr__topo { padding: clamp(40px, 5.2vw, 80px) var(--g) clamp(24px, 3vw, 40px); }
.tgr__produto { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; }
.tgr__titulo { margin: 12px 0 0; color: var(--nu-ink); font-size: clamp(38px, 5vw, 72px); font-weight: 500; letter-spacing: -0.05em; line-height: 1.02; text-wrap: balance; max-width: 18ch; }
.tgr__dek { margin: 16px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; max-width: 52ch; }

/* ——— a barra ——— */
.tgr__barra {
  /* gruda embaixo do header e da régua do mercado (NuMarketTicker: 40 px, 30
     no celular), com o fio de cima por baixo do fio da régua */
  position: sticky; top: calc(var(--nuh-h, 72px) + 39px); z-index: 30;
  background: color-mix(in srgb, var(--nu-white) 90%, transparent);
  -webkit-backdrop-filter: saturate(1.4) blur(14px); backdrop-filter: saturate(1.4) blur(14px);
  border-top: 1px solid var(--nu-cream-line); border-bottom: 1px solid var(--nu-cream-line);
  transition: top .32s cubic-bezier(.2, .8, .2, 1);
}
.tgr__barra-in { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px var(--g); }
.tgr__chips { display: flex; align-items: center; gap: 8px; min-width: 0; }
.tgr__chip {
  display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 16px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; white-space: nowrap;
  cursor: pointer; transition: background .2s, color .2s;
}
.tgr__chip:hover:not(:disabled) { background: var(--nu-cream-hover); box-shadow: inset 0 0 0 1px var(--nu-cream-line); }
.tgr__chip--on, .tgr__chip--on:hover:not(:disabled) { background: var(--nu-ink); color: var(--nu-white); box-shadow: none; }
.tgr__chip:disabled { opacity: .4; cursor: not-allowed; }
.tgr__chip:focus-visible, .tgr__seg-b:focus-visible, .tgr__select select:focus-visible, .tgr__limpar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.tgr__chip-n { color: var(--nu-gray); font-weight: 700; font-variant-numeric: tabular-nums; }
.tgr__chip--on .tgr__chip-n { color: var(--nu-cream-text-60); }
.tgr__sep { flex-shrink: 0; width: 1px; height: 22px; margin: 0 4px; background: var(--nu-cream-line); }
.tgr__ordem { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.tgr__ordem-r { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; }
.tgr__seg { display: inline-flex; padding: 3px; border-radius: var(--nu-r-pill); background: var(--nu-cream); }
.tgr__seg-b {
  height: 32px; padding: 0 14px; border: 0; border-radius: var(--nu-r-pill); background: transparent; color: var(--nu-gray-2);
  font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; white-space: nowrap; cursor: pointer; transition: background .2s, color .2s, box-shadow .2s;
}
.tgr__seg-b:hover:not(:disabled) { color: var(--nu-ink); }
.tgr__seg-b--on { background: var(--nu-white); color: var(--nu-ink); box-shadow: 0 1px 3px var(--nu-ink-14); }
.tgr__seg-b:disabled { opacity: .4; cursor: not-allowed; }
.tgr__select { display: none; position: relative; }
.tgr__select select {
  appearance: none; height: 38px; padding: 0 34px 0 16px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600;
}
.tgr__select::after {
  content: ''; position: absolute; right: 15px; top: 50%; width: 7px; height: 7px; margin-top: -6px; pointer-events: none;
  border-right: 1.6px solid var(--nu-ink); border-bottom: 1.6px solid var(--nu-ink); transform: rotate(45deg);
}
.tgr__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.tgr__conta { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 20px var(--g) 0; }
.tgr__conta-t { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }
.tgr__conta .tgr__select { display: none; }

/* ——— a grade ——— */
.tgr__grade {
  list-style: none; margin: 16px 0 0; padding: 0 var(--g);
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(310px, 100%), 1fr)); gap: clamp(16px, 1.8vw, 24px);
}
.tgr__cartao {
  display: flex; flex-direction: column; height: 100%; border-radius: var(--nu-r-card); overflow: hidden;
  background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-cream-line); color: inherit;
  transition: transform .2s, box-shadow .2s;
}
.tgr__cartao:hover { transform: translateY(-2px); box-shadow: inset 0 0 0 1px var(--nu-cream-line), var(--nu-shadow-card); }
.tgr__cartao:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
.tgr__capa { position: relative; display: block; aspect-ratio: 16 / 9; background: var(--nu-navy); overflow: hidden; }
.tgr__capa-img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  /* a capa traz o selo "PESQUISA" na vertical, desenhado na própria imagem,
     na borda esquerda: no recorte largo ele aparece; o zoom ancorado à direita
     o deixa fora do quadro */
  transform: scale(1.14); transform-origin: 100% 50%;
  transition: transform .6s cubic-bezier(.2, .8, .2, 1);
}
.tgr__cartao:hover .tgr__capa-img { transform: scale(1.18); }
.tgr__seguindo {
  position: absolute; left: 14px; top: 14px; display: inline-flex; align-items: center; height: 26px; padding: 0 11px;
  border-radius: var(--nu-r-pill); background: var(--nu-green-bg); color: var(--nu-green-2); font-size: var(--nu-fs-xs); font-weight: 700;
}
.tgr__corpo { flex: 1; display: flex; flex-direction: column; padding: 20px 22px 20px; }
.tgr__tema { display: flex; align-items: center; gap: 7px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; }
.tgr__ponto { color: var(--nu-sand); }
.tgr__nome { margin-top: 10px; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 600; letter-spacing: -0.03em; line-height: 1.18; text-wrap: balance; }
.tgr__frase { margin-top: 8px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.55; }
.tgr__logos { margin-top: 16px; }
.tgr__pe {
  display: grid; grid-template-columns: auto minmax(0, 1fr); grid-template-rows: auto auto; gap: 8px 18px; align-items: end;
  margin-top: auto; padding-top: 18px; border-top: 1px solid var(--nu-cream-line);
}
.tgr__corpo > .tgr__logos { margin-bottom: 18px; }
.tgr__conv { display: flex; flex-direction: column; gap: 4px; }
.tgr__r { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; }
.tgr__conv-n { color: var(--nu-ink); font-size: clamp(30px, 2.6vw, 36px); font-weight: 500; letter-spacing: -0.04em; line-height: 1; font-variant-numeric: tabular-nums; }
.tgr__conv-linha { display: block; height: 30px; color: var(--nu-blue); }
.tgr__mudou { grid-column: 1 / -1; min-height: 18px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }

.tgr__vazio { padding: 40px var(--g) 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; }
.tgr__vazio p { margin: 0; }
.tgr__limpar {
  margin-top: 16px; height: 44px; padding: 0 20px; border: 0; border-radius: var(--nu-r-pill); background: var(--nu-ink); color: var(--nu-white);
  font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer;
}

/* ——— tablet: a ordem vira menu; celular: a barra rola de lado ——— */
@media (max-width: 1100px) {
  .tgr__seg, .tgr__ordem-r { display: none; }
  .tgr__select { display: block; }
}
@media (max-width: 640px) { .tgr__barra { top: calc(var(--nuh-h, 52px) + 29px); } }
@media (max-width: 900px) {
  .tgr__barra-in { padding: 10px 0 10px var(--g); gap: 10px; }
  .tgr__chips { flex: 1; overflow-x: auto; scrollbar-width: none; padding: 2px var(--g) 2px 0; }
  .tgr__chips::-webkit-scrollbar { display: none; }
  .tgr__ordem { display: none; }
  .tgr__conta .tgr__select { display: block; }
  .tgr__conta .tgr__select select { height: 36px; background: transparent; box-shadow: inset 0 0 0 1px var(--nu-cream-line); }
  .tgr__chip { height: 36px; padding: 0 14px; }
  .tgr__nome { font-size: var(--nu-fs-xl); }
}
@media (max-width: 560px) { .tgr__conta-rev { display: none; } }
@media (prefers-reduced-motion: reduce) {
  .tgr, .tgr__cartao, .tgr__capa-img, .tgr__barra { animation: none; transition: none; }
}
</style>
