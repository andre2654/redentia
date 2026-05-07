<!--
  /wallet — secao "Saldos em conta" — cards COMPACTOS de bancos +
  cartoes via Pluggy/Open Finance.

  Layout enxuto (substituiu cards verticais grandes):
    [logo] Nubank · Conta             [CC]
    R$ 12.450,00
    +R$ 2.000 aplicado · há 3min

    [logo] Mastercard · NU            [CRED]
    R$ 1.200 / R$ 3.000  (40%)
    ▓▓▓▓░░░░░░ vence 11/05

  Grid responsivo: 1/2/3/4 cols em xs/sm/md/lg.
  Renderiza apenas com >=1 account; sem accounts o componente
  desaparece (parent decide).
-->
<template>
  <section v-if="accounts.length > 0 || pending" class="bank-section">
    <!-- Header compacto: eyebrow + title à esquerda, total inline à direita -->
    <header class="bank-section__head">
      <div class="bank-section__title-group">
        <span class="bank-section__eyebrow">Open Finance</span>
        <h2 class="bank-section__title">Saldos em conta</h2>
      </div>
      <div v-if="totals && totals.bank > 0" class="bank-section__total">
        <span class="bank-section__total-label">Total disponível</span>
        <span class="bank-section__total-value">{{ formatBrl(totals.bank) }}</span>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="pending && accounts.length === 0" class="bank-section__loading">
      <UIcon name="i-lucide-loader" class="size-5 motion-safe:animate-spin" aria-hidden="true" />
    </div>

    <!-- Grid de cards compactos -->
    <div v-else class="bank-grid">
      <article
        v-for="acc in accounts"
        :key="acc.id"
        class="bank-card"
        :class="acc.type === 'CREDIT' ? 'bank-card--credit' : 'bank-card--bank'"
      >
        <!-- Header: logo + nome + badge -->
        <header class="bank-card__head">
          <span class="bank-card__logo" aria-hidden="true">
            <img
              v-if="acc.institution?.logo"
              :src="acc.institution.logo"
              :alt="acc.institution.name"
              class="bank-card__logo-img"
              loading="lazy"
              @error="($event.target as HTMLImageElement).style.display='none'"
            >
            <UIcon
              v-else
              :name="acc.type === 'CREDIT' ? 'i-lucide-credit-card' : 'i-lucide-landmark'"
              class="size-3.5"
            />
          </span>
          <span class="bank-card__name">{{ acc.marketing_name || acc.name }}</span>
          <span class="bank-card__badge">{{ typeLabel(acc) }}</span>
        </header>

        <!-- Saldo bancário -->
        <template v-if="acc.type === 'BANK'">
          <p class="bank-card__amount">{{ formatBrl(acc.balance) }}</p>
          <p class="bank-card__meta">
            <span v-if="acc.bank_data?.automaticallyInvestedBalance && acc.bank_data.automaticallyInvestedBalance > 0">
              + {{ formatBrl(acc.bank_data.automaticallyInvestedBalance) }} aplicado
            </span>
            <span v-else>Saldo disponível</span>
            <span v-if="acc.last_synced_at" class="bank-card__meta-sync">
              · {{ formatTimeSince(acc.last_synced_at) }}
            </span>
          </p>
        </template>

        <!-- Cartão de crédito -->
        <template v-else-if="acc.type === 'CREDIT' && acc.credit_data">
          <p class="bank-card__amount bank-card__amount--credit">
            {{ formatBrl(creditUsed(acc)) }}
            <span class="bank-card__amount-of">
              de {{ formatBrl((acc.credit_data.creditLimit || 0) / 100) }}
            </span>
          </p>
          <div class="bank-card__bar" aria-hidden="true">
            <div
              class="bank-card__bar-fill"
              :style="{
                width: `${creditUsedPct(acc)}%`,
                backgroundColor: creditUsedPct(acc) > 80
                  ? 'var(--brand-negative)'
                  : creditUsedPct(acc) > 50
                    ? 'var(--brand-primary)'
                    : 'var(--brand-positive)',
              }"
            />
          </div>
          <p class="bank-card__meta">
            <span>{{ creditUsedPct(acc) }}% utilizado</span>
            <span v-if="acc.credit_data.balanceDueDate" class="bank-card__meta-sync">
              · vence {{ formatDateShort(acc.credit_data.balanceDueDate) }}
            </span>
          </p>
        </template>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PluggyAccount, AccountTotals } from '~/services/pluggy'

