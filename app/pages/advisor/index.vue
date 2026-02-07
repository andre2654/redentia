<template>
  <NuxtLayout title="Área do assessor">
    <div class="flex h-full flex-col gap-6 p-6">
      <div class="flex flex-col gap-2">
        <h2 class="text-[18px] font-bold">Meus assessorados</h2>
        <p class="text-[13px] text-white/70">
          Aprove ou recuse investidores que informaram seu código. Acompanhe os aprovados aqui.
        </p>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-2">
        <UButton
          :color="filterStatus === null ? 'primary' : 'neutral'"
          variant="soft"
          size="sm"
          label="Todos"
          @click="filterStatus = null"
        />
        <UButton
          :color="filterStatus === 'pending' ? 'primary' : 'neutral'"
          variant="soft"
          size="sm"
          label="Pendentes"
          @click="filterStatus = 'pending'"
        />
        <UButton
          :color="filterStatus === 'approved' ? 'primary' : 'neutral'"
          variant="soft"
          size="sm"
          label="Aprovados"
          @click="filterStatus = 'approved'"
        />
        <UButton
          :color="filterStatus === 'rejected' ? 'primary' : 'neutral'"
          variant="soft"
          size="sm"
          label="Recusados"
          @click="filterStatus = 'rejected'"
        />
      </div>

      <!-- Lista -->
      <div v-if="loading" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="h-8 w-8 animate-spin text-secondary" />
      </div>
      <div v-else-if="error" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        {{ error }}
      </div>
      <div v-else-if="!investors.length" class="rounded-xl border border-white/10 bg-white/5 px-6 py-12 text-center text-white/60">
        Nenhum investidor encontrado com esse filtro. Compartilhe seu código para receber solicitações.
      </div>
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="inv in investors"
          :key="inv.id"
          class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <NuxtLink :to="`/advisor/investors/${inv.id}`" class="flex min-w-0 flex-1 flex-col gap-1">
            <span class="font-medium text-white">{{ inv.name }}</span>
            <span class="text-xs text-white/50">{{ inv.email }}</span>
            <span v-if="inv.last_contact_at" class="text-[11px] text-white/40">
              Último contato: {{ formatDate(inv.last_contact_at) }}
            </span>
            <span v-else class="text-[11px] text-amber-400/80">Nunca houve contato</span>
            <span
              class="mt-1 inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-medium uppercase"
              :class="{
                'bg-amber-500/20 text-amber-300': inv.approval_status === 'pending',
                'bg-primary/20 text-primary': inv.approval_status === 'approved',
                'bg-red-500/20 text-red-300': inv.approval_status === 'rejected',
              }"
            >
              {{ inv.approval_status === 'pending' ? 'Pendente' : inv.approval_status === 'approved' ? 'Aprovado' : 'Recusado' }}
            </span>
          </NuxtLink>
          <div v-if="inv.approval_status === 'pending'" class="flex gap-2">
            <UButton
              color="primary"
              size="sm"
              label="Aprovar"
              :loading="actionId === Number(inv.id)"
              @click="approve(Number(inv.id))"
            />
            <UButton
              color="error"
              variant="soft"
              size="sm"
              label="Recusar"
              :loading="actionId === Number(inv.id)"
              @click="reject(Number(inv.id))"
            />
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const { getInvestors, approveInvestor, rejectInvestor } = useAdvisorService()

const filterStatus = ref<'pending' | 'approved' | 'rejected' | null>(null)
const investors = ref<Array<{ id: string | number; name: string; email: string; approval_status?: string | null; last_contact_at?: string | null }>>([])
const loading = ref(true)
const error = ref('')
const actionId = ref<number | null>(null)

watch(
  [filterStatus, () => authStore.me?.role],
  async () => {
    if (authStore.me?.role !== 'advisor') return
    loading.value = true
    error.value = ''
    try {
      const resp = await getInvestors(filterStatus.value ?? undefined)
      investors.value = resp.investors ?? []
    } catch (e: any) {
      error.value = e?.data?.message ?? 'Erro ao carregar investidores.'
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)

async function approve(id: number) {
  actionId.value = id
  try {
    await approveInvestor(id)
    showSuccessNotification('Aprovado', 'Investidor aprovado com sucesso.')
    const resp = await getInvestors(filterStatus.value ?? undefined)
    investors.value = resp.investors ?? []
  } catch (e: any) {
    showErrorNotification('Erro', e?.data?.message ?? 'Não foi possível aprovar.')
  } finally {
    actionId.value = null
  }
}

async function reject(id: number) {
  actionId.value = id
  try {
    await rejectInvestor(id)
    showSuccessNotification('Recusado', 'Vínculo recusado.')
    const resp = await getInvestors(filterStatus.value ?? undefined)
    investors.value = resp.investors ?? []
  } catch (e: any) {
    showErrorNotification('Erro', e?.data?.message ?? 'Não foi possível recusar.')
  } finally {
    actionId.value = null
  }
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  if (authStore.me?.role !== 'advisor') {
    navigateTo('/settings')
  }
})
</script>
