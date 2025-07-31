<template>
  <div class="flex flex-col gap-6 px-6 py-3.5">
    <div class="flex flex-col">
      <h3 class="text-[18px] font-bold">Sincronização de carteira</h3>
      <p class="text-[13px] font-extralight">
        Caros clientes, por enquanto não temos integração automática, assista ao
        vídeo abaixo para aprender a consolidar sua carteira
      </p>
    </div>
    <div>
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
        has-more
      />
      <AtomsStep
        :step-number="3"
        title="Lorem Ipsum"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vulputate erat non massa tristique."
      />
    </div>
    <div class="flex flex-col gap-4">
      <h4 class="text-[16px] font-bold">Faça o upload do seu arquivo</h4>
      <UFileUpload
        accept="application/pdf"
        icon="i-lucide-upload-cloud"
        label="Coloque aqui o arquivo da sua carteira"
        description="PDF (max. 2MB)"
        class="h-[220px] w-full"
      />
      <AtomsButton type="submit" color="tertiary" class="ml-auto w-fit">
        Salvar
      </AtomsButton>
    </div>
  </div>
</template>
