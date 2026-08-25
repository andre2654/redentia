/**
 * Build do Redentia Skills Pack: injeta partials, linta as SKILL.md
 * PROCESSADAS e gera os zips que a página /business/skills serve.
 *
 *   node skills-pack/build.mjs        (a partir de Frontend/)
 *   npm run skills:build
 *
 * Pipeline:
 *   1. Cada SKILL.md passa pela injeção de partials: a linha
 *      `<!-- @partial:nome -->` vira o conteúdo de _partials/nome.md.
 *      É a fonte única da informação sensível-a-tempo (limites do MCP
 *      mudaram 2x e exigiram 4 edições manuais — nunca mais).
 *   2. O resultado vai pra .build/<slug>/ junto com scripts/ (se houver).
 *   3. Lint roda sobre o PROCESSADO (o que o usuário recebe).
 *   4. Zips em public/downloads/skills/:
 *      <slug>.zip               — SKILL.md na RAIZ + scripts/ (formato claude.ai)
 *      redentia-skills-pack.zip — ZIP DE ZIPS: LEIA-ME.txt + os 4 <slug>.zip
 *                                 (claude.ai instala um zip por vez; Claude
 *                                 Code descompacta cada um em
 *                                 .claude/skills/<slug>/ — o LEIA-ME repete
 *                                 o passo a passo). O bundle de PASTAS
 *                                 morreu junto com /business/comecar
 *                                 (dono, 2026-08-25).
 *
 * Os zips são COMMITADOS (Vercel serve estático). Editou SKILL.md ou
 * partial → rode o build e commite os zips junto.
 *
 * O lint NÃO procura termos banidos de compliance: as skills citam esses
 * termos dentro das próprias seções de proibição — um grep cego reprovaria
 * exatamente o texto que protege. Compliance se verifica no teste de mesa
 * (TESTES.md).
 */
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync, mkdirSync, rmSync, writeFileSync, cpSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url)) // Frontend/skills-pack
const OUT = join(ROOT, '..', 'public', 'downloads', 'skills')
const STAGE = join(ROOT, '.build')

const NAME_RE = /^[a-z0-9-]{1,64}$/
// Faixas de emoji/pictogramas — proibidos no pack inteiro. Setas tipográficas
// (U+2190-21FF, ex. "→" de "Conta → MCP") são padrão da casa e ficam de fora.
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B00}-\u{2BFF}]/u

const slugs = readdirSync(ROOT).filter((d) => {
  if (d.startsWith('_') || d.startsWith('.')) return false
  try {
    return statSync(join(ROOT, d)).isDirectory()
  } catch {
    return false
  }
})

function injectPartials(raw, slug, errors) {
  return raw.replace(/^<!-- @partial:([a-z0-9-]+) -->$/gm, (_, name) => {
    const p = join(ROOT, '_partials', `${name}.md`)
    try {
      return readFileSync(p, 'utf8').trimEnd()
    } catch {
      errors.push(`${slug}: partial "${name}" não encontrado em _partials/`)
      return ''
    }
  })
}

const errors = []
const processed = new Map() // slug -> conteúdo final

for (const slug of slugs) {
  const path = join(ROOT, slug, 'SKILL.md')
  let raw
  try {
    raw = readFileSync(path, 'utf8')
  } catch {
    errors.push(`${slug}: SKILL.md ausente`)
    continue
  }
  const final = injectPartials(raw, slug, errors)
  processed.set(slug, final)

  const fm = final.match(/^---\n([\s\S]*?)\n---\n/)
  if (!fm) {
    errors.push(`${slug}: frontmatter ausente ou malformado`)
    continue
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
  const bodyLines = final.slice(fm[0].length).split('\n').length
  if (bodyLines < 100 || bodyLines > 450) errors.push(`${slug}: corpo com ${bodyLines} linhas (janela: 100-450)`)

  const emoji = final.match(EMOJI_RE)
  if (emoji) errors.push(`${slug}: emoji/pictograma proibido encontrado (${emoji[0]})`)

  // Marker que sobrou sem resolver = partial esquecido
  if (/<!-- @partial:/.test(final)) errors.push(`${slug}: marker de partial não resolvido no corpo final`)
}

if (errors.length) {
  console.error('LINT FALHOU:')
  errors.forEach((e) => console.error('  - ' + e))
  process.exit(1)
}
console.log(`lint ok: ${slugs.length} skills (${slugs.join(', ')})`)

// ——— staging: SKILL.md processada + scripts/ ———
rmSync(STAGE, { recursive: true, force: true })
for (const slug of slugs) {
  const dir = join(STAGE, slug)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'SKILL.md'), processed.get(slug))
  const scripts = join(ROOT, slug, 'scripts')
  if (existsSync(scripts)) cpSync(scripts, join(dir, 'scripts'), { recursive: true })
}

mkdirSync(OUT, { recursive: true })

for (const slug of slugs) {
  const zipPath = join(OUT, `${slug}.zip`)
  rmSync(zipPath, { force: true })
  // cwd no staging do slug: SKILL.md na raiz do zip (formato claude.ai),
  // scripts/ junto quando existir. -X: sem attrs extras, diff estável no git.
  execFileSync('zip', ['-X', '-r', zipPath, '.'], { cwd: join(STAGE, slug), stdio: 'pipe' })
}

// ——— bundle: ZIP DE ZIPS ———
// O claude.ai só instala skill em zip individual, então o pack principal
// carrega os 4 zips prontos + LEIA-ME.txt. -0 = store (zip dentro de zip
// não comprime de novo); -j = tudo na raiz, sem caminhos. Slugs ordenados
// pra listagem estável no diff.
const LEIAME = `Redentia Skills Pack
====================

Cada skill está no próprio arquivo .zip — é o formato que o claude.ai aceita.

No claude.ai
  1. Abra Configurações e procure por Skills (em geral dentro de
     Capacidades; o caminho pode variar com a versão).
  2. Envie UM zip por vez. A skill aparece pelo nome e ativa sozinha
     quando a pergunta combina com ela.
  3. Repita pra cada skill que a mesa for usar.

No Claude Code
  1. Crie .claude/skills/ no projeto (ou ~/.claude/skills/ pra valer em tudo).
  2. Descompacte cada zip numa pasta com o nome da skill:
     .claude/skills/redentia-carteira/, e assim por diante.

As skills usam a conexão MCP que você já configurou — nenhuma chave nova,
nenhum acesso além do que a sua chave já alcança.
`
const bundle = join(OUT, 'redentia-skills-pack.zip')
rmSync(bundle, { force: true })
const leiame = join(STAGE, 'LEIA-ME.txt')
writeFileSync(leiame, LEIAME)
execFileSync('zip', ['-X', '-0', '-j', bundle,
  leiame,
  ...[...slugs].sort().map((s) => join(OUT, `${s}.zip`)),
], { stdio: 'pipe' })

rmSync(STAGE, { recursive: true, force: true })

for (const f of readdirSync(OUT).sort()) {
  const kb = (statSync(join(OUT, f)).size / 1024).toFixed(1)
  console.log(`  ${f}  ${kb} KB`)
}
console.log('build ok')
