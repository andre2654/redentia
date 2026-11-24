/**
 * Próximos pagamentos e outras empresas do setor em /dividendos/{TICKER}.
 * Número só da base. Pares pelo volume do cadastro, nunca por DY.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PRECO_TETO_FICHA } from '../server/data/preco-teto-lotes.ts'
import {
  PARES_SEGMENTO_MAX,
  hrefSetorSeRota,
  montarParesSegmento,
  montarProximosPagamentos,
  type FichaSegmento,
} from '../app/utils/dividendosExtras.ts'
import type { ProventoRow } from '../app/utils/proventos.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

function linha(over: Partial<ProventoRow> & Pick<ProventoRow, 'date' | 'rate' | 'label'>): ProventoRow {
  return {
    hasExDate: true,
    payDate: over.date,
    income: true,
    ...over,
  }
}

test('avisos futuros saem da base, com fonte B3 e a data da consulta', () => {
  const bloco = montarProximosPagamentos({
    hoje: '2026-11-24',
    unidade: 'ação',
    rows: [
      linha({ date: '2026-08-21', payDate: '2026-12-21', rate: 0.674071, label: 'Dividendo + JCP' }),
      linha({ date: '2026-11-24', payDate: '2026-12-01', rate: 0.1, label: 'JCP' }),
      linha({ date: '2026-11-01', payDate: '2026-11-24', rate: 0.2, label: 'Dividendo' }),
      linha({ date: '2026-03-01', payDate: '2026-03-15', rate: 1, label: 'Dividendo' }),
      linha({ date: '2026-12-02', payDate: '', rate: 0.3, label: 'JCP', hasExDate: true }),
    ],
  })
  assert.deepEqual(bloco.itens.map((i) => i.pagamento), ['1 dez 2026', '21 dez 2026', 'A definir'])
  assert.equal(bloco.itens[0]!.dataCom, '24 nov 2026')
  assert.equal(bloco.itens[1]!.valor, 'R$ 0,6741 por ação')
  assert.equal(bloco.itens[1]!.tipo, 'Dividendo + JCP')
  assert.equal(bloco.vazio, null)
  assert.equal(bloco.indisponivel, false)
  assert.match(bloco.fonte, /avisos de proventos da B3, consultados em 24 nov 2026/)
  assert.equal(bloco.agenda, '/dividendos/agenda')
  assert.doesNotMatch(JSON.stringify(bloco), /recomend|mais pagam|garantid/i)
})

test('sem data futura a frase é neutra e traz o dia da consulta', () => {
  const bloco = montarProximosPagamentos({
    hoje: '2026-11-24',
    unidade: 'cota',
    rows: [linha({ date: '2026-11-06', payDate: '2026-11-14', rate: 0.1, label: 'Rendimento' })],
  })
  assert.deepEqual(bloco.itens, [])
  assert.equal(bloco.vazio, 'Sem aviso de pagamento futuro em 24 nov 2026.')
  assert.match(bloco.fonte, /B3/)
  assert.match(bloco.fonte, /24 nov 2026/)
  assert.doesNotMatch(bloco.vazio, /R\$|%/)
})

test('base fora do ar não vira "sem aviso"', () => {
  const bloco = montarProximosPagamentos({ hoje: '2026-11-24', unidade: 'ação', rows: null })
  assert.equal(bloco.vazio, null)
  assert.equal(bloco.indisponivel, true)
  assert.equal(bloco.itens.length, 0)
  assert.match(bloco.fonte, /não puderam ser lidos/)
})

test('pares do segmento seguem o volume, uma classe por empresa, no máximo 8', () => {
  const ficha: Record<string, FichaSegmento> = {
    AAAA11: { volume: 10, segmento: 'Banks - Regional' },
    BBBB3: { volume: 90, segmento: 'Banks - Regional' },
    BBBB4: { volume: 80, segmento: 'Banks - Regional' },
    CCCC11: { volume: 70, segmento: 'Banks - Regional' },
    DDDD3: { volume: 60, segmento: 'Banks - Regional' },
    EEEE3: { volume: 50, segmento: 'Banks - Regional' },
    FFFF3: { volume: 40, segmento: 'Banks - Regional' },
    GGGG3: { volume: 30, segmento: 'Banks - Regional' },
    HHHH3: { volume: 20, segmento: 'Banks - Regional' },
    IIII3: { volume: 15, segmento: 'Banks - Regional' },
    JJJJ3: { volume: 5, segmento: 'Banks - Regional' },
    ZZZZ3: { volume: 999, segmento: 'Gold' },
  }
  const pares = montarParesSegmento('AAAA11', 'Banks - Regional', ficha)
  assert.equal(pares.itens.length, PARES_SEGMENTO_MAX)
  assert.deepEqual(pares.itens.map((p) => p.ticker), ['BBBB3', 'CCCC11', 'DDDD3', 'EEEE3', 'FFFF3', 'GGGG3', 'HHHH3', 'IIII3'])
  assert.equal(pares.itens[0]!.href, '/dividendos/BBBB3')
  assert.equal(pares.nome, 'bancos')
  assert.equal(pares.qualifica, true)
  assert.equal(pares.slug, 'bancos')
  assert.equal(hrefSetorSeRota(pares, false), null)
  assert.equal(hrefSetorSeRota(pares, true), '/setores/bancos')
  assert.match(pares.nota, /Volume financeiro/)
  assert.doesNotMatch(pares.nota, /dividend yield|mais pagam|recomend/i)
  assert.equal(pares.itens.some((p) => p.ticker === 'BBBB4' || p.ticker === 'JJJJ3' || p.ticker === 'ZZZZ3'), false)
})

test('a classe da empresa é a de maior volume', () => {
  const ficha: Record<string, FichaSegmento> = {
    PETR4: { volume: 100, segmento: 'Oil & Gas Integrated' },
    PETR3: { volume: 40, segmento: 'Oil & Gas Integrated' },
    PRIO3: { volume: 80, segmento: 'Oil & Gas E&P' },
  }
  const pares = montarParesSegmento('PETR4', 'Oil & Gas Integrated', ficha)
  assert.deepEqual(pares.itens, [])
  assert.equal(pares.nome, 'petróleo e gás integrado')
  assert.equal(pares.qualifica, false)
  assert.equal(pares.slug, null)
  assert.equal(hrefSetorSeRota(pares, true), null)
  assert.match(pares.nota, /Não há outra empresa em petróleo e gás integrado/)
})

test('cadastro real: PETR4 fica sem par e MXRF11 traz oito fundos mais líquidos', () => {
  const petr = montarParesSegmento('PETR4', 'Oil & Gas Integrated')
  assert.equal(montarParesSegmento('PETR4', null).segmento, 'Oil & Gas Integrated')
  assert.deepEqual(petr.itens, [])
  assert.equal(hrefSetorSeRota(petr, true), null)

  const mxrf = montarParesSegmento('MXRF11', 'REIT - Diversified')
  assert.equal(mxrf.itens.length, 8)
  assert.equal(mxrf.itens.some((p) => p.ticker.startsWith('MXRF')), false)
  assert.equal(mxrf.slug, 'fundos-imobiliarios-diversificados')
  assert.equal(hrefSetorSeRota(mxrf, true), '/setores/fundos-imobiliarios-diversificados')
  const volumes = mxrf.itens.map((p) => PRECO_TETO_FICHA[p.ticker]!.volume)
  for (let i = 1; i < volumes.length; i++) assert.ok(volumes[i - 1]! >= volumes[i]!)
  assert.equal(mxrf.itens[0]!.ticker, 'TJKB11')
  assert.equal(PRECO_TETO_FICHA.MXRF11!.segmento, 'REIT - Diversified')
})

test('a página ganha os dois blocos e não mexe em title, description nem FAQ', () => {
  const vue = ler('app/pages/dividendos/[ticker].vue')
  const comp = ler('app/composables/useDividendos.ts')
  assert.match(vue, /title="Próximos pagamentos\."/)
  assert.match(vue, /title="Outras empresas do setor\."/)
  assert.match(vue, /to="\/dividendos\/agenda"/)
  assert.match(vue, /hrefSetorSeRota\(div\.value\.pares, temRotaSetores\)/)
  assert.match(vue, /import\.meta\.glob\('\.\.\/setores\/\*\.vue'\)/)
  assert.match(vue, /title: div\.value\.seo\.title/)
  assert.match(vue, /description: div\.value\.seo\.description/)
  assert.match(vue, /<NuFaqAccordion :items="div\.faq"/)
  assert.match(comp, /title: tituloDividendos\(c\.ticker, c\.name\)/)
  assert.match(comp, /description: descBits\.join\(' '\)/)
  assert.doesNotMatch(ler('app/utils/dividendosExtras.ts'), /mais pagam|recomendamos/i)
  assert.match(vue, /@media \(max-width: 800px\)/)
  assert.match(vue, /@media \(max-width: 420px\)/)
  assert.match(vue, /overflow-wrap: anywhere/)
})
