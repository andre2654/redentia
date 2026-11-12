/**
 * A régua do mercado, "a bolsa inteira numa linha" (12/11/2026). O fixture é a
 * resposta real do /api/bolsa-do-dia (o fechamento de sexta, 06/11/2026:
 * Ibovespa 168.498, +1,39%, as 76 ações do índice). Os casos travam a barra (a
 * ordem, a largura, a cor, o rótulo, a dica), o número da direita em cada
 * momento do relógio da B3, o que o leitor de tela ouve, a frase de quem assina
 * (o selo da home, numa regra só), a tinta do ticker contra a paleta do
 * tokens.css e o que o componente promete: um elemento só, sem link, sem hex.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  BARRA_MAIS_LARGA, DURACAO_DA_CENA, FOLGA_DA_AGULHA, FORCA_DO_RELOGIO, LARGURA_DO_ROTULO, ROTULO_DO_RELOGIO_ATE, TEXTOS_DA_BARRA, TINTA_CLARA_DESDE, cenasDaRegua,
  contagemDaRegua, estadoCurto, reguaDoRelogio,
  fatiaArredondada, fatiaQueSubiu, fechamentoDaRegua, forcaDaCor, legendaDaCarteira, legendaDaRegua as legendaComMomento, pedacoNaPosicao,
  pedacosDaRegua, pontosDoPapel, rotuloDaBarra, tintaDoPedaco, type AcaoDoIndice,
} from '../app/utils/reguaDaBolsa.ts'
import { NOTA_DO_ATRASO, momentoDoDado } from '../app/utils/topo.ts'
import { estadoDoPregao, janelaDaAbertura, pregaoAnterior, relogioDoDev } from '../app/utils/pregao.ts'
import { frasesDoDia, montarResumoDoDia, seloDoDia } from '../app/utils/diaDaCarteira.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const fixture = JSON.parse(ler('tests/fixtures/bolsa-do-dia-2026-11-06.json')) as { ibov: { data: string; pct: number }; acoes: AcaoDoIndice[] }
const pedacos = pedacosDaRegua(fixture.acoes)
const de = (t: string) => pedacos.find((p) => p.ticker === t)!
const quintaCedo = new Date('2026-11-12T08:57:00-03:00')
/** o número da direita com o momento do dado (utils/topo.ts), como o componente monta */
const legendaDaRegua = (p: typeof pedacos, data: string | null, estado: Parameters<typeof momentoDoDado>[1], agora: Date) => legendaComMomento(p, momentoDoDado(data, estado, agora))
const sp = (iso: string) => new Date(`${iso}-03:00`)

test('a barra vai da que mais caiu à que mais subiu, com a largura do peso no índice', () => {
  assert.equal(fixture.ibov.data, '2026-11-06')
  assert.equal(pedacos.length, 76)
  assert.equal(pedacos[0]!.ticker, 'NATU3') // −3,36%, a que mais caiu
  assert.equal(pedacos[75]!.ticker, 'CSAN3') // +10,8%, a que mais subiu
  for (let i = 1; i < pedacos.length; i++) assert.ok(pedacos[i - 1]!.pct <= pedacos[i]!.pct, `ordem em ${i}`)
  const soma = pedacos.reduce((s, p) => s + p.largura, 0)
  assert.ok(Math.abs(soma - 100) < 1e-9, `soma ${soma}`)
  assert.equal(pedacos[0]!.inicio, 0)
  for (let i = 1; i < pedacos.length; i++) assert.ok(Math.abs(pedacos[i]!.inicio - (pedacos[i - 1]!.inicio + pedacos[i - 1]!.largura)) < 1e-9)
  // os pesos do dado fecham em 100: a largura é o próprio peso
  assert.ok(Math.abs(de('VALE3').largura - 9.934) < 0.001)
  // ticker repetido, sem peso ou sem variação fica de fora; sem ação, nada
  assert.equal(pedacosDaRegua([...fixture.acoes, fixture.acoes[0]!, { ticker: 'XPTO3', empresa: 'X', pct: Number.NaN, peso: 1, pontos: 0 }]).length, 76)
  assert.deepEqual(pedacosDaRegua([]), [])
  assert.deepEqual(pedacosDaRegua(null), [])
})

test('a cor: areia no zero, a força pela raiz de |pct|/5 e o teto em 5%, tudo em token', () => {
  assert.equal(de('ABEV3').lado, 'zero') // 0%
  assert.equal(de('VBBR3').lado, 'zero') // −0,035%: a dica diz "0,0%", a cor também
  assert.equal(de('ABEV3').fundo, 'var(--nu-mapa-zero)')
  assert.equal(de('VALE3').lado, 'alta')
  assert.equal(de('VALE3').fundo, 'color-mix(in oklab, var(--nu-mapa-alta) 66.1%, var(--nu-mapa-alta-claro))') // √(2,1861/5)
  assert.equal(de('PETR4').fundo, 'color-mix(in oklab, var(--nu-mapa-queda) 50.7%, var(--nu-mapa-queda-claro))') // √(1,284/5)
  assert.equal(de('CSAN3').forca, 1) // +10,8%: passou do teto
  assert.equal(forcaDaCor(5), 1)
  assert.equal(forcaDaCor(-7), 1)
  assert.equal(forcaDaCor(0.04), 0)
  for (const p of pedacos) assert.match(p.fundo, /^(var\(--nu-mapa-zero\)|color-mix\(in oklab, var\(--nu-mapa-(alta|queda)\) [\d.]+%, var\(--nu-mapa-(alta|queda)-claro\)\))$/, p.ticker)
})

test('o ticker vai dentro só dos pedaços largos (uns 62px na barra mais larga)', () => {
  assert.equal(LARGURA_DO_ROTULO, 62)
  // a barra mais larga é a coluna toda (1240), depois que os textos dos lados somem: cabe a PETR3 também
  assert.equal(BARRA_MAIS_LARGA, 1240)
  assert.deepEqual(pedacos.filter((p) => p.rotulo).map((p) => p.ticker), ['PETR4', 'PETR3', 'ITUB4', 'VALE3'])
  // numa barra estreita, ninguém (o CSS ainda confere a largura real de cada pedaço)
  assert.deepEqual(pedacosDaRegua(fixture.acoes, { larguraMaxima: 400 }).filter((p) => p.rotulo), [])
})

