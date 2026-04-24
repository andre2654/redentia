<!--
  Accessible destructive-action confirm dialog. Replaces window.confirm()
  which (a) looks inconsistent across browsers/OS, (b) can be blocked by
  popup policy, (c) can't be styled, and (d) provides weaker focus
  management than a modal. Uses <dialog> for native focus-trap + ESC
  handling.

  Usage:
    const dialogRef = ref<InstanceType<typeof ConfirmDialog>>()
    await dialogRef.value?.open({
      title: 'Remover tenant?',
      description: 'Esta ação não pode ser desfeita.',
      confirmLabel: 'Remover',
      cancelLabel: 'Cancelar',
      variant: 'destructive',
    })
-->
<template>
  <dialog
    ref="dialogEl"
    class="confirm-dialog relative w-full max-w-md rounded-xl border p-0 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.text }"
    @close="handleClose"
    @cancel="handleCancel"
  >
    <form v-if="state" method="dialog" class="flex flex-col gap-4 p-6">
      <header class="flex items-start gap-3">
        <div
          v-if="state.variant === 'destructive'"
          class="flex size-10 shrink-0 items-center justify-center rounded-full"
          :style="{ backgroundColor: `${brand.colors.negative}1F`, color: brand.colors.negative }"
          aria-hidden="true"
        >
          <UIcon name="i-lucide-alert-triangle" class="size-5" />
        </div>
        <div class="flex flex-col gap-1">
          <h2 class="text-lg font-semibold" :style="{ color: brand.colors.text }">
            {{ state.title }}
          </h2>
          <p v-if="state.description" class="text-sm" :style="{ color: brand.colors.textMuted }">
            {{ state.description }}
          </p>
        </div>
      </header>

      <footer class="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          :style="{
            borderColor: brand.colors.border,
            color: brand.colors.text,
            backgroundColor: 'transparent',
          }"
          @click="resolve(false)"
        >
          {{ state.cancelLabel ?? 'Cancelar' }}
        </button>
        <button
          ref="confirmBtn"
          type="button"
          class="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          :style="confirmStyle"
          @click="resolve(true)"
        >
          {{ state.confirmLabel ?? 'Confirmar' }}
        </button>
      </footer>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

type Variant = 'destructive' | 'default'

interface DialogOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: Variant
}

const brand = useBrand()
const dialogEl = ref<HTMLDialogElement | null>(null)
const confirmBtn = ref<HTMLButtonElement | null>(null)
const state = ref<DialogOptions | null>(null)
let currentResolver: ((value: boolean) => void) | null = null

const confirmStyle = computed(() => {
  if (state.value?.variant === 'destructive') {
    return {
      backgroundColor: brand.colors.negative,
      color: '#fff',
      borderColor: brand.colors.negative,
    }
  }
  return {
    backgroundColor: brand.colors.primary,
    color: brand.colors.background,
    borderColor: brand.colors.primary,
  }
})

async function open(options: DialogOptions): Promise<boolean> {
  state.value = options
  await nextTick()
  dialogEl.value?.showModal()
  await nextTick()
  confirmBtn.value?.focus()
  return new Promise<boolean>((resolve) => {
    currentResolver = resolve
  })
}

function resolve(value: boolean) {
  if (dialogEl.value?.open) {
    dialogEl.value.close(value ? 'confirm' : 'cancel')
  }
  currentResolver?.(value)
  currentResolver = null
  state.value = null
}

function handleClose() {
  if (currentResolver) {
    currentResolver(false)
    currentResolver = null
    state.value = null
  }
}

function handleCancel(event: Event) {
  event.preventDefault()
  resolve(false)
}

defineExpose({ open })
</script>

<style scoped>
.confirm-dialog {
  /* Viewport-centered regardless of browser engine. */
  margin: auto;
  inset: 0;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
}
.confirm-dialog[open] {
  animation: confirm-fade-in 0.15s ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .confirm-dialog[open] {
    animation: none;
  }
}
@keyframes confirm-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
