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

    <!-- Links Institucionais -->
    <div class="w-full bg-white/5 py-5">
      <div
        class="mx-auto flex max-w-[1400px] items-center justify-between px-4 text-[15px] max-lg:flex-col max-lg:gap-[40px]"
      >
        <NuxtLink to="/redentia/about"> Sobre </NuxtLink>
        <NuxtLink to="/redentia/how-works"> Como funciona </NuxtLink>
        <NuxtLink to="/redentia/contact"> Contato </NuxtLink>
        <NuxtLink to="/glossario"> Glossário </NuxtLink>
        <NuxtLink to="/guias"> Guias </NuxtLink>
        <NuxtLink to="/redentia/privacy"> Privacidade </NuxtLink>
        <NuxtLink to="/redentia/terms"> Termos e políticas </NuxtLink>
        <NuxtLink to="/redentia/cookies">
          Política de cookies e privacidade
        </NuxtLink>
      </div>
    </div>
    <!-- Logo e Copyright -->
    <div
      class="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-2 pb-[105px] pt-[50px] max-lg:items-center"
    >
      <NuxtLink to="/">
        <IconLogoFull class="w-[150px] fill-white" />
      </NuxtLink>
      <div
        class="flex w-full items-center max-lg:flex-col max-lg:gap-6 lg:items-end lg:justify-between"
      >
        <p class="text-[12px] text-white/80 max-lg:text-center">
          @2025 Redentia. Todos os direitos reservados.
          <br />
          AV. PAULISTA 1106 SALA 01 ANDAR, Bela Vista, São Paulo, SP
        </p>
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

