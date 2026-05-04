<script setup lang="ts">
/**
 * Conteudo editorial do ativo (Tese, Comparacao, Trajetoria, FAQ).
 * Vive dentro do card "Sobre a empresa" da page asset/[ticker].vue,
 * entao o visual e contido (sem padding-left de 80px, sem numeracao
 * romana sidebar, sem gap exagerado).
 *
 * Cada secao e separada da anterior por um border-top sutil + spacing,
 * formando uma "ficha narrativa" continua dentro do mesmo card.
 *
 * Aderencia ao redentia-stripe-style:
 *   - lightness e luxo, headings weight 300
 *   - tabular-nums em todo numero
 *   - amber pontual (eyebrow, sign +/−, pull quote, anos)
 *   - tokens semanticos var(--brand-text/--brand-text-muted/--brand-border)
 */

interface FaqItem {
  question: string
  answer: string
}

interface Editorial {
  ticker: string
  description: string | null
  thesis_pros: string | null
  thesis_cons: string | null
  peers_comparison: string | null
  history_summary: string | null
  faq_extended: FaqItem[] | null
}

const props = defineProps<{
  editorial: Editorial
  tickerUpper: string
  assetName: string
}>()

function paragraphs(raw: string | null): string[] {
  if (!raw) return []
  return raw.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
}

const prosParagraphs = computed(() => paragraphs(props.editorial.thesis_pros))
const consParagraphs = computed(() => paragraphs(props.editorial.thesis_cons))
const peersParagraphs = computed(() => paragraphs(props.editorial.peers_comparison))
const faqs = computed(() => props.editorial.faq_extended ?? [])

const milestones = computed(() => {
  const ps = paragraphs(props.editorial.history_summary)
  return ps.map((text) => {
    const m = text.match(/\b(19\d{2}|20\d{2})\b/)
    return { year: m ? m[1] : '', text }
  })
})

const peersPullQuote = computed(() => {
  const ps = paragraphs(props.editorial.peers_comparison)
  for (const p of ps) {
    const sentences = p.split(/(?<=[.!?])\s+/)
    for (const s of sentences) {
      if (/\d/.test(s) && s.length > 40 && s.length < 200) return s.trim()
    }
  }
  return null
})

function shortHeading(): string {
  const name = props.assetName || props.tickerUpper
  const base = name.split(/\s+/)[0]
  if (!base) return name
  return base.charAt(0) + base.slice(1).toLowerCase()
}
</script>

<template>
  <article class="asset-editorial">
    <!-- ============ TESE — 2 cols sem card ============ -->
    <section v-if="prosParagraphs.length || consParagraphs.length" class="ed-section">
      <header class="ed-header">
        <span class="eyebrow">Tese de investimento</span>
        <h2 class="ed-heading">Os dois lados de {{ tickerUpper }}</h2>
      </header>

      <div class="thesis">
        <div class="thesis__col">
          <div class="thesis__label thesis__label--pro">
            <span class="thesis__sign" aria-hidden="true">+</span>
            <span>A favor</span>
          </div>
          <div class="thesis__body">
            <p v-for="(p, idx) in prosParagraphs" :key="`pro-${idx}`">{{ p }}</p>
          </div>
        </div>

        <div class="thesis__col">
          <div class="thesis__label thesis__label--con">
            <span class="thesis__sign" aria-hidden="true">−</span>
            <span>Contra</span>
          </div>
          <div class="thesis__body">
            <p v-for="(p, idx) in consParagraphs" :key="`con-${idx}`">{{ p }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ COMPARACAO — prose + pull quote ============ -->
    <section v-if="peersParagraphs.length" class="ed-section">
      <header class="ed-header">
        <span class="eyebrow">Comparação</span>
        <h2 class="ed-heading">Como {{ tickerUpper }} se posiciona</h2>
      </header>
      <div class="ed-prose">
        <p v-for="(p, idx) in peersParagraphs" :key="idx" class="ed-paragraph">{{ p }}</p>
      </div>
      <figure v-if="peersPullQuote" class="pullquote">
        <span class="pullquote__mark" aria-hidden="true">“</span>
        <blockquote>{{ peersPullQuote }}</blockquote>
      </figure>
    </section>

    <!-- ============ TRAJETORIA — ano kicker compacto ============ -->
    <section v-if="milestones.length" class="ed-section">
      <header class="ed-header">
        <span class="eyebrow">Trajetória</span>
        <h2 class="ed-heading">A história de {{ shortHeading() }}</h2>
      </header>
      <div class="trajectory">
        <article v-for="(m, idx) in milestones" :key="idx" class="trajectory__item">
          <span class="trajectory__year">{{ m.year || '·' }}</span>
          <p class="trajectory__text">{{ m.text }}</p>
        </article>
      </div>
    </section>

    <!-- ============ FAQ ============ -->
    <section v-if="faqs.length" class="ed-section">
      <header class="ed-header">
        <span class="eyebrow">Perguntas frequentes</span>
        <h2 class="ed-heading">Dúvidas sobre {{ tickerUpper }}</h2>
      </header>
      <div class="faq">
        <details
          v-for="(faq, idx) in faqs"
          :key="idx"
          class="faq__item"
        >
          <summary class="faq__summary">
            <span>{{ faq.question }}</span>
            <UIcon
              name="i-lucide-chevron-down"
              class="faq__chevron"
              aria-hidden="true"
            />
          </summary>
          <p class="faq__answer">{{ faq.answer }}</p>
        </details>
      </div>
    </section>
  </article>
</template>

<style scoped>
/* Componente vive dentro do card "Sobre a empresa" (border + p-6).
   Cada secao se separa da anterior por border-top + padding-top
   ao inves de margin/gap exagerado, criando ritmo editorial
   continuo dentro do mesmo container. */
.asset-editorial {
  display: flex;
  flex-direction: column;
  margin-top: 40px;
}

.ed-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 40px;
  border-top: 1px solid var(--brand-border, #E4E7EC);
}

.ed-section:first-child {
  padding-top: 32px;
}

.ed-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ed-heading {
  color: var(--brand-text);
  font-family: var(--brand-font, inherit);
  font-weight: 300;
  font-size: clamp(22px, 2.4vw, 28px);
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 0;
}

/* ============ ED-PROSE — prose flow ============ */
.ed-prose {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ed-paragraph {
  color: var(--brand-text-muted);
  font-size: 15.5px;
  line-height: 1.7;
  font-weight: 400;
  margin: 0;
}

/* ============ TESE — 2 cols paralelas ============ */
.thesis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px 48px;
}

@media (max-width: 768px) {
  .thesis {
    grid-template-columns: 1fr;
    gap: 36px;
  }
}

.thesis__col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.thesis__label {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--brand-border, #E4E7EC);
  font-family: var(--brand-font, inherit);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--brand-text);
}

