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
//     CarteiraAchados    "o que a Redentia encontrou?" — a barra do "em resumo"
//                        do /asset, colada no topo (05/11)
//  2. CarteiraFuturo     "e daqui a 5 anos?" — o leque de 2.000 cenários (o
//                        único momento assinatura da tela, na banda navy)
//  3. CarteiraPosicoes   o total, a barra por classe e os grupos (papéis sob pedido)
//     CarteiraMundo      "onde está o meu dinheiro?" — país e região, num globo (05/11)
//     CarteiraCadeia     "as minhas empresas dependem umas das outras?" (05/11)
//  4. ProventosContas    o que está a caminho e as contas do Open Finance
//  5. CarteiraAnalise    desempenho, Raio-X, movimentações e P&L, sob pedido
// Sem Open Finance conectado a página VIRA o convite (CarteiraVazia). Seção
// sem dado real não renderiza. Nunca número inventado.
import type { CarteiraPayload, CarteiraAgoraVM } from '~/types/carteira'

const props = defineProps<{ payload: CarteiraPayload }>()
const emit = defineEmits<{ (e: 'connected'): void }>()

const conectada = computed(() => props.payload.hero.state === 'patrimonio' && !!props.payload.agora)
const agora = computed(() => props.payload.agora as CarteiraAgoraVM)
// a cadeia só existe para ação; a seção diz se achou alguma ligação (o rail espera)
const temAcoes = computed(() => !!props.payload.posicoesMundo?.some((p) => p.classe === 'STOCK'))
const temCadeia = ref(false)
// os achados da Redentia AI: com Raio-X ou com a análise escrita (sem nada, a linha calma)
const temAchados = computed(() => !!(props.payload.raiox || props.payload.analise))

// A faixa abaixo do header vira o rail desta página quando há carteira (no
// lugar do "Mercado agora": a carteira não precisa do mercado piscando em
// cima). Só entra seção que está no DOM; ids batem com o template.
const railSections = computed<RailSection[]>(() => {
  if (!conectada.value) return []
  const p = props.payload
  const s: RailSection[] = [{ id: 'hoje', label: 'Hoje' }]
  if (temAchados.value) s.push({ id: 'achados', label: 'Achados' })
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
// da análise completa (#raio-x, #pnl…) o CarteiraAnalise abre e rola.
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
  <div v-if="conectada">
    <CarteiraAgora id="hoje" :agora="agora" :chart="payload.chart" :stats="payload.hero.stats" @connected="emit('connected')" />
    <CarteiraAchados
      v-if="temAchados"
      id="achados"
      :raiox="payload.raiox"
      :analise="payload.analise ?? null"
      :posicoes="payload.posicoesMundo ?? []"
      :olhada-em="payload.olhadaEm ?? null"
    />
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
    <CarteiraProventosContas :income="payload.income" @connected="emit('connected')" />
    <CarteiraAnalise :payload="payload" />
  </div>
  <CarteiraVazia v-else @connected="emit('connected')" />
</template>
