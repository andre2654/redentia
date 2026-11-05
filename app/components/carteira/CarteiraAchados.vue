<script setup lang="ts">
// "O que a Redentia encontrou" (05/11/2026; o dono: "precisamos encontrar algum
// lugar para apresentar isso, talvez logo abaixo do hero, passando a ideia de
// que foi o agente da Redentia que encontrou esses pontos"). Entra na
// /carteira logo depois do topo (CarteiraAgora).
//
// É um agente que trabalha para a pessoa: a seção diz que foi a Redentia que
// achou, quando olhou e o que olhou ("18 ativos em 4 dimensões"). O conteúdo
// junta os pontos de atenção do Raio-X (de hoje, recalculados a cada carga) e
// a análise escrita pela IA (riscos, ideias para avaliar e um ponto forte),
// que carrega a própria data. Passando de 30 dias, ou sendo anterior à última
// sincronização do Open Finance, a seção a diz desatualizada com todas as
// letras e oferece "Pedir uma análise nova". Não há endpoint que gere uma:
// quem refaz é o chat, quando a mensagem pede "reanalisar" (chat-service,
// llm/turn/auto-actions.ts). O botão só PREENCHE essa frase no painel do chat
// (useChatPainel().preencher); o envio fica com a pessoa. Quando a resposta
// termina (o streaming do useNuChat volta a false) ou o painel fecha, a seção
// relê o GET /portfolio/analysis. A conta toda é de utils/achadosDaCarteira.ts
// (CVM, ISIN do Tesouro, dedupe, idade).
//
// Sem nada a apontar: uma linha calma, nunca vazia nem inventada. Sem Raio-X
// e sem análise, o CarteiraContent nem monta a seção. O dado vem no SSR, no
// mesmo payload do topo (não há espera própria, então não há esqueleto); a
// animação só embeleza e, sem JS, tudo já está lá.
//
// Três variações no dev por ?achados=1|2|3 (o método do dono); em produção
// vale a 1:
//  1. o relatório do agente: o losango da Redentia AI, a frase e os achados em
//     cartões com o selo de gravidade;
//  2. o agente trabalhando: uma linha do tempo ("conferiu a diversificação…
//     encontrou…"), os passos surgindo um a um;
//  3. a faixa: compacta, colada no topo, com chips que abrem o detalhe.
import type { CarteiraAnaliseIA, CarteiraPosicaoMundo, CarteiraRaioXVM } from '~/types/carteira'
import { montarAchados, oQueOlhou, PEDIDO_DE_ANALISE_NOVA, resumoDosAchados, type Achado } from '~/utils/achadosDaCarteira'

const props = defineProps<{
  raiox: CarteiraRaioXVM | null
  analise: CarteiraAnaliseIA | null
  posicoes: CarteiraPosicaoMundo[]
  olhadaEm: string | null
}>()

const route = useRoute()
const variacao = computed<1 | 2 | 3>(() => {
  if (import.meta.dev) {
    const q = Number(route.query.achados)
    if (q === 2 || q === 3) return q
  }
  return 1
})

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
const resumo = computed(() => resumoDosAchados(vm.value))
const olhou = computed(() => oQueOlhou(vm.value))
/** a hora da olhada sem o "hoje": '08:01' (a frase de cada variação põe o dia) */
const meta = computed(() => [olhou.value, vm.value.olhouEm].filter(Boolean).join(' · '))
// a hora fica na linha de cima (a meta); aqui, só o dia
const calma = computed(() => {
  const dia = vm.value.olhouEm?.split(' às ')[0] ?? 'hoje'
  return `A Redentia olhou a sua carteira ${dia} e não encontrou nada que peça atenção.`
})
/** a análise escrita desatualizada: a seção diz, e cada item dela já leva a data */
const avisoAntiga = computed(() => {
  const a = vm.value.analise
  if (!a?.desatualizada) return null
  if (a.antiga) return `Os números são de hoje. A análise escrita é de ${a.data}, há ${a.dias} dias, e o que vem dela leva a data.`
  return `Os números são de hoje. A análise escrita é de ${a.data}, de antes da última sincronização do Open Finance.`
})
const seloAnalise = computed(() => (vm.value.analise?.desatualizada ? `análise de ${vm.value.analise.data} · desatualizada` : null))

/* ————— pedir uma análise nova: o chat refaz; a seção relê quando ele termina ————— */
const { token } = useAuthState()
const { streaming } = useNuChat()
const pediu = ref(false)
const relendo = ref(false)
function pedirNova() {
  pediu.value = true
  painel.preencher(PEDIDO_DE_ANALISE_NOVA)
}
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

const itens = computed(() => vm.value.itens)
// no vazio, o ponto forte sozinho não aparece: a linha calma basta
const comAchados = computed(() => !vm.value.vazio)

