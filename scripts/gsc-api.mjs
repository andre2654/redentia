/**
 * gsc-api — autenticação e chamadas da API do Search Console, compartilhadas
 * por gsc.mjs (visão da propriedade) e gsc-painel.mjs (painel fixo de
 * consultas × página). Uma implementação só do JWT e da resolução da
 * propriedade; antes do painel isso vivia inteiro dentro do gsc.mjs.
 *
 * AUTENTICAÇÃO. Conta de serviço, chave JSON FORA do repositório. O caminho
 * padrão é ~/.config/redentia/gsc-key.json; sobrescreva com GSC_KEY=/outro/path.
 * Nunca imprime o conteúdo da chave. Zero dependência: o JWT é assinado com o
 * `crypto` nativo do Node.
 */
import { readFileSync } from 'node:fs'
import { createSign } from 'node:crypto'
import { homedir } from 'node:os'

const KEY_PATH = process.env.GSC_KEY || `${homedir()}/.config/redentia/gsc-key.json`
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'

export function fatal(msg) { console.error(`\nERRO: ${msg}\n`); process.exit(1) }

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

/**
 * Autentica e resolve a propriedade. Devolve `query(body)` (Search Analytics)
 * e `inspecionar(url)` (URL Inspection, que dá o lastCrawlTime).
 */
export async function conectar() {
  const { tok, email } = await token()

  // Propriedade: DETECTADA em runtime. A do André é de DOMÍNIO
  // (sc-domain:redentia.com.br), que cobre todos os subdomínios — é por isso
  // que os exports dela misturam www, whitelabel e estudo na mesma coluna.
  // Fixar a de prefixo fazia o script falhar com "não compartilhada" mesmo
  // com a permissão certa concedida. GSC_SITE força uma específica.
  // Falha aqui é de PERMISSÃO, não de código — dizer isso explicitamente
  // evita meia hora procurando bug no lugar errado.
  let site = process.env.GSC_SITE || ''
  const sites = await (await fetch('https://www.googleapis.com/webmasters/v3/sites', { headers: { authorization: `Bearer ${tok}` } })).json()
  const lista = (sites.siteEntry || []).map((s) => s.siteUrl)
  if (!lista.length) {
    fatal(`autenticou como ${email}, mas nenhuma propriedade está compartilhada com ela.
Search Console > Configurações > Usuários e permissões > Adicionar usuário
  e-mail: ${email}
  permissão: Restrito`)
  }
  if (site && !lista.includes(site)) fatal(`GSC_SITE=${site} não está entre as visíveis: ${lista.join(', ')}`)
  if (!site) {
    // Preferência: domínio (cobre tudo) > prefixo com www > o que houver.
    site = lista.find((s) => s.startsWith('sc-domain:'))
        || lista.find((s) => s.includes('//www.'))
        || lista[0]
  }

  async function query(body) {
    const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`
    const res = await fetch(url, {
      method: 'POST',
      headers: { authorization: `Bearer ${tok}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.status === 403) fatal(`sem acesso a ${site}.\nAdicione a conta de serviço em Search Console > Configurações > Usuários e permissões.`)
    if (!res.ok) fatal(`API devolveu ${res.status}: ${(await res.text()).slice(0, 300)}`)
    return (await res.json()).rows || []
  }

  /** URL Inspection: estado no índice + último rastreamento. Cota: 2.000/dia. */
  async function inspecionar(inspectionUrl) {
    const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST',
      headers: { authorization: `Bearer ${tok}`, 'content-type': 'application/json' },
      body: JSON.stringify({ inspectionUrl, siteUrl: site, languageCode: 'pt-BR' }),
    })
    if (!res.ok) return { erro: `${res.status}` }
    const r = (await res.json()).inspectionResult?.indexStatusResult ?? {}
    return { estado: r.coverageState ?? null, rastreio: r.lastCrawlTime ?? null, canonical: r.googleCanonical ?? null }
  }

  return { site, email, lista, query, inspecionar }
}
