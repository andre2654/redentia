<script setup lang="ts">
// A tela do /login, "A linha" (escolhida pelo dono em 03/11/2026 entre três
// direções). Editorial, na régua do rodapé Calma (NuFooterLinha): à esquerda a
// banda navy com o título em peso leve e o único momento bonito, o Ibovespa mês
// a mês desde jan/1995 se desenhando em luz até o ponto aceso de hoje. À
// direita, o creme calmo da grade das teses e do quiz: o modo em duas abas
// (Entrar · Criar conta), o canal num seletor (Celular · E-mail), o campo em
// caixa e as casas do código como as da folha de cadastro. No celular a banda
// vira uma faixa curta no alto, e no passo do código fica só a linha, para o
// campo ficar à vista com o teclado aberto. A lógica é a de pages/login.vue
// (porta); aqui é só a pele.
import type { PortaLogin } from '~/types/loginPorta'
import { DIAS_GRATIS, PRECO_MENSAL, formatarCelular } from '~/utils/assinatura'
import { IBOV_MENSAL } from '~/content/ibov-mensal'
import LoginCodigo from './LoginCodigo.vue'

const props = defineProps<{ porta: PortaLogin }>()
const p = props.porta

// a linha do rodapé, a mesma conta: log do fechamento de cada mês
const VW = 1000
const VH = 300
const logs = IBOV_MENSAL.map((v) => Math.log(v))
const lo = Math.min(...logs)
const hi = Math.max(...logs)
const yDe = (l: number) => 20 + (1 - (l - lo) / (hi - lo)) * (VH - 40)
const d = logs.map((l, i) => `${i ? 'L' : 'M'}${((i / (logs.length - 1)) * VW).toFixed(1)},${yDe(l).toFixed(1)}`).join('')
const fimY = (yDe(logs[logs.length - 1]!) / VH) * 100

const titulo = computed(() => {
  if (p.step === 'pin') return 'Digite o código.'
  if (p.vemDaAssinatura) return 'Primeiro, a sua conta.'
  return p.isCad ? 'Comece pela conta.' : 'Bom te ver de novo.'
})
const enviadoPara = computed(() =>
  p.isPhone
    ? { antes: 'Mandamos 6 números para o WhatsApp', para: p.phone, depois: 'Valem 5 minutos.' }
    : { antes: 'Mandamos 6 números para', para: p.email.trim(), depois: 'Valem 10 minutos.' },
)

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
const campo = ref<HTMLInputElement | null>(null)
function irPara(modo: 'login' | 'cadastro') {
  if (p.mode !== modo) p.toggleMode()
}
function canal(metodo: 'phone' | 'email') {
  if (p.method === metodo) return
  p.toggleMethod()
  nextTick(() => campo.value?.focus())
}
</script>

