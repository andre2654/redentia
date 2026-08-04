<script setup lang="ts">
/**
 * Prosa editorial do ativo: "Sobre", tese, riscos, comparação com pares,
 * história e FAQ visível.
 *
 * POR QUE ESTA SEÇÃO EXISTE. O conteúdo já estava escrito, pago e persistido
 * (tabela asset_editorials, 41 tickers com seeder) e já era buscado no SSR
 * (useAcao.ts, acaoFetchEditorial). O site renderizava 220 caracteres dele, e a
 * FAQ de 8 perguntas vivia SÓ dentro do JSON-LD, sem texto visível
 * correspondente. Em 03/08/2026 o Search Console reportava 1.708 URLs em
 * "Rastreada, mas não indexada", e /asset é 86% do sitemap servindo 206 a 648
 * palavras por página. Este componente é o cano que liga o conteúdo à página.
 *
 * Renderiza SEM v-html: o corpo vem do banco e é texto puro, então quebra em
 * parágrafos por linha em branco e cada trecho vira {{ }}. Nunca trocar por
 * v-html sem passar por escapeHtml (app/utils/format.ts) — isso aqui é conteúdo
 * gerado por LLM e persistido, exatamente o tipo de fonte em que injeção passa.
 *
 * A FAQ usa NuFaqAccordion, que emite o FAQPage por conta própria. Por isso o
 * bloco manual de FAQPage saiu de asset/[ticker].vue: dois FAQPage na mesma
 * página é schema duplicado.
 */
import type { AcaoEditorialVM } from '~/types/acao'

const props = defineProps<{ ticker: string; editorial: AcaoEditorialVM }>()

/** Quebra a prosa longa em parágrafos (o gerador separa por linha em branco). */
function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

const updatedLine = computed(() => {
  if (!props.editorial.generatedAt) return null
  const d = new Date(props.editorial.generatedAt)
  if (Number.isNaN(d.getTime())) return null
  return `Análise de ${props.ticker} atualizada em ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`
})
</script>

<template>
  <section class="aed">
    <div class="aed__wrap">
      <article v-for="s in editorial.sections" :key="s.id" class="aed__block">
        <h2 class="aed__h2">{{ s.heading }}</h2>
        <p v-for="(p, i) in paragraphs(s.body)" :key="i" class="aed__p">{{ p }}</p>
      </article>

      <div v-if="editorial.faq.length" class="aed__faq">
        <h2 class="aed__h2">Perguntas frequentes sobre {{ ticker }}</h2>
        <NuFaqAccordion :items="editorial.faq" surface="white" />
      </div>

      <p v-if="updatedLine" class="aed__updated">{{ updatedLine }}</p>
    </div>
  </section>
</template>

<style scoped>
.aed {
  background: var(--nu-cream);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
/* Medida de leitura: prosa longa em coluna larga cansa. 68ch é a régua do
   corpo editorial dos /guias, mantida aqui pra o site ler igual. */
.aed__wrap { max-width: 68ch; }
.aed__block + .aed__block { margin-top: clamp(40px, 5vw, 64px); }
.aed__h2 {
  margin: 0; color: var(--nu-ink); font-size: clamp(26px, 3vw, 38px);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1.1;
}
.aed__p {
  color: var(--nu-gray); font-size: 17px; font-weight: 500;
  line-height: 1.65; margin: 18px 0 0;
}
.aed__faq { margin-top: clamp(48px, 6vw, 80px); }
.aed__faq .aed__h2 { margin-bottom: 26px; }
.aed__updated {
  margin: clamp(40px, 5vw, 64px) 0 0; color: var(--nu-gray);
  font-size: 14px; font-weight: 600; opacity: .8;
}
</style>
