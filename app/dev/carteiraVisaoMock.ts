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
 *
 * 07/11/2026: o imposto do mês (só o normal vendeu em novembro: R$ 18,7 mil
 * em ações, a R$ 1,3 mil da isenção, mais um FII com lucro; outubro ficou
 * isento), o relatório (relatorioMock, uma carteira com 53% em renda fixa) e,
 * para a página do dev, as movimentações e o P&L (movimentosMock, heatmapMock).
 * Os textos dos indicadores são os do backend (Indicadores::CATALOGO).
 *
 * 07/11/2026, com a resposta real do backend (feat/carteira-motor): o estado
 * de cada aviso (os dois primeiros novos), o método de cada fator, a fonte do
 * "rendeu" e as notas do imposto no formato de `Imposto::grupoDoMes` (a
 * explicação do mês, com os números).
 *
 * 08/11/2026: uma ideia nova (ideia.ajustes) com o antes → depois das 4 notas
 * do relatório (`Aviso.notas`). O antes são os pilares do relatorioMock, e o
 * "Ver o relatório" abre o relatório na própria página.
 */
import type { Aviso, CarteiraVisao, CaminhoVisao, ImpostoVisao, MesHistorico, MesImposto, OperacaoImposto, PosicaoVisao } from '~/types/carteiraVisao'
import type { CarteiraRelatorio, IndicadorRelatorio, PilarRelatorio, UnidadeRelatorio } from '~/types/carteiraRelatorio'
import type { CarteiraHeatmapVM, CarteiraMovementsVM, CarteiraMovementVM } from '~/types/carteira'

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

