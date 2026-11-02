<script setup lang="ts">
// /teses, direção 2 (PROTÓTIPO, ?teses=2 no dev, 02/11/2026): "A linha d'água".
// O momento assinatura das Teses no app (RedentiaApp/App/TeseWaterline.swift)
// trazido ao site, no escuro do herói "A noite" da home: o Ibovespa do último
// pregão é a superfície, uma linha fina; cada tese é uma luz presa à linha por
// um fio. A que foi melhor que o índice boia acima dele, pelo quanto foi; a que
// ficou atrás afunda. O tamanho da luz é a convicção.
//
// O dado é o do app: a média simples da variação dos papéis da tese no pregão
// do Ibovespa (server/utils/teses-painel.ts). Papel sem cotação daquele pregão
// fica de fora; tese com menos da metade dos papéis não entra na água.
// Embaixo, o quadro: as teses na mesma ordem, cada uma com a convicção.
import type { ThesisCardApi } from '~/types/market'
import { contextoDaTese } from '~/composables/useTesesVitrine'
import { distancia, naAgua, pctDoDia } from '~/utils/tesesPainel'

const props = defineProps<{ cards: ThesisCardApi[]; favoritos: string[] }>()
const { teses, painel, estado, montado } = useTesesVitrine(toRef(props, 'cards'), toRef(props, 'favoritos'))

const naLinha = computed(() => naAgua(teses.value, painel.value))

const SUPERFICIE = 0.46 // a linha, em fração da altura do palco
const raio = (c: number | null) => 5 + Math.max(0, (c ?? 80) - 80) * 0.45

const desenho = computed(() => {
  const l = naLinha.value
  if (!l.length) return null
  // alterna quem boia e quem afunda da esquerda para a direita: dois vizinhos
  // nunca disputam o mesmo lado da linha (e o nome de um não cai no outro)
  const sobe = l.filter((t) => t.gap > 0)
  const desce = l.filter((t) => t.gap <= 0).reverse()
  const ordem: typeof l = []
  while (sobe.length || desce.length) {
    if (sobe.length) ordem.push(sobe.shift()!)
    if (desce.length) ordem.push(desce.shift()!)
  }
  const maxSobe = Math.max(0.01, ...l.map((t) => t.gap))
  const maxDesce = Math.max(0.01, ...l.map((t) => -t.gap))
  // a mesma escala em cima e embaixo: um ponto percentual mede o mesmo dos dois lados
  const k = Math.min((SUPERFICIE - 0.16) / maxSobe, (1 - SUPERFICIE - 0.18) / maxDesce)
  const melhor = l[0]!.slug
  const pior = l.length > 1 ? l[l.length - 1]!.slug : null
  const n = ordem.length
  return ordem.map((t, i) => {
    const y = SUPERFICIE - t.gap * k
    return {
      ...t,
      // 0 → 1 da esquerda para a direita; o CSS põe no palco (as bordas mudam no celular)
      k: n === 1 ? 0.5 : i / (n - 1),
      y: y * 100,
      r: raio(t.conviccao),
      boia: t.gap > 0,
      // quanto mais fundo, mais apagado (como no app)
      brilho: t.gap > 0 ? 1 : Math.max(0.42, 1 - Math.abs(t.gap) * 0.22),
      destaque: t.slug === melhor || t.slug === pior,
    }
  })
})

const ibov = computed(() => painel.value?.ibov ?? null)
// 'Pregão de sexta, 30/10' / 'de ontem, 30/10' / 'de hoje' (o relativo só depois do mount)
const pregao = computed(() => {
  const d = ibov.value?.data
  if (!d) return null
  const ddmm = `${d.slice(8, 10)}/${d.slice(5, 7)}`
  const quando = montado.value ? quandoFoi(d) : null
  if (quando === 'hoje') return 'de hoje'
  if (!quando || quando.startsWith('em ')) return `de ${ddmm}`
  return `de ${quando.replace(/^(na|no) /, '')}, ${ddmm}`
})
const acima = computed(() => naLinha.value.filter((t) => t.gap > 0).length)

