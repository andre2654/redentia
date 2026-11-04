<script setup lang="ts">
// PROTÓTIPO 2 do /login (04/11/2026, ?entrar=2 só no dev): "Passo a passo",
// uma pergunta por tela, como um onboarding. Passo 1, o contato; passo 2, o
// código de 6 números grande (one-time-code do iOS, envio sozinho no 6º
// número, colar inteiro: é o LoginCodigo de sempre). Entre os dois, a tela
// desliza (para a frente ao enviar, para trás ao voltar) e a barra do alto
// enche. O canal é um link discreto embaixo do campo, não um seletor. A
// lógica é a de pages/login.vue (porta); aqui é só a pele.
import type { PortaLogin } from '~/types/loginPorta'
import { DIAS_GRATIS, PRECO_MENSAL, formatarCelular } from '~/utils/assinatura'
import LoginCodigo from '../LoginCodigo.vue'

const props = defineProps<{ porta: PortaLogin }>()
const p = props.porta

// para onde a tela desliza: para a frente no código, para trás ao voltar
const sentido = ref<'frente' | 'tras'>('frente')
watch(() => p.step, (agora) => { sentido.value = agora === 'pin' ? 'frente' : 'tras' })

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

const pergunta = computed(() => (p.isPhone ? 'Qual é o seu celular?' : 'Qual é o seu e-mail?'))
const chapeu = computed(() => (p.isCad ? 'Criar conta' : 'Entrar'))
const destino = computed(() => (p.isPhone ? p.phone : p.email.trim()))

const bloco = ref<HTMLElement | null>(null)
useCampoAVista(bloco)
</script>

<template>
  <div class="lps">
    <header class="lps__topo">
      <button v-if="p.step === 'pin'" type="button" class="lps__voltar" aria-label="Voltar ao contato" @click="p.backToIdentifier()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <NuTopoMarca v-else :tamanho="22" />
      <div class="lps__progresso" role="progressbar" aria-label="Passos para entrar" :aria-valuenow="p.step === 'pin' ? 2 : 1" aria-valuemin="1" aria-valuemax="2" :aria-valuetext="p.step === 'pin' ? 'Passo 2 de 2' : 'Passo 1 de 2'">
        <span class="lps__barra"><span class="lps__enche" :class="{ 'lps__enche--2': p.step === 'pin' }" /></span>
        <span class="lps__conta">{{ p.step === 'pin' ? 2 : 1 }} de 2</span>
      </div>
    </header>

    <main class="lps__palco">
      <Transition :name="`lps-${sentido}`" mode="out-in">
        <section v-if="p.step === 'identifier'" key="contato" class="lps__passo">
          <AssinaturaJornada v-if="p.vemDaAssinatura" class="lps__jornada" :passo="1" compacto />
          <p v-else class="lps__chapeu">{{ chapeu }}</p>
          <h1 class="lps__pergunta">{{ pergunta }}</h1>
          <p class="lps__dek">Mandamos um código de 6 números. Sem senha.</p>

          <form ref="bloco" class="lps__form" novalidate @submit.prevent="p.submitIdentifier()">
            <label class="lps__oculto" for="lps-campo">{{ p.isPhone ? 'Seu celular com DDD' : 'Seu e-mail' }}</label>
            <input
              id="lps-campo" ref="campo" class="lps__campo" :class="{ 'lps__campo--erro': p.identifierError }" :value="p.isPhone ? p.phone : p.email"
              :type="p.isPhone ? 'tel' : 'email'" :inputmode="p.isPhone ? 'tel' : 'email'" :name="p.isPhone ? 'phone' : 'email'"
              :autocomplete="p.isPhone ? 'tel-national' : 'email'" enterkeyhint="next" autocapitalize="off" autocorrect="off" spellcheck="false"
              :placeholder="p.isPhone ? '(11) 90000-0000' : 'voce@email.com'" :aria-invalid="!!p.identifierError" aria-describedby="lps-nota"
              @input="aoDigitar"
            >
            <p id="lps-nota" class="lps__nota" :class="{ 'lps__nota--erro': p.identifierError, 'lps__nota--aviso': !p.identifierError && p.whatsappDown && p.isPhone }" aria-live="polite">
              <template v-if="p.identifierError">{{ p.identifierError }}</template>
              <template v-else-if="p.whatsappDown && p.isPhone">{{ p.whatsappNotice }}</template>
              <template v-else>{{ p.fieldHelp }}</template>
            </p>
            <button type="submit" class="lps__cta" :class="{ 'lps__cta--indo': p.sending }" :disabled="!p.ready || p.sending">
              {{ p.sending ? 'Enviando o código…' : 'Continuar' }}
            </button>
          </form>

          <div class="lps__canal">
            <template v-if="p.whatsappDown && !p.isPhone">
              <span class="lps__fora">WhatsApp fora do ar</span><span class="lps__fora-txt">Por enquanto o código vai por e-mail.</span>
            </template>
            <button v-else type="button" class="lps__link" @click="trocarCanal">{{ p.isPhone ? 'Prefiro receber por e-mail' : 'Prefiro receber no WhatsApp' }}</button>
          </div>

          <div class="lps__ou" role="separator"><span>ou</span></div>
          <div class="lps__marcas">
            <LoginAppleButton :disabled="p.googleSubmitting" @credential="p.onAppleCredential" @error="p.googleError = $event" />
            <LoginGoogleButton :disabled="p.googleSubmitting" @credential="p.onGoogleCredential" @error="p.googleError = $event" />
          </div>
          <p v-if="p.googleSubmitting" class="lps__nota" aria-live="polite">{{ p.socialEntrando === 'apple' ? 'Entrando com a Apple…' : 'Entrando com o Google…' }}</p>
          <p v-else-if="p.googleError" class="lps__nota lps__nota--erro" role="alert">{{ p.googleError }}</p>

          <p v-if="p.isCad" class="lps__plano">A conta é grátis. A carteira e a IA são da assinatura: {{ DIAS_GRATIS }} dias grátis, depois {{ PRECO_MENSAL }} por mês.</p>
          <p class="lps__pe">{{ p.altLabel }} <button type="button" class="lps__link lps__link--pe" @click="p.toggleMode()">{{ p.altCta }}</button></p>
        </section>

        <section v-else key="codigo" class="lps__passo">
          <p class="lps__chapeu">{{ p.isPhone ? 'No seu WhatsApp' : 'No seu e-mail' }}</p>
          <h1 class="lps__pergunta">Qual é o código?</h1>
          <p class="lps__dek">
            Mandamos 6 números para <b>{{ destino }}</b>. {{ p.isPhone ? 'Valem 5 minutos.' : 'Valem 10 minutos.' }}
          </p>
          <div ref="bloco" class="lps__bloco-codigo">
            <LoginCodigo tom="grande" :verifying="p.verifying" :error="p.pinError" @submit="p.verifyPin" />
            <p class="lps__nota" :class="{ 'lps__nota--erro': p.pinError }" aria-live="polite">
              <template v-if="p.pinError">{{ p.pinError }}</template>
              <template v-else-if="p.verifying">Conferindo o código…</template>
              <template v-else>No 6º número você entra. Dá para colar o código inteiro.</template>
            </p>
          </div>
          <div class="lps__acoes">
            <button v-if="p.resendIn === 0" type="button" class="lps__link" :disabled="p.verifying" @click="p.resendPin()">Reenviar código</button>
            <span v-else class="lps__espera">Reenviar em {{ p.resendIn }} s</span>
            <button type="button" class="lps__link" @click="p.backToIdentifier()">{{ p.isPhone ? 'Trocar o número' : 'Trocar o e-mail' }}</button>
          </div>
        </section>
      </Transition>
    </main>
  </div>
