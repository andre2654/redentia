<script setup lang="ts">
// /login · variação 1, "A pergunta" (protótipo de 03/11/2026, ?entrar=1 no dev).
// Uma coluna só no centro do creme, como a página de conta da Apple. O único
// momento bonito é o campo: o celular (ou o e-mail) se digita dentro da pílula
// iridescente do chat (ChatPilula), com o botão redondo de enviar no fim, e o
// código de 6 números chega na mesma pílula. O título entra palavra por
// palavra, saindo do desfoque, como a resposta do herói da pergunta. O resto é
// calmo: Apple e Google com a cara de cada marca, a troca de canal, a troca de
// modo. A lógica é a de pages/login.vue (porta).
import type { PortaLogin } from '~/types/loginPorta'
import { DIAS_GRATIS, PRECO_MENSAL, formatarCelular } from '~/utils/assinatura'
import LoginCodigo from './LoginCodigo.vue'

const props = defineProps<{ porta: PortaLogin }>()
const p = props.porta

const titulo = computed(() => {
  if (p.step === 'pin') return 'Digite o código.'
  if (p.vemDaAssinatura) return 'Primeiro, a sua conta.'
  return p.isCad ? 'Uma conta. Nenhuma senha.' : 'Entre na Redentia.'
})
const palavras = computed(() => titulo.value.split(' '))
const dek = computed(() => {
  const onde = p.isPhone ? 'no seu WhatsApp' : 'no seu e-mail'
  return p.isCad || p.vemDaAssinatura
    ? `Um código de 6 números chega ${onde} e a conta está criada.`
    : `Sem senha. Um código chega ${onde} e você está dentro.`
})
const enviadoPara = computed(() =>
  p.isPhone
    ? { antes: 'Mandamos 6 números para o WhatsApp', para: p.phone, depois: 'Valem 5 minutos.' }
    : { antes: 'Mandamos 6 números para', para: p.email.trim(), depois: 'Valem 10 minutos.' },
)

const focado = ref(false)
const valor = computed(() => (p.isPhone ? p.phone : p.email))
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
function trocarMetodo() {
  p.toggleMethod()
  nextTick(() => campo.value?.focus())
}
</script>

