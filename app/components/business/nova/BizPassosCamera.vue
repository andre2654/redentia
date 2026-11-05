<script setup lang="ts">
/**
 * VARIAÇÃO 1 DOS PASSOS (?passos=1, só no dev): "A CÂMERA DENTRO DO PRODUTO"
 * (05/11/2026). O dono achou o cartão branco sobre a foto, que trocava a cada
 * passo, "comum demais". Aqui não há quatro cartões: há UM app, a mesa do
 * assessor do Redentia For Business, desenhado inteiro (a fila à esquerda e as
 * quatro áreas: captação, fechamento, pauta e resposta), e o scroll move uma
 * câmera sobre ele, como as páginas de produto da Apple e da Linear. A abertura
 * mostra a mesa inteira; cada passo dá zoom e pan na área dele, as outras
 * desfocam, e a área "abre" (as linhas sobem) quando a câmera chega.
 *
 * O OBJETO QUE ATRAVESSA AS TELAS é a fila: a mesma do hero (BizFila) está na
 * lateral do app, e o item do passo acende. Os botões da fila (Ver clientes,
 * Revisar, Abrir pauta, Aprovar) fazem um FLIP de verdade: o app pula para o
 * passo e a área sai do lugar e do tamanho do item clicado e cresce até virar
 * a tela (Web Animations, ~0,7 s). O BizFila não muda: o FLIP lê o item pelo
 * seletor .bfl__item--<id> quando chega o evento `bzj:ir`.
 *
 * TRÊS CAMADAS:
 *  1. SEM JS, COM REDUZIR MOVIMENTO E NO HTML DO GOOGLE: o app em tamanho
 *     natural (no celular, as áreas uma embaixo da outra) e os quatro passos
 *     embaixo, tudo no estado final.
 *  2. COM JS: a janela presa e o app num tamanho de desenho fixo, para a
 *     câmera medir as áreas (offsetLeft/Top, que não sofrem com o transform).
 *  3. A CÂMERA: um transform só (translate + scale) no app, escrito a cada
 *     quadro de rolagem. Entre duas áreas ela recua um pouco no meio do
 *     caminho (o "dip"), para o olho entender que saiu de um lugar e foi a
 *     outro. will-change só enquanto ela anda: parada, o navegador redesenha o
 *     texto nítido na escala final. Só roda com a seção perto da tela.
 */
import {
  ATENDIMENTO, CARTEIRAS, CLIENTES_FORA, FECHAMENTO, FILA, PASSOS, PAUTA, reaisCurtos, totalFora, type IdDoPasso,
} from '~/content/business/landing'
import { usePassosTravados, n2 } from '~/composables/usePassosTravados'

const total = totalFora()
const fatia = (v: number) => `${((v / total) * 100).toFixed(1)}%`
const conciliadas = CARTEIRAS.filter((c) => c.ok)
const pendente = CARTEIRAS.find((c) => !c.ok)!
const itemFechamento = FILA.itens.find((i) => i.id === 'fechamento')!
const iniciais = (n: string) => n.split(' ').filter((p) => p.length > 2).slice(0, 2).map((p) => p[0]).join('')
const primeiro = (n: string) => n.split(' ')[0]!
/** a lateral do app: a fila, com o número de cada item */
const LATERAL: { id: IdDoPasso; tipo: string; valor: string }[] = [
  { id: 'captacao', tipo: PASSOS[0]!.rotulo, valor: reaisCurtos(total) },
  { id: 'fechamento', tipo: PASSOS[1]!.rotulo, valor: `${itemFechamento.feito} de ${itemFechamento.total}` },
  { id: 'reuniao', tipo: PASSOS[2]!.rotulo, valor: primeiro(PAUTA.cliente) },
  { id: 'atendimento', tipo: PASSOS[3]!.rotulo, valor: primeiro(ATENDIMENTO.cliente) },
]

