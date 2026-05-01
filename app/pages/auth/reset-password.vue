<template>
  <NuxtLayout name="static" title="" :show-logo="false">
    <section
      class="relative min-h-screen overflow-hidden px-4 pb-16 pt-12"
      :style="{ backgroundColor: brand.colors.background }"
    >
      <div class="pointer-events-none absolute inset-0">
        <div
          class="absolute left-1/2 top-0 h-[480px] w-[800px] -translate-x-1/2 rounded-full blur-3xl opacity-30"
          :style="{ background: `radial-gradient(ellipse at center top, ${brand.colors.primary}33, transparent 60%)` }"
        />
      </div>

      <div class="relative mx-auto flex max-w-md flex-col gap-8 pt-8">
        <NuxtLink
          to="/auth/login"
          class="inline-flex items-center gap-2 text-[12px] font-medium transition hover:opacity-70"
          :style="{ color: brand.colors.textMuted }"
        >
          <UIcon name="i-lucide-arrow-left" class="size-3.5" />
          Voltar para o login
        </NuxtLink>

        <div class="space-y-3">
          <span
            class="text-[10px] font-bold uppercase tracking-[0.22em]"
            :style="{ color: brand.colors.primary }"
          >
            Nova senha
          </span>
          <h1
            class="text-3xl font-semibold leading-tight md:text-4xl"
            :style="{ color: brand.colors.text }"
          >
            Defina uma senha nova
          </h1>
          <p
            class="text-[14px] leading-relaxed"
            :style="{ color: brand.colors.textMuted }"
          >
            Escolha uma senha com pelo menos 8 caracteres. Após salvar,
            todas as sessões abertas serão encerradas e você precisará
            entrar de novo em cada dispositivo.
          </p>
        </div>

        <!-- Token missing — the user opened /auth/reset-password without
             the link from the email. Render a friendly fallback instead
             of an empty form that silently 422s. -->
        <div
          v-if="!token || !email"
          class="flex items-start gap-3 rounded-lg border p-4"
          :style="{ borderColor: `${brand.colors.negative}66`, backgroundColor: `${brand.colors.negative}10` }"
        >
          <UIcon
            name="i-lucide-link-2-off"
            class="mt-0.5 size-5 shrink-0"
            :style="{ color: brand.colors.negative }"
          />
          <div class="flex-1 space-y-2">
            <p class="text-[13px] font-medium" :style="{ color: brand.colors.text }">
              Link inválido ou incompleto
            </p>
            <p class="text-[12px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
              Este endereço só funciona quando aberto pelo e-mail enviado
              após uma solicitação de recuperação. Se você ainda precisa
              redefinir, peça um novo link.
            </p>
            <NuxtLink
              to="/auth/forgot-password"
              class="inline-flex items-center gap-1.5 text-[12px] font-medium underline-offset-4 transition hover:opacity-80"
              :style="{ color: brand.colors.primary }"
            >
              Solicitar novo link
              <UIcon name="i-lucide-arrow-right" class="size-3.5" />
            </NuxtLink>
          </div>
        </div>

        <UForm
          v-else-if="!completed"
          :schema="schema"
          :state="state"
          class="flex w-full flex-col gap-5 rounded-2xl border p-7"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
          @submit="onSubmit"
        >
          <!-- Read-only email display so the user knows which account
               they're resetting (the token is bound to this email and
               can't be repointed). -->
          <div
            class="flex items-center justify-between rounded-lg border px-3 py-2.5 text-[12px]"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background }"
          >
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-user-round"
                class="size-3.5"
                :style="{ color: brand.colors.textMuted }"
              />
              <span :style="{ color: brand.colors.textMuted }">Conta:</span>
              <span class="font-medium" :style="{ color: brand.colors.text }">{{ email }}</span>
            </div>
          </div>

          <UFormField name="password">
            <template #label>
              <span
                class="text-[11px] font-medium uppercase tracking-[0.18em]"
                :style="{ color: brand.colors.textMuted }"
              >
                Nova senha
              </span>
            </template>
            <AtomsFormInputPassword v-model="state.password" class="w-full" />
          </UFormField>

          <UFormField name="password_confirmation">
            <template #label>
              <span
                class="text-[11px] font-medium uppercase tracking-[0.18em]"
                :style="{ color: brand.colors.textMuted }"
              >
                Confirmar senha
              </span>
            </template>
            <AtomsFormInputPassword v-model="state.password_confirmation" class="w-full" />
          </UFormField>

          <AtomsButton
            type="submit"
            color="secondary"
            size="lg"
            :loading="submitting"
            :disabled="submitting"
            class="mt-1 w-full justify-center"
          >
            Salvar nova senha
          </AtomsButton>
        </UForm>

        <!-- Success state — keeps the user on the page for a beat so
             they read the confirmation, then auto-redirects to login. -->
        <div
          v-else
          class="flex items-start gap-3 rounded-lg border p-4"
          :style="{ borderColor: `${brand.colors.positive}66`, backgroundColor: `${brand.colors.positive}10` }"
        >
          <UIcon
            name="i-lucide-circle-check-big"
            class="mt-0.5 size-5 shrink-0"
            :style="{ color: brand.colors.positive }"
          />
          <div class="flex-1 space-y-1">
            <p class="text-[13px] font-medium" :style="{ color: brand.colors.text }">
              Senha redefinida com sucesso
            </p>
            <p class="text-[12px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
              Te levando para o login em instantes…
            </p>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const brand = useBrand()
const route = useRoute()
const router = useRouter()
const { resetPassword } = useAuthService()

// Token + email arrive via the URL the email-link points at
// (`/auth/reset-password?token=…&email=…`). They're untrusted user
// input — we only forward them to the backend, which validates them
// against `password_reset_tokens` before flipping the password.
const token = computed(() => {
  const v = route.query.token
  return typeof v === 'string' ? v : ''
})
const email = computed(() => {
  const v = route.query.email
  return typeof v === 'string' ? v : ''
})

const schema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    password_confirmation: z.string().min(8, 'Mínimo 8 caracteres'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'As senhas não coincidem',
    path: ['password_confirmation'],
  })
type Schema = z.infer<typeof schema>

const state = reactive({
  password: '',
  password_confirmation: '',
})
const submitting = ref(false)
const completed = ref(false)

async function onSubmit(_: FormSubmitEvent<Schema>) {
  if (submitting.value) return
  submitting.value = true
  try {
    const resp = await resetPassword({
      token: token.value,
      email: email.value,
      password: state.password,
      password_confirmation: state.password_confirmation,
    })
    completed.value = true
    showSuccessNotification('Senha atualizada', resp.message)
    // Brief delay so the success card has time to paint before the
    // route swap. Login page lives behind the same layout, so the
    // transition is essentially a no-op for the user but the form
    // disappearing under their cursor mid-click feels weird.
    setTimeout(() => router.push('/auth/login'), 1800)
  } catch (e) {
    const message =
      (e as { data?: { message?: string } })?.data?.message
        ?? (e instanceof Error ? e.message : 'Não foi possível redefinir agora. Tente novamente.')
    showErrorNotification('Falha ao redefinir', message)
  } finally {
    submitting.value = false
  }
}

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: `Redefinir senha | ${brand.name}`,
  description: `Defina uma nova senha para sua conta na ${brand.name}.`,
  path: '/auth/reset-password',
  robots: 'noindex,nofollow',
})
</script>
