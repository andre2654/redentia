/**
 * Calculadora de IR sobre ações (/calculadora/imposto-renda), revisão de
 * 15/10/2026 para o Benchmark de IA. Cada caso trava um erro que estava no ar:
 * isenção com `<` em vez de `<=`, DARF vencendo em fim de semana, código 8523
 * para day trade e "dividendos isentos" sem a Lei 15.270/2025.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { calcularIrAcoes, diasSemExpedienteBancario, vencimentoDarf } from '../app/utils/ir-acoes.ts'

const ler = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')

test('vendas de exatamente R$ 20.000 no swing trade são isentas (Lei 11.033, art. 3º, I)', () => {
  // O cenário "Isenção exata R$ 20 mil" da página: ?type=swing&sales=20000&profit=2000
  const r = calcularIrAcoes({ tipo: 'swing', vendas: 20000, lucro: 2000, prejuizoAcumulado: 0 })
  assert.equal(r.exempt, true)
  assert.equal(r.taxDue, 0)
  const acima = calcularIrAcoes({ tipo: 'swing', vendas: 20000.01, lucro: 2000, prejuizoAcumulado: 0 })
  assert.equal(acima.exempt, false)
  assert.equal(acima.taxDue, 300)
})

test('day trade não tem isenção e usa o mesmo DARF 6015 do swing', () => {
  const day = calcularIrAcoes({ tipo: 'day', vendas: 10000, lucro: 5000, prejuizoAcumulado: 0 })
  assert.equal(day.exempt, false)
  assert.equal(day.taxDue, 1000)
  assert.equal(day.darfCode, '6015')
  assert.equal(calcularIrAcoes({ tipo: 'swing', vendas: 25000, lucro: 3000, prejuizoAcumulado: 0 }).darfCode, '6015')
})

test('compensação de prejuízo no swing segue igual', () => {
  const r = calcularIrAcoes({ tipo: 'swing', vendas: 30000, lucro: 2000, prejuizoAcumulado: 1000 })
  assert.equal(r.compensatedLoss, 1000)
  assert.equal(r.taxDue, 150)
  assert.equal(r.newAccumulatedLoss, 0)
})

test('DARF vence no último dia útil do mês seguinte e antecipa quando o fim do mês não é útil', () => {
  // Conferidos na Agenda Tributária da Receita.
  assert.equal(vencimentoDarf('2025-04'), '2025-05-30') // 31/05/2025 era sábado
  assert.equal(vencimentoDarf('2025-11'), '2025-12-30') // 31/12 sem expediente bancário
  assert.equal(vencimentoDarf('2022-01'), '2022-02-25') // 28/02/2022 era segunda de Carnaval
  // Os quatro fins de mês de 2026 em fim de semana (DEEP-RESEARCH §8.2).
  assert.equal(vencimentoDarf('2025-12'), '2026-01-30') // 31/01/2026, sábado
  assert.equal(vencimentoDarf('2026-01'), '2026-02-27') // 28/02/2026, sábado
  assert.equal(vencimentoDarf('2026-04'), '2026-05-29') // 31/05/2026, domingo
  assert.equal(vencimentoDarf('2026-09'), '2026-10-30') // 31/10/2026, sábado
  assert.equal(vencimentoDarf('2026-11'), '2026-12-30')
  // Fim de mês em dia útil não muda.
  assert.equal(vencimentoDarf('2026-08'), '2026-09-30')
  assert.equal(vencimentoDarf('2026-12'), '2027-01-29') // 31/01/2027, domingo
  assert.equal(vencimentoDarf('2026-13'), null)
  assert.equal(vencimentoDarf(''), null)
})

test('feriados bancários de 2026 batem com o calendário oficial da B3, menos 24/12', () => {
  // SEM_PREGAO_B3 (useSeguirGancho.ts, Ofício Circular 003/2026-VNC). Em 24/12
  // não há pregão, mas há expediente bancário. 15/11/2026 cai num domingo e
  // não está na lista da B3.
  const b3 = ['2026-01-01', '2026-02-16', '2026-02-17', '2026-04-03', '2026-04-21', '2026-05-01', '2026-06-04',
    '2026-09-07', '2026-10-12', '2026-11-02', '2026-11-20', '2026-12-25', '2026-12-31']
  const banco = [...diasSemExpedienteBancario(2026)].filter((d) => d !== '2026-11-15').sort()
  assert.deepEqual(banco, b3)
})

test('copy: 8523 não volta como código de day trade, e o PL 1.087 não aparece como pendente', () => {
  for (const f of ['app/pages/calculadora/imposto-renda.vue', 'app/pages/metodologia.vue', 'server/utils/site-pages.ts', 'server/routes/llms.txt.ts'])
    assert.doesNotMatch(ler(f), /8523/, f)
  const ir = ler('app/pages/calculadora/imposto-renda.vue')
  assert.doesNotMatch(ir, /PL 1\.087/)
  assert.doesNotMatch(ir, /Dividendos são isentos/)
  assert.match(ir, /Lei 15\.270\/2025/)
  assert.match(ler('app/pages/metodologia.vue'), /Lei 15\.270\/2025/)
})

test('copy: o /dividendos/{TICKER} segue a Lei 15.270, o JCP a 17,5% e os 100 cotistas do FII', () => {
  const div = ler('app/composables/useDividendos.ts')
  assert.doesNotMatch(div, /PL 1\.087/)
  assert.doesNotMatch(div, /15% (de IR )?retidos?/)
  assert.doesNotMatch(div, /50 (ou mais )?cotistas/)
  assert.doesNotMatch(div, /sem limite de valor/)
  assert.match(div, /Lei 15\.270\/2025/)
  assert.match(div, /17,5% retidos na fonte/)
  assert.match(div, /100 cotistas/)
})

test('copy: glossário, ranking de DY e calculadoras seguem a Lei 15.270, o JCP a 17,5% e os 100 cotistas', () => {
  // as duas calculadoras do cluster de dividendos (acoes, dividend-yield)
  // ficam de fora até o fim da medição; o preço-teto, por veto do dono
  for (const f of [
    'app/content/rankings/copy/maiores-dividend-yield.ts',
    'app/content/glossario/grupo-1.ts',
    'app/content/glossario/grupo-2.ts',
    'app/content/glossario/grupo-4.ts',
    'app/pages/calculadora/juros-compostos/index.vue',
    'app/pages/calculadora/imposto-renda.vue',
  ]) {
    const t = ler(f)
    assert.doesNotMatch(t, /PL 1\.087/, f)
    assert.doesNotMatch(t, /15% (de IR )?retid/, f)
    assert.doesNotMatch(t, /\b50\+? (ou mais )?cotistas/, f)
    assert.doesNotMatch(t, /[Aa]tualmente (são )?(ISENTOS|isentos)/, f)
  }
  assert.match(ler('app/content/glossario/grupo-2.ts'), /17,5% de IR retido na fonte/)
  assert.match(ler('app/content/rankings/copy/maiores-dividend-yield.ts'), /Lei 15\.270\/2025/)
  // onde o erro era "isento" sem limite, o limite tem de estar escrito
  for (const f of ['app/content/glossario/grupo-1.ts', 'app/content/glossario/grupo-4.ts', 'app/pages/calculadora/juros-compostos/index.vue'])
    assert.match(ler(f), /até R\$ 50 mil por mês/, f)
})
