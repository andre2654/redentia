<script setup lang="ts">
// PROTÓTIPO 3 do /login (04/11/2026, ?entrar=3 só no dev): "A noite
// compacta". Fica a linha do Ibovespa de "A linha", mas só como um fundo
// baixo e calmo no alto (cerca de um quarto da tela no celular, sem a frase
// longa), e o formulário sobe numa folha arredondada por cima, como um bottom
// sheet, já na primeira tela. Sem as abas: o pé troca a copy entre entrar e
// criar conta. O canal é um seletor pequeno na linha do rótulo. A lógica é a
// de pages/login.vue (porta); aqui é só a pele.
import type { PortaLogin } from '~/types/loginPorta'
import { DIAS_GRATIS, PRECO_MENSAL, formatarCelular } from '~/utils/assinatura'
import { IBOV_MENSAL } from '~/content/ibov-mensal'
import LoginCodigo from '../LoginCodigo.vue'

const props = defineProps<{ porta: PortaLogin }>()
const p = props.porta

// a linha de "A linha", a mesma conta: log do fechamento de cada mês
const VW = 1000
const VH = 300
const logs = IBOV_MENSAL.map((v) => Math.log(v))
const lo = Math.min(...logs)
const hi = Math.max(...logs)
const yDe = (l: number) => 24 + (1 - (l - lo) / (hi - lo)) * (VH - 48)
const d = logs.map((l, i) => `${i ? 'L' : 'M'}${((i / (logs.length - 1)) * VW).toFixed(1)},${yDe(l).toFixed(1)}`).join('')
const fimY = (yDe(logs[logs.length - 1]!) / VH) * 100

