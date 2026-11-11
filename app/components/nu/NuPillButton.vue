<script setup lang="ts">
// CTA pill do design de auth: radius 999, padding 17px 24px, 16.5px/800.
// Estados: disabled (creme + texto sand, pointer-events none) e primary
// (azul + branco). `loading` mantém o visual primary mas trava interação
// (estado de envio nos CTAs — o label é responsabilidade do pai).
withDefaults(
  defineProps<{
    disabled?: boolean
    loading?: boolean
    type?: 'button' | 'submit'
  }>(),
  { type: 'button' },
)
</script>

<template>
  <button
    :type="type"
    class="npb"
    :class="{ 'npb--off': disabled, 'npb--wait': loading }"
    :disabled="disabled || loading"
  >
    <slot />
  </button>
</template>

<style scoped>
.npb {
  display: flex; align-items: center; justify-content: center; width: 100%;
  border: none; border-radius: var(--nu-r-pill); padding: 17px 24px;
  background: var(--nu-blue); color: var(--nu-white);
  font-size: 17px; font-weight: var(--nu-w-medio); cursor: pointer; min-height: 58px;
  transition: background .2s, color .2s, transform .15s;
}
.npb:hover { background: var(--nu-blue-hover); }
.npb:active { transform: scale(.98); }
.npb--off { background: var(--nu-cream-2); color: var(--nu-gray); pointer-events: none; cursor: default; }
.npb--wait { pointer-events: none; cursor: default; }
</style>
