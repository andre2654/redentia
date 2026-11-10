#!/usr/bin/env node
/**
 * indexnow — avisa o Bing (e quem mais lê o IndexNow: Yandex, Seznam, Naver)
 * que URLs do site mudaram. O Google não usa o IndexNow; para ele vale o
 * sitemap. O Bing alimenta o Copilot e a busca do ChatGPT, por isso vale avisar.
 *
 * A chave é pública por desenho: o arquivo public/04f40646b171378956bfef8ed9f90790.txt
 * prova ao Bing que quem envia é dono do domínio. Só funciona depois que esse
 * arquivo está no ar.
 *
 * O /sitemap.xml de produção é um índice. Este script segue cada filho
 * (/sitemaps/*.xml), junta os <loc> de https://www.redentia.com.br e envia em
 * lotes de 10.000 (o teto de um POST do protocolo).
 *
 * Modo diário (sem flags, o que o cron roda): lastmod no dia de hoje (UTC) ou
 * nos 2 dias anteriores, e também URL sem lastmod — sem data não dá para saber
 * se mudou, então entra. --tudo manda o sitemap inteiro. --desde corta pela
 * data e deixa de fora quem não tem lastmod.
 *
 * USO
 *   node scripts/indexnow.mjs                        # diário
 *   node scripts/indexnow.mjs --desde 2026-10-20     # lastmod a partir do dia
 *   node scripts/indexnow.mjs --tudo                 # o sitemap inteiro
 *   node scripts/indexnow.mjs https://www.redentia.com.br/business ...
 *   node scripts/indexnow.mjs --tudo --seco          # só lista, não envia
 */
export const HOST = 'www.redentia.com.br'
export const CHAVE = '04f40646b171378956bfef8ed9f90790'
export const ORIGEM = `https://${HOST}`
export const ENDPOINT = 'https://api.indexnow.org/indexnow'
export const LIMITE_LOTE = 10_000
export const JANELA_DIAS = 2
/** 11:17 UTC todo dia (08:17 em São Paulo). Uma vez por dia, fora do minuto 0. */
export const AGENDA_CRON = '17 11 * * *'
export const TIMEOUT_MS = 25_000
export const TENTATIVAS = 3
const ESPERA_BASE_MS = 1_000
const USER_AGENT = 'Mozilla/5.0 (indexnow da Redentia)'

const espera = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function decodificarXml(valor) {
  return String(valor)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

export function ehIndice(xml) {
  return /<(?:[\w-]+:)?sitemapindex\b/i.test(xml)
}

export function xmlDeSitemap(xml) {
  return typeof xml === 'string' && (/<(?:[\w-]+:)?urlset\b/i.test(xml) || ehIndice(xml))
}

function blocos(xml, tag) {
  const re = new RegExp(`<(?:[\\w-]+:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:[\\w-]+:)?${tag}>`, 'gi')
  return [...xml.matchAll(re)].map((m) => m[1])
}

function campo(bloco, tag) {
  const m = new RegExp(`<(?:[\\w-]+:)?${tag}\\b[^>]*>\\s*([\\s\\S]*?)\\s*</(?:[\\w-]+:)?${tag}>`, 'i').exec(bloco)
  return m ? m[1].replace(/\s+/g, '').trim() : null
}

/** <loc> e <lastmod> de um urlset, ou os filhos de um sitemapindex. */
export function entradasDoXml(xml) {
  const tag = ehIndice(xml) ? 'sitemap' : 'url'
  const saida = []
  for (const bloco of blocos(xml, tag)) {
    const loc = campo(bloco, 'loc')
    if (!loc) continue
    const lastmod = campo(bloco, 'lastmod')
    saida.push({ url: decodificarXml(loc), lastmod: lastmod ? decodificarXml(lastmod) : null })
  }
  return saida
}

export function urlDesteHost(url, host = HOST) {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' && u.host === host
  } catch {
    return false
  }
}

/** AAAA-MM-DD escrito no sitemap, ou null se não houver data legível. */
export function dataDeLastmod(lastmod) {
  if (!lastmod) return null
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(String(lastmod).trim())
  return m ? m[1] : null
}

export function diaUtc(ms = Date.now()) {
  return new Date(ms).toISOString().slice(0, 10)
}

