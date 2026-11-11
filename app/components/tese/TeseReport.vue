<script setup lang="ts">
// "O relatório completo" — a tese em formato de research de verdade (campo
// JSONB `report`, nullable; tese sem report NÃO renderiza esta seção).
//
// 11/11/2026 (docs/aportou/tese.md): o relatório virou LEITURA RECOLHIDA. Era
// uma leitura de 18 minutos aberta no meio da página; agora fica à vista o
// cabeçalho (tempo de leitura, publicação, versão) e o relatório abre por
// parte, cada uma um <details>: a oportunidade, a tese em pontos, cada parte
// argumentativa (a frase-argumento no título), o valuation (premissas, contas
// e preço justo), a conclusão (com os marcos a acompanhar) e as fontes. Tudo
// continua no HTML do servidor (<details> fechado serve). No computador, o
// sumário à esquerda (NuTocSidebar, o mesmo dos guias) acende a parte da tela
// e, ao clicar, abre a parte.
// Os riscos do relatório ("O que mata a tese") moram agora na seção sálvia "O
// que pode dar errado" (TeseRiscos), logo acima: aqui não se repetem.
// Prosa chega JÁ ESCAPADA do useTese ({mark} → .tse-hi, mesmo pipeline do
// editorial); campos atômicos são texto puro. Toda subseção é opcional —
// ausente some, e o índice lista só o que existe (estados honestos).
import type { TeseReportVM } from '~/types/tese'

const props = defineProps<{ report: TeseReportVM }>()
// o sujeito do chip do chat (proverSobreDoContexto na página)
const sobre = useSobreDoContexto()

// pilares com índice 01/02… (tabular-nums) — largura fixa pro ritmo da lista
const idx = (i: number) => String(i + 1).padStart(2, '0')

const hasConclusion = computed(() => props.report.conclusionHtml.length > 0 || props.report.milestones.length > 0)
const meta = computed(() => [props.report.metaLine, props.report.version != null ? `Versão ${props.report.version}` : null].filter(Boolean).join(' · '))

// report.toc ({ id, label }) → contrato do NuTocSidebar ({ label, targetId }).
// Reuso o índice sticky + scrollspy dos guias (1 implementação por
// responsabilidade); só monta com >1 seção (âncora única não vira índice).
// Os riscos saíram daqui (estão na seção de cima): fora do índice.
const tocItems = computed(() => props.report.toc.filter((t) => t.id !== 'rel-riscos').map((t) => ({ label: t.label, targetId: t.id })))

// clicar no sumário (ou chegar com a âncora na URL) abre a parte recolhida
function abrirAncora(hash: string) {
  const el = hash.startsWith('#rel-') ? document.getElementById(hash.slice(1)) : null
  if (el instanceof HTMLDetailsElement) el.open = true
}
function aoClicar(e: MouseEvent) {
  const a = (e.target as HTMLElement | null)?.closest?.('a[href^="#rel-"]')
  if (a) abrirAncora(a.getAttribute('href') ?? '')
}
onMounted(() => abrirAncora(window.location.hash))
</script>

