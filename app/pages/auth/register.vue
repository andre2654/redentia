<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-12">
    <AtomsAuthHeader />
    <UForm
      :schema="schema"
      :state="state"
      class="flex w-[335px] flex-col gap-2"
      @submit="onSubmit"
    >
      <h1 class="text-[13px] font-bold text-white/80">Registro</h1>

      <!-- Name -->
      <UFormField name="name">
        <AtomsFormInput
          v-model="state.name"
          type="text"
          placeholder="Nome"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <!-- Login -->
      <UFormField name="login">
        <AtomsFormInput
          v-model="state.login"
          type="text"
          placeholder="Login"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <!-- Celular -->
      <UFormField name="celular">
        <AtomsFormInput
          v-model="state.celular"
          v-maska="'(##) # ####-####'"
          type="text"
          placeholder="Celular"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <!-- Email -->
      <UFormField name="email">
        <AtomsFormInput
          v-model="state.email"
          type="email"
          placeholder="Email"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <!-- Password -->
      <UFormField name="password">
        <AtomsFormInputPassword
          v-model="state.password"
          :aria-invalid="score < 4"
          class="w-full"
        />
      </UFormField>

      <!-- Password Confirmation -->
      <UFormField name="password_confirmation" class="mb-4">
        <AtomsFormInputPassword
          v-model="state.password_confirmation"
          placeholder="Confirme a senha"
          class="w-full"
        />
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
          <span class="mx-auto text-center text-[13px] font-light">{{
            text
          }}</span>
          <span class="text-[13px] font-extralight text-white/80">
            your password must contain:
          </span>
        </div>

        <ul class="space-y-1" aria-label="Password requirements">
          <li
            v-for="req in requirements"
            :key="req.text"
            class="flex items-center gap-2"
            :class="req.met ? 'text-primary' : 'text-white/80'"
          >
            <UIcon
              :name="req.met ? 'i-lucide-circle-check' : 'i-lucide-circle-x'"
              class="size-4 shrink-0"
            />
            <span class="text-xs font-medium">{{ req.text }}</span>
          </li>
        </ul>
      </div>

      <AtomsButton type="submit" color="tertiary" class="mt-3 w-full">
        Cadastrar
      </AtomsButton>
      <NuxtLink
        to="/auth/login"
        class="hover:text-secondary my-2 text-left text-[12px] text-white/80"
      >
        Já tem uma conta? Faça login
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
import { vMaska } from 'maska/vue'

const { register, getCSRFToken } = useAuthService()
const { getMe } = useProfileService()

const passwordRequirements = [
  { regex: /.{8,}/, text: 'At least 8 characters' },
  { regex: /\d/, text: 'At least 1 number' },
  { regex: /[a-z]/, text: 'At least 1 lowercase letter' },
  { regex: /[A-Z]/, text: 'At least 1 uppercase letter' },
]

const schema = z
  .object({
    name: z.string().min(2, 'Nome obrigatório'),
    login: z.string().min(3, 'Login obrigatório'),
    email: z.string().email('Invalid email'),
    celular: z.string().min(8, 'Celular obrigatório'),
    password: z
      .string()
      .refine(
        (value) => passwordRequirements.every((req) => req.regex.test(value)),
        {
          message: 'Password does not meet all requirements',
        }
      ),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords must match',
    path: ['password_confirmation'],
  })

type Schema = z.infer<typeof schema>

const state = reactive({
  name: '',
  login: '',
  email: '',
  celular: '',
  password: '',
  password_confirmation: '',
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

const router = useRouter()

async function onSubmit(_: FormSubmitEvent<Schema>) {
  try {
    const resp = await register({
      name: state.name,
      login: state.login,
      email: state.email,
      celular: state.celular,
      password: state.password,
      password_confirmation: state.password_confirmation,
    })
    if (resp?.token) {
      const cookie = useCookie<string | null>('auth:token', {
        maxAge: 3600 * 24 * 30,
      })
      cookie.value = resp.token
      const auth = useAuthStore()
      const profile = await getMe()
      auth.$patch({ me: profile })
      showSuccessNotification('Cadastro concluído', 'Bem-vindo!')
      router.push('/')
    } else {
      showSuccessNotification(
        'Cadastro concluído',
        'Agora você pode fazer login'
      )
      router.push('/auth/login')
    }
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Verifique os dados informados'
    showErrorNotification('Falha no cadastro', message)
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
