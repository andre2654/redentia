<!--
  HighlightsProgressBar — Spotify/Instagram-stories style segmented
  progress bar.

  N segments, each representing a slide. The currently-active segment
  fills 0->100% based on the timeline progress. Completed segments are
  fully filled, future ones are dim. Click a segment to jump to it.
-->
<template>
  <div class="hp-bar" role="progressbar" :aria-valuenow="progressPct" aria-valuemin="0" aria-valuemax="100">
    <button
      v-for="(_, i) in count"
      :key="i"
      type="button"
      class="hp-bar__seg"
      :class="{ 'is-active': i === activeIndex, 'is-done': i < activeIndex }"
      :style="{
        '--hp-progress': i === activeIndex ? `${progressPct}%` : i < activeIndex ? '100%' : '0%',
      }"
      :aria-label="`Slide ${i + 1}`"
      @click="$emit('jump', i)"
    >
      <span class="hp-bar__fill" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  count: number
  activeIndex: number
  /** 0..1 progress within the active slide. */
  progress: number
}
const props = defineProps<Props>()
defineEmits<{ jump: [index: number] }>()

const progressPct = computed(() => Math.round(props.progress * 100))
</script>

<style scoped>
.hp-bar {
  display: flex;
  gap: 6px;
  width: 100%;
}

.hp-bar__seg {
  position: relative;
  flex: 1;
  height: 3px;
  border: 0;
  padding: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  cursor: pointer;
  overflow: hidden;
  transition: background 200ms ease-out;
}

.hp-bar__seg:hover {
  background: rgba(255, 255, 255, 0.28);
}

.hp-bar__seg:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 3px;
}

.hp-bar__fill {
  display: block;
  position: absolute;
  inset: 0;
  width: var(--hp-progress, 0%);
  background: #fff;
  transition: width 80ms linear;
}

.hp-bar__seg.is-done .hp-bar__fill {
  width: 100% !important;
  transition: none;
}
</style>
