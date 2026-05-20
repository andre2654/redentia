<!--
  MobileMenuOverlay — menu full-screen pro mobile (xl:hidden). Espelha
  a estrutura do platform-sidebar (default.vue) mas otimizado pra
  toque: tap targets >= 44px, secoes colapsaveis com animacao smooth,
  header sticky com close acessivel sem scroll.

  Tres modos:
    - 'auto':    decide pela auth store (default)
    - 'auth':    forca render autenticado (usado pelo default layout)
    - 'public':  forca render publico (usado pelo unauthenticated layout)
-->
<template>
  <Transition name="overlay">
    <div
      v-if="open"
      class="mobile-menu"
      :style="{ backgroundColor: 'var(--brand-background)', color: 'var(--brand-text)' }"
    >
      <!-- ============ HEADER STICKY ============ -->
      <header class="mobile-menu__head" :style="{ borderColor: `color-mix(in srgb, var(--brand-border) 35%, transparent)` }">
        <div class="mobile-menu__user">
          <template v-if="isAuthenticated">
            <div class="mobile-menu__avatar-wrap" :class="userPlanIsMax ? 'mobile-menu__avatar-wrap--max' : (userPlanIsPro ? 'mobile-menu__avatar-wrap--pro' : '')">
              <UAvatar :alt="userName" size="md" />
            </div>
            <div class="mobile-menu__user-text">
              <span class="mobile-menu__user-name">{{ userName }}</span>
              <span
                class="mobile-menu__user-plan"
                :class="{
                  'mobile-menu__user-plan--max': userPlanIsMax,
                  'mobile-menu__user-plan--pro': userPlanIsPro,
                }"
              >
                <UIcon
                  v-if="userPlanIsMax"
                  name="i-lucide-crown"
                  class="size-3 shrink-0"
                  aria-hidden="true"
                />
                <UIcon
                  v-else-if="userPlanIsPro"
                  name="i-lucide-sparkles"
                  class="size-3 shrink-0"
                  aria-hidden="true"
                />
                {{ userPlanDisplay }}
              </span>
            </div>
          </template>
          <template v-else>
            <BrandLogo variant="icon" class="h-9 w-9" />
            <div class="mobile-menu__user-text">
              <span class="mobile-menu__brand-eyebrow" :style="{ color: 'var(--brand-text-muted)' }">{{ brand.name }}</span>
              <span class="mobile-menu__brand-title" :style="{ color: 'var(--brand-text)' }">{{ brand.subtitle }}</span>
            </div>
          </template>
        </div>
        <div class="mobile-menu__head-actions">
          <button
            v-if="isAuthenticated"
            type="button"
            class="mobile-menu__icon-btn"
            :aria-label="interfaceStore.revealAmount ? 'Ocultar valores' : 'Mostrar valores'"
            :aria-pressed="interfaceStore.revealAmount"
            @click="interfaceStore.toggleRevealAmount"
          >
            <UIcon
              :name="interfaceStore.revealAmount ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              class="size-5"
            />
          </button>
          <button
            type="button"
            class="mobile-menu__icon-btn"
            aria-label="Fechar menu"
            @click="closeMenu"
          >
            <UIcon name="i-lucide-x" class="size-5" />
          </button>
        </div>
      </header>

      <!-- ============ BODY SCROLLABLE ============ -->
      <div class="mobile-menu__body">
        <!-- AUTHENTICATED -->
        <template v-if="isAuthenticated">
          <!-- AI CTA card — destaque -->
          <NuxtLink to="/help" class="mobile-menu__ai-card" @click="closeMenu">
            <span class="mobile-menu__ai-icon">
              <IconAi class="size-5 fill-current" />
            </span>
            <div class="mobile-menu__ai-text">
              <span class="mobile-menu__ai-eyebrow">{{ brand.nav.mobileAiLabel || 'Assessor com IA' }}</span>
              <span class="mobile-menu__ai-title">{{ brand.nav.mobileAiAccess || 'Conversar agora' }}</span>
            </div>
            <UIcon name="i-lucide-arrow-up-right" class="mobile-menu__ai-arrow size-5" />
          </NuxtLink>

          <!-- ===== MENU ===== -->
          <section class="mobile-menu__section">
            <span class="mobile-menu__eyebrow">{{ brand.nav.menuLabel || 'Menu' }}</span>
            <MoleculesMobileMenuItem :to="'/'" :icon="'i-lucide-layout-dashboard'" :label="brand.nav.overview" @click="closeMenu" />
            <MoleculesMobileMenuItem :to="'/wallet'" :icon="'i-lucide-wallet'" :label="brand.nav.wallet" @click="closeMenu" />
            <MoleculesMobileMenuItem :to="'/help'" :icon="'i-lucide-message-circle'" :label="brand.nav.chat" @click="closeMenu" />
            <MoleculesMobileMenuItem
              v-if="authStore.me?.role === 'advisor'"
              :to="'/advisor'"
              :icon="'i-lucide-users'"
              :label="brand.nav.advisorArea"
              @click="closeMenu"
            />
            <MoleculesMobileMenuGroup
              :label="brand.nav.settings || 'Configurações'"
              icon="i-lucide-settings"
              :child-paths="['/settings', '/settings/integracoes', '/settings/gerenciar-plano']"
            >
              <MoleculesMobileMenuItem :to="'/settings'" label="Usuário" :is-sub="true" :exact="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/settings/integracoes'" label="Integrações" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/settings/gerenciar-plano'" label="Gerenciar plano" :is-sub="true" @click="closeMenu" />
            </MoleculesMobileMenuGroup>
          </section>

          <!-- ===== EXPLORAR ===== -->
          <section class="mobile-menu__section">
            <span class="mobile-menu__eyebrow">Explorar</span>
            <MoleculesMobileMenuGroup
              label="Renda Variável"
              icon="i-lucide-trending-up"
              :child-paths="['/search', '/search?group=stocks', '/search?group=stocks&ch_min=0', '/search?group=stocks&ch_max=0', '/search?group=stocks&mc_max=2000000000', '/search?group=stocks&p_max=20']"
            >
              <MoleculesMobileMenuItem :to="'/search'" label="Ver todos" :is-sub="true" :exact="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/search?group=stocks'" label="Todas as ações" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/search?group=stocks&ch_min=0'" label="Ações em alta hoje" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/search?group=stocks&ch_max=0'" label="Ações em queda hoje" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/search?group=stocks&mc_max=2000000000'" label="Small caps" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/search?group=stocks&p_max=20'" label="Preço baixo (até R$ 20)" :is-sub="true" @click="closeMenu" />
            </MoleculesMobileMenuGroup>

            <MoleculesMobileMenuGroup
              label="FIIs & Internacional"
              icon="i-lucide-building-2"
              :child-paths="['/search?group=reits', '/search?group=reits&ch_min=0', '/search?group=reits&ch_max=0', '/search?group=bdrs', '/search?group=etfs']"
            >
              <MoleculesMobileMenuItem :to="'/search?group=reits'" label="Ver todos" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/search?group=reits&ch_min=0'" label="FIIs em alta" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/search?group=reits&ch_max=0'" label="FIIs em queda" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/search?group=bdrs'" label="BDRs" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/search?group=etfs'" label="ETFs" :is-sub="true" @click="closeMenu" />
            </MoleculesMobileMenuGroup>

            <MoleculesMobileMenuGroup
              label="Renda Fixa"
              icon="i-lucide-banknote"
              :child-paths="['/search?indexer=IPCA', '/search?indexer=SELIC', '/search?indexer=PREFIXADO']"
            >
              <MoleculesMobileMenuItem :to="'/search?indexer=IPCA'" label="Tesouro IPCA+" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/search?indexer=SELIC'" label="Tesouro SELIC" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/search?indexer=PREFIXADO'" label="Tesouro Prefixado" :is-sub="true" @click="closeMenu" />
            </MoleculesMobileMenuGroup>

            <MoleculesMobileMenuGroup
              label="Cripto"
              icon="i-lucide-bitcoin"
              :child-paths="['/search?crypto=1&sort=MCAP', '/search?crypto=1&sort=UP', '/search?crypto=1&sort=DOWN']"
            >
              <MoleculesMobileMenuItem :to="'/search?crypto=1&sort=MCAP'" label="Por Market Cap" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/search?crypto=1&sort=UP'" label="Em alta 24h" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/search?crypto=1&sort=DOWN'" label="Em queda 24h" :is-sub="true" @click="closeMenu" />
            </MoleculesMobileMenuGroup>
          </section>

          <!-- ===== FERRAMENTAS ===== -->
          <section class="mobile-menu__section">
            <span class="mobile-menu__eyebrow">{{ brand.nav.toolsLabel || 'Ferramentas' }}</span>
            <MoleculesMobileMenuGroup
              :label="brand.nav.calculators || 'Calculadoras'"
              icon="i-lucide-calculator"
              :child-paths="[
                '/calculadora',
                '/calculadora/acoes',
                '/calculadora/dividend-yield',
                '/calculadora/preco-teto',
                '/calculadora/imposto-renda',
                '/calculadora/aposentadoria',
                '/calculadora/juros-compostos',
                '/calculadora/quanto-investir',
                '/calculadora/planejamento',
              ]"
            >
              <MoleculesMobileMenuItem :to="'/calculadora'" label="Ver todas" :is-sub="true" :exact="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/calculadora/acoes'" label="Ações" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/calculadora/dividend-yield'" label="Dividend Yield" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/calculadora/preco-teto'" label="Preço teto" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/calculadora/imposto-renda'" label="Imposto de renda" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/calculadora/aposentadoria'" label="Aposentadoria" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/calculadora/juros-compostos'" label="Juros compostos" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/calculadora/quanto-investir'" label="Quanto investir" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/calculadora/planejamento'" label="Planejamento" :is-sub="true" @click="closeMenu" />
            </MoleculesMobileMenuGroup>

            <MoleculesMobileMenuGroup
              v-if="brand.features?.showRankings || brand.features?.showDividendYieldRanking || brand.features?.showMonthlyMoversRanking"
              label="Rankings"
              icon="i-lucide-trophy"
              :child-paths="[
                '/ranking',
                '/ranking/redentia-score',
                '/ranking/maiores-altas-mes',
                '/ranking/maiores-baixas-mes',
                '/ranking/maiores-dividend-yield',
                '/ranking/maiores-valor-mercado',
                '/ranking/mais-baratas-graham',
                '/ranking/buy-and-hold',
                '/ranking/maiores-roe',
                '/ranking/maior-potencial-upside',
              ]"
            >
              <MoleculesMobileMenuItem :to="'/ranking'" label="Ver todos" :is-sub="true" :exact="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/ranking/redentia-score'" label="Redentia Score" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/ranking/maiores-altas-mes'" label="Maiores altas do mês" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/ranking/maiores-baixas-mes'" label="Maiores baixas do mês" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/ranking/maiores-dividend-yield'" label="Maiores dividend yield" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/ranking/maiores-valor-mercado'" label="Maiores Valor de Mercado" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/ranking/mais-baratas-graham'" label="Mais Baratas (Graham)" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/ranking/buy-and-hold'" label="Buy and Hold" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/ranking/maiores-roe'" label="Maiores ROEs" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/ranking/maior-potencial-upside'" label="Maior Potencial de Upside" :is-sub="true" @click="closeMenu" />
            </MoleculesMobileMenuGroup>

            <MoleculesMobileMenuGroup
              v-if="brand.features?.showSectorComparatives"
              label="Setores"
              icon="i-lucide-layers"
              :child-paths="[
                '/setor',
                '/setor/real-estate/comparativo',
                '/setor/financial-services/comparativo',
                '/setor/consumer-cyclical/comparativo',
                '/setor/industrials/comparativo',
                '/setor/technology/comparativo',
                '/setor/healthcare/comparativo',
                '/setor/utilities/comparativo',
                '/setor/basic-materials/comparativo',
                '/setor/consumer-defensive/comparativo',
                '/setor/communication-services/comparativo',
                '/setor/energy/comparativo',
              ]"
            >
              <MoleculesMobileMenuItem :to="'/setor'" label="Ver todos" :is-sub="true" :exact="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/setor/real-estate/comparativo'" label="Imobiliário (FIIs)" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/setor/financial-services/comparativo'" label="Serviços financeiros" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/setor/consumer-cyclical/comparativo'" label="Consumo cíclico" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/setor/industrials/comparativo'" label="Industriais" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/setor/technology/comparativo'" label="Tecnologia" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/setor/healthcare/comparativo'" label="Saúde" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/setor/utilities/comparativo'" label="Utilidades públicas" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/setor/basic-materials/comparativo'" label="Materiais básicos" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/setor/consumer-defensive/comparativo'" label="Consumo defensivo" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/setor/communication-services/comparativo'" label="Comunicação" :is-sub="true" @click="closeMenu" />
              <MoleculesMobileMenuItem :to="'/setor/energy/comparativo'" label="Energia" :is-sub="true" @click="closeMenu" />
            </MoleculesMobileMenuGroup>

            <MoleculesMobileMenuItem :to="'/guias'" :icon="'i-lucide-book-open'" :label="brand.nav.guides || 'Guias'" @click="closeMenu" />
            <MoleculesMobileMenuItem
              v-if="brand.features?.showDividendCalendar"
              :to="'/dividendos/calendario'"
              :icon="'i-lucide-calendar'"
              label="Calendário de Dividendos"
              @click="closeMenu"
            />
          </section>

          <!-- ===== FOOTER (theme + logout) ===== -->
          <section class="mobile-menu__section mobile-menu__section--footer">
            <div class="mobile-menu__theme">
              <span class="mobile-menu__theme-label">Tema</span>
              <AtomsColorModeToggle size="labeled" />
            </div>
            <button
              type="button"
              class="mobile-menu__logout"
              @click="handleLogout"
            >
              <UIcon name="i-lucide-log-out" class="size-5" />
              {{ brand.nav.logout || 'Sair' }}
            </button>
          </section>
        </template>

        <!-- PUBLIC -->
        <template v-else>
          <section class="mobile-menu__section">
            <MoleculesMobileMenuItem
              v-for="link in publicLinks"
              :key="link.to"
              :to="link.to"
              :icon="link.icon"
              :label="link.label"
              @click="closeMenu"
            />
          </section>

          <NuxtLink to="/auth/login" class="mobile-menu__public-cta" @click="closeMenu">
            <span class="mobile-menu__public-cta-icon">
              <IconAi class="size-5 fill-current" />
            </span>
            <div class="mobile-menu__ai-text">
              <span class="mobile-menu__ai-eyebrow">{{ brand.nav.mobileAiLocked || 'Acesso liberado' }}</span>
              <span class="mobile-menu__ai-title">{{ brand.nav.login || 'Entrar' }}</span>
            </div>
            <UIcon name="i-lucide-arrow-up-right" class="mobile-menu__ai-arrow size-5" />
          </NuxtLink>

          <section class="mobile-menu__section mobile-menu__section--footer">
            <div class="mobile-menu__theme">
              <span class="mobile-menu__theme-label">Tema</span>
              <AtomsColorModeToggle size="labeled" />
            </div>
          </section>
        </template>
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
})

