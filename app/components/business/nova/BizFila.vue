<script setup lang="ts">
/**
 * A fila de aprovação: o coração da /business (05/11/2026, o print do dono).
 * Uma tela de produto encolhida: o que os agentes deixaram pronto na manhã,
 * para o assessor aprovar. Os nomes e os valores são os do elenco da conta
 * interna das calls (ver o topo de content/business/landing.ts), e saem das
 * mesmas listas que os passos do scroll (BizPassos) mostram em detalhe.
 *
 * O BOTÃO DE CADA ITEM É UM LINK DE VERDADE para o passo dele (#passo-<id>).
 * Sem JS, o navegador pula para a âncora; com JS, a fila avisa o BizPassos
 * (evento `bzj:ir`), que rola até o passo ficar em foco e põe o foco nele. O
 * link cobre o item inteiro (::after), e no celular o rótulo vira só a seta.
 *
 * AS LIÇÕES DO HERO ANTIGO, QUE VALEM AQUI:
 *  1. REPOUSO = ESTADO FINAL. O SSR serve a fila pronta: quatro itens, a barra
 *     do fechamento em 6 de 7. Sem JS, com reduced-motion ou com a aba em
 *     segundo plano, o cartão já conta a história inteira.
 *  2. A ANIMAÇÃO NÃO MUDA ALTURA. Tudo está no DOM desde o início; a entrada é
 *     Web Animations com fill "backwards" (opacidade, transform e desfoque), e
 *     só quando o cartão entra na tela. Uma vez, nada em loop.
 *  3. reduced-motion é checado À MÃO, porque o relógio é JS.
 * A entrada inteira dura ~3,4 s, então não pede controle (SC 2.2.2).
 */
import { FILA, type IdDoPasso } from '~/content/business/landing'

const fechamento = FILA.itens.find((i) => i.id === 'fechamento')!

// SSR e reduced-motion: o estado final
const prontos = ref(FILA.itens.length)
const feito = ref(fechamento.feito!)
const raiz = ref<HTMLElement | null>(null)

const palavras = (t: string) => t.split(' ')
const pct = (n: number) => `${(n / fechamento.total!) * 100}%`

/** Pede ao scroll dos passos para levar até o passo; sem ninguém ouvindo, vale a âncora. */
function irAoPasso(id: IdDoPasso, ev: MouseEvent) {
  if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return
  const pedido = new CustomEvent('bzj:ir', { detail: id, cancelable: true })
  window.dispatchEvent(pedido)
  if (pedido.defaultPrevented) ev.preventDefault()
}

let timers: ReturnType<typeof setTimeout>[] = []
let io: IntersectionObserver | null = null
const CURVA = 'cubic-bezier(.2, .8, .2, 1)'
const PASSO = 520 // um item a cada meio segundo
const INICIO = 380

function depois(ms: number, f: () => void) { timers.push(setTimeout(f, ms)) }

