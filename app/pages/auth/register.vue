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
          <p class="text-sm leading-relaxed text-white/70 md:max-w-sm">
            Crie sua conta para acessar carteiras inteligentes, simuladores de
            investimentos e recursos personalizados que aceleram seus
            resultados.
          </p>
        </div>

        <UForm
          :schema="schema"
          :state="state"
          class="flex w-full max-w-md flex-col gap-5 rounded-[32px] border border-white/10 bg-white/5 px-8 py-10 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.5)] backdrop-blur-2xl"
          @submit="onSubmit"
        >
          <div class="space-y-2 text-center md:text-left">
            <span
              class="text-secondary/80 text-xs font-medium uppercase tracking-[0.2em]"
            >
              Cadastro
            </span>
            <h1 class="text-2xl font-semibold text-white">Criar conta</h1>
            <p class="text-sm text-white/70">
              Complete as informações abaixo para começar a usar o Redentia.
            </p>
          </div>

          <!-- Name -->
          <UFormField name="name">
            <AtomsFormInput
              v-model="state.name"
              type="text"
              placeholder="Nome completo"
              size="lg"
              class="w-full"
            />
          </UFormField>

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

          <!-- Celular -->
          <UFormField name="celular">
            <AtomsFormInput
              v-model="state.celular"
              v-maska="'+55 (##) # ####-####'"
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
              placeholder="E-mail"
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
          <UFormField name="password_confirmation">
            <AtomsFormInputPassword
              v-model="state.password_confirmation"
              placeholder="Confirme a senha"
              class="w-full"
            />
          </UFormField>

          <!-- Password Strength -->
          <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
            <UProgress
              :model-value="score"
              :max="requirements.length"
              :color="color"
              :indicator="text"
              size="sm"
            />

            <div
              id="password-strength"
              class="mt-4 flex flex-col gap-3 text-sm font-medium"
            >
              <span class="text-center text-[13px] font-light text-white/80">{{
                text
              }}</span>
              <span class="text-[13px] font-extralight text-white/70">
                Sua senha precisa ter:
              </span>
            </div>

            <ul class="mt-2 space-y-2" aria-label="Requisitos da senha">
              <li
                v-for="req in requirements"
                :key="req.text"
                class="flex items-center gap-2"
                :class="req.met ? 'text-secondary' : 'text-white/70'"
              >
                <UIcon
                  :name="
                    req.met ? 'i-lucide-circle-check' : 'i-lucide-circle-x'
                  "
                  class="size-4 shrink-0"
                />
                <span class="text-xs font-medium">{{ req.text }}</span>
              </li>
            </ul>
          </div>

          <AtomsButton
            type="submit"
            color="secondary"
            size="lg"
            class="w-full justify-center"
          >
            Cadastrar
          </AtomsButton>

          <div class="flex flex-col gap-2 text-center md:text-left">
            <NuxtLink
              to="/auth/login"
              class="text-secondary hover:text-secondary/80 text-sm font-medium transition"
            >
              Já tem uma conta? Faça login
            </NuxtLink>
            <p class="text-[11px] leading-relaxed text-white/60">
              Ao criar sua conta no Redentia, você concorda com nossos Termos de
              Serviço e Política de privacidade e declara ter pelo menos 18
              anos.
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
import { vMaska } from 'maska/vue'

const { register } = useAuthService()
const authStore = useAuthStore()

const passwordRequirements = [
  { regex: /.{8,}/, text: 'Pelo menos 8 caracteres' },
  { regex: /\d/, text: 'Ao menos 1 número' },
  { regex: /[a-z]/, text: 'Ao menos 1 letra minúscula' },
  { regex: /[A-Z]/, text: 'Ao menos 1 letra maiúscula' },
]

const schema = z
  .object({
    name: z.string().min(2, 'Nome obrigatório'),
    login: z.string().min(3, 'Login obrigatório'),
    email: z.string().email('Email inválido'),
    celular: z.string().min(20, 'Celular obrigatório'),
    password: z
      .string()
      .refine(
        (value) => passwordRequirements.every((req) => req.regex.test(value)),
        {
          message: 'A senha não atende a todos os requisitos',
        }
      ),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'As senhas devem ser iguais',
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
  if (score.value === 0) return 'Digite uma senha'
  if (score.value <= 2) return 'Senha fraca'
  if (score.value === 3) return 'Senha média'
  return 'Senha forte'
})

const router = useRouter()

async function onSubmit(_: FormSubmitEvent<Schema>) {
  try {
    const resp = await register({
      name: state.name,
      login: state.login,
      email: state.email,
      celular: '+' + state.celular.replace(/\D/g, ''),
      password: state.password,
      password_confirmation: state.password_confirmation,
    })
    if (resp?.token) {
      const cookie = useCookie<string | null>('auth:token', {
        maxAge: 3600 * 24 * 30,
      })
      cookie.value = resp.token
      await authStore.fetchProfile()
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

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: 'Criar conta | Redentia',
  description:
    'Crie sua conta na Redentia para acompanhar ações, FIIs e receber análises e insights com inteligência artificial.',
  path: '/auth/register',
  robots: 'noindex,nofollow',
})
</script>
