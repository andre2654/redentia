<!--
  /help — full-screen Redentia chat (Perplexity-style takeover).

  Single canonical AI chat surface. Replaces both the legacy /help
  (which previously hosted MoleculesChat + MoleculesChatAdvisor with
  tabs) and the interim /chat page. QuickSearch and any other entry
  point should now redirect here with `?q=` for auto-send.

  Auth model:
  - Public route (SEO-indexable). Unauthenticated users see a CTA
    card that points them to /auth/login?redirect=/help.
  - Sending a message requires authentication — the composer is
    only mounted when authStore.isAuthenticated is true. Server-side
    chat-service also rejects anonymous /stream POSTs.
-->
<template>
  <!-- Unauthenticated: marketing CTA card, indexable by SEO bots -->
  <NuxtLayout
    v-if="!authStore.isAuthenticated"
    name="unauthenticated"
    title="Assessoria com IA"
    :hide-footer="false"
  >
    <h1 class="sr-only">Assessoria com IA | {{ brand.name }}</h1>
    <div class="flex h-full w-full items-center justify-center px-5 py-10 md:px-8">
      <div
        class="flex w-full max-w-2xl flex-col items-center gap-6 brand-card p-8 text-center backdrop-blur-xl md:p-12"
        :style="{ backgroundColor: brand.colors.surface, color: brand.colors.text }"
      >
        <BrandLogo variant="full" mode="auto" class="h-10 w-auto" />
        <div class="flex flex-col gap-3">
          <h2
            class="font-display text-[28px] font-semibold leading-tight tracking-tight md:text-[36px]"
          >
            {{ brand.ai?.welcomeTitle ?? 'Assessoria com IA' }}
          </h2>
          <p
            class="text-[14px] leading-relaxed md:text-[16px]"
            :style="{ color: brand.colors.textMuted }"
          >
            {{ brand.ai?.welcomeSubtitle ?? 'Faça login para conversar com a inteligência da Redentia. Análise de ativos, comparativos, montagem de carteira e validação de meta — tudo em um só lugar.' }}
          </p>
        </div>
        <UButton
          color="secondary"
          size="xl"
          icon="i-lucide-message-circle"
          class="hover:shadow-secondary/50 px-6 transition-[transform,box-shadow,filter] hover:scale-[1.03] hover:shadow-2xl"
          @click="redirectToLogin"
        >
          {{ brand.voice?.ctaPrimary ?? 'Entrar para conversar' }}
        </UButton>
        <p
          v-if="brand.ai?.ctaFeatures?.length"
          class="text-[12px] sm:text-[13px]"
          :style="{ color: brand.colors.textMuted }"
        >
          {{ brand.ai.ctaFeatures.join(' • ') }}
        </p>
      </div>
    </div>
  </NuxtLayout>

  <!-- Authenticated: Perplexity-style takeover (no layout chrome) -->
  <ChatV2Layout
    v-else
    :sidebar-open="sidebarOpen"
    :artifact-open="artifactOpen"
    :tier="tier"
    @close-sidebar="sidebarOpen = false"
    @close-artifact="artifactOpen = false"
  >
    <template #sidebar>
      <ChatV2Sidebar
        :sessions="sessionList"
        :active-id="chat.sessionId.value"
        @new="onNewConversation"
        @select="onSelectSession"
        @delete="onDeleteSession"
      />
    </template>

    <template #thread>
      <div class="relative flex h-full min-w-0 flex-1 flex-col">
        <!-- Mobile-only top bar -->
        <div
          class="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 xl:hidden"
        >
          <button
            type="button"
            class="flex size-9 items-center justify-center rounded-full backdrop-blur-md transition-colors"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 70%, transparent)`,
              border: `1px solid color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
              color: brand.colors.text,
            }"
            aria-label="Abrir conversas"
            @click="sidebarOpen = true"
          >
            <UIcon name="i-lucide-panel-left" class="size-4" />
          </button>

          <NuxtLink
            to="/"
            class="flex size-9 items-center justify-center rounded-full backdrop-blur-md transition-colors"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 70%, transparent)`,
              border: `1px solid color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
              color: brand.colors.text,
            }"
            aria-label="Voltar para a home"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </NuxtLink>
        </div>

        <!-- Desktop close button (top-right) -->
        <NuxtLink
          to="/"
          class="absolute right-5 top-5 z-10 hidden size-9 items-center justify-center rounded-full transition-colors xl:flex"
          :style="{ color: brand.colors.textMuted }"
          aria-label="Fechar chat"
        >
          <UIcon name="i-lucide-x" class="size-4" />
        </NuxtLink>

        <!-- Thread or empty state -->
        <ChatV2Thread
          v-if="chat.messages.value.length > 0"
          :messages="chat.messages.value"
          @send-followup="onSendFollowup"
          @open-artifact="onOpenArtifact"
        />
        <ChatV2EmptyState
          v-else
          :tier="tier"
          @start="onStarterChip"
        />

        <!-- Composer -->
        <ChatV2Input
          v-model:tier="tier"
          :disabled="chat.isStreaming.value"
          :is-streaming="chat.isStreaming.value"
          :tier-locked="chat.messages.value.length > 0"
          @send="onSend"
          @stop="chat.stop"
        />
      </div>
    </template>

    <template #artifact>
      <ChatV2ArtifactPanel
        v-if="activeArtifact"
        :artifact="activeArtifact"
        @close="onCloseArtifact"
      />
    </template>
  </ChatV2Layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { ChatArtifact } from '~/composables/useChatStream'

