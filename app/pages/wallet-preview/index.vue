<!-- Hub do modelo de wallet escolhido (V7 Magazine Pro) -->
<template>
  <NuxtLayout name="default" title="Preview de Wallet">
    <section class="wp-hub">
      <header class="wp-hub-header">
        <p class="wp-eyebrow">Proposta · modelo aprovado</p>
        <h1>Design do <em>ecossistema</em> wallet</h1>
        <p class="wp-lead">
          Modelo Magazine Pro pra 2 telas conectadas (Wallet → Resultado Swing + Day Trade).
          Iteramos os detalhes aqui antes de aplicar nas rotas reais.
        </p>
      </header>

      <div class="wp-cards">
        <NuxtLink v-for="v in variants" :key="v.to" :to="v.to" class="wp-card">
          <div class="wp-tag">{{ v.tag }}</div>
          <h2>{{ v.title }}</h2>
          <p class="wp-sub">{{ v.sub }}</p>
          <ul class="wp-traits">
            <li v-for="t in v.traits" :key="t">
              <UIcon name="i-lucide-check" class="size-3.5" />
              {{ t }}
            </li>
          </ul>
          <span class="wp-cta">Ver renderizado <UIcon name="i-lucide-arrow-right" class="size-3.5" /></span>
        </NuxtLink>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
const variants = [
  {
    to: '/wallet-preview/v8',
    tag: 'V8',
    title: 'Calc style — Editorial Split',
    sub: 'Mesmo layout das calculadoras V5: status strip, atmospheric blur, split 2x2 com bordas internas (hero | result / form | chart), italic serif accents. Patrimônio como "result mega", composição na área "form", curva vs IBOV no "chart".',
    traits: ['CalcUiShell reusado', 'Split 2x2 com bordas internas', 'Atmospheric blur', 'Italic serif accents', 'Patrimônio como mega result', 'Banks/posições/Raio-X full-bleed abaixo'],
  },
  {
    to: '/wallet-preview/v8/resultado',
    tag: 'V8 · Resultado',
    title: 'Resultado Swing + Day Trade',
    sub: 'Mode toggle (Swing/Day), win/loss donut, curva acumulada com drawdown, stats em grid editorial 4x2, calendar heatmap 6m / week heatmap intraday, trades colapsáveis por período, insights IA, CTA full-bleed amarelado.',
    traits: ['Mode toggle Swing/Day', 'Donut win/loss', 'Curva acumulada + drawdown', 'Stats grid editorial', 'Calendar / Week heatmap', 'Trades colapsáveis por mês', 'Insights IA editoriais', 'CTA amarelado'],
  },
] as const
</script>

<style scoped>
.wp-hub {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px 64px;
}
@media (min-width: 640px) { .wp-hub { padding: 48px 32px 96px; } }

.wp-hub-header { margin-bottom: 32px; max-width: 720px; }
.wp-eyebrow {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--brand-primary);
  margin: 0 0 12px;
}
.wp-hub-header h1 {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--text-heading);
  margin: 0 0 12px;
}
.wp-hub-header h1 em {
  font-family: 'Instrument Serif', Georgia, serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
}
.wp-lead { font-size: 16px; line-height: 1.55; color: var(--text-body); margin: 0; }

.wp-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 768px) { .wp-cards { grid-template-columns: 1fr 1fr; gap: 20px; } }

.wp-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--bg-elevated);
  text-decoration: none;
  color: inherit;
  transition: all 200ms;
  box-shadow: 0 20px 40px -20px color-mix(in srgb, var(--brand-primary) 12%, transparent);
}
.wp-card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  transform: translateY(-2px);
}

.wp-tag {
  display: inline-flex;
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 4px;
  background: var(--brand-primary);
  color: #1A0A2E;
  font-size: 11px;
  font-weight: 600;
}
.wp-card h2 {
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.018em;
  color: var(--text-heading);
  margin: 4px 0 0;
}
.wp-sub { font-size: 14px; line-height: 1.55; color: var(--text-body); margin: 0; }
.wp-traits { list-style: none; padding: 0; margin: 8px 0; display: flex; flex-direction: column; gap: 6px; }
.wp-traits li { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-body); }
.wp-traits :deep(*) { color: var(--brand-primary); flex-shrink: 0; }
.wp-cta { display: inline-flex; align-items: center; gap: 4px; margin-top: 8px; font-size: 14px; font-weight: 500; color: var(--brand-primary); }
</style>
