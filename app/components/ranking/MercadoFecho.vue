<script setup lang="ts">
// O fecho das páginas de mercado (Aportou, 2ª rodada, 11/11/2026): o painel
// azul da marca (gradiente cobalto, raio 40) com o corte gigante de fundo, o
// título em 800, a chamada na pílula creme com a seta e a segunda chamada em
// link sublinhado. É o mesmo fecho da home e da tese (TeseFecho), no lugar da
// faixa azul de ponta a ponta com foto. REGRA DO DONO: o corte sai sempre do
// canto de cima à esquerda; quem posiciona é a classe global .nu-corte-fundo.
interface Chamada { label: string; to: string }
withDefaults(defineProps<{
  eyebrow?: string
  primary: Chamada
  secondary?: Chamada
  /** o fundo da seção em volta do painel: o creme da página ou a faixa quente */
  fundo?: 'pagina' | 'faixa'
}>(), { eyebrow: undefined, secondary: undefined, fundo: 'pagina' })
</script>

<template>
  <section class="mfe" :class="{ 'mfe--faixa': fundo === 'faixa' }">
    <div class="mfe__painel">
      <MarcaCorte class="mfe__corte nu-corte-fundo" :largura="520" cor="var(--nu-white)" />
      <div class="mfe__texto">
        <NuEyebrow v-if="eyebrow" como="p" sobre="azul">{{ eyebrow }}</NuEyebrow>
        <h2 class="mfe__h2"><slot name="title" /></h2>
        <p v-if="$slots.subtitle" class="mfe__p"><slot name="subtitle" /></p>
      </div>
      <div class="mfe__acao">
        <NuBotaoSeta :to="primary.to" variante="creme" tamanho="g">{{ primary.label }}</NuBotaoSeta>
        <NuxtLink v-if="secondary" :to="secondary.to" class="mfe__link">{{ secondary.label }}</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mfe {
  background: var(--nu-page);
  padding: clamp(48px, 5.4vw, 80px) max(clamp(20px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(64px, 7vw, 100px);
}
.mfe--faixa { background: var(--nu-band); }
.mfe__painel {
  position: relative; overflow: hidden; isolation: isolate; border-radius: var(--nu-r-secao); background: var(--nu-grad-cobalto); color: var(--nu-white);
  padding: clamp(28px, 4vw, 56px); display: flex; align-items: center; justify-content: space-between; gap: 28px 48px; flex-wrap: wrap;
  animation: nu-fade .5s ease both;
}
/* o corte gigante, branco a 8%, no canto de cima à esquerda (posição e tamanho: .nu-corte-fundo) */
.mfe__corte { --corte-l: 520px; z-index: -1; opacity: .08; }
.mfe__texto { flex: 1 1 440px; min-width: min(300px, 100%); }
.mfe__h2 { margin: 0; font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.03em; line-height: 1.02; text-wrap: balance; max-width: 20ch; }
.nu-eyebrow + .mfe__h2 { margin-top: 16px; }
.mfe__p { margin: 14px 0 0; max-width: 48ch; color: var(--nu-blue-on-blue); font-size: clamp(17px, 1.5vw, 20px); font-weight: 500; line-height: 1.45; }
.mfe__acao { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
.mfe__link {
  display: inline-flex; align-items: center; min-height: 44px; padding: 0 4px; color: var(--nu-white); font-size: var(--nu-fs-md); font-weight: 700;
  text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1.5px; text-decoration-color: var(--nu-white-35);
  transition: text-decoration-color .2s ease, transform .2s ease;
}
.mfe__link:hover { color: var(--nu-white); text-decoration-color: currentColor; transform: translateX(3px); }
@media (max-width: 560px) {
  .mfe__painel { border-radius: var(--nu-r-card-lg); }
  .mfe__acao, .mfe__acao :deep(.nbs) { width: 100%; }
  .mfe__acao :deep(.nbs) { display: flex; }
}
@media (prefers-reduced-motion: reduce) { .mfe__painel { animation: none; } .mfe__link { transition: none; } .mfe__link:hover { transform: none; } }
</style>
