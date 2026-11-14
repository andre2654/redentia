/**
 * A marca nos textos da API da carteira (11/11/2026): utils/carteiraVisao.ts
 * (`marcaNaResposta`, `textoComMarca`). O backend serve também o app, que
 * ainda se chama Redentia; no site a troca é só de exibição, no ponto único em
 * que cada resposta vira estado da tela.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { marcaNaResposta as naResposta, textoComMarca as comMarca } from '../app/utils/carteiraVisao.ts'
import { marcaNoTexto } from '../app/utils/marcaNoTexto.ts'
import { visaoMock } from '../app/dev/carteiraVisaoMock.ts'

// como os composables chamam: a troca do nome é o marcaNoTexto de verdade
const textoComMarca = (t: string) => comMarca(t, marcaNoTexto)
const marcaNaResposta = <T>(v: T) => naResposta(v, marcaNoTexto)
const ler = (c: string) => readFileSync(new URL(`../${c}`, import.meta.url), 'utf8')

test('os textos reais do motor saem com a marca do site', () => {
  // os quatro abaixo vieram da resposta real de /me/carteira/visao (a fixture do dono)
  assert.equal(
    textoComMarca('Simulação da Redentia (motor de cenários): Ibovespa −10% de uma vez, com o beta de cada papel.'),
    'Simulação da Aportou (motor de cenários): Ibovespa −10% de uma vez, com o beta de cada papel.',
  )
  assert.equal(
    textoComMarca('Proventos de 12 meses da B3 (com a regra de dedupe da Redentia), as suas operações e o motor de cenários da Redentia'),
    'Proventos de 12 meses da B3 (com a regra de dedupe da Aportou), as suas operações e o motor de cenários da Aportou',
  )
  assert.equal(textoComMarca('Nº 17 de 100 no Redentia Score de ações (quartil de cima)'), 'Nº 17 de 100 no Aportou Score de ações (quartil de cima)')
  assert.equal(textoComMarca('O que diz a tese da Redentia sobre a PETR4?'), 'O que diz a tese da Aportou sobre a PETR4?')
})

test('o botão da IA diz "Perguntar à IA"', () => {
  assert.equal(textoComMarca('Perguntar à Redentia'), 'Perguntar à IA')
  assert.equal(textoComMarca('Perguntar à Redentia AI'), 'Perguntar à IA')
  assert.equal(textoComMarca('Pergunte à Redentia AI sobre a carteira'), 'Pergunte à IA da Aportou sobre a carteira')
  // o produto de escritório segue Redentia
  assert.equal(textoComMarca('Perguntar à Redentia Business'), 'Perguntar à Redentia Business')
})

test('endereço, rota, âncora e código ficam como vieram', () => {
  for (const t of [
    'https://redentia.com.br/asset/PETR4',
    'https://exemplo.com/noticia/Redentia-lanca-app',
    '/ranking/redentia-score',
    '/Redentia',
    '#Redentia',
    'lente:riscos',
    'mailto:relacionamento@redentia.com.br',
    'redentia_score',
    'Fale com relacionamento@redentia.com.br',
    'Sem a marca aqui.',
    '',
  ]) assert.equal(textoComMarca(t), t)
})

test('o percorredor troca só valor de texto: chave, id, ticker, número e série passam', () => {
  const serie = [1, 2, 3]
  const tickers = ['Redentia', 'PETR4']
  const limpo = { rotulo: 'Imposto', resultado: 'Nada a pagar.', ok: true }
  const entrada = {
    Redentia: 'a chave não muda',
    id: 'ideia.Redentia:2026-11',
    detector: 'Redentia.score',
    chave: 'Redentia',
    ticker: 'Redentia',
    tickers,
    logo: 'https://cdn.exemplo.com/Redentia.png',
    patrimonio: 636096.48,
    ok: false,
    nulo: null,
    serie,
    olhados: [limpo, { rotulo: 'Score', resultado: 'Nº 3 no Redentia Score.', ok: true }],
    acoes: [
      { tipo: 'perguntar', rotulo: 'Perguntar à Redentia', alvo: 'O que a tese da Redentia diz sobre a VALE3?' },
      { tipo: 'ver', rotulo: 'Ver o ranking', alvo: '/ranking/redentia-score' },
    ],
    fatores: [{ chave: 'juros', metodo: 'Simulação da Redentia (motor de cenários): juros 1 ponto acima.' }],
  }
  const copia = structuredClone(entrada)
  const saida = marcaNaResposta(entrada)

  // não muda o que recebeu
  assert.deepEqual(entrada, copia)
  // o que identifica fica igual
  assert.equal(saida.Redentia, 'a chave não muda')
  assert.equal(saida.id, 'ideia.Redentia:2026-11')
  assert.equal(saida.detector, 'Redentia.score')
  assert.equal(saida.chave, 'Redentia')
  assert.equal(saida.ticker, 'Redentia')
  assert.equal(saida.tickers, tickers)
  assert.equal(saida.logo, entrada.logo)
  assert.equal(saida.fatores[0]!.chave, 'juros')
  // número, booleano, null e série: os mesmos
  assert.equal(saida.patrimonio, 636096.48)
  assert.equal(saida.ok, false)
  assert.equal(saida.nulo, null)
  assert.equal(saida.serie, serie)
  // o trecho sem troca volta o mesmo objeto
  assert.equal(saida.olhados[0], limpo)
  // os textos
  assert.equal(saida.olhados[1]!.resultado, 'Nº 3 no Aportou Score.')
  assert.equal(saida.acoes[0]!.rotulo, 'Perguntar à IA')
  assert.equal(saida.acoes[0]!.alvo, 'O que a tese da Aportou diz sobre a VALE3?')
  assert.equal(saida.acoes[1]!.alvo, '/ranking/redentia-score')
  assert.equal(saida.fatores[0]!.metodo, 'Simulação da Aportou (motor de cenários): juros 1 ponto acima.')
  // nada visível diz mais o nome antigo (fora do que identifica)
  const { id: _i, detector: _d, chave: _c, ticker: _t, tickers: _ts, logo: _l, Redentia: _k, ...visivel } = saida
  assert.doesNotMatch(JSON.stringify(visivel).replace('/ranking/redentia-score', ''), /Redentia/)
})

test('resposta sem a marca volta a mesma, e o que não é objeto simples passa', () => {
  const v = visaoMock('normal')
  assert.equal(marcaNaResposta(v), v)
  assert.equal(marcaNaResposta(null), null)
  assert.equal(marcaNaResposta(undefined), undefined)
  assert.equal(marcaNaResposta(42), 42)
  assert.equal(marcaNaResposta('a Redentia olhou'), 'a Aportou olhou')
  const quando = new Date()
  assert.equal(marcaNaResposta({ quando }).quando, quando)
  // 2.000 caminhos de números: a lista de fora é a mesma (nada a ler lá dentro)
  const caminhos = Array.from({ length: 2000 }, () => [1000, 3, -2, 5])
  assert.equal(marcaNaResposta({ paths_data: caminhos }).paths_data, caminhos)
})

test('a troca acontece uma vez, onde a resposta vira estado da tela', () => {
  // /me/carteira/visao: dentro do useAsyncData, antes do payload do SSR
  assert.match(ler('app/composables/useCarteiraVisao.ts'), /return \{ visao: marcaNaResposta\(visao, marcaNoTexto\), desligada: false, erro: false \}/)
  // /me/carteira/relatorio: na hora de guardar
  assert.match(ler('app/composables/useCarteiraRelatorio.ts'), /relatorio\.value = markRaw\(marcaNaResposta\(r, marcaNoTexto\)\)/)
  // /me/carteira/futuro: na resposta inteira, antes de montar o leque
  assert.match(ler('app/composables/useCarteiraFuturo.ts'), /const r = marcaNaResposta\(await carteiraFetchFuturo\([\s\S]{0,160}?\}\), marcaNoTexto\)/)
  // o mock do dev (e a carteira real local) passa pelo mesmo lugar
  assert.match(ler('app/components/carteira/visao/CarteiraVisao.vue'), /import\.meta\.dev \? marcaNaResposta\(/)
  // e nenhum componente da carteira refaz a troca por conta própria
  for (const c of ['visao/CarteiraAvisos.vue', 'visao/VisaoLenteRiscos.vue', 'visao/VisaoRelatorio.vue', 'CarteiraFuturo.vue']) {
    assert.doesNotMatch(ler(`app/components/carteira/${c}`), /marcaNoTexto|textoComMarca|marcaNaResposta/, c)
  }
})

test('a tela antiga da carteira não desenha mais a logo da marca antiga', () => {
  const agora = ler('app/components/carteira/CarteiraAgora.vue')
  const tela = agora.slice(agora.indexOf('<template>'), agora.lastIndexOf('</template>')).replace(/<!--[\s\S]*?-->/g, '')
  // o losango do dia (HomeLosango) desenha o dia dentro da logo da Redentia: saiu do topo, e o que ele dizia está na linha do dia
  assert.doesNotMatch(tela, /<HomeLosango\b/)
  assert.match(tela, /\{\{ linhaDoDia \}\}\{\{ proventoNaLinha \}\}/)
  // a "abertura em onda" (as quatro peças da logo antiga) só roda no topo enxuto, com `visao`.
  // Ninguém monta o CarteiraAgora assim: a tela nova usa o CarteiraHeroi. Se alguém voltar a
  // passar `visao`, a logo antiga volta a aparecer: troque a abertura antes.
  const conteudo = ler('app/components/carteira/CarteiraContent.vue')
  const montagem = conteudo.match(/<CarteiraAgora\b[^>]*>/g) ?? []
  assert.equal(montagem.length, 1)
  assert.doesNotMatch(montagem[0]!, /:visao=/)
  assert.match(agora, /const enxuto = computed\(\(\) => !!props\.visao\)/)
})
