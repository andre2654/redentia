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
// escondido): sem JavaScript ele aparece sozinho em 6 s, e com movimento
// reduzido nem chega a esconder. No celular o leque sobe para o topo.
// Logo depois o dono pediu o gráfico ocupando a seção inteira: no computador
// o leque é o fundo do topo, de ponta a ponta, e quando o texto entra um véu
// do próprio azul cobre o começo das linhas (o leque segue vivo à direita);
// no celular ele ocupa a parte de cima da tela.
// Cobrança pendente não espera nada.
const props = withDefaults(defineProps<{
  eyebrow: string
  modo?: 'comecar' | 'pendente'
  cancelado?: boolean
}>(), { modo: 'comecar', cancelado: false })
const revelado = ref(false)
// com JavaScript, o texto espera o leque de verdade (a salvaguarda de tempo é
// só para quem não tem JavaScript: ela contaria do HTML, antes de o leque começar)
const comJs = ref(false)
onMounted(() => { comJs.value = true })
</script>

<template>
  <section class="avt" :class="{ 'avt--coreografia': props.modo === 'comecar', 'avt--js': comJs, 'avt--revelado': revelado }">
    <!-- o fundo: o leque inteiro, e o véu que deixa o texto ler por cima -->
    <div class="avt__lado">
      <AssinaturaExemplo cheio @pronto="revelado = true" />
    </div>
    <div class="avt__veu" aria-hidden="true" />
    <div class="avt__cols">
      <div class="avt__texto">
        <span v-if="eyebrow" class="avt__eyebrow" :class="{ 'avt__eyebrow--ambar': modo === 'pendente' }">
          <span class="avt__ponto" aria-hidden="true" />{{ eyebrow }}
        </span>
        <h1 class="avt__titulo"><slot name="titulo" /></h1>
        <p class="avt__dek"><slot name="dek" /></p>
        <AssinaturaOferta class="avt__oferta" :modo="modo" :cancelado="cancelado" escuro />
      </div>
    </div>
    <!-- o quiz do "Conectar carteira" (abre da oferta) -->
    <AssinaturaQuiz />
  </section>
</template>

<style scoped>
.avt {
  position: relative; overflow: hidden; display: flex; align-items: center;
  min-height: clamp(600px, 82vh, 820px);
  background: var(--nu-navy);
  padding: clamp(48px, 7vw, 96px) clamp(22px, 5.5vw, 80px) clamp(56px, 7vw, 96px);
  animation: nu-fade .5s ease both;
}
/* o leque de fundo, nas mesmas margens do texto */
.avt__lado { position: absolute; inset: clamp(36px, 4.4vw, 64px) clamp(22px, 5.5vw, 80px) clamp(28px, 3vw, 44px); z-index: 0; }
.avt__veu {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background: linear-gradient(90deg, var(--nu-navy) 0%, var(--nu-navy) 30%, color-mix(in srgb, var(--nu-navy) 72%, transparent) 46%, transparent 66%);
}
.avt__cols { position: relative; z-index: 1; width: 100%; }
.avt__texto { max-width: 600px; }
.avt__eyebrow { display: inline-flex; align-items: center; gap: 9px; color: var(--nu-blue-soft); font-size: var(--nu-fs-md); font-weight: 800; }
.avt__ponto { width: 9px; height: 9px; border-radius: 50%; background: var(--nu-blue-soft); box-shadow: 0 0 0 4px color-mix(in srgb, var(--nu-blue-soft) 22%, transparent); }
.avt__eyebrow--ambar { color: var(--nu-amber-fill); }
.avt__eyebrow--ambar .avt__ponto { background: var(--nu-amber-fill); box-shadow: 0 0 0 4px color-mix(in srgb, var(--nu-amber-fill) 22%, transparent); }
.avt__eyebrow + .avt__titulo { margin-top: 18px; }
.avt__titulo { margin: 0; color: var(--nu-cream-text); font-size: clamp(42px, 5vw, 72px); font-weight: 800; letter-spacing: -0.045em; line-height: 0.98; }
.avt__dek { margin: clamp(18px, 2vw, 24px) 0 0; max-width: 560px; color: var(--nu-cream-text-70); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.55; }
.avt__oferta { margin-top: clamp(28px, 3.6vw, 40px); }

/* a coreografia: o texto espera o leque; cada parte entra um pouco depois da outra */
.avt--coreografia .avt__texto > * { opacity: 0; transform: translateY(18px); animation: avt-entra .6s cubic-bezier(.22, 1, .36, 1) 6s forwards; }
.avt--coreografia.avt--js:not(.avt--revelado) .avt__texto > *, .avt--coreografia.avt--js:not(.avt--revelado) .avt__veu { animation: none; }
.avt--revelado .avt__texto > * { animation: avt-entra .6s cubic-bezier(.22, 1, .36, 1) forwards; }
.avt--revelado .avt__texto > :nth-child(2) { animation-delay: .1s; }
.avt--revelado .avt__texto > :nth-child(3) { animation-delay: .2s; }
.avt--revelado .avt__texto > :nth-child(4) { animation-delay: .32s; }
@keyframes avt-entra { to { opacity: 1; transform: none; } }
/* o véu chega junto com o texto */
.avt--coreografia .avt__veu { opacity: 0; animation: avt-veu .8s ease 6s forwards; }
.avt--revelado .avt__veu { animation: avt-veu .8s ease forwards; }
@keyframes avt-veu { to { opacity: 1; } }
/* com o texto na tela, a legenda e o contador do leque saem (ficariam pela metade sob o véu) */
@media (min-width: 981px) {
  .avt__lado :deep(.aex__topo), .avt__lado :deep(.aec__conta) { transition: opacity .5s ease; }
  .avt--revelado .avt__lado :deep(.aex__topo), .avt--revelado .avt__lado :deep(.aec__conta) { opacity: 0; }
  .avt:not(.avt--coreografia) .avt__lado :deep(.aex__topo), .avt:not(.avt--coreografia) .avt__lado :deep(.aec__conta) { opacity: 0; }
}

@media (max-width: 980px) {
  /* no celular: o leque em cima, de borda a borda do conteúdo, e o texto embaixo */
  .avt { flex-direction: column; align-items: stretch; min-height: 0; }
  .avt__lado { position: relative; inset: auto; order: -1; height: clamp(360px, 58vh, 520px); }
  .avt__veu { display: none; }
  .avt__cols { margin-top: 28px; }
}
@media (max-width: 760px) {
  /* no celular o <br> manual atrapalha o text-wrap: balance */
  .avt__titulo :deep(br) { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .avt--coreografia .avt__texto > *, .avt--coreografia .avt__veu { opacity: 1; transform: none; animation: none; }
}
</style>
