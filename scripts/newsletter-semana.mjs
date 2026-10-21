#!/usr/bin/env node
/**
 * newsletter-semana — monta o RASCUNHO da newsletter semanal da Redentia
 * ("O mercado da semana no seu e-mail", toda sexta). O dono revisa e manda com
 * o scripts/newsletter-enviar.mjs (primeiro só para ele, com --teste). Este
 * script não envia, não agenda e não fica esperando hora: só lê a API e
 * escreve arquivos, quando alguém roda.
 *
 * DE ONDE SAI CADA COISA. Só a API pública de produção, UMA requisição por vez,
 * com pausa entre elas e User-Agent de navegador (sem ele a API devolve 403).
 *
 *  1. A semana em uma frase. /indices/IBOV/prices?mode= (o mode é obrigatório:
 *     sem ele a API devolve 500 em HTML). A série guarda o fechamento OFICIAL
 *     da B3: o ciclo de fim de dia do fundamentals-scraper (20h20 e 22h15)
 *     regrava o número intradiário do TradingView. Por isso o pregão do dia só
 *     entra depois das 20h30 de Brasília; antes disso ele é intradiário.
 *     Conferências antes de publicar:
 *       - continuidade: todo dia útil da B3 entre as duas sextas tem de estar
 *         na série (um furo faz a conta medir dois pregões como um);
 *       - BOVA11 (/tickers/BOVA11/prices, outra tubulação: preço de ação, não
 *         de índice) tem de andar junto na semana;
 *       - no último pregão, o /market/today recalcula o índice pelos pesos da
 *         carteira teórica (index_weighted_change_pct).
 *     Dólar: a PTAX de venda do /macro/snapshot (BCB SGS 1). A API só guarda os
 *     dois últimos dias, então entra o nível, e só quando a data dele é a do
 *     último pregão da semana. Variação semanal do dólar a API não tem.
 *
 *  2. O que mexeu com a bolsa. /research/news, a leitura do Atlas (chaves em
 *     camelCase: atlasReading, publishedAt). O endpoint não tem data nem
 *     offset, e o feed geral (teto de 60) cobre só ~1 dia. A semana sai do
 *     filtro ?ticker= para cada papel do Ibovespa (a carteira e os pesos vêm
 *     do /market/today) mais o feed geral. Consequência: notícia de macro SEM
 *     ticker só aparece se for do último dia do feed. Cada candidata passa,
 *     em ordem de relevância, por:
 *       - tese: a frase da leitura que cita tese da Redentia sai do e-mail (soa
 *         como indicação de carteira); se for a frase de abertura, a notícia sai;
 *       - palavra proibida (CVM): comprar, vender, barato, caro, oportunidade,
 *         preço-alvo, recomendação, "melhores ações", nota, score;
 *       - peça paga: slug -lbrd*, título de chamada, e a matéria crua no /news
 *         (coluna, byline da Empiricus, selo no corpo);
 *       - código de papel no título tem de existir ("CSXE3" era CXSE3);
 *       - o SINAL: o `dir` de cada papel e o verbo ou número do Ibovespa e dos
 *         papéis têm de bater com o fechamento do dia (o `reading` já inverteu
 *         sinal; o "PETR4 em alta de 1,7%" das 14h, com fechamento de +2,2%,
 *         cai aqui). Vale o texto inteiro, inclusive a frase cortada;
 *       - diversidade: um assunto por papel, nada de duas leituras com os
 *         mesmos números, no máximo duas por dia e uma sobre o Ibovespa.
 *     Menos de 3 que passem, a seção sai do e-mail.
 *
 *  3. Proventos da semana que vem. O calendário do site (/dividends/upcoming e
 *     /dividends/recent), com a regra de provento duplicado SI x B3 aplicada
 *     no Backend (ScrapeDividends::resolve, R1-R4 + R7), conferido papel a
 *     papel no /dividends/{t}: a mesma leitura do /dividendos (chave "label "
 *     com espaço, rate em texto, payment_pending = a definir, amortização
 *     separada da renda). Papéis: a carteira do Ibovespa e os FIIs conhecidos
 *     do site (FEATURED_TICKERS, server/utils/site-pages.ts).
 *
 *  4. Da Redentia. Um guia ou uma ferramenta, em rodízio pela semana do ano.
 *     Preço-teto fica de fora (veto do dono).
 *
 * PROIBIDO no texto que vai ao assinante: dizer o que comprar ou vender,
 * "barato", "caro", "oportunidade", nota de tese, Redentia Score. Fato tem
 * fonte e data. Nenhuma palavra de rascunho ou teste no e-mail: a palavra
 * "rascunho" só existe no .md, que é do dono.
 *
 * USO
 *   node scripts/newsletter-semana.mjs                       # a última semana com pregão fechado
 *   node scripts/newsletter-semana.mjs --semana 2026-10-13   # a semana (segunda a sexta) que contém o dia
 *   node scripts/newsletter-semana.mjs --saida /tmp/nl       # outra pasta (padrão: newsletter-rascunhos/<sexta>/)
 *   node scripts/newsletter-semana.mjs --offline             # remonta com o fontes.json da pasta, sem chamar a API
 *
 * SAÍDA (newsletter-rascunhos/ está no .gitignore)
 *   rascunho.html  o e-mail, com estilo inline e sem imagem obrigatória
 *   rascunho.md    o mesmo texto, mais as notas de conferência: fonte e data de
 *                  cada número, o que foi descartado e por quê
 *   fontes.json    as respostas cruas da API, numeradas (as notas citam o número)
 */
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const API = 'https://redentia-api.saraivada.com/api'
const SITE = 'https://www.redentia.com.br'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
const PAUSA_MS = 300
const TZ = 'America/Sao_Paulo'
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// O fechamento oficial do índice entra às 20h20 (fim de dia da B3 no
// fundamentals-scraper). Antes disso o pregão do dia é número intradiário.
const FECHAMENTO_OFICIAL_MIN = 20 * 60 + 30

/**
 * Dias sem pregão na B3 (fim de semana fora). A mesma lista do
 * app/composables/useSeguirGancho.ts, tirada do ofício da B3 de 2026. Ano fora
 * de ANOS_COM_CALENDARIO: o script avisa e trata dia útil como dia de pregão.
 * Quando a B3 publicar o calendário de 2027, some as datas aqui e lá.
 */
const SEM_PREGAO_B3 = new Set([
  '2026-01-01', '2026-02-16', '2026-02-17', '2026-04-03', '2026-04-21', '2026-05-01', '2026-06-04',
  '2026-09-07', '2026-10-12', '2026-11-02', '2026-11-20', '2026-12-24', '2026-12-25', '2026-12-31',
])
const ANOS_COM_CALENDARIO = new Set([2026])

/** FIIs conhecidos: os mesmos do FEATURED_TICKERS (server/utils/site-pages.ts). */
const FIIS_CONHECIDOS = ['MXRF11', 'HGLG11', 'KNIP11', 'KNCR11', 'XPML11', 'VISC11', 'BTLG11', 'HGRE11']

/** Ações de reserva, se o /market/today não trouxer a carteira do Ibovespa. */
const ACOES_RESERVA = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'BBAS3', 'ABEV3', 'WEGE3', 'B3SA3', 'ITSA4', 'BPAC11', 'SBSP3', 'PRIO3', 'SUZB3', 'EQTL3', 'RENT3', 'VIVT4', 'TAEE11', 'CMIG4']

/** Fora da carteira do índice, mas é onde o Atlas marca a notícia de dólar e de bolsa americana. */
const EXTRA_NOTICIAS = ['IVVB11', 'NASD11']

/** Rodízio do "Da Redentia" (semana ISO do ano). Preço-teto NUNCA entra: veto do dono. */
const DA_REDENTIA = [
  { caminho: '/guias/data-com-e-data-ex', tipo: 'Guia', titulo: 'Data com e data ex: quando o dividendo passa a ser seu', texto: 'As quatro datas de um provento, por que a ação cai na data ex e quanto tempo o dinheiro leva para cair na conta.' },
  { caminho: '/calculadora/acoes', tipo: 'Ferramenta', titulo: 'Simulador de ações e dividendos', texto: 'Quanto um aporte em PETR4, ITUB4 ou VALE3 teria virado, com os dividendos reinvestidos, mês a mês.' },
  { caminho: '/calculadora/dividend-yield', tipo: 'Ferramenta', titulo: 'Calculadora de dividend yield', texto: 'DY atual, projetado e sobre o preço que você pagou, com a fórmula aberta na tela.' },
  { caminho: '/guias/imposto-sobre-dividendos', tipo: 'Guia', titulo: 'Imposto sobre dividendos: quem paga, quanto e o que mudou', texto: 'A regra dos R$ 50 mil por mês, o efeito degrau e por que o JCP é tributado de outro jeito.' },
  { caminho: '/tesouro', tipo: 'Ferramenta', titulo: 'Tesouro Direto hoje', texto: 'As taxas de todos os títulos do Tesouro Direto, com preço e vencimento, atualizadas a cada pregão.' },
  { caminho: '/calculadora/juros-compostos', tipo: 'Ferramenta', titulo: 'Calculadora de juros compostos', texto: 'Aportes mensais, taxa e prazo: o efeito dos juros sobre juros em gráfico e em tabela.' },
  { caminho: '/guias/como-analisar-uma-acao', tipo: 'Guia', titulo: 'Como analisar uma ação: os indicadores que importam', texto: 'P/L, P/VP, ROE, margens e dívida: o que cada indicador diz e em que ordem ler.' },
  { caminho: '/calculadora/imposto-renda', tipo: 'Ferramenta', titulo: 'Calculadora de IR sobre ações', texto: 'Swing trade, day trade e a isenção de R$ 20 mil por mês, com o DARF certo no fim.' },
  { caminho: '/guias/acoes-fiis-dividendos-todo-mes', tipo: 'Guia', titulo: 'Dividendos todo mês', texto: 'Como FIIs e ações que pagam em meses diferentes formam uma escada de proventos.' },
]

/**
 * Palavras que a CVM e o dono vetam (título e leitura da notícia, e o e-mail
 * inteiro na varredura final). Conservador de propósito: "vender fatia" numa
 * notícia de fusão também cai. Notícia boa descartada custa menos que uma
 * recomendação publicada.
 */
const PROIBIDAS = [
  [/\bbarat[oa]s?\b|\bbarate/i, '"barato"'],
  [/\bcar[oa]s?\b/i, '"caro"'],
  [/oportunidade/i, '"oportunidade"'],
  [/\b(compre|comprem|comprar|comprando|vender|vendam|vendendo|venda já)\b/i, 'compra ou venda'],
  [/recomend/i, 'recomendação'],
  [/pre[cç]o[- ]alvo|potencial de (alta|valoriza)|\bupside\b|top pick|carteira (recomendada|sugerida)/i, 'preço-alvo ou potencial'],
  [/pode (subir|ganhar|valorizar|saltar|disparar|render)( ainda)?( mais\b| até\b| \d)/i, 'promessa de alta'],
  [/melhores a[cç][oõ]es|a[cç][aã]o (preferida|favorita)|eleg[ea]m? (as )?a[cç][oõ]es/i, 'lista de indicação'],
  [/pre[cç]o[- ]teto/i, 'preço-teto'],
  [/redentia score|\bscore\b|convic[cç][aã]o|nota da tese/i, 'nota ou score'],
  [/hora de (comprar|vender|entrar|sair)|vale a pena (comprar|investir)/i, 'chamada de compra'],
  [/barganha|pechincha|\bdescontad[ao]s?\b|subavaliad|sobrevalorizad|subprecificad/i, 'juízo de preço'],
]

