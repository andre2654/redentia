<template>
  <div class="flex flex-col gap-6 p-6">
    <h3 class="text-[18px] font-bold">Perfil</h3>
    <UFileUpload
      accept="image/*"
      icon="i-lucide-image"
      label="Arraste sua imagem aqui"
      description="PNG, JPG ou JPEG (máx. 2MB)"
      class="h-[180px] w-[300px]"
    />

    <UForm
      :schema="schema"
      :state="state"
      class="flex flex-col gap-8"
      @submit="onSubmit"
    >
      <div class="flex max-w-[300px] flex-col gap-4">
        <!-- Nome -->
        <UFormField name="name">
          <AtomsFormInput
            v-model="state.name"
            type="text"
            placeholder="Nome"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <!-- Email -->
        <UFormField name="email">
          <AtomsFormInput
            v-model="state.email"
            type="email"
            placeholder="E-mail"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <!-- Password -->
        <UFormField name="password">
          <AtomsFormInputPassword
            v-model="state.password"
            class="w-full"
          />
        </UFormField>
      </div>

      <AtomsButton type="submit" color="tertiary" class="ml-auto w-fit">
        Salvar
      </AtomsButton>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
})

type Schema = z.infer<typeof schema>

const state = reactive({
  name: '',
  email: '',
  password: '',
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  showSuccessNotification('Perfil salvo', 'Suas informações foram atualizadas.')
  console.log(event.data)
}
</script>
