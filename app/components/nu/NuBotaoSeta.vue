<script setup lang="ts">
// O botão-assinatura da Aportou: pílula com a seta dentro de um círculo à
// direita ("Criar conta grátis →"). É a chamada principal de cada tela; ações
// secundárias usam link em negrito ou a pílula simples (NuPillButton).
//   variante: azul (principal) · carvao (segunda chamada sobre creme) ·
//             creme (sobre carvão ou sobre o azul) · contorno (branco, borda carvão)
//   tamanho:  g = 56px (herói, formulário) · m = 48px (seção, cartão) · p = 40px (dentro de cartão, linha)
// Robustez (11/11/2026): botões mais baixos, peso 600 e tracking justo; a bola
// cresce 4% e a seta atravessa ao passar o ponteiro; apertar afunda 2%.
// Vira <NuxtLink> com `to`, <a> com `href`, senão <button>.
// Microtransição: ao passar o ponteiro a seta sai pela direita e volta pela
// esquerda; ao apertar, a pílula afunda 2%.
const props = withDefaults(defineProps<{
  to?: string
  href?: string
  variante?: 'azul' | 'carvao' | 'creme' | 'contorno'
  tamanho?: 'g' | 'm' | 'p'
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
    <!-- `antes`: o que vem antes do rótulo dentro da pílula (os logos dos bancos na chamada da home) -->
    <slot name="antes" />
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
  display: inline-flex; align-items: center; justify-content: space-between; gap: 14px;
  min-height: 56px; padding: 0 6px 0 24px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nbs-bg); color: var(--nbs-fg);
  font-family: inherit; font-size: 17px; font-weight: var(--nu-w-medio); letter-spacing: -0.01em; line-height: 1.1; white-space: nowrap;
  text-decoration: none; cursor: pointer;
  transition: background var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-cor);
}
.nbs:hover { color: var(--nbs-fg); }
.nbs--m { min-height: 48px; padding-left: 20px; gap: 12px; font-size: 15.5px; }
.nbs--p { min-height: 40px; padding: 0 5px 0 16px; gap: 10px; font-size: 14.5px; }
.nbs--largo { display: flex; width: 100%; }
.nbs__bola {
  flex: none; width: 44px; height: 44px; border-radius: 50%; overflow: hidden;
  background: var(--nbs-bola); color: var(--nbs-seta);
  display: flex; align-items: center; justify-content: center;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida);
}
.nbs--m .nbs__bola { width: 36px; height: 36px; }
.nbs--p .nbs__bola { width: 30px; height: 30px; }
.nbs__seta { width: 19px; height: 19px; display: block; }
.nbs--m .nbs__seta { width: 17px; height: 17px; }
.nbs--p .nbs__seta { width: 15px; height: 15px; }

.nbs--azul:hover { background: var(--nu-blue-hover); }
.nbs--carvao { --nbs-bg: var(--nu-ink); --nbs-seta: var(--nu-ink); }
.nbs--carvao:hover { background: var(--nu-ink-hover); }
.nbs--creme { --nbs-bg: var(--nu-creme); --nbs-fg: var(--nu-ink); --nbs-bola: var(--nu-ink); --nbs-seta: var(--nu-creme); }
.nbs--creme:hover { background: var(--nu-white); }
.nbs--contorno { --nbs-bg: var(--nu-white); --nbs-fg: var(--nu-ink); --nbs-bola: var(--nu-ink); --nbs-seta: var(--nu-white); box-shadow: inset 0 0 0 1.5px var(--nu-ink); }
.nbs--contorno:hover { background: var(--nu-row-hover); }

.nbs:hover .nbs__bola { transform: scale(1.04); }
.nbs:hover .nbs__seta { animation: nu-seta .5s var(--nu-ease-troca); }
.nbs:active { transform: scale(.98); }
.nbs--off { --nbs-bg: var(--nu-cream-2); --nbs-fg: var(--nu-gray); --nbs-bola: var(--nu-white); --nbs-seta: var(--nu-sand); pointer-events: none; cursor: default; }
.nbs--wait { pointer-events: none; cursor: default; }
.nbs__pontos { display: flex; gap: 3px; }
.nbs__pontos i { width: 5px; height: 5px; border-radius: 50%; background: currentColor; animation: nu-ponto 1.2s infinite; }
.nbs__pontos i:nth-child(2) { animation-delay: .2s; }
.nbs__pontos i:nth-child(3) { animation-delay: .4s; }
@media (max-width: 420px) { .nbs { font-size: 16px; padding-left: 20px; } }
@media (prefers-reduced-motion: reduce) { .nbs__bola { transition: none; } .nbs:hover .nbs__bola { transform: none; } }
</style>