const MOTOR = 'Simulação da Redentia (motor de cenários): '
const FATORES_BASE: Omit<CarteiraVisao['fatores'][number], 'pct' | 'valor' | 'tickers'>[] = [
  { chave: 'juros', nome: 'Inflação e juros longos', seCenario: 'Se os juros longos subirem 1 ponto', efeito: '−R$ 21 mil', efeitoDir: 'down', metodo: `${MOTOR}juros 1 ponto acima de hoje (pelo dial da Selic), que remarca o Tesouro IPCA+ e o prefixado pela duração e reprecifica os FIIs.` },
  { chave: 'selic', nome: 'Selic', seCenario: 'Cada corte de 1 ponto na Selic', efeito: '−R$ 170 por mês de rendimento', efeitoDir: 'down', metodo: 'Conta simples: 1 ponto de Selic ao ano sobre R$ 203.544, ÷ 12.' },
  { chave: 'brasil', nome: 'Economia do Brasil', seCenario: 'Se o Ibovespa cair 10%', efeito: '−R$ 12 mil', efeitoDir: 'down', metodo: `${MOTOR}Ibovespa −10% de uma vez, com o beta de cada papel.` },
  { chave: 'petroleo', nome: 'Petróleo', seCenario: 'Se o petróleo cair 20%', efeito: '−R$ 6 mil', efeitoDir: 'down', metodo: `${MOTOR}petróleo −20%, pela exposição de cada papel ao petróleo.` },
  { chave: 'dolar', nome: 'Exportação e dólar', seCenario: 'Se o dólar subir 10%', efeito: '+R$ 2,6 mil', efeitoDir: 'up', metodo: `${MOTOR}dólar +10% sobre a cotação de hoje, pela exposição de cada papel ao câmbio.` },
  { chave: 'ouro', nome: 'Ouro', seCenario: 'Se o ouro subir 10%', efeito: '+R$ 1 mil', efeitoDir: 'up', metodo: 'Estimativa simples: o ETF de ouro acompanha o ouro em reais, então +10% no ouro dá uns +10% nele.' },
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
    pergunta: 'Devo imposto?', canais: ['tela', 'email', 'whatsapp'], estado: 'novo',
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
    pergunta: 'Ninguém me avisou do risco?', canais: ['tela'], estado: 'novo',
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
    pergunta: 'Quanto vou receber?', canais: ['tela', 'email', 'whatsapp'], estado: 'visto',
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
    pergunta: 'Devo imposto?', canais: ['tela', 'email'], estado: 'visto',
  },
  {
    id: 'imposto.isencao:2026-11', detector: 'imposto.isencao', gravidade: 'info',
    titulo: 'Você já vendeu R$ 18,7 mil em ações em novembro.',
    curto: 'Faltam R$ 1.300 para a isenção de novembro.',
    texto: 'Mais R$ 1.300 em vendas de ações e o lucro do mês inteiro paga 15% de imposto. Em dezembro, o limite volta a ser R$ 20 mil.',
    emJogo: 'R$ 1.300', prazo: 'até 30/11', confianca: 'certeza', ressalva: null,
    prova: [
      { rotulo: 'Vendas de ações em novembro', valor: 'R$ 18.700' },
      { rotulo: 'Isenção por mês (vendas de ações)', valor: 'R$ 20.000' },
      { rotulo: 'Ainda cabe', valor: 'R$ 20.000 − R$ 18.700 = R$ 1.300' },
    ],
    fonte: 'Transações da Pluggy, regra da Receita (Lei 11.033/2004, art. 3º, I)',
    acoes: [{ tipo: 'ver', rotulo: 'Ver o imposto do mês', alvo: '#imposto' }],
    pergunta: 'Quanto ainda posso vender sem imposto?', canais: ['tela', 'email', 'whatsapp'], estado: 'visto',
  },
  {
    // 08/11: o antes das notas é o do relatorioMock (os pilares 62, 81, 59 e 86), como no backend ("antes" = a nota do relatório)
    id: 'ideia.ajustes:2026-11', detector: 'ideia.ajustes', gravidade: 'info',
    titulo: '3 ajustes pequenos subiriam 3 das 4 notas da carteira, sem baixar nenhuma.',
    curto: '3 ajustes pequenos subiriam 3 das 4 notas.',
    texto: 'Numa simulação, com os três juntos: R$ 9,8 mil de ações de saúde por ações de energia elétrica, R$ 6 mil de Tesouro IPCA+ por outro título do Tesouro IPCA+ e aplicar R$ 1,1 mil dos proventos do mês em um ETF de ouro que você já tem. Medi no mesmo relatório, como se eles estivessem na carteira desde 02/05/2025.',
    emJogo: null, prazo: null, confianca: 'estimativa',
    ressalva: 'Risco e Diversificação olham a carteira de hoje; Retorno e Eficiência, o passado, e rentabilidade passada não é garantia de rentabilidade futura. Nos 2.000 cenários dos próximos 5 anos, o resultado dos 10% piores não cai. Não é recomendação.',
    prova: [
      { rotulo: '1º ajuste', valor: 'R$ 9,8 mil de ações de saúde por ações de energia elétrica' },
      { rotulo: '2º ajuste', valor: 'R$ 6 mil de Tesouro IPCA+ por outro título do Tesouro IPCA+' },
      { rotulo: '3º ajuste', valor: 'aplicar R$ 1,1 mil dos proventos do mês em um ETF de ouro que você já tem' },
      { rotulo: 'Período do relatório', valor: '02/05/2025 a 06/11/2026' },
      { rotulo: 'Notas (antes → depois)', valor: 'Retorno 62 → 65 · Risco 81 → 82 · Eficiência 59 → 63 · Diversificação 86 → 86' },
      { rotulo: 'Cenários de 5 anos, os 10% piores', valor: 'R$ 702 mil → R$ 706 mil' },
    ],
    fonte: 'O relatório da carteira (a curva real, o benchmark composto, o CDI e o IPCA) e o motor de cenários da Redentia',
    acoes: [
      { tipo: 'ver', rotulo: 'Ver o relatório', alvo: '#relatorio' },
      { tipo: 'simular', rotulo: 'Simular', alvo: 'Simule estes 3 ajustes na minha carteira: R$ 9,8 mil de ações de saúde por ações de energia elétrica, R$ 6 mil de Tesouro IPCA+ por outro título do Tesouro IPCA+ e aplicar R$ 1,1 mil dos proventos do mês em um ETF de ouro que você já tem. O que muda nas notas do relatório e nos cenários de 5 anos?' },
    ],
    pergunta: 'Pequenos ajustes melhorariam as notas da minha carteira?', canais: ['tela'], estado: 'novo',
    notas: [
      { pilar: 'retorno', nome: 'Retorno', antes: 62, depois: 65 },
      { pilar: 'risco', nome: 'Risco', antes: 81, depois: 82 },
      { pilar: 'eficiencia', nome: 'Eficiência', antes: 59, depois: 63 },
      { pilar: 'diversificacao', nome: 'Diversificação', antes: 86, depois: 86 },
    ],
  },
]

