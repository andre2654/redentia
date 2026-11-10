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
//
// 07/11, com a resposta real: o que rendeu e ficou investido aparece também sem
// o cartão, com a fonte da estimativa (`rendeuFonte`); o mês dos proventos
// marcados e os meses da média do gasto saem do dado (eram fixos); sem os
// caminhos (o motor não respondeu), o "Daqui a 5 anos" não monta; e, sem ele, o
// mês a mês e o mês corrente ficam lado a lado, sem a metade vazia.
import FraseDestaque from './FraseDestaque.vue'
import type { CarteiraVisao, RendaPorClasse, RendaVisao } from '~/types/carteiraVisao'
import { brl0, cobertura, pctTxt } from '~/utils/carteiraVisao'
import { nomeDoMes } from '~/utils/impostoVisao'
import { agoraEmSP } from '~/utils/pregao'

// quem monta a seção só a monta com a renda (CarteiraVisao: o bloco que quebrou vem null)
const props = defineProps<{ visao: CarteiraVisao }>()
const { mask } = useHiddenValues()
const r = computed(() => props.visao.renda as RendaVisao)
// 07/11, revisão do dono: com o Nubank (conta e cartão) já conectado, pedir
// "Conecte o cartão" era estranho. O gasto só começa a ser lido no próximo
// sync depois do deploy; enquanto não chega, a tela diz isso, e só convida a
// conectar quem não tem banco que traga a conta ou o cartão
const bancoDoGasto = computed(() => props.visao.conexoes.find((c) => c.estado !== 'caida' && (c.fontes.includes('cartao') || c.fontes.includes('transacoes')))?.instituicao ?? null)

const cob = computed(() => cobertura(r.value))
const comRendeu = computed(() => (r.value.gastoMedio ? ((r.value.caiu + r.value.rendeu) / r.value.gastoMedio) * 100 : null))
const falta = computed(() => (r.value.gastoMedio ? Math.max(0, r.value.gastoMedio - r.value.caiu) : null))
const frase = computed(() => (cob.value != null
  ? `Seus investimentos já pagam ${pctTxt(cob.value)} da sua vida.`
  : `Em ${r.value.mesFechado}, seus investimentos pagaram ${mask(brl0(r.value.caiu))}.`))
// sem o cartão: o que rendeu e ficou investido (a régua, que dizia isso, vira o convite)
const rendeuSemGasto = computed(() => (cob.value == null && r.value.rendeu > 0 ? r.value.rendeu : null))

/* a régua: a vida inteira de largura */
const regua = computed(() => {
  const g = r.value.gastoMedio
  if (!g) return null
  const caiu = Math.min(100, (r.value.caiu / g) * 100)
  const rendeu = Math.min(100 - caiu, (r.value.rendeu / g) * 100)
  return { caiu, rendeu }
})

