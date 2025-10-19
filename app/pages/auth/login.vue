<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-12">
    <AtomsAuthHeader />
    <UForm
      :schema="schema"
      :state="state"
      class="flex w-[335px] flex-col gap-2"
      @submit="onSubmit"
    >
      <h1 class="text-[13px] font-bold text-white/80">Login</h1>

      <!-- Login -->
      <UFormField name="login" class="mb-4">
        <AtomsFormInput
          v-model="state.login"
          type="text"
          placeholder="Login"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <!-- Password -->
      <UFormField name="password" class="mb-2">
        <AtomsFormInputPassword v-model="state.password" class="w-full" />
      </UFormField>

      <AtomsButton type="submit" color="tertiary" class="mt-3 w-full">
        Entrar
      </AtomsButton>
      <NuxtLink
        to="/auth/register"
        class="hover:text-secondary my-2 text-left text-[12px] text-white/80"
      >
        Cadastre-se
      </NuxtLink>
      <p class="text-center text-[10px] text-white/70">
        Ao fazer login e usar o PayToSee, você concorda com nossos Termos de
        Serviço e Política de privacidade e confirma que tem pelo menos 18 anos
        de idade
      </p>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const router = useRouter()

const schema = z.object({
  login: z.string().min(3, 'Login obrigatório'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

type Schema = z.infer<typeof schema>

const state = reactive({
  login: '',
  password: '',
})

async function onSubmit(_: FormSubmitEvent<Schema>) {
  try {
    const { login } = useAuthService()
    const resp = await login({ login: state.login, password: state.password })
    if (resp?.token) {
      const cookie = useCookie<string | null>('auth:token', {
        maxAge: 3600 * 24 * 30,
      })
      cookie.value = resp.token
      const auth = useAuthStore()
      const { getMe } = useProfileService()
      const profile = await getMe()
      auth.$patch({ me: profile })
      showSuccessNotification('Login efetuado', 'Bem-vindo de volta!')
      router.push('/')
    }
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Verifique suas credenciais'
    showErrorNotification('Falha no login', message)
  }
}
onMounted(async () => {
  await getCSRFToken()
})
definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})
</script>
