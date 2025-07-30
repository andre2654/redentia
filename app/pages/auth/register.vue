<template>
  <div class="flex flex-col items-center gap-12 pt-20">
    <div class="flex flex-col items-center gap-6">
      <IconLogoFull class="h-12 w-auto fill-white" />
      <p class="text-xl font-thin">
        Ajudando investidores a gerir seus patrimonios
      </p>
    </div>
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

      <!-- Password Strength -->
      <div class="flex flex-col gap-4">
        <UProgress
          :model-value="score"
          :max="requirements.length"
          :color="color"
          :indicator="text"
          size="sm"
        />

        <div
          id="password-strength"
          class="flex flex-col gap-3 text-sm font-medium"
        >
          <span class="mx-auto text-center text-[13px] font-thin">{{
            text
          }}</span>
          <span class="text-[13px] font-thin text-white/80">
            your password must contain:
          </span>
        </div>

        <ul class="space-y-1" aria-label="Password requirements">
          <li
            v-for="req in requirements"
            :key="req.text"
            class="flex items-center gap-2"
            :class="req.met ? 'text-green-300' : 'text-white/80'"
          >
            <UIcon
              :name="req.met ? 'i-lucide-circle-check' : 'i-lucide-circle-x'"
              class="size-4 shrink-0"
            />
            <span class="text-xs font-thin">{{ req.text }}</span>
          </li>
        </ul>
      </div>

      <AtomsButton type="submit" color="tertiary" class="mt-3 w-full">
        Cadastrar
      </AtomsButton>
      <NuxtLink
        to="/auth/login"
        class="hover:text-secondary my-2 text-left text-[12px] font-thin text-white/80"
      >
        Já tem uma conta? Faça login
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

const passwordRequirements = [
  { regex: /.{8,}/, text: 'At least 8 characters' },
  { regex: /\d/, text: 'At least 1 number' },
  { regex: /[a-z]/, text: 'At least 1 lowercase letter' },
  { regex: /[A-Z]/, text: 'At least 1 uppercase letter' },
]

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .refine(
      (value) => passwordRequirements.every((req) => req.regex.test(value)),
      {
        message: 'Password does not meet all requirements',
      }
    ),
})

type Schema = z.infer<typeof schema>

const state = reactive({
  email: '',
  password: '',
  show: false,
})

const requirements = computed(() =>
  passwordRequirements.map((req) => ({
    ...req,
    met: req.regex.test(state.password ?? ''),
  }))
)

const score = computed(() => requirements.value.filter((r) => r.met).length)
const color = computed(() => {
  if (score.value <= 1) return 'error'
  if (score.value <= 3) return 'warning'
  return 'success'
})

const text = computed(() => {
  if (score.value === 0) return 'Enter a password'
  if (score.value <= 2) return 'Weak password'
  if (score.value === 3) return 'Medium password'
  return 'Strong password'
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: 'Success',
    description: 'Form has been submitted',
    color: 'success',
  })
  console.log(event.data)
}
</script>