/* ————— o valor em reais some com o olho fechado ————— */
const { hidden } = useHiddenValues()
const semValor = (t: string | null) => (t && hidden.value ? t.replace(/R\$\s?[\d.,]+/g, 'R$ ••••') : t)

/* ————— perguntar à Redentia ————— */
const painel = useChatPainel()
watch(streaming, (agora, antes) => { if (pediu.value && antes && !agora) void relerAnalise() })
watch(() => painel.aberto.value, (aberto) => {
  if (!pediu.value || aberto) return
  pediu.value = false
  void relerAnalise()
})
const linkDe = (a: Achado) => `/busca?chat=1&q=${encodeURIComponent(a.pergunta)}`
function perguntar(a: Achado) { painel.abrir(a.pergunta) }
const contextoDe = (a: Achado) => ({
  id: `carteira:achado:${a.id}`,
  tipo: 'carteira',
  rotulo: rotuloCurto(a.titulo),
  texto: [`${a.selo}: ${a.titulo}`, semValor(a.texto) ?? '', a.valor ?? '', `De quando: ${a.quando}`].filter(Boolean).join('\n'),
})
const contexto = computed(() => ({
  id: 'carteira:achados',
  tipo: 'carteira',
  rotulo: 'O que a Redentia encontrou',
  texto: [
    comAchados.value ? `A Redentia olhou ${olhou.value ?? 'a carteira'} (${vm.value.olhouEm ?? 'hoje'}) e encontrou ${resumo.value}.` : calma.value,
    avisoAntiga.value ?? '',
    ...itens.value.map((a) => `${a.selo} (${a.quando}): ${a.titulo}${a.texto ? ` — ${semValor(a.texto)}` : ''}`),
  ].filter(Boolean).join('\n'),
}))

/* ————— o selo ————— */
function tomDe(a: Achado): string {
  if (a.tipo === 'ideia') return 'ideia'
  if (a.tipo === 'forca') return 'forca'
  return a.gravidade ?? 'media'
}
const quandoTxt = (a: Achado) => {
  if (a.quando === 'hoje') return 'Visto hoje'
  const t = a.quando.replace(/^análise/, 'Da análise')
  return a.origem === 'analise' && vm.value.analise?.desatualizada ? `${t} · desatualizada` : t
}

/* ————— variação 1: os cartões, 3 à vista (a pessoa não precisa saber de tudo) ————— */
const VISIVEIS = 3
const todos = ref(false)
const cartoes = computed(() => (todos.value ? itens.value : itens.value.slice(0, VISIVEIS)))
const escondidos = computed(() => Math.max(0, itens.value.length - VISIVEIS))

/* ————— variação 2: a linha do tempo ————— */
interface Passo { id: string; titulo: string; valor: string | null; estado: 'ok' | 'achou' | 'leu' | 'fim'; nota: string | null; itens: Achado[] }
const DIM_MINUSCULA: Record<string, string> = { 'Diversificação': 'a diversificação', Risco: 'o risco', Renda: 'a renda', Qualidade: 'a qualidade' }
const passos = computed<Passo[]>(() => {
  const v = vm.value
  const usados = new Set<string>()
  const out: Passo[] = []
  if (v.ativos) out.push({ id: 'abriu', titulo: `Abriu a carteira: ${v.ativos} ${v.ativos === 1 ? 'ativo' : 'ativos'}`, valor: null, estado: 'ok', nota: null, itens: [] })
  for (const p of v.passos) {
    // sob a dimensão, só o que a conta de HOJE achou; o texto antigo da IA vai
    // para o passo da análise (a métrica de hoje pode já dizer o contrário)
    const dela = v.itens.filter((a) => a.dimensao === p.dimensao && a.origem === 'raiox' && a.tipo !== 'forca')
    for (const a of dela) usados.add(a.id)
    out.push({
      id: `dim:${p.dimensao}`,
      titulo: `Conferiu ${DIM_MINUSCULA[p.dimensao] ?? p.dimensao.toLowerCase()}`,
      valor: p.valor,
      estado: dela.length ? 'achou' : 'ok',
      nota: dela.length ? (dela.length === 1 ? 'encontrou um ponto' : `encontrou ${dela.length} pontos`) : p.tag === 'Excelente' ? 'excelente' : 'controlado',
      itens: dela,
    })
  }
  const resto = v.itens.filter((a) => !usados.has(a.id))
  if (v.analise && resto.length) {
    out.push({
      id: 'leu',
      titulo: v.analise.dias === 0 ? 'Leu a análise escrita de hoje' : `Releu a análise escrita de ${v.analise.data}`,
      valor: null,
      estado: 'leu',
      nota: v.analise.antiga ? `há ${v.analise.dias} dias` : null,
      itens: resto,
    })
  } else if (resto.length) {
    out.push({ id: 'leu', titulo: 'Separou o que vai bem', valor: null, estado: 'leu', nota: null, itens: resto })
  }
  out.push({ id: 'fim', titulo: comAchados.value ? `Pronto: ${resumo.value}.` : 'Pronto: nada que peça atenção.', valor: null, estado: 'fim', nota: null, itens: [] })
  return out
})
/** a ordem de entrada de cada linha (passo e itens), para o surgir em cascata */
const ordemDe = computed(() => {
  const m = new Map<string, number>()
  let i = 0
  for (const p of passos.value) {
    m.set(p.id, i++)
    for (const a of p.itens) m.set(a.id, i++)
  }
  return m
})

