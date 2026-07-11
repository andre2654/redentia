<script setup lang="ts">
// Chip pill de ticker com triângulo direcional (verde = alta, vermelho =
// baixa com triângulo girado 180°) — valores exatos do design (Redentia
// Noticias Nu.dc.html). Compartilhado: Mercado/Ações/Carteira. O backend
// emite também dir 'flat' (sem equivalente no mock) — degrada pra pill
// neutra sem triângulo.
import type { NoticiasDir } from '~/types/noticias'

defineProps<{ ticker: string; dir: NoticiasDir }>()
</script>

<template>
  <span class="ntk" :class="`ntk--${dir}`">
    <svg v-if="dir !== 'flat'" width="9" height="9" viewBox="0 0 10 10" class="ntk__arrow"><path d="M5 1.5l3.5 6H1.5z" fill="currentColor" /></svg>
    {{ ticker }}
  </span>
</template>

<style scoped>
.ntk {
  display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 800;
  padding: 6px 14px; border-radius: var(--nu-r-pill); white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.ntk--up { background: var(--nu-green-bg); color: var(--nu-green-2); }
.ntk--down { background: var(--nu-red-bg); color: var(--nu-red-2); }
.ntk--flat { background: var(--nu-sand-2); color: var(--nu-gray-tag); }
.ntk__arrow { display: block; }
.ntk--down .ntk__arrow { transform: rotate(180deg); }
</style>
