/**
 * SÓ NO DEV (06/11/2026): o mock de `GET /me/carteira/visao` para desenhar a
 * /carteira nova antes do backend ("pode fazer mockado", o dono).
 *
 * As posições são as do espelho Business do dono (cliente 15, sincronizado em
 * 29/10), o dado mais novo dele. Os achados de imposto, provento e Selic são do
 * levantamento de 06/11 (scratchpad/avisos). São INVENTADOS, porque ainda não
 * guardamos ou não calculamos isso: o gasto do cartão, as correlações, os
 * efeitos dos cenários e as curvas dos caminhos. São plausíveis e servem só ao
 * desenho.
 *
 * Os cenários (?cenario=) mostram a tela em cada caso que o motor precisa
 * cobrir: normal, calmo (nada a avisar), velho (conexão parada) e semgasto
 * (sem cartão conectado).
 */
import type { Aviso, CarteiraVisao, CaminhoVisao, PosicaoVisao } from '~/types/carteiraVisao'

export type CenarioVisao = 'normal' | 'calmo' | 'velho' | 'semgasto'
export const CENARIOS: { id: CenarioVisao; nome: string }[] = [
  { id: 'normal', nome: 'Normal' },
  { id: 'calmo', nome: 'Nada a avisar' },
  { id: 'velho', nome: 'Conexão parada' },
  { id: 'semgasto', nome: 'Sem cartão' },
]

const POSICOES: PosicaoVisao[] = [
  { ticker: 'AUPO11', nome: 'AUPO11', classe: 'ETF', valor: 203544.22, fator: 'selic' },
  { ticker: 'BRSTNCNTB476', nome: 'Tesouro IPCA+ 2050', classe: 'TREASURY', valor: 54921.42, fator: 'juros' },
  { ticker: 'BRSTNCNTB666', nome: 'Tesouro IPCA+ 2040', classe: 'TREASURY', valor: 44560.71, fator: 'juros' },
  { ticker: 'BRSTNCNTB7T1', nome: 'Tesouro IPCA+ 2032', classe: 'TREASURY', valor: 40634.09, fator: 'juros' },
  { ticker: 'ITSA4', nome: 'Itaúsa', classe: 'STOCK', valor: 29047.5, fator: 'brasil' },
  { ticker: 'PETR4', nome: 'Petrobras', classe: 'STOCK', valor: 25204.8, fator: 'petroleo' },
  { ticker: 'CPLE3', nome: 'Copel', classe: 'STOCK', valor: 22769.5, fator: 'brasil' },
  { ticker: 'BBSE3', nome: 'BB Seguridade', classe: 'STOCK', valor: 22742.5, fator: 'brasil' },
  { ticker: 'CXSE3', nome: 'Caixa Seguridade', classe: 'STOCK', valor: 21260, fator: 'brasil' },
  { ticker: 'GARE11', nome: 'Guardian Real Estate', classe: 'REIT', valor: 20400, fator: 'juros' },
  { ticker: 'MCCI11', nome: 'Mauá Capital Recebíveis', classe: 'REIT', valor: 20227.5, fator: 'juros' },
  { ticker: 'FLRY3', nome: 'Fleury', classe: 'STOCK', valor: 19656, fator: 'brasil' },
  { ticker: 'WEGE3', nome: 'WEG', classe: 'STOCK', valor: 17086.4, fator: 'dolar' },
  { ticker: 'CPTS11', nome: 'Capitânia Securities', classe: 'REIT', valor: 15379, fator: 'juros' },
  { ticker: 'HGLG11', nome: 'CSHG Logística', classe: 'REIT', valor: 14020.1, fator: 'juros' },
  { ticker: 'PRIO3', nome: 'PRIO', classe: 'STOCK', valor: 13623, fator: 'petroleo' },
  { ticker: 'VALE3', nome: 'Vale', classe: 'STOCK', valor: 11969.1, fator: 'dolar' },
  { ticker: 'BTLG11', nome: 'BTG Logística', classe: 'REIT', valor: 11684.4, fator: 'juros' },
  { ticker: 'GOLD11', nome: 'GOLD11', classe: 'ETF', valor: 10170, fator: 'ouro' },
  { ticker: 'HSML11', nome: 'HSI Malls', classe: 'REIT', valor: 9791.25, fator: 'juros' },
  { ticker: 'XPML11', nome: 'XP Malls', classe: 'REIT', valor: 8820.9, fator: 'juros' },
  { ticker: 'RANI3', nome: 'Irani', classe: 'STOCK', valor: 7455, fator: 'dolar' },
]

