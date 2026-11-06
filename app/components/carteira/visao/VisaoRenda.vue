<script setup lang="ts">
// "Quanto ele te paga" (06/11/2026): a quarta pergunta da /carteira nova, e o
// aviso que o dono quis como assinatura ("dá para pagar a fatura só com os
// proventos?"). Junta o que eram Proventos e "Daqui a 5 anos":
//  - a frase: quanto da vida a renda que CAI NA CONTA já paga. O gasto é a
//    média de 3 meses do cartão e da conta, sem o pagamento de fatura, as
//    transferências entre contas próprias e as aplicações. O que rende e fica
//    investido (AUPO11, Tesouro) aparece à parte, para o "falta" não mentir;
//  - a régua: a vida inteira de largura, com o que já é pago;
//  - mês a mês, a mesma conta;
//  - novembro: o que já está marcado;
//  - daqui a 5 anos: os caminhos que o motor simulou (2.000 cenários), do mais
//    leve ao mais pesado, cada um com o lado ruim dito. O "meio-termo" é o
//    tamanho em que o motor parou por um veto. Nada manda comprar: escolher o
//    caminho só redesenha a curva, e "Simular" preenche o chat.
// Sem o cartão conectado, a frase fala só da renda e a régua vira o convite.
import type { CarteiraVisao } from '~/types/carteiraVisao'
import { brl0, cobertura, pctTxt } from '~/utils/carteiraVisao'

const props = defineProps<{ visao: CarteiraVisao }>()
const { mask } = useHiddenValues()
const r = computed(() => props.visao.renda)

const cob = computed(() => cobertura(r.value))
const comRendeu = computed(() => (r.value.gastoMedio ? ((r.value.caiu + r.value.rendeu) / r.value.gastoMedio) * 100 : null))
const falta = computed(() => (r.value.gastoMedio ? Math.max(0, r.value.gastoMedio - r.value.caiu) : null))
const frase = computed(() => (cob.value != null
  ? `Seus investimentos já pagam ${pctTxt(cob.value)} da sua vida.`
  : `Em ${r.value.mesFechado}, seus investimentos pagaram ${mask(brl0(r.value.caiu))}.`))

/* a régua: a vida inteira de largura */
const regua = computed(() => {
  const g = r.value.gastoMedio
  if (!g) return null
  const caiu = Math.min(100, (r.value.caiu / g) * 100)
  const rendeu = Math.min(100 - caiu, (r.value.rendeu / g) * 100)
  return { caiu, rendeu }
})

/* mês a mês: a cobertura (ou a renda, sem gasto) */
const meses = computed(() => {
  const ms = r.value.meses
  const valores = ms.map((m) => (m.gasto ? (m.renda / m.gasto) * 100 : m.renda))
  const max = Math.max(...valores) * 1.15
  return ms.map((m, i) => ({ ...m, v: valores[i]!, h: (valores[i]! / max) * 100, txt: m.gasto ? pctTxt(valores[i]!) : mask(brl0(m.renda)) }))
})

/* novembro */
const fmtDia = (iso: string) => { const [, mm, dd] = iso.split('-'); return `${dd}/${mm}` }
const marcadosTotal = computed(() => r.value.marcados.reduce((s, m) => s + m.valor, 0))

/* daqui a 5 anos: os caminhos */
const escolhido = ref(r.value.caminhos[0]?.id ?? '')
const caminho = computed(() => r.value.caminhos.find((c) => c.id === escolhido.value) ?? r.value.caminhos[0]!)
const yMax = computed(() => Math.ceil((Math.max(...r.value.caminhos.flatMap((c) => c.p90)) * 1.08) / 10) * 10)
const W = 600
const H = 240
const xDe = (i: number) => (i / 60) * W
const yDe = (v: number) => H - (v / yMax.value) * H
const linha = (s: number[]) => s.map((v, i) => `${i ? 'L' : 'M'}${xDe(i).toFixed(1)},${yDe(v).toFixed(1)}`).join('')
const banda = computed(() => {
  const c = caminho.value
  return `${linha(c.p90)}${c.p10.map((v, i) => [i, v] as const).reverse().map(([i, v]) => `L${xDe(i).toFixed(1)},${yDe(v).toFixed(1)}`).join('')}Z`
})
const grades = computed(() => Array.from({ length: yMax.value / 10 + 1 }, (_, i) => i * 10))
const anoFim = new Date().getFullYear() + 5
const fim = computed(() => {
  const c = caminho.value
  return { med: c.mediana[60]!, p10: c.p10[60]!, p90: c.p90[60]! }
})
const resultadoDe = (id: string) => {
  const c = r.value.caminhos.find((x) => x.id === id)!
  return `${pctTxt(c.mediana[60]!)} em ${anoFim}`
}

