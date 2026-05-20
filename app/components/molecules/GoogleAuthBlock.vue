<template>
  <div class="flex flex-col gap-3">
    <!-- "ou" divider — neutral spacer between password form and OAuth.
         Color borrows from the active brand so it lives correctly in
         every variant (terminal/editorial/mentor/showtime/etc) without
         a per-variant override. -->
    <div class="flex items-center gap-3" :style="{ color: 'var(--brand-text-muted)' }">
      <span class="h-px flex-1" :style="{ backgroundColor: 'var(--brand-border)' }" />
      <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]">{{ dividerLabel }}</span>
      <span class="h-px flex-1" :style="{ backgroundColor: 'var(--brand-border)' }" />
    </div>

    <!-- Google's official button container. Required by their brand
         guidelines — we DON'T mock the button or redo the styling.
         Width is computed at mount so it matches the form's edges
         (Google's SDK only accepts a fixed pixel width, no '100%'). -->
    <div ref="hostRef" class="flex w-full justify-center" />

    <!-- Loading overlay (the GIS button itself doesn't have a busy
         state, so we surface ours below to communicate post-click
         work). Hidden until a credential lands and we're calling
         the backend. -->
    <p
      v-if="state === 'submitting'"
      class="text-center text-[11px] font-medium"
      :style="{ color: 'var(--brand-text-muted)' }"
    >
      Entrando…
    </p>
    <p
      v-else-if="state === 'error' && errorMessage"
      class="text-center text-[11px]"
      :style="{ color: 'var(--brand-negative)' }"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** Visual mode passed through to Google's button. Use `signup_with`
     *  on the register page so the CTA reads "Inscrever-se com Google". */
    mode?: 'signin' | 'signup'
    /** Optional override for the OR divider text. Defaults to "ou". */
    dividerLabel?: string
    /** Destination after successful Google auth. Defaults to "/" mas
     *  componentes consumidores podem mandar pra /wallet, /onboarding etc. */
    redirectTo?: string
  }>(),
  {
    mode: 'signin',
    dividerLabel: 'ou',
    redirectTo: '/',
  },
)

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'error', message: string): void
}>()

const brand = useBrand()
const router = useRouter()
const authStore = useAuthStore()
const { loginWithGoogle } = useAuthService()
const { renderButton, clientId } = useGoogleAuth()

const hostRef = ref<HTMLElement | null>(null)
const state = ref<'idle' | 'submitting' | 'error'>('idle')
const errorMessage = ref<string | null>(null)

onMounted(async () => {
  if (!hostRef.value) return
  if (!clientId) {
    state.value = 'error'
    errorMessage.value = 'Login com Google não configurado.'
    return
  }

  try {
    // renderButton resolves only after the user completes the Google
    // popup — we wait, then exchange the id_token for our Sanctum
    // token. The whole loop only runs once per page mount; if the
    // user dismisses we leave the button in place for a retry.
    while (true) {
      const idToken = await renderButton(hostRef.value, {
        theme: 'outline',
        text: props.mode === 'signup' ? 'signup_with' : 'continue_with',
        size: 'large',
        shape: 'pill',
        width: Math.min(360, hostRef.value.clientWidth || 320),
      })

      state.value = 'submitting'
      errorMessage.value = null
      try {
        const resp = await loginWithGoogle(idToken)
        if (!resp.access_token) throw new Error('Token não recebido.')
        authStore.addToken(resp.access_token)
        await authStore.fetchProfile()
        showSuccessNotification('Bem-vindo!', 'Carregando seu painel…')
        emit('success')
        // Small beat so the toast paints before the redirect.
        setTimeout(() => router.push(props.redirectTo), 200)
        break
      } catch (e) {
        const msg =
          (e as { data?: { message?: string } })?.data?.message
            ?? (e instanceof Error ? e.message : 'Falha ao entrar com Google.')
        state.value = 'error'
        errorMessage.value = msg
        emit('error', msg)
        // Stay in the loop — re-render the button so user can retry.
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Falha ao carregar o SDK do Google.'
    state.value = 'error'
    errorMessage.value = msg
    emit('error', msg)
  }
})
</script>

<style scoped>
.font-mono-tab {
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-feature-settings: 'tnum' 1;
}
</style>
