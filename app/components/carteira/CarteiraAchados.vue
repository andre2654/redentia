<script setup lang="ts">
// "A Redentia encontrou" (05/11/2026): o que a Redentia AI achou na carteira,
// colado embaixo do topo escuro. O dono recusou duas rodadas de cartões com
// selo, linha do tempo e faixa de chips ("tente entender mais o design que
// estamos seguindo por aqui"); esta é a barra "PETR4 em resumo" do /asset, a
// mesma peça (AtivoResumo): de ponta a ponta, o título com a contagem (os
// números em destaque), a assinatura "Redentia AI" à esquerda e a idade da
// análise ao lado. Ao abrir, os achados surgem palavra por palavra.
// O acabamento (05/11/2026, o dono: "os achados ainda achei meio caído, mas já
// preferi essa linha"): cada achado é uma linha no idioma dos indicadores do
// /asset, o título e o número de hoje à direita (tabular), fio entre as
// linhas, fundo leve no hover e o "Perguntar à Redentia" da linha, que surge
// no hover ou no foco e abre o painel com a pergunta daquele achado. O que é
// de hoje fica em duas colunas no desktop ("Pede atenção" | ideias e "Vai
// bem"), uma no celular; a análise antiga vai para o fim, apagada, num grupo
// com a data. Embaixo, as perguntas prontas no chip do /asset: "Perguntar à
// Redentia" (o painel do chat com os achados anexados) e, com a análise
// desatualizada, "Pedir uma análise nova", que só PREENCHE o pedido no chat
// (useChatPainel().preencher); o envio fica com a pessoa. Quando a resposta
// termina (o streaming do useNuChat volta a false) ou o painel fecha, a seção
// relê o GET /portfolio/analysis.
//
// A conta toda é de utils/achadosDaCarteira.ts (gravidade, ISIN → nome, dedupe,
// idade, CVM: nada de compre/venda), e o miolo sai escapado de achadosHtml. O
// dado vem no SSR, no mesmo payload do topo; o texto inteiro está no HTML.
//
// Mais três tipos, só no dev (05/11/2026, o dono: "ainda não, tente pensar em
// mais 3 tipos"), por ?achados=1|2|3; sem o parâmetro, e em produção, a barra.
// Cada um nasce de uma peça já aprovada; a lógica é a mesma (montarAchados), e
// as palavras de cada um saem de utils/achadosNaTela.ts:
//  1. CarteiraAchadosLeitura  a leitura em prosa (AtivoProsa, veredito da HomeAgora)
//  2. CarteiraAchadosNumeros  o diagnóstico em números (AtivoIndicadores, faixa da HomeAgora)
//  3. CarteiraAchadosConversa a Redentia quer conversar (AtivoPerguntaChips, ChatPilula)
import type { CarteiraAnaliseIA, CarteiraPosicaoMundo, CarteiraRaioXVM } from '~/types/carteira'
import { achadosHtml, montarAchados, oQueOlhou, PEDIDO_DE_ANALISE_NOVA, resumoDosAchados, tituloDosAchados } from '~/utils/achadosDaCarteira'

const props = defineProps<{
  raiox: CarteiraRaioXVM | null
  analise: CarteiraAnaliseIA | null
  posicoes: CarteiraPosicaoMundo[]
  olhadaEm: string | null
}>()

