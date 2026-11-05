<script setup lang="ts">
// Tipo 1 dos achados, "A leitura da Redentia" (05/11/2026, no dev por
// ?achados=1). Nasce do texto editorial do /asset (AtivoProsa: o corpo em
// cinza-tinta, sem cartão) e do veredito da HomeAgora ("Caiu menos que a
// bolsa."): um parágrafo só, na voz do agente, em tamanho de título. Os
// números ficam em tinta cheia dentro do texto, e cada um é uma pergunta: o
// clique abre o painel do chat sobre ele. A análise antiga é uma frase à
// parte, menor, com a data e os dias.
// As palavras surgem do desfoque (a keyframe nu-palavra do chat) só com CSS:
// cada uma leva o atraso dela no HTML do servidor, e a animação roda quando o
// navegador pinta a página, sem esperar o JS (a hidratação reaproveita os
// mesmos nós e não a reinicia). Sem JS, o texto surge do mesmo jeito; nada
// some depois de aparecer. Movimento reduzido: o texto direto.
import type { AchadosVM } from '~/utils/achadosDaCarteira'
import type { RaioXMetricVM } from '~/types/carteira'
import { leituraDosAchados, type Trecho } from '~/utils/achadosNaTela'
import { agendarPalavras } from '~/utils/revelar-palavras'

const props = defineProps<{ vm: AchadosVM; metricas: RaioXMetricVM[]; selo: string | null; acoes: string[]; mascarar: (t: string) => string }>()
const emit = defineEmits<{ perguntar: [string]; agir: [string] }>()

const leitura = computed(() => leituraDosAchados(props.vm, props.metricas, props.mascarar))

/** cada trecho em palavras, com a hora de cada uma (a mesma fila do chat: 38 ms, nunca além de 900 ms) */
interface Palavra { w: string; d: number; espaco: boolean }
function emPalavras(trechos: Trecho[], desde: number, agenda: number[]) {
  let i = desde
  return trechos.map((tr) => {
    const partes = tr.t.split(/(\s+)/).filter((x) => x !== '')
    const palavras: Palavra[] = []
    for (const p of partes) {
      if (/^\s+$/.test(p)) { if (palavras.length) palavras[palavras.length - 1]!.espaco = true; else palavras.push({ w: '', d: 0, espaco: true }); continue }
      palavras.push({ w: p, d: Math.round(agenda[i++] ?? 0), espaco: false })
    }
    return { ...tr, palavras }
  })
}
const blocos = computed(() => {
  const contar = (ts: Trecho[]) => ts.reduce((s, t) => s + (t.t.match(/\S+/g)?.length ?? 0), 0)
  const nHoje = contar(leitura.value.hoje)
  const total = nHoje + (leitura.value.antiga ? contar(leitura.value.antiga) : 0)
  const agenda = agendarPalavras([], total, 0, { atrasoMax: 1100 })
  return { hoje: emPalavras(leitura.value.hoje, 0, agenda), antiga: leitura.value.antiga ? emPalavras(leitura.value.antiga, nHoje, agenda) : null }
})

</script>

<template>
  <div class="cal">
    <div class="cal__topo">
      <span class="cal__assinatura"><img src="/logo-azul.svg" alt="" width="14" height="14">Redentia AI</span>
      <span v-if="selo" class="cal__selo">{{ selo }}</span>
    </div>

    <p class="cal__texto">
      <template v-for="(tr, k) in blocos.hoje" :key="k">
        <button
          v-if="tr.pergunta" type="button" class="cal__num" :class="`cal__num--${tr.tom}`" data-hover data-pergunta
          :title="`Perguntar à Redentia sobre ${tr.t}`" :style="{ '--d0': `${tr.palavras.find((p) => p.w)?.d ?? 0}ms` }" @click="emit('perguntar', tr.pergunta)"
        ><template v-for="(p, j) in tr.palavras" :key="j"><span v-if="p.w" class="rp" :style="{ '--d': `${p.d}ms` }">{{ p.w }}</span>{{ p.espaco && j < tr.palavras.length - 1 ? ' ' : '' }}</template></button><template v-if="tr.pergunta && tr.palavras[tr.palavras.length - 1]?.espaco">{{ ' ' }}</template>
        <template v-else-if="!tr.pergunta"><template v-for="(p, j) in tr.palavras" :key="j"><span v-if="p.w" class="rp" :style="{ '--d': `${p.d}ms` }">{{ p.w }}</span>{{ p.espaco ? ' ' : '' }}</template></template>
      </template>
    </p>

    <p v-if="blocos.antiga" class="cal__antiga">
      <template v-for="(tr, k) in blocos.antiga" :key="k">
        <button
          v-if="tr.pergunta" type="button" class="cal__num cal__num--antigo" data-pergunta
          :title="`Perguntar à Redentia sobre ${tr.t}`" :style="{ '--d0': `${tr.palavras.find((p) => p.w)?.d ?? 0}ms` }" @click="emit('perguntar', tr.pergunta)"
        ><template v-for="(p, j) in tr.palavras" :key="j"><span v-if="p.w" class="rp" :style="{ '--d': `${p.d}ms` }">{{ p.w }}</span>{{ p.espaco && j < tr.palavras.length - 1 ? ' ' : '' }}</template></button><template v-if="tr.pergunta && tr.palavras[tr.palavras.length - 1]?.espaco">{{ ' ' }}</template>
        <template v-else-if="!tr.pergunta"><template v-for="(p, j) in tr.palavras" :key="j"><span v-if="p.w" class="rp" :style="{ '--d': `${p.d}ms` }">{{ p.w }}</span>{{ p.espaco ? ' ' : '' }}</template></template>
      </template>
    </p>

    <AtivoPerguntaChips :perguntas="acoes" tom="claro" :rotulo="null" class="cal__acoes" @perguntar="emit('agir', $event)" />
  </div>