</template>

<style scoped>
.lps {
  min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; background: var(--nu-cream); overflow-x: clip;
  padding: 0 max(16px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
}
.lps__topo {
  display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 56px; padding-top: env(safe-area-inset-top);
  width: 100%; max-width: 480px; margin: 0 auto;
}
.lps__topo :deep(.ntm) { min-height: 44px; }
.lps__voltar {
  display: grid; place-items: center; width: 44px; height: 44px; margin-left: -10px; border: 0; border-radius: var(--nu-r-pill);
  background: none; color: var(--nu-ink); cursor: pointer;
}
.lps__voltar:hover { background: var(--nu-cream-2); }
.lps__voltar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.lps__progresso { display: flex; align-items: center; gap: 10px; }
.lps__barra { position: relative; width: 72px; height: 4px; border-radius: var(--nu-r-pill); background: var(--nu-cream-line); overflow: hidden; }
.lps__enche {
  position: absolute; inset: 0; border-radius: inherit; background: var(--nu-blue);
  transform: scaleX(.5); transform-origin: 0 50%; transition: transform .6s cubic-bezier(.2, .8, .2, 1);
}
.lps__enche--2 { transform: scaleX(1); }
.lps__conta { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }

.lps__palco { flex: 1; width: 100%; max-width: 480px; margin: 0 auto; }
.lps__passo { display: flex; flex-direction: column; padding-top: clamp(16px, 5vh, 48px); }
.lps__jornada { margin-bottom: 20px; }
.lps__chapeu { margin: 0; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 600; }
.lps__pergunta { margin: 6px 0 0; color: var(--nu-ink); font-size: clamp(30px, 8.4vw, 40px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.06; }
.lps__dek { margin: 10px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); line-height: 1.5; }
.lps__dek b { color: var(--nu-ink); font-weight: 700; overflow-wrap: anywhere; }

.lps__form { display: flex; flex-direction: column; margin-top: 24px; }
.lps__oculto { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
/* o campo da pergunta: grande, numa linha só, como uma resposta */
.lps__campo {
  min-height: 60px; padding: 0 2px; border: 0; border-radius: 0; outline: none; background: transparent;
  border-bottom: 2px solid var(--nu-cream-line); color: var(--nu-ink); font: inherit;
  font-size: clamp(20px, 5.6vw, 24px); font-weight: 600; letter-spacing: -0.01em; font-variant-numeric: tabular-nums;
  transition: border-color .2s;
}
.lps__campo::placeholder { color: var(--nu-placeholder); font-weight: 500; }
.lps__campo:focus { border-bottom-color: var(--nu-blue); }
.lps__campo:focus-visible { box-shadow: 0 2px 0 0 var(--nu-blue); }
.lps__campo--erro, .lps__campo--erro:focus { border-bottom-color: var(--nu-red); }
.lps__nota { margin: 10px 0 0; min-height: 1.5em; color: var(--nu-gray); font-size: var(--nu-fs-sm); line-height: 1.5; }
.lps__nota--erro { color: var(--nu-red-text); font-weight: 600; }
.lps__nota--aviso { color: var(--nu-amber-text); font-weight: 600; }

.lps__cta {
  position: relative; overflow: hidden; margin-top: 16px; min-height: 56px; border: 0; border-radius: var(--nu-r-pill); cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); font: inherit; font-size: var(--nu-fs-md); font-weight: 700; transition: background .2s, color .2s;
}
.lps__cta:hover:not(:disabled) { background: var(--nu-blue-hover); }
.lps__cta:disabled { background: var(--nu-cream-2); color: var(--nu-gray); cursor: default; }
.lps__cta--indo:disabled { background: var(--nu-blue); color: var(--nu-white); }
.lps__cta--indo::after {
  content: ''; position: absolute; left: 0; bottom: 0; height: 3px; width: 40%;
  background: var(--nu-white-60); border-radius: var(--nu-r-pill); animation: lps-filete 1.1s ease-in-out infinite;
}
@keyframes lps-filete { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
.lps__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

.lps__canal { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; min-height: 44px; margin-top: 6px; }
.lps__fora { padding: 3px 9px; border-radius: var(--nu-r-pill); background: var(--nu-amber-bg); color: var(--nu-amber-text); font-size: var(--nu-fs-xs); font-weight: 600; }
.lps__fora-txt { color: var(--nu-gray); font-size: var(--nu-fs-sm); }
.lps__link {
  display: inline-flex; align-items: center; min-height: 44px; padding: 0 2px; border: 0; border-radius: 6px; background: none; cursor: pointer;
  color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600;
}
.lps__link:disabled { color: var(--nu-gray); cursor: default; }
.lps__link:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.lps__link--pe { min-height: 0; padding: 0; vertical-align: baseline; }

.lps__ou { display: flex; align-items: center; gap: 14px; margin-top: 18px; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 600; }
.lps__ou::before, .lps__ou::after { content: ''; flex: 1; height: 1px; background: var(--nu-cream-line); }
.lps__marcas { display: flex; flex-direction: column; gap: 10px; margin-top: 18px; }
.lps__ou:has(+ .lps__marcas:empty), .lps__marcas:empty { display: none; }

.lps__plano { margin: 20px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); line-height: 1.5; }
.lps__pe { margin: 18px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); }

