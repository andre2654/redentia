<script setup lang="ts">
// /teses: "A grade" (02/11/2026), a direção que o dono escolheu entre três
// ("gostei da 3, pode manter nela"). Cartões ricos numa grade com uma barra de filtros que gruda no topo: o tipo
// (o shelf da API: Grandes ideias / Estratégias), "mudou em 30 dias" (pela
// convicção dia a dia) e a ordem. Cada cartão diz a tese numa frase, os papéis,
// a convicção com o desenho dos últimos meses e a última mudança. No celular
// vira um feed vertical, com a barra rolando de lado.
//
// 2ª rodada da Aportou (11/11/2026): o cartão conversa com a tela de tese nova.
// Os mesmos selos de raio 8 (NuSelo): convicção em azul, o retorno desde o
// lançamento em verde ou vermelho, o nº de ativos em carvão; os papéis em
// etiqueta carvão (os três primeiros) e "+N"; a capa só quando a tese tem
// imagem; no pé o desenho da convicção, a última mudança e "Abrir tese". Tipo e
// ordem usam o trilho da base (NuTrilho, a pílula que desliza). Campo vazio não
// vira selo. Os dados, os filtros, a ordem e os links são os de antes.
//
// Robustez (11/11/2026): o topo entra em cascata (eyebrow, título, dek) e a
// grade logo depois, em --nu-dur-entrada --nu-ease-saida; os cartões que
// nascem abaixo da dobra entram ao rolar (v-revelar em cada cartão: uma
// fileira por vez). O cartão é branco com a sombra do branco; sob o ponteiro
// sobe 2px, apertado afunda, e o anel de foco abraça o cartão. Toda transição
// por token. Vazio e erro têm o próximo passo num botão.
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
const tiposDoTrilho = computed(() => TIPOS.map((o) => ({ valor: o.id, rotulo: o.rotulo, contagem: contagem.value[o.id] })))
const ordensDoTrilho = computed(() => ORDENS.map((o) => ({ valor: o.id, rotulo: o.rotulo, desabilitada: o.id === 'mudanca' && estado.value !== 'pronto' })))
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
// a lista não chegou nem no servidor nem no cliente: tentar de novo é recarregar
function tentarDeNovo() { reloadNuxtApp() }

const falhouImagem = ref<Record<string, boolean>>({})

