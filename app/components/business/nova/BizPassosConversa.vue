<script setup lang="ts">
/**
 * VARIAÇÃO 3 DOS PASSOS (?passos=3, só no dev): "AO VIVO NA SUA IA" (05/11/2026).
 * O produto de HOJE é a Redentia dentro do assistente de IA da mesa (o MCP; ver
 * a /mcp e as skills redentia-clientes e redentia-por-que-moveu). Esta variação
 * mostra exatamente isso: uma janela de conversa (genérica, sem marca de
 * terceiro; "seu assistente de IA" até o dono dizer se pode escrever Claude),
 * e a cada passo o assessor pergunta e a Redentia responde digitando, com o
 * cartão do resultado na conversa. As palavras surgem como no chat do site
 * (utils/revelar-palavras.ts, a mesma agenda e a mesma animação nu-palavra).
 * É a mais honesta: o apoio dos passos vem de CONVERSA e diz "você pede", não
 * "o agente faz sozinho"; o que ela ainda afirma sem lastro está na lista "a
 * confirmar" de content/business/landing.ts.
 *
 * TRÊS CAMADAS:
 *  1. SEM JS, COM REDUZIR MOVIMENTO, E NO HTML DO GOOGLE: a conversa inteira,
 *     as quatro trocas prontas, e os quatro passos embaixo.
 *  2. COM JS: a janela presa (à direita; no celular, em cima, na largura toda,
 *     como um app de conversa) e a conversa rola sozinha até a troca do passo.
 *  3. A RESPOSTA DIGITANDO: quando um passo entra pela primeira vez, a pergunta
 *     já está enviada, os três pontos piscam ~0,7 s, a linha do que ela leu
 *     aparece, as palavras saem do desfoque e o cartão sobe. Uma vez: troca já
 *     vista volta pronta. Nada em loop; o anel do campo gira uma volta só.
 */
import {
  ASSISTENTE, ATENDIMENTO, CARTEIRAS, CLIENTES_FORA, CONVERSA, PASSOS, PAUTA, reaisCurtos,
} from '~/content/business/landing'
import { agendarPalavras } from '~/utils/revelar-palavras'
import { usePassosTravados, n2 } from '~/composables/usePassosTravados'

const pendente = CARTEIRAS.find((c) => !c.ok)!
const primeiro = (n: string) => n.split(' ')[0]!
const iniciais = (n: string) => n.split(' ').filter((p) => p.length > 2).slice(0, 2).map((p) => p[0]).join('')
const TROCAS = PASSOS.map((p) => ({ id: p.id, ...CONVERSA[p.id], palavras: CONVERSA[p.id].resposta.split(' ') }))
/** os atrasos de cada palavra, em ms desde o começo da resposta (a agenda do chat) */
const ATRASOS = TROCAS.map((t) => agendarPalavras([], t.palavras.length, 0))
const DURACAO = 520
const PENSA = 700

type Estado = 'oculta' | 'pensando' | 'escrevendo' | 'pronta'
// SSR, sem JS e reduzir movimento: a conversa inteira, pronta
const estados = ref<Estado[]>(TROCAS.map(() => 'pronta'))
const vistas = new Set<number>()
let timers: ReturnType<typeof setTimeout>[] = []

const secao = ref<HTMLElement | null>(null)
const palco = ref<HTMLElement | null>(null)
const tela = ref<HTMLElement | null>(null)
const fio = ref<HTMLElement | null>(null)
const trocas: HTMLElement[] = []
const regTroca = (i: number) => (el: unknown) => { if (el) trocas[i] = el as HTMLElement }

/** a última troca que o scroll já alcançou (-1: a conversa ainda vazia) */
const chegou = ref(-1)
const { ativo, progresso, preso, registrar, naRegua, focoNaRegua } = usePassosTravados({
  palco, secao, aoMedirLayout: () => nextTick(rolarConversa),
  aoQuadro: (t) => { const k = Math.min(3, Math.max(-1, Math.floor(t - 0.1))); if (chegou.value !== k) chegou.value = k },
})

