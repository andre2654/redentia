<script setup lang="ts">
/**
 * Página de erro (404, 410 e afins) — dentro do chrome normal do site
 * (NuxtLayout dá header + ticker "Mercado agora" + footer). O conceito é
 * um ativo que despencou no pregão: o número gigante e a linha vermelha de
 * queda vivem no MESMO SVG, então escalam juntos e nunca dão overflow. A
 * linha desenha a si mesma no load. Copy sem travessão (vírgula).
 *
 * Robustez (11/11/2026): uma ação principal (NuBotaoSeta) e a segunda em
 * NuLinkSeta; o ponto vermelho pousa sem quicar; tempos e curvas dos tokens.
 *
 * Os três casos têm copy PRÓPRIA porque dizem coisas diferentes:
 *  - 404: nunca existiu (ou o link quebrou);
 *  - 410: existiu e saiu da B3 (papel deslistado — /asset e /dividendos dos 372
 *    marcados em 18/09/2026). Aqui NÃO se oferece "tente de novo": o dado não
 *    volta, e o convite certo é ranking ou busca;
 *  - resto: o nosso lado caiu e volta.
 */
const props = defineProps<{
  error?: {
    statusCode?: number
    statusMessage?: string
    message?: string
    /** 410 do /asset e do /dividendos: delistedError() manda ticker e data. */
    data?: { ticker?: string, delistedAt?: string | null }
  }
}>()

const code = computed(() => props.error?.statusCode ?? 404)
const isNotFound = computed(() => code.value === 404)
const isGone = computed(() => code.value === 410)

/** Ticker do 410: vem no `data`; a frase do statusMessage é o plano B. */
const goneTicker = computed(() => {
  const fromData = props.error?.data?.ticker
  if (fromData) return fromData.toUpperCase()
  const frase = props.error?.statusMessage || props.error?.message || ''
  return /^([A-Z][A-Z0-9]{3}\d{1,2})\b/.exec(frase)?.[1] ?? ''
})
const goneDate = computed(() => delistedDateLabel(props.error?.data?.delistedAt))

const title = computed(() => {
  if (isGone.value) return goneTicker.value ? `${goneTicker.value} saiu da B3.` : 'Esse ativo saiu da B3.'
  return isNotFound.value ? 'Essa página saiu do pregão.' : 'O pregão travou por um instante.'
})
const dek = computed(() => {
  if (isGone.value) {
    const quem = goneTicker.value || 'Esse papel'
    const quando = goneDate.value ? ` em ${goneDate.value}` : ''
    // Sem "tente de novo" de propósito: a página saiu porque o ativo saiu.
    return `${quem} foi deslistado da B3${quando}, então a página com cotação, fundamentos e proventos saiu do ar junto. Não é falha nossa, o dado parou de existir. O resto do mercado segue de pé.`
  }
  return isNotFound.value
    ? 'O link que você seguiu despencou 100% e não existe mais, ou nunca abriu capital. Mas o resto do mercado segue de pé.'
    : 'Algo do nosso lado saiu do ar por um instante. O resto do mercado segue de pé, é só voltar e tentar de novo.'
})

// noindex SÓ quando o erro saiu do SERVIDOR e é 4xx (404/410, veredito sobre a
// URL, com o status HTTP certo junto). Dois casos ficam sem, de propósito:
//  - 5xx: é transitório. O status já basta pro Google não indexar e voltar
//    depois; um noindex ali é o que sobra se algo no caminho servir a página
//    como 200.
//  - erro nascido no CLIENT (chunk JS que não carregou, exceção na hidratação):
//    o HTTP já saiu 200 com a página inteira, e o Nuxt troca o DOM pela página
//    de erro. Com noindex, o renderizador do Google (que lê o DOM final)
//    registrava "Excluída pela tag noindex" numa página saudável. Reproduzido em
//    23/09/2026 bloqueando o chunk do /glossario/[slug]: 200 sem robots no HTML,
//    "noindex, follow" no DOM 426 ms depois.
// A marca de "veio do servidor" viaja no payload: o useState só nasce true no
// SSR. Erro criado no client não acha a chave e inicia false. Ao sair da página
// de erro (clearError), a marca cai, e um erro seguinte no client não herda.
const renderedOnServer = useState('nu:erro-ssr', () => import.meta.server)
onBeforeUnmount(() => { renderedOnServer.value = false })

useHead({
  title: isGone.value
    ? (goneTicker.value ? `${goneTicker.value} foi deslistado da B3` : 'Ativo deslistado da B3')
    : isNotFound.value ? 'Página não encontrada' : 'Erro',
  meta: computed(() => (renderedOnServer.value && code.value < 500
    ? [{ name: 'robots', content: 'noindex, follow' }]
    : [])),
})

// clearError zera o estado de erro antes de navegar (padrão Nuxt).
const goHome = () => clearError({ redirect: '/' })
const goSearch = () => clearError({ redirect: '/busca' })
// 410: quem chegou aqui queria UM ativo, então o convite primário é a lista de
// ativos vivos (rankings), não a home.
const goRankings = () => clearError({ redirect: '/rankings' })
</script>

