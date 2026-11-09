<script setup lang="ts">
// A tela do /login, a "Minimal" (escolhida pelo dono em 04/11/2026 entre sete
// direções pensadas no celular: "gostei do 6, pode manter"). Branco total, só
// a marca pequena, um título enorme e leve ("Entre."), um campo, um botão e
// muito respiro. Apple e Google descem para duas linhas finas no pé, nos
// estilos de contorno dos próprios guias (a Apple "white with outline", o
// Google neutro), sem pílula cheia. O canal é uma palavra ao lado do rótulo.
// Com o teclado aberto, useCampoAVista põe o campo e o botão acima dele. A
// lógica é a de pages/login.vue (porta); aqui é só a pele.
import type { PortaLogin } from '~/types/loginPorta'
import { DIAS_GRATIS, PRECO_MENSAL, formatarCelular } from '~/utils/assinatura'
import LoginCodigo from './LoginCodigo.vue'

const props = defineProps<{ porta: PortaLogin }>()
const p = props.porta

const titulo = computed(() => {
  if (p.step === 'pin') return 'Código.'
  if (p.vemDaAssinatura) return 'Sua conta.'
  return p.isCad ? 'Comece.' : 'Entre.'
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
  <div class="lmi">
    <header class="lmi__topo">
      <NuTopoMarca :tamanho="20" />
    </header>

    <main class="lmi__miolo">
      <div :key="p.step" class="lmi__coluna">
        <template v-if="p.step === 'identifier'">
          <AssinaturaJornada v-if="p.vemDaAssinatura" class="lmi__jornada" :passo="1" compacto />
          <h1 class="lmi__titulo">{{ titulo }}</h1>
          <p class="lmi__dek">{{ p.isCad ? 'A sua conta na Redentia, com um código. Sem senha.' : 'Na Redentia, com um código. Sem senha.' }}</p>

          <form ref="bloco" class="lmi__form" novalidate @submit.prevent="p.submitIdentifier()">
            <div class="lmi__rotulos">
              <label class="lmi__rotulo" for="lmi-campo">{{ p.isPhone ? 'Celular' : 'E-mail' }}</label>
              <span v-if="p.whatsappDown && !p.isPhone" class="lmi__fora">WhatsApp fora do ar</span>
              <button v-else type="button" class="lmi__troca" @click="trocarCanal">{{ p.isPhone ? 'Usar e-mail' : 'Usar celular' }}</button>
            </div>
            <input
              id="lmi-campo" ref="campo" class="lmi__campo" :class="{ 'lmi__campo--erro': p.identifierError }" :value="p.isPhone ? p.phone : p.email"
              :type="p.isPhone ? 'tel' : 'email'" :inputmode="p.isPhone ? 'tel' : 'email'" :name="p.isPhone ? 'phone' : 'email'"
              :autocomplete="p.isPhone ? 'tel-national' : 'email'" enterkeyhint="go" autocapitalize="off" autocorrect="off" spellcheck="false"
              :placeholder="p.isPhone ? '(11) 90000-0000' : 'voce@email.com'" :aria-invalid="!!p.identifierError" aria-describedby="lmi-nota"
              @input="aoDigitar"
            >
            <p id="lmi-nota" class="lmi__nota" :class="{ 'lmi__nota--erro': p.identifierError, 'lmi__nota--aviso': !p.identifierError && p.whatsappDown && p.isPhone }" aria-live="polite">
              <template v-if="p.identifierError">{{ p.identifierError }}</template>
              <template v-else-if="p.whatsappDown && p.isPhone">{{ p.whatsappNotice }}</template>
              <template v-else-if="p.isPhone">{{ p.fieldHelp }}</template>
              <template v-else>&nbsp;</template>
            </p>
            <button type="submit" class="lmi__cta" :class="{ 'lmi__cta--indo': p.sending }" :disabled="!p.ready || p.sending">{{ p.mainCta }}</button>
          </form>

          <div class="lmi__marcas" :class="{ 'lmi__marcas--ocupado': p.googleSubmitting }">
            <LoginAppleButton tom="contorno" :disabled="p.googleSubmitting" @credential="p.onAppleCredential" @error="p.googleError = $event" />
            <LoginGoogleButton :disabled="p.googleSubmitting" @credential="p.onGoogleCredential" @error="p.googleError = $event" />
          </div>
          <p v-if="p.googleSubmitting" class="lmi__nota" aria-live="polite">{{ p.socialEntrando === 'apple' ? 'Entrando com a Apple…' : 'Entrando com o Google…' }}</p>
          <p v-else-if="p.googleError" class="lmi__nota lmi__nota--erro" role="alert">{{ p.googleError }}</p>

          <p v-if="p.isCad" class="lmi__plano">A conta é grátis. A carteira e a IA são da assinatura: {{ DIAS_GRATIS }} dias grátis, depois {{ PRECO_MENSAL }} por mês.</p>
          <p class="lmi__pe">{{ p.altLabel }} <button type="button" class="lmi__link" @click="p.toggleMode()">{{ p.altCta }}</button></p>
        </template>

        <template v-else>
          <h1 class="lmi__titulo">{{ titulo }}</h1>
          <p class="lmi__dek">{{ p.isPhone ? 'Mandamos 6 números no WhatsApp' : 'Mandamos 6 números para' }} <b :class="{ 'lmi__fone': p.isPhone }">{{ destino }}</b>. {{ p.isPhone ? 'Valem 5 minutos.' : 'Valem 10 minutos.' }}</p>
          <div ref="bloco" class="lmi__bloco-codigo">
            <LoginCodigo :verifying="p.verifying" :error="p.pinError" @submit="p.verifyPin" />
            <p class="lmi__nota" :class="{ 'lmi__nota--erro': p.pinError }" aria-live="polite">
              <template v-if="p.pinError">{{ p.pinError }}</template>
              <template v-else-if="p.verifying">Conferindo…</template>
              <template v-else>&nbsp;</template>
            </p>
          </div>
          <div class="lmi__acoes">
            <button v-if="p.resendIn === 0" type="button" class="lmi__link" :disabled="p.verifying" @click="p.resendPin()">Reenviar</button>
            <span v-else class="lmi__espera">Reenviar em {{ p.resendIn }} s</span>
            <button type="button" class="lmi__link" @click="p.backToIdentifier()">{{ p.isPhone ? 'Trocar o número' : 'Trocar o e-mail' }}</button>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<style scoped>
.lmi {
  min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; background: var(--nu-white); overflow-x: clip;
  padding: 0 max(24px, env(safe-area-inset-right)) max(28px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left));
}
.lmi__topo { display: flex; align-items: center; min-height: 60px; padding-top: env(safe-area-inset-top); }
.lmi__topo :deep(.ntm) { min-height: 44px; }
.lmi__topo :deep(.ntm__nome) { font-size: var(--nu-fs-md); }
.lmi__miolo { flex: 1; display: flex; justify-content: center; }
.lmi__coluna { width: 100%; max-width: 400px; padding-top: clamp(12px, 6vh, 72px); animation: nu-fade .45s ease both; }
.lmi__jornada { margin-bottom: 24px; }

.lmi__titulo {
  margin: 0; color: var(--nu-ink); font-size: clamp(56px, 18vw, 92px); font-weight: 300; letter-spacing: -0.055em; line-height: .95;
}
.lmi__dek { margin: 14px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-md); line-height: 1.5; }
.lmi__dek b { color: var(--nu-ink); font-weight: 600; overflow-wrap: anywhere; }
.lmi__dek .lmi__fone { white-space: nowrap; }

