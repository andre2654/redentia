#!/usr/bin/env node
/**
 * Paridade de SEO do /asset/{TICKER}: a página de hoje ("A noite", promovida
 * em 03/11/2026) contra o HTML salvo da página ANTERIOR, a que o Google
 * indexava. Prova as regras do pedido do dono ("tente reimaginar essa página
 * (e cuidado com o SEO)"):
 *
 *  1. <title>, meta description, canonical, robots, hreflang e JSON-LD iguais;
 *  2. um H1 só, com o mesmo texto, e todo título (h2/h3) de antes ainda é título;
 *  3. o texto do HTML do servidor não cai mais de 2% e nenhum link interno some.
 *
 * Lê o HTML do SERVIDOR (fetch, sem JS): é o que o Google recebe primeiro.
 * Uma página por vez, com pausa entre elas: o dev fala com a API de produção,
 * e cada /asset faz ~10 chamadas (rajada já derrubou produção, 23/09/2026).
 *
 *   node scripts/seo-paridade-ativo.mjs [--base http://localhost:3471] [--pausa 4000]
 *        [--tickers PETR4,ITUB4] [--antiga .prints-ativo/antiga] [--query '?cadeia=2']
 *
 * `--antiga` é a pasta com TICKER.html da página anterior, salvo por curl em
 * 03/11/2026 às 18:39, antes da troca (a saída da comparação daquele dia está
 * em .prints-ativo/seo-paridade-final.txt). Como o preço e os indicadores
 * andam entre o dia salvo e hoje, o <title>, a meta, o JSON-LD e os trechos de
 * texto se comparam com os NÚMEROS mascarados (cada sequência de dígitos vira
 * #): o que tem de ser igual é a frase, não a cotação. Canonical, robots,
 * hreflang, H1, títulos e links se comparam inteiros.
 * Sai com código 1 se alguma regra falhar.
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { parse, walkSync, ELEMENT_NODE, TEXT_NODE } from 'ultrahtml'

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
)
const BASE = args.base ?? 'http://localhost:3471'
const PAUSA = Number(args.pausa ?? 4000)
const TICKERS = (args.tickers ?? 'PETR4,ITUB4,MXRF11,BOVA11,AAPL34,SHUL4').split(',')
const ANTIGA = args.antiga ?? '.prints-ativo/antiga'
// `--query '?cadeia=2'`: confere uma direção do dev contra a mesma página antiga
const QUERY = args.query ?? ''
const QUEDA_MAX = 0.02

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", '#x27': "'", '#160': ' ' }
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
  if (ENT[e] != null) return ENT[e]
  if (e.startsWith('#x')) return String.fromCodePoint(parseInt(e.slice(2), 16))
  if (e.startsWith('#')) return String.fromCodePoint(Number(e.slice(1)))
  return m
})
const norm = (s) => decode(s).replace(/\s+/g, ' ').trim()
const SEM_TEXTO = new Set(['script', 'style', 'noscript', 'template', 'head'])
const BLOCO = new Set(['br', 'p', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'section', 'article', 'span', 'a', 'td', 'th', 'dt', 'dd', 'button', 'tr'])

/** texto de um nó; `br` e fim de bloco viram espaço ("PETR4<br>em 12 meses" → "PETR4 em 12 meses") */
function textoDe(node) {
  let out = ''
  const rec = (n) => {
    if (n.type === TEXT_NODE) { out += n.value; return }
    if (n.type !== ELEMENT_NODE && n.type !== 0) return
    if (n.type === ELEMENT_NODE && SEM_TEXTO.has(n.name)) return
    if (n.type === ELEMENT_NODE && n.name === 'br') { out += ' '; return }
    for (const c of n.children ?? []) rec(c)
    if (n.type === ELEMENT_NODE && BLOCO.has(n.name)) out += ' '
  }
  rec(node)
  return norm(out)
}

const palavras = (s) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length

export function extrair(html) {
  const doc = parse(html)
  const r = { title: null, description: null, canonical: null, robots: null, hreflang: [], jsonld: [], h1: [], titulos: [], links: new Set(), palavrasBody: 0, palavrasMain: 0 }
  let body = null
  let main = null
  walkSync(doc, (n) => {
    if (n.type !== ELEMENT_NODE) return
    const a = n.attributes ?? {}
    if (n.name === 'title' && r.title == null) r.title = textoDe(n)
    if (n.name === 'meta' && a.name === 'description') r.description = norm(a.content ?? '')
    if (n.name === 'meta' && a.name === 'robots') r.robots = norm(a.content ?? '')
    if (n.name === 'link' && a.rel === 'canonical') r.canonical = a.href
    if (n.name === 'link' && a.rel === 'alternate' && a.hreflang) r.hreflang.push(`${a.hreflang} ${a.href}`)
    if (n.name === 'script' && a.type === 'application/ld+json') {
      const raw = (n.children ?? []).map((c) => c.value ?? '').join('')
      try { r.jsonld.push(JSON.stringify(JSON.parse(raw))) } catch { r.jsonld.push(raw.trim()) }
    }
    if (n.name === 'h1') r.h1.push(textoDe(n))
    if (n.name === 'h2' || n.name === 'h3') r.titulos.push(textoDe(n))
    if (n.name === 'a' && typeof a.href === 'string' && a.href.startsWith('/') && !a.href.startsWith('//')) r.links.add(decode(a.href))
    if (n.name === 'body') body = n
    if (n.name === 'main' && !main) main = n
  })
  // cada pedaço de texto do miolo (nó de texto), para dizer QUAL texto sumiu
  r.trechos = []
  walkSync(main ?? body ?? doc, (n) => {
    if (n.type !== TEXT_NODE) return
    let p = n.parent
    while (p) { if (p.type === ELEMENT_NODE && SEM_TEXTO.has(p.name)) return; p = p.parent }
    const t = norm(n.value)
    if (t.length >= 3 && /[\p{L}\p{N}]/u.test(t)) r.trechos.push(t)
  })
  r.textoMain = textoDe(main ?? body ?? doc).replace(/\s+/g, '')
  r.jsonld.sort()
  r.hreflang.sort()
  r.palavrasBody = palavras(textoDe(body ?? doc))
  r.palavrasMain = main ? palavras(textoDe(main)) : null
  return r
}