// ——— os selos do cartão: o que a lista de /theses já traz, por tese ———
// (returnLabel é o retorno desde o lançamento, o mesmo do selo da tela de tese;
// a lista não traz o mês do lançamento, então o selo diz "desde o lançamento")
const QUANTOS_PAPEIS = 3
const extras = computed(() => {
  const m: Record<string, { retorno: { texto: string; queda: boolean } | null; ativos: number }> = {}
  for (const c of props.cards) {
    const r = c.returnLabel?.trim()
    m[c.id] = {
      retorno: r ? { texto: `${r} desde o lançamento`, queda: c.returnPct != null ? c.returnPct < 0 : /^[-−]/.test(r) } : null,
      ativos: c.companiesCount > 0 ? c.companiesCount : (c.tickers?.length ?? 0) + Math.max(0, c.extraTickers ?? 0),
    }
  }
  return m
})
const maisPapeis = (t: TeseVitrineVM) => Math.max(0, t.tickers.length - QUANTOS_PAPEIS) + t.mais
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
        <div class="tgr__chips">
          <NuTrilho v-model="tipo" class="tgr__trilho" :opcoes="tiposDoTrilho" rotulo="Filtrar teses por tipo" />
          <span class="tgr__sep" aria-hidden="true" />
          <button
            type="button" class="tgr__chip" :class="{ 'tgr__chip--on': recentes }" :aria-pressed="recentes"
            :disabled="estado !== 'pronto'" @click="recentes = !recentes"
          >Mudou em 30 dias<span v-if="estado === 'pronto'" class="tgr__chip-n">{{ contagem.recentes }}</span></button>
        </div>
        <div class="tgr__ordem">
          <span id="tgr-ordem" class="tgr__ordem-r">Ordem</span>
          <NuTrilho v-model="ordem" class="tgr__seg" :opcoes="ordensDoTrilho" rotulo="Ordenar as teses" />
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
          <span class="tgr__corpo">
            <NuSkeleton variant="line" width="140px" height="12px" />
            <NuSkeleton variant="text" :lines="2" last-width="60%" height="22px" class="tgr__sk-nome" />
            <NuSkeleton variant="text" :lines="2" last-width="80%" height="13px" class="tgr__sk-frase" />
            <span class="tgr__selos"><NuSkeleton variant="line" width="150px" height="30px" radius="8px" /><NuSkeleton variant="line" width="120px" height="30px" radius="8px" /></span>
            <span class="tgr__pe">
              <NuSkeleton variant="line" width="120px" height="30px" radius="8px" />
              <NuSkeleton variant="line" width="92px" height="14px" />
            </span>
          </span>
        </span>
      </li>
    </ul>
    <ul v-else-if="visiveis.length" class="tgr__grade">
      <li v-for="t in visiveis" :key="t.slug" v-revelar class="tgr__item">
        <NuxtLink v-contexto-chat="contextoDaTese(t)" :to="t.href" class="tgr__cartao">
          <span v-if="t.capa && !falhouImagem[t.slug]" class="tgr__capa">
            <img :src="t.capa" :alt="t.titulo" loading="lazy" class="tgr__capa-img" @error="falhouImagem[t.slug] = true">
          </span>
          <span class="tgr__corpo">
            <span class="tgr__topo-l">
              <span class="tgr__tema">{{ t.tema }}<span class="tgr__ponto" aria-hidden="true">·</span>{{ t.tipo === 'estrategia' ? 'Estratégia' : 'Grande ideia' }}</span>
              <NuSelo v-if="t.seguindo" tom="verde" ponto class="tgr__seguindo">Seguindo</NuSelo>
            </span>
            <span class="tgr__nome">{{ t.titulo }}</span>
            <span class="tgr__frase">{{ t.frase }}</span>
            <span v-if="t.conviccao != null || extras[t.slug]?.retorno" class="tgr__selos">
              <NuSelo v-if="t.conviccao != null" tom="azul">Convicção {{ t.conviccao }} de 100</NuSelo>
              <NuSelo v-if="extras[t.slug]?.retorno" :tom="extras[t.slug]!.retorno!.queda ? 'vermelho' : 'verde'">{{ extras[t.slug]!.retorno!.texto }}</NuSelo>
            </span>
            <!-- o que tem dentro: quantos ativos (selo carvão) e os primeiros papéis em etiqueta -->
            <span v-if="extras[t.slug]?.ativos || t.tickers.length" class="tgr__papeis">
              <NuSelo v-if="extras[t.slug]?.ativos" tom="carvao">{{ extras[t.slug]!.ativos }} {{ extras[t.slug]!.ativos === 1 ? 'ativo' : 'ativos' }}</NuSelo>
              <span v-if="extras[t.slug]?.ativos && t.tickers.length" class="tgr__fio" aria-hidden="true" />
              <span v-for="(tk, k) in t.tickers.slice(0, QUANTOS_PAPEIS)" :key="tk" class="tgr__tk" :class="{ 'tgr__tk--3': k === 2 }">{{ tk }}</span>
              <!-- no cartão estreito cabem dois papéis: o "+N" conta o terceiro -->
              <span v-if="maisPapeis(t)" class="tgr__tk tgr__tk--mais tgr__tk--larga">+{{ maisPapeis(t) }}</span>
              <span v-if="maisPapeis(t) || t.tickers.length > 2" class="tgr__tk tgr__tk--mais tgr__tk--estreita">+{{ maisPapeis(t) + (t.tickers.length > 2 ? 1 : 0) }}</span>
            </span>
            <span class="tgr__pe">
              <span class="tgr__evol">
                <span v-if="t.serie || estado === 'esperando'" class="tgr__conv-linha">
                  <TesesConviccaoLinha v-if="t.serie" :serie="t.serie" :altura="30" :largura="120" />
                  <NuSkeleton v-else variant="line" width="100%" height="30px" radius="8px" />
                </span>
                <span class="tgr__mudou">
                  <template v-if="t.mudancaFrase">{{ t.mudancaFrase }}</template>
                  <template v-else-if="t.serie">Estável desde {{ t.serie[0]!.d.slice(8, 10) }}/{{ t.serie[0]!.d.slice(5, 7) }}</template>
                  <NuSkeleton v-else-if="estado === 'esperando'" variant="line" width="120px" height="12px" />
                </span>
              </span>
              <span class="tgr__abrir">Abrir tese<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg></span>
            </span>
          </span>
        </NuxtLink>
      </li>
    </ul>
    <div v-else class="tgr__vazio" role="status">
      <template v-if="teses.length">
        <p class="tgr__vazio-t">Nenhuma tese com esse filtro agora.</p>
        <NuBotaoSeta variante="carvao" tamanho="m" class="tgr__vazio-b" @click="limpar">Ver todas as teses</NuBotaoSeta>
      </template>
      <template v-else>
        <p class="tgr__vazio-t">As teses não carregaram agora. Recarregue a página em alguns minutos.</p>
        <NuBotaoSeta variante="carvao" tamanho="m" class="tgr__vazio-b" @click="tentarDeNovo">Tentar de novo</NuBotaoSeta>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Aportou (11/11/2026): a página é creme, o título é 800, a barra de filtros é
   a da marca (pílula carvão ligada, chip creme desligado) e o cartão da tese é
   branco com a sombra quente. O conteúdo e a ordem são os de antes. */