const DESCARTADOS: CarteiraVisao['avisos']['descartados'] = [
  { id: 'vender:WEGE3', movimento: 'Trocar WEGE3 por uma ação que paga mais dividendo', veto: 'A WEG protege a carteira do dólar e paga pouco porque reinveste. Trocar por dividendo deixaria você mais exposto ao Brasil.' },
  { id: 'vender:GOLD11', movimento: 'Vender GOLD11 para comprar renda', veto: 'É o único ativo que tende a subir quando o resto cai (correlação de −0,18 com a carteira).' },
  { id: 'vender:PRIO3', movimento: 'Vender PRIO3 para reduzir o petróleo', veto: 'Está no quartil de cima da nota da Redentia e acima da média de 200 dias. Com sinal de alta, ele fica fora das trocas.' },
  { id: 'comprar:FII-papel', movimento: 'Comprar mais FII de papel para a renda', veto: 'Os juros longos já são 37% da carteira, e FII de papel reforça esse mesmo risco.' },
]

/* ————— o imposto do mês ————— */
const op = (data: string, ticker: string, nome: string, lado: OperacaoImposto['lado'], quantidade: number, preco: number, grupo: OperacaoImposto['grupo']): OperacaoImposto =>
  ({ data, ticker, nome, lado, quantidade, valor: Math.round(quantidade * preco * 100) / 100, grupo })

// novembro do cenário normal: R$ 18.700 em ações (a R$ 1.300 da isenção) e um FII com R$ 412 de lucro
const OPS_NOVEMBRO = [
  op('2026-11-03', 'VALE3', 'Vale', 'venda', 200, 60.5, 'acoes'),
  op('2026-11-04', 'HGLG11', 'CSHG Logística', 'venda', 40, 154.5, 'fii'),
  op('2026-11-05', 'RANI3', 'Irani', 'venda', 1000, 6.6, 'acoes'),
  op('2026-11-06', 'ITSA4', 'Itaúsa', 'compra', 1000, 10.9, 'acoes'),
]
/** os 11 meses antes de novembro, iguais em todo cenário (o passado não depende da conexão de hoje) */
const HISTORICO_ANTES: MesHistorico[] = [
  { mes: '2025-12', vendas: 0, selo: 'sem_venda', operacoes: [op('2025-12-10', 'AUPO11', 'AUPO11', 'compra', 300, 102.4, 'rf')] },
  { mes: '2026-01', vendas: 31204, selo: 'custo_desconhecido', operacoes: [op('2026-01-14', 'BBAS3', 'Banco do Brasil', 'venda', 1000, 28.04, 'acoes'), op('2026-01-21', 'ABEV3', 'Ambev', 'venda', 226, 14, 'acoes')] },
  { mes: '2026-02', vendas: 154380, selo: 'custo_desconhecido', operacoes: [op('2026-02-09', 'ITUB4', 'Itaú Unibanco', 'venda', 2000, 38.4, 'acoes'), op('2026-02-19', 'BBDC4', 'Bradesco', 'venda', 4500, 17.24, 'acoes')] },
  { mes: '2026-03', vendas: 40112, selo: 'a_conferir', operacoes: [op('2026-03-12', 'EGIE3', 'Engie Brasil', 'venda', 1000, 40.112, 'acoes')] },
  { mes: '2026-04', vendas: 22950, selo: 'pago', operacoes: [op('2026-04-08', 'BOVA11', 'BOVA11', 'venda', 180, 127.5, 'etf')] },
  { mes: '2026-05', vendas: 0, selo: 'sem_venda', operacoes: [op('2026-05-06', 'GOLD11', 'GOLD11', 'compra', 600, 16.95, 'etf')] },
  { mes: '2026-06', vendas: 8900, selo: 'isento', operacoes: [op('2026-06-17', 'CMIG4', 'Cemig', 'venda', 800, 11.125, 'acoes')] },
  { mes: '2026-07', vendas: 0, selo: 'sem_venda', operacoes: [op('2026-07-02', 'XPML11', 'XP Malls', 'compra', 81, 108.9, 'fii')] },
  { mes: '2026-08', vendas: 0, selo: 'sem_venda', operacoes: [] },
  { mes: '2026-09', vendas: 9800, selo: 'isento', operacoes: [op('2026-09-23', 'TAEE11', 'Taesa', 'venda', 280, 35, 'acoes')] },
  { mes: '2026-10', vendas: 12400, selo: 'isento', operacoes: [op('2026-10-15', 'PETR4', 'Petrobras', 'venda', 400, 31, 'acoes')] },
]

