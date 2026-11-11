<script setup lang="ts">
// A bolsa do dia na home do visitante (31/10/2026). Depois de cinco linhas
// novas, o dono pediu: "volte ao que era e tente apenas reduzir aquilo,
// deixando uma UX e UI melhor principalmente para o entendimento de
// investidores iniciantes". Então é a seção de antes, no azul-marinho, mais
// curta e explicada:
//  - em cima, a frase da bolsa ("Bolsa em queda.") com a sobrelinha que diz de
//    quando é o número e quando a bolsa abre, e uma frase que explica o
//    Ibovespa em português simples;
//  - "O dia no mercado.": três cartões do fechamento da IA, não quatro ("A
//    leitura", a mais técnica, fica no resumo inteiro), cada um com o rótulo
//    do que é, e os termos do mercado com a explicação no toque (HomeTermo);
//    depois da leitura, só a ideia de cada cartão (o texto vai no resumo);
//  - "Quem mais subiu e caiu." saiu daqui para a seção de baixo, com os
//    outros rankings (HomeRankings, pedido do dono no mesmo dia).
// Os números vêm de uma fonte só (useBolsaDoDia, o mesmo do topo de quem
// assina); o fechamento da IA, do useNuBriefing.
//
// Mais baixa (pedido do mesmo dia): as fichas de dólar e CDI repetiam a
// legenda do gráfico e saíram; "Parece confuso?" e o botão sobem para a
// direita do título, "O mercado" vira rótulo e o gráfico desce a 280 px.
//
// Ideia do dono no mesmo dia: logo embaixo de "Bolsa em queda." a linha do
// pregão, e um botão; ao apertar, a Redentia lê o gráfico inteiro (uma linha
// clara atravessa o dia, das 10h ao fechamento, com a hora que está lendo) e
// então aparecem os cartões do fechamento. É o gesto do produto: você não lê
// o mercado, ela lê e te entrega o que importa.
//
// Aportou (11/11/2026): a seção é carvão (era o azul-marinho), a sobrelinha é
// o eyebrow da marca (o corte + caixa alta), os dois botões cheios são a pílula
// com a seta no círculo (NuBotaoSeta creme), os cartões do dia são o cartão
// carvão de raio 28 e os rótulos viram rótulo de coluna (caixa alta, 0,16em).
// O texto fala em Aportou. Estrutura, dados e a leitura do gráfico: iguais.
import { textosDaBolsa } from '~/utils/bolsaDoDia'
import { agoraEmSP, estadoDoPregao, horaDoFechamento, quandoFoi } from '~/utils/pregao'
import { rodapeSemAssinatura } from '~/utils/newsletter-lugares'
import { marcarTermos } from '~/utils/termosDoDia'

