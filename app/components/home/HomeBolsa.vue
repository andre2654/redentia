<script setup lang="ts">
// A bolsa do dia na home do visitante (31/10/2026). Depois de cinco linhas
// novas, o dono pediu: "volte ao que era e tente apenas reduzir aquilo,
// deixando uma UX e UI melhor principalmente para o entendimento de
// investidores iniciantes". Então é a seção de antes, no azul-marinho, mais
// curta e explicada:
//  - em cima, a frase da bolsa ("Bolsa em queda.") com a sobrelinha que diz de
//    quando é o número e quando a bolsa abre, e uma frase que explica o
//    Ibovespa em português simples;
//  - três números, não cinco (Ibovespa, dólar e CDI), cada um com uma legenda
//    do que é; IFIX e Bitcoin ficam na faixa "Mercado agora" do topo;
//  - "O dia no mercado.": três cartões do fechamento da IA, não quatro ("A
//    leitura", a mais técnica, fica no resumo inteiro), cada um com o rótulo
//    do que é, e os termos do mercado com a explicação no toque (HomeTermo);
//  - "Quem mais subiu e caiu.": só entre as 76 empresas do Ibovespa, as que o
//    iniciante conhece, três de cada lado, o nome da empresa antes do código;
//    sem abas de classe e sem o preço.
// Os números vêm de uma fonte só (useBolsaDoDia, o mesmo do topo de quem
// assina); o fechamento da IA, do useNuBriefing; dólar e CDI, da faixa do topo.
//
// Ideia do dono no mesmo dia: logo embaixo de "Bolsa em queda." a linha do
// pregão, e um botão; ao apertar, a Redentia lê o gráfico inteiro (uma linha
// clara atravessa o dia, das 10h ao fechamento, com a hora que está lendo) e
// então aparecem os cartões do fechamento. É o gesto do produto: você não lê
// o mercado, ela lê e te entrega o que importa.
import { textosDaBolsa } from '~/utils/bolsaDoDia'
import { agoraEmSP, estadoDoPregao, horaDoFechamento, quandoFoi } from '~/utils/pregao'
import { rodapeSemAssinatura } from '~/utils/newsletter-lugares'
import { marcarTermos } from '~/utils/termosDoDia'

// o briefing registra o onMounted dele: vem antes de qualquer await
const { briefing, loading: briefingLoading, real: briefingReal } = useNuBriefing()
// dólar e CDI, os mesmos da faixa "Mercado agora" (hidratam no cliente)
const { items: faixa, loading: faixaCarregando } = useMarketTicker()

// a hora vai no estado: a hidratação herda a do servidor e o cliente acerta ao montar
const agora = useState('home:bolsa-agora', () => Date.now())
let relogio: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  agora.value = Date.now()
  // a busca do servidor falhou: o navegador tenta de novo
  if (!bolsa.value?.ibov) setTimeout(() => { void refresh() }, 1500)
  relogio = setInterval(() => {
    agora.value = Date.now()
    if (estado.value === 'aberta' && document.visibilityState === 'visible') void refresh()
  }, 60_000)
})
onBeforeUnmount(() => {
  if (relogio) clearInterval(relogio)
  if (quadro) cancelAnimationFrame(quadro)
})

const { bolsa, refresh } = await useBolsaDoDia()
const estado = computed(() => estadoDoPregao(new Date(agora.value)).estado)
const textos = computed(() => (bolsa.value ? textosDaBolsa(bolsa.value, estado.value, new Date(agora.value)) : null))
const ibov = computed(() => bolsa.value?.ibov ?? null)
const aoVivo = computed(() => estado.value === 'aberta' && ibov.value?.data === agoraEmSP(new Date(agora.value)).iso)

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const comSinal = (v: number) => (Math.abs(v) < 0.005 ? '0,00%' : `${v > 0 ? '+' : '−'}${nf2.format(Math.abs(v))}%`)

