<script setup lang="ts">
// PROTÓTIPO 5 do /login (04/11/2026, ?entrar=5 só no dev): "O losango". A
// noite, o logo grande da marca no centro (as peças exatas do SVG, de
// utils/marcaRedentia.ts, as mesmas do losango do dia da home) e um cartão de
// vidro com o formulário. O logo reage ao que a pessoa faz, uma vez por
// mudança, sem loop:
//  - em repouso, as duas metades ficam um pouco abertas e o miolo, apagado;
//  - o contato fica válido (porta.ready): o miolo acende;
//  - o código vai ser conferido (porta.verifying): as duas metades fecham e o
//    logo fica inteiro, como na marca. Se o código não bater, abrem de novo.
//    A porta não diz "certo" antes de navegar: com o código certo, a conta
//    segue para o destino com o logo já fechado.
// Movimento reduzido: sem deslize, só a troca de estado. A lógica é a de
// pages/login.vue (porta); aqui é só a pele.
import type { PortaLogin } from '~/types/loginPorta'
import { DIAS_GRATIS, PRECO_MENSAL, formatarCelular } from '~/utils/assinatura'
import { LOGO, PECAS_DO_LOGO } from '~/utils/marcaRedentia'
import LoginCodigo from '../LoginCodigo.vue'

const props = defineProps<{ porta: PortaLogin }>()
const p = props.porta

// o miolo: o losango concêntrico do logo, com o canto vivo de 52,66 e o canto
// arredondado de raio ~20 (a ponta chega a 44,5 do centro)
const C = LOGO.centro
const ladoDoMiolo = LOGO.mioloVivo * Math.SQRT2
const cantoDoMiolo = LOGO.cantoDoMiolo * (1 - 1 / Math.SQRT2) * Math.SQRT2

const aceso = computed(() => (p.step === 'pin' ? true : p.ready))
const fechado = computed(() => p.step === 'pin' && p.verifying)

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
</script>

