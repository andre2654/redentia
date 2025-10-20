<template>
  <NuxtLayout name="static" :title="false" :showLogo="false">
    <AtomsAuthHeader class="mt-16" />
    <UForm
      :schema="schema"
      :state="state"
      class="mx-auto mb-8 flex w-[335px] flex-col gap-2"
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
  </NuxtLayout>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const router = useRouter()
const { login } = useAuthService()
const authStore = useAuthStore()

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
</script>
