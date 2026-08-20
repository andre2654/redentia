/**
 * Build do Redentia Skills Pack: linta as SKILL.md e gera os zips que a
 * página /business/skills serve pra download.
 *
 *   node skills-pack/build.mjs        (a partir de Frontend/)
 *   npm run skills:build
 *
 * Saída em public/downloads/skills/:
 *   <slug>.zip               — SKILL.md na RAIZ (formato de upload do claude.ai)
 *   redentia-skills-pack.zip — bundle <slug>/SKILL.md (pra .claude/skills/ do Claude Code)
 *
 * Os zips são COMMITADOS (Vercel serve estático de public/). Editou uma
 * SKILL.md → rode o build de novo e commite os zips junto.
 *
 * O lint NÃO procura termos banidos de compliance: as skills citam esses
 * termos dentro das próprias seções de proibição — um grep cego reprovaria
 * exatamente o texto que protege. Compliance se verifica no teste de mesa.
 */
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync, mkdirSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url)) // Frontend/skills-pack
const OUT = join(ROOT, '..', 'public', 'downloads', 'skills')

const NAME_RE = /^[a-z0-9-]{1,64}$/
// Faixas de emoji/pictogramas — proibidos no pack inteiro. Setas tipográficas
// (U+2190-21FF, ex. "→" de "Conta → MCP") são padrão da casa e ficam de fora.
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B00}-\u{2BFF}]/u

const slugs = readdirSync(ROOT).filter((d) => {
  try {
    return statSync(join(ROOT, d)).isDirectory()
  } catch {
    return false
  }
})

const errors = []
const lint = (slug) => {
  const path = join(ROOT, slug, 'SKILL.md')
  let raw
  try {
    raw = readFileSync(path, 'utf8')
  } catch {
    errors.push(`${slug}: SKILL.md ausente`)
    return
  }

  const fm = raw.match(/^---\n([\s\S]*?)\n---\n/)
  if (!fm) {
    errors.push(`${slug}: frontmatter ausente ou malformado`)
    return
  }
  const keys = [...fm[1].matchAll(/^([a-z-]+):/gm)].map((m) => m[1])
  const extra = keys.filter((k) => k !== 'name' && k !== 'description')
  if (extra.length) errors.push(`${slug}: frontmatter só aceita name e description (achado: ${extra.join(', ')})`)

  const name = fm[1].match(/^name:\s*(.+)$/m)?.[1]?.trim()
  if (name !== slug) errors.push(`${slug}: name "${name}" difere da pasta`)
  if (!name || !NAME_RE.test(name)) errors.push(`${slug}: name inválido (esperado ^[a-z0-9-]{1,64}$)`)

  const desc = fm[1].match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? ''
  if (desc.length < 200 || desc.length > 1024) {
    errors.push(`${slug}: description com ${desc.length} chars (janela: 200-1024)`)
  }

  // Piso baixo de propósito: skill densa vale mais que skill inflada — o
  // teto é que protege (payload de contexto no cliente).
  const bodyLines = raw.slice(fm[0].length).split('\n').length
  if (bodyLines < 100 || bodyLines > 450) errors.push(`${slug}: corpo com ${bodyLines} linhas (janela: 100-450)`)

  const emoji = raw.match(EMOJI_RE)
  if (emoji) errors.push(`${slug}: emoji/pictograma proibido encontrado (${emoji[0]})`)
}

slugs.forEach(lint)
if (errors.length) {
  console.error('LINT FALHOU:')
  errors.forEach((e) => console.error('  - ' + e))
  process.exit(1)
}
console.log(`lint ok: ${slugs.length} skills (${slugs.join(', ')})`)

mkdirSync(OUT, { recursive: true })

for (const slug of slugs) {
  const zipPath = join(OUT, `${slug}.zip`)
  rmSync(zipPath, { force: true })
  // -j: SKILL.md na raiz do zip (formato do upload de Skills do claude.ai);
  // -X: sem atributos extras, pra diff estável no git.
  execFileSync('zip', ['-X', '-j', zipPath, join(ROOT, slug, 'SKILL.md')], { stdio: 'pipe' })
}

const bundle = join(OUT, 'redentia-skills-pack.zip')
rmSync(bundle, { force: true })
// Bundle preserva <slug>/SKILL.md — destino é .claude/skills/ do Claude Code.
execFileSync('zip', ['-X', '-r', bundle, '.', '-i', '*/SKILL.md'], { cwd: ROOT, stdio: 'pipe' })

for (const f of readdirSync(OUT).sort()) {
  const kb = (statSync(join(OUT, f)).size / 1024).toFixed(1)
  console.log(`  ${f}  ${kb} KB`)
}
console.log('build ok')
