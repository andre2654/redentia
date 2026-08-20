<script setup lang="ts">
/**
 * Árvore de look-through do ETF — recursiva: cada nível renderiza a si
 * mesmo pros filhos (Nuxt resolve a auto-referência pelo nome do arquivo).
 *
 * Anatomia espelha as linhas do modal (axm__row), com duas leituras de peso
 * por nó: o LOCAL (fração do pai, o número forte) e o EFETIVO (fração do
 * ETF raiz, que normaliza a barra — assim uma posição de 12% dentro de um
 * fundo de 80% desenha barra menor que uma posição direta de 12%).
 *
 * Nós sem filhos por motivo conhecido carregam a nota honesta do VM
 * ("carteira ainda não ingerida", "já aparece acima", "fundo fora da
 * bolsa") — a UI nunca finge folha.
 */
import type { EtfXrayTreeNodeVM } from '~/types/acao'

const props = withDefaults(defineProps<{
  nodes: EtfXrayTreeNodeVM[]
  /** maior pctEff da árvore inteira — o pai raiz calcula e desce */
  maxEff: number
  depth?: number
}>(), { depth: 0 })

const open = ref(new Set<string>())
function toggle(key: string) {
  const next = new Set(open.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  open.value = next
}

const barPct = (n: EtfXrayTreeNodeVM) =>
  n.pctEff !== null ? Math.max(1.5, (n.pctEff / Math.max(props.maxEff, 0.01)) * 100) : 0
</script>

<template>
  <div class="axt" :class="{ 'axt--nested': depth > 0 }">
    <template v-for="n in nodes" :key="n.key">
      <div class="axt__row">
        <button
          v-if="n.expandable"
          type="button"
          class="axt__chev"
          :class="{ 'axt__chev--open': open.has(n.key) }"
          :aria-expanded="open.has(n.key)"
          :aria-label="open.has(n.key) ? `Fechar ${n.ticker ?? n.name}` : `Abrir ${n.ticker ?? n.name}`"
          @click="toggle(n.key)"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
        </button>
        <span v-else class="axt__dot" aria-hidden="true" />

        <div class="axt__name">
          <b v-if="n.ticker">{{ n.ticker }}</b>
          <b v-else>{{ n.name }}</b>
          <span class="axt__sub">
            <template v-if="n.ticker && n.name !== n.ticker">{{ n.name }}</template>
            <template v-else>{{ n.typeLabel }}</template>
            <em v-if="n.note" class="axt__note">{{ n.note }}</em>
          </span>
        </div>

        <div class="axt__bar" aria-hidden="true">
          <div class="axt__fill" :style="{ width: `${barPct(n)}%` }" />
        </div>

        <div class="axt__pcts">
          <span class="axt__pct">{{ n.pctLocalLabel }}</span>
          <span v-if="n.pctEffLabel" class="axt__eff">= {{ n.pctEffLabel }}</span>
        </div>

        <NuxtLink v-if="n.ticker" :to="`/asset/${n.ticker}`" class="axt__go" :aria-label="`Abrir ${n.ticker}`">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
        </NuxtLink>
        <span v-else class="axt__go-spacer" aria-hidden="true" />
      </div>

      <div v-if="n.expandable" v-show="open.has(n.key)" class="axt__children">
        <AcaoEtfXrayTree :nodes="n.children" :max-eff="maxEff" :depth="depth + 1" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.axt { display: flex; flex-direction: column; }
.axt--nested { border-left: 2px solid var(--nu-ink-14); margin-left: 11px; padding-left: 14px; }

.axt__row { display: flex; align-items: center; gap: 12px; padding: 9px 0; }

.axt__chev {
  flex-shrink: 0; width: 24px; height: 24px; border: none; border-radius: 8px;
  background: var(--nu-sand-2); color: var(--nu-gray-2); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background .15s, transform .15s;
}
.axt__chev:hover { background: var(--nu-sand-hover); }
.axt__chev:focus-visible { outline: 2px solid var(--nu-ink); outline-offset: 2px; }
.axt__chev--open { transform: rotate(90deg); }
.axt__dot { flex-shrink: 0; width: 24px; text-align: center; }
.axt__dot::before { content: '·'; color: var(--nu-gray); font-weight: 800; }

.axt__name { flex: 1.4; min-width: 0; display: flex; flex-direction: column; }
.axt__name b { color: var(--nu-ink); font-size: 13.5px; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.axt__sub { color: var(--nu-gray); font-size: 11.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.axt__note { color: var(--nu-gray-tag); font-style: normal; font-weight: 700; }
.axt__note::before { content: ' · '; }

.axt__bar { flex: 1; height: 6px; border-radius: 999px; background: var(--nu-sand-2); overflow: hidden; }
.axt__fill { height: 100%; border-radius: 999px; background: var(--nu-blue); }

.axt__pcts { flex-shrink: 0; min-width: 118px; text-align: right; display: flex; flex-direction: column; }
.axt__pct { color: var(--nu-ink); font-size: 13px; font-weight: 800; font-variant-numeric: tabular-nums; }
.axt__eff { color: var(--nu-gray); font-size: 11px; font-weight: 700; font-variant-numeric: tabular-nums; }

.axt__go {
  flex-shrink: 0; width: 26px; height: 26px; border-radius: 999px;
  background: var(--nu-blue); color: var(--nu-white);
  display: inline-flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.axt__go:hover { background: var(--nu-blue-hover); }
.axt__go:focus-visible { outline: 2px solid var(--nu-ink); outline-offset: 2px; }
.axt__go-spacer { flex-shrink: 0; width: 26px; }

@media (max-width: 760px) {
  .axt--nested { margin-left: 6px; padding-left: 8px; }
  .axt__bar { display: none; }
  .axt__pcts { min-width: 84px; }
}
</style>
