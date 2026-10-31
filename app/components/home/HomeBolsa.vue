<script setup lang="ts">
// A bolsa do dia na home do visitante: "O fechamento" (31/10/2026). O dono
// pediu para repensar a seção com o mesmo cuidado do topo de quem assina; a
// forma saiu de uma conversa entre um investidor do público, uma especialista
// de produto da Apple e uma de UX, e o dono aprovou:
//  - uma história por dia, só tipografia, no creme (o escuro fica para os
//    aparelhos do herói): a sobrelinha com a data, o Ibovespa como herói, o
//    título específico ("Quinta queda seguida."), o mês, quem mexeu no índice
//    em pontos (só blue chip, pelo peso), a contagem, a tese dos que mexeram;
//  - à direita, "A leitura" da IA, assinada, e os links do fechamento inteiro
//    e da newsletter;
//  - embaixo, a ponte: "Bolsa −0,75% · Você —" e o "Conectar carteira".
// Saíram o azul-marinho, as pílulas (a faixa "Mercado agora" do topo já
// mostra), os quatro cartões com ícone, o botão do resumo que parecia
// desligado, o convite com WhatsApp e as listas de altas e baixas com abas.
//
// Os fatos vêm de UMA fonte (useBolsaDoDia → server/api/bolsa-do-dia), no
// SSR; as frases, de utils/bolsaDoDia.ts, com o relógio da B3 recalculado no
// cliente a cada minuto (a página sai da borda com a hora de quem a cacheou).
// Com a bolsa aberta e a aba à vista, os fatos se atualizam a cada minuto.
import { textosDaBolsa, type CausaDaBolsa } from '~/utils/bolsaDoDia'
import { estadoDoPregao } from '~/utils/pregao'
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

// a causa em pedaços: os nomes viram links para a página do ativo
type Pedaco = { texto: string } | { nome: string; ticker: string }
function pedacos(c: CausaDaBolsa): Pedaco[] {
  const out: Pedaco[] = [{ texto: `${c.prefixo} ` }]
  c.fizeram.forEach((e, i) => {
    out.push({ nome: e.nome, ticker: e.ticker }, { texto: `, ${e.pontos}${i < c.fizeram.length - 1 ? '; ' : '.'}` })
  })
  if (c.contra.length) {
    c.contra.forEach((e, i) => {
      out.push({ texto: i === 0 ? ' ' : ' e ' }, { nome: e.nome, ticker: e.ticker }, { texto: ` (${e.pontos})` })
    })
    out.push({ texto: ` ${c.fechoContra}` })
  }
  return out
}
const causa = computed(() => (t.value?.causa ? pedacos(t.value.causa) : []))

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
    <template v-if="t">
      <p class="hbo__sobre" :class="{ 'hbo__sobre--vivo': t.aoVivo }">{{ t.sobrelinha }}</p>
      <h2 id="hbo-titulo" class="hbo__cabeca">
        <span class="hbo__linha"><span class="hbo__numero">{{ t.numero }}</span> <span class="hbo__legenda">{{ t.legenda }}</span></span>
        <span class="hbo__titulo">{{ t.titulo }}</span>
      </h2>

      <div class="hbo__corpo" :class="{ 'hbo__corpo--so-texto': !t.leitura && !t.aviso && !t.linkFechamento && !receber }">
        <div class="hbo__texto">
          <p v-if="t.apoio" class="hbo__apoio">{{ t.apoio }}</p>
          <p v-if="causa.length" class="hbo__causa"><template v-for="(p, i) in causa" :key="i"><NuxtLink v-if="'ticker' in p" :to="`/asset/${p.ticker}`" class="hbo__empresa" @click="evento('asset')">{{ p.nome }}</NuxtLink><template v-else>{{ p.texto }}</template></template></p>
          <p v-if="t.contagem" class="hbo__contagem">{{ t.contagem }}</p>
          <NuxtLink v-if="t.tese" :to="`/tese/${t.tese.slug}`" class="hbo__tese" @click="evento('tese')">
            {{ t.tese.texto }}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </NuxtLink>
        </div>

        <aside v-if="t.leitura || t.aviso || t.linkFechamento || receber" class="hbo__lado" aria-label="O fechamento da IA">
          <figure v-if="t.leitura" class="hbo__leitura">
            <blockquote class="hbo__citacao"><p>“{{ t.leitura.texto }}”</p></blockquote>
            <figcaption class="hbo__assina">{{ t.leitura.assinatura }}</figcaption>
          </figure>
          <p v-else-if="t.aviso" class="hbo__aviso">{{ t.aviso }}</p>
          <div class="hbo__links">
            <button v-if="t.linkFechamento && blocos.length" ref="gatilho" type="button" class="hbo__link" aria-haspopup="dialog" @click="abrir">
              {{ t.linkFechamento }}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
            <a v-if="receber" href="#newsletter" class="hbo__link" @click="irParaNewsletter">
              Receber toda sexta por e-mail<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          </div>
        </aside>
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

