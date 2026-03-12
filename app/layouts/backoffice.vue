<template>
  <!-- Mobile bottom bar -->
  <div
    class="fixed bottom-0 left-0 right-0 z-20 flex w-full items-center justify-center gap-3 border-t px-4 py-4 backdrop-blur-2xl xl:hidden"
    :style="{ background: brand.colors.background, borderColor: brand.colors.border, color: brand.colors.text }"
  >
    <NuxtLink
      to="/backoffice"
      exact-active-class="border-secondary/60 bg-secondary/10"
      class="flex h-12 w-12 items-center justify-center rounded-full border transition"
      :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.text }"
    >
      <UIcon name="i-lucide-layout-dashboard" class="text-secondary size-5" />
    </NuxtLink>
    <NuxtLink
      to="/backoffice/tenants"
      active-class="border-secondary/60 bg-secondary/10"
      class="flex h-12 w-12 items-center justify-center rounded-full border transition"
      :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.text }"
    >
      <UIcon name="i-lucide-building-2" class="text-secondary size-5" />
    </NuxtLink>
    <NuxtLink
      to="/"
      class="flex h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-medium transition"
      :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.text }"
    >
      <UIcon name="i-lucide-arrow-left" class="size-4" />
      Voltar ao app
    </NuxtLink>
  </div>

  <!-- Layout -->
  <div class="flex min-h-screen w-full" :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }">
    <!-- Sidebar Desktop -->
    <aside class="sticky top-0 flex h-screen w-[320px] min-w-[320px] flex-col gap-6 p-4 max-xl:hidden">
      <!-- Admin Profile Card -->
      <div class="brand-card border p-4" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
        <div class="flex items-center gap-3">
          <div class="relative">
            <UAvatar :alt="authStore.me?.name || 'Admin'" size="lg" class="ring-2 ring-secondary/30" />
            <div class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 bg-green-500" :style="{ borderColor: brand.colors.background }" />
          </div>
          <div class="flex flex-1 flex-col">
            <span class="font-medium" :style="{ color: brand.colors.text }">
              {{ authStore.me?.name || 'Admin' }}
            </span>
            <span class="flex items-center gap-1 text-xs" :style="{ color: brand.colors.textMuted }">
              <UIcon name="i-lucide-shield" class="h-3 w-3 text-secondary" />
              Administrador
            </span>
          </div>
        </div>
        <div class="mt-4 flex items-center gap-2 border-t pt-4" :style="{ borderColor: brand.colors.border }">
          <NuxtLink
            to="/"
            class="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs transition"
            :style="{ backgroundColor: brand.colors.surface, color: brand.colors.textMuted }"
          >
            <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
            Voltar ao app
          </NuxtLink>
          <button
            class="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs transition hover:bg-red-500/10 hover:text-red-400"
            :style="{ backgroundColor: brand.colors.surface, color: brand.colors.textMuted }"
            @click="handleLogout"
          >
            <UIcon name="i-lucide-log-out" class="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex flex-1 flex-col gap-1">
        <span class="mb-2 px-4 text-[10px] font-medium uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">Backoffice</span>
        <AtomsSidebarButton to="/backoffice" text="Dashboard" icon="i-lucide-layout-dashboard" />
        <AtomsSidebarButton to="/backoffice/tenants" text="Tenants" icon="i-lucide-building-2" />
      </nav>

      <!-- Brand info -->
      <div
        class="brand-card border border-secondary/20 bg-gradient-to-br from-secondary/10 to-transparent p-4"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20">
            <UIcon name="i-lucide-palette" class="h-5 w-5 text-secondary" />
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-secondary">Gerenciar marcas</span>
            <span class="text-xs" :style="{ color: brand.colors.textMuted }">White-label configs</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div
      class="relative flex w-full flex-col overflow-hidden xl:px-4 xl:py-4"
      :style="{ backgroundColor: brand.colors.background }"
    >
      <!-- Header -->
      <header
        class="sticky top-0 z-20 flex min-h-[60px] w-full items-center justify-between gap-4 px-6 py-4 backdrop-blur-xl xl:top-4 xl:rounded-[25px]"
        :style="{ background: brand.colors.surface }"
      >
        <div class="flex items-center gap-5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/20">
            <UIcon name="i-lucide-shield" class="h-5 w-5 text-secondary" />
          </div>
          <div class="flex flex-col">
            <span
              class="text-[14px] uppercase tracking-[0.25em]"
              :style="{ color: brand.colors.textMuted }"
            >
              Redentia
            </span>
            <span
              class="-mt-2 text-[14px] font-semibold tracking-[0.05em]"
              :style="{ color: brand.colors.text }"
            >
              Backoffice
            </span>
          </div>
        </div>
      </header>

      <!-- Content -->
      <div class="flex-1 px-6 py-6">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const brand = useBrand()
const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await authStore.logout()
  router.push('/auth/login')
}
</script>
