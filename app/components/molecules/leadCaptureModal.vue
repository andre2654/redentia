<!--
  MoleculesLeadCaptureModal, reusable lead capture form.

  Used by the Whitelabel, API Portal e Assessorias landing pages para
  capturar interesse de potenciais clientes. Abre como modal overlay,
  coleta nome/email/empresa/telefone/mensagem + perguntas customizadas
  opcionais, e POSTa para /api/leads.

  Usage basico:
    <MoleculesLeadCaptureModal
      v-model:open="showModal"
      source="whitelabel"
      :plan="selectedPlan"
    />

  Usage com perguntas extras (B2B survey-style, ex: assessorias):
    <MoleculesLeadCaptureModal
      v-model:open="showModal"
      source="assessoria"
      title="Quero participar da primeira fase"
      submit-label="Quero participar"
      :questions="[
        { id: 'role', label: 'Voce e:', type: 'select', required: true,
          options: ['Dono/socio de assessoria', 'Assessor de investimentos', ...] },
        { id: 'why',  label: 'Por que ...?', type: 'textarea', required: false },
      ]"
    />

  Respostas das perguntas customizadas vao em metadata.answers (JSON),
  legivel no admin via /backoffice/leads.
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
        :style="{ backgroundColor: 'var(--brand-background)', color: 'var(--brand-text)' }"
      >
        <!-- Success state -->
        <div v-if="state === 'success'" class="flex flex-col items-center gap-6 px-8 py-16 text-center">
          <div
            class="flex size-16 items-center justify-center rounded-full"
            :style="{ backgroundColor: `var(--brand-positive)20`, color: 'var(--brand-positive)' }"
          >
            <UIcon name="i-lucide-check" class="size-8" />
          </div>
          <div>
            <h3 class="text-xl font-bold" :style="{ color: 'var(--brand-text)' }">Recebemos seu contato!</h3>
            <p class="mt-2 text-sm" :style="{ color: 'var(--brand-text-muted)' }">
              Nosso time vai entrar em contato em até 24h.
            </p>
          </div>
          <button
            class="rounded-full px-6 py-2.5 text-sm font-medium transition hover:opacity-80"
            :style="{ backgroundColor: 'var(--brand-surface)', color: 'var(--brand-text)', border: `1px solid var(--brand-border)` }"
            @click="isOpen = false"
          >
            Fechar
          </button>
        </div>

        <!-- Form state -->
        <template v-else>
          <!-- Header -->
          <div class="border-b px-6 py-5" :style="{ borderColor: 'var(--brand-border)' }">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[10px] font-bold uppercase tracking-[0.2em]" :style="{ color: 'var(--brand-primary)' }">
                  {{ eyebrowLabel }}{{ plan ? ` · ${plan.toUpperCase()}` : '' }}
                </div>
                <h2 class="mt-1 text-lg" :style="{ color: 'var(--brand-text)' }">
                  {{ title || defaultTitle }}
                </h2>
              </div>
              <button
                class="flex size-8 items-center justify-center rounded-full transition hover:opacity-70"
                :style="{ backgroundColor: 'var(--brand-surface)', color: 'var(--brand-text-muted)' }"
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
              <label class="mb-1.5 block text-xs font-medium uppercase tracking-wider" :style="{ color: 'var(--brand-text-muted)' }">
                Nome *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="Seu nome completo"
                class="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                :style="{
                  backgroundColor: 'var(--brand-input-bg)',
                  borderColor: 'var(--brand-input-border)',
                  color: 'var(--brand-text)',
                  '--tw-ring-color': 'var(--brand-primary)',
                }"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="mb-1.5 block text-xs font-medium uppercase tracking-wider" :style="{ color: 'var(--brand-text-muted)' }">
                E-mail *
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                placeholder="voce@empresa.com"
                class="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                :style="{
                  backgroundColor: 'var(--brand-input-bg)',
                  borderColor: 'var(--brand-input-border)',
                  color: 'var(--brand-text)',
                  '--tw-ring-color': 'var(--brand-primary)',
                }"
              />
            </div>

            <!-- Company + Phone (side by side) -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1.5 block text-xs font-medium uppercase tracking-wider" :style="{ color: 'var(--brand-text-muted)' }">
                  Empresa
                </label>
                <input
                  v-model="form.company"
                  type="text"
                  placeholder="Nome da empresa"
                  class="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                  :style="{
                    backgroundColor: 'var(--brand-input-bg)',
                    borderColor: 'var(--brand-input-border)',
                    color: 'var(--brand-text)',
                    '--tw-ring-color': 'var(--brand-primary)',
                  }"
                />
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium uppercase tracking-wider" :style="{ color: 'var(--brand-text-muted)' }">
                  Telefone
                </label>
                <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  class="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                  :style="{
                    backgroundColor: 'var(--brand-input-bg)',
                    borderColor: 'var(--brand-input-border)',
                    color: 'var(--brand-text)',
                    '--tw-ring-color': 'var(--brand-primary)',
                  }"
                />
              </div>
            </div>

            <!-- Custom B2B questions (optional, per-page schema). Renderiza
                 selects e textareas DEPOIS do bloco fixo de identificacao,
                 ANTES da mensagem livre. Respostas vao em metadata.answers. -->
            <template v-for="q in (questions ?? [])" :key="q.id">
              <div>
                <label class="mb-1.5 block text-xs font-medium uppercase tracking-wider" :style="{ color: 'var(--brand-text-muted)' }">
                  {{ q.label }}{{ q.required ? ' *' : '' }}
                </label>
                <select
                  v-if="q.type === 'select'"
                  v-model="answers[q.id]"
                  :required="q.required"
                  class="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                  :style="{
                    backgroundColor: 'var(--brand-input-bg)',
                    borderColor: 'var(--brand-input-border)',
                    color: 'var(--brand-text)',
                    '--tw-ring-color': 'var(--brand-primary)',
                  }"
                >
                  <option value="" disabled>Selecione...</option>
                  <option v-for="opt in (q.options || [])" :key="opt" :value="opt">{{ opt }}</option>
                </select>
                <textarea
                  v-else-if="q.type === 'textarea'"
                  v-model="answers[q.id]"
                  :required="q.required"
                  :placeholder="q.placeholder || ''"
                  rows="3"
                  class="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                  :style="{
                    backgroundColor: 'var(--brand-input-bg)',
                    borderColor: 'var(--brand-input-border)',
                    color: 'var(--brand-text)',
                    '--tw-ring-color': 'var(--brand-primary)',
                  }"
                />
              </div>
            </template>

            <!-- Message (oculto quando o page passa perguntas custom, pra
                 nao duplicar com a textarea do "Por que...") -->
            <div v-if="!hideMessage">
              <label class="mb-1.5 block text-xs font-medium uppercase tracking-wider" :style="{ color: 'var(--brand-text-muted)' }">
                Mensagem
              </label>
              <textarea
                v-model="form.message"
                rows="3"
                placeholder="Conte um pouco sobre seu projeto..."
                class="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
                :style="{
                  backgroundColor: 'var(--brand-input-bg)',
                  borderColor: 'var(--brand-input-border)',
                  color: 'var(--brand-text)',
                  '--tw-ring-color': 'var(--brand-primary)',
                }"
              />
            </div>

            <!-- Error message -->
            <p v-if="errorMsg" class="text-sm" :style="{ color: 'var(--brand-negative)' }">
              {{ errorMsg }}
            </p>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="state === 'loading'"
              class="flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5 disabled:opacity-50"
              :style="{
                backgroundColor: 'var(--brand-primary)',
                color: 'var(--brand-background)',
                boxShadow: `0 12px 40px -12px var(--brand-primary)80`,
              }"
            >
              <UIcon v-if="state === 'loading'" name="i-lucide-loader-2" class="size-4 motion-safe:animate-spin" />
              <UIcon v-else :name="submitIcon" class="size-4" />
              {{ state === 'loading' ? 'Enviando...' : (submitLabel || defaultSubmitLabel) }}
            </button>

            <p class="text-center text-[11px]" :style="{ color: 'var(--brand-text-muted)' }">
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