const brand = useBrand()
const authStore = useAuthStore()
const interfaceStore = useInterfaceStore()
const router = useRouter()
const entitlements = useEntitlements()

const isAuthenticated = computed(() => {
  if (props.mode === 'auth') return true
  if (props.mode === 'public') return false
  return authStore.isAuthenticated
})

const userName = computed(() => authStore.me?.name ?? 'Usuário')

// Plan badge — espelha logica do default.vue user-row.
const userPlan = computed<string | null>(() => entitlements.plan?.value ?? null)
const userPlanIsPro = computed(() => userPlan.value === 'pro')
const userPlanIsMax = computed(() => userPlan.value === 'max')
const userPlanDisplay = computed(() => {
  const p = userPlan.value
  if (p === 'max') return 'Max'
  if (p === 'pro') return 'Pro'
  return brand.sidebar?.planLabel || 'Plano gratuito'
})

const publicLinks = computed(() => {
  const f = brand.features ?? {}
  const links: Array<{ to: string; label: string; icon: string }> = [
    { to: '/', label: brand.nav.mobileHome || 'Início', icon: 'i-lucide-home' },
  ]
  // Master flag de rankings (Phase 6) com backward-compat.
  if (f.showRankings || f.showDividendYieldRanking || f.showMonthlyMoversRanking) {
    links.push({ to: '/ranking', label: 'Rankings', icon: 'i-lucide-trophy' })
  }
  if (f.showDividendCalendar) {
    links.push({ to: '/dividendos/calendario', label: 'Calendário de Dividendos', icon: 'i-lucide-calendar-days' })
  }
  if (f.showCalculators !== false) {
    links.push({ to: '/calculadora', label: brand.nav.calculators || 'Calculadoras', icon: 'i-lucide-calculator' })
  }
  if (f.showGuides !== false) {
    links.push({ to: '/guias', label: brand.nav.mobileGuides || 'Guias', icon: 'i-lucide-book-open' })
  }
  return links
})

