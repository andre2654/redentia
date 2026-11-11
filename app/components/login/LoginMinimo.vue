<script setup lang="ts">
// A tela do /login na identidade da Aportou (11/11/2026), seguindo de perto o
// quadro Login.dc.html: a coluna do formulário sobre o creme (o wordmark no
// alto, o eyebrow com o corte, o título em 800, a marca social em pílula
// branca, o divisor, o campo de 56px, a pílula azul com a seta no círculo, a
// caixinha de quem ainda não tem conta e o rodapé de endosso) e, à direita, o
// painel cobalto da marca com o leque. Abaixo de 900px o painel some.
// O FLUXO é o de sempre (pages/login.vue, `porta`): celular ou e-mail, o
// código de 6 números, Apple e Google. O quadro desenha e-mail + senha; aqui
// não há senha, então o lugar do "Esqueci minha senha" é do "Usar e-mail" /
// "Usar celular", e o segundo campo não existe. No celular o campo e o botão
// vêm antes das marcas (cabem acima do teclado); com o teclado aberto,
// useCampoAVista põe o campo e o botão acima dele.
import type { PortaLogin } from '~/types/loginPorta'
import { DIAS_GRATIS, PRECO_MENSAL, formatarCelular } from '~/utils/assinatura'
import LoginCodigo from './LoginCodigo.vue'

const props = defineProps<{ porta: PortaLogin }>()
const p = props.porta

const eyebrow = computed(() => {
  if (p.step === 'pin') return 'Código'
  if (p.vemDaAssinatura) return 'Sua conta'
  return p.isCad ? 'Criar conta' : 'Entrar'
})
const titulo = computed(() => {
  if (p.step === 'pin') return 'Digite o código.'
  if (p.vemDaAssinatura) return 'Primeiro, a sua conta.'
  return p.isCad ? 'Comece pela sua conta.' : 'Bom te ver de volta.'
})
const lead = computed(() => {
  if (p.vemDaAssinatura) return 'Entre ou crie a sua conta com um código. Sem senha.'
  return p.isCad
    ? 'Crie a sua conta com um código. Sem senha para lembrar.'
    : 'Entre para ver a sua carteira e continuar de onde parou.'
})
const destino = computed(() => (p.isPhone ? p.phone : p.email.trim()))

