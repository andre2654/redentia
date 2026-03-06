<template>
  <NuxtLayout name="static" :title="false" :showLogo="false">
    <section class="px-4 pb-16 pt-12">
      <div
        class="mx-auto flex max-w-5xl flex-col items-center gap-14 md:flex-row md:items-start md:gap-20"
      >
        <div
          class="flex flex-1 flex-col items-center gap-8 text-center md:items-start md:text-left"
        >
          <AtomsAuthHeader class="mt-0 w-full max-w-sm" />
          <p class="text-sm leading-relaxed md:max-w-sm" :style="{ color: brand.colors.textMuted }">
            Faça login para acessar seus dashboards em tempo real, acompanhar
            ativos favoritos e receber insights personalizados sobre sua
            carteira.
          </p>
        </div>

        <UForm
          :schema="schema"
          :state="state"
          class="flex w-full max-w-md flex-col gap-5 rounded-[32px] border px-8 py-10 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.5)] backdrop-blur-2xl"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
          @submit="onSubmit"
        >
          <div class="space-y-2 text-center md:text-left">
            <span
              class="text-xs font-medium uppercase tracking-[0.2em]"
              :style="{ color: brand.colors.primary }"
            >
              Acesso
            </span>
            <h1 class="text-2xl font-semibold" :style="{ color: brand.colors.text }">
              {{ brand.auth.loginTitle }}
            </h1>
            <p class="text-sm" :style="{ color: brand.colors.textMuted }">
              {{ brand.auth.loginSubtitle }}
            </p>
          </div>

          <!-- Login -->
          <UFormField name="login">
            <AtomsFormInput
              v-model="state.login"
              type="text"
              placeholder="Usuário"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <!-- Password -->
          <UFormField name="password">
            <AtomsFormInputPassword v-model="state.password" class="w-full" />
          </UFormField>

          <AtomsButton
            type="submit"
            color="secondary"
            size="lg"
            class="mt-2 w-full justify-center"
          >
            {{ brand.nav.login }}
          </AtomsButton>

          <div class="flex flex-col gap-2 text-center md:text-left">
            <NuxtLink
              to="/auth/register"
              class="text-sm font-medium transition hover:opacity-80"
              :style="{ color: brand.colors.primary }"
            >
              Ainda nao tem conta? Cadastre-se agora
            </NuxtLink>
            <p class="text-[11px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
              {{ brand.auth.termsText }}
            </p>
          </div>
        </UForm>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const brand = useBrand()
const router = useRouter()
const { login } = useAuthService()
const authStore = useAuthStore()

const schema = z.object({
  login: z.string().min(3, 'Login obrigatório'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
})

type Schema = z.infer<typeof schema>

const state = reactive({
  login: '',
  password: '',
})

async function onSubmit(_: FormSubmitEvent<Schema>) {
  try {
    const resp = await login({ login: state.login, password: state.password })
    if (resp.access_token) {
      authStore.addToken(resp.access_token)
      await authStore.fetchProfile()
      showSuccessNotification('Login efetuado', 'Bem-vindo de volta!')
      router.push('/')
    }
  } catch (e) {
    console.log(e)
    const message =
      e instanceof Error ? e?.data?.message : 'Verifique suas credenciais'
    showErrorNotification('Falha no login', message)
  }
}

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: `Entrar | ${brand.name}`,
  description:
    `Faça login na ${brand.name} para acessar dashboards em tempo real, acompanhar ativos e receber insights personalizados com IA.`,
  path: '/auth/login',
  robots: 'noindex,nofollow',
})
</script>
