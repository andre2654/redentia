<template>
  <div class="flex flex-col gap-6 p-6">
    <div>
      <h3 class="text-base font-semibold text-white">
        Vincular a um assessor
      </h3>
      <p class="mt-1 text-xs text-white/50">
        Se você tem o código do seu assessor, informe abaixo para enviar uma solicitação de vínculo. Ele precisará aprovar na área do assessor.
      </p>
    </div>

    <template v-if="authStore.me?.approval_status === 'pending'">
      <div class="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        Aguardando aprovação do assessor
        <span v-if="authStore.me?.advisor?.name">({{ authStore.me.advisor.name }})</span>.
      </div>
    </template>
    <template v-else-if="authStore.me?.approval_status === 'approved' && authStore.me?.advisor">
      <div class="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
        Você está vinculado ao assessor <strong>{{ authStore.me.advisor.name }}</strong>.
      </div>
    </template>
    <template v-else-if="authStore.me?.approval_status === 'rejected'">
      <div class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        Seu vínculo foi recusado. Você pode tentar outro código ou falar com a assessoria com IA.
      </div>
    </template>

    <UForm
      :state="state"
      class="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3"
      @submit="onSubmit"
    >
      <UFormField name="advisor_code" label="Código do assessor" class="min-w-0 flex-1 sm:max-w-xs">
        <UInput
          v-model="state.advisor_code"
          size="lg"
          placeholder="Ex.: ABC123"
          class="w-full"
          :ui="{ base: 'rounded-xl border-white/10 bg-white/5' }"
          :disabled="loading"
        />
      </UFormField>
      <UButton
        type="submit"
        color="primary"
        size="lg"
        :loading="loading"
        class="rounded-xl shrink-0"
      >
        {{ authStore.me?.advisor_id ? 'Alterar assessor' : 'Vincular' }}
      </UButton>
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
