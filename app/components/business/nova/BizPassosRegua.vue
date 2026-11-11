<script setup lang="ts">
/**
 * A régua 01–04 dos passos (BizPassosCamera): a mesma do BizPassos de antes. Quatro links (#passo-<id>): o Tab passa por eles, e cada um, ao
 * receber o foco pelo teclado, leva ao passo dele. O trilho do passo em foco
 * enche com o progresso.
 */
import { PASSOS } from '~/content/business/landing'
import { n2 } from '~/composables/usePassosTravados'

defineProps<{ ativo: number; progresso: number; claro?: boolean }>()
const emit = defineEmits<{ ir: [i: number, ev: MouseEvent]; foco: [i: number, ev: FocusEvent] }>()
</script>

<template>
  <nav class="bpr" :class="{ 'bpr--claro': claro }" aria-label="Os quatro passos">
    <a
      v-for="(p, i) in PASSOS" :key="p.id" :href="`#passo-${p.id}`"
      class="bpr__marca" :class="{ 'bpr__marca--on': i === ativo, 'bpr__marca--feita': i < ativo }"
      :aria-label="`${n2(i)}, ${p.rotulo}`" :aria-current="i === ativo ? 'step' : undefined"
      :style="i === ativo ? { '--p': progresso } : undefined"
      @click="emit('ir', i, $event)" @focus="emit('foco', i, $event)"
    >
      <span class="bpr__n" aria-hidden="true">{{ n2(i) }}</span>
      <span class="bpr__trilho" aria-hidden="true"><span class="bpr__in" /></span>
    </a>
  </nav>
</template>

<style scoped>
.bpr { display: flex; gap: 6px; }
.bpr__marca { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; width: 52px; padding: 8px 0; color: var(--nu-cream-text-50); }
.bpr__n { font-size: 11px; font-weight: var(--nu-w-medio); letter-spacing: .08em; font-variant-numeric: tabular-nums; transition: color .3s; }
.bpr__trilho { position: relative; display: block; width: 100%; height: 2px; border-radius: 1px; background: var(--nu-cream-text-35); overflow: hidden; }
.bpr__in { position: absolute; inset: 0; background: var(--nu-cream-text); transform-origin: left center; transform: scaleX(0); }
.bpr__marca--feita .bpr__in { transform: scaleX(1); }
.bpr__marca--on { color: var(--nu-cream-text); }
.bpr__marca--on .bpr__in { transform: scaleX(var(--p, 0)); background: var(--nu-biz-lavanda); }
.bpr__marca:hover { color: var(--nu-cream-text); }
.bpr__marca:focus-visible { outline: 2px solid var(--nu-biz-lavanda); outline-offset: 2px; border-radius: 4px; }
/* sobre fundo claro (a janela do app da câmera) */
.bpr--claro .bpr__marca { color: var(--nu-gray); }
.bpr--claro .bpr__trilho { background: var(--nu-ink-14); }
.bpr--claro .bpr__in { background: var(--nu-navy); }
.bpr--claro .bpr__marca--on { color: var(--nu-ink); }
.bpr--claro .bpr__marca--on .bpr__in { background: var(--nu-blue); }
.bpr--claro .bpr__marca:focus-visible { outline-color: var(--nu-blue); }
@media (min-width: 960px) { .bpr { gap: 8px; } .bpr__marca { width: 64px; } }
@media (prefers-reduced-motion: no-preference) { .bpr__in { transition: transform .2s linear; } }
</style>
