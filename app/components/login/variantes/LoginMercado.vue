<script setup lang="ts">
// PROTÓTIPO 7 do /login (04/11/2026, ?entrar=7 só no dev): "Com o mercado de
// hoje". Antes do formulário, uma faixa compacta com o pregão real do dia: a
// sobrelinha de quando é o número, a frase da bolsa e a linha do Ibovespa
// minuto a minuto, da mesma fonte da home (useBolsaDoDia, que sai no SSR), e
// as cotações do topo (useMercadoDoTopo: esqueleto, depois o dado; sem dado,
// a linha some). Quem entra vê que o produto está vivo. Sem dado nenhum, a
// faixa fica só com a marca: nada de número inventado. O formulário vem logo
// abaixo, já na primeira tela do celular. A lógica é a de pages/login.vue
// (porta); aqui é só a pele.
import type { PortaLogin } from '~/types/loginPorta'
import { DIAS_GRATIS, PRECO_MENSAL, formatarCelular } from '~/utils/assinatura'
import { textosDaBolsa } from '~/utils/bolsaDoDia'
import { estadoDoPregao } from '~/utils/pregao'
import LoginCodigo from '../LoginCodigo.vue'

const props = defineProps<{ porta: PortaLogin }>()
const p = props.porta

// ————— o pregão: a hora vai no estado, a hidratação herda a do servidor —————
const agora = useState('login:mercado-agora', () => Date.now())
const { bolsa } = await useBolsaDoDia()
const textos = computed(() => {
  if (!bolsa.value) return null
  const quando = new Date(agora.value)
  return textosDaBolsa(bolsa.value, estadoDoPregao(quando).estado, quando)
})
const queda = computed(() => (bolsa.value?.ibov?.pct ?? 0) < 0)

// a linha do dia: o pregão minuto a minuto, ou os últimos fechamentos
const VW = 320
const VH = 64
const linha = computed(() => {
  const intra = bolsa.value?.intradia?.pontos ?? []
  const serie = intra.length > 8 ? intra.map(([, v]) => v) : (bolsa.value?.diarias ?? []).map((x) => x.v)
  if (serie.length < 2) return null
  const lo = Math.min(...serie)
  const hi = Math.max(...serie)
  const y = (v: number) => 6 + (1 - (v - lo) / (hi - lo || 1)) * (VH - 12)
  const d = serie.map((v, i) => `${i ? 'L' : 'M'}${((i / (serie.length - 1)) * VW).toFixed(1)},${y(v).toFixed(1)}`).join('')
  return { d, fimY: y(serie[serie.length - 1]!) }
})

const { itens, loading } = useMercadoDoTopo()
const cotacoes = computed(() => itens.value.filter((c) => c.n !== 'IBOV').slice(0, 3))

// ————— o formulário —————
const titulo = computed(() => {
  if (p.step === 'pin') return 'Digite o código.'
  if (p.vemDaAssinatura) return 'Primeiro, a sua conta.'
  return p.isCad ? 'Crie a sua conta.' : 'Entre na Redentia.'
})
const destino = computed(() => (p.isPhone ? p.phone : p.email.trim()))
const campo = ref<HTMLInputElement | null>(null)
function aoDigitar(e: Event) {
  const el = e.target as HTMLInputElement
  if (p.isPhone) {
    const f = formatarCelular(el.value)
    if (el.value !== f) el.value = f
    p.phone = f
  } else {
    p.email = el.value
  }
}
function trocarCanal() {
  p.toggleMethod()
  nextTick(() => campo.value?.focus())
}

const bloco = ref<HTMLElement | null>(null)
useCampoAVista(bloco)
onMounted(() => { agora.value = Date.now() })
</script>

