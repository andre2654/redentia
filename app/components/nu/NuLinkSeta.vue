<script setup lang="ts">
/**
 * NuLinkSeta: a ação secundária da Aportou (11/11/2026, robustez). "Ver todos →",
 * "Ler tudo →", "Abrir a carteira →". A ação principal de cada dobra é o
 * NuBotaoSeta; o resto é este link: texto em 600 e a seta de 16px.
 *
 *   <NuLinkSeta to="/teses">Ver todas as teses</NuLinkSeta>
 *   <NuLinkSeta href="https://www.b3.com.br" externo tom="tinta">Fonte: B3</NuLinkSeta>
 *   <NuLinkSeta @click="lerTudo = true">Ler tudo</NuLinkSeta>     (sem to/href vira <button>)
 *
 * Props
 *   to / href  NuxtLink (rota do site) ou <a> (endereço); sem os dois, <button type="button">
 *   tom        azul (padrão, --nu-blue-text) · tinta (carvão) · claro (branco, sobre o carvão)
 *   externo    abre em outra aba (rel="noopener"), seta diagonal e o aviso para o leitor de tela
 *   disabled   só no <button>: apagado e sem clique
 *   seta       frente (padrão) · voltar (a seta vem antes e aponta para trás:
 *              "Voltar para novembro", "Trocar o número") · nenhuma (só o
 *              sublinhado: "Tentar de novo", "Usar e-mail", "Agora não")
 * Slots: o padrão é o rótulo, que diz o que acontece ("Abrir a carteira", não
 * "Ver"); `antes` é um ícone na frente do rótulo (o corte do "Perguntar à
 * IA"), alinhado ao meio da linha.
 *
 * Movimento: no hover a seta anda 3px (--nu-dur-media --nu-ease-saida) e o
 * sublinhado aparece (1,5px, a 4px da letra); apertado, o link esmaece.
 * O alvo de toque tem 44px de altura sem mexer no fluxo: o padding de cima e
 * de baixo é devolvido por uma margem negativa do mesmo tamanho. O anel de foco
 * (3px) abraça o texto e a seta, não a área de toque. O tamanho da letra vem de
 * quem usa (herda).
 */
const props = withDefaults(defineProps<{
  to?: string
  href?: string
  tom?: 'azul' | 'tinta' | 'claro'
  externo?: boolean
  disabled?: boolean
  seta?: 'frente' | 'voltar' | 'nenhuma'
}>(), { tom: 'azul', externo: false, disabled: false, seta: 'frente' })

const comSeta = computed(() => props.externo || props.seta !== 'nenhuma')
const paraTras = computed(() => !props.externo && props.seta === 'voltar')

const tag = computed(() => (props.to ? resolveComponent('NuxtLink') : props.href ? 'a' : 'button'))
const attrs = computed(() => {
  const aba = props.externo ? { target: '_blank', rel: 'noopener' } : {}
  if (props.to) return { to: props.to, ...aba }
  if (props.href) return { href: props.href, ...aba }
  return { type: 'button', disabled: props.disabled || undefined }
})
</script>

<template>
  <component :is="tag" v-bind="attrs" class="nls" :class="[`nls--${tom}`, { 'nls--fora': externo, 'nls--volta': paraTras }]">
    <span v-if="$slots.antes" class="nls__antes" aria-hidden="true"><slot name="antes" /></span>
    <svg v-if="paraTras" class="nls__seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      <path d="M20 12H5M10.5 6.5 5 12l5.5 5.5" />
    </svg>
    <span class="nls__txt"><slot /></span>
    <svg v-if="comSeta && !paraTras" class="nls__seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      <path v-if="externo" d="M7 17 17 7M8.5 7H17v8.5" />
      <path v-else d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" />
    </svg>
    <span v-if="externo" class="nu-sr">(abre em outra aba)</span>
  </component>
</template>

<style scoped>
/* a letra e a margem em :where: a classe de quem usa (font-size, margin-top)
   vence SEMPRE, sem depender da ordem em que o CSS chega (no build, a ordem
   dos pedaços muda). A margem negativa devolve a folga do alvo de 44px. */
:where(.nls) { font: inherit; margin: calc(var(--nls-folga) * -1) 0; }
.nls {
  --nls-tinta: var(--nu-blue-text);
  /* a folga que leva o alvo a 44px: sai do padding e volta pela margem */
  --nls-folga: max(0px, calc((44px - 1lh) / 2));
  position: relative; display: inline-flex; align-items: center; gap: 6px; vertical-align: baseline;
  padding: var(--nls-folga) 0;
  border: 0; background: none; color: var(--nls-tinta);
  font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); line-height: 1.35;
  text-align: left; text-decoration: none; cursor: pointer; -webkit-tap-highlight-color: transparent;
  transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor);
}
.nls:hover { color: var(--nls-tinta); }
.nls--tinta { --nls-tinta: var(--nu-ink); }
.nls--claro { --nls-tinta: var(--nu-white); }
.nls__txt {
  text-decoration-line: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px;
  text-decoration-color: transparent; transition: text-decoration-color var(--nu-dur-media) var(--nu-ease-cor);
}
.nls__seta { flex: none; display: block; width: 16px; height: 16px; transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.nls:hover .nls__txt { text-decoration-color: currentColor; }
.nls:hover .nls__seta { transform: translateX(3px); }
.nls--fora:hover .nls__seta { transform: translate(2px, -2px); }
.nls--volta:hover .nls__seta { transform: translateX(-3px); }
/* o ícone de antes (o corte, uma marca): no meio da linha, sem herdar o display de quem é */
.nls__antes { flex: none; display: inline-flex; align-items: center; }
.nls__antes > :deep(*) { display: block; }
.nls:active { opacity: .72; }
/* o anel de foco abraça o texto e a seta (a área de toque é maior que o desenho) */
.nls:focus-visible { outline: none; }
.nls:focus-visible::after {
  content: ''; position: absolute; inset: var(--nls-folga) -6px; border-radius: 6px; pointer-events: none;
  outline: 3px solid var(--nu-blue); outline-offset: 2px;
}
.nls--claro:focus-visible::after { outline-color: var(--nu-blue-on-dark); }
.nls:disabled { opacity: .4; cursor: not-allowed; }
.nls:disabled .nls__txt { text-decoration-color: transparent; }
.nls:disabled .nls__seta { transform: none; }
</style>
