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
    <button type="button" class="cct__btn" :disabled="opening || registering || connected" @click="connect">
      {{ label }}
    </button>
    <p v-if="connected" class="cct__ok">
      Conexão criada. Estamos sincronizando suas posições, elas aparecem aqui
      em alguns minutos.
    </p>
    <p v-else-if="error" class="cct__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.cct { display: inline-flex; flex-direction: column; gap: 12px; }
.cct__btn {
  display: inline-flex; align-items: center; gap: 10px; background: var(--nu-blue); color: var(--nu-white);
  border: none; border-radius: var(--nu-r-pill); padding: 16px 28px; font-size: 16.5px; font-weight: 700;
  cursor: pointer; transition: background .2s, transform .15s;
}
.cct__btn:hover:not(:disabled) { background: var(--nu-blue-hover); transform: translateY(-2px); }
.cct__btn:disabled { opacity: .7; cursor: default; }
.cct__ok { margin: 0; color: var(--nu-green-2); font-size: 14.5px; font-weight: 600; line-height: 1.5; max-width: 460px; }
.cct__error { margin: 0; color: var(--nu-red-2); font-size: 14.5px; font-weight: 600; line-height: 1.5; max-width: 460px; }
</style>
