<template>
  <NuxtLayout name="static" title="" :show-logo="false">
    <section
      class="relative min-h-screen overflow-hidden px-4 pb-16 pt-12"
      :style="{ backgroundColor: brand.colors.background }"
    >
      <!-- Same ambient background language as the login page so the
           transition forgot-password → login → forgot-password feels
           seamless. Single radial glow + faint dot grid; we deliberately
           skip the variant-specific decorations because this page is
           rarely opened and shouldn't carry brand weight on its own. -->
      <div class="pointer-events-none absolute inset-0">
        <div
          class="absolute left-1/2 top-0 h-[480px] w-[800px] -translate-x-1/2 rounded-full blur-3xl opacity-30"
          :style="{ background: `radial-gradient(ellipse at center top, ${brand.colors.primary}33, transparent 60%)` }"
        />
      </div>

      <div class="relative mx-auto flex max-w-md flex-col gap-8 pt-8">
        <!-- Header — back arrow + concise copy. No hero illustration:
             this is a transactional screen, not a landing. -->
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
            Recuperação de acesso
          </span>
          <h1
            class="text-3xl font-semibold leading-tight md:text-4xl"
            :style="{ color: brand.colors.text }"
          >
            Esqueceu sua senha?
          </h1>
          <p
            class="text-[14px] leading-relaxed"
            :style="{ color: brand.colors.textMuted }"
          >
            Digite o e-mail da sua conta. Se ele estiver cadastrado, você
            receberá um link para criar uma nova senha em alguns instantes.
          </p>
        </div>

        <UForm
          :schema="schema"
          :state="state"
          class="flex w-full flex-col gap-5 rounded-2xl border p-7"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
          @submit="onSubmit"
        >
          <UFormField name="email">
            <template #label>
              <span
                class="text-[11px] font-medium uppercase tracking-[0.18em]"
                :style="{ color: brand.colors.textMuted }"
              >
                E-mail
              </span>
            </template>
            <AtomsFormInput
              v-model="state.email"
              type="email"
              autocomplete="email"
              spellcheck="false"
              placeholder="seu@email.com"
              size="lg"
              class="w-full"
              :disabled="sent"
            />
          </UFormField>

          <AtomsButton
            type="submit"
            color="secondary"
            size="lg"
            :loading="submitting"
            :disabled="submitting || sent"
            class="mt-1 w-full justify-center"
          >
            {{ sent ? 'E-mail enviado' : 'Enviar link de redefinição' }}
          </AtomsButton>

          <!-- Confirmation block stays in place after the request fires
               so the user has visual proof "something happened" without
               needing a route change. -->
          <div
            v-if="sent"
            class="flex items-start gap-3 rounded-lg border p-4"
            :style="{ borderColor: `${brand.colors.positive}66`, backgroundColor: `${brand.colors.positive}10` }"
          >
            <UIcon
              name="i-lucide-mail-check"
              class="mt-0.5 size-5 shrink-0"
              :style="{ color: brand.colors.positive }"
            />
            <div class="flex-1 space-y-1">
              <p class="text-[13px] font-medium" :style="{ color: brand.colors.text }">
                Link enviado (se a conta existir)
              </p>
              <p class="text-[12px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
                Verifique sua caixa de entrada e a pasta de spam. O link
                expira em 60 minutos. Não recebeu? Aguarde um minuto e
                <button type="button" class="underline" @click="resend">tente de novo</button>.
              </p>
            </div>
          </div>
        </UForm>

        <p class="text-center text-[11px]" :style="{ color: brand.colors.textMuted }">
          Lembrou a senha?
          <NuxtLink
            to="/auth/login"
            class="font-medium underline-offset-4 transition hover:opacity-80"
            :style="{ color: brand.colors.primary }"
          >
            Voltar ao login
          </NuxtLink>
        </p>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const brand = useBrand()
const { forgotPassword } = useAuthService()

const schema = z.object({
  email: z.string().email('Informe um e-mail válido'),
})
type Schema = z.infer<typeof schema>

const state = reactive({ email: '' })
const submitting = ref(false)
const sent = ref(false)

async function onSubmit(_: FormSubmitEvent<Schema>) {
  if (submitting.value) return
  submitting.value = true
  try {
    const resp = await forgotPassword({ email: state.email })
    sent.value = true
    showSuccessNotification('Link enviado', resp.message)
  } catch (e) {
    const message =
      (e as { data?: { message?: string } })?.data?.message
        ?? (e instanceof Error ? e.message : 'Não foi possível enviar agora. Tente novamente em instantes.')
    showErrorNotification('Falha ao enviar', message)
  } finally {
    submitting.value = false
  }
}

// Allow a manual resend after the throttle window. The backend's
// own per-email throttle (60s, set in config/auth.php) will reject
// requests that come in too fast — we surface that via the API
// error message rather than tracking it client-side.
async function resend() {
  sent.value = false
  await onSubmit({} as FormSubmitEvent<Schema>)
}

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: `Recuperar senha | ${brand.name}`,
  description: `Solicite um link para redefinir a senha da sua conta na ${brand.name}.`,
  path: '/auth/forgot-password',
  robots: 'noindex,nofollow',
})
</script>
