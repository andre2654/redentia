<template>
  <NuxtLayout name="landing" title="Checkout cancelado">
    <div class="billing-status">
      <div class="quiet-card billing-status__card">
        <div class="billing-status__icon" aria-hidden="true">
          <UIcon name="i-lucide-info" class="size-7" :style="{ color: 'var(--text-body, var(--brand-text-muted))' }" />
        </div>
        <span class="eyebrow">Sem pressa</span>
        <h1 class="billing-status__title">Checkout cancelado</h1>
        <p class="billing-status__sub">
          Nada foi cobrado. Quando quiser, escolha um plano de novo.
        </p>
        <div class="billing-status__actions">
          <NuxtLink to="/pricing" class="quiet-btn-primary">
            Voltar pra planos
          </NuxtLink>
          <NuxtLink to="/" class="quiet-btn-ghost">
            Ir pra home
          </NuxtLink>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: 'Checkout cancelado',
  description: 'Você cancelou o checkout',
  path: '/billing/canceled',
  robots: 'noindex,nofollow',
})
</script>

<style scoped>
.billing-status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
}
.billing-status__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  max-width: 440px;
  padding: 32px;
}
.billing-status__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--text-body, var(--brand-text-muted)) 12%, transparent);
  margin-bottom: 4px;
}
.billing-status__title {
  font-family: var(--brand-font);
  font-size: 28px;
  font-weight: 300;
  letter-spacing: -0.02em;
  color: var(--text-heading, var(--brand-text));
  margin: 0;
}
.billing-status__sub {
  font-size: 14.5px;
  line-height: 1.55;
  color: var(--text-body, var(--brand-text-muted));
  margin: 0;
  max-width: 380px;
}
.billing-status__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  width: 100%;
}
@media (min-width: 480px) {
  .billing-status__actions {
    flex-direction: row;
    justify-content: center;
  }
}
</style>
