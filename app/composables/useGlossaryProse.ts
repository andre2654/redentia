/**
 * useGlossaryProse — auto-highlight financial-glossary terms in chat
 * markdown and mount a hover-tooltip Vue component on each match.
 *
 * Source of truth: `data/glossario/termos.ts` (87+ canonical entries
 * powering the public `/glossario` pages). This composable indexes
 * every term's `nome`, `sigla`, and `palavrasChave[]` into a single
 * matcher, so any of these surface forms hit the same definition.
 *
 * Design follows the same pattern as `useTickerProse`:
 *
 *   1. Marked inline-level extension scans markdown source for any
 *      indexed surface form and emits a `<span class="glossary-mount"
 *      data-key="dy">DY</span>` placeholder.
 *
 *   2. After Message.vue renders the markdown HTML, the host calls
 *      `mountIn(root)` which walks every placeholder, creates a
 *      `GlossaryTerm` VNode wired to the same Vue app context, and
 *      mounts it inside the placeholder via `render(vnode, el)`.
 *
 *   3. `cleanup()` on host unmount unmounts every chip we touched.
 *
 * Matching rules
 *   - Whole-word, case-insensitive. "cdi", "CDI", "Cdi" all hit.
 *   - Multi-token (P/L, P/VP, EV/EBIT, NTN-B) supported via
 *     boundary lookarounds that recognise letters/digits/accented
 *     chars as "word" but allow `/` and `-` inside the term.
 *   - Code blocks (`<code>`, `<pre>`) and existing chips
 *     (ticker, chart, max, anchors) are skipped at mount time.
 *   - Long terms win: regex compiler sorts by surface-form length
 *     DESC so "Dividend Yield" beats "DY" beats "yield".
 *   - To avoid noisy matches we filter the surface index:
 *       • drop forms ≤ 1 char,
 *       • drop forms in COMMON_WORDS (too generic to highlight),
 *       • dedup case-insensitively.
 *   - The first time a term appears in a given message it's
 *     decorated; subsequent mentions in the same answer are left
 *     alone so the prose doesn't turn into a sea of underlines.
 */
import {
  type ComponentInternalInstance,
  createVNode,
  render,
  getCurrentInstance,
} from 'vue'
import { marked } from 'marked'
import GlossaryTerm from '~/components/atoms/GlossaryTerm.vue'
import { termos } from '~/data/glossario/termos'
import type { TermoGlossario } from '~/types/glossario'

interface IndexEntry {
  /** Surface form as it appears in prose (lowercased). */
  surface: string
  /** Canonical entry from the glossary data set. */
  entry: TermoGlossario
}

interface GlossaryToken {
  type: 'glossary'
  raw: string
  /** Lowercased surface key — used to look up the entry at mount. */
  matchedKey: string
}

// ---- Stop list ----------------------------------------------------

/**
 * Words / palavrasChave that appear in the data but are too common
 * to decorate inline (they'd light up every other word in the
 * answer). Filtered out of the surface-form index — the user can
 * still click the canonical sigla/nome and reach `/glossario/...`.
 */
const COMMON_WORDS = new Set([
  // Very generic
  'investir', 'investimento', 'investimentos', 'investidor', 'investidora',
  'mercado', 'preço', 'preco', 'taxa', 'taxas', 'valor', 'lucro', 'lucros',
  'risco', 'riscos', 'retorno', 'retornos', 'fundo', 'fundos',
  'ação', 'acao', 'ações', 'acoes', 'cota', 'cotas',
  'empresa', 'empresas', 'banco', 'bancos',
  // Time / quantity
  'mês', 'mes', 'meses', 'ano', 'anos', 'dia', 'dias',
  // Useless / single token
  'br', 'us', 'eua', 'usa',
])

// ---- Build the surface index -------------------------------------

