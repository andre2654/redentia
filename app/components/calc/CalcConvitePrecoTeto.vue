<script setup lang="ts">
// Convite do teste de 2 semanas em /calculadora/preco-teto/{TICKER}, a partir
// de 03/11/2026. Fica se submit/sessões com view ≥ 2% e sem queda de posição
// ou CTR no Search Console. Reverter: apagar a linha CalcConvitePrecoTeto em
// CalcPrecoTetoTicker.vue.
//
// Caminho: o acompanhamento por ticker já existe.
//  - Com o consenso da página, useAlertaPrecoTeto grava o POST /watchlist
//    {ticker, alert_price, alert_source: 'preco-teto'}. O papel entra na
//    lista e o e-mail das 19h avisa no pregão em que o fechamento cruza esse
//    preço (WatchlistDigestComposer).
//  - Sem consenso, o clique só segue (POST /watchlist {ticker}), a mesma
//    lista "Seguindo" do /asset. Aí o texto não fala de e-mail.
// Sem folha e sem modal: quem não tem sessão vai ao /login que já existe
// (?alerta= ou ?seguir=1). O caminho e os utm da primeira página da aba
// não são reescritos; o login já manda o header.
//
// O bloco nasce no HTML, junto do resultado. Sem lazy: um pedaço que entra
// depois empurraria a tabela. Sem script novo. A view usa IntersectionObserver
// e o portão de consentimento de utils/preco-teto-convite.ts.
import { aoAceitar, lerConsentimento } from '~/utils/consent'
import {
  EVENTO_SUBMIT_CONVITE_PRECO_TETO,
  LEGAL_CONVITE_PRECO_TETO,
  LEGAL_EMAIL_CONVITE_PRECO_TETO,
  TITULO_CONVITE_PRECO_TETO,
  confirmacaoListaConvite,
  corpoConvitePrecoTeto,
  dispararEventoConvitePrecoTeto,
  normalizarTickerConvite,
  rotuloBotaoConvitePrecoTeto,
  rotuloJaSegueConvite,
  viewConviteSeCouber,
} from '~/utils/preco-teto-convite'

const props = defineProps<{
  ticker: string
  /** consenso da página; null ou ≤ 0 = só a lista, sem preço de referência */
  alvo?: number | null
}>()

const route = useRoute()
const papel = computed(() => normalizarTickerConvite(props.ticker))
const temAlvo = computed(() => typeof props.alvo === 'number' && Number.isFinite(props.alvo) && props.alvo > 0)
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const alvoFmt = computed(() => (temAlvo.value ? brl.format(props.alvo as number) : null))
const corpo = computed(() => (papel.value ? corpoConvitePrecoTeto(papel.value, temAlvo.value ? alvoFmt.value : null) : ''))

const {
  pending: alertaPendente,
  criar,
  criado,
  confirmacao,
  erro: erroAlerta,
  etapa,
  emailPendente,
  enviando,
  erroEntrega,
  pedirCodigo,
  confirmarCodigo,
  ligarResumo,
} = useAlertaPrecoTeto(() => papel.value ?? '', () => (temAlvo.value ? (props.alvo as number) : null))

const wl = useWatchlist()
const { isAuthenticated } = useAuthState()
const { following, pending: seguirPendente } = useSeguirAtivo(() => papel.value ?? '', () => route.path)

const emailAlerta = ref('')
const codigo = ref('')
const erroLista = ref('')
const seguiuAgora = ref(false)
const travado = ref(false)

const confirmado = computed(() => !!criado.value && criado.value.ticker === papel.value)
const entrega = computed(() => criado.value?.entrega ?? null)
const ocupado = computed(() => travado.value || alertaPendente.value || seguirPendente.value || enviando.value)
const legal = computed(() => (confirmado.value && entrega.value === 'sem-email'
  ? LEGAL_EMAIL_CONVITE_PRECO_TETO
  : LEGAL_CONVITE_PRECO_TETO))
const rotulo = computed(() => {
  if (!papel.value) return ''
  if (ocupado.value) return 'Acompanhando…'
  if (!temAlvo.value && following.value) return rotuloJaSegueConvite(papel.value)
  return rotuloBotaoConvitePrecoTeto(papel.value)
})

const raiz = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null
let espera: ReturnType<typeof setTimeout> | undefined
let vivo = true
let tentativas = 0
let visivel = false

function tentarView() {
  if (!vivo || !visivel || !papel.value) return
  clearTimeout(espera)
  const r = viewConviteSeCouber(papel.value)
  if (r !== 'recusado') {
    io?.disconnect()
    return
  }
  // Consentimento já dado e a medição ainda no idle do plugin: tenta de novo.
  // Sem aceite, espera o aoAceitar. Não marca o ticker até o envio.
  if (lerConsentimento() !== 'granted') return
  if (tentativas >= 20) return
  tentativas += 1
  espera = setTimeout(tentarView, 400)
}

onMounted(() => {
  aoAceitar(tentarView)
  const el = raiz.value
  if (!el || typeof IntersectionObserver === 'undefined') return
  io = new IntersectionObserver((entries) => {
    visivel = entries.some((e) => e.isIntersecting)
    if (visivel) tentarView()
  }, { threshold: 0.5 })
  io.observe(el)
})

onBeforeUnmount(() => {
  vivo = false
  clearTimeout(espera)
  io?.disconnect()
})

function destinoLogin(query: string) {
  return navigateTo(`/login?redirect=${encodeURIComponent(`${route.path}?${query}`)}`)
}

