<!--
  TopBanner — banner sticky no topo do app, controlado por
  Communication com type=banner, placement=top.

  Renderiza UM banner por vez (o maior priority entre os ativos).
  Marca seen automaticamente ao montar; click marca clicked;
  X marca dismissed (e some pra sempre pra esse user/client).
-->
<template>
  <Transition name="banner-slide">
    <div
      v-if="banner"
      class="comm-banner"
      role="status"
    >
      <div class="comm-banner__inner">
        <UIcon
          v-if="banner.icon"
          :name="banner.icon"
          class="size-4 shrink-0"
          aria-hidden="true"
        />
        <div class="comm-banner__content">
          <span class="comm-banner__title">{{ banner.title }}</span>
          <span
            v-if="banner.body"
            class="comm-banner__body"
            v-html="renderedBody"
          />
        </div>
        <a
          v-if="banner.link_url"
          :href="banner.link_url"
          class="comm-banner__cta"
          target="_blank"
          rel="noopener"
          @click="onClick"
        >
          {{ banner.link_label || 'Saiba mais' }}
          <UIcon name="i-lucide-arrow-right" class="size-3.5" aria-hidden="true" />
        </a>
        <button
          v-if="banner.dismissible"
          type="button"
          class="comm-banner__close"
          aria-label="Fechar"
          @click="onDismiss"
        >
          <UIcon name="i-lucide-x" class="size-4" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { CommunicationPublic } from '~/services/communications'
import { sanitizeHtml } from '~/utils/sanitizeHtml'

const service = useCommunicationsService()
const banner = ref<CommunicationPublic | null>(null)

/**
 * Body do banner vem como HTML cru (TipTap output armazenado no DB).
 * Sanitiza com level='inline' antes de renderizar via v-html — so
 * passa <strong>, <em>, <a> com target=_blank rel=noopener.
 */
const renderedBody = computed(() => sanitizeHtml(banner.value?.body || '', 'inline'))

async function load() {
  try {
    const items = await service.listActive('top')
    banner.value = items[0] ?? null
    if (banner.value) {
      // Track impression
      void service.markSeen(banner.value.id)
    }
  } catch (e) {
    // Silent fail — banner nao e critico
    console.warn('[TopBanner] load failed', e)
  }
}

async function onClick() {
  if (!banner.value) return
  await service.markClicked(banner.value.id)
}

async function onDismiss() {
  if (!banner.value) return
  const id = banner.value.id
  banner.value = null
  await service.markDismissed(id)
}

onMounted(() => load())
</script>

<style scoped>
.comm-banner {
  width: 100%;
  background: linear-gradient(90deg,
    color-mix(in srgb, var(--brand-primary) 14%, var(--brand-surface)) 0%,
    color-mix(in srgb, var(--brand-surface) 90%, var(--brand-background)) 100%
  );
  border-bottom: 1px solid color-mix(in srgb, var(--brand-primary) 22%, transparent);
  position: relative;
  z-index: 30;
}

.comm-banner__inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  color: var(--brand-text);
}

.comm-banner__content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 12px;
  min-width: 0;
}

.comm-banner__title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
}

.comm-banner__body {
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}
/* Inline markdown: bold/italic/link rendered via v-html */
.comm-banner__body :deep(strong) {
  font-weight: 600;
  color: var(--brand-text);
}
.comm-banner__body :deep(em) {
  font-style: italic;
  font-family: 'Instrument Serif', Georgia, serif;
}
.comm-banner__body :deep(a) {
  color: var(--brand-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
}

.comm-banner__cta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 8px;
  background: var(--brand-primary);
  color: var(--text-on-primary, var(--brand-background, #fff));
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.005em;
  text-decoration: none;
  transition: filter 150ms;
  white-space: nowrap;
  flex-shrink: 0;
}

.comm-banner__cta:hover {
  filter: brightness(1.05);
}

.comm-banner__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: transparent;
  border: 0;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms;
  flex-shrink: 0;
}

.comm-banner__close:hover {
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  color: var(--brand-text);
}

/* Transition */
.banner-slide-enter-active, .banner-slide-leave-active {
  transition: max-height 280ms ease, opacity 220ms ease;
  overflow: hidden;
}
.banner-slide-enter-from, .banner-slide-leave-to {
  max-height: 0;
  opacity: 0;
}
.banner-slide-enter-to, .banner-slide-leave-from {
  max-height: 200px;
  opacity: 1;
}

@media (max-width: 640px) {
  .comm-banner__inner {
    padding: 10px 14px;
    gap: 10px;
  }
  .comm-banner__body {
    display: none;
  }
}
</style>