/* a mira */
const mira = ref<number | null>(null)
const grafico = ref<HTMLElement | null>(null)
function mover(e: PointerEvent) {
  const el = grafico.value
  if (!el) return
  const b = el.getBoundingClientRect()
  mira.value = Math.max(0, Math.min(60, Math.round(((e.clientX - b.left) / b.width) * 60)))
}
const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
function mesDe(i: number) {
  const d = new Date()
  d.setMonth(d.getMonth() + i)
  return `${MES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`
}
const leitura = computed(() => {
  const i = mira.value
  if (i == null) return null
  const c = caminho.value
  return { i, x: (i / 60) * 100, y: (c.mediana[i]! / yMax.value) * 100, mes: mesDe(i), med: pctTxt(c.mediana[i]!), faixa: `${pctTxt(c.p10[i]!)} a ${pctTxt(c.p90[i]!)}` }
})

const painel = useChatPainel()
function simular() {
  const c = caminho.value
  painel.anexar({ id: 'carteira:renda', tipo: 'carteira', rotulo: 'Renda da carteira', texto: `${frase.value}\nCaminho: ${c.nome}. ${c.detalhe} Lado ruim: ${c.custo}\nEm 5 anos: ${pctTxt(fim.value.med)} (entre ${pctTxt(fim.value.p10)} e ${pctTxt(fim.value.p90)}).` })
  painel.preencher(`Simule outro caminho para os meus investimentos pagarem mais da minha vida: `)
}
</script>

