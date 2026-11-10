<script setup lang="ts">
// O topo da home para quem está logado, na linha "A frase" (10/11/2026). O
// dono escolheu essa linha para a /carteira (CarteiraHeroi) e pediu a home no
// mesmo caminho ("nessa home também, o que a Nubank faria? vamos redesenhar").
// O dono escolheu esta versão no mesmo dia ("pode manter a home 2"), e ela
// ficou no lugar do HomeAgora (a tela preta com o losango).
// O que muda, com os MESMOS dados e as mesmas frases (utils/diaDaCarteira.ts):
//  - o fundo creme e uma cor só de destaque (o azul), como na carteira;
//  - a resposta do dia vem primeiro, numa frase com o número em azul ("Na
//    sexta, sua carteira subiu 0,11%."); o "Tudo normal." deixa de ser a
//    manchete e vira o estado ao lado do nome, com o ponto verde;
//  - o veredito e a causa viram a linha cinza de apoio;
//  - o desenho é um gráfico suave da carteira contra o CDI em 12 meses (a
//    TWR do relatório, base 100), o mesmo da /carteira, sem eixos nem mira:
//    o dono pediu para tirar o losango da marca dali ("talvez um gráfico
//    suave"). Ele chega pelo cliente (o relatório não entra no SSR da home,
//    que a borda cacheia) e, até lá, é esqueleto;
//  - os três números viram a fileira com fios, cada um com a seta para a
//    seção da /carteira; o "Abrir minha carteira" é o botão azul.
// Os estados são os do HomeAgora: com carteira e assinatura; carteira sem
// assinatura; sem carteira (a maioria das contas); resumo fora do ar. Dado que
// falta some, nunca vira zero; carregando é esqueleto.
import type { CarteiraResumoVM } from '~/types/carteira'
import { frasesDoDia } from '~/utils/diaDaCarteira'
import { estadoDoPregao } from '~/utils/pregao'
import { contraOCdi, dataDoCorte, rebase100, serieDesde, variacaoDoIndice } from '~/utils/rentabilidadeCarteira'
import FraseDestaque from '~/components/carteira/visao/FraseDestaque.vue'

const props = defineProps<{ resumo: CarteiraResumoVM | null }>()

const { firstName } = useAuthState()

// O snapshot da assinatura não entra no SSR da home (a borda cacheia a página):
// sai do cliente, e até ele chegar o topo é esqueleto. Os onMounted vêm antes
// do await, senão não registram.
const assinatura = useAssinatura()
const { visiveis, alternar } = useValoresVisiveis()
const agora = ref<Date | null>(null)
onMounted(() => {
  void assinatura.carregar()
  agora.value = new Date()
})
const podeVerNumeros = computed(() => assinatura.carregado.value && assinatura.assinante.value)
const naoAssina = computed(() => assinatura.carregado.value && !assinatura.assinante.value)

const { bolsa } = await useBolsaDoDia()
const momento = useState('home:momento-bolsa', () => momentoDaBolsa())
onMounted(() => { momento.value = momentoDaBolsa() })

const comCarteira = computed(() => props.resumo?.state === 'patrimonio' && !naoAssina.value)
const carteiraSemAssinatura = computed(() => naoAssina.value && props.resumo?.state !== 'connect')
const semCarteira = computed(() => props.resumo?.state === 'connect')

const estado = computed(() => (agora.value ? estadoDoPregao(agora.value).estado : null))
const dia = computed(() => {
  const d = props.resumo?.dia ?? null
  const ib = bolsa.value?.ibov
  if (!d || d.bolsaPct != null || estado.value !== 'aberta' || !ib || ib.data !== d.priceDate) return d
  return { ...d, bolsaPct: ib.pct }
})
const frases = computed(() => (dia.value && estado.value && agora.value ? frasesDoDia(dia.value, estado.value, agora.value) : null))

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pctAbs = (n: number) => `${nf2.format(Math.abs(n))}%`
const maiuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

/**
 * A frase do dia, com o número: 'Na sexta, sua carteira subiu 0,11%.' Em dia de
 * alerta, o papel é o sujeito ('Petrobras caiu 7,20% na sexta.'), como no título de hoje.
 */