/** a nota de cada grupo, no texto de `Imposto::grupoDoMes` (a explicação do mês, com os números) */
const reais = (v: number) => `R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)}`
function notaMock(grupo: 'acoes' | 'fii' | 'etf' | 'rf', vendido: number): string {
  if (grupo === 'acoes') return vendido > 0 ? `Vendido ${reais(vendido)} de R$ 20 mil isentos; ainda cabe ${reais(Math.max(0, 20000 - vendido))}.` : 'Sem vendas de ações no mês: cabem os R$ 20 mil inteiros.'
  if (grupo === 'rf') return vendido > 0 ? 'O imposto da renda fixa (Tesouro, CDB, ETF de renda fixa) é retido na fonte, de 22,5% a 15% pelo prazo: não entra no DARF.' : 'Sem vendas de renda fixa no mês.'
  return `${grupo === 'fii' ? 'FII' : 'ETF'}: ${reais(vendido)} vendidos, sem isenção; o lucro paga ${grupo === 'fii' ? 20 : 15}%.`
}

function mesSemVenda(mes: string, acoesVendidas = 0, lucroAcoes = 0): MesImposto {
  return {
    mes,
    grupos: [
      { grupo: 'acoes', vendido: acoesVendidas, lucro: lucroAcoes, isencao: 20000, cabeAinda: 20000 - acoesVendidas, impostoEstimado: 0, aliquota: 0.15, custoConhecido: true, nota: notaMock('acoes', acoesVendidas) },
      { grupo: 'fii', vendido: 0, lucro: 0, isencao: null, cabeAinda: null, impostoEstimado: 0, aliquota: 0.2, custoConhecido: true, nota: notaMock('fii', 0) },
      { grupo: 'etf', vendido: 0, lucro: 0, isencao: null, cabeAinda: null, impostoEstimado: 0, aliquota: 0.15, custoConhecido: true, nota: notaMock('etf', 0) },
      { grupo: 'rf', vendido: 0, lucro: 0, isencao: null, cabeAinda: null, impostoEstimado: 0, aliquota: 0, custoConhecido: true, nota: notaMock('rf', 0) },
    ],
    darf: { valor: null, vence: null, codigo: '6015' },
  }
}

export function impostoMock(cenario: CenarioVisao = 'normal'): ImpostoVisao {
  const vendeu = cenario === 'normal'
  // outubro, isento: R$ 12.400 de PETR4, com R$ 860 de lucro
  const mesAnterior = mesSemVenda('2026-10', 12400, 860)
  let mesAtual = mesSemVenda('2026-11')
  if (vendeu) {
    mesAtual = mesSemVenda('2026-11', 18700, 2500)
    // HGLG11: 40 cotas a R$ 154,50, com preço médio de R$ 144,20 → R$ 412 de lucro, 20% = R$ 82,40
    mesAtual.grupos[1] = { ...mesAtual.grupos[1]!, vendido: 6180, lucro: 412, impostoEstimado: 82.4, nota: notaMock('fii', 6180) }
    // o DARF de novembro vence no último dia útil de dezembro: 31/12 não tem expediente, então 30/12
    mesAtual.darf = { valor: 82.4, vence: '2026-12-30', codigo: '6015' }
  }
  const novembro: MesHistorico = vendeu
    ? { mes: '2026-11', vendas: 24880, selo: 'a_conferir', operacoes: OPS_NOVEMBRO }
    : { mes: '2026-11', vendas: 0, selo: 'sem_venda', operacoes: [] }
  return { mesAtual, mesAnterior, historico: [...HISTORICO_ANTES, novembro] }
}