function limpar() { for (const t of timers) clearTimeout(t); timers = [] }
function depois(ms: number, f: () => void) { timers.push(setTimeout(f, ms)) }

/** Mostra a conversa até a troca `k`: a nova digita, as já vistas voltam prontas. */
function chegar(k: number) {
  limpar()
  if (k < 0) { estados.value = TROCAS.map(() => 'oculta'); nextTick(rolarConversa); return }
  const e = estados.value.slice()
  for (let i = 0; i < e.length; i++) {
    if (i > k) e[i] = 'oculta'
    else if (i < k || vistas.has(i)) e[i] = 'pronta'
  }
  if (!vistas.has(k)) {
    vistas.add(k)
    e[k] = 'pensando'
    depois(PENSA, () => { estados.value[k] = 'escrevendo' })
    depois(PENSA + ATRASOS[k]!.at(-1)! + DURACAO, () => { estados.value[k] = 'pronta' })
  }
  estados.value = e
  nextTick(rolarConversa)
}

/** A conversa rola até o fim da troca ativa ficar no pé da janela, como um chat. */
function rolarConversa() {
  const f = fio.value, t = tela.value, el = trocas[Math.max(0, chegou.value)]
  if (!f || !t || !el) return
  if (!preso.value || chegou.value < 0) { f.style.transform = ''; return }
  const fim = el.offsetTop + el.offsetHeight
  // a troca inteira no pé da janela; se ela não couber, a pergunta fica à vista no topo
  const y = Math.max(0, Math.min(el.offsetTop - 14, fim - t.clientHeight + 20))
  f.style.transform = `translateY(${-y}px)`
}

watch([preso, chegou], ([p, k], [antes]) => {
  if (!p) { limpar(); estados.value = TROCAS.map(() => 'pronta'); nextTick(rolarConversa); return }
  // quem chega no meio da página (um link #passo-, o recarregar) vê as trocas de antes prontas
  if (!antes) { vistas.clear(); for (let i = 0; i < k; i++) vistas.add(i) }
  chegar(k)
})
onBeforeUnmount(limpar)

const digitando = computed(() => estados.value.some((e) => e === 'pensando' || e === 'escrevendo'))
const atraso = (k: number, w: number) => (estados.value[k] === 'escrevendo' ? { animationDelay: `${Math.round(ATRASOS[k]![w]!)}ms` } : undefined)
</script>

