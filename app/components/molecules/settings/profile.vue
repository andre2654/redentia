<template>
  <div class="set-profile">
    <!-- Seção: Nome -->
    <section class="set-profile__section">
      <div class="set-profile__head">
        <h3 class="set-profile__title">Seu nome</h3>
        <p class="set-profile__subtitle">
          Esse nome aparece no app e na sidebar.
        </p>
      </div>
      <UForm
        :schema="nameSchema"
        :state="nameState"
        class="set-profile__form set-profile__form--inline"
        @submit="onSubmitName"
      >
        <UFormField name="name" class="set-profile__field">
          <UInput
            v-model="nameState.name"
            size="lg"
            placeholder="Seu nome"
            class="set-profile__input"
            variant="none"
            :ui="{ base: 'set-input' }"
          />
        </UFormField>
        <button
          type="submit"
          class="set-btn set-btn--primary"
          :disabled="savingName"
        >
          <UIcon
            v-if="savingName"
            name="i-lucide-loader-2"
            class="size-4 motion-safe:animate-spin"
            aria-hidden="true"
          />
          <span>{{ savingName ? 'Salvando...' : 'Salvar nome' }}</span>
        </button>
      </UForm>
    </section>

    <div class="set-profile__divider" />

    <!-- Seção: Telefone -->
    <section class="set-profile__section">
      <div class="set-profile__head">
        <h3 class="set-profile__title">Telefone</h3>
        <p class="set-profile__subtitle">
          Usado para contato e acesso a recursos como carteira e chat. Opcional por enquanto.
        </p>
      </div>
      <UForm
        :schema="celularSchema"
        :state="celularState"
        class="set-profile__form set-profile__form--inline"
        @submit="onSubmitCelular"
      >
        <UFormField name="celular" class="set-profile__field">
          <UInput
            v-model="celularState.celular"
            v-maska="'+55 (##) # ####-####'"
            type="tel"
            autocomplete="tel"
            inputmode="tel"
            size="lg"
            placeholder="+55 (00) 0 0000-0000"
            class="set-profile__input"
            variant="none"
            :ui="{ base: 'set-input' }"
          />
        </UFormField>
        <button
          type="submit"
          class="set-btn set-btn--primary"
          :disabled="savingCelular"
        >
          <UIcon
            v-if="savingCelular"
            name="i-lucide-loader-2"
            class="size-4 motion-safe:animate-spin"
            aria-hidden="true"
          />
          <span>{{ savingCelular ? 'Salvando...' : 'Salvar telefone' }}</span>
        </button>
      </UForm>
    </section>

    <div class="set-profile__divider" />

    <!-- Seção: Senha -->
    <section class="set-profile__section">
      <div class="set-profile__head">
        <h3 class="set-profile__title">Alterar senha</h3>
        <p class="set-profile__subtitle">
          Use letras, números e maiúsculas/minúsculas. Mínimo 8 caracteres.
        </p>
      </div>
      <UForm
        :schema="passwordSchema"
        :state="passwordState"
        class="set-profile__form set-profile__form--stack"
        @submit="onSubmitPassword"
      >
        <UFormField name="current_password" label="Senha atual" :ui="{ label: 'set-label' }">
          <UInput
            v-model="passwordState.current_password"
            type="password"
            size="lg"
            placeholder="Digite sua senha atual"
            class="set-profile__input"
            variant="none"
            :ui="{ base: 'set-input' }"
          />
        </UFormField>

        <UFormField name="password" label="Nova senha" :ui="{ label: 'set-label' }">
          <UInput
            v-model="passwordState.password"
            :type="showNewPassword ? 'text' : 'password'"
            size="lg"
            placeholder="Nova senha"
            class="set-profile__input"
            variant="none"
            :ui="{ base: 'set-input' }"
            :aria-invalid="passwordRequirements.length > 0 && passwordScore < passwordRequirements.length"
          >
            <template #trailing>
              <button
                type="button"
                class="set-profile__eye"
                :aria-label="showNewPassword ? 'Ocultar senha' : 'Mostrar senha'"
                @click="showNewPassword = !showNewPassword"
              >
                <UIcon
                  :name="showNewPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  class="size-4"
                />
              </button>
            </template>
          </UInput>
        </UFormField>

        <p
          class="set-profile__hint"
          :class="passwordScore >= 1 ? 'set-profile__hint--ok' : ''"
          aria-live="polite"
        >
          <UIcon
            :name="passwordScore >= 1 ? 'i-lucide-circle-check' : 'i-lucide-circle'"
            class="size-3.5 shrink-0"
            aria-hidden="true"
          />
          <span>A senha deve ter pelo menos 8 caracteres</span>
        </p>

        <UFormField name="password_confirmation" label="Confirmar nova senha" :ui="{ label: 'set-label' }">
          <UInput
            v-model="passwordState.password_confirmation"
            type="password"
            size="lg"
            placeholder="Repita a nova senha"
            class="set-profile__input"
            variant="none"
            :ui="{ base: 'set-input' }"
          />
        </UFormField>

        <button
          type="submit"
          class="set-btn set-btn--primary set-profile__submit"
          :disabled="savingPassword || !canSubmitPassword"
        >
          <UIcon
            v-if="savingPassword"
            name="i-lucide-loader-2"
            class="size-4 motion-safe:animate-spin"
            aria-hidden="true"
          />
          <span>{{ savingPassword ? 'Alterando...' : 'Alterar senha' }}</span>
        </button>
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

const nameSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
})

const nameState = reactive({
  name: authStore.me?.name ?? '',
})

watch(
  () => authStore.me?.name,
  (name) => {
    if (name && !nameState.name) nameState.name = name
  },
  { immediate: true }
)

const celularSchema = z.object({
  celular: z.string().optional(),
})

const celularState = reactive({
  celular: authStore.me?.celular ?? '',
})

watch(
  () => authStore.me?.celular,
  (celular) => {
    if (celular && !celularState.celular) celularState.celular = celular
  },
  { immediate: true }
)

const passwordRequirements = [
  { regex: /.{8,}/, text: 'Pelo menos 8 caracteres' },
]

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

<style scoped>
.set-profile {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 22px 22px;
}

.set-profile__section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.set-profile__head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.set-profile__title {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--text-heading, var(--brand-text));
}

.set-profile__subtitle {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.set-profile__divider {
  height: 1px;
  background: color-mix(in srgb, var(--brand-border) 35%, transparent);
}

.set-profile__form--inline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 640px) {
  .set-profile__form--inline {
    flex-direction: row;
    align-items: flex-end;
    gap: 10px;
  }
}

.set-profile__form--stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 460px;
}

.set-profile__field {
  min-width: 0;
  flex: 1;
}

@media (min-width: 640px) {
  .set-profile__field {
    max-width: 320px;
  }
}

.set-profile__hint {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  line-height: 1.3;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  transition: color 180ms;
}

.set-profile__hint--ok {
  color: var(--brand-positive, #16a34a);
}

.set-profile__eye {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;
  background: transparent;
  border: 0;
  cursor: pointer;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  transition: color 150ms, background 150ms;
}

.set-profile__eye:hover {
  color: var(--brand-text);
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
}

.set-profile__submit {
  align-self: flex-start;
}

/* ============ INPUT (override UInput) ============ */
:deep(.set-input) {
  background: color-mix(in srgb, var(--brand-surface) 60%, var(--brand-background));
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  border-radius: 11px;
  color: var(--brand-text);
  font-family: var(--brand-font);
  font-size: 14px;
  padding: 11px 14px;
  width: 100%;
  transition: border-color 180ms, background 180ms, box-shadow 180ms;
}

:deep(.set-input::placeholder) {
  color: color-mix(in srgb, var(--brand-text) 40%, transparent);
}

:deep(.set-input:hover) {
  border-color: color-mix(in srgb, var(--brand-border) 75%, transparent);
}

:deep(.set-input:focus),
:deep(.set-input:focus-visible) {
  outline: none;
  border-color: color-mix(in srgb, var(--brand-primary) 55%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 15%, transparent);
  background: color-mix(in srgb, var(--brand-surface) 75%, var(--brand-background));
}

:deep(.set-label) {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
  margin-bottom: 6px;
}

/* ============ BUTTON ============ */
.set-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 11px 18px;
  border-radius: 11px;
  border: 0;
  font-family: var(--brand-font);
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  cursor: pointer;
  transition: filter 180ms, transform 120ms, box-shadow 180ms, opacity 180ms;
  flex-shrink: 0;
}

.set-btn--primary {
  background: var(--brand-primary);
  color: var(--text-on-primary, var(--brand-background, #fff));
  box-shadow: 0 8px 18px -10px color-mix(in srgb, var(--brand-primary) 60%, transparent);
}

.set-btn--primary:hover:not(:disabled) {
  filter: brightness(0.95);
  transform: translateY(-1px);
}

.set-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
