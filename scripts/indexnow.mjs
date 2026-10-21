#!/usr/bin/env node
/**
 * indexnow — avisa o Bing (e quem mais lê o IndexNow: Yandex, Seznam, Naver)
 * que URLs do site mudaram. O Google não usa o IndexNow; para ele vale o
 * sitemap. O Bing alimenta o Copilot e a busca do ChatGPT, por isso vale avisar.
 *
 * A chave é pública por desenho: o arquivo public/04f40646b171378956bfef8ed9f90790.txt prova ao Bing que
 * quem envia é dono do domínio. Só funciona depois que esse arquivo está no ar.
 *
 * Mande só o que mudou (a regra do IndexNow): por data de lastmod do sitemap ou
 * por URL. Reenviar o sitemap inteiro a cada deploy é o que ele pede para não
 * fazer.
 *
 * USO
 *   node scripts/indexnow.mjs --desde 2026-10-20    # URLs do sitemap com lastmod a partir do dia
 *   node scripts/indexnow.mjs --tudo                 # o sitemap inteiro (uma vez, na estreia)
 *   node scripts/indexnow.mjs https://www.redentia.com.br/business ...
 *   node scripts/indexnow.mjs --tudo --seco          # só lista, não envia
 */
const HOST = 'www.redentia.com.br'
const KEY = '04f40646b171378956bfef8ed9f90790'
const ORIGEM = `https://${HOST}`

const args = process.argv.slice(2)
const seco = args.includes('--seco')
const tudo = args.includes('--tudo')
const iDesde = args.indexOf('--desde')
const desde = iDesde >= 0 ? args[iDesde + 1] : null
const avulsas = args.filter((a, i) => /^https?:\/\//.test(a) && args[i - 1] !== '--desde')

function fatal(msg) { console.error(`\nERRO: ${msg}\n`); process.exit(1) }

async function doSitemap() {
  const res = await fetch(`${ORIGEM}/sitemap.xml`, { headers: { 'user-agent': 'Mozilla/5.0 (indexnow da Redentia)' } })
  if (!res.ok) fatal(`sitemap respondeu ${res.status}`)
  const xml = await res.text()
  return [...xml.matchAll(/<url><loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?/g)].map((m) => ({ url: m[1], lastmod: m[2] ?? null }))
}

let urls = avulsas
if (tudo || desde) {
  const itens = await doSitemap()
  const escolhidos = tudo ? itens : itens.filter((i) => i.lastmod && i.lastmod.slice(0, 10) >= desde)
  urls = [...new Set([...urls, ...escolhidos.map((i) => i.url)])]
}
urls = urls.filter((u) => new URL(u).host === HOST)
if (!urls.length) fatal('nenhuma URL para enviar (use --desde AAAA-MM-DD, --tudo ou passe as URLs)')
console.log(`${urls.length} URL(s) de ${HOST}${seco ? ' (seco: nada enviado)' : ''}`)
if (seco) { for (const u of urls.slice(0, 20)) console.log(`  ${u}`); process.exit(0) }

const chave = await fetch(`${ORIGEM}/${KEY}.txt`)
if (!chave.ok || (await chave.text()).trim() !== KEY) fatal(`a chave não está no ar em ${ORIGEM}/${KEY}.txt (faça o deploy antes)`)

// até 10.000 URLs por envio
for (let i = 0; i < urls.length; i += 10000) {
  const lote = urls.slice(i, i + 10000)
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${ORIGEM}/${KEY}.txt`, urlList: lote }),
  })
  // 200 recebido; 202 recebido e a chave ainda em validação; 4xx diz o que falta
  console.log(`lote ${i / 10000 + 1}: ${res.status} ${res.statusText}`)
  if (res.status >= 400) fatal(await res.text())
}
