<script setup lang="ts">
definePageMeta({
  layout: false,
  isPublicRoute: true,
})

type Format = 'square' | 'feed' | 'story'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()

function firstString(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

// Opcional: se NUXT_N8N_RENDER_KEY estiver configurada, exige ?key=...
if (import.meta.server) {
  const requiredKey = (runtimeConfig as any).n8nRenderKey as string | undefined
  if (requiredKey) {
    const providedKey = firstString(route.query.key)
    if (providedKey !== requiredKey) {
      throw createError({ statusCode: 404, statusMessage: 'Not Found' })
    }
  }
}

const format = computed<Format>(() => {
  const f = (firstString(route.query.format) || '').toLowerCase()
  if (f === 'feed') return 'feed'
  if (f === 'story') return 'story'
  if (f === 'square') return 'square'
  // default: square (ref que você mandou)
  return 'square'
})

const frame = computed(() => {
  if (format.value === 'feed') return { w: 1080, h: 1350 }
  if (format.value === 'story') return { w: 1080, h: 1920 }
  return { w: 1080, h: 1080 }
})

const brandRight = computed(
  () => firstString(route.query.brandRight) || 'REDENTIA.COM.BR'
)

const notifTitle = computed(
  () => firstString(route.query.notifTitle) || 'Resumo do dia'
)
const notifTime = computed(() => firstString(route.query.notifTime) || 'Agora')
const notifMessage = computed(
  () =>
    firstString(route.query.notifMessage) ||
    'A PETR4 caiu 20% hoje, nesses preços o dividendo estimado é de 15% ao ano.'
)

const headlineLines = computed(() => {
  const h1 = firstString(route.query.headline1)
  const h2 = firstString(route.query.headline2)
  if (h1 || h2) return [h1 || '', h2 || '']

  const raw = firstString(route.query.headline)
  if (raw) {
    const parts = raw
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length >= 2) return [parts[0], parts.slice(1).join(' ')]
    if (parts.length === 1) return [parts[0], '']
  }

  return ['Receba updates do', 'mercado com IA']
})

const headline1 = computed(() => headlineLines.value[0] || '')
const headline2 = computed(() => headlineLines.value[1] || '')

const highlight = computed(() => firstString(route.query.highlight) || 'IA')
const headline2Parts = computed(() => {
  const line = headline2.value
  const h = highlight.value
  if (!h) return { before: line, mid: '', after: '' }
  const idx = line.lastIndexOf(h)
  if (idx < 0) return { before: line, mid: '', after: '' }
  return {
    before: line.slice(0, idx),
    mid: line.slice(idx, idx + h.length),
    after: line.slice(idx + h.length),
  }
})

const accent = computed(() => firstString(route.query.accent) || '#FFFFFF')

const cardOpacity = computed(() => {
  const raw = firstString(route.query.cardOpacity)
  const n = raw ? Number(raw) : 1
  if (!Number.isFinite(n)) return 1
  return clamp(n, 0.6, 1)
})

useHead(() => ({
  title: 'Redentia - Market updates (n8n)',
  htmlAttrs: {
    style: `--w:${frame.value.w}px; --h:${frame.value.h}px; --accent:${accent.value}; --cardOpacity:${cardOpacity.value};`,
  },
  meta: [
    { name: 'robots', content: 'noindex,nofollow,noarchive' },
    { name: 'viewport', content: `width=${frame.value.w}, initial-scale=1` },
  ],
}))
</script>

<template>
  <div class="frame">
    <div class="card">
      <header class="header">
        <div class="brandLeft">
          <IconLogo class="brandIcon" />
          <div class="brandName">REDENTIA</div>
        </div>
        <div class="brandRight">{{ brandRight }}</div>
      </header>

      <main class="main">
        <div class="notifStack" :style="{ opacity: 'var(--cardOpacity)' }">
          <div class="notif back back2" aria-hidden="true" />
          <div class="notif back back1" aria-hidden="true" />

          <div class="notif front" role="group" aria-label="Notificação">
            <div class="notifHeader">
              <div class="notifHeaderLeft">
                <div class="appIcon">
                  <IconLogo class="appIconSvg" />
                </div>
                <div class="notifTitle">{{ notifTitle }}</div>
              </div>
              <div class="notifTime">{{ notifTime }}</div>
            </div>

            <div class="notifBody">
              {{ notifMessage }}
            </div>
          </div>
        </div>
      </main>

      <footer class="cta">
        <div class="ctaLine1">{{ headline1 }}</div>
        <div class="ctaLine2">
          <span>{{ headline2Parts.before }}</span>
          <span v-if="headline2Parts.mid" class="hl">{{ headline2Parts.mid }}</span>
          <span>{{ headline2Parts.after }}</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
:global(html),
:global(body),
:global(#__nuxt) {
  width: var(--w);
  height: var(--h);
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #041a2b;
}

:global(body) {
  font-family: 'Sora', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

* {
  box-sizing: border-box;
}

.frame {
  width: var(--w);
  height: var(--h);
  display: flex;
  justify-content: center;
  align-items: center;
}

.card {
  width: var(--w);
  height: var(--h);
  padding: 84px 84px 92px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 15%, rgba(25, 142, 214, 0.35) 0%, rgba(0, 0, 0, 0) 55%),
    radial-gradient(circle at 70% 60%, rgba(10, 94, 152, 0.45) 0%, rgba(0, 0, 0, 0) 65%),
    radial-gradient(circle at 50% 105%, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0) 55%),
    linear-gradient(180deg, #05263b 0%, #031a2b 55%, #021220 100%);
  color: #fff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brandLeft {
  display: flex;
  align-items: center;
  gap: 18px;
}

.brandIcon {
  width: 56px;
  height: 56px;
  fill: #fff;
}

.brandName {
  font-size: 42px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.brandRight {
  font-size: 34px;
  font-weight: 500;
  letter-spacing: 0.06em;
  opacity: 0.95;
}

.main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.notifStack {
  width: 840px;
  position: relative;
}

.notif {
  border-radius: 26px;
  background: rgba(220, 227, 234, 0.96);
  color: #0c0c0c;
  box-shadow:
    0 26px 80px rgba(0, 0, 0, 0.35),
    inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}

.back {
  height: 210px;
}

.back1 {
  position: absolute;
  inset: 18px 0 auto 0;
  opacity: 0.88;
  transform: translateY(34px);
  filter: blur(0.1px);
}

.back2 {
  position: absolute;
  inset: 18px 0 auto 0;
  opacity: 0.75;
  transform: translateY(64px);
}

.front {
  position: relative;
  padding: 28px 30px 30px;
}

.notifHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 22px;
}

.notifHeaderLeft {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
}

.appIcon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #0b0b0b;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.appIconSvg {
  width: 40px;
  height: 40px;
  fill: #fff;
}

.notifTitle {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notifTime {
  font-size: 30px;
  font-weight: 500;
  opacity: 0.85;
  flex: 0 0 auto;
}

.notifBody {
  margin-top: 10px;
  font-size: 30px;
  line-height: 1.25;
  letter-spacing: -0.01em;
  opacity: 0.92;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cta {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ctaLine1,
.ctaLine2 {
  font-size: 92px;
  line-height: 0.98;
  letter-spacing: -0.03em;
  font-weight: 300;
}

.hl {
  font-weight: 700;
  color: var(--accent);
}
</style>

