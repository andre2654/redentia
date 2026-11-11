<script setup lang="ts">
// Apple e Google juntos, para a folha de cadastro e o quiz da assinatura:
// as duas pílulas de marca do /login, com o divisor "ou" embaixo.
// Sem nenhum dos dois configurado no ambiente, não renderiza nada (nem o
// divisor), e o e-mail fica sozinho como antes.
import type { AppleCredencial } from '~/composables/useAppleAuth'

defineProps<{ disabled?: boolean; divisor?: string }>()
const emit = defineEmits<{ google: [idToken: string]; apple: [cred: AppleCredencial]; error: [message: string] }>()

const { clientId: google } = useGoogleAuth()
const { clientId: apple } = useAppleAuth()
const disponivel = !!(google || apple)
</script>

<template>
  <div v-if="disponivel" class="lso">
    <div class="lso__caixa">
      <LoginAppleButton :disabled="disabled" @credential="emit('apple', $event)" @error="emit('error', $event)" />
      <LoginGoogleButton :disabled="disabled" @credential="emit('google', $event)" @error="emit('error', $event)" />
    </div>
    <p v-if="divisor" class="lso__ou"><span>{{ divisor }}</span></p>
  </div>
</template>

<style scoped>
.lso { display: flex; flex-direction: column; gap: 16px; }
.lso__caixa { display: flex; flex-direction: column; gap: 8px; }
/* o divisor: fio de 1px dos dois lados, a legenda no meio */
.lso__ou {
  display: flex; align-items: center; gap: 16px; margin: 0;
  color: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
}
.lso__ou::before, .lso__ou::after { content: ''; flex: 1; height: 1px; background: var(--nu-line); }
</style>
