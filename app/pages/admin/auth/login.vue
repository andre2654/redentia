<template>
  <div
    class="flex min-h-screen w-full items-center justify-center px-6"
    :style="{ backgroundColor: C.background, color: C.text, fontFamily: F.body }"
  >
    <!-- Ambient amber glow, consistent with main site hero aesthetic -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        class="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        :style="{ background: `radial-gradient(ellipse at center top, ${C.primary}40, transparent 60%)` }"
      />
    </div>

    <section class="relative w-full max-w-md">
      <header class="mb-10 text-center">
        <div class="mb-4 inline-flex size-12 items-center justify-center rounded" :style="{ backgroundColor: C.primary, color: C.background }">
          <UIcon name="i-lucide-shield" class="size-6" />
        </div>
        <div class="font-mono-tab text-[11px] uppercase tracking-[0.2em]" :style="{ color: C.primary }">
          [REDENT.ADMIN]
        </div>
        <h1 class="mt-3 text-[32px] leading-tight" :style="{ color: C.text, fontFamily: F.display }">
          Acesso restrito.
        </h1>
        <p class="mt-3 text-[14px]" :style="{ color: C.textMuted }">
          Esta área é privada. Apenas contas com papel admin têm acesso.
        </p>
      </header>

      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <label class="flex flex-col gap-2">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
            &gt; USUÁRIO OU EMAIL
          </span>
          <input
            v-model="form.login"
            type="text"
            required
            autocomplete="username"
            placeholder="seu.usuario"
            class="rounded-sm border bg-transparent px-4 py-3 text-[14px] outline-none transition-colors"
            :style="{ borderColor: C.border, color: C.text }"
            :disabled="submitting"
          />
        </label>
        <label class="flex flex-col gap-2">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
            &gt; SENHA
          </span>
          <input
            v-model="form.password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="rounded-sm border bg-transparent px-4 py-3 text-[14px] outline-none transition-colors"
            :style="{ borderColor: C.border, color: C.text }"
            :disabled="submitting"
          />
        </label>

        <div
          v-if="error"
          class="rounded-sm border px-4 py-3 text-[13px]"
          :style="{ borderColor: C.negative, color: C.negative, backgroundColor: `${C.negative}10` }"
        >
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="mt-2 inline-flex items-center justify-center gap-3 rounded-sm px-6 py-4 font-mono-tab text-[12px] font-bold uppercase tracking-[0.15em] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          :style="{ backgroundColor: C.primary, color: C.background }"
        >
          <UIcon v-if="submitting" name="i-lucide-loader-2" class="size-4 animate-spin" />
          <UIcon v-else name="i-lucide-log-in" class="size-4" />
          <span v-if="submitting">VALIDANDO</span>
          <span v-else>[ENTER] ENTRAR</span>
        </button>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS as C, REDENTIA_FONTS as F, REDENTIA_GOOGLE_FONT_HREF } from '~/utils/redentiaCreativeColors'

// No admin-panel middleware here — this is the one page where
// unauthenticated access is allowed (by design).
definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

useHead({
  title: 'Redentia Admin · Login',
  meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive' }],
  link: [{ rel: 'stylesheet', href: REDENTIA_GOOGLE_FONT_HREF }],
})

const { login } = useAuthService()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ login: '', password: '' })
const submitting = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  if (submitting.value) return
  error.value = null
  submitting.value = true

  try {
    const resp = await login({ login: form.login, password: form.password })
    if (!resp.access_token) throw new Error('Resposta sem token')

    auth.addToken(resp.access_token)
    await auth.fetchProfile()

    if (auth.me?.role !== 'admin') {
      // Force logout to clear the token — we don't want non-admins
      // walking around with a valid session in the admin cookie jar.
      await auth.logout().catch(() => {})
      error.value = 'Essa conta não tem permissão de administrador.'
      return
    }

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin'
    router.push(redirect)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Falha na autenticação. Verifique as credenciais.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.font-mono-tab {
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-feature-settings: 'tnum' 1;
}
input:focus { outline: none !important; border-color: var(--border-focus, currentColor); }
</style>
