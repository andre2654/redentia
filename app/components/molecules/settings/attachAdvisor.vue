<template>
  <div class="set-attach">
    <div class="set-attach__head">
      <h3 class="set-attach__title">
        Vincular a um assessor
      </h3>
      <p class="set-attach__subtitle">
        Se você tem o código do seu assessor, informe abaixo para enviar uma solicitação de vínculo. Ele precisará aprovar na área do assessor.
      </p>
    </div>

    <!-- Status banners -->
    <div
      v-if="authStore.me?.approval_status === 'pending'"
      class="set-attach__banner set-attach__banner--warning"
      role="status"
    >
      <UIcon name="i-lucide-clock" class="size-4 shrink-0" aria-hidden="true" />
      <span>
        Aguardando aprovação do assessor<template v-if="authStore.me?.advisor?.name"> ({{ authStore.me.advisor.name }})</template>.
      </span>
    </div>
    <div
      v-else-if="authStore.me?.approval_status === 'approved' && authStore.me?.advisor"
      class="set-attach__banner set-attach__banner--success"
      role="status"
    >
      <UIcon name="i-lucide-check-circle-2" class="size-4 shrink-0" aria-hidden="true" />
      <span>
        Você está vinculado ao assessor <strong>{{ authStore.me.advisor.name }}</strong>.
      </span>
    </div>
    <div
      v-else-if="authStore.me?.approval_status === 'rejected'"
      class="set-attach__banner set-attach__banner--danger"
      role="alert"
    >
      <UIcon name="i-lucide-x-circle" class="size-4 shrink-0" aria-hidden="true" />
      <span>
        Seu vínculo foi recusado. Você pode tentar outro código ou falar com a assessoria com IA.
      </span>
    </div>

    <UForm
      :state="state"
      class="set-attach__form"
      @submit="onSubmit"
    >
      <UFormField name="advisor_code" label="Código do assessor" :ui="{ label: 'set-label' }" class="set-attach__field">
        <UInput
          v-model="state.advisor_code"
          size="lg"
          placeholder="Ex.: ABC123"
          variant="none"
          :ui="{ base: 'set-input' }"
          :disabled="loading"
        />
      </UFormField>
      <button
        type="submit"
        class="set-btn set-btn--primary"
        :disabled="loading"
      >
        <UIcon
          v-if="loading"
          name="i-lucide-loader-2"
          class="size-4 motion-safe:animate-spin"
          aria-hidden="true"
        />
        <span>{{ loading ? 'Enviando...' : (authStore.me?.advisor_id ? 'Alterar assessor' : 'Vincular') }}</span>
      </button>
    </UForm>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const { attachAdvisor } = useInvestorService()

const loading = ref(false)
const state = reactive({ advisor_code: '' })

async function onSubmit() {
  const code = state.advisor_code?.trim()
  if (!code) {
    showErrorNotification('Código obrigatório', 'Informe o código do assessor.')
    return
  }
  loading.value = true
  try {
    const resp = await attachAdvisor(code)
    authStore.setMeFromUser(resp.user)
    await authStore.fetchProfile()
    showSuccessNotification('Solicitação enviada', resp.message)
    state.advisor_code = ''
  } catch (e: any) {
    const msg = e?.data?.message ?? (e instanceof Error ? e.message : 'Não foi possível vincular.')
    showErrorNotification('Erro', msg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.set-attach {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px 22px;
}

.set-attach__head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.set-attach__title {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--text-heading, var(--brand-text));
}

.set-attach__subtitle {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

/* ============ BANNERS ============ */
.set-attach__banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 11px;
  font-size: 13px;
  line-height: 1.45;
  border: 1px solid transparent;
}

.set-attach__banner--warning {
  background: color-mix(in srgb, #f59e0b 10%, transparent);
  border-color: color-mix(in srgb, #f59e0b 30%, transparent);
  color: color-mix(in srgb, #f59e0b 90%, var(--brand-text));
}

.set-attach__banner--success {
  background: color-mix(in srgb, var(--brand-positive, #16a34a) 10%, transparent);
  border-color: color-mix(in srgb, var(--brand-positive, #16a34a) 30%, transparent);
  color: color-mix(in srgb, var(--brand-positive, #16a34a) 90%, var(--brand-text));
}

.set-attach__banner--danger {
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 10%, transparent);
  border-color: color-mix(in srgb, var(--brand-negative, #dc2626) 30%, transparent);
  color: color-mix(in srgb, var(--brand-negative, #dc2626) 90%, var(--brand-text));
}

/* ============ FORM ============ */
.set-attach__form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 640px) {
  .set-attach__form {
    flex-direction: row;
    align-items: flex-end;
    gap: 10px;
  }
}

.set-attach__field {
  min-width: 0;
  flex: 1;
}

@media (min-width: 640px) {
  .set-attach__field {
    max-width: 320px;
  }
}

/* ============ INPUT ============ */
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

:deep(.set-input:disabled) {
  opacity: 0.55;
  cursor: not-allowed;
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
