/**
 * A marca nos textos que vêm da API (11/11/2026). A Redentia de investidor
 * virou Aportou, mas parte do texto gravado no backend ainda diz "Redentia"
 * (o `monitoring.eyebrow` das teses chega como "A Redentia vigia por você").
 * Aqui só se troca o NOME na hora de exibir; o dado não muda.
 *
 * Troca a palavra inteira "Redentia" por "Aportou" (e "REDENTIA" por
 * "APORTOU"). Fica como está o que é contrato técnico ou o produto de
 * escritório (docs/aportou/decisoes.md):
 *  - domínio e endereço: redentia.com.br, redentia.app, links, e-mails;
 *  - "Redentia For Business" / "Redentia Business" (o B2B segue Redentia);
 *  - a assinatura de endosso "Uma empresa Redentia".
 * "Redentia AI" vira "IA da Aportou" (o nome da IA no site de investidor).
 */
const IA = /(?<![\w@./-])Redentia AI(?![\w-])/g
const NOME = /(?<![\w@./-])(?<!\bempresa\s)(Redentia|REDENTIA)(?![\w@-]|\.[A-Za-z])(?!\s+(?:For\s+)?Business)/g

export function marcaNoTexto<T extends string | null | undefined>(texto: T): T {
  if (!texto) return texto
  return texto
    .replace(IA, 'IA da Aportou')
    .replace(NOME, (m) => (m === 'REDENTIA' ? 'APORTOU' : 'Aportou')) as T
}