async function enviar() {
  if (!papel.value || travado.value || ocupado.value) return
  if (!temAlvo.value && following.value) return
  travado.value = true
  erroLista.value = ''
  dispararEventoConvitePrecoTeto(EVENTO_SUBMIT_CONVITE_PRECO_TETO, papel.value)
  try {
    if (temAlvo.value) {
      await criar()
      return
    }
    if (!isAuthenticated.value) {
      await destinoLogin('seguir=1')
      return
    }
    const res = await wl.follow(papel.value)
    if (res.ok) seguiuAgora.value = true
    else if (res.auth) await destinoLogin('seguir=1')
    else erroLista.value = res.message
  }
  finally {
    travado.value = false
  }
}
</script>

<template>
  <section v-if="papel" ref="raiz" class="ptc" aria-label="Acompanhar este ticker">
    <p class="ptc__titulo">{{ TITULO_CONVITE_PRECO_TETO }}</p>
    <p class="ptc__texto">{{ corpo }}</p>
    <p class="ptc__legal">{{ legal }} <NuxtLink to="/institucional/privacy">Política de privacidade</NuxtLink>.</p>

    <p v-if="confirmado && confirmacao" class="ptc__status" role="status">{{ confirmacao }}</p>
    <p v-else-if="seguiuAgora" class="ptc__status" role="status">{{ confirmacaoListaConvite(papel) }}</p>

    <template v-if="confirmado && entrega === 'sem-email'">
      <form v-if="etapa === 'email'" class="ptc__linha" @submit.prevent="pedirCodigo(emailAlerta)">
        <input v-model="emailAlerta" type="email" required autocomplete="email" inputmode="email" placeholder="seu@email.com" aria-label="Seu e-mail" class="ptc__input">
        <button type="submit" class="ptc__btn" :disabled="enviando">{{ enviando ? 'Enviando…' : 'Enviar código' }}</button>
      </form>
      <form v-else class="ptc__linha" @submit.prevent="confirmarCodigo(codigo)">
        <p class="ptc__texto ptc__texto--cheio">Mandamos um código para {{ emailPendente }}. Ele vale 10 minutos.</p>
        <input v-model="codigo" type="text" required inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="Código de 6 dígitos" aria-label="Código" class="ptc__input">
        <button type="submit" class="ptc__btn" :disabled="enviando">{{ enviando ? 'Confirmando…' : 'Confirmar' }}</button>
      </form>
    </template>

    <button
      v-else-if="confirmado && entrega === 'desligado'"
      type="button"
      class="ptc__btn ptc__btn--acao"
      :disabled="enviando"
      @click="ligarResumo()"
    >
      {{ enviando ? 'Ligando…' : 'Ligar o resumo por e-mail' }}
    </button>

    <button
      v-else-if="!confirmado && !seguiuAgora"
      type="button"
      class="ptc__btn ptc__btn--acao"
      :disabled="ocupado || (!temAlvo && following)"
      :aria-busy="ocupado || undefined"
      @click="enviar"
    >
      {{ rotulo }}
    </button>

    <p v-if="erroAlerta || erroEntrega || erroLista" class="ptc__erro" role="alert">{{ erroAlerta || erroEntrega || erroLista }}</p>
  </section>
</template>

<style scoped>
.ptc {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  margin-top: 28px;
  max-width: 640px;
  padding: 18px 20px;
  background: var(--nu-cream);
  color: var(--nu-navy);
  border-radius: var(--nu-r-card);
  font-family: var(--nu-font);
}
.ptc__titulo,
.ptc__texto,
.ptc__status,
.ptc__legal,
.ptc__erro {
  margin: 0;
  overflow-wrap: break-word;
}
.ptc__titulo {
  color: var(--nu-navy);
  font-size: var(--nu-fs-lg);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.3;
}
.ptc__texto,
.ptc__status {
  color: var(--nu-gray-3);
  font-size: var(--nu-fs-sm);
  font-weight: 500;
  line-height: 1.5;
}
.ptc__status { color: var(--nu-navy); font-weight: 700; }
.ptc__texto--cheio { flex: 1 1 100%; }
.ptc__btn {
  align-self: stretch;
  width: 100%;
  min-height: 44px;
  margin: 0;
  padding: 12px 20px;
  border: none;
  border-radius: var(--nu-r-pill);
  background: var(--nu-blue);
  color: var(--nu-white);
  font-family: inherit;
  font-size: var(--nu-fs-sm);
  font-weight: 800;
  line-height: 1.2;
  cursor: pointer;
}
.ptc__btn:hover { background: var(--nu-blue-hover); }
.ptc__btn:disabled { opacity: 0.6; cursor: default; }
.ptc__btn:focus-visible,
.ptc__input:focus-visible {
  outline: 2px solid var(--nu-blue);
  outline-offset: 2px;
}
.ptc__linha {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ptc__input {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 10px 16px;
  border: 1px solid var(--nu-cream-line);
  border-radius: var(--nu-r-pill);
  background: var(--nu-white);
  color: var(--nu-navy);
  font-family: inherit;
  font-size: var(--nu-fs-md);
  font-weight: 500;
}
.ptc__legal {
  color: var(--nu-gray-2);
  font-size: var(--nu-fs-xs);
  font-weight: 500;
  line-height: 1.45;
}
.ptc__legal a {
  color: var(--nu-blue-text);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.ptc__legal a:hover { color: var(--nu-blue-text); }
.ptc__erro {
  color: var(--nu-navy);
  font-size: var(--nu-fs-sm);
  font-weight: 700;
  line-height: 1.45;
}
@media (min-width: 760px) {
  .ptc__btn--acao { align-self: flex-start; width: auto; }
  .ptc__linha { flex-direction: row; align-items: center; }
  .ptc__linha .ptc__input { flex: 1 1 auto; }
  .ptc__linha .ptc__btn { width: auto; align-self: auto; }
}
</style>