const fraseDoDia = computed(() => {
  const d = dia.value
  const f = frases.value
  if (!d || !f || d.carteiraPct == null) return null
  const caiu = f.aoVivo ? 'cai' : 'caiu'
  const subiu = f.aoVivo ? 'sobe' : 'subiu'
  if (d.alerta) return `${d.alerta.nome} ${caiu} ${pctAbs(d.alerta.pct)} ${f.aoVivo ? 'hoje' : f.quando}.`
  const c = d.carteiraPct
  const quando = f.aoVivo ? 'Até agora' : maiuscula(f.quando)
  if (Math.abs(c) < 0.005) return `${quando}, sua carteira ${f.aoVivo ? 'está estável' : 'ficou estável'}.`
  return `${quando}, sua carteira ${c < 0 ? caiu : subiu} ${pctAbs(c)}.`
})
/** a linha de apoio: o veredito contra a bolsa e a causa; em dia de alerta, a carteira inteira */
const apoioDoDia = computed(() => {
  const f = frases.value
  if (!f) return ''
  return dia.value?.alerta ? (f.apoio ?? '') : [f.veredito, f.apoio].filter(Boolean).join(' ')
})
/** o estado ao lado do nome: 'Tudo normal' no dia comum, 'Pede atenção' no alerta; em dia de movimento forte, só a data */
const selo = computed(() => {
  const f = frases.value
  if (!f) return null
  if (dia.value?.alerta) return { texto: 'Pede atenção', tom: 'ambar' as const }
  return f.titulo === 'Tudo normal.' ? { texto: 'Tudo normal', tom: 'verde' as const } : null
})

