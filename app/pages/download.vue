<template>
  <div class="min-h-screen bg-white dark:bg-black">
    <!-- Header / Nav -->
    <header class="flex items-center justify-center py-6 md:py-8">
      <NuxtLink to="/" class="transition-transform hover:scale-105">
        <IconLogoFull class="h-8 w-auto fill-black md:h-10 dark:fill-white" />
      </NuxtLink>
    </header>

    <!-- Mockup Image -->
    <img
      src="/assets/images/mockup-app.png"
      alt="App Redentia Mockup"
      class="mt-10 w-full"
    />
    <div
      class="mx-auto max-w-[1400px] min-[1400px]:border-x min-[1400px]:border-gray-100 dark:min-[1400px]:border-white/10"
    >
      <!-- Hero Section -->
      <section class="relative overflow-hidden px-4 pb-12 pt-6 md:pt-12">
        <div
          class="from-secondary/10 absolute inset-0 bg-gradient-to-b to-transparent dark:from-white/5"
        />

        <div
          class="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center"
        >
          <h1
            class="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl"
          >
            Seus investimentos, agora no seu bolso
          </h1>

          <p
            class="mb-10 max-w-2xl text-lg text-gray-600 md:text-xl dark:text-gray-300"
          >
            A única plataforma de finanças realmente inteligente. Gerencie
            ações, FIIs e sua carteira com IA, onde quer que você esteja.
          </p>

          <div class="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <UButton
              size="xl"
              color="black"
              class="dark:bg-white dark:text-black dark:hover:bg-gray-200"
              icon="i-lucide-smartphone"
              @click="scrollToInstall('android')"
            >
              Baixar para Android
            </UButton>
            <UButton
              size="xl"
              color="white"
              variant="outline"
              icon="i-lucide-apple"
              @click="scrollToInstall('ios')"
            >
              Baixar para iOS
            </UButton>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="bg-gray-50 px-4 py-20 dark:bg-white/5">
        <div class="mx-auto max-w-6xl">
          <div class="mb-16 text-center">
            <h2
              class="text-3xl font-bold text-gray-900 md:text-4xl dark:text-white"
            >
              Por que usar o App Redentia?
            </h2>
            <p class="mt-4 text-gray-600 dark:text-gray-400">
              Uma experiência completa, rápida e segura no seu celular.
            </p>
          </div>

          <div class="grid gap-8 md:grid-cols-3">
            <div
              class="group rounded-3xl bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:bg-white/5"
            >
              <div
                class="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
              >
                <IconChecked class="h-6 w-6" />
              </div>
              <h3 class="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                Acesso Rápido
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                Acesse seus investimentos e acompanhe sua carteira em segundos,
                com login biométrico e interface otimizada.
              </p>
            </div>

            <div
              class="group rounded-3xl bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:bg-white/5"
            >
              <div
                class="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
              >
                <IconChecked class="h-6 w-6" />
              </div>
              <h3 class="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                IA Integrada
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                Converse com nossa Inteligência Artificial para tirar dúvidas e
                receber insights sobre seus ativos.
              </p>
            </div>

            <div
              class="group rounded-3xl bg-white p-8 shadow-sm transition-all hover:shadow-xl dark:bg-white/5"
            >
              <div
                class="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
              >
                <IconChecked class="h-6 w-6" />
              </div>
              <h3 class="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                Alertas em Tempo Real
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                Receba notificações sobre dividendos, fatos relevantes e
                oscilações importantes do mercado.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Installation Guide -->
      <section class="px-4 py-20">
        <div class="mx-auto max-w-5xl">
          <h2
            class="mb-16 text-center text-3xl font-bold text-gray-900 md:text-4xl dark:text-white"
          >
            Como instalar
          </h2>

          <div class="grid gap-12 md:grid-cols-2">
            <!-- Android -->
            <div
              id="install-android"
              class="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg dark:border-white/10 dark:bg-white/5"
            >
              <div class="mb-8 flex items-center gap-4">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                >
                  <UIcon name="i-lucide-smartphone" class="h-6 w-6" />
                </div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                  Android
                </h3>
              </div>

              <ol
                class="relative ml-3 border-l border-gray-200 dark:border-gray-700"
              >
                <li class="mb-8 ml-6">
                  <span
                    class="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 ring-8 ring-white dark:bg-green-900 dark:ring-gray-900"
                  >
                    <span
                      class="text-xs font-bold text-green-600 dark:text-green-400"
                      >1</span
                    >
                  </span>
                  <h4 class="mb-1 font-semibold text-gray-900 dark:text-white">
                    Toque no botão abaixo
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Clique em "Instalar App" para iniciar.
                  </p>
                </li>
                <li class="mb-8 ml-6">
                  <span
                    class="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white dark:bg-gray-800 dark:ring-gray-900"
                  >
                    <span
                      class="text-xs font-bold text-gray-600 dark:text-gray-400"
                      >2</span
                    >
                  </span>
                  <h4 class="mb-1 font-semibold text-gray-900 dark:text-white">
                    Confirme a instalação
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Se o navegador perguntar, permita a instalação de fontes
                    desconhecidas ou confirme o download.
                  </p>
                </li>
                <li class="ml-6">
                  <span
                    class="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white dark:bg-gray-800 dark:ring-gray-900"
                  >
                    <span
                      class="text-xs font-bold text-gray-600 dark:text-gray-400"
                      >3</span
                    >
                  </span>
                  <h4 class="mb-1 font-semibold text-gray-900 dark:text-white">
                    Pronto!
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    O ícone do Redentia aparecerá na sua tela inicial.
                  </p>
                </li>
              </ol>

              <UButton
                block
                size="lg"
                color="primary"
                class="mt-8"
                icon="i-lucide-download"
                @click="installApp"
              >
                Instalar App Android
              </UButton>
            </div>

            <!-- iOS -->
            <div
              id="install-ios"
              class="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg dark:border-white/10 dark:bg-white/5"
            >
              <div class="mb-8 flex items-center gap-4">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-900 dark:bg-white/20 dark:text-white"
                >
                  <UIcon name="i-lucide-apple" class="h-6 w-6" />
                </div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                  iOS (iPhone)
                </h3>
              </div>

              <ol
                class="relative ml-3 border-l border-gray-200 dark:border-gray-700"
              >
                <li class="mb-8 ml-6">
                  <span
                    class="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white dark:bg-gray-800 dark:ring-gray-900"
                  >
                    <span
                      class="text-xs font-bold text-gray-600 dark:text-gray-400"
                      >1</span
                    >
                  </span>
                  <h4 class="mb-1 font-semibold text-gray-900 dark:text-white">
                    Toque em Compartilhar
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    No Safari, toque no ícone de compartilhamento na barra
                    inferior.
                  </p>
                </li>
                <li class="mb-8 ml-6">
                  <span
                    class="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white dark:bg-gray-800 dark:ring-gray-900"
                  >
                    <span
                      class="text-xs font-bold text-gray-600 dark:text-gray-400"
                      >2</span
                    >
                  </span>
                  <h4 class="mb-1 font-semibold text-gray-900 dark:text-white">
                    Adicionar à Tela de Início
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Role para baixo e selecione "Adicionar à Tela de Início".
                  </p>
                </li>
                <li class="ml-6">
                  <span
                    class="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white dark:bg-gray-800 dark:ring-gray-900"
                  >
                    <span
                      class="text-xs font-bold text-gray-600 dark:text-gray-400"
                      >3</span
                    >
                  </span>
                  <h4 class="mb-1 font-semibold text-gray-900 dark:text-white">
                    Confirmar
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Toque em "Adicionar" no canto superior direito.
                  </p>
                </li>
              </ol>

              <UButton
                block
                size="lg"
                color="primary"
                class="mt-8"
                icon="i-lucide-download"
                @click="installApp"
              >
                Instalar App IOS
              </UButton>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
const installApp = () => {
  const pwa = usePWA()

  // Detect if user is on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  
  if (isIOS) {
    alert('No iPhone/iPad, use o botão "Compartilhar" do Safari e selecione "Adicionar à Tela de Início".')
    scrollToInstall('ios')
    return
  }

  if (!pwa) {
    alert(
      'Seu navegador não suporta instalação automática. Siga as instruções manuais.'
    )
    return
  }

  if (!pwa.isPWAInstalled) {
    pwa.install()
  } else {
    navigateTo('/')
  }
}

const scrollToInstall = (platform: 'android' | 'ios') => {
  const el = document.getElementById(`install-${platform}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: 'Baixe o app Redentia | Investimentos com IA no seu celular',
  description:
    'Instale o aplicativo Redentia para gerenciar ações, FIIs e carteiras com inteligência artificial e notificações em tempo real.',
  path: '/download',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Download', path: '/download' },
  ],
})
</script>