const dorme = (ms) => new Promise((ok) => setTimeout(ok, ms))
async function buscar(url) {
  for (let i = 0; i < 3; i++) {
    const res = await fetch(url, { headers: { 'user-agent': 'seo-paridade-ativo (dev)' } })
    if (res.status === 426) { await dorme(1500); continue }
    if (!res.ok) throw new Error(`${url} → ${res.status}`)
    return res.text()
  }
  throw new Error(`${url} → 426 três vezes`)
}

/** cada número vira #: "R$ 50,60 em 03/11/2026" e "R$ 50,71 em 03/11/2026" são a mesma frase */
export const semNumeros = (s) => (s == null ? s : String(s).replace(/\d+/g, '#'))

export function comparar(antes, depois, { mascara = false } = {}) {
  const m = mascara ? semNumeros : (x) => x
  const falhas = []
  for (const k of ['title', 'description']) {
    if (m(antes[k]) !== m(depois[k])) falhas.push(`${k} mudou: "${antes[k]}" → "${depois[k]}"`)
  }
  for (const k of ['canonical', 'robots']) {
    if (antes[k] !== depois[k]) falhas.push(`${k} mudou: "${antes[k]}" → "${depois[k]}"`)
  }
  if (antes.hreflang.join('|') !== depois.hreflang.join('|')) falhas.push('hreflang mudou')
  const ja = antes.jsonld.map(m).sort()
  const jd = depois.jsonld.map(m).sort()
  if (ja.join('\n') !== jd.join('\n')) {
    const a = new Set(ja)
    const d = new Set(jd)
    falhas.push(`JSON-LD mudou: ${[...a].filter((x) => !d.has(x)).length} bloco(s) saíram, ${[...d].filter((x) => !a.has(x)).length} entraram`)
  }
  if (depois.h1.length !== 1) falhas.push(`${depois.h1.length} H1 (esperado 1)`)
  if (depois.h1[0] !== antes.h1[0]) falhas.push(`H1 mudou: "${antes.h1[0]}" → "${depois.h1[0]}"`)
  const titulosDepois = new Set(depois.titulos)
  const perdidos = [...new Set(antes.titulos)].filter((t) => !titulosDepois.has(t))
  if (perdidos.length) falhas.push(`títulos que deixaram de ser h2/h3: ${perdidos.map((t) => `"${t}"`).join(', ')}`)
  const queda = (antes.palavrasBody - depois.palavrasBody) / antes.palavrasBody
  if (queda > QUEDA_MAX) falhas.push(`texto caiu ${(queda * 100).toFixed(1)}% (${antes.palavrasBody} → ${depois.palavrasBody})`)
  const sumiram = [...antes.links].filter((l) => !depois.links.has(l))
  if (sumiram.length) falhas.push(`links internos que sumiram: ${sumiram.join(', ')}`)
  // o texto de hoje que não aparece na direção (sem espaços: a quebra de linha muda entre layouts)
  const alvo = m(depois.textoMain)
  const trechosFora = [...new Set(antes.trechos)].filter((t) => !alvo.includes(m(t.replace(/\s+/g, ''))))
  return { falhas, queda, sumiram, novos: [...depois.links].filter((l) => !antes.links.has(l)), trechosFora }
}

async function main() {
  let falhou = false
  const linhas = []
  for (const t of TICKERS) {
    const salvo = join(ANTIGA, `${t}.html`)
    if (!existsSync(salvo)) { console.log(`\n${t}: sem ${salvo}, pulei`); falhou = true; continue }
    const antes = extrair(await readFile(salvo, 'utf8'))
    const depois = extrair(await buscar(`${BASE}/asset/${t}${QUERY}`))
    await dorme(PAUSA)
    const c = comparar(antes, depois, { mascara: true })
    const pct = (-c.queda * 100).toFixed(1)
    const ok = c.falhas.length === 0
    if (!ok) falhou = true
    console.log(`\n${t} · antes: ${antes.palavrasBody} palavras, ${antes.links.size} links, H1 "${antes.h1.join(' | ')}", ${antes.jsonld.length} JSON-LD, ${antes.titulos.length} h2/h3`)
    console.log(`  agora ${ok ? 'OK ' : 'FALHA'} ${depois.palavrasBody} palavras (${pct > 0 ? '+' : ''}${pct}%), links ${depois.links.size} (${c.sumiram.length} sumiram, ${c.novos.length} novos), H1 ${depois.h1.length}, JSON-LD ${depois.jsonld.length}, h2/h3 ${depois.titulos.length}`)
    for (const f of c.falhas) console.log(`     - ${f}`)
    if (c.trechosFora.length) console.log(`     texto de antes fora da página (${c.trechosFora.length}): ${c.trechosFora.map((x) => `"${x.slice(0, 60)}"`).join(' · ')}`)
    linhas.push({ ticker: t, ok })
  }
  console.log(`\n${falhou ? 'FALHOU' : 'TUDO OK'}: ${linhas.filter((l) => l.ok).length}/${TICKERS.length} tickers passam nas regras 1 a 3.`)
  process.exit(falhou ? 1 : 0)
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e); process.exit(2) })
