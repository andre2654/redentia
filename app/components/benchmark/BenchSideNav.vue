<script setup lang="ts">
// Menu do /benchmark-ia (anatomia do ranking do OpenRouter, pele Nu).
// Largo: coluna fixa (sticky), um item por seção, ícone de traço + rótulo,
// ativo em pílula azul-tint.
// Estreito (container da página < 1000px): UM seletor compacto com o ícone e
// o nome da seção atual e uma seta. Usa <select> nativo de propósito: no
// celular abre a lista do próprio sistema, que todo mundo sabe usar. A fila
// de pílulas que existia antes cortava a ativa na borda e deixava a última
// pela metade (dono, 15/10: "esse seletor no mobile tá horrível").
// Ícones em utils/benchIcons.ts (traço 1.8 em currentColor; o repo não tem
// biblioteca de ícone, de propósito).
import type { BenchNavItem } from '~/types/benchmark'

const props = defineProps<{ items: BenchNavItem[]; active: string }>()
const emit = defineEmits<{ (e: 'go', id: string): void }>()

const current = computed(() => props.items.find((i) => i.id === props.active) ?? props.items[0]!)
const pos = computed(() => props.items.findIndex((i) => i.id === current.value.id) + 1)
const onPick = (e: Event) => emit('go', (e.target as HTMLSelectElement).value)
</script>

<template>
  <nav class="bsn" aria-label="Seções do ranking">
    <div class="bsn__list">
      <a
        v-for="it in items" :key="it.id" :href="`#${it.id}`"
        class="bsn__item" :class="{ 'bsn__item--on': it.id === active }"
        :aria-current="it.id === active ? 'true' : undefined"
        @click.prevent="emit('go', it.id)"
      >
        <svg class="bsn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path :d="BENCH_ICONS[it.icon] ?? BENCH_ICONS.trophy" />
        </svg>
        <span class="bsn__label">{{ it.label }}</span>
        <span v-if="it.soon" class="bsn__soon">em breve</span>
      </a>
    </div>

    <label class="bsn__pick">
      <svg class="bsn__pick-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path :d="BENCH_ICONS[current.icon] ?? BENCH_ICONS.trophy" />
      </svg>
      <span class="bsn__pick-text">
        <span class="bsn__pick-label">{{ current.label }}</span>
        <span class="bsn__pick-pos">{{ pos }} de {{ items.length }}</span>
      </span>
      <svg class="bsn__pick-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 9l6 6 6-6" />
      </svg>
      <!-- select nativo por cima de tudo, invisível: o toque abre a lista do sistema -->
      <select class="bsn__select" :value="current.id" aria-label="Ir para a seção" @change="onPick">
        <option v-for="it in items" :key="it.id" :value="it.id">{{ it.label }}{{ it.soon ? ' (em breve)' : '' }}</option>
      </select>
    </label>
  </nav>
</template>

<style scoped>
.bsn__list { display: flex; flex-direction: column; gap: 2px; }
.bsn__item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border-radius: var(--nu-r-chip);
  color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; text-decoration: none;
  transition: background .2s, color .2s;
}
.bsn__item:hover { background: var(--nu-cream); color: var(--nu-ink); }
.bsn__item--on, .bsn__item--on:hover { background: var(--nu-blue-tint); color: var(--nu-blue-text); font-weight: 700; }
.bsn__item:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.bsn__icon { width: 20px; height: 20px; flex-shrink: 0; }
.bsn__label { flex: 1; min-width: 0; }
.bsn__soon {
  border-radius: var(--nu-r-pill); padding: 2px 8px;
  background: var(--nu-sand-2); color: var(--nu-gray-2); font-size: var(--nu-fs-xs); font-weight: 700;
}
.bsn__item--on .bsn__soon { background: var(--nu-white); }

.bsn__pick { display: none; }

@container bench (max-width: 1000px) {
  .bsn__list { display: none; }
  .bsn__pick {
    position: relative; display: flex; align-items: center; gap: 12px;
    height: 48px; padding: 0 14px; border-radius: var(--nu-r-input);
    background: var(--nu-cream); color: var(--nu-ink);
  }
  /* anel só no teclado: depois de tocar e escolher, não fica contorno azul */
  .bsn__pick:has(.bsn__select:focus-visible) { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
  .bsn__pick-icon { width: 20px; height: 20px; flex-shrink: 0; color: var(--nu-blue); }
  .bsn__pick-text { flex: 1; min-width: 0; display: flex; align-items: baseline; gap: 8px; }
  .bsn__pick-label {
    font-size: var(--nu-fs-md); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .bsn__pick-pos { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .bsn__pick-chev { width: 18px; height: 18px; flex-shrink: 0; color: var(--nu-gray-2); }
  .bsn__select {
    position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;
    font-size: var(--nu-fs-md); /* ≥16px: o iOS não dá zoom ao focar */
  }
}
</style>