const secao = ref<HTMLElement | null>(null)
const palco = ref<HTMLElement | null>(null)
const janela = ref<HTMLElement | null>(null)
const app = ref<HTMLElement | null>(null)
const areas: HTMLElement[] = []
const regArea = (i: number) => (el: unknown) => { if (el) areas[i] = el as HTMLElement }

/** a área em foco (-1: a mesa inteira); muda só na troca */
const foco = ref(-1)
/** a câmera já saiu da mesa inteira: o creme passa a cobrir a janela toda */
const dentro = ref(false)

/* ——— a câmera ——— */
interface Cam { cx: number; cy: number; s: number }
let W = 0, H = 0, w = 0, h = 0
let alvos: Cam[] = []
let geral: Cam = { cx: 0, cy: 0, s: 1 }
let andando = false
let ultimoT = NaN

function medirLayout() {
  const a = app.value, j = janela.value
  if (!a || !j) return
  W = a.offsetWidth; H = a.offsetHeight; w = j.clientWidth; h = j.clientHeight
  if (!W || !w) return
  geral = { cx: W / 2, cy: H / 2, s: Math.min(w / W, h / H) * 0.92 }
  const teto = window.matchMedia('(min-width: 960px)').matches ? 1.25 : 1.08
  alvos = areas.map((el) => {
    let x = 0, y = 0, n: HTMLElement | null = el
    while (n && n !== a) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent as HTMLElement | null }
    const aw = el.offsetWidth, ah = el.offsetHeight
    return { cx: x + aw / 2, cy: y + ah / 2, s: Math.min(teto, Math.min(w / aw, h / ah) * 0.9) }
  })
  ultimoT = NaN
}

/** As chaves da câmera em t: a mesa inteira, e cada área presa no meio do passo dela. */
const CHAVES: [number, number][] = [[-0.2, -1], [0.25, 0], [0.75, 0], [1.25, 1], [1.75, 1], [2.25, 2], [2.75, 2], [3.25, 3]]
const camDe = (k: number) => (k < 0 ? geral : alvos[k]!)
const suave = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2)

function camera(t: number): { c: Cam; foco: number; anda: boolean } {
  if (t <= CHAVES[0]![0]) return { c: geral, foco: -1, anda: false }
  const ult = CHAVES.at(-1)!
  if (t >= ult[0]) return { c: camDe(ult[1]), foco: ult[1], anda: false }
  let j = 0
  while (t >= CHAVES[j + 1]![0]) j++
  const [t0, a] = CHAVES[j]!, [t1, b] = CHAVES[j + 1]!
  if (a === b) return { c: camDe(a), foco: a, anda: false }
  const u = (t - t0) / (t1 - t0), e = suave(u)
  const A = camDe(a), B = camDe(b)
  // entre duas áreas, a câmera recua no meio do caminho
  const recuo = a >= 0 ? 1 - 0.24 * Math.sin(Math.PI * u) : 1
  return {
    c: { cx: A.cx + (B.cx - A.cx) * e, cy: A.cy + (B.cy - A.cy) * e, s: (A.s + (B.s - A.s) * e) * recuo },
    foco: u > 0.72 ? b : u < 0.28 ? a : -1,
    anda: true,
  }
}

function aoQuadro(t: number) {
  const a = app.value
  if (!a || !alvos.length) return
  if (Math.abs(t - ultimoT) < 0.0005) return
  ultimoT = t
  const { c, foco: f, anda } = camera(t)
  if (anda !== andando) { andando = anda; a.style.willChange = anda ? 'transform' : '' }
  a.style.transform = `translate3d(${(w / 2 - c.s * c.cx).toFixed(2)}px, ${(h / 2 - c.s * c.cy).toFixed(2)}px, 0) scale(${c.s.toFixed(4)})`
  if (foco.value !== f) foco.value = f
  const d = t > 0.05
  if (dentro.value !== d) dentro.value = d
}

