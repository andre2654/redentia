<script setup lang="ts">
// A /carteira nova (06/11/2026; plano em docs/specs/carteira-motor-de-avisos.md).
// Quatro perguntas, nessa ordem, e mais nada solto:
//  1. Estou indo bem?             o topo "A frase" (CarteiraHeroi, 10/11): o %
//                                 do CDI numa frase, o gráfico da rentabilidade
//                                 e a fileira (quanto tenho, o que olhar, o que cai)
//  2. O que pede a minha atenção? os avisos do motor, pela fileira do topo
//  3. Onde está o meu dinheiro?   Ativos, No mundo, Na cadeia e Riscos, quatro
//                                 lentes num lugar só
//  4. Quanto ele me paga?         renda × gasto, novembro e os caminhos de 5 anos
// A linha da página (10/11, o dono escolheu "A frase" entre três topos): cada
// seção abre com a pergunta em cinza, responde numa frase com o número que
// importa em azul (FraseDestaque) e usa uma família de cor só.
// Depois, o imposto do mês e o relatório completo, fechado (07/11: a nota, os
// indicadores, o desempenho, as movimentações com o selo do imposto e o P&L).
// Saíram da página: Contas (o frescor do topo e /conta), Raio-X e o banner do
// MCP (já no painel do chat).
//
// DE ONDE VEM (07/11/2026): `visao` é a resposta de GET /me/carteira/visao
// (useCarteiraVisao, no CarteiraContent). O dia do topo vem do /portfolio, mas
// o patrimônio e o número de ativos são os da visão, a mesma soma das posições
// lá embaixo (a invariante); a rentabilidade vem do /me/carteira/relatorio.
// SÓ NO DEV, sem `visao`: o mock de app/dev/carteiraVisaoMock.ts e a pílula
// que troca o ?cenario= (normal, calmo,
// velho, semgasto ou a carteira real local, app/dev/*.local.json).
import type { CarteiraPayload, CarteiraAgoraVM } from '~/types/carteira'
import { CENARIOS as CENARIOS_MOCK, visaoMock, type CenarioVisao } from '~/dev/carteiraVisaoMock'
import type { CarteiraVisao as Visao } from '~/types/carteiraVisao'
import { brl2, marcaNaResposta } from '~/utils/carteiraVisao'
import { marcaNoTexto } from '~/utils/marcaNoTexto'
import VisaoOndeEsta from './VisaoOndeEsta.vue'
import CarteiraHeroi from './CarteiraHeroi.vue'
import VisaoRenda from './VisaoRenda.vue'
import CarteiraFuturo from '~/components/carteira/CarteiraFuturo.vue'
import VisaoImposto from './VisaoImposto.vue'
import VisaoRelatorio from './VisaoRelatorio.vue'

const props = defineProps<{ payload: CarteiraPayload; visao?: Visao | null }>()
const emit = defineEmits<{ (e: 'connected'): void }>()

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
// o mock passa pelo mesmo `marcaNaResposta` da resposta real (useCarteiraVisao): a carteira real local é texto do backend
const doMock = computed<Visao | null>(() => (import.meta.dev ? marcaNaResposta(cenario.value === 'real' && real ? real : visaoMock(cenario.value as CenarioVisao), marcaNoTexto) : null))
const visao = computed<Visao>(() => (props.visao ?? doMock.value)!)

/* ————— o topo ————— */
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
/** com fonte velha, quem parou: 'a conexão Nubank' (o aviso do topo diz o resto) */
const parada = computed(() => {
  const nome = visao.value.conexoes.find((c) => c.estado !== 'ok')?.instituicao
  return nome ? `a conexão ${nome}` : 'a conexão'
})

/* ————— o rail ————— */
// renda e imposto vêm null quando o bloco quebra no servidor: a seção some, e o rail junto
const railSections = computed<RailSection[]>(() => [
  { id: 'hoje', label: 'Hoje' },
  { id: 'onde', label: 'Onde está' },
  ...(visao.value.renda ? [{ id: 'renda', label: 'Quanto paga' }] : []),
  ...(mock.value ? [] : [{ id: 'futuro', label: '5 anos' }]),
  ...(visao.value.imposto ? [{ id: 'imposto', label: 'Imposto' }] : []),
  { id: 'relatorio', label: 'Relatório' },
])
useSectionRail(railSections, { pageLabel: 'Carteira' })
</script>