<template>
  <div class="lme" :class="{ 'lme--codigo': p.step === 'pin' }">
    <!-- a faixa do pregão -->
    <section class="lme__pregao" aria-label="O pregão de hoje">
      <div class="lme__linha-topo">
        <NuxtLink to="/" class="lme__marca" aria-label="Redentia, início">
          <img src="/logo-branca.svg" alt="" width="18" height="18">Redentia
        </NuxtLink>
        <span v-if="textos" class="lme__sobre" :class="{ 'lme__sobre--vivo': textos.aoVivo }">{{ textos.sobrelinha }}</span>
      </div>
      <div v-if="textos" class="lme__dia">
        <div class="lme__frase">
          <p class="lme__titulo-dia">{{ textos.titulo }}</p>
          <p class="lme__numero"><b :class="queda ? 'lme__neg' : 'lme__pos'">{{ textos.numero.replace('-', '−') }}</b> {{ textos.legenda }}</p>
        </div>
        <svg v-if="linha" :viewBox="`0 0 ${VW} ${VH}`" preserveAspectRatio="none" class="lme__grafico" :class="queda ? 'lme__grafico--neg' : 'lme__grafico--pos'" aria-hidden="true">
          <path :d="linha.d" class="lme__traco" />
          <circle :cx="VW" :cy="linha.fimY" r="3" class="lme__ponto" />
        </svg>
      </div>
      <div v-if="textos" class="lme__cotacoes">
        <span v-if="loading" class="lme__esqueleto" aria-hidden="true" />
        <NuTopoCotacoes v-else-if="cotacoes.length" :itens="cotacoes" class="lme__ntc" />
      </div>
    </section>

    <!-- o formulário -->
    <main class="lme__form-area">
      <div :key="p.step" class="lme__coluna">
        <template v-if="p.step === 'identifier'">
          <AssinaturaJornada v-if="p.vemDaAssinatura" class="lme__jornada" :passo="1" compacto />
          <h1 class="lme__titulo">{{ titulo }}</h1>
          <form ref="bloco" class="lme__form" novalidate @submit.prevent="p.submitIdentifier()">
            <div class="lme__rotulos">
              <label class="lme__rotulo" for="lme-campo">{{ p.isPhone ? 'Seu celular com DDD' : 'Seu e-mail' }}</label>
              <span v-if="p.whatsappDown && !p.isPhone" class="lme__fora">WhatsApp fora do ar</span>
              <button v-else type="button" class="lme__link" @click="trocarCanal">{{ p.isPhone ? 'Usar e-mail' : 'Usar celular' }}</button>
            </div>
            <input
              id="lme-campo" ref="campo" class="lme__campo" :class="{ 'lme__campo--erro': p.identifierError }" :value="p.isPhone ? p.phone : p.email"
              :type="p.isPhone ? 'tel' : 'email'" :inputmode="p.isPhone ? 'tel' : 'email'" :name="p.isPhone ? 'phone' : 'email'"
              :autocomplete="p.isPhone ? 'tel-national' : 'email'" enterkeyhint="send" autocapitalize="off" autocorrect="off" spellcheck="false"
              :placeholder="p.isPhone ? '(11) 90000-0000' : 'voce@email.com'" :aria-invalid="!!p.identifierError" aria-describedby="lme-nota"
              @input="aoDigitar"
            >
            <p id="lme-nota" class="lme__nota" :class="{ 'lme__nota--erro': p.identifierError, 'lme__nota--aviso': !p.identifierError && p.whatsappDown && p.isPhone }" aria-live="polite">
              <template v-if="p.identifierError">{{ p.identifierError }}</template>
              <template v-else-if="p.whatsappDown && p.isPhone">{{ p.whatsappNotice }}</template>
              <template v-else>{{ p.fieldHelp }}</template>
            </p>
            <button type="submit" class="lme__cta" :class="{ 'lme__cta--indo': p.sending }" :disabled="!p.ready || p.sending">{{ p.mainCta }}</button>
          </form>

          <div class="lme__ou" role="separator"><span>ou</span></div>
          <div class="lme__marcas">
            <LoginAppleButton :disabled="p.googleSubmitting" @credential="p.onAppleCredential" @error="p.googleError = $event" />
            <LoginGoogleButton :disabled="p.googleSubmitting" @credential="p.onGoogleCredential" @error="p.googleError = $event" />
          </div>
          <p v-if="p.googleSubmitting" class="lme__nota" aria-live="polite">{{ p.socialEntrando === 'apple' ? 'Entrando com a Apple…' : 'Entrando com o Google…' }}</p>
          <p v-else-if="p.googleError" class="lme__nota lme__nota--erro" role="alert">{{ p.googleError }}</p>

          <p v-if="p.isCad" class="lme__plano">A conta é grátis. A carteira e a IA são da assinatura: {{ DIAS_GRATIS }} dias grátis, depois {{ PRECO_MENSAL }} por mês.</p>
          <p class="lme__pe">{{ p.altLabel }} <button type="button" class="lme__link lme__link--pe" @click="p.toggleMode()">{{ p.altCta }}</button></p>
        </template>

        <template v-else>
          <button type="button" class="lme__voltar" @click="p.backToIdentifier()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            {{ p.isPhone ? 'Trocar o número' : 'Trocar o e-mail' }}
          </button>
          <h1 class="lme__titulo">{{ titulo }}</h1>
          <p class="lme__dek">Mandamos 6 números para <b>{{ destino }}</b>. {{ p.isPhone ? 'Valem 5 minutos.' : 'Valem 10 minutos.' }}</p>
          <div ref="bloco" class="lme__bloco-codigo">
            <LoginCodigo tom="caixas" :verifying="p.verifying" :error="p.pinError" @submit="p.verifyPin" />
            <p class="lme__nota" :class="{ 'lme__nota--erro': p.pinError }" aria-live="polite">
              <template v-if="p.pinError">{{ p.pinError }}</template>
              <template v-else-if="p.verifying">Conferindo o código…</template>
              <template v-else>Com os 6 números você entra. Não precisa apertar nada.</template>
            </p>
          </div>
          <div class="lme__reenvio">
            <button v-if="p.resendIn === 0" type="button" class="lme__link" :disabled="p.verifying" @click="p.resendPin()">Reenviar código</button>
            <span v-else class="lme__espera">Reenviar em {{ p.resendIn }} s</span>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<style scoped>
