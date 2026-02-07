<template>
  <NuxtLayout
    :name="layoutName"
    title="Assessoria"
    header-class="!text-white !bg-tertiary/50"
  >
    <h1 class="sr-only">Assessoria com IA | Redentia</h1>
    <div class="flex h-full w-full flex-col gap-4 pb-4 pt-4 xl:pt-5">
      <div
        v-if="!authStore.isAuthenticated"
        class="flex h-full w-full items-center justify-center"
      >
        <div
          class="flex h-full min-h-screen w-full flex-col items-center justify-center gap-5 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 text-center text-white backdrop-blur-xl"
        >
          <div class="flex flex-col items-center gap-4">
            <IconAi class="fill-secondary h-12" />
            <h2 class="text-2xl font-semibold sm:text-3xl">
              Converse com nossa IA
            </h2>
            <p class="max-w-xl text-sm text-white/70 sm:text-base">
              Faça login para liberar o chat inteligente, tirar dúvidas,
              comparar ativos e receber análises personalizadas.
            </p>
          </div>
          <UButton
            color="secondary"
            size="xl"
            icon="i-lucide-message-circle"
            class="hover:shadow-secondary/50 px-6 transition-all hover:scale-105 hover:shadow-2xl"
            @click="redirectToLogin"
          >
            Acessar Assessoria
          </UButton>
          <p class="text-xs text-white/50 sm:text-sm">
            Respostas instantâneas • Análises personalizadas com IA
          </p>
        </div>
      </div>
      <template v-else>
        <!-- Layout estilo WhatsApp: lista à esquerda + chat à direita (só para assessor) -->
        <template v-if="isAdvisor">
          <div class="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row xl:mt-6">
            <!-- Sidebar contatos (estilo alinhado à sidebar do layout) -->
            <aside class="contacts-sidebar flex max-h-[45vh] w-full flex-col border-r border-white/10 bg-white/[0.02] md:max-h-none md:w-[320px] md:min-w-[280px] md:max-w-[360px]">
              <div class="shrink-0 px-3 pt-4 pb-3">
                <span class="mb-2 block px-1 text-[10px] font-medium uppercase tracking-wider text-white/30">
                  Meus contatos
                </span>
                <div class="relative">
                  <UIcon
                    name="i-lucide-search"
                    class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                  />
                  <input
                    v-model="contactSearch"
                    type="text"
                    placeholder="Buscar por nome ou e-mail"
                    class="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/40 transition hover:border-white/20 focus:border-white/20 focus:outline-none focus:ring-0"
                  />
                </div>
              </div>
              <div class="contacts-list flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-3">
                <!-- Assessor inteligente (IA) sempre em primeiro -->
                <button
                  type="button"
                  class="group flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200"
                  :class="selectedContact === null
                    ? 'border-secondary/30 bg-secondary/10 text-secondary'
                    : 'border-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white'"
                  @click="selectedContact = null"
                >
                  <div
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    :class="selectedContact === null ? 'bg-secondary/20' : 'bg-white/5 group-hover:bg-white/10'"
                  >
                    <IconAi class="h-5 w-5" :class="selectedContact === null ? 'fill-secondary' : 'fill-white/60 group-hover:fill-white/80'" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium">
                      Assessor inteligente
                    </p>
                    <p class="truncate text-xs text-white/50">
                      Assistente com IA
                    </p>
                  </div>
                </button>
                <div v-if="investorsLoading" class="flex justify-center py-8">
                  <UIcon name="i-lucide-loader-2" class="h-5 w-5 animate-spin text-secondary" />
                </div>
                <div v-else-if="filteredInvestors.length === 0" class="px-3 py-6 text-center text-xs leading-relaxed text-white/40">
                  {{ contactSearch ? 'Nenhum contato encontrado.' : 'Nenhum investidor vinculado. Compartilhe seu código nas configurações.' }}
                </div>
                <button
                  v-for="inv in filteredInvestors"
                  :key="inv.id"
                  type="button"
                  class="group flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200"
                  :class="selectedContact?.id === inv.id
                    ? 'border-secondary/30 bg-secondary/10 text-secondary'
                    : 'border-transparent text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white'"
                  @click="selectedContact = { id: inv.id, name: inv.name ?? 'Investidor', approval_status: inv.approval_status }"
                >
                  <div
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-medium"
                    :class="selectedContact?.id === inv.id ? 'bg-secondary/20 text-secondary' : 'bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-white'"
                  >
                    {{ (inv.name ?? '?').charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium">
                      {{ inv.name ?? 'Investidor' }}
                    </p>
                    <p v-if="inv.email" class="truncate text-xs text-white/50">
                      {{ inv.email }}
                    </p>
                  </div>
                  <span
                    v-if="inv.approval_status === 'pending'"
                    class="shrink-0 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-medium text-amber-300"
                  >
                    Pendente
                  </span>
                </button>
              </div>
            </aside>
            <!-- Área do chat: contato selecionado ou IA -->
            <main class="min-h-0 flex-1">
              <div
                v-if="selectedContact && selectedContact.approval_status === 'pending'"
                class="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-b from-[#042f54] to-[#0b3f6d] p-6 text-center text-white"
              >
                <UIcon name="i-lucide-user-clock" class="h-12 w-12 text-amber-400/80" />
                <p class="text-sm font-medium">Aprove este investidor para conversar</p>
                <p class="max-w-xs text-[13px] text-white/60">
                  O vínculo está pendente. Aprove em <NuxtLink to="/advisor" class="underline text-secondary">Área do assessor</NuxtLink> para trocar mensagens.
                </p>
              </div>
              <MoleculesChatAdvisor
                v-else-if="selectedContact"
                :other-user-id="selectedContact.id"
                :other-user-name="selectedContact.name"
                :my-id="advisorMyId"
                :investor-detail-href="`/advisor/investors/${selectedContact.id}`"
                class="h-full min-h-[300px] w-full"
              />
              <MoleculesChat
                v-else
                class="h-full w-full bg-gradient-to-b from-[#042f54] to-[#0b3f6d] text-white"
                :suggestions="[
                  'Me dê um relatório completo sobre a Petrobras',
                  'Tenho R$ 100,00 para investir, qual ação comprar?',
                  'Como está o mercado hoje?',
                ]"
                textarea-container-class="bg-gray-200"
                :messages="messages"
                route-path="/help"
              />
            </main>
          </div>
        </template>

        <!-- Investidor: abas IA vs assessor + chat (estilo igual ao item Assessor inteligente) -->
        <template v-else>
          <div v-if="showAdvisorTab" class="mt-5 flex flex-wrap gap-2 px-2 xl:mt-6">
            <button
              type="button"
              class="group flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 sm:w-auto"
              :class="activeTab === 'ia'
                ? 'border-secondary/30 bg-secondary/10 text-secondary'
                : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/5 hover:text-white'"
              @click="activeTab = 'ia'"
            >
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                :class="activeTab === 'ia' ? 'bg-secondary/20' : 'bg-white/5 group-hover:bg-white/10'"
              >
                <IconAi class="h-5 w-5" :class="activeTab === 'ia' ? 'fill-secondary' : 'fill-white/60 group-hover:fill-white/80'" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium">
                  Assessor inteligente
                </p>
                <p class="truncate text-xs text-white/50">
                  Assistente com IA
                </p>
              </div>
            </button>
            <button
              type="button"
              class="group flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 sm:w-auto"
              :class="activeTab === 'advisor'
                ? 'border-secondary/30 bg-secondary/10 text-secondary'
                : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/5 hover:text-white'"
              @click="activeTab = 'advisor'"
            >
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                :class="activeTab === 'advisor' ? 'ring-2 ring-secondary/30' : 'bg-white/5 group-hover:bg-white/10'"
              >
                <UAvatar
                  :alt="advisorName"
                  size="sm"
                  class="h-9 w-9"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium">
                  Conversar com {{ advisorName }}
                </p>
                <p class="truncate text-xs text-white/50">
                  Seu assessor
                </p>
              </div>
            </button>
          </div>
          <div class="min-h-0 flex-1" :class="{ 'mt-4': showAdvisorTab }">
            <MoleculesChat
              v-if="!showAdvisorTab || activeTab === 'ia'"
              class="h-full w-full bg-gradient-to-b from-[#042f54] to-[#0b3f6d] text-white"
              :suggestions="[
                'Me dê um relatório completo sobre a Petrobras',
                'Tenho R$ 100,00 para investir, qual ação comprar?',
                'Como está o mercado hoje?',
              ]"
              textarea-container-class="bg-gray-200"
              :messages="messages"
              route-path="/help"
            />
          <MoleculesChatAdvisor
            v-else-if="advisorId && advisorName"
            :other-user-id="advisorId"
            :other-user-name="advisorName"
            :my-id="myId"
            class="h-full min-h-[400px] w-full"
          />
          </div>
        </template>
      </template>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const { getInvestors } = useAdvisorService()

