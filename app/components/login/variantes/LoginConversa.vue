<script setup lang="ts">
// PROTÓTIPO 4 do /login (04/11/2026, ?entrar=4 só no dev): "A conversa". O
// login como uma conversa com a Redentia, no idioma do painel do chat: a
// Redentia pergunta com o texto surgindo palavra por palavra (a keyframe
// nu-palavra do chat), a pessoa responde na pílula iridescente da barra do
// chat (ChatPilula), e o código chega como a próxima pergunta, na mesma
// pílula (LoginCodigo tom 'pilula'). Apple e Google ficam como atalhos sob a
// primeira pergunta; erros e avisos são falas da Redentia, logo acima da
// pílula. A lógica é a de pages/login.vue (porta); aqui é só a pele.
import type { PortaLogin } from '~/types/loginPorta'
import { DIAS_GRATIS, PRECO_MENSAL, formatarCelular } from '~/utils/assinatura'
import LoginCodigo from '../LoginCodigo.vue'

const props = defineProps<{ porta: PortaLogin }>()
const p = props.porta

interface Fala { id: string; quem: 'ela' | 'eu'; texto: string; tom?: 'erro' | 'aviso' | 'nota' }

const pergunta = computed(() => {
  const o = p.isPhone ? 'Qual é o seu celular?' : 'Qual é o seu e-mail?'
  if (p.vemDaAssinatura) return `Primeiro, a sua conta. ${o}`
  return p.isCad ? `Vamos criar a sua conta. ${o}` : `Oi, bom te ver. ${o}`
})
const destino = computed(() => (p.isPhone ? p.phone : p.email.trim()))

const falas = computed<Fala[]>(() => {
  const f: Fala[] = [{ id: `q-${pergunta.value}`, quem: 'ela', texto: pergunta.value }]
  if (p.step === 'identifier') {
    if (p.isCad) f.push({ id: 'plano', quem: 'ela', tom: 'nota', texto: `A conta é grátis. A carteira e a IA são da assinatura: ${DIAS_GRATIS} dias grátis, depois ${PRECO_MENSAL} por mês.` })
    if (p.identifierError) f.push({ id: `e-${p.identifierError}`, quem: 'ela', tom: 'erro', texto: p.identifierError })
    else if (p.whatsappDown && p.isPhone) f.push({ id: 'wpp', quem: 'ela', tom: 'aviso', texto: p.whatsappNotice })
    if (p.googleSubmitting) f.push({ id: 'social', quem: 'ela', texto: p.socialEntrando === 'apple' ? 'Entrando com a Apple…' : 'Entrando com o Google…' })
    else if (p.googleError) f.push({ id: `g-${p.googleError}`, quem: 'ela', tom: 'erro', texto: p.googleError })
    return f
  }
  f.push({ id: `eu-${destino.value}`, quem: 'eu', texto: destino.value })
  f.push({
    id: 'codigo', quem: 'ela',
    texto: p.isPhone
      ? 'Mandei 6 números no seu WhatsApp. Valem 5 minutos. Qual é o código?'
      : 'Mandei 6 números para o seu e-mail. Valem 10 minutos. Qual é o código?',
  })
  if (p.pinError) f.push({ id: `pe-${p.pinError}`, quem: 'ela', tom: 'erro', texto: p.pinError })
  else if (p.verifying) f.push({ id: 'conferindo', quem: 'ela', texto: 'Conferindo o código…' })
  return f
})

// cada palavra sai do desfoque, 38 ms depois da anterior, e a fila não passa de 900 ms
const palavras = (t: string) => t.split(/\s+/).filter(Boolean).map((w, i) => ({ w, atraso: Math.min(i * 38, 900) }))

