#!/usr/bin/env node
/**
 * gsc-painel — mede UM cluster por um painel FIXO de consultas × página.
 *
 * Por que não a posição média da página: 75% a 87% das impressões deste site
 * caem em consultas que o Search Console anonimiza. A posição da PÁGINA mistura
 * o que sobra e muda com o mix, não com o ranking. E a posição média de um
 * recorte por consulta tem viés de sobrevivente: quando a página some de metade
 * das consultas, a média "melhora". O painel corrige as duas coisas:
 *   (a) lista FIXA de consultas, escolhida antes da mudança;
 *   (b) peso FIXO por consulta, as impressões dela na janela de referência;
 *   (c) COBERTURA explícita: quanto do peso do painel a página dona ainda
 *       alcança. Posição sem cobertura do lado é número de sobrevivente.
 *
 * PAINEL "dividendos" (definido em 23/09/2026). Dono: /calculadora/acoes.
 * Na referência (04/05 a 12/07/2026, antes do cutover do Nu em 15/07) ela
 * ficava com ~99% das impressões das consultas "calculadora/simulador de
 * dividendos" e "simulador de ações", na posição ~5,5, com ~50 cliques por
 * semana só nesse painel. Em 18/07 caiu pra 11–16 e o cluster sumiu. A
 * /calculadora/dividend-yield nunca passou da posição ~45 nessas consultas,
 * nem depois de se declarar "Calculadora de Dividendos" (937e7ff, 03/08).
 * A decisão de dono único e o critério de leitura estão no bloco DONO DO
 * CLUSTER de app/pages/calculadora/acoes.vue.
 *
 * Os três grupos:
 *   DIV → "calculadora/simulador de dividendos" (métrica de decisão)
 *   SIM → "simulador/calculadora de ações" (guarda: não pode piorar)
 *   DY  → consultas de calculadora de dividend yield, dono dividend-yield.
 *         Painel FINO (~50 impressões em 10 semanas): só monitor, não decide.
 * Pesos = impressões na referência, em qualquer página (o que existia de
 * demanda nomeada). Limiar de entrada: 30 impressões (DIV, SIM) e 3 (DY).
 *
 * SEMANAS de segunda a domingo, só as FECHADAS (fim ≤ hoje − 3 dias: o GSC
 * fecha o dia com atraso e dia parcial parece queda). Com --desde, a semana do
 * deploy é descartada (metade antes, metade depois), a BASE são as 4 semanas
 * fechadas antes dela e S1..S4 as 4 depois.
 *
 * USO
 *   node scripts/gsc-painel.mjs                       # referência + últimas 4 semanas fechadas
 *   node scripts/gsc-painel.mjs --desde 2026-09-24    # dia do deploy: BASE, S1..S4 e o veredito
 *   node scripts/gsc-painel.mjs --desde 2026-09-24 --rastreio   # + último rastreio do Googlebot
 *   node scripts/gsc-painel.mjs --json                # tudo cru no stdout
 */
import { conectar } from './gsc-api.mjs'

const REF = { startDate: '2026-05-04', endDate: '2026-07-12' }
const REF_SEMANAS = 10
const DIAS_PARCIAIS = 3

const PAINEL = {
  DIV: {
    dono: '/calculadora/acoes',
    consultas: {
      'calculadora de dividendos': 2219, 'simulador de dividendos': 1931, 'calculadora dividendos': 653,
      'calculadora de dividendos mensais': 374, 'simulador dividendos': 359, 'calcular dividendos': 172,
      'calculadora de ações dividendos': 143, 'simulador de ações dividendos': 135,
      'calculadora de dividendos ações': 106, 'simulador de acoes e dividendos': 100, 'calculo dividendos': 94,
      'simular dividendos': 85, 'calculadora ações dividendos': 76, 'simulação de dividendos': 74,
      'calculadora de dividendos reinvestidos': 69, 'dividendos simulador': 67, 'dividendos calculadora': 67,
      'simulador de dividendos mensais': 48, 'calculadora de dividendo': 44,
      'analise de ações simulador de dividendos': 40, 'simulador de dividendo': 31,
    },
  },
  SIM: {
    dono: '/calculadora/acoes',
    consultas: {
      'simulador de ações': 465, 'investir em ações simulador': 301, 'calculadora de ações': 228,
      'simulador de investimento em ações': 165, 'simulador de acoes': 130, 'simulador de investimento ações': 103,
      'simulador ações': 100, 'simulador de ações gratuito': 91, 'calculadora ações': 88, 'calculadora de acoes': 70,
      'simulador investimento ações': 55, 'simulador de ações online': 55, 'simulador de investimento em acoes': 50,
      'simulador acoes': 40, 'calculadora acoes': 34,
    },
  },
  DY: {
    dono: '/calculadora/dividend-yield',
    consultas: {
      'calculadora dividend yield': 28, 'calcular dividend yield': 14, 'calculo dividend yield': 4,
      'calculo de dividend yield': 3,
    },
  },
}

