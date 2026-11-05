<script setup lang="ts">
// "No mundo" (05/11/2026, pedido do dono: "trazer a exposição do cara no
// mundo, onde ele está sendo exposto, de maneira simples, num mapa-múndi").
// Entra na /carteira logo depois de Posições.
//
// Responde uma pergunta numa frase: a que lugares o meu dinheiro está
// exposto? Nas ações e FIIs, pela RECEITA das empresas (item 1.7 do
// Formulário de Referência da CVM; o dono: "elas vivem no Brasil mas recebem
// de outros lugares"); quem não tem esse dado fica em "Brasil (sede)", à
// parte, e a frase diz de quantas empresas sabemos. BDR pelo país da empresa,
// ETF pela região do índice, Tesouro e renda fixa como Brasil. A conta é de
// utils/exposicaoNoMundo.ts e a busca (1 chamada de receita + no máximo 10 de
// BDR/ETF, cache de 5 min) de composables/useExposicaoNoMundo.ts.
//
// Três desenhos, para o dono escolher olhando (switch só no dev, ?mundo=1|2|3;
// em produção vale o 1):
//  1. o globo de pontos que gira até o Brasil, com arcos saindo daqui;
//  2. o mapa-múndi plano de pontos, com bolhas proporcionais e a lista ao lado;
//  3. os países pintados e uma barra única empilhada.
//
// Carregando: esqueleto na forma do que chega. Sem posição: a seção some (o
// CarteiraContent nem monta). A frase surge palavra por palavra quando entra
// na tela; sem JS ela já está lá (a animação só embeleza).
import type { CarteiraPosicaoMundo } from '~/types/carteira'
import type { FatiaMundo } from '~/utils/exposicaoNoMundo'

const props = defineProps<{ posicoes: CarteiraPosicaoMundo[] }>()

const { vm } = useExposicaoNoMundo(() => props.posicoes)
const { mask } = useHiddenValues()
const route = useRoute()

const variacao = computed<1 | 2 | 3>(() => {
  if (import.meta.dev) {
    const q = Number(route.query.mundo)
    if (q === 2 || q === 3) return q
  }
  return 1
})

/* ————— cores: Brasil no azul da marca, o resto na paleta do brilho do chat ————— */

const COR_BRASIL = '#2F6AFF'
const PALETA = ['#FF6B8A', '#9B7BFF', '#1FB5D6', '#E8A33D', '#4CB782', '#C45BD9', '#7A8699']
const COR_FORA: Record<string, string> = { sede: '#9FB3DA', cripto: '#F2994A', ouro: '#D4A017', 'sem-dado': '#B9AE9C' }

type FatiaCor = FatiaMundo & { cor: string }
const noMapa = computed<FatiaCor[]>(() => {
  let i = 0
  return vm.value.noMapa.map((f) => ({ ...f, cor: f.chave === 'BR' ? COR_BRASIL : PALETA[i++ % PALETA.length]! }))
})
const fora = computed<FatiaCor[]>(() => vm.value.fora.map((f) => ({ ...f, cor: COR_FORA[f.tipo] ?? '#B9AE9C' })))
const lista = computed(() => [...noMapa.value, ...fora.value])

/**
 * A lista curta: os 5 maiores lugares do mapa e, se houver mais, uma linha
 * "Outros lugares" com a soma (a receita de uma empresa só já espalha o
 * dinheiro em seis regiões). O mapa continua acendendo todos.
 */
const LUGARES_NA_LISTA = 5
type LinhaMundo = FatiaCor & { juntos?: string[] }
const lugares = computed<LinhaMundo[]>(() => {
  const l = noMapa.value
  if (l.length <= LUGARES_NA_LISTA + 1) return l
  const vis = l.slice(0, LUGARES_NA_LISTA)
  const resto = l.slice(LUGARES_NA_LISTA)
  const pctInt = resto.reduce((s, f) => s + f.pctInt, 0)
  const pct = resto.reduce((s, f) => s + f.pct, 0)
  const outros: LinhaMundo = {
    ...resto[0]!,
    chave: 'outros-lugares', tipo: 'regiao', nome: 'Outros lugares', cor: '#B9AE9C',
    valor: resto.reduce((s, f) => s + f.valor, 0), pct, pctInt,
    pctTxt: pctInt === 0 && pct > 0 ? 'menos de 1%' : `${pctInt}%`,
    tickers: [...new Set(resto.flatMap((f) => f.tickers))], paises: [], ancora: null, todos: false,
    juntos: resto.map((f) => f.nome),
  }
  return [...vis, outros]
})
const linhas = computed<LinhaMundo[]>(() => [...lugares.value, ...fora.value])

