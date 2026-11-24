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
import { CENARIOS as CENARIOS_MOCK, resultadoMock, visaoMock, type CenarioVisao } from '~/dev/carteiraVisaoMock'
import type { CarteiraVisao as Visao } from '~/types/carteiraVisao'
import { brl2, marcaNaResposta } from '~/utils/carteiraVisao'
import { marcaNoTexto } from '~/utils/marcaNoTexto'
import VisaoOndeEsta from './VisaoOndeEsta.vue'
import CarteiraAgora from '~/components/carteira/CarteiraAgora.vue'
import CarteiraMoldura from '~/components/carteira/CarteiraMoldura.vue'
import CarteiraTrilho from '~/components/carteira/CarteiraTrilho.vue'
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
// o futuro (os 2.000 caminhos do motor) é pedido uma vez e dividido entre o gráfico do topo e a seção dos 5 anos; no mock não há motor
if (!mock.value) proverCarteiraFuturo()

// o ganho e o dia de cada ativo (24/11): do /portfolio de verdade; no mock, o de exemplo
const resultado = computed(() => props.payload.resultado ?? (mock.value ? resultadoMock() : null))
// os números da fileira do topo: os do /portfolio; sem o "Retorno total" de lá (falta preço médio em algum ativo), o
// ganho dos ativos que têm preço médio, dito como parcial
const statsDoTopo = computed(() => {
  const st = props.payload.hero?.stats ?? []
  const r = resultado.value
  if (st.some((x) => x.label === 'Retorno total') || !r || r.ganho == null || r.ganhoPct == null) return st
  return [{ label: `Retorno (${r.comCusto} de ${r.linhas.length} ativos)`, value: `${reaisComSinal(r.ganho)} (${pctComSinal(r.ganhoPct)})`, tone: r.ganho >= 0 ? 'green' as const : 'red' as const }, ...st]
})
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

/* ————— o meio-termo (24/11): o trilho e a abertura do documento ————— */
const { visiveis } = useValoresVisiveis()
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const fonteDoTrilho = computed(() => {
  const c = visao.value.conexoes
  if (!c.length) return null
  const paradas = c.filter((x) => x.estado !== 'ok').length
  const nomes = c.length === 1 ? c[0]!.instituicao : `${c.length} contas`
  return paradas ? `${nomes}: ${paradas === 1 ? 'uma conexão parada' : `${paradas} conexões paradas`}` : `${nomes}, em dia`
})
/** "Você pôs R$ X e hoje tem R$ Y": só com preço médio em todos os ativos; senão o documento abre só com o título */
const abertura = computed(() => {
  const r = resultado.value
  if (!r || r.ganho == null || r.custo == null || r.ganhoPct == null || r.comCusto < r.linhas.length || r.custo <= 0) return null
  const hoje = r.custo + r.ganho
  const v = (n: number) => (visiveis.value ? `R$ ${nf0.format(Math.abs(n))}` : 'R$ ••••')
  return {
    frase: `Você pôs ${v(r.custo)} e hoje tem ${v(hoje)}: são ${v(r.ganho)} ${r.ganho >= 0 ? 'a mais' : 'a menos'}, ${r.ganho >= 0 ? 'uma alta' : 'uma queda'} de ${pctComSinal(Math.abs(r.ganhoPct)).replace('+', '')}.`,
    pos: r.ganho >= 0,
    // a barra: o que pôs e o que ganhou; na perda, o que sobrou e o que perdeu
    a: Math.max(0, Math.min(r.custo, hoje)), b: Math.abs(r.ganho),
    rotuloA: r.ganho >= 0 ? 'O que você pôs' : 'O que você tem', rotuloB: r.ganho >= 0 ? 'O que ganhou' : 'O que perdeu',
    valorA: v(Math.min(r.custo, hoje)), valorB: v(r.ganho),
  }
})
</script>

