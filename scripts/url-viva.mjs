#!/usr/bin/env node
/**
 * url-viva — cruza o que o site PUBLICA com o que o Google de fato MOSTRA.
 *
 * POR QUE ISSO É O INSTRUMENTO PRINCIPAL. Até 08/2026 o painel olhava "páginas
 * indexadas" (1.959) e "posição média" (8,5). Os dois enganam:
 *   - indexadas conta URL que o Google guardou, não URL que traz gente. Medido
 *     em 03/08/2026: 1.949 URLs no sitemap, 321 com ao menos UMA impressão em
 *     92 dias. 83,5% do que o site publica é inventário morto.
 *   - posição média é a média entre um cluster em 3,8 e uma cauda em 19. Não
 *     descreve nenhuma página real.
 *
 * A métrica que substitui as duas é CLIQUES POR URL VIVA. Ela expõe uma razão
 * de 2.500x entre a melhor e a pior seção do site (/calculadora 151,19 contra
 * /asset 0,06 clique por URL viva por mês) e é o que orça qualquer expansão:
 * o rendimento marginal fora das duas páginas-cabeça é 0,78 clique/URL/mês.
 *
 * USO
 *   node scripts/url-viva.mjs <caminho-do-Páginas.csv> [--sitemap URL] [--json]
 *
 * O CSV é a exportação de Desempenho > Páginas do Search Console.
 *
 * NÚMEROS DE REFERÊNCIA da primeira execução (03/08/2026), pra sanity check:
 *   publicadas 1.949 · vivas 321 · vivas fora do sitemap 446 · www no CSV 767
 *
 * DUAS ARMADILHAS DE PARSER, ambas já tratadas aqui:
 *   1. o CSV mistura hosts na mesma coluna (www, whitelabel, estudo). Só `www`
 *      conta como o site.
 *   2. a exportação corta em 1.000 linhas. Uma URL com impressão abaixo do corte
 *      aparece como morta. Por isso este script NUNCA deve alimentar `noindex`
 *      direto: ele orienta remoção do SITEMAP (reversível em dias), e só depois
 *      de 60 dias de leitura consistente é que `noindex` entra na conversa.
 */

const HOST_CANONICO = 'www.redentia.com.br'
const SITEMAP_PADRAO = `https://${HOST_CANONICO}/sitemap.xml`

const args = process.argv.slice(2)
const csvPath = args.find((a) => !a.startsWith('--'))
const sitemapUrl = argValue('--sitemap') ?? SITEMAP_PADRAO
const asJson = args.includes('--json')

function argValue(flag) {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : undefined
}

if (!csvPath) {
  console.error('uso: node scripts/url-viva.mjs <Páginas.csv> [--sitemap URL] [--json]')
  process.exit(1)
}

/** Parser de CSV com aspas: os títulos de consulta trazem vírgula e aspas duplas. */
function parseCsv(text) {
  const linhas = []
  let campo = ''
  let linha = []
  let dentroDeAspas = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (dentroDeAspas) {
      if (c === '"') {
        if (text[i + 1] === '"') { campo += '"'; i++ } else dentroDeAspas = false
      } else campo += c
    } else if (c === '"') dentroDeAspas = true
    else if (c === ',') { linha.push(campo); campo = '' }
    else if (c === '\n') { linha.push(campo); linhas.push(linha); linha = []; campo = '' }
    else if (c !== '\r') campo += c
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha) }
  return linhas
}

function secaoDe(pathname) {
  if (pathname === '/') return '/(home)'
  const seg = pathname.split('/').filter(Boolean)[0]
  return `/${seg}`
}

const csv = parseCsv(await import('node:fs/promises').then((fs) => fs.readFile(csvPath, 'utf8')))
const linhasDados = csv.slice(1).filter((l) => l.length >= 3 && l[0].startsWith('http'))

const vivasPorPath = new Map()
const outrosHosts = new Map()