test('a dica: o nome, o ticker e a variação; o peso no índice e os pontos que somou ou tirou', () => {
  assert.deepEqual(
    { titulo: de('VALE3').dica.titulo, pct: de('VALE3').dica.pct, tom: de('VALE3').dica.tom, linha: de('VALE3').dica.linha },
    { titulo: 'Vale · VALE3', pct: '+2,2%', tom: 'up', linha: '9,9% do Ibovespa · somou 360 pontos' }, // 360,9: truncado, como a home escreve a causa
  )
  assert.equal(de('PETR4').dica.titulo, 'Petrobras · PETR4')
  assert.equal(de('PETR4').dica.pct, '−1,3%')
  assert.equal(de('PETR4').dica.linha, '8,7% do Ibovespa · tirou 185 pontos')
  assert.equal(de('ABEV3').dica.pct, '0,0%')
  assert.equal(de('ABEV3').dica.tom, 'flat')
  assert.equal(de('ABEV3').dica.linha, '2,7% do Ibovespa · não mexeu no índice')
  assert.equal(de('VBBR3').dica.linha, '1,5% do Ibovespa · tirou menos de 1 ponto')
  assert.equal(de('BEEF3').dica.linha, 'menos de 0,1% do Ibovespa · somou 2 pontos') // peso 0,049
  assert.equal(de('VALE3').dica.falada, 'Vale, VALE3, mais 2,2%. 9,9% do Ibovespa; somou 360 pontos.')
  // com a bolsa aberta, no presente
  const vivo = pedacosDaRegua(fixture.acoes, { aoVivo: true }).find((p) => p.ticker === 'VALE3')!
  assert.equal(vivo.dica.linha, '9,9% do Ibovespa · soma 360 pontos')
  assert.equal(pontosDoPapel(-1.2, true), 'tira 1 ponto')
  assert.equal(pontosDoPapel(0, true), 'não mexe no índice')
})

test('a fatia do índice que subiu é o verde da barra, e o arredondamento não apaga quem ficou de fora', () => {
  assert.ok(Math.abs(fatiaQueSubiu(pedacos) - 71.317) < 0.01)
  assert.equal(fatiaArredondada(fatiaQueSubiu(pedacos)), 71)
  assert.equal(fatiaArredondada(0.3), 1)
  assert.equal(fatiaArredondada(99.6), 99)
  assert.equal(fatiaArredondada(0), 0)
  assert.equal(fatiaArredondada(100), 100)
})

test('o número da direita em cada momento do relógio da B3', () => {
  // quinta antes das 10h, com o fechamento de sexta (06/11)
  const antes = legendaDaRegua(pedacos, '2026-11-06', 'antes', quintaCedo)!
  assert.deepEqual({ ...antes, resumo: undefined }, { numero: '71%', longo: 'do índice subiu na sexta', medio: 'subiu na sexta', curto: 'subiu', aoVivo: false, resumo: undefined, nota: 'Fechamento de sexta, 06/11.' })
  // bolsa aberta com o dado de hoje: o presente
  const vivo = legendaDaRegua(pedacos, '2026-11-12', 'aberta', new Date('2026-11-12T14:00:00-03:00'))!
  assert.deepEqual([vivo.longo, vivo.medio, vivo.curto, vivo.aoVivo], ['do índice sobe agora', 'sobe agora', 'sobe', true])
  // bolsa aberta, mas o dado ainda é o de ontem: não finge que é agora
  assert.equal(legendaDaRegua(pedacos, '2026-11-11', 'aberta', new Date('2026-11-12T10:05:00-03:00'))!.longo, 'do índice subiu ontem')
  // fechou hoje
  assert.equal(legendaDaRegua(pedacos, '2026-11-12', 'fechada', new Date('2026-11-12T19:00:00-03:00'))!.longo, 'do índice subiu hoje')
  // dado velho: a data
  assert.equal(legendaDaRegua(pedacos, '2026-10-30', 'antes', quintaCedo)!.medio, 'subiu em 30/10')
  assert.equal(legendaDaRegua([], '2026-11-06', 'antes', quintaCedo), null)
})

test('o leitor de tela ouve o resumo da barra, não 76 pedaços, e no fim de quando é o dado', () => {
  const antes = legendaDaRegua(pedacos, '2026-11-06', 'antes', quintaCedo)!
  assert.equal(
    rotuloDaBarra(antes),
    '71% do Ibovespa subiu na sexta. Mais subiram: Cosan +10,8%, C&A Modas +9,0% e CSN +8,9%; mais caíram: Natura −3,4%, Ultrapar −2,7% e Caixa Seguridade −2,1%. Fechamento de sexta, 06/11.',
  )
  // quem assina ouve quantas são suas; o aviso de atraso fica sempre no fim
  assert.match(rotuloDaBarra(antes, 9), /Caixa Seguridade −2,1%\. Você tem 9 delas\. Fechamento de sexta, 06\/11\.$/)
  assert.match(rotuloDaBarra(antes, 1), / Você tem uma delas\. /)
  const vivo = legendaDaRegua(pedacos, '2026-11-12', 'aberta', new Date('2026-11-12T14:00:00-03:00'))!
  assert.match(rotuloDaBarra(vivo), /^71% do Ibovespa sobe agora\. Mais sobem: Cosan \+10,8%.*; mais caem: Natura −3,4%.* Cotações da B3 com 15 min de atraso\.$/)
})

test('o aviso de atraso da B3 saiu da linha e mora na dica: o atraso ao vivo, a data no fechamento', () => {
  const nota = (d: string | null, e: Parameters<typeof momentoDoDado>[1], a: Date) => momentoDoDado(d, e, a).nota
  assert.equal(NOTA_DO_ATRASO, 'Cotações da B3 com 15 min de atraso.')
  assert.equal(nota('2026-11-12', 'aberta', sp('2026-11-12T14:00')), NOTA_DO_ATRASO)
  assert.equal(nota('2026-11-06', 'antes', quintaCedo), 'Fechamento de sexta, 06/11.')
  assert.equal(nota('2026-11-12', 'fechada', sp('2026-11-12T19:00')), 'Fechamento de hoje.')
  // a bolsa abriu, mas o dado ainda é o fechamento de ontem: é fechamento, sem atraso (e não é ao vivo)
  assert.deepEqual(momentoDoDado('2026-11-11', 'aberta', sp('2026-11-12T10:05')), { aoVivo: false, quando: 'ontem', nota: 'Fechamento de ontem.' })
  assert.equal(nota('2026-11-06', 'sem-pregao', sp('2026-11-20T12:00')), 'Fechamento de sexta, 06/11.')
  assert.equal(nota(null, 'aberta', quintaCedo), NOTA_DO_ATRASO)
  assert.equal(legendaDaRegua(pedacos, '2026-11-12', 'aberta', sp('2026-11-12T14:00'))!.nota, NOTA_DO_ATRASO)
})

