<script setup lang="ts">
/**
 * NuDobra: o corpo que abre e fecha embaixo de uma linha (11/11/2026,
 * robustez). É a dobra do NuAcordeao sem o cabeçalho, para quando o botão que
 * abre é outro: o "Como calculei" de um aviso, de um risco, de um indicador.
 *
 *   <button :aria-expanded="aberto" aria-controls="como-1" @click="aberto = !aberto">
 *     Como calculei <NuMais :tamanho="28" :aberto="aberto" />
 *   </button>
 *   <NuDobra id="como-1" :aberta="aberto"><p>…</p></NuDobra>
 *
 * Props
 *   aberta  aberta ou fechada
 *   como    a tag em volta (div, padrão)
 * Quem usa põe o `id` (para o aria-controls do botão) e a classe; o conteúdo
 * vem no slot.
 *
 * O conteúdo fica SEMPRE no HTML do servidor (o Google e o print leem tudo):
 * fechado, a altura é 0 (grid-template-rows 0fr → 1fr) e ele fica `inert`
 * (fora do Tab e do leitor de tela). A altura e a opacidade animam juntas em
 * --nu-dur-lenta --nu-ease-troca, como no NuAcordeao. Movimento reduzido: troca seca.
 */
withDefaults(defineProps<{ aberta?: boolean; como?: string }>(), { aberta: false, como: 'div' })
</script>

<template>
  <component :is="como" class="ndb" :class="{ 'ndb--aberta': aberta }" :inert="!aberta || undefined">
    <div class="ndb__dentro"><slot /></div>
  </component>
</template>

<style scoped>
.ndb {
  display: grid; grid-template-rows: 0fr; opacity: 0;
  transition: grid-template-rows var(--nu-dur-lenta) var(--nu-ease-troca), opacity var(--nu-dur-lenta) var(--nu-ease-troca);
}
.ndb--aberta { grid-template-rows: 1fr; opacity: 1; }
.ndb__dentro { min-height: 0; overflow: hidden; }
@media (prefers-reduced-motion: reduce) {
  .ndb { transition: none; }
}
</style>
