/**
 * O envio da newsletter de sexta (scripts/newsletter-enviar.mjs): a edição é a
 * sexta da semana, o e-mail do --teste entra numa linha de shell na VPS, e o
 * assunto é o <title> do rascunho.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { assuntoDe, comandoRemoto, emailValido, sextaDe } from '../scripts/newsletter-enviar.mjs'

test('a edição é a sexta da semana, como no newsletter-semana.mjs', () => {
  assert.equal(sextaDe('2026-10-19'), '2026-10-23') // segunda
  assert.equal(sextaDe('2026-10-23'), '2026-10-23') // a própria sexta
  assert.equal(sextaDe('2026-10-24'), '2026-10-23') // sábado ainda é da semana
  assert.equal(sextaDe('2026-10-25'), '2026-10-23') // domingo também (a segunda é a 19)
  assert.equal(sextaDe('2026-12-28'), '2027-01-01') // virada de ano
})

test('o e-mail do --teste não leva nada que o shell interprete', () => {
  assert.ok(emailValido('dono+news@exemplo.com.br'))
  for (const ruim of ["a'b@c.com", 'a b@c.com', 'a@c', 'a@c.com;rm -rf /', '$(id)@c.com', '`id`@c.com', '']) {
    assert.equal(emailValido(ruim), false, ruim)
  }
})

test('o assunto é o <title>, com as entidades resolvidas', () => {
  assert.equal(assuntoDe('<html><head><title>Ibovespa +1,39% na semana &amp; o resto</title></head><body></body></html>'), 'Ibovespa +1,39% na semana & o resto')
  assert.equal(assuntoDe('<html><body>sem título</body></html>'), '')
})

test('o comando remoto põe o arquivo no container, manda e apaga com qualquer resultado', () => {
  const c = comandoRemoto({ edicao: '2026-10-23', modo: 'teste', para: 'dono@exemplo.com' })
  assert.equal(c, "docker exec -i -u www-data php-fpm-redentia sh -c 'cat > /tmp/newsletter-2026-10-23.html && php artisan newsletter:enviar /tmp/newsletter-2026-10-23.html --edicao=2026-10-23 --teste=dono@exemplo.com; s=$?; rm -f /tmp/newsletter-2026-10-23.html; exit $s'")
  assert.match(comandoRemoto({ edicao: '2026-10-23', modo: 'contagem' }), / --dry-run;/)
  assert.match(comandoRemoto({ edicao: '2026-10-23', modo: 'todos' }), / --confirmar;/)
})

test('o comando remoto recusa o que não validou', () => {
  assert.throws(() => comandoRemoto({ edicao: '23/10/2026', modo: 'contagem' }))
  assert.throws(() => comandoRemoto({ edicao: '2026-10-23', modo: 'teste', para: "x'@y.com" }))
  assert.throws(() => comandoRemoto({ edicao: '2026-10-23', modo: 'todos-de-novo' }))
})
