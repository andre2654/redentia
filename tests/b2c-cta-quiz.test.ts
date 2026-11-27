/**
 * Item 3 de conversão B2C: a pílula compacta do header no celular abre o
 * mesmo quiz do desktop, e todo "Criar conta grátis" de página pública aponta
 * para /assinar?quiz=1&de=... . Entrar, Seguir e Criar alerta ficam no /login.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = fileURLToPath(new URL('..', import.meta.url))
const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

function semComentarios(src: string): string {
  // A linha // sai antes do bloco: um `calc/*` no comentário de linha não pode
  // engolir o template até o próximo `*/`.
  const semLinha = src.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n')
  return semLinha
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
}

function arquivosVueTs(dir: string): string[] {
  const out: string[] = []
  for (const nome of readdirSync(dir)) {
    const abs = join(dir, nome)
    if (statSync(abs).isDirectory()) out.push(...arquivosVueTs(abs))
    else if (/\.(vue|ts)$/.test(nome)) out.push(abs)
  }
  return out
}

/** Destinos de um CTA cujo rótulo visível é "Criar conta grátis". */
function destinosCriarConta(src: string): string[] {
  const plano = semComentarios(src).replace(/\s+/g, ' ')
  const found: string[] = []
  const res = [
    /label:\s*'Criar conta grátis'\s*,\s*to:\s*'([^']+)'/g,
    /to:\s*'([^']+)'\s*,\s*label:\s*'Criar conta grátis'/g,
    /<(?:NuxtLink|NuBotaoSeta|a)\b[^>]*\b:?to="([^"]+)"[^>]*>\s*Criar conta grátis\s*</g,
  ]
  for (const re of res) {
    for (const m of plano.matchAll(re)) found.push(m[1]!)
  }
  return found
}

const QUIZ = /^\/assinar\?quiz=1&de=([a-z0-9-]{1,24})$/

/** Texto visível que não é um link de página pública. */
const SEM_LINK = new Set([
  'app/pages/login.vue',
  'app/components/tese/TeseFecho.vue',
])

const DES_ESPERADOS = [
  'topo', 'topo-mobile', 'menu', 'preco-teto',
  'ranking', 'rankings', 'setor', 'setores', 'tesouro', 'tesouro-titulo',
  'calc-ir', 'juros', 'juros-cenario', 'planejamento', 'quanto-investir',
  'quanto-investir-cenario', 'calculadoras', 'calc-acoes', 'aposentadoria',
  'aposentadoria-cenario', 'dividend-yield', 'tese', 'briefing',
]

test('a pílula do celular abre o quiz sem crescer o header de 52px', () => {
  const header = ler('app/components/nu/NuHeader.vue')
  const tpl = header.slice(header.indexOf('<template>'), header.lastIndexOf('</template>'))
  assert.match(tpl, /<NuxtLink to="\/login" class="nuh__entrar">Entrar<\/NuxtLink>/)
  assert.match(tpl, /to="\/assinar\?quiz=1&de=topo" variante="carvao" tamanho="p" class="nuh__chamada">Criar conta grátis<\/NuBotaoSeta>/)
  assert.match(tpl, /<NuxtLink to="\/assinar\?quiz=1&de=topo-mobile" class="nuh__pill">Criar conta grátis<\/NuxtLink>/)
  assert.ok(tpl.indexOf('nuh__pill') > tpl.indexOf('nuh__chamada'))
  assert.ok(tpl.indexOf('nuh__pill') < tpl.indexOf('nuh__burger'))
  assert.match(header, /\.nuh__pill \{ display: none; \}/)
  assert.match(header, /\.nuh__pill \{[^}]*height: 32px[^}]*white-space: nowrap[^}]*\}/)
  assert.match(header, /\.nuh__pill \{[^}]*flex: none/)

  const blocos = [...header.matchAll(/@container topo \(max-width: 640px\) \{([\s\S]*?)\n\}/g)].map((m) => m[1]!)
  assert.equal(blocos.length, 2)
  assert.match(blocos[0]!, /\.nuh \{ height: 52px;/)
  assert.match(blocos[0]!, /\.nuh-wrap--shrunk \.nuh \{ height: 46px; \}/)
  assert.match(blocos[0]!, /\.nuh__entrar \{ display: none; \}/)
  assert.match(blocos[1]!, /\.nuh__chamada \{ display: none; \}/)
  assert.match(blocos[1]!, /\.nuh__pill \{ display: inline-flex; \}/)
  assert.doesNotMatch(blocos.join('\n'), /position:\s*(?:fixed|sticky)/)
  assert.equal('topo-mobile'.length <= 24, true)
})

test('todo "Criar conta grátis" de página pública abre o quiz, com de= de até 24 caracteres', () => {
  const vistos = new Map<string, string[]>()
  for (const abs of arquivosVueTs(join(RAIZ, 'app'))) {
    const rel = relative(RAIZ, abs).replaceAll('\\', '/')
    const src = readFileSync(abs, 'utf8')
    if (!semComentarios(src).includes('Criar conta grátis')) continue
    const destinos = destinosCriarConta(src)
    if (SEM_LINK.has(rel)) {
      assert.deepEqual(destinos, [], rel)
      continue
    }
    assert.ok(destinos.length > 0, rel)
    for (const destino of destinos) {
      const m = QUIZ.exec(destino)
      assert.ok(m, `${rel}: ${destino}`)
      const de = m[1]!
      assert.ok(de.length <= 24, de)
      const lista = vistos.get(de) ?? []
      lista.push(rel)
      vistos.set(de, lista)
    }
  }
  assert.deepEqual([...vistos.keys()].sort(), [...DES_ESPERADOS].sort())
  assert.deepEqual(vistos.get('topo'), ['app/components/nu/NuHeader.vue'])
  assert.deepEqual(vistos.get('topo-mobile'), ['app/components/nu/NuHeader.vue'])
  assert.deepEqual(vistos.get('menu'), ['app/components/nu/topo/NuTopoMenu.vue'])
  assert.deepEqual(vistos.get('preco-teto'), ['app/pages/calculadora/preco-teto/index.vue'])
  assert.equal(vistos.get('calc-ir')?.length, 2)
  assert.equal(vistos.get('dividend-yield')?.length, 2)
  assert.equal(vistos.get('quanto-investir-cenario')?.length, 1)
  assert.ok('quanto-investir-cenario'.length <= 24)
})

test('Entrar, Seguir e Criar alerta continuam no /login, e de=home segue no quiz', () => {
  const header = ler('app/components/nu/NuHeader.vue')
  const menu = ler('app/components/nu/topo/NuTopoMenu.vue')
  assert.match(header, /<NuxtLink to="\/login" class="nuh__entrar">Entrar<\/NuxtLink>/)
  assert.match(menu, /to="\/login" class="ntn__cta"[^>]*>Entrar<\/NuxtLink>/)
  assert.match(ler('app/components/home/HomeChamada.vue'), /to="\/assinar\?quiz=1&de=home"/)
  assert.match(ler('app/components/tese/TeseAtivos.vue'), /:to="loginTo"[^>]*>Já tenho conta/)
  assert.match(ler('app/components/nu/NuBriefingModal.vue'), /:to="loginTo"[^>]*>Já tenho conta/)
  const fecho = ler('app/components/tese/TeseFecho.vue')
  assert.match(fecho, /@click="emit\('acompanhar'\)"/)
  assert.match(fecho, /visitante \? 'Criar conta grátis'/)
  assert.doesNotMatch(semComentarios(fecho), /\/assinar\?quiz=1/)
  const seguir = ler('app/composables/useWatchlist.ts')
  assert.match(seguir, /seguir=1/)
  assert.match(seguir, /alerta: valor\.toFixed\(2\)/)
  assert.match(ler('app/composables/useThesisFollow.ts'), /\/login\?redirect=\$\{encodeURIComponent\(`\/tese\/\$\{s\}`\)\}/)
})
