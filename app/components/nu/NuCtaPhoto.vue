<script setup lang="ts">
// CTA final full-bleed (banda azul com foto de fundo + scrims do design) —
// extraído da CTA do /mercado (PR-R5) pra virar a implementação única do
// padrão "CTA impactante de fim de página" (mercado, rankings, ...).
//
// Foto: passe `image` (paisagem, assunto à direita, espaço livre à esquerda —
// direção do André). Enquanto o arquivo não existir a url 404a silenciosamente
// e o gradiente placeholder (2ª camada) + scrims mantêm a legibilidade.
interface CtaAction { label: string; to: string }

const props = withDefaults(defineProps<{
  image?: string
  primary: CtaAction
  secondary?: CtaAction
}>(), {
  image: '/mercado/cta-pessoas.webp',
  secondary: undefined,
})

const mediaStyle = computed(() => ({
  background: `url('${props.image}') center / cover no-repeat, var(--nu-cta-placeholder)`,
}))
</script>

<template>
  <section class="ncp">
    <div class="ncp__media" :style="mediaStyle" aria-hidden="true" />
    <div class="ncp__scrim ncp__scrim--h" aria-hidden="true" />
    <div class="ncp__scrim ncp__scrim--v" aria-hidden="true" />
    <div class="ncp__inner">
      <h2 class="ncp__title"><slot name="title" /></h2>
      <div class="ncp__sub"><slot name="subtitle" /></div>
      <div class="ncp__actions">
        <NuxtLink :to="primary.to" class="ncp__primary">{{ primary.label }}</NuxtLink>
        <NuxtLink v-if="secondary" :to="secondary.to" class="ncp__secondary">{{ secondary.label }}</NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ncp {
  position: relative; overflow: hidden; background: var(--nu-blue);
  padding: clamp(52px, 6.5vw, 84px) clamp(22px, 5.5vw, 80px);
  min-height: clamp(320px, 34vw, 430px); display: flex; align-items: center;
  animation: nu-fade .5s ease both;
}
.ncp__media { position: absolute; inset: 0; z-index: 0; }
.ncp__scrim { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.ncp__scrim--h { background: var(--nu-cta-scrim-h); }
.ncp__scrim--v { background: var(--nu-cta-scrim-v); }
.ncp__inner { position: relative; z-index: 2; max-width: 660px; }
.ncp__title {
  margin: 0; color: var(--nu-cream-text); font-size: clamp(40px, 5.5vw, 76px);
  font-weight: 800; letter-spacing: -0.045em; line-height: 1.03;
}
.ncp__sub { color: var(--nu-cream-text-82); font-size: clamp(16px, 1.7vw, 19px); font-weight: 600; margin-top: 18px; }
.ncp__actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 38px; }
.ncp__primary {
  display: inline-flex; align-items: center; gap: 10px; background: var(--nu-cream); color: var(--nu-navy);
  border-radius: var(--nu-r-pill); padding: 17px 30px; font-size: 17px; font-weight: 800;
  transition: background .2s, transform .15s;
}
.ncp__primary:hover { background: var(--nu-white); color: var(--nu-navy); transform: translateY(-2px); }
.ncp__secondary {
  display: inline-flex; align-items: center; gap: 10px; background: transparent; color: var(--nu-cream-text);
  border: 2px solid var(--nu-cream-text-45); border-radius: var(--nu-r-pill); padding: 15px 28px;
  font-size: 17px; font-weight: 700; transition: background .2s, border-color .2s;
}
.ncp__secondary:hover { background: var(--nu-cream-text-10); border-color: var(--nu-cream-text-80); color: var(--nu-cream-text); }
</style>
