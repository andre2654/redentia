/**
 * Repartir os textos da tese (11/11/2026): utils/teseTexto.ts. Os trechos são
 * REAIS, copiados do detail de produção da tese "A fábrica volta pra casa"
 * (companies[] de 10/11/2026): é o formato que o backend grava hoje.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  dataBr,
  dataCurta,
  dataPorExtenso,
  marcadoresDoTexto,
  partesDoCatalyst,
  partesDoStatus,
  primeirosPeriodos,
  revisoesDaMaisNova,
  trechosDoTexto,
} from '../app/utils/teseTexto.ts'

/* ————— os textos reais ————— */

const STATUS_CATP34 = 'Núcleo Revalidação de 10 de novembro de 2026: Caiu 6,37% em 5 de novembro, a US$ 553,64, na venda de data center depois da vitória democrata, e subiu 7,21% em 9, a US$ 598,88, sem comunicado.'
const STATUS_DEEC34 = 'Acompanhar Revalidação de 10 de novembro de 2026: Foi de US$ 667,60 em 2 de novembro a US$ 691,28 em 9, a mais estável da cesta na semana, sem comunicado.'

// o começo do catalyst da WEG (WEGE3): o gatilho e as três primeiras revalidações
const CATALYST_WEGE3 = 'Conversão da demanda de eletrificação e data center em aceleração de receita e recomposição de margem ao longo de 2026 (PENDENTE, contrato de R$ 1,2 bi com a Engie assinado em 27 de julho, com valuation como trava) Revalidação de 11 de setembro de 2026: a Secex de agosto mostrou exportação de transformadores 35,6% acima de agosto de 2025 e 43% acima de julho, e geração, transmissão e distribuição 13,6% acima no acumulado do ano, com o Safra ressalvando concentração em poucos produtos (VOLUME A FAVOR, margem ainda PENDENTE). Revalidação de 17 de setembro de 2026: em 16 de setembro o JPMorgan estimou reembolso de R$ 166 a R$ 234 milhões das tarifas IEEPA no 3T26, com margem Ebitda de 23,6% a 24,2% contra consenso de 21,9% (MARGEM A FAVOR NA PROJEÇÃO DE SELL-SIDE, aferição no 3T26 PENDENTE). Revalidação de 28 de outubro de 2026: a WEG comprou em 27 de outubro o negócio de controles de energia da L&S Electric, em Wisconsin, por US$ 11 milhões; a ação subiu 4,21% em 26 e 3,66% em 27, a R$ 46,16, com o dólar a R$ 5,40 (FÁBRICA NOS EUA AMPLIADA; pagamento em 10 de março de 2027 PENDENTE).'

// um pedaço do catalyst da Caterpillar (CATP34): a revalidação de 18 de agosto veio SEM acento
const CATALYST_CATP34 = 'O filtro de custo de capital melhorou em 13 de agosto de 2026: o PPI de julho veio estável contra projeção de alta de 0,2%, o Treasury de 10 anos cedeu 4,1 pontos-base para 4,641% e a aposta de alta de juros do Fed em setembro caiu de 55,0% para 34,6% pelo CME FedWatch (FILTRO MACRO A FAVOR, ponta de 30 anos ainda perto de 5,24%). Revalidacao de 18 de agosto de 2026: o funil recebeu o maior numero ja colocado nele, com o CEO da Nvidia afirmando em 17 de agosto que o data center da OpenAI pode gerar US$ 600 bilhoes em receita, enquanto o Treasury de 10 anos subiu a 4,68% no fechamento de segunda e a 4,734% na terca, por premio de Ormuz e nao por dado de atividade (PENDENTE, fila intacta e multiplo pressionado).'

// o fim do catalyst da Tupy (TUPY3): 1º de outubro, e o marcador com trimestre no meio
const CATALYST_TUPY3 = 'Recuperação da produção de caminhões pesados e máquinas nos EUA convertendo em volume de fundição, com o primeiro balanço sob a tarifa marcado para 6 de agosto (PENDENTE, data confirmada). Balanço CUMPRIDO em 6 de agosto de 2026 e com veredito NEGATIVO: prejuízo líquido de R$ 11 milhões contra lucro de R$ 24 milhões no 2T25 (FALHOU, próxima etapa é a recomposição de margem no 3T26) Revalidação de 21 de setembro de 2026: sem comunicado no fim de semana (SEM FATO NOVO). Revalidação de 1º de outubro de 2026: a ação subiu 0,48% em 30 de setembro, para R$ 16,68, depois da alta de 3,81% de 29 com o upgrade do Itaú BBA para compra e alvo de R$ 20, sem comunicado novo (SELL-SIDE A FAVOR, assembleia da reforma PENDENTE sem data, recomposição de margem no 3T26 PENDENTE). Revalidação de 10 de novembro de 2026: a Tupy publicou Ebitda ajustado de R$ 298 milhões no 3T26, alta de 81%, margem de 11,5%, ou cerca de 9,5% sem os efeitos pontuais de negociações comerciais, contra 9,4% projetados pelo Itaú BBA, e lucro de R$ 53,6 milhões; a ação subiu 11,26% em 6 de novembro, a R$ 17,19 (RECOMPOSIÇÃO DE MARGEM NO 3T26 CUMPRIDA; assembleia da reforma PENDENTE sem data).'