/* mês a mês: a cobertura (ou a renda, sem gasto) */
const comGasto = computed(() => r.value.meses.some((m) => m.gasto))
// 08/11, o dono pediu esta seção mais simples: sem o gasto (a fileira em R$), o mês corrente entra
// no fim, tracejado, com o que já está marcado para cair (era uma segunda lista com o total)
const futuro = computed(() => (!comGasto.value && marcadosTotal.value > 0 ? marcadosTotal.value : null))
// 08/11, o dono pediu barras empilhadas por tipo: FIIs e ações (o backend manda `porClasse`; sem ele,
// a barra sai inteira, de uma cor só). Cada pedaço é a fração do total na altura da barra
const CLASSES = [{ id: 'fii', nome: 'FIIs' }, { id: 'acoes', nome: 'Ações' }] as const
function pedacos(total: number, h: number, pc?: RendaPorClasse) {
  if (!pc || total <= 0) return [{ classe: 'todos', h }]
  return CLASSES.map((c) => ({ classe: c.id, h: h * ((pc[c.id] ?? 0) / total) })).filter((p) => p.h > 0)
}
const porClasseMarcado = computed<RendaPorClasse | undefined>(() => {
  const ms = r.value.marcados
  if (!ms.length || ms.some((m) => !m.porClasse)) return undefined
  return ms.reduce((s, m) => ({ acoes: s.acoes + m.porClasse!.acoes, fii: s.fii + m.porClasse!.fii }), { acoes: 0, fii: 0 })
})
const empilhado = computed(() => r.value.meses.some((m) => m.porClasse))
const meses = computed(() => {
  const ms = r.value.meses
  const valores = ms.map((m) => (m.gasto ? (m.renda / m.gasto) * 100 : m.renda))
  const max = Math.max(...valores, futuro.value ?? 0) * 1.15
  const linhas = ms.map((m, i) => {
    const h = (valores[i]! / max) * 100
    return {
      mes: m.mes, nomeLongo: MES_LONGO[m.mes] ?? m.mes, gasto: m.gasto, futuro: false, h, total: m.renda, porClasse: m.porClasse,
      pagamentos: m.pagamentos ?? null, pedacos: pedacos(m.renda, h, m.porClasse), txt: m.gasto ? pctTxt(valores[i]!) : mask(brl0(m.renda)),
    }
  })
  if (futuro.value != null) {
    const mm = Number((r.value.marcados[0]?.data ?? agoraEmSP().iso).slice(5, 7))
    const mes = MES[mm - 1] ?? ''
    const h = (futuro.value / max) * 100
    linhas.push({
      mes, nomeLongo: MES_LONGO[mes] ?? mes, gasto: null, futuro: true, h, total: futuro.value, porClasse: porClasseMarcado.value,
      pagamentos: null, pedacos: pedacos(futuro.value, h, porClasseMarcado.value), txt: mask(brl0(futuro.value)),
    })
  }
  return linhas
})
// a lista do mês corrente fica fechada: à vista, só o próximo pagamento
const verMarcados = ref(false)
/* O foco no mês a cair (10/11/2026, o dono: ao tocar em "Quanto vai cair?" no
   topo, vir para cá "com a parte atual meio destacada e as outras meio
   escurecidas por alguns segundos"). O topo soma 1 em `carteira:renda:foco`;
   aqui a página rola até o mês a mês, a lista do que está marcado abre, e por
   uns segundos o mês a cair e os pagamentos dele ficam como estão enquanto os
   meses que passaram, a frase e o resto da seção escurecem.
   Depois (mesmo dia: "faça uma animação trazendo esse para o centro e
   colocando um texto"): o palco. Assim que a rolagem assenta, os meses que
   passaram somem, a barra do mês a cair desliza para o centro do gráfico e a
   frase entra em cima e embaixo dela ("Em novembro ainda caem" · o valor e a
   barra · "5 pagamentos, o próximo em 12/11"). De lado ficou apertado (o dono,
   vendo): em cima e embaixo, com respiro, e a lista do mês um pouco mais
   longe enquanto o palco está de pé. Uns segundos depois, tudo volta para o
   lugar. Com movimento reduzido não há palco, só o escurecimento. */