<template>
  <div class="lvp">
    <header class="lvp__topo"><NuTopoMarca /></header>

    <main class="lvp__miolo">
      <div :key="p.step" class="lvp__passo">
        <AssinaturaJornada v-if="p.vemDaAssinatura && p.step === 'identifier'" class="lvp__jornada" :passo="1" compacto />
        <h1 :key="titulo" class="lvp__titulo">
          <template v-for="(w, k) in palavras" :key="k"><span class="lvp__palavra" :style="{ '--k': k }">{{ w }}</span>{{ ' ' }}</template>
        </h1>

        <!-- 1 · o contato, dentro da pílula -->
        <template v-if="p.step === 'identifier'">
          <p class="lvp__dek">{{ dek }}</p>
          <form class="lvp__form" novalidate @submit.prevent="p.submitIdentifier()">
            <label class="lvp__so-leitor" for="lvp-campo">{{ p.isPhone ? 'Seu celular com DDD' : 'Seu e-mail' }}</label>
            <ChatPilula class="lvp__pilula" :aceso="focado || !!valor">
              <div class="lvp__barra">
                <img src="/logo-azul.svg" alt="" width="20" height="20" class="lvp__logo">
                <input
                  id="lvp-campo" ref="campo" class="lvp__campo" :value="valor"
                  :type="p.isPhone ? 'tel' : 'email'" :inputmode="p.isPhone ? 'numeric' : 'email'"
                  :name="p.isPhone ? 'phone' : 'email'" :autocomplete="p.isPhone ? 'tel-national' : 'email'"
                  :placeholder="p.isPhone ? '(11) 90000-0000' : 'voce@email.com'"
                  :aria-describedby="'lvp-ajuda'" :aria-invalid="!!p.identifierError"
                  @input="aoDigitar" @focus="focado = true" @blur="focado = false"
                >
                <button
                  type="submit" class="lvp__enviar" :class="{ 'lvp__enviar--pronto': p.ready, 'lvp__enviar--indo': p.sending }"
                  :disabled="!p.ready || p.sending" :aria-label="p.mainCta"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </button>
              </div>
            </ChatPilula>
            <p id="lvp-ajuda" class="lvp__nota" :class="{ 'lvp__nota--erro': p.identifierError }" aria-live="polite">
              <template v-if="p.identifierError">{{ p.identifierError }}</template>
              <template v-else-if="p.whatsappDown && p.isPhone">{{ p.whatsappNotice }}</template>
              <template v-else-if="p.sending">Enviando o código…</template>
            </p>
          </form>

          <div class="lvp__ou" role="separator"><span>ou</span></div>
          <div class="lvp__marcas">
            <LoginAppleButton :disabled="p.googleSubmitting" @credential="p.onAppleCredential" @error="p.googleError = $event" />
            <LoginGoogleButton :disabled="p.googleSubmitting" @credential="p.onGoogleCredential" @error="p.googleError = $event" />
            <button type="button" class="lvp__metodo" @click="trocarMetodo">
              <svg v-if="p.isPhone" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 7l8.5 6 8.5-6" /></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M11 18.5h2" /></svg>
              {{ p.methodCta }}
            </button>
          </div>
          <p v-if="p.googleSubmitting" class="lvp__nota" aria-live="polite">{{ p.socialEntrando === 'apple' ? 'Entrando com a Apple…' : 'Entrando com o Google…' }}</p>
          <p v-else-if="p.googleError" class="lvp__nota lvp__nota--erro" role="alert">{{ p.googleError }}</p>

          <p v-if="p.isCad" class="lvp__plano">A conta é grátis. A carteira e a IA são da assinatura: {{ DIAS_GRATIS }} dias grátis, depois {{ PRECO_MENSAL }} por mês.</p>
          <p class="lvp__pe">{{ p.altLabel }} <button type="button" class="lvp__link" @click="p.toggleMode()">{{ p.altCta }}</button></p>
        </template>

        <!-- 2 · o código, na mesma pílula -->
        <template v-else>
          <p class="lvp__dek">{{ enviadoPara.antes }} <b>{{ enviadoPara.para }}</b>. {{ enviadoPara.depois }}</p>
          <ChatPilula class="lvp__pilula lvp__pilula--codigo" aceso>
            <div class="lvp__barra lvp__barra--codigo">
              <LoginCodigo tom="pilula" :verifying="p.verifying" :error="p.pinError" class="lvp__codigo" @submit="p.verifyPin" />
            </div>
          </ChatPilula>
          <p class="lvp__nota" :class="{ 'lvp__nota--erro': p.pinError }" aria-live="polite">
            <template v-if="p.pinError">{{ p.pinError }}</template>
            <template v-else-if="p.verifying">Conferindo o código…</template>
            <template v-else>Com os 6 números você entra. Não precisa apertar nada.</template>
          </p>
          <div class="lvp__links">
            <button v-if="p.resendIn === 0" type="button" class="lvp__link" :disabled="p.verifying" @click="p.resendPin()">Reenviar código</button>
            <span v-else class="lvp__espera">Reenviar em {{ p.resendIn }} s</span>
            <button type="button" class="lvp__link" @click="p.backToIdentifier()">{{ p.isPhone ? 'Trocar o número' : 'Trocar o e-mail' }}</button>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<style scoped>
.lvp {
  min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column;
  background: var(--nu-cream); color: var(--nu-ink); overflow-x: clip;
}
.lvp__topo { padding: 22px clamp(16px, 4vw, 40px); }
.lvp__miolo { flex: 1; display: flex; justify-content: center; align-items: flex-start; padding: clamp(24px, 12vh, 140px) 16px 56px; }
.lvp__passo { width: 100%; max-width: 460px; text-align: center; }
.lvp__jornada { margin: 0 auto 28px; text-align: left; }