<template>
  <section id="relatorio" class="trp" @click="aoClicar">
    <div class="trp__head">
      <div>
        <NuEyebrow como="p">Relatório</NuEyebrow>
        <h2 class="trp__titulo">O relatório completo.</h2>
      </div>
      <span v-if="meta" class="trp__meta">{{ meta }}</span>
    </div>

    <div class="trp__cols">
      <!-- índice sticky com scrollspy (mesmo componente/padrão dos guias) —
           acende a seção ativa no scroll; some no ≤1080 (regra do guia). -->
      <NuTocSidebar v-if="tocItems.length > 1" :items="tocItems" label="Neste relatório" />

      <article class="trp__article">
        <div class="trp__dobras">
          <!-- A oportunidade: o caso em 1-2 §§, lead em destaque -->
          <details v-if="report.opportunityHtml.length" id="rel-oportunidade" class="trp__dobra">
            <summary class="trp__dobra-cab"><h3 class="trp__dobra-t">A oportunidade</h3><NuMais :tamanho="36" /></summary>
            <div class="trp__dobra-corpo">
              <!-- eslint-disable-next-line vue/no-v-html — HTML escapado no composable -->
              <p v-for="(p, i) in report.opportunityHtml" :key="i" class="trp__lead" v-html="p" />
            </div>
          </details>

          <!-- A tese em pontos -->
          <details v-if="report.thesisHtml.length" id="rel-tese" class="trp__dobra">
            <summary class="trp__dobra-cab"><h3 class="trp__dobra-t">A tese, em pilares.</h3><NuMais :tamanho="36" /></summary>
            <div class="trp__dobra-corpo">
              <ol class="trp__pillars">
                <li v-for="(b, i) in report.thesisHtml" :key="i" v-contexto-chat="{ id: `tese-pilar:${sobre}:${i}`, tipo: 'tese', rotulo: rotuloCurto(`Pilar ${i + 1} · ${sobre}`) }" class="trp__pillar">
                  <span class="trp__pillar-idx" aria-hidden="true">{{ idx(i) }}</span>
                  <!-- eslint-disable-next-line vue/no-v-html — HTML escapado no composable -->
                  <span class="trp__pillar-txt" v-html="b" />
                </li>
              </ol>
            </div>
          </details>

          <!-- Partes argumentativas: a frase-argumento abre a prosa e as fontes-chip -->
          <details v-for="part in report.parts" :id="part.id" :key="part.id" class="trp__dobra">
            <summary class="trp__dobra-cab"><h3 class="trp__dobra-t">{{ part.heading }}</h3><NuMais :tamanho="36" /></summary>
            <div class="trp__dobra-corpo">
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
          </details>

          <!-- Valuation: premissas + contas numeradas + preço justo hero -->
          <details v-if="report.valuation" id="rel-valuation" class="trp__dobra">
            <summary class="trp__dobra-cab"><h3 class="trp__dobra-t">O valuation.</h3><NuMais :tamanho="36" /></summary>
            <div class="trp__dobra-corpo">
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
          </details>

          <!-- Conclusão + marcos observáveis -->
          <details v-if="hasConclusion" id="rel-conclusao" class="trp__dobra">
            <summary class="trp__dobra-cab"><h3 class="trp__dobra-t">Conclusão.</h3><NuMais :tamanho="36" /></summary>
            <div class="trp__dobra-corpo">
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
          </details>

          <!-- Fontes consolidadas -->
          <details v-if="report.sources.length" id="rel-fontes" class="trp__dobra">
            <summary class="trp__dobra-cab"><h3 class="trp__dobra-t">Fontes do relatório</h3><NuMais :tamanho="36" /></summary>
            <div class="trp__dobra-corpo">
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
          </details>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.trp {
  background: var(--nu-page); scroll-margin-top: 120px;
  padding: clamp(56px, 5.6vw, 80px) max(clamp(20px, 4vw, 56px), calc((100% - 1240px) / 2));
  animation: nu-fade .5s ease both;
}
.trp__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px 22px; flex-wrap: wrap; }
.trp__titulo { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display); letter-spacing: -0.03em; line-height: 1.02; }
.trp__meta { color: var(--nu-gray); font-size: 14.5px; font-weight: 600; font-variant-numeric: tabular-nums; }

/* duas colunas no padrão dos guias: índice sticky (NuTocSidebar) à esquerda +
   artigo longo à direita (mesma medida de 760px do corpo dos guias). */
.trp__cols {
  display: flex; gap: clamp(40px, 5vw, 88px); align-items: flex-start;
  margin: clamp(28px, 3.4vw, 40px) auto 0;
}
.trp__article { flex: 1; min-width: 0; max-width: 860px; }
/* a prosa segue na medida de leitura dos guias */
.trp__dobra-corpo { max-width: 760px; }