// Apple e Google só aparecem com o client id no ambiente (ou, no dev, com
// ?entrar-marcas=1): sem nenhum dos dois, o divisor também não aparece
const amostraMarcas = import.meta.dev && useRoute().query['entrar-marcas'] === '1'
const temMarcas = !!(useGoogleAuth().clientId || useAppleAuth().clientId || amostraMarcas)

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
    <main class="lmi__form-lado">
      <header class="lmi__topo">
        <NuTopoMarca :tamanho="36" />
      </header>

      <div :key="p.step" class="lmi__coluna">
        <template v-if="p.step === 'identifier'">
          <AssinaturaJornada v-if="p.vemDaAssinatura" :passo="1" compacto />

          <div class="lmi__cabeca">
            <NuEyebrow>{{ eyebrow }}</NuEyebrow>
            <h1 class="lmi__titulo">{{ titulo }}</h1>
            <p class="lmi__lead">{{ lead }}</p>
          </div>

          <template v-if="temMarcas">
            <div class="lmi__marcas" :class="{ 'lmi__marcas--ocupado': p.googleSubmitting }">
              <LoginGoogleButton :disabled="p.googleSubmitting" @credential="p.onGoogleCredential" @error="p.googleError = $event" />
              <LoginAppleButton tom="contorno" :disabled="p.googleSubmitting" @credential="p.onAppleCredential" @error="p.googleError = $event" />
              <p v-if="p.googleSubmitting" class="lmi__nota" aria-live="polite">{{ p.socialEntrando === 'apple' ? 'Entrando com a Apple…' : 'Entrando com o Google…' }}</p>
              <p v-else-if="p.googleError" class="lmi__nota lmi__nota--erro" role="alert">{{ p.googleError }}</p>
            </div>
            <p class="lmi__ou"><span class="lmi__ou-largo">{{ p.isPhone ? 'ou com o celular' : 'ou com e-mail' }}</span><span class="lmi__ou-celular">ou</span></p>
          </template>

          <form ref="bloco" class="lmi__form" novalidate @submit.prevent="p.submitIdentifier()">
            <div class="lmi__campo-bloco">
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
                <template v-else>{{ p.fieldHelp }}</template>
              </p>
            </div>
            <NuBotaoSeta type="submit" largo :disabled="!p.ready" :loading="p.sending">{{ p.mainCta }}</NuBotaoSeta>
          </form>

          <div class="lmi__caixa">
            <p>
              {{ p.altLabel }}
              <button type="button" class="lmi__link" @click="p.toggleMode()">{{ p.altCta }}</button><template v-if="!p.isCad">. Não pede senha nem cartão.</template>
            </p>
            <p v-if="p.isCad" class="lmi__plano">A conta é grátis. A carteira e a IA são da assinatura: {{ DIAS_GRATIS }} dias grátis, depois {{ PRECO_MENSAL }} por mês.</p>
          </div>
        </template>

        <template v-else>
          <div class="lmi__cabeca">
            <NuEyebrow>{{ eyebrow }}</NuEyebrow>
            <h1 class="lmi__titulo">{{ titulo }}</h1>
            <p class="lmi__lead">{{ p.isPhone ? 'Mandamos 6 números no WhatsApp' : 'Mandamos 6 números para' }} <b :class="{ 'lmi__fone': p.isPhone }">{{ destino }}</b>. {{ p.isPhone ? 'Valem 5 minutos.' : 'Valem 10 minutos.' }}</p>
          </div>
          <div ref="bloco" class="lmi__bloco-codigo">
            <LoginCodigo :verifying="p.verifying" :error="p.pinError" @submit="p.verifyPin" />
            <p class="lmi__nota" :class="{ 'lmi__nota--erro': p.pinError }" aria-live="polite">
              <template v-if="p.pinError">{{ p.pinError }}</template>
              <template v-else-if="p.verifying">Conferindo…</template>
              <template v-else>Com o sexto número, você entra. Não precisa apertar nada.</template>
            </p>
          </div>
          <div class="lmi__acoes">
            <button v-if="p.resendIn === 0" type="button" class="lmi__link" :disabled="p.verifying" @click="p.resendPin()">Reenviar código</button>
            <span v-else class="lmi__espera">Reenviar em {{ p.resendIn }} s</span>
            <button type="button" class="lmi__link" @click="p.backToIdentifier()">{{ p.isPhone ? 'Trocar o número' : 'Trocar o e-mail' }}</button>
          </div>
        </template>
      </div>

      <p class="lmi__pe">
        <span>{{ MARCA.assinatura }}</span>
        <NuxtLink to="/institucional/privacy">Privacidade</NuxtLink>
        <NuxtLink to="/institucional/terms">Termos de uso</NuxtLink>
        <NuxtLink to="/institucional/contact">Ajuda</NuxtLink>
      </p>
    </main>

    <!-- o painel da marca: some abaixo de 900px -->
    <aside class="lmi__painel-lado">
      <div class="lmi__painel">
        <div class="lmi__painel-texto">
          <span class="lmi__corte"><MarcaCorte :largura="44" cor="var(--nu-white)" /></span>
          <p class="lmi__frase">{{ MARCA.frase }}</p>
          <p class="lmi__apoio">Seus bancos, suas ações e as suas dúvidas, no mesmo lugar.</p>
        </div>
        <div class="lmi__leque" role="img" aria-label="Leque de 2.000 linhas de futuro se abrindo da esquerda para a direita">
          <img src="/img/aportou/leque.svg" alt="" width="742" height="400" decoding="async">
          <span class="lmi__selo"><strong>2.000</strong> futuros testados para cada carteira</span>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.lmi {
  min-height: 100vh; min-height: 100dvh; display: flex; align-items: stretch; overflow-x: clip;
  background: var(--nu-page); color: var(--nu-ink); font-size: 16px; line-height: 1.5;
}

