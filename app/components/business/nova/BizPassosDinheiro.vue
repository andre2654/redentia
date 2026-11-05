<script setup lang="ts">
/**
 * VARIAÇÃO 2 DOS PASSOS (?passos=2, só no dev): "O CAMINHO DO DINHEIRO"
 * (05/11/2026). O dono achou o cartão branco sobre a foto "comum demais" e pediu
 * algo mais inovador para mostrar as funções. Aqui a imagem nasce do próprio
 * produto: o dinheiro do cliente sai de cada banco, passa pela Redentia (o
 * losango da marca, o de NuTopoMarca) e chega a uma das quatro saídas da fila.
 * A luz é a linha de luz do site (a do horizonte da home e do /asset, nas cores
 * --nu-chat-luz-*), e o scroll é quem a faz correr: um passo por vez, do banco
 * ao losango e do losango à saída, e o número acende no destino.
 *
 * A HISTÓRIA DE CADA PASSO (os mesmos números da fila):
 *  01 · os quatro bancos de fora (XP, Bradesco, Itaú, Nubank) → R$ 4,97 mi;
 *  02 · os cinco, BTG incluso → 6 de 7. A linha do BTG para antes do losango,
 *       em âmbar: é a Família Azevedo, a carteira que não fechou;
 *  03 · só o Nubank (a Mariana) → a pauta de sexta;
 *  04 · só o Itaú (o Lucas) → a resposta para aprovar.
 *
 * TRÊS CAMADAS, COMO NO BizPassos:
 *  1. SEM JS, COM REDUZIR MOVIMENTO, OU NO HTML QUE O GOOGLE LÊ: o desenho no
 *     estado final (todas as linhas acesas, as quatro saídas com o número) e os
 *     quatro passos empilhados embaixo. O desenho tem coordenadas fixas (um
 *     viewBox para o desktop, outro para o celular), por isso o SSR já o traz
 *     inteiro, sem medir nada.
 *  2. COM JS: o palco preso (à direita; no celular, em cima) e os passos rolando.
 *  3. O SCRUB: cada linha tem pathLength="1", e o progresso do scroll vira o
 *     stroke-dashoffset dela, escrito direto no estilo a cada quadro (sem Vue).
 *     Só roda com a seção perto da tela (usePassosTravados). Nada em loop.
 *
 * NO CELULAR o desenho deita: os cinco bancos numa fileira em cima, o losango
 * no meio e uma linha só que desce até a saída do passo, que ocupa a largura.
 */
import { CARTEIRAS, CLIENTES_FORA, FECHAMENTO, PASSOS, PAUTA, ATENDIMENTO, reaisCurtos, totalFora } from '~/content/business/landing'
import { usePassosTravados, n2 } from '~/composables/usePassosTravados'

const pendente = CARTEIRAS.find((c) => !c.ok)!
const primeiro = (n: string) => n.split(' ')[0]!

/* ——— a geometria: desktop num quadro de 600 × 560, celular num de 360 × 300 ——— */
const D = { w: 600, h: 560, cx: 300, cy: 280, lx: 56, tx: 404 }
const M = { w: 360, h: 300, cx: 180, cy: 200, by: 34 }
const YS_BANCO = [64, 172, 280, 388, 496]
const XS_BANCO_M = [36, 108, 180, 252, 324]
const YS_SAIDA = [85, 215, 345, 475]

interface Banco { slug: string; nome: string; quem: string; valor: string; nota?: string }
const BANCOS: Banco[] = [
  ...CLIENTES_FORA.map((c) => ({ slug: c.slug, nome: c.banco, quem: primeiro(c.nome), valor: reaisCurtos(c.valor) })),
  // a casa da cena custodia no BTG: é a carteira que falta no fechamento
  { slug: 'btg', nome: 'BTG', quem: pendente.nome, valor: '', nota: '5 BDRs sem extrato' },
]
const iBanco = (slug: string) => BANCOS.findIndex((b) => b.slug === slug)

