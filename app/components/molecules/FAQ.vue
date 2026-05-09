<!--
  MoleculesFAQ — componente oficial de perguntas frequentes da plataforma.

  PADRAO UNICO. Use sempre que precisar de uma seção de FAQ, em qualquer page
  (calculadoras, rankings, asset, home, pricing, guias). Antes era reescrito
  inline com markup divergente em ~30 lugares — este componente unifica.

  - Acessivel: <details>/<summary> nativos (keyboard, screen-reader, sem JS).
  - SEO: emite FAQPage JSON-LD via useHead quando `seo` for true (default).
    Multiplos FAQs na mesma page sao agregados num unico schema graph.
  - Estetica quiet: usa .quiet-card por baixo, chevron animado em primary,
    headings com peso/cor do reset global do main.css.
  - Brand-safe: zero hex hardcoded, tudo via CSS vars (sem flash em multi-mode).

  Uso minimo:
    <MoleculesFAQ
      :items="[
        { question: 'O que e juros compostos?', answer: 'Sao juros sobre juros...' },
        { question: 'Como simular?', answer: 'Use a calculadora acima...' },
      ]"
    />

  Uso com header customizado:
    <MoleculesFAQ
      eyebrow="DUVIDAS"
      title="Tudo que voce precisa saber"
      heading-level="h2"
      :items="faqItems"
    />

  Sem schema (caso a page ja tenha outro FAQ canonico):
    <MoleculesFAQ :items="..." :seo="false" />

  Pra answer com markup rico (links, listas, strong), use o slot `answer`:
    <MoleculesFAQ :items="items">
      <template #answer="{ item }">
        <p>Resposta com <strong>HTML</strong> rico, <a href="...">link</a>.</p>
      </template>
    </MoleculesFAQ>
-->
<template>
  <section
    :id="id"
    class="quiet-faq"
    :aria-labelledby="headingId"
  >
    <header v-if="eyebrow || title" class="quiet-faq__head">
      <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
      <component
        :is="headingLevel"
        v-if="title"
        :id="headingId"
      >{{ title }}</component>
    </header>

    <ul class="quiet-faq__list" role="list">
      <li
        v-for="(item, idx) in items"
        :key="idx"
        class="quiet-faq__item"
      >
        <details class="quiet-faq__details">
          <summary class="quiet-faq__summary">
            <span class="quiet-faq__question">{{ item.question }}</span>
            <UIcon
              name="i-lucide-chevron-down"
              class="quiet-faq__chevron"
              aria-hidden="true"
            />
          </summary>
          <div class="quiet-faq__answer">
            <slot name="answer" :item="item" :index="idx">
              <p>{{ item.answer }}</p>
            </slot>
          </div>
        </details>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
interface FAQItem {
  question: string
  answer: string
}

const props = withDefaults(
  defineProps<{
    /** Lista de perguntas e respostas. Obrigatorio. */
    items: FAQItem[]
    /** Titulo da seção. Default 'Perguntas Frequentes'. Passe '' pra ocultar. */
    title?: string
    /** Texto pequeno em UPPERCASE amber acima do titulo. Opcional. */
    eyebrow?: string
    /** Tag do titulo. Default h2. Use h3 se ja houver h2 na seção pai. */
    headingLevel?: 'h2' | 'h3'
    /** Emite FAQPage JSON-LD pra SEO. Default true. */
    seo?: boolean
    /** id da section (anchor link). Default `faq-{random}`. */
    id?: string
  }>(),
  {
    title: 'Perguntas Frequentes',
    eyebrow: '',
    headingLevel: 'h2',
    seo: true,
    id: undefined,
  }
)

const uid = useId()
const headingId = computed(() => `${props.id || uid}-title`)

// SEO: FAQPage schema. Multiplos FAQs na mesma rota agregam via key dinamica
// (Nuxt useHead deduplica por key igual). Cada FAQ vira um <script ld+json>
// proprio, o que e valido (Google aceita multiplos FAQPage no mesmo doc).
if (props.seo) {
  useHead(() => ({
    script: [
      {
        key: `faq-jsonld-${uid}`,
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: props.items.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        }),
      },
    ],
  }))
}
</script>

<style scoped>
.quiet-faq {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.quiet-faq__head {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quiet-faq__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.quiet-faq__item {
  list-style: none;
}

.quiet-faq__details {
  background: var(--bg-elevated, var(--brand-surface));
  border: 1px solid var(--border-subtle, var(--brand-border));
  border-radius: 8px;
  transition: border-color 200ms ease-out, box-shadow 200ms ease-out;
}

.quiet-faq__details[open] {
  border-color: var(--border-default, var(--brand-border));
  box-shadow: var(--shadow-card, none);
}

.quiet-faq__details:hover {
  border-color: var(--border-default, var(--brand-border));
}

.quiet-faq__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  cursor: pointer;
  list-style: none;
  font-weight: 500;
  font-size: 0.9375rem;
  line-height: 1.4;
  color: var(--text-heading, var(--brand-text));
  letter-spacing: -0.005em;
  user-select: none;
}

.quiet-faq__summary::-webkit-details-marker {
  display: none;
}

.quiet-faq__summary:focus-visible {
  outline: none;
  box-shadow: var(--shadow-ring-focus);
  border-radius: 8px;
}

.quiet-faq__question {
  flex: 1;
  text-wrap: pretty;
}

.quiet-faq__chevron {
  flex-shrink: 0;
  width: 1.125rem;
  height: 1.125rem;
  color: var(--brand-primary);
  transition: transform 200ms ease-out;
}

.quiet-faq__details[open] .quiet-faq__chevron {
  transform: rotate(180deg);
}

.quiet-faq__answer {
  padding: 0 1.25rem 1.125rem 1.25rem;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--text-body, var(--brand-text-muted));
}

/* Garante spacing entre paragrafos no slot rico */
.quiet-faq__answer :deep(p) {
  margin: 0;
}
.quiet-faq__answer :deep(p + p) {
  margin-top: 0.75rem;
}
.quiet-faq__answer :deep(ul),
.quiet-faq__answer :deep(ol) {
  margin: 0.5rem 0 0 1.25rem;
  padding: 0;
}
.quiet-faq__answer :deep(li + li) {
  margin-top: 0.25rem;
}
.quiet-faq__answer :deep(strong) {
  color: var(--text-heading, var(--brand-text));
  font-weight: 500;
}
.quiet-faq__answer :deep(a) {
  color: var(--brand-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* Reduce motion: kill chevron rotation */
@media (prefers-reduced-motion: reduce) {
  .quiet-faq__chevron {
    transition: none;
  }
}
</style>
