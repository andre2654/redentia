<script setup lang="ts">
// Card contextual das páginas orgânicas (item 2 de conversão B2C).
// Um bloco só, no corpo, no mesmo creme do cct__bloco e na pílula azul do
// "Conectar carteira" da home. Não é sticky: a barra do chat já ocupa o pé
// em 390px, e uma segunda faixa fixa cobriria o botão.
export type DestinoCtaCarteira =
  | '/assinar?quiz=1&de=dividendos'
  | '/assinar?quiz=1&de=preco-teto'
  | '/assinar?quiz=1&de=quanto-rende'

defineProps<{
  titulo: string
  corpo: string
  to: DestinoCtaCarteira
}>()
</script>

<template>
  <div class="ccc">
    <div class="ccc__bloco">
      <div class="ccc__copy">
        <p class="ccc__titulo">{{ titulo }}</p>
        <p class="ccc__texto">{{ corpo }}</p>
      </div>
      <div class="ccc__acao">
        <NuBotaoSeta :to="to" variante="azul" tamanho="m">Conectar carteira</NuBotaoSeta>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ccc {
  min-width: 0;
  max-width: 100%;
  margin-top: 20px;
}
.ccc__bloco {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
  min-width: 0;
  max-width: 100%;
  background: var(--nu-cream);
  border-radius: 18px;
  padding: 16px 18px;
}
.ccc__copy { min-width: 0; }
.ccc__titulo,
.ccc__texto {
  margin: 0;
  overflow-wrap: anywhere;
}
.ccc__titulo {
  color: var(--nu-ink);
  font-size: var(--nu-fs-md);
  font-weight: var(--nu-w-forte);
  letter-spacing: -0.1px;
  line-height: 1.3;
}
.ccc__texto {
  margin-top: 6px;
  color: var(--nu-gray-2);
  font-size: var(--nu-fs-sm);
  font-weight: var(--nu-w-texto);
  line-height: 1.5;
}
.ccc__acao { min-width: 0; max-width: 100%; }
/* tamanho m já tem 48px; o mínimo fica aqui para o toque de 44px no 390 */
.ccc__acao :deep(.nbs) {
  max-width: 100%;
  min-height: 48px;
  scroll-margin-bottom: calc(108px + env(safe-area-inset-bottom));
}
@media (max-width: 759px) {
  .ccc__bloco { flex-direction: column; }
  .ccc__acao :deep(.nbs) { display: flex; width: 100%; }
  /* a barra do chat fica fixa no pé (~58px + 20px). O foco do botão sobe
     acima dela; o card em si rola com a página. */
  .ccc { scroll-margin-bottom: calc(108px + env(safe-area-inset-bottom)); }
}
@media (min-width: 760px) {
  .ccc__bloco {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: 28px;
    align-items: center;
    padding: 16px 18px 16px 22px;
  }
}
</style>
