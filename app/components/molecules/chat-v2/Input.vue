<!--
  Composer pill — premium tier-aware design.

  Two visual modes:

  - **Basic**: clean, neutral, fast-feeling. Subtle border, single-tone
    surface. Reads as "default tool".

  - **MAX**: PREMIUM. The whole pill transforms — animated gradient
    border that slowly rotates, soft inner glow tinted to brand
    primary, "MAX" watermark inside, sparkle send button, slightly
    elevated shadow. Feels expensive without being cartoonish.

  The toggle is the only knob — old focus_mode chips and the
  "Profunda" toggle are gone. Backend auto-detects intent.
-->
<template>
  <div class="chat-composer-wrap pointer-events-none absolute inset-x-0 bottom-0 z-10 px-5 pb-6 pt-10 md:px-8">
    <!-- Background fade so messages don't overlap composer harshly -->
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-32"
      :style="{
        background: `linear-gradient(to top, ${brand.colors.background} 30%, transparent)`,
      }"
      aria-hidden="true"
    />

    <!-- Gradient halo behind the pill (only visible on MAX) -->
    <Transition name="chat-max-halo">
      <div
        v-if="isMax"
        class="chat-max-halo pointer-events-none absolute inset-x-0 bottom-3 mx-auto max-w-3xl"
        :style="{
          height: '120px',
          background: `radial-gradient(ellipse 70% 100% at 50% 100%, ${brand.colors.primary}26 0%, transparent 70%)`,
          filter: 'blur(24px)',
        }"
        aria-hidden="true"
      />
    </Transition>

    <div
      class="chat-composer pointer-events-auto relative mx-auto flex max-w-3xl flex-col gap-2 px-5 pb-3 pt-4 transition-all duration-300"
      :class="['chat-composer', isMax ? 'is-max' : 'is-basic']"
      :style="composerStyle"
    >
      <!-- Animated gradient ring (rendered via ::before on .is-max) -->

      <!-- MAX watermark badge — top-right inside the pill -->
      <Transition name="chat-max-badge">
        <span
          v-if="isMax"
          class="chat-max-badge pointer-events-none absolute right-4 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.18em]"
          :style="{
            background: `linear-gradient(135deg, ${brand.colors.primary} 0%, color-mix(in srgb, ${brand.colors.primary} 60%, ${brand.colors.text}) 100%)`,
            color: brand.colors.background,
            boxShadow: `0 4px 12px -4px ${brand.colors.primary}66`,
          }"
        >
          <UIcon name="i-lucide-sparkles" class="size-2.5" />
          MAX
        </span>
      </Transition>

      <!-- Textarea row -->
      <div class="flex items-start gap-3">
        <textarea
          ref="textareaRef"
          v-model="value"
          rows="1"
          :placeholder="placeholder"
          class="chat-textarea min-h-[28px] max-h-[200px] flex-1 resize-none border-0 bg-transparent text-[16px] leading-relaxed outline-none"
          :class="isMax ? 'pr-16' : ''"
          :style="{ color: brand.colors.text }"
          :disabled="disabled"
          @input="autosize"
          @focus="focused = true"
          @blur="focused = false"
          @keydown.enter.exact.prevent="onEnter"
        />
      </div>

      <!-- Bottom row: tier picker + spacer + send/stop -->
      <div class="flex flex-wrap items-center gap-2">
        <div
          class="chat-tier-group inline-flex items-center gap-0.5 rounded-full p-0.5"
          :style="{
            backgroundColor: isMax
              ? `color-mix(in srgb, ${brand.colors.primary} 8%, transparent)`
              : `color-mix(in srgb, ${brand.colors.text} 5%, transparent)`,
            border: isMax
              ? `1px solid color-mix(in srgb, ${brand.colors.primary} 22%, transparent)`
              : '1px solid transparent',
          }"
          role="radiogroup"
          aria-label="Modelo Redentia"
        >
          <button
            v-for="opt in tierOptions"
            :key="opt.value"
            type="button"
            role="radio"
            :aria-checked="tier === opt.value"
            :disabled="props.tierLocked && tier !== opt.value"
            class="chat-tier-btn inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40"
            :style="tierBtnStyle(opt.value)"
            :title="props.tierLocked && tier !== opt.value
              ? 'Tier travado nesta conversa — abra uma Nova conversa para mudar'
              : opt.tagline"
            @click="onTierClick(opt.value)"
          >
            <UIcon
              v-if="opt.icon"
              :name="opt.icon"
              class="size-3"
              :style="
                tier === opt.value && opt.value === 'max'
                  ? { color: brand.colors.primary }
                  : tier === opt.value
                    ? { color: brand.colors.text }
                    : { color: 'inherit' }
              "
            />
            {{ opt.label }}
          </button>
        </div>

        <div class="flex-1" />

        <!-- Send / Stop -->
        <button
          v-if="!isStreaming"
          type="button"
          :disabled="disabled || !canSend"
          class="chat-send mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-full transition-all"
          :class="isMax ? 'chat-send-max' : ''"
          :style="sendButtonStyle"
          aria-label="Enviar"
          @click="submit"
        >
          <UIcon
            :name="isMax && canSend ? 'i-lucide-sparkles' : 'i-lucide-arrow-up'"
            class="size-4"
          />
        </button>
        <button
          v-else
          type="button"
          class="chat-stop mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-full transition-colors"
          :style="{
            backgroundColor: brand.colors.text,
            color: brand.colors.background,
          }"
          aria-label="Parar"
          @click="$emit('stop')"
        >
          <span
            class="inline-block size-3 rounded-[3px]"
            :style="{ backgroundColor: brand.colors.background }"
          />
        </button>
      </div>
    </div>

    <!-- Disclaimer / sub-line -->
    <p
      class="mx-auto mt-2 max-w-3xl text-center font-mono-tab text-[10px] uppercase tracking-[0.16em] transition-colors"
      :style="{
        color: isMax
          ? `color-mix(in srgb, ${brand.colors.primary} 70%, ${brand.colors.textMuted})`
          : `color-mix(in srgb, ${brand.colors.textMuted} 65%, transparent)`,
      }"
    >
      <template v-if="isMax">
        Redentia MAX · análise rigorosa · cada número validado
      </template>
      <template v-else>
        Não é recomendação de investimento · A IA pode errar — confira informações sensíveis
      </template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