const PATRIMONIO = Math.round(POSICOES.reduce((s, p) => s + p.valor, 0) * 100) / 100

const FATORES_BASE: Omit<CarteiraVisao['fatores'][number], 'pct' | 'valor' | 'tickers'>[] = [
  { chave: 'juros', nome: 'Inflação e juros longos', seCenario: 'Se os juros longos subirem 1 ponto', efeito: '−R$ 21 mil', efeitoDir: 'down' },
  { chave: 'selic', nome: 'Selic', seCenario: 'Cada corte de 1 ponto na Selic', efeito: '−R$ 170 por mês de rendimento', efeitoDir: 'down' },
  { chave: 'brasil', nome: 'Economia do Brasil', seCenario: 'Se o Ibovespa cair 10%', efeito: '−R$ 12 mil', efeitoDir: 'down' },
  { chave: 'petroleo', nome: 'Petróleo', seCenario: 'Se o petróleo cair 20%', efeito: '−R$ 6 mil', efeitoDir: 'down' },
  { chave: 'dolar', nome: 'Exportação e dólar', seCenario: 'Se o dólar subir 10%', efeito: '+R$ 2,6 mil', efeitoDir: 'up' },
  { chave: 'ouro', nome: 'Ouro', seCenario: 'Se o dólar subir 10%', efeito: '+R$ 1 mil', efeitoDir: 'up' },
]

function fatores(): CarteiraVisao['fatores'] {
  const out = FATORES_BASE.map((f) => {
    const ps = POSICOES.filter((p) => p.fator === f.chave)
    const valor = ps.reduce((s, p) => s + p.valor, 0)
    return { ...f, valor, pct: (valor / PATRIMONIO) * 100, tickers: ps.map((p) => p.ticker) }
  })
  return out.sort((a, b) => b.valor - a.valor)
}

/* ————— os caminhos: cobertura da vida (%) em 61 meses ————— */
function curva(ini: number, fim: number, abertura: number, curvatura = 1.25): Pick<CaminhoVisao, 'p10' | 'mediana' | 'p90'> {
  const p10: number[] = []
  const mediana: number[] = []
  const p90: number[] = []
  for (let m = 0; m <= 60; m++) {
    const t = m / 60
    const med = ini + (fim - ini) * t ** curvatura
    const banda = abertura * Math.sqrt(t)
    mediana.push(+med.toFixed(2))
    p10.push(+Math.max(0, med - banda * 0.9).toFixed(2))
    p90.push(+(med + banda * 1.1).toFixed(2))
  }
  return { p10, mediana, p90 }
}

const CAMINHOS: CaminhoVisao[] = [
  {
    id: 'hoje', nome: 'Como está hoje', detalhe: 'Sem aporte novo, e os proventos ficam na conta.',
    custo: 'A renda só cresce com a inflação.', ...curva(10.0, 12.2, 3.2, 1),
  },
  {
    id: 'meio', nome: 'Levar R$ 30 mil do AUPO11 para renda mensal', detalhe: 'Para títulos e FIIs que pagam todo mês. Parei em R$ 30 mil, porque acima disso os juros longos passam de 40% da carteira.',
    custo: 'Rende um pouco menos no total e depende mais dos juros longos: de 37% para 42%.', ...curva(12.9, 15.6, 4, 1),
  },
  {
    id: 'aporte', nome: 'Reinvestir os proventos e aportar R$ 3.000 por mês', detalhe: 'Tudo em renda que cai na conta, sem vender nada.',
    custo: 'Pede R$ 3.000 por mês do seu orçamento.', ...curva(10.0, 30.4, 9.5, 1.15),
  },
]