const pedidoDeFoco = useState('carteira:renda:foco', () => 0)
const emFoco = ref(false)
const noPalco = ref(false)
const mesesRef = ref<HTMLElement | null>(null)
const palcoRef = ref<HTMLElement | null>(null)
let fimDoFoco: ReturnType<typeof setTimeout> | undefined
let entradaDoPalco: ReturnType<typeof setTimeout> | undefined
function pararFoco() {
  if (fimDoFoco) clearTimeout(fimDoFoco)
  if (entradaDoPalco) clearTimeout(entradaDoPalco)
}
const ESCALA_DA_COLUNA = 1.14
const ESCALA_DO_VALOR = 1.6
/** a folga a mais entre o valor e o topo da barra, em px */
const RESPIRO_DO_VALOR = 8
/** quanto a coluna do mês a cair anda para parar no meio do gráfico */
function medirPalco(): boolean {
  const palco = palcoRef.value
  const mes = palco?.querySelector<HTMLElement>('.vrd__mes--futuro')
  if (!palco || !mes) return false
  const a = palco.getBoundingClientRect()
  const b = mes.getBoundingClientRect()
  palco.style.setProperty('--vrd-dx', `${Math.round(a.left + a.width / 2 - (b.left + b.width / 2))}px`)
  // o valor desce até perto do topo da barra (qualquer que seja a altura dela) e cresce; a frase
  // de cima para logo acima dele, já contando a escala da coluna (que cresce a partir da base)
  const valor = mes.querySelector<HTMLElement>('.vrd__mes-v')?.getBoundingClientRect()
  const trilho = mes.querySelector<HTMLElement>('.vrd__mes-b')?.getBoundingClientRect()
  const barra = mes.querySelector<HTMLElement>('.vrd__pilha')?.getBoundingClientRect()
  if (valor && trilho && barra) {
    const dy = Math.max(0, trilho.height - barra.height - RESPIRO_DO_VALOR)
    const topo = valor.bottom + dy - valor.height * ESCALA_DO_VALOR
    const noPalcoY = b.bottom - ESCALA_DA_COLUNA * (b.bottom - topo)
    palco.style.setProperty('--vrd-dy', `${Math.round(dy)}px`)
    palco.style.setProperty('--vrd-topo', `${Math.round(noPalcoY - a.top)}px`)
  }
  return true
}
watch(pedidoDeFoco, async () => {
  if (import.meta.server) return
  pararFoco()
  mesFixo.value = null
  mesHover.value = null
  verMarcados.value = true
  noPalco.value = false
  emFoco.value = true
  await nextTick()
  const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  mesesRef.value?.scrollIntoView({ behavior: calmo ? 'auto' : 'smooth', block: 'start' })
  // o palco entra depois de a rolagem assentar; a medida é da coluna no lugar dela (sem o transform)
  if (!calmo) entradaDoPalco = setTimeout(() => { noPalco.value = medirPalco() }, 550)
  fimDoFoco = setTimeout(() => { noPalco.value = false; emFoco.value = false }, calmo ? 3600 : 5200)
})
onBeforeUnmount(pararFoco)
/** a frase do palco, em duas metades, uma de cada lado da barra */
const palcoTxt = computed(() => {
  const n = r.value.marcados.length
  const p = proximo.value
  return {
    antes: `Em ${mesMarcado.value}`, verbo: n === 1 ? 'ainda cai' : 'ainda caem',
    quantos: n === 1 ? '1 pagamento' : `${n} pagamentos`, proximo: p ? `, o próximo em ${fmtDia(p.data)}` : '',
  }
})
// 08/11, o dono pediu hover e clique: o hover mostra o mês com a divisão por tipo; o clique abre
// embaixo o que caiu nele, ativo por ativo (o mês a cair abre a lista do que está marcado)
const mesHover = ref<number | null>(null)
const mesFixo = ref<number | null>(null)
function clicarMes(i: number) {
  const m = meses.value[i]
  if (!m) return
  if (m.futuro) { mesFixo.value = null; verMarcados.value = !verMarcados.value; return }
  mesFixo.value = mesFixo.value === i ? null : i
}
const mesSel = computed(() => (mesFixo.value == null ? null : meses.value[mesFixo.value] ?? null))
const rotuloDoMes = (m: { nomeLongo: string; futuro: boolean; total: number; porClasse?: RendaPorClasse }) =>
  `${m.nomeLongo}${m.futuro ? ', a cair' : ''}: ${mask(brl0(m.total))}${m.porClasse ? `, ${mask(brl0(m.porClasse.fii))} de FIIs e ${mask(brl0(m.porClasse.acoes))} de ações` : ''}`
const proximo = computed(() => {
  const hoje = agoraEmSP().iso.slice(0, 10)
  return r.value.marcados.find((m) => m.data >= hoje) ?? r.value.marcados[0] ?? null
})
const ultimoReal = computed(() => r.value.meses[r.value.meses.length - 1]?.mes)

