<!--
  /auth/magic-link/verify — landing do email magic link.

  FLOW:
  1) User clica no link recebido por email
  2) Pagina pega `?token=...` da URL
  3) POST /auth/magic-link/verify { token } → backend valida + cria/login
  4) Salva Sanctum token, fetch profile
  5) Redireciona pra `redirect_to` retornado (default "/")
  6) Se eh novo user (sem nome ainda), passa flag pra abrir modal de
     onboarding no destino (?onboarding=true)

  ESTADOS VISUAIS:
  - loading: "Validando seu link..." com spinner
  - success: redireciona instantaneo (sem flash)
  - error: mostra erro + botao "Voltar pro login"
-->
<script setup lang="ts">
definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
  hideQuickSearch: true,
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { magicLinkVerify } = useAuthService()
const { track } = useMetaPixel()
const brand = useBrand()

const state = ref<'loading' | 'error'>('loading')
const errorMessage = ref('')

async function processToken() {
  const token = (Array.isArray(route.query.token) ? route.query.token[0] : route.query.token) ?? ''

  if (!token || typeof token !== 'string' || token.length < 16) {
    state.value = 'error'
    errorMessage.value = 'Link inválido. Solicite um novo email.'
    return
  }

  try {
    const resp = await magicLinkVerify(token)

    if (!resp.access_token) {
      throw new Error('Token nao retornado pelo backend.')
    }

    authStore.addToken(resp.access_token)
    await authStore.fetchProfile()

    // Pixel: dispara CompleteRegistration so quando o user de fato entra
    // (Lead ja foi disparado no request). Disparar aqui evita inflar CR
    // com requests sem clique.
    track('CompleteRegistration', {
      content_name: resp.is_new_user ? 'Magic Link First Login' : 'Magic Link Returning User',
      content_category: 'magic_link_verify',
      status: true,
      currency: 'BRL',
      value: resp.is_new_user ? 20 : 0,
    })

    // Resolve destino:
    //   1. resp.redirect_to (vindo do backend, salvo no token)
    //   2. fallback "/"
    let dest = resp.redirect_to || '/'

    // Se eh primeiro login E user.name esta vazio, adiciona ?onboarding=true
    // pra layout/page no destino abrir o modal de "Como podemos te chamar?".
    if (resp.is_new_user || !authStore.me?.name?.trim()) {
      const sep = dest.includes('?') ? '&' : '?'
      dest = `${dest}${sep}onboarding=true`
    }

    // replace pra nao deixar a URL com token no history (sensivel + UX)
    await router.replace(dest)
  }
  catch (err: unknown) {
    state.value = 'error'
    const apiError = err as { data?: { message?: string } }
    errorMessage.value
      = apiError?.data?.message
      || (err instanceof Error ? err.message : 'Não conseguimos validar seu link. Pode ter expirado ou já ter sido usado.')
  }
}

onMounted(() => {
  processToken()
})

const layoutName = computed(() => 'unauthenticated')
</script>

<template>
  <NuxtLayout :name="layoutName" title="Validando…">
    <main class="magic-verify">
      <div class="magic-verify__card">
        <div v-if="state === 'loading'" class="magic-verify__loading">
          <div
            class="magic-verify__spinner"
            :style="{
              borderColor: `color-mix(in srgb, var(--brand-primary) 25%, transparent)`,
              borderTopColor: 'var(--brand-primary)',
            }"
          />
          <h1 class="magic-verify__title">
            Validando seu link…
          </h1>
          <p class="magic-verify__subtitle">
            Estamos preparando sua conta.
          </p>
        </div>

        <div v-else class="magic-verify__error">
          <div class="magic-verify__icon-error" aria-hidden="true">
            <UIcon name="i-lucide-alert-circle" class="size-8" />
          </div>
          <h1 class="magic-verify__title">
            Link inválido ou expirado
          </h1>
          <p class="magic-verify__subtitle">
            {{ errorMessage }}
          </p>
          <NuxtLink to="/auth/login" class="magic-verify__btn-primary">
            Solicitar novo link
          </NuxtLink>
        </div>
      </div>
    </main>
  </NuxtLayout>
</template>

<style scoped>
.magic-verify {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg-base);
}

.magic-verify__card {
  width: 100%;
  max-width: 420px;
  padding: 40px 28px;
  border-radius: 18px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  text-align: center;
}

.magic-verify__loading,
.magic-verify__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.magic-verify__spinner {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid;
  animation: magic-verify-spin 0.7s linear infinite;
  margin-bottom: 8px;
}

@keyframes magic-verify-spin {
  to { transform: rotate(360deg); }
}

.magic-verify__icon-error {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 12%, transparent);
  color: var(--brand-negative, #dc2626);
  margin-bottom: 8px;
}

.magic-verify__title {
  font-family: var(--brand-font);
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--text-heading);
  margin: 0;
}

.magic-verify__subtitle {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-muted);
  margin: 0;
  max-width: 320px;
}

.magic-verify__btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 22px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: 0;
  font-family: var(--brand-font);
  background: var(--brand-primary);
  color: #fff;
  text-decoration: none;
  transition: filter 180ms;
  margin-top: 12px;
  box-shadow: 0 8px 22px -10px color-mix(in srgb, var(--brand-primary) 55%, transparent);
}

.magic-verify__btn-primary:hover {
  filter: brightness(0.94);
}

@media (prefers-reduced-motion: reduce) {
  .magic-verify__spinner {
    animation-duration: 1.6s;
  }
}
</style>
