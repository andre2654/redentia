<!--
  ActionBar — banner unificado no TOPO do dashboard.

  Substitui 3 elementos antigos:
    1. ConnectionStatus banner (Open Finance)
    2. Botoes "Atualizar dados" + "Atualizar via chat" do HeroPatrimony
    3. Action bar antiga (raio-X CTA + limpar carteira)

  Logica adaptativa:
    - Sem analise   → CTA "Gerar raio-X" + status Open Finance
    - Com analise   → CTA "Atualizar análise" + status Open Finance
    - Sem conexao   → "Conectar Open Finance" inline (usa
                      MoleculesPluggyConnectButton)
    - Com conexao   → "Sincronizado com {Inst} · ha 3min"
                      + botoes "Sincronizar" / "Gerenciar"

  Visual chamativo: gradient diagonal, eyebrow pulsante, CTA com
  glow shadow + shimmer no hover.
-->
<template>
  <aside class="action-bar" :class="{ 'action-bar--has-analysis': hasAnalysis }">
    <span class="action-bar__glow" aria-hidden="true" />

    <!-- Coluna esquerda: copy + Open Finance status row -->
    <div class="action-bar__copy">
      <span class="action-bar__eyebrow">
        <span class="action-bar__eyebrow-dot" aria-hidden="true" />
        {{ hasAnalysis ? 'Mantenha sua análise atualizada' : 'Próximo passo' }}
      </span>
      <h3 class="action-bar__title">
        {{ hasAnalysis
          ? 'Atualize seu raio-X para refletir mudanças recentes'
          : 'Rode seu primeiro raio-X completo'
        }}
      </h3>
      <p class="action-bar__subtitle">
        <template v-if="hasAnalysis">
          Última análise: <strong>{{ generatedLabel }}</strong>. Recomendamos
          atualizar a cada 30 dias ou após eventos relevantes.
        </template>
        <template v-else>
          Nossa IA cruza fundamentos, dimensões da carteira e cenários de
          stress test. Leva 1–2 minutos.
        </template>
      </p>

      <!-- Sub-row: Open Finance status -->
      <div class="action-bar__status">
        <!-- COM CONEXAO -->
        <template v-if="primaryConnection">
          <span class="action-bar__status-pill action-bar__status-pill--connected">
            <span class="action-bar__status-dot" aria-hidden="true" />
            <UIcon name="i-lucide-link-2" class="size-3" aria-hidden="true" />
            <span>
              Sincronizado com <strong>{{ primaryConnection.institution_name }}</strong>
              <span v-if="connections.length > 1" class="action-bar__status-muted">
                · +{{ connections.length - 1 }}
              </span>
              <span class="action-bar__status-muted">
                · {{ formatTimeSince(primaryConnection.last_synced_at) }}
              </span>
            </span>
          </span>
          <button
            type="button"
            class="action-bar__status-link"
            :disabled="syncing || refreshing"
            @click="$emit('sync-and-refresh')"
            :title="'Sincroniza Open Finance + recarrega posições'"
          >
            <UIcon
              :name="syncing || refreshing ? 'i-lucide-loader-2' : 'i-lucide-refresh-cw'"
              :class="['size-3.5', (syncing || refreshing) && 'motion-safe:animate-spin']"
              aria-hidden="true"
            />
            <span>{{ syncing || refreshing ? 'Sincronizando...' : 'Sincronizar dados' }}</span>
          </button>
          <NuxtLink
            to="/settings/integracoes"
            class="action-bar__status-link action-bar__status-link--ghost"
          >
            <UIcon name="i-lucide-settings-2" class="size-3.5" aria-hidden="true" />
            <span>Gerenciar</span>
          </NuxtLink>
        </template>

        <!-- SEM CONEXAO -->
        <template v-else>
          <span class="action-bar__status-pill action-bar__status-pill--disconnected">
            <UIcon name="i-lucide-link-2-off" class="size-3" aria-hidden="true" />
            <span>Open Finance não conectado</span>
          </span>
          <MoleculesPluggyConnectButton
            variant="primary"
            label="Conectar conta"
            compact
            @connected="$emit('connected')"
          />
        </template>
      </div>
    </div>

    <!-- Coluna direita: CTA principal + danger -->
    <div class="action-bar__actions">
      <NuxtLink
        :to="`/help?intent=${hasAnalysis ? 'reanalyze-portfolio' : 'analyze-portfolio'}`"
        class="action-bar__cta"
      >
        <UIcon name="i-lucide-sparkles" class="size-4" aria-hidden="true" />
        <span>{{ hasAnalysis ? 'Atualizar análise' : 'Gerar raio-X' }}</span>
        <UIcon name="i-lucide-arrow-right" class="action-bar__cta-arrow size-4" aria-hidden="true" />
      </NuxtLink>
      <button
        type="button"
        class="action-bar__danger"
        :disabled="wiping"
        @click="$emit('wipe')"
        :title="'Remove todas as posições e análises'"
      >
        <UIcon
          :name="wiping ? 'i-lucide-loader-2' : 'i-lucide-trash-2'"
          :class="['size-3.5', wiping && 'motion-safe:animate-spin']"
          aria-hidden="true"
        />
        <span class="action-bar__danger-label">{{ wiping ? 'Limpando...' : 'Limpar carteira' }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { PluggyConnection } from '~/services/pluggy'

interface Props {
  hasAnalysis: boolean
  generatedLabel?: string
  wiping: boolean
  refreshing: boolean
  syncing: boolean
  connections: PluggyConnection[]
  primaryConnection: PluggyConnection | null
}
defineProps<Props>()

defineEmits<{
  (e: 'wipe'): void
  /** Sincroniza conexao Pluggy + recarrega positions (orquestrado pelo pai). */
  (e: 'sync-and-refresh'): void
  /** Pluggy widget acabou de conectar uma conta nova. */
  (e: 'connected'): void
}>()

function formatTimeSince(iso: string | null): string {
  if (!iso) return 'aguardando primeira sincronização'
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return 'data desconhecida'
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
    if (seconds < 60) return 'agora'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `há ${minutes}min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `há ${hours}h`
    const days = Math.floor(hours / 24)
    return `há ${days} ${days === 1 ? 'dia' : 'dias'}`
  } catch {
    return 'data desconhecida'
  }
}
</script>

<style scoped>
.action-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: space-between;
  gap: 18px;
  padding: 22px 24px;
  border-radius: 20px;
  border: 1px solid color-mix(in srgb, var(--brand-primary) 22%, transparent);
  background:
    radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--brand-primary) 14%, transparent) 0%, transparent 55%),
    linear-gradient(180deg,
      color-mix(in srgb, var(--brand-primary) 5%, var(--brand-surface)) 0%,
      color-mix(in srgb, var(--brand-surface) 75%, var(--brand-background)) 100%
    );
  position: relative;
  overflow: hidden;
}

.action-bar--has-analysis {
  border-color: color-mix(in srgb, var(--brand-border) 50%, transparent);
  background:
    radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--brand-primary) 8%, transparent) 0%, transparent 55%),
    color-mix(in srgb, var(--brand-surface) 70%, var(--brand-background));
}

.action-bar__glow {
  position: absolute;
  top: -40px;
  left: -40px;
  width: 220px;
  height: 220px;
  border-radius: 999px;
  background: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 22%, transparent) 0%, transparent 70%);
  pointer-events: none;
  filter: blur(8px);
}

.action-bar__copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1 1 320px;
  position: relative;
}

.action-bar__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}

.action-bar__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 25%, transparent);
  animation: ab-pulse 2.4s ease-in-out infinite;
}

@keyframes ab-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
}

.action-bar__title {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 17px;
  font-weight: 500;
  letter-spacing: -0.014em;
  line-height: 1.25;
  color: var(--text-heading, var(--brand-text));
}

.action-bar__subtitle {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

.action-bar__subtitle strong {
  font-weight: 600;
  color: var(--brand-text);
}

/* ============ STATUS ROW ============ */
.action-bar__status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed color-mix(in srgb, var(--brand-border) 40%, transparent);
}

.action-bar__status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 500;
  border: 1px solid;
  letter-spacing: -0.005em;
}

.action-bar__status-pill--connected {
  color: var(--brand-positive, #10b981);
  border-color: color-mix(in srgb, var(--brand-positive, #10b981) 30%, transparent);
  background: color-mix(in srgb, var(--brand-positive, #10b981) 10%, transparent);
}

.action-bar__status-pill--disconnected {
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  border-color: color-mix(in srgb, var(--brand-border) 60%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
}

.action-bar__status-pill strong {
  font-weight: 600;
  color: inherit;
}

.action-bar__status-muted {
  opacity: 0.7;
  font-weight: 400;
}

.action-bar__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--brand-positive, #10b981);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand-positive, #10b981) 25%, transparent);
  animation: ab-pulse 2.4s ease-in-out infinite;
}

.action-bar__status-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border-radius: 8px;
  background: transparent;
  border: 0;
  color: var(--brand-primary);
  font-family: var(--brand-font);
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  cursor: pointer;
  text-decoration: none;
  transition: background 150ms, color 150ms;
}

.action-bar__status-link:hover:not(:disabled) {
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
}

.action-bar__status-link:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.action-bar__status-link--ghost {
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}

.action-bar__status-link--ghost:hover {
  color: var(--brand-text);
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
}

/* ============ ACTIONS ============ */
.action-bar__actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  position: relative;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .action-bar__actions {
    flex-direction: row;
    align-items: center;
  }
}

/* CTA primario (gradiente + glow + shimmer) */
.action-bar__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 13px;
  background: linear-gradient(135deg,
    var(--brand-primary) 0%,
    color-mix(in srgb, var(--brand-primary) 80%, white) 100%
  );
  color: var(--text-on-primary, var(--brand-background, #fff));
  font-family: var(--brand-font);
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  text-decoration: none;
  box-shadow:
    0 12px 26px -10px color-mix(in srgb, var(--brand-primary) 65%, transparent),
    0 0 0 1px color-mix(in srgb, var(--brand-primary) 40%, transparent) inset;
  transition: transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 180ms, filter 180ms;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

.action-bar__cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 30%, color-mix(in srgb, white 25%, transparent) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 700ms ease;
  pointer-events: none;
}

.action-bar__cta:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
  box-shadow:
    0 18px 32px -10px color-mix(in srgb, var(--brand-primary) 75%, transparent),
    0 0 0 1px color-mix(in srgb, var(--brand-primary) 60%, transparent) inset;
}

.action-bar__cta:hover::before {
  transform: translateX(100%);
}

.action-bar__cta-arrow {
  transition: transform 220ms;
}

.action-bar__cta:hover .action-bar__cta-arrow {
  transform: translateX(3px);
}

/* Danger (limpar) */
.action-bar__danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 11px;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--brand-negative, #dc2626) 28%, transparent);
  color: color-mix(in srgb, var(--brand-negative, #dc2626) 90%, var(--brand-text));
  font-family: var(--brand-font);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.005em;
  cursor: pointer;
  transition: background 180ms, border-color 180ms, transform 120ms;
  white-space: nowrap;
}

.action-bar__danger:hover:not(:disabled) {
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 8%, transparent);
  border-color: color-mix(in srgb, var(--brand-negative, #dc2626) 50%, transparent);
  transform: translateY(-1px);
}

.action-bar__danger:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .action-bar__danger-label {
    display: none;
  }
  .action-bar__danger {
    padding: 10px;
  }
}
</style>
