<!--
  Offline fallback. Servida pelo Service Worker quando navigation
  request falha (rede off + página não cacheada).

  Não chama API — depende só do que o Workbox já tinha em cache.
  Lê `redentia-api-fresh` direto via Cache Storage pra mostrar último
  snapshot conhecido (IBOV + horário). Se nem isso tiver, mostra
  estado vazio limpo.
-->
<template>
  <div class="offline">
    <div class="offline-card">
      <div class="offline-icon-wrap">
        <UIcon name="i-lucide-wifi-off" class="size-7" :style="{ color: 'var(--brand-primary)' }" />
      </div>

      <h1 class="offline-h">Sem conexão</h1>
      <p class="offline-deck">
        Estamos sem internet pra atualizar agora. Mas aqui está o último dado que conseguimos guardar.
      </p>

      <div v-if="lastSnapshot" class="offline-snapshot">
        <p class="offline-eyebrow">IBOVESPA</p>
        <p class="offline-mega">
          {{ formatNumber(lastSnapshot.value) }}
          <span class="offline-unit">pts</span>
        </p>
        <p
          v-if="typeof lastSnapshot.change_pct === 'number'"
          :class="['offline-change', lastSnapshot.change_pct >= 0 ? 'pos' : 'neg']"
        >
          {{ formatPct(lastSnapshot.change_pct) }}
        </p>
        <p v-if="lastUpdatedLabel" class="offline-updated">{{ lastUpdatedLabel }}</p>
      </div>

      <div v-else class="offline-empty">
        <p>Nenhum dado em cache local.</p>
      </div>

      <button class="offline-retry" type="button" @click="retry">
        <UIcon name="i-lucide-refresh-cw" class="size-4" />
        Tentar de novo
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface IbovCached {
  value: number
  change_pct?: number
}

const lastSnapshot = ref<IbovCached | null>(null)
const lastUpdatedLabel = ref<string>('')

onMounted(async () => {
  if (typeof window === 'undefined' || typeof caches === 'undefined') return

  try {
    // Workbox cacheou /api/market/snapshot na cache "redentia-api-fresh"
    const cache = await caches.open('redentia-api-fresh')
    const keys = await cache.keys()
    // Pega qualquer entry que case com market/snapshot
    const match = keys.find((req) => /\/api\/market\/snapshot/.test(req.url))
    if (!match) return

    const cached = await cache.match(match)
    if (!cached) return

    const json = await cached.json()
    const ibov = json?.indices_br?.IBOV ?? json?.indices_br?.['^BVSP']
    if (ibov?.value) {
      lastSnapshot.value = {
        value: Number(ibov.value) || 0,
        change_pct: typeof ibov.change_pct === 'number' ? ibov.change_pct : undefined,
      }
    }

    // Date header do response indica quando o cache foi gravado
    const cachedAt = cached.headers.get('date') || cached.headers.get('x-redentia-cached-at')
    if (cachedAt) {
      lastUpdatedLabel.value = formatRelative(cachedAt)
    }
  } catch {
    // Se falhar lendo cache, deixa vazio — UI já cobre o caso
  }
})

function formatNumber(v: number): string {
  return v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

function formatPct(v: number): string {
  const sign = v >= 0 ? '+' : '−'
  return `${sign}${Math.abs(v).toFixed(2).replace('.', ',')}%`
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diffMs = Date.now() - then
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'Atualizado há instantes'
  if (min < 60) return `Atualizado há ${min}min`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `Atualizado há ${hr}h`
  const days = Math.floor(hr / 24)
  return `Atualizado há ${days}d`
}

function retry(): void {
  window.location.reload()
}

definePageMeta({
  layout: 'unauthenticated',
  // Não tentar SSR fetch — página é PURE client (vive só pra fallback offline)
  ssr: false,
})
</script>

<style scoped>
.offline {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}
.offline-card {
  max-width: 460px;
  width: 100%;
  background: var(--bg-elevated, #fff);
  border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.offline-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  margin-bottom: 4px;
}
.offline-h {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-heading, #111);
  margin: 0;
  letter-spacing: -0.015em;
}
.offline-deck {
  font-size: 14px;
  color: var(--text-muted, #6b7280);
  margin: 0;
  max-width: 360px;
  line-height: 1.5;
}
.offline-snapshot {
  width: 100%;
  margin-top: 16px;
  padding: 20px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--brand-primary) 4%, transparent);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.offline-eyebrow {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted, #6b7280);
  margin: 0;
}
.offline-mega {
  font-size: 36px;
  font-weight: 600;
  color: var(--text-heading, #111);
  margin: 0;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
.offline-unit {
  font-size: 14px;
  font-weight: 400;
  color: var(--text-muted, #6b7280);
  margin-left: 4px;
}
.offline-change {
  font-size: 14px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  margin: 0;
}
.offline-change.pos {
  color: var(--brand-positive, #0a8e5c);
}
.offline-change.neg {
  color: var(--brand-negative, #e0353d);
}
.offline-updated {
  font-size: 12px;
  color: var(--text-muted, #6b7280);
  margin: 0;
}
.offline-empty {
  font-size: 13px;
  color: var(--text-muted, #6b7280);
  padding: 16px 0;
}
.offline-retry {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--brand-primary, #d8881a);
  color: #fff;
  border: none;
  padding: 12px 22px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s ease;
  margin-top: 8px;
}
.offline-retry:hover {
  opacity: 0.88;
}
</style>
