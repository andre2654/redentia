<template>
  <div class="flex w-full flex-col" :style="{ backgroundColor: brand.colors.surface, color: brand.colors.text }">
    <!-- CTA de Notificações (apenas no app e se não liberou) -->
    <div
      v-if="showNotificationCta"
      class="w-full bg-gradient-to-br from-secondary/10 to-secondary/5 py-6"
      :style="{ borderBottom: `1px solid ${brand.colors.border}` }"
    >
      <div class="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 max-md:flex-col">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-secondary/20">
            <UIcon name="i-lucide-bell" class="text-secondary h-6 w-6" />
          </div>
          <div class="flex flex-col">
            <h3 class="text-base font-semibold" :style="{ color: brand.colors.text }">
              {{ brand.notifications.ctaTitle }}
            </h3>
            <p class="text-sm" :style="{ color: brand.colors.textMuted }">
              {{ brand.notifications.ctaSubtitle }}
            </p>
          </div>
        </div>
        <UButton
          color="secondary"
          size="lg"
          icon="i-lucide-bell-ring"
          class="hover:shadow-secondary/50 max-md:w-full transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:scale-105 hover:shadow-xl"
          @click="handleRequestPermission"
        >
          {{ brand.notifications.ctaButton }}
        </UButton>
      </div>
    </div>

    <!-- Seção Termos do Mercado -->
    <div class="w-full py-12">
      <div class="mx-auto max-w-[1400px] px-4">
        <h2 class="mb-6 text-center text-2xl font-bold uppercase tracking-wide md:text-3xl" :style="{ color: brand.colors.text }">
          {{ brand.nav.footerGlossaryTitle }}
        </h2>
        <div class="flex flex-wrap items-center justify-center gap-3 text-lg font-semibold md:gap-5 md:text-xl">
          <NuxtLink
            to="/glossario"
            class="hover:text-secondary transition-colors"
          >
            #
          </NuxtLink>
          <NuxtLink
            v-for="letra in alfabeto"
            :key="letra"
            :to="`/glossario?letra=${letra}`"
            rel="nofollow"
            class="hover:text-secondary transition-colors"
          >
            {{ letra }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Links Categorizados (estilo Zapier) -->
    <div class="w-full py-12" :style="{ borderTop: `1px solid ${brand.colors.border}` }">
      <div class="mx-auto flex max-w-[1400px] flex-wrap justify-center gap-x-16 gap-y-10 px-6 text-center md:justify-between md:text-left lg:gap-x-24">
        <!-- Ferramentas -->
        <div class="flex flex-col items-center md:items-start">
          <h3 class="mb-5 text-sm font-semibold uppercase tracking-wider" :style="{ color: brand.colors.text }">
            {{ brand.footer.sections.tools }}
          </h3>
          <ul class="flex flex-col items-center gap-3 md:items-start">
            <li>
              <NuxtLink to="/calculadora" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                {{ brand.nav.footerCalc }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/calculadora/juros-compostos" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                {{ brand.nav.footerJuros }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/calculadora/preco-teto" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                {{ brand.nav.footerPrecoTeto }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/calculadora/dividend-yield" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                {{ brand.nav.footerDY }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/help" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                {{ brand.nav.footerAI }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Recursos -->
        <div class="flex flex-col items-center md:items-start">
          <h3 class="mb-5 text-sm font-semibold uppercase tracking-wider" :style="{ color: brand.colors.text }">
            {{ brand.footer.sections.resources }}
          </h3>
          <ul class="flex flex-col items-center gap-3 md:items-start">
            <li>
              <NuxtLink to="/guias" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                {{ brand.nav.footerGuides }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/glossario" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                {{ brand.nav.footerGlossary }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/acoes" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                {{ brand.nav.footerStocks }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/fiis" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                {{ brand.nav.footerFiis }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dividendos" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                {{ brand.nav.footerDividends }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Rankings, top-level entry point for /ranking hub -->
        <div class="flex flex-col items-center md:items-start">
          <h3 class="mb-5 text-sm font-semibold uppercase tracking-wider" :style="{ color: brand.colors.text }">
            Rankings
          </h3>
          <ul class="flex flex-col items-center gap-3 md:items-start">
            <li>
              <NuxtLink to="/ranking" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                Todos os rankings
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/ranking/maiores-dividend-yield" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                Maiores Dividend Yields
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/ranking/maiores-altas-mes" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                Maiores Altas do Mês
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/ranking/maiores-baixas-mes" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                Maiores Baixas do Mês
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dividendos/calendario" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                Calendário de Dividendos
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Empresa -->
        <div class="flex flex-col items-center md:items-start">
          <h3 class="mb-5 text-sm font-semibold uppercase tracking-wider" :style="{ color: brand.colors.text }">
            {{ brand.footer.sections.company }}
          </h3>
          <ul class="flex flex-col items-center gap-3 md:items-start">
            <li>
              <NuxtLink to="/institucional/about" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                {{ brand.nav.footerAbout }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/institucional/how-works" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                {{ brand.nav.footerHowWorks }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/institucional/contact" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                {{ brand.nav.footerContact }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/download" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                {{ brand.nav.footerDownload }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/whitelabel" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                White-Label
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Para Devs (apenas no tenant Redentia) -->
        <div v-if="brand.slug === 'redentia'" class="flex flex-col items-center md:items-start">
          <h3 class="mb-5 text-sm font-semibold uppercase tracking-wider" :style="{ color: brand.colors.text }">
            Para Devs
          </h3>
          <ul class="flex flex-col items-center gap-3 md:items-start">
            <li>
              <a href="https://api.redentia.com.br" target="_blank" rel="noopener" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                Redentia API
              </a>
            </li>
            <li>
              <a href="https://creative.redentia.com.br" target="_blank" rel="noopener" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                Creative Studio
              </a>
            </li>
            <li>
              <a href="https://whitelabel.redentia.com.br" target="_blank" rel="noopener" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                White-Label
              </a>
            </li>
            <li>
              <a href="https://estudo.redentia.com.br" target="_blank" rel="noopener" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                Estudos
              </a>
            </li>
            <li>
              <NuxtLink to="/api-portal/docs" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                Documentação
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Legal -->
        <div class="flex flex-col items-center md:items-start">
          <h3 class="mb-5 text-sm font-semibold uppercase tracking-wider" :style="{ color: brand.colors.text }">
            {{ brand.footer.sections.legal }}
          </h3>
          <ul class="flex flex-col items-center gap-3 md:items-start">
            <li>
              <NuxtLink to="/institucional/terms" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                {{ brand.nav.footerTerms }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/institucional/privacy" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                {{ brand.nav.footerPrivacy }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/institucional/cookies" class="text-sm transition-colors hover:text-secondary" :style="{ color: brand.colors.textMuted }">
                {{ brand.nav.footerCookies }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!-- Logo e Copyright -->
    <div
      class="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-6 pb-[105px] pt-8 max-lg:items-center"
      :style="{ borderTop: `1px solid ${brand.colors.border}` }"
    >
      <div class="flex w-full items-start justify-between max-lg:flex-col max-lg:items-center max-lg:gap-6">
        <div class="flex flex-col gap-4 max-lg:items-center">
          <NuxtLink to="/">
            <BrandLogo variant="full" class="w-[150px]" />
          </NuxtLink>
          <p class="text-[12px] max-lg:text-center" :style="{ color: brand.colors.textMuted }">
            {{ brand.tagline }}
          </p>
        </div>
        
        <div class="flex items-center gap-3">
          <NuxtLink to="/download" class="transition-opacity hover:opacity-80">
            <img
              src="/assets/icons/app-store.svg"
              alt="Download on the App Store"
              class="h-[38px] w-auto"
            />
          </NuxtLink>
          <NuxtLink to="/download" class="transition-opacity hover:opacity-80">
            <img
              src="/assets/icons/google-play.svg"
              alt="Get it on Google Play"
              class="h-[38px] w-auto"
            />
          </NuxtLink>
        </div>
      </div>
      
      <div class="flex w-full items-center justify-between pt-6 max-lg:flex-col max-lg:gap-4" :style="{ borderTop: `1px solid ${brand.colors.border}` }">
        <p class="text-[12px] max-lg:text-center" :style="{ color: brand.colors.textMuted }">
          © {{ new Date().getFullYear() }} {{ brand.name }}. {{ brand.nav.footerCopyright }}
        </p>
        <p v-if="brand.company.address" class="text-[11px] max-lg:text-center" :style="{ color: brand.colors.textMuted }">
          {{ brand.company.address }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const brand = useBrand()
const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const route = useRoute()
const { checkPermission, requestPermission, permissionStatus } =
  useFirebaseNotifications()

// Verificar se está no app instalado
const isAppInstalled = computed(() => {
  if (!import.meta.client) return false
  
  const standalone =
    window.matchMedia?.('(display-mode: standalone)')?.matches ?? false
  const iosStandalone = (window.navigator as any).standalone === true
  
  return standalone || iosStandalone
})

// Mostrar CTA apenas se está no app E permissão não foi concedida
const showNotificationCta = computed(() => {
  return (
    import.meta.client &&
    isAppInstalled.value &&
    permissionStatus.value === 'default'
  )
})

async function handleRequestPermission() {
  await requestPermission()
}

onMounted(() => {
  if (import.meta.client) {
    checkPermission()
  }
})
</script>