const { ativo, progresso, preso, registrar, irPara, naRegua, focoNaRegua } = usePassosTravados({
  palco, secao, aoQuadro, aoMedirLayout: medirLayout,
  antesDaFila: (i, id) => flip(i, id),
})
watch(preso, (p) => { if (!p && app.value) { app.value.style.transform = ''; app.value.style.willChange = ''; foco.value = -1; dentro.value = false } })

/* ——— o FLIP: o item da fila cresce e vira a área ———
   Um clone da área voa por cima da página (fixed, fora da janela, que corta o
   que passa da borda) do retângulo do item clicado ao lugar da área na tela; a
   área de verdade fica invisível no voo e aparece quando o clone some. */
const voando = ref(false)
function flip(i: number, id: IdDoPasso): boolean {
  if (!preso.value || !palco.value) return false
  const origem = document.querySelector(`.bfl__item--${id}`)?.getBoundingClientRect()
  if (!origem || origem.bottom < 0 || origem.top > window.innerHeight) return false
  irPara(i, true, true) // pula: o scroll vai direto ao passo e a câmera já está na área
  const el = areas[i]!
  const fim = el.getBoundingClientRect()
  const s = alvos[i]!.s
  const ow = el.offsetWidth, oh = el.offsetHeight
  const clone = el.cloneNode(true) as HTMLElement
  clone.classList.add('bzm__area--foco')
  Object.assign(clone.style, {
    position: 'fixed', left: `${fim.left}px`, top: `${fim.top}px`, width: `${ow}px`, height: `${oh}px`, margin: '0',
    transformOrigin: '0 0', zIndex: '40', pointerEvents: 'none', boxShadow: '0 40px 90px -30px rgba(0, 0, 0, .7)',
  })
  document.body.appendChild(clone)
  voando.value = true
  const anim = clone.animate([
    { transform: `translate(${origem.left - fim.left}px, ${origem.top - fim.top}px) scale(${origem.width / ow}, ${origem.height / oh})`, borderRadius: '16px', opacity: 0.5 },
    { transform: `scale(${s})`, borderRadius: '22px', opacity: 1 },
  ], { duration: 720, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'forwards' })
  const fimDoVoo = () => { clone.remove(); voando.value = false }
  anim.onfinish = anim.oncancel = fimDoVoo
  return true
}
</script>

