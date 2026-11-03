<script setup lang="ts">
// Os indicadores das direções do /asset: o mesmo perfil e os mesmos cartões do
// AcaoFundamentals, sem card dentro de card. `tabela` é uma lista densa
// (indicador · valor · leitura), para caber num cartão ou numa coluna de
// leitura; `grade` são tiles soltos sobre a banda, com o anel de 1 px.
// A nota da Redentia AI vira uma linha com aspas, e o "Perguntar" abre o painel
// do chat com a nota anexada (o href /busca fica para quem está sem JS).
import type { AcaoFundCard, AcaoPerfilRow } from '~/types/acao'

const props = withDefaults(defineProps<{
  perfil: AcaoPerfilRow[]
  cartoes: AcaoFundCard[]
  forma?: 'tabela' | 'grade'
}>(), { forma: 'tabela' })
const sobre = useSobreDoContexto()
const painel = useChatPainel()
const metricas = computed(() => props.cartoes.filter((c) => c.kind === 'metric'))
const notas = computed(() => props.cartoes.filter((c) => c.kind === 'insight'))
const ctxNota = (texto: string, i: number) => ({ id: `nota:${sobre.value}:${i}`, tipo: 'secao', rotulo: rotuloComSobre('Nota da Redentia AI', sobre.value), texto })
function perguntar(texto: string, i: number) {
  painel.abrir(undefined, [{ ...ctxNota(texto, i), rota: useRoute().path }])
}
</script>

<template>
  <div class="ain" :class="`ain--${forma}`">
    <ul v-if="perfil.length" class="ain__perfil">
      <li
        v-for="p in perfil" :key="p.name"
        v-contexto-chat="{ id: `perfil:${sobre}:${p.name}`, tipo: 'grafico', rotulo: rotuloComSobre(p.name, sobre), texto: `${p.name}${sobre ? ` (${sobre})` : ''}: ${p.tag.text}` }"
        class="ain__dim"
      >
        <span class="ain__dim-n">{{ p.name }}</span>
        <span class="ain__tag" :class="`ain__tag--${p.tag.variant}`">{{ p.tag.text }}</span>
      </li>
    </ul>

    <ul class="ain__lista">
      <li
        v-for="c in metricas" :key="c.kind === 'metric' ? c.label : ''"
        v-contexto-chat="c.kind === 'metric' ? { id: `metrica:${sobre}:${c.label}`, tipo: 'grafico', rotulo: rotuloComSobre(c.label, sobre), texto: [`${c.label}${sobre ? ` (${sobre})` : ''}: ${c.value}`, c.tag?.text].filter(Boolean).join('\n') } : null"
        class="ain__m"
      >
        <template v-if="c.kind === 'metric'">
          <span class="ain__m-l">{{ c.label }}</span>
          <span class="ain__m-v">{{ c.value }}</span>
          <span v-if="c.tag" class="ain__tag" :class="`ain__tag--${c.tag.variant}`">{{ c.tag.text }}</span>
        </template>
      </li>
    </ul>

    <div v-if="notas.length" class="ain__notas">
      <figure v-for="(n, i) in notas" :key="i" v-contexto-chat="n.kind === 'insight' ? ctxNota(n.insight, i) : null" class="ain__nota">
        <template v-if="n.kind === 'insight'">
          <figcaption class="ain__nota-r">Redentia AI</figcaption>
          <blockquote class="ain__nota-t">{{ n.insight }}</blockquote>
          <NuxtLink :to="n.href" class="ain__nota-cta" @click.prevent="perguntar(n.insight, i)">
            {{ n.cta }}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
          </NuxtLink>
        </template>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.ain__perfil { list-style: none; margin: 0 0 20px; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.ain__dim { display: inline-flex; align-items: center; gap: 8px; height: 34px; padding: 0 6px 0 14px; border-radius: var(--nu-r-pill); background: var(--nu-cream); }
.ain__dim-n { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 600; }
.ain__tag { display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: var(--nu-r-pill); font-size: var(--nu-fs-xs); font-weight: 700; white-space: nowrap; }
.ain__tag--green { background: var(--nu-green-bg); color: var(--nu-green-2); }
.ain__tag--amber { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.ain__tag--gray { background: var(--nu-sand-2); color: var(--nu-gray-tag); }

.ain__lista { list-style: none; margin: 0; padding: 0; }
/* tabela: indicador · valor · leitura, uma linha por número */
.ain--tabela .ain__m { display: grid; grid-template-columns: minmax(0, 1fr) auto 96px; align-items: center; gap: 16px; min-height: 48px; border-top: 1px solid var(--nu-cream-line); }
.ain--tabela .ain__m:last-child { border-bottom: 1px solid var(--nu-cream-line); }
.ain--tabela .ain__m-l { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; }
.ain--tabela .ain__m-v { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 600; font-variant-numeric: tabular-nums; text-align: right; }
.ain--tabela .ain__m .ain__tag { justify-self: end; }
/* grade: tiles soltos sobre a banda (um plano só) */
.ain--grade .ain__lista { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr)); gap: 12px; }
.ain--grade .ain__m {
  display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 18px 20px; border-radius: var(--nu-r-tile);
  background: var(--nu-white); box-shadow: 0 0 0 1px var(--nu-cream-line);
}
.ain--grade .ain__m-l { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; }
.ain--grade .ain__m-v { color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 600; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }

.ain__notas { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 12px 28px; margin-top: 24px; }
.ain__nota { margin: 0; padding-left: 16px; border-left: 2px solid var(--nu-blue); }
.ain__nota-r { color: var(--nu-blue-text); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.ain__nota-t { margin: 6px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
.ain__nota-cta { display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; }
.ain__nota-cta:hover { color: var(--nu-blue-hover); }
@media (max-width: 520px) {
  .ain--tabela .ain__m { grid-template-columns: minmax(0, 1fr) auto; gap: 4px 12px; padding: 10px 0; }
  .ain--tabela .ain__m .ain__tag { grid-column: 2; }
}
</style>