<template>
  <CarteiraMoldura class="cvi">
    <template #trilho>
      <CarteiraTrilho
        :patrimonio="agora.patrimonio" :alocacao="payload.allocation" :resultado="resultado"
        :dia-valor="agora.diaValor" :dia-pct="agora.diaPct" :dia-dir="agora.diaDir"
        :proventos="payload.proventos12mValor" :fonte="fonteDoTrilho"
      />
    </template>
    <!-- o documento (24/11, o meio-termo aprovado no canvas): o título, o resumo numa frase e a barra do que a pessoa pôs
         contra o que ganhou; depois o gráfico no cartão escuro e as seções, cada uma respondendo a uma pergunta -->
    <header class="cvi__abre">
      <h1 class="cvi__h1">Sua carteira</h1>
      <template v-if="abertura">
        <p class="cvi__resumo" data-clarity-mask="true">{{ abertura.frase }}</p>
        <div class="cvi__pos" role="img" :aria-label="`${abertura.rotuloA} e ${abertura.rotuloB.toLowerCase()}`">
          <span class="cvi__pos-a" :style="{ flexGrow: abertura.a }" /><span class="cvi__pos-b" :class="{ 'cvi__pos-b--perda': !abertura.pos }" :style="{ flexGrow: abertura.b }" />
        </div>
        <dl class="cvi__pos-leg" data-clarity-mask="true">
          <div><dt><i class="cvi__pos-a" aria-hidden="true" />{{ abertura.rotuloA }}</dt><dd>{{ abertura.valorA }}</dd></div>
          <div><dt><i class="cvi__pos-b" :class="{ 'cvi__pos-b--perda': !abertura.pos }" aria-hidden="true" />{{ abertura.rotuloB }}</dt><dd>{{ abertura.valorB }}</dd></div>
        </dl>
        <p class="cvi__nota">Conta pelo preço médio de cada ativo. Proventos e vendas passadas ficam fora.</p>
      </template>
    </header>
    <div class="cvi__cartao">
      <CarteiraAgora
        id="hoje" aberto cartao :agora="agora" :chart="payload.chart" :stats="statsDoTopo"
        :visao="{ avisos: visao.avisos, conexoes: visao.conexoes, ativos: visao.posicoes.length, dadosDe: visao.dadosDe, mock }"
        @connected="emit('connected')"
      />
    </div>
    <!-- o "Reconectar" mora uma linha acima, no pé do topo, junto da conexão parada (e no cartão de atenção):
         a mesma ação num lugar só (robustez 11/11; antes eram três "Reconectar" em 300px) -->
    <p v-if="visao.dadosDe" class="cvi__parcial" role="status">
      <span class="cvi__parcial-p" aria-hidden="true" />
      O que está abaixo é de {{ visao.dadosDe }}, a última vez que {{ parada }} atualizou. Os números de imposto e risco esperam a reconexão.
    </p>
    <VisaoOndeEsta id="onde" :visao="visao" :resultado="resultado" />
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
  </CarteiraMoldura>
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
  /* a coluna de leitura do documento: 900px centrada no conteúdo, a mesma do cartão do gráfico */
  --cvi-g: max(clamp(20px, 3.4vw, 56px), calc(50% - 450px));
  --cvi-v: clamp(44px, 5vw, 68px);
  /* a régua calma do meio-termo (24/11), pelos mesmos tokens que as seções já leem: a frase de cada seção deixa de ser
     manchete e vira título de documento; os cartões perdem a sombra e ganham fio; os cantos encolhem */
  --nu-fs-h2-sm: clamp(23px, 2.1vw, 27px);
  --nu-fs-h2: clamp(26px, 2.6vw, 32px);
  --nu-ls-display: -0.022em;
  --nu-r-card: 14px;
  --nu-r-card-lg: 16px;
  --nu-shadow-quente: 0 0 0 1px var(--nu-line-2);
  background: var(--nu-page);
}
@media (max-width: 640px) { .cvi { --cvi-g: 20px; } }
/* a abertura do documento: a coluna de leitura (820px) dentro do conteúdo */
.cvi__abre { max-width: 900px; margin: 0 auto; padding: clamp(32px, 4vw, 52px) var(--cvi-g) 0; box-sizing: content-box; }
.cvi__h1 { margin: 0; font-size: clamp(34px, 3.4vw, 42px); line-height: 1.1; font-weight: var(--nu-w-display); letter-spacing: -0.035em; }
.cvi__resumo { margin: 24px 0 0; color: var(--nu-gray); font-size: 17.5px; font-weight: 400; line-height: 1.75; }
.cvi__pos { display: flex; gap: 3px; height: 10px; margin-top: 36px; }
.cvi__pos span { flex: 0 0 0; min-width: 4px; }
.cvi__pos-a { background: var(--nu-blue-deep, var(--nu-ink)); border-radius: 5px 2px 2px 5px; }
.cvi__pos-b { background: var(--nu-blue-soft); border-radius: 2px 5px 5px 2px; }
.cvi__pos-b--perda { background: var(--nu-red); }
.cvi__pos-leg { margin: 14px 0 0; }
.cvi__pos-leg div { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 48px; }
.cvi__pos-leg dt { display: flex; align-items: center; gap: 12px; font-size: 16.5px; }
.cvi__pos-leg dt i { width: 10px; height: 10px; border-radius: 3px; }
.cvi__pos-leg dd { margin: 0; font-size: 16.5px; font-weight: var(--nu-w-display); font-variant-numeric: tabular-nums; }
.cvi__nota { margin: 6px 0 0; color: var(--nu-gray); font-size: 13.5px; }
.cvi__cartao { max-width: 900px; margin: clamp(36px, 4vw, 52px) auto clamp(8px, 2vw, 24px); padding: 0 var(--cvi-g); box-sizing: content-box; }
/* as seções, uma embaixo da outra na mesma página, separadas por um fio: sem faixa de cor alternada */
.cvi :deep(:is(.voe, .vrd, .cfu, .vim, .vrl, .can)) { background: transparent; }
.cvi :deep(:is(.voe, .vrd, .vim, .vrl)) { position: relative; }
.cvi :deep(:is(.voe, .vrd, .vim, .vrl))::before { content: ''; position: absolute; top: 0; left: var(--cvi-g); right: var(--cvi-g); height: 1px; background: var(--nu-line-2); }
/* a pergunta em cinza, a resposta em tinta: o mesmo par da saudação do Início */
.cvi :deep(.nu-eyebrow) { color: var(--nu-gray); font-size: 15px; font-weight: 400; letter-spacing: 0; text-transform: none; }
.cvi :deep([class$='__frase']) { line-height: 1.25; }
/* as barras de composição afinam: 10px, cantos de 5 */
.cvi :deep(.vla__barra) { height: 10px; gap: 3px; }
.cvi :deep(.vrd__trilho) { height: 12px; gap: 3px; }
.cvi :deep(.vim__trilho) { height: 10px; gap: 3px; }
.cvi :deep(.cfu__frase) { line-height: 1.2; }
/* o cartão dos 5 anos e o imposto moram os dois na página: o respiro entre eles é o do imposto */
.cvi :deep(.cfu) { padding-bottom: 0; }
/* o esqueleto padrão (areia e creme) some sobre a página e a faixa: um tom acima, com o mesmo brilho */
.cvi :deep(.nusk:not(.nusk--navy)) { --esq: color-mix(in srgb, var(--nu-ink) 9%, var(--nu-page)); background-image: linear-gradient(100deg, var(--esq) 25%, var(--nu-white) 50%, var(--esq) 75%); }
.cvi__parcial {
  display: block; margin: 0 var(--cvi-g) clamp(28px, 3.4vw, 44px); padding: 14px 18px;
  border-radius: var(--nu-r-tile); background: var(--nu-amber-bg); color: var(--nu-amber-text); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); line-height: 1.5;
  animation: nu-fade var(--nu-dur-entrada) var(--nu-ease-saida) backwards;
}

.cvi__parcial-p { display: inline-block; width: 8px; height: 8px; margin-right: 10px; border-radius: 50%; background: var(--nu-amber-fill); vertical-align: 1px; }
.cvi__dev {
  position: fixed; left: 16px; bottom: 16px; z-index: 50; display: flex; align-items: center; gap: 4px; padding: 4px;
  border-radius: var(--nu-r-pill); background: var(--nu-ink); box-shadow: var(--nu-shadow-escuro);
}
.cvi__dev-t { padding: 0 8px 0 10px; color: var(--nu-amber-soft); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-forte); }
.cvi__dev-b { height: 28px; padding: 0 12px; border: 0; border-radius: var(--nu-r-pill); background: transparent; color: var(--nu-agora-sub); font: inherit; font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); cursor: pointer; }
.cvi__dev-b:hover { color: var(--nu-white); }
.cvi__dev-b--on { background: var(--nu-white); color: var(--nu-ink); }
@media (max-width: 640px) { .cvi__dev { left: 8px; right: 8px; bottom: 8px; overflow-x: auto; } }
</style>
