<template>
  <div class="flex w-full flex-col" :style="{ backgroundColor: 'var(--brand-surface)', color: 'var(--brand-text)' }">
    <!-- CTA de Notificações (apenas no app e se não liberou) -->
    <div
      v-if="showNotificationCta"
      class="w-full bg-gradient-to-br from-secondary/10 to-secondary/5 py-6"
      :style="{ borderBottom: `1px solid var(--brand-border)` }"
    >
      <div class="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 max-md:flex-col">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-secondary/20">
            <UIcon name="i-lucide-bell" class="text-secondary h-6 w-6" />
          </div>
          <div class="flex flex-col">
            <h3 class="text-base font-semibold" :style="{ color: 'var(--brand-text)' }">
              {{ brand.notifications.ctaTitle }}
            </h3>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">
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
        <h2 class="mb-6 text-center text-2xl uppercase tracking-wide md:text-3xl" :style="{ color: 'var(--brand-text)' }">
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
    <div class="w-full py-12" :style="{ borderTop: `1px solid var(--brand-border)` }">
      <div class="mx-auto flex max-w-[1400px] flex-wrap justify-center gap-x-16 gap-y-10 px-6 text-center md:justify-between md:text-left lg:gap-x-24">
        <!-- Ferramentas -->
        <div class="flex flex-col items-center md:items-start">
          <h3 class="mb-5 text-sm font-semibold uppercase tracking-wider" :style="{ color: 'var(--brand-text)' }">
            {{ brand.footer.sections.tools }}
          </h3>
          <ul class="flex flex-col items-center gap-3 md:items-start">
            <li>
              <NuxtLink to="/calculadora" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                {{ brand.nav.footerCalc }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/calculadora/juros-compostos" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                {{ brand.nav.footerJuros }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/calculadora/preco-teto" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                {{ brand.nav.footerPrecoTeto }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/calculadora/dividend-yield" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                {{ brand.nav.footerDY }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/help" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                {{ brand.nav.footerAI }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Recursos -->
        <div class="flex flex-col items-center md:items-start">
          <h3 class="mb-5 text-sm font-semibold uppercase tracking-wider" :style="{ color: 'var(--brand-text)' }">
            {{ brand.footer.sections.resources }}
          </h3>
          <ul class="flex flex-col items-center gap-3 md:items-start">
            <li>
              <NuxtLink to="/guias" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                {{ brand.nav.footerGuides }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/glossario" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                {{ brand.nav.footerGlossary }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/acoes" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                {{ brand.nav.footerStocks }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/fiis" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                {{ brand.nav.footerFiis }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dividendos" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                {{ brand.nav.footerDividends }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Rankings, top-level entry point for /ranking hub -->
        <div class="flex flex-col items-center md:items-start">
          <h3 class="mb-5 text-sm font-semibold uppercase tracking-wider" :style="{ color: 'var(--brand-text)' }">
            Rankings
          </h3>
          <ul class="flex flex-col items-center gap-3 md:items-start">
            <li>
              <NuxtLink to="/ranking" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                Todos os rankings
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/ranking/maiores-dividend-yield" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                Maiores Dividend Yields
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/ranking/maiores-altas-mes" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                Maiores Altas do Mês
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/ranking/maiores-baixas-mes" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                Maiores Baixas do Mês
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dividendos/calendario" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                Calendário de Dividendos
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Empresa -->
        <div class="flex flex-col items-center md:items-start">
          <h3 class="mb-5 text-sm font-semibold uppercase tracking-wider" :style="{ color: 'var(--brand-text)' }">
            {{ brand.footer.sections.company }}
          </h3>
          <ul class="flex flex-col items-center gap-3 md:items-start">
            <li>
              <NuxtLink to="/institucional/about" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                {{ brand.nav.footerAbout }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/institucional/how-works" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                {{ brand.nav.footerHowWorks }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/institucional/contact" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                {{ brand.nav.footerContact }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/download" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                {{ brand.nav.footerDownload }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/whitelabel" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                White-Label
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Para Devs (apenas no tenant Redentia) -->
        <div v-if="brand.slug === 'redentia'" class="flex flex-col items-center md:items-start">
          <h3 class="mb-5 text-sm font-semibold uppercase tracking-wider" :style="{ color: 'var(--brand-text)' }">
            Para Devs
          </h3>
          <ul class="flex flex-col items-center gap-3 md:items-start">
            <li>
              <a href="https://api.redentia.com.br" target="_blank" rel="noopener" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                Redentia API
              </a>
            </li>
            <li>
              <a href="https://creative.redentia.com.br" target="_blank" rel="noopener" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                Creative Studio
              </a>
            </li>
            <li>
              <a href="https://whitelabel.redentia.com.br" target="_blank" rel="noopener" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                White-Label
              </a>
            </li>
            <li>
              <a href="https://estudo.redentia.com.br" target="_blank" rel="noopener" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                Estudos
              </a>
            </li>
            <li>
              <NuxtLink to="/api-portal/docs" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                Documentação
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Legal -->
        <div class="flex flex-col items-center md:items-start">
          <h3 class="mb-5 text-sm font-semibold uppercase tracking-wider" :style="{ color: 'var(--brand-text)' }">
            {{ brand.footer.sections.legal }}
          </h3>
          <ul class="flex flex-col items-center gap-3 md:items-start">
            <li>
              <NuxtLink to="/institucional/terms" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                {{ brand.nav.footerTerms }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/institucional/privacy" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
                {{ brand.nav.footerPrivacy }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/institucional/cookies" class="text-sm transition-colors hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
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
      :style="{ borderTop: `1px solid var(--brand-border)` }"
    >
      <div class="flex w-full items-start justify-between max-lg:flex-col max-lg:items-center max-lg:gap-6">
        <div class="flex flex-col gap-4 max-lg:items-center">
          <NuxtLink to="/">
            <BrandLogo variant="full" class="w-[150px]" />
          </NuxtLink>
          <p class="text-[12px] max-lg:text-center" :style="{ color: 'var(--brand-text-muted)' }">
            {{ brand.tagline }}
          </p>
          <!-- Contatos da Redentia — so renderizam no tenant Redentia.
               WhatsApp via wa.me sem + e com country code 55. Email
               via mailto: pra abrir o cliente nativo do user. -->
          <div v-if="brand.slug === 'redentia'" class="flex flex-col gap-2.5 max-lg:items-center">
            <a
              href="https://wa.me/551153042570"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-2 text-[13px] font-medium transition-opacity hover:opacity-80"
              :style="{ color: 'var(--brand-text)' }"
            >
              <span
                class="flex size-7 items-center justify-center rounded-full"
                style="background: #25d366; color: #fff;"
                aria-hidden="true"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.4 1 2.8 1.2 3c.1.2 2 3.1 4.9 4.4.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4M12 21.7c-1.7 0-3.4-.5-4.9-1.3l-3.5.9.9-3.4C3.5 16 3 14.1 3 12.2 3 7.2 7.1 3.1 12 3.1S21 7.2 21 12.2 16.9 21.7 12 21.7M12 1c-6.1 0-11 4.9-11 11 0 1.9.5 3.7 1.4 5.4L1 23l5.7-1.4c1.6.9 3.4 1.4 5.3 1.4 6.1 0 11-4.9 11-11S18.1 1 12 1z"/></svg>
              </span>
              <span class="flex flex-col leading-tight">
                <span class="text-[10px] uppercase tracking-[0.14em]" :style="{ color: 'var(--brand-text-muted)' }">WhatsApp</span>
                <span class="font-mono-tab tabular-nums">+55 11 5304-2570</span>
              </span>
            </a>

            <a
              href="mailto:contato@redentia.com.br"
              class="inline-flex items-center gap-2 text-[13px] font-medium transition-opacity hover:opacity-80"
              :style="{ color: 'var(--brand-text)' }"
            >
              <span
                class="flex size-7 items-center justify-center rounded-full"
                :style="{ background: 'var(--brand-primary)', color: 'var(--text-on-primary, var(--brand-background, #fff))' }"
                aria-hidden="true"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </span>
              <span class="flex flex-col leading-tight">
                <span class="text-[10px] uppercase tracking-[0.14em]" :style="{ color: 'var(--brand-text-muted)' }">Email</span>
                <span>contato@redentia.com.br</span>
              </span>
            </a>
          </div>
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
      
      <div class="flex w-full items-center justify-between pt-6 max-lg:flex-col max-lg:gap-4" :style="{ borderTop: `1px solid var(--brand-border)` }">
        <div
          class="flex flex-wrap items-center gap-x-4 gap-y-3 text-[12px] max-lg:justify-center max-lg:text-center"
          :style="{ color: 'var(--brand-text-muted)' }"
        >
          <span>
            © {{ new Date().getFullYear() }} {{ brand.name }}. {{ brand.nav.footerCopyright }}
          </span>
          <!-- "Report a problem" rendered as a button-shaped chip with
               bug icon. Sits inline with the copyright row at the
               bottom of the footer; the chip's pill shape separates
               it visually from the copyright text without needing a
               glyph divider. Owns its own modal state. -->
          <AtomsReportProblemTrigger variant="chip" size="md">
            Reportar problema
          </AtomsReportProblemTrigger>
        </div>
        <p v-if="brand.company.address" class="text-[11px] max-lg:text-center" :style="{ color: 'var(--brand-text-muted)' }">
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