const ativo = ref<string | null>(null)
// "Outros lugares" junta vários: o hover nele não apaga o mapa
function marcar(chave: string | null) { ativo.value = chave === 'outros-lugares' ? null : chave }

const pronto = computed(() => !vm.value.pendente && lista.value.length > 0)

/* ————— a lista ————— */

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
function papeis(f: FatiaCor): string {
  const t = f.tickers.slice(0, 3).join(', ')
  return f.tickers.length > 3 ? `${t} e mais ${f.tickers.length - 3}` : t
}
function subDe(f: FatiaCor): string {
  const j = (f as LinhaMundo).juntos
  if (j) return j.join(', ')
  // região da receita (Europa, Ásia…) e região do índice do ETF (Mundo desenvolvido)
  if (f.tipo === 'regiao') return f.chave.startsWith('etf:') ? `região do índice · ${papeis(f)}` : `receita de ${papeis(f)}`
  if (f.tipo === 'cripto') return `sem fronteira · ${papeis(f)}`
  if (f.tipo === 'ouro') return `sem país · ${papeis(f)}`
  if (f.tipo === 'sede') return `sem dado de receita · ${papeis(f)}`
  if (f.chave === 'rec-resto') return `a empresa não detalhou · ${papeis(f)}`
  if (f.tipo === 'sem-dado') return `não sabemos onde investe · ${papeis(f)}`
  return papeis(f)
}
const valorDe = (f: FatiaCor) => mask(`R$ ${nf0.format(f.valor)}`)

/* ————— a frase que surge ————— */

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
  // fora da tela no mount: esconde agora (ninguém vê) e revela quando entrar
  const r = el.getBoundingClientRect()
  if (r.top > window.innerHeight || r.bottom < 0) modo.value = 'esperando'
  io = new IntersectionObserver(([e]) => {
    if (!e?.isIntersecting || visto) return
    visto = true
    if (modo.value === 'esperando' || !pronto.value) modo.value = 'revelando'
    io?.disconnect()
  }, { threshold: 0.4 })
  io.observe(el)
})
onBeforeUnmount(() => io?.disconnect())
// a frase chegou depois (BDR/ETF): já na tela, ela surge do esqueleto
watch(pronto, (ok) => { if (ok && visto && modo.value !== 'parado') modo.value = 'revelando' })

const contexto = computed(() => ({
  id: 'carteira:mundo',
  tipo: 'carteira',
  rotulo: 'Seu dinheiro no mundo',
  texto: [
    vm.value.frase,
    vm.value.coberturaTxt ?? '',
    'Ações e FIIs contam pela receita por país ou região (item 1.7 do Formulário de Referência da CVM); sem esse dado, ficam em "Brasil (sede)". BDR conta pelo país da empresa, ETF pela região do índice.',
    ...lista.value.map((f) => `${f.nome}: ${f.pctTxt} (${f.tickers.join(', ')})`),
  ].filter(Boolean).join('\n'),
}))
</script>

