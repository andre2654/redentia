<!--
  ChatV2InlineForm — renders a structured form inline in the chat.

  Triggered by the SSE `form.show` event the backend emits when the
  agent calls the `ask_form` tool. The schema gives us each question's
  id, label, kind (radio/select/text/...), options and constraints.
  The user fills it in real inputs instead of typing answers in prose;
  on submit we serialize the answers as a markdown list and feed it
  back through the normal `send-followup` channel — so the agent
  receives a structured user message and can continue the conversation.
-->
<template>
  <div
    class="chat-form rounded-2xl px-5 py-5 md:px-6 md:py-6"
    :style="{
      backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 65%, transparent)`,
      border: `1px solid color-mix(in srgb, ${brand.colors.border} 45%, transparent)`,
    }"
  >
    <header v-if="form.title || form.intro" class="mb-4 flex flex-col gap-1">
      <h3
        v-if="form.title"
        class="text-[15px] font-semibold tracking-tight"
        :style="{ color: brand.colors.text }"
      >
        {{ form.title }}
      </h3>
      <p
        v-if="form.intro"
        class="text-[13.5px] leading-relaxed"
        :style="{ color: brand.colors.textMuted }"
      >
        {{ form.intro }}
      </p>
    </header>

    <!-- novalidate: we run our own validation in JS so the browser
         doesn't silently block submission for an unfilled radio
         (HTML5 required on radios shows a tooltip we can't reliably
         attach to a custom-styled label). -->
    <form
      class="flex flex-col gap-5"
      novalidate
      @submit.prevent="onSubmit"
    >
      <div
        v-for="q in form.questions"
        :key="q.id"
        class="flex flex-col gap-2"
      >
        <label
          :for="`${form.formId}-${q.id}`"
          class="text-[13.5px] font-semibold"
          :style="{ color: brand.colors.text }"
        >
          {{ q.label }}
          <span
            v-if="q.required !== false"
            class="ml-1 text-[12px] font-normal"
            :style="{ color: brand.colors.primary }"
          >*</span>
        </label>
        <p
          v-if="q.hint && !errors[q.id]"
          class="-mt-1 text-[12px] leading-snug"
          :style="{ color: brand.colors.textMuted }"
        >
          {{ q.hint }}
        </p>
        <p
          v-if="errors[q.id]"
          class="-mt-1 text-[12px] font-medium leading-snug"
          :style="{ color: brand.colors.negative }"
        >
          {{ errors[q.id] }}
        </p>

        <!-- TEXT -->
        <input
          v-if="q.kind === 'text'"
          :id="`${form.formId}-${q.id}`"
          v-model="answers[q.id]"
          type="text"
          :placeholder="q.placeholder"
          :maxlength="q.maxLength"
          :aria-required="q.required !== false"
          :disabled="submitted"
          class="chat-form-input"
        />

        <!-- TEXTAREA -->
        <textarea
          v-else-if="q.kind === 'textarea'"
          :id="`${form.formId}-${q.id}`"
          v-model="answers[q.id]"
          rows="3"
          :placeholder="q.placeholder"
          :maxlength="q.maxLength"
          :aria-required="q.required !== false"
          :disabled="submitted"
          class="chat-form-input chat-form-textarea"
        />

        <!-- NUMBER -->
        <input
          v-else-if="q.kind === 'number'"
          :id="`${form.formId}-${q.id}`"
          v-model="answers[q.id]"
          type="number"
          inputmode="decimal"
          :placeholder="q.placeholder ?? 'Ex.: 30'"
          :min="q.min"
          :max="q.max"
          :aria-required="q.required !== false"
          :disabled="submitted"
          class="chat-form-input"
        />

        <!-- CURRENCY -->
        <div v-else-if="q.kind === 'currency'" class="chat-form-currency">
          <span class="chat-form-currency-prefix">R$</span>
          <input
            :id="`${form.formId}-${q.id}`"
            v-model="answers[q.id]"
            type="text"
            inputmode="decimal"
            :placeholder="q.placeholder ?? '5.000'"
            :aria-required="q.required !== false"
            :disabled="submitted"
            class="chat-form-input chat-form-currency-input"
            @input="onCurrencyInput($event, q.id)"
          />
        </div>

        <!-- RADIO -->
        <fieldset
          v-else-if="q.kind === 'radio'"
          class="flex flex-col gap-2"
          :disabled="submitted"
        >
          <label
            v-for="opt in normalizedOptions(q)"
            :key="opt.value"
            :class="[
              'chat-form-radio',
              answers[q.id] === opt.value ? 'is-active' : '',
            ]"
            :style="
              answers[q.id] === opt.value
                ? {
                    borderColor: brand.colors.primary,
                    backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 8%, transparent)`,
                  }
                : {
                    borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
                  }
            "
          >
            <input
              :name="`${form.formId}-${q.id}`"
              type="radio"
              :value="opt.value"
              :checked="answers[q.id] === opt.value"
              class="chat-form-radio-input"
              @change="answers[q.id] = opt.value"
            />
            <span class="flex flex-col">
              <span class="text-[14px] font-semibold" :style="{ color: brand.colors.text }">{{ opt.label }}</span>
              <span
                v-if="opt.hint"
                class="text-[12.5px] leading-snug"
                :style="{ color: brand.colors.textMuted }"
              >
                {{ opt.hint }}
              </span>
            </span>
          </label>
        </fieldset>

        <!-- CHECKBOX (multi) -->
        <fieldset
          v-else-if="q.kind === 'checkbox'"
          class="flex flex-col gap-2"
          :disabled="submitted"
        >
          <label
            v-for="opt in normalizedOptions(q)"
            :key="opt.value"
            :class="[
              'chat-form-radio',
              checkboxArray(q.id).includes(opt.value) ? 'is-active' : '',
            ]"
            :style="
              checkboxArray(q.id).includes(opt.value)
                ? {
                    borderColor: brand.colors.primary,
                    backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 8%, transparent)`,
                  }
                : {
                    borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
                  }
            "
          >
            <input
              type="checkbox"
              :value="opt.value"
              :checked="checkboxArray(q.id).includes(opt.value)"
              class="chat-form-radio-input"
              @change="toggleCheckbox(q.id, opt.value)"
            />
            <span class="flex flex-col">
              <span class="text-[14px] font-semibold" :style="{ color: brand.colors.text }">{{ opt.label }}</span>
              <span
                v-if="opt.hint"
                class="text-[12.5px] leading-snug"
                :style="{ color: brand.colors.textMuted }"
              >
                {{ opt.hint }}
              </span>
            </span>
          </label>
        </fieldset>

        <!-- SELECT -->
        <select
          v-else-if="q.kind === 'select'"
          :id="`${form.formId}-${q.id}`"
          v-model="answers[q.id]"
          :aria-required="q.required !== false"
          :disabled="submitted"
          class="chat-form-input"
        >
          <option value="" disabled>{{ q.placeholder ?? 'Selecione…' }}</option>
          <option
            v-for="opt in normalizedOptions(q)"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="mt-2 flex items-center justify-between gap-3">
        <span
          v-if="hasErrors"
          class="text-[12.5px]"
          :style="{ color: brand.colors.negative }"
        >
          Preencha os campos destacados acima
        </span>
        <span
          v-else-if="submitted"
          class="text-[12.5px]"
          :style="{ color: brand.colors.textMuted }"
        >
          Respostas enviadas
        </span>
        <span v-else />
        <button
          type="submit"
          class="chat-form-submit"
          :disabled="submitted"
          :style="{
            backgroundColor: brand.colors.primary,
            color: brand.colors.onPrimary ?? '#fff',
          }"
        >
          {{ submitted ? 'Enviado' : form.submitLabel }}
          <UIcon
            v-if="!submitted"
            name="i-lucide-arrow-up-right"
            class="size-3.5"
          />
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ChatForm, ChatFormQuestion, ChatFormOption } from '~/composables/useChatStream'

const props = defineProps<{ form: ChatForm }>()

interface FormSubmitPayload {
  text: string
  formId: string
  fields: Array<{ id: string; label: string; value: string }>
}
const emit = defineEmits<{
  submit: [payload: FormSubmitPayload]
}>()

const brand = useBrand()

// Local submitted state — avoid mutating the prop directly. Mirrors
// the form's `submitted` flag if it ever flips externally (e.g. when
// an old session is reloaded).
const submitted = ref<boolean>(props.form.submitted ?? false)

// Per-field validation errors. Cleared as the user fixes a field.
const errors = ref<Record<string, string>>({})

const hasErrors = computed(() => Object.keys(errors.value).length > 0)

// Reactive answer map. Initialised empty so v-model bindings work
// without TypeScript complaining about index signatures.
const answers = ref<Record<string, string | string[]>>({})
for (const q of props.form.questions) {
  answers.value[q.id] = q.kind === 'checkbox' ? [] : ''
}

// Clear field errors as the user starts correcting them. Avoids the
// "answered the field but the red message stays" UX trap.
watch(
  answers,
  () => {
    if (Object.keys(errors.value).length === 0) return
    const next = { ...errors.value }
    for (const id of Object.keys(next)) {
      const v = answers.value[id]
      if (Array.isArray(v) ? v.length > 0 : !!String(v ?? '').trim()) {
        delete next[id]
      }
    }
    errors.value = next
  },
  { deep: true },
)

function normalizedOptions(q: ChatFormQuestion): ChatFormOption[] {
  if (!q.options) return []
  return q.options.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o,
  )
}

function checkboxArray(id: string): string[] {
  const v = answers.value[id]
  return Array.isArray(v) ? v : []
}

function toggleCheckbox(id: string, value: string) {
  const arr = checkboxArray(id)
  const idx = arr.indexOf(value)
  if (idx === -1) answers.value[id] = [...arr, value]
  else answers.value[id] = arr.filter((v) => v !== value)
}

// Cheap currency formatter: keeps digits + a single comma, groups
// thousands with dots. The displayed value stays in the input so the
// user sees BRL style; the raw number is reconstructed at submit time.
function onCurrencyInput(e: Event, id: string) {
  const el = e.target as HTMLInputElement
  const digits = el.value.replace(/\D/g, '')
  if (!digits) {
    answers.value[id] = ''
    return
  }
  // Treat last 2 digits as cents
  const intPart = digits.slice(0, -2) || '0'
  const cents = digits.slice(-2).padStart(2, '0')
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  el.value = `${grouped},${cents}`
  answers.value[id] = el.value
}

// Resolve the human-readable label for a stored value so the
// submission text shows "Moderado" instead of "moderado".
function valueLabel(q: ChatFormQuestion, value: string): string {
  const opt = normalizedOptions(q).find((o) => o.value === value)
  return opt?.label ?? value
}

function onSubmit() {
  if (submitted.value) return

  // Validate required fields. We surface errors inline (errors[q.id])
  // so the user knows what's missing — silent return was the whole
  // reason "submit não envia nada" appeared as a bug.
  const next: Record<string, string> = {}
  for (const q of props.form.questions) {
    if (q.required === false) continue
    const v = answers.value[q.id]
    if (q.kind === 'checkbox') {
      if (!Array.isArray(v) || v.length === 0) {
        next[q.id] = 'Selecione ao menos uma opção'
      }
    } else if (v == null || (typeof v === 'string' && v.trim() === '')) {
      next[q.id] = q.kind === 'radio' || q.kind === 'select'
        ? 'Escolha uma opção'
        : 'Preencha este campo'
    }
  }
  errors.value = next
  if (Object.keys(next).length > 0) {
    // Scroll the first errored field into view
    requestAnimationFrame(() => {
      const firstId = Object.keys(next)[0]
      const el = document.getElementById(`${props.form.formId}-${firstId}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
    return
  }

  // Build a structured payload: markdown text for the LLM (passed
  // back as the next user message body) AND a fields array for the
  // UI, so the user message can render as a compact summary card
  // instead of a wall of bullet points.
  const lines: string[] = []
  if (props.form.title) lines.push(`**${props.form.title}**`)
  const fields: FormSubmitPayload['fields'] = []
  for (const q of props.form.questions) {
    const v = answers.value[q.id]
    let displayValue: string
    if (q.kind === 'radio' || q.kind === 'select') {
      displayValue = valueLabel(q, String(v))
    } else if (q.kind === 'checkbox' && Array.isArray(v)) {
      displayValue = v.map((x) => valueLabel(q, x)).join(', ') || '—'
    } else if (q.kind === 'currency') {
      displayValue = `R$ ${v}`
    } else {
      displayValue = String(v ?? '')
    }
    if (!displayValue.trim()) continue
    fields.push({ id: q.id, label: q.label, value: displayValue })
    lines.push(`- **${q.label}**: ${displayValue}`)
  }

  // Lock locally — the submission triggers a new turn and the next
  // assistant message will appear below. The form stays disabled.
  submitted.value = true

  emit('submit', {
    text: lines.join('\n'),
    formId: props.form.formId,
    fields,
  })
}
</script>

