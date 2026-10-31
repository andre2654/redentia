<script setup lang="ts">
// O fecho do /assinar e do paywall (31/10/2026): a frase do topo de volta,
// agora com a resposta, e o último "Conectar carteira" antes do rodapé.
</script>

<template>
  <section class="afc" aria-labelledby="afc-titulo">
    <h2 id="afc-titulo" class="afc__titulo">Um banco não vê o outro. <br><span>A Redentia vê todos.</span></h2>
    <p class="afc__dek">Conecte em um minuto e veja a sua carteira inteira hoje.</p>
    <div class="afc__acao">
      <AssinaturaConectar origem="fecho" tom="creme" />
    </div>
  </section>
</template>

<style scoped>
.afc { background: var(--nu-blue); padding: clamp(72px, 9vw, 128px) clamp(22px, 5.5vw, 80px); text-align: center; }
.afc__titulo { margin: 0 auto; max-width: 18ch; color: var(--nu-white); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02; text-wrap: balance; }
.afc__titulo span { color: color-mix(in srgb, var(--nu-white) 72%, transparent); }
.afc__dek { margin: 20px auto 0; max-width: 46ch; color: color-mix(in srgb, var(--nu-white) 82%, transparent); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; }
.afc__acao { display: flex; justify-content: center; margin-top: clamp(28px, 3.6vw, 40px); }
@media (max-width: 760px) {
  .afc__titulo br { display: none; }
}
</style>
