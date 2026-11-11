<script setup lang="ts">
// Os rankings na home do visitante (31/10/2026, pedido do dono: "Quem mais
// subiu e caiu" sai da bolsa do dia e vira esta seção, "com mais rankings e
// com o botão para acessar os rankings, tipo ver todos embaixo"). Seis
// cartões, três nomes em cada, e o "Ver todos" de cada um:
//  - maiores altas e baixas entre as empresas do Ibovespa no último pregão
//    (o mesmo dado da bolsa do dia, useBolsaDoDia); o "Ver todos" leva ao
//    ranking do mês, que é o que o site tem;
//  - maiores dividend yields, Redentia Score e maiores empresas: o mesmo
//    pedido da prévia do /rankings (fetchRanking + rankingTable), então o 1º
//    daqui é o 1º da página;
//  - o cartão de todos os rankings.
// Nome da empresa antes do código, para quem está começando.
//
// Aportou (11/11/2026): a seção é a faixa quente (--nu-band) com os cartões
// brancos do contrato; abre com o eyebrow da marca; o estado da bolsa é um selo
// de raio 8 (o ponto não pulsa mais: animação sem fim só no anel do input e no
// esqueleto); as variações do dia são selos verde e vermelho; o cartão de todos
// os rankings é o painel azul da marca, com o corte gigante ao fundo. O
// "Redentia Score" passa a se chamar Aportou Score no texto (o slug
// /ranking/redentia-score e o campo da API não mudam).
import { RANKINGS } from '~/content/rankings/registry'
import { agoraEmSP, estadoDoPregao, quandoFoi } from '~/utils/pregao'
import { nomeDaEmpresa } from '~/utils/nomeB3'

// a entrada da seção: antes do await (o onMounted do useReveal precisa registrar)
const { el: secao, revealClass } = useReveal(0.25, { soEmbeleza: true })
const { bolsa } = await useBolsaDoDia()

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const comSinal = (v: number) => (Math.abs(v) < 0.005 ? '0,00%' : `${v > 0 ? '+' : '−'}${nf2.format(Math.abs(v))}%`)

interface Linha { nome: string; ticker: string; valor: string; tom?: 'up' | 'down' }
interface Cartao { slug: string; titulo: string; sub: string; ver: string; linhas: Linha[]; aba?: 'acoes' }

// as altas e as baixas do dia, uma linha por empresa
const quando = computed(() => (bolsa.value?.ibov ? quandoFoi(bolsa.value.ibov.data) ?? '' : ''))
const doDia = computed<Cartao[]>(() => {
  const acoes = bolsa.value?.acoes ?? []
  if (acoes.length < 6) return []
  const umaPorEmpresa = (lista: typeof acoes) => {
    const vistas = new Set<string>()
    return lista.filter((a) => (vistas.has(a.empresa) ? false : (vistas.add(a.empresa), true))).slice(0, 3)
  }
  const ordem = [...acoes].sort((a, b) => b.pct - a.pct)
  const linha = (a: (typeof acoes)[number]): Linha => ({ nome: a.empresa, ticker: a.ticker, valor: comSinal(a.pct), tom: a.pct < 0 ? 'down' : 'up' })
  const sub = `Entre as ${acoes.length} do Ibovespa, ${quando.value}`
  return [
    { slug: 'maiores-altas-mes', titulo: 'Maiores altas', sub, ver: 'Ver as altas do mês', linhas: umaPorEmpresa(ordem.filter((a) => a.pct > 0)).map(linha) },
    { slug: 'maiores-baixas-mes', titulo: 'Maiores baixas', sub, ver: 'Ver as baixas do mês', linhas: umaPorEmpresa([...ordem].reverse().filter((a) => a.pct < 0)).map(linha) },
  ]
})

