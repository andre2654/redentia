<script setup lang="ts">
// Faixa "Saldo em conta" no topo de 'Suas posições.' (pedido do dono
// 2026-07-16): mostra o dinheiro PARADO em conta corrente (bank_balance das
// conexões Open Finance, cartão de crédito fora) — um chip por banco com
// logo + saldo, e o total à direita. É informativo: dinheiro em conta não é
// posição investida, então NÃO entra nos totais/percentuais dos grupos nem
// na alocação do hero (número inventado nunca; mistura de conceito também
// não). Some quando não há saldo (conexão zerada ou sem Open Finance).
// Valores respeitam o botão-olho. Dados via useContasConectadas (fetch
// compartilhado com as pills do hero).
const { connections, ensure, saldoTotal } = useContasConectadas()
onMounted(ensure)

const { hidden } = useHiddenValues()

const comSaldo = computed(() =>
  connections.value.filter(c => (c.bank_balance ?? 0) > 0))

const visible = computed(() => comSaldo.value.length > 0)

function brl(n: number): string {
  return hidden.value
    ? 'R$ ••'
    : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}
</script>

<template>
  <div v-if="visible" class="csc" aria-label="Saldo em conta">
    <div class="csc__head">
      <span class="csc__dot" aria-hidden="true" />
      <span class="csc__title">Saldo em conta</span>
      <span class="csc__sub">dinheiro parado, fora do patrimônio investido</span>
      <span class="csc__total">{{ brl(saldoTotal) }}</span>
    </div>
    <div class="csc__chips">
      <span v-for="c in comSaldo" :key="c.id" class="csc__chip">
        <span class="csc__logo" aria-hidden="true">
          <img v-if="c.institution_logo" :src="c.institution_logo" alt="" loading="lazy" width="22" height="22">
          <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M6 21V7l6-4 6 4v14" /></svg>
        </span>
        <span class="csc__chip-name">{{ c.institution_name }}</span>
        <span class="csc__chip-val">{{ brl(c.bank_balance ?? 0) }}</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.csc {
  background: var(--nu-white); border-radius: var(--nu-r-card);
  padding: 18px 22px; margin: 26px 0 6px;
  box-shadow: var(--nu-shadow-card);
}
.csc__head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.csc__dot {
  width: 11px; height: 11px; border-radius: 4px; flex-shrink: 0;
  background: var(--nu-alloc-cash); align-self: center;
}
.csc__title { color: var(--nu-ink); font-size: 16.5px; font-weight: 800; }
.csc__sub { color: var(--nu-gray); font-size: 13px; font-weight: 600; }
.csc__total {
  margin-left: auto; color: var(--nu-ink); font-size: 18px; font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.csc__chips { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 13px; }
.csc__chip {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--nu-cream); border-radius: var(--nu-r-pill);
  padding: 7px 14px 7px 8px;
}
.csc__logo {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0; overflow: hidden;
  background: var(--nu-white); color: var(--nu-gray);
  display: inline-flex; align-items: center; justify-content: center;
}
.csc__logo img { width: 100%; height: 100%; object-fit: contain; display: block; }
.csc__chip-name { color: var(--nu-gray-2); font-size: 13px; font-weight: 700; }
.csc__chip-val { color: var(--nu-ink); font-size: 13.5px; font-weight: 800; font-variant-numeric: tabular-nums; }
</style>