const messages = ref<IChatMessage[]>([
  {
    id: '1',
    content: 'Olá, como posso ajudar você hoje?',
    type: 'bot',
    timestamp: new Date(),
  },
])

const activeTab = ref<'ia' | 'advisor'>('ia')

const isAdvisor = computed(() => authStore.me?.role === 'advisor')

const selectedContact = ref<{ id: number; name: string; approval_status?: string } | null>(null)
const advisorMyId = computed(() => Number(authStore.me?.id) || 0)

const investors = ref<Array<{ id: number; name?: string; email?: string; approval_status?: string }>>([])
const investorsLoading = ref(false)
const contactSearch = ref('')

const filteredInvestors = computed(() => {
  const q = contactSearch.value.trim().toLowerCase()
  if (!q) return investors.value
  return investors.value.filter(
    (inv) =>
      (inv.name ?? '').toLowerCase().includes(q) ||
      (inv.email ?? '').toLowerCase().includes(q)
  )
})

async function loadInvestors() {
  if (!isAdvisor.value) return
  investorsLoading.value = true
  try {
    const resp = await getInvestors()
    investors.value = resp.investors ?? []
  } catch {
    investors.value = []
  } finally {
    investorsLoading.value = false
  }
}

watch(isAdvisor, (v) => { if (v) loadInvestors() }, { immediate: true })

const showAdvisorTab = computed(
  () =>
    authStore.me?.role === 'investor' &&
    authStore.me?.approval_status === 'approved' &&
    !!authStore.me?.advisor_id &&
    !!authStore.me?.advisor
)

const advisorId = computed(() => authStore.me?.advisor_id ?? 0)
const advisorName = computed(() => authStore.me?.advisor?.name ?? 'Assessor')
const myId = computed(() => Number(authStore.me?.id) || 0)

definePageMeta({
  isPublicRoute: true,
})

const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated'
)

usePageSeo({
  title: 'Assessoria com IA | Redentia',
  description:
    'Converse com a assistente inteligente da Redentia, tire dúvidas sobre investimentos e receba recomendações personalizadas com tecnologia de IA.',
  path: '/help',
})

function redirectToLogin() {
  navigateTo('/auth/login?redirect=/help')
}
</script>

<style scoped>
.contacts-list {
  scrollbar-gutter: stable;
}
.contacts-list::-webkit-scrollbar {
  width: 6px;
}
.contacts-list::-webkit-scrollbar-track {
  background: transparent;
}
.contacts-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 3px;
}
.contacts-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
