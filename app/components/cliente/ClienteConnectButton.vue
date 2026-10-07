<script setup lang="ts">
/**
 * O botão largo do widget de conexão (o "Continuar" do Pluggy Connect):
 * 100% da largura, 50 px, raio 12. `primary` azul; `ghost` branco com borda;
 * `danger` para revogar (fica vermelho cheio quando `armado`). Com `href`
 * vira link com a mesma cara (o "Gerenciar acesso" da tela de sucesso).
 * `loading` trava e mostra o giro; o rótulo é do pai.
 */
withDefaults(defineProps<{
  variant?: 'primary' | 'ghost' | 'danger'
  disabled?: boolean
  loading?: boolean
  armado?: boolean
  type?: 'button' | 'submit'
  href?: string
}>(), { variant: 'primary', type: 'button' })
</script>

<template>
  <a v-if="href" :href="href" class="ccb" :class="`ccb--${variant}`" rel="noreferrer">
    <slot />
  </a>
  <button
    v-else
    :type="type"
    class="ccb"
    :class="[`ccb--${variant}`, { 'ccb--armado': armado, 'ccb--wait': loading }]"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
  >
    <span v-if="loading" class="ccb__spin" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.ccb {
  display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; min-height: 50px;
  padding: 0 20px; border-radius: 12px; border: 1.5px solid transparent;
  font-family: inherit; font-size: 15.5px; font-weight: 800; letter-spacing: -.01em; line-height: 1.2;
  cursor: pointer; text-decoration: none; text-align: center;
  transition: background .2s, color .2s, border-color .2s, transform .15s;
}
.ccb--primary { background: var(--nu-blue); color: var(--nu-white); }
.ccb--primary:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.ccb--ghost { background: var(--nu-white); color: var(--nu-ink); border-color: var(--nu-cream-line); }
.ccb--ghost:hover { background: var(--nu-cream); color: var(--nu-ink); }
.ccb--danger { background: var(--nu-white); color: var(--nu-red-2); border-color: var(--nu-red-2); }
.ccb--danger:hover, .ccb--armado { background: var(--nu-red-2); color: var(--nu-white); }
.ccb:disabled { background: var(--nu-cream-2); color: var(--nu-gray); border-color: transparent; cursor: default; }
.ccb--wait { pointer-events: none; }
.ccb:focus-visible { outline: 2px solid var(--nu-ink); outline-offset: 2px; }
.ccb:active:not(:disabled) { transform: scale(.985); }
.ccb__spin {
  width: 16px; height: 16px; border-radius: 50%; border: 2px solid currentColor; border-right-color: transparent;
  animation: ccb-spin .7s linear infinite;
}
@keyframes ccb-spin { to { transform: rotate(360deg); } }
</style>