// Páginas somadas por inteiro (com as consultas anônimas). NÃO têm posição de
// propósito: é aí que a média mente. Servem de contexto e de guarda — o
// preco-teto faz 74–84% dos cliques do site e não pode cair junto.
const PAGINAS = ['/calculadora/acoes', '/calculadora/dividend-yield', '/calculadora/preco-teto']

// Critério de leitura, escrito ANTES do deploy (23/09/2026). Lido na média de
// S3 e S4: o Googlebot re-rastreia as ~1.700 páginas de /asset e /dividendos
// aos poucos, e S1–S2 medem mais o rastreio do que a decisão.
const CRITERIO = {
  // DIV: sucesso se a posição fixa chegar a 10 ou menos COM cobertura de pelo
  // menos 40% do peso, ou se o painel voltar a render 10 cliques/semana.
  // Referência (o teto realista) é ~5,5, ~95% e ~34 cliques/semana.
  divPosicao: 10, divCobertura: 0.4, divCliques: 10,
  // SIM (guarda): piora de mais de 3 posições contra a BASE derruba o title
  // novo da acoes (as âncoras ficam: link interno não tem lado ruim aqui).
  simPiora: 3,
}

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const val = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : d }
const DESDE = val('desde', '')
if (DESDE && !/^\d{4}-\d{2}-\d{2}$/.test(DESDE)) { console.error('--desde espera AAAA-MM-DD'); process.exit(1) }

const iso = (d) => d.toISOString().slice(0, 10)
const dia = (s) => new Date(`${s}T12:00:00Z`)
const soma = (s, n) => { const d = dia(s); d.setUTCDate(d.getUTCDate() + n); return iso(d) }
const segunda = (s) => soma(s, -((dia(s).getUTCDay() + 6) % 7))

/** Semanas fechadas: [{ rotulo, startDate, endDate }] */
function semanas() {
  const hoje = iso(new Date())
  const ultimoDia = soma(hoje, -DIAS_PARCIAIS)
  // último domingo ≤ ultimoDia
  const ultimoDomingo = soma(segunda(soma(ultimoDia, 1)), -1)
  const janela = (ini, rotulo) => ({ rotulo, startDate: ini, endDate: soma(ini, 6) })
  if (!DESDE) {
    return [3, 2, 1, 0].map((k) => janela(soma(ultimoDomingo, -6 - 7 * k), `sem ${soma(ultimoDomingo, -6 - 7 * k).slice(5)}`))
  }
  const semDeploy = segunda(DESDE)
  const base = [4, 3, 2, 1].map((k) => janela(soma(semDeploy, -7 * k), `base ${soma(semDeploy, -7 * k).slice(5)}`))
  const depois = []
  for (let k = 1; k <= 4; k++) {
    const ini = soma(semDeploy, 7 * k)
    if (soma(ini, 6) <= ultimoDomingo) depois.push(janela(ini, `S${k} ${ini.slice(5)}`))
  }
  return [...base, ...depois]
}

