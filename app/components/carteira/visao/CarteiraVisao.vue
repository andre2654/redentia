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
// Depois, a análise completa fechada (desempenho, movimentações, P&L). Saíram
// da página: Contas (o frescor do topo e /conta), Raio-X (vira fonte do
// motor) e o banner do MCP (já no painel do chat).
//
// SÓ NO DEV, POR ENQUANTO: o GET /me/carteira/visao não existe, então tudo o
// que é novo sai do mock (app/dev/carteiraVisaoMock.ts), com as posições do
// espelho Business do dono. O topo usa a curva real, na escala do mock, para a
// soma das posições bater com o patrimônio. ?cenario= troca o caso: normal,
// calmo, velho ou semgasto.
import type { CarteiraPayload, CarteiraAgoraVM, CarteiraHeroVM } from '~/types/carteira'
import type { HomeChartVM } from '~/types/home'
import { CENARIOS as CENARIOS_MOCK, visaoMock, type CenarioVisao } from '~/dev/carteiraVisaoMock'
import type { CarteiraVisao as Visao } from '~/types/carteiraVisao'
import { brl2 } from '~/utils/carteiraVisao'
import VisaoOndeEsta from './VisaoOndeEsta.vue'
import VisaoRenda from './VisaoRenda.vue'

const props = defineProps<{ payload: CarteiraPayload }>()
const emit = defineEmits<{ (e: 'connected'): void }>()

const route = useRoute()
const router = useRouter()
// a carteira real do dono, calculada só lendo a produção (app/dev/*.local.json,
// fora do git): entra como mais um cenário quando o arquivo existe
const locais = import.meta.glob<Visao>('~/dev/*.local.json', { eager: true, import: 'default' })
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
const visao = computed<Visao>(() => (cenario.value === 'real' && real ? real : visaoMock(cenario.value as CenarioVisao)))

/* ————— o topo na escala do mock ————— */
const fator = computed(() => {
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
  const dia = pct != null ? (visao.value.patrimonio * pct) / (100 + pct) : null
  return {
    ...a,
    patrimonio: brl2(visao.value.patrimonio),
    ativos: `${visao.value.posicoes.length} ativos`,
    atualizado: null,
    diaValor: dia != null ? `${dia < 0 ? '−' : '+'}R$ ${nf2.format(Math.abs(dia))}` : a.diaValor,
  }
})
const chart = computed<HomeChartVM | null>(() => {
  const c = props.payload.chart
  if (!c) return null
  return { ...c, points: c.points.map((p) => ({ ...p, v: p.v * fator.value })), currentLabel: brl2(visao.value.patrimonio) }
})
const stats = computed<CarteiraHeroVM['stats']>(() => props.payload.hero.stats.map((s) => ({ ...s, value: escalar(s.value) })))
const topo = computed(() => ({ avisos: visao.value.avisos, conexoes: visao.value.conexoes, ativos: visao.value.posicoes.length, dadosDe: visao.value.dadosDe }))

/* ————— o rail ————— */
const railSections = computed<RailSection[]>(() => [
  { id: 'hoje', label: 'Hoje' },
  { id: 'onde', label: 'Onde está' },
  { id: 'renda', label: 'Quanto paga' },
])
useSectionRail(railSections, { pageLabel: 'Carteira' })
</script>

<template>
  <div>
    <CarteiraAgora id="hoje" :agora="agora" :chart="chart" :stats="stats" :visao="topo" @connected="emit('connected')" />
    <p v-if="visao.dadosDe" class="cvi__parcial" role="status">
      <span class="cvi__parcial-p" aria-hidden="true" />
      O que está abaixo é de {{ visao.dadosDe }}, a última vez que o Nubank atualizou. Os números de imposto e risco esperam a reconexão.
      <NuxtLink to="/conta#open-finance">Reconectar</NuxtLink>
    </p>
    <VisaoOndeEsta id="onde" :visao="visao" />
    <VisaoRenda id="renda" :visao="visao" />
    <CarteiraAnalise :payload="payload" enxuta />

    <!-- só no dev: o caso que a tela está mostrando -->
    <div class="cvi__dev" role="group" aria-label="Cenário do mock">
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
.cvi__dev-t { padding: 0 8px 0 10px; color: var(--nu-amber-soft); font-size: var(--nu-fs-xs); font-weight: 800; }
.cvi__dev-b { height: 28px; padding: 0 12px; border: 0; border-radius: var(--nu-r-pill); background: transparent; color: var(--nu-agora-sub); font: inherit; font-size: var(--nu-fs-xs); font-weight: 700; cursor: pointer; }
.cvi__dev-b:hover { color: var(--nu-white); }
.cvi__dev-b--on { background: var(--nu-white); color: var(--nu-navy); }
@media (max-width: 640px) { .cvi__dev { left: 8px; right: 8px; bottom: 8px; overflow-x: auto; } }
</style>
