<script setup lang="ts">
// PROTÓTIPO 1 do /login (04/11/2026, ?entrar=1 só no dev): "Folha nativa",
// como o sign-in de um app do iOS. A marca pequena no alto, um título curto,
// a Apple e o Google grandes em cima, um "ou" e UM campo que aceita celular ou
// e-mail e descobre sozinho qual é (só escreve em `method`, `phone` e `email`
// da porta, que já aceitam escrita; o envio é o de sempre). Sem as abas: o
// mesmo fluxo serve para entrar e criar conta, e o pé troca só a copy. No
// desktop, a mesma coluna vira uma folha branca no creme. A lógica é a de
// pages/login.vue (porta); aqui é só a pele.
import type { PortaLogin } from '~/types/loginPorta'
import { DIAS_GRATIS, PRECO_MENSAL, formatarCelular } from '~/utils/assinatura'
import LoginCodigo from '../LoginCodigo.vue'

const props = defineProps<{ porta: PortaLogin }>()
const p = props.porta

// ————— o campo único: celular ou e-mail —————
// Letra ou @ é e-mail; só dígitos e a pontuação do celular é celular. O texto
// fica como a pessoa digitou, e o celular ganha a máscara quando já é celular.
const SO_CELULAR = /^[\d\s()+-]*$/
// o que está no campo é sempre o da porta (o prefill do ?email= e a troca
// automática para o e-mail com o WhatsApp fora aparecem sozinhos)
const texto = computed(() => (p.isPhone ? p.phone : p.email))

function aoDigitar(e: Event) {
  const el = e.target as HTMLInputElement
  let v = el.value
  const ehCelular = v.trim() !== '' && SO_CELULAR.test(v)
  if (ehCelular) {
    // a máscara só entra com 3 dígitos ou mais: "11j..." ainda vira e-mail inteiro
    if (v.replace(/\D/g, '').length >= 3) v = formatarCelular(v)
    if (p.method !== 'phone') p.toggleMethod()
    p.phone = v
  } else {
    // saiu do celular: tira a pontuação que a máscara pôs
    if (p.method === 'phone' && v.trim() !== '') v = v.replace(/[()\s]/g, '').replace(/-(?=\d)/g, '')
    if (p.method !== 'email') p.toggleMethod()
    p.email = v
  }
  if (el.value !== v) el.value = v
}

const titulo = computed(() => {
  if (p.step === 'pin') return p.isPhone ? 'Confira o WhatsApp.' : 'Confira seu e-mail.'
  if (p.vemDaAssinatura) return 'Primeiro, a sua conta.'
  return p.isCad ? 'Crie sua conta.' : 'Entre na Redentia.'
})
const rotulo = computed(() => (p.whatsappDown ? 'Seu e-mail' : 'Celular ou e-mail'))
const nota = computed(() => {
  if (p.identifierError) return p.identifierError
  if (p.whatsappDown && p.isPhone && texto.value) return p.whatsappNotice
  if (!texto.value) return p.whatsappDown ? 'O código chega no seu e-mail. Sem senha.' : 'O código chega no WhatsApp ou no e-mail. Sem senha.'
  return p.fieldHelp
})
const destino = computed(() => (p.isPhone ? p.phone : p.email.trim()))

const bloco = ref<HTMLElement | null>(null)
useCampoAVista(bloco)
</script>