<template>
  <section class="vrd" aria-labelledby="vrd-titulo" data-clarity-mask="true">
    <span class="vrd__eyebrow">Quanto ele te paga</span>
    <h2 id="vrd-titulo" class="vrd__frase">{{ frase }}</h2>
    <p v-if="cob != null" class="vrd__sub">
      Em {{ r.mesFechado }} caíram {{ mask(brl0(r.caiu)) }} na sua conta, e você gasta uns {{ mask(brl0(r.gastoMedio!)) }} por mês.
      Contando o que rendeu e ficou investido, seriam {{ pctTxt(comRendeu!) }}.
    </p>

    <!-- a régua: a vida inteira de largura -->
    <div v-if="regua" class="vrd__regua">
      <div class="vrd__trilho" role="img" :aria-label="`Caiu na conta: ${pctTxt(regua.caiu)} dos gastos; rendeu e ficou investido: mais ${pctTxt(regua.rendeu)}`">
        <span class="vrd__caiu" :style="{ width: `${regua.caiu}%` }" />
        <span class="vrd__rendeu" :style="{ width: `${regua.rendeu}%` }" />
      </div>
      <dl class="vrd__legenda">
        <div><dt><i class="vrd__k vrd__k--caiu" />Caiu na conta</dt><dd>{{ mask(brl0(r.caiu)) }}</dd></div>
        <div><dt><i class="vrd__k vrd__k--rendeu" />Rendeu e ficou investido</dt><dd>{{ mask(brl0(r.rendeu)) }}</dd></div>
        <div><dt><i class="vrd__k vrd__k--falta" />Falta para pagar tudo</dt><dd>{{ mask(brl0(falta!)) }} por mês</dd></div>
      </dl>
      <p class="vrd__fonte">Gastos: a média de agosto a outubro no cartão e na conta, sem o pagamento da fatura, as transferências entre as suas contas e as aplicações.</p>
    </div>
    <div v-else class="vrd__convite">
      <p class="vrd__convite-t">Conecte o cartão e a conta do dia a dia, e eu digo quanto da sua vida os investimentos já pagam.</p>
      <NuxtLink to="/conta#open-finance" class="vrd__convite-b">Conectar</NuxtLink>
    </div>

    <div class="vrd__grade">
      <!-- mês a mês e novembro -->
      <div class="vrd__col">
        <h3 class="vrd__h3">{{ meses[0]?.gasto ? 'Quanto pagou, mês a mês' : 'Quanto caiu, mês a mês' }}</h3>
        <ol class="vrd__meses">
          <li v-for="m in meses" :key="m.mes" class="vrd__mes" :class="{ 'vrd__mes--ultimo': m.mes === meses[meses.length - 1]!.mes }">
            <span class="vrd__mes-v">{{ m.txt }}</span>
            <span class="vrd__mes-b"><i :style="{ height: `${m.h}%` }" /></span>
            <span class="vrd__mes-n">{{ m.mes }}</span>
          </li>
        </ol>

        <h3 class="vrd__h3 vrd__h3--2">Em novembro, já marcados</h3>
        <ul class="vrd__agenda">
          <li v-for="m in r.marcados" :key="m.data">
            <span class="vrd__ag-d">{{ fmtDia(m.data) }}</span>
            <span class="vrd__ag-t">{{ m.tickers.join(', ') }}</span>
            <span class="vrd__ag-v">{{ mask(brl0(m.valor)) }}</span>
          </li>
          <li class="vrd__ag-total"><span /><span>Total</span><span class="vrd__ag-v">{{ mask(brl0(marcadosTotal)) }}</span></li>
        </ul>
      </div>

      <!-- daqui a 5 anos -->
      <div v-if="cob != null" class="vrd__col vrd__futuro">
        <h3 class="vrd__h3">E daqui a 5 anos?</h3>
        <div class="vrd__caminhos" role="radiogroup" aria-label="Caminhos simulados">
          <button
            v-for="c in r.caminhos" :key="c.id" type="button" role="radio" class="vrd__cam" :class="{ 'vrd__cam--on': escolhido === c.id }"
            :aria-checked="escolhido === c.id" @click="escolhido = c.id"
          >
            <span class="vrd__cam-radio" aria-hidden="true" />
            <span class="vrd__cam-txt">
              <span class="vrd__cam-n">{{ c.nome }}</span>
              <span v-if="escolhido === c.id" class="vrd__cam-d">{{ c.detalhe }}</span>
              <span v-if="escolhido === c.id" class="vrd__cam-c">{{ c.custo }}</span>
            </span>
            <span class="vrd__cam-r">{{ resultadoDe(c.id) }}</span>
          </button>
        </div>

        <div
          ref="grafico" class="vrd__graf" role="img" :aria-label="`${caminho.nome}: em ${anoFim}, os investimentos pagariam ${pctTxt(fim.med)} da sua vida, entre ${pctTxt(fim.p10)} e ${pctTxt(fim.p90)} em 8 de cada 10 cenários.`"
          @pointermove="mover" @pointerleave="mira = null"
        >
          <span v-for="g in grades" :key="g" class="vrd__gl" :style="{ bottom: `${(g / yMax) * 100}%` }"><span>{{ g }}%</span></span>
          <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" class="vrd__svg" aria-hidden="true">
            <!-- os outros caminhos, apagados: a escolha se compara sem trocar de aba -->
            <path v-for="c in r.caminhos.filter((x) => x.id !== escolhido)" :key="c.id" :d="linha(c.mediana)" class="vrd__fantasma" vector-effect="non-scaling-stroke" />
            <path :d="banda" class="vrd__banda" />
            <path :d="linha(caminho.mediana)" class="vrd__med" vector-effect="non-scaling-stroke" />
          </svg>
          <span class="vrd__fim" :style="{ bottom: `${(fim.med / yMax) * 100}%` }"><b>{{ pctTxt(fim.med) }}</b> em {{ anoFim }}</span>
          <template v-if="leitura">
            <span class="vrd__mira" :style="{ left: `${leitura.x}%` }" />
            <span class="vrd__mira-p" :style="{ left: `${leitura.x}%`, bottom: `${leitura.y}%` }" />
            <span class="vrd__dica" :class="{ 'vrd__dica--esq': leitura.x > 60 }" :style="{ left: `${leitura.x}%` }">
              <b>{{ leitura.mes }}</b> {{ leitura.med }} da vida<br><span>de {{ leitura.faixa }} em 8 de 10 cenários</span>
            </span>
          </template>
          <span class="vrd__x vrd__x--ini">hoje</span><span class="vrd__x vrd__x--fim">{{ anoFim }}</span>
        </div>
        <p class="vrd__nota">A faixa cobre 8 de cada 10 dos 2.000 cenários simulados. É simulação, não promessa nem recomendação.</p>
        <button type="button" class="vrd__simular" @click="simular">Simular outro caminho</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.vrd { background: var(--nu-cream); padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px); scroll-margin-top: calc(var(--nuh-h, 76px) + 56px); }
.vrd__eyebrow { color: var(--nu-blue-text); font-size: var(--nu-fs-eyebrow); font-weight: 800; }
.vrd__frase { margin: 12px 0 0; max-width: 860px; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.035em; line-height: 1.08; font-variant-numeric: tabular-nums; text-wrap: balance; }
.vrd__sub { margin: 14px 0 0; max-width: 760px; color: var(--nu-ink-75); font-size: var(--nu-fs-lg); font-weight: 600; line-height: 1.45; font-variant-numeric: tabular-nums; }

