<script setup lang="ts">
// /login · variação 2, "A noite" (protótipo de 03/11/2026, ?entrar=2 no dev).
// A tela inteira no escuro do herói do visitante (HomeHeroVisitante): o navy
// do rodapé no alto descendo ao preto das telas do app. O formulário à
// esquerda, quieto, em traços de luz; à direita o único momento bonito, o Mac,
// o iPhone e o relógio flutuando sobre o chão de vidro, com a linha de luz no
// horizonte nas cores da barra da Redentia. No celular os aparelhos descem
// para baixo do formulário (o campo fica no alto quando o teclado abre) e
// somem no passo do código. Apple na pílula branca e Google no tema escuro,
// os dois do guia de cada marca. A lógica é a de pages/login.vue (porta).
import type { PortaLogin } from '~/types/loginPorta'
import { DIAS_GRATIS, PRECO_MENSAL, formatarCelular } from '~/utils/assinatura'
import { fraseDosApps } from '~/utils/appsRedentia'
import LoginCodigo from './LoginCodigo.vue'

const props = defineProps<{ porta: PortaLogin }>()
const p = props.porta

const MAC = {
  avif: '/img/home/mac-simulacao-880.avif 880w, /img/home/mac-simulacao-1320.avif 1320w',
  webp: '/img/home/mac-simulacao-820.webp 820w, /img/home/mac-simulacao-1640.webp 1640w',
  sizes: '(max-width: 1023px) calc(100vw - 32px), min(720px, 46vw)',
}
const IPHONE = { srcset: '/img/home/iphone-detalhes-260.webp 260w, /img/home/iphone-detalhes-520.webp 520w', sizes: '(max-width: 1023px) 30vw, min(160px, 10vw)' }
const WATCH = { srcset: '/img/home/watch-detalhes-200.webp 200w, /img/home/watch-detalhes-400.webp 400w', sizes: 'min(110px, 7vw)' }