.lmi__form { display: flex; flex-direction: column; margin-top: clamp(28px, 6vh, 56px); }
.lmi__rotulos { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.lmi__rotulo { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 600; }
.lmi__troca {
  display: inline-flex; align-items: center; min-height: 44px; padding: 0 2px; margin: -12px 0; border: 0; border-radius: 6px; background: none; cursor: pointer;
  color: var(--nu-gray); font: inherit; font-size: var(--nu-fs-sm); font-weight: 500;
}
.lmi__troca:hover { color: var(--nu-ink); }
.lmi__troca:focus-visible, .lmi__link:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.lmi__fora { color: var(--nu-amber-text); font-size: var(--nu-fs-xs); font-weight: 600; }
.lmi__campo {
  margin-top: 10px; min-height: 56px; padding: 0 16px; border: 0; border-radius: var(--nu-r-input); outline: none;
  background: var(--nu-cream); color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-md); font-weight: 500;
  box-shadow: inset 0 0 0 1px transparent; transition: box-shadow .2s, background .2s;
}
.lmi__campo::placeholder { color: var(--nu-placeholder); }
.lmi__campo:focus { background: var(--nu-white); box-shadow: inset 0 0 0 1.5px var(--nu-ink), 0 0 0 4px var(--nu-ink-04); }
.lmi__campo--erro, .lmi__campo--erro:focus { box-shadow: inset 0 0 0 1.5px var(--nu-red); }
.lmi__nota { margin: 8px 0 0; min-height: 1.5em; color: var(--nu-gray); font-size: var(--nu-fs-sm); line-height: 1.5; }
.lmi__nota--erro { color: var(--nu-red-text); font-weight: 600; }
.lmi__nota--aviso { color: var(--nu-amber-text); font-weight: 600; }