/* o lead da oportunidade */
.trp__lead {
  margin: 0; color: var(--nu-ink);
  font-size: clamp(19px, 2vw, 22px); font-weight: 600; line-height: 1.5;
  letter-spacing: -0.012em;
}
.trp__lead + .trp__lead { margin-top: 18px; }

/* prosa (mesma voz do editorial da tese) */
.trp__p {
  margin: 18px 0 0; color: var(--nu-gray-3);
  font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6;
}
.trp__lead :deep(.tse-hi),
.trp__p :deep(.tse-hi),
.trp__pillar-txt :deep(.tse-hi),
.trp__math-txt :deep(.tse-hi) {
  background: var(--nu-blue-bg); color: var(--nu-ink); font-weight: var(--nu-w-forte); border-radius: 4px;
  padding: 1px 6px; -webkit-box-decoration-break: clone; box-decoration-break: clone;
}
.trp__p :deep(strong), .trp__lead :deep(strong) { font-weight: var(--nu-w-forte); color: var(--nu-ink); }

/* a tese em pontos: lista numerada, um fio por ponto */
.trp__pillars { list-style: none; margin: 0; padding: 0; }
.trp__pillar { display: flex; align-items: baseline; gap: 16px; padding: 14px 0; border-top: 1px solid var(--nu-line-2); }
.trp__pillar:first-child { border-top: 0; padding-top: 0; }
.trp__pillar-idx {
  color: var(--nu-blue); font-size: var(--nu-fs-xl); font-weight: var(--nu-w-forte); line-height: 1.2;
  font-variant-numeric: tabular-nums; flex-shrink: 0;
}
.trp__pillar-txt { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }

/* ——— as partes recolhidas: <details> entre fios, o "+" que gira ——— */
.trp__dobras { border-bottom: 1px solid var(--nu-line); }
.trp__dobra { border-top: 1px solid var(--nu-line); scroll-margin-top: 132px; interpolate-size: allow-keywords; }
.trp__dobra::details-content { block-size: 0; overflow: clip; transition: block-size .36s var(--nu-ease-saida), content-visibility .36s allow-discrete; }
.trp__dobra[open]::details-content { block-size: auto; }
.trp__dobra-cab {
  display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 68px; padding: 14px 0;
  cursor: pointer; list-style: none;
}
.trp__dobra-cab::-webkit-details-marker { display: none; }
.trp__dobra-t { margin: 0; color: var(--nu-ink); font-size: clamp(19px, 1.7vw, 23px); font-weight: var(--nu-w-forte); letter-spacing: -0.02em; line-height: 1.2; transition: color .2s ease; }
.trp__dobra-cab:hover .trp__dobra-t { color: var(--nu-blue-text); }
/* o "+" (NuMais) escurece sob o ponteiro e gira com o <details> aberto: sozinho, no <summary> */
.trp__dobra-corpo { padding: 0 0 28px; }
.trp__dobra[open] > .trp__dobra-corpo { animation: nu-fade .3s ease both; }
.trp__dobra-corpo > :first-child { margin-top: 0; }

/* fontes-chip no fim de cada parte */
.trp__chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
.trp__chip {
  display: inline-flex; align-items: center; gap: 7px;
  background: var(--nu-cream-2); border-radius: var(--nu-r-pill); min-height: 44px; padding: 6px 16px;
  color: var(--nu-gray-3); font-size: 13.5px; font-weight: var(--nu-w-medio);
  transition: background .2s, color .2s;
}
a.trp__chip:hover { background: var(--nu-line-2); color: var(--nu-blue-text); }
.trp__chip-icon { flex-shrink: 0; color: var(--nu-gray); }
a.trp__chip:hover .trp__chip-icon { color: var(--nu-blue); }

/* rótulo pequeno dos cards internos */
.trp__card-lbl {
  color: var(--nu-gray); font-size: 13.5px; font-weight: var(--nu-w-medio);
  letter-spacing: .16em; text-transform: uppercase;
}