/** Que bancos alimentam cada passo; `parcial` é a linha que não chega. */
interface Fio { passo: number; banco: number; parcial?: boolean }
const fora = CLIENTES_FORA.map((c) => iBanco(c.slug))
const FIOS: Fio[] = [
  ...fora.map((b) => ({ passo: 0, banco: b })),
  ...fora.map((b) => ({ passo: 1, banco: b })),
  { passo: 1, banco: iBanco('btg'), parcial: true },
  { passo: 2, banco: iBanco(CLIENTES_FORA.find((c) => c.nome === PAUTA.cliente)!.slug) },
  { passo: 3, banco: iBanco(CLIENTES_FORA.find((c) => c.nome === ATENDIMENTO.cliente)!.slug) },
]

const entradaD = (b: number) => { const y = YS_BANCO[b]!; return `M ${D.lx + 24} ${y} C 190 ${y}, 196 ${D.cy}, ${D.cx - 34} ${D.cy}` }
const saidaD = (j: number) => { const y = YS_SAIDA[j]!; return `M ${D.cx + 34} ${D.cy} C 372 ${D.cy}, 366 ${y}, ${D.tx} ${y}` }
const entradaM = (b: number) => { const x = XS_BANCO_M[b]!; return `M ${x} ${M.by + 58} C ${x} 140, ${M.cx} 128, ${M.cx} ${M.cy - 30}` }
const saidaM = () => `M ${M.cx} ${M.cy + 30} L ${M.cx} ${M.h}`

const SAIDAS = [
  { rotulo: PASSOS[0]!.rotulo, numero: reaisCurtos(totalFora()), linha: `fora do escritório, em ${CLIENTES_FORA.length} clientes` },
  { rotulo: PASSOS[1]!.rotulo, numero: `${CARTEIRAS.filter((c) => c.ok).length} de ${CARTEIRAS.length}`, linha: `carteiras conciliadas, dia ${FECHAMENTO.dia} de ${FECHAMENTO.dias}` },
  { rotulo: PASSOS[2]!.rotulo, numero: PAUTA.quando, linha: `pauta da ${primeiro(PAUTA.cliente)}, pronta` },
  { rotulo: PASSOS[3]!.rotulo, numero: `“${ATENDIMENTO.pergunta}”`, linha: `resposta do ${primeiro(ATENDIMENTO.cliente)}, para aprovar` },
]

/* ——— o scroll ——— */
const secao = ref<HTMLElement | null>(null)
const palco = ref<HTMLElement | null>(null)
// SSR, sem JS e reduzir movimento: tudo aceso (o estado final)
const acesas = ref(SAIDAS.length)
const luzes: SVGPathElement[][] = [[], []] // [desktop, celular] × fio
const pontas: SVGPathElement[][] = [[], []]
const saidasD: SVGPathElement[][] = [[], []]
const bancos: HTMLElement[] = []
let ultimo: number[] = []
let ultimoBanco: string[] = []

const suave = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x))
const faixa = (p: number, a: number, b: number) => suave((p - a) / (b - a))

function pintar(el: SVGPathElement | undefined, ponta: SVGPathElement | undefined, frac: number, estado: string) {
  if (!el) return
  el.style.strokeDashoffset = String(1 - frac)
  if (el.dataset.e !== estado) el.dataset.e = estado
  if (ponta) {
    ponta.style.strokeDashoffset = String(-(frac - 0.04))
    ponta.style.opacity = frac > 0.01 && frac < 0.99 ? '1' : '0'
  }
}

