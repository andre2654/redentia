<script setup lang="ts">
// "O relatório completo" — a tese em formato de research de verdade (campo
// JSONB `report`, nullable; tese sem report NÃO renderiza esta seção).
// Anatomia (referência editorial Finimize, na linguagem Nu): banda branca
// fechando a alternância creme→branco depois dos números; head no padrão das
// irmãs (NuSectionHeading + meta à direita — leitura estimada/publicação);
// corpo em DUAS COLUNAS no padrão dos guias (NuTocSidebar): índice sticky à
// esquerda que acende a seção ativa no scroll + ARTIGO LONGO à direita em
// coluna de 760px (mesma medida do corpo dos guias):
//   Oportunidade (lead em destaque) → pilares (cards numerados) → riscos
//   (card vermelho suave) → partes argumentativas (h2 frase-argumento + prosa
//   + fontes-chip) → valuation (premissas + contas numeradas + preço justo em
//   card hero navy) → conclusão + marcos (checklist de observação) → fontes
//   consolidadas. O índice (report.toc) lista só o que existe; no ≤1080 ele
//   some (mesma regra do guia), o artigo segue sozinho.
// Prosa chega JÁ ESCAPADA do useTese ({mark} → .tse-hi, mesmo pipeline do
// editorial); campos atômicos são texto puro. Toda subseção é opcional —
// ausente some, e o índice lista só o que existe (estados honestos).
import type { TeseReportVM } from '~/types/tese'

const props = defineProps<{ report: TeseReportVM }>()

// pilares com índice 01/02… (tabular-nums) — largura fixa pro ritmo da lista
const idx = (i: number) => String(i + 1).padStart(2, '0')

const hasConclusion = computed(() => props.report.conclusionHtml.length > 0 || props.report.milestones.length > 0)

// report.toc ({ id, label }) → contrato do NuTocSidebar ({ label, targetId }).
// Reuso o índice sticky + scrollspy dos guias (1 implementação por
// responsabilidade); só monta com >1 seção (âncora única não vira índice).
const tocItems = computed(() => props.report.toc.map((t) => ({ label: t.label, targetId: t.id })))
</script>

