/**
 * /caminho/ → /caminho num 301 só, com a query.
 *
 * A caixa do ticker (e o slug minúsculo) mora no middleware da página, que
 * só roda depois deste. Tirar a barra sozinha reabria a corrente:
 * /asset/petr4/ iria para /asset/petr4 e de lá para /asset/PETR4. A caixa
 * sai junto. O routeRules também: na função ele corre antes do middleware
 * e a barra já casa a regra exata, mas um slug que só casa DEPOIS da caixa
 * (/tesouro/TESOURO-…-2028/) passaria por dois 301. O mapa abaixo é o mesmo
 * destino do nuxt.config, para o salto terminar na URL final.
 *
 * /acao e /crypto já saem em /asset/{MAIÚSCULO} pelo atalho-canonico; com
 * barra, o destino é o mesmo, para a ordem dos arquivos não reabrir a corrente.
 *
 * Ficam de fora a raiz, o que é do próprio app, arquivo com extensão,
 * sitemap e robots, OAuth e o fluxo de conta (login, assinar, conta,
 * checkout, webhook), e qualquer método que não seja GET ou HEAD.
 */
import { B3_TICKER_RE, symbolShape } from '../../app/utils/tickerClass.ts'
import { PRECO_TETO_METODO_SLUGS } from '../../app/content/calculadoras/preco-teto-metodos.ts'
import { destinoCanonicoDeAtalho } from './atalho-canonico.ts'
import { pareceB2B } from './destino-b2b.ts'

const METODOS = new Set(['GET', 'HEAD'])

/** O mesmo formato do middleware da página (tese, tesouro, quanto-rende/tesouro). */
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,80}$/

/**
 * Destino final dos redirect do routeRules (nuxt.config.ts). A chave é o
 * caminho SEM a barra. O curinga não inclui /auth: callback de OAuth não
 * entra nesta regra.
 */
const REDIRECT_EXATO: Record<string, string> = {
  '/mercado': '/',
  '/raio-x': '/',
  '/calculadora': '/calculadoras',
  '/ranking': '/rankings',
  '/rankings/acoes': '/rankings?classe=acoes',
  '/rankings/fiis': '/rankings?classe=fiis',
  '/rankings/bdrs': '/rankings?classe=bdrs',
  '/rankings/renda-fixa': '/ranking/tesouro-direto',
  '/help': '/busca',
  '/search': '/busca',
  '/preco-teto': '/calculadora/preco-teto',
  '/dividendos/calendario': '/ranking/maiores-dividend-yield',
  '/dividendos': '/ranking/maiores-dividend-yield',
  '/guias/open-finance-carteira-espalhada': '/guias/open-finance',
  '/acoes': '/rankings?classe=acoes',
  // /fiis é página. A barra cai em /fiis, não no filtro, senão o 301 volta.
  '/etfs': '/rankings',
  '/small-caps': '/rankings',
  '/tesouro/tesouro-renda-aposentadoria-extra-2033': '/tesouro/tesouro-renda-aposentadoria-extra-2030',
  '/tesouro/tesouro-renda-aposentadoria-extra-2038': '/tesouro/tesouro-renda-aposentadoria-extra-2035',
  '/tesouro/tesouro-renda-aposentadoria-extra-2043': '/tesouro/tesouro-renda-aposentadoria-extra-2040',
  '/tesouro/tesouro-renda-aposentadoria-extra-2048': '/tesouro/tesouro-renda-aposentadoria-extra-2045',
  '/tesouro/tesouro-renda-aposentadoria-extra-2053': '/tesouro/tesouro-renda-aposentadoria-extra-2050',
  '/tesouro/tesouro-renda-aposentadoria-extra-2058': '/tesouro/tesouro-renda-aposentadoria-extra-2055',
  '/tesouro/tesouro-renda-aposentadoria-extra-2063': '/tesouro/tesouro-renda-aposentadoria-extra-2060',
  '/tesouro/tesouro-renda-aposentadoria-extra-2068': '/tesouro/tesouro-renda-aposentadoria-extra-2065',
  '/tesouro/tesouro-ipca-com-juros-semestrais-2028': '/tesouro/tesouro-ipca-com-juros-semestrais-2030',
  '/mercado-completo': '/',
  '/legal/terms': '/institucional/terms',
  '/legal/privacy': '/institucional/privacy',
  '/legal/cookies': '/institucional/cookies',
  '/privacidade': '/institucional/privacy',
  '/termos': '/institucional/terms',
  '/sobre': '/institucional/about',
  '/guias/melhores-fiis-para-investir-em-2026': '/guias/melhores-fiis-2026',
  '/guias/petr4-vs-vale3-vs-itub4': '/guias/como-analisar-uma-acao',
  '/guias/redent-score-0-100-explicado': '/metodologia',
  '/guias/analise-petr4-vale-a-pena-investir': '/asset/PETR4',
  '/guias/raio-x-da-carteira-em-crise': '/guias/como-montar-carteira-de-investimentos',
  '/api-portal': '/mcp',
  '/download': '/',
  '/guias/como-investir-em-acoes-para-iniciantes': '/guias/como-investir-em-acoes',
  '/guias/como-declarar-acoes-imposto-renda': '/guias/como-declarar-investimentos-no-ir',
  '/guias/poupanca-vs-tesouro-ipca-mais-2026': '/guias/tesouro-direto-para-iniciantes',
  '/guias/como-ganhar-40-60-renda-fixa-2026': '/guias/tesouro-direto-para-iniciantes',
  '/guias/calculadoras': '/calculadoras',
  '/guias/tesouro-redentia': '/tesouro',
  '/guias/comparador-ativos': '/calculadora/acoes',
  '/guias/pergunte-redentia': '/busca',
  '/guias/dividendos': '/guias/data-com-e-data-ex',
  '/guias/raio-x-carteira': '/guias/como-montar-carteira-de-investimentos',
}