</template>

<style scoped>
/* as margens do conteúdo do topo (a mesma conta do AtivoResumo) */
.cal { --m: max(var(--g, 22px), calc((100% - 1180px) / 2)); padding: clamp(28px, 3.4vw, 44px) var(--m) 0; }
.cal__topo { display: flex; align-items: center; justify-content: space-between; gap: 8px 16px; flex-wrap: wrap; }
.cal__assinatura {
  display: inline-flex; align-items: center; gap: 7px; height: 28px; padding: 0 12px 0 9px; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap;
}
.cal__selo { color: var(--nu-amber-text); font-size: var(--nu-fs-sm); font-weight: 600; }

/* o parágrafo: o corpo do AtivoProsa no tamanho do veredito da HomeAgora; a
   tinta a 75% no texto e a 100% nos números */
.cal__texto {
  margin: 18px 0 0; max-width: 34em; color: var(--nu-gray-3); font-size: var(--nu-fs-h3); font-weight: 500;
  letter-spacing: -0.02em; line-height: 1.42; font-variant-numeric: tabular-nums; text-wrap: pretty;
}
.cal__antiga { margin: 18px 0 0; max-width: 62ch; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.6; text-wrap: pretty; }

/* o número em destaque: tinta cheia, o tom só nele, o sublinhado que acende no hover */
.cal__num {
  display: inline; margin: 0; padding: 0; border: 0; background: none; cursor: pointer; font: inherit; letter-spacing: inherit;
  color: var(--nu-ink); font-weight: 700; border-radius: 6px;
  /* o sublinhado é um fundo (as palavras são inline-block: o text-decoration não chegaria nelas) */
  --sub: var(--nu-cream-line);
  background: linear-gradient(var(--sub), var(--sub)) 0 calc(100% - .04em) / 100% 2px no-repeat;
  -webkit-box-decoration-break: clone; box-decoration-break: clone;
  transition: color .2s ease, background-color .2s ease, box-shadow .2s ease;
}
.cal__num--atencao { color: var(--nu-amber-text); }
.cal__num--ok { color: var(--nu-green-text); }
.cal__num--antigo { color: var(--nu-gray-2); font-weight: 600; background-size: 100% 1px; }
.cal__num:hover { --sub: currentColor; color: var(--nu-blue-text); background-color: var(--nu-blue-bg); box-shadow: 0 0 0 3px var(--nu-blue-bg); }
.cal__num:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

.cal__acoes { margin-top: 24px; }

/* as palavras saindo do desfoque, como no chat; o primeiro quadro é o da pintura da página */
.cal .rp { display: inline-block; animation: nu-palavra .52s cubic-bezier(.22, 1, .36, 1) backwards; animation-delay: calc(var(--d, 0ms) + 120ms); }
/* o sublinhado do número corre da esquerda quando a primeira palavra dele chega */
.cal__num { animation: cal-sub .6s cubic-bezier(.22, 1, .36, 1) backwards; animation-delay: calc(var(--d0, 0ms) + 260ms); }
@keyframes cal-sub { from { background-size: 0 2px; } }

@media (max-width: 560px) {
  .cal__texto { font-size: var(--nu-fs-xl); line-height: 1.5; }
}
@media (prefers-reduced-motion: reduce) {
  .cal__num { transition: none; }
  .cal .rp, .cal__num { animation: none; }
}
</style>