<template>
  <section id="passos" ref="secao" class="bzc" aria-labelledby="bzc-titulo">
    <h2 id="bzc-titulo" class="bzc__sr">Os quatro pontos da fila</h2>
    <div class="bzc__grade">
      <article
        v-for="(p, i) in PASSOS" :id="`passo-${p.id}`" :key="p.id" :ref="registrar(i)"
        class="bzc__passo" :class="{ 'bzc__passo--on': i === ativo }" :style="{ '--r': i + 1, '--rm': i + 2 }"
        tabindex="-1" :aria-labelledby="`bzc-t-${p.id}`"
      >
        <p class="bzc__n">{{ n2(i) }} · {{ p.rotulo }}</p>
        <h3 :id="`bzc-t-${p.id}`" class="bzc__t">{{ p.titulo }}</h3>
        <p class="bzc__d">{{ CONVERSA[p.id].apoio }}</p>
      </article>

      <div ref="palco" class="bzc__palco">
        <span class="bzc__luz" aria-hidden="true" />
        <div class="bzc__janela" :class="{ 'bzc__janela--digitando': digitando }">
          <header class="bzc__topo">
            <span class="bzc__app">{{ ASSISTENTE.nome }}</span>
            <span class="bzc__conectada"><span class="bzc__vivo" aria-hidden="true" />{{ ASSISTENTE.conectada }}</span>
          </header>

          <div ref="tela" class="bzc__tela">
            <ol ref="fio" class="bzc__fio">
              <li v-for="(t, k) in TROCAS" :key="t.id" :ref="regTroca(k)" class="bzc__troca" :class="`bzc__troca--${estados[k]}`">
                <p class="bzc__pergunta">{{ t.pergunta }}</p>
                <div class="bzc__resposta">
                  <img src="/logo-azul.svg" alt="" class="bzc__marca" width="22" height="22" loading="lazy">
                  <div class="bzc__corpo">
                    <span class="bzc__pontos" aria-hidden="true"><i /><i /><i /></span>
                    <p class="bzc__fez">{{ t.fez }}</p>
                    <p class="bzc__texto">
                      <template v-for="(w, j) in t.palavras" :key="j"><span class="bzc__w" :style="atraso(k, j)">{{ w }}</span>{{ ' ' }}</template>
                    </p>

                    <!-- ——— os cartões do resultado ——— -->
                    <div class="bzc__cartao">
                      <ul v-if="t.id === 'captacao'" class="bzc__lista">
                        <li v-for="c in CLIENTES_FORA" :key="c.slug" class="bzc__cli">
                          <img :src="`/instituicoes/${c.slug}.svg`" alt="" width="22" height="22" loading="lazy">
                          <span class="bzc__cli-nome">{{ primeiro(c.nome) }}<span class="bzc__cli-banco">{{ c.banco }}</span></span>
                          <strong>{{ reaisCurtos(c.valor) }}</strong>
                        </li>
                      </ul>

                      <div v-else-if="t.id === 'fechamento'">
                        <ul class="bzc__rostos">
                          <li v-for="c in CARTEIRAS" :key="c.nome" class="bzc__rosto" :class="{ 'bzc__rosto--falta': !c.ok }" role="img" :data-i="iniciais(c.nome)" :aria-label="`${c.nome}, ${c.ok ? 'conciliada' : 'pendente'}`" />
                        </ul>
                        <p class="bzc__falta"><strong>{{ pendente.nome }}</strong> {{ pendente.motivo }}</p>
                      </div>

                      <ol v-else-if="t.id === 'reuniao'" class="bzc__pauta">
                        <li v-for="item in PAUTA.itens" :key="item">{{ item }}</li>
                      </ol>

                      <div v-else class="bzc__rascunho">
                        <p>{{ ATENDIMENTO.resposta }}</p>
                        <span class="bzc__copiar" aria-hidden="true">Copiar</span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ol>
          </div>

          <div class="bzc__campo" aria-hidden="true">
            <span class="bzc__campo-anel" />
            <span class="bzc__campo-in">{{ ASSISTENTE.campo }}<span class="bzc__enviar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg></span></span>
          </div>
        </div>
        <BizPassosRegua class="bzc__regua" :ativo="ativo" :progresso="progresso" @ir="naRegua" @foco="focoNaRegua" />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* =====================================================================
   CAMADA 1 · empilhado: a conversa inteira e os quatro passos embaixo
   ===================================================================== */
