/**
 * IndexNow (scripts/indexnow.mjs): o índice aponta para /sitemaps/*.xml, o
 * envio diário fica nas URLs recentes (ou sem lastmod), e cada POST cabe no
 * teto de 10.000 do protocolo. A chave continua sendo o arquivo público.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  AGENDA_CRON,
  CHAVE,
  HOST,
  JANELA_DIAS,
  LIMITE_LOTE,
  buscarTexto,
  chaveConfere,
  coletarSitemaps,
  cronAutorizado,
  diaMenos,
  emLotes,
  entradasDoXml,
  executar,
  lastmodMaisNovo,
  lerArgs,
  pedidoIndexNow,
  postarJson,
  selecionar,
  urlDesteHost,
} from '../scripts/indexnow.mjs'

const ORIGEM = `https://${HOST}`

function indice(filhos: string[]) {
  const body = filhos.map((loc) => `  <sitemap><loc>${loc}</loc></sitemap>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`
}

function urlset(urls: Array<{ loc: string, lastmod?: string }>) {
  const body = urls.map((u) => {
    const mod = u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''
    return `  <url><loc>${u.loc}</loc>${mod}</url>`
  }).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

test('a chave é a do arquivo público', () => {
  const arquivo = readFileSync(new URL(`../public/${CHAVE}.txt`, import.meta.url), 'utf8')
  assert.equal(chaveConfere(arquivo), true)
  assert.equal(chaveConfere(`\uFEFF${CHAVE}\n`), true)
  assert.equal(chaveConfere('outra'), false)
})

test('o índice entrega os filhos, e o urlset entrega loc e lastmod', () => {
  const filhos = entradasDoXml(indice([
    `${ORIGEM}/sitemaps/paginas.xml`,
    `${ORIGEM}/sitemaps/setores.xml`,
  ]))
  assert.deepEqual(filhos.map((e) => e.url), [
    `${ORIGEM}/sitemaps/paginas.xml`,
    `${ORIGEM}/sitemaps/setores.xml`,
  ])
  assert.equal(filhos[1].lastmod, null)

  const paginas = entradasDoXml(urlset([
    { loc: `${ORIGEM}/busca?q=a&amp;b=1`, lastmod: '2026-11-09' },
    { loc: `${ORIGEM}/glossario/acao` },
  ]))
  assert.equal(paginas[0].url, `${ORIGEM}/busca?q=a&b=1`)
  assert.equal(paginas[0].lastmod, '2026-11-09')
  assert.equal(paginas[1].lastmod, null)
})

test('o xml com quebra de linha e prefixo ainda sai', () => {
  const xml = [
    '<urlset>',
    '  <url>',
    `    <loc>${ORIGEM}/asset/PETR4</loc>`,
    '    <lastmod>2026-11-07T22:00:00-03:00</lastmod>',
    '  </url>',
    '</urlset>',
  ].join('\n')
  const [entrada] = entradasDoXml(xml)
  assert.equal(entrada.url, `${ORIGEM}/asset/PETR4`)
  assert.equal(entrada.lastmod, '2026-11-07T22:00:00-03:00')

  const comPrefixo = `<ns:sitemapindex><ns:sitemap><ns:loc>${ORIGEM}/sitemaps/ativos.xml</ns:loc></ns:sitemap></ns:sitemapindex>`
  assert.equal(entradasDoXml(comPrefixo)[0].url, `${ORIGEM}/sitemaps/ativos.xml`)
})

test('só https do host da produção entra', () => {
  assert.equal(urlDesteHost(`${ORIGEM}/asset/PETR4`), true)
  assert.equal(urlDesteHost('https://redentia.com.br/asset/PETR4'), false)
  assert.equal(urlDesteHost(`http://${HOST}/asset/PETR4`), false)
  assert.equal(urlDesteHost('https://evil.example/asset/PETR4'), false)
  assert.equal(urlDesteHost('não é url'), false)
})

test('a coleta segue cada filho, deduplica e fica com o lastmod mais novo', async () => {
  const arquivos: Record<string, string> = {
    [`${ORIGEM}/sitemap.xml`]: indice([
      `${ORIGEM}/sitemaps/paginas.xml`,
      'https://evil.example/sitemaps/x.xml',
      `http://${HOST}/sitemaps/http.xml`,
      `${ORIGEM}/sitemaps/paginas.xml`,
    ]),
    [`${ORIGEM}/sitemaps/paginas.xml`]: urlset([
      { loc: `${ORIGEM}/`, lastmod: '2026-11-01' },
      { loc: `${ORIGEM}/`, lastmod: '2026-11-09' },
      { loc: `${ORIGEM}/sobre` },
      { loc: 'https://evil.example/fora', lastmod: '2026-11-09' },
    ]),
  }
  const fora: string[] = []
  const { itens, relatorio } = await coletarSitemaps(async (url) => arquivos[url], {
    avisar: (m) => fora.push(m),
  })
  assert.deepEqual(relatorio.map((r) => [r.arquivo, r.tipo, r.urls]), [
    ['sitemap.xml', 'indice', 2],
    ['sitemaps/paginas.xml', 'urlset', 3],
  ])
  assert.deepEqual(itens, [
    { url: `${ORIGEM}/`, lastmod: '2026-11-09' },
    { url: `${ORIGEM}/sobre`, lastmod: null },
  ])
  assert.equal(fora.some((m) => m.includes('fora de https://')), true)
  assert.equal(arquivos[`${ORIGEM}/sitemaps/http.xml`], undefined)
})

test('lastmod mais novo e a janela de 2 dias, inclusive a virada do mês', () => {
  assert.equal(lastmodMaisNovo('2026-11-01', '2026-11-09'), '2026-11-09')
  assert.equal(lastmodMaisNovo('2026-11-09', null), '2026-11-09')
  assert.equal(lastmodMaisNovo(null, null), null)
  assert.equal(diaMenos('2026-11-09', JANELA_DIAS), '2026-11-07')
  assert.equal(diaMenos('2026-11-01', 2), '2026-10-30')
  assert.equal(diaMenos('2026-01-01', 2), '2025-12-30')
  assert.equal(JANELA_DIAS, 2)
})

test('o diário manda o recente e o sem data; --tudo manda o resto; --desde exige data', () => {
  const itens = [
    { url: `${ORIGEM}/nova`, lastmod: '2026-11-09' },
    { url: `${ORIGEM}/limite`, lastmod: '2026-11-07' },
    { url: `${ORIGEM}/velha`, lastmod: '2026-11-06' },
    { url: `${ORIGEM}/sem-data`, lastmod: null },
    { url: `${ORIGEM}/ilegivel`, lastmod: 'ontem' },
  ]
  const diario = selecionar(itens, { hoje: '2026-11-09' }).map((i) => i.url)
  assert.deepEqual(diario, [
    `${ORIGEM}/nova`,
    `${ORIGEM}/limite`,
    `${ORIGEM}/sem-data`,
    `${ORIGEM}/ilegivel`,
  ])
  assert.equal(selecionar(itens, { tudo: true, hoje: '2026-11-09' }).length, 5)
  const desde = selecionar(itens, { desde: '2026-11-07', hoje: '2026-11-09' }).map((i) => i.url)
  assert.deepEqual(desde, [`${ORIGEM}/nova`, `${ORIGEM}/limite`])
})

test('os lotes param em 10.000, e o pedido leva host, chave e keyLocation', () => {
  assert.equal(emLotes(['a', 'b', 'c'], 2).map((l) => l.length).join(','), '2,1')
  const cheio = Array.from({ length: LIMITE_LOTE + 1 }, (_, i) => `${ORIGEM}/p/${i}`)
  const lotes = emLotes(cheio)
  assert.equal(lotes.length, 2)
  assert.equal(lotes[0].length, LIMITE_LOTE)
  assert.equal(lotes[1].length, 1)
  assert.deepEqual(pedidoIndexNow([`${ORIGEM}/`]), {
    host: HOST,
    key: CHAVE,
    keyLocation: `${ORIGEM}/${CHAVE}.txt`,
    urlList: [`${ORIGEM}/`],
  })
})

test('a linha de comando: sem flag é diário, --desde exige a data', () => {
  assert.equal(lerArgs(['node', 'indexnow.mjs']).diario, true)
  assert.equal(lerArgs(['node', 'indexnow.mjs', '--tudo', '--seco']).tudo, true)
  assert.equal(lerArgs(['node', 'indexnow.mjs', '--tudo', '--seco']).seco, true)
  assert.equal(lerArgs(['node', 'indexnow.mjs', '--tudo', '--seco']).diario, false)
  assert.deepEqual(
    lerArgs(['node', 'indexnow.mjs', '--desde', '2026-10-20', `${ORIGEM}/business`]),
    { help: false, seco: false, tudo: false, desde: '2026-10-20', avulsas: [`${ORIGEM}/business`], diario: false },
  )
  assert.throws(() => lerArgs(['node', 'indexnow.mjs', '--desde']))
  assert.throws(() => lerArgs(['node', 'indexnow.mjs', '--desde', '20/10/2026']))
})

test('sitemap lento: 503 e timeout tentam de novo, 404 não, HTML 200 também', async () => {
  let cheios = 0
  const texto = await buscarTexto(`${ORIGEM}/sitemaps/ativos.xml`, {
    tentativas: 3,
    esperar: async () => {},
    avisar: () => {},
    exigirSitemap: true,
    fetchImpl: async () => {
      cheios++
      if (cheios === 1) return { ok: false, status: 503, statusText: 'Service Unavailable', text: async () => '' }
      if (cheios === 2) return { ok: true, status: 200, statusText: 'OK', text: async () => '<html>espere</html>' }
      return { ok: true, status: 200, statusText: 'OK', text: async () => '<urlset></urlset>' }
    },
  })
  assert.equal(cheios, 3)
  assert.match(texto, /urlset/)

  let timeouts = 0
  await assert.rejects(() => buscarTexto(`${ORIGEM}/sitemaps/ativos.xml`, {
    tentativas: 2,
    timeoutMs: 15,
    esperar: async () => {},
    avisar: () => {},
    fetchImpl: (_url, init) => new Promise((_resolve, reject) => {
      timeouts++
      const signal = init?.signal
      if (!signal) {
        reject(new Error('sem signal'))
        return
      }
      signal.addEventListener('abort', () => {
        const e = new Error('aborted')
        e.name = 'AbortError'
        reject(e)
      })
    }),
  }))
  assert.equal(timeouts, 2)

  let naoAchei = 0
  await assert.rejects(() => buscarTexto(`${ORIGEM}/sitemaps/nao.xml`, {
    tentativas: 3,
    esperar: async () => {},
    avisar: () => {},
    fetchImpl: async () => {
      naoAchei++
      return { ok: false, status: 404, statusText: 'Not Found', text: async () => '' }
    },
  }))
  assert.equal(naoAchei, 1)
})

test('o POST repete 429 e devolve o 400 na hora', async () => {
  let chamadas = 0
  const ok = await postarJson('https://api.indexnow.org/indexnow', { urlList: [] }, {
    tentativas: 3,
    esperar: async () => {},
    avisar: () => {},
    fetchImpl: async () => {
      chamadas++
      if (chamadas < 3) return { status: 429, statusText: 'Too Many Requests', text: async () => 'calma' }
      return { status: 200, statusText: 'OK', text: async () => '' }
    },
  })
  assert.equal(chamadas, 3)
  assert.equal(ok.status, 200)

  let ruins = 0
  const ruim = await postarJson('https://api.indexnow.org/indexnow', { urlList: [] }, {
    tentativas: 3,
    esperar: async () => {},
    avisar: () => {},
    fetchImpl: async () => {
      ruins++
      return { status: 400, statusText: 'Bad Request', text: async () => 'invalid' }
    },
  })
  assert.equal(ruins, 1)
  assert.equal(ruim.status, 400)
})

test('executar no modo diário manda só o que entrou e registra o HTTP de cada lote', async () => {
  const arquivos: Record<string, string> = {
    [`${ORIGEM}/sitemap.xml`]: indice([
      `${ORIGEM}/sitemaps/paginas.xml`,
      `${ORIGEM}/sitemaps/ativos.xml`,
    ]),
    [`${ORIGEM}/sitemaps/paginas.xml`]: urlset([
      { loc: `${ORIGEM}/`, lastmod: '2026-11-09' },
      { loc: `${ORIGEM}/velha`, lastmod: '2026-10-01' },
    ]),
    [`${ORIGEM}/sitemaps/ativos.xml`]: urlset([
      { loc: `${ORIGEM}/asset/PETR4`, lastmod: '2026-11-08' },
      { loc: `${ORIGEM}/asset/SEM` },
    ]),
  }
  const pedidos: Array<{ urlList: string[] }> = []
  const linhas: string[] = []
  const resultado = await executar({
    diario: true,
    hoje: '2026-11-09',
    log: (m) => linhas.push(m),
    avisar: () => {},
    ler: async (url) => arquivos[url],
    buscar: async () => CHAVE,
    postar: async (corpo) => {
      pedidos.push(corpo)
      return { status: 202, statusText: 'Accepted', texto: '' }
    },
  })
  assert.equal(resultado.ok, true)
  assert.equal(resultado.encontradas, 4)
  assert.deepEqual(pedidos[0].urlList, [
    `${ORIGEM}/`,
    `${ORIGEM}/asset/PETR4`,
    `${ORIGEM}/asset/SEM`,
  ])
  assert.equal(pedidos[0].key, CHAVE)
  assert.equal(pedidos[0].keyLocation, `${ORIGEM}/${CHAVE}.txt`)
  assert.deepEqual(resultado.lotes, [{ n: 1, de: 1, urls: 3, status: 202, statusText: 'Accepted' }])
  assert.equal(linhas.some((l) => l.includes('sitemaps/paginas.xml: 2 URL(s)')), true)
  assert.equal(linhas.some((l) => l.includes('HTTP 202')), true)
  assert.equal(linhas.some((l) => l.startsWith('modo diário:')), true)
})

test('--tudo --seco lista tudo e não posta; chave errada não envia', async () => {
  const arquivos: Record<string, string> = {
    [`${ORIGEM}/sitemap.xml`]: indice([`${ORIGEM}/sitemaps/paginas.xml`]),
    [`${ORIGEM}/sitemaps/paginas.xml`]: urlset([{ loc: `${ORIGEM}/velha`, lastmod: '2026-01-01' }]),
  }
  let posts = 0
  const seco = await executar({
    tudo: true,
    seco: true,
    hoje: '2026-11-09',
    log: () => {},
    avisar: () => {},
    ler: async (url) => arquivos[url],
    postar: async () => {
      posts++
      return { status: 200, statusText: 'OK', texto: '' }
    },
  })
  assert.equal(seco.enviadas, 1)
  assert.equal(posts, 0)

  await assert.rejects(() => executar({
    tudo: true,
    hoje: '2026-11-09',
    log: () => {},
    avisar: () => {},
    ler: async (url) => arquivos[url],
    buscar: async () => 'nao-e-a-chave',
    postar: async () => {
      posts++
      return { status: 200, statusText: 'OK', texto: '' }
    },
  }), /chave não está no ar/)
  assert.equal(posts, 0)
})

test('o cron diário exige o segredo quando ele existe, e a expressão quando não', () => {
  assert.equal(cronAutorizado({ segredo: 'abc', authorization: 'Bearer abc' }), true)
  assert.equal(cronAutorizado({ segredo: 'abc', authorization: 'Bearer xyz', cronSchedule: AGENDA_CRON }), false)
  assert.equal(cronAutorizado({ cronSchedule: AGENDA_CRON }), true)
  assert.equal(cronAutorizado({ cronSchedule: '0 0 * * *' }), false)
  assert.equal(cronAutorizado({}), false)
})

test('a agenda do vercel.json é a do script, uma vez por dia, e a rota não manda --tudo', () => {
  const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
  assert.equal(vercel.crons.length, 1)
  assert.equal(vercel.crons[0].path, '/api/cron/indexnow')
  assert.equal(vercel.crons[0].schedule, AGENDA_CRON)
  assert.match(AGENDA_CRON, /^\d+ \d+ \* \* \*$/)

  const rota = readFileSync(new URL('../server/api/cron/indexnow.get.ts', import.meta.url), 'utf8')
  assert.match(rota, /executar\(\{ diario: true \}\)/)
  assert.match(rota, /cronAutorizado/)
  assert.match(rota, /CRON_SECRET/)
  assert.doesNotMatch(rota, /tudo:\s*true/)
  assert.match(rota, /private, no-store/)

  const config = readFileSync(new URL('../nuxt.config.ts', import.meta.url), 'utf8')
  assert.match(config, /'\/api\/cron\/indexnow': \{ headers: \{ 'cache-control': 'private, no-store' \} \}/)
})