.tgr { --lado: var(--nu-coluna); background: var(--nu-page); padding-bottom: clamp(72px, 8vw, 128px); }

/* a entrada da página: o topo em cascata (60ms por peça), a barra e a grade logo depois */
.tgr__topo { padding: clamp(48px, 5.6vw, 88px) var(--lado) 40px; }
.tgr__topo > * { animation: nu-fade var(--nu-dur-entrada) var(--nu-ease-saida) both; }
.tgr__topo > :nth-child(2) { animation-delay: 60ms; }
.tgr__topo > :nth-child(3) { animation-delay: 120ms; }
.tgr__barra-in, .tgr__conta { animation: nu-fade var(--nu-dur-entrada) var(--nu-ease-saida) 180ms both; }
.tgr__grade { animation: nu-fade var(--nu-dur-entrada) var(--nu-ease-saida) 240ms both; }
.tgr__titulo { margin: 20px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-hero); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: .98; text-wrap: balance; max-width: 14ch; }
.tgr__dek { margin: 20px 0 0; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.45; max-width: 52ch; }

/* ——— a barra ——— */
.tgr__barra {
  /* gruda embaixo do header e da régua do mercado pela altura que a régua
     publica (--nut-h, NuMarketTicker: 44 px, 36 no celular desde 12/11/2026),
     com o fio de cima por baixo do fio da régua */
  position: sticky; top: calc(var(--nuh-h, 72px) + var(--nut-h, 44px) - 1px); z-index: 30;
  background: color-mix(in srgb, var(--nu-page) 92%, transparent);
  -webkit-backdrop-filter: saturate(1.4) blur(14px); backdrop-filter: saturate(1.4) blur(14px);
  border-top: 1px solid var(--nu-line-2); border-bottom: 1px solid var(--nu-line-2);
  transition: top var(--nu-dur-media) var(--nu-ease-saida);
}
.tgr__barra-in { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 8px var(--lado); }
.tgr__chips { display: flex; align-items: center; gap: 8px; min-width: 0; }
.tgr__trilho { flex: none; }
/* "mudou em 30 dias" é liga/desliga, não uma escolha do trilho: um chip creme que vira carvão */
.tgr__chip {
  display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 18px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-cream-2); color: var(--nu-ink); font: inherit; font-size: 14.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); white-space: nowrap;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.tgr__chip:hover:not(:disabled) { background: var(--nu-line-2); }
