/**
 * A /carteira nova de verdade (07/11/2026): as contas pequenas do imposto do
 * mês (utils/impostoVisao.ts), do relatório (utils/relatorioCarteira.ts), do
 * tópico de cada detector (utils/avisosCanais.ts) e da flag do servidor.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { impostoMock, relatorioMock, visaoMock } from '../app/dev/carteiraVisaoMock.ts'
import { visaoDesligada } from '../app/utils/carteiraVisao.ts'
import {
  diaMes, fraseDoMes, gruposEmOrdem, linhaDoGrupo, linhaDoMesAnterior, mascararNota, mesCurto, mesEAno, mesesEmOrdem, nomeDoMes, quantidadeDaOperacao,
  selosDasVendas, textoDoGrupo, vendasCurtas,
} from '../app/utils/impostoVisao.ts'
import { composicaoTxt, fraseDaNota, indicadoresPorPilar, mediana, periodoTxt, valorDoIndicador } from '../app/utils/relatorioCarteira.ts'
import { TOPICOS_CARTEIRA, temOptInWhatsapp, topicoDoDetector, topicosDosAvisos } from '../app/utils/avisosCanais.ts'
import type { GrupoImpostoVisao, MesImposto } from '../app/types/carteiraVisao.ts'

const grupo = (g: Partial<GrupoImpostoVisao> & Pick<GrupoImpostoVisao, 'grupo'>): GrupoImpostoVisao => ({
  vendido: 0, lucro: 0, isencao: null, cabeAinda: null, impostoEstimado: 0, aliquota: 0.15, custoConhecido: true, nota: 'regra', ...g,
})
const mes = (grupos: GrupoImpostoVisao[], darf: MesImposto['darf'] = { valor: null, vence: null, codigo: '6015' }): MesImposto => ({ mes: '2026-11', grupos, darf })

test('o mês por extenso, curto e com o ano; o dia do vencimento', () => {
  assert.equal(nomeDoMes('2026-11'), 'novembro')
  assert.equal(nomeDoMes('2026-03'), 'março')
  assert.equal(mesCurto('2026-03'), 'mar')
  assert.equal(mesCurto('2025-12'), 'dez')
  assert.equal(mesEAno('2026-02'), 'fevereiro de 2026')
  assert.equal(diaMes('2026-12-30'), '30/12')
})

test('a frase grande do mês', () => {
  const normal = impostoMock('normal').mesAtual
  assert.equal(fraseDoMes(normal), 'Em novembro você ainda pode vender R$ 1.300 em ações sem imposto.')
  assert.equal(fraseDoMes(impostoMock('calmo').mesAtual), 'Novembro sem imposto até agora.')
  // o R$ da pessoa passa pela máscara do olho; o teto da regra, não
  assert.equal(fraseDoMes(normal, () => 'R$ ••••'), 'Em novembro você ainda pode vender R$ •••• em ações sem imposto.')
  const passou = mes([grupo({ grupo: 'acoes', vendido: 23000, lucro: 3000, isencao: 20000, cabeAinda: 0, impostoEstimado: 450 })], { valor: 450, vence: '2026-12-30', codigo: '6015' })
  assert.equal(fraseDoMes(passou), 'Em novembro, as vendas de ações passaram dos R$ 20 mil isentos.')
  assert.equal(fraseDoMes(passou, () => 'R$ ••••'), 'Em novembro, as vendas de ações passaram dos R$ 20 mil isentos.')
  const noLimite = mes([grupo({ grupo: 'acoes', vendido: 20000, isencao: 20000, cabeAinda: 0 })])
  assert.equal(fraseDoMes(noLimite), 'Em novembro, as vendas de ações chegaram aos R$ 20 mil isentos.')
  const soFii = mes([grupo({ grupo: 'acoes', isencao: 20000, cabeAinda: 20000 }), grupo({ grupo: 'fii', vendido: 6180, lucro: 412, impostoEstimado: 82.4, aliquota: 0.2 })], { valor: 82.4, vence: '2026-12-30', codigo: '6015' })
  assert.equal(fraseDoMes(soFii), 'Em novembro, o imposto estimado é de R$ 82.')
  const semCusto = mes([grupo({ grupo: 'fii', vendido: 5000, lucro: null, impostoEstimado: null, custoConhecido: false, aliquota: 0.2 })])
  assert.equal(fraseDoMes(semCusto), 'Em novembro, falta o custo de uma venda para eu fechar a conta.')
  const prejuizo = mes([grupo({ grupo: 'fii', vendido: 4000, lucro: -300, impostoEstimado: 0, aliquota: 0.2 })])
  assert.equal(fraseDoMes(prejuizo), 'Novembro sem imposto até agora.')
})

test('a nota cinza: o mês anterior numa frase', () => {
  assert.equal(linhaDoMesAnterior(impostoMock('normal').mesAnterior), 'Outubro ficou isento, com R$ 12.400 em vendas.')
  const comDarf: MesImposto = { mes: '2026-10', grupos: [grupo({ grupo: 'fii', vendido: 6000, lucro: 410, impostoEstimado: 82, aliquota: 0.2 })], darf: { valor: 82, vence: '2026-11-30', codigo: '6015' } }
  assert.equal(linhaDoMesAnterior(comDarf), 'O DARF de outubro, de R$ 82, vence em 30/11.')
  assert.equal(linhaDoMesAnterior({ mes: '2026-10', grupos: [grupo({ grupo: 'acoes', isencao: 20000, cabeAinda: 20000 })], darf: { valor: null, vence: null, codigo: '6015' } }), 'Outubro sem venda.')
})

test('uma linha por grupo: a barra das ações, a do lucro, a renda fixa e o custo desconhecido', () => {
  const [acoes, fii, etf, rf] = gruposEmOrdem(impostoMock('normal').mesAtual.grupos)
  const la = linhaDoGrupo(acoes!, '2026-11')
  assert.equal(la.direita, 'R$ 18.700 de R$ 20 mil')
  assert.equal(la.texto, 'Ainda cabem R$ 1.300 em vendas sem imposto.')
  assert.deepEqual(la.barra, { tipo: 'isencao', pct: 93.5, passou: false })
  const lf = linhaDoGrupo(fii!, '2026-11')
  assert.equal(lf.direita, 'R$ 82 de imposto')
  assert.equal(lf.texto, 'Vendeu R$ 6.180, com R$ 412 de lucro.')
  assert.deepEqual(lf.barra, { tipo: 'lucro', impostoPct: 20 })
  assert.deepEqual(linhaDoGrupo(etf!, '2026-11'), { nome: 'ETF', direita: 'Sem venda', texto: '', barra: null, semCusto: false })
  const lr = linhaDoGrupo(rf!, '2026-11')
  assert.equal(lr.direita, 'Retido na fonte')
  assert.equal(lr.texto, 'Sem resgate em novembro.')
  assert.equal(lr.barra, null)
  const semCusto = linhaDoGrupo(grupo({ grupo: 'acoes', vendido: 25000, lucro: null, isencao: 20000, cabeAinda: 0, impostoEstimado: null, custoConhecido: false }), '2026-11')
  assert.equal(semCusto.semCusto, true)
  assert.equal(semCusto.texto, 'Passou da isenção. Sem o custo, eu não sei o lucro.')
  assert.deepEqual(semCusto.barra, { tipo: 'isencao', pct: 100, passou: true })
  assert.equal(linhaDoGrupo(grupo({ grupo: 'etf', vendido: 9000, lucro: null, impostoEstimado: null, custoConhecido: false }), '2026-11').direita, 'Lucro a conferir')
  assert.equal(linhaDoGrupo(grupo({ grupo: 'acoes', isencao: 20000, cabeAinda: 20000 }), '2026-11').texto, 'Cabem R$ 20 mil em vendas sem imposto.')
})

/* a resposta real do /me/carteira/visao (fixture do dono, 07/11/2026): outubro e novembro como o backend mandou */
const OUTUBRO_REAL: MesImposto = {
  mes: '2026-10',
  grupos: [
    {
      grupo: 'acoes', vendido: 7.87, lucro: null, isencao: 20000, cabeAinda: 19992.13, impostoEstimado: 0, aliquota: 0.15, custoConhecido: false,
      nota: 'Vendido R$ 7,87 de R$ 20 mil isentos; ainda cabe R$ 19.992,13. R$ 7,87 das vendas têm o custo desconhecido, mas o mês é isento. O prejuízo a abater conta só as vendas desde 08/2021, o começo do histórico que eu tenho.',
    },
    {
      grupo: 'rf', vendido: 333.39, lucro: null, isencao: null, cabeAinda: null, impostoEstimado: null, aliquota: 0.15, custoConhecido: true,
      nota: 'O imposto da renda fixa (Tesouro, CDB, ETF de renda fixa) é retido na fonte, de 22,5% a 15% pelo prazo: não entra no DARF.',
    },
  ],
  darf: { valor: null, vence: null, codigo: '6015' },
}
const NOVEMBRO_REAL: MesImposto = {
  mes: '2026-11',
  grupos: [{ grupo: 'acoes', vendido: 0, lucro: 0, isencao: 20000, cabeAinda: 20000, impostoEstimado: 0, aliquota: 0.15, custoConhecido: true, nota: 'Sem venda de ações no mês: cabem os R$ 20 mil inteiros.' }],
  darf: { valor: null, vence: null, codigo: '6015' },
}