function closeMenu() {
  open.value = false
}

async function handleLogout() {
  await authStore.logout()
  closeMenu()
  router.push('/auth/login')
}

// Body scroll lock quando o menu esta aberto. Sem isso o user pode
// scrollar o body por baixo do overlay no iOS Safari.
watch(open, (isOpen) => {
  if (typeof document === 'undefined') return
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}, { immediate: true })
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<style scoped>
.mobile-menu {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

/* ============ HEADER ============ */
.mobile-menu__head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid;
  background: var(--brand-background);
}
.mobile-menu__user {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.mobile-menu__avatar-wrap {
  position: relative;
  flex-shrink: 0;
  border-radius: 999px;
}
.mobile-menu__avatar-wrap--pro {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand-primary) 60%, transparent),
              0 6px 14px -6px color-mix(in srgb, var(--brand-primary) 50%, transparent);
}
.mobile-menu__avatar-wrap--max {
  box-shadow: 0 0 0 2px var(--brand-primary),
              0 0 0 6px color-mix(in srgb, var(--brand-primary) 25%, transparent),
              0 8px 20px -4px color-mix(in srgb, var(--brand-primary) 70%, transparent);
}

.mobile-menu__user-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.mobile-menu__user-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--brand-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mobile-menu__user-plan {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
.mobile-menu__user-plan--pro {
  color: var(--brand-primary);
}
.mobile-menu__user-plan--max {
  color: var(--brand-primary);
  text-shadow: 0 0 8px color-mix(in srgb, var(--brand-primary) 50%, transparent);
}
.mobile-menu__brand-eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}
.mobile-menu__brand-title {
  font-size: 15px;
  font-weight: 600;
}
.mobile-menu__head-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.mobile-menu__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
  transition: background-color 150ms, color 150ms, border-color 150ms;
  cursor: pointer;
}
.mobile-menu__icon-btn:hover,
.mobile-menu__icon-btn:active {
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  color: var(--brand-text);
  border-color: color-mix(in srgb, var(--brand-text) 22%, transparent);
}

