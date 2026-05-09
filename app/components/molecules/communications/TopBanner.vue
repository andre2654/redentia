<!--
  TopBanner — banner full-width sticky no topo absoluto da app,
  controlado por Communication com type=banner, placement=top.

  Renderiza UM banner por vez (o maior priority entre os ativos).
  Marca seen automaticamente ao montar; click marca clicked;
  X marca dismissed (e some pra sempre pra esse user/client).

  Layout: ocupa 100% da largura da janela (passa por cima da sidebar
  do default.vue). Close button absoluto no canto direito. Conteudo
  centralizado com max-width interno pra nao explodir em ultrawide.
-->
<template>
  <Transition name="banner-slide">
    <div
      v-if="banner"
      class="comm-banner"
      role="status"
    >
      <div class="comm-banner__glow" aria-hidden="true" />
      <div class="comm-banner__inner">
        <span v-if="banner.icon" class="comm-banner__icon-pill">
          <UIcon
            :name="banner.icon"
            class="size-4"
            aria-hidden="true"
          />
        </span>
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
      </div>
      <button
        v-if="banner.dismissible"
        type="button"
        class="comm-banner__close"
        aria-label="Fechar banner"
        @click="onDismiss"
      >
        <UIcon name="i-lucide-x" class="size-4" />
      </button>
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
      void service.markSeen(banner.value.id)
    }
  } catch (e) {
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
/* =========================================================
   Container — full-width, gradient marcante, glow sutil
   ========================================================= */
.comm-banner {
  position: relative;
  width: 100%;
  z-index: 50;
  background:
    /* radial glow no canto esquerdo */
    radial-gradient(ellipse 600px 200px at 12% 50%,
      color-mix(in srgb, var(--brand-primary) 22%, transparent) 0%,
      transparent 70%),
    /* base gradient horizontal */
    linear-gradient(90deg,
      color-mix(in srgb, var(--brand-primary) 18%, var(--brand-surface)) 0%,
      color-mix(in srgb, var(--brand-primary) 6%, var(--brand-surface)) 50%,
      var(--brand-surface) 100%
    );
  border-bottom: 1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent);
  box-shadow:
    0 1px 0 0 color-mix(in srgb, var(--brand-primary) 12%, transparent) inset,
    0 8px 24px -16px color-mix(in srgb, var(--brand-primary) 35%, transparent);
}

/* Highlight diagonal animado (subtle) — opcional vibrato visual */
.comm-banner__glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    105deg,
    transparent 30%,
    color-mix(in srgb, var(--brand-primary) 8%, transparent) 50%,
    transparent 70%
  );
  opacity: 0.6;
  mix-blend-mode: overlay;
}

.comm-banner__inner {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 56px 12px 24px;  /* right padding deixa espaço pro X absoluto */
  color: var(--brand-text);
  max-width: 1600px;
  margin: 0 auto;
}

/* Icon pill amber */
.comm-banner__icon-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-primary) 22%, transparent);
  color: var(--brand-primary);
  flex-shrink: 0;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--brand-primary) 25%, transparent) inset,
    0 4px 12px -4px color-mix(in srgb, var(--brand-primary) 40%, transparent);
}

/* Content */
.comm-banner__content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 14px;
  min-width: 0;
}

.comm-banner__title {
  font-family: var(--brand-font);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--brand-text);
}

.comm-banner__body {
  font-size: 13px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
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

/* CTA — pill amber com sombra */
.comm-banner__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  background: var(--brand-primary);
  color: var(--text-on-primary, var(--brand-background, #fff));
  font-family: var(--brand-font);
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  text-decoration: none;
  transition: filter 150ms, transform 100ms, box-shadow 150ms;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow:
    0 1px 0 0 color-mix(in srgb, white 25%, transparent) inset,
    0 6px 16px -6px color-mix(in srgb, var(--brand-primary) 60%, transparent);
}
.comm-banner__cta:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
  box-shadow:
    0 1px 0 0 color-mix(in srgb, white 30%, transparent) inset,
    0 8px 20px -6px color-mix(in srgb, var(--brand-primary) 70%, transparent);
}
.comm-banner__cta:active {
  transform: translateY(0);
}

/* Close — absoluto no canto direito, fora do flex flow */
.comm-banner__close {
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms, border-color 150ms;
  flex-shrink: 0;
  z-index: 1;
}
.comm-banner__close:hover {
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  border-color: color-mix(in srgb, var(--brand-text) 12%, transparent);
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

/* Mobile */
@media (max-width: 640px) {
  .comm-banner__inner {
    padding: 10px 48px 10px 14px;
    gap: 10px;
  }
  .comm-banner__icon-pill {
    width: 28px;
    height: 28px;
  }
  .comm-banner__title {
    font-size: 13px;
  }
  .comm-banner__body {
    display: none;
  }
  .comm-banner__cta {
    padding: 6px 10px;
    font-size: 11.5px;
  }
  .comm-banner__close {
    right: 8px;
    width: 28px;
    height: 28px;
  }
}
</style>