/* ————— os avisos ————— */
const AVISOS: Aviso[] = [
  {
    id: 'imposto.darf:2026-02', detector: 'imposto.darf', gravidade: 'alta',
    titulo: 'Pode haver imposto de fevereiro em aberto.',
    curto: 'Pode haver imposto de fevereiro em aberto.',
    texto: 'Em fevereiro você vendeu R$ 154 mil em ações, acima da isenção de R$ 20 mil no mês. Se essas vendas deram lucro, o DARF venceu em 31/03. Janeiro (R$ 31 mil) e março (R$ 40 mil) também passaram do limite.',
    emJogo: null, prazo: 'venceu em 31/03', confianca: 'incompleto',
    ressalva: 'A corretora não manda o preço médio, então eu não sei se houve lucro. Vale conferir com quem faz o seu imposto.',
    prova: [
      { rotulo: 'Vendas de ações em janeiro', valor: 'R$ 31.204' },
      { rotulo: 'Vendas de ações em fevereiro', valor: 'R$ 154.380' },
      { rotulo: 'Vendas de ações em março', valor: 'R$ 40.112' },
      { rotulo: 'Isenção por mês (vendas de ações)', valor: 'R$ 20.000' },
      { rotulo: 'Vendas com o custo conhecido', valor: '1 de 3' },
    ],
    fonte: 'Transações da Pluggy, regra da Receita (Lei 11.033/2004, art. 3º)',
    acoes: [
      { tipo: 'ver', rotulo: 'Ver as vendas', alvo: '#movimentacoes' },
      { tipo: 'perguntar', rotulo: 'Perguntar à Redentia', alvo: 'Como eu confiro se devo DARF das vendas de fevereiro?' },
    ],
  },
  {
    id: 'renda.selic:AUPO11', detector: 'renda.selic', gravidade: 'media',
    titulo: 'Um terço do seu dinheiro rende conforme a Selic.',
    curto: 'Um terço do seu dinheiro depende da Selic.',
    texto: 'Os R$ 204 mil em AUPO11 são Tesouro Selic. O risco de crédito é baixo, o ponto é a renda: cada corte de 1 ponto na Selic tira uns R$ 170 por mês do que ele rende.',
    emJogo: '~R$ 170/mês', prazo: 'próximo Copom em 10/12', confianca: 'certeza', ressalva: null,
    prova: [
      { rotulo: 'AUPO11 na carteira', valor: 'R$ 203.544 (31,6%)' },
      { rotulo: 'O que ele segue', valor: 'Tesouro Selic (LFT)' },
      { rotulo: '1 ponto de Selic ao ano sobre R$ 203.544', valor: 'R$ 2.035 por ano ÷ 12 = R$ 170' },
    ],
    fonte: 'Posições do Open Finance, composição do ETF (Raio-X)',
    acoes: [
      { tipo: 'ver', rotulo: 'Ver nos riscos', alvo: 'lente:riscos' },
      { tipo: 'simular', rotulo: 'Simular a Selic a 12%', alvo: 'Simule a minha carteira com a Selic caindo para 12% em 2027.' },
    ],
  },
  {
    id: 'proventos.semana:2026-11-10', detector: 'proventos.agenda', gravidade: 'bom',
    titulo: 'Segunda caem R$ 301 de GARE11 e HSML11.',
    curto: 'Segunda caem R$ 301 de proventos.',
    texto: 'Em novembro já estão marcados R$ 1.096, de 8 ativos.',
    emJogo: 'R$ 301', prazo: 'segunda, 10/11', confianca: 'certeza', ressalva: null,
    prova: [
      { rotulo: 'GARE11 · 2.500 cotas × R$ 0,0786', valor: 'R$ 196,50' },
      { rotulo: 'HSML11 · 105 cotas × R$ 0,99', valor: 'R$ 104,50' },
      { rotulo: 'Marcados em novembro', valor: 'R$ 1.096' },
    ],
    fonte: 'Agenda de proventos da B3',
    acoes: [{ tipo: 'ver', rotulo: 'Ver a agenda', alvo: '#renda' }],
  },
  {
    id: 'imposto.prejuizo-fii', detector: 'imposto.prejuizo', gravidade: 'info',
    titulo: 'Você tem uns R$ 3,7 mil de prejuízo em FII para abater.',
    curto: 'R$ 3,7 mil de prejuízo em FII para abater.',
    texto: 'As vendas de PVBI11 e TRXF11 deram prejuízo. Ele abate o lucro das próximas vendas de FII, o que evitaria uns R$ 746 de imposto.',
    emJogo: '~R$ 746', prazo: null, confianca: 'estimativa',
    ressalva: 'A regra de compensação ainda vai ser conferida numa fonte antes de este aviso ir ao ar.',
    prova: [
      { rotulo: 'PVBI11 · venda de 08/09', valor: '−R$ 2.214' },
      { rotulo: 'TRXF11 · venda de 08/09', valor: '−R$ 1.516' },
      { rotulo: 'Imposto de FII sobre o lucro', valor: '20%' },
    ],
    fonte: 'Transações da Pluggy',
    acoes: [{ tipo: 'perguntar', rotulo: 'Perguntar à Redentia', alvo: 'Como funciona abater prejuízo de FII no imposto?' }],
  },
  {
    id: 'imposto.isencao:BBSE3', detector: 'imposto.isencao', gravidade: 'info',
    titulo: 'Se for vender o BBSE3, divida entre novembro e dezembro.',
    curto: 'Venda do BBSE3: dividir entre dois meses zera o imposto.',
    texto: 'Vender as 550 ações de uma vez (R$ 22,7 mil) passa da isenção de R$ 20 mil e paga uns R$ 249. Em dois meses, paga zero.',
    emJogo: 'R$ 249', prazo: null, confianca: 'estimativa',
    ressalva: 'O lucro foi estimado pelo preço da primeira compra que eu conheço.',
    prova: [
      { rotulo: 'BBSE3 · 550 ações × R$ 41,35', valor: 'R$ 22.742' },
      { rotulo: 'Vendas de ações em novembro até hoje', valor: 'R$ 0' },
      { rotulo: 'Lucro estimado × 15%', valor: 'R$ 1.660 × 15% = R$ 249' },
    ],
    fonte: 'Posições e transações da Pluggy',
    acoes: [{ tipo: 'simular', rotulo: 'Simular a venda', alvo: 'Simule vender todo o BBSE3 dividido entre novembro e dezembro.' }],
  },
]

