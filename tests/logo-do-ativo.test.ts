/**
 * O logo do ativo (NuAssetLogo) só pede o ícone de quem tem forma de ticker da
 * B3. Até 13/11/2026 o componente tinha uma cópia da regra que pedia quatro
 * LETRAS antes do número, e quem tem dígito no meio nunca tentava o ícone:
 * B3SA3 (a própria B3) e os BDRs como M1TA34 e A1MD34 ficavam só com o azulejo
 * de letra. O herói da folha de cadastro tinha a mesma cópia.
 *
 * O que este teste segura: a decisão é a da regra única (utils/tickerClass.ts),
 * quem não é da B3 continua sem pedir ícone, e ícone que não existe volta para
 * a letra.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { symbolShape } from '../app/utils/tickerClass.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const logo = ler('app/components/nu/NuAssetLogo.vue')
const dadosDoCadastro = ler('app/composables/useCadastroDados.ts')
const heroiDoCadastro = ler('app/components/cadastro/CadastroHeroiAtivo.vue')

/** a mesma conta do componente (o terceiro teste confere que é esta a expressão dele) */
const tentaOIcone = (ticker: string): boolean => symbolShape(ticker) === 'b3'

test('ticker da B3 tenta o ícone, com dígito no meio ou não', () => {
  // os que a regra velha deixava de fora
  for (const t of ['B3SA3', 'M1TA34', 'A1MD34']) assert.equal(tentaOIcone(t), true, t)
  // os de sempre: ação, unit, fundo e BDR de quatro letras
  for (const t of ['PETR4', 'TAEE11', 'MXRF11', 'AAPL34']) assert.equal(tentaOIcone(t), true, t)
  // a caixa não decide
  assert.equal(tentaOIcone('b3sa3'), true)
})

test('quem não é da B3 vai direto para o azulejo de letra, sem pedir ícone', () => {
  for (const t of ['TESOURO SELIC 2029', 'BTC', 'CDB', 'AAPL', 'Saldo em conta', 'RF-123', '']) {
    assert.equal(tentaOIcone(t), false, t)
  }
})

test('o componente decide pela regra única e volta para a letra quando o ícone falha', () => {
  assert.match(logo, /const eligible = computed\(\(\) => symbolShape\(props\.ticker\) === 'b3'\)/)
  // sem cópia da expressão: a de quatro letras foi a que deixou a B3SA3 de fora
  assert.doesNotMatch(logo, /\[A-Z\]\{4\}/)
  assert.match(logo, /const showImg = computed\(\(\) => eligible\.value && !failed\.value\)/)
  assert.match(logo, /<img\s+v-if="showImg" :src="src" :alt="ticker" class="nal__img"\s+loading="lazy" @error="failed = true"\s*>/)
  assert.match(logo, /<template v-else>\{\{ letter \}\}<\/template>/)
})

test('o herói do cadastro segue a mesma decisão; a regra estrita fica só na manchete', () => {
  assert.match(dadosDoCadastro, /logo: symbolShape\(ticker\) === 'b3' \? `https:\/\/icons\.brapi\.dev\/icons\/\$\{ticker\}\.svg` : null,/)
  // o /news/ticker recusa ticker com dígito no meio: ali a regra de quatro letras é a do endpoint
  assert.match(dadosDoCadastro, /NEWS_STRICT_RE\.test\(ticker\) \? acaoFetchNewsByTicker\(BASE, ticker\) : Promise\.resolve\(\{ data: \[\] \}\)/)
  // ícone que não existe: o herói fica com a letra em vez de um quadro vazio
  assert.match(heroiDoCadastro, /<img v-if="dados\?\.logo && dados\.logo !== logoFalhou" :src="dados\.logo" [^>]*@error="logoFalhou = dados\?\.logo \?\? null">\n\s*<span v-else class="cha__logo cha__logo--letra">/)
})