test('resposta real: ações isentas sem o custo fecham o mês (o selo é isento, e a frase não diz que faltou o custo)', () => {
  assert.equal(linhaDoMesAnterior(OUTUBRO_REAL), 'Outubro ficou isento, com R$ 341 em vendas.')
  const acoes = linhaDoGrupo(OUTUBRO_REAL.grupos[0]!, '2026-10')
  assert.equal(acoes.semCusto, false, 'sem o selo âmbar: o mês é isento de qualquer jeito')
  assert.equal(fraseDoMes(NOVEMBRO_REAL), 'Novembro sem imposto até agora.')
  // quando o custo faz falta (passou da isenção), o backend manda o imposto null, e aí falta mesmo
  const passou = mes([grupo({ grupo: 'acoes', vendido: 23000, lucro: null, isencao: 20000, cabeAinda: 0, impostoEstimado: null, custoConhecido: false })])
  assert.equal(linhaDoGrupo(passou.grupos[0]!, '2026-11').semCusto, true)
  assert.equal(linhaDoMesAnterior({ ...passou, mes: '2026-10' }), 'Em outubro, faltou o custo de uma venda para fechar a conta.')
})

test('resposta real: a linha do grupo é a nota do backend, sem a frase da tela repetida antes dela', () => {
  const [g] = NOVEMBRO_REAL.grupos
  assert.equal(textoDoGrupo(g!, linhaDoGrupo(g!, '2026-11')), 'Sem venda de ações no mês: cabem os R$ 20 mil inteiros.')
  const [acoes, rf] = OUTUBRO_REAL.grupos
  assert.equal(textoDoGrupo(acoes!, linhaDoGrupo(acoes!, '2026-10')), acoes!.nota)
  // a renda fixa: o resgate (que a nota não diz) e a regra da retenção (que a nota diz)
  assert.equal(textoDoGrupo(rf!, linhaDoGrupo(rf!, '2026-10')), `R$ 333 em resgates. ${rf!.nota}`)
  // FII e ETF: a nota diz o vendido e a alíquota; a tela põe o lucro
  const fii = grupo({ grupo: 'fii', vendido: 6180, lucro: 412, impostoEstimado: 82.4, aliquota: 0.2, nota: 'FII: R$ 6.180,00 vendidos, sem isenção; o lucro paga 20%.' })
  assert.equal(textoDoGrupo(fii, linhaDoGrupo(fii, '2026-11')), 'FII: R$ 6.180,00 vendidos, sem isenção; o lucro paga 20%. O lucro foi de R$ 412.')
  // sem nota, a frase da tela
  const semNota = grupo({ grupo: 'acoes', isencao: 20000, cabeAinda: 20000, nota: '' })
  assert.equal(textoDoGrupo(semNota, linhaDoGrupo(semNota, '2026-11')), 'Cabem R$ 20 mil em vendas sem imposto.')
  // o olho fechado: o R$ da pessoa some, o da regra fica
  const escondido = textoDoGrupo(acoes!, linhaDoGrupo(acoes!, '2026-10', () => 'R$ ••••'), () => 'R$ ••••', mascararNota)
  assert.equal(escondido, 'Vendido R$ •••• de R$ 20 mil isentos; ainda cabe R$ ••••. R$ •••• das vendas têm o custo desconhecido, mas o mês é isento. O prejuízo a abater conta só as vendas desde 08/2021, o começo do histórico que eu tenho.')
  assert.equal(mascararNota('Imposto de R$ 8,50, abaixo dos R$ 10 do DARF mínimo: soma ao do mês seguinte.'), 'Imposto de R$ ••••, abaixo dos R$ 10 do DARF mínimo: soma ao do mês seguinte.')
  assert.equal(mascararNota('Vendido R$ 20.000,00 de R$ 20 mil isentos.'), 'Vendido R$ •••• de R$ 20 mil isentos.')
})