.tgr__chip:active:not(:disabled) { transform: scale(.98); }
.tgr__chip--on, .tgr__chip--on:hover:not(:disabled) { background: var(--nu-ink); color: var(--nu-white); font-weight: var(--nu-w-medio); }
.tgr__chip:disabled { opacity: .4; cursor: not-allowed; }
.tgr__chip-n { color: var(--nu-gray); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }
.tgr__chip--on .tgr__chip-n { color: var(--nu-on-dark-2); }
.tgr__sep { flex-shrink: 0; width: 1.5px; height: 22px; margin: 0 4px; background: var(--nu-line); }
.tgr__ordem { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.tgr__ordem-r { color: var(--nu-ink); font-size: 13px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-caixa); text-transform: uppercase; }
.tgr__select { display: none; position: relative; }
.tgr__select select {
  appearance: none; height: 44px; padding: 0 36px 0 16px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-cream-2); color: var(--nu-ink); font: inherit; font-size: 14.5px; font-weight: var(--nu-w-medio); cursor: pointer;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor);
}
.tgr__select select:hover { background: var(--nu-line-2); }
.tgr__select::after {
  content: ''; position: absolute; right: 16px; top: 50%; width: 7px; height: 7px; margin-top: -6px; pointer-events: none;
  border-right: 2px solid var(--nu-ink); border-bottom: 2px solid var(--nu-ink); transform: rotate(45deg);
}
.tgr__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.tgr__conta { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 24px var(--lado) 0; }
.tgr__conta-t { margin: 0; color: var(--nu-gray); font-size: 13.5px; font-weight: var(--nu-w-texto); font-variant-numeric: tabular-nums; }
.tgr__conta .tgr__select { display: none; }

/* ——— a grade ——— */
.tgr__grade {
  list-style: none; margin: 16px 0 0; padding: 0 var(--lado);
  /* no máximo três colunas (1440 e 1024), duas no tablet, uma no celular */
  --gap: clamp(16px, 1.8vw, 24px);
  display: grid; gap: var(--gap);
  grid-template-columns: repeat(auto-fill, minmax(min(100%, max(280px, calc((100% - 2 * var(--gap)) / 3))), 1fr));
}
/* o cartão branco: a sombra do branco em repouso; sob o ponteiro sobe 2px e
   ganha a sombra erguida; apertado, afunda; o anel de foco abraça o cartão */
