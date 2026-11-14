/**
 * O hub /guias, "A grade com busca" (03/11/2026): a camada de apresentação
 * sobre o registry. O que importa garantir é que guia novo da rotina semanal
 * aparece sozinho (tema pela tag) e que card sem guia escrito não entra nas
 * contagens.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { guiasBuscar, guiasMesAno, guiasNormalizar, montarBibliotecaGuias } from '../app/utils/guiasHub.ts'

const doc = (slug: string, tag: string, data: string, secoes: string[] = ['Uma seção']) => ({
  slug, tag, title: `Título ${slug}`, dek: 'dek', description: 'desc', summary: `resumo ${slug}`, minutes: 9, author: 'Equipe',
  datePublished: data, dateModified: data, updatedLine: '', updatedShort: '',
  sections: secoes.map((t, i) => ({ id: `s${i}`, title: t, blocks: [] })), cta: { title: '', subtitle: '', to: '/' }, faqTitle: '', faq: [], related: [],
}) as any

const DOCS = {
  'reserva-de-emergencia': doc('reserva-de-emergencia', 'Renda fixa', '2026-07-22'),
  'tesouro-direto-para-iniciantes': doc('tesouro-direto-para-iniciantes', 'Renda fixa', '2026-07-13'),
  'como-declarar-investimentos-no-ir': doc('como-declarar-investimentos-no-ir', 'Guia Aportou', '2026-07-13', ['Ações na declaração']),
  'guia-novo-da-rotina': doc('guia-novo-da-rotina', 'FIIs', '2026-11-09'),
  'open-finance': doc('open-finance', 'Guia Aportou', '2026-07-08'),
}
const META = [
  { title: 'Reserva de emergência', description: 'O colchão', tag: 'Renda fixa', minutes: 8, slug: 'reserva-de-emergencia' },
  { title: 'Tesouro Direto para iniciantes', description: 'IPCA+ e Selic', tag: 'Renda fixa', minutes: 9, slug: 'tesouro-direto-para-iniciantes' },
  { title: 'Análise PETR4', description: 'veredito', tag: 'Análise', minutes: 12, href: '/asset/PETR4' },
  { title: 'Como declarar investimentos no IR', description: 'Ações, FIIs e cripto', tag: 'Guia Aportou', minutes: 15, slug: 'como-declarar-investimentos-no-ir' },
  { title: 'Guia novo', description: 'que a rotina escreveu', tag: 'FIIs', minutes: 10, slug: 'guia-novo-da-rotina' },
] as any

test('guia novo do registry aparece sozinho, no tema da tag, e vira o mais novo', () => {
  const b = montarBibliotecaGuias(META, DOCS, DOCS['open-finance'])
  const novo = b.itens.find((g) => g.chave === 'guia-novo-da-rotina')!
  assert.equal(novo.tema, 'fiis')
  assert.equal(novo.to, '/guias/guia-novo-da-rotina')
  assert.equal(b.destaque?.chave, 'guia-novo-da-rotina')
  assert.ok(b.temas.find((t) => t.id === 'fiis')!.itens.includes(novo))
  assert.equal(b.atualizadoEm, 'nov 2026')
})

test('card sem guia escrito fica fora, e o destaque de hoje (fora da lista) entra', () => {
  const b = montarBibliotecaGuias(META, DOCS, DOCS['open-finance'])
  assert.equal(b.itens.some((g) => g.to === '/asset/PETR4'), false)
  assert.ok(b.itens.some((g) => g.chave === 'open-finance'))
  assert.equal(b.itens.length, 5)
})

test('o guia de IR mora em Imposto de renda, não em Guia Aportou', () => {
  const b = montarBibliotecaGuias(META, DOCS)
  assert.equal(b.itens.find((g) => g.chave === 'como-declarar-investimentos-no-ir')!.tema, 'impostos')
})

test('a busca ignora acento e caixa, e quem acha no título vem antes', () => {
  const b = montarBibliotecaGuias(META, DOCS)
  assert.equal(guiasNormalizar('  AÇÕES  na Declaração '), 'acoes na declaracao')
  const r = guiasBuscar(b.itens, 'acoes')
  assert.deepEqual(r.map((g) => g.chave), ['como-declarar-investimentos-no-ir'])
  const tesouro = guiasBuscar(b.itens, 'tesouro')
  assert.equal(tesouro[0]!.chave, 'tesouro-direto-para-iniciantes')
  assert.equal(guiasBuscar(b.itens, '').length, b.itens.length)
  assert.equal(guiasMesAno('2026-10-26'), 'out 2026')
  assert.equal(guiasMesAno(''), null)
})

test('a página lê o registry pela biblioteca, sem herói antigo nem faixa da newsletter', async () => {
  const { readFileSync } = await import('node:fs')
  const pagina = readFileSync(new URL('../app/pages/guias/index.vue', import.meta.url), 'utf8')
  assert.match(pagina, /montarBibliotecaGuias\(GUIDES, GUIDE_DOCS, FEATURED_GUIDE\)/)
  assert.match(pagina, /<GuiasGrade /)
  assert.doesNotMatch(pagina, /NuNewsletterBand|NuPageHero|import\.meta\.dev/)
  const grade = readFileSync(new URL('../app/components/guias/GuiasGrade.vue', import.meta.url), 'utf8')
  assert.equal((grade.match(/<h1\b/g) ?? []).length, 1)
  assert.match(grade, /v-contexto-chat/)
})
