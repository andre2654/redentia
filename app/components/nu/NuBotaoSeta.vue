<script setup lang="ts">
// O botão-assinatura da Aportou: pílula com a seta dentro de um círculo à
// direita ("Criar conta grátis →"). É a chamada principal de cada tela; ações
// secundárias usam link em negrito ou a pílula simples (NuPillButton).
//   variante: azul (principal) · carvao (segunda chamada sobre creme) ·
//             creme (sobre carvão ou sobre o azul) · contorno (branco, borda carvão)
//   tamanho:  g = 62px (herói, formulário) · m = 52px (seção, cartão)
// Vira <NuxtLink> com `to`, <a> com `href`, senão <button>.
// Microtransição: ao passar o ponteiro a seta sai pela direita e volta pela
// esquerda; ao apertar, a pílula afunda 2%.
const props = withDefaults(defineProps<{
  to?: string
  href?: string
  variante?: 'azul' | 'carvao' | 'creme' | 'contorno'
  tamanho?: 'g' | 'm'
  type?: 'button' | 'submit'
  disabled?: boolean
  loading?: boolean
  largo?: boolean
}>(), { variante: 'azul', tamanho: 'g', type: 'button' })

const tag = computed(() => (props.to ? resolveComponent('NuxtLink') : props.href ? 'a' : 'button'))
const attrs = computed(() => props.to
  ? { to: props.to }
  : props.href
    ? { href: props.href }
    : { type: props.type, disabled: props.disabled || props.loading })
</script>

<template>
  <component
    :is="tag" v-bind="attrs" class="nbs"
    :class="[`nbs--${variante}`, `nbs--${tamanho}`, { 'nbs--largo': largo, 'nbs--off': disabled, 'nbs--wait': loading }]"
    :aria-busy="loading || undefined"
  >
    <span class="nbs__txt"><slot /></span>
    <span class="nbs__bola" aria-hidden="true">
      <span v-if="loading" class="nbs__pontos"><i /><i /><i /></span>
      <svg v-else class="nbs__seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15" /><path d="M13.5 6.5 19 12l-5.5 5.5" /></svg>
    </span>
  </component>
</template>

<style scoped>
.nbs {
  --nbs-bg: var(--nu-blue); --nbs-fg: var(--nu-white); --nbs-bola: var(--nu-white); --nbs-seta: var(--nu-blue);
  display: inline-flex; align-items: center; justify-content: space-between; gap: 16px;
  min-height: 62px; padding: 0 8px 0 28px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nbs-bg); color: var(--nbs-fg);
  font-family: inherit; font-size: 19px; font-weight: 700; line-height: 1.1; white-space: nowrap;
  text-decoration: none; cursor: pointer;
  transition: background .2s, transform .15s cubic-bezier(.2, .8, .2, 1), box-shadow .2s;
}
.nbs:hover { color: var(--nbs-fg); }
.nbs--m { min-height: 52px; font-size: 16.5px; }
.nbs--largo { display: flex; width: 100%; }
.nbs__bola {
  flex: none; width: 46px; height: 46px; border-radius: 50%; overflow: hidden;
  background: var(--nbs-bola); color: var(--nbs-seta);
  display: flex; align-items: center; justify-content: center;
}
.nbs--m .nbs__bola { width: 38px; height: 38px; }
.nbs__seta { width: 20px; height: 20px; display: block; }
.nbs--m .nbs__seta { width: 18px; height: 18px; }

.nbs--azul:hover { background: var(--nu-blue-hover); }
.nbs--carvao { --nbs-bg: var(--nu-ink); --nbs-seta: var(--nu-ink); }
.nbs--carvao:hover { background: var(--nu-ink-hover); }
.nbs--creme { --nbs-bg: var(--nu-creme); --nbs-fg: var(--nu-ink); --nbs-bola: var(--nu-ink); --nbs-seta: var(--nu-creme); }
.nbs--creme:hover { background: var(--nu-white); }
.nbs--contorno { --nbs-bg: var(--nu-white); --nbs-fg: var(--nu-ink); --nbs-bola: var(--nu-ink); --nbs-seta: var(--nu-white); box-shadow: inset 0 0 0 1.5px var(--nu-ink); }
.nbs--contorno:hover { background: var(--nu-row-hover); }

.nbs:hover .nbs__seta { animation: nu-seta .45s cubic-bezier(.4, 0, .2, 1); }
.nbs:active { transform: scale(.98); }
.nbs--off { --nbs-bg: var(--nu-cream-2); --nbs-fg: var(--nu-gray); --nbs-bola: var(--nu-white); --nbs-seta: var(--nu-sand); pointer-events: none; cursor: default; }
.nbs--wait { pointer-events: none; cursor: default; }
.nbs__pontos { display: flex; gap: 3px; }
.nbs__pontos i { width: 5px; height: 5px; border-radius: 50%; background: currentColor; animation: nu-ponto 1.2s infinite; }
.nbs__pontos i:nth-child(2) { animation-delay: .2s; }
.nbs__pontos i:nth-child(3) { animation-delay: .4s; }
@media (max-width: 420px) { .nbs { font-size: 17px; padding-left: 22px; } }
</style>