<template>
  <div class="lfo">
    <header class="lfo__topo">
      <NuTopoMarca :tamanho="22" />
    </header>

    <main class="lfo__miolo">
      <div class="lfo__folha">
        <Transition name="lfo-passo" mode="out-in">
          <section v-if="p.step === 'identifier'" key="contato" class="lfo__passo">
            <AssinaturaJornada v-if="p.vemDaAssinatura" class="lfo__jornada" :passo="1" compacto />
            <h1 class="lfo__titulo">{{ titulo }}</h1>
            <p class="lfo__dek">{{ p.isCad ? 'Um código e pronto. A conta nasce no primeiro acesso.' : 'Um código e pronto. Sem senha para lembrar.' }}</p>

            <div class="lfo__marcas">
              <LoginAppleButton :disabled="p.googleSubmitting" @credential="p.onAppleCredential" @error="p.googleError = $event" />
              <LoginGoogleButton :disabled="p.googleSubmitting" @credential="p.onGoogleCredential" @error="p.googleError = $event" />
            </div>
            <p v-if="p.googleSubmitting" class="lfo__nota" aria-live="polite">{{ p.socialEntrando === 'apple' ? 'Entrando com a Apple…' : 'Entrando com o Google…' }}</p>
            <p v-else-if="p.googleError" class="lfo__nota lfo__nota--erro" role="alert">{{ p.googleError }}</p>
            <div class="lfo__ou" role="separator"><span>ou</span></div>

            <form ref="bloco" class="lfo__form" novalidate @submit.prevent="p.submitIdentifier()">
              <div class="lfo__rotulos">
                <label class="lfo__rotulo" for="lfo-campo">{{ rotulo }}</label>
                <span v-if="p.whatsappDown" class="lfo__fora">Celular fora do ar</span>
              </div>
              <input
                id="lfo-campo" class="lfo__campo" :class="{ 'lfo__campo--erro': p.identifierError }" :value="texto"
                type="text" name="contato" inputmode="email" autocomplete="email" enterkeyhint="go"
                autocapitalize="off" autocorrect="off" spellcheck="false"
                :placeholder="p.whatsappDown ? 'voce@email.com' : 'voce@email.com ou (11) 90000-0000'"
                :aria-invalid="!!p.identifierError" aria-describedby="lfo-nota" @input="aoDigitar"
              >
              <p
                id="lfo-nota" class="lfo__nota"
                :class="{ 'lfo__nota--erro': p.identifierError, 'lfo__nota--aviso': !p.identifierError && p.whatsappDown && p.isPhone && texto }"
                aria-live="polite"
              >{{ nota }}</p>
              <button type="submit" class="lfo__cta" :class="{ 'lfo__cta--indo': p.sending }" :disabled="!p.ready || p.sending">{{ p.mainCta }}</button>
            </form>

            <p v-if="p.isCad" class="lfo__plano">A conta é grátis. A carteira e a IA são da assinatura: {{ DIAS_GRATIS }} dias grátis, depois {{ PRECO_MENSAL }} por mês.</p>
            <p class="lfo__pe">{{ p.altLabel }} <button type="button" class="lfo__link" @click="p.toggleMode()">{{ p.altCta }}</button></p>
          </section>

          <section v-else key="codigo" class="lfo__passo">
            <button type="button" class="lfo__voltar" @click="p.backToIdentifier()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
              Voltar
            </button>
            <h1 class="lfo__titulo">{{ titulo }}</h1>
            <p class="lfo__dek">
              Mandamos 6 números para <b>{{ destino }}</b>.
              <button type="button" class="lfo__link" @click="p.backToIdentifier()">{{ p.isPhone ? 'Trocar o número' : 'Trocar o e-mail' }}</button>
            </p>
            <div ref="bloco" class="lfo__bloco-codigo">
              <LoginCodigo tom="caixas" class="lfo__codigo" :verifying="p.verifying" :error="p.pinError" @submit="p.verifyPin" />
              <p class="lfo__nota" :class="{ 'lfo__nota--erro': p.pinError }" aria-live="polite">
                <template v-if="p.pinError">{{ p.pinError }}</template>
                <template v-else-if="p.verifying">Conferindo o código…</template>
                <template v-else>Com os 6 números você entra. {{ p.isPhone ? 'Valem 5 minutos.' : 'Valem 10 minutos.' }}</template>
              </p>
            </div>
            <div class="lfo__reenvio">
              <button v-if="p.resendIn === 0" type="button" class="lfo__link" :disabled="p.verifying" @click="p.resendPin()">Reenviar código</button>
              <span v-else class="lfo__espera">Reenviar em {{ p.resendIn }} s</span>
            </div>
          </section>
        </Transition>
      </div>
    </main>
  </div>
</template>

