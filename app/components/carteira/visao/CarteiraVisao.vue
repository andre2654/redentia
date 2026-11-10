<script setup lang="ts">
// A /carteira nova (06/11/2026; plano em docs/specs/carteira-motor-de-avisos.md).
// Quatro perguntas, nessa ordem, e mais nada solto:
//  1. Como está o meu dinheiro?   o topo da noite (CarteiraAgora), agora com
//                                 o frescor de cada conexão no pé
//  2. O que pede a minha atenção? os avisos do motor no botão do topo, e o
//                                 urgente na linha de estado
//  3. Do que ele é feito?         "Onde está o seu dinheiro": Ativos, No mundo,
//                                 Na cadeia e Riscos, quatro lentes num lugar só
//  4. Quanto ele te paga?         renda × gasto, novembro e os caminhos de 5 anos
// Depois, o imposto do mês e o relatório completo, fechado (07/11: a nota, os
// indicadores, o desempenho, as movimentações com o selo do imposto e o P&L).
// Saíram da página: Contas (o frescor do topo e /conta), Raio-X e o banner do
// MCP (já no painel do chat).
//
// DE ONDE VEM (07/11/2026): `visao` é a resposta de GET /me/carteira/visao
// (useCarteiraVisao, no CarteiraContent). O topo continua vindo do /portfolio
// (o dia, a curva e a fileira), mas o patrimônio e o número de ativos do topo
// são os da visão, a mesma soma das posições lá embaixo (a invariante).
// SÓ NO DEV, sem `visao`: o mock de app/dev/carteiraVisaoMock.ts, com a curva
// do topo na escala do mock e a pílula que troca o ?cenario= (normal, calmo,
// velho, semgasto ou a carteira real local, app/dev/*.local.json).
import type { CarteiraPayload, CarteiraAgoraVM, CarteiraHeroVM } from '~/types/carteira'
import type { HomeChartVM } from '~/types/home'
import { CENARIOS as CENARIOS_MOCK, visaoMock, type CenarioVisao } from '~/dev/carteiraVisaoMock'
import type { CarteiraVisao as Visao } from '~/types/carteiraVisao'
import { brl2 } from '~/utils/carteiraVisao'
import VisaoOndeEsta from './VisaoOndeEsta.vue'
import VisaoParaOlhar from './VisaoParaOlhar.vue'
import CarteiraHeroi from './CarteiraHeroi.vue'
import CarteiraAgora from '~/components/carteira/CarteiraAgora.vue'
import VisaoRenda from './VisaoRenda.vue'
import VisaoImposto from './VisaoImposto.vue'
import VisaoRelatorio from './VisaoRelatorio.vue'

const props = defineProps<{ payload: CarteiraPayload; visao?: Visao | null }>()
const emit = defineEmits<{ (e: 'connected'): void }>()

const DEV = import.meta.dev

/* ————— só no dev: o mock ————— */
const mock = computed(() => import.meta.dev && !props.visao)
const route = useRoute()
const router = useRouter()
// a carteira real do dono, calculada só lendo a produção (app/dev/*.local.json,
// fora do git): entra como mais um cenário quando o arquivo existe
const locais: Record<string, Visao> = import.meta.dev ? import.meta.glob<Visao>('~/dev/*.local.json', { eager: true, import: 'default' }) : {}
const real = Object.values(locais)[0] ?? null
type Cenario = CenarioVisao | 'real'
const CENARIOS: { id: Cenario; nome: string }[] = real ? [{ id: 'real', nome: 'Sua carteira (real)' }, ...CENARIOS_MOCK] : CENARIOS_MOCK
const cenario = computed<Cenario>(() => {
  const c = String(route.query.cenario ?? (real ? 'real' : 'normal')) as Cenario
  return CENARIOS.some((x) => x.id === c) ? c : 'normal'
})
function trocarCenario(c: Cenario) {
  void router.replace({ query: { ...route.query, cenario: c }, hash: route.hash })
}
// fora do dev o mock nem existe: a tela só é montada com a visão real (CarteiraContent)
const doMock = computed<Visao | null>(() => (import.meta.dev ? (cenario.value === 'real' && real ? real : visaoMock(cenario.value as CenarioVisao)) : null))
const visao = computed<Visao>(() => (props.visao ?? doMock.value)!)

