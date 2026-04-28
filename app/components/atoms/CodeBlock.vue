<template>
  <div
    class="overflow-hidden rounded-lg border"
    :style="{ borderColor: 'var(--brand-border)', backgroundColor: `var(--brand-surface)E6` }"
  >
    <!-- Header with label + copy button -->
    <div
      class="flex items-center justify-between border-b px-4 py-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
      :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-background)', color: 'var(--brand-text-muted)' }"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-chevron-right" class="size-3" :style="{ color: 'var(--brand-primary)' }" />
        {{ label }}
      </div>
      <button
        class="inline-flex items-center gap-1 rounded px-2 py-0.5 transition-colors hover:opacity-70"
        :style="{ color: 'var(--brand-text-muted)' }"
        @click="copy"
      >
        <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" class="size-3" />
        <span class="hidden sm:inline">{{ copied ? 'Copiado' : 'Copiar' }}</span>
      </button>
    </div>

    <!-- Code body -->
    <pre
      class="overflow-x-auto px-5 py-4 font-mono-tab text-[12px] leading-relaxed"
      :style="{ color: 'var(--brand-text)' }"
    ><code v-html="highlighted"></code></pre>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  code: string
  lang?: string
}>()

const brand = useBrand()
const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch {}
}

// Very lightweight syntax highlighting, no external lib, just regex
// for the 4 cases we actually render: bash/curl, JSON, HTTP headers,
// and generic programming languages. Much cheaper than pulling in
// Shiki/Prism for a handful of snippets.
const highlighted = computed(() => {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  let code = esc(props.code)

  const colors = {
    key: brand.colors.primary,
    str: brand.colors.positive,
    num: brand.colors.text,
    cmt: brand.colors.textMuted,
    kw: brand.colors.primary,
  }

  // Comments, # ... (bash) or // ... (js/go)
  code = code.replace(
    /(^|\n)(\s*(?:#|\/\/)[^\n]*)/g,
    `$1<span style="color:${colors.cmt}">$2</span>`
  )

  // Strings (double-quoted)
  code = code.replace(
    /("(?:[^"\\]|\\.)*")/g,
    `<span style="color:${colors.str}">$1</span>`
  )

  // Numbers
  code = code.replace(
    /\b(\d+(?:\.\d+)?)\b/g,
    `<span style="color:${colors.num}">$1</span>`
  )

  // curl flags / bash keywords
  if (props.lang === 'bash' || /curl/.test(props.code)) {
    code = code.replace(
      /\b(curl|GET|POST|PUT|DELETE)\b/g,
      `<span style="color:${colors.kw};font-weight:600">$1</span>`
    )
    code = code.replace(
      /(\s)(-X|--request|--url|--header|-H|-d|--data)/g,
      `$1<span style="color:${colors.kw}">$2</span>`
    )
  }

  return code
})
</script>
