<!--
  AnnouncementsFeed — feed de comunicados (type=announcement,
  placement=feed) renderizado como uma lista colapsavel/expansivel.

  Diferente do banner top (que mostra UM), o feed pode ter VARIOS
  comunicados ativos. User pode dispensar individualmente.

  Visual: card colapsado mostra contador "3 novos comunicados" +
  primeiro item. Click expande pra mostrar todos.
-->
<template>
  <article v-if="items.length" class="feed-card">
    <header class="feed-card__head" @click="expanded = !expanded">
      <div class="feed-card__head-copy">
        <span class="feed-card__eyebrow">
          <span class="feed-card__dot" aria-hidden="true" />
          {{ items.length }} {{ items.length === 1 ? 'novidade' : 'novidades' }}
        </span>
        <h3 class="feed-card__title">{{ items[0]?.title }}</h3>
      </div>
      <UIcon
        :name="expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        class="size-4 shrink-0"
        :style="{ color: 'var(--brand-text)' }"
        aria-hidden="true"
      />
    </header>

    <Transition name="feed-expand">
      <ul v-if="expanded" class="feed-card__list">
        <li
          v-for="item in items"
          :key="item.id"
          class="feed-item"
        >
          <UIcon
            v-if="item.icon"
            :name="item.icon"
            class="size-4 shrink-0 mt-0.5"
            :style="{ color: 'var(--brand-primary)' }"
            aria-hidden="true"
          />
          <div class="feed-item__copy">
            <span class="feed-item__title">{{ item.title }}</span>
            <div
              v-if="item.body"
              class="feed-item__body"
              v-html="renderBody(item.body)"
            />
            <a
              v-if="item.link_url"
              :href="item.link_url"
              class="feed-item__link"
              target="_blank"
              rel="noopener"
              @click="onClick(item.id)"
            >
              {{ item.link_label || 'Ver mais' }}
              <UIcon name="i-lucide-arrow-up-right" class="size-3" aria-hidden="true" />
            </a>
          </div>
          <button
            v-if="item.dismissible"
            type="button"
            class="feed-item__close"
            aria-label="Dispensar"
            @click.stop="onDismiss(item.id)"
          >
            <UIcon name="i-lucide-x" class="size-3.5" />
          </button>
        </li>
      </ul>
    </Transition>
  </article>
</template>

<script setup lang="ts">
import type { CommunicationPublic } from '~/services/communications'
import { sanitizeHtml } from '~/utils/sanitizeHtml'

const service = useCommunicationsService()
const items = ref<CommunicationPublic[]>([])
const expanded = ref(false)

/**
 * Body de anúncios vem como HTML cru (TipTap output do
 * EditorAnnouncement, level=basic). Sanitiza com level='basic' antes
 * de renderizar — passa <p> <ul> <ol> <li> <blockquote> <h3> <h4>
 * <strong> <em> <a> <span> <br>. Bloqueia <script> e atributos
 * onerror/onclick/style.
 */
function renderBody(body: string | null | undefined): string {
  return sanitizeHtml(body || '', 'basic')
}

async function load() {
  try {
    const fetched = await service.listActive('feed')
    items.value = fetched.filter((c) => c.type === 'announcement')
    // Mark seen pra todos visiveis (impressao geral)
    for (const item of items.value) {
      void service.markSeen(item.id)
    }
  } catch (e) {
    console.warn('[AnnouncementsFeed] load failed', e)
  }
}

async function onClick(id: number) {
  await service.markClicked(id)
}

async function onDismiss(id: number) {
  items.value = items.value.filter((c) => c.id !== id)
  await service.markDismissed(id)
}

onMounted(() => load())
</script>

<style scoped>
.feed-card {
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  background: color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background));
  overflow: hidden;
  /* Espaço pro proximo bloco (carteira/raio-x card etc.) na home.
     No próprio article (em vez do wrapper externo) pra que a margem
     SO existe quando o feed realmente renderiza. */
  margin-bottom: 16px;
}
@media (min-width: 1280px) {
  .feed-card { margin-bottom: 20px; }
}

.feed-card__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 150ms;
}

.feed-card__head:hover {
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
}

.feed-card__head-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.feed-card__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}

.feed-card__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 25%, transparent);
  animation: feed-pulse 2.4s ease-in-out infinite;
}

@keyframes feed-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
}

.feed-card__title {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--brand-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feed-card__list {
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
}

.feed-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
}

.feed-item:last-child {
  border-bottom: 0;
}

.feed-item__copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.feed-item__title {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--brand-text);
}

.feed-item__body {
  font-size: 12px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}
/* Rich text rendering — TipTap level=basic output via v-html */
.feed-item__body :deep(p) {
  margin: 0 0 6px;
}
.feed-item__body :deep(p:last-child) { margin-bottom: 0; }
.feed-item__body :deep(strong) {
  font-weight: 600;
  color: var(--brand-text);
}
.feed-item__body :deep(em) {
  font-style: italic;
  font-family: 'Instrument Serif', Georgia, serif;
}
.feed-item__body :deep(a) {
  color: var(--brand-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
}
.feed-item__body :deep(ul),
.feed-item__body :deep(ol) {
  margin: 4px 0 6px;
  padding-left: 18px;
}
.feed-item__body :deep(li) { margin: 2px 0; }
.feed-item__body :deep(blockquote) {
  margin: 6px 0;
  padding: 4px 12px;
  border-left: 3px solid color-mix(in srgb, var(--brand-primary) 40%, transparent);
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
  font-style: italic;
}
.feed-item__body :deep(h3),
.feed-item__body :deep(h4) {
  font-family: var(--brand-font);
  font-weight: 500;
  font-size: 12.5px;
  margin: 8px 0 4px;
  color: var(--brand-text);
}

.feed-item__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--brand-primary);
  text-decoration: none;
}

.feed-item__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: transparent;
  border: 0;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms;
  flex-shrink: 0;
}

.feed-item__close:hover {
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  color: var(--brand-text);
}

.feed-expand-enter-active, .feed-expand-leave-active {
  transition: max-height 280ms ease, opacity 220ms ease;
  overflow: hidden;
}
.feed-expand-enter-from, .feed-expand-leave-to {
  max-height: 0;
  opacity: 0;
}
.feed-expand-enter-to, .feed-expand-leave-from {
  max-height: 600px;
  opacity: 1;
}
</style>