/* ————— o topo ————— */
// no mock, a curva real do /portfolio vai para a escala do mock (a soma das
// posições bate com o patrimônio); com a visão real, a curva fica como veio
const fator = computed(() => {
  if (!mock.value) return 1
  const pts = props.payload.chart?.points
  const ult = pts?.[pts.length - 1]?.v
  return ult ? visao.value.patrimonio / ult : 1
})
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
// o R$ da fileira na escala do mock, no mesmo formato em que veio (com ou sem centavos)
const escalar = (t: string) => (Math.abs(fator.value - 1) < 1e-6 ? t : t.replace(/R\$\s?([\d.]+)(,\d+)?/g, (_, int: string, dec?: string) => {
  const v = Number(`${int.replace(/\./g, '')}.${(dec ?? ',0').slice(1)}`) * fator.value
  return `R$ ${(dec ? nf2 : nf0).format(v)}`
}))
const agora = computed<CarteiraAgoraVM>(() => {
  const a = props.payload.agora as CarteiraAgoraVM
  const pct = a.carteiraPct
  // o R$ do dia sai do % do dia sobre o patrimônio da visão: o mesmo número do topo
  const dia = pct != null ? (visao.value.patrimonio * pct) / (100 + pct) : null
  return {
    ...a,
    patrimonio: brl2(visao.value.patrimonio),
    ativos: `${visao.value.posicoes.length} ativos`,
    atualizado: null,
    diaValor: dia != null ? `${dia < 0 ? '−' : '+'}R$ ${nf2.format(Math.abs(dia))}` : a.diaValor,
  }
})
// a curva termina no patrimônio do topo (a soma das posições da visão), como o
// buildEquityChartVM ancora no total do /portfolio/today na tela antiga: sem
// isso, a mira no último dia e a variação do período liam o total do
// /portfolio (07/11/2026: R$ 639.552,04 contra os R$ 636.096,48 da visão, que
// marca o Tesouro pelo preço do Tesouro Direto)
const chart = computed<HomeChartVM | null>(() => {
  const c = props.payload.chart
  if (!c) return null
  const f = fator.value
  const points = f === 1 ? [...c.points] : c.points.map((p) => ({ ...p, v: p.v * f }))
  const ult = points[points.length - 1]
  if (ult) points[points.length - 1] = { ...ult, v: visao.value.patrimonio }
  return { ...c, points, currentLabel: brl2(visao.value.patrimonio) }
})
const stats = computed<CarteiraHeroVM['stats']>(() => props.payload.hero.stats.map((s) => ({ ...s, value: escalar(s.value) })))
const topo = computed(() => ({ avisos: visao.value.avisos, conexoes: visao.value.conexoes, ativos: visao.value.posicoes.length, dadosDe: visao.value.dadosDe, mock: mock.value }))
/** com fonte velha, quem parou: 'a conexão Nubank' (o aviso do topo diz o resto) */
const parada = computed(() => {
  const nome = visao.value.conexoes.find((c) => c.estado !== 'ok')?.instituicao
  return nome ? `a conexão ${nome}` : 'a conexão'
})

/* ————— os cartões "Para olhar" abrem o aviso no modal do topo ————— */
const agoraRef = ref<InstanceType<typeof CarteiraAgora> | InstanceType<typeof CarteiraHeroi> | null>(null)

/* ————— só no dev: as três variações do topo repensado (10/11), ?heroi=1|2|3 —————
   O dono escolhe olhando; a escolhida fica e as outras saem. Sem o parâmetro, o topo de hoje. */
const HEROIS = [{ id: 0, nome: 'Atual' }, { id: 1, nome: '1 · A conta' }, { id: 2, nome: '2 · A frase' }, { id: 3, nome: '3 · A noite' }] as const
const heroi = computed<0 | 1 | 2 | 3>(() => {
  const n = import.meta.dev ? Number(route.query.heroi) : 0
  return n === 1 || n === 2 || n === 3 ? n : 0
})
function trocarHeroi(n: number) {
  const { heroi: _, ...resto } = route.query
  void router.replace({ query: n ? { ...resto, heroi: String(n) } : resto, hash: route.hash })
}

/* ————— o rail ————— */
// renda e imposto vêm null quando o bloco quebra no servidor: a seção some, e o rail junto
const railSections = computed<RailSection[]>(() => [
  { id: 'hoje', label: 'Hoje' },
  ...(visao.value.avisos.itens.length && !heroi.value ? [{ id: 'olhar', label: 'Para olhar' }] : []),
  { id: 'onde', label: 'Onde está' },
  ...(visao.value.renda ? [{ id: 'renda', label: 'Quanto paga' }] : []),
  ...(visao.value.imposto ? [{ id: 'imposto', label: 'Imposto' }] : []),
  { id: 'relatorio', label: 'Relatório' },
])
useSectionRail(railSections, { pageLabel: 'Carteira' })
</script>

