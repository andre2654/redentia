<script setup lang="ts">
// Hero da tese (design Redentia Tese.dc.html): navy min(78vh,680px), imagem
// full-bleed sob gradiente de 4 stops, conteúdo ancorado embaixo — breadcrumb,
// H1 gigante (com trecho destacado quando marcado), subtítulo, 4 NuBadge e
// CTAs (NuFollowButton + outline 'Perguntar à IA'). O wrapper de conteúdo é
// pointer-events:none com auto só nos clicáveis (imagem/overlay inertes).
import type { TeseHeroVM } from '~/types/tese'

const props = defineProps<{ hero: TeseHeroVM; slug: string }>()

// Capa quebrada não pode vazar ícone de imagem partida — degrada pro navy.
const imgFailed = ref(false)

// Seguir tese: persiste em /thesis-favorites (cross-device) via useThesisFollow;
// anônimo → login com redirect. A Home lê esses favoritos.
const { following, toggle: onToggleFollow } = useThesisFollow(() => props.slug)
</script>

<template>
  <section v-contexto-chat="{ id: `tese:${slug}`, tipo: 'tese', rotulo: rotuloCurto(`Tese · ${hero.titlePre}${hero.titleHi}${hero.titlePost}`.replace(/\s+/g, ' ')) }" class="the">
    <div class="the__media">
      <!-- capa = LCP da página SEO de tese: fetchpriority high pra o browser
           priorizar o download (webp otimizado, ~80-145KB) -->
      <img
        v-if="hero.image && !imgFailed" :src="hero.image" :alt="`Imagem da tese ${hero.titlePre}${hero.titleHi}${hero.titlePost}`"
        class="the__img" fetchpriority="high" @error="imgFailed = true"
      >
    </div>
    <div class="the__scrim" />
    <div class="the__body">
      <div class="the__crumb">
        <NuxtLink to="/teses" class="the__crumb-link">Teses</NuxtLink>
        <span>›</span>
        <span class="the__crumb-cat">{{ hero.cat }}</span>
      </div>
      <h1 class="the__title">{{ hero.titlePre }}<span v-if="hero.titleHi" class="the__hi">{{ hero.titleHi }}</span>{{ hero.titlePost }}</h1>
      <div class="the__sub">{{ hero.subtitle }}</div>
      <div class="the__badges">
        <NuBadge v-if="hero.convBadge" variant="green-soft" size="hero">{{ hero.convBadge }}</NuBadge>
        <NuBadge v-if="hero.sinceBadge" variant="dark" size="hero">{{ hero.sinceBadge }}</NuBadge>
        <NuBadge variant="dark" size="hero">{{ hero.ativosBadge }}</NuBadge>
        <NuBadge v-if="hero.revalBadge" variant="dark" size="hero">{{ hero.revalBadge }}</NuBadge>
      </div>
      <div class="the__ctas">
        <NuFollowButton :following="following" @toggle="onToggleFollow" />
        <NuBotaoSeta to="/busca" variante="creme" tamanho="m" class="the__ask">Perguntar à IA</NuBotaoSeta>
      </div>
    </div>
  </section>
</template>

<style scoped>
.the {
  position: relative; background: var(--nu-ink);
  min-height: min(78vh, 680px);
  display: flex; flex-direction: column; justify-content: flex-end; overflow: hidden;
}
.the__media { position: absolute; inset: 0; }
.the__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.the__scrim { position: absolute; inset: 0; background: var(--nu-tese-hero-scrim); pointer-events: none; }
.the__body {
  position: relative; z-index: 1;
  padding: clamp(48px, 7vw, 80px) clamp(22px, 5.5vw, 80px) clamp(40px, 5vw, 64px);
  pointer-events: none;
}
.the__crumb {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  color: var(--nu-on-dark); font-size: 14.5px; font-weight: 600;
}
.the__crumb-link { pointer-events: auto; text-decoration: underline; text-underline-offset: 3px; transition: color .2s; }
.the__crumb-link:hover { color: var(--nu-white); }
.the__crumb-cat { letter-spacing: .2em; text-transform: uppercase; font-size: 13.5px; font-weight: 700; color: var(--nu-white); }
.the__title {
  margin: 18px 0 0; color: var(--nu-white);
  font-size: var(--nu-fs-hero); font-weight: 800;
  letter-spacing: -0.035em; line-height: .98; max-width: 1000px;
}
.the__hi {
  background: var(--nu-blue); color: var(--nu-white); padding: 1px 12px;
  -webkit-box-decoration-break: clone; box-decoration-break: clone;
}
.the__sub {
  color: var(--nu-on-dark); font-size: clamp(18px, 1.5vw, 21px);
  font-weight: 500; line-height: 1.45; margin-top: 18px; max-width: 680px;
}
.the__badges { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; margin-top: 26px; }
.the__ctas { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 30px; }
.the__ask { pointer-events: auto; }
</style>
