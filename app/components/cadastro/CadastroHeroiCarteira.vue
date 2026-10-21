<script setup lang="ts">
// Herói do "Conectar minha carteira" (banda da home, 21/10/2026): a mesma
// miniatura do /carteira que se monta na banda azul (CarteiraMontagem), aqui
// sobre o navy e em laço de 9 s, como os outros heróis da folha. Depois do
// código, para montada com "Conta criada": a conexão em si acontece no
// /carteira, no app do banco.
withDefaults(defineProps<{
  pronta?: boolean
}>(), { pronta: false })
</script>

<template>
  <div class="chct" aria-hidden="true">
    <CarteiraMontagem tom="escuro" modo="laco" :parada="pronta" />
    <span v-if="pronta" class="chct__selo"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>Conta criada</span>
  </div>
</template>

<style scoped>
/* o X da folha fica no canto de cima: o topo da carteira deixa o lugar dele */
.chct { position: relative; padding: 22px 72px 18px 28px; color: var(--nu-cream-text); }
.chct__selo {
  position: absolute; right: 28px; bottom: 18px; display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px;
  border-radius: var(--nu-r-pill); background: rgba(143, 240, 181, 0.16); color: var(--nu-green-soft);
  font-size: var(--nu-fs-dense); font-weight: 700;
}
@media (max-width: 640px) {
  .chct { padding: 20px 64px 16px 22px; }
}
</style>