<template>
  <section class="cmu" :class="`cmu--v${variacao}`" aria-labelledby="cmu-titulo" data-clarity-mask="true">
    <div ref="cabeca" class="cmu__cabeca">
      <span class="cmu__eyebrow">No mundo</span>
      <h2 v-if="pronto" id="cmu-titulo" class="cmu__frase" :class="`cmu__frase--${modo}`" :aria-label="vm.frase">
        <template v-for="(p, i) in palavras" :key="`${i}-${p}`"><span class="cmu__palavra" :style="{ '--i': i }" aria-hidden="true">{{ p }}</span>{{ ' ' }}</template>
      </h2>
      <template v-else>
        <h2 id="cmu-titulo" class="cmu__sr">Seu dinheiro no mundo</h2>
        <div class="cmu__esq-frase" aria-busy="true" aria-label="Procurando onde está o seu dinheiro">
          <NuSkeleton width="min(640px, 96%)" height="clamp(30px, 3.4vw, 44px)" radius="input" />
          <NuSkeleton width="min(420px, 70%)" height="clamp(30px, 3.4vw, 44px)" radius="input" />
        </div>
      </template>
      <p v-if="pronto && vm.coberturaTxt" class="cmu__cobertura" :class="`cmu__cobertura--${modo}`">{{ vm.coberturaTxt }}</p>
      <p class="cmu__nota">De onde vem a receita das empresas em que o seu dinheiro está, pelo formulário que elas entregam à CVM. BDR conta pelo país da empresa; ETF, pela região do índice.</p>
    </div>

    <div v-contexto-chat="contexto" class="cmu__corpo">
      <!-- 1 · o globo -->
      <template v-if="variacao === 1">
        <div class="cmu__globo">
          <CarteiraMundoGlobo v-if="pronto" :fatias="noMapa" :ativo="ativo" @ativo="marcar" />
          <NuSkeleton v-else variant="circle" width="80%" height="auto" class="cmu__esq-globo" />
        </div>
      </template>

      <!-- 2 · o mapa plano -->
      <template v-else-if="variacao === 2">
        <div class="cmu__mapa">
          <CarteiraMundoMapa v-if="pronto" :fatias="noMapa" :ativo="ativo" @ativo="marcar" />
          <NuSkeleton v-else width="100%" height="auto" radius="card" class="cmu__esq-mapa" />
        </div>
      </template>

      <!-- 3 · os países pintados + a barra -->
      <template v-else>
        <div class="cmu__pintado">
          <CarteiraMundoPintado v-if="pronto" :fatias="noMapa" :fora="fora" :legenda="linhas" :ativo="ativo" @ativo="marcar" />
          <NuSkeleton v-else width="100%" height="auto" radius="card" class="cmu__esq-mapa" />
        </div>
      </template>

      <!-- a lista (1 e 2): é ela que diz tudo, o desenho só embeleza -->
      <div v-if="variacao !== 3" class="cmu__lado">
        <ul v-if="pronto" class="cmu__lista">
          <li
            v-for="(f, i) in linhas" :key="f.chave"
            class="cmu__linha" :class="{ 'cmu__linha--ativa': ativo === f.chave, 'cmu__linha--apagada': ativo && ativo !== f.chave, 'cmu__linha--fora': i === lugares.length && lugares.length > 0 }"
            tabindex="0"
            @pointerenter="marcar(f.chave)" @pointerleave="marcar(null)" @focus="marcar(f.chave)" @blur="marcar(null)"
          >
            <span class="cmu__ponto" :class="{ 'cmu__ponto--sem': f.tipo === 'sem-dado' }" :style="{ '--c': f.cor }" aria-hidden="true" />
            <span class="cmu__nome">
              <span class="cmu__nome-txt">{{ f.nome }}</span>
              <span class="cmu__sub">{{ subDe(f) }}</span>
            </span>
            <span class="cmu__valores">
              <span class="cmu__pct">{{ f.pctTxt }}</span>
              <span class="cmu__valor">{{ valorDe(f) }}</span>
            </span>
          </li>
        </ul>
        <div v-else class="cmu__esq-lista" aria-hidden="true">
          <div v-for="n in 3" :key="n" class="cmu__esq-linha">
            <NuSkeleton variant="circle" width="12px" height="12px" />
            <NuSkeleton width="min(180px, 50%)" height="18px" radius="chip" />
            <NuSkeleton width="52px" height="18px" radius="chip" class="cmu__esq-pct" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cmu {
  background: var(--nu-white);
  padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px);
  scroll-margin-top: calc(var(--nuh-h, 76px) + 56px);
  overflow: hidden;
}
.cmu__cabeca { max-width: 860px; }
.cmu__eyebrow { color: var(--nu-blue-text); font-size: var(--nu-fs-eyebrow); font-weight: 800; }
.cmu__frase {
  margin: 12px 0 0; color: var(--nu-ink);
  font-size: var(--nu-fs-h2-sm); font-weight: 800; letter-spacing: -0.035em; line-height: 1.08;
  font-variant-numeric: tabular-nums; text-wrap: balance;
}
.cmu__palavra { display: inline-block; }
/* as palavras que surgem (o mesmo gesto de utils/revelar-palavras.ts) */
.cmu__frase--esperando .cmu__palavra { opacity: 0; }
.cmu__frase--revelando .cmu__palavra {
  animation: cmu-palavra 520ms cubic-bezier(.22, 1, .36, 1) both;
  animation-delay: min(calc(var(--i) * 38ms), 900ms);
}
@keyframes cmu-palavra { from { opacity: 0; filter: blur(8px); transform: translateY(6px); } }
.cmu__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.cmu__esq-frase { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; }
.cmu__cobertura { margin: 14px 0 0; color: var(--nu-ink-75); font-size: var(--nu-fs-lg); font-weight: 600; line-height: 1.4; }
.cmu__cobertura--esperando { opacity: 0; }
.cmu__cobertura--revelando { animation: cmu-palavra 520ms cubic-bezier(.22, 1, .36, 1) 520ms both; }
.cmu__nota { margin: 16px 0 0; max-width: 620px; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.5; }