// o quadro: na ordem da água quando ela existe; senão, por convicção
const quadro = computed(() => {
  const ordem = new Map(naLinha.value.map((t, i) => [t.slug, i]))
  return [...teses.value].sort((a, b) =>
    ordem.size ? (ordem.get(a.slug) ?? 99) - (ordem.get(b.slug) ?? 99) : (b.conviccao ?? 0) - (a.conviccao ?? 0))
})
const gapDe = (slug: string) => naLinha.value.find((t) => t.slug === slug) ?? null

const rotuloDaLuz = (t: { titulo: string; pct: number; gap: number }) =>
  `${t.titulo}: ${pctDoDia(t.pct)} no pregão, ${t.gap > 0 ? `${distancia(t.gap)} acima do Ibovespa` : t.gap < 0 ? `${distancia(-t.gap).replace(/^\+/, '')} abaixo do Ibovespa` : 'igual ao Ibovespa'}`
</script>

<template>
  <div class="tla">
    <section class="tla__ceu" aria-labelledby="tla-titulo">
      <div class="tla__texto">
        <p class="tla__produto">Teses de investimento</p>
        <h1 id="tla-titulo" class="tla__titulo">A linha d’água.</h1>
        <p class="tla__dek">O Ibovespa é a superfície. Cada luz é uma tese: acima, as que foram melhor que o índice no pregão; abaixo, as que ficaram atrás. O tamanho é a convicção.</p>
        <p class="tla__carimbo">
          <template v-if="ibov && pregao">
            <span>Pregão {{ pregao }}</span>
            <span class="tla__carimbo-ponto" aria-hidden="true">·</span>
            <span>Ibovespa <b class="tla__num">{{ pctDoDia(ibov.pct) }}</b></span>
            <template v-if="naLinha.length">
              <span class="tla__carimbo-ponto" aria-hidden="true">·</span>
              <span>{{ acima }} de {{ naLinha.length }} acima da linha</span>
            </template>
          </template>
          <NuSkeleton v-else-if="estado === 'esperando'" tone="navy" variant="line" width="300px" height="16px" />
        </p>
      </div>

      <!-- o palco: altura fixa, a água desenha dentro (sem CLS) -->
      <div class="tla__palco" :class="{ 'tla__palco--pronto': desenho }">
        <div class="tla__agua" aria-hidden="true" />
        <div class="tla__linha" aria-hidden="true" />
        <span v-if="ibov" class="tla__ibov" aria-hidden="true">Ibovespa <b class="tla__num">{{ pctDoDia(ibov.pct) }}</b></span>

        <template v-if="desenho">
          <span
            v-for="t in desenho" :key="`f-${t.slug}`" class="tla__fio" :class="{ 'tla__fio--boia': t.boia }" aria-hidden="true"
            :style="{ '--k': t.k, top: `${Math.min(t.y, SUPERFICIE * 100)}%`, height: `${Math.abs(t.y - SUPERFICIE * 100)}%` }"
          />
          <NuxtLink
            v-for="t in desenho" :key="t.slug" :to="t.href"
            class="tla__luz" :class="{ 'tla__luz--boia': t.boia, 'tla__luz--destaque': t.destaque, 'tla__luz--esq': t.k < 0.08, 'tla__luz--dir': t.k > 0.92 }"
            :style="{ '--k': t.k, '--y': `${t.y}%`, '--d': `${SUPERFICIE * 100 - t.y}%`, '--r': `${t.r}px`, '--brilho': t.brilho }"
            :aria-label="rotuloDaLuz(t)"
          >
            <span class="tla__orbe" aria-hidden="true" />
            <span class="tla__nome" aria-hidden="true">
              <span class="tla__nome-t">{{ t.titulo }}</span>
              <span class="tla__nome-v">{{ distancia(t.gap) }}</span>
            </span>
          </NuxtLink>
        </template>
        <template v-else-if="estado === 'esperando'">
          <span v-for="i in 10" :key="i" class="tla__espera" :style="{ '--k': (i - 1) / 9 }"><NuSkeleton tone="navy" variant="circle" width="14px" height="14px" /></span>
        </template>
        <p v-else class="tla__falhou">O pregão das teses não carregou agora. O quadro abaixo segue com a convicção de cada uma.</p>
      </div>
      <!-- reservado desde o SSR (sem CLS), visível quando a água desenha -->
      <p class="tla__legenda" :class="{ 'tla__legenda--espera': !desenho }" :aria-hidden="!desenho">A altura é a distância até o Ibovespa, em pontos percentuais: a média simples dos papéis de cada tese no mesmo pregão.</p>
    </section>

    <!-- o quadro -->
    <section class="tla__quadro" aria-labelledby="tla-quadro">
      <div class="tla__quadro-topo">
        <h2 id="tla-quadro" class="tla__quadro-titulo">As {{ teses.length }} teses.</h2>
        <p class="tla__quadro-apoio">Cada uma revalidada a cada estudo, com a convicção de 0 a 100.</p>
      </div>
      <ul class="tla__grade">
        <li v-for="t in quadro" :key="t.slug">
          <NuxtLink v-contexto-chat="contextoDaTese(t)" :to="t.href" class="tla__cartao">
            <span class="tla__cartao-topo">
              <span class="tla__ponto" :class="{ 'tla__ponto--boia': (gapDe(t.slug)?.gap ?? 0) > 0, 'tla__ponto--sem': !gapDe(t.slug) }" :style="{ '--r': `${raio(t.conviccao) * 0.7}px` }" aria-hidden="true" />
              <span class="tla__tema">{{ t.tema }}<span v-if="t.seguindo" class="tla__seguindo">Seguindo</span></span>
              <span class="tla__dia">
                <template v-if="gapDe(t.slug)">
                  <b class="tla__num" :class="(gapDe(t.slug)!.gap) > 0 ? 'tla__dia--boia' : ''">{{ distancia(gapDe(t.slug)!.gap) }}</b>
                </template>
                <NuSkeleton v-else-if="estado === 'esperando'" tone="navy" variant="line" width="64px" height="14px" />
              </span>
            </span>
            <span class="tla__cartao-nome">{{ t.titulo }}</span>
            <span class="tla__cartao-frase">{{ t.frase }}</span>
            <span class="tla__cartao-pe">
              <TesesLogos :tickers="t.tickers" :mais="t.mais" :tamanho="24" tom="escuro" :nomes="false" />
              <span v-if="t.conviccao != null" class="tla__conv">
                <span class="tla__conv-linha">
                  <TesesConviccaoLinha v-if="t.serie" :serie="t.serie" :altura="16" :largura="72" />
                </span>
                <span class="tla__conv-n"><span class="tla__conv-r">Convicção</span> <b class="tla__num">{{ t.conviccao }}</b></span>
              </span>
            </span>
          </NuxtLink>
        </li>
      </ul>
      <p v-if="!teses.length" class="tla__falhou tla__falhou--quadro">As teses não carregaram agora. Recarregue a página em alguns minutos.</p>
    </section>
  </div>
