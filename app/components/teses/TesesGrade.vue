<script setup lang="ts">
// /teses: "A grade" (02/11/2026), a direção que o dono escolheu entre três
// ("gostei da 3, pode manter nela"). Cartões ricos numa grade com uma barra de filtros que gruda no topo: o tipo
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

const props = defineProps<{
  cards: ThesisCardApi[]
  favoritos: string[]
  /** a lista ainda não chegou (o SSR falhou e o cliente tenta de novo): esqueleto */
  carregando?: boolean
}>()
const { teses, estado, revisadaEm } = useTesesVitrine(toRef(props, 'cards'), toRef(props, 'favoritos'))

type Tipo = 'todas' | 'tema' | 'estrategia'
type Ordem = 'conviccao' | 'mudanca' | 'nome'
const tipo = ref<Tipo>('todas')
const recentes = ref(false)
const ordem = ref<Ordem>('conviccao')

const mudouRecente = (t: TeseVitrineVM) => t.mudouRecente
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
      <NuEyebrow como="p" class="tgr__produto">Teses de investimento</NuEyebrow>
      <h1 class="tgr__titulo">Ideias que a Aportou acompanha.</h1>
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

    <!-- esqueleto dos cartões: só quando a lista não veio no SSR e o cliente tenta de novo -->
    <ul v-if="carregando && !teses.length" class="tgr__grade" aria-hidden="true">
      <li v-for="i in 6" :key="i">
        <span class="tgr__cartao tgr__cartao--sk">
          <span class="tgr__capa"><NuSkeleton variant="block" width="100%" height="100%" radius="0" /></span>
          <span class="tgr__corpo">
            <NuSkeleton variant="line" width="140px" height="12px" />
            <NuSkeleton variant="text" :lines="2" last-width="60%" height="22px" class="tgr__sk-nome" />
            <NuSkeleton variant="text" :lines="2" last-width="80%" height="13px" class="tgr__sk-frase" />
            <span class="tgr__pe">
              <span class="tgr__conv"><NuSkeleton variant="line" width="56px" height="12px" /><NuSkeleton variant="line" width="48px" height="32px" /></span>
              <NuSkeleton variant="line" width="100%" height="30px" radius="8px" />
            </span>
          </span>
        </span>
      </li>
    </ul>
    <ul v-else-if="visiveis.length" class="tgr__grade">
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
                <template v-if="t.mudancaFrase">{{ t.mudancaFrase }}</template>
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
/* Aportou (11/11/2026): a página é creme, o título é 800, a barra de filtros é
   a da marca (pílula carvão ligada, chip creme desligado) e o cartão da tese é
   branco com a sombra quente. O conteúdo e a ordem são os de antes. */
.tgr { --g: clamp(20px, 5.5vw, 80px); --lado: max(var(--g), calc((100% - 1240px) / 2)); background: var(--nu-page); padding-bottom: clamp(64px, 7vw, 100px); animation: nu-fade .5s ease both; }

.tgr__topo { padding: clamp(44px, 5.6vw, 84px) var(--lado) clamp(28px, 3.4vw, 44px); }
.tgr__titulo { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-hero); font-weight: 800; letter-spacing: -0.035em; line-height: .98; text-wrap: balance; max-width: 14ch; }
.tgr__dek { margin: 20px 0 0; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500; line-height: 1.45; max-width: 52ch; }

