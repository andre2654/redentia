<script setup lang="ts">
/**
 * Uma banda do painel do escritório, no layout da Redentia: fundo inteiro
 * (creme, branco ou navy), chamada azul e título grande (NuSectionHeading), e
 * o conteúdo numa coluna de até 1.120 px. A troca de fundo é o separador
 * entre seções, como na /carteira e na /asset.
 *
 * A banda define as cores dos painéis de dentro (--rbp-painel, --rbp-linha):
 * painel branco na banda creme, creme na branca, navy claro na navy.
 */
withDefaults(defineProps<{
  tom?: 'creme' | 'branco' | 'navy'
  eyebrow?: string
  titulo?: string
  dek?: string
  id?: string
}>(), { tom: 'branco' })
</script>

<template>
  <section :id="id" class="rbb" :class="`rbb--${tom}`">
    <div class="rbb__in">
      <NuSectionHeading v-if="titulo" :eyebrow="eyebrow" :dark="tom === 'navy'">
        {{ titulo }}
        <template v-if="dek" #dek>{{ dek }}</template>
      </NuSectionHeading>
      <div class="rbb__corpo" :class="{ 'rbb__corpo--sem-titulo': !titulo }">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.rbb { padding: clamp(56px, 8vw, 104px) clamp(22px, 5.5vw, 80px); scroll-margin-top: 72px; }
.rbb__in { max-width: 1120px; margin: 0 auto; }
.rbb__corpo { margin-top: clamp(28px, 4vw, 44px); }
.rbb__corpo--sem-titulo { margin-top: 0; }

.rbb--creme { background: var(--nu-cream); --rbp-painel: var(--nu-white); --rbp-linha: var(--nu-sand-2); --rbp-neutro: var(--nu-cream-2); }
.rbb--branco { background: var(--nu-white); --rbp-painel: var(--nu-cream); --rbp-linha: var(--nu-sand-2); --rbp-neutro: var(--nu-white); }
.rbb--navy { background: var(--nu-navy); --rbp-painel: var(--nu-navy-2); --rbp-linha: var(--nu-navy-3); --rbp-neutro: var(--nu-navy-3); }
</style>