/* o corpo: o texto em 7 colunas, a leitura da IA em 4 */
.hbo__corpo { margin-top: 28px; display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 4fr); gap: 24px clamp(48px, 7vw, 108px); align-items: start; }
.hbo__corpo--so-texto { grid-template-columns: minmax(0, 760px); }
.hbo__texto { display: flex; flex-direction: column; gap: 18px; min-width: 0; }
.hbo__apoio, .hbo__causa { margin: 0; max-width: 56ch; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6; font-variant-numeric: tabular-nums; text-wrap: pretty; }
.hbo__empresa {
  color: var(--nu-ink); font-weight: 700; text-decoration: underline; text-decoration-color: var(--nu-ink-30);
  text-decoration-thickness: 1px; text-underline-offset: 3px; transition: text-decoration-color .15s;
}
.hbo__empresa:hover { color: var(--nu-ink); text-decoration-color: var(--nu-ink); }
.hbo__empresa:focus-visible, .hbo__tese:focus-visible, .hbo__link:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 4px; }
.hbo__contagem { margin: -4px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; font-variant-numeric: tabular-nums; }
.hbo__tese {
  align-self: flex-start; display: inline; max-width: 60ch; padding: 10px 0;
  color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700; line-height: 1.5; font-variant-numeric: tabular-nums;
}
/* a seta vai colada à última palavra, mesmo quando a frase quebra */
.hbo__tese svg { display: inline-block; margin-left: 6px; vertical-align: -3px; }
.hbo__tese svg, .hbo__link svg, .hbo__conectar svg { flex: none; transition: transform .2s ease; }
.hbo__tese:hover { color: var(--nu-blue-hover); }
.hbo__tese:hover svg, .hbo__link:hover svg, .hbo__conectar:hover svg { transform: translateX(3px); }

/* a leitura da IA: um fio à esquerda, a citação e a assinatura */
.hbo__lado { border-left: 1px solid var(--nu-cream-line); padding-left: 24px; display: flex; flex-direction: column; gap: 18px; }
.hbo__leitura { margin: 0; }
.hbo__citacao { margin: 0; }
.hbo__citacao p { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 500; line-height: 1.5; text-wrap: pretty; }
.hbo__assina { margin-top: 14px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700; }
.hbo__aviso { margin: 0; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.5; }
.hbo__links { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
.hbo__link {
  display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0; border: 0; background: none; cursor: pointer;
  color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-md); font-weight: 700;
}
.hbo__link:hover { color: var(--nu-blue-hover); }

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

/* uma coluna até 1099 px; a leitura vem depois da tese */
@media (max-width: 1099px) {
  .hbo__corpo { grid-template-columns: minmax(0, 720px); }
  .hbo__lado { border-left: 0; padding-left: 0; padding-top: 24px; border-top: 1px solid var(--nu-cream-line); }
  .hbo__ponte { grid-template-columns: auto 1fr; grid-template-areas: 'placar conectar' 'frase frase'; }
  .hbo__conectar { justify-self: end; }
}
@media (max-width: 560px) {
  .hbo__linha { gap: 10px; }
  .hbo__titulo { font-size: var(--nu-fs-2xl); }
  .hbo__citacao p { font-size: var(--nu-fs-lg); }
  .hbo__ponte { margin-top: 36px; grid-template-columns: minmax(0, 1fr); grid-template-areas: 'placar' 'conectar' 'frase'; }
  .hbo__placar { gap: 28px; }
  .hbo__conectar { justify-self: stretch; }
}
@media (prefers-reduced-motion: reduce) {
  .hbo { animation: none; }
  .hbo__tese svg, .hbo__link svg, .hbo__conectar svg { transition: none; }
}
</style>