</template>

<style scoped>
.tla { --g: clamp(22px, 5.5vw, 80px); background: var(--nu-agora-bg); color: var(--nu-agora-texto); }
.tla__num { font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }

/* ——— o céu: navy no alto, o preto onde a água fica (o herói "A noite") ——— */
.tla__ceu {
  position: relative; isolation: isolate; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: clamp(48px, 5.4vw, 80px) var(--g) clamp(40px, 4.4vw, 64px);
  background:
    radial-gradient(60% 40% at 50% 0%, color-mix(in srgb, var(--nu-blue) 16%, transparent), transparent),
    linear-gradient(180deg, var(--nu-navy) 0%, color-mix(in srgb, var(--nu-navy) 55%, var(--nu-agora-bg)) 46%, var(--nu-agora-bg) 82%);
  animation: nu-fade .5s ease both;
}
.tla__texto { display: flex; flex-direction: column; align-items: center; max-width: 820px; }
.tla__produto { margin: 0; color: var(--nu-agora-texto); font-size: var(--nu-fs-lg); font-weight: 700; letter-spacing: -0.02em; }
.tla__titulo {
  margin: 14px 0 0; font-size: clamp(40px, 5.6vw, 80px); font-weight: 500; letter-spacing: -0.05em; line-height: 1.02;
  color: var(--nu-agora-texto);
  background: linear-gradient(180deg, var(--nu-agora-texto) 35%, var(--nu-cream-text-70) 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.tla__dek { margin: 18px 0 0; max-width: 56ch; color: var(--nu-agora-sub); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; text-wrap: balance; }
.tla__carimbo {
  display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 4px 10px; min-height: 24px;
  margin: 22px 0 0; color: var(--nu-cream-text-70); font-size: var(--nu-fs-sm); font-weight: 600;
}
.tla__carimbo b { color: var(--nu-agora-texto); }
.tla__carimbo-ponto { color: var(--nu-cream-text-45); }

/* ——— o palco ——— */
.tla__palco {
  --s: 46%; /* a superfície (SUPERFICIE no script) */
  /* onde a primeira e a última luz ficam (a pílula do Ibovespa mora à esquerda) */
  --x0: 15%; --x1: 97%;
  position: relative; width: min(1200px, 100%); height: clamp(320px, 34vw, 470px);
  margin-top: clamp(28px, 3.6vw, 52px);
}
.tla__agua, .tla__linha {
  -webkit-mask-image: linear-gradient(90deg, transparent, var(--nu-ink) 10%, var(--nu-ink) 90%, transparent);
  mask-image: linear-gradient(90deg, transparent, var(--nu-ink) 10%, var(--nu-ink) 90%, transparent);
}
.tla__agua {
  position: absolute; left: calc(var(--g) * -1); right: calc(var(--g) * -1); top: var(--s); bottom: -80px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--nu-blue) 9%, transparent), transparent 70%);
  pointer-events: none;
}
.tla__linha {
  position: absolute; left: calc(var(--g) * -1); right: calc(var(--g) * -1); top: var(--s); height: 1px;
  background: var(--nu-cream-text-50);
}
.tla__ibov {
  position: absolute; left: 0; top: var(--s); transform: translateY(-50%); z-index: 2;
  padding: 6px 12px; border-radius: var(--nu-r-pill); background: var(--nu-agora-bg);
  box-shadow: 0 0 0 1px var(--nu-white-16);
  color: var(--nu-cream-text-70); font-size: var(--nu-fs-xs); font-weight: 600; white-space: nowrap;
}
.tla__ibov b { color: var(--nu-agora-texto); }