function aoQuadro(t: number) {
  const i = Math.min(3, Math.max(0, Math.floor(t)))
  const p = t < 0 ? t : t - i
  const n = i + (p >= 0.74 ? 1 : 0)
  if (acesas.value !== n) acesas.value = n
  // a carga do losango: acende quando a luz chega nele e apaga quando sai
  palco.value?.style.setProperty('--carga', String(t < 0 ? 0 : faixa(p, 0.3, 0.45) * (1 - faixa(p, 0.7, 0.9))))

  const estadoBanco = BANCOS.map(() => '')
  FIOS.forEach((f, k) => {
    const frac = f.passo < i ? 1 : f.passo > i ? 0 : faixa(p, 0.04, 0.42)
    const fim = f.parcial ? frac * 0.78 : frac
    const estado = f.passo < i ? 'feito' : f.passo === i && frac > 0 ? (f.parcial ? 'falta' : 'vivo') : ''
    const chave = Math.round(fim * 1000) * 10 + (estado === 'feito' ? 1 : estado ? 2 : 0)
    if (f.passo === i && frac > 0.9) estadoBanco[f.banco] = f.parcial ? 'falta' : 'vivo'
    if (ultimo[k] === chave) return
    ultimo[k] = chave
    for (const v of [0, 1]) pintar(luzes[v]![k], pontas[v]![k], fim, estado)
  })
  for (let j = 0; j < SAIDAS.length; j++) {
    const frac = j < i ? 1 : j > i ? 0 : faixa(p, 0.46, 0.74)
    const estado = j < i ? 'feito' : j === i && frac > 0 ? 'vivo' : ''
    for (const v of [0, 1]) pintar(saidasD[v]![j], undefined, frac, estado)
  }
  bancos.forEach((el, b) => {
    if (ultimoBanco[b] === estadoBanco[b]) return
    ultimoBanco[b] = estadoBanco[b]!
    el.dataset.e = estadoBanco[b]!
  })
}

const { ativo, progresso, registrar, naRegua, focoNaRegua } = usePassosTravados({
  palco, secao, aoQuadro,
  aoMedirLayout: () => { ultimo = []; ultimoBanco = [] },
})
const regLuz = (v: number, k: number) => (el: unknown) => { if (el) luzes[v]![k] = el as SVGPathElement }
const regPonta = (v: number, k: number) => (el: unknown) => { if (el) pontas[v]![k] = el as SVGPathElement }
const regSaida = (v: number, j: number) => (el: unknown) => { if (el) saidasD[v]![j] = el as SVGPathElement }
const regBanco = (b: number) => (el: unknown) => { if (el) bancos[b] = el as HTMLElement }
const uid = useId()
</script>

