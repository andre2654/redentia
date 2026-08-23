#!/usr/bin/env node
/**
 * gsc — lê a API do Search Console direto, sem export manual.
 *
 * Complementa o url-viva.mjs: aquele cruza sitemap com um CSV exportado à mão,
 * este puxa o dado ao vivo. O par resolve a pergunta "caiu?" sem depender de
 * alguém lembrar de exportar.
 *
 * AUTENTICAÇÃO. Conta de serviço, chave JSON FORA do repositório. O caminho
 * padrão é ~/.config/redentia/gsc-key.json; sobrescreva com GSC_KEY=/outro/path.
 * O script NUNCA imprime o conteúdo da chave. Zero dependência: o JWT é assinado
 * com o `crypto` nativo do Node.
 *
 * Pra a conta enxergar a propriedade, o e-mail dela precisa estar em
 * Search Console > Configurações > Usuários e permissões (nível "Restrito"
 * basta). Sem isso o token autentica mas a lista de propriedades vem vazia —
 * o script diz exatamente isso em vez de estourar.
 *
 * ATRASO DO DADO: o GSC fecha o dia com 2 a 3 dias de atraso. Perguntar hoje
 * sobre ontem devolve linha vazia ou parcial, e parcial parece queda. Por isso
 * o padrão IGNORA os 3 últimos dias (--incluir-parciais desliga a trava).
 *
 * USO
 *   node scripts/gsc.mjs                      # 28 dias, por data
 *   node scripts/gsc.mjs --dim page --dias 28
 *   node scripts/gsc.mjs --dim query --limite 40
 *   node scripts/gsc.mjs --comparar --dias 7  # 7 dias vs 7 anteriores
 *   node scripts/gsc.mjs --semana             # cliques por dia da semana
 *   node scripts/gsc.mjs --json               # saída crua
 */
import { readFileSync } from 'node:fs'
import { createSign } from 'node:crypto'
import { homedir } from 'node:os'

const KEY_PATH = process.env.GSC_KEY || `${homedir()}/.config/redentia/gsc-key.json`
// Propriedade: DETECTADA em runtime (ver resolveSite). A do André é de
// DOMÍNIO (sc-domain:redentia.com.br), que cobre todos os subdomínios — é por
// isso que os exports dela misturam www, whitelabel e estudo na mesma coluna.
// Fixar a de prefixo aqui fazia o script falhar com "não compartilhada" mesmo
// com a permissão certa concedida. GSC_SITE força uma específica.
let SITE = process.env.GSC_SITE || ''
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
/** O GSC fecha o dia com atraso; os últimos dias vêm parciais e parecem queda. */
const DIAS_PARCIAIS = 3

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const val = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : d }

