<template>
  <div class="mx-auto flex max-w-[1400px] flex-col border-x">
    <div class="py-5">
      <NuxtLink to="/">
        <IconLogoFull class="mx-auto h-auto w-[200px] fill-white" />
      </NuxtLink>
    </div>
    <img src="/assets/images/mockup-app.png" class="w-full" />
    <div
      class="flex flex-col items-center gap-4 bg-black py-[60px] max-sm:px-4"
    >
      <h1 class="text-center text-4xl font-bold text-white">
        Baixe nosso aplicativo!
      </h1>
      <p class="max-w-[600px] text-center text-lg text-white">
        A única plataforma de finanças realmente inteligente, com tudo que você
        precisa para gerenciar seus investimentos e finanças pessoais de forma
        rápida e fácil.
      </p>
      <div class="flex items-center gap-4 max-md:flex-col">
        <AtomsInstallAppButtonAndroid
          @click="scrollToDownloadSection('android')"
        />
        <AtomsInstallAppButtonIOS @click="scrollToDownloadSection('ios')" />
      </div>
      <div class="mx-auto mt-6 flex w-full max-w-[900px] gap-4 max-md:flex-col">
        <div
          class="flex w-full flex-col items-center justify-center rounded-lg bg-[#4388FF] p-6 text-center text-lg leading-[30px] text-white"
        >
          <span> Experiência completa, rápida e segura! </span>
          <b> No seu celular, com redentia.com! </b>
        </div>
        <div
          class="flex w-full flex-col items-start justify-center gap-4 rounded-lg bg-[#4388FF] p-6 text-white"
        >
          <b class="w-full text-center text-2xl">
            Por que baixar o aplicativo Redentia?
          </b>
          <div class="flex items-center gap-3 text-[17px]">
            <IconChecked class="inline-block w-[20px] min-w-[20px]" />
            Acesso rápido e fácil aos seus investimentos
          </div>
          <div class="flex items-center gap-3 text-[17px]">
            <IconChecked class="inline-block w-[20px] min-w-[20px]" />
            Experiência completamente integrada com inteligencia artificial
          </div>
          <div class="flex items-center gap-3 text-[17px]">
            <IconChecked class="inline-block w-[20px] min-w-[20px]" />
            Notificações em tempo real sobre ações e eventos do mercado
          </div>
        </div>
      </div>
    </div>
    <div class="flex py-[60px] text-white max-sm:px-4">
      <div
        class="mx-auto flex w-full max-w-[900px] justify-center gap-5 max-md:flex-col"
      >
        <div class="flex w-full flex-col gap-5">
          <h2 class="text-center text-2xl">Como baixar para Android?</h2>
          <div
            class="rounded-lg bg-[#6EB1FE] py-3 text-center font-bold text-black"
          >
            Siga os passos abaixo
            <IconArrowDown class="inline-block w-6 fill-black" />
          </div>
          <ul class="space-y-2">
            <li
              class="border-secondary rounded-lg border px-4 py-3 text-center text-[15px]"
            >
              Toque em 'Baixar aplicativo Android'
            </li>
            <li
              class="border-secondary rounded-lg border px-4 py-3 text-center text-[15px]"
            >
              Vá até Arquivos/File e encontre o app
            </li>
            <li
              class="border-secondary rounded-lg border px-4 py-3 text-center text-[15px]"
            >
              Clique em: Configurações > Permitir desta fonte > Instalar
            </li>
            <li
              class="border-secondary rounded-lg border px-4 py-3 text-center text-[15px]"
            >
              Pronto! O app vai aparecer no seu menu de aplicativos
            </li>
            <li
              class="border-secondary rounded-lg border px-4 py-3 text-center text-[15px]"
            >
              Agora é só aproveitar o aplicativo
            </li>
          </ul>
          <AtomsInstallAppButtonAndroid
            id="download-android-btn"
            class="!bg-[#5139FF]"
            @click="installApp"
          />
        </div>
        <div class="flex w-full flex-col gap-5">
          <h2 class="text-center text-2xl">Como baixar para iOS?</h2>
          <div
            class="rounded-lg bg-[#6EB1FE] py-3 text-center font-bold text-black"
          >
            Siga os passos abaixo
            <IconArrowDown class="inline-block w-6 fill-black" />
          </div>
          <ul class="space-y-2">
            <li
              class="border-secondary rounded-lg border px-4 py-3 text-center text-[15px]"
            >
              Toque em 'Baixar aplicativo iOS'
            </li>
            <li
              class="border-secondary rounded-lg border px-4 py-3 text-center text-[15px]"
            >
              Vá até Arquivos/File e encontre o app
            </li>
            <li
              class="border-secondary rounded-lg border px-4 py-3 text-center text-[15px]"
            >
              Clique em: Configurações > Permitir desta fonte > Instalar
            </li>
            <li
              class="border-secondary rounded-lg border px-4 py-3 text-center text-[15px]"
            >
              Pronto! O app vai aparecer no seu menu de aplicativos
            </li>
            <li
              class="border-secondary rounded-lg border px-4 py-3 text-center text-[15px]"
            >
              Agora é só aproveitar o aplicativo
            </li>
          </ul>
          <AtomsInstallAppButtonIOS
            id="download-ios-btn"
            class="!bg-[#5139FF]"
            @click="installApp"
          />
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup lang="ts">
const scrollToDownloadSection = (system: 'android' | 'ios') => {
  const sectionId =
    system === 'android' ? 'download-android-btn' : 'download-ios-btn'
  const section = document.getElementById(sectionId)
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const installApp = () => {
  console.log('Install app button clicked')
}

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})
</script>
