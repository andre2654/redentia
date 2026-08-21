/**
 * Data do último pregão da B3, YYYY-MM-DD. FONTE ÚNICA — usada por:
 *  - server/utils/site-pages.ts  → <lastmod> do sitemap
 *  - páginas dinâmicas           → dateModified do WebPage (JSON-LD)
 *
 * Os dois precisam concordar: sitemap dizendo que /asset/PETR4 mudou em X e a
 * própria página dizendo Y é sinal contraditório, e sinal contraditório é o
 * caminho mais curto pro Google ignorar os dois.
 */

/**
 * Último dia ÚTIL em America/Sao_Paulo.
 *
 * Por que não `hoje`: sábado, domingo e a madrugada de segunda não têm pregão
 * novo. Publicar a data corrente nesses dias marcaria ~600 URLs como
 * modificadas sem que nada tivesse mudado — exatamente o padrão que faz o
 * Google descartar o lastmod do site inteiro.
 *
 * Feriado da B3 não é tratado de propósito (erraria pra frente em ~10 dias no
 * ano, contra ~104 dias de fim de semana). Tratar exigiria calendário
 * versionado, e o ganho não paga a manutenção.
 */
export function ultimoPregao(now = new Date()): string {
  // data local de São Paulo sem depender de lib de timezone
  const sp = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  // antes das 18h o pregão do dia ainda não fechou → vale o dia anterior
  if (sp.getHours() < 18) sp.setDate(sp.getDate() - 1)
  while (sp.getDay() === 0 || sp.getDay() === 6) sp.setDate(sp.getDate() - 1)
  const mm = String(sp.getMonth() + 1).padStart(2, '0')
  const dd = String(sp.getDate()).padStart(2, '0')
  return `${sp.getFullYear()}-${mm}-${dd}`
}