const campo = ref<HTMLInputElement | null>(null)
const focado = ref(false)
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
  <div class="lcv">
    <header class="lcv__topo">
      <NuTopoMarca :tamanho="22" />
    </header>

    <main class="lcv__palco">
      <div class="lcv__falas" aria-live="polite">
        <template v-for="(f, k) in falas" :key="f.id">
          <div class="lcv__fala" :class="[`lcv__fala--${f.quem}`, f.tom ? `lcv__fala--${f.tom}` : '', { 'lcv__fala--primeira': k === 0 }]">
            <template v-if="f.quem === 'ela'">
              <img src="/logo-azul.svg" alt="" width="18" height="18" class="lcv__avatar">
              <component :is="k === 0 ? 'h1' : 'p'" class="lcv__texto"><template v-for="(x, i) in palavras(f.texto)" :key="i"><span class="lcv__palavra" :style="{ animationDelay: `${x.atraso}ms` }">{{ x.w }}</span>{{ ' ' }}</template></component>
            </template>
            <p v-else class="lcv__bolha">{{ f.texto }}</p>
          </div>
          <!-- os atalhos, sob a primeira pergunta -->
          <div v-if="k === 0 && p.step === 'identifier'" class="lcv__atalhos">
            <p class="lcv__rotulo">Ou entre direto</p>
            <div class="lcv__marcas">
              <LoginAppleButton :disabled="p.googleSubmitting" @credential="p.onAppleCredential" @error="p.googleError = $event" />
              <LoginGoogleButton :disabled="p.googleSubmitting" @credential="p.onGoogleCredential" @error="p.googleError = $event" />
            </div>
          </div>
        </template>
      </div>

      <div ref="bloco" class="lcv__compositor">
        <form v-if="p.step === 'identifier'" class="lcv__form" novalidate @submit.prevent="p.submitIdentifier()">
          <ChatPilula :aceso="focado || !!(p.isPhone ? p.phone : p.email)">
            <div class="lcv__linha" @click="campo?.focus()">
              <label class="lcv__oculto" for="lcv-campo">{{ p.isPhone ? 'Seu celular com DDD' : 'Seu e-mail' }}</label>
              <input
                id="lcv-campo" ref="campo" class="lcv__campo" :value="p.isPhone ? p.phone : p.email"
                :type="p.isPhone ? 'tel' : 'email'" :inputmode="p.isPhone ? 'tel' : 'email'" :name="p.isPhone ? 'phone' : 'email'"
                :autocomplete="p.isPhone ? 'tel-national' : 'email'" enterkeyhint="send" autocapitalize="off" autocorrect="off" spellcheck="false"
                :placeholder="p.isPhone ? '(11) 90000-0000' : 'voce@email.com'" :aria-invalid="!!p.identifierError"
                @input="aoDigitar" @focus="focado = true" @blur="focado = false"
              >
              <button
                type="submit" class="lcv__enviar" :class="{ 'lcv__enviar--pronto': p.ready, 'lcv__enviar--indo': p.sending }"
                :disabled="!p.ready || p.sending" :aria-label="p.sending ? 'Enviando o código' : 'Enviar o código'"
              >
                <span v-if="p.sending" class="lcv__indo">Enviando…</span>
                <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
              </button>
            </div>
          </ChatPilula>
        </form>
        <div v-else class="lcv__form lcv__form--codigo">
          <ChatPilula :aceso="true">
            <div class="lcv__linha lcv__linha--codigo">
              <LoginCodigo tom="pilula" :verifying="p.verifying" :error="p.pinError" @submit="p.verifyPin" />
            </div>
          </ChatPilula>
        </div>

        <div class="lcv__chips">
          <template v-if="p.step === 'identifier'">
            <span v-if="p.whatsappDown && !p.isPhone" class="lcv__chip lcv__chip--fora">WhatsApp fora do ar</span>
            <button v-else type="button" class="lcv__chip" @click="trocarCanal">{{ p.isPhone ? 'Prefiro por e-mail' : 'Prefiro pelo WhatsApp' }}</button>
            <button type="button" class="lcv__chip" @click="p.toggleMode()">{{ p.isCad ? 'Já tenho conta' : 'Criar conta' }}</button>
          </template>
          <template v-else>
            <button v-if="p.resendIn === 0" type="button" class="lcv__chip" :disabled="p.verifying" @click="p.resendPin()">Reenviar o código</button>
            <span v-else class="lcv__chip lcv__chip--espera">Reenviar em {{ p.resendIn }} s</span>
            <button type="button" class="lcv__chip" @click="p.backToIdentifier()">{{ p.isPhone ? 'Trocar o número' : 'Trocar o e-mail' }}</button>
          </template>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.lcv {
  min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; background: var(--nu-white); overflow-x: clip;
  padding: 0 max(16px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
}
.lcv__topo { display: flex; align-items: center; min-height: 56px; padding-top: env(safe-area-inset-top); width: 100%; max-width: 560px; margin: 0 auto; }
.lcv__topo :deep(.ntm) { min-height: 44px; }
.lcv__palco { flex: 1; width: 100%; max-width: 560px; margin: 0 auto; padding-top: clamp(8px, 4vh, 40px); }

.lcv__falas { display: flex; flex-direction: column; gap: 14px; }
.lcv__fala { display: flex; gap: 10px; }
.lcv__fala--ela { align-items: flex-start; }
.lcv__fala--eu { justify-content: flex-end; }
.lcv__avatar { flex-shrink: 0; margin-top: 4px; }
.lcv__texto { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 700; letter-spacing: -0.01em; line-height: 1.45; }
/* a primeira pergunta é o título da tela */
.lcv__fala--primeira .lcv__texto { font-size: clamp(24px, 6.6vw, 30px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; }
.lcv__fala--nota .lcv__texto { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; }
.lcv__fala--erro .lcv__texto { color: var(--nu-red-text); font-size: var(--nu-fs-md); font-weight: 600; }
.lcv__fala--aviso .lcv__texto { color: var(--nu-amber-text); font-size: var(--nu-fs-md); font-weight: 600; }
.lcv__palavra { display: inline-block; animation: nu-palavra .52s cubic-bezier(.22, 1, .36, 1) backwards; }
.lcv__bolha {
  margin: 0; max-width: 88%; padding: 11px 16px; border-radius: 20px 20px 6px 20px; background: var(--nu-cream);
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 600; line-height: 1.5; overflow-wrap: anywhere;
  animation: nu-fade .3s ease both;
}

.lcv__atalhos { margin: 4px 0 8px 28px; }
.lcv__rotulo { margin: 0 0 10px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; }
.lcv__marcas { display: flex; flex-direction: column; gap: 8px; }
.lcv__atalhos:has(.lcv__marcas:empty) { display: none; }

.lcv__compositor { margin-top: 22px; }
.lcv__form { --cpi-raio: 28px; }
.lcv__linha { display: flex; align-items: center; gap: 10px; min-height: 56px; padding: 0 6px 0 18px; cursor: text; }
.lcv__linha--codigo { padding: 6px; }
.lcv__linha--codigo > * { flex: 1; }
.lcv__oculto { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.lcv__campo {
  flex: 1; min-width: 0; height: 52px; border: 0; outline: 0; background: transparent; font: inherit;
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 600;
}
.lcv__campo::placeholder { color: var(--nu-gray); font-weight: 500; }
.lcv__enviar {
  flex-shrink: 0; min-width: 44px; height: 44px; padding: 0; border: 0; border-radius: var(--nu-r-pill); cursor: pointer;
  display: grid; place-items: center; background: var(--nu-cream-2); color: var(--nu-gray);
  transition: background .2s ease, color .2s ease, transform .2s ease, padding .25s ease;
}
.lcv__enviar--pronto { background: var(--nu-blue); color: var(--nu-white); }
.lcv__enviar--pronto:hover:not(:disabled) { transform: scale(1.05); }
.lcv__enviar:disabled { cursor: default; }
.lcv__enviar--indo { padding: 0 16px; background: var(--nu-blue); color: var(--nu-white); }
.lcv__indo { font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; }
.lcv__enviar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.lcv__chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.lcv__chip {
  display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; cursor: pointer;
  transition: background .15s ease;
}
.lcv__chip:hover:not(:disabled) { background: var(--nu-cream-2); }
.lcv__chip:disabled { color: var(--nu-gray); cursor: default; }
.lcv__chip:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.lcv__chip--fora { background: var(--nu-amber-bg); color: var(--nu-amber-text); cursor: default; }
.lcv__chip--espera { color: var(--nu-gray); cursor: default; font-variant-numeric: tabular-nums; }

@media (min-width: 768px) {
  .lcv__topo { min-height: 80px; }
  .lcv__palco { padding-top: clamp(40px, 12vh, 120px); }
}
@media (prefers-reduced-motion: reduce) {
  .lcv__palavra, .lcv__bolha { animation: none; }
  .lcv__enviar { transition: none; }
}
</style>
