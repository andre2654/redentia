/**
 * A cadeia de fornecimento lida por empresa (?cadeia=1|2|3, 03/11/2026). Os
 * números são os da PETR4 em 03/11/2026 (GET /assets/PETR4/supply-chain).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contextoDaCadeia, empresasDaCadeia, fonteDaLigacao, frasesDaCobertura, relacaoDaLigacao, restoDaCadeia, valorDaLigacao } from '../app/utils/cadeiaLeitura.ts'
import type { AcaoCadeiaItemVM, AcaoCadeiaVM } from '../app/types/acao.ts'

function item(ticker: string, nome: string, oQue: string | null, valor: string | null, quando: string | null, vende: boolean, resto = false): AcaoCadeiaItemVM {
  return {
    ticker, resto, peso: null, nome, oQue, valor, valorQuando: quando,
    detalhe: {
      titulo: vende ? `Petrobras vende para ${nome}` : `Petrobras compra de ${nome}`,
      de: vende ? 'Petrobras' : nome, para: vende ? nome : 'Petrobras', oQue, valores: [], conta: null, nota: null, fonteConta: null,
      provas: resto ? [] : [{ fonte: 'Relatório anual na SEC (20-F)', data: '09/04/2026', por: null, valor: null, trecho: '…', emIngles: true, url: 'https://sec.gov/x' }],
    },
  }
}

const PETR4: AcaoCadeiaVM = {
  compraDe: [
    item('BRKM5', 'Braskem', 'produtos petroquímicos', 'R$ 150,0 mi', 'em 2025', false),
    item('VBBR3', 'Vibra', 'produtos para plataformas', null, null, false),
    item('resto-custo', 'Restante do custo', 'fora da bolsa e custos próprios · 99,9% do custo', 'R$ 260,4 bi', 'em 2025', false, true),
  ],
  vendePara: [
    item('BRKM5', 'Braskem', 'nafta, etano, propano', 'R$ 16,2 bi', 'em 2025', true),
    item('VBBR3', 'Vibra', 'derivados de petróleo', 'R$ 218,0 mi', 'em contratos', true),
    item('VALE3', 'Vale', 'diesel, diesel renovável', null, null, true),
    item('resto-clientes', 'Outros clientes', 'fora da bolsa · 96,8% da receita', 'R$ 481,4 bi', 'em 2025', true, true),
  ],
  fontes: 'relatórios anuais na SEC e demonstrações financeiras',
  cobertura: {
    ano: 2025, fonte: 'DFP consolidada (CVM)', url: 'https://dados.cvm.gov.br',
    receita: { total: 'R$ 497,5 bi', conhecido: 'R$ 16,2 bi', pct: '3,2%', pctN: 3.2, semValor: 5 },
    custo: { total: 'R$ 260,6 bi', conhecido: 'R$ 150,0 mi', pct: 'menos de 0,1%', pctN: 0.06, semValor: 1 },
  },
}

test('a mesma empresa nas duas pontas vira uma entrada só, marcada como as duas', () => {
  const e = empresasDaCadeia(PETR4)
  assert.deepEqual(e.map((x) => `${x.ticker}:${x.papel}`), ['BRKM5:ambas', 'VBBR3:ambas', 'VALE3:cliente'])
  assert.equal(e[1]!.compra?.oQue, 'produtos para plataformas')
  assert.equal(e[1]!.venda?.valor, 'R$ 218,0 mi')
  // os nós de resto não são empresa
  assert.ok(!e.some((x) => x.ticker.startsWith('resto')))
  assert.equal(restoDaCadeia(PETR4).custo?.titulo, 'Petrobras compra de Restante do custo')
})

test('valor ausente fica calado (null), nunca "Indisponível"; a fonte vem com o ano', () => {
  const [braskem, vibra] = empresasDaCadeia(PETR4)
  assert.equal(valorDaLigacao(braskem!.venda), 'R$ 16,2 bi em 2025')
  assert.equal(valorDaLigacao(vibra!.compra), null)
  assert.equal(fonteDaLigacao(vibra!.compra), 'Relatório anual na SEC (20-F), 2026')
  assert.equal(relacaoDaLigacao(vibra!.venda!), 'Petrobras vende para Vibra: derivados de petróleo · R$ 218,0 mi em contratos')
  assert.doesNotMatch(contextoDaCadeia(PETR4, 'Petrobras'), /Indispon/)
})

test('o restante dito em frase: o que conhecemos é uma fração', () => {
  const [vendas, custo] = frasesDaCobertura(PETR4.cobertura, 'Petrobras')
  assert.match(vendas!, /^Das vendas da Petrobras em 2025 \(R\$ 497,5 bi\), R\$ 16,2 bi têm cliente listado com valor: 3,2%\./)
  assert.match(vendas!, /5 ligações não têm valor anual comparável/)
  assert.match(custo!, /R\$ 150,0 mi têm fornecedor listado com valor: menos de 0,1%\./)
  assert.deepEqual(frasesDaCobertura(null, 'X'), [])
  // VALE3: a MRS informa em dólar, então nada entra na conta em reais; sem "R$ 0,00"
  const vale = frasesDaCobertura({ ano: 2025, fonte: 'DFP', url: '', receita: null, custo: { total: 'R$ 138,9 bi', conhecido: 'R$ 0,00', pct: '0%', pctN: 0, semValor: 2 } }, 'Vale')
  assert.deepEqual(vale, ['O custo dos produtos vendidos em 2025 foi R$ 138,9 bi. Nenhuma ligação com fornecedor listado tem valor anual em reais de 2025: as 2 que existem ficam de fora da conta.'])
})
