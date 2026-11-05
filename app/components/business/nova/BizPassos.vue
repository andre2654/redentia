<script setup lang="ts">
/**
 * Os quatro passos da fila, um por tela: o scroll travado da /business
 * (05/11/2026). O dono escolheu a variação 1 e pediu: "depois do hero dedique
 * aqueles scrolls personalizados para explicar melhor esses pontos". "Aqueles
 * scrolls" são o gesto da Decade que a /business já teve no RbJornada ("um dia
 * de mesa", com foto fixa, modal do app e régua de progresso) e que ele pediu
 * de volta em 15/10 ("você tirou aquele visual que eu gostava do scroll"). A
 * mecânica é a mesma; o idioma é o da variação 1 (navy, serifa nos títulos,
 * Jakarta no corpo) e cada visual é o "zoom" de um item da fila.
 *
 * COMO FUNCIONA, EM TRÊS CAMADAS:
 *  1. SEM JS (e no HTML que o Google lê): os quatro passos empilhados, cada
 *     texto seguido do seu visual, completos. É o @media (scripting: none) e o
 *     ponto de partida do CSS.
 *  2. COM JS (@media (scripting: enabled)): uma grade só. O texto passa à
 *     esquerda (no celular, embaixo) e os quatro visuais ficam empilhados no
 *     mesmo lugar, presos à direita (no celular, em cima), com a foto e a
 *     régua 01–04. Cada visual é sticky dentro da área da grade inteira, então
 *     não há elemento duplicado: o mesmo DOM serve às duas camadas. O CSS não
 *     espera a hidratação, e o SSR já marca o passo 01 em foco.
 *  3. A ANIMAÇÃO só embeleza: o passo em foco acende, o visual troca com um
 *     fade curto e as linhas do cartão sobem uma vez. Com reduced-motion a
 *     troca é seca e nada sobe.
 *
 * NÃO PRENDE O TECLADO E NÃO SEQUESTRA A ROLAGEM: a página rola sozinha
 * (Page Down, espaço, setas), e o passo em foco é só o que está na linha de
 * leitura. A régua tem quatro links (#passo-<id>): o Tab passa por eles, e
 * cada um, ao receber o foco pelo teclado, leva ao seu passo. O botão de cada
 * item da fila (BizFila) dispara `bzj:ir` e cai no mesmo irPara.
 *
 * Os visuais não são imagem: são texto (o leitor de tela lê na ordem, passo e
 * visual), e o visual fora de foco fica transparente, não escondido.
 */
import {
  ATENDIMENTO, CARTEIRAS, CLIENTES_FORA, FECHAMENTO, FILA, PASSOS, PAUTA, reaisCurtos, totalFora,
  type IdDoPasso,
} from '~/content/business/landing'

const n2 = (i: number) => String(i + 1).padStart(2, '0')
const total = totalFora()
const fatia = (v: number) => `${((v / total) * 100).toFixed(1)}%`
const conciliadas = CARTEIRAS.filter((c) => c.ok)
const pendente = CARTEIRAS.find((c) => !c.ok)!
const itemFechamento = FILA.itens.find((i) => i.id === 'fechamento')!
/** primeiro nome, os do meio e o último: no celular os do meio somem */
const partes = (n: string): [string, string, string] => {
  const p = n.split(' ')
  return p.length < 3 ? [p[0]!, '', p.slice(1).join(' ')] : [p[0]!, p.slice(1, -1).join(' '), p.at(-1)!]
}
const iniciais = (n: string) => n.split(' ').filter((p) => p.length > 2).slice(0, 2).map((p) => p[0]).join('')

const ativo = ref(0)
const progresso = ref(0)
const passos: HTMLElement[] = []
const palco = ref<HTMLElement | null>(null)
let raf = 0
let reduz = false

const DESKTOP = '(min-width: 960px)'
const alturaDoTopo = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nuh-h')) || 72

