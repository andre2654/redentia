<!--
  MoleculesAuthChoiceCard — wrapper que combina os 2 caminhos:

    1. PHONE-FIRST (default): magic PIN via WhatsApp
    2. EMAIL FALLBACK (toggle): magic link via email

  Substitui AuthFormCard nos 3 surfaces principais (raio-x gate, /login,
  /register) sem que os parents precisem mexer em state. O fluxo padrao
  vira WhatsApp; o user pode trocar pra email com 1 click se preferir.

  PROPS:
    - redirectTo (string): destino apos verify
    - pixelContext (string): nome do tracking event
    - autoNavigate (bool): se true, este componente faz router.push apos
      verified. Se false, parent decide via @verified.

  EMITS:
    - verified: { token, user, redirectTo, isNewUser } (so phone-first)
    - linkSent: { email } (so email fallback)
    - error: string

  USO:
    <MoleculesAuthChoiceCard
      redirect-to="/wallet?from=raiox"
      pixel-context="raio_x_gate"
      :auto-navigate="true"
    />
-->
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    redirectTo?: string
    pixelContext?: string
    /** Se true, navega automaticamente apos verified. Default: true. */
    autoNavigate?: boolean
    /** Se true, mostra "ou continuar por email" no phone card. Default: true. */
    showEmailFallback?: boolean
    /** Se true, mostra "voltar pra WhatsApp" no email card. Default: true. */
    showPhoneFallback?: boolean
    /** mode pro AuthFormCard (register/login). Default: register. */
    mode?: 'register' | 'login'
  }>(),
  {
    redirectTo: '/',
    pixelContext: 'auth_choice',
    autoNavigate: true,
    showEmailFallback: true,
    showPhoneFallback: true,
    mode: 'register',
  },
)

interface AuthUser {
  id: number | string
  name: string | null
  email: string | null
  celular: string | null
  role: string
  tenant_id?: number | null
}

const emit = defineEmits<{
  verified: [{ token: string; user: AuthUser; redirectTo: string; isNewUser: boolean }]
  linkSent: [{ email: string }]
  error: [string]
}>()

const router = useRouter()

// Default = phone (WhatsApp). User pode trocar pra email com 1 click.
// Se o backend reportar WhatsApp off, mudamos pra email automaticamente
// no onMounted (vide useAuthChannels abaixo).
const channel = ref<'phone' | 'email'>('phone')

// Status dos canais — usado pra auto-fallback e pra mostrar banner
// quando o WhatsApp estiver fora do ar. fetchStatus tem cache de 30s
// no frontend + 30s no backend, entao montagens repetidas nao geram
// trafego excessivo.
const { fetchStatus, isWhatsAppAvailable, whatsappState } = useAuthChannels()

onMounted(async () => {
  await fetchStatus()
  if (!isWhatsAppAvailable.value) {
    channel.value = 'email'
  }
})

function switchToEmail() {
  channel.value = 'email'
}

function switchToPhone() {
  channel.value = 'phone'
}

async function onVerified(payload: { token: string; user: AuthUser; redirectTo: string; isNewUser: boolean }) {
  emit('verified', payload)
  if (props.autoNavigate) {
    // Pequeno delay pro toast/UI antes do redirect — UX similar ao /login.
    setTimeout(() => router.push(payload.redirectTo || props.redirectTo), 200)
  }
}

function onLinkSent(payload: { email: string }) {
  emit('linkSent', payload)
}

function onError(msg: string) {
  emit('error', msg)
}
</script>

<template>
  <div class="auth-choice">
    <!-- Banner de degradacao: aparece quando o backend reporta WhatsApp
         off. So renderiza no canal email pq se o user esta no canal
         phone e tentou ir, ja vai ter erro real e o feedback esta ali. -->
    <div
      v-if="channel === 'email' && !isWhatsAppAvailable"
      class="auth-choice__degraded"
      role="status"
    >
      <UIcon name="i-lucide-alert-circle" class="size-3.5 shrink-0" aria-hidden="true" />
      <span>WhatsApp temporariamente indisponível. Use email pra entrar.</span>
    </div>

    <!-- ============ PHONE-FIRST (default) ============ -->
    <Transition name="auth-choice-fade" mode="out-in">
      <MoleculesPhoneFirstAuthCard
        v-if="channel === 'phone'"
        key="phone"
        :redirect-to="redirectTo"
        :pixel-context="`${pixelContext}_phone`"
        :show-email-fallback="showEmailFallback"
        @verified="onVerified"
        @switch-to-email="switchToEmail"
        @error="onError"
      />

      <!-- ============ EMAIL FALLBACK ============ -->
      <div v-else key="email" class="auth-choice__email-wrap">
        <MoleculesAuthFormCard
          :mode="mode"
          :redirect-to="redirectTo"
          :pixel-context="`${pixelContext}_email`"
          @link-sent="onLinkSent"
          @error="onError"
        />

        <!-- Botao "Voltar pra WhatsApp" so se WhatsApp estiver disponivel -->
        <button
          v-if="showPhoneFallback && isWhatsAppAvailable"
          type="button"
          class="auth-choice__back-to-phone"
          @click="switchToPhone"
        >
          <UIcon name="i-lucide-message-circle" class="size-3.5" aria-hidden="true" />
          <span>Voltar pra WhatsApp</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.auth-choice {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Banner de degradacao quando o backend reporta WhatsApp off.
   Cor: amarelo/amber sutil pra avisar sem alarmar. */
.auth-choice__degraded {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 12.5px;
  line-height: 1.4;
  color: var(--text-body);
  background: color-mix(in srgb, var(--brand-warning) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-warning) 30%, transparent);
}

.auth-choice__degraded :deep(svg) {
  color: #d97706;
}

.auth-choice__email-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.auth-choice__back-to-phone {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 500;
  font-family: var(--brand-font);
  color: var(--text-body);
  cursor: pointer;
  transition: border-color 150ms, color 150ms, background 150ms;
  margin-top: 4px;
}

.auth-choice__back-to-phone:hover {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
  background: color-mix(in srgb, var(--brand-primary) 5%, transparent);
}

/* ============ TRANSITIONS ============ */
.auth-choice-fade-enter-active,
.auth-choice-fade-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}
.auth-choice-fade-enter-from,
.auth-choice-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

@media (prefers-reduced-motion: reduce) {
  .auth-choice-fade-enter-active,
  .auth-choice-fade-leave-active {
    transition: none;
  }
}
</style>