/* valuation — premissas */
.trp__assump { background: var(--nu-card); border-radius: var(--nu-r-panel); padding: 24px 26px; margin-top: 22px; box-shadow: var(--nu-shadow-quente); }
.trp__assump-row { border-top: 1px solid var(--nu-line-2); padding: 14px 0; }
.trp__assump-row:first-of-type { border-top: none; margin-top: 12px; padding-top: 0; }
.trp__assump-row:last-child { padding-bottom: 0; }
.trp__assump-top { display: flex; align-items: baseline; justify-content: space-between; gap: 18px; }
.trp__assump-label { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); }
.trp__assump-value {
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte);
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.trp__assump-note { color: var(--nu-gray); font-size: 14.5px; font-weight: 500; line-height: 1.55; margin-top: 5px; }

/* valuation — contas numeradas */
.trp__math { margin-top: 18px; }
.trp__card-lbl--math { margin-bottom: 4px; }
.trp__math-list { list-style: none; margin: 0; padding: 0; }
.trp__math-step {
  display: flex; align-items: flex-start; gap: 16px;
  border-bottom: 1px solid var(--nu-line-2); padding: 14px 0;
}
.trp__math-idx {
  color: var(--nu-blue); font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte);
  font-variant-numeric: tabular-nums; margin-top: 1px; flex-shrink: 0;
}
.trp__math-txt {
  color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6;
  font-variant-numeric: tabular-nums;
}

/* valuation — preço justo hero */
.trp__fair {
  background: var(--nu-ink); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-escuro);
  padding: clamp(26px, 3.5vw, 38px); margin-top: 22px;
}
.trp__fair-lbl {
  color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: var(--nu-w-medio);
  letter-spacing: .16em; text-transform: uppercase;
}
.trp__fair-value {
  color: var(--nu-white); font-size: clamp(46px, 5.2vw, 68px); font-weight: var(--nu-w-display);
  letter-spacing: -0.035em; line-height: 1.05; margin-top: 12px;
  font-variant-numeric: tabular-nums;
}
.trp__fair-vs {
  color: var(--nu-on-dark); font-size: var(--nu-fs-md); font-weight: 500;
  line-height: 1.5; margin-top: 10px; font-variant-numeric: tabular-nums;
}

/* marcos a acompanhar — checklist de observação (círculos, não checks:
   são marcos FUTUROS a vigiar, não itens cumpridos — estado honesto) */
.trp__miles { background: var(--nu-card); border-radius: var(--nu-r-panel); padding: 24px 26px; margin-top: 22px; box-shadow: var(--nu-shadow-quente); }
.trp__mile { display: flex; align-items: flex-start; gap: 13px; margin-top: 14px; }
.trp__mile-icon { flex-shrink: 0; margin-top: 2px; color: var(--nu-blue); }
.trp__mile-txt { color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }

/* fontes consolidadas (mesma anatomia das fontes do diário) */
.trp__sources-lbl {
  color: var(--nu-gray); font-size: 13.5px; font-weight: var(--nu-w-medio);
  letter-spacing: .16em; text-transform: uppercase;
}
.trp__sources {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 0 clamp(24px, 3vw, 48px); margin-top: 8px;
}
.trp__source {
  display: flex; align-items: center; gap: 14px; padding: 13px 0;
  border-bottom: 1px solid var(--nu-line-2);
}
.trp__source-title {
  flex: 1; min-width: 0; color: var(--nu-ink); font-size: 14.5px; font-weight: var(--nu-w-medio);
  line-height: 1.4; transition: color .2s;
}
a.trp__source:hover .trp__source-title { color: var(--nu-blue-text); }
.trp__source-icon { flex-shrink: 0; stroke: var(--nu-sand); }
@media (prefers-reduced-motion: reduce) {
  .trp, .trp__dobra[open] > .trp__dobra-corpo { animation: none; }
  .trp__dobra::details-content { transition: none; }
}
</style>
