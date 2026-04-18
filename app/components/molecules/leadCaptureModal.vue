<!--
  MoleculesLeadCaptureModal, reusable lead capture form.

  Used by the Whitelabel and API Portal landing pages to capture
  interest from potential customers. Opens as a modal overlay,
  collects name/email/company/phone/message, and POSTs to the
  Laravel backend at /api/leads.

  Usage:
    <MoleculesLeadCaptureModal
      v-model:open="showModal"
      source="whitelabel"
      :plan="selectedPlan"
    />

  The `source` prop determines which landing page the lead came from.
  The `plan` prop (optional) pre-selects the pricing tier the user
  clicked on, e.g. 'growth' if they clicked "Escolher Growth →".
-->

<template>
  <UModal
    v-model:open="isOpen"
    :ui="{
      content: 'sm:rounded-3xl shadow-2xl overflow-hidden sm:max-w-lg',
      overlay: 'backdrop-blur-md',
    }"
  >
    <template #content>
      <div
        class="flex flex-col overflow-hidden"
        :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
      >
        <!-- Success state -->
        <div v-if="state === 'success'" class="flex flex-col items-center gap-6 px-8 py-16 text-center">
          <div
            class="flex size-16 items-center justify-center rounded-full"
            :style="{ backgroundColor: `${brand.colors.positive}20`, color: brand.colors.positive }"
          >
            <UIcon name="i-lucide-check" class="size-8" />
          </div>
          <div>
            <h3 class="text-xl font-bold" :style="{ color: brand.colors.text }">Recebemos seu contato!</h3>
            <p class="mt-2 text-sm" :style="{ color: brand.colors.textMuted }">
              Nosso time vai entrar em contato em até 24h.
            </p>
          </div>
          <button
            class="rounded-full px-6 py-2.5 text-sm font-medium transition hover:opacity-80"
            :style="{ backgroundColor: brand.colors.surface, color: brand.colors.text, border: `1px solid ${brand.colors.border}` }"
            @click="isOpen = false"
          >
            Fechar
          </button>
        </div>

        <!-- Form state -->
        <template v-else>
          <!-- Header -->
          <div class="border-b px-6 py-5" :style="{ borderColor: brand.colors.border }">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-bold uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                  {{ source === 'whitelabel' ? 'White-Label' : 'API' }}{{ plan ? ` · ${plan.toUpperCase()}` : '' }}
                </div>
                <h2 class="mt-1 text-lg font-bold" :style="{ color: brand.colors.text }">
                  {{ title || (source === 'whitelabel' ? 'Fale com o time' : 'Solicitar acesso') }}
                </h2>
              </div>
              <button
                class="flex size-8 items-center justify-center rounded-full transition hover:opacity-70"
                :style="{ backgroundColor: brand.colors.surface, color: brand.colors.textMuted }"
                @click="isOpen = false"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>
          </div>

          <!-- Form -->
          <form class="flex flex-col gap-4 px-6 py-6" @submit.prevent="onSubmit">
            <!-- Name -->
            <div>
              <label class="mb-1.5 block text-xs font-medium uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
                Nome *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="Seu nome completo"
                class="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                :style="{
                  backgroundColor: brand.colors.inputBg,
                  borderColor: brand.colors.inputBorder,
                  color: brand.colors.text,
                  '--tw-ring-color': brand.colors.primary,
                }"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="mb-1.5 block text-xs font-medium uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
                E-mail *
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                placeholder="voce@empresa.com"
                class="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                :style="{
                  backgroundColor: brand.colors.inputBg,
                  borderColor: brand.colors.inputBorder,
                  color: brand.colors.text,
                  '--tw-ring-color': brand.colors.primary,
                }"
              />
            </div>

            <!-- Company + Phone (side by side) -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1.5 block text-xs font-medium uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
                  Empresa
                </label>
                <input
                  v-model="form.company"
                  type="text"
                  placeholder="Nome da empresa"
                  class="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                  :style="{
                    backgroundColor: brand.colors.inputBg,
                    borderColor: brand.colors.inputBorder,
                    color: brand.colors.text,
                    '--tw-ring-color': brand.colors.primary,
                  }"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
                  Telefone
                </label>
                <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  class="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                  :style="{
                    backgroundColor: brand.colors.inputBg,
                    borderColor: brand.colors.inputBorder,
                    color: brand.colors.text,
                    '--tw-ring-color': brand.colors.primary,
                  }"
                />
              </div>
            </div>

            <!-- Message -->
            <div>
              <label class="mb-1.5 block text-xs font-medium uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
                Mensagem
              </label>
              <textarea
                v-model="form.message"
                rows="3"
                placeholder="Conte um pouco sobre seu projeto..."
                class="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                :style="{
                  backgroundColor: brand.colors.inputBg,
                  borderColor: brand.colors.inputBorder,
                  color: brand.colors.text,
                  '--tw-ring-color': brand.colors.primary,
                }"
              />
            </div>

            <!-- Error message -->
            <p v-if="errorMsg" class="text-sm" :style="{ color: brand.colors.negative }">
              {{ errorMsg }}
            </p>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="state === 'loading'"
              class="flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-all hover:-translate-y-0.5 disabled:opacity-50"
              :style="{
                backgroundColor: brand.colors.primary,
                color: brand.colors.background,
                boxShadow: `0 12px 40px -12px ${brand.colors.primary}80`,
              }"
            >
              <UIcon v-if="state === 'loading'" name="i-lucide-loader-2" class="size-4 animate-spin" />
              <UIcon v-else :name="source === 'whitelabel' ? 'i-lucide-send' : 'i-lucide-key'" class="size-4" />
              {{ state === 'loading' ? 'Enviando...' : (source === 'whitelabel' ? 'Enviar contato' : 'Solicitar API Key') }}
            </button>

            <p class="text-center text-[11px]" :style="{ color: brand.colors.textMuted }">
              Seus dados estão seguros. Não compartilhamos com terceiros.
            </p>
          </form>
        </template>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const brand = useBrand()
