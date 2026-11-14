<script setup lang="ts">
/**
 * NuSelo: o selo da Aportou (11/11/2026, robustez). Estado, variação,
 * contagem, categoria, data. Uma peça só no site inteiro (antes eram o
 * TeseSelo da tela de tese e etiquetas feitas à mão em cada tela).
 *
 *   <NuSelo tom="verde">+10% desde set/2025</NuSelo>
 *   <NuSelo tom="ambar" ponto>Pede atenção</NuSelo>
 *   <NuSelo tom="carvao" tamanho="p">PETR4</NuSelo>
 *
 * Props
 *   tom      neutro (padrão; creme, letra carvão) · azul ("fato", convicção) ·
 *            verde (alta, a favor, cumprido) · vermelho (queda, contra) ·
 *            ambar (atenção, pendente) · carvao (ticker, contagem) ·
 *            contorno (data, metadado: sem fundo, anel de 1px)
 *   tamanho  m (padrão): 28px de altura, 13,5px, raio 8 · p: 22px, 12px, raio 6
 *   ponto    a bolinha de 6px à esquerda, na cor do tom (estado: "Bolsa aberta")
 *   sobre    claro (padrão) · escuro: o mesmo tom na versão que lê sobre o carvão
 *   corrido  o selo mora DENTRO de uma frase: quebra a linha como texto e não
 *            empurra a entrelinha (os marcadores das revisões da tese)
 *   como     a tag (span por padrão; li, dd, time…)
 * Slot: o texto. Peso 600 (--nu-w-medio), números tabulares, sem quebra de
 * linha (exceto `corrido`). Não é clicável: selo que leva a algum lugar é
 * link ou botão em volta dele. A caixa tem especificidade zero: a classe de
 * quem usa vence (margem, altura), sem depender da ordem do CSS.
 */
withDefaults(defineProps<{
  tom?: 'neutro' | 'azul' | 'verde' | 'vermelho' | 'ambar' | 'carvao' | 'contorno'
  tamanho?: 'm' | 'p'
  ponto?: boolean
  sobre?: 'claro' | 'escuro'
  corrido?: boolean
  como?: string
}>(), { tom: 'neutro', tamanho: 'm', ponto: false, sobre: 'claro', corrido: false, como: 'span' })
</script>

<template>
  <component
    :is="como" class="nsl"
    :class="[`nsl--${tom}`, `nsl--${tamanho}`, { 'nsl--escuro': sobre === 'escuro', 'nsl--corrido': corrido }]"
  ><i v-if="ponto" class="nsl__ponto" aria-hidden="true" /><slot /></component>
</template>

<style scoped>
/* a caixa em :where (especificidade zero): a classe de quem usa vence em margem, altura e respiro */
:where(.nsl) {
  --nsl-fundo: var(--nu-cream-2); --nsl-tinta: var(--nu-ink); --nsl-anel: transparent; --nsl-ponto: var(--nu-gray);
  display: inline-flex; align-items: center; flex: none; gap: 6px; vertical-align: middle;
  height: 28px; padding: 0 10px; border-radius: var(--nu-r-tag);
  background: var(--nsl-fundo); color: var(--nsl-tinta); box-shadow: inset 0 0 0 1px var(--nsl-anel);
  font-size: 13.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); line-height: 1;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
/* o pequeno: 22px, raio 6 (o de fora menos o respiro), a letra pequena abre um pouco */
:where(.nsl--p) { height: 22px; padding: 0 7px; gap: 5px; border-radius: var(--nu-r-tag-p); font-size: 12px; letter-spacing: .04em; }
.nsl__ponto { flex: none; width: 6px; height: 6px; border-radius: 50%; background: var(--nsl-ponto); }

/* os tons (sobre claro) */
.nsl--azul { --nsl-fundo: var(--nu-blue-bg); --nsl-tinta: var(--nu-blue-text); --nsl-ponto: var(--nu-blue); }
.nsl--verde { --nsl-fundo: var(--nu-green-bg); --nsl-tinta: var(--nu-green-text); --nsl-ponto: var(--nu-green); }
.nsl--vermelho { --nsl-fundo: var(--nu-red-bg); --nsl-tinta: var(--nu-red-text); --nsl-ponto: var(--nu-red); }
.nsl--ambar { --nsl-fundo: var(--nu-amber-bg); --nsl-tinta: var(--nu-amber-text); --nsl-ponto: var(--nu-amber); }
/* o carvão é o do ticker: a letra branca abre um pouco */
.nsl--carvao { --nsl-fundo: var(--nu-ink); --nsl-tinta: var(--nu-white); --nsl-ponto: var(--nu-blue-on-dark); letter-spacing: .04em; }
.nsl--contorno { --nsl-fundo: transparent; --nsl-anel: var(--nu-line); }

/* sobre o carvão: o fundo vira um véu do tom e a letra, a versão clara dele */
.nsl--escuro.nsl--neutro { --nsl-fundo: var(--nu-dark-chip); --nsl-tinta: var(--nu-on-dark); --nsl-anel: var(--nu-dark-chip-line); --nsl-ponto: var(--nu-on-dark-2); }
.nsl--escuro.nsl--contorno { --nsl-tinta: var(--nu-on-dark); --nsl-anel: var(--nu-dark-chip-line); --nsl-ponto: var(--nu-on-dark-2); }
.nsl--escuro.nsl--azul { --nsl-fundo: color-mix(in srgb, var(--nu-blue-on-dark) 18%, transparent); --nsl-tinta: var(--nu-blue-soft); --nsl-ponto: var(--nu-blue-soft); }
.nsl--escuro.nsl--verde { --nsl-fundo: var(--nu-green-soft-16); --nsl-tinta: var(--nu-green-soft); --nsl-ponto: var(--nu-green-soft); }
.nsl--escuro.nsl--vermelho { --nsl-fundo: var(--nu-red-soft-16); --nsl-tinta: var(--nu-red-soft); --nsl-ponto: var(--nu-red-soft); }
.nsl--escuro.nsl--ambar { --nsl-fundo: color-mix(in srgb, var(--nu-amber-soft) 16%, transparent); --nsl-tinta: var(--nu-amber-soft); --nsl-ponto: var(--nu-amber-soft); }
/* carvão sobre carvão some: inverte (creme com a letra carvão) */
.nsl--escuro.nsl--carvao { --nsl-fundo: var(--nu-creme); --nsl-tinta: var(--nu-ink); --nsl-ponto: var(--nu-blue); }

/* no meio da frase: quebra como texto, o fundo acompanha cada linha, a entrelinha fica a da frase */
:where(.nsl--corrido) {
  display: inline; height: auto; padding: 2px 7px; line-height: 1.2; white-space: normal;
  -webkit-box-decoration-break: clone; box-decoration-break: clone;
}
.nsl--corrido .nsl__ponto { display: inline-block; margin-right: 5px; vertical-align: .1em; }
</style>
