<!--
  ArtifactPanel — right-side / bottom-sheet panel for long-form
  artifacts (reports, comparisons, spreadsheets).
-->
<template>
  <div class="flex h-full min-h-0 flex-col">
    <!-- Header -->
    <header
      class="flex flex-shrink-0 items-center justify-between gap-2 border-b px-4 py-3"
      :style="{ borderColor: `color-mix(in srgb, var(--brand-border) 40%, transparent)` }"
    >
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-lg"
          :style="{
            backgroundColor: `color-mix(in srgb, var(--brand-primary) 18%, transparent)`,
            color: 'var(--brand-primary)',
          }"
        >
          <UIcon :name="iconName" class="size-4" />
        </span>
        <div class="flex min-w-0 flex-col leading-tight">
          <span class="truncate text-[13px] font-semibold" :style="{ color: 'var(--brand-text)' }">
            {{ artifact.title }}
          </span>
          <span
            class="font-mono-tab text-[10px] uppercase tracking-[0.14em]"
            :style="{ color: 'var(--brand-text-muted)' }"
          >
            {{ typeLabel }}
          </span>
        </div>
      </div>

      <a
        v-if="artifact.downloadUrl"
        :href="artifact.downloadUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-colors"
        :style="{
          borderColor: `color-mix(in srgb, var(--brand-primary) 40%, transparent)`,
          color: 'var(--brand-primary)',
        }"
      >
        <UIcon name="i-lucide-download" class="size-3" />
        Baixar
      </a>

      <button
        type="button"
        class="flex size-8 items-center justify-center rounded-lg transition-colors"
        :style="{ color: 'var(--brand-text-muted)' }"
        aria-label="Fechar artifact"
        @click="$emit('close')"
      >
        <UIcon name="i-lucide-x" class="size-4" />
      </button>
    </header>

    <!-- Body -->
    <div class="flex-1 overflow-y-auto px-4 py-4 md:px-6">
      <template v-if="artifact.type === 'spreadsheet'">
        <div
          class="rounded-lg border px-4 py-6 text-center"
          :style="{
            borderColor: `color-mix(in srgb, var(--brand-border) 60%, transparent)`,
            backgroundColor: `color-mix(in srgb, var(--brand-surface) 65%, transparent)`,
          }"
        >
          <UIcon
            name="i-lucide-file-spreadsheet"
            class="mx-auto size-8"
            :style="{ color: 'var(--brand-primary)' }"
          />
          <p class="mt-3 text-[14px] font-medium" :style="{ color: 'var(--brand-text)' }">
            {{ artifact.filename ?? 'planilha.xlsx' }}
          </p>
          <p class="mt-1 text-[12px]" :style="{ color: 'var(--brand-text-muted)' }">
            Planilha Excel pronta para download. Pode editar livremente.
          </p>
          <a
            v-if="artifact.downloadUrl"
            :href="artifact.downloadUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors"
            :style="{
              backgroundColor: 'var(--brand-primary)',
              color: 'var(--brand-background)',
            }"
          >
            <UIcon name="i-lucide-download" class="size-4" />
            Baixar planilha
          </a>
        </div>
      </template>

      <template v-else>
        <div
          class="prose prose-sm max-w-none"
          :style="{ color: brand.colors.text }"
          v-html="renderedContent"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatArtifact } from '~/composables/useChatStream'
import { maskCurrency } from '~/utils/maskCurrency'

const props = defineProps<{
  artifact: ChatArtifact
}>()

defineEmits<{
  close: []
}>()

const brand = useBrand()

const iconName = computed(() => {
  if (props.artifact.type === 'spreadsheet') return 'i-lucide-file-spreadsheet'
  if (props.artifact.type === 'comparison') return 'i-lucide-table'
  if (props.artifact.type === 'portfolio') return 'i-lucide-briefcase'
  return 'i-lucide-file-text'
})

const typeLabel = computed(() => {
  if (props.artifact.type === 'spreadsheet') return 'Planilha · XLSX'
  if (props.artifact.type === 'report') return 'Relatório'
  if (props.artifact.type === 'comparison') return 'Comparativo'
  if (props.artifact.type === 'portfolio') return 'Carteira'
  return 'Documento'
})

// Reveal toggle — mascara R$ no artifact tambem (ja que o artifact
// frequentemente e um resumo gerado pela IA com valores totais).
const interfaceStore = useInterfaceStore()

// Trivial markdown→HTML for non-spreadsheet artifacts. Aplica o
// mascarar de currency apos o render quando reveal=false.
const renderedContent = computed(() => {
  const c = props.artifact.content ?? ''
  const html = c
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
  return interfaceStore.revealAmount ? html : maskCurrency(html)
})
</script>