// o começo do rationale da WEG (WEGE3)
const RATIONALE_WEGE3 = 'Ponte brasileira mais direta para o mesmo motor que a tese compra em Eaton: a WEG fabrica motores, transformadores, geradores e conjuntos de geração, exatamente o equipamento elétrico que a onda de data center e de eletrificação da reindustrialização consome antes do primeiro servidor ligar. O 2T26 divulgado em 23 de julho trouxe receita líquida de R$ 10,14 bi, queda marginal de 0,6% a/a mas alta de 7,1% no trimestre, lucro líquido de R$ 1,558 bi e EBITDA de R$ 2,21 bi contra consenso de R$ 2,12 bi, com a ação saltando 10,05% no pregão porque o susto de compressão de margem não se confirmou mesmo com as tarifas. Em 27 de julho veio a encomenda concreta que faltava.'

const semEspaco = (s: string) => s.replace(/\s+/g, ' ').trim()
const SEM_PREFIXO = /Revalida(?:ç|c)(?:ã|a)o de [^:]{1,40}:\s*/g

/* ————— datas ————— */

test('a data por extenso vira AAAA-MM-DD, com 1º e com março', () => {
  assert.equal(dataPorExtenso('10 de novembro de 2026'), '2026-11-10')
  assert.equal(dataPorExtenso('1º de outubro de 2026'), '2026-10-01')
  assert.equal(dataPorExtenso('3 de março de 2027'), '2027-03-03')
  assert.equal(dataPorExtenso('3 de marco de 2027'), '2027-03-03')
  assert.equal(dataPorExtenso('ontem'), null)
  assert.equal(dataPorExtenso('40 de maio de 2026'), null)
  assert.equal(dataCurta('2026-11-10'), '10/11')
  assert.equal(dataBr('2026-11-10'), '10/11/2026')
  assert.equal(dataCurta(null), '')
})

/* ————— status ————— */

test('o status vira selo, data e frase sem o prefixo', () => {
  assert.deepEqual(partesDoStatus(STATUS_CATP34), {
    selo: 'Núcleo',
    data: '2026-11-10',
    texto: 'Caiu 6,37% em 5 de novembro, a US$ 553,64, na venda de data center depois da vitória democrata, e subiu 7,21% em 9, a US$ 598,88, sem comunicado.',
  })
  const deere = partesDoStatus(STATUS_DEEC34)
  assert.equal(deere.selo, 'Acompanhar')
  assert.equal(deere.data, '2026-11-10')
  assert.ok(deere.texto.startsWith('Foi de US$ 667,60'))
})

test('status curto é só o selo; vazio não quebra; sem marcador o texto fica inteiro', () => {
  assert.deepEqual(partesDoStatus('Acompanhar'), { selo: 'Acompanhar', texto: '' })
  assert.deepEqual(partesDoStatus('Em risco'), { selo: 'Em risco', texto: '' })
  assert.deepEqual(partesDoStatus(null), { texto: '' })
  assert.deepEqual(partesDoStatus(''), { texto: '' })
  assert.deepEqual(partesDoStatus('Núcleo com catalisador progredindo, vendida até 2027-2028.'), { selo: 'Núcleo', texto: 'com catalisador progredindo, vendida até 2027-2028.' })
  const solto = 'A companhia segue em observação até o balanço do terceiro trimestre.'
  assert.deepEqual(partesDoStatus(solto), { texto: solto })
})

test('o status sem acento e com data ilegível não perde texto', () => {
  assert.deepEqual(partesDoStatus('Nucleo Revalidacao de 3 de novembro de 2026: Sem pregão no Finados.'), { selo: 'Nucleo', data: '2026-11-03', texto: 'Sem pregão no Finados.' })
  const semData = partesDoStatus('Núcleo Revalidação de ontem: Caiu 2%.')
  assert.equal(semData.selo, 'Núcleo')
  assert.equal(semData.data, undefined)
  assert.equal(semData.texto, 'Revalidação de ontem: Caiu 2%.')
})

/* ————— catalyst ————— */

