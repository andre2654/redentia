<template>
  <div class="flex flex-col gap-6 p-6">
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
        title="Exporte seu extrato da corretora"
        description="Baixe o PDF com a posição consolidada na sua corretora. Vamos usar esse arquivo para importar os ativos."
        has-more
      />
      <AtomsStep
        :step-number="2"
        title="Faça o upload do arquivo"
        description="Arraste e solte o PDF aqui ou clique para selecionar. Arquivos suportados: PDF até 2MB."
        has-more
      />
      <AtomsStep
        :step-number="3"
        title="Confirme e salve"
        description="Revise os ativos detectados, ajuste o que for necessário e salve para sincronizar sua carteira."
      />
    </div>
    <div class="flex flex-col gap-4">
      <h4 class="text-[16px] font-bold">Faça o upload do seu arquivo</h4>
      <UFileUpload
        accept="application/pdf"
        icon="i-lucide-upload-cloud"
        label="Coloque aqui o arquivo da sua carteira"
        description="PDF (máx. 2MB)"
        class="h-[220px] w-full"
      />
      <AtomsButton type="submit" color="tertiary" class="ml-auto w-fit">
        Salvar
      </AtomsButton>
    </div>
  </div>
</template>