export function diaMenos(isoDia, dias) {
  const d = new Date(`${isoDia}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) throw new Error(`data inválida: ${isoDia}`)
  d.setUTCDate(d.getUTCDate() - dias)
  return d.toISOString().slice(0, 10)
}

/** Entre duas datas, fica a mais nova. Sem data legível, fica a que tem. */
export function lastmodMaisNovo(a, b) {
  const da = dataDeLastmod(a)
  const db = dataDeLastmod(b)
  if (!da) return db ? b : (a ?? null)
  if (!db) return a
  return db > da ? b : a
}

/**
 * --tudo: todas. --desde: só lastmod >= o dia (sem lastmod fica de fora).
 * Diário: lastmod >= hoje − JANELA_DIAS, ou sem lastmod.
 */
export function selecionar(itens, { tudo = false, desde = null, hoje = diaUtc(), dias = JANELA_DIAS } = {}) {
  if (tudo) return itens.slice()
  const limite = desde || diaMenos(hoje, dias)
  return itens.filter((item) => {
    const data = dataDeLastmod(item.lastmod)
    if (desde) return data !== null && data >= desde
    if (data === null) return true
    return data >= limite
  })
}

export function emLotes(urls, tamanho = LIMITE_LOTE) {
  if (!Number.isInteger(tamanho) || tamanho < 1) throw new Error('lote inválido')
  const lotes = []
  for (let i = 0; i < urls.length; i += tamanho) lotes.push(urls.slice(i, i + tamanho))
  return lotes
}

export function localDaChave(origem = ORIGEM) {
  return `${origem}/${CHAVE}.txt`
}

export function chaveConfere(texto) {
  return String(texto).replace(/^\uFEFF/, '').trim() === CHAVE
}

export function pedidoIndexNow(urlList, origem = ORIGEM) {
  return {
    host: HOST,
    key: CHAVE,
    keyLocation: localDaChave(origem),
    urlList,
  }
}

/**
 * Com CRON_SECRET no projeto da Vercel, só o Bearer dela passa.
 * Sem a env (segredo fora do repo, e opcional), aceita a chamada do cron,
 * que manda x-vercel-cron-schedule com a expressão deste job.
 */
export function cronAutorizado({ authorization = '', cronSchedule = '', segredo = '', agendaEsperada = AGENDA_CRON } = {}) {
  if (segredo) return authorization === `Bearer ${segredo}`
  return Boolean(agendaEsperada) && cronSchedule === agendaEsperada
}

export function lerArgs(argv) {
  const args = argv.slice(2)
  if (args.includes('--help') || args.includes('-h')) return { help: true }
  const seco = args.includes('--seco')
  const tudo = args.includes('--tudo')
  const iDesde = args.indexOf('--desde')
  let desde = null
  if (iDesde >= 0) {
    desde = args[iDesde + 1]
    if (!desde || desde.startsWith('--') || !/^\d{4}-\d{2}-\d{2}$/.test(desde)) {
      throw new Error('--desde espera AAAA-MM-DD')
    }
  }
  const avulsas = []
  for (let i = 0; i < args.length; i++) {
    if (i === iDesde || i === iDesde + 1) continue
    if (/^https?:\/\//.test(args[i])) avulsas.push(args[i])
  }
  const diario = !tudo && !desde && avulsas.length === 0
  return { help: false, seco, tudo, desde, avulsas, diario }
}

function motivoDaFalha(erro, timeoutMs) {
  if (erro?.name === 'AbortError' || erro?.name === 'TimeoutError') return `timeout de ${timeoutMs}ms`
  return erro?.message || String(erro)
}

export async function buscarTexto(url, {
  fetchImpl = globalThis.fetch,
  timeoutMs = TIMEOUT_MS,
  tentativas = TENTATIVAS,
  esperar = espera,
  avisar = () => {},
  exigirSitemap = false,
  userAgent = USER_AGENT,
} = {}) {
  let ultimo = new Error(`${url} falhou`)
  for (let t = 1; t <= tentativas; t++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetchImpl(url, {
        headers: { 'user-agent': userAgent, accept: 'application/xml,text/xml,text/plain,*/*' },
        signal: ctrl.signal,
        redirect: 'follow',
      })
      const status = res.status
      if (status >= 400 && status < 500 && status !== 429) {
        const err = new Error(`${url} respondeu ${status}`)
        err.permanente = true
        throw err
      }
      if (status === 429 || status >= 500 || !res.ok) {
        ultimo = new Error(`${url} respondeu ${status}`)
        avisar(`tentativa ${t}/${tentativas}: ${ultimo.message}`)
      } else {
        const texto = await res.text()
        if (exigirSitemap && !xmlDeSitemap(texto)) {
          ultimo = new Error(`${url} respondeu 200 sem sitemap`)
          avisar(`tentativa ${t}/${tentativas}: ${ultimo.message}`)
        } else {
          return texto
        }
      }
    } catch (e) {
      if (e?.permanente) throw e
      ultimo = e instanceof Error ? e : new Error(String(e))
      avisar(`tentativa ${t}/${tentativas}: ${url} falhou (${motivoDaFalha(e, timeoutMs)})`)
    } finally {
      clearTimeout(timer)
    }
    if (t < tentativas) await esperar(ESPERA_BASE_MS * 2 ** (t - 1))
  }
  throw ultimo
}

export async function postarJson(url, corpo, {
  fetchImpl = globalThis.fetch,
  timeoutMs = TIMEOUT_MS,
  tentativas = TENTATIVAS,
  esperar = espera,
  avisar = () => {},
  userAgent = USER_AGENT,
} = {}) {
  let ultimoErro = new Error(`${url} falhou`)
  let ultimaResposta = null
  for (let t = 1; t <= tentativas; t++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetchImpl(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'user-agent': userAgent,
        },
        body: JSON.stringify(corpo),
        signal: ctrl.signal,
      })
      const texto = typeof res.text === 'function' ? await res.text() : ''
      const resposta = { status: res.status, statusText: res.statusText || '', texto }
      if (res.status === 429 || res.status >= 500) {
        ultimaResposta = resposta
        ultimoErro = new Error(`${url} respondeu ${res.status}`)
        avisar(`tentativa ${t}/${tentativas}: ${ultimoErro.message}`)
      } else {
        return resposta
      }
    } catch (e) {
      ultimoErro = e instanceof Error ? e : new Error(String(e))
      avisar(`tentativa ${t}/${tentativas}: ${url} falhou (${motivoDaFalha(e, timeoutMs)})`)
    } finally {
      clearTimeout(timer)
    }
    if (t < tentativas) await esperar(ESPERA_BASE_MS * 2 ** (t - 1))
  }
  if (ultimaResposta) return ultimaResposta
  throw ultimoErro
}

/**
 * Lê o índice e cada sub-sitemap no mesmo host. `relatorio` conta os <loc>
 * de cada arquivo (antes do filtro de data). URL repetida fica uma vez, com
 * o lastmod mais novo.
 */
export async function coletarSitemaps(ler, { origem = ORIGEM, host = HOST, avisar = () => {}, aoArquivo = () => {} } = {}) {
  const porUrl = new Map()
  const relatorio = []
  const visitados = new Set()

  async function visitar(url, nome, profundidade) {
    if (visitados.has(url) || profundidade > 4) return
    visitados.add(url)
    const xml = await ler(url)
    if (!xmlDeSitemap(xml)) throw new Error(`${nome} não é um sitemap`)
    const todas = entradasDoXml(xml)
    const nossas = todas.filter((e) => urlDesteHost(e.url, host))
    const deFora = todas.length - nossas.length
    if (deFora) avisar(`${nome}: ${deFora} <loc> fora de https://${host} ignoradas`)
    if (ehIndice(xml)) {
      const item = { arquivo: nome, tipo: 'indice', urls: nossas.length }
      relatorio.push(item)
      aoArquivo(item)
      for (const entrada of nossas) {
        const caminho = new URL(entrada.url).pathname.replace(/^\//, '')
        await visitar(entrada.url, caminho, profundidade + 1)
      }
      return
    }
    for (const entrada of nossas) {
      const anterior = porUrl.get(entrada.url)
      if (anterior === undefined) porUrl.set(entrada.url, entrada.lastmod)
      else porUrl.set(entrada.url, lastmodMaisNovo(anterior, entrada.lastmod))
    }
    const item = { arquivo: nome, tipo: 'urlset', urls: nossas.length }
    relatorio.push(item)
    aoArquivo(item)
  }

  await visitar(`${origem}/sitemap.xml`, 'sitemap.xml', 0)
  return {
    itens: [...porUrl].map(([url, lastmod]) => ({ url, lastmod })),
    relatorio,
  }
}

export async function executar({
  tudo = false,
  desde = null,
  diario = false,
  avulsas = [],
  seco = false,
  hoje = diaUtc(),
  origem = ORIGEM,
  log = console.log,
  avisar = console.warn,
  ler,
  buscar,
  postar,
  fetchImpl,
  esperar,
} = {}) {
  const opcoesRede = { avisar, esperar, fetchImpl }
  const lerXml = ler ?? ((url) => buscarTexto(url, { ...opcoesRede, exigirSitemap: true }))
  const buscarChave = buscar ?? ((url) => buscarTexto(url, opcoesRede))
  const enviar = postar ?? ((corpo) => postarJson(ENDPOINT, corpo, opcoesRede))

  const modo = tudo ? 'tudo' : desde ? 'desde' : (diario || avulsas.length === 0) ? 'diario' : 'avulsas'
  let itens = []
  let relatorio = []
  if (modo !== 'avulsas') {
    const coletado = await coletarSitemaps(lerXml, {
      origem,
      avisar,
      aoArquivo: (item) => {
        log(item.tipo === 'indice'
          ? `${item.arquivo}: índice com ${item.urls} sub-sitemap(s)`
          : `${item.arquivo}: ${item.urls} URL(s)`)
      },
    })
    itens = coletado.itens
    relatorio = coletado.relatorio
  }

  const escolhidas = modo === 'avulsas' ? [] : selecionar(itens, { tudo, desde, hoje })
  const vistas = new Set(escolhidas.map((item) => item.url))
  let avulsasIncluidas = 0
  for (const url of avulsas) {
    if (!urlDesteHost(url)) {
      avisar(`ignorada, fora de https://${HOST}: ${url}`)
      continue
    }
    if (vistas.has(url)) continue
    escolhidas.push({ url, lastmod: null })
    vistas.add(url)
    avulsasIncluidas++
  }

  if (modo === 'tudo') log('modo --tudo: todas as URLs do host')
  else if (modo === 'desde') log(`modo --desde ${desde}: lastmod >= ${desde}`)
  else if (modo === 'avulsas') log('modo avulso: só as URLs da linha de comando')
  else log(`modo diário: lastmod >= ${diaMenos(hoje, JANELA_DIAS)} ou sem lastmod (hoje ${hoje}, janela de ${JANELA_DIAS} dias)`)
  if (avulsasIncluidas) log(`+ ${avulsasIncluidas} URL(s) avulsas`)

  const urls = escolhidas.map((item) => item.url)
  const resultado = {
    ok: true,
    modo,
    hoje,
    relatorio,
    encontradas: itens.length,
    enviadas: urls.length,
    seco,
    lotes: [],
  }
  log(`${urls.length} URL(s) de ${HOST} para enviar, de ${itens.length} no sitemap${seco ? ' (seco: nada enviado)' : ''}`)

  if (!urls.length) {
    if (modo === 'diario') return resultado
    resultado.ok = false
    resultado.erro = 'nenhuma URL para enviar'
    throw Object.assign(new Error(resultado.erro), { resultado })
  }
  if (seco) {
    for (const u of urls.slice(0, 20)) log(`  ${u}`)
    if (urls.length > 20) log(`  … e mais ${urls.length - 20}`)
    return resultado
  }

  const corpoChave = await buscarChave(localDaChave(origem))
  if (!chaveConfere(corpoChave)) {
    resultado.ok = false
    resultado.erro = `a chave não está no ar em ${localDaChave(origem)}`
    throw Object.assign(new Error(resultado.erro), { resultado })
  }
  log(`chave ok em ${localDaChave(origem)}`)

  const lotes = emLotes(urls)
  for (let i = 0; i < lotes.length; i++) {
    const lote = lotes[i]
    const res = await enviar(pedidoIndexNow(lote, origem))
    const registro = {
      n: i + 1,
      de: lotes.length,
      urls: lote.length,
      status: res.status,
      statusText: res.statusText || '',
    }
    resultado.lotes.push(registro)
    log(`lote ${registro.n}/${registro.de}: ${registro.urls} URLs, HTTP ${registro.status} ${registro.statusText}`.trimEnd())
    if (res.status >= 400) {
      const detalhe = String(res.texto || '').replace(/\s+/g, ' ').trim().slice(0, 300)
      resultado.ok = false
      resultado.erro = `lote ${registro.n} respondeu HTTP ${res.status}${detalhe ? `: ${detalhe}` : ''}`
      throw Object.assign(new Error(resultado.erro), { resultado })
    }
  }
  return resultado
}

async function principal() {
  const args = lerArgs(process.argv)
  if (args.help) {
    console.log('uso: node scripts/indexnow.mjs [--tudo | --desde AAAA-MM-DD] [--seco] [urls...]')
    console.log(`sem flags: modo diário (lastmod nos últimos ${JANELA_DIAS} dias, ou sem lastmod)`)
    return
  }
  try {
    await executar(args)
  } catch (e) {
    console.error(`\nERRO: ${e.message}\n`)
    process.exit(1)
  }
}

// Só quando este arquivo é o entry (`node scripts/indexnow.mjs`). Importar o
// módulo (teste, cron) não pode disparar o envio — inclusive depois que o
// bundler da Vercel junta tudo num index.mjs.
const entrada = process.argv[1] || ''
if (/(?:^|[/\\])indexnow\.mjs$/.test(entrada)) {
  principal()
}
