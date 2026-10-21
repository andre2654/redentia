/**
 * O nome da empresa no H1 do /asset (e no texto do /dividendos) sai do nome
 * bruto da B3. Até 20/10/2026, 50 ações tinham a classe grudada no nome:
 * "Itauunibancopn · ITUB4", "Raiadrogasilon · RADL3".
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { nomeDaEmpresa } from '../app/utils/nomeB3.ts'

test('nome em colunas: tira classe e segmento', () => {
  assert.equal(nomeDaEmpresa('PETROBRAS   PN      N2'), 'Petrobras')
  assert.equal(nomeDaEmpresa('VALE        ON      NM'), 'Vale')
  assert.equal(nomeDaEmpresa('AMBEV S/A   ON'), 'Ambev S/a')
})

test('classe grudada no campo de 12 caracteres', () => {
  assert.equal(nomeDaEmpresa('ITAUUNIBANCOPN  EJ  N1'), 'Itaú Unibanco')
  assert.equal(nomeDaEmpresa('RAIADROGASILON      NM'), 'Raia Drogasil')
  assert.equal(nomeDaEmpresa('TELEF BRASILON'), 'Telefônica Brasil')
  assert.equal(nomeDaEmpresa('SANTANDER BRUNT'), 'Santander Brasil')
  assert.equal(nomeDaEmpresa('KEPLER WEBERON      NM'), 'Kepler Weber')
  // sem nome conhecido: o corte no 12º já tira a classe
  assert.equal(nomeDaEmpresa('NOVA EMPRESAON      NM'), 'Nova Empresa')
})

test('nome de verdade não é cortado', () => {
  assert.equal(nomeDaEmpresa('Axia Energia'), 'Axia Energia')
  assert.equal(nomeDaEmpresa('EMBRAER'), 'Embraer')
  // 13 letras sem classe no fim: fica inteiro
  assert.equal(nomeDaEmpresa('BRASILAGRO SA'), 'Brasilagro Sa')
})

test('FII usa o trading_name', () => {
  assert.equal(nomeDaEmpresa('CSHG LOG    CI', 'CSHG LOGÍSTICA'), 'Cshg Logística')
})