test('resposta real: a quantidade da operação só quando diz alguma coisa', () => {
  // direito de subscrição: a corretora não manda a quantidade
  assert.equal(quantidadeDaOperacao({ ticker: 'XPML12', quantidade: null, grupo: 'acoes' }), null)
  // CDB do Open Finance: a "quantidade" é o valor de face em centavos
  assert.equal(quantidadeDaOperacao({ ticker: 'RF-952BD7D6', quantidade: 9000.2748557, grupo: 'rf' }), null)
  // o ETF de renda fixa é em cotas, o Tesouro em títulos; uma é singular
  assert.equal(quantidadeDaOperacao({ ticker: 'AUPO11', quantidade: 39, grupo: 'rf' }), '39 cotas')
  assert.equal(quantidadeDaOperacao({ ticker: 'AUPO11', quantidade: 1, grupo: 'rf' }), '1 cota')
  assert.equal(quantidadeDaOperacao({ ticker: 'BRSTNCNTB476', quantidade: 0.37, grupo: 'rf' }), '0,37 títulos')
  assert.equal(quantidadeDaOperacao({ ticker: 'BBSE3', quantidade: 50, grupo: 'acoes' }), '50 ações')
  assert.equal(quantidadeDaOperacao({ ticker: 'ITSA4', quantidade: 1, grupo: 'acoes' }), '1 ação')
  assert.equal(quantidadeDaOperacao({ ticker: 'HGLG11', quantidade: 2, grupo: 'fii' }), '2 cotas')
})