const titulo = computed(() => {
  if (p.step === 'pin') return 'Digite o código.'
  if (p.vemDaAssinatura) return 'Primeiro, a sua conta.'
  return p.isCad ? 'Uma conta. Nenhuma senha.' : 'Entre. O resto é com a gente.'
})
const dek = computed(() => {
  if (p.step === 'pin') {
    return p.isPhone ? `Mandamos 6 números para o WhatsApp ${p.phone}. Valem 5 minutos.` : `Mandamos 6 números para ${p.email.trim()}. Valem 10 minutos.`
  }
  return p.isCad || p.vemDaAssinatura ? 'Um código de 6 números e ela está criada.' : 'Sem senha: um código de 6 números e você está dentro.'
})
const legenda = `Uma conta só. ${fraseDosApps()}`

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
  <div class="lvn" :class="{ 'lvn--codigo': p.step === 'pin' }">
    <div class="lvn__ceu" aria-hidden="true" />

    <div class="lvn__coluna">
      <NuxtLink to="/" class="lvn__marca" aria-label="Redentia, início">
        <img src="/logo-branca.svg" alt="" width="22" height="22">Redentia
      </NuxtLink>

      <main :key="p.step" class="lvn__form">
        <AssinaturaJornada v-if="p.vemDaAssinatura && p.step === 'identifier'" class="lvn__jornada" :passo="1" compacto escuro />
        <h1 class="lvn__titulo">{{ titulo }}</h1>
        <p class="lvn__dek">{{ dek }}</p>

        <template v-if="p.step === 'identifier'">
          <form class="lvn__campo-bloco" novalidate @submit.prevent="p.submitIdentifier()">
            <label class="lvn__rotulo" for="lvn-campo">{{ p.isPhone ? 'Celular com DDD' : 'E-mail' }}</label>
            <input
              id="lvn-campo" ref="campo" class="lvn__campo" :value="p.isPhone ? p.phone : p.email"
              :type="p.isPhone ? 'tel' : 'email'" :inputmode="p.isPhone ? 'numeric' : 'email'"
              :name="p.isPhone ? 'phone' : 'email'" :autocomplete="p.isPhone ? 'tel-national' : 'email'"
              :placeholder="p.isPhone ? '(11) 90000-0000' : 'voce@email.com'" :aria-invalid="!!p.identifierError"
              aria-describedby="lvn-nota" @input="aoDigitar"
            >
            <p id="lvn-nota" class="lvn__nota" :class="{ 'lvn__nota--erro': p.identifierError }" aria-live="polite">
              <template v-if="p.identifierError">{{ p.identifierError }}</template>
              <template v-else-if="p.whatsappDown && p.isPhone">{{ p.whatsappNotice }}</template>
              <template v-else>{{ p.fieldHelp }}</template>
            </p>
            <button type="submit" class="lvn__cta" :class="{ 'lvn__cta--indo': p.sending }" :disabled="!p.ready || p.sending">
              {{ p.mainCta }}
            </button>
          </form>

          <div class="lvn__ou" role="separator"><span>ou</span></div>
          <div class="lvn__marcas">
            <LoginAppleButton tom="branco" :disabled="p.googleSubmitting" @credential="p.onAppleCredential" @error="p.googleError = $event" />
            <LoginGoogleButton tom="escuro" :disabled="p.googleSubmitting" @credential="p.onGoogleCredential" @error="p.googleError = $event" />
            <button type="button" class="lvn__metodo" @click="trocarMetodo">{{ p.methodCta }}</button>
          </div>
          <p v-if="p.googleSubmitting" class="lvn__nota" aria-live="polite">{{ p.socialEntrando === 'apple' ? 'Entrando com a Apple…' : 'Entrando com o Google…' }}</p>
          <p v-else-if="p.googleError" class="lvn__nota lvn__nota--erro" role="alert">{{ p.googleError }}</p>

          <p v-if="p.isCad" class="lvn__plano">A conta é grátis. A carteira e a IA são da assinatura: {{ DIAS_GRATIS }} dias grátis, depois {{ PRECO_MENSAL }} por mês.</p>
          <p class="lvn__pe">{{ p.altLabel }} <button type="button" class="lvn__link" @click="p.toggleMode()">{{ p.altCta }}</button></p>
        </template>

        <template v-else>
          <div class="lvn__campo-bloco">
            <LoginCodigo tom="escuro" :verifying="p.verifying" :error="p.pinError" @submit="p.verifyPin" />
            <p class="lvn__nota" :class="{ 'lvn__nota--erro': p.pinError }" aria-live="polite">
              <template v-if="p.pinError">{{ p.pinError }}</template>
              <template v-else-if="p.verifying">Conferindo o código…</template>
              <template v-else>Com os 6 números você entra, sem apertar nada.</template>
            </p>
          </div>
          <div class="lvn__links">
            <button v-if="p.resendIn === 0" type="button" class="lvn__link" :disabled="p.verifying" @click="p.resendPin()">Reenviar código</button>
            <span v-else class="lvn__espera">Reenviar em {{ p.resendIn }} s</span>
            <button type="button" class="lvn__link" @click="p.backToIdentifier()">{{ p.isPhone ? 'Trocar o número' : 'Trocar o e-mail' }}</button>
          </div>
        </template>
      </main>
    </div>

    <!-- o momento: os três aparelhos no chão de vidro -->
    <div class="lvn__palco" aria-hidden="true">
      <div class="lvn__halo" />
      <div class="lvn__cena">
        <picture class="lvn__ap lvn__ap--mac">
          <source type="image/avif" :srcset="MAC.avif" :sizes="MAC.sizes">
          <img :srcset="MAC.webp" :sizes="MAC.sizes" src="/img/home/mac-simulacao-1640.webp" width="1640" height="1025" alt="" decoding="async">
        </picture>
        <img class="lvn__ap lvn__ap--watch" :srcset="WATCH.srcset" :sizes="WATCH.sizes" src="/img/home/watch-detalhes-400.webp" width="400" height="490" alt="" decoding="async">
        <img class="lvn__ap lvn__ap--iphone" :srcset="IPHONE.srcset" :sizes="IPHONE.sizes" src="/img/home/iphone-detalhes-520.webp" width="520" height="1099" alt="" decoding="async">
      </div>
      <div class="lvn__reflexo">
        <picture class="lvn__ap lvn__ap--mac">
          <source type="image/avif" :srcset="MAC.avif" :sizes="MAC.sizes">
          <img :srcset="MAC.webp" :sizes="MAC.sizes" src="/img/home/mac-simulacao-1640.webp" width="1640" height="1025" alt="" decoding="async">
        </picture>
        <img class="lvn__ap lvn__ap--watch" :srcset="WATCH.srcset" :sizes="WATCH.sizes" src="/img/home/watch-detalhes-400.webp" width="400" height="490" alt="" decoding="async">
        <img class="lvn__ap lvn__ap--iphone" :srcset="IPHONE.srcset" :sizes="IPHONE.sizes" src="/img/home/iphone-detalhes-520.webp" width="520" height="1099" alt="" decoding="async">
      </div>
      <div class="lvn__horizonte" />
      <p class="lvn__legenda">{{ legenda }}</p>
    </div>
  </div>
</template>