<template>
  <NuxtLayout>
    <section class="nf">
      <div class="nf__wrap">
        <!-- Hero: número + gráfico de queda no MESMO SVG (escalam juntos). -->
        <svg class="nf__svg" viewBox="0 0 1000 440" fill="none" role="img" :aria-label="`Erro ${code}`">
          <defs>
            <!-- as cores vêm dos tokens (classes nf__stop-*), não de hex no SVG -->
            <linearGradient id="nfNum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" class="nf__stop-num-1" />
              <stop offset="1" class="nf__stop-num-2" />
            </linearGradient>
            <linearGradient id="nfFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" class="nf__stop-queda" stop-opacity="0.16" />
              <stop offset="1" class="nf__stop-queda" stop-opacity="0" />
            </linearGradient>
          </defs>

          <text class="nf__num" x="500" y="316" text-anchor="middle" fill="url(#nfNum)">{{ code }}</text>

          <path
            class="nf__area"
            d="M50,190 L200,100 L320,175 L430,85 L540,192 L620,135 L740,242 L830,214 L912,318 L960,390 L960,440 L50,440 Z"
            fill="url(#nfFill)"
          />
          <path
            class="nf__line"
            pathLength="1"
            d="M50,190 L200,100 L320,175 L430,85 L540,192 L620,135 L740,242 L830,214 L912,318 L960,390"
            stroke-width="9"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
          <circle class="nf__ping" cx="960" cy="390" r="13" fill="none" stroke-width="3" />
          <circle class="nf__dot" cx="960" cy="390" r="13" />
        </svg>

        <NuEyebrow class="nf__eyebrow">{{ isGone ? 'Ativo deslistado' : isNotFound ? 'Página não encontrada' : 'Erro do nosso lado' }}</NuEyebrow>
        <h1 class="nf__title">{{ title }}</h1>
        <p class="nf__dek">{{ dek }}</p>

        <div class="nf__actions">
          <template v-if="isGone">
            <NuBotaoSeta tamanho="m" @click="goRankings">Ver os rankings da B3</NuBotaoSeta>
            <NuLinkSeta tom="tinta" class="nf__link" @click="goSearch">Buscar outro ativo</NuLinkSeta>
          </template>
          <template v-else>
            <NuBotaoSeta tamanho="m" @click="goHome">Voltar para o início</NuBotaoSeta>
            <NuLinkSeta tom="tinta" class="nf__link" @click="goSearch">Buscar um ativo</NuLinkSeta>
          </template>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<style scoped>
.nf {
  background: var(--nu-page);
  min-height: 66vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(32px, 5vh, 72px) clamp(20px, 5vw, 40px) clamp(56px, 9vh, 110px);
}
.nf__wrap {
  width: 100%;
  max-width: 680px;
  text-align: center;
  animation: nu-fade-lg var(--nu-dur-entrada) var(--nu-ease-saida) both;
}

/* hero SVG: escala pra largura do wrap, sem overflow em nenhuma tela */
/* 540px de teto: o número não empurra o título e os dois botões para fora da primeira dobra */
.nf__svg {
  display: block;
  width: 100%;
  max-width: 540px;
  height: auto;
  overflow: visible;
  margin: 0 auto clamp(10px, 2.5vw, 22px);
}
.nf__num {
  font-family: var(--nu-font);
  font-weight: var(--nu-w-display);
  font-size: 372px;
  letter-spacing: -22px;
}
.nf__line {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: nf-draw calc(var(--nu-dur-entrada) * 2) var(--nu-ease-troca) 160ms forwards;
  stroke: var(--nu-red);
  filter: drop-shadow(0 6px 14px color-mix(in srgb, var(--nu-red) 30%, transparent));
}
.nf__stop-num-1 { stop-color: var(--nu-gray-3); }
.nf__stop-num-2 { stop-color: var(--nu-ink); }
.nf__stop-queda { stop-color: var(--nu-red); }
.nf__area {
  opacity: 0;
  animation: nf-in var(--nu-dur-entrada) var(--nu-ease-cor) 520ms forwards;
}
.nf__dot {
  fill: var(--nu-red);
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  animation: nf-pop var(--nu-dur-lenta) var(--nu-ease-saida) 1360ms forwards;
}
.nf__ping {
  stroke: var(--nu-red);
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  /* três ondas e para: nada de animação sem fim fora do anel e do esqueleto */
  animation: nf-ping calc(var(--nu-dur-entrada) * 2.4) var(--nu-ease-saida) 1760ms 3;
}
@keyframes nf-draw { to { stroke-dashoffset: 0; } }
@keyframes nf-in { to { opacity: 1; } }
@keyframes nf-pop { 0% { opacity: 0; transform: scale(0.4); } 100% { opacity: 1; transform: scale(1); } }
@keyframes nf-ping { 0% { opacity: 0.5; transform: scale(0.5); } 70%, 100% { opacity: 0; transform: scale(2.6); } }

.nf__eyebrow { justify-content: center; margin-bottom: 16px; }
.nf__title {
  font-size: clamp(30px, 5vw, 48px);
  font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-display);
  line-height: 1.04;
  color: var(--nu-ink);
  margin: 0 auto;
  max-width: 17ch;
  text-wrap: balance;
}
.nf__dek {
  font-size: clamp(15px, 2.3vw, 18px);
  line-height: 1.55;
  color: var(--nu-gray-3);
  font-weight: var(--nu-w-texto);
  letter-spacing: var(--nu-ls-texto);
  margin: 16px auto 0;
  max-width: 50ch;
}
/* uma ação principal (a pílula) e, ao lado, a segunda como link com a seta */
.nf__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 32px;
  justify-content: center;
  margin-top: clamp(32px, 4vw, 40px);
}
.nf__link { font-size: 16px; }
/* mobile: a pílula ocupa a largura (padrão de toque) e o link fica embaixo, no centro */
@media (max-width: 520px) {
  .nf__actions { flex-direction: column; align-items: center; }
  .nf__actions :deep(.nbs) { display: flex; align-self: stretch; }
}
@media (prefers-reduced-motion: reduce) {
  .nf__wrap, .nf__area, .nf__dot, .nf__ping { animation: none; }
  .nf__line { animation: none; stroke-dashoffset: 0; }
  .nf__area, .nf__dot { opacity: 1; }
}
</style>
