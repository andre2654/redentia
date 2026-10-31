<script setup lang="ts">
// O topo da oferta (31/10/2026): a frase, o preço com o botão e, ao lado, o
// leque de exemplo. Uma implementação para o /assinar (H1 da página) e para o
// paywall da /carteira (mesma oferta, outra frase). O título vem pelo slot
// para aceitar a quebra de linha feita à mão.
withDefaults(defineProps<{
  eyebrow: string
  modo?: 'comecar' | 'pendente'
  cancelado?: boolean
}>(), { modo: 'comecar', cancelado: false })
</script>

<template>
  <section class="avt">
    <div class="avt__cols">
      <div class="avt__texto">
        <span class="avt__eyebrow" :class="{ 'avt__eyebrow--ambar': modo === 'pendente' }">
          <span class="avt__ponto" aria-hidden="true" />{{ eyebrow }}
        </span>
        <h1 class="avt__titulo"><slot name="titulo" /></h1>
        <p class="avt__dek"><slot name="dek" /></p>
        <AssinaturaOferta class="avt__oferta" :modo="modo" :cancelado="cancelado" />
      </div>
      <div class="avt__lado">
        <AssinaturaExemplo />
      </div>
    </div>
  </section>
</template>

<style scoped>
.avt {
  background: var(--nu-cream);
  padding: clamp(48px, 7vw, 96px) clamp(22px, 5.5vw, 80px) clamp(56px, 7vw, 96px);
  animation: nu-fade .5s ease both;
}
.avt__cols { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: clamp(32px, 5vw, 80px); align-items: center; }
.avt__eyebrow { display: inline-flex; align-items: center; gap: 9px; color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 800; }
.avt__ponto { width: 9px; height: 9px; border-radius: 50%; background: var(--nu-blue); box-shadow: 0 0 0 4px var(--nu-blue-tint); }
.avt__eyebrow--ambar { color: var(--nu-amber-text); }
.avt__eyebrow--ambar .avt__ponto { background: var(--nu-amber-fill); box-shadow: 0 0 0 4px var(--nu-amber-bg); }
.avt__titulo { margin: 18px 0 0; color: var(--nu-ink); font-size: clamp(42px, 5vw, 72px); font-weight: 800; letter-spacing: -0.045em; line-height: 0.98; }
.avt__dek { margin: clamp(18px, 2vw, 24px) 0 0; max-width: 560px; color: var(--nu-gray-2); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.55; }
.avt__oferta { margin-top: clamp(28px, 3.6vw, 40px); }

@media (max-width: 980px) {
  .avt__cols { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 760px) {
  /* no celular o <br> manual atrapalha o text-wrap: balance */
  .avt__titulo :deep(br) { display: none; }
}
</style>
