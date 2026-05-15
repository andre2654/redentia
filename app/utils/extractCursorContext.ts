/**
 * extractCursorContext.ts
 *
 * Captura, sem qualquer cooperação dos componentes, o que está sob o cursor
 * em uma página Redentia. A ideia é ser zero-manutenção: à medida que novas
 * páginas/componentes nascem, a captura "herda" suporte automaticamente,
 * desde que o HTML seja minimamente semântico (h*, table, section, p, etc).
 *
 * Camadas capturadas:
 *   1. Rota: path + params + document.title
 *   2. Headings ascendentes + heading principal do viewport
 *   3. Elemento focado: tag, texto, atributos data-/aria-/href
 *   4. Vizinhança: texto de siblings imediatos
 *   5. Tabela: cabeçalho de coluna + label de linha quando aplicável
 *
 * O resultado vai pra sessionStorage e é injetado no /help como contexto
 * inicial da conversa.
 */

export interface CursorContext {
  url: string
  pageTitle: string
  routeParams: Record<string, string>
  /** Cadeia hierárquica: viewport heading + ancestrais + (linha/coluna se table) */
  semanticBreadcrumb: string
  /** H1/H2 mais recente acima do scroll atual */
  pageHeading: string
  /** Headings ancestrais entre o cursor e o root */
  ancestorHeadings: string[]
  focused: {
    tag: string
    text: string
    attributes: Record<string, string>
    role?: string
  }
  /** Texto curto de até 6 siblings adjacentes */
  neighbors: string[]
  /** Capturado quando o elemento sob cursor é td/th */
  tableContext?: {
    columnHeader?: string
    rowHeader?: string
  }
  /** Posição do cursor no momento da captura, viewport coords */
  cursor: { x: number; y: number }
  capturedAt: number
}

const SEMANTIC_TAGS = new Set([
  'article', 'section', 'aside', 'header', 'footer', 'main', 'nav',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'li', 'blockquote', 'pre', 'figure', 'figcaption',
  'table', 'tr', 'td', 'th',
  'button', 'a',
  'dt', 'dd',
])

const SUPPRESS_TAGS = new Set(['input', 'textarea', 'select', 'option'])
const SUPPRESS_ROLES = new Set(['textbox', 'combobox', 'listbox', 'searchbox', 'spinbutton'])

/**
 * Indica se o cursor está numa zona onde NÃO devemos disparar:
 * inputs, contenteditable, modais explicitamente marcados, ou regiões
 * com data-ai-cursor-suppress.
 */
export function isSuppressedZone(el: Element | null | undefined): boolean {
  if (!el) return true
  let cur: Element | null = el
  while (cur && cur !== document.body) {
    const tag = cur.tagName?.toLowerCase()
    if (tag && SUPPRESS_TAGS.has(tag)) return true
    if (cur.hasAttribute('contenteditable') && cur.getAttribute('contenteditable') !== 'false') return true
    const role = cur.getAttribute('role')
    if (role && SUPPRESS_ROLES.has(role)) return true
    if (cur.hasAttribute('data-ai-cursor-suppress')) return true
    cur = cur.parentElement
  }
  return false
}

function findSemanticAncestor(el: Element, maxDepth = 6): Element {
  let cur: Element | null = el
  let depth = 0
  while (cur && depth < maxDepth) {
    const tag = cur.tagName?.toLowerCase()
    if (cur.hasAttribute('data-ai-context')) return cur
    if (tag && SEMANTIC_TAGS.has(tag)) return cur
    cur = cur.parentElement
    depth++
  }
  return el
}

function collectAncestorHeadings(el: Element, max = 3): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  let cur: Element | null = el
  while (cur && cur !== document.body && out.length < max) {
    let sib: Element | null = cur.previousElementSibling
    while (sib) {
      const tag = sib.tagName?.toLowerCase()
      if (tag && /^h[1-6]$/.test(tag)) {
        const t = (sib.textContent || '').trim()
        if (t && !seen.has(t)) {
          out.unshift(t)
          seen.add(t)
          break
        }
      }
      sib = sib.previousElementSibling
    }
    cur = cur.parentElement
  }
  return out
}

/**
 * Heading mais próxima ACIMA do cursor (mesma seção visual).
 * Mais útil que o heading do topo do viewport, porque captura
 * a section em que o usuário está realmente lendo.
 */
function findHeadingAboveCursor(cursorY: number): string {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
  let best = ''
  for (const h of headings) {
    const rect = h.getBoundingClientRect()
    if (rect.bottom <= cursorY + 8) {
      best = (h.textContent || '').trim()
    }
    else if (rect.top > cursorY) {
      break
    }
  }
  return best
}

