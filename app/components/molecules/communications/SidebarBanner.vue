<!--
  SidebarBanner — card vertical premium na barra lateral, controlado
  por Communication com type=banner, placement=sidebar.

  Renderiza UM banner por vez (o maior priority entre os ativos).
  Marca seen automaticamente ao montar; click marca clicked;
  X marca dismissed (e some pra sempre pra esse user/client).

  Formato: card vertical com radial glow amber + icon pill + eyebrow
  mono + title + body inline-markdown + CTA pill + close button no
  canto. Mesma linguagem visual do TopBanner mas adaptada pro espaço
  estreito (260px sidebar - 24px padding = ~236px utilizáveis).
-->
<template>
  <Transition name="sidebar-banner-fade">
    <div
      v-if="banner"
      class="sb-banner"
      role="status"
    >
      <!-- Glow layer subtle — diagonal shimmer -->
      <div class="sb-banner__glow" aria-hidden="true" />

      <!-- Eyebrow + close row -->
      <div class="sb-banner__head">
        <span class="sb-banner__eyebrow">Em destaque</span>
        <button
          v-if="banner.dismissible"
          type="button"
          class="sb-banner__close"
          aria-label="Fechar"
          @click="onDismiss"
        >
          <UIcon name="i-lucide-x" class="size-3" />
        </button>
      </div>

      <!-- Icon pill (only when icon set) -->
      <span v-if="banner.icon" class="sb-banner__icon-pill">
        <UIcon :name="banner.icon" class="size-4" aria-hidden="true" />
      </span>

      <!-- Title + body -->
      <span class="sb-banner__title">{{ banner.title }}</span>
      <span
        v-if="banner.body"
        class="sb-banner__body"
        v-html="renderedBody"
      />

      <!-- CTA -->
      <a
        v-if="banner.link_url"
        :href="banner.link_url"
        class="sb-banner__cta"
        target="_blank"
        rel="noopener"
        @click="onClick"
      >
        {{ banner.link_label || 'Saiba mais' }}
        <UIcon name="i-lucide-arrow-right" class="size-3" aria-hidden="true" />
      </a>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { CommunicationPublic } from '~/services/communications'
import { sanitizeHtml } from '~/utils/sanitizeHtml'

const service = useCommunicationsService()
const banner = ref<CommunicationPublic | null>(null)

const renderedBody = computed(() => sanitizeHtml(banner.value?.body || '', 'inline'))

async function load() {
  try {
    const items = await service.listActive('sidebar')
    banner.value = items[0] ?? null
    if (banner.value) {
      void service.markSeen(banner.value.id)
    }
  } catch (e) {
    console.warn('[SidebarBanner] load failed', e)
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
   Card — radial glow + gradient + ring inset + shadow externa
   ========================================================= */
.sb-banner {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 12px 14px;
  border-radius: 10px;
  background:
    /* radial glow no canto sup-direito */
    radial-gradient(ellipse 180px 120px at 90% 0%,
      color-mix(in srgb, var(--brand-primary) 28%, transparent) 0%,
      transparent 70%),
    /* base linear vertical pra dar profundidade */
    linear-gradient(180deg,
      color-mix(in srgb, var(--brand-primary) 16%, var(--brand-surface)) 0%,
      color-mix(in srgb, var(--brand-primary) 8%, var(--brand-surface)) 100%
    );
  border: 1px solid color-mix(in srgb, var(--brand-primary) 35%, transparent);
  box-shadow:
    /* ring inset amber pra brilho de borda */
    0 1px 0 0 color-mix(in srgb, var(--brand-primary) 18%, transparent) inset,
    /* shadow amber externa pra "flutuar" */
    0 8px 24px -10px color-mix(in srgb, var(--brand-primary) 50%, transparent),
    /* shadow ambient escura */
    0 2px 8px -4px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

/* Diagonal shimmer overlay */
.sb-banner__glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    115deg,
    transparent 35%,
    color-mix(in srgb, var(--brand-primary) 12%, transparent) 50%,
    transparent 65%
  );
  opacity: 0.5;
  mix-blend-mode: overlay;
}

/* =========================================================
   Head row — eyebrow + close
   ========================================================= */
.sb-banner__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.sb-banner__eyebrow {
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-feature-settings: 'tnum' 1;
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}

.sb-banner__close {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  background: transparent;
  border: 1px solid transparent;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms, border-color 150ms;
}
.sb-banner__close:hover {
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  border-color: color-mix(in srgb, var(--brand-text) 12%, transparent);
  color: var(--brand-text);
}

/* =========================================================
   Icon pill
   ========================================================= */
.sb-banner__icon-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--brand-primary) 22%, transparent);
  color: var(--brand-primary);
  margin-top: 2px;
  margin-bottom: 2px;
  position: relative;
  z-index: 1;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--brand-primary) 25%, transparent) inset,
    0 4px 10px -4px color-mix(in srgb, var(--brand-primary) 40%, transparent);
}

/* =========================================================
   Title + body
   ========================================================= */
.sb-banner__title {
  font-family: var(--brand-font);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--brand-text);
  letter-spacing: -0.01em;
  position: relative;
  z-index: 1;
}

.sb-banner__body {
  font-size: 11.5px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
  position: relative;
  z-index: 1;
}
.sb-banner__body :deep(strong) {
  font-weight: 600;
  color: var(--brand-text);
}
.sb-banner__body :deep(em) {
  font-style: italic;
  font-family: 'Instrument Serif', Georgia, serif;
}
.sb-banner__body :deep(a) {
  color: var(--brand-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* =========================================================
   CTA — pill amber com sombra brilhante
   ========================================================= */
.sb-banner__cta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  padding: 6px 12px;
  border-radius: 7px;
  background: var(--brand-primary);
  color: var(--text-on-primary, var(--brand-background, #fff));
  font-family: var(--brand-font);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  text-decoration: none;
  align-self: flex-start;
  position: relative;
  z-index: 1;
  transition: filter 150ms, transform 100ms, box-shadow 150ms;
  box-shadow:
    0 1px 0 0 color-mix(in srgb, white 25%, transparent) inset,
    0 6px 14px -6px color-mix(in srgb, var(--brand-primary) 70%, transparent);
}
.sb-banner__cta:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
  box-shadow:
    0 1px 0 0 color-mix(in srgb, white 30%, transparent) inset,
    0 8px 18px -6px color-mix(in srgb, var(--brand-primary) 80%, transparent);
}
.sb-banner__cta:active {
  transform: translateY(0);
}

/* =========================================================
   Transition
   ========================================================= */
.sidebar-banner-fade-enter-active {
  transition: opacity 280ms ease, transform 280ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.sidebar-banner-fade-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.sidebar-banner-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}
.sidebar-banner-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
