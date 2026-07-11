<script setup lang="ts">
// Pill de metadado (PR5, design Redentia Tese.dc.html): variantes de cor —
// dark translúcida sobre navy, verde-accent (convicção no hero), verde/azul/
// vermelho claros, neutra, preta sólida (data do estudo) e azul sólida
// ('Entra hoje') — × tamanhos exatos por contexto do design:
//   hero  = 13px   / 7px 14px (badges do hero)
//   card  = 12.5px / 7px 15px (badges do card do diário)
//   row   = 12.5px / 6px 13px (pill de convicção das linhas de estudo)
//   eval  = 12px   / 6px 13px (badge de status da avaliação por ativo)
//   label = 11.5px / 6px 13px + uppercase ls 1px (tag dos decision cards)
// Ícones entram por slot (seta da convicção, etc).
defineProps<{
  variant: 'dark' | 'green-soft' | 'green' | 'blue' | 'blue-solid' | 'red' | 'neutral' | 'black'
  size?: 'hero' | 'card' | 'row' | 'eval' | 'label'
}>()
</script>

<template>
  <span class="nb" :class="[`nb--${variant}`, `nb--s-${size ?? 'card'}`]"><slot /></span>
</template>

<style scoped>
.nb {
  display: inline-flex; align-items: center; gap: 7px; font-weight: 800;
  border-radius: var(--nu-r-pill); white-space: nowrap; font-variant-numeric: tabular-nums;
}
.nb--s-hero { font-size: 13px; padding: 7px 14px; gap: 6px; }
.nb--s-card { font-size: 12.5px; padding: 7px 15px; }
.nb--s-row { font-size: 12.5px; padding: 6px 13px; }
.nb--s-eval { font-size: 12px; padding: 6px 13px; }
.nb--s-label { font-size: 11.5px; padding: 6px 13px; letter-spacing: 1px; text-transform: uppercase; }
.nb--dark { background: var(--nu-cream-text-12); color: var(--nu-cream-text); }
.nb--green-soft { background: var(--nu-green-soft-16); color: var(--nu-green-soft); }
.nb--green { background: var(--nu-green-bg); color: var(--nu-green-2); }
.nb--blue { background: var(--nu-blue-bg); color: var(--nu-blue-deep); }
.nb--blue-solid { background: var(--nu-blue); color: var(--nu-white); }
.nb--red { background: var(--nu-red-bg); color: var(--nu-red-2); }
.nb--neutral { background: var(--nu-sand-2); color: var(--nu-gray-2); }
.nb--black { background: var(--nu-ink); color: var(--nu-white); }
</style>