.bzc {
  --g: clamp(16px, 5.5vw, 80px);
  --serifa: 'New York', ui-serif, 'Iowan Old Style', Georgia, 'Times New Roman', serif;
  --curva: cubic-bezier(.2, .8, .2, 1);
  --topo: var(--nuh-h, 72px);
  position: relative; isolation: isolate;
  padding: clamp(56px, 8vw, 120px) var(--g) clamp(48px, 6vw, 96px);
  background: var(--nu-navy); color: var(--nu-cream-text);
}
.bzc::before {
  content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background-image: radial-gradient(var(--nu-biz-ponto) 1.1px, transparent 1.4px); background-size: 22px 22px;
  -webkit-mask-image: linear-gradient(180deg, #000, transparent 40%); mask-image: linear-gradient(180deg, #000, transparent 40%);
}
.bzc__sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.bzc__grade { max-width: 1180px; margin: 0 auto; display: flex; flex-direction: column; gap: clamp(40px, 6vw, 72px); }

.bzc__passo { scroll-margin-top: calc(var(--topo) + 16px); outline: none; }
.bzc__n { margin: 0; color: var(--nu-biz-lavanda); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .16em; text-transform: uppercase; font-variant-numeric: tabular-nums; }
.bzc__t { margin: 14px 0 0; color: var(--nu-cream-text); font-family: var(--serifa); font-weight: 400; font-size: clamp(30px, 3.5vw, 50px); letter-spacing: -0.02em; line-height: 1.06; text-wrap: balance; }
.bzc__d { margin: 16px 0 0; max-width: 40ch; color: var(--nu-cream-text-70); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6; text-wrap: pretty; }
.bzc__passo:focus-visible .bzc__t { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 8px; text-decoration-color: var(--nu-biz-lavanda); }

.bzc__palco { order: -1; position: relative; isolation: isolate; display: flex; flex-direction: column; align-items: center; }
.bzc__palco .bzc__regua { display: none; }
/* a luz do chat do site atrás da janela, parada (o brilho da ChatPilula) */
.bzc__luz {
  position: absolute; left: 50%; top: 50%; width: min(90%, 620px); height: 70%; transform: translate(-50%, -50%); z-index: -1; pointer-events: none;
  border-radius: 50%; filter: blur(60px); opacity: .42;
  background: linear-gradient(100deg, var(--nu-chat-luz-1), var(--nu-chat-luz-2), var(--nu-chat-luz-3));
}

/* ——— a janela ——— */
.bzc__janela {
  position: relative; width: min(100%, 560px); display: flex; flex-direction: column;
  border-radius: 26px; background: var(--nu-white); color: var(--nu-ink); overflow: hidden;
  box-shadow: 0 0 0 1px rgba(12, 21, 36, .06), 0 50px 100px -40px rgba(0, 0, 0, .75), 0 18px 40px -24px rgba(0, 0, 0, .45);
}
.bzc__topo { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--nu-cream-line); }
.bzc__app { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; letter-spacing: -0.01em; }
.bzc__conectada { display: inline-flex; align-items: center; gap: 7px; padding: 4px 10px; border-radius: var(--nu-r-pill); background: var(--nu-cream); color: var(--nu-gray-2); font-size: var(--nu-fs-xs); font-weight: 700; white-space: nowrap; }
.bzc__vivo { width: 6px; height: 6px; border-radius: 50%; background: var(--nu-green-text); box-shadow: 0 0 0 3px var(--nu-green-bg); }

.bzc__tela { position: relative; padding: 18px 18px 6px; }
.bzc__fio { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 22px; }
.bzc__troca { display: flex; flex-direction: column; gap: 12px; }
.bzc__pergunta {
  align-self: flex-end; max-width: 82%; margin: 0; padding: 10px 14px; border-radius: 18px 18px 6px 18px;
  background: var(--nu-navy); color: var(--nu-cream-text); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.4;
}
.bzc__resposta { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 10px; align-items: start; }
.bzc__marca { width: 22px; height: 22px; margin-top: 1px; }
.bzc__corpo { min-width: 0; }
.bzc__pontos { display: none; }
.bzc__fez { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; line-height: 22px; }
.bzc__fez::before { content: '✓'; margin-right: 6px; color: var(--nu-green-text); font-weight: 800; }
.bzc__texto { margin: 2px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }
.bzc__w { display: inline-block; }

