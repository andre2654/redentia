<!--
  ConnectionStatus — banner adaptativo Open Finance.

  Tres estados (ordem de prioridade):
    1. CONNECTED   - User tem >= 1 conexao ativa: mostra banner verde
                     "Sincronizado com {Inst}" + sync button + manage link.
    2. WELCOME     - User tem positions mas ZERO conexao: CTA pra conectar.
                     Dismissivel (localStorage por-user).
    3. HIDDEN      - User dispensou OU nao tem positions ainda.

  Antes era 170+ linhas inline em wallet/index.vue. Extraido pra
  organizar a pagina e permitir reuso.

  Inline-styles aqui usam var(--brand-X) em vez de brand.colors.X
  (anti-flash SSR — pattern herdado de OnboardingNameModal).
-->
<template>
  <!-- ESTADO 1: CONECTADO -->
  <div
    v-if="primaryConnection"
    class="conn-banner conn-banner--connected"
  >
    <div class="conn-banner__icon" aria-hidden="true">
      <UIcon name="i-lucide-circle-check" class="size-4" />
    </div>
    <div class="conn-banner__copy">
      <span class="conn-banner__eyebrow">
        Open Finance
      </span>
      <p class="conn-banner__text">
        <strong>Sincronizado com {{ primaryConnection.institution_name }}</strong>
        <span v-if="connections.length > 1" class="conn-banner__muted">
          e mais {{ connections.length - 1 }}
          {{ connections.length - 1 === 1 ? 'conexão' : 'conexões' }}
        </span>
        <span class="conn-banner__muted">
          · {{ formatTimeSince(primaryConnection.last_synced_at) }}
        </span>
      </p>
    </div>
    <div class="conn-banner__actions">
      <button
        type="button"
        class="conn-banner__btn conn-banner__btn--primary"
        :disabled="syncing"
        @click="$emit('sync')"
      >
        <UIcon
          :name="syncing ? 'i-lucide-loader-2' : 'i-lucide-refresh-cw'"
          :class="['size-3.5', syncing && 'motion-safe:animate-spin']"
          aria-hidden="true"
        />
        <span>{{ syncing ? 'Sincronizando...' : 'Atualizar agora' }}</span>
      </button>
      <NuxtLink
        to="/wallet/integracoes"
        class="conn-banner__btn conn-banner__btn--ghost"
      >
        <UIcon name="i-lucide-settings-2" class="size-3.5" aria-hidden="true" />
        <span>Gerenciar</span>
      </NuxtLink>
    </div>
  </div>

  <!-- ESTADO 2: WELCOME (CTA pra conectar) -->
  <div
    v-else-if="showWelcome"
    class="conn-banner conn-banner--welcome"
  >
    <div class="conn-banner__icon" aria-hidden="true">
      <UIcon name="i-lucide-link-2" class="size-4" />
    </div>
    <div class="conn-banner__copy">
      <span class="conn-banner__eyebrow">Open Finance</span>
      <p class="conn-banner__text">
        Sua carteira foi importada manualmente. Conecte o Open Finance pra
        manter ela sempre atualizada.
      </p>
    </div>
    <div class="conn-banner__actions">
      <MoleculesPluggyConnectButton
        variant="primary"
        label="Conectar"
        compact
        @connected="$emit('connected')"
      />
      <button
        type="button"
        class="conn-banner__btn conn-banner__btn--ghost"
        @click="$emit('dismiss')"
      >
        <span>Mais tarde</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PluggyConnection } from '~/services/pluggy'

interface Props {
  connections: PluggyConnection[]
  primaryConnection: PluggyConnection | null
  showWelcome: boolean
  syncing: boolean
}
defineProps<Props>()

defineEmits<{
  (e: 'sync'): void
  (e: 'connected'): void
  (e: 'dismiss'): void
}>()

function formatTimeSince(iso: string | null): string {
  if (!iso) return 'nunca'
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'agora há pouco'
  if (diffMin < 60) return `há ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `há ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 30) return `há ${diffD}d`
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date)
}
</script>

<style scoped>
.conn-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  border-radius: 14px;
  border: 1px solid;
  font-size: 13px;
  position: relative;
  overflow: hidden;
}

.conn-banner__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  flex-shrink: 0;
  border: 1px solid;
}

.conn-banner__copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.conn-banner__eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.conn-banner__text {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.4;
  color: var(--brand-text);
}

.conn-banner__muted {
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.conn-banner__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* ============ BTN ============ */
.conn-banner__btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: 9px;
  font-family: var(--brand-font);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.005em;
  cursor: pointer;
  text-decoration: none;
  border: 1px solid transparent;
  transition: filter 180ms, transform 120ms, background 180ms, border-color 180ms;
  flex-shrink: 0;
}

.conn-banner__btn--primary {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
}

.conn-banner__btn--primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--brand-primary) 22%, transparent);
  transform: translateY(-1px);
}

.conn-banner__btn--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.conn-banner__btn--ghost {
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
  border-color: color-mix(in srgb, var(--brand-border) 50%, transparent);
}

.conn-banner__btn--ghost:hover {
  border-color: color-mix(in srgb, var(--brand-border) 80%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
}

/* ============ STATE: CONNECTED ============ */
.conn-banner--connected {
  border-color: color-mix(in srgb, var(--brand-positive, #10b981) 28%, transparent);
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--brand-positive, #10b981) 8%, transparent) 0%, transparent 60%),
    color-mix(in srgb, var(--brand-surface) 70%, var(--brand-background));
}

.conn-banner--connected .conn-banner__icon {
  background: color-mix(in srgb, var(--brand-positive, #10b981) 14%, transparent);
  border-color: color-mix(in srgb, var(--brand-positive, #10b981) 30%, transparent);
  color: var(--brand-positive, #10b981);
}

.conn-banner--connected .conn-banner__eyebrow {
  color: var(--brand-positive, #10b981);
}

/* ============ STATE: WELCOME ============ */
.conn-banner--welcome {
  border-color: color-mix(in srgb, var(--brand-primary) 32%, transparent);
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--brand-primary) 8%, transparent) 0%, transparent 60%),
    color-mix(in srgb, var(--brand-surface) 70%, var(--brand-background));
}

.conn-banner--welcome .conn-banner__icon {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 30%, transparent);
  color: var(--brand-primary);
}

.conn-banner--welcome .conn-banner__eyebrow {
  color: var(--brand-primary);
}
</style>
