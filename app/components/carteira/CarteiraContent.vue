<script setup lang="ts">
// Miolo da carteira — usado APENAS pela página /carteira (a home `/` mostra só
// o resumo compacto). A página é um wrapper fino que cuida de auth, assinatura
// e SEO.
//
// REDESENHO DE 31/10/2026 (plano único + o conceito do Agora dos apps): a
// pessoa não precisa saber de tudo nem se preocupar. A ordem da tela responde
// uma pergunta por vez:
//  1. CarteiraAgora      "está tudo bem?" — o topo escuro do /asset ("a carteira
//                        no bolso", 05/11): a frase, o patrimônio, o losango e a curva
//     CarteiraIdeias     "o que a Redentia encontrou?" — o botão "Ideias" do
//                        topo, que abre o modal (05/11; a barra entre o topo e
//                        o "Daqui a 5 anos" saiu)
//  2. CarteiraFuturo     "e daqui a 5 anos?" — o leque de 2.000 cenários (o
//                        único momento assinatura da tela, na banda navy)
//  3. CarteiraPosicoes   o total, a barra por classe e os grupos (papéis sob pedido)
//     CarteiraMundo      "onde está o meu dinheiro?" — país e região, num globo (05/11)
//     CarteiraCadeia     "as minhas empresas dependem umas das outras?" (05/11)
//  4. ProventosContas    o que está a caminho e as contas do Open Finance
//  5. CarteiraAnalise    desempenho, movimentações e P&L, sob pedido
// Sem Open Finance conectado a página VIRA o convite (CarteiraVazia). Seção
// sem dado real não renderiza. Nunca número inventado.
import type { CarteiraPayload, CarteiraAgoraVM } from '~/types/carteira'

import CarteiraVisao from '~/components/carteira/visao/CarteiraVisao.vue'

const props = defineProps<{ payload: CarteiraPayload }>()
const emit = defineEmits<{ (e: 'connected'): void }>()

const conectada = computed(() => props.payload.hero.state === 'patrimonio' && !!props.payload.agora)

// A /carteira nova (06/11/2026; real desde 07/11): com a resposta de
// GET /me/carteira/visao, ela; com a flag do servidor desligada para a pessoa
// (404 visao_desligada) ou sem resposta, esta tela, que não depende dela. No
// dev, ?cenario= força o mock (normal, calmo, velho, semgasto ou real).
const route = useRoute()
const { visao, refresh: atualizarVisao } = await useCarteiraVisao({ immediate: conectada.value })
const mockDoDev = computed(() => import.meta.dev && !!route.query.cenario)
const visaoNova = computed(() => mockDoDev.value || !!visao.value)
function conectou() {
  void atualizarVisao()
  emit('connected')
}
const agora = computed(() => props.payload.agora as CarteiraAgoraVM)
// a cadeia só existe para ação; a seção diz se achou alguma ligação (o rail espera)
const temAcoes = computed(() => !!props.payload.posicoesMundo?.some((p) => p.classe === 'STOCK'))
const temCadeia = ref(false)
// os achados da Redentia AI, no modal do botão "Ideias" do topo: os pontos de
// atenção do score de hoje (sem nada a apontar, a linha calma); sem o score, o
// topo fica com o Perguntar
const achados = computed(() => {
  const p = props.payload
  if (!p.raiox) return null
  return { raiox: p.raiox, posicoes: p.posicoesMundo ?? [], olhadaEm: p.olhadaEm ?? null }
})

// A faixa abaixo do header vira o rail desta página quando há carteira (no
// lugar do "Mercado agora": a carteira não precisa do mercado piscando em
// cima). Só entra seção que está no DOM; ids batem com o template.
const railSections = computed<RailSection[]>(() => {
  if (!conectada.value || visaoNova.value) return []
  const p = props.payload
  const s: RailSection[] = [{ id: 'hoje', label: 'Hoje' }]
  s.push({ id: 'futuro', label: 'Daqui a 5 anos' })
  if (p.groups.length) s.push({ id: 'posicoes', label: 'Posições' })
  if (p.posicoesMundo?.length) s.push({ id: 'mundo', label: 'No mundo' })
  if (temAcoes.value && temCadeia.value) s.push({ id: 'cadeia', label: 'Na cadeia' })
  if (p.income && (p.income.agenda || p.income.month)) s.push({ id: 'renda-passiva', label: 'Proventos' })
  s.push({ id: 'contas', label: 'Contas' })
  return s
})
useSectionRail(railSections, { pageLabel: 'Carteira' })

// Âncoras vindas da home (#posicoes, #renda-passiva…): o scrollBehavior do
// Nuxt dispara antes do layout assentar. Correção pós-mount, como antes; as
// da análise completa (#pnl…) o CarteiraAnalise abre e rola.
onMounted(() => {
  const id = useRoute().hash.slice(1)
  if (!id || !railSections.value.some((s) => s.id === id)) return
  nextTick(() => scrollToRailSection(id))
  setTimeout(() => scrollToRailSection(id), 400)
})
</script>

<template>
  <!-- CLARITY (11/10/2026): toda seção com dado da pessoa leva
       data-clarity-mask="true"; o convite de conexão segue legível no funil. -->
  <CarteiraVisao v-if="conectada && visaoNova" :payload="payload" :visao="mockDoDev ? null : visao" @connected="conectou" />
  <div v-else-if="conectada">
    <CarteiraAgora id="hoje" :agora="agora" :chart="payload.chart" :stats="payload.hero.stats" :achados="achados" @connected="conectou" />
    <CarteiraFuturo id="futuro" />
    <CarteiraPosicoes
      v-if="payload.groups.length && payload.hero.patrimonio"
      id="posicoes"
      :patrimonio="payload.hero.patrimonio"
      :groups="payload.groups"
      :allocation="payload.allocation"
    />
    <CarteiraMundo v-if="payload.posicoesMundo?.length" id="mundo" :posicoes="payload.posicoesMundo" />
    <CarteiraCadeia v-if="temAcoes" id="cadeia" :posicoes="payload.posicoesMundo!" @ligacoes="temCadeia = $event" />
    <CarteiraProventosContas :income="payload.income" @connected="conectou" />
    <CarteiraAnalise :payload="payload" />
  </div>
  <CarteiraVazia v-else @connected="conectou" />
</template>