/* ————— variação 3: a faixa, um chip aberto por vez ————— */
const aberto = ref<string | null>(null)
const abertoItem = computed(() => itens.value.find((a) => a.id === aberto.value) ?? null)
function alternar(a: Achado) { aberto.value = aberto.value === a.id ? null : a.id }

/* ————— a frase que surge ————— */
const frase = computed(() => {
  if (!comAchados.value) return calma.value
  if (variacao.value === 2) return 'A Redentia passou pela sua carteira.'
  return `Olhei a sua carteira e encontrei ${resumo.value}.`
})
const palavras = computed(() => frase.value.split(' ').filter(Boolean))
type Modo = 'parado' | 'esperando' | 'revelando'
const modo = ref<Modo>('parado')
const raiz = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null
onMounted(() => {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const el = raiz.value
  if (!el) return
  // fora da tela no mount: esconde agora (ninguém vê) e revela quando entrar
  const r = el.getBoundingClientRect()
  if (r.top > window.innerHeight || r.bottom < 0) modo.value = 'esperando'
  io = new IntersectionObserver(([e]) => {
    if (!e?.isIntersecting) return
    if (modo.value === 'esperando') modo.value = 'revelando'
    io?.disconnect()
  }, { threshold: 0.25 })
  io.observe(el)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <section
    ref="raiz"
    v-contexto-chat="contexto"
    class="cah"
    :class="[`cah--v${variacao}`, `cah--${modo}`, { 'cah--calma': !comAchados }]"
    aria-labelledby="cah-titulo"
    data-clarity-mask="true"
  >
    <!-- ————— 3. a faixa ————— -->
    <template v-if="variacao === 3">
      <div class="cah3">
        <div class="cah3__linha">
          <span class="cah__agente cah__agente--p" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" class="cah__losango" /><path d="M12 8.2 15.8 12 12 15.8 8.2 12Z" class="cah__losango-miolo" /></svg></span>
          <h2 id="cah-titulo" class="cah3__frase">
            <template v-if="comAchados">A Redentia olhou {{ olhou ?? 'a sua carteira' }} {{ vm.olhouEm ?? 'hoje' }} e achou <strong>{{ resumo }}</strong>.</template>
            <template v-else>{{ calma }}</template>
          </h2>
        </div>
        <ul v-if="comAchados" class="cah3__chips" aria-label="O que a Redentia achou">
          <li v-for="(a, i) in itens" :key="a.id" class="cah3__chip-li" :style="{ '--i': i }">
            <button
              type="button"
              class="cah3__chip"
              :class="[`cah3__chip--${tomDe(a)}`, { 'cah3__chip--aberto': aberto === a.id }]"
              :aria-expanded="aberto === a.id"
              :aria-controls="`cah3-detalhe`"
              @click="alternar(a)"
            >
              <span class="cah__ponto" :class="`cah__ponto--${tomDe(a)}`" aria-hidden="true" />
              <span class="cah3__chip-txt">{{ a.titulo }}</span>
              <span class="cah3__chip-quando">{{ a.quando === 'hoje' ? 'hoje' : a.quando.replace('análise de ', '') }}</span>
            </button>
          </li>
        </ul>
        <div id="cah3-detalhe" class="cah3__detalhe" :class="{ 'cah3__detalhe--aberto': !!abertoItem }" aria-live="polite">
          <div class="cah3__detalhe-in">
            <article v-if="abertoItem" :key="abertoItem.id" v-contexto-chat="contextoDe(abertoItem)" class="cah3__cartao">
              <div class="cah__cartao-topo">
                <span class="cah__selo" :class="`cah__selo--${tomDe(abertoItem)}`">{{ abertoItem.selo }}</span>
                <span v-if="abertoItem.valor" class="cah__valor">{{ abertoItem.valor }}</span>
              </div>
              <h3 class="cah__titulo">{{ abertoItem.titulo }}</h3>
              <p v-if="abertoItem.texto" class="cah__texto">{{ semValor(abertoItem.texto) }}</p>
              <div class="cah__pe">
                <span class="cah__quando">{{ quandoTxt(abertoItem) }}<template v-if="abertoItem.confirmadoEm"> · a análise de {{ abertoItem.confirmadoEm }} já apontava</template></span>
                <NuxtLink :to="linkDe(abertoItem)" class="cah__perguntar" @click.prevent="perguntar(abertoItem)">
                  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" fill="currentColor" /><path d="M12 8.2 15.8 12 12 15.8 8.2 12Z" class="cah__perguntar-miolo" /></svg>
                  Perguntar à Redentia
                </NuxtLink>
              </div>
            </article>
          </div>
        </div>
        <div v-if="avisoAntiga" class="cah__velha cah3__velha">
          <span class="cah__velha-selo">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            {{ seloAnalise }}
          </span>
          <button type="button" class="cah__pedir cah__pedir--leve" :disabled="relendo" @click="pedirNova">
            {{ relendo ? 'Relendo a análise…' : 'Pedir uma análise nova' }}
          </button>
        </div>
      </div>
    </template>

    <!-- ————— 1 e 2: a cabeça do agente ————— -->
    <template v-else>
      <div class="cah__cabeca">
        <div class="cah__assinatura">
          <span class="cah__agente" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" class="cah__losango" /><path d="M12 8.2 15.8 12 12 15.8 8.2 12Z" class="cah__losango-miolo" /></svg></span>
          <span class="cah__quem">
            <span class="cah__nome">Redentia AI</span>
            <span v-if="meta" class="cah__meta">{{ variacao === 2 ? vm.olhouEm : `olhou ${meta}` }}</span>
          </span>
        </div>
        <h2 id="cah-titulo" class="cah__frase" :aria-label="frase">
          <template v-for="(p, i) in palavras" :key="`${i}-${p}`"><span class="cah__palavra" :style="{ '--i': i }" aria-hidden="true">{{ p }}</span>{{ ' ' }}</template>
        </h2>
        <div v-if="avisoAntiga" class="cah__velha">
          <span class="cah__velha-selo">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            {{ seloAnalise }}
          </span>
          <p class="cah__aviso">{{ avisoAntiga }}</p>
          <button type="button" class="cah__pedir" :disabled="relendo" @click="pedirNova">
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" fill="currentColor" /><path d="M12 8.2 15.8 12 12 15.8 8.2 12Z" class="cah__pedir-miolo" /></svg>
            {{ relendo ? 'Relendo a análise…' : 'Pedir uma análise nova' }}
          </button>
        </div>
      </div>

      <!-- 1. o relatório: os cartões -->
      <template v-if="variacao === 1 && comAchados">
        <ul class="cah1__grade">
          <li v-for="(a, i) in cartoes" :key="a.id" v-contexto-chat="contextoDe(a)" class="cah1__cartao" :class="`cah1__cartao--${tomDe(a)}`" :style="{ '--i': i }">
            <div class="cah__cartao-topo">
              <span class="cah__selo" :class="`cah__selo--${tomDe(a)}`">{{ a.selo }}</span>
              <span v-if="a.valor" class="cah__valor">{{ a.valor }}</span>
            </div>
            <h3 class="cah__titulo">{{ a.titulo }}</h3>
            <p v-if="a.texto" class="cah__texto">{{ semValor(a.texto) }}</p>
            <div class="cah__pe">
              <span class="cah__quando">{{ quandoTxt(a) }}<template v-if="a.confirmadoEm"> · a análise de {{ a.confirmadoEm }} já apontava</template></span>
              <NuxtLink :to="linkDe(a)" class="cah__perguntar" @click.prevent="perguntar(a)">
                <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" fill="currentColor" /><path d="M12 8.2 15.8 12 12 15.8 8.2 12Z" class="cah__perguntar-miolo" /></svg>
                Perguntar à Redentia
              </NuxtLink>
            </div>
          </li>
        </ul>
        <button v-if="escondidos && !todos" type="button" class="cah1__mais" @click="todos = true">
          Ver {{ escondidos === 1 ? 'mais 1 achado' : `mais ${escondidos} achados` }}
        </button>
      </template>

      <!-- 2. o agente trabalhando: a linha do tempo -->
      <ol v-else-if="variacao === 2" class="cah2__tempo" :style="{ '--n': ordemDe.size }">
        <li v-for="p in passos" :key="p.id" class="cah2__passo" :class="`cah2__passo--${p.estado}`" :style="{ '--i': ordemDe.get(p.id) }">
          <span class="cah2__no" aria-hidden="true">
            <svg v-if="p.estado === 'ok' || p.estado === 'fim'" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17 19 7.5" /></svg>
            <svg v-else-if="p.estado === 'leu'" viewBox="0 0 24 24" width="12" height="12"><path d="M12 2.5 21.5 12 12 21.5 2.5 12Z" fill="currentColor" /></svg>
            <span v-else class="cah2__no-ponto" />
          </span>
          <div class="cah2__corpo">
            <p class="cah2__titulo">
              {{ p.titulo }}<span v-if="p.valor" class="cah2__valor"> · {{ p.valor }}</span>
              <span v-if="p.nota" class="cah2__nota" :class="`cah2__nota--${p.estado}`">{{ p.nota }}</span>
            </p>
            <ul v-if="p.itens.length" class="cah2__itens">
              <li v-for="a in p.itens" :key="a.id" v-contexto-chat="contextoDe(a)" class="cah2__item" :style="{ '--i': ordemDe.get(a.id) }">
                <span class="cah__ponto" :class="`cah__ponto--${tomDe(a)}`" aria-hidden="true" />
                <div class="cah2__item-corpo">
                  <p class="cah2__item-titulo"><span class="cah2__item-selo" :class="`cah2__item-selo--${tomDe(a)}`">{{ a.selo }}</span> {{ a.titulo }}</p>
                  <p v-if="a.texto" class="cah2__item-texto">{{ semValor(a.texto) }}</p>
                  <p class="cah2__item-pe">
                    <span class="cah__quando">{{ quandoTxt(a) }}<template v-if="a.confirmadoEm"> · a análise de {{ a.confirmadoEm }} já apontava</template></span>
                    <NuxtLink :to="linkDe(a)" class="cah2__perguntar" @click.prevent="perguntar(a)">Perguntar à Redentia</NuxtLink>
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </li>
      </ol>
    </template>
  </section>
</template>

<style scoped>
.cah {
  position: relative; overflow: hidden;
  background: var(--nu-white);
  padding: clamp(48px, 6.5vw, 88px) clamp(22px, 5.5vw, 80px);
  scroll-margin-top: calc(var(--nuh-h, 76px) + 56px);
}
/* a luz do agente: um céu de manhã atrás da cabeça, bem de leve */
.cah::before {
  content: ''; position: absolute; inset: -30% -10% auto auto; width: min(760px, 90vw); aspect-ratio: 1; pointer-events: none;
  background: radial-gradient(closest-side, var(--nu-chat-luz-1), transparent 70%), radial-gradient(closest-side at 70% 60%, var(--nu-chat-luz-2), transparent 72%);
  opacity: .16; filter: blur(30px);
}
.cah > * { position: relative; }

/* ——— a assinatura: o losango da marca num selo navy ——— */
.cah__cabeca { max-width: 900px; }
.cah__assinatura { display: flex; align-items: center; gap: 14px; }
.cah__agente {
  position: relative; flex: none; width: 48px; height: 48px; border-radius: 50%;
  display: inline-grid; place-items: center; background: var(--nu-navy);
  box-shadow: 0 14px 30px -12px rgba(12, 21, 36, 0.55);
}
.cah__agente svg { width: 24px; height: 24px; }
/* o halo acende três vezes quando a seção entra, e para */
.cah__agente::after {
  content: ''; position: absolute; inset: -6px; border-radius: 50%;
  border: 2px solid var(--nu-chat-luz-1); opacity: 0;
}
.cah--revelando .cah__agente::after { animation: cah-halo 1.8s ease-out 3 both; }
@keyframes cah-halo { 0% { opacity: .9; transform: scale(.85); } 100% { opacity: 0; transform: scale(1.35); } }
.cah__losango { fill: var(--nu-cream); }
.cah__losango-miolo { fill: var(--nu-navy); }
.cah__agente--p { width: 36px; height: 36px; box-shadow: 0 10px 22px -10px rgba(12, 21, 36, 0.5); }
.cah__agente--p svg { width: 18px; height: 18px; }
.cah__quem { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.cah__nome { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; }
.cah__meta { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; }

.cah__frase {
  margin: 22px 0 0; color: var(--nu-ink);
  font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.035em; line-height: 1.08;
  text-wrap: balance;
}
.cah__palavra { display: inline-block; }
.cah--esperando .cah__palavra { opacity: 0; }
.cah--revelando .cah__palavra {
  animation: cah-surge 520ms cubic-bezier(.22, 1, .36, 1) both;
  animation-delay: min(calc(var(--i) * 38ms), 900ms);
}
@keyframes cah-surge { from { opacity: 0; filter: blur(8px); transform: translateY(6px); } }
.cah--calma:not(.cah--v3) { padding-block: clamp(36px, 4.5vw, 56px); }
.cah--calma .cah__frase { font-size: var(--nu-fs-h3); letter-spacing: -0.025em; line-height: 1.2; color: var(--nu-ink-75); }

/* a análise escrita desatualizada: o selo, a frase honesta e o pedido */
.cah__velha { display: flex; align-items: center; gap: 10px 14px; flex-wrap: wrap; margin-top: 18px; max-width: 900px; }
.cah__velha-selo {
  display: inline-flex; align-items: center; gap: 7px; flex: none;
  background: var(--nu-amber-bg); color: var(--nu-amber-text);
  border-radius: var(--nu-r-pill); padding: 6px 12px; font-size: var(--nu-fs-xs); font-weight: 800;
}
.cah__aviso { margin: 0; flex: 1 1 320px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.cah__pedir {
  display: inline-flex; align-items: center; gap: 8px; flex: none; cursor: pointer; font-family: inherit;
  background: var(--nu-white); color: var(--nu-ink); border: none;
  border-radius: var(--nu-r-pill); padding: 10px 16px 10px 13px;
  box-shadow: 0 0 0 1.5px var(--nu-ink-16), 0 10px 24px -16px rgba(12, 21, 36, 0.5);
  font-size: var(--nu-fs-sm); font-weight: 800; transition: transform .15s, box-shadow .2s;
}
.cah__pedir:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 0 0 1.5px var(--nu-ink-30), 0 18px 36px -18px rgba(12, 21, 36, 0.55); }
.cah__pedir:disabled { cursor: progress; opacity: .7; }
.cah__pedir:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.cah__pedir-miolo { fill: var(--nu-white); }
.cah__pedir--leve { padding: 7px 14px; font-size: var(--nu-fs-xs); }

/* ——— as peças do cartão (1 e 3) ——— */
.cah__cartao-topo { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.cah__selo {
  display: inline-flex; align-items: center; border-radius: var(--nu-r-pill); padding: 5px 12px;
  font-size: var(--nu-fs-xs); font-weight: 800; letter-spacing: .02em;
}
.cah__selo--alta { background: var(--nu-red-bg); color: var(--nu-red-text); }
.cah__selo--media { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.cah__selo--baixa { background: var(--nu-cream-2); color: var(--nu-gray-2); }
.cah__selo--ideia { background: var(--nu-blue-bg); color: var(--nu-blue-text); }
.cah__selo--forca { background: var(--nu-green-bg); color: var(--nu-green-text); }
.cah__valor { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.cah__titulo { margin: 14px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.015em; line-height: 1.25; }
.cah__texto { margin: 8px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; font-variant-numeric: tabular-nums; }
.cah__pe { display: flex; align-items: center; justify-content: space-between; gap: 10px 14px; flex-wrap: wrap; margin-top: auto; padding-top: 18px; }
.cah__quando { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; }
.cah__perguntar {
  display: inline-flex; align-items: center; gap: 7px;
  background: var(--nu-navy); color: var(--nu-cream-text);
  border-radius: var(--nu-r-pill); padding: 9px 15px 9px 12px;
  font-size: var(--nu-fs-xs); font-weight: 800; transition: background .2s, transform .15s;
}
.cah__perguntar:hover { background: var(--nu-navy-2); color: var(--nu-cream-text); transform: translateY(-1px); }
.cah__perguntar:focus-visible, .cah1__mais:focus-visible, .cah3__chip:focus-visible, .cah2__perguntar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.cah__perguntar-miolo { fill: var(--nu-navy); }
.cah__perguntar:hover .cah__perguntar-miolo { fill: var(--nu-navy-2); }

.cah__ponto { flex: none; width: 10px; height: 10px; border-radius: 50%; background: var(--c, var(--nu-sand)); box-shadow: 0 0 0 4px color-mix(in srgb, var(--c, var(--nu-sand)) 18%, transparent); }
.cah__ponto--alta { --c: var(--nu-red-text); }
.cah__ponto--media { --c: var(--nu-amber-fill); }
.cah__ponto--baixa { --c: var(--nu-sand); }
.cah__ponto--ideia { --c: var(--nu-blue); }
.cah__ponto--forca { --c: var(--nu-green); }

/* ————— 1. o relatório ————— */
.cah1__grade {
  list-style: none; margin: clamp(28px, 4vw, 44px) 0 0; padding: 0;
  display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
}
.cah1__cartao {
  display: flex; flex-direction: column; min-width: 0;
  background: var(--nu-white); border-radius: var(--nu-r-card); padding: 20px 20px 18px;
  box-shadow: 0 0 0 1px var(--nu-navy-06), var(--nu-shadow-card);
  transition: transform .25s cubic-bezier(.22, 1, .36, 1), box-shadow .25s;
}
.cah1__cartao:hover { transform: translateY(-4px); box-shadow: 0 0 0 1px var(--nu-navy-06), 0 30px 60px -28px rgba(12, 21, 36, 0.42); }
/* a luz de cima do cartão, no tom do selo */
.cah1__cartao { background-image: linear-gradient(180deg, color-mix(in srgb, var(--c, transparent) 7%, transparent), transparent 90px); }
.cah1__cartao--alta { --c: var(--nu-red-text); }
.cah1__cartao--media { --c: var(--nu-amber-fill); }
.cah1__cartao--ideia { --c: var(--nu-blue); }
.cah1__cartao--forca { --c: var(--nu-green); }
.cah--esperando .cah1__cartao { opacity: 0; }
.cah--revelando .cah1__cartao { animation: cah-sobe 620ms cubic-bezier(.22, 1, .36, 1) both; animation-delay: calc(380ms + var(--i) * 110ms); }
@keyframes cah-sobe { from { opacity: 0; transform: translateY(14px); } }
.cah1__mais {
  margin-top: 18px; cursor: pointer; font-family: inherit;
  background: transparent; color: var(--nu-ink); border: 2px solid var(--nu-ink-16);
  border-radius: var(--nu-r-pill); padding: 10px 18px; font-size: var(--nu-fs-sm); font-weight: 800;
  transition: background .2s, border-color .2s;
}
.cah1__mais:hover { background: var(--nu-cream); border-color: var(--nu-ink-30); }

/* ————— 2. o agente trabalhando ————— */
.cah--v2 { background: var(--nu-cream); }
.cah2__tempo { position: relative; list-style: none; margin: clamp(28px, 4vw, 44px) 0 0; padding: 0; max-width: 820px; }
/* o trilho e a luz que desce por ele conforme o agente avança */
.cah2__tempo::before, .cah2__tempo::after { content: ''; position: absolute; left: 13px; top: 14px; bottom: 14px; width: 2px; border-radius: 2px; }
.cah2__tempo::before { background: var(--nu-cream-line); }
.cah2__tempo::after { background: linear-gradient(180deg, var(--nu-blue), #9B7BFF 60%, var(--nu-navy)); transform-origin: top; }
.cah--esperando .cah2__tempo::after { transform: scaleY(0); }
.cah--revelando .cah2__tempo::after { animation: cah-trilho calc(var(--n) * 240ms + 400ms) cubic-bezier(.4, 0, .2, 1) 300ms both; }
@keyframes cah-trilho { from { transform: scaleY(0); } }

.cah2__passo { position: relative; z-index: 1; display: flex; gap: 16px; padding: 10px 0; }
.cah2__no {
  position: relative; z-index: 1; flex: none; width: 28px; height: 28px; border-radius: 50%;
  display: grid; place-items: center; background: var(--nu-navy); color: var(--nu-cream);
  box-shadow: 0 0 0 5px var(--nu-cream);
}
.cah2__passo--achou .cah2__no { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.cah2__no-ponto { width: 10px; height: 10px; border-radius: 50%; background: var(--nu-amber-fill); }
.cah2__passo--leu .cah2__no { background: var(--nu-blue-bg); color: var(--nu-blue-text); }
.cah2__passo--fim .cah2__no { background: var(--nu-green); color: var(--nu-white); }
.cah2__corpo { flex: 1; min-width: 0; padding-top: 3px; }
.cah2__titulo { margin: 0; display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.01em; line-height: 1.3; }
.cah2__valor { color: var(--nu-gray); font-weight: 700; font-variant-numeric: tabular-nums; }
.cah2__nota { font-size: var(--nu-fs-xs); font-weight: 800; border-radius: var(--nu-r-pill); padding: 3px 10px; background: var(--nu-white); color: var(--nu-green-text); }
.cah2__nota--achou { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.cah2__nota--leu { background: var(--nu-white); color: var(--nu-gray-2); }
.cah2__passo--fim .cah2__titulo { color: var(--nu-ink); }

.cah2__itens { list-style: none; margin: 12px 0 4px; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.cah2__item {
  display: flex; gap: 14px; align-items: flex-start;
  background: var(--nu-white); border-radius: var(--nu-r-card); padding: 16px 18px;
  box-shadow: var(--nu-shadow-card); transition: transform .25s cubic-bezier(.22, 1, .36, 1), box-shadow .25s;
}
.cah2__item:hover { transform: translateX(4px); box-shadow: 0 26px 54px -26px rgba(12, 21, 36, 0.4); }
.cah2__item .cah__ponto { margin-top: 7px; }
.cah2__item-corpo { min-width: 0; flex: 1; }
.cah2__item-titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; line-height: 1.35; }
.cah2__item-selo { font-size: var(--nu-fs-xs); font-weight: 800; margin-right: 4px; }
.cah2__item-selo--alta { color: var(--nu-red-text); }
.cah2__item-selo--media { color: var(--nu-amber-text); }
.cah2__item-selo--baixa { color: var(--nu-gray-2); }
.cah2__item-selo--ideia { color: var(--nu-blue-text); }
.cah2__item-selo--forca { color: var(--nu-green-text); }
.cah2__item-texto { margin: 6px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; font-variant-numeric: tabular-nums; }
.cah2__item-pe { margin: 10px 0 0; display: flex; align-items: center; justify-content: space-between; gap: 8px 14px; flex-wrap: wrap; }
.cah2__perguntar { color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 800; border-radius: var(--nu-r-chip); }
.cah2__perguntar::after { content: ' →'; transition: margin .2s; }
.cah2__perguntar:hover { color: var(--nu-blue-text); }
.cah2__perguntar:hover::after { margin-left: 4px; }
/* um a um: cada passo e cada achado no seu tempo */
.cah--esperando .cah2__passo, .cah--esperando .cah2__item { opacity: 0; }
.cah--revelando .cah2__passo { animation: cah-entra 520ms cubic-bezier(.22, 1, .36, 1) both; animation-delay: calc(300ms + var(--i) * 240ms); }
.cah--revelando .cah2__item { animation: cah-entra 520ms cubic-bezier(.22, 1, .36, 1) both; animation-delay: calc(300ms + var(--i) * 240ms); }
@keyframes cah-entra { from { opacity: 0; filter: blur(6px); transform: translateY(8px); } }

/* ————— 3. a faixa ————— */
.cah--v3 { background: var(--nu-cream); padding-top: 0; padding-bottom: clamp(28px, 3.5vw, 44px); }
.cah--v3::before { display: none; }
.cah3 { border-top: 1px solid var(--nu-cream-line); padding-top: clamp(20px, 2.6vw, 28px); }
.cah3__linha { display: flex; align-items: center; gap: 12px; }
.cah3__frase { margin: 0; color: var(--nu-ink-75); font-size: var(--nu-fs-lg); font-weight: 600; line-height: 1.4; text-wrap: pretty; font-variant-numeric: tabular-nums; }
.cah3__frase strong { color: var(--nu-ink); font-weight: 800; }
.cah3__chips {
  list-style: none; margin: 16px calc(-1 * clamp(22px, 5.5vw, 80px)) 0; padding: 6px 0 10px;
  display: flex; gap: 8px; overflow-x: auto; scroll-snap-type: x proximity; scrollbar-width: none;
  scroll-padding-inline: clamp(22px, 5.5vw, 80px);
}
/* a margem da página nas duas pontas da fila que rola (padding de quem rola não vale no fim) */
.cah3__chips::before, .cah3__chips::after { content: ''; flex: none; width: calc(clamp(22px, 5.5vw, 80px) - 8px); }
.cah3__chips::-webkit-scrollbar { display: none; }
.cah3__chip-li { flex: none; scroll-snap-align: start; }
.cah3__chip {
  display: inline-flex; align-items: center; gap: 10px; max-width: 320px; cursor: pointer; font-family: inherit;
  background: var(--nu-white); color: var(--nu-ink); border: none;
  border-radius: var(--nu-r-pill); padding: 10px 16px 10px 14px; box-shadow: var(--nu-shadow-card), 0 0 0 1px var(--nu-navy-06);
  font-size: var(--nu-fs-sm); font-weight: 700; transition: transform .2s cubic-bezier(.22, 1, .36, 1), box-shadow .2s, background .2s, color .2s;
}
.cah3__chip:hover { transform: translateY(-2px); box-shadow: 0 18px 36px -18px rgba(12, 21, 36, 0.45), 0 0 0 1px var(--nu-navy-06); }
.cah3__chip--aberto { background: var(--nu-navy); color: var(--nu-cream-text); }
.cah3__chip-txt { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cah3__chip-quando { flex: none; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; }
.cah3__chip--aberto .cah3__chip-quando { color: var(--nu-cream-text-60); }
.cah--esperando .cah3__chip-li { opacity: 0; }
.cah--revelando .cah3__chip-li { animation: cah-sobe 480ms cubic-bezier(.22, 1, .36, 1) both; animation-delay: calc(var(--i) * 70ms); }
.cah3__detalhe { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .35s cubic-bezier(.22, 1, .36, 1); }
.cah3__detalhe--aberto { grid-template-rows: 1fr; }
.cah3__detalhe-in { overflow: hidden; min-height: 0; }
.cah3__cartao {
  display: flex; flex-direction: column; max-width: 720px; margin: 8px 0 4px;
  background: var(--nu-white); border-radius: var(--nu-r-card); padding: 20px;
  /* sombra curta: a gaveta corta o que passar da borda */
  box-shadow: 0 0 0 1px var(--nu-navy-06), 0 6px 14px -10px rgba(12, 21, 36, 0.35);
  animation: nu-fade .3s ease both;
}
.cah3__velha { margin-top: 12px; }

@media (max-width: 640px) {
  .cah__frase { margin-top: 18px; }
  .cah1__cartao { padding: 18px 16px 16px; }
  .cah2__item { padding: 14px; gap: 12px; }
  .cah2__titulo { font-size: var(--nu-fs-md); }
  .cah3__linha { align-items: flex-start; }
  .cah3__frase { font-size: var(--nu-fs-md); }
}
@media (prefers-reduced-motion: reduce) {
  .cah--revelando .cah__palavra, .cah--revelando .cah1__cartao, .cah--revelando .cah2__passo, .cah--revelando .cah2__item,
  .cah--revelando .cah2__tempo::after, .cah--revelando .cah3__chip-li, .cah--revelando .cah__agente::after { animation: none; }
}
</style>
