<template>
  <NuxtLayout title="Visão geral" enable-tickers-carousel>
    <div id="overview" class="flex flex-col gap-[40px] px-6 py-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-xl font-semibold">Complete o seu cadastro</h1>
        <p class="text-sm font-thin">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
          vulputate erat non massa tristique.
        </p>
      </div>
      <div class="flex flex-col">
        <AtomsStep
          :step-number="1"
          title="Lorem Ipsum"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vulputate erat non massa tristique."
          has-more
        />
        <AtomsStep
          :step-number="2"
          title="Lorem Ipsum"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vulputate erat non massa tristique."
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
#overview {
  box-shadow: inset 0 250px 0 0px #252f26;
}
</style>