.lvp__titulo {
  margin: 0; font-size: clamp(34px, 4.2vw, 52px); font-weight: 600; letter-spacing: -0.045em; line-height: 1.05; text-wrap: balance;
}
.lvp__palavra { display: inline-block; animation: lvp-palavra .6s cubic-bezier(.22, 1, .36, 1) backwards; animation-delay: calc(var(--k) * 70ms); }
@keyframes lvp-palavra { from { opacity: 0; filter: blur(8px); transform: translateY(8px); } }
.lvp__dek { margin: 14px auto 0; max-width: 36ch; color: var(--nu-gray-2); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; text-wrap: balance; }
.lvp__dek b { color: var(--nu-ink); font-weight: 700; white-space: nowrap; }

/* a pílula: a barra do chat, com o campo e o botão de enviar */
.lvp__form { margin-top: clamp(28px, 4vh, 40px); }
.lvp__pilula { --cpi-raio: 32px; }
.lvp__pilula--codigo { margin-top: clamp(28px, 4vh, 40px); }
.lvp__barra { display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 0 8px 0 20px; }
.lvp__barra--codigo { padding: 8px; }
.lvp__logo { flex: none; }
.lvp__campo {
  flex: 1; min-width: 0; height: 56px; padding: 0; border: 0; outline: none; background: transparent;
  color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-lg); font-weight: 500; font-variant-numeric: tabular-nums;
}
.lvp__campo::placeholder { color: var(--nu-placeholder); }
.lvp__enviar {
  flex: none; width: 44px; height: 44px; border: 0; border-radius: 50%; display: grid; place-items: center; cursor: pointer;
  background: var(--nu-cream-2); color: var(--nu-gray); transition: background .2s, color .2s, transform .2s;
}
.lvp__enviar--pronto { background: var(--nu-ink); color: var(--nu-white); }
.lvp__enviar--pronto:hover { background: var(--nu-blue); }
.lvp__enviar--indo { background: var(--nu-blue); color: var(--nu-white); animation: lvp-pulso .9s ease-in-out infinite; }
.lvp__enviar:disabled { cursor: default; }
.lvp__enviar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
@keyframes lvp-pulso { 50% { transform: scale(.9); } }
.lvp__codigo { flex: 1; }

.lvp__nota { margin: 14px auto 0; max-width: 40ch; min-height: 1.5em; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.lvp__nota--erro { color: var(--nu-red-text); font-weight: 600; }

.lvp__ou { display: flex; align-items: center; gap: 14px; margin-top: 30px; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 600; }
.lvp__ou::before, .lvp__ou::after { content: ''; flex: 1; height: 1px; background: var(--nu-cream-line); }
.lvp__marcas { display: flex; flex-direction: column; gap: 10px; margin-top: 22px; }
.lvp__metodo {
  display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 52px; padding: 0 20px;
  border: 0; border-radius: var(--nu-r-pill); background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-cream-line);
  color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-md); font-weight: 700; cursor: pointer; transition: box-shadow .2s;
}
.lvp__metodo:hover { box-shadow: inset 0 0 0 1px var(--nu-sand); }
.lvp__metodo:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

.lvp__plano { margin: 26px auto 0; max-width: 38ch; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.5; }
.lvp__pe { margin: 26px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; }
.lvp__link {
  padding: 2px 0; border: 0; background: none; cursor: pointer;
  color: var(--nu-blue-text); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; border-radius: 4px;
}
.lvp__link:disabled { color: var(--nu-gray); cursor: default; }
.lvp__link:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
.lvp__links { display: flex; justify-content: center; gap: 24px; margin-top: 22px; }
.lvp__espera { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums; }
.lvp__so-leitor { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.lvp__passo { animation: nu-fade .5s ease both; }

@media (max-width: 560px) {
  .lvp__topo { padding: 16px; }
  .lvp__miolo { padding-top: 20px; }
  .lvp__titulo { font-size: clamp(31px, 8.6vw, 36px); }
  .lvp__barra { padding-left: 16px; gap: 10px; }
  .lvp__campo { font-size: var(--nu-fs-md); }
  .lvp__barra--codigo { padding: 6px; }
}
@media (prefers-reduced-motion: reduce) {
  .lvp__palavra, .lvp__passo, .lvp__enviar--indo { animation: none; }
}
</style>