<template>
  <section id="passos" ref="secao" class="bzd" aria-labelledby="bzd-titulo">
    <h2 id="bzd-titulo" class="bzd__sr">Os quatro pontos da fila</h2>
    <div class="bzd__grade">
      <article
        v-for="(p, i) in PASSOS" :id="`passo-${p.id}`" :key="p.id" :ref="registrar(i)"
        class="bzd__passo" :class="{ 'bzd__passo--on': i === ativo }" :style="{ '--r': i + 1, '--rm': i + 2 }"
        tabindex="-1" :aria-labelledby="`bzd-t-${p.id}`"
      >
        <p class="bzd__n">{{ n2(i) }} · {{ p.rotulo }}</p>
        <h3 :id="`bzd-t-${p.id}`" class="bzd__t">{{ p.titulo }}</h3>
        <p class="bzd__d">{{ p.apoio }}</p>
      </article>

      <!-- o palco: o desenho (bancos, losango, linhas) e as quatro saídas -->
      <div ref="palco" class="bzd__palco">
        <div class="bzd__quadro">
          <div class="bzd__mapa">
            <div class="bzd__desenho">
              <!-- as linhas: um SVG por orientação; o CSS mostra uma -->
              <svg v-for="(o, v) in ['d', 'm']" :key="o" class="bzd__fios" :class="`bzd__fios--${o}`" :viewBox.attr="o === 'd' ? `0 0 ${D.w} ${D.h}` : `0 0 ${M.w} ${M.h}`" aria-hidden="true">
                <defs>
                  <linearGradient :id="`${uid}-${o}`" gradientUnits="userSpaceOnUse" x1="0" y1="0" :x2.attr="o === 'd' ? D.w : 0" :y2.attr="o === 'd' ? 0 : M.h">
                    <stop offset="0" stop-color="#2F6AFF" />
                    <stop offset=".55" stop-color="#B48CFF" />
                    <stop offset="1" stop-color="#FF6B8A" />
                  </linearGradient>
                </defs>
                <!-- os trilhos apagados: por onde a luz vai passar -->
                <g class="bzd__trilhos">
                  <path v-for="(b, k) in BANCOS" :key="`t${k}`" :d="o === 'd' ? entradaD(k) : entradaM(k)" />
                  <path v-for="(s, j) in SAIDAS" :key="`ts${j}`" :d="o === 'd' ? saidaD(j) : saidaM()" />
                </g>
                <g :stroke="`url(#${uid}-${o})`">
                  <template v-for="(f, k) in FIOS" :key="`l${k}`">
                    <path :ref="regLuz(v, k)" class="bzd__luz" :class="{ 'bzd__luz--falta': f.parcial }" pathLength="1" :d="o === 'd' ? entradaD(f.banco) : entradaM(f.banco)" />
                    <path :ref="regPonta(v, k)" class="bzd__ponta" pathLength="1" :d="o === 'd' ? entradaD(f.banco) : entradaM(f.banco)" />
                  </template>
                  <path v-for="(s, j) in SAIDAS" :key="`s${j}`" :ref="regSaida(v, j)" class="bzd__luz" pathLength="1" :d="o === 'd' ? saidaD(j) : saidaM()" />
                </g>
              </svg>

              <ul class="bzd__bancos" aria-hidden="true">
                <li
                  v-for="(b, k) in BANCOS" :key="b.slug" :ref="regBanco(k)" class="bzd__banco" :class="{ 'bzd__banco--fechou': b.nota && acesas >= 2 }"
                  :style="{ '--x': `${(D.lx / D.w) * 100}%`, '--y': `${(YS_BANCO[k]! / D.h) * 100}%`, '--mx': `${(XS_BANCO_M[k]! / M.w) * 100}%`, '--my': `${(M.by / M.h) * 100}%` }"
                >
                  <span class="bzd__chip"><img :src="`/instituicoes/${b.slug}.svg`" alt="" width="26" height="26" loading="lazy"></span>
                  <span class="bzd__quem">{{ b.quem }}<span v-if="b.valor" class="bzd__valor">{{ b.valor }}</span><span v-else class="bzd__nota">{{ b.nota }}</span></span>
                </li>
              </ul>
              <span class="bzd__centro" aria-hidden="true"><span class="bzd__halo" /><img src="/logo-azul.svg" alt="" width="56" height="56"></span>
            </div>

            <ol class="bzd__saidas">
              <li
                v-for="(s, j) in SAIDAS" :key="s.rotulo" class="bzd__saida"
                :class="{ 'bzd__saida--acesa': j < acesas, 'bzd__saida--on': j === ativo }"
                :style="{ '--y': `${(YS_SAIDA[j]! / D.h) * 100}%` }"
              >
                <span class="bzd__s-rot">{{ s.rotulo }}</span>
                <strong class="bzd__s-num">{{ s.numero }}</strong>
                <span class="bzd__s-linha">{{ s.linha }}</span>
              </li>
            </ol>
          </div>
        </div>
        <BizPassosRegua class="bzd__regua" :ativo="ativo" :progresso="progresso" @ir="naRegua" @foco="focoNaRegua" />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* =====================================================================
   CAMADA 1 · empilhado (sem JS, reduzir movimento e o HTML do Google):
   o desenho no estado final e os quatro passos embaixo
   ===================================================================== */
