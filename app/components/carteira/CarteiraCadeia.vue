<script setup lang="ts">
// "Na cadeia" (05/11/2026, pedido do dono olhando a cadeia da Bradesco no
// /asset: "coloque nessa tela também a relação entre as minhas ações, no
// sentido de dependência de outra empresa; vamos achar um jeito de
// representar isso dentro da carteira"). Entra na /carteira depois de "No mundo".
//
// Responde numa frase: as minhas empresas dependem umas das outras? Primeiro
// as ligações ENTRE papéis da carteira (a Vale compra diesel da Petrobras);
// depois as empresas de fora que mais de uma das suas compartilha ou, sem
// nenhuma em comum, a de fora mais forte de cada uma, com moderação. Valores
// como a empresa informou, nunca somados entre moedas ou tipos, com quem
// informou e as provas (o mesmo painel do /asset). Só descreve: nada de
// risco nem de recomendação.
//
// A conta é de utils/cadeiaDaCarteira.ts; a busca (uma chamada de
// /assets/{t}/supply-chain por empresa, só ação, no máximo 12, cache de 5 min)
// de composables/useCadeiaDaCarteira.ts. Sem nenhuma ligação, a seção some.
//
// TRÊS VARIAÇÕES (o método do dono), só no dev por ?cadeia-carteira=1|2|3;
// em produção vale a 1:
//  1. a rede: as suas empresas no anel de dentro, do tamanho do peso na
//     carteira, as de fora em volta, apagadas; as setas dizem quem vende;
//  2. a matriz "quem vende para quem": linha vende, coluna compra, o
//     quadrante das suas aceso;
//  3. a lista narrada: uma frase por ligação, com o mini-diagrama.
import AcaoCadeiaDetalhe from '~/components/acao/AcaoCadeiaDetalhe.vue'
import type { AcaoCadeiaDetalheVM } from '~/types/acao'
import type { CarteiraPosicaoMundo } from '~/types/carteira'
import { contextoDaCadeiaDaCarteira, detalheDaLigacao } from '~/utils/cadeiaDaCarteira'

const props = defineProps<{ posicoes: CarteiraPosicaoMundo[] }>()
const emit = defineEmits<{ ligacoes: [tem: boolean] }>()

const { vm, pendente } = useCadeiaDaCarteira(() => props.posicoes)

const route = useRoute()
const variacao = computed<1 | 2 | 3>(() => {
  if (import.meta.dev) {
    const q = Number(route.query['cadeia-carteira'])
    if (q === 2 || q === 3) return q
  }
  return 1
})

const pronto = computed(() => !pendente.value && !vm.value.vazia)
const mostrar = computed(() => pendente.value || !vm.value.vazia)
watch(pendente, (p) => { if (!p) emit('ligacoes', !vm.value.vazia) })
watch(() => vm.value.vazia, (v) => { if (!pendente.value) emit('ligacoes', !v) })

/* ————— quem aparece ————— */

/** as suas que têm alguma ligação na tela (as outras vão para o pé, quietas) */
const ligadas = computed(() => vm.value.empresas.filter((e) =>
  vm.value.internas.some((l) => l.vende === e.raiz || l.compra === e.raiz)
  || vm.value.externas.some((x) => x.empresas.includes(e.raiz))))
const quietas = computed(() => vm.value.empresas.filter((e) => !ligadas.value.includes(e)))
const tickerDe = computed<Record<string, string>>(() => ({
  ...Object.fromEntries(vm.value.externas.map((x) => [x.raiz, x.ticker])),
  ...Object.fromEntries(vm.value.empresas.map((e) => [e.raiz, e.ticker])),
}))
const todas = computed(() => [...vm.value.internas, ...vm.value.externas.flatMap((x) => x.ligacoes)])
const porId = computed(() => new Map(todas.value.map((l) => [l.id, l])))

/* ————— a ligação em foco (rede e matriz) e o painel das provas ————— */

const focoMouse = ref<string | null>(null)
const focoId = computed(() => (focoMouse.value && porId.value.has(focoMouse.value) ? focoMouse.value : todas.value[0]?.id ?? null))

