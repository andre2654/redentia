<template>
  <div class="set-become">
    <div class="set-become__head">
      <h3 class="set-become__title">
        {{ isAdvisor ? 'Seu código de assessor' : 'Tornar-me assessor' }}
      </h3>
      <p class="set-become__subtitle">
        {{ isAdvisor
          ? 'Compartilhe este código com investidores para que eles possam vincular a você. Aprove ou recuse os vínculos na área do assessor.'
          : 'Você passará a ter um código para compartilhar com investidores e poderá aprová-los e acompanhá-los na área do assessor.'
        }}
      </p>
    </div>

    <!-- Já é advisor: mostra código + acessar área -->
    <div v-if="isAdvisor && displayCode" class="set-become__code-row">
      <span class="set-become__code">
        {{ displayCode }}
      </span>
      <button
        type="button"
        class="set-btn set-btn--ghost"
        @click="copyCode"
      >
        <UIcon
          :name="copied ? 'i-lucide-check' : 'i-lucide-copy'"
          class="size-4"
          aria-hidden="true"
        />
        <span>{{ copied ? 'Copiado!' : 'Copiar código' }}</span>
      </button>
      <NuxtLink to="/advisor" class="set-btn set-btn--primary">
        <UIcon name="i-lucide-layout-dashboard" class="size-4" aria-hidden="true" />
        <span>Acessar área do assessor</span>
      </NuxtLink>
    </div>

    <!-- Investor: prompt to become advisor -->
    <div v-else-if="!isAdvisor && !successCode" class="set-become__cta">
      <p class="set-become__warning">
        Esta ação não pode ser desfeita. Você passará a atuar como assessor e poderá receber investidores vinculados ao seu código.
      </p>
      <button
        type="button"
        class="set-btn set-btn--primary"
        :disabled="loading"
        @click="onBecomeAdvisor"
      >
        <UIcon
          v-if="loading"
          name="i-lucide-loader-2"
          class="size-4 motion-safe:animate-spin"
          aria-hidden="true"
        />
        <UIcon
          v-else
          name="i-lucide-user-cog"
          class="size-4"
          aria-hidden="true"
        />
        <span>{{ loading ? 'Processando...' : 'Tornar-me assessor' }}</span>
      </button>
    </div>

    <!-- Sucesso recém-virou assessor -->
    <div v-else-if="successCode" class="set-become__success">
      <p class="set-become__success-text">
        <UIcon name="i-lucide-check-circle-2" class="size-4 shrink-0" aria-hidden="true" />
        <span>Agora você é um assessor.</span>
      </p>
      <div class="set-become__code-row">
        <span class="set-become__code">{{ successCode }}</span>
        <button
          type="button"
          class="set-btn set-btn--ghost"
          @click="copyCodeSuccess"
        >
          <UIcon
            :name="copied ? 'i-lucide-check' : 'i-lucide-copy'"
            class="size-4"
            aria-hidden="true"
          />
          <span>{{ copied ? 'Copiado!' : 'Copiar código' }}</span>
        </button>
        <NuxtLink to="/advisor" class="set-btn set-btn--primary">
          <UIcon name="i-lucide-layout-dashboard" class="size-4" aria-hidden="true" />
          <span>Acessar área do assessor</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const { becomeAdvisor } = useAuthService()

const loading = ref(false)
const copied = ref(false)
const successCode = ref<string | null>(null)

const isAdvisor = computed(() => authStore.me?.role === 'advisor')
const displayCode = computed(() => authStore.me?.advisor_code ?? null)

async function onBecomeAdvisor() {
  loading.value = true
  try {
    const resp = await becomeAdvisor() as { advisor_code?: string }
    successCode.value = resp?.advisor_code ?? null
    await authStore.fetchProfile()
    if (successCode.value) {
      showSuccessNotification('Agora você é um assessor', 'Seu código: ' + successCode.value)
    }
  } catch (e: any) {
    const msg = e?.data?.message ?? (e instanceof Error ? e.message : 'Não foi possível tornar-se assessor.')
    showErrorNotification('Erro', msg)
  } finally {
    loading.value = false
  }
}

function copyCode() {
  const code = displayCode.value
  if (code && typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(code)
    copied.value = true
    showSuccessNotification('Código copiado', code)
    setTimeout(() => { copied.value = false }, 2000)
  }
}

function copyCodeSuccess() {
  const code = successCode.value
  if (code && typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(code)
    copied.value = true
    showSuccessNotification('Código copiado', code)
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<style scoped>
.set-become {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px 22px;
}

.set-become__head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.set-become__title {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--text-heading, var(--brand-text));
}

.set-become__subtitle {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.set-become__cta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.set-become__warning {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}

.set-become__success {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.set-become__success-text {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--brand-positive, #16a34a);
}

.set-become__code-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.set-become__code {
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 11px;
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent);
  color: var(--brand-primary);
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.05em;
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
  text-decoration: none;
  transition: filter 180ms, transform 120ms, box-shadow 180ms, background 180ms, border-color 180ms, opacity 180ms;
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

.set-btn--ghost {
  background: transparent;
  color: var(--brand-text);
  border: 1px solid color-mix(in srgb, var(--brand-border) 60%, transparent);
}

.set-btn--ghost:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 6%, transparent);
}
</style>
