<!--
  ReportProblemModal — single-source-of-truth form for the
  "report a problem" feature. Opened from any trigger via
  `<v-model:open>`.

  Auto-captures URL, user agent, viewport, tenant slug, and
  attaches `user_id` server-side via the bearer token (if signed
  in). The reporter only fills:
    - type (bug | suggestion | question | other)
    - title
    - description
    - guest_email (only when NOT authenticated)

  Mounted via `<Teleport to="body">` so it escapes any overflow
  ancestor (chat takeover sidebar, etc.) and sits on top of all
  other surfaces. Closes on backdrop click, Esc, or successful
  submit.

  Fire-and-forget by design: no admin response loop in MVP. Toast
  confirms receipt and the modal closes. Future v2 could surface
  the resolution back to the reporter, but the friction-vs-value
  ratio of a notification box on every report doesn't pay off
  yet.
-->
<template>
  <Teleport to="body">
    <Transition name="report-modal">
      <div
        v-if="open"
        class="fixed inset-0 z-[80]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-problem-title"
        @keydown.esc="close"
      >
        <button
          type="button"
          class="fixed inset-0"
          aria-label="Fechar"
          :style="{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }"
          @click="close"
        />
        <div
          class="report-modal pointer-events-auto fixed left-1/2 top-1/2 z-10 flex w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border shadow-2xl"
          :style="{
            backgroundColor: brand.colors.surface,
            borderColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)`,
            color: brand.colors.text,
          }"
          @click.stop
        >
          <header
            class="flex items-center justify-between border-b px-5 py-4"
            :style="{ borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)` }"
          >
            <h2
              id="report-problem-title"
              class="text-[16px] font-semibold leading-none"
            >
              Reportar problema
            </h2>
            <button
              type="button"
              class="rounded-md p-1.5 transition-opacity hover:opacity-70"
              :style="{ color: brand.colors.textMuted }"
              aria-label="Fechar"
              @click="close"
            >
              <UIcon name="i-lucide-x" class="size-4" />
            </button>
          </header>

          <form class="flex flex-1 flex-col gap-4 p-5" @submit.prevent="handleSubmit">
            <!-- Type radio. Four short, scannable options; visual is a
                 compact pill row that wraps on narrow screens. -->
            <fieldset class="flex flex-col gap-2">
              <legend class="text-[12px] font-medium" :style="{ color: brand.colors.textMuted }">
                O que é?
              </legend>
              <div class="flex flex-wrap gap-2">
                <label
                  v-for="opt in TYPE_OPTIONS"
                  :key="opt.value"
                  class="report-type-pill cursor-pointer rounded-lg border px-3 py-1.5 text-[13px] transition-colors"
                  :style="typeStyle(opt.value)"
                >
                  <input
                    v-model="form.type"
                    type="radio"
                    name="report-type"
                    :value="opt.value"
                    class="sr-only"
                  />
                  <span class="mr-1.5">{{ opt.icon }}</span>
                  {{ opt.label }}
                </label>
              </div>
            </fieldset>

            <!-- Email (anon only). Placed BEFORE title so anonymous
                 users notice it; authenticated users never see it. -->
            <label v-if="!auth.isAuthenticated" class="flex flex-col gap-1.5">
              <span class="text-[12px] font-medium" :style="{ color: brand.colors.textMuted }">
                Seu email <span :style="{ color: brand.colors.primary }">*</span>
              </span>
              <input
                v-model.trim="form.guest_email"
                type="email"
                required
                placeholder="voce@email.com"
                autocomplete="email"
                class="rounded-md border bg-transparent px-3 py-2 text-[14px] outline-none transition-colors"
                :style="inputStyle"
              />
            </label>

            <label class="flex flex-col gap-1.5">
              <span class="text-[12px] font-medium" :style="{ color: brand.colors.textMuted }">
                Título
              </span>
              <input
                v-model.trim="form.title"
                type="text"
                required
                minlength="4"
                maxlength="200"
                placeholder="Ex.: Gráfico não carrega na página de PETR4"
                class="rounded-md border bg-transparent px-3 py-2 text-[14px] outline-none transition-colors"
                :style="inputStyle"
              />
            </label>

            <label class="flex flex-col gap-1.5">
              <span class="text-[12px] font-medium" :style="{ color: brand.colors.textMuted }">
                O que aconteceu? Como reproduzir?
              </span>
              <textarea
                v-model.trim="form.description"
                required
                minlength="20"
                maxlength="5000"
                rows="6"
                placeholder="Conta o que você esperava ver, o que apareceu, e os passos que levaram até lá. Quanto mais detalhe, mais rápido a gente resolve."
                class="resize-y rounded-md border bg-transparent px-3 py-2 text-[14px] leading-[1.55] outline-none transition-colors"
                :style="inputStyle"
              />
              <span class="font-mono-tab text-[10.5px] tabular-nums" :style="{ color: brand.colors.textMuted }">
                {{ form.description.length }} / 5000
              </span>
            </label>

            <p
              class="rounded-md border px-3 py-2 text-[11.5px] leading-[1.5]"
              :style="{
                borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
                color: brand.colors.textMuted,
                backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 4%, transparent)`,
              }"
            >
              <UIcon name="i-lucide-info" class="mr-1 inline size-3.5" />
              Vamos enviar junto: a URL atual, o navegador e o tamanho da tela. A mensagem fica visível só pra equipe Redentia.
            </p>

            <div
              v-if="error"
              class="rounded-md border px-3 py-2 text-[12px]"
              :style="{ borderColor: brand.colors.negative, color: brand.colors.negative }"
            >
              {{ error }}
            </div>

            <footer class="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                class="rounded-md border px-4 py-2 text-[13px] font-medium transition-colors hover:opacity-80"
                :style="{ borderColor: brand.colors.border, color: brand.colors.text }"
                :disabled="submitting"
                @click="close"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="inline-flex items-center gap-2 rounded-md px-4 py-2 text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
                :disabled="submitting || !canSubmit"
              >
                <UIcon
                  v-if="submitting"
                  name="i-lucide-loader-2"
                  class="size-3.5 motion-safe:animate-spin"
                />
                {{ submitting ? 'Enviando...' : 'Enviar' }}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { ReportType, IReportPayload } from '~/types/report'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submitted: []
}>()

const brand = useBrand()
const auth = useAuthStore()
const reportsService = useReportsService()
const toast = useToast()

const TYPE_OPTIONS: ReadonlyArray<{ value: ReportType; label: string; icon: string }> = [
  { value: 'bug', label: 'Bug', icon: '🐞' },
  { value: 'suggestion', label: 'Sugestão', icon: '💡' },
  { value: 'question', label: 'Dúvida', icon: '❓' },
  { value: 'other', label: 'Outro', icon: '✏️' },
]

interface FormState {
  type: ReportType
  title: string
  description: string
  guest_email: string
}

function emptyForm(): FormState {
  return {
    type: 'bug',
    title: '',
    description: '',
    guest_email: '',
  }
}

const form = reactive<FormState>(emptyForm())
const submitting = ref(false)
const error = ref<string | null>(null)

const canSubmit = computed(() => {
  if (form.title.trim().length < 4) return false
  if (form.description.trim().length < 20) return false
  if (!auth.isAuthenticated && !form.guest_email) return false
  return true
})

const inputStyle = computed(() => ({
  borderColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)`,
  color: brand.colors.text,
}))

