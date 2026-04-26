<!--
  ChatV2Layout — minimalist 3-pane shell.

  Restraint pass (audit follow-up):
  - Removed animated MAX top-line shine (8s infinite). Replaced
    with a flat 1px brand-tinted hairline. Tier identity now lives
    in tone (background tint), not motion.
  - Removed dual-layer radial halo for MAX. Single subtle radial
    is enough — the audit found the ambient blob was contributing
    cumulative muddiness without carrying information.
  - Sidebar / artifact panes use one neutral tint (no per-tier mix).
-->
<template>
  <div
    class="chat-shell fixed inset-0 z-30 flex"
    :class="tier === 'max' ? 'is-max' : 'is-basic'"
    :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
  >
    <!-- Ambient gradient — single subtle radial, tier-agnostic.
         Decorative only; pointer-events-none so nothing blocks the
         actual content. -->
    <div
      class="pointer-events-none absolute inset-0"
      :style="{
        backgroundImage: `radial-gradient(ellipse 80% 50% at 50% 0%, ${brand.colors.primary}10 0%, transparent 60%)`,
      }"
      aria-hidden="true"
    />

    <!-- MAX-only top hairline — flat 1px line, no animation.
         Communicates tier identity through colour alone. -->
    <div
      v-if="tier === 'max'"
      class="pointer-events-none absolute inset-x-0 top-0 h-px"
      :style="{
        backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 70%, transparent)`,
      }"
      aria-hidden="true"
    />

    <!-- Sidebar (desktop) -->
    <aside
      class="hidden h-full w-[260px] shrink-0 flex-col xl:flex"
      :style="{
        backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 25%, ${brand.colors.background})`,
      }"
    >
      <slot name="sidebar" />
    </aside>

    <!-- Sidebar (mobile sheet) -->
    <Transition name="chat-sheet-left">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 xl:hidden"
      >
        <!-- Click on the backdrop closes the drawer. Children of this
             div fill the screen, so .self on the parent never fires —
             handle the click directly on the backdrop instead. -->
        <button
          type="button"
          class="fixed inset-0 backdrop-blur-sm"
          :style="{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }"
          aria-label="Fechar conversas"
          @click="$emit('close-sidebar')"
        />
        <aside
          class="fixed left-0 top-0 z-50 flex h-full w-[88vw] max-w-[340px] flex-col"
          :style="{ backgroundColor: brand.colors.surface }"
          @click.stop
        >
          <slot name="sidebar" />
        </aside>
      </div>
    </Transition>

    <!-- Thread -->
    <main class="relative flex h-full min-w-0 flex-1">
      <slot name="thread" />
    </main>

    <!-- Artifact panel (desktop) -->
    <Transition name="chat-artifact">
      <aside
        v-if="artifactOpen"
        class="hidden h-full w-[440px] shrink-0 flex-col xl:flex"
        :style="{
          backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 30%, ${brand.colors.background})`,
        }"
      >
        <slot name="artifact" />
      </aside>
    </Transition>

    <!-- Artifact (mobile bottom sheet) -->
    <Transition name="chat-sheet-bottom">
      <div
        v-if="artifactOpen"
        class="fixed inset-0 z-40 xl:hidden"
      >
        <button
          type="button"
          class="fixed inset-0 backdrop-blur-sm"
          :style="{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }"
          aria-label="Fechar artefato"
          @click="$emit('close-artifact')"
        />
        <aside
          class="fixed bottom-0 left-0 right-0 z-50 flex h-[90vh] flex-col rounded-t-[28px]"
          :style="{ backgroundColor: brand.colors.surface }"
          @click.stop
        >
          <div class="flex justify-center pb-1 pt-3">
            <span
              class="inline-block h-1 w-12 rounded-full"
              :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 18%, transparent)` }"
            />
          </div>
          <slot name="artifact" />
        </aside>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  sidebarOpen: boolean
  artifactOpen: boolean
  tier?: 'basic' | 'max'
}>()
defineEmits<{
  'close-sidebar': []
  'close-artifact': []
}>()
const brand = useBrand()
</script>

<style scoped>
.chat-sheet-left-enter-active,
.chat-sheet-left-leave-active,
.chat-sheet-bottom-enter-active,
.chat-sheet-bottom-leave-active,
.chat-artifact-enter-active,
.chat-artifact-leave-active {
  transition: opacity 220ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.chat-sheet-left-enter-from,
.chat-sheet-left-leave-to,
.chat-sheet-bottom-enter-from,
.chat-sheet-bottom-leave-to {
  opacity: 0;
}
.chat-artifact-enter-from,
.chat-artifact-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