/** Sinais de peça paga (memória atlas-feed-conteudo-publicitario). */
const PUBLI_SLUG = /-lbrd[a-z]{2}\d{2,4}(?:[/?#]|$)/i
const PUBLI_TITULO = /^(invista|compre|aproveite|garanta|descubra|conheça|saiba como)\b|como investir neste cen[aá]rio|\bempiricus\b|veja como participar/i
const PUBLI_TEXTO = /conte[uú]do (publicit[aá]rio|de marca|patrocinado|empiricus|market makers)|publieditorial|patrocinad[oa]|trade em 1 minuto|informe publicit|veja como participar/i
const PUBLI_AUTOR = /matheus spiess|caio ara[uú]jo|empiricus/i
const PUBLI_CATEGORIA = /colun|opini|patroc|publi|branded|marca|parceir/i

/** Verbos de direção (Ibovespa e papéis). Os dois lados na mesma oração = sem afirmação. */
const SOBE = /\b(sobe|subiu|sobem|subiram|subindo|avança|avançou|avançam|avançaram|dispara|disparou|disparam|disparada|salta|saltou|saltam|ganha|ganhou|ganham|valoriza|valorizou|decola|decolou|alta|altas|recorde)\b/i
const CAI = /\b(cai|caiu|caem|caíram|caindo|recua|recuou|recuam|recuaram|despenca|despencou|tomba|tombou|desaba|desabou|perde|perdeu|perdem|desvaloriza|desvalorizou|queda|quedas|baixa|baixas|afunda|afundou|derrete|derreteu|cede|cedeu|devolve|devolveu)\b/i
// Um "%" depois do papel só é variação do pregão se não falar de fundamento
// ("vendas da Cyrela caem 14%") nem de outro período ("acumula 9% no mês").
const FUNDAMENTO = /vend|lucr|receit|ebitda|margem|produ[cçz]|dividend|provent|yield|payout|fatia|particip|capta|lan[cç]amento|guidance|\bmeta\b|proje[cç]|estimat|alvo|potencial|desconto|pr[eê]mio|juro|taxa|selic|infla|ipca|\bcpi\b|\bpib\b|endivid|alavanc|custo|despesa|tarif|reajust|volume|demanda|export|import|consumo|valor de mercado|chance|probabilidade|pesquisa|voto|aprova|inten[cç]/i
const PERIODO = /semana|\bm[eê]s\b|\bano\b|acumul|desde|12 meses|trimestre|\b[1-4]T\d{0,2}\b|em (janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/i

const FONTES_NOME = {
  money_times: 'Money Times', suno: 'Suno', valor_investe: 'Valor Investe', seu_dinheiro: 'Seu Dinheiro',
  brazil_journal: 'Brazil Journal', infomoney: 'InfoMoney', exame: 'Exame', cnn_brasil: 'CNN Brasil',
  e_investidor: 'E-Investidor', bloomberg_linea: 'Bloomberg Línea', investing: 'Investing.com',
  valor: 'Valor Econômico', estadao: 'Estadão', folha: 'Folha', reuters: 'Reuters',
}

// ——— argumentos ———

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const val = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : undefined }
function fatal(msg) { console.error(`\nERRO: ${msg}\n`); process.exit(1) }

if (flag('help') || flag('h')) {
  console.log('uso: node scripts/newsletter-semana.mjs [--semana AAAA-MM-DD] [--saida <pasta>] [--offline]')
  process.exit(0)
}
const SEMANA_ARG = val('semana')
if (SEMANA_ARG && !/^\d{4}-\d{2}-\d{2}$/.test(SEMANA_ARG)) fatal('--semana espera AAAA-MM-DD')
const OFFLINE = flag('offline')

// ——— datas, sempre no fuso de São Paulo ———

function agoraSP(quando = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(quando).map((x) => [x.type, x.value]))
  return { hoje: `${p.year}-${p.month}-${p.day}`, minutos: Number(p.hour) * 60 + Number(p.minute), hora: `${p.hour}h${p.minute}`, iso: quando.toISOString() }
}
let AGORA = agoraSP()

const dia = (s) => new Date(`${s}T12:00:00Z`)
const iso = (d) => d.toISOString().slice(0, 10)
const soma = (s, n) => { const d = dia(s); d.setUTCDate(d.getUTCDate() + n); return iso(d) }
const diaDaSemana = (s) => dia(s).getUTCDay()
const segundaDe = (s) => soma(s, -((diaDaSemana(s) + 6) % 7))
const diasEntre = (a, b) => Math.round((dia(b) - dia(a)) / 86_400_000)
const diaUtilB3 = (d) => ![0, 6].includes(diaDaSemana(d)) && !SEM_PREGAO_B3.has(d)
const pregaoFechado = (d) => d < AGORA.hoje || (d === AGORA.hoje && AGORA.minutos >= FECHAMENTO_OFICIAL_MIN)
/** Data (AAAA-MM-DD) e minutos do dia, em São Paulo, de um timestamp ISO. */
function quandoSP(isoTs) {
  const a = agoraSP(new Date(isoTs))
  return { data: a.hoje, minutos: a.minutos, hora: a.hora }
}

/** Último dia útil da B3 na semana (sexta, ou antes dela se for feriado). */
function ultimoDiaUtil(seg) {
  for (let d = soma(seg, 4); d >= seg; d = soma(d, -1)) if (diaUtilB3(d)) return d
  return soma(seg, 4)
}

function semanaAlvo() {
  if (SEMANA_ARG) { const seg = segundaDe(SEMANA_ARG); return { seg, sex: soma(seg, 4) } }
  // a semana corrente, se o último pregão dela já tem o fechamento oficial; senão, a anterior
  let seg = segundaDe(AGORA.hoje)
  if (!pregaoFechado(ultimoDiaUtil(seg))) seg = soma(seg, -7)
  return { seg, sex: soma(seg, 4) }
}

/** Menor `mode` da série que alcança a data pedida (a API conta a janela a partir de hoje). */
function modoPara(desde) {
  const dias = diasEntre(desde, AGORA.hoje)
  for (const [modo, limite] of [['1mo', 27], ['3mo', 88], ['6mo', 178], ['12mo', 360], ['2y', 725], ['5y', 1820]]) {
    if (dias <= limite) return modo
  }
  return 'full'
}

function semanaIso(s) {
  const d = dia(s)
  d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7))
  const jan4 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4))
  return 1 + Math.round(((d - jan4) / 86_400_000 - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7)
}