const aberto = ref<AcaoCadeiaDetalheVM | null>(null)
function abrir(id: string) {
  const l = porId.value.get(id)
  if (l) aberto.value = detalheDaLigacao(l, vm.value.nomes)
}

/* ————— a frase que surge (o mesmo gesto do "No mundo") ————— */

const palavras = computed(() => vm.value.frase.split(' ').filter(Boolean))
type ModoPalavras = 'parado' | 'esperando' | 'revelando'
const modo = ref<ModoPalavras>('parado')
const cabeca = ref<HTMLElement | null>(null)
let visto = false
let io: IntersectionObserver | null = null
onMounted(() => {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const el = cabeca.value
  if (!el) return
  const r = el.getBoundingClientRect()
  if (r.top > window.innerHeight || r.bottom < 0) modo.value = 'esperando'
  io = new IntersectionObserver(([e]) => {
    if (!e?.isIntersecting || visto) return
    visto = true
    if (modo.value === 'esperando' || !pronto.value) modo.value = 'revelando'
    io?.disconnect()
  }, { threshold: 0.3 })
  io.observe(el)
})
onBeforeUnmount(() => io?.disconnect())
watch(pronto, (ok) => { if (ok && visto && modo.value !== 'parado') modo.value = 'revelando' })

const contexto = computed(() => ({
  id: 'carteira:cadeia',
  tipo: 'carteira',
  rotulo: 'Ligações entre as suas empresas',
  texto: contextoDaCadeiaDaCarteira(vm.value),
}))
</script>

<template>
  <section v-if="mostrar" class="cca" :class="`cca--v${variacao}`" aria-labelledby="cca-titulo" data-clarity-mask="true">
    <div ref="cabeca" class="cca__cabeca">
      <span class="cca__eyebrow">Na cadeia</span>
      <h2 v-if="pronto" id="cca-titulo" class="cca__frase" :class="`cca__frase--${modo}`" :aria-label="vm.frase">
        <template v-for="(p, i) in palavras" :key="`${i}-${p}`"><span class="cca__palavra" :style="{ '--i': i }" aria-hidden="true">{{ p }}</span>{{ ' ' }}</template>
      </h2>
      <template v-else>
        <h2 id="cca-titulo" class="cca__sr">Ligações entre as suas empresas</h2>
        <div class="cca__esq-frase" aria-busy="true" aria-label="Procurando as ligações entre as suas empresas">
          <NuSkeleton width="min(620px, 96%)" height="clamp(30px, 3.4vw, 44px)" radius="input" />
          <NuSkeleton width="min(380px, 64%)" height="clamp(30px, 3.4vw, 44px)" radius="input" />
        </div>
      </template>
      <p class="cca__nota">Quem compra de quem entre as empresas da sua carteira e as listadas em volta, pelo que elas informam à CVM, à SEC e em comunicados. Valores como cada empresa informou.</p>
    </div>

    <div v-contexto-chat="contexto" class="cca__corpo">
      <!-- carregando: o esqueleto na forma da variação -->
      <div v-if="!pronto" class="cca__esq" :class="`cca__esq--v${variacao}`" aria-hidden="true">
        <template v-if="variacao === 3">
          <div v-for="n in 3" :key="n" class="cca__esq-linha">
            <NuSkeleton width="132px" height="40px" radius="pill" />
            <NuSkeleton width="min(520px, 70%)" height="22px" radius="chip" />
          </div>
        </template>
        <template v-else>
          <NuSkeleton width="100%" height="100%" radius="card-lg" class="cca__esq-bloco" />
        </template>
      </div>

      <template v-else>
        <CarteiraCadeiaRede
          v-if="variacao === 1"
          :vm="vm" :ligadas="ligadas" :ticker-de="tickerDe" :foco="focoId" :modo="modo"
          @foco="focoMouse = $event" @abrir="abrir"
        />
        <CarteiraCadeiaMatriz
          v-else-if="variacao === 2"
          :vm="vm" :ligadas="ligadas" :ticker-de="tickerDe" :foco="focoId" :modo="modo"
          @foco="focoMouse = $event" @abrir="abrir"
        />
        <CarteiraCadeiaNarrada
          v-else
          :vm="vm" :ticker-de="tickerDe" :modo="modo"
          @abrir="abrir"
        />

        <div class="cca__pe">
          <div v-if="quietas.length" class="cca__quietas">
            <span class="cca__pe-rot">Sem ligação verificada com outras listadas</span>
            <span class="cca__chips">
              <NuxtLink v-for="e in quietas" :key="e.raiz" :to="`/asset/${e.ticker}`" class="cca__chip">
                <NuAssetLogo :ticker="e.ticker" :letter="e.ticker.charAt(0)" tile-bg="var(--nu-tile-blue-bg)" tile-fg="var(--nu-blue-deep)" :size="22" :radius="6" />
                {{ e.ticker }}
              </NuxtLink>
            </span>
          </div>
        </div>
      </template>
    </div>

    <AcaoCadeiaDetalhe :detalhe="aberto" @close="aberto = null" />
  </section>
