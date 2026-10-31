<script setup lang="ts">
// A bolsa do dia na home do visitante (31/10/2026). Primeiro "O fechamento",
// só tipografia, saído de uma conversa entre um investidor do público, uma
// especialista de produto da Apple e uma de UX; o dono achou "texto demais,
// sem desenho", e a seção virou dois desenhos com pouca palavra:
//  - em cima, a data do número, o Ibovespa como herói e o título do dia
//    ("Quinta queda seguida.");
//  - à esquerda, a linha do pregão minuto a minuto (HomeBolsaLinha), como a
//    do Mercado nos apps;
//  - à direita, o mercado inteiro de uma vez (HomeBolsaMercado): as 76 ações
//    em cinza e acesas só as cinco que explicam o dia, a mesma língua do leque
//    da carteira (pedido do dono: passar a sensação de que a Redentia lê o
//    mercado e de que a pessoa não precisa ver o mercado inteiro);
//  - embaixo da linha, o fecho: a leitura da IA numa frase, assinada, e os
//    links do fechamento inteiro e da newsletter;
//  - a ponte "Bolsa −0,75% · Você —" com o "Conectar carteira".
// Saíram o azul-marinho, as pílulas (a faixa "Mercado agora" do topo já
// mostra), os cartões com ícone, os parágrafos e as listas com abas.
//
// Os fatos vêm de UMA fonte (useBolsaDoDia → server/api/bolsa-do-dia), no
// SSR; as frases, de utils/bolsaDoDia.ts, com o relógio da B3 recalculado no
// cliente a cada minuto (a página sai da borda com a hora de quem a cacheou).
// Com a bolsa aberta e a aba à vista, os fatos se atualizam a cada minuto.
import { textosDaBolsa } from '~/utils/bolsaDoDia'
import { estadoDoPregao, horaDoFechamento } from '~/utils/pregao'
import { rodapeSemAssinatura } from '~/utils/newsletter-lugares'

// o briefing registra o onMounted dele: vem antes de qualquer await (é o texto
// inteiro do fechamento, para a janela)
const { briefing, real: briefingReal } = useNuBriefing()

// a hora vai no estado: a hidratação herda a do servidor e o cliente acerta ao montar
const agora = useState('home:bolsa-agora', () => Date.now())
let relogio: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  agora.value = Date.now()
  // a busca do servidor falhou (o esqueleto está na tela): o navegador tenta de novo
  if (!bolsa.value?.ibov) setTimeout(() => { void refresh() }, 1500)
  relogio = setInterval(() => {
    agora.value = Date.now()
    if (estado.value === 'aberta' && document.visibilityState === 'visible') void refresh()
  }, 60_000)
})
onBeforeUnmount(() => { if (relogio) clearInterval(relogio) })

const { bolsa, refresh } = await useBolsaDoDia()
const estado = computed(() => estadoDoPregao(new Date(agora.value)).estado)
const t = computed(() => (bolsa.value ? textosDaBolsa(bolsa.value, estado.value, new Date(agora.value)) : null))

// o trilho da linha termina no fechamento do dia do número (17h ou 18h)
const fechaAs = computed(() => (bolsa.value?.ibov ? horaDoFechamento(bolsa.value.ibov.data) : 17))
const pesos = computed(() => (bolsa.value?.pesos?.confere ? bolsa.value.pesos : null))

// o fechamento inteiro na janela, com "A leitura" primeiro (até a página
// própria de cada fechamento, a segunda leva)
const blocos = computed(() => {
  if (!briefingReal.value) return []
  const topicos = dayTopicsFromNuBriefing(briefing.value).filter((x) => x.real)
  const leitura = topicos.filter((x) => x.icon === 'compass')
  return [...leitura, ...topicos.filter((x) => x.icon !== 'compass')].map((x) => ({ label: x.label, color: x.labelColor, html: x.modalHtml }))
})
const aberto = ref(false)
const gatilho = ref<HTMLButtonElement | null>(null)
function abrir() {
  aberto.value = true
  evento('fechamento')
}
function fechar() {
  aberto.value = false
  nextTick(() => gatilho.value?.focus())
}

// "Receber por e-mail": a newsletter do rodapé (O mercado da semana, toda
// sexta), só quando ela está ligada e aparece nesta página. O diário entra
// quando o envio diário for ligado no servidor (decisão do dono, 31/10/2026).
const receber = useRuntimeConfig().public.newsletterLigada === true && !rodapeSemAssinatura('/')
function irParaNewsletter(e: MouseEvent) {
  const alvo = document.getElementById('newsletter')
  evento('receber')
  if (!alvo) return
  e.preventDefault()
  alvo.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' })
  alvo.querySelector<HTMLInputElement>('input[type="email"]')?.focus({ preventScroll: true })
}

