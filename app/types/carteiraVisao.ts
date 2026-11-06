/**
 * O contrato de `GET /me/carteira/visao` (planejado em 06/11/2026; ver
 * docs/specs/carteira-motor-de-avisos.md). O backend monta tudo, o motor de
 * avisos inclusive, e o front só desenha. Enquanto o endpoint não existe, a
 * tela nova roda no dev com o mock de app/dev/carteiraVisaoMock.ts.
 *
 * Regras que o backend garante (e os testes dele conferem):
 *  - a soma de `posicoes[].valor` é `patrimonio`;
 *  - `fatores[].pct` soma 100 (cada ativo mora num fator só);
 *  - todo número de uma frase está em `prova` (nenhum aviso sem prova);
 *  - fonte velha demais não vira aviso: vira o aviso de conexão, e o resto
 *    espera (`avisos.retidos`).
 */

export type FonteVisao = 'posicoes' | 'transacoes' | 'proventos' | 'cartao'

export interface ConexaoVisao {
  id: string
  instituicao: string
  logo: string | null
  /** ISO da última sincronização que funcionou */
  atualizadaEm: string
  /** 'ok' até 1 dia; 'velha' depois; 'caida' pede reconexão */
  estado: 'ok' | 'velha' | 'caida'
  /** o que essa conexão traz */
  fontes: FonteVisao[]
}

export interface PosicaoVisao {
  ticker: string
  nome: string
  /** STOCK, REIT, ETF, TREASURY, BDR, CRYPTO, FIXED_INCOME */
  classe: string
  valor: number
  /** o fator em que o ativo mora (a lente Riscos) */
  fator: string
}

export type GravidadeAviso = 'alta' | 'media' | 'info' | 'bom'
export type ConfiancaAviso = 'certeza' | 'estimativa' | 'incompleto'

export interface ProvaAviso {
  rotulo: string
  valor: string
}

export interface AcaoAviso {
  tipo: 'simular' | 'ver' | 'perguntar'
  rotulo: string
  /** para 'ver': a âncora ou rota; para 'simular' e 'perguntar': a pergunta pronta */
  alvo: string
}

export interface Aviso {
  /** a chave de dedupe do motor: detector + objeto + período */
  id: string
  /** o detector que achou ('imposto.darf', 'renda.selic'…) */
  detector: string
  gravidade: GravidadeAviso
  /** a frase do fato, curta, com o número */
  titulo: string
  /** a mesma coisa em meia linha, para o estado do topo */
  curto: string
  texto: string
  /** o que está em jogo, à direita ('R$ 249', '~R$ 170/mês') */
  emJogo: string | null
  /** até quando vale ('até 30/11'), ou null */
  prazo: string | null
  confianca: ConfiancaAviso
  /** quando a confiança não é certeza: o que falta saber */
  ressalva: string | null
  prova: ProvaAviso[]
  fonte: string
  acoes: AcaoAviso[]
}

/** um movimento que o motor considerou e não sugeriu, com o veto que barrou */
export interface Descartado {
  id: string
  movimento: string
  veto: string
}

/** o que o motor olhou, aviso ou não (o "Sigo de olho" com prova) */
export interface Olhado {
  rotulo: string
  resultado: string
  ok: boolean
}

export interface AvisosVisao {
  olhouEm: string
  itens: Aviso[]
  descartados: Descartado[]
  olhados: Olhado[]
  /** o id do aviso que sobe para o estado do topo, ou null */
  urgente: string | null
  /** com fonte velha, quantos avisos esperam a conexão voltar */
  retidos: number
}

export interface FatorVisao {
  chave: string
  nome: string
  pct: number
  valor: number
  tickers: string[]
  /** o cenário do motor de simulação para esse fator */
  seCenario: string
  /** o efeito em R$ (texto pronto, com sinal) */
  efeito: string
  efeitoDir: 'up' | 'down'
}

export interface ProtecaoVisao {
  ticker: string
  nome: string
  /** correlação de 1 ano com o resto da carteira */
  correlacao: number
  porque: string
}

export interface ParJuntoVisao {
  a: string
  b: string
  correlacao: number
}

export interface MesRendaVisao {
  mes: string
  renda: number
  gasto: number | null
}

export interface ProventoMarcadoVisao {
  data: string
  tickers: string[]
  valor: number
}

export interface CaminhoVisao {
  id: string
  nome: string
  detalhe: string
  /** o lado ruim, sempre dito */
  custo: string
  /** cobertura da vida (%) mês a mês, 61 pontos (hoje + 60 meses): p10, mediana e p90 */
  p10: number[]
  mediana: number[]
  p90: number[]
}

export interface RendaVisao {
  /** caiu na conta no último mês fechado */
  caiu: number
  /** rendeu e ficou investido (AUPO11, Tesouro) no mesmo mês */
  rendeu: number
  /** média de 3 meses; null sem cartão e conta */
  gastoMedio: number | null
  mesFechado: string
  meses: MesRendaVisao[]
  marcados: ProventoMarcadoVisao[]
  caminhos: CaminhoVisao[]
}

export interface CarteiraVisao {
  versao: string
  patrimonio: number
  conexoes: ConexaoVisao[]
  posicoes: PosicaoVisao[]
  avisos: AvisosVisao
  fatores: FatorVisao[]
  protecoes: ProtecaoVisao[]
  juntos: ParJuntoVisao[]
  renda: RendaVisao
  /** com fonte velha, a data dos dados que a tela mostra */
  dadosDe: string | null
}