function olhados(cenario: CenarioVisao): CarteiraVisao['avisos']['olhados'] {
  return [
    { rotulo: 'Conexão', resultado: cenario === 'velho' ? 'O Nubank parou em 16/07' : 'Nubank atualizado hoje, 9h12', ok: cenario !== 'velho' },
    { rotulo: 'Isenção de novembro', resultado: cenario === 'normal' ? 'R$ 18.700 de R$ 20 mil vendidos' : 'R$ 0 de R$ 20 mil vendidos', ok: true },
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
  // só o normal vendeu ações em novembro: nos outros, o aviso da isenção não existe
  let itens = cenario === 'normal' ? AVISOS : AVISOS.filter((a) => a.detector !== 'imposto.isencao')
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
      pergunta: 'Os meus números estão em dia?', canais: ['tela'], estado: 'novo',
    }]
    urgente = 'conexao:nubank'
  }

  const semGasto = cenario === 'semgasto'
  const MESES = ['jun', 'jul', 'ago', 'set', 'out']
  const RENDA = [1167, 1090, 1040, 980, 1015]
  const GASTO = [10400, 9100, 11200, 9600, 9800]

  return {
    versao: 'mock-2026-11-07',
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
      rendeuFonte: 'Estimativa: a Selic diária de outubro (Banco Central) sobre o que rende a Selic e o IPCA de setembro (IBGE) mais a taxa de cada título sobre o Tesouro IPCA+.',
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
    imposto: impostoMock(cenario),
    geradoEm: isoHoje,
  }
}

/* ————— o relatório: uma carteira com 53% em renda fixa, de 02/05/2025 a 06/11/2026 —————
 * As notas seguem as faixas do backend (Nota::FAIXAS); o pilar é a mediana das
 * notas dele e a nota final, a mediana dos pilares (o teste confere). */
