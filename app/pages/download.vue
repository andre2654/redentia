<template>
  <div
    class="selection:bg-primary min-h-screen bg-black font-sans text-white selection:text-black"
  >
    <!-- Header / Nav -->
    <header
      class="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl"
    >
      <div
        class="mx-auto flex h-20 max-w-7xl items-center justify-between px-6"
      >
        <NuxtLink
          to="/"
          class="group flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <IconLogoFull
            class="h-8 w-auto fill-white transition-transform group-hover:scale-105 md:h-9"
          />
        </NuxtLink>
        <UButton
          to="/"
          variant="ghost"
          color="white"
          icon="i-lucide-arrow-left"
          class="hidden sm:flex"
        >
          Voltar para o site
        </UButton>
      </div>
    </header>

    <!-- Main Content -->
    <main class="pt-20">
      <!-- Hero Section -->
      <section class="relative overflow-hidden px-4 pb-20 pt-16 md:pt-24">
        <!-- Background Effects -->
        <div class="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            class="bg-primary/20 absolute -top-[20%] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[120px]"
          />
          <div
            class="bg-secondary/10 absolute right-[10%] top-[10%] h-[300px] w-[300px] rounded-full blur-[100px]"
          />
        </div>

        <div
          class="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center"
        >
          <div
            class="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"
              ></span>
              <span
                class="relative inline-flex h-2 w-2 rounded-full bg-green-500"
              ></span>
            </span>
            <span class="text-xs font-medium text-gray-300"
              >Disponível para iOS e Android</span
            >
          </div>

          <h1
            class="mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl"
          >
            <span
              class="bg-linear-to-b from-white to-white/60 bg-clip-text text-transparent"
              >Redentia</span
            >
            <br />
            <span class="text-4xl text-gray-400 md:text-6xl lg:text-7xl"
              >Inteligente, como você.</span
            >
          </h1>

          <p
            class="mb-10 max-w-2xl text-lg leading-relaxed text-gray-400 md:text-xl"
          >
            A única plataforma de finanças realmente inteligente. Gerencie
            ações, FIIs e sua carteira com IA, onde quer que você esteja.
          </p>

          <div
            class="flex w-full max-w-md flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <UButton
              size="xl"
              color="white"
              class="w-full justify-center font-semibold transition-all hover:scale-105 hover:bg-white/10 sm:w-auto"
              icon="i-lucide-smartphone"
              @click="scrollToInstall('android')"
            >
              Baixar para Android
            </UButton>
            <UButton
              size="xl"
              color="white"
              variant="outline"
              class="w-full justify-center font-semibold transition-all hover:scale-105 hover:bg-white/10 sm:w-auto"
              icon="i-lucide-apple"
              @click="scrollToInstall('ios')"
            >
              Baixar para iOS
            </UButton>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="bg-white/2 relative border-y border-white/5 px-4 py-24">
        <div class="mx-auto max-w-7xl">
          <div class="mb-20 text-center">
            <h2 class="text-3xl font-bold text-white md:text-5xl">
              Por que usar o App?
            </h2>
            <p class="mt-4 text-lg text-gray-400">
              Uma experiência completa, rápida e segura.
            </p>
          </div>

          <div class="grid gap-8 md:grid-cols-3">
            <div
              class="hover:shadow-primary/5 group relative overflow-hidden rounded-3xl border border-white/10 bg-black p-8 transition-all hover:border-white/20 hover:shadow-2xl"
            >
              <div
                class="bg-linear-to-br absolute inset-0 from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
              />
              <div class="relative z-10">
                <div
                  class="text-primary group-hover:bg-primary/10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 transition-transform group-hover:scale-110"
                >
                  <IconChecked class="h-7 w-7" />
                </div>
                <h3 class="mb-3 text-xl font-bold text-white">Acesso Rápido</h3>
                <p class="leading-relaxed text-gray-400">
                  Acesse seus investimentos e acompanhe sua carteira em
                  segundos, com login biométrico e interface otimizada para
                  mobile.
                </p>
              </div>
            </div>

            <div
              class="hover:shadow-secondary/5 group relative overflow-hidden rounded-3xl border border-white/10 bg-black p-8 transition-all hover:border-white/20 hover:shadow-2xl"
            >
              <div
                class="bg-linear-to-br absolute inset-0 from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
              />
              <div class="relative z-10">
                <div
                  class="text-secondary group-hover:bg-secondary/10 mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 transition-transform group-hover:scale-110"
                >
                  <IconChecked class="h-7 w-7" />
                </div>
                <h3 class="mb-3 text-xl font-bold text-white">IA Integrada</h3>
                <p class="leading-relaxed text-gray-400">
                  Converse com nossa Inteligência Artificial para tirar dúvidas
                  e receber insights sobre seus ativos diretamente do bolso.
                </p>
              </div>
            </div>

            <div
              class="group relative overflow-hidden rounded-3xl border border-white/10 bg-black p-8 transition-all hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/5"
            >
              <div
                class="bg-linear-to-br absolute inset-0 from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
              />
              <div class="relative z-10">
                <div
                  class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-purple-400 ring-1 ring-white/10 transition-transform group-hover:scale-110 group-hover:bg-purple-500/10"
                >
                  <IconChecked class="h-7 w-7" />
                </div>
                <h3 class="mb-3 text-xl font-bold text-white">
                  Alertas em Tempo Real
                </h3>
                <p class="leading-relaxed text-gray-400">
                  Receba notificações push sobre dividendos, fatos relevantes e
                  oscilações importantes do mercado instantaneamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Installation Guide -->
      <section class="px-4 py-24">
        <div class="mx-auto max-w-6xl">
          <h2
            class="mb-16 text-center text-3xl font-bold text-white md:text-5xl"
          >
            Como instalar
          </h2>

          <div class="grid gap-8 md:grid-cols-2">
            <!-- Android -->
            <div
              id="install-android"
              class="bg-white/2 relative overflow-hidden rounded-[2.5rem] border border-white/10 p-8 md:p-12"
            >
              <div
                class="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-green-500/10 blur-3xl"
              />

              <div class="relative z-10">
                <div class="mb-10 flex items-center gap-5">
                  <div
                    class="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/20 text-green-400 ring-1 ring-green-500/30"
                  >
                    <UIcon name="i-lucide-smartphone" class="h-8 w-8" />
                  </div>
                  <div>
                    <h3 class="text-2xl font-bold text-white">Android</h3>
                    <p class="font-medium text-green-400">Google Chrome</p>
                  </div>
                </div>

                <ol class="relative ml-3 space-y-10 border-l border-white/10">
                  <li class="ml-8">
                    <span
                      class="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black text-sm font-bold text-white ring-4 ring-black"
                      >1</span
                    >
                    <h4 class="mb-2 text-lg font-semibold text-white">
                      Toque no botão abaixo
                    </h4>
                    <p class="text-gray-400">
                      Clique em "Instalar App Android" para iniciar o processo.
                    </p>
                  </li>
                  <li class="ml-8">
                    <span
                      class="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black text-sm font-bold text-white ring-4 ring-black"
                      >2</span
                    >
                    <h4 class="mb-2 text-lg font-semibold text-white">
                      Confirme a instalação
                    </h4>
                    <p class="text-gray-400">
                      Se o navegador perguntar, permita a instalação ou confirme
                      o download.
                    </p>
                  </li>
                  <li class="ml-8">
                    <span
                      class="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-black ring-4 ring-black"
                    >
                      <UIcon name="i-lucide-check" class="h-5 w-5" />
                    </span>
                    <h4 class="mb-2 text-lg font-semibold text-white">
                      Pronto!
                    </h4>
                    <p class="text-gray-400">
                      O ícone do Redentia aparecerá na sua tela inicial.
                    </p>
                  </li>
                </ol>

                <UButton
                  block
                  size="xl"
                  color="primary"
                  class="mt-12 font-bold"
                  icon="i-lucide-download"
                  @click="installApp"
                >
                  Instalar App Android
                </UButton>
              </div>
            </div>

            <!-- iOS -->
            <div
              id="install-ios"
              class="bg-white/2 relative overflow-hidden rounded-[2.5rem] border border-white/10 p-8 md:p-12"
            >
              <div
                class="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"
              />

              <div class="relative z-10">
                <div class="mb-10 flex items-center gap-5">
                  <div
                    class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20"
                  >
                    <UIcon name="i-lucide-apple" class="h-8 w-8" />
                  </div>
                  <div>
                    <h3 class="text-2xl font-bold text-white">iOS (iPhone)</h3>
                    <p class="font-medium text-gray-400">Safari</p>
                  </div>
                </div>

                <ol class="relative ml-3 space-y-10 border-l border-white/10">
                  <li class="ml-8">
                    <span
                      class="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black text-sm font-bold text-white ring-4 ring-black"
                      >1</span
                    >
                    <h4 class="mb-2 text-lg font-semibold text-white">
                      Toque em Compartilhar
                    </h4>
                    <p class="text-gray-400">
                      No Safari, toque no ícone de compartilhamento
                      <UIcon
                        name="i-heroicons-share"
                        class="mx-1 inline h-4 w-4"
                      />
                      na barra inferior.
                    </p>
                  </li>
                  <li class="ml-8">
                    <span
                      class="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black text-sm font-bold text-white ring-4 ring-black"
                      >2</span
                    >
                    <h4 class="mb-2 text-lg font-semibold text-white">
                      Adicionar à Tela de Início
                    </h4>
                    <p class="text-gray-400">
                      Role para baixo e selecione a opção "Adicionar à Tela de
                      Início".
                    </p>
                  </li>
                  <li class="ml-8">
                    <span
                      class="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-black ring-4 ring-black"
                    >
                      <UIcon name="i-lucide-check" class="h-5 w-5" />
                    </span>
                    <h4 class="mb-2 text-lg font-semibold text-white">
                      Confirmar
                    </h4>
                    <p class="text-gray-400">
                      Toque em "Adicionar" no canto superior direito da tela.
                    </p>
                  </li>
                </ol>

                <div
                  class="mt-12 rounded-xl border border-white/5 bg-white/5 p-4 text-center text-sm text-gray-400"
                >
                  <UIcon
                    name="i-lucide-info"
                    class="mr-2 inline-block h-4 w-4 align-text-bottom"
                  />
                  Siga os passos acima no Safari do seu iPhone
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
const installApp = () => {
  const pwa = usePWA()

  // Detect if user is on iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

  if (isIOS) {
    alert(
      'No iPhone/iPad, use o botão "Compartilhar" do Safari e selecione "Adicionar à Tela de Início".'
    )
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
