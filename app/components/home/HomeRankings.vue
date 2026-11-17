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
//
// Robustez (11/11/2026, docs/aportou/robustez.md): as peças da base no lugar
// das feitas à mão: o estado da bolsa e as variações do dia são o NuSelo, o
// "Ver todos" é o NuLinkSeta (a seta que anda e o sublinhado que aparece). O
// cartão branco sobre a faixa leva a sombra de cartão branco (era a do creme).
// A linha sob o ponteiro ganha o fundo com o raio concêntrico do cartão e os
// fios em volta dela somem (o fundo não fica cortado por dois traços);
// apertada, escurece. A entrada é o v-revelar, em cascata de 60 ms.
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
/** o endereço do "Ver todos" (o mesmo de antes, em texto: o NuLinkSeta recebe string) */
const destino = (c: Cartao) => `/ranking/${c.slug}${c.aba ? `?type=${c.aba}` : ''}`
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
    <div v-revelar="{ alvo: 'filhos' }" class="hrk__cabeca">
      <NuEyebrow como="p">A B3 em fila</NuEyebrow>
      <h2 id="hrk-titulo" class="hrk__titulo">Os rankings.</h2>
      <p class="hrk__sub">Quem mais sobe e cai no pregão, em tempo real, e os rankings da bolsa inteira.</p>
      <!-- o estado da bolsa: o selo verde com o ponto ao vivo; fechada, o selo de contorno (metadado) -->
      <p v-if="selo" class="hrk__selo">
        <NuSelo :tom="selo.vivo ? 'verde' : 'contorno'" ponto>{{ selo.texto }}</NuSelo><span>{{ selo.detalhe }}</span>
      </p>
    </div>

    <div v-revelar="{ alvo: 'filhos' }" class="hrk__grade">
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
              <!-- o logo de cada empresa (pedido do dono, 11/11/2026); sem logo, a letra -->
              <NuAssetLogo :ticker="l.ticker" :letter="l.ticker.charAt(0)" tile-bg="var(--nu-cream-2)" tile-fg="var(--nu-ink)" :size="40" :radius="12" class="hrk__logo" />
              <span class="hrk__id">
                <span class="hrk__empresa">{{ l.nome }}</span>
                <span class="hrk__ticker">{{ l.ticker }}</span>
              </span>
              <!-- a variação do dia é o selo da marca; os números dos rankings da bolsa, texto tabular -->
              <NuSelo v-if="l.tom" :tom="l.tom === 'down' ? 'vermelho' : 'verde'" class="hrk__valor hrk__valor--selo">{{ l.valor }}</NuSelo>
              <span v-else class="hrk__valor">{{ l.valor }}</span>
            </NuxtLink>
          </li>
        </ol>
        <p class="hrk__pe"><NuLinkSeta :to="destino(c)">{{ c.ver }}</NuLinkSeta></p>
      </article>

      <!-- todos os rankings: o painel azul da marca -->
      <NuxtLink to="/rankings" class="hrk__cartao hrk__todos">
        <MarcaCorte class="hrk__todos-corte nu-corte-fundo" :largura="300" cor="var(--nu-white)" />
        <span class="hrk__todos-num">{{ totalDeRankings }}</span>
        <span class="hrk__todos-txt">rankings da bolsa, de dividendos a preço justo, atualizados todo dia.</span>
        <!-- o cartão inteiro é o link: o rótulo desenha o NuLinkSeta claro (a seta de 16 px que anda e o sublinhado do hover) -->
        <span class="hrk__todos-ver">
          <span class="hrk__todos-ver-t">Ver todos os rankings</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg>
        </span>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
/* a faixa quente da marca: a coluna de 1.240 px e o ritmo de seção do sistema */
.hrk { background: var(--nu-band); padding: clamp(72px, 8vw, 128px) var(--nu-coluna); }
.hrk__titulo { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1.02; }
.hrk__sub { margin: 20px 0 0; max-width: 620px; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.45; text-wrap: pretty; }
/* o estado da bolsa: o selo e, ao lado, de quando são os números (a legenda) */
.hrk__selo { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 12px; margin: 24px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); }