/** O '/**' do routeRules: tudo DEBAIXO do prefixo, não a base. /auth fica de fora. */
const REDIRECT_CURINGA: Array<{ prefixo: string, para: string }> = [
  { prefixo: '/raio-x/', para: '/' },
  { prefixo: '/api-portal/', para: '/mcp' },
  { prefixo: '/embed/', para: '/calculadoras' },
]

const FORA = new Set(['login', 'assinar', 'conta', 'checkout', 'webhook', 'webhooks', 'auth', 'oauth', 'callback', 'callbacks'])

function comQuery(destino: string, query: string): string {
  if (query.length <= 1) return destino
  return destino.includes('?') ? `${destino}&${query.slice(1)}` : `${destino}${query}`
}

function decodificar(segmento: string): string | null {
  try { return decodeURIComponent(segmento) }
  catch { return null }
}

/** true: esta barra não vira 301. */
function foraDoEscopo(caminho: string): boolean {
  if (!caminho.startsWith('/') || caminho.startsWith('//') || /^\/+$/.test(caminho)) return true
  const sem = caminho.replace(/\/+$/, '') || '/'
  if (sem === '/' || sem.startsWith('//')) return true
  const partes = sem.split('/')
  const primeiro = (partes[1] ?? '').toLowerCase()
  if (primeiro.startsWith('_') || primeiro.startsWith('.')) return true
  if (primeiro === 'api' || FORA.has(primeiro)) return true
  if (partes.some((p) => p.toLowerCase() === 'callback' || p.toLowerCase() === 'callbacks')) return true
  const baixo = sem.toLowerCase()
  if (baixo === '/robots.txt' || baixo === '/sitemap.xml' || baixo === '/sitemaps' || baixo.startsWith('/sitemaps/')) return true
  const ultimo = partes[partes.length - 1] ?? ''
  if (/\.[a-z0-9]{1,8}$/i.test(ultimo)) return true
  if (pareceB2B(caminho) || pareceB2B(sem)) return true
  return false
}

