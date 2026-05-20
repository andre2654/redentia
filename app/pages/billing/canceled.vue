<!--
  /billing/canceled — usuário cancelou o checkout no Stripe e voltou pro
  site. Não foi cobrado. Page de re-engagement: hero atmosférico no estilo
  /raio-x e /pricing, lembra o que ele perdeu, oferece o trial Pro de novo.
-->
<template>
  <NuxtLayout title="Checkout cancelado">
    <div class="cancel-page">
      <!-- Atmospheric amber radial -->
      <div
        class="cancel-glow"
        aria-hidden="true"
        :style="{
          background: `radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in srgb, var(--brand-primary) 20%, transparent), transparent 65%)`,
        }"
      />

      <section class="cancel-hero">
        <span class="eyebrow">
          <span class="cancel-dot" aria-hidden="true" />
          Sem pressa
        </span>

        <h1 class="cancel-headline">
          Você cancelou<span class="cancel-dots">…</span>
          <span class="cancel-headline__italic">tudo bem.</span>
        </h1>

        <p class="cancel-lead">
          <strong>Nada foi cobrado.</strong> Sua conta segue como estava antes.
          Quando estiver pronto, é um clique pra continuar.
        </p>

        <div class="cancel-actions">
          <NuxtLink to="/pricing" class="quiet-btn-primary cancel-cta--big">
            Voltar pra planos
            <UIcon name="i-lucide-arrow-right" class="size-4" aria-hidden="true" />
          </NuxtLink>
          <NuxtLink to="/" class="quiet-btn-ghost">
            Ir pra home
          </NuxtLink>
        </div>
      </section>

      <!-- Lembrete do que tem nos planos -->
      <section class="cancel-recap">
        <span class="eyebrow eyebrow--center">Dentro do Pro</span>
        <h2 class="cancel-recap__title">
          O que você teria <span class="cancel-italic-inline">com o Pro</span>.
        </h2>

        <ul class="cancel-recap__grid">
          <li class="cancel-recap__item">
            <div class="cancel-recap__icon" :style="{ color: 'var(--brand-primary)' }">
              <UIcon name="i-lucide-radar" class="size-5" />
            </div>
            <h3>Raio-X completo</h3>
            <p>9 dimensões da sua carteira cruzando fundamentos, notícia e macro.</p>
          </li>
          <li class="cancel-recap__item">
            <div class="cancel-recap__icon" :style="{ color: 'var(--brand-primary)' }">
              <UIcon name="i-lucide-bell-ring" class="size-5" />
            </div>
            <h3>Alertas em tempo real</h3>
            <p>Avisamos quando algo na sua watchlist mexe, antes de você abrir o app.</p>
          </li>
          <li class="cancel-recap__item">
            <div class="cancel-recap__icon" :style="{ color: 'var(--brand-primary)' }">
              <UIcon name="i-lucide-message-circle" class="size-5" />
            </div>
            <h3>Análise profunda com IA</h3>
            <p>Pergunta o que quiser sobre sua carteira. Resposta com fonte e justificativa.</p>
          </li>
          <li class="cancel-recap__item">
            <div class="cancel-recap__icon" :style="{ color: 'var(--brand-primary)' }">
              <UIcon name="i-lucide-shield-check" class="size-5" />
            </div>
            <h3>7 dias grátis, sem multa</h3>
            <p>Cancela em 1 click. Reembolso total em 7 dias pelo CDC.</p>
          </li>
        </ul>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const brand = useBrand()

usePageSeo({
  title: 'Checkout cancelado',
  description: 'Você cancelou o checkout',
  path: '/billing/canceled',
  robots: 'noindex,nofollow',
})
</script>

<style scoped>
.cancel-page {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  gap: 80px;
  padding: 64px 24px 96px;
  width: 100%;
  overflow: hidden;
}

.cancel-glow {
  position: absolute;
  inset: -120px -10% auto -10%;
  height: 560px;
  filter: blur(60px);
  z-index: -1;
  pointer-events: none;
  opacity: 0.85;
}

/* ========= HERO ========= */
.cancel-hero {
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  text-align: center;
  align-items: center;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.eyebrow--center {
  justify-content: center;
}
.cancel-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 25%, transparent);
  animation: cancel-pulse 2.4s ease-in-out infinite;
}
@keyframes cancel-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
}

.cancel-headline {
  font-family: var(--brand-font);
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 300;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--text-heading, var(--brand-text));
  margin: 6px 0 0;
  text-wrap: balance;
}
.cancel-dots {
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.cancel-headline__italic {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
  display: block;
  margin-top: 4px;
}

/* Variante inline pra usar no meio de uma frase (sem quebra de linha
   antes/depois). O `display: block` do .cancel-headline__italic faz
   sentido no hero (headline em cascata), mas joga o ponto final pra
   linha de baixo quando usado inline em outra frase. */
.cancel-italic-inline {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
}

.cancel-lead {
  font-size: 16px;
  line-height: 1.6;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
  margin: 0;
  max-width: 540px;
}
.cancel-lead strong {
  color: var(--brand-text);
  font-weight: 600;
}

.cancel-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
  width: 100%;
  max-width: 440px;
}
@media (min-width: 480px) {
  .cancel-actions {
    flex-direction: row;
    justify-content: center;
  }
}

.cancel-cta--big {
  padding: 16px 28px;
  font-size: 15px;
  border-radius: 14px;
  box-shadow: 0 14px 32px -12px color-mix(in srgb, var(--brand-primary) 65%, transparent);
}
.cancel-cta--big:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px -12px color-mix(in srgb, var(--brand-primary) 75%, transparent);
}

/* ========= RECAP ========= */
.cancel-recap {
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  text-align: center;
  align-items: center;
}

.cancel-recap__title {
  font-family: var(--brand-font);
  font-size: clamp(24px, 3vw, 36px);
  font-weight: 300;
  line-height: 1.15;
  letter-spacing: -0.022em;
  color: var(--text-heading, var(--brand-text));
  margin: 0;
  max-width: 680px;
  text-wrap: balance;
}

.cancel-recap__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  list-style: none;
  margin: 24px 0 0;
  padding: 0;
  width: 100%;
}
@media (min-width: 720px) {
  .cancel-recap__grid {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
}

.cancel-recap__item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 22px 22px;
  border-radius: 14px;
  border: 1px solid var(--border-subtle, var(--brand-border));
  background: var(--bg-elevated, var(--brand-surface));
  text-align: left;
  transition: border-color 200ms;
}
.cancel-recap__item:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
}

.cancel-recap__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
}

.cancel-recap__item h3 {
  font-family: var(--brand-font);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.012em;
  color: var(--text-heading, var(--brand-text));
  margin: 4px 0 0;
}

.cancel-recap__item p {
  font-size: 13.5px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  margin: 0;
}
</style>
