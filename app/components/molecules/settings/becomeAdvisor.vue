<template>
  <div class="flex flex-col gap-6 p-6">
    <div>
      <h3 class="text-base font-semibold text-white">
        {{ isAdvisor ? 'Seu código de assessor' : 'Tornar-me assessor' }}
      </h3>
      <p class="mt-1 text-xs text-white/50">
        {{ isAdvisor ? 'Compartilhe este código com investidores para que eles possam vincular a você. Aprove ou recuse os vínculos na área do assessor.' : 'Você passará a ter um código para compartilhar com investidores e poderá aprová-los e acompanhá-los na área do assessor.' }}
      </p>
    </div>

    <template v-if="isAdvisor && displayCode">
      <div class="flex flex-wrap items-center gap-3">
        <span class="rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 font-mono text-lg font-semibold text-secondary">
          {{ displayCode }}
        </span>
        <UButton
          color="secondary"
          variant="soft"
          size="lg"
          icon="i-lucide-copy"
          :label="copied ? 'Copiado!' : 'Copiar código'"
          @click="copyCode"
        />
        <NuxtLink to="/advisor">
          <UButton
            color="primary"
            variant="solid"
            size="lg"
            icon="i-lucide-layout-dashboard"
            label="Acessar área do assessor"
          />
        </NuxtLink>
      </div>
    </template>

    <template v-else-if="!isAdvisor && !successCode">
      <div class="flex flex-col gap-4">
        <p class="text-sm text-white/70">
          Esta ação não pode ser desfeita. Você passará a atuar como assessor e poderá receber investidores vinculados ao seu código.
        </p>
        <UButton
          color="primary"
          size="lg"
          :loading="loading"
          label="Tornar-me assessor"
          @click="onBecomeAdvisor"
        />
      </div>
    </template>

    <template v-else-if="successCode">
      <div class="flex flex-col gap-4">
        <p class="text-sm text-primary">Agora você é um assessor.</p>
        <div class="flex flex-wrap items-center gap-3">
          <span class="rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 font-mono text-lg font-semibold text-secondary">
            {{ successCode }}
          </span>
          <UButton
            color="secondary"
            variant="soft"
            size="lg"
            icon="i-lucide-copy"
            :label="copied ? 'Copiado!' : 'Copiar código'"
            @click="copyCodeSuccess"
          />
          <NuxtLink to="/advisor">
            <UButton
              color="primary"
              variant="solid"
              size="lg"
              icon="i-lucide-layout-dashboard"
              label="Acessar área do assessor"
            />
          </NuxtLink>
        </div>
      </div>
    </template>
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
