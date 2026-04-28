<template>
  <section v-if="brand.educational.items.length > 0" class="py-16 md:py-20">
    <div class="mx-auto max-w-6xl px-6">
      <div class="mb-12 text-center">
        <p class="mb-2 text-xs uppercase tracking-[0.2em]" :style="{ color: 'var(--brand-text-muted)' }">
          Conteudo educacional
        </p>
        <h2 class="text-2xl font-bold md:text-3xl" :style="{ color: 'var(--brand-text)' }">
          {{ brand.educational.sectionTitle }}
        </h2>
        <p class="mt-3" :style="{ color: 'var(--brand-text-muted)' }">
          {{ brand.educational.sectionSubtitle }}
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <a
          v-for="item in brand.educational.items"
          :key="item.title"
          :href="item.url"
          target="_blank"
          rel="noopener"
          class="group flex flex-col overflow-hidden rounded-2xl border transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-300"
          :style="{
            borderColor: 'var(--brand-border)',
            backgroundColor: 'var(--brand-surface)',
          }"
          @mouseenter="($event.currentTarget as HTMLElement).style.borderColor = brand.colors.secondary; ($event.currentTarget as HTMLElement).style.backgroundColor = brand.colors.surfaceHover"
          @mouseleave="($event.currentTarget as HTMLElement).style.borderColor = brand.colors.border; ($event.currentTarget as HTMLElement).style.backgroundColor = brand.colors.surface"
        >
          <!-- Thumbnail -->
          <div class="relative aspect-video w-full overflow-hidden">
            <img
              :src="item.thumbnail"
              :alt="item.title"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            <!-- Play button overlay for videos -->
            <div
              v-if="item.type === 'video'"
              class="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors duration-300 group-hover:bg-black/40"
            >
              <div class="flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-sm transition-transform duration-300 group-hover:scale-110" :style="{ backgroundColor: 'var(--brand-surface)' }">
                <UIcon name="i-lucide-play" class="h-6 w-6" :style="{ color: 'var(--brand-text)' }" />
              </div>
            </div>

            <!-- Badge -->
            <span
              v-if="item.badge"
              class="absolute right-3 top-3 rounded-full bg-secondary px-3 py-1 text-xs font-semibold"
              :style="{ color: 'var(--brand-text)' }"
            >
              {{ item.badge }}
            </span>
          </div>

          <!-- Content -->
          <div class="flex flex-1 flex-col gap-2 p-5">
            <!-- Type & Duration -->
            <div class="flex items-center gap-2" :style="{ color: 'var(--brand-text-muted)' }">
              <UIcon :name="typeIcon(item.type)" class="h-4 w-4" />
              <span class="text-xs uppercase tracking-wider">{{ typeLabel(item.type) }}</span>
              <template v-if="item.duration">
                <span :style="{ color: 'var(--brand-text-muted)' }">&middot;</span>
                <span class="text-xs">{{ item.duration }}</span>
              </template>
            </div>

            <!-- Title -->
            <h3 class="font-bold transition-colors duration-200 group-hover:text-secondary" :style="{ color: brand.colors.text }">
              {{ item.title }}
            </h3>

            <!-- Description -->
            <p class="line-clamp-2 text-sm" :style="{ color: brand.colors.textMuted }">
              {{ item.description }}
            </p>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const brand = useBrand()

function typeIcon(type: string) {
  const icons: Record<string, string> = {
    video: 'i-lucide-play-circle',
    article: 'i-lucide-file-text',
    podcast: 'i-lucide-headphones',
  }
  return icons[type] ?? 'i-lucide-file-text'
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    video: 'Video',
    article: 'Artigo',
    podcast: 'Podcast',
  }
  return labels[type] ?? type
}
</script>