const titulo = computed(() => {
  if (p.step === 'pin') return 'Digite o código.'
  if (p.vemDaAssinatura) return 'Primeiro, a sua conta.'
  return p.isCad ? 'Comece pela conta.' : 'Bom te ver de novo.'
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
function canal(metodo: 'phone' | 'email') {
  if (p.method === metodo) return
  p.toggleMethod()
  nextTick(() => campo.value?.focus())
}

const bloco = ref<HTMLElement | null>(null)
useCampoAVista(bloco)
</script>

<template>
  <div class="lnc" :class="{ 'lnc--codigo': p.step === 'pin' }">
    <!-- o fundo: a noite baixa com a linha -->
    <div class="lnc__ceu" aria-hidden="true">
      <div class="lnc__luz" />
      <div class="lnc__cena">
        <div class="lnc__traco">
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none" class="lnc__svg lnc__svg--brilho"><path :d="d" class="lnc__brilho" /></svg>
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none" class="lnc__svg">
            <defs>
              <linearGradient id="lnc-luz" x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" class="lnc__s-0" />
                <stop offset=".6" class="lnc__s-1" />
                <stop offset="1" class="lnc__s-2" />
              </linearGradient>
            </defs>
            <path :d="d" class="lnc__linha" />
          </svg>
        </div>
        <span class="lnc__hoje" :style="{ top: `${fimY}%` }" />
      </div>
    </div>
    <header class="lnc__topo">
      <NuxtLink to="/" class="lnc__marca" aria-label="Redentia, início">
        <img src="/logo-branca.svg" alt="" width="20" height="20">Redentia
      </NuxtLink>
      <span class="lnc__legenda">Ibovespa desde 1995</span>
    </header>

    <!-- a folha -->
    <main class="lnc__folha">
      <span class="lnc__alca" aria-hidden="true" />
      <div :key="p.step" class="lnc__miolo">
        <template v-if="p.step === 'identifier'">
          <AssinaturaJornada v-if="p.vemDaAssinatura" class="lnc__jornada" :passo="1" compacto />
          <h1 class="lnc__titulo">{{ titulo }}</h1>

          <form ref="bloco" class="lnc__form" novalidate @submit.prevent="p.submitIdentifier()">
            <div class="lnc__linha-rotulo">
              <label class="lnc__rotulo" for="lnc-campo">{{ p.isPhone ? 'Seu celular com DDD' : 'Seu e-mail' }}</label>
              <div class="lnc__canais" role="radiogroup" aria-label="Receber o código por">
                <button type="button" role="radio" class="lnc__canal" :class="{ 'lnc__canal--on': !p.isPhone }" :aria-checked="!p.isPhone" @click="canal('email')">E-mail</button>
                <button type="button" role="radio" class="lnc__canal" :class="{ 'lnc__canal--on': p.isPhone, 'lnc__canal--fora': p.whatsappDown }" :aria-checked="p.isPhone" @click="canal('phone')">
                  Celular<span v-if="p.whatsappDown" class="lnc__ponto" aria-hidden="true" /><span v-if="p.whatsappDown" class="lnc__oculto">, fora do ar</span>
                </button>
              </div>
            </div>
            <input
              id="lnc-campo" ref="campo" class="lnc__campo" :class="{ 'lnc__campo--erro': p.identifierError }" :value="p.isPhone ? p.phone : p.email"
              :type="p.isPhone ? 'tel' : 'email'" :inputmode="p.isPhone ? 'tel' : 'email'" :name="p.isPhone ? 'phone' : 'email'"
              :autocomplete="p.isPhone ? 'tel-national' : 'email'" enterkeyhint="send" autocapitalize="off" autocorrect="off" spellcheck="false"
              :placeholder="p.isPhone ? '(11) 90000-0000' : 'voce@email.com'" :aria-invalid="!!p.identifierError" aria-describedby="lnc-nota"
              @input="aoDigitar"
            >
            <p id="lnc-nota" class="lnc__nota" :class="{ 'lnc__nota--erro': p.identifierError, 'lnc__nota--aviso': !p.identifierError && p.whatsappDown && p.isPhone }" aria-live="polite">
              <template v-if="p.identifierError">{{ p.identifierError }}</template>
              <template v-else-if="p.whatsappDown && p.isPhone">{{ p.whatsappNotice }}</template>
              <template v-else-if="p.whatsappDown">O código vai por e-mail. O WhatsApp está fora do ar agora.</template>
              <template v-else>{{ p.fieldHelp }}</template>
            </p>
            <button type="submit" class="lnc__cta" :class="{ 'lnc__cta--indo': p.sending }" :disabled="!p.ready || p.sending">{{ p.mainCta }}</button>
          </form>

          <div class="lnc__ou" role="separator"><span>ou</span></div>
          <div class="lnc__marcas">
            <LoginAppleButton :disabled="p.googleSubmitting" @credential="p.onAppleCredential" @error="p.googleError = $event" />
            <LoginGoogleButton :disabled="p.googleSubmitting" @credential="p.onGoogleCredential" @error="p.googleError = $event" />
          </div>
          <p v-if="p.googleSubmitting" class="lnc__nota" aria-live="polite">{{ p.socialEntrando === 'apple' ? 'Entrando com a Apple…' : 'Entrando com o Google…' }}</p>
          <p v-else-if="p.googleError" class="lnc__nota lnc__nota--erro" role="alert">{{ p.googleError }}</p>

          <p v-if="p.isCad" class="lnc__plano">A conta é grátis. A carteira e a IA são da assinatura: {{ DIAS_GRATIS }} dias grátis, depois {{ PRECO_MENSAL }} por mês.</p>
          <p class="lnc__pe">{{ p.altLabel }} <button type="button" class="lnc__link lnc__link--pe" @click="p.toggleMode()">{{ p.altCta }}</button></p>
        </template>

        <template v-else>
          <button type="button" class="lnc__voltar" @click="p.backToIdentifier()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            {{ p.isPhone ? 'Trocar o número' : 'Trocar o e-mail' }}
          </button>
          <h1 class="lnc__titulo">{{ titulo }}</h1>
          <p class="lnc__dek">Mandamos 6 números para <b>{{ destino }}</b>. {{ p.isPhone ? 'Valem 5 minutos.' : 'Valem 10 minutos.' }}</p>
          <div ref="bloco" class="lnc__bloco-codigo">
            <LoginCodigo tom="caixas" :verifying="p.verifying" :error="p.pinError" @submit="p.verifyPin" />
            <p class="lnc__nota" :class="{ 'lnc__nota--erro': p.pinError }" aria-live="polite">
              <template v-if="p.pinError">{{ p.pinError }}</template>
              <template v-else-if="p.verifying">Conferindo o código…</template>
              <template v-else>Com os 6 números você entra. Não precisa apertar nada.</template>
            </p>
          </div>
          <div class="lnc__reenvio">
            <button v-if="p.resendIn === 0" type="button" class="lnc__link" :disabled="p.verifying" @click="p.resendPin()">Reenviar código</button>
            <span v-else class="lnc__espera">Reenviar em {{ p.resendIn }} s</span>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<style scoped>
.lnc {
  --lnc-ceu: clamp(150px, 24vh, 210px);
  position: relative; isolation: isolate; min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column;
  background: var(--nu-cream); overflow-x: clip;
}
.lnc--codigo { --lnc-ceu: 120px; }

/* ——— o céu baixo ——— */
.lnc__ceu {
  position: absolute; top: 0; left: 0; right: 0; z-index: -1; height: calc(var(--lnc-ceu) + 40px + env(safe-area-inset-top));
  overflow: hidden; background: var(--nu-navy); transition: height .45s cubic-bezier(.2, .8, .2, 1);
}
.lnc__luz {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(50% 70% at 96% 40%, color-mix(in srgb, var(--nu-blue) 30%, transparent) 0%, transparent 100%),
    radial-gradient(60% 50% at 20% 0%, color-mix(in srgb, var(--nu-blue-soft) 8%, transparent) 0%, transparent 100%);
}
.lnc__cena { position: absolute; left: 0; right: 36px; top: calc(54px + env(safe-area-inset-top)); bottom: 52px; }
.lnc__traco { position: absolute; inset: 0; animation: lnc-traco 2.4s cubic-bezier(.55, .05, .25, 1) .2s backwards; }
.lnc__svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: visible; }
.lnc__linha { fill: none; stroke: url(#lnc-luz); stroke-width: 1.5; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.lnc__s-0 { stop-color: var(--nu-blue-soft); stop-opacity: 0; }
.lnc__s-1 { stop-color: var(--nu-blue-soft); stop-opacity: .5; }
.lnc__s-2 { stop-color: var(--nu-cream); stop-opacity: 1; }
.lnc__svg--brilho { filter: blur(6px); opacity: .5; }
.lnc__brilho { fill: none; stroke: var(--nu-blue-soft); stroke-width: 4; vector-effect: non-scaling-stroke; }
.lnc__hoje {
  position: absolute; left: 100%; width: 8px; height: 8px; border-radius: 50%; transform: translate(-50%, -50%);
  background: var(--nu-cream);
  box-shadow: 0 0 0 5px var(--nu-blue-soft-18), 0 0 18px 3px var(--nu-blue-soft), 0 0 48px 14px color-mix(in srgb, var(--nu-blue) 45%, transparent);
  animation: lnc-acende .9s ease 2.5s backwards;
}
@keyframes lnc-traco { from { clip-path: inset(-20px 100% -20px 0); } to { clip-path: inset(-20px 0 -20px 0); } }
@keyframes lnc-acende { from { opacity: 0; } }

.lnc__topo {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  min-height: 56px; padding: env(safe-area-inset-top) max(16px, env(safe-area-inset-right)) 0 max(16px, env(safe-area-inset-left));
}
.lnc__marca {
  display: inline-flex; align-items: center; gap: 8px; min-height: 44px; border-radius: var(--nu-r-chip);
  color: var(--nu-cream-text); font-size: var(--nu-fs-md); font-weight: 800; letter-spacing: -0.03em;
}
.lnc__marca:focus-visible { outline: 2px solid var(--nu-white); outline-offset: 2px; }
.lnc__legenda { color: var(--nu-cream-text-45); font-size: var(--nu-fs-xs); font-weight: 500; }

/* ——— a folha ——— */
.lnc__folha {
  position: relative; flex: 1; display: flex; flex-direction: column; align-items: center;
  margin-top: calc(var(--lnc-ceu) - 56px); padding: 10px max(16px, env(safe-area-inset-right)) max(28px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
  border-radius: var(--nu-r-card-lg) var(--nu-r-card-lg) 0 0; background: var(--nu-cream);
  box-shadow: 0 -18px 40px -24px var(--nu-navy-55);
  transition: margin-top .45s cubic-bezier(.2, .8, .2, 1);
}
.lnc__alca { width: 36px; height: 5px; border-radius: var(--nu-r-pill); background: var(--nu-cream-line); }
.lnc__miolo { width: 100%; max-width: 420px; padding-top: 18px; animation: nu-fade .4s ease both; }
.lnc__jornada { margin-bottom: 20px; }
.lnc__titulo { margin: 0; color: var(--nu-ink); font-size: clamp(28px, 7.6vw, 36px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.08; }
.lnc__dek { margin: 10px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); line-height: 1.5; }
.lnc__dek b { color: var(--nu-ink); font-weight: 700; overflow-wrap: anywhere; }

.lnc__form { display: flex; flex-direction: column; margin-top: 20px; }
.lnc__linha-rotulo { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.lnc__rotulo { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 600; }
.lnc__canais { display: flex; padding: 3px; border-radius: var(--nu-r-pill); background: var(--nu-cream-2); }
.lnc__canal {
  position: relative; display: inline-flex; align-items: center; gap: 6px; min-height: 38px; padding: 0 14px;
  border: 0; border-radius: var(--nu-r-pill); background: transparent; cursor: pointer;
  color: var(--nu-gray-2); font: inherit; font-size: var(--nu-fs-dense); font-weight: 600; transition: background .2s, color .2s;
}
/* o alvo de toque passa de 44 px sem engordar o seletor */
.lnc__canal::before { content: ''; position: absolute; inset: -4px 0; }
.lnc__canal--on { background: var(--nu-white); color: var(--nu-ink); box-shadow: 0 2px 8px -4px var(--nu-ink-30); }
.lnc__canal:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.lnc__ponto { width: 6px; height: 6px; border-radius: 50%; background: var(--nu-amber); }
.lnc__oculto { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.lnc__campo {
  margin-top: 10px; min-height: 56px; padding: 0 16px; border: 0; border-radius: var(--nu-r-input); outline: none;
  background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-cream-line);
  color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-md); font-weight: 600; font-variant-numeric: tabular-nums; transition: box-shadow .2s;
}
.lnc__campo::placeholder { color: var(--nu-placeholder); font-weight: 400; }
.lnc__campo:focus { box-shadow: inset 0 0 0 2px var(--nu-blue), 0 0 0 4px var(--nu-blue-16); }
.lnc__campo--erro, .lnc__campo--erro:focus { box-shadow: inset 0 0 0 2px var(--nu-red); }
.lnc__nota { margin: 8px 0 0; min-height: 1.5em; color: var(--nu-gray); font-size: var(--nu-fs-sm); line-height: 1.5; }
.lnc__nota--erro { color: var(--nu-red-text); font-weight: 600; }
.lnc__nota--aviso { color: var(--nu-amber-text); font-weight: 600; }

.lnc__cta {
  position: relative; overflow: hidden; margin-top: 14px; min-height: 54px; border: 0; border-radius: var(--nu-r-pill); cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); font: inherit; font-size: var(--nu-fs-md); font-weight: 700; transition: background .2s, color .2s;
}
.lnc__cta:hover:not(:disabled) { background: var(--nu-blue-hover); }
.lnc__cta:disabled { background: var(--nu-cream-2); color: var(--nu-gray); cursor: default; }
.lnc__cta--indo:disabled { background: var(--nu-blue); color: var(--nu-white); }
.lnc__cta--indo::after {
  content: ''; position: absolute; left: 0; bottom: 0; height: 3px; width: 40%;
  background: var(--nu-white-60); border-radius: var(--nu-r-pill); animation: lnc-filete 1.1s ease-in-out infinite;
}
@keyframes lnc-filete { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
.lnc__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

.lnc__ou { display: flex; align-items: center; gap: 14px; margin-top: 20px; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 600; }
.lnc__ou::before, .lnc__ou::after { content: ''; flex: 1; height: 1px; background: var(--nu-cream-line); }
.lnc__marcas { display: flex; flex-direction: column; gap: 10px; margin-top: 18px; }
.lnc__ou:has(+ .lnc__marcas:empty), .lnc__marcas:empty { display: none; }

.lnc__plano { margin: 20px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); line-height: 1.5; }
.lnc__pe { margin: 18px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); }
.lnc__link {
  display: inline-flex; align-items: center; min-height: 44px; padding: 0 2px; border: 0; border-radius: 6px; background: none; cursor: pointer;
  color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600;
}
.lnc__link:disabled { color: var(--nu-gray); cursor: default; }
.lnc__link--pe { min-height: 0; padding: 0; vertical-align: baseline; }
.lnc__link:focus-visible, .lnc__voltar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.lnc__voltar {
  display: inline-flex; align-items: center; gap: 4px; min-height: 44px; padding: 0 12px 0 4px; margin: 0 0 6px -8px; border: 0; border-radius: var(--nu-r-pill);
  background: none; cursor: pointer; color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600;
}
.lnc__voltar:hover { background: var(--nu-cream-2); }
.lnc__bloco-codigo { margin-top: 24px; }
.lnc__reenvio { display: flex; align-items: center; min-height: 44px; margin-top: 6px; }
.lnc__espera { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-variant-numeric: tabular-nums; }

/* desktop: o céu mais alto e a folha inteira, centrada por cima dele */
@media (min-width: 768px) {
  .lnc { --lnc-ceu: clamp(260px, 38vh, 380px); }
  .lnc--codigo { --lnc-ceu: clamp(220px, 30vh, 300px); }
  .lnc__topo { min-height: 72px; padding: 0 clamp(24px, 4vw, 56px); }
  .lnc__cena { top: 90px; bottom: 120px; right: clamp(48px, 6vw, 96px); }
  .lnc__folha {
    flex: none; align-self: center; width: min(480px, calc(100% - 64px)); margin-top: calc(var(--lnc-ceu) - 72px - 140px); margin-bottom: 64px;
    padding: 36px 40px 32px; border-radius: var(--nu-r-card-lg);
    box-shadow: 0 0 0 1px var(--nu-navy-07), 0 30px 70px -30px var(--nu-navy-55);
  }
  .lnc__alca { display: none; }
  .lnc__miolo { padding-top: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .lnc__traco, .lnc__hoje, .lnc__miolo, .lnc__cta--indo::after { animation: none; }
  .lnc__ceu, .lnc__folha { transition: none; }
}
</style>