<style scoped>
.lfo {
  min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; background: var(--nu-cream); overflow-x: clip;
  padding: 0 max(16px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
}
.lfo__topo { display: flex; align-items: center; min-height: 56px; padding-top: env(safe-area-inset-top); }
.lfo__topo :deep(.ntm) { min-height: 44px; }

.lfo__miolo { flex: 1; display: flex; justify-content: center; }
.lfo__folha { width: 100%; max-width: 420px; padding-top: 8px; }
.lfo__passo { display: flex; flex-direction: column; }
.lfo__jornada { margin-bottom: 20px; }

.lfo__titulo { margin: 0; color: var(--nu-ink); font-size: clamp(30px, 8vw, 36px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.08; }
.lfo__dek { margin: 8px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 400; line-height: 1.5; }
.lfo__dek b { color: var(--nu-ink); font-weight: 700; overflow-wrap: anywhere; }

.lfo__marcas { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; }
.lfo__marcas :deep(.lab__pilula), .lfo__marcas :deep(.lgb__pilula) { min-height: 54px; }
.lfo__marcas:empty, .lfo__marcas:empty + .lfo__ou, .lfo__marcas:empty ~ .lfo__ou { display: none; }
.lfo__ou { display: flex; align-items: center; gap: 14px; margin-top: 20px; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 600; }
.lfo__ou::before, .lfo__ou::after { content: ''; flex: 1; height: 1px; background: var(--nu-cream-line); }

.lfo__form { display: flex; flex-direction: column; margin-top: 18px; scroll-margin: 12px; }
.lfo__rotulos { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.lfo__rotulo { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 600; }
.lfo__fora { padding: 3px 9px; border-radius: var(--nu-r-pill); background: var(--nu-amber-bg); color: var(--nu-amber-text); font-size: var(--nu-fs-xs); font-weight: 600; white-space: nowrap; }
.lfo__campo {
  margin-top: 8px; min-height: 56px; padding: 0 16px; border: 0; border-radius: var(--nu-r-input); outline: none;
  background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-cream-line), 0 1px 2px var(--nu-navy-06);
  color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-md); font-weight: 600; font-variant-numeric: tabular-nums;
  transition: box-shadow .2s;
}
.lfo__campo::placeholder { color: var(--nu-placeholder); font-weight: 400; }
.lfo__campo:focus-visible, .lfo__campo:focus { box-shadow: inset 0 0 0 2px var(--nu-blue), 0 0 0 4px var(--nu-blue-16); }
.lfo__campo--erro, .lfo__campo--erro:focus { box-shadow: inset 0 0 0 2px var(--nu-red); }
.lfo__nota { margin: 8px 0 0; min-height: 1.5em; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 400; line-height: 1.5; }
.lfo__nota--erro { color: var(--nu-red-text); font-weight: 600; }
.lfo__nota--aviso { color: var(--nu-amber-text); font-weight: 600; }

.lfo__cta {
  position: relative; overflow: hidden; margin-top: 14px; min-height: 54px; border: 0; border-radius: var(--nu-r-pill); cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); font: inherit; font-size: var(--nu-fs-md); font-weight: 700; transition: background .2s, color .2s;
}
.lfo__cta:hover:not(:disabled) { background: var(--nu-blue-hover); }
.lfo__cta:disabled { background: var(--nu-cream-2); color: var(--nu-gray); cursor: default; }
.lfo__cta--indo:disabled { background: var(--nu-blue); color: var(--nu-white); }
.lfo__cta--indo::after {
  content: ''; position: absolute; left: 0; bottom: 0; height: 3px; width: 40%;
  background: var(--nu-white-60); border-radius: var(--nu-r-pill); animation: lfo-filete 1.1s ease-in-out infinite;
}
@keyframes lfo-filete { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
.lfo__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

.lfo__plano { margin: 20px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 400; line-height: 1.5; }
.lfo__pe { margin: 16px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); }
.lfo__link {
  display: inline-flex; align-items: center; min-height: 44px; padding: 0 2px; border: 0; border-radius: 6px; background: none; cursor: pointer;
  color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; vertical-align: middle;
}
.lfo__link:disabled { color: var(--nu-gray); cursor: default; }
.lfo__link:focus-visible, .lfo__voltar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.lfo__dek .lfo__link { min-height: 0; padding: 0; font-size: inherit; vertical-align: baseline; }

.lfo__voltar {
  align-self: flex-start; display: inline-flex; align-items: center; gap: 4px; min-height: 44px; padding: 0 12px 0 4px; margin: 0 0 8px -8px;
  border: 0; border-radius: var(--nu-r-pill); background: none; cursor: pointer; color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-md); font-weight: 600;
}
.lfo__voltar:hover { background: var(--nu-cream-2); }
.lfo__bloco-codigo { margin-top: 24px; }
.lfo__reenvio { display: flex; align-items: center; min-height: 44px; margin-top: 6px; }
.lfo__espera { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-variant-numeric: tabular-nums; }

/* a troca de passo: o novo sobe de leve no lugar do antigo */
.lfo-passo-enter-active { transition: opacity .25s ease, transform .38s cubic-bezier(.2, .8, .2, 1); }
.lfo-passo-leave-active { transition: opacity .15s ease; }
.lfo-passo-enter-from { opacity: 0; transform: translateY(10px); }
.lfo-passo-leave-to { opacity: 0; }

/* desktop e tablet: a coluna vira uma folha branca no creme */
@media (min-width: 768px) {
  .lfo { padding: 0 32px 48px; }
  .lfo__topo { min-height: 72px; }
  .lfo__miolo { align-items: center; }
  .lfo__folha {
    max-width: 440px; padding: 40px 40px 32px; margin-bottom: 72px; border-radius: var(--nu-r-card-lg); background: var(--nu-white);
    box-shadow: 0 0 0 1px var(--nu-navy-07), 0 30px 70px -36px var(--nu-navy-55);
  }
  .lfo__campo { background: var(--nu-cream); box-shadow: inset 0 0 0 1px var(--nu-cream-line); }
  .lfo__campo:focus { background: var(--nu-white); }
}
@media (prefers-reduced-motion: reduce) {
  .lfo-passo-enter-active, .lfo-passo-leave-active { transition: none; }
  .lfo__cta--indo::after { animation: none; }
}
</style>
