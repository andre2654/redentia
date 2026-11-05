#!/usr/bin/env node
/**
 * Paridade de SEO e densidade da /business contra o HTML da página salvo por
 * curl em 04/11/2026, antes da troca do topo e do rodapé. Nasceu para as
 * direções do dev (?biz=, que saíram do código; estão no commit 9a1dd15d) e
 * ficou para conferir a página de verdade. Cópia adaptada de seo-paridade-ativo.mjs, com as regras do
 * pedido do dono para a /business:
 *
 *  1. <title>, meta description, canonical, robots e JSON-LD iguais;
 *  2. um H1 só. Desde 05/11/2026 o H1 é o título do print do dono (HERO.titulo
 *     em content/business/landing.ts; ele sabe da troca): o H1 da página salva
 *     ou esse, e qualquer outro é falha;
 *  3. nenhum link interno DO CORPO some (o <main>). Desde 04/11/2026 a /business
 *     usa o topo e o rodapé novos do site, na variante business: os links
 *     deles mudaram de propósito, então saem da regra e a saída lista quais
 *     entraram e quais saíram, para o dono ver;
 *  4. o FAQ inteiro continua no HTML do servidor (as 30 perguntas e respostas);
 *  5. a densidade: as palavras fora do FAQ (a regra de ~650 da página, ver o
 *     topo de pages/business/index.vue). Conta o <main> sem a seção #faq, no
 *     HTML do servidor (sem JS), que é o que o Google recebe. Acima do teto
 *     sai um aviso, não uma falha: a página de hoje é a referência.
 *
 * Diferente do /asset, o texto PODE cair: a página é enxuta de propósito.
 * Uma carga só: o dev fala com a API de produção.
 *
 *   node scripts/seo-paridade-business.mjs --antiga <arquivo.html>
 *        [--base http://localhost:3471] [--teto 650]
 *
 * O `--biz` (as três variações do dev, ?biz=1|2|3) saiu em 05/11/2026, quando
 * o dono escolheu a 1 e ela virou a página.
 *
 * `--antiga` é obrigatório: o HTML salvo por curl da página de antes. O
 * arquivo é LOCAL e NÃO é versionado: o de 04/11/2026 ficou em
 * .prints-business/antiga.html na worktree de quem rodou (ignorado pelo
 * .git/info/exclude). O `ultrahtml` vem transitivo do Nuxt, não do package.json.
 * Sai com código 1 se alguma regra falhar, 2 se faltar o `--antiga`.
 */
import { readFile } from 'node:fs/promises'
import { parse, walkSync, ELEMENT_NODE, TEXT_NODE } from 'ultrahtml'
import { extrair, comparar } from './seo-paridade-ativo.mjs'

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
)
const BASE = args.base ?? 'http://localhost:3471'
const ANTIGA = args.antiga
const TETO = Number(args.teto ?? 650)

const SEM_TEXTO = new Set(['script', 'style', 'noscript', 'template', 'head'])
const palavras = (s) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length
function texto(n) {
  let out = ''
  const rec = (x) => {
    if (x.type === ELEMENT_NODE && SEM_TEXTO.has(x.name)) return
    // só nó de texto: o SSR do dev mantém os comentários do template
    if (x.type === TEXT_NODE) out += ` ${x.value} `
    for (const c of x.children ?? []) rec(c)
  }
  rec(n)
  return out.replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim()
}

/** os links internos (href que começa com /) dentro e fora do <main> */
function linksPorLugar(html) {
  const doc = parse(html)
  const corpo = new Set()
  const fora = new Set()
  const rec = (n, dentro) => {
    if (n.type !== ELEMENT_NODE && n.type !== 0) return
    const aqui = dentro || (n.type === ELEMENT_NODE && n.name === 'main')
    const h = n.attributes?.href
    if (n.type === ELEMENT_NODE && n.name === 'a' && typeof h === 'string' && h.startsWith('/') && !h.startsWith('//')) (aqui ? corpo : fora).add(h.replace(/&amp;/g, '&'))
    for (const c of n.children ?? []) rec(c, aqui)
  }
  rec(doc, false)
  return { corpo, fora }
}

/** palavras do <main>, do FAQ (#faq) e a lista de perguntas do FAQ no HTML */
function densidade(html) {
  const doc = parse(html)
  let main = null
  let faq = null
  walkSync(doc, (n) => {
    if (n.type !== ELEMENT_NODE) return
    if (n.name === 'main' && !main) main = n
    if (n.attributes?.id === 'faq' && !faq) faq = n
  })
  const total = main ? palavras(texto(main)) : 0
  const noFaq = faq ? palavras(texto(faq)) : 0
  return { total, noFaq, fora: total - noFaq, faqTexto: faq ? texto(faq) : '' }
}

