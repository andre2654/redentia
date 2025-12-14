<template>
  <AtomsFormInput
    placeholder="Senha"
    aria-describedby="password-strength"
    size="lg"
    :type="show ? 'text' : 'password'"
  >
    <template #trailing>
      <UButton
        color="neutral"
        variant="link"
        size="sm"
        :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        :aria-label="show ? 'Ocultar senha' : 'Mostrar senha'"
        :aria-pressed="show"
        @click="show = !show"
      />
    </template>
  </AtomsFormInput>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const show = ref(false)
</script>