function caixaDeSlug(sem: string, base: string, segmento: string): string {
  const raw = decodificar(segmento)
  if (raw == null) return sem
  const lower = raw.toLowerCase()
  if (!SLUG_RE.test(lower) || raw === lower) return sem
  return `${base}/${encodeURIComponent(lower)}`
}

function caixaDeTickerB3(sem: string, base: string, segmento: string): string {
  const raw = decodificar(segmento)
  if (raw == null) return sem
  const upper = raw.toUpperCase()
  if (!B3_TICKER_RE.test(upper) || raw === upper) return sem
  return `${base}/${encodeURIComponent(upper)}`
}

/** A caixa que a página faria no 301 seguinte. Sem barra no resultado. */
function normalizarCaixa(sem: string): string {
  const partes = sem.split('/')
  const seg = partes[partes.length - 1] ?? ''
  if (partes.length === 3 && partes[1] === 'asset' && seg) {
    const raw = decodificar(seg)
    if (raw == null) return sem
    const upper = raw.toUpperCase()
    if (symbolShape(upper) === 'invalid' || raw === upper) return sem
    return `/asset/${encodeURIComponent(upper)}`
  }
  if (partes.length === 3 && partes[1] === 'dividendos' && seg) return caixaDeTickerB3(sem, '/dividendos', seg)
  if (partes.length === 3 && partes[1] === 'quanto-rende' && seg) return caixaDeTickerB3(sem, '/quanto-rende', seg)
  if (partes.length === 4 && partes[1] === 'quanto-rende' && partes[2] === 'tesouro' && seg) {
    return caixaDeSlug(sem, '/quanto-rende/tesouro', seg)
  }
  if (partes.length === 4 && partes[1] === 'calculadora' && partes[2] === 'preco-teto' && seg) {
    const raw = decodificar(seg)
    if (raw == null || (PRECO_TETO_METODO_SLUGS as readonly string[]).includes(raw)) return sem
    const upper = raw.toUpperCase()
    if (symbolShape(upper) !== 'b3' || raw === upper) return sem
    return `/calculadora/preco-teto/${encodeURIComponent(upper)}`
  }
  if (partes.length === 3 && partes[1] === 'tese' && seg) return caixaDeSlug(sem, '/tese', seg)
  if (partes.length === 3 && partes[1] === 'tesouro' && seg) return caixaDeSlug(sem, '/tesouro', seg)
  return sem
}

function destinoDeRegra(sem: string): string | null {
  const exato = REDIRECT_EXATO[sem]
  if (exato) return exato
  for (const c of REDIRECT_CURINGA) {
    if (sem.startsWith(c.prefixo)) return c.para
  }
  return null
}

/**
 * Location do 301, ou null quando a barra fica (não é GET/HEAD, está fora
 * do escopo, ou o caminho já não tem barra). `caminhoComQuery` é o
 * `event.path`.
 */
export function destinoSemBarra(caminhoComQuery: string, metodo = 'GET'): string | null {
  if (!METODOS.has(metodo.toUpperCase())) return null
  const i = caminhoComQuery.indexOf('?')
  const caminho = i < 0 ? caminhoComQuery : caminhoComQuery.slice(0, i)
  const query = i < 0 ? '' : caminhoComQuery.slice(i)
  if (!caminho.endsWith('/') || caminho === '/') return null
  if (foraDoEscopo(caminho)) return null

  const atalho = destinoCanonicoDeAtalho(caminhoComQuery)
  if (atalho) return atalho

  const sem = caminho.replace(/\/+$/, '') || '/'
  if (sem === '/' || !sem.startsWith('/') || sem.startsWith('//')) return null
  const canonico = normalizarCaixa(sem)
  const regra = destinoDeRegra(canonico)
  return comQuery(regra ?? canonico, query)
}