.hrk__grade { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: clamp(40px, 4.4vw, 56px); }
@media (max-width: 1100px) { .hrk__grade { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .hrk__grade { grid-template-columns: 1fr; } }
/* o cartão branco sobre a faixa: a sombra de cartão branco (fio de 1 px e camadas que quase não se veem) */
.hrk__cartao { display: flex; flex-direction: column; padding: 24px 24px 20px; border-radius: var(--nu-r-card); background: var(--nu-white); box-shadow: var(--nu-shadow-branco); }
.hrk__nome { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); }
.hrk__cartao-sub { margin: 4px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); }
.hrk__linhas { list-style: none; margin: 16px 0 0; padding: 0; }
.hrk__logo { flex: none; }
/* a linha: um fio reto de 1 px em cima, alinhado com o texto do cartão; sob o
   ponteiro, o fundo com o raio concêntrico (o do cartão menos os 14 px até a
   beira do fundo) e os dois fios em volta dele somem */
.hrk__linha {
  position: relative; display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 8px 10px; margin: 0 -10px;
  border-radius: calc(var(--nu-r-card) - 14px); color: var(--nu-ink);
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor);
}
.hrk__linha::before {
  content: ''; position: absolute; top: 0; left: 10px; right: 10px; height: 1px; background: var(--nu-line-2);
  pointer-events: none; transition: opacity var(--nu-dur-media) var(--nu-ease-cor);
}
.hrk__linhas > li:first-child .hrk__linha::before { opacity: 0; }
.hrk__linha:hover { background: var(--nu-row-hover); color: var(--nu-ink); }
.hrk__linha:hover::before, .hrk__linhas > li:hover + li .hrk__linha::before { opacity: 0; }
.hrk__linha:active { background: color-mix(in srgb, var(--nu-ink) 5%, var(--nu-row-hover)); transition-duration: var(--nu-dur-rapida); }
.hrk__pos { width: 16px; flex: none; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }
.hrk__id { flex: 1; min-width: 0; }
.hrk__empresa { display: block; font-size: 16.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hrk__ticker { display: block; color: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-medio); letter-spacing: .04em; }
.hrk__valor { flex: none; font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; }
/* a variação do dia: o NuSelo (o peso e a altura dele) */
.hrk__valor--selo { font-size: 14px; font-weight: var(--nu-w-medio); }
/* o "Ver todos" no pé do cartão (o NuLinkSeta tem o alvo de 44 px por dentro) */
.hrk__pe { margin: auto 0 0; padding-top: 16px; font-size: var(--nu-fs-md); }
/* o cartão de todos os rankings: o painel azul, o convite; sobe 2 px e ganha a sombra no hover */
.hrk__todos {
  position: relative; isolation: isolate; overflow: hidden; justify-content: flex-start; gap: 8px;
  background: var(--nu-grad-cobalto); color: var(--nu-white); box-shadow: none;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
.hrk__todos:hover { color: var(--nu-white); transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.hrk__todos:active { transform: scale(.995); transition-duration: var(--nu-dur-rapida); }
.hrk__todos:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
/* posição e tamanho são da classe global .nu-corte-fundo (sempre no canto de cima à esquerda) */
.hrk__todos-corte { z-index: -1; opacity: .08; }
.hrk__todos-num { font-size: clamp(46px, 5.2vw, 68px); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1; }
.hrk__todos-txt { max-width: 28ch; color: var(--nu-blue-on-blue); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.4; }
.hrk__todos-ver {
  display: inline-flex; align-items: center; gap: 6px; min-height: 44px; margin-top: auto; padding-top: 16px;
  color: var(--nu-white); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
}
.hrk__todos-ver-t {
  text-decoration-line: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px;
  text-decoration-color: transparent; transition: text-decoration-color var(--nu-dur-media) var(--nu-ease-cor);
}
.hrk__todos-ver svg { flex: none; transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.hrk__todos:hover .hrk__todos-ver-t { text-decoration-color: currentColor; }
.hrk__todos:hover .hrk__todos-ver svg { transform: translateX(3px); }

@media (prefers-reduced-motion: reduce) {
  .hrk__todos, .hrk__todos-ver svg, .hrk__linha { transition: none; }
  .hrk__todos:hover, .hrk__todos:active { transform: none; }
}
</style>
