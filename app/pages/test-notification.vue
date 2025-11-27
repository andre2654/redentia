<template>
  <NuxtLayout title="Debug Notificações">
    <div class="flex h-full flex-col items-center justify-center gap-6 p-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold">Teste de Notificações</h1>
        <p class="text-sm opacity-70">
          Teste tanto a notificação local (app aberto) quanto a Push (app fechado).
        </p>
      </div>

      <div class="flex flex-col gap-4 w-full max-w-md">
        <!-- Local Notification -->
        <div class="rounded-lg bg-white/5 p-4 flex flex-col gap-3">
          <h3 class="font-bold">1. Notificação Local (App Aberto)</h3>
          <p class="text-xs opacity-60">Usa useWebNotification. Só funciona com app aberto.</p>
          <UButton
            block
            :loading="loadingLocal"
            color="primary"
            variant="soft"
            icon="i-heroicons-bell"
            label="Disparar Local Agora"
            @click="handleTriggerLocal"
          />
        </div>

        <!-- Push Notification -->
        <div class="rounded-lg bg-white/5 p-4 flex flex-col gap-3">
          <h3 class="font-bold">2. Push Notification (App Fechado)</h3>
          <p class="text-xs opacity-60">Usa Service Worker + Backend. Funciona em background.</p>
          
          <div v-if="!isSubscribed" class="flex flex-col gap-2">
            <UButton
              block
              :loading="loadingSubscribe"
              color="green"
              label="Inscrever no Push"
              @click="handleSubscribe"
            />
          </div>
          <div v-else class="flex items-center justify-center gap-2 text-green-400 text-sm py-2">
            <UIcon name="i-heroicons-check-circle" class="h-5 w-5" />
            <span>Inscrito no Push</span>
          </div>

          <UButton
            block
            :loading="loadingPush"
            color="orange"
            variant="soft"
            icon="i-heroicons-paper-airplane"
            label="Disparar Push via Backend"
            @click="handleTriggerPush"
            :disabled="!isSubscribed"
          />
        </div>

        <!-- Results -->
        <div v-if="result" class="rounded-lg bg-white/10 p-4 text-sm overflow-auto max-h-40">
          <div class="font-bold mb-2">Último Resultado:</div>
          <pre>{{ JSON.stringify(result, null, 2) }}</pre>
        </div>

        <div v-if="!isSupported" class="text-red-400 text-sm text-center">
          ⚠️ Seu navegador não suporta Web Notifications ou elas estão bloqueadas.
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { triggerDailySummary, isSupported } = useDailyNotification()
const { isSubscribed, subscribe } = useNotifications()

const loadingLocal = ref(false)
const loadingSubscribe = ref(false)
const loadingPush = ref(false)
const result = ref<any>(null)

async function handleTriggerLocal() {
  loadingLocal.value = true
  if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }
  result.value = await triggerDailySummary()
  loadingLocal.value = false
}

async function handleSubscribe() {
  loadingSubscribe.value = true
  const success = await subscribe()
  result.value = { action: 'subscribe', success }
  loadingSubscribe.value = false
}

async function handleTriggerPush() {
  loadingPush.value = true
  try {
    const res = await $fetch('/api/notifications/trigger-daily')
    result.value = res
  } catch (e) {
    result.value = { error: e }
  }
  loadingPush.value = false
}
</script>
