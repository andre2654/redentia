#!/usr/bin/env node
/**
 * A conferência da virada de domínio (docs/aportou/virada-de-dominio.md, seção 5): cada URL que teve clique no
 * Google (docs/aportou/virada-urls.json, 90 dias até 10/11/2026) tem de responder 301 para o MESMO caminho em
 * https://aportou.com.br, e lá responder 200. A raiz é a exceção: depois da troca ela é a landing do B2B (200).
 *
 * Uma URL por vez, com intervalo (crawl em rajada já derrubou a produção). ~500 URLs a 800 ms: uns 8 minutos.
 *
 *   node scripts/conferir-virada.mjs                                  # produção, depois da troca
 *   node scripts/conferir-virada.mjs --base https://redentia-business.vercel.app --sem-destino   # o app do B2B no endereço provisório
 *   node scripts/conferir-virada.mjs --base http://localhost:3471 --host www.redentia.com.br --raiz aportou --sem-destino --limite 20
 *
 *   --base URL        quem responde pelo domínio antigo (padrão https://www.redentia.com.br)
 *   --host H          manda X-Forwarded-Host (simular o domínio antigo num servidor local)
 *   --raiz b2b|aportou  o que a raiz deve fazer: 200 do B2B (padrão) ou 301 para a Aportou (a rede de segurança do front)
 *   --sem-destino     não confere o 200 em aportou.com.br (antes de ele estar no ar)
 *   --limite N        só as N primeiras (as de mais clique)
 *   --intervalo MS    entre um pedido e o outro (padrão 800)
 */
import { readFileSync, writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
const val = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : d }
const flag = (n) => args.includes(`--${n}`)
const BASE = val('base', 'https://www.redentia.com.br').replace(/\/$/, '')
const HOST = val('host', '')
const RAIZ = val('raiz', 'b2b')
const SEM_DESTINO = flag('sem-destino')
const LIMITE = Number(val('limite', '0')) || Infinity
const INTERVALO = Number(val('intervalo', '800'))
const APORTOU = 'https://aportou.com.br'
const cabecalhos = { 'user-agent': 'conferencia-virada/1.0', ...(HOST ? { 'x-forwarded-host': HOST } : {}) }

const lista = JSON.parse(readFileSync(new URL('../docs/aportou/virada-urls.json', import.meta.url), 'utf8')).urls
const espera = (ms) => new Promise((ok) => setTimeout(ok, ms))
async function pedir(url) {
  for (let tentativa = 1; ; tentativa++) {
    try { return await fetch(url, { redirect: 'manual', headers: cabecalhos, signal: AbortSignal.timeout(30000) }) }
    catch (e) { if (tentativa >= 3) throw e; await espera(3000 * tentativa) }
  }
}

const falhas = []
const outrosHosts = []
let ok = 0
let n = 0
for (const item of lista) {
  if (n >= LIMITE) break
  const u = new URL(item.url)
  if (!/^(www\.)?redentia\.com\.br$/.test(u.host)) { outrosHosts.push(item.url); continue }
  n++
  const caminho = u.pathname + u.search
  const raiz = u.pathname === '/' && !u.search
  let problema = null
  try {
    const r = await pedir(BASE + caminho)
    const para = r.headers.get('location')
    if (raiz && RAIZ === 'b2b') {
      if (r.status !== 200) problema = `a raiz devia ser a landing do B2B (200) e veio ${r.status}${para ? ` → ${para}` : ''}`
    } else if (r.status !== 301) problema = `devia ser 301 e veio ${r.status}${para ? ` → ${para}` : ''}`
    else if (para !== APORTOU + caminho) problema = `301 para o lugar errado: ${para}`
    else if (!SEM_DESTINO) {
      await espera(INTERVALO)
      const d = await pedir(para)
      if (d.status !== 200) problema = `na Aportou veio ${d.status}${d.headers.get('location') ? ` → ${d.headers.get('location')}` : ''}`
    }
  } catch (e) { problema = `sem resposta: ${e.message}` }
  if (problema) falhas.push({ url: item.url, cliques: item.cliques, problema })
  else ok++
  process.stdout.write(problema ? `✗ ${caminho} (${item.cliques} cliques): ${problema}\n` : '.')
  await espera(INTERVALO)
}
const relatorio = { base: BASE, conferidas: n, certas: ok, falhas, outros_hosts: outrosHosts }
const saida = `conferencia-virada-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`
writeFileSync(saida, JSON.stringify(relatorio, null, 1))
console.log(`\n${ok} de ${n} certas; ${falhas.length} com problema (${falhas.reduce((s, f) => s + f.cliques, 0)} cliques em 90 dias). Fora do www/apex: ${outrosHosts.length}. Relatório: ${saida}`)
process.exit(falhas.length ? 1 : 0)
