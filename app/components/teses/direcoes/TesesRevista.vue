<script setup lang="ts">
// /teses, direção 1 (PROTÓTIPO, ?teses=1 no dev, 02/11/2026): "O índice".
// O sumário de uma revista: uma tese grande no alto (a de maior convicção) e,
// embaixo, as outras numa lista calma, em dois grupos pelo shelf da API
// (Grandes ideias / Estratégias). Branco do header novo, títulos em 500, fio
// de cabelo entre as linhas. O único desenho é a convicção dia a dia da tese
// em destaque; nas linhas ela é um traço pequeno ao lado do número.
import type { ThesisCardApi } from '~/types/market'
import { contextoDaTese, type TeseVitrineVM } from '~/composables/useTesesVitrine'
import { diaDaTese } from '~/utils/tesesPainel'

const props = defineProps<{ cards: ThesisCardApi[]; favoritos: string[] }>()
const { teses, estado, revisadaEm, montado } = useTesesVitrine(toRef(props, 'cards'), toRef(props, 'favoritos'))

// a de maior convicção; no empate, a que mudou por último (depois do painel)
const destaque = computed<TeseVitrineVM | null>(() => {
  const l = [...teses.value].sort((a, b) => (b.conviccao ?? -1) - (a.conviccao ?? -1) || (b.mudanca?.data ?? '').localeCompare(a.mudanca?.data ?? ''))
  return l[0] ?? null
})
const grupos = computed(() => {
  const resto = teses.value.filter((t) => t.slug !== destaque.value?.slug)
  return [
    { id: 'temas', titulo: 'Grandes ideias', apoio: 'Tendências que mexem com setores inteiros.', itens: resto.filter((t) => t.tipo === 'tema') },
    { id: 'estrategias', titulo: 'Estratégias', apoio: 'Jeitos de montar carteira, estudados como tese.', itens: resto.filter((t) => t.tipo === 'estrategia') },
  ].filter((g) => g.itens.length)
})
// o número da linha segue a ordem da página inteira (o destaque é o 01)
const numero = (slug: string) => {
  const ordem = [destaque.value, ...grupos.value.flatMap((g) => g.itens)].filter(Boolean).map((t) => t!.slug)
  return String(ordem.indexOf(slug) + 1).padStart(2, '0')
}
const fontes = computed(() => teses.value.reduce((s, t) => s + t.fontes, 0))
const nf = new Intl.NumberFormat('pt-BR')
const revisadaTexto = computed(() => {
  if (!revisadaEm.value) return null
  const quando = montado.value ? quandoFoi(revisadaEm.value) : null
  return quando && quando !== `em ${revisadaEm.value.slice(8, 10)}/${revisadaEm.value.slice(5, 7)}`
    ? `${quando}, ${diaDaTese(revisadaEm.value)}`
    : diaDaTese(revisadaEm.value)
})
const falhouImagem = ref<Record<string, boolean>>({})
</script>

