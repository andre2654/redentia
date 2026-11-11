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
// Robustez (11/11/2026): o ritmo de 8px (40 da cabeça ao formulário, 24 entre
// os blocos), o rótulo em 14/600 e a ajuda em legenda; o campo ganhou hover e
// o anel que aperta ao focar; o erro troca a ajuda no mesmo lugar (fade, com o
// ícone), sem pular; os links secundários são NuLinkSeta; a coluna entra em
// cascata de 60ms e o painel da marca, nos tempos dos tokens.
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
              <p v-else-if="p.googleError" class="lmi__nota lmi__nota-in lmi__nota--erro" role="alert">
                <svg class="lmi__nota-icone" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5h.01" /></svg>
                <span>{{ p.googleError }}</span>
              </p>
            </div>
            <p class="lmi__ou"><span class="lmi__ou-largo">{{ p.isPhone ? 'ou com o celular' : 'ou com e-mail' }}</span><span class="lmi__ou-celular">ou</span></p>
          </template>

          <form ref="bloco" class="lmi__form" novalidate @submit.prevent="p.submitIdentifier()">
            <div class="lmi__campo-bloco">
              <div class="lmi__rotulos">
                <label class="lmi__rotulo" for="lmi-campo">{{ p.isPhone ? 'Celular' : 'E-mail' }}</label>
                <NuSelo v-if="p.whatsappDown && !p.isPhone" tom="ambar" tamanho="p" ponto>WhatsApp fora do ar</NuSelo>
                <NuLinkSeta v-else seta="nenhuma" class="lmi__troca" @click="trocarCanal">{{ p.isPhone ? 'Usar e-mail' : 'Usar celular' }}</NuLinkSeta>
              </div>
              <input
                id="lmi-campo" ref="campo" class="lmi__campo" :class="{ 'lmi__campo--erro': p.identifierError }" :value="p.isPhone ? p.phone : p.email"
                :type="p.isPhone ? 'tel' : 'email'" :inputmode="p.isPhone ? 'tel' : 'email'" :name="p.isPhone ? 'phone' : 'email'"
                :autocomplete="p.isPhone ? 'tel-national' : 'email'" enterkeyhint="go" autocapitalize="off" autocorrect="off" spellcheck="false"
                :placeholder="p.isPhone ? '(11) 90000-0000' : 'voce@email.com'" :aria-invalid="!!p.identifierError" aria-describedby="lmi-nota"
                @input="aoDigitar"
              >
              <!-- a ajuda, o aviso e o erro moram na mesma linha: um sai, o outro entra, nada pula -->
              <p id="lmi-nota" class="lmi__nota" aria-live="polite">
                <Transition name="lmi-troca" mode="out-in">
                  <span v-if="p.identifierError" key="erro" class="lmi__nota-in lmi__nota--erro">
                    <svg class="lmi__nota-icone" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5h.01" /></svg>
                    <span>{{ p.identifierError }}</span>
                  </span>
                  <span v-else-if="p.whatsappDown && p.isPhone" key="aviso" class="lmi__nota-in lmi__nota--aviso">{{ p.whatsappNotice }}</span>
                  <span v-else :key="`ajuda-${p.method}`" class="lmi__nota-in">{{ p.fieldHelp }}</span>
                </Transition>
              </p>
            </div>
            <NuBotaoSeta type="submit" largo :disabled="!p.ready" :loading="p.sending">{{ p.mainCta }}</NuBotaoSeta>
          </form>

          <!-- quem ainda não tem conta (ou já tem): a frase e, embaixo, o link com a seta -->
          <div class="lmi__caixa">
            <p class="lmi__caixa-txt">{{ p.altLabel }}<template v-if="!p.isCad"> Não pede senha nem cartão.</template></p>
            <NuLinkSeta class="lmi__caixa-link" @click="p.toggleMode()">{{ p.altCta }}</NuLinkSeta>
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
            <p class="lmi__nota" aria-live="polite">
              <Transition name="lmi-troca" mode="out-in">
                <span v-if="p.pinError" key="erro" class="lmi__nota-in lmi__nota--erro">
                  <svg class="lmi__nota-icone" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5h.01" /></svg>
                  <span>{{ p.pinError }}</span>
                </span>
                <span v-else-if="p.verifying" key="conferindo" class="lmi__nota-in">Conferindo…</span>
                <span v-else key="ajuda" class="lmi__nota-in">Com o sexto número, você entra. Não precisa apertar nada.</span>
              </Transition>
            </p>
          </div>
          <div class="lmi__acoes">
            <NuLinkSeta v-if="p.resendIn === 0" :disabled="p.verifying" @click="p.resendPin()">Reenviar código</NuLinkSeta>
            <span v-else class="lmi__espera">Reenviar em {{ p.resendIn }} s</span>
            <NuLinkSeta tom="tinta" seta="voltar" @click="p.backToIdentifier()">{{ p.isPhone ? 'Trocar o número' : 'Trocar o e-mail' }}</NuLinkSeta>
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
  padding: max(24px, env(safe-area-inset-top)) max(clamp(24px, 5vw, 72px), env(safe-area-inset-right)) max(32px, env(safe-area-inset-bottom)) max(clamp(24px, 5vw, 72px), env(safe-area-inset-left));
}
.lmi__topo { align-self: flex-start; display: flex; align-items: center; min-height: 44px; }
.lmi__topo :deep(.ntm) { padding-left: 0; margin-left: 0; }
/* a coluna: 40px da cabeça ao formulário, 24 entre os blocos de baixo */
.lmi__coluna { width: 100%; max-width: 440px; margin: auto; padding: 40px 0; display: flex; flex-direction: column; gap: 24px; }
.lmi__coluna > .lmi__cabeca { margin-bottom: 16px; }
/* a entrada (e a troca celular → código): os blocos sobem em cascata de 60ms */
.lmi__coluna > * { animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both; }
.lmi__coluna > :nth-child(2) { animation-delay: 60ms; }
.lmi__coluna > :nth-child(3) { animation-delay: 120ms; }
.lmi__coluna > :nth-child(4) { animation-delay: 180ms; }
.lmi__coluna > :nth-child(n + 5) { animation-delay: 240ms; }
.lmi__cabeca { display: flex; flex-direction: column; gap: 16px; }
.lmi__titulo { margin: 0; font-size: clamp(44px, 4.6vw, 60px); font-weight: var(--nu-w-display); line-height: 1; letter-spacing: var(--nu-ls-display); text-wrap: balance; }
.lmi__lead { margin: 0; color: var(--nu-gray-3); font-size: 18px; font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.5; }
.lmi__lead b { color: var(--nu-ink); font-weight: var(--nu-w-medio); overflow-wrap: anywhere; }
.lmi__lead .lmi__fone { white-space: nowrap; }