<template>
  <div class="cvi">
    <CarteiraHeroi
      id="hoje" :agora="agora" :avisos="visao.avisos" :conexoes="visao.conexoes" :ativos="visao.posicoes.length"
      :renda="visao.renda" :dados-de="visao.dadosDe" :mock="mock" @connected="emit('connected')"
    />
    <p v-if="visao.dadosDe" class="cvi__parcial" role="status">
      <span class="cvi__parcial-p" aria-hidden="true" />
      O que está abaixo é de {{ visao.dadosDe }}, a última vez que {{ parada }} atualizou. Os números de imposto e risco esperam a reconexão.
      <NuxtLink to="/conta#open-finance">Reconectar</NuxtLink>
    </p>
    <VisaoOndeEsta id="onde" :visao="visao" />
    <VisaoRenda v-if="visao.renda" id="renda" :visao="visao" />
    <!-- e daqui a 5 anos? os 2.000 caminhos do motor (GET /me/carteira/futuro; no mock não há motor) -->
    <ClientOnly><CarteiraFuturo v-if="!mock" id="futuro" /></ClientOnly>
    <!-- o imposto vem null quando o bloco quebra no servidor (e o cenário real antigo do dev vinha sem) -->
    <VisaoImposto v-if="visao.imposto" id="imposto" :imposto="visao.imposto" :dados-de="visao.dadosDe" :posicoes="visao.posicoes" />
    <VisaoRelatorio id="relatorio" :payload="payload" :historico="visao.imposto?.historico ?? []" :mock="mock" />

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
/* A linha "A frase" (10/11) na Aportou (11/11): a página usa uma família de
   cor só, e ela agora vem dos tokens (--nu-alloc-*: renda fixa carvão, ações
   cobalto, FIIs azul claro, cripto âmbar, caixa sálvia). Aqui fica só o que os
   tokens ainda não trazem: ETF e BDR na sálvia, a cor de apoio da marca (no
   token ainda são petróleo e rosa). O cobalto fica para o número de cada frase.
   As seções alternam página e faixa quente; branco é só cartão e campo. */
.cvi {
  --nu-class-etf: var(--nu-sage);
  /* a coluna da página: 1240 centrada, 32px de lado (20px no celular), a mesma da home logada.
     O % resolve na largura de quem usa (as seções vão de ponta a ponta) */
  --cvi-g: max(32px, calc(50% - 620px));
  --cvi-v: clamp(64px, 7vw, 100px);
  background: var(--nu-page);
}
@media (max-width: 640px) { .cvi { --cvi-g: 20px; } }
/* o cartão dos 5 anos e o imposto moram os dois na página: o respiro entre eles é o do imposto */
.cvi :deep(.cfu) { padding-bottom: 0; }
/* o esqueleto padrão (areia e creme) some sobre a página e a faixa: um tom acima, com o mesmo brilho */
.cvi :deep(.nusk:not(.nusk--navy)) { --esq: color-mix(in srgb, var(--nu-ink) 9%, var(--nu-page)); background-image: linear-gradient(100deg, var(--esq) 25%, var(--nu-white) 50%, var(--esq) 75%); }
.cvi__parcial {
  display: block; margin: 0 var(--cvi-g) clamp(28px, 3.4vw, 44px); padding: 14px 18px;
  border-radius: var(--nu-r-tile); background: var(--nu-amber-bg); color: var(--nu-amber-text); font-size: var(--nu-fs-sm); font-weight: 600; line-height: 1.5;
  animation: nu-fade .5s ease both;
}
.cvi__parcial a { margin-left: 6px; color: inherit; font-weight: 800; text-decoration: underline; text-underline-offset: 3px; white-space: nowrap; }
.cvi__parcial-p { display: inline-block; width: 8px; height: 8px; margin-right: 10px; border-radius: 50%; background: var(--nu-amber-fill); vertical-align: 1px; }
.cvi__dev {
  position: fixed; left: 16px; bottom: 16px; z-index: 50; display: flex; align-items: center; gap: 4px; padding: 4px;
  border-radius: var(--nu-r-pill); background: var(--nu-ink); box-shadow: var(--nu-shadow-escuro);
}
.cvi__dev-t { padding: 0 8px 0 10px; color: var(--nu-amber-soft); font-size: var(--nu-fs-xs); font-weight: 800; }
.cvi__dev-b { height: 28px; padding: 0 12px; border: 0; border-radius: var(--nu-r-pill); background: transparent; color: var(--nu-agora-sub); font: inherit; font-size: var(--nu-fs-xs); font-weight: 700; cursor: pointer; }
.cvi__dev-b:hover { color: var(--nu-white); }
.cvi__dev-b--on { background: var(--nu-white); color: var(--nu-ink); }
@media (max-width: 640px) { .cvi__dev { left: 8px; right: 8px; bottom: 8px; overflow-x: auto; } }
</style>