/* cada luz: o ponto (left/top) é o centro do orbe */
.tla__luz, .tla__fio, .tla__espera { left: calc(var(--x0) + var(--k) * (var(--x1) - var(--x0))); }
/* a luz é uma coluna da altura do palco: o translate em % dela mede o palco,
   e a subida da superfície anima só transform (sem layout, sem CLS) */
.tla__luz { position: absolute; top: 0; bottom: 0; width: 0; z-index: 1; color: inherit; }
.tla__fio {
  position: absolute; width: 1px; margin-left: -0.5px; transform-origin: top;
  background: linear-gradient(180deg, var(--nu-cream-text-12), var(--nu-cream-text-45));
}
.tla__fio--boia {
  transform-origin: bottom;
  background: linear-gradient(0deg, var(--nu-cream-text-45), color-mix(in srgb, var(--nu-teses-sol) 60%, transparent));
}
.tla__fio:not(.tla__fio--boia) { background: linear-gradient(180deg, var(--nu-cream-text-45), var(--nu-cream-text-12)); }
.tla__orbe {
  position: absolute; left: calc(var(--r) * -1); top: calc(var(--y) - var(--r));
  width: calc(var(--r) * 2); height: calc(var(--r) * 2); border-radius: 50%;
  background: var(--nu-cream-text); opacity: calc(0.18 + 0.42 * var(--brilho));
  transition: transform .25s cubic-bezier(.2, .8, .2, 1);
}
.tla__luz--boia .tla__orbe {
  opacity: 1; background: var(--nu-white);
  box-shadow:
    0 0 0 calc(var(--r) * 0.5) color-mix(in srgb, var(--nu-teses-sol) 55%, transparent),
    0 0 calc(var(--r) * 2.6) calc(var(--r) * 1.1) var(--nu-teses-sol-halo),
    0 0 calc(var(--r) * 7) calc(var(--r) * 2.4) color-mix(in srgb, var(--nu-teses-sol-halo) 45%, transparent);
}
.tla__luz:hover .tla__orbe, .tla__luz:focus-visible .tla__orbe { transform: scale(1.25); }
.tla__luz:focus-visible { outline: none; }
.tla__luz:focus-visible .tla__orbe { outline: 2px solid var(--nu-blue-soft); outline-offset: 6px; }

