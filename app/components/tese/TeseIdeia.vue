<script setup lang="ts">
// "A ideia em 1 minuto" (11/11/2026, docs/aportou/tese.md): a faixa quente logo
// depois do topo. A frase da tese (`statementHtml`) em letra grande, com o
// trecho {mark} em cobalto; o complemento (`statementSubHtml`) como lead; e os
// três vereditos lado a lado, cada um com o selo do tipo (A favor, Sinal,
// Risco), o título em 800 e o corpo. Sem vereditos a seção mostra só a frase;
// sem frase, só os vereditos.
//
// O HTML dos parágrafos vem JÁ ESCAPADO do useTese ({mark} → .tse-hi).
//
// VISITANTE: a regra é a de antes (dono, 14/07/2026): a frase da tese é
// aberta; os vereditos ficam atrás do cadastro. O texto continua no HTML (como
// antes, embaçado e fora da leitura de tela); o selo do tipo e o cadeado ficam
// nítidos para dar o gancho.
import type { TeseEditorialVM, TeseVerdictVM } from '~/types/tese'

defineProps<{ editorial: TeseEditorialVM | null; verdicts: TeseVerdictVM[]; trancado: boolean }>()

const TIPO: Record<string, { rotulo: string; tom: 'verde' | 'azul' | 'ambar' }> = {
  favor: { rotulo: 'A favor', tom: 'verde' },
  sinal: { rotulo: 'Sinal', tom: 'azul' },
  risco: { rotulo: 'Risco', tom: 'ambar' },
}
const tipo = (kind: string) => TIPO[kind] ?? { rotulo: kind, tom: 'azul' as const }
</script>

<template>
  <section id="ideia" class="tid">
    <div class="tid__in">
      <NuEyebrow como="h2">A ideia em 1 minuto</NuEyebrow>
      <div v-if="editorial" class="tid__cols">
        <!-- eslint-disable vue/no-v-html — HTML escapado no composable -->
        <p class="tid__frase" v-html="editorial.paragraphsHtml[0]" />
        <div v-if="editorial.paragraphsHtml.length > 1" class="tid__apoio">
          <p v-for="(p, i) in editorial.paragraphsHtml.slice(1)" :key="i" class="tid__lead" v-html="p" />
        </div>
        <!-- eslint-enable vue/no-v-html -->
      </div>

      <ul v-if="verdicts.length" class="tid__vereditos" :class="{ 'tid__vereditos--so': !editorial }">
        <li v-for="(v, i) in verdicts" :key="`${v.kind}:${i}`" class="tid__v" :style="{ '--i': i }">
          <p class="tid__v-topo">
            <TeseSelo :tom="tipo(v.kind).tom">{{ tipo(v.kind).rotulo }}</TeseSelo>
            <svg v-if="trancado" class="tid__cadeado" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-label="Abre com a conta grátis" role="img"><rect x="4.5" y="10.5" width="15" height="10" rx="2.6" /><path d="M8 10.5V7.6a4 4 0 0 1 8 0v2.9" /></svg>
          </p>
          <div class="tid__v-corpo" :class="{ 'tid__v-corpo--trancado': trancado }" :aria-hidden="trancado || undefined">
            <h3 v-if="v.title" class="tid__v-t">{{ v.title }}</h3>
            <p class="tid__v-p">{{ v.body }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.tid {
  background: var(--nu-band); scroll-margin-top: 120px;
  padding: clamp(52px, 5.4vw, 76px) max(clamp(20px, 4vw, 56px), calc((100% - 1240px) / 2));
}
.tid__in { animation: nu-fade .5s ease both; }
/* a frase grande à esquerda, o complemento à direita (uma coluna no celular) */
.tid__cols { display: flex; align-items: flex-start; gap: 20px clamp(32px, 4.4vw, 72px); flex-wrap: wrap; margin-top: 22px; }
.tid__frase {
  flex: 1.2 1 440px; min-width: min(320px, 100%); margin: 0; color: var(--nu-ink);
  font-size: clamp(26px, 2.7vw, 38px); font-weight: var(--nu-w-display); letter-spacing: -0.025em; line-height: 1.18; text-wrap: pretty;
}
/* o trecho marcado: cobalto, como a FraseDestaque (sem fundo) */
.tid__frase :deep(.tse-hi) { color: var(--nu-blue-text); }
.tid__apoio { flex: 1 1 380px; min-width: min(300px, 100%); }
.tid__lead {
  margin: 0; max-width: 70ch; color: var(--nu-gray-3);
  font-size: clamp(16.5px, 1.3vw, 18px); font-weight: 500; line-height: 1.55; text-wrap: pretty;
}
.tid__lead + .tid__lead { margin-top: 14px; }
.tid__lead :deep(.tse-hi) { color: var(--nu-ink); font-weight: var(--nu-w-medio); }

.tid__vereditos {
  list-style: none; margin: clamp(28px, 3vw, 40px) 0 0; padding: 0;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 14px;
}
.tid__vereditos--so { margin-top: 26px; }
.tid__v {
  background: var(--nu-white); border-radius: var(--nu-r-panel); box-shadow: var(--nu-shadow-branco);
  padding: clamp(18px, 2vw, 24px);
  animation: nu-fade .5s ease both; animation-delay: calc(var(--i, 0) * 60ms + 120ms);
}
.tid__v-topo { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0; }
.tid__cadeado { flex: none; color: var(--nu-gray); }
.tid__v-t { margin: 14px 0 0; color: var(--nu-ink); font-size: clamp(20px, 1.8vw, 24px); font-weight: var(--nu-w-forte); letter-spacing: -0.02em; line-height: 1.15; }
.tid__v-p { margin: 8px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }
.tid__v-corpo:not(:has(.tid__v-t)) .tid__v-p { margin-top: 16px; }
/* visitante: o miolo fica atrás do cadastro (o texto segue no HTML, como antes) */
.tid__v-corpo--trancado { filter: blur(6px); opacity: .55; pointer-events: none; user-select: none; }

@media (prefers-reduced-motion: reduce) { .tid__in, .tid__v { animation: none; } }
</style>
