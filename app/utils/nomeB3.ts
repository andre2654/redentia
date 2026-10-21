/**
 * O nome da empresa a partir do nome bruto da B3, que o ProfileResource
 * devolve em colunas ('PETROBRAS   PN      N2'): o nome, a classe e o segmento.
 * É o nome do H1 do /asset ("Petrobras · PETR4") e do texto do /dividendos.
 *
 * O CAMPO DO NOME TEM 12 CARACTERES. Quando o nome enche o campo, a classe
 * vem grudada nele: 'ITAUUNIBANCOPN', 'RAIADROGASILON', 'TELEF BRASILON'. A
 * regra antiga só tirava a classe separada por espaço, e 50 ações saíam com o
 * H1 "Itauunibancopn · ITUB4", "Raiadrogasilon · RADL3" (medido no
 * /tickers-full em 20/10/2026). Agora o nome é cortado no 12º caractere quando
 * o que sobra é uma classe, e os nomes que o corte de 12 deixa truncados
 * ("Caixa Seguri", "Cyrela Realt") têm o nome certo em NOME_CERTO.
 *
 * Sem import de valor de propósito: os testes (node --test) importam direto.
 */

const PEQUENAS = new Set(['de', 'do', 'da', 'dos', 'das', 'e'])
const CLASSE_GRUDADA = /^(ON|PN[A-C]?|UNT|UNS)$/
const SUFIXO_SEPARADO = /\s+(ON|PN[AB]?|UNT|UNS|N1|N2|NM|MA|MB|EJ|ED|ER|ES)$/i

/** O nome que a gente fala, pela coluna de nome da B3 já cortada no 12º caractere. */
const NOME_CERTO: Record<string, string> = {
  'LOJAS MARISA': 'Lojas Marisa',
  'BBSEGURIDADE': 'BB Seguridade',
  'CSNMINERACAO': 'CSN Mineração',
  'CPFL ENERGIA': 'CPFL Energia',
  'CRUZEIRO EDU': 'Cruzeiro do Sul Educacional',
  'SID NACIONAL': 'CSN',
  'CAIXA SEGURI': 'Caixa Seguridade',
  'CYRELA REALT': 'Cyrela',
  'ENGIE BRASIL': 'Engie Brasil',
  'FER HERINGER': 'Fertilizantes Heringer',
  'GRUPO MATEUS': 'Grupo Mateus',
  'GENERALSHOPP': 'General Shopping',
  'HOTEIS OTHON': 'Hotéis Othon',
  'IGUATEMI S.A': 'Iguatemi',
  'IRBBRASIL RE': 'IRB Brasil RE',
  'ITAUUNIBANCO': 'Itaú Unibanco',
  'JALLESMACHAD': 'Jalles Machado',
  'KEPLER WEBER': 'Kepler Weber',
  'TERRASANTAPA': 'Terra Santa',
  'LOG COM PROP': 'LOG Commercial Properties',
  'LOPES BRASIL': 'Lopes Brasil',
  'LOJAS RENNER': 'Lojas Renner',
  'M.DIASBRANCO': 'M. Dias Branco',
  'MOURA DUBEUX': 'Moura Dubeux',
  'MANGELS INDL': 'Mangels',
  'MITRE REALTY': 'Mitre Realty',
  'IOCHP,MAXION': 'Iochpe-Maxion',
  'OUROFINO S/A': 'Ourofino',
  'ONCOCLINICAS': 'Oncoclínicas',
  'PANATLANTICA': 'Panatlântica',
  'P.ACUCAR,CBD': 'GPA',
  'PAR AL BAHIA': 'Aliança da Bahia',
  'PLASCAR PART': 'Plascar',
  'PARANAPANEMA': 'Paranapanema',
  'POSITIVO TEC': 'Positivo Tecnologia',
  'PORTO SEGURO': 'Porto Seguro',
  'RAIADROGASIL': 'Raia Drogasil',
  'REDE ENERGIA': 'Rede Energia',
  'SANTANDER BR': 'Santander Brasil',
  'SLC AGRICOLA': 'SLC Agrícola',
  'SAO MARTINHO': 'São Martinho',
  'SYN PROP TEC': 'SYN Prop & Tech',
  'TAURUS ARMAS': 'Taurus Armas',
  'TRIUNFO PART': 'Triunfo',
  'TELEF BRASIL': 'Telefônica Brasil',
}

function titulo(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (PEQUENAS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

/**
 * 'PETROBRAS   PN      N2' → 'Petrobras'; 'ITAUUNIBANCOPN  EJ  N1' → 'Itaú Unibanco'.
 * FII com trading_name usa o trading_name (vem MAIÚSCULO do scraper).
 */
export function nomeDaEmpresa(bruto: string, fiiTradingName?: string | null): string {
  if (fiiTradingName) return titulo(fiiTradingName)
  let cabeca = bruto.split(/\s{2,}/)[0] ?? bruto
  if (cabeca.length > 12 && cabeca === cabeca.toUpperCase() && CLASSE_GRUDADA.test(cabeca.slice(12).trim())) {
    cabeca = cabeca.slice(0, 12)
  }
  const certo = NOME_CERTO[cabeca.trim()]
  if (certo) return certo
  const nome = cabeca.replace(SUFIXO_SEPARADO, '').trim()
  return nome ? titulo(nome) : bruto
}