<style scoped>
.lvn {
  --g: clamp(16px, 5vw, 72px);
  position: relative; isolation: isolate; overflow: hidden;
  min-height: 100vh; min-height: 100dvh;
  display: grid; grid-template-columns: minmax(360px, 460px) minmax(0, 1fr); align-items: center; gap: clamp(32px, 5vw, 96px);
  padding: 0 var(--g);
  background: var(--nu-agora-bg); color: var(--nu-agora-texto);
}
.lvn__ceu {
  position: absolute; inset: 0; z-index: -2; pointer-events: none;
  background:
    radial-gradient(50% 40% at 72% 30%, color-mix(in srgb, var(--nu-blue) 14%, transparent), transparent),
    linear-gradient(180deg, var(--nu-navy) 0%, color-mix(in srgb, var(--nu-navy) 50%, var(--nu-agora-bg)) 48%, var(--nu-agora-bg) 82%);
}

.lvn__coluna { display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh; padding: 26px 0 40px; }
.lvn__marca {
  display: inline-flex; align-self: flex-start; align-items: center; gap: 9px; border-radius: var(--nu-r-chip);
  color: var(--nu-agora-texto); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.03em;
}
.lvn__marca:focus-visible { outline: 2px solid var(--nu-white); outline-offset: 4px; }
.lvn__form { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: clamp(32px, 8vh, 80px) 0 0; animation: nu-fade .5s ease both; }
.lvn__jornada { margin-bottom: 26px; }

.lvn__titulo {
  margin: 0; font-size: clamp(36px, 3.6vw, 54px); font-weight: 500; letter-spacing: -0.05em; line-height: 1.04; text-wrap: balance;
  color: var(--nu-agora-texto);
  background: linear-gradient(180deg, var(--nu-agora-texto) 35%, var(--nu-cream-text-70) 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.lvn__dek { margin: 14px 0 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; overflow-wrap: anywhere; }

.lvn__campo-bloco { display: flex; flex-direction: column; margin-top: clamp(30px, 5vh, 44px); }
.lvn__rotulo { color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 600; }
.lvn__campo {
  width: 100%; margin-top: 6px; padding: 10px 0 12px; border: 0; border-bottom: 2px solid var(--nu-white-18); border-radius: 0; outline: none;
  background: transparent; color: var(--nu-agora-texto); font: inherit; font-size: clamp(20px, 1.8vw, 24px); font-weight: 500;
  font-variant-numeric: tabular-nums; caret-color: var(--nu-agora-azul); transition: border-color .2s, box-shadow .2s;
}
.lvn__campo::placeholder { color: var(--nu-white-30); }
.lvn__campo:focus { border-bottom-color: var(--nu-agora-azul); box-shadow: 0 14px 22px -18px var(--nu-agora-azul); }
.lvn__nota { margin: 12px 0 0; min-height: 1.5em; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.lvn__nota--erro { color: var(--nu-red-soft); font-weight: 600; }

/* o botão: a pílula branca da chamada no escuro */
.lvn__cta {
  position: relative; overflow: hidden; margin-top: 22px; min-height: 54px; border: 0; border-radius: var(--nu-r-pill); cursor: pointer;
  background: var(--nu-white); color: var(--nu-ink); font: inherit; font-size: var(--nu-fs-md); font-weight: 800; transition: background .2s, color .2s;
}
.lvn__cta:hover:not(:disabled) { background: var(--nu-cream); }
.lvn__cta:disabled { background: var(--nu-white-14); color: var(--nu-agora-sub); cursor: default; }
.lvn__cta--indo:disabled { background: var(--nu-white); color: var(--nu-ink); }
/* enviando: uma luz atravessa o próprio botão */
.lvn__cta--indo::after {
  content: ''; position: absolute; inset: 0; transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--nu-blue) 22%, transparent), transparent);
  animation: lvn-luz 1.2s ease-in-out infinite;
}
@keyframes lvn-luz { to { transform: translateX(100%); } }
.lvn__cta:focus-visible { outline: 2px solid var(--nu-white); outline-offset: 3px; }