/* as marcas: pílula branca de 56px com a borda carvão de 1,5px (o quadro) */
.lmi__marcas { display: flex; flex-direction: column; gap: 8px; }
.lmi__marcas:empty { display: none; }
.lmi__marcas :deep(.lab__pilula), .lmi__marcas :deep(.lgb__pilula) {
  min-height: 56px; font-size: 16px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); color: var(--nu-ink);
  background: var(--nu-white); box-shadow: inset 0 0 0 1.5px var(--nu-ink);
}
.lmi__marcas :deep(.lab__pilula:hover), .lmi__marcas :deep(.lgb:hover .lgb__pilula) { background: var(--nu-row-hover); }
.lmi__ou { display: flex; align-items: center; gap: 16px; margin: 0; color: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
.lmi__ou::before, .lmi__ou::after { content: ''; flex: 1; height: 1px; background: var(--nu-line); }

.lmi__form { display: flex; flex-direction: column; gap: 16px; }
.lmi__campo-bloco { display: flex; flex-direction: column; gap: 8px; }
.lmi__rotulos { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 22px; }
.lmi__rotulo { font-size: 14px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
.lmi__troca { font-size: 14px; }
/* o campo: hover escurece a borda; o foco acende o anel de 3px, que aperta de 4 para 1px */
.lmi__campo {
  width: 100%; height: 56px; box-sizing: border-box; padding: 0 18px; border: 1.5px solid var(--nu-borda-campo); border-radius: var(--nu-r-input);
  background: var(--nu-white); color: var(--nu-ink); font: inherit; font-size: 17px; font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto);
  outline: 3px solid transparent; outline-offset: 4px;
  transition: border-color var(--nu-dur-media) var(--nu-ease-cor), outline-color var(--nu-dur-rapida) var(--nu-ease-cor), outline-offset var(--nu-dur-media) var(--nu-ease-saida);
}
.lmi__campo::placeholder { color: var(--nu-placeholder); }
.lmi__campo:hover { border-color: var(--nu-borda-campo-hover); }
.lmi__campo:focus { outline-color: var(--nu-blue); outline-offset: 1px; border-color: var(--nu-blue); }
.lmi__campo--erro, .lmi__campo--erro:hover { border-color: var(--nu-red); }
.lmi__campo--erro:focus { border-color: var(--nu-red); outline-color: var(--nu-red); }
/* a linha de baixo do campo: ajuda (legenda), aviso ou erro, sempre no mesmo lugar */
.lmi__nota { margin: 0; min-height: 1.45em; color: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-texto); line-height: 1.45; }
.lmi__nota-in { display: flex; align-items: flex-start; gap: 6px; }
.lmi__nota--erro { color: var(--nu-red-text); font-weight: var(--nu-w-medio); }
.lmi__nota--aviso { color: var(--nu-amber-text); font-weight: var(--nu-w-medio); }
.lmi__nota-icone { flex: none; margin-top: 1px; }
.lmi-troca-enter-active { transition: opacity var(--nu-dur-media) var(--nu-ease-saida), transform var(--nu-dur-media) var(--nu-ease-saida); }
.lmi-troca-leave-active { transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor); }
.lmi-troca-enter-from { opacity: 0; transform: translateY(-3px); }
.lmi-troca-leave-to { opacity: 0; }
.lmi__form :deep(.nbs) { margin-top: 8px; }

