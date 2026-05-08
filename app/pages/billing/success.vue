<!--
  /billing/success — usuario voltou do Stripe Checkout depois de pagar
  ou iniciar trial. Subscription pode ainda nao ter chegado pelo webhook
  no momento exato do redirect, entao a page nao depende disso pra
  renderizar; foca em onboardar com proximos passos diretos.
-->
<template>
  <NuxtLayout title="Assinatura ativa">
    <div class="success-page">
      <!-- Atmospheric amber radial -->
      <div
        class="success-glow"
        aria-hidden="true"
        :style="{
          background: `radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in srgb, ${brand.colors.primary} 24%, transparent), transparent 65%)`,
        }"
      />

      <section class="success-hero">
        <div class="success-check" aria-hidden="true">
          <UIcon name="i-lucide-check" class="size-8" :style="{ color: 'var(--brand-primary)' }" />
        </div>

        <span class="eyebrow">
          <span class="success-dot" aria-hidden="true" />
          Bem-vindo
        </span>

        <h1 class="success-headline">
          Tudo liberado<span class="success-dots">…</span>
          <span class="success-italic-block">vamos analisar sua carteira.</span>
        </h1>

        <p class="success-lead">
          <strong>Pagamento confirmado.</strong> Em 2 minutos você vê o motivo
          de cada ativo da sua carteira. Sem rodeio.
        </p>

        <div class="success-actions">
          <NuxtLink to="/wallet" class="quiet-btn-primary success-cta--big">
            Ir pra carteira
            <UIcon name="i-lucide-arrow-right" class="size-4" aria-hidden="true" />
          </NuxtLink>
          <NuxtLink to="/help" class="quiet-btn-ghost">
            Abrir o chat
          </NuxtLink>
        </div>
      </section>

      <!-- Próximos passos -->
      <section class="success-steps">
        <span class="eyebrow eyebrow--center">Por onde começar</span>
        <h2 class="success-steps__title">
          3 passos pra extrair valor <span class="success-italic-inline">no primeiro dia</span>.
        </h2>

        <ol class="success-steps__list">
          <li class="success-steps__item">
            <span class="success-steps__num" :style="{ color: 'var(--brand-primary)', borderColor: 'color-mix(in srgb, var(--brand-primary) 35%, transparent)' }">01</span>
            <div class="success-steps__copy">
              <h3>Conecte sua carteira</h3>
              <p>
                Importe via Open Finance (XP, BTG, Itaú, Nubank e outras) ou cole sua
                <NuxtLink to="/wallet" class="success-steps__inlink">posição B3 manualmente</NuxtLink>.
                Suas credenciais nunca passam pela Redentia.
              </p>
            </div>
          </li>
          <li class="success-steps__item">
            <span class="success-steps__num" :style="{ color: 'var(--brand-primary)', borderColor: 'color-mix(in srgb, var(--brand-primary) 35%, transparent)' }">02</span>
            <div class="success-steps__copy">
              <h3>Rode o seu primeiro Raio-X</h3>
              <p>
                A IA cruza fundamentos, notícia e contexto macro. Entrega
                <strong>9 dimensões</strong>, riscos e oportunidades acionáveis em ~2 minutos.
              </p>
            </div>
          </li>
          <li class="success-steps__item">
            <span class="success-steps__num" :style="{ color: 'var(--brand-primary)', borderColor: 'color-mix(in srgb, var(--brand-primary) 35%, transparent)' }">03</span>
            <div class="success-steps__copy">
              <h3>Pergunte o que quiser no chat</h3>
              <p>
                "Vale rebalancear?", "Por que PETR4 caiu?", "Qual FII pra dividendo mensal?".
                Resposta com fonte e justificativa.
              </p>
            </div>
          </li>
        </ol>
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
  title: 'Assinatura ativa',
  description: 'Pagamento confirmado',
  path: '/billing/success',
  robots: 'noindex,nofollow',
})

// Refresh entitlements no mount pra refletir nova sub. Pode haver
// pequena latencia ate o webhook do Stripe chegar no Backend, mas
// pelo menos garante que da proxima vez que o user navegar, o
// snapshot esta atualizado.
onMounted(async () => {
  const ent = useEntitlements()
  await ent.refresh(true)
})
</script>

<style scoped>
.success-page {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  gap: 80px;
  padding: 64px 24px 96px;
  width: 100%;
  overflow: hidden;
}

.success-glow {
  position: absolute;
  inset: -120px -10% auto -10%;
  height: 560px;
  filter: blur(60px);
  z-index: -1;
  pointer-events: none;
  opacity: 0.85;
}

/* ========= HERO ========= */
.success-hero {
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;
  align-items: center;
}

.success-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 32%, transparent);
  margin-bottom: 8px;
  box-shadow: 0 12px 32px -10px color-mix(in srgb, var(--brand-primary) 50%, transparent);
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
.success-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 25%, transparent);
  animation: success-pulse 2.4s ease-in-out infinite;
}
@keyframes success-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
}

.success-headline {
  font-family: var(--brand-font);
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 300;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--text-heading, var(--brand-text));
  margin: 6px 0 0;
  text-wrap: balance;
}
.success-dots {
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.success-italic-block {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
  display: block;
  margin-top: 4px;
}
.success-italic-inline {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
}

.success-lead {
  font-size: 16px;
  line-height: 1.6;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
  margin: 0;
  max-width: 560px;
}
.success-lead strong {
  color: var(--brand-text);
  font-weight: 600;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
  width: 100%;
  max-width: 440px;
}
@media (min-width: 480px) {
  .success-actions {
    flex-direction: row;
    justify-content: center;
  }
}

.success-cta--big {
  padding: 16px 28px;
  font-size: 15px;
  border-radius: 14px;
  box-shadow: 0 14px 32px -12px color-mix(in srgb, var(--brand-primary) 65%, transparent);
}
.success-cta--big:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px -12px color-mix(in srgb, var(--brand-primary) 75%, transparent);
}

/* ========= STEPS ========= */
.success-steps {
  max-width: 880px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  text-align: center;
  align-items: center;
}

.success-steps__title {
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

.success-steps__list {
  list-style: none;
  margin: 24px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

.success-steps__item {
  display: flex;
  gap: 18px;
  padding: 22px 24px;
  border-radius: 14px;
  border: 1px solid var(--border-subtle, var(--brand-border));
  background: var(--bg-elevated, var(--brand-surface));
  text-align: left;
  transition: border-color 200ms;
}
.success-steps__item:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
}

.success-steps__num {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  font-size: 28px;
  letter-spacing: -0.02em;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid;
}

.success-steps__copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.success-steps__copy h3 {
  font-family: var(--brand-font);
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.012em;
  color: var(--text-heading, var(--brand-text));
  margin: 0;
}

.success-steps__copy p {
  font-size: 13.5px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
  margin: 0;
}
.success-steps__copy strong {
  color: var(--brand-text);
  font-weight: 600;
}

.success-steps__inlink {
  color: var(--brand-primary);
  text-decoration: none;
  font-weight: 500;
}
.success-steps__inlink:hover {
  text-decoration: underline;
}
</style>