// 28 dias no --comparar, NÃO 7. Janela de 7 dias neste site é dominada por
// ruído de borda: em 23/08/2026 o --comparar --dias 7 acusou -20,4% de cliques
// só porque a janela anterior pegou 13/08 (102 cliques, melhor dia do
// trimestre) e a atual pegou 16/08 (29, domingo). No mesmo dado, 14 dias
// contra 14 dava +8,1%. Sinal oposto, mesmo site, mesma hora.
const DIAS = Number(val('dias', 28))
const DIM = val('dim', 'date')
const LIMITE = Number(val('limite', 25))
const INCLUIR_PARCIAIS = flag('incluir-parciais')

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** JWT RS256 assinado com crypto nativo — evita dependência de google-auth. */
async function token() {
  let key
  try { key = JSON.parse(readFileSync(KEY_PATH, 'utf8')) }
  catch { fatal(`chave não encontrada em ${KEY_PATH}\nGere uma conta de serviço e salve lá, ou aponte GSC_KEY.`) }

  const now = Math.floor(Date.now() / 1000)
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const body = b64url(JSON.stringify({ iss: key.client_email, scope: SCOPE, aud: key.token_uri, iat: now, exp: now + 3600 }))
  const sig = b64url(createSign('RSA-SHA256').update(`${head}.${body}`).end().sign(key.private_key))

  const res = await fetch(key.token_uri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${body}.${sig}` }),
  })
  if (!res.ok) fatal(`falha ao trocar o JWT por token (${res.status}). A chave foi revogada?`)
  return { tok: (await res.json()).access_token, email: key.client_email }
}

function fatal(msg) { console.error(`\nERRO: ${msg}\n`); process.exit(1) }

const iso = (d) => d.toISOString().slice(0, 10)
function janela(dias, atras = 0) {
  const fim = new Date()
  fim.setDate(fim.getDate() - (INCLUIR_PARCIAIS ? 0 : DIAS_PARCIAIS) - atras)
  const ini = new Date(fim)
  ini.setDate(ini.getDate() - dias + 1)
  return { startDate: iso(ini), endDate: iso(fim) }
}

async function query(tok, body) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`
  const res = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${tok}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (res.status === 403) fatal(`sem acesso a ${SITE}.\nAdicione a conta de serviço em Search Console > Configurações > Usuários e permissões.`)
  if (!res.ok) fatal(`API devolveu ${res.status}: ${(await res.text()).slice(0, 300)}`)
  return (await res.json()).rows || []
}

const n0 = (x) => x.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
const soma = (rows, k) => rows.reduce((a, r) => a + (r[k] || 0), 0)

const { tok, email } = await token()

// Resolve a propriedade contra o que a conta REALMENTE enxerga. Falha aqui é
// de PERMISSÃO, não de código — dizer isso explicitamente evita meia hora
// procurando bug no lugar errado.
const sites = await (await fetch('https://www.googleapis.com/webmasters/v3/sites', { headers: { authorization: `Bearer ${tok}` } })).json()
const lista = (sites.siteEntry || []).map((s) => s.siteUrl)
if (!lista.length) {
  fatal(`autenticou como ${email}, mas nenhuma propriedade está compartilhada com ela.
Search Console > Configurações > Usuários e permissões > Adicionar usuário
  e-mail: ${email}
  permissão: Restrito`)
}
if (SITE && !lista.includes(SITE)) fatal(`GSC_SITE=${SITE} não está entre as visíveis: ${lista.join(', ')}`)
if (!SITE) {
  // Preferência: domínio (cobre tudo) > prefixo com www > o que houver.
  SITE = lista.find((s) => s.startsWith('sc-domain:'))
      || lista.find((s) => s.includes('//www.'))
      || lista[0]
}
// stderr de propósito: --json precisa devolver JSON PURO no stdout pra poder
// ser canalizado (`| python3 -c ...`). Um console.log aqui quebrava o pipe.
console.error(`propriedade: ${SITE}${lista.length > 1 ? `  (de ${lista.length} visíveis)` : ''}`)

if (flag('comparar')) {
  const a = janela(DIAS), b = janela(DIAS, DIAS)
  const [ra, rb] = await Promise.all([
    query(tok, { ...a, dimensions: ['date'], rowLimit: 500 }),
    query(tok, { ...b, dimensions: ['date'], rowLimit: 500 }),
  ])
  const ca = soma(ra, 'clicks'), cb = soma(rb, 'clicks')
  const ia = soma(ra, 'impressions'), ib = soma(rb, 'impressions')
  const pct = (x, y) => (y ? ((x - y) / y * 100).toFixed(1).replace('.', ',') + '%' : '—')
  console.log(`\nCOMPARAÇÃO · ${DIAS} dias${INCLUIR_PARCIAIS ? '' : ` (ignorando os ${DIAS_PARCIAIS} últimos, que vêm parciais)`}`)
  console.log(`  atual   ${a.startDate} .. ${a.endDate}   cliques ${n0(ca)}   impressões ${n0(ia)}`)
  console.log(`  anterior ${b.startDate} .. ${b.endDate}   cliques ${n0(cb)}   impressões ${n0(ib)}`)
  console.log(`  variação: cliques ${pct(ca, cb)}   impressões ${pct(ia, ib)}`)
  if (DIAS < 14) {
    console.log(`\n  ⚠️  Janela de ${DIAS} dias é curta demais pra este site: um único dia bom ou`)
    console.log(`     ruim numa das pontas inverte o sinal. Rode com --dias 28 antes de concluir.`)
  }
  console.log(`\n  Régua do site (92 dias, medida em 08/2026): desvio padrão semana-sobre-semana`)
  console.log(`  de 18,3 pontos. Queda de 8% ocorre em 19% das semanas — só investigar a`)
  console.log(`  partir de ~-25%, ou quando persistir por 2 semanas.\n`)
} else if (flag('semana')) {
  const w = janela(DIAS)
  const rows = await query(tok, { ...w, dimensions: ['date'], rowLimit: 500 })
  const nomes = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
  const por = {}
  for (const r of rows) {
    const wd = new Date(r.keys[0] + 'T12:00:00Z').getUTCDay()
    ;(por[wd] ||= []).push(r.clicks)
  }
  console.log(`\nCLIQUES POR DIA DA SEMANA · ${w.startDate} .. ${w.endDate}\n`)
  const med = []
  for (let d = 1; d <= 7; d++) {
    const wd = d % 7, v = por[wd] || []
    if (!v.length) continue
    const m = v.reduce((a, b) => a + b, 0) / v.length
    med.push({ wd, m })
    console.log(`  ${nomes[wd].padEnd(8)} n=${String(v.length).padStart(2)}  média ${m.toFixed(1)}`)
  }
  const u = med.filter((x) => x.wd >= 1 && x.wd <= 5), f = med.filter((x) => x.wd === 0 || x.wd === 6)
  if (u.length && f.length) {
    const mu = u.reduce((a, b) => a + b.m, 0) / u.length, mf = f.reduce((a, b) => a + b.m, 0) / f.length
    console.log(`\n  dia útil ${mu.toFixed(1)} · fim de semana ${mf.toFixed(1)} → fds rende ${(mf / mu * 100).toFixed(0)}% do útil\n`)
  }
} else {
  const w = janela(DIAS)
  const rows = await query(tok, { ...w, dimensions: [DIM], rowLimit: DIM === 'date' ? 500 : LIMITE })
  if (flag('json')) { console.log(JSON.stringify({ ...w, dimension: DIM, rows }, null, 1)); process.exit(0) }
  console.log(`\n${DIM.toUpperCase()} · ${w.startDate} .. ${w.endDate}${INCLUIR_PARCIAIS ? '  (INCLUI dias parciais)' : ''}\n`)
  console.log(`  ${'chave'.padEnd(52)} ${'cliq'.padStart(6)} ${'impr'.padStart(8)} ${'CTR'.padStart(7)} ${'pos'.padStart(6)}`)
  for (const r of rows.slice(0, DIM === 'date' ? 500 : LIMITE)) {
    const k = String(r.keys[0]).replace(SITE.replace(/\/$/, ''), '') || '/'
    console.log(`  ${k.slice(0, 52).padEnd(52)} ${n0(r.clicks).padStart(6)} ${n0(r.impressions).padStart(8)} ${(r.ctr * 100).toFixed(2).replace('.', ',').padStart(6)}% ${r.position.toFixed(1).replace('.', ',').padStart(6)}`)
  }
  console.log(`\n  total: ${n0(soma(rows, 'clicks'))} cliques · ${n0(soma(rows, 'impressions'))} impressões\n`)
}
