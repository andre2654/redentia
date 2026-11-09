/**
 * O painel das teses (/teses, "A grade", 02/11/2026): as contas da convicção
 * dia a dia que os cartões desenham. Os números são os de produção da
 * convicção de "A fibra virou alvo" e "A fábrica volta pra casa".
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { diaDaTese, fraseDaMudanca, mudouEmTrintaDias, serieCompacta, ultimaMudanca } from '../app/utils/tesesPainel.ts'

test('a última mudança da convicção é a data do primeiro dia no valor atual', () => {
  const s = [
    { d: '2026-10-20', v: 90 }, { d: '2026-10-21', v: 92 }, { d: '2026-10-22', v: 92 },
    { d: '2026-11-01', v: 93 }, { d: '2026-10-31', v: 92 }, // fora de ordem de propósito
  ]
  assert.deepEqual(ultimaMudanca(s), { data: '2026-11-01', de: 92, para: 93 })
  assert.equal(fraseDaMudanca(ultimaMudanca(s)), 'Subiu de 92 em 1º nov')
  assert.equal(fraseDaMudanca({ data: '2026-10-28', de: 90, para: 88 }), 'Caiu de 90 em 28 out')
  assert.equal(ultimaMudanca([{ d: '2026-10-01', v: 80 }, { d: '2026-10-02', v: 80 }]), null)
  assert.equal(diaDaTese('2026-10-02'), '2 out')
})

test('"mudou em 30 dias" conta a partir da revalidação mais recente, não do relógio', () => {
  const recente = [{ d: '2026-09-01', v: 96 }, { d: '2026-10-29', v: 97 }, { d: '2026-11-01', v: 97 }]
  const antiga = [{ d: '2026-09-01', v: 90 }, { d: '2026-09-11', v: 89 }, { d: '2026-11-01', v: 89 }]
  assert.equal(mudouEmTrintaDias(recente), true)
  assert.equal(mudouEmTrintaDias(antiga), false) // 11/09 → 01/11: 51 dias
  assert.equal(mudouEmTrintaDias([{ d: '2026-10-01', v: 80 }, { d: '2026-11-01', v: 80 }]), false) // nunca mudou
  assert.equal(mudouEmTrintaDias(null), false)
})

test('a série compacta guarda os últimos dias e descarta ponto inválido', () => {
  const crua = Array.from({ length: 130 }, (_, i) => ({ date: `2026-${String(7 + Math.floor(i / 30)).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}T00:00:00`, conviction: 80 + (i % 3) }))
  const s = serieCompacta([...crua, { date: '2026-12-01', conviction: Number.NaN }])!
  assert.equal(s.length, 120)
  assert.equal(s[0]!.d.length, 10)
  assert.equal(serieCompacta([{ date: '2026-10-01', conviction: 80 }]), null)
})

test('/teses: a grade é a página, sem protótipo nem a promessa "com um toque" na tela', () => {
  const pagina = readFileSync(new URL('../app/pages/teses.vue', import.meta.url), 'utf8')
  assert.match(pagina, /<TesesGrade /)
  assert.doesNotMatch(pagina, /import\.meta\.dev|query\.teses|TesesCarrossel|TesesVantagens|TesesAiBanner/)
  assert.match(pagina, /usePageSeo\(\{[\s\S]*title: 'Teses de investimento'[\s\S]*dateModified: dataDate[\s\S]*breadcrumbs/)
  assert.match(pagina, /<NuFaqAccordion :items="TESES_FAQS"/) // o FAQPage sai daqui
  // o chat saiu da /busca: o "Perguntar à Redentia AI" do FAQ abre o painel
  assert.match(pagina, /class="tsf__cta" @click="painel\.abrir\(\)"/)
  assert.doesNotMatch(pagina, /to="\/busca"/)
  const grade = readFileSync(new URL('../app/components/teses/TesesGrade.vue', import.meta.url), 'utf8')
  assert.equal((grade.match(/<h1\b/g) ?? []).length, 1)
  assert.doesNotMatch(grade + pagina, /Invista na tese inteira/)
})