// O nome dos rankings vem da B3 com um espaço só ("GRENDENE ON NM"); o
// nomeDaEmpresa separa os campos por dois. Antes, o nome limpo do Ibovespa.
const CLASSE = /\s+(?=(?:ON|PN|PNA|PNB|UNT|UNIT|NM|N1|N2|EJ|ED|EDJ|ES)\b)/
function nomeLimpo(bruto: string, ticker: string): string {
  const doIbov = bolsa.value?.acoes.find((a) => a.ticker === ticker)?.empresa
  return doIbov ?? nomeDaEmpresa(bruto.replace(CLASSE, '  '))
}

// os rankings da bolsa: o topo da própria página do ranking
// "Maiores empresas" fica nas ações (na aba Todos vêm os BDRs de Nvidia e Apple na frente)
const DA_BOLSA: { slug: string; titulo: string; sub: string; aba?: 'acoes' }[] = [
  { slug: 'maiores-dividend-yield', titulo: 'Maiores dividend yields', sub: 'Quanto pagaram em proventos, em 12 meses' },
  { slug: 'redentia-score', titulo: 'Aportou Score', sub: 'A nota de 0 a 100 da Aportou para cada empresa' },
  { slug: 'maiores-valor-mercado', titulo: 'Maiores empresas da bolsa', sub: 'Pelo valor de mercado, só ações', aba: 'acoes' },
]
const { data: daBolsa } = await useAsyncData('home:rankings', async () => {
  const lidos = await Promise.allSettled(DA_BOLSA.map(async (r) => {
    const meta = RANKINGS[r.slug]
    if (!meta) return null
    const resp = await fetchRanking(meta.endpoint, rankingFetchParams(meta, r.aba ?? 'todos'))
    const col = RANKING_COLUMNS[meta.primaryMetric]
    // uma linha por empresa (a Petrobras ON e a PN não ocupam duas das três)
    const vistas = new Set<string>()
    const linhas = rankingTable(resp.data ?? [], meta.columns, meta.primaryMetric, 50).rows
      .filter((row) => col.raw(row) != null)
      .map((row) => ({ nome: nomeLimpo(rankingName(row), rankingTicker(row)), ticker: rankingTicker(row), valor: col.format(row) }))
      .filter((l) => (vistas.has(l.nome) ? false : (vistas.add(l.nome), true)))
      .slice(0, 3)
    return linhas.length ? { ...r, ver: 'Ver todos', linhas } : null
  }))
  return lidos.map((x) => (x.status === 'fulfilled' ? x.value : null)).filter((x): x is Cartao => !!x)
})

const cartoes = computed<Cartao[]>(() => [...doDia.value, ...(daBolsa.value ?? [])])
const totalDeRankings = Object.keys(RANKINGS).length

// o selo de tempo real: com a bolsa aberta, "Ao vivo" e a hora do dado (as
// altas e baixas se atualizam a cada minuto junto com a bolsa do dia, a B3
// entrega com 15 min de atraso); fechada, de qual pregão são os números
const agora = useState('home:bolsa-agora', () => Date.now())
const selo = computed(() => {
  const ib = bolsa.value?.ibov
  if (!ib) return null
  const hoje = new Date(agora.value)
  const aberta = estadoDoPregao(hoje).estado === 'aberta' && ib.data === agoraEmSP(hoje).iso
  const t = ib.asOf ? Date.parse(ib.asOf) : Number.NaN
  const hora = Number.isFinite(t) ? (() => { const { hora: h, minuto: m } = agoraEmSP(new Date(t)); return `${h}h${String(m).padStart(2, '0')}` })() : null
  if (aberta) return { vivo: true, texto: 'Ao vivo', detalhe: `${hora ? `atualizado às ${hora} · ` : ''}B3 com 15 min de atraso` }
  const dia = new Date(`${ib.data}T12:00:00Z`).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', timeZone: 'UTC' }).replace('-feira', '')
  return { vivo: false, texto: 'Bolsa fechada', detalhe: `números do pregão de ${dia}` }
})
</script>