type LinhaIndicador = [chave: string, nome: string, pilar: PilarRelatorio, unidade: UnidadeRelatorio, valor: number, bench: number | null, nota: number, descricao: string, comoCalculei: string]
const INDICADORES: LinhaIndicador[] = [
  ['twr', 'Rentabilidade (TWR)', 'retorno', '%', 21.42, 18.9, 63, 'Quanto a carteira rendeu no período, sem a distorção de quando você colocou ou tirou dinheiro.', 'Em cada pregão, somei ao valor do fim do dia o provento recebido, tirei o que entrou em compras (ou devolvi o que saiu em vendas) e dividi pelo valor do dia anterior. Depois multipliquei os retornos de todos os dias.'],
  ['mwr', 'Rentabilidade do seu dinheiro (MWR)', 'retorno', '%', 13.1, 12.22, 56, 'A taxa ao ano que o seu dinheiro rendeu, contando quando e quanto você aportou e retirou.', 'É a taxa interna de retorno (XIRR) dos seus fluxos: o valor da carteira no começo e cada compra como saída, cada venda e cada provento como entrada, e o valor no fim como entrada, com ano de 365 dias.'],
  ['cagr', 'Rentabilidade ao ano (CAGR)', 'retorno', '%', 13.81, 12.22, 60, 'A rentabilidade do período levada para uma taxa ao ano.', 'Elevei 1 + a TWR a 252 dividido pelo número de pregões do período e tirei 1.'],
  ['retorno_real', 'Rentabilidade acima da inflação', 'retorno', '%', 8.42, 6.96, 82, 'Quanto a carteira rendeu ao ano depois de descontar o IPCA.', 'Dividi 1 + a TWR por 1 + o IPCA acumulado no período (cada mês na proporção dos dias que caem no período) e levei para ao ano como no CAGR.'],
  ['volatilidade', 'Volatilidade', 'risco', '%', 7.84, 8.92, 89, 'O quanto o valor da carteira sobe e desce no dia a dia, em taxa ao ano.', 'Desvio-padrão dos retornos diários vezes a raiz de 252.'],
  ['downside_deviation', 'Volatilidade das quedas', 'risco', '%', 5.12, 6.03, 89, 'Como a volatilidade, mas só conta os dias em que a carteira rendeu menos que o CDI.', 'Em cada pregão, peguei quanto a carteira rendeu abaixo do CDI do dia (zero quando rendeu mais), tirei a raiz da média dos quadrados e multipliquei pela raiz de 252.'],
  ['max_drawdown', 'Maior queda', 'risco', '%', -9.46, -11.2, 81, 'A maior perda do pico ao fundo no período.', 'Acumulei os retornos diários num índice e, em cada dia, comparei com o maior valor que ele já tinha atingido. A pior diferença é a maior queda.'],
  ['beta', 'Beta', 'risco', 'x', 0.78, null, 81, 'Quanto a carteira costuma se mexer quando o benchmark se mexe 1%.', 'Regressão dos retornos diários acima do CDI da carteira contra os do benchmark: o beta é a inclinação da reta (a covariância dividida pela variância do benchmark).'],
  ['r2', 'R²', 'risco', '', 0.81, null, 75, 'Quanto do sobe e desce da carteira o benchmark explica, de 0 a 1.', 'O quadrado da correlação entre os retornos diários acima do CDI da carteira e os do benchmark.'],
  ['sharpe', 'Índice de Sharpe', 'eficiencia', '', -0.08, -0.31, 21, 'Quanto a carteira rendeu acima do CDI para cada unidade de risco que correu.', 'Média dos retornos diários acima do CDI dividida pelo desvio-padrão deles, vezes a raiz de 252.'],
  ['sortino', 'Índice de Sortino', 'eficiencia', '', -0.12, -0.45, 19, 'Como o Sharpe, mas o risco é só o das quedas abaixo do CDI.', 'Média diária do retorno acima do CDI vezes 252, dividida pela volatilidade das quedas.'],
  ['treynor', 'Índice de Treynor', 'eficiencia', '%', -0.77, -2.18, 59, 'Quanto a carteira rendeu acima do CDI, ao ano, para cada unidade de beta (o risco de mercado).', 'Média diária do retorno acima do CDI vezes 252, dividida pelo beta.'],
  ['alpha_jensen', 'Alpha de Jensen', 'eficiencia', '%', 1.32, null, 58, 'O que a carteira rendeu a mais, ou a menos, do que o benchmark explicaria pelo beta, ao ano.', 'O intercepto da regressão dos retornos diários acima do CDI da carteira contra os do benchmark, vezes 252.'],
  ['m2', 'M² (Modigliani)', 'eficiencia', '%', 13.69, 12.22, 59, 'Quanto a carteira renderia ao ano se tivesse corrido o mesmo risco do benchmark.', 'O Sharpe da carteira vezes a volatilidade do benchmark acima do CDI, mais o CDI médio do período, ao ano.'],
  ['information_ratio', 'Information ratio', 'eficiencia', '', 0.41, null, 71, 'Quanto a carteira ganhou do benchmark para cada unidade de distância do caminho dele.', 'Média diária de (retorno da carteira − retorno do benchmark) vezes 252, dividida pelo tracking error.'],
  ['tracking_error', 'Tracking error', 'eficiencia', '%', 3.84, null, 74, 'O quanto o caminho da carteira se afasta do benchmark, em taxa ao ano.', 'Desvio-padrão da diferença diária entre o retorno da carteira e o do benchmark, vezes a raiz de 252.'],
  ['appraisal_ratio', 'Appraisal ratio', 'eficiencia', '', 0.27, null, 64, 'O alpha dividido pelo risco que é só da carteira, o que o benchmark não explica.', 'O alpha de Jensen dividido pelo desvio-padrão dos resíduos da regressão vezes a raiz de 252.'],
  ['maior_posicao', 'Maior posição em renda variável', 'diversificacao', '%', 4.5, null, 100, 'O peso do maior ativo de renda variável na carteira. Título de renda fixa não entra: concentração em Tesouro não é o risco de uma empresa.', 'O valor do maior ativo de renda variável (ação, FII, ETF que não é de renda fixa, BDR ou cripto) no último pregão, dividido pelo valor da carteira.'],
  ['maior_classe', 'Maior classe', 'diversificacao', '%', 53.28, null, 66, 'O peso da classe com mais dinheiro: renda fixa, ações, FIIs, exterior ou cripto.', 'Somei o valor dos ativos de cada classe no último pregão e dividi a maior soma pelo valor da carteira.'],
  ['numero_de_ativos', 'Número de ativos', 'diversificacao', '', 22, null, 100, 'Quantos ativos diferentes a carteira tem.', 'Contei os ativos com valor no último pregão.'],
  ['correlacao_media', 'Correlação média', 'diversificacao', '', 0.31, null, 71, 'O quanto os ativos de renda variável sobem e descem juntos: perto de 1, juntos; perto de 0, cada um no seu ritmo.', 'Correlação de Spearman (pela ordem dos retornos, para um dia extremo não dominar) dos retornos diários de cada par de ativos de renda variável nos últimos 252 pregões, com o provento somado de volta no dia ex. Só entram pares com pelo menos 60 pregões juntos; a nota é a média simples dos pares.'],
]

