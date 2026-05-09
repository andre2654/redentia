<!--
  CTASlot — slot para CTA contextual em pontos especificos da app.

  Usage:
    <CTASlot placement="wallet-hero" />
    <CTASlot placement="calculadora-top" />
    <CTASlot placement="ranking-top" />
    ...

  Renderiza so se houver Communication com type=cta + placement
  matching + audiencia bate.

  Modos suportados (auto-detectados a partir dos campos):
    - "image" — image_url presente sem body. A imagem inteira vira
      clicavel e leva ao link_url. Pra criativos prontos, parcerias,
      banners promocionais.
    - "content" (default) — card editorial com titulo + body (HTML
      sanitizado) + icone + botao. body suporta TipTap level=basic
      (negrito, italico, links, listas, etc).
-->
<template>
  <component
    :is="mode === 'image' && cta?.link_url ? 'a' : 'article'"
    v-if="cta"
    :href="mode === 'image' && cta.link_url ? cta.link_url : undefined"
    :target="mode === 'image' && isExternal(cta.link_url) ? '_blank' : undefined"
    :rel="mode === 'image' && isExternal(cta.link_url) ? 'noopener' : undefined"
    :class="['cta-slot', `cta-slot--${mode}`]"
    @click="mode === 'image' ? onClick() : undefined"
  >
      <!-- ================ MODE: IMAGE-ONLY ================
           Imagem inteira clickable. Sem chrome de card. -->
      <template v-if="mode === 'image'">
        <img
          :src="cta.image_url!"
          :alt="cta.title || ''"
          class="cta-slot__image"
          loading="lazy"
        />
        <button
          v-if="cta.dismissible"
          type="button"
          class="cta-slot__close cta-slot__close--floating"
          aria-label="Fechar"
          @click.stop.prevent="onDismiss"
        >
          <UIcon name="i-lucide-x" class="size-4" />
        </button>
      </template>

      <!-- ================ MODE: CONTENT (card) ================ -->
      <template v-else>
        <span class="cta-slot__glow" aria-hidden="true" />

        <img
          v-if="cta.image_url"
          :src="cta.image_url"
          :alt="cta.title || ''"
          class="cta-slot__cover"
          loading="lazy"
        />

        <header class="cta-slot__head">
          <UIcon
            v-if="cta.icon"
            :name="cta.icon"
            class="size-5 shrink-0"
            :style="{ color: 'var(--brand-primary)' }"
            aria-hidden="true"
          />
          <h3 class="cta-slot__title">{{ cta.title }}</h3>
          <button
            v-if="cta.dismissible"
            type="button"
            class="cta-slot__close"
            aria-label="Fechar"
            @click="onDismiss"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </button>
        </header>

        <div
          v-if="cta.body"
          class="cta-slot__body"
          v-html="renderedBody"
        />

        <a
          v-if="cta.link_url"
          :href="cta.link_url"
          :target="isExternal(cta.link_url) ? '_blank' : undefined"
          :rel="isExternal(cta.link_url) ? 'noopener' : undefined"
          class="cta-slot__action"
          @click="onClick"
        >
          <UIcon name="i-lucide-sparkles" class="size-4" aria-hidden="true" />
          <span>{{ cta.link_label || 'Acessar' }}</span>
          <UIcon name="i-lucide-arrow-right" class="size-4" aria-hidden="true" />
        </a>
      </template>
    </component>
</template>

<script setup lang="ts">
import type { CommunicationPlacement, CommunicationPublic } from '~/services/communications'
import { sanitizeHtml } from '~/utils/sanitizeHtml'

interface Props {
  placement: CommunicationPlacement
}
const props = defineProps<Props>()

const service = useCommunicationsService()
const cta = ref<CommunicationPublic | null>(null)

/**
 * Detecta o modo a partir dos dados:
 *   - image-only: tem image_url e nao tem body (admin escolheu modo
 *     "Imagem clicavel" no editor)
 *   - content: caso default (com ou sem image_url, mas tem texto)
 */
const mode = computed<'image' | 'content'>(() => {
  if (!cta.value) return 'content'
  if (cta.value.image_url && !cta.value.body) return 'image'
  return 'content'
})

/**
 * Body do CTA vem como HTML cru (TipTap output do EditorCta).
 * Sanitiza com level='basic' antes de renderizar — passa <p>
 * <strong> <em> <a> <ul> <ol> <li> <blockquote> <h3> <h4>. Bloqueia
 * <script> e atributos onerror/onclick/style.
 */
const renderedBody = computed(() => {
  if (!cta.value?.body) return ''
  return sanitizeHtml(cta.value.body, 'basic')
})

function isExternal(url: string | null | undefined): boolean {
  if (!url) return false
  return /^https?:\/\//i.test(url)
}

