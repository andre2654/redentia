<template>
  <NuxtLayout name="default" title="Backoffice">
    <div class="p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl" :class="[brand.font.headingWeight]" :style="{ color: brand.colors.text }">Dashboard</h1>
        <p class="mt-1 text-sm" :style="{ color: brand.colors.textMuted }">Painel administrativo Redentia</p>
      </div>

      <!-- Loading -->
      <div v-if="statsLoading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="i in 4" :key="i" class="brand-card animate-pulse border p-5" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <div class="h-4 w-20 rounded" :style="{ backgroundColor: brand.colors.surfaceHover }" />
          <div class="mt-4 h-8 w-12 rounded" :style="{ backgroundColor: brand.colors.surfaceHover }" />
          <div class="mt-2 h-3 w-24 rounded" :style="{ backgroundColor: brand.colors.surfaceHover }" />
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="stats.total === 0 && !statsError" class="flex flex-col items-center justify-center rounded-2xl border py-16 text-center" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10">
          <UIcon name="i-lucide-building-2" class="size-8 text-secondary" />
        </div>
        <p class="mt-5 font-medium" :style="{ color: brand.colors.text }">Nenhum tenant cadastrado</p>
        <p class="mt-1 text-sm" :style="{ color: brand.colors.textMuted }">Crie seu primeiro tenant para comecar a usar a plataforma</p>
        <NuxtLink
          to="/backoffice/tenants/create"
          class="mt-5 flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          <UIcon name="i-lucide-plus" class="size-4" />
          Criar primeiro tenant
        </NuxtLink>
      </div>

      <!-- Error state -->
      <div v-else-if="statsError" class="flex flex-col items-center justify-center rounded-2xl border py-12 text-center" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
        <UIcon name="i-lucide-wifi-off" class="size-8" :style="{ color: brand.colors.textMuted }" />
        <p class="mt-4 text-sm" :style="{ color: brand.colors.textMuted }">Falha ao carregar estatisticas</p>
        <button
          class="mt-3 flex items-center gap-2 rounded-lg bg-secondary/10 px-4 py-2 text-sm text-secondary transition hover:bg-secondary/20"
          @click="fetchStats"
        >
          <UIcon name="i-lucide-refresh-cw" class="size-3.5" />
          Tentar novamente
        </button>
      </div>

      <!-- Stats -->
      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="brand-card border p-5" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">Tenants</span>
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10">
              <UIcon name="i-lucide-building-2" class="size-4 text-secondary" />
            </div>
          </div>
          <p class="mt-3 text-2xl font-bold" :style="{ color: brand.colors.text }">{{ stats.total }}</p>
          <p class="mt-1 text-xs" :style="{ color: brand.colors.textMuted }">{{ stats.active }} ativos</p>
        </div>

        <div class="brand-card border p-5" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">Ativos</span>
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10">
              <UIcon name="i-lucide-check-circle" class="size-4 text-secondary" />
            </div>
          </div>
          <p class="mt-3 text-2xl font-bold text-secondary">{{ stats.active }}</p>
          <p class="mt-1 text-xs" :style="{ color: brand.colors.textMuted }">marcas publicadas</p>
        </div>

        <div class="brand-card border p-5" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">Inativos</span>
            <div class="flex h-8 w-8 items-center justify-center rounded-lg" :style="{ backgroundColor: brand.colors.surfaceHover }">
              <UIcon name="i-lucide-pause-circle" class="size-4" :style="{ color: brand.colors.textMuted }" />
            </div>
          </div>
          <p class="mt-3 text-2xl font-bold" :style="{ color: brand.colors.textMuted }">{{ stats.inactive }}</p>
          <p class="mt-1 text-xs" :style="{ color: brand.colors.textMuted }">marcas pausadas</p>
        </div>

        <div class="brand-card border p-5" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">Dominios</span>
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10">
              <UIcon name="i-lucide-globe" class="size-4 text-secondary" />
            </div>
          </div>
          <p class="mt-3 text-2xl font-bold" :style="{ color: brand.colors.text }">{{ stats.withDomain }}</p>
          <p class="mt-1 text-xs" :style="{ color: brand.colors.textMuted }">com dominio proprio</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <h2 class="mb-4 mt-10 text-sm font-medium uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">Acesso rapido</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          to="/backoffice/tenants"
          class="group brand-card flex items-center gap-4 border p-5 transition hover:opacity-90"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
            <UIcon name="i-lucide-building-2" class="size-5 text-secondary" />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="font-semibold" :style="{ color: brand.colors.text }">Gerenciar Tenants</h3>
            <p class="mt-0.5 text-sm" :style="{ color: brand.colors.textMuted }">Listar, editar e criar marcas</p>
          </div>
          <UIcon name="i-lucide-chevron-right" class="size-4 transition-transform group-hover:translate-x-0.5" :style="{ color: brand.colors.textMuted }" />
        </NuxtLink>

        <NuxtLink
          to="/backoffice/tenants/create"
          class="group brand-card flex items-center gap-4 border p-5 transition hover:opacity-90"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
            <UIcon name="i-lucide-plus-circle" class="size-5 text-secondary" />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="font-semibold" :style="{ color: brand.colors.text }">Novo Tenant</h3>
            <p class="mt-0.5 text-sm" :style="{ color: brand.colors.textMuted }">Criar nova marca white-label</p>
          </div>
          <UIcon name="i-lucide-chevron-right" class="size-4 transition-transform group-hover:translate-x-0.5" :style="{ color: brand.colors.textMuted }" />
        </NuxtLink>

        <NuxtLink
          to="/backoffice/templates"
          class="group brand-card flex items-center gap-4 border p-5 transition hover:opacity-90"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
            <UIcon name="i-lucide-image" class="size-5 text-secondary" />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="font-semibold" :style="{ color: brand.colors.text }">Templates Instagram</h3>
            <p class="mt-0.5 text-sm" :style="{ color: brand.colors.textMuted }">Gerar imagens por tenant</p>
          </div>
          <UIcon name="i-lucide-chevron-right" class="size-4 transition-transform group-hover:translate-x-0.5" :style="{ color: brand.colors.textMuted }" />
        </NuxtLink>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { ITenant } from '~/types/tenant'

definePageMeta({
  middleware: ['admin'],
})

const brand = useBrand()
const tenantsService = useTenantsService()

const statsLoading = ref(true)
const statsError = ref(false)
const stats = reactive({
  total: 0,
  active: 0,
  inactive: 0,
  withDomain: 0,
})

async function fetchStats() {
  statsLoading.value = true
  statsError.value = false
  try {
    const res = (await tenantsService.list()) as any
    const tenants: ITenant[] = res?.data ?? []
    stats.total = tenants.length
    stats.active = tenants.filter(t => t.is_active).length
    stats.inactive = tenants.filter(t => !t.is_active).length
    stats.withDomain = tenants.filter(t => t.domain).length
  } catch {
    statsError.value = true
  } finally {
    statsLoading.value = false
  }
}

onMounted(() => fetchStats())
</script>