.lmi__cta {
  position: relative; overflow: hidden; margin-top: 8px; min-height: 54px; border: 0; border-radius: var(--nu-r-pill); cursor: pointer;
  background: var(--nu-ink); color: var(--nu-white); font: inherit; font-size: var(--nu-fs-md); font-weight: 600; transition: background .2s, color .2s;
}
.lmi__cta:hover:not(:disabled) { background: var(--nu-ink-hover); }
.lmi__cta:disabled { background: var(--nu-cream); color: var(--nu-gray); cursor: default; }
.lmi__cta--indo:disabled { background: var(--nu-ink); color: var(--nu-white); }
.lmi__cta--indo::after {
  content: ''; position: absolute; left: 0; bottom: 0; height: 2px; width: 40%;
  background: var(--nu-white-60); border-radius: var(--nu-r-pill); animation: lmi-filete 1.1s ease-in-out infinite;
}
@keyframes lmi-filete { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
.lmi__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

/* as marcas: duas linhas finas, no contorno dos guias */
.lmi__marcas { display: flex; flex-direction: column; gap: 8px; margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--nu-navy-07); }
.lmi__marcas:empty { display: none; }
/* entrando com a Apple ou o Google: as duas linhas esmaecem juntas (a da Apple já esmaece sozinha) */
.lmi__marcas--ocupado :deep(.lgb) { opacity: .6; }
.lmi__marcas :deep(.lab__pilula), .lmi__marcas :deep(.lgb__pilula) { min-height: 48px; font-size: var(--nu-fs-sm); font-weight: 600; }

.lmi__plano { margin: 20px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); line-height: 1.5; }
.lmi__pe { margin: 20px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); }
.lmi__link {
  display: inline-flex; align-items: center; min-height: 44px; padding: 0 2px; border: 0; border-radius: 6px; background: none; cursor: pointer;
  color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--nu-ink-30);
}
.lmi__pe .lmi__link { min-height: 0; padding: 0; vertical-align: baseline; }
.lmi__link:disabled { color: var(--nu-gray); cursor: default; }

.lmi__bloco-codigo { margin-top: clamp(12px, 3vh, 32px); }
.lmi__acoes { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 24px; margin-top: 8px; }
.lmi__espera { display: inline-flex; align-items: center; min-height: 44px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-variant-numeric: tabular-nums; }

@media (min-width: 768px) {
  .lmi { padding: 0 40px 56px; }
  .lmi__topo { min-height: 84px; }
  .lmi__miolo { align-items: center; }
  .lmi__coluna { padding-top: 0; margin-bottom: 84px; }
}
@media (prefers-reduced-motion: reduce) {
  .lmi__coluna, .lmi__cta--indo::after { animation: none; }
}
</style>