<template>
  <div>
    <CarteiraHeroi
      v-if="heroi" id="hoje" ref="agoraRef" :variante="heroi" :agora="agora" :avisos="visao.avisos" :conexoes="visao.conexoes"
      :ativos="visao.posicoes.length" :renda="visao.renda" :dados-de="visao.dadosDe" :mock="mock" @connected="emit('connected')"
    />
    <CarteiraAgora v-else id="hoje" ref="agoraRef" :agora="agora" :chart="chart" :stats="stats" :visao="topo" @connected="emit('connected')" />
    <p v-if="visao.dadosDe" class="cvi__parcial" role="status">
      <span class="cvi__parcial-p" aria-hidden="true" />
      O que está abaixo é de {{ visao.dadosDe }}, a última vez que {{ parada }} atualizou. Os números de imposto e risco esperam a reconexão.
      <NuxtLink to="/conta#open-finance">Reconectar</NuxtLink>
    </p>
    <!-- com o topo repensado, "tem algo para eu olhar?" já mora no topo -->
    <VisaoParaOlhar v-if="!heroi" id="olhar" :avisos="visao.avisos" @abrir="agoraRef?.abrirAviso($event)" />
    <VisaoOndeEsta id="onde" :visao="visao" />
    <VisaoRenda v-if="visao.renda" id="renda" :visao="visao" />
    <!-- o imposto vem null quando o bloco quebra no servidor (e o cenário real antigo do dev vinha sem) -->
    <VisaoImposto v-if="visao.imposto" id="imposto" :imposto="visao.imposto" :dados-de="visao.dadosDe" :posicoes="visao.posicoes" />
    <VisaoRelatorio id="relatorio" :payload="payload" :historico="visao.imposto?.historico ?? []" :mock="mock" />

    <!-- só no dev: qual topo a tela está mostrando -->
    <div v-if="DEV" class="cvi__dev cvi__dev--heroi" role="group" aria-label="Variação do topo">
      <span class="cvi__dev-t">Topo</span>
      <button
        v-for="h in HEROIS" :key="h.id" type="button" class="cvi__dev-b" :class="{ 'cvi__dev-b--on': heroi === h.id }"
        :aria-pressed="heroi === h.id" @click="trocarHeroi(h.id)"
      >{{ h.nome }}</button>
    </div>

    <!-- só no dev: o caso que a tela está mostrando -->
    <div v-if="mock" class="cvi__dev" role="group" aria-label="Cenário do mock">
      <span class="cvi__dev-t">Mock</span>
      <button
        v-for="c in CENARIOS" :key="c.id" type="button" class="cvi__dev-b" :class="{ 'cvi__dev-b--on': cenario === c.id }"
        :aria-pressed="cenario === c.id" @click="trocarCenario(c.id)"
      >{{ c.nome }}</button>
    </div>
  </div>
</template>

<style scoped>
.cvi__parcial {
  display: flex; align-items: center; flex-wrap: wrap; gap: 6px 10px; margin: 0; padding: 14px clamp(22px, 5.5vw, 80px);
  background: var(--nu-amber-bg); color: var(--nu-amber-text); font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.5;
}
.cvi__parcial a { color: inherit; font-weight: 800; }
.cvi__parcial-p { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-amber-fill); }
.cvi__dev {
  position: fixed; left: 16px; bottom: 16px; z-index: 50; display: flex; align-items: center; gap: 4px; padding: 4px;
  border-radius: var(--nu-r-pill); background: var(--nu-navy); box-shadow: 0 10px 30px -10px rgba(0, 0, 0, .5);
}
.cvi__dev--heroi { left: auto; right: 16px; bottom: 84px; }
.cvi__dev-t { padding: 0 8px 0 10px; color: var(--nu-amber-soft); font-size: var(--nu-fs-xs); font-weight: 800; }
.cvi__dev-b { height: 28px; padding: 0 12px; border: 0; border-radius: var(--nu-r-pill); background: transparent; color: var(--nu-agora-sub); font: inherit; font-size: var(--nu-fs-xs); font-weight: 700; cursor: pointer; }
.cvi__dev-b:hover { color: var(--nu-white); }
.cvi__dev-b--on { background: var(--nu-white); color: var(--nu-navy); }
@media (max-width: 640px) {
  .cvi__dev { left: 8px; right: 8px; bottom: 8px; overflow-x: auto; }
  .cvi__dev--heroi { left: 8px; right: 8px; bottom: 76px; }
}
</style>
