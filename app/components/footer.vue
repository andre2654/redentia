<template>
  <div class="flex w-full flex-col bg-white/5 text-white">
    <!-- CTA de Notificações (apenas no app e se não liberou) -->
    <div
      v-if="showNotificationCta"
      class="w-full border-b border-white/10 bg-gradient-to-br from-secondary/10 to-secondary/5 py-6"
    >
      <div class="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 max-md:flex-col">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-secondary/20">
            <UIcon name="i-lucide-bell" class="text-secondary h-6 w-6" />
          </div>
          <div class="flex flex-col">
            <h3 class="text-base font-semibold text-white">
              Ativar notificações
            </h3>
            <p class="text-sm text-gray-400">
              Receba alertas de mercado e dividendos em tempo real
            </p>
          </div>
        </div>
        <UButton
          color="secondary"
          size="lg"
          icon="i-lucide-bell-ring"
          class="hover:shadow-secondary/50 max-md:w-full transition-all hover:scale-105 hover:shadow-xl"
          @click="handleRequestPermission"
        >
          Ativar agora
        </UButton>
      </div>
    </div>

    <!-- Seção Termos do Mercado -->
    <div class="w-full py-12">
      <div class="mx-auto max-w-[1400px] px-4">
        <h2 class="mb-6 text-center text-2xl font-bold uppercase tracking-wide md:text-3xl">
          <span class="text-white">Termos</span>
          <span class="text-secondary"> do Mercado</span>
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
            class="hover:text-secondary transition-colors"
          >
            {{ letra }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Links Categorizados (estilo Zapier) -->
    <div class="w-full border-t border-white/10 py-12">
      <div class="mx-auto flex max-w-[1400px] flex-wrap justify-center gap-x-16 gap-y-10 px-6 text-center md:justify-between md:text-left lg:gap-x-24">
        <!-- Ferramentas -->
        <div class="flex flex-col items-center md:items-start">
          <h3 class="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
            Ferramentas
          </h3>
          <ul class="flex flex-col items-center gap-3 md:items-start">
            <li>
              <NuxtLink to="/calculadora" class="text-sm text-gray-400 transition-colors hover:text-secondary">
                Calculadoras
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/calculadora/juros-compostos" class="text-sm text-gray-400 transition-colors hover:text-secondary">
                Juros Compostos
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/calculadora/preco-teto" class="text-sm text-gray-400 transition-colors hover:text-secondary">
                Preço Teto
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/calculadora/dividend-yield" class="text-sm text-gray-400 transition-colors hover:text-secondary">
                Dividend Yield
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/help" class="text-sm text-gray-400 transition-colors hover:text-secondary">
                Assessoria IA
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Recursos -->
        <div class="flex flex-col items-center md:items-start">
          <h3 class="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
            Recursos
          </h3>
          <ul class="flex flex-col items-center gap-3 md:items-start">
            <li>
              <NuxtLink to="/guias" class="text-sm text-gray-400 transition-colors hover:text-secondary">
                Guias de Investimento
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/glossario" class="text-sm text-gray-400 transition-colors hover:text-secondary">
                Glossário
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/acoes" class="text-sm text-gray-400 transition-colors hover:text-secondary">
                Ações
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/fiis" class="text-sm text-gray-400 transition-colors hover:text-secondary">
                FIIs
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dividendos" class="text-sm text-gray-400 transition-colors hover:text-secondary">
                Dividendos
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Empresa -->
        <div class="flex flex-col items-center md:items-start">
          <h3 class="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
            Empresa
          </h3>
          <ul class="flex flex-col items-center gap-3 md:items-start">
            <li>
              <NuxtLink to="/redentia/about" class="text-sm text-gray-400 transition-colors hover:text-secondary">
                Sobre
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/redentia/how-works" class="text-sm text-gray-400 transition-colors hover:text-secondary">
                Como funciona
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/redentia/contact" class="text-sm text-gray-400 transition-colors hover:text-secondary">
                Contato
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/download" class="text-sm text-gray-400 transition-colors hover:text-secondary">
                Download
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Legal -->
        <div class="flex flex-col items-center md:items-start">
          <h3 class="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
            Legal
          </h3>
          <ul class="flex flex-col items-center gap-3 md:items-start">
            <li>
              <NuxtLink to="/redentia/terms" class="text-sm text-gray-400 transition-colors hover:text-secondary">
                Termos de Uso
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/redentia/privacy" class="text-sm text-gray-400 transition-colors hover:text-secondary">
                Privacidade
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/redentia/cookies" class="text-sm text-gray-400 transition-colors hover:text-secondary">
                Cookies
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!-- Logo e Copyright -->
    <div
      class="mx-auto flex w-full max-w-[1400px] flex-col gap-6 border-t border-white/10 px-6 pb-[105px] pt-8 max-lg:items-center"
    >
      <div class="flex w-full items-start justify-between max-lg:flex-col max-lg:items-center max-lg:gap-6">
        <div class="flex flex-col gap-4 max-lg:items-center">
          <NuxtLink to="/">
            <IconLogoFull class="w-[150px] fill-white" />
          </NuxtLink>
          <p class="text-[12px] text-white/60 max-lg:text-center">
            Invista com inteligência. Resultados reais.
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
      
      <div class="flex w-full items-center justify-between border-t border-white/10 pt-6 max-lg:flex-col max-lg:gap-4">
        <p class="text-[12px] text-white/50 max-lg:text-center">
          © 2026 Redentia. Todos os direitos reservados.
        </p>
        <p class="text-[11px] text-white/40 max-lg:text-center">
          AV. PAULISTA 1106 SALA 01 ANDAR, Bela Vista, São Paulo, SP
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