<style scoped>
.chat-form-input {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  background: color-mix(in srgb, currentColor 3%, transparent);
  color: inherit;
  outline: none;
  transition: border-color 140ms ease, background 140ms ease;
}
.chat-form-input:focus {
  border-color: var(--brand-primary);
  background: color-mix(in srgb, var(--brand-primary) 5%, transparent);
}
.chat-form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.chat-form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  line-height: 1.5;
}

.chat-form-currency {
  position: relative;
  display: flex;
  align-items: stretch;
}
.chat-form-currency-prefix {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  font-weight: 600;
  color: color-mix(in srgb, currentColor 60%, transparent);
  pointer-events: none;
}
.chat-form-currency-input {
  padding-left: 36px;
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
}

.chat-form-radio {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid;
  cursor: pointer;
  transition: border-color 140ms ease, background 140ms ease;
}
.chat-form-radio:hover:not(.is-active) {
  background: color-mix(in srgb, currentColor 3%, transparent);
}
.chat-form-radio-input {
  margin-top: 3px;
  accent-color: var(--brand-primary);
  cursor: pointer;
}

.chat-form-submit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: filter 140ms ease, transform 140ms ease;
}
.chat-form-submit:hover:not(:disabled) {
  filter: brightness(1.06);
}
.chat-form-submit:active:not(:disabled) {
  transform: translateY(0.5px);
}
.chat-form-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