/** A linha de leitura, em px da janela; null quando os passos estão empilhados. */
function linhaDeFoco(): number | null {
  const p = palco.value
  if (!p || getComputedStyle(p).position !== 'sticky') return null
  if (window.matchMedia(DESKTOP).matches) return window.innerHeight / 2
  // no celular o visual fica em cima: a linha é o meio do que sobra embaixo
  return (alturaDoTopo() + p.offsetHeight + window.innerHeight) / 2
}

function medir() {
  raf = 0
  const y = linhaDeFoco()
  if (y === null || !passos.length) return
  let i = 0
  passos.forEach((el, k) => { if (el.getBoundingClientRect().top <= y) i = k })
  const r = passos[i]!.getBoundingClientRect()
  ativo.value = i
  progresso.value = Math.min(1, Math.max(0, (y - r.top) / r.height))
}
const agendar = () => { if (!raf) raf = requestAnimationFrame(medir) }

/** Rola até o passo `i` ficar na linha de leitura (empilhado: até o topo dele). */
function irPara(i: number, foco = true) {
  const el = passos[i]
  if (!el) return
  const y = linhaDeFoco()
  const r = el.getBoundingClientRect()
  const alvo = y === null
    ? window.scrollY + r.top - alturaDoTopo() - 16
    : window.scrollY + r.top + r.height / 2 - y + 1
  window.scrollTo({ top: Math.max(0, alvo), behavior: reduz ? 'auto' : 'smooth' })
  if (foco) el.focus({ preventScroll: true })
}

function naRegua(i: number, ev: MouseEvent) {
  if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return
  ev.preventDefault()
  irPara(i)
}
/** O Tab passa pela régua: o link que recebe o foco do teclado leva ao passo dele. */
function focoNaRegua(i: number, ev: FocusEvent) {
  if ((ev.target as HTMLElement).matches(':focus-visible')) irPara(i, false)
}
function pedidoDaFila(ev: Event) {
  const i = PASSOS.findIndex((p) => p.id === (ev as CustomEvent<IdDoPasso>).detail)
  if (i < 0) return
  ev.preventDefault()
  irPara(i)
}

