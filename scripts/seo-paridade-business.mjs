#!/usr/bin/env node
/**
 * Paridade de SEO e densidade da /business: as três direções do dev
 * (?biz=1|2|3, 04/11/2026) contra o HTML da página de hoje, salvo por curl
 * antes da troca. Cópia adaptada de seo-paridade-ativo.mjs, com as regras do
 * pedido do dono para a /business:
 *
 *  1. <title>, meta description, canonical, robots e JSON-LD iguais;
 *  2. um H1 só, com o mesmo texto;
 *  3. nenhum link interno some;
 *  4. o FAQ inteiro continua no HTML do servidor (as 30 perguntas e respostas);
 *  5. no máximo ~650 palavras fora do FAQ (a regra de densidade da página,
 *     ver o topo de pages/business/index.vue). Conta o <main> sem a seção
 *     #faq, no HTML do servidor (sem JS), que é o que o Google recebe.
 *
 * Diferente do /asset, o texto PODE cair: a página é enxuta de propósito.
 * Uma carga por direção, com pausa: o dev fala com a API de produção.
 *
 *   node scripts/seo-paridade-business.mjs [--base http://localhost:3471]
 *        [--antiga .prints-business/antiga.html] [--pausa 2500] [--teto 650]
 * Sai com código 1 se alguma regra falhar.
 */
import { readFile } from 'node:fs/promises'
import { parse, walkSync, ELEMENT_NODE, TEXT_NODE } from 'ultrahtml'
import { extrair, comparar } from './seo-paridade-ativo.mjs'

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
)
const BASE = args.base ?? 'http://localhost:3471'
const ANTIGA = args.antiga ?? '.prints-business/antiga.html'
const PAUSA = Number(args.pausa ?? 2500)
const TETO = Number(args.teto ?? 650)
const DIRECOES = ['', '?biz=1', '?biz=2', '?biz=3']

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
  const { RB_FAQ } = await import('../app/content/business/faq.ts').catch(() => ({ RB_FAQ: null }))
  const antigaHtml = await readFile(ANTIGA, 'utf8')
  const antes = extrair(antigaHtml)
  const dAntes = densidade(antigaHtml)
  console.log(`hoje (salva) · ${dAntes.fora} palavras fora do FAQ (main ${dAntes.total}, FAQ ${dAntes.noFaq}) · H1 "${antes.h1.join(' | ')}" · ${antes.jsonld.length} JSON-LD · ${antes.links.size} links internos`)
  let falhou = false
  for (const q of DIRECOES) {
    const html = await buscar(`${BASE}/business${q}`)
    await dorme(PAUSA)
    const depois = extrair(html)
    const d = densidade(html)
    const c = comparar(antes, depois)
    // a regra do /asset sobre queda de texto não vale aqui (rodapé do script)
    const falhas = c.falhas.filter((f) => !f.startsWith('texto caiu') && !f.startsWith('títulos que deixaram'))
    // a página de hoje (sem parâmetro) só entra pela paridade: o teto é das direções
    if (q && d.fora > TETO) falhas.push(`${d.fora} palavras fora do FAQ (teto ${TETO})`)
    if (RB_FAQ) {
      const plano = d.faqTexto.replace(/\s+/g, '')
      const faltam = RB_FAQ.flatMap((g) => g.itens).filter((it) => !plano.includes(it.q.replace(/\s+/g, '')) || !plano.includes(it.a.replace(/\s+/g, '').replace(/&/g, '')))
      if (faltam.length) falhas.push(`FAQ sem ${faltam.length} pergunta(s) no SSR: ${faltam.map((f) => f.q).join(' · ')}`)
    }
    if (falhas.length) falhou = true
    console.log(`\n/business${q || ' (sem parâmetro)'} ${falhas.length ? 'FALHA' : 'OK'}`)
    console.log(`  ${d.fora} palavras fora do FAQ (main ${d.total}, FAQ ${d.noFaq}) · H1 ${depois.h1.length} "${depois.h1.join(' | ')}" · JSON-LD ${depois.jsonld.length} · links ${depois.links.size} (${c.sumiram.length} sumiram, ${c.novos.length} novos${c.novos.length ? `: ${c.novos.join(', ')}` : ''})`)
    for (const f of falhas) console.log(`     - ${f}`)
  }
  console.log(`\n${falhou ? 'FALHOU' : 'TUDO OK'}`)
  process.exit(falhou ? 1 : 0)
}

main().catch((e) => { console.error(e); process.exit(2) })
