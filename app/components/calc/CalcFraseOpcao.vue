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
/* o mesmo selo dos campos da frase (CalcFraseCampo): fundo azul claro, fio reto, hover, apertado e foco.
   Quem recebe o ponteiro e o foco é o <select> invisível por cima; o selo responde pelo :hover/:focus-within do pai. */
.cfo { position: relative; display: inline-block; white-space: nowrap; }
.cfo__valor {
  --cfo-fundo: var(--nu-blue-bg);
  --cfo-fio: color-mix(in srgb, var(--nu-blue) 62%, transparent); --cfo-fio-e: 1.5px;
  display: inline-block; padding: 0 0.32em 0.08em; border-radius: 0.36em;
  color: var(--nu-blue-text); background-color: var(--cfo-fundo);
  background-image: linear-gradient(var(--cfo-fio), var(--cfo-fio));
  background-repeat: no-repeat; background-position: 50% 100%; background-size: calc(100% - .5em) var(--cfo-fio-e);
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), background-size var(--nu-dur-media) var(--nu-ease-saida);
}
.cfo:hover .cfo__valor { --cfo-fundo: color-mix(in srgb, var(--nu-blue) 16%, var(--nu-white)); --cfo-fio: var(--nu-blue); --cfo-fio-e: 2px; }
.cfo:active .cfo__valor { --cfo-fundo: color-mix(in srgb, var(--nu-blue) 24%, var(--nu-white)); transition-duration: var(--nu-dur-rapida); }
.cfo:has(.cfo__seletor:focus-visible) .cfo__valor { outline: 3px solid var(--nu-blue); outline-offset: 2px; }
.cfo__seletor {
  position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; padding: 0; border: 0;
  opacity: 0; cursor: pointer; font-size: 16px; appearance: none;
}
.cfo__seletor:focus-visible { outline: none; }
</style>
