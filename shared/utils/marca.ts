/**
 * As duas marcas da casa (11/11/2026). A Redentia de investidor virou APORTOU;
 * REDENTIA passou a ser só o produto de escritório (B2B), e assina a Aportou
 * por baixo ("Uma empresa Redentia"). A pessoa jurídica continua em EMPRESA.
 *
 * Todo texto que diz o nome do produto ao investidor lê daqui: título de
 * página, JSON-LD, og:site_name, rodapé, e-mails. Trocar de nome de novo (ou
 * ligar um domínio próprio) é mexer neste arquivo, não em 300.
 */
export const MARCA = {
  nome: 'Aportou',
  frase: 'Investir fica mais claro.',
  titulo: 'Aportou: entenda antes de investir',
  descricao: 'A Aportou explica ações, FIIs e a sua carteira em português claro, com uma IA do seu lado. Não é corretora e não tem produto para te vender.',
  assinatura: 'Uma empresa Redentia',
  ia: 'IA da Aportou',
  /** o produto de escritório: desde 12/11/2026 fora deste site, em redentia.com.br */
  b2b: 'Redentia',
} as const