<template>
  <div class="trv">
    <header class="trv__topo">
      <div class="trv__topo-texto">
        <p class="trv__produto">Teses de investimento</p>
        <h1 class="trv__titulo">Toda tese, revisada todo dia.</h1>
      </div>
      <div class="trv__topo-lado">
        <p class="trv__dek">Cada tese é uma leitura do mundo transformada em ações, estudada a fundo e revalidada quando os fatos mudam.</p>
        <p v-if="teses.length" class="trv__meta">
          <span>{{ teses.length }} teses</span>
          <span v-if="fontes">{{ nf.format(fontes) }} fontes</span>
        </p>
        <!-- linha própria: o "ontem" só entra depois do mount e não pode quebrar a linha de cima (CLS) -->
        <p v-if="revisadaTexto" class="trv__meta trv__meta--rev">Última revisão {{ revisadaTexto }}</p>
      </div>
    </header>

    <!-- a tese em destaque -->
    <NuxtLink
      v-if="destaque" v-contexto-chat="contextoDaTese(destaque)"
      :to="destaque.href" class="trv__destaque"
    >
      <span class="trv__capa">
        <img
          v-if="destaque.capa && !falhouImagem[destaque.slug]" :src="destaque.capa" :alt="destaque.titulo"
          class="trv__capa-img" fetchpriority="high" @error="falhouImagem[destaque.slug] = true"
        >
      </span>
      <span class="trv__destaque-texto">
        <span class="trv__rotulo">
          <span>Em destaque</span><span class="trv__ponto" aria-hidden="true">·</span><span>{{ destaque.tema }}</span>
          <span v-if="destaque.seguindo" class="trv__seguindo">Seguindo</span>
        </span>
        <span class="trv__destaque-titulo">{{ destaque.titulo }}</span>
        <span class="trv__destaque-frase">{{ destaque.frase }}</span>

        <span v-if="destaque.conviccao != null" class="trv__conv">
          <span class="trv__conv-numero">{{ destaque.conviccao }}<span class="trv__conv-de">de 100</span></span>
          <span class="trv__conv-lado">
            <span class="trv__conv-rotulo">Convicção</span>
            <span class="trv__conv-linha">
              <TesesConviccaoLinha v-if="destaque.serie" :serie="destaque.serie" :altura="40" :largura="320" />
              <NuSkeleton v-else-if="estado === 'esperando'" variant="line" width="100%" height="40px" radius="10px" />
            </span>
            <span class="trv__conv-nota">
              <template v-if="destaque.mudancaFrase">{{ destaque.mudancaFrase }}</template>
              <NuSkeleton v-else-if="estado === 'esperando'" variant="line" width="150px" height="12px" />
            </span>
          </span>
        </span>

        <span class="trv__destaque-pe">
          <TesesLogos :tickers="destaque.tickers" :mais="destaque.mais" :tamanho="30" />
          <span class="trv__ler">Ler a tese<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
        </span>
      </span>
    </NuxtLink>

    <!-- o índice -->
    <section v-for="g in grupos" :key="g.id" class="trv__grupo" :aria-labelledby="`trv-${g.id}`">
      <div class="trv__grupo-topo">
        <h2 :id="`trv-${g.id}`" class="trv__grupo-titulo">{{ g.titulo }}<span class="trv__grupo-n">{{ g.itens.length }}</span></h2>
        <p class="trv__grupo-apoio">{{ g.apoio }}</p>
      </div>
      <ol class="trv__lista">
        <li v-for="t in g.itens" :key="t.slug">
          <NuxtLink v-contexto-chat="contextoDaTese(t)" :to="t.href" class="trv__linha">
            <span class="trv__n">{{ numero(t.slug) }}</span>
            <span class="trv__mini">
              <img v-if="t.capa && !falhouImagem[t.slug]" :src="t.capa" alt="" loading="lazy" class="trv__mini-img" @error="falhouImagem[t.slug] = true">
            </span>
            <span class="trv__corpo">
              <span class="trv__tema">{{ t.tema }}<span v-if="t.seguindo" class="trv__seguindo">Seguindo</span></span>
              <span class="trv__nome">{{ t.titulo }}</span>
              <span class="trv__frase">{{ t.frase }}</span>
              <TesesLogos class="trv__logos-m" :tickers="t.tickers" :mais="t.mais" :tamanho="22" />
            </span>
            <TesesLogos class="trv__logos" :tickers="t.tickers" :mais="t.mais" :tamanho="26" :nomes="false" />
            <span v-if="t.conviccao != null" class="trv__nota">
              <span class="trv__nota-numero"><span class="trv__nota-rotulo">Convicção</span>{{ t.conviccao }}</span>
              <span class="trv__nota-linha">
                <TesesConviccaoLinha v-if="t.serie" :serie="t.serie" :altura="18" :largura="96" />
                <NuSkeleton v-else-if="estado === 'esperando'" variant="line" width="100%" height="18px" radius="6px" />
              </span>
              <span class="trv__nota-mudou">
                <template v-if="t.mudancaFrase">{{ t.mudancaFrase }}</template>
                <NuSkeleton v-else-if="estado === 'esperando'" variant="line" width="88px" height="10px" />
              </span>
            </span>
            <svg class="trv__seta" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          </NuxtLink>
        </li>
      </ol>
    </section>

    <p v-if="!teses.length" class="trv__vazio">As teses não carregaram agora. Recarregue a página em alguns minutos.</p>
  </div>
