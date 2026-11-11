<script setup lang="ts">
// Herói da pergunta (canvas "Cadastro sem muro", 21/10/2026; o primeiro que o
// dono aprovou): a barra da home com o anel iridescente e a pergunta da
// pessoa. A resposta ainda não existe: duas linhas de esqueleto e o selo
// "Pergunta guardada".
defineProps<{ pergunta: string }>()
</script>

<template>
  <div class="chp" aria-hidden="true">
    <div class="chp__barra">
      <div class="chp__brilho" />
      <div class="chp__anel">
        <div class="chp__fundo">
          <MarcaCorte :largura="22" />
          <span class="chp__texto">{{ pergunta }}</span>
          <span class="chp__enviar"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg></span>
        </div>
      </div>
    </div>
    <div class="chp__baixo">
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
.chp__barra { position: relative; height: 56px; }
/* o brilho atrás da barra respira, como o do herói da home */
.chp__brilho {
  position: absolute; inset: -6px; border-radius: var(--nu-r-pill); filter: blur(18px); opacity: .55;
  background: var(--nu-anel);
  animation: chp-respira 5s ease-in-out infinite;
}
.chp__anel { position: absolute; inset: 0; border-radius: var(--nu-r-pill); overflow: hidden; }
/* o anel do input mágico da Aportou: cobalto, céu, sálvia e areia, girando devagar */
.chp__anel::before {
  content: ''; position: absolute; inset: 0;
  background: var(--nu-anel); background-size: 200% 100%;
  animation: nu-anel 7s linear infinite;
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
  flex: none; display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: var(--nu-r-tag);
  background: var(--nu-green-soft-16); color: var(--nu-green-soft); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio);
  animation: chp-selo 7s var(--nu-ease-saida) infinite;
}
@keyframes chp-respira { 50% { opacity: .3; } }
@keyframes chp-brilha { from { background-position: 200% 0; } to { background-position: -200% 0; } }
@keyframes chp-selo { 0%, 12% { opacity: 0; transform: translateY(6px); } 20%, 92% { opacity: 1; transform: none; } 100% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .chp__anel::before, .chp__brilho, .chp__esqueleto, .chp__selo { animation: none; }
}
</style>
