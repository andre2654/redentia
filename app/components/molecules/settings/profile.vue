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

    <!-- Seção: Telefone (opcional por enquanto; sera obrigatorio antes de
         acessar /wallet e /help numa proxima iteracao). Coletado aqui
         pra cortar fricao do cadastro inicial. -->
    <section class="flex flex-col gap-4">
      <div>
        <h3 class="text-base font-semibold text-white">Telefone</h3>
        <p class="mt-1 text-xs text-white/50">
          Usado para contato e acesso a recursos como carteira e chat. Opcional por enquanto.
        </p>
      </div>
      <UForm
        :schema="celularSchema"
        :state="celularState"
        class="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3"
        @submit="onSubmitCelular"
      >
        <UFormField name="celular" class="min-w-0 flex-1 sm:max-w-xs">
          <UInput
            v-model="celularState.celular"
            v-maska="'+55 (##) # ####-####'"
            type="tel"
            autocomplete="tel"
            inputmode="tel"
            size="lg"
            placeholder="+55 (00) 0 0000-0000"
            class="w-full"
            :ui="{ base: 'rounded-xl border-white/10 bg-white/5' }"
          />
        </UFormField>
        <UButton
          type="submit"
          color="primary"
          size="lg"
          :loading="savingCelular"
          class="rounded-xl shrink-0"
        >
          Salvar telefone
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

        <!-- Ticker inline simples — substituiu o bloco antigo de barra de
             progresso + lista de requisitos. Com so 1 requisito (8 chars
             minimo) o bloco completo virou overkill. -->
        <p
          class="!m-0 flex items-center gap-1 !text-[11px] !leading-tight transition-colors"
          :class="passwordScore >= 1 ? 'text-secondary' : 'text-white/60'"
          aria-live="polite"
        >
          <UIcon
            :name="passwordScore >= 1 ? 'i-lucide-circle-check' : 'i-lucide-circle'"
            class="size-3 shrink-0"
            aria-hidden="true"
          />
          <span class="!text-[11px] !leading-tight">A senha deve ter pelo menos 8 caracteres</span>
        </p>

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
const savingCelular = ref(false)
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

// Telefone: schema permite vazio. Pra acessar wallet/chat depois, vamos
// validar `min(20)` num middleware de rota separado, nao aqui — settings
// continua salvando com o que o usuario quiser informar.
const celularSchema = z.object({
  celular: z.string().optional(),
})

const celularState = reactive({
  celular: authStore.me?.celular ?? '',
})

// Hidrata o telefone quando o `me` carrega/atualiza.
watch(
  () => authStore.me?.celular,
  (celular) => {
    if (celular && !celularState.celular) celularState.celular = celular
  },
  { immediate: true }
)

// Critérios da senha — alinhado ao registro: apenas 8 caracteres minimo.
// (composicao forcada nao agrega seguranca real, conforme NIST SP 800-63B.)
const passwordRequirements = [
  { regex: /.{8,}/, text: 'Pelo menos 8 caracteres' },
]

// Score binario (0 ou 1 — so checamos 8 chars). Usado pelo ticker
// inline acima e pelo `canSubmitPassword` abaixo. Os antigos
// passwordColor/passwordStrengthText/passwordRequirementsList foram
// removidos junto com o bloco de progresso, ninguem mais usa.
const passwordScore = computed(() =>
  passwordRequirements.filter((req) => req.regex.test(passwordState.password ?? '')).length
)

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

async function onSubmitCelular(event: FormSubmitEvent<z.infer<typeof celularSchema>>) {
  savingCelular.value = true
  try {
    // Normaliza pro formato E.164 (ex: +5511999999999) antes de enviar.
    // Se o usuario apagou tudo, manda vazio explicito pro backend
    // remover o registro antigo.
    const raw = (event.data.celular ?? '').replace(/\D/g, '')
    const normalized = raw.length >= 10 ? '+' + raw : ''
    const resp = (await updateProfile({ celular: normalized })) as { user?: { id?: string | number; name?: string; email?: string; celular?: string }; data?: { user?: unknown } }
    const user = resp?.user ?? (resp as any)?.data?.user
    if (user) authStore.setMeFromUser(user as any)
    showSuccessNotification('Telefone atualizado', normalized ? 'Seu telefone foi salvo.' : 'Telefone removido do perfil.')
  } catch (e: any) {
    const msg = e?.data?.message ?? e?.message ?? 'Não foi possível atualizar o telefone.'
    showErrorNotification('Erro ao salvar', msg)
  } finally {
    savingCelular.value = false
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