export type ChatTier = 'basic' | 'max'

const props = defineProps<{
  disabled?: boolean
  isStreaming?: boolean
  /**
   * Once a session has started, the tier is sticky — switching mid-
   * conversation is misleading because the backend ignores it. The
   * picker becomes informational (selected one stays highlighted,
   * the other is dimmed and click-disabled).
   */
  tierLocked?: boolean
}>()

const tier = defineModel<ChatTier>('tier', { default: 'basic' })

const emit = defineEmits<{
  send: [message: string]
  stop: []
}>()

const brand = useBrand()
const value = ref('')
const focused = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const isMax = computed(() => tier.value === 'max')

const tierOptions: Array<{
  value: ChatTier
  label: string
  tagline: string
  icon?: string
}> = [
  {
    value: 'basic',
    label: 'Basic',
    tagline: 'Respostas rápidas e diretas',
    icon: 'i-lucide-zap',
  },
  {
    value: 'max',
    label: 'MAX',
    tagline: 'Análise rigorosa, multi-passo, com verificação cruzada',
    icon: 'i-lucide-sparkles',
  },
]

const placeholder = computed(() =>
  isMax.value
    ? 'Pergunte algo complexo. Eu valido cada número antes de responder…'
    : 'Pergunte sobre qualquer ativo, faça simulações…',
)

const canSend = computed(() => value.value.trim().length > 0 && !props.disabled)

const composerStyle = computed(() => {
  if (isMax.value) {
    return {
      // Solid surface — gradient border lives in ::before via CSS
      backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 96%, transparent)`,
      borderRadius: '28px',
      // Halo + lifted shadow tinted with brand primary
      boxShadow: focused.value
        ? `0 18px 60px -12px color-mix(in srgb, ${brand.colors.primary} 42%, transparent), 0 0 0 4px color-mix(in srgb, ${brand.colors.primary} 18%, transparent)`
        : `0 12px 48px -16px color-mix(in srgb, ${brand.colors.primary} 30%, transparent)`,
      // CSS vars consumed by the ::before gradient ring
      '--ring-c1': brand.colors.primary,
      '--ring-c2': `color-mix(in srgb, ${brand.colors.primary} 30%, ${brand.colors.text})`,
      '--ring-c3': `color-mix(in srgb, ${brand.colors.primary} 80%, ${brand.colors.background})`,
    } as Record<string, string>
  }
  return {
    backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 95%, transparent)`,
    borderRadius: '28px',
    border: `1px solid ${focused.value ? brand.colors.primary : `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`}`,
    boxShadow: focused.value
      ? `0 12px 40px -8px rgba(0,0,0,0.18), 0 0 0 4px color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`
      : '0 12px 40px -16px rgba(0,0,0,0.18)',
  } as Record<string, string>
})

function onTierClick(value: ChatTier) {
  if (props.tierLocked && tier.value !== value) return
  tier.value = value
}