test('os grupos sempre na mesma ordem, e os meses do mais velho ao mais novo (os últimos 12)', () => {
  const g = gruposEmOrdem([grupo({ grupo: 'rf' }), grupo({ grupo: 'cripto' }), grupo({ grupo: 'acoes' }), grupo({ grupo: 'etf' }), grupo({ grupo: 'fii' })])
  assert.deepEqual(g.map((x) => x.grupo), ['acoes', 'fii', 'etf', 'rf', 'cripto'])
  const h = impostoMock('normal').historico
  const embaralhado = [h[5]!, h[11]!, h[0]!, ...h.slice(1, 5), ...h.slice(6, 11), { mes: '2025-11', vendas: 0, selo: 'sem_venda' as const, operacoes: [] }]
  const m = mesesEmOrdem(embaralhado)
  assert.equal(m.length, 12)
  assert.equal(m[0]!.mes, '2025-12')
  assert.equal(m[11]!.mes, '2026-11')
})

test('as vendas na coluna estreita do histórico', () => {
  assert.equal(vendasCurtas(0), '—')
  assert.equal(vendasCurtas(640), 'R$ 640')
  assert.equal(vendasCurtas(9800), '9,8 mil')
  assert.equal(vendasCurtas(18700), '19 mil')
  assert.equal(vendasCurtas(154380), '154 mil')
})

test('as vendas da lista de movimentações levam o selo do mês delas', () => {
  const selos = selosDasVendas(impostoMock('normal').historico)
  assert.equal(selos['2026-11|VALE3'], 'a_conferir')
  assert.equal(selos['2026-10|PETR4'], 'isento')
  assert.equal(selos['2026-02|ITUB4'], 'custo_desconhecido')
  assert.equal(selos['2026-11|ITSA4'], undefined, 'compra não leva selo')
})

