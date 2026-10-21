<script setup lang="ts" generic="T extends string | number">
// Um campo da frase com opções fixas (21/10/2026): o mês do imposto de renda.
// O valor aparece como os outros campos da frase (CalcFraseCampo); o toque
// abre o seletor do próprio aparelho, um <select> invisível por cima do valor,
// para o valor ter a largura do texto escolhido e não a da opção mais longa.
defineProps<{
  /** o nome do campo, para o leitor de tela */
  rotulo: string
  opcoes: { value: T; label: string }[]
}>()
const escolhida = defineModel<T>({ required: true })
// o <select> só existe no navegador: no HTML do servidor as opções entrariam no
// texto da frase ("Em setembro de 2026 outubro de 2026 …") para quem lê a página
const montado = ref(false)
onMounted(() => { montado.value = true })
</script>

<template>
  <span class="cfo">
    <span class="cfo__valor" :aria-hidden="montado">{{ opcoes.find((o) => o.value === escolhida)?.label ?? '' }}</span>
    <select v-if="montado" v-model="escolhida" class="cfo__seletor" :aria-label="rotulo">
      <option v-for="o in opcoes" :key="String(o.value)" :value="o.value">{{ o.label }}</option>
    </select>
  </span>
</template>

<style scoped>
/* o mesmo valor azul dos campos da frase (CalcFraseCampo) */
.cfo { position: relative; display: inline-block; white-space: nowrap; }
.cfo__valor {
  display: inline-block; padding: 0 0.32em 0.08em; border-radius: 0.36em;
  color: var(--nu-blue); background: color-mix(in srgb, var(--nu-blue) 9%, var(--nu-white));
  box-shadow: inset 0 -2px 0 color-mix(in srgb, var(--nu-blue) 55%, transparent);
  transition: background .18s ease;
}
.cfo:hover .cfo__valor { background: color-mix(in srgb, var(--nu-blue) 15%, var(--nu-white)); }
.cfo:focus-within .cfo__valor { outline: 3px solid color-mix(in srgb, var(--nu-blue) 45%, transparent); outline-offset: 2px; }
.cfo__seletor {
  position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; padding: 0; border: 0;
  opacity: 0; cursor: pointer; font-size: 16px; appearance: none;
}
</style>
