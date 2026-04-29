<template>
  <NuxtLayout name="static" :title="brand.contact.title">
    <section class="flex flex-col items-center gap-8 px-10 py-8">
      <div class="max-w-2xl text-center">
        <p class="text-lg opacity-90">
          {{ brand.contact.subtitle }}
        </p>
      </div>

      <UForm
        :schema="schema"
        :state="state"
        class="flex w-full max-w-md flex-col gap-4"
        @submit="onSubmit"
      >
        <!-- Nome -->
        <UFormField name="name" class="mb-2">
          <label class="mb-2 block text-sm font-medium opacity-80">
            Nome completo *
          </label>
          <AtomsFormInput
            v-model="state.name"
            type="text"
            placeholder="Seu nome completo"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <!-- Email -->
        <UFormField name="email" class="mb-2">
          <label class="mb-2 block text-sm font-medium opacity-80">
            Email *
          </label>
          <AtomsFormInput
            v-model="state.email"
            type="email"
            placeholder="seu@email.com"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <!-- Telefone -->
        <UFormField name="phone" class="mb-2">
          <label class="mb-2 block text-sm font-medium opacity-80">
            Telefone
          </label>
          <AtomsFormInput
            v-model="state.phone"
            type="tel"
            placeholder="(11) 99999-9999"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <!-- Assunto -->
        <UFormField name="subject" class="mb-2">
          <label class="mb-2 block text-sm font-medium opacity-80">
            Assunto *
          </label>
          <USelect
            v-model="state.subject"
            :items="subjectOptions"
            placeholder="Selecione o assunto"
            size="lg"
            color="secondary"
            variant="soft"
            class="w-full"
            :ui="{
              base: 'bg-black border-gray-800 border',
              variants: {
                color: {
                  secondary: 'text-gray-800',
                },
              },
            }"
          />
        </UFormField>

        <!-- Mensagem -->
        <UFormField name="message" class="mb-4">
          <label class="mb-2 block text-sm font-medium opacity-80">
            Mensagem *
          </label>
          <UTextarea
            v-model="state.message"
            placeholder="Descreva sua dúvida, sugestão ou como podemos ajudá-lo..."
            :rows="5"
            size="lg"
            class="w-full"
            color="secondary"
            variant="soft"
            :ui="{
              base: 'bg-black border-gray-800 border',
              variants: {
                color: {
                  secondary: 'text-gray-800',
                },
              },
            }"
          />
        </UFormField>

        <!-- Checkbox para aceitar termos -->
        <UFormField name="acceptTerms" class="mb-4">
          <div class="flex items-start gap-3">
            <UCheckbox
              v-model="state.acceptTerms"
              color="primary"
              :ui="{
                base: 'bg-black border-gray-800',
              }"
            />
            <label class="text-xs opacity-70">
              Ao enviar esta mensagem, você concorda com nossos
              <NuxtLink
                to="/institucional/terms"
                class="text-secondary underline hover:text-secondary/80"
              >
                Termos de Serviço
              </NuxtLink>
              e
              <NuxtLink
                to="/institucional/privacy"
                class="text-secondary underline hover:text-secondary/80"
              >
                Política de Privacidade
              </NuxtLink>
              *
            </label>
          </div>
        </UFormField>

        <AtomsButton
          type="submit"
          color="tertiary"
          class="w-full"
          :loading="isSubmitting"
        >
          <span v-if="!isSubmitting">Enviar mensagem</span>
          <span v-else>Enviando...</span>
        </AtomsButton>
      </UForm>

      <!-- Informações de contato alternativas -->
      <div class="mt-8 w-full max-w-2xl">
        <h3
          class="mb-4 text-center text-lg font-medium"
          :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }"
        >
          Outras formas de contato
        </h3>
        <div class="grid gap-4 md:grid-cols-3">
          <div
            v-for="(channel, index) in brand.contact.channels"
            :key="index"
            class="rounded-lg bg-white/5 p-4 text-center"
          >
            <div class="mb-2 text-secondary">
              <UIcon :name="channel.icon" class="mx-auto h-6 w-6" />
            </div>
            <h4 class="mb-1 font-medium">{{ channel.label }}</h4>
            <a
              v-if="channel.href"
              :href="channel.href"
              class="text-sm opacity-70 hover:text-secondary"
            >
              {{ channel.value }}
            </a>
            <p v-else class="text-sm opacity-70">{{ channel.value }}</p>
          </div>
        </div>
      </div>

      <!-- FAQ rápido -->
      <div class="mt-8 w-full max-w-2xl">
        <h3
          class="mb-4 text-center text-lg font-medium"
          :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }"
        >
          Perguntas Frequentes
        </h3>
        <div class="space-y-3">
          <details class="rounded-lg bg-white/5 p-4">
            <summary
              class="opacity-hover:text-secondary cursor-pointer font-medium"
            >
              Como posso conectar minha corretora?
            </summary>
            <p class="mt-2 text-sm opacity-70">
              Você pode conectar sua corretora através do CEI (Canal Eletrônico
              do Investidor) ou diretamente com as APIs das principais
              corretoras do mercado.
            </p>
          </details>

          <details class="rounded-lg bg-white/5 p-4">
            <summary
              class="opacity-hover:text-secondary cursor-pointer font-medium"
            >
              Meus dados estão seguros?
            </summary>
            <p class="mt-2 text-sm opacity-70">
              Sim! Utilizamos criptografia de nível bancário e seguimos todas as
              diretrizes da LGPD. Seus dados são protegidos com as melhores
              práticas de segurança do mercado.
            </p>
          </details>

          <details class="rounded-lg bg-white/5 p-4">
            <summary
              class="opacity-hover:text-secondary cursor-pointer font-medium"
            >
              Posso cancelar minha assinatura a qualquer momento?
            </summary>
            <p class="mt-2 text-sm opacity-70">
              Sim, você pode cancelar sua assinatura a qualquer momento através
              da plataforma ou entrando em contato conosco.
            </p>
          </details>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const brand = useBrand()

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Selecione um assunto'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos para continuar',
  }),
})

type Schema = z.infer<typeof schema>

const state = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  acceptTerms: false,
})

const isSubmitting = ref(false)

const subjectOptions = [
  { label: 'Suporte técnico', value: 'suporte' },
  { label: 'Dúvidas sobre planos', value: 'planos' },
  { label: 'Problemas de conexão', value: 'conexao' },
  { label: 'Sugestões de melhoria', value: 'sugestoes' },
  { label: 'Parcerias comerciais', value: 'parcerias' },
  { label: 'Outros assuntos', value: 'outros' },
]

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isSubmitting.value = true

  try {
    // Simular envio de formulário
    await new Promise((resolve) => setTimeout(resolve, 2000))

    showSuccessNotification(
      'Mensagem enviada com sucesso!',
      'Retornaremos seu contato em breve.'
    )

    // Limpar formulário
    Object.keys(state).forEach((key) => {
      if (key === 'acceptTerms') {
        state[key] = false
      } else {
        state[key] = ''
      }
    })

    console.log('Formulário enviado:', event.data)
  } catch (error) {
    showErrorNotification(
      'Erro ao enviar mensagem',
      'Tente novamente mais tarde.'
    )
  } finally {
    isSubmitting.value = false
  }
}

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: `Fale com a ${brand.name} | Atendimento e suporte`,
  description:
    `Entre em contato com a equipe ${brand.name} para tirar dúvidas, enviar sugestões ou falar sobre parcerias. Respondemos rapidamente.`,
  path: '/institucional/contact',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Contato', path: '/institucional/contact' },
  ],
})
</script>
