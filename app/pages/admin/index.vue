<template>
  <NuxtLayout name="admin-panel">
    <div class="mx-auto flex max-w-6xl flex-col gap-8">
      <header class="flex flex-col gap-2">
        <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
          Dashboard
        </span>
        <h1 class="text-[32px] leading-tight md:text-[40px]" :style="{ color: C.text, fontFamily: F.display }">
          Bem-vindo, {{ auth.me?.name?.split(' ')[0] || 'admin' }}.
        </h1>
        <p class="max-w-2xl text-[14px] leading-[1.6]" :style="{ color: C.textMuted }">
          Este é o painel privado da Redentia. Aqui você administra tenants white-label, configura automações sociais e monitora perfis de terceiros.
        </p>
      </header>

      <!-- Metrics grid -->
      <div class="grid gap-px overflow-hidden rounded-sm border md:grid-cols-2 lg:grid-cols-3" :style="{ borderColor: C.border, backgroundColor: C.border }">
        <NuxtLink
          v-for="card in cards"
          :key="card.to"
          :to="card.to"
          class="flex flex-col gap-2 p-5 transition-colors hover:brightness-110"
          :style="{ backgroundColor: C.surface }"
        >
          <div class="flex items-center justify-between">
            <UIcon :name="card.icon" class="size-5" :style="{ color: C.primary }" />
            <UIcon name="i-lucide-arrow-up-right" class="size-4" :style="{ color: C.textMuted }" />
          </div>
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
            {{ card.label }}
          </span>
          <span class="text-[24px] font-semibold leading-none tracking-tight" :style="{ color: C.text }">
            <UIcon v-if="loading" name="i-lucide-loader-2" class="size-5 motion-safe:animate-spin" />
            <template v-else>{{ card.value }}</template>
          </span>
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
            {{ card.sub }}
          </span>
        </NuxtLink>
      </div>

      <!-- Quick actions -->
      <section class="grid gap-6 md:grid-cols-2">
        <NuxtLink
          to="/admin/tenants/new"
          class="flex flex-col gap-2 rounded-sm border p-5 transition-colors hover:brightness-110"
          :style="{ borderColor: C.border, backgroundColor: C.surface }"
        >
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">Ação rápida</span>
          <span class="text-[18px] font-semibold" :style="{ color: C.text }">Criar novo tenant</span>
          <span class="text-[13px]" :style="{ color: C.textMuted }">
            Clone do Redentia ou tenant em branco. Depois de criar, compartilhe
            o slug para o cliente acessar em <code>redentia.com.br/?brand={slug}</code>.
          </span>
        </NuxtLink>
        <a
          :href="postizUrl"
          target="_blank"
          rel="noopener"
          class="flex flex-col gap-2 rounded-sm border p-5 transition-colors hover:brightness-110"
          :style="{ borderColor: C.border, backgroundColor: C.surface }"
        >
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">Ação rápida</span>
          <span class="text-[18px] font-semibold" :style="{ color: C.text }">Abrir Postiz console</span>
          <span class="text-[13px]" :style="{ color: C.textMuted }">
            Conectar contas sociais (Instagram, Facebook, Threads, X) e compor posts avulsos.
          </span>
        </a>
      </section>

      <!-- Status snapshot -->
      <section class="rounded-sm border p-5" :style="{ borderColor: C.border, backgroundColor: C.surface }">
        <h2 class="mb-3 font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
          Sistema
        </h2>
        <dl class="grid gap-2 text-[13px] md:grid-cols-2">
          <div class="flex items-center justify-between border-b pb-2" :style="{ borderColor: C.border }">
            <dt :style="{ color: C.textMuted }">Postiz console</dt>
            <dd :style="{ color: C.text }">postiz.saraivada.com</dd>
          </div>
          <div class="flex items-center justify-between border-b pb-2" :style="{ borderColor: C.border }">
            <dt :style="{ color: C.textMuted }">Integração Postiz</dt>
            <dd :style="{ color: C.textMuted }">stub · configure POSTIZ_API_KEY no .env</dd>
          </div>
          <div class="flex items-center justify-between border-b pb-2" :style="{ borderColor: C.border }">
            <dt :style="{ color: C.textMuted }">Worker auto-reply ticker</dt>
            <dd :style="{ color: C.textMuted }">não implementado</dd>
          </div>
          <div class="flex items-center justify-between pb-2">
            <dt :style="{ color: C.textMuted }">Worker profile watcher</dt>
            <dd :style="{ color: C.textMuted }">não implementado</dd>
          </div>
        </dl>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS as C, REDENTIA_FONTS as F } from '~/utils/redentiaCreativeColors'