.lps__bloco-codigo { margin-top: 28px; }
.lps__acoes { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 24px; margin-top: 10px; }
.lps__espera { display: inline-flex; align-items: center; min-height: 44px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-variant-numeric: tabular-nums; }

/* o deslize entre os passos */
.lps-frente-enter-active, .lps-tras-enter-active { transition: opacity .28s ease, transform .42s cubic-bezier(.2, .8, .2, 1); }
.lps-frente-leave-active, .lps-tras-leave-active { transition: opacity .18s ease, transform .22s ease-in; }
.lps-frente-enter-from { opacity: 0; transform: translateX(40px); }
.lps-frente-leave-to { opacity: 0; transform: translateX(-28px); }
.lps-tras-enter-from { opacity: 0; transform: translateX(-40px); }
.lps-tras-leave-to { opacity: 0; transform: translateX(28px); }

@media (min-width: 768px) {
  .lps { padding: 0 32px 48px; }
  .lps__topo { min-height: 80px; }
  .lps__passo { padding-top: clamp(40px, 12vh, 120px); }
}
@media (prefers-reduced-motion: reduce) {
  .lps-frente-enter-active, .lps-tras-enter-active, .lps-frente-leave-active, .lps-tras-leave-active { transition: opacity .15s ease; }
  .lps-frente-enter-from, .lps-frente-leave-to, .lps-tras-enter-from, .lps-tras-leave-to { transform: none; }
  .lps__enche { transition: none; }
  .lps__cta--indo::after { animation: none; }
}
</style>