const DESCARTADOS: CarteiraVisao['avisos']['descartados'] = [
  { id: 'vender:WEGE3', movimento: 'Trocar WEGE3 por uma ação que paga mais dividendo', veto: 'A WEG protege a carteira do dólar e paga pouco porque reinveste. Trocar por dividendo deixaria você mais exposto ao Brasil.' },
  { id: 'vender:GOLD11', movimento: 'Vender GOLD11 para comprar renda', veto: 'É o único ativo que tende a subir quando o resto cai (correlação de −0,18 com a carteira).' },
  { id: 'vender:PRIO3', movimento: 'Vender PRIO3 para reduzir o petróleo', veto: 'Está no quartil de cima da nota da Redentia e acima da média de 200 dias. Com sinal de alta, eu não sugiro venda.' },
  { id: 'comprar:FII-papel', movimento: 'Comprar mais FII de papel para a renda', veto: 'Os juros longos já são 37% da carteira, e FII de papel reforça esse mesmo risco.' },
]

function olhados(cenario: CenarioVisao): CarteiraVisao['avisos']['olhados'] {
  return [
    { rotulo: 'Conexão', resultado: cenario === 'velho' ? 'O Nubank parou em 16/07' : 'Nubank atualizado hoje, 9h12', ok: cenario !== 'velho' },
    { rotulo: 'Isenção de novembro', resultado: 'R$ 0 de R$ 20 mil vendidos', ok: true },
    { rotulo: 'Imposto dos meses anteriores', resultado: cenario === 'calmo' ? 'Nenhum mês acima do limite' : '3 meses acima do limite', ok: cenario === 'calmo' },
    { rotulo: 'Proventos de novembro', resultado: 'R$ 1.096 marcados, nenhum cortado', ok: true },
    { rotulo: 'Concentração', resultado: 'O maior ativo é Tesouro Selic, risco de crédito baixo', ok: true },
    { rotulo: 'Taxas dos ETFs', resultado: 'AUPO11 e GOLD11 já são os mais baratos de cada tipo', ok: true },
    { rotulo: 'Quedas de hoje', resultado: 'Nenhum ativo caiu mais de 5%', ok: true },
  ]
}

