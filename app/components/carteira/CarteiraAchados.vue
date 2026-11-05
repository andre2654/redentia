<script setup lang="ts">
// "A Redentia encontrou" (05/11/2026): o que a Redentia AI achou na carteira,
// colado embaixo do topo escuro. O dono recusou duas rodadas de cartões com
// selo, linha do tempo e faixa de chips ("tente entender mais o design que
// estamos seguindo por aqui"); esta é a barra "PETR4 em resumo" do /asset, a
// mesma peça (AtivoResumo): de ponta a ponta, o título com a contagem, a
// assinatura "Redentia AI" à esquerda e a idade da análise ao lado. Ao abrir,
// os achados surgem palavra por palavra, numa lista simples de texto (um grupo
// por tipo), e embaixo as perguntas prontas no chip do /asset: "Perguntar à
// Redentia" (o painel do chat com os achados anexados) e, com a análise
// desatualizada, "Pedir uma análise nova", que só PREENCHE o pedido no chat
// (useChatPainel().preencher); o envio fica com a pessoa. Quando a resposta
// termina (o streaming do useNuChat volta a false) ou o painel fecha, a seção
// relê o GET /portfolio/analysis.
//
// A conta toda é de utils/achadosDaCarteira.ts (gravidade, ISIN → nome, dedupe,
// idade, CVM: nada de compre/venda), e o miolo sai escapado de achadosHtml. O
// dado vem no SSR, no mesmo payload do topo; o texto inteiro está no HTML.
import type { CarteiraAnaliseIA, CarteiraPosicaoMundo, CarteiraRaioXVM } from '~/types/carteira'
import { achadosHtml, montarAchados, oQueOlhou, PEDIDO_DE_ANALISE_NOVA, resumoDosAchados, tituloDosAchados } from '~/utils/achadosDaCarteira'

const props = defineProps<{
  raiox: CarteiraRaioXVM | null
  analise: CarteiraAnaliseIA | null
  posicoes: CarteiraPosicaoMundo[]
  olhadaEm: string | null
}>()

/* ————— a análise: a do payload, ou a relida depois de pedir uma nova ————— */
const relida = ref<CarteiraAnaliseIA | null | undefined>(undefined)
const analise = computed(() => (relida.value !== undefined ? relida.value : props.analise))

// a sincronização mais recente do Open Finance (o topo já buscou as contas)
const { connections, ensure: carregarContas } = useContasConectadas()
onMounted(carregarContas)
const ultimoSync = computed(() => {
  const t = connections.value.map((c) => c.last_synced_at).filter((x): x is string => !!x).sort()
  return t.length ? t[t.length - 1]! : null
})

const vm = computed(() => montarAchados({ raiox: props.raiox, analise: analise.value, posicoes: props.posicoes, olhadaEm: props.olhadaEm, ultimoSync: ultimoSync.value }))
const cabeca = computed(() => tituloDosAchados(vm.value))
/** a análise escrita desatualizada: a barra diz, e cada item dela já leva a data */
const avisoAntiga = computed(() => {
  const a = vm.value.analise
  if (!a?.desatualizada) return null
  if (a.antiga) return `Os números são de hoje. A análise escrita é de ${a.data}, há ${a.dias} dias, e o que vem dela leva a data.`
  return `Os números são de hoje. A análise escrita é de ${a.data}, de antes da última sincronização do Open Finance.`
})

/* ————— o valor em reais some com o olho fechado (o dos detalhes) ————— */
const { hidden } = useHiddenValues()
const semValor = (t: string) => (hidden.value ? t.replace(/R\$\s?[\d.,]+/g, 'R$ ••••') : t)
const html = computed(() => achadosHtml(vm.value, { aviso: avisoAntiga.value, mascarar: semValor }))

/* ————— pedir uma análise nova: o chat refaz; a seção relê quando ele termina ————— */
const painel = useChatPainel()
const { token } = useAuthState()
const { streaming } = useNuChat()
const pediu = ref(false)
const relendo = ref(false)
async function relerAnalise() {
  if (!token.value || relendo.value) return
  relendo.value = true
  try {
    const r = await carteiraFetchAnalysis('/api/backend', { Accept: 'application/json', Authorization: `Bearer ${token.value}` })
    const a = r?.analysis
    if (a) relida.value = { risks: a.risks, recommendations: a.recommendations, strengths: a.strengths, generated_at: a.generated_at }
  } catch { /* sem resposta: fica a análise de antes, com a data dela */ } finally {
    relendo.value = false
  }
}
watch(streaming, (agora, antes) => { if (pediu.value && antes && !agora) void relerAnalise() })
watch(() => painel.aberto.value, (aberto) => {
  if (!pediu.value || aberto) return
  pediu.value = false
  void relerAnalise()
})

