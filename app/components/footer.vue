<template>
  <div class="flex w-full flex-col bg-white/5 text-white">
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
</script>