.bzc__cartao { margin-top: 10px; padding: 12px 14px; border-radius: 16px; background: var(--nu-cream); font-variant-numeric: tabular-nums; }
.bzc__lista { list-style: none; margin: 0; padding: 0; }
.bzc__cli { display: grid; grid-template-columns: 22px minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 6px 0; font-size: var(--nu-fs-sm); }
.bzc__cli img { width: 22px; height: 22px; border-radius: 6px; }
.bzc__cli-nome { color: var(--nu-ink); font-weight: 700; }
.bzc__cli-banco { margin-left: 6px; color: var(--nu-gray); font-weight: 600; }
.bzc__cli strong { color: var(--nu-ink); font-weight: 800; white-space: nowrap; }

.bzc__rostos { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
.bzc__rosto { position: relative; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-cream-line); color: var(--nu-gray-3); font-size: 11px; font-weight: 800; letter-spacing: .02em; }
.bzc__rosto::before { content: attr(data-i); }
.bzc__rosto::after { content: ''; position: absolute; right: -1px; bottom: -1px; width: 11px; height: 11px; border-radius: 50%; background: var(--nu-green-text); box-shadow: 0 0 0 2px var(--nu-cream); }
.bzc__rosto--falta::after { background: var(--nu-amber-text); }
.bzc__falta { margin: 10px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); line-height: 1.45; }
.bzc__falta strong { color: var(--nu-ink); font-weight: 800; }

.bzc__pauta { list-style: none; counter-reset: pauta; margin: 0; padding: 0; }
.bzc__pauta li { counter-increment: pauta; display: grid; grid-template-columns: 24px minmax(0, 1fr); gap: 8px; padding: 7px 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.4; }
.bzc__pauta li + li { border-top: 1px solid var(--nu-cream-line); }
.bzc__pauta li::before { content: counter(pauta, decimal-leading-zero); color: var(--nu-blue-text); font-size: var(--nu-fs-xs); font-weight: 800; line-height: 1.7; }

.bzc__rascunho { display: flex; flex-direction: column; gap: 10px; }
.bzc__rascunho p { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); line-height: 1.55; }
.bzc__copiar { align-self: flex-end; padding: 6px 14px; border-radius: var(--nu-r-pill); background: var(--nu-navy); color: var(--nu-cream-text); font-size: var(--nu-fs-xs); font-weight: 700; }

