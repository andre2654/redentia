<script setup lang="ts">
// Botão de conexão Open Finance (fluxo Pluggy portado do Frontend — ver
// usePluggyConnect). Estados: idle → abrindo → widget → registrando →
// conectado (emite 'connected' pro pai dar refresh). Erro em qualquer etapa
// degrada pra instrução clara embaixo do botão — NUNCA botão morto.
const emit = defineEmits<{ (e: 'connected'): void }>()
const { openWidget, opening, registering, error } = usePluggyConnect()

const connected = ref(false)

const label = computed(() => {
  if (connected.value) return 'Conexão criada'
  if (registering.value) return 'Registrando conexão…'
  if (opening.value) return 'Abrindo conexão segura…'
  return 'Conectar pelo Open Finance'
})

function connect() {
  if (opening.value || registering.value || connected.value) return
  openWidget({
    onConnected: () => {
      connected.value = true
      emit('connected')
    },
  })
}
</script>

<template>
  <div class="cct">
    <!-- a chamada principal da tela: a pílula azul com a seta (os três pontos enquanto abre) -->
    <NuBotaoSeta :disabled="connected" :loading="opening || registering" @click="connect">{{ label }}</NuBotaoSeta>
    <p v-if="connected" class="cct__ok">
      Conexão criada. Estamos sincronizando suas posições, elas aparecem aqui
      em alguns minutos.
    </p>
    <p v-else-if="error" class="cct__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.cct { display: inline-flex; flex-direction: column; gap: 12px; }
.cct__ok { margin: 0; color: var(--nu-green-text); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; max-width: 460px; }
.cct__error { margin: 0; color: var(--nu-red-text); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; max-width: 460px; }
</style>