/**
 * Compose every (surface, entry) pair from `termos`. We harvest:
 *   - `nome` (e.g. "Dividend Yield")
 *   - `sigla` (e.g. "DY") when present
 *   - `palavrasChave[]` (synonyms / spelling variants)
 *
 * After harvesting we filter by:
 *   - length > 1
 *   - not in COMMON_WORDS
 *   - dedup case-insensitively (longest-form-wins kept inside Map)
 *
 * The Map preserves insertion order, so when two terms collide on
 * the same surface form (rare — happened with "ETF" once), the
 * first definition declared in `termos.ts` wins.
 */
function buildIndex(): Map<string, TermoGlossario> {
  const idx = new Map<string, TermoGlossario>()
  const stage: IndexEntry[] = []

  for (const t of termos) {
    const surfaces = new Set<string>()
    if (t.nome) surfaces.add(t.nome.trim())
    if (t.sigla) surfaces.add(t.sigla.trim())
    for (const k of t.palavrasChave ?? []) {
      if (k && k.trim()) surfaces.add(k.trim())
    }
    for (const s of surfaces) {
      const lower = s.toLowerCase()
      if (lower.length <= 1) continue
      if (COMMON_WORDS.has(lower)) continue
      stage.push({ surface: lower, entry: t })
    }
  }

  // Sort by length DESC so the index Map will see longest forms
  // first when we set entries with the same key — but since the
  // key is the EXACT surface, a collision actually happens only
  // when two distinct surfaces share casing (rare). The DESC sort
  // also helps the regex compiler downstream.
  stage.sort((a, b) => b.surface.length - a.surface.length)
  for (const { surface, entry } of stage) {
    if (!idx.has(surface)) idx.set(surface, entry)
  }
  return idx
}

const TERM_INDEX = buildIndex()

// ---- Compile the regex -------------------------------------------

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&')
}

/**
 * Build the alternation regex from the surface index. Sorted by
 * length DESC so the tokenizer sees the longest possible match
 * first ("Dividend Yield" before "yield"). Boundary lookarounds
 * use the explicit class `[A-Za-zÀ-ÿ0-9]` instead of `\b` because:
 *
 *   1. `\b` is unaware of accented characters, so "ações" would
 *      bleed into a match,
 *   2. We need to allow `/` and `-` INSIDE the matched term
 *      (P/L, IGP-M, NTN-B) without the regex treating them as
 *      boundaries.
 */
function buildRegex(): { full: RegExp; atStart: RegExp } {
  const surfaces = Array.from(TERM_INDEX.keys())
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
  if (!surfaces.length) {
    // Defensive — never matches, won't crash if the data file is
    // unexpectedly empty.
    return { full: /(?:)^$/, atStart: /(?:)^$/ }
  }
  const alternation = `(?:${surfaces.join('|')})`
  // Stricter than \b: don't fire when the previous/next char is
  // alphanumeric or accented.
  return {
    full: new RegExp(
      `(?<![A-Za-zÀ-ÿ0-9])${alternation}(?![A-Za-zÀ-ÿ0-9])`,
      'i',
    ),
    atStart: new RegExp(`^${alternation}(?![A-Za-zÀ-ÿ0-9])`, 'i'),
  }
}

const { full: GLOSSARY_RE, atStart: GLOSSARY_RE_AT_START } = buildRegex()

// ---- Marked extension --------------------------------------------

let markedConfigured = false
function ensureMarkedConfigured(): void {
  if (markedConfigured) return
  markedConfigured = true
  marked.use({
    extensions: [
      {
        name: 'glossary',
        level: 'inline',
        start(src: string): number | undefined {
          const m = GLOSSARY_RE.exec(src)
          return m ? m.index : undefined
        },
        tokenizer(src: string): GlossaryToken | undefined {
          const match = GLOSSARY_RE_AT_START.exec(src)
          if (!match) return undefined
          const raw = match[0]
          const key = raw.toLowerCase()
          if (!TERM_INDEX.has(key)) return undefined
          return {
            type: 'glossary',
            raw,
            matchedKey: key,
          }
        },
        renderer(token: GlossaryToken): string {
          // Visible text == the original casing the LLM used. The
          // post-mount step replaces innerHTML with the live Vue
          // component but keeps the wrapper span as the mount point.
          const visible = escapeAttribute(token.raw)
          const k = escapeAttribute(token.matchedKey)
          return `<span class="glossary-mount" data-key="${k}">${visible}</span>`
        },
      },
    ],
  })
}

