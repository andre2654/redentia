<script setup lang="ts">
// Os indicadores do /asset: o mesmo perfil e os mesmos cartões do useAcao, sem
// card dentro de card. `grade` são tiles soltos sobre a banda, com o anel de
// 1 px; `tabela` é uma lista densa (indicador · valor · leitura).
// Passar o mouse (ou focar, ou tocar) num tile o levanta e abre, por cima, o
// que o indicador mede: a definição curta do glossário (/glossario/{slug},
// carregado só no primeiro hover, para não pesar a página) e a leitura que o
// tile já mostra. O balão é um só, posto dentro da grade e preso às bordas
// dela: nunca vaza da tela nem empurra nada.
// Aportou (11/11/2026): os selos têm raio 8, o valor vai em 800 e a nota da IA
// é a linha "Em claro" da marca (o texto é o mesmo insight de antes).
// A nota da Redentia AI vira uma linha com aspas, e o "Perguntar" abre o painel
// do chat com a nota anexada (o href /busca fica para quem está sem JS).
// Robustez (11/11/2026): os selos são o NuSelo da base; o perfil deixou de ser
// cinco caixinhas (é uma fileira separada por fios, e no celular uma lista com
// o selo alinhado à direita); os tiles são o cartão branco (sombra branca), com
// o respiro de 24px; o balão flutua com a sombra de flutuar e o link dele, como
// o "Perguntar" da nota, é o NuLinkSeta; a entrada é o v-revelar em cascata.
import type { AcaoFundCard, AcaoMetricCard, AcaoPerfilRow, AcaoTag } from '~/types/acao'

const props = withDefaults(defineProps<{
  perfil: AcaoPerfilRow[]
  cartoes: AcaoFundCard[]
  forma?: 'tabela' | 'grade'
}>(), { forma: 'tabela' })
const sobre = useSobreDoContexto()
const painel = useChatPainel()
const metricas = computed(() => props.cartoes.filter((c): c is AcaoMetricCard => c.kind === 'metric'))
const notas = computed(() => props.cartoes.filter((c) => c.kind === 'insight'))
const ctxNota = (texto: string, i: number) => ({ id: `nota:${sobre.value}:${i}`, tipo: 'secao', rotulo: rotuloComSobre('Nota da IA da Aportou', sobre.value), texto })
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
/** a leitura do indicador no tom do selo da base */
const tomDoSelo = (v: AcaoTag['variant']) => (v === 'green' ? 'verde' : v === 'amber' ? 'ambar' : 'neutro')
</script>

<template>
  <div class="ain" :class="`ain--${forma}`">
    <ul v-if="perfil.length" v-revelar="{ alvo: 'filhos', passo: 40 }" class="ain__perfil">
      <li
        v-for="p in perfil" :key="p.name"
        v-contexto-chat="{ id: `perfil:${sobre}:${p.name}`, tipo: 'grafico', rotulo: rotuloComSobre(p.name, sobre), texto: `${p.name}${sobre ? ` (${sobre})` : ''}: ${p.tag.text}` }"
        class="ain__dim"
      >
        <span class="ain__dim-n">{{ p.name }}</span>
        <NuSelo :tom="tomDoSelo(p.tag.variant)" tamanho="p">{{ p.tag.text }}</NuSelo>
      </li>
    </ul>

    <div class="ain__caixa" @mouseleave="aberto = null">
      <ul ref="lista" v-revelar="{ alvo: 'filhos' }" class="ain__lista">
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
          <NuSelo v-if="c.tag" :tom="tomDoSelo(c.tag.variant)" class="ain__m-selo">{{ c.tag.text }}</NuSelo>
        </li>
      </ul>
      <div
        v-if="atual && forma === 'grade'" id="ain-balao" role="tooltip" class="ain__balao"
        :style="{ left: `${pos.left}px`, top: `${pos.top}px`, width: `${pos.largura}px` }"
      >
        <p class="ain__balao-t">{{ termo?.term ?? atual.label }}<NuSelo v-if="atual.tag" :tom="tomDoSelo(atual.tag.variant)" tamanho="p" sobre="escuro">{{ atual.tag.text }}</NuSelo></p>
        <p v-if="termo" class="ain__balao-d">{{ termo.short }}</p>
        <p v-else class="ain__balao-d">{{ atual.label }}{{ sobre ? ` de ${sobre}` : '' }}: {{ atual.value }}.</p>
        <p v-if="termo" class="ain__balao-l"><NuLinkSeta :to="`/glossario/${termo.slug}`" tom="claro">O que é {{ termo.term }} no glossário</NuLinkSeta></p>
      </div>
    </div>

    <div v-if="notas.length" v-revelar="{ alvo: 'filhos' }" class="ain__notas">
      <figure v-for="(n, i) in notas" :key="i" v-contexto-chat="n.kind === 'insight' ? ctxNota(n.insight, i) : null" class="ain__nota">
        <template v-if="n.kind === 'insight'">
          <figcaption class="ain__nota-r"><MarcaCorte :largura="18" />IA da Aportou</figcaption>
          <blockquote class="ain__nota-t"><b>Em claro:</b> {{ n.insight }}</blockquote>
          <!-- na captura: o preventDefault chega antes do clique do RouterLink, que senão
               navegava para a /busca e abria o painel por cima (o href fica para quem está sem JS) -->
          <p class="ain__nota-cta"><NuLinkSeta :to="n.href" @click.capture.prevent="perguntar(n.insight, i)">{{ n.cta }}</NuLinkSeta></p>
        </template>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.ain { --mola: var(--nu-ease-saida); }