test('o tópico de cada detector', () => {
  // imposto e ideias aparecem só na tela: nenhum comando os envia
  assert.equal(topicoDoDetector('imposto.darf'), null)
  assert.equal(topicoDoDetector('imposto.isencao'), null)
  assert.equal(topicoDoDetector('proventos.agenda'), 'carteira_proventos_mes')
  assert.equal(topicoDoDetector('proventos.mes'), 'carteira_proventos_mes')
  assert.equal(topicoDoDetector('proventos.pago'), 'carteira_provento_pago')
  assert.equal(topicoDoDetector('quedas'), 'carteira_semana')
  assert.equal(topicoDoDetector('semana.resumo'), 'carteira_semana')
  assert.equal(topicoDoDetector('movimento.dy'), null)
  assert.equal(topicoDoDetector('ideia.troca_dy'), null)
  assert.equal(topicoDoDetector('relatorio.mensal'), 'carteira_relatorio')
  assert.equal(topicoDoDetector('conexao.velha'), null)
  assert.equal(topicoDoDetector('renda.selic'), null)
  assert.deepEqual(topicosDosAvisos(visaoMock('normal').avisos.itens).map((t) => t.id), ['carteira_proventos_mes'])
  assert.deepEqual(topicosDosAvisos(visaoMock('velho').avisos.itens), [])
})

test('os tópicos novos das preferências, e os exemplos dentro da regra da CVM', () => {
  assert.deepEqual(TOPICOS_CARTEIRA.map((t) => t.id), ['carteira_semana', 'carteira_proventos_mes', 'carteira_provento_pago', 'carteira_relatorio'])
  for (const t of TOPICOS_CARTEIRA) {
    assert.match(t.exemplo, /\d/, `${t.id}: frase sem número`)
    assert.doesNotMatch(t.exemplo, /\b(compre|comprar|venda|vender|recomendamos|recomendo|vale a pena)\b/i, t.exemplo)
  }
})

test('o aceite do WhatsApp vem do /auth/me', () => {
  assert.equal(temOptInWhatsapp({ whatsapp_opt_in_at: '2026-11-01T10:00:00-03:00' }), true)
  assert.equal(temOptInWhatsapp({ whatsapp_opt_in_at: null }), false)
  assert.equal(temOptInWhatsapp({}), false)
  assert.equal(temOptInWhatsapp(null), false)
})

test('a flag do servidor: só o 404 visao_desligada desliga a tela nova', () => {
  assert.equal(visaoDesligada(404, { error: 'visao_desligada' }), true)
  assert.equal(visaoDesligada(404, { message: 'The route could not be found.' }), false)
  assert.equal(visaoDesligada(500, { error: 'visao_desligada' }), false)
  assert.equal(visaoDesligada(undefined, null), false)
})

test('o valor de cada indicador na unidade dele', () => {
  assert.equal(valorDoIndicador(18.42, '%'), '18,4%')
  assert.equal(valorDoIndicador(-9.46, '%'), '−9,5%')
  assert.equal(valorDoIndicador(0.78, 'x'), '0,78')
  assert.equal(valorDoIndicador(-0.08, ''), '−0,08')
  assert.equal(valorDoIndicador(22, ''), '22')
  assert.equal(valorDoIndicador(1240, 'R$'), 'R$ 1.240')
  assert.equal(valorDoIndicador(null, '%'), '—')
})

test('a mediana do backend, os pilares e as frases do relatório', () => {
  assert.equal(mediana([3, 1, 2]), 2)
  assert.equal(mediana([4, 1, 3, 2]), 2.5)
  assert.equal(mediana([null, 5, undefined]), 5)
  assert.equal(mediana([]), null)
  const r = relatorioMock()
  assert.deepEqual(indicadoresPorPilar(r).map((g) => [g.pilar.chave, g.indicadores.length]), [['retorno', 4], ['risco', 5], ['eficiencia', 8], ['diversificacao', 4]])
  assert.equal(periodoTxt(r.periodo), 'De 02/05/2025 a 06/11/2026, 553 dias.')
  assert.equal(periodoTxt({ inicio: null, fim: null, dias: 0, historicoCurto: true }), null)
  assert.equal(fraseDaNota(72), 'A sua carteira tira 72 de 100.')
  assert.equal(fraseDaNota(null), 'Ainda não há histórico para dar uma nota à carteira.')
  assert.equal(composicaoTxt(r.benchmark.composicao), '53% CDI, 27% IBOV e 19% IFIX')
  assert.equal(composicaoTxt([{ indice: 'CDI', peso: 100 }]), '100% CDI')
})