<template>
  <div class="lvl" :class="{ 'lvl--codigo': p.step === 'pin' }">
    <!-- a banda: o título e a linha -->
    <aside class="lvl__banda">
      <div class="lvl__luz" aria-hidden="true" />
      <NuxtLink to="/" class="lvl__marca" aria-label="Redentia, início">
        <img src="/logo-branca.svg" alt="" width="22" height="22">Redentia
      </NuxtLink>
      <p class="lvl__frase">Mais de 30 anos de bolsa numa linha. Os próximos 5, em 2.000 cenários.</p>
      <div class="lvl__cena" aria-hidden="true">
        <div class="lvl__traco">
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none" class="lvl__svg lvl__svg--brilho"><path :d="d" class="lvl__brilho" /></svg>
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none" class="lvl__svg">
            <defs>
              <linearGradient id="lvl-luz" x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" class="lvl__s-0" />
                <stop offset=".55" class="lvl__s-1" />
                <stop offset="1" class="lvl__s-2" />
              </linearGradient>
            </defs>
            <path :d="d" class="lvl__linha" />
          </svg>
        </div>
        <span class="lvl__hoje" :style="{ top: `${fimY}%` }" />
      </div>
      <p class="lvl__legenda">A linha é o Ibovespa, mês a mês desde 1995.</p>
    </aside>

    <!-- o formulário -->
    <main class="lvl__lado">
      <div :key="p.step" class="lvl__form">
        <template v-if="p.step === 'identifier'">
          <AssinaturaJornada v-if="p.vemDaAssinatura" class="lvl__jornada" :passo="1" compacto />
          <div v-else class="lvl__abas" role="group" aria-label="Entrar ou criar conta">
            <button type="button" class="lvl__aba" :class="{ 'lvl__aba--on': !p.isCad }" :aria-pressed="!p.isCad" @click="irPara('login')">Entrar</button>
            <button type="button" class="lvl__aba" :class="{ 'lvl__aba--on': p.isCad }" :aria-pressed="p.isCad" @click="irPara('cadastro')">Criar conta</button>
          </div>
          <h1 class="lvl__titulo">{{ titulo }}</h1>

          <form class="lvl__campos" novalidate @submit.prevent="p.submitIdentifier()">
            <div class="lvl__canais" role="radiogroup" aria-label="Receber o código por">
              <button type="button" role="radio" class="lvl__canal" :class="{ 'lvl__canal--on': p.isPhone }" :aria-checked="p.isPhone" @click="canal('phone')">
                Celular<span v-if="p.whatsappDown" class="lvl__fora">fora do ar</span>
              </button>
              <button type="button" role="radio" class="lvl__canal" :class="{ 'lvl__canal--on': !p.isPhone }" :aria-checked="!p.isPhone" @click="canal('email')">E-mail</button>
            </div>
            <label class="lvl__rotulo" for="lvl-campo">{{ p.isPhone ? 'Seu celular com DDD' : 'Seu e-mail' }}</label>
            <input
              id="lvl-campo" ref="campo" class="lvl__campo" :class="{ 'lvl__campo--erro': p.identifierError }" :value="p.isPhone ? p.phone : p.email"
              :type="p.isPhone ? 'tel' : 'email'" :inputmode="p.isPhone ? 'numeric' : 'email'"
              :name="p.isPhone ? 'phone' : 'email'" :autocomplete="p.isPhone ? 'tel-national' : 'email'"
              :placeholder="p.isPhone ? '(11) 90000-0000' : 'voce@email.com'" :aria-invalid="!!p.identifierError"
              aria-describedby="lvl-nota" @input="aoDigitar"
            >
            <p id="lvl-nota" class="lvl__nota" :class="{ 'lvl__nota--erro': p.identifierError, 'lvl__nota--aviso': !p.identifierError && p.whatsappDown && p.isPhone }" aria-live="polite">
              <template v-if="p.identifierError">{{ p.identifierError }}</template>
              <template v-else-if="p.whatsappDown && p.isPhone">{{ p.whatsappNotice }}</template>
              <template v-else>{{ p.fieldHelp }}</template>
            </p>
            <button type="submit" class="lvl__cta" :class="{ 'lvl__cta--indo': p.sending }" :disabled="!p.ready || p.sending">{{ p.mainCta }}</button>
          </form>

          <div class="lvl__ou" role="separator"><span>ou</span></div>
          <div class="lvl__marcas">
            <LoginAppleButton :disabled="p.googleSubmitting" @credential="p.onAppleCredential" @error="p.googleError = $event" />
            <LoginGoogleButton :disabled="p.googleSubmitting" @credential="p.onGoogleCredential" @error="p.googleError = $event" />
          </div>
          <p v-if="p.googleSubmitting" class="lvl__nota" aria-live="polite">{{ p.socialEntrando === 'apple' ? 'Entrando com a Apple…' : 'Entrando com o Google…' }}</p>
          <p v-else-if="p.googleError" class="lvl__nota lvl__nota--erro" role="alert">{{ p.googleError }}</p>

          <p v-if="p.isCad" class="lvl__plano">A conta é grátis. A carteira e a IA são da assinatura: {{ DIAS_GRATIS }} dias grátis, depois {{ PRECO_MENSAL }} por mês.</p>
          <p v-if="p.vemDaAssinatura" class="lvl__pe">{{ p.altLabel }} <button type="button" class="lvl__link" @click="p.toggleMode()">{{ p.altCta }}</button></p>
        </template>

        <template v-else>
          <button type="button" class="lvl__voltar" @click="p.backToIdentifier()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            {{ p.isPhone ? 'Trocar o número' : 'Trocar o e-mail' }}
          </button>
          <h1 class="lvl__titulo">{{ titulo }}</h1>
          <p class="lvl__dek">{{ enviadoPara.antes }} <b>{{ enviadoPara.para }}</b>. {{ enviadoPara.depois }}</p>
          <LoginCodigo tom="caixas" class="lvl__codigo" :verifying="p.verifying" :error="p.pinError" @submit="p.verifyPin" />
          <p class="lvl__nota" :class="{ 'lvl__nota--erro': p.pinError }" aria-live="polite">
            <template v-if="p.pinError">{{ p.pinError }}</template>
            <template v-else-if="p.verifying">Conferindo o código…</template>
            <template v-else>Com os 6 números você entra. Não precisa apertar nada.</template>
          </p>
          <div class="lvl__links">
            <button v-if="p.resendIn === 0" type="button" class="lvl__link" :disabled="p.verifying" @click="p.resendPin()">Reenviar código</button>
            <span v-else class="lvl__espera">Reenviar em {{ p.resendIn }} s</span>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<style scoped>
