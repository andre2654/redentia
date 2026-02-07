<template>
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex flex-col bg-black text-white"
      style="background: #000000"
    >
      <div class="flex items-center justify-between px-6 pb-6 pt-10">
        <div class="flex items-center gap-3">
          <template v-if="isAuthenticated">
            <UAvatar :alt="userName" size="lg" />
            <div class="flex flex-col">
              <span class="text-base font-semibold">{{ userName }}</span>
              <span class="text-xs text-white/50">Plano gratuito</span>
            </div>
          </template>
          <template v-else>
            <IconLogo class="h-9 w-9 fill-white" />
            <div class="flex flex-col">
              <span class="text-xs uppercase tracking-[0.25em] text-white/50">
                Redentia
              </span>
              <span class="text-lg font-semibold text-white">
                Investir com IA
              </span>
            </div>
          </template>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            v-if="isAuthenticated"
            color="neutral"
            variant="link"
            :trailing-icon="
              interfaceStore.revealAmount ? 'i-lucide-eye-off' : 'i-lucide-eye'
            "
            :ui="{ trailingIcon: 'size-6' }"
            :aria-label="
              interfaceStore.revealAmount ? 'Ocultar valores' : 'Mostrar valores'
            "
            :aria-pressed="interfaceStore.revealAmount"
            @click="interfaceStore.toggleRevealAmount"
          />
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            aria-label="Fechar menu"
            class="text-white"
            :ui="{ base: 'rounded-full' }"
            @click="closeMenu"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-6 pb-10">
        <div class="flex flex-col gap-8">
          <MoleculesSearchAssets
            v-if="showSearch"
            class="w-full rounded-full border border-white/10 bg-white/5 py-4 backdrop-blur"
          />

          <template v-if="isAuthenticated">
            <div class="flex flex-col gap-2">
              <NuxtLink
                to="/"
                class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
                @click="closeMenu"
              >
                <UIcon
                  name="i-si-dashboard-vert-fill"
                  class="text-secondary size-5"
                />
                Visão Geral
              </NuxtLink>
              <NuxtLink
                to="/calculadora"
                class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
                @click="closeMenu"
              >
                <UIcon
                  name="i-lucide-calculator"
                  class="text-secondary size-5"
                />
                Calculadora inteligente
              </NuxtLink>
              <NuxtLink
                to="/guias"
                class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
                @click="closeMenu"
              >
                <UIcon
                  name="i-lucide-book-open"
                  class="text-secondary size-5"
                />
                Guias de investimento
              </NuxtLink>
              <NuxtLink
                to="/settings"
                class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
                @click="closeMenu"
              >
                <UIcon
                  name="i-lucide-settings"
                  class="text-secondary size-5"
                />
                Configurações
              </NuxtLink>
            </div>

            <NuxtLink
              to="/help"
              class="hover:bg-secondary/20 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 px-6 py-4"
              @click="closeMenu"
            >
              <div class="flex items-center gap-4">
                <IconAi class="fill-secondary h-6 w-6" />
                <div class="flex flex-col">
                  <span
                    class="text-secondary/80 text-xs uppercase tracking-wider"
                  >
                    Assessoria IA
                  </span>
                  <span class="text-base font-semibold text-white">
                    Acesse de graça
                  </span>
                </div>
              </div>
              <UIcon
                name="i-lucide-arrow-up-right"
                class="text-secondary/80 size-5"
              />
            </NuxtLink>

            <button
              type="button"
              class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
              @click="handleLogout"
            >
              <UIcon name="i-lucide-log-out" class="text-secondary size-5" />
              Sair
            </button>
          </template>

          <template v-else>
            <div class="flex flex-col gap-3">
              <NuxtLink
                v-for="link in publicLinks"
                :key="link.to"
                :to="link.to"
                class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium transition hover:border-white/20 hover:bg-white/10"
                @click="closeMenu"
              >
                <UIcon :name="link.icon" class="text-secondary size-5" />
                {{ link.label }}
              </NuxtLink>
            </div>
            <div
              class="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70"
            >
              <div class="mb-4 flex items-center justify-between">
                <div>
                  <p class="font-medium text-white">Assessoria IA bloqueada</p>
                  <p
                    class="mt-1 text-xs uppercase tracking-widest text-white/40"
                  >
                    Faça login para acessar
                  </p>
                </div>
                <UIcon name="i-lucide-lock" class="text-secondary size-6" />
              </div>
              <div
                class="border-secondary/20 bg-secondary/10 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm text-white/80"
              >
                <IconAi class="fill-secondary h-6 w-6" />
                <div class="flex-1">
                  <p class="font-semibold text-white">
                    Assessoria com Inteligência Artificial
                  </p>
                  <p class="text-xs text-white/60">
                    Entre na plataforma para conversar com a IA e receber
                    recomendações.
                  </p>
                </div>
                <UButton
                  to="/auth/login"
                  color="secondary"
                  size="sm"
                  class="rounded-full"
                >
                  Entrar
                </UButton>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const open = defineModel<boolean>('open', { default: false })

const props = defineProps({
  mode: {
    type: String as PropType<'auto' | 'auth' | 'public'>,
    default: 'auto',
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
})

const authStore = useAuthStore()
const interfaceStore = useInterfaceStore()
const router = useRouter()

const isAuthenticated = computed(() => {
  if (props.mode === 'auth') return true
  if (props.mode === 'public') return false
  return authStore.isAuthenticated
})

const userName = computed(() => authStore.me?.name ?? 'Usuário')

const publicLinks = [
  { to: '/', label: 'Início', icon: 'i-lucide-home' },
  { to: '/calculadora', label: 'Calculadoras', icon: 'i-lucide-calculator' },
  { to: '/guias', label: 'Guias de Investimento', icon: 'i-lucide-book-open' },
]

function closeMenu() {
  open.value = false
}

function focusSearch() {
  if (!props.showSearch) {
    router.push('/search')
    closeMenu()
    return
  }
}

async function handleLogout() {
  await authStore.logout()
  closeMenu()
  router.push('/auth/login')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
