/**
 * Fórmula de /calculadora/ir-dividendos-jcp. Os limiares são os já publicados
 * em /quanto-rende e no guia de imposto sobre dividendos: R$ 50.000 no mês,
 * 10% sobre o total, JCP a 17,5%.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { TEXTO_ALIQUOTA_JCP } from '../app/utils/dividendosBlocos.ts'
import { URL_LC_224, URL_LEI_15270 } from '../app/utils/impostoRendaPagina.ts'
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO } from '../app/utils/serp.ts'
import {
  ALIQUOTA_DIVIDENDOS,
  ALIQUOTA_JCP,
  LIMITE_MENSAL_DIVIDENDOS,
  calcularIrProventos,
  centavos,
  classeDoAviso,
  contasDoMes,
  irSobreDividendos,
  irSobreJcp,
} from '../app/utils/ir-dividendos-jcp.ts'

const ler = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')

const TITLE = 'Imposto sobre dividendos e JCP em 2026'
const DESCRIPTION = 'Calcule o líquido de dividendos e JCP em 2026. Acima de R$ 50 mil no mês, a mesma empresa retém 10% sobre o total. No JCP, a retenção é de 17,5%. Grátis.'

test('até R$ 50.000 no mês o dividendo não tem retenção; acima, 10% sobre o total', () => {
  assert.equal(LIMITE_MENSAL_DIVIDENDOS, 50_000)
  assert.equal(ALIQUOTA_DIVIDENDOS, 0.1)
  const noLimite = irSobreDividendos(50_000)
  assert.equal(noLimite.acimaDoLimite, false)
  assert.equal(noLimite.retencao, 0)
  assert.equal(noLimite.liquido, 50_000)

  const acima = irSobreDividendos(60_000)
  assert.equal(acima.acimaDoLimite, true)
  assert.equal(acima.retencao, 6_000)
  assert.equal(acima.liquido, 54_000)

  const umReal = irSobreDividendos(50_000.01)
  assert.equal(umReal.acimaDoLimite, true)
  assert.equal(umReal.retencao, 5_000)
  assert.equal(umReal.liquido, 45_000.01)
  assert.ok(umReal.liquido < noLimite.liquido)
})

test('JCP retém 17,5% sobre o valor pago, inclusive abaixo de R$ 50 mil', () => {
  assert.equal(ALIQUOTA_JCP, 0.175)
  const cem = irSobreJcp(100)
  assert.equal(cem.retencao, 17.5)
  assert.equal(cem.liquido, 82.5)
  const baixo = irSobreJcp(500)
  assert.equal(baixo.retencao, 87.5)
  assert.equal(baixo.liquido, 412.5)
  assert.equal(irSobreJcp(0).retencao, 0)
  assert.equal(irSobreJcp(-10).bruto, 0)
  assert.equal(irSobreDividendos(Number.NaN).bruto, 0)
})

test('a conta junta dividendo e JCP sem somar os limites', () => {
  const r = calcularIrProventos(1_000, 500)
  assert.equal(r.dividendos.retencao, 0)
  assert.equal(r.jcp.retencao, 87.5)
  assert.equal(r.retencao, 87.5)
  assert.equal(r.liquido, 1_412.5)
  const alto = calcularIrProventos(60_000, 100)
  assert.equal(alto.retencao, 6_017.5)
  assert.equal(alto.liquido, centavos(54_000 + 82.5))
})

test('avisos do mês separam dividendo, JCP e o que não entra na conta', () => {
  assert.equal(classeDoAviso('JCP'), 'jcp')
  assert.equal(classeDoAviso('Juros sobre Capital Próprio'), 'jcp')
  assert.equal(classeDoAviso('Dividendo'), 'dividendo')
  assert.equal(classeDoAviso('Dividendo + JCP'), 'misto')
  assert.equal(classeDoAviso('Rendimento'), 'rendimento')
  assert.equal(classeDoAviso('Amortização'), 'capital')

  const mes = contasDoMes([
    { pagamento: '2026-03-15', dataCom: '2026-02-27', label: 'Dividendo', rate: 1.2 },
    { pagamento: '2026-03-15', dataCom: '2026-02-27', label: 'JCP', rate: 0.5 },
    { pagamento: '2026-03-20', dataCom: '2026-03-01', label: 'Dividendo + JCP', rate: 2 },
    { pagamento: '2026-04-10', dataCom: '2026-03-28', label: 'Dividendo', rate: 9 },
    { pagamento: '', dataCom: '2026-03-12', label: 'JCP', rate: 0.3 },
    { pagamento: '2026-03-18', dataCom: '2026-03-01', label: 'Rendimento', rate: 0.8 },
    { pagamento: '2026-03-18', dataCom: '2026-03-01', label: 'Amortização', rate: 1 },
  ], '2026-03', 100)

  assert.equal(mes.dividendos, 120)
  assert.equal(mes.jcp, 50)
  assert.equal(mes.linhas.find((l) => l.classe === 'misto')!.entraNaConta, false)
  assert.equal(mes.linhas.find((l) => l.classe === 'rendimento')!.entraNaConta, false)
  assert.equal(mes.linhas.find((l) => l.classe === 'capital')!.entraNaConta, false)
  assert.equal(mes.linhas.find((l) => l.pagamento === '')!.entraNaConta, false)
  assert.equal(mes.linhas.some((l) => l.rate === 9), false)
})

test('quantidade zero não transforma o valor por ação em valor recebido', () => {
  const mes = contasDoMes([
    { pagamento: '2026-03-15', dataCom: '2026-02-27', label: 'JCP', rate: 0.5 },
  ], '2026-03', 0)
  assert.equal(mes.jcp, 0)
  assert.equal(mes.linhas[0]!.entraNaConta, false)
  assert.equal(mes.linhas[0]!.valor, null)
})

test('a página usa a regra do repo, o texto do JCP e os links pedidos', () => {
  assert.ok(TITLE.length + SUFIXO_MARCA.length <= TETO_TITULO, String(TITLE.length + SUFIXO_MARCA.length))
  assert.ok(DESCRIPTION.length >= 120 && DESCRIPTION.length <= TETO_DESCRICAO, String(DESCRIPTION.length))
  const pagina = ler('app/pages/calculadora/ir-dividendos-jcp.vue')
  const secao = ler('app/components/calculadoras/ir-dividendos-jcp/CalcIrDividendosJcpSection.vue')
  const junto = pagina + secao
  assert.ok(pagina.includes(`title: '${TITLE}'`))
  assert.ok(pagina.includes(DESCRIPTION))
  assert.match(pagina, /path: '\/calculadora\/ir-dividendos-jcp'/)
  assert.match(pagina, /BreadcrumbList|breadcrumbs:/)
  assert.match(pagina, /NuFaqAccordion/)
  assert.match(junto, /Não é consultoria tributária/)
  assert.match(junto, /não é recomendação/i)
  assert.match(junto, /TEXTO_ALIQUOTA_JCP/)
  assert.match(TEXTO_ALIQUOTA_JCP, /17,5%/)
  assert.match(TEXTO_ALIQUOTA_JCP, /Lei Complementar 224\/2025/)
  assert.match(junto, /URL_LEI_15270/)
  assert.match(junto, /URL_LC_224/)
  assert.equal(URL_LEI_15270, 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15270.htm')
  assert.equal(URL_LC_224, 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp224.htm')
  assert.match(junto, /art\. 6º-A da Lei 9\.250\/1995/)
  assert.match(junto, /Lei 15\.270\/2025/)
  assert.match(junto, /to="\/jcp"/)
  assert.match(junto, /to="\/calculadora\/imposto-renda"/)
  assert.match(junto, /\/dividendos\//)
  assert.doesNotMatch(junto, /PL 1\.087/)
  assert.doesNotMatch(junto, /15% (de IR )?retid/)
  assert.match(ler('server/utils/site-pages.ts'), /\/calculadora\/ir-dividendos-jcp/)
  assert.match(ler('server/routes/llms.txt.ts'), /\/calculadora\/ir-dividendos-jcp/)
  assert.match(ler('server/data/sitemap-semente.ts'), /\/calculadora\/ir-dividendos-jcp/)
  assert.doesNotMatch(ler('nuxt.config.ts'), /'\/jcp':/)
  assert.doesNotMatch(ler('server/utils/sem-barra.ts'), /'\/jcp':/)
})