.lvl { min-height: 100vh; min-height: 100dvh; display: grid; grid-template-columns: minmax(0, 46fr) minmax(0, 54fr); background: var(--nu-cream); overflow-x: clip; }

/* ——— a banda navy ——— */
.lvl__banda {
  position: sticky; top: 0; height: 100vh; height: 100dvh; isolation: isolate; overflow: hidden;
  display: flex; flex-direction: column; padding: 26px 0 32px clamp(24px, 4vw, 64px);
  background: var(--nu-navy); color: var(--nu-cream-text);
}
.lvl__luz {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background:
    radial-gradient(42% 40% at 100% 62%, color-mix(in srgb, var(--nu-blue) 30%, transparent) 0%, transparent 100%),
    radial-gradient(60% 30% at 30% 22%, color-mix(in srgb, var(--nu-blue-soft) 7%, transparent) 0%, transparent 100%);
}
.lvl__marca {
  display: inline-flex; align-self: flex-start; align-items: center; gap: 9px; border-radius: var(--nu-r-chip);
  color: var(--nu-cream-text); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.03em;
}
.lvl__marca:focus-visible { outline: 2px solid var(--nu-white); outline-offset: 4px; }
.lvl__frase {
  margin: auto 0 0; padding-right: clamp(24px, 4vw, 64px); max-width: 15ch;
  font-size: clamp(36px, 3.7vw, 60px); font-weight: 500; letter-spacing: -0.05em; line-height: 1.03; text-wrap: balance;
  color: var(--nu-cream-text);
  background: linear-gradient(180deg, var(--nu-cream-text) 40%, var(--nu-cream-text-85) 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  animation: lvl-titulo 1.3s cubic-bezier(.2, .8, .2, 1) backwards;
}
/* o traço entra pela borda esquerda (1995 vem de fora) e acaba antes da borda da banda */
.lvl__cena { position: relative; flex: none; height: clamp(150px, 26vh, 260px); margin: clamp(28px, 5vh, 56px) clamp(28px, 3.4vw, 52px) 0 calc(-1 * clamp(24px, 4vw, 64px)); }
.lvl__traco { position: absolute; inset: 0; animation: lvl-traco 2.6s cubic-bezier(.55, .05, .25, 1) .35s backwards; }
.lvl__svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: visible; }
.lvl__linha { fill: none; stroke: url(#lvl-luz); stroke-width: 1.6; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.lvl__s-0 { stop-color: var(--nu-blue-soft); stop-opacity: 0; }
.lvl__s-1 { stop-color: var(--nu-blue-soft); stop-opacity: .55; }
.lvl__s-2 { stop-color: var(--nu-cream); stop-opacity: 1; }
.lvl__svg--brilho { filter: blur(7px); opacity: .55; }
.lvl__brilho { fill: none; stroke: var(--nu-blue-soft); stroke-width: 5; vector-effect: non-scaling-stroke; }
.lvl__hoje {
  position: absolute; left: 100%; width: 9px; height: 9px; border-radius: 50%; transform: translate(-50%, -50%);
  background: var(--nu-cream);
  box-shadow: 0 0 0 6px var(--nu-blue-soft-18), 0 0 22px 4px var(--nu-blue-soft), 0 0 60px 18px color-mix(in srgb, var(--nu-blue) 45%, transparent);
  animation: lvl-acende 1s ease 2.8s backwards;
}
.lvl__legenda { margin: 20px 0 0; color: var(--nu-cream-text-45); font-size: var(--nu-fs-xs); font-weight: 500; animation: lvl-acende 1s ease 2.3s backwards; }
@keyframes lvl-titulo { from { opacity: 0; filter: blur(14px); transform: translateY(14px); } }
@keyframes lvl-traco { from { clip-path: inset(-20px 100% -20px 0); } to { clip-path: inset(-20px 0 -20px 0); } }
@keyframes lvl-acende { from { opacity: 0; } }

/* ——— o lado do formulário ——— */
.lvl__lado { display: flex; align-items: center; justify-content: center; padding: clamp(40px, 8vh, 96px) clamp(16px, 5vw, 80px); }
.lvl__form { width: 100%; max-width: 420px; animation: nu-fade .5s ease both; }
.lvl__jornada { margin-bottom: 26px; }

.lvl__abas { display: flex; gap: 26px; border-bottom: 1px solid var(--nu-cream-line); }
.lvl__aba {
  position: relative; margin-bottom: -1px; padding: 0 0 14px; border: 0; background: none; cursor: pointer;
  color: var(--nu-gray); font: inherit; font-size: var(--nu-fs-md); font-weight: 700; border-bottom: 2px solid transparent;
  transition: color .2s, border-color .2s;
}
.lvl__aba:hover { color: var(--nu-ink); }
.lvl__aba--on { color: var(--nu-ink); border-bottom-color: var(--nu-ink); }
.lvl__aba:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 4px; border-radius: 4px; }

.lvl__titulo { margin: 30px 0 0; color: var(--nu-ink); font-size: clamp(30px, 2.8vw, 40px); font-weight: 800; letter-spacing: -0.04em; line-height: 1.06; }
.lvl__voltar + .lvl__titulo { margin-top: 22px; }
.lvl__dek { margin: 12px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }
.lvl__dek b { color: var(--nu-ink); font-weight: 700; white-space: nowrap; }

.lvl__campos { display: flex; flex-direction: column; margin-top: 24px; }
.lvl__canais { display: flex; padding: 4px; border-radius: var(--nu-r-pill); background: var(--nu-cream-2); }
.lvl__canal {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 40px;
  border: 0; border-radius: var(--nu-r-pill); background: transparent; cursor: pointer;
  color: var(--nu-gray-2); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; transition: background .2s, color .2s;
}
.lvl__canal--on { background: var(--nu-white); color: var(--nu-ink); box-shadow: 0 2px 8px -4px var(--nu-ink-30); }
.lvl__canal:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.lvl__fora { padding: 2px 8px; border-radius: var(--nu-r-pill); background: var(--nu-amber-bg); color: var(--nu-amber-text); font-size: var(--nu-fs-xs); font-weight: 700; }

.lvl__rotulo { margin-top: 20px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 700; }
.lvl__campo {
  margin-top: 8px; min-height: 56px; padding: 0 18px; border: 0; border-radius: var(--nu-r-tile); outline: none;
  background: var(--nu-white); box-shadow: inset 0 0 0 1.5px var(--nu-cream-line);
  color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-lg); font-weight: 600; font-variant-numeric: tabular-nums;
  transition: box-shadow .2s;
}
.lvl__campo::placeholder { color: var(--nu-placeholder); font-weight: 500; }
.lvl__campo:focus { box-shadow: inset 0 0 0 2px var(--nu-blue); }
.lvl__campo--erro { box-shadow: inset 0 0 0 1.5px var(--nu-red); }
.lvl__nota { margin: 10px 0 0; min-height: 1.5em; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.lvl__nota--erro { color: var(--nu-red-text); font-weight: 600; }
.lvl__nota--aviso { color: var(--nu-amber-text); font-weight: 600; }

.lvl__cta {
  position: relative; overflow: hidden; margin-top: 18px; min-height: 54px; border: 0; border-radius: var(--nu-r-pill); cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); font: inherit; font-size: var(--nu-fs-md); font-weight: 800; transition: background .2s, color .2s;
}
.lvl__cta:hover:not(:disabled) { background: var(--nu-blue-hover); }
.lvl__cta:disabled { background: var(--nu-cream-2); color: var(--nu-gray); cursor: default; }
.lvl__cta--indo:disabled { background: var(--nu-blue); color: var(--nu-white); }
/* enviando: um filete de luz corre no pé do próprio botão */
.lvl__cta--indo::after {
  content: ''; position: absolute; left: 0; bottom: 0; height: 3px; width: 40%;
  background: var(--nu-white-60); border-radius: var(--nu-r-pill); animation: lvl-filete 1.1s ease-in-out infinite;
}
@keyframes lvl-filete { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
.lvl__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

.lvl__ou { display: flex; align-items: center; gap: 14px; margin-top: 26px; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 600; }
.lvl__ou::before, .lvl__ou::after { content: ''; flex: 1; height: 1px; background: var(--nu-cream-line); }
.lvl__marcas { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
.lvl__marcas:empty, .lvl__ou:has(+ .lvl__marcas:empty) { display: none; }

.lvl__plano { margin: 24px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.5; }
.lvl__pe { margin: 24px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; }
.lvl__link {
  padding: 2px 0; border: 0; border-radius: 4px; background: none; cursor: pointer;
  color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700;
}
.lvl__link:disabled { color: var(--nu-gray); cursor: default; }
.lvl__link:focus-visible, .lvl__voltar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
.lvl__voltar {
  display: inline-flex; align-items: center; gap: 4px; padding: 6px 10px 6px 4px; margin-left: -4px; border: 0; border-radius: var(--nu-r-pill);
  background: none; cursor: pointer; color: var(--nu-gray-2); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700;
}
.lvl__voltar:hover { background: var(--nu-cream-2); color: var(--nu-ink); }
.lvl__codigo { margin-top: 28px; }
.lvl__links { display: flex; gap: 24px; margin-top: 18px; }
.lvl__espera { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums; }

/* tablet e celular: a banda vira uma faixa no alto */
@media (max-width: 1023px) {
  .lvl { grid-template-columns: minmax(0, 1fr); align-content: start; }
  .lvl__banda { position: relative; height: auto; padding: 18px 0 18px 16px; }
  .lvl__frase { margin-top: 22px; max-width: 20ch; font-size: clamp(24px, 6vw, 40px); padding-right: 16px; }
  .lvl__cena { height: clamp(64px, 14vw, 140px); margin: 14px 32px 0 -16px; }
  .lvl__legenda { margin-top: 12px; }
  .lvl__lado { align-items: flex-start; padding: 28px 16px 48px; }
  /* no código, a faixa encolhe: só a marca e a linha */
  .lvl--codigo .lvl__frase, .lvl--codigo .lvl__legenda { display: none; }
  .lvl--codigo .lvl__cena { height: 56px; margin-top: 10px; }
  .lvl--codigo .lvl__lado { padding-top: 18px; }
}
@media (prefers-reduced-motion: reduce) {
  .lvl__frase, .lvl__traco, .lvl__hoje, .lvl__legenda, .lvl__form, .lvl__cta--indo::after { animation: none; }
}
</style>