function extractTableContext(cell: Element): { columnHeader?: string; rowHeader?: string } {
  const tr = cell.closest('tr')
  if (!tr) return {}
  const cellIndex = Array.from(tr.children).indexOf(cell)
  const table = cell.closest('table')
  let columnHeader: string | undefined
  if (table) {
    const headers
      = table.querySelectorAll('thead th')
        .length > 0
        ? table.querySelectorAll('thead th')
        : table.querySelectorAll('tr:first-child th')
    const h = headers[cellIndex]
    if (h) columnHeader = (h.textContent || '').trim()
  }
  const firstCell = tr.children[0]
  const rowHeader
    = firstCell && firstCell !== cell ? (firstCell.textContent || '').trim() : undefined
  return { columnHeader, rowHeader }
}

function collectAttributes(el: Element): Record<string, string> {
  const out: Record<string, string> = {}
  for (const attr of Array.from(el.attributes)) {
    if (
      attr.name.startsWith('data-')
      || attr.name.startsWith('aria-')
      || attr.name === 'href'
      || attr.name === 'title'
      || attr.name === 'alt'
    ) {
      out[attr.name] = attr.value
    }
  }
  return out
}

function collectNeighbors(el: Element, max = 6, charLimit = 120): string[] {
  const parent = el.parentElement
  if (!parent) return []
  const out: string[] = []
  for (const sib of Array.from(parent.children)) {
    if (sib === el) continue
    const t = (sib.textContent || '').trim().replace(/\s+/g, ' ').slice(0, charLimit)
    if (t) out.push(t)
    if (out.length >= max) break
  }
  return out
}

export interface ExtractOpts {
  routePath: string
  routeParams?: Record<string, any>
  pageTitle?: string
}

export function extractCursorContext(
  x: number,
  y: number,
  opts: ExtractOpts,
): CursorContext | null {
  if (typeof document === 'undefined') return null
  const el = document.elementFromPoint(x, y)
  if (!el || isSuppressedZone(el)) return null

  const semantic = findSemanticAncestor(el)
  const text = (semantic.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 400)
  if (!text) return null

  const ancestorHeadings = collectAncestorHeadings(semantic, 3)
  const pageHeading = findHeadingAboveCursor(y)

  let tableContext: CursorContext['tableContext']
  const tag = semantic.tagName?.toLowerCase()
  if (tag === 'td' || tag === 'th') {
    tableContext = extractTableContext(semantic)
  }

  // Ordem do breadcrumb: ancestrais (geral) → heading próxima (seção atual) → célula da tabela (específico)
  const breadcrumbParts = [
    ...ancestorHeadings,
    pageHeading,
    tableContext?.rowHeader,
    tableContext?.columnHeader,
  ].filter((p): p is string => Boolean(p && p.trim()))

  // De-dup mantendo ordem
  const seen = new Set<string>()
  const semanticBreadcrumb = breadcrumbParts
    .filter((p) => {
      if (seen.has(p)) return false
      seen.add(p)
      return true
    })
    .join(' › ')

  return {
    url: opts.routePath,
    pageTitle: opts.pageTitle || (typeof document !== 'undefined' ? document.title : ''),
    routeParams: (opts.routeParams || {}) as Record<string, string>,
    semanticBreadcrumb,
    pageHeading,
    ancestorHeadings,
    focused: {
      tag: tag || 'unknown',
      text,
      attributes: collectAttributes(semantic),
      role: semantic.getAttribute('role') || undefined,
    },
    neighbors: collectNeighbors(semantic),
    tableContext,
    cursor: { x, y },
    capturedAt: Date.now(),
  }
}

/**
 * Constrói uma "pergunta sugerida" curta a partir do contexto, pra mostrar
 * no overlay como teaser e como pré-fill do composer no /help.
 */
export function suggestQuestion(ctx: CursorContext): string {
  const { focused, semanticBreadcrumb, tableContext } = ctx

  if (tableContext?.columnHeader && tableContext?.rowHeader) {
    return `O que significa "${tableContext.rowHeader}" de ${tableContext.columnHeader}?`
  }

  if (focused.tag === 'a' || focused.tag === 'button') {
    return `O que acontece se eu clicar em "${focused.text.slice(0, 40)}"?`
  }

  if (semanticBreadcrumb) {
    return `Me explica isso: ${semanticBreadcrumb}`
  }

  return `Sobre o que estou vendo: "${focused.text.slice(0, 60)}"`
}