/* ——— o formulário ——— */
.lmi__form-lado {
  flex: 1 1 480px; min-width: 0; box-sizing: border-box; display: flex; flex-direction: column;
  padding: max(28px, env(safe-area-inset-top)) max(clamp(24px, 5vw, 72px), env(safe-area-inset-right)) max(32px, env(safe-area-inset-bottom)) max(clamp(24px, 5vw, 72px), env(safe-area-inset-left));
}
.lmi__topo { align-self: flex-start; display: flex; align-items: center; min-height: 44px; }
.lmi__topo :deep(.ntm) { padding-left: 0; margin-left: 0; }
.lmi__coluna {
  width: 100%; max-width: 440px; margin: auto; padding: 40px 0; display: flex; flex-direction: column; gap: 26px;
  animation: nu-fade .5s cubic-bezier(.2, .8, .2, 1) both;
}
.lmi__cabeca { display: flex; flex-direction: column; gap: 14px; }
.lmi__titulo { margin: 0; font-size: clamp(44px, 4.6vw, 60px); font-weight: 800; line-height: 1; letter-spacing: -0.035em; text-wrap: balance; }
.lmi__lead { margin: 0; color: var(--nu-gray-3); font-size: 18px; font-weight: 500; }
.lmi__lead b { color: var(--nu-ink); font-weight: 700; overflow-wrap: anywhere; }
.lmi__lead .lmi__fone { white-space: nowrap; }

/* as marcas: pílula branca de 58px com a borda carvão de 1,5px (o quadro) */
.lmi__marcas { display: flex; flex-direction: column; gap: 10px; }
.lmi__marcas:empty { display: none; }
.lmi__marcas--ocupado :deep(.lgb) { opacity: .6; }
.lmi__marcas :deep(.lab__pilula), .lmi__marcas :deep(.lgb__pilula) {
  min-height: 58px; font-size: 17px; font-weight: 700; color: var(--nu-ink);
  background: var(--nu-white); box-shadow: inset 0 0 0 1.5px var(--nu-ink); transition: background .2s, transform .15s cubic-bezier(.2, .8, .2, 1);
}
.lmi__marcas :deep(.lab__pilula:hover), .lmi__marcas :deep(.lgb:hover .lgb__pilula) { background: var(--nu-row-hover); }
.lmi__marcas :deep(.lab__pilula:active) { transform: scale(.98); }
.lmi__ou { display: flex; align-items: center; gap: 14px; margin: 0; color: var(--nu-gray); font-size: 14px; font-weight: 600; }
.lmi__ou::before, .lmi__ou::after { content: ''; flex: 1; height: 1.5px; background: var(--nu-line); }