const ESCONDIDO = 'R$ ••••••'
const fatos = computed(() => {
  const r = props.resumo
  if (!r || r.state !== 'patrimonio') return []
  const lista: { k: string; rotulo: string; valor: string; to: string; tom?: 'up' | 'down' }[] = []
  if (r.patrimonio) lista.push({ k: 'patrimonio', rotulo: 'Quanto eu tenho?', valor: visiveis.value ? r.patrimonio : ESCONDIDO, to: '/carteira' })
  const v = dia.value?.diaValor
  if (v != null && frases.value) {
    lista.push({
      k: 'dia', rotulo: frases.value.diaRotulo, to: '/carteira',
      valor: visiveis.value ? `${v > 0 ? '+' : v < 0 ? '−' : ''}R$ ${nf2.format(Math.abs(v))}` : ESCONDIDO,
      tom: visiveis.value && Math.abs(v) >= 0.005 ? (v < 0 ? 'down' : 'up') : undefined,
    })
  }
  if (r.proventos12m) lista.push({ k: 'proventos', rotulo: 'Proventos em 12 meses', valor: visiveis.value ? r.proventos12m : ESCONDIDO, to: '/carteira#renda' })
  return lista
})
/* ————— o gráfico suave: a carteira contra o CDI em 12 meses ————— */
const rel = useCarteiraRelatorio()
// só para quem vê a carteira: o relatório é da pessoa, e pedir sem assinatura dá 402
watch(() => comCarteira.value && podeVerNumeros.value, (pode) => { if (pode) void rel.carregar() }, { immediate: true })
const series = computed(() => (rel.estado.value === 'pronto' ? rel.relatorio.value?.series ?? null : null))
const desde = computed(() => dataDoCorte(12))
/** um ponto por semana (o último pregão de cada 5) e sempre o último: a linha fica suave sem mudar a conta */
function semanal<T>(s: T[]): T[] {
  if (s.length <= 2) return s
  const out = s.filter((_, i) => i % 5 === 0)
  if (out[out.length - 1] !== s[s.length - 1]) out.push(s[s.length - 1]!)
  return out
}
const linhaDiaria = computed(() => (series.value ? rebase100(serieDesde(series.value.carteira, desde.value)) : []))
const linha = computed(() => semanal(linhaDiaria.value))
const linhaCdi = computed(() => (series.value ? semanal(serieDesde(series.value.cdi, desde.value)) : []))
// a conta da legenda é da série diária inteira (o primeiro e o último ponto são os mesmos)
const twr = computed(() => variacaoDoIndice(linhaDiaria.value))
const bem = computed(() => (series.value ? contraOCdi(series.value, desde.value, 'em 12 meses') : null))
const graficoCarregando = computed(() => rel.estado.value === 'fechado' || rel.estado.value === 'carregando')
const pct = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${nf2.format(Math.abs(n))}%`
const contextoGrafico = computed(() => (bem.value ? {
  id: 'home:grafico', tipo: 'grafico', rotulo: 'Sua carteira em 12 meses',
  texto: `${bem.value.frase} ${bem.value.detalhe}`.trim(),
} : null))
const ola = computed(() => `Olá${firstName.value ? `, ${firstName.value}` : ''}.`)
</script>

<template>
  <section class="haf" aria-labelledby="haf-titulo">
    <!-- a linha do nome: quem é, o estado do dia e o olho -->
    <header class="haf__cab">
      <div class="haf__id">
        <p class="haf__ola">{{ ola }}</p>
        <template v-if="comCarteira && podeVerNumeros && frases">
          <span v-if="selo" class="haf__selo" :class="`haf__selo--${selo.tom}`"><i aria-hidden="true" />{{ selo.texto }}</span>
          <span class="haf__quando">{{ frases.sobrelinha }}</span>
        </template>
        <span v-else-if="!comCarteira || podeVerNumeros" class="haf__quando">{{ momento.rotulo }}</span>
      </div>
      <button
        v-if="comCarteira && podeVerNumeros" type="button" class="haf__olho" :aria-pressed="visiveis"
        :aria-label="visiveis ? 'Esconder os valores' : 'Mostrar os valores'" :title="visiveis ? 'Esconder os valores' : 'Mostrar os valores'" @click="alternar"
      >
        <svg v-if="visiveis" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M1 1l22 22" /></svg>
      </button>
    </header>

    <!-- com carteira: a frase do dia, o losango e a fileira -->
    <template v-if="comCarteira">
      <div class="haf__corpo">
        <div v-contexto-chat="podeVerNumeros && frases ? { id: 'home:dia', tipo: 'carteira', rotulo: 'Seu dia', texto: [frases.sobrelinha, fraseDoDia, apoioDoDia].filter(Boolean).join('\n') } : null" class="haf__texto">
          <template v-if="podeVerNumeros && fraseDoDia">
            <h1 id="haf-titulo" class="haf__frase"><FraseDestaque :texto="fraseDoDia" /></h1>
            <p v-if="apoioDoDia" class="haf__dek">{{ apoioDoDia }}</p>
          </template>
          <template v-else-if="podeVerNumeros">
            <h1 id="haf-titulo" class="haf__frase">O resultado de hoje ainda não chegou.</h1>
            <p class="haf__dek">Assim que o preço do dia entrar, a resposta aparece aqui.</p>
          </template>
          <template v-else>
            <h1 id="haf-titulo" class="haf__sr">A sua carteira hoje</h1>
            <NuSkeleton width="min(620px, 92%)" height="clamp(40px, 5vw, 62px)" radius="chip" />
            <NuSkeleton width="min(420px, 64%)" height="clamp(40px, 5vw, 62px)" radius="chip" class="haf__esq" />
            <NuSkeleton variant="text" :lines="2" last-width="60%" class="haf__esq haf__esq--dek" />
          </template>
          <div class="haf__acoes">
            <NuxtLink to="/carteira" class="haf__botao">
              Abrir minha carteira
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </NuxtLink>
            <NuxtLink v-if="podeVerNumeros && dia?.alerta" to="/carteira" class="haf__botao haf__botao--2">Ver {{ dia.alerta.ticker }} na carteira</NuxtLink>
          </div>
        </div>
        <!-- o desenho: a carteira contra o CDI em 12 meses, suave (sem eixos nem mira) -->
        <NuxtLink v-if="linha.length >= 2" v-contexto-chat="contextoGrafico" to="/carteira" class="haf__graf" aria-label="Ver a rentabilidade na carteira">
          <span class="haf__graf-leg">
            <span class="haf__graf-t">Sua carteira em 12 meses</span>
            <span class="haf__graf-v">
              <span><i class="haf__traco" aria-hidden="true" />Você <b>{{ twr != null ? pct(twr) : '' }}</b></span>
              <span v-if="bem"><i class="haf__traco haf__traco--cdi" aria-hidden="true" />CDI <b>{{ pct(bem.cdi) }}</b></span>
            </span>
          </span>
          <span class="haf__graf-area">
            <AtivoGrafico
              :ativo="linha" :ibov="linhaCdi" ticker="Você" rotulo-hoje="Você em 12 meses" :atual="twr != null ? pct(twr) : ''"
              unidade="%" comparacao="CDI" tom="claro" sem-marcas rotulo="A rentabilidade da carteira contra o CDI em 12 meses" :rotulo-abaixo-ate="45"
            />
          </span>
        </NuxtLink>
        <div v-else-if="!podeVerNumeros || graficoCarregando" class="haf__graf haf__graf--esq" aria-hidden="true">
          <NuSkeleton width="180px" height="14px" radius="chip" />
          <NuSkeleton height="clamp(180px, 20vw, 260px)" radius="card" class="haf__esq" />
        </div>
      </div>

      <dl v-if="podeVerNumeros" class="haf__fatos">
        <div v-for="f in fatos" :key="f.k" class="haf__fato">
          <dt>{{ f.rotulo }}</dt>
          <dd>
            <NuxtLink v-contexto-chat="{ id: `home:fato:${f.k}`, tipo: 'carteira', rotulo: f.rotulo, texto: `${f.rotulo}: ${f.valor}` }" :to="f.to" class="haf__link" :class="f.tom && `haf__link--${f.tom}`">
              {{ f.valor }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
            </NuxtLink>
          </dd>
        </div>
      </dl>
      <div v-else class="haf__fatos" aria-hidden="true">
        <div v-for="i in 3" :key="i" class="haf__fato">
          <NuSkeleton width="96px" height="14px" radius="chip" />
          <NuSkeleton width="160px" height="26px" radius="chip" class="haf__esq--fato" />
        </div>
      </div>
    </template>

    <!-- carteira conectada sem assinatura, ou sem carteira: o passo que falta -->
    <template v-else-if="carteiraSemAssinatura || semCarteira">
      <div class="haf__corpo haf__corpo--so">
        <div class="haf__texto">
          <p class="haf__passo">Falta um passo</p>
          <h1 id="haf-titulo" class="haf__frase">
            <template v-if="semCarteira">Conecte a sua <b>carteira</b>.</template>
            <template v-else-if="resumo?.state === 'patrimonio'">A sua carteira <b>está pronta</b>.</template>
            <template v-else>Teste a sua <b>carteira</b>.</template>
          </h1>
          <p class="haf__dek">
            <template v-if="semCarteira">A Redentia junta os seus investimentos de qualquer banco, testa a carteira em 2.000 cenários e passa a vigiar todo dia por você.</template>
            <template v-else-if="resumo?.state === 'patrimonio'">Ela já chegou do seu banco. Assine para a Redentia testar a carteira em 2.000 cenários e vigiar todo dia por você.</template>
            <template v-else>Assine para a Redentia juntar os seus bancos, testar a carteira em 2.000 cenários e vigiar todo dia por você.</template>
          </p>
          <HomeChamada
            tom="claro" :centro="false" class="haf__chamada"
            :rotulo="carteiraSemAssinatura ? (resumo?.state === 'patrimonio' ? 'Ver a minha carteira' : 'Conectar carteira') : undefined"
          />
        </div>
      </div>
    </template>

    <!-- resumo fora do ar: só o caminho, sem número -->
    <template v-else>
      <div class="haf__corpo haf__corpo--so">
        <div class="haf__texto">
          <h1 id="haf-titulo" class="haf__frase">A sua carteira está <b>a um clique</b>.</h1>
          <div class="haf__acoes">
            <NuxtLink to="/carteira" class="haf__botao">
              Abrir minha carteira
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
/* A mesma moldura do topo da /carteira (CarteiraHeroi): creme, a tinta em três
   forças, o fio de 10% e o azul só no destaque. A primeira tela inteira segue
   sendo deste topo (a faixa "Seus ativos" chega pelo cliente e nasce abaixo
   da dobra: sem salto de layout), com o conteúdo distribuído na altura. */
.haf {
  --g: clamp(22px, 5.5vw, 80px);
  --tinta: var(--nu-ink); --sub: var(--nu-gray-2); --fio: rgba(10, 10, 12, .1);
  display: flex; flex-direction: column; min-height: max(560px, calc(100svh - 128px)); box-sizing: border-box;
  padding: clamp(24px, 3vw, 40px) var(--g) clamp(28px, 3.4vw, 44px); background: var(--nu-cream); color: var(--tinta); font-variant-numeric: tabular-nums;
}
.haf__cab { display: flex; align-items: center; justify-content: space-between; gap: 12px 20px; }
.haf__id { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 14px; min-width: 0; }
.haf__ola { margin: 0; font-size: var(--nu-fs-xl); font-weight: 700; letter-spacing: -0.02em; }
.haf__selo { display: inline-flex; align-items: center; gap: 8px; font-size: var(--nu-fs-sm); font-weight: 700; }
.haf__selo i { width: 8px; height: 8px; border-radius: 50%; }
.haf__selo--verde i { background: var(--nu-green); box-shadow: 0 0 0 3px var(--nu-green-tint); }
.haf__selo--ambar { color: var(--nu-amber-text); }
.haf__selo--ambar i { background: var(--nu-amber-fill); }
.haf__quando { color: var(--sub); font-size: var(--nu-fs-sm); font-weight: 500; }
.haf__olho {
  display: inline-grid; place-items: center; flex-shrink: 0; width: 44px; height: 44px; border: 0; border-radius: 50%;
  background: var(--nu-white); color: var(--tinta); cursor: pointer; transition: background .2s;
}
.haf__olho:hover { background: var(--nu-cream-4); }
.haf__olho:focus-visible, .haf__botao:focus-visible, .haf__link:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

.haf__corpo { flex: 1; display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); align-items: center; gap: 28px clamp(28px, 5vw, 72px); padding: clamp(24px, 4vw, 52px) 0; }
.haf__corpo--so { grid-template-columns: minmax(0, 1fr); }
.haf__texto { min-width: 0; }
.haf__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.haf__passo { margin: 0 0 14px; color: var(--sub); font-size: var(--nu-fs-eyebrow); font-weight: 600; }
.haf__frase { margin: 0; max-width: 18ch; font-size: var(--nu-fs-h2); font-weight: 500; letter-spacing: -0.035em; line-height: 1.06; text-wrap: balance; }
.haf__frase :deep(b), .haf__frase b { color: var(--nu-blue-text); font-weight: 700; }
.haf__dek { margin: 18px 0 0; max-width: 52ch; color: var(--sub); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; }
.haf__esq { margin-top: 12px; }
.haf__esq--dek { margin-top: 22px; max-width: 520px; }
.haf__acoes { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-top: clamp(24px, 3vw, 36px); }
.haf__botao {
  display: inline-flex; align-items: center; gap: 10px; height: 52px; padding: 0 26px; border-radius: var(--nu-r-pill);
  background: var(--nu-blue); color: var(--nu-white); font-size: var(--nu-fs-md); font-weight: 700; text-decoration: none; transition: background .2s;
}
.haf__botao:hover { background: var(--nu-blue-hover); }
.haf__botao svg { transition: transform .2s; }
.haf__botao:hover svg { transform: translateX(3px); }
.haf__botao--2 { background: var(--nu-white); color: var(--tinta); }
.haf__botao--2:hover { background: var(--nu-cream-4); }
.haf__chamada { margin-top: clamp(24px, 3vw, 36px); }
/* o gráfico suave: sem cartão, só a linha sobre o creme, com a legenda em cima */
.haf__graf { display: flex; flex-direction: column; gap: 14px; justify-self: end; width: min(100%, 600px); color: inherit; text-decoration: none; }
.haf__graf-leg { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 6px 18px; }
.haf__graf-t { color: var(--sub); font-size: var(--nu-fs-sm); font-weight: 600; }
.haf__graf-v { display: flex; flex-wrap: wrap; gap: 4px 16px; color: var(--sub); font-size: var(--nu-fs-sm); font-weight: 600; }
.haf__graf-v span { display: inline-flex; align-items: center; gap: 8px; }
.haf__graf-v b { color: var(--tinta); font-weight: 700; }
.haf__traco { width: 16px; height: 2px; border-radius: 2px; background: var(--nu-blue); }
.haf__traco--cdi { height: 0; background: none; border-top: 2px dashed var(--nu-gray); }
.haf__graf-area { position: relative; display: block; height: clamp(190px, 21vw, 280px); --agr-esq: 0px; --agr-dir: 10px; }
.haf__graf:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 6px; border-radius: 12px; }

.haf__fatos { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 0 clamp(20px, 3vw, 44px); margin: 0; }
.haf__fato { padding: 18px 0 4px; border-top: 1px solid var(--fio); }
.haf__fato dt { color: var(--sub); font-size: var(--nu-fs-sm); font-weight: 600; }
.haf__fato dd { margin: 6px 0 0; }
.haf__esq--fato { margin-top: 8px; }
.haf__link { display: inline-flex; align-items: center; gap: 6px; color: var(--tinta); font-size: var(--nu-fs-2xl); font-weight: 700; letter-spacing: -0.025em; line-height: 1.2; text-decoration: none; }
.haf__link--up { color: var(--nu-green-text); }
.haf__link--down { color: var(--nu-red-text); }
.haf__link svg { color: var(--nu-blue-text); transition: transform .2s; }
.haf__link:hover svg { transform: translateX(3px); }
/* sobre o creme, o esqueleto padrão quase some: um tom acima, com o mesmo brilho */
.haf :deep(.nusk) { --esq: color-mix(in srgb, var(--nu-ink) 9%, var(--nu-cream)); background-image: linear-gradient(100deg, var(--esq) 25%, var(--nu-white) 50%, var(--esq) 75%); }

@media (max-width: 900px) {
  .haf__corpo { grid-template-columns: minmax(0, 1fr); align-items: start; }
  .haf__graf { justify-self: stretch; width: 100%; }
}
@media (max-width: 640px) {
  .haf__quando { flex-basis: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .haf__botao svg, .haf__link svg { transition: none; }
}
</style>
