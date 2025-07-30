<template>
  <div class="flex flex-col">
    <img src="/assets/images/mockup-app.png" class="w-full" />
    <div
      class="flex flex-col items-center gap-4 bg-black py-[60px] max-sm:px-4"
    >
      <h1 class="text-center text-4xl font-bold text-white">
        Baixe nosso aplicativo!
      </h1>
      <p class="max-w-[600px] text-center text-lg text-white">
        APP_DESCRIPTION
      </p>
      <div class="flex items-center gap-4 max-md:flex-col">
        <AtomsInstallAppButtonAndroid
          @click="scrollToDownloadSection('android')"
        />
        <AtomsInstallAppButtonIOS @click="scrollToDownloadSection('ios')" />
      </div>
      <div class="mx-auto mt-6 flex w-full max-w-[900px] gap-4 max-md:flex-col">
        <div
          class="bg-secondary w-full rounded-lg p-6 text-center text-lg leading-[30px] text-black"
        >
          Experiência completa, rápida e segura!
          <br />
          <b class="font-medium text-[#5139ff]">
            No seu celular, com suble.com!
          </b>
          <img
            src="/assets/images/shildicons.png"
            width="200"
            class="mx-auto mt-4"
          />
        </div>
        <div
          class="bg-secondary flex w-full flex-col items-start justify-center gap-4 rounded-lg p-6 text-black"
        >
          <p class="w-full text-center text-2xl">
            Por que baixar o aplicativo Suble?
          </p>
          <div class="flex items-center gap-2 text-[17px]">
            <IconChecked class="inline-block w-[20px]" />
            Acesse seus criadores favoritos com apenas um clique
          </div>
          <div class="flex items-center gap-2 text-[17px]">
            <IconChecked class="inline-block w-[20px]" />
            Experiência otimizada para o seu celular
          </div>
          <div class="flex items-center gap-2 text-[17px]">
            <IconChecked class="inline-block w-[20px]" />
            Assinaturas e conteúdos ainda mais rápidos
          </div>
        </div>
      </div>
    </div>
    <div class="bg-secondary/20 flex py-[60px] text-white max-sm:px-4">
      <div
        class="mx-auto flex w-full max-w-[900px] justify-center gap-5 max-md:flex-col"
      >
        <div class="flex w-full flex-col gap-5">
          <h2 class="text-center text-2xl">Como baixar para Android?</h2>
          <div
            class="bg-tertiary rounded-lg py-3 text-center font-bold text-white"
          >
            Siga os passos abaixo
            <IconArrowDown class="fill-secondary inline-block w-6" />
          </div>
          <ul class="space-y-2">
            <li>Toque em 'Baixar aplicativo Android'</li>
            <li>Vá até Arquivos/File e encontre o app</li>
            <li>Clique em: Configurações > Permitir desta fonte > Instalar</li>
            <li>Pronto! O app vai aparecer no seu menu de aplicativos</li>
            <li>Agora é só aproveitar o aplicativo</li>
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
            class="bg-tertiary rounded-lg py-3 text-center font-bold text-white"
          >
            Siga os passos abaixo
            <IconArrowDown class="fill-secondary inline-block w-6" />
          </div>
          <ul class="space-y-2">
            <li>Toque em 'Baixar aplicativo iOS'</li>
            <li>Vá até Arquivos/File e encontre o app</li>
            <li>Clique em: Configurações > Permitir desta fonte > Instalar</li>
            <li>Pronto! O app vai aparecer no seu menu de aplicativos</li>
            <li>Agora é só aproveitar o aplicativo</li>
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
</script>

<style scoped>
ul li {
  /* @apply border-secondary rounded-lg border px-4 py-3 text-center text-[15px]; */
}
</style>