const props = defineProps<{
  accounts: PluggyAccount[]
  totals: AccountTotals | null
  pending?: boolean
}>()
void props

function formatBrl(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return 'R$ 0,00'
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  })
}

function typeLabel(acc: PluggyAccount): string {
  if (acc.type === 'CREDIT') return acc.credit_data?.brand?.slice(0, 4) || 'CRED'
  if (acc.subtype === 'SAVINGS_ACCOUNT') return 'POUP'
  return 'CC'
}

function creditUsed(acc: PluggyAccount): number {
  const limit = (acc.credit_data?.creditLimit || 0) / 100
  const available = (acc.credit_data?.availableCreditLimit || 0) / 100
  return Math.max(0, limit - available)
}

function creditUsedPct(acc: PluggyAccount): number {
  const limit = (acc.credit_data?.creditLimit || 0) / 100
  if (limit <= 0) return 0
  return Math.round((creditUsed(acc) / limit) * 100)
}

function formatDateShort(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  } catch {
    return iso
  }
}

function formatTimeSince(iso: string | null): string {
  if (!iso) return 'agora'
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `há ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours}h`
  const days = Math.floor(hours / 24)
  return `há ${days}d`
}
</script>

<style scoped>
.bank-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ============ HEAD ============ */
.bank-section__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.bank-section__title-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.bank-section__eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--brand-primary);
}

.bank-section__title {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.012em;
  color: var(--text-heading, var(--brand-text));
}

.bank-section__total {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.bank-section__total-label {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.bank-section__total-value {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--brand-positive, #10b981);
}

/* ============ LOADING ============ */
.bank-section__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 36px 0;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

/* ============ GRID ============ */
.bank-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

@media (min-width: 640px) {
  .bank-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .bank-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 1440px) {
  .bank-grid { grid-template-columns: repeat(4, 1fr); }
}

/* ============ CARD ============ */
.bank-card {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 12px 14px;
  border-radius: 13px;
  border: 1px solid;
  background: color-mix(in srgb, var(--brand-surface) 65%, var(--brand-background));
  transition: border-color 180ms, transform 120ms, box-shadow 180ms;
}

.bank-card:hover {
  transform: translateY(-1px);
}

.bank-card--bank {
  border-color: color-mix(in srgb, var(--brand-positive, #10b981) 20%, transparent);
}
.bank-card--bank:hover {
  border-color: color-mix(in srgb, var(--brand-positive, #10b981) 40%, transparent);
  box-shadow: 0 8px 18px -10px color-mix(in srgb, var(--brand-positive, #10b981) 35%, transparent);
}

.bank-card--credit {
  border-color: color-mix(in srgb, var(--brand-primary) 20%, transparent);
}
.bank-card--credit:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
  box-shadow: 0 8px 18px -10px color-mix(in srgb, var(--brand-primary) 35%, transparent);
}

/* ============ CARD HEAD ============ */
.bank-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.bank-card__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  flex-shrink: 0;
  overflow: hidden;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.bank-card__logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bank-card__name {
  flex: 1;
  min-width: 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--brand-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bank-card__badge {
  display: inline-flex;
  padding: 2px 6px;
  border-radius: 999px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.bank-card--bank .bank-card__badge {
  background: color-mix(in srgb, var(--brand-positive, #10b981) 14%, transparent);
  color: var(--brand-positive, #10b981);
}

.bank-card--credit .bank-card__badge {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
}

/* ============ AMOUNT ============ */
.bank-card__amount {
  margin: 0;
  font-family: var(--brand-font);
  font-variant-numeric: tabular-nums;
  font-size: 18px;
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.018em;
  color: var(--brand-text);
}

.bank-card__amount--credit {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}

.bank-card__amount-of {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 400;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

/* ============ BAR (credito) ============ */
.bank-card__bar {
  height: 3px;
  width: 100%;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  overflow: hidden;
}

.bank-card__bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* ============ META ============ */
.bank-card__meta {
  margin: 0;
  font-size: 10.5px;
  line-height: 1.4;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.bank-card__meta-sync {
  opacity: 0.85;
}
</style>
