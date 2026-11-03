<script setup lang="ts">
// Os indicadores do /asset: o mesmo perfil e os mesmos cartões do useAcao, sem
// card dentro de card. `grade` são tiles soltos sobre a banda, com o anel de
// 1 px; `tabela` é uma lista densa (indicador · valor · leitura).
// Passar o mouse (ou focar, ou tocar) num tile o levanta e abre, por cima, o
// que o indicador mede: a definição curta do glossário (/glossario/{slug},
// carregado só no primeiro hover, para não pesar a página) e a leitura que o
// tile já mostra. O balão é um só, posto dentro da grade e preso às bordas
// dela: nunca vaza da tela nem empurra nada.
// A nota da Redentia AI vira uma linha com aspas, e o "Perguntar" abre o painel
// do chat com a nota anexada (o href /busca fica para quem está sem JS).
import type { AcaoFundCard, AcaoMetricCard, AcaoPerfilRow } from '~/types/acao'

const props = withDefaults(defineProps<{
  perfil: AcaoPerfilRow[]
  cartoes: AcaoFundCard[]
  forma?: 'tabela' | 'grade'
}>(), { forma: 'tabela' })
const sobre = useSobreDoContexto()
const painel = useChatPainel()
const metricas = computed(() => props.cartoes.filter((c): c is AcaoMetricCard => c.kind === 'metric'))
const notas = computed(() => props.cartoes.filter((c) => c.kind === 'insight'))
const ctxNota = (texto: string, i: number) => ({ id: `nota:${sobre.value}:${i}`, tipo: 'secao', rotulo: rotuloComSobre('Nota da Redentia AI', sobre.value), texto })
function perguntar(texto: string, i: number) {
  painel.abrir(undefined, [{ ...ctxNota(texto, i), rota: useRoute().path }])
}

/* ——— o balão do indicador ——— */
type Termo = { slug: string; term: string; short: string }
let lerTermo: ((s: string) => Termo | null) | null = null
let carregando: Promise<void> | null = null
function carregarGlossario() {
  carregando ??= import('~/content/glossario').then((m) => { lerTermo = m.getTerm }).catch(() => {})
  return carregando
}
const lista = ref<HTMLElement | null>(null)
const aberto = ref<number | null>(null)
const termo = shallowRef<Termo | null>(null)
const pos = ref({ left: 0, top: 0, largura: 280 })
async function abrir(i: number, el: EventTarget | null) {
  aberto.value = i
  const tile = el as HTMLElement | null
  const box = lista.value
  if (tile && box) {
    const largura = Math.min(300, box.clientWidth)
    const meio = tile.offsetLeft + tile.offsetWidth / 2
    pos.value = { largura, top: tile.offsetTop, left: Math.min(Math.max(meio - largura / 2, 0), box.clientWidth - largura) }
  }
  const m = metricas.value[i]
  const slug = m ? slugDoIndicador(m.label) : null
  termo.value = null
  if (!slug) return
  await carregarGlossario()
  if (aberto.value === i) termo.value = lerTermo?.(slug) ?? null
}
function fechar(i: number) {
  if (aberto.value === i) aberto.value = null
}
const atual = computed(() => (aberto.value == null ? null : metricas.value[aberto.value] ?? null))
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

    <div class="ain__caixa" @mouseleave="aberto = null">
      <ul ref="lista" class="ain__lista">
        <li
          v-for="(c, i) in metricas" :key="c.label"
          v-contexto-chat="{ id: `metrica:${sobre}:${c.label}`, tipo: 'grafico', rotulo: rotuloComSobre(c.label, sobre), texto: [`${c.label}${sobre ? ` (${sobre})` : ''}: ${c.value}`, c.tag?.text].filter(Boolean).join('\n') }"
          class="ain__m" :class="{ 'ain__m--on': aberto === i, 'ain__m--recua': aberto != null && aberto !== i }"
          tabindex="0" :aria-describedby="aberto === i ? 'ain-balao' : undefined"
          @mouseenter="abrir(i, $event.currentTarget)" @focus="abrir(i, $event.currentTarget)" @blur="fechar(i)"
          @keydown.escape="aberto = null"
        >
          <span class="ain__m-l">{{ c.label }}</span>
          <span class="ain__m-v">{{ c.value }}</span>
          <span v-if="c.tag" class="ain__tag" :class="`ain__tag--${c.tag.variant}`">{{ c.tag.text }}</span>
        </li>
      </ul>
      <div
        v-if="atual && forma === 'grade'" id="ain-balao" role="tooltip" class="ain__balao"
        :style="{ left: `${pos.left}px`, top: `${pos.top}px`, width: `${pos.largura}px` }"
      >
        <p class="ain__balao-t">{{ termo?.term ?? atual.label }}<span v-if="atual.tag" class="ain__tag" :class="`ain__tag--${atual.tag.variant}`">{{ atual.tag.text }}</span></p>
        <p v-if="termo" class="ain__balao-d">{{ termo.short }}</p>
        <p v-else class="ain__balao-d">{{ atual.label }}{{ sobre ? ` de ${sobre}` : '' }}: {{ atual.value }}.</p>
        <NuxtLink v-if="termo" :to="`/glossario/${termo.slug}`" class="ain__balao-l">O que é {{ termo.term }} no glossário</NuxtLink>
      </div>
    </div>

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
.ain { --mola: cubic-bezier(.34, 1.56, .64, 1); }
.ain__perfil { list-style: none; margin: 0 0 20px; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.ain__dim { display: inline-flex; align-items: center; gap: 8px; height: 34px; padding: 0 6px 0 14px; border-radius: var(--nu-r-pill); background: var(--nu-cream); transition: box-shadow .2s ease, background .2s ease; }
.ain__dim:hover { box-shadow: inset 0 0 0 1px var(--nu-cream-line); background: var(--nu-cream-hover); }
.ain__dim-n { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 600; }
.ain__tag { display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: var(--nu-r-pill); font-size: var(--nu-fs-xs); font-weight: 700; white-space: nowrap; }
.ain__tag--green { background: var(--nu-green-bg); color: var(--nu-green-2); }
.ain__tag--amber { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.ain__tag--gray { background: var(--nu-sand-2); color: var(--nu-gray-tag); }

.ain__caixa { position: relative; }
.ain__lista { list-style: none; margin: 0; padding: 0; }
.ain__m { outline: none; cursor: default; }
/* tabela: indicador · valor · leitura, uma linha por número */
.ain--tabela .ain__m { display: grid; grid-template-columns: minmax(0, 1fr) auto 96px; align-items: center; gap: 16px; min-height: 48px; border-top: 1px solid var(--nu-cream-line); transition: background .2s ease; }
.ain--tabela .ain__m:last-child { border-bottom: 1px solid var(--nu-cream-line); }
.ain--tabela .ain__m:hover, .ain--tabela .ain__m:focus-visible { background: var(--nu-ink-04); }
.ain--tabela .ain__m-l { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; }
.ain--tabela .ain__m-v { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 600; font-variant-numeric: tabular-nums; text-align: right; }
.ain--tabela .ain__m .ain__tag { justify-self: end; }
/* grade: tiles soltos sobre a banda (um plano só); o hover levanta o tile */
.ain--grade .ain__lista { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr)); gap: 12px; }
.ain--grade .ain__m {
  display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 18px 20px; border-radius: var(--nu-r-tile);
  background: var(--nu-white); box-shadow: 0 0 0 1px var(--nu-cream-line);
  transition: transform .45s var(--mola), box-shadow .22s ease, opacity .22s ease;
}
.ain--grade .ain__m--on { transform: translateY(-3px); box-shadow: 0 0 0 1px var(--nu-navy-06), var(--nu-shadow-card); }
.ain--grade .ain__m--recua { opacity: .62; }
.ain--grade .ain__m:focus-visible { box-shadow: 0 0 0 2px var(--nu-blue), var(--nu-shadow-card); }
.ain--grade .ain__m-l { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; transition: color .2s ease; }
.ain--grade .ain__m--on .ain__m-l { color: var(--nu-blue-text); }
.ain--grade .ain__m-v { color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 600; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }

.ain__balao {
  position: absolute; z-index: 5; transform: translateY(calc(-100% - 10px)); pointer-events: auto;
  padding: 14px 16px; border-radius: var(--nu-r-chip); background: var(--nu-navy); color: var(--nu-cream-text);
  box-shadow: 0 0 0 1px var(--nu-navy-06), var(--nu-shadow-float);
  animation: ain-entra .2s ease both;
}
@keyframes ain-entra { from { opacity: 0; transform: translateY(calc(-100% - 4px)); } }
.ain__balao-t { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0; font-size: var(--nu-fs-md); font-weight: 700; }
.ain__balao-d { margin: 6px 0 0; color: var(--nu-cream-text-80); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.ain__balao-l { display: inline-block; margin-top: 8px; color: var(--nu-blue-soft); font-size: var(--nu-fs-sm); font-weight: 700; }
.ain__balao-l:hover { color: var(--nu-white); }

.ain__notas { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 12px 28px; margin-top: 24px; }
.ain__nota { margin: 0; padding-left: 16px; border-left: 2px solid var(--nu-blue); }
.ain__nota-r { color: var(--nu-blue-text); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.ain__nota-t { margin: 6px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.55; }
.ain__nota-cta { display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; color: var(--nu-blue-text); font-size: var(--nu-fs-sm); font-weight: 700; transition: gap .2s ease, color .2s ease; }
.ain__nota-cta:hover { gap: 10px; color: var(--nu-blue-hover); }
@media (max-width: 520px) {
  .ain--tabela .ain__m { grid-template-columns: minmax(0, 1fr) auto; gap: 4px 12px; padding: 10px 0; }
  .ain--tabela .ain__m .ain__tag { grid-column: 2; }
}
@media (prefers-reduced-motion: reduce) {
  .ain--grade .ain__m, .ain__dim, .ain__nota-cta { transition: none; }
  .ain--grade .ain__m--on { transform: none; }
  .ain__balao { animation: none; }
}
</style>
