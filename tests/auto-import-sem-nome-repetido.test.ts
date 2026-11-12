/**
 * Dois utils (ou composables) exportando o mesmo nome: o auto-import do Nuxt
 * pega só um, sem erro, e quem chamava sem import recebe a função do outro.
 * Em 12/11/2026 as calculadoras mostraram "R$ 11.390 mil" porque o brlCurto da
 * carteira venceu o delas. Nome repetido só com import explícito em todo uso,
 * e na lista abaixo.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const raiz = new URL('../', import.meta.url).pathname
// os que todos importam com caminho explícito (CarteiraAgora, CarteiraCadeiaMatriz e os testes)
const CONHECIDOS = new Set(['fraseDaCarteira'])

function arquivos(dir: string): string[] {
  return readdirSync(join(raiz, dir)).flatMap((n) => {
    const p = join(dir, n)
    return statSync(join(raiz, p)).isDirectory() ? arquivos(p) : p.endsWith('.ts') ? [p] : []
  })
}

test('nenhum nome exportado por dois utils ou composables (o auto-import pegaria só um)', () => {
  const donos = new Map<string, string[]>()
  for (const p of [...arquivos('app/utils'), ...arquivos('app/composables'), ...arquivos('shared/utils')]) {
    for (const m of readFileSync(join(raiz, p), 'utf8').matchAll(/^export (?:async )?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm)) {
      donos.set(m[1]!, [...(donos.get(m[1]!) ?? []), p])
    }
  }
  const repetidos = [...donos].filter(([n, ps]) => ps.length > 1 && !CONHECIDOS.has(n)).map(([n, ps]) => `${n}: ${ps.join(', ')}`)
  assert.deepEqual(repetidos, [])
})
