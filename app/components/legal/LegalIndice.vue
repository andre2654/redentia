<script setup lang="ts">
// O sumário do celular e do tablet. O índice lateral (NuTocSidebar) some abaixo
// de 1080px; aqui o MESMO sumário (mesmas âncoras, mesmos rótulos) abre no topo
// da leitura, fechado, num cartão creme com o corte. Acima de 1080px não
// aparece. Usado nos documentos legais, na metodologia e nos guias.
// ROBUSTEZ (11/11/2026): o abre-e-fecha é o NuAcordeao da base (o "+" do NuMais
// que gira, a altura que anima em --nu-dur-lenta --nu-ease-troca); a lista
// segue no HTML do servidor, fechada com altura 0 e inert. Itens com fio de
// 1px, a seta que anda no toque e a resposta de apertado.
withDefaults(defineProps<{
  items: { label: string; targetId: string }[]
  rotulo?: string
}>(), { rotulo: 'Nesta página' })
const aberto = ref(false)
</script>

<template>
  <div class="lgi">
    <NuAcordeao v-model:aberto="aberto">
      <template #titulo><span class="lgi__rotulo"><MarcaCorte :largura="18" />{{ rotulo }}</span></template>
      <ol class="lgi__lista">
        <li v-for="it in items" :key="it.targetId">
          <a :href="`#${it.targetId}`">
            <span>{{ it.label }}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg>
          </a>
        </li>
      </ol>
    </NuAcordeao>
  </div>
</template>

<style scoped>
.lgi { display: none; }
@media (max-width: 1080px) {
  .lgi {
    display: block; margin-bottom: clamp(32px, 6vw, 44px); padding: 0 16px 0 20px; border-radius: var(--nu-r-panel);
    background: var(--nu-card); box-shadow: var(--nu-shadow-quente);
  }
  .lgi__rotulo {
    display: inline-flex; align-items: center; gap: 9px; color: inherit;
    font-size: var(--nu-fs-marca); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-caixa); text-transform: uppercase;
  }
  .lgi__lista { list-style: none; margin: -8px 0 0; padding: 0; }
  .lgi__lista li { border-top: 1px solid var(--nu-line-2); }
  /* .lgi na frente: o sumário mora dentro do artigo, cujo link de texto (cobalto, sublinhado) não vale aqui */
  .lgi .lgi__lista a {
    display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 48px; padding: 10px 0;
    color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.35;
    text-decoration: none; -webkit-tap-highlight-color: transparent;
    transition: color var(--nu-dur-media) var(--nu-ease-cor), opacity var(--nu-dur-rapida) var(--nu-ease-cor);
  }
  .lgi .lgi__lista a svg { flex: none; width: 16px; height: 16px; color: var(--nu-gray); transition: transform var(--nu-dur-media) var(--nu-ease-saida), color var(--nu-dur-media) var(--nu-ease-cor); }
  .lgi .lgi__lista a:hover { color: var(--nu-blue-text); }
  .lgi .lgi__lista a:hover svg { color: var(--nu-blue-text); transform: translateX(3px); }
  .lgi .lgi__lista a:active { opacity: .7; }
  .lgi .lgi__lista a:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: -3px; border-radius: 6px; }
}
@media (prefers-reduced-motion: reduce) { .lgi .lgi__lista a, .lgi .lgi__lista a svg { transition: none; } }
</style>