onMounted(() => {
  reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.addEventListener('scroll', agendar, { passive: true })
  window.addEventListener('resize', agendar)
  window.addEventListener('bzj:ir', pedidoDaFila)
  medir()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', agendar)
  window.removeEventListener('resize', agendar)
  window.removeEventListener('bzj:ir', pedidoDaFila)
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <section id="passos" class="bzj" aria-labelledby="bzj-titulo">
    <h2 id="bzj-titulo" class="bzj__sr">Os quatro pontos da fila</h2>
    <div class="bzj__grade">
      <!-- a foto e a régua: presas no lugar dos visuais (só com JS) -->
      <div ref="palco" class="bzj__palco">
        <!-- lounge.webp: o salão de vidro, sem rosto reconhecível. lazy: a seção
             está abaixo da fila e não disputa o LCP. -->
        <img src="/business-hero/lounge.webp" alt="" class="bzj__foto" width="620" height="620" loading="lazy" decoding="async" fetchpriority="low">
        <span class="bzj__veu" aria-hidden="true" />
        <nav class="bzj__regua" aria-label="Os quatro passos">
          <a
            v-for="(p, i) in PASSOS" :key="p.id" :href="`#passo-${p.id}`"
            class="bzj__marca" :class="{ 'bzj__marca--on': i === ativo, 'bzj__marca--feita': i < ativo }"
            :aria-label="`${n2(i)}, ${p.rotulo}`" :aria-current="i === ativo ? 'step' : undefined"
            :style="i === ativo ? { '--p': progresso } : undefined"
            @click="naRegua(i, $event)" @focus="focoNaRegua(i, $event)"
          >
            <span class="bzj__marca-n" aria-hidden="true">{{ n2(i) }}</span>
            <span class="bzj__marca-trilho" aria-hidden="true"><span class="bzj__marca-in" /></span>
          </a>
        </nav>
      </div>

      <template v-for="(p, i) in PASSOS" :key="p.id">
        <article
          :id="`passo-${p.id}`" :ref="(el) => { if (el) passos[i] = el as HTMLElement }"
          class="bzj__passo" :class="{ 'bzj__passo--on': i === ativo }" :style="{ '--r': i + 1, '--rm': i + 2 }"
          tabindex="-1" :aria-labelledby="`bzj-t-${p.id}`"
        >
          <p class="bzj__n">{{ n2(i) }} · {{ p.rotulo }}</p>
          <h3 :id="`bzj-t-${p.id}`" class="bzj__t">{{ p.titulo }}</h3>
          <p class="bzj__d">{{ p.apoio }}</p>
        </article>

        <div class="bzj__vis" :class="{ 'bzj__vis--on': i === ativo }" :style="{ '--r': i + 1, '--rm': i + 2 }">
          <!-- ——— 01 · captação ——— -->
          <div v-if="p.id === 'captacao'" class="bzv">
            <div class="bzv__topo bzv__k" style="--k: 0">
              <span class="bzv__rot">Fora do escritório</span>
              <span class="bzv__meta">{{ CLIENTES_FORA.length }} clientes</span>
            </div>
            <p class="bzv__grande bzv__k" style="--k: 1">{{ reaisCurtos(total) }}</p>
            <div class="bzv__mapa bzv__k" style="--k: 2" aria-hidden="true">
              <span v-for="(c, k) in CLIENTES_FORA" :key="c.slug" class="bzv__fatia" :class="{ 'bzv__fatia--top': k === 0 }" :style="{ width: fatia(c.valor) }" />
            </div>
            <ul class="bzv__lista">
              <li v-for="(c, k) in CLIENTES_FORA" :key="c.slug" class="bzv__cli bzv__k" :class="{ 'bzv__cli--top': k === 0 }" :style="{ '--k': k + 3 }">
                <img :src="`/instituicoes/${c.slug}.svg`" alt="" class="bzv__banco" width="28" height="28" loading="lazy">
                <span class="bzv__cli-nome">{{ c.nome }}<span class="bzv__cli-banco">{{ c.banco }}</span></span>
                <strong class="bzv__cli-valor">{{ reaisCurtos(c.valor) }}</strong>
                <span v-if="c.nota" class="bzv__chip">{{ c.nota }}</span>
              </li>
            </ul>
          </div>

          <!-- ——— 02 · fechamento ——— -->
          <div v-else-if="p.id === 'fechamento'" class="bzv">
            <div class="bzv__topo bzv__k" style="--k: 0">
              <span class="bzv__rot">Fechamento de {{ FECHAMENTO.mes }}</span>
              <span class="bzv__meta">Dia {{ FECHAMENTO.dia }} de {{ FECHAMENTO.dias }}</span>
            </div>
            <p class="bzv__medio bzv__k" style="--k: 1"><strong>{{ conciliadas.length }} de {{ CARTEIRAS.length }}</strong> {{ itemFechamento.titulo }}</p>
            <div class="bzv__barra bzv__k" style="--k: 2" aria-hidden="true"><span class="bzv__barra-in" :style="{ width: `${(conciliadas.length / CARTEIRAS.length) * 100}%` }" /></div>
            <ul class="bzv__ok">
              <li v-for="(c, k) in conciliadas" :key="c.nome" class="bzv__k" :style="{ '--k': k + 3 }">
                <svg class="bzv__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="conciliada"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                <span>{{ partes(c.nome)[0] }}<span class="bzv__meio">{{ ` ${partes(c.nome)[1]}` }}</span>{{ ` ${partes(c.nome)[2]}` }}</span>
              </li>
            </ul>
            <div class="bzv__falta bzv__k" style="--k: 9">
              <span class="bzv__falta-ponto" aria-hidden="true" />
              <p class="bzv__falta-txt"><strong>{{ pendente.nome }}</strong> {{ pendente.motivo }}</p>
            </div>
          </div>

          <!-- ——— 03 · reunião ——— -->
          <div v-else-if="p.id === 'reuniao'" class="bzv">
            <div class="bzv__topo bzv__k" style="--k: 0">
              <span class="bzv__rot">Pauta pronta</span>
              <span class="bzv__meta">{{ PAUTA.quando }}</span>
            </div>
            <div class="bzv__quem bzv__k" style="--k: 1">
              <span class="bzv__ini" aria-hidden="true">{{ iniciais(PAUTA.cliente) }}</span>
              <span><strong class="bzv__quem-nome">{{ PAUTA.cliente }}</strong><span class="bzv__quem-sub">{{ PAUTA.perfil }}</span></span>
            </div>
            <ol class="bzv__pauta">
              <li v-for="(t, k) in PAUTA.itens" :key="t" class="bzv__k" :style="{ '--k': k + 2 }">{{ t }}</li>
            </ol>
          </div>

          <!-- ——— 04 · atendimento ——— -->
          <div v-else class="bzv">
            <div class="bzv__topo bzv__k" style="--k: 0">
              <span class="bzv__rot">{{ ATENDIMENTO.cliente }}</span>
              <span class="bzv__meta">{{ ATENDIMENTO.banco }}</span>
            </div>
            <p class="bzv__balao bzv__k" style="--k: 1">{{ ATENDIMENTO.pergunta }}</p>
            <div class="bzv__rascunho bzv__k" style="--k: 2">
              <span class="bzv__rasc-rot">Resposta para aprovar</span>
              <p class="bzv__rasc-txt">{{ ATENDIMENTO.resposta }}</p>
            </div>
            <div class="bzv__acoes bzv__k" style="--k: 3" aria-hidden="true">
              <span class="bzv__btn">Editar</span>
              <span class="bzv__btn bzv__btn--cheio">
                Aprovar
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
/* =====================================================================
   CAMADA 1 · empilhado (sem JS, e o HTML que o Google lê)
   ===================================================================== */
.bzj {
  --g: clamp(16px, 5.5vw, 80px);
  --serifa: 'New York', ui-serif, 'Iowan Old Style', Georgia, 'Times New Roman', serif;
  --curva: cubic-bezier(.2, .8, .2, 1);
  --topo: var(--nuh-h, 72px);
  position: relative; isolation: isolate;
  padding: clamp(56px, 8vw, 120px) var(--g) clamp(48px, 6vw, 96px);
  background: var(--nu-navy); color: var(--nu-cream-text);
}
.bzj::before {
  /* a grade de pontos do hero, apagando para baixo */
  content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background-image: radial-gradient(var(--nu-biz-ponto) 1.1px, transparent 1.4px); background-size: 22px 22px;
  -webkit-mask-image: linear-gradient(180deg, #000, transparent 40%); mask-image: linear-gradient(180deg, #000, transparent 40%);
}
.bzj__sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.bzj__grade { max-width: 1180px; margin: 0 auto; display: flex; flex-direction: column; }
.bzj__palco { display: none; }

.bzj__passo { scroll-margin-top: calc(var(--topo) + 16px); outline: none; }
.bzj__n { margin: 0; color: var(--nu-biz-lavanda); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .16em; text-transform: uppercase; font-variant-numeric: tabular-nums; }
.bzj__t {
  margin: 14px 0 0; color: var(--nu-cream-text);
  font-family: var(--serifa); font-weight: 400; font-size: clamp(30px, 3.5vw, 50px); letter-spacing: -0.02em; line-height: 1.06; text-wrap: balance;
}
.bzj__d { margin: 16px 0 0; max-width: 40ch; color: var(--nu-cream-text-70); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6; text-wrap: pretty; }
.bzj__passo:focus-visible .bzj__t { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 8px; text-decoration-color: var(--nu-biz-lavanda); }

/* empilhado, o visual entra logo abaixo do texto, num palco pequeno */
.bzj__vis {
  display: grid; place-items: center; margin: 24px 0 clamp(48px, 7vw, 88px); padding: clamp(20px, 4vw, 40px) clamp(12px, 3vw, 32px);
  border-radius: var(--nu-r-card-lg); background: var(--nu-navy-2); box-shadow: inset 0 0 0 1px var(--nu-white-14);
}
.bzj__vis:last-child { margin-bottom: 0; }

/* =====================================================================
   O CARTÃO (o "zoom" de cada item da fila): branco, como o modal do app
   ===================================================================== */
.bzv {
  width: min(100%, 420px); padding: 20px; border-radius: 22px; background: var(--nu-white); color: var(--nu-ink);
  box-shadow: 0 0 0 1px rgba(12, 21, 36, .06), 0 44px 90px -40px rgba(0, 0, 0, .7), 0 18px 40px -24px rgba(0, 0, 0, .45);
  font-variant-numeric: tabular-nums;
}
.bzv__topo { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.bzv__rot { color: var(--nu-gray); font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
.bzv__meta { flex: none; padding: 4px 10px; border-radius: var(--nu-r-pill); background: var(--nu-cream); color: var(--nu-gray-2); font-size: var(--nu-fs-xs); font-weight: 700; }
.bzv__grande { margin: 12px 0 0; color: var(--nu-navy); font-size: clamp(30px, 3vw, 38px); font-weight: 800; letter-spacing: -0.035em; line-height: 1; }
.bzv__medio { margin: 12px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 600; }
.bzv__medio strong { color: var(--nu-navy); font-size: var(--nu-fs-xl); font-weight: 800; }

/* 01 · o mapa do patrimônio fora: uma barra por cliente, a Carolina em lavanda forte */
.bzv__mapa { display: flex; gap: 3px; height: 8px; margin-top: 14px; }
.bzv__fatia { border-radius: 3px; background: var(--nu-ink-14); transform-origin: left center; }
.bzv__fatia--top { background: var(--nu-navy); }
.bzv__lista { list-style: none; margin: 14px 0 0; padding: 0; }
.bzv__cli {
  display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; align-items: center; gap: 4px 12px;
  padding: 10px 8px; border-top: 1px solid var(--nu-cream-line);
}
.bzv__cli--top { border-top-color: transparent; border-radius: 14px; background: color-mix(in srgb, var(--nu-biz-lavanda) 34%, var(--nu-white)); }
.bzv__cli--top + .bzv__cli { border-top-color: transparent; }
.bzv__banco { width: 28px; height: 28px; border-radius: 8px; }
.bzv__cli-nome { display: flex; flex-direction: column; min-width: 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; line-height: 1.3; }
.bzv__cli-banco { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; }
.bzv__cli-valor { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 800; white-space: nowrap; }
.bzv__chip {
  grid-column: 2 / -1; justify-self: start; padding: 3px 9px; border-radius: var(--nu-r-pill);
  background: var(--nu-navy); color: var(--nu-cream-text); font-size: 11px; font-weight: 700;
}

/* 02 · a barra do mês e as carteiras */
.bzv__barra { position: relative; height: 6px; margin-top: 12px; border-radius: 3px; background: var(--nu-cream); overflow: hidden; }
.bzv__barra-in { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 3px; background: linear-gradient(90deg, var(--nu-blue), var(--nu-blue-soft)); transform-origin: left center; }
.bzv__ok { list-style: none; margin: 14px 0 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2px 12px; }
.bzv__ok li { display: flex; align-items: center; gap: 7px; min-width: 0; padding: 6px 0; color: var(--nu-gray-3); font-size: var(--nu-fs-dense); font-weight: 600; line-height: 1.25; }
@media (max-width: 520px) { .bzv__meio { display: none; } }
.bzv__check { flex: none; padding: 3px; width: 20px; height: 20px; border-radius: 50%; background: var(--nu-green-bg); color: var(--nu-green-text); }
.bzv__falta { display: flex; gap: 10px; margin-top: 12px; padding: 12px 14px; border-radius: 14px; background: var(--nu-amber-bg); }
.bzv__falta-ponto { flex: none; width: 8px; height: 8px; margin-top: 6px; border-radius: 50%; background: var(--nu-amber-text); box-shadow: 0 0 0 4px color-mix(in srgb, var(--nu-amber-text) 18%, transparent); }
.bzv__falta-txt { margin: 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; }
.bzv__falta-txt strong { display: block; color: var(--nu-ink); font-weight: 800; }

/* 03 · a pauta */
.bzv__quem { display: flex; align-items: center; gap: 12px; margin-top: 14px; }
.bzv__ini { flex: none; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: var(--nu-navy); color: var(--nu-cream-text); font-size: var(--nu-fs-sm); font-weight: 800; letter-spacing: .02em; }
.bzv__quem-nome { display: block; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; }
.bzv__quem-sub { display: block; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; }
.bzv__pauta { list-style: none; counter-reset: pauta; margin: 14px 0 0; padding: 0; }
.bzv__pauta li {
  counter-increment: pauta; display: grid; grid-template-columns: 26px minmax(0, 1fr); gap: 10px; align-items: baseline;
  padding: 11px 0; border-top: 1px solid var(--nu-cream-line); color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.4;
}
.bzv__pauta li::before { content: counter(pauta, decimal-leading-zero); color: var(--nu-blue-text); font-size: var(--nu-fs-xs); font-weight: 800; }

/* 04 · a conversa */
.bzv__balao {
  justify-self: start; width: fit-content; margin: 14px 0 0; padding: 10px 14px; border-radius: 18px 18px 18px 6px;
  background: var(--nu-cream); color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 600;
}
.bzv__rascunho { margin: 10px 0 0 18px; padding: 12px 14px; border-radius: 18px 18px 6px 18px; background: color-mix(in srgb, var(--nu-biz-lavanda) 30%, var(--nu-white)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--nu-biz-lavanda) 80%, var(--nu-white)); }
.bzv__rasc-rot { display: block; color: var(--nu-navy); font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
.bzv__rasc-txt { margin: 6px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.bzv__acoes { display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; }
.bzv__btn {
  display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 16px; border-radius: var(--nu-r-pill);
  box-shadow: inset 0 0 0 1px var(--nu-ink-14); color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700;
}
.bzv__btn--cheio { background: var(--nu-navy); color: var(--nu-cream-text); box-shadow: none; }

/* =====================================================================
   CAMADA 2 · com JS: o scroll travado
   ===================================================================== */
@media (scripting: enabled) {
  .bzj { padding-top: clamp(40px, 6vw, 96px); padding-bottom: clamp(24px, 4vw, 64px); }
  .bzj__grade {
    --palco-h: min(54svh, 470px);
    display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: var(--palco-h) repeat(4, auto) 6vh;
  }
  /* a foto e os quatro visuais dividem a mesma área, presos em cima */
  .bzj__palco, .bzj__vis {
    grid-column: 1; grid-row: 1 / 7; align-self: start;
    position: sticky; top: var(--topo); height: var(--palco-h);
    margin: 0 calc(-1 * var(--g));
  }
  .bzj__palco { display: block; z-index: 1; overflow: clip; background: var(--nu-navy); }
  .bzj__vis {
    z-index: 2; padding: 14px 16px 54px; border-radius: 0; background: none; box-shadow: none;
    opacity: 0; pointer-events: none; transition: opacity .38s ease;
  }
  .bzj__vis--on { opacity: 1; transition-delay: .06s; }
  .bzj__vis .bzv { transform: translateY(10px) scale(.985); transition: transform .5s var(--curva); }
  .bzj__vis--on .bzv { transform: none; }

  .bzj__passo {
    grid-column: 1; grid-row: var(--rm);
    /* uma tela inteira por passo: o Page Down (~uma tela) avança um passo
       por vez. O texto fica no meio do passo, que é a linha de leitura (o
       meio do que sobra embaixo do visual preso). */
    min-height: calc(100svh - var(--topo)); padding: 28px 0;
    display: flex; flex-direction: column; justify-content: center;
    opacity: .32; transition: opacity .4s ease;
  }
  .bzj__passo--on { opacity: 1; }

  /* a foto, o véu navy e a grade de pontos */
  .bzj__foto { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.05); opacity: .5; }
  .bzj__veu {
    position: absolute; inset: 0;
    background:
      radial-gradient(70% 55% at 50% 45%, color-mix(in srgb, var(--nu-blue) 22%, transparent), transparent 70%),
      linear-gradient(180deg, rgba(12, 21, 36, .55), rgba(12, 21, 36, .78));
  }

  /* a régua 01–04, no pé do palco */
  .bzj__regua { position: absolute; left: 50%; bottom: 8px; transform: translateX(-50%); z-index: 3; display: flex; gap: 6px; }
  .bzj__marca { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; width: 52px; padding: 8px 0; color: var(--nu-cream-text-50); }
  .bzj__marca-n { font-size: 11px; font-weight: 700; letter-spacing: .08em; font-variant-numeric: tabular-nums; transition: color .3s; }
  .bzj__marca-trilho { position: relative; display: block; width: 100%; height: 2px; border-radius: 1px; background: var(--nu-cream-text-35); overflow: hidden; }
  .bzj__marca-in { position: absolute; inset: 0; background: var(--nu-cream-text); transform-origin: left center; transform: scaleX(0); }
  .bzj__marca--feita .bzj__marca-in { transform: scaleX(1); }
  .bzj__marca--on { color: var(--nu-cream-text); }
  .bzj__marca--on .bzj__marca-in { transform: scaleX(var(--p, 0)); background: var(--nu-biz-lavanda); }
  .bzj__marca:hover { color: var(--nu-cream-text); }
  .bzj__marca:focus-visible { outline: 2px solid var(--nu-biz-lavanda); outline-offset: 2px; border-radius: 4px; }

  /* o celular aperta o cartão para caber no palco */
  .bzv { padding: 16px; }
  .bzv__cli { padding: 7px 8px; }
  .bzv__pauta li { padding: 9px 0; }
}

@media (scripting: enabled) and (min-width: 960px) {
  .bzj { padding-top: clamp(64px, 8vw, 120px); padding-bottom: clamp(40px, 5vw, 80px); }
  .bzj__grade {
    grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr); grid-template-rows: repeat(4, auto) 14vh;
    column-gap: clamp(40px, 5vw, 88px);
  }
  .bzj__palco, .bzj__vis {
    grid-column: 2; grid-row: 1 / 6; margin: 0;
    top: calc(var(--topo) + 24px); height: calc(100vh - var(--topo) - 48px); max-height: 820px;
  }
  .bzj__palco { border-radius: var(--nu-r-card-lg); box-shadow: inset 0 0 0 1px var(--nu-white-14); }
  .bzj__vis { padding: 32px 32px 72px; }
  .bzj__passo { grid-column: 1; grid-row: var(--r); min-height: 82vh; padding: 0; }
  .bzj__regua { bottom: 18px; gap: 8px; }
  .bzj__marca { width: 64px; }
  .bzv { width: min(100%, 440px); padding: 22px; }
  .bzv__cli { padding: 10px 8px; }
  .bzv__pauta li { padding: 11px 0; }
}

/* =====================================================================
   CAMADA 3 · o movimento (só quando a pessoa aceita movimento)
   ===================================================================== */
@media (scripting: enabled) and (prefers-reduced-motion: no-preference) {
  .bzj__vis--on .bzv__k { animation: bzv-sobe .5s var(--curva) both; animation-delay: calc(.12s + var(--k, 0) * 55ms); }
  .bzj__vis--on .bzv__fatia { animation: bzv-cresce .8s var(--curva) both; animation-delay: .3s; }
  .bzj__vis--on .bzv__barra-in { animation: bzv-cresce 1s var(--curva) both; animation-delay: .28s; }
  .bzj__marca-in { transition: transform .2s linear; }
}
@keyframes bzv-sobe { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes bzv-cresce { from { transform: scaleX(0); } to { transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .bzj__vis, .bzj__vis .bzv, .bzj__passo { transition: none !important; }
  .bzj__vis .bzv { transform: none !important; }
}
</style>