.vrd__regua { margin-top: clamp(26px, 3.4vw, 40px); max-width: 1100px; }
.vrd__trilho { display: flex; gap: 2px; height: 22px; padding: 0; border-radius: 6px; background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-cream-line); overflow: hidden; }
.vrd__caiu { background: var(--nu-blue); border-radius: 6px 4px 4px 6px; transform-origin: left; animation: vrd-cresce .9s cubic-bezier(.22, 1, .36, 1) .1s both; }
.vrd__rendeu { background: repeating-linear-gradient(135deg, color-mix(in srgb, var(--nu-blue) 45%, transparent) 0 3px, color-mix(in srgb, var(--nu-blue) 18%, transparent) 3px 7px); border-radius: 4px; transform-origin: left; animation: vrd-cresce .9s cubic-bezier(.22, 1, .36, 1) .35s both; }
@keyframes vrd-cresce { from { transform: scaleX(0); } }
.vrd__legenda { display: flex; flex-wrap: wrap; gap: 10px 36px; margin: 14px 0 0; }
.vrd__legenda div { display: flex; flex-direction: column; gap: 2px; }
.vrd__legenda dt { display: flex; align-items: center; gap: 8px; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 600; }
.vrd__legenda dd { margin: 0 0 0 18px; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; font-variant-numeric: tabular-nums; }
.vrd__k { width: 10px; height: 10px; border-radius: 3px; }
.vrd__k--caiu { background: var(--nu-blue); }
.vrd__k--rendeu { background: repeating-linear-gradient(135deg, color-mix(in srgb, var(--nu-blue) 55%, transparent) 0 2px, color-mix(in srgb, var(--nu-blue) 20%, transparent) 2px 4px); }
.vrd__k--falta { background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-cream-line); }
.vrd__fonte { margin: 12px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.vrd__convite { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px 24px; margin-top: clamp(24px, 3vw, 36px); max-width: 1100px; padding: 20px 24px; border-radius: var(--nu-r-card); background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-cream-line); }
.vrd__convite-t { margin: 0; max-width: 60ch; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; line-height: 1.45; }
.vrd__convite-b { height: 40px; padding: 0 20px; display: inline-flex; align-items: center; border-radius: var(--nu-r-pill); background: var(--nu-ink); color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: 700; text-decoration: none; }