<template>
  <div class="llo" :class="{ 'llo--codigo': p.step === 'pin' }">
    <div class="llo__luz" aria-hidden="true" />
    <NuxtLink to="/" class="llo__logo" :class="{ 'llo__logo--aceso': aceso, 'llo__logo--fechado': fechado }" aria-label="Redentia, início">
      <svg viewBox="-24 -12 254 230" class="llo__svg" aria-hidden="true">
        <defs>
          <linearGradient id="llo-esq" gradientUnits="userSpaceOnUse" x1="0" y1="0" :x2="C" y2="0">
            <stop offset="0" class="llo__s-claro" /><stop offset=".72" class="llo__s-meio" /><stop offset="1" class="llo__s-fundo" />
          </linearGradient>
          <linearGradient id="llo-dir" gradientUnits="userSpaceOnUse" :x1="LOGO.lado" y1="0" :x2="C" y2="0">
            <stop offset="0" class="llo__s-claro" /><stop offset=".72" class="llo__s-meio" /><stop offset="1" class="llo__s-fundo" />
          </linearGradient>
          <linearGradient id="llo-aba" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" :y2="LOGO.lado">
            <stop offset="0" class="llo__s-claro" /><stop offset=".2" class="llo__s-meio" /><stop offset=".8" class="llo__s-meio" /><stop offset="1" class="llo__s-claro" />
          </linearGradient>
          <radialGradient id="llo-miolo" cx=".5" cy=".5" r=".5">
            <stop offset="0" class="llo__s-acende" /><stop offset=".6" class="llo__s-claro" /><stop offset="1" class="llo__s-meio" />
          </radialGradient>
          <filter id="llo-brilho" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9" /></filter>
        </defs>
        <!-- o miolo: o brilho atrás e o losango de luz -->
        <g class="llo__miolo">
          <rect :x="C - ladoDoMiolo / 2" :y="C - ladoDoMiolo / 2" :width="ladoDoMiolo" :height="ladoDoMiolo" :rx="cantoDoMiolo" :transform="`rotate(45 ${C} ${C})`" fill="url(#llo-miolo)" filter="url(#llo-brilho)" />
          <rect :x="C - ladoDoMiolo / 2 + 6" :y="C - ladoDoMiolo / 2 + 6" :width="ladoDoMiolo - 12" :height="ladoDoMiolo - 12" :rx="cantoDoMiolo" :transform="`rotate(45 ${C} ${C})`" fill="url(#llo-miolo)" />
        </g>
        <path :d="PECAS_DO_LOGO.esquerda" class="llo__peca llo__peca--esq" fill="url(#llo-esq)" />
        <path :d="PECAS_DO_LOGO.direita" class="llo__peca llo__peca--dir" fill="url(#llo-dir)" />
        <path :d="PECAS_DO_LOGO.cima" class="llo__peca llo__peca--cima" fill="url(#llo-aba)" />
        <path :d="PECAS_DO_LOGO.baixo" class="llo__peca llo__peca--baixo" fill="url(#llo-aba)" />
      </svg>
    </NuxtLink>

    <main class="llo__cartao">
      <div :key="p.step" class="llo__miolo-form">
        <template v-if="p.step === 'identifier'">
          <AssinaturaJornada v-if="p.vemDaAssinatura" class="llo__jornada" :passo="1" compacto escuro />
          <h1 class="llo__titulo">{{ titulo }}</h1>
          <form ref="bloco" class="llo__form" novalidate @submit.prevent="p.submitIdentifier()">
            <label class="llo__rotulo" for="llo-campo">{{ p.isPhone ? 'Seu celular com DDD' : 'Seu e-mail' }}</label>
            <input
              id="llo-campo" ref="campo" class="llo__campo" :class="{ 'llo__campo--erro': p.identifierError }" :value="p.isPhone ? p.phone : p.email"
              :type="p.isPhone ? 'tel' : 'email'" :inputmode="p.isPhone ? 'tel' : 'email'" :name="p.isPhone ? 'phone' : 'email'"
              :autocomplete="p.isPhone ? 'tel-national' : 'email'" enterkeyhint="send" autocapitalize="off" autocorrect="off" spellcheck="false"
              :placeholder="p.isPhone ? '(11) 90000-0000' : 'voce@email.com'" :aria-invalid="!!p.identifierError" aria-describedby="llo-nota"
              @input="aoDigitar"
            >
            <p id="llo-nota" class="llo__nota" :class="{ 'llo__nota--erro': p.identifierError, 'llo__nota--aviso': !p.identifierError && p.whatsappDown && p.isPhone }" aria-live="polite">
              <template v-if="p.identifierError">{{ p.identifierError }}</template>
              <template v-else-if="p.whatsappDown && p.isPhone">{{ p.whatsappNotice }}</template>
              <template v-else>{{ p.fieldHelp }}</template>
            </p>
            <button type="submit" class="llo__cta" :class="{ 'llo__cta--indo': p.sending }" :disabled="!p.ready || p.sending">{{ p.mainCta }}</button>
          </form>
          <p class="llo__canal">
            <span v-if="p.whatsappDown && !p.isPhone" class="llo__fora">WhatsApp fora do ar · o código vai por e-mail</span>
            <button v-else type="button" class="llo__link" @click="trocarCanal">{{ p.isPhone ? 'Receber por e-mail' : 'Receber no WhatsApp' }}</button>
          </p>

          <div class="llo__ou" role="separator"><span>ou</span></div>
          <div class="llo__marcas">
            <LoginAppleButton tom="branco" :disabled="p.googleSubmitting" @credential="p.onAppleCredential" @error="p.googleError = $event" />
            <LoginGoogleButton tom="escuro" :disabled="p.googleSubmitting" @credential="p.onGoogleCredential" @error="p.googleError = $event" />
          </div>
          <p v-if="p.googleSubmitting" class="llo__nota" aria-live="polite">{{ p.socialEntrando === 'apple' ? 'Entrando com a Apple…' : 'Entrando com o Google…' }}</p>
          <p v-else-if="p.googleError" class="llo__nota llo__nota--erro" role="alert">{{ p.googleError }}</p>

          <p v-if="p.isCad" class="llo__plano">A conta é grátis. A carteira e a IA são da assinatura: {{ DIAS_GRATIS }} dias grátis, depois {{ PRECO_MENSAL }} por mês.</p>
          <p class="llo__pe">{{ p.altLabel }} <button type="button" class="llo__link llo__link--pe" @click="p.toggleMode()">{{ p.altCta }}</button></p>
        </template>

        <template v-else>
          <button type="button" class="llo__voltar" @click="p.backToIdentifier()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            {{ p.isPhone ? 'Trocar o número' : 'Trocar o e-mail' }}
          </button>
          <h1 class="llo__titulo">{{ titulo }}</h1>
          <p class="llo__dek">Mandamos 6 números para <b>{{ destino }}</b>. {{ p.isPhone ? 'Valem 5 minutos.' : 'Valem 10 minutos.' }}</p>
          <div ref="bloco" class="llo__bloco-codigo">
            <LoginCodigo tom="escuro" :verifying="p.verifying" :error="p.pinError" @submit="p.verifyPin" />
            <p class="llo__nota" :class="{ 'llo__nota--erro': p.pinError }" aria-live="polite">
              <template v-if="p.pinError">{{ p.pinError }}</template>
              <template v-else-if="p.verifying">Conferindo o código…</template>
              <template v-else>Com os 6 números o losango fecha e você entra.</template>
            </p>
          </div>
          <div class="llo__reenvio">
            <button v-if="p.resendIn === 0" type="button" class="llo__link" :disabled="p.verifying" @click="p.resendPin()">Reenviar código</button>
            <span v-else class="llo__espera">Reenviar em {{ p.resendIn }} s</span>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<style scoped>