function typeStyle(value: ReportType) {
  const active = form.type === value
  return {
    borderColor: active ? brand.colors.primary : `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
    backgroundColor: active
      ? `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`
      : 'transparent',
    color: active ? brand.colors.primary : brand.colors.text,
  }
}

function close() {
  if (submitting.value) return
  emit('update:open', false)
}

// Reset the form whenever the modal RE-OPENS so the user always sees
// a clean slate. We don't reset on close because the close transition
// would briefly show empty state, which reads as data loss.
watch(
  () => props.open,
  (isOpen, wasOpen) => {
    if (isOpen && !wasOpen) {
      Object.assign(form, emptyForm())
      error.value = null
    }
  },
)

async function handleSubmit() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  error.value = null

  // Auto-captured context. We snapshot at submit time (not modal open
  // time) so a user who opens the modal, navigates a tab, then
  // submits sends the URL they were ON when they hit "Enviar" — that's
  // the failure surface we actually want to debug.
  const payload: IReportPayload = {
    type: form.type,
    title: form.title.trim(),
    description: form.description.trim(),
    page_url: typeof window !== 'undefined' ? window.location.href : undefined,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : undefined,
    viewport:
      typeof window !== 'undefined'
        ? `${window.innerWidth}x${window.innerHeight}`
        : undefined,
    tenant_slug: brand.slug ?? undefined,
  }
  if (!auth.isAuthenticated) {
    payload.guest_email = form.guest_email.trim()
  }

  try {
    await reportsService.submit(payload)
    toast.add({
      title: 'Report enviado',
      description: 'Obrigado por avisar. A equipe vai dar uma olhada.',
      color: 'success',
    })
    emit('submitted')
    emit('update:open', false)
  } catch (e) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value =
      err?.data?.message
      || err?.message
      || 'Não consegui enviar agora. Tenta de novo em alguns segundos.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.report-modal {
  /* The wrapper sits at z-80 so it's above sticky chat composers,
     mobile headers, sidebar drawers, and the toaster region. */
  max-height: calc(100vh - 32px);
}

.report-type-pill input:focus-visible + span,
.report-type-pill:focus-within {
  outline: 2px solid var(--brand-primary, currentColor);
  outline-offset: 2px;
}

.report-modal-enter-active,
.report-modal-leave-active {
  transition: opacity 200ms ease-out;
}
.report-modal-enter-active > .report-modal,
.report-modal-leave-active > .report-modal {
  transition: transform 220ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.report-modal-enter-from,
.report-modal-leave-to {
  opacity: 0;
}
.report-modal-enter-from > .report-modal,
.report-modal-leave-to > .report-modal {
  transform: translate(-50%, calc(-50% + 12px));
}

.font-mono-tab {
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-feature-settings: 'tnum' 1;
}
</style>