/* ————— o palco: as cenas de cada momento, a contagem e o fechamento ————— */

test('as cenas de cada momento da bolsa, na ordem em que entram', () => {
  assert.equal(DURACAO_DA_CENA, 60_000)
  assert.equal(TEXTOS_DA_BARRA, 15_000)
  const tem = { contagem: true, fechamento: true }
  assert.deepEqual(cenasDaRegua('antes', tem), ['contagem', 'barra'])
  assert.deepEqual(cenasDaRegua('aberta', tem), ['barra']) // ao vivo, sem troca
  assert.deepEqual(cenasDaRegua('fechada', tem), ['fechamento', 'barra'])
  assert.deepEqual(cenasDaRegua('sem-pregao', tem), ['barra', 'contagem'])
  // sem a frase de hoje (o dado ainda é de ontem) ou sem calendário, a cena não entra
  assert.deepEqual(cenasDaRegua('fechada', { contagem: true, fechamento: false }), ['barra'])
  assert.deepEqual(cenasDaRegua('sem-pregao', { contagem: false, fechamento: false }), ['barra'])
})

test('antes das 10h num dia útil: a contagem de minuto em minuto e a linha desde o fechamento de ontem', () => {
  const agora = sp('2026-11-12T08:48')
  assert.equal(estadoDoPregao(agora).estado, 'antes')
  const j = janelaDaAbertura(agora)!
  assert.equal(j.dia, '2026-11-12')
  assert.equal(j.abreEm, Date.parse('2026-11-12T10:00:00-03:00'))
  assert.equal(j.fechouEm, Date.parse('2026-11-11T18:00:00-03:00')) // depois do horário de verão dos EUA, fecha às 18h
  const c = contagemDaRegua(j, agora.getTime(), '2026-11-12')
  assert.deepEqual(c, {
    longo: 'A bolsa abre em 1h12min', curto: 'Abre em 1h12', partes: ['A bolsa abre em', '1h12min', ''], partesCurto: ['Abre em', '1h12', ''],
    segundos: false, hoje: true, ponta: '10h',
  })
  // a hora cheia é "1h", não "1h00min" (12/11/2026, o dono viu "abre em 1h00min")
  assert.deepEqual([contagemDaRegua(j, sp('2026-11-12T09:00').getTime(), '2026-11-12').longo, contagemDaRegua(j, sp('2026-11-12T09:00').getTime(), '2026-11-12').curto], ['A bolsa abre em 1h', 'Abre em 1h'])
  assert.equal(contagemDaRegua(j, sp('2026-11-12T08:00').getTime(), '2026-11-12').longo, 'A bolsa abre em 2h')
  // arredonda o minuto para cima: às 8h48m30s ainda faltam "1h12min"
  assert.equal(contagemDaRegua(j, sp('2026-11-12T08:48:30').getTime(), '2026-11-12').longo, 'A bolsa abre em 1h12min')
  assert.equal(contagemDaRegua(j, sp('2026-11-12T09:15').getTime(), '2026-11-12').longo, 'A bolsa abre em 45min')
  assert.equal(contagemDaRegua(j, sp('2026-11-12T09:05').getTime(), '2026-11-12').curto, 'Abre em 55min')
})

test('os últimos 10 minutos andam de segundo em segundo', () => {
  const j = janelaDaAbertura(sp('2026-11-12T09:55:28'))!
  const c = contagemDaRegua(j, sp('2026-11-12T09:55:28').getTime(), '2026-11-12')
  assert.deepEqual([c.longo, c.curto, c.segundos], ['A bolsa abre em 4min32s', 'Abre em 4m32s', true])
  assert.equal(contagemDaRegua(j, sp('2026-11-12T09:59:01').getTime(), '2026-11-12').longo, 'A bolsa abre em 59s')
  assert.equal(contagemDaRegua(j, sp('2026-11-12T09:50:00').getTime(), '2026-11-12').longo, 'A bolsa abre em 10min') // ainda de minuto
  assert.equal(contagemDaRegua(j, sp('2026-11-12T09:50:05').getTime(), '2026-11-12').longo, 'A bolsa abre em 9min55s')
  assert.equal(contagemDaRegua(j, sp('2026-11-12T10:00').getTime(), '2026-11-12').longo, 'A bolsa abre agora')
})

test('sexta à noite: o fechamento de hoje e a barra; sem contagem', () => {
  const agora = sp('2026-11-06T19:00')
  assert.equal(estadoDoPregao(agora).estado, 'fechada')
  const f = fechamentoDaRegua(fixture as never, '2026-11-06')!
  assert.equal(`${f.antes} ${f.pct}${f.conta}${f.fato}`, 'A bolsa fechou: Ibovespa +1,39% · 59 de 76 subiram · o melhor dia do mês') // +1,39% é o maior dos 4 pregões de novembro
  assert.deepEqual([f.tom, f.curto], ['up', 'Fechou'])
  // a janela já aponta para segunda (a contagem não entra depois do fechamento, mas a conta existe)
  assert.equal(janelaDaAbertura(agora)!.dia, '2026-11-09')
  // o fechamento é só o de hoje: no dia seguinte, ou com o dado de ontem, nada de frase
  assert.equal(fechamentoDaRegua(fixture as never, '2026-11-07'), null)
  // a sequência vence o mês, como o título da home (3 ou mais)
  const seguidas = { ...fixture, seguidas: { n: 3, sentido: 'alta', ate: '2026-11-06' } }
  assert.equal(fechamentoDaRegua(seguidas as never, '2026-11-06')!.fato, ' · a 3ª alta seguida')
  // sem a contagem do /market/today, as próprias ações contam; mês sem confiança, sem o fato do mês
  const semContagem = { ...fixture, contagem: null, mes: { ...(fixture as { mes: object }).mes, confiavel: false } }
  const g = fechamentoDaRegua(semContagem as never, '2026-11-06')!
  assert.deepEqual([g.conta, g.fato], [' · 59 de 76 subiram', ''])
})