function tierBtnStyle(value: ChatTier) {
  const active = tier.value === value
  if (!active) {
    return {
      color: `color-mix(in srgb, ${brand.colors.textMuted} 90%, transparent)`,
    } as Record<string, string>
  }
  if (value === 'max') {
    return {
      background: `linear-gradient(135deg, color-mix(in srgb, ${brand.colors.primary} 18%, ${brand.colors.surface}) 0%, color-mix(in srgb, ${brand.colors.primary} 8%, ${brand.colors.surface}) 100%)`,
      color: brand.colors.primary,
      boxShadow: `0 1px 2px color-mix(in srgb, ${brand.colors.primary} 30%, transparent), inset 0 0 0 1px color-mix(in srgb, ${brand.colors.primary} 35%, transparent)`,
    } as Record<string, string>
  }
  return {
    backgroundColor: brand.colors.surface,
    color: brand.colors.text,
    boxShadow: `0 1px 2px color-mix(in srgb, ${brand.colors.text} 10%, transparent)`,
  } as Record<string, string>
}

const sendButtonStyle = computed(() => {
  if (!canSend.value) {
    return {
      backgroundColor: `color-mix(in srgb, ${brand.colors.border} 70%, transparent)`,
      color: brand.colors.textMuted,
    } as Record<string, string>
  }
  if (isMax.value) {
    return {
      background: `linear-gradient(135deg, ${brand.colors.primary} 0%, color-mix(in srgb, ${brand.colors.primary} 70%, ${brand.colors.text}) 100%)`,
      color: brand.colors.background,
      boxShadow: `0 6px 16px -4px color-mix(in srgb, ${brand.colors.primary} 50%, transparent), inset 0 1px 0 0 color-mix(in srgb, white 30%, transparent)`,
    } as Record<string, string>
  }
  return {
    backgroundColor: brand.colors.primary,
    color: brand.colors.background,
  } as Record<string, string>
})

function autosize() {
  const ta = textareaRef.value
  if (!ta) return
  ta.style.height = 'auto'
  ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`
}

async function onEnter(e: KeyboardEvent) {
  if (e.shiftKey) {
    const ta = textareaRef.value
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    value.value = value.value.slice(0, start) + '\n' + value.value.slice(end)
    await nextTick()
    ta.selectionStart = ta.selectionEnd = start + 1
    autosize()
    return
  }
  submit()
}

function submit() {
  if (!canSend.value) return
  const message = value.value.trim()
  emit('send', message)
  value.value = ''
  nextTick(() => autosize())
}

watch(value, () => {
  nextTick(() => autosize())
})
</script>

<style scoped>
.chat-textarea::placeholder {
  color: color-mix(in srgb, currentColor 45%, transparent);
}

.chat-send:not(:disabled):hover {
  filter: brightness(1.06);
  transform: translateY(-0.5px);
}
.chat-send:disabled {
  cursor: not-allowed;
}
.chat-stop:hover {
  filter: brightness(0.92);
}
.chat-tier-btn:hover {
  filter: brightness(1.06);
}

/* ============================================================
   MAX MODE — animated gradient ring around the composer pill.
   Implementation: a pseudo-element that sits BEHIND the pill,
   rotates a conic gradient slowly, and is masked to a thin
   1.5px ring via two background-clip layers. Pure CSS, no JS.
   ============================================================ */
.chat-composer.is-max {
  position: relative;
  isolation: isolate;
}

.chat-composer.is-max::before {
  content: '';
  position: absolute;
  inset: -1.5px;
  border-radius: inherit;
  padding: 1.5px;
  background: conic-gradient(
    from var(--ring-angle, 0deg),
    var(--ring-c1, currentColor),
    var(--ring-c2, currentColor),
    var(--ring-c3, currentColor),
    var(--ring-c2, currentColor),
    var(--ring-c1, currentColor)
  );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  z-index: -1;
  animation: chat-ring-rotate 6s linear infinite;
  pointer-events: none;
}

@keyframes chat-ring-rotate {
  from { --ring-angle: 0deg; }
  to   { --ring-angle: 360deg; }
}

@property --ring-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

/* Subtle lift on focus when MAX */
.chat-composer.is-max:has(.chat-textarea:focus) {
  transform: translateY(-1px);
}

.chat-send-max:not(:disabled):hover {
  filter: brightness(1.10) saturate(1.10);
}

/* Halo + badge transitions */
.chat-max-halo-enter-active,
.chat-max-halo-leave-active {
  transition: opacity 320ms ease;
}
.chat-max-halo-enter-from,
.chat-max-halo-leave-to {
  opacity: 0;
}

.chat-max-badge-enter-active,
.chat-max-badge-leave-active {
  transition:
    opacity 220ms ease,
    transform 220ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.chat-max-badge-enter-from,
.chat-max-badge-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.92);
}

/* Reduced-motion: kill the ring rotation */
@media (prefers-reduced-motion: reduce) {
  .chat-composer.is-max::before {
    animation: none;
  }
}
</style>
