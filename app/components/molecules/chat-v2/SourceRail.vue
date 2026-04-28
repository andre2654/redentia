<!--
  Source rail — Perplexity signature feature.
  Horizontal scroll of source cards with logo (favicon-fetched from
  the URL host), title, publisher. Hover lifts subtly.
-->
<template>
  <div class="chat-source-rail flex gap-2 overflow-x-auto pb-1">
    <a
      v-for="cite in citations"
      :key="cite.id"
      :href="cite.source.url ?? '#'"
      target="_blank"
      rel="noopener noreferrer"
      class="chat-source-card group flex shrink-0 flex-col gap-2 rounded-2xl px-3.5 py-3 transition-all"
      :style="{
        backgroundColor: `color-mix(in srgb, var(--brand-surface) 55%, transparent)`,
        border: `1px solid color-mix(in srgb, var(--brand-border) 30%, transparent)`,
      }"
    >
      <!-- Top: index + host -->
      <div class="flex items-center gap-2">
        <span
          class="font-mono-tab inline-flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-bold tabular-nums"
          :style="{
            backgroundColor: `color-mix(in srgb, var(--brand-primary) 18%, transparent)`,
            color: 'var(--brand-primary)',
          }"
        >
          {{ cite.id }}
        </span>
        <NuxtImg
          v-if="favicon(cite.source.url)"
          :src="favicon(cite.source.url) ?? ''"
          alt=""
          width="14"
          height="14"
          loading="lazy"
          decoding="async"
          class="size-3.5 shrink-0 rounded-sm object-cover"
          :onerror="hideOnError"
        />
        <span
          class="font-mono-tab truncate text-[10.5px] uppercase tracking-[0.1em]"
          :style="{ color: 'var(--brand-text-muted)' }"
        >
          {{ host(cite.source.url) ?? cite.source.type ?? 'Fonte' }}
        </span>
      </div>

      <!-- Title -->
      <span
        class="line-clamp-2 text-[12.5px] font-medium leading-snug"
        :style="{ color: 'var(--brand-text)' }"
      >
        {{ cite.source.title ?? cite.source.url ?? 'Sem título' }}
      </span>

      <!-- Date if present -->
      <span
        v-if="cite.source.publishedAt"
        class="mt-auto font-mono-tab text-[10px] tabular-nums"
        :style="{ color: 'var(--brand-text-muted)' }"
      >
        {{ formatDate(cite.source.publishedAt) }}
      </span>
    </a>
  </div>
</template>

<script setup lang="ts">
import type { ChatCitation } from '~/composables/useChatStream'

defineProps<{
  citations: ChatCitation[]
}>()

const brand = useBrand()

function host(url?: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    return u.host.replace(/^www\./, '')
  } catch {
    return null
  }
}

function favicon(url?: string): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${u.host}&sz=32`
  } catch {
    return null
  }
}

function hideOnError(e: Event) {
  ;(e.target as HTMLElement).style.display = 'none'
}

function formatDate(s?: string): string {
  if (!s) return ''
  try {
    const d = new Date(s)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}
</script>

<style scoped>
.chat-source-rail {
  scrollbar-width: none;
}
.chat-source-rail::-webkit-scrollbar {
  display: none;
}
.chat-source-card {
  width: 220px;
  min-height: 96px;
}
.chat-source-card:hover {
  border-color: color-mix(in srgb, currentColor 22%, transparent) !important;
  background-color: color-mix(in srgb, currentColor 4%, transparent) !important;
  transform: translateY(-1px);
}
</style>
