<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="cancel">
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="cancel" />
        <div
          class="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <!-- Icon -->
          <div class="flex flex-col items-center px-6 pt-8 pb-2 text-center">
            <div
              class="flex h-14 w-14 items-center justify-center rounded-2xl"
              :class="variantClasses.iconBg"
            >
              <UIcon :name="variantClasses.icon" class="size-7" :class="variantClasses.iconColor" />
            </div>
            <h3 class="mt-4 text-lg font-semibold" :style="{ color: brand.colors.text }">{{ title }}</h3>
            <p class="mt-2 text-sm leading-relaxed" :style="{ color: brand.colors.textMuted }">{{ message }}</p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 px-6 pb-6 pt-4">
            <button
              ref="cancelBtn"
              type="button"
              class="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:opacity-80"
              :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }"
              @click="cancel"
            >
              {{ cancelText }}
            </button>
            <button
              ref="confirmBtn"
              type="button"
              :disabled="loading"
              class="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              :class="variantClasses.btn"
              @click="confirm"
            >
              <UIcon v-if="loading" name="i-lucide-loader-2" class="size-4 animate-spin" />
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const brand = useBrand()

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
}>(), {
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  variant: 'danger',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'danger':
      return {
        icon: 'i-lucide-trash-2',
        iconBg: 'bg-red-500/10',
        iconColor: 'text-red-400',
        btn: 'bg-red-500 hover:bg-red-600',
      }
    case 'warning':
      return {
        icon: 'i-lucide-alert-triangle',
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-400',
        btn: 'bg-amber-500 hover:bg-amber-600',
      }
    case 'info':
    default:
      return {
        icon: 'i-lucide-info',
        iconBg: 'bg-secondary/10',
        iconColor: 'text-secondary',
        btn: 'bg-secondary hover:bg-secondary/90',
      }
  }
})

function cancel() {
  if (!props.loading) emit('update:modelValue', false)
}

function confirm() {
  emit('confirm')
}

// Close on Escape
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && !props.loading) cancel()
}

watch(() => props.modelValue, (val) => {
  if (val) {
    document.addEventListener('keydown', onKeydown)
  } else {
    document.removeEventListener('keydown', onKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
