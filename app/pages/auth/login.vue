<template>
  <div class="flex flex-col items-center gap-12 pt-20">
    <AtomsAuthHeader />
    <UForm
      :schema="schema"
      :state="state"
      class="flex w-[335px] flex-col gap-2"
      @submit="onSubmit"
    >
      <h1 class="text-[13px] font-bold text-white/80">Registro</h1>

      <!-- Email -->
      <UFormField name="email" class="mb-4">
        <AtomsFormInput
          v-model="state.email"
          type="email"
          placeholder="Email"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <!-- Password -->
      <UFormField name="password" class="mb-2">
        <AtomsFormInput
          v-model="state.password"
          :type="state.show ? 'text' : 'password'"
          placeholder="Password"
          :aria-invalid="score < 4"
          aria-describedby="password-strength"
          class="w-full"
          size="lg"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              :icon="state.show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-label="state.show ? 'Hide password' : 'Show password'"
              :aria-pressed="state.show"
              @click="state.show = !state.show"
            />
          </template>
        </AtomsFormInput>
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
        Ao fazer login e usar o PayToSee, você concorda com nossos Termos de
        Serviço e Política de privacidade e confirma que tem pelo menos 18 anos
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
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

type Schema = z.infer<typeof schema>

const state = reactive({
  email: '',
  password: '',
  show: false,
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  showSuccessNotification('Login successful', 'Welcome back!')
  console.log(event.data)

  router.push('/')
}
</script>
