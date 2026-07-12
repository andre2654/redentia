/**
 * Markdown mínimo das respostas do chat (PR9 /busca) — ZERO dependência nova.
 * Regras (contrato do PR9): escapa HTML PRIMEIRO (o conteúdo vem de LLM),
 * depois aplica só a gramática que o produto usa: **bold**, *itálico*,
 * `code` inline, links [t](url) http(s) com rel seguro, listas com hífen e
 * numeradas, headings viram parágrafo bold e parágrafos quebram por linha
 * dupla (linha simples vira <br> dentro do parágrafo).
 * Saída segura pra v-html: tudo escapado antes das substituições e href
 * restrito a http(s) — nunca javascript:.
 */

function inlineMd(s: string): string {
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer nofollow">$1</a>',
    )
}

const UL_RE = /^\s*[-*]\s+/
const OL_RE = /^\s*\d+[.)]\s+/
const H_RE = /^#{1,6}\s+(.+)$/
const TR_RE = /^\s*\|.*\|\s*$/
const TSEP_RE = /^\s*\|?[\s:|-]+\|?\s*$/

/** Linhas de tabela markdown (| a | b |) → <table> simples; separadores
 *  (|---|) somem. O chat-service responde com tabelas MD com frequência —
 *  pipes crus no meio da resposta liam como lixo. */
function renderTable(lines: string[]): string {
  const rows = lines
    .filter((l) => !TSEP_RE.test(l))
    .map((l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => inlineMd(c.trim())))
  if (!rows.length) return ''
  const [head, ...body] = rows
  const th = head!.map((c) => `<th>${c}</th>`).join('')
  const trs = body.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')
  return `<div class="md-table"><table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`
}

/** Um bloco (sem linha dupla no meio) → runs de lista viram <ul>/<ol>. */
function renderBlock(lines: string[]): string {
  const out: string[] = []
  let i = 0
  while (i < lines.length) {
    if (UL_RE.test(lines[i]!)) {
      const items: string[] = []
      while (i < lines.length && UL_RE.test(lines[i]!)) {
        items.push(`<li>${inlineMd(lines[i]!.replace(UL_RE, '').trim())}</li>`)
        i++
      }
      out.push(`<ul>${items.join('')}</ul>`)
    } else if (OL_RE.test(lines[i]!)) {
      const items: string[] = []
      while (i < lines.length && OL_RE.test(lines[i]!)) {
        items.push(`<li>${inlineMd(lines[i]!.replace(OL_RE, '').trim())}</li>`)
        i++
      }
      out.push(`<ol>${items.join('')}</ol>`)
    } else if (TR_RE.test(lines[i]!)) {
      const rows: string[] = []
      while (i < lines.length && TR_RE.test(lines[i]!)) {
        rows.push(lines[i]!)
        i++
      }
      out.push(renderTable(rows))
    } else {
      const seg: string[] = []
      while (i < lines.length && !UL_RE.test(lines[i]!) && !OL_RE.test(lines[i]!) && !TR_RE.test(lines[i]!)) {
        const h = lines[i]!.match(H_RE)
        seg.push(h ? `<strong>${inlineMd(h[1]!.trim())}</strong>` : inlineMd(lines[i]!))
        i++
      }
      out.push(`<p>${seg.join('<br>')}</p>`)
    }
  }
  return out.join('')
}

export function chatMarkdown(src: string): string {
  const text = escapeHtml(String(src ?? '')).replace(/\r\n/g, '\n')
  const blocks = text.split(/\n{2,}/)
  const out: string[] = []
  for (const raw of blocks) {
    const block = raw.trim()
    if (!block) continue
    out.push(renderBlock(block.split('\n').map((l) => l.trimEnd()).filter((l) => l.trim().length > 0)))
  }
  return out.join('')
}
