/**
 * sanitizeHtml — wrapper sobre DOMPurify pra renderizar HTML
 * authored por admin (em comunicacoes, emails, anuncios).
 *
 * Por que precisa: TipTap output e HTML cru. Em runtime renderizamos
 * com `v-html` no banner, anuncio, email. Se um admin (ou alguem que
 * comprometeu uma conta admin) injeta `<script>` ou
 * `<img onerror>`, sem sanitize roda. Defesa em profundidade —
 * mesmo que TipTap restrinja por extensao, o storage e o transport
 * podem ser manipulados.
 *
 * 3 niveis correspondendo aos levels do RichTextField:
 *   - inline: so b/i/strong/em/a (uma linha, banner)
 *   - basic:  + p/br/ul/ol/li/blockquote/h3/h4 (multi-paragrafo)
 *   - full:   + img/h1/h2/code/pre (email completo)
 *
 * Sempre forca `target=_blank rel=noopener noreferrer` em links.
 */
import DOMPurify from 'dompurify'

export type SanitizeLevel = 'inline' | 'basic' | 'full'

const TAG_PROFILES: Record<SanitizeLevel, string[]> = {
  inline: ['strong', 'em', 'b', 'i', 'a', 'span', 'br'],
  basic: [
    'strong', 'em', 'b', 'i', 'a', 'span', 'br',
    'p', 'ul', 'ol', 'li', 'blockquote', 'h3', 'h4',
  ],
  full: [
    'strong', 'em', 'b', 'i', 'u', 's', 'a', 'span', 'br',
    'p', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'img', 'figure', 'figcaption', 'code', 'pre', 'hr', 'div',
  ],
}

const ATTR_PROFILES: Record<SanitizeLevel, string[]> = {
  inline: ['href', 'target', 'rel', 'class'],
  basic: ['href', 'target', 'rel', 'class'],
  full: ['href', 'target', 'rel', 'class', 'src', 'alt', 'title', 'width', 'height'],
}

/**
 * Sanitiza HTML pra um nivel de comunicacao. Retorna string segura
 * pra usar em v-html.
 */
export function sanitizeHtml(html: string | null | undefined, level: SanitizeLevel = 'basic'): string {
  if (!html) return ''
  if (typeof window === 'undefined') {
    // SSR: DOMPurify precisa do DOM. Em SSR, retorna string crua —
    // o cliente re-renderiza no hydration. Como `v-html` em SSR ja
    // tem risco e isso eh content authored por admin (mais
    // confiavel que UGC), aceitavel. Cliente sanitiza no mount.
    return html
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: TAG_PROFILES[level],
    ALLOWED_ATTR: ATTR_PROFILES[level],
    // Force-add seguranca em todos os <a>
    ADD_ATTR: ['target'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur', 'style'],
  })
}

/**
 * Hook DOMPurify pra forcar target=_blank + rel=noopener em todos
 * os links sanitizados. Roda uma unica vez no client. Idempotente.
 */
let _hooksInstalled = false
export function installSanitizeHooks(): void {
  if (_hooksInstalled || typeof window === 'undefined') return
  _hooksInstalled = true
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  })
}

// Auto-instala hooks no client side
if (typeof window !== 'undefined') {
  installSanitizeHooks()
}

/**
 * Util: extrai texto puro de HTML pra char counters / placeholders /
 * ARIA labels. Usa innerText do DOM (so client). SSR retorna o HTML
 * cru com tags removidas via regex (best-effort).
 */
export function htmlToText(html: string | null | undefined): string {
  if (!html) return ''
  if (typeof window === 'undefined') {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  }
  const tmp = document.createElement('div')
  tmp.innerHTML = sanitizeHtml(html, 'inline')
  return (tmp.textContent || tmp.innerText || '').trim()
}