<template>
  <section v-if="cartoes.length" ref="secao" class="hrk" :class="revealClass" aria-labelledby="hrk-titulo">
    <div class="hrk__cabeca">
      <NuEyebrow como="p">A B3 em fila</NuEyebrow>
      <h2 id="hrk-titulo" class="hrk__titulo">Os rankings.</h2>
      <p class="hrk__sub">Quem mais sobe e cai no pregão, em tempo real, e os rankings da bolsa inteira.</p>
      <p v-if="selo" class="hrk__selo" :class="{ 'hrk__selo--vivo': selo.vivo }">
        <strong><i class="hrk__ponto" aria-hidden="true" />{{ selo.texto }}</strong><span>{{ selo.detalhe }}</span>
      </p>
    </div>

    <div class="hrk__grade">
      <article
        v-for="c in cartoes" :key="c.slug"
        v-contexto-chat="{ id: `ranking:${c.slug}`, tipo: 'ranking', rotulo: rotuloCurto(`Ranking · ${c.titulo}`), texto: [c.titulo, c.sub, ...c.linhas.map((l, i) => `${i + 1}. ${l.ticker} (${l.nome}): ${l.valor}`)].filter(Boolean).join('\n') }"
        class="hrk__cartao"
      >
        <h3 class="hrk__nome">{{ c.titulo }}</h3>
        <p class="hrk__cartao-sub">{{ c.sub }}</p>
        <ol class="hrk__linhas">
          <li v-for="(l, i) in c.linhas" :key="l.ticker">
            <NuxtLink :to="`/asset/${l.ticker}`" class="hrk__linha">
              <span class="hrk__pos">{{ i + 1 }}</span>
              <span class="hrk__id">
                <span class="hrk__empresa">{{ l.nome }}</span>
                <span class="hrk__ticker">{{ l.ticker }}</span>
              </span>
              <span class="hrk__valor" :class="l.tom && `hrk__valor--${l.tom}`">{{ l.valor }}</span>
            </NuxtLink>
          </li>
        </ol>
        <NuxtLink :to="{ path: `/ranking/${c.slug}`, query: c.aba ? { type: c.aba } : undefined }" class="hrk__ver">
          {{ c.ver }}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </NuxtLink>
      </article>

      <!-- todos os rankings: o painel azul da marca -->
      <NuxtLink to="/rankings" class="hrk__cartao hrk__todos">
        <MarcaCorte class="hrk__todos-corte nu-corte-fundo" :largura="300" cor="var(--nu-white)" />
        <span class="hrk__todos-num">{{ totalDeRankings }}</span>
        <span class="hrk__todos-txt">rankings da bolsa, de dividendos a preço justo, atualizados todo dia.</span>
        <span class="hrk__ver hrk__ver--cheio">
          Ver todos os rankings
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </span>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
/* a faixa quente da marca, no contêiner de 1.240 px */
.hrk { background: var(--nu-band); padding: clamp(64px, 7vw, 100px) max(32px, calc((100% - 1176px) / 2)); }
.hrk__titulo { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.03em; line-height: 1.02; }
.hrk__sub { margin: 20px 0 0; max-width: 620px; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500; line-height: 1.45; text-wrap: pretty; }
/* o estado da bolsa: selo de raio 8 e, ao lado, de quando são os números */
.hrk__selo { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 12px; margin: 22px 0 0; color: var(--nu-gray); font-size: 14.5px; font-weight: 500; }
.hrk__selo strong {
  display: inline-flex; align-items: center; gap: 8px; padding: 5px 10px; border-radius: var(--nu-r-tag);
  background: var(--nu-white); color: var(--nu-ink); font-size: 13.5px; font-weight: 700; line-height: 1.3;
}
.hrk__ponto { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-sand); }
.hrk__selo--vivo strong { background: var(--nu-green-bg); color: var(--nu-green-text); }
.hrk__selo--vivo .hrk__ponto { background: var(--nu-green); }