.cmu__corpo { display: grid; gap: clamp(28px, 4vw, 64px); margin-top: clamp(28px, 4vw, 52px); align-items: center; }
.cmu--v1 .cmu__corpo { grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); }
.cmu--v2 .cmu__corpo { grid-template-columns: minmax(0, 1.75fr) minmax(0, 1fr); }
.cmu--v3 .cmu__corpo { grid-template-columns: minmax(0, 1fr); }

.cmu__globo { width: 100%; max-width: 560px; justify-self: center; position: relative; aspect-ratio: 1 / 1; display: grid; place-items: center; }
.cmu__esq-globo { aspect-ratio: 1 / 1; }
.cmu__mapa {
  background: var(--nu-cream); border-radius: var(--nu-r-card-lg); padding: clamp(14px, 2.4vw, 30px) clamp(10px, 2vw, 24px);
  box-shadow: 0 0 0 1px rgba(12, 21, 36, 0.04), 0 24px 60px -30px rgba(12, 21, 36, 0.18);
}
.cmu__esq-mapa { aspect-ratio: 1000 / 436; }
.cmu__pintado { width: 100%; }

.cmu__lista { list-style: none; margin: 0; padding: 0; }
.cmu__linha {
  display: flex; align-items: center; gap: 14px; padding: 16px 10px; margin: 0 -10px;
  border-radius: var(--nu-r-chip); border-top: 1px solid var(--nu-cream-2);
  transition: background .18s, opacity .25s; cursor: default; outline: none;
}
.cmu__linha:first-child { border-top: none; }
.cmu__linha--fora { margin-top: 14px; border-top: 1px dashed var(--nu-cream-line); }
.cmu__linha:hover, .cmu__linha--ativa { background: var(--nu-row-hover); }
.cmu__linha:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.cmu__linha--apagada { opacity: .5; }
.cmu__ponto {
  width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; background: var(--c);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 16%, transparent);
  transition: box-shadow .25s;
}
.cmu__linha--ativa .cmu__ponto { box-shadow: 0 0 0 6px color-mix(in srgb, var(--c) 24%, transparent), 0 0 18px color-mix(in srgb, var(--c) 60%, transparent); }
.cmu__ponto--sem { background: repeating-linear-gradient(135deg, var(--nu-sand) 0 2px, var(--nu-cream-3) 2px 4px); box-shadow: 0 0 0 4px var(--nu-cream-2); }
.cmu__nome { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.cmu__nome-txt { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.01em; }
.cmu__sub { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cmu__valores { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; text-align: right; }
.cmu__pct { color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }
.cmu__valor { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }

.cmu__esq-lista { display: flex; flex-direction: column; }
.cmu__esq-linha { display: flex; align-items: center; gap: 14px; padding: 20px 0; border-top: 1px solid var(--nu-cream-2); }
.cmu__esq-linha:first-child { border-top: none; }
.cmu__esq-pct { margin-left: auto; }

@media (max-width: 900px) {
  .cmu--v1 .cmu__corpo, .cmu--v2 .cmu__corpo { grid-template-columns: minmax(0, 1fr); }
  .cmu__globo { max-width: 440px; }
}
@media (max-width: 480px) {
  .cmu__nome-txt { font-size: var(--nu-fs-md); }
  .cmu__pct { font-size: var(--nu-fs-lg); }
  .cmu__globo { max-width: none; margin: 0 -8px; width: calc(100% + 16px); }
}
@media (prefers-reduced-motion: reduce) {
  .cmu__frase--revelando .cmu__palavra, .cmu__cobertura--revelando { animation: none; }
}
</style>
