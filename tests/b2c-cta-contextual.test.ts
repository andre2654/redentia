/**
 * Item 2 de conversão B2C: um card CTA contextual, no corpo, nas três
 * famílias orgânicas. Fica depois do primeiro resultado e antes do FAQ,
 * de "Continue a análise" e de "Veja também". Abre o quiz já usado no site.
 * Não é sticky e não recomenda ativo.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function ler(caminho: string) {
  return readFileSync(new URL(caminho, import.meta.url), 'utf8')
}

function template(src: string) {
  const ini = src.indexOf('<template>')
  const fim = src.lastIndexOf('</template>')
  return src.slice(ini, fim)
}

const VEDADO = /\b(compre|comprar|compra|vender|venda|oportunidade|recomend\w*|barato|upside|imperd[ií]vel|garantid\w*|lucro)\b/i

const CARD = 'app/components/cta/CtaConectarCarteira.vue'
const DIVIDENDOS = 'app/pages/dividendos/[ticker].vue'
const TETO = 'app/components/calc/CalcPrecoTetoTicker.vue'
const QUANTO = 'app/components/quanto-rende/QuantoRendeValor.vue'

const COPIA = {
  dividendos: {
    titulo: 'Veja esses proventos na sua carteira',
    corpo: 'Conecte pelo Open Finance, só leitura: a Aportou mostra o que você recebeu, com os seus números, e a decisão continua sendo sua.',
    to: '/assinar?quiz=1&de=dividendos',
  },
  'preco-teto': {
    titulo: 'Rode 2.000 cenários com a sua carteira',
    corpo: 'Conecte pelo Open Finance, só leitura, e veja a simulação nos próximos 5 anos com os seus números. É simulação, não promessa de rendimento.',
    to: '/assinar?quiz=1&de=preco-teto',
  },
  'quanto-rende': {
    titulo: 'Compare com o que a sua carteira rendeu',
    corpo: 'Esta página simula as taxas de hoje do Banco Central. Conecte a carteira pelo Open Finance (só leitura) para ver o que os seus investimentos fizeram, com os seus números.',
    to: '/assinar?quiz=1&de=quanto-rende',
  },
} as const

test('o card reusa o creme do cct e a pílula de conectar, sem faixa fixa', () => {
  const card = ler(`../${CARD}`)
  const visivel = template(card)
  assert.match(visivel, /class="ccc__bloco"/)
  assert.match(visivel, /<NuBotaoSeta :to="to" variante="azul" tamanho="m">Conectar carteira<\/NuBotaoSeta>/)
  assert.equal(visivel.match(/Conectar carteira/g)?.length, 1)
  assert.match(card, /background: var\(--nu-cream\)/)
  assert.match(card, /color: var\(--nu-ink\)/)
  assert.match(card, /border-radius: 18px/)
  assert.match(card, /min-height:\s*48px/)
  assert.match(card, /flex-direction:\s*column/)
  assert.match(card, /@media \(max-width: 759px\)/)
  assert.match(card, /width:\s*100%/)
  assert.match(card, /@media \(min-width: 760px\)/)
  assert.match(card, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s*auto/)
  assert.match(card, /min-width:\s*0/)
  assert.match(card, /max-width:\s*100%/)
  assert.match(card, /overflow-wrap:\s*anywhere/)
  assert.match(card, /scroll-margin-bottom:\s*calc\(108px \+ env\(safe-area-inset-bottom\)\)/)
  assert.doesNotMatch(card, /position:\s*(?:sticky|fixed)/)
  assert.doesNotMatch(visivel, VEDADO)
  assert.match(card, /\/assinar\?quiz=1&de=dividendos/)
  assert.match(card, /\/assinar\?quiz=1&de=preco-teto/)
  assert.match(card, /\/assinar\?quiz=1&de=quanto-rende/)
  for (const de of ['dividendos', 'preco-teto', 'quanto-rende'] as const) {
    assert.ok(de.length <= 24, de)
    assert.equal(COPIA[de].to, `/assinar?quiz=1&de=${de}`)
  }
})

test('/dividendos/{T} mostra o card depois dos números e antes do FAQ', () => {
  const pagina = ler(`../${DIVIDENDOS}`)
  const tpl = template(pagina)
  const seguir = tpl.indexOf('<SeguirAtivo')
  const stats = tpl.indexOf('<DividendosStats')
  const cta = tpl.indexOf('<CtaConectarCarteira')
  const resumo = tpl.indexOf('<DividendosResumo')
  const faq = tpl.indexOf('<NuFaqAccordion')
  const continua = tpl.indexOf('Continue a análise.')
  const veja = tpl.indexOf('<NuVejaTambem')
  assert.ok([seguir, stats, cta, resumo, faq, continua, veja].every((n) => n !== -1))
  assert.ok(seguir < stats && stats < cta && cta < resumo && resumo < faq && faq < continua && continua < veja)
  assert.equal(tpl.match(/<CtaConectarCarteira/g)?.length, 1)
  assert.equal(tpl.match(/<SeguirAtivo/g)?.length, 1)
  assert.match(tpl, /titulo="Veja esses proventos na sua carteira"/)
  assert.match(tpl, /corpo="Conecte pelo Open Finance, só leitura: a Aportou mostra o que você recebeu, com os seus números, e a decisão continua sendo sua\."/)
  assert.match(tpl, /to="\/assinar\?quiz=1&de=dividendos"/)
  assert.doesNotMatch(pagina, /position:\s*(?:sticky|fixed)/)
  assert.doesNotMatch(tpl.slice(cta, resumo), VEDADO)
})

test('/calculadora/preco-teto/{T} mantém o alerta e acrescenta o card antes do FAQ', () => {
  const pagina = ler(`../${TETO}`)
  const tpl = template(pagina)
  const nums = tpl.indexOf('class="ptt__nums"')
  const aviso = tpl.indexOf('class="ptt__aviso"', nums)
  const alerta = tpl.indexOf('<CalcCapturaTeto', aviso)
  const convite = tpl.indexOf('<CalcConvitePrecoTeto', alerta)
  const cta = tpl.indexOf('<CtaConectarCarteira', convite)
  const fecha = tpl.indexOf('</section>', cta)
  const faq = tpl.indexOf('class="ptt__faq"', fecha)
  const veja = tpl.indexOf('<NuVejaTambem', faq)
  assert.ok([nums, aviso, alerta, convite, cta, fecha, faq, veja].every((n) => n !== -1))
  assert.ok(nums < aviso && aviso < alerta && alerta < convite && convite < cta && cta < fecha && fecha < faq && faq < veja)
  assert.equal(tpl.match(/<CalcCapturaTeto/g)?.length, 1)
  assert.equal(tpl.match(/<CtaConectarCarteira/g)?.length, 1)
  assert.match(tpl, /<CalcCapturaTeto :ticker="view\.ticker" :alvo="view\.consenso > 0 \? view\.consenso : null" \/>/)
  assert.match(tpl, /titulo="Rode 2\.000 cenários com a sua carteira"/)
  assert.match(tpl, /corpo="Conecte pelo Open Finance, só leitura, e veja a simulação nos próximos 5 anos com os seus números\. É simulação, não promessa de rendimento\."/)
  assert.match(tpl, /to="\/assinar\?quiz=1&de=preco-teto"/)
  assert.doesNotMatch(pagina, /position:\s*(?:sticky|fixed)/)
  assert.doesNotMatch(ler('../app/components/calc/CalcPrecoTetoMetodo.vue'), /CtaConectarCarteira/)
  assert.doesNotMatch(ler('../app/pages/calculadora/preco-teto/index.vue'), /CtaConectarCarteira/)
  assert.doesNotMatch(tpl.slice(cta, fecha), VEDADO)
})

test('/quanto-rende/{valor} mostra o card depois da simulação e antes do FAQ', () => {
  const pagina = ler(`../${QUANTO}`)
  const tpl = template(pagina)
  const destaques = tpl.indexOf('class="qrv__destaques"')
  const fonte = tpl.indexOf('class="qrv__fonte"')
  const cta = tpl.indexOf('<CtaConectarCarteira')
  const cdi = tpl.indexOf('100% do CDI, 110% e 115% do CDI.')
  const faq = tpl.indexOf('<NuFaqAccordion')
  const outros = tpl.indexOf('Outros valores.')
  assert.ok([destaques, fonte, cta, cdi, faq, outros].every((n) => n !== -1))
  assert.ok(destaques < fonte && fonte < cta && cta < cdi && cdi < faq && faq < outros)
  assert.equal(tpl.match(/<CtaConectarCarteira/g)?.length, 1)
  assert.match(tpl, /titulo="Compare com o que a sua carteira rendeu"/)
  assert.match(tpl, /corpo="Esta página simula as taxas de hoje do Banco Central\. Conecte a carteira pelo Open Finance \(só leitura\) para ver o que os seus investimentos fizeram, com os seus números\."/)
  assert.match(tpl, /to="\/assinar\?quiz=1&de=quanto-rende"/)
  assert.doesNotMatch(pagina, /position:\s*(?:sticky|fixed)/)
  assert.doesNotMatch(ler('../app/pages/quanto-rende/[ticker].vue'), /CtaConectarCarteira/)
  assert.doesNotMatch(tpl.slice(cta, cdi), VEDADO)
})