definePageMeta({
  // Public route — Authenticated users get the chat takeover; the
  // unauthenticated branch above renders inside the standard layout
  // for SEO purposes. We disable Nuxt's layout system globally so
  // the takeover can own 100% of the viewport when logged in.
  isPublicRoute: true,
  layout: false,
})

const route = useRoute()
const brand = useBrand()
const authStore = useAuthStore()

// ---- State ------------------------------------------------------
const tier = ref<'basic' | 'max'>('basic')
const sidebarOpen = ref(false)
const artifactOpen = ref(false)
const activeArtifact = ref<ChatArtifact | null>(null)
const sessionList = ref<Array<{ id: string; title: string | null; createdAt: string; tier?: 'basic' | 'max' }>>([])

const routeContext = computed<{ type: 'asset' | 'crypto' | 'tesouro' | 'home' | null; ticker?: string } | null>(
  () => null,
)

const chat = useChatStream({
  tenantSlug: brand.slug ?? 'redentia',
  tier,
  routeContext,
})

usePageSeo({
  title: `Assessoria com IA | ${brand.name}`,
  description:
    `Converse com a IA da ${brand.name}: tire dúvidas sobre investimentos, monte sua carteira com framework de 9 camadas, valide metas, compare ativos.`,
  path: '/help',
})

// ---- Load session list ------------------------------------------
async function refreshSessionList() {
  if (!authStore.isAuthenticated) {
    sessionList.value = []
    return
  }
  try {
    const r = await $fetch<{
      sessions: Array<{
        id: string
        title: string | null
        createdAt?: string
        created_at?: string
        tier?: string
      }>
    }>('/api/chat/sessions', {
      headers: { ...authHeaders(), ...chatClientIdHeaders() },
    })
    sessionList.value = (r.sessions ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      createdAt: s.createdAt ?? s.created_at ?? new Date().toISOString(),
      tier: s.tier === 'max' ? 'max' : 'basic',
    }))
  } catch {
    sessionList.value = []
  }
}

// ---- Handlers ---------------------------------------------------
function onSend(message: string) {
  if (!authStore.isAuthenticated) {
    redirectToLogin()
    return
  }
  void chat.send(message).then(refreshSessionList)
}

function onSendFollowup(
  message:
    | string
    | {
        text: string
        formId?: string
        fields?: Array<{ id: string; label: string; value: string }>
        formTitle?: string
      },
) {
  if (!authStore.isAuthenticated) {
    redirectToLogin()
    return
  }
  void chat.send(message)
}

function onStarterChip(message: string) {
  if (!authStore.isAuthenticated) {
    redirectToLogin()
    return
  }
  void chat.send(message).then(refreshSessionList)
}

async function onNewConversation() {
  chat.reset()
  sidebarOpen.value = false
}

async function onSelectSession(id: string) {
  await chat.loadSession(id)
  sidebarOpen.value = false
}

async function onDeleteSession(id: string) {
  try {
    await $fetch(`/api/chat/sessions/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders(), ...chatClientIdHeaders() },
    })
    await refreshSessionList()
    if (chat.sessionId.value === id) chat.reset()
  } catch {
    /* ignore */
  }
}

function onOpenArtifact(artifact: ChatArtifact) {
  activeArtifact.value = artifact
  artifactOpen.value = true
}

function onCloseArtifact() {
  artifactOpen.value = false
  activeArtifact.value = null
}

function redirectToLogin() {
  navigateTo('/auth/login?redirect=/help')
}

/**
 * Returns Authorization: Bearer ${token} when the user is logged in.
 * Forwarded to the chat-service so identity is resolved against
 * Laravel /api/auth/me. The page itself gates rendering on
 * authStore.isAuthenticated, but these calls also fire from inside
 * the gate so the helper stays trivially safe to call.
 */
function authHeaders(): Record<string, string> {
  return authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}
}

// ---- Auto-send `?q=` --------------------------------------------
// QuickSearch and other entry points push the user here with the
// query in the URL. If logged in, dispatch immediately. If not,
// the auth gate above shows; the query is preserved through the
// login redirect (via `redirect=/help` keeping the original URL
// in history).
onMounted(async () => {
  if (!authStore.isAuthenticated) return
  await refreshSessionList()
  const q = String(route.query.q ?? '').trim()
  if (q) {
    window.history.replaceState({}, '', '/help')
    void chat.send(q).then(refreshSessionList)
  }
})

watch(
  () => route.query.q,
  (q) => {
    if (!authStore.isAuthenticated) return
    if (typeof q === 'string' && q.trim()) {
      window.history.replaceState({}, '', '/help')
      void chat.send(q).then(refreshSessionList)
    }
  },
)
</script>
