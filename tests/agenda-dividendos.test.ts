/**
 * Agenda de dividendos: mês inválido é 404, novembro e dezembro de 2026
 * saem 200 com títulos diferentes, e a linha só existe se veio no aviso.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO } from '../app/utils/serp.ts'
import {
  DESC_HUB,
  PATH_HUB,
  SLUGS_FIXOS,
  TITULO_HUB,
  descricaoDoMes,
  entradasAgenda,
  httpDaAgenda,
  hubDeAgenda,
  isoMaisDias,
  itensDoMes,
  lerFontesAgenda,
  lerItensDoCorpo,
  paginaDoMes,
  parseMesAgenda,
  statusDoMes,
  tituloDoMes,
  type FontesAgenda,
  type ItemBruto,
} from '../app/utils/agendaDividendos.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const HOJE = '2026-11-19'

function item(parcial: Partial<ItemBruto> & Pick<ItemBruto, 'ticker' | 'payment_date'>): ItemBruto {
  return {
    name: 'PETROBRAS   PN      N2',
    type: 'STOCK',
    label: 'Dividendo',
    rate: 1,
    last_date_prior: '2026-11-30',
    ...parcial,
  }
}

function fontes(recentes: ItemBruto[], futuros: ItemBruto[], opts?: { recOk?: boolean, futOk?: boolean, recTrunc?: boolean, futTrunc?: boolean }): FontesAgenda {
  const inicio = `${HOJE.slice(0, 8)}01`
  return {
    hoje: HOJE,
    recentes: {
      ok: opts?.recOk !== false,
      truncado: !!opts?.recTrunc,
      desde: opts?.recTrunc || opts?.recOk === false ? null : inicio,
      ate: opts?.recTrunc || opts?.recOk === false ? null : HOJE,
      itens: recentes,
    },
    futuros: {
      ok: opts?.futOk !== false,
      truncado: !!opts?.futTrunc,
      desde: opts?.futTrunc || opts?.futOk === false ? null : HOJE,
      ate: opts?.futTrunc || opts?.futOk === false ? null : isoMaisDias(HOJE, 180),
      itens: futuros,
    },
  }
}

const BASE = fontes(
  [
    item({ ticker: 'MXRF11', name: 'MAXI RENDA  CI', type: 'REIT', label: 'Rendimento', rate: 0.1, payment_date: '2026-11-14', last_date_prior: '2026-11-06' }),
    item({ ticker: 'VALE3', name: 'VALE        ON      NM', payment_date: '2026-10-20', last_date_prior: '2026-10-05' }),
  ],
  [
    item({ ticker: 'PETR4', label: 'JCP', rate: 0.5, payment_date: '2026-12-15', last_date_prior: '2026-11-30' }),
    item({ ticker: 'PETR4', label: 'JCP', rate: 0.5, payment_date: '2026-12-15', last_date_prior: '2026-11-30' }),
    item({ ticker: 'COWC34', name: 'COSTCO      DRN', type: 'BDR', label: 'Dividendo', rate: 0.125388, payment_date: '2026-11-19', last_date_prior: '2026-10-28' }),
    item({ ticker: 'HGLG11', name: 'CSHG LOG    CI', type: 'REIT', label: 'Amortizacao Rf', rate: 2, payment_date: '2027-01-15', last_date_prior: '2027-01-04' }),
  ],
)

test('slug inválido não vira mês, e o canônico de março não leva acento', () => {
  for (const slug of ['', 'dezembro', 'dezembro-2026-extra', '13-2026', 'foo-2026', 'dezembro-1999', 'dezembro-2099', '../dezembro-2026']) {
    assert.equal(parseMesAgenda(slug), null, slug)
  }
  const dez = parseMesAgenda('dezembro-2026')
  const nov = parseMesAgenda('Novembro-2026')
  assert.equal(dez?.slug, 'dezembro-2026')
  assert.equal(nov?.slug, 'novembro-2026')
  assert.equal(nov?.inicio, '2026-11-01')
  assert.equal(nov?.fim, '2026-11-30')
  assert.equal(parseMesAgenda('março-2026')?.slug, 'marco-2026')
  assert.equal(parseMesAgenda('marco-2026')?.nome, 'março')
})

test('novembro e dezembro de 2026 são 200, com títulos únicos, e mês inválido é 404', () => {
  const dezAlvo = parseMesAgenda('dezembro-2026')!
  const novAlvo = parseMesAgenda('novembro-2026')!
  assert.equal(httpDaAgenda(statusDoMes(dezAlvo, BASE)), 200)
  assert.equal(httpDaAgenda(statusDoMes(novAlvo, BASE)), 200)
  assert.equal(httpDaAgenda('invalido'), 404)
  assert.equal(httpDaAgenda(statusDoMes(parseMesAgenda('outubro-2026')!, BASE)), 404)
  assert.equal(httpDaAgenda(statusDoMes(parseMesAgenda('janeiro-2026')!, BASE)), 404)

  const dez = paginaDoMes(BASE, dezAlvo)!
  const nov = paginaDoMes(BASE, novAlvo)!
  const titulos = [TITULO_HUB, dez.titulo, nov.titulo]
  assert.deepEqual(titulos, [
    'Agenda de dividendos',
    'Agenda de dividendos dezembro 2026',
    'Agenda de dividendos novembro 2026',
  ])
  assert.equal(new Set(titulos).size, titulos.length)
  for (const titulo of titulos) assert.ok(titulo.length + SUFIXO_MARCA.length <= TETO_TITULO, titulo)
  for (const desc of [DESC_HUB, dez.description, nov.description]) {
    assert.ok(desc.length <= TETO_DESCRICAO, `${desc.length} ${desc}`)
    assert.match(desc, /Não é recomendação/)
  }
  assert.match(dez.description, /dezembro de 2026/)
  assert.match(nov.description, /novembro de 2026/)
  assert.equal(dez.titulo.includes('novembro'), false)
})

test('a lista filtra pela data de pagamento e não inventa ticker nem valor', () => {
  const dez = paginaDoMes(BASE, parseMesAgenda('dezembro-2026')!)!
  assert.deepEqual(dez.dias.map((d) => d.data), ['2026-12-15'])
  assert.equal(dez.dias[0]!.eventos.length, 1)
  const petr = dez.dias[0]!.eventos[0]!
  assert.equal(petr.ticker, 'PETR4')
  assert.equal(petr.nome, 'Petrobras')
  assert.equal(petr.tipo, 'JCP')
  assert.equal(petr.valor, 'R$ 0,50')
  assert.equal(petr.href, '/dividendos/PETR4')
  assert.equal(petr.dataCom, '2026-11-30')
  assert.equal(petr.dataEx, '2026-12-01')

  const nov = paginaDoMes(BASE, parseMesAgenda('novembro-2026')!)!
  const tickers = nov.dias.flatMap((d) => d.eventos.map((e) => e.ticker))
  assert.deepEqual(tickers, ['MXRF11', 'COWC34'])
  assert.equal(tickers.includes('VALE3'), false)
  assert.equal(tickers.includes('PETR4'), false)
  const bdr = nov.dias.flatMap((d) => d.eventos).find((e) => e.ticker === 'COWC34')!
  assert.equal(bdr.valor, 'R$ 0,1254')
  assert.equal(bdr.dataEx, '2026-10-29')

  const jan = paginaDoMes(BASE, parseMesAgenda('janeiro-2027')!)!
  assert.equal(jan.dias[0]!.eventos[0]!.tipo, 'Amortização')
  assert.equal(jan.dias[0]!.eventos[0]!.dataEx, null)
  assert.equal(jan.dias[0]!.eventos[0]!.dataExTexto, 'Pregão seguinte à data com')
})

test('feed cortado ou fora vira 503, e o hub não linka mês sem lista', () => {
  const nov = parseMesAgenda('novembro-2026')!
  const dez = parseMesAgenda('dezembro-2026')!
  assert.equal(statusDoMes(nov, fontes([], [], { recTrunc: true })), 'indisponivel')
  assert.equal(statusDoMes(dez, fontes([], [], { futOk: false })), 'indisponivel')
  assert.equal(httpDaAgenda('indisponivel'), 503)

  const hub = hubDeAgenda(BASE)
  assert.deepEqual(hub.meses.map((m) => m.slug), ['novembro-2026', 'dezembro-2026', 'janeiro-2027'])
  assert.equal(hub.meses.some((m) => m.slug === 'outubro-2026'), false)
  assert.equal(hub.meses[0]!.total, 2)

  const caido = hubDeAgenda(fontes([], [], { recOk: false, futOk: false }))
  assert.equal(caido.indisponivel, true)
  assert.deepEqual(caido.meses.map((m) => m.slug), [...SLUGS_FIXOS])
  assert.equal(caido.meses[0]!.total, null)

  const entradas = entradasAgenda(null).map((p) => p.path)
  assert.deepEqual(entradas, [PATH_HUB, '/dividendos/agenda/novembro-2026', '/dividendos/agenda/dezembro-2026'])
  const vivas = entradasAgenda(BASE).map((p) => p.path)
  assert.equal(vivas.includes('/dividendos/agenda/janeiro-2027'), true)
  assert.equal(vivas.includes('/dividendos/agenda/outubro-2026'), false)
})

test('título de cada mês cabe no SERP e o FAQ só linka trecho que está na resposta', () => {
  for (const nome of ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']) {
    const titulo = tituloDoMes(nome, 2026)
    const desc = descricaoDoMes(nome, 2026)
    assert.ok(titulo.length + SUFIXO_MARCA.length <= TETO_TITULO, titulo)
    assert.ok(desc.length <= TETO_DESCRICAO, desc)
    assert.match(desc, new RegExp(nome))
    assert.match(desc, /2026/)
  }
  const dez = paginaDoMes(BASE, parseMesAgenda('dezembro-2026')!)!
  for (const faq of [...dez.faq, ...hubDeAgenda(BASE).faq]) {
    assert.equal(faq.q.endsWith('?'), true, faq.q)
    if (faq.link) assert.equal(faq.a.includes(faq.link.texto), true, faq.q)
  }
})

test('corpo do calendário descarta linha sem valor e marca o teto de 500', () => {
  const lido = lerItensDoCorpo({
    total: 2,
    data: [{
      date: '2026-12-15',
      count: 4,
      items: [
        { ticker: 'PETR4', rate: 1, payment_date: '2026-12-15', label: 'Dividendo' },
        { ticker: '', rate: 1, payment_date: '2026-12-15', label: 'Dividendo' },
        { ticker: 'VALE3', rate: 0, payment_date: '2026-12-15', label: 'Dividendo' },
      ],
    }],
  })
  assert.equal(lido.truncado, true)
  assert.deepEqual(lido.itens.map((i) => i.ticker), ['PETR4'])
  assert.equal(lerItensDoCorpo({ total: 500, data: [] }).truncado, true)
})

test('as páginas, o sitemap e o llms publicam as três URLs e o 404', () => {
  const mes = ler('app/pages/dividendos/agenda/[mes].vue')
  const hub = ler('app/pages/dividendos/agenda/index.vue')
  assert.match(mes, /statusCode: 404/)
  assert.match(mes, /statusCode: status === 404 \? 404 : 503/)
  assert.match(mes, /<h1 class="agd__h1">\{\{ pagina\.titulo \}\}<\/h1>/)
  assert.match(mes, /<NuFaqAccordion :items="pagina\.faq"/)
  assert.match(mes, /Não é recomendação|pagina\.nota/)
  assert.match(hub, /<h1 class="agd__h1">\{\{ hub\.titulo \}\}<\/h1>/)
  assert.match(hub, /<NuFaqAccordion :items="hub\.faq"/)
  assert.equal((mes.match(/<h1\b/g) ?? []).length, 1)
  assert.equal((hub.match(/<h1\b/g) ?? []).length, 1)

  const site = ler('server/utils/site-pages.ts')
  assert.match(site, /entradasAgenda\(agendaFontes\)/)
  assert.match(ler('server/routes/llms.txt.ts'), /\/dividendos\/agenda\)/)
  assert.match(ler('server/routes/llms.txt.ts'), /\/dividendos\/agenda\/novembro-2026/)
  assert.match(ler('server/routes/llms.txt.ts'), /\/dividendos\/agenda\/dezembro-2026/)
  assert.match(ler('server/api/dividendos/agenda/[mes].get.ts'), /statusCode: statusHttpAgenda/)
  assert.match(ler('app/pages/dividendos/[ticker].vue'), /to="\/dividendos\/agenda"/)
  assert.match(ler('app/content/rankings/copy/maiores-dividend-yield.ts'), /href: '\/dividendos\/agenda'/)

  const lista = ler('app/components/dividendos/AgendaLista.vue')
  assert.match(lista, /@media \(max-width: 800px\)/)
  assert.match(lista, /\.agl__scroll \{ display: none; \}/)
  assert.match(lista, /overflow-wrap: anywhere/)
})

test('o teto de 500 no passado não apaga o mês corrente', async () => {
  const fontes = await lerFontesAgenda(async (path) => {
    if (path.includes('/upcoming')) {
      return { total: 1, data: [{ date: '2026-12-15', count: 1, items: [item({ ticker: 'PETR4', payment_date: '2026-12-15' })] }] }
    }
    if (path.includes('days=50') || path.includes('days=49') || path.includes('days=')) {
      const dias = Number(/days=(\d+)/.exec(path)?.[1] ?? 0)
      if (dias > 40) {
        return {
          total: 500,
          data: [
            { date: '2026-11-19', count: 1, items: [item({ ticker: 'COWC34', type: 'BDR', payment_date: '2026-11-19', last_date_prior: '2026-10-28' })] },
            { date: '2026-10-20', count: 1, items: [item({ ticker: 'VALE3', payment_date: '2026-10-20' })] },
          ],
        }
      }
      return {
        total: 2,
        data: [
          { date: '2026-11-19', count: 1, items: [item({ ticker: 'COWC34', type: 'BDR', payment_date: '2026-11-19', last_date_prior: '2026-10-28' })] },
          { date: '2026-11-14', count: 1, items: [item({ ticker: 'MXRF11', type: 'REIT', label: 'Rendimento', payment_date: '2026-11-14', last_date_prior: '2026-11-06' })] },
        ],
      }
    }
    throw new Error(path)
  }, HOJE)
  assert.equal(fontes.recentes.ok, true)
  assert.equal(fontes.recentes.truncado, false)
  assert.equal(fontes.recentes.desde, '2026-11-01')
  assert.equal(statusDoMes(parseMesAgenda('novembro-2026')!, fontes), 'ok')
  assert.equal(statusDoMes(parseMesAgenda('outubro-2026')!, fontes), 'vazio')
  const tickers = itensDoMes(parseMesAgenda('novembro-2026')!, fontes).map((i) => i.ticker)
  assert.deepEqual(tickers, ['MXRF11', 'COWC34'])
})

test('a linha de novembro não traz pagamento de outro mês', () => {
  const nov = parseMesAgenda('novembro-2026')!
  const datas = itensDoMes(nov, BASE).map((i) => i.payment_date)
  assert.ok(datas.every((d) => d.startsWith('2026-11')))
  assert.equal(datas.includes('2026-12-15'), false)
  assert.equal(datas.includes('2026-10-20'), false)
})