function entrar() {
  const el = raiz.value
  if (!el) return
  el.querySelector('.bfl__topo')?.animate(
    [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }],
    { duration: 500, easing: CURVA, fill: 'backwards' },
  )
  prontos.value = 0
  feito.value = 0
  el.querySelectorAll<HTMLElement>('.bfl__item').forEach((item, i) => {
    const t = INICIO + i * PASSO
    item.animate(
      [{ opacity: 0, transform: 'translateY(16px) scale(.985)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
      { duration: 680, delay: t, easing: CURVA, fill: 'backwards' },
    )
    depois(t + 260, () => { prontos.value = i + 1 })
  })
  // a barra do fechamento anda: chega a 5 de 7, respira e fecha o dia em 6
  const iF = FILA.itens.indexOf(fechamento)
  const tF = INICIO + iF * PASSO + 340
  const barra = el.querySelector<HTMLElement>('.bfl__barra-in')
  barra?.animate(
    [{ transform: 'scaleX(0)' }, { transform: `scaleX(${4 / 6})`, offset: 0.55 }, { transform: `scaleX(${5 / 6})`, offset: 0.78 }, { transform: 'none' }],
    { duration: 1900, delay: tF, easing: 'cubic-bezier(.3, .7, .2, 1)', fill: 'backwards' },
  )
  depois(tF, () => { feito.value = 4 })
  depois(tF + 1900 * 0.55, () => { feito.value = 5 })
  depois(tF + 1900 * 0.92, () => { feito.value = fechamento.feito! })
}

onMounted(() => {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  if (document.visibilityState !== 'visible' || !('IntersectionObserver' in window) || !raiz.value) return
  io = new IntersectionObserver((ents) => {
    if (!ents.some((e) => e.isIntersecting)) return
    io?.disconnect(); io = null
    entrar()
  }, { threshold: 0.35 })
  io.observe(raiz.value)
})
onBeforeUnmount(() => {
  io?.disconnect()
  for (const t of timers) clearTimeout(t)
  timers = []
})
</script>

<template>
  <div ref="raiz" class="bfl">
    <div class="bfl__topo">
      <span class="bfl__rotulo">{{ FILA.rotulo }}</span>
      <span class="bfl__quando">{{ FILA.quando }}</span>
      <!-- o contador anda na entrada; para o leitor de tela, vale o estado final -->
      <span class="bfl__prontos" aria-hidden="true"><span class="bfl__vivo" />{{ prontos }} {{ prontos === 1 ? 'pronto' : 'prontos' }}</span>
    </div>

    <ol class="bfl__lista">
      <li v-for="it in FILA.itens" :key="it.id" class="bfl__item" :class="`bfl__item--${it.id}`">
        <div class="bfl__miolo">
          <p class="bfl__tipo">{{ it.tipo }}<span v-if="it.etapa" class="bfl__etapa"> · {{ it.etapa }}</span></p>
          <template v-if="it.id === 'fechamento'">
            <p class="bfl__t"><strong class="bfl__n">{{ feito }} de {{ it.total }}</strong> <template v-for="(w, k) in palavras(it.titulo)" :key="k"><span class="bfl__w">{{ w }}</span>{{ ' ' }}</template></p>
            <div class="bfl__barra" aria-hidden="true"><span class="bfl__barra-in" :style="{ width: pct(it.feito!) }" /></div>
          </template>
          <template v-else>
            <p class="bfl__t"><template v-for="(w, k) in palavras(it.titulo)" :key="k"><span class="bfl__w">{{ w }}</span>{{ ' ' }}</template></p>
            <p v-if="it.linha" class="bfl__l">{{ it.linha }}</p>
          </template>
        </div>
        <a
          :href="`#passo-${it.id}`" class="bfl__acao" :class="{ 'bfl__acao--cheia': it.id === 'atendimento' }"
          @click="irAoPasso(it.id, $event)"
        >
          <span class="bfl__acao-t">{{ it.acao }}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </a>
      </li>
    </ol>
  </div>
</template>

<style scoped>
/* ——— o cartão ——— */
.bfl {
  position: relative; border-radius: var(--nu-r-card); padding: clamp(18px, 2.4vw, 26px);
  color: var(--nu-cream-text); background: var(--nu-navy);
  /* sombra tingida de navy: o anel de 1px faz a borda, a grande dá a altura */
  box-shadow: 0 0 0 1px var(--nu-white-14) inset, 0 40px 80px -40px rgba(12, 21, 36, .55), 0 18px 40px -24px rgba(12, 21, 36, .35);
}
.bfl::before {
  /* a luz de cima: uma borda fina que brilha no topo, como o vidro do app */
  content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: linear-gradient(180deg, var(--nu-white-14), transparent 22%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; padding: 1px;
}

/* ——— o topo do cartão ——— */
.bfl__topo { display: flex; align-items: center; gap: 8px 12px; flex-wrap: wrap; padding: 0 4px 14px; }
.bfl__rotulo { color: var(--nu-cream-text); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
.bfl__quando { color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 600; letter-spacing: .1em; text-transform: uppercase; font-variant-numeric: tabular-nums; }
.bfl__prontos {
  margin-left: auto; display: inline-flex; align-items: center; gap: 7px; height: 26px; padding: 0 11px; border-radius: var(--nu-r-pill);
  background: var(--nu-white-14); color: var(--nu-cream-text); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap;
}
.bfl__vivo { width: 6px; height: 6px; border-radius: 50%; background: var(--nu-green-soft); box-shadow: 0 0 0 3px rgba(143, 240, 181, .18); }

/* ——— os itens ——— */
.bfl__lista { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.bfl__item {
  position: relative; display: flex; align-items: center; gap: 14px; padding: 14px 14px 14px 16px; border-radius: var(--nu-r-tile);
  background: var(--nu-white-14); background: color-mix(in srgb, var(--nu-white) 6%, transparent);
  transition: background .2s ease, transform .3s cubic-bezier(.2, .8, .2, 1);
}
.bfl__item:hover { background: color-mix(in srgb, var(--nu-white) 11%, transparent); transform: translateX(2px); }
.bfl__miolo { flex: 1; min-width: 0; }
.bfl__tipo { margin: 0; color: var(--nu-cream-text-55); font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
.bfl__etapa { color: var(--nu-cream-text-45); }
.bfl__t { margin: 5px 0 0; color: var(--nu-cream-text); font-size: var(--nu-fs-md); font-weight: 600; letter-spacing: -0.01em; line-height: 1.3; }
.bfl__w { display: inline-block; }
.bfl__n { font-weight: 800; font-variant-numeric: tabular-nums; }
.bfl__l { margin: 3px 0 0; color: var(--nu-cream-text-70); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.4; }
.bfl__barra { position: relative; height: 6px; margin-top: 10px; border-radius: 3px; background: var(--nu-white-14); overflow: hidden; }
.bfl__barra-in {
  position: absolute; left: 0; top: 0; bottom: 0; border-radius: 3px; transform-origin: left center;
  background: linear-gradient(90deg, var(--nu-blue), var(--nu-blue-soft));
}

/* a ação de cada item: discreta, acende no hover; a do atendimento é o botão.
   O ::after estica o link sobre o item inteiro. */
.bfl__acao {
  flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px; height: 30px; padding: 0 10px 0 12px; border-radius: var(--nu-r-pill);
  color: var(--nu-cream-text-70); font-size: var(--nu-fs-xs); font-weight: 700; white-space: nowrap;
  box-shadow: inset 0 0 0 1px var(--nu-white-14); transition: color .2s, background .2s, box-shadow .2s;
}
.bfl__acao::after { content: ''; position: absolute; inset: 0; border-radius: var(--nu-r-tile); }
.bfl__acao:focus-visible { outline: none; }
.bfl__acao:focus-visible::after { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }
.bfl__item:hover .bfl__acao { color: var(--nu-cream-text); box-shadow: inset 0 0 0 1px var(--nu-white-35); }
.bfl__acao--cheia, .bfl__item:hover .bfl__acao--cheia { background: var(--nu-biz-lavanda); color: var(--nu-navy); box-shadow: none; }
.bfl__item:hover .bfl__acao--cheia { background: var(--nu-biz-lavanda-hover); }
.bfl__acao svg { transition: transform .25s cubic-bezier(.2, .8, .2, 1); }
.bfl__item:hover .bfl__acao svg { transform: translateX(2px); }

@media (max-width: 520px) {
  .bfl__item { padding: 12px; gap: 10px; }
  /* no celular a ação vira só a seta (o rótulo fica para o leitor de tela) */
  .bfl__acao:not(.bfl__acao--cheia) { width: 30px; padding: 0; justify-content: center; }
  .bfl__acao:not(.bfl__acao--cheia) .bfl__acao-t { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .bfl__t { font-size: var(--nu-fs-md); }
  .bfl__quando { order: 3; width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .bfl__item { transition: background .2s ease; }
  .bfl__item:hover, .bfl__item:hover .bfl__acao svg { transform: none; }
}
</style>