/* ————— o tipo: 0 é a barra; 1, 2 e 3 só no dev ————— */
const route = useRoute()
const tipo = computed<0 | 1 | 2 | 3>(() => {
  if (!import.meta.dev) return 0
  const q = Number(route.query.achados)
  return q === 1 || q === 2 || q === 3 ? q : 0
})
const metricas = computed(() => props.raiox?.metrics ?? [])

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
/** o número em destaque não se separa da palavra dele ("2 pontos"): os dois num span sem quebra */
const tituloEmPartes = computed(() => {
  const out: { texto: string; numero?: 'atencao' | 'ideia'; cola?: string }[] = []
  let cola = false
  for (const p of cabeca.value.pedacos) {
    if (p.numero) { out.push({ ...p, cola: '' }); cola = true; continue }
    if (cola) {
      const m = p.texto.match(/^(\s*\S+)([\s\S]*)$/)
      out[out.length - 1]!.cola = m?.[1] ?? ''
      if (m?.[2]) out.push({ texto: m[2] })
      cola = false
      continue
    }
    out.push({ texto: p.texto })
  }
  return out
})
/** a análise escrita desatualizada: a barra diz, e cada item dela já leva a data */
const avisoAntiga = computed(() => {
  const a = vm.value.analise
  if (!a?.desatualizada) return null
  if (a.antiga) return vm.value.antigos
    ? `O que está em cima é de hoje. A análise escrita é de ${a.data}, há ${a.dias} dias, e o que vem dela fica no fim, separado.`
    : `Os números são de hoje. A análise escrita é de ${a.data}, há ${a.dias} dias.`
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
/* o "Perguntar à Redentia" de cada linha (um botão no miolo, ligado pelo data-achado) */
function aoClicarNoMiolo(e: MouseEvent) {
  const b = (e.target as HTMLElement | null)?.closest<HTMLElement>('.cah__perg')
  const a = b?.dataset.achado ? vm.value.itens.find((x) => x.id === b.dataset.achado) : undefined
  if (!a) return
  e.preventDefault()
  painel.abrir(semValor(a.pergunta), [contexto.value])
}
/* a pergunta de um dos tipos novos: abre o painel com ela e com os achados anexados */
function perguntarSobre(pergunta: string) {
  painel.abrir(semValor(pergunta), [contexto.value])
}
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
  <section v-contexto-chat="contexto" class="cah" :class="tipo ? `cah--t${tipo}` : null" aria-label="O que a Redentia encontrou" data-clarity-mask="true" @click="aoClicarNoMiolo">
    <CarteiraAchadosLeitura v-if="tipo === 1" :vm="vm" :metricas="metricas" :selo="cabeca.idade" :acoes="acoes" :mascarar="semValor" @perguntar="perguntarSobre" @agir="agir" />
    <CarteiraAchadosNumeros v-else-if="tipo === 2" :vm="vm" :metricas="metricas" :selo="cabeca.idade" :acoes="acoes" :mascarar="semValor" @perguntar="perguntarSobre" @agir="agir" />
    <CarteiraAchadosConversa v-else-if="tipo === 3" :vm="vm" :metricas="metricas" :selo="cabeca.idade" :acoes="acoes" :mascarar="semValor" :perguntar="PERGUNTAR" @perguntar="perguntarSobre" @agir="agir" />
    <AtivoResumo v-else ticker="carteira" :titulo="cabeca.titulo" :html="html">
      <template #antes>
        <span class="cah__assinatura"><img src="/logo-azul.svg" alt="" width="14" height="14">Redentia AI</span>
      </template>
      <template #titulo>
        <template v-for="(p, i) in tituloEmPartes" :key="i">
          <span v-if="p.numero" class="cah__cola"><span class="cah__n" :class="`cah__n--${p.numero}`">{{ p.texto }}</span>{{ p.cola }}</span>
          <template v-else>{{ p.texto }}</template>
        </template>
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

/* a contagem do título: os números em destaque, no tom do que contam */
.cah__n {
  display: inline-grid; place-items: center; min-width: 1.55em; height: 1.55em; padding: 0 .42em; margin: 0 .08em;
  border-radius: var(--nu-r-pill); font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1; vertical-align: .06em;
}
.cah__cola { white-space: nowrap; }
.cah__n--atencao { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.cah__n--ideia { background: var(--nu-blue-bg); color: var(--nu-blue-text); }

/* aberta: o que é de hoje em colunas (uma no celular, duas no desktop) */
.cah :deep(.cah__cols) { display: grid; grid-template-columns: minmax(0, 1fr); gap: 4px 56px; margin-top: 6px; }
.cah :deep(.cah__grupo) { display: flex; align-items: baseline; gap: 8px; margin: 18px 0 4px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700; }
.cah :deep(.cah__grupo-d) { font-weight: 500; }
.cah :deep(.cah__lista) { list-style: none; margin: 0; padding: 0; }

/* a linha: o idioma da tabela de indicadores do /asset (fio, hover leve, número tabular à direita) */
.cah :deep(.cah__item) {
  position: relative; margin: 0 0 -1px; padding: 14px 0 8px;
  border-top: 1px solid var(--nu-cream-line); border-bottom: 1px solid var(--nu-cream-line);
}
.cah :deep(.cah__item::before) {
  content: ''; position: absolute; inset: 0 -12px; z-index: -1; border-radius: 12px;
  background: var(--nu-ink-04); opacity: 0; transition: opacity .2s ease;
}
.cah :deep(.cah__item:hover::before), .cah :deep(.cah__item:focus-within::before) { opacity: 1; }
.cah :deep(.cah__linha) { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin: 0; }
.cah :deep(.cah__t) {
  display: inline-flex; align-items: baseline; gap: 10px; min-width: 0;
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; line-height: 1.4; white-space: normal;
}
/* o marcador: a cor da gravidade, sempre ao lado de um rótulo (o grupo, o "Vale olhar") */
.cah :deep(.cah__t::before) { content: ''; flex-shrink: 0; width: 8px; height: 8px; border-radius: 50%; background: var(--nu-gray); transform: translateY(-1px); }
.cah :deep(.cah__item--alta .cah__t::before) { background: var(--nu-red-text); }
.cah :deep(.cah__item--media .cah__t::before) { background: var(--nu-amber); }
.cah :deep(.cah__item--ideia .cah__t::before) { background: var(--nu-blue); }
.cah :deep(.cah__item--forca .cah__t::before) { background: var(--nu-green); }
.cah :deep(.cah__v) { flex-shrink: 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 600; font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; }
.cah :deep(.cah__x) { margin: 4px 0 0 18px; max-width: 72ch; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; font-variant-numeric: tabular-nums; }
/* o pé da linha: de quando é, à esquerda; o "Perguntar à Redentia", à direita */
.cah :deep(.cah__pe) { display: flex; align-items: center; justify-content: space-between; gap: 4px 16px; flex-wrap: wrap; min-height: 30px; margin: 2px 0 0 18px; }
.cah :deep(.cah__meta) { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; }

/* o "Perguntar à Redentia" da linha: o link da nota do /asset, que surge no hover e no foco */
.cah :deep(.cah__perg) {
  display: inline-flex; align-items: center; gap: 6px; margin-left: auto; padding: 4px 0; border: 0; background: none; cursor: pointer;
  color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap;
  opacity: 0; transform: translateX(-4px); transition: opacity .2s ease, transform .25s cubic-bezier(.22, 1, .36, 1), gap .2s ease, color .2s ease;
}
.cah :deep(.cah__perg::after) {
  content: ''; width: 13px; height: 13px; background: currentColor;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12h13M12 5l7 7-7 7'/%3E%3C/svg%3E") center / contain no-repeat;
}
.cah :deep(.cah__item:hover .cah__perg), .cah :deep(.cah__item:focus-within .cah__perg) { opacity: 1; transform: none; }
.cah :deep(.cah__perg:hover) { gap: 10px; color: var(--nu-blue-hover); }
.cah :deep(.cah__perg:focus-visible) { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 4px; }

/* a análise antiga: no fim, apagada (o texto em cinza, sem o negrito de tinta) */
.cah :deep(.cah__antiga) { margin-top: 22px; }
.cah :deep(.cah__antiga .cah__t) { color: var(--nu-gray-2); font-weight: 600; }
.cah :deep(.cah__antiga .cah__x) { color: var(--nu-gray); }
.cah :deep(.cah__antiga .cah__t::before) { opacity: .55; }
.cah :deep(.ars2__nota) { margin-top: 16px; }
@media (min-width: 900px) {
  .cah :deep(.cah__cols--2) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  /* a análise antiga nas mesmas duas colunas de cima */
  .cah :deep(.cah__antiga .cah__lista) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 56px; align-items: start; }
}
/* sem hover (toque) ou na tela estreita: o "Perguntar" fica à vista */
@media (hover: none), (max-width: 640px) {
  .cah :deep(.cah__perg) { opacity: 1; transform: none; }
}
/* no celular, o link de cada linha fica mais leve: são várias linhas seguidas */
@media (max-width: 640px) {
  .cah :deep(.cah__pe) { min-height: 26px; }
  .cah :deep(.cah__perg) { font-size: var(--nu-fs-dense); font-weight: 600; }
}
.cah__acoes { padding: 4px var(--ars2-m) 24px; }

@media (max-width: 640px) {
  /* no celular: a assinatura em cima, o título e a idade embaixo, o chevron à direita */
  .cah :deep(.ars2__sum) { grid-template-columns: minmax(0, 1fr) auto; }
  .cah__assinatura { grid-column: 1; grid-row: 1; justify-self: start; }
  .cah :deep(.ars2__h2) { grid-column: 1; grid-row: 2; }
  .cah__idade { grid-column: 1; grid-row: 3; white-space: normal; }
  .cah :deep(.ars2__chev) { grid-column: 2; grid-row: 1 / span 3; }
}
@media (prefers-reduced-motion: reduce) {
  .cah__assinatura, .cah :deep(.cah__perg), .cah :deep(.cah__item::before) { transition: none; }
}
</style>
