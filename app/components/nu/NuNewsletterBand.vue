<script setup lang="ts">
// Faixa azul full-bleed de captura de e-mail: headline 2 linhas à esquerda,
// input-pílula branco com botão azul embutido à direita. Valores exatos do
// design (Redentia Guias Nu.dc.html).
// Assina de verdade desde 21/10/2026 (antes o submit só levava ao /login): a
// inscrição é a mesma da preço teto (useNewsletter), e o formulário é o
// NuNewsletterForm, o mesmo do rodapé e do convite do canto. Anônimo manda o
// e-mail e confirma o código, que cria a conta; logado com e-mail confirmado
// assina com um clique, com o e-mail da conta no lugar do campo.
defineProps<{ subtitle: string; placeholder: string; cta: string }>()
</script>

<template>
  <section class="nnb">
    <div class="nnb__cols">
      <div class="nnb__left">
        <h2 class="nnb__title"><slot name="title" /></h2>
        <div class="nnb__sub">{{ subtitle }}</div>
      </div>
      <NuNewsletterForm class="nnb__right" :placeholder="placeholder" :cta="cta" origem="guias" />
    </div>
  </section>
</template>

<style scoped>
.nnb {
  background: var(--nu-blue);
  padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.nnb__cols { display: flex; gap: clamp(28px, 5vw, 72px); align-items: center; flex-wrap: wrap; }
.nnb__left { flex: 1.4 1 380px; min-width: min(300px, 100%); }
.nnb__title {
  margin: 0; color: var(--nu-cream-text);
  font-size: clamp(34px, 4.2vw, 56px); font-weight: 800;
  letter-spacing: -0.04em; line-height: 1.05;
}
.nnb__sub { color: var(--nu-cream-text-70); font-size: var(--nu-fs-lg); font-weight: 500; margin-top: 16px; }
.nnb__right { flex: 1 1 340px; min-width: min(300px, 100%); }
</style>