<template>
  <section id="relatorio" class="trp">
    <div class="trp__head">
      <NuSectionHeading>O relatório completo.</NuSectionHeading>
      <span v-if="report.metaLine" class="trp__meta">{{ report.metaLine }}</span>
    </div>

    <div class="trp__cols">
      <!-- índice sticky com scrollspy (mesmo componente/padrão dos guias) —
           acende a seção ativa no scroll; some no ≤1080 (regra do guia). -->
      <NuTocSidebar v-if="tocItems.length > 1" :items="tocItems" label="Neste relatório" />

      <article class="trp__article">
      <!-- A oportunidade: o caso em 1-2 §§, lead em destaque -->
      <div v-if="report.opportunityHtml.length" id="rel-oportunidade" class="trp__block">
        <div class="trp__eyebrow">A oportunidade</div>
        <!-- eslint-disable-next-line vue/no-v-html — HTML escapado no composable -->
        <p v-for="(p, i) in report.opportunityHtml" :key="i" class="trp__lead" v-html="p" />
      </div>

      <!-- A tese em pilares -->
      <div v-if="report.thesisHtml.length" id="rel-tese" class="trp__block">
        <h2 class="trp__h2">A tese, em pilares.</h2>
        <div class="trp__pillars">
          <div v-for="(b, i) in report.thesisHtml" :key="i" class="trp__pillar">
            <span class="trp__pillar-idx">{{ idx(i) }}</span>
            <!-- eslint-disable-next-line vue/no-v-html — HTML escapado no composable -->
            <span class="trp__pillar-txt" v-html="b" />
          </div>
        </div>
      </div>

      <!-- Riscos: o que mata a tese (tom vermelho suave) -->
      <div v-if="report.risksHtml.length" id="rel-riscos" class="trp__block">
        <h2 class="trp__h2">O que mata a tese.</h2>
        <div class="trp__risks">
          <div v-for="(b, i) in report.risksHtml" :key="i" class="trp__risk">
            <span class="trp__risk-dot" />
            <!-- eslint-disable-next-line vue/no-v-html — HTML escapado no composable -->
            <span class="trp__risk-txt" v-html="b" />
          </div>
        </div>
      </div>

      <!-- Partes argumentativas: h2 frase-argumento + prosa + fontes-chip -->
      <div v-for="part in report.parts" :id="part.id" :key="part.id" class="trp__block">
        <h2 class="trp__h2">{{ part.heading }}</h2>
        <!-- eslint-disable-next-line vue/no-v-html — HTML escapado no composable -->
        <p v-for="(p, i) in part.paragraphsHtml" :key="i" class="trp__p" v-html="p" />
        <div v-if="part.sources.length" class="trp__chips">
          <component
            :is="f.url ? 'a' : 'span'"
            v-for="f in part.sources" :key="f.label"
            v-bind="f.url ? { href: f.url, target: '_blank', rel: 'noopener noreferrer' } : {}"
            class="trp__chip"
          >
            <span>{{ f.label }}</span>
            <svg v-if="f.url" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="trp__chip-icon"><path d="M7 17L17 7M8 7h9v9" /></svg>
          </component>
        </div>
      </div>

      <!-- Valuation: premissas + contas numeradas + preço justo hero -->
      <div v-if="report.valuation" id="rel-valuation" class="trp__block">
        <h2 class="trp__h2">O valuation.</h2>
        <!-- eslint-disable-next-line vue/no-v-html — HTML escapado no composable -->
        <p v-if="report.valuation.introHtml" class="trp__p" v-html="report.valuation.introHtml" />

        <div v-if="report.valuation.assumptions.length" class="trp__assump">
          <div class="trp__card-lbl">Premissas</div>
          <div v-for="a in report.valuation.assumptions" :key="a.label" class="trp__assump-row">
            <div class="trp__assump-top">
              <span class="trp__assump-label">{{ a.label }}</span>
              <span class="trp__assump-value">{{ a.value }}</span>
            </div>
            <div v-if="a.note" class="trp__assump-note">{{ a.note }}</div>
          </div>
        </div>

        <div v-if="report.valuation.mathHtml.length" class="trp__math">
          <div class="trp__card-lbl trp__card-lbl--math">As contas, passo a passo</div>
          <ol class="trp__math-list">
            <li v-for="(m, i) in report.valuation.mathHtml" :key="i" class="trp__math-step">
              <span class="trp__math-idx">{{ idx(i) }}</span>
              <!-- eslint-disable-next-line vue/no-v-html — HTML escapado no composable -->
              <span class="trp__math-txt" v-html="m" />
            </li>
          </ol>
        </div>

        <div v-if="report.valuation.fairValue" class="trp__fair">
          <div class="trp__fair-lbl">Preço justo estimado</div>
          <div class="trp__fair-value">{{ report.valuation.fairValue }}</div>
          <div v-if="report.valuation.vsPrice" class="trp__fair-vs">{{ report.valuation.vsPrice }}</div>
        </div>
      </div>

      <!-- Conclusão + marcos observáveis -->
      <div v-if="hasConclusion" id="rel-conclusao" class="trp__block">
        <h2 class="trp__h2">Conclusão.</h2>
        <!-- eslint-disable-next-line vue/no-v-html — HTML escapado no composable -->
        <p v-for="(p, i) in report.conclusionHtml" :key="i" class="trp__p" v-html="p" />
        <div v-if="report.milestones.length" class="trp__miles">
          <div class="trp__card-lbl">Marcos a acompanhar</div>
          <div v-for="(m, i) in report.milestones" :key="i" class="trp__mile">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="trp__mile-icon"><circle cx="12" cy="12" r="9" /></svg>
            <span class="trp__mile-txt">{{ m }}</span>
          </div>
        </div>
      </div>

      <!-- Fontes consolidadas -->
      <div v-if="report.sources.length" id="rel-fontes" class="trp__block">
        <div class="trp__sources-lbl">Fontes do relatório</div>
        <div class="trp__sources">
          <component
            :is="f.url ? 'a' : 'span'"
            v-for="f in report.sources" :key="f.label"
            v-bind="f.url ? { href: f.url, target: '_blank', rel: 'noopener noreferrer' } : {}"
            class="trp__source"
          >
            <span class="trp__source-title">{{ f.label }}</span>
            <svg v-if="f.url" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="trp__source-icon"><path d="M7 17L17 7M8 7h9v9" /></svg>
          </component>
        </div>
      </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.trp {
  background: var(--nu-white);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.trp__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.trp__meta { color: var(--nu-gray); font-size: 16px; font-weight: 600; font-variant-numeric: tabular-nums; }

/* duas colunas no padrão dos guias: índice sticky (NuTocSidebar) à esquerda +
   artigo longo à direita (mesma medida de 760px do corpo dos guias). */
.trp__cols {
  display: flex; gap: clamp(40px, 5vw, 88px); align-items: flex-start;
  margin: clamp(36px, 4.5vw, 56px) auto 0;
}
.trp__article { flex: 1; min-width: 0; max-width: 760px; }

/* blocos ancorados: scroll-margin compensa header sticky + faixa "Mercado agora" */
.trp__block { margin-top: clamp(44px, 5vw, 64px); scroll-margin-top: 132px; }
.trp__block:first-child { margin-top: 0; }

/* eyebrow + lead da oportunidade */
.trp__eyebrow { color: var(--nu-blue); font-size: clamp(16px, 1.5vw, 19px); font-weight: 800; }
.trp__lead {
  margin: 16px 0 0; color: var(--nu-ink);
  font-size: clamp(19px, 2vw, 22px); font-weight: 600; line-height: 1.6;
  letter-spacing: -0.012em;
}
.trp__lead + .trp__lead { margin-top: 18px; }

/* h2 frase-argumento (medidas do corpo de artigo dos guias) */
.trp__h2 {
  margin: 0; color: var(--nu-ink);
  font-size: clamp(26px, 3vw, 38px); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.1;
}

/* prosa (mesma voz do editorial da tese) */
.trp__p {
  margin: 18px 0 0; color: var(--nu-gray-3);
  font-size: 17.5px; font-weight: 500; line-height: 1.75;
}
.trp__lead :deep(.tse-hi),
.trp__p :deep(.tse-hi),
.trp__pillar-txt :deep(.tse-hi),
.trp__risk-txt :deep(.tse-hi),
.trp__math-txt :deep(.tse-hi) {
  background: var(--nu-blue-16); color: var(--nu-ink); font-weight: 800;
  padding: 1px 6px; -webkit-box-decoration-break: clone; box-decoration-break: clone;
}
.trp__p :deep(strong), .trp__lead :deep(strong) { font-weight: 800; color: var(--nu-ink); }

/* pilares — cards creme numerados */
.trp__pillars { display: flex; flex-direction: column; gap: 10px; margin-top: 22px; }
.trp__pillar {
  display: flex; align-items: flex-start; gap: 16px;
  background: var(--nu-cream); border-radius: 20px; padding: 20px 22px;
}
.trp__pillar-idx {
  color: var(--nu-blue); font-size: 15px; font-weight: 800;
  font-variant-numeric: tabular-nums; margin-top: 2px; flex-shrink: 0;
}
.trp__pillar-txt { color: var(--nu-ink); font-size: 16.5px; font-weight: 600; line-height: 1.55; }

/* riscos — card vermelho suave */
.trp__risks {
  background: var(--nu-tile-red-bg); border-radius: var(--nu-r-card);
  padding: 24px 26px; margin-top: 22px;
  display: flex; flex-direction: column; gap: 14px;
}
.trp__risk { display: flex; align-items: flex-start; gap: 12px; }
.trp__risk-dot {
  width: 8px; height: 8px; border-radius: 50%; background: var(--nu-red-2);
  flex-shrink: 0; margin-top: 8px;
}
.trp__risk-txt { color: var(--nu-gray-3); font-size: 15.5px; font-weight: 500; line-height: 1.6; }

/* fontes-chip no fim de cada parte */
.trp__chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
.trp__chip {
  display: inline-flex; align-items: center; gap: 7px;
  background: var(--nu-cream); border-radius: var(--nu-r-pill); padding: 8px 14px;
  color: var(--nu-gray-2); font-size: 12.5px; font-weight: 700;
  transition: background .2s, color .2s;
}
a.trp__chip:hover { background: var(--nu-cream-hover); color: var(--nu-blue); }
.trp__chip-icon { flex-shrink: 0; color: var(--nu-gray); }
a.trp__chip:hover .trp__chip-icon { color: var(--nu-blue); }

/* rótulo pequeno dos cards internos */
.trp__card-lbl {
  color: var(--nu-gray); font-size: 12.5px; font-weight: 800;
  letter-spacing: 1.3px; text-transform: uppercase;
}

/* valuation — premissas */
.trp__assump { background: var(--nu-cream); border-radius: var(--nu-r-card); padding: 24px 26px; margin-top: 22px; }
.trp__assump-row { border-top: 1.5px solid var(--nu-cream-line); padding: 14px 0; }
.trp__assump-row:first-of-type { border-top: none; margin-top: 12px; padding-top: 0; }
.trp__assump-row:last-child { padding-bottom: 0; }
.trp__assump-top { display: flex; align-items: baseline; justify-content: space-between; gap: 18px; }
.trp__assump-label { color: var(--nu-ink); font-size: 15.5px; font-weight: 700; }
.trp__assump-value {
  color: var(--nu-ink); font-size: 15.5px; font-weight: 800;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.trp__assump-note { color: var(--nu-gray-2); font-size: 13.5px; font-weight: 500; line-height: 1.55; margin-top: 5px; }

/* valuation — contas numeradas */
.trp__math { margin-top: 18px; }
.trp__card-lbl--math { margin-bottom: 4px; }
.trp__math-list { list-style: none; margin: 0; padding: 0; }
.trp__math-step {
  display: flex; align-items: flex-start; gap: 16px;
  border-bottom: 1.5px solid var(--nu-cream-2); padding: 14px 0;
}
.trp__math-idx {
  color: var(--nu-blue); font-size: 14px; font-weight: 800;
  font-variant-numeric: tabular-nums; margin-top: 2px; flex-shrink: 0;
}
.trp__math-txt {
  color: var(--nu-gray-3); font-size: 15.5px; font-weight: 500; line-height: 1.6;
  font-variant-numeric: tabular-nums;
}

/* valuation — preço justo hero */
.trp__fair {
  background: var(--nu-navy); border-radius: var(--nu-r-card-lg);
  padding: clamp(26px, 3.5vw, 38px); margin-top: 22px;
}
.trp__fair-lbl {
  color: var(--nu-cream-text-55); font-size: 12.5px; font-weight: 800;
  letter-spacing: 1.3px; text-transform: uppercase;
}
.trp__fair-value {
  color: var(--nu-cream-text); font-size: clamp(38px, 5vw, 54px); font-weight: 800;
  letter-spacing: -0.035em; line-height: 1.05; margin-top: 12px;
  font-variant-numeric: tabular-nums;
}
.trp__fair-vs {
  color: var(--nu-cream-text-78); font-size: 15px; font-weight: 600;
  line-height: 1.55; margin-top: 10px; font-variant-numeric: tabular-nums;
}

/* marcos a acompanhar — checklist de observação (círculos, não checks:
   são marcos FUTUROS a vigiar, não itens cumpridos — estado honesto) */
.trp__miles { background: var(--nu-cream); border-radius: var(--nu-r-card); padding: 24px 26px; margin-top: 22px; }
.trp__mile { display: flex; align-items: flex-start; gap: 13px; margin-top: 14px; }
.trp__mile-icon { flex-shrink: 0; margin-top: 2px; color: var(--nu-blue); }
.trp__mile-txt { color: var(--nu-gray-3); font-size: 15.5px; font-weight: 600; line-height: 1.55; }

/* fontes consolidadas (mesma anatomia das fontes do diário) */
.trp__sources-lbl {
  color: var(--nu-gray); font-size: 12.5px; font-weight: 800;
  letter-spacing: 1.3px; text-transform: uppercase;
}
.trp__sources {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 0 clamp(24px, 3vw, 48px); margin-top: 8px;
}
.trp__source {
  display: flex; align-items: center; gap: 14px; padding: 13px 0;
  border-bottom: 1.5px solid var(--nu-cream-2);
}
.trp__source-title {
  flex: 1; min-width: 0; color: var(--nu-ink); font-size: 14.5px; font-weight: 700;
  line-height: 1.4; transition: color .2s;
}
a.trp__source:hover .trp__source-title { color: var(--nu-blue); }
.trp__source-icon { flex-shrink: 0; stroke: var(--nu-sand); }
</style>