definePageMeta({
  middleware: ['admin-panel'],
})

const auth = useAuthStore()
const tenantsService = useTenantsService()
const autService = useSocialAutomationsService()
const profilesService = useMonitoredProfilesService()
const usersService = useAdminUsersService()
const leadsService = useLeadsService()
const reportsService = useReportsService()

const postizUrl = computed(() => {
  if (import.meta.server) return 'https://postiz.saraivada.com'
  return window.location.hostname.includes('localhost') ? 'http://localhost:4007' : 'https://postiz.saraivada.com'
})

const loading = ref(true)
const tenantsCount = ref(0)
const automationsActive = ref(0)
const automationsTotal = ref(0)
const profilesCount = ref(0)
const profilesEnabled = ref(0)
const usersTotal = ref(0)
const usersPending = ref(0)
const leadsTotal = ref(0)
const leadsLast7d = ref(0)
const reportsTotal = ref(0)
const reportsOpen = ref(0)

onMounted(async () => {
  try {
    const [tenants, automations, profiles, userStats, leadStats, reportStats] = await Promise.all([
      tenantsService.list().catch(() => ({ data: [] } as any)),
      autService.list().catch(() => []),
      profilesService.list().catch(() => []),
      usersService.stats().catch(() => null),
      leadsService.stats().catch(() => null),
      reportsService.stats().catch(() => null),
    ])
    // tenants returns paginated wrapper or list depending on backend
    const tenantsArr = Array.isArray(tenants) ? tenants : ((tenants as any)?.data || [])
    tenantsCount.value = tenantsArr.length
    automationsTotal.value = automations.length
    automationsActive.value = automations.filter(a => a.enabled).length
    profilesCount.value = profiles.length
    profilesEnabled.value = profiles.filter(p => p.enabled).length
    if (userStats) {
      usersTotal.value = userStats.total
      usersPending.value = userStats.pendingApproval
    }
    if (leadStats) {
      leadsTotal.value = leadStats.total
      leadsLast7d.value = leadStats.last_7d
    }
    if (reportStats) {
      reportsTotal.value = reportStats.total
      reportsOpen.value = reportStats.open
    }
  } finally {
    loading.value = false
  }
})

const cards = computed(() => [
  { to: '/admin/tenants', label: 'TENANTS', value: String(tenantsCount.value), sub: 'CADASTRADOS', icon: 'i-lucide-building-2' },
  {
    to: '/admin/users',
    label: 'USUÁRIOS',
    value: String(usersTotal.value),
    sub: usersPending.value > 0 ? `${usersPending.value} PENDENTES` : 'TOTAL',
    icon: 'i-lucide-users',
  },
  {
    to: '/admin/leads',
    label: 'LEADS',
    value: String(leadsTotal.value),
    sub: leadsLast7d.value > 0 ? `+${leadsLast7d.value} EM 7D` : 'TOTAL',
    icon: 'i-lucide-magnet',
  },
  {
    to: '/admin/reports',
    label: 'REPORTS',
    value: String(reportsTotal.value),
    sub: reportsOpen.value > 0 ? `${reportsOpen.value} ABERTOS` : 'TOTAL',
    icon: 'i-lucide-life-buoy',
  },
  { to: '/admin/social/automations', label: 'AUTOMAÇÕES', value: `${automationsActive.value}/${automationsTotal.value}`, sub: 'ATIVAS/TOTAL', icon: 'i-lucide-zap' },
  { to: '/admin/social/monitored-profiles', label: 'PERFIS MONITORADOS', value: `${profilesEnabled.value}/${profilesCount.value}`, sub: 'ATIVOS/TOTAL', icon: 'i-lucide-eye' },
  { to: '/admin/data-health', label: 'DATA HEALTH', value: '↗', sub: 'SCRAPE · NEWS · TESOURO', icon: 'i-lucide-activity' },
])
</script>

<style scoped>
.font-mono-tab { font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace; font-feature-settings: 'tnum' 1; }
</style>
