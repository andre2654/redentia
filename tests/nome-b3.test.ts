/**
 * O nome da empresa no H1 do /asset (e no texto do /dividendos) sai do nome
 * bruto da B3. Até 20/10/2026, 50 ações tinham a classe grudada no nome:
 * "Itauunibancopn · ITUB4", "Raiadrogasilon · RADL3".
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { nomeDaEmpresa, nomeDoBdr } from '../app/utils/nomeB3.ts'

test('nome em colunas: tira classe e segmento', () => {
  assert.equal(nomeDaEmpresa('PETROBRAS   PN      N2'), 'Petrobras')
  assert.equal(nomeDaEmpresa('VALE        ON      NM'), 'Vale')
  // a forma jurídica não é o nome
  assert.equal(nomeDaEmpresa('AMBEV S/A   ON'), 'Ambev')
  assert.equal(nomeDaEmpresa('RUMO S.A.   ON      NM'), 'Rumo')
  assert.equal(nomeDaEmpresa('MOTIVA SA   ON      NM'), 'Motiva')
  assert.equal(nomeDaEmpresa('SUZANO S.A. ON  ATZ NM'), 'Suzano')
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
  // 13 letras sem classe no fim: só sai a forma jurídica
  assert.equal(nomeDaEmpresa('BRASILAGRO SA'), 'Brasilagro')
  assert.equal(nomeDaEmpresa('UNIPAR CARBOCLORO'), 'Unipar Carbocloro')
})

test('FII usa o trading_name', () => {
  assert.equal(nomeDaEmpresa('CSHG LOG    CI', 'CSHG LOGÍSTICA'), 'Cshg Logística')
})

test('nome que a coluna da B3 abrevia', () => {
  assert.equal(nomeDaEmpresa('BRASIL      ON      NM'), 'Banco do Brasil')
  assert.equal(nomeDaEmpresa('BTGP BANCO  UNT     N2'), 'BTG Pactual')
  assert.equal(nomeDaEmpresa('MAGAZ LUIZA ON      NM'), 'Magazine Luiza')
  assert.equal(nomeDaEmpresa('PETRORIO    ON      NM'), 'PRIO')
  assert.equal(nomeDaEmpresa('WEG         ON  EJ  NM'), 'WEG')
  // balcão, sem classe na coluna: a sigla não vira "Mrs" (cadeia de fornecimento)
  assert.equal(nomeDaEmpresa('MRS LOGÍSTICA'), 'MRS Logística')
})

test('BDR: a classe DRN sai, grudada ou não', () => {
  assert.equal(nomeDaEmpresa('PALANTIRTECHDRN'), 'Palantirtech')
  assert.equal(nomeDaEmpresa('WALT DISNEY DRN'), 'Walt Disney')
  assert.equal(nomeDaEmpresa('MICRON TECHNDRN ED'), 'Micron Techn')
  assert.equal(nomeDaEmpresa('EVERTEC INC DR1'), 'Evertec Inc')
  assert.equal(nomeDaEmpresa('APPLE       DRN'), 'Apple')
})

test('BDR: o nome inteiro da matriz, sem recibo nem forma jurídica', () => {
  assert.equal(nomeDoBdr('Palantir Technologies Inc. Shs -A-'), 'Palantir Technologies')
  assert.equal(nomeDoBdr('Alphabet Inc Shs A Unsponsored Brazilian Depository Receipt Repr 0.08333 Sh -'), 'Alphabet')
  assert.equal(nomeDoBdr('Berkshire Hathaway Inc. B Unsponsored Brazilian Depository Receipt Repr 0.05 Sh B'), 'Berkshire Hathaway')
  assert.equal(nomeDoBdr('Taiwan Semiconductor Manufacturing Co., Ltd. ADR Unsponsored Brazilian Depository Receipt Repr 0.125 ADR'), 'Taiwan Semiconductor Manufacturing Co.')
  assert.equal(nomeDoBdr('ASML Holding NV ADR Unsponsored Brazilian Depository Receipt Repr 0.018181818 AD'), 'ASML Holding')
  assert.equal(nomeDoBdr('Novo Nordisk A/S ADR B'), 'Novo Nordisk')
  assert.equal(nomeDoBdr('MercadoLibre, Inc.'), 'MercadoLibre')
  assert.equal(nomeDoBdr('JBS N.V.'), 'JBS')
  // 'Co' e 'Company' são parte do nome
  assert.equal(nomeDoBdr('Wells Fargo & Company'), 'Wells Fargo & Company')
  assert.equal(nomeDoBdr('Merck & Co., Inc.'), 'Merck & Co.')
  assert.equal(nomeDoBdr(null), null)
  assert.equal(nomeDoBdr('  '), null)
})