// o briefing registra o onMounted dele: vem antes de qualquer await
const { briefing, loading: briefingLoading, real: briefingReal } = useNuBriefing()
// a entrada da seção (também antes do await): só embeleza, nada fica escondido
const { el: secao, revealClass } = useReveal(0.25, { soEmbeleza: true })

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

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

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
      // a seta de cada ideia: o placar e o que puxou vão no sentido do dia; o que segurou, no contrário
      const sobe = x.icon === 'flame' ? queda : !queda
      return { ...x, titulo, rotulo: rotulo[x.icon] ?? x.label, sobe, pedacos: marcarTermos(texto) }
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
const focarTitulo = () => { if (fase.value === 'lido') tituloDoDia.value?.focus({ preventScroll: true }) }
function lerODia() {
  const fim = () => {
    // o foco vai para o título novo quando ele entra (focarTitulo, no fim da troca)
    fase.value = 'lido'
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
// depois da leitura, a frase que diz o que a Aportou leu
const leuoDia = computed(() => {
  const mercados = bolsa.value?.mercados.length ?? 0
  const empresas = bolsa.value?.acoes.length || bolsa.value?.contagem?.total || 0
  return `A Aportou leu o pregão inteiro, das 10h às ${fechaAs.value}h, ${mercados} mercados e ${empresas} empresas. O dia em três frases:`
})
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
// o gatilho é um NuBotaoSeta: o foco volta para o botão de dentro dele
const gatilho = ref<{ $el?: HTMLElement } | null>(null)
function fechar() {
  aberto.value = false
  nextTick(() => gatilho.value?.$el?.focus())
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

</script>

<template>
  <section ref="secao" v-contexto-chat="{ id: 'bolsa:hoje', tipo: 'bolsa', rotulo: 'A bolsa hoje' }" class="hbo" :class="revealClass" aria-labelledby="hbo-titulo">
    <!-- o topo: a frase da bolsa à esquerda e a deixa à direita, na mesma altura -->
    <div class="hbo__topo">
      <div class="hbo__titulos" :class="{ 'hbo__titulos--lendo': fase === 'lendo' }">
        <NuEyebrow v-if="textos" como="p" sobre="escuro" class="hbo__rotulo" :class="{ 'hbo__rotulo--aberta': aoVivo }">{{ textos.sobrelinha }}</NuEyebrow>
        <!-- lido: o título vira o da leitura, para não ficarem dois títulos na tela -->
        <Transition name="hbo-troca" mode="out-in" @after-enter="focarTitulo">
          <div v-if="fase === 'lido'" key="lido">
            <h2 id="hbo-titulo" ref="tituloDoDia" class="hbo__frase" tabindex="-1">Simples assim.</h2>
            <p class="hbo__sub">{{ leuoDia }}</p>
          </div>
          <div v-else key="bolsa">
            <h2 id="hbo-titulo" class="hbo__frase">{{ titulo }}</h2>
            <p v-if="explicacao" class="hbo__sub">{{ explicacao }}</p>
            <NuSkeleton v-else tone="navy" variant="line" width="min(420px, 80%)" height="18px" radius="chip" class="hbo__sub-sk" />
          </div>
        </Transition>
      </div>
      <div v-if="temGrafico && fase !== 'lido' && (briefingLoading || cartoes.length)" class="hbo__deixa">
        <p class="hbo__deixa-txt" aria-live="polite">
          <template v-if="fase === 'antes'"><strong>Parece confuso?</strong> A Aportou deixa mais simples.</template>
          <template v-else>Lendo <strong>{{ contadores.minutos }}</strong> minutos, <strong>{{ contadores.mercados }}</strong> mercados e <strong>{{ contadores.empresas }}</strong> empresas.</template>
        </p>
        <NuBotaoSeta v-if="fase === 'antes'" variante="creme" tamanho="m" class="hbo__ler-dia" @click="lerODia">Deixar simples</NuBotaoSeta>
      </div>
    </div>

    <!-- o mercado: os quatro no mesmo gráfico (a legenda dele já dá o número de cada um) -->
    <div v-if="temGrafico && bolsa" v-contexto-chat="{ id: 'bolsa:mercados', tipo: 'bolsa', rotulo: 'O mercado hoje' }" class="hbo__mercado">
      <h3 class="hbo__mercado-rotulo" :class="{ 'hbo__mercado-rotulo--fora': fase === 'lido' }">O mercado</h3>
      <div class="hbo__quadro" :class="`hbo__quadro--${fase}`">
        <HomeBolsaMercados class="hbo__grafico" :mercados="bolsa.mercados" :fecha-as="fechaAs" :varredura="fase === 'lendo' ? progresso : null" />

        <!-- o resultado da leitura: por cima do gráfico, no mesmo lugar -->
        <div v-if="fase === 'lido' && (briefingLoading || cartoes.length)" class="hbo__simples" role="region" aria-labelledby="hbo-titulo">
          <ol class="hbo__itens">
            <li v-for="i in (cartoes.length ? 0 : 3)" :key="`sk${i}`" class="hbo__item">
              <NuSkeleton tone="navy" variant="line" width="40px" height="40px" radius="pill" />
              <NuSkeleton tone="navy" variant="line" width="70%" height="28px" radius="chip" style="margin-top: 16px" />
              <NuSkeleton tone="navy" variant="line" width="110px" height="12px" radius="chip" style="margin-top: 12px" />
            </li>
            <li v-for="(c, i) in cartoes" :key="i" v-contexto-chat="{ id: `bolsa:leitura:${i}`, tipo: 'bolsa', rotulo: rotuloCurto(c.titulo || c.rotulo, 30), texto: [c.titulo, c.rotulo].filter(Boolean).join('\n') }" class="hbo__item">
              <span class="hbo__item-seta" :class="c.sobe ? 'hbo__item-seta--sobe' : 'hbo__item-seta--cai'" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path :d="c.sobe ? 'M12 19V5M6 11l6-6 6 6' : 'M12 5v14M6 13l6 6 6-6'" /></svg>
              </span>
              <strong class="hbo__item-titulo">{{ c.titulo }}</strong>
              <span class="hbo__item-rotulo">{{ c.rotulo }}</span>
            </li>
          </ol>
          <div class="hbo__simples-acoes">
            <NuBotaoSeta v-if="cartoes.length" ref="gatilho" variante="creme" tamanho="m" aria-haspopup="dialog" :aria-expanded="aberto" @click="aberto = true">Ler o resumo do dia</NuBotaoSeta>
            <button type="button" class="hbo__link-news" @click="fase = 'antes'">Ver o gráfico de novo</button>
            <a v-if="receber" href="#newsletter" class="hbo__link-news" @click="irParaNewsletter">Receber toda sexta por e-mail</a>
          </div>
        </div>
      </div>

    </div>

    <!-- sem gráfico: o fechamento da IA direto, em três cartões -->
    <div v-else-if="briefingLoading || cartoes.length" class="hbo__dia">
      <h3 class="hbo__dia-titulo">O dia no mercado.</h3>
      <p v-if="briefingReal" class="hbo__dia-meta">{{ briefing.metaLine }}</p>
      <div class="hbo__dia-grade">
        <div v-for="(c, i) in cartoes" :key="i" v-contexto-chat="{ id: `bolsa:dia:${i}`, tipo: 'bolsa', rotulo: rotuloCurto(c.rotulo, 30) }" class="hbo__dia-cartao">
          <span class="hbo__dia-rotulo">{{ c.rotulo }}</span>
          <div v-if="c.stat" class="hbo__dia-stat">{{ c.stat }}</div>
          <div v-else-if="c.cardTitle" class="hbo__dia-titulo-cartao">{{ c.cardTitle }}</div>
          <p class="hbo__dia-texto"><template v-for="(p, j) in c.pedacos" :key="j"><HomeTermo v-if="'termo' in p" :texto="p.texto" :termo="p.termo" :slug="p.slug" /><template v-else>{{ p.texto }}</template></template></p>
        </div>
      </div>
    </div>

    <NuDayModal
      :open="aberto"
      eyebrow="Resumo do dia · Aportou"
      title="O dia no mercado"
      :date-line="briefing.metaLine"
      :blocks="blocos"
      @close="fechar"
    />
  </section>
</template>

<style scoped>
/* a seção carvão da home, no contêiner de 1.240 px */
.hbo { background: var(--nu-ink); padding: clamp(64px, 7vw, 100px) max(32px, calc((100% - 1240px) / 2)); }
/* a sobrelinha é o eyebrow da marca; com a bolsa aberta, o texto fica verde */
.hbo__rotulo--aberta { color: var(--nu-green-soft); }
.hbo__frase {
  margin: 18px 0 0; color: var(--nu-white); font-size: var(--nu-fs-h2);
  font-weight: var(--nu-w-display); letter-spacing: -0.03em; line-height: 1.02;
}
.hbo__sub { margin: 16px 0 0; max-width: 62ch; color: var(--nu-on-dark); font-size: clamp(17px, 1.4vw, 19px); font-weight: 500; line-height: 1.5; font-variant-numeric: tabular-nums; text-wrap: pretty; }
.hbo__sub-sk { margin-top: 20px; }
.hbo__frase:focus { outline: none; }
/* lendo: o topo dá um passo atrás, os olhos vão para o gráfico */
.hbo__frase, .hbo__sub { transition: opacity .4s ease; }
.hbo__titulos--lendo .hbo__frase, .hbo__titulos--lendo .hbo__sub { opacity: .3; }
/* lido: a frase da bolsa sai e entra a da leitura */
.hbo-troca-enter-active, .hbo-troca-leave-active { transition: opacity .3s ease, transform .3s var(--nu-ease-saida); }
.hbo-troca-enter-from { opacity: 0; transform: translateY(10px); }
.hbo-troca-leave-to { opacity: 0; transform: translateY(-6px); }

/* o mercado: o gráfico e, depois da leitura, o resumo no mesmo lugar */
.hbo__mercado { margin-top: clamp(28px, 3.4vw, 40px); }
.hbo__quadro { position: relative; margin-top: 10px; }
.hbo__grafico { transition: opacity .5s ease, filter .5s ease; }
/* lido: o gráfico vira fundo, borrado, e o resumo entra por cima */
.hbo__quadro--lido .hbo__grafico { opacity: .14; filter: blur(3px); pointer-events: none; }
.hbo__simples {
  position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-start; gap: 24px; padding-top: 12px;
  animation: hbo-entra .5s var(--nu-ease-saida) backwards;
}
/* só a ideia de cada cartão, no centro do quadro: a seta do sentido, o título e o rótulo; o texto inteiro fica no resumo do dia */
.hbo__itens { list-style: none; margin: auto 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.hbo__item { display: flex; flex-direction: column; align-items: center; padding: 0 20px; text-align: center; animation: hbo-entra .5s var(--nu-ease-saida) backwards; }
.hbo__item:nth-child(1) { animation-delay: .1s; }
.hbo__item:nth-child(2) { animation-delay: .22s; }
.hbo__item:nth-child(3) { animation-delay: .34s; }
.hbo__item-seta { display: grid; place-items: center; width: 44px; height: 44px; border-radius: var(--nu-r-pill); }
.hbo__item-seta--sobe { color: var(--nu-green-soft); background: color-mix(in srgb, var(--nu-green-soft) 16%, transparent); }
.hbo__item-seta--cai { color: var(--nu-red-soft); background: color-mix(in srgb, var(--nu-red-soft) 16%, transparent); }
.hbo__item-rotulo { display: block; margin-top: 10px; color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: var(--nu-w-medio); text-transform: uppercase; letter-spacing: .16em; }
.hbo__item-titulo { display: block; margin-top: 16px; color: var(--nu-white); font-size: clamp(22px, 2.2vw, 28px); font-weight: var(--nu-w-forte); letter-spacing: -0.025em; line-height: 1.1; text-wrap: balance; }
/* as ações no fim do quadro, centradas */
.hbo__simples-acoes { padding-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 12px 24px; flex-wrap: wrap; animation: hbo-entra .5s var(--nu-ease-saida) .46s backwards; }
/* a segunda ação: link em negrito sublinhado, com 44 px de toque */
.hbo__link-news {
  display: inline-flex; align-items: center; min-height: 44px; padding: 0; border: 0; background: none; cursor: pointer;
  color: var(--nu-on-dark); font-family: inherit; font-size: 15.5px; font-weight: var(--nu-w-medio); text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px;
  transition: color .2s;
}
.hbo__link-news:hover { color: var(--nu-white); }

/* o topo: o título à esquerda e a deixa ("Parece confuso?" e o botão) à direita */
.hbo__topo { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 24px 48px; }
.hbo__titulos { min-width: 0; }
.hbo__deixa { display: flex; flex-direction: column; align-items: flex-end; gap: 14px; max-width: 340px; text-align: right; }
.hbo__deixa-txt { margin: 0; color: var(--nu-on-dark); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.4; font-variant-numeric: tabular-nums; text-wrap: balance; }
.hbo__deixa-txt strong { color: var(--nu-white); font-weight: var(--nu-w-forte); }
.hbo__mercado-rotulo--fora { visibility: hidden; }
.hbo__mercado-rotulo { margin: 0; color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: var(--nu-w-medio); letter-spacing: .16em; text-transform: uppercase; }

/* o dia no mercado: três cartões do fechamento da IA */
.hbo__dia { margin-top: clamp(40px, 4.6vw, 56px); }
.hbo__dia-titulo:focus { outline: none; }
/* o resumo da leitura entra de baixo para cima */
@keyframes hbo-entra { from { opacity: 0; transform: translateY(12px); } }
.hbo__dia-titulo { margin: 0; color: var(--nu-white); font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); letter-spacing: -0.025em; line-height: 1.05; }
.hbo__dia-meta { margin: 10px 0 0; color: var(--nu-on-dark); font-size: var(--nu-fs-md); font-weight: 500; }
.hbo__dia-grade { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 24px; }
@media (max-width: 900px) { .hbo__dia-grade { grid-template-columns: 1fr; } }
/* o cartão carvão do contrato, um tom acima da seção, com o fio escuro */
.hbo__dia-cartao {
  display: flex; flex-direction: column; padding: clamp(22px, 2.4vw, 28px);
  border-radius: var(--nu-r-card); background: var(--nu-dark-chip); box-shadow: inset 0 0 0 1px var(--nu-dark-line);
}
.hbo__dia-rotulo { color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: var(--nu-w-medio); text-transform: uppercase; letter-spacing: .16em; }
.hbo__dia-stat, .hbo__dia-titulo-cartao { padding-top: 18px; color: var(--nu-white); font-weight: var(--nu-w-forte); letter-spacing: -0.03em; line-height: 1.05; }
.hbo__dia-stat { font-size: var(--nu-fs-h2); font-variant-numeric: tabular-nums; }
.hbo__dia-titulo-cartao { font-size: clamp(22px, 2.2vw, 28px); letter-spacing: -0.025em; line-height: 1.1; }
.hbo__dia-texto { margin: 12px 0 0; color: var(--nu-on-dark); font-size: 16.5px; font-weight: 500; line-height: 1.5; }
.hbo__dia-texto :deep(.hte__termo) { color: var(--nu-white); }

/* entrada da seção: o topo e depois o quadro (só quando ela chega de fora da tela) */
.hbo.is-in .hbo__titulos, .hbo.is-in .hbo__deixa, .hbo.is-in .hbo__mercado, .hbo.is-in .hbo__dia { animation: nu-fade .5s ease backwards; }
.hbo.is-in .hbo__deixa { animation-delay: .06s; }
.hbo.is-in .hbo__mercado, .hbo.is-in .hbo__dia { animation-delay: .12s; }
.hbo.is-in .hbo__dia-cartao { animation: nu-fade .5s ease backwards; }
.hbo.is-in .hbo__dia-cartao:nth-child(1) { animation-delay: .18s; }
.hbo.is-in .hbo__dia-cartao:nth-child(2) { animation-delay: .24s; }
.hbo.is-in .hbo__dia-cartao:nth-child(3) { animation-delay: .3s; }

/* abaixo de 1000 px o resumo vem embaixo do gráfico, que encolhe */
@media (max-width: 999px) {
  /* no celular a deixa desce para baixo do gráfico: primeiro se vê o mercado, depois o botão */
  .hbo { display: flex; flex-direction: column; }
  .hbo__topo { display: contents; }
  .hbo__mercado { order: 1; }
  .hbo__deixa { order: 2; margin-top: 18px; flex-direction: row; flex-wrap: wrap; align-items: center; justify-content: space-between; max-width: none; text-align: left; }
  .hbo__simples { position: static; margin-top: 8px; }
  .hbo__simples-acoes { margin-top: 12px; flex-direction: column; }
  .hbo__itens { grid-template-columns: 1fr; }
  .hbo__itens { gap: 28px; }
  .hbo__item { padding: 0; }
  .hbo__quadro--lido .hbo__grafico { display: none; }
}
@media (max-width: 760px) {
  .hbo { padding-inline: 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .hbo, .hbo *, .hbo__simples, .hbo__simples * { animation: none !important; }
  .hbo__grafico, .hbo__frase, .hbo__sub, .hbo-troca-enter-active, .hbo-troca-leave-active { transition: none; }
}
</style>
