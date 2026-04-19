<template>
  <div
    class="flex h-screen w-full overflow-hidden"
    :style="{ backgroundColor: C.background, color: C.text, fontFamily: F.body }"
  >
    <!-- Sidebar -->
    <aside
      class="flex h-full w-[280px] min-w-[280px] flex-col border-r p-5"
      :style="{ backgroundColor: C.surface, borderColor: C.border }"
    >
      <!-- Brand + admin tag -->
      <div class="mb-6 flex items-center gap-3">
        <div
          class="flex size-9 items-center justify-center rounded"
          :style="{ backgroundColor: C.primary, color: C.background }"
        >
          <UIcon name="i-lucide-shield" class="size-5" />
        </div>
        <div class="flex flex-col leading-tight">
          <span class="font-mono-tab text-[11px] font-bold uppercase tracking-[0.18em]" :style="{ color: C.text }">
            REDENT<span :style="{ color: C.primary }">.ADMIN</span>
          </span>
          <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
            PAINEL PRIVADO
          </span>
        </div>
      </div>

      <!-- User card -->
      <div
        v-if="auth.me"
        class="mb-6 flex items-center gap-3 rounded-sm border p-3"
        :style="{ borderColor: C.border, backgroundColor: C.surfaceHover }"
      >
        <UAvatar :alt="auth.me.name" size="sm" />
        <div class="flex flex-1 flex-col leading-tight">
          <span class="truncate text-[13px] font-semibold" :style="{ color: C.text }">
            {{ auth.me.name }}
          </span>
          <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: C.primary }">
            ADMIN
          </span>
        </div>
        <button
          type="button"
          class="rounded-sm p-1.5 transition-colors hover:bg-[var(--hover,rgba(255,255,255,0.06))]"
          :style="{ color: C.textMuted }"
          aria-label="Sair"
          @click="logout"
        >
          <UIcon name="i-lucide-log-out" class="size-4" />
        </button>
      </div>

      <!-- Nav -->
      <nav class="flex flex-col gap-1">
        <NuxtLink
          v-for="item in mainNav"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-sm border border-transparent px-3 py-2 text-[13px] transition-all"
          :style="navStyle(item.to, false)"
        >
          <UIcon :name="item.icon" class="size-4" />
          {{ item.label }}
        </NuxtLink>

        <div class="my-3 h-px" :style="{ backgroundColor: C.border }" />
        <span class="mb-1 px-3 font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
          SOCIAL
        </span>
        <NuxtLink
          v-for="item in socialNav"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-sm border border-transparent px-3 py-2 text-[13px] transition-all"
          :style="navStyle(item.to, item.exact)"
        >
          <UIcon :name="item.icon" class="size-4" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- Footer -->
      <div class="mt-auto flex flex-col gap-2 pt-4" :style="{ borderTopColor: C.border, borderTopWidth: '1px' }">
        <a
          :href="postizUrl"
          target="_blank"
          rel="noopener"
          class="flex items-center justify-between rounded-sm border px-3 py-2 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors hover:opacity-80"
          :style="{ borderColor: C.border, color: C.textMuted }"
        >
          <span class="inline-flex items-center gap-2">
            <UIcon name="i-lucide-external-link" class="size-3" :style="{ color: C.primary }" />
            POSTIZ CONSOLE
          </span>
          <UIcon name="i-lucide-arrow-up-right" class="size-3" />
        </a>
        <a
          :href="mainSiteHref"
          class="flex items-center gap-2 px-3 py-1 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors hover:opacity-80"
          :style="{ color: C.textMuted }"
        >
          <UIcon name="i-lucide-arrow-left" class="size-3" />
          VOLTAR PRO SITE
        </a>
      </div>
    </aside>

    <!-- Main area -->
    <main class="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header
        class="flex h-14 items-center justify-between border-b px-6 font-mono-tab text-[11px] uppercase tracking-[0.15em]"
        :style="{ borderColor: C.border, backgroundColor: `${C.surface}80`, color: C.textMuted }"
      >
        <span>{{ breadcrumb }}</span>
        <span :style="{ color: C.primary }">[PRIVATE · NOINDEX]</span>
      </header>
      <div class="min-h-0 flex-1 overflow-y-auto p-6">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS as C, REDENTIA_FONTS as F, REDENTIA_GOOGLE_FONT_HREF } from '~/utils/redentiaCreativeColors'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const mainSiteHref = useMainSiteHref()

// Computed Postiz console URL — respects env so localhost dev still works.
const postizUrl = computed(() => {
  if (import.meta.server) return 'https://postiz.saraivada.com'
  if (window.location.hostname.includes('localhost')) return 'http://localhost:4007'
  return 'https://postiz.saraivada.com'
})

const mainNav = [
  { to: '/admin', label: 'Dashboard', icon: 'i-lucide-layout-dashboard' },
  { to: '/admin/tenants', label: 'Tenants', icon: 'i-lucide-building-2' },
]

const socialNav = [
  { to: '/admin/social/posts', label: 'Posts', icon: 'i-lucide-image', exact: false },
  { to: '/admin/social/automations', label: 'Automações', icon: 'i-lucide-zap', exact: false },
  { to: '/admin/social/monitored-profiles', label: 'Perfis monitorados', icon: 'i-lucide-eye', exact: false },
]

const breadcrumb = computed(() => {
  const segs = route.path.split('/').filter(Boolean)
  if (segs.length <= 1) return 'DASHBOARD'
  return segs.slice(1).join(' · ').toUpperCase()
})

function navStyle(to: string, _exact?: boolean) {
  const current = route.path.replace(/\/$/, '') || '/'
  const target = to.replace(/\/$/, '') || '/'
  const active = current === target || (target !== '/admin' && current.startsWith(target + '/'))
  return {
    color: active ? C.primary : C.textMuted,
    backgroundColor: active ? `${C.primary}14` : 'transparent',
    borderColor: active ? `${C.primary}44` : 'transparent',
  }
}

async function logout() {
  try {
    await auth.logout()
  } finally {
    router.push('/admin/auth/login')
  }
}

// Noindex belt-and-suspenders: the subdomain middleware already adds
// X-Robots-Tag header on every response, and /admin/robots.txt returns
// Disallow: /. This meta is the third layer — if an HTML page somehow
// leaks past both prior checks, robots meta still tells crawlers to
// skip. Adding at layout level covers every page using this layout.
useHead({
  title: 'Redentia Admin',
  meta: [
    { name: 'robots', content: 'noindex, nofollow, noarchive' },
  ],
  link: [{ rel: 'stylesheet', href: REDENTIA_GOOGLE_FONT_HREF }],
})
</script>

<style scoped>
.font-mono-tab {
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-feature-settings: 'tnum' 1;
}
</style>