/* o campo: a moldura de 2 px do chat do site, com o anel parado */
.bzc__campo { position: relative; margin: 10px 14px 14px; padding: 2px; border-radius: 999px; overflow: hidden; background: var(--nu-cream-line); }
.bzc__campo-anel { position: absolute; left: 50%; top: 50%; width: 140%; aspect-ratio: 1; transform: translate(-50%, -50%); opacity: 0; background: conic-gradient(from 0deg, var(--nu-blue), var(--nu-serie-5), var(--nu-serie-4), var(--nu-serie-2), var(--nu-serie-6), var(--nu-blue)); transition: opacity .4s ease; }
.bzc__campo-in { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 10px; height: 44px; padding: 0 6px 0 18px; border-radius: 999px; background: var(--nu-white); color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.bzc__enviar { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: var(--nu-navy); color: var(--nu-cream-text); }

@media (max-width: 520px) {
  .bzc__tela { padding: 14px 14px 4px; }
  .bzc__pergunta, .bzc__texto { font-size: var(--nu-fs-sm); }
  .bzc__fio { gap: 18px; }
  .bzc__rostos { gap: 5px; }
  .bzc__rosto { width: 30px; height: 30px; font-size: 10px; }
  .bzc__cli { padding: 4px 0; }
}

/* =====================================================================
   CAMADA 2 · com JS e movimento: a janela presa, a conversa rolando
   ===================================================================== */
@media (scripting: enabled) and (prefers-reduced-motion: no-preference) {
  .bzc { padding-top: clamp(40px, 6vw, 96px); padding-bottom: clamp(24px, 4vw, 64px); }
  .bzc__grade {
    --palco-h: min(62svh, 520px);
    display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: var(--palco-h) repeat(4, auto) 6vh; gap: 0;
  }
  .bzc__palco {
    grid-column: 1; grid-row: 1 / 7; align-self: start; position: sticky; top: var(--topo); height: var(--palco-h); z-index: 1;
    margin: 0 calc(-1 * var(--g)); padding: 10px 12px 0; background: var(--nu-navy);
  }
  .bzc__janela { flex: 1; min-height: 0; width: 100%; }
  .bzc__tela { flex: 1; min-height: 0; overflow: hidden; -webkit-mask-image: linear-gradient(180deg, transparent, #000 32px); mask-image: linear-gradient(180deg, transparent, #000 32px); }
  .bzc__fio { transition: transform .7s var(--curva); will-change: transform; }
  .bzc__palco .bzc__regua { display: flex; justify-content: center; padding: 2px 0 4px; }
  .bzc__luz { opacity: .3; }

  .bzc__passo {
    grid-column: 1; grid-row: var(--rm); min-height: calc(100svh - var(--topo)); padding: 28px 0;
    display: flex; flex-direction: column; justify-content: center; opacity: .32; transition: opacity .4s ease;
  }
  .bzc__passo--on { opacity: 1; }

  /* as trocas: a que ainda não chegou fica guardada, ocupando o lugar dela */
  .bzc__troca { transition: opacity .35s ease; }
  .bzc__troca--oculta { visibility: hidden; opacity: 0; }
  .bzc__troca--oculta .bzc__pergunta { transform: translateY(14px) scale(.96); }
  .bzc__pergunta { transform-origin: right bottom; transition: transform .45s var(--curva); }
  .bzc__fez, .bzc__cartao { transition: opacity .35s ease, transform .5s var(--curva); }
  .bzc__troca--pensando .bzc__fez, .bzc__troca--pensando .bzc__texto, .bzc__troca--pensando .bzc__cartao { opacity: 0; }
  .bzc__troca--pensando .bzc__pontos { display: flex; position: absolute; gap: 4px; padding: 7px 0; }
  .bzc__corpo { position: relative; }
  .bzc__pontos i { width: 6px; height: 6px; border-radius: 50%; background: var(--nu-gray); animation: bzc-ponto .7s ease-in-out 1 both; }
  .bzc__pontos i:nth-child(2) { animation-delay: .12s; }
  .bzc__pontos i:nth-child(3) { animation-delay: .24s; }
  .bzc__troca--escrevendo .bzc__w { animation: nu-palavra .52s cubic-bezier(.22, 1, .36, 1) backwards; }
  .bzc__troca--escrevendo .bzc__cartao { opacity: 0; transform: translateY(10px); }
  /* o anel do campo gira uma volta enquanto ela escreve */
  .bzc__janela--digitando .bzc__campo-anel { opacity: 1; animation: bzc-gira 2.4s linear 1; }
}
@keyframes bzc-ponto { 0%, 100% { opacity: .25; transform: none; } 50% { opacity: 1; transform: translateY(-3px); } }
@keyframes bzc-gira { to { transform: translate(-50%, -50%) rotate(360deg); } }

@media (scripting: enabled) and (prefers-reduced-motion: no-preference) and (min-width: 960px) {
  .bzc { padding-top: clamp(64px, 8vw, 120px); padding-bottom: clamp(40px, 5vw, 80px); }
  .bzc__grade { grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); grid-template-rows: repeat(4, auto) 14vh; column-gap: clamp(40px, 5vw, 88px); }
  .bzc__palco {
    grid-column: 2; grid-row: 1 / 6; margin: 0; padding: 0; background: none;
    top: calc(var(--topo) + 24px); height: calc(100vh - var(--topo) - 48px); max-height: 820px;
  }
  .bzc__janela { max-width: 560px; }
  .bzc__regua { padding: 14px 0 0; }
  .bzc__luz { opacity: .42; }
  .bzc__passo { grid-column: 1; grid-row: var(--r); min-height: 82vh; padding: 0; }
}
</style>