const titulo = computed(() => fraseDaBolsa(ibov.value?.pct) ?? 'A bolsa hoje.')
// a frase para quem está começando: o que é o Ibovespa e quantas subiram e caíram
const explicacao = computed(() => {
  const ib = ibov.value
  if (!ib) return null
  const quando = aoVivo.value ? 'até agora' : (quandoFoi(ib.data, new Date(agora.value)) ?? '')
  const parado = Math.abs(ib.pct) < 0.005
  const verbo = parado ? (aoVivo.value ? 'fica estável' : 'ficou estável') : ib.pct < 0 ? (aoVivo.value ? 'cai' : 'caiu') : (aoVivo.value ? 'sobe' : 'subiu')
  let s = `O Ibovespa, o índice das maiores empresas da bolsa, ${verbo}${parado ? '' : ` ${nf2.format(Math.abs(ib.pct))}%`} ${quando}.`
  const c = bolsa.value?.contagem
  if (c) s += ` Das ${c.total} empresas dele, ${c.altas} ${aoVivo.value ? 'sobem' : 'subiram'} e ${c.quedas} ${aoVivo.value ? 'caem' : 'caíram'}.`
  return s
})

// os três números, cada um com a legenda do que é
const indicadores = computed(() => {
  const achar = (n: string) => faixa.value.find((i) => i.n === n) ?? null
  const dolar = achar('Dólar')
  const cdi = achar('CDI')
  return [
    dolar && { n: 'Dólar', legenda: 'quanto custa US$ 1', v: dolar.v, pct: dolar.pct, dir: dolar.dir },
    cdi && { n: 'CDI', legenda: 'a referência da renda fixa', v: cdi.v, pct: cdi.pct, dir: cdi.dir },
  ].filter((x): x is NonNullable<typeof x> => !!x)
})

// o fechamento da IA: o placar, o que puxou e o que segurou ("A leitura" fica no resumo inteiro)
const todos = computed(() => (briefingReal.value ? dayTopicsFromNuBriefing(briefing.value).filter((x) => x.real) : []))
const cartoes = computed(() => {
  const queda = (ibov.value?.pct ?? 0) < 0
  const rotulo: Record<string, string> = {
    trend: 'O placar do dia',
    bars: queda ? 'O que puxou para baixo' : 'O que puxou para cima',
    flame: queda ? 'O que segurou' : 'O que ficou para trás',
  }
  return todos.value
    .filter((x) => x.icon !== 'compass')
    .map((x) => {
      // o placar ganha o título do dia; se o texto da IA começa com ele, não repete
      const titulo = x.stat ? (textos.value?.titulo ?? x.stat) : x.cardTitle
      const lead = titulo ? titulo.replace(/\.$/, '') : ''
      let texto = x.cardBlurb
      if (lead && texto.toLowerCase().startsWith(`${lead.toLowerCase()}:`)) {
        const resto = texto.slice(lead.length + 1).trim()
        texto = resto.charAt(0).toUpperCase() + resto.slice(1)
      }
      return { ...x, titulo, rotulo: rotulo[x.icon] ?? x.label, pedacos: marcarTermos(texto) }
    })
})
const blocos = computed(() => todos.value.map((x) => ({ label: x.label, color: x.labelColor, html: x.modalHtml })))