.vrd__grade { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 32px clamp(32px, 5vw, 80px); margin-top: clamp(40px, 5vw, 64px); max-width: 1240px; }
.vrd__h3 { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em; }
.vrd__h3--2 { margin-top: clamp(28px, 3.4vw, 40px); }
.vrd__meses { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; list-style: none; margin: 16px 0 0; padding: 0; height: 150px; }
.vrd__mes { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; gap: 6px; text-align: center; }
.vrd__mes-v { color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.vrd__mes-b { display: flex; align-items: flex-end; justify-content: center; }
.vrd__mes-b i { display: block; width: min(36px, 70%); border-radius: 4px 4px 0 0; background: color-mix(in srgb, var(--nu-blue) 35%, transparent); }
.vrd__mes--ultimo .vrd__mes-b i { background: var(--nu-blue); }
.vrd__mes--ultimo .vrd__mes-v { color: var(--nu-ink); }
.vrd__mes-n { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; border-top: 1px solid var(--nu-cream-line); padding-top: 6px; }
.vrd__agenda { list-style: none; margin: 10px 0 0; padding: 0; }
.vrd__agenda li { display: grid; grid-template-columns: 56px minmax(0, 1fr) auto; gap: 12px; padding: 10px 0; border-top: 1px solid var(--nu-cream-line); font-size: var(--nu-fs-md); }
.vrd__agenda li:first-child { border-top: 0; }
.vrd__ag-d { color: var(--nu-gray); font-weight: 700; font-variant-numeric: tabular-nums; }
.vrd__ag-t { color: var(--nu-ink); font-weight: 700; }
.vrd__ag-v { color: var(--nu-ink); font-weight: 700; font-variant-numeric: tabular-nums; text-align: right; }
.vrd__ag-total { color: var(--nu-gray-3); font-weight: 600; }
.vrd__ag-total .vrd__ag-v { font-weight: 800; }

.vrd__caminhos { display: flex; flex-direction: column; gap: 6px; margin-top: 14px; }
.vrd__cam {
  display: grid; grid-template-columns: 18px minmax(0, 1fr) auto; align-items: start; gap: 12px; padding: 14px 16px; border: 0; border-radius: 14px;
  background: transparent; text-align: left; font: inherit; cursor: pointer; transition: background .2s, box-shadow .2s;
}
.vrd__cam:hover { background: color-mix(in srgb, var(--nu-white) 60%, transparent); }
.vrd__cam--on { background: var(--nu-white); box-shadow: 0 1px 2px var(--nu-ink-08, rgba(0,0,0,.06)), 0 6px 20px -12px var(--nu-ink-14); }
.vrd__cam:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.vrd__cam-radio { width: 18px; height: 18px; border-radius: 50%; box-shadow: inset 0 0 0 2px var(--nu-gray-2); margin-top: 1px; transition: box-shadow .2s; }
.vrd__cam--on .vrd__cam-radio { box-shadow: inset 0 0 0 5px var(--nu-blue); }
.vrd__cam-txt { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.vrd__cam-n { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; line-height: 1.35; }
.vrd__cam-d { color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.vrd__cam-c { color: var(--nu-amber-text); font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.5; }
.vrd__cam-r { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.vrd__cam:not(.vrd__cam--on) .vrd__cam-r { color: var(--nu-gray-3); font-weight: 700; }

.vrd__graf { position: relative; height: 220px; margin: 24px 54px 30px 34px; touch-action: pan-y; cursor: crosshair; }
.vrd__gl { position: absolute; left: 0; right: 0; height: 0; border-top: 1px solid var(--nu-cream-line); }
.vrd__gl span { position: absolute; left: -34px; top: -8px; width: 28px; text-align: right; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; font-variant-numeric: tabular-nums; }
.vrd__svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.vrd__banda { fill: color-mix(in srgb, var(--nu-blue) 14%, transparent); transition: d .5s cubic-bezier(.22, 1, .36, 1); }
.vrd__fantasma { fill: none; stroke: var(--nu-gray-2); stroke-width: 1.5; stroke-dasharray: 3 4; opacity: .55; }
.vrd__med { fill: none; stroke: var(--nu-blue); stroke-width: 2.5; stroke-linejoin: round; stroke-linecap: round; transition: d .5s cubic-bezier(.22, 1, .36, 1); }
.vrd__fim { position: absolute; left: 100%; transform: translate(8px, 50%); color: var(--nu-gray-3); font-size: var(--nu-fs-xs); font-weight: 600; white-space: nowrap; transition: bottom .5s cubic-bezier(.22, 1, .36, 1); }
.vrd__fim b { display: block; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; }
.vrd__x { position: absolute; top: calc(100% + 8px); color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; }
.vrd__x--ini { left: 0; }
.vrd__x--fim { right: 0; }
.vrd__mira { position: absolute; top: 0; bottom: 0; width: 0; border-left: 1px dashed var(--nu-gray-2); pointer-events: none; }
.vrd__mira-p { position: absolute; width: 10px; height: 10px; margin: 0 0 -5px -5px; border-radius: 50%; background: var(--nu-blue); box-shadow: 0 0 0 3px var(--nu-white); pointer-events: none; }
.vrd__dica { position: absolute; top: -6px; transform: translate(10px, -100%); padding: 8px 10px; border-radius: 10px; background: var(--nu-navy); color: var(--nu-white); font-size: var(--nu-fs-xs); font-weight: 600; line-height: 1.45; white-space: nowrap; pointer-events: none; font-variant-numeric: tabular-nums; }
.vrd__dica--esq { transform: translate(calc(-100% - 10px), -100%); }
.vrd__dica b { font-weight: 800; }
.vrd__dica span { color: var(--nu-white-70, rgba(255,255,255,.7)); font-weight: 500; }
.vrd__nota { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.5; }
.vrd__simular { margin-top: 14px; height: 40px; padding: 0 18px; border: 1px solid var(--nu-cream-line); border-radius: var(--nu-r-pill); background: var(--nu-white); color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer; }
.vrd__simular:hover { background: var(--nu-cream-2); }
.vrd__simular:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

@media (max-width: 960px) { .vrd__grade { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 480px) {
  .vrd__graf { margin-right: 46px; }
  .vrd__cam { grid-template-columns: 18px minmax(0, 1fr); }
  .vrd__cam-r { grid-column: 2; }
}
@media (prefers-reduced-motion: reduce) {
  .vrd__caiu, .vrd__rendeu { animation: none; }
  .vrd__banda, .vrd__med, .vrd__fim { transition: none; }
}
</style>
