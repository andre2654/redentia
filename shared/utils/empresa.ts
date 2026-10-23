/**
 * A pessoa jurídica que opera a Redentia (23/10/2026). A Redentia não tem CNPJ próprio: a AVSJOBS publica o app
 * na App Store (a Apple exige conta de organização, guideline 5.1.1(ix)) e é a controladora dos dados (LGPD).
 * Termos, privacidade, os dois rodapés, o JSON-LD e o llms.txt leem daqui. Antes, o site dizia
 * "Redentia Tecnologia S.A." e "Redentia Tecnologia Ltda.", empresas que não existem.
 *
 * Os campos entre colchetes esperam os dados do dono: não publicar com eles.
 */
export const EMPRESA = {
  razaoSocial: '[RAZÃO SOCIAL DA AVSJOBS]',
  cnpj: '[CNPJ]',
} as const
