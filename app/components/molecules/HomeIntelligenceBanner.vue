<!--
  HomeIntelligenceBanner — Banner CTA "Do caos ao impacto".

  Headline + sub editorial sobre o problema (caos de informação) e a
  promessa (impacto na carteira). Sem toggle interno — o toggle de view
  (Para você | Mercado completo) vive separado em <MoleculesHomeViewToggle>
  e fica ACIMA do banner na rota /.

  BG: mesh gradient + arc SVG portados do <HomeHeroRadiograph> usado em
  /mercado-completo, pra unificar a atmosfera visual entre as duas rotas
  (light: pastel amber wash → branco; dark: saturated amber sobre near-black).

  Usado em:
    - / (home anônima)
    - /hero-examples (galeria de heroes)
-->
<template>
  <section :class="['bn', { 'bn-full-bleed': fullBleed }]">
    <!-- Background mesh (mesmo stack de /mercado-completo HeroRadiograph):
         baseWash + 3 mesh blobs amber/rose/soft + arc SVG curvo top-right.
         pointer-events:none pra não interferir com cliques no conteúdo. -->
    <div class="bn-bg pointer-events-none absolute inset-0">
      <div class="bn-mesh-amber absolute -right-32 -top-40 h-[680px] w-[820px] rounded-full blur-3xl" />
      <div class="bn-mesh-rose absolute right-[10%] top-[30%] h-[480px] w-[520px] rounded-full blur-3xl" />
      <div class="bn-mesh-soft absolute -bottom-40 -left-32 h-[560px] w-[640px] rounded-full blur-3xl" />
      <svg class="absolute -right-20 -top-20 h-[520px] w-[640px]" viewBox="0 0 640 520" fill="none" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="bn-arc-grad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop class="bn-arc-stop1" offset="0%" stop-color="var(--brand-primary)" />
            <stop class="bn-arc-stop2" offset="60%" stop-color="#F96BEE" />
            <stop offset="100%" stop-color="#F96BEE" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path d="M 640 0 L 640 240 Q 480 360 320 320 Q 160 280 0 380 L 0 0 Z" fill="url(#bn-arc-grad)" />
      </svg>
    </div>

    <div class="bn-cta">
      <h2 class="bn-cta-h">
        Do Caos do mercado ao <em>impacto</em> na sua carteira.
      </h2>
      <p class="bn-cta-sub">
        A Redentia filtra notícias, ativos e indicadores para mostrar
        <em>o que realmente</em> mexeu nos seus investimentos.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  /** Remove border-radius e visual de "card" para ocupar full-bleed */
  fullBleed?: boolean
}>(), { fullBleed: false })
</script>

<style scoped>
.bn {
  padding: 56px 28px 64px;
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  isolation: isolate;
}

.bn-cta { position: relative; z-index: 1; }

/* Full-bleed: sem arredondamento + sem nenhuma borda (cola full-width) */
.bn-full-bleed {
  border-radius: 0;
  border: 0;
  padding-top: 64px;
  padding-bottom: 72px;
}

/* CTA central — headline + subtext editorial */
.bn-cta {
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
}
.bn-cta-h {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(28px, 3.6vw, 44px);
  font-weight: 300;
  color: var(--text-heading);
  margin: 0 0 18px;
  line-height: 1.15;
  letter-spacing: -0.02em;
}
.bn-cta-h em {
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
}
.bn-cta-sub {
  font-size: clamp(14px, 1.4vw, 16px);
  color: var(--text-body);
  margin: 0 auto;
  max-width: 580px;
  line-height: 1.55;
}
.bn-cta-sub em {
  font-style: italic;
  font-weight: 500;
  color: var(--brand-primary);
}
</style>

<!-- BG mesh em <style> unscoped: precisa de seletores `:root.dark` /
     `:root.light` pra resolver dark-mode antes da hidratação. Scoped
     CSS injeta `[data-v-X]` quebrando o match com `:root.X`. Padrão
     idêntico ao usado em <HomeHeroRadiograph>. -->
<style>
/* Default light (modo não definido ainda, no media query OS) — pastel wash */
.bn-bg {
  background: linear-gradient(180deg, color-mix(in srgb, var(--brand-primary) 4%, white) 0%, white 70%);
}
.bn-mesh-amber {
  background: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 35%, white), transparent 65%);
  opacity: 0.18;
}
.bn-mesh-rose {
  background: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 28%, white), transparent 70%);
  opacity: 0.10;
}
.bn-mesh-soft {
  background: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 30%, white), transparent 70%);
  opacity: 0.12;
}
.bn-arc-stop1 { stop-opacity: 0.08; }
.bn-arc-stop2 { stop-opacity: 0.03; }

/* Dark — bg transparente (revela page bg preto), mesh saturado */
@media (prefers-color-scheme: dark) {
  :root:not(.light):not(.dark) .bn-bg { background: transparent; }
  :root:not(.light):not(.dark) .bn-mesh-amber {
    background: radial-gradient(circle, var(--brand-primary), transparent 65%);
    opacity: 0.30;
  }
  :root:not(.light):not(.dark) .bn-mesh-rose {
    background: radial-gradient(circle, var(--brand-primary), transparent 70%);
    opacity: 0.18;
  }
  :root:not(.light):not(.dark) .bn-mesh-soft {
    background: radial-gradient(circle, var(--brand-primary), transparent 70%);
    opacity: 0.20;
  }
  :root:not(.light):not(.dark) .bn-arc-stop1 { stop-opacity: 0.22; }
  :root:not(.light):not(.dark) .bn-arc-stop2 { stop-opacity: 0.08; }
}
:root.dark .bn-bg { background: transparent; }
:root.dark .bn-mesh-amber {
  background: radial-gradient(circle, var(--brand-primary), transparent 65%);
  opacity: 0.30;
}
:root.dark .bn-mesh-rose {
  background: radial-gradient(circle, var(--brand-primary), transparent 70%);
  opacity: 0.18;
}
:root.dark .bn-mesh-soft {
  background: radial-gradient(circle, var(--brand-primary), transparent 70%);
  opacity: 0.20;
}
:root.dark .bn-arc-stop1 { stop-opacity: 0.22; }
:root.dark .bn-arc-stop2 { stop-opacity: 0.08; }
</style>
