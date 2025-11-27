<template>
  <div class="flex flex-col gap-4 p-6">
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-1">
        <h3 class="text-[16px] font-semibold">Notificações</h3>
        <p class="text-[13px] opacity-60">
          Receba atualizações diárias sobre o mercado.
        </p>
      </div>
      <UButton
        v-if="!isSubscribed"
        :loading="loading"
        color="primary"
        variant="solid"
        label="Ativar Notificações"
        @click="handleSubscribe"
      />
      <div v-else class="flex items-center gap-2 text-green-400">
        <UIcon name="i-heroicons-check-circle" class="h-5 w-5" />
        <span class="text-sm font-medium">Ativado</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isSubscribed, subscribe } = useNotifications()
const loading = ref(false)

async function handleSubscribe() {
  loading.value = true
  await subscribe()
  loading.value = false
}
</script>
