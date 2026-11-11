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
//
// Aportou (11/11/2026): a mesma tela, com a personalidade da marca nova. O
// fundo é o creme da página; a frase do dia sobe para 800, com o número em
// cobalto (o molde do H1 do quadro, "Entenda antes de investir"); ela abre com
// o eyebrow da marca ("Seu dia", o nome que esse bloco já tem no contexto do
// chat); o estado ao lado do nome é um selo de raio 8; "Abrir minha carteira"
// é a pílula com a seta no círculo e a segunda ação, um link em negrito; os
// três números vão em 800 sobre fios de 1,5 px. Dados, frases e estados: iguais.
//
// Segunda rodada (11/11/2026, o dono: "dê uma atenção especial à tela inicial e
// à carteira"): a home de quem tem conta passa a falar a mesma língua do topo da
// /carteira (CarteiraHeroi).
//  - o ritmo: saiu a altura mínima de tela cheia, que abria um vazio entre a
//    saudação e a frase e outro antes dos números; em 1440×900 a primeira dobra
//    mostra a saudação, a frase, os botões, o gráfico e o começo dos fatos;
//  - o gráfico de 12 meses mora no cartão carvão com a faixa da marca
//    (NuFaixaMarca, "VOCÊ EM 12 MESES"), como no /asset e na /carteira: o número
//    de quem lê em verde claro (ou vermelho claro), o CDI ao lado, a linha de
//    luz do AtivoGrafico (tom "luz") e a tracejada do CDI. Mesma série, mesma
//    conta, mesma legenda;
//  - os três fatos viram cartões creme (raio 28, sombra quente, número em 800,
//    a seta que anda); o do dia fica âmbar quando o dia tem alerta (um papel que
//    caiu 5% ou mais: `dia.alerta`, o único aviso que o resumo da home traz).
// O selo ao lado do nome ("Tudo normal" / "Pede atenção") sai do resumo do dia
// e, desde 11/11/2026, também do aviso urgente do motor de avisos, como o da
// /carteira (ver "O AVISO DO MOTOR" abaixo): as duas telas dizem a mesma coisa.
//
// Robustez (11/11/2026, docs/aportou/robustez.md):
//  - o selo do dia é o NuSelo (com o ponto); quando ele troca ("Tudo normal" →
//    "Pede atenção", o aviso do motor que chega depois), a troca é um fade, não
//    um pulo; o número do dia na frase herda o peso do título, como na /carteira
//    (FraseDestaque): a cor já o destaca;
//  - a segunda ação é o NuLinkSeta (a seta que anda), não mais o link sublinhado;
//  - o cartão do gráfico carrega no PRÓPRIO desenho: o cartão carvão com a faixa
//    e o esqueleto escuro no lugar da legenda e da linha, da mesma altura. Antes
//    era um bloco creme 8 px mais baixo que virava carvão de uma vez (o texto ao
//    lado pulava junto). Se o relatório não vier, o cartão diz e oferece "Tentar
//    de novo"; com pouca história para desenhar, a frase ocupa a largura toda;
//  - os cartões clicáveis (o gráfico, o leque, os fatos) mostram que são clique
//    (a seta no canto do cartão escuro, a seta que anda nos fatos), sobem 2 px
//    no hover e afundam ao apertar; o valor que troca (o olho) troca com fade;
//  - pesos, tracking, durações e curvas pelos tokens; o selo dos 2.000 futuros
//    é o NuSelo azul sobre o escuro, como no herói do visitante.
import type { CarteiraResumoVM } from '~/types/carteira'
import { frasesDoDia } from '~/utils/diaDaCarteira'
import { estadoDoPregao } from '~/utils/pregao'
import { avisosLiberados } from '~/utils/carteiraVisao'
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
// O AVISO DO MOTOR (11/11/2026). O selo da home só conhecia o alerta do dia (um
// papel que caiu 5% ou mais) e dizia "Tudo normal" enquanto a /carteira dizia
// "Pede atenção" por um aviso urgente do motor (uma conexão parada, por
// exemplo). Para as duas telas dizerem a mesma coisa, a home consulta os
// avisos da /carteira: só no cliente, depois de montar, para quem tem carteira
// e assina, e sem segurar a primeira pintura. Sem resposta (a visão desligada
// para a pessoa, rede, 5xx) o selo fica como era. A regra de quando o aviso já
// pode aparecer é a mesma da carteira (avisosLiberados: só com a bolsa aberta
// ou depois dela, nunca antes das 10h de um dia de pregão).
const { token } = useAuthState()
const avisoUrgente = ref(false)
async function consultarAvisos() {
  if (!token.value) return
  try {
    const v = await $fetch<{ avisos?: { urgente?: string | null; itens?: { id: string }[] } }>('/api/backend/me/carteira/visao', {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token.value}` },
    })
    const id = v.avisos?.urgente
    avisoUrgente.value = !!id && !!v.avisos?.itens?.some((a) => a.id === id)
  } catch { /* a home segue com o selo do dia */ }
}
watch(() => comCarteira.value && podeVerNumeros.value, (pode) => { if (pode && import.meta.client) void consultarAvisos() }, { immediate: true })
const avisoDoMotor = computed(() => avisoUrgente.value && !!estado.value && avisosLiberados(estado.value))

/** o estado ao lado do nome: 'Tudo normal' no dia comum, 'Pede atenção' no alerta do dia ou no aviso urgente do motor; em dia de movimento forte, só a data */
const selo = computed(() => {
  const f = frases.value
  if (!f) return null
  if (dia.value?.alerta || avisoDoMotor.value) return { texto: 'Pede atenção', tom: 'ambar' as const }
  return f.titulo === 'Tudo normal.' ? { texto: 'Tudo normal', tom: 'verde' as const } : null
})

const ESCONDIDO = 'R$ ••••••'
const fatos = computed(() => {
  const r = props.resumo
  if (!r || r.state !== 'patrimonio') return []
  const lista: { k: string; rotulo: string; valor: string; to: string; tom?: 'up' | 'down'; atencao?: boolean }[] = []
  if (r.patrimonio) lista.push({ k: 'patrimonio', rotulo: 'Quanto eu tenho?', valor: visiveis.value ? r.patrimonio : ESCONDIDO, to: '/carteira' })
  const v = dia.value?.diaValor
  if (v != null && frases.value) {
    lista.push({
      k: 'dia', rotulo: frases.value.diaRotulo, to: '/carteira',
      valor: visiveis.value ? `${v > 0 ? '+' : v < 0 ? '−' : ''}R$ ${nf2.format(Math.abs(v))}` : ESCONDIDO,
      tom: visiveis.value && Math.abs(v) >= 0.005 ? (v < 0 ? 'down' : 'up') : undefined,
      // o dia com alerta (um papel que caiu 5% ou mais) é o cartão de atenção
      atencao: !!dia.value?.alerta,
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
/** o relatório não veio (rede, 5xx): o cartão diz e oferece de novo o mesmo pedido */
const graficoErro = computed(() => podeVerNumeros.value && rel.estado.value === 'erro')
/** veio, mas com pouca história para desenhar: a frase fica sozinha, na largura toda */
const semGrafico = computed(() => podeVerNumeros.value && rel.estado.value === 'pronto' && linha.value.length < 2)
function tentarDeNovo() { void rel.carregar() }
const pct = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${nf2.format(Math.abs(n))}%`
/** a direção do número grande do cartão: verde claro se rendeu, vermelho claro se perdeu */
const twrDir = computed(() => (twr.value == null || Math.abs(twr.value) < 0.005 ? null : twr.value < 0 ? 'down' : 'up'))
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
          <!-- o aviso do motor leva à carteira, onde ele está explicado; o do dia é só o estado.
               O selo é o NuSelo; a troca de um para o outro (o aviso chega depois) é um fade -->
          <Transition name="haf-troca" mode="out-in" appear>
            <NuxtLink v-if="selo && avisoDoMotor && !dia?.alerta" key="aviso" to="/carteira" class="haf__selo-link">
              <NuSelo :tom="selo.tom" ponto class="haf__selo">{{ selo.texto }}<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg></NuSelo>
            </NuxtLink>
            <NuSelo v-else-if="selo" :key="selo.texto" :tom="selo.tom" ponto class="haf__selo">{{ selo.texto }}</NuSelo>
          </Transition>
          <span class="haf__quando">{{ frases.sobrelinha }}</span>
        </template>
        <span v-else-if="!comCarteira || podeVerNumeros" class="haf__quando">{{ momento.rotulo }}</span>
        <!-- o estado e a data ainda chegando: a linha guarda o lugar (no celular ela é a 2ª linha do nome) -->
        <span v-else class="haf__quando" aria-hidden="true"><NuSkeleton variant="line" width="11em" height="1.2em" radius="chip" /></span>
      </div>
      <button
        v-if="comCarteira && podeVerNumeros" type="button" class="haf__olho" :aria-pressed="visiveis"
        :aria-label="visiveis ? 'Esconder os valores' : 'Mostrar os valores'" :title="visiveis ? 'Esconder os valores' : 'Mostrar os valores'" @click="alternar"
      >
        <svg v-if="visiveis" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M1 1l22 22" /></svg>
      </button>
    </header>

    <!-- com carteira: a frase do dia, o cartão do gráfico e os três fatos -->
    <template v-if="comCarteira">
      <div class="haf__corpo" :class="{ 'haf__corpo--sem-graf': semGrafico }">
        <div v-contexto-chat="podeVerNumeros && frases ? { id: 'home:dia', tipo: 'carteira', rotulo: 'Seu dia', texto: [frases.sobrelinha, fraseDoDia, apoioDoDia].filter(Boolean).join('\n') } : null" class="haf__texto">
          <NuEyebrow como="p" class="haf__eyebrow">Seu dia</NuEyebrow>
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
            <!-- o esqueleto nas medidas da frase pronta: duas linhas do título e duas do apoio -->
            <span class="haf__esq-frase" aria-hidden="true">
              <NuSkeleton width="min(620px, 92%)" height="calc(var(--nu-fs-h2) * .92)" radius="chip" />
              <NuSkeleton width="min(420px, 64%)" height="calc(var(--nu-fs-h2) * .92)" radius="chip" />
            </span>
            <span class="haf__esq-dek" aria-hidden="true">
              <NuSkeleton variant="line" width="min(520px, 100%)" height="calc(var(--dek) * .82)" radius="chip" />
              <NuSkeleton variant="line" width="min(312px, 60%)" height="calc(var(--dek) * .82)" radius="chip" />
              <!-- no celular o apoio quebra em três linhas -->
              <NuSkeleton variant="line" width="40%" height="calc(var(--dek) * .82)" radius="chip" class="haf__esq-3" />
            </span>
          </template>
          <div class="haf__acoes">
            <NuBotaoSeta to="/carteira" tamanho="m">Abrir minha carteira</NuBotaoSeta>
            <!-- a segunda ação é o link com seta da base (tinta, sobre o creme) -->
            <NuLinkSeta v-if="podeVerNumeros && dia?.alerta" to="/carteira" tom="tinta" class="haf__segunda">Ver {{ dia.alerta.ticker }} na carteira</NuLinkSeta>
            <!-- os 2.000 caminhos de 5 anos moram na /carteira (CarteiraFuturo, #futuro): a home só leva até lá -->
            <NuLinkSeta v-else-if="podeVerNumeros" to="/carteira#futuro" tom="tinta" class="haf__segunda">Ver a carteira em 5 anos</NuLinkSeta>
            <!-- a segunda ação ainda chegando: o lugar dela (no celular ela desce para baixo do botão) -->
            <NuSkeleton v-else variant="line" width="12.5em" height="1.35em" radius="chip" class="haf__segunda" aria-hidden="true" />
          </div>
        </div>
        <!-- o desenho: a carteira contra o CDI em 12 meses, no cartão carvão com a faixa da marca (como no /asset e na /carteira) -->
        <NuxtLink v-if="linha.length >= 2" v-contexto-chat="contextoGrafico" to="/carteira" class="haf__graf haf__graf--vivo" aria-label="Ver a rentabilidade na carteira">
          <NuFaixaMarca rotulo="Você em 12 meses" como="span" :altura="52" class="haf__cartao">
            <!-- o cartão inteiro é o clique: a seta no canto diz isso (anda 3 px no hover) -->
            <template #acoes><span class="haf__abre" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg></span></template>
            <span class="haf__legenda">
              <span class="haf__leg haf__leg--1">
                <b :class="twrDir && `haf__leg--${twrDir}`">{{ twr != null ? pct(twr) : '' }}</b>
                <span class="haf__leg-r"><i class="haf__traco" aria-hidden="true" />Você</span>
              </span>
              <span v-if="bem" class="haf__leg">
                <b>{{ pct(bem.cdi) }}</b>
                <span class="haf__leg-r"><i class="haf__traco haf__traco--cdi" aria-hidden="true" />CDI</span>
              </span>
            </span>
            <span class="haf__graf-area">
              <AtivoGrafico
                :ativo="linha" :ibov="linhaCdi" ticker="Você" rotulo-hoje="Você em 12 meses" :atual="twr != null ? pct(twr) : ''"
                unidade="%" comparacao="CDI" tom="luz" sem-marcas rotulo="A rentabilidade da carteira contra o CDI em 12 meses" :rotulo-abaixo-ate="45"
              />
            </span>
          </NuFaixaMarca>
        </NuxtLink>
        <!-- o relatório não veio: o mesmo cartão, a frase e o mesmo pedido de novo -->
        <div v-else-if="graficoErro" class="haf__graf">
          <NuFaixaMarca rotulo="Você em 12 meses" como="span" :altura="52" class="haf__cartao">
            <span class="haf__vazio" role="status">
              <span class="haf__vazio-txt">O gráfico de 12 meses não carregou agora.</span>
              <NuLinkSeta tom="claro" class="haf__vazio-acao" @click="tentarDeNovo">Tentar de novo</NuLinkSeta>
            </span>
          </NuFaixaMarca>
        </div>
        <!-- carregando: o próprio cartão, com o esqueleto escuro no lugar da legenda e da linha (a mesma altura) -->
        <div v-else-if="!semGrafico && (!podeVerNumeros || graficoCarregando)" class="haf__graf haf__graf--esq" aria-hidden="true">
          <NuFaixaMarca rotulo="Você em 12 meses" como="span" :altura="52" class="haf__cartao">
            <span class="haf__legenda">
              <NuSkeleton tone="navy" width="calc(var(--leg-1) * 5.3)" height="var(--leg-1)" radius="chip" />
              <NuSkeleton tone="navy" width="calc(var(--leg-2) * 6.2)" height="calc(var(--leg-2) * 1.4)" radius="chip" />
            </span>
            <span class="haf__graf-area haf__graf-area--esq"><NuSkeleton tone="navy" width="100%" height="100%" radius="chip" /></span>
          </NuFaixaMarca>
        </div>
      </div>

      <dl v-if="podeVerNumeros" class="haf__fatos">
        <div v-for="f in fatos" :key="f.k" class="haf__fato" :class="{ 'haf__fato--atencao': f.atencao }">
          <dt>{{ f.rotulo }}</dt>
          <dd>
            <!-- o link cobre o cartão inteiro (o ::after); o valor que troca (o olho) troca com fade -->
            <NuxtLink v-contexto-chat="{ id: `home:fato:${f.k}`, tipo: 'carteira', rotulo: f.rotulo, texto: `${f.rotulo}: ${f.valor}` }" :to="f.to" class="haf__link" :class="f.tom && `haf__link--${f.tom}`">
              <Transition name="haf-troca" mode="out-in"><span :key="f.valor" class="haf__valor">{{ f.valor }}</span></Transition>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg>
            </NuxtLink>
          </dd>
        </div>
      </dl>
      <!-- carregando: os três cartões com as duas linhas da altura final (o rótulo e o número) -->
      <div v-else class="haf__fatos" aria-hidden="true">
        <div v-for="i in 3" :key="i" class="haf__fato">
          <NuSkeleton variant="line" width="120px" height="calc(14px * 1.4)" radius="chip" />
          <NuSkeleton width="170px" height="calc(1.1 * clamp(26px, 2.5vw, 34px))" radius="chip" class="haf__esq--fato" />
        </div>
      </div>
    </template>

    <!-- carteira conectada sem assinatura, ou sem carteira: o passo que falta -->
    <template v-else-if="carteiraSemAssinatura || semCarteira">
      <div class="haf__corpo">
        <div class="haf__texto">
          <NuEyebrow como="p" class="haf__eyebrow">Falta um passo</NuEyebrow>
          <h1 id="haf-titulo" class="haf__frase">
            <template v-if="semCarteira">Conecte a sua <b>carteira</b>.</template>
            <template v-else-if="resumo?.state === 'patrimonio'">A sua carteira <b>está pronta</b>.</template>
            <template v-else>Teste a sua <b>carteira</b>.</template>
          </h1>
          <p class="haf__dek">
            <template v-if="semCarteira">A Aportou junta os seus investimentos de qualquer banco, testa a carteira em 2.000 cenários e passa a vigiar todo dia por você.</template>
            <template v-else-if="resumo?.state === 'patrimonio'">Ela já chegou do seu banco. Assine para a Aportou testar a carteira em 2.000 cenários e vigiar todo dia por você.</template>
            <template v-else>Assine para a Aportou juntar os seus bancos, testar a carteira em 2.000 cenários e vigiar todo dia por você.</template>
          </p>
          <HomeChamada
            tom="claro" :centro="false" sem-apps class="haf__chamada"
            :rotulo="carteiraSemAssinatura ? (resumo?.state === 'patrimonio' ? 'Ver a minha carteira' : 'Conectar carteira') : undefined"
          />
        </div>
        <!-- o que vem depois do passo: o teste dos 2.000 cenários, a mesma
             ilustração do herói do visitante (sem número de ninguém), no cartão
             com a faixa da marca; o cartão leva ao mesmo lugar da chamada -->
        <NuxtLink to="/assinar?quiz=1&de=home-leque" class="haf__graf haf__graf--vivo" aria-label="Conectar a carteira e ver o teste dos 2.000 cenários">
          <NuFaixaMarca rotulo="Daqui a 5 anos" como="span" :altura="52" class="haf__cartao">
            <template #acoes><span class="haf__abre" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg></span></template>
            <HomeLeque tom="carvao" class="haf__leque" />
            <span class="haf__leque-pe"><NuSelo tom="azul" sobre="escuro" class="haf__leque-selo"><strong>2.000</strong> futuros testados para a sua carteira</NuSelo></span>
          </NuFaixaMarca>
        </NuxtLink>
      </div>
    </template>

    <!-- resumo fora do ar: só o caminho, sem número -->
    <template v-else>
      <div class="haf__corpo haf__corpo--so">
        <div class="haf__texto">
          <h1 id="haf-titulo" class="haf__frase">A sua carteira está <b>a um clique</b>.</h1>
          <div class="haf__acoes">
            <NuBotaoSeta to="/carteira" tamanho="m">Abrir minha carteira</NuBotaoSeta>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
/* A mesma moldura do topo da /carteira (CarteiraHeroi), na marca nova: o creme
   da página, a tinta em três forças e o cobalto só no destaque. O ritmo é o do
   contrato (a saudação, 24 a 40 px, a frase e o cartão, 24 a 40 px, os fatos):
   nada de altura mínima de tela cheia, que abria vazios entre os blocos. A
   coluna é a de 1.240 do sistema (--nu-coluna). */
.haf {
  --g: var(--nu-coluna);
  --tinta: var(--nu-ink); --sub: var(--nu-gray);
  padding: clamp(24px, 2.6vw, 40px) var(--g) clamp(32px, 3.6vw, 48px); background: var(--nu-page); color: var(--tinta); font-variant-numeric: tabular-nums;
}
/* a linha do nome guarda a altura do olho (44 px) antes de ele chegar: nada abaixo pula */
.haf__cab { display: flex; align-items: center; justify-content: space-between; gap: 12px 20px; min-height: 44px; }
.haf__id { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 12px; min-width: 0; }
/* a linha do nome tem a altura do selo (28 px) com ou sem ele: o que vem embaixo não pula quando ele chega */
.haf__ola { margin: 0; font-size: var(--nu-fs-xl); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 28px; }
/* o estado do dia é o NuSelo (verde no dia comum, âmbar quando pede atenção);
   o do aviso do motor é um link em volta dele: escurece e a seta anda 2 px */
.haf__selo svg { flex: none; }
.haf__selo-link { display: inline-flex; border-radius: var(--nu-r-tag); text-decoration: none; -webkit-tap-highlight-color: transparent; }
.haf__selo-link .haf__selo { transition: background-color var(--nu-dur-media) var(--nu-ease-cor); }
.haf__selo-link .haf__selo svg { transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.haf__selo-link:hover .haf__selo { --nsl-fundo: color-mix(in srgb, var(--nu-amber) 30%, var(--nu-amber-bg)); }
.haf__selo-link:hover .haf__selo svg { transform: translateX(2px); }
.haf__selo-link:active .haf__selo { --nsl-fundo: color-mix(in srgb, var(--nu-amber) 42%, var(--nu-amber-bg)); transition-duration: var(--nu-dur-rapida); }
.haf__selo-link:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 2px; }
/* a troca de estado (o selo que muda, o valor que o olho esconde): fade de 280 ms, sem pulo */
.haf-troca-enter-active, .haf-troca-leave-active { transition: opacity var(--nu-dur-media) var(--nu-ease-cor); }
.haf-troca-enter-from, .haf-troca-leave-to { opacity: 0; }
.haf__quando { color: var(--sub); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
/* o olho: o botão de ícone do contrato (círculo de 44 px, contorno carvão de 1,5 px: é interação), o mesmo da /carteira */
.haf__olho {
  display: inline-grid; place-items: center; flex-shrink: 0; width: 44px; height: 44px; border: 0; border-radius: 50%;
  background: var(--nu-white); color: var(--tinta); box-shadow: inset 0 0 0 1.5px var(--nu-ink); cursor: pointer;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
  -webkit-tap-highlight-color: transparent;
}
.haf__olho:hover { background: var(--nu-row-hover); }
.haf__olho:active { transform: scale(.96); }

/* a frase à esquerda e o cartão do gráfico à direita, alinhados pelo meio */
.haf__corpo { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.02fr); align-items: center; gap: 32px clamp(32px, 4vw, 56px); margin-top: clamp(24px, 2.8vw, 40px); }
.haf__corpo--so { grid-template-columns: minmax(0, 1fr); padding: clamp(16px, 3vw, 40px) 0 0; }
/* com pouca história para desenhar, a frase fica sozinha (sem uma coluna vazia ao lado) */
.haf__corpo--sem-graf { grid-template-columns: minmax(0, 1fr); }
.haf__texto { min-width: 0; }
.haf__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.haf__eyebrow { margin-bottom: 18px; }
/* a frase do dia: o peso de exibição, com o número em cobalto (o peso é o do
   título, como na /carteira: a cor já destaca) */
.haf__frase { margin: 0; max-width: 17ch; font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1.02; text-wrap: balance; }
.haf__frase :deep(b), .haf__frase b { color: var(--nu-blue); font-weight: inherit; }
.haf__dek { margin: 20px 0 0; max-width: 46ch; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.45; text-wrap: pretty; }
/* o esqueleto da frase: as duas linhas do título (2 × 1,02 do tamanho) e as duas do apoio (2 × 1,45) */
.haf__esq-frase { display: flex; flex-direction: column; gap: calc(var(--nu-fs-h2) * .2); }
.haf__esq-dek .haf__esq-3 { display: none; }
.haf__esq-dek { --dek: clamp(18px, 1.5vw, 21px); display: flex; flex-direction: column; gap: calc(var(--dek) * .63); margin-top: 20px; padding: calc(var(--dek) * .315) 0; }
.haf__acoes { display: flex; align-items: center; flex-wrap: wrap; gap: 12px 32px; margin-top: clamp(24px, 2.6vw, 32px); }
/* a segunda ação: o NuLinkSeta tinta (o tamanho da letra é de quem usa) */
.haf__segunda { font-size: var(--nu-fs-md); }
.haf__chamada { margin-top: clamp(24px, 3vw, 40px); }

/* o cartão carvão com a faixa da marca. As medidas da legenda e da área do
   gráfico são variáveis: o esqueleto e o aviso de erro usam as mesmas e ficam
   da altura do cartão pronto (a troca não empurra nada) */
.haf__graf { display: block; min-width: 0; color: inherit; text-decoration: none; border-radius: var(--nu-r-card); }
/* clicável: sobe 2 px no hover, afunda ao apertar */
.haf__graf--vivo { transition: transform var(--nu-dur-media) var(--nu-ease-saida); -webkit-tap-highlight-color: transparent; }
.haf__graf--vivo:hover { transform: translateY(-2px); }
.haf__graf--vivo:active { transform: scale(.995); transition-duration: var(--nu-dur-rapida); }
.haf__graf:focus-visible { outline-offset: 4px; }
.haf__cartao {
  --pad: clamp(18px, 2vw, 28px);
  --leg-m: clamp(16px, 1.8vw, 22px); --leg-1: clamp(36px, 4vw, 52px); --leg-2: clamp(20px, 2vw, 26px);
  --area: clamp(170px, 15vw, 210px);
  display: flex; flex-direction: column; padding-bottom: clamp(14px, 1.6vw, 20px);
}
/* a seta no canto do cartão escuro: diz que o cartão inteiro abre; acende e anda no hover */
.haf__abre {
  display: grid; place-items: center; width: 36px; height: 36px; margin: 8px 8px 0 0; border-radius: 50%;
  background: var(--nu-dark-chip); box-shadow: inset 0 0 0 1px var(--nu-dark-chip-line); color: var(--nu-white);
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), box-shadow var(--nu-dur-media) var(--nu-ease-cor);
}
.haf__abre svg { transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.haf__graf--vivo:hover .haf__abre { background: var(--nu-blue); box-shadow: inset 0 0 0 1px var(--nu-blue); }
.haf__graf--vivo:hover .haf__abre svg { transform: translateX(2px); }
.haf__legenda { display: flex; align-items: baseline; gap: 6px 28px; flex-wrap: wrap; margin: var(--leg-m) var(--pad) 0; }
.haf__leg { display: inline-flex; align-items: baseline; gap: 10px; }
.haf__leg b { color: var(--nu-white); font-size: var(--leg-2); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); }
/* o número de quem lê: grande, no peso de exibição */
.haf__leg--1 b { font-size: var(--leg-1); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1; }
.haf__leg b.haf__leg--up { color: var(--nu-green-soft); }
.haf__leg b.haf__leg--down { color: var(--nu-red-soft); }
.haf__leg-r { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-on-dark-2); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.haf__traco { width: 14px; height: 2px; border-radius: 1px; background: var(--nu-blue-on-dark); }
.haf__traco--cdi { background: repeating-linear-gradient(90deg, var(--nu-white-35) 0 3px, transparent 3px 7px); }
/* o gráfico vai de beira a beira do cartão; o ponto de hoje e o rótulo recuam
   (as variáveis que o AtivoGrafico aceita, as mesmas do /asset) */
.haf__graf-area {
  position: relative; display: block; height: var(--area); margin-top: 12px;
  --agr-esq: var(--pad); --agr-dir: max(var(--pad), 44px); --agr-rotulo-esq: var(--pad);
  --agr-hoje-bg: var(--nu-creme); --agr-hoje-fg: var(--nu-ink); --agr-hoje-sub: var(--nu-gray);
}
/* o dado que chega no cartão (depois do esqueleto): fade de 280 ms, o cartão não se mexe */
a.haf__graf .haf__legenda, a.haf__graf .haf__graf-area { animation: nu-surgir var(--nu-dur-media) var(--nu-ease-cor) both; }
/* carregando: o esqueleto escuro nas medidas da legenda (as variáveis do cartão) e da linha */
.haf__graf--esq .haf__legenda { align-items: flex-end; }
.haf__graf-area--esq { padding: 0 var(--pad); }
/* o relatório não veio: a frase e "Tentar de novo", na altura do gráfico */
.haf__vazio {
  display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 12px;
  min-height: calc(var(--leg-m) + var(--leg-1) + 12px + var(--area)); padding: 0 var(--pad);
  font-size: var(--nu-fs-md);
}
.haf__vazio-txt { color: var(--nu-on-dark); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.4; }
/* o leque (quem ainda não testou a carteira) */
.haf__leque { display: block; width: 100%; height: clamp(220px, 22vw, 300px); margin-top: 4px; }
.haf__leque-pe { display: flex; padding: 0 clamp(16px, 2.4vw, 28px) clamp(16px, 2.2vw, 24px); }
/* o selo dos 2.000 futuros: o NuSelo azul sobre o escuro (a legenda do desenho, não um botão) */
.haf__leque-selo {
  height: 32px; padding: 0 12px; gap: 6px; font-size: var(--nu-fs-sm);
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor);
}
.haf__leque-selo strong { color: var(--nu-white); font-weight: var(--nu-w-forte); }
.haf__graf--vivo:hover .haf__leque-selo { --nsl-fundo: color-mix(in srgb, var(--nu-blue-on-dark) 30%, transparent); }

/* os três fatos: cartões creme do contrato; o de atenção, em âmbar */
.haf__fatos { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: clamp(12px, 1.4vw, 16px); margin: clamp(24px, 3vw, 40px) 0 0; }
.haf__fato {
  position: relative; display: flex; flex-direction: column; justify-content: center; padding: clamp(18px, 2vw, 24px) clamp(20px, 2.2vw, 28px);
  border-radius: var(--nu-r-card); background: var(--nu-card); box-shadow: var(--nu-shadow-quente);
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
/* o dado que chega no cartão (depois do esqueleto): fade em cascata de 60 ms; o cartão fica onde está */
dl.haf__fatos .haf__fato > * { animation: nu-surgir var(--nu-dur-media) var(--nu-ease-cor) both; }
dl.haf__fatos .haf__fato:nth-child(2) > * { animation-delay: 60ms; }
dl.haf__fatos .haf__fato:nth-child(3) > * { animation-delay: 120ms; }
dl.haf__fatos .haf__fato:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
dl.haf__fatos .haf__fato:active { transform: scale(.995); transition-duration: var(--nu-dur-rapida); }
.haf__fato--atencao { background: var(--nu-amber-bg); }
.haf__fato--atencao dt { color: var(--nu-amber-text); }
.haf__fato dt { color: var(--sub); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); line-height: 1.4; }
.haf__fato dd { margin: 6px 0 0; }
.haf__esq--fato { margin-top: 6px; }
.haf__link { display: inline-flex; align-items: center; gap: 6px; color: var(--tinta); font-size: clamp(26px, 2.5vw, 34px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.1; text-decoration: none; -webkit-tap-highlight-color: transparent; }
/* o alvo do clique é o cartão inteiro */
.haf__link::after { content: ''; position: absolute; inset: 0; border-radius: var(--nu-r-card); }
.haf__link--up { color: var(--nu-green-text); }
.haf__link--down { color: var(--nu-red-text); }
.haf__valor { display: inline-block; }
.haf__link svg { flex: none; color: var(--nu-blue-text); transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.haf__fato--atencao .haf__link svg { color: var(--nu-amber-text); }
.haf__fato:hover .haf__link svg { transform: translateX(3px); }
.haf__link:focus-visible { outline: none; }
.haf__link:focus-visible::after { outline: 3px solid var(--nu-blue); outline-offset: 2px; }
/* o esqueleto é o da base (recalibrado para o creme em 11/11/2026): o tom local que ficava aqui saiu */

@media (max-width: 1000px) {
  .haf__corpo { grid-template-columns: minmax(0, 1fr); align-items: start; }
  .haf__cartao { --area: clamp(180px, 34vw, 240px); }
}
@media (max-width: 640px) {
  .haf__quando { flex-basis: 100%; }
  /* o nome fica no alto da linha nos dois estados (com e sem o olho ao lado) */
  .haf__cab { align-items: flex-start; }
  .haf__esq-dek .haf__esq-3 { display: block; }
}
@media (prefers-reduced-motion: reduce) {
  .haf__link svg, .haf__olho, .haf__graf, .haf__fato, .haf__abre, .haf__abre svg, .haf__selo-link .haf__selo { transition: none; }
  .haf__graf--vivo:hover, .haf__graf--vivo:active, dl.haf__fatos .haf__fato:hover, dl.haf__fatos .haf__fato:active { transform: none; }
}
</style>
