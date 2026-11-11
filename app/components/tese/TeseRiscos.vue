<script setup lang="ts">
// "O que pode dar errado" (11/11/2026, docs/aportou/tese.md): a seção sálvia
// dos riscos. Com relatório, os riscos dele (`report.risks`) em lista
// numerada, um por linha. Sem relatório (ou para o visitante, que não recebe o
// relatório: a regra de 14/07/2026), o veredito de risco da tese. Ao lado, o
// que a Aportou acompanha (`monitoring`: o rótulo e o texto vêm da API) e o
// botão de acompanhar. Sem risco para mostrar, a página não monta a seção.
//
// O veredito de risco do visitante segue atrás do cadastro, como antes:
// embaçado, fora da leitura de tela, com o texto no HTML.
import type { TeseMonitoringVM, TeseVerdictVM } from '~/types/tese'

const props = defineProps<{
  /** os riscos do relatório, em HTML já escapado; [] quando não há (ou é visitante) */
  risksHtml: string[]
  /** o veredito de `kind: 'risco'` (usado quando não há a lista do relatório) */
  risco: TeseVerdictVM | null
  monitoring: TeseMonitoringVM | null
  trancado: boolean
  following: boolean
  pending: boolean
}>()
const emit = defineEmits<{ acompanhar: [] }>()
// o sujeito do chip do chat (proverSobreDoContexto na página)
const sobre = useSobreDoContexto()

const idx = (i: number) => String(i + 1).padStart(2, '0')
const daLista = computed(() => props.risksHtml.length > 0)
</script>

<template>
  <section id="riscos" class="trs">
    <div class="trs__esq">
      <NuEyebrow como="p" sobre="salvia">Riscos</NuEyebrow>
      <h2 class="trs__h2">O que pode dar errado.</h2>
    </div>

    <div class="trs__dir">
      <ol v-if="daLista" class="trs__lista">
        <li
          v-for="(b, i) in risksHtml" :key="i"
          v-contexto-chat="{ id: `tese-risco:${sobre}:${i}`, tipo: 'tese', rotulo: rotuloCurto(`Risco ${i + 1} · ${sobre}`) }"
          class="trs__risco" :style="{ '--i': i }"
        >
          <span class="trs__n" aria-hidden="true">{{ idx(i) }}</span>
          <!-- eslint-disable-next-line vue/no-v-html — HTML escapado no composable -->
          <span class="trs__t" v-html="b" />
        </li>
      </ol>
      <div v-else-if="risco" class="trs__central">
        <p class="trs__central-topo">
          <TeseSelo tom="ambar">Risco central</TeseSelo>
          <svg v-if="trancado" class="trs__cadeado" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-label="Abre com a conta grátis" role="img"><rect x="4.5" y="10.5" width="15" height="10" rx="2.6" /><path d="M8 10.5V7.6a4 4 0 0 1 8 0v2.9" /></svg>
        </p>
        <div :class="{ 'trs__trancado': trancado }" :aria-hidden="trancado || undefined">
          <h3 v-if="risco.title" class="trs__central-t">{{ risco.title }}</h3>
          <p class="trs__central-p">{{ risco.body }}</p>
        </div>
      </div>
    </div>

    <aside class="trs__vigia">
      <template v-if="monitoring">
        <h3 class="trs__vigia-r"><MarcaCorte :largura="20" />{{ monitoring.eyebrow || 'O que a Aportou acompanha' }}</h3>
        <p class="trs__vigia-p">{{ monitoring.body }}</p>
      </template>
      <p class="trs__vigia-m"><i class="trs__ponto" aria-hidden="true" />Monitorado na revalidação diária</p>
      <NuBotaoSeta
        :variante="following ? 'contorno' : 'carvao'" tamanho="m" :aria-pressed="following" :aria-busy="pending || undefined"
        class="trs__botao" @click="emit('acompanhar')"
      >{{ following ? 'Acompanhando' : (monitoring?.ctaLabel || 'Acompanhar esta tese') }}</NuBotaoSeta>
    </aside>
  </section>