test('o catalyst vira o gatilho e uma revisão por revalidação, na ordem do texto', () => {
  const p = partesDoCatalyst(CATALYST_WEGE3)
  assert.equal(p.gatilho, 'Conversão da demanda de eletrificação e data center em aceleração de receita e recomposição de margem ao longo de 2026 (PENDENTE, contrato de R$ 1,2 bi com a Engie assinado em 27 de julho, com valuation como trava)')
  assert.deepEqual(p.revisoes.map((r) => r.data), ['2026-09-11', '2026-09-17', '2026-10-28'])
  assert.ok(p.revisoes[0]!.texto.startsWith('a Secex de agosto mostrou'))
  assert.ok(p.revisoes[0]!.texto.endsWith('(VOLUME A FAVOR, margem ainda PENDENTE).'))
  assert.ok(p.revisoes[2]!.texto.endsWith('(FÁBRICA NOS EUA AMPLIADA; pagamento em 10 de março de 2027 PENDENTE).'))
})

test('aceita "Revalidacao" sem acento e "1º de outubro"', () => {
  const cat = partesDoCatalyst(CATALYST_CATP34)
  assert.equal(cat.revisoes.length, 1)
  assert.equal(cat.revisoes[0]!.data, '2026-08-18')
  assert.ok(cat.revisoes[0]!.texto.startsWith('o funil recebeu o maior numero'))
  assert.ok(cat.gatilho.endsWith('ponta de 30 anos ainda perto de 5,24%).'))

  const tupy = partesDoCatalyst(CATALYST_TUPY3)
  assert.deepEqual(tupy.revisoes.map((r) => r.data), ['2026-09-21', '2026-10-01', '2026-11-10'])
  assert.equal(tupy.revisoes[0]!.texto, 'sem comunicado no fim de semana (SEM FATO NOVO).')
})

test('nunca perde texto: o gatilho mais as revisões é o original, a menos dos prefixos de data', () => {
  for (const cru of [CATALYST_WEGE3, CATALYST_CATP34, CATALYST_TUPY3]) {
    const p = partesDoCatalyst(cru)
    const junto = [p.gatilho, ...p.revisoes.map((r) => r.texto)].join(' ')
    assert.equal(semEspaco(junto), semEspaco(cru.replace(SEM_PREFIXO, ' ')))
  }
})

test('sem marcador tudo é gatilho; vazio não quebra; data ilegível mantém o prefixo no texto', () => {
  const so = 'Recuperação da produção de caminhões pesados e máquinas nos EUA convertendo em volume de fundição.'
  assert.deepEqual(partesDoCatalyst(so), { gatilho: so, revisoes: [] })
  assert.deepEqual(partesDoCatalyst(null), { gatilho: '', revisoes: [] })
  assert.deepEqual(partesDoCatalyst('   '), { gatilho: '', revisoes: [] })
  const p = partesDoCatalyst('Gatilho original. Revalidação de ontem: a ação caiu. Revalidação de 2 de outubro de 2026: a ação subiu.')
  assert.equal(p.gatilho, 'Gatilho original.')
  assert.deepEqual(p.revisoes, [
    { data: null, texto: 'Revalidação de ontem: a ação caiu.' },
    { data: '2026-10-02', texto: 'a ação subiu.' },
  ])
})

test('as revisões da mais nova para a mais velha, sem data por último', () => {
  const p = partesDoCatalyst(CATALYST_TUPY3)
  assert.deepEqual(revisoesDaMaisNova(p.revisoes).map((r) => r.data), ['2026-11-10', '2026-10-01', '2026-09-21'])
  const mistas = revisoesDaMaisNova([{ data: null, texto: 'a' }, { data: '2026-08-18', texto: 'b' }, { data: '2026-10-28', texto: 'c' }])
  assert.deepEqual(mistas.map((r) => r.texto), ['c', 'b', 'a'])
  // a função não mexe na lista que recebe
  assert.deepEqual(p.revisoes.map((r) => r.data), ['2026-09-21', '2026-10-01', '2026-11-10'])
})

/* ————— marcadores ————— */