.tgr__cartao {
  display: flex; flex-direction: column; height: 100%; border-radius: var(--nu-r-card); overflow: hidden;
  background: var(--nu-white); box-shadow: var(--nu-shadow-branco); color: inherit;
  container: tese / inline-size; -webkit-tap-highlight-color: transparent;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
@media (hover: hover) {
  .tgr__cartao:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
}
.tgr__cartao:active { transform: scale(.995); transition-duration: var(--nu-dur-rapida); }
.tgr__cartao:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
/* a capa: só quando a tese tem imagem */
.tgr__capa { position: relative; display: block; aspect-ratio: 16 / 9; background: var(--nu-ink); overflow: hidden; }
.tgr__capa-img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  /* a capa traz o selo "PESQUISA" na vertical, desenhado na própria imagem,
     na borda esquerda: no recorte largo ele aparece; o zoom ancorado à direita
     o deixa fora do quadro */
  transform: scale(1.14); transform-origin: 100% 50%;
  transition: transform var(--nu-dur-lenta) var(--nu-ease-saida);
}
.tgr__cartao:hover .tgr__capa-img { transform: scale(1.18); }
.tgr__corpo { flex: 1; display: flex; flex-direction: column; padding: 22px 22px 18px; }
.tgr__topo-l { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 28px; }
.tgr__tema { display: flex; align-items: center; gap: 8px; min-width: 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-caixa); text-transform: uppercase; }
.tgr__ponto { color: var(--nu-sand); }
/* "Seguindo": o estado, no selo da base */
.tgr__seguindo { flex: none; }
.tgr__nome { margin-top: 8px; color: var(--nu-ink); font-size: clamp(22px, 2vw, 27px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.1; text-wrap: balance; transition: color var(--nu-dur-media) var(--nu-ease-cor); }
.tgr__cartao:hover .tgr__nome { color: var(--nu-blue-text); }
/* a tese numa frase, em até duas linhas */
.tgr__frase {
  margin-top: 12px; color: var(--nu-gray-3); font-size: 15.5px; font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
/* os selos da tela de tese (raio 8): convicção, retorno, ativos */
.tgr__selos { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 16px; }
/* os papéis: etiqueta carvão, os primeiros e "+N" */
.tgr__papeis { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; margin-top: 8px; }
.tgr__tk {
  display: inline-flex; align-items: center; min-height: 28px; padding: 0 8px; border-radius: var(--nu-r-tag);
  background: var(--nu-ink); color: var(--nu-white); font-size: 13px; font-weight: var(--nu-w-forte); letter-spacing: .03em; font-variant-numeric: tabular-nums;
}
.tgr__tk--mais { background: var(--nu-cream-2); color: var(--nu-ink); letter-spacing: 0; }
.tgr__tk--estreita { display: none; }
.tgr__fio { flex: none; width: 1.5px; height: 18px; margin: 0 2px; background: var(--nu-line); }
/* o que vier logo antes do pé (os papéis, ou os selos sem papéis) abre o respiro */
.tgr__corpo > :nth-last-child(2) { margin-bottom: 18px; }
/* o pé: o desenho da convicção e a última mudança; a seta que abre */
.tgr__pe {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  margin-top: auto; padding-top: 14px; border-top: 1px solid var(--nu-line-2); min-height: 62px;
}
.tgr__evol { display: flex; align-items: center; gap: 12px; min-width: 0; }
.tgr__conv-linha { flex: none; display: block; width: 84px; height: 30px; color: var(--nu-blue); }
.tgr__mudou { min-width: 0; color: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-texto); line-height: 1.35; font-variant-numeric: tabular-nums; }
.tgr__abrir { flex: none; display: inline-flex; align-items: center; gap: 6px; color: var(--nu-blue-text); font-size: 14.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); white-space: nowrap; }
.tgr__abrir svg { transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.tgr__cartao:hover .tgr__abrir svg { transform: translateX(3px); }

.tgr__cartao--sk { pointer-events: none; }
.tgr__sk-nome { margin-top: 12px; }
.tgr__sk-frase { margin-top: 10px; }
/* vazio e erro: a frase e o próximo passo, no lugar da grade */
.tgr__vazio { padding: 40px var(--lado) 0; animation: nu-surgir var(--nu-dur-media) var(--nu-ease-cor) both; }
.tgr__vazio-t { margin: 0; max-width: 46ch; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.35; }
.tgr__vazio-b { margin-top: 24px; }

/* ——— tablet: a ordem vira menu; celular: a barra rola de lado ——— */
@media (max-width: 1100px) {
  .tgr__seg, .tgr__ordem-r { display: none; }
  .tgr__select { display: block; }
}
@media (max-width: 640px) { .tgr__barra { top: calc(var(--nuh-h, 52px) + var(--nut-h, 36px) - 1px); } }
@media (max-width: 900px) {
  .tgr__barra-in { padding: 6px 0 6px var(--lado); gap: 10px; }
  .tgr__chips { flex: 1; overflow-x: auto; scrollbar-width: none; padding: 2px var(--lado) 2px 0; }
  .tgr__chips::-webkit-scrollbar { display: none; }
  /* a barra inteira rola: o trilho fica do tamanho dele (mais forte que o .ntr do NuTrilho) */
  .tgr__chips .tgr__trilho { max-width: none; overflow: visible; }
  .tgr__ordem { display: none; }
  .tgr__conta .tgr__select { display: block; }
  .tgr__conta .tgr__select select { background: transparent; box-shadow: inset 0 0 0 1px var(--nu-line); }
  .tgr__chip { padding: 0 16px; }
  .tgr__nome { font-size: var(--nu-fs-xl); }
}
/* cartão estreito (celular, duas colunas no tablet): cabem dois papéis e o "+N" conta o terceiro */
@container tese (max-width: 372px) {
  .tgr__tk--3, .tgr__tk--larga { display: none; }
  .tgr__tk--estreita { display: inline-flex; }
}
@media (max-width: 560px) {
  .tgr__conta-rev { display: none; }
  /* o feed do celular: a capa mais baixa, para caber mais tese por tela */
  .tgr__capa { aspect-ratio: 2 / 1; }
}
@media (prefers-reduced-motion: reduce) {
  .tgr__topo > *, .tgr__barra-in, .tgr__conta, .tgr__grade, .tgr__vazio, .tgr__cartao, .tgr__nome, .tgr__capa-img, .tgr__barra, .tgr__chip, .tgr__abrir svg, .tgr__select select { animation: none; transition: none; }
  .tgr__cartao:hover, .tgr__cartao:active, .tgr__chip:active, .tgr__cartao:hover .tgr__abrir svg { transform: none; }
  /* a capa segue recortada (o zoom esconde o selo desenhado na imagem), sem crescer */
  .tgr__cartao:hover .tgr__capa-img { transform: scale(1.14); }
}
</style>
