<script setup lang="ts">
// Frase + botão-link inline (azul, 800) pra alternar estados sem navegação
// — footer login↔cadastro e o 'voltar' da etapa de PIN.
defineProps<{ label: string; cta: string }>()
defineEmits<{ click: [] }>()
</script>

<template>
  <div class="nitt">
    {{ label }}
    <button type="button" class="nitt__btn" @click="$emit('click')">{{ cta }}</button>
  </div>
</template>

<style scoped>
.nitt { color: var(--nu-gray-2); font-size: 14.5px; font-weight: 600; }
.nitt__btn {
  background: transparent; border: none; padding: 0;
  color: var(--nu-blue); font-size: 14.5px; font-weight: 800;
  cursor: pointer; font-family: inherit;
}
</style>
