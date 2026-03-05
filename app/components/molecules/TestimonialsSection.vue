<template>
  <section class="py-16 md:py-20" :style="{ backgroundColor: brand.colors.surface }">
    <div class="mx-auto max-w-6xl px-6">
      <div class="mb-12 text-center">
        <p class="mb-2 text-xs uppercase tracking-[0.2em]" :style="{ color: brand.colors.textMuted }">
          Histórias de sucesso
        </p>
        <h2 class="text-2xl font-bold md:text-3xl" :style="{ color: brand.colors.text }">
          {{ brand.testimonials.sectionTitle }}
        </h2>
        <p class="mt-3" :style="{ color: brand.colors.textMuted }">
          {{ brand.testimonials.sectionSubtitle }}
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="testimonial in brand.testimonials.items"
          :key="testimonial.name"
          class="flex flex-col gap-4 rounded-2xl border p-6"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <!-- Quote -->
          <p class="flex-1" :style="{ color: brand.colors.textMuted }">
            "{{ testimonial.quote }}"
          </p>

          <!-- Metrics -->
          <div class="flex gap-4 border-t pt-4" :style="{ borderColor: brand.colors.border }">
            <div 
              v-for="metric in testimonial.metrics" 
              :key="metric.label"
              class="text-center"
            >
              <span class="block text-lg font-bold text-secondary">
                {{ metric.value }}
              </span>
              <span class="text-xs" :style="{ color: brand.colors.textMuted }">
                {{ metric.label }}
              </span>
            </div>
          </div>

          <!-- Author -->
          <div class="flex items-center gap-3">
            <UAvatar 
              :alt="testimonial.name" 
              size="md"
              class="bg-secondary/20"
            />
            <div>
              <p class="font-medium" :style="{ color: brand.colors.text }">{{ testimonial.name }}</p>
              <p class="text-sm" :style="{ color: brand.colors.textMuted }">{{ testimonial.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const brand = useBrand()
</script>