/* ————— as ações: o chip de pergunta do /asset ————— */
const PERGUNTAR = 'Perguntar à Redentia'
const PEDIR = 'Pedir uma análise nova'
const RELENDO = 'Relendo a análise…'
const acoes = computed(() => [PERGUNTAR, ...(vm.value.analise?.desatualizada ? [relendo.value ? RELENDO : PEDIR] : [])])
const contexto = computed(() => ({
  id: 'carteira:achados',
  tipo: 'carteira',
  rotulo: 'O que a Redentia encontrou',
  texto: [
    vm.value.vazio
      ? `A Redentia olhou ${oQueOlhou(vm.value) ?? 'a carteira'} (${vm.value.olhouEm ?? 'hoje'}) e não encontrou nada que peça atenção.`
      : `A Redentia olhou ${oQueOlhou(vm.value) ?? 'a carteira'} (${vm.value.olhouEm ?? 'hoje'}) e encontrou ${resumoDosAchados(vm.value)}.`,
    avisoAntiga.value ?? '',
    ...vm.value.itens.map((a) => `${a.selo} (${a.quando}): ${a.titulo}${a.texto ? ` — ${semValor(a.texto)}` : ''}`),
  ].filter(Boolean).join('\n'),
}))
function agir(q: string) {
  if (q === RELENDO) return
  if (q === PEDIR) {
    pediu.value = true
    painel.preencher(PEDIDO_DE_ANALISE_NOVA)
    return
  }
  painel.abrir(undefined, [contexto.value])
}
</script>

<template>
  <section v-contexto-chat="contexto" class="cah" aria-label="O que a Redentia encontrou" data-clarity-mask="true">
    <AtivoResumo ticker="carteira" :titulo="cabeca.titulo" :html="html">
      <template #antes>
        <span class="cah__assinatura"><img src="/logo-azul.svg" alt="" width="14" height="14">Redentia AI</span>
      </template>
      <template v-if="cabeca.idade" #fim>
        <span class="cah__idade">{{ cabeca.idade }}</span>
      </template>
      <template #depois>
        <div class="cah__acoes">
          <AtivoPerguntaChips :perguntas="acoes" tom="claro" :rotulo="null" @perguntar="agir" />
        </div>
      </template>
    </AtivoResumo>
  </section>
</template>

<style scoped>
/* a faixa do /asset (an__sec--resumo): branca, colada no céu, de ponta a ponta,
   com o texto nas margens do conteúdo do topo (o --g do topo-noite.css) */
.cah { --g: clamp(16px, 4vw, 56px); background: var(--nu-white); padding: 0 0 clamp(40px, 5vw, 64px); scroll-margin-top: calc(var(--nuh-h, 76px) + 56px); }

/* a barra: a assinatura, o título, a idade e o chevron */
.cah :deep(.ars2__sum) { display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; gap: 6px 16px; }
.cah :deep(.ars2__h2) { text-wrap: pretty; }
.cah__assinatura {
  display: inline-flex; align-items: center; gap: 7px; height: 28px; padding: 0 12px 0 9px; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; letter-spacing: 0; white-space: nowrap;
  transition: background .2s ease;
}
.cah :deep(.ars2__sum:hover .cah__assinatura) { background: var(--nu-white); box-shadow: 0 0 0 1px var(--nu-cream-line); }
.cah__idade { color: var(--nu-amber-text); font-size: var(--nu-fs-sm); font-weight: 600; white-space: nowrap; }

/* aberta: a lista simples do resumo, um grupo por tipo */
.cah :deep(.cah__grupo) { margin: 20px 0 6px; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; }
.cah :deep(.cah__lista) { margin: 0; padding: 0; max-width: 92ch; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6; }
.cah :deep(.cah__item) { margin: 0 0 8px 18px; }
.cah :deep(.cah__item b) { white-space: normal; }
.cah :deep(.cah__item::marker) { color: var(--nu-gray); }
.cah :deep(.cah__item--alta::marker) { color: var(--nu-red-text); }
.cah :deep(.cah__item--media::marker) { color: var(--nu-amber-text); }
.cah :deep(.cah__item--ideia::marker) { color: var(--nu-blue-text); }
.cah :deep(.cah__item--forca::marker) { color: var(--nu-green-text); }
.cah :deep(.cah__quando) { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; }
.cah :deep(.ars2__nota) { margin-top: 14px; }
.cah__acoes { padding: 4px var(--ars2-m) 24px; }

@media (max-width: 640px) {
  /* no celular: a assinatura em cima, o título e a idade embaixo, o chevron à direita */
  .cah :deep(.ars2__sum) { grid-template-columns: minmax(0, 1fr) auto; }
  .cah__assinatura { grid-column: 1; grid-row: 1; justify-self: start; }
  .cah :deep(.ars2__h2) { grid-column: 1; grid-row: 2; }
  .cah__idade { grid-column: 1; grid-row: 3; white-space: normal; }
  .cah :deep(.ars2__chev) { grid-column: 2; grid-row: 1 / span 3; }
}
@media (prefers-reduced-motion: reduce) { .cah__assinatura { transition: none; } }
</style>
