<template>
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex flex-col"
      :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
    >
      <div class="flex items-center justify-between px-6 pb-6 pt-10">
        <div class="flex items-center gap-3">
          <template v-if="isAuthenticated">
            <UAvatar :alt="userName" size="lg" />
            <div class="flex flex-col">
              <span class="text-base font-semibold">{{ userName }}</span>
              <span class="text-xs" :style="{ color: brand.colors.textMuted }">{{ brand.sidebar.planLabel }}</span>
            </div>
          </template>
          <template v-else>
            <BrandLogo variant="icon" class="h-9 w-9" />
            <div class="flex flex-col">
              <span class="text-xs uppercase tracking-[0.25em]" :style="{ color: brand.colors.textMuted }">
                {{ brand.name }}
              </span>
              <span class="text-lg font-semibold" :style="{ color: brand.colors.text }">
                {{ brand.subtitle }}
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
            :style="{ color: brand.colors.text }"
            :ui="{ base: 'rounded-full' }"
            @click="closeMenu"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-6 pb-10">
        <div class="flex flex-col gap-8">
          <MoleculesSearchAssets
            v-if="showSearch"
            class="w-full rounded-full border py-4 backdrop-blur"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
          />

          <template v-if="isAuthenticated">
            <div class="flex flex-col gap-2">
              <NuxtLink
                to="/"
                class="flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-medium transition"
                :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.text }"
                @click="closeMenu"
              >
                <UIcon
                  name="i-si-dashboard-vert-fill"
                  class="text-secondary size-5"
                />
                {{ brand.nav.overview }}
              </NuxtLink>
              <NuxtLink
                to="/calculadora"
                class="flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-medium transition"
                :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.text }"
                @click="closeMenu"
              >
                <UIcon
                  name="i-lucide-calculator"
                  class="text-secondary size-5"
                />
                {{ brand.nav.mobileCalc }}
              </NuxtLink>
              <NuxtLink
                to="/guias"
                class="flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-medium transition"
                :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.text }"
                @click="closeMenu"
              >
                <UIcon
                  name="i-lucide-book-open"
                  class="text-secondary size-5"
                />
                {{ brand.nav.mobileGuides }}
              </NuxtLink>
              <NuxtLink
                to="/settings"
                class="flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-medium transition"
                :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.text }"
                @click="closeMenu"
              >
                <UIcon
                  name="i-lucide-settings"
                  class="text-secondary size-5"
                />
                {{ brand.nav.settings }}
              </NuxtLink>
            </div>

            <NuxtLink
              to="/help"
              class="hover:bg-secondary/20 flex items-center justify-between gap-4 rounded-2xl border px-6 py-4"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background + '4D' }"
              @click="closeMenu"
            >
              <div class="flex items-center gap-4">
                <IconAi class="fill-secondary h-6 w-6" />
                <div class="flex flex-col">
                  <span
                    class="text-secondary/80 text-xs uppercase tracking-wider"
                  >
                    {{ brand.nav.mobileAiLabel }}
                  </span>
                  <span class="text-base font-semibold" :style="{ color: brand.colors.text }">
                    {{ brand.nav.mobileAiAccess }}
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
              class="flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-medium transition"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.text }"
              @click="handleLogout"
            >
              <UIcon name="i-lucide-log-out" class="text-secondary size-5" />
              {{ brand.nav.logout }}
            </button>
          </template>

          <template v-else>
            <div class="flex flex-col gap-3">
              <NuxtLink
                v-for="link in publicLinks"
                :key="link.to"
                :to="link.to"
                class="flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-medium transition"
                :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
                @click="closeMenu"
              >
                <UIcon :name="link.icon" class="text-secondary size-5" />
                {{ link.label }}
              </NuxtLink>
            </div>
            <div
              class="rounded-2xl border p-5 text-sm"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.textMuted }"
            >
              <div class="mb-4 flex items-center justify-between">
                <div>
                  <p class="font-medium" :style="{ color: brand.colors.text }">{{ brand.nav.mobileAiLocked }}</p>
                  <p
                    class="mt-1 text-xs uppercase tracking-widest"
                    :style="{ color: brand.colors.textMuted }"
                  >
                    {{ brand.nav.mobileAiLockedSub }}
                  </p>
                </div>
                <UIcon name="i-lucide-lock" class="text-secondary size-6" />
              </div>
              <div
                class="border-secondary/20 bg-secondary/10 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm"
                :style="{ color: brand.colors.textMuted }"
              >
                <IconAi class="fill-secondary h-6 w-6" />
                <div class="flex-1">
                  <p class="font-semibold" :style="{ color: brand.colors.text }">
                    {{ brand.nav.mobileAiDescription }}
                  </p>
                  <p class="text-xs" :style="{ color: brand.colors.textMuted }">
                    {{ brand.nav.mobileAiDescriptionSub }}
                  </p>
                </div>
                <UButton
                  to="/auth/login"
                  color="secondary"
                  size="sm"
                  class="rounded-full"
                >
                  {{ brand.nav.login }}
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

const brand = useBrand()
const authStore = useAuthStore()
const interfaceStore = useInterfaceStore()
const router = useRouter()

const isAuthenticated = computed(() => {
  if (props.mode === 'auth') return true
  if (props.mode === 'public') return false
  return authStore.isAuthenticated
})

const userName = computed(() => authStore.me?.name ?? 'Usuário')

const publicLinks = computed(() => [
  { to: '/', label: brand.nav.mobileHome, icon: 'i-lucide-home' },
  { to: '/calculadora', label: brand.nav.calculators, icon: 'i-lucide-calculator' },
  { to: '/guias', label: brand.nav.mobileGuides, icon: 'i-lucide-book-open' },
])

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