/* o mês corrente: o que já está marcado */
const fmtDia = (iso: string) => { const [, mm, dd] = iso.split('-'); return `${dd}/${mm}` }
const marcadosTotal = computed(() => r.value.marcados.reduce((s, m) => s + m.valor, 0))
// o mês dos pagamentos marcados (o backend manda os do mês corrente); sem nenhum, o mês de hoje
const mesMarcado = computed(() => nomeDoMes(r.value.marcados[0]?.data.slice(0, 7) ?? agoraEmSP().iso.slice(0, 7)))
// os meses da média do gasto ('agosto a outubro'): os últimos com gasto no mês a mês
const MES_LONGO: Record<string, string> = { jan: 'janeiro', fev: 'fevereiro', mar: 'março', abr: 'abril', mai: 'maio', jun: 'junho', jul: 'julho', ago: 'agosto', set: 'setembro', out: 'outubro', nov: 'novembro', dez: 'dezembro' }
const mesesDoGasto = computed(() => {
  const com = r.value.meses.filter((m) => m.gasto != null).slice(-3).map((m) => MES_LONGO[m.mes] ?? m.mes)
  if (!com.length) return null
  return com.length === 1 ? `de ${com[0]}` : `de ${com[0]} a ${com[com.length - 1]}`
})

/* daqui a 5 anos: os caminhos (sem eles, a coluna não monta) */
const temFuturo = computed(() => cob.value != null && r.value.caminhos.length > 0)
const escolhido = ref(r.value.caminhos[0]?.id ?? '')
const caminho = computed(() => r.value.caminhos.find((c) => c.id === escolhido.value) ?? r.value.caminhos[0]!)
const yMax = computed(() => Math.max(10, Math.ceil((Math.max(0, ...r.value.caminhos.flatMap((c) => c.p90)) * 1.08) / 10) * 10))
// o viewBox do gráfico é literal no template (0 0 600 240): mudou aqui, muda lá
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
  <section class="vrd" :class="{ 'vrd--foco': emFoco, 'vrd--palco': noPalco }" aria-labelledby="vrd-titulo" data-clarity-mask="true">
    <span class="vrd__eyebrow">Quanto ele me paga?</span>
    <h2 id="vrd-titulo" class="vrd__frase"><FraseDestaque :texto="frase" /></h2>
    <p v-if="cob != null" class="vrd__sub">
      Em {{ r.mesFechado }} caíram {{ mask(brl0(r.caiu)) }} na sua conta, e você gasta uns {{ mask(brl0(r.gastoMedio!)) }} por mês.
      Contando o que rendeu e ficou investido, seriam {{ pctTxt(comRendeu!) }}.
    </p>
    <p v-else-if="rendeuSemGasto != null" class="vrd__sub" :title="r.rendeuFonte">
      Mais uns {{ mask(brl0(rendeuSemGasto)) }} renderam na renda fixa, sem cair na conta.
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
      <p class="vrd__fonte">
        Gastos: a média {{ mesesDoGasto ?? 'dos últimos meses' }} no cartão e na conta, sem o pagamento da fatura, as transferências entre as suas contas e as aplicações.
        <template v-if="r.rendeu > 0">O que rendeu: {{ r.rendeuFonte.replace(/^Estimativa: /, 'estimativa com ') }}</template>
      </p>
    </div>
    <div v-else-if="!bancoDoGasto" class="vrd__convite">
      <p class="vrd__convite-t">Conecte o cartão e a conta do dia a dia, e eu digo quanto da sua vida os investimentos já pagam.</p>
      <NuxtLink to="/conta#open-finance" class="vrd__convite-b">Conectar</NuxtLink>
    </div>

    <div class="vrd__grade" :class="{ 'vrd__grade--lado': !temFuturo }">
      <!-- mês a mês e o mês corrente (sem os 5 anos, lado a lado) -->
      <div class="vrd__col">
        <!-- as duas partes em caixas próprias (08/11): o lado a lado era um grid que
             contava os filhos, e a legenda por tipo, um filho a mais, quebrou a grade -->
        <div ref="mesesRef" class="vrd__parte vrd__parte--meses">
        <h3 class="vrd__h3">{{ comGasto ? 'Quanto pagou, mês a mês' : 'Mês a mês' }}</h3>
        <ul v-if="empilhado" class="vrd__classes" aria-label="Por tipo">
          <li v-for="c in CLASSES" :key="c.id"><i class="vrd__k" :class="`vrd__k--${c.id}`" aria-hidden="true" />{{ c.nome }}</li>
        </ul>
        <div ref="palcoRef" class="vrd__palco">
        <ol class="vrd__meses" @pointerleave="mesHover = null">
          <li
            v-for="(m, i) in meses" :key="m.mes" class="vrd__mes"
            :class="{ 'vrd__mes--ultimo': !m.futuro && m.mes === ultimoReal, 'vrd__mes--futuro': m.futuro, 'vrd__mes--on': mesFixo === i || (m.futuro && verMarcados) }"
          >
            <button
              type="button" class="vrd__mes-btn" :aria-pressed="mesFixo === i || (m.futuro && verMarcados)" :aria-label="rotuloDoMes(m)"
              @pointerenter="mesHover = i" @focus="mesHover = i" @blur="mesHover = null" @click="clicarMes(i)"
            >
              <!-- com o gráfico estreito, o "R$ " e o "· a cair" saem (o @container do .vrd__meses) -->
              <span class="vrd__mes-v"><template v-if="m.txt.startsWith('R$ ')"><span class="vrd__mes-rs">R$ </span>{{ m.txt.slice(3) }}</template><template v-else>{{ m.txt }}</template></span>
              <span class="vrd__mes-b"><span class="vrd__pilha" :style="{ height: `${m.h}%` }"><i v-for="p in m.pedacos" :key="p.classe" :class="`vrd__p--${p.classe}`" :style="{ flexGrow: p.h }" /></span></span>
              <span class="vrd__mes-n">{{ m.mes }}<span v-if="m.futuro" class="vrd__mes-acair"> · a cair</span></span>
            </button>
            <!-- o hover: o mês e a divisão por tipo -->
            <span v-if="mesHover === i" class="vrd__dica-mes" :class="{ 'vrd__dica-mes--esq': i === 0, 'vrd__dica-mes--dir': i === meses.length - 1 }" role="tooltip">
              <b>{{ m.nomeLongo.charAt(0).toUpperCase() + m.nomeLongo.slice(1) }}{{ m.futuro ? ', a cair' : '' }}: {{ mask(brl0(m.total)) }}</b>
              <template v-if="m.porClasse">
                <span><i class="vrd__k vrd__k--fii" aria-hidden="true" />FIIs {{ mask(brl0(m.porClasse.fii)) }}</span>
                <span><i class="vrd__k vrd__k--acoes" aria-hidden="true" />Ações {{ mask(brl0(m.porClasse.acoes)) }}</span>
              </template>
              <span class="vrd__dica-mes-x">{{ m.futuro ? 'Clique para ver os pagamentos' : 'Clique para ver o que caiu' }}</span>
            </span>
          </li>
        </ol>
        <!-- o palco do mês a cair: a frase, metade em cima e metade embaixo da barra no centro (só enfeite: a lista abaixo diz o mesmo) -->
        <p class="vrd__palco-t vrd__palco-t--cima" aria-hidden="true">{{ palcoTxt.antes }} <b>{{ palcoTxt.verbo }}</b></p>
        <p class="vrd__palco-t vrd__palco-t--baixo" aria-hidden="true"><b>{{ palcoTxt.quantos }}</b>{{ palcoTxt.proximo }}</p>
        </div>
        </div>

        <div class="vrd__parte vrd__parte--marcados">
        <!-- o clique num mês que passou: o que caiu nele, ativo por ativo -->
        <template v-if="mesSel && !mesSel.futuro">
          <h3 class="vrd__h3 vrd__h3--2">Em {{ mesSel.nomeLongo }}, {{ mask(brl0(mesSel.total)) }}</h3>
          <ul v-if="mesSel.pagamentos?.length" class="vrd__agenda">
            <li v-for="(p, i) in mesSel.pagamentos" :key="`${p.data}-${p.ticker}-${i}`">
              <span class="vrd__ag-d">{{ fmtDia(p.data) }}</span>
              <span class="vrd__ag-t"><i class="vrd__k vrd__k--inline" :class="`vrd__k--${p.classe}`" aria-hidden="true" />{{ p.ticker }}</span>
              <span class="vrd__ag-v">{{ mask(brl0(p.valor)) }}</span>
            </li>
          </ul>
          <p v-else-if="mesSel.porClasse" class="vrd__prox">FIIs {{ mask(brl0(mesSel.porClasse.fii)) }} · Ações {{ mask(brl0(mesSel.porClasse.acoes)) }}</p>
          <button type="button" class="vrd__ver vrd__ver--volta" @click="mesFixo = null">Voltar para {{ mesMarcado }}</button>
        </template>
        <template v-else>

        <h3 class="vrd__h3 vrd__h3--2">Em {{ mesMarcado }}, já marcados</h3>
        <p v-if="futuro != null && proximo && !verMarcados" class="vrd__prox">
          Próximo: <b>{{ fmtDia(proximo.data) }}</b>, {{ mask(brl0(proximo.valor)) }} de {{ proximo.tickers.join(' e ') }}.
          <button v-if="r.marcados.length > 1" type="button" class="vrd__ver" @click="verMarcados = true">Ver os {{ r.marcados.length }}</button>
        </p>
        <ul v-if="futuro == null || verMarcados" class="vrd__agenda">
          <li v-for="m in r.marcados" :key="m.data">
            <span class="vrd__ag-d">{{ fmtDia(m.data) }}</span>
            <span class="vrd__ag-t">{{ m.tickers.join(', ') }}</span>
            <span class="vrd__ag-v">{{ mask(brl0(m.valor)) }}</span>
          </li>
          <li v-if="futuro == null" class="vrd__ag-total"><span /><span>Total</span><span class="vrd__ag-v">{{ mask(brl0(marcadosTotal)) }}</span></li>
        </ul>
        </template>
        </div>
      </div>

      <!-- daqui a 5 anos -->
      <div v-if="temFuturo" class="vrd__col vrd__futuro">
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
          <!-- viewBox literal (W × H): o :viewBox vira prop do DOM e o Vue reclama, como no AtivoGrafico -->
          <svg viewBox="0 0 600 240" preserveAspectRatio="none" class="vrd__svg" aria-hidden="true">
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

    <p v-if="!regua && bancoDoGasto" class="vrd__espera">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
      Os gastos do {{ bancoDoGasto }} entram na próxima atualização. Aí eu mostro quanto da sua vida os investimentos já pagam.
    </p>
  </section>