.hrk__grade { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: clamp(32px, 3.6vw, 40px); }
@media (max-width: 1100px) { .hrk__grade { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .hrk__grade { grid-template-columns: 1fr; } }
/* o cartão branco sobre a faixa */
.hrk__cartao { display: flex; flex-direction: column; padding: 24px 24px 20px; border-radius: var(--nu-r-card); background: var(--nu-white); box-shadow: var(--nu-shadow-quente); }
.hrk__nome { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.02em; }
.hrk__cartao-sub { margin: 4px 0 0; color: var(--nu-gray); font-size: 14.5px; font-weight: 500; }
.hrk__linhas { list-style: none; margin: 12px 0 0; padding: 0; }
.hrk__linha {
  display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 8px 10px; margin: 0 -10px;
  border-top: 1.5px solid var(--nu-line-2); color: var(--nu-ink); transition: background .2s;
}
.hrk__linhas > li:first-child .hrk__linha { border-top-color: transparent; }
.hrk__linha:hover { background: var(--nu-row-hover); border-radius: var(--nu-r-chip); color: var(--nu-ink); }
.hrk__pos { width: 16px; flex: none; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 800; font-variant-numeric: tabular-nums; }
.hrk__id { flex: 1; min-width: 0; }
.hrk__empresa { display: block; font-size: 16.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hrk__ticker { display: block; color: var(--nu-gray); font-size: 13.5px; font-weight: 600; letter-spacing: .04em; }
.hrk__valor { flex: none; font-size: var(--nu-fs-md); font-weight: 800; font-variant-numeric: tabular-nums; }
/* a variação do dia é o selo de raio 8 da marca */
.hrk__valor--up, .hrk__valor--down { padding: 4px 9px; border-radius: var(--nu-r-tag); font-size: 14.5px; font-weight: 700; }
.hrk__valor--up { background: var(--nu-green-bg); color: var(--nu-green-text); }
.hrk__valor--down { background: var(--nu-red-bg); color: var(--nu-red-text); }
.hrk__ver {
  align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 12px; min-height: 44px;
  color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700;
}
.hrk__ver:hover { color: var(--nu-blue-hover); }
.hrk__ver svg { transition: transform .2s ease; }
.hrk__ver:hover svg, .hrk__todos:hover .hrk__ver svg { transform: translateX(3px); }
/* o cartão de todos os rankings: o painel azul, o convite */
.hrk__todos {
  position: relative; isolation: isolate; overflow: hidden; justify-content: flex-start; gap: 8px;
  background: var(--nu-grad-cobalto); color: var(--nu-white); box-shadow: none;
  transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s cubic-bezier(.2, .8, .2, 1);
}
.hrk__todos:hover { color: var(--nu-white); transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.hrk__todos:active { transform: scale(.99); }
/* posição e tamanho são da classe global .nu-corte-fundo (sempre no canto de cima à esquerda) */
.hrk__todos-corte { z-index: -1; opacity: .08; }
.hrk__todos-num { font-size: clamp(46px, 5.2vw, 68px); font-weight: 800; letter-spacing: -0.035em; line-height: 1; }
.hrk__todos-txt { max-width: 28ch; color: var(--nu-blue-on-blue); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.4; }
.hrk__ver--cheio, .hrk__todos:hover .hrk__ver--cheio { color: var(--nu-white); }

/* entrada: o cabeçalho e os cartões em cascata de 60 ms */
.hrk.is-in .hrk__cabeca, .hrk.is-in .hrk__cartao { animation: nu-fade .5s ease backwards; }
.hrk.is-in .hrk__cartao:nth-child(1) { animation-delay: .06s; }
.hrk.is-in .hrk__cartao:nth-child(2) { animation-delay: .12s; }
.hrk.is-in .hrk__cartao:nth-child(3) { animation-delay: .18s; }
.hrk.is-in .hrk__cartao:nth-child(4) { animation-delay: .24s; }
.hrk.is-in .hrk__cartao:nth-child(5) { animation-delay: .3s; }
.hrk.is-in .hrk__cartao:nth-child(6) { animation-delay: .36s; }

@media (max-width: 760px) {
  .hrk { padding-inline: 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .hrk__ver svg, .hrk__todos { transition: none; }
}
</style>
