/**
 * O contrato de `GET /me/carteira/visao` (planejado em 06/11/2026; ver
 * docs/specs/carteira-motor-de-avisos.md). O backend monta tudo, o motor de
 * avisos inclusive, e o front só desenha (composables/useCarteiraVisao.ts).
 * No dev, ?cenario= troca a resposta pelo mock de app/dev/carteiraVisaoMock.ts.
 * O backend é dono do formato: se mudar, este arquivo muda no mesmo PR.
 *
 * Regras que o backend garante (e os testes dele conferem):
 *  - a soma de `posicoes[].valor` é `patrimonio`;
 *  - `fatores[].pct` soma 100 (cada ativo mora num fator só);
 *  - todo número de uma frase está em `prova` (nenhum aviso sem prova);
 *  - fonte velha demais não vira aviso: vira o aviso de conexão, e o resto
 *    espera (`avisos.retidos`);
 *  - um bloco que quebra no servidor some, nunca com zero falso
 *    (`VisaoDaCarteira::bloco`): `renda` e `imposto` vêm null e `fatores`, [].
 *
 * Conferido contra a resposta real em 07/11/2026 (a fixture do dono, branch
 * feat/carteira-motor 8b80971): o backend manda também `Aviso.estado`,
 * `FatorVisao.metodo` e `RendaVisao.rendeuFonte`; `ConexaoVisao.atualizadaEm`
 * e `OperacaoImposto.quantidade` podem vir null; e `GrupoImpostoVisao.nota` é a
 * explicação do grupo no mês, com os números, e não a regra numa frase.
 */

export type FonteVisao = 'posicoes' | 'transacoes' | 'proventos' | 'cartao'

export interface ConexaoVisao {
  id: string
  instituicao: string
  logo: string | null
  /** ISO da última sincronização que funcionou; null se nunca sincronizou (o estado vem 'velha') */
  atualizadaEm: string | null
  /** 'ok' até 48 h (`carteira.conexao_velha_horas`); 'velha' depois; 'caida' pede reconexão */
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

/** por onde o aviso pode sair (a tela sempre; e-mail e WhatsApp com o opt-in do tópico) */
export type CanalAviso = 'tela' | 'email' | 'whatsapp'

/**
 * O que a pessoa já fez com o aviso (carteira_avisos, `EstadoDosAvisos`): `novo`
 * na primeira leitura e `visto` depois que ela abriu os avisos (ou desfez um
 * "Já sei"). O resolvido não volta no /visao, e o adiado volta como `novo`
 * quando o prazo passa.
 */
export type EstadoAviso = 'novo' | 'visto'

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
  /** a dúvida do investidor que o aviso responde ('Devo imposto?'); detector sem pergunta não vira aviso */
  pergunta: string
  canais: CanalAviso[]
  estado: EstadoAviso
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
  /** como o efeito foi calculado (o motor de cenários, ou a conta simples), numa frase: o "Como calculei" da lente */
  metodo: string
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
  /** rendeu e ficou investido (AUPO11, Tesouro) no mesmo mês, estimado */
  rendeu: number
  /** de onde sai o `rendeu` ('Estimativa: a Selic diária de outubro…'; sem nada que renda: 'Nada na carteira rende sem pagar provento.') */
  rendeuFonte: string
  /** média de 3 meses; null sem cartão e conta */
  gastoMedio: number | null
  mesFechado: string
  meses: MesRendaVisao[]
  marcados: ProventoMarcadoVisao[]
  caminhos: CaminhoVisao[]
}

/* ————— o imposto do mês (contrato de 07/11/2026, run-state "ImpostoVisao") —————
 * As regras são as de ir-regras-conferidas-out-2026: ações à vista isentas até
 * R$ 20 mil de vendas no mês (Lei 11.033/2004, art. 3º, I), 15% sobre o lucro
 * acima disso; FII 20% e ETF 15%, sem isenção; renda fixa retida na fonte;
 * DARF 6015 no último dia útil do mês seguinte (antecipa). O backend calcula,
 * o front só desenha. */

export type GrupoImposto = 'acoes' | 'fii' | 'etf' | 'rf' | 'cripto'

export interface GrupoImpostoVisao {
  grupo: GrupoImposto
  /** o total vendido (ou resgatado) no mês, em R$ */
  vendido: number
  /** o lucro das vendas do mês; null quando falta o custo */
  lucro: number | null
  /** o teto de vendas isentas no mês (ações: 20 mil); null quando o grupo não tem isenção */
  isencao: number | null
  /** isenção − vendido, nunca abaixo de zero; null sem isenção */
  cabeAinda: number | null
  /** o imposto do mês, estimado; null quando falta o custo */
  impostoEstimado: number | null
  /** 0,15 · 0,20 */
  aliquota: number
  custoConhecido: boolean
  /**
   * a explicação do grupo no mês, com os números ('Vendido R$ 7,87 de R$ 20 mil
   * isentos; ainda cabe R$ 19.992,13. R$ 7,87 das vendas têm o custo
   * desconhecido, mas o mês é isento.'): o day trade, o prejuízo abatido, o custo
   * que falta e desde quando há histórico. A tela mostra como veio.
   */
  nota: string
}

export interface DarfVisao {
  /** null sem imposto a pagar no mês */
  valor: number | null
  /** ISO ('2026-12-30'), o último dia útil do mês seguinte; null sem DARF */
  vence: string | null
  codigo: '6015'
}

export interface MesImposto {
  /** '2026-11' */
  mes: string
  grupos: GrupoImpostoVisao[]
  darf: DarfVisao
}

export type SeloImposto = 'isento' | 'pago' | 'a_conferir' | 'custo_desconhecido' | 'sem_venda'

export interface OperacaoImposto {
  /** ISO do pregão */
  data: string
  ticker: string
  nome: string
  lado: 'compra' | 'venda'
  /** null quando a corretora não manda (direito de subscrição, provento lançado como negócio) */
  quantidade: number | null
  /** o total da operação, em R$ */
  valor: number
  grupo: GrupoImposto
}

export interface MesHistorico {
  mes: string
  /** o total vendido no mês, todos os grupos */
  vendas: number
  selo: SeloImposto
  operacoes: OperacaoImposto[]
}

export interface ImpostoVisao {
  mesAtual: MesImposto
  mesAnterior: MesImposto
  /** os últimos 12 meses, com o selo de cada um */
  historico: MesHistorico[]
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
  /** null quando o bloco quebrou no servidor: a seção some */
  renda: RendaVisao | null
  /** com fonte velha, a data dos dados que a tela mostra */
  dadosDe: string | null
  /** null quando o bloco quebrou no servidor: a seção some */
  imposto: ImpostoVisao | null
  /** ISO de quando o backend montou esta visão (cache de 10 minutos por pessoa) */
  geradoEm: string
}