const dorme = (ms) => new Promise((ok) => setTimeout(ok, ms))
async function buscar(url) {
  for (let i = 0; i < 3; i++) {
    const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 seo-paridade-business (dev)' } })
    if (res.status === 426) { await dorme(1500); continue }
    if (!res.ok) throw new Error(`${url} → ${res.status}`)
    return res.text()
  }
  throw new Error(`${url} → 426 três vezes`)
}

async function main() {
  if (!ANTIGA) {
    console.error('Falta --antiga <arquivo.html>: o HTML local (não versionado) da /business de antes.')
    process.exit(2)
  }
  const { RB_FAQ } = await import('../app/content/business/faq.ts').catch(() => ({ RB_FAQ: null }))
  const { HERO } = await import('../app/content/business/landing.ts').catch(() => ({ HERO: null }))
  const H1_NOVO = HERO ? HERO.titulo.join(' ') : null
  const antigaHtml = await readFile(ANTIGA, 'utf8')
  const antes = extrair(antigaHtml)
  const dAntes = densidade(antigaHtml)
  console.log(`antes (salva) · ${dAntes.fora} palavras fora do FAQ (main ${dAntes.total}, FAQ ${dAntes.noFaq}) · H1 "${antes.h1.join(' | ')}" · ${antes.jsonld.length} JSON-LD · ${antes.links.size} links internos`)
  const html = await buscar(`${BASE}/business`)
  const depois = extrair(html)
  const d = densidade(html)
  const c = comparar(antes, depois)
  // a regra do /asset sobre queda de texto não vale aqui (topo do script)
  const falhas = c.falhas.filter((f) => !f.startsWith('texto caiu') && !f.startsWith('títulos que deixaram') && !f.startsWith('links internos que sumiram'))
  // o H1 do print (regra 2): a troca combinada sai da lista de falhas e vira aviso
  const h1Combinado = depois.h1.length === 1 && H1_NOVO && depois.h1[0] === H1_NOVO && depois.h1[0] !== antes.h1[0]
  if (h1Combinado) falhas.splice(falhas.findIndex((f) => f.startsWith('H1 mudou')), 1)
  const la = linksPorLugar(antigaHtml)
  const ld = linksPorLugar(html)
  const sumiuDoCorpo = [...la.corpo].filter((l) => !ld.corpo.has(l) && !ld.fora.has(l))
  if (sumiuDoCorpo.length) falhas.push(`links do corpo que sumiram: ${sumiuDoCorpo.join(', ')}`)
  const topoSaiu = [...la.fora].filter((l) => !ld.fora.has(l))
  const topoEntrou = [...ld.fora].filter((l) => !la.fora.has(l))
  if (RB_FAQ) {
    const plano = d.faqTexto.replace(/\s+/g, '')
    const faltam = RB_FAQ.flatMap((g) => g.itens).filter((it) => !plano.includes(it.q.replace(/\s+/g, '')) || !plano.includes(it.a.replace(/\s+/g, '').replace(/&/g, '')))
    if (faltam.length) falhas.push(`FAQ sem ${faltam.length} pergunta(s) no SSR: ${faltam.map((f) => f.q).join(' · ')}`)
  }
  console.log(`\n/business ${falhas.length ? 'FALHA' : 'OK'}`)
  console.log(`  ${d.fora} palavras fora do FAQ (main ${d.total}, FAQ ${d.noFaq})${d.fora > TETO ? ` · aviso: acima do teto de ${TETO}` : ''} · H1 ${depois.h1.length} "${depois.h1.join(' | ')}" · JSON-LD ${depois.jsonld.length}`)
  if (h1Combinado) console.log(`  H1 trocado como combinado: "${antes.h1[0]}" → "${depois.h1[0]}"`)
  console.log(`  topo e rodapé: saíram ${topoSaiu.length ? topoSaiu.join(', ') : 'nenhum'} · entraram ${topoEntrou.length ? topoEntrou.join(', ') : 'nenhum'}`)
  console.log(`  corpo: ${ld.corpo.size} links (${[...ld.corpo].join(', ') || 'nenhum'})`)
  for (const f of falhas) console.log(`     - ${f}`)
  console.log(`\n${falhas.length ? 'FALHOU' : 'TUDO OK'}`)
  process.exit(falhas.length ? 1 : 0)
}

main().catch((e) => { console.error(e); process.exit(2) })
