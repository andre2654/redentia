/**
 * O widget do agregador da conexão (16/11/2026): a Malvo para as novas, a
 * Pluggy para as antigas; o connect-token diz qual, e o registro leva junto.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SCRIPT_DA_MALVO, agregadorDe } from '../app/utils/widget-open-finance.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('o agregador: malvo só quando o backend diz; o resto é Pluggy', () => {
  assert.equal(agregadorDe('malvo'), 'malvo')
  assert.equal(agregadorDe('pluggy'), 'pluggy')
  assert.equal(agregadorDe(undefined), 'pluggy')
  assert.equal(SCRIPT_DA_MALVO, 'https://malvo.io/widget.js')
})

test('os dois caminhos do site abrem pelo widget do agregador e registram com o provider', () => {
  for (const f of ['app/composables/usePluggyWidget.ts', 'app/composables/usePluggyConnect.ts']) {
    const s = ler(f)
    assert.match(s, /abrirWidgetOpenFinance\(/, f)
    assert.doesNotMatch(s, /new PluggyConnect\(/, f)
  }
  assert.match(ler('app/composables/usePluggyWidget.ts'), /registerConnection\(item\.id, provider\)/)
  assert.match(ler('app/composables/usePluggyConnect.ts'), /pluggyRegisterConnection\(base, authHeaders\(\), item\.id, provider\)/)
})
