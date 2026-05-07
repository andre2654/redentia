<!--
  CTASlot — slot pra CTA contextual em pontos especificos da app.

  Usage:
    <CTASlot placement="wallet-hero" />
    <CTASlot placement="help-prompt" />
    <CTASlot placement="home-cta" />

  Renderiza so se houver Communication com type=cta + placement
  matching + audiencia bate. Comportamento e visual diferentes do
  banner top — esse e um card maior, com mais hierarquia.
-->
<template>
  <Transition name="cta-fade">
    <article
      v-if="cta"
      class="cta-card"
    >
      <span class="cta-card__glow" aria-hidden="true" />

      <header class="cta-card__head">
        <UIcon
          v-if="cta.icon"
          :name="cta.icon"
          class="size-5 shrink-0"
          :style="{ color: 'var(--brand-primary)' }"
          aria-hidden="true"
        />
        <h3 class="cta-card__title">{{ cta.title }}</h3>
        <button
          v-if="cta.dismissible"
          type="button"
          class="cta-card__close"
          aria-label="Fechar"
          @click="onDismiss"
        >
          <UIcon name="i-lucide-x" class="size-4" />
        </button>
      </header>

      <p v-if="cta.body" class="cta-card__body">{{ cta.body }}</p>

      <a
        v-if="cta.link_url"
        :href="cta.link_url"
        class="cta-card__action"
        target="_blank"
        rel="noopener"
        @click="onClick"
      >
        <UIcon name="i-lucide-sparkles" class="size-4" aria-hidden="true" />
        <span>{{ cta.link_label || 'Acessar' }}</span>
        <UIcon name="i-lucide-arrow-right" class="size-4" aria-hidden="true" />
      </a>
    </article>
  </Transition>
</template>

<script setup lang="ts">
import type { CommunicationPlacement, CommunicationPublic } from '~/services/communications'

interface Props {
  placement: CommunicationPlacement
}
const props = defineProps<Props>()

const service = useCommunicationsService()
const cta = ref<CommunicationPublic | null>(null)

async function load() {
  try {
    const items = await service.listActive(props.placement)
    // Filtra so type=cta (caso outros types vazem com mesmo placement)
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
.cta-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 22px;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
  background:
    radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--brand-primary) 14%, transparent) 0%, transparent 55%),
    color-mix(in srgb, var(--brand-surface) 70%, var(--brand-background));
  position: relative;
  overflow: hidden;
}

.cta-card__glow {
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

.cta-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.cta-card__title {
  flex: 1;
  margin: 0;
  font-family: var(--brand-font);
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.012em;
  color: var(--text-heading, var(--brand-text));
}

.cta-card__close {
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

.cta-card__close:hover {
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  color: var(--brand-text);
}

.cta-card__body {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  position: relative;
}

.cta-card__action {
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

.cta-card__action:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px -8px color-mix(in srgb, var(--brand-primary) 70%, transparent);
}

.cta-fade-enter-active, .cta-fade-leave-active {
  transition: opacity 200ms, transform 200ms;
}
.cta-fade-enter-from, .cta-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
