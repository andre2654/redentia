<script setup lang="ts">
/**
 * NuMais: o "+" no círculo dos acordeões da Aportou (11/11/2026, robustez).
 * O "+" gira 45° (vira "×") quando abre, em --nu-dur-lenta --nu-ease-troca.
 * É só o desenho (aria-hidden): quem conta "aberto/fechado" ao leitor de tela
 * é o botão em volta (aria-expanded) ou o <details>.
 *
 *   <NuMais :aberto="aberto" />                  num botão que abre e fecha
 *   <summary>Fontes <NuMais :tamanho="28" /></summary>   gira sozinho com o <details>
 *
 * Props
 *   aberto   o "+" girado
 *   tamanho  28 · 32 (padrão) · 36 (o do FAQ), em px
 *   tom      carvao (padrão: círculo carvão, "+" branco) · claro (círculo
 *            creme, "+" carvão: para o fundo carvão) · quieto (só o anel de
 *            1px e o "+" carvão: para lista densa, onde 12 círculos cheios
 *            pesariam; sob o ponteiro o anel e o "+" vão ao cobalto)
 * Sozinho, sem prop: dentro de um <summary> de <details open> ele gira; dentro
 * de um button/summary/a sob o ponteiro, o círculo escurece; apertado, afunda 8%.
 * O traço tem ~1,75px na tela em qualquer tamanho (a espessura compensa a escala).
 */
withDefaults(defineProps<{ aberto?: boolean; tamanho?: 28 | 32 | 36; tom?: 'carvao' | 'claro' | 'quieto' }>(), {
  aberto: false, tamanho: 32, tom: 'carvao',
})
</script>

<template>
  <span class="nmx" :class="[`nmx--${tamanho}`, { 'nmx--claro': tom === 'claro', 'nmx--quieto': tom === 'quieto', 'nmx--aberto': aberto }]" aria-hidden="true">
    <svg class="nmx__x" viewBox="0 0 24 24" focusable="false"><path d="M12 5v14M5 12h14" /></svg>
  </span>
</template>

<style scoped>
/* a caixa em :where: a classe de quem usa vence (posição na grade, margem) */
:where(.nmx) {
  /* o "+" ocupa 44% do círculo; a espessura (em unidades do desenho de 24) leva o traço a ~1,75px na tela */
  --nmx-d: 32px; --nmx-espessura: 3; --nmx-fundo: var(--nu-ink); --nmx-fundo-hover: var(--nu-ink-hover); --nmx-traco: var(--nu-white);
  flex: none; display: inline-grid; place-items: center; width: var(--nmx-d); height: var(--nmx-d); border-radius: 50%;
  background: var(--nmx-fundo); color: var(--nmx-traco);
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.nmx--28 { --nmx-d: 28px; --nmx-espessura: 3.4; }
.nmx--36 { --nmx-d: 36px; --nmx-espessura: 2.65; }
.nmx--claro { --nmx-fundo: var(--nu-creme); --nmx-fundo-hover: var(--nu-white); --nmx-traco: var(--nu-ink); }
.nmx--quieto {
  --nmx-fundo: transparent; --nmx-fundo-hover: transparent; --nmx-traco: var(--nu-ink);
  box-shadow: inset 0 0 0 1px var(--nu-line);
  transition: color var(--nu-dur-media) var(--nu-ease-cor), box-shadow var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.nmx__x {
  display: block; width: 44%; height: 44%; overflow: visible;
  fill: none; stroke: currentColor; stroke-width: var(--nmx-espessura); stroke-linecap: round;
  transition: transform var(--nu-dur-lenta) var(--nu-ease-troca);
}
/* gira: pela prop, ou sozinho no <summary> de um <details> aberto */
.nmx--aberto .nmx__x, details[open] > summary .nmx__x { transform: rotate(45deg); }
/* o cabeçalho em volta sob o ponteiro e apertado */
:is(button, summary, a):hover .nmx { background: var(--nmx-fundo-hover); }
:is(button, summary, a):active .nmx { transform: scale(.92); }
/* o quieto, sob o ponteiro: o anel e o "+" vão ao cobalto, com o rótulo */
:is(button, summary, a):hover .nmx--quieto { color: var(--nu-blue-text); box-shadow: inset 0 0 0 1px var(--nu-blue); }
</style>
