/**
 * O dado de exemplo do design (o PETR4 de referência, a tese exemplar, as
 * manchetes de exemplo) nunca sai em produção: com a API fora, ele saía com
 * status 200 e cache público, com preço inventado sob o nome da B3 e notícia
 * falsa atribuída a veículo de verdade (auditoria de produção, 12/11/2026).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('o seed do design só entra no dev, nos quatro lugares em que existia', () => {
  assert.match(ler('app/composables/useAcao.ts'), /if \(ticker === 'PETR4' && import\.meta\.dev\) return petr4Seed\(\)/)
  assert.match(ler('app/composables/useDividendos.ts'), /if \(ticker === 'PETR4' && import\.meta\.dev\) return petr4Seed\(\)/)
  assert.match(ler('app/composables/useTese.ts'), /if \(slug === TESE_SEED_SLUG && import\.meta\.dev\) return teseSeed\(\)/)
  const n = ler('app/composables/useNoticias.ts')
  assert.match(n, /if \(!import\.meta\.dev\) throw createError\(\{ statusCode: 503/)
  assert.match(n, /data\.value \?\? \(import\.meta\.dev \? NOTICIAS_SEED : \[\]\)/)
  // nenhum outro caminho devolve o seed sem a condição do dev
  for (const [p, chamada] of [['app/composables/useAcao.ts', 'return petr4Seed()'], ['app/composables/useDividendos.ts', 'return petr4Seed()'], ['app/composables/useTese.ts', 'return teseSeed()']] as const) {
    const linhas = ler(p).split('\n').filter((l) => l.includes(chamada))
    assert.ok(linhas.length > 0 && linhas.every((l) => l.includes('import.meta.dev')), `${p}: ${chamada} sem import.meta.dev`)
  }
})
