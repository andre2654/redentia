<!--
  admin-panel layout — sidebar + topbar + main slot.

  Theme: 100% CSS vars (var(--brand-*)) pra responder ao toggle
  global de light/dark mode no <AtomsColorModeToggle> que vive no
  rodape da sidebar. O brand plugin emite ambos os blocos de vars
  (light/dark) no <head>; CSS resolve qual aplicar via
  :root.dark / :root.light + media query pra OS pref.

  Antes esse layout usava REDENTIA_COLORS (hardcoded dark) via
  inline styles, o que deixava a sidebar fixa em dark mesmo quando
  o user trocava pra light.
-->
<template>
  <div class="admin-shell">
    <!-- Sidebar -->
    <aside class="admin-sidebar">
      <!-- Brand + admin tag -->
      <div class="admin-sidebar__brand">
        <div class="admin-sidebar__brand-mark">
          <UIcon name="i-lucide-shield" class="size-5" />
        </div>
        <div class="admin-sidebar__brand-meta">
          <span class="admin-sidebar__brand-name">
            REDENT<span class="admin-sidebar__brand-accent">.ADMIN</span>
          </span>
          <span class="admin-sidebar__brand-sub">PAINEL PRIVADO</span>
        </div>
      </div>

      <!-- User card -->
      <div v-if="auth.me" class="admin-sidebar__user">
        <UAvatar :alt="auth.me.name" size="sm" />
        <div class="admin-sidebar__user-meta">
          <span class="admin-sidebar__user-name">{{ auth.me.name }}</span>
          <span class="admin-sidebar__user-role" :class="{ 'admin-sidebar__user-role--super': isSuperAdmin }">
            <UIcon
              v-if="isSuperAdmin"
              name="i-lucide-shield-check"
              class="size-2.5"
              aria-hidden="true"
            />
            {{ isSuperAdmin ? 'SUPERADMIN' : (auth.me.tenant_name?.toUpperCase() || 'ADMIN') }}
          </span>
        </div>
        <button
          type="button"
          class="admin-sidebar__user-logout"
          aria-label="Sair"
          @click="logout"
        >
          <UIcon name="i-lucide-log-out" class="size-4" />
        </button>
      </div>

      <!-- Nav -->
      <nav class="admin-sidebar__nav">
        <NuxtLink
          v-for="item in mainNav"
          :key="item.to"
          :to="item.to"
          class="admin-nav-item"
          :class="{ 'admin-nav-item--active': isActive(item.to) }"
        >
          <UIcon :name="item.icon" class="size-4" />
          {{ item.label }}
        </NuxtLink>

        <div class="admin-sidebar__divider" />
        <span class="admin-sidebar__nav-eyebrow">SOCIAL</span>

        <NuxtLink
          v-for="item in socialNav"
          :key="item.to"
          :to="item.to"
          class="admin-nav-item"
          :class="{ 'admin-nav-item--active': isActive(item.to) }"
        >
          <UIcon :name="item.icon" class="size-4" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- Footer -->
      <div class="admin-sidebar__footer">
        <!-- Color mode toggle -->
        <div class="admin-sidebar__theme-row">
          <span class="admin-sidebar__theme-label">Tema</span>
          <AtomsColorModeToggle size="compact" />
        </div>

        <a
          :href="postizUrl"
          target="_blank"
          rel="noopener"
          class="admin-sidebar__footer-link"
        >
          <span>
            <UIcon name="i-lucide-external-link" class="admin-sidebar__footer-icon size-3" />
            POSTIZ CONSOLE
          </span>
          <UIcon name="i-lucide-arrow-up-right" class="size-3" />
        </a>
        <a :href="mainSiteHref" class="admin-sidebar__footer-link admin-sidebar__footer-link--plain">
          <UIcon name="i-lucide-arrow-left" class="size-3" />
          VOLTAR PRO SITE
        </a>
      </div>
    </aside>

    <!-- Main area -->
    <main class="admin-main">
      <header class="admin-topbar">
        <span class="admin-topbar__crumb">{{ breadcrumb }}</span>
        <span class="admin-topbar__tag">Private · Noindex</span>
      </header>
      <div class="admin-content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
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

/**
 * Superadmin pode manipular tenants e ver dados cross-tenant.
 * Tenant admin (role=admin sem flag) so ve coisa do proprio tenant —
 * nao tem acesso a /admin/tenants nem /admin/billing/MRR consolidado.
 */
const isSuperAdmin = computed(() => !!auth.me?.is_super_admin)

const mainNav = computed(() => {
  const items = [
    { to: '/admin', label: 'Dashboard', icon: 'i-lucide-layout-dashboard', superOnly: false },
    { to: '/admin/tenants', label: 'Tenants', icon: 'i-lucide-building-2', superOnly: true },
    { to: '/admin/billing', label: 'Billing', icon: 'i-lucide-credit-card', superOnly: true },
    { to: '/admin/users', label: 'Usuários', icon: 'i-lucide-users', superOnly: false },
    { to: '/admin/comunicacoes', label: 'Comunicações', icon: 'i-lucide-megaphone', superOnly: false },
    { to: '/admin/leads', label: 'Leads', icon: 'i-lucide-magnet', superOnly: false },
    { to: '/admin/reports', label: 'Reports', icon: 'i-lucide-life-buoy', superOnly: false },
  ]
  return items.filter(item => !item.superOnly || isSuperAdmin.value)
})