/**
 * um índice base 100, um ponto por dia útil de 02/05/2025 a 06/11/2026, que
 * termina exatamente em `fim`: a TWR da série inteira é o `retorno.twr` do
 * mock, e o desempenho (a TWR contra o benchmark) e a legenda do topo cortam
 * esta série por período, como fazem com a resposta real
 */
function indiceDiario(fim: number, ondula: number): CarteiraRelatorio['series']['carteira'] {
  const dias: string[] = []
  for (let t = Date.UTC(2025, 4, 2); t <= Date.UTC(2026, 10, 6); t += 86_400_000) {
    const d = new Date(t)
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) dias.push(d.toISOString().slice(0, 10))
  }
  const n = dias.length - 1
  // a onda zera nas pontas (sen de 9π): o primeiro ponto é 100 e o último, `fim`
  return dias.map((t, i) => ({ t, v: +(100 + (fim - 100) * (i / n) + Math.sin((i / n) * Math.PI * 9) * ondula).toFixed(2) }))
}

export function relatorioMock(): CarteiraRelatorio {
  const hoje = new Date()
  const indicadores: IndicadorRelatorio[] = INDICADORES.map(([chave, nome, pilar, unidade, valor, bench, nota, descricao, comoCalculei]) => ({ chave, nome, pilar, unidade, valor, bench, nota, descricao, comoCalculei }))
  return {
    periodo: { inicio: '2025-05-02', fim: '2026-11-06', dias: 553, pregoes: 378, historicoCurto: false },
    benchmark: {
      nome: 'Composto pelas classes da carteira',
      composicao: [{ indice: 'CDI', peso: 53.2 }, { indice: 'IBOV', peso: 27.4 }, { indice: 'IFIX', peso: 19.4 }],
      notas: [
        'Benchmark composto pelas classes da carteira, com os pesos refeitos todo mês: renda fixa = CDI, ações e ETF de ações do Brasil = IBOV, FII = IFIX, BDR e ETF do exterior = IVVB11.',
        'O CDI é a Selic diária do Banco Central (SGS 11), que anda praticamente junto com ele.',
        'Proventos entram no dia ex, pela quantidade na data-com e pelo valor da B3; JCP líquido do IR. IBOV e IFIX já incluem os proventos.',
      ],
    },
    retorno: { twr: 21.42, mwr: 13.1, cagr: 13.81, real: 8.42 },
    indicadores,
    pilares: [
      { chave: 'retorno', nome: 'Retorno', nota: 62 },
      { chave: 'risco', nome: 'Risco', nota: 81 },
      { chave: 'eficiencia', nome: 'Eficiência', nota: 59 },
      { chave: 'diversificacao', nome: 'Diversificação', nota: 86 },
    ],
    nota: 72,
    series: { carteira: indiceDiario(121.42, 1.6), benchmark: indiceDiario(118.9, 1.9), cdi: indiceDiario(122.6, 0), ibov: indiceDiario(106.4, 4.2) },
    geradoEm: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 9, 12).toISOString(),
  }
}