/* a caixinha de quem ainda não tem conta (ou já tem): a frase e o link embaixo */
.lmi__caixa { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 16px 20px 18px; border-radius: var(--nu-r-tile); background: var(--nu-band); }
.lmi__caixa-txt { margin: 0; color: var(--nu-gray-3); font-size: 15px; font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.5; }
.lmi__caixa-link { font-size: 15px; }
.lmi__caixa .lmi__plano { margin: 4px 0 0; color: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-texto); line-height: 1.5; }

/* o código */
.lmi__bloco-codigo { display: flex; flex-direction: column; gap: 12px; }
.lmi__acoes { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 24px; min-height: 44px; font-size: 15px; }
.lmi__espera { color: var(--nu-gray); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }

/* o rodapé de endosso: legenda, os links sublinham no hover */
.lmi__pe { margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 0 24px; color: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-texto); }
.lmi__pe a {
  display: inline-flex; align-items: center; min-height: 44px; color: var(--nu-gray);
  text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 4px; text-decoration-color: transparent;
  transition: color var(--nu-dur-media) var(--nu-ease-cor), text-decoration-color var(--nu-dur-media) var(--nu-ease-cor);
}
.lmi__pe a:hover { color: var(--nu-ink); text-decoration-color: currentColor; }

/* ——— o painel da marca ——— */
.lmi__painel-lado { flex: 1.1 1 520px; min-width: 0; display: flex; padding: 16px 16px 16px 0; }
.lmi__painel {
  position: relative; overflow: hidden; flex: 1; display: flex; flex-direction: column;
  border-radius: var(--nu-r-secao); background: var(--nu-grad-cobalto); color: var(--nu-white);
  animation: nu-surgir var(--nu-dur-entrada) var(--nu-ease-cor) both;
}
.lmi__painel-texto { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 24px; padding: clamp(40px, 4.4vw, 64px); }
/* o corte chega com um aceno, uma vez */
.lmi__corte { display: block; width: 44px; transform-origin: 0 100%; animation: lmi-corte var(--nu-dur-entrada) var(--nu-ease-saida) 240ms both; }
@keyframes lmi-corte { from { opacity: 0; transform: translate(-8px, 8px) rotate(-10deg); } to { opacity: 1; transform: none; } }
.lmi__frase { margin: 0; max-width: 520px; font-size: clamp(48px, 5.6vw, 84px); font-weight: var(--nu-w-display); line-height: .98; letter-spacing: var(--nu-ls-display); animation: nu-fade-lg var(--nu-dur-entrada) var(--nu-ease-saida) 120ms both; }
.lmi__apoio { margin: -8px 0 0; max-width: 420px; color: var(--nu-blue-on-blue); font-size: 19px; font-weight: var(--nu-w-texto); line-height: 1.5; animation: nu-fade var(--nu-dur-entrada) var(--nu-ease-saida) 180ms both; }
.lmi__leque { position: relative; flex: 1; min-height: 300px; }
.lmi__leque img { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: block; animation: nu-surgir var(--nu-dur-respiro) var(--nu-ease-cor) 300ms both; }
.lmi__selo {
  position: absolute; left: clamp(40px, 4.4vw, 64px); bottom: clamp(32px, 3.4vw, 48px);
  display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: var(--nu-r-pill);
  background: var(--nu-ink); font-size: 15px; font-weight: var(--nu-w-texto); white-space: nowrap; animation: nu-subir var(--nu-dur-lenta) var(--nu-ease-saida) 720ms both;
}
.lmi__selo strong { font-size: 16px; font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; }

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
  .lmi__coluna { margin: 0 auto; padding: clamp(24px, 6vh, 56px) 0 32px; }
  .lmi__pe { margin-top: auto; justify-content: center; }
  .lmi__pe span { flex-basis: 100%; text-align: center; }
}
@media (prefers-reduced-motion: reduce) {
  .lmi__coluna > *, .lmi__painel, .lmi__corte, .lmi__frase, .lmi__apoio, .lmi__leque img, .lmi__selo { animation: none; }
}
</style>
