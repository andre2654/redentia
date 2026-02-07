<template>
  <div class="flex flex-col gap-8 p-6">
    <!-- Seção: Nome -->
    <section class="flex flex-col gap-4">
      <div>
        <h3 class="text-base font-semibold text-white">Seu nome</h3>
        <p class="mt-1 text-xs text-white/50">
          Esse nome aparece no app e na sidebar.
        </p>
      </div>
      <UForm
        :schema="nameSchema"
        :state="nameState"
        class="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3"
        @submit="onSubmitName"
      >
        <UFormField name="name" class="min-w-0 flex-1 sm:max-w-xs">
          <UInput
            v-model="nameState.name"
            size="lg"
            placeholder="Seu nome"
            class="w-full"
            :ui="{ base: 'rounded-xl border-white/10 bg-white/5' }"
          />
        </UFormField>
        <UButton
          type="submit"
          color="primary"
          size="lg"
          :loading="savingName"
          class="rounded-xl shrink-0"
        >
          Salvar nome
        </UButton>
      </UForm>
    </section>

    <!-- Divisor -->
    <div class="border-t border-white/10" />

    <!-- Seção: Alterar senha -->
    <section class="flex flex-col gap-4">
      <div>
        <h3 class="text-base font-semibold text-white">Alterar senha</h3>
        <p class="mt-1 text-xs text-white/50">
          Use letras, números e maiúsculas/minúsculas. Mínimo 8 caracteres.
        </p>
      </div>
      <UForm
        :schema="passwordSchema"
        :state="passwordState"
        class="flex max-w-md flex-col gap-4"
        @submit="onSubmitPassword"
      >
        <UFormField name="current_password" label="Senha atual">
          <UInput
            v-model="passwordState.current_password"
            type="password"
            size="lg"
            placeholder="Digite sua senha atual"
            class="w-full"
            :ui="{ base: 'rounded-xl border-white/10 bg-white/5' }"
          />
        </UFormField>
        <UFormField name="password" label="Nova senha">
          <UInput
            v-model="passwordState.password"
            :type="showNewPassword ? 'text' : 'password'"
            size="lg"
            placeholder="Nova senha"
            class="w-full"
            :ui="{ base: 'rounded-xl border-white/10 bg-white/5' }"
            :aria-invalid="passwordRequirements.length > 0 && passwordScore < passwordRequirements.length"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="xs"
                :icon="showNewPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="showNewPassword ? 'Ocultar' : 'Mostrar'"
                @click="showNewPassword = !showNewPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <!-- Critérios da senha (igual à tela de registro) -->
        <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
          <UProgress
            :model-value="passwordScore"
            :max="passwordRequirements.length"
            :color="passwordColor"
            :indicator="passwordStrengthText"
            size="sm"
          />
          <div class="mt-4 flex flex-col gap-3 text-sm font-medium">
            <span class="text-center text-[13px] font-light text-white/80">
              {{ passwordStrengthText }}
            </span>
            <span class="text-[13px] font-extralight text-white/70">
              Sua senha precisa ter:
            </span>
          </div>
          <ul class="mt-2 space-y-2" aria-label="Requisitos da senha">
            <li
              v-for="req in passwordRequirementsList"
              :key="req.text"
              class="flex items-center gap-2"
              :class="req.met ? 'text-secondary' : 'text-white/70'"
            >
              <UIcon
                :name="req.met ? 'i-lucide-circle-check' : 'i-lucide-circle-x'"
                class="size-4 shrink-0"
              />
              <span class="text-xs font-medium">{{ req.text }}</span>
            </li>
          </ul>
        </div>

        <UFormField name="password_confirmation" label="Confirmar nova senha">
          <UInput
            v-model="passwordState.password_confirmation"
            type="password"
            size="lg"
            placeholder="Repita a nova senha"
            class="w-full"
            :ui="{ base: 'rounded-xl border-white/10 bg-white/5' }"
          />
        </UFormField>
        <UButton
          type="submit"
          color="primary"
          size="lg"
          :loading="savingPassword"
          :disabled="!canSubmitPassword"
          class="w-fit rounded-xl shrink-0"
        >
          Alterar senha
        </UButton>
      </UForm>
    </section>
  </div>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { showErrorNotification, showSuccessNotification } from '~/composables/useNotify'

