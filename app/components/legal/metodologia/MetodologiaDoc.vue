<script setup lang="ts">
// Renderer da /metodologia — MESMO PADRÃO do shared legal/LegalDoc (banda branca,
// coluna de artigo ~820px, TOC sticky, tokens Nu), especializado só no que o
// contrato genérico não cobre: a TABELA de "Atualização de dados" (§5) e o BOX de
// disclaimer (§7). Toda a prosa (p/list/subsection) passa pelo shared LegalBlocks,
// então o estilo do texto NÃO é duplicado — herda o do gabarito. Página-local por
// design (a única página estática que precisa de tabela). Texto VERBATIM na page.
import type { LegalBlock } from '~/types/legal'

/** Tabela simples (cabeçalho + linhas de células string) — só a §5 usa. */
interface MetTable { kind: 'table'; head: string[]; rows: string[][] }
/** Bloco da metodologia: os do contrato legal + a tabela. */
type MetBlock = LegalBlock | MetTable
/** Seção de 1º nível; `callout` embrulha os blocos no box de disclaimer (§7). */
interface MetSection { id: string; title: string; callout?: boolean; blocks: MetBlock[] }

const props = withDefaults(defineProps<{
  sections: MetSection[]
  intro?: LegalBlock[]
  toc?: boolean
  tocLabel?: string
}>(), { toc: false, tocLabel: 'Nesta página' })

const tocItems = computed(() =>
  props.sections.map((s) => ({ label: s.title, targetId: s.id })),
)

// helper de narrowing pro template (b.kind === 'table')
const isTable = (b: MetBlock): b is MetTable => b.kind === 'table'
</script>

<template>
  <div class="met-doc">
    <div class="met-doc__cols" :class="{ 'met-doc__cols--toc': toc }">
      <NuTocSidebar v-if="toc" :items="tocItems" :label="tocLabel" />

      <article class="met-doc__article" :class="{ 'met-doc__article--narrow': !toc }">
        <!-- lede: parágrafo de abertura antes da 1ª seção -->
        <div v-if="intro?.length" class="met-doc__intro">
          <LegalBlocks :blocks="intro" lede />
        </div>

        <section v-for="(sec, si) in sections" :key="sec.id">
          <h2 :id="sec.id" class="met-doc__h2" :class="{ 'met-doc__h2--first': si === 0 && !intro?.length }">{{ sec.title }}</h2>

          <!-- §7: disclaimer no box com borda azul -->
          <div v-if="sec.callout" class="met-doc__callout">
            <LegalBlocks :blocks="(sec.blocks as LegalBlock[])" />
          </div>

          <!-- demais seções: prosa via shared LegalBlocks, tabela custom no meio -->
          <template v-for="(b, bi) in sec.blocks" v-else :key="bi">
            <div v-if="isTable(b)" class="met-doc__tablewrap">
              <table class="met-doc__table">
                <thead>
                  <tr>
                    <th v-for="(h, hi) in b.head" :key="hi" scope="col">{{ h }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, ri) in b.rows" :key="ri">
                    <td v-for="(cell, ci) in row" :key="ci">{{ cell }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <LegalBlocks v-else :blocks="[b]" />
          </template>
        </section>

        <slot />
      </article>
    </div>
  </div>
</template>

<style scoped>
/* espelha a casca do shared legal/LegalDoc.vue — banda branca + coluna 820px */
.met-doc {
  background: var(--nu-white);
  padding: clamp(44px, 6vw, 76px) clamp(22px, 5.5vw, 80px) clamp(64px, 8.5vw, 110px);
  animation: nu-fade .5s ease both;
}
.met-doc__cols { display: flex; gap: clamp(40px, 5vw, 88px); align-items: flex-start; }
.met-doc__cols--toc { justify-content: flex-start; }
.met-doc__article { flex: 1; min-width: 0; max-width: 820px; }
.met-doc__article--narrow { margin-left: auto; margin-right: auto; }

.met-doc__intro { margin-bottom: clamp(12px, 2vw, 20px); }

.met-doc__h2 {
  margin: clamp(40px, 4.5vw, 56px) 0 0; color: var(--nu-ink);
  font-size: clamp(24px, 2.5vw, 30px); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.14;
  scroll-margin-top: 88px;
}
.met-doc__h2--first { margin-top: 0; }

/* tabela de atualização (§5) — cabeçalho creme, linhas alternadas, números tabulares */
.met-doc__tablewrap { margin: 20px 0 0; overflow-x: auto; }
.met-doc__table {
  width: 100%; border-collapse: collapse; font-size: 15px;
  min-width: 520px;
}
.met-doc__table th,
.met-doc__table td {
  border: 1px solid var(--nu-cream-line);
  padding: 11px 14px; text-align: left; vertical-align: top;
}
.met-doc__table th {
  background: var(--nu-cream); color: var(--nu-ink);
  font-weight: 800; font-size: 13.5px; letter-spacing: -0.01em;
}
.met-doc__table td {
  color: var(--nu-gray-3); font-weight: 500; line-height: 1.55;
  font-variant-numeric: tabular-nums;
}
.met-doc__table tbody tr:nth-child(even) { background: var(--nu-sand); }

/* box de disclaimer educacional (§7) */
.met-doc__callout {
  margin-top: 20px; padding: clamp(18px, 2.4vw, 26px);
  border-left: 3px solid var(--nu-blue);
  background: var(--nu-cream);
  border-radius: 0 var(--nu-r-card) var(--nu-r-card) 0;
}
.met-doc__callout :deep(.lgb__p:first-child) { margin-top: 0; }

@media (max-width: 760px) {
  .met-doc__table { font-size: 14px; }
  .met-doc__table th,
  .met-doc__table td { padding: 9px 11px; }
}
</style>
