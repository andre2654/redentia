/**
 * A pessoa jurídica que opera a Redentia (23/10/2026). A Redentia não tem CNPJ próprio: a AVSJOBS publica o app
 * na App Store (a Apple exige conta de organização, guideline 5.1.1(ix)) e é a controladora dos dados (LGPD).
 * Termos, privacidade, os dois rodapés, o JSON-LD e o llms.txt leem daqui. Antes, o site dizia
 * "Redentia Tecnologia S.A." e "Redentia Tecnologia Ltda.", empresas que não existem.
 *
 * Dados da Receita (consulta de 23/10/2026): sociedade empresária limitada, matriz em São Paulo/SP, CNAE 6209-1/00
 * com 6311-9/00 e 6319-4/00 entre as secundárias. O "ME" que alguns sites põem no fim é o porte, não o nome.
 */
export const EMPRESA = {
  razaoSocial: 'AVSJOBS LTDA',
  cnpj: '54.565.008/0001-24',
} as const