const authStore = useAuthStore()
const { updateProfile, changePassword } = useAuthService()

const savingName = ref(false)
const savingPassword = ref(false)
const showNewPassword = ref(false)

// Nome: pré-preenche com o usuário logado
const nameSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
})

const nameState = reactive({
  name: authStore.me?.name ?? '',
})

// Atualiza o state quando o store tiver o me (ex.: após fetch)
watch(
  () => authStore.me?.name,
  (name) => {
    if (name && !nameState.name) nameState.name = name
  },
  { immediate: true }
)

// Critérios da senha (iguais à tela de registro)
const passwordRequirements = [
  { regex: /.{8,}/, text: 'Pelo menos 8 caracteres' },
  { regex: /\d/, text: 'Ao menos 1 número' },
  { regex: /[a-z]/, text: 'Ao menos 1 letra minúscula' },
  { regex: /[A-Z]/, text: 'Ao menos 1 letra maiúscula' },
]

const passwordRequirementsList = computed(() =>
  passwordRequirements.map((req) => ({
    ...req,
    met: req.regex.test(passwordState.password ?? ''),
  }))
)

const passwordScore = computed(() =>
  passwordRequirementsList.value.filter((r) => r.met).length
)

const passwordColor = computed(() => {
  if (passwordScore.value <= 1) return 'error'
  if (passwordScore.value <= 3) return 'warning'
  return 'success'
})

const passwordStrengthText = computed(() => {
  if (passwordScore.value === 0) return 'Digite uma senha'
  if (passwordScore.value <= 2) return 'Senha fraca'
  if (passwordScore.value === 3) return 'Senha média'
  return 'Senha forte'
})

const canSubmitPassword = computed(() => {
  const cur = (passwordState.current_password ?? '').trim()
  const pwd = (passwordState.password ?? '').trim()
  const conf = (passwordState.password_confirmation ?? '').trim()
  const requirementsMet = passwordScore.value === passwordRequirements.length
  return cur.length > 0 && pwd.length > 0 && conf.length > 0 && requirementsMet && pwd === conf
})

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Informe sua senha atual'),
    password: z.string().refine(
      (value) => passwordRequirements.every((req) => req.regex.test(value ?? '')),
      { message: 'A senha não atende a todos os requisitos' }
    ),
    password_confirmation: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'As senhas não coincidem',
    path: ['password_confirmation'],
  })

const passwordState = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})

async function onSubmitName(event: FormSubmitEvent<z.infer<typeof nameSchema>>) {
  savingName.value = true
  try {
    const resp = (await updateProfile({ name: event.data.name })) as { user?: { id?: string | number; name?: string; email?: string }; data?: { user?: unknown } }
    const user = resp?.user ?? (resp as any)?.data?.user
    authStore.setMeFromUser(user ?? { name: event.data.name, email: authStore.me?.email ?? '', id: authStore.me?.id ?? '' })
    showSuccessNotification('Nome atualizado', 'Seu nome foi alterado com sucesso.')
  } catch (e: any) {
    const msg = e?.data?.message ?? e?.message ?? 'Não foi possível atualizar o nome.'
    showErrorNotification('Erro ao salvar', msg)
  } finally {
    savingName.value = false
  }
}

async function onSubmitPassword(
  event: FormSubmitEvent<z.infer<typeof passwordSchema>>
) {
  savingPassword.value = true
  try {
    await changePassword({
      current_password: event.data.current_password,
      password: event.data.password,
      password_confirmation: event.data.password_confirmation,
    })
    showSuccessNotification('Senha alterada', 'Sua senha foi atualizada. Use-a no próximo login.')
    passwordState.current_password = ''
    passwordState.password = ''
    passwordState.password_confirmation = ''
  } catch (e: any) {
    const msg =
      e?.data?.message ??
      (Array.isArray(e?.data?.errors) ? Object.values(e.data.errors).flat().join(' ') : null) ??
      e?.message ??
      'Não foi possível alterar a senha.'
    showErrorNotification('Erro ao alterar senha', msg)
  } finally {
    savingPassword.value = false
  }
}
</script>