/** Os cliques da seção no GA4 (o gtag só existe depois do aceite de cookies). */
function evento(alvo: 'asset' | 'tese' | 'fechamento' | 'receber' | 'conectar') {
  if (import.meta.server) return
  ;(window as any).gtag?.('event', 'home_bolsa_clique', { alvo })
}
</script>

<template>
  <section class="hbo" aria-labelledby="hbo-titulo">
    <template v-if="t && bolsa">
      <p class="hbo__sobre" :class="{ 'hbo__sobre--vivo': t.aoVivo }">{{ t.sobrelinha }}</p>
      <h2 id="hbo-titulo" class="hbo__cabeca">
        <span class="hbo__linha"><span class="hbo__numero">{{ t.numero }}</span> <span class="hbo__legenda">{{ t.legenda }}</span></span>
        <span class="hbo__titulo">{{ t.titulo }}</span>
      </h2>

      <!-- os dois desenhos: a linha do pregão e quem mexeu no índice; os links
           ficam embaixo da linha, que é mais baixa que as barras -->
      <div class="hbo__desenhos" :class="{ 'hbo__desenhos--um': !pesos }">
        <HomeBolsaLinha class="hbo__area-linha" :intradia="bolsa.intradia" :diarias="bolsa.diarias" :fecha-as="fechaAs" />
        <HomeBolsaMercado v-if="pesos && bolsa.acoes.length" class="hbo__area-pesos" :acoes="bolsa.acoes" :pesos="pesos" :contagem="bolsa.contagem" :ao-vivo="t.aoVivo" @clique="evento('asset')" />
        <div v-if="t.leitura || (t.linkFechamento && blocos.length) || receber || t.aviso" class="hbo__area-links">
          <!-- o fecho: de tudo o que a Redentia leu, uma frase -->
          <figure v-if="t.leitura" class="hbo__leitura">
            <figcaption class="hbo__leitura-rotulo">A leitura da IA</figcaption>
            <blockquote class="hbo__citacao"><p>“{{ t.leitura.texto }}”</p></blockquote>
            <p class="hbo__assina">{{ t.leitura.assinatura }}</p>
          </figure>
          <div class="hbo__links">
          <p v-if="t.aviso" class="hbo__aviso">{{ t.aviso }}</p>
          <button v-if="t.linkFechamento && blocos.length" ref="gatilho" type="button" class="hbo__link" aria-haspopup="dialog" @click="abrir">
            {{ t.linkFechamento }}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
          <a v-if="receber" href="#newsletter" class="hbo__link" @click="irParaNewsletter">
            Receber toda sexta por e-mail<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
          </div>
        </div>
      </div>

      <!-- a ponte: a mesma linha que a Redentia escreve para quem conectou a carteira -->
      <div class="hbo__ponte">
        <dl class="hbo__placar">
          <div class="hbo__par"><dt>{{ t.ponte.rotulo }}</dt><dd>{{ t.ponte.valor }}</dd></div>
          <div class="hbo__par"><dt>Você</dt><dd class="hbo__voce" aria-label="Você: sem carteira conectada">—</dd></div>
        </dl>
        <NuxtLink to="/assinar" class="hbo__conectar" @click="evento('conectar')">
          Conectar carteira<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </NuxtLink>
        <p class="hbo__frase">{{ t.ponte.frase }}</p>
      </div>
    </template>

    <!-- só quando a busca no servidor falhou: a forma do conteúdo, em creme -->
    <template v-else>
      <h2 id="hbo-titulo" class="hbo__sr">A bolsa hoje</h2>
      <div class="hbo__esqueleto" aria-hidden="true">
        <NuSkeleton variant="line" width="260px" height="19px" radius="chip" />
        <NuSkeleton variant="block" width="min(420px, 90%)" height="62px" radius="tile" />
        <NuSkeleton variant="line" width="min(420px, 80%)" height="32px" radius="chip" />
        <NuSkeleton variant="text" :lines="2" last-width="70%" class="hbo__esq-texto" />
        <NuSkeleton variant="text" :lines="3" last-width="55%" class="hbo__esq-texto" />
      </div>
    </template>

    <NuDayModal
      :open="aberto"
      eyebrow="Fechamento · IA da Redentia"
      title="O dia no mercado"
      :date-line="briefing.metaLine"
      :blocks="blocos"
      @close="fechar"
    />
  </section>
</template>