const socialNav = [
  { to: '/admin/social/posts', label: 'Posts', icon: 'i-lucide-image' },
  { to: '/admin/social/automations', label: 'Automações', icon: 'i-lucide-zap' },
  { to: '/admin/social/monitored-profiles', label: 'Perfis monitorados', icon: 'i-lucide-eye' },
]

const breadcrumb = computed(() => {
  const segs = route.path.split('/').filter(Boolean)
  if (segs.length <= 1) return 'DASHBOARD'
  return segs.slice(1).join(' · ').toUpperCase()
})

function isActive(to: string): boolean {
  const current = route.path.replace(/\/$/, '') || '/'
  const target = to.replace(/\/$/, '') || '/'
  return current === target || (target !== '/admin' && current.startsWith(target + '/'))
}

async function logout() {
  try {
    await auth.logout()
  } finally {
    router.push('/admin/auth/login')
  }
}

useHead({
  title: 'Redentia Admin',
  meta: [
    { name: 'robots', content: 'noindex, nofollow, noarchive' },
  ],
})
</script>

<style scoped>
.admin-shell {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: var(--brand-background);
  color: var(--brand-text);
  font-family: var(--brand-font);
}

/* =========================================================
   SIDEBAR
   ========================================================= */
.admin-sidebar {
  display: flex;
  flex-direction: column;
  width: 280px;
  min-width: 280px;
  height: 100%;
  padding: 20px;
  background-color: var(--brand-surface);
  border-right: 1px solid var(--brand-border);
}

/* Brand */
.admin-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.admin-sidebar__brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 4px;
  background-color: var(--brand-primary);
  color: var(--text-on-primary);
  flex-shrink: 0;
}
.admin-sidebar__brand-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.admin-sidebar__brand-name {
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-feature-settings: 'tnum' 1;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--brand-text);
}
.admin-sidebar__brand-accent { color: var(--brand-primary); }
.admin-sidebar__brand-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--brand-text-muted);
}

/* User card */
.admin-sidebar__user {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid var(--brand-border);
  background-color: var(--brand-surface-hover);
}
.admin-sidebar__user-meta {
  display: flex;
  flex: 1;
  flex-direction: column;
  line-height: 1.1;
  min-width: 0;
}
.admin-sidebar__user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--brand-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.admin-sidebar__user-role {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--brand-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.admin-sidebar__user-role--super {
  color: var(--brand-positive);
  background: color-mix(in srgb, var(--brand-positive) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-positive) 30%, transparent);
  border-radius: 4px;
  padding: 1px 5px;
  letter-spacing: 0.12em;
  font-weight: 500;
}
.admin-sidebar__user-logout {
  border-radius: 4px;
  padding: 6px;
  background: transparent;
  border: 0;
  color: var(--brand-text-muted);
  cursor: pointer;
  transition: background-color 150ms, color 150ms;
}
.admin-sidebar__user-logout:hover {
  background-color: color-mix(in srgb, var(--brand-text) 6%, transparent);
  color: var(--brand-text);
}

/* Nav */
.admin-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid transparent;
  font-size: 13px;
  color: var(--brand-text-muted);
  transition: background-color 150ms, color 150ms, border-color 150ms;
  text-decoration: none;
}
.admin-nav-item:hover {
  background-color: color-mix(in srgb, var(--brand-text) 4%, transparent);
  color: var(--brand-text);
}
.admin-nav-item--active {
  color: var(--brand-primary);
  background-color: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 30%, transparent);
}
.admin-nav-item--active:hover {
  color: var(--brand-primary);
  background-color: color-mix(in srgb, var(--brand-primary) 14%, transparent);
}

.admin-sidebar__divider {
  height: 1px;
  margin: 12px 0;
  background-color: var(--brand-border);
}
.admin-sidebar__nav-eyebrow {
  display: block;
  margin-bottom: 4px;
  padding: 0 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--brand-text-muted);
}

/* Footer */
.admin-sidebar__footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--brand-border);
}

.admin-sidebar__theme-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 8px 8px;
}
.admin-sidebar__theme-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--brand-text-muted);
}

.admin-sidebar__footer-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid var(--brand-border);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--brand-text-muted);
  text-decoration: none;
  transition: opacity 150ms;
}
.admin-sidebar__footer-link:hover { opacity: 0.8; }
.admin-sidebar__footer-link span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.admin-sidebar__footer-icon { color: var(--brand-primary); }

.admin-sidebar__footer-link--plain {
  border: 0;
  padding: 4px 12px;
  gap: 8px;
  justify-content: flex-start;
}

/* =========================================================
   MAIN AREA + TOPBAR
   ========================================================= */
.admin-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.admin-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 24px;
  border-bottom: 1px solid var(--brand-border);
  background-color: color-mix(in srgb, var(--brand-surface) 75%, transparent);
  backdrop-filter: blur(8px);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--brand-text-muted);
}
.admin-topbar__tag { color: var(--brand-primary); }

.admin-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
</style>
