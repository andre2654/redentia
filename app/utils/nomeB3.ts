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
 * BDR TEM A MESMA COLUNA (20/10/2026). A classe dele é DRN, DR1, DR2 ou DR3, e
 * 72 dos 132 BDRs do sitemap saíam "Palantirtechdrn · P2LT34", "Wells Fargo
 * Drn · WFCO34". O corte no 12º caractere tira a classe; o nome inteiro vem do
 * overview (`identity.company_name`), limpo em nomeDoBdr.
 *
 * Sem import de valor de propósito: os testes (node --test) importam direto.
 */

const PEQUENAS = new Set(['de', 'do', 'da', 'dos', 'das', 'e'])
// A classe grudada pode vir seguida da marca do pregão com UM espaço só
// ('MICRON TECHNDRN ED'); com dois ou mais, o split já separou.
const CLASSE_GRUDADA = /^(ON|PN[A-C]?|UNT|UNS|DR[N123E])(\s[A-Z]{2,3})*$/
const SUFIXO_SEPARADO = /\s+(ON|PN[AB]?|UNT|UNS|N1|N2|NM|MA|MB|EJ|ED|ER|ES)$/i
// 'AMBEV S/A', 'RUMO S.A.', 'MOTIVA SA': a forma jurídica não é o nome.
const SOCIEDADE = /\s+S(\.A\.?|\/A|A)$/i

/** O nome que a gente fala, pela coluna de nome da B3 já cortada no 12º caractere. */
const NOME_CERTO: Record<string, string> = {
  'ABC BRASIL': 'ABC Brasil',
  'AMAZONIA': 'Banco da Amazônia',
  'ASSAI': 'Assaí',
  'AZT ENERGIA': 'AZT Energia',
  'BRASIL': 'Banco do Brasil',
  'BRB BANCO': 'BRB',
  'BTGP BANCO': 'BTG Pactual',
  'CEA MODAS': 'C&A Modas',
  'CEB': 'CEB',
  'CSU DIGITAL': 'CSU Digital',
  'CVC BRASIL': 'CVC Brasil',
  'DEXXOS PAR': 'Dexxos',
  'DTCOM': 'DTCom',
  'ENERGISA MT': 'Energisa MT',
  'ESPACOLASER': 'Espaçolaser',
  'IMC S/A': 'IMC',
  'ITAUSA': 'Itaúsa',
  'JSL': 'JSL',
  'MAGAZ LUIZA': 'Magazine Luiza',
  'MERCANTIL': 'Mercantil do Brasil',
  'NORD BRASIL': 'Banco do Nordeste',
  'NORDON MET': 'Nordon',
  'ORANJEBTC': 'OranjeBTC',
  'PETRORIO': 'PRIO',
  'PLANOEPLANO': 'Plano & Plano',
  'PPLA PARTICIPATIONS': 'PPLA Participations',
  'RAIZEN': 'Raízen',
  'REDE D OR': "Rede D'Or",
  'TIM': 'TIM',
  'TOTVS': 'TOTVS',
  'WEG': 'WEG',
  'WLM IND COM': 'WLM',
  'WLM INDÚSTRIA E COMÉRCIO': 'WLM',
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
  const nome = cabeca.trim().replace(SUFIXO_SEPARADO, '').replace(SOCIEDADE, '').trim()
  return nome ? titulo(nome) : bruto
}

// O company_name do BDR traz o recibo e a forma jurídica: 'Alphabet Inc Shs A
// Unsponsored Brazilian Depository Receipt Repr 0.08333 Sh -', 'AstraZeneca
// PLC ADR', 'MercadoLibre, Inc.'. Corta no recibo e tira a forma jurídica;
// 'Co'/'Company'/'Group'/'Holding' ficam (são parte do nome: 'American Express
// Co', 'The Southern Company').
const RECIBO = /\s+(Unsponsored|Sponsored|Brazilian\s+Deposit[ao]ry|Depositary|ADR|ADS|Shs|BDR|DRN|Repr)\b.*$/i
const CLASSE_DA_ACAO = /\s+(?:Class\s+|Cl\.?\s+)?-?[A-C]-?$/
const FORMA_JURIDICA = /[\s,]+(Inc\.?|Incorporated|Corp\.?|Corporation|Ltd\.?|Limited|PLC|N\.?V\.?|S\.?A\.?|S\.?p\.?A\.?|A\/S|SE|AG)$/i

/**
 * O nome do BDR pelo company_name do overview: 'Palantir Technologies Inc.
 * Shs -A-' → 'Palantir Technologies'. null quando não sobra nome (aí vale o da B3).
 */
export function nomeDoBdr(companyName: string | null | undefined): string | null {
  let nome = (companyName ?? '').replace(/\s+/g, ' ').trim().replace(RECIBO, '')
  nome = nome.replace(CLASSE_DA_ACAO, '')
  for (let antes = ''; antes !== nome;) {
    antes = nome
    nome = nome.replace(FORMA_JURIDICA, '').replace(/[\s,]+$/, '')
  }
  return nome.length >= 2 ? nome : null
}