<style scoped>
/* creme, como a página: o escuro fica para os aparelhos do herói */
.hbo { background: var(--nu-cream); padding: clamp(56px, 6.7vw, 96px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.hbo__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.hbo__sobre { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-eyebrow); font-weight: 700; font-variant-numeric: tabular-nums; }
.hbo__sobre--vivo { color: var(--nu-green-text); }
.hbo__sobre--vivo::before { content: '●'; margin-right: 8px; }

/* o número, a legenda e o título são um h2 só */
.hbo__cabeca { margin: 14px 0 0; display: flex; flex-direction: column; gap: 6px; font-weight: 800; }
.hbo__linha { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; }
.hbo__numero { color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1; font-variant-numeric: tabular-nums; }
.hbo__legenda { color: var(--nu-gray); font-size: var(--nu-fs-xl); font-weight: 700; }
.hbo__titulo { color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: 700; letter-spacing: -0.02em; line-height: 1.2; }

/* os dois desenhos lado a lado (a linha um pouco maior) e os links embaixo da linha */
.hbo__desenhos {
  margin-top: 32px; display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  grid-template-areas: 'linha pesos' 'links pesos'; grid-template-rows: auto 1fr; gap: 20px clamp(40px, 5vw, 72px); align-items: start;
}
.hbo__desenhos--um { grid-template-columns: minmax(0, 1fr); grid-template-areas: 'linha' 'links'; }
.hbo__area-linha { grid-area: linha; }
.hbo__area-pesos { grid-area: pesos; }
.hbo__area-links { grid-area: links; }

/* a leitura da IA: o fecho do que a Redentia leu */
.hbo__leitura { margin: 4px 0 8px; padding-left: 18px; border-left: 2px solid var(--nu-ink); }
.hbo__leitura-rotulo { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.hbo__citacao { margin: 8px 0 0; }
.hbo__citacao p { margin: 0; max-width: 56ch; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 500; line-height: 1.5; text-wrap: pretty; }
.hbo__assina { margin: 10px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700; }

/* os links do fechamento da IA e da newsletter, numa fila */
.hbo__links { display: flex; align-items: center; gap: 4px 28px; flex-wrap: wrap; }
.hbo__aviso { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; }
.hbo__link {
  display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0; border: 0; background: none; cursor: pointer;
  color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-md); font-weight: 700;
}
.hbo__link:hover { color: var(--nu-blue-hover); }
.hbo__link:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 4px; }
.hbo__link svg, .hbo__conectar svg { flex: none; transition: transform .2s ease; }
.hbo__link:hover svg, .hbo__conectar:hover svg { transform: translateX(3px); }

/* a ponte */
.hbo__ponte {
  margin-top: 48px; padding-top: 28px; border-top: 1px solid var(--nu-cream-line);
  display: grid; grid-template-columns: auto 1fr auto; grid-template-areas: 'placar frase conectar'; align-items: center; gap: 16px 40px;
}
.hbo__placar { grid-area: placar; margin: 0; display: flex; gap: 40px; }
.hbo__par { display: flex; flex-direction: column; gap: 4px; }
.hbo__par dt { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .06em; text-transform: uppercase; white-space: nowrap; }
.hbo__par dd { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.hbo__voce { color: var(--nu-sand) !important; }
.hbo__frase { grid-area: frase; margin: 0; max-width: 60ch; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; text-wrap: pretty; }
.hbo__conectar {
  grid-area: conectar; display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 52px; padding: 0 26px;
  border-radius: var(--nu-r-pill); background: var(--nu-blue); color: var(--nu-white);
  font-size: var(--nu-fs-md); font-weight: 700; white-space: nowrap; box-shadow: var(--nu-home-sombra-botao);
  transition: background .2s ease;
}
.hbo__conectar:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.hbo__conectar:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 4px; }

.hbo__esqueleto { display: flex; flex-direction: column; gap: 16px; }
.hbo__esq-texto { max-width: 560px; }

/* uma coluna até 1023 px: a linha em cima, as barras embaixo */
@media (max-width: 1023px) {
  .hbo__desenhos { grid-template-columns: minmax(0, 1fr); grid-template-areas: 'linha' 'pesos' 'links'; grid-template-rows: none; gap: 32px; }
  .hbo__ponte { grid-template-columns: auto 1fr; grid-template-areas: 'placar conectar' 'frase frase'; }
  .hbo__conectar { justify-self: end; }
}
@media (max-width: 560px) {
  .hbo__citacao p { font-size: var(--nu-fs-lg); }
  .hbo__linha { gap: 10px; }
  .hbo__titulo { font-size: var(--nu-fs-2xl); }
  .hbo__links { gap: 0 20px; }
  .hbo__ponte { margin-top: 32px; grid-template-columns: minmax(0, 1fr); grid-template-areas: 'placar' 'conectar' 'frase'; }
  .hbo__placar { gap: 28px; }
  .hbo__conectar { justify-self: stretch; }
}
@media (prefers-reduced-motion: reduce) {
  .hbo { animation: none; }
  .hbo__link svg, .hbo__conectar svg { transition: none; }
}
</style>