.tla__nome {
  position: absolute; left: 0; transform: translateX(-50%); width: max-content; max-width: 128px;
  display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center; pointer-events: none;
  opacity: 0.88; transition: opacity .2s;
}
.tla__luz--boia .tla__nome { bottom: calc(100% - var(--y) + var(--r) + 12px); }
.tla__luz:not(.tla__luz--boia) .tla__nome { top: calc(var(--y) + var(--r) + 12px); }
.tla__nome-t { color: var(--nu-cream-text-78); font-size: var(--nu-fs-xs); font-weight: 600; line-height: 1.3; text-wrap: balance; }
.tla__nome-v { color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
.tla__luz--boia .tla__nome-v { color: var(--nu-teses-sol); }
.tla__luz:hover .tla__nome, .tla__luz:focus-visible .tla__nome { opacity: 1; }
/* nas pontas o nome não sai do palco: alinha para dentro */
.tla__luz--esq .tla__nome { transform: translateX(calc(var(--r) * -1)); align-items: flex-start; text-align: left; }
.tla__luz--dir .tla__nome { transform: translateX(calc(-100% + var(--r))); align-items: flex-end; text-align: right; }

/* a entrada: as luzes saem da superfície até o lugar delas, uma vez */
.tla__palco--pronto .tla__luz { animation: tla-sobe 1.3s cubic-bezier(.2, .8, .2, 1) both; }
.tla__palco--pronto .tla__fio { animation: tla-fio 1.3s cubic-bezier(.2, .8, .2, 1) both; }
@keyframes tla-sobe { from { transform: translateY(var(--d)); opacity: 0; } 25% { opacity: 1; } }
@keyframes tla-fio { from { transform: scaleY(0); } }

.tla__espera { position: absolute; top: var(--s); transform: translate(-50%, -50%); }
.tla__falhou {
  position: absolute; left: 50%; top: calc(var(--s) + 28px); transform: translateX(-50%); width: min(480px, 100%); margin: 0;
  color: var(--nu-cream-text-70); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5;
}
.tla__legenda--espera { visibility: hidden; }
.tla__legenda { margin: 8px 0 0; max-width: 62ch; color: var(--nu-cream-text-45); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.5; }

/* ——— o quadro ——— */
.tla__quadro { padding: clamp(48px, 6vw, 88px) var(--g) clamp(64px, 8vw, 110px); background: var(--nu-agora-bg); }
.tla__quadro-topo { display: flex; align-items: baseline; justify-content: space-between; gap: 8px 24px; flex-wrap: wrap; }
.tla__quadro-titulo { margin: 0; color: var(--nu-agora-texto); font-size: var(--nu-fs-h2-sm); font-weight: 500; letter-spacing: -0.045em; line-height: 1.05; }
.tla__quadro-apoio { margin: 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-md); font-weight: 500; }
.tla__grade {
  list-style: none; margin: clamp(24px, 3vw, 40px) 0 0; padding: 0;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr)); gap: 14px;
}
.tla__cartao {
  display: flex; flex-direction: column; height: 100%; padding: 22px 22px 18px; border-radius: var(--nu-r-panel);
  background: var(--nu-agora-cartao); box-shadow: inset 0 0 0 1px var(--nu-agora-linha); color: inherit;
  transition: transform .2s, background .2s;
}
.tla__cartao:hover { transform: translateY(-2px); background: color-mix(in srgb, var(--nu-agora-cartao) 82%, var(--nu-white)); }
.tla__cartao:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }
.tla__cartao-topo { display: flex; align-items: center; gap: 10px; min-height: 24px; }
.tla__ponto {
  flex-shrink: 0; width: calc(var(--r) * 2); height: calc(var(--r) * 2); border-radius: 50%;
  background: var(--nu-cream-text-45);
}
.tla__ponto--boia { background: var(--nu-white); box-shadow: 0 0 0 3px color-mix(in srgb, var(--nu-teses-sol) 45%, transparent), 0 0 14px 4px var(--nu-teses-sol-halo); }
.tla__ponto--sem { background: var(--nu-white-14); }
.tla__tema { flex: 1; min-width: 0; display: flex; align-items: center; color: var(--nu-agora-sub); font-size: var(--nu-fs-xs); font-weight: 700; }
.tla__seguindo {
  display: inline-flex; align-items: center; height: 20px; padding: 0 8px; margin-left: 8px; border-radius: var(--nu-r-pill);
  background: var(--nu-green-soft-22); color: var(--nu-green-soft); font-size: var(--nu-fs-xs); font-weight: 700;
}
.tla__dia { display: inline-flex; align-items: center; height: 20px; color: var(--nu-cream-text-60); font-size: var(--nu-fs-sm); }
.tla__dia--boia { color: var(--nu-teses-sol); }
.tla__cartao-nome { margin-top: 16px; color: var(--nu-agora-texto); font-size: var(--nu-fs-xl); font-weight: 600; letter-spacing: -0.02em; line-height: 1.25; }
.tla__cartao-frase {
  margin-top: 6px; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.tla__cartao-pe { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: auto; padding-top: 18px; }
.tla__conv { display: inline-flex; align-items: center; gap: 10px; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 500; }
.tla__conv-linha { display: block; width: 72px; height: 16px; color: var(--nu-cream-text-45); }
.tla__conv-n b { color: var(--nu-agora-texto); }
.tla__conv-r { font-size: var(--nu-fs-xs); }
.tla__falhou--quadro { position: static; transform: none; margin-top: 24px; }

/* ——— tablet e celular: só a que mais boiou e a que mais afundou levam o nome ——— */
@media (max-width: 900px) {
  .tla__luz:not(.tla__luz--destaque) .tla__nome { display: none; }
  .tla__nome { max-width: 116px; }
}
@media (max-width: 560px) {
  .tla__palco { height: 340px; --x0: 7%; --x1: 93%; }
  .tla__ibov { display: none; }
  /* o carimbo quebra em duas linhas no celular: reservado antes de o dado chegar */
  .tla__carimbo { min-height: 44px; align-content: flex-start; }
  .tla__orbe { scale: 0.85; }
}
@media (prefers-reduced-motion: reduce) {
  .tla__ceu, .tla__palco--pronto .tla__luz, .tla__palco--pronto .tla__fio { animation: none; }
  .tla__orbe, .tla__cartao { transition: none; }
}
</style>