.bzd {
  --g: clamp(16px, 5.5vw, 80px);
  --serifa: 'New York', ui-serif, 'Iowan Old Style', Georgia, 'Times New Roman', serif;
  --curva: cubic-bezier(.2, .8, .2, 1);
  --topo: var(--nuh-h, 72px);
  position: relative; isolation: isolate;
  padding: clamp(56px, 8vw, 120px) var(--g) clamp(48px, 6vw, 96px);
  background: var(--nu-navy); color: var(--nu-cream-text);
}
.bzd::before {
  content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background-image: radial-gradient(var(--nu-biz-ponto) 1.1px, transparent 1.4px); background-size: 22px 22px;
  -webkit-mask-image: linear-gradient(180deg, #000, transparent 40%); mask-image: linear-gradient(180deg, #000, transparent 40%);
}
.bzd__sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.bzd__grade { max-width: 1180px; margin: 0 auto; display: flex; flex-direction: column; gap: clamp(40px, 6vw, 72px); }

.bzd__passo { scroll-margin-top: calc(var(--topo) + 16px); outline: none; }
.bzd__n { margin: 0; color: var(--nu-biz-lavanda); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .16em; text-transform: uppercase; font-variant-numeric: tabular-nums; }
.bzd__t { margin: 14px 0 0; color: var(--nu-cream-text); font-family: var(--serifa); font-weight: 400; font-size: clamp(30px, 3.5vw, 50px); letter-spacing: -0.02em; line-height: 1.06; text-wrap: balance; }
.bzd__d { margin: 16px 0 0; max-width: 40ch; color: var(--nu-cream-text-70); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6; text-wrap: pretty; }
.bzd__passo:focus-visible .bzd__t { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 8px; text-decoration-color: var(--nu-biz-lavanda); }

.bzd__palco { order: -1; position: relative; border-radius: var(--nu-r-card-lg); background: color-mix(in srgb, var(--nu-navy-2) 70%, var(--nu-navy)); box-shadow: inset 0 0 0 1px var(--nu-white-14); overflow: clip; }
.bzd__palco::before {
  /* a luz azul atrás do losango */
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(40% 40% at 50% 50%, color-mix(in srgb, var(--nu-blue) 16%, transparent), transparent 70%);
}
.bzd__quadro { position: relative; padding: clamp(16px, 3vw, 32px); display: grid; place-items: center; }
.bzd__palco .bzd__regua { display: none; }

/* ——— o mapa: desktop deitado (bancos | losango | saídas) ——— */
.bzd__mapa { position: relative; width: min(100%, 640px); aspect-ratio: 600 / 560; }
.bzd__desenho { position: absolute; inset: 0; }
.bzd__fios { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.bzd__fios--m { display: none; }
.bzd__trilhos path { fill: none; stroke: var(--nu-white-14); stroke-width: 1.2; }
.bzd__luz { fill: none; stroke-width: 2.4; stroke-linecap: round; filter: drop-shadow(0 0 5px rgba(140, 150, 255, .55)); }
.bzd__luz--falta { stroke: var(--nu-amber-text); filter: drop-shadow(0 0 5px rgba(255, 181, 71, .5)); }
.bzd__ponta { display: none; fill: none; stroke: var(--nu-white); stroke-width: 3.2; stroke-linecap: round; stroke-dasharray: .04 2; }
/* no estado final, a linha que não chega para antes */
.bzd__luz--falta { stroke-dasharray: .78 2; }

.bzd__bancos { list-style: none; margin: 0; padding: 0; }
.bzd__banco { position: absolute; left: var(--x); top: var(--y); transform: translate(-50%, -22px); display: flex; flex-direction: column; align-items: center; gap: 6px; width: 104px; text-align: center; }
.bzd__chip {
  display: grid; place-items: center; width: 44px; height: 44px; border-radius: 14px; background: var(--nu-white);
  box-shadow: 0 0 0 1px var(--nu-white-14), 0 10px 24px -12px rgba(0, 0, 0, .6); transition: box-shadow .4s ease, transform .4s var(--curva);
}
.bzd__chip img { width: 26px; height: 26px; border-radius: 6px; }
.bzd__quem { display: flex; flex-direction: column; color: var(--nu-cream-text-78); font-size: var(--nu-fs-xs); font-weight: 700; line-height: 1.3; }
.bzd__valor { color: var(--nu-cream-text-55); font-weight: 600; font-variant-numeric: tabular-nums; }
.bzd__nota { color: var(--nu-amber-bg); font-weight: 600; }

.bzd__centro { position: absolute; left: 50%; top: 50%; width: 64px; height: 64px; transform: translate(-50%, -50%); display: grid; place-items: center; }
.bzd__centro img { position: relative; width: 56px; height: 56px; filter: drop-shadow(0 6px 18px rgba(47, 106, 255, .45)); }
.bzd__halo { position: absolute; inset: -34px; border-radius: 50%; background: radial-gradient(closest-side, rgba(120, 140, 255, .55), rgba(180, 140, 255, .18) 55%, transparent); opacity: var(--carga, .7); }

.bzd__saidas { list-style: none; margin: 0; padding: 0; position: absolute; left: calc(404 / 600 * 100%); right: 0; top: 0; bottom: 0; }
.bzd__saida {
  position: absolute; left: 0; right: 0; top: var(--y); transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 3px; padding: 14px 16px; border-radius: 18px;
  background: color-mix(in srgb, var(--nu-white) 5%, transparent); box-shadow: inset 0 0 0 1px var(--nu-white-14);
  transition: background .45s ease, box-shadow .45s ease;
}
.bzd__s-rot { color: var(--nu-cream-text-55); font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
.bzd__s-num { color: var(--nu-cream-text-35); font-size: clamp(19px, 1.9vw, 25px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; font-variant-numeric: tabular-nums; text-wrap: balance; transition: color .45s ease, text-shadow .45s ease; }
.bzd__s-linha { color: var(--nu-cream-text-55); font-size: var(--nu-fs-dense); font-weight: 500; line-height: 1.35; }
/* o número acende no destino */
.bzd__saida--acesa { background: color-mix(in srgb, var(--nu-white) 9%, transparent); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--nu-biz-lavanda) 45%, transparent), 0 0 32px -10px rgba(140, 150, 255, .55); }
.bzd__saida--acesa .bzd__s-num { color: var(--nu-cream-text); text-shadow: 0 0 24px rgba(160, 170, 255, .55); }
.bzd__saida--acesa .bzd__s-linha { color: var(--nu-cream-text-78); }

/* ——— celular: o mapa em pé (bancos em cima, losango, a saída embaixo) ——— */
@media (max-width: 959px) {
  .bzd__mapa { position: static; width: 100%; aspect-ratio: auto; display: flex; flex-direction: column; }
  .bzd__desenho { position: relative; inset: auto; width: min(100%, 420px); margin: 0 auto; aspect-ratio: 360 / 300; }
  .bzd__fios--d { display: none; }
  .bzd__fios--m { display: block; }
  .bzd__nota { display: none; }
  .bzd__banco { left: var(--mx); top: var(--my); transform: translate(-50%, -20px); width: 72px; gap: 5px; }
  .bzd__chip { width: 40px; height: 40px; border-radius: 12px; }
  .bzd__chip img { width: 24px; height: 24px; }
  .bzd__quem { font-size: 11px; line-height: 1.25; }
  .bzd__centro { top: calc(200 / 300 * 100%); width: 56px; height: 56px; }
  .bzd__centro img { width: 48px; height: 48px; }
  .bzd__halo { inset: -26px; }
  /* empilhado, as quatro saídas numa grade 2 × 2 debaixo do desenho */
  .bzd__saidas { position: static; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .bzd__saida { position: relative; top: auto; transform: none; padding: 12px 14px; border-radius: 16px; }
  .bzd__s-num { font-size: 20px; white-space: normal; }
}

/* =====================================================================
   CAMADA 2 · com JS e movimento: o palco preso e o scrub
   ===================================================================== */
@media (scripting: enabled) and (prefers-reduced-motion: no-preference) {
  .bzd { padding-top: clamp(40px, 6vw, 96px); padding-bottom: clamp(24px, 4vw, 64px); }
  .bzd__grade {
    --palco-h: min(52svh, 440px);
    display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: var(--palco-h) repeat(4, auto) 6vh; gap: 0;
  }
  .bzd__palco {
    grid-column: 1; grid-row: 1 / 7; align-self: start; position: sticky; top: var(--topo); height: var(--palco-h); z-index: 1;
    margin: 0 calc(-1 * var(--g)); border-radius: 0; box-shadow: none; background: var(--nu-navy);
    display: flex; flex-direction: column;
  }
  .bzd__quadro { flex: 1; min-height: 0; padding: 8px 16px 0; container-type: size; }
  .bzd__palco .bzd__regua { display: flex; justify-content: center; padding-bottom: 6px; }

  .bzd__passo {
    grid-column: 1; grid-row: var(--rm); min-height: calc(100svh - var(--topo)); padding: 28px 0;
    display: flex; flex-direction: column; justify-content: center; opacity: .32; transition: opacity .4s ease;
  }
  .bzd__passo--on { opacity: 1; }

  /* as linhas apagadas até o scroll chegar nelas */
  .bzd__luz { stroke-dasharray: 1 2; stroke-dashoffset: 1; transition: opacity .4s ease; }
  .bzd__luz--falta { stroke-dasharray: 1 2; }
  .bzd__luz[data-e='feito'] { opacity: .28; }
  .bzd__ponta { display: inline; opacity: 0; filter: drop-shadow(0 0 4px #fff); }
  .bzd__banco .bzd__chip { opacity: .55; }
  .bzd__banco .bzd__quem { opacity: .5; transition: opacity .4s ease; }
  .bzd__banco[data-e='vivo'] .bzd__chip { opacity: 1; transform: scale(1.06); box-shadow: 0 0 0 1px var(--nu-white-35), 0 0 28px -4px rgba(140, 150, 255, .8); }
  .bzd__banco[data-e='falta'] .bzd__chip { opacity: 1; box-shadow: 0 0 0 1px var(--nu-amber-text), 0 0 24px -4px rgba(255, 181, 71, .7); }
  .bzd__banco:is([data-e='vivo'], [data-e='falta']) .bzd__quem { opacity: 1; }
  .bzd__chip { transition: opacity .4s ease, box-shadow .4s ease, transform .4s var(--curva); }
  .bzd__halo { opacity: calc(.18 + var(--carga, 0) * .82); }
  /* o motivo do BTG só aparece quando o fechamento chega */
  .bzd__nota { opacity: 0; transition: opacity .4s ease; }
  .bzd__banco--fechou .bzd__nota { opacity: 1; }
}

/* celular com JS: o desenho e UMA saída por vez, na largura toda */
@media (scripting: enabled) and (prefers-reduced-motion: no-preference) and (max-width: 959px) {
  .bzd__mapa { height: 100%; justify-content: center; }
  .bzd__desenho { flex: none; width: min(100cqw, calc((100cqh - 84px) * 1.2)); }
  .bzd__saidas { flex: none; display: grid; grid-template-columns: minmax(0, 1fr); align-content: start; gap: 0; margin-top: -2px; }
  .bzd__saida { grid-area: 1 / 1; opacity: 0; transform: translateY(8px); transition: opacity .35s ease, transform .5s var(--curva), background .45s ease, box-shadow .45s ease; padding: 10px 16px; flex-direction: row; flex-wrap: wrap; align-items: baseline; column-gap: 10px; }
  .bzd__s-rot { width: 100%; }
  .bzd__s-num { font-size: 24px; white-space: nowrap; }
  .bzd__saida--on { opacity: 1; transform: none; }
}

@media (scripting: enabled) and (prefers-reduced-motion: no-preference) and (min-width: 960px) {
  .bzd { padding-top: clamp(64px, 8vw, 120px); padding-bottom: clamp(40px, 5vw, 80px); }
  .bzd__grade { grid-template-columns: minmax(0, .82fr) minmax(0, 1.18fr); grid-template-rows: repeat(4, auto) 14vh; column-gap: clamp(32px, 4vw, 72px); }
  .bzd__palco {
    grid-column: 2; grid-row: 1 / 6; margin: 0; top: calc(var(--topo) + 24px); height: calc(100vh - var(--topo) - 48px); max-height: 820px;
    border-radius: var(--nu-r-card-lg); box-shadow: inset 0 0 0 1px var(--nu-white-14); background: color-mix(in srgb, var(--nu-navy-2) 70%, var(--nu-navy));
  }
  .bzd__quadro { padding: 28px 28px 8px; }
  .bzd__mapa { width: min(100cqw, calc(100cqh * 600 / 560)); }
  .bzd__regua { padding-bottom: 14px; }
  .bzd__passo { grid-column: 1; grid-row: var(--r); min-height: 82vh; padding: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .bzd__passo, .bzd__saida, .bzd__s-num, .bzd__chip { transition: none !important; }
}
</style>