</template>

<style scoped>
.vrd { background: var(--nu-cream); padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px); scroll-margin-top: calc(var(--nuh-h, 76px) + 56px); }
.vrd__eyebrow { color: var(--nu-gray-2); font-size: var(--nu-fs-eyebrow); font-weight: 600; }
.vrd__frase { margin: 12px 0 0; max-width: 860px; color: var(--nu-ink); font-size: var(--nu-fs-h2-sm); font-weight: 500; letter-spacing: -0.035em; line-height: 1.08; font-variant-numeric: tabular-nums; text-wrap: balance; }
.vrd__sub { margin: 14px 0 0; max-width: 760px; color: var(--nu-gray-2); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.45; font-variant-numeric: tabular-nums; }

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
.vrd__h3 { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 700; letter-spacing: -0.02em; }
.vrd__h3--2 { margin-top: clamp(28px, 3.4vw, 40px); }
.vrd__meses { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 12px; list-style: none; margin: 16px 0 0; padding: 0; height: 150px; container-type: inline-size; }
/* o rótulo de cada mês numa linha só: quebrado em duas, ele invadia o vizinho */
.vrd__mes-v, .vrd__mes-n { white-space: nowrap; }
@container (max-width: 480px) {
  .vrd__mes-rs, .vrd__mes-acair { display: none; }
}
.vrd__mes { position: relative; }
/* o foco no mês a cair: ele e os pagamentos dele ficam; o resto da seção escurece por uns segundos e volta */
.vrd__parte--meses { scroll-margin-top: calc(var(--nuh-h, 76px) + 76px); }
.vrd__eyebrow, .vrd__frase, .vrd__sub, .vrd__regua, .vrd__convite, .vrd__h3, .vrd__classes, .vrd__mes, .vrd__futuro, .vrd__espera { transition: opacity .5s ease; }
.vrd--foco :is(.vrd__eyebrow, .vrd__frase, .vrd__sub, .vrd__regua, .vrd__convite, .vrd__classes, .vrd__futuro, .vrd__espera),
.vrd--foco .vrd__parte--meses .vrd__h3,
.vrd--foco .vrd__mes:not(.vrd__mes--futuro) { opacity: .25; }
.vrd--foco .vrd__mes--futuro .vrd__pilha i { opacity: .8; }
.vrd--foco .vrd__mes--futuro .vrd__mes-n { color: var(--nu-ink); font-weight: 800; }
/* o palco: os outros meses somem, o mês a cair vai para o centro e a frase entra em cima e embaixo dele */
.vrd__palco { position: relative; transition: margin-bottom .7s cubic-bezier(.2, .8, .2, 1); }
/* a frase de baixo mora num respiro que só existe com o palco de pé: a lista do mês se afasta e depois volta */
.vrd--palco .vrd__palco { margin-bottom: 76px; }
.vrd__mes { transform-origin: 50% 100%; transition: opacity .5s ease, transform .9s cubic-bezier(.2, .8, .2, 1); }
.vrd--palco .vrd__mes:not(.vrd__mes--futuro) { opacity: 0; pointer-events: none; }
.vrd--palco .vrd__parte--meses :is(.vrd__h3, .vrd__classes) { opacity: 0; }
.vrd--palco .vrd__mes--futuro { z-index: 1; transform: translateX(var(--vrd-dx, 0px)) scale(1.14); }
.vrd__mes-v { display: block; transform-origin: 50% 100%; transition: transform .9s cubic-bezier(.2, .8, .2, 1); }
.vrd--palco .vrd__mes--futuro .vrd__mes-v { transform: translateY(var(--vrd-dy, 0px)) scale(1.6); }
/* no palco o valor é o herói: volta o "R$ " que o gráfico estreito esconde, e ele fica centrado mesmo mais largo que a coluna */
.vrd--palco .vrd__mes--futuro .vrd__mes-v { justify-self: center; width: max-content; }
.vrd--palco .vrd__mes--futuro .vrd__mes-rs { display: inline; }
.vrd--palco .vrd__mes--futuro .vrd__pilha i { opacity: 1; }
.vrd__palco-t {
  position: absolute; left: 50%; margin: 0; white-space: nowrap; text-align: center; pointer-events: none;
  color: var(--nu-gray-2); font-weight: 500; line-height: 1.2; font-variant-numeric: tabular-nums;
  opacity: 0; filter: blur(8px); transition: opacity .35s ease, filter .35s ease, transform .35s ease;
}
.vrd__palco-t b { color: var(--nu-ink); font-weight: 600; }
.vrd__palco-t--cima { top: calc(var(--vrd-topo, 0px) - 14px); font-size: var(--nu-fs-xl); letter-spacing: -0.02em; transform: translate(-50%, calc(-100% + 8px)); }
.vrd__palco-t--baixo { top: calc(100% + 20px); font-size: var(--nu-fs-md); transform: translate(-50%, -8px); }
.vrd--palco .vrd__palco-t { opacity: 1; filter: none; transition: opacity .55s ease .5s, filter .55s ease .5s, transform .7s cubic-bezier(.2, .8, .2, 1) .5s; }
.vrd--palco .vrd__palco-t--cima { transform: translate(-50%, -100%); }
.vrd--palco .vrd__palco-t--baixo { transform: translate(-50%, 0); transition-delay: .7s; }
@media (max-width: 640px) {
  .vrd__palco-t--cima { font-size: var(--nu-fs-lg); }
  .vrd__palco-t--baixo { font-size: var(--nu-fs-sm); }
}
.vrd__mes-btn { display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr) auto; gap: 6px; width: 100%; height: 100%; padding: 0; border: 0; border-radius: 10px; background: none; font: inherit; text-align: center; cursor: pointer; }
.vrd__mes-btn:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
.vrd__mes-btn:hover .vrd__pilha, .vrd__mes--on .vrd__pilha { opacity: 1; }
.vrd__mes--on .vrd__mes-n { color: var(--nu-ink); font-weight: 800; }
.vrd__dica-mes {
  position: absolute; bottom: calc(100% + 4px); left: 50%; transform: translateX(-50%); z-index: 6; display: grid; gap: 3px;
  padding: 9px 11px; border-radius: 10px; background: var(--nu-ink); color: var(--nu-white); font-size: var(--nu-fs-xs); font-weight: 500;
  white-space: nowrap; box-shadow: 0 8px 24px var(--nu-ink-14); pointer-events: none; font-variant-numeric: tabular-nums;
}
.vrd__dica-mes b { font-size: var(--nu-fs-sm); }
.vrd__dica-mes span { display: inline-flex; align-items: center; gap: 6px; }
.vrd__dica-mes .vrd__k { display: inline-block; width: 8px; height: 8px; border-radius: 2px; }
.vrd__dica-mes-x { margin-top: 2px; color: color-mix(in srgb, var(--nu-white) 60%, transparent); }
.vrd__dica-mes--esq { left: 0; transform: none; }
.vrd__dica-mes--dir { left: auto; right: 0; transform: none; }
.vrd__k--inline { display: inline-block; width: 8px; height: 8px; margin-right: 8px; border-radius: 2px; vertical-align: middle; }
.vrd__ver--volta { display: inline-block; margin: 10px 0 0; }
.vrd__mes-v { color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.vrd__mes-b { display: flex; align-items: flex-end; justify-content: center; }
/* a barra é uma pilha: um pedaço por classe (ou um só, sem o porClasse) */
.vrd__pilha { display: flex; flex-direction: column-reverse; gap: 2px; width: min(36px, 70%); border-radius: 4px 4px 0 0; overflow: hidden; opacity: .5; }
.vrd__pilha i { display: block; min-height: 2px; }
.vrd__p--todos { background: var(--nu-blue); }
.vrd__p--fii, .vrd__k--fii { background: var(--nu-alloc-fii); }
.vrd__p--acoes, .vrd__k--acoes { background: var(--nu-alloc-stock); }
.vrd__mes--ultimo .vrd__pilha { opacity: 1; }
.vrd__classes { display: flex; gap: 6px 16px; flex-wrap: wrap; list-style: none; margin: 8px 0 0; padding: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-xs); font-weight: 600; }
.vrd__classes li { display: inline-flex; align-items: center; gap: 6px; }
.vrd__classes .vrd__k { display: inline-block; width: 9px; height: 9px; border-radius: 3px; }
.vrd__prox { margin: 10px 0 0; color: var(--nu-ink-75); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; font-variant-numeric: tabular-nums; }
.vrd__prox b { color: var(--nu-ink); }
.vrd__ver { margin-left: 6px; padding: 0; border: 0; background: none; color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
.vrd__mes--ultimo .vrd__mes-v { color: var(--nu-ink); }
/* o mês corrente: o que já está marcado para cair, tracejado */
.vrd__mes--futuro .vrd__pilha { opacity: 1; }
.vrd__mes--futuro .vrd__pilha i { opacity: .45; background-image: repeating-linear-gradient(135deg, rgba(255, 255, 255, .55) 0 4px, transparent 4px 8px); }
.vrd__mes--futuro .vrd__mes-v { color: var(--nu-blue-text); }
.vrd__espera { display: flex; align-items: center; gap: 8px; margin: clamp(28px, 3.4vw, 40px) 0 0; max-width: 1100px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; }
.vrd__espera svg { flex: 0 0 auto; color: var(--nu-gray); }
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

/* sem os 5 anos: o mês a mês e o mês corrente lado a lado (a coluna da direita ficava vazia) */
.vrd__grade--lado { grid-template-columns: minmax(0, 1fr); max-width: 1100px; }
.vrd__grade--lado .vrd__col { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: clamp(32px, 5vw, 80px); align-items: start; }
.vrd__grade--lado .vrd__h3--2 { margin-top: 0; }
@media (max-width: 960px) {
  .vrd__grade { grid-template-columns: minmax(0, 1fr); }
  .vrd__grade--lado .vrd__col { display: block; }
  .vrd__grade--lado .vrd__h3--2 { margin-top: clamp(28px, 3.4vw, 40px); }
}
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