/* ————— só a página do dev: as movimentações (do histórico do imposto) e o P&L ————— */
const MES3 = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
const TILES: [string, string][] = [['var(--nu-tile-blue-bg)', 'var(--nu-blue-deep)'], ['var(--nu-tile-green-bg)', 'var(--nu-green-2)'], ['var(--nu-tile-red-bg)', 'var(--nu-red-2)']]
const nfMov = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nfQtd = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

export function movimentosMock(): CarteiraMovementsVM {
  const ops = impostoMock('normal').historico.flatMap((m) => m.operacoes).sort((a, b) => b.data.localeCompare(a.data))
  const eventos: CarteiraMovementVM[] = ops.map((o, i) => {
    const valRaw = o.lado === 'venda' ? o.valor : -o.valor
    return {
      key: `${o.lado}-${o.ticker}-${o.data}`, d: o.data.slice(8, 10), m: MES3[Number(o.data.slice(5, 7)) - 1]!, mes: o.data.slice(0, 7),
      ticker: o.ticker, letter: o.ticker.charAt(0), tileBg: TILES[i % 3]![0], tileFg: TILES[i % 3]![1],
      badge: o.lado === 'venda' ? 'Venda' : 'Compra',
      // no mock toda operação tem quantidade; a resposta real pode vir sem (OperacaoImposto.quantidade null)
      sub: o.quantidade ? `${nfQtd.format(o.quantidade)} ${o.grupo === 'fii' ? 'cotas' : o.grupo === 'acoes' ? 'ações' : 'cotas'} × R$ ${nfMov.format(o.valor / o.quantidade)}` : o.nome,
      valRaw, val: `${valRaw < 0 ? '-' : '+'}R$ ${nfMov.format(Math.abs(valRaw))}`,
    }
  })
  const doMes = eventos.filter((e) => e.mes === eventos[0]!.mes)
  const saldo = doMes.reduce((s, e) => s + e.valRaw, 0)
  return { monthLabel: 'Novembro 2026', saldo: `${saldo < 0 ? '-' : '+'}R$ ${nfMov.format(Math.abs(saldo))}`, saldoDir: saldo < 0 ? 'down' : 'up', monthEvents: doMes, allEvents: eventos }
}

const nfPct = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const celula = (v: number | null) => {
  if (v == null) return null
  const alpha = 0.12 + 0.88 * Math.min(1, Math.abs(v) / 3.5)
  return { txt: `${v < 0 ? '−' : '+'}${nfPct.format(Math.abs(v))}%`, alpha, neg: v < 0, inkWhite: alpha > 0.5 }
}
export function heatmapMock(): CarteiraHeatmapVM {
  const anos: [string, (number | null)[]][] = [
    ['2025', [null, null, null, null, 1.2, 0.8, -0.6, 1.9, 1.4, 0.9, 1.6, 0.7]],
    ['2026', [2.1, -0.4, 1.1, 0.6, 1.3, 0.9, 1.5, 0.4, 1.2, -3.9, 0.5, null]],
  ]
  return {
    sub: 'Retorno mensal da carteira, com proventos · 2025–2026',
    years: anos.map(([y, ms]) => {
      const ano = (ms.reduce<number>((acc, v) => acc * (1 + (v ?? 0) / 100), 1) - 1) * 100
      return { y, cells: ms.map(celula), ano: `${ano < 0 ? '−' : '+'}${nfPct.format(Math.abs(ano))}%`, anoNeg: ano < 0 }
    }),
    note: 'nov/2026 é parcial · células vazias são meses sem carteira ou futuros',
  }
}
