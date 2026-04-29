<template>
  <NuxtLayout title="Visão geral">
    <div id="overview" class="flex flex-col gap-[40px] px-6 py-4">
      <div class="flex flex-col gap-1">
        <h1
          class="font-medium"
          :style="{
            color: brand.colors.text,
            fontSize: 'clamp(20px, 2.6vw, 24px)',
            letterSpacing: '-0.4px',
          }"
        >Complete o seu cadastro</h1>
        <p class="text-sm font-thin">
          Leva menos de 2 minutos. Assim personalizamos sua experiência e
          liberamos recursos avançados.
        </p>
      </div>
      <div class="flex flex-col">
        <AtomsStep
          :step-number="1"
          title="Preencha seus dados básicos"
          description="Informe nome, e-mail e defina uma senha segura. Você pode editar isso depois."
          has-more
        />
        <AtomsStep
          :step-number="2"
          title="Defina suas preferências"
          description="Escolha tema claro/escuro e configure alertas e filtros favoritos."
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const brand = useBrand()
</script>

<style scoped>
#overview {
  box-shadow: inset 0 250px 0 0px #252f26;
}
</style>