.llo {
  --llo-logo: clamp(78px, 15vh, 150px);
  position: relative; isolation: isolate; min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; align-items: center;
  padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
  background: linear-gradient(180deg, var(--nu-navy) 0%, var(--nu-agora-bg) 100%); color: var(--nu-agora-texto); overflow-x: clip;
}
.llo--codigo { --llo-logo: clamp(64px, 11vh, 120px); }
.llo__luz {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background: radial-gradient(50% 32% at 50% 12%, color-mix(in srgb, var(--nu-blue) 26%, transparent) 0%, transparent 100%);
}

/* ——— o logo ——— */
.llo__logo { display: block; width: calc(var(--llo-logo) * 1.23); margin: 8px 0 18px; border-radius: var(--nu-r-card); transition: width .45s cubic-bezier(.2, .8, .2, 1); }
.llo__logo:focus-visible { outline: 2px solid var(--nu-white); outline-offset: 4px; }
.llo__svg { display: block; width: 100%; height: auto; overflow: visible; }
.llo__s-claro { stop-color: var(--nu-blue-soft); }
.llo__s-meio { stop-color: var(--nu-blue); }
.llo__s-fundo { stop-color: var(--nu-navy); }
.llo__s-acende { stop-color: var(--nu-white); }
.llo__peca { transition: transform .7s cubic-bezier(.34, 1.4, .64, 1); }
/* em repouso, as metades ficam abertas; fechado, o logo é a marca */
.llo__peca--esq { transform: translateX(-7px); }
.llo__peca--dir { transform: translateX(7px); }
.llo__peca--cima { transform: translateY(-8px); }
.llo__peca--baixo { transform: translateY(8px); }
.llo__logo--fechado .llo__peca { transform: none; }
.llo__miolo { opacity: 0; transform-origin: 103px 103px; transform: scale(.7); transition: opacity .6s ease, transform .7s cubic-bezier(.2, .8, .2, 1); }
.llo__logo--aceso .llo__miolo { opacity: 1; transform: none; }

/* ——— o cartão de vidro ——— */
.llo__cartao {
  width: 100%; max-width: 440px; padding: 24px 20px 20px; border-radius: var(--nu-r-card-lg);
  background: color-mix(in srgb, var(--nu-white) 6%, transparent); box-shadow: inset 0 0 0 1px var(--nu-white-14), 0 30px 70px -30px var(--nu-agora-bg);
  -webkit-backdrop-filter: blur(24px); backdrop-filter: blur(24px);
}
.llo__miolo-form { animation: nu-fade .4s ease both; }
.llo__jornada { margin-bottom: 18px; }
.llo__titulo { margin: 0; color: var(--nu-agora-texto); font-size: clamp(26px, 7vw, 32px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.1; }
.llo__dek { margin: 10px 0 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-md); line-height: 1.5; }
.llo__dek b { color: var(--nu-agora-texto); font-weight: 700; overflow-wrap: anywhere; }

