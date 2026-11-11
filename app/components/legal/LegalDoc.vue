<script setup lang="ts">
// Corpo das páginas legais — banda branca com COLUNA DE ARTIGO (~820px) que
// estiliza a prosa jurídica com tokens Nu (h2/h3/p/ul/ol/li/strong/a). Renderiza
// a estrutura tipada (LegalSection[] + intro opcional); nada hardcodado.
// Aninhamento de lista fica em 1 nível (ul dentro de li do documento original).
//
// TOC: quando `toc`, mostra o NuTocSidebar sticky à esquerda (some ≤1080px) com
// as seções de 1º nível. Slot default = conteúdo extra abaixo do artigo.
// ROBUSTEZ (11/11/2026): um documento. Coluna de 720px em 17px/1,65 (LegalBlocks),
// títulos com ritmo (56px antes, 16px depois), a coluna do site (--nu-coluna) e
// cada seção abaixo da dobra entra ao chegar (v-revelar). O texto é o mesmo.
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
        <!-- celular e tablet: o mesmo sumário, fechado, no topo da leitura -->
        <LegalIndice v-if="toc" :items="tocItems" :rotulo="tocLabel" />

        <!-- lede: parágrafos de abertura antes da 1ª seção -->
        <div v-if="intro?.length" class="lgd__intro">
          <LegalBlocks :blocks="intro" lede />
        </div>

        <section v-for="(sec, si) in sections" :key="sec.id" v-revelar>
          <h2 :id="sec.id" class="lgd__h2" :class="{ 'lgd__h2--first': si === 0 && !intro?.length }">{{ sec.title }}</h2>
          <LegalBlocks :blocks="sec.blocks" />
        </section>

        <slot />
      </article>
    </div>
  </div>
</template>

<style scoped>
/* o documento sobre o creme da página (não existe faixa branca de ponta a ponta) */
.lgd {
  background: var(--nu-page);
  padding: clamp(44px, 6vw, 76px) var(--nu-coluna) clamp(72px, 8vw, 128px);
  animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) var(--nu-passo-cascata) both;
}
.lgd__cols { display: flex; gap: clamp(40px, 5vw, 88px); align-items: flex-start; }
.lgd__cols--toc { justify-content: flex-start; }
/* documento de leitura: coluna de ~720px */
.lgd__article { flex: 1; min-width: 0; max-width: 720px; }
/* sem TOC: coluna centralizada */
.lgd__article--narrow { margin-left: auto; margin-right: auto; }

.lgd__intro { margin-bottom: clamp(12px, 2vw, 20px); }

.lgd__h2 {
  margin: clamp(40px, 4.5vw, 56px) 0 0; color: var(--nu-ink);
  font-size: clamp(26px, 2.6vw, 32px); font-weight: var(--nu-w-forte);
  letter-spacing: var(--nu-ls-titulo); line-height: 1.12; text-wrap: balance;
  /* o topo e a régua do mercado grudam (~100px): a âncora para abaixo deles */
  scroll-margin-top: calc(var(--nuh-h, 72px) + 64px);
}
.lgd__h2--first { margin-top: 0; }
@media (prefers-reduced-motion: reduce) { .lgd { animation: none; } }
</style>