.lvn__ou { display: flex; align-items: center; gap: 14px; margin-top: 28px; color: var(--nu-agora-sub); font-size: var(--nu-fs-dense); font-weight: 600; }
.lvn__ou::before, .lvn__ou::after { content: ''; flex: 1; height: 1px; background: var(--nu-agora-linha); }
.lvn__marcas { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
.lvn__metodo {
  min-height: 52px; padding: 0 20px; border: 0; border-radius: var(--nu-r-pill); cursor: pointer;
  background: transparent; box-shadow: inset 0 0 0 1px var(--nu-white-18); color: var(--nu-agora-texto);
  font: inherit; font-size: var(--nu-fs-md); font-weight: 700; transition: background .2s;
}
.lvn__metodo:hover { background: var(--nu-agora-pilula); }
.lvn__metodo:focus-visible { outline: 2px solid var(--nu-white); outline-offset: 3px; }

.lvn__plano { margin: 24px 0 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.5; }
.lvn__pe { margin: 24px 0 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 500; }
.lvn__link {
  padding: 2px 0; border: 0; border-radius: 4px; background: none; cursor: pointer;
  color: var(--nu-agora-azul); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700;
}
.lvn__link:disabled { color: var(--nu-agora-sub); cursor: default; }
.lvn__link:focus-visible { outline: 2px solid var(--nu-white); outline-offset: 3px; }
.lvn__links { display: flex; gap: 24px; margin-top: 26px; }
.lvn__espera { color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 500; font-variant-numeric: tabular-nums; }

/* ——— o palco (a mesma cena do herói "A noite", menor) ——— */
.lvn__palco { --chao: clamp(48px, 5vw, 80px); position: relative; padding-bottom: var(--chao); animation: lvn-sobe 1.1s cubic-bezier(.2, .8, .2, 1) .1s backwards; }
.lvn__halo {
  position: absolute; z-index: -1; left: 50%; top: -8%; width: 120%; height: 80%; transform: translateX(-50%); border-radius: 50%;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--nu-blue) 22%, transparent), transparent); filter: blur(20px);
}
.lvn__cena, .lvn__reflexo { position: relative; width: 100%; aspect-ratio: 100 / 62; }
.lvn__ap { position: absolute; display: block; }
.lvn__ap > img { display: block; width: 100%; height: auto; }
img.lvn__ap { height: auto; }
.lvn__ap--mac { left: 6%; top: 0; width: 88%; }
.lvn__ap--iphone { right: 0; top: 35.2%; width: 19%; }
.lvn__ap--watch { left: 1%; top: 74.4%; width: 13%; }
.lvn__cena .lvn__ap--mac img { border-radius: 1.1% / 1.76%; box-shadow: 0 0 0 1px var(--nu-white-14), 0 -1px 0 0 var(--nu-white-30); }
.lvn__cena .lvn__ap--iphone, .lvn__cena .lvn__ap--watch { filter: drop-shadow(0 24px 40px var(--nu-agora-bg)); }
.lvn__cena .lvn__ap--iphone { animation: lvn-flutua 7s ease-in-out infinite; }
.lvn__cena .lvn__ap--watch { animation: lvn-flutua 7s ease-in-out -3.5s infinite; }
@keyframes lvn-flutua { 50% { transform: translateY(-1.6%); } }
.lvn__reflexo {
  position: absolute; left: 0; top: calc(100% - var(--chao)); pointer-events: none; transform: scaleY(-1); margin-top: -1px;
  filter: blur(7px); opacity: .3;
  -webkit-mask-image: linear-gradient(0deg, var(--nu-agora-bg) 0%, transparent 15%);
  mask-image: linear-gradient(0deg, var(--nu-agora-bg) 0%, transparent 15%);
}
.lvn__horizonte {
  position: absolute; left: -16%; right: -16%; top: calc(100% - var(--chao)); height: 2px; border-radius: 50%; pointer-events: none;
  background: linear-gradient(90deg, transparent 4%, var(--nu-chat-luz-1) 24%, var(--nu-white-60) 50%, var(--nu-chat-luz-3) 76%, transparent 96%);
  box-shadow: 0 0 18px 3px var(--nu-chat-luz-1), 0 0 60px 14px var(--nu-chat-luz-2), 0 -40px 120px 20px color-mix(in srgb, var(--nu-blue) 14%, transparent);
}
.lvn__legenda { position: absolute; left: 0; right: 0; bottom: 0; margin: 0; text-align: center; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 500; }
@keyframes lvn-sobe { from { opacity: 0; transform: translateY(24px); } }

/* tablet e celular: uma coluna; os aparelhos embaixo do formulário */
@media (max-width: 1023px) {
  .lvn { grid-template-columns: minmax(0, 1fr); align-items: start; gap: 0; }
  .lvn__coluna { min-height: 0; max-width: 480px; width: 100%; margin: 0 auto; padding: 20px 0 8px; }
  .lvn__form { padding-top: clamp(28px, 6vh, 56px); }
  .lvn__palco { width: min(640px, 100%); margin: 40px auto 48px; --chao: 64px; }
  .lvn__cena, .lvn__reflexo { aspect-ratio: 100 / 82; }
  .lvn__ap--watch { display: none; }
  .lvn__ap--mac { left: 0; width: 100%; }
  .lvn__ap--iphone { right: -2%; top: 12.4%; width: 34%; }
  .lvn--codigo .lvn__palco { display: none; }
}
@media (max-width: 560px) {
  .lvn__titulo { font-size: clamp(31px, 8.6vw, 36px); }
  .lvn__form { padding-top: 28px; }
}
@media (prefers-reduced-motion: reduce) {
  .lvn__form, .lvn__palco, .lvn__cena .lvn__ap--iphone, .lvn__cena .lvn__ap--watch, .lvn__cta--indo::after { animation: none; }
}
</style>
