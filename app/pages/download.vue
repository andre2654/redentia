<template>
  <div
    class="dl-root relative min-h-screen overflow-hidden"
    :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
  >
    <!-- Atmospheric background -->
    <div class="pointer-events-none absolute inset-0">
      <div
        class="absolute -top-40 left-1/2 h-[800px] w-[1200px] -translate-x-1/2 rounded-full blur-3xl opacity-30"
        :style="{ background: `radial-gradient(ellipse at center, ${brand.colors.primary}, transparent 65%)` }"
      />
      <div
        class="absolute -right-40 top-[40%] h-[600px] w-[600px] rounded-full blur-3xl opacity-15"
        :style="{ background: `radial-gradient(circle, ${brand.colors.primary}, transparent 65%)` }"
      />
      <div
        class="absolute inset-0 opacity-[0.06]"
        :style="{
          backgroundImage: `radial-gradient(${brand.colors.text} 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
        }"
      />
    </div>

    <!-- ============================================================
         HEADER
         ============================================================ -->
    <header
      class="sticky top-0 z-50 border-b backdrop-blur-xl"
      :style="{ borderColor: `${brand.colors.border}80`, backgroundColor: `${brand.colors.background}D0` }"
    >
      <div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 md:px-10">
        <NuxtLink to="/" class="flex items-center gap-3">
          <BrandLogo variant="full" class="h-7 w-auto" />
        </NuxtLink>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-medium transition-colors hover:opacity-80"
          :style="{ borderColor: brand.colors.border, color: brand.colors.text }"
        >
          <UIcon name="i-lucide-arrow-left" class="size-3.5" />
          Voltar
        </NuxtLink>
      </div>
    </header>

    <!-- ============================================================
         HERO, text + iPhone mockup side-by-side
         ============================================================ -->
    <section class="relative">
      <div class="mx-auto grid max-w-7xl grid-cols-12 items-center gap-10 px-6 pb-24 pt-16 md:gap-16 md:px-10 md:pb-32 md:pt-24 lg:gap-20">
        <!-- LEFT: editorial copy -->
        <div class="col-span-12 lg:col-span-7">
          <!-- Status pill -->
          <div
            class="mb-7 inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5"
            :style="{ borderColor: `${brand.colors.primary}50`, backgroundColor: `${brand.colors.primary}10` }"
          >
            <span class="relative flex size-1.5">
              <span class="absolute inline-flex size-1.5 motion-safe:animate-ping rounded-full opacity-75" :style="{ backgroundColor: brand.colors.primary }" />
              <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
            </span>
            <span class="text-[11px] font-medium uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
              PWA · iOS · Android · Desktop
            </span>
          </div>

          <!-- Title -->
          <h1
            class="mb-7 leading-[0.88] tracking-tighter"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(3rem, 8vw, 7rem)',
              fontFamily: brand.font?.family ? `'${brand.font.family}', serif` : undefined,
            }"
          >
            {{ brand.shortName }} no<br />
            <span class="italic" :style="{ color: brand.colors.primary }">seu bolso.</span>
          </h1>

          <p class="mb-10 max-w-xl text-[17px] leading-[1.55] md:text-[19px]" :style="{ color: `${brand.colors.text}D0` }">
            Instale como app no seu iPhone, Android ou desktop. <strong :style="{ color: brand.colors.text }">Sem App Store, sem download de 200MB.</strong> O site vira aplicativo em 5 segundos, com ícone na tela inicial, notificações push e modo offline.
          </p>

          <!-- CTAs -->
          <div class="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <button
              class="group inline-flex items-center gap-3 rounded-full px-8 py-4 text-[14px] font-semibold transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5"
              :style="{
                backgroundColor: brand.colors.primary,
                color: brand.colors.background,
                boxShadow: `0 16px 50px -16px ${brand.colors.primary}A0`,
              }"
              @click="installApp"
            >
              <UIcon name="i-lucide-download" class="size-4" />
              Instalar agora
              <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
            </button>
            <button
              class="inline-flex items-center gap-2 px-2 py-2 text-[14px] font-medium transition-opacity hover:opacity-70"
              :style="{ color: brand.colors.text }"
              @click="scrollToHowTo"
            >
              <span class="border-b pb-0.5" :style="{ borderColor: brand.colors.text }">Como funciona</span>
              <span>↓</span>
            </button>
          </div>

          <!-- Quick benefit row -->
          <div class="grid grid-cols-3 gap-6 border-t pt-8" :style="{ borderColor: `${brand.colors.border}80` }">
            <div class="flex flex-col gap-1">
              <div class="text-[20px]" :style="{ color: brand.colors.primary }">⚡</div>
              <div class="text-[13px] font-medium" :style="{ color: brand.colors.text }">Abre na hora</div>
              <div class="text-[12px]" :style="{ color: brand.colors.textMuted }">Zero loading</div>
            </div>
            <div class="flex flex-col gap-1">
              <div class="text-[20px]" :style="{ color: brand.colors.primary }">📡</div>
              <div class="text-[13px] font-medium" :style="{ color: brand.colors.text }">Modo offline</div>
              <div class="text-[12px]" :style="{ color: brand.colors.textMuted }">Funciona sem net</div>
            </div>
            <div class="flex flex-col gap-1">
              <div class="text-[20px]" :style="{ color: brand.colors.primary }">🔔</div>
              <div class="text-[13px] font-medium" :style="{ color: brand.colors.text }">Push real</div>
              <div class="text-[12px]" :style="{ color: brand.colors.textMuted }">Tipo iMessage</div>
            </div>
          </div>
        </div>

        <!-- RIGHT: iPhone mockup -->
        <div class="col-span-12 flex justify-center lg:col-span-5">
          <div class="iphone-frame relative">
            <!-- iPhone bezel -->
            <div
              class="iphone-bezel relative overflow-hidden"
              :style="{
                backgroundColor: '#0a0a0c',
                border: '12px solid #1a1a1d',
                borderRadius: '54px',
                boxShadow: `0 60px 120px -30px rgba(0,0,0,0.8), 0 0 0 2px rgba(255,255,255,0.05), 0 30px 80px -20px ${brand.colors.primary}30`,
                width: '320px',
                height: '660px',
              }"
            >
              <!-- Dynamic island -->
              <div
                class="absolute left-1/2 top-3 z-30 -translate-x-1/2"
                style="width: 110px; height: 32px; background: #000; border-radius: 20px;"
              />

              <!-- Wallpaper gradient -->
              <div
                class="absolute inset-0"
                :style="{
                  background: `linear-gradient(180deg, ${brand.colors.background} 0%, ${brand.colors.surface || brand.colors.background} 100%)`,
                }"
              />
              <div
                class="absolute inset-0 opacity-50"
                :style="{ background: `radial-gradient(ellipse at 50% 30%, ${brand.colors.primary}40, transparent 60%)` }"
              />

              <!-- Status bar -->
              <div class="relative z-20 flex items-center justify-between px-7 pt-2.5 text-[11px] font-semibold" style="color: #fff;">
                <span class="font-mono-tab">9:41</span>
                <span class="flex items-center gap-1">
                  <UIcon name="i-lucide-signal" class="size-3" />
                  <UIcon name="i-lucide-wifi" class="size-3" />
                  <span class="ml-1 rounded-sm border border-white px-1 py-0.5 text-[8px] font-bold">100</span>
                </span>
              </div>

              <!-- Lock-screen content: notification + brand -->
              <div class="relative z-10 flex h-full flex-col px-5 pt-12">
                <!-- Date/time stack like iOS lock screen -->
                <div class="mb-3 text-center" style="color: #fff;">
                  <div class="text-[12px] font-medium uppercase tracking-wider opacity-80">
                    {{ todayShort }}
                  </div>
                  <div class="text-[64px] font-thin leading-none" style="font-family: 'SF Pro Display', -apple-system, sans-serif;">
                    9:41
                  </div>
                </div>

                <!-- Notification card glassy -->
                <div
                  class="relative mt-10 overflow-hidden rounded-2xl px-3 py-3"
                  style="background: rgba(40,40,45,0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08);"
                >
                  <div class="flex items-start gap-2.5">
                    <div
                      class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md"
                      :style="{ backgroundColor: brand.colors.primary }"
                    >
                      <!-- Pill is always primary regardless of theme, so
                           force the dark-surface variant which is the
                           light-coloured icon. -->
                      <BrandLogo variant="icon" mode="dark" class="size-5" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-[11px] font-semibold uppercase tracking-wider" style="color: #fff;">
                          {{ brand.shortName }}
                        </span>
                        <span class="text-[10px]" style="color: rgba(255,255,255,0.6);">agora</span>
                      </div>
                      <div class="mt-0.5 text-[12px] font-semibold leading-snug" style="color: #fff;">
                        PETR4 +4,2% · novo dividendo
                      </div>
                      <div class="text-[11px] leading-snug" style="color: rgba(255,255,255,0.7);">
                        Petrobras anunciou R$ 1,02/ação. Pagamento em 28/abr.
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Second notification -->
                <div
                  class="relative mt-2 overflow-hidden rounded-2xl px-3 py-3"
                  style="background: rgba(40,40,45,0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06);"
                >
                  <div class="flex items-start gap-2.5">
                    <div
                      class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md"
                      :style="{ backgroundColor: brand.colors.primary }"
                    >
                      <!-- Pill is always primary regardless of theme, so
                           force the dark-surface variant which is the
                           light-coloured icon. -->
                      <BrandLogo variant="icon" mode="dark" class="size-5" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-[11px] font-semibold uppercase tracking-wider" style="color: #fff;">
                          {{ brand.shortName }}
                        </span>
                        <span class="text-[10px]" style="color: rgba(255,255,255,0.6);">5 min</span>
                      </div>
                      <div class="mt-0.5 text-[12px] font-semibold leading-snug" style="color: #fff;">
                        IBOV bate 132.000 pts
                      </div>
                      <div class="text-[11px] leading-snug" style="color: rgba(255,255,255,0.7);">
                        Fechou em alta de 1,8%. Veja os destaques do pregão.
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Bottom: home indicator -->
                <div class="mt-auto flex items-center justify-center pb-3">
                  <div class="h-1 w-32 rounded-full bg-white/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
         BENEFITS, 3 cards
         ============================================================ -->
    <section
      class="relative border-t"
      :style="{ borderColor: `${brand.colors.border}`, backgroundColor: `${brand.colors.surface || brand.colors.background}80` }"
    >
      <div class="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div class="mb-16 max-w-3xl">
          <div class="text-[12px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">, Por que instalar</div>
          <h2
            class="mt-4 leading-[0.95] tracking-tight"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(2.25rem, 5vw, 4rem)',
            }"
          >
            Não é app. <span class="italic" :style="{ color: brand.colors.primary }">É melhor.</span>
          </h2>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          <div
            v-for="(benefit, idx) in benefits"
            :key="benefit.title"
            class="group flex flex-col gap-5 rounded-3xl border p-8 md:p-10 transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-1"
            :style="{
              borderColor: brand.colors.border,
              backgroundColor: idx === 1 ? `${brand.colors.primary}08` : brand.colors.background,
            }"
          >
            <div
              class="flex size-14 items-center justify-center rounded-2xl"
              :style="{ backgroundColor: `${brand.colors.primary}20`, color: brand.colors.primary }"
            >
              <UIcon :name="benefit.icon" class="size-7" />
            </div>
            <h3 class="text-[22px] font-medium leading-tight tracking-tight" :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }">
              {{ benefit.title }}
            </h3>
            <p class="text-[14px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
              {{ benefit.description }}
            </p>
            <div class="mt-2 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.15em]" :style="{ color: brand.colors.primary }">
              <span>{{ benefit.tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
         INSTALLATION GUIDE, 3 platforms
         ============================================================ -->
    <section
      ref="howToSection"
      class="relative border-t"
      :style="{ borderColor: brand.colors.border }"
    >
      <div class="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div class="mb-16 text-center">
          <div class="text-[12px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">, Como instalar</div>
          <h2
            class="mx-auto mt-4 max-w-3xl leading-[0.95] tracking-tight"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(2.25rem, 5vw, 4rem)',
            }"
          >
            Em 30 segundos. <span class="italic" :style="{ color: brand.colors.primary }">No seu device.</span>
          </h2>
        </div>

        <!-- Platform tabs -->
        <div class="mb-10 flex flex-wrap items-center justify-center gap-2">
          <button
            v-for="p in platforms"
            :key="p.id"
            class="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[13px] font-medium transition-[transform,opacity,box-shadow,background-color,border-color,filter]"
            :class="{ 'shadow-lg': activePlatform === p.id }"
            :style="{
              borderColor: activePlatform === p.id ? brand.colors.primary : brand.colors.border,
              backgroundColor: activePlatform === p.id ? brand.colors.primary : 'transparent',
              color: activePlatform === p.id ? brand.colors.background : brand.colors.text,
            }"
            @click="activePlatform = p.id"
          >
            <UIcon :name="p.icon" class="size-4" />
            {{ p.label }}
          </button>
        </div>

        <!-- Active platform steps -->
        <div
          class="mx-auto max-w-4xl rounded-3xl border p-8 md:p-12"
          :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.surface || brand.colors.background}80` }"
        >
          <div class="grid gap-6 md:grid-cols-3 md:gap-8">
            <div
              v-for="(step, idx) in currentSteps"
              :key="step.title"
              class="relative flex flex-col gap-4"
            >
              <div class="flex items-center gap-4">
                <div
                  class="flex size-12 items-center justify-center rounded-full border-2 text-[18px] font-medium tabular-nums"
                  :style="{ borderColor: brand.colors.primary, color: brand.colors.primary }"
                >
                  {{ idx + 1 }}
                </div>
                <div class="hidden h-px flex-1 md:block" :style="{ backgroundColor: brand.colors.border }" />
              </div>
              <h3 class="text-[17px] font-medium leading-tight" :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }">
                {{ step.title }}
              </h3>
              <p class="text-[13px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
                {{ step.description }}
              </p>
            </div>
          </div>

          <div v-if="activePlatform === 'android' || activePlatform === 'desktop'" class="mt-10 flex justify-center">
            <button
              class="group inline-flex items-center gap-3 rounded-full px-8 py-4 text-[13px] font-semibold transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5"
              :style="{
                backgroundColor: brand.colors.primary,
                color: brand.colors.background,
                boxShadow: `0 12px 40px -12px ${brand.colors.primary}A0`,
              }"
              @click="installApp"
            >
              <UIcon name="i-lucide-download" class="size-4" />
              Instalar {{ brand.shortName }} agora
              <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
          <div v-else class="mt-10 flex items-center justify-center gap-3 rounded-2xl border px-5 py-4 text-[13px]" :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }">
            <UIcon name="i-lucide-info" class="size-4 shrink-0" :style="{ color: brand.colors.primary }" />
            No iPhone, a instalação é manual via Safari. Siga os 3 passos acima.
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
         FAQ
         ============================================================ -->
    <section
      class="relative border-t"
      :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.surface || brand.colors.background}60` }"
    >
      <div class="mx-auto max-w-4xl px-6 py-24 md:px-10 md:py-28">
        <div class="mb-12">
          <div class="text-[12px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">, Perguntas frequentes</div>
          <h2
            class="mt-4 leading-[0.95] tracking-tight"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            }"
          >
            Antes de instalar.
          </h2>
        </div>

        <div class="grid gap-3">
          <details
            v-for="faq in faqs"
            :key="faq.q"
            class="group rounded-2xl border p-6 transition-colors"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background }"
          >
            <summary class="flex cursor-pointer items-center justify-between gap-4 text-[15px] font-medium" :style="{ color: brand.colors.text }">
              {{ faq.q }}
              <span class="text-[20px] transition-transform group-open:rotate-45" :style="{ color: brand.colors.primary }">+</span>
            </summary>
            <p class="mt-4 text-[14px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
              {{ faq.a }}
            </p>
          </details>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup lang="ts">
const brand = useBrand()

const howToSection = ref<HTMLElement | null>(null)
const activePlatform = ref<'iphone' | 'android' | 'desktop'>('iphone')

const platforms = [
  { id: 'iphone', label: 'iPhone / iPad', icon: 'i-lucide-apple' },
  { id: 'android', label: 'Android', icon: 'i-lucide-smartphone' },
  { id: 'desktop', label: 'Desktop', icon: 'i-lucide-monitor' },
] as const

const stepsByPlatform = {
  iphone: [
    {
      title: 'Abra no Safari',
      description: 'Acesse redentia.com.br no Safari (não funciona no Chrome no iOS, é regra da Apple).',
    },
    {
      title: 'Toque em Compartilhar',
      description: 'Botão de compartilhamento na barra inferior do Safari. Em seguida toque em "Adicionar à Tela de Início".',
    },
    {
      title: 'Confirme',
      description: 'Toque em "Adicionar" no canto superior. O ícone aparece na sua tela inicial como qualquer app.',
    },
  ],
  android: [
    {
      title: 'Abra no Chrome',
      description: 'Acesse a Redentia pelo Google Chrome no seu Android.',
    },
    {
      title: 'Toque em Instalar',
      description: 'Use o botão abaixo ou aceite o popup do Chrome ("Instalar app").',
    },
    {
      title: 'Pronto',
      description: 'O ícone vai pra sua tela inicial. Abre como app, sem barra de endereço.',
    },
  ],
  desktop: [
    {
      title: 'Abra no Chrome ou Edge',
      description: 'Funciona em qualquer Chromium, Chrome, Edge, Brave, Arc.',
    },
    {
      title: 'Toque em Instalar',
      description: 'Use o botão abaixo ou clique no ícone de instalar na barra de endereço (à direita).',
    },
    {
      title: 'App nativo',
      description: 'Vira um app real na sua dock/menu iniciar. Janela própria, sem distrações.',
    },
  ],
}

const currentSteps = computed(() => stepsByPlatform[activePlatform.value])

const benefits = [
  {
    icon: 'i-lucide-zap',
    title: 'Abre na velocidade da luz',
    description: 'Cache local + assets pré-carregados. Quando você toca no ícone, a home já está pronta. Sem splash screen, sem loading.',
    tag: '< 200ms',
  },
  {
    icon: 'i-lucide-bell-ring',
    title: 'Notificações de verdade',
    description: 'Push real do iOS/Android, não é alerta de browser. Alertas de dividendos, preços-alvo e fatos relevantes chegam mesmo com o app fechado.',
    tag: 'NATIVO',
  },
  {
    icon: 'i-lucide-cloud-off',
    title: 'Funciona offline',
    description: 'Sua carteira, cotações recentes e calculadoras ficam disponíveis mesmo sem internet. Quando reconectar, sincroniza tudo sozinho.',
    tag: 'PWA',
  },
]

const faqs = [
  {
    q: 'Por que não tem na App Store?',
    a: 'Porque a Redentia é uma PWA (Progressive Web App). Você instala direto do navegador, sem precisar passar pela App Store nem pela Google Play. Atualizações são instantâneas, quando a gente lança novidade, você já tem.',
  },
  {
    q: 'É seguro?',
    a: 'Mais seguro que app nativo. Roda no navegador (sandbox completo), não pede permissões absurdas, não acessa contatos, não rastreia localização. E todo tráfego é HTTPS criptografado.',
  },
  {
    q: 'Ocupa muito espaço?',
    a: 'Menos de 5MB. Comparado a 200MB+ de apps de banco/corretora, é praticamente nada. Cabe em qualquer celular, mesmo os mais antigos.',
  },
  {
    q: 'Funciona em qualquer celular?',
    a: 'Sim. Qualquer iPhone com iOS 12+ ou Android com Chrome moderno (últimos 5 anos). Em desktop funciona em Chrome, Edge, Brave, Arc, Opera.',
  },
  {
    q: 'Posso desinstalar depois?',
    a: 'Igual qualquer app. Aperta e segura o ícone, escolhe "Remover". Os dados ficam sincronizados na sua conta, então se você reinstalar tudo volta.',
  },
]

const todayShort = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
})

const installApp = () => {
  const pwa = usePWA()
  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream

  if (isIOS) {
    activePlatform.value = 'iphone'
    scrollToHowTo()
    return
  }

  if (!pwa) {
    activePlatform.value = 'desktop'
    scrollToHowTo()
    return
  }

  if (!pwa.isPWAInstalled) {
    pwa.install?.()
  } else {
    navigateTo('/')
  }
}

const scrollToHowTo = () => {
  howToSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: `Baixe o app ${brand.name} | Investimentos com IA no seu celular`,
  description: `Instale o aplicativo ${brand.name} como PWA no seu iPhone, Android ou desktop. Sem App Store, sem download de 200MB. Notificações push, modo offline e abertura instantânea.`,
  path: '/download',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Download', path: '/download' },
  ],
})
</script>

<style scoped>
.dl-root {
  font-feature-settings: 'ss01', 'cv11';
}

/* iPhone subtle floating animation */
@keyframes phone-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.iphone-frame {
  animation: phone-float 6s ease-in-out infinite;
  perspective: 1200px;
}

.iphone-bezel {
  transform: rotate(-3deg);
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.iphone-frame:hover .iphone-bezel {
  transform: rotate(0deg) scale(1.02);
}

/* Smooth focus rings */
.dl-root a:focus-visible,
.dl-root button:focus-visible {
  outline: 2px solid var(--brand-primary, #F5A623);
  outline-offset: 4px;
  border-radius: 8px;
}

.dl-root [open] summary {
  margin-bottom: 0;
}
</style>
