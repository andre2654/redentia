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
  font-size: 16.5px; font-weight: 800; cursor: pointer;
  transition: background .2s, color .2s, transform .15s;
}
.npb--off { background: var(--nu-cream-2); color: var(--nu-sand); pointer-events: none; cursor: default; }
.npb--wait { pointer-events: none; cursor: default; }
</style>