interface LeadQuestion {
  id: string
  label: string
  type: 'select' | 'textarea'
  options?: string[]
  placeholder?: string
  required?: boolean
}

const props = defineProps<{
  source: 'whitelabel' | 'api' | 'creative' | 'assessoria' | 'other'
  plan?: string
  title?: string
  eyebrow?: string
  submitLabel?: string
  submitIcon?: string
  questions?: LeadQuestion[]
  hideMessage?: boolean
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

// Respostas das perguntas customizadas (por id de pergunta)
const answers = reactive<Record<string, string>>({})

// Defaults derivados do source quando o page nao passa override.
// Mantem retrocompat com whitelabel + api existentes.
const eyebrowLabel = computed(() => {
  if (props.eyebrow) return props.eyebrow
  if (props.source === 'whitelabel') return 'White-Label'
  if (props.source === 'api') return 'API'
  if (props.source === 'assessoria') return 'Assessorias · Primeira fase'
  return 'Contato'
})

const defaultTitle = computed(() => {
  if (props.source === 'whitelabel') return 'Fale com o time'
  if (props.source === 'api') return 'Solicitar acesso'
  if (props.source === 'assessoria') return 'Quero participar da primeira fase'
  return 'Fale com o time'
})

const defaultSubmitLabel = computed(() => {
  if (props.source === 'whitelabel') return 'Enviar contato'
  if (props.source === 'api') return 'Solicitar API Key'
  if (props.source === 'assessoria') return 'Quero participar'
  return 'Enviar'
})

const submitIcon = computed(() => {
  if (props.submitIcon) return props.submitIcon
  if (props.source === 'api') return 'i-lucide-key'
  return 'i-lucide-send'
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
    // Reset respostas customizadas
    for (const k of Object.keys(answers)) delete answers[k]
    for (const q of (props.questions ?? [])) answers[q.id] = ''
  }
})

async function onSubmit() {
  if (!form.name.trim() || !form.email.trim()) {
    errorMsg.value = 'Nome e e-mail são obrigatórios.'
    return
  }

  // Valida perguntas required
  for (const q of (props.questions ?? [])) {
    if (q.required && !(answers[q.id] || '').trim()) {
      errorMsg.value = `Por favor, preencha "${q.label}".`
      return
    }
  }

  state.value = 'loading'
  errorMsg.value = ''

  // Constroi payload de answers (label -> resposta) pra ficar legivel
  // no admin sem precisar de schema separado.
  const answersPayload: Record<string, string> = {}
  for (const q of (props.questions ?? [])) {
    const v = (answers[q.id] || '').trim()
    if (v) answersPayload[q.label] = v
  }

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
          answers: Object.keys(answersPayload).length ? answersPayload : undefined,
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