.lme { min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; background: var(--nu-cream); overflow-x: clip; }

/* ——— a faixa do pregão ——— */
.lme__pregao {
  position: relative; isolation: isolate; color: var(--nu-cream-text); background: var(--nu-navy);
  padding: env(safe-area-inset-top) max(16px, env(safe-area-inset-right)) 14px max(16px, env(safe-area-inset-left));
}
.lme__pregao::before {
  content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(45% 90% at 100% 60%, color-mix(in srgb, var(--nu-blue) 24%, transparent) 0%, transparent 100%);
}
.lme__linha-topo, .lme__dia, .lme__cotacoes { width: 100%; max-width: 960px; margin: 0 auto; }
.lme__linha-topo { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 52px; }
.lme__marca { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; flex-shrink: 0; border-radius: var(--nu-r-chip); color: var(--nu-cream-text); font-size: var(--nu-fs-md); font-weight: 800; letter-spacing: -0.03em; }
.lme__marca:focus-visible { outline: 2px solid var(--nu-white); outline-offset: 2px; }
.lme__sobre { min-width: 0; color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 500; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lme__sobre--vivo { color: var(--nu-green-soft); }
.lme__dia { display: flex; align-items: center; gap: 16px; }
.lme__frase { flex: 1 1 0; min-width: 0; }
.lme__titulo-dia { margin: 0; color: var(--nu-cream-text); font-size: var(--nu-fs-xl); font-weight: 700; letter-spacing: -0.02em; line-height: 1.2; }
.lme__numero { margin: 4px 0 0; color: var(--nu-cream-text-55); font-size: var(--nu-fs-sm); }
.lme__numero b { font-weight: 700; font-variant-numeric: tabular-nums; }
.lme__neg { color: var(--nu-red-soft); }
.lme__pos { color: var(--nu-green-soft); }
.lme__grafico { flex: 0 0 auto; width: 36%; min-width: 0; height: 44px; overflow: visible; }
.lme__traco { fill: none; stroke-width: 1.6; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.lme__grafico--neg .lme__traco { stroke: var(--nu-red-soft); }
.lme__grafico--pos .lme__traco { stroke: var(--nu-green-soft); }
.lme__ponto { fill: var(--nu-cream); vector-effect: non-scaling-stroke; }
.lme__cotacoes { height: 20px; margin-top: 12px; font-size: var(--nu-fs-xs); }
.lme__ntc { --ntc-gap: 18px; }
.lme__ntc :deep(.ntc__nome) { color: var(--nu-cream-text-55); }
.lme__ntc :deep(.ntc__valor) { color: var(--nu-cream-text); }
.lme__ntc :deep(.ntc__pct--up) { color: var(--nu-green-soft); }
.lme__ntc :deep(.ntc__pct--down) { color: var(--nu-red-soft); }
.lme__esqueleto { display: block; width: 70%; height: 12px; margin-top: 4px; border-radius: var(--nu-r-pill); background: var(--nu-cream-text-10); }
.lme--codigo .lme__cotacoes { display: none; }

/* ——— o formulário ——— */
.lme__form-area { flex: 1; display: flex; justify-content: center; padding: 22px max(16px, env(safe-area-inset-right)) max(28px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left)); }
.lme__coluna { width: 100%; max-width: 420px; animation: nu-fade .4s ease both; }
.lme__jornada { margin-bottom: 18px; }
.lme__titulo { margin: 0; color: var(--nu-ink); font-size: clamp(26px, 7vw, 34px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.1; }
.lme__dek { margin: 10px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); line-height: 1.5; }
.lme__dek b { color: var(--nu-ink); font-weight: 700; overflow-wrap: anywhere; }

.lme__form { display: flex; flex-direction: column; margin-top: 16px; }
.lme__rotulos { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.lme__rotulo { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 600; }
.lme__fora { padding: 3px 9px; border-radius: var(--nu-r-pill); background: var(--nu-amber-bg); color: var(--nu-amber-text); font-size: var(--nu-fs-xs); font-weight: 600; }
.lme__campo {
  margin-top: 8px; min-height: 54px; padding: 0 16px; border: 0; border-radius: var(--nu-r-input); outline: none;
  background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-cream-line);
  color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-md); font-weight: 600; transition: box-shadow .2s;
}
.lme__campo::placeholder { color: var(--nu-placeholder); font-weight: 400; }
.lme__campo:focus { box-shadow: inset 0 0 0 2px var(--nu-blue), 0 0 0 4px var(--nu-blue-16); }
.lme__campo--erro, .lme__campo--erro:focus { box-shadow: inset 0 0 0 2px var(--nu-red); }
.lme__nota { margin: 8px 0 0; min-height: 1.5em; color: var(--nu-gray); font-size: var(--nu-fs-sm); line-height: 1.5; }
.lme__nota--erro { color: var(--nu-red-text); font-weight: 600; }
.lme__nota--aviso { color: var(--nu-amber-text); font-weight: 600; }