const config = useRuntimeConfig()

const props = defineProps<{
  source: 'whitelabel' | 'api' | 'creative' | 'other'
  plan?: string
  title?: string
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const state = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const errorMsg = ref('')

const form = reactive({
  name: '',
  email: '',
  company: '',
  phone: '',
  message: '',
})

// Reset form when modal opens
watch(isOpen, (open) => {
  if (open) {
    state.value = 'idle'
    errorMsg.value = ''
    form.name = ''
    form.email = ''
    form.company = ''
    form.phone = ''
    form.message = ''
  }
})

async function onSubmit() {
  if (!form.name.trim() || !form.email.trim()) {
    errorMsg.value = 'Nome e e-mail são obrigatórios.'
    return
  }

  state.value = 'loading'
  errorMsg.value = ''

  try {
    await $fetch(`${config.public.apiBaseUrl}/leads`, {
      method: 'POST',
      body: {
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim() || undefined,
        phone: form.phone.trim() || undefined,
        source: props.source,
        plan: props.plan || undefined,
        message: form.message.trim() || undefined,
        metadata: {
          url: window.location.href,
          referrer: document.referrer || undefined,
          userAgent: navigator.userAgent,
        },
      },
    })

    state.value = 'success'

    // Auto-close after 4 seconds
    setTimeout(() => {
      if (isOpen.value) isOpen.value = false
    }, 4000)
  } catch (err: any) {
    state.value = 'error'
    if (err?.status === 429) {
      errorMsg.value = 'Muitas tentativas. Aguarde um minuto e tente novamente.'
    } else if (err?.data?.errors) {
      const firstError = Object.values(err.data.errors).flat()[0]
      errorMsg.value = String(firstError)
    } else {
      errorMsg.value = 'Erro ao enviar. Tente novamente.'
    }
  }
}
</script>
