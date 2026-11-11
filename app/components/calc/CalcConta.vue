<script setup lang="ts">
// O cartão da conta nas calculadoras na frase (21/10/2026). Uma peça branca
// logo abaixo do CalcTopo, com tudo na primeira tela:
//   frase     → a conta escrita como frase, com os campos que se mexem
//   resultado → o número grande, o selo e a linha que explica
//   acoes     → "Salvar esta conta" e "Compartilhar", sempre à vista
//   grafico   → a curva da conta
//   premissas → o resto da conta, fechado e já preenchido
// No computador as ações ficam embaixo do número; no celular descem para o pé
// do cartão e grudam no pé da tela enquanto a conta está na tela.
// O título da seção vai escondido (o slot "title" das páginas de cenário
// segue no DOM para o leitor de tela e o SEO).
// Aportou (11/11/2026): a seção é o creme da página (sem faixa branca); o
// cartão é o cartão branco dos quadros (raio 32, sombra do cartão branco) e
// os fios são de 1,5px.
defineProps<{
  sectionId?: string
  bg?: 'white' | 'cream'
}>()
</script>

<template>
  <section :id="sectionId" class="cco" :class="{ 'cco--branco': bg === 'white' }">
    <h2 v-if="$slots.title" class="cco__titulo-oculto"><slot name="title" /></h2>
    <div class="cco__cartao">
      <div class="cco__cabeca">
        <div class="cco__frase"><slot name="frase" /></div>
        <div v-if="$slots.topo" class="cco__topo"><slot name="topo" /></div>
      </div>
      <div class="cco__linha" aria-hidden="true" />
      <div class="cco__resultado" aria-live="polite"><slot name="resultado" /></div>
      <!-- sem o slot (a preço-teto não tem salvar nem compartilhar), a barra não existe:
           vazia, ela viraria uma tira grudada no pé da tela do celular -->
      <div v-if="$slots.acoes" class="cco__acoes"><slot name="acoes" /></div>
      <div class="cco__grafico"><slot name="grafico" /></div>
      <div v-if="$slots.premissas" class="cco__premissas"><slot name="premissas" /></div>
    </div>
    <div v-if="$slots.depois" class="cco__depois"><slot name="depois" /></div>
  </section>
</template>

<style scoped>
.cco {
  background: var(--nu-page);
  padding: clamp(18px, 2.4vw, 28px) max(clamp(12px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(56px, 7vw, 96px);
  animation: nu-fade .5s ease both;
}
.cco--branco { background: var(--nu-page); }
.cco__titulo-oculto {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden;
  clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
.cco__cartao {
  position: relative; display: grid; column-gap: 48px;
  grid-template-columns: minmax(0, 520px) minmax(0, 1fr);
  grid-template-areas:
    "frase frase"
    "linha linha"
    "resultado grafico"
    "acoes grafico"
    "premissas premissas";
  padding: clamp(22px, 3vw, 38px) clamp(20px, 3.8vw, 52px) clamp(18px, 2.2vw, 26px);
  background: var(--nu-white); border-radius: var(--nu-r-card-lg);
  box-shadow: var(--nu-shadow-quente), var(--nu-shadow-branco);
}
.cco--branco .cco__cartao { box-shadow: 0 0 0 1px var(--nu-line-2); }
.cco__cabeca { grid-area: frase; display: flex; align-items: flex-start; gap: 20px; }
.cco__frase { flex: 1; min-width: 0; }
.cco__topo { flex: none; }
.cco__linha { grid-area: linha; height: 1.5px; margin: 22px 0 20px; background: var(--nu-line-2); }
.cco__resultado { grid-area: resultado; min-width: 0; }
.cco__acoes { grid-area: acoes; align-self: end; margin-top: 18px; }
.cco__grafico { grid-area: grafico; min-width: 0; align-self: end; }
.cco__premissas { grid-area: premissas; margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--nu-line-2); }
.cco__depois { margin-top: clamp(20px, 2.6vw, 32px); }

@media (max-width: 900px) {
  .cco__cartao {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "frase" "linha" "resultado" "grafico" "premissas" "acoes";
    border-radius: 26px;
  }
  .cco__cabeca { flex-direction: column-reverse; gap: 12px; }
  .cco__topo { align-self: flex-end; }
  .cco__linha { margin: 18px 0; }
  .cco__grafico { margin-top: 14px; }
  /* no celular o salvar gruda no pé da tela enquanto a conta está à vista */
  .cco__acoes {
    position: sticky; bottom: 0; z-index: 2;
    margin: 18px calc(-1 * clamp(20px, 3.8vw, 52px)) calc(-1 * clamp(18px, 2.2vw, 26px));
    padding: 12px clamp(20px, 3.8vw, 52px) calc(14px + env(safe-area-inset-bottom));
    border-radius: 0 0 26px 26px;
    background: color-mix(in srgb, var(--nu-white) 94%, transparent);
    box-shadow: 0 -10px 30px -20px color-mix(in srgb, var(--nu-ink) 35%, transparent);
    -webkit-backdrop-filter: saturate(1.4) blur(12px); backdrop-filter: saturate(1.4) blur(12px);
  }
}
</style>