test('sábado: a barra do último pregão e a contagem para segunda', () => {
  const agora = sp('2026-11-07T12:00')
  assert.equal(estadoDoPregao(agora).estado, 'sem-pregao')
  const j = janelaDaAbertura(agora)!
  assert.equal(j.dia, '2026-11-09')
  assert.equal(j.fechouEm, Date.parse('2026-11-06T18:00:00-03:00'))
  const c = contagemDaRegua(j, agora.getTime(), '2026-11-07')
  assert.deepEqual([c.longo, c.curto, c.segundos], ['A bolsa abre na segunda, às 10h', 'Abre segunda, 10h', false])
  // a frase em partes (o dia em destaque) e a ponta da régua do relógio com o dia da abertura
  assert.deepEqual([c.partes, c.partesCurto, c.hoje, c.ponta], [['A bolsa abre', 'na segunda', ', às 10h'], ['Abre', 'segunda', ', 10h'], false, 'seg'])
  // domingo: amanhã
  assert.equal(contagemDaRegua(janelaDaAbertura(sp('2026-11-08T20:00'))!, sp('2026-11-08T20:00').getTime(), '2026-11-08').longo, 'A bolsa abre amanhã, às 10h')
})

test('véspera de feriado e o feriado: a próxima abertura pula a Consciência Negra', () => {
  // quinta, 19/11, depois do fechamento: a próxima abertura é segunda, 23/11 (20/11 é feriado)
  const vespera = sp('2026-11-19T19:00')
  assert.equal(estadoDoPregao(vespera).estado, 'fechada')
  assert.equal(janelaDaAbertura(vespera)!.dia, '2026-11-23')
  // sexta, 20/11, o feriado: barra e contagem, desde o fechamento de quinta
  const feriado = sp('2026-11-20T12:00')
  assert.equal(estadoDoPregao(feriado).estado, 'sem-pregao')
  const j = janelaDaAbertura(feriado)!
  assert.deepEqual([j.dia, j.fechouEm], ['2026-11-23', Date.parse('2026-11-19T18:00:00-03:00')])
  assert.equal(contagemDaRegua(j, feriado.getTime(), '2026-11-20').longo, 'A bolsa abre na segunda, às 10h')
  // Finados numa segunda: abre terça; e o pregão de antes de terça, 03/11, é sexta, 30/10
  assert.equal(contagemDaRegua(janelaDaAbertura(sp('2026-11-02T15:00'))!, sp('2026-11-02T15:00').getTime(), '2026-11-02').longo, 'A bolsa abre amanhã, às 10h')
  assert.equal(pregaoAnterior('2026-11-03'), '2026-10-30')
  // com a bolsa aberta não há contagem; sem o calendário do ano seguinte, também não
  assert.equal(janelaDaAbertura(sp('2026-11-12T14:00')), null)
  assert.equal(janelaDaAbertura(sp('2026-12-31T12:00')), null)
})

test('o ponteiro e o toque acham o pedaço pela posição na barra', () => {
  assert.equal(pedacoNaPosicao(pedacos, 0), 0)
  assert.equal(pedacoNaPosicao(pedacos, 99.999), 75)
  const vale = pedacos.findIndex((p) => p.ticker === 'VALE3')
  assert.equal(pedacoNaPosicao(pedacos, pedacos[vale]!.inicio + 0.01), vale)
  assert.equal(pedacoNaPosicao(pedacos, pedacos[vale]!.inicio + pedacos[vale]!.largura - 0.01), vale)
  assert.equal(pedacoNaPosicao([], 50), -1)
})

test('o estado no celular cabe numa palavra', () => {
  assert.equal(estadoCurto('antes', false), '10h')
  assert.equal(estadoCurto('aberta', false), 'Aberta')
  assert.equal(estadoCurto('fechada', false), 'Fechada')
  assert.equal(estadoCurto('sem-pregao', true), 'Feriado')
  assert.equal(estadoCurto('sem-pregao', false), 'Fechada')
})

test('quem assina: "Sua carteira +0,11% · tudo normal", com o selo da home numa regra só', () => {
  // a regra do selo que saiu do HomeAgoraFrase
  const normal = { titulo: 'Tudo normal.' }
  assert.deepEqual(seloDoDia(normal, false, false), { texto: 'Tudo normal', tom: 'verde' })
  assert.deepEqual(seloDoDia(normal, true, false), { texto: 'Pede atenção', tom: 'ambar' })
  assert.deepEqual(seloDoDia(normal, false, true), { texto: 'Pede atenção', tom: 'ambar' })
  assert.equal(seloDoDia({ titulo: 'Sua carteira caiu 3,10%.' }, false, false), null)
  assert.equal(seloDoDia(null, true, true), null)
  assert.deepEqual(legendaDaCarteira(0.11, { texto: 'Tudo normal', tom: 'verde' }), { numero: '+0,11%', estado: 'tudo normal', atencao: false, falada: 'Sua carteira, mais 0,11%, tudo normal.' })
  assert.deepEqual(legendaDaCarteira(-0.4, { texto: 'Pede atenção', tom: 'ambar' }), { numero: '−0,40%', estado: 'pede atenção', atencao: true, falada: 'Sua carteira, menos 0,40%, pede atenção.' })
  assert.equal(legendaDaCarteira(-3.1, null)!.estado, null) // dia forte: só o número, como a home fica só com a data
  assert.equal(legendaDaCarteira(null, null), null)
  // de ponta a ponta, com o /portfolio/today (o mesmo resumo da home): um papel com 10% da carteira caiu 6%
  const hoje = {
    as_of: '2026-11-06T18:30:00-03:00', price_dates: { today: '2026-11-06' },
    totals: { value_now: 100_000, value_d1: 100_600, day_change_amount: -600, day_change_pct: -0.6 },
    positions: [
      { ticker: 'PETR4', name: 'Petrobras', asset_class: 'STOCK', value_now: 10_000, day_change_amount: -640, day_change_pct: -6, flags: [] },
      { ticker: 'VALE3', name: 'Vale', asset_class: 'STOCK', value_now: 90_000, day_change_amount: 40, day_change_pct: 0.04, flags: [] },
    ],
    flags: [],
  }
  const dia = montarResumoDoDia({ today: hoje, posicoes: [], total: 100_000, ibov: null, income: null })
  const frases = frasesDoDia(dia, 'antes', quintaCedo)
  assert.equal(dia.alerta?.ticker, 'PETR4')
  assert.equal(legendaDaCarteira(dia.carteiraPct, seloDoDia(frases, !!dia.alerta, false))!.estado, 'pede atenção')
})

