/**
 * O llms.txt e o llms-full não podem esperar getSiteSections(): a fila
 * passa de um minuto e o crawler recebe corpo vazio. O inventário sai da
 * semente do sitemap, na origem da Aportou, sem caminho de B2B.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { contagemDaSemente, inventarioLlms } from '../server/utils/llms-inventario.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('a semente tem páginas e o inventário só cita aportou.com.br', () => {
  assert.ok(contagemDaSemente('ativos') > 100)
  assert.ok(contagemDaSemente('calculadoras') > 5)
  const texto = inventarioLlms('https://aportou.com.br')
  assert.match(texto, /https:\/\/aportou\.com\.br\/asset\/PETR4/)
  assert.match(texto, /https:\/\/aportou\.com\.br\/calculadora\/preco-teto/)
  assert.doesNotMatch(texto, /redentia\.com\.br/)
  assert.doesNotMatch(texto, /\/business|\/whitelabel|\/pricing/)
})

test('os dois arquivos não esperam a fila ao vivo e o curado não leva o B2B', () => {
  const curto = ler('server/routes/llms.txt.ts')
  const longo = ler('server/routes/llms-full.txt.ts')
  assert.doesNotMatch(curto, /await getSiteSections|ORIGEM_B2B|escrito por IA|WEALTH 2030/)
  assert.match(curto, /contagemDaSemente/)
  assert.match(curto, /\/graficos\/cdi\.png/)
  assert.doesNotMatch(longo, /getSiteSections/)
  assert.match(longo, /inventarioLlms/)
})
