/**
 * As frases para começar: o que o escritório cola no assistente depois de
 * conectar a chave. Substituem o pack de skills (24/10/2026): o servidor MCP
 * já ensina o assistente na conexão (instructions, descrições e os atalhos do
 * menu "/"), devolve telas prontas (MCP Apps) e traz o roteiro do relatório
 * no get_client_report. Ninguém precisa instalar nada.
 *
 * Toda frase começa com "Redentia": com vários conectores ou a busca na web
 * ligada, o nome ancora a escolha da ferramenta.
 *
 * Duas listas, porque assessor vinculado a corretora (Allez, XP) não tem
 * cliente conectado: a frase de cliente cairia num "recurso não habilitado".
 */

export interface FrasePronta {
  /** O que o assessor cola, palavra por palavra. */
  texto: string
  /** O que aparece na conversa depois, numa linha. */
  resultado: string
}

const COM_CLIENTES = (cliente: string): FrasePronta[] => [
  { texto: 'Redentia, como estão meus clientes hoje?', resultado: 'A lista dos clientes conectados, com o patrimônio de cada um.' },
  { texto: `Redentia, prepare minha reunião com ${cliente}.`, resultado: 'A carteira, o que mexeu nela e um cenário, com o texto pronto para o cliente.' },
  { texto: `Redentia, gere o relatório da carteira de ${cliente}.`, resultado: 'O relatório de quatro páginas, pronto para revisar e enviar.' },
]

const SEM_CLIENTES: FrasePronta[] = [
  { texto: 'Redentia, o que mudou hoje em PETR4, VALE3 e HGLG11?', resultado: 'As cotações numa tela só, com a notícia de quem se mexeu.' },
  { texto: 'Redentia, como fechou o mercado hoje?', resultado: 'Ibovespa, IFIX, juros e dólar, com a leitura do dia.' },
  { texto: 'Redentia, como fica uma carteira 40% Tesouro Selic, 30% BOVA11 e 30% HGLG11 se a Selic subir 3 pontos?', resultado: 'A faixa do pessimista ao otimista, em reais de hoje.' },
]

/**
 * As frases certas para a conta: com cliente conectado ou sem. `cliente` é o
 * nome de um cliente conectado de verdade, para a frase já sair pronta; sem
 * ele, fica o lugar para o assessor preencher.
 */
export function frasesProntas(clientesLigado: boolean, cliente?: string | null): FrasePronta[] {
  return clientesLigado ? COM_CLIENTES(cliente?.trim() || '[nome do cliente]') : SEM_CLIENTES
}