test('os marcadores em caixa alta viram selos com o tom certo', () => {
  const m = (t: string) => marcadoresDoTexto(t).map((x) => [x.texto, x.tom])
  assert.deepEqual(m('(VOLUME A FAVOR, margem ainda PENDENTE).'), [['VOLUME A FAVOR', 'verde'], ['PENDENTE', 'ambar']])
  assert.deepEqual(m('(SELL-SIDE A FAVOR, assembleia da reforma PENDENTE sem data, recomposição de margem no 3T26 PENDENTE).'), [['SELL-SIDE A FAVOR', 'verde'], ['PENDENTE', 'ambar'], ['PENDENTE', 'ambar']])
  assert.deepEqual(m('(RECOMPOSIÇÃO DE MARGEM NO 3T26 CUMPRIDA; assembleia da reforma PENDENTE sem data).'), [['RECOMPOSIÇÃO DE MARGEM NO 3T26 CUMPRIDA', 'verde'], ['PENDENTE', 'ambar']])
  assert.deepEqual(m('sem comunicado no fim de semana (SEM FATO NOVO).'), [['SEM FATO NOVO', 'ambar']])
  assert.deepEqual(m('pelo CME FedWatch (FILTRO MACRO A FAVOR, ponta de 30 anos ainda perto de 5,24%).'), [['FILTRO MACRO A FAVOR', 'verde']])
  assert.deepEqual(m('(FILTRO MACRO CONTRA) e depois FILTRO MACRO INVERTIDO em 4 de setembro'), [['FILTRO MACRO CONTRA', 'vermelho'], ['FILTRO MACRO INVERTIDO', 'vermelho']])
  assert.deepEqual(m('Balanço CUMPRIDO em 6 de agosto de 2026 e com veredito NEGATIVO: prejuízo'), [['CUMPRIDO', 'verde'], ['NEGATIVO', 'vermelho']])
  assert.deepEqual(m('(FALHOU, próxima etapa é a recomposição de margem no 3T26)'), [['FALHOU', 'vermelho']])
  assert.deepEqual(m('(MÚLTIPLO SOB PRESSÃO, rumor NÃO CONFIRMADO, data REAGENDADA)'), [['MÚLTIPLO SOB PRESSÃO', 'ambar'], ['NÃO CONFIRMADO', 'ambar'], ['REAGENDADA', 'ambar']])
  assert.deepEqual(m('(FÁBRICA NOS EUA AMPLIADA; pagamento em 10 de março de 2027 PENDENTE).'), [['FÁBRICA NOS EUA AMPLIADA', 'neutro'], ['PENDENTE', 'ambar']])
})

test('sigla, trimestre e unidade não são marcador', () => {
  const m = (t: string) => marcadoresDoTexto(t).map((x) => x.texto)
  assert.deepEqual(m('o PPI de julho veio estável e o CEO da Nvidia falou do data center da OpenAI'), [])
  assert.deepEqual(m('lucro líquido de R$ 1,558 bi e EBITDA de R$ 2,21 bi no 2T26, com a AMD e a WEG nos EUA'), [])
  assert.deepEqual(m('das tarifas IEEPA no 3T26, pelo ISM PMI e pelo CME FedWatch'), [])
  // a unidade colada no número fica de fora do selo
  assert.deepEqual(m('primeiro deployment de 1 GW PENDENTE para o 2S26'), ['PENDENTE'])
  assert.deepEqual(m(''), [])
  assert.deepEqual(marcadoresDoTexto(null), [])
})

test('os trechos, juntos, devolvem o texto original', () => {
  for (const cru of [CATALYST_WEGE3, CATALYST_CATP34, CATALYST_TUPY3, STATUS_CATP34]) {
    assert.equal(trechosDoTexto(cru).map((t) => t.texto).join(''), cru)
  }
  const t = trechosDoTexto('sem comunicado (SEM FATO NOVO).')
  assert.deepEqual(t, [{ texto: 'sem comunicado (' }, { texto: 'SEM FATO NOVO', tom: 'ambar' }, { texto: ').' }])
})

/* ————— "Ler tudo" ————— */

test('os dois primeiros períodos ficam à vista e o resto vai para o "Ler tudo"', () => {
  const p = primeirosPeriodos(RATIONALE_WEGE3)
  assert.ok(p.inicio.startsWith('Ponte brasileira mais direta'))
  // "0,6% a/a", "R$ 10,14 bi" e "10,05%" não cortam o período
  assert.ok(p.inicio.endsWith('não se confirmou mesmo com as tarifas.'))
  assert.equal(p.resto, 'Em 27 de julho veio a encomenda concreta que faltava.')
  assert.equal(semEspaco(`${p.inicio} ${p.resto}`), semEspaco(RATIONALE_WEGE3))
})

test('texto curto sai inteiro, sem "Ler tudo"', () => {
  assert.deepEqual(primeirosPeriodos('Um período só.'), { inicio: 'Um período só.', resto: '' })
  assert.deepEqual(primeirosPeriodos('Primeiro período. Segundo período.'), { inicio: 'Primeiro período. Segundo período.', resto: '' })
  assert.deepEqual(primeirosPeriodos('Primeiro. Segundo. Terceiro.', 1), { inicio: 'Primeiro.', resto: 'Segundo. Terceiro.' })
  assert.deepEqual(primeirosPeriodos(null), { inicio: '', resto: '' })
})
