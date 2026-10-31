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
import { RANKINGS } from '~/content/rankings/registry'
import { agoraEmSP, estadoDoPregao, quandoFoi } from '~/utils/pregao'
import { nomeDaEmpresa } from '~/utils/nomeB3'

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
  { slug: 'redentia-score', titulo: 'Redentia Score', sub: 'A nota de 0 a 100 da Redentia para cada empresa' },
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
  <section v-if="cartoes.length" class="hrk" aria-labelledby="hrk-titulo">
    <p v-if="selo" class="hrk__selo" :class="{ 'hrk__selo--vivo': selo.vivo }">
      <i class="hrk__ponto" aria-hidden="true" /><strong>{{ selo.texto }}</strong><span>{{ selo.detalhe }}</span>
    </p>
    <h2 id="hrk-titulo" class="hrk__titulo">Os rankings.</h2>
    <p class="hrk__sub">Quem mais sobe e cai no pregão, em tempo real, e os rankings da bolsa inteira.</p>

    <div class="hrk__grade">
      <article v-for="c in cartoes" :key="c.slug" class="hrk__cartao">
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

      <!-- todos os rankings -->
      <NuxtLink to="/rankings" class="hrk__cartao hrk__todos">
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
.hrk { background: var(--nu-cream); padding: clamp(56px, 7vw, 92px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.hrk__selo {
  display: inline-flex; align-items: center; gap: 8px; margin: 0 0 16px; padding: 7px 14px 7px 12px; border-radius: var(--nu-r-pill);
  background: var(--nu-white); color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500;
}
.hrk__selo strong { color: var(--nu-ink); font-weight: 800; }
.hrk__ponto { position: relative; width: 9px; height: 9px; border-radius: 50%; background: var(--nu-sand); }
.hrk__selo--vivo strong { color: var(--nu-green-text); }
.hrk__selo--vivo .hrk__ponto { background: var(--nu-green); }
/* ao vivo, o ponto pulsa: o sinal de que o número está andando */
.hrk__selo--vivo .hrk__ponto::after {
  content: ''; position: absolute; inset: 0; border-radius: 50%; background: var(--nu-green);
  animation: hrk-pulso 1.6s ease-out infinite;
}
@keyframes hrk-pulso { from { transform: scale(1); opacity: .6; } to { transform: scale(2.6); opacity: 0; } }
.hrk__titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02; }
.hrk__sub { margin: 14px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 500; }
.hrk__grade { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 32px; }
@media (max-width: 1100px) { .hrk__grade { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .hrk__grade { grid-template-columns: 1fr; } }
.hrk__cartao { display: flex; flex-direction: column; padding: 22px 24px; border-radius: var(--nu-r-card-lg); background: var(--nu-white); }
.hrk__nome { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -0.01em; }
.hrk__cartao-sub { margin: 4px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.hrk__linhas { list-style: none; margin: 12px 0 0; padding: 0; }
.hrk__linha {
  display: flex; align-items: center; gap: 12px; min-height: 52px; padding: 8px 10px; margin: 0 -10px;
  border-top: 1px solid var(--nu-cream-line); border-radius: 12px; color: var(--nu-ink); transition: background .15s;
}
.hrk__linhas > li:first-child .hrk__linha { border-top: none; }
.hrk__linha:hover { background: var(--nu-cream); color: var(--nu-ink); }
.hrk__linha:focus-visible, .hrk__ver:focus-visible, .hrk__todos:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.hrk__pos { width: 16px; flex: none; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 800; font-variant-numeric: tabular-nums; }
.hrk__id { flex: 1; min-width: 0; }
.hrk__empresa { display: block; font-size: var(--nu-fs-md); font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hrk__ticker { display: block; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; }
.hrk__valor { flex: none; font-size: var(--nu-fs-md); font-weight: 800; font-variant-numeric: tabular-nums; }
.hrk__valor--up { color: var(--nu-green-text); }
.hrk__valor--down { color: var(--nu-red-text); }
.hrk__ver {
  align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 14px; min-height: 44px;
  color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 700;
}
.hrk__ver:hover { color: var(--nu-blue-hover); }
.hrk__ver svg { transition: transform .2s ease; }
.hrk__ver:hover svg, .hrk__todos:hover .hrk__ver svg { transform: translateX(3px); }
/* o cartão de todos os rankings: azul, o convite */
.hrk__todos { background: var(--nu-blue); color: var(--nu-white); justify-content: flex-start; gap: 6px; }
.hrk__todos:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
.hrk__todos-num { font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1; }
.hrk__todos-txt { max-width: 28ch; color: var(--nu-white-85); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.4; }
.hrk__ver--cheio { color: var(--nu-white); }
.hrk__todos:hover .hrk__ver--cheio { color: var(--nu-white); }
@media (prefers-reduced-motion: reduce) {
  .hrk, .hrk__selo--vivo .hrk__ponto::after { animation: none; }
  .hrk__ver svg { transition: none; }
}
</style>