<template>
  <section id="passos" ref="secao" class="bzm" aria-labelledby="bzm-titulo">
    <h2 id="bzm-titulo" class="bzm__sr">Os quatro pontos da fila</h2>
    <div class="bzm__grade">
      <!-- a abertura: um respiro em que a câmera mostra a mesa inteira -->
      <div class="bzm__abertura" aria-hidden="true" />
      <article
        v-for="(p, i) in PASSOS" :id="`passo-${p.id}`" :key="p.id" :ref="registrar(i)"
        class="bzm__passo" :class="{ 'bzm__passo--on': i === ativo }" :style="{ '--r': i + 2, '--rm': i + 3 }"
        tabindex="-1" :aria-labelledby="`bzm-t-${p.id}`"
      >
        <p class="bzm__n">{{ n2(i) }} · {{ p.rotulo }}</p>
        <h3 :id="`bzm-t-${p.id}`" class="bzm__t">{{ p.titulo }}</h3>
        <p class="bzm__d">{{ p.apoio }}</p>
      </article>

      <div ref="palco" class="bzm__palco" :class="{ 'bzm__palco--voando': voando }">
        <div ref="janela" class="bzm__janela">
          <div ref="app" class="bzm__app" :class="{ 'bzm__app--foco': foco >= 0, 'bzm__app--dentro': dentro }">
            <div class="bzm__barra" aria-hidden="true">
              <img src="/logo-azul.svg" alt="" width="20" height="20" loading="lazy">
              <span class="bzm__barra-t">Mesa</span>
              <span class="bzm__barra-q">{{ FILA.quando }}</span>
              <span class="bzm__barra-eu" />
            </div>
            <div class="bzm__corpo">
              <!-- a lateral: a fila do hero, com o item do passo aceso -->
              <ol class="bzm__fila" aria-hidden="true">
                <li v-for="(l, k) in LATERAL" :key="l.id" class="bzm__fila-it" :class="{ 'bzm__fila-it--on': k === foco }">
                  <span class="bzm__fila-tipo">{{ l.tipo }}</span>
                  <strong class="bzm__fila-v">{{ l.valor }}</strong>
                </li>
              </ol>

              <div class="bzm__areas">
                <!-- ——— 01 · captação ——— -->
                <section :ref="regArea(0)" class="bzm__area" :class="{ 'bzm__area--foco': foco === 0 }" aria-label="Captação">
                  <div class="bzm__topo bzm__k" style="--k: 0"><span class="bzm__rot">Fora do escritório</span><span class="bzm__meta">{{ CLIENTES_FORA.length }} clientes</span></div>
                  <p class="bzm__grande bzm__k" style="--k: 1">{{ reaisCurtos(total) }}</p>
                  <div class="bzm__mapa bzm__k" style="--k: 2" aria-hidden="true">
                    <span v-for="(c, k) in CLIENTES_FORA" :key="c.slug" class="bzm__fatia" :class="{ 'bzm__fatia--top': k === 0 }" :style="{ width: fatia(c.valor) }" />
                  </div>
                  <ul class="bzm__lista">
                    <li v-for="(c, k) in CLIENTES_FORA" :key="c.slug" class="bzm__cli bzm__k" :class="{ 'bzm__cli--top': k === 0 }" :style="{ '--k': k + 3 }">
                      <img :src="`/instituicoes/${c.slug}.svg`" alt="" width="26" height="26" loading="lazy">
                      <span class="bzm__cli-nome">{{ c.nome }}<span class="bzm__cli-banco">{{ c.banco }}<template v-if="c.nota"> · {{ c.nota }}</template></span></span>
                      <strong>{{ reaisCurtos(c.valor) }}</strong>
                    </li>
                  </ul>
                </section>

                <!-- ——— 02 · fechamento ——— -->
                <section :ref="regArea(1)" class="bzm__area" :class="{ 'bzm__area--foco': foco === 1 }" aria-label="Fechamento">
                  <div class="bzm__topo bzm__k" style="--k: 0"><span class="bzm__rot">Fechamento de {{ FECHAMENTO.mes }}</span><span class="bzm__meta">Dia {{ FECHAMENTO.dia }} de {{ FECHAMENTO.dias }}</span></div>
                  <p class="bzm__medio bzm__k" style="--k: 1"><strong>{{ conciliadas.length }} de {{ CARTEIRAS.length }}</strong> {{ itemFechamento.titulo }}</p>
                  <div class="bzm__barra-f bzm__k" style="--k: 2" aria-hidden="true"><span :style="{ width: `${(conciliadas.length / CARTEIRAS.length) * 100}%` }" /></div>
                  <ul class="bzm__rostos">
                    <li v-for="(c, k) in CARTEIRAS" :key="c.nome" class="bzm__rosto bzm__k" :class="{ 'bzm__rosto--falta': !c.ok }" :style="{ '--k': k + 3 }" role="img" :data-i="iniciais(c.nome)" :aria-label="`${c.nome}, ${c.ok ? 'conciliada' : 'pendente'}`" />
                  </ul>
                  <div class="bzm__falta bzm__k" style="--k: 10"><span aria-hidden="true" /><p><strong>{{ pendente.nome }}</strong> {{ pendente.motivo }}</p></div>
                </section>

                <!-- ——— 03 · reunião ——— -->
                <section :ref="regArea(2)" class="bzm__area" :class="{ 'bzm__area--foco': foco === 2 }" aria-label="Reunião">
                  <div class="bzm__topo bzm__k" style="--k: 0"><span class="bzm__rot">Pauta pronta</span><span class="bzm__meta">{{ PAUTA.quando }}</span></div>
                  <div class="bzm__quem bzm__k" style="--k: 1">
                    <span class="bzm__ini" aria-hidden="true">{{ iniciais(PAUTA.cliente) }}</span>
                    <span><strong>{{ PAUTA.cliente }}</strong><span>{{ PAUTA.perfil }}</span></span>
                  </div>
                  <ol class="bzm__pauta">
                    <li v-for="(t, k) in PAUTA.itens" :key="t" class="bzm__k" :style="{ '--k': k + 2 }">{{ t }}</li>
                  </ol>
                </section>

                <!-- ——— 04 · atendimento ——— -->
                <section :ref="regArea(3)" class="bzm__area" :class="{ 'bzm__area--foco': foco === 3 }" aria-label="Atendimento">
                  <div class="bzm__topo bzm__k" style="--k: 0"><span class="bzm__rot">{{ ATENDIMENTO.cliente }}</span><span class="bzm__meta">{{ ATENDIMENTO.banco }}</span></div>
                  <p class="bzm__balao bzm__k" style="--k: 1">{{ ATENDIMENTO.pergunta }}</p>
                  <div class="bzm__rascunho bzm__k" style="--k: 2">
                    <span class="bzm__rasc-rot">Resposta para aprovar</span>
                    <p>{{ ATENDIMENTO.resposta }}</p>
                  </div>
                  <div class="bzm__acoes bzm__k" style="--k: 3" aria-hidden="true">
                    <span class="bzm__btn">Editar</span>
                    <span class="bzm__btn bzm__btn--cheio">Aprovar</span>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
        <BizPassosRegua class="bzm__regua" :ativo="ativo" :progresso="progresso" @ir="naRegua" @foco="focoNaRegua" />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* =====================================================================
   CAMADA 1 · empilhado: o app em tamanho natural e os passos embaixo
   ===================================================================== */
