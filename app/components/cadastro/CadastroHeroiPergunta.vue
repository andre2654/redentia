<script setup lang="ts">
// Herói da pergunta (canvas "Cadastro sem muro", 21/10/2026; o primeiro que o
// dono aprovou): a barra da home com o anel iridescente e a pergunta da
// pessoa. Na folha, a resposta ainda não existe: duas linhas de esqueleto e o
// selo "Pergunta guardada". No painel do login vai uma resposta de verdade.
withDefaults(defineProps<{
  pergunta: string
  resposta?: string | null
  painel?: boolean
}>(), { resposta: null, painel: false })
</script>

<template>
  <div class="chp" :class="{ 'chp--painel': painel }" aria-hidden="true">
    <div class="chp__barra">
      <div class="chp__brilho" />
      <div class="chp__anel">
        <div class="chp__fundo">
          <img src="/logo-azul.svg" alt="" width="18" height="18">
          <span class="chp__texto">{{ pergunta }}</span>
          <span class="chp__enviar"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg></span>
        </div>
      </div>
    </div>
    <p v-if="resposta" class="chp__resposta">{{ resposta }}</p>
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
.chp__brilho {
  position: absolute; inset: -6px; border-radius: var(--nu-r-pill); filter: blur(18px); opacity: .55;
  background: linear-gradient(90deg, var(--nu-blue), var(--nu-serie-5), var(--nu-serie-4), var(--nu-serie-2));
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
.chp__enviar { flex: none; width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; background: var(--nu-ink); color: var(--nu-white); }
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
@keyframes chp-gira { to { transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes chp-brilha { from { background-position: 200% 0; } to { background-position: -200% 0; } }
@keyframes chp-selo { 0%, 12% { opacity: 0; transform: translateY(6px); } 20%, 92% { opacity: 1; transform: none; } 100% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .chp__anel::before, .chp__esqueleto, .chp__selo { animation: none; }
}
</style>