/* ————— a tinta do ticker contra a paleta do tokens.css ————— */
const s2lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const lin2s = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
const rgb = (h: string) => [0, 2, 4].map((i) => parseInt(h.replace('#', '').slice(i, i + 2), 16) / 255)
function oklab(h: string): number[] {
  const [r, g, b] = rgb(h).map(s2lin) as [number, number, number]
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
}
function deOklab([L, a, b]: number[]): number[] {
  const l = (L! + 0.3963377774 * a! + 0.2158037573 * b!) ** 3
  const m = (L! - 0.1055613458 * a! - 0.0638541728 * b!) ** 3
  const s = (L! - 0.0894841775 * a! - 1.291485548 * b!) ** 3
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map((c) => Math.max(0, Math.min(1, lin2s(c))))
}
const luminancia = (c: number[]) => 0.2126 * s2lin(c[0]!) + 0.7152 * s2lin(c[1]!) + 0.0722 * s2lin(c[2]!)
const contraste = (a: number[], b: number[]) => { const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p); return (x! + 0.05) / (y! + 0.05) }

test('a tinta do ticker é a que mais contrasta com o fundo, na paleta do tokens.css', () => {
  const tokens = ler('app/assets/css/tokens.css')
  const hex = (nome: string) => tokens.match(new RegExp(`--${nome}:\\s*(#[0-9A-Fa-f]{6})`))?.[1]
  const tinta = { escura: rgb(hex('nu-ink')!), clara: rgb(hex('nu-white')!) }
  for (const lado of ['alta', 'queda'] as const) {
    const forte = hex(`nu-mapa-${lado}`)
    const claro = hex(`nu-mapa-${lado}-claro`)
    assert.ok(forte && claro, `--nu-mapa-${lado}`)
    const [A, B] = [oklab(forte), oklab(claro)]
    for (let i = 0; i <= 100; i++) {
      const t = i / 100
      // color-mix(in oklab, forte t, claro): o fundo que o componente pinta
      const fundo = deOklab(A.map((v, k) => v * t + B[k]! * (1 - t)))
      const escolhida = tintaDoPedaco(lado, t)
      const outra = escolhida === 'clara' ? 'escura' : 'clara'
      assert.ok(contraste(tinta[escolhida], fundo) >= contraste(tinta[outra], fundo), `${lado} força ${t}: ${escolhida}`)
    }
  }
  assert.deepEqual(TINTA_CLARA_DESDE, { alta: 0.75, queda: 0.63 })
  assert.match(tokens, /--nu-mapa-zero: #E6DCCD;/)
})

test('o componente: a barra é um elemento só, sem link, e veste só token', () => {
  const sfc = ler('app/components/nu/topo/NuReguaBolsa.vue')
  const tela = sfc.slice(sfc.indexOf('<template>'), sfc.lastIndexOf('</template>')).replace(/<!--[\s\S]*?-->/g, '')
  assert.equal((tela.match(/role="application"/g) ?? []).length, 1)
  const barra = tela.slice(tela.indexOf('class="nrb__barra"'), tela.indexOf(':id="idAjuda"'))
  assert.match(barra, /:aria-label="rotuloDaBarra"/)
  assert.match(barra, /class="nrb__faixa" aria-hidden="true"/)
  assert.match(barra, /class="nrb__marcas" aria-hidden="true"/)
  assert.doesNotMatch(barra, /<a\b|<NuxtLink|href=/) // os pedaços não são links (nem 76 paradas de Tab)
  assert.match(tela, /aria-live="polite"/)
  // o "B3 · 15 min" saiu da linha (12/11/2026, o dono): o aviso está no pé da dica e no aria-label
  assert.doesNotMatch(tela, /15 min|B3 · /)
  assert.match(tela, /<p v-if="legenda" class="nrb__dica-nota">\{\{ legenda\.nota \}\}<\/p>/)
  assert.match(sfc, /rotuloDe\(legenda\.value, quantasSuas\.value\)/)
  // as ações da pessoa: a listra mora dentro do pedaço (12/11/2026, o dono: "essas bolinhas não são
  // legais"), na tinta do ticker; a amostra dela é a legenda ("Sua carteira") e está na dica
  assert.match(barra, /'nrb__pedaco--seu': tickers\.has\(p\.ticker\)/)
  assert.doesNotMatch(tela, /nrb__marca\b/)
  assert.match(tela, /<i v-if="quantasSuas" class="nrb__amostra" aria-hidden="true" \/><span class="nrb__t-longo nrb__t-medio">Sua carteira <\/span>/)
  assert.match(tela, /class="nrb__dica-sua"><i class="nrb__amostra" aria-hidden="true" \/>Na sua carteira/)
  // a cena principal do palco: a fase (fora de cena, com os textos, larga) e a cascata a cada entrada
  assert.match(sfc, /fase: 'oculta' \| 'textos' \| 'larga'/)
  assert.match(sfc, /:key="`f\$\{ciclo\}`" class="nrb__faixa"/)
  for (const k of ['ArrowRight', 'ArrowLeft', 'Home', 'End', 'Enter', 'Escape']) assert.match(sfc, new RegExp(`'${k}'`), k)
  assert.match(sfc, /espiar\.abrir\(p\.ticker, barra\.value\)/)
  assert.match(sfc, /navigateTo\(destino\)/)
  const css = sfc.slice(sfc.indexOf('<style')).replace(/\/\*[\s\S]*?\*\//g, '')
  assert.match(css, /\.nrb--larga \.nrb__lado \{[^}]*opacity: 0; visibility: hidden;/)
  // a barra cresce devagar, na curva que chega, e o rótulo do pedaço aparece em fade (não estala)
  assert.match(css, /width var\(--nu-dur-entrada\) var\(--nu-ease-saida\)/)
  assert.match(css, /@container \(min-width: 62px\) \{ \.nrb__rotulo \{ opacity: 1; \} \}/)
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, 'cor em hex')
  assert.doesNotMatch(css, /font-weight:\s*\d/, 'peso em número')
  assert.doesNotMatch(css, /cubic-bezier|\b\d+(\.\d+)?m?s\s+(ease|linear)/, 'curva ou tempo à mão')
  assert.match(css, /prefers-reduced-motion: reduce/)
  assert.match(css, /\.nrb__pedaco::before \{[^}]*repeating-linear-gradient\(135deg, color-mix\(in srgb, currentColor/)
  assert.match(css, /\.nrb__pedaco--seu::before \{ opacity: 1; \}/)
})

test('o palco: troca a cada minuto, pausa no mouse, no foco e na aba escondida, e não anuncia a troca', () => {
  const palco = ler('app/components/nu/topo/NuReguaPalco.vue')
  assert.match(palco, /@pointerenter="sobre = true" @pointerleave="sobre = false" @focusin="aoFocar" @focusout="aoDesfocar"/)
  assert.match(palco, /const pausado = computed\(\(\) => sobre\.value \|\| dentro\.value \|\| escondida\.value\)/)
  assert.match(palco, /visibilitychange/)
  assert.match(palco, /aria-live="off"/)
  assert.doesNotMatch(palco, /aria-live="(polite|assertive)"/)
  // a que sai desce e some, a que entra sobe 6px, na curva de mudar de lugar
  // um letreiro que rola: a que entra vem de baixo, a que sai sobe; as duas desfocam
  assert.match(palco, /\.nrp__cena:not\(\.nrp__cena--ativa\) \{ opacity: 0; transform: translateY\(8px\); filter: blur\(3px\);/)
  assert.match(palco, /\.nrp__cena--saindo:not\(\.nrp__cena--ativa\) \{ transform: translateY\(-8px\);/)
  assert.match(palco, /transition: opacity var\(--nu-dur-entrada\) var\(--nu-ease-cor\), transform var\(--nu-dur-entrada\) var\(--nu-ease-saida\), filter/)
  assert.match(palco, /prefers-reduced-motion: reduce/)
  const css = palco.slice(palco.indexOf('<style')).replace(/\/\*[\s\S]*?\*\//g, '')
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, 'cor em hex')
  assert.doesNotMatch(css, /font-weight:\s*\d/, 'peso em número')
  assert.doesNotMatch(css, /cubic-bezier|\b\d+(\.\d+)?m?s\s+(ease|linear)/, 'curva ou tempo à mão')
})

test('a régua: o /assinar segue vendendo, o dev força o estado e nada da carteira sai do cliente', () => {
  const regua = ler('app/components/nu/NuMarketTicker.vue')
  assert.match(regua, /const vendendo = computed\(\(\) => route\.path === '\/assinar'\)/)
  assert.match(regua, /'Nubank, Itaú, XP e mais de 100 bancos e corretoras'/)
  assert.match(regua, /const consulta = import\.meta\.dev \? useRoute\(\)\.query : \{\}/)
  for (const q of ['regua-estado', 'regua-agora', 'regua-cena']) assert.match(regua, new RegExp(`import\\.meta\\.dev \\? String\\(consulta\\['${q}'\\]`), q)
  assert.match(regua, /<NuReguaPalco\s/)
  // a home e a régua dividem a consulta dos avisos e a regra do selo
  const home = ler('app/components/home/HomeAgoraFrase.vue')
  assert.match(home, /useAvisoDaCarteira\(\)/)
  assert.match(home, /seloDoDia\(frases\.value, !!dia\.value\?\.alerta, avisoDoMotor\.value\)/)
  assert.doesNotMatch(home, /\/me\/carteira\/visao'/)
  for (const p of ['app/composables/useAvisoDaCarteira.ts', 'app/composables/useCarteiraNoTopo.ts', 'app/composables/useReguaDaBolsa.ts']) {
    const src = ler(p)
    assert.match(src, /if \(!import\.meta\.client/, `${p}: só no cliente`)
    assert.doesNotMatch(src, /useState<[^>]*>\('[^']*token/i, `${p}: o token não vai para o estado`)
  }
  // a barra que gruda embaixo da régua usa a altura que ela publica
  assert.match(ler('app/components/teses/TesesGrade.vue'), /top: calc\(var\(--nuh-h, 72px\) \+ var\(--nut-h, 44px\) - 1px\)/)
})

test('o relógio do dev: 9h, 14h e 19h do pregão de hoje (ou do próximo) e o próximo feriado num dia útil', () => {
  const quinta = '2026-11-12'
  assert.deepEqual(relogioDoDev('pre', quinta), { agora: sp('2026-11-12T09:00:00'), dataDeHoje: false })
  assert.deepEqual(relogioDoDev('aberta', quinta), { agora: sp('2026-11-12T14:00:00'), dataDeHoje: true })
  assert.deepEqual(relogioDoDev('fechada', quinta), { agora: sp('2026-11-12T19:00:00'), dataDeHoje: true })
  // sábado: o próximo pregão é segunda
  assert.deepEqual(relogioDoDev('aberta', '2026-11-14'), { agora: sp('2026-11-16T14:00:00'), dataDeHoje: true })
  // o feriado: Consciência Negra, sexta 20/11
  assert.deepEqual(relogioDoDev('feriado', quinta), { agora: sp('2026-11-20T12:00:00'), dataDeHoje: false })
  assert.equal(relogioDoDev('qualquer', quinta), null)
})

test('a vitrine do dev e a barra mais alta: os modos lado a lado, o esqueleto com a medida da barra', () => {
  const vitrine = ler('app/pages/dev/regua.vue')
  // só no dev: a rota sai do build (pages:extend) e o middleware devolve 404
  assert.match(vitrine, /if \(!import\.meta\.dev\) return abortNavigation\(createError\(\{ statusCode: 404/)
  assert.match(vitrine, /robots: 'noindex, nofollow'/)
  for (const c of ["cena: 'contagem'", "cena: 'fechamento'", "fase: 'textos'", "fase: 'larga'", "m: 'feriado'", "peca: 'esqueleto'"]) assert.ok(vitrine.includes(c), c)
  assert.match(vitrine, /<NuReguaEsqueleto/)
  assert.match(vitrine, /:visitante="l\.visitante"/)
  assert.match(vitrine, /palco\?\.proxima\(\)/)
  assert.match(vitrine, /src="\/dev\/regua\?so=linhas"/)
  // o palco abre a troca de cena para a vitrine; a régua do site usa o mesmo relógio do dev
  assert.match(ler('app/components/nu/topo/NuReguaPalco.vue'), /defineExpose\(\{ proxima, doComeco: \(\) => entrar\(0\) \}\)/)
  const ticker = ler('app/components/nu/NuMarketTicker.vue')
  assert.match(ticker, /relogioDoDev\(forcado\)/)
  assert.match(ticker, /<NuReguaEsqueleto v-if="modo === 'esqueleto'" \/>/)
  // a barra: 28px na linha de 44 (22 na de 36, no celular), e o esqueleto na mesma medida
  const barra = ler('app/components/nu/topo/NuReguaBolsa.vue')
  const esq = ler('app/components/nu/topo/NuReguaEsqueleto.vue')
  assert.match(barra, /\.nrb__barra \{\n  position: relative; flex: 1 1 auto; min-width: 48px; height: 28px;/)
  assert.match(barra, /\.nrb__barra::before \{ content: ''; position: absolute; inset: -8px 0; \}/)
  assert.match(barra, /\.nrb__barra \{ height: 22px; min-width: 40px; \}/)
  assert.match(esq, /<NuSkeleton variant="block" height="28px"/)
  assert.match(esq, /\.nre__barra \{ height: 22px !important;/)
  assert.match(ticker, /height: 44px;/)
  assert.match(ticker, /\.nut-regua--mapa, \.nut-regua--esqueleto \{ height: 36px; \}/)
  // o visitante mesmo com sessão (a vitrine): sem a listra, sem "Sua carteira" e sem buscar a carteira
  assert.match(barra, /const tickers = computed\(\(\) => new Set\(props\.visitante \? \[\] :/)
  assert.match(barra, /if \(props\.visitante \|\| !frases\.value\) return null/)
  assert.match(barra, /reservar\.value = !props\.visitante && isAuthenticated\.value/)
})

test('a régua do relógio: a janela termina na abertura e dá zoom conforme ela chega', () => {
  const de = (iso: string) => { const a = sp(iso); return reguaDoRelogio(janelaDaAbertura(a)!, a.getTime()) }
  // de madrugada: as últimas 12 horas, de hora em hora, com um horário escrito a cada 3
  const madrugada = de('2026-11-12T00:30')
  assert.deepEqual([madrugada.escala, madrugada.inicio, madrugada.pedacos.length, madrugada.agulha], ['12h', Date.parse('2026-11-11T22:00:00-03:00'), 12, 0.20833])
  assert.deepEqual(madrugada.marcas, [{ x: 0.16667, rotulo: '0h' }, { x: 0.41667, rotulo: '3h' }, { x: 0.66667, rotulo: '6h' }]) // o "9h" ficaria colado na ponta
  // o zoom entra quando a agulha tem 15% da janela para trás: às 7h26 ainda são as 12 horas; às 7h27, as 3
  assert.equal(FOLGA_DA_AGULHA, 0.85)
  assert.equal(de('2026-11-12T07:26').escala, '12h')
  assert.deepEqual([de('2026-11-12T07:27').escala, de('2026-11-12T07:27').agulha], ['3h', 0.15])
  // de manhã: 3 horas de 15 em 15 minutos; o que falta vai do azul claro ao cobalto
  const nove = de('2026-11-12T09:00')
  assert.deepEqual([nove.escala, nove.agulha, nove.pedacos.length], ['3h', 0.66667, 12])
  assert.deepEqual(nove.marcas, [{ x: 0, rotulo: '7h' }, { x: 0.33333, rotulo: '8h' }, { x: 0.66667, rotulo: '9h' }])
  assert.deepEqual([nove.pedacos[0], nove.pedacos[11]], [{ x: 0, largura: 0.08333, forca: 0.1475 }, { x: 0.91667, largura: 0.08333, forca: 0.7525 }])
  // a última hora de 5 em 5; os últimos 15 minutos de minuto em minuto
  assert.equal(de('2026-11-12T09:08').escala, '3h')
  assert.deepEqual([de('2026-11-12T09:09').escala, de('2026-11-12T09:09').agulha], ['1h', 0.15])
  assert.deepEqual(de('2026-11-12T09:30').marcas.map((m) => m.rotulo), ['9h', '9h15', '9h30', '9h45'])
  const fim = de('2026-11-12T09:52')
  assert.deepEqual([fim.escala, fim.pedacos.length, fim.agulha, fim.marcas.map((m) => m.rotulo)], ['15min', 15, 0.46667, ['9h45', '9h50', '9h55']])
  // na hora da abertura a agulha chega à ponta
  assert.equal(reguaDoRelogio({ abreEm: Date.parse('2026-11-12T10:00:00-03:00'), fechouEm: null }, Date.parse('2026-11-12T10:00:03-03:00')).agulha, 1)
  // em toda escala: os pedaços cobrem a janela, a força fica na rampa e nenhum horário cola na ponta
  for (const q of ['2026-11-12T00:30', '2026-11-12T08:10', '2026-11-12T09:30', '2026-11-12T09:58', '2026-11-14T12:00', '2026-11-20T12:00', '2026-12-24T19:00']) {
    const r = de(q)
    assert.ok(Math.abs(r.pedacos.reduce((t, p) => t + p.largura, 0) - 1) < 1e-3, `${q}: os pedaços somam a janela`)
    for (const p of r.pedacos) assert.ok(p.largura > 0 && p.forca >= FORCA_DO_RELOGIO.de && p.forca <= FORCA_DO_RELOGIO.ate, `${q}: pedaço ${p.x}`)
    for (const m of r.marcas) assert.ok(m.x >= 0 && m.x <= ROTULO_DO_RELOGIO_ATE, `${q}: ${m.rotulo}`)
    assert.ok(r.agulha >= 0 && r.agulha <= 1, q)
  }
})

test('a régua do relógio com a bolsa fechada por dias: o tempo fechado inteiro, com os dias escritos', () => {
  const de = (iso: string) => { const a = sp(iso); return reguaDoRelogio(janelaDaAbertura(a)!, a.getTime()) }
  // sábado ao meio-dia: de sexta às 18h até segunda às 10h (64 h), de 6 em 6 horas
  const sabado = de('2026-11-14T12:00')
  assert.deepEqual([sabado.escala, sabado.inicio, sabado.agulha, sabado.pedacos.length], ['fechada', Date.parse('2026-11-13T18:00:00-03:00'), 0.28125, 11])
  // os pedaços caem no relógio de parede: o primeiro vai das 18h à meia-noite; o último, das 6h às 10h
  assert.deepEqual([sabado.pedacos[0]!.largura, sabado.pedacos[10]!.largura], [0.09375, 0.0625])
  // os dias no começo de cada um; o da abertura já está na ponta ("seg"), e a sexta, com 6 horas, não ganha nome
  assert.deepEqual(sabado.marcas, [{ x: 0.09375, rotulo: 'sáb' }, { x: 0.46875, rotulo: 'dom' }])
  // o feriado de sexta (Consciência Negra): de quinta às 18h até segunda às 10h
  assert.deepEqual(de('2026-11-20T12:00').marcas.map((m) => m.rotulo), ['sex', 'sáb', 'dom'])
  // mais de 4 dias fechada (o Natal de 2026): de 12 em 12 horas
  const natal = de('2026-12-24T19:00')
  assert.deepEqual([natal.escala, natal.pedacos.length, natal.marcas.map((m) => m.rotulo)], ['fechada', 10, ['qui', 'sex', 'sáb', 'dom']])
  // segunda de madrugada a abertura é hoje: volta o zoom das horas
  assert.equal(de('2026-11-16T05:00').escala, '12h')
  // sem o último fechamento (o calendário não alcança): 3 dias até a abertura
  const sem = reguaDoRelogio({ abreEm: Date.parse('2026-11-16T10:00:00-03:00'), fechouEm: null }, Date.parse('2026-11-14T12:00:00-03:00'))
  assert.deepEqual([sem.escala, sem.inicio, sem.marcas.map((m) => m.rotulo)], ['fechada', Date.parse('2026-11-13T10:00:00-03:00'), ['sex', 'sáb', 'dom']])
})

test('a régua do relógio veste a paleta: o carvão lê em toda a rampa do azul, o branco no cobalto e o cinza na areia', () => {
  const tokens = ler('app/assets/css/tokens.css')
  const hex = (nome: string) => tokens.match(new RegExp(`--${nome}:\\s*(#[0-9A-Fa-f]{6})`))?.[1]
  const [cobalto, claro, carvao, branco, cinza, areia] = ['nu-blue', 'nu-blue-pale', 'nu-ink', 'nu-white', 'nu-gray', 'nu-mapa-zero'].map((n) => hex(n)!)
  const [A, B] = [oklab(cobalto), oklab(claro)]
  // color-mix(in oklab, --nu-blue f, --nu-blue-pale): o fundo de cada pedaço que falta
  for (let i = 0; i <= 100; i++) {
    const f = FORCA_DO_RELOGIO.de + ((FORCA_DO_RELOGIO.ate - FORCA_DO_RELOGIO.de) * i) / 100
    const fundo = deOklab(A.map((v, k) => v * f + B[k]! * (1 - f)))
    assert.ok(contraste(rgb(carvao), fundo) >= 4.5, `o carvão sobre o azul de força ${f.toFixed(3)}`)
  }
  assert.ok(contraste(rgb(branco), rgb(cobalto)) >= 4.5, 'o branco da ponta sobre o cobalto')
  assert.ok(contraste(rgb(cinza), rgb(areia)) >= 4.5, 'o cinza dos horários que passaram sobre a areia')
  const peca = ler('app/components/nu/topo/NuReguaRelogio.vue')
  assert.match(peca, /background-color: color-mix\(in oklab, var\(--nu-blue\) var\(--f, 50%\), var\(--nu-blue-pale\)\);/)
  assert.match(peca, /\.nrr__passou \{\n  position: absolute; inset: 0; background: var\(--nu-mapa-zero\); color: var\(--nu-gray\);/)
  assert.match(peca, /\.nrr__ponta \{[^}]*background: var\(--nu-blue\); color: var\(--nu-white\);/)
  // no nível da barra: a mesma altura (28px; 22 no celular) e o mesmo raio
  assert.match(peca, /\.nrr \{\n  --nrr-raio: var\(--nu-r-tag-p\);\n  position: relative; flex: 1 1 auto; min-width: 48px; height: 28px;/)
  assert.match(peca, /\.nrr \{ height: 22px; min-width: 40px; \}/)
  // decorativa (a frase ao lado diz o mesmo), sem hex, sem peso em número, sem curva ou tempo à mão
  assert.match(peca, /<span class="nrr" :class="\{ 'nrr--ativa': ativa, 'nrr--vivo': vivo \}" aria-hidden="true">/)
  const css = peca.slice(peca.indexOf('<style')).replace(/\/\*[\s\S]*?\*\//g, '')
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, 'cor em hex')
  assert.doesNotMatch(css, /font-weight:\s*\d/, 'peso em número')
  assert.doesNotMatch(css, /font-size:\s*\d/, 'tamanho de letra fora da escala')
  assert.doesNotMatch(css, /cubic-bezier|\b\d+(\.\d+)?m?s\s+(ease|linear)/, 'curva ou tempo à mão')
  assert.match(css, /prefers-reduced-motion: reduce/)
  // o palco entrega a régua e a frase em partes; o lugar da frase mais comprida vem reservado
  const palco = ler('app/components/nu/topo/NuReguaPalco.vue')
  assert.match(palco, /<NuReguaRelogio v-if="reguaDoTempo" :regua="reguaDoTempo" :ponta="contagem\.ponta" :ativa="cena === 'contagem'" :vivo="contagem\.segundos" \/>/)
  assert.match(palco, /<b class="nrp__valor">\{\{ contagem\.partes\[1\] \}\}<\/b>/)
  assert.match(palco, /<span v-if="contagem\.hoje" class="nrp__fantasma" aria-hidden="true">/)
  assert.doesNotMatch(palco, /nrp__linha|nrp__cheia|nrp__hora/)
})