for (const [url, cliquesRaw, impressoesRaw] of linhasDados) {
  const cliques = Number(cliquesRaw) || 0
  const impressoes = Number(impressoesRaw) || 0
  let u
  try { u = new URL(url) } catch { continue }

  if (u.host !== HOST_CANONICO) {
    const atual = outrosHosts.get(u.host) ?? { urls: 0, cliques: 0, impressoes: 0 }
    outrosHosts.set(u.host, { urls: atual.urls + 1, cliques: atual.cliques + cliques, impressoes: atual.impressoes + impressoes })
    continue
  }
  if (impressoes < 1) continue
  vivasPorPath.set(u.pathname, { cliques, impressoes })
}

const sitemapXml = await fetch(sitemapUrl).then((r) => {
  if (!r.ok) throw new Error(`sitemap ${sitemapUrl} respondeu ${r.status}`)
  return r.text()
})
const publicadas = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => { try { return new URL(m[1]).pathname } catch { return null } })
  .filter(Boolean)
const setPublicadas = new Set(publicadas)

const vivasNoSitemap = [...vivasPorPath.keys()].filter((p) => setPublicadas.has(p))
const vivasForaDoSitemap = [...vivasPorPath.keys()].filter((p) => !setPublicadas.has(p))
const mortasNoSitemap = publicadas.filter((p) => !vivasPorPath.has(p))

const porSecao = new Map()
for (const p of setPublicadas) {
  const s = secaoDe(p)
  const atual = porSecao.get(s) ?? { publicadas: 0, vivas: 0, cliques: 0, impressoes: 0 }
  atual.publicadas++
  const dados = vivasPorPath.get(p)
  if (dados) { atual.vivas++; atual.cliques += dados.cliques; atual.impressoes += dados.impressoes }
  porSecao.set(s, atual)
}

// O CSV cobre 92 dias; a métrica de painel é mensal.
const MESES_NA_JANELA = 92 / 30.4

const resumo = {
  publicadas: publicadas.length,
  vivas: vivasNoSitemap.length,
  vivasForaDoSitemap: vivasForaDoSitemap.length,
  mortasNoSitemap: mortasNoSitemap.length,
  urlsCanonicasNoCsv: vivasPorPath.size,
  taxaDeVivacidade: publicadas.length ? +(vivasNoSitemap.length / publicadas.length * 100).toFixed(1) : 0,
  outrosHosts: Object.fromEntries(outrosHosts),
  porSecao: Object.fromEntries(
    [...porSecao.entries()]
      .map(([s, v]) => [s, {
        ...v,
        cliquesPorUrlVivaMes: v.vivas ? +(v.cliques / v.vivas / MESES_NA_JANELA).toFixed(2) : 0,
      }])
      .sort((a, b) => b[1].cliquesPorUrlVivaMes - a[1].cliquesPorUrlVivaMes),
  ),
}

if (asJson) {
  console.log(JSON.stringify(resumo, null, 2))
} else {
  console.log(`\nURL VIVA · ${sitemapUrl}\n${'='.repeat(64)}`)
  console.log(`publicadas no sitemap    ${resumo.publicadas}`)
  console.log(`vivas (>=1 impressão)    ${resumo.vivas}  (${resumo.taxaDeVivacidade}%)`)
  console.log(`mortas no sitemap        ${resumo.mortasNoSitemap}`)
  console.log(`vivas FORA do sitemap    ${resumo.vivasForaDoSitemap}   <- descobertas por link interno`)
  console.log(`\nCLIQUES POR URL VIVA POR MÊS`)
  console.log(`${'seção'.padEnd(16)} ${'publ'.padStart(6)} ${'vivas'.padStart(6)} ${'cl/URL/mês'.padStart(11)}`)
  for (const [s, v] of Object.entries(resumo.porSecao)) {
    console.log(`${s.padEnd(16)} ${String(v.publicadas).padStart(6)} ${String(v.vivas).padStart(6)} ${String(v.cliquesPorUrlVivaMes).padStart(11)}`)
  }
  if (Object.keys(resumo.outrosHosts).length) {
    console.log(`\nHOSTS QUE NÃO SÃO ${HOST_CANONICO} (clones a matar):`)
    for (const [h, v] of Object.entries(resumo.outrosHosts)) {
      console.log(`  ${h.padEnd(34)} ${v.urls} URLs, ${v.impressoes} impressões`)
    }
  }
  console.log('')
}
