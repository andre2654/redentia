/**
 * H2s de /dividendos/{TICKER}: data com, pagamento, valor, último, JCP 2026,
 * anunciados de 2027 e dividend yield. Número só quando a linha existe.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { NOTA_CVM } from '../app/utils/agendaDividendos.ts'
import {
  ANO_JCP,
  ANO_SEGUINTE,
  TEXTO_ALIQUOTA_JCP,
  montarBlocosDividendos,
  type EntradaBlocosDividendos,
} from '../app/utils/dividendosBlocos.ts'
import type { ProventoRow } from '../app/utils/proventos.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

function base(over: Partial<EntradaBlocosDividendos> = {}): EntradaBlocosDividendos {
  return {
    ticker: 'PETR4',
    isFii: false,
    isBdr: false,
    rows: [],
    dy: null,
    dyBasis: null,
    dyMatchesSum: false,
    price: null,
    priceDate: null,
    hoje: '2026-11-20',
    ...over,
  }
}

function linha(over: Partial<ProventoRow> & Pick<ProventoRow, 'date' | 'rate' | 'label'>): ProventoRow {
  return {
    hasExDate: true,
    payDate: over.date,
    income: true,
    ...over,
  }
}

const rico: ProventoRow[] = [
  linha({ date: '2026-11-30', payDate: '2026-12-15', rate: 0.5, label: 'JCP' }),
  linha({ date: '2026-08-10', payDate: '2026-08-20', rate: 1.25, label: 'Dividendo' }),
  linha({ date: '2027-02-01', payDate: '2027-02-20', rate: 0.8, label: 'Dividendo' }),
  linha({ date: '2026-03-01', payDate: '2026-03-15', rate: 0.3, label: 'Amortização', income: false }),
]

function bloco(id: string, pack = montarBlocosDividendos(base({
  rows: rico,
  dy: 4.5,
  dyBasis: 'oficial',
  dyMatchesSum: true,
  price: 27.78,
  priceDate: '2026-11-19',
}))) {
  const b = pack.blocos.find((x) => x.id === id)
  assert.ok(b, id)
  return b
}

test('os H2s saem dos avisos, com fonte, sem página nova de DY', () => {
  const pack = montarBlocosDividendos(base({
    rows: rico,
    dy: 4.5,
    dyBasis: 'oficial',
    dyMatchesSum: true,
    price: 27.78,
    priceDate: '2026-11-19',
  }))
  assert.deepEqual(pack.blocos.map((b) => b.h2), [
    'Data com PETR4',
    'Quando PETR4 paga dividendos',
    'Quanto PETR4 paga por ação',
    'Último dividendo de PETR4',
    `JCP PETR4 ${ANO_JCP}`,
    `Dividendos PETR4 ${ANO_SEGUINTE}`,
    'Dividend yield de PETR4',
  ])
  assert.equal(pack.notaCvm, NOTA_CVM)
  assert.match(pack.notaCvm, /Não é recomendação de compra ou venda/)

  const dataCom = bloco('data-com', pack)
  assert.equal(dataCom.linhas[0]!.valor, '30 nov 2026')
  assert.equal(dataCom.linhas.find((l) => l.rotulo.startsWith('JCP'))!.valor, 'R$ 0,50')
  assert.match(dataCom.fonte, /avisos de proventos da B3/)
  assert.doesNotMatch(dataCom.fonte, /1º de abril de 2026/)

  const quando = bloco('pagamento', pack)
  assert.equal(quando.linhas.find((l) => l.rotulo === 'Próximo pagamento')!.valor, '15 dez 2026')
  assert.equal(quando.linhas.find((l) => l.rotulo === 'Último pagamento')!.valor, '20 ago 2026')

  const valor = bloco('valor', pack)
  assert.equal(valor.linhas.find((l) => l.rotulo.startsWith('Renda'))!.valor, 'R$ 1,25')
  assert.equal(valor.linhas.find((l) => l.rotulo.startsWith('Amortização'))!.valor, 'R$ 0,30')
  assert.match(valor.paragrafos.join(' '), /fora do dividend yield/)

  const ultimo = bloco('ultimo', pack)
  assert.match(ultimo.paragrafos.join(' '), /R\$ 1,25/)
  assert.match(ultimo.paragrafos.join(' '), /20 ago 2026/)
  assert.doesNotMatch(ultimo.paragrafos.join(' '), /R\$ 0,5000/)

  const jcp = bloco('jcp-2026', pack)
  assert.match(jcp.linhas.map((l) => `${l.rotulo} ${l.valor}`).join(' '), /15 dez 2026/)
  assert.match(jcp.linhas.map((l) => l.valor).join(' '), /R\$ 0,50/)
  assert.match(jcp.paragrafos.join(' '), new RegExp(TEXTO_ALIQUOTA_JCP.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(jcp.paragrafos.join(' '), /art\. 8º da Lei Complementar 224\/2025/)
  assert.match(jcp.paragrafos.join(' '), /1º de janeiro de 2026/)
  assert.match(jcp.paragrafos.join(' '), /não está descontada/)
  assert.doesNotMatch(jcp.paragrafos.join(' '), /R\$ 0,4125|R\$ 0,8250/)

  const ano = bloco('ano-2027', pack)
  assert.match(ano.linhas.map((l) => `${l.rotulo} ${l.valor}`).join(' '), /20 fev 2027/)
  assert.match(ano.linhas.map((l) => l.valor).join(' '), /R\$ 0,80/)
  assert.match(ano.paragrafos.join(' '), /pode ser atualizado/)

  const dy = bloco('dy', pack)
  assert.equal(dy.linhas[0]!.valor, '4,50%')
  assert.match(dy.paragrafos.join(' '), /Não é promessa de pagamento futuro/)
  assert.match(dy.fonte, /overview do ativo/)
  assert.match(dy.fonte, /Brapi \(B3\), pregão de 19 nov 2026/)

  for (const b of pack.blocos) {
    assert.ok(b.fonte.length > 0, b.id)
    const texto = `${b.paragrafos.join(' ')} ${b.linhas.map((l) => l.valor).join(' ')}`
    if (/R\$/.test(texto) || (/%/.test(texto) && !texto.includes('17,5%'))) {
      assert.match(b.fonte, /avisos de proventos da B3|overview do ativo|Brapi/, b.id)
    }
  }

  assert.ok(pack.faq.some((f) => f.q === 'Qual a data com de PETR4?'))
  assert.ok(pack.faq.some((f) => f.q === `Qual o JCP de PETR4 em ${ANO_JCP}?`))
  assert.ok(pack.faq.some((f) => f.q === `Quais os dividendos de PETR4 em ${ANO_SEGUINTE}?`))
  assert.doesNotMatch(JSON.stringify(pack), /Lei 15\.270\/2025 art\. 6º-A|Lei 15\.270\/2025, art\. 6º-A/)
  assert.doesNotMatch(JSON.stringify(pack), /recomendamos|garantid|compre agora|melhor investimento/i)
})

test('API vazia não inventa data, valor ou yield, e o JCP 2026 fica no estado honesto', () => {
  const pack = montarBlocosDividendos(base())
  assert.deepEqual(pack.blocos.map((b) => b.id), ['data-com', 'pagamento', 'valor', 'ultimo', 'jcp-2026', 'dy'])
  assert.equal(pack.blocos.find((b) => b.id === 'ano-2027'), undefined)
  const texto = JSON.stringify(pack.blocos)
  assert.doesNotMatch(texto, /R\$/)
  assert.deepEqual(texto.match(/\d{1,2} (jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez) \d{4}/g), [
    '20 nov 2026', '20 nov 2026', '20 nov 2026', '20 nov 2026', '20 nov 2026',
  ])
  assert.deepEqual(texto.match(/\d[\d.]*,\d+\s*%/g), ['17,5%'])
  assert.match(pack.blocos.find((b) => b.id === 'data-com')!.paragrafos.join(' '), /não traz data com|Nenhum aviso/i)
  assert.match(pack.blocos.find((b) => b.id === 'dy')!.paragrafos.join(' '), /indisponível/)
  assert.match(pack.blocos.find((b) => b.id === 'jcp-2026')!.paragrafos.join(' '), /Não há JCP de PETR4/)
  assert.equal(pack.notaCvm, NOTA_CVM)
})

test('histórico indisponível não vira ausência e não fabrica o próximo pagamento', () => {
  const vazio = montarBlocosDividendos(base({ rows: null, dy: null }))
  assert.deepEqual(vazio.blocos, [])
  assert.equal(vazio.faq.length, 0)
  assert.match(vazio.notaCvm, /Não é recomendação de compra ou venda/)
  assert.doesNotMatch(JSON.stringify(vazio), /R\$|30 nov|não há|Não há/)

  const soDy = montarBlocosDividendos(base({ rows: null, dy: 6.95, dyBasis: 'oficial' }))
  assert.deepEqual(soDy.blocos.map((b) => b.id), ['dy'])
  assert.equal(soDy.blocos[0]!.linhas[0]!.valor, '6,95%')
  assert.doesNotMatch(JSON.stringify(soDy.blocos), /R\$/)
  assert.doesNotMatch(soDy.blocos[0]!.fonte, /avisos de proventos da B3/)
  assert.match(soDy.blocos[0]!.paragrafos.join(' '), /Não é promessa de pagamento futuro/)
})

test('data com já passada continua no passado quando o pagamento ainda vai ocorrer', () => {
  const pack = montarBlocosDividendos(base({
    rows: [linha({ date: '2026-08-21', payDate: '2026-11-23', rate: 0.67, label: 'JCP' })],
  }))
  const dataCom = pack.blocos.find((b) => b.id === 'data-com')!
  assert.match(dataCom.paragrafos.join(' '), /21 ago 2026/)
  assert.match(dataCom.paragrafos.join(' '), /já passou/)
  assert.doesNotMatch(dataCom.paragrafos.join(' '), /A próxima data com/)
  const quando = pack.blocos.find((b) => b.id === 'pagamento')!
  assert.equal(quando.linhas.find((l) => l.rotulo === 'Próximo pagamento')!.valor, '23 nov 2026')
  assert.match(quando.linhas.map((l) => l.valor).join(' '), /R\$ 0,67/)
})

test('pagamento a definir não ganha uma data', () => {
  const pack = montarBlocosDividendos(base({
    rows: [linha({ date: '2026-11-01', payDate: '', rate: 2, label: 'Dividendo' })],
  }))
  const dataCom = pack.blocos.find((b) => b.id === 'data-com')!
  assert.equal(dataCom.linhas.find((l) => l.rotulo === 'Pagamento')!.valor, 'A definir')
  assert.match(dataCom.paragrafos.join(' '), /1 nov 2026/)
  assert.doesNotMatch(dataCom.paragrafos.join(' '), /dez 2026|jan 2027/)
  const quando = pack.blocos.find((b) => b.id === 'pagamento')!
  assert.equal(quando.linhas.find((l) => l.rotulo === 'Próximo pagamento')!.valor, 'A definir')
  assert.equal(pack.blocos.find((b) => b.id === 'ano-2027'), undefined)
  assert.equal(pack.blocos.find((b) => b.id === 'ultimo')!.linhas.length, 0)
})

test('FII fala em cota e rendimento, e não ganha bloco de JCP', () => {
  const pack = montarBlocosDividendos(base({
    ticker: 'MXRF11',
    isFii: true,
    rows: [
      linha({ date: '2026-11-28', payDate: '2026-12-10', rate: 0.11, label: 'Rendimento' }),
      linha({ date: '2027-01-15', payDate: '2027-01-20', rate: 0.12, label: 'Rendimento' }),
    ],
    dy: 11.2,
    dyBasis: 'oficial',
  }))
  assert.equal(pack.blocos.find((b) => b.id === 'jcp-2026'), undefined)
  assert.ok(pack.blocos.some((b) => b.h2 === 'Quando MXRF11 paga rendimentos'))
  assert.ok(pack.blocos.some((b) => b.h2 === 'Quanto MXRF11 paga por cota'))
  assert.ok(pack.blocos.some((b) => b.h2 === `Rendimentos MXRF11 ${ANO_SEGUINTE}`))
  assert.match(JSON.stringify(pack.blocos), /R\$ 0,11/)
  assert.match(JSON.stringify(pack.blocos), /R\$ 0,12/)
  assert.doesNotMatch(JSON.stringify(pack), /JCP MXRF11|por ação/)
})

test('BDR não ganha bloco de JCP', () => {
  const pack = montarBlocosDividendos(base({
    ticker: 'AAPL34',
    isBdr: true,
    rows: [linha({ date: '2026-08-01', payDate: '2026-08-15', rate: 0.4, label: 'Dividendo' })],
    dy: 0.8,
    dyBasis: 'oficial',
  }))
  assert.equal(pack.blocos.find((b) => b.id === 'jcp-2026'), undefined)
  assert.ok(pack.blocos.some((b) => b.h2 === 'Quanto AAPL34 paga por BDR'))
  assert.equal(pack.blocos.find((b) => b.id === 'ano-2027'), undefined)
})

test('a página renderiza os H2s, o aviso da CVM e não abre URL nova de DY', () => {
  const vue = ler('app/pages/dividendos/[ticker].vue')
  const comp = ler('app/composables/useDividendos.ts')
  assert.match(vue, /<h2 :id="`bloco-\$\{b\.id\}`" class="dvt__bloco-h2">\{\{ b\.h2 \}\}<\/h2>/)
  assert.match(vue, /Dúvidas sobre os \{\{ div\.isFii \? 'rendimentos' : 'dividendos' \}\} de \{\{ ticker \}\}/)
  assert.match(vue, /\{\{ div\.notaCvm \}\}/)
  assert.match(vue, /to="\/dividendos\/agenda"/)
  assert.doesNotMatch(vue, /\/calculadora\/dividend-yield\/\$\{/)
  assert.doesNotMatch(vue, /\/calculadora\/dividend-yield\/\{\{/)
  assert.match(comp, /17,5% retidos na fonte/)
  assert.match(comp, /art\. 8º da Lei Complementar 224\/2025/)
  assert.match(comp, /Lei 15\.270\/2025/)
  assert.doesNotMatch(comp, /Lei 15\.270\/2025 art\. 6º-A/)
  assert.doesNotMatch(vue, /#148f4e|#d6323b|#2f6aff/i)
})
