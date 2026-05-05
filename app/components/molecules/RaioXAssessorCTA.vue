<!--
  MoleculesRaioXAssessorCTA — "AVALIAÇÃO CONTÍNUA"

  USADO EM:
  /raio-x APOS o soft gate (depois do email form). Cross-sell pra Assessor
  Inteligente — feature premium da Redent.IA com IA avançada + alertas
  diários + plano por objetivo.

  COPY (do user, brief direto):
  - "AVALIACAO CONTINUA"
  - "Quer ir mais fundo, com nosso assessor inteligente?"
  - 4 bullets de feature
  - 2 CTAs: "Ativar Assessor Inteligente" (primary) + "Como funciona" (link)

  DESIGN:
  Card amber-tinted com glow, posicionado depois do soft gate. Mesma
  identidade visual do hero (linha amber, tipografia light large, etc).
-->
<script setup lang="ts">
const brand = useBrand()

const features = [
  {
    icon: 'i-lucide-activity',
    label: 'Análise da sua carteira atualizada em tempo real',
  },
  {
    icon: 'i-lucide-target',
    label: 'Plano por objetivo (aposentadoria, casa, filhos, projeto)',
  },
  {
    icon: 'i-lucide-bell',
    label: 'Alertas no momento em que algo muda nos seus ativos',
  },
  {
    icon: 'i-lucide-message-circle',
    label: 'Conversa ilimitada com a IA avançada da Redent.IA',
  },
]
</script>

<template>
  <section class="rx-assessor">
    <!-- Glow atmosferico -->
    <div
      class="rx-assessor__glow"
      aria-hidden="true"
      :style="{
        background: `radial-gradient(ellipse 70% 60% at 50% 40%, color-mix(in srgb, ${brand.colors.primary} 22%, transparent), transparent 65%)`,
      }"
    />

    <div class="rx-assessor__card">
      <p class="eyebrow">AVALIAÇÃO CONTÍNUA</p>

      <h2 class="rx-assessor__title">
        Quer ir mais fundo, com nosso
        <em :style="{ color: brand.colors.primary, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }">assessor inteligente?</em>
      </h2>

      <p class="rx-assessor__intro">
        Esta análise é o ponto de partida. O <strong>Assessor Inteligente da Redent.IA</strong>
        cruza fundamentos, notícias, dividendos e seu perfil de risco em tempo real,
        com a IA mais avançada da plataforma. Ele acompanha sua carteira diariamente
        e te avisa antes de qualquer mudança relevante.
      </p>

      <ul class="rx-assessor__features">
        <li v-for="(feat, idx) in features" :key="idx">
          <span class="rx-assessor__feat-icon" aria-hidden="true">
            <UIcon :name="feat.icon" class="size-4" :style="{ color: brand.colors.primary }" />
          </span>
          <span class="rx-assessor__feat-label">{{ feat.label }}</span>
        </li>
      </ul>

      <div class="rx-assessor__actions">
        <NuxtLink
          to="/auth/register?next=/wallet&from=raiox-assessor"
          class="rx-assessor__btn-primary"
        >
          <UIcon name="i-lucide-sparkles" class="size-4" aria-hidden="true" />
          <span>Ativar Assessor Inteligente</span>
          <UIcon name="i-lucide-arrow-right" class="size-4" aria-hidden="true" />
        </NuxtLink>
        <NuxtLink
          to="/help"
          class="rx-assessor__btn-link"
        >
          Como funciona
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rx-assessor {
  position: relative;
  padding: 64px 0;
  isolation: isolate;
}

.rx-assessor__glow {
  position: absolute;
  inset: -80px -120px auto -120px;
  height: 480px;
  filter: blur(80px);
  z-index: -1;
  pointer-events: none;
  opacity: 0.7;
}

.rx-assessor__card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 40px 32px;
  border-radius: 22px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--brand-primary) 7%, var(--bg-elevated)) 0%,
    var(--bg-elevated) 100%
  );
  border: 1px solid color-mix(in srgb, var(--brand-primary) 28%, transparent);
  box-shadow:
    0 32px 80px -24px color-mix(in srgb, var(--brand-primary) 28%, transparent),
    0 16px 40px -12px rgba(0, 0, 0, 0.18);
  text-align: center;
  align-items: center;
}

@media (min-width: 768px) {
  .rx-assessor__card {
    padding: 56px 48px;
  }
}

.eyebrow {
  font-family: var(--brand-font);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
  margin: 0;
}

.rx-assessor__title {
  font-family: var(--brand-font);
  font-size: 30px;
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--text-heading);
  margin: 4px 0 0;
  max-width: 720px;
  text-wrap: balance;
}

@media (min-width: 768px) {
  .rx-assessor__title { font-size: 44px; }
}

.rx-assessor__intro {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-body);
  max-width: 620px;
  margin: 8px 0 0;
}

.rx-assessor__intro strong {
  color: var(--text-heading);
  font-weight: 600;
}

@media (min-width: 768px) {
  .rx-assessor__intro { font-size: 16px; }
}

.rx-assessor__features {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  width: 100%;
  max-width: 580px;
  text-align: left;
}

@media (min-width: 768px) {
  .rx-assessor__features {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
}

.rx-assessor__features li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  line-height: 1.45;
  color: var(--text-body);
}

@media (min-width: 768px) {
  .rx-assessor__features li { font-size: 14px; }
}

.rx-assessor__feat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  flex-shrink: 0;
  margin-top: 1px;
}

.rx-assessor__feat-label {
  flex: 1;
}

/* ============ ACTIONS ============ */
.rx-assessor__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
}

@media (min-width: 768px) {
  .rx-assessor__actions {
    flex-direction: row;
    gap: 16px;
  }
}

.rx-assessor__btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 28px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  border: 0;
  font-family: var(--brand-font);
  text-decoration: none;
  background: var(--brand-primary);
  color: #fff;
  transition: filter 180ms, transform 120ms, box-shadow 180ms;
  box-shadow: 0 12px 32px -12px color-mix(in srgb, var(--brand-primary) 65%, transparent);
}

.rx-assessor__btn-primary:hover {
  filter: brightness(0.94);
  transform: translateY(-1px);
  box-shadow: 0 16px 40px -12px color-mix(in srgb, var(--brand-primary) 75%, transparent);
}

.rx-assessor__btn-primary:active {
  transform: translateY(0);
}

.rx-assessor__btn-link {
  display: inline-flex;
  align-items: center;
  padding: 12px 18px;
  font-family: var(--brand-font);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 150ms;
}

.rx-assessor__btn-link:hover {
  color: var(--text-heading);
}
</style>