// ——— formatação pt-BR ———

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const nf = (min, max = min) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: min, maximumFractionDigits: max })
const NF0 = nf(0), NF2 = nf(2), NF4 = nf(4), NF24 = nf(2, 4)
const pontos = (v) => NF0.format(Math.round(v))
const pontos2 = (v) => NF2.format(v)
const sinal = (x) => (x > 0 ? '+' : x < 0 ? '−' : '')
const pct = (x, casas = 2) => `${sinal(Number(x.toFixed(casas)))}${nf(casas).format(Math.abs(x))}%`
const pctSemSinal = (x, casas = 2) => `${nf(casas).format(Math.abs(x))}%`
const reais = (v) => `R$ ${NF24.format(v)}`
const dataCurta = (s) => `${s.slice(8, 10)}/${s.slice(5, 7)}`
const dataBr = (s) => `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}`
const diaNome = (s) => DIAS[diaDaSemana(s)]
function intervaloLongo(a, b) {
  const [ya, ma, da] = [a.slice(0, 4), Number(a.slice(5, 7)), Number(a.slice(8, 10))]
  const [yb, mb, db] = [b.slice(0, 4), Number(b.slice(5, 7)), Number(b.slice(8, 10))]
  if (ya !== yb) return `${da} de ${MESES[ma - 1]} de ${ya} a ${db} de ${MESES[mb - 1]} de ${yb}`
  if (ma !== mb) return `${da} de ${MESES[ma - 1]} a ${db} de ${MESES[mb - 1]} de ${yb}`
  return `${da} a ${db} de ${MESES[mb - 1]} de ${yb}`
}
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const semAcento = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const nomeFonte = (s) => FONTES_NOME[s] ?? String(s ?? '').replace(/_/g, ' ').replace(/(^|\s)\S/g, (c) => c.toUpperCase())
const normUrl = (u) => String(u ?? '').trim().replace(/[?#].*$/, '').replace(/\/+$/, '').replace(/^https?:\/\/(www\.)?/i, '').toLowerCase()

// O nome que o site mostra ("Itauunibancopn" vira "Itaú Unibanco"). O arquivo
// não tem import de valor, então o Node importa direto; se um dia quebrar, o
// e-mail sai só com o ticker.
let nomeDaEmpresa = null
try { ({ nomeDaEmpresa } = await import('../app/utils/nomeB3.ts')) } catch { nomeDaEmpresa = null }

// ——— API: uma requisição por vez ———

const CHAMADAS = []
const FALTARAM = []
let OFFLINE_MAPA = null
let ultimaChamada = 0
const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

/** GET na API. Devolve o JSON; `opcional` devolve null em erro em vez de parar. */
async function api(caminho, { opcional = false } = {}) {
  const url = `${API}${caminho}`
  if (OFFLINE_MAPA) {
    const f = OFFLINE_MAPA.get(url)
    if (!f) { FALTARAM.push(url); if (opcional) return null; fatal(`--offline: ${url} não está no fontes.json; rode sem --offline`) }
    CHAMADAS.push(f)
    if (f.status >= 200 && f.status < 300 && f.corpo && typeof f.corpo === 'object') return f.corpo
    if (opcional) return null
    throw new Error(`a API respondeu ${f.status} em ${url}`)
  }
  for (let tentativa = 1; ; tentativa++) {
    const espera = ultimaChamada + PAUSA_MS - Date.now()
    if (espera > 0) await dormir(espera)
    const t0 = Date.now()
    let status = 0, texto = ''
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' }, signal: AbortSignal.timeout(30_000) })
      status = res.status
      texto = await res.text()
    } catch (e) {
      texto = String(e?.message ?? e)
    }
    ultimaChamada = Date.now()
    // 429 e 5xx: espera e tenta de novo (até 3 vezes), sem paralelizar nada
    if ((status === 0 || status === 429 || status >= 500) && tentativa < 3) { await dormir(2500 * tentativa); continue }
    let corpo = null
    try { corpo = JSON.parse(texto) } catch { corpo = null }
    CHAMADAS.push({ n: CHAMADAS.length + 1, url, em: new Date().toISOString(), status, ms: ultimaChamada - t0, corpo: corpo ?? texto.slice(0, 300) })
    process.stderr.write(CHAMADAS.length % 50 === 0 ? `${CHAMADAS.length}\n` : '.')
    if (status >= 200 && status < 300 && corpo && typeof corpo === 'object') return corpo
    if (opcional) return null
    throw new Error(`a API respondeu ${status || 'sem resposta'} em ${url}`)
  }
}
/** O número da chamada no fontes.json (as notas citam como #N). */
const ref = (caminho) => {
  const url = `${API}${caminho}`
  const c = [...CHAMADAS].reverse().find((x) => x.url === url)
  return c ? `#${c.n}` : '#?'
}

// ——— 1. A semana em uma frase ———

async function secaoIbovespa(sem, mercadoHoje) {
  const out = { ok: false, avisos: [], notas: [], fech: new Map(), sessoes: [], feriados: [] }
  const modo = modoPara(soma(sem.seg, -14))
  const caminho = `/indices/IBOV/prices?mode=${modo}`
  const serie = (await api(caminho, { opcional: true }))?.data
  if (!Array.isArray(serie) || !serie.length) { out.motivo = `a série do Ibovespa veio vazia ou com erro (${caminho})`; return out }
  for (const r of serie) {
    const d = String(r?.price_at ?? '').slice(0, 10)
    const v = Number(r?.market_price)
    if (/^\d{4}-\d{2}-\d{2}$/.test(d) && Number.isFinite(v) && v > 0) out.fech.set(d, v)
  }
  const datas = [...out.fech.keys()].sort()
  const naSemana = datas.filter((d) => d >= sem.seg && d <= sem.sex)
  out.sessoes = naSemana.filter(pregaoFechado)
  const abertas = naSemana.filter((d) => !pregaoFechado(d))
  if (abertas.length) out.avisos.push(`O pregão de ${dataBr(abertas[0])} ainda não tem o fechamento oficial (entra às 20h20 de Brasília) e ficou de fora.`)
  for (let d = sem.seg; d <= sem.sex; d = soma(d, 1)) if (SEM_PREGAO_B3.has(d)) out.feriados.push(d)
  for (const ano of new Set([sem.seg.slice(0, 4), sem.sex.slice(0, 4)])) {
    if (!ANOS_COM_CALENDARIO.has(Number(ano))) out.avisos.push(`O script não tem o calendário de feriados da B3 de ${ano}: dia útil sem pregão vira "furo na série". Some as datas em SEM_PREGAO_B3.`)
  }
  const anteriores = datas.filter((d) => d < sem.seg)
  if (!out.sessoes.length) { out.motivo = 'nenhum pregão da semana tem fechamento oficial ainda'; return out }
  if (!anteriores.length) { out.motivo = `a série (${caminho}) não alcança a semana anterior`; return out }
  const ref0 = anteriores.at(-1)
  const ult = out.sessoes.at(-1)
  const furos = []
  for (let d = soma(ref0, 1); d <= ult; d = soma(d, 1)) if (diaUtilB3(d) && !out.fech.has(d)) furos.push(d)
  // a referência tem de ser o último pregão antes da segunda (sem furo entre ela e a semana)
  if (furos.length) { out.motivo = `a série do Ibovespa não tem ${furos.map(dataBr).join(', ')}, dia útil da B3; a conta mediria dois pregões como um`; return out }

  const seq = [ref0, ...out.sessoes]
  out.diarios = out.sessoes.map((d, i) => ({ data: d, valor: out.fech.get(d), var: (out.fech.get(d) / out.fech.get(seq[i]) - 1) * 100 }))
  // valor repetido ao centavo é a assinatura do dado parado com data nova
  for (const x of out.diarios) {
    if (Math.abs(x.var) < 1e-9) { out.motivo = `o fechamento de ${dataBr(x.data)} é idêntico ao do pregão anterior (${pontos2(x.valor)}): cara de dado parado`; return out }
    if (Math.abs(x.var) > 12) out.avisos.push(`Variação de ${pct(x.var)} em ${dataBr(x.data)}: confira se o dia teve esse tamanho.`)
  }
  out.referencia = { data: ref0, valor: out.fech.get(ref0) }
  out.fechamento = { data: ult, valor: out.fech.get(ult) }
  out.variacao = (out.fechamento.valor / out.referencia.valor - 1) * 100
  out.parcial = ult < ultimoDiaUtil(sem.seg)
  out.notas.push(`Série: \`GET ${API}${caminho}\` (${ref(caminho)}), campo \`market_price\` por \`price_at\`. Fechamento oficial da B3 (o ciclo de fim de dia regrava o intradiário).`)
  out.notas.push(`Referência: ${diaNome(ref0)}, ${dataBr(ref0)}: ${pontos2(out.referencia.valor)} pontos.`)
  for (const x of out.diarios) out.notas.push(`${diaNome(x.data)}, ${dataBr(x.data)}: ${pontos2(x.valor)} pontos (${pct(x.var)} no dia).`)
  out.notas.push(`Semana: ${pontos2(out.fechamento.valor)} ÷ ${pontos2(out.referencia.valor)} − 1 = ${pct(out.variacao, 4)} (${sinal(out.fechamento.valor - out.referencia.valor)}${pontos2(Math.abs(out.fechamento.valor - out.referencia.valor))} pontos).`)
  if (out.feriados.length) out.notas.push(`Sem pregão na semana: ${out.feriados.map((d) => `${diaNome(d)}, ${dataBr(d)}`).join('; ')} (calendário da B3).`)

  // conferência 1: BOVA11, outra tubulação (preço de ação), tem de andar junto
  const cBova = `/tickers/BOVA11/prices?mode=${modo}`
  const bova = new Map(((await api(cBova, { opcional: true }))?.data ?? []).map((r) => [String(r.price_at).slice(0, 10), Number(r.market_price)]))
  if (bova.get(ref0) > 0 && bova.get(ult) > 0) {
    const vb = (bova.get(ult) / bova.get(ref0) - 1) * 100
    const dif = Math.abs(vb - out.variacao)
    out.notas.push(`Conferência BOVA11 (${ref(cBova)}): ${NF2.format(bova.get(ref0))} → ${NF2.format(bova.get(ult))} = ${pct(vb)} na semana, ${NF2.format(dif)} ponto de diferença do índice${dif <= 0.3 ? ' (ok)' : ''}.`)
    if (dif > 0.6) { out.motivo = `o BOVA11 (${pct(vb)}) e o Ibovespa (${pct(out.variacao)}) divergem ${NF2.format(dif)} pontos na semana: um dos dois está errado`; return out }
    if (dif > 0.3) out.avisos.push(`BOVA11 e Ibovespa divergem ${NF2.format(dif)} ponto na semana (${pct(vb)} contra ${pct(out.variacao)}). Confira o fechamento antes de enviar.`)
  } else {
    out.avisos.push(`Sem preço do BOVA11 em ${dataBr(ref0)} ou ${dataBr(ult)}: a conferência por outra fonte não foi feita.`)
  }

  // conferência 2: no último pregão, o índice recalculado pelos pesos da carteira
  const pd = mercadoHoje?.price_dates
  const pesado = Number(mercadoHoje?.totals?.index_weighted_change_pct)
  if (pd?.today === ult && pd?.previous === seq.at(-2) && Number.isFinite(pesado)) {
    const dia0 = out.diarios.at(-1).var
    const dif = Math.abs(pesado - dia0)
    out.notas.push(`Conferência /market/today (${ref('/market/today')}): a carteira teórica com os pesos dá ${pct(pesado)} em ${dataBr(ult)}, contra ${pct(dia0)} do índice (${NF2.format(dif)} ponto).`)
    if (dif > 0.3) out.avisos.push(`No último pregão (${dataBr(ult)}) o índice (${pct(dia0)}) e a carteira pesada (${pct(pesado)}) divergem ${NF2.format(dif)} ponto: confira o fechamento.`)
  }

  // dólar: PTAX de venda, só o nível e só se a data for a do último pregão
  const macro = await api('/macro/snapshot', { opcional: true })
  const usd = macro?.usd_brl
  if (usd && Number(usd.value) > 0 && usd.as_of_date === ult) {
    out.dolar = { valor: Number(usd.value), data: usd.as_of_date }
    out.notas.push(`Dólar: PTAX de venda de ${dataBr(ult)} = R$ ${NF4.format(out.dolar.valor)} (\`usd_brl\` do /macro/snapshot, ${ref('/macro/snapshot')}, BCB SGS 1). A API guarda só os dois últimos dias: sem variação na semana.`)
  } else {
    out.notas.push(`Dólar fora: o /macro/snapshot (${ref('/macro/snapshot')}) só guarda os dois últimos dias da PTAX${usd?.as_of_date ? ` (o mais novo é de ${dataBr(usd.as_of_date)})` : ''}, e nenhum é o de ${dataBr(ult)}.`)
  }
  out.ok = true
  return out
}

// ——— 2. O que mexeu com a bolsa ———

const papeisDaNoticia = (t) => (t.tickers ?? [])
  .map((x) => (typeof x === 'string' ? { ticker: x, dir: null } : { ticker: x?.ticker, dir: x?.dir ?? null }))
  .filter((x) => x.ticker)

function proibida(texto) {
  for (const [re, nome] of PROIBIDAS) { const m = texto.match(re); if (m) return `${nome} ("${m[0]}")` }
  return null
}

/** Tolerância de um número citado: o arredondamento da casa citada, mais folga. */
function bate(citado, casas, real, mod) {
  const a = Math.abs(real)
  if (mod === 'mais') return a >= citado - 0.01
  if (mod === 'quase') return a <= citado + 0.01 && a >= citado - 1
  if (mod === 'cerca') return Math.abs(a - citado) <= Math.max(0.5, citado * 0.1)
  if (mod === 'ate') return a <= citado + 0.01
  return Math.abs(a - citado) <= 0.5 * 10 ** -casas + 0.01
}
function modificador(antes) {
  const t = semAcento(antes).toLowerCase()
  if (/(mais de|acima de|superior a)\s*$/.test(t)) return 'mais'
  if (/(quase|perto de|proximo de)\s*$/.test(t)) return 'quase'
  if (/(cerca de|em torno de|aproximadamente|por volta de)\s*$/.test(t)) return 'cerca'
  if (/\bate\s*$/.test(t)) return 'ate'
  return null
}
function direcao(trecho) {
  // "interrompe sequência de quedas" sobe; "encerra série de altas" cai: sem afirmação
  if (/interromp|encerr|quebr[ao]u? (a |uma )?s[eé]rie|quebr[ao]u? (a |uma )?sequ[eê]ncia/i.test(trecho)) return 0
  const s = SOBE.test(trecho), c = CAI.test(trecho)
  return s && !c ? 1 : c && !s ? -1 : 0
}
/** Orações do texto (o ponto de milhar não quebra frase: "208.296 pontos"). */
const oracoes = (texto) => texto.split(/[.!?](?=\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ"“]|\s*$)|[;\n]|:\s/).map((s) => s.trim()).filter(Boolean)

/**
 * O primeiro "%" de um trecho, se ele for variação de preço do pregão: entre a
 * âncora (o papel ou o Ibovespa) e o número não pode haver fundamento, e em
 * volta dele não pode haver outro período. Devolve { pct } ou { naoConferido }.
 */
function percentualDoPregao(trecho) {
  const p = trecho.match(/(\d{1,3}(?:,\d{1,2})?)\s?%/)
  if (!p) return {}
  const entre = trecho.slice(0, p.index)
  const apos = trecho.slice(p.index + p[0].length, p.index + p[0].length + 22)
  if (FUNDAMENTO.test(entre)) return {}
  if (PERIODO.test(entre) || PERIODO.test(apos)) return { naoConferido: `${trecho.slice(0, p.index + p[0].length + 22).trim()}` }
  if (!direcao(entre) && entre.replace(/[\s()+\-−,:]/g, '').length > 3) return {}
  return { pct: { valor: Number(p[1].replace(',', '.')), casas: (p[1].split(',')[1] ?? '').length, mod: modificador(entre) } }
}

/** O que o texto afirma do Ibovespa: direção, % e pontos, oração por oração. */
function afirmacoesIbov(texto) {
  const out = []
  for (const o of oracoes(texto)) {
    const m = o.match(/\b(Ibovespa|Ibov)\b/i)
    if (!m) continue
    // o verbo do índice vem logo depois ("o Ibovespa caiu") ou logo antes ("o
    // gatilho que disparou o Ibovespa"); o resto da oração fala de outra coisa
    const antes = o.slice(Math.max(0, m.index - 40), m.index)
    const depois = o.slice(m.index + m[0].length)
    const perto = depois.slice(0, 45)
    // semana ou mês colado no índice não é o pregão do dia
    const outroPeriodo = PERIODO.test(perto)
    let dir = outroPeriodo ? 0 : direcao(perto)
    if (!dir && !outroPeriodo && !PERIODO.test(antes)) dir = direcao(antes)
    const p = percentualDoPregao(depois.slice(0, 80))
    const pts = depois.slice(0, 90).match(/(\d{3}\.\d{3})(?:,\d+)?\s*pontos/)
    out.push({
      oracao: o,
      dir,
      pct: p.pct ?? null,
      naoConferido: p.naoConferido ?? null,
      pontos: pts && !PERIODO.test(depois.slice(0, pts.index + pts[0].length + 20)) ? Number(pts[1].replace('.', '')) : null,
    })
  }
  return out
}

/** O que o texto afirma de um papel: o trecho logo depois do código, até o próximo código ou o fim da oração. */
function afirmacoesPapel(texto, ticker) {
  const out = []
  for (const o of oracoes(texto)) {
    const re = new RegExp(`\\b${ticker}\\b`, 'g')
    let m
    while ((m = re.exec(o))) {
      const trecho = o.slice(m.index + ticker.length, m.index + ticker.length + 90).split(/\b[A-Z]{4}\d{1,2}\b/)[0]
      // "Vendas da Cyrela (CYRE3) caem 14%": o sujeito é o fundamento, não a ação.
      // Só a forma "<fundamento> da <empresa> (" logo antes do código; janela
      // maior pega "valor de mercado" da oração anterior e solta número intradiário.
      if (/\b(vendas?|lucros?|receitas?|ebitda|margens?|produ[cç][aã]o|dividendos?|proventos?|capta[cç][aã]o|lan[cç]amentos?)\s+d[aeo]s?\s+[^,;()]{1,30}\(\s*$/i.test(o.slice(Math.max(0, m.index - 60), m.index))) continue
      const p = percentualDoPregao(trecho)
      out.push({
        trecho: `${ticker}${trecho}`,
        dir: PERIODO.test(trecho) || FUNDAMENTO.test(trecho.slice(0, 40)) ? 0 : direcao(trecho.slice(0, 40)),
        pct: p.pct ?? null,
        naoConferido: p.naoConferido ?? null,
      })
    }
  }
  return out
}

/**
 * A leitura sem as frases que citam as teses da Redentia ("o IVVB11 da tese
 * Dólar e big techs cumpre o papel de hedge"): no e-mail isso soa como
 * indicação de carteira, e a regra é não ter nota nem tese.
 */
function leituraSemTese(leitura) {
  const frases = String(leitura ?? '').trim().split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ"“0-9])/)
  const citaTese = (f) => /\bteses?\b/i.test(f)
  return {
    texto: frases.filter((f) => !citaTese(f)).join(' ').trim(),
    cortadas: frases.filter(citaTese),
    abertura: citaTese(frases[0] ?? ''),
  }
}

/** Números com 4 dígitos ou mais ("5,0868", "204.324"): duas leituras com o mesmo são o mesmo fato. */
const numerosFortes = (s) => new Set((String(s).match(/\d+(?:[.,]\d+)+/g) ?? []).filter((n) => n.replace(/\D/g, '').length >= 4))

const palavras = (s) => new Set(semAcento(s).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length >= 4))
function parecido(a, b) {
  const A = palavras(a), B = palavras(b)
  let comum = 0
  for (const w of A) if (B.has(w)) comum++
  return comum / Math.max(1, A.size + B.size - comum)
}

async function secaoNoticias(sem, ibov, universo) {
  const out = { ok: false, escolhidas: [], descartadas: [], avisos: [], notas: [], coletadas: 0 }
  const ini = Date.parse(`${sem.seg}T00:00:00-03:00`)
  const fim = Math.min(Date.parse(`${sem.sex}T23:59:59-03:00`), Date.now())
  const mapa = new Map()
  const juntar = (lista) => {
    for (const t of lista ?? []) {
      const ts = Date.parse(t?.publishedAt ?? '')
      if (!t?.url || !Number.isFinite(ts) || ts < ini || ts > fim) continue
      const k = normUrl(t.url)
      if (!mapa.has(k)) mapa.set(k, t)
    }
  }
  juntar((await api('/research/news?limit=60', { opcional: true }))?.data)
  const filtro = [...universo.acoes.map((x) => x.ticker), ...EXTRA_NOTICIAS]
  const curtos = []
  for (const tk of filtro) {
    const lista = (await api(`/research/news?limit=60&ticker=${tk}`, { opcional: true }))?.data ?? []
    juntar(lista)
    if (lista.length >= 60 && Date.parse(lista.at(-1).publishedAt) > ini) curtos.push(tk)
  }
  out.coletadas = mapa.size
  out.notas.push(`Coleta: \`GET /research/news?limit=60\` mais \`?ticker=\` para ${filtro.length} papéis (os ${universo.acoes.length} do Ibovespa por peso e ${EXTRA_NOTICIAS.join(', ')}). ${mapa.size} notícias com leitura publicadas de ${dataBr(sem.seg)} a ${dataBr(sem.sex)}, sem repetir URL.`)
  if (curtos.length) out.avisos.push(`O filtro por papel devolve só as 60 notícias mais novas, e para ${curtos.join(', ')} isso não chega a ${dataBr(sem.seg)}: notícias desses papéis no começo da semana podem ter ficado de fora.`)
  out.notas.push('Limite da fonte: notícia de macro sem papel marcado só entra se for do último dia do feed geral (o /research/news não filtra por data nem tem offset).')

  // séries dos papéis citados, uma vez cada
  const modo = modoPara(soma(sem.seg, -14))
  const series = new Map()
  async function serieDe(tk) {
    if (!series.has(tk)) {
      const caminho = `/tickers/${encodeURIComponent(tk)}/prices?mode=${modo}`
      const lista = (await api(caminho, { opcional: true }))?.data ?? []
      series.set(tk, { caminho, mapa: new Map(lista.map((r) => [String(r.price_at).slice(0, 10), Number(r.market_price)]).filter(([, v]) => v > 0)) })
    }
    return series.get(tk)
  }
  /** Variação do papel no pregão D (fechamento contra o pregão anterior, sem furo). */
  async function variacaoPapel(tk, d) {
    const s = await serieDe(tk)
    if (!s.mapa.has(d)) return { erro: `sem preço de ${tk} em ${dataBr(d)}` }
    const antes = [...s.mapa.keys()].filter((x) => x < d).sort().at(-1)
    if (!antes) return { erro: `sem o pregão anterior de ${tk}` }
    for (let x = soma(antes, 1); x < d; x = soma(x, 1)) if (diaUtilB3(x)) return { erro: `${tk} sem preço em ${dataBr(x)}` }
    const v = (s.mapa.get(d) / s.mapa.get(antes) - 1) * 100
    if (Math.abs(v) >= 40) return { erro: `${tk} ${pct(v)} em ${dataBr(d)}: evento societário provável, sinal não conferível` }
    return { var: v, caminho: s.caminho }
  }
  const varIbov = (d) => {
    const i = ibov.diarios?.find((x) => x.data === d)
    return i ? i.var : null
  }

  /** Confere sinal e número contra o pregão D. Devolve { erro } ou { conferido: [...] }. */
  async function conferirNoDia(t, leitura, d) {
    const conferido = []
    const naoConferido = []
    const texto = `${t.title}\n${leitura}`
    const vi = varIbov(d)
    for (const a of afirmacoesIbov(texto)) {
      if (a.naoConferido) naoConferido.push(`"${a.naoConferido}" (outro período)`)
      if (!a.dir && !a.pct && !a.pontos) continue
      if (vi === null) return { erro: `fala do Ibovespa e não há fechamento oficial de ${dataBr(d)}` }
      if (a.dir && Math.sign(vi) !== a.dir) return { erro: `diz que o Ibovespa ${a.dir > 0 ? 'subiu' : 'caiu'} e ele fechou ${pct(vi)} em ${dataBr(d)} ("${a.oracao.slice(0, 80)}")` }
      if (a.pct && !bate(a.pct.valor, a.pct.casas, vi, a.pct.mod)) return { erro: `cita o Ibovespa a ${NF2.format(a.pct.valor)}% e o fechamento de ${dataBr(d)} foi ${pct(vi)}: número intradiário ou de outro dia` }
      if (a.pontos) {
        const fe = ibov.fech.get(d)
        if (!fe || Math.abs(a.pontos - fe) > Math.max(60, fe * 0.0004)) return { erro: `cita o Ibovespa em ${pontos(a.pontos)} pontos e o fechamento de ${dataBr(d)} foi ${pontos2(fe)}` }
      }
      conferido.push(`Ibovespa ${pct(vi)} em ${dataBr(d)} confere com "${a.oracao.slice(0, 70)}"`)
    }
    for (const p of papeisDaNoticia(t)) {
      const afs = afirmacoesPapel(texto, p.ticker)
      for (const a of afs) if (a.naoConferido) naoConferido.push(`"${a.naoConferido}" (outro período)`)
      const dirs = ['up', 'down'].includes(p.dir) ? [p.dir === 'up' ? 1 : -1] : []
      if (!dirs.length && !afs.some((a) => a.dir || a.pct)) continue
      const v = await variacaoPapel(p.ticker, d)
      if (v.erro) return { erro: v.erro }
      for (const dir of dirs) {
        if (Math.sign(v.var) !== dir || Math.abs(v.var) < 0.005) return { erro: `marca ${p.ticker} para ${dir > 0 ? 'cima' : 'baixo'} e o papel fechou ${pct(v.var)} em ${dataBr(d)}` }
      }
      for (const a of afs) {
        if (a.dir && Math.sign(v.var) !== a.dir) return { erro: `o texto diz que ${p.ticker} ${a.dir > 0 ? 'subiu' : 'caiu'} e ele fechou ${pct(v.var)} em ${dataBr(d)}` }
        if (a.pct && !bate(a.pct.valor, a.pct.casas, v.var, a.pct.mod)) return { erro: `cita ${p.ticker} a ${NF2.format(a.pct.valor)}% e o fechamento de ${dataBr(d)} foi ${pct(v.var)}` }
      }
      conferido.push(`${p.ticker} ${pct(v.var)} em ${dataBr(d)}${p.dir && p.dir !== 'flat' ? ` (marcado ${p.dir})` : ''}`)
    }
    return { conferido, naoConferido }
  }

  // código de papel no título tem de existir ("Caixa Seguridade (CSXE3)" é CXSE3)
  const codigos = new Map(universo.acoes.map((x) => [x.ticker, true]))
  async function codigoInvalidoNoTitulo(t) {
    const marcados = new Set(papeisDaNoticia(t).map((p) => p.ticker))
    for (const c of new Set(t.title.match(/\b[A-Z]{4}\d{1,2}\b/g) ?? [])) {
      if (marcados.has(c)) continue
      if (!codigos.has(c)) {
        const r = await api(`/tickers/${c}`, { opcional: true })
        codigos.set(c, Boolean(r?.data?.ticker) && !r?.meta?.delisted)
      }
      if (!codigos.get(c)) return c
    }
    return null
  }

  // peça paga: a matéria crua no /news (o `since` é comparado na hora de Brasília)
  async function materiaCrua(t) {
    const d0 = new Date(Date.parse(t.publishedAt) - 60_000 - 3 * 3_600_000)
    const desde = `${d0.toISOString().slice(0, 19)}-03:00`
    const base = `/news?source=${encodeURIComponent(t.source)}&since=${encodeURIComponent(desde)}`
    const total = (await api(`${base}&limit=1`, { opcional: true }))?.meta?.total ?? 0
    if (!total) return null
    const lote = (await api(`${base}&limit=12&offset=${Math.max(0, total - 12)}`, { opcional: true }))?.data ?? []
    const achou = lote.find((a) => normUrl(a.url) === normUrl(t.url))
    if (!achou) return null
    const corpo = (await api(`/news/${achou.id}`, { opcional: true }))?.data?.content ?? ''
    return { ...achou, content: corpo }
  }

  const candidatas = [...mapa.values()].sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0) || Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
  const porDia = new Map()
  let deIndice = 0
  const descartar = (t, motivo) => out.descartadas.push({ t, motivo, quando: quandoSP(t.publishedAt) })
  for (const t of candidatas) {
    if (out.escolhidas.length >= 5) break
    const q = quandoSP(t.publishedAt)
    if (!t.atlasReading || t.atlasReading.trim().length < 40) { descartar(t, 'sem leitura do Atlas'); continue }
    // A frase que liga a notícia a uma tese da casa sai do e-mail; o resto da
    // leitura fica. Se a tese está na frase de abertura, o que sobra começa no
    // meio do raciocínio: a notícia sai inteira.
    const leitura = leituraSemTese(t.atlasReading)
    if (leitura.abertura) { descartar(t, 'a frase de abertura da leitura cita tese da Redentia'); continue }
    if (leitura.texto.length < 80) { descartar(t, 'a leitura é quase toda sobre tese da Redentia'); continue }
    // o que vai para o e-mail passa pelo veto; o texto inteiro (com a frase da
    // tese) passa pelas conferências de peça paga e de sinal
    const exibido = `${t.title}\n${leitura.texto}`
    const inteiro = `${t.title}\n${t.atlasReading}`
    const veto = proibida(exibido)
    if (veto) { descartar(t, `palavra vetada: ${veto}`); continue }
    if (PUBLI_SLUG.test(t.url) || PUBLI_TITULO.test(t.title) || PUBLI_TEXTO.test(inteiro)) { descartar(t, 'sinal de peça paga no título ou no endereço'); continue }
    // diversidade antes do que custa requisição
    const marcados = papeisDaNoticia(t).map((p) => p.ticker)
    const papel = marcados[0] ?? null
    const par = marcados.slice(0, 2).sort().join('+')
    // IVVB11 e NASD11 são etiqueta de assunto macro (dólar, bolsa americana), não
    // um assunto só: ali quem separa é o título e os números da leitura
    if (papel && !EXTRA_NOTICIAS.includes(papel) && out.escolhidas.some((e) => e.papel === papel)) { descartar(t, `já há uma notícia de ${papel}`); continue }
    if (marcados.length >= 2 && out.escolhidas.some((e) => e.par === par)) { descartar(t, `já há uma notícia de ${par.replace('+', ' e ')}`); continue }
    const irma = out.escolhidas.find((e) => parecido(e.t.title, t.title) >= 0.34)
    if (irma) { descartar(t, `mesmo assunto de "${irma.t.title.slice(0, 60)}"`); continue }
    const mesmosNumeros = out.escolhidas.find((e) => [...numerosFortes(e.leitura)].some((n) => numerosFortes(leitura.texto).has(n)))
    if (mesmosNumeros) { descartar(t, `mesmo fato de "${mesmosNumeros.t.title.slice(0, 60)}" (os mesmos números na leitura)`); continue }
    if ((porDia.get(q.data) ?? 0) >= 2) { descartar(t, `já há duas notícias de ${dataBr(q.data)}`); continue }
    const sobreIndice = /\b(ibovespa|ibov)\b/i.test(t.title)
    if (sobreIndice && deIndice >= 1) { descartar(t, 'já há uma notícia sobre o Ibovespa do dia'); continue }
    if (!ibov.sessoes?.includes(q.data)) { descartar(t, `${dataBr(q.data)} não é pregão com fechamento oficial: sinal não conferível`); continue }
    const codigoRuim = await codigoInvalidoNoTitulo(t)
    if (codigoRuim) { descartar(t, `o título cita ${codigoRuim}, código que não existe na B3${papel ? ` (o papel marcado é ${papel})` : ''}`); continue }
    // o sinal: contra o pregão do dia; notícia da noite pode falar do pregão seguinte
    let c = await conferirNoDia(t, t.atlasReading, q.data)
    let diaConferido = q.data
    if (c.erro && q.minutos >= 18 * 60) {
      const seguinte = ibov.sessoes.find((d) => d > q.data)
      if (seguinte) {
        const c2 = await conferirNoDia(t, t.atlasReading, seguinte)
        if (!c2.erro) { c = c2; diaConferido = seguinte }
      }
    }
    if (c.erro) { descartar(t, `sinal não bate: ${c.erro}`); continue }
    const crua = await materiaCrua(t)
    if (!crua) { descartar(t, 'matéria não localizada no /news: o selo de peça paga não foi conferido'); continue }
    const marcas = [
      PUBLI_AUTOR.test(crua.author ?? '') && `byline ${crua.author}`,
      PUBLI_CATEGORIA.test(crua.category ?? '') && `seção "${crua.category}"`,
      PUBLI_TEXTO.test(`${crua.title}\n${crua.excerpt ?? ''}\n${crua.content ?? ''}`) && 'selo no corpo',
    ].filter(Boolean)
    if (marcas.length) { descartar(t, `peça paga ou coluna (${marcas.join(', ')})`); continue }
    out.escolhidas.push({ t, leitura: leitura.texto, cortadas: leitura.cortadas, papel, par, quando: q, diaConferido, conferido: c.conferido, naoConferido: c.naoConferido, crua: { id: crua.id, autor: crua.author, secao: crua.category } })
    porDia.set(q.data, (porDia.get(q.data) ?? 0) + 1)
    if (sobreIndice) deIndice++
  }
  out.escolhidas.sort((a, b) => Date.parse(a.t.publishedAt) - Date.parse(b.t.publishedAt))
  out.ok = out.escolhidas.length >= 3
  if (!out.ok) out.motivo = `só ${out.escolhidas.length} notícia(s) passaram nas conferências (o mínimo é 3)`
  return out
}

// ——— 3. Proventos da semana que vem ———

/** R1 do Backend (ScrapeDividends::isCapital), a mesma do app/utils/proventos.ts: amortização e restituição são capital. */
function ehCapital(label) {
  const l = semAcento(label).toLowerCase()
  return l.includes('amortiza') || (/\brest/.test(l) && /\bcap/.test(l))
}
const diaIso = (v) => { const s = typeof v === 'string' ? v.slice(0, 10) : ''; return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '' }

/** GET /dividends/{t} → linhas, como o parseProventos do site lê (chave "label " com espaço, rate em texto, a definir). */
function linhasDeProvento(dados) {
  const out = []
  for (const bruto of dados ?? []) {
    const d = bruto ?? {}
    const rotulo = String(d.label ?? d['label '] ?? '').trim()
    const dataCom = diaIso(d.ex_date)
    const pagCru = diaIso(d.payment_date)
    // payment_pending: o payment_date repete a data-com como marcador; é "a definir"
    const pagamento = d.payment_pending === true ? '' : pagCru || dataCom
    const valor = Number(d.rate)
    if (!(dataCom || pagCru) || !Number.isFinite(valor) || valor <= 0) continue
    out.push({ dataCom: dataCom || null, pagamento, valor, rotulo, capital: ehCapital(rotulo) })
  }
  return out
}

function rotuloBonito(r) {
  const s = semAcento(r).toLowerCase().trim()
  if (ehCapital(r)) return 'Amortização'
  if (/^(jcp|juros sobre (o )?capital( proprio)?|jrs cap proprio)$/.test(s)) return 'JCP'
  if (/^dividendos?$/.test(s)) return 'Dividendo'
  if (/^rendimentos?$/.test(s)) return 'Rendimento'
  if (/^rend\.? tributado$/.test(s)) return 'Rendimento tributado'
  return r.replace(/\bJrs Cap Proprio\b/i, 'JCP').replace(/\bAmortizacao\b/i, 'Amortização')
}

async function secaoProventos(sem, universo) {
  const prox = { seg: soma(sem.seg, 7), sex: soma(sem.seg, 11) }
  const out = { ok: false, prox, datasCom: [], pagamentos: [], avisos: [], notas: [], omitidos: [] }
  const conhecidos = new Map()
  universo.acoes.forEach((x, i) => conhecidos.set(x.ticker, { ordem: i, classe: 'acao', nome: x.nome }))
  FIIS_CONHECIDOS.forEach((t, i) => { if (!conhecidos.has(t)) conhecidos.set(t, { ordem: 1000 + i, classe: 'fii' }) })

  // o calendário do site, com a regra de duplicata do Backend aplicada
  const cal = new Map()
  const juntar = (r, caminho) => {
    for (const g of r?.data ?? []) for (const i of g?.items ?? []) {
      const pag = diaIso(i?.payment_date)
      if (i?.ticker && pag) cal.set(`${i.ticker}|${pag}`, { ...i, payment_date: pag, last_date_prior: diaIso(i.last_date_prior) || null, caminho })
    }
    if ((r?.total ?? 0) >= 500) out.avisos.push(`${caminho} bateu o limite de 500 linhas: o calendário pode estar cortado.`)
  }
  const caminhos = []
  if (prox.seg < AGORA.hoje) {
    const c = `/dividends/recent?days=${Math.min(180, diasEntre(prox.seg, AGORA.hoje))}&limit=500`
    caminhos.push(c)
    const r = await api(c, { opcional: true })
    if (!r) { out.motivo = `o calendário de proventos não respondeu (${c})`; return out }
    juntar(r, c)
  }
  const cUp = '/dividends/upcoming?days=180&limit=500'
  caminhos.push(cUp)
  const up = await api(cUp, { opcional: true })
  if (!up) { out.motivo = `o calendário de proventos não respondeu (${cUp})`; return out }
  juntar(up, cUp)

  const naSemana = (d) => d && d >= prox.seg && d <= prox.sex
  const candidatos = [...cal.values()].filter((i) => conhecidos.has(i.ticker) && (naSemana(i.payment_date) || naSemana(i.last_date_prior)))
  out.notas.push(`Calendário: ${caminhos.map((c) => `\`GET ${c}\` (${ref(c)})`).join(' e ')}. ${cal.size} pagamentos no total; ${candidatos.length} dos papéis conhecidos (${universo.acoes.length} do Ibovespa e ${FIIS_CONHECIDOS.length} FIIs) com data-com ou pagamento de ${dataBr(prox.seg)} a ${dataBr(prox.sex)}.`)

  // conferência papel a papel no /dividends/{t}, a mesma fonte da página /dividendos
  const tickers = [...new Set(candidatos.map((i) => i.ticker))]
  for (const tk of tickers) {
    const caminho = `/dividends/${tk}`
    const linhas = linhasDeProvento((await api(caminho, { opcional: true }))?.data)
    const meta = conhecidos.get(tk)
    const doCal = candidatos.filter((i) => i.ticker === tk)
    let falhou = false
    for (const i of doCal.filter((x) => naSemana(x.payment_date))) {
      const soma0 = linhas.filter((l) => l.pagamento === i.payment_date).reduce((a, l) => a + l.valor, 0)
      if (Math.abs(soma0 - Number(i.rate)) > 2e-6 * Math.max(1, Number(i.rate))) {
        out.omitidos.push(`${tk}: o calendário dá ${reais(Number(i.rate))} em ${dataBr(i.payment_date)} e o /dividends/${tk} soma ${reais(soma0)} nessa data`)
        falhou = true
      }
    }
    for (const i of doCal.filter((x) => naSemana(x.last_date_prior))) {
      if (!linhas.some((l) => l.dataCom === i.last_date_prior)) {
        out.omitidos.push(`${tk}: o calendário dá data-com em ${dataBr(i.last_date_prior)} e o /dividends/${tk} não tem essa data-com`)
        falhou = true
      }
    }
    if (falhou) continue
    const base = { ticker: tk, classe: meta.classe, ordem: meta.ordem, nome: meta.classe === 'acao' && nomeDaEmpresa && meta.nome ? nomeDaEmpresa(meta.nome) : null, fonte: `${caminho} (${ref(caminho)})` }
    for (const l of linhas) {
      if (naSemana(l.pagamento)) out.pagamentos.push({ ...base, rotulo: rotuloBonito(l.rotulo), valor: l.valor, dataCom: l.dataCom, pagamento: l.pagamento, capital: l.capital })
      if (naSemana(l.dataCom)) out.datasCom.push({ ...base, rotulo: rotuloBonito(l.rotulo), valor: l.valor, dataCom: l.dataCom, pagamento: l.pagamento || null, capital: l.capital })
    }
  }
  const ordem = (campo) => (a, b) => (a[campo] ?? '').localeCompare(b[campo] ?? '') || a.ordem - b.ordem || a.ticker.localeCompare(b.ticker)
  out.datasCom.sort(ordem('dataCom'))
  out.pagamentos.sort(ordem('pagamento'))
  for (const [lista, nome] of [[out.datasCom, 'datas-com'], [out.pagamentos, 'pagamentos']]) {
    if (lista.length > 10) {
      const fora = lista.splice(10).sort((a, b) => a.ordem - b.ordem)
      out.notas.push(`Ficaram fora do e-mail ${fora.length} ${nome} (o e-mail mostra 10): ${fora.map((x) => x.ticker).join(', ')}.`)
    }
  }
  if (out.omitidos.length) out.avisos.push(`Proventos omitidos por divergência entre o calendário e a página do papel: ${out.omitidos.length} (ver notas).`)
  out.ok = out.datasCom.length + out.pagamentos.length > 0
  if (!out.ok) out.motivo = `nenhuma data-com nem pagamento dos papéis conhecidos de ${dataBr(prox.seg)} a ${dataBr(prox.sex)} no calendário da API`
  return out
}

// ——— 4. Da Redentia ———

function secaoRedentia(sem) {
  const opcoes = DA_REDENTIA.filter((x) => !/preco-teto|preço-teto/i.test(x.caminho))
  const n = semanaIso(sem.seg)
  return { ...opcoes[n % opcoes.length], url: `${SITE}${opcoes[n % opcoes.length].caminho}`, semanaIso: n }
}

// ——— texto ———

function frasesIbov(ib) {
  const { referencia: r, fechamento: f, variacao: v } = ib
  const verbo = v > 0 ? 'subiu' : v < 0 ? 'caiu' : 'ficou estável'
  const verboParcial = v > 0 ? 'sobe' : v < 0 ? 'cai' : 'está estável'
  // sexta é "a sexta"; semana que acaba antes (feriado) diz qual foi o último pregão
  const quandoF = diaDaSemana(f.data) === 5 ? `a sexta (${dataCurta(f.data)})` : `a ${diaNome(f.data)} (${dataCurta(f.data)}), último pregão da semana,`
  const refTxt = diaDaSemana(r.data) === 5 ? `${pontos(r.valor)} da sexta anterior (${dataCurta(r.data)})` : `${pontos(r.valor)} do último pregão da semana anterior (${diaNome(r.data)}, ${dataCurta(r.data)})`
  const frase = ib.parcial
    ? { antes: `Até ${diaNome(f.data)} (${dataCurta(f.data)}), o Ibovespa ${verboParcial} `, pct: v, depois: ` na semana: ${pontos(f.valor)} pontos, contra ${refTxt}.` }
    : { antes: `O Ibovespa ${verbo} `, pct: v, depois: ` na semana e fechou ${quandoF} em ${pontos(f.valor)} pontos, contra ${refTxt}.` }
  const dolar = ib.dolar ? `O dólar PTAX de venda ficou em R$ ${NF4.format(ib.dolar.valor)} em ${dataCurta(ib.dolar.data)}.` : null
  const dias = []
  for (let d = segundaDe(f.data); d <= soma(segundaDe(f.data), 4); d = soma(d, 1)) {
    const x = ib.diarios.find((y) => y.data === d)
    const ab = DIAS[diaDaSemana(d)].slice(0, 3)
    if (x) dias.push({ rot: `${ab} ${dataCurta(d)}`, txt: pct(x.var), var: x.var })
    else if (SEM_PREGAO_B3.has(d)) dias.push({ rot: `${ab} ${dataCurta(d)}`, txt: 'feriado', var: null })
  }
  const fonte = `Fonte: B3, fechamentos oficiais de ${dataBr(r.data)} e ${dataBr(f.data)}${ib.dolar ? `; Banco Central, PTAX de ${dataBr(ib.dolar.data)}` : ''}.`
  return { frase, dolar, dias, fonte }
}

function montarAssunto(dados) {
  const ib = dados.ibov
  if (ib.ok) return `Ibovespa ${pct(ib.variacao)} na semana${ib.parcial ? ` até ${diaNome(ib.fechamento.data)}` : ''}: o que mexeu com a bolsa`
  return `O mercado da semana: o que mexeu com a bolsa de ${dataCurta(dados.sem.seg)} a ${dataCurta(dados.sem.sex)}`
}
function montarPreheader(dados) {
  const { noticias, proventos } = dados
  const partes = []
  if (noticias.ok) partes.push(`${noticias.escolhidas.length} notícias da semana com a leitura da IA`)
  if (proventos.ok) partes.push(`os proventos de ${dataCurta(proventos.prox.seg)} a ${dataCurta(proventos.prox.sex)}`)
  return partes.length ? `${partes.join(' e ')}.`.replace(/^./, (c) => c.toUpperCase()) : 'O que mexeu com a bolsa na semana.'
}

// ——— e-mail (HTML com estilo inline) ———

const COR = { navy: '#0E1A2B', creme: '#F4F0E8', azul: '#2F6AFF', branco: '#FFFFFF', corpo: '#3A3733', cinza: '#6E675B', linha: '#E9E3D7', verde: '#148F4E', vermelho: '#D6323B', cremeTexto: 'rgba(244,240,232,0.72)' }
const FONTE = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
const corVar = (v) => (v > 0 ? COR.verde : v < 0 ? COR.vermelho : COR.navy)
/** Comentário HTML com a fonte do número; "--" dentro de comentário quebra o HTML. */
const comentario = (t) => `<!-- ${String(t).replace(/-{2,}/g, (m) => m.split('').join(' '))} -->`
/** "data-com" quebrava no hífen na coluna estreita do celular. */
const semQuebra = (html) => html.replace(/\b(data-com|datas-com)\b/gi, '<span style="white-space:nowrap;">$1</span>')

/** "R$" e "US$" não ficam sozinhos no fim da linha ("giro de R$ / 29 bilhões"). */
const moedaColada = (html) => html.replace(/\b(R\$|US\$) (?=\d)/g, '$1&nbsp;')

function htmlEmail(dados) {
  return moedaColada(montarHtml(dados))
}

function montarHtml(dados) {
  const { sem, ibov, noticias, proventos, redentia } = dados
  const eyebrow = (t) => `<div style="font-family:${FONTE};font-size:12px;line-height:16px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${COR.azul};">${esc(t)}</div>`
  const nota = (t) => `<p style="margin:12px 0 0;font-family:${FONTE};font-size:12px;line-height:18px;font-weight:500;color:${COR.cinza};">${esc(t)}</p>`
  const secao = (primeira, miolo, nota0) => `
          <tr><td style="padding:${primeira ? '32px' : '28px'} 32px 4px;${primeira ? '' : `border-top:1px solid ${COR.linha};`}">${nota0 ? `\n            ${comentario(nota0)}` : ''}
            ${miolo}
          </td></tr>`
  const blocos = []

  if (ibov.ok) {
    const f = frasesIbov(ibov)
    const tiras = f.dias.map((d) => `<span style="white-space:nowrap;">${esc(d.rot)} <strong style="font-weight:700;color:${d.var === null ? COR.cinza : corVar(d.var)};">${esc(d.txt)}</strong></span>`).join(`<span style="color:${COR.linha};"> &nbsp;|&nbsp; </span>`)
    blocos.push(secao(true, `${eyebrow('A semana em uma frase')}
            <p style="margin:12px 0 0;font-family:${FONTE};font-size:21px;line-height:31px;font-weight:700;color:${COR.navy};">${esc(f.frase.antes)}<span style="color:${corVar(f.frase.pct)};white-space:nowrap;">${esc(pctSemSinal(f.frase.pct))}</span>${esc(f.frase.depois)}${f.dolar ? ` ${esc(f.dolar)}` : ''}</p>
            <p style="margin:14px 0 0;font-family:${FONTE};font-size:13px;line-height:22px;font-weight:500;color:${COR.cinza};">${tiras}</p>
            ${nota(f.fonte)}`, `fonte: ${API}/indices/IBOV/prices — ${dataBr(ibov.referencia.data)} ${pontos2(ibov.referencia.valor)} e ${dataBr(ibov.fechamento.data)} ${pontos2(ibov.fechamento.valor)}; variação ${pct(ibov.variacao, 4)}${ibov.dolar ? `; PTAX ${dataBr(ibov.dolar.data)} R$ ${NF4.format(ibov.dolar.valor)} (${API}/macro/snapshot)` : ''}`))
  }

  if (noticias.ok) {
    const itens = noticias.escolhidas.map((e, i) => {
      const t = e.t
      return `
            <div style="margin-top:${i === 0 ? '14px' : '24px'};">
              ${comentario(`fonte: ${t.url} · /research/news id ${t.id} · ${t.publishedAt}`)}
              <div style="font-family:${FONTE};font-size:12px;line-height:16px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;color:${COR.cinza};">${esc(nomeFonte(t.source))} · ${esc(diaNome(e.quando.data))}, ${esc(dataCurta(e.quando.data))}</div>
              <a href="${esc(t.url)}" style="display:block;margin-top:6px;font-family:${FONTE};font-size:17px;line-height:25px;font-weight:700;color:${COR.navy};text-decoration:none;">${esc(t.title)}</a>
              <p style="margin:8px 0 0;font-family:${FONTE};font-size:15px;line-height:24px;font-weight:500;color:${COR.corpo};"><span style="font-weight:700;color:${COR.azul};">A leitura da IA:</span> ${esc(e.leitura)}</p>
            </div>`
    }).join('')
    blocos.push(secao(!blocos.length, `${eyebrow('O que mexeu com a bolsa')}${itens}
            ${nota('Títulos e fatos: os veículos citados, com a data da publicação. A leitura é da IA da Redentia.')}`))
  }

  if (proventos.ok) {
    const th = (t, alinha = 'left') => `<th align="${alinha}" style="padding:8px 6px 8px 0;font-family:${FONTE};font-size:11px;line-height:14px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:${COR.cinza};border-bottom:1px solid ${COR.linha};">${t}</th>`
    const td = (t, extra = '') => `<td style="padding:9px 6px 9px 0;font-family:${FONTE};font-size:14px;line-height:20px;font-weight:500;color:${COR.corpo};border-bottom:1px solid ${COR.linha};vertical-align:top;${extra}">${t}</td>`
    const papel = (x) => `<strong style="font-weight:700;color:${COR.navy};">${esc(x.ticker)}</strong>${x.nome ? `<br><span style="font-size:12px;color:${COR.cinza};">${esc(x.nome)}</span>` : ''}`
    const tabela = (titulo, explica, linhas, chave) => linhas.length ? `
            <div style="margin-top:16px;font-family:${FONTE};font-size:15px;line-height:22px;font-weight:700;color:${COR.navy};">${semQuebra(esc(titulo))}</div>
            <div style="margin-top:2px;font-family:${FONTE};font-size:13px;line-height:19px;font-weight:500;color:${COR.cinza};">${semQuebra(esc(explica))}</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;border-collapse:collapse;">
              <tr>${th('Papel')}${th('Provento')}${th('R$ por ação ou cota', 'right')}${th(chave === 'dataCom' ? 'Pagamento' : '<span style="white-space:nowrap;">Data-com</span>', 'right')}</tr>
              ${linhas.map((x) => `${comentario(`fonte: ${x.fonte} · ${x.rotulo} ${x.valor} · data-com ${x.dataCom ?? '—'} · pagamento ${x.pagamento ?? 'a definir'}`)}<tr>${td(papel(x))}${td(esc(x.rotulo))}${td(esc(NF24.format(x.valor)), 'text-align:right;white-space:nowrap;')}${td(esc(chave === 'dataCom' ? (x.pagamento ? dataCurta(x.pagamento) : 'a definir') : (x.dataCom ? dataCurta(x.dataCom) : '—')), 'text-align:right;white-space:nowrap;')}</tr>`).join('\n              ')}
            </table>` : ''
    const porDia = (lista, campo) => {
      const grupos = []
      for (const x of lista) {
        const g = grupos.at(-1)
        if (g && g.data === x[campo]) g.linhas.push(x)
        else grupos.push({ data: x[campo], linhas: [x] })
      }
      return grupos
    }
    const blocoCom = porDia(proventos.datasCom, 'dataCom').map((g) => tabela(`Data-com ${diaNome(g.data)}, ${dataCurta(g.data)}`, 'Quem tiver o papel no fim deste pregão recebe.', g.linhas, 'dataCom')).join('')
    const blocoPag = porDia(proventos.pagamentos, 'pagamento').map((g) => tabela(`Pagamento ${diaNome(g.data)}, ${dataCurta(g.data)}`, 'Cai na conta de quem tinha o papel na data-com.', g.linhas, 'pagamento')).join('')
    blocos.push(secao(!blocos.length, `${eyebrow('Proventos da semana que vem')}
            <p style="margin:12px 0 0;font-family:${FONTE};font-size:15px;line-height:24px;font-weight:500;color:${COR.corpo};">${semQuebra('Datas-com')} e pagamentos de ${esc(intervaloLongo(proventos.prox.seg, proventos.prox.sex))}, entre as ações do Ibovespa e os fundos imobiliários mais conhecidos.</p>${blocoCom}${blocoPag}
            ${nota(`Fonte: comunicados das empresas e dos fundos à B3, compilados pela Redentia em ${dataBr(AGORA.hoje)}. Valor bruto, antes do imposto quando há.`)}`))
  }

  blocos.push(secao(!blocos.length, `${eyebrow('Da Redentia')}
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;border-collapse:separate;">
              <tr><td style="background-color:${COR.creme};border-left:4px solid ${COR.azul};border-radius:12px;padding:18px 20px;">
                <div style="font-family:${FONTE};font-size:12px;line-height:16px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:${COR.cinza};">${esc(redentia.tipo)}</div>
                <a href="${esc(redentia.url)}" style="display:block;margin-top:6px;font-family:${FONTE};font-size:17px;line-height:25px;font-weight:800;color:${COR.navy};text-decoration:none;">${esc(redentia.titulo)}</a>
                <p style="margin:6px 0 0;font-family:${FONTE};font-size:14px;line-height:22px;font-weight:500;color:${COR.corpo};">${esc(redentia.texto)}</p>
                <a href="${esc(redentia.url)}" style="display:inline-block;margin-top:12px;font-family:${FONTE};font-size:14px;line-height:20px;font-weight:700;color:${COR.azul};text-decoration:none;">${redentia.tipo === 'Guia' ? 'Ler o guia' : 'Abrir a ferramenta'} &rarr;</a>
              </td></tr>
            </table>`))

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${esc(dados.assunto)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:${COR.creme};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${COR.creme};opacity:0;">${esc(dados.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COR.creme};">
  <tr><td align="center" style="padding:24px 12px 40px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
      <tr><td style="background-color:${COR.navy};border-radius:16px 16px 0 0;padding:28px 32px 30px;">
        <div style="font-family:${FONTE};font-size:13px;line-height:16px;font-weight:800;letter-spacing:3px;color:${COR.creme};">REDENTIA</div>
        <div style="margin-top:22px;width:32px;height:3px;background-color:${COR.azul};line-height:3px;font-size:0;">&nbsp;</div>
        <div style="margin-top:14px;font-family:${FONTE};font-size:12px;line-height:16px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${COR.cremeTexto};">O mercado da semana</div>
        <div style="margin-top:6px;font-family:${FONTE};font-size:24px;line-height:31px;font-weight:800;color:${COR.creme};">${esc(intervaloLongo(sem.seg, sem.sex))}</div>
      </td></tr>
      <tr><td style="background-color:${COR.branco};border-radius:0 0 16px 16px;padding:0 0 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${blocos.join('')}
        </table>
      </td></tr>
      <tr><td style="padding:22px 32px 0;text-align:center;">
        <p style="margin:0;font-family:${FONTE};font-size:12px;line-height:18px;font-weight:700;color:${COR.navy};">Conteúdo educacional. Não é recomendação de investimento.</p>
        <p style="margin:6px 0 0;font-family:${FONTE};font-size:12px;line-height:18px;font-weight:500;color:${COR.cinza};"><a href="${SITE}" style="color:${COR.cinza};text-decoration:underline;">redentia.com.br</a></p>
        <!--rodape-assinante-->
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>
`
}

// ——— rascunho.md (o e-mail em texto, mais as notas de conferência) ———

function mdRascunho(dados) {
  const { sem, ibov, noticias, proventos, redentia } = dados
  const L = []
  L.push(`# O mercado da semana · ${intervaloLongo(sem.seg, sem.sex)}`, '')
  L.push(`> Rascunho para revisão, montado em ${dataBr(AGORA.hoje)} às ${AGORA.hora} (Brasília) por \`node scripts/newsletter-semana.mjs${SEMANA_ARG ? ` --semana ${SEMANA_ARG}` : ''}\`. Nada foi enviado. O e-mail pronto está no rascunho.html; para mandar só para você: \`node scripts/newsletter-enviar.mjs --teste <seu e-mail>\`.`, '')
  L.push(`**Assunto sugerido:** ${dados.assunto}  `, `**Pré-cabeçalho:** ${dados.preheader}`, '')
  if (dados.avisos.length) {
    L.push('## Antes de enviar', '')
    for (const a of dados.avisos) L.push(`- ${a}`)
    L.push('')
  }
  L.push('---', '')
  if (ibov.ok) {
    const f = frasesIbov(ibov)
    L.push('## A semana em uma frase', '')
    L.push(`${f.frase.antes}**${pctSemSinal(f.frase.pct)}**${f.frase.depois}${f.dolar ? ` ${f.dolar}` : ''}`, '')
    L.push(f.dias.map((d) => `${d.rot} **${d.txt}**`).join(' · '), '')
    L.push(`<sub>${f.fonte}</sub>`, '')
  }
  if (noticias.ok) {
    L.push('## O que mexeu com a bolsa', '')
    for (const e of noticias.escolhidas) {
      L.push(`### [${e.t.title}](${e.t.url})`, `${nomeFonte(e.t.source)} · ${diaNome(e.quando.data)}, ${dataBr(e.quando.data)}`, '', `**A leitura da IA:** ${e.leitura}`, '')
    }
    L.push('<sub>Títulos e fatos: os veículos citados, com a data da publicação. A leitura é da IA da Redentia.</sub>', '')
  }
  if (proventos.ok) {
    L.push('## Proventos da semana que vem', '', `Datas-com e pagamentos de ${intervaloLongo(proventos.prox.seg, proventos.prox.sex)}, entre as ações do Ibovespa e os fundos imobiliários mais conhecidos.`, '')
    const tab = (titulo, lista, chave) => {
      if (!lista.length) return
      L.push(`**${titulo}**`, '', `| Papel | Provento | R$ por ação ou cota | ${chave === 'dataCom' ? 'Data-com | Pagamento' : 'Pagamento | Data-com'} |`, '|---|---|--:|--:|--:|')
      for (const x of lista) {
        const papel = `**${x.ticker}**${x.nome ? ` ${x.nome}` : ''}`
        const com = x.dataCom ? dataCurta(x.dataCom) : '—'
        const pag = x.pagamento ? dataCurta(x.pagamento) : 'a definir'
        L.push(`| ${papel} | ${x.rotulo} | ${NF24.format(x.valor)} | ${chave === 'dataCom' ? `${com} | ${pag}` : `${pag} | ${com}`} |`)
      }
      L.push('')
    }
    tab('Data-com na semana (quem tiver o papel no fim do pregão da data-com recebe)', proventos.datasCom, 'dataCom')
    tab('Pagamentos na semana (cai na conta de quem tinha o papel na data-com)', proventos.pagamentos, 'pagamento')
    L.push(`<sub>Fonte: comunicados das empresas e dos fundos à B3, compilados pela Redentia em ${dataBr(AGORA.hoje)}. Valor bruto, antes do imposto quando há.</sub>`, '')
  }
  L.push('## Da Redentia', '', `**${redentia.tipo}:** [${redentia.titulo}](${redentia.url})  `, redentia.texto, '')
  L.push('---', '', '**Conteúdo educacional. Não é recomendação de investimento.**', '')

  L.push('---', '', '# Notas de conferência (não vão no e-mail)', '')
  L.push(`Cada número abaixo traz o endpoint e o número da chamada no \`fontes.json\` (#N), onde está a resposta crua. API: ${API}.`, '')
  L.push('## 1. Ibovespa', '')
  if (!ibov.ok) L.push(`**Seção fora do e-mail:** ${ibov.motivo}.`, '')
  for (const n of ibov.notas) L.push(`- ${n}`)
  L.push('')
  L.push('## 2. Notícias', '')
  if (!noticias.ok) L.push(`**Seção fora do e-mail:** ${noticias.motivo}.`, '')
  for (const n of noticias.notas) L.push(`- ${n}`)
  if (noticias.escolhidas.length) {
    L.push('', '**Escolhidas** (por relevância, mostradas em ordem de data):', '')
    for (const e of noticias.escolhidas) {
      const t = e.t
      L.push(`- id ${t.id} · relevância ${t.relevance} · ${nomeFonte(t.source)} · ${t.publishedAt} · papéis: ${papeisDaNoticia(t).map((p) => `${p.ticker}${p.dir ? ` (${p.dir})` : ''}`).join(', ') || 'nenhum'}`)
      L.push(`  - ${t.title}`)
      L.push(`  - sinal: ${e.conferido.length ? e.conferido.join('; ') : 'o texto não afirma direção nem número de papel ou do Ibovespa (nada a conferir)'}${e.diaConferido !== e.quando.data ? ` (conferido no pregão seguinte, ${dataBr(e.diaConferido)})` : ''}`)
      if (e.naoConferido.length) L.push(`  - número não conferido (a API não tem o dado): ${e.naoConferido.join('; ')}`)
      L.push(`  - peça paga: não (matéria ${e.crua.id} no /news, seção "${e.crua.secao ?? '—'}", byline ${e.crua.autor ?? '—'})`)
      if (e.cortadas.length) L.push(`  - frase cortada da leitura (cita tese da Redentia): "${e.cortadas.join(' ')}"`)
    }
  }
  if (noticias.descartadas.length) {
    L.push('', `**Descartadas** (${noticias.descartadas.length}, na ordem em que foram avaliadas):`, '')
    for (const d of noticias.descartadas.slice(0, 40)) L.push(`- [${d.t.relevance}] ${dataCurta(d.quando.data)} ${nomeFonte(d.t.source)}: ${d.t.title.slice(0, 110)} → ${d.motivo}`)
    if (noticias.descartadas.length > 40) L.push(`- … e mais ${noticias.descartadas.length - 40}.`)
  }
  L.push('')
  L.push('## 3. Proventos', '')
  if (!proventos.ok) L.push(`**Seção fora do e-mail:** ${proventos.motivo}.`, '')
  for (const n of proventos.notas) L.push(`- ${n}`)
  for (const x of [...proventos.datasCom.map((y) => ['data-com', y]), ...proventos.pagamentos.map((y) => ['pagamento', y])]) {
    const [tipo, y] = x
    L.push(`- ${tipo}: ${y.ticker} · ${y.rotulo} · ${reais(y.valor)} · data-com ${y.dataCom ? dataBr(y.dataCom) : '—'} · pagamento ${y.pagamento ? dataBr(y.pagamento) : 'a definir'} · conferido em \`GET ${y.fonte}\``)
  }
  for (const o of proventos.omitidos) L.push(`- omitido: ${o}`)
  L.push('')
  L.push('## 4. Da Redentia', '', `- Rodízio pela semana ISO ${redentia.semanaIso}: ${redentia.url}. Preço-teto fica de fora (veto do dono).`, '')
  if (dados.varredura.length) {
    L.push('## Varredura do texto do e-mail', '')
    for (const v of dados.varredura) L.push(`- ${v}`)
    L.push('')
  }
  L.push(`<sub>${CHAMADAS.length} chamadas à API, uma por vez.</sub>`, '')
  return L.join('\n')
}

/** Varre o texto visível do e-mail: palavra vetada (fora o rodapé legal) e palavra de rascunho. */
function varrer(html) {
  const visivel = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(title|style|head)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace('Conteúdo educacional. Não é recomendação de investimento.', ' ')
  const achados = []
  const veto = proibida(visivel)
  if (veto) achados.push(`Palavra vetada no e-mail: ${veto}. Revise antes de enviar.`)
  const rasc = visivel.match(/\b(rascunho|teste|demonstra[cç][aã]o|lorem|placeholder)\b/i) ?? visivel.match(/\bTODO\b/)
  if (rasc) achados.push(`Palavra de rascunho no e-mail: "${rasc[0]}".`)
  return achados
}

// ——— principal ———

async function principal() {
  let sem = semanaAlvo()
  const pastaDe = (s) => path.resolve(val('saida') ?? path.join(RAIZ, 'newsletter-rascunhos', s.sex))
  let saida = pastaDe(sem)

  if (OFFLINE) {
    const arq = path.join(saida, 'fontes.json')
    if (!existsSync(arq)) fatal(`--offline precisa de ${arq} (rode uma vez sem --offline)`)
    const salvo = JSON.parse(await readFile(arq, 'utf8'))
    OFFLINE_MAPA = new Map(salvo.chamadas.map((c) => [c.url, c]))
    AGORA = agoraSP(new Date(salvo.geradoEm))
    sem = salvo.semana
    saida = pastaDe(sem)
  }
  if (sem.seg > AGORA.hoje) fatal(`a semana de ${dataBr(sem.seg)} ainda não começou`)

  console.error(`Semana de ${dataBr(sem.seg)} a ${dataBr(sem.sex)} · agora ${dataBr(AGORA.hoje)} ${AGORA.hora} em Brasília${OFFLINE ? ' (offline: fontes.json)' : ''}`)

  // a carteira do Ibovespa (e os pesos) define "os papéis conhecidos"
  const mercadoHoje = await api('/market/today', { opcional: true })
  const avisos = []
  let acoes = (mercadoHoje?.constituents ?? [])
    .filter((c) => c?.ticker)
    .map((c) => ({ ticker: String(c.ticker).toUpperCase(), peso: Number(c.index_weight) || 0, nome: c.name ?? null }))
    .sort((a, b) => b.peso - a.peso)
  if (!acoes.length) {
    acoes = ACOES_RESERVA.map((ticker) => ({ ticker, peso: 0, nome: null }))
    avisos.push('O /market/today não trouxe a carteira do Ibovespa: notícias e proventos usaram a lista de reserva (ACOES_RESERVA).')
  }
  const universo = { acoes }

  const ibov = await secaoIbovespa(sem, mercadoHoje)
  console.error(`\n1. Ibovespa: ${ibov.ok ? `${pct(ibov.variacao)} (${dataBr(ibov.referencia.data)} → ${dataBr(ibov.fechamento.data)}${ibov.parcial ? ', semana parcial' : ''})` : `fora — ${ibov.motivo}`}`)
  const noticias = await secaoNoticias(sem, ibov, universo)
  console.error(`\n2. Notícias: ${noticias.coletadas} coletadas, ${noticias.escolhidas.length} escolhidas, ${noticias.descartadas.length} descartadas${noticias.ok ? '' : ` — fora: ${noticias.motivo}`}`)
  const proventos = await secaoProventos(sem, universo)
  console.error(`\n3. Proventos de ${dataBr(proventos.prox.seg)} a ${dataBr(proventos.prox.sex)}: ${proventos.datasCom.length} datas-com, ${proventos.pagamentos.length} pagamentos${proventos.ok ? '' : ` — fora: ${proventos.motivo}`}`)
  const redentia = secaoRedentia(sem)

  if (ibov.parcial) avisos.push(`A semana ainda não fechou: o número do Ibovespa vai até ${diaNome(ibov.fechamento.data)}, ${dataBr(ibov.fechamento.data)}.`)
  for (const [nome, s] of [['Ibovespa', ibov], ['Notícias', noticias], ['Proventos', proventos]]) {
    if (!s.ok) avisos.push(`Seção "${nome}" fora do e-mail: ${s.motivo}.`)
    for (const a of s.avisos ?? []) avisos.push(a)
  }

  if (FALTARAM.length) avisos.push(`--offline: ${FALTARAM.length} chamada(s) não estavam no fontes.json e voltaram vazias; o resultado pode diferir de uma rodada na API.`)
  const dados = { sem, ibov, noticias, proventos, redentia, avisos }
  dados.assunto = montarAssunto(dados)
  dados.preheader = montarPreheader(dados)
  const html = htmlEmail(dados)
  dados.varredura = varrer(html)
  for (const v of dados.varredura) avisos.push(v)
  const md = mdRascunho(dados)

  await mkdir(saida, { recursive: true })
  await writeFile(path.join(saida, 'rascunho.html'), html)
  await writeFile(path.join(saida, 'rascunho.md'), md)
  if (!OFFLINE) {
    await writeFile(path.join(saida, 'fontes.json'), JSON.stringify({ geradoEm: AGORA.iso, agora: AGORA, semana: sem, api: API, chamadas: CHAMADAS }, null, 1))
  }

  console.error(`\n${CHAMADAS.length} chamadas à API${OFFLINE ? ' (do fontes.json)' : ', uma por vez'}.`)
  if (avisos.length) { console.error('\nAVISOS'); for (const a of avisos) console.error(`  - ${a}`) }
  console.log(`\n${path.relative(process.cwd(), path.join(saida, 'rascunho.html')) || 'rascunho.html'}`)
  console.log(path.relative(process.cwd(), path.join(saida, 'rascunho.md')))
  console.error(`\nRevisado, mande só para você: node scripts/newsletter-enviar.mjs${SEMANA_ARG ? ` --semana ${SEMANA_ARG}` : ''} --teste <seu e-mail>`)
}

// Rodado pela linha de comando, monta o rascunho; importado (teste), só expõe as conferências de texto.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await principal()

export { afirmacoesIbov, afirmacoesPapel, bate, leituraSemTese, linhasDeProvento, numerosFortes, percentualDoPregao, proibida, varrer }
