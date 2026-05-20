<!--
  GoalsCard — Metas pulled from /api/goals.

  Versao MINIMALISTA: header pequeno + lista enxuta. Cada meta = 1
  linha com title + bar + %. Sem section heading interna (pai cuida).

  Empty: 1 linha com CTA inline pra adicionar meta no chat.
-->
<template>
  <article class="goals-card">
    <header class="goals-card__head">
      <div class="goals-card__title-group">
        <span class="goals-card__eyebrow">Metas</span>
        <h3 class="goals-card__title">Onde você quer chegar</h3>
      </div>
      <NuxtLink to="/help?intent=set-goal" class="goals-card__add" aria-label="Nova meta no chat">
        <UIcon name="i-lucide-plus" class="size-3" aria-hidden="true" />
        <span>Nova</span>
      </NuxtLink>
    </header>

    <!-- Empty -->
    <NuxtLink v-if="!goals.length" to="/help?intent=set-goal" class="goals-card__empty">
      <UIcon name="i-lucide-target" class="size-4 shrink-0" aria-hidden="true" />
      <span>Defina sua primeira meta no chat</span>
      <UIcon name="i-lucide-arrow-up-right" class="size-3 shrink-0 ml-auto" aria-hidden="true" />
    </NuxtLink>

    <!-- List -->
    <ul v-else class="goals-card__list">
      <li v-for="goal in goals" :key="goal.id" class="goals-card__item">
        <div class="goals-card__row">
          <span class="goals-card__name">{{ goal.title }}</span>
          <span class="goals-card__pct">{{ progressPct(goal).toFixed(0) }}%</span>
        </div>
        <div class="goals-card__bar" aria-hidden="true">
          <div
            class="goals-card__bar-fill"
            :style="{
              width: Math.min(progressPct(goal), 100) + '%',
              background: goal.classification === 'achieved'
                ? 'var(--brand-positive, #16a34a)'
                : 'linear-gradient(90deg, var(--brand-primary) 0%, var(--brand-positive, #16a34a) 100%)',
            }"
          />
        </div>
        <div class="goals-card__meta">
          <span class="goals-card__values">
            {{ maskedBRL(goal.current_progress || 0) }}
            <span class="goals-card__values-target">/ {{ maskedBRL(goal.target_value) }}</span>
          </span>
          <span
            v-if="goal.classification"
            class="goals-card__badge"
            :style="{
              backgroundColor: badgeBg(goal.classification),
              color: badgeColor(goal.classification),
            }"
          >{{ classificationLabel(goal.classification) }}</span>
        </div>
      </li>
    </ul>
  </article>
</template>

<script setup lang="ts">
import type { WalletGoal } from '~/services/walletData'

interface Props {
  goals: WalletGoal[]
}
defineProps<Props>()

function progressPct(goal: WalletGoal): number {
  if (!goal.target_value) return 0
  return ((goal.current_progress || 0) / goal.target_value) * 100
}

function classificationLabel(c?: string): string {
  switch (c) {
    case 'achieved': return 'Atingida'
    case 'realistic': return 'Realista'
    case 'aggressive': return 'Agressiva'
    case 'unfeasible': return 'Inviável'
    default: return c ? c : 'Em curso'
  }
}

function badgeColor(c?: string): string {
  if (c === 'achieved') return 'var(--brand-positive, #16a34a)'
  if (c === 'unfeasible') return 'var(--brand-negative, #dc2626)'
  if (c === 'aggressive') return 'var(--brand-warning)'
  return 'var(--brand-primary)'
}
function badgeBg(c?: string): string {
  return `color-mix(in srgb, ${badgeColor(c)} 14%, transparent)`
}

const interfaceStore = useInterfaceStore()

function formatBRL(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n)
}
function maskedBRL(n: number): string {
  if (!interfaceStore.revealAmount) return 'R$ ••••••'
  return formatBRL(n)
}
</script>

<style scoped>
.goals-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  background: color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background));
  transition: border-color 180ms;
}

.goals-card:hover {
  border-color: color-mix(in srgb, var(--brand-border) 75%, transparent);
}

/* ============ HEAD ============ */
.goals-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.goals-card__title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.goals-card__eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}

.goals-card__title {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.012em;
  color: var(--text-heading, var(--brand-text));
}

.goals-card__add {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border-radius: 7px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brand-primary);
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
  text-decoration: none;
  transition: background 150ms;
  flex-shrink: 0;
}

.goals-card__add:hover {
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
}

/* ============ EMPTY ============ */
.goals-card__empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  border: 1px dashed color-mix(in srgb, var(--brand-border) 55%, transparent);
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  text-decoration: none;
  transition: background 150ms, border-color 150ms;
}

.goals-card__empty:hover {
  background: color-mix(in srgb, var(--brand-primary) 5%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
  color: var(--brand-primary);
}

/* ============ LIST ============ */
.goals-card__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.goals-card__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.goals-card__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
}

.goals-card__name {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--brand-text);
}

.goals-card__pct {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
  font-size: 11.5px;
  font-weight: 600;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}

.goals-card__bar {
  height: 4px;
  width: 100%;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 7%, transparent);
  overflow: hidden;
}

.goals-card__bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.goals-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.goals-card__values {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  color: var(--brand-text);
}

.goals-card__values-target {
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.goals-card__badge {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 5px;
}
</style>