// a leitura: antes do botão, só o gráfico; lendo, a varredura; lido, os cartões
const temGrafico = computed(() => (bolsa.value?.mercados.length ?? 0) > 0)
const fechaAs = computed(() => (ibov.value ? horaDoFechamento(ibov.value.data) : 17))
const fase = ref<'antes' | 'lendo' | 'lido'>('antes')
const progresso = ref(0)
const tituloDoDia = ref<HTMLElement | null>(null)
let quadro = 0
const DURACAO = 2800
function lerODia() {
  const fim = () => {
    fase.value = 'lido'
    nextTick(() => tituloDoDia.value?.focus({ preventScroll: true }))
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return fim()
  fase.value = 'lendo'
  const inicio = performance.now()
  const passo = (t: number) => {
    const f = Math.min(1, (t - inicio) / DURACAO)
    progresso.value = f < 0.5 ? 2 * f * f : 1 - (-2 * f + 2) ** 2 / 2
    if (f < 1) quadro = requestAnimationFrame(passo)
    else fim()
  }
  quadro = requestAnimationFrame(passo)
}
// os números da leitura sobem junto com a faixa
const contadores = computed(() => {
  const f = fase.value === 'lendo' ? progresso.value : 0
  const minutos = bolsa.value?.intradia?.pontos.length ?? 433
  return {
    minutos: Math.round(f * minutos),
    mercados: Math.min(bolsa.value?.mercados.length ?? 4, Math.ceil(f * (bolsa.value?.mercados.length ?? 4))),
    empresas: Math.round(f * (bolsa.value?.acoes.length || 76)),
  }
})
const aberto = ref(false)
const gatilho = ref<HTMLButtonElement | null>(null)
function fechar() {
  aberto.value = false
  nextTick(() => gatilho.value?.focus())
}

// "Receber por e-mail": a newsletter do rodapé (O mercado da semana, toda
// sexta), só quando ela está ligada e aparece nesta página (decisão do dono,
// 31/10/2026: o convite do visitante é só por e-mail).
const receber = useRuntimeConfig().public.newsletterLigada === true && !rodapeSemAssinatura('/')
function irParaNewsletter(e: MouseEvent) {
  const alvo = document.getElementById('newsletter')
  if (!alvo) return
  e.preventDefault()
  alvo.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' })
  alvo.querySelector<HTMLInputElement>('input[type="email"]')?.focus({ preventScroll: true })
}

// as altas e as baixas entre as empresas do Ibovespa, três de cada lado, uma linha por empresa
const listas = computed(() => {
  const acoes = bolsa.value?.acoes ?? []
  if (acoes.length < 6) return null
  const umaPorEmpresa = (lista: typeof acoes) => {
    const vistas = new Set<string>()
    return lista.filter((a) => (vistas.has(a.empresa) ? false : (vistas.add(a.empresa), true))).slice(0, 3)
  }
  const ordem = [...acoes].sort((a, b) => b.pct - a.pct)
  return {
    altas: umaPorEmpresa(ordem.filter((a) => a.pct > 0)),
    baixas: umaPorEmpresa([...ordem].reverse().filter((a) => a.pct < 0)),
  }
})
const quandoDasListas = computed(() => {
  const ib = ibov.value
  if (!ib) return ''
  if (aoVivo.value) return 'até agora'
  return quandoFoi(ib.data, new Date(agora.value)) ?? ''
})
</script>

<template>
  <section class="hbo" aria-labelledby="hbo-titulo">
    <!-- a frase da bolsa e o que ela quer dizer -->
    <p v-if="textos" class="hbo__rotulo" :class="{ 'hbo__rotulo--aberta': aoVivo }">{{ textos.sobrelinha }}</p>
    <h2 id="hbo-titulo" class="hbo__frase">{{ titulo }}</h2>
    <p v-if="explicacao" class="hbo__sub">{{ explicacao }}</p>
    <NuSkeleton v-else tone="navy" variant="line" width="min(420px, 80%)" height="18px" radius="chip" class="hbo__sub-sk" />

    <!-- os três números: o Ibovespa em destaque e dólar e CDI ao lado -->
    <div class="hbo__indicadores">
      <div v-if="ibov" class="hbo__pilula" :class="ibov.pct < 0 ? 'hbo__pilula--down' : 'hbo__pilula--up'">
        <span class="hbo__pilula-pct">{{ comSinal(ibov.pct) }}</span>
        <span class="hbo__pilula-nome">Ibovespa<br>{{ nf0.format(Math.trunc(ibov.pontos)) }} pontos</span>
      </div>
      <template v-if="faixaCarregando && !indicadores.length">
        <NuSkeleton v-for="i in 2" :key="`ski${i}`" tone="navy" variant="line" width="150px" height="66px" radius="tile" />
      </template>
      <div v-for="it in indicadores" :key="it.n" class="hbo__ind">
        <span class="hbo__ind-nome">{{ it.n }}</span>
        <span class="hbo__ind-linha">
          <span class="hbo__ind-valor">{{ it.v }}</span>
          <span v-if="it.pct" class="hbo__ind-pct" :class="`hbo__ind-pct--${it.dir}`">{{ it.pct }}</span>
        </span>
        <span class="hbo__ind-legenda">{{ it.legenda }}</span>
      </div>
    </div>

    <!-- o mercado: os quatro no mesmo gráfico, e a Redentia deixa simples -->
    <div v-if="temGrafico && bolsa" class="hbo__mercado">
      <h3 class="hbo__dia-titulo">O mercado.</h3>
      <div class="hbo__quadro" :class="`hbo__quadro--${fase}`">
        <HomeBolsaMercados class="hbo__grafico" :mercados="bolsa.mercados" :fecha-as="fechaAs" :varredura="fase === 'lendo' ? progresso : null" />

        <!-- o resultado da leitura: por cima do gráfico, no mesmo lugar -->
        <div v-if="fase === 'lido' && (briefingLoading || cartoes.length)" class="hbo__simples" role="region" aria-labelledby="hbo-simples">
          <h4 id="hbo-simples" ref="tituloDoDia" class="hbo__simples-titulo" tabindex="-1">Simples assim.</h4>
          <ol class="hbo__itens">
            <li v-for="i in (cartoes.length ? 0 : 3)" :key="`sk${i}`" class="hbo__item">
              <NuSkeleton tone="navy" variant="line" width="110px" height="12px" radius="chip" />
              <NuSkeleton tone="navy" variant="text" :lines="2" last-width="70%" height="15px" style="margin-top: 10px" />
            </li>
            <li v-for="(c, i) in cartoes" :key="i" class="hbo__item">
              <span class="hbo__item-rotulo">{{ c.rotulo }}</span>
              <strong class="hbo__item-titulo">{{ c.titulo }}</strong>
              <p class="hbo__item-texto"><template v-for="(p, j) in c.pedacos" :key="j"><HomeTermo v-if="'termo' in p" :texto="p.texto" :termo="p.termo" :slug="p.slug" /><template v-else>{{ p.texto }}</template></template></p>
            </li>
          </ol>
          <div class="hbo__simples-acoes">
            <button v-if="cartoes.length" ref="gatilho" type="button" class="hbo__ler hbo__ler--cheio" aria-haspopup="dialog" :aria-expanded="aberto" @click="aberto = true">
              Ler o resumo do dia
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
            <button type="button" class="hbo__ler" @click="fase = 'antes'">Ver o gráfico de novo</button>
            <a v-if="receber" href="#newsletter" class="hbo__link-news" @click="irParaNewsletter">Receber toda sexta por e-mail</a>
          </div>
        </div>
      </div>

      <!-- a deixa e o botão -->
      <div v-if="fase !== 'lido'" class="hbo__deixa">
        <p class="hbo__deixa-txt">
          <template v-if="fase === 'antes'"><strong>Parece confuso?</strong> A Redentia deixa mais simples.</template>
          <template v-else>A Redentia está lendo: <strong>{{ contadores.minutos }}</strong> minutos de pregão, <strong>{{ contadores.mercados }}</strong> mercados, <strong>{{ contadores.empresas }}</strong> empresas.</template>
        </p>
        <button v-if="fase === 'antes' && (briefingLoading || cartoes.length)" type="button" class="hbo__ler hbo__ler--cheio hbo__ler-dia" @click="lerODia">
          Deixar simples
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>

    <!-- sem gráfico: o fechamento da IA direto, em três cartões -->
    <div v-else-if="briefingLoading || cartoes.length" class="hbo__dia">
      <h3 class="hbo__dia-titulo">O dia no mercado.</h3>
      <p v-if="briefingReal" class="hbo__dia-meta">{{ briefing.metaLine }}</p>
      <div class="hbo__dia-grade">
        <div v-for="(c, i) in cartoes" :key="i" class="hbo__dia-cartao">
          <span class="hbo__dia-rotulo">{{ c.rotulo }}</span>
          <div v-if="c.stat" class="hbo__dia-stat">{{ c.stat }}</div>
          <div v-else-if="c.cardTitle" class="hbo__dia-titulo-cartao">{{ c.cardTitle }}</div>
          <p class="hbo__dia-texto"><template v-for="(p, j) in c.pedacos" :key="j"><HomeTermo v-if="'termo' in p" :texto="p.texto" :termo="p.termo" :slug="p.slug" /><template v-else>{{ p.texto }}</template></template></p>
        </div>
      </div>
    </div>

    <!-- as altas e as baixas entre as maiores empresas -->
    <div v-if="listas" class="hbo__listas">
      <h3 class="hbo__listas-titulo">Quem mais subiu e caiu.</h3>
      <p class="hbo__dia-meta">Entre as {{ bolsa?.acoes.length }} empresas do Ibovespa, {{ quandoDasListas }}.</p>
      <div class="hbo__grade">
        <div v-for="lado in (['altas', 'baixas'] as const)" :key="lado" class="hbo__cartao">
          <span class="hbo__cartao-nome">{{ lado === 'altas' ? 'Maiores altas' : 'Maiores baixas' }}</span>
          <div class="hbo__linhas">
            <NuxtLink v-for="(a, i) in listas[lado]" :key="a.ticker" :to="`/asset/${a.ticker}`" class="hbo__linha">
              <span class="hbo__pos">{{ i + 1 }}</span>
              <span class="hbo__id">
                <span class="hbo__empresa">{{ a.empresa }}</span>
                <span class="hbo__ticker">{{ a.ticker }}</span>
              </span>
              <span class="hbo__pct" :class="a.pct < 0 ? 'hbo__pct--down' : 'hbo__pct--up'">{{ comSinal(a.pct) }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <NuDayModal
      :open="aberto"
      eyebrow="Resumo do dia · Redentia"
      title="O dia no mercado"
      :date-line="briefing.metaLine"
      :blocks="blocos"
      @close="fechar"
    />
  </section>
</template>

<style scoped>
.hbo { background: var(--nu-navy); padding: clamp(56px, 7vw, 92px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.hbo__rotulo { margin: 0; color: var(--nu-cream-text-70); font-size: var(--nu-fs-lg); font-weight: 700; }
.hbo__rotulo--aberta { color: var(--nu-green-soft); }
.hbo__frase {
  margin: 10px 0 0; color: var(--nu-cream-text); font-size: var(--nu-fs-h2);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.hbo__sub { margin: 14px 0 0; max-width: 62ch; color: var(--nu-cream-text-70); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.5; font-variant-numeric: tabular-nums; }
.hbo__sub-sk { margin-top: 18px; }

/* os três números: o Ibovespa grande e dólar e CDI em fichas da mesma altura */
.hbo__indicadores { display: flex; align-items: stretch; gap: 10px; flex-wrap: wrap; margin-top: 24px; }
.hbo__pilula {
  display: inline-flex; align-items: center; gap: 12px; padding: 10px 18px 10px 14px;
  border-radius: 14px; background: var(--nu-cream-text-10);
}
.hbo__pilula-pct { font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.hbo__pilula--up .hbo__pilula-pct { color: var(--nu-green-soft); }
.hbo__pilula--down .hbo__pilula-pct { color: var(--nu-red-soft); }
.hbo__pilula-nome { color: var(--nu-cream-text-70); font-size: var(--nu-fs-xs); font-weight: 700; line-height: 1.3; text-transform: uppercase; letter-spacing: .06em; font-variant-numeric: tabular-nums; }
.hbo__ind {
  display: flex; flex-direction: column; justify-content: center; gap: 3px; min-width: 150px;
  padding: 10px 16px; border-radius: 14px; background: var(--nu-cream-text-08);
}
.hbo__ind-nome { color: var(--nu-cream-text-70); font-size: var(--nu-fs-xs); font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
.hbo__ind-linha { display: flex; align-items: baseline; gap: 8px; }
.hbo__ind-valor { color: var(--nu-cream-text); font-size: var(--nu-fs-md); font-weight: 800; white-space: nowrap; font-variant-numeric: tabular-nums; }
.hbo__ind-pct { font-size: var(--nu-fs-sm); font-weight: 800; white-space: nowrap; font-variant-numeric: tabular-nums; }
.hbo__ind-pct--up { color: var(--nu-green-soft); }
.hbo__ind-pct--down { color: var(--nu-red-soft); }
.hbo__ind-pct--flat { color: var(--nu-cream-text-70); }
.hbo__ind-legenda { color: var(--nu-cream-text-50); font-size: var(--nu-fs-xs); font-weight: 500; }

/* o mercado: o gráfico e, depois da leitura, o resumo no mesmo lugar */
.hbo__mercado { margin-top: clamp(40px, 5vw, 60px); }
.hbo__quadro { position: relative; margin-top: 18px; }
.hbo__grafico { transition: opacity .5s ease, filter .5s ease; }
/* lido: o gráfico vira fundo, borrado, e o resumo entra por cima */
.hbo__quadro--lido .hbo__grafico { opacity: .14; filter: blur(3px); pointer-events: none; }
.hbo__simples {
  position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; gap: 18px;
  animation: hbo-entra .5s cubic-bezier(.22, 1, .36, 1) backwards;
}
.hbo__simples-titulo { margin: 0; color: var(--nu-cream-text); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; }
.hbo__simples-titulo:focus { outline: none; }
.hbo__itens { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.hbo__item { padding: 18px 20px; border-radius: 18px; background: var(--nu-navy-2); animation: hbo-entra .5s cubic-bezier(.22, 1, .36, 1) backwards; }
.hbo__item:nth-child(1) { animation-delay: .1s; }
.hbo__item:nth-child(2) { animation-delay: .22s; }
.hbo__item:nth-child(3) { animation-delay: .34s; }
.hbo__item-rotulo { display: block; color: var(--nu-cream-text-50); font-size: var(--nu-fs-xs); font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
.hbo__item-titulo { display: block; margin-top: 8px; color: var(--nu-cream-text); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.01em; }
.hbo__item-texto { margin: 6px 0 0; color: var(--nu-cream-text-70); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.hbo__simples-acoes { display: flex; align-items: center; gap: 10px 14px; flex-wrap: wrap; animation: hbo-entra .5s cubic-bezier(.22, 1, .36, 1) .46s backwards; }
.hbo__link-news { color: var(--nu-cream-text-70); font-size: var(--nu-fs-sm); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
.hbo__link-news:hover { color: var(--nu-cream-text); }

/* a deixa: "Parece confuso?" e o botão */
.hbo__deixa { margin-top: 18px; display: flex; align-items: center; justify-content: space-between; gap: 14px 24px; flex-wrap: wrap; min-height: 52px; }
.hbo__deixa-txt { margin: 0; color: var(--nu-cream-text-70); font-size: var(--nu-fs-xl); font-weight: 500; font-variant-numeric: tabular-nums; }
.hbo__deixa-txt strong { color: var(--nu-cream-text); font-weight: 800; }
.hbo__ler-dia { min-height: 56px; padding: 0 28px; font-size: var(--nu-fs-lg); }

/* o dia no mercado: três cartões do fechamento da IA */
.hbo__dia { margin-top: clamp(44px, 5vw, 60px); }
.hbo__dia-titulo:focus { outline: none; }
/* o resumo da leitura entra de baixo para cima */
@keyframes hbo-entra { from { opacity: 0; transform: translateY(12px); } }
.hbo__dia-titulo, .hbo__listas-titulo { margin: 0; color: var(--nu-cream-text); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.hbo__dia-meta { margin: 10px 0 0; color: var(--nu-cream-text-70); font-size: var(--nu-fs-md); font-weight: 500; }
.hbo__dia-grade { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 24px; }
@media (max-width: 900px) { .hbo__dia-grade { grid-template-columns: 1fr; } }
.hbo__dia-cartao { display: flex; flex-direction: column; background: var(--nu-navy-2); border-radius: var(--nu-r-card-lg); padding: 24px 26px 28px; }
.hbo__dia-rotulo { color: var(--nu-cream-text-50); font-size: var(--nu-fs-xs); font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
.hbo__dia-stat, .hbo__dia-titulo-cartao { padding-top: 18px; color: var(--nu-cream-text); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; }
.hbo__dia-stat { font-size: var(--nu-fs-h2); font-variant-numeric: tabular-nums; }
.hbo__dia-titulo-cartao { font-size: var(--nu-fs-2xl); }
.hbo__dia-texto { margin: 12px 0 0; color: var(--nu-cream-text-70); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
.hbo__dia-texto :deep(.hte__termo) { color: var(--nu-cream-text); }
.hbo__dia-acoes { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 24px; }

/* os botões: o resumo em creme (o texto escuro agora lê) e a newsletter em contorno */
.hbo__ler {
  display: inline-flex; align-items: center; gap: 10px; min-height: 52px; padding: 0 24px;
  border: 1.5px solid var(--nu-cream-text-12); border-radius: var(--nu-r-pill); background: transparent; cursor: pointer;
  color: var(--nu-cream-text); font-size: var(--nu-fs-md); font-weight: 700; transition: background .2s, border-color .2s;
}
.hbo__ler:hover { background: var(--nu-cream-text-08); border-color: var(--nu-cream-text-45); color: var(--nu-cream-text); }
.hbo__ler.hbo__ler--cheio { background: var(--nu-cream); border-color: var(--nu-cream); color: var(--nu-navy); }
.hbo__ler.hbo__ler--cheio:hover { background: var(--nu-white); border-color: var(--nu-white); color: var(--nu-navy); }
.hbo__ler:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; }
.hbo__ler svg { transition: transform .2s ease; }
.hbo__ler:hover svg { transform: translateX(3px); }

/* as altas e as baixas: três por lado, o nome da empresa primeiro */
.hbo__listas { margin-top: clamp(44px, 5vw, 60px); }
.hbo__grade { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr)); gap: 16px; margin-top: 24px; }
.hbo__cartao { background: var(--nu-navy-2); border-radius: var(--nu-r-card-lg); padding: 22px 26px; }
.hbo__cartao-nome { color: var(--nu-cream-text); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -.3px; }
.hbo__linhas { margin-top: 10px; }
.hbo__linha {
  display: flex; align-items: center; gap: 14px; min-height: 56px; padding: 10px 12px; margin: 0 -12px;
  border-top: 1px solid var(--nu-cream-text-12); border-radius: var(--nu-r-card); transition: background .16s;
}
.hbo__linhas > .hbo__linha:first-child { border-top: none; }
.hbo__linha:hover { background: var(--nu-cream-text-08); }
.hbo__linha:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }
.hbo__pos { width: 18px; flex-shrink: 0; color: var(--nu-cream-text-45); font-size: var(--nu-fs-md); font-weight: 800; font-variant-numeric: tabular-nums; }
.hbo__id { flex: 1; min-width: 0; overflow: hidden; }
.hbo__empresa { display: block; color: var(--nu-cream-text); font-size: var(--nu-fs-md); font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hbo__ticker { display: block; margin-top: 1px; color: var(--nu-cream-text-50); font-size: var(--nu-fs-dense); font-weight: 500; white-space: nowrap; }
.hbo__pct { flex-shrink: 0; min-width: 72px; text-align: right; font-size: var(--nu-fs-md); font-weight: 800; white-space: nowrap; font-variant-numeric: tabular-nums; }
.hbo__pct--up { color: var(--nu-green-soft); }
.hbo__pct--down { color: var(--nu-red-soft); }

/* abaixo de 1000 px o resumo vem embaixo do gráfico, que encolhe */
@media (max-width: 999px) {
  .hbo__simples { position: static; margin-top: 8px; }
  .hbo__itens { grid-template-columns: 1fr; }
  .hbo__quadro--lido .hbo__grafico { display: none; }
}
@media (max-width: 560px) {
  .hbo__ind { flex: 1 1 140px; min-width: 0; }
  .hbo__dia-acoes { flex-direction: column; align-items: stretch; }
  .hbo__ler { justify-content: center; }
}
@media (prefers-reduced-motion: reduce) {
  .hbo, .hbo__simples, .hbo__simples * { animation: none !important; }
  .hbo__grafico { transition: none; }
  .hbo__ler svg { transition: none; }
}
</style>