/* ============ BODY ============ */
.mobile-menu__body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px 16px 32px;
  -webkit-overflow-scrolling: touch;
}

.mobile-menu__section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.mobile-menu__section--footer {
  margin-top: 12px;
  padding-top: 14px;
  border-top: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  gap: 12px;
}

.mobile-menu__eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  padding: 0 8px 4px;
}

/* ============ AI CTA ============ */
.mobile-menu__ai-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--brand-primary) 18%, transparent) 0%,
    color-mix(in srgb, var(--brand-primary) 4%, transparent) 100%);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 35%, transparent);
  text-decoration: none;
  color: var(--brand-text);
  transition: filter 150ms, transform 100ms;
  box-shadow: 0 14px 30px -16px color-mix(in srgb, var(--brand-primary) 50%, transparent);
}
.mobile-menu__ai-card:active {
  transform: scale(0.98);
  filter: brightness(0.95);
}
.mobile-menu__ai-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-primary) 22%, transparent);
  color: var(--brand-primary);
  flex-shrink: 0;
}
.mobile-menu__ai-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.mobile-menu__ai-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.mobile-menu__ai-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--brand-text);
}
.mobile-menu__ai-arrow {
  color: var(--brand-primary);
  flex-shrink: 0;
}

/* ============ PUBLIC CTA ============ */
.mobile-menu__public-cta {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  text-decoration: none;
  color: var(--brand-text);
  transition: filter 150ms, transform 100ms;
}
.mobile-menu__public-cta:active {
  transform: scale(0.98);
}
.mobile-menu__public-cta-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  flex-shrink: 0;
}

/* ============ THEME + LOGOUT ============ */
.mobile-menu__theme {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
}
.mobile-menu__theme-label {
  font-size: 13px;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}
.mobile-menu__logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 18px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--brand-negative, #ef4444) 30%, transparent);
  background: transparent;
  color: var(--brand-negative, #ef4444);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms;
}
.mobile-menu__logout:hover,
.mobile-menu__logout:active {
  background: color-mix(in srgb, var(--brand-negative, #ef4444) 10%, transparent);
}

/* ============ TRANSITIONS ============ */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 220ms ease, transform 240ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