function escapeAttribute(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

export function ensureGlossaryProseSetup(): void {
  ensureMarkedConfigured()
}

// ---- Mount logic --------------------------------------------------

/**
 * Truncate the resumida definition for the tooltip. The full text
 * lives at `/glossario/[slug]` and is one click away — the tooltip
 * is for recognition, not deep dive. 220 chars ~= 3 short lines.
 */
function trimDefinition(text: string, max = 220): string {
  if (!text) return ''
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= max) return cleaned
  return cleaned.slice(0, max - 1).replace(/[,;\s]+\S*$/, '') + '…'
}

export function useGlossaryProse() {
  const instance = getCurrentInstance() as ComponentInternalInstance | null
  const mountedSpans = new Set<HTMLElement>()

  function mountIn(root: HTMLElement | null | undefined): void {
    if (!root || !instance) return
    if (typeof window === 'undefined') return // SSR no-op
    const placeholders = root.querySelectorAll<HTMLElement>(
      '.glossary-mount[data-key]',
    )
    // Decorate ONLY the first occurrence per term per message — a
    // long answer mentioning "DY" eight times shouldn't underline
    // every single one. Tracking by key keeps the second+ matches
    // as plain text but doesn't strip them from the DOM.
    const decorated = new Set<string>()
    placeholders.forEach((span) => {
      if (span.dataset.mounted === '1') return
      // Skip ONLY inside code blocks, anchors, and existing chip
      // mounts. Tables stay decorated — financial answers lean
      // heavily on tables (P/L vs P/VP, ROE vs ROIC, …) and the
      // user explicitly wants tooltips there too. The previous
      // empty-cell regression was caused by NuxtLink failing to
      // resolve its router context when mounted dynamically; the
      // chip now uses a plain <span> + programmatic router.push
      // (see GlossaryTerm.vue), so single-term cells render fine.
      if (
        span.closest(
          'code, pre, .ticker-mount, .chart-mount, .max-feature-mount, a',
        )
      ) {
        span.classList.remove('glossary-mount')
        return
      }
      const key = span.dataset.key
      if (!key) return
      if (decorated.has(key)) {
        // Strip the placeholder class so subsequent visits ignore it,
        // keep the visible text untouched.
        span.classList.remove('glossary-mount')
        return
      }
      const entry = TERM_INDEX.get(key)
      if (!entry) return
      const visibleText = span.textContent ?? entry.nome
      const definition = trimDefinition(entry.definicaoResumida)
      try {
        const vnode = createVNode(GlossaryTerm, {
          term: visibleText,
          definition,
          slug: entry.slug,
        })
        vnode.appContext = instance.appContext
        // Clear AFTER preparing the vnode so any creation error
        // bails out before we lose the visible text.
        span.textContent = ''
        render(vnode, span)
        span.dataset.mounted = '1'
        mountedSpans.add(span)
        decorated.add(key)
      } catch (err) {
        // Defensive: if the mount throws (router context missing,
        // tooltip lib unavailable, etc.), restore the original text
        // instead of leaving an empty span. Log once at warn level
        // so diagnostics catch it without hammering the console.
        if (typeof console !== 'undefined') {
          // eslint-disable-next-line no-console
          console.warn('[glossary] mount failed for', key, err)
        }
        span.textContent = visibleText
        span.classList.remove('glossary-mount')
      }
    })
  }

  function cleanup(): void {
    if (typeof window === 'undefined') return
    mountedSpans.forEach((span) => {
      render(null, span)
      span.removeAttribute('data-mounted')
    })
    mountedSpans.clear()
  }

  return { mountIn, cleanup }
}
