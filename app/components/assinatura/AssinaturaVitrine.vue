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
// Robustez (11/11/2026): os tempos e as curvas são os dos tokens (o texto
// entra em cascata de 60ms em --nu-dur-entrada; o véu, em --nu-ease-cor) e a
// margem da coluna é a --nu-coluna.
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

// enquanto o leque gera os caminhos (mais devagar aqui: ~5 s), três frases,
// uma de cada vez, no lugar onde o título vai entrar
const FRASES = [
  'Testamos a sua carteira em 2.000 cenários.',
  'Altas, quedas e crises, mês a mês, por 5 anos.',
  'Do mais otimista ao mais pessimista.',
]
const frase = ref(-1)
const timers: ReturnType<typeof setTimeout>[] = []
function comecou(segundos: number) {
  const cada = (segundos * 1000) / FRASES.length
  FRASES.forEach((_, i) => timers.push(setTimeout(() => { frase.value = i }, i * cada + 150)))
}
watch(revelado, (r) => { if (r) frase.value = -1 })
onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <section class="avt" :class="{ 'avt--coreografia': props.modo === 'comecar', 'avt--js': comJs, 'avt--revelado': revelado }">
    <!-- o fundo: o leque inteiro, e o véu que deixa o texto ler por cima -->
    <div class="avt__lado">
      <AssinaturaExemplo cheio :nascer="4.2" :correr="0.9" @comecou="comecou" @pronto="revelado = true" />
    </div>
    <div class="avt__veu" aria-hidden="true" />
    <div class="avt__cols">
      <!-- as frases da espera: saem quando o texto entra -->
      <div v-if="modo === 'comecar'" class="avt__frases" aria-live="polite">
        <Transition name="avt-frase" mode="out-in">
          <p v-if="frase >= 0 && !revelado" :key="frase" class="avt__frase">{{ FRASES[frase] }}</p>
        </Transition>
      </div>
      <div class="avt__texto">
        <NuEyebrow v-if="eyebrow" class="avt__eyebrow" sobre="escuro">{{ eyebrow }}</NuEyebrow>
        <h1 class="avt__titulo"><slot name="titulo" /></h1>
        <p class="avt__dek"><slot name="dek" /></p>
        <AssinaturaOferta class="avt__oferta" :modo="modo" :cancelado="cancelado" escuro />
      </div>
    </div>
    <!-- o quiz do "Conectar carteira" vive no layout (abre da oferta e do chat) -->
  </section>
</template>

<style scoped>
.avt {
  position: relative; overflow: hidden; display: flex; align-items: center;
  min-height: clamp(600px, 82vh, 820px);
  background: var(--nu-navy);
  padding: clamp(48px, 7vw, 96px) var(--nu-coluna) clamp(56px, 7vw, 96px);
  animation: nu-surgir var(--nu-dur-lenta) var(--nu-ease-cor) both;
}
/* o leque de fundo, nas mesmas margens do texto */
.avt__lado { position: absolute; inset: clamp(36px, 4.4vw, 64px) clamp(22px, 5.5vw, 80px) clamp(28px, 3vw, 44px); z-index: 0; }
.avt__veu {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background: linear-gradient(90deg, var(--nu-navy) 0%, var(--nu-navy) 30%, color-mix(in srgb, var(--nu-navy) 72%, transparent) 46%, transparent 66%);
}
.avt__cols { position: relative; z-index: 1; width: 100%; display: grid; }
/* as frases e o texto no mesmo lugar: uma sai, o outro entra */
.avt__frases, .avt__texto { grid-area: 1 / 1; }
.avt__frases { align-self: start; max-width: 560px; pointer-events: none; }
.avt__frase {
  margin: 0; color: var(--nu-white); font-size: clamp(30px, 3.6vw, 48px); font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-display); line-height: 1.05; text-wrap: balance;
}
/* a frase que sai some rápido; a que entra sobe 14px e assenta */
.avt-frase-enter-active { transition: opacity var(--nu-dur-lenta) var(--nu-ease-saida), transform var(--nu-dur-lenta) var(--nu-ease-saida); }
.avt-frase-leave-active { transition: opacity var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--nu-ease-cor); }
.avt-frase-enter-from { opacity: 0; transform: translateY(14px); }
.avt-frase-leave-to { opacity: 0; transform: translateY(-8px); }
.avt__texto { max-width: 600px; }
.avt__eyebrow + .avt__titulo { margin-top: 16px; }
.avt__titulo { margin: 0; color: var(--nu-white); font-size: clamp(42px, 5vw, 72px); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 0.98; }
.avt__dek { margin: clamp(16px, 2vw, 24px) 0 0; max-width: 560px; color: var(--nu-on-dark); font-size: var(--nu-fs-dek); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.5; }
.avt__oferta { margin-top: clamp(32px, 3.6vw, 40px); }

/* a coreografia: o texto espera o leque; cada parte entra 60ms depois da outra */
.avt--coreografia .avt__texto > * { opacity: 0; transform: translateY(16px); animation: avt-entra var(--nu-dur-entrada) var(--nu-ease-saida) 6s forwards; }
.avt--coreografia.avt--js:not(.avt--revelado) .avt__texto > *, .avt--coreografia.avt--js:not(.avt--revelado) .avt__veu { animation: none; }
.avt--revelado .avt__texto > * { animation: avt-entra var(--nu-dur-entrada) var(--nu-ease-saida) forwards; }
.avt--revelado .avt__texto > :nth-child(2) { animation-delay: 60ms; }
.avt--revelado .avt__texto > :nth-child(3) { animation-delay: 120ms; }
.avt--revelado .avt__texto > :nth-child(4) { animation-delay: 180ms; }
.avt--revelado .avt__texto > :nth-child(5) { animation-delay: 240ms; }
@keyframes avt-entra { to { opacity: 1; transform: none; } }
/* o véu chega junto com o texto */
.avt--coreografia .avt__veu { opacity: 0; animation: avt-veu var(--nu-dur-entrada) var(--nu-ease-cor) 6s forwards; }
.avt--revelado .avt__veu { animation: avt-veu var(--nu-dur-entrada) var(--nu-ease-cor) forwards; }
@keyframes avt-veu { to { opacity: 1; } }
/* com o texto na tela, a legenda e o contador do leque saem (ficariam pela metade sob o véu) */
@media (min-width: 981px) {
  /* as frases da espera entram logo abaixo do título e do contador do leque, que ocupam o alto do fundo
     (antes a frase caía em cima do contador): a coluna estica e só o texto do título fica no meio.
     A conta é a do alto do leque: a margem dele + o título + o respiro + o contador. */
  .avt--coreografia .avt__cols { align-self: stretch; }
  .avt--coreografia .avt__texto { align-self: center; }
  .avt--coreografia .avt__frases {
    margin-top: calc(clamp(36px, 4.4vw, 64px) + clamp(26px, 2.8vw, 38px) * 1.1 + clamp(18px, 2.4vw, 28px) + 50px - clamp(48px, 7vw, 96px));
  }
  .avt__lado :deep(.aex__topo), .avt__lado :deep(.aec__conta) { transition: opacity var(--nu-dur-lenta) var(--nu-ease-cor); }
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
  .avt__frases { display: none; }
  .avt--coreografia .avt__texto > *, .avt--coreografia .avt__veu { opacity: 1; transform: none; animation: none; }
}
</style>