export function visaoMock(cenario: CenarioVisao = 'normal'): CarteiraVisao {
  const hoje = new Date()
  const isoHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 9, 12).toISOString()
  const velho = cenario === 'velho'
  let itens = AVISOS
  let urgente: string | null = 'imposto.darf:2026-02'
  if (cenario === 'calmo') {
    itens = AVISOS.filter((a) => a.detector === 'proventos.agenda')
    urgente = null
  }
  if (velho) {
    itens = [{
      id: 'conexao:nubank', detector: 'conexao.velha', gravidade: 'alta',
      titulo: 'O Nubank não atualiza desde 16/07.',
      curto: 'O Nubank não atualiza desde 16/07.',
      texto: 'Desde então entraram cotas novas de AUPO11 que eu não vejo. Com dado de quatro meses, eu prefiro não avisar nada sobre imposto ou risco. Reconecte e eu volto a olhar tudo.',
      emJogo: null, prazo: null, confianca: 'certeza', ressalva: null,
      prova: [
        { rotulo: 'Última sincronização', valor: '16/07, 08:02' },
        { rotulo: 'Estado na Pluggy', valor: 'credencial antiga (troca de 28/10)' },
      ],
      fonte: 'Pluggy',
      acoes: [{ tipo: 'ver', rotulo: 'Reconectar o Nubank', alvo: '/conta#open-finance' }],
    }]
    urgente = 'conexao:nubank'
  }

  const semGasto = cenario === 'semgasto'
  const MESES = ['jun', 'jul', 'ago', 'set', 'out']
  const RENDA = [1167, 1090, 1040, 980, 1015]
  const GASTO = [10400, 9100, 11200, 9600, 9800]

  return {
    versao: 'mock-2026-11-06',
    patrimonio: PATRIMONIO,
    conexoes: [{
      id: 'nubank', instituicao: 'Nubank', logo: null,
      atualizadaEm: velho ? '2026-07-16T08:02:00-03:00' : isoHoje,
      estado: velho ? 'caida' : 'ok',
      fontes: semGasto ? ['posicoes', 'transacoes', 'proventos'] : ['posicoes', 'transacoes', 'proventos', 'cartao'],
    }],
    posicoes: POSICOES,
    avisos: {
      olhouEm: isoHoje,
      itens,
      descartados: velho || cenario === 'calmo' ? [] : DESCARTADOS,
      olhados: olhados(cenario),
      urgente,
      retidos: velho ? 5 : 0,
    },
    fatores: fatores(),
    protecoes: [
      { ticker: 'GOLD11', nome: 'Ouro', correlacao: -0.18, porque: 'Tende a subir quando a bolsa e o real caem.' },
      { ticker: 'WEGE3', nome: 'WEG', correlacao: 0.12, porque: 'Metade da receita vem de fora: ganha quando o dólar sobe.' },
      { ticker: 'VALE3', nome: 'Vale', correlacao: 0.16, porque: 'Vende em dólar, para a China.' },
    ],
    juntos: [
      { a: 'PETR4', b: 'PRIO3', correlacao: 0.78 },
      { a: 'Tesouro IPCA+ 2050', b: 'Tesouro IPCA+ 2040', correlacao: 0.97 },
      { a: 'BBSE3', b: 'CXSE3', correlacao: 0.61 },
    ],
    renda: {
      caiu: 1015,
      rendeu: 3240,
      gastoMedio: semGasto ? null : Math.round((GASTO[2]! + GASTO[3]! + GASTO[4]!) / 3),
      mesFechado: 'outubro',
      meses: MESES.map((mes, i) => ({ mes, renda: RENDA[i]!, gasto: semGasto ? null : GASTO[i]! })),
      marcados: [
        { data: '2026-11-10', tickers: ['GARE11', 'HSML11'], valor: 301 },
        { data: '2026-11-14', tickers: ['MCCI11', 'HGLG11'], valor: 357 },
        { data: '2026-11-17', tickers: ['CPTS11'], valor: 158 },
        { data: '2026-11-25', tickers: ['BTLG11', 'XPML11'], valor: 161 },
        { data: '2026-11-28', tickers: ['ITSA4'], valor: 119 },
      ],
      caminhos: CAMINHOS,
    },
    dadosDe: velho ? '16/07' : null,
  }
}