</template>

<style scoped>
.cca {
  background: var(--nu-white);
  padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px);
  scroll-margin-top: calc(var(--nuh-h, 76px) + 56px);
  overflow: hidden;
}
.cca__cabeca { max-width: 860px; }
.cca__eyebrow { color: var(--nu-blue-text); font-size: var(--nu-fs-eyebrow); font-weight: 800; }
.cca__frase {
  margin: 12px 0 0; color: var(--nu-ink);
  font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.035em; line-height: 1.08;
  font-variant-numeric: tabular-nums; text-wrap: balance;
}
.cca__palavra { display: inline-block; }
.cca__frase--esperando .cca__palavra { opacity: 0; }
.cca__frase--revelando .cca__palavra {
  animation: cca-palavra 520ms cubic-bezier(.22, 1, .36, 1) both;
  animation-delay: min(calc(var(--i) * 38ms), 900ms);
}
@keyframes cca-palavra { from { opacity: 0; filter: blur(8px); transform: translateY(6px); } }
.cca__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.cca__esq-frase { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; }
.cca__nota { margin: 16px 0 0; max-width: 620px; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }

.cca__corpo { margin-top: clamp(28px, 4vw, 52px); }

/* esqueleto: a altura do que chega */
.cca__esq--v1 { aspect-ratio: 16 / 9; max-width: 1080px; }
.cca__esq--v2 { aspect-ratio: 16 / 8; max-width: 860px; }
.cca__esq-bloco { display: block; }
.cca__esq--v3 { display: flex; flex-direction: column; }
.cca__esq-linha { display: flex; align-items: center; gap: 22px; padding: 22px 0; border-top: 1px solid var(--nu-cream-2); }
.cca__esq-linha:first-child { border-top: none; }

.cca__provas { padding: 0; border: 0; background: none; font: inherit; color: var(--nu-blue-text); font-weight: 700; cursor: pointer; }
.cca__provas:hover { color: var(--nu-blue-hover); }
.cca__provas:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; border-radius: 4px; }

.cca__pe { max-width: 860px; margin: clamp(28px, 3.4vw, 40px) auto 0; display: flex; flex-direction: column; gap: 12px; }
.cca--v3 .cca__pe { margin-left: 0; }
.cca__quietas { display: flex; flex-direction: column; gap: 10px; }
.cca__pe-rot { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; }
.cca__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.cca__chip {
  display: inline-flex; align-items: center; gap: 7px; padding: 4px 11px 4px 4px; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-ink-75, var(--nu-ink)); font-size: var(--nu-fs-xs); font-weight: 700;
  transition: background .18s, transform .3s cubic-bezier(.34, 1.56, .64, 1);
}
.cca__chip:hover { background: var(--nu-cream-hover); transform: translateY(-1px); color: var(--nu-ink); }

@media (max-width: 600px) {
  .cca__esq--v1 { aspect-ratio: 1 / 1.1; }
  .cca__esq--v2 { aspect-ratio: 1 / 1; }
  .cca__esq-linha { flex-direction: column; align-items: flex-start; gap: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .cca__frase--revelando .cca__palavra { animation: none; }
}
</style>