.lmi__form { display: flex; flex-direction: column; gap: 18px; }
.lmi__campo-bloco { display: flex; flex-direction: column; gap: 7px; }
.lmi__rotulos { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.lmi__rotulo { font-size: 15px; font-weight: 700; }
.lmi__troca {
  display: inline-flex; align-items: center; min-height: 44px; margin: -12px 0; padding: 0 2px; border: 0; border-radius: 6px; background: none; cursor: pointer;
  color: var(--nu-blue-text); font: inherit; font-size: 15px; font-weight: 700; text-decoration: underline; text-underline-offset: 3px;
  transition: color .2s;
}
.lmi__troca:hover { color: var(--nu-blue-deep); }
.lmi__fora { color: var(--nu-amber-text); font-size: 14px; font-weight: 700; }
.lmi__campo {
  width: 100%; height: 56px; box-sizing: border-box; padding: 0 18px; border: 1.5px solid var(--nu-borda-campo); border-radius: var(--nu-r-input);
  background: var(--nu-white); color: var(--nu-ink); font: inherit; font-size: 17px; font-weight: 500;
  transition: border-color .2s;
}
.lmi__campo::placeholder { color: var(--nu-placeholder); }
.lmi__campo:focus { outline: 3px solid var(--nu-blue); outline-offset: 1px; border-color: var(--nu-blue); }
.lmi__campo--erro, .lmi__campo--erro:focus { border-color: var(--nu-red); outline-color: var(--nu-red); }
.lmi__nota { margin: 0; min-height: 1.5em; color: var(--nu-gray); font-size: 14px; font-weight: 500; line-height: 1.5; }
.lmi__nota--erro { color: var(--nu-red-text); font-weight: 700; }
.lmi__nota--aviso { color: var(--nu-amber-text); font-weight: 700; }
.lmi__form :deep(.nbs) { margin-top: 6px; }

/* a caixinha de quem ainda não tem conta (ou já tem) */
.lmi__caixa { padding: 16px 20px; border-radius: 18px; background: var(--nu-band); font-size: 16.5px; font-weight: 500; }
.lmi__caixa p { margin: 0; }
.lmi__caixa .lmi__plano { margin-top: 8px; color: var(--nu-gray); font-size: 14px; }
.lmi__link {
  display: inline; padding: 0; border: 0; border-radius: 4px; background: none; cursor: pointer;
  color: var(--nu-blue-text); font: inherit; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; transition: color .2s;
}
.lmi__link:hover:not(:disabled) { color: var(--nu-blue-deep); }
.lmi__link:disabled { color: var(--nu-gray); cursor: default; }

/* o código */
.lmi__bloco-codigo { display: flex; flex-direction: column; gap: 10px; }
.lmi__acoes { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 24px; }
.lmi__acoes .lmi__link, .lmi__espera { display: inline-flex; align-items: center; min-height: 44px; font-size: 15px; }
.lmi__espera { color: var(--nu-gray); font-weight: 600; font-variant-numeric: tabular-nums; }

/* o rodapé de endosso */
.lmi__pe { margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 20px; color: var(--nu-gray); font-size: 13.5px; font-weight: 500; }
.lmi__pe a { display: inline-flex; align-items: center; min-height: 44px; color: var(--nu-gray); text-decoration: underline; text-underline-offset: 3px; transition: color .2s; }
.lmi__pe a:hover { color: var(--nu-ink); }

/* ——— o painel da marca ——— */
.lmi__painel-lado { flex: 1.1 1 520px; min-width: 0; display: flex; padding: 16px 16px 16px 0; }
.lmi__painel {
  position: relative; overflow: hidden; flex: 1; display: flex; flex-direction: column;
  border-radius: var(--nu-r-secao); background: var(--nu-grad-cobalto); color: var(--nu-white);
  animation: nu-surgir .5s ease both;
}
.lmi__painel-texto { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 20px; padding: clamp(36px, 4.4vw, 64px); }
/* o corte chega com um aceno, uma vez */
.lmi__corte { display: block; width: 44px; transform-origin: 0 100%; animation: lmi-corte .7s cubic-bezier(.2, .8, .2, 1) .25s both; }
@keyframes lmi-corte { from { opacity: 0; transform: translate(-8px, 8px) rotate(-10deg); } to { opacity: 1; transform: none; } }
.lmi__frase { margin: 0; max-width: 520px; font-size: clamp(48px, 5.6vw, 84px); font-weight: 800; line-height: .98; letter-spacing: -0.035em; animation: nu-fade-lg .6s cubic-bezier(.2, .8, .2, 1) .1s both; }
.lmi__apoio { margin: 0; max-width: 420px; color: var(--nu-blue-on-blue); font-size: 19px; font-weight: 500; animation: nu-fade .6s ease .22s both; }
.lmi__leque { position: relative; flex: 1; min-height: 300px; }
.lmi__leque img { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: block; animation: nu-surgir 1.1s ease .3s both; }
.lmi__selo {
  position: absolute; left: clamp(36px, 4.4vw, 64px); bottom: clamp(28px, 3.4vw, 44px);
  display: inline-flex; align-items: center; gap: 8px; padding: 9px 17px; border-radius: var(--nu-r-pill);
  background: var(--nu-ink); font-size: 15px; font-weight: 500; white-space: nowrap; animation: nu-subir .5s cubic-bezier(.2, .8, .2, 1) .7s both;
}
.lmi__selo strong { font-size: 16px; font-weight: 800; font-variant-numeric: tabular-nums; }

.lmi__ou-celular { display: none; }

@media (max-width: 900px) {
  .lmi__painel-lado { display: none; }
  /* no celular o campo e o botão vêm primeiro (cabem acima do teclado, a escolha
     do dono de 04/11/2026); as marcas descem para depois do divisor */
  .lmi__form { order: 1; }
  .lmi__ou { order: 2; }
  .lmi__marcas { order: 3; }
  .lmi__caixa { order: 4; }
  .lmi__ou-largo { display: none; }
  .lmi__ou-celular { display: inline; }
  .lmi__coluna { margin: 0 auto; padding: clamp(28px, 6vh, 56px) 0 32px; }
  .lmi__pe { margin-top: auto; justify-content: center; }
  .lmi__pe span { flex-basis: 100%; text-align: center; }
}
@media (max-width: 420px) {
  .lmi__caixa { font-size: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .lmi__coluna, .lmi__painel, .lmi__corte, .lmi__frase, .lmi__apoio, .lmi__leque img, .lmi__selo { animation: none; }
}
</style>
