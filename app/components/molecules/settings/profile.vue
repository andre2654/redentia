<template>
  <div class="flex flex-col gap-6 px-6 py-3.5">
    <h3 class="text-[18px] font-bold">Perfil</h3>
    <UFileUpload
      accept="image/*"
      icon="i-lucide-image"
      label="Drop your image here"
      description="PNG, JPG or JPEG (max. 2MB)"
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
            placeholder="Email"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <!-- Password -->
        <UFormField name="password">
          <AtomsFormInputPassword
            v-model="state.password"
            :aria-invalid="score < 4"
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

const router = useRouter()

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

type Schema = z.infer<typeof schema>

const state = reactive({
  name: '',
  email: '',
  password: '',
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  showSuccessNotification('Login successful', 'Welcome back!')
  console.log(event.data)
}
</script>
