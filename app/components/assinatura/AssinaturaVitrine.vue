<script setup lang="ts">
// O topo da oferta (31/10/2026): a frase, o preço com o botão e, ao lado, o
// leque de exemplo, tudo no mesmo azul-marinho (o cartão do leque perdeu a
// caixa e o azul dele passou a ser o do topo inteiro, pedido do dono no
// mesmo dia). Uma implementação para o /assinar (H1 da página) e para o
// paywall da /carteira (mesma oferta, outra frase). O título vem pelo slot
// para aceitar a quebra de linha feita à mão.
//
// A coreografia (pedido do dono, 31/10/2026): primeiro só o leque gerando
// os 2.000 caminhos; quando ele termina, entram o título, a frase, o botão
// e os selos, um depois do outro. O texto está no HTML desde o servidor (só
// escondido): sem JavaScript ele aparece sozinho em 4,5 s, e com movimento
// reduzido nem chega a esconder. No celular o leque sobe para o topo.
// Cobrança pendente não espera nada.
const props = withDefaults(defineProps<{
  eyebrow: string
  modo?: 'comecar' | 'pendente'
  cancelado?: boolean
}>(), { modo: 'comecar', cancelado: false })
const revelado = ref(false)
</script>

<template>
  <section class="avt" :class="{ 'avt--coreografia': props.modo === 'comecar', 'avt--revelado': revelado }">
    <div class="avt__cols">
      <div class="avt__texto">
        <span v-if="eyebrow" class="avt__eyebrow" :class="{ 'avt__eyebrow--ambar': modo === 'pendente' }">
          <span class="avt__ponto" aria-hidden="true" />{{ eyebrow }}
        </span>
        <h1 class="avt__titulo"><slot name="titulo" /></h1>
        <p class="avt__dek"><slot name="dek" /></p>
        <AssinaturaOferta class="avt__oferta" :modo="modo" :cancelado="cancelado" escuro />
      </div>
      <div class="avt__lado">
        <AssinaturaExemplo @pronto="revelado = true" />
      </div>
    </div>
    <!-- o quiz do "Conectar carteira" (abre da oferta) -->
    <AssinaturaQuiz />
  </section>
</template>

<style scoped>
.avt {
  background: var(--nu-navy);
  padding: clamp(48px, 7vw, 96px) clamp(22px, 5.5vw, 80px) clamp(56px, 7vw, 96px);
  animation: nu-fade .5s ease both;
}
.avt__cols { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: clamp(32px, 5vw, 80px); align-items: center; }
.avt__eyebrow { display: inline-flex; align-items: center; gap: 9px; color: var(--nu-blue-soft); font-size: var(--nu-fs-md); font-weight: 800; }
.avt__ponto { width: 9px; height: 9px; border-radius: 50%; background: var(--nu-blue-soft); box-shadow: 0 0 0 4px color-mix(in srgb, var(--nu-blue-soft) 22%, transparent); }
.avt__eyebrow--ambar { color: var(--nu-amber-fill); }
.avt__eyebrow--ambar .avt__ponto { background: var(--nu-amber-fill); box-shadow: 0 0 0 4px color-mix(in srgb, var(--nu-amber-fill) 22%, transparent); }
.avt__eyebrow + .avt__titulo { margin-top: 18px; }
.avt__titulo { margin: 0; color: var(--nu-cream-text); font-size: clamp(42px, 5vw, 72px); font-weight: 800; letter-spacing: -0.045em; line-height: 0.98; }
.avt__dek { margin: clamp(18px, 2vw, 24px) 0 0; max-width: 560px; color: var(--nu-cream-text-70); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.55; }
.avt__oferta { margin-top: clamp(28px, 3.6vw, 40px); }

/* a coreografia: o texto espera o leque; cada parte entra um pouco depois da outra */
.avt--coreografia .avt__texto > * { opacity: 0; transform: translateY(18px); animation: avt-entra .6s cubic-bezier(.22, 1, .36, 1) 4.5s forwards; }
.avt--revelado .avt__texto > * { animation: avt-entra .6s cubic-bezier(.22, 1, .36, 1) forwards; }
.avt--revelado .avt__texto > :nth-child(2) { animation-delay: .1s; }
.avt--revelado .avt__texto > :nth-child(3) { animation-delay: .2s; }
.avt--revelado .avt__texto > :nth-child(4) { animation-delay: .32s; }
@keyframes avt-entra { to { opacity: 1; transform: none; } }

@media (max-width: 980px) {
  .avt__cols { grid-template-columns: minmax(0, 1fr); }
  .avt--coreografia .avt__lado { order: -1; }
}
@media (max-width: 760px) {
  /* no celular o <br> manual atrapalha o text-wrap: balance */
  .avt__titulo :deep(br) { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .avt--coreografia .avt__texto > * { opacity: 1; transform: none; animation: none; }
}
</style>
