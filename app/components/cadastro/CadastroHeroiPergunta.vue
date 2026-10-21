<script setup lang="ts">
// Herói da pergunta (canvas "Cadastro sem muro", 21/10/2026; o primeiro que o
// dono aprovou): a barra da home com o anel iridescente e a pergunta da
// pessoa. Na folha, a resposta ainda não existe: duas linhas de esqueleto e o
// selo "Pergunta guardada". No painel do login vai uma resposta de verdade,
// e desde 21/10 ela anda como no herói da home ("deixe igual no hero"): a
// pergunta se escreve, o botão pulsa enquanto a Redentia pensa e a resposta
// sai palavra por palavra (usePerguntaDemo). Roda uma vez por cena; com
// movimento reduzido, já aparece respondida.
const props = withDefaults(defineProps<{
  pergunta: string
  resposta?: string | null
  painel?: boolean
}>(), { resposta: null, painel: false })

const animada = computed(() => props.painel && !!props.resposta)
const pares = computed(() => [{ q: props.pergunta, a: props.resposta ?? '' }])
const { digitado, fase, palavras, rodar, mostrar } = usePerguntaDemo(pares, { repetir: false, espera: 500, vazia: animada.value })

onMounted(() => {
  if (!animada.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) mostrar()
  else void rodar()
})
</script>

<template>
  <div class="chp" :class="[{ 'chp--painel': painel }, animada ? `chp--${fase}` : '']" aria-hidden="true">
    <div class="chp__barra">
      <div class="chp__brilho" />
      <div class="chp__anel">
        <div class="chp__fundo">
          <img src="/logo-azul.svg" alt="" width="18" height="18">
          <span class="chp__texto">{{ animada ? digitado : pergunta }}<i v-if="animada" class="chp__cursor" /></span>
          <span class="chp__enviar"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg></span>
        </div>
      </div>
    </div>
    <div v-if="animada" class="chp__gerada">
      <span v-if="fase === 'pensando'" class="chp__pensando"><i /><i /><i /></span>
      <p v-else-if="fase === 'respondendo' || fase === 'lendo'" class="chp__resposta">
        <!-- o espaço fica fora da palavra: é ele que deixa a frase quebrar linha -->
        <template v-for="(w, k) in palavras" :key="k"><span class="chp__palavra" :style="{ '--k': k }">{{ w }}</span>{{ ' ' }}</template>
      </p>
    </div>
    <p v-else-if="resposta" class="chp__resposta">{{ resposta }}</p>
    <div v-else class="chp__baixo">
      <div class="chp__esqueletos">
        <span class="chp__esqueleto" />
        <span class="chp__esqueleto" style="width: 78%" />
      </div>
      <span class="chp__selo"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>Pergunta guardada</span>
    </div>
  </div>
</template>

<style scoped>
.chp { padding: 40px 32px 26px; }
.chp--painel { padding: 0; }
.chp__barra { position: relative; height: 56px; }
/* o brilho atrás da barra respira, como o do herói da home */
.chp__brilho {
  position: absolute; inset: -6px; border-radius: var(--nu-r-pill); filter: blur(18px); opacity: .55;
  background: linear-gradient(90deg, var(--nu-blue), var(--nu-serie-5), var(--nu-serie-4), var(--nu-serie-2));
  animation: chp-respira 5s ease-in-out infinite;
}
.chp__anel { position: absolute; inset: 0; border-radius: var(--nu-r-pill); overflow: hidden; }
.chp__anel::before {
  content: ''; position: absolute; left: 50%; top: 50%; width: 140%; aspect-ratio: 1; transform: translate(-50%, -50%);
  background: conic-gradient(from 0deg, var(--nu-blue), var(--nu-serie-5), var(--nu-serie-4), var(--nu-serie-2), var(--nu-serie-6), var(--nu-blue));
  animation: chp-gira 7s linear infinite;
}
.chp__fundo {
  position: absolute; inset: 2.5px; display: flex; align-items: center; gap: 12px; padding: 0 8px 0 18px;
  border-radius: inherit; background: var(--nu-white);
}
.chp__texto { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 500; }
.chp__cursor { display: inline-block; width: 2px; height: 1.15em; margin-left: 2px; vertical-align: -0.18em; background: var(--nu-blue); animation: chp-pisca 1s steps(1) infinite; }
.chp--respondendo .chp__cursor, .chp--lendo .chp__cursor { opacity: 0; animation: none; }
.chp__enviar { flex: none; width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; background: var(--nu-ink); color: var(--nu-white); }
.chp--pensando .chp__enviar { background: var(--nu-blue); animation: chp-pulso .9s ease-in-out infinite; }
.chp__baixo { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 18px; }
.chp__esqueletos { display: flex; flex-direction: column; gap: 8px; width: 58%; }
.chp__esqueleto {
  height: 10px; border-radius: var(--nu-r-pill);
  background: linear-gradient(90deg, var(--nu-cream-text-14) 0%, var(--nu-cream-text-30) 50%, var(--nu-cream-text-14) 100%);
  background-size: 200% 100%; animation: chp-brilha 1.8s linear infinite;
}
.chp__selo {
  flex: none; display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: var(--nu-r-pill);
  background: rgba(143, 240, 181, 0.16); color: var(--nu-green-soft); font-size: var(--nu-fs-dense); font-weight: 700;
  animation: chp-selo 7s cubic-bezier(.2, .8, .2, 1) infinite;
}
.chp__resposta { margin: 26px 2px 0; color: var(--nu-cream-text); font-size: var(--nu-fs-xl); font-weight: 700; letter-spacing: -0.02em; line-height: 1.4; }
/* a resposta gerada: a altura de três linhas fica guardada desde o começo, para
   a barra não subir quando o texto chega; os pontos enquanto pensa e as
   palavras saindo do desfoque, como no herói da home */
.chp__gerada { min-height: calc(26px + 3 * 1.4 * var(--nu-fs-xl)); }
.chp__pensando { display: inline-flex; gap: 6px; margin: 26px 2px 0; padding-top: 10px; }
.chp__pensando i { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-blue-soft); animation: chp-ponto 1s ease-in-out infinite; }
.chp__pensando i:nth-child(2) { animation-delay: .15s; }
.chp__pensando i:nth-child(3) { animation-delay: .3s; }
.chp__palavra { display: inline-block; animation: chp-palavra .5s cubic-bezier(.22, 1, .36, 1) backwards; animation-delay: calc(var(--k) * 55ms); }
@keyframes chp-gira { to { transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes chp-respira { 50% { opacity: .3; } }
@keyframes chp-pisca { 50% { opacity: 0; } }
@keyframes chp-pulso { 50% { transform: scale(.92); } }
@keyframes chp-ponto { 50% { transform: translateY(-4px); opacity: .5; } }
@keyframes chp-palavra { from { opacity: 0; filter: blur(8px); transform: translateY(6px); } }
@keyframes chp-brilha { from { background-position: 200% 0; } to { background-position: -200% 0; } }
@keyframes chp-selo { 0%, 12% { opacity: 0; transform: translateY(6px); } 20%, 92% { opacity: 1; transform: none; } 100% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .chp__anel::before, .chp__brilho, .chp__cursor, .chp__palavra, .chp__pensando i, .chp__esqueleto, .chp__selo { animation: none; }
}
</style>
