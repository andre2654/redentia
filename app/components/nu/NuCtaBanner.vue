<script setup lang="ts">
// Banner-link de conversão: o painel azul da marca em tamanho de cartão.
// APORTOU (11/11/2026): o gradiente cobalto, o corte gigante branco a 8% no
// canto e a seta no círculo (a mesma do NuBotaoSeta). Ao passar o ponteiro o
// cartão sobe 2px, ganha sombra e a seta sai e volta. Título, subtítulo e
// destino iguais.
defineProps<{ title: string; subtitle: string; to: string }>()
</script>

<template>
  <NuxtLink :to="to" class="ncb">
    <MarcaCorte class="ncb__corte" :largura="230" cor="var(--nu-white)" />
    <span class="ncb__main">
      <span class="ncb__title">{{ title }}</span>
      <span class="ncb__sub">{{ subtitle }}</span>
    </span>
    <span class="ncb__circle" aria-hidden="true">
      <svg class="ncb__seta" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15" /><path d="M13.5 6.5 19 12l-5.5 5.5" /></svg>
    </span>
  </NuxtLink>
</template>

<style scoped>
.ncb {
  position: relative; overflow: hidden;
  display: flex; align-items: center; gap: 20px;
  background: var(--nu-grad-cobalto); border-radius: var(--nu-r-card-lg);
  padding: clamp(24px, 3vw, 40px);
  transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s cubic-bezier(.2, .8, .2, 1);
}
/* o seletor dobrado vence a regra de link de texto corrido da página (o guia
   sublinha todo <a> do artigo, e o banner é um <a>) */
a.ncb.ncb { text-decoration: none; }
.ncb:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.ncb:active { transform: scale(.99); }
.ncb__corte { position: absolute; right: 12%; top: 50%; transform: translateY(-38%); opacity: 0.08; pointer-events: none; }
.ncb__main { position: relative; flex: 1; min-width: 0; }
.ncb__title {
  display: block; color: var(--nu-white); font-size: clamp(22px, 2.4vw, 30px);
  font-weight: 800; letter-spacing: -0.025em; line-height: 1.1;
}
.ncb__sub { display: block; color: var(--nu-blue-on-blue); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.45; margin-top: 10px; }
.ncb__circle {
  position: relative; width: 52px; height: 52px; flex-shrink: 0; border-radius: 50%; overflow: hidden;
  background: var(--nu-white); color: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
}
.ncb__seta { display: block; }
.ncb:hover .ncb__seta { animation: nu-seta .45s cubic-bezier(.4, 0, .2, 1); }
</style>