.thesis__sign {
  font-size: 20px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: 0;
}

.thesis__label--pro .thesis__sign {
  color: var(--brand-positive);
}

.thesis__label--con .thesis__sign {
  color: var(--brand-negative);
}

.thesis__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--brand-text-muted);
  font-size: 15px;
  line-height: 1.65;
}

.thesis__body p {
  margin: 0;
}

/* ============ PULL QUOTE — proporcional ao card ============ */
.pullquote {
  position: relative;
  margin: 8px 0 0;
  padding: 4px 0 4px 56px;
}

.pullquote__mark {
  position: absolute;
  left: 0;
  top: -8px;
  font-family: 'Instrument Serif', 'Georgia', serif;
  font-style: italic;
  font-size: 64px;
  line-height: 1;
  color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
  pointer-events: none;
}

.pullquote blockquote {
  margin: 0;
  font-family: 'Instrument Serif', 'Georgia', serif;
  font-style: italic;
  font-weight: 400;
  font-size: clamp(19px, 1.8vw, 22px);
  line-height: 1.4;
  letter-spacing: -0.005em;
  color: var(--brand-text);
}

/* ============ TRAJETORIA — compact timeline ============ */
.trajectory {
  display: flex;
  flex-direction: column;
}

.trajectory__item {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 24px;
  padding: 20px 0;
  border-top: 1px solid var(--brand-border, #E4E7EC);
  align-items: baseline;
}

.trajectory__item:first-child {
  border-top: 0;
  padding-top: 4px;
}

@media (max-width: 640px) {
  .trajectory__item {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 18px 0;
  }
}

.trajectory__year {
  font-family: var(--brand-font, inherit);
  font-weight: 300;
  font-size: clamp(28px, 2.8vw, 36px);
  line-height: 1;
  letter-spacing: -0.025em;
  color: var(--brand-primary);
  font-variant-numeric: tabular-nums;
}

.trajectory__text {
  margin: 0;
  color: var(--brand-text-muted);
  font-size: 15.5px;
  line-height: 1.7;
}

/* ============ FAQ ============ */
.faq {
  display: flex;
  flex-direction: column;
}

.faq__item {
  border-top: 1px solid var(--brand-border, #E4E7EC);
  padding: 18px 0;
}

.faq__item:first-child {
  border-top: 0;
  padding-top: 4px;
}

.faq__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  cursor: pointer;
  list-style: none;
  font-size: 15.5px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--brand-text);
  transition: color 150ms ease-out;
}

.faq__summary::-webkit-details-marker {
  display: none;
}

.faq__summary:hover {
  color: var(--brand-primary);
}

.faq__chevron {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--brand-text-muted);
  transition: transform 200ms ease-out, color 150ms ease-out;
}

.faq__item[open] .faq__chevron {
  transform: rotate(180deg);
  color: var(--brand-primary);
}

.faq__answer {
  margin: 12px 0 0;
  color: var(--brand-text-muted);
  font-size: 14.5px;
  line-height: 1.7;
}
</style>
