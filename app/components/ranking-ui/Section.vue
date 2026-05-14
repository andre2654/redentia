<!--
  RankingUiSection: wrapper editorial pra blocos abaixo do split.
  Padding consistente + eyebrow opcional + H2 italic serif (via slot title com em).
  Use pra conteúdo SEO (educacional, FAQ headings, glossário, cross-links).
  Slots: eyebrow, title, lead, default (corpo). Props: eyebrow, title, tone (default/subtle/highlight), maxWidth.
-->
<template>
  <section :class="['rk-section', tone === 'subtle' && 'is-subtle', tone === 'highlight' && 'is-highlight']">
    <div class="rk-section-inner" :style="maxWidth ? `max-width: ${maxWidth}px;` : ''">
      <header v-if="$slots.eyebrow || eyebrow || $slots.title || title" class="rk-section-head">
        <p v-if="$slots.eyebrow || eyebrow" class="rk-section-eyebrow">
          <slot name="eyebrow">{{ eyebrow }}</slot>
        </p>
        <h2 v-if="$slots.title || title" class="rk-section-title">
          <slot name="title">{{ title }}</slot>
        </h2>
        <p v-if="$slots.lead" class="rk-section-lead">
          <slot name="lead" />
        </p>
      </header>

      <div class="rk-section-body">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    tone?: 'default' | 'subtle' | 'highlight'
    maxWidth?: number
  }>(),
  { tone: 'default' }
)
</script>

<style scoped>
.rk-section {
  position: relative;
  z-index: 1;
  padding: 56px 24px;
  border-top: 1px solid var(--border-subtle);
}
@media (min-width: 768px) { .rk-section { padding: 72px 32px; } }
@media (min-width: 1024px) { .rk-section { padding: 88px 32px; } }

.rk-section.is-subtle {
  background: color-mix(in srgb, var(--bg-overlay) 50%, transparent);
}
.rk-section.is-highlight {
  background: color-mix(in srgb, var(--brand-primary) 4%, transparent);
}

.rk-section-inner {
  max-width: 880px;
  margin: 0 auto;
}

.rk-section-head { margin-bottom: 32px; }
.rk-section-eyebrow {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--brand-primary);
  margin: 0 0 12px;
}
.rk-section-title {
  font-size: clamp(26px, 3.5vw, 38px);
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--text-heading);
  margin: 0;
}
.rk-section-title :deep(em) {
  font-family: 'Instrument Serif', Georgia, serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
}
.rk-section-lead {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-body);
  margin: 16px 0 0;
  max-width: 56ch;
}

.rk-section-body :deep(p) {
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-body);
  margin: 0 0 16px;
}
.rk-section-body :deep(p:last-child) { margin-bottom: 0; }
.rk-section-body :deep(h3) {
  font-size: clamp(20px, 2.5vw, 24px);
  font-weight: 500;
  letter-spacing: -0.018em;
  color: var(--text-heading);
  margin: 32px 0 12px;
}
.rk-section-body :deep(h3:first-child) { margin-top: 0; }
.rk-section-body :deep(ul),
.rk-section-body :deep(ol) {
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-body);
  padding-left: 1.25em;
  margin: 0 0 16px;
}
.rk-section-body :deep(li) { margin-bottom: 8px; }
.rk-section-body :deep(strong) { color: var(--text-heading); font-weight: 500; }
</style>