.lme__cta {
  position: relative; overflow: hidden; margin-top: 12px; min-height: 54px; border: 0; border-radius: var(--nu-r-pill); cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); font: inherit; font-size: var(--nu-fs-md); font-weight: 700; transition: background .2s, color .2s;
}
.lme__cta:hover:not(:disabled) { background: var(--nu-blue-hover); }
.lme__cta:disabled { background: var(--nu-cream-2); color: var(--nu-gray); cursor: default; }
.lme__cta--indo:disabled { background: var(--nu-blue); color: var(--nu-white); }
.lme__cta--indo::after {
  content: ''; position: absolute; left: 0; bottom: 0; height: 3px; width: 40%;
  background: var(--nu-white-60); border-radius: var(--nu-r-pill); animation: lme-filete 1.1s ease-in-out infinite;
}
@keyframes lme-filete { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
.lme__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

.lme__ou { display: flex; align-items: center; gap: 14px; margin-top: 20px; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 600; }
.lme__ou::before, .lme__ou::after { content: ''; flex: 1; height: 1px; background: var(--nu-cream-line); }
.lme__marcas { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
.lme__ou:has(+ .lme__marcas:empty), .lme__marcas:empty { display: none; }
.lme__plano { margin: 18px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); line-height: 1.5; }
.lme__pe { margin: 16px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); }
.lme__link {
  display: inline-flex; align-items: center; min-height: 44px; padding: 0 2px; margin: -12px 0; border: 0; border-radius: 6px; background: none; cursor: pointer;
  color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600;
}
.lme__link--pe { min-height: 0; padding: 0; margin: 0; vertical-align: baseline; }
.lme__reenvio .lme__link { margin: 0; }
.lme__link:disabled { color: var(--nu-gray); cursor: default; }
.lme__link:focus-visible, .lme__voltar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.lme__voltar {
  display: inline-flex; align-items: center; gap: 4px; min-height: 44px; padding: 0 12px 0 4px; margin: -8px 0 4px -8px; border: 0; border-radius: var(--nu-r-pill);
  background: none; cursor: pointer; color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600;
}
.lme__voltar:hover { background: var(--nu-cream-2); }
.lme__bloco-codigo { margin-top: 22px; }
.lme__reenvio { display: flex; align-items: center; min-height: 44px; margin-top: 4px; }
.lme__espera { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-variant-numeric: tabular-nums; }

@media (min-width: 768px) {
  .lme__pregao { padding-bottom: 22px; }
  .lme__linha-topo { min-height: 68px; }
  .lme__titulo-dia { font-size: var(--nu-fs-2xl); }
  .lme__grafico { width: 46%; height: 64px; }
  .lme__form-area { align-items: center; padding-top: 48px; padding-bottom: 72px; }
}
@media (prefers-reduced-motion: reduce) {
  .lme__coluna, .lme__cta--indo::after { animation: none; }
}
</style>
