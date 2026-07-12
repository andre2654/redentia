<script setup lang="ts">
// Corpo das páginas legais — banda branca com COLUNA DE ARTIGO (~820px) que
// estiliza a prosa jurídica com tokens Nu (h2/h3/p/ul/ol/li/strong/a). Renderiza
// a estrutura tipada (LegalSection[] + intro opcional); nada hardcodado.
// Aninhamento de lista fica em 1 nível (ul dentro de li do documento original).
//
// TOC: quando `toc`, mostra o NuTocSidebar sticky à esquerda (some ≤1080px) com
// as seções de 1º nível. Slot default = conteúdo extra abaixo do artigo.
import type { LegalBlock, LegalSection } from '~/types/legal'

const props = withDefaults(defineProps<{
  sections: LegalSection[]
  intro?: LegalBlock[]
  toc?: boolean
  tocLabel?: string
}>(), { toc: false, tocLabel: 'Nesta página' })

const tocItems = computed(() =>
  props.sections.map((s) => ({ label: s.title, targetId: s.id })),
)
</script>

<template>
  <div class="lgd">
    <div class="lgd__cols" :class="{ 'lgd__cols--toc': toc }">
      <NuTocSidebar v-if="toc" :items="tocItems" :label="tocLabel" />

      <article class="lgd__article" :class="{ 'lgd__article--narrow': !toc }">
        <!-- lede: parágrafos de abertura antes da 1ª seção -->
        <div v-if="intro?.length" class="lgd__intro">
          <LegalBlocks :blocks="intro" lede />
        </div>

        <section v-for="(sec, si) in sections" :key="sec.id">
          <h2 :id="sec.id" class="lgd__h2" :class="{ 'lgd__h2--first': si === 0 && !intro?.length }">{{ sec.title }}</h2>
          <LegalBlocks :blocks="sec.blocks" />
        </section>

        <slot />
      </article>
    </div>
  </div>
</template>

<style scoped>
.lgd {
  background: var(--nu-white);
  padding: clamp(44px, 6vw, 76px) clamp(22px, 5.5vw, 80px) clamp(64px, 8.5vw, 110px);
  animation: nu-fade .5s ease both;
}
.lgd__cols { display: flex; gap: clamp(40px, 5vw, 88px); align-items: flex-start; }
.lgd__cols--toc { justify-content: flex-start; }
.lgd__article { flex: 1; min-width: 0; max-width: 820px; }
/* sem TOC: coluna centralizada */
.lgd__article--narrow { margin-left: auto; margin-right: auto; }

.lgd__intro { margin-bottom: clamp(12px, 2vw, 20px); }

.lgd__h2 {
  margin: clamp(40px, 4.5vw, 56px) 0 0; color: var(--nu-ink);
  font-size: clamp(24px, 2.5vw, 30px); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.14;
  /* compensa a faixa "Mercado agora" sticky (~48px) + respiro */
  scroll-margin-top: 88px;
}
.lgd__h2--first { margin-top: 0; }
</style>