</template>

<style scoped>
.trs {
  background: var(--nu-sage); color: var(--nu-ink); scroll-margin-top: 120px;
  padding: clamp(56px, 5.6vw, 80px) max(clamp(20px, 4vw, 56px), calc((100% - 1240px) / 2));
  /* no celular: o título, os riscos e, por último, o que a Aportou acompanha */
  display: grid; grid-template-columns: minmax(0, 1fr); grid-template-areas: "cab" "dir" "vigia"; gap: clamp(24px, 3vw, 32px) clamp(36px, 5vw, 88px);
}
.trs__esq { grid-area: cab; min-width: 0; animation: nu-fade .5s ease both; }
.trs__h2 { margin: 18px 0 0; font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display); letter-spacing: -0.03em; line-height: 1.02; text-wrap: balance; }
.trs__dir { grid-area: dir; min-width: 0; }

/* a lista numerada: um risco por linha, sobre um fio */
.trs__lista { list-style: none; margin: 0; padding: 0; border-bottom: 1px solid var(--nu-sage-line); }
.trs__risco {
  display: flex; align-items: baseline; gap: clamp(14px, 2vw, 24px); padding: 16px 0; border-top: 1px solid var(--nu-sage-line);
  animation: nu-fade .5s ease both; animation-delay: calc(var(--i, 0) * 60ms);
}
.trs__n { flex: none; min-width: 1.6em; font-size: clamp(24px, 2.4vw, 32px); font-weight: var(--nu-w-forte); letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums; }
.trs__t { font-size: clamp(16.5px, 1.3vw, 18px); font-weight: 600; line-height: 1.5; text-wrap: pretty; }
.trs__t :deep(.tse-hi) { font-weight: var(--nu-w-forte); }

/* sem a lista do relatório: o veredito de risco */
.trs__central { padding-top: 22px; border-top: 3px solid var(--nu-ink); }
.trs__central-topo { display: flex; align-items: center; gap: 12px; margin: 0; }
.trs__cadeado { flex: none; }
.trs__central-t { margin: 18px 0 0; font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); letter-spacing: -0.025em; line-height: 1.05; }
.trs__central-p { margin: 12px 0 0; max-width: 60ch; font-size: clamp(17px, 1.4vw, 19px); font-weight: 500; line-height: 1.5; }
.trs__trancado { filter: blur(7px); opacity: .55; pointer-events: none; user-select: none; }

/* o que a Aportou acompanha: o cartão creme */
.trs__vigia {
  grid-area: vigia; align-self: start; min-width: 0; background: var(--nu-card); border-radius: var(--nu-r-card);
  box-shadow: var(--nu-shadow-quente); padding: clamp(22px, 2.4vw, 30px); animation: nu-fade .5s ease .12s both;
}
.trs__vigia-r { display: flex; align-items: center; gap: 10px; margin: 0; font-size: 13.5px; font-weight: var(--nu-w-medio); letter-spacing: .16em; line-height: 1.3; text-transform: uppercase; }
.trs__vigia-p { margin: 14px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; text-wrap: pretty; }
.trs__vigia-m { display: flex; align-items: center; gap: 8px; margin: 16px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 600; }
.trs__vigia > .trs__vigia-m:first-child { margin-top: 0; }
.trs__ponto { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-green); }
.trs__botao { margin-top: 20px; }

/* no computador: o título e o cartão à esquerda, os riscos à direita */
@media (min-width: 1000px) {
  .trs { grid-template-columns: minmax(0, .72fr) minmax(0, 1fr); grid-template-areas: "cab dir" "vigia dir"; grid-template-rows: auto 1fr; align-items: start; }
}
@media (prefers-reduced-motion: reduce) { .trs__esq, .trs__risco, .trs__vigia { animation: none; } }
</style>