.llo__form { display: flex; flex-direction: column; margin-top: 18px; }
.llo__rotulo { color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 600; }
.llo__campo {
  margin-top: 8px; min-height: 54px; padding: 0 16px; border: 0; border-radius: var(--nu-r-input); outline: none;
  background: color-mix(in srgb, var(--nu-white) 8%, transparent); box-shadow: inset 0 0 0 1px var(--nu-white-18);
  color: var(--nu-agora-texto); font: inherit; font-size: var(--nu-fs-md); font-weight: 600; transition: box-shadow .2s;
}
.llo__campo::placeholder { color: var(--nu-cream-text-45); font-weight: 400; }
.llo__campo:focus { box-shadow: inset 0 0 0 2px var(--nu-agora-azul), 0 0 0 4px color-mix(in srgb, var(--nu-agora-azul) 22%, transparent); }
.llo__campo--erro, .llo__campo--erro:focus { box-shadow: inset 0 0 0 2px var(--nu-agora-vermelho); }
.llo__nota { margin: 8px 0 0; min-height: 1.5em; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); line-height: 1.5; }
.llo__nota--erro { color: var(--nu-red-soft); font-weight: 600; }
.llo__nota--aviso { color: var(--nu-agora-ambar); font-weight: 600; }

.llo__cta {
  position: relative; overflow: hidden; margin-top: 12px; min-height: 54px; border: 0; border-radius: var(--nu-r-pill); cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); font: inherit; font-size: var(--nu-fs-md); font-weight: 700; transition: background .2s, color .2s;
}
.llo__cta:hover:not(:disabled) { background: var(--nu-blue-hover); }
.llo__cta:disabled { background: var(--nu-white-14); color: var(--nu-cream-text-50); cursor: default; }
.llo__cta--indo:disabled { background: var(--nu-blue); color: var(--nu-white); }
.llo__cta--indo::after {
  content: ''; position: absolute; left: 0; bottom: 0; height: 3px; width: 40%;
  background: var(--nu-white-60); border-radius: var(--nu-r-pill); animation: llo-filete 1.1s ease-in-out infinite;
}
@keyframes llo-filete { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
.llo__cta:focus-visible { outline: 2px solid var(--nu-white); outline-offset: 3px; }

.llo__canal { display: flex; align-items: center; min-height: 44px; margin: 4px 0 0; }
.llo__fora { color: var(--nu-agora-ambar); font-size: var(--nu-fs-xs); font-weight: 600; }
.llo__link {
  display: inline-flex; align-items: center; min-height: 44px; padding: 0 2px; border: 0; border-radius: 6px; background: none; cursor: pointer;
  color: var(--nu-agora-azul); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600;
}
.llo__link:disabled { color: var(--nu-agora-sub); cursor: default; }
.llo__link--pe { min-height: 0; padding: 0; vertical-align: baseline; }
.llo__link:focus-visible, .llo__voltar:focus-visible { outline: 2px solid var(--nu-white); outline-offset: 2px; }

.llo__ou { display: flex; align-items: center; gap: 14px; margin-top: 8px; color: var(--nu-agora-sub); font-size: var(--nu-fs-dense); font-weight: 600; }
.llo__ou::before, .llo__ou::after { content: ''; flex: 1; height: 1px; background: var(--nu-agora-linha); }
.llo__marcas { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
.llo__ou:has(+ .llo__marcas:empty), .llo__marcas:empty { display: none; }
.llo__plano { margin: 18px 0 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-xs); line-height: 1.5; }
.llo__pe { margin: 16px 0 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); }

.llo__voltar {
  display: inline-flex; align-items: center; gap: 4px; min-height: 44px; padding: 0 12px 0 4px; margin: -8px 0 4px -8px; border: 0; border-radius: var(--nu-r-pill);
  background: none; cursor: pointer; color: var(--nu-agora-azul); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600;
}
.llo__voltar:hover { background: var(--nu-white-14); }
.llo__bloco-codigo { margin-top: 20px; }
.llo__reenvio { display: flex; align-items: center; min-height: 44px; margin-top: 4px; }
.llo__espera { color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-variant-numeric: tabular-nums; }

@media (min-width: 768px) {
  .llo { --llo-logo: clamp(120px, 20vh, 190px); justify-content: center; padding-top: 48px; padding-bottom: 64px; }
  .llo--codigo { --llo-logo: clamp(110px, 18vh, 170px); }
  .llo__cartao { padding: 32px 36px 28px; }
}
@media (prefers-reduced-motion: reduce) {
  .llo__peca, .llo__miolo, .llo__logo { transition: none; }
  .llo__miolo-form, .llo__cta--indo::after { animation: none; }
}
</style>