async function load() {
  try {
    const items = await service.listActive(props.placement)
    cta.value = items.find((c) => c.type === 'cta') ?? null
    if (cta.value) void service.markSeen(cta.value.id)
  } catch (e) {
    console.warn('[CTASlot] load failed', e)
  }
}

async function onClick() {
  if (!cta.value) return
  await service.markClicked(cta.value.id)
}

async function onDismiss() {
  if (!cta.value) return
  const id = cta.value.id
  cta.value = null
  await service.markDismissed(id)
}

watch(() => props.placement, load, { immediate: false })
onMounted(() => load())
</script>

<style scoped>
/* =========================================================
   Modo IMAGE-ONLY — banner full-bleed.
   Edge-to-edge, sem rounded corners, encosta no header e nas
   bordas do container. Negative margins escapam do padding
   xl:px-4 xl:py-4 do layout default (16px no xl+).
   ========================================================= */
.cta-slot--image {
  display: block;
  position: relative;
  border-radius: 0;
  overflow: hidden;
  text-decoration: none;
  cursor: pointer;
  transition: filter 180ms;
  line-height: 0;
  /* Bleed negativo pra encostar nas bordas do main content wrapper.
     Mobile/tablet o layout nao tem padding (xl: prefix), entao 0. */
  margin: 0;
}
@media (min-width: 1280px) {
  .cta-slot--image {
    margin: -16px -16px 0;
  }
}
.cta-slot--image:hover {
  filter: brightness(1.04);
}
.cta-slot__image {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
}
.cta-slot__close--floating {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.92);
  border: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 150ms;
}
.cta-slot__close--floating:hover {
  background: rgba(0, 0, 0, 0.7);
}

/* =========================================================
   Modo CONTENT — card editorial full-bleed quando usado como
   banner topo. Mesmo bleed-x/bleed-top do modo IMAGEM.
   ========================================================= */
.cta-slot--content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 22px;
  border-radius: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
  background:
    radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--brand-primary) 14%, transparent) 0%, transparent 55%),
    color-mix(in srgb, var(--brand-surface) 70%, var(--brand-background));
  position: relative;
  overflow: hidden;
  margin: 0;
}
@media (min-width: 1280px) {
  .cta-slot--content {
    margin: -16px -16px 0;
  }
}

.cta-slot__glow {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 180px;
  height: 180px;
  border-radius: 999px;
  background: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 18%, transparent) 0%, transparent 70%);
  pointer-events: none;
  filter: blur(8px);
}

.cta-slot__cover {
  width: calc(100% + 44px);
  margin: -18px -22px 4px;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-primary) 18%, transparent);
}

.cta-slot__head {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.cta-slot__title {
  flex: 1;
  margin: 0;
  font-family: var(--brand-font);
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.012em;
  color: var(--text-heading, var(--brand-text));
}

.cta-slot__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: transparent;
  border: 0;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms;
}
.cta-slot__close:hover {
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  color: var(--brand-text);
}

/* Body via v-html — TipTap level=basic output */
.cta-slot__body {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
  position: relative;
}
.cta-slot__body :deep(p) { margin: 0 0 6px; }
.cta-slot__body :deep(p:last-child) { margin-bottom: 0; }
.cta-slot__body :deep(strong) {
  font-weight: 600;
  color: color-mix(in srgb, var(--brand-text) 92%, transparent);
}
.cta-slot__body :deep(em) {
  font-style: italic;
  font-family: 'Instrument Serif', Georgia, serif;
}
.cta-slot__body :deep(a) {
  color: var(--brand-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
}
.cta-slot__body :deep(ul),
.cta-slot__body :deep(ol) {
  margin: 4px 0 6px;
  padding-left: 18px;
}
.cta-slot__body :deep(li) { margin: 2px 0; }
.cta-slot__body :deep(blockquote) {
  margin: 6px 0;
  padding: 4px 12px;
  border-left: 3px solid color-mix(in srgb, var(--brand-primary) 40%, transparent);
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
  font-style: italic;
}
.cta-slot__body :deep(h3),
.cta-slot__body :deep(h4) {
  font-family: var(--brand-font);
  font-weight: 500;
  font-size: 13.5px;
  margin: 8px 0 4px;
  color: var(--brand-text);
}

.cta-slot__action {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  align-self: flex-start;
  padding: 10px 16px;
  border-radius: 11px;
  background: linear-gradient(135deg,
    var(--brand-primary) 0%,
    color-mix(in srgb, var(--brand-primary) 80%, white) 100%
  );
  color: var(--text-on-primary, var(--brand-background, #fff));
  font-family: var(--brand-font);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
  text-decoration: none;
  box-shadow: 0 8px 18px -8px color-mix(in srgb, var(--brand-primary) 60%, transparent);
  transition: transform 180ms, box-shadow 180ms;
  position: relative;
}
.cta-slot__action:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px -8px color-mix(in srgb, var(--brand-primary) 70%, transparent);
}

</style>