/* ——— a barra ——— */
.tgr__barra {
  /* gruda embaixo do header e da régua do mercado (NuMarketTicker: 40 px, 30
     no celular), com o fio de cima por baixo do fio da régua */
  position: sticky; top: calc(var(--nuh-h, 72px) + 39px); z-index: 30;
  background: color-mix(in srgb, var(--nu-page) 92%, transparent);
  -webkit-backdrop-filter: saturate(1.4) blur(14px); backdrop-filter: saturate(1.4) blur(14px);
  border-top: 1.5px solid var(--nu-line-2); border-bottom: 1.5px solid var(--nu-line-2);
  transition: top .32s cubic-bezier(.2, .8, .2, 1);
}
.tgr__barra-in { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 8px var(--lado); }
.tgr__chips { display: flex; align-items: center; gap: 8px; min-width: 0; }
.tgr__chip {
  display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 18px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-cream-2); color: var(--nu-ink); font: inherit; font-size: 14.5px; font-weight: 600; white-space: nowrap;
  cursor: pointer; transition: background .2s, color .2s, transform .15s cubic-bezier(.2, .8, .2, 1);
}
.tgr__chip:hover:not(:disabled) { background: var(--nu-line-2); }
.tgr__chip:active:not(:disabled) { transform: scale(.98); }
.tgr__chip--on, .tgr__chip--on:hover:not(:disabled) { background: var(--nu-ink); color: var(--nu-white); font-weight: 700; }
.tgr__chip:disabled { opacity: .4; cursor: not-allowed; }
.tgr__chip-n { color: var(--nu-gray); font-weight: 700; font-variant-numeric: tabular-nums; }
.tgr__chip--on .tgr__chip-n { color: var(--nu-on-dark-2); }
.tgr__sep { flex-shrink: 0; width: 1.5px; height: 22px; margin: 0 4px; background: var(--nu-line); }
.tgr__ordem { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.tgr__ordem-r { color: var(--nu-ink); font-size: 13.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
.tgr__seg { display: inline-flex; padding: 4px; border-radius: var(--nu-r-pill); background: var(--nu-cream-2); }
.tgr__seg-b {
  height: 36px; padding: 0 16px; border: 0; border-radius: var(--nu-r-pill); background: transparent; color: var(--nu-gray-3);
  font: inherit; font-size: 14.5px; font-weight: 600; white-space: nowrap; cursor: pointer; transition: background .2s, color .2s;
}
.tgr__seg-b:hover:not(:disabled) { color: var(--nu-ink); }
.tgr__seg-b--on { background: var(--nu-ink); color: var(--nu-white); font-weight: 700; }
.tgr__seg-b--on:hover:not(:disabled) { color: var(--nu-white); }
.tgr__seg-b:disabled { opacity: .4; cursor: not-allowed; }
.tgr__select { display: none; position: relative; }
.tgr__select select {
  appearance: none; height: 44px; padding: 0 36px 0 16px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-cream-2); color: var(--nu-ink); font: inherit; font-size: 14.5px; font-weight: 600;
}
.tgr__select::after {
  content: ''; position: absolute; right: 16px; top: 50%; width: 7px; height: 7px; margin-top: -6px; pointer-events: none;
  border-right: 2px solid var(--nu-ink); border-bottom: 2px solid var(--nu-ink); transform: rotate(45deg);
}
.tgr__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.tgr__conta { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 24px var(--lado) 0; }
.tgr__conta-t { margin: 0; color: var(--nu-gray); font-size: 14.5px; font-weight: 600; font-variant-numeric: tabular-nums; }
.tgr__conta .tgr__select { display: none; }

/* ——— a grade ——— */
.tgr__grade {
  list-style: none; margin: 16px 0 0; padding: 0 var(--lado);
  /* no máximo três colunas (1440 e 1024), duas no tablet, uma no celular */
  --gap: clamp(16px, 1.8vw, 24px);
  display: grid; gap: var(--gap);
  grid-template-columns: repeat(auto-fill, minmax(min(100%, max(280px, calc((100% - 2 * var(--gap)) / 3))), 1fr));
}
.tgr__cartao {
  display: flex; flex-direction: column; height: 100%; border-radius: var(--nu-r-card); overflow: hidden;
  background: var(--nu-white); box-shadow: var(--nu-shadow-quente); color: inherit;
  transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s cubic-bezier(.2, .8, .2, 1);
}
.tgr__cartao:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.tgr__cartao:focus-visible { outline-offset: 3px; }
.tgr__capa { position: relative; display: block; aspect-ratio: 16 / 9; background: var(--nu-ink); overflow: hidden; }
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
  position: absolute; left: 14px; top: 14px; display: inline-flex; align-items: center; height: 28px; padding: 0 10px;
  border-radius: var(--nu-r-tag); background: var(--nu-green-bg); color: var(--nu-green-text); font-size: 13.5px; font-weight: 700;
}
.tgr__corpo { flex: 1; display: flex; flex-direction: column; padding: 20px 22px 20px; }
.tgr__tema { display: flex; align-items: center; gap: 7px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.tgr__ponto { color: var(--nu-sand); }
.tgr__nome { margin-top: 10px; color: var(--nu-ink); font-size: clamp(22px, 2vw, 27px); font-weight: 800; letter-spacing: -0.025em; line-height: 1.1; text-wrap: balance; transition: color .2s ease; }
.tgr__cartao:hover .tgr__nome { color: var(--nu-blue-text); }
.tgr__frase { margin-top: 10px; color: var(--nu-gray-3); font-size: 15.5px; font-weight: 500; line-height: 1.5; }
.tgr__logos { margin-top: 16px; }
.tgr__pe {
  display: grid; grid-template-columns: auto minmax(0, 1fr); grid-template-rows: auto auto; gap: 8px 18px; align-items: end;
  margin-top: auto; padding-top: 18px; border-top: 1.5px solid var(--nu-line-2);
}
.tgr__corpo > .tgr__logos { margin-bottom: 18px; }
.tgr__conv { display: flex; flex-direction: column; gap: 4px; }
.tgr__r { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.tgr__conv-n { color: var(--nu-ink); font-size: clamp(34px, 3vw, 42px); font-weight: 800; letter-spacing: -0.035em; line-height: 1; font-variant-numeric: tabular-nums; }
.tgr__conv-linha { display: block; height: 30px; color: var(--nu-blue); }
.tgr__mudou { grid-column: 1 / -1; min-height: 18px; color: var(--nu-gray); font-size: 13.5px; font-weight: 600; }

.tgr__cartao--sk { pointer-events: none; }
.tgr__sk-nome { margin-top: 12px; }
.tgr__sk-frase { margin-top: 10px; margin-bottom: 18px; }
.tgr__vazio { padding: 40px var(--lado) 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; }
.tgr__vazio p { margin: 0; }
.tgr__limpar {
  margin-top: 16px; min-height: 48px; padding: 0 24px; border: 0; border-radius: var(--nu-r-pill); background: var(--nu-ink); color: var(--nu-white);
  font: inherit; font-size: var(--nu-fs-md); font-weight: 700; cursor: pointer; transition: background .2s, transform .15s cubic-bezier(.2, .8, .2, 1);
}
.tgr__limpar:hover { background: var(--nu-ink-hover); }
.tgr__limpar:active { transform: scale(.98); }

/* ——— tablet: a ordem vira menu; celular: a barra rola de lado ——— */
@media (max-width: 1100px) {
  .tgr__seg, .tgr__ordem-r { display: none; }
  .tgr__select { display: block; }
}
@media (max-width: 640px) { .tgr__barra { top: calc(var(--nuh-h, 52px) + 29px); } }
@media (max-width: 900px) {
  .tgr__barra-in { padding: 6px 0 6px var(--lado); gap: 10px; }
  .tgr__chips { flex: 1; overflow-x: auto; scrollbar-width: none; padding: 2px var(--lado) 2px 0; }
  .tgr__chips::-webkit-scrollbar { display: none; }
  .tgr__ordem { display: none; }
  .tgr__conta .tgr__select { display: block; }
  .tgr__conta .tgr__select select { background: transparent; box-shadow: inset 0 0 0 1.5px var(--nu-line); }
  .tgr__chip { padding: 0 16px; }
  .tgr__nome { font-size: var(--nu-fs-xl); }
}
@media (max-width: 560px) {
  .tgr__conta-rev { display: none; }
  /* o feed do celular: a capa mais baixa, para caber mais tese por tela */
  .tgr__capa { aspect-ratio: 2 / 1; }
}
@media (prefers-reduced-motion: reduce) {
  .tgr, .tgr__cartao, .tgr__capa-img, .tgr__barra, .tgr__chip, .tgr__limpar { animation: none; transition: none; }
  .tgr__cartao:hover, .tgr__chip:active, .tgr__limpar:active { transform: none; }
}
</style>
