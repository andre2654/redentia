<template>
  <section
    v-if="brand.products.categories.length > 0"
    class="border-t py-16 md:py-20"
    :style="{ borderColor: brand.colors.border }"
  >
    <div class="mx-auto max-w-7xl px-6">
      <!-- Section Header -->
      <div class="mb-10 text-center">
        <p class="mb-2 text-xs uppercase tracking-[0.2em]" :style="{ color: brand.colors.textMuted }">
          {{ brand.products.sectionSubtitle }}
        </p>
        <h2 class="text-2xl font-bold md:text-3xl" :style="{ color: brand.colors.text }">
          {{ brand.products.sectionTitle }}
        </h2>
      </div>

      <!-- Categories -->
      <div class="flex flex-col gap-10">
        <div
          v-for="category in brand.products.categories"
          :key="category.name"
        >
          <!-- Category Header -->
          <div class="mb-4 flex items-center gap-3">
            <div class="h-px flex-1" :style="{ backgroundColor: brand.colors.border }" />
            <h3 class="text-xs font-semibold uppercase tracking-widest" :style="{ color: brand.colors.textMuted }">
              {{ category.name }}
            </h3>
            <div class="h-px flex-1" :style="{ backgroundColor: brand.colors.border }" />
          </div>

          <!-- Grid -->
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              v-for="item in category.items"
              :key="item.title"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              class="group relative flex gap-4 rounded-2xl border p-4 transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-300 hover:border-secondary/40"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
            >
              <!-- Cover Image -->
              <div class="relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-24">
                <img
                  :src="item.image"
                  :alt="item.title"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                >
                <!-- Badge -->
                <span
                  v-if="item.badge"
                  class="absolute left-0 top-0 rounded-br-lg rounded-tl-xl bg-secondary px-2 py-0.5 text-[10px] font-bold text-black"
                >
                  {{ item.badge }}
                </span>
              </div>

              <!-- Card Content -->
              <div class="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                <div>
                  <h4 class="font-semibold leading-tight transition-colors group-hover:text-secondary" :style="{ color: brand.colors.text }">
                    {{ item.title }}
                  </h4>
                  <p class="mt-1 line-clamp-2 text-xs leading-relaxed" :style="{ color: brand.colors.textMuted }">
                    {{ item.description }}
                  </p>
                </div>

                <!-- Meta Row -->
                <div class="mt-2 flex items-center gap-2">
                  <!-- Price -->
                  <span
                    v-if="item.price"
                    class="rounded-md bg-secondary/10 px-2 py-0.5 text-xs font-bold text-secondary"
                  >
                    {{ item.price }}
                  </span>

                  <!-- Rating -->
                  <span
                    v-if="item.rating"
                    class="flex items-center gap-1 text-xs"
                    :style="{ color: brand.colors.textMuted }"
                  >
                    <UIcon
                      name="i-lucide-star"
                      class="h-3 w-3 text-yellow-400"
                    />
                    {{ item.rating }}
                  </span>

                  <!-- Students -->
                  <span
                    v-if="item.students"
                    class="ml-auto text-[11px]"
                    :style="{ color: brand.colors.textMuted }"
                  >
                    {{ item.students }}
                  </span>
                </div>
              </div>

              <!-- Arrow -->
              <div class="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full opacity-0 transition-[transform,opacity,box-shadow,background-color,border-color,filter] group-hover:opacity-100" :style="{ backgroundColor: brand.colors.border }">
                <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" class="h-3 w-3" :style="{ color: brand.colors.textMuted }" />
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const brand = useBrand()
</script>
