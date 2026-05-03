/**
 * maskCurrency — substitui valores monetarios por placeholder pra
 * modo privacidade. Usado nos dois pontos de renderizacao de texto
 * livre do chat (StreamingText, ArtifactPanel) que recebem HTML ja
 * compilado de markdown via v-html.
 *
 * Por que regex em HTML em vez de mascarar o markdown source:
 *   - Preserva formatacao (negrito, mono, tabelas) que o marked
 *     ja gerou. Mascarar antes do render e re-renderizar tem custo
 *     e ainda perde features de extensoes (ticker chips, charts).
 *   - O regex opera so no texto entre tags; tags HTML nao tem
 *     digitos consecutivos no formato BR, entao nao quebra markup.
 *
 * Duas regras, aplicadas em ordem:
 *
 * 1. WITH_RS — captura `R$` + qualquer numero. Substitui por
 *    `R$ ••••••` (mantem o prefixo da moeda).
 *      R$ 100 / R$ 1.000 / R$ 521.740,09
 *      +R$ 50 / -R$ 20    (P&L com sinal)
 *      R$1000              (sem espaco)
 *      R$ 100        (nbsp do useFormat.ts)
 *
 * 2. WITHOUT_RS — captura numero formato BR sem `R$` na frente. A
 *    LLM as vezes solta valores soltos ("Patrimonio: 245.727,62").
 *    So o numero e' substituido por `••••••` (sem prefixo).
 *      245.727,62        (com milhar + decimal)
 *      1.000.000,00      (multiplos milhares + decimal)
 *      100,50            (decimal sem milhar)
 *      1.500             (so milhar — pode ser qty, mas em modo
 *                         privacidade e seguro mascarar)
 *
 *    Lookbehind/lookahead `[\d,.]` evita pegar pedaco de outro
 *    numero. NAO captura:
 *      100               (sem milhar nem decimal — pode ser idade,
 *                         contagem, qualquer coisa)
 *      1990              (4 digitos, parece ano)
 *      1,5               (1 digito apos virgula — provavel medida)
 *      01/05/2024        (data com `/`)
 *
 * Casos NAO cobertos (limitacoes conhecidas):
 *   - "meio milhao", "100 mil reais", "BRL 100" — formato verbal
 *     ou com sigla diferente. Pra esses, backend redaction via
 *     system prompt e' a abordagem certa.
 *   - Numero quebrado em multiplos tags HTML — improvavel mas
 *     possivel. Aceito como trade-off.
 *   - Falsos positivos: "1.500 acoes" → mascara "1.500". Em modo
 *     privacidade, qty tambem e' sensivel (qty × preco = valor)
 *     entao mascarar e' aceitavel.
 */
const WITH_RS = /R\$[\s ]*[+-]?[\d.,]+/g
const WITHOUT_RS = /(?<![\d,.])(?:\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+,\d{2})(?![\d,.])/g

export function maskCurrency(html: string, withRsPlaceholder = 'R$ ••••••', plainPlaceholder = '••••••'): string {
  if (!html) return html
  return html
    .replace(WITH_RS, withRsPlaceholder)
    .replace(WITHOUT_RS, plainPlaceholder)
}