.bzm {
  --g: clamp(16px, 5.5vw, 80px);
  --serifa: 'New York', ui-serif, 'Iowan Old Style', Georgia, 'Times New Roman', serif;
  --curva: cubic-bezier(.2, .8, .2, 1);
  --topo: var(--nuh-h, 72px);
  position: relative; isolation: isolate;
  padding: clamp(56px, 8vw, 120px) var(--g) clamp(48px, 6vw, 96px);
  background: var(--nu-navy); color: var(--nu-cream-text);
}
.bzm::before {
  content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background-image: radial-gradient(var(--nu-biz-ponto) 1.1px, transparent 1.4px); background-size: 22px 22px;
  -webkit-mask-image: linear-gradient(180deg, #000, transparent 40%); mask-image: linear-gradient(180deg, #000, transparent 40%);
}
.bzm__sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.bzm__grade { max-width: 1180px; margin: 0 auto; display: flex; flex-direction: column; gap: clamp(40px, 6vw, 72px); }
.bzm__abertura { display: none; }

.bzm__passo { scroll-margin-top: calc(var(--topo) + 16px); outline: none; }
.bzm__n { margin: 0; color: var(--nu-biz-lavanda); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .16em; text-transform: uppercase; font-variant-numeric: tabular-nums; }
.bzm__t { margin: 14px 0 0; color: var(--nu-cream-text); font-family: var(--serifa); font-weight: 400; font-size: clamp(30px, 3.5vw, 50px); letter-spacing: -0.02em; line-height: 1.06; text-wrap: balance; }
.bzm__d { margin: 16px 0 0; max-width: 40ch; color: var(--nu-cream-text-70); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6; text-wrap: pretty; }
.bzm__passo:focus-visible .bzm__t { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 8px; text-decoration-color: var(--nu-biz-lavanda); }

.bzm__palco { order: -1; position: relative; }
.bzm__palco .bzm__regua { display: none; }
.bzm__janela { position: relative; }

/* ——— o app: a mesa do assessor ——— */
.bzm__app {
  position: relative; border-radius: 24px; background: var(--nu-cream); color: var(--nu-ink); overflow: hidden;
  box-shadow: 0 0 0 1px rgba(12, 21, 36, .08), 0 50px 100px -40px rgba(0, 0, 0, .75);
  font-variant-numeric: tabular-nums; transform-origin: 0 0;
}
.bzm__barra { display: flex; align-items: center; gap: 10px; height: 52px; padding: 0 18px; background: var(--nu-white); border-bottom: 1px solid var(--nu-cream-line); }
.bzm__barra img { width: 20px; height: 20px; }
.bzm__barra-t { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 800; letter-spacing: -0.01em; }
.bzm__barra-q { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.bzm__barra-eu { margin-left: auto; width: 28px; height: 28px; border-radius: 50%; background: var(--nu-navy); box-shadow: inset 0 0 0 2px var(--nu-biz-lavanda); }

.bzm__corpo { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; padding: 14px; }
.bzm__fila { list-style: none; margin: 0; padding: 10px; border-radius: 18px; background: var(--nu-navy); display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.bzm__fila-it { display: flex; flex-direction: column; gap: 3px; padding: 10px 12px; border-radius: 12px; background: color-mix(in srgb, var(--nu-white) 6%, transparent); transition: background .4s ease, box-shadow .4s ease; }
.bzm__fila-tipo { color: var(--nu-cream-text-55); font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.bzm__fila-v { color: var(--nu-cream-text); font-size: var(--nu-fs-md); font-weight: 800; letter-spacing: -0.01em; white-space: nowrap; }
.bzm__fila-it--on { background: var(--nu-biz-lavanda); box-shadow: 0 10px 30px -12px rgba(195, 203, 255, .8); }
.bzm__fila-it--on .bzm__fila-tipo { color: var(--nu-navy); }
.bzm__fila-it--on .bzm__fila-v { color: var(--nu-navy); }

.bzm__areas { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
.bzm__area { padding: 18px; border-radius: 22px; background: var(--nu-white); box-shadow: 0 0 0 1px rgba(12, 21, 36, .06), 0 18px 40px -28px rgba(12, 21, 36, .35); transition: filter .5s ease, opacity .5s ease; }
.bzm__topo { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.bzm__rot { color: var(--nu-gray); font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
.bzm__meta { flex: none; padding: 4px 10px; border-radius: var(--nu-r-pill); background: var(--nu-cream); color: var(--nu-gray-2); font-size: var(--nu-fs-xs); font-weight: 700; }
.bzm__grande { margin: 10px 0 0; color: var(--nu-navy); font-size: 34px; font-weight: 800; letter-spacing: -0.035em; line-height: 1; }
.bzm__medio { margin: 10px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 600; }
.bzm__medio strong { color: var(--nu-navy); font-size: var(--nu-fs-xl); font-weight: 800; }

.bzm__mapa { display: flex; gap: 3px; height: 8px; margin-top: 12px; }
.bzm__fatia { border-radius: 3px; background: var(--nu-ink-14); transform-origin: left center; }
.bzm__fatia--top { background: var(--nu-navy); }
.bzm__lista { list-style: none; margin: 10px 0 0; padding: 0; }
.bzm__cli { display: grid; grid-template-columns: 26px minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 8px; border-top: 1px solid var(--nu-cream-line); }
.bzm__cli img { width: 26px; height: 26px; border-radius: 8px; }
.bzm__cli--top { border-top-color: transparent; border-radius: 14px; background: color-mix(in srgb, var(--nu-biz-lavanda) 34%, var(--nu-white)); }
.bzm__cli--top + .bzm__cli { border-top-color: transparent; }
.bzm__cli-nome { display: flex; flex-direction: column; min-width: 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; line-height: 1.3; }
.bzm__cli-banco { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; }
.bzm__cli strong { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 800; white-space: nowrap; }

.bzm__barra-f { position: relative; height: 6px; margin-top: 12px; border-radius: 3px; background: var(--nu-cream); overflow: hidden; }
.bzm__barra-f span { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 3px; background: linear-gradient(90deg, var(--nu-blue), var(--nu-blue-soft)); transform-origin: left center; }
.bzm__rostos { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.bzm__rosto { position: relative; display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; background: var(--nu-cream); color: var(--nu-gray-3); font-size: 12px; font-weight: 800; }
.bzm__rosto::before { content: attr(data-i); }
.bzm__rosto::after { content: ''; position: absolute; right: -1px; bottom: -1px; width: 12px; height: 12px; border-radius: 50%; background: var(--nu-green-text); box-shadow: 0 0 0 2px var(--nu-white); }
.bzm__rosto--falta { background: var(--nu-amber-bg); }
.bzm__rosto--falta::after { background: var(--nu-amber-text); }
.bzm__falta { display: flex; gap: 10px; margin-top: 12px; padding: 12px 14px; border-radius: 14px; background: var(--nu-amber-bg); }
.bzm__falta > span { flex: none; width: 8px; height: 8px; margin-top: 6px; border-radius: 50%; background: var(--nu-amber-text); }
.bzm__falta p { margin: 0; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); line-height: 1.45; }
.bzm__falta strong { display: block; color: var(--nu-ink); font-weight: 800; }

.bzm__quem { display: flex; align-items: center; gap: 12px; margin-top: 14px; }
.bzm__quem strong { display: block; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; }
.bzm__quem span span { display: block; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; }
.bzm__ini { flex: none; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: var(--nu-navy); color: var(--nu-cream-text); font-size: var(--nu-fs-sm); font-weight: 800; }
.bzm__pauta { list-style: none; counter-reset: pauta; margin: 12px 0 0; padding: 0; }
.bzm__pauta li { counter-increment: pauta; display: grid; grid-template-columns: 26px minmax(0, 1fr); gap: 10px; padding: 10px 0; border-top: 1px solid var(--nu-cream-line); color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.4; }
.bzm__pauta li::before { content: counter(pauta, decimal-leading-zero); color: var(--nu-blue-text); font-size: var(--nu-fs-xs); font-weight: 800; line-height: 1.7; }

.bzm__balao { width: fit-content; margin: 14px 0 0; padding: 10px 14px; border-radius: 18px 18px 18px 6px; background: var(--nu-cream); color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 600; }
.bzm__rascunho { margin: 10px 0 0 18px; padding: 12px 14px; border-radius: 18px 18px 6px 18px; background: color-mix(in srgb, var(--nu-biz-lavanda) 30%, var(--nu-white)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--nu-biz-lavanda) 80%, var(--nu-white)); }
.bzm__rasc-rot { display: block; color: var(--nu-navy); font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
.bzm__rascunho p { margin: 6px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); line-height: 1.5; }
.bzm__acoes { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
.bzm__btn { display: inline-flex; align-items: center; height: 36px; padding: 0 16px; border-radius: var(--nu-r-pill); box-shadow: inset 0 0 0 1px var(--nu-ink-14); color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; }
.bzm__btn--cheio { background: var(--nu-navy); color: var(--nu-cream-text); box-shadow: none; }

@media (min-width: 760px) {
  .bzm__corpo { grid-template-columns: 220px minmax(0, 1fr); padding: 16px; gap: 16px; }
  .bzm__fila { grid-template-columns: minmax(0, 1fr); align-content: start; }
  .bzm__areas { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
}

/* =====================================================================
   CAMADA 2 · com JS e movimento: a janela presa e o app num desenho fixo
   ===================================================================== */
@media (scripting: enabled) and (prefers-reduced-motion: no-preference) {
  .bzm { padding-top: clamp(40px, 6vw, 96px); padding-bottom: clamp(24px, 4vw, 64px); }
  .bzm__grade {
    --palco-h: min(56svh, 470px);
    display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: var(--palco-h) 36svh repeat(4, auto) 6vh; gap: 0;
  }
  .bzm__abertura { display: block; grid-column: 1; grid-row: 2; }
  .bzm__palco {
    grid-column: 1; grid-row: 1 / 8; align-self: start; position: sticky; top: var(--topo); height: var(--palco-h); z-index: 1;
    margin: 0 calc(-1 * var(--g)); display: flex; flex-direction: column; background: var(--nu-navy);
  }
  .bzm__janela { flex: 1; min-height: 0; overflow: hidden; }
  /* no voo do FLIP quem aparece é o clone; a área de verdade espera */
  .bzm__palco--voando .bzm__area--foco { visibility: hidden; }
  .bzm__palco .bzm__regua { display: flex; justify-content: center; padding: 0 0 4px; }

  /* o desenho fixo do celular: a fila em cima, as quatro áreas em 2 × 2 */
  .bzm__app { position: absolute; left: 0; top: 0; width: 724px; }
  .bzm__corpo { grid-template-columns: minmax(0, 1fr); padding: 12px; gap: 12px; }
  .bzm__fila { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .bzm__areas { grid-template-columns: repeat(2, 344px); gap: 12px; }
  .bzm__area { padding: 16px; }
  .bzm__cli { padding: 6px 8px; }

  /* perto de uma área, a mesa continua além da borda do app (o creme cobre a janela) */
  .bzm__app { transition: box-shadow .6s ease; }
  .bzm__app--dentro { box-shadow: 0 0 0 1px rgba(12, 21, 36, .08), 0 0 0 1400px var(--nu-cream); }
  /* a câmera parou numa área: as outras desfocam */
  .bzm__app--foco .bzm__area:not(.bzm__area--foco), .bzm__app--foco .bzm__barra { filter: blur(3px); opacity: .4; }
  .bzm__app--foco .bzm__fila { opacity: .9; }
  .bzm__barra { transition: filter .5s ease, opacity .5s ease; }
  /* e a área abre: as linhas sobem uma vez quando ela chega */
  .bzm__area--foco .bzm__k { animation: bzm-sobe .5s var(--curva) both; animation-delay: calc(.08s + var(--k, 0) * 50ms); }
  .bzm__area--foco .bzm__fatia, .bzm__area--foco .bzm__barra-f span { animation: bzm-cresce .8s var(--curva) both; animation-delay: .26s; }

  .bzm__passo {
    grid-column: 1; grid-row: var(--rm); min-height: calc(100svh - var(--topo)); padding: 28px 0;
    display: flex; flex-direction: column; justify-content: center; opacity: .32; transition: opacity .4s ease;
  }
  .bzm__passo--on { opacity: 1; }
}
@keyframes bzm-sobe { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes bzm-cresce { from { transform: scaleX(0); } to { transform: none; } }

@media (scripting: enabled) and (prefers-reduced-motion: no-preference) and (min-width: 960px) {
  .bzm { padding-top: clamp(64px, 8vw, 120px); padding-bottom: clamp(40px, 5vw, 80px); }
  .bzm__grade { grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); grid-template-rows: 46vh repeat(4, auto) 14vh; column-gap: clamp(32px, 4vw, 64px); }
  .bzm__abertura { grid-row: 1; }
  .bzm__palco {
    grid-column: 2; grid-row: 1 / 7; margin: 0; top: calc(var(--topo) + 24px); height: calc(100vh - var(--topo) - 48px); max-height: 820px;
    border-radius: var(--nu-r-card-lg); background: color-mix(in srgb, var(--nu-navy-2) 70%, var(--nu-navy)); box-shadow: inset 0 0 0 1px var(--nu-white-14);
  }
  .bzm__janela { border-radius: var(--nu-r-card-lg) var(--nu-r-card-lg) 0 0; }
  .bzm__regua { padding: 8px 0 14px; }
  /* o desenho fixo do desktop: a fila à esquerda, as áreas em 2 × 2 */
  .bzm__app { width: 1180px; }
  .bzm__corpo { grid-template-columns: 230px minmax(0, 1fr); padding: 18px; gap: 18px; }
  .bzm__fila { grid-template-columns: minmax(0, 1fr); align-content: start; }
  .bzm__areas { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
  .bzm__area { padding: 20px; }
  .bzm__passo { grid-column: 1; grid-row: var(--r); min-height: 82vh; padding: 0; }
}
</style>
