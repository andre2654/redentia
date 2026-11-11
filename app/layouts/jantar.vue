<script setup lang="ts">
/**
 * Landing do jantar. O header desta rota é só a marca e a fila.
 * O menu do produto não entra aqui.
 * O rodapé do site, com a privacidade, permanece.
 */
const fila = 'https://wa.me/5511951495841?text=Oi%20Andr%C3%A9%2C%20quero%20saber%20mais%20sobre%20o%20Redentia%20Wealth%20Intelligence%20Dinner'
// O jantar é da Redentia (escritórios): tema da Redentia, não o da Aportou.
useMarcaRedentia()
</script>

<template>
  <div class="jt-shell">
    <div class="jt-linhas" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="none">
        <path d="M900 0 C 1100 180, 1280 260, 1440 240" fill="none" stroke="#2f6aff" stroke-width="1" opacity="0.25" />
        <path d="M820 0 C 1080 240, 1260 420, 1440 520" fill="none" stroke="#2f6aff" stroke-width="1" opacity="0.18" />
        <path d="M0 700 C 220 620, 400 760, 700 820" fill="none" stroke="#2f6aff" stroke-width="1" opacity="0.12" />
      </svg>
    </div>
    <header class="jt-top">
      <NuxtLink to="/" class="jt-brand" aria-label="Redentia">
        <img src="/logo-azul.svg" alt="" width="22" height="22">
        <span>Redentia</span>
      </NuxtLink>
      <a class="jt-pill" :href="fila" target="_blank" rel="noopener noreferrer">
        Entrar na fila
        <span aria-hidden="true">→</span>
      </a>
    </header>
    <!-- Aviso de cookies no fluxo, abaixo do header, como no layout
         padrão. No jt-foot ele caía entre o fecho da página e o rodapé. -->
    <ConsentBanner />
    <main>
      <slot />
    </main>
    <div class="jt-foot">
      <NuFooter variante="business" />
    </div>
  </div>
</template>

<style scoped>
.jt-shell {
  min-height: 100vh;
  background: #0c1524;
  overflow-x: clip;
  display: flex;
  flex-direction: column;
  position: relative;
}
.jt-linhas {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.jt-linhas svg { width: 100%; height: 100%; opacity: 0.55; }
.jt-top, main, .jt-foot { position: relative; z-index: 1; }
.jt-top {
  position: sticky;
  top: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 40px 18px;
  background: #0c1524;
}
.jt-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #f5f1ea;
  font-family: var(--nu-font);
  font-size: 20px;
  font-weight: var(--nu-w-medio);
  letter-spacing: -0.03em;
}
.jt-brand img { display: block; width: 22px; height: 22px; }
.jt-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f5f1ea;
  color: #0c1524;
  border-radius: 999px;
  padding: 11px 20px;
  font-family: var(--nu-font);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;
}
.jt-pill:hover,
.jt-pill:focus-visible { background: #fff; color: #0c1524; }
.jt-pill:focus-visible { outline: 2px solid #2f6aff; outline-offset: 3px; }
main { flex: 1; }
@media (max-width: 720px) {
  .jt-top { padding: 16px 20px; }
}
</style>

<style>
body.pagina-jantar { background: #0c1524; }
</style>