</template>

<style scoped>
.trv {
  --g: clamp(22px, 5.5vw, 80px);
  background: var(--nu-white); padding: clamp(40px, 5.2vw, 80px) var(--g) clamp(56px, 7vw, 104px);
  animation: nu-fade .5s ease both;
}

/* ——— o topo ——— */
.trv__topo {
  display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: clamp(24px, 5vw, 96px); align-items: end;
  padding-bottom: clamp(28px, 3.4vw, 48px); border-bottom: 1px solid var(--nu-cream-line);
}
.trv__produto { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; letter-spacing: -0.01em; }
.trv__titulo {
  margin: 12px 0 0; color: var(--nu-ink); font-size: clamp(40px, 5.4vw, 78px); font-weight: 500;
  letter-spacing: -0.05em; line-height: 1.02; text-wrap: balance; max-width: 13ch;
}
.trv__dek { margin: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; max-width: 44ch; }
.trv__meta {
  display: flex; flex-wrap: wrap; gap: 6px 14px; margin: 18px 0 0;
  color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums;
}
.trv__meta span { white-space: nowrap; }
.trv__meta--rev { margin-top: 4px; }
.trv__meta span + span::before { content: '·'; margin-right: 14px; color: var(--nu-sand); }

/* ——— o destaque ——— */
.trv__destaque {
  display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(0, 1fr); gap: clamp(28px, 4.4vw, 72px); align-items: center;
  padding: clamp(32px, 4vw, 56px) 0; border-bottom: 1px solid var(--nu-cream-line); color: inherit;
}
.trv__capa {
  position: relative; display: block; aspect-ratio: 4 / 3; border-radius: var(--nu-r-card); overflow: hidden;
  background: var(--nu-tese-grad-1, var(--nu-navy));
}
.trv__capa-img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block;
  /* o selo "PESQUISA" vem desenhado na borda esquerda da capa: o zoom
     ancorado à direita o deixa fora do quadro (no recorte largo ele aparece) */
  transform: scale(1.12); transform-origin: 100% 50%;
  transition: transform .6s cubic-bezier(.2, .8, .2, 1);
}
.trv__destaque:hover .trv__capa-img { transform: scale(1.15); }
.trv__destaque-texto { display: flex; flex-direction: column; min-width: 0; }
.trv__rotulo { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700; }
.trv__ponto { color: var(--nu-sand); }
.trv__seguindo {
  display: inline-flex; align-items: center; height: 22px; padding: 0 9px; margin-left: 8px; border-radius: var(--nu-r-pill);
  background: var(--nu-green-bg); color: var(--nu-green-2); font-size: var(--nu-fs-xs); font-weight: 700;
}
.trv__destaque-titulo {
  margin-top: 14px; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 500;
  letter-spacing: -0.045em; line-height: 1.04; text-wrap: balance;
}
.trv__destaque-frase { margin-top: 16px; color: var(--nu-gray-2); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; max-width: 40ch; }
.trv__conv {
  display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 24px; align-items: center;
  margin-top: clamp(24px, 3vw, 36px); padding: 20px 0; border-top: 1px solid var(--nu-cream-line); border-bottom: 1px solid var(--nu-cream-line);
}
.trv__conv-numero {
  display: flex; flex-direction: column; color: var(--nu-ink); font-size: clamp(44px, 4.6vw, 64px); font-weight: 500;
  letter-spacing: -0.05em; line-height: 0.95; font-variant-numeric: tabular-nums;
}
.trv__conv-de { margin-top: 8px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; letter-spacing: 0; }
.trv__conv-lado { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.trv__conv-rotulo { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; }
.trv__conv-linha { display: block; height: 40px; color: var(--nu-blue); }
.trv__conv-nota { display: block; min-height: 18px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.trv__destaque-pe { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-top: 24px; }
.trv__ler { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; }
.trv__ler svg { transition: transform .2s; }
.trv__destaque:hover .trv__ler svg { transform: translateX(3px); }
.trv__destaque:focus-visible, .trv__linha:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 4px; border-radius: 12px; }

/* ——— o índice ——— */
.trv__grupo { margin-top: clamp(40px, 5vw, 72px); }
.trv__grupo-topo { display: flex; align-items: baseline; justify-content: space-between; gap: 8px 24px; flex-wrap: wrap; padding-bottom: 16px; }
.trv__grupo-titulo {
  display: inline-flex; align-items: baseline; gap: 12px; margin: 0; color: var(--nu-ink);
  font-size: var(--nu-fs-h3); font-weight: 500; letter-spacing: -0.035em; line-height: 1.1;
}
.trv__grupo-n { color: var(--nu-sand); font-size: var(--nu-fs-lg); font-weight: 600; letter-spacing: 0; font-variant-numeric: tabular-nums; }
.trv__grupo-apoio { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; }
.trv__lista { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--nu-ink-10); }
.trv__lista li { border-bottom: 1px solid var(--nu-cream-line); }
.trv__linha {
  display: grid; grid-template-columns: 36px 104px minmax(0, 1fr) 150px 152px 18px;
  gap: clamp(16px, 2vw, 28px); align-items: center; padding: 20px 0; color: inherit;
  transition: background .2s;
}
.trv__n { color: var(--nu-sand); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.trv__mini { position: relative; display: block; aspect-ratio: 4 / 3; border-radius: var(--nu-r-tile); overflow: hidden; background: var(--nu-navy); }
.trv__mini-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform: scale(1.12); transform-origin: 100% 50%; transition: transform .4s cubic-bezier(.2, .8, .2, 1); }
.trv__linha:hover .trv__mini-img { transform: scale(1.18); }
.trv__corpo { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.trv__tema { display: flex; align-items: center; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; }
.trv__nome { color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 600; letter-spacing: -0.02em; line-height: 1.25; transition: color .2s; }
.trv__linha:hover .trv__nome { color: var(--nu-blue-text); }
.trv__frase { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.trv__logos-m { display: none; }
.trv__nota { display: grid; grid-template-rows: auto 18px 16px; gap: 6px; min-width: 0; }
.trv__nota-numero { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 500; letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums; }
.trv__nota-rotulo { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; letter-spacing: 0; }
.trv__nota-linha { display: block; color: var(--nu-ink-75); }
.trv__nota-mudou { height: 16px; line-height: 16px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.trv__seta { color: var(--nu-sand); transition: transform .2s, color .2s; }
.trv__linha:hover .trv__seta { color: var(--nu-blue-text); transform: translateX(3px); }
.trv__vazio { margin: 32px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; }

/* ——— tablet ——— */
@media (max-width: 1100px) {
  .trv__linha { grid-template-columns: 96px minmax(0, 1fr) 132px 18px; }
  .trv__n, .trv__logos { display: none; }
  .trv__logos-m { display: inline-flex; margin-top: 6px; }
}
@media (max-width: 900px) {
  .trv__topo, .trv__destaque { grid-template-columns: minmax(0, 1fr); }
  .trv__titulo { max-width: 16ch; }
  .trv__capa { aspect-ratio: 16 / 9; }
}
/* ——— celular ——— */
@media (max-width: 560px) {
  .trv__linha { grid-template-columns: 76px minmax(0, 1fr); gap: 14px; align-items: start; padding: 18px 0; }
  .trv__mini { aspect-ratio: 1; }
  .trv__seta { display: none; }
  .trv__nome { font-size: var(--nu-fs-lg); }
  .trv__frase { -webkit-line-clamp: 2; }
  .trv__nota { grid-column: 2; grid-template-rows: auto; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 4px 12px; margin-top: -4px; }
  .trv__nota-numero { justify-content: flex-start; font-size: var(--nu-fs-lg); }
  .trv__nota-rotulo { margin-right: 6px; }
  .trv__nota-linha { height: 16px; }
  .trv__nota-mudou { grid-column: 1 / -1; }
  .trv__conv { gap: 18px; }
  /* no celular os três dados empilham, sem o ponto solto no começo da linha */

}
@media (prefers-reduced-motion: reduce) {
  .trv, .trv__capa-img, .trv__mini-img, .trv__seta, .trv__ler svg { animation: none; transition: none; }
}
</style>
