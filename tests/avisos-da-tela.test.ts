/**
 * A tela /avisos (utils/avisosDaTela.ts): os quatro cartões e os tópicos de
 * cada um, o "O mês" com dois tópicos, o WhatsApp só com o aceite, o que
 * mudou para salvar e o link assinado que vem no fragmento.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  AVISOS_DA_TELA, TOPICOS_DA_TELA, alternar, caminhoDoLink, ligado, linkDoFragmento, linkVencido, mudancas, prefsDaResposta, prefsVazias,
} from '../app/utils/avisosDaTela.ts'

const SIG = 'a'.repeat(64)
const aviso = (id: string) => AVISOS_DA_TELA.find((a) => a.id === id)!

test('os quatro avisos do quadro e os tópicos que eles gravam', () => {
  assert.deepEqual(AVISOS_DA_TELA.map((a) => a.nome), ['Bom dia', 'Provento na conta', 'A semana', 'O mês'])
  assert.deepEqual(TOPICOS_DA_TELA, ['daily_briefing', 'carteira_provento_pago', 'carteira_semana', 'carteira_proventos_mes', 'carteira_relatorio'])
})

test('o mês junta os proventos e o relatório: liga e desliga os dois', () => {
  let p = prefsDaResposta({ carteira_relatorio: { email: true } })
  assert.equal(ligado(p, aviso('mes'), 'email'), true, 'um dos dois ligado já acende o cartão')
  p = alternar(p, aviso('mes'), 'email', false, true)
  assert.deepEqual([p.carteira_proventos_mes.email, p.carteira_relatorio.email], [false, false])
  p = alternar(p, aviso('mes'), 'whatsapp', true, true)
  assert.deepEqual([p.carteira_proventos_mes.whatsapp, p.carteira_relatorio.whatsapp], [true, true])
  assert.deepEqual(mudancas(prefsDaResposta({ carteira_relatorio: { email: true } }), p), ['carteira_proventos_mes', 'carteira_relatorio'])
})

test('sem o aceite do WhatsApp o toque no WhatsApp não muda nada', () => {
  const p = prefsVazias()
  assert.equal(alternar(p, aviso('bom-dia'), 'whatsapp', true, false), p)
  assert.equal(alternar(p, aviso('bom-dia'), 'email', true, false).daily_briefing.email, true)
})

test('a resposta da API só traz os tópicos da tela, o resto falso', () => {
  const p = prefsDaResposta({ daily_briefing: { whatsapp: true }, newsletter: { email: true } } as never)
  assert.deepEqual(p.daily_briefing, { email: false, whatsapp: true })
  assert.equal('newsletter' in p, false)
  assert.deepEqual(mudancas(p, p), [])
})

test('o link vem do fragmento e vira o caminho da API sem nada a mais', () => {
  const l = linkDoFragmento(`#u=3&expires=1764000000&signature=${SIG}`)
  assert.deepEqual(l, { u: '3', expires: '1764000000', signature: SIG })
  assert.equal(caminhoDoLink(l!), `/avisos/3?expires=1764000000&signature=${SIG}`)
  assert.equal(linkVencido(l!, 1764000000 * 1000 - 1), false)
  assert.equal(linkVencido(l!, 1764000000 * 1000), true)

  for (const ruim of ['', '#u=3', `#u=3&expires=x&signature=${SIG}`, `#u=../1&expires=1&signature=${SIG}`, '#u=3&expires=1&signature=zz', `#u=3&expires=1&signature=${SIG}&x=1&u=4`]) {
    const r = linkDoFragmento(ruim)
    if (ruim.endsWith('u=4')) assert.equal(r?.u, '3', 'o primeiro u vale; o parâmetro a mais não entra no caminho')
    else assert.equal(r, null, ruim)
  }
})

test('a tela apaga o link da barra e não chama a API com a query', () => {
  const src = readFileSync(new URL('../app/composables/useAvisosDaTela.ts', import.meta.url), 'utf8')
  assert.match(src, /history\.replaceState\(/, 'o fragmento sai da barra')
  assert.match(src, /sessionStorage/, 'e fica só na aba')
  const pagina = readFileSync(new URL('../app/pages/avisos.vue', import.meta.url), 'utf8')
  assert.match(pagina, /robots: 'noindex, nofollow'/)
  assert.match(pagina, /name: 'referrer', content: 'no-referrer'/)
  const cfg = readFileSync(new URL('../nuxt.config.ts', import.meta.url), 'utf8')
  assert.match(cfg, /'\/avisos': \{ headers: \{ 'cache-control': 'private, no-store' \} \}/)
})