const caminho = (u) => u.replace(/^https?:\/\/[^/]+/, '').split(/[?#]/)[0] || '/'
const escapa = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const { site, query, inspecionar } = await conectar()
console.error(`propriedade: ${site}`)

const JANELAS = semanas()
const inicio = JANELAS[0].startDate
const fim = JANELAS[JANELAS.length - 1].endDate
const todas = Object.values(PAINEL).flatMap((p) => Object.keys(p.consultas))

async function puxar(body) {
  const rows = []
  for (let startRow = 0; ; startRow += 25000) {
    const r = await query({ ...body, rowLimit: 25000, startRow, dataState: 'final' })
    rows.push(...r)
    if (r.length < 25000) return rows
  }
}

const filtroConsultas = [{ filters: [{ dimension: 'query', operator: 'includingRegex', expression: `^(${todas.map(escapa).join('|')})$` }] }]
const [refRows, semRows, pagRows] = await Promise.all([
  puxar({ ...REF, dimensions: ['query', 'page'], dimensionFilterGroups: filtroConsultas }),
  puxar({ startDate: inicio, endDate: fim, dimensions: ['date', 'query', 'page'], dimensionFilterGroups: filtroConsultas }),
  puxar({
    startDate: inicio, endDate: fim, dimensions: ['date', 'page'],
    dimensionFilterGroups: [{ filters: [{ dimension: 'page', operator: 'includingRegex', expression: `(${PAGINAS.map(escapa).join('|')})$` }] }],
  }),
])

/** linhas [query, page, clicks, impressions, position] → métricas do grupo */
function medir(grupo, linhas, nSemanas) {
  const { dono, consultas } = PAINEL[grupo]
  const pesoTotal = Object.values(consultas).reduce((a, b) => a + b, 0)
  const porConsulta = {}
  let donoImpr = 0, donoCliques = 0, rivalImpr = 0
  const rivais = {}
  for (const [q, pagina, clicks, impr, pos] of linhas) {
    if (!(q in consultas)) continue
    if (pagina === dono) {
      donoImpr += impr; donoCliques += clicks
      const c = (porConsulta[q] ||= { impr: 0, posImpr: 0 })
      c.impr += impr; c.posImpr += pos * impr
    } else {
      rivalImpr += impr
      rivais[pagina] = (rivais[pagina] || 0) + impr
    }
  }
  let pesoPresente = 0, posPonderada = 0
  for (const [q, c] of Object.entries(porConsulta)) {
    const w = consultas[q]
    pesoPresente += w
    posPonderada += w * (c.posImpr / c.impr)
  }
  const rival = Object.entries(rivais).sort((a, b) => b[1] - a[1])[0] || null
  return {
    donoImpr: donoImpr / nSemanas,
    donoCliques: donoCliques / nSemanas,
    cobertura: pesoPresente / pesoTotal,
    posicao: pesoPresente ? posPonderada / pesoPresente : null,
    rivalImpr: rivalImpr / nSemanas,
    rivalTopo: rival ? { pagina: rival[0], impr: rival[1] / nSemanas } : null,
  }
}

const linhaRef = refRows.map((r) => [r.keys[0], caminho(r.keys[1]), r.clicks, r.impressions, r.position])
const semanaDe = (d) => JANELAS.find((w) => d >= w.startDate && d <= w.endDate)
const linhasPorJanela = new Map(JANELAS.map((w) => [w.rotulo, []]))
for (const r of semRows) {
  const w = semanaDe(r.keys[0])
  if (w) linhasPorJanela.get(w.rotulo).push([r.keys[1], caminho(r.keys[2]), r.clicks, r.impressions, r.position])
}
const paginasPorJanela = new Map(JANELAS.map((w) => [w.rotulo, Object.fromEntries(PAGINAS.map((p) => [p, { cliques: 0, impr: 0 }]))]))
for (const r of pagRows) {
  const w = semanaDe(r.keys[0])
  const p = caminho(r.keys[1])
  if (w && paginasPorJanela.get(w.rotulo)[p]) {
    paginasPorJanela.get(w.rotulo)[p].cliques += r.clicks
    paginasPorJanela.get(w.rotulo)[p].impr += r.impressions
  }
}

const resultado = {}
for (const g of Object.keys(PAINEL)) {
  resultado[g] = {
    referencia: medir(g, linhaRef, REF_SEMANAS),
    semanas: JANELAS.map((w) => ({ ...w, ...medir(g, linhasPorJanela.get(w.rotulo), 1) })),
  }
}
const paginas = JANELAS.map((w) => ({ ...w, ...paginasPorJanela.get(w.rotulo) }))

// ——— veredito (só com --desde e as 4 semanas depois fechadas) ———
function media(xs) { const v = xs.filter((x) => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null }
let veredito = null
if (DESDE) {
  const base = (g) => resultado[g].semanas.filter((s) => s.rotulo.startsWith('base'))
  const pos = (g) => resultado[g].semanas.filter((s) => s.rotulo.startsWith('S'))
  const lidas = pos('DIV').filter((s) => /^S[34]/.test(s.rotulo))
  if (lidas.length < 2) {
    veredito = { status: 'aguardando', motivo: `${pos('DIV').length} de 4 semanas fechadas depois do deploy; o veredito lê a média de S3 e S4.` }
  } else {
    const div = { posicao: media(lidas.map((s) => s.posicao)), cobertura: media(lidas.map((s) => s.cobertura)), cliques: media(lidas.map((s) => s.donoCliques)) }
    const simBase = media(base('SIM').map((s) => s.posicao))
    const simDepois = media(pos('SIM').filter((s) => /^S[34]/.test(s.rotulo)).map((s) => s.posicao))
    const simPiorou = simBase != null && simDepois != null && simDepois - simBase > CRITERIO.simPiora
    const venceu = (div.posicao != null && div.posicao <= CRITERIO.divPosicao && div.cobertura >= CRITERIO.divCobertura) || div.cliques >= CRITERIO.divCliques
    veredito = {
      status: simPiorou ? 'reverter-title' : venceu ? 'sucesso' : 'sem-efeito',
      div, simBase, simDepois,
      motivo: simPiorou
        ? `SIM piorou ${(simDepois - simBase).toFixed(1)} posições: volte o title/H1 da acoes, mantenha as âncoras.`
        : venceu
          ? 'Dono único se sustentou. Próximo passo: repetir a leitura em S8 antes de mexer em mais nada do cluster.'
          : 'Âncoras + title não bastaram. Não reverter a DY (o critério dela já tinha falhado); investigar outra hipótese.',
    }
  }
}

// ——— rastreio: sem ele não dá pra saber se S1 já mede a mudança ———
let rastreio = null
if (flag('rastreio')) {
  const origem = 'https://www.redentia.com.br'
  const alvos = ['/calculadora/acoes', '/calculadora/dividend-yield', '/guias/calculadora-de-dividendos', '/asset/PETR4', '/asset/ITUB4', '/asset/HGLG11', '/dividendos/PETR4', '/dividendos/HGLG11']
  rastreio = []
  for (const p of alvos) rastreio.push({ pagina: p, ...(await inspecionar(origem + p)) })
}

if (flag('json')) {
  console.log(JSON.stringify({ site, referencia: REF, desde: DESDE || null, criterio: CRITERIO, resultado, paginas, veredito, rastreio }, null, 1))
  process.exit(0)
}

// ——— saída legível ———
const n0 = (x) => (x == null ? '—' : Math.round(x).toLocaleString('pt-BR'))
const n1 = (x) => (x == null ? '—' : x.toFixed(1).replace('.', ','))
const pct = (x) => (x == null ? '—' : `${Math.round(x * 100)}%`)
const NOMES = { DIV: 'calculadora/simulador de dividendos', SIM: 'simulador/calculadora de ações', DY: 'calculadora de dividend yield (monitor)' }

console.log(`\nPAINEL FIXO · consulta × página · referência ${REF.startDate}..${REF.endDate} em média semanal`)
if (DESDE) console.log(`deploy em ${DESDE} (a semana do deploy fica de fora)`)
for (const g of Object.keys(PAINEL)) {
  const { dono, consultas } = PAINEL[g]
  console.log(`\n${g} · ${NOMES[g]} · dono ${dono} · ${Object.keys(consultas).length} consultas`)
  console.log(`  ${'semana'.padEnd(12)} ${'impr dono'.padStart(9)} ${'cliq'.padStart(5)} ${'cobert.'.padStart(8)} ${'pos fixa'.padStart(9)} ${'impr rivais'.padStart(12)}  rival principal`)
  const linha = (rot, m) => console.log(`  ${rot.padEnd(12)} ${n0(m.donoImpr).padStart(9)} ${n1(m.donoCliques).padStart(5)} ${pct(m.cobertura).padStart(8)} ${n1(m.posicao).padStart(9)} ${n0(m.rivalImpr).padStart(12)}  ${m.rivalTopo ? `${m.rivalTopo.pagina} (${n0(m.rivalTopo.impr)})` : ''}`)
  linha('referência', resultado[g].referencia)
  for (const s of resultado[g].semanas) linha(s.rotulo, s)
}

console.log(`\nPÁGINA INTEIRA (inclui consultas anônimas; sem posição de propósito) · cliques / impressões`)
console.log(`  ${'semana'.padEnd(12)} ${PAGINAS.map((p) => p.replace('/calculadora/', '').padStart(16)).join(' ')}`)
for (const s of paginas) console.log(`  ${s.rotulo.padEnd(12)} ${PAGINAS.map((p) => `${n0(s[p].cliques)} / ${n0(s[p].impr)}`.padStart(16)).join(' ')}`)

if (veredito) {
  console.log(`\nVEREDITO: ${veredito.status.toUpperCase()}`)
  if (veredito.div) console.log(`  DIV em S3–S4: posição ${n1(veredito.div.posicao)} (meta ≤ ${CRITERIO.divPosicao}), cobertura ${pct(veredito.div.cobertura)} (meta ≥ ${pct(CRITERIO.divCobertura)}), ${n1(veredito.div.cliques)} cliques/sem (ou ≥ ${CRITERIO.divCliques})`)
  if (veredito.div) console.log(`  SIM: base ${n1(veredito.simBase)} → S3–S4 ${n1(veredito.simDepois)} (guarda: piora > ${CRITERIO.simPiora})`)
  console.log(`  ${veredito.motivo}`)
}

if (rastreio) {
  console.log(`\nÚLTIMO RASTREIO (URL Inspection) — S1 só mede a mudança se o dono foi rastreado depois do deploy`)
  for (const r of rastreio) console.log(`  ${r.pagina.padEnd(34)} ${(r.rastreio || r.erro || '—').padEnd(22)} ${r.estado || ''}`)
}
console.log('')