/* o perfil: uma fileira de "dimensão + selo" separada por fios (sem caixa); no celular, uma lista */
.ain__perfil { list-style: none; margin: 0 0 24px; padding: 0; display: flex; flex-wrap: wrap; align-items: center; row-gap: 12px; }
.ain__dim { display: inline-flex; align-items: center; gap: 10px; min-height: 28px; padding: 0 20px; border-left: 1px solid var(--nu-line); }
.ain__dim:first-child { padding-left: 0; border-left: 0; }
.ain__dim-n { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
@media (max-width: 760px) {
  .ain__perfil { display: grid; grid-template-columns: minmax(0, 1fr); row-gap: 0; border-top: 1px solid var(--nu-line-2); }
  .ain__dim, .ain__dim:first-child { justify-content: space-between; min-height: 48px; padding: 0; border-left: 0; border-bottom: 1px solid var(--nu-line-2); }
}

.ain__caixa { position: relative; }
.ain__lista { list-style: none; margin: 0; padding: 0; }
.ain__m { outline: none; cursor: default; }
/* o tile da grade abre o que o indicador mede (o balão): o cursor diz que há explicação */
.ain--grade .ain__m { cursor: help; }
/* tabela: indicador · valor · leitura, uma linha por número */
.ain--tabela .ain__m { display: grid; grid-template-columns: minmax(0, 1fr) auto 96px; align-items: center; gap: 16px; min-height: 52px; border-top: 1px solid var(--nu-line-2); transition: background-color var(--nu-dur-media) var(--nu-ease-cor); }
.ain--tabela .ain__m:last-child { border-bottom: 1px solid var(--nu-line-2); }
.ain--tabela .ain__m:hover, .ain--tabela .ain__m:focus-visible { background: var(--nu-cream-2); }
.ain--tabela .ain__m-l { color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.ain--tabela .ain__m-v { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; text-align: right; }
.ain--tabela .ain__m .ain__m-selo { justify-self: end; }
/* grade: o cartão branco sobre a banda (um plano só); o hover levanta o tile e os outros recuam */
.ain--grade .ain__lista { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
@media (min-width: 720px) { .ain--grade .ain__lista { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (min-width: 1000px) { .ain--grade .ain__lista { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; } }
.ain--grade .ain__m {
  display: flex; flex-direction: column; align-items: flex-start; gap: 8px; padding: 24px; border-radius: var(--nu-r-tile);
  background: var(--nu-white); box-shadow: var(--nu-shadow-branco);
  transition: transform var(--nu-dur-media) var(--mola), box-shadow var(--nu-dur-media) var(--mola), opacity var(--nu-dur-media) var(--nu-ease-cor);
}
.ain--grade .ain__m--on { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.ain--grade .ain__m--recua { opacity: .62; }
.ain--grade .ain__m:focus-visible { box-shadow: 0 0 0 3px var(--nu-blue), var(--nu-shadow-card); }
.ain--grade .ain__m-l { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); transition: color var(--nu-dur-media) var(--nu-ease-cor); }
.ain--grade .ain__m--on .ain__m-l { color: var(--nu-blue-text); }
.ain--grade .ain__m-v { color: var(--nu-ink); font-size: clamp(24px, 2.2vw, 30px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.1; font-variant-numeric: tabular-nums; }
.ain--grade .ain__m-selo { margin-top: 4px; }
@media (max-width: 480px) { .ain--grade .ain__m { padding: 20px; } }

/* o balão do indicador: carvão, flutuando (fio + sombra de flutuar), entra subindo 4px */
.ain__balao {
  position: absolute; z-index: 5; transform: translateY(calc(-100% - 12px)); pointer-events: auto;
  padding: 16px; border-radius: var(--nu-r-chip); background: var(--nu-ink); color: var(--nu-white);
  box-shadow: 0 0 0 1px var(--nu-dark-chip-line), var(--nu-shadow-float);
  animation: ain-entra var(--nu-dur-media) var(--nu-ease-saida) both;
}
@keyframes ain-entra { from { opacity: 0; translate: 0 4px; } }
.ain__balao-t { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0; font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
.ain__balao-d { margin: 8px 0 0; color: var(--nu-on-dark); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.5; }
.ain__balao-l { margin: 12px 0 0; font-size: var(--nu-fs-sm); }

/* a nota da IA: a linha "Em claro" da marca, com o corte azul */
.ain__notas { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 12px; margin-top: 24px; }
.ain__nota { margin: 0; padding: 24px; border-radius: var(--nu-r-tile); background: var(--nu-card); box-shadow: var(--nu-shadow-quente); }
.ain__nota-r { display: flex; align-items: center; gap: 8px; color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-caixa); text-transform: uppercase; }
.ain__nota-t { margin: 12px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); line-height: 1.5; }
.ain__nota-t b { color: var(--nu-ink); font-weight: var(--nu-w-forte); }
.ain__nota-cta { margin: 16px 0 0; font-size: var(--nu-fs-sm); }
@media (max-width: 520px) {
  .ain--tabela .ain__m { grid-template-columns: minmax(0, 1fr) auto; gap: 4px 12px; padding: 10px 0; }
  .ain--tabela .ain__m .ain__m-selo { grid-column: 2; }
  .ain__nota { padding: 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .ain--grade .ain__m { transition: none; }
  .ain--grade .ain__m--on { transform: none; }
  .ain__balao { animation: none; }
}
</style>
